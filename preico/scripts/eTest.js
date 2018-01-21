//
//
//              ASSUMES TEST ENVIRONMENT, ethbase = account[0]
//
//
const LIB = require( './ICOLIB.js' );
const web3 = LIB.getWeb3();

if (process.argv.length != 4) {
  console.log( 'Usage: $ node this.js ICOSCA ENUMSCA' );
  process.exit( 1 );
}

var sca = process.argv[2];

var eb;
web3.eth.getAccounts().then( (res) => {

  eb = res[0];
  console.log( 'Ξtherbase: ', eb );

  let ico = new web3.eth.Contract( LIB.getABI(), process.argv[2] );
  let enu = new web3.eth.Contract( LIB.enumABI(), process.argv[3] );

  console.log( 'Calling set(ICO=', process.argv[2], ')' );

  enu.methods.set( process.argv[2] )
             .send( {from: eb, gas: 50000} )
             .then( () => {

    console.log( 'Calling add(', res[1], ', 1000 )' );
    ico.methods.add( res[1], 1000 )
               .send( {from: eb, gas: 108000} )
               .then( () => {

      console.log( 'calling add(', res[1], ', 700)' );
      ico.methods.add( res[1], 700 )
                 .send( {from: eb, gas: 108000} )
                 .then( () => {

        console.log( 'Calling getHolders()' );
        enu.methods.getHolders()
                   .send( {from: eb, gas: 200000} )
                   .then( () => {

          console.log( 'Retrieving logs' );
          enu.getPastEvents('allEvents', {fromBlock: 0, toBlock: 'latest'})
             .then( (events) => {

            for (var ii = 0; ii < events.length; ii++)
              console.log( 'Found:\t[' +
                           parseInt(events[ii].raw.data,16) + '] ' +
                           LIB.shorten(events[ii].raw.topics[1]) );

          } );
        } );
      } );
    } );
  } );
} );

