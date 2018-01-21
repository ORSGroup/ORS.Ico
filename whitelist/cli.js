// NOTES:
//
// 1.  costs of gas determined from testing. The add may consume more gas as
//     more and more holders are added
//
// 2. script uses hardcoded gasPrice -- CHECK ethgasstation.info

const fs = require('fs');
const Web3 = require('web3');
const web3 =
  new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const MYGASPRICE = '' + 6 * 1e9;

function getABI() {
  return JSON.parse( fs.readFileSync('./build/Whitelist_sol_Whitelist.abi')
                       .toString() );
}

function getBinary() {
  var binary = fs.readFileSync('./build/Whitelist_sol_Whitelist.bin')
                 .toString();
  if (!binary.startsWith('0x')) binary = '0x' + binary;
  return binary;
}

function getContract(sca) {
  return new web3.eth.Contract( getABI(), sca );
}

function checkAddr(addr) {
  try {
    let isaddr = parseInt( addr );
  } catch( e ) {
    usage();
    process.exit(1);
  }
}

const cmds =
  [
   'add', // <address>
   'at',  // <index>
   'chown',
   'count',
   'deploy',
   'gasPrice',
   'owner',
   'remove',   // <address>
   'set',      // <address>+
   'suicide'
  ];

function usage() {
  console.log(
    'Usage:\n$ node cli.js <acctindex> <SCA> <command> [arg]*\n',
     'Commands:\n',
     '\tadd <addr> |\n',
     '\tat <index> |\n',
     '\tchown <newaddr> |\n',
     '\tcount |\n',
     '\tdeploy |\n',
     '\tgasPrice |\n',
     '\towner |\n',
     '\tremove <addr> |\n',
     '\tset <addr>+ |\n',
     '\tsuicide\n'
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
      let con = new web3.eth.Contract( getABI() );

      con
        .deploy({data:getBinary(), arguments: [] } )
        .send({from: eb, gas: 450000, gasPrice: MYGASPRICE}, (err, txhash) => {
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
      let con = new web3.eth.Contract( getABI(), sca );

      if (cmd == 'add' || cmd == 'remove')
      {
        let addr = process.argv[5];
        checkAddr(addr);

        console.log( cmd + ' ' + addr );

        if (cmd == 'add')
          con.methods.add( addr )
                     .send( {from: eb, gas: 64610, gasPrice: MYGASPRICE} );
        else // remove
          con.methods.remove( addr )
                     .send( {from: eb, gas: 50000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'at')
      {
        let ix = parseInt( process.argv[5] );
        con.methods.memberAt(ix).call().then( (mbr) => {
          console.log( 'member: ', mbr );
        } );
      }

      if (cmd == 'chown')
      {
        let addr = process.argv[5];
        checkAddr(addr);
        con.methods.changeOwner( addr )
                   .send( {from: eb, gas: 30000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'count')
      {
        con.methods.count().call().then( (cn) => {
          console.log( 'count: ', cn );
        } );
      }

      if (cmd == 'owner')
      {
        con.methods.owner().call().then( (ow) => {
          console.log( 'owner: ', ow );
        } );
      }

      if (cmd == 'set')
      {
        var addrs = [];
        process.stdout.write( 'set( ' );

        for (var ii = 5; ii < process.argv.length; ii++)
        {
          addrs.push( process.argv[ii] );
          process.stdout.write( process.argv[ii] + ' ' );
        }
        process.stdout.write( ')\n' );
        con.methods.setMembers( addrs )
                   .send( {from: eb, gas: 200000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'suicide')
        con.methods.closedown().send( {from: eb, gas: 0} );
    }
  } );
}
