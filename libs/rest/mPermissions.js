var models = require('../../models'),
	statusCodes = require('../statusCodes'),
	log = require('czagenda-log').from(__filename),
	redis = require('../redis-client');
	
exports.getUserPermsAndGroups = function (req, res, next) {
	
	if (typeof(req.user) === 'undefined') {
		res.statusCode = statusCodes.FORBIDDEN;
		res.end('User unknow, access forbidden.');
		log.warning('req.user is undefined, sending 403')
		return;
	}
	
	var id = req.user;
	
	var multi = redis.redisClient.multi();
	multi.hgetall(redis.USER_PREFIX + id)
	multi.smembers(redis.USER_GROUP_PREFIX + id);
	
	multi.exec(function (err, replies) {
		
		if (err !== null) {
			res.statusCode = statusCodes.INTERNAL_ERROR;
			res.end('Unable to fetch perms user data');
			log.critical('REDIS FETCH PERMS USER', err);
			return;
		}
		
		req.user = {
			isStaff : replies[0].isStaff === 'true',
			isSuperuser : replies[0].isSuperuser === 'true',
			isActive : replies[0].isActive === 'true',
			id : id,
			groups : replies[1]
		}
		
		console.log(req.user)
		
		if (req.user.isActive === false) {
			res.statusCode = statusCodes.FORBIDDEN;
			res.end('Account disabled');
			log.notice('Account is disabled, sending 403');
			return;
		}
		
		next();
		
	})
}


exports.staffOnly = function (req, res, next) {
	
	
	
	if (req.user.isStaff === true || req.user.isSuperuser) {
		log.debug('check staffOnly, granted');
		next();
	} else {
		log.debug('check staffOnly, forbidden');
		res.statusCode = statusCodes.FORBIDDEN;
		res.end('Insufficient privileges');
	}
		
}