/**
 * @author Kate Compton
 */
define(["common", "threeUtils"], function(common, threeUtils) {'use strict';
    var pathCount = 0;

    // Wrapper around an array of vertices
    var LinePath = Class.extend({
        init : function() {
            this.idNumber = pathCount;
            pathCount++;
            this.points = [];
            this.testPoints = [];
        },

        averageNormals : function() {

            $.each(this.points, function(index, point) {
                point.averageNormal();
            });
        },
        //==================================================================
        //==================================================================
        //==================================================================
        //==================================================================
        // Point accessors
        addPoint : function(pt) {
            var last = this.points[this.points.length - 1];
            this.points.push(pt);
            if (last !== undefined) {
                last.next = pt;
                pt.previous = last;
            }

            // Close the path
            pt.next = this.points[0];
            this.points[0].previous = pt;
        },

        // Pattern for getAt: query contains a filter for what objects it wants, and a minDistance
        // If something valid is found closer than found.closestDist, closestDist is set to the distance
        // Found = {closest: obj, closestDist: #}
        getAt : function(query, found) {
            var closest = undefined;

            $.each(this.points, function(index, point) {
                point.getAt(query, found);
            });

            return query;
        },

        // Get the point at this index, wrapped around
        getPoint : function(index) {
            var i = index % this.points.length;
            if (i < 0)
                i += this.points.length;
            return this.points[i];
        },

        getLastPoint : function() {
            return this.points[this.points.length - 1];
        },

        //==================================================================
        //==================================================================
        //==================================================================
        //==================================================================
        // Drawing and output

        calculateBoundingBox : function() {
            var r = new common.Rect(new Vector(this.points[0]), new Vector());
            $.each(this.points, function(index, pt) {
                r.stretchToContainPoint(pt);
            });

            this.boundingBox = r;
        },

        createThreeMesh : function(context) {

            this.geometry = new threeUtils.ModGeo.Cylinder(this.points.length, context.rings, context.capRings);

            this.mesh = this.geometry.createMesh();
            this.setMeshFromPoints(context);
            return this.mesh;

        },

        transform : function(offset, scale, rotate) {
            $.each(this.points, function(index, pt) {
                pt.add(offset);
                pt.mult(scale);
                pt.rotate(rotate);
                if (pt.handles !== undefined) {
                    pt.handles[0].controlRadius *= scale;
                    pt.handles[1].controlRadius *= scale;
                }
                pt.updateControlHandles();
            });
        },

        setMeshFromPoints : function(pathContext) {

            var path = this;
            this.geometry.modSideVertices(function(v, context) {

                var pt = path.points[context.side];

                var z = pathContext.height * context.lengthPct - pathContext.height / 2;
                //  v.setToCylindrical(r, theta, z);
                context.pt = pt;

                var pt = path.points[context.side];
                //  v.setToCylindrical(r, theta, z);
                v.setTo(pt.x, pt.y, z);

                if (pathContext.scale)
                    v.mult(pathContext.scale);

                if (pathContext.offset)
                    v.add(pathContext.offset);

            });

            this.geometry.modTopVertices(function(v, context) {
                var pt = path.points[context.side];

                var h = pathContext.height;
                var z = -h / 2 + h * 1 + 5 * Math.sin(context.radiusPct * Math.PI);
                var outPct = 1 - .3 * (1 - context.radiusPct);
                v.setTo(pt.x * outPct, pt.y * outPct, z);

                if (pathContext.scale)
                    v.mult(pathContext.scale);
                if (pathContext.offset)
                    v.add(pathContext.offset);

            });
        },

        draw : function(context) {
            var g = context.g;
            if (context.drawPath) {
                this.drawPath(context);
            }
            if (context.drawPoints) {
                $.each(this.points, function(index, point) {
                    point.drawPoints(context);
                });
            }

        },

        drawPath : function(context) {
            var g = context.g;
            if (this.points.length > 0) {
                g.stroke((this.idNumber * .692 + .67) % 1, 1, .5);
                g.fill((this.idNumber * .692 + .67) % 1, .4, 1);
                g.beginShape();
                this.points[0].vertex(g);

                $.each(this.points, function(index, point) {

                    point.vertex(g);
                })

                g.endShape();
            }
        },

        toString : function() {
            var s = "";
            $.each(this.points, function(index, point) {
                if (index > 0)
                    s += ",";

                s += utilities.inSquareBrackets(Math.round(point.x) + "," + Math.round(point.y));
            });

            return s;
        },
    });

    return LinePath;
});
