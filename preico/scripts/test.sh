#!/bin/bash

TESTPVTA='0x0bce878dba9cce506e81da71bb00558d1684979711cf2833bab06388f715c01a'
TESTPVTB='0xff7da9b82a2bd5d76352b9c385295a430d2ea8f9f6f405a7ced42a5b0e73aad7'
TESTACCTA='0x8c34f41f1cf2dfe2c28b1ce7808031c40ce26d38'
TESTACCTB='0x147b61187f3f16583ac77060cbc4f711ae6c9349'

SCA=$1

if [ -z $SCA ]
then
  echo No SCA detected
  echo ""
  echo Do:
  echo   '$' node cli.js deploy
  echo   export SCA='<the SCA>'
  echo ""
  echo Then:
  echo   ./test.sh '$SCA'
  exit
fi

echo CONFIRM: are you running:
echo ""
echo testrpc --account="<privatekey>,balance"
echo "       " --account="<privatekey>,balance"
echo ""
read -p '[N/y]: ' ans
if [[ $ans != "y" && $ans != "Y" ]]; then
  echo ""
  echo Please run the following before this:
  echo ""
  echo -n testrpc ""
  echo -n --account=\"$TESTPVTA,100000000000000000000\" ""
  echo  --account=\"$TESTPVTB,100000000000000000000\"
  exit
fi

# cli.js argv map
#
# 0    1    2   3    4         5        6
#         acct
#           |  SCA command  address    amt

echo ""
echo get gasPrice
node cli.js 0  0   gasPrice

echo ""
echo get balance of account 0, expect 0
node cli.js 0 $SCA balance $TESTACCTA

echo ""
echo twice add 1000 units for account 1
node cli.js 0 $SCA add     $TESTACCTB 1000
node cli.js 0 $SCA add     $TESTACCTB 1000
node cli.js 0 $SCA balance $TESTACCTB

echo ""
echo how many holders, expect 1
node cli.js 0 $SCA count

echo ""
echo get holders, expect TESTACCTB
node cli.js 0 $SCA holderAt 0

echo ""
echo get holder after index, expect chaos
node cli.js 0 $SCA holderAt 1

echo ""
echo get balance of account 1, expect 1000
node cli.js 0 $SCA balance $TESTACCTB

echo ""
echo fetch events, expect 1 identifying account 1
node cli.js 0 $SCA events

echo ""
echo subtract 500 units from account 1
node cli.js 0 $SCA sub     $TESTACCTB 500

echo ""
echo balance of account 1 now 1500
node cli.js 0 $SCA balance $TESTACCTB

echo ""
echo total supply should be 500
node cli.js 0 $SCA supply

echo ""
echo change ownership of smart contract from account 0 to account 1
node cli.js 0 $SCA chown $TESTACCTB

echo ""
echo account 1 decides to kill this contract
node cli.js 1 $SCA suicide

