var RestBase = require('./base.js').RestBase;
var util = require("util");
var statusCode = require('../statusCodes.js');
var models = require('../../models');
var oauth = require('../oauth');
var mOAuth = require('./mOAuth');
var mModelUrls = require('./mModelUrls');
var mPermissions = require('./mPermissions');
var mLock = require('./mLock');
var mModelSearch = require('./mModelSearch');
var log = require('czagenda-log').from(__filename);
var statusCodes = require('../statusCodes');

function RestOAuthToken(server) {

	RestBase.call(this, 'oauth-token', models.OAuthToken, server);

	var modelMiddleware = [this._verifySignature, this.getUserPermsAndGroups,
			this.staffOnly]

	// Model

	this._idRegexp = '([0-9a-zA-Z]+)';

	this._urls.post[this._urlPrefix + '/:id/_authorize'] = {
		middleware : modelMiddleware.concat([this.requireLock.bind(this)]),
		fn : this.authorize
	};

	this._urls.get[this._urlPrefix] = {
		middleware : modelMiddleware,
		fn : this.list
	};
	this._urls.get[this._urlPrefix + '/_count'] = {
		middleware : modelMiddleware,
		fn : this.count
	};

	this._urls.get[this._urlPrefix + '/:id'] = {
		middleware : [this._verifySignature, this.getUserPermsAndGroups,
				this.ownerOrStaff],
		fn : this.read
	};

	this._urls.post[this._urlPrefix] = {
		middleware : modelMiddleware,
		fn : this.create
	};

	this._urls.put[this._urlPrefix + '/:id'] = {
		middleware : modelMiddleware.concat([this.requireLock.bind(this)]),
		fn : this.update
	};
	this._urls.del[this._urlPrefix + '/:id'] = {
		middleware : modelMiddleware.concat([this.requireLock.bind(this)]),
		fn : this.del
	};

	// Challenge OAuth
	this._urls.get[this._urlPrefix + '/_request-token'] = {
		middleware : [this._verifyConsumerSignature],
		fn : this.requestToken
	};
	this._urls.get[this._urlPrefix + '/_access-token'] = {
		middleware : [this._verifyRequestTokenSignature],
		fn : this.accessToken
	};

	this._urls.post[this._urlPrefix + '/_request-token'] = {
		middleware : [this._verifyConsumerSignature],
		fn : this.requestToken
	};
	this._urls.post[this._urlPrefix + '/_access-token'] = {
		middleware : [this._verifyRequestTokenSignature],
		fn : this.accessToken
	};

	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search,
		middleware : modelMiddleware
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search,
		middleware : modelMiddleware
	};

	this._initServer();
}

util.inherits(RestOAuthToken, RestBase);

// mixin mOAuth
for (k in mOAuth) {
	RestOAuthToken.prototype[k] = mOAuth[k];
}

// mixin mModelUrls
for (k in mModelUrls) {
	RestOAuthToken.prototype[k] = mModelUrls[k];
}

// mixin mPermissions
for (k in mPermissions) {
	RestOAuthToken.prototype[k] = mPermissions[k];
}

// mixin mLock
for (k in mLock) {
	RestOAuthToken.prototype[k] = mLock[k];
}

for (k in mModelSearch) {
	RestOAuthToken.prototype[k] = mModelSearch[k];
}

RestOAuthToken.prototype.searchFields = {
	'user' : 'term',
	'consumer' : 'term',
	'createDate' : 'datetime',
	'updateDate' : 'datetime',
	'name' : 'text',
	'description' : 'text'
}

RestOAuthToken.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate',
	'name' : 'name.untouched'
}

RestOAuthToken.prototype.ownerOrStaff = function(req, res, next) {

	if (req.user.isStaff === true || req.user.isSuperuser
			|| req.oauthParams['oauth_token'] === req.params.id) {
		log.debug('check ownerOrStaff, granted');
		next();
	} else {
		log.debug('check ownerOrStaff, forbidden');
		res.statusCode = statusCodes.FORBIDDEN;
		res.end('Insufficient privileges');
	}

}

RestOAuthToken.prototype._getDefaultMiddleware = function() {
	return [oauth.verifyBody()];
}

RestOAuthToken.prototype.requestToken = function(req, res) {

	var obj = new models.OAuthToken;

	obj.consumer = req.consumer;
	obj.tokenType = 'REQUEST';

	obj.save(function(err, obj) {

				if (err === null) {
					res.statusCode = statusCode.CREATED;
					res.end("oauth_token=" + obj.key + "&oauth_token_secret="
							+ obj.secret);
				} else {

					// @TODO : typer les erreurs
					if (err instanceof models.errors.ObjectAlreadyExists) {
						res.statusCode = statusCode.DUPLICATE_ENTRY;
						res.end(err.message);

					} else if (err instanceof models.errors.ValidationError) {
						console.log(JSON.stringify(obj))
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

				if (err !== null) {
					res.statusCode = statusCode.INTERNAL_ERROR;
					res.end('Internal error')
					return;
				} else {

					if (req.oauthParams.oauth_verifier !== obj.verifier) {
						res.statusCode = statusCode.BAD_REQUEST;
						res.end('Bad verifier');
						return;
					}

					// search if an access token already exists

					var query = {
						"query" : {
							"filtered" : {
								"filter" : {
									"and" : [{
										"query" : {
											"field" : {
												"tokenType" : {
													"analyze_wildcard" : true,
													"auto_generate_phrase_queries" : true,
													"query" : "ACCESS"
												}
											}
										}
									}, {
										"query" : {
											"field" : {
												"isApproved" : {
													"analyze_wildcard" : true,
													"auto_generate_phrase_queries" : true,
													"query" : "true"
												}
											}
										}
									}, {
										"term" : {
											"consumer" : req.consumer
										}
									}, {
										"term" : {
											"user" : obj.user
										}
									}]
								},
								"query" : {
									"match_all" : {}
								}
							}
						}
					};

					models.OAuthToken.search(query,
							models.OAuthToken.staffAttributes, function(err,
									result) {

								// token exists, return it
								if (err === null && result.total_rows > 0) {
									res.statusCode = statusCode.CREATED;
									res.end("oauth_token=" + result.rows[0].key
											+ "&oauth_token_secret="
											+ result.rows[0].secret);
								} else {
									// create new token
									var nobj = new models.OAuthToken;

									nobj.consumer = req.consumer;
									nobj.tokenType = 'ACCESS';
									nobj.user = obj.user;
									nobj.isApproved = true;

									nobj.save(function(err, nobj) {
										if (err === null) {
											res.statusCode = statusCode.CREATED;
											res.end("oauth_token=" + nobj.key
													+ "&oauth_token_secret="
													+ nobj.secret);

										} else {

											// @TODO : typer les erreurs
											if (err instanceof models.errors.ObjectAlreadyExists) {
												res.statusCode = statusCode.DUPLICATE_ENTRY;
												res.end(err.message);

											} else if (err instanceof models.errors.ValidationError) {
												res.statusCode = statusCode.BAD_REQUEST;
												res
														.end(JSON
																.stringify(obj.validationErrors));

											} else {
												res.statusCode = statusCode.INTERNAL_ERROR;
												res.end('Internal error')
											}
										}
									}.bind(this));

								}
								// delete request token
								obj.del(function(err, obj) {
									if (err !== null) {
										log
												.warning(
														'Error while deleting request token',
														err, obj)
									}

								}.bind(this))

							}.bind(this));
				}

			}.bind(this));

}
/*
 * RestOAuthToken.prototype.tokenExists = function(req, res) {
 * 
 * var query = { query : { term : { consumer : req.params.consumer }, term : {
 * user : req.params.user }, term : { tokentype : 'ACCESS' } } }
 * 
 * models.OAuthToken.search(query, [key, secret], function(err, result) { if(err
 * !== null) { if( err instanceof errors.IndexDoesNotExist) { res.statusCode =
 * statusCodes.NOT_FOUND; res.end('Not found'); } else { res.statusCode =
 * statusCodes.INTERNAL_ERROR; res.end('Internal error') } } else {
 * res.end(this._renderJson(req, res, result)); }
 * 
 * }.bind(this)); }
 */
RestOAuthToken.prototype.authorize = function(req, res) {
	models.OAuthToken.get({
				id : "/oauth-token/" + req.params.id
			}, function(err, obj) {

				if (err !== null) {

					if (err instanceof models.errors.ObjectDoesNotExist) {
						res.statusCode = statusCode.NOT_FOUND;
						res.end('Not found')
					} else if (err instanceof models.errors.ValidationError) {
						res.statusCode = statusCode.BAD_REQUEST;
						res.end(this
								._renderJson(req, res, obj.validationErrors));

					} else {
						res.statusCode = statusCode.INTERNAL_ERROR;
						res.end('Internal error')
					}

				} else {

					obj.isApproved = true;
					obj.user = req.body.user;
					obj.setVerifier();
					obj.save(function(err, obj) {

						if (err !== null) {
							if (err instanceof models.errors.ObjectDoesNotExist) {
								res.statusCode = statusCode.NOT_FOUND;
								res.end('Not found')
							} else if (err instanceof models.errors.ValidationError) {
								res.statusCode = statusCode.BAD_REQUEST;
								res.end(this._renderJson(req, res,
										obj.validationErrors));
							} else {
								res.statusCode = statusCode.INTERNAL_ERROR;
								res.end('Internal error')
							}

						} else {
							res.statusCode = statusCode.ALL_OK;
							res.end(this._renderJson(req, res, {
										verifier : obj.verifier
									}));
						}

					}.bind(this));

				}

			}.bind(this))
}

exports.RestOAuthToken = RestOAuthToken