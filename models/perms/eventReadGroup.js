var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');
var models = require('../../models');
const type = 'event-read-group'

function EventReadGroup () {
	BasePermission.call(this, type);	
}

util.inherits(EventReadGroup, BasePermission);

EventReadGroup.applyOnClass = models.Event;

EventReadGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EventReadGroup.staffAttributes = EventReadGroup.publicAttributes.concat(Base.staffAttributes);

EventReadGroup.publicWriteAttributes = ['grantTo', 'applyOn'];
EventReadGroup.staffWriteAttributes = EventReadGroup.publicWriteAttributes;

EventReadGroup.prototype._generateId = function(doc) {
	return '/perms/event/rg/' + this._generateUUID();
}

EventReadGroup.prototype._validate = function (callback) {
	
	var keys = [];
	
	if (this.validateRegexp('applyOn', '^/event/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('applyOn');
	}
	if (this.validateRegexp('grantTo', '^/group/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('grantTo');
	}
	
	this.validateExists(keys, callback);
}

EventReadGroup.prototype._postSave = function (err, next) {
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Event, 'computedReadGroups', true, next);
}

EventReadGroup.prototype._postDel = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Event, 'computedReadGroups', false, next);
}

EventReadGroup.get = function(options, callback) {
	Base.get(options, EventReadGroup, callback)
}

EventReadGroup.search = function(query, attrs,callback) {
	Base.search(query, settings.elasticsearch.index, type, attrs,EventReadGroup, callback)
}

EventReadGroup.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, type,callback)
}


module.exports = EventReadGroup;