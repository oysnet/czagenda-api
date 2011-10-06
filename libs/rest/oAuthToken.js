var RestBase = require('./base.js').RestBase;
var util = require("util");
var statusCode = require('../statusCodes.js');
var models = require('../../models');

function RestOAuthToken(server) {

	RestBase.call(this, 'oauth-token', models.OAuthToken, server);

	var urls = {

		post : {
			'/oauth-token/:id/_authorize' : this.authorize
		}
	}
	this.addurls(urls);

	this._initServer();
}

util.inherits(RestOAuthToken, RestBase);

RestOAuthToken.prototype.authorize = function(req, res) {
	models.OAuthToken.get({
		id : "/oauth-token/" + req.params.id
	}, function(err, obj) {

		if(err !== null) {

			if( err instanceof models.errors.ObjectDoesNotExist) {
				res.statusCode = statusCode.NOT_FOUND;
				res.end('Not found')
			} else if( err instanceof models.errors.ValidationError) {
				res.statusCode = statusCode.BAD_REQUEST;
				res.end(this._renderJson(req, res, obj.validationErrors));

			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}

		} else {
			
			obj.isApproved = true;
			obj.user = req.body.user;
			obj.setVerifier();
			obj.save( function(err, obj) {

				if(err !== null) {
					if( err instanceof models.errors.ObjectDoesNotExist) {
						res.statusCode = statusCode.NOT_FOUND;
						res.end('Not found')
					} else if( err instanceof models.errors.ValidationError) {
						res.statusCode = statusCode.BAD_REQUEST;
						res.end(this._renderJson(req, res, obj.validationErrors));
					} else {
						res.statusCode = statusCode.INTERNAL_ERROR;
						res.end('Internal error')
					}

				} else {
					res.statusCode = statusCode.ALL_OK;
					res.end(this._renderJson( req, res, {verifier : obj.verifier} ));
				}

			}.bind(this));
			

		}

	}.bind(this))
}

exports.RestOAuthToken = RestOAuthToken