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

SCA1='0x7A7913bf973D74dEb87dB64136Bcb63158e4eA39'
SCA2='0x901C93F1bf70cB9a08A9716F4635c279f33ae8c7'

# the following require geth to be running on this host. It may take some time
# to complete especially if running geth is running in light mode
#
# note: depends on the format of the events output from cli.js.

node cli.js 0 $SCA1 events >  receipts.txt
node cli.js 0 $SCA2 events >> receipts.txt

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

