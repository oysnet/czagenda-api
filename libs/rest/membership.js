var RestBase = require('./base.js').RestBase;
var util = require("util");
var models = require('../../models');

var RestMembership = exports.RestMembership = function (server) {
	RestBase.call(this, 'membership', models.Membership, server);
	this._initServer();
}
util.inherits(RestMembership, RestBase);
