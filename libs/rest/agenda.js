var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestAgenda (server) {
	
	RestBase.call(this, 'agenda', models.Agenda, server);
	
	var urls = {
		get : {
			'/agenda/:id/perms/wu' : this.permsUserWrite,
			'/agenda/:id/perms/wg' : this.permsGroupWrite
		}
	}
	this.addurls(urls);
	
	this._initServer();
}
util.inherits(RestAgenda, RestBase);

RestAgenda.prototype.permsUserWrite = function (req, res) {
	var permClass = models.perms.getPermClass('agenda', 'user', 'write'), grantToClass = models.User;
	this._perms(req, res, permClass, grantToClass);
}


RestAgenda.prototype.permsGroupWrite = function (req, res) {
	var permClass = models.perms.getPermClass('agenda', 'group', 'write'), grantToClass = models.Group;
	this._perms(req, res, permClass, grantToClass);
}

exports.RestAgenda = RestAgenda