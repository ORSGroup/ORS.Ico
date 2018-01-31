#!/bin/bash

TESTPVTA='0x0bce878dba9cce506e81da71bb00558d1684979711cf2833bab06388f715c01a'
TESTPVTB='0xff7da9b82a2bd5d76352b9c385295a430d2ea8f9f6f405a7ced42a5b0e73aad7'
TESTACCTA='0x8c34f41f1cf2dfe2c28b1ce7808031c40ce26d38'
TESTACCTB='0x147b61187f3f16583ac77060cbc4f711ae6c9349'

ICO=$1
MOCK=$2

if [ -z $ICO ]
then
  echo No ICO detected
  exit
fi
if [ -z $MOCK ]
then
  echo No Mock detected
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
# Test business functions
#

echo ""
echo confirm setup, show variables
node cli.js 0 $ICO variables

echo ""
echo set sale on
node cli.js 0 $ICO saleIsOn true
node cli.js 0 $ICO variables

echo ""
echo buy tokens with 1 ETH.
node getbal.js $TESTACCTA
node cli.js 0 $ICO buy 1000000000000000000
node getbal.js $TESTACCTA

echo ""
echo turn off the sale and try to buy '(fails)'
node cli.js 0 $ICO saleIsOn false
node cli.js 0 $ICO buy 1000000000000000000

echo ""
echo set rate and check variables changed
node cli.js 0 $ICO setRate 100000000
node cli.js 0 $ICO variables

echo ""
echo changeMiner to self
node cli.js 0 $ICO changeMiner $ICO

echo ""
echo withdraw ETH from contract
node getbal.js $TESTACCTA
node cli.js 0 $ICO withdraw 1000000000000000000
node getbal.js $TESTACCTA

#
# Test common functions
#
echo ""
echo change ownership of smart contract from account 0 to account 1
node cli.js 0 $ICO chown $TESTACCTB

echo ""
echo account 1 decides to kill this contract
node cli.js 1 $ICO suicide

