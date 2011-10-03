var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var errors = require('./errors.js');

function Group () {
	this._attributs = {title : null, description : null, writeGroups : null, writeUsers : null, users : null};
	Base.call(this, 'group');	
}

util.inherits(Group, Base);

Group.publicAttributes = Base.publicAttributes.concat(['title', 'description', 'writeGroups', 'writeUsers', 'users' ]);
Group.staffAttributes = Group.publicAttributes.concat(Base.staffAttributes);

Group.prototype._validate = function () {
	this.validateString('title', false, 5, 128);
	this.validateString('description', true, null, 1024);
}

Group.prototype._generateHash = function () {
	
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(JSON.stringify(this.title));
	h.update(JSON.stringify(this.description));
	this._data['hash'] = h.digest('hex')
	
}

Group.prototype._generateId = function () {
	return '/group/' + utils.slugify(this.title);
}


Group.prototype.save = function (callback) {
	
	if (typeof(this.title) !== 'string') {
		this.addValidationError('title', 'a string is required')
		callback(new errors.ValidationError(), this);
		return;
	}
	
	Base.prototype.save.call(this, callback);
	
}

Group.prototype._preSave = function () {
	
	if (this.id === null) {
		this._data.writeGroups = this._data.id + '/perms/wg';
		this._data.writeUsers = this._data.id + '/perms/wu';
		this._data.users = this._data.id + '/users';
	}
		
}

Group.get = function(options, callback) {
	Base.get(options,Group, callback)
}

Group.search = function(query, attrs,callback) {
	Base.search(query, 'agenda', 'group',attrs, Group, callback)
}

Group.count = function(query, callback) {
	Base.count(query, 'agenda', 'group',callback)
}


exports.Group = Group;