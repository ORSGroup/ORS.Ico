const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

web3.eth.getBalance( process.argv[2] ).then( (res) => {
  console.log( "bal: ", res );
} );
