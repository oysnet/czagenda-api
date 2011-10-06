var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var models = require('../../models');

var RestMembership = exports.RestMembership = function (server) {
	RestOAuthModel.call(this, 'membership', models.Membership, server);
	this._initServer();
}
util.inherits(RestMembership, RestOAuthModel);
