var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestGroupWriteUser (server) {
	
	this._urlPrefix = '/perms/group/wu';
	
	RestOAuthBasePerm.call(this, 'group-write-user', models.perms.GroupWriteUser, server);
	
	this._initServer();
	
}
util.inherits(RestGroupWriteUser, RestOAuthBasePerm);


exports.RestGroupWriteUser = RestGroupWriteUser