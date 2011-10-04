var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestOAuthToken (server) {
	
	RestBase.call(this, 'oauth-token', models.OAuthToken, server);
	
	this._initServer();
}
util.inherits(RestOAuthToken, RestBase);

exports.RestOAuthToken = RestOAuthToken