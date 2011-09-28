var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestAgendaWriteUser (server) {
	RestBase.call(this, 'agenda-write-user', models.perms.AgendaWriteUser, server);
	
	this._urlPrefix = '/perms/agenda/wu';
	this._allowedMethods = [ 'post', 'del'];
	
	this._initServer();
	
}
util.inherits(RestAgendaWriteUser, RestBase);


exports.RestAgendaWriteUser = RestAgendaWriteUser