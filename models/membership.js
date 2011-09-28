var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');

//var env = require('JSV').JSV.createEnvironment("json-schema-draft-03");
//var jsonSchema = env.findSchema(env.getOption("latestJSONSchemaSchemaURI"));

function Membership () {
	this._attributs = {user : null, group : null};
	Base.call(this, 'membership');	
}

util.inherits(Membership, Base);


Membership.publicAttributes = Base.publicAttributes.concat(['group', 'user']);
Membership.staffAttributes = Membership.publicAttributes.concat(Base.staffAttributes);

Membership.prototype._validate = function () {
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

Membership.prototype._generateHash = function () {
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(this.user);
	h.update(this.group);
	this._data['hash'] = h.digest('hex')
}

Membership.get = function(options, callback) {
	Base.get(options,Membership, callback)
}

Membership.search = function(query,attrs, callback) {
	Base.search(query, 'agenda', 'membership', attrs, Membership, callback)
}

Membership.count = function(query, callback) {
	Base.count(query, 'agenda', 'membership',callback)
}


exports.Membership = Membership;