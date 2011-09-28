
module.exports = function (req, res, next) {
  function writeCorsHead (res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods" , "POST, GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials" , false);
    res.header("Access-Control-Max-Age" , '86400'); // 24 hours
    res.header("Access-Control-Allow-Headers" , "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");

  }
  
  writeCorsHead(res)
  if (req.method !== 'OPTIONS') {
	  next();  	
  }  else {
  	res.end();
  }
}
