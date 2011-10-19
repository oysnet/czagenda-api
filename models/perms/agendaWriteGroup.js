var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');

var models = require('../../models');

const type = 'agenda-write-group'

function AgendaWriteGroup () {
	BasePermission.call(this, type);	
}

util.inherits(AgendaWriteGroup, BasePermission);

AgendaWriteGroup.applyOnClass = models.Agenda;

AgendaWriteGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
AgendaWriteGroup.staffAttributes = AgendaWriteGroup.publicAttributes.concat(Base.staffAttributes);

AgendaWriteGroup.publicWriteAttributes = ['grantTo', 'applyOn'];
AgendaWriteGroup.staffWriteAttributes = AgendaWriteGroup.publicWriteAttributes;

AgendaWriteGroup.prototype._generateId = function(doc) {
	return '/perms/agenda/wg/' + this._generateUUID();
}

AgendaWriteGroup.prototype._validate = function (callback) {
	
	var keys = [];
	
	if (this.validateRegexp('applyOn', '^/agenda/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('applyOn');
	}
	if (this.validateRegexp('grantTo', '^/group/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('grantTo');
	}
	
	this.validateExists(keys, callback);
}


AgendaWriteGroup.prototype._postSave = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Agenda, 'computedWriteGroups', true, next);
}

AgendaWriteGroup.prototype._postDel = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Agenda, 'computedWriteGroups', false, next);
}




AgendaWriteGroup.get = function(options, callback) {
	Base.get(options, AgendaWriteGroup, callback)
}

AgendaWriteGroup.search = function(query, attrs,callback) {
	Base.search(query, settings.elasticsearch.index, type, attrs,AgendaWriteGroup, callback)
}

AgendaWriteGroup.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, type,callback)
}

module.exports = AgendaWriteGroup;