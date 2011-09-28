var RestBase = require('./base.js').RestBase;
var util = require("util");
var models = require('../../models');

var errors = require('../../models/errors.js');

var statusCode = require('../statusCodes.js');
var settings = require('../../settings.js');
var async = require('async');


var RestUser = exports.RestUser = function (server) {
	
	RestBase.call(this, 'user', models.User, server);
	
	var urls = {
		get : {
			'/user/:id/eventscount' : this.getEventCount,
			'/user/:id/groups' : this.memberships,
		}
	}
	this.addurls(urls);
	
	this._initServer();
}
util.inherits(RestUser, RestBase);


RestUser.prototype.memberships = function(req, res) {
	
	var q = {
		query : {term : { user : '/user/' + req.params.id}}};
	
	
	var tasks = [
		
		function (callback) {
			models.Membership.search(q, ["group", "createDate", "updateDate"] , function ( err, result) {
				
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
			var bygroup = {};
			
			for (var i = 0, l = result.rows.length; i < l;i++) {
				ids.push(result.rows[i].group)
				bygroup[result.rows[i].group] = result.rows[i];
			}
			
			var q = {size: 10000, query : {ids : {values : ids}}}
			
			models.Group.search(q, models.Group.publicAttributes, function ( err, groups) {
				
				if (err !== null) {
					callback(err);
				} else {
					
					for (var i = 0, l = groups.rows.length; i<l; i++ ) {
						bygroup[groups.rows[i].id].group = groups.rows[i];
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


RestUser.prototype.getEventCount = function(req, res) {
	
	models.Event.count({term : {author : '/user/' + req.params.id}}, function(err, result) {
		if(err !== null) {
			if( err instanceof errors.IndexDoesNotExist) {
				res.statusCode = statusCode.NOT_FOUND;
				res.end('Not found');
			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}
		} else {
			res.end(this._renderJson( req, res, result));
		}

	}.bind(this));
	
}
