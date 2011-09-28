


var settings = require('../settings.js');


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
	var Event = require("../models/event.js").Event;
	
	for (var i = 0, l = 10; i<l;i++) {
		console.log("create event n° ",i ," for user ", user.id)
		var event = new Event();
		event.author = user.id;
		event.event = {name : 'name ' + Math.random()}
		event.status = Math.random() < 0.5 ? 'PENDING' : 'PUBLISHED';
		event.save(function (err, event) {
			if(err === null) {
				console.log(event.id)				
			} else {
				console.log(err)				
			}

		})
	}	
	
}


var create_users = function() {
	
	for(var i = 0, l = datas.length; i < l; i++) {
		var data=datas[i]
		var User = require("../models/user.js").User;
		var user = new User();
		for(k in data) {
			user[k] = data[k]
		}
		nb_users++;
		users.push(user);
	}
	
	for(var i = 0, l = users.length; i < l; i++) {
		
		users[i].save(function(err, obj) {
			if (err !== null) {
				console.log(err)
				return;
			}
			nb_users--;
		})
	}
}

var validatorEnvironment = require('../libs/schemas/validator').validatorEnvironment;
validatorEnvironment.load(create_users);