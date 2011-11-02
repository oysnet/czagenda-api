var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var log = require('czagenda-log').from(__filename);
var models = require('../../models');
var async = require('async');
var statusCodes = require('../statusCodes');
var mModelSearch = require('./mModelSearch');

function RestCategory(server) {

	RestOAuthModel.call(this, 'category', models.Category, server);

	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._initServer();
}

util.inherits(RestCategory, RestOAuthModel);

for(k in mModelSearch) {
	RestCategory.prototype[k] = mModelSearch[k];
}

RestCategory.prototype.searchFields = {
	'author' : 'term',
	'createDate' : 'datetime',
	'updateDate' : 'datetime',
	'title' : 'text',
	'description' : 'text'
}

RestCategory.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate',
	'title' : 'title.untouched'
}

RestCategory.prototype._populateObject = function(obj, data, req, res) {

	if(obj.author === null) {
		obj.author = req.user.id;
	}

	return RestOAuthModel.prototype._populateObject.call(this, obj, data, req, res);

}

exports.RestCategory = RestCategory