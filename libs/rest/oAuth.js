var RestBase = require('./base.js').RestBase;
var util = require("util");

var mOAuth = require('./mOAuth');
var oauth = require('../oauth');

var models = require('../../models');
var log = require('czagenda-log').from(__filename);

var mPermissions = require('./mPermissions')

var RestOAuth = exports.RestOAuth = function() {
	
	RestBase.apply(this, arguments);
	
	// mixin mOAuth
	for (k in mOAuth) {
		this[k] = mOAuth[k];
	}
	
	// mixin mPermissions
	for (k in mPermissions) {
		this[k] = mPermissions[k];
	}
}

util.inherits(RestOAuth, RestBase);

RestOAuth.prototype._getDefaultMiddleware = function () {
	return [oauth.verifyBody(), this._verifySignature, this.getUserPermsAndGroups];
}


exports.RestOAuth = RestOAuth;