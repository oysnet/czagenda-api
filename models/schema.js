var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');

//var validatorEnvironment = require('../libs/schemas/validator').validatorEnvironment;


function Schema () {
	this._attributs = {schema : null, final : false, sample : null, template : null, status : 'PENDING', name : null};
	Base.call(this, 'schema');
}

util.inherits(Schema, Base);


Schema.publicAttributes = Base.publicAttributes.concat(['schema', 'final', 'sample', 'template', 'status' , 'name']);
Schema.staffAttributes = Schema.publicAttributes.concat(Base.staffAttributes);
Schema.metaAttributes = ['schema'];

Schema.prototype._validate = function () {
	/*
	if (this.schema === null || this.schema == {}) {
		throw Error('Empty schema');
	}
	
	var veSchema = validatorEnvironment.getEnv().findSchema(validatorEnvironment.getEnv().getOption("latestJSONSchemaSchemaURI"));
	var report = veSchema.validate(this.schema);
	if (report.errors.length > 0) {
		this.validationErrors = report.errors;
		throw Error('Validation errors');
	}*/
}

Schema.prototype._generateHash = function () {
	
	var id = this.schema.id;
	delete this.schema.id;
		
		
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(JSON.stringify(this.schema));	
	this._data['hash'] = h.digest('hex')
	
	this.schema.id = id;
}

Schema.prototype._generateId = function () {
	return '/schema/' + utils.slugify(this.name);
}


Schema.prototype._preSave = function () {
	if (this.id === null) {
		this._data.schema.id = this._data.id;
	}
}

Schema.get = function(options, callback) {
	Base.get(options,Schema, callback)
}

Schema.search = function(query,attrs, callback) {
	Base.search(query, 'agenda', 'schema', attrs, Schema, callback)
}


Schema.count = function(query, callback) {
	Base.count(query, 'agenda', 'schema',callback)
}

exports.Schema = Schema;