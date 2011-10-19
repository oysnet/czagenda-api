var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');
var models = require('../../models');
const type = 'event-write-user'

function EventWriteUser () {
	BasePermission.call(this, type);	
}

util.inherits(EventWriteUser, BasePermission);

EventWriteUser.applyOnClass = models.Event;

EventWriteUser.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EventWriteUser.staffAttributes = EventWriteUser.publicAttributes.concat(Base.staffAttributes);

EventWriteUser.publicWriteAttributes = ['grantTo', 'applyOn'];
EventWriteUser.staffWriteAttributes = EventWriteUser.publicWriteAttributes;

EventWriteUser.prototype._generateId = function(doc) {
	return '/perms/event/wu/' + this._generateUUID();
}

EventWriteUser.prototype._validate = function (callback) {
	
	var keys = [];
	
	if (this.validateRegexp('applyOn', '^/event/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('applyOn');
	}
	if (this.validateRegexp('grantTo', '^/user/[\-_\.0-9a-zA-Z]+$', false) === true) {
		keys.push('grantTo');
	}
	
	this.validateExists(keys, callback);
	
}


EventWriteUser.prototype._postSave = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Event, 'computedWriteUsers', true, next);
}

EventWriteUser.prototype._postDel = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Event, 'computedWriteUsers', false, next);
}


EventWriteUser.get = function(options, callback) {
	Base.get(options, EventWriteUser, callback)
}

EventWriteUser.search = function(query,attrs, callback) {
	Base.search(query, settings.elasticsearch.index, type, attrs,EventWriteUser, callback)
}

EventWriteUser.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, type,callback)
}

module.exports = EventWriteUser;