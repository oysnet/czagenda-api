var Base = require('./base.js').Base;
var util = require("util"), crypto = require('crypto');
var settings = require('../settings.js');
var validator = require('../libs/schemas/validator');

function Event () {
	this._attributs = {approved : [], disapproved:[], agenda : null, event : null, author : null, writeGroups : null, readGroups : null, writeUsers : null, readUsers : null};
	Base.call(this, 'event');	
}

util.inherits(Event, Base);

Event.publicAttributes = Base.publicAttributes.concat(['event', 'author', 'writeGroups', 'readGroups', 'writeUsers', 'readUsers', 'agenda']);
Event.staffAttributes = Event.publicAttributes.concat(Base.staffAttributes);
Event.metaAttributes = ['event'];

Event.publicWriteAttributes = ['event', 'agenda'];
Event.staffWriteAttributes = Event.publicWriteAttributes;

Event.prototype._validate = function (callback) {
	
	this.validateRegexp('author', '^/user/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('agenda', '^/agenda/[\-_\.0-9a-z]+$', true);
	
	var schema = null;
	
	if (this.event === null) {
		this.addValidationError('event', 'required');
	} 
	else if (typeof(this.event.links) === 'undefined') {
		this.addValidationError('event.links', 'required')
	} else {
		
		var found = false;
		for (var i = 0, l = this.event.links.length; i<l;i++) {
			if (this.event.links[i].rel === 'describedby' ) {
				schema = validator.approvedEnvironment.getEnv().findSchema(this.event.links[i].href);
				if (typeof(schema) === 'undefined') {
					this.addValidationError('event.links', 'Link with rel=describedby doesn\'t match any schema: ' + this.event.links[i].href);
				} else {
					
					var report = validator.approvedEnvironment.getEnv().validate(this.event, schema);
					if (report.errors.length > 0) {
						this.parseJSVErrors(report.errors);
					}
				}
				found = true;
				break;
			}
		}
		
		if (!found) {
			this.addValidationError('event.links', 'Must contain an entry with rel=describedby ')
		}
		
	}
	
	
	/*
	if (this.event === null || this.event == {}) {
		throw Error('Empty schema');
	}
	*/
	
	
	
	
	callback(null);
}

Event.prototype._generateHash = function () {
	
	var id = this.event.id;
	delete this.event.id;

    h = crypto.createHash('md5')
    h.update(this._type);
	h.update(JSON.stringify(this.event))		
	this._data['hash'] = h.digest('hex')
	
	this.event.id = id;
}


Event.prototype._preSave = function () {
	if (this.id === null) {
		this._data.writeGroups = this._data.id + '/perms/wg';
		this._data.writeUsers = this._data.id + '/perms/wu';
		this._data.readGroups = this._data.id + '/perms/rg';
		this._data.readUsers = this._data.id + '/perms/ru';
		
		this._data.event.id = this._data.id;
		
	}
}

Event.get = function(options, callback) {
	Base.get(options,Event, callback)
}

Event.search = function(query,attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'event',attrs,Event, callback)
}

Event.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'event',callback)
}

exports.Event = Event;