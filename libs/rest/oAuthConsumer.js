var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");

var models = require('../../models');

function RestOAuthConsumer (server) {
	
	RestOAuthModel.call(this, 'oauth-consumer', models.OAuthConsumer, server);
	
	this._idRegexp = '([0-9a-zA-Z]+)';
	
	// add staffOnly middleware to all urls
	for(method in this._urls) {
		var sub_map = this._urls[method];
		for(url in sub_map) {
			sub_map[url].middleware.push(this.staffOnly);
		}
	}
	
	this._initServer();
}
util.inherits(RestOAuthConsumer,RestOAuthModel );

exports.RestOAuthConsumer = RestOAuthConsumer