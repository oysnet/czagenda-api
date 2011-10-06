var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var errors = require('./errors.js');
var oauth = require('../libs/oauth');

var log = require('czagenda-log').from(__filename);

function OAuthConsumer () {
	this._attributs = {name : null, description : null, key : null, secret : null, status : 'PENDING', user : null};
	Base.call(this, 'oauth-consumer');	
}

util.inherits(OAuthConsumer, Base);

OAuthConsumer.publicAttributes = Base.publicAttributes.concat(['name', 'description', 'key', 'secret', 'status', 'user']); // empty this after oauth works
OAuthConsumer.staffAttributes = OAuthConsumer.publicAttributes.concat(Base.staffAttributes);

OAuthConsumer.publicWriteAttributes = ['name', 'description', 'status', 'user']; // empty this after oauth works
OAuthConsumer.staffWriteAttributes = ['name', 'description', 'status', 'user'];

OAuthConsumer.prototype._validate = function (callback) {
	this.validateString('name', false, 5, 255);
	this.validateString('description', false, null, 1024);
	this.validateString('key', false, null, 18);
	this.validateString('secret', false, null, 32);
	this.validateChoice('status', ['PENDING', 'ACCEPTED', 'CANCELED', 'REJECTED']);
	this.validateRegexp('user', '^/user/[\-_\.0-9a-z]+$', true);	
	callback(null);
}

OAuthConsumer.prototype._generateHash = function () {
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(this.name);
	this._data['hash'] = h.digest('hex')
}


OAuthConsumer.prototype._generateId = function () {
	return '/oauth-consumer/' + this.key;
}

OAuthConsumer.prototype.save = function (callback) {
	
	// if creation => generate token + secret
	
	if (this.id === null) {
		this.key = oauth.generateToken(18);
		this.secret = oauth.generateToken(32);
		log.notice('[TODO] OAuthConsumer.prototype.save status is set to ACCEPTED on creation')
		this.status = 'ACCEPTED';
	}
	
	Base.prototype.save.call(this, callback);
	
}

OAuthConsumer.prototype._preSave = function () {
	
}

OAuthConsumer.get = function(options, callback) {
	Base.get(options,OAuthConsumer, callback)
}


OAuthConsumer.search = function(query, attrs, callback) {
	Base.search(query, 'agenda', 'oauth-consumer', attrs, OAuthConsumer, callback)
}

OAuthConsumer.count = function(query, callback) {
	Base.count(query, 'agenda', 'oauth-consumer',callback)
}

exports.OAuthConsumer = OAuthConsumer;