var redisClient = require('../libs/redis-client').redisClient;

var models = require('../models');

var keys = process.argv.slice(2)

console.log('Keys to delete: ' + keys.join(', '))

keys.push(function (err, nb) {
	
	console.log(nb + " keys deleted");
	redisClient.end();
})

redisClient.del.apply(redisClient, keys)

