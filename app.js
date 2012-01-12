
/**
 * Module dependencies.
 */

var express = require('express')
var routes = require('./routes')
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

var craft = {x: 350, y: 350};
var wsServer = ws.createServer({server:app, debug:true});
wsServer.addListener('connection', function(connection){
	updateCraft(craft, connection);
	connection.addListener('message', function(msg){
		onConnectionMessage(connection, msg);
	});
	connection.addListener('rejected', function(msg){
	});
	connection.addListener('close', function(msg){
	});
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

function onConnectionMessage(connection, msg){
	switch(msg){
		case 'UP':
			craft.y--;
			updateCraft(craft);
			break;
		case 'DOWN':
			craft.y++;
			updateCraft(craft);
			break;
		case 'LEFT':
			craft.x--;
			updateCraft(craft);
			break;
		case 'RIGHT':
			craft.x++;
			updateCraft(craft);
			break;
	}
}

function updateCraft(craft, connection){
	console.log("Craft moved to [" + craft.x + ", " + craft.y + "]");
	var msg = JSON.stringify(craft);
	if(connection){
		wsServer.send(connection.id, msg);
	}
	else{
		wsServer.broadcast(msg);
	}
}