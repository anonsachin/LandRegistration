'use strict'

const user = require('./user.js');
const registrar = require('./registrar.js');

module.exports.user = user;
module.exports.registrar = registrar;
module.exports.contracts = [registrar,user];
