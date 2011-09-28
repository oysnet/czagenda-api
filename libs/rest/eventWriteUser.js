var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestEventWriteUser (server) {
	RestBase.call(this, 'event-write-user', models.perms.EventWriteUser, server);
	
	this._urlPrefix = '/perms/event/wu';
	this._allowedMethods = [ 'post', 'del'];
	
	this._initServer();
	
}
util.inherits(RestEventWriteUser, RestBase);


exports.RestEventWriteUser = RestEventWriteUser