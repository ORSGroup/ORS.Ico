#!/bin/bash

TESTPVTA='0x0bce878dba9cce506e81da71bb00558d1684979711cf2833bab06388f715c01a'
TESTPVTB='0xff7da9b82a2bd5d76352b9c385295a430d2ea8f9f6f405a7ced42a5b0e73aad7'
TESTACCTA='0x8c34f41f1cf2dfe2c28b1ce7808031c40ce26d38'
TESTACCTB='0x147b61187f3f16583ac77060cbc4f711ae6c9349'

SCA=$1

if [ -z $SCA ]
then
  echo No SCA detected
#  exit
fi

echo CONFIRM: are you running:
echo ""
echo testrpc --account="<privatekey>,balance" --account="<privatekey>,balance"
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

echo ""
echo simulate a sale of 1M tokens '( x 10**decimals )'
echo mine
node cli.js 0 $SCA mine 100000000000

echo transfer
node cli.js 0 $SCA fulfillOrder $TESTACCTB 100000000000
echo balance should be 100000000000

echo ""
echo now B tries to transfer before ICO ends '( fails )'
node cli.js 1 $SCA transfer $TESTACCTA 100000000000

