var RestBase = require('./base.js').RestBase;
var util = require("util");
var Schema = require('../../models/schema.js').Schema;

var RestSchema = exports.RestSchema = function (server) {
	RestBase.call(this, 'schema', Schema, server);
	this._initServer();
}
util.inherits(RestSchema, RestBase);
