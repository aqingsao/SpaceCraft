function log(msg){
	$("#info").text(msg);
}
var CEngine = function(sx, sy){
	this.sx = sx;
	this.sy = sy;
	this.vx = 0;
	this.vy = 0;
	this.t = Date.now();
	this.ax = 0;
	this.ay = 0;
};

CEngine.prototype.accelerate = function(ax, ay){
	this.ax += ax;
	this.ay += ay;
}
CEngine.prototype.updatePosition = function(){
	var originalT = this.t, originalVx = this.vx, originalVy = this.vy, originalSx = this.sx, originalSy = this.sy;
	var currentAx = this.ax, currentAy = this.ay;
	
	this.ax = 0;
	this.ay = 0;
	log("OriginalT: " + originalT + ", s[" + originalSx +", " + originalSy +"], v[" + originalVx + ", " + originalVy + "].");	
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

var CCraft = function(sx, sy, radius){
	this.engine = new CEngine(sx, sy);
	this.radius = radius;
}
CCraft.prototype.onCommand = function(ax, ay){
	this.engine.accelerate(ax, ay);
}
CCraft.prototype.updatePosition = function(){
	this.engine.updatePosition();
}
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
		this.craft = new CCraft(this.width()/2, this.height()/2, 100);
		console.log("Create craft:" + this.craft);
		
		var theCraft = this.craft;
		window.addEventListener('keydown',function(evt){
			switch (evt.keyCode) {
				case 38:  
				 theCraft.onCommand(0, -1);
				break;
				case 40:  /* Down arrow was pressed */
				 theCraft.onCommand(0, 1);
				break;
				case 37:  /* Left arrow was pressed */
				 theCraft.onCommand(-1, 0);
				break;
				case 39:  /* Right arrow was pressed */
				 theCraft.onCommand(1, 0);
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
