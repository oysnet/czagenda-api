var RestBase = require('./base.js').RestBase;
var util = require("util");

var models = require('../../models');

function RestOAuthConsumer (server) {
	
	RestBase.call(this, 'oauth-consumer', models.OAuthConsumer, server);
	
	this._initServer();
}
util.inherits(RestOAuthConsumer, RestBase);

exports.RestOAuthConsumer = RestOAuthConsumer