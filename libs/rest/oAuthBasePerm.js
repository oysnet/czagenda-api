var RestOAuth = require('./oAuth.js').RestOAuth;
var util = require("util");
var mModelUrls = require('./mModelUrls');
var models = require('../../models');
var log = require('czagenda-log').from(__filename);
var Lock = require('../lock');
var statusCodes = require('../statusCodes');

var RestOAuthBasePerm =  function() {
	
	RestOAuth.apply(this, arguments);
	
	this._urls.post[this._urlPrefix] =  { middleware : [this.requireLock.bind(this)], fn :this.create};
	this._urls.del[this._urlPrefix + '/:id'] =  { middleware : [], fn :this.del};
	
}

util.inherits(RestOAuthBasePerm, RestOAuth);

// mixin mModelUrls
for (k in mModelUrls) {
	RestOAuthBasePerm.prototype[k] = mModelUrls[k];
}
	


RestOAuthBasePerm.prototype._preDel = function(obj, req, callback) {

	var id = obj.applyOn;
	
	var lock = new Lock(id);
	lock.acquire( function(err, locked) {

		if(err !== null || locked === false) {
			req.res.statusCode = statusCodes.LOCKED;
			req.res.end('Document is Locked');
			return;
		}

		req.locks = [lock];
		callback(null);
	});

}

RestOAuthBasePerm.prototype.requireLock = function (req, res, next) {
	
	var id = req.body.applyOn;
	
	var lock = new Lock(id);
	lock.acquire( function(err, locked) {

		if(err !== null || locked === false) {
			res.statusCode = statusCodes.LOCKED;
			res.end('Document is Locked');
			return;
		}

		req.locks = [lock];
		next();
	});
	
}

exports.RestOAuthBasePerm = RestOAuthBasePerm;
