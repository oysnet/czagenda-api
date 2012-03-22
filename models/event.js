var Base = require('./base.js').Base;
var util = require("util"), crypto = require('crypto');
var settings = require('../settings.js');
var validator = require('../libs/schemas/validator');
var models = require('../models');
var async = require('async');

function Event() {
	this._attributs = {
		//approved : [],
		//disapproved : [],
		agenda : null,
		event : null,
		author : null,
		writeGroups : null,
		readGroups : null,
		writeUsers : null,
		readUsers : null,
		computedWriteUsers : [],
		computedWriteGroups : [],
		computedReadUsers : [],
		computedReadGroups : [],
		computedWriteUsersPerms : [],
		computedWriteGroupsPerms : [],
		computedReadUsersPerms : [],
		computedReadGroupsPerms : [],
		approvedBy : [],
		disapprovedBy : []
	};
	Base.call(this, 'event');

	this.initialData = {
		agenda : null,
		parentEvent : null
	}

}

util.inherits(Event, Base);

Event.publicAttributes = Base.publicAttributes.concat(['event', 'author', 'writeGroups', 'readGroups', 'writeUsers', 'readUsers', 'agenda', 'approvedBy', 'disapprovedBy' ]);
Event.staffAttributes = Event.publicAttributes.concat(Base.staffAttributes);
Event.metaAttributes = ['event'];

Event.publicWriteAttributes = ['event', 'agenda'];
Event.staffWriteAttributes = Event.publicWriteAttributes;

Event.prototype.hasPerm = function(perm, user, callback) {

	switch (perm) {
		case 'read':
			callback(null, this.hasReadPerm(user));
			break;

		case 'create':
			if(this.agenda === null) {
				callback(null, true);
			} else {
				models.Agenda.get({
					id : this.agenda
				}, function(err, obj) {
					if(err !== null) {
						callback(err);
					} else {
						callback(null, obj.hasWritePerm(user));
					}
				}.bind(this));
			}

			break;

		case 'write':

			// on agenda we need to check perms on initial agenda and current agenda

			if(this.hasWritePerm(user) === true) {

				if(this.agenda === null && this.initialData.agenda === null) {
					callback(null, true);
				} else {

					// if there wan no initial agenda or if current == initial

					if(this.initialData.agenda === null || this.initialData.agenda == this.agenda) {
						models.Agenda.get({
							id : this.agenda
						}, function(err, obj) {

							if(err !== null) {
								callback(err);
							} else {
								callback(null, obj.hasWritePerm(user));
							}

						}.bind(this));
					} else {

						// we need to check perms on two agendas
						models.Agenda.get({
							id : this.initialData.agenda
						}, function(err, obj) {

							if(err !== null) {
								callback(err);
							} else if(obj.hasWritePerm(user) === false) {
								callback(null, false);
							} else if(this.agenda === null) {
								callback(null, true);
							} else {
								models.Agenda.get({
									id : this.agenda
								}, function(err, obj) {

									if(err !== null) {
										callback(err);
									} else {
										callback(null, obj.hasWritePerm(user));
									}

								}.bind(this));
							}

						}.bind(this));
					}

				}

			} else {
				callback(null, false);
			}
			break;

		case 'del':
			if(this.hasWritePerm(user) === true) {

				if(this.agenda === null) {
					callback(null, true);
				} else {
					models.Agenda.get({
						id : this.agenda
					}, function(err, obj) {

						if(err !== null) {
							callback(err);
						} else {
							callback(null, obj.hasWritePerm(user));
						}

					}.bind(this));
				}

			} else {
				callback(null, false);
			}
			break;

		default:
			return false;

	}
}

Event.prototype._validate = function(callback) {

	var keys = [];

	if(this.validateRegexp('agenda', '^/agenda/[\-_\.0-9a-z]+$', true) === true && this.agenda !== null) {
		keys.push('agenda');
	}

	var schema = null;

	if(this.event === null) {
		this.addValidationError('event', 'required');
	} else if( typeof (this.event.links) === 'undefined') {
		this.addValidationError('event.links', 'required')
	} else {

		var found = false;
		for(var i = 0, l = this.event.links.length; i < l; i++) {
			if(this.event.links[i].rel === 'describedby') {
				schema = validator.approvedEnvironment.getEnv().findSchema(this.event.links[i].href);
				if( typeof (schema) === 'undefined') {
					this.addValidationError('event.links', 'Link with rel=describedby doesn\'t match any schema: ' + this.event.links[i].href);
				} else {

					if(validator.approvedEnvironment.isSubschema(this.event.links[i].href, '/schema/event-abstract') === false) {
						this.addValidationError('event.links', 'Link with rel=describedby must be a subschema of /schema/event-abstract');
					} else {
						var report = validator.approvedEnvironment.getEnv().validate(this.event, schema);
						if(report.errors.length > 0) {
							this.parseJSVErrors(report.errors);
						}
					}

				}
				found = true;
				break;
			}
		}

		if(!found) {
			this.addValidationError('event.links', 'Must contain an entry with rel=describedby ')
		}

	}

	var methods = [];

	if( typeof (this.event.category) !== 'undefined') {
		keys.push('event.category');
	}

	if( typeof (this.event.parentEvent) !== 'undefined') {
		keys.push('event.parentEvent');
	}

	methods.push( function(cb) {
		this.validateExists(keys, cb);
	}.bind(this));

	if( typeof (this.event.parentEvent) != 'undefined') {
		methods.push( function(cb) {

			Event.get({
				id : this.event.parentEvent
			}, function(err, obj) {

				if(err !== null) {
					this.addValidationError('event.parentEvent', 'Object doesn\'t exist');
					
				} else if( typeof (obj.event.childSchema) == 'undefined') {
					this.addValidationError('event.parentSchema', 'must define an event.childSchema attribute');

				} else if(validator.approvedEnvironment.isSubschema(this.event.links[i].href, obj.event.childSchema) === false) {
					this.addValidationError('event.links', 'Link with rel=describedby must be a subschema of ' + obj.event.childSchema);
				}

				cb();

			}.bind(this))

		}.bind(this));
	}

	async.parallel(methods, function(err) {

		if( typeof (err) == 'undefined') {
			err = null;
		}

		callback(err);

	})
}

Event.prototype._generateHash = function() {
	h = crypto.createHash('md5')
	h.update(this._type);
	h.update(JSON.stringify(this.event))
	this._data['hash'] = h.digest('hex')
}

Event.prototype._preSave = function(callback) {
	if(this.id === null) {
		this._data.writeGroups = this._data.id + '/perms/wg';
		this._data.writeUsers = this._data.id + '/perms/wu';
		this._data.readGroups = this._data.id + '/perms/rg';
		this._data.readUsers = this._data.id + '/perms/ru';

		//this._data.event.id = this._data.id;
	}

	if( typeof (this._data.event.tags) !== 'undefined') {

		var tags = [];
		var lowerTags = [];
		this._data.event.tags.forEach(function(tag) {
			var lowerTag = tag.toLowerCase();
			if(lowerTags.indexOf(lowerTag) === -1) {
				lowerTags.push(lowerTag);
				tags.push(tag);
			}
		});
		this._data.event.tags = tags;
	}

	callback(null);
}

Event.get = function(options, callback) {
	Base.get(options, Event, function(err, obj) {

		// save initial agenda value to check perms
		if(err === null) {
			obj.initialData = {
				agenda : obj.agenda,
				parentEvent : typeof (obj.event.parentEvent) != 'undefined' ? obj.event.parentEvent : null
			}
		}

		callback(err, obj);

	})
}

Event.facets = function(query, callback) {
	Base.facets(query, settings.elasticsearch.index, 'event',  Event, callback)
}

Event.search = function(query, attrs, callback) {
	Base.search(query, settings.elasticsearch.index, 'event', attrs, Event, callback)
}

Event.count = function(query, callback) {
	Base.count(query, settings.elasticsearch.index, 'event', callback)
}

exports.Event = Event;
