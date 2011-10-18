var settings = require('../settings.js'),
	redis = require("redis"), 
	redisClient = redis.createClient(settings.redis.port, settings.redis.host);
	
redisClient.select(settings.redis.db);

exports.redisClient = redisClient;

exports.PREFIX_SCHEMA_PROPOSAL = "schemasProposal_";
exports.SCHEMA_APPROVED = "schemasApproved";
exports.USER_PREFIX = "user_";
exports.USER_GROUP_PREFIX = "user_group_";