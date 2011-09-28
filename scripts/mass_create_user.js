var settings = require('../settings.js');
var Rest = require('../libs/rest.js').Rest;
var validatorEnvironment = require('../libs/schemas/validator').validatorEnvironment;

var create_users = function() {

	var rest = new Rest(argv[0]);

	for(var i = 0, l = argv[1]; i < l; i++) {

		var data = {
			first_name : 'first_name' + Math.random(),
			last_name : 'last_name' + Math.random(),
			email : 'email' + Math.random() + '@toto.com',
			password : 'password'
		}

		rest.post('/user', JSON.stringify(data), function(err, res, data) {

			if(err !== null) {
				console.log(err)
				return;
			}

			try {
				var user = JSON.parse(data);
				console.log(user.id);
			} catch (e) {
				console.log(data)
			}

		});
	}

}



var argv = process.argv.slice(2);

if(argv.length != 2) {
	console.warn("masscreate_user server count !!!!!!!!")
} else {
	validatorEnvironment.load(create_users);
}