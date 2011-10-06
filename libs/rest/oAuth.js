var RestBase = require('./base.js').RestBase;
var util = require("util");

var mOAuth = require('./mOAuth');
var oauth = require('../oauth');

var models = require('../../models');
var log = require('czagenda-log').from(__filename);

var RestOAuth = exports.RestOAuth = function() {
	
	RestBase.apply(this, arguments);
	
	for (k in mOAuth) {
		this[k] = mOAuth[k];
	}
	
}

util.inherits(RestOAuth, RestBase);

RestOAuth.prototype._getDefaultMiddleware = function () {
	return [oauth.verifyBody(), this._verifySignature];
}


exports.RestOAuth = RestOAuth;