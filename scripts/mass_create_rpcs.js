var settings = require('../settings.js');
var Rest = require('../libs/rest.js').Rest;

var datas = [{
	type : 'user',
	first_name : 'Jean-Hugues',
	last_name : 'Pinson',
	email : 'jh.pinson@gmail.com',
	password : 'hashed_password',
	is_active : true,
	is_staff : true,
	is_superuser : true
}, {
	type : 'user',
	first_name : 'David',
	last_name : 'Charbonnier',
	email : 'd.charbonnier@oxys.net',
	password : 'hashed_password',
	is_active : true,
	is_staff : true,
	is_superuser : true
}, {
	type : 'user',
	first_name : 'Ronan',
	last_name : 'Texier',
	email : 'r.texier@oxys.net',
	password : 'hashed_password',
	is_active : true,
	is_staff : true,
	is_superuser : true
}, {
	type : 'user',
	first_name : 'Isabelle',
	last_name : 'Pinson',
	email : 'isabelle.athaquet@bpso.fr',
	password : 'hashed_password',
	is_active : false,
	is_staff : false,
	is_superuser : false
}]

var nb_users = 0;
var users = [];

var create_events = function(user) {

	var rest = new Rest('10.7.36.161');

	for(var i = 0, l = 10000; i < l; i++) {
		//console.log("create event n° ", i, " for user ", user.id)
		var event = {
			name : 'name ' + Math.random()
		}
		rest.post('/event', JSON.stringify(event), function(err, res, data) {

			if(err !== null) {
				console.log(err)
				return;
			}

			try {
				var event = JSON.parse(data);
				//console.log(event.id)

			} catch (e) {
				console.log(data)
			}

		});
	}

}
var create_users = function() {

	for(var i = 0, l = datas.length; i < l; i++) {
		var data = datas[i]

		var rest = new Rest('10.7.36.161');
		rest.post('/user', JSON.stringify(data), function(err, res, data) {

			if(err !== null) {
				console.log(err)
				return;
			}

			var user = JSON.parse(data);
			create_events(user);

		});
	}

}
var validatorEnvironment = require('../libs/schemas/validator').validatorEnvironment;
validatorEnvironment.load(create_users);
