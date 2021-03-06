var settings = require('../settings.js');
var crypto = require('crypto');
var errors = require('./errors.js');
var ElasticSearchClient = require('elasticsearchclient');
var elasticSearchClient = new ElasticSearchClient(settings.elasticsearch);
var log = require('czagenda-log').from(__filename);
var utils = require('../libs/utils.js');
var redis = require('../libs/redis-client');

var readStats = require('../libs/stats.js').readStats;
var writeStats = require('../libs/stats.js').writeStats;
var deleteStats = require('../libs/stats.js').deleteStats;

function Base(type) {

	// system attributs
	this._rev = null;
	this._data = {};
	this._type = type;
	this._index = settings.elasticsearch.index;
	this._hash = null;
	
	this.initialData = null;
	
	this.id = null;

	// will contain validations errors
	this.validationErrors = null;

	this._attributs.createDate = null;
	this._attributs.updateDate = null;

	for(key in this._attributs) {
		this[key] = this._attributs[key];
	}

}

Base.publicAttributes = ['id', 'createDate', 'updateDate']
Base.staffAttributes = []


/**
 * Verifiy permissions
 * perms : create, read, write or del
 * user : an object containing 'id', 'isStaff', 'isSuperuser', 'isActive' and 'groups'
 */
Base.prototype.hasPerm = function (perm, user, callback) {
	callback(null, true);
}

Base.prototype.hasWritePerm = function (user) {
	return 	user.isStaff === true ||
			user.isSuperuser === true ||
			this.computedWriteUsers.indexOf(user.id) !== -1 || this.computedWriteUsers.indexOf('/user/all') !== -1 || this.computedWriteGroups.indexOf('/group/all') !== -1 ||
			utils.haveOneCommonValue(this.computedWriteGroups, user.groups) === true
}

Base.prototype.hasReadPerm = function (user) {
	return 	user.isStaff === true ||
			user.isSuperuser === true ||
			this.computedReadUsers.indexOf(user.id) !== -1 || this.computedReadUsers.indexOf('/user/all') !== -1 || this.computedReadGroups.indexOf('/group/all') !== -1 ||
			utils.haveOneCommonValue(this.computedReadGroups, user.groups) === true
}

Base.prototype.getIndex = function() {
	return this._index;
}

Base.prototype.getType = function() {
	return this._type;
}
/**
 * populate instance from object
 */
Base.prototype.populate = function(doc) {

	if(doc['_type'] !== this._type) {
		throw Error('Doc type mismatch');
	}
	//this._data = doc;
	this.id = doc['_id'];
	this._rev = doc['_version'];
	this._hash = doc._source.hash;

	for(key in this._attributs) {
		if( typeof (doc._source[key]) !== 'undefined') {
			this[key] = doc._source[key];
		}

	}
}
/**
 * generate UUID for document that have not meaningful url
 */
Base.prototype._generateUUID = function(doc) {
	h = crypto.createHash('md5')
	h.update(this._type);
	h.update(String(Math.random()))
	return h.digest('hex')
}
/**
 * This method is called before save but after _data attribute was populated.
 * Must be override or not.
 * if an error is provided as callback first argument, save process is stopped.
 */
Base.prototype._preSave = function(callback) {
	callback(null);
}
/**
 * This method is called after save was done.
 * err : null if success or the error that happened
 * next : call this function to continue process
 */
Base.prototype._postSave = function(err, next) {
	next();
}
/**
 * This method is called before deleting content, if an error is provided as callback first argument, deletion process is stopped.
 */
Base.prototype._preDel = function(callback) {
	callback(null);
}
/**
 * This method is called after deletion was done.
 * err : null if success or the error that happened
 * next : call this function to continue process
 */
Base.prototype._postDel = function(err, next) {
	next();
}

/**
 * This method is responsible of data validation.
 * Must be override or not to implement validation on subclasses
 */
Base.prototype._validate = function(callback) {
	callback(null);
}

/**
 * To ignore the validation process at save time
 */
Base.prototype.setValidationDone = function () {
	this.__validationDone = true;
}

Base.prototype.__validationDone = false;
/**
 * This method is the external way to invoke validation
 */
Base.prototype.validate = function(callback) {
	
	this._validate(callback);
	this.__validationDone = true;
	
}

/**
 * This method is a wrapper that invoke validation only if it was not already invoked
 */
Base.prototype.__validate = function(callback) {
	
	if (this.__validationDone === false) {
		this.__validationDone = true;
		this._validate(callback);
	}	else {
		callback(null);
	}
	
}


/**
 * Instance hash computing must be done here.
 */
Base.prototype._generateHash = function() {
	throw new Error('Object _generateHash method must be override')
}
/**
 * return instance id. Override it to suit object type requirements
 */
Base.prototype._generateId = function(doc) {
	return '/' + this._type + '/' + this._generateUUID();
}

Base.prototype.__rawId = null;

Base.prototype.getId = function () {
	
	if (this.id !== null) {
		return this.id;
		
	} 
	
	if (this.__rawId === null) {
		this.__rawId = this._generateId();
	}
	
	return this.__rawId;
}


Base.prototype.__cachedAttributes = null;

/**
 * Return a list of instance public attributes
 */
Base.prototype.getAttributs = function(doc) {

	if(this.__cachedAttributes === null) {
		var lst = [];
		for(var k in this._attributs) {
			lst.push(k);
		}
		this.__cachedAttributes = lst;
	}

	return this.__cachedAttributes;
}
/**
 * Return an object containing instance public attributes
 */
Base.prototype.serialize = function(keys) {

	return Base.serialize(this, keys);
}
/**
 * Delete current instance
 */
Base.prototype.del = function(callback) {

	if(this._hash == null) {
		callback(null);
	} else {
		var self = this;

		this._preDel( function(err) {

			// if an error happened, stop the process
			if(err !== null) {
				callback(err);
				return;
			}

			var q = elasticSearchClient.deleteDocument(this._index, this._type, encodeURIComponent(this.id));

			q.on('data', function(data) {

				var data = JSON.parse(data);

				if(data.ok === true) {
					if(data.found === true) {

						this._postDel(null, function() {
							callback(null, this);
						}.bind(this));

						redis.redisClient.del(this._hash, this.id, function(err, success) {

							if(err != null || success === 0) {
								log.critical('REDIS: error on del keys ', this.id, this._hash, success, err)
							} else {
								log.debug('REDIS: deleted keys ', this.id, this._hash)
							}

						}.bind(this))

					} else {

						var err = new errors.ObjectDoesNotExist(this.id);
						this._postDel(err, function() {
							callback(err, this);
						}.bind(this));

					}
				} else {
					var err = new errors.UnknowError(this.id);
					this._postDel(err, function() {
						callback(err, this);
					}.bind(this));
				}

			}.bind(this));
			q.exec();

		}.bind(this));
	}
}
/**
 * populate _data attribute
 */
Base.prototype.__prepareData = function(transparent) {

	if(this._hash !== null) {
		this._data.id = this.id;
		this._data.hash = this._hash;
	} else {
		this._data.id = this.getId();
	}

	this._data.type = this._type;
		
	if(this._rev === null) {
		this.createDate = (new Date()).toISOString();
		this.updateDate = this.createDate;
		
	} else if (transparent === false) {
		this.updateDate = (new Date()).toISOString();
	}

	for(key in this._attributs) {
		this._data[key] = this[key];
	}

}
/**
 * Save instance
 */
Base.prototype.save = function(callback, transparent) {
	
	// populate _data
	this.__prepareData(transparent === true);

	log.debug('data prepared', this._data);

	// validate datas
	this.__validate( function(err) {

		if(err !== null) {
			log.critical('error during validation', this._type, this._data.id, err);
			this._postSave(err, function() {
				callback(err, this);
			}.bind(this));
			return;
		}

		if(this.validationErrors !== null) {
			var err = new errors.ValidationError();
			this._postSave(err, function() {
				callback(err, this);
			}.bind(this));
			return;
		}

		if(this._hash === null) {
			this._generateHash();
			log.debug('hash computed for new object', this._type, this._data.id);
		}

		// do some stuff in inherited levels
		this._preSave( function(err) {
			
			if (err !== null) {
				callback(err, this);
				return;	
			}
			
			if(this._hash === null) {
				this._checkHashExistsInDb( function(err) {
					if(err === null) {
						this._dbSave(callback)
					} else {

						if( err instanceof errors.ObjectAlreadyExists) {
							this._postSave(err, function() {
								callback(err, this);
							}.bind(this));

						} else {
							var err = new errors.UnknowError();
							this._postSave(err, function() {
								callback(err, this);
							}.bind(this));
						}

					}
				}.bind(this));
			} else {
				this._dbSave(callback)
			}

		}.bind(this));

	}.bind(this));
}
/**
 * Save object in database
 */
Base.prototype._dbSave = function(callback) {

	log.debug('saving object', this._type, this._data.id);
	
	// set id on instance because elasticsearchclient will delete it in this._data.id
	this.id = this._data.id;
	
	// encode id since elasticsearch does not support / in id
	this._data.id = encodeURIComponent(this._data.id);

	

	var q = elasticSearchClient.index(this._index, this._type, this._data);
	q.on('data', function(data) {

		var data = JSON.parse(data);
		if( typeof (data.error) !== 'undefined') {

			// call _postSave with success false
			var err = new errors.UnknowError();
			this._postSave(err, function() {
				callback(err);
			}.bind(this));

			log.debug('save failed, redis error', data.error);

			// if it is a new object
			if(this._hash === null) {
				log.debug('removing keys in redis due to new object failed save', this._type, this._data.id, this._data.hash);
				redis.redisClient.del(this._data.hash, this._data.id, function(err, success) {

					if(err != null || success === 0) {
						log.critical('REDIS: error on del keys ', this.id, this._hash, err)
					}

				}.bind(this))
			}

		} else {

			// call _postSave with success true
			this._postSave(null, function() {
				// reload instance before send response
				Base.loadObject({
					id : data._id
				}, this, function(err, res) {
					callback(err, res);
				}.bind(this));
			}.bind(this));

		}
	}.bind(this));
	q.exec();
}
/**
 * Verifiy if an object already exists with the current instance computed hash (this._data.hash)
 * return an instance of errors.ObjectAlreadyExists in callback if an object is found
 */
Base.prototype._checkHashExistsInDb = function(callback) {

	// try to set id
	// try to set hash with expiration

	log.debug('_checkHashExistsInDb', this._type, this._data.id, this._data.hash);

	redis.redisClient.msetnx(this._data.id, null, this._data.hash, null, function(err, success) {
		if(err !== null) {
			callback(new errors.UnknowError(), this);
			log.critical("REDIS error on msetnx", this._data.id, this._data.hash, err);
		} else {

			// even if all keys didn't be create
			redis.redisClient.expire(this._data.hash, settings.redis.keyTTL, function(err, success) {

				if(err != null || success === 0) {
					log.warning('REDIS: error on set expire to ' + this._data.hash, err)
				}

			}.bind(this));

			if(success === 0) {
				callback(new errors.ObjectAlreadyExists(this._data.id), this);
				log.notice('ObjectAlreadyExists', this._data.id);
			} else {
				callback(null);
			}

		}

	}.bind(this))
}

Base.prototype.addGlobalValidationError = function(message) {

	if(this.validationErrors === null) {
		this.validationErrors = {
			items : {},
			errors : []
		};
	}

	this.validationErrors.errors.push(message);

}

Base.prototype.addValidationError = function(attr, message) {

	if(this.validationErrors === null) {
		this.validationErrors = {
			items : {},
			errors : []
		};
	}

	if( typeof (this.validationErrors.items[attr]) === 'undefined') {
		this.validationErrors.items[attr] = [];
	}
	
	if (this.validationErrors.items[attr].indexOf(message) === -1) {
		this.validationErrors.items[attr].push(message);
	}
	

}

Base.prototype.parseJSVErrors = function(errors) {

	var _errors = {};

	for(var i = 0, l = errors.length; i < l; i++) {
		if(errors[i].attribute === "additionalProperties") {
			this.addGlobalValidationError(errors[i].message)
		} else {
			this.addValidationError(this.getJSVErrorAttribute(errors[i].uri.split('#')[1]), this._getMessageFromJSVError(errors[i]));
		}
	}
}

Base.prototype.getJSVErrorAttribute = function(attr) {
	return "/" + this._type + attr;
}

Base.prototype._getMessageFromJSVError = function(error) {
	if(error.attribute === 'type' && error.message === "Instance is not a required type") {
		if (typeof(error.details[0]) === 'object') {
			return "bad value";
		} else {
			return "a " + error.details[0] + " is required";	
		}
		
	} else {
		return error.message
	}
}

Base.prototype.validateString = function(attr, nullable, min, max) {
			
	var value = this[attr];
	if( typeof (value) !== 'string') {
		if(!(nullable === true && value === null)) {
			this.addValidationError(attr, 'a string is required');
			return false;
		}
	}

	if(value !== null) {
		if(min !== null && value.length < min) {
			this.addValidationError(attr, 'string length must be greater than ' + min);
			return false;
		} else if(max !== null && value.length > max) {
			this.addValidationError(attr, 'string length must be lower than ' + max);
			return false;
		}
	}
	
	return true;
}

Base.prototype.validateBoolean = function(attr, nullable) {

	var value = this[attr];
	if( typeof (value) !== 'boolean') {
		if(!(nullable === true && value === null)) {
			this.addValidationError(attr, 'a boolean is required');
			return false;
		}
	}
	return true;
}

Base.prototype.validateChoice = function(attr, choices) {

	var value = this[attr];
	if(choices.indexOf(value) === -1) {
		this.addValidationError(attr, 'choices are: ' + choices.join(' ,'));
		return false;
	}
	return true;
}

Base.prototype.validateNotEmptyObject = function(attr) {

	var value = this[attr];

	

	var keys = [];

	for(k in value) {
		keys.push(k)
	}

	if(value === null || keys.length === 0) {
		this.addValidationError(attr, 'empty object not allowed');
		return false;
	}
	
	return true;

}

Base.prototype.validateEmail = function(attr) {
	var value = this[attr];

	if( typeof (value) !== 'string' || !(new RegExp('^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$', 'i')).test(value)) {
		this.addValidationError(attr, 'an email is required');
		return false;
	}
	
	return true;
}

Base.prototype.validateRegexp = function(attr, regexp, nullable) {
	var value = this[attr];
	if( typeof (value) !== 'string') {
		if(!(nullable === true && value === null)) {
			this.addValidationError(attr, 'must match regexp: ' + regexp);
			return false;
		}
	}

	if(value !== null) {
		if(!(new RegExp(regexp)).test(value)) {
			this.addValidationError(attr, 'must match regexp: ' + regexp);
			return false;
		}
	}
	
	return true;
}


Base.prototype.validateExists = function(keys, callback) {
	
	var multi = redis.redisClient.multi();
	
	keys.forEach(function (k) {
		var d = this;		
		k.split('.').forEach(function (_k) {
			d = d[_k];
		});
		
		multi.exists(d);
	}.bind(this));
	
	multi.exec(function (err, replies) {
		
		if (err !== null) {
			callback(err);
			log.critical("Base.prototype.validateExists", keys.join(', '), JSON.stringify(err));
			return;
		}
		
		for (var i = 0, l = replies.length; i<l;i++) {
			if (replies[i] === 0) {
				this.addValidationError(keys[i], 'Object doesn\'t exist');
			}
		}
		
		callback(null);
				
	}.bind(this));
}

Base.loadObject = function(options, obj, callback) {

	if( typeof (options) === 'undefined') {
		throw Error('not yet implemented');
	}

	if( typeof (options.id) === 'undefined') {
		throw Error('not yet implemented');
	}

	var q = elasticSearchClient.get(obj.getIndex(), obj.getType(), encodeURIComponent(options.id));

	q.on('data', function(data) {

		var data = JSON.parse(data);

		if(data.exists === false || data.status === 404) {
			callback(new errors.ObjectDoesNotExist(data._id), null);
		} else {
			obj.populate(data);
			callback(null, obj);
		}

	}.bind(this))
	q.exec();

}

Base.serialize = function(obj, attrs) {
	var dict = {};

	attrs.forEach(function(attr) {
		dict[attr] = obj[attr];
	})
	return dict;
}

Base.get = function(options, clazz, callback) {
	Base.loadObject(options, new clazz(), callback);
}

Base.count = function(query, index, type, callback) {

	if( typeof (query) === 'undefined' || query === null) {
		query = {
			match_all : {}
		};
	}
	
	log.debug('Base.count', index, type, JSON.stringify(query));
	
	var q = elasticSearchClient.count(index, type, query);
	q.on('data', function(data) {

		var data = JSON.parse(data);

		if(data.status === 404) {
			callback(new errors.IndexDoesNotExist(index))
			return;
		} else if( typeof (data.error) !== 'undefined') {
			
			log.warning('Base.count', index, type, query, data)
			
			callback(new errors.UnknowError(this.id));
			return;
		}

		var output = {
			count : data.count
		}

		callback(null, output);
	}.bind(this));
	q.exec();

}

Base.search = function(query, index, type, attrs, clazz, callback) {

	var fieldsInQuery = true;
	if(clazz.metaAttributes instanceof Array) {

		for(var i = 0, l = clazz.metaAttributes.length; i < l; i++) {
			if(attrs.indexOf(clazz.metaAttributes[i]) !== -1) {
				fieldsInQuery = false;
				break;
			}
		}
	}

	if(fieldsInQuery === true) {
		query.fields = attrs;
	}

	if( typeof (query.from) === 'undefined') {
		query.from = 0;
	}

	if( typeof (query.size) === 'undefined') {
		query.size = 10;
	}
	
	log.debug('Base.search', index, type, JSON.stringify(query));
	
	var q = elasticSearchClient.search(index, type, query);
	q.on('data', function(data) {

		var data = JSON.parse(data);

		if(data.status === 404) {
			callback(new errors.IndexDoesNotExist(index))
			return;
		} else if( typeof (data.error) !== 'undefined') {
			
			log.warning("Search failed",index, type, JSON.stringify(query), JSON.stringify(data) )
			
			callback(new errors.UnknowError(this.id));
			return;
		}

		var output = {
			total_rows : data.hits.total,
			offset : query.from,
			rows : []
		}

		var tmp = null;

		if(data.hits.hits.length > 0) {

			if(fieldsInQuery === true) {
				for(var i = 0, l = data.hits.hits.length; i < l; i++) {
					tmp = data.hits.hits[i]['fields'];
					tmp.id = data.hits.hits[i]._id;
					output.rows.push(tmp);
				}
			} else {
				for(var i = 0, l = data.hits.hits.length; i < l; i++) {
					tmp = Base.serialize(data.hits.hits[i]['_source'], attrs);
					tmp.id = data.hits.hits[i]._id;
					output.rows.push(tmp);
				}
			}

		}

		callback(null, output);
	}.bind(this));
	q.exec();

}


Base.facets = function(query, index, type,  clazz, callback) {

	query.fields = [];
	log.debug('Base.facets', index, type, JSON.stringify(query));
	
	var q = elasticSearchClient.search(index, type, query);
	q.on('data', function(data) {

		var data = JSON.parse(data);

		if(data.status === 404) {
			callback(new errors.IndexDoesNotExist(index))
			return;
		} else if( typeof (data.error) !== 'undefined') {
			
			log.warning("Faceting failed",index, type, JSON.stringify(query), JSON.stringify(data) )
			
			callback(new errors.UnknowError(this.id));
			return;
		}

		var output = {
			total_rows : data.hits.total,			
			facets : {}
		}

		
		for (facet in data.facets) {
			
			var key = null;
			var values = null;
			
			switch(data.facets[facet]._type) {
				case 'date_histogram':
					output.facets[facet] = {values : []};
					key = 'time';
					values = data.facets[facet].entries;
					break;
					
				case 'terms':
					output.facets[facet] = {values : [], missing:data.facets[facet].missing, total:data.facets[facet].total, other:data.facets[facet].other};
					key = 'term';
					values = data.facets[facet].terms;
					break;
			}
			
			if (key !== null) {
				for(var i = 0, l = values.length; i<l;i++) {
					output.facets[facet] .values.push({value : values[i][key], count : values[i].count})
				}
			}
		}
		
		callback(null, output);
	}.bind(this));
	q.exec();

}

exports.Base = Base;
