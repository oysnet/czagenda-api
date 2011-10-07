var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');

const type = 'group-write-group'

function GroupWriteGroup () {
	BasePermission.call(this, type);	
}

util.inherits(GroupWriteGroup, BasePermission);

GroupWriteGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
GroupWriteGroup.staffAttributes = GroupWriteGroup.publicAttributes.concat(Base.staffAttributes);

GroupWriteGroup.publicWriteAttributes = ['grantTo', 'applyOn'];
GroupWriteGroup.staffWriteAttributes = GroupWriteGroup.publicWriteAttributes;

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
	Base.search(query, settings.elasticsearch.index, type, attrs,GroupWriteGroup, callback)
}

GroupWriteGroup.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, type,callback)
}


module.exports = GroupWriteGroup;