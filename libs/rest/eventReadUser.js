var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestEventReadUser (server) {
	RestBase.call(this, 'event-read-user', models.perms.EventReadUser, server);
	
	this._urlPrefix = '/perms/event/ru';
	this._allowedMethods = [ 'post', 'del'];
	
	this._initServer();
	
}
util.inherits(RestEventReadUser, RestBase);


exports.RestEventReadUser = RestEventReadUser