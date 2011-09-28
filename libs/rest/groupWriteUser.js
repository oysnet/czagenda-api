var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestGroupWriteUser (server) {
	RestBase.call(this, 'group-write-user', models.perms.GroupWriteUser, server);
	
	this._urlPrefix = '/perms/group/wu';
	this._allowedMethods = [ 'post', 'del'];
	
	this._initServer();
	
}
util.inherits(RestGroupWriteUser, RestBase);


exports.RestGroupWriteUser = RestGroupWriteUser