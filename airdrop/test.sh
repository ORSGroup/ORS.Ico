#!/bin/bash

TESTPVTA='0x0bce878dba9cce506e81da71bb00558d1684979711cf2833bab06388f715c01a'
TESTPVTB='0xff7da9b82a2bd5d76352b9c385295a430d2ea8f9f6f405a7ced42a5b0e73aad7'
TESTACCTA='0x8c34f41f1cf2dfe2c28b1ce7808031c40ce26d38'
TESTACCTB='0x147b61187f3f16583ac77060cbc4f711ae6c9349'

echo CONFIRM: are you running:
echo ""
echo ganache-cli --account="<privatekey>,balance"
echo "         " --account="<privatekey>,balance"
echo ""
read -p '[N/y]: ' ans
if [[ $ans != "y" && $ans != "Y" ]]; then
  echo ""
  echo Please run the following before this:
  echo ""
  echo -n ganache-cli ""
  echo -n --account=\"$TESTPVTA,100000000000000000000\" ""
  echo  --account=\"$TESTPVTB,100000000000000000000\"
  echo ""
  exit
fi

if [ -z $SCA ]
then
  echo No SCA detected
  exit
fi
if [ -z $TOK ]
then
  echo No token stub detected
  exit
fi

#
# Test the basic functions
#

echo ""
echo confirm setup, show variables
node cli.js 0 $SCA variables

echo ""
echo chown to self - should work
node cli.js 0 $SCA chown $TESTACCTA

echo ""
echo change ownership of smart contract from account 0 to account 1
node cli.js 0 $SCA chown $TESTACCTB

#
# Test the airdrop function
#

echo ""
echo do airdrop according to file contents
node cli.js 1 $SCA airdrop $TOK testdrop.txt

echo ""
echo retrieve events
node cli.js 1 $SCA events

