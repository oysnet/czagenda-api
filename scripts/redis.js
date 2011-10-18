var redis = require('../libs/redis-client'), redisClient = redis.redisClient;

redisClient.on('ready', function () {
	redisClient.multi().hmset('test', "bool", true).hgetall('test').exec(function (err, replies) {
    console.log(replies); // 102, 3
    redisClient.quit();
});
	
});
