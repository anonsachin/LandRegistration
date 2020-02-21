'use strict'

const user = require('./Users.js');
const registrar = require('./Registrar.js');

module.exports.user = users;
module.exports.registrar = registrar;
module.exports.contracts = [user,registrar];
