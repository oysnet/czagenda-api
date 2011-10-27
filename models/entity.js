var Base = require('./base.js').Base;
var util = require("util"), crypto = require('crypto');
var settings = require('../settings.js');
var validator = require('../libs/schemas/validator');
var models = require('../models');

function Entity() {
	this._attributs = {
		entity : null
	};
	Base.call(this, 'entity');
	
	
	
}

util.inherits(Entity, Base);

Entity.publicAttributes = Base.publicAttributes.concat(['entity']);
Entity.staffAttributes = Entity.publicAttributes.concat(Base.staffAttributes);
Entity.metaAttributes = ['entity'];

Entity.publicWriteAttributes = ['entity'];
Entity.staffWriteAttributes = Entity.publicWriteAttributes;

Entity.prototype._validate = function(callback) {

	//this.validateRegexp('author', '^/user/[\-_\.0-9a-zA-Z]+$', false);
	//this.validateRegexp('agenda', '^/agenda/[\-_\.0-9a-z]+$', true);

	//var keys = [];

	

	var schema = null;

	if(this.entity === null) {
		this.addValidationError('entity', 'required');
	} else if( typeof (this.entity.links) === 'undefined') {
		this.addValidationError('entity.links', 'required')
	} else {

		var found = false;
		for(var i = 0, l = this.entity.links.length; i < l; i++) {
			if(this.entity.links[i].rel === 'describedby') {
				schema = validator.approvedEnvironment.getEnv().findSchema(this.entity.links[i].href);
				if( typeof (schema) === 'undefined') {
					this.addValidationError('entity.links', 'Link with rel=describedby doesn\'t match any schema: ' + this.entity.links[i].href);
				} else {

					var report = validator.approvedEnvironment.getEnv().validate(this.entity, schema);
					if(report.errors.length > 0) {
						this.parseJSVErrors(report.errors);
					}
				}
				found = true;
				break;
			}
		}

		if(!found) {
			this.addValidationError('entity.links', 'Must contain an entry with rel=describedby ')
		}

	}
	
	callback(null);
	//this.validateExists(keys, callback);
}

Entity.prototype._generateHash = function() {
	
	h = crypto.createHash('md5')
	h.update(this._type);
	h.update(JSON.stringify(this.entity))
	this._data['hash'] = h.digest('hex')

}
/*
Entity.prototype._preSave = function(callback) {
	if(this.id === null) {
		this._data.writeGroups = this._data.id + '/perms/wg';
		this._data.writeUsers = this._data.id + '/perms/wu';
		this._data.readGroups = this._data.id + '/perms/rg';
		this._data.readUsers = this._data.id + '/perms/ru';

		//this._data.event.id = this._data.id;
	}

	callback(null);
}*/

Entity.get = function(options, callback) {
	Base.get(options, Entity, callback);
}

Entity.search = function(query, attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'entity', attrs, Entity, callback)
}

Entity.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'entity', callback)
}

exports.Entity = Entity;
