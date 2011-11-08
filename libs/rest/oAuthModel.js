var RestOAuth = require('./oAuth.js').RestOAuth;
var util = require("util");
var mModelUrls = require('./mModelUrls');
var mLock = require('./mLock');

var models = require('../../models');
var log = require('czagenda-log').from(__filename);

var RestOAuthModel = exports.RestOAuthModel = function() {

	RestOAuth.apply(this, arguments);

	this.populateModelUrls();
	
	this._urls.put[this._urlPrefix + '/:id'].middleware.push(this.requireLock.bind(this))
	this._urls.del[this._urlPrefix + '/:id'].middleware.push(this.requireLock.bind(this))
	
}

util.inherits(RestOAuthModel, RestOAuth);

for(k in mModelUrls) {
	RestOAuthModel.prototype[k] = mModelUrls[k];
}


for(k in mLock) {
	RestOAuthModel.prototype[k] = mLock[k];
}

exports.RestOAuthModel = RestOAuthModel;
