var statusCode = require('../statusCodes.js');
var settings = require('../../settings.js');
var errors = require('../../models/errors.js');
var ElasticSearchClient = require('elasticsearchclient');
var elasticSearchClient = new ElasticSearchClient(settings.elasticsearch);
var async = require('async');

var restError = require('./errors');

var log = require('czagenda-log').from(__filename);

var RestBase = exports.RestBase = function(type, clazz, server) {


	this._type = type;
	this._clazz = clazz;
	this._server = server;
	
	this._urlPrefix = this._urlPrefix === null ? '/' + this._type : this._urlPrefix;
	
	this._idRegexp = '([^_]?[^\/]+)'
	
	this.__initialized = false;

	this._urls = {
		get : {},
		put : {},
		post : {},
		del : {}
	}
	
}


RestBase.prototype._urlPrefix = null;
RestBase.prototype._allowedMethods = null;

RestBase.prototype._initServer = function() {

	if(this.__initialized === true) {
		throw new Error('Server already initilized');
	}

	this.__initialized = true;

	var server = this._server;
	
	for(method in this._urls) {
		var sub_map = this._urls[method];
		for(url in sub_map) {

			var updatedUrl = url;
			
			if (this._idRegexp !== null) {
				updatedUrl = url.replace(/(\:id)/g, "$1" + this._idRegexp);
			}
			
			updatedUrl = '/api' + updatedUrl;
			
			log.debug('REST url added: ' + method.toUpperCase() + ' ' + updatedUrl);
			server[method](updatedUrl, this._getDefaultMiddleware().concat(typeof(sub_map[url].middleware) === 'undefined' ? [] : sub_map[url].middleware),sub_map[url].fn.bind(this));
		}
		
	}

}

RestBase.prototype._getDefaultMiddleware = function () {
	return [];
}



RestBase.prototype._renderJson = function(req, res, data) {

	res.charset = 'UTF-8';
	res.header('Content-Type', 'application/json');

	if(req.query.pretty == true || ( typeof (req.query.pretty) !== 'undefined' && req.query.pretty.toLowerCase() == 'true')) {
		return JSON.stringify(data, null, 2);
	} else {
		return JSON.stringify(data);
	}

}
