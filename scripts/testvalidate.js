var log = require('czagenda-log').from(__filename);

// ##################################################################################
// VALIDATOR INITIALISATION
// ##################################################################################
var validator = require('../libs/schemas/validator');

function validate(data, schemaId) {
	console.log('##### VALIDATE AGAINST', schemaId)
	schema = validator.approvedEnvironment.getEnv().findSchema(schemaId);

	if( typeof (schema) === 'undefined') {
		console.log('Fail to load schema', schemaId);
		return;
	}
	var report = validator.approvedEnvironment.getEnv().validate(data, schema);
	console.log(report.errors)
}

validator.approvedEnvironment.load(function(err, success) {
	if(err !== null) {
		log.critical('ValidatorEnvironment failed to load', err);
		throw err;
	} else {
		log.notice('ValidatorEnvironment loaded');

		validate({
			title : "event title",
			links : [{
				rel : "describedby",
				href : "/schema/event"
			}],
			where : [{
				valueString : "Pau"
			}]
		}, "/schema/event")

	}
})