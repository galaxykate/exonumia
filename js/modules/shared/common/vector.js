/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["three", "inheritance", "box2D"], function(THREE, Inheritance, Box2D) {

    Vector = Class.extend({

        init : function(x, y, z) {
            // actually another vector, clone it
            if (x === undefined) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
            } else {
                if (x.x !== undefined) {
                    this.x = x.x;
                    this.y = x.y;
                    this.z = x.z;
                } else {
                    this.x = x;
                    this.y = y;

                    this.z = 0;
                    if (z !== undefined)
                        this.z = z;

                }
            }

            if (!this.isValid())
                throw new Error(this.invalidToString() + " is not a valid vector");
        },

        clone : function() {
            return new Vector(this);
        },

        cloneInto : function(v) {
            v.x = this.x;
            v.y = this.y;
            v.z = this.z;

        },

        addMultiple : function(v, m) {
            this.x += v.x * m;
            this.y += v.y * m;
            this.z += v.z * m;
        },
        addPolar : function(r, theta) {
            this.x += r * Math.cos(theta);
            this.y += r * Math.sin(theta);
        },

        addSpherical : function(r, theta, phi) {
            this.x += r * Math.cos(theta) * Math.cos(phi);
            this.y += r * Math.sin(theta) * Math.cos(phi);
            this.z += r * Math.sin(phi);
        },

        addRotated : function(v, theta) {
            var cs = Math.cos(theta);
            var sn = Math.sin(theta);
            var x = v.x * cs - v.y * sn;
            var y = v.x * sn + v.y * cs;
            this.x += x;
            this.y += y;
        },

        setToPolar : function(r, theta) {
            this.x = r * Math.cos(theta);
            this.y = r * Math.sin(theta);
        },
        setToCylindrical : function(r, theta, z) {
            this.x = r * Math.cos(theta);
            this.y = r * Math.sin(theta);
            this.z = z;
        },
        setToPolarOffset : function(v, r, theta) {
            this.x = v.x + r * Math.cos(theta);
            this.y = v.y + r * Math.sin(theta);
            this.z = v.z;
        },
        setToMultiple : function(v, m) {
            this.x = v.x * m;
            this.y = v.y * m;
            this.z = v.z * m;
        },
        setToLerp : function(v0, v1, m) {
            var m1 = 1 - m;
            this.x = v0.x * m1 + v1.x * m;
            this.y = v0.y * m1 + v1.y * m;
            this.z = v0.z * m1 + v1.z * m;
        },

        setToAddMultiple : function(v0, m0, v1, m1) {
            this.x = v0.x * m0 + v1.x * m1;
            this.y = v0.y * m0 + v1.y * m1;
            this.z = v0.z * m0 + v1.z * m1;
        },

        setToDifference : function(v0, v1) {
            this.x = v0.x - v1.x;
            this.y = v0.y - v1.y;
            this.z = v0.z - v1.z;
        },

        setTo : function(x, y, z) {
            // Just in case this was passed a vector
            if (x.x !== undefined) {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
                if (this.z === undefined)
                    this.z = 0;

            } else {
                this.x = x;
                this.y = y;
                if (z !== undefined)
                    this.z = z;
            }
            if (!this.isValid())
                throw new Error(this.invalidToString() + " is not a valid vector");

        },

        setScreenPosition : function(g) {
            if (this.screenPos === undefined)
                this.screenPos = new Vector();

            this.screenPos.setTo(g.screenX(this.x, this.y), g.screenY(this.x, this.y));
        },

        magnitude : function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },

        normalize : function() {
            this.div(this.magnitude());
        },

        constrainMagnitude : function(min, max) {
            var d = this.magnitude();
            if (d !== 0) {
                var d2 = utilities.constrain(d, min, max);
                this.mult(d2 / d);
            }
        },

        getDistanceTo : function(p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            var dz = this.z - p.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },

        getDistanceToIgnoreZ : function(p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;

            return Math.sqrt(dx * dx + dy * dy);
        },

        getAngleTo : function(p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            //var dz = this.z - p.z;
            return Math.atan2(dy, dx);
        },

        //===========================================================
        //===========================================================
        // Complex geometry

        dot : function(v) {
            return v.x * this.x + v.y * this.y + v.z * this.z;
        },

        getAngleBetween : function(v) {
            return Math.acos(this.dot(v) / (this.magnitude() * v.magnitude()));
        },

        isInTriangle : function(triangle) {

            //credit: http://www.blackpawn.com/texts/pointinpoly/default.html
            var ax = triangle[0].x;
            var ay = triangle[0].y;
            var bx = triangle[1].x;
            var by = triangle[1].y;
            var cx = triangle[2].x;
            var cy = triangle[2].y;

            var v0 = [cx - ax, cy - ay];
            var v1 = [bx - ax, by - ay];
            var v2 = [this.x - ax, this.y - ay];

            var dot00 = (v0[0] * v0[0]) + (v0[1] * v0[1]);
            var dot01 = (v0[0] * v1[0]) + (v0[1] * v1[1]);
            var dot02 = (v0[0] * v2[0]) + (v0[1] * v2[1]);
            var dot11 = (v1[0] * v1[0]) + (v1[1] * v1[1]);
            var dot12 = (v1[0] * v2[0]) + (v1[1] * v2[1]);

            var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);

            var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
            var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

            return ((u >= 0) && (v >= 0) && (u + v < 1));

        },

        isInPolygon : function(poly) {
            var pt = this;
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && ( c = !c);
            return c;
        },

        //===========================================================
        //===========================================================
        // Add and sub and mult and div functions

        add : function(v) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        },

        sub : function(v) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        },
        mult : function(m) {
            this.x *= m;
            this.y *= m;
            this.z *= m;
        },
        div : function(m) {
            this.x /= m;
            this.y /= m;
            this.z /= m;
        },
        getOffsetTo : function(v) {
            return new Vector(v.x - this.x, v.y - this.y, v.z - this.z);
        },
        getAngle : function() {
            return Math.atan2(this.y, this.x);
        },

        rotate : function(theta) {
            var cs = Math.cos(theta);
            var sn = Math.sin(theta);
            var x = this.x * cs - this.y * sn;
            var y = this.x * sn + this.y * cs;
            this.x = x;
            this.y = y;
        },

        //===========================================================
        //===========================================================

        // Lerp a vector!
        lerp : function(otherVector, percent) {
            var lerpVect = new Vector(utilities.lerp(this.x, otherVector.x, percent), utilities.lerp(this.y, otherVector.y, percent), utilities.lerp(this.z, otherVector.z, percent));
            return lerpVect;
        },

        //===========================================================
        //===========================================================
        isValid : function() {

            return (!isNaN(this.x) && !isNaN(this.y) && !isNaN(this.z) ) && this.x !== undefined && this.y !== undefined && this.z !== undefined;
        },

        //===========================================================
        //===========================================================
        translateTo : function(g) {
            g.translate(this.x, this.y);
        },

        //===========================================================
        //===========================================================

        bezier : function(g, c0, c1) {
            g.bezierVertex(c0.x, c0.y, c1.x, c1.y, this.x, this.y);
        },

        bezierTo : function(g, c0, c1, p) {
            g.bezier(this.x, this.y, c0.x, c0.y, c1.x, c1.y, p.x, p.y);
        },
        bezierWithRelativeControlPoints : function(g, p, c0, c1) {
            // "x" and "y" were not defined, so I added "this." in front. Hopefully that's the intended action (April)
            g.bezierVertex(p.x + c0.x, p.y + c0.y, this.x + c1.x, this.y + c1.y, this.x, this.y);
        },

        vertex : function(g) {
            g.vertex(this.x, this.y);
        },

        offsetVertex : function(g, offset, m) {
            if (m === undefined)
                m = 1;
            g.vertex(this.x + offset.x * m, this.y + offset.y * m);
        },

        drawCircle : function(g, radius) {
            g.ellipse(this.x, this.y, radius, radius);
        },

        drawLineTo : function(g, v) {
            g.line(this.x, this.y, v.x, v.y);
        },

        drawLerpedLineTo : function(g, v, startLerp, endLerp) {
            var dx = v.x - this.y;
            var dy = v.y - this.y;

            g.line(this.x + dx * startLerp, this.y + dy * startLerp, this.x + dx * endLerp, this.y + dy * endLerp);
        },

        drawArrow : function(g, v, m) {
            g.line(this.x, this.y, v.x * m + this.x, v.y * m + this.y);
        },

        drawAngle : function(g, r, theta) {
            g.line(this.x, this.y, r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y);
        },

        drawAngleBall : function(g, r, theta, radius) {
            g.ellipse(r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y, radius, radius);
        },

        drawArc : function(g, r, theta0, theta1) {
            var range = theta1 - theta0;
            var segments = Math.ceil(range / .2);
            for (var i = 0; i < segments + 1; i++) {
                var theta = theta0 + range * (i / segments);
                g.vertex(this.x + r * Math.cos(theta), this.y + r * Math.sin(theta));
            }
        },

        drawText : function(g, s, xOffset, yOffset) {
            g.text(s, this.x + xOffset, this.y + yOffset);
        },
        //===========================================================
        //===========================================================
        toThreeVector : function() {
            return new THREE.Vector3(this.x, this.y, this.z);
        },
        toSVG : function() {
            return Math.round(this.x) + " " + Math.round(this.y);
        },

        toB2D : function() {
            return new Box2D.b2Vec2(this.x, -this.y);
        },

        toCSSDimensions : function() {
            return {
                width : this.x + "px",
                height : this.y + "px",

            }
        },

        //===========================================================
        //===========================================================

        toString : function(precision) {
            if (precision === undefined)
                precision = 2;

            return "(" + this.x.toFixed(precision) + ", " + this.y.toFixed(precision) + ", " + this.z.toFixed(precision) + ")";
        },
        invalidToString : function() {

            return "(" + this.x + ", " + this.y + ", " + this.z + ")";
        },
    });

    // Class functions
    Vector.sub = function(a, b) {
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
    };

    Vector.dot = function(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    };

    Vector.polar = function(r, theta) {
        return new Vector(r * Math.cos(theta), r * Math.sin(theta));
    };

    Vector.angleBetween = function(a, b) {
        return Vector.dot(a, b) / (a.magnitude() * b.magnitude());
    };

    Vector.addMultiples = function(u, m, v, n) {
        var p = new Vector();
        p.addMultiple(u, m);
        p.addMultiple(v, n);
        return p;
    };

    Vector.average = function(array) { Vector
        avg = new Vector();
        $.each(array, function(index, v) {
            avg.add(v);
        });
        avg.div(array.length);
        return avg;
    };

    return Vector;

});
