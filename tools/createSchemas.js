var redis = require('../libs/redis-client');
var approvedEnvironment = require('../libs/schemas/validator').approvedEnvironment;
var models = require('../models');
var fs = require('fs');
var log = require('czagenda-log').from(__filename);

var SCHEMAS = [

	 {
		"name" : "base",
		"final" : false,
		"file" : "base.json"
	},
	{
		"name" : "who",
		"final" : true,
		"file" : "who.json"
	},
	
	{
		"name" : "geo",
		"final" : true,
		"file" : "geo.json"
	},
	
	{
		"name" : "localization",
		"final" : true,
		"file" : "localization.json"
	},
	
	{
		"name" : "event",
		"final" : true,
		"file" : "event.json"
	}
	

]

var createSchema = function() {

		
		var data = SCHEMAS.shift();
		
		log.notice("Try to create " + data.name);
		
		var schema = new models.Schema();
		schema.name = data.name;
		schema.author = "/user/jh.pinson";
		schema['final'] = data['final'];
		schema.status = 'APPROVED';
		schema.schema = JSON.parse(fs.readFileSync("./schemas/" + data.file, 'utf8'));
		
		
		schema.save(function(err, obj) {
			if(err === null) {
				log.notice("Succesfully created " + data.name, obj.id);
				
				if (SCHEMAS.length > 0) {
					setTimeout(createSchema, 1000);
				} else {
					log.notice("All done");
				}
				
			} else {

				if( err instanceof models.errors.ObjectAlreadyExists) {
					console.log('ObjectAlreadyExists', data.name);

				} else if( err instanceof models.errors.ValidationError) {
					console.log(obj.validationErrors, data.name);

				} else {
					console.log('Internal error', data.name)
				}
			}

		});
	}



approvedEnvironment.load(function(err, success) {
	createSchema();
})