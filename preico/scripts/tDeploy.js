const LIB = require( './ICOLIB.js' );
const web3 = LIB.getWeb3();

var cb;
web3.eth.getAccounts().then( (res) => {
  cb = res[0];

  let ico = new web3.eth.Contract( LIB.getABI() );

  con.deploy({data:getBinary(), arguments: [] } )
     .send({from: eb, gas: 500000}, (err, txhash) => {
       if (txhash) console.log( "send txhash: ", txhash );
     } )
     .on('error', (err) => { console.log("err: ", err); })
     .on('transactionHash', (h) => { console.log( "hash: ", h ); } )
     .on('receipt', (r) => { console.log( 'rcpt: ' + r.contractAddress); } )
     .on('confirmation', (cn, rcpt) => { console.log( 'cn: ', cn ); } )
     .then( (nin) => { console.log( "PREICO SCA: ", nin.options.address ); } );

} );

