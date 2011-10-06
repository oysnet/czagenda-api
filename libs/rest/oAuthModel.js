var RestOAuth = require('./oAuth.js').RestOAuth;
var util = require("util");
var mModelUrls = require('./mModelUrls');

var models = require('../../models');
var log = require('czagenda-log').from(__filename);

var RestOAuthModel = exports.RestOAuthModel = function() {
	
	
	RestOAuth.apply(this, arguments);
	
		
	for (k in mModelUrls) {
		this[k] = mModelUrls[k].bind(this);
	}
	this.populateModelUrls();
	
}

util.inherits(RestOAuthModel, RestOAuth);


exports.RestOAuthModel = RestOAuthModel;
