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

var RestEvent = exports.RestEvent = function(server) {

	RestOAuthModel.call(this, 'event', models.Event, server);

	this._urls.get[this._urlPrefix + '/:id/perms/wu'] = {
		fn : this.permsUserWrite
	};
	this._urls.get[this._urlPrefix + '/:id/perms/wg'] = {
		fn : this.permsGroupWrite
	};
	this._urls.get[this._urlPrefix + '/:id/perms/ru'] = {
		fn : this.permsUserRead
	};
	this._urls.get[this._urlPrefix + '/:id/perms/rg'] = {
		fn : this.permsGroupRead
	};

	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._initServer();
}
util.inherits(RestEvent, RestOAuthModel);

for(k in mModelSearch) {
	RestEvent.prototype[k] = mModelSearch[k];
}

RestEvent.prototype.searchFields = {
	'agenda' : 'term',
	'author' : 'term',
	'createDate' : 'datetime',
	'updateDate' : 'datetime',
	'event.title' : 'text',
	'event.content' : 'text',
	'event.eventStatus' : 'term',
	'event.when.startTime' : 'datetime',
	'event.when.endTime' : 'datetime',
	'event.where.city' : 'text',
	'event.where.country' : 'text',
	'event.where.admin_level_2' : 'text',
	'event.where.admin_level_3' : 'text',
	'event.where.geoPt' : 'geo'
}

RestEvent.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate',
	'event.title' : 'event.title.untouched',
	'event.when.startTime' : 'datetime',
	'event.when.endTime' : 'datetime',
	'distance' : 'distance'

}

RestEvent.prototype._getDefaultSort = function() {
	return [{
		"event.when.startTime" : {
			"order" : "desc",
			"missing" : "_last"
		}
	}, {
		"createDate" : {
			"order" : "desc"
		}
	}]
}


RestEvent.prototype._populateObject = function(obj, data, req, res) {

	if(obj.author === null) {
		obj.author = req.user.id;
	}

	return RestOAuthModel.prototype._populateObject.call(this, obj, data, req, res);

}

RestEvent.prototype._preCreate = function(obj, req, callback) {

	// add permissions to obj
	obj.computedWriteUsers.push(req.user.id);
	obj.computedReadUsers.push(req.user.id);

	obj.computedReadUsers.push('/user/all');
	obj.computedReadGroups.push('/group/all');

	var methods = []
	req.preCreateObjects = [];

	// write user permission
	methods.push(function(cb) {

		// create write permission
		var p = new models.perms.EventWriteUser();
		p.applyOn = obj.getId();
		p.grantTo = req.user.id;
		p.setValidationDone();

		p.save(function(err, p) {

			if(err !== null) {
				req.preCreateObjects.push(p);
			}

			// trivial but it's what we want...
			if( err instanceof models.errors.ObjectAlreadyExists) {
				err = null;
			}

			if(err !== null) {
				log.warning('RestAgenda.prototype.create: unable to create permission EventWriteUser on ', req.user.id, obj.getId(), err)
				cb(new models.errors.InternalError('Unable to create permission, aborting'));
			} else {
				cb(null);
			}

		}, false, false);
	});
	// read user permission
	methods.push(function(cb) {

		// create write permission
		var p = new models.perms.EventReadUser();
		p.applyOn = obj.getId();
		p.grantTo = req.user.id;
		p.setValidationDone();

		p.save(function(err, p) {

			if(err !== null) {
				req.preCreateObjects.push(p);
			}

			// trivial but it's what we want...
			if( err instanceof models.errors.ObjectAlreadyExists) {
				err = null;
			}

			if(err !== null) {
				log.warning('RestAgenda.prototype.create: unable to create permission EventReadUser on ', req.user.id, obj.getId(), err)
				cb(new models.errors.InternalError('Unable to create permission, aborting'));
			} else {
				cb(null);
			}

		}, false, false);
	});
	// read user permission
	methods.push(function(cb) {

		// create write permission
		var p = new models.perms.EventReadUser();
		p.applyOn = obj.getId();
		p.grantTo = '/user/all';
		p.setValidationDone();

		p.save(function(err, p) {

			if(err !== null) {
				req.preCreateObjects.push(p);
			}

			// trivial but it's what we want...
			if( err instanceof models.errors.ObjectAlreadyExists) {
				err = null;
			}

			if(err !== null) {
				log.warning('RestAgenda.prototype.create: unable to create permission EventReadUser on ', '/user/all', obj.getId(), err)
				cb(new models.errors.InternalError('Unable to create permission, aborting'));
			} else {
				cb(null);
			}

		}, false, false);
	});
	// read group permission
	methods.push(function(cb) {

		// create write permission
		var p = new models.perms.EventReadGroup();
		p.applyOn = obj.getId();
		p.grantTo = '/group/all';
		p.setValidationDone();

		p.save(function(err, p) {

			if(err !== null) {
				req.preCreateObjects.push(p);
			}

			// trivial but it's what we want...
			if( err instanceof models.errors.ObjectAlreadyExists) {
				err = null;
			}

			if(err !== null) {
				log.warning('RestAgenda.prototype.create: unable to create permission EventReadGroup on ', '/group/all', obj.getId(), err)
				cb(new models.errors.InternalError('Unable to create permission, aborting'));
			} else {
				cb(null);
			}

		}, false, false);
	});

	async.parallel(methods, function(err) {

		if( typeof (err) === 'undefined') {
			err = null;
		}

		if(err !== null) {

			// rolling back
			var rollbackMethods = [];
			req.preCreateObjects.forEach(function(toDelObj) {
				rollbackMethods.push(function(cb) {
					toDelObj.del(function(err, obj) {

						if(err !== null) {
							log.warning('RestEvent.prototype._postCreate: rolling back failed', toDelObj.id)
						}

						cb(err);
					});
				});
			});

			async.parallel(rollbackMethods, function(rollbackErr) {
				callback(err);
			});
		} else {
			callback(err);
		}

	});
}

RestEvent.prototype._postCreate = function(err, obj, req, callback) {

	if(err === null || typeof (req.preCreateObjects) === 'undefined') {
		callback();
		return;
	}

	// rolling back
	var rollbackMethods = [];
	req.preCreateObjects.forEach(function(toDelObj) {
		rollbackMethods.push(function(callback) {
			toDelObj.del(function(err, obj) {

				if(err !== null) {
					log.warning('RestEvent.prototype._postCreate: rolling back failed', toDelObj.id)
				}

				callback(err);
			});
		});
	});

	async.parallel(rollbackMethods, function(rollbackErr) {
		callback();
	});
}

RestEvent.prototype.permsUserWrite = function(req, res) {
	var permClass = models.perms.getPermClass('event', 'user', 'write'), grantToClass = models.User;
	this._perms(req, res, permClass, grantToClass);
}

RestEvent.prototype.permsGroupWrite = function(req, res) {
	var permClass = models.perms.getPermClass('event', 'group', 'write'), grantToClass = models.Group;
	this._perms(req, res, permClass, grantToClass);
}

RestEvent.prototype.permsUserRead = function(req, res) {
	var permClass = models.perms.getPermClass('event', 'user', 'read'), grantToClass = models.User;
	this._perms(req, res, permClass, grantToClass);
}

RestEvent.prototype.permsGroupRead = function(req, res) {
	var permClass = models.perms.getPermClass('event', 'group', 'read'), grantToClass = models.Group;
	this._perms(req, res, permClass, grantToClass);
}

RestEvent.prototype._setPermsOnQuery = function(req, q) {

	var hasQueryAttribute = typeof (q.query) !== 'undefined';

	if(hasQueryAttribute === true) {
		q = q.query;
	}

	var query = {};

	if( typeof (q.filtered) === 'undefined') {

		// assume that query is something like {match_all : {}}

		query.filtered = {
			query : q,
			filter : {
				"or" : [{
					terms : {
						computedReadGroups : req.user.groups.concat(["/group/all"]),
						"minimum_match" : 1
					}
				}, {
					terms : {
						computedReadUsers : ["/user/all", req.user.id],
						"minimum_match" : 1
					}
				}]
			}
		}

	} else {

		query.filtered = {
			query : q.filtered.query,
			filter : {
				and : [{
					"or" : [{
						terms : {
							computedReadGroups : req.user.groups.concat(["/group/all"]),
							"minimum_match" : 1
						}
					}, {
						terms : {
							computedReadUsers : ["/user/all", req.user.id],
							"minimum_match" : 1
						}
					}]
				}, q.filtered.filter]
			}
		}
	}

	if(hasQueryAttribute === true) {
		query = {
			query : query
		};
	}
	return query;

}