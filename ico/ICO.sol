// compiler: 0.4.19+commit.c4cbbb05.Emscripten.clang
pragma solidity ^0.4.19;

// declare functions for the token this ICO is selling
interface MineableToken {
  function balanceOf( address owner ) public constant returns (uint);
  function cap() public constant returns(uint256);
  function changeOwner( address newowner ) public;
  function mine( uint256 qty ) public;
  function transfer(address to, uint256 value) public;
}

// declare function to ensure buyers are whitelisted
interface Whitelist {
  function isMember( address who ) public constant returns (bool);
}

// declare functions to read presale holdings
interface PREICO {
  function count() public constant returns (uint);
  function holderAt( uint ix ) public constant returns (address);
  function balanceOf( address hldr ) public constant returns (uint);
}

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

//
// ICO that mines the token on demand
//
contract ICO is owned {

  Whitelist     public whitelist;
  MineableToken public tokenSC;

  bool      public saleOn;
  uint      public tokpereth;
  uint      public sold;
  uint      public salescap;

  function ICO( address _token,
                address _preico,
                address _whitelist,
                uint    _tokpereth ) public {

    require( _tokpereth > 0 );

    // throws if _whitelist is not really a whitelist
    Whitelist(_whitelist).isMember( address(this) );

    whitelist = Whitelist(_whitelist);
    tokpereth = _tokpereth;

    salescap = 500000000 * 10**5; // 500M with 5 decimal places

    tokenSC = MineableToken(_token);

    // enumerate the few PREICO holders and assign initial holdings
    PREICO pico = PREICO( _preico );
    uint holdercount = pico.count();
    address hldr;
    for( uint ii = 0; ii < holdercount; ii++ )
    {
      hldr = pico.holderAt( ii );
      fulfil( hldr, pico.balanceOf(hldr) );
    }
  }

  function newMiner( address _miner ) public onlyOwner {
    tokenSC.changeOwner(_miner);
  }

  // enable/suspend sale
  function saleIsOn( bool newval ) onlyOwner public {
    saleOn = newval;
  }

  // buyer sends ether here
  function() public payable {

    if(    !whitelist.isMember(msg.sender)
        || !saleOn )
      revert();

    // quantity = amountinwei * tokperwei
    //          = msg.value   * tokpereth / 1e18 weipereth

    uint qty = divide( multiply(msg.value, tokpereth), 1e18 );

    if (    qty > tokenSC.balanceOf(address(this))
         || qty < 1
         || (sold + qty) > salescap
         || (sold + qty) > tokenSC.cap())
      revert();

    fulfil( msg.sender, qty );
  }

  // owner can withdraw sales receipts to own account only
  function withdraw( uint amount ) public onlyOwner returns (bool) {
    require (amount <= this.balance);

    return owner.send( amount );
  }

  // DRY function
  function fulfil( address buyer, uint amt ) internal {
    tokenSC.mine( amt );
    tokenSC.transfer( buyer, amt );
    sold += amt;
  }

  // ref: github.com/OpenZeppelin/zeppelin-solidity/
  //      blob/master/contracts/math/SafeMath.sol
  function multiply(uint256 a, uint256 b) pure private returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function divide(uint256 a, uint256 b) pure private returns (uint256) {
    return a / b;
  }
}
