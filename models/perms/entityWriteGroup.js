var BasePermission = require('./base.js').BasePermission;
var Base = require('../base.js').Base;
var util = require("util");
var settings = require('../../settings.js');

var models = require('../../models');

const type = 'entity-write-group'

function EntityWriteGroup () {
	BasePermission.call(this, type);	
}

util.inherits(EntityWriteGroup, BasePermission);

EntityWriteGroup.applyOnClass = models.Entity;

EntityWriteGroup.publicAttributes = Base.publicAttributes.concat(['grantTo', 'applyOn']);
EntityWriteGroup.staffAttributes = EntityWriteGroup.publicAttributes.concat(Base.staffAttributes);

EntityWriteGroup.publicWriteAttributes = ['grantTo', 'applyOn'];
EntityWriteGroup.staffWriteAttributes = EntityWriteGroup.publicWriteAttributes;

EntityWriteGroup.prototype._generateId = function(doc) {
	return '/perms/entity/wg/' + this._generateUUID();
}

EntityWriteGroup.prototype._validate = function (callback) {
	
	var keys = [];
	
	if (this.validateRegexp('applyOn', '^/entity/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('applyOn');
	}
	if (this.validateRegexp('grantTo', '^/group/[\-_\.0-9a-z]+$', false) === true) {
		keys.push('grantTo');
	}
	
	this.validateExists(keys, callback);
}


EntityWriteGroup.prototype._postSave = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Entity, 'computedWriteGroups', true, next);
}

EntityWriteGroup.prototype._postDel = function (err, next) {
	
	if (err !== null && !(err instanceof models.errors.ObjectAlreadyExists)) {
		next();
		return;
	}
	
	this.updateComputedValue(models.Entity, 'computedWriteGroups', false, next);
}




EntityWriteGroup.get = function(options, callback) {
	Base.get(options, EntityWriteGroup, callback)
}

EntityWriteGroup.search = function(query, attrs,callback) {
	Base.search(query, settings.elasticsearch.index, type, attrs,EntityWriteGroup, callback)
}

EntityWriteGroup.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, type,callback)
}

module.exports = EntityWriteGroup;