'use strict'

const {Contract} = require('fabric-contract-api');

class User extends Contract{
  constructor(){
    // This is the name of this smart contract
    super("org.property-registration-network.user");
  }

}

module.exports = User;
