var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestEntityWriteGroup (server) {
	this._urlPrefix = '/perms/entity/wg';
	
	RestOAuthBasePerm.call(this, 'entity-write-group', models.perms.EntityWriteGroup, server);
	
	this._initServer();
	
}
util.inherits(RestEntityWriteGroup, RestOAuthBasePerm);


exports.RestEntityWriteGroup = RestEntityWriteGroup