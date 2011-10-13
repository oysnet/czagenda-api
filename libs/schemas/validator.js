var JSV = require('JSV').JSV
var settings = require('../../settings.js');
var models = require('../../models');
var log = require('czagenda-log').from(__filename);
var redis = require('../redis-client');
var async = require('async');

var ValidatorEnvironment = function() {

	var env = JSV.createEnvironment("json-schema-draft-03");
	this.env = env;
}

ValidatorEnvironment.prototype.env = null;


/**
 * Public method that request environement to be loaded with optionnaly user proposal schemas
 */
ValidatorEnvironment.prototype.load = function(callback, user) {
	
	log.notice('Fetching schemas id from redis');
	
	var keys = [redis.SCHEMA_APPROVED];
	
	if (typeof(user) !== 'undefined') {
		keys.push(redis.PREFIX_SCHEMA_PROPOSAL + user);
	}
	
		
	keys.push(function (err, res) {
		if (err !== null) {
			log.critical('Fail to fetch schemas id from redis', err);
			callback(err);
			return;
		}
		
		log.debug('Schemas id fetched from redis', res);
		this._loadFromDB(res, callback);
		
	}.bind(this));
	
	redis.redisClient.sunion.apply(redis.redisClient, keys)
	
}

/**
 * Public method that return validator environement
 */
ValidatorEnvironment.prototype.getEnv = function () {
	return this.env;
}

/**
 * Load schemas from elastic
 */
ValidatorEnvironment.prototype._loadFromDB = function(schemas, callback) {
	var asyncMethods = [];
	for (var i=0, l=schemas.length; i<l; i++) {
		asyncMethods.push(function (i,cb) {
			
			models.Schema.get({id : schemas[i]}, function (err, obj) {
								
				if (err !== null) {
					cb(err)
				} else {
					cb(null, obj);
				}
			});
		}.bind(this,i));
	}
	
	async.parallel(asyncMethods, function (err, schemas) {
					
			if (err !== null && typeof(err) !== 'undefined') {
				log.critical('Fail to fetch schemas from db', err);
				callback(new Error('Fail to fetch schemas from db'));
				return;
			}
			
			if (schemas.length === 0) {
				log.warning('No schemas to add to validator environment');
				callback(null);
				return;
			}
			
			// try to add schemas
			while(schemas.length > 0) {
				var tmp = this._addSchemasToEnv( schemas, this.env);
				if(tmp.length === 0) {
					log.notice('Schemas loaded');
					callback(null, true)
					break;
				} else if(tmp.length === schemas.length) {
					log.critical('Fail to add schemas to validator environment', tmp);
					callback(new Error('Fail to add schemas to validator environment'));
					break;
				} else {
					schemas = tmp;
				}
			}
	}.bind(this));
	
}



/**
 * Try to add schemas to validator environment
 */
ValidatorEnvironment.prototype._addSchemasToEnv = function(schemas, env) {

	var tmp = []
	for(var i = 0, l = schemas.length; i < l; i++) {
		try {
			console.log(schemas[i].id)
			env.createSchema(schemas[i].schema, undefined, schemas[i].id)
		} catch (e) {
			
			tmp.push(schemas[i])			
		}
	}
	return tmp;
}

exports.approvedEnvironment = new ValidatorEnvironment();
exports.ValidatorEnvironment = ValidatorEnvironment;