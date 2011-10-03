var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");


const type = 'event-read-user'

function EventReadUser () {
	BasePermission.call(this, type);	
}

util.inherits(EventReadUser, BasePermission);

EventReadUser.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EventReadUser.staffAttributes = EventReadUser.publicAttributes.concat(Base.staffAttributes);

EventReadUser.prototype._generateId = function(doc) {
	return '/perms/event/ru/' + this._generateUUID();
}

EventReadUser.prototype._validate = function () {
	this.validateRegexp('applyOn', '^/event/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/user/[\-_\.0-9a-z]+$', false);
}

EventReadUser.get = function(options, callback) {
	Base.get(options, EventReadUser, callback)
}

EventReadUser.search = function(query, attrs,callback) {
	Base.search(query, 'agenda', type, attrs,EventReadUser, callback)
}

EventReadUser.count = function(query, callback) {
	Base.count(query, 'agenda', type,callback)
}

module.exports = EventReadUser;