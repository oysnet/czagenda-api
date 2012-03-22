var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var models = require('../../models');
var errors = require('../../models/errors.js');
var statusCode = require('../statusCodes.js');
var settings = require('../../settings.js');
var async = require('async');
var mModelSearch = require('./mModelSearch');
var redis = require('../redis-client');
var log = require('czagenda-log').from(__filename);
var crypto = require('crypto');

var RestUser = exports.RestUser = function(server) {

	RestOAuthModel.call(this, 'user', models.User, server);

	this._urls.get[this._urlPrefix + '/:id/events/_count'] = {
		fn : this.getEventCount
	};
	this._urls.get[this._urlPrefix + '/:id/groups'] = {
		fn : this.memberships
	};
	this._urls.post[this._urlPrefix + '/:id/_checkpassword'] = {
		fn : this.checkpassword
	};

	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search
	};
	
	this._initServer();
}
util.inherits(RestUser, RestOAuthModel);

for (k in mModelSearch) {
	RestUser.prototype[k] = mModelSearch[k];
}

RestUser.prototype.searchFields = {
	'createDate' : 'datetime',
	'updateDate' : 'datetime',
	'lastSeen' : 'datetime',
	'dateJoined' : 'datetime',
	'login' : 'text',
	'lastName' : 'text',
	'firstName' : 'text',
	'isActive' : 'boolean',
	'isStaff' : 'boolean',
	'isSuperuser' : 'boolean'

}

RestUser.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate',
	'login' : 'login.untouched',
	'firstName' : 'firstName.untouched',
	'lastName' : 'lastName.untouched',
	'lastSeen' : 'lastSeen',
	'joinedDate' : 'joinedDate'
}

RestUser.prototype.fulltextFields = ['login', 'lastName', 'firstName', 'email'];


RestUser.prototype._serializeObject = function(obj, req) {

	if( typeof (req.user) === 'undefined') {
		log.warning('_serializeObject : req is undefined ')
	}

	var keys = obj.constructor.publicAttributes;
	if(req.user.isStaff || req.user.isSuperuser || obj.id === req.user.id) {
		keys = obj.constructor.staffAttributes;
	}

	return obj.serialize(keys);
}


RestUser.prototype._preDel = function(obj, req, callback) {

	var id = "/user/" + req.params.id;

	var query = {
		"query" : {
			"filtered" : {
				"query" : {
					"match_all" : {}
				},
				"filter" : {
					"or" : [{
								"term" : {
									"author" : id
									// match document owned by user that will be
									// deleted
								}
							}, {
								"term" : {
									"grantTo" : id
									// match perms granted to the user that will
									// be deleted
								}
							}]
				}
			}
		}
	}

	this._checkIntegrity(query, req, callback);

}

RestUser.prototype._postDel = function(err, obj, req, callback) {

	if (err !== null && !(err instanceof models.errors.ObjectDoesNotExist)) {
		callback();
		return;
	}

	redis.redisClient.smembers(redis.USER_MEMBERSHIP_PREFIX + obj.id, function(
			err, res) {

		if (err !== null) {
			log.warning('REDIS: error on smembers ',
					redis.USER_MEMBERSHIP_PREFIX + obj.id, err);
			callback();
			return;
		}

		var methods = [];

		res.forEach(function(id) {

			methods.push(function(callback) {

				models.Membership.get({
							id : id
						}, function(err, membership) {

							if (err !== null) {
								log.warning('Unable to load membership', id);
								callback();
								return;
							}

							membership.del(function(err) {
										if (err !== null) {
											log
													.warning(
															'Unable to delete membership',
															membership.id);
										}

										callback();
									});
						});
			});
		});

		async.parallel(methods, function() {
					callback();
				});
	})
}

RestUser.prototype.memberships = function(req, res) {

	var q = {
		query : {
			term : {
				user : '/user/' + req.params.id
			}
		}
	};

	var tasks = [

	function(callback) {
		models.Membership.search(q, ["group", "createDate", "updateDate"],
				function(err, result) {

					if (err !== null) {
						callback(err)
					} else {
						callback(null, result);
					}

				});
	}];

	if (req.query.include_docs == true
			|| (typeof(req.query.include_docs) !== 'undefined' && req.query.include_docs
					.toLowerCase() == 'true')) {
		tasks.push(function(result, callback) {

			if (result.rows.length > 0) {

				var ids = [];
				var bygroup = {};

				for (var i = 0, l = result.rows.length; i < l; i++) {
					ids.push(result.rows[i].group)
					bygroup[result.rows[i].group] = result.rows[i];
				}

				var q = {
					size : 10000,
					query : {
						ids : {
							values : ids
						}
					}
				}

				models.Group.search(q, models.Group.publicAttributes, function(
								err, groups) {

							if (err !== null) {
								callback(err);
							} else {

								for (var i = 0, l = groups.rows.length; i < l; i++) {
									bygroup[groups.rows[i].id].group = groups.rows[i];
								}
								callback(null, result);
							}
						});
			} else {
				callback(null, result)
			}
		});
	}

	async.waterfall(tasks, function(err, result) {
				if (err !== null) {
					if (err instanceof errors.IndexDoesNotExist) {
						res.statusCode = statusCode.NOT_FOUND;
						res.end('Not found');
					} else {
						res.statusCode = statusCode.INTERNAL_ERROR;
						res.end('Internal error')
					}
				} else {
					res.end(this._renderJson(req, res, result));
				}
			}.bind(this));

}

RestUser.prototype.checkpassword = function(req, res) {
	var data = req.body;

	if (typeof(data) === 'undefined' || typeof(data.password) === 'undefined') {
		res.statusCode = statusCode.BAD_REQUEST;
		res.end('Missing password');
		return;
	}

	models.User.get({
				id : '/user/' + req.params.id
			}, function(err, obj) {

				if (err !== null) {

					if (err instanceof errors.ObjectDoesNotExist) {
						res.statusCode = statusCode.NOT_FOUND;
						res.end('Not found')
					} else {
						res.statusCode = statusCode.INTERNAL_ERROR;
						res.end('Internal error')
					}

				} else {

					res.statusCode = statusCode.ALL_OK;

					if (data.password === obj.password) {
						res.end('{"success":true}');
					} else {
						res.end('{"success":false}');
					}

				}

			}.bind(this))

}

RestUser.prototype.getEventCount = function(req, res) {

	models.Event.count({
				term : {
					author : '/user/' + req.params.id
				}
			}, function(err, result) {
				if (err !== null) {
					if (err instanceof errors.IndexDoesNotExist) {
						res.statusCode = statusCode.NOT_FOUND;
						res.end('Not found');
					} else {
						res.statusCode = statusCode.INTERNAL_ERROR;
						res.end('Internal error')
					}
				} else {
					res.end(this._renderJson(req, res, result));
				}

			}.bind(this));

}