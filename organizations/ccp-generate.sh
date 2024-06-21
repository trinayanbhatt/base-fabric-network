#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=Manufacturer
P0PORT=7051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/manufacturer.org.com/tlsca/tlsca.manufacturer.org.com-cert.pem
CAPEM=organizations/peerOrganizations/manufacturer.org.com/ca/ca.manufacturer.org.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/manufacturer.org.com/connection-manufacturer.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/manufacturer.org.com/connection-manufacturer.yaml

ORG=Dealer
P0PORT=9051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/dealer.org.com/tlsca/tlsca.dealer.org.com-cert.pem
CAPEM=organizations/peerOrganizations/dealer.org.com/ca/ca.dealer.org.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/dealer.org.com/connection-dealer.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/dealer.org.com/connection-dealer.yaml

ORG=Wholesaler
P0PORT=11051
CAPORT=10054
PEERPEM=organizations/peerOrganizations/wholesaler.org.com/tlsca/tlsca.wholesaler.org.com-cert.pem
CAPEM=organizations/peerOrganizations/wholesaler.org.com/ca/ca.wholesaler.org.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/wholesaler.org.com/connection-wholesaler.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/wholesaler.org.com/connection-wholesaler.yaml
