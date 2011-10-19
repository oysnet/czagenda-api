var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var settings = require('../settings.js');
var log = require('czagenda-log').from(__filename);
var redis = require('../libs/redis-client');

function Membership () {
	this._attributs = {user : null, group : null};
	Base.call(this, 'membership');	
}

util.inherits(Membership, Base);


Membership.publicAttributes = Base.publicAttributes.concat(['group', 'user']);
Membership.staffAttributes = Membership.publicAttributes.concat(Base.staffAttributes);

Membership.publicWriteAttributes = ['user', 'group'];
Membership.staffWriteAttributes = Membership.publicWriteAttributes;

Membership.prototype._validate = function (callback) {
	
	var keys = [];
	
	if (this.validateRegexp('group', '^/group/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('group');
	}
	if (this.validateRegexp('user', '^/user/[\-_\.0-9a-zA-Z]+$', false) === true) {
		keys.push('user');
	}
	
	this.validateExists(keys, callback);
	
}

Membership.prototype._generateHash = function () {
		
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(this.user);
	h.update(this.group);
	this._data['hash'] = h.digest('hex')
}


Membership.prototype._postSave = function(err, next) {

	if(err === null) {

		redis.redisClient.sadd(redis.USER_GROUP_PREFIX + this.user, this.group ,function(err, res) {

			if(err !== null) {
				log.critical('REDIS USER GROUP: error on sadd ', redis.USER_GROUP_PREFIX + this.user, this.group)
			} 

			next();

		}.bind(this))

	} else {
		next();
	}
}


Membership.prototype._postDel = function(err, next) {
	if (err === null || err instanceof errors.ObjectDoesNotExist) {
		
		redis.redisClient.srem(redis.USER_GROUP_PREFIX + this.user, this.group ,function(err, res) {

			if(err !== null) {
				log.critical('REDIS USER GROUP: error on srem ', redis.USER_GROUP_PREFIX + this.user, this.group)
			} 

			next();

		}.bind(this))
		
	} else {
		next();
	}
	
}



Membership.get = function(options, callback) {
	Base.get(options,Membership, callback)
}

Membership.search = function(query,attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'membership', attrs, Membership, callback)
}

Membership.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'membership',callback)
}


exports.Membership = Membership;