#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0




# default to using Manufacturer
ORG=${1:-Manufacturer}

# Exit on first error, print all commands.
set -e
set -o pipefail

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

ORDERER_CA=${DIR}/test-network/organizations/ordererOrganizations/org.com/tlsca/tlsca.org.com-cert.pem
PEER0_ORG1_CA=${DIR}/test-network/organizations/peerOrganizations/manufacturer.org.com/tlsca/tlsca.manufacturer.org.com-cert.pem
PEER0_ORG2_CA=${DIR}/test-network/organizations/peerOrganizations/dealer.org.com/tlsca/tlsca.dealer.org.com-cert.pem
PEER0_ORG3_CA=${DIR}/test-network/organizations/peerOrganizations/wholesaler.org.com/tlsca/tlsca.wholesaler.org.com-cert.pem


if [[ ${ORG,,} == "manufacturer"]]; then

   CORE_PEER_LOCALMSPID=ManufacturerMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/manufacturer.org.com/users/Admin@manufacturer.org.com/msp
   CORE_PEER_ADDRESS=localhost:7051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/test-network/organizations/peerOrganizations/manufacturer.org.com/tlsca/tlsca.manufacturer.org.com-cert.pem

elif [[ ${ORG,,} == "dealer" ]]; then

   CORE_PEER_LOCALMSPID=DealerMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/dealer.org.com/users/Admin@dealer.org.com/msp
   CORE_PEER_ADDRESS=localhost:9051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/test-network/organizations/peerOrganizations/dealer.org.com/tlsca/tlsca.dealer.org.com-cert.pem

elif [[ ${ORG,,} == "wholesaler" ]]; then

   CORE_PEER_LOCALMSPID=WholesalerMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/wholesaler.org.com/users/Admin@wholesaler.org.com/msp
   CORE_PEER_ADDRESS=localhost:11051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/test-network/organizations/peerOrganizations/wholesaler.org.com/tlsca/tlsca.wholesaler.org.com-cert.pem

else
   echo "Unknown \"$ORG\", please choose Manufacturer or Dealer or Wholesaler"
   echo "For org to get the environment variables to set upa Org2 shell environment run:  ./setOrgEnv.sh Org2"
   echo
   echo "This can be automated to set them as well with:"
   echo
   echo 'export $(./setOrgEnv.sh Org2 | xargs)'
   exit 1
fi

# output the variables that need to be set
echo "CORE_PEER_TLS_ENABLED=true"
echo "ORDERER_CA=${ORDERER_CA}"
echo "PEER0_ORG1_CA=${PEER0_ORG1_CA}"
echo "PEER0_ORG2_CA=${PEER0_ORG2_CA}"
echo "PEER0_ORG3_CA=${PEER0_ORG3_CA}"

echo "CORE_PEER_MSPCONFIGPATH=${CORE_PEER_MSPCONFIGPATH}"
echo "CORE_PEER_ADDRESS=${CORE_PEER_ADDRESS}"
echo "CORE_PEER_TLS_ROOTCERT_FILE=${CORE_PEER_TLS_ROOTCERT_FILE}"

echo "CORE_PEER_LOCALMSPID=${CORE_PEER_LOCALMSPID}"
