const LIB = require( './ICOLIB.js' );
const web3 = LIB.getWeb3();

var eb;
web3.eth.getAccounts().then( (res) => {
  eb = res[0];

  let enu = new web3.eth.Contract( LIB.enumABI() );

  enu.deploy({data:LIB.enumBinary(), arguments: [] } )
     .send({from: eb, gas: 500000}, (err, txhash) => {
       if (txhash) console.log( "send txhash: ", txhash );
     } )
     .on('error', (err) => { console.log("err: ", err); })
     .on('transactionHash', (h) => { console.log( "hash: ", h ); } )
     .on('receipt', (r) => { console.log( 'rcpt: ' + r.contractAddress); } )
     .on('confirmation', (cn, rcpt) => { console.log( 'cn: ', cn ); } )
     .then( (nin) => { console.log( "ENUM SCA: ", nin.options.address ); } );

} );

