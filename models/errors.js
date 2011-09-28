var util = require("util");


function ObjectDoesNotExist (id) {
	Error.call(this);	
	this.message = 'Object doesn\'t exist id: ' + id;
}
util.inherits(ObjectDoesNotExist, Error);
ObjectDoesNotExist.prototype.name = 'ObjectDoesNotExist';
exports.ObjectDoesNotExist = ObjectDoesNotExist;

function IndexDoesNotExist (index) {
	Error.call(this);	
	this.message = 'Index does not exist: ' + index;
}
util.inherits(IndexDoesNotExist, Error);
ObjectDoesNotExist.prototype.name = 'IndexDoesNotExist';
exports.IndexDoesNotExist = IndexDoesNotExist;

function ObjectAlreadyExists () {
	Error.call(this);	
	this.message = 'Object already exists';
}
util.inherits(ValidationError, Error);
ObjectAlreadyExists.prototype.name = 'ObjectAlreadyExists';
exports.ObjectAlreadyExists = ObjectAlreadyExists;


function UnknowError (id) {
	Error.call(this);	
	this.message = 'Unknow Error';
}
util.inherits(UnknowError, Error);
UnknowError.prototype.name = 'UnknowError';
exports.UnknowError = UnknowError;


function ValidationError () {
	Error.call(this);	
	this.message = 'Validation error';
}
util.inherits(ValidationError, Error);
ValidationError.prototype.name = 'ValidationError';
exports.ValidationError = ValidationError;

