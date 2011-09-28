var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestAgendaWriteGroup (server) {
	RestBase.call(this, 'agenda-write-group', models.perms.AgendaWriteGroup, server);
	
	this._urlPrefix = '/perms/agenda/wg';
	this._allowedMethods = [ 'post', 'del'];
	
	this._initServer();
	
}
util.inherits(RestAgendaWriteGroup, RestBase);


exports.RestAgendaWriteGroup = RestAgendaWriteGroup