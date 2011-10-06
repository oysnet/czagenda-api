var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");

var models = require('../../models');

var Membership = require('../../models/membership.js').Membership;
var async = require('async');

var RestGroup = exports.RestGroup = function (server) {
	
	RestOAuthModel.call(this, 'group', models.Group, server);
	
	this._urls.get[this._urlPrefix + '/:id/users'] = {fn :  this.memberships};
	this._urls.get[this._urlPrefix + '/:id/perms/wu'] = {fn :  this.permsUserWrite};
	this._urls.get[this._urlPrefix + '/:id/perms/wg'] = {fn :  this.permsGroupWrite};
	
	
	this._initServer();
}
util.inherits(RestGroup, RestOAuthModel);

RestGroup.prototype.permsUserWrite = function (req, res) {
	var permClass = models.perms.getPermClass('group', 'user', 'write'), grantToClass = models.User;
	this._perms(req, res, permClass, grantToClass);
}


RestGroup.prototype.permsGroupWrite = function (req, res) {
	var permClass = models.perms.getPermClass('group', 'group', 'write'), grantToClass = models.Group;
	this._perms(req, res, permClass, grantToClass);
}

RestGroup.prototype.memberships = function(req, res) {
	
	var q = {
		query : {term : { group : '/group/' + req.params.id}}};
	
	
	var tasks = [
		
		function (callback) {
			models.Membership.search(q,  ["user", "createDate", "updateDate"], function ( err, result) {
				
				if (err !== null) {
					callback(err)
				} else {
					callback(null,  result);
				}
				
			});
		}
	];
	
	if (req.query.include_docs == true || (typeof(req.query.include_docs) !== 'undefined' && req.query.include_docs.toLowerCase() == 'true')) {
		tasks.push(function (result, callback) {
			
			var ids = [];
			var byuser = {};
			
			for (var i = 0, l = result.rows.length; i < l;i++) {
				ids.push(result.rows[i].user)
				byuser[result.rows[i].user] = result.rows[i];
			}
			
			var q = {size: 10000, query : {ids : {values : ids}}}
			
			models.User.search(q, models.User.publicAttributes, function ( err, users) {
				
				if (err !== null) {
					callback(err);
				} else {
					
					for (var i = 0, l = users.rows.length; i<l; i++ ) {
						byuser[users.rows[i].id].user = users.rows[i];
					}
					callback(null,  result);
				}
			});
		});
	}
	
	async.waterfall(tasks, function ( err, result) {
		if (err !== null) {
			if (err instanceof errors.IndexDoesNotExist) {
				res.statusCode = statusCode.NOT_FOUND;
				res.end('Not found');
			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}
		} else {
			res.end(this._renderJson(req, res, result));
		}
	}.bind(this));
	
	
}