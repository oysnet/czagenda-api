exports.setup = function (server) {
	
	var RestSchema = require('./schema.js').RestSchema;
	new RestSchema(server);

	var RestEvent = require('./event.js').RestEvent;
	new RestEvent(server);
	
	var RestCategory = require('./category.js').RestCategory;
	new RestCategory(server);
	
	var RestEntity = require('./entity.js').RestEntity;
	new RestEntity(server);
	
	var RestUser = require('./user.js').RestUser;
	new RestUser(server);
	
	var RestGroup = require('./group.js').RestGroup;
	new RestGroup(server);
	
	var RestAgenda = require('./agenda.js').RestAgenda;
	new RestAgenda(server);
	
	var RestMembership = require('./membership.js').RestMembership;
	new RestMembership(server);
	
	var RestAgendaWriteUser = require('./agendaWriteUser.js').RestAgendaWriteUser;
	new RestAgendaWriteUser(server);
	
	var RestAgendaWriteGroup = require('./agendaWriteGroup.js').RestAgendaWriteGroup;
	new RestAgendaWriteGroup(server);
	
	var RestEntityWriteUser = require('./entityWriteUser.js').RestEntityWriteUser;
	new RestEntityWriteUser(server);
	
	var RestEntityWriteGroup = require('./entityWriteGroup.js').RestEntityWriteGroup;
	new RestEntityWriteGroup(server);
	
	var RestGroupWriteUser = require('./groupWriteUser.js').RestGroupWriteUser;
	new RestGroupWriteUser(server);
	
	var RestGroupWriteGroup = require('./groupWriteGroup.js').RestGroupWriteGroup;
	new RestGroupWriteGroup(server);
	
	var RestEventWriteUser = require('./eventWriteUser.js').RestEventWriteUser;
	new RestEventWriteUser(server);
	
	var RestEventWriteGroup = require('./eventWriteGroup.js').RestEventWriteGroup;
	new RestEventWriteGroup(server);
	
	var RestEventReadUser = require('./eventReadUser.js').RestEventReadUser;
	new RestEventReadUser(server);
	
	var RestEventReadGroup = require('./eventReadGroup.js').RestEventReadGroup;
	new RestEventReadGroup(server);
	
	var RestOAuthToken = require('./oAuthToken.js').RestOAuthToken;
	new RestOAuthToken(server);
	
	var RestOAuthConsumer = require('./oAuthConsumer.js').RestOAuthConsumer;
	new RestOAuthConsumer(server);
	
}
