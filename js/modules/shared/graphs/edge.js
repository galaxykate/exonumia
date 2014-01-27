/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["common", "./edgeHandle", "./node"], function(common, Handle, EdgeNode) {
    var numToString = function(num) {
        if (isNaN(num))
            return num + "";
        return num.toFixed(2);
    };

    // Nice, linear edge
    var Edge = Class.extend({

        init : function(d) {
            this.nodes = [];
            this.normal = new Vector();
            this.edge = new Vector();
            this.midpoint = new Vector();

            if (arguments.length > 1) {
                this.setNode(arguments[0], 0);
                this.setNode(arguments[1], 1);
            }

            if (arguments.length > 2) {

                if (arguments.length === 3) {
                    var c = arguments[2]
                    var c0, c1;

                    c0 = new Vector();
                    c1 = new Vector();
                    var x0 = this.nodes[0].x;
                    var x1 = this.nodes[1].x;
                    var y0 = this.nodes[0].y;
                    var y1 = this.nodes[1].y;
                    c0.x = x0 + (2 / 3 * (c.x - x0));
                    c1.x = x1 + (2 / 3 * (c.x - x1));
                    c0.y = y0 + (2 / 3 * (c.y - y0));
                    c1.y = y1 + (2 / 3 * (c.y - y1));
                    this.makeHandles(c0, c1);
                } else
                    this.makeHandles(arguments[2], arguments[3]);

            }

            this.updateFromNodes();
        },

        //==============================================================================

        setNode : function(node, side) {
            if (!node || !node.isValid()) {
                throw ("Attempting to make edge with invalid nodes[0]:" + nodes[0]);
            }
            EdgeNode.upgradeToNode(node);
            this.nodes[side] = node;

            node.addEdge(this, side);
        },

        removeFromNodes : function() {

        },

        //==============================================================================
        //==============================================================================
        //==============================================================================
        // Clone

        // Just dupe the handles, really (FIX)
        clone : function(edge) {

        },

        //========================================
        //========================================
        //========================================
        // nodes[1] node management

        remove : function() {
            this.removeFromNodes();
            this.deleted = true;
        },

        //========================================
        //========================================
        //========================================
        // Intersections

        computeIntersection : function(edge) {
            var s = this.nodes[0].getOffsetTo(edge.nodes[0]);
            var u = this.getOffset();
            var v = edge.getOffset();
            var m = (s.x / v.x - s.y / v.y) / (u.x / v.x - u.y / v.y);
            var n0 = (m * u.x - s.x) / v.x;
            var n1 = (m * u.y - s.y) / v.y;
            var p0 = Vector.addMultiples(edge.nodes[0], 1, v, n0);
            var p1 = Vector.addMultiples(this.nodes[0], 1, u, m);

            return {
                edges : [this, edge],
                pcts : [m, n0],
                position : p0,
                onEdges : function() {
                    var m = this.pcts[0];
                    var n = this.pcts[1];
                    return (m >= 0 && m <= 1) && (n >= 0 && n <= 1)
                }
            }
        },

        updateFromNodes : function() {
      
            this.edge.setToDifference(this.nodes[1], this.nodes[0]);
            this.normal.setTo(this.edge.y, -this.edge.x);
            this.normal.normalize();
            if (!this.normal.isValid())
                console.log(this.toString());

        },

        //==============================================================================
        //==============================================================================
        // getters

        getLength : function() {
            return this.edge.magnitude();
        },

        //==============================================================================
        //==============================================================================
        // Tracers

        //==============================================================================
        //==============================================================================

        applyToControlHandles : function(f) {
            if (this.handles !== undefined) {
                f(this.handles[0]);
                f(this.handles[1]);
            }
        },

        makeHandles : function(c0, c1) {
            this.isCurve = true;
            if (this.handles === undefined) {
                this.handles = [];
                this.handles[0] = new Handle(c0, this.nodes[0], this, 0);
                this.handles[1] = new Handle(c1, this.nodes[1], this, 1);
            }
        },

        //==============================================================================
        //==============================================================================
        //==============================================================================
        // External points

        getAngleTo : function(p) {
            var u = this.getOffset();
            var v = this.nodes[0].getOffsetTo(p);

            var theta = Math.acos(u.dot(v) / (u.magnitude() * v.magnitude()));
            return theta;
        },

        // Get which side p is on
        getSide : function(p) {
            var offset = this.getOffset();
            var val = (offset.x * (p.y - this.nodes[0].y) - offset.y * (p.x - this.nodes[0].x));
            if (val > 0)
                return 1;
            if (val < 0)
                return -1;
            return 0;
        },

        //==============================================================================
        //==============================================================================
        //==============================================================================
        // Path following

        //==============================================================================
        //==============================================================================
        //==============================================================================
        //

        //==============================================================================
        //==============================================================================

        getSubdivisionTangent : function(t) {

            if (this.handles === undefined) {
                return new Vector(this.offset);
            }

            t = utilities.constrain(t, .001, .999);
            var t0 = 1 - t;
            var t1 = t;
            var c0 = this.handles[0];
            var c1 = this.handles[1];

            var tangent = new Vector();
            tangent.addMultiple(this.nodes[0], -3 * t0 * t0);
            tangent.addMultiple(c0, 3 * t0 * t0 - 6 * t0 * t1);
            tangent.addMultiple(c1, -3 * t1 * t1 + 6 * t0 * t1);
            tangent.addMultiple(this.nodes[1], 3 * t1 * t1);
            tangent.normalize();

            if (!tangent.isValid()) {
                console.log(this.toString());
                throw ("Invalid tangent: " + this);
                /*
                 console.log(t0 + " " + t1);
                 console.log(c0 + " " + c1);
                 console.log(this.idNumber, tangent);
                 */
            }
            return tangent;
        },
        getSubdivisionPoint : function(t) {
            var p = new common.Transform();
            this.setToSubdivisionPoint(p, t);
            return p;
        },
        setToSubdivisionPoint : function(p, t) {

            var t0 = 1 - t;
            var t1 = t;

            p.rotation = this.getAngleAt(t);

            if (this.handles === undefined) {
                p.setTo(this.nodes[0].lerp(this.nodes[1], t));

                return p;
            }
            var c0 = this.handles[0];
            var c1 = this.handles[1];

            p.addMultiple(this.nodes[0], t0 * t0 * t0);
            p.addMultiple(c0, 3 * t0 * t0 * t1);
            p.addMultiple(c1, 3 * t1 * t1 * t0);
            p.addMultiple(this.nodes[1], t1 * t1 * t1);

            return p;
        },
        //==============================================================================
        //==============================================================================
        //==============================================================================
        // Outputs

        drawHandles : function(context) {
            if (this.handles) {
                this.handles[0].draw(context);
                this.handles[1].draw(context);
            }
        },
        draw : function(context) {
            var g = context.g;
            g.noFill();
            if (this.handles) {
                this.nodes[0].bezierTo(g, this.handles[0], this.handles[1], this.nodes[1]);
            } else {
                if (context.useScreenPos)
                    this.nodes[0].screenPos.drawLineTo(g, this.nodes[1].screenPos);
                else
                    this.nodes[0].drawLineTo(g, this.nodes[1]);

            }
        },
        drawVertex : function(context) {
            var g = context.g;
            if (this.handles) {

                this.nodes[1].bezier(g, this.handles[0], this.handles[1]);
            } else {
                this.nodes[1].vertex(g);
            }
        },
        drawNormal : function(g) {
            this.midpoint.drawArrow(g, this.normal, 10);
        },
        toString : function() {
            return "[" + this.nodes[0] + " to " + this.nodes[1] + "]";
        },
        toIndexString : function() {
            return "[" + this.nodes[0].index + "-" + this.nodes[1].index + "]";
        }
    });

    Edge.upgradeToNode = EdgeNode.upgradeToNode;
    return Edge;

});
