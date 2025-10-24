gen:
	./certs-gen.sh all

add:
	sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ./certs/ca/root-ca.crt

root-fingerprint:
	@openssl x509 -in ./certs/ca/root-ca.crt -noout -fingerprint -sha256

find:
	sudo security find-certificate -a -m -Z -p /Library/Keychains/System.keychain
	sudo security find-certificate -e admin@petclinic.lab -m -Z -p /Library/Keychains/System.keychain

remove:
	sudo security remove-trusted-cert -d ./certs/ca/root-ca.crt
