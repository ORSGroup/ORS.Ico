// 0.4.21+commit.dfe3193c.Emscripten.clang
pragma solidity ^0.4.21;

// assume ERC20 or compatible token
interface ERC20 {
  function transfer( address to, uint256 value ) external;
}

contract owned {
  address public owner;

  function owned() public {
    owner = msg.sender;
  }

  function changeOwner( address _miner ) public onlyOwner {
    owner = _miner;
  }

  modifier onlyOwner {
    require (msg.sender == owner);
    _;
  }
}

//
// NOTE: this Airdropper becomes msg.sender for the token transfer and must
//       already be the holder of enough tokens
//
contract Airdropper is owned {

  // NOTE: caller be careful about array size and block gas limit.
  //       check ethstats.net
  function airdrop( address tokAddr,
                    address[] dests,
                    uint[] quantities ) public onlyOwner returns (uint) {

    for (uint ii = 0; ii < dests.length; ii++) {
      ERC20(tokAddr).transfer( dests[ii], quantities[ii] );
    }

    return ii;
  }
}

