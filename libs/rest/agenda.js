var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var log = require('czagenda-log').from(__filename);
var models = require('../../models');
var async = require('async');
var statusCodes = require('../statusCodes');
var mModelSearch = require('./mModelSearch');

function RestAgenda(server) {

	RestOAuthModel.call(this, 'agenda', models.Agenda, server);

	this._urls.get[this._urlPrefix + '/:id/perms/wu'] = {
		fn : this.permsUserWrite
	};
	this._urls.get[this._urlPrefix + '/:id/perms/wg'] = {
		fn : this.permsGroupWrite
	};
	
	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search
	};
	
	this._initServer();
}

util.inherits(RestAgenda, RestOAuthModel);


for(k in mModelSearch) {
	RestAgenda.prototype[k] = mModelSearch[k];
}

RestAgenda.prototype.searchFields = {
	'author' : 'term',
	'createDate' : 'datetime',
	'updateDate' : 'datetime',
	'title' : 'text',
	'description' : 'text'
}


RestAgenda.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate',
	'title' : 'title.untouched'	
}

RestAgenda.prototype._populateObject = function(obj, data, req, res) {

	if(obj.author === null) {
		obj.author = req.user.id;
	}

	return RestOAuthModel.prototype._populateObject.call(this, obj, data, req, res);

}

RestAgenda.prototype._preCreate = function(obj, req, callback) {
	
	// add write permission to obj
	obj.computedWriteUsers.push(req.user.id);
	
	// create write permission
	var p = new models.perms.AgendaWriteUser();
	p.applyOn = obj.getId();
	p.grantTo = req.user.id;
	p.setValidationDone();
	
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
	
	if (err === null || typeof(req.preCreateObjects) === 'undefined') {
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