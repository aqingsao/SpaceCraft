function logMessage(msg){
	$("#info .message").text(msg);
}
var	_CRAFT = {};

function logPosition(state, engine){
	$("#info .ax").text(engine.ax);
	$("#info .vx").text(state.vx);
	$("#info .sx").text(state.sx);
	$("#info .ay").text(engine.ay);
	$("#info .vy").text(state.vy);
	$("#info .sy").text(state.sy);
}

function CCraft(sx, sy, radius){
	this.sx = sx;
	this.sy = sy;
	this.radius = radius;
}
CCraft.prototype.render = function(cxt){
	cxt.fillStyle = '#CCC';
    cxt.beginPath();
    cxt.arc(this.sx, this.sy, this.radius, 0, Math.PI * 2, true);
    cxt.fill();
    cxt.strokeStyle = "#000000";
    cxt.stroke();
    cxt.closePath();
}

$G('craft', {
    width: 700,
    height: 800
}, {
    start: function() {
		if(!("WebSocket" in window)){  
		    alert("No web socket is supported!");
		}else{  
		    connect();  
    	}
		
		window.addEventListener('keydown', onKeyDown, true);
	},
    render: function(e) {
		if(_CRAFT.craft != null){
        	var ctx = e.context;
			ctx.clearRect(0, 0, this.width(), this.height());
			_CRAFT.craft.render(ctx);
		}
    }, 
	beforerender: function(e){
	}
});

function connect(){
    var socket = new WebSocket("ws://localhost:3000");
	socket.onopen = function(){  
		_CRAFT.socket = socket;
        $("#info span.status").text("Connected with server");
	}
	socket.onmessage = function(msg){  
        $("#info span.status").text("Received msg: " + msg.data);

		var command = JSON.parse(msg.data);
		if(_CRAFT.craft == null){
			console.log("Initialize a craft on [" + command.state.sx + ", " + command.state.sy + "]");
			_CRAFT.craft = new CCraft(command.state.sx, command.state.sy, 20);
		}
		else{
			_CRAFT.craft.sx = command.state.sx;
			_CRAFT.craft.sy = command.state.sy;
		}
	}
	socket.onclose = function(){
		_CRAFT.socket = null;
		$("#info span.status").text("Socket closed.");
	}
	socket.onerror = function(){
        $("#info span.status").text("Socket error");
	}
	return socket;
}

function onKeyDown(evt){
	if(_CRAFT.socket == null){
		return;
	}
		switch (evt.keyCode) {
			case 38:  
			 _CRAFT.socket.send('UP');
			break;
			case 40:  /* Down arrow was pressed */
			 _CRAFT.socket.send('DOWN');
			break;
			case 37:  /* Left arrow was pressed */
			 _CRAFT.socket.send('LEFT');
			break;
			case 39:  /* Right arrow was pressed */
			 _CRAFT.socket.send('RIGHT');
			break;
		}
}