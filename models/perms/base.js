var Base = require('../base.js').Base;
var util = require("util");
var utils = require('../../libs/utils.js');
var log = require('czagenda-log').from(__filename);

function BasePermission(type) {
	this._attributs = {
		grantTo : null,
		applyOn : null
	};
	Base.call(this, type);
}

util.inherits(BasePermission, Base);

BasePermission.publicWriteAttributes = ['grantTo', 'applyOn'];
BasePermission.staffWriteAttributes = BasePermission.publicWriteAttributes;

/**
 * Override save method to allow do not call updateComputedValue in _postSave
 * Default is to call it
 */
BasePermission.prototype.save = function(callback, transparent, updateComputedValue) {

	this.__updateComputedValue = updateComputedValue !== false;

	Base.prototype.save.call(this, callback, transparent);
}
/**
 * Update computed values such as computedWriteUsers, computedWriteGroups, etc... on applyOn document
 * clazz is the class to deal with applyOn document
 * attr is the attribute to consider according to permission type
 * add is true if the permission is added, false if removed
 */
BasePermission.prototype.updateComputedValue = function(clazz, attr, add, callback) {

	if(this.__updateComputedValue === false) {
		callback();
		return;
	}

	clazz.get({
		id : this.applyOn
	}, function(err, obj) {

		if(err !== null) {
			log.critical('BasePermission.prototype.updateComputedValue: unable to load applyOn object', this.applyOn, add == true ? 'add' : 'del', this.grantTo);
			callback();
			return;
		}

		if(add === true) {
			if(obj[attr].indexOf(this.grantTo) === -1) {
				obj[attr].push(this.grantTo)
			}
		} else {
			if(obj[attr].indexOf(this.grantTo) !== -1) {
				obj[attr].splice(obj[attr].indexOf(this.grantTo), 1)
			}
		}
		obj.save(function(err) {
			if(err !== null) {
				log.critical('BasePermission.prototype.updateComputedValue: unable to save applyOn object', this.applyOn, add == true ? 'add' : 'del', this.grantTo);
			}
			callback();
		}, true);
	}.bind(this));
}

BasePermission.prototype.hasPerm = function(perm, user, callback) {
	
	switch (perm) {
		case 'read':
			callback(null, true);
			break;

		case 'create':
		case 'write':
		case 'del':

			this.constructor.applyOnClass.get({
				id : this.applyOn
			}, function(err, obj) {
				if(err !== null) {
					callback(err);
				} else {
					callback(null, obj.hasWritePerm(user));
				}
			}.bind(this));

			break;

		default:
			return false;

	}

}

BasePermission.prototype._generateHash = function() {
	c = require('crypto')
	h = c.createHash('md5')
	h.update(this._type);
	h.update(this.applyOn);
	h.update(this.grantTo);

	this._data['hash'] = h.digest('hex')
}

exports.BasePermission = BasePermission;
