var models = require('../../models');
var statusCodes = require('../statusCodes');
var de = require("jinjs").defaultEnvironment;

exports._renderHtml = function(req, res, jsonAttr) {

	// load object
	this._clazz.get({
				id : this._urlPrefix + "/" + req.params.id
			}, function(err, obj) {

				if (err !== null) {
					if (err instanceof models.errors.ObjectDoesNotExist) {
						res.statusCode = statusCodes.NOT_FOUND;
						res.end('Not found')
					} else {
						res.statusCode = statusCodes.INTERNAL_ERROR;
						res.end('Internal error')
					}
				} else {

					// check permissions
					obj.hasPerm('read', req.user, function(err, hasPerm) {

						if (err !== null) {
							res.statusCode = statusCodes.INTERNAL_ERROR;
							res.end('Internal error');
							return;
						} else if (hasPerm === false) {
							res.statusCode = statusCodes.FORBIDDEN;
							res.end('Insufficient privileges');
							return;
						}

						

						var links = obj[jsonAttr].links;
						var schemaId = null;
						for (var i = 0, l = links.length; i < l; i++) {
							if (links[i].rel == 'describedby') {
								schemaId = links[i].href;
								break;
							}
						}

						if (schemaId === null) {
							res.statusCode = statusCodes.INTERNAL_ERROR;
							res.end('Document hasn\'t a links attribute that define a schema');
							return;
						}

						models.Schema.get({
									id : schemaId
								}, function(err, schema) {

									if (err !== null) {
										if (err instanceof models.errors.ObjectDoesNotExist) {
											res.statusCode = statusCodes.NOT_FOUND;
											res.end('Schema was not found')
										} else {
											res.statusCode = statusCodes.INTERNAL_ERROR;
											res.end('Internal error')
										}
									} else {
										
										try {
											var tpl = this._getTemplateFromString(schema.template);
										} catch (e) {
											res.statusCode = statusCodes.INTERNAL_ERROR;
											res.end('Internal error');
											return;
										}
										
										var data = this._serializeObject(obj, req);
										
										var context = {};
										context[jsonAttr] = data[jsonAttr];
										context['meta'] = data;
										delete context['meta'][jsonAttr];
										
										res.charset = 'UTF-8';
										res.header('Content-Type', 'text/html');
										res.end(tpl.render(context));
										
									}
								}.bind(this))

					}.bind(this));
				}

			}.bind(this));
}

exports._getTemplateFromString = function (str) {
	var exports = {};
    var compiled = de.getTemplateSourceFromString(str);
    eval(compiled);
    return exports;
}
