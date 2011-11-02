Types of documents
============================
	
Types of documents are:

	* :ref:`event <doc_event>`
	* :ref:`user <doc_user>`
	* :ref:`group <doc_group>`
	* :ref:`schema <doc_schema>`
	* ...
	* ...




Common attributes
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 
	
.. warning:: Les attributs ci-dessous sont en lecture seule. 
	
.. _common_id:
	
``id (String)``  
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

It is the unique identifier of the document. It is also its URI. So you can do a GET request on a document's id to get it.

	
``createDate (Datetime)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

creation date. 

	
``updateDate (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Last update date.


.. _doc_user:

Type *user*
^^^^^^^^^^^^^^^^^^^^^^^
	
``firstName (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	
``lastName (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
		
``email (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	

	
``isActive (Boolean)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	True if the user is active.  Inactive users cant's access the service.
	
	
``isStaff (Boolean)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	True if the user is a staff member. Only staff members can access the admin interface.
	
	
``isSuperuser (Boolean)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	True if the user is a super user. Super users have no restrictions when accessing the admin interface.
	

``lastLogin (Datetime)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	Date of last authentication against the service.
	
``dateJoined (Datetime)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	Date of the registration.
		
		
``groups (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get groups list of which the user is a member. 

		
.. _doc_event:

Type *event*
^^^^^^^^^^^^^^^^^^^^^^^^^

.. _doc_event_event:

``event (Object)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

event attribute contains a data structure that describes the event itself. this structure is constrained by a :ref:`schema <doc_schema>` document type.


``author (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The user :ref:`id <common_id>` of the :ref:`user <doc_user>` document type.


``writeGroups (List)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get write group permissions.


``readGroups (List)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get read group permissions.


``writeUsers (List)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get write user permissions.


``readUsers (List)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get read user permissions.
 

.. _doc_schema:

Type *schema*
^^^^^^^^^^^^^^^^^^^^^^^^^

These documents are used to describe and validate the :ref:`event <doc_event_event>` attribute for the :ref:`event <doc_event>` document type

``name (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. _doc_schema_schema:

``schema (Object)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains the data structure used to validate. More informations can be found `here <http://tools.ietf.org/html/draft-zyp-json-schema-03>`_

``final (Boolean)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

True if the document can be used to validate an event. If false the document must be part of an inheritance.


``sample (Object)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains a data sample that validate the schema.

``template (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains a template which can be used to render an event as html.

``status (Enum)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Define document's status
	* PUBLISHED  
	* DRAFT 
	* DEPRECATED


.. _doc_entity:

Type *entity*
^^^^^^^^^^^^^^^^^^^^^^^^^

.. _doc_entity_entity:

``entity (Object)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

entity attribute contains a data structure that describes the entity itself. this structure is constrained by a :ref:`schema <doc_schema>` document type.


``author (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The user :ref:`id <common_id>` of the :ref:`user <doc_user>` document type.


``writeGroups (List)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get write group permissions.



``writeUsers (List)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get write user permissions.



.. _doc_group:

Type *group*
^^^^^^^^^^^^^^^^^^^^^^^^^	
	
``title (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``description (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``users (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get group memberships in terms of the group.

``writeGroups (List)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get write group permissions.

``writeUsers (List)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Contains an URI to get write user permissions.


Type *membership*
^^^^^^^^^^^^^^^^^^^^^^^^^

``user (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Contains the user id

``group (String)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Contains the group id