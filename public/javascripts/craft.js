$G('craft', {
    width: 700,
    height: 800
}, {
    start: function() {
        this.data('rad', 2 * Math.random())
        .data('radDelta', -0.004)
        .data('color', 0)
        .data('colorDelta', 8);
    },
    render: function(e) {
        var ctx = e.context,
            rad = this.data('rad'),
            radDelta = this.data('radDelta'),
            color = this.data('color'),
            colorDelta = this.data('colorDelta'),
            r = rad * Math.PI;
        
        ctx.save();
        ctx.clearRect(0, 0, this.width(), this.height());
        ctx.beginPath();
        ctx.lineWidth = 20;
        ctx.strokeStyle = 'rgb(255,' + color + ',' + color + ')';
        ctx.moveTo(100, 100);
        ctx.lineTo(100 + Math.cos(r) * 80, 100 + Math.sin(r) * 80);
        ctx.arc(100, 100, 80, r, r + 5/3 * Math.PI, false);
        ctx.stroke();
        ctx.restore();
        
        color += colorDelta;
        rad += radDelta;
        this.data('rad', rad)
        .data('radDelta', rad >= 2 || rad <= 0? -radDelta: radDelta)
        .data('color', color)
        .data('colorDelta', color >= 200 || color <= 0? -colorDelta: colorDelta);
    }
});
