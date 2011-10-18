var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var errors = require('./errors.js');
var validator = require('../libs/schemas/validator');
var settings = require('../settings.js');
var redis = require('../libs/redis-client');
var log = require('czagenda-log').from(__filename);
var async = require('async');

function Schema() {
	this._attributs = {
		schema : null,
		'final' : false,
		sample : null,
		template : null,
		status : this.constructor.PROPOSAL,
		name : null,
		"description" : null,
		author : null
	};
	Base.call(this, 'schema');
}

Schema.REFUSED = 'REFUSED';
Schema.PROPOSAL = 'PROPOSAL';
Schema.APPROVED = 'APPROVED';

util.inherits(Schema, Base);

Schema.publicAttributes = Base.publicAttributes.concat(['schema', 'final', 'sample', 'template', 'status', 'name', 'author']);
Schema.staffAttributes = Schema.publicAttributes.concat(Base.staffAttributes);
Schema.metaAttributes = ['schema'];

Schema.publicWriteAttributes = ['schema', 'name', 'sample', 'template'];
Schema.staffWriteAttributes = Schema.publicWriteAttributes.concat(['final', 'status', 'name']);

Schema.prototype._findMissingDependencies = function(schema, env) {

	var deps = [];

	for(k in schema) {

		var testValue = schema[k];

		if(k === '$ref' || (k === 'href' && typeof (testValue) === 'string')) {

			if( typeof (env.findSchema(schema[k])) === 'undefined') {
				deps.push(schema[k]);
			}

		} else if(( testValue instanceof Array) === true) {

			for(var i = 0, l = testValue.length; i < l; i++) {
				if((testValue[i] instanceof Object) === true) {
					deps = deps.concat(this._findMissingDependencies(testValue[i], env));
				}
			}

		} else if(( testValue instanceof Object) === true) {
			deps = deps.concat(this._findMissingDependencies(testValue, env));
		}

	}

	return deps;
}

Schema.prototype._validate = function(callback) {

	this.validateString('name', false, null, 64);
	this.validateBoolean('final', false);
	this.validateString('sample', true, null, null);
	this.validateString('template', true, null, null);
	this.validateChoice('status', [Schema.REFUSED, Schema.PROPOSAL, Schema.APPROVED]);

	this.validateNotEmptyObject('schema');

	// validate schema with user environment (include user's schema with status proposal')
	if(this.status === Schema.PROPOSAL) {
		var userEnv = new validator.ValidatorEnvironment();
		userEnv.load( function(err, res) {
			if(err !== null) {
				log.warning('Unable to load ValidatorEnvironment for user ' + this.author, err);
				callback(err);
			} else {
				var veSchema = userEnv.getEnv().findSchema(userEnv.getEnv().getOption("latestJSONSchemaSchemaURI"));
				var report = veSchema.validate(this.schema);
				if(report.errors.length > 0) {
					this.parseJSVErrors(report.errors);
				} else {

					var missing = this._findMissingDependencies(this.schema, userEnv.getEnv());
					if(missing.length > 0) {
						this.addGlobalValidationError("Missing schema dependencies: " + missing.join(' ,'));
						callback(null);
						return;
					}

				}

				callback(null);
			}

		}.bind(this), this.author);

	} else {
		var veSchema = validator.approvedEnvironment.getEnv().findSchema(validator.approvedEnvironment.getEnv().getOption("latestJSONSchemaSchemaURI"));
		var report = veSchema.validate(this.schema);
		if(report.errors.length > 0) {
			this.parseJSVErrors(report.errors);
		} else {

			var missing = this._findMissingDependencies(this.schema, validator.approvedEnvironment.getEnv());
			if(missing.length > 0) {
				this.addGlobalValidationError("Missing schema dependencies: " + missing.join(' ,'));
				callback(null);
				return;
			}

		}
		callback(null);
	}

}

Schema.prototype._generateHash = function() {

	var id = this.schema.id;
	delete this.schema.id;
	c = require('crypto')
	h = c.createHash('md5')
	h.update(this._type);
	h.update(JSON.stringify(this.schema));
	this._data['hash'] = h.digest('hex')

	this.schema.id = id;
}

Schema.prototype._generateId = function() {
	return '/schema/' + utils.slugify(this.name + " " + (this['final'] === true ? "" : "abstract"));
}
/*
Schema.prototype.save = function(callback) {

	if( typeof (this.name) !== 'string') {
		this.addValidationError('name', 'a string is required')
		callback(new errors.ValidationError(), this);
		return;
	}

	Base.prototype.save.call(this, callback);

}
*/
Schema.prototype.__deleteKey = function(key, broadcast, callback) {

	redis.redisClient.srem(key, this.id, function(err, res) {

		if(err !== null) {
			log.critical('REDIS SCHEMAS: error on sdel ', key, this.id, err)
		} else if(res === 1 && broadcast === true) {
			// braodcast
		}
		
		callback(err);
		
	}.bind(this))
}

Schema.prototype.__addKey = function(key, broadcast, callback) {
	log.debug('REDIS SCHEMAS: add key ' + key + ' ' + this.id)
	redis.redisClient.sadd(key, this.id, function(err, res) {

		if(err !== null) {
			log.critical('REDIS SCHEMAS: error on sadd ', key, this.id, err)
		} else if(res === 1 && broadcast === true) {
			// braodcast
		}
		
		callback(err);
		
	}.bind(this))
}

Schema.prototype.__getRedisSchemasTasks = function () {
	var methods = [];
		
	if(this.status === Schema.APPROVED) {
		// approved => supprimer userId proposal + ajouter dans approved
		methods.push(this.__addKey.bind(this, redis.SCHEMA_APPROVED, true));
		methods.push(this.__deleteKey.bind(this, redis.PREFIX_SCHEMA_PROPOSAL + this.author, false));
		
	} else if(this.status === Schema.PROPOSAL) {
		// proposal => ajouter dans userId proposal + supprimer dans approved
		methods.push(this.__deleteKey.bind(this, redis.SCHEMA_APPROVED, true));
		methods.push(this.__addKey.bind(this, redis.PREFIX_SCHEMA_PROPOSAL + this.author, false));
		
	} else if(this.status === Schema.REFUSED) {
		// refused => this._postDel
		methods.push(this.__deleteKey.bind(this, redis.SCHEMA_APPROVED, true));
		methods.push(this.__deleteKey.bind(this, redis.PREFIX_SCHEMA_PROPOSAL + this.author, false));
	}
	
	return methods;
}


Schema.prototype._postSave = function(err, next) {
	
	if (err === null) {
		
		async.parallel(this.__getRedisSchemasTasks(), function () {
			next();
		})
		
	} else {
		next();		
	}
}


Schema.prototype._preDel = function(callback) {
	
	
	
	var methods = [];
	
	methods.push(this.__deleteKey.bind(this,redis.SCHEMA_APPROVED, true));
	methods.push(this.__deleteKey.bind(this,redis.PREFIX_SCHEMA_PROPOSAL + this.author, false));
	
	async.parallel(this.__getRedisSchemasTasks(), function (err) {
		if (typeof(err) !== 'undefined' && err !== null) {
			callback(new errors.InternalError('Error when trying to remove or add key in redis'));
		} else {
			callback(null);
		}
		
		
	});
	
}

Schema.prototype._postDel = function(err, next) {
	if (err === null || err instanceof errors.ObjectDoesNotExist) {
		next();
	} else {
		// restore redis
		async.parallel(this.__getRedisSchemasTasks(), function () {
			next();
		})
	}
	
}

Schema.get = function(options, callback) {
	Base.get(options, Schema, callback)
}

Schema.search = function(query, attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'schema', attrs, Schema, callback)
}

Schema.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'schema', callback)
}

exports.Schema = Schema;
