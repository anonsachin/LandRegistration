'use strict'

const {Contract} = require('fabric-contract-api');

class User extends Contract{

  constructor(){
    // This is the name of this smart contract
    super("org.property-registration-network.user");
  }

  async requestNewUser(ctx,name,email,phoneNumber,Aadhar){
  //   try{
      const msp = ctx.clientIdentity.getMSPID();
  //
  //     if( msp !== 'usersMSP'){
  //       throw new Error("ONLY MEMBERS OF USERS CAN ACCESS THIS");
  //     }
  //     else {
  //
  //     }
  //
  //   }
  //   catch(err){
  //     console.log(err);
  //   }
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

  async rechargeAccount(ctx,name,aadhar,bankTx){
  try {
    const msp = ctx.clientIdentity.getMSPID();
    console.log(msp);
    // getting user

    let userKey = ctx.stub.createCompositeKey("org.property-registration-network.Users",[name + '-' + aadhar]);
    let getUser = await ctx.stub.getState(userKey);

    if(getUser !== undefined){
      if(bankTx.includes('upg')){
        getUser = JSON.parse(getUser.toString())
        let amount = bankTx.substr(3,bankTx.length); // Extracting the value
        getUser['upgradCoins'] = getUser['upgradCoins'] + amount;
        await ctx.stub.putState(userKey,Buffer.from(JSON.stringify(getUser)));
        return getUser;
      }
      else {
        throw new Error("Not Valid Transaction");
      }
    }
    else {
      throw new Error("Not a Valid User");
    }
  } catch (e) {
    console.log(e);
  }
    // end
  }

  // get user details
  async viewUser(ctx,name,aadhar){
    try {
      let userKey = ctx.stub.createCompositeKey("org.property-registration-network.Users",[name + '-' + aadhar]);
      let getUser = await ctx.stub.getState(userKey)
      getUser = JSON.parse(getUser.toString())
      return getUser;
    } catch (e) {
      console.log(e);
    }
  }

}

module.exports = User;
