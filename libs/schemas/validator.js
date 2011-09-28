var JSV = require('JSV').JSV

var settings = require('../../settings.js');
	
var ValidatorEnvironment = function () {
	
}

ValidatorEnvironment.prototype._env = null;

ValidatorEnvironment.prototype.load = function (callback) {
	
	var self = this;
	/*
	db.view('/' + settings.couchdb.db + '/_design/schema/_view/published', {}, function(err, doc) {
		if (err !== null) {
			callback(err, null);
		} else if (typeof(doc.error) !== 'undefined' ) {
			callback(new Error(doc.error));
		} else {
			var env = JSV.createEnvironment("json-schema-draft-03");
			for (var i = 0, l = doc.rows.length; i<l;i++) {
				env.createSchema(doc.rows[i].value, undefined, doc.rows[i].value.id)
			}
			self._env = env;
			callback(null, true)
		}
	});
	*/
	// env.createSchema(JSON.parse(fs.readFileSync('schema/schema1.json')), undefined, "http://example.com/schema1.json")
	
}

ValidatorEnvironment.prototype.getEnv = function () {
	return this._env;
}





exports.validatorEnvironment = new ValidatorEnvironment();


