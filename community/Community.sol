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

  mapping( string => uint )    bonuses_;
  mapping( string => address ) managers_;
  mapping( address => string ) public communityOf_;

  function Community() public {}

  function bonus( string cty ) public view returns(uint) {
    return bonuses_[cty];
  }

  function setBonus( string _cty, uint _bonus ) public onlyOwner {
    bonuses_[_cty] = _bonus;
  }

  function manager( string cty ) public view returns(address) {
    return managers_[cty];
  }

  function setManager( string _cty, address _mgr ) public onlyOwner {
    managers_[_cty] = _mgr;
  }

  function addCommunity( string _cty,
                         address _mgr,
                         uint _bonus ) onlyOwner public {

    require(    bytes(_cty).length > 0
             && _mgr != address(0)
             && managers_[_cty] == address(0) // doesnt already exist
           );

    bonuses_[_cty] = _bonus;
    managers_[_cty] = _mgr;
  }

  function addMember( address _mbr, string _cty ) onlyOwner public {

    bytes memory ctybytes = bytes( communityOf_[_mbr] );
    require( _mbr != address(0) && ctybytes.length == 0 );

    communityOf_[_mbr] = _cty;
  }

  function addMembers( address[] _mbrs, string _cty ) onlyOwner public {
    for( uint ii = 0; ii < _mbrs.length; ii++ )
      addMember( _mbrs[ii], _cty );
  }

  function dropMember( address _mbr ) onlyOwner public {
    communityOf_[_mbr] = '';
  }

  function dropMembers( address[] _mbrs ) onlyOwner public {
    for( uint ii = 0; ii < _mbrs.length; ii++ )
      dropMember( _mbrs[ii] );
  }

}

