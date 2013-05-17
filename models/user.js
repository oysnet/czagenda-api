var Base = require('./base.js').Base;
var util = require("util");
var settings = require('../settings.js')
var utils = require('../libs/utils.js');
var errors = require('./errors.js');
var redis = require('../libs/redis-client');
var log = require('czagenda-log').from(__filename);
var crypto = require('crypto');

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
		lastSeen : null,
		joinedDate : null,
		groups : null,
		gravatar : null
	};
	Base.call(this, 'user');
	
	this.initialData = {
		login : null,
		password : null
	}
	
}

User.publicAttributes = Base.publicAttributes.concat(['login', 'firstName', 'lastName', 'isActive', 'isStaff', 'isSuperuser', 'lastSeen', 'joinedDate', 'groups', 'gravatar']);

User.staffAttributes = User.publicAttributes.concat(Base.staffAttributes).concat(['email', 'password']);

User.publicWriteAttributes = ['firstName', 'lastName', 'email',  'isActive', 'password'];

User.staffWriteAttributes = User.publicWriteAttributes.concat([ 'isStaff', 'isSuperuser', 'login']);

User.hiddenPassword = 'HIDDEN-PASSWORD';

util.inherits(User, Base);

User.prototype.hasPerm = function (perm, user, callback) {
	
	switch (perm) {
		case 'read':
		case 'create':
			callback(null, true);
			break;
					
		case 'write':
		case 'del':
			callback(null, user.isStaff === true ||
			user.isSuperuser === true || user.id === this.id);
			
			break;
			
		default:
			return false;
		
	}
}

User.prototype._validate = function(callback) {
	//this.validateString('login', false, 2, 30);
	
	if (this.initialData.login !== null) {
		
		if (this.initialData.login !== this.login) {
			this.addValidationError('login', 'is not editable');
		}
		
	} 
	else {
		this.validateRegexp('login', '^[\-_\.0-9a-zA-Z]{2,30}$', false);
	}
	
	this.validateString('firstName', true, null, 128);
	this.validateString('lastName', true, null, 128);
	this.validateEmail('email');

	callback(null);
}

User.prototype._generateHash = function() {
	
	h = crypto.createHash('md5')
	h.update(this._type);
	h.update(this.email);
	
	if (this.firstName !== null) {
	 h.update(this.firstName);
	}
	
	if (this.lastName !== null) {
		h.update(this.lastName);
	}
	
	
	h.update(this.login);
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
	
	// restore initial password if it is unchanged
	if (this.password == User.hiddenPassword) {
   this._data.password = this.initialData.password;
  }
	
	h = crypto.createHash('md5')
	h.update(this.email);
	
	this._data.gravatar = h.digest('hex');
	
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

User.prototype.serialize = function(keys) {

  var obj = Base.prototype.serialize.call(this, keys);
  
  if (keys.indexOf('password') !== -1) {
    obj.password = User.hiddenPassword;
  }
  
  return obj;
  
}


User.get = function(options, callback) {
	Base.get(options, User, function(err, obj) {

		// save initial agenda value to check perms
		if(err === null) {
			obj.initialData = {
				login : obj.login,
				password : obj.password
			}
		}

		callback(err, obj);

	})
}
/*
User.get = function(options, callback) {
	Base.get(options, User, callback)
}
*/
User.search = function(query, attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'user', attrs, User, callback)
}

User.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'user', callback)
}

exports.User = User;
