var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var mLock = require('./mLock');
var models = require('../../models');
var mModelSearch = require('./mModelSearch');

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
	
	//this._urls.put[this._urlPrefix + '/:id'].middleware.push(this.requireLock.bind(this))
	//this._urls.del[this._urlPrefix + '/:id'].middleware.push(this.requireLock.bind(this))
	
	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search,
		middleware : [this.staffOnly]
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search,
		middleware : [this.staffOnly]
	};
	
	this._initServer();
}
util.inherits(RestOAuthConsumer,RestOAuthModel );

for(k in mLock) {
	RestOAuthConsumer.prototype[k] = mLock[k];
}

for(k in mModelSearch) {
	RestOAuthConsumer.prototype[k] = mModelSearch[k];
}

RestOAuthConsumer.prototype.searchFields = {
	'user' : 'term',
	'createDate' : 'datetime',
	'updateDate' : 'datetime',
	'name' : 'text',
	'description' : 'text'
}

RestOAuthConsumer.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate',
	'name' : 'name.untouched'
}

exports.RestOAuthConsumer = RestOAuthConsumer