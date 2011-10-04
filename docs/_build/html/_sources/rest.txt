###########
RESTful API
###########
***************************
Overview of the RESTful API
***************************

How it works
^^^^^^^^^^^^

Each of the api's URI match a document or a subset of documents. HTTP methods define actions to do on the document(s).

Theses methods are:

	* GET : 	retrieve a document or a subset of documents
	* POST : 	create a new document
	* PUT : 	update a document
	* DELETE : 	delete a document


Data format
^^^^^^^^^^^

Only JSON format is supported. You must set the Content-Type header at application/json in all requests to the server.


API responses
^^^^^^^^^^^^^

The API's responses contain the standards HTTP codes which are significant of what happened.  

	* 200 OK : 			all went successfully gone
	* 201 Created : 	a new document was created
	* 204 Deleted : 	a document was deleted
	* 400 Bad Request : the request is malformed
	* 401 Forbidden : 	document ressource is forbidden
	* 404 Not Found : 	document is not found
	* 500 Internal :	Server Error : a server internal error occurred

	
API structure
-------------

URIs
^^^^

URI are prefixed with /api/, followed by the document’s type and optionnaly by the document identifier. 

    *URIs examples*
	
    >>> /api/<DOCUMENT_TYPE>/
	 
    >>> /api/<DOCUMENT_TYPE>/<DOCUMENT_ID>
	
	
Playing with the API
^^^^^^^^^^^^^^^^^^^^^

Curl is used in examples bellow to make request to the server. If you're not familiar with please take a look at http://curl.haxx.se/
	
1. Get a document's list

	It's done by invoking the GET HTTP method on an URI like /api/<DOCUMENT_TYPE>/
	
	*Request*
	
	>>> curl -XGET http://<HOST>/api/<DOCUMENT_TYPE>/
	
	*Response*
	
	The server returns data as below
	
	>>> {
	    "total_rows":<Database Document's count>,
	    "offset": 0,
	    "rows":[{
	 	   Document data...
	 	   }]
	    }
	
	* total_row is the document count of the specified type in the database, not in the response.
	* rows contains the documents, see data structure for more explanations.
	* offset is the amount of documents that are skipped when request is paginated.
	
	1.1. Pagination
	
		Pagination is implemented by passing extra parameters in query string. These parameters are skip and limit. 
		
		For example
		
		>>> curl -XGET http://<HOST>/api/<DOCUMENT_TYPE>/?skip=10&limit=5
		
		This query will return documents from 10th to 15th 
		
	1.2. Fulltext search
	
		Fulltext search is done by passing a fulltext parameter.
		
		For example
		
		>>> curl -XGET http://<HOST>/api/<DOCUMENT_TYPE>/?fulltext=<SEARCH_STRING>
		
		The search string can contain boolean operators such as AND and OR
		
		For example
		
		>>> curl -XGET http://<HOST>/api/<DOCUMENT_TYPE>/?fulltext="search_string OR another_search_string"
		
2. Get a document
	
	It's done by invoking the  GET HTTP method on an URI like /api/<DOCUMENT_TYPE>/<DOCUMENT_ID>
	
	*Request*
	
	>>> curl -XGET http://<HOST>/api/<DOCUMENT_TYPE>/<DOCUMENT_ID>/
	
	*Response*
	
	The server returns one document
	
	>>> { Document data... }

3. Create a document

	It's done by invoking the POST HTTP method on an URI like /api/<DOCUMENT_TYPE>/
	
	*Request*
	
	>>> curl -XPOST http://<HOST>/api/<DOCUMENT_TYPE>/ -H 'Content-Type: application/json' -d '{
			"an_attribute" : "a value", "another_attribute" : "another value" 
		}'
	
	.. warning:: Do not forget the Content-Type parameter

	*Response*
	
	The server returns the newly created document with some system attributes such as _id or _rev. Systems attributes are described HERE
	

4. Update a document

	It's done by invoking the PUT HTTP method on an URI like /api/<DOCUMENT_TYPE>/<DOCUMENT_ID>
	
	*Request*
	
	>>> curl -XPUT http://<HOST>/api/<DOCUMENT_TYPE>/ -H 'Content-Type: application/json' -d '{
			"an_attribute" : "an updated value", "another_attribute" : "another value" 
		}'
	
	.. warning:: Do not forget the Content-Type parameter

	*Response*
	
	The server returns the updated document.
	
	
5. Delete a document

	It's done by invoking the DEL HTTP method on an URI like /api/<DOCUMENT_TYPE>/<DOCUMENT_ID>
	
	*Request*
	
	>>> curl -XDEL http://<HOST>/api/<DOCUMENT_TYPE>/<DOCUMENT_ID>
		
	*Response*
	
	The server returns nothing
		
	
*************************************
Specifics of the API by document type
*************************************
	
User
^^^^^^

User base uri is /user

1. Create 

	>>> curl -XPOST http://<HOST>/user/ -H 'Content-Type: application/json' -d '{
				"firstName" : "John", 
				"lastName" : "Doe",
				"email" : "john.doe@domain.com",
				"login" : "john.doe"
			}'
				
	Server response	with the 201 code
	
	>>>	{
		  "id": "/user/johndoe",						
		  "createDate": "2011-10-04T08:19:16.753Z",
		  "updateDate": "2011-10-04T08:19:16.753Z",
		  "login": "john.doe",
		  "firstName": "John",
		  "lastName": "Doe",
		  "isActive": false,
		  "isStaff": false,
		  "isSuperuser": false,
		  "lastLogin": null,
		  "dateJoined": null,
		  "groups": "/user/johndoe/groups"				
		}
		
	Note that id was generated from the provided login.

2. Update
	
	You can make a request with partial data or with a complete data structure.
	
	>>> curl -XPUT http://<HOST>/user/johndoe?pretty=true -H 'Content-Type: application/json' -d '{
			"firstName" : "Jack"
		}'

	
	Server response	with the 200 code
	
	>>> {
		  "id": "/user/johndoe",
		  "createDate": "2011-10-04T08:19:16.753Z",
		  "updateDate": "2011-10-04T08:24:30.840Z",		
		  "login": "john.doe",
		  "firstName": "Jack",							
		  "lastName": "Doe",
		  "isActive": false,
		  "isStaff": false,
		  "isSuperuser": false,
		  "lastLogin": null,
		  "dateJoined": null,
		  "groups": "/user/johndoe/groups"
		}

	
2. Delete 
	
	>>> curl --XDELETE http://<HOST>/user/johndoe
	
	Server response	with the 204 code and an empty body.
	
	
Group
^^^^^^
	
Group base uri is /group

1. Create
		
	>>> curl -XPOST http://<HOST>/group/?pretty=true -H 'Content-Type: application/json' -d '{
			"title" : "My group", 
			"description" : "Description of my first group"
		}'
		
	
				
	Server response	with the 201 code
	
	>>> {
		  "id": "/group/my-group",
		  "createDate": "2011-10-04T08:32:01.231Z",
		  "updateDate": "2011-10-04T08:32:01.231Z",
		  "title": "My group",
		  "description": "Description of my first group",
		  "writeGroups": "/group/my-group/perms/wg",
		  "writeUsers": "/group/my-group/perms/wu",
		  "users": "/group/my-group/users"
		}
	
	Note that id was generated from the provided title.
	
	
Membership
^^^^^^^^^^^
	
Membership base uri is /membership

1. Create

	>>> curl -XPOST http://<HOST>/membership/ -H 'Content-Type: application/json' -d '{
				"user" :  "/user/johndoe",
				"group" : "/group/my-group"
			}'
	
	Server response	with the 201 code
	
	>>> {
		  "id": "/membership/0b3bcb3a4b4fd153e2373f7ec49f5a57",
		  "createDate": "2011-10-04T08:40:32.117Z",
		  "updateDate": "2011-10-04T08:40:32.117Z",
		  "group": "/group/my-group",
		  "user": "/user/johndoe"
		}
	
	A membership document is a relation between a user and a group.
	
	
2. Get  user's groups

	If you want to list all groups for a user just query the uri stored in the "group" attribute of the user document
	
	>>> curl -XGET http://<HOST>/user/johndoe/groups/
	
	Server response
	
	>>> {
		  "total_rows": 1,
		  "offset": 0,
		  "rows": [
		    {
		      "group": "/group/my-group",
		      "createDate": "2011-10-04T08:40:32.117Z",
		      "updateDate": "2011-10-04T08:40:32.117Z",
		      "id": "/membership/0b3bcb3a4b4fd153e2373f7ec49f5a57"
		    }
		  ]
		}
		
	The server will return all membership documents for the user. Observe that user attribute of the membership document is not here. 
	
	If you want in the same query fetch the group document you can do it with the special query string parameter include_docs
	
	>>> curl -XGET http://<HOST>/user/johndoe/groups/?include_docs=true
	
	server response
	
	>>> {
		  "total_rows": 1,
		  "offset": 0,
		  "rows": [
		    {
		      "group": {
		        "title": "My group",
		        "users": "/group/my-group/users",
		        "description": "Description of my first group",
		        "writeUsers": "/group/my-group/perms/wu",
		        "createDate": "2011-10-04T08:32:01.231Z",
		        "updateDate": "2011-10-04T08:32:01.231Z",
		        "writeGroups": "/group/my-group/perms/wg",
		        "id": "/group/my-group"
		      },
		      "createDate": "2011-10-04T08:40:32.117Z",
		      "updateDate": "2011-10-04T08:40:32.117Z",
		      "id": "/membership/0b3bcb3a4b4fd153e2373f7ec49f5a57"
		    }
		  ]
		}

3. Get  group's users

	You can fetch the group's members by requesting on the "users" attribute of the group document

	>>> curl -XGET http://<HOST>/groups/my-group/users/
	
	or 
	
	>>> curl -XGET http://<HOST>/groups/my-group/users/?include_docs=true
	
4. Update
	
	.. warning:: Update are not allowed on membership uri.
	
5. Delete

	To delete a membership relation, proceed in the same way as others documents
	
	>>> curl --XDELETE http://<HOST>/membership/0b3bcb3a4b4fd153e2373f7ec49f5a57
	

Agenda
^^^^^^

Agenda base uri is /agenda

1. Create

	>>> curl -XPOST http://<HOST>/agenda/ -H 'Content-Type: application/json' -d '{
				"title" : "My private agenda",
				"description" : "description of my private agenda"
			}'
	
	
	
	Server response
	
	>>> {
	  "id": "/agenda/my-private-agenda",
	  "createDate": "2011-10-04T09:06:38.071Z",
	  "updateDate": "2011-10-04T09:06:38.071Z",
	  "title": "My private agenda",
	  "description": "description of my private agenda",
	  "writeGroups": "/agenda/my-private-agenda/perms/wg",
	  "writeUsers": "/agenda/my-private-agenda/perms/wu"
	}
	
	Note that id was generated from the provided title.

Event
^^^^^^

Event base uri is /event
	
1. Create

	>>> curl -XPOST http://<HOST>/event/?pretty=true -H 'Content-Type: application/json' -d '{
			"author" : "/user/johndoe",
			"event" : {
				"title" : "My first event"
			}
		}'

	.. warning:: At this time you must provide the author attribute but it will be unnecessary when auth module will work.

	Server response
	
	>>> {
		  "id": "/event/b31398e4e0de03ef76bb168e32e41948",
		  "createDate": "2011-10-04T09:14:28.281Z",
		  "updateDate": "2011-10-04T09:14:28.281Z",
		  "event": {
		    "title": "My first event",
		    "id": "/event/b31398e4e0de03ef76bb168e32e41948"
		  },
		  "author": "/user/johndoe",
		  "writeGroups": "/event/b31398e4e0de03ef76bb168e32e41948/perms/wg",
		  "readGroups": "/event/b31398e4e0de03ef76bb168e32e41948/perms/rg",
		  "writeUsers": "/event/b31398e4e0de03ef76bb168e32e41948/perms/wu",
		  "readUsers": "/event/b31398e4e0de03ef76bb168e32e41948/perms/ru",
		  "agenda": null
		}
	
2. Search

	Geographic and date time searchs are implemented.

	2.1. Geographic search
	
		Geographic search is a search that limits events contained in a bounding box.
	
		For example
		
		>>> curl -XGET http://<HOST>/api/event/?bbox=<TOP_LEFT_LATITUDE>,<TOP_LEFT_LONGITUDE>,<RIGHT_BOTTOM_LATITUDE>,<RIGHT_BOTTOM_LONGITUDE>
		
	2.2. Date time search
		
		Two parameters are availlable: start_time and end_time (optionnal)
				
		Lorsque seul le paramètre start_time est fourni, les évènements retournés sont ceux pour lesquels la date fournie est comprise entre les dates de début et de fin de l'évènement.
		
		Lorsque les deux paramètres start_time et end_time sont fournies, les évènements retournés sont ceux pour lesquels l'intersection des deux intervales de date n'est pas nul. 
		
		
Permission
^^^^^^^^^^

Permission documents are used to define access rights on documents.

A permission document is composed of two attributes:
	* grantTo which defines who has the permission. It could be a group or an user.
	* applyOn which defines the document on which the permission is applied.
	
Base permission uri varies depending on the document type and the permission type.

Permissions types are:
	* write user
	* read user
	* write group 
	* read group
	
All documents types don't have all permissions types.

1. Permissions by document types
	
	1.1 Group
		
		Group have user and group write permissions.
		
		To create a group permission


		