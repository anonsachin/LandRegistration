'use strict'

const {Contract} = require('fabric-contract-api');

class Registrar extends Contract{
  constructor(){
    // This is this smart contract's name
    super("org.property-registration-network.registrar");
  }

  async instantiate(ctx){
    console.log("REGNET instantiated !!");
  }

  async approveNewUser(ctx,name,aadhar){
    try {
      // msp ACCESS control
      const msp = ctx.clientIdentity.getMSPID();

      if( msp !== 'registrarMSP'){
        throw new Error("ONLY MEMBERS OF REGISTRAR CAN ACCESS THIS");
      }

      // Getting Request
      let compKey  = ctx.stub.createCompositeKey("org.property-registration-network.Request",[name + '-' + aadhar]);

      let request = await ctx.stub.getState(compKey);

      if(request.toString() === ""){
        throw new Error("Request Not present");
      }
      else{
        // user
        request = JSON.parse(request.toString());
        let User = {
          name:request['name'],
          email_id:request['email_id'],
          phoneNumber:request['phoneNumber'],
          Aadhar:request['Aadhar'],
          createdAt: new Date(),
          upgradCoins:0,
        };
        let userKey = ctx.stub.createCompositeKey("org.property-registration-network.Users",[name + '-' + aadhar]);
        let getUser = await ctx.stub.getState(userKey);
        if (getUser.toString() === ""){
          let userBuffer = Buffer.from(JSON.stringify(User));
          await ctx.stub.putState(userKey,userBuffer);
          return User;
        }
        else {
          throw new Error("User already Verified");
        }
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
    // end
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

  // approve property request
  async approvePropertyRegistration(ctx,propertyID){
    try{
      // msp ACCESS control
      const msp = ctx.clientIdentity.getMSPID();

      if( msp !== 'registrarMSP'){
        throw new Error("ONLY MEMBERS OF REGISTRAR CAN ACCESS THIS");
      }

      let reqKey = ctx.stub.createCompositeKey("org.property-registration-network.Request",[propertyID]);
      let request = await  ctx.stub.getState(reqKey);
      if(request.toString() === ""){
        throw new Error("The Request Doesn't EXIST!!");
      }
      request = JSON.parse(request.toString());
      let property = {
        propertyID:request['propertyID'],
        Owner:request['Owner'],
        Price:request['Price'],
        Status:"registered",
      }
      let propKey = ctx.stub.createCompositeKey("org.property-registration-network.Property",[propertyID]);
      await ctx.stub.putState(propKey,Buffer.from(JSON.stringify(property)));
      return property;
    }catch(e){
      console.log(e);
    }
    //end
  }

}

module.exports = Registrar;
