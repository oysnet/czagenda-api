var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestAgendaWriteGroup (server) {
	this._urlPrefix = '/perms/agenda/wg';
	
	RestOAuthBasePerm.call(this, 'agenda-write-group', models.perms.AgendaWriteGroup, server);
	
	this._initServer();
	
}
util.inherits(RestAgendaWriteGroup, RestOAuthBasePerm);


exports.RestAgendaWriteGroup = RestAgendaWriteGroup