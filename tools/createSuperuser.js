var redisClient = require('../libs/redis-client');

var models = require('../models');

var user = new models.User();
user.login = process.argv[2];
user.password = process.argv[3];
user.email = process.argv[4];
user.isActive = true;
user.isSuperuser = true;
user.isStaff = true;


user.save(function(err, obj) {
	if(err === null) {
		console.log(obj.serialize(['id', 'login', 'email', 'isActive', 'isSuperuser', 'isStaff']))
	} else {
		
		if( err instanceof models.errors.ObjectAlreadyExists) {
			console.log('ObjectAlreadyExists');

		} else if( err instanceof models.errors.ValidationError) {
			console.log( obj.validationErrors);

		} else {
			console.log( 'Internal error')
		}
	}
	
	redisClient.end();
	
});

