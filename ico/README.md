# ORS ICO

Smart contract that mines ORS token. This mines up to pre-specified cap and on
an as-required basis to fulfil sales to addresses. Normal operation:

* buyer sends ETH to this ICO contract's **payable** function with extra gas
* this calls Whitelist to ensure the buyer is there
* this calculates the number of tokens based on the amount of value sent
* this confirms it will not exceed a maximum number ("cap")
* this calls token.mine( amount ) function
* this calls token.transfer( buyer, amount ) function

## PREICO

On instantiation, this ICO reads the tuples from a PREICO contract identifying
a set of presale investors and the initial holdings of each.

## Whitelist

On instantiation, this ICO receives an address for the Whitelist contract
and tests it to see if the isMember() function call works.

## ICO Parameters

**cap**: "500,000,000" hardcoded max number of tokens this ICO will mine/sell
**rate**: "approx 0.05 EUR/ORS" but specified in units of 'tokens per ETH'

## Additional Requirements

* only the owner can withdraw funds from this ICO contract
* this will be the owner of the MineableToken, and only the owner of that
token can mine
* ownership can be passed to another ICO/miner contract later

## MineableToken

The ORS token sold by the ICO is an ERC20, ERC223, and Ethereum-Token compliant
contract with an added mine() function only its owner (miner) can call.

**name**: "ORST"
**symbol**: "ORS"
**decimals**: "5"
**totalSupply**:
  **initial**: 0
  **maximum ever**: "833,333,333 * 10^decimals"

