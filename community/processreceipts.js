// ----------------------------------------------------------------------------
// Read Receipts from a text file generated by cli.js and the shell
//
// For each receipt:
//
//    a. if we are below the block lower limit then skip this receipt
//    b. confirm sender is on eidoo's amlkyc list. if not, add to refund list
//       and skip this receipt
//    c. calculate the number of tokens bought at 0.05/token
//    d. apply the Community bonus (10%)
//    e. read eidoo list and determine whether sender was using eidoo wallet.
//       if so add 5% bonus
//
// ----------------------------------------------------------------------------

const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const ORST_SCA = '0x...'; // TODO: replace with ORST token SCA

const bigInt = require( 'big-integer' );
const https = require( 'https' );
const rdr = require( 'readline' );

const rurl = 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=EUR';
const fname = 'sortedreceipts.txt';

const lowerLimit = parseInt( process.argv[2] );
const MYGASPRICE = '' + 1 * 1e9; // 1 Gwei

function getABI() {
  return JSON.parse(
    fs.readFileSync('../ors/build/MineableToken_sol_MineableToken.abi')
	    .toString() );
}

function isOnEidooList( addr ) {
  // replace stub with a read of a file produced by eidoo or from eidoo API
  return true;
}

function isEidooWallet( addr ) {
  // replace stub with a read of a file produced by eidoo or from eidoo API
  return true;
}

let con = new web3.eth.Contract( getABI(), ORST_SCA );

var etheur; // rate will be read from rurl
var receipts = [];
var refunds = [];
var sumwei = bigInt();

// kick off the whole process
getRate();

function getRate() {
  https.get( rurl, rsp => {

    rsp.setEncoding( "utf8" );
    let body = "";

    rsp.on( "data", data => {
      body += data;
    } )
    .on( "end", () => {
      body = JSON.parse(body);
      etheur = body['EUR'];
      console.log( 'ETHEUR = ' + etheur );

      readReceiptFile();

    } );
  } );
}

function readReceiptFile() {

  let reader = rdr.createInterface( { input: fs.createReadStream(fname) } );

  reader.on('line', function(line) {
    let parts = line.split( /\s+/ );

    let receipt = {};
    receipt['number'] = parseInt( parts[0] );
    receipt['sender'] = '' + parts[1];
    receipt['weisent'] = bigInt( parts[2] );
    receipt['block'] = parseInt( parts[3] );
    receipt['community'] = '' + parts[4];

    sumwei += receipt['weisent'];

    receipts.push( receipt );
  } )
  .on('close', () => {
    console.log( 'sum: ', sumwei / bigInt('1e18') );
    processReceipts();
  } );
}

function processReceipts() {

  // 0.05 cents per token means 20 tokens to the EUR
  const tokpereth = eureth * 20;

  let bonus = 0;

  for (let ii = 0; ii < receipts.length; ii++) {
    console.log( 'receipt: ' + receipts[ii]['number'] );

    if ( (ii+1) < lowerLimit)
      continue; // cat -n starts at 1, not 0

    if (isOnEidooList(receipts[ii]['sender']))
      bonus += 5;
    else {
      refunds.push( receipts[ii] );
      continue;
    }

    // TODO : fetch from blockchain instead
    bonus += 10;

    // -----------------------------------------------
    // Quantity of tokens calculation
    //
    // Q = (ethersent * tokpereth) * (100 + bonus)/100
    //   = (wei/10**18 * tokpereth) * (100+bonus)/100
    // -----------------------------------------------

    let qty = new bigInt(
      receipts[ii]['weisent'] / bigInt('1e18') * tokpereth * (100+bonus)/100 );

    // the token contract has 18 decimals. Since ethereum does not have
    // floating point we have to specify the tokens to transfer as units:
    //   tokens * 10**decimals
    qty = qty * new bigInt('1e18');

    // mine the tokens for the sale, leaves them in the caller's account
    // NOTE: caller must be the owner of the token smart contract to work

    console.log( 'mining: ' + qty + ' ORST for ' + receipts[ii]['sender'] );

    con.mine( qty )
      .send( {from: web3.eth.accounts[6], gas: 64000, gasPrice: MYGASPRICE} );
      .then( () => {

      // transfer the tokens from caller's account to sender

      con.transfer( receipts[ii]['sender'], qty )
         .send( {from: web3.eth.accounts[6],
                 gas: 70000,
                 gasPrice: MYGASPRICE} );

    });

    processRefunds();

  } // end foreach receipt
}

// ----------------------------------------------------------------------------
// Process refunds
// ----------------------------------------------------------------------------

function processRefunds() {
  for (let ii = 0; ii < refunds.length; ii++) {
    console.log( 'refund: ' + refunds[ii]['number'] );

    // NOTE: requires calling account to already have enough ETH to process
    //       all the refunds

    web3.eth.sendTransaction( {from: web3.eth.accounts[6],
                               to: refunds[ii]['sender'],
                               gas: 22000,
                               gasPrice: MYGASPRICE} );
  }
}

