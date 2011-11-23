Changelog
=========

## v0.1.1.1 - XXXXXXXXXXXXXX

Features

* add /api/event/:id/_html method to render event as html according to event's schema template
* add /api/schema/:id/_html method to render schema sample as html according to schema template
* allow superuser to update schema even if schema status is APPROVED

Bug fixes

* when schema is updated, environement is not reloaded

## v0.1.1.0 - November 17, 2011

Features

* update schemas
* introduce master and sub events notions
* add changelog.md file

Bug fixes

* constrain event and entity schemas to be subschema of /schema/event-abstract and /schema/entity-abstract

