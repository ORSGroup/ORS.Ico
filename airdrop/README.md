# ORS ICO Airdrop

Smart contract to distribute ORS tokens. It is cheaper on gas than doing
individual transfers by script.

## How it works

A script reads the ethereum accounts and number of tokens to drop from
a text file. It formats the data as two equal-size arrays and passes them
through web3 to the airdrop smart contract.

The airdropper then validates the array lengths match and then does the
necessary transfers in one ethereum transaction.


