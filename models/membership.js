var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var settings = require('../settings.js');
var log = require('czagenda-log').from(__filename);
var redis = require('../libs/redis-client');
var models = require('../models');

function Membership() {
	this._attributs = {
		user : null,
		group : null
	};
	Base.call(this, 'membership');
}

util.inherits(Membership, Base);

Membership.publicAttributes = Base.publicAttributes.concat(['group', 'user']);
Membership.staffAttributes = Membership.publicAttributes
		.concat(Base.staffAttributes);

Membership.publicWriteAttributes = ['user', 'group'];
Membership.staffWriteAttributes = Membership.publicWriteAttributes;

Membership.prototype.hasPerm = function(perm, user, callback) {

	switch (perm) {
		case 'read' :
			callback(null, false);
			break;
		
		case 'del' :
			
			if (this.user === user.id) {
				callback(null, true);
				return;
			}
		
		case 'create' :
		

			if (user.isStaff === true || user.isSuperuser === true) {
				callback(null, true);
			} else {
				models.Group.get({
							id : this.group
						}, function(err, obj) {
							if (err !== null) {
								callback(err);
							} else {
								callback(null, obj.hasWritePerm(user));
							}
						}.bind(this));
			}

			break;

		case 'write' :
			callback(null, false);
			break;

		default :
			callback(null, false);

	}
}

Membership.prototype._validate = function(callback) {

	var keys = [];

	if (this.validateRegexp('group', '^/group/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('group');
	}
	if (this.validateRegexp('user', '^/user/[\-_\.0-9a-zA-Z]+$', false) === true) {
		keys.push('user');
	}

	this.validateExists(keys, callback);

}

Membership.prototype._generateHash = function() {
	c = require('crypto')
	h = c.createHash('md5')
	h.update(this._type);
	h.update(this.user);
	h.update(this.group);
	this._data['hash'] = h.digest('hex')
}

Membership.prototype._postSave = function(err, next) {

	if (err === null) {

		var multi = redis.redisClient.multi();
		multi.sadd(redis.USER_GROUP_PREFIX + this.user, this.group, function(
						err, res) {

					if (err !== null) {
						log
								.critical('REDIS USER GROUP: error on sadd ',
										redis.USER_GROUP_PREFIX + this.user,
										this.group)
					}

				}.bind(this));

		multi.sadd(redis.USER_MEMBERSHIP_PREFIX + this.user, this.id, function(
						err, res) {

					if (err !== null) {
						log.critical('REDIS USER GROUP: error on sadd ',
								redis.USER_MEMBERSHIP_PREFIX + this.user,
								this.id)
					}

				}.bind(this));

		multi.exec(function(err, replies) {
					next();
				});
	} else {
		next();
	}
}

Membership.prototype._postDel = function(err, next) {
	if (err === null || err instanceof errors.ObjectDoesNotExist) {

		var multi = redis.redisClient.multi();

		multi.srem(redis.USER_GROUP_PREFIX + this.user, this.group, function(
						err, res) {
					if (err !== null) {
						log
								.critical('REDIS USER GROUP: error on srem ',
										redis.USER_GROUP_PREFIX + this.user,
										this.group)
					}
				}.bind(this));

		multi.srem(redis.USER_MEMBERSHIP_PREFIX + this.user, this.id, function(
						err, res) {
					if (err !== null) {
						log.critical('REDIS USER GROUP: error on srem ',
								redis.USER_MEMBERSHIP_PREFIX + this.user,
								this.id)
					}
				}.bind(this))

		multi.exec(function(err, replies) {
					next();
				});

	} else {
		next();
	}

}

Membership.get = function(options, callback) {
	Base.get(options, Membership, callback)
}

Membership.search = function(query, attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'membership', attrs,
			Membership, callback)
}

Membership.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'membership', callback)
}

exports.Membership = Membership;
