// 0.4.20+commit.3155dd80.Emscripten.clang
pragma solidity ^0.4.20;

// assume any token address we use includes ERC20's transfer function
interface ERC20 {
  function transfer( address to, uint256 value ) external;
}

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

contract Airdropper is owned {

  event Airdropped( address indexed tokAddr,
                    address indexed receiver,
                    uint quantity );

  function airdrop( address tokAddr,
                    address[] dests,
                    uint[] quantities ) public onlyOwner returns (uint) {

    require(    tokAddr != address(0x0)
             && dests.length == quantities.length );

    for (uint ii = 0; ii < dests.length; ii++) {
      ERC20(tokAddr).transfer( dests[ii], quantities[ii] );
      Airdropped( tokAddr, dests[ii], quantities[ii] );
    }

    return ii;
  }

}

