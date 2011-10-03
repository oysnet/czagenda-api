var Base = require('../base.js').Base;
var util = require("util");
var utils = require('../../libs/utils.js');

function BasePermission (type) {
	this._attributs = {grantTo : null, applyOn : null};
	Base.call(this, type);	
}

util.inherits(BasePermission, Base);




BasePermission.prototype._generateHash = function () {
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(this.applyOn);
	h.update(this.grantTo);
	
	this._data['hash'] = h.digest('hex')
}

exports.BasePermission = BasePermission;