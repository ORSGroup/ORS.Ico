// compiler: 0.4.20+commit.3155dd80.Emscripten.clang
pragma solidity ^0.4.20;

// declare functions of the token this ICO is selling
interface MineableToken {
  function balanceOf( address owner ) external returns (uint);
  function cap() external returns(uint256);
  function changeOwner( address newowner ) external;
  function mine( uint256 qty ) external;
  function transfer(address to, uint256 value) external;
}

// declare functions to read presale holdings
interface PREICO {
  function count() external returns (uint);
  function holderAt( uint ix ) external returns (address);
  function balanceOf( address hldr ) external returns (uint);
}

// buyer may be in a Community in which case s/he receives a bonus
interface Community {
  function bonusFor( address who ) external returns(uint);
}

// eidoo integration
contract ICOEngineInterface {

  // false if the ico is not started, true if the ico is started and running,
  // true if the ico is completed
  function started() public view returns(bool) {
    return now >= startTime();
  }

  // false if the ico is not started, false if the ico is started and running,
  // true if the ico is completed
  function ended() public view returns(bool) {
    return started() && now > endTime();
  }

  // time stamp of the starting time of the ico, must return 0 if it depends
  // on the block number
  function startTime() public pure returns(uint) {
    return uint(1524902400); // 28-APR-2018 08:00 GMT (09:00 CET)
  }

  // time stamp of the ending time of the ico, must retrun 0 if it depends on
  // the block number
  function endTime() public pure returns(uint) {
    return uint(1527321600); // 26-MAY-2018 08:00 GMT (0900 CET)
  }

  // Optional function, can be implemented in place of startTime
  // Returns the starting block number of the ico, must return 0 if it depends
  // on the time stamp
  // function startBlock() public view returns(uint);

  // Optional function, can be implemented in place of endTime
  // Returns theending block number of the ico, must retrun 0 if it depends on
  // the time stamp
  // function endBlock() public view returns(uint);

  // returns the total number of the tokens available for the sale, must not
  // change when the ico is started
  function totalTokens() public pure returns(uint) {
    return uint(500000000 * 10**5); // selling up to 500M tokens with 5 dec
  }

  // returns the number of the tokens available for the ico. At the moment that
  // the ico starts it must be equal to totalTokens(),
  // then it will decrease. It is used to calculate the percentage of sold
  // tokens as remainingTokens() / totalTokens()
  function remainingTokens() public view returns(uint);

  // return the price as number of tokens released for each ether
  function price() public view returns(uint);
}

// eidoo Abstract base contract
contract KYCBase {

  mapping (address => bool) public isKycSigner;
  mapping (uint64 => uint256) public alreadyPayed;

  event KycVerified( address indexed signer,
                     address buyerAddress,
                     uint64 buyerId,
                     uint maxAmount );

  function KYCBase(address [] kycSigners) internal {
    for (uint i = 0; i < kycSigners.length; i++) {
      isKycSigner[kycSigners[i]] = true;
    }
  }

  // Must be implemented in descending contract to assign tokens to the
  // buyers. Called after the KYC verification is passed
  function releaseTokensTo( address buyer, address signer )
    internal returns(bool);

  // This method can be overridden to enable some sender to buy token for a
  // different address
  function senderAllowedFor(address buyer) internal view returns(bool) {
    return buyer == msg.sender;
  }

  function buyTokensFor( address buyerAddress,
                         uint64 buyerId,
                         uint maxAmount,
                         uint8 v,
                         bytes32 r,
                         bytes32 s ) public payable returns (bool)
  {
    require(senderAllowedFor(buyerAddress));
    return buyImplementation(buyerAddress, buyerId, maxAmount, v, r, s);
  }

  function buyTokens( uint64 buyerId,
                      uint maxAmount,
                      uint8 v,
                      bytes32 r,
                      bytes32 s ) public payable returns (bool)
  {
    return buyImplementation(msg.sender, buyerId, maxAmount, v, r, s);
  }

  function buyImplementation( address buyerAddress,
                              uint64 buyerId,
                              uint maxAmount,
                              uint8 v,
                              bytes32 r,
                              bytes32 s ) private returns (bool)
  {
    // check the signature
    bytes32 hash = sha256( "Eidoo icoengine authorization",
                           this,
                           buyerAddress,
                           buyerId,
                           maxAmount );

    address signer = ecrecover(hash, v, r, s);

    if (!isKycSigner[signer]) {
      revert();
    } else {
      uint256 totalPayed = alreadyPayed[buyerId] + msg.value;
      require(totalPayed <= maxAmount);
      alreadyPayed[buyerId] = totalPayed;
      KycVerified(signer, buyerAddress, buyerId, maxAmount);
      return releaseTokensTo(buyerAddress, signer);
    }
  }

  // No payable fallback function, the tokens must be buyed using the functions
  // buyTokens and buyTokensFor
  function () public { revert(); }
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
// ICO that mines ORS token on demand
//
contract ICO is ICOEngineInterface, KYCBase, owned {

  Community     public community;
  MineableToken public tokenSC;

  uint      public tokpereth;
  uint      public sold;
  uint      public salescap;

  address public eidoo_wallet_signer;

  function ICO( address[] _signers,
                address _token,
                address _preico,
                uint    _tokpereth ) public KYCBase(_signers) {

    tokenSC = MineableToken(_token);
    tokpereth = _tokpereth;

    salescap = 500000000 * 10**5; // 500M with 5 decimal places

    eidoo_wallet_signer = _signers[0];

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

  function setRate( uint newrate ) onlyOwner public {
    tokpereth = newrate;
  }

  function remainingTokens() public view returns(uint) {
    return salescap - sold;
  }

  function price() public view returns(uint) {
    return tokpereth;
  }

  function releaseTokensTo( address buyer, address signer )
    internal returns(bool) {

    // quantity = amountinwei * tokperwei
    //          = msg.value   * tokpereth / 1e18 weipereth

    uint qty = divide( multiply(msg.value, tokpereth), 1e18 );

    // if signer is eidoo wallet, apply a 5% bonus
    if (signer == eidoo_wallet_signer)
      qty = divide( multiply(qty, 105), 100 );

    // community-specific bonus
    uint cbonus = community.bonusFor( buyer );
    qty = divide( multiply(qty, 100 + cbonus), 100 );

    if (    qty > tokenSC.balanceOf(address(this))
         || qty < 1
         || (sold + qty) > salescap
         || (sold + qty) > tokenSC.cap())
      revert();

    fulfil( buyer, qty );
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
