#!/bin/bash
mkdir -m0700 config/private
touch config/private/key.pem
chmod 0600 config/private/key.pem

openssl genpkey -algorithm RSA -out config/private/key.pem -pkeyopt rsa_keygen_bits:4096

openssl req -key config/private/key.pem -x509 -new -days 3650 -out config/private/cacert.pem
