var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");


const type = 'event-write-group'

function EventWriteGroup () {
	BasePermission.call(this, type);	
}

util.inherits(EventWriteGroup, BasePermission);

EventWriteGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EventWriteGroup.staffAttributes = EventWriteGroup.publicAttributes.concat(Base.staffAttributes);

EventWriteGroup.prototype._generateId = function(doc) {
	return '/perms/event/wg/' + this._generateUUID();
}

EventWriteGroup.prototype._validate = function () {
	this.validateRegexp('applyOn', '^/event/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/group/[\-_\.0-9a-z]+$', false);
}

EventWriteGroup.get = function(options, callback) {
	Base.get(options, EventWriteGroup, callback)
}

EventWriteGroup.search = function(query, attrs,callback) {
	Base.search(query, 'agenda', type, attrs,EventWriteGroup, callback)
}

EventWriteGroup.count = function(query, callback) {
	Base.count(query, 'agenda', type,callback)
}


module.exports = EventWriteGroup;