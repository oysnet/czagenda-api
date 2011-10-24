var statusCodes = require('../statusCodes');
var restError = require('./errors');
var log = require('czagenda-log').from(__filename);

exports.searchFields = {};

exports.search = function(req, res) {

	this._getQueryFromRequest(req, function(err, query) {

		if(err !== null) {

			if( err instanceof restError.BadRequest) {
				res.statusCode = statusCodes.BAD_REQUEST;
				res.end(err.message)
			} else {
				res.statusCode = statusCodes.INTERNAL_ERROR;
				res.end('Internal error')
			}

		} else {
			this._search(req, res, this._setPermsOnQuery(req, query));
			//this._search(req, res, query);
		}
	}.bind(this));
}

exports.unescape = function(str) {

	var re = /\\([\+\-\&\|\!\(\)\{\}\[\]\^\"\~\*\?\:\\])/

	return str.replace(re, '\1')

}

exports.getSearchQuery = function(req) {

	var qString = null;
	var rawData = null;

	if(req.method === 'POST') {
		rawData = req.body;
	} else {
		rawData = req.query;
	}
	
	var q = {};
	
	if( typeof (rawData.q) !== 'undefined') {
		qString = rawData.q.trim();

		// parse query : text field:.. field:...
		

		var re = new RegExp(/[a-z0-9\.]+:/gi);
		var fields = [];

		if(re.test(qString) === true) {
			qString.match(re).forEach(function(v) {
				fields.push(v.substr(0, v.length - 1))
			});
			var qArray = qString.split(re);

			// first element is fulltext query
			if(qString.search(re) !== 0) {
				q.fulltext = qArray[0].trim();
				qArray = qArray.splice(1);
			} else {
				qArray = qArray.splice(1);
			}

			for(var i = 0, l = qArray.length; i < l; i++) {
				if(fields.length !== qArray.length) {
					log.warning('getSearchQuery error ' + qString, JSON.stringify(fields), JSON.stringify(qArray))
					req.res.statusCode = statusCodes.BAD_REQUEST;
					req.res.end(qString);
					return;
				}

				if( typeof (q[fields[i]]) === 'undefined') {
					q[fields[i]] = [];
				}

				q[fields[i]].push(qArray[i].trim());
			}

		} else {
			q.fulltext = qString;
		}

	}
	

	return q;

}

exports.getDatetimeSearchPart = function(field, args) {

	var q = null;
	if(args.length > 1) {
		q = {
			"or" : []
		}
		args.forEach( function(arg) {
			q.or.push(this.getDatetimeSearchPart(field, [arg]));
		}.bind(this))

	} else {
		var dateRe = '[0-9]{4}-[0-9]{2}-[0-9]{2}';
		var dateReExact = new RegExp('^' + dateRe + '$');
		var dateReRange = /^\[[ ]*([^ ]+)[ ]+TO[ ]+([^ ]+)[ ]*\]$/g
		var range = null;

		if(( range = dateReRange.exec(args[0])) !== null) {

			var from = range[1];
			var to = range[2];

			if(to == 'NOW') {
				to = (new Date()).toISOString();
			}

			if(from == 'NOW') {
				from = (new Date()).toISOString();
			}
			q = {
				range : {}
			};

			if(to == '*') {
				q.range[field] = {
					"gte" : from.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g, '$1T00:00:00.000Z')
				}
			} else if(from == '*') {
				q.range[field] = {
					"lte" : to.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g, '$1T23:59:59.999Z')
				}
			} else {
				q.range[field] = {
					"include_lower" : true,
					"include_upper" : true,
					"from" : from.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g, '$1T00:00:00.000Z'),
					"to" : to.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g, '$1T23:59:59.999Z')
				}
			}

		} else if(dateReExact.test(args[0])) {
			q = {
				term : {}
			};
			q.term[field] = args[0];
		} else {
			throw new restError.BadRequest(field + ':' + args[0])
		}

	}

	return q;

}

exports.getTermSearchPart = function(field, args) {

	var q = null;
	if(args.length > 1) {
		q = {
			terms : {}
		};
		q.terms[field] = args;
	} else {
		q = {
			term : {}
		};
		q.term[field] = args[0];
	}

	return q;

}

exports.getTextSearchPart = function(field, args) {
	var q = null;

	if(args.length > 1) {
		q = {
			"or" : []
		}
		args.forEach( function(arg) {
			q.or.push(this.getTextSearchPart(field, [arg]));
		}.bind(this))
	} else {
		q = {
			"query" : {
				"field" : {}
			}
		}
		q.query.field[field] = {
			"query" : args[0],
			"analyze_wildcard" : true,
			"auto_generate_phrase_queries" : true
		}
	}

	return q;
}

exports.getGeoSearchPart = function(field, args) {
	var q = null;

	if(args.length > 1) {
		q = {
			"or" : []
		}
		args.forEach( function(arg) {
			q.or.push(this.getGeoSearchPart(field, [arg]));
		}.bind(this))
	} else {

		if(( bbox = args[0].match(/\[([0-9]{1,2}[\.0-9]*) ([0-9]{1,2}[\.0-9]*) ([0-9]{1,2}[\.0-9]*) ([0-9]{1,2}[\.0-9]*)\]/)) !== null) {
			q = {
				"geo_bounding_box" : {}
			}
			q.geo_bounding_box[field] = {
				"top_left" : [parseFloat(bbox[2]), parseFloat(bbox[2])],
				"bottom_right" : [parseFloat(bbox[3]), parseFloat(bbox[4])]
			}
		} else if(( distance = args[0].match(/\[([0-9]{1,2}[\.0-9]*) ([0-9]{1,2}[\.0-9]*) DISTANCE ([0-9]+(km|mi|miles))\]/)) !== null) {
			console.log(distance[3])
			q = {
				"geo_distance" : {
					"distance" : distance[3]
				}
			}
			q.geo_distance[field] = [parseFloat(distance[1]), parseFloat(distance[2])]
		}

	}

	return q;
}

exports._getQueryFromRequest = function(req, callback) {

	var searchQuery = this.getSearchQuery(req);

	var query = null;
	var filter = null;

	// create full text search
	if( typeof (searchQuery.fulltext) !== 'undefined') {
		query = {
			"query_string" : {
				"query" : searchQuery.fulltext,
				"analyze_wildcard" : true,
				"auto_generate_phrase_queries" : true
			}
		}
		delete searchQuery.fulltext;
	}

	try {

		// create filter search
		for(field in searchQuery) {

			if( typeof (this.searchFields[field]) === 'undefined') {
				req.res.statusCode = statusCodes.BAD_REQUEST;
				req.res.end(field);
				return;
			}

			if(filter === null) {
				filter = {
					"and" : []
				}
			}

			switch (this.searchFields[field]) {

				case 'term':
					filter.and.push(this.getTermSearchPart(field, searchQuery[field]))
					break;

				case 'text':
					filter.and.push(this.getTextSearchPart(field, searchQuery[field]))
					break;

				case 'datetime':
					filter.and.push(this.getDatetimeSearchPart(field, searchQuery[field]))
					break;

				case 'geo':
					filter.and.push(this.getGeoSearchPart(field, searchQuery[field]))
					break;

			}
		}

	} catch (e) {
		callback(e);
		return;
	}

	if(query === null) {
		query = {
			"match_all" : {}
		}
	}

	if(filter === null) {
		query = {
			"query" : query
		};
	} else {

		if(filter.and.length === 1) {
			filter = filter.and[0];
		}
		query = {
			"query" : {
				"filtered" : {
					"query" : query,
					"filter" : filter
				}
			}
		}
	}

	callback(null, query);
}