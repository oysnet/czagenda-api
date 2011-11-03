var Base = require('./base.js').Base;
var util = require("util");
var settings = require('../settings.js')
var utils = require('../libs/utils.js');
var errors = require('./errors.js');
var redis = require('../libs/redis-client');
var log = require('czagenda-log').from(__filename);

function User() {
	this._attributs = {
		login : null,
		firstName : null,
		lastName : null,
		email : null,
		password : null,
		isActive : false,
		isStaff : false,
		isSuperuser : false,
		lastLogin : null,
		joinedDate : null,
		groups : null
	};
	Base.call(this, 'user');
}

User.publicAttributes = Base.publicAttributes.concat(['login', 'firstName', 'lastName', 'isActive', 'isStaff', 'isSuperuser', 'lastLogin', 'joinedDate', 'groups']);

User.staffAttributes = User.publicAttributes.concat(Base.staffAttributes).concat(['email', 'password']);

User.publicWriteAttributes = ['login', 'firstName', 'lastName', 'email',  'isActive'];

User.staffWriteAttributes = User.publicWriteAttributes.concat(['password', 'isStaff', 'isSuperuser']);


util.inherits(User, Base);

User.prototype._validate = function(callback) {
	//this.validateString('login', false, 2, 30);
	this.validateRegexp('login', '^[\-_\.0-9a-zA-Z]{2,30}$', false);
	this.validateString('firstName', true, null, 128);
	this.validateString('lastName', true, null, 128);
	this.validateEmail('email');

	callback(null);
}

User.prototype._generateHash = function() {
	c = require('crypto')
	h = c.createHash('md5')
	h.update(this._type);
	h.update(this.email);
	this._data['hash'] = h.digest('hex')
}

User.prototype._generateId = function() {
	return '/user/' + this.login;
}

User.prototype._preSave = function(callback) {
	if(this.id === null) {
		this._data.groups = this._data.id + '/groups';
		this._data.joinedDate = this._data.createDate;
	}

	callback(null);
}

User.prototype._postSave = function(err, next) {

	if(err === null) {

		redis.redisClient.hmset(redis.USER_PREFIX + this.id, "isActive", this.isActive, "isStaff", this.isStaff, "isSuperuser", this.isSuperuser, function(err, res) {

			if(err !== null) {
				log.critical('REDIS USER: error on hmset ', redis.USER_PREFIX + this.id, "isActive", this.isActive, "isStaff", this.isStaff, "isSuperuser", this.isSuperuser)
			} 

			next();

		}.bind(this))

	} else {
		next();
	}
}


User.prototype._postDel = function(err, next) {
	if (err === null || err instanceof errors.ObjectDoesNotExist) {
		
		redis.redisClient.del(redis.USER_PREFIX + this.id, function (err, res) {
			
			if (err !== null) {
				log.critical('REDIS USER: error on del ', redis.USER_PREFIX + this.id);
			}
			
			next();
			
		}.bind(this))
		
	} else {
		next();
	}
	
}


User.get = function(options, callback) {
	Base.get(options, User, callback)
}

User.search = function(query, attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'user', attrs, User, callback)
}

User.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'user', callback)
}

exports.User = User;
