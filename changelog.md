Changelog
=========

## v0.1.1.2 - December 6, 2011

Features

* add boolean operator between criterions in search

## v0.1.1.1 - December 2, 2011

Features

* add /api/event/:id/_html method to render event as html according to event's schema template
* add /api/schema/:id/_html method to render schema sample as html according to schema template
* allow superuser to update schema even if schema status is APPROVED
* allow current user to view his email and password
* add a method _hasperm on all document type (/api/user/john.doe/_hasperm/write)
* implement permissions on membership
* allow to search on system attributes computed*
* add search on oauth-token documents
* send 401 when oauth verification signature failed
* add id search param, can toke multiple values
* add final search param on schema
* update event-europe-abstract schema to set place not required

Bug fixes

* when schema is updated, environement is not reloaded
* models.Base.hasPerm take care of /user/all and /group/all
* return clean error when fail to compil or render a template on _html method
* update schema localization according to iso adminLevel1 and adminLevel2 instead of adminLevel2 and adminLevel3


## v0.1.1.0 - November 17, 2011

Features

* update schemas
* introduce master and sub events notions
* add changelog.md file

Bug fixes

* constrain event and entity schemas to be subschema of /schema/event-abstract and /schema/entity-abstract

