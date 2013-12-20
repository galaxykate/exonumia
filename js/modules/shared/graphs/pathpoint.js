/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';
    var lerpRotation = function(start, end, pct, ccw, single) {
        var d = end - start;

        d = (d + Math.PI * 2) % (Math.PI * 2);
        return start + d * pct;
    };

    var pointCount = 0;

    var PathPoint = common.Transform.extend({
        init : function() {
            this._super();

            var pathPoint = this;
            var radius0 = 0;
            var radius1 = 0;
            this.rotation = 0;

            this.idNumber = pointCount;
            pointCount++;
            if (arguments.length == 5) {
                this.setTo(arguments[0], arguments[1]);
                this.rotation = arguments[4];
            }

            if (arguments.length === 1) {
                this.setTo(arguments[0]);
            }

            this.handles = [new Handle(this, radius0, 0), new Handle(this, radius1, 1)];

            this.subPoints = [this, this.handles[0], this.handles[1]];
            this.updateControlHandles();

        },

        //=============================================================
        //=============================================================
        //=============================================================
        //

        setAngle : function(theta) {
            this.rotation = theta;
            this.onPositionChange();
        },

        setControlPointToMirror : function(handle, p) {
            if (handle === 0)
                this.handles[0].setToMirror(this.handles[1]);
            if (handle === 1)
                this.handles[1].setToMirror(this.handles[0]);

        },

        setControlPointFromPosition : function(handle, p) {
            var offset = Vector.sub(p, this);
            this.setControlPointFromOffset(handle, offset);
        },

        setControlPointFromOffset : function(handle, offset) {

            this.handles[handle].setFromOffset(offset);
            this.updateControlHandles();
        },

        setHandles : function(theta, r0, r1) {
            this.rotation = theta;
            this.handles[0].controlRadius = r0;
            this.handles[1].controlRadius = r1;
            this.onPositionChange();
        },

        //=========================

        setAsDirty : function() {
            this.isDirty = true;
        },

        calculateSmoothness : function() {
            // Get the angle of the handles
            // If either handle has a length of 0, get the angle from the tangent

            //   this.handles[0].setToIfZero(this.previous.getSubdivisionTangent(1));
            var tangent0 = this.previous.getSubdivisionTangent(.999);
            var tangent1 = this.getSubdivisionTangent(.001);
            tangent0.mult(-1);
            this.handles[0].setToIfZero(tangent0);
            this.handles[1].setToIfZero(tangent1);

            this.angle = utilities.angleBetween(this.handles[0].theta, this.handles[1].theta);

            var theta = lerpRotation(this.handles[0].theta, this.handles[1].theta, .5);
            this.rotation = theta;
        },

        averageNormal : function() {

            var theta = lerpRotation(this.handles[0].theta, this.handles[1].theta, .5);

            this.rotation = theta;

        },

        getSubdivisionTangent : function(t) {
            t = utilities.constrain(t, .001, .999);
            var t0 = 1 - t;
            var t1 = t;
            var start = this;
            var end = this.next;
            var c0 = this.handles[1];
            var c1 = this.next.handles[0];

            var tangent = new Vector();
            tangent.addMultiple(start, -3 * t0 * t0);
            tangent.addMultiple(c0, 3 * t0 * t0 - 6 * t0 * t1);
            tangent.addMultiple(c1, -3 * t1 * t1 + 6 * t0 * t1);
            tangent.addMultiple(end, 3 * t1 * t1);
            tangent.normalize();
            if (!tangent.isValid()) {
                console.log(this.idNumber, tangent);
                console.log(t0 + " " + t1);
                console.log(start + " " + end);
                console.log(c0 + " " + c1);
            }
            return tangent;
        },

        getSubdivisionPoint : function(t) {
            var t0 = 1 - t;
            var t1 = t;
            var start = this;
            var end = this.next;
            var p = new Vector();
            var c0 = this.handles[1];
            var c1 = this.next.handles[0];

            p.addMultiple(start, t0 * t0 * t0);
            p.addMultiple(c0, 3 * t0 * t0 * t1);
            p.addMultiple(c1, 3 * t1 * t1 * t0);
            p.addMultiple(end, t1 * t1 * t1);

            p.tangent = this.getSubdivisionTangent(t);
            p.rotation = p.tangent.getAngle() + Math.PI / 2;

            return p;
        },

        update : function(time) {
            this.excitement = Math.max(0, this.excitement - 1.5 * time.ellapsed);
        },

        onPositionChange : function() {

            this.updateControlHandles();
            this.setAsDirty();
        },

        makeCurveVertex : function(g) {
            var c0 = this.handles[1];
            var c1 = this.next.handles[0];

            g.bezierVertex(c0.x, c0.y, c1.x, c1.y, this.next.x, this.next.y);
            //    g.vertex(c0.x, c0.y);
            //  g.vertex(c1.x, c1.y);
            //  g.vertex(this.x, this.y);
        },

        updateControlHandles : function() {

            this.handles[0].update();
            this.handles[1].update();

        },

        drawPoints : function(context) {
            var g = context.g;
            // Draw the control points

            if (context.drawControlPoints) {
                g.stroke(0);
                g.fill(.3, 1, 1);
                this.handles[0].drawCircle(g, 5);
                g.fill(.8, 1, 1);
                this.handles[1].drawCircle(g, 5);

                g.stroke(0);
                g.strokeWeight(1);
                this.drawLineTo(g, this.handles[0]);
                this.drawLineTo(g, this.handles[1]);

            }

            var r = 3;
            this.drawCircle(g, r);
            g.fill(0);
            g.text(this.command + " " + this.idNumber + " " + this.angle, this.x + 3, this.y - 10);

            // Draw the rotation
            g.stroke(0);
            g.strokeWeight(1);
            //   this.drawAngle(g, 20, this.rotation);
        },

        render : function(context) {
            var g = context.g;

            // Draw the control points

            g.stroke(0);
            g.fill(.3, 1, 1);
            this.handles[0].drawCircle(g, 5);
            g.fill(.8, 1, 1);
            this.handles[1].drawCircle(g, 5);

            if (this.excitement > 0) {
                var r2 = 10 + 20 * this.excitement;
                g.fill(1, 0, 1, .9)
                this.drawCircle(g, r2);
            }

            g.fill(0);
            g.noStroke();
            if (this.active) {
                g.fill(.8, 1, 1);
            }

            var r = 4;
            this.drawCircle(g, r);

        },
    });

    var Handle = Vector.extend({
        init : function(parent, controlRadius, side) {
            this._super(0, 0);

            this.parent = parent;
            this.controlRadius = controlRadius;
            this.side = side;
            this.theta = 0;
        },

        setToIfZero : function(tangent) {
            if (this.controlRadius < 1) {
                this.setFromOffset(tangent);
                this.controlRadius = 20;
            }
        },

        update : function() {
            if (this.theta === undefined)
                this.setToPolarOffset(this.parent, this.controlRadius, this.parent.rotation + Math.PI * this.side);
            else
                this.setToPolarOffset(this.parent, this.controlRadius, this.theta + Math.PI * this.side);
        },

        setToMirror : function(handle) {
            this.theta = handle.theta;
            this.controlRadius = handle.controlRadius;
        },

        setFromOffset : function(offset) {
            this.controlRadius = offset.magnitude();
            this.theta = offset.getAngle() - Math.PI * this.side;
        },

        moveTo : function(pos) {

            var offset = this.parent.getOffsetTo(pos);
            this.parent.rotation = offset.getAngle() + this.side * Math.PI;
            this.controlRadius = offset.magnitude();
            this.parent.updateControlHandles();
            this.parent.setAsDirty();

        },

        toString : function() {
            return "Handle" + this.side + this._super();
        },
    });

    //PathPoint.Handle = Handle;
    return PathPoint;
});
