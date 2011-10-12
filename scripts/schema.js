var JSV = require('JSV').JSV

var models = require('../models');

	

	
models.Schema.search({query : {match_all : {}}}, ['id', 'schema'], function (err, data) {
			
	if (err !== null) {
		callback(err, null);
	}  else {
		
		console.log('Recupération ok')
		
		var env = JSV.createEnvironment("json-schema-draft-03");
		
		var schemas = data.rows;

		
		while(schemas.length > 0) {
			var tmp = _load(env, schemas);
			
			if (tmp.length === 0) {
				console.log('ok');
				break;
			}
			
			else if (tmp.length === schemas.length) {
				console.log('failed');
				break;
			} else {
				tmp = schemas;
			}
		}
		
		
		
	}
	
});

var _load = function (env, schemas) {
	
	var tmp = []
	
	for (var i = 0, l = schemas.length; i<l;i++) {
			
			try {
			
			env.createSchema(schemas[i].schema, undefined, schemas[i].id)
			
			console.log('done', schemas[i].id)
			
			} catch (e) {
				tmp.push(schemas[i])
				console.log(schemas[i].id)
				
			} 
		}
		console.log(tmp)
		return tmp;
}
		
	
