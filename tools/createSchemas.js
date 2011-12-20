var redis = require('../libs/redis-client');
var approvedEnvironment = require('../libs/schemas/validator').approvedEnvironment;
var models = require('../models');
var fs = require('fs');
var log = require('czagenda-log').from(__filename);
var path = require('path');

var SCHEMAS = [{
	"name" : "base",
	"final" : false,
	"file" : "base-abstract.json"
}, {
	"name" : "who",
	"final" : false,
	"file" : "who-abstract.json"
}, {
	"name" : "who",
	"final" : true,
	"file" : "who.json"
}, {
	"name" : "geo",
	"final" : false,
	"file" : "geo-abstract.json"
}, {
	"name" : "geo",
	"final" : true,
	"file" : "geo.json"
}, {
	"name" : "localization",
	"final" : false,
	"file" : "localization-abstract.json"
}, {
	"name" : "localization",
	"final" : true,
	"file" : "localization.json"
}, {
	"name" : "event",
	"final" : false,
	"file" : "event-abstract.json"
}, {
	"name" : "event",
	"final" : true,
	"file" : "event.json"
}, {
	"name" : "entity",
	"final" : false,
	"file" : "entity-abstract.json"
}, {
	"name" : "organization",
	"final" : false,
	"file" : "organization-abstract.json"
}, {
	"name" : "organization",
	"final" : true,
	"file" : "organization.json"
}, {
	"name" : "person",
	"final" : false,
	"file" : "person-abstract.json"
}, {
	"name" : "person",
	"final" : true,
	"file" : "person.json"
},{
	"name" : "event-europe",
	"final" : false,
	"file" : "event-europe-abstract.json"
},{
	"name" : "event-europe",
	"final" : true,
	"file" : "event-europe.json"
}]

var createSchema = function() {

	var data = SCHEMAS.shift();

	log.notice("Try to create " + data.name);

	var schema = new models.Schema();
	schema.name = data.name;
	schema.author = "/user/jh.pinson";
	schema['final'] = data['final'];
	schema.status = 'APPROVED';
	schema.schema = JSON.parse(fs.readFileSync("./schemas/" + data.file, 'utf8'));
	
	if (path.existsSync('./schemas/template/' + data.name + '.tpl') === true) {
		schema.template = fs.readFileSync("./schemas/template/" + data.name + '.tpl', 'utf8');
	}
	
	if (path.existsSync('./schemas/sample/' + data.name + '.json') === true) {
		schema.sample = fs.readFileSync("./schemas/sample/" + data.name + '.json', 'utf8');
	}
	
	schema.save(function(err, obj) {
		
		
		if(err === null || err instanceof models.errors.ObjectAlreadyExists) {
			
			if( err instanceof models.errors.ObjectAlreadyExists) {
				console.log('ObjectAlreadyExists', data.name);

			} else {
				log.notice("Succesfully created " + data.name, obj.id);
			}
			
			

			if(SCHEMAS.length > 0) {
				setTimeout(createSchema, 3000);
			} else {
				log.notice("All done");
				setTimeout(process.exit, 1000);
			}

		} else {

			 if( err instanceof models.errors.ValidationError) {
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