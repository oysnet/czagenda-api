var settings = require('../settings.js'),
	redis = require("redis"), 
	redisClient = redis.createClient(settings.redis.port, settings.redis.host);
	
redisClient.select(settings.redis.db);

exports.redisClient = redisClient;

exports.PREFIX_SCHEMA_PROPOSAL = "schemasProposal_";
exports.SCHEMA_APPROVED = "schemasApproved";
exports.USER_PREFIX = "user_";
exports.USER_GROUP_PREFIX = "user_group_";
exports.USER_MEMBERSHIP_PREFIX = "user_membership_";
exports.LAST_SEEN = "last_seen";
exports.LAST_SEEN_PREFIX = "last_seen_";
exports.SCHEMA_KEY = "schemas";
exports.LOCK_PREFIX = 'lock_';
