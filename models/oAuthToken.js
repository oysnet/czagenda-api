var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var errors = require('./errors.js');

function OAuthToken () {
	this._attributs = {key : null, secret : null, verifier : null, tokenType : null, isApproved : false, user : null, consumer:null, callback:null, callbackConfirmed:false};
	Base.call(this, 'oauth-token');	
}

util.inherits(OAuthToken, Base);

OAuthToken.publicAttributes = Base.publicAttributes.concat(['key', 'secret', 'verifier', 'tokenType', 'tokenType', 'user', 'consumer', 'callback', 'callbackConfirmed']); // empty this after oauth works
OAuthToken.staffAttributes = OAuthToken.publicAttributes.concat(Base.staffAttributes);

OAuthToken.publicWriteAttributes = ['key', 'secret', 'verifier', 'tokenType', 'tokenType', 'user', 'consumer', 'callback', 'callbackConfirmed']; // empty this after oauth works
OAuthToken.staffWriteAttributes = ['key', 'secret', 'verifier', 'tokenType', 'tokenType', 'user', 'consumer', 'callback', 'callbackConfirmed'];

OAuthToken.prototype._validate = function (callback) {
	this.validateString('key', false, null, 18);
	this.validateString('secret', false, null, 32);
	this.validateString('verifier', false, null, 10);
	this.validateChoice('tokenType',[ 'REQUEST', 'ACCESS']);
	this.validateBoolean('isApproved', false);
	this.validateRegexp('user', '^/user/[\-_\.0-9a-z]+$', true);	
	this.validateRegexp('consumer', '^/oauth-consumer/[\-_\.0-9a-z]+$', true);
	this.validateString('callback', false, null, 255);
	this.validateBoolean('callbackConfirmed', false);
	callback(null);
}

OAuthToken.prototype._generateHash = function () {
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(this.key);
	h.update(this.secret);
	this._data['hash'] = h.digest('hex')
}

/*
OAuthToken.prototype.save = function (callback) {
	
	if (typeof(this.title) !== 'string') {
		this.addValidationError('title', 'a string is required')
		callback(new errors.ValidationError(), this);
		return;
	}
	
	Base.prototype.save.call(this, callback);
	
}
*/
OAuthToken.prototype._preSave = function () {
	
}

OAuthToken.get = function(options, callback) {
	Base.get(options,OAuthToken, callback)
}

OAuthToken.search = function(query, attrs, callback) {
	Base.search(query, 'agenda', 'oauth-token', attrs, OAuthToken, callback)
}

OAuthToken.count = function(query, callback) {
	Base.count(query, 'agenda', 'oauth-token',callback)
}

exports.OAuthToken = OAuthToken;