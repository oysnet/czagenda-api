var log = require('czagenda-log').from(__filename);
var redis = require('./redis-client');

function Lock(id, ttl) {

	this.lockId = redis.LOCK_PREFIX + id;

	// lock time to live in 
	this.lockTTL = typeof(ttl) !== 'undefined' ? ttl * 1000 : 60000;
}

Lock.prototype.getCurrentTimestamp = function() {
	return (new Date()).getTime();
}

Lock.prototype.acquire = function(callback) {

	log.debug('trying acquire lock', this.lockId)
	this.lockExpirationTime = this.getCurrentTimestamp() + this.lockTTL;

	redis.redisClient.setnx(this.lockId, this.lockExpirationTime, function(err, res) {

		if(err !== null) {
			callback(err);
			return;
		}

		// lock acquired
		if(res === 1) {
			callback(null, true);
		} else {

			// check if it is a dead lock
			redis.redisClient.get(this.lockId, function(err, res) {
				if(err !== null) {
					callback(err);
					return;
				}

				// dead lock
				if(parseInt(res) < this.getCurrentTimestamp()) {
					log.notice('dead lock found', this.lockId, res);

					// try to set lock
					redis.redisClient.getset(this.lockId, this.lockExpirationTime, function(err, res) {

						if(err !== null) {
							callback(err);
							return;
						}

						// lock is acquired only if returned value is an expired time
						if(parseInt(res) < this.getCurrentTimestamp()) {
							log.notice('lock acquired', this.lockId);
							callback(null, true);
						} else {
							log.notice('lock has just been re-acquired', this.lockId);
							callback(null, false);
						}

					}.bind(this));

				}
				// lock is valid
				else {
					log.notice('lock already acquired', this.lockId);
					callback(null, false);
				}

			}.bind(this))
		}

	}.bind(this));

}

Lock.prototype.release = function(callback) {

	if(this.lockExpirationTime > this.getCurrentTimestamp()) {
		redis.redisClient.del(this.lockId, function(err, res) {

			if(err !== null || res === 0) {
				callback(err, false);

			} else {
				callback(null, true);
			}

		})
	} else {
		callback(null, false);
	}
}

module.exports = Lock;