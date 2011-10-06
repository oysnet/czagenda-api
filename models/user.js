var Base = require('./base.js').Base;
var util = require("util");
var settings = require('../settings.js')
var utils = require('../libs/utils.js');
var errors = require('./errors.js');


function User () {
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
		dateJoined : null,
		groups : null
	};
	Base.call(this, 'user');
}

User.publicAttributes = Base.publicAttributes.concat([ 'login', 'firstName', 'lastName', 'isActive', 'isStaff','isSuperuser', 'lastLogin', 'dateJoined', 'groups' ]); // enlever email
User.staffAttributes = User.publicAttributes.concat(Base.staffAttributes).concat(['email', 'password']);

User.publicWriteAttributes = ['login', 'firstName', 'lastName', 'email', 'password', 'isActive']; // enlever password
User.staffWriteAttributes = User.publicWriteAttributes.concat(['isActive', 'isStaff', 'isSuperuser']); // ajouter password

util.inherits(User, Base);

User.prototype._validate = function(callback) {
	this.validateString('login', false, 2, 30);
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

User.prototype._generateId = function () {
	return '/user/' + this.login;
}

User.prototype.save = function (callback) {
	
	if (typeof(this.login) !== 'string') {
		this.addValidationError('login', 'a string is required')
		callback(new errors.ValidationError(), this);
		return;
	}
	
	Base.prototype.save.call(this, callback);
	
}

User.prototype._preSave = function () {
	if (this.id === null) {
		this._data.groups = this._data.id + '/groups';
	}
}


User.get = function(options, callback) {
	Base.get(options, User, callback)
}

User.search = function(query, attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'user', attrs, User, callback)
}

User.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'user',callback)
}

exports.User = User;