var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");


const type = 'agenda-write-group'

function AgendaWriteGroup () {
	BasePermission.call(this, type);	
}

util.inherits(AgendaWriteGroup, BasePermission);

AgendaWriteGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
AgendaWriteGroup.staffAttributes = AgendaWriteGroup.publicAttributes.concat(Base.staffAttributes);

AgendaWriteGroup.publicWriteAttributes = ['grantTo', 'applyOn'];
AgendaWriteGroup.staffWriteAttributes = AgendaWriteGroup.publicWriteAttributes;

AgendaWriteGroup.prototype._generateId = function(doc) {
	return '/perms/agenda/wg/' + this._generateUUID();
}

AgendaWriteGroup.prototype._validate = function (callback) {
	this.validateRegexp('applyOn', '^/agenda/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/group/[\-_\.0-9a-z]+$', false);
	callback(null);
}

AgendaWriteGroup.get = function(options, callback) {
	Base.get(options, AgendaWriteGroup, callback)
}

AgendaWriteGroup.search = function(query, attrs,callback) {
	Base.search(query, 'agenda', type, attrs,AgendaWriteGroup, callback)
}

AgendaWriteGroup.count = function(query, callback) {
	Base.count(query, 'agenda', type,callback)
}

module.exports = AgendaWriteGroup;