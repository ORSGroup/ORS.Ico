#!/bin/bash

TESTPVTA='0x0bce878dba9cce506e81da71bb00558d1684979711cf2833bab06388f715c01a'
TESTPVTB='0xff7da9b82a2bd5d76352b9c385295a430d2ea8f9f6f405a7ced42a5b0e73aad7'
TESTACCTA='0x8c34f41f1cf2dfe2c28b1ce7808031c40ce26d38'
TESTACCTB='0x147b61187f3f16583ac77060cbc4f711ae6c9349'

SCA=$1

if [ -z $SCA ]
then
  echo No SCA detected
  exit
fi

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

echo ""
echo create ABC community with TESTACCTB as manager, 5% bonus
node cli.js 0 $SCA addCommunity ABC $TESTACCTA 5
node cli.js 0 $SCA variables ABC

echo ""
echo change bonus to 9 %
node cli.js 0 $SCA setBonus ABC 9
node cli.js 0 $SCA variables ABC

echo ""
echo change manager to TESTACCTB
node cli.js 0 $SCA setManager ABC $TESTACCTB
node cli.js 0 $SCA variables ABC

echo ""
echo create ABC community but already exists "( fails )"
node cli.js 0 $SCA addCommunity ABC $TESTACCTA 5

echo ""
echo add TESTACCTB as member of ABC community
node cli.js 0 $SCA addMember $TESTACCTB ABC

echo ""
echo add TESTACCTB as member of non-existent community "( fails )"
node cli.js 0 $SCA addMember $TESTACCTB DEF

echo ""
echo drop member TESTACCTB
node cli.js 0 $SCA dropMember $TESTACCTB

echo ""
echo drop member TESTACCTB again
node cli.js 0 $SCA dropMember $TESTACCTB

echo ""
echo add members to ABC from file
node cli.js 0 $SCA addMembers accts.txt ABC

echo ""
echo add members to ABC from file
node cli.js 0 $SCA dropMembers accts.txt

