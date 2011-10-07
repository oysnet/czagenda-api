var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');

const type = 'event-read-group'

function EventReadGroup () {
	BasePermission.call(this, type);	
}

util.inherits(EventReadGroup, BasePermission);

EventReadGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EventReadGroup.staffAttributes = EventReadGroup.publicAttributes.concat(Base.staffAttributes);

EventReadGroup.publicWriteAttributes = ['grantTo', 'applyOn'];
EventReadGroup.staffWriteAttributes = EventReadGroup.publicWriteAttributes;

EventReadGroup.prototype._generateId = function(doc) {
	return '/perms/event/rg/' + this._generateUUID();
}

EventReadGroup.prototype._validate = function (callback) {
	this.validateRegexp('applyOn', '^/event/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/group/[\-_\.0-9a-z]+$', false);
	callback(null);
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