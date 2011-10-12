
var redis = require('../libs/redis-client');
var redisClient = redis.redisClient;
var async = require('async');

var urls = ['/schema/base-abstract', '/schema/geo', '/schema/localization', '/schema/who', '/schema/event'];

var methods = [];

urls.forEach(function (url) {
	methods.push(function (callback) {
		
		redisClient.sadd(redis.SCHEMA_APPROVED, url, function (err, nb) {
			callback(err);
		});
		
	})
})

redisClient.on('ready', function (err) {
	
	async.parallel(methods, function (err) {
		
		if (typeof(err) === 'undefined') {
			console.log('keys added')
		} else {
			console.log('something went wrong')
		}
		
		redisClient.end();
		
	});
	
});
