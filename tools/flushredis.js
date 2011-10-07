var redisClient = require('../libs/redis-client');
redisClient.on('ready', function () {
	redisClient.flushall(function () {
		console.log('flush done')
		redisClient.end();
	});
})
