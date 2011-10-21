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

	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search
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

RestEvent.prototype.unescape = function(str) {

	var re = /\\([\+\-\&\|\!\(\)\{\}\[\]\^\"\~\*\?\:\\])/

	return str.replace(re, '\1')

}

RestEvent.prototype.parseSearchQuery = function(req) {

	var qString = null;
	var sortString = null;
	var rawData = null;

	if(req.method === 'POST') {
		rawData = req.body;
	} else {
		rawData = req.query;
	}

	if( typeof (rawData.q) !== 'undefined') {
		qString = rawData.q.trim();
	}

	if( typeof (rawData.sort) !== 'undefined') {
		sortString = rawData.sort.trim();
	}

	// parse query : text field:.. field:...
	var q = {};

	var re = new RegExp(/[a-z0-9\.]+:/gi);
	var fields = [];

	if(re.test(qString) === true) {
		qString.match(re).forEach(function(v) {
			fields.push(v.substr(0, v.length - 1))
		});
		var qArray = qString.split(re);

		// first element is fulltext query
		if(qString.search(re) !== 0) {
			q.fulltext = qArray[0].trim();
			qArray = qArray.splice(1);
		} else {
			qArray = qArray.splice(1);
		}

		for(var i = 0, l = qArray.length; i < l; i++) {
			if(fields.length !== qArray.length) {
				log.warning('RestEvent.prototype.parseSearchQuery error ' + qString, JSON.stringify(fields), JSON.stringify(qArray))
				req.res.statusCode = statusCodes.BAD_REQUEST;
				req.res.end(qString);
				return;
			}

			if( typeof (q[fields[i]]) === 'undefined') {
				q[fields[i]] = [];
			}

			q[fields[i]].push(qArray[i].trim());
		}

	} else {
		q.fulltext = qString;
	}

	var sort = [];
	if(sortString !== null) {
		sortString.split(' ').forEach(function(v) {
			sort.push(v.trim());
		});
	}

	return {
		query : q,
		sort : sort
	}

}

RestEvent.prototype.getDatetimeSearchPart = function(field, args) {

	var q = null;
	if(args.length > 1) {
		q = {
			"or" : []
		}
		args.forEach( function(arg) {
			q.or.push(this.getDatetimeSearchPart(field, [arg]));
		}.bind(this))

	} else {
		var dateRe = '[0-9]{4}-[0-9]{2}-[0-9]{2}';
		var dateReExact = new RegExp('^' + dateRe + '$');
		var dateReRange = /^\[[ ]*([^ ]+)[ ]+TO[ ]+([^ ]+)[ ]*\]$/g
		var range = null;

		if(( range = dateReRange.exec(args[0])) !== null) {

			var from = range[1];
			var to = range[2];

			if(to == 'NOW') {
				to = (new Date()).toISOString();
			}

			if(from == 'NOW') {
				from = (new Date()).toISOString();
			}
			q = {
				range : {}
			};

			if(to == '*') {
				q.range[field] = {
					"gte" : from.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g, '$1T00:00:00.000Z')
				}
			} else if(from == '*') {
				q.range[field] = {
					"lte" : to.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g, '$1T23:59:59.999Z')
				}
			} else {
				q.range[field] = {
					"include_lower" : true,
					"include_upper" : true,
					"from" : from.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g, '$1T00:00:00.000Z'),
					"to" : to.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g, '$1T23:59:59.999Z')
				}
			}

		} else if(dateReExact.test(args[0])) {
			q = {
				term : {}
			};
			q.term[field] = args[0];
		} else {
			throw new restError.BadRequest(field + ':' + args[0])
		}

	}

	return q;

}

RestEvent.prototype.getTermSearchPart = function(field, args) {

	var q = null;
	if(args.length > 1) {
		q = {
			terms : {}
		};
		q.terms[field] = args;
	} else {
		q = {
			term : {}
		};
		q.term[field] = args[0];
	}

	return q;

}

RestEvent.prototype.getTextSearchPart = function(field, args) {
	var q = null;

	if(args.length > 1) {
		q = {
			"or" : []
		}
		args.forEach( function(arg) {
			q.or.push(this.getTextSearchPart(field, [arg]));
		}.bind(this))
	} else {
		q = {
			"query" : {
				"field" : {}
			}
		}
		q.query.field[field] = {
			"query" : args[0],
			"analyze_wildcard" : true,
			"auto_generate_phrase_queries" : true
		}
	}

	return q;
}

RestEvent.prototype.getGeoSearchPart = function(field, args) {
	var q = null;

	if(args.length > 1) {
		q = {
			"or" : []
		}
		args.forEach( function(arg) {
			q.or.push(this.getGeoSearchPart(field, [arg]));
		}.bind(this))
	} else {
		
		if ((bbox = args[0].match(/\[([0-9]{1,2}[\.0-9]*) ([0-9]{1,2}[\.0-9]*) ([0-9]{1,2}[\.0-9]*) ([0-9]{1,2}[\.0-9]*)\]/)) !== null) {
			q = {"geo_bounding_box" : {}}
			q.geo_bounding_box[field] = {
				"top_left" : [parseFloat(bbox[2]), parseFloat(bbox[2])],
				"bottom_right" : [parseFloat(bbox[3]), parseFloat(bbox[4])]
			}
		} else if ((distance = args[0].match(/\[([0-9]{1,2}[\.0-9]*) ([0-9]{1,2}[\.0-9]*) DISTANCE ([0-9]+(km|mi|miles))\]/)) !== null) {
			console.log(distance[3])
			q = {"geo_distance" : {"distance" : distance[3]}}
			q.geo_distance[field] = [parseFloat(distance[1]), parseFloat(distance[2])]
		}
		
	}

	return q;
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

RestEvent.prototype._getQueryFromRequest = function(req, callback) {

	var search = this.parseSearchQuery(req);

	var query = null;
	var filter = null;

	// create full text search
	if( typeof (search.query.fulltext) !== 'undefined') {
		query = {
			"query_string" : {
				"query" : search.query.fulltext,
				"analyze_wildcard" : true,
				"auto_generate_phrase_queries" : true
			}
		}
		delete search.query.fulltext;
	}

	try {

		// create filter search
		for(field in search.query) {

			if( typeof (this.searchFields[field]) === 'undefined') {
				req.res.statusCode = statusCodes.BAD_REQUEST;
				req.res.end(field);
				return;
			}

			if(filter === null) {
				filter = {
					"and" : []
				}
			}

			switch (this.searchFields[field]) {

				case 'term':
					filter.and.push(this.getTermSearchPart(field, search.query[field]))
					break;

				case 'text':
					filter.and.push(this.getTextSearchPart(field, search.query[field]))
					break;

				case 'datetime':
					filter.and.push(this.getDatetimeSearchPart(field, search.query[field]))
					break;
					
				case 'geo':
					filter.and.push(this.getGeoSearchPart(field, search.query[field]))
					break;

			}
		}

	} catch (e) {
		callback(e);
		return;
	}

	if(query === null) {
		query = {
			"match_all" : {}
		}
	}

	if(filter === null) {
		query = {
			"query" : query
		};
	} else {

		if(filter.and.length === 1) {
			filter = filter.and[0];
		}
		query = {
			"query" : {
				"filtered" : {
					"query" : query,
					"filter" : filter
				}
			}
		}
	}

	callback(null, query);

	console.log(JSON.stringify(query))

	return;
	var qs = req.query;

	var filter = null;
	var query = null;

	if( typeof (qs.fulltext) !== 'undefined') {
		query = {
			"query_string" : {
				"query" : qs.fulltext,
				default_operator : "AND"
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