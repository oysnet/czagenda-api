exports.AgendaWriteUser = require('./agendaWriteUser.js')
exports.AgendaWriteGroup = require('./agendaWriteGroup.js')

exports.GroupWriteUser = require('./groupWriteUser.js')
exports.GroupWriteGroup = require('./groupWriteGroup.js')

exports.EventWriteUser = require('./eventWriteUser.js')
exports.EventWriteGroup = require('./eventWriteGroup.js')
exports.EventReadUser = require('./eventReadUser.js')
exports.EventReadGroup = require('./eventReadGroup.js')

var perms = {

	group : {
		user : {
			write : exports.GroupWriteUser,
			read : null,
		},
		group : {
			write : exports.GroupWriteGroup,
			read : null,
		}
	},
	agenda : {
		user : {
			write : exports.AgendaWriteUser,
			read : null,
		},
		group : {
			write : exports.AgendaWriteGroup,
			read : null,
		}
	},
	event : {
		user : {
			write : exports.EventWriteUser,
			read : exports.EventReadUser,
		},
		group : {
			write : exports.EventWriteGroup,
			read : exports.EventReadGroup,
		}
	}

}

exports.getPermClass = function(applyTo, grantTo, perm) {

	try {
		return perms[applyTo][grantTo][perm];
	} catch (e) {
		return null;
	}

}