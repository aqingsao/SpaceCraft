
/*
 * GET craft page.
 */

var craft = {x: 350, y: 350};
exports.onSocketMessage = function(wsServer, connection, msg){
	switch(msg){
		case 'UP':
			craft.y--;
			updateCraft(wsServer, craft);
			break;
		case 'DOWN':
			craft.y++;
			updateCraft(wsServer, craft);
			break;
		case 'LEFT':
			craft.x--;
			updateCraft(wsServer, craft);
			break;
		case 'RIGHT':
			craft.x++;
			updateCraft(wsServer, craft);
			break;
	}
};
exports.onSocketConnected = function(wsServer, connection){
	updateCraft(wsServer, craft, connection);
}
function updateCraft(wsServer, craft, connection){
	console.log("Craft moved to [" + craft.x + ", " + craft.y + "]");
	var msg = JSON.stringify(craft);
	if(connection){
		wsServer.send(connection.id, msg);
	}
	else{
		wsServer.broadcast(msg);
	}
}