// NOTES:
//
// 1. script uses hardcoded gasPrice -- CHECK ethgasstation.info

const fs = require('fs');
const Web3 = require('web3');
const web3 =
  new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const MYGASPRICE = '' + 1 * 1e9;

function getABI() {
  return JSON.parse( fs.readFileSync('./build/Airdropper_sol_Airdropper.abi')
	               .toString() );
}

function getBinary() {
  var binary = fs.readFileSync('./build/Airdropper_sol_Airdropper.bin')
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
   'gasPrice',
   'deploy',
   'variables',
   'chown',
   'airdrop',
   'events'
  ];

function usage() {
  console.log(
    'Usage:\n$ node cli.js <acctindex> <SCA> <command> [arg]*\n',
     'Commands:\n',
     '\tgasPrice |\n',
     '\tdeploy |\n',
     '\tvariables \n',
     '\tchown <new owner address> |\n',
     '\tairdrop <tokaddr> <sourcefile> |\n'
  );
}

var cmd = process.argv[4];

let found = false;
for (let ii = 0; ii < cmds.length; ii++)
  if (cmds[ii] == cmd) found = true;

if (!found) {
  usage();
  process.exit(1);
}

var ebi = process.argv[2]; // use eth.accounts[ebi]
var sca = process.argv[3];

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
      console.log( 'getting ABI' );
      let con = new web3.eth.Contract( getABI() );

      console.log( 'deploying...' );
      con
        .deploy({data:getBinary()} )
        .send({from: eb, gas: 1000000, gasPrice: MYGASPRICE}, (err, txhash) => {
          if (txhash) console.log( "send txhash: ", txhash );
        } )
        .on('error', (err) => { console.log("err: ", err); })
        .on('transactionHash', (h) => { console.log( "hash: ", h ); } )
        .on('receipt', (r) => { console.log( 'rcpt: ' + r.contractAddress); } )
        .on('confirmation', (cn, rcpt) => { console.log( 'cn: ', cn ); } )
        .then( (nin) => {
          console.log( "SCA", nin.options.address );

          process.exit(0);
        } );
    }
    else
    {
      let con = new web3.eth.Contract( getABI(), sca );

      if (cmd == 'chown')
      {
        let addr = process.argv[5];
        checkAddr(addr);
        con.methods.changeOwner( addr )
                   .send( {from: eb, gas: 30000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'variables')
      {
        con.methods.owner().call().then( (ow) => {
          console.log( 'owner: ', ow );
        } );
      }

      if (cmd == 'airdrop')
      {
        let recips = [];
        let qtys = [];

        var reader = require('readline').createInterface(
          { input: fs.createReadStream( process.argv[6]) } );

        reader.on('line', function(line) {
          let parts = line.split( /\s+/ );
          recips.push( parts[0] );
          qtys.push( parts[1] );
        } )
        .on('close', () => {
          console.log( 'sizeof(recips): ' + recips.length +
                       '\nsizeof(qtys): ' + qtys.length );
          con.methods.airdrop( process.argv[5], recips, qtys )
                     .send( {from: eb, gas: 1000000, gasPrice: MYGASPRICE} );
        } );
      }

      if (cmd == 'events')
      {
        con.events.Airdropped( "allEvents", function( err, evts ) {
          if (err) console.log( err );
          else console.log( evts );
        } );
      }
    }
  } );
}

