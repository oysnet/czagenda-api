/*var Event = require('./models/event.js').Event;
var o = {};
var e = new Event()
e.event = {'title' : 'Mon evenement'};
e.author = 'Moi';
e.save(function (err, obj) {o.o = obj})


*/

var Agenda = require('./models/agenda.js').Agenda;
var o = {};
var e = new Agenda()
e.title = 'Mon agenda Perso';
e.description = 'L\'agenda personnel de Jean-Hugues Pinson'
e.save(function (err, obj) {o.o = obj})


var Group = require('./models/group.js').Group;
var o = {};
var e = new Group()
e.title = 'Mon agenda Perso';
e.description = 'L\'agenda personnel de Jean-Hugues Pinson'
e.save(function (err, obj) {o.o = obj})

var User = require('./models/user.js').User;
var o = {};
var e = new User()
e.login = 'jhpinson'
e.first_name = 'Jean-Hugues'
e.last_name = 'Pinson';
e.password = 'eeeeee'
e.email = 'jh.pinson@gmail.com'
e.save(function (err, obj) {o.o = obj})

var User = require('./models/user.js').User;
var o = {};
var e = new User()
e.login = 'isabelle'
e.first_name = 'Isabelle'
e.last_name = 'Pinson';
e.password = 'eeeeee'
e.email = 'i.pinson@gmail.com'
e.save(function (err, obj) {o.o = obj})


var User = require('./models/user.js').User;
var o = {};
var e = new User()
e.login = 'louise'
e.first_name = 'louise'
e.last_name = 'Pinson';
e.password = 'eeeeee'
e.email = 'l.pinson@gmail.com'
e.save(function (err, obj) {o.o = obj})

var settings = require('../settings.js');
var ElasticSearchClient = require('elasticSearchClient');
var elasticSearchClient = new ElasticSearchClient(settings.elasticsearch);

var q = elasticSearchClient.deleteDocument('agenda', 'event', 'test');
console.log('1')

q.on('data', function() {
	console.log(arguments);
});
console.log('2')
q.exec();
console.log('3')