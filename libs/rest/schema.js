var RestOAuthModel = require('./oAuthModel.js').RestOAuthModel;
var util = require("util");
var Schema = require('../../models/schema.js').Schema;
var mModelSearch = require('./mModelSearch');
var models = require('../../models');
var statusCodes = require('../statusCodes');
var de = require("jinjs").defaultEnvironment;
var mRenderHtml = require('./mRenderHtml');

var RestSchema = exports.RestSchema = function(server) {
	RestOAuthModel.call(this, 'schema', Schema, server);

	this._urls.get[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.post[this._urlPrefix + '/_search'] = {
		fn : this.search
	};

	this._urls.get[this._urlPrefix + '/:id/_html'] = {
		fn : this.renderHtml
	};

	this._initServer();
}

util.inherits(RestSchema, RestOAuthModel);

for (k in mModelSearch) {
	RestSchema.prototype[k] = mModelSearch[k];
}

for(k in mRenderHtml) {
	RestSchema.prototype[k] = mRenderHtml[k];
}

RestSchema.prototype.searchFields = {
	'name' : 'term',
	'createDate' : 'datetime',
	'updateDate' : 'datetime'
}

RestSchema.prototype.sortFields = {
	'createDate' : 'createDate',
	'updateDate' : 'updateDate'
}

RestSchema.prototype._populateObject = function(obj, data, req, res) {
	if (obj.author === null) {
		obj.author = req.user.id;
	}
	return RestOAuthModel.prototype._populateObject.call(this, obj, data, req,
			res);
}

RestSchema.prototype.renderHtml = function(req, res) {

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
					
					if (obj.template === null) {
						res.charset = 'UTF-8';
						res.header('Content-Type', 'text/html');
						res.end("no template available");
						return;
					} else if (obj.sample === null) {
						res.charset = 'UTF-8';
						res.header('Content-Type', 'text/html');
						res.end("no sample available");
						return;
					}
					
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

								try {
									var tpl = this._getTemplateFromString(obj.template);
								} catch (e) {
									res.statusCode = statusCodes.INTERNAL_ERROR;
									res.end('Internal error');
									return;
								}

								var data = JSON.parse(obj.sample);
								
								if (data.id.indexOf('/event/') !== -1) {
									jsonAttr = 'event'
								} else {
									jsonAttr = 'entity'
								}
								
								var context = {};
								context[jsonAttr] = data[jsonAttr];
								context['meta'] = data;
								delete context['meta'][jsonAttr];

								res.charset = 'UTF-8';
								res.header('Content-Type', 'text/html');
								res.end(tpl.render(context));

							}.bind(this));
				}

			}.bind(this));
}
