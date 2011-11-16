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

	
	this._urls.get[this._urlPrefix + '/:id/perms/wu'] = {
		fn : this.permsUserWrite
	};
	this._urls.get[this._urlPrefix + '/:id/perms/wg'] = {
		fn : this.permsGroupWrite
	};
	
	
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

RestEntity.prototype._populateObject = function(obj, data, req, res) {

	if(obj.author === null) {
		obj.author = req.user.id;
	}

	return RestOAuthModel.prototype._populateObject.call(this, obj, data, req, res);
}

RestEntity.prototype._preCreate = function(obj, req, callback) {
	
	
	
	// create write permission
	var p = new models.perms.EntityWriteUser();
	p.applyOn = obj.getId();
	p.grantTo = req.user.id;
	p.setValidationDone();
	
	// add write permission to obj
	obj.computedWriteUsers.push(req.user.id);
	obj.computedWriteUsersPerms.push(p.getId());
	
	p.save(function(err, p) {
		
		
		
		if (err === null) {
			req.preCreateObjects = [p];
		}
		
		// trivial but it's what we want...
		if( err instanceof models.errors.ObjectAlreadyExists) {
			err = null;
		}

		if(err !== null) {
			log.warning('RestAgenda.prototype.create: unable to create permission EntityWriteUser on ', req.user.id, obj.getId(), err)
			callback(new models.errors.InternalError('Unable to create permission, aborting'));
		} else {
			callback(null);
		}
		
	}, false, false)
}

RestEntity.prototype._postCreate = function(err, obj, req, callback) {
		
	if (err === null || typeof(req.preCreateObjects) === 'undefined') {
		callback();
		return;
	}

	// rolling back
	var rollbackMethods = [];
	req.preCreateObjects.forEach(function(toDelObj) {
		rollbackMethods.push(function(callback) {
			toDelObj.del(function(err, obj) {
				
				if (err !== null) {
					log.warning('RestEntity.prototype._postCreate: rolling back failed', toDelObj.id)
				}
				
				callback(err);
			}, false);
		});
	});

	async.parallel(rollbackMethods, function(rollbackErr) {
		callback();
	});
}


RestEntity.prototype._preDel = function(obj, req, callback) {

	var id = "/entity/" + req.params.id;

	var query = {
		
		"query" : {
			"filtered" : {
				"query" : {
						"term" : {
							"event.who.href" : id // match event
						}
					},
				"filter" : {
					"type" : {
						"value" : "event"
					}
				}
			}
		}
	}
	
	this._checkIntegrity(query,  req, callback);
}


RestEntity.prototype._postDel = function(err, obj, req, callback) {

	if(err !== null && !( err instanceof models.errors.ObjectDoesNotExist)) {
		callback();
		return;
	}
	
	
	var methods = [];

	obj.computedWriteUsersPerms.forEach(function(id) {
		methods.push(this._getPermDeleteMethod(obj, id, 'EntityWriteUser'));
	}.bind(this));
	
	obj.computedWriteGroupsPerms.forEach(function(id) {
		methods.push(this._getPermDeleteMethod(obj, id, 'EntityWriteGroup'));
	}.bind(this));
	
	async.parallel(methods, function() {
		callback();
	});
}

RestEntity.prototype.permsUserWrite = function(req, res) {
	var permClass = models.perms.getPermClass('entity', 'user', 'write'), grantToClass = models.User;
	
	this._perms(req, res, permClass, grantToClass);
}

RestEntity.prototype.permsGroupWrite = function(req, res) {
	var permClass = models.perms.getPermClass('entity', 'group', 'write'), grantToClass = models.Group;
	this._perms(req, res, permClass, grantToClass);
}