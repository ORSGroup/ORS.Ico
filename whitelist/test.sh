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
  echo   '$' node cli.js '<ix>' 0 deploy
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
  echo ""
  exit
fi

#
# Test housekeeping
#
echo ""
echo get gasPrice
node cli.js 0 0 gasPrice

#
# Test business functions
#

echo ""
echo add and then remove $TESTACCTA then count should be zero
node cli.js 0 $SCA add $TESTACCTA
node cli.js 0 $SCA remove $TESTACCTA
node cli.js 0 $SCA count

echo ""
echo set'(' $TESTACCTA $TESTACCTB ')' then count should be two
node cli.js 0 $SCA 'set' $TESTACCTA $TESTACCTB
node cli.js 0 $SCA count

echo ""
echo get member at position 0, expect $TESTACCTA
node cli.js 0 $SCA at 0

echo ""
echo get member at position 1, expect $TESTACCTB
node cli.js 0 $SCA at 1

echo ""
echo remove member at position 0, count should be 1
node cli.js 0 $SCA remove 0
node cli.js 0 $SCA count

echo ""
echo now member at 0 should be $TESTACCTB
node cli.js 0 $SCA at 0

#
# Test common functions
#
echo ""
echo contract belongs to ..., expect $TESTACCTA
node cli.js 0 $SCA owner

echo ""
echo change ownership of smart contract from account 0 to account 1
node cli.js 0 $SCA chown $TESTACCTB

echo ""
echo account 1 decides to kill this contract
node cli.js 1 $SCA suicide

