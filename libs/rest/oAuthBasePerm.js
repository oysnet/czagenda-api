var RestOAuth = require('./oAuth.js').RestOAuth;
var util = require("util");
var mModelUrls = require('./mModelUrls');

var models = require('../../models');
var log = require('czagenda-log').from(__filename);

var RestOAuthBasePerm =  function() {
	
	RestOAuth.apply(this, arguments);
	
	for (k in mModelUrls) {
		this[k] = mModelUrls[k];
	}
	
	this._urls.post[this._urlPrefix] =  { middleware : [], fn :this.create};
	this._urls.del[this._urlPrefix + '/:id'] =  { middleware : [], fn :this.del};
	
}

util.inherits(RestOAuthBasePerm, RestOAuth);


exports.RestOAuthBasePerm = RestOAuthBasePerm;
