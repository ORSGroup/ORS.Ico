// NOTES:
//
// 1.  costs of gas determined from testing. The add may consume more gas as
//     more and more holders are added
//
// 2. script uses hardcoded gasPrice -- CHECK ethgasstation.info

const LIB = require( './ICOLIB.js' );

function checkAddr(addr) {
  try {
    let isaddr = parseInt( addr );
  } catch( e ) {
    usage();
    process.exit(1);
  }
}

const cmds =
  ['add', 'balance', 'chown', 'count', 'deploy', 'events',
   'gasPrice', 'holderAt', 'sub', 'suicide', 'supply' ];

function usage() {
  console.log(
    '$ node cli.js <acctindex> <SCA | 0>',
    '<',
     'add <addr> <amount> |',
     'balance <addr> |',
     'chown <newaddr> |',
     'count',
     'deploy |',
     'events |',
     'gasPrice |',
     'holderAt <index> |',
     'sub <addr> <amount> |',
     'suicide |',
     'supply',
    '>'
  );
}

var ebi = process.argv[2];
var sca = process.argv[3];
var cmd = process.argv[4];

let found = false;
for (let ii = 0; ii < cmds.length; ii++)
  if (cmds[ii] == cmd) found = true;

if (!found) {
  usage();
  process.exit(1);
}

const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const MYGASPRICE = '' + 6 * 1e9;

if (cmd == 'gasPrice')
{
  web3.eth.getGasPrice().then( (gp) => {
    console.log( 'network gasPrice: ', gp, ', hardcoded:', MYGASPRICE );
  } );
}
else
{
  var eb;
  web3.eth.getAccounts().then( (res) => {
    eb = res[ebi];
    console.log( 'Ξtherbase: ', eb );

    // NOTE: times out when deploying to real blockchain, this is ok
    if (cmd == 'deploy')
    {
      let con = new web3.eth.Contract( LIB.getABI() );

      con
        .deploy({data:LIB.getBinary(), arguments: [] } )
        .send({from: eb, gas: 412520, gasPrice: MYGASPRICE}, (err, txhash) => {
          if (txhash) console.log( "send txhash: ", txhash );
        } )
        .on('error', (err) => { console.log("err: ", err); })
        .on('transactionHash', (h) => { console.log( "hash: ", h ); } )
        .on('receipt', (r) => { console.log( 'rcpt: ' + r.contractAddress); } )
        .on('confirmation', (cn, rcpt) => { console.log( 'cn: ', cn ); } )
        .then( (nin) => { console.log( "SCA", nin.options.address ); } );
    }
    else
    {
      let con = new web3.eth.Contract( LIB.getABI(), sca );

      if (cmd == 'add' || cmd == 'sub') {

        let addr = process.argv[5];
        checkAddr(addr);

        let amt;
        try {
          amt = parseInt( process.argv[6] );
        } catch( e ) {
          usage();
          process.exit(1);
        }

        if (cmd == 'add')
          con.methods.add( addr, amt ).send( {from: eb, gas: 107110} );
        else // sub
          con.methods.sub( addr, amt ).send( {from: eb, gas: 34580} );
      }

      if (cmd == 'balance')
      {
        let addr = process.argv[5];
        checkAddr(addr);

        con.methods.balances_(addr).call().then( (bz) => {
          console.log( 'balances_[' + addr + '] == ' + bz );
        } );
      }

      if (cmd == 'chown')
      {
        let addr = process.argv[5];
        checkAddr(addr);

        con.methods.changeOwner( addr ).send( {from: eb, gas: 30000} );
      }

      if (cmd == 'count')
      {
        con.methods.count().call().then( (cn) => {
          console.log( 'count: ', cn );
        } );
      }

      if (cmd == 'events')
      {
        con.getPastEvents('allEvents', {fromBlock: 0, toBlock: 'latest'})
           .then( (events) => {

          for (var ii = 0; ii < events.length; ii++)
            console.log( 'Holder:\t' + LIB.shorten(events[ii].raw.data) );

        } );
      }

      if (cmd == 'holderAt')
      {
        let ix = parseInt( process.argv[5] );

        con.methods.holderAt(ix).call().then( (ha) => {
          console.log( 'Holder: ', ha );
        } );
      }

      if (cmd == 'suicide')
        con.methods.closedown().send( {from: eb, gas: 0} );

      if (cmd == 'supply')
        con.methods.totalSupply_().call().then( (sy) => {
          console.log( 'totalSupply_: ', sy );
        } );
    }
  } );
}
