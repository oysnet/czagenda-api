var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");

var models = require('../../models');

function RestAgenda (server) {
	
	RestOAuthModel.call(this, 'agenda', models.Agenda, server);
	
	this._urls.get[this._urlPrefix + '/:id/perms/wu'] = {fn :  this.permsUserWrite};
	this._urls.get[this._urlPrefix + '/:id/perms/wg'] = {fn :  this.permsGroupWrite};
	
	this._initServer();
}
util.inherits(RestAgenda, RestOAuthModel);

RestAgenda.prototype.permsUserWrite = function (req, res) {
	var permClass = models.perms.getPermClass('agenda', 'user', 'write'), grantToClass = models.User;
	this._perms(req, res, permClass, grantToClass);
}


RestAgenda.prototype.permsGroupWrite = function (req, res) {
	var permClass = models.perms.getPermClass('agenda', 'group', 'write'), grantToClass = models.Group;
	this._perms(req, res, permClass, grantToClass);
}

exports.RestAgenda = RestAgenda