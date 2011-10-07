var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');

const type = 'event-write-group'

function EventWriteGroup () {
	BasePermission.call(this, type);	
}

util.inherits(EventWriteGroup, BasePermission);

EventWriteGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EventWriteGroup.staffAttributes = EventWriteGroup.publicAttributes.concat(Base.staffAttributes);

EventWriteGroup.publicWriteAttributes = ['grantTo', 'applyOn'];
EventWriteGroup.staffWriteAttributes = EventWriteGroup.publicWriteAttributes;

EventWriteGroup.prototype._generateId = function(doc) {
	return '/perms/event/wg/' + this._generateUUID();
}

EventWriteGroup.prototype._validate = function (callback) {
	this.validateRegexp('applyOn', '^/event/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/group/[\-_\.0-9a-z]+$', false);
	callback(null);
}

EventWriteGroup.get = function(options, callback) {
	Base.get(options, EventWriteGroup, callback)
}

EventWriteGroup.search = function(query, attrs,callback) {
	Base.search(query, settings.elasticsearch.index, type, attrs,EventWriteGroup, callback)
}

EventWriteGroup.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, type,callback)
}


module.exports = EventWriteGroup;