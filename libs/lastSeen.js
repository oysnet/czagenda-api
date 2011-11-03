var models = require('../models'), 
	log = require('czagenda-log').from(__filename), 
	redis = require('./redis-client'), 
	async = require('async'),
	settings = require('../settings');

function updateLastSeen() {
	
	log.debug('updateLastSeen');
	
	redis.redisClient.spop(redis.LAST_SEEN, function(err, userId) {

		if(err !== null || userId === null) {

			if(err !== null) {
				log.warning('REDIS: error on spop', err)
			}

			setTimeout(updateLastSeen, settings.lastSeenUpdateFrequency);
			return;
		}
		
		
		// configure async to fetch lastseen value, and user object
		var methods = {};

		methods.lastseen = function(callback) {
			redis.redisClient.get(redis.LAST_SEEN_PREFIX + userId, function(err, lastseen) {
				callback(err, lastseen);
			});
		};
		
		methods.user = function(callback) {
			models.User.get({id:userId}, function (err, user) {
				callback(err, user);
			})
		};
		
		async.parallel(methods, function (err, data) {
			
			if (typeof(err) !== 'undefined') {
				setTimeout(updateLastSeen,settings.lastSeenUpdateFrequency);
				log.warning('async error', JSON.stringify(err));
				return;
			}
			
			redis.redisClient.del(redis.LAST_SEEN_PREFIX + userId, function (err) {
				if (err !== null) {
					log.warning('REDIS: error on del', redis.LAST_SEEN + userId, err);
				}
			});
			
			data.user.lastSeen = data.lastseen;
			data.user.save(function (err) {
				if(err !== null) {
					log.warning('unable to save user', JSON.stringify(err))
				} else {
					log.notice('last seen', data.user.id, data.lastseen);
				}
			},true);
			
			setTimeout(updateLastSeen,250);
			
		})
		
	})
}

exports.start = function() {
	setTimeout(updateLastSeen, settings.lastSeenUpdateFrequency);
}