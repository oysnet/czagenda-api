var RestBase = require('./base.js').RestBase;
var util = require("util");

var mOAuth = require('./mOAuth');
var oauth = require('../oauth');

var models = require('../../models');
var log = require('czagenda-log').from(__filename);

var mPermissions = require('./mPermissions')

var RestOAuth = exports.RestOAuth = function() {

	RestBase.apply(this, arguments);

}

util.inherits(RestOAuth, RestBase);

// mixin mOAuth
for(k in mOAuth) {
	RestOAuth.prototype[k] = mOAuth[k];
}

// mixin mPermissions
for(k in mPermissions) {
	RestOAuth.prototype[k] = mPermissions[k];
}

RestOAuth.prototype._getDefaultMiddleware = function() {
	return [oauth.verifyBody(), this._verifySignature, this.getUserPermsAndGroups];
}

exports.RestOAuth = RestOAuth;
