var settings = require('../settings.js');
var redis = require("redis"), redisClient = redis.createClient(settings.redis.port, settings.redis.host);

redisClient.on('ready', function () {
	redisClient.flushall(function () {
		console.log('flush done')
		redisClient.end();
	});
})
