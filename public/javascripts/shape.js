function CPoint(x, y) {
    this.x = x;
    this.y = y;
}
CPoint.prototype.angleRelative = function(length, angle){
    return new CPoint(this.x + Math.cos(angle) * length, this.y - Math.sin(angle) * length);
}
CPoint.prototype.off = function(deltaX, deltaY){
    return new CPoint(this.x + deltaX, this.y + deltaY);
}

function CCircle(central, radius, settings) {
	this.central = central;
	this.radius = radius;
	this.settings = settings || {};
}

CCircle.prototype.render = function(cxt){
	cxt.fillStyle = this.settings.color || '#CCC';
    cxt.beginPath();
    cxt.arc(this.central.x, this.central.y, this.radius, 0, Math.PI * 2);
    cxt.fill();
    cxt.strokeStyle = "#000000";
    cxt.stroke();
    cxt.closePath();
}

function Polygon() {}
Polygon.create = function(settings) {
	return (new Polygon()).init(settings);
};
Polygon.prototype = {
	init: function(settings) {
		var s = settings || {},
			
			// required settings. caller must be sane enough to provide correct settings.
			w = s.width,
			h = s.height,
			r = s.r,
			g = s.g,
			b = s.b,
			a = s.a,
			radius = s.radius,
			direction = s.direction,
			fillStyle = s.fillStyle || 'rgba(' + r + ',' + g + ',' + b + ',' + a * 0.15 + ')',
			strokeStyle = s.strokeStyle || 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')',
			shadowColor = s.shadowColor || 'rgba(' + r + ',' + g + ',' + b + ',' + a * 0.8 + ')',
			mA = s.mA,
			mB = s.mB,
			mC = s.mC,
			mD = s.mD,
			x = s.x,
			y = s.y,
			radDelta = s.radDelta,
			edges = s.edges,
						
			rads = this._generateRads(edges),
			points = this._updatePoints(x, y, radius, rads);

		this.shape = {
			radius: radius,
			direction: direction,
			
			// y = mA*(x - mB)^2 + mC
			mA: mA,
			mB: mB,
			mC: mC,
			mD: mD, // x += mD in each rendering loop
			radDelta: radDelta,
			rads: rads,
			points: points,
			r: r,
			g: g,
			b: b,
			a: a,
			strokeStyle: strokeStyle,
			fillStyle: fillStyle,
			shadowColor: shadowColor,
			lineWidth: GAME_SHAPE_LINE_WIDTH,
			shadowBlur: GAME_SHAPE_SHADOW_BLUR
		};
		
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.edges = edges;
		this.hasDeathBomb = hasDeathBomb;
		this.timeStamp = Date.now();
		
		return this;
	},
	render: function(e) {
		var ctx = e.context,
			shape = this.shape,
			x = this.x,
			y = this.y,
			points = shape.points;
		
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = shape.strokeStyle;
		ctx.fillStyle = shape.fillStyle;
		ctx.lineWidth = shape.lineWidth;
		ctx.shadowColor = shape.shadowColor;
		ctx.shadowBlur = shape.shadowBlur;
		ctx.moveTo(points[0].x, points[0].y);
		
		for (var i = points.length - 1; i >= 0; i--) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		
		ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
		ctx.stroke();
		ctx.shadowBlur = 0;
		ctx.fill();
		ctx.restore();
				
		this.x += shape.mD;
		this.y = shape.mA * (this.x - shape.mB) * (this.x - shape.mB) + shape.mC;
		this._updateRads(shape.rads, shape.radDelta);
		shape.points = this._updatePoints(this.x, this.y, shape.radius, shape.rads);
	},
	hitTest: function(cur, prev) {
		var points = this.shape.points,
			length = points.length;
		
		if (cur.timeStamp < this.timeStamp || prev.timeStamp < this.timeStamp) {
			return false;
		}
		
		for (var i = 0, j = i + 1; i < length; i++, j = (j + 1) % length) {
			if ((this._lineTest(cur.x, cur.y, prev.x, prev.y, points[i].x, points[i].y, points[j].x, points[j].y)
				&& (this._insideBox(points[i].x, points[i].y) || this._insideBox(points[j].x, points[j].y)))) {
				return true;
			}
		}
		
		return false;
	},
	life: function() {
		var shape = this.shape;
		
		return (
			(this.y > shape.radius + this.height)
				|| (shape.direction < 0 && this.x < -shape.radius)
				|| (shape.direction > 0 && this.x > shape.radius + this.width)
			? 0: 1
		);
	},
	_insideBox: function(x, y) {
		return x >= 0 && y >= 0 && x <= this.width && y <= this.height;
	},
	_updatePoints: function(x, y, radius, rads) {
		var points = [];
		
		for (var i in rads) {
			points.push({
				x: x + radius * Math.cos(rads[i]),
				y: y + radius * Math.sin(rads[i])
			});
		}
		
		return points;
	}
};
