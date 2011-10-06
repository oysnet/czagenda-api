var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestEventWriteGroup (server) {
	this._urlPrefix = '/perms/event/wg';
	
	RestOAuthBasePerm.call(this, 'event-write-group', models.perms.EventWriteGroup, server);
	
	this._initServer();
	
}
util.inherits(RestEventWriteGroup, RestOAuthBasePerm);


exports.RestEventWriteGroup = RestEventWriteGroup