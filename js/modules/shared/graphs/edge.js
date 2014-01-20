/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["common"], function(common) {
    var numToString = function(num) {
        if (isNaN(num))
            return num + "";
        return num.toFixed(2);
    };

    var nodeFxns = {

        createEdges : function() {
            this.edges = {
                outbound : [],
                inbound : [],
            }
        },

        reparentEdgesFrom : function(n) {
            var newParent = this;
            $.each(n.edges.outbound, function(index, edge) {
                edge.setStart(newParent);
            });
            $.each(n.edges.inbound, function(index, edge) {
                edge.setEnd(newParent);
            });
        },

        filterEdges : function(f) {
            return this.edges.outbound.filter(f).concat(this.edges.inbound.filter(f));
        },

        copyAngles : function(pt) {
            this.inAngle = pt.inAngle;
            this.outAngle = pt.outAngle;
            this.normalAngle = pt.normalAngle;
            this.dTheta = this.outAngle - this.inAngle;
            this.isSmooth = pt.isSmooth;
        },

        setToSmooth : function(normalAngle) {
            this.inAngle = normalAngle - Math.PI / 2;
            this.outAngle = normalAngle + Math.PI / 2;
            this.dTheta = this.outAngle - this.inAngle;
            this.normalAngle = normalAngle;
            this.isSmooth = true;
        },

        calculateAngles : function() {
            this.inAngle = this.getInboundAngle();
            this.outAngle = this.getOutboundAngle();

            if (isNaN(this.inAngle) && !isNaN(this.outAngle))
                this.inAngle = this.outAngle + Math.PI;

            if (isNaN(this.outAngle) && !isNaN(this.inAngle))
                this.outAngle = this.inAngle + Math.PI;

            // No edges at all
            if (isNaN(this.inAngle) && isNaN(this.outAngle)) {
                this.outAngle = Math.PI;
                this.inAngle = 0;
            }

            if (isNaN(this.inAngle) || isNaN(this.outAngle)) {
                console.log(this.inAngle + " " + this.outAngle);
                throw ("Angles not valid");
            }

            this.dTheta = this.outAngle - this.inAngle;
            this.dTheta = (this.dTheta % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);

            this.normalAngle = this.getLerpAngle(.5);

            this.isSmooth = (Math.abs(this.dTheta - Math.PI) % (2 * Math.PI)) < .1;
        },

        anglesToString : function() {

            return "in: " + numToString(this.inAngle) + "  out: " + numToString(this.outAngle) + " normal: " + numToString(this.normalAngle) + " dTheta: " + numToString(this.dTheta);

        },

        getLerpAngle : function(pct) {

            var angle = this.inAngle + this.dTheta * pct;
            if (isNaN(angle))
                throw ("Lerped angle is NaN: " + this.anglesToString());
            return angle;
        },

        getOutboundAngle : function() {
            if (this.edges.outbound.length > 0) {
                return this.edges.outbound[0].getAngleAt(0) - Math.PI / 2;
            }

            // return undefined otherwise
        },
        getInboundAngle : function() {
            if (this.edges.inbound.length > 0) {
                return this.edges.inbound[0].getAngleAt(1) + Math.PI / 2;
            }

            // return undefined otherwise
        },
        addOutbound : function(edge) {
            if (!edge)
                throw ("attempting to add outound edge " + edge + " to " + this);
            this.edges.outbound.push(edge);
        },
        addInbound : function(edge) {
            if (!edge)
                throw ("attempting to add inbound edge " + edge + " to " + this);

            this.edges.inbound.push(edge);
        },

        removeOutbound : function(edge) {
            if (this.edges !== undefined) {
                var index = this.edges.outbound.indexOf(edge);
                if (index > -1) {
                    this.edges.outbound.splice(index, 1);
                } else {
                    throw ("Outbound edge " + edge + " not found in " + this);
                }
            }
        },

        removeInbound : function(edge) {
            if (this.edges !== undefined) {
                var index = this.edges.inbound.indexOf(edge);
                if (index > -1) {
                    this.edges.inbound.splice(index, 1);
                } else {
                    throw ("Inbound edge " + edge + " not found in " + this);
                }
            }
        },

        getSubpath : function(context) {
            var count = 0;
            var subPath = {
                edges : [],
                nodes : [],
            };

            if (context.graph)
                subPath = context.graph;

            context.onEdge = function(edge) {
                if (context.testHue) {
                    edge.testColor = new common.KColor(context.testHue + count * .01, .7 + .4 * Math.sin(context.testHue), .7 - .4 * Math.sin(context.testHue));
                }
                subPath.edges.push(edge);
            };

            context.onNode = function(node) {
                if (context.testHue) {
                    node.testColor = new common.KColor(context.testHue + count * .01, .7 + .4 * Math.sin(context.testHue), .7 - .4 * Math.sin(context.testHue));
                }
                subPath.nodes.push(node);
                count++;
            };

            this.followPath(context);
            return subPath;
        },

        // Follow edges until it gets back to this node
        followLoop : function(context, callback) {
            var count = 0;
            context.nodeEndCondition = function(node) {
                return count > 0 && node === this;
                count++;
            };
            this.followPath(context, callback);
        },

        followPath : function(context, callback) {
            if (context.nodeEndCondition && context.nodeEndCondition(this)) {
                if (callback)
                    callback(this);
            } else {

                if (context.onNode)
                    context.onNode(this);

                var next = this.edges.outbound[0];
                if (next === undefined) {
                    if (callback)
                        callback();
                } else
                    next.followPath(context, callback);
            }
        },
    };

    var upgradeToNode = function(p) {
        if (p.edges === undefined) {
            $.extend(p, nodeFxns);
            p.createEdges();
        }
    };

    // Nice, linear edge
    var Edge = Class.extend({

        init : function(start, end) {
            this.start = start;
            this.end = end;

            // Verify that the start and end points are valid
            if (!start || !start.isValid()) {
                console.log("Start:", start);
                throw ("Attempting to make an edge with invalid start");
            }
            if (!end || !end.isValid()) {
                console.log("End:", end);
                throw ("Attempting to make an edge with invalid end");
            }

            upgradeToNode(start);
            upgradeToNode(end);
            this.addToNodes();

            this.graph = start.graph;

            this.normal = new Vector();
            this.edge = new Vector();
            this.midpoint = new Vector();
            if (!this.start.isValid()) {
                throw ("Attempting to make edge with invalid start:" + start);
            }
            if (!this.end.isValid()) {
                throw ("Attempting to make edge with invalid end:" + end);
            }

            this.updatePosition();
        },

        copyHandles : function(original) {
            if (original.handles !== undefined) {
                this.makeHandles();
                this.handles[0].copy(original.handles[0]);
                this.handles[1].copy(original.handles[1]);
            }
        },

        makeHandles : function() {
            this.isCurve = true;
            if (this.handles === undefined) {
                this.handles = [new Handle(this, this.start, 0), new Handle(this, this.end, 1)];
            }
        },

        setHandles : function(r0, r1, theta0, theta1) {
            this.makeHandles();
            this.handles[0].set(r0, theta0);
            this.handles[1].set(r1, theta1);
        },

        //========================================
        //========================================
        //========================================
        // End node management

        setEnd : function(end) {

            this.end.removeInbound(this);
            this.end = end;

            this.end.addInbound(this);
            if (this.handles)
                this.handles[1].setNode(this, end);
        },
        setStart : function(start) {
            this.start.removeOutbound(this);
            this.start = start;
            this.start.addOutbound(this);
            if (this.handles)
                this.handles[0].setNode(this, start);
        },

        addToNodes : function() {
            this.start.addOutbound(this);
            this.end.addInbound(this);
        },

        removeFromNodes : function() {
            console.log("Remove from nodes")
            this.start.removeOutbound(this);
            this.end.removeInbound(this);
        },

        remove : function() {
            this.removeFromNodes();
            this.deleted = true;
        },

        //========================================
        //========================================
        //========================================
        // Intersections

        computeIntersection : function(edge) {
            var s = this.start.getOffsetTo(edge.start);
            var u = this.getOffset();
            var v = edge.getOffset();
            var m = (s.x / v.x - s.y / v.y) / (u.x / v.x - u.y / v.y);
            var n0 = (m * u.x - s.x) / v.x;
            var n1 = (m * u.y - s.y) / v.y;
            var p0 = Vector.addMultiples(edge.start, 1, v, n0);
            var p1 = Vector.addMultiples(this.start, 1, u, m);

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

        //========================================
        //========================================
        //========================================
        //

        reverse : function() {
            this.removeFromNodes();
            var tmp = this.end;
            this.end = this.start;
            this.start = tmp;
            this.addToNodes();
            this.updatePosition();
        },

        updatePosition : function() {
            this.edge.setToDifference(this.end, this.start);
            this.normal.setTo(this.edge.y, -this.edge.x);
            this.normal.normalize();
            this.setToTracer(this.midpoint, .5, 0);
            if (!this.normal.isValid())
                console.log(this.toString());

            if (this.handles) {
                $.each(this.handles, function(index, handle) {
                    handle.updatePosition();
                });

            }
        },

        getTracer : function(pct, offset) {
            var p = this.getSubdivisionPoint(pct);
            if (offset)
                p.addPolar(offset, p.rotation);
            return p;
        },

        setToTracer : function(p, pct, offset) {
            this.setToSubdivisionPoint(p, pct);

            if (offset)
                p.addPolar(offset, p.rotation);
        },

        //==============================================================================
        //==============================================================================
        //==============================================================================
        // External points

        getAngleTo : function(p) {
            var u = this.getOffset();
            var v = this.start.getOffsetTo(p);

            var theta = Math.acos(u.dot(v) / (u.magnitude() * v.magnitude()));
            return theta;
        },

        // Get which side p is on
        getSide : function(p) {
            var offset = this.getOffset();
            var val = (offset.x * (p.y - this.start.y) - offset.y * (p.x - this.start.x));
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

        followPath : function(context, callback) {

            if (context.edgeEndCondition && context.edgeEndCondition(this)) {
                if (callback)
                    callback(this);
            } else {

                if (context.onEdge)
                    context.onEdge(this);

                var next = this.end;
                next.followPath(context, callback);
            }
        },

        //==============================================================================
        //==============================================================================
        //==============================================================================
        //

        contains : function(p) {
            return this.start === p || this.end === p;
        },

        getOtherEnd : function(p) {
            if (p === this.start)
                return this.end;
            if (p === this.end)
                return this.start;
        },
        getOffset : function() {
            return this.start.getOffsetTo(this.end);
        },
        getAngle : function() {
            return this.start.getAngleTo(this.end);
        },

        //==============================================================================
        //==============================================================================
        //==============================================================================
        // Subdivision points

        getSubdivisions : function() {
            var end = new Vector(this.end);
            upgradeToNode(end);
            end.copyAngles(this.end);

            if (this.handles !== undefined) {
                var count = 3;
                var subdivisions = [];
                for (var i = 0; i < count; i++) {
                    var pct = (i + 1) / (count + 1);
                    var pt = this.getSubdivisionPoint(pct);
                    upgradeToNode(pt);
                    pt.setToSmooth(pt.rotation);
                    subdivisions.push(pt);
                }
                subdivisions.push(end);
                return subdivisions;
            } else {
                return [end];
            }
        },
        getAngleAt : function(t) {

            if (this.isCurve)
                return this.getSubdivisionTangent(t).getAngle() + Math.PI / 2;
            else
                return this.getAngle() - Math.PI / 2;
        },
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
            tangent.addMultiple(this.start, -3 * t0 * t0);
            tangent.addMultiple(c0, 3 * t0 * t0 - 6 * t0 * t1);
            tangent.addMultiple(c1, -3 * t1 * t1 + 6 * t0 * t1);
            tangent.addMultiple(this.end, 3 * t1 * t1);
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
                p.setTo(this.start.lerp(this.end, t));

                return p;
            }
            var c0 = this.handles[0];
            var c1 = this.handles[1];

            p.addMultiple(this.start, t0 * t0 * t0);
            p.addMultiple(c0, 3 * t0 * t0 * t1);
            p.addMultiple(c1, 3 * t1 * t1 * t0);
            p.addMultiple(this.end, t1 * t1 * t1);

            return p;
        },
        //==============================================================================
        //==============================================================================
        //==============================================================================
        // Outputs

        drawHandles : function(g) {
            if (this.handles) {
                this.handles[0].draw(g);
                this.handles[1].draw(g);
            }
        },
        draw : function(context) {
            var g = context.g;
            g.noFill();
            if (this.handles) {
                this.start.bezierTo(g, this.handles[0], this.handles[1], this.end);
            } else {
                if (context.useScreenPos)
                    this.start.screenPos.drawLineTo(g, this.end.screenPos);
                else
                    this.start.drawLineTo(g, this.end);

            }
        },
        drawVertex : function(g) {
            if (this.handles) {

                this.end.bezier(g, this.handles[0], this.handles[1]);
            } else {
                this.end.vertex(g);
            }

        },
        drawNormal : function(g) {
            this.midpoint.drawArrow(g, this.normal, 10);
        },
        toString : function() {
            return "[" + this.start + " to " + this.end + "]";
        },

        toIndexString : function() {
            return "[" + this.start.index + "-" + this.end.index + "]";
        }
    });

    var Handle = Vector.extend({
        init : function(edge, node, side) {
            this._super();
            this.edge = edge;
            this.node = node;
            this.side = side;
            this.angle = 0;
            this.radius = 0;
        },

        copy : function(original) {
            this.angle = original.angle;
            this.radius = original.radius;
            this.updatePosition();
        },

        setNode : function(edge, n) {
            this.node = n;
            this.edge = edge;
        },
        set : function(r, angle) {
            this.radius = r;
            this.angle = angle;
            this.updatePosition();
        },
        setFromPosition : function(p) {
            var offset = this.node.getOffsetTo(p);
            this.radius = offset.magnitude();
            this.angle = offset.getAngle() - Math.PI * this.side;
            this.updatePosition();
        },
        updatePosition : function() {
            this.theta = this.angle + Math.PI * this.side;
            this.setToPolarOffset(this.node, this.radius, this.theta);
        },

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

    Edge.upgradeToNode = upgradeToNode;
    return Edge;

});
