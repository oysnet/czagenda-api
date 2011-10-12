var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var Schema = require('../../models/schema.js').Schema;

var RestSchema = exports.RestSchema = function (server) {
	RestOAuthModel.call(this, 'schema', Schema, server);
	this._initServer();
}

util.inherits(RestSchema, RestOAuthModel);

RestSchema.prototype._populateObject = function (obj, data, req, res) {
	
	
	
	if (obj.author === null ) {
		obj.author = req.user.id;
	}
			
	return RestOAuthModel.prototype._populateObject.call(this, obj, data, req, res);
	
}



