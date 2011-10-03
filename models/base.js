
var settings = require('../settings.js');
var crypto = require('crypto');
var errors = require('./errors.js');
var ElasticSearchClient = require('elasticsearchclient');
var elasticSearchClient = new ElasticSearchClient(settings.elasticsearch);
var log = require('czagenda-log').from(__filename);

var redisClient = require('../libs/redis-client');

var readStats = require('../libs/stats.js').readStats;
var writeStats = require('../libs/stats.js').writeStats;
var deleteStats = require('../libs/stats.js').deleteStats;


function Base(type) {

	// system attributs
	this._rev = null;
	this._data = {};
	this._type = type;
	this._index = 'agenda';
	this._hash = null;
	
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
	this._data = doc;
	this.id = doc['_id'];
	this._rev = doc['_version'];
	this._hash = doc._source.hash;

	for(key in this._attributs) {
		this[key] = doc._source[key];
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
 */
Base.prototype._preSave = function() {}

/**
 * This method is responsible of data validation.
 * Must be override or not.
 */
Base.prototype._validate = function() {}


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
	return '/'+ this._type +'/' + this._generateUUID();
}

/**
 * Return a list of instance public attributes 
 */
Base.prototype.getAttributs = function(doc) {

	var lst = [];
	for(var k in this._attributs) {
		lst.push(k);
	}
	return lst;
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

		var q = elasticSearchClient.deleteDocument(this._index, this._type, encodeURIComponent(this.id));

		q.on('data', function(data) {
			
			var data = JSON.parse(data);

			if(data.ok === true) {
				if(data.found === true) {
					callback(null, this);
					
					redisClient.del(this._hash, this.id, function (err, success) {
					
						if (err != null || success === 0) {
							log.warning('REDIS: error on del keys ', this.id, this._hash, err)
						} 
						
					}.bind(this))
					
				} else {
					callback(new errors.ObjectDoesNotExist(this.id), this);
				}
			} else {
				callback(new errors.UnknowError(this.id), this);
			}

			
		}.bind(this));
		
		q.exec();			
		


	}
}



/**
 * populate _data attribute
 */
Base.prototype.__prepareData = function () {

	if(this._hash !== null) {
		this._data.id = this.id;
		this._data.hash = this._hash;
	} else {
		this._data.id = this._generateId();
	}
	
	this._data.type = this._type;

	this.updateDate = (new Date()).toISOString();
	if(this._rev === null) {
		this.createDate = this.updateDate;
	}

	for(key in this._attributs) {
		this._data[key] = this[key];
	}
	
	
}

/**
 * Save instance
 */
Base.prototype.save = function(callback) {
	
	// populate _data
	this.__prepareData();
	
	// validate datas
	this._validate();	
	
	if (this._hash === null) {
		this._generateHash();
	}
	
	
	if (this.validationErrors !== null) {
		callback(new errors.ValidationError(), this);
		return;
	}
	
	// do some stuff in inherited levels
	this._preSave();
	
	if (this._hash === null) {
		this._checkHashExistsInDb(function (err) {
			if (err === null) {
				this._dbSave(callback)
			} else if (err instanceof errors.ObjectAlreadyExists)  {
				callback(err, this);
			} else {
				callback(new errors.UnknowError(), this);
			}
		}.bind(this));
	} else {
		this._dbSave(callback)
	}
	
}

/**
 * Verifiy if an object already exists with the current instance computed hash (this._data.hash)
 * return an instance of errors.ObjectAlreadyExists in callback if an object is found
 */
Base.prototype._checkHashExistsInDb = function (callback) {
	
	// try to set id
	// try to set hash with expiration
	
	redisClient.msetnx(this._data.id, null, this._data.hash, null, function (err, success) {
			if (err !== null) {
				callback(new errors.UnknowError(), this);
				log.critical("REDIS error on msetnx", this._data.id,this._data.hash,  err);
			} else if (success === 0) {
				callback(new errors.ObjectAlreadyExists(this._data.id), this);
				log.notice('ObjectAlreadyExists', this._data.id);
			} else {
				
				redisClient.expire(this._data.hash, settings.redis.keyTTL, function (err, success) {
					
					if (err != null || success === 0) {
						log.warning('REDIS: error on set expire to ' + this._data.hash, err)
					} 
					
				}.bind(this));
				
				callback(null);
			}
			
	}.bind(this))
}

/**
 * Save object in database
 */
Base.prototype._dbSave = function(callback) {
	
	// encode id since elasticsearch does not support / in id
	this._data.id = encodeURIComponent(this._data.id);
	
	
	var q = elasticSearchClient.index(this._index, this._type, this._data);
	q.on('data', function( data) {	
					
		var data = JSON.parse(data);
		if (typeof(data.error) !== 'undefined') {
			callback(new errors.UnknowError());
			return;
		}
		
		// reload instance because revision has been updated by db
		Base.loadObject({
			id : data._id
		}, this, callback);
	}.bind(this));
	q.exec();
}



Base.prototype.addValidationError = function (attr, message) {
	
	if (this.validationErrors === null) {
		this.validationErrors = {};
	}
	
	if (typeof(this.validationErrors[attr]) === 'undefined') {
		this.validationErrors[attr] = [];
	}
	
	this.validationErrors[attr].push(message);
	
	
}

Base.prototype.validateString = function (attr, nullable, min, max) {
	
	var value = this._data[attr];
	if (typeof(value) !== 'string') {
		if (!(nullable === true && value === null)) {
			this.addValidationError(attr, 'a string is required');
			return;
		}
	}
	
	if (value !== null) {
		if (min !== null && value.length < min) {
			this.addValidationError(attr, 'string length must be greater than ' + min );
		} else if (max !== null && value.length > max) {
			this.addValidationError(attr, 'string length must be lower than ' + max );
		}
	}
}

Base.prototype.validateBoolean = function (attr, nullable) {
	
	var value = this._data[attr];
	if (typeof(value) !== 'boolean') {
		if (!(nullable === true && value === null)) {
			this.addValidationError(attr, 'a boolean is required');
			return;
		}
	}
}

Base.prototype.validateChoice = function (attr, choices) {
	
	var value = this._data[attr];
	if (choices.indexOf(value) === -1) {
		this.addValidationError(attr, 'choices are: ' + choices.join(' ,'));
			return;
	}
}

Base.prototype.validateEmail = function (attr) {
	var value = this._data[attr];
	
	if (typeof(value) !== 'string' || !(new RegExp('^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$', 'i')).test(value)) {
		this.addValidationError(attr, 'an email is required');
		return;
	}
}

Base.prototype.validateRegexp = function (attr, regexp, nullable) {
	var value = this._data[attr];
	if (typeof(value) !== 'string') {
		if (!(nullable === true && value === null)) {
			this.addValidationError(attr, 'must match regexp: ' + regexp);
			return;
		}
	}
	
	if (value !== null) {
		if (!(new RegExp(regexp)).test(value)) {
			this.addValidationError(attr, 'must match regexp: ' + regexp);
			return;
		}
	}
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
		
		if (data.exists === false || data.status === 404) {
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
	
	attrs.forEach(function (attr) {
		dict[attr] = obj[attr];
	})
	
	return dict;
}

Base.get = function(options, clazz, callback) {
	Base.loadObject(options, new clazz(), callback);
}


Base.count = function(query, index, type, callback) {
	
	
	if (typeof(query) === 'undefined' || query === null) {
		query = {match_all : {}};
	}
	
	
	var q = elasticSearchClient.count(index, type, query);
	q.on('data', function(data) {
		
		var data = JSON.parse(data);
		
		if (data.status === 404) {
			callback(new errors.IndexDoesNotExist(index))
			return;
		} else if (typeof(data.error) !== 'undefined') {
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
	if (clazz.metaAttributes instanceof Array) {
		
		for (var i = 0, l = clazz.metaAttributes.length; i<l;i++) {
			if (attrs.indexOf(clazz.metaAttributes[i]) !== -1) {
				fieldsInQuery = false;
				break;
			}
		}
	}		
	
	if (fieldsInQuery === true) {
		query.fields = attrs;
	}
	
	if (typeof(query.from) === 'undefined') {
		query.from = 0;
	}
	
	if (typeof(query.size) === 'undefined') {
		query.size = 10;
	}
	
	var q = elasticSearchClient.search(index, type, query);
	q.on('data', function(data) {
		
		var data = JSON.parse(data);
		
		if (data.status === 404) {
			callback(new errors.IndexDoesNotExist(index))
			return;
		} else if (typeof(data.error) !== 'undefined') {
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
						
			if (fieldsInQuery === true) {
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


exports.Base = Base;
