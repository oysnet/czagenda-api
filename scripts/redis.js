var settings = require('../settings.js');
var redis = require("redis"), redisClient = redis.createClient(settings.redis.port, settings.redis.host);

redisClient.on('ready', function () {
	console.log('ready');
});


redisClient.on('error', function () {
	console.log('error');
});