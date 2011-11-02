var Base = require('./base.js').Base;
var util = require("util");
var utils = require('../libs/utils.js');
var errors = require('./errors.js');
var settings = require('../settings.js');

function Category () {
	this._attributs = {title : null, description : null, author:null};
	Base.call(this, 'category');	
}

util.inherits(Category, Base);

Category.publicAttributes = Base.publicAttributes.concat(['title', 'description', 'author']);
Category.staffAttributes = Category.publicAttributes.concat(Base.staffAttributes);

Category.publicWriteAttributes = ['title', 'description'];
Category.staffWriteAttributes = Category.publicWriteAttributes;


Category.prototype.hasPerm = function (perm, user, callback) {
	
	switch (perm) {
		case 'read':
			callback(null, true);
			break;
		case 'create':
		case 'write':
		case 'del':
			callback(null, (user.isStaff === true || user.isSuperuser === true));
			break;
			
		default:
			return false;
		
	}
}

Category.prototype._validate = function (callback) {
	this.validateString('title', false, 5, 128);
	this.validateString('description', true, null, 1024);
	
	callback(null);
}

Category.prototype._generateHash = function () {
	c = require('crypto')
    h = c.createHash('md5')
    h.update(this._type);
	h.update(JSON.stringify(this.title));
	h.update(JSON.stringify(this.description));
	this._data['hash'] = h.digest('hex')
}


Category.get = function(options, callback) {
	Base.get(options,Category, callback)
}

Category.search = function(query, attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'category',attrs, Category, callback)
}

Category.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'category',callback)
}

exports.Category = Category;