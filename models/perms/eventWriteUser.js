var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");


const type = 'event-write-user'

function EventWriteUser () {
	BasePermission.call(this, type);	
}

util.inherits(EventWriteUser, BasePermission);

EventWriteUser.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EventWriteUser.staffAttributes = EventWriteUser.publicAttributes.concat(Base.staffAttributes);

EventWriteUser.publicWriteAttributes = ['grantTo', 'applyOn'];
EventWriteUser.staffWriteAttributes = EventWriteUser.publicWriteAttributes;

EventWriteUser.prototype._generateId = function(doc) {
	return '/perms/event/wu/' + this._generateUUID();
}

EventWriteUser.prototype._validate = function (callback) {
	this.validateRegexp('applyOn', '^/event/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/user/[\-_\.0-9a-z]+$', false);
	callback(null);
}

EventWriteUser.get = function(options, callback) {
	Base.get(options, EventWriteUser, callback)
}

EventWriteUser.search = function(query,attrs, callback) {
	Base.search(query, 'agenda', type, attrs,EventWriteUser, callback)
}

EventWriteUser.count = function(query, callback) {
	Base.count(query, 'agenda', type,callback)
}

module.exports = EventWriteUser;