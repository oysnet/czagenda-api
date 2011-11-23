var Rest = require('../libs/rest-client.js').Rest;
var fs = require('fs');
rest = new Rest({token: "r3gvHGOpMs48jg2Dcf", token_secret:"dcm34D7JG0AJA7ippSPnBfuDLNIXTtIn", consumer:"vqfY05YtGqWfNalPqX", consumer_secret:"zlsH0YhTm2DmX6K8plHaeiRObJIjaB9b"});

var tpl = fs.readFileSync("./scripts/updateSchema_template.tpl", 'utf8');
var sample = fs.readFileSync("./scripts/updateSchema_sample.json", 'utf8');

var data = {template : tpl, sample : sample};

rest.put('/api/schema/event-europe', JSON.stringify(data), function () {
console.log(arguments);
});