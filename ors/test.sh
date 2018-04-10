#!/bin/bash

TESTPVTA='0x0bce878dba9cce506e81da71bb00558d1684979711cf2833bab06388f715c01a'
TESTPVTB='0xff7da9b82a2bd5d76352b9c385295a430d2ea8f9f6f405a7ced42a5b0e73aad7'
TESTACCTA='0x8c34f41f1cf2dfe2c28b1ce7808031c40ce26d38'
TESTACCTB='0x147b61187f3f16583ac77060cbc4f711ae6c9349'

if [ -z $SCA ]
then
  echo No SCA detected
  exit
fi

if [ -z $STUB ]
then
  echo No STUB detected
  exit
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
  echo -n ganache-cli ""
  echo -n --account=\"$TESTPVTA,100000000000000000000\" ""
  echo  --account=\"$TESTPVTB,100000000000000000000\"
  exit
fi

echo ""
echo show basic parameters
node cli.js 0 $SCA variables

echo ""
echo simulate a sale of 1M tokens '( x 10**decimals )'
echo mine
node cli.js 0 $SCA mine 100000000000
echo transfer
node cli.js 0 $SCA transfer $TESTACCTB 100000000000
echo balance should be 100000000000
node cli.js 0 $SCA balanceOf $TESTACCTB
echo event should show up
node cli.js 0 $SCA events

echo ""
echo now B approves A to transfer it back
node cli.js 1 $SCA approve $TESTACCTA 100000000000
echo check allowance
node cli.js 0 $SCA allowance $TESTACCTB $TESTACCTA
echo transferFrom
node cli.js 0 $SCA transferFrom $TESTACCTB $TESTACCTA 100000000000
echo transferFrom even one more than allowed '(throws)'
node cli.js 0 $SCA transferFrom $TESTACCTB $TESTACCTA 1
node cli.js 0 $SCA balanceOf $TESTACCTA
echo after pull the remaining allowance should be zero
node cli.js 0 $SCA allowance $TESTACCTB $TESTACCTA

echo ""
echo A decides to burn half the tokens
node cli.js 0 $SCA burn 50000000000

echo ""
echo Tries to burn one too many tokens '(throws)'
node cli.js 0 $SCA burn 50000000001

echo ""
echo A approves B to get a few tokens
node cli.js 0 $SCA approve $TESTACCTB 10000000000

echo ""
echo But B burns them instead
node cli.js 1 $SCA burnFrom $TESTACCTA 10000000000
echo B should have a zero allowance now
node cli.js 1 $SCA allowance $TESTACCTA $TESTACCTB

echo ""
echo approveAndCall poke smart contract - stub simply posts an event
node cli.js 0 $SCA approveAndCall $STUB 50000000000 contextdata

echo ""
echo transfer to contract - simply posts event
node cli.js 0 $SCA transfer $STUB 10000000000 somedata
echo attempt to call a contract but address is not a contract '(throws)'
node cli.js 0 $SCA transfer $TESTACCTB 1 otherdata

echo ""
echo transfer to custom fallback - simply posts event
node cli.js 0 $SCA transfer $STUB 10000000000 somedata customFallback
node stubEvents.js $STUB

echo "================================"
echo mine right up to supply cap
node cli.js 0 $SCA mine 83233333300000

echo ""
echo try to mine one beyond '(throws)'
node cli.js 0 $SCA mine 83323333300000

echo ""
echo now variables should show new totalSupply
node cli.js 0 $SCA variables

echo ""
echo change ownership of smart contract from account 0 to account 1
node cli.js 0 $SCA chown $TESTACCTB

echo ""
echo try again - throws because caller is not the owner
node cli.js 0 $SCA chown $TESTACCTB

