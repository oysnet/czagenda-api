var redisClient = require('../libs/redis-client').redisClient;

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
		
		console.log('id: ' + obj.id);
		console.log('login: ' + obj.login);
		console.log('password: ' + obj.password);
		console.log('email: ' + obj.email);
		console.log('isSuperuser: ' + obj.isSuperuser);
		console.log('isStaff: ' + obj.isStaff);
		redisClient.end();
		process.exit(1)
	} else {
		
		if( err instanceof models.errors.ObjectAlreadyExists) {
			console.log('A similar user already exists');

		} else if( err instanceof models.errors.ValidationError) {
			console.log( obj.validationErrors);

		} else {
			console.log( 'Internal error')
		}
		redisClient.end();
		process.exit(0)
	}
	
	
	
});

