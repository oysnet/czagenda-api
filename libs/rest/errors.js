var util = require("util");

function BadRequest (message) {
	Error.call(this);	
	this.message = message;
}
util.inherits(BadRequest, Error);
BadRequest.prototype.name = 'BadRequest';
exports.BadRequest = BadRequest;
