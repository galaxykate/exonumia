/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';

    var PathTracer = common.Transform.extend({
        init : function(path, index, pct) {
            this._super();
            this.path = path;
            this.index = index;
            this.pct = pct;
            this.normal = 0;
            this.offset = 0;
            this.tangent = new Vector();
            this.updatePosition();
        },

        updatePosition : function() {
            var t1 = this.pct;
            var t0 = 1 - t1;
            var start = this.path.getPoint(this.index);
            var end = this.path.getPoint(this.index + 1);
            var c0 = start.handles[1];
            var c1 = end.handles[0];

            this.mult(0);
            this.addMultiple(start, t0 * t0 * t0);
            this.addMultiple(c0, 3 * t0 * t0 * t1);
            this.addMultiple(c1, 3 * t1 * t1 * t0);
            this.addMultiple(end, t1 * t1 * t1);

            this.tangent.mult(0);
            this.tangent.addMultiple(start, -3 * t0 * t0);
            this.tangent.addMultiple(c0, 3 * t0 * t0 - 6 * t0 * t1);
            this.tangent.addMultiple(c1, -3 * t1 * t1 + 6 * t0 * t1);
            this.tangent.addMultiple(end, 3 * t1 * t1);
            this.tangent.normalize();

            this.rotation = this.tangent.getAngle() + Math.PI / 2;

        },

        render : function(context) {
            var g = context.g;
            g.fill(.9, 1, 1);
            g.stroke(0);
            this.drawCircle(g, 15);

            this.drawArrow(g, this.tangent, 40);
        },
    });
    
    return PathTracer;
});
