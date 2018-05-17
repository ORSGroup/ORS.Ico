// NOTES:
//
// 1.  costs of gas determined from testing. The add may consume more gas as
//     more and more holders are added
//
// 2. script uses hardcoded gasPrice -- CHECK ethgasstation.info

const fs = require('fs');
const Web3 = require('web3');
const math = require('mathjs');

const web3 =
  new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8546"));

const MYGASPRICE = '' + 3 * 1e9;

function getABI() {
  return JSON.parse( fs.readFileSync(
    './build/MineableToken_sol_MineableToken.abi').toString() );
}

function getBinary() {
  var binary = fs.readFileSync(
    './build/MineableToken_sol_MineableToken.bin').toString();

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
   'airdrop',
   'allowance',
   'approve',
   'approveAndCall',
   'balanceOf',
   'burn',
   'burnFrom',
   'chown',
   'deploy',
   'events',
   'gasPrice',
   'mine',
   'transfer',
   'transferFrom',
   'variables'
  ];

function usage() {
  console.log(
    'Usage:\n$ node cli.js <acctindex> <SCA> <command> [arg]*\n',
     'Commands:\n',
     '\tairdrop <filename> |\n',
     '\tallowance <owner> <spender> |\n',
     '\tapprove <spender> <value> |\n',
     '\tapproveAndCall <spender> <value> <context> |\n',
     '\tbalanceOf <addr> |\n',
     '\tburn <value> |\n',
     '\tburnFrom <fromaddr> <value> |\n',
     '\tchown <newaddr> |\n',
     '\tdeploy |\n',
     '\tevents |\n',
     '\tgasPrice |\n',
     '\tmine <qty> |\n',
     '\ttransfer <toaddr> <value> |\n',
     '\ttransfer <toaddr> <value> <data> <custom_fallback> |\n',
     '\ttransfer <toaddress> <value> <data> |\n',
     '\ttransferFrom <fromaddr> <toaddr> <value> |\n',
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

      con
        .deploy({data:getBinary(), arguments: [] } )
        .send({from: eb, gas: 1200000, gasPrice: MYGASPRICE}, (err, txhash) => {
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

      if (cmd == 'airdrop')
      {
        console.log( 'airdrop: ', process.argv[5], ' gasPrice: ', MYGASPRICE );

        var reader = require('readline').createInterface(
          { input: fs.createReadStream( process.argv[5]) } );

        reader.on('line', function(line) {
          let parts = line.split( /\s+/ );
          let ramt = math.bignumber( parts[1] );
          let amt = math.format(ramt, {notation:"fixed"});
          console.log( 'to: ', parts[0], ' amt: ', amt );

          con.methods.transfer( parts[0], amt )
             .send( {from: eb, gas: 100000, gasPrice: MYGASPRICE},
                    (err, txhash) => {
                      if (err) console.log( 'ERR: ', err );
                      if (txhash) console.log( 'tx: ', txhash );
                    } );
        } )
        .on('close', () => {
          console.log( 'done' );
        } );
      }

      if (cmd == 'allowance')
      {
        let owner = process.argv[5];
        let spender = process.argv[6];

        con.methods.allowance( owner, spender ).call().then( (amt) => {
          console.log( 'allowance: ', amt );
        } );
      }

      if (cmd == 'approve')
      {
        let spender = process.argv[5];
        let value = process.argv[6];
        con.methods.approve( spender, value )
                   .send( {from: eb, gas: 90000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'approveAndCall')
      {
        let spender = process.argv[5];
        let value = process.argv[6];
        let context = web3.utils.asciiToHex( process.argv[7] );

        con.methods.approveAndCall( spender, value, context )
                   .send( {from: eb, gas: 70000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'balanceOf')
      {
        let addr = process.argv[5];
        con.methods.balanceOf( addr ).call().then( (bal) => {
          console.log( 'balanceOf(', addr, '): ', bal );
        } );
      }

      if (cmd == 'burn')
      {
        let value = process.argv[5];
        con.methods.burn( value )
                   .send( {from: eb, gas: 90000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'burnFrom')
      {
        let fromaddr = process.argv[5];
        let value = process.argv[6];
        con.methods.burnFrom( fromaddr, value )
                   .send( {from: eb, gas: 90000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'chown')
      {
        let addr = process.argv[5];
        checkAddr(addr);
        con.methods.changeOwner( addr )
                   .send( {from: eb, gas: 60000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'events')
      {
        con.getPastEvents('allEvents', {fromBlock: 500000, toBlock: 'latest'})
           .then( (events) => {

          for (var ii = 0; ii < events.length; ii++)
          {
            console.log( events[ii].event );

            if (events[ii].event == 'Approval')
              console.log( events[ii].raw.topics[0] + "\n" + // owner
                           events[ii].raw.topics[0] + "\n" + // spender
                           events[ii].raw.data ); // value

            if (events[ii].event == 'Transfer')
              console.log( events[ii].raw.topics[0] + "\n" + // from
                           events[ii].raw.topics[0] + "\n" + // to
                           events[ii].raw.data ); // value

            if (events[ii].event == 'Burn')
              console.log( events[ii].raw.topics[0] + "\n" + // from
                           events[ii].raw.data ); // value

            console.log( '' );
          }
        } );
      }

      if (cmd == 'mine')
      {
        let ramt = math.bignumber( process.argv[5] );
        let amt = math.format(ramt, {notation:"fixed"});

        console.log( 'mine( ' + amt + ' )' );
        con.methods.mine( amt )
                   .send( {from: eb, gas: 100000, gasPrice: MYGASPRICE} )
                   .catch( (err) => { console.log(err); process.exit(1); } );
      }

      if (cmd == 'transfer')
      {
        if (process.argv.count > 8)
        {
          let toaddr = process.argv[5];
          let value = process.argv[6];
          let data = web3.utils.asciiToHex( process.argv[7] );
          let fallback = process.argv[8];

          con.methods.transfer( toaddr, value, data, fallback )
                     .send( {from: eb, gas: 90000, gasPrice: MYGASPRICE} );
        }
        else if (process.argv.count > 7)
        {
          let toaddr = process.argv[5];
          let value = process.argv[6];
          let data = web3.utils.asciiToHex( process.argv[7] );
          con.methods.transfer( toaddr, value, data )
                     .send( {from: eb, gas: 90000, gasPrice: MYGASPRICE} );
        }
        else
        {
          let toaddr = process.argv[5];
          let value = process.argv[6];
          console.log( 'to: ', toaddr, ' amt: ', value );

          con.methods.transfer( toaddr, value )
                     .send( {from: eb, gas: 70000, gasPrice: MYGASPRICE} );
        }
      }

      if (cmd == 'transferFrom')
      {
        let fromaddr = process.argv[5];
        let toaddr = process.argv[6];
        let value = process.argv[7];
        con.methods.transferFrom( fromaddr, toaddr, value )
                   .send( {from: eb, gas: 90000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'variables')
      {
        con.methods.owner().call().then( (ow) => {
          console.log( 'owner: ', ow ); } );

        con.methods.name().call().then( (nm) => {
          console.log( 'name: ', nm ); } );

        con.methods.symbol().call().then( (sy) => {
          console.log( 'symbol: ', sy ); } );

        con.methods.decimals().call().then( (de) => {
          console.log( 'decimals: ', de ); } );

        con.methods.totalSupply().call().then( (ts) => {
          console.log( 'totalSupply: ', ts ); } );

        con.methods.supplyCap().call().then( (sc) => {
          console.log( 'supplyCap: ', sc ); } );
      }
    }
  } );
}
