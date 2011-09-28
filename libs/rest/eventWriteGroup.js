var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestEventWriteGroup (server) {
	RestBase.call(this, 'event-write-group', models.perms.EventWriteGroup, server);
	
	this._urlPrefix = '/perms/event/wg';
	this._allowedMethods = [ 'post', 'del'];
	
	this._initServer();
	
}
util.inherits(RestEventWriteGroup, RestBase);


exports.RestEventWriteGroup = RestEventWriteGroup