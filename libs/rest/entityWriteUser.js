var RestOAuthBasePerm = require('./oAuthBasePerm.js').RestOAuthBasePerm;
var util = require("util");

var models = require('../../models');

function RestEntityWriteUser (server) {
	
	this._urlPrefix = '/perms/entity/wu';
	
	RestOAuthBasePerm.call(this, 'agenda-entity-user', models.perms.EntityWriteUser, server);
	
	this._initServer();
	
}
util.inherits(RestEntityWriteUser, RestOAuthBasePerm);


exports.RestEntityWriteUser = RestEntityWriteUser