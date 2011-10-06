var RestBase = require('./base.js').RestBase;
var util = require("util");
var statusCode = require('../statusCodes.js');
var models = require('../../models');
var oauth = require('../oauth');
var mOAuth = require('./mOAuth');
var mModelUrls = require('./mModelUrls');


function RestOAuthToken(server) {

	RestBase.call(this, 'oauth-token', models.OAuthToken, server);
	
	for (k in mOAuth) {
		this[k] = mOAuth[k];
	}
	for (k in mModelUrls) {
		this[k] = mModelUrls[k];
	}
	
	
	var modelMiddleware = [this._verifySignature]
	
	
	// Model
	
	this._idRegexp = '([0-9a-zA-Z]+)';
	
	this._urls.post[this._urlPrefix + '/:id/_authorize'] = {middleware : modelMiddleware, fn :  this.authorize};
	
	this._urls.get[this._urlPrefix] = { middleware : modelMiddleware, fn : this.list};
	this._urls.get[this._urlPrefix + '/_count'] =  { middleware : modelMiddleware,  fn :this.count};
	
	this._urls.get[this._urlPrefix + '/:id'] =  { middleware : modelMiddleware, fn :this.read};
	
	this._urls.post[this._urlPrefix] =  { middleware :modelMiddleware, fn :this.create};

	this._urls.put[this._urlPrefix + '/:id'] =  { middleware : modelMiddleware, fn :this.update};
	this._urls.del[this._urlPrefix + '/:id'] =  { middleware : modelMiddleware, fn :this.del};
	
	// Challenge OAuth
	this._urls.get[this._urlPrefix + '/_request-token'] = { middleware : [this._verifyConsumerSignature], fn : this.requestToken};
	this._urls.get[this._urlPrefix + '/_access-token'] = { middleware : [this._verifyRequestTokenSignature], fn : this.accessToken};
	
	this._urls.post[this._urlPrefix + '/_request-token'] = { middleware : [this._verifyConsumerSignature], fn : this.requestToken};
	this._urls.post[this._urlPrefix + '/_access-token'] = { middleware : [this._verifyRequestTokenSignature], fn : this.accessToken};
	
	this._initServer();
}

util.inherits(RestOAuthToken, RestBase);

RestOAuthToken.prototype._getDefaultMiddleware = function () {
	return [oauth.verifyBody()];
}

RestOAuthToken.prototype.requestToken = function(req, res) {
	
	console.log('requestToken');
	var obj = new models.OAuthToken;

	obj.consumer = req.consumer;
	obj.tokenType = 'REQUEST';

	obj.save( function(err, obj) {

		if(err === null) {
			res.statusCode = statusCode.CREATED;
			res.end("oauth_token=" + obj.key + "&oauth_token_secret=" + obj.secret);
		} else {

			// @TODO : typer les erreurs
			if( err instanceof models.errors.ObjectAlreadyExists) {
				res.statusCode = statusCode.DUPLICATE_ENTRY;
				res.end(err.message);

			} else if( err instanceof models.errors.ValidationError) {
				res.statusCode = statusCode.BAD_REQUEST;
				res.end(JSON.stringify(obj.validationErrors));

			} else {
				res.statusCode = statusCode.INTERNAL_ERROR;
				res.end('Internal error')
			}

		}

	}.bind(this));

}

RestOAuthToken.prototype.accessToken = function(req, res) {
	
	models.OAuthToken.get({
		id : req.token
	}, function(err, obj) {

		if(err !== null) {
			res.statusCode = statusCode.INTERNAL_ERROR;
			res.end('Internal error')
			return;
		} else {
			
			if (req.oauthParams.oauth_verifier !== obj.verifier) {
				res.statusCode = statusCode.BAD_REQUEST;
				res.end('Bad verifier');
				return;
			}
			
			var nobj = new models.OAuthToken;

			nobj.consumer = req.consumer;
			nobj.tokenType = 'ACCESS';
			nobj.user = obj.user;
			nobj.isApproved = true;
			
			nobj.save( function(err, nobj) {
				if(err === null) {
					res.statusCode = statusCode.CREATED;
					res.end("oauth_token=" + nobj.key + "&oauth_token_secret=" + nobj.secret);

				} else {

					// @TODO : typer les erreurs
					if( err instanceof models.errors.ObjectAlreadyExists) {
						res.statusCode = statusCode.DUPLICATE_ENTRY;
						res.end(err.message);

					} else if( err instanceof models.errors.ValidationError) {
						res.statusCode = statusCode.BAD_REQUEST;
						res.end(JSON.stringify(obj.validationErrors));

					} else {
						res.statusCode = statusCode.INTERNAL_ERROR;
						res.end('Internal error')
					}
				}
			}.bind(this));

			obj.del( function( err, obj) {
				if(err !== null) {
					log.warning('Error while deleting request token', err, obj)
				} 

			}.bind(this))

		}

	}.bind(this));

}

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