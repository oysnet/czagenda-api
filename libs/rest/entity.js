var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var statusCode = require('../statusCodes.js');
var util = require("util");
var models = require('../../models');
var ElasticSearchClient = require('elasticsearchclient');
var settings = require('../../settings.js');
var elasticSearchClient = new ElasticSearchClient(settings.elasticsearch);
var restError = require('./errors');
var log = require('czagenda-log').from(__filename);
var models = require('../../models');
var async = require('async');
var statusCodes = require('../statusCodes');
var mModelSearch = require('./mModelSearch');

var RestEntity = exports.RestEntity = function(server) {

	RestOAuthModel.call(this, 'entity', models.Entity, server);


	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._initServer();
}
util.inherits(RestEntity, RestOAuthModel);

for(k in mModelSearch) {
	RestEntity.prototype[k] = mModelSearch[k];
}

RestEntity.prototype.searchFields = {	
	'createDate' : 'datetime',
	'updateDate' : 'datetime',
	'entity.type' : 'term',
	'entity.name' : 'text',
	'entity.firstName' : 'text',
	'entity.lastName' : 'text',
	
	'entity.where.city' : 'text',
	'entity.where.country' : 'text',
	'entity.where.admin_level_2' : 'text',
	'entity.where.admin_level_3' : 'text',
	'entity.where.geoPt' : 'geo'
}

RestEntity.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate',
	'entity.name' : 'entity.name.untouched',
	'entity.firstName' : 'entity.firstName.untouched',
	'entity.lastName' : 'entity.lastName.untouched',
	'distance' : 'distance'

}
