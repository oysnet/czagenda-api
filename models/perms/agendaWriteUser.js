var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');
var models = require('../../models');

const type = 'agenda-write-user'

function AgendaWriteUser () {
	BasePermission.call(this, type);	
}

util.inherits(AgendaWriteUser, BasePermission);

AgendaWriteUser.applyOnClass = models.Agenda;

AgendaWriteUser.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
AgendaWriteUser.staffAttributes = AgendaWriteUser.publicAttributes.concat(Base.staffAttributes);

AgendaWriteUser.publicWriteAttributes = ['grantTo', 'applyOn'];
AgendaWriteUser.staffWriteAttributes = AgendaWriteUser.publicWriteAttributes;

AgendaWriteUser.prototype._generateId = function(doc) {
	return '/perms/agenda/wu/' + this._generateUUID();
}

AgendaWriteUser.prototype._validate = function (callback) {
	this.validateRegexp('applyOn', '^/agenda/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/user/[\-_\.0-9a-zA-Z]+$', false);
	callback(null);
}

AgendaWriteUser.prototype._postSave = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Agenda, 'computedWriteUsers', true, next);
}

AgendaWriteUser.prototype._postDel = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Agenda, 'computedWriteUsers', false, next);
}

AgendaWriteUser.get = function(options, callback) {
	Base.get(options, AgendaWriteUser, callback)
}

AgendaWriteUser.search = function(query, attrs,callback) {
	Base.search(query, settings.elasticsearch.index, type, attrs,AgendaWriteUser, callback)
}

AgendaWriteUser.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, type,callback)
}

module.exports = AgendaWriteUser;