var Base = require('./base.js').Base;
var util = require("util");

//var env = require('JSV').JSV.createEnvironment("json-schema-draft-03");
//var jsonSchema = env.findSchema(env.getOption("latestJSONSchemaSchemaURI"));

function Event () {
	this._attributs = {approved : [], disapproved:[], agenda : null, event : null, author : null, writeGroups : null, readGroups : null, writeUsers : null, readUsers : null};
	Base.call(this, 'event');	
}

util.inherits(Event, Base);

Event.publicAttributes = Base.publicAttributes.concat(['event', 'author', 'writeGroups', 'readGroups', 'writeUsers', 'readUsers', 'agenda']);
Event.staffAttributes = Event.publicAttributes.concat(Base.staffAttributes);
Event.metaAttributes = ['event'];

Event.prototype._validate = function () {
	/*
	if (this.event === null || this.event == {}) {
		throw Error('Empty schema');
	}
	
	var report = jsonSchema.validate(this.event);
	if (report.errors.length > 0) {
		this.validationErrors = report.errors;
		throw Error('Validation errors');
	}*/
}

Event.prototype._generateHash = function () {
	
	var id = this.event.id;
	delete this.event.id;
		
	c = require('crypto')
    h = c.createHash('md5')
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
	Base.search(query, 'agenda', 'event',attrs,Event, callback)
}

Event.count = function(query, callback) {
	Base.count(query, 'agenda', 'event',callback)
}

exports.Event = Event;