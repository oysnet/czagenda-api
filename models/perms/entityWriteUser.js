var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');
var models = require('../../models');

const type = 'entity-write-user'

function EntityWriteUser () {
	BasePermission.call(this, type);	
}

util.inherits(EntityWriteUser, BasePermission);

EntityWriteUser.applyOnClass = models.Entity;

EntityWriteUser.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EntityWriteUser.staffAttributes = EntityWriteUser.publicAttributes.concat(Base.staffAttributes);

EntityWriteUser.publicWriteAttributes = ['grantTo', 'applyOn'];
EntityWriteUser.staffWriteAttributes = EntityWriteUser.publicWriteAttributes;

EntityWriteUser.prototype._generateId = function(doc) {
	return '/perms/entity/wu/' + this._generateUUID();
}

EntityWriteUser.prototype._validate = function (callback) {
		
	var keys = [];
	
	if (this.validateRegexp('applyOn', '^/entity/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('applyOn');
	}
	if (this.validateRegexp('grantTo', '^/user/[\-_\.0-9a-zA-Z]+$', false) === true) {
		keys.push('grantTo');
	}
	
	this.validateExists(keys, callback);
}

EntityWriteUser.prototype._postSave = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Entity, 'computedWriteUsers', true, next);
}

EntityWriteUser.prototype._postDel = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Entity, 'computedWriteUsers', false, next);
}

EntityWriteUser.get = function(options, callback) {
	Base.get(options, EntityWriteUser, callback)
}

EntityWriteUser.search = function(query, attrs,callback) {
	Base.search(query, settings.elasticsearch.index, type, attrs,EntityWriteUser, callback)
}

EntityWriteUser.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, type,callback)
}

module.exports = EntityWriteUser;