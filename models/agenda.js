var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var errors = require('./errors.js');

function Agenda () {
	this._attributs = {title : null, description : null, writeGroups : null, writeUsers : null};
	Base.call(this, 'agenda');	
}

util.inherits(Agenda, Base);

Agenda.publicAttributes = Base.publicAttributes.concat(['title', 'description', 'writeGroups', 'writeUsers']);
Agenda.staffAttributes = Agenda.publicAttributes.concat(Base.staffAttributes);

Agenda.prototype._validate = function (callback) {
	this.validateString('title', false, 5, 128);
	this.validateString('description', true, null, 1024);
	
	callback(null);
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

Agenda.prototype.save = function (callback) {
	
	if (typeof(this.title) !== 'string') {
		this.addValidationError('title', 'a string is required')
		callback(new errors.ValidationError(), this);
		return;
	}
	
	Base.prototype.save.call(this, callback);
	
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