#!/bin/bash

# ============================================================================
#
# Script to distribute ORST tokens according to the contributions of ETH to
# the various Community smart contracts
#
# ============================================================================

# ----------------------------------------------------------------------------
# Arguments:
#
#   1 : lower limit - do not perform any operations on Receipts numbered
#                     below this limit (optional, default=0)
# ----------------------------------------------------------------------------

if [ $# -eq 0 ]
then
  echo "No lower-limit supplied"
fi

# ----------------------------------------------------------------------------
# 1. Fetch all the Receipt events from the blockchain related to the following
#    Community smart contracts. Note that Receipt is the only event emitted by
#    the smart contract
# ----------------------------------------------------------------------------

# RC1 = IT + ITP + ITP(extended)
# IT='0x7A7913bf973D74dEb87dB64136Bcb63158e4eA39'
# ITP='0x901C93F1bf70cB9a08A9716F4635c279f33ae8c7'
# ITPX='0xf0199c13f89514e2bba5465ef72f5b546b5a8579'

# RC2 = KOR + ITC + RUS + TUR + ERL + ISR
KOR='0x357a21cf65e11d20277fc3665ceb3739c9bbaa0b'
ITC='0x9193625e5e21Fc04134C94189Fb46f511518747c'
RUS='0xc3171958fb776a4e1f6fc89a638eb77c8377fa7e'
TUR='0xc969fFc723c8cF73368545dF89fC8B1ED403c7c9'
ERL='0x8571B50b30EC19a30f6c9C13c0e6ca7f4dF69823'
ISR='0x754ba75beef3f8acc05dde652a58f938626b4514'

# the following require geth to be running on this host. It may take some time
# to complete especially if running geth is running in light mode
#
# note: depends on the format of the events output from cli.js.

echo KOR
node cli.js 0 $KOR events >  receipts.txt
echo ITC
node cli.js 0 $ITC events >> receipts.txt
echo RUS
node cli.js 0 $RUS events >> receipts.txt
echo TUR
node cli.js 0 $TUR events >> receipts.txt
echo ERL
node cli.js 0 $ERL events >> receipts.txt
echo ISR
node cli.js 0 $ISR events >> receipts.txt

# ----------------------------------------------------------------------------
# 2. the event information includes the block number. Sort the receipts by
#    block and number them. Use sed to eliminate leading spaces because
#    string.split() messes up otherwise
# ----------------------------------------------------------------------------

sort -k 3,3 receipts.txt | cat -n | sed -e "s/^\s*//" > sortedreceipts.txt

# ----------------------------------------------------------------------------
# 3. Process the recipts. The script will action each one and print out the
#    reports we need at the end
# ----------------------------------------------------------------------------

#node processreceipts.js $1

