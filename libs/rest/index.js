exports.setup = function (server) {
	
	var RestSchema = require('./schema.js').RestSchema;
	var restSchema = new RestSchema(server);

	var RestEvent = require('./event.js').RestEvent;
	var restEvent = new RestEvent(server);
	
	var RestUser = require('./user.js').RestUser;
	var restUser = new RestUser(server);
	
	var RestGroup = require('./group.js').RestGroup;
	var restGroup = new RestGroup(server);
	
	var RestAgenda = require('./agenda.js').RestAgenda;
	var restAgenda = new RestAgenda(server);
	
	var RestMembership = require('./membership.js').RestMembership;
	var restMembership= new RestMembership(server);
	
	var RestAgendaWriteUser = require('./agendaWriteUser.js').RestAgendaWriteUser;
	var RestAgendaWriteUser= new RestAgendaWriteUser(server);
	
	var RestAgendaWriteGroup = require('./agendaWriteGroup.js').RestAgendaWriteGroup;
	var RestAgendaWriteGroup= new RestAgendaWriteGroup(server);
	
	var RestGroupWriteUser = require('./groupWriteUser.js').RestGroupWriteUser;
	var RestGroupWriteUser= new RestGroupWriteUser(server);
	
	var RestGroupWriteGroup = require('./groupWriteGroup.js').RestGroupWriteGroup;
	var RestGroupWriteGroup= new RestGroupWriteGroup(server);
	
	var RestEventWriteUser = require('./eventWriteUser.js').RestEventWriteUser;
	var RestEventWriteUser= new RestEventWriteUser(server);
	
	var RestEventWriteGroup = require('./eventWriteGroup.js').RestEventWriteGroup;
	var RestEventWriteGroup= new RestEventWriteGroup(server);
	
	var RestEventReadUser = require('./eventReadUser.js').RestEventReadUser;
	var RestEventReadUser= new RestEventReadUser(server);
	
	var RestEventReadGroup = require('./eventReadGroup.js').RestEventReadGroup;
	var RestEventReadGroup= new RestEventReadGroup(server);
}
