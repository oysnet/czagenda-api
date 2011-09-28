var Base = require('./base.js').Base;
var util = require("util");
var settings = require('../settings.js')
var utils = require('../libs/utils.js');

var validatorEnvironment = require('../libs/schemas/validator').validatorEnvironment;

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

User.publicAttributes = Base.publicAttributes.concat([ 'login', 'firstName', 'lastName', 'email', 'isActive', 'isStaff','isSuperuser', 'lastLogin', 'dateJoined', 'groups' ]);
User.staffAttributes = User.publicAttributes.concat(Base.staffAttributes);

util.inherits(User, Base);

User.prototype._validate = function() {
	/*
	var env = validatorEnvironment.getEnv();
	var schema = env.findSchema(settings.schema.user);
	 var report = env.validate(this.getObjectAttributs(),schema);
	 if (report.errors.length > 0) {
		 this.validationErrors = report.errors;
		 throw Error('Validation errors');
	 }
	 */
}

User.prototype._generateHash = function() {
	c = require('crypto')
	h = c.createHash('md5')
	h.update(this._type);
	h.update(this.email);
	this._data['hash'] = h.digest('hex')
}

User.prototype._generateId = function () {
	return '/user/' + utils.slugify(this.login);
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
	Base.search(query, 'agenda', 'user', attrs, User, callback)
}

User.count = function(query, callback) {
	Base.count(query, 'agenda', 'user',callback)
}

exports.User = User;