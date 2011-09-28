var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');

//var env = require('JSV').JSV.createEnvironment("json-schema-draft-03");
//var jsonSchema = env.findSchema(env.getOption("latestJSONSchemaSchemaURI"));

function Agenda () {
	this._attributs = {title : null, description : null, writeGroups : null, writeUsers : null};
	Base.call(this, 'agenda');	
}

util.inherits(Agenda, Base);

Agenda.publicAttributes = Base.publicAttributes.concat(['title', 'description', 'writeGroups', 'writeUsers']);
Agenda.staffAttributes = Agenda.publicAttributes.concat(Base.staffAttributes);

Agenda.prototype._validate = function () {
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

Agenda.prototype._generateHash = function () {
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(JSON.stringify(this.title));
	h.update(JSON.stringify(this.description));
	this._data['hash'] = h.digest('hex')
}

Agenda.prototype._generateId = function () {
	return '/agenda/' + utils.slugify(this.title);
}

Agenda.prototype._preSave = function () {
	if (this.id === null) {
		this._data.writeGroups = this._data.id + '/perms/wg';
		this._data.writeUsers = this._data.id + '/perms/wu';
	}
}

Agenda.get = function(options, callback) {
	Base.get(options,Agenda, callback)
}

Agenda.search = function(query, attrs, callback) {
	Base.search(query, 'agenda', 'agenda',attrs, Agenda, callback)
}

Agenda.count = function(query, callback) {
	Base.count(query, 'agenda', 'agenda',callback)
}

exports.Agenda = Agenda;