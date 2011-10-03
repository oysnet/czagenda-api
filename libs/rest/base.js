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

	this._urlPrefix = '/' + this._type;
	this.__initialized = false;
	
	
	this._allowedMethods = ['put', 'post', 'get', 'del'];
		
	this._urls = {
		get : {},
		put : {},
		post : {},
		del : {}
	}
}


RestBase.prototype.addurls = function(urls) {
	for(method in urls) {
		var sub_map = urls[method];
		for(url in sub_map) {
			this._urls[method][url] = sub_map[url];
		}
	}
}

RestBase.prototype._urlPrefix = null;
RestBase.prototype._allowedMethods = null;

RestBase.prototype._initServer = function() {
	
	if (this.__initialized === true) {
		throw new Error('Server already initilized');
	}
	
	this.__initialized = true;
	
	var server = this._server;
	
	this._urls.get[this._urlPrefix] = this.list;
	this._urls.get[this._urlPrefix + '/count'] = this.count;
	this._urls.get[this._urlPrefix + '/:id'] = this.read;

	this._urls.post[this._urlPrefix] = this.create;

	this._urls.put[this._urlPrefix + '/:id'] = this.update;
	this._urls.del[this._urlPrefix + '/:id'] = this.del;
	
	
	for(method in this._urls) {
		if (this._allowedMethods.indexOf(method) !== -1) {
			var sub_map = this._urls[method];
			for(url in sub_map) {
				log.debug('REST url added: ' + method.toUpperCase() + ' '  + url);
				server[method](url, sub_map[url].bind(this));
			}
		}
	}

}
/**
 * populate an object with other object attributes
 */
RestBase.prototype._populateObject = function(obj, data) {
	for(k in data) {
		obj[k] = data[k];
	}

}
/**
 * Return a serializable object that contains only attributes listed in keys
 */
RestBase.prototype._serializeObject = function(obj) {
	return obj.serialize(obj.constructor.publicAttributes);
}

RestBase.prototype._getQueryFromRequest = function (req, callback) {
	callback(null, {query:{match_all:{}}});
}


RestBase.prototype.list = function(req, res) {
	
	var query = req.query;

	if( typeof (query.skip) !== 'undefined') {
		query.skip = parseInt(query.skip);
	}

	if( typeof (query.limit) !== 'undefined') {
		query.limit = parseInt(query.limit);
	}
	
	this._getQueryFromRequest(req, function (err, query) {
		
		
		
		if (err !== null) {
			
			if (err instanceof restError.BadRequest) {
				res.statusCode = statusCode.BAD_REQUEST;
				res.end(err.message)	
			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}
			
		} else {
			this._search(req, res, query);		
		}
	}.bind(this));
}

RestBase.prototype.count = function(req, res) {
	

	var query = {
		match_all : { }
	}

	this._count(req, res, query);

}


RestBase.prototype.read = function(req, res) {

	this._clazz.get({
		id : req.url.split('?')[0]
	}, function( err, obj) {

		if(err !== null) {
			if( err instanceof errors.ObjectDoesNotExist) {
				res.statusCode = statusCode.NOT_FOUND;
				res.end('Not found')
			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}
		} else {
			res.statusCode = statusCode.ALL_OK;
			res.end(this._renderJson(req, res, this._serializeObject(obj)));
		}

	}.bind(this));
}

RestBase.prototype.create = function(req, res) {

	var data = req.body;

	var obj = new this._clazz;
	this._populateObject(obj, data)
	
	
	//console.log('request data', data);
		
	obj.save( function( err, obj) {
		
		if(err === null) {
			res.statusCode = statusCode.CREATED;
			res.end(this._renderJson(req, res, this._serializeObject(obj)));
		} else {

			// @TODO : typer les erreurs
			if( err instanceof errors.ObjectAlreadyExists) {
				res.statusCode = statusCode.DUPLICATE_ENTRY;
				res.end(err.message);

			} else if( err instanceof errors.ValidationError) {
				res.statusCode = statusCode.BAD_REQUEST;
				res.end(this._renderJson(req, res, obj.validationErrors));

			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}

		}

	}.bind(this));

}

RestBase.prototype.update = function(req, res) {
	// load object...

	this._clazz.get({
		id : req.url.split('?')[0]
	}, function( err, obj) {

		if(err !== null) {

			if( err instanceof errors.ObjectDoesNotExist) {
				res.statusCode = statusCode.NOT_FOUND;
				res.end('Not found')
			} else if( err instanceof errors.ValidationError) {
				res.statusCode = statusCode.BAD_REQUEST;
				res.end(this._renderJson(req, res, obj.validationErrors));

			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}

		} else {
			this._populateObject(obj, req.body)

			obj.save( function( err, obj) {

				if(err !== null) {

					if( err instanceof errors.ObjectDoesNotExist) {
						res.statusCode = statusCode.NOT_FOUND;
						res.end('Not found')
					} else if( err instanceof errors.ValidationError) {
						res.statusCode = statusCode.BAD_REQUEST;
						res.end(this._renderJson(req, res, obj.validationErrors));

					} else {
						res.statusCode = statusCode.INTERNAL_ERROR;
						res.end('Internal error')
					}

				} else {

					res.statusCode = statusCode.ALL_OK;
					res.end(this._renderJson(req, res, this._serializeObject(obj)));
				}

			}.bind(this));

		}

	}.bind(this))
}

RestBase.prototype.del = function(req, res) {

	// load object...
	this._clazz.get({
		id : req.url.split('?')[0]
	}, function(err, obj) {

		if(err !== null) {
			if( err instanceof errors.ObjectDoesNotExist) {
				res.statusCode = statusCode.NOT_FOUND;
				res.end('Not found')
			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}

		} else {

			// and delete it...
			obj.del( function( err, obj) {

				if(err !== null) {
					res.statusCode = statusCode.INTERNAL_ERROR;
					res.end('Internal error')
				} else {

					res.statusCode = statusCode.DELETED;
					res.end()
				}

			}.bind(this))
		}

	}.bind(this))
}

RestBase.prototype._search = function(req, res, query) {
	
	
	
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
	
	this._clazz.search(query, attrs, function(err, result) {
		if(err !== null) {
			if( err instanceof errors.IndexDoesNotExist) {
				res.statusCode = statusCode.NOT_FOUND;
				res.end('Not found');
			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}
		} else {
			res.end(this._renderJson( req, res, result));
		}

	}.bind(this));
}


RestBase.prototype._count = function(req, res, query) {

	this._clazz.count(query, function(err, result) {
		if(err !== null) {
			if( err instanceof errors.IndexDoesNotExist) {
				res.statusCode = statusCode.NOT_FOUND;
				res.end('Not found');
			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}
		} else {
			res.end(this._renderJson( req, res, result));
		}

	}.bind(this));
}


RestBase.prototype._renderJson = function (req, res, data) {
	
	res.charset = 'UTF-8';
	res.header('Content-Type', 'application/json');
	
	if (req.query.pretty == true || ( typeof (req.query.pretty) !== 'undefined' && req.query.pretty.toLowerCase() == 'true')) {
		return JSON.stringify(data, null, 2);
	} else {
		return JSON.stringify(data);
	}
	
	
	
}

RestBase.prototype._perms = function(req, res, permClass, grantToClass) {

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

			grantToClass.search(q, grantToClass.publicAttributes,function(err, objects) {

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