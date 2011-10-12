var redisClient = require('../libs/redis-client').redisClient;
redisClient.on('ready', function () {
	redisClient.flushdb(function () {
		console.log('flush done')
		redisClient.end();
	});
})
