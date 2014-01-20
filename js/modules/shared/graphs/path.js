/**
 * @author Kate Compton
 */
define(["common", "./edge", "threeUtils", "./graph"], function(common, Edge, threeUtils, Graph) {'use strict';

    var getAbsoluteAngle = function(theta) {
        return (Math.abs(theta) % (Math.PI * 2));
    };

    var setMeshFromPoints = function(pathContext) {

        var nodes = pathContext.nodes;
        var geo = pathContext.geometry;
        geo.modSideVertices(function(v, context) {

            var pt = nodes[context.side];

            var z = pathContext.height * context.lengthPct - pathContext.height / 2;
            if (isNaN(z)) {
                throw "Cannot set mesh from points: height is unset: " + pathContext.height;
            }

            context.pt = pt;
            var pt = nodes[context.side];
            v.setTo(pt.x, pt.y, z);

            if (pathContext.scale)
                v.mult(pathContext.scale);

            if (pathContext.offset)
                v.add(pathContext.offset);

        });

        geo.modTopVertices(function(v, context) {
            var pt = nodes[context.side];

            var h = pathContext.height;
            var z = -h / 2 + h * 1 + 5 * Math.sin(context.radiusPct * Math.PI);
            var outPct = 1 - .3 * (1 - context.radiusPct);
            v.setTo(pt.x * outPct, pt.y * outPct, z);

            if (pathContext.scale)
                v.mult(pathContext.scale);
            if (pathContext.offset)
                v.add(pathContext.offset);

        });
    };

    // A sequence of edges on a graph
    var Path = Graph.extend({
        init : function(name, graph) {
            this._super(name);
            this.closed = false;
            this.graph = graph;

        },

        getFirstNode : function() {
            return this.nodes[0];
        },

        close : function() {
            var edge = new Edge(this.nodes[this.nodes.length - 1], this.nodes[0]);
            this.addEdge(edge);
            this.closed = true;
        },

        loft : function() {
            console.log("Loft " + this);
            this.contours = [];
            var basePath = this.createLinearApproximation();
            var layers = 1;
            this.contours.push(basePath);
            for (var i = 0; i < layers; i++) {
                var offsetAmt = -(i + 1) * 45;
                var contour = basePath.createOffsetPath(i, offsetAmt);
                this.contours.push(contour);
                this.paths.push(contour);
            }
        },

        createLinearApproximation : function() {
            var path = new Path("Approx of " + this.name);

            // Copy the start and upgrade it to a node
            var start = new Vector(this.nodes[0]);
            Edge.upgradeToNode(start);
            start.copyAngles(this.nodes[0]);
            path.addNode(start);

            $.each(this.edges, function(index, edge) {

                // how many times should we split this edge to get a good approximation? Dunno.
                var subdivisions = edge.getSubdivisions();

                $.each(subdivisions, function(index, pt) {
                    path.addEdgeTo(pt);
                });

            });
            path.finish();
            return path;
        },

        // Create a new path
        createOffsetPath : function(index, offsetAmt) {
            var path = new Path("Contour" + index);
            path.importGraph(this);
            path.verify();

            // Move all the nodes correctly, the edges will follow
            $.each(this.nodes, function(index, pt) {
                // In a path, each pt has at most one inbound and one outbound edge

                var theta = pt.normalAngle;
                var amt = offsetAmt;
                if (!pt.isSmooth) {
                    var delta = getAbsoluteAngle(pt.dTheta);
                    amt = offsetAmt / Math.sin(delta / 2);
                }
                path.nodes[index].addPolar(amt, theta);

            });
            path.splitAtIntersections();

            return path;
        },
        splitAtIntersections : function() {
            console.log("Split at intersections")
            var intersections = this.findIntersections();
            this.splitAtIntersection(intersections[0]);

        },

        getHull : function() {
            return this.nodes;
        },

        // Split into two paths
        splitAtIntersection : function(intersection) {
            // Split this graph into two at the intersection
            var edge0 = intersection.edges[0];
            var edge1 = intersection.edges[1];
            var count = 0;

            var hueStart = 0;

            var start0 = edge0.start;
            var end0 = edge0.end;

            var start1 = edge1.start;
            var end1 = edge1.end;
            // shortcutting segments
            var segment0 = [edge0.start, new Vector(intersection.position), edge1.end];
            var segment1 = [edge1.start, new Vector(intersection.position), edge0.end];

            // Build a new graph by follw
            var loop0 = new Path("splitLoop");
            var loop1 = new Path("splitLoop");

            edge0.end.getSubpath({
                graph : loop0,

                edgeEndCondition : function(edge) {
                    return edge === edge1;
                }
            });

            var loop1 = edge1.end.getSubpath({
                graph : loop1,

                edgeEndCondition : function(edge) {
                    return edge === edge1;
                }
            });

            var count = 0;
            loop0.getFirstNode().followLoop({
                onEdge : function(edge) {
                    //  edge.testColor = new common.KColor(.3 + .01 * count, 1, 1);
                    count++;
                }
            });

            // Cut out the intersecting edges
            edge0.removeFromNodes();
            edge1.removeFromNodes();
         
            loop0.spliceIn(segment0);
            loop1.spliceIn(segment1);

            this.clear();
            loop0.makeAllTouchable();
            loop1.makeAllTouchable();
            this.addPath(loop0);
            this.addPath(loop1);

        },

        buildPath : function() {

            // order the edges
            var nodesInOrder = [];
            var edgesInOrder = [];

            if (this.edges.length > 0) {

                var start = this.edges[0].start;

                var currentEdge = this.edges[0];
                var currentNode = start;

                var s = this.edges.reduce(function(s, edge) {
                    return s + edge.toIndexString();
                }, "");
            
                while (nodesInOrder.length < this.edges.length && currentEdge) {
                    nodesInOrder.push(currentNode);

                    var previousNode = currentNode;
                    currentNode = currentEdge.getOtherEnd(currentNode);
                    if (!currentNode)
                        throw ("current node undefined: attempted to get other end of " + currentEdge.toIndexString() + " from " + previousNode.index );

                    // find an edge that starts with "current"
                    var nextEdges = $.grep(this.edges, function(edge) {
                        return edge.contains(currentNode) && edge !== currentEdge;
                    });

                    if (nextEdges.length > 1) {
                        throw ("Not a simple path! " + nextEdges.length + " edges found from " + currentNode + ": " + s);
                    }

                    if (nextEdges.length === 0) {

                        console.log(nodesInOrder.length + ": No edges contain " + currentNode.index + ", must be the end, only used " + nodesInOrder.length + " of " + this.edges.length);
                        currentEdge = undefined;
                    } else {

                        edgesInOrder.push(currentEdge);
                        currentEdge = nextEdges[0];

                    }

                }

                var s = edgesInOrder.reduce(function(s, edge) {
                    return s + edge.toIndexString();
                }, "");
          
                this.nodesInOrder = nodesInOrder;
            } else
                console.log("Build path with 0 edges??");

        },

        addEdgeTo : function(pt) {
            var edge;
            // Make an edge
            var last = this.nodes[this.nodes.length - 1];

            this.addNode(pt);
            if (last !== undefined) {
                edge = new Edge(last, pt);
                this.addEdge(edge);
            } else {
                //      console.log("Can't make an edge with no pre-existing nodes " + this.nodes.length);
            }

            return edge;
        },

        createPoints : function(subdivisions) {
            var pts = [];
            $.each(this.edges, function(index, edge) {
                for (var i = 0; i < subdivisions; i++) {
                    var pt = edge.getSubdivisionPoint(i / subdivisions);
                    pts.push(pt);
                }
            });
            return pts;
        },

        // Add a chain of edges from the first node in the list,
        //    passing through the middle ones, and ending at the last one
        spliceIn : function(edges) {

        },

        createThreeMesh : function(context) {
            this.finish();
            this.meshPoints = this.createPoints(3);
            context.nodes = this.meshPoints;

            this.geometry = new threeUtils.ModGeo.Cylinder(this.meshPoints.length, context.rings, context.capRings);
            context.geometry = this.geometry;
            this.mesh = this.geometry.createMesh();

            setMeshFromPoints(context);
            return this.mesh;

        },

        drawFilled : function(context) {
            var g = context.g;
            if (this.edges.length > 0) {
                g.beginShape();
                this.edges[0].start.vertex(g);
                var g = context.g;
                $.each(this.edges, function(index, edge) {
                    edge.drawVertex(g);
                });
                g.endShape();

            }
        },
    });

    return Path;

});
