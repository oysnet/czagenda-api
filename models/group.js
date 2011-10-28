var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var errors = require('./errors.js');
var settings = require('../settings.js');
function Group () {
	this._attributs = {title : null, description : null, writeGroups : null, writeUsers : null, users : null, computedWriteUsers : [], computedWriteGroups : [], computedWriteUsersPerms : [], computedWriteGroupsPerms : []};
	Base.call(this, 'group');	
}

util.inherits(Group, Base);

Group.publicAttributes = Base.publicAttributes.concat(['title', 'description', 'writeGroups', 'writeUsers', 'users' ]);
Group.staffAttributes = Group.publicAttributes.concat(Base.staffAttributes);

Group.publicWriteAttributes = ['title', 'description'];
Group.staffWriteAttributes = Group.publicWriteAttributes;

Group.prototype._validate = function (callback) {
	this.validateString('title', false, 5, 128);
	this.validateString('description', true, null, 1024);
	callback(null);
}

Group.prototype.hasPerm = function (perm, user, callback) {
		
	switch (perm) {
		case 'read':
		case 'create':
			callback(null, true);
			break;
					
		case 'write':
		case 'del':
			callback(null, this.hasWritePerm(user));
			break;
			
		default:
			return false;
		
	}
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

/*
Group.prototype.save = function (callback) {
	
	if (typeof(this.title) !== 'string') {
		this.addValidationError('title', 'a string is required')
		callback(new errors.ValidationError(), this);
		return;
	}
	
	Base.prototype.save.call(this, callback);
	
}
*/
Group.prototype._preSave = function (callback) {
	
	if (this.id === null) {
		this._data.writeGroups = this._data.id + '/perms/wg';
		this._data.writeUsers = this._data.id + '/perms/wu';
		this._data.users = this._data.id + '/users';
	}
	callback(null);
}

Group.get = function(options, callback) {
	Base.get(options,Group, callback)
}

Group.search = function(query, attrs,callback) {
	Base.search(query, settings.elasticsearch.index, 'group',attrs, Group, callback)
}

Group.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'group',callback)
}


exports.Group = Group;