var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");


const type = 'group-write-group'

function GroupWriteGroup () {
	BasePermission.call(this, type);	
}

util.inherits(GroupWriteGroup, BasePermission);

GroupWriteGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
GroupWriteGroup.staffAttributes = GroupWriteGroup.publicAttributes.concat(Base.staffAttributes);

GroupWriteGroup.prototype._generateId = function(doc) {
	return '/perms/group/wg/' + this._generateUUID();
}

GroupWriteGroup.prototype._validate = function (callback) {
	this.validateRegexp('applyOn', '^/group/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/group/[\-_\.0-9a-z]+$', false);
	callback(null);
}

GroupWriteGroup.get = function(options, callback) {
	Base.get(options, GroupWriteGroup, callback)
}

GroupWriteGroup.search = function(query,attrs, callback) {
	Base.search(query, 'agenda', type, attrs,GroupWriteGroup, callback)
}

GroupWriteGroup.count = function(query, callback) {
	Base.count(query, 'agenda', type,callback)
}


module.exports = GroupWriteGroup;