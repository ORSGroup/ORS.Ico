// compiler: 0.4.19+commit.c4cbbb05.Emscripten.clang
pragma solidity ^0.4.19;

contract Mocks
{
  function Mocks() public {}

  // MineableToken -----------------------------------------------------------
  function balanceOf( address owner ) public pure returns (uint) {
    require( owner != address(0x0) );
    return uint(1000000 * 10**5);
  }

  function cap() public pure returns(uint256) {
    return 833333333 * 10**uint256(5);
  }

  function changeOwner( address newowner ) public pure{
    require( newowner != address(0x0) );
  }

  function mine( uint256 qty ) public pure {
    require( qty > 0 );
  }

  function transfer(address to, uint256 value) public pure{
    require( to != address(0x0) && value > 0 );
  }

  // Whitelist --------------------------------------------------------------
  function isMember( address who ) public pure returns (bool) {
    require( who != address(0x0) );
    return true;
  }

  // PREICO holders list ----------------------------------------------------
  function count() public pure returns (uint) {
    return uint(2);
  }

  function holderAt( uint ix ) public pure returns (address) {
    if (ix == 0)
      return 0x8c34F41f1cf2dfe2C28B1Ce7808031c40CE26d38;
    if (ix == 1)
      return 0x147b61187F3F16583AC77060cbc4f711AE6c9349;

    revert();
  }
}
