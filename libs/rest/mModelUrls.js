var log = require('czagenda-log').from(__filename);
var statusCodes = require('../statusCodes');
var errors = require('../../models').errors;
var async = require('async');

exports.populateModelUrls = function () {
	this._urls.get[this._urlPrefix] = { middleware : [], fn : this.list};
	this._urls.get[this._urlPrefix + '/_count'] =  { middleware : [],  fn :this.count};
	this._urls.get[this._urlPrefix + '/:id'] =  { middleware : [], fn :this.read};

	this._urls.post[this._urlPrefix] =  { middleware : [], fn :this.create};

	this._urls.put[this._urlPrefix + '/:id'] =  { middleware : [], fn :this.update};
	this._urls.del[this._urlPrefix + '/:id'] =  { middleware : [], fn :this.del};
}

/**
 * populate an object with other object attributes
 */
exports._populateObject = function(obj, data, req, res) {

	log.notice("[TODO] exports._populateObject Supprimer oauthKeys");

	var oauthKeys = ['oauth_nonce', 'oauth_timestamp', 'oauth_consumer_key', 'oauth_signature_method', 'oauth_version', 'oauth_token', 'oauth_signature'];
	
	var allowedKeys = obj.constructor.publicWriteAttributes;
	
	if (req.user.isStaff || req.user.isSuperuser) {
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
			errors : ["Bad attributes: " + wrongKeys.join(' ,') ]
			
		}));
		return false;
	}
}

/**
 * Return a serializable object that contains only attributes listed in keys
 */
exports._serializeObject = function(obj, req) {
	
	if (typeof(req.user) === 'undefined') {
		log.warning('_serializeObject : req is undefined ')
	}
	
	var keys = obj.constructor.publicAttributes;
	if (req.user.isStaff || req.user.isSuperuser) {
		keys =obj.constructor.staffAttributes;
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
			this._search(req, res, query);
		}
	}.bind(this));
}

exports.count = function(req, res) {

	var query = {
		match_all : { }
	}

	this._count(req, res, query);

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
			res.statusCode = statusCodes.ALL_OK;
			res.end(this._renderJson(req, res, this._serializeObject(obj, req)));
		}

	}.bind(this));
}

exports.create = function(req, res) {

	var data = req.body;
	
	var obj = new this._clazz;
	if(this._populateObject(obj, data, req, res) === true) {

		obj.save( function(err, obj) {

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
	}
}

exports.update = function(req, res) {
	// load object...
	
	this._clazz.get({
		id : this._urlPrefix + "/" + req.params.id 
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
			if(this._populateObject(obj, req.body, req, res) === true) {

				obj.save( function(err, obj) {

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

				}.bind(this));
			}

		}

	}.bind(this))
}

exports.del = function(req, res) {

	// load object...
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

			// and delete it...
			obj.del( function(err, obj) {

				if(err !== null) {
					res.statusCode = statusCodes.INTERNAL_ERROR;
					res.end('Internal error')
				} else {

					res.statusCode = statusCodes.DELETED;
					res.end()
				}

			}.bind(this))
		}

	}.bind(this))
}

exports._search = function(req, res, query) {

	var qs = req.query;

	if( typeof (qs.limit) !== 'undefined') {
		query.size = qs.limit;
	} else {
		query.size = 10;
	}

	if( typeof (qs.skip) !== 'undefined') {
		query.from = qs.skip;
	} else {
		query.from = 0;
	}

	if( typeof (qs['sort']) !== 'undefined') {
		query['sort'] = [{}];
		query['sort'][0][qs['sort']] = {};
	}

	var attrs = this._clazz.publicAttributes;
	if (req.user.isStaff || req.user.isSuperuser) {
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

	var q = {
		query : {
			term : {
				applyOn : '/' + this._type + '/' + req.params.id
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
			if (req.user.isStaff || req.user.isSuperuser) {
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
}