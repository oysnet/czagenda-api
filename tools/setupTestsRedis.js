var redisClient = require('../libs/redis-client').redisClient;
redisClient.on('ready', function () {
	redisClient.sadd('approvedSchema', '/schema/base-abstract', '/schema/geo', '/schema/localization', '/schema/who', '/schema/event',function () {
		console.log('setup  done')
		redisClient.end();
	});
})
