var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestEventReadUser (server) {
	this._urlPrefix = '/perms/event/ru';
	
	RestOAuthBasePerm.call(this, 'event-read-user', models.perms.EventReadUser, server);
	
	this._initServer();
	
}
util.inherits(RestEventReadUser, RestOAuthBasePerm);


exports.RestEventReadUser = RestEventReadUser