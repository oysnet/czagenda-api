var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var errors = require('./errors.js');
var oauth = require('../libs/oauth');
var settings = require('../settings.js');
function OAuthToken () {
	this._attributs = {key : null, secret : null, verifier : null, tokenType : null, isApproved : false, user : null, consumer:null, callback:null, callbackConfirmed:false};
	Base.call(this, 'oauth-token');	
}

util.inherits(OAuthToken, Base);

OAuthToken.publicAttributes = Base.publicAttributes.concat([]);
OAuthToken.staffAttributes = OAuthToken.publicAttributes.concat(Base.staffAttributes).concat([['user', 'key', 'secret', 'isApproved', 'consumer']]);

OAuthToken.publicWriteAttributes = []; 
OAuthToken.staffWriteAttributes = ['key', 'secret', 'verifier', 'tokenType', 'tokenType', 'user', 'consumer', 'callback', 'callbackConfirmed'];

OAuthToken.prototype._validate = function (callback) {
	this.validateString('key', false, null, 18);
	this.validateString('secret', false, null, 32);
	this.validateString('verifier', true, null, 10);
	this.validateChoice('tokenType',[ 'REQUEST', 'ACCESS']);
	this.validateBoolean('isApproved', false);
	this.validateString('callback', true, null, 255);
	this.validateBoolean('callbackConfirmed', false);

//	this.validateRegexp('user', '^/user/[\-_\.0-9a-zA-Z]+$', true);	
	//this.validateRegexp('user', '^/user/[\-_\.0-9a-zA-Z]+$', true);	
	
	
	var keys = [];
		
	if (this.validateRegexp('user', '^/user/[\-_\.0-9a-zA-Z]+$', true) === true && this.user !== null) {
		keys.push('user');
	}
	
	if (this.validateRegexp('consumer', '^/oauth-consumer/[0-9a-zA-Z]+$', false) === true) {
		keys.push('consumer');
	}
	
	this.validateExists(keys, callback);	
	
}

OAuthToken.prototype._generateHash = function () {
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(this.key);
	h.update(this.secret);
	this._data['hash'] = h.digest('hex')
}

OAuthToken.prototype._generateId = function () {
	return '/oauth-token/' + this.key;
}


OAuthToken.prototype.setVerifier = function () {
	this.verifier = oauth.generateToken(10);
}


OAuthToken.prototype.save = function (callback) {
	
	if (this.id === null) {
		this.key = oauth.generateToken(18);
		this.secret = oauth.generateToken(32);
	}
	
	Base.prototype.save.call(this, callback);
	
}


OAuthToken.get = function(options, callback) {
	Base.get(options,OAuthToken, callback)
}

OAuthToken.search = function(query, attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'oauth-token', attrs, OAuthToken, callback)
}

OAuthToken.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'oauth-token',callback)
}

exports.OAuthToken = OAuthToken;