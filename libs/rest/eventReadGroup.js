var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestEventReadGroup (server) {
	
	this._urlPrefix = '/perms/event/rg';
	
	RestOAuthBasePerm.call(this, 'event-read-group', models.perms.EventReadGroup, server);
	
	this._initServer();
	
}
util.inherits(RestEventReadGroup, RestOAuthBasePerm);


exports.RestEventReadGroup = RestEventReadGroup