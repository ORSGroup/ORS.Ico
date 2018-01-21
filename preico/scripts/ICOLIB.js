// ===========================================================================
// functions used by other scripts
// ===========================================================================

const fs = require('fs');
const Web3_ = require('web3');
const web3_ =
  new Web3_(new Web3_.providers.HttpProvider("http://localhost:8545"));

exports.getWeb3 = function() { return web3_; }

// ===========================================================================

exports.getABI = function() {
  return JSON.parse( fs.readFileSync('../build/PREICO_sol_PREICO.abi')
                       .toString() );
}

exports.getBinary = function() {
  var binary = fs.readFileSync('../build/PREICO_sol_PREICO.bin').toString();
  if (!binary.startsWith('0x')) binary = '0x' + binary;
  return binary;
}

exports.getContract = function(sca) {
  return new web3_.eth.Contract( exports.getABI(), sca );
}

// ===========================================================================

exports.enumABI = function() {
  return JSON.parse( fs.readFileSync('../build/EnumPREICO_sol_EnumPREICO.abi')
                       .toString() );
}

exports.enumBinary = function() {
  var binary =
    fs.readFileSync('../build/EnumPREICO_sol_EnumPREICO.bin').toString();
  if (!binary.startsWith('0x')) binary = '0x' + binary;
  return binary;
}

exports.enumContract = function(sca) {
  return new web3_.eth.Contract( exports.enumABI(), sca );
}

exports.shorten = function(addr) {
  var saddr = "" + addr;
  return "0x" + saddr.substring(26);
}

