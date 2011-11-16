var Lock = require('../lock');
var statusCodes = require('../statusCodes');

exports.requireLock = function (req, res, next) {
	
	var id = this._urlPrefix + "/" + req.params.id;
	
	var lock = new Lock(id);
	lock.acquire( function(err, locked) {

		if(err !== null || locked === false) {
			res.statusCode = statusCodes.LOCKED;
			res.end('Document is Locked');
			return;
		}
		
		if (typeof(req.locks) == 'undefined') {
			req.locks = [lock];
		} else {
			req.locks.push(lock);
		}
		next();
	});
		
}