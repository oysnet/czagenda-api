var RestOAuth = require('./oAuth.js').RestOAuth;
var util = require("util");
var mModelUrls = require('./mModelUrls');

var models = require('../../models');
var log = require('czagenda-log').from(__filename);

var RestOAuthBasePerm =  function() {
	
	RestOAuth.apply(this, arguments);
	
	
	this._urls.post[this._urlPrefix] =  { middleware : [], fn :this.create};
	this._urls.del[this._urlPrefix + '/:id'] =  { middleware : [], fn :this.del};
	
}

util.inherits(RestOAuthBasePerm, RestOAuth);

// mixin mModelUrls
for (k in mModelUrls) {
	RestOAuthBasePerm.prototype[k] = mModelUrls[k];
}
	

exports.RestOAuthBasePerm = RestOAuthBasePerm;
