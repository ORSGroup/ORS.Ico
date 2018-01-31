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

const MYGASPRICE = '' + 4 * 1e9;

function getABI() {
  return JSON.parse( fs.readFileSync('./build/ICO_sol_ICO.abi').toString() );
}

function getBinary() {
  var binary = fs.readFileSync('./build/ICO_sol_ICO.bin').toString();
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
   'buy',
   'changeMiner',
   'deploy',
   'gasPrice',
   'saleIsOn',
   'setRate',
   'withdraw',
   'chown',
   'suicide',
   'variables'
  ];

function usage() {
  console.log(
    'Usage:\n$ node cli.js <acctindex> <SCA> <command> [arg]*\n',
     'Commands:\n',
     '\tbuy <wei> |\n',
     '\tchangeMiner <addr> |\n',
     '\tdeploy <token SCA> <preico SCA> <whitelist SCA> <tokpereth> |\n',
     '\tgasPrice |\n',
     '\tsaleIsOn <boolean> |\n',
     '\tsetRate <newrate> |\n',
     '\twithdraw <amount>\n',
     '\tchown <newaddr> |\n',
     '\tsuicide |\n',
     '\tvariables\n'
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
    //console.log( 'Ξtherbase: ', eb );

    // NOTE: times out when deploying to real blockchain, this is ok
    if (cmd == 'deploy')
    {
      let con = new web3.eth.Contract( getABI() );
      let tok = process.argv[5]; checkAddr(tok);
      let pic = process.argv[6]; checkAddr(pic);
      let whl = process.argv[7]; checkAddr(whl);
      let rate = parseInt( process.argv[8] );

      con
        .deploy({data:getBinary(), arguments: [tok, pic, whl, rate] } )
        .send({from: eb, gas: 1000000, gasPrice: MYGASPRICE}, (err, txhash) => {
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

      if (cmd == 'buy')
      {
        let wei = parseInt( process.argv[5] );

        web3.eth.sendTransaction(
          {from: eb, to: sca, value: wei, gas: 100000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'changeMiner')
      {
        let addr = process.argv[5];
        checkAddr(addr);
        con.methods.newMiner( addr )
                   .send( {from: eb, gas: 30000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'saleIsOn')
      {
        let flag = false;
        if (    process.argv[5]
             && (    process.argv[5].toLowerCase() == 'true'
                  || process.argv[5].toLowerCase() == 'yes' ) )
          flag = true;

        con.methods.saleIsOn( flag )
                   .send( {from: eb, gas: 30000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'setRate')
      {
        let newrate = parseInt( process.argv[5] );
        con.methods.setRate( newrate )
                   .send( {from: eb, gas: 30000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'chown')
      {
        let addr = process.argv[5];
        checkAddr(addr);
        con.methods.changeOwner( addr )
                   .send( {from: eb, gas: 30000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'suicide')
        con.methods.closedown().send( {from: eb, gas: 0} );

      if (cmd == 'withdraw')
      {
        let wei = parseInt( process.argv[5] );

        con.methods.withdraw( wei )
                   .send( {from: eb, gas: 90000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'variables')
      {
        con.methods.owner().call().then( (ow) => {
          console.log( 'owner: ', ow );
        } );
        con.methods.whitelist().call().then( (wl) => {
          console.log( 'whitelist: ', wl );
        } );
        con.methods.tokenSC().call().then( (tk) => {
          console.log( 'token: ', tk );
        } );
        con.methods.saleOn().call().then( (sl) => {
          console.log( 'sale is On: ', sl );
        } );
        con.methods.tokpereth().call().then( (te) => {
          console.log( 'rate, tokens per ETH: ', te );
        } );
        con.methods.sold().call().then( (sd) => {
          console.log( 'sold: ', sd );
        } );
        con.methods.salescap().call().then( (sp) => {
          console.log( 'cap: ', sp );
        } );
      }
    }
  } );
}
