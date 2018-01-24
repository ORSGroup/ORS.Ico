// compiler: 0.4.19+commit.c4cbbb05.Emscripten.clang
pragma solidity ^0.4.19;

contract owned {

  address public owner;

  function owned() public {
    owner = msg.sender;
  }

  function changeOwner( address newowner ) public onlyOwner {
    owner = newowner;
  }

  function closedown() public onlyOwner {
    selfdestruct(owner);
  }

  modifier onlyOwner {
    if (msg.sender != owner) { revert(); }
    _;
  }
}

contract Whitelist is owned {

  mapping( address => bool ) members_;

  function Whitelist() public {}

  function isMember( address mbr ) public constant returns (bool) {
    return members_[mbr];
  }

  function add( address mbr ) onlyOwner public {
    if (isMember(mbr))
      return;

    members_[mbr] = true;
  }

  function remove( address mbr ) onlyOwner public {
    members_[mbr] = false;
  }

  function addMembers( address[] mbrs ) onlyOwner public {
    for( uint ii = 0; ii < mbrs.length; ii++ )
      add( mbrs[ii] );
  }

}

