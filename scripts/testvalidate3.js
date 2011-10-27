var JSV = require('JSV').JSV;
var env = JSV.createEnvironment("json-schema-draft-03");
var fs = require('fs');
var log = require('czagenda-log').from(__filename);

var SCHEMAS = [{
	"name" : "base",
	"final" : false,
	"file" : "base-abstract.json"
},  {
	"name" : "geo",
	"final" : false,
	"file" : "geo-abstract.json"
}, {
	"name" : "geo",
	"final" : true,
	"file" : "geo.json"
},{
	"name" : "localization",
	"final" : false,
	"file" : "localization-abstract.json"
}, {
	"name" : "localization",
	"final" : true,
	"file" : "localization.json"
},{
	"name" : "entity",
	"final" : false,
	"file" : "entity-abstract.json"
},{
	"name" : "who",
	"final" : false,
	"file" : "who-abstract.json"
}, {
	"name" : "who",
	"final" : true,
	"file" : "who.json"
},  {
	"name" : "event",
	"final" : false,
	"file" : "event-abstract.json"
}, {
	"name" : "event",
	"final" : true,
	"file" : "event.json"
},  {
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
}]

var d = {};

SCHEMAS.forEach(function(schema) {
	var name = '/schema/' + schema.name + (schema['final'] === false ? '-abstract':'');
	d[name] = schema
	
});

[ '/schema/geo-abstract',
  '/schema/base-abstract',
  '/schema/who-abstract',
  '/schema/geo',
  '/schema/localization-abstract',
  '/schema/who',
  '/schema/localization',
  '/schema/entity-abstract',
  '/schema/event-abstract',
  '/schema/organization-abstract',
  '/schema/person-abstract',
  '/schema/event',
  '/schema/organization',
  '/schema/person' ].forEach(function (id) {
  	
  	var schema = d[id];
  	env.createSchema(JSON.parse(fs.readFileSync("./schemas/" + schema.file, 'utf8')), undefined, id);
  	console.log(id)
  });

function validate(data, schemaId) {
	console.log('##### VALIDATE AGAINST', schemaId)
	schema = env.findSchema(schemaId);

	if( typeof (schema) === 'undefined') {
		console.log('Fail to load schema', schemaId);
		return;
	}
	var report = env.validate(data, schema);
	console.log(report.errors)
}

validate( {title : "event that fail to validate against schema",links : [{rel:"describedby", href:"/schema/event"}],
			where : [{valueString: 2}]}
, "/schema/event")

validate({
	name : "org",
	type : "organization",
	links : [{
		rel : "describedby",
		href : "/schema/organization"
	}],
	where : [{
		valueString : "Pau"
	}]
}, "/schema/organization")

