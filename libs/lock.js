var log = require('czagenda-log').from(__filename);
var redis = require('./redis-client');

function Lock(id, ttl) {

	this.lockId = redis.LOCK_PREFIX + id;

	// lock time to live in 
	this.lockTTL = typeof(ttl) !== 'undefined' ? ttl * 1000 : 60000;
	
	this.released = false;
	
}

Lock.prototype.getCurrentTimestamp = function() {
	return (new Date()).getTime();
}

Lock.prototype.acquire = function(callback) {

	//log.debug('trying acquire lock', this.lockId)
	this.lockExpirationTime = this.getCurrentTimestamp() + this.lockTTL;

	redis.redisClient.setnx(this.lockId, this.lockExpirationTime, function(err, res) {

		if(err !== null) {
			log.critical('REDIS: failed setnx', this.lockId, this.lockExpirationTime, JSON.stringify(err))
			callback(err);
			return;
		}

		// lock acquired
		if(res === 1) {
			log.notice('lock acquired', this.lockId);
			callback(null, true);
		} else {

			// check if it is a dead lock
			redis.redisClient.get(this.lockId, function(err, res) {
				if(err !== null) {
					log.critical('REDIS: failed get', this.lockId,  JSON.stringify(err))
					callback(err);
					return;
				}

				// dead lock
				if(parseInt(res) < this.getCurrentTimestamp()) {
					log.notice('dead lock found', this.lockId, res);

					// try to set lock
					redis.redisClient.getset(this.lockId, this.lockExpirationTime, function(err, res) {

						if(err !== null) {
							log.critical('REDIS: failed getset', this.lockId,  this.lockExpirationTime,JSON.stringify(err))
							callback(err);
							return;
						}

						// lock is acquired only if returned value is an expired time
						if(parseInt(res) < this.getCurrentTimestamp()) {
							log.notice('lock acquired', this.lockId);
							callback(null, true);
						} else {
							log.notice('lock refused', this.lockId);
							callback(null, false);
						}

					}.bind(this));

				}
				// lock is valid
				else {
					log.notice('lock refused', this.lockId);
					callback(null, false);
				}

			}.bind(this))
		}

	}.bind(this));

}

Lock.prototype.release = function(callback) {
	
	
	if (typeof(callback) === 'undefined') {
		
		callback = function () {};
	}
	
	if (this.released === true) {
		callback(null, true);
		return;
	}
	
	this.released = true;
	
	if(this.lockExpirationTime > this.getCurrentTimestamp()) {
		redis.redisClient.del(this.lockId, function(err, res) {
			
			if(err !== null || res === 0) {
				callback(err, false);

			} else {
				log.notice('lock released', this.lockId);
				callback(null, true);
			}

		}.bind(this))
	} else {
		callback(null, false);
	}
}

module.exports = Lock;