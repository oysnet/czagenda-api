var models = require('../../models');
var oauth = require('../oauth');

var verifyConsumerToken = function(req, identifier, callback) {
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
/**
 * This middleware is the regular signature control
 */
exports._verifySignature = oauth.verifySignature(function(req, type, identifier, callback) {
	
	if(type == 'client') {
		verifyConsumerToken(req, identifier, callback);
	}
	if(type == 'token') {
		models.OAuthToken.get({
			id : "/oauth-token/" + identifier
		}, function(err, obj) {

			if(err !== null || obj.isApproved === false) {
				callback();
			} else {
				req.token = obj.id;
				req.user = obj.user
				
				callback(obj.secret);
			}
		});
	}
});


/**
 * This middleware is used when oauth is requesting the temporary token
 */
exports._verifyConsumerSignature = oauth.verifySignature(function(req, type, identifier, callback) {
		
	if(type == 'client') {

		verifyConsumerToken(req, identifier, callback);

	}
	if(type == 'token') {
		callback();
	}

});

/**
 * This middleware is used when oauth is requesting the definitve access token
 */
exports._verifyRequestTokenSignature = oauth.verifySignature(function(req, type, identifier, callback) {

	if(type == 'client') {

		verifyConsumerToken(req, identifier, callback);

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

})