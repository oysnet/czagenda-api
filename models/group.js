var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');

//var env = require('JSV').JSV.createEnvironment("json-schema-draft-03");
//var jsonSchema = env.findSchema(env.getOption("latestJSONSchemaSchemaURI"));

function Group () {
	this._attributs = {title : null, description : null, writeGroups : null, writeUsers : null, users : null};
	Base.call(this, 'group');	
}

util.inherits(Group, Base);

Group.publicAttributes = Base.publicAttributes.concat(['title', 'description', 'writeGroups', 'writeUsers', 'users' ]);
Group.staffAttributes = Group.publicAttributes.concat(Base.staffAttributes);

Group.prototype._validate = function () {
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

Group.prototype._generateHash = function () {
	
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(JSON.stringify(this.title));
	h.update(JSON.stringify(this.description));
	this._data['hash'] = h.digest('hex')
	
}

Group.prototype._generateId = function () {
	return '/group/' + utils.slugify(this.title);
}

Group.prototype._preSave = function () {
	
	if (this.id === null) {
		this._data.writeGroups = this._data.id + '/perms/wg';
		this._data.writeUsers = this._data.id + '/perms/wu';
		this._data.users = this._data.id + '/users';
	}
		
}

Group.get = function(options, callback) {
	Base.get(options,Group, callback)
}

Group.search = function(query, attrs,callback) {
	Base.search(query, 'agenda', 'group',attrs, Group, callback)
}

Group.count = function(query, callback) {
	Base.count(query, 'agenda', 'group',callback)
}


exports.Group = Group;