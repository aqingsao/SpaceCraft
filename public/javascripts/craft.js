function log(msg){
	$("#info").text(msg);
}

var ACCELERATE_FACTOR = 10;
function CState(sx, sy){
	this.t = Date.now();
	this.sx = sx;
	this.vx = 0;
	this.sy = sy;
	this.vy = 0;
}

var CEngine = function(){
	this.ax = 0;
	this.ay = 0;
};
CEngine.prototype.accelerate = function(ax, ay){
	this.ax += ax * ACCELERATE_FACTOR;
	this.ay += ay * ACCELERATE_FACTOR;
}
CEngine.prototype.updatePosition = function(t, state){
	var originalT = t, originalV = state.v, originalS = state.s;
	var currentA = (this.ax - 3.0 / 8.0 * originalV * originalV / 5);
	
	this.ax = 0;
	this.t = Date.now();
	var deltaT = (this.t - originalT)/1000.0;
	this.vx = this.getV(originalVx, currentAx, deltaT);
	this.vy = this.getV(originalVy, currentAy, deltaT);
	this.sx = this.getS(originalSx, originalVx, currentAx, deltaT);
	this.sy = this.getS(originalSy, originalVy, currentAy, deltaT);
	log("T: " + this.t + ", s[" + this.sx +", " + this.sy +"], v[" + this.vx + ", " + this.vy + "].");	
}

CEngine.prototype.getS = function(s0, v0, a, deltaT){
	return s0 + v0 * deltaT + a * deltaT * deltaT / 2.0;
}

CEngine.prototype.getV = function(v0, a, deltaT){
	return v0 + a * deltaT;
}

var CDrivable = function(sx, sy){
	this.stateX = new CState(sx, 0);
	this.stateY = new CState(sy, 0);
	this.t = Date.now();
	this.ax = 0;
	this.ay = 0;
	this.engine = new CEngine(sx, sy);
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
CDrivable.prototype.updatePosition = function(){
	this.engine.updatePosition();
}

function CCraft(sx, sy, radius){
}
CCraft.prototype = new CDrivable(sx, sy);

CCraft.prototype.render = function(cxt){
	cxt.fillStyle = '#CCC';
    cxt.beginPath();
    cxt.arc(this.engine.sx, this.engine.sy, this.radius, 0, Math.PI * 2);
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
		var central = new CPoint(this.width()/2, this.height()/2);
		this.circleMain = new CCircle(central, 100);
		this.circleLeft = new CCircle(central.off(-200, 0), 50);
		this.circleRight = new CCircle(central.off(200, 0), 50);
		this.craft = new CCraft(this.width()/2, this.height()/2, 20);
		console.log("Create craft:" + this.craft);
		
		var theCraft = this.craft;
		window.addEventListener('keydown',function(evt){
			switch (evt.keyCode) {
				case 38:  
				 theCraft.up();
				break;
				case 40:  /* Down arrow was pressed */
				 theCraft.down();
				break;
				case 37:  /* Left arrow was pressed */
				 theCraft.left();
				break;
				case 39:  /* Right arrow was pressed */
				 theCraft.right();
				break;
			}
		},true);
    },
    render: function(e) {
        var ctx = e.context;
		ctx.clearRect(0, 0, this.width(), this.height());
		this.craft.render(ctx);
    }, 
	beforerender: function(e){
		this.craft.updatePosition();
	}
});
