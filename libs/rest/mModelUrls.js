var log = require('czagenda-log').from(__filename);
var statusCodes = require('../statusCodes');
var errors = require('../../models').errors;
var restError = require('./errors');
var async = require('async');
var models = require('../../models');
var settings = require('../../settings.js');
var ElasticSearchClient = require('elasticsearchclient');
var elasticSearchClient = new ElasticSearchClient(settings.elasticsearch);
var statusCodes = require('../statusCodes');

exports.populateModelUrls = function() {
	this._urls.get[this._urlPrefix] = {
		middleware : [],
		fn : this.list
	};
	this._urls.get[this._urlPrefix + '/_count'] = {
		middleware : [],
		fn : this.count
	};
	this._urls.post[this._urlPrefix + '/_count'] = {
		middleware : [],
		fn : this.count
	};
	this._urls.get[this._urlPrefix + '/:id'] = {
		middleware : [],
		fn : this.read
	};

	this._urls.post[this._urlPrefix] = {
		middleware : [],
		fn : this.create
	};

	this._urls.put[this._urlPrefix + '/:id'] = {
		middleware : [],
		fn : this.update
	};
	this._urls.del[this._urlPrefix + '/:id'] = {
		middleware : [],
		fn : this.del
	};
	this._urls.get[this._urlPrefix + '/:id/_hasperm/:perm'] = {
		middleware : [],
		fn : this.hasPerm
	};
}

exports.hasPerm = function(req, res) {
	
	var perm = req.params.perm;
	var perms = ['read', 'write', 'del'];
	if (perms.indexOf(perm) === -1) {
		res.statusCode = statusCodes.BAD_REQUEST;
		res.end('Ask perm for ' + perms.join(', '))
		return;
	}
	
	this._clazz.get({
		id : this._urlPrefix + "/" + req.params.id
	}, function(err, obj) {

		if(err !== null) {
			if( err instanceof errors.ObjectDoesNotExist) {
				res.statusCode = statusCodes.NOT_FOUND;
				res.end('Not found')
			} else {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error')
			}
		} else {
			
			
			
			// check permissions
			obj.hasPerm(perm, req.user, function(err, hasPerm) {

				if(err !== null) {
					res.statusCode = statusCodes.INTERNAL_ERROR;
					res.end('Internal error');
					return;
				} 

				res.statusCode = statusCodes.ALL_OK;
				res.end(this._renderJson(req, res, {perm : perm, grant : hasPerm}));

			}.bind(this));
		}

	}.bind(this));
}

/**
 * populate an object with other object attributes
 */
exports._populateObject = function(obj, data, req, res) {

	var oauthKeys = ['oauth_nonce', 'oauth_timestamp', 'oauth_consumer_key', 'oauth_signature_method', 'oauth_version', 'oauth_token', 'oauth_signature'];

	var allowedKeys = obj.constructor.publicWriteAttributes;

	if(req.user.isStaff || req.user.isSuperuser) {
		allowedKeys = obj.constructor.staffWriteAttributes;
	}

	var wrongKeys = [];

	for(k in data) {
		if(allowedKeys.indexOf(k) === -1 && oauthKeys.indexOf(k) === -1) {
			wrongKeys.push(k);
		} else {
			obj[k] = data[k];
		}
	}

	if(wrongKeys.length === 0) {
		return true;
	} else {
		res.statusCode = statusCodes.BAD_REQUEST;

		res.end(this._renderJson(req, res, {
			errors : ["Bad attributes: " + wrongKeys.join(' ,')]

		}));
		return false;
	}
}
/**
 * Return a serializable object that contains only attributes listed in keys
 */
exports._serializeObject = function(obj, req) {

	if( typeof (req.user) === 'undefined') {
		log.warning('_serializeObject : req is undefined ')
	}

	var keys = obj.constructor.publicAttributes;
	if(req.user.isStaff || req.user.isSuperuser) {
		keys = obj.constructor.staffAttributes;
	}

	return obj.serialize(keys);
}

exports._getQueryFromRequest = function(req, callback) {
	callback(null, {
		query : {
			match_all : {}
		}
	});
}

exports.list = function(req, res) {

	var query = {
		query : {
			match_all : {}
		}
	};

	this._search(req, res, this._setPermsOnQuery(req, query));
}
/**
 * restrict query with permissions
 * return a new query object
 */
exports._setPermsOnQuery = function(req, q) {
	return q;
}

exports.count = function(req, res) {

	this._getQueryFromRequest(req, function(err, query) {

		if(err !== null) {

			if( err instanceof restError.BadRequest) {
				res.statusCode = statusCodes.BAD_REQUEST;
				res.end(err.message)
			} else {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error')
			}

		} else {
			this._count(req, res, this._setPermsOnQuery(req, query));
		}
	}.bind(this));

}

exports.read = function(req, res) {

	this._clazz.get({
		id : this._urlPrefix + "/" + req.params.id
	}, function(err, obj) {

		if(err !== null) {
			if( err instanceof errors.ObjectDoesNotExist) {
				res.statusCode = statusCodes.NOT_FOUND;
				res.end('Not found')
			} else {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error')
			}
		} else {

			// check permissions
			obj.hasPerm('read', req.user, function(err, hasPerm) {

				if(err !== null) {
					res.statusCode = statusCodes.INTERNAL_ERROR;
					res.end('Internal error');
					return;
				} else if(hasPerm === false) {
					res.statusCode = statusCodes.FORBIDDEN;
					res.end('Insufficient privileges');
					return;
				}

				res.statusCode = statusCodes.ALL_OK;
				res.end(this._renderJson(req, res, this._serializeObject(obj, req)));

			}.bind(this));
		}

	}.bind(this));
}
/**
 * this methods is called before save object
 * obj is the prepared obj to save
 * req is the current request
 * callback take one argument : null if all went done or an InternalError instance with a message to return as response. If an error is passed, create process is stopped
 */
exports._preCreate = function(obj, req, callback) {
	callback(null)
}
/**
 * this methods is called after save object
 * err is an error instance or null
 * obj is the prepared obj to save
 * req is the current request
 * callback take no arguments
 */
exports._postCreate = function(err, obj, req, callback) {
	callback();
}

exports.create = function(req, res) {

	var data = req.body;

	var obj = new this._clazz;

	if(this._populateObject(obj, data, req, res) === true) {

		obj.validate( function(err) {

			if(err !== null) {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error');
				return;
			} else if(obj.validationErrors !== null) {
				res.statusCode = statusCodes.BAD_REQUEST;
				res.end(this._renderJson(req, res, obj.validationErrors));
				return;
			}

			// check permissions
			obj.hasPerm('create', req.user, function(err, hasPerm) {

				if(err !== null) {
					res.statusCode = statusCodes.INTERNAL_ERROR;
					res.end('Internal error');
					return;
				} else if(hasPerm === false) {

					res.statusCode = statusCodes.FORBIDDEN;
					res.end('Insufficient privileges');
					return;
				}

				this._preCreate(obj, req, function(err) {

					if(err !== null) {
						res.statusCode = statusCodes.INTERNAL_ERROR;
						res.end(err.message);
						return;
					}

					// try to save object
					obj.save( function(err, obj) {

						this._postCreate(err, obj, req, function() {
							if(err === null) {
								res.statusCode = statusCodes.CREATED;
								res.end(this._renderJson(req, res, this._serializeObject(obj, req)));
							} else {

								if( err instanceof errors.ObjectAlreadyExists) {
									res.statusCode = statusCodes.DUPLICATE_ENTRY;
									res.end(err.message);

								} else if( err instanceof errors.ValidationError) {
									res.statusCode = statusCodes.BAD_REQUEST;
									res.end(this._renderJson(req, res, obj.validationErrors));

								} else {
									res.statusCode = statusCodes.INTERNAL_ERROR;
									res.end('Internal error')
								}
							}
						}.bind(this));

					}.bind(this));

				}.bind(this));

			}.bind(this));

		}.bind(this));

	}
}

/**
 * this methods is called before save object
 * obj is the prepared obj to save
 * req is the current request
 * callback take one argument : null if all went done or an InternalError instance with a message to return as response. If an error is passed, create process is stopped
 */
exports._preUpdate = function(obj, req, callback) {
	callback(null)
}
/**
 * this methods is called after save object
 * err is an error instance or null
 * obj is the prepared obj to save
 * req is the current request
 * callback take no arguments
 */
exports._postUpdate = function(err, obj, req, callback) {
	callback();
}

exports.update = function(req, res) {
	// load object...

	var id = this._urlPrefix + "/" + req.params.id;

	this._clazz.get({
		id : id
	}, function(err, obj) {

		if(err !== null) {

			if( err instanceof errors.ObjectDoesNotExist) {
				res.statusCode = statusCodes.NOT_FOUND;
				res.end('Not found')
			} else if( err instanceof errors.ValidationError) {
				res.statusCode = statusCodes.BAD_REQUEST;
				res.end(this._renderJson(req, res, obj.validationErrors));
			} else {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error')
			}

		} else {

			// populate object and save it
			if(this._populateObject(obj, req.body, req, res) === true) {

				obj.validate( function(err) {

					if(err !== null) {
						res.statusCode = statusCodes.INTERNAL_ERROR;
						res.end('Internal error');
						return;
					} else if(obj.validationErrors !== null) {
						res.statusCode = statusCodes.BAD_REQUEST;
						res.end(this._renderJson(req, res, obj.validationErrors));
						return;
					}

					// check permissions
					obj.hasPerm('write', req.user, function(err, hasPerm) {

						if(err !== null) {
							res.statusCode = statusCodes.INTERNAL_ERROR;
							res.end('Internal error');
							return;
						} else if(hasPerm === false) {
							res.statusCode = statusCodes.FORBIDDEN;
							res.end('Insufficient privileges');
							return;
						}

						this._preUpdate(obj, req, function(err) {

							if(err !== null) {
								res.statusCode = statusCodes.INTERNAL_ERROR;
								res.end(err.message);
								return;
							}

							obj.save( function(err, obj) {
								/*
								 if(err !== null) {
								 if( err instanceof errors.ObjectDoesNotExist) {
								 res.statusCode = statusCodes.NOT_FOUND;
								 res.end('Not found')
								 } else if( err instanceof errors.ValidationError) {
								 res.statusCode = statusCodes.BAD_REQUEST;
								 res.end(this._renderJson(req, res, obj.validationErrors));

								 } else {
								 res.statusCode = statusCodes.INTERNAL_ERROR;
								 res.end('Internal error')
								 }

								 } else {
								 res.statusCode = statusCodes.ALL_OK;
								 res.end(this._renderJson(req, res, this._serializeObject(obj, req)));
								 }
								 */

								this._postUpdate(err, obj, req, function() {
									if(err === null) {
										res.statusCode = statusCodes.ALL_OK;
										res.end(this._renderJson(req, res, this._serializeObject(obj, req)));
									} else {

										if( err instanceof errors.ObjectAlreadyExists) {
											res.statusCode = statusCodes.DUPLICATE_ENTRY;
											res.end(err.message);

										} else if( err instanceof errors.ValidationError) {
											res.statusCode = statusCodes.BAD_REQUEST;
											res.end(this._renderJson(req, res, obj.validationErrors));

										} else {
											res.statusCode = statusCodes.INTERNAL_ERROR;
											res.end('Internal error')
										}
									}
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}

		}

	}.bind(this));

}
/**
 * this methods is called before del object
 * obj is the obj to delete
 * req is the current request
 * callback take one argument : null if all went done or an InternalError instance with a message to return as response. If an error is passed, create process is stopped
 */
exports._preDel = function(obj, req, callback) {
	callback(null)
}
/**
 * this methods is called after delete object
 * err is an error instance or null
 * obj is the obj to del
 * req is the current request
 * callback take no arguments
 */
exports._postDel = function(err, obj, req, callback) {
	callback();
}

exports.del = function(req, res) {

	var id = this._urlPrefix + "/" + req.params.id;

	// load object...
	this._clazz.get({
		id : id
	}, function(err, obj) {

		if(err !== null) {
			if( err instanceof errors.ObjectDoesNotExist) {
				res.statusCode = statusCodes.NOT_FOUND;
				res.end('Not found')
			} else {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error')
			}

		} else {

			// check permissions
			obj.hasPerm('del', req.user, function(err, hasPerm) {

				if(err !== null) {
					res.statusCode = statusCodes.INTERNAL_ERROR;
					res.end('Internal error');
					return;
				} else if(hasPerm === false) {
					res.statusCode = statusCodes.FORBIDDEN;
					res.end('Insufficient privileges');
					return;
				}

				this._preDel(obj, req, function(err) {

					if(err !== null) {
						res.statusCode = statusCodes.INTERNAL_ERROR;
						res.end(err.message);
						return;
					}

					// and delete it...
					obj.del( function(err, obj) {
						this._postDel(err, obj, req, function() {
							if(err !== null) {
								res.statusCode = statusCodes.INTERNAL_ERROR;
								res.end('Internal error')
							} else {
								res.statusCode = statusCodes.DELETED;
								res.end()
							}
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}

	}.bind(this));
}

exports._checkIntegrity = function(query, req, callback) {

	query.fields = [];
	query.size = 10;

	var q = elasticSearchClient.search(settings.elasticsearch.index, query);
	q.on('data', function(data) {

		var data = JSON.parse(data);

		if(data.status === 404) {
			callback(new errors.IndexDoesNotExist(settings.elasticsearch.index))
			return;
		} else if( typeof (data.error) !== 'undefined') {

			log.warning("Search failed", settings.elasticsearch.index, JSON.stringify(query), JSON.stringify(data))

			callback(new errors.UnknowError(this.id));
			return;
		}

		var output = {
			errors : 'Integrity error',
			documents : []
		};

		var tmp = null;

		if(data.hits.hits.length > 0) {
			for(var i = 0, l = data.hits.hits.length; i < l; i++) {
				output.documents.push(data.hits.hits[i]._id);
			}

			req.res.statusCode = statusCodes.BAD_REQUEST;
			req.res.end(this._renderJson(req, req.res, output))
			return;
		} else {
			callback(null);
		}

	}.bind(this));
	q.exec();
}

exports._getSort = function(sort, req) {

	var formatedSort = [];

	sort.forEach( function(sort) {
		var s = {};

		var way = sort.substr(0, 1), sortField = null;
		if(way == '-' || way == '+') {
			sortField = sort.substr(1);
		} else {
			way = '+';
			sortField = sort;
		}

		if( typeof (this.sortFields[sortField]) === 'undefined') {
			throw new restError.BadRequest("Sort by " + sortField + " is not allowed");
		}
		sortField = this.sortFields[sortField];

		if(sortField == 'distance') {
			if( typeof (req.geoDistanceQuery) === 'undefined') {
				throw new restError.BadRequest("Sort by distance is only availlable when a distance search is performed");
			}

			s._geo_distance = {
				"order" : sort.substr(0, 1) == '-' ? 'desc' : 'asc',
				"unit" : "km"
			}

			s._geo_distance[req.geoDistanceQuery.field] = req.geoDistanceQuery.point;

		} else {

			s[sortField] = {
				"order" : way == '+' ? "asc" : "desc"
			}

		}
		formatedSort.push(s);
	}.bind(this));
	return formatedSort;

}

exports._getDefaultSort = function() {
	return ['_score', {
		"createDate" : {
			"order" : "desc"
		}
	}];

	return [{
		"createDate" : {
			"order" : "desc"
		}
	}]
}

exports._search = function(req, res, query) {

	var from = 0;
	var size = 10;

	if(req.method === 'POST') {
		rawData = req.body;
	} else {
		rawData = req.query;
	}

	try {
		if( typeof (rawData.sort) !== 'undefined') {
			query.sort = this._getSort(rawData.sort.trim().split(/[ ]+/), req);
		} else {
			query.sort = this._getDefaultSort();
		}

	} catch (e) {

		if( e instanceof restError.BadRequest) {
			res.statusCode = statusCodes.BAD_REQUEST;
			res.end(e.message);
		} else {
			res.statusCode = statusCodes.INTERNAL_ERROR;
			res.end('Internal error');
		}

		return;

	}

	if( typeof (rawData.from) !== 'undefined') {
		from = parseInt(rawData.from);
	}

	if( typeof (rawData.size) !== 'undefined') {
		size = parseInt(rawData.size);
	}

	query.size = size;
	query.from = from;

	var attrs = this._clazz.publicAttributes;
	if(req.user.isStaff || req.user.isSuperuser) {
		attrs = this._clazz.staffAttributes;
	}

	this._clazz.search(query, attrs, function(err, result) {
		if(err !== null) {
			if( err instanceof errors.IndexDoesNotExist) {
				res.statusCode = statusCodes.NOT_FOUND;
				res.end('Not found');
			} else {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error')
			}
		} else {
			res.end(this._renderJson(req, res, result));
		}

	}.bind(this));
}

exports._count = function(req, res, query) {

	if( typeof (query.query) !== 'undefined') {
		query = query.query;
	}

	this._clazz.count(query, function(err, result) {
		if(err !== null) {
			if( err instanceof errors.IndexDoesNotExist) {
				res.statusCode = statusCodes.NOT_FOUND;
				res.end('Not found');
			} else {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error')
			}
		} else {
			res.end(this._renderJson(req, res, result));
		}

	}.bind(this));
}

exports._perms = function(req, res, permClass, grantToClass) {

	var applyOnId = '/' + this._type + '/' + req.params.id;

	// load object
	permClass.applyOnClass.get({
		id : applyOnId
	}, function(err, obj) {

		if(err !== null) {
			if( err instanceof errors.ObjectDoesNotExist) {
				res.statusCode = statusCodes.NOT_FOUND;
				res.end('Not found')
			} else {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error')
			}
			return;
		}

		// check read perm
		obj.hasPerm('read', req.user, function(err, hasPerm) {

			if(err !== null) {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error');
				return;
			} else if(hasPerm === false) {
				res.statusCode = statusCodes.FORBIDDEN;
				res.end('Insufficient privileges');
				return;
			}

			// retrieve perms

			var q = {
				query : {
					term : {
						applyOn : applyOnId
					}
				}
			};

			var tasks = [

			function(callback) {
				permClass.search(q, ["grantTo", "createDate", "updateDate"], function(err, result) {

					if(err !== null) {
						callback(err)
					} else {
						callback(null, result);
					}

				});
			}];

			if(req.query.include_docs == true || ( typeof (req.query.include_docs) !== 'undefined' && req.query.include_docs.toLowerCase() == 'true')) {
				tasks.push(function(result, callback) {

					var ids = [];
					var byGrantTo = {};

					for(var i = 0, l = result.rows.length; i < l; i++) {
						ids.push(result.rows[i].grantTo)
						byGrantTo[result.rows[i].grantTo] = result.rows[i];
					}

					var q = {
						size : 10000,
						query : {
							ids : {
								values : ids
							}
						}
					}

					var attrs = grantToClass.publicAttributes;
					if(req.user.isStaff || req.user.isSuperuser) {
						attrs = grantToClass.staffAttributes;
					}

					grantToClass.search(q, attrs, function(err, objects) {

						if(err !== null) {
							callback(err);
						} else {

							for(var i = 0, l = objects.rows.length; i < l; i++) {
								byGrantTo[objects.rows[i].id].grantTo = objects.rows[i];
							}
							callback(null, result);
						}
					});
				});
			}

			async.waterfall(tasks, function(err, result) {
				if(err !== null) {
					if( err instanceof errors.IndexDoesNotExist) {
						res.statusCode = statusCodes.NOT_FOUND;
						res.end('Not found');
					} else {
						res.statusCode = statusCodes.INTERNAL_ERROR;
						res.end('Internal error')
					}
				} else {
					res.end(this._renderJson(req, res, result));
				}
			}.bind(this));

		}.bind(this))

	}.bind(this))

}
/**
 * Return a function to use with async to delete perms when object was deleted
 * @obj : the object that was deleted
 * @id : the permission id to delete
 * @strClass: the permission class name
 */
exports._getPermDeleteMethod = function(obj, id, strClass) {

	return function(callback) {
		models.perms[strClass].get({
			id : id
		}, function(err, perm) {

			if(err === null) {

				perm.del(function(err, perm) {

					if(err !== null && !( err instanceof models.errors.ObjectDoesNotExist)) {
						log.warning('_postDel: error while delete ' + strClass, id, obj.id)
					}

					callback();
				}, false);
			} else if( err instanceof models.errors.ObjectDoesNotExist) {
				callback(null);
			} else {
				log.warning('_postDel: error while get ' + strClass + ' to delete it', id, obj.id)
				callback(null)
			}

		});
	}
}