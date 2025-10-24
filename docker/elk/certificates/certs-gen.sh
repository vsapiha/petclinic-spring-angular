#!/usr/bin/env bash

set -e

TARGET_DIR="./certs"
DOMAIN="petclinic.lab"

CA_CERT="$TARGET_DIR/ca/root-ca.crt"
CA_KEY="$TARGET_DIR/ca/root-ca.key"

ES01_KEY="$TARGET_DIR/es01/es01.key"
ES01_CSR="$TARGET_DIR/es01/es01.csr"
ES01_CERT="$TARGET_DIR/es01/es01.crt"

KIBANA_KEY="$TARGET_DIR/kibana/kibana.key"
KIBANA_CSR="$TARGET_DIR/kibana/kibana.csr"
KIBANA_CERT="$TARGET_DIR/kibana/kibana.crt"

APM_SERVER_KEY="$TARGET_DIR/apm-server/apm-server.key"
APM_SERVER_CSR="$TARGET_DIR/apm-server/apm-server.csr"
APM_SERVER_CERT="$TARGET_DIR/apm-server/apm-server.crt"

FLEET_SERVER_KEY="$TARGET_DIR/fleet-server/fleet-server.key"
FLEET_SERVER_CSR="$TARGET_DIR/fleet-server/fleet-server.csr"
FLEET_SERVER_CERT="$TARGET_DIR/fleet-server/fleet-server.crt"

NGINX_KEY="$TARGET_DIR/nginx/nginx.key"
NGINX_CSR="$TARGET_DIR/nginx/nginx.csr"
NGINX_CERT="$TARGET_DIR/nginx/nginx.crt"

function generate_root() {
  echo "*** Generate 'petclinic.lab' CA private key (ec) and certificate..."
  # openssl req -new -x509 -keyout $CA_KEY -out $CA_CERT -days 365 -passout pass: -config <(cat ca.cnf)
  openssl ecparam -genkey -name secp384r1 -out $CA_KEY
  openssl req -new -x509 -sha384 -key $CA_KEY -out $CA_CERT -nodes -days 365 -passout pass: -config <(cat ca.cnf)
}

function generate_certificate() {
    local root_key=$1
    local root_cert=$2
    local key=$3
    local csr=$4
    local cert=$5
    local config=$6
    local description=$7

    echo $description

    openssl genrsa -out $key -passout pass: 2048
    openssl req -new -key $key -out $csr -passin pass: -config <(cat $config)
    openssl x509 -req -in $csr -CA $root_cert -CAkey $root_key -CAcreateserial -out $cert -days 365 -passin pass: -extensions 'req_ext' -extfile <(cat $config)
}

function clean() {
    rm -f *.jks *.key *.crt *.csr *.srl *.p12 ssl.creds

    find "$TARGET_DIR" -type f \( -name "*.crt" -o -name "*.key" -o -name "*.csr" -o -name "*.srl" \) -exec rm -f {} +
    find "$TARGET_DIR" -type d -empty -delete

    mkdir -p $TARGET_DIR/{ca,es01,kibana,nginx,apm-server,fleet-server}
}

function test() {

    openssl ecparam -list_curves

    echo "*** Create K8S VM SSH ...($DOMAIN)"
    # ssh-keygen -t rsa -b 2048 -C "ssh keys for k8s.petclinic.lab" -f "id_rsa2048_k8s" -q -N ""

    #
    # DEBUG
    #
    # Verify APM certificate chain
    echo "***** Verify APM chain and show subject+issuer information..."
    openssl x509 -in $APM_CERT -noout -subject -issuer
    openssl verify -CAfile $CA_CERT $APM_CERT

    #
    # DEBUG
    #
    # Extract the public key from the private key and form the certificate for further comparison
    openssl pkey -in $CA_KEY -pubout -passin pass: -out ./certs/key_pub_1.pem
    openssl x509 -in $CA_CERT -pubkey -noout -passin pass: -out ./certs/key_pub_2.pem

    # Compare the two public keys
    if cmp -s ./certs/key_pub_1.pem ./certs/key_pub_2.pem; then
        echo "The certificate matches the private key."
    else
        echo "The certificate does not match the private key."
    fi
    rm ./certs/key_pub_1.pem ./certs/key_pub_2.pem
}

case "$1" in
    all)
        echo "Running all commands..."
        echo "Generating K8S certificates..."
        clean
        generate_root
        generate_certificate $CA_KEY $CA_CERT $ES01_KEY $ES01_CSR $ES01_CERT elk_es01.cnf "Create ES01 PK, CSR and sign it...($DOMAIN)"
        generate_certificate $CA_KEY $CA_CERT $KIBANA_KEY $KIBANA_CSR $KIBANA_CERT elk_kibana.cnf "Create KIBANA PK, CSR and sign it...($DOMAIN)"
        generate_certificate $CA_KEY $CA_CERT $NGINX_KEY $NGINX_CSR $NGINX_CERT elk_nginx.cnf "Create NGINX PK, CSR and sign it...($DOMAIN)"
        generate_certificate $CA_KEY $CA_CERT $APM_SERVER_KEY $APM_SERVER_CSR $APM_SERVER_CERT elk_apm_server.cnf "Create APM SERVER PK, CSR and sign it...($DOMAIN)"
        generate_certificate $CA_KEY $CA_CERT $FLEET_SERVER_KEY $FLEET_SERVER_CSR $FLEET_SERVER_CERT elk_fleet_server.cnf "Create FLEET SERVER PK, CSR and sign it...($DOMAIN)"
        ;;
    clean)
        echo "Running lean commands..."
        clean
        ;;
    elk)
        echo "Generating ELK certificates..."
        generate_certificate $CA_KEY $CA_CERT $ES01_KEY $ES01_CSR $ES01_CERT elk_es01.cnf "Create ES01 PK, CSR and sign it...($DOMAIN)"
        generate_certificate $CA_KEY $CA_CERT $KIBANA_KEY $KIBANA_CSR $KIBANA_CERT elk_kibana.cnf "Create KIBANA PK, CSR and sign it...($DOMAIN)"
        generate_certificate $CA_KEY $CA_CERT $NGINX_KEY $NGINX_CSR $NGINX_CERT elk_nginx.cnf "Create NGINX PK, CSR and sign it...($DOMAIN)"
        generate_certificate $CA_KEY $CA_CERT $APM_SERVER_KEY $APM_SERVER_CSR $APM_SERVER_CERT elk_apm_server.cnf "Create APM SERVER PK, CSR and sign it...($DOMAIN)"
        generate_certificate $CA_KEY $CA_CERT $FLEET_SERVER_KEY $FLEET_SERVER_CSR $FLEET_SERVER_CERT elk_fleet_server.cnf "Create FLEET SERVER PK, CSR and sign it...($DOMAIN)"
        ;;
    test)
        echo "Running domain commands..."
        test
        ;;
    *)
        echo "Usage: $0 {all|clean|domain}"
        echo "List of domains: apm-server, fleet-server, es01, kibana, nginx"
        exit 1
        ;;
esac
