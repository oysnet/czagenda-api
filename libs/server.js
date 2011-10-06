/**
 * Module dependencies.
 */
var log = require('czagenda-log').from(__filename);
var express = require('express');
var oauth = require('./oauth');
var cors = require('./cors.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function() {
	app.use(oauth.parseHeader());
	app.use(cors);
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
});
app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions : true,
		showStack : true
	}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});
// Routes
var models = require('../models')
var statusCode = require('./statusCodes.js');
var log = require('czagenda-log').from(__filename);

var verifyOAuthRequest = [oauth.verifyBody(), oauth.verifySignature(function(req, type, identifier, callback) {
	console.log('type ' + type + ' ' + identifier);

	if(identifier === '') {
		callback();
	}

	if(type == 'client') {

		models.OAuthConsumer.get({
			id : "/oauth-consumer/" + identifier
		}, function(err, obj) {

			if(err !== null || obj.status !== 'ACCEPTED') {
				callback();
			} else {
				req.consumer = obj.id;
				callback(obj.secret);
			}

		});
	}
	if(type == 'token') {
		models.OAuthToken.get({
			id : "/oauth-token/" + identifier
		}, function(err, obj) {

			if(err !== null) {
				callback();
			} else {
				req.token = obj.id;
				callback(obj.secret);
			}

		});
	}

})];
var verifyOAuthRequestRequestToken = [oauth.verifyBody(), oauth.verifySignature(function(req, type, identifier, callback) {
	console.log('type ' + type + ' ' + identifier);

	if(identifier === '') {
		callback();
	}

	if(type == 'client') {

		models.OAuthConsumer.get({
			id : "/oauth-consumer/" + identifier
		}, function(err, obj) {

			if(err !== null || obj.status !== 'ACCEPTED') {
				callback();
			} else {
				req.consumer = obj.id;
				callback(obj.secret);
			}

		});
	}
	if(type == 'token') {
		models.OAuthToken.get({
			id : "/oauth-token/" + identifier
		}, function(err, obj) {

			if(err !== null) {
				callback();
			} else if(obj.tokenType !== 'REQUEST') {
				callback();
			} else {
				req.token = obj.id;
				callback(obj.secret);
			}

		});
	}

})];

app.get('/requesttoken', verifyOAuthRequest, function(req, res) {
	
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

});

app.get('/accesstoken', verifyOAuthRequestRequestToken, function(req, res) {
	
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

});
