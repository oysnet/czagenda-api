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

	this._initServer();
}
util.inherits(RestEvent, RestOAuthModel);

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

		p.save(function(err, p) {

			if (err !== null) {
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

		p.save(function(err, p) {
			
			if (err !== null) {
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

		p.save(function(err, p) {
			
			if (err !== null) {
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

		p.save(function(err, p) {
			
			if (err !== null) {
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
	
	if(err === null) {
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

RestEvent.prototype._getQueryFromRequest = function(req, callback) {

	var qs = req.query;

	var filter = null;
	var query = null;

	if( typeof (qs.fulltext) !== 'undefined') {
		query = {
			"query_string" : {
				"query" : qs.fulltext
			}
		}
	}

	var filter_and = [];

	if( typeof (qs.start_time) !== 'undefined') {

		var start_time = qs.start_time;
		var end_time = typeof (qs.end_time) !== 'undefined' ? qs.end_time : qs.start_time;

		var filter_or = [{
			"range" : {
				"event.when.startTime" : {
					"from" : start_time,
					"to" : end_time,
					"include_lower" : true,
					"include_upper" : true
				}
			}
		}, {
			"range" : {
				"event.when.endTime" : {
					"from" : start_time,
					"to" : end_time,
					"include_lower" : true,
					"include_upper" : true
				}
			}
		}, {

			and : [{
				"range" : {
					"event.when.startTime" : {
						"lt" : start_time
					}
				}
			}, {
				"range" : {
					"event.when.endTime" : {
						"gt" : start_time
					}
				}
			}]
		}, {

			and : [{
				"range" : {
					"event.when.startTime" : {
						"lt" : end_time
					}
				}
			}, {
				"range" : {
					"event.when.endTime" : {
						"gt" : end_time
					}
				}
			}]
		}];

		if(start_time.indexOf('T') !== -1) {
			var start_date = start_time.split('T')[0];
			filter_or.push({
				"term" : {
					"event.when.startTime" : start_date
				}
			});

			filter_or.push({
				"term" : {
					"event.when.endTime" : start_date
				}
			});
		}

		if(end_time.indexOf('T') !== -1) {
			var end_date = end_time.split('T')[0];
			filter_or.push({
				"term" : {
					"event.when.startTime" : end_date
				}
			});

			filter_or.push({
				"term" : {
					"event.when.endTime" : end_date
				}
			});
		}

		filter_and.push({
			or : filter_or
		});

	}

	if( typeof (qs.bbox) !== 'undefined') {

		if( typeof (qs.bbox) === 'string') {
			bbox = qs.bbox.split(',');
		} else {
			bbox = qs.bbox;
		}

		if(bbox.length !== 4) {
			callback(new restError.BadRequest('bbox length must be 4'), null);
			return;
		}
		filter_and.push({
			"geo_bounding_box" : {
				"event.where.geoPt" : {
					"top_left" : [parseFloat(bbox[0]), parseFloat(bbox[1])],
					"bottom_right" : [parseFloat(bbox[2]), parseFloat(bbox[3])]
				}
			}
		});
	}

	if(filter_and.length === 1) {
		filter = filter_and[0];
	} else if(filter_and.length > 1) {
		filter = {
			and : filter_and
		}
	}

	var q = {};
	if(filter !== null || query !== null) {
		q = {};

		if(filter !== null) {
			if(query === null) {
				query = {
					match_all : {}
				}
			}
			q = {
				query : {
					filtered : {
						query : query,
						filter : filter
					}
				}
			}
		} else {

			q.query = query;

		}

	} else {
		q = {
			query : {
				match_all : {}
			}
		};
	}
	callback(null, q);

}