#!/usr/bin/env bash

echo
echo
echo "#########################################"
echo "########## CONFIGURE FLEET ##############"
echo "#########################################"
echo

kibana_url=kibana.petclinic.lab
password=changeme
ca_cert=elk/certificates/certs/ca/root-ca.crt
fleet_server_url=https://fleet-server:8220

while [ "$(curl -sk -w "%{http_code}" -o /dev/null --header 'kbn-xsrf: true' --cacert $ca_cert -X POST -u "elastic:$password" https://$kibana_url/api/fleet/setup)" != "200" ]; do
  echo "Waiting for fleet setup.";
  sleep 15;
done

echo "Setting Fleet URL as $fleet_server_url"
curl -sk -u elastic:$password --cacert $ca_cert -XPUT https://$kibana_url/api/fleet/settings \
  --header 'kbn-xsrf: true' \
  --header 'Content-Type: application/json' \
  -d '{"fleet_server_hosts":["https://fleet-server:8220"]}' >/dev/null 2>&1

POLICYID=`curl -sk -u elastic:$password --cacert $ca_cert -XGET https://$kibana_url/api/fleet/agent_policies | jq -r '.items[] | select (.name | contains("Default Fleet Server policy")).id'` >/dev/null 2>&1
echo "Fleet Server Policy ID: $POLICYID"

FLEET_ENROLLMENT_TOKEN=`curl -sk -s -u elastic:$password --cacert $ca_cert -XGET https://$kibana_url/api/fleet/enrollment-api-keys | jq -r '.list[] | select (.policy_id |contains("'$POLICYID'")).api_key'` >/dev/null 2>&1
echo "Fleet Server Enrollment API KEY: $FLEET_ENROLLMENT_TOKEN"

FLEET_SERVICE_TOKEN=`curl -sk -u elastic:$password --cacert $ca_cert -s -XPOST https://$kibana_url/api/fleet/service-tokens --header 'kbn-xsrf: true' | jq -r .value` >/dev/null 2>&1
echo "Generated SERVICE TOKEN for fleet server: $FLEET_SERVICE_TOKEN"

echo "Setting Elasticsearch URL & Fingerprint & SSL CA"
FINGERPRINT=`openssl x509 -fingerprint -sha256 -noout -in $ca_cert | awk -F"=" {' print $2 '} | sed s/://g`
echo "Fingerprint & SSL CA: $FINGERPRINT"

sed -i '' "s|^FLEET_ENROLLMENT_TOKEN=.*|FLEET_ENROLLMENT_TOKEN=$FLEET_ENROLLMENT_TOKEN|" fleet.env
sed -i '' "s|^FLEET_SERVICE_TOKEN=.*|FLEET_SERVICE_TOKEN=$FLEET_SERVICE_TOKEN|" fleet.env

while read line; do echo "    ${line}" >> $ca_cert.tmp; done < $ca_cert
truncate -s -1 $ca_cert.tmp
CA=$(jq -R -s '.' < $ca_cert.tmp | tr -d '"' | sed 's!\\n!\\r\\n!g')
rm -rf $ca_cert.tmp

generate_post_data_fingerprint(){
        cat <<EOF
{
    "name": "default",
    "type": "elasticsearch",
    "hosts": [ "https://es01:9200" ],
    "is_default": true,
    "is_default_monitoring": true,
    "config_yaml": "",
    "ca_trusted_fingerprint": "$FINGERPRINT"
}
EOF
}

generate_post_data_ca(){
        cat <<EOF
{
  "hosts":["https://es01:9200"],
  "config_yaml":"ssl:\r\n  verification_mode: none\r\n  certificate_authorities:\r\n  - |\r\n${CA}"
}
EOF
}

curl -sk -u elastic:$password --cacert $ca_cert -XPUT https://$kibana_url/api/fleet/outputs/fleet-default-output \
      --header 'kbn-xsrf: true' \
      --header 'Content-Type: application/json' \
      -d "$(generate_post_data_ca)" >/dev/null 2>&1
