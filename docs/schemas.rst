Schemas
========

Goal of schema is to describe data structure. see `here <http://tools.ietf.org/html/draft-zyp-json-schema-03>`_ for more details.

Documents that use schema to validate must include the links attribute. See base schema 

	>>> curl-oauth --domain cz-api -X GET http://api.devel.czagenda.org/api/schema/base-abstract
	
Events are validated against the schema /schema/event, this schema include relations to /schema/who, /schema/localization, /schema/geo.
	