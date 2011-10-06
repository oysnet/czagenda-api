var redisClient = require('../libs/redis-client');

var models = require('../models');

var user = process.argv[2];



var consumer = new models.OAuthConsumer();
consumer.user = user;
consumer.name = process.argv[3];
consumer.description = process.argv[3];

consumer.save(function(err, obj) {
	if(err === null) {
		console.log(obj.serialize(['id', 'name', 'key', 'secret']))

		var token = new models.OAuthToken();
		token.consumer = obj.id;
		token.user = user;
		token.tokenType = 'ACCESS';
		token.isApproved = true;

		token.save(function(err, obj) {
			if(err === null) {
				console.log(obj.serialize(['id', 'key', 'secret']))
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
