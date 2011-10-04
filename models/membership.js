var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');

function Membership () {
	this._attributs = {user : null, group : null};
	Base.call(this, 'membership');	
}

util.inherits(Membership, Base);


Membership.publicAttributes = Base.publicAttributes.concat(['group', 'user']);
Membership.staffAttributes = Membership.publicAttributes.concat(Base.staffAttributes);

Membership.publicWriteAttributes = ['user', 'group'];
Membership.staffWriteAttributes = Membership.publicWriteAttributes;

Membership.prototype._validate = function (callback) {
	this.validateRegexp('user', '^/user/[\-_\.0-9a-z]+$', false);
	this.validateRegexp('group', '^/group/[\-_\.0-9a-z]+$', false);
	callback(null);
}

Membership.prototype._generateHash = function () {
		
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(this.user);
	h.update(this.group);
	this._data['hash'] = h.digest('hex')
}

Membership.get = function(options, callback) {
	Base.get(options,Membership, callback)
}

Membership.search = function(query,attrs, callback) {
	Base.search(query, 'agenda', 'membership', attrs, Membership, callback)
}

Membership.count = function(query, callback) {
	Base.count(query, 'agenda', 'membership',callback)
}


exports.Membership = Membership;