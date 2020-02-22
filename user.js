'use strict'

const {Contract} = require('fabric-contract-api');

class User extends Contract{

  constructor(){
    // This is the name of this smart contract
    super("org.property-registration-network.user");
  }

  async requestNewUser(ctx,name,email,phoneNumber,Aadhar){
    try{
      const msp = ctx.clientIdentity.getMSPID();
  //
  //     if( msp !== 'usersMSP'){
  //       throw new Error("ONLY MEMBERS OF USERS CAN ACCESS THIS");
  //     }
  //     else {
  //
  //     }
  //
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
    catch(err){
      console.log(err);
    }
    // end
  }

  async rechargeAccount(ctx,name,aadhar,bankTx){
  try {
    const msp = ctx.clientIdentity.getMSPID();
    console.log(msp);
    // getting user

    let userKey = ctx.stub.createCompositeKey("org.property-registration-network.Users",[name + '-' + aadhar]);
    let getUser = await ctx.stub.getState(userKey);
    if(getUser.toString() === ""){
      throw new Error("The User doesn't EXIST!!!");
    }

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
      if(getUser.toString() === ""){
        throw new Error("The User doesn't EXIST!!!");
      }
      getUser = JSON.parse(getUser.toString())
      return getUser;
    } catch (e) {
      console.log(e);
    }
  }

  // property Request
  async propertyRegistrationRequest(ctx,propertyID,price,name,aadhar){
    try {
      let userKey = ctx.stub.createCompositeKey("org.property-registration-network.Users",[name + '-' + aadhar]);
      let getUser = await ctx.stub.getState(userKey)
      if(getUser.toString() === ""){
        throw new Error("The User doesn't EXIST!!!");
      }
      getUser = JSON.parse(getUser.toString());
      let propertyRequest = { //request
        propertyID:propertyID,
        Owner:userKey,
        Price:price,
        Status:null,
      }
      let propKey = ctx.stub.createCompositeKey("org.property-registration-network.Request",[propertyID]);
      await ctx.stub.putState(propKey,Buffer.from(JSON.stringify(propertyRequest)));
      return propertyRequest;
    } catch (e) {
      console.log(e)
    }
    //end
  }

  // get property
  async viewProperty(ctx,propertyID){
    try {
      let propKey = ctx.stub.createCompositeKey("org.property-registration-network.Property",[propertyID]);
      let request = await  ctx.stub.getState(propKey);
      if(request.toString() === ""){
        throw new Error("The Property Doesn't EXIST!!");
      }
      return JSON.parse(request.toString());
    } catch (e) {
      console.log(e);
    }
    //end
  }

  // update status
  async updateProperty(ctx,propertyID,name,aadhar,status){
    try {
      let userKey = ctx.stub.createCompositeKey("org.property-registration-network.Users",[name + '-' + aadhar]);
      let propKey = ctx.stub.createCompositeKey("org.property-registration-network.Property",[propertyID]);
      let request = await ctx.stub.getState(propKey);
      if(request.toString() === ""){
        throw new Error("The Property Doesn't EXIST!!");
      }
      request = JSON.parse(request.toString());
      // console.log(userKey.toString());
      // console.log(request);
      if(userKey.toString() !== request['Owner'] ){
        throw new Error("Not The Owner of This property");
      }
      if(status !== "onSale"){
        throw new Error("Illegal status");
      }
      request['Status'] = status;
      await ctx.stub.putState(propKey,request);
      return request;
    } catch (e) {
      console.log(e);
    }
    //end
  }

}

module.exports = User;
