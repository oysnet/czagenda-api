var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var errors = require('./errors.js');
var validator = require('../libs/schemas/validator');
var settings = require('../settings.js');
var redis = require('../libs/redis-client');
var log = require('czagenda-log').from(__filename);

function Schema() {
	this._attributs = {
		schema : null,
		'final' : false,
		sample : null,
		template : null,
		status : this.constructor.REFUSED,
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

		if(k === '$ref' || k === 'href') {

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

	// validate schema with user environment (include user's schema with status proposal')
	if(this.status === Schema.PROPOSAL) {
		var userEnv = new validator.ValidatorEnvironment();
		userEnv.load( function(err, res) {
			if(err !== null) {
				log.warning('Unable to load ValidatorEnvironment for user ' + this.author, err);
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

Schema.prototype.save = function(callback) {

	if( typeof (this.name) !== 'string') {
		this.addValidationError('name', 'a string is required')
		callback(new errors.ValidationError(), this);
		return;
	}

	Base.prototype.save.call(this, callback);

}

Schema.prototype.__deleteKey = function(key, broadcast) {

	redis.redisClient.srem(key, this.id, function(err, res) {

		if(err !== null) {
			log.warning('REDIS SCHEMAS: error on del key ', key, this.id, err)
		} else if(res === 1 && broadcast === true) {
			// braodcast
		}

	}.bind(this))
}

Schema.prototype.__addKey = function(key, broadcast) {
	log.debug('REDIS SCHEMAS: add key ' + key + ' ' + this.id)
	redis.redisClient.sadd(key, this.id, function(err, res) {

		if(err !== null) {
			log.warning('REDIS SCHEMAS: error on add key ', key, this.id, err)
		} else if(res === 1 && broadcast === true) {
			// braodcast
		}

	}.bind(this))
}

Schema.prototype._postSave = function() {
	// approved => supprimer userId proposal + ajouter dans approved

	if(this.status === Schema.APPROVED) {
		this.__addKey(redis.SCHEMA_APPROVED, true);
		this.__deleteKey(redis.PREFIX_SCHEMA_PROPOSAL + this.author, false);
	}

	// proposal => ajouter dans userId proposal + supprimer dans approved
	
else if(this.status === Schema.PROPOSAL) {
		this.__deleteKey(redis.SCHEMA_APPROVED, true);
		this.__addKey(redis.PREFIX_SCHEMA_PROPOSAL + this.author, false);
	}

	// refused => this._postDel
	
else if(this.status === Schema.REFUSED) {
		this.__deleteKey(redis.SCHEMA_APPROVED, true);
		this.__deleteKey(redis.PREFIX_SCHEMA_PROPOSAL + this.author, false);
	}

}

Schema.prototype._postDel = function() {
	this.__deleteKey(redis.SCHEMA_APPROVED, true);
	this.__deleteKey(redis.PREFIX_SCHEMA_PROPOSAL + this.author, false);

}

Schema.prototype._preSave = function() {
	this._data.schema.id = this._data.id;
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
