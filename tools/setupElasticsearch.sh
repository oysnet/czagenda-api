

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
			"computedWriteGroups" : {"type" : "string", "index" : "not_analyzed"},
			"computedWriteUsers" : {"type" : "string", "index" : "not_analyzed"},
			"computedReadGroups" : {"type" : "string", "index" : "not_analyzed"},
			"computedReadUsers" : {"type" : "string", "index" : "not_analyzed"},
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

curl -XPUT "http://10.7.50.110:9200/$1/agenda/_mapping" -d '{
	"agenda": {
		"properties" : {
			"computedWriteGroups" : {"type" : "string", "index" : "not_analyzed"},
			"computedWriteUsers" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';

curl -XPUT "http://10.7.50.110:9200/$1/group/_mapping" -d '{
	"group": {
		"properties" : {
			"computedWriteGroups" : {"type" : "string", "index" : "not_analyzed"},
			"computedWriteUsers" : {"type" : "string", "index" : "not_analyzed"}
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
	"agenda-write-user": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/agenda-write-group/_mapping" -d '{
	"agenda-write-group": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/group-write-user/_mapping" -d '{
	"group-write-user": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/group-write-group/_mapping" -d '{
	"group-write-group": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/event-write-user/_mapping" -d '{
	"event-write-user": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/event-write-group/_mapping" -d '{
	"event-write-group": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/event-read-user/_mapping" -d '{
	"event-read-user": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';
curl -XPUT "http://10.7.50.110:9200/$1/event-read-group/_mapping" -d '{
	"event-read-group": {
		"properties" : {
			"applyOn" : {"type" : "string", "index" : "not_analyzed"},
			"grantTo" : {"type" : "string", "index" : "not_analyzed"}
		}
	}
}';

