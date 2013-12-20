/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["common", "./edge"], function(common, Edge) {
    var regionCount = 0;
    var Region = Class.extend({

        init : function(center) {
            this.idNumber = regionCount;
            regionCount++;
            this.center = center;
            this.points = [];
            this.paths = [];
            this.valid = true;
        },

        addPath : function(edge) {
            this.paths.push(edge);
        },

        select : function() {
            this.selected = true;
        },

        getRandomEdge : function() {
            var index = Math.floor(Math.random() * this.points.length);
            var index2 = (index + 1) % this.points.length;
            return new Edge(this.points[index], this.points[index2]);
        },

        getTriangleAt : function(p, useScreenPos) {
            var found;
            if (this.triangles) {
                $.each(this.triangles, function(index, triangle) {
                    if (triangle.contains(p, useScreenPos)) {
                        found = triangle;
                    }
                });
            }
            return found;
        },
        deselect : function() {
            this.selected = false;
        },
        addPoint : function(p) {
            this.points.push(p);
        },
        createTriangles : function() {
            this.triangles = [];
            for (var i = 0; i < this.points.length; i++) {
                this.triangles.push(new Region.Triangle(this.center, this.points[i], this.points[(i + 1) % this.points.length]));
            }
        },

        setScreenPositions : function(context) {

            this.valid = true;
            context.view.setScreenPos(this.center);
            $.each(this.points, function(index, pt) {
                var vValid = context.view.setScreenPos(pt);
                if (!vValid)
                    this.valid = false;
            })
        },

        setMode : function(mode) {
            this.mode = mode;
            this.active = true;
        },
        renderAsPoint : function(context, radius) {
            var g = context.g;
            var h = this.getHue();

            context.view.setScreenPos(this.center);
            if (this.active) {

                if (this.visited)
                    g.fill(.55, .9, 1);
                if (this.isOpen)
                    g.fill(.4, .4, 1);
                if (this.mode === 0)
                    g.fill(0, 0, 0);
                if (this.mode === 1)
                    g.fill(0, 0, 1);

                g.noStroke();

                this.center.screenPos.drawCircle(g, radius * this.center.screenScale + 10);
            }

            g.fill(h, .3, 1);
            g.stroke(h, 1, .4);

            this.center.screenPos.drawCircle(g, radius * this.center.screenScale);
            g.fill(0);
            g.text(this.idNumber, -7 + this.center.screenPos.x, 5 + this.center.screenPos.y);
        },
        getHue : function() {
            var h = (this.idNumber * .2913 + .12) % 1;
            return h;
        },

        render : function(context) {

            var g = context.g;

            if (context.useScreenPos) {
                this.setScreenPositions(context);
                g.beginShape();
                $.each(this.points, function(index, pt) {
                    pt.screenPos.vertex(g);
                });
                g.endShape();
            } else {

                g.pushMatrix();
                this.center.translateTo(g);

                g.beginShape();
                $.each(this.points, function(index, pt) {
                    pt.vertex(g);
                });

                g.endShape(g.CLOSE);

                g.popMatrix();
            }
        },

        toString : function() {
            return "Region" + this.idNumber;
        }
    });

    var Triangle = Region.extend({

        init : function(p0, p1, p2) {

            this._super(p0);
            this.addPoint(p0);
            this.addPoint(p1);
            this.addPoint(p2);
        },

        addPoint : function(p) {
            this.points.push(p);
            p.screenPos = new Vector();
        },

        setPoints : function(p0, p1, p2) {
            this.addPoint.push(p0);
            this.addPoint.push(p1);
            this.addPoint.push(p2);
        },

        render : function(context) {

            var g = context.g;

            g.beginShape();
            $.each(this.points, function(index, pt) {
                if (context.useScreenPos) {
                    pt.screenPos.vertex(g);
                } else {
                    pt.vertex(g);
                }
            });
            g.endShape(g.CLOSE);

        },

        contains : function(p, useScreenPos) {

            if (p.getDistanceTo(this.center.screenPos) < 20)
                return true;
            // From http://www.blackpawn.com/texts/pointinpoly/
            // Compute vectors
            var a = this.points[0];
            var b = this.points[1];
            var c = this.points[2];

            if (useScreenPos) {
                a = a.screenPos;
                b = b.screenPos;
                c = c.screenPos;

            }

            var v0 = Vector.sub(c, a);
            var v1 = Vector.sub(b, a);
            var v2 = Vector.sub(p, a);

            // Compute dot products
            var dot00 = Vector.dot(v0, v0);
            var dot01 = Vector.dot(v0, v1);
            var dot02 = Vector.dot(v0, v2);
            var dot11 = Vector.dot(v1, v1);
            var dot12 = Vector.dot(v1, v2);

            // Compute barycentric coordinates
            var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
            var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
            var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

            // Check if point is in triangle
            return (u >= 0) && (v >= 0) && (u + v < 1)
        },
    });

    Region.makeRectangle = function(center, w, h) {
        var rect = new Region(center);
        rect.addPoint(new Vector(-w / 2, h / 2));
        rect.addPoint(new Vector(w / 2, h / 2));
        rect.addPoint(new Vector(w / 2, -h / 2));
        rect.addPoint(new Vector(-w / 2, -h / 2));
        return rect;
    };

    Region.Triangle = Triangle;
    return Region;

});
