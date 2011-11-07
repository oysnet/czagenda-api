var JSV = require('JSV').JSV
var settings = require('../../settings.js');
var models = require('../../models');
var log = require('czagenda-log').from(__filename);
var redis = require('../redis-client');
var async = require('async');

var ValidatorEnvironment = function(user) {

	var env = JSV.createEnvironment("json-schema-draft-03");
	this.env = env;
	this.envkey = null;

	if( typeof (user) !== 'undefined') {
		this.user = user;
	} else {
		this.user = null;
	}

}

ValidatorEnvironment.prototype.env = null;

ValidatorEnvironment.prototype.startMonitor = function() {
	setInterval(this.monitor.bind(this), settings.validator.refreshFrequency);
}

ValidatorEnvironment.prototype.envChange = function() {
	// generate a new envkey
	var envkey = String(Math.random());

	log.notice('generate new envkey', envkey);

	redis.redisClient.set(redis.SCHEMA_KEY, envkey, function(err, res) {
		if(err !== null) {
			log.critical('REDIS: unable to set', redis.SCHEMA_KEY);

		} 

	}.bind(this));
}

ValidatorEnvironment.prototype.monitor = function() {

	log.debug('cron current key: ' + this.envkey);

	redis.redisClient.get(redis.SCHEMA_KEY, function(err, envkey) {

		if(envkey === null) {

			// generate a new envkey
			envkey = String(Math.random());

			log.notice('generate new envkey', envkey);

			redis.redisClient.set(redis.SCHEMA_KEY, envkey, function(err, res) {
				if(err !== null) {
					log.critical('REDIS: unable to set', redis.SCHEMA_KEY);

				} else {
					this.envkey = envkey;
				}

			}.bind(this));
		} else if(envkey !== this.envkey) {
			log.notice('reload environement')
			this.load( function(err) {

				if(err === null) {
					this.envkey = envkey;
					log.notice('environement reloaded')
				}

			}.bind(this));
		}

	}.bind(this));

}
/**
 * Public method that request environement to be loaded with optionnaly user proposal schemas
 */
ValidatorEnvironment.prototype.load = function(callback) {

	var user = this.user;

	log.notice('Fetching schemas id from redis');

	var keys = [redis.SCHEMA_APPROVED];

	if( typeof (user) !== 'undefined') {
		keys.push(redis.PREFIX_SCHEMA_PROPOSAL + user);
	}

	keys.push( function(err, res) {
		if(err !== null) {
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
ValidatorEnvironment.prototype.getEnv = function() {
	return this.env;
}
/**
 * Load schemas from elastic
 */
ValidatorEnvironment.prototype._loadFromDB = function(schemas, callback) {

	var asyncMethods = [];
	for(var i = 0, l = schemas.length; i < l; i++) {
		asyncMethods.push( function(i, cb) {

			models.Schema.get({
				id : schemas[i]
			}, function(err, obj) {

				if(err !== null) {
					cb(err)
				} else {
					cb(null, obj);
				}
			});
		}.bind(this, i));
	}

	async.parallel(asyncMethods, function(err, schemas) {

		if(err !== null && typeof (err) !== 'undefined') {
			log.critical('Fail to fetch schemas from db', err);
			callback(new Error('Fail to fetch schemas from db'));
			return;
		}

		if(schemas.length === 0) {
			log.warning('No schemas to add to validator environment');
			callback(null);
			return;
		}

		if(this._addSchemasToEnv(schemas) === true) {
			callback(null, true);
		} else {
			callback(new Error('Fail to add schemas to validator environment'));
		}

	}.bind(this));

}
var crypto = require('crypto');
function hash(data) {
	h = crypto.createHash('md5')

	h.update(JSON.stringify(data))
	return h.digest('hex')
}

/**
 * Try to add schemas to validator environment
 */
ValidatorEnvironment.prototype._addSchemasToEnv = function(schemas) {

	var ordered = [];
	var expected = schemas.length;

	var env = null;
	var failedCount = 0;

	while(failedCount < schemas.length && expected > ordered.length) {
		env = JSV.createEnvironment("json-schema-draft-03");

		for(var i = 0, l = ordered.length; i < l; i++) {

			try {
				env.createSchema(ordered[i].schema, undefined, ordered[i].id);
			} catch (e) {
				log.critical("_addSchemasToEnv: Schema that succeed, fail now !", ordered[i].id);
				return false;
			}
		}

		for(var i = 0, l = schemas.length; i < l; i++) {
			try {

				env.createSchema(schemas[i].schema, undefined, schemas[i].id);
				ordered.push(schemas[i]);
			} catch (e) {

				// delete all schema in schemas that succeed
				schemas.splice(0, i);

				// move schema that at the end of schemas array
				schemas.push(schemas.shift());

				if(i === 0) {
					failedCount++;
				} else {
					failedCount = 0;
				}
				break;
			}
		}

	}

	if(ordered.length === expected) {
		this.env = env;
		return true;
	}

	return false;

}

exports.approvedEnvironment = new ValidatorEnvironment();
exports.approvedEnvironment.startMonitor();
exports.ValidatorEnvironment = ValidatorEnvironment;
