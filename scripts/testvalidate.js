var ValidatorEnvironment = require('../libs/schemas/validator').ValidatorEnvironment;
var redisClient = require('../libs/redis-client');
var models = require('../models');
var fs = require('fs');
var log = require('czagenda-log').from(__filename);

var validator = new ValidatorEnvironment()
var env = validator.getEnv();


validator.load(function () {
	console.log(arguments);
	
	console.log(env.findSchema('tototo'))
	
	var test = {
		'title' : 'un event',
		'author' : '/user/jh.pinson',
		where : [{valueString : 'chez moi'}]
		
	}
	
	console.log(env.validate(test, env.findSchema("/schema/event")).errors)
})


/*
env.createSchema(schema, undefined, "schema")

var event = {
	"$schema" : "schema",
	'author' : '2',
	"test" : '2'

}

console.log(env.validate({}, event).errors)*/