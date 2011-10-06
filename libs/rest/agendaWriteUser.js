var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestAgendaWriteUser (server) {
	
	this._urlPrefix = '/perms/agenda/wu';
	
	RestOAuthBasePerm.call(this, 'agenda-write-user', models.perms.AgendaWriteUser, server);
	
	this._initServer();
	
}
util.inherits(RestAgendaWriteUser, RestOAuthBasePerm);


exports.RestAgendaWriteUser = RestAgendaWriteUser