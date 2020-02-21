'use strict'

const {Contract} = require('fabric-contract-api');

class Registrar extends Contract{
  constructor(){
    // This is this smart contract's name
    super("org.property-registration-network.registrar");
  }
  async instantiate(){
    console.log("REGNET instantiated !!");
  }
}

module.exports = Registrar;
