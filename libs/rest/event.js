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
var Lock = require('../lock');

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

	this._urls.post[this._urlPrefix + '/:id/moderate/approve'] = {
		fn : this.addApprove
	};

	this._urls.post[this._urlPrefix + '/:id/moderate/disapprove'] = {
		fn : this.addDisapprove
	};

	this._urls.del[this._urlPrefix + '/:id/moderate/approve'] = {
		fn : this.delApprove
	};

	this._urls.del[this._urlPrefix + '/:id/moderate/disapprove'] = {
		fn : this.delDisapprove
	};

	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.put[this._urlPrefix + '/:id'].middleware.push(this.requireParentLock.bind(this))
	this._urls.post[this._urlPrefix].middleware.push(this.requireParentLock.bind(this))

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
	'approvedBy' : 'term',
	'disapprovedBy' : 'term',
	'event.title' : 'text',
	'event.content' : 'text',
	'event.eventStatus' : 'term',
	'event.when.startTime' : 'datetime',
	'event.when.endTime' : 'datetime',
	'event.where.city' : 'text',
	'event.where.country' : 'text',
	'event.where.admin_level_2' : 'text',
	'event.where.admin_level_3' : 'text',
	'event.where.geoPt' : 'geo',
	'event.who.href' : 'term'
}

RestEvent.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate',
	'event.title' : 'event.title.untouched',
	'event.when.startTime' : 'datetime',
	'event.when.endTime' : 'datetime',
	'distance' : 'distance'

}

RestEvent.prototype.requireParentLock = function(req, res, next) {

	if( typeof (req.body.event) !== 'undefined' && typeof (req.body.event.parentEvent) !== 'undefined') {
		var lock = new Lock(req.body.event.parentEvent);
		lock.acquire(function(err, locked) {

			if(err !== null || locked === false) {
				res.statusCode = statusCodes.LOCKED;
				res.end('Document is Locked');
				return;
			}

			if( typeof (req.locks) == 'undefined') {
				req.locks = [lock];
			} else {
				req.locks.push(lock);
			}
			next();
		});
	} else {
		next();
	}

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

		obj.computedWriteUsersPerms.push(p.getId());

		p.save(function(err, p) {

			if(err === null) {
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

		obj.computedReadUsersPerms.push(p.getId());

		p.save(function(err, p) {

			if(err === null) {
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

		obj.computedReadUsersPerms.push(p.getId());

		p.save(function(err, p) {

			if(err === null) {
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

		obj.computedReadGroupsPerms.push(p.getId());

		p.save(function(err, p) {

			if(err === null) {
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

		// update parent event.childEvents if needed
		if( typeof (obj.event.parentEvent) !== 'undefined' && obj.event.parentEvent !== null) {
			models.Event.get({
				id : obj.event.parentEvent
			}, function(err, parent) {
				if( typeof (parent.event.childEvents) == 'undefined' || parent.event.childEvents.indexOf(obj.id) === -1) {
					if( typeof (parent.event.childEvents) == 'undefined') {
						parent.event.childEvents = [];
					}
					parent.event.childEvents.push(obj.id);

					parent.save(function(err) {
						if(err !== null) {
							log.critical('RestEvent.prototype._postCreate: error while saving parent event', obj.id, parent.id, JSON.stringify(err));
						}
						callback();
					});
				} else {
					callback();
				}
			})
		} else {
			callback();
		}

	} else if( typeof (req.preCreateObjects) !== 'undefined') {
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

}

RestEvent.prototype._preUpdate = function(obj, req, callback) {

	if(obj.initialData.parentEvent !== null && obj.initialData.parentEvent != obj.event.parentEvent) {
		// try to acquire a lock on original parent event
		var lock = new Lock(obj.initialData.parentEvent);
		lock.acquire(function(err, locked) {

			if(err !== null || locked === false) {
				req.res.statusCode = statusCodes.LOCKED;
				req.res.end('Document is Locked');
				return;
			}

			if( typeof (req.locks) == 'undefined') {
				req.locks = [lock];
			} else {
				req.locks.push(lock);
			}
			callback(null);
		});
	} else {
		callback(null);
	}
}

RestEvent.prototype._postUpdate = function(err, obj, req, callback) {

	if(err !== null) {
		callback();
		return;
	}

	var methods = [];
	// delete current event from parent event childEvents
	if(obj.initialData.parentEvent !== null && obj.initialData.parentEvent != obj.event.parentEvent) {
		methods.push(function(cb) {
			models.event.get({
				id : obj.initialData.parentEvent
			}, function(err, parent) {
				if(err !== null) {
					log.critical('RestEvent.prototype._postUpdate unable to load parent event', obj.initialData.parentEvent, JSON.stringify(err))
					cb();
				} else {

					if( typeof (parent.event.childEvents) == 'undefined') {
						log.warning('RestEvent.prototype._postUpdate parent event has no attribute childEvents', obj.initialData.parentEvent);
						cb();
					} else if(parent.event.childEvents.indexOf(obj.id) !== -1) {
						parent.event.childEvents.splice(parent.event.childEvents.indexOf(obj.id), 1);

						parent.save(function(err) {

							if(err !== null) {
								log.warning('RestEvent.prototype._postUpdate unable to save parent event', obj.initialData.parentEvent, JSON.stringify(err));
							}
							cb();
						})
					}
				}
			})
		})
	}

	if( typeof (obj.event.parentEvent) !== 'undefined') {
		methods.push(function(cb) {
			models.Event.get({
				id : obj.event.parentEvent
			}, function(err, parent) {
				if( typeof (parent.event.childEvents) == 'undefined' || parent.event.childEvents.indexOf(obj.id) === -1) {
					if( typeof (parent.event.childEvents) == 'undefined') {
						parent.event.childEvents = [];
					}
					parent.event.childEvents.push(obj.id);

					parent.save(function(err) {
						if(err !== null) {
							log.critical('RestEvent.prototype._postUpdate: error while saving parent event', obj.id, parent.id, JSON.stringify(err));
						}
						cb();
					});
				} else {
					cb();
				}
			})
		});
	}

	if(methods.length > 0) {
		async.parallel(methods, function() {
			callback();
		});
	} else {
		callback();
	}

}

RestEvent.prototype._preDel = function(obj, req, callback) {

	var id = "/event/" + req.params.id;

	var query = {
		"query" : {
			"filtered" : {
				"query" : {
					"match_all" : {}
				},
				"filter" : {
					"term" : {
						"event.childEvents" : id
					}
				}
			}
		}
	}

	this._checkIntegrity(query, req, function(err) {

		if(err !== null) {
			callback(err);
			return;
		}

		if( typeof (obj.event.parentEvent) != 'undefined') {
			// try to acquire a lock on parent event
			var lock = new Lock(obj.event.parentEvent);
			lock.acquire(function(err, locked) {

				if(err !== null || locked === false) {
					req.res.statusCode = statusCodes.LOCKED;
					req.res.end('Document is Locked');
					return;
				}

				if( typeof (req.locks) == 'undefined') {
					req.locks = [lock];
				} else {
					req.locks.push(lock);
				}
				callback(null);
			});
		} else {
			callback(null);
		}

	});
}

RestEvent.prototype._postDel = function(err, obj, req, callback) {

	if(err !== null && !( err instanceof models.errors.ObjectDoesNotExist)) {
		callback();
		return;
	}

	var methods = [];

	obj.computedWriteUsersPerms.forEach( function(id) {
		methods.push(this._getPermDeleteMethod(obj, id, 'EventWriteUser'));
	}.bind(this));

	obj.computedWriteGroupsPerms.forEach( function(id) {
		methods.push(this._getPermDeleteMethod(obj, id, 'EventWriteGroup'));
	}.bind(this));

	obj.computedReadUsersPerms.forEach( function(id) {
		methods.push(this._getPermDeleteMethod(obj, id, 'EventReadUser'));
	}.bind(this));

	obj.computedReadGroupsPerms.forEach( function(id) {
		methods.push(this._getPermDeleteMethod(obj, id, 'EventReadGroup'));
	}.bind(this));

	// add an async method to update parent event if needed
	if( typeof (obj.event.parentEvent) != 'undefined') {
		methods.push(function(cb) {

			models.event.get({
				id : obj.event.parentEvent
			}, function(err, parent) {
				if(err !== null) {
					log.critical('RestEvent.prototype._postDel unable to load parent event', obj.event.parentEvent, JSON.stringify(err))
					cb();
				} else {

					if( typeof (parent.event.childEvents) == 'undefined') {
						log.warning('RestEvent.prototype._postDel parent event has no attribute childEvents', obj.event.parentEvent);
						cb();
					} else if(parent.event.childEvents.indexOf(obj.id) !== -1) {
						parent.event.childEvents.splice(parent.event.childEvents.indexOf(obj.id), 1);

						parent.save(function(err) {

							if(err !== null) {
								log.warning('RestEvent.prototype._postDel unable to save parent event', obj.event.parentEvent, JSON.stringify(err));
							}
							cb();
						})
					}
				}
			})
		})
	}

	async.parallel(methods, function() {
		callback();
	});
}

RestEvent.prototype.__moderate = function(req, res, moderate) {

	var id = "/event/" + req.params.id;

	var lock = new Lock(id);
	lock.acquire(function(err, locked) {

		if(err !== null || locked === false) {
			res.statusCode = statusCodes.LOCKED;
			res.end('Document is Locked');
			return;
		}

		req.locks = [lock];

		models.Event.get({
			id : id
		}, function(err, event) {

			if(err !== null) {
				if( err instanceof models.errors.ObjectDoesNotExist) {
					res.statusCode = statusCodes.NOT_FOUND;
					res.end('Not found')
				} else {
					res.statusCode = statusCodes.INTERNAL_ERROR;
					res.end('Internal error')
				}
			} else {

				moderate(event);

				event.save(function(err, obj) {
					if(err === null) {
						res.statusCode = statusCodes.ALL_OK;
						res.end();
					} else {
						res.statusCode = statusCodes.INTERNAL_ERROR;
						res.end('Internal error')
					}
				})
			}
		});
	});
}

RestEvent.prototype.addApprove = function(req, res) {

	this.__moderate(req, res, function(event) {
		if(event.approvedBy.indexOf(req.user.id) === -1) {
			event.approvedBy.push(req.user.id);
		}

		if(( pos = event.disapprovedBy.indexOf(req.user.id)) !== -1) {
			event.disapprovedBy.splice(pos, 1);
		}
	});
}

RestEvent.prototype.addDisapprove = function(req, res) {

	this.__moderate(req, res, function(event) {
		if(event.disapprovedBy.indexOf(req.user.id) === -1) {
			event.disapprovedBy.push(req.user.id);
		}

		if(( pos = event.approvedBy.indexOf(req.user.id)) !== -1) {
			event.approvedBy.splice(pos, 1);
		}
	});
}

RestEvent.prototype.delApprove = function(req, res) {

	this.__moderate(req, res, function(event) {
		if(( pos = event.approvedBy.indexOf(req.user.id)) !== -1) {
			event.approvedBy.splice(pos, 1);
		}
	});
}

RestEvent.prototype.delDisapprove = function(req, res) {

	this.__moderate(req, res, function(event) {
		if(( pos = event.disapprovedBy.indexOf(req.user.id)) !== -1) {
			event.disapprovedBy.splice(pos, 1);
		}
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