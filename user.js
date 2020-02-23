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
        getUser['upgradCoins'] = Number(getUser['upgradCoins']);
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
      console.log(userKey);
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
        Owner:userKey.toString(),
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

      if(userKey.toString() !== request['Owner'] ){
        throw new Error("Not The Owner of This property");
      }
      if(status !== "onSale"){
        throw new Error("Illegal status");
      }
      request['Status'] = status;
      await ctx.stub.putState(propKey,Buffer.from(JSON.stringify(request)));
      return request;
    } catch (e) {
      console.log(e);
    }
    //end
  }

  // purchase of on sale Property
  async purchaseProperty(ctx,propertyID,name,aadhar){
    try {
      let userKey = ctx.stub.createCompositeKey("org.property-registration-network.Users",[name + '-' + aadhar]);
      let propKey = ctx.stub.createCompositeKey("org.property-registration-network.Property",[propertyID]);
      let request = await ctx.stub.getState(propKey);
      if(request.toString() === ""){
        throw new Error("The Property Doesn't EXIST!!");
      }
      request = JSON.parse(request.toString());
      if(request['Status'] !== "onSale"){
        throw new Error("Not for Sale!!");
      }
      // buyer
      let buyer = await ctx.stub.getState(userKey);
      if(buyer.toString() === ""){
        throw new Error("Buyer is Not a registered user!!")
      }
      buyer = JSON.parse(buyer.toString());
      // conversion to numbers from srtings
      buyer['upgradCoins'] = Number(buyer['upgradCoins']);
      request['Price'] = Number(request['Price']);

      if(buyer['upgradCoins'] < request['Price']){
        throw new Error("Balance is to low to make this transaction");
      }
      // Owner

      let nameDet = request['Owner'].substr('org.property-registration-network.Users'.length+1,request['Owner'].length);
      // console.log(nameDet);
      // let ownerKey = ctx.stub.createCompositeKey('org.property-registration-network.Users',[nameDet]);
      // console.log(nameDet.split('-'));
      let entity = nameDet.split('-');
      let ownerSplit = ctx.stub.createCompositeKey('org.property-registration-network.Users',[entity[0].replace(/\0/g, '')+'-'+entity[1].replace(/\0/g, '')]);
      // .replace(/\0/g, '') removes the null characters
      // console.log(ownerKey);
      // let alice = ctx.stub.createCompositeKey('org.property-registration-network.Users',['alice'+'-'+'0001']);
      // let getAlice = await ctx.stub.getState(alice);
      // console.log("entity");
      // console.log("entity 1"+ entity[0].length);
      // console.log("entity 2"+ entity[1].length);
      // console.log("edit");
      // console.log("entity 1"+ entity[0].replace(/\0/g, '').length);
      // console.log(entity[0]+"before"+entity[0].replace(/\0/g, ''));
      // console.log("entity 2"+ entity[1].replace(/\0/g, '').length);
      // console.log(entity[1]+"before"+entity[1].replace(/\0/g, ''));
      // console.log("trim");
      // console.log("entity 1"+ entity[0].trim().length);
      // console.log("entity 2"+ entity[1].trim().length);
      // console.log("alice");
      // console.log(typeof(alice));
      // console.log("split and alice work");
      // console.log(typeof(ownerSplit));
      // console.log(alice === ownerSplit);
      // console.log(alice == ownerSplit);
      // console.log("diff check");
      // console.log(findDiff(alice,ownerSplit));
      // console.log(getAlice.toString());
      // let owner = await ctx.stub.getState(ownerKey);
      // console.log("check");
      // console.log(ownerKey === alice);
      // console.log("keys");
      // console.log(alice);
      // console.log(ownerKey);
      // console.log("split check");
      // console.log(ownerSplit == alice);
      // console.log(ownerSplit === ownerKey);
      // console.log(ownerSplit);
      let getSplit = await ctx.stub.getState(ownerSplit);
      // console.log(getSplit);
      // console.log(owner);
      let owner = JSON.parse(getSplit.toString());

      // transaction
      owner['upgradCoins'] = Number(owner['upgradCoins']) + Number(request['Price']);
      buyer['upgradCoins'] = Number(buyer['upgradCoins']) - Number(request['Price']);
      request['Owner'] = userKey;
      request['Status'] = "registered";
      await ctx.stub.putState(userKey,Buffer.from(JSON.stringify(buyer)));
      await ctx.stub.putState(ownerSplit,Buffer.from(JSON.stringify(owner)));
      await ctx.stub.putState(propKey,Buffer.from(JSON.stringify(request)));

      return request;

    } catch (e) {
      console.log(e);
    }
    //end
  }

}
let findDiff = (str1, str2) =>{
  let diff= "";
  str2.split('').forEach(function(val, i){
    if (val != str1.charAt(i))
      diff += val ;
  });
  return diff;
}

module.exports = User;
