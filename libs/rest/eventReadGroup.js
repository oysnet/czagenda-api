var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestEventReadGroup (server) {
	RestBase.call(this, 'event-read-group', models.perms.EventReadGroup, server);
	
	this._urlPrefix = '/perms/event/rg';
	this._allowedMethods = [ 'post', 'del'];
	
	this._initServer();
	
}
util.inherits(RestEventReadGroup, RestBase);


exports.RestEventReadGroup = RestEventReadGroup