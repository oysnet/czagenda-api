var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");


const type = 'group-write-user'

function GroupWriteUser () {
	BasePermission.call(this, type);	
}

util.inherits(GroupWriteUser, BasePermission);

GroupWriteUser.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
GroupWriteUser.staffAttributes = GroupWriteUser.publicAttributes.concat(Base.staffAttributes);

GroupWriteUser.publicWriteAttributes = ['grantTo', 'applyOn'];
GroupWriteUser.staffWriteAttributes = GroupWriteUser.publicWriteAttributes;

GroupWriteUser.prototype._generateId = function(doc) {
	return '/perms/group/wu/' + this._generateUUID();
}

GroupWriteUser.prototype._validate = function (callback) {
	this.validateRegexp('applyOn', '^/group/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/user/[\-_\.0-9a-z]+$', false);
	callback(null);
}

GroupWriteUser.get = function(options, callback) {
	Base.get(options, GroupWriteUser, callback)
}

GroupWriteUser.search = function(query, attrs,callback) {
	Base.search(query, 'agenda', type, attrs,GroupWriteUser, callback)
}

GroupWriteUser.count = function(query, callback) {
	Base.count(query, 'agenda', type,callback)
}


module.exports = GroupWriteUser;