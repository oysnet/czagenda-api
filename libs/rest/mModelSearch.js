var statusCodes = require('../statusCodes');
var restError = require('./errors');
var log = require('czagenda-log').from(__filename);
var shuntingYard = require('../shuntingYard');

exports.searchFields = {};
exports.fulltextFields = null;



exports.facets = function(req, res) {


	this._getQueryFromRequest(req, function(err, query) {

				if (err !== null) {

					if (err instanceof restError.BadRequest) {
						res.statusCode = statusCodes.BAD_REQUEST;
						res.end(err.message)
					} else {
						res.statusCode = statusCodes.INTERNAL_ERROR;
						res.end('Internal error')
					}

				} else {

					var query = this._setPermsOnQuery(req, query);

					this.setFacetingOnQuery(req,res,query);


					this._clazz.facets(query, function(err, result) {
								if (err !== null) {
									if (err instanceof errors.IndexDoesNotExist) {
										res.statusCode = statusCodes.NOT_FOUND;
										res.end('Not found');
									} else {
										res.statusCode = statusCodes.INTERNAL_ERROR;
										res.end('Internal error')
									}
								} else {
									res.end(this._renderJson(req, res, result));
								}

							}.bind(this));

				}
			}.bind(this));
}

exports.search = function(req, res) {

	this._getQueryFromRequest(req, function(err, query) {

				if (err !== null) {

					if (err instanceof restError.BadRequest) {
						res.statusCode = statusCodes.BAD_REQUEST;
						res.end(err.message)
					} else {
						res.statusCode = statusCodes.INTERNAL_ERROR;
						res.end('Internal error')
					}

				} else {
					this._search(req, res, this._setPermsOnQuery(req, query));
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

	if (req.method === 'POST') {
		rawData = req.body;
	} else {
		rawData = req.query;
	}

	if (typeof(rawData.q) !== 'undefined') {
		qString = rawData.q.trim();
		return shuntingYard.parseSearchString(qString);
	}

	return {};


}

exports.getDatetimeSearchPart = function(field, args) {

	var q = null;
	if (args.length > 1) {
		q = {
			"or" : []
		}
		args.forEach(function(arg) {
					q.or.push(this.getDatetimeSearchPart(field, [arg]));
				}.bind(this))

	} else {
		var dateRe = '[0-9]{4}-[0-9]{2}-[0-9]{2}';
		var dateReExact = new RegExp('^' + dateRe + '$');
		var dateReRange = /^\[[ ]*([^ ]+)[ ]+TO[ ]+([^ ]+)[ ]*\]$/g
		var range = null;

		if ((range = dateReRange.exec(args[0])) !== null) {

			var from = range[1];
			var to = range[2];

			if (to == 'NOW') {
				to = (new Date()).toISOString();
			}

			if (from == 'NOW') {
				from = (new Date()).toISOString();
			}
			q = {
				range : {}
			};

			if (to == '*') {
				q.range[field] = {
					"gte" : from.replace(
							/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g,
							'$1T00:00:00.000Z')
				}
			} else if (from == '*') {
				q.range[field] = {
					"lte" : to.replace(
							/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g,
							'$1T23:59:59.999Z')
				}
			} else {
				q.range[field] = {
					"include_lower" : true,
					"include_upper" : true,
					"from" : from.replace(
							/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g,
							'$1T00:00:00.000Z'),
					"to" : to.replace(
							/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g,
							'$1T23:59:59.999Z')
				}
			}
		
		} else if (dateReExact.test(args[0])) {
			q = {
          range : {}
      };
			q.range[field] = {
					"include_lower" : true,
					"include_upper" : true,
					"from" : args[0].replace(
							/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g,
							'$1T00:00:00.000Z'),
					"to" : args[0].replace(
							/([0-9]{4}-[0-9]{2}-[0-9]{2}(?!T[^ ]+))/g,
							'$1T23:59:59.999Z')
				}
			
		} else  {
			throw new restError.BadRequest(field + ':' + args[0])
		} 

	}

	return q;

}

exports.getTermSearchPart = function(field, args) {

	var q = null;
	if (args.length > 1) {
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

exports.getIdsSearchPart = function(field, args) {

	var q = null;

	q = {
		ids : {}
	};
	q.ids.values = args;

	return q;

}

exports.getTextSearchPart = function(field, args) {
	var q = null;

	if (args.length > 1) {
		q = {
			"or" : []
		}
		args.forEach(function(arg) {
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

exports.getGeoSearchPart = function(field, args, req) {
	var q = null;

	if (args.length > 1) {
		q = {
			"or" : []
		}
		args.forEach(function(arg) {
					q.or.push(this.getGeoSearchPart(field, [arg]));
				}.bind(this))
	} else {

		if ((bbox = args[0]
				.match(/\[([\-\+]?[0-9]{1,2}[\.0-9]*) ([\-\+]?[0-9]{1,2}[\.0-9]*) ([\-\+]?[0-9]{1,2}[\.0-9]*) ([\-\+]?[0-9]{1,2}[\.0-9]*)\]/)) !== null) {
			q = {
				"geo_bounding_box" : {}
			}
			q.geo_bounding_box[field] = {
				"top_left" : [parseFloat(bbox[2]), parseFloat(bbox[2])],
				"bottom_right" : [parseFloat(bbox[3]), parseFloat(bbox[4])]
			}
		} else if ((distance = args[0]
				.match(/\[([\-\+]?[0-9]{1,2}[\.0-9]*) ([\-\+]?[0-9]{1,2}[\.0-9]*) DISTANCE ([0-9]+(km|mi|miles))\]/)) !== null) {

			req.geoDistanceQuery = {
				field : field,
				point : [parseFloat(distance[1]), parseFloat(distance[2])]
			};
			q = {
				"geo_distance" : {
					"distance" : distance[3]
				}
			}
			q.geo_distance[field] = req.geoDistanceQuery.point
		} else {
			throw new restError.BadRequest(field + ':' + args[0])
		}

	}

	return q;
}

exports.getBooleanSearchPart = function(field, args) {
	var q = null;
	if (args.length > 1) {
		q = {
			terms : {}
		};
		q.terms[field] = args;
	} else {
		q = {
			term : {}
		};
		q.term[field] = args[0].toLowerCase() === 'true' ? true : false;
	}

	return q;
}

exports.getFulltextSearchPart = function(field, args) {

	query = {
		"query_string" : {
			"query" : args,
			"analyze_wildcard" : true,
			"auto_generate_phrase_queries" : true

		}
	}
	if (this.fulltextFields !== null) {
		query.query_string.fields = this.fulltextFields;
	}

	return {
		query : query
	};

}

exports.constructQueryFields = function(query, req) {


	var keys = Object.keys(query);
	if (keys.length > 1) {
		throw new Error('query has more than one key')
	}

	if (keys.length === 0) {
		return query;
	}

	var k = keys[0];

	if (["and", "or"].indexOf(k) !== -1) {

		for (var i = 0, l = query[k].length; i < l; i++) {
			query[k][i] = this.constructQueryFields(query[k][i], req)
		}

		return query;

	} else {
		
		var field = k;
		switch (this.searchFields[field]) {

			case 'term' :
				return this.getTermSearchPart(field, query[field].split(/\s*,\s*/));
				break;

			case 'text' :
				return this.getTextSearchPart(field, [query[field]]);
				break;

			case 'datetime' :
				return this.getDatetimeSearchPart(field, [query[field]]);
				break;

			case 'geo' :
				return this.getGeoSearchPart(field, [query[field]], req);
				break;

			case 'boolean' :
				return this.getBooleanSearchPart(field, [query[field]]);
				break;

			default :

				if (field === "fulltext") {
					return this.getFulltextSearchPart(field, [query[field]]);
				} else if (field == 'id') {
					return this.getIdsSearchPart(field, [query[field]]);

				} else if (["computedWriteGroups", "computedWriteUsers",
						"computedReadGroups", "computedReadUsers"]
						.indexOf(field) !== -1) {
					return this.getTermSearchPart(field, [query[field]]);

				} else {
					return this.getTextSearchPart(field, [query[field]]);
				}

		}

	}

}

exports._getQueryFromRequest = function(req, callback) {

	var searchQuery = this.getSearchQuery(req);
	var query = null;
	var filter = null;
	
	try {

		query = this.constructQueryFields(searchQuery, req);
	

	} catch (e) {

		callback(e);

		log.warning('constructQueryFields error ', JSON.stringify(e))

		return;
	}

	if (Object.keys(query).length === 0) {
		query = {
			"query" : {
				"match_all" : {}
			}
		};
	} else {
		query = {
			"query" : {
				"filtered" : {
					"query" : {
						"match_all" : {}
					},
					"filter" : query
				}
			}
		}
	}
	
	callback(null, query);
}