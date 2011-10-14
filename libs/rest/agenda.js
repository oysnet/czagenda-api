var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var log = require('czagenda-log').from(__filename);
var models = require('../../models');
var async = require('async');
var statusCodes = require('../statusCodes');

function RestAgenda(server) {

	RestOAuthModel.call(this, 'agenda', models.Agenda, server);

	this._urls.get[this._urlPrefix + '/:id/perms/wu'] = {
		fn : this.permsUserWrite
	};
	this._urls.get[this._urlPrefix + '/:id/perms/wg'] = {
		fn : this.permsGroupWrite
	};

	this._initServer();
}

util.inherits(RestAgenda, RestOAuthModel);

RestAgenda.prototype._preCreate = function(obj, req, callback) {
	
	// add write permission to obj
	obj.computedWriteUsers.push(req.user.id);
	
	// create write permission
	var p = new models.perms.AgendaWriteUser();
	p.applyOn = obj.getId();
	p.grantTo = req.user.id;

	p.save(function(err, p) {
		
		if (err !== null) {
			req.preCreateObjects = [p];
		}
		
		// trivial but it's what we want...
		if( err instanceof models.errors.ObjectAlreadyExists) {
			err = null;
		}

		if(err !== null) {
			log.warning('RestAgenda.prototype.create: unable to create permission AgendaWriteUser on ', req.user.id, obj.getId(), err)
			callback(new models.errors.InternalError('Unable to create permission, aborting'));
		} else {
			callback(null);
		}
		
	}, false, false)
}

RestAgenda.prototype._postCreate = function(err, obj, req, callback) {
	
	if (err === null) {
		callback();
		return;
	}

	// rolling back
	var rollbackMethods = [];
	req.preCreateObjects.forEach(function(toDelObj) {
		rollbackMethods.push(function(callback) {
			toDelObj.del(function(err, obj) {
				
				if (err !== null) {
					log.warning('RestAgenda.prototype._postCreate: rolling back failed', toDelObj.id)
				}
				
				callback(err);
			});
		});
	});

	async.parallel(rollbackMethods, function(rollbackErr) {
		callback();
	});
}


RestAgenda.prototype.permsUserWrite = function(req, res) {
	var permClass = models.perms.getPermClass('agenda', 'user', 'write'), grantToClass = models.User;
	this._perms(req, res, permClass, grantToClass);
}

RestAgenda.prototype.permsGroupWrite = function(req, res) {
	var permClass = models.perms.getPermClass('agenda', 'group', 'write'), grantToClass = models.Group;
	this._perms(req, res, permClass, grantToClass);
}

exports.RestAgenda = RestAgenda