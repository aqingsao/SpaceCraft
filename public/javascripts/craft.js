function roundup(number){
	var scale = Math.pow(10, 2);
	return Math.round(number * scale) / scale;
}
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
var CState = function(){
}
CState.prototype.init = function(sx, sy){
	this.t = Date.now();
	this.sx = sx;
	this.vx = 0;
	this.sy = sy;
	this.vy = 0;
}
CState.prototype.description = function(){
	return "S[" + this.sx + "," + this.sy + "], V["  + this.vx + ","+ this.vy + "] on Time " + this.t;
}

var CEngine = function(){
	this.ax = 0;
	this.ay = 0;
};
CEngine.prototype.accelerate = function(ax, ay){
	this.ax += ax;
	this.ay += ay;
}
CEngine.prototype.moveTo = function(state){
	var t = Date.now();
	var deltaT = t - state.t;
	var ax = this._getAcceleration(this.ax, state.vx);
	this.ax = 0;
	var ay = this._getAcceleration(this.ay, state.vy);
	this.ay = 0;
	
	var newState = new CState();
	newState.t = t;
	newState.vx = this._getV(state.vx, ax, deltaT);
	newState.sx = this._getS(state.sx, state.vx, ax, deltaT);
	newState.vy = this._getV(state.vy, ay, deltaT);
	newState.sy = this._getS(state.sy, state.vy, ay, deltaT);
	
	return newState;
}
CEngine.prototype._getAcceleration = function(a, v){
	var wind = 2 * v;
	return roundup(a - wind);
}
CEngine.prototype._getS = function(s0, v0, a, deltaT){
	return roundup(s0 + v0 * deltaT + a / 2.0 * deltaT * deltaT / 1000.0);
}
CEngine.prototype._getV = function(v0, a, deltaT){
	return roundup(v0 + a * deltaT / 1000.0);
}

var CDrivable = function(){
	this.engine = new CEngine();
}
CDrivable.prototype.withState = function(sx, sy){
	this.state = new CState();
	this.state.init(sx, sy);
}
CDrivable.prototype.left = function(){
	this.engine.accelerate(-1, 0);
}
CDrivable.prototype.right = function(){
	this.engine.accelerate(1, 0);
}
CDrivable.prototype.up = function(){
	this.engine.accelerate(0, -1);
}
CDrivable.prototype.down = function(){
	this.engine.accelerate(0, 1);
}
CDrivable.prototype.moveTo = function(x, y){
	this.state.sx = x;
	this.state.sy = y;
}

function CCraft(sx, sy, radius){
	this.withState(sx, sy);
	this.radius = radius;
	// this.shape = new CCirle(radius);
}
CCraft.prototype = new CDrivable();

CCraft.prototype.render = function(cxt){
	cxt.fillStyle = '#CCC';
    cxt.beginPath();
    cxt.arc(this.state.sx, this.state.sy, this.radius, 0, Math.PI * 2, true);
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
    var socket = new WebSocket("ws://10.18.3.30:3000");
	socket.onopen = function(){  
		_CRAFT.socket = socket;
        $("#info span.status").text("Connected with server");
	}
	socket.onmessage = function(msg){  
        $("#info span.status").text("Received msg: " + msg.data);

		var command = JSON.parse(msg.data);
		if(_CRAFT.craft == null){
			console.log("Initialize a craft on [" + command.x + ", " + command.y + "]");
			_CRAFT.craft = new CCraft(command.x, command.y, 20);
		}
		else{
			_CRAFT.craft.moveTo(command.x, command.y);
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
		alert("You are disconnected from server.");
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