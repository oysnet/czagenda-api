var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var mLock = require('./mLock');
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
	
	this._urls.put[this._urlPrefix + '/:id'].middleware.push(this.requireLock.bind(this))
	this._urls.del[this._urlPrefix + '/:id'].middleware.push(this.requireLock.bind(this))
	
	this._initServer();
}
util.inherits(RestOAuthConsumer,RestOAuthModel );

for(k in mLock) {
	RestOAuthModel.prototype[k] = mLock[k];
}

exports.RestOAuthConsumer = RestOAuthConsumer