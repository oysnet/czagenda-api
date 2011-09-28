var settings = require('../settings.js'),
	redis = require("redis"), 
	redisClient = redis.createClient(settings.redis.port, settings.redis.host);
	
module.exports = redisClient;