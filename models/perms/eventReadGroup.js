var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");


const type = 'event-read-group'

function EventReadGroup () {
	BasePermission.call(this, type);	
}

util.inherits(EventReadGroup, BasePermission);

EventReadGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EventReadGroup.staffAttributes = EventReadGroup.publicAttributes.concat(Base.staffAttributes);


EventReadGroup.prototype._generateId = function(doc) {
	return '/perms/event/rg/' + this._generateUUID();
}

EventReadGroup.prototype._validate = function () {
	this.validateRegexp('applyOn', '^/event/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/group/[\-_\.0-9a-z]+$', false);
}

EventReadGroup.get = function(options, callback) {
	Base.get(options, EventReadGroup, callback)
}

EventReadGroup.search = function(query, attrs,callback) {
	Base.search(query, 'agenda', type, attrs,EventReadGroup, callback)
}

EventReadGroup.count = function(query, callback) {
	Base.count(query, 'agenda', type,callback)
}


module.exports = EventReadGroup;