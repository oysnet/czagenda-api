var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');
var models = require('../../models');
const type = 'event-read-user'

function EventReadUser () {
	BasePermission.call(this, type);	
}

util.inherits(EventReadUser, BasePermission);

EventReadUser.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EventReadUser.staffAttributes = EventReadUser.publicAttributes.concat(Base.staffAttributes);

EventReadUser.publicWriteAttributes = ['grantTo', 'applyOn'];
EventReadUser.staffWriteAttributes = EventReadUser.publicWriteAttributes;


EventReadUser.prototype._generateId = function(doc) {
	return '/perms/event/ru/' + this._generateUUID();
}

EventReadUser.prototype._validate = function (callback) {
	this.validateRegexp('applyOn', '^/event/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/user/[\-_\.0-9a-zA-Z]+$', false);
	callback(null);
}

EventReadUser.prototype._postSave = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Event, 'computedReadUsers', true, next);
}

EventReadUser.prototype._postDel = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Event, 'computedReadUsers', false, next);
}

EventReadUser.get = function(options, callback) {
	Base.get(options, EventReadUser, callback)
}

EventReadUser.search = function(query, attrs,callback) {
	Base.search(query, settings.elasticsearch.index, type, attrs,EventReadUser, callback)
}

EventReadUser.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, type,callback)
}

module.exports = EventReadUser;