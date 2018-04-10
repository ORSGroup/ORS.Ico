// NOTES:
//
// 1. script uses hardcoded gasPrice -- CHECK ethgasstation.info

const fs = require('fs');
const Web3 = require('web3');
const web3 =
  new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8546"));

const MYGASPRICE = '' + 1 * 1e9;

function getABI() {
  return JSON.parse( fs.readFileSync('./build/Community_sol_Community.abi')
	               .toString() );
}

function getBinary() {
  var binary = fs.readFileSync('./build/Community_sol_Community.bin')
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

function shorten(addr) {
  var saddr = "" + addr;
  return "0x" + saddr.substring(26);
}

const cmds =
  [
   'deploy',
   'chown',
   'events',
   'variables',
   'setName',
   'setBonus',
   'setManager',
   'setTimes'
  ];

function usage() {
  console.log(
    'Usage:\n$ node cli.js <acctindex> <SCA> <command> [arg]*\n',
     'Commands:\n',
     '\tdeploy |\n',
     '\tchown <new owner address> |\n',
     '\tevents |\n',
     '\tvariables <cty> |\n',
     '\tsetName <name> |\n',
     '\tsetBonus <bonus> |\n',
     '\tsetManager <manager> |\n',
     '\tsetTimes <start> <end>\n'
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

var eb;
web3.eth.getAccounts().then( (res) => {
    eb = res[ebi];
    if (cmd == 'deploy')
    {
      let con = new web3.eth.Contract( getABI() );

      con
        .deploy({data:getBinary()} )
        .send({from: eb, gas: 470000, gasPrice: MYGASPRICE}, (err, txhash) => {
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

      if (cmd == 'chown')
      {
        let addr = process.argv[5];
        checkAddr(addr);
        con.methods.changeOwner( addr )
                   .send( {from: eb, gas: 30000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'variables')
      {
        con.methods.owner().call().then( (res) => {
          console.log( "owner = ", res );
        } );

        con.methods.name_().call().then( (res) => {
          console.log( "name = ", res );
        } );

        con.methods.bonus_().call().then( (res) => {
          console.log( "bonus = ", res );
        } );

        con.methods.manager_().call().then( (res) => {
          console.log( "manager = ", res );
        } );

        con.methods.start_().call().then( (res) => {
          console.log( "start = ", res );
        } );

        con.methods.end_().call().then( (res) => {
          console.log( "end = ", res );
        } );
      }

      if (cmd == 'events')
      {
        con.getPastEvents( 'allEvents',
                           { fromBlock: 500000, toBlock: 'latest' } )
           .then( (events) => {

          for (var ii = 0; ii < events.length; ii++) {

            if (events[ii].event == 'Receipt')
              // note: commdistrib.sh depends on the fields of the report
              console.log( shorten(events[ii].raw.topics[1]) + ' ' +
                           parseInt(events[ii].raw.data,16) + ' ' +
                           events[ii].blockNumber + ' ' +
                           events[ii].address
                           );
          }

          process.exit(0);
        } );
      }

      if (cmd == 'setName')
      {
        con.methods.setName( process.argv[5] )
                   .send( {from: eb, gas: 60000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'setBonus')
      {
        con.methods.setBonus( process.argv[5] )
                   .send( {from: eb, gas: 60000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'setManager')
      {
        con.methods.setManager( process.argv[5] )
                   .send( {from: eb, gas: 60000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'setTimes')
      {
        con.methods.setTimes( process.argv[5], process.argv[6] )
                   .send( {from: eb, gas: 80000, gasPrice: MYGASPRICE} );
      }
    }
} );

