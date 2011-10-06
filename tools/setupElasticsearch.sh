

if [ -z $1 ] 
then
echo "You must provde dbname as first argument";
exit 0;
fi


curl -XDELETE http://10.7.50.110:9200/$1;

#curl -XPUT http://10.7.50.110:9200/$1 -d '{"index" : {
#    "number_of_shards" : 3,
#    "number_of_replicas" : 2}}'

curl -XPUT http://10.7.50.110:9200/$1

curl -XPUT "http://10.7.50.110:9200/$1/event/_mapping" -d '{
	"event": {
		"properties" : {
			"author" :  {"type" : "string", "index" : "not_analyzed"},
			"event" : {
				"properties": {
					"where": {				
						"properties": {
							"geoPt": {
								"type": "geoPoint",
								"store" : true
							}
						}
					}
				}
			}
		}
	}
}';


curl -XPUT "http://10.7.50.110:9200/$1/membership/_mapping" -d '{
	"membership": {
		"properties" : {
			"user" : {"type" : "string", "index" : "not_analyzed"},
			"group" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';

curl -XPUT "http://10.7.50.110:9200/$1/agenda-write-user/_mapping" -d '{
	"membership": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/agenda-write-group/_mapping" -d '{
	"membership": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/group-write-user/_mapping" -d '{
	"membership": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/group-write-group/_mapping" -d '{
	"membership": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/event-write-user/_mapping" -d '{
	"membership": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/event-write-group/_mapping" -d '{
	"membership": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/event-read-user/_mapping" -d '{
	"membership": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/event-read-group/_mapping" -d '{
	"membership": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';

