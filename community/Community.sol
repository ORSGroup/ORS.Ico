// compiler: 0.4.20+commit.3155dd80.Emscripten.clang
pragma solidity ^0.4.20;

contract owned {
  address public owner;

  function owned() public {
    owner = msg.sender;
  }

  function changeOwner( address newowner ) public onlyOwner {
    owner = newowner;
  }

  modifier onlyOwner {
    if (msg.sender != owner) { revert(); }
    _;
  }
}

// a community is a grouping of addresses. communities may be organized by
// locale, social media platform or any desired scheme. Each community has
// a unique id (string), a manager (address) who presumably takes a leadership
// leadership role, a community-specific bonus and members

contract Community is owned {

  string  public name_; // "IT", "KO", ...
  address public manager_;
  uint    public bonus_;

  mapping( address => bool ) public members_;

  function Community() public {}

  function setName( string _name ) public onlyOwner {
    name_ = _name;
  }

  function setManager( address _mgr ) public onlyOwner {
    manager_ = _mgr;
  }

  function setBonus( uint _bonus ) public onlyOwner {
    bonus_ = _bonus;
  }

  function isMember( address _mbr ) public view returns(bool) {
    return members_[_mbr];
  }

  function addMember( address _mbr ) onlyOwner public {
    members_[_mbr] = true;
  }

  function addMembers( address[] _mbrs ) onlyOwner public {
    for( uint ii = 0; ii < _mbrs.length; ii++ )
      addMember( _mbrs[ii] );
  }

  function dropMember( address _mbr ) onlyOwner public {
    members_[_mbr] = false;
  }

  function dropMembers( address[] _mbrs ) onlyOwner public {
    for( uint ii = 0; ii < _mbrs.length; ii++ )
      dropMember( _mbrs[ii] );
  }
}

