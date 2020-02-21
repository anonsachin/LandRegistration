'use strict'

const {Contract} = require('fabric-contract-api');

class User extends Contract{

  constructor(){
    // This is the name of this smart contract
    super("org.property-registration-network.user");
  }

  async requestNewUser(ctx,name,email,phoneNumber,Aadhar){
    try{
      const msp = await ctx.clientIdentity.getMSPID();

      if( msp !== 'usersMSP'){
        throw new Error("ONLY MEMBERS OF USERS CAN ACCESS THIS");
      }
      else {
        const requestCompKey = ctx.stub.createCompositeKey("org.property-registration-network.Request",[name + '-' + Aadhar]);
        let newRequest = {
          name:name,
          email_id:email,
          phoneNumber:phoneNumber,
          Aadhar:Aadhar,
          createdAt: new Date(),
        };
        let reqBuffer = Buffer.from(JSON.stringify(newRequest));
        await ctx.stub.putState(requestCompKey,reqBuffer);

        return newRequest;
      }

    }
    catch(err){
      console.log(err);
    }
  }

}

module.exports = User;
