var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var Schema = require('../../models/schema.js').Schema;
var mModelSearch = require('./mModelSearch');

var RestSchema = exports.RestSchema = function (server) {
	RestOAuthModel.call(this, 'schema', Schema, server);
	
	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search
	};
	
	this._initServer();
}

util.inherits(RestSchema, RestOAuthModel);


for(k in mModelSearch) {
	RestSchema.prototype[k] = mModelSearch[k];
}

RestSchema.prototype.searchFields = {
	'name' : 'term',
	'createDate' : 'datetime',
	'updateDate' : 'datetime'
}

RestSchema.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate'
}

RestSchema.prototype._populateObject = function (obj, data, req, res) {
	
	
	
	if (obj.author === null ) {
		obj.author = req.user.id;
	}
	
	
	return RestOAuthModel.prototype._populateObject.call(this, obj, data, req, res);
	
}



