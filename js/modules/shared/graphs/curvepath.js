/**
 * @author Kate Compton
 */
define(["common", "./pathpoint", "./linepath", "./pathtracer"], function(common, PathPoint, LinePath, PathTracer) {'use strict';

    var arrayToString = function(array) {
        var s = "[";
        $.each(array, function(index) {
            if (index > 0)
                s += ",";
            s += this;
        });
        s += "]";
        return s;
    };

    var commandLengths = {
        C : 3,
        S : 2,
        L : 1,
        Z : 1,
        M : 1,
    };

    var parseIntoVectors = function(data) {
        //var sections = data.split(" ");
        var sections = data.split(/[ ,]+/);
        var index = 0;
        var vectors = [];
        while (index < sections.length) {
            var subsections = sections[index].split(",");

            var v;
            if (subsections.length === 2) {

                v = new Vector(parseFloat(subsections[0]), parseFloat(subsections[1]));
            } else {
                v = new Vector(parseFloat(sections[index]), parseFloat(sections[index + 1]));
                index++;
            }

            vectors.push(v);

            index++;
        }
        return vectors;

    };

    var Path = LinePath.extend({
        init : function() {
            this._super();

            this.curveSubdivisions = 3;
        },

        addSVG : function(svg) {
            var path = this;
            // Parse the svg
            var tokens = svg.split(" ");
            var index = 0;

            // Regex from "http://stackoverflow.com/questions/4681800/regex-to-match-svg-path-data-in-javascript"
            var pathSegmentPattern = /[a-z][^a-z]*/ig;
            var pathSegments = svg.match(pathSegmentPattern);
            var last = new Vector();

            var point;
            if (pathSegments === null) {

            } else {
                $.each(pathSegments, function(index, segment) {

                    var command = segment.charAt(0);
                    var data = segment.slice(1);
                    data = data.replace(/-/g, ',-');
                    data = data.replace(/,,/g, ',');
                    data = data.replace(/\s,/g, ',');
                    data = data.replace(/,/g, ' ');
                    if (data.charAt(0) === ",")
                        data = data.slice(1);
                    data = data.trim();
                    var vectors = parseIntoVectors(data);

                    var isRelative = (command === command.toLowerCase());

                    var commandType = command.toUpperCase();
                    var commandLength = commandLengths[commandType];

                    $.each(vectors, function(index, v) {
                        // path.testPoints.push(v);
                    });

                    var count = vectors.length / commandLength;
                    console.log(commandType + " " + data);

                    for (var i = 0; i < count; i++) {
                        var index = i * commandLength;

                        if (isRelative) {

                            for (var j = 0; j < commandLength; j++) {
                                vectors[j + index].add(last);
                            }
                        }

                        switch(commandType) {

                            case "M":
                                point = new PathPoint(vectors[index]);
                                path.addPoint(point);
                                break;

                            case "L":
                                point = new PathPoint(vectors[index]);

                                path.addPoint(point);
                                break;

                            case "C":

                                point.setControlPointFromPosition(1, vectors[index]);

                                point = new PathPoint(vectors[index + 2]);
                                path.addPoint(point);
                                point.setControlPointFromPosition(0, vectors[index + 1]);

                                break;

                            case  "S":

                                point.setControlPointToMirror(1, vectors[index]);

                                point = new PathPoint(vectors[index + 1]);
                                path.addPoint(point);
                                point.setControlPointFromPosition(0, vectors[index]);

                                break;

                        };

                        if (point !== undefined) {
                            point.command = command;
                            last.setTo(point);
                        }
                    }

                });

            }

            //  this.addTestShape(10);

            var ptOutput = "";
            $.each(this.points, function(index, pt) {
                ptOutput += pt.command + " " + utilities.inSquareBrackets(Math.round(pt.x) + "," + Math.round(pt.y));
            });

            this.mergePoints();
            this.calculateSmoothness();
            this.calculateBoundingBox();
        },

        mergePoints : function() {
            console.log(this.toString());
            var mergeDist = 1;
            var newPath = [];
            $.each(this.points, function(index, pt) {
                if (pt.previous === undefined || pt.getDistanceTo(pt.previous) > mergeDist) {
                    newPath.push(pt);
                } else {
                    console.log("Merging in " + pt);
                    // Merge this with the previous point
                    pt.previous.next = pt.next;
                    pt.next.previous = pt.previous;
                    
                }

            });

            this.points = newPath;
        },

        calculateSmoothness : function() {
            $.each(this.points, function(index, pt) {
                pt.calculateSmoothness();
            })
        },

        addTestShape : function(count) {

            for (var i = 0; i < count; i++) {
                var r = 90 + Math.random() * 90;
                var theta = i * Math.PI * 2 / count;
                var p = new PathPoint(r * Math.cos(theta), r * Math.sin(theta), 20, 20, theta - Math.PI / 2);
                this.addPoint(p);
            }
        },

        generateOffsetVectors : function(subdivisions, offset, level) {
            var vectors = [];
            $.each(this.points, function(index, pt) {
                for (var i = 0; i < subdivisions + 1; i++) {
                    var pct = i / subdivisions;
                    var p = pt.getSubdivisionPoint(pct);
                    var theta = p.tangent.getAngle() - Math.PI / 2;
                    p.addPolar(offset, theta);
                    p.level = level;
                    vectors.push(p);
                }
            });
            return vectors;
        },

        createLinePath : function(subdivisions) {
            var path = new LinePath();
            $.each(this.points, function(index, pt) {
                for (var i = 0; i < subdivisions + 1; i++) {
                    var pct = (i) / subdivisions;
                    var p = pt.getSubdivisionPoint(pct);
                    p.level = 0;
                    p.sharp = true;
                    path.addPoint(p);

                }
            });
            return path;
        },

        createVertices : function(subdivisions) {
            var path = [];
            $.each(this.points, function(index, pt) {
                for (var i = 0; i < subdivisions; i++) {
                    var pct = (i + .5) / subdivisions;
                    var p = pt.getSubdivisionPoint(pct);
                    p.level = 0;

                    path.push(p);

                }
            });
            return path;
        },

        smoothNormals : function(g) {
            var path = this;
            var v0 = new Vector();
            var v1 = new Vector();
            var mid0 = new Vector();
            var mid1 = new Vector();
            var d = new Vector();
            var q = new Vector();
            if (this.points.length > 1) {
                $.each(this.points, function(index, point) {
                    var previous = path.getPoint(index - 1);
                    var next = path.getPoint(index + 1);

                    mid0.setToLerp(previous, point, .5);
                    mid1.setToLerp(next, point, .5);
                    var pct = mid1.magnitude() / (mid1.magnitude() + mid0.magnitude());
                    q.setToLerp(mid0, mid1, pct);

                    d.setToDifference(mid1, mid0);
                    var dLength = d.magnitude() * 1;
                    var theta = d.getAngle() + Math.PI;

                    v0.setToDifference(point, previous);
                    v1.setToDifference(point, next);
                    v0.normalize();
                    v1.normalize();
                    v0.add(v1);
                    point.handles[0].theta !== undefined
                    theta = v0.getAngle() - Math.PI / 2;

                    point.setHandles(theta, (pct) * dLength, (1 - pct) * dLength);

                    /*
                     g.strokeWeight(1);
                     g.stroke(.4, 1, 1);
                     mid0.drawLineTo(g, mid1);
                     g.stroke(.15, 1, .8);
                     previous.drawLineTo(g, point);

                     g.noStroke();
                     g.fill(.4, 1, 1);
                     q.drawCircle(g, 5);
                     */

                });
            }
        },

        update : function(time) {
            $.each(this.points, function(index, point) {
                point.update(time);
            });

            // Is any point dirty?  Update the geomety
            var isDirty = false;
            $.each(this.points, function(index, point) {
                if (point.isDirty) {
                    console.log("Dirty point!");
                    point.isDirty = false;
                    isDirty = true;
                }
            });
            if (isDirty) {
                if (this.simplified && this.mesh)
                    this.simplified.setMeshFromPoints();

            }

        },

        createThreeMesh : function(context) {
            this.simplified = this.createLinePath(3);
            return this.simplified.createThreeMesh(context);

        },

        drawPath : function(context) {
            var g = context.g;
            if (this.points.length > 0) {
                g.stroke((this.idNumber * .692 + .67) % 1, 1, 1, .5);
                g.fill((this.idNumber * .692 + .67) % 1, 1, .4, .3);
                g.beginShape();
                this.points[0].vertex(g);
                $.each(this.points, function(index, point) {
                    point.makeCurveVertex(g);
                })

                g.endShape();
            }
        },
    });

    Path.Point = PathPoint;
    Path.Tracer = PathTracer;

    return Path;

});
