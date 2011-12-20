var redisClient = require('../libs/redis-client').redisClient;

var models = require('../models');

var user = process.argv[2];

var consumerToken = null;
var consumerSecret = null;
var token = null;
var secret = null;

var consumer = new models.OAuthConsumer();
consumer.user = user;
consumer.name = process.argv[3];
consumer.description = process.argv[4];

consumer.save(function(err, obj) {
	if(err === null) {
		//console.log(obj.serialize(['id', 'name', 'key', 'secret']))
		
		consumerToken = obj.key;
		consumerSecret = obj.secret;
		
		var token = new models.OAuthToken();
		token.consumer = obj.id;
		token.user = user;
		token.tokenType = 'ACCESS';
		token.isApproved = true;

		token.save(function(err, obj) {
			if(err === null) {
				console.log(obj.serialize(['id', 'key', 'secret']))
				
				token = obj.key;
				secret = obj.secret;
				
				console.log("Consumer token: " + consumerToken);
				console.log("Consumer secret: " + consumerSecret);
				console.log("Access token: " + token);
				console.log("Access token: " + secret);
				
			} else {

				if( err instanceof models.errors.ObjectAlreadyExists) {
					console.log('ObjectAlreadyExists');

				} else if( err instanceof models.errors.ValidationError) {
					console.log(obj.validationErrors);

				} else {
					console.log('Internal error')
				}
			}
			
			redisClient.end();

		});

		

	} else {

		if( err instanceof models.errors.ObjectAlreadyExists) {
			console.log('ObjectAlreadyExists');

		} else if( err instanceof models.errors.ValidationError) {
			console.log(obj.validationErrors);

		} else {
			console.log('Internal error')
		}
		
		redisClient.end(); 
	}

});
