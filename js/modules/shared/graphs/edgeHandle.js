/**
 * @author Kate Compton
 */

define(["common"], function(common) {
    var Handle = Vector.extend({

        // Create a handle
        init : function(position, node, edge, side) {
            this._super(position);
            this.side = side;
            this.node = node;
            this.edge = edge;

            // Set the angle and radius relative to the node and edge
            this.setFromPosition();
        },
        //===============================================================
        //===============================================================
        //===============================================================
        //===============================================================
        // Setters

        setFromPosition : function() {
            var offset = this.node.getOffsetTo(this);
            this.angle = offset.getAngle() - this.node.rotation;
            this.radius = offset.magnitude() / this.edge.getLength();
        },

        updatePosition : function() {
            var theta = this.node.rotation + this.angle;
            var r = this.radius * this.edge.getLength();

            app.log(theta + " " + r);

            this.setToPolarOffset(this.node, r, theta);
        },

        //===============================================================
        //===============================================================

        // What type of handle is this?  It should probably stay attached to it's parent

        draw : function(context) {
            var g = context.g;

            g.strokeWeight(1);
            g.stroke(0);
            this.node.drawLineTo(g, this);

            g.noStroke();
            g.fill(.5 + .3 * this.side, 1, 1);
            this.drawCircle(g, 5);
        },
        toString : function() {
            return this._super() + this.side + " angle:" + this.angle.toFixed(2) + " radius:" + this.radius.toFixed(2);
        },
    });

    return Handle;
});
