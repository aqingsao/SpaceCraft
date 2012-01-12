/*
 * GET craft page.
 */
craft = function(){
	var MIN_X = MIN_Y = 0, MAX_X = 1200, MAX_Y = 900;
	var CState = function(t, sx, vx, sy, vy){
		this.t = t;
		if(sx <= MIN_X){
			this.sx = MIN_X;
		}
		else if(sx > MAX_X){
			this.sx = MAX_X;
		}
		else{
			this.sx = sx;
		}
		if(sy <= MIN_Y){
			this.sy = MIN_Y;
		}
		else if(sy > MAX_Y){
			this.sy = MAX_Y;
		}
		else{
			this.sy = sy;
		}
		this.vx = vx
		this.vy = vy;
	}
	CState.prototype.description = function(){
		return "S[" + this.sx + "," + this.sy + "], V["  + this.vx + ","+ this.vy + "] on Time " + this.t;
	}

	var CEngine = function(){
		this.ax = 0;
		this.ay = 0;
	}
	CEngine.prototype.move = function(ax, ay){
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

		var vx = this._getV(state.vx, ax, deltaT);
		var sx = this._getS(state.sx, state.vx, ax, deltaT);
		var vy = this._getV(state.vy, ay, deltaT);
		var sy = this._getS(state.sy, state.vy, ay, deltaT);
		
		return new CState(t, sx, vx, sy, vy);
	}
	CEngine.prototype._getAcceleration = function(a, v){
		var wind = 2 * v;
		return this.roundup(a - wind);
	}
	CEngine.prototype._getS = function(s0, v0, a, deltaT){
		return this.roundup(s0 + v0 * deltaT + a / 2.0 * deltaT * deltaT / 1000.0);
	}
	CEngine.prototype._getV = function(v0, a, deltaT){
		return this.roundup(v0 + a * deltaT / 1000.0);
	}
	CEngine.prototype.roundup = function(number){
		var scale = Math.pow(10, 2);
		return Math.round(number * scale) / scale;
	}

	var CDrivable = function(sx, sy){
		this.engine = new CEngine();
		this.state = new CState(Date.now(), sx, 0, sy, 0);
	}
	CDrivable.prototype.updatePosition = function(){
		this.state = this.engine.moveTo(this.state);
	}

	console.log("Is going to create craft... ");
	return new CDrivable(350, 350);
}();

console.log("Craft is created " + craft);
exports.onSocketMessage = function(wsServer, connection, msg){
	switch(msg){
		case 'UP':
			craft.engine.move(0, -1);
			break;
		case 'DOWN':
			craft.engine.move(0, 1);
			break;
		case 'LEFT':
			craft.engine.move(-1, 0);
			break;
		case 'RIGHT':
			craft.engine.move(1, 0);
			break;
	}
};
exports.onSocketConnected = function(wsServer, connection){
	updateCraft(wsServer, craft, connection);
}
exports.broadcast = function(wsServer){
	updateCraft(wsServer, craft);
}
function updateCraft(wsServer, craft, connection){
	craft.updatePosition();
	var msg = JSON.stringify(craft);
	if(connection){
		wsServer.send(connection.id, msg);
	}
	else{
		wsServer.broadcast(msg);
	}
}