pragma solidity ^0.4.19;

contract ERC20Stub
{
  uint public quantity; // force compiler to not show warnings

  function ERC20Stub() public {}
  function transfer( address to, uint qty ) public {
    require( to != address(0x0) );
    quantity = qty; // force ignore warnings
  }
}

