var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestGroupWriteGroup (server) {
	this._urlPrefix = '/perms/group/wg';
	
	RestOAuthBasePerm.call(this, 'group-write-group', models.perms.GroupWriteGroup, server);
	
	this._initServer();
	
}
util.inherits(RestGroupWriteGroup, RestOAuthBasePerm);


exports.RestGroupWriteGroup = RestGroupWriteGroup