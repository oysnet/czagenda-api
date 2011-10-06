var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");

var models = require('../../models');

function RestOAuthConsumer (server) {
	
	RestOAuthModel.call(this, 'oauth-consumer', models.OAuthConsumer, server);
	
	this._idRegexp = '([0-9a-zA-Z]+)';
	
	this._initServer();
}
util.inherits(RestOAuthConsumer,RestOAuthModel );

exports.RestOAuthConsumer = RestOAuthConsumer