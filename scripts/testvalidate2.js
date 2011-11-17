var JSV = require('JSV').JSV;
var env = JSV.createEnvironment("json-schema-draft-03");

env.createSchema({
	"additionalProperties" : false,
	"properties" : {
		"email" : {
			"type" : "string",
			"required" : true,
			"pattern" : "^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$"
		}
	}
}, undefined, "/schema1");






schema = env.findSchema("/schema1");
var report = env.validate({"email" : "to?to@toto.com"}, schema);
console.log(report.errors)
