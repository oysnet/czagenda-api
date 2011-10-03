var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");


const type = 'agenda-write-user'

function AgendaWriteUser () {
	BasePermission.call(this, type);	
}

util.inherits(AgendaWriteUser, BasePermission);

AgendaWriteUser.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
AgendaWriteUser.staffAttributes = AgendaWriteUser.publicAttributes.concat(Base.staffAttributes);

AgendaWriteUser.prototype._generateId = function(doc) {
	return '/perms/agenda/wu/' + this._generateUUID();
}

AgendaWriteUser.prototype._validate = function () {
	this.validateRegexp('applyOn', '^/agenda/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('grantTo', '^/user/[\-_\.0-9a-z]+$', false);
}

AgendaWriteUser.get = function(options, callback) {
	Base.get(options, AgendaWriteUser, callback)
}

AgendaWriteUser.search = function(query, attrs,callback) {
	Base.search(query, 'agenda', type, attrs,AgendaWriteUser, callback)
}

AgendaWriteUser.count = function(query, callback) {
	Base.count(query, 'agenda', type,callback)
}

module.exports = AgendaWriteUser;