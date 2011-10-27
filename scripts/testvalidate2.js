var JSV = require('JSV').JSV;
var env = JSV.createEnvironment("json-schema-draft-03");

env.createSchema({
	"additionalProperties" : false,
	"properties" : {
		"text-base-abstract" : {
			"type" : "string",
			"required" : true
		}
	}
}, undefined, "/base-abstract");


env.createSchema({
	"additionalProperties" : false,
	"properties" : {
		"textcommon" : {
			"type" : "string",
			"required" : true
		}
	}
}, undefined, "/common");


env.createSchema({
	"type": "object",
	"extends": {"$ref" : "/base-abstract" },
	"additionalProperties" : false,
	"properties" : {
		"text-event-abstract" : {
			"type" : "string",
			"required" : true
		},
		"where-eent-abstract": {
			"description": "Location of the event",
			"type": "array",
			"required": true,
			"minItems": 1,
			"items": {
				"$ref": "/common"
			}
		}

	}
}, undefined, "/event-abstract");

env.createSchema({
	"type": "object",
	"extends": {"$ref" : "/event-abstract" },
	"additionalProperties" : false,
	"properties" : {
		"text-event" : {
			"type" : "string",
			"required" : true
		}

	}
}, undefined, "/event");

env.createSchema({
	"type": "object",
	"extends": {"$ref" : "/base-abstract" },
	"additionalProperties" : false,
	"properties" : {
		"text-entity" : {
			"type" : "string",
			"required" : true
		},
		"where-entity": {
			"description": "Location of the event",
			"type": "array",
			"required": true,
			"minItems": 1,
			"items": {
				"$ref": "/common"
			}
		}
	}
}, undefined, "/entity");



console.log('validate event')
schema = env.findSchema("/event");
var report = env.validate({}, schema);
console.log(report.errors)


console.log('validate eentity')
schema = env.findSchema("/entity");
var report = env.validate({}, schema);
console.log(report.errors)