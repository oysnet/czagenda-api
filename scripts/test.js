
var settings = require('../settings');

var OAuth= require('node-oauth').OAuth;
var oa= new OAuth("http://term.ie/oauth/example/request_token.php",
"http://term.ie/oauth/example/access_token.php",settings.oauth.consumer_token,settings.oauth.consumer_secret,"1.0",null,"HMAC-SHA1")
      
    
oa.put("http://localhost:3000/agenda/title-agenda-3",  settings.oauth.access_token,  
	settings.oauth.access_secret, JSON.stringify({title:'test'}), 'application/json', 
	function (error, data, response) {
		console.log(data)
	})
      
     /*   
oa.getProtectedResource("http://localhost:3000/agenda", "GET", settings.oauth.access_token,  
	settings.oauth.access_secret,
	function (error, data, response) {
          console.log(data);
      });  */    