var RestOAuth = require('./oAuth.js').RestOAuth;
var util = require("util");
var mModelUrls = require('./mModelUrls');

var models = require('../../models');
var log = require('czagenda-log').from(__filename);

var RestOAuthModel = exports.RestOAuthModel = function() {

	RestOAuth.apply(this, arguments);

	this.populateModelUrls();

}

util.inherits(RestOAuthModel, RestOAuth);

for(k in mModelUrls) {
	RestOAuthModel.prototype[k] = mModelUrls[k];
}

exports.RestOAuthModel = RestOAuthModel;
