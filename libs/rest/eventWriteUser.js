var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestEventWriteUser (server) {
	
	this._urlPrefix = '/perms/event/wu';
	
	RestOAuthBasePerm.call(this, 'event-write-user', models.perms.EventWriteUser, server);
	
	this._initServer();
	
}
util.inherits(RestEventWriteUser, RestOAuthBasePerm);


exports.RestEventWriteUser = RestEventWriteUser