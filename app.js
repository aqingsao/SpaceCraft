
/**
 * Module dependencies.
 */

var express = require('express')
var routes = require('./routes')
var craft = require('./routes/craft.js')
var ws = require('websocket-server');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.listen(3000);

var wsServer = ws.createServer({server:app, debug:true});
wsServer.addListener('connection', function(connection){
	craft.onSocketConnected(wsServer, connection);
	connection.addListener('message', function(msg){
		craft.onSocketMessage(wsServer, connection, msg);
	});
	connection.addListener('rejected', function(msg){
	});
	connection.addListener('close', function(msg){
	});
});

setInterval(function(){
	craft.broadcast(wsServer);
}, 50);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
