var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestGroupWriteGroup (server) {
	RestBase.call(this, 'group-write-group', models.perms.GroupWriteGroup, server);
	
	this._urlPrefix = '/perms/group/wg';
	this._allowedMethods = [ 'post', 'del'];
	
	this._initServer();
	
}
util.inherits(RestGroupWriteGroup, RestBase);


exports.RestGroupWriteGroup = RestGroupWriteGroup