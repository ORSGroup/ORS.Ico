// compiler: 0.4.19+commit.c4cbbb05.Emscripten.clang
pragma solidity ^0.4.19;

interface PREICO {
  function count() public constant returns (uint);
  function holderAt( uint ix ) public constant returns (address);
}

//
// example of how a smart contract can enumerate the PREICO holders
//
contract EnumPREICO {

  event Found( address indexed hodler, uint index );

  PREICO public pico_;

  function EnumPREICO() public {}
  
  function set( address pico ) public {
    pico_ = PREICO(pico);
  }

  function getHolders() public {
    uint count = pico_.count();
    for( uint ix = 0; ix < count; ix++ )
      Found( pico_.holderAt(ix), ix );
  }
}
