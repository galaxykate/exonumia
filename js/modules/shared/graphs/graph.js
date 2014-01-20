/**
 * @author Kate Compton
 */
define(["common", "./edge", "threeUtils"], function(common, Edge, threeUtils) {'use strict';

    var touchableFxns = {
        select : function() {
            this.selected = true;
        },
        deselect : function() {
            this.selected = false;
        },
    };

    var upgradeToTouchable = function(p) {
        p.touchable = true;
        _.extend(p, touchableFxns);
    };

    // Rad hack from: http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-nodes-are-in-clockwise-order
    // "Sum over the edges, (x2-x1)(y2+y1).
    //  If the result is positive the curve is clockwise, if it's negative the curve is counter-clockwise.
    // (The result is twice the enclosed area, with a +/- convention.)"

    var calculatePathArea = function(cycle) {
        var total = 0;
        $.each(cycle, function(index, edge) {
            total += (edge.end.x - edge.start.x) / (edge.end.y + edge.start.y);
        });

        return total / 2;
    };

    var graphCount = 0;

    // A graph is a collection of edges
    var Graph = Class.extend({
        init : function(name) {
            this.name = name;
            this.idNumber = graphCount;
            graphCount++;

            this.clear();

            this.testPoints = [];
            this.boundingBox = new common.Rect();
            this.transform = new common.Transform();
        },

        clear : function() {
            this.edges = [];
            this.nodes = [];
            this.paths = [];
        },

        loftPaths : function() {
            console.log("Loft " + this);
            if (this.paths !== undefined) {
                $.each(this.paths, function(index, path) {
                    path.loft();
                });
            }

        },

        // Min box to hold all nodes and their control nodes
        expandBoxToFit : function(box) {

            if (this.paths !== undefined) {
                $.each(this.paths, function(index, path) {
                    path.expandBoxToFit(box);
                });
            }

            $.each(this.nodes, function(index, pt) {
                box.stretchToContainPoint(pt);
            });
        },

        addPath : function(path) {
            path.finish();

            this.paths.push(path);
            //  path.debugOutput();
        },

        getRandomEdge : function() {
            return this.edges[Math.floor(Math.random() * this.edges.length)];
        },

        getRandomNode : function() {
            return this.nodes[Math.floor(Math.random() * this.nodes.length)];
        },

        findClosest : function(query) {

            var localTarget = new Vector(query.target);
            this.transform.toLocal(query.target, localTarget);
            if (query.closest === undefined) {
                query.closest = {
                    d : query.minDistance,
                    obj : undefined,
                };
            }

            $.each(this.nodes, function(index, node) {
                if (query.filter === undefined || query.filter(node)) {
                    var d = node.getDistanceTo(localTarget);

                    if (d < query.closest.d) {
                        query.closest.d = d;
                        query.closest.obj = node;
                    }
                }
            });

            if (this.paths) {

                query.target = localTarget;
                $.each(this.paths, function(index, path) {
                    path.findClosest(query);

                });
            }

            return query.closest;
        },

        //======================================================
        //======================================================
        //======================================================
        //======================================================
        // Post-creation

        finish : function() {
            this.setIndices();
            this.verify();
            this.calculateAngles();
        },

        findIntersections : function() {
            var count = this.edges.length;
            var intersections = [];
            for (var i = 0; i < count; i++) {
                var u = this.edges[i];
                for (var j = i + 2; j < count; j++) {
                    var v = this.edges[j];
                    var intersection = u.computeIntersection(v);
                    if (intersection.onEdges()) {
                        this.testPoints.push(intersection.position);
                        intersections.push(intersection);
                    }
                }
            }
            return intersections;
        },

        // Test that all the nodes are valid and all the edges are correct
        verify : function(consoleOutput) {
            if (consoleOutput)
                console.log("Verify " + this);
            var graph = this;
            $.each(this.nodes, function(index, pt) {
                if (!pt.isValid()) {
                    throw ("Point " + index + " of " + graph + " is invalid: " + pt);
                }
            });

            var s = "";
            $.each(this.edges, function(index, edge) {
                // Are all the edges in a loop?
                s += " " + edge.start.graphIndex + " " + edge + " " + edge.end.graphIndex;
            });
            if (consoleOutput)
                console.log(s);

            // Verify that this edge is or is not a cycle or a path
            var isPath = true;
            $.each(this.edges, function(index, edge) {
                // Are all the edges in a loop?
                s += " " + edge;
            });
            var isCycle = false;
            if (this.edges.length > 1)
                isCycle = this.edges[0].start === this.edges[this.edges.length - 1].end;

            if (consoleOutput) {
                console.log("REPORT FOR " + this);
                console.log("   isPath: " + isPath);
                console.log("   isCycle: " + isCycle);

                console.log("Verified " + graph);
            }
        },

        markAllUnvisited : function() {
            $.each(this.nodes, function(index, node) {
                node.visited = false;
                node.visitedDepth = -1;
                node.visitedParent = undefined;
            });
        },

        // Merge any close enough nodes
        //   Bruuuuuuuuuuute force
        mergeNodes : function(range) {
            var count = this.nodes.length;
            for (var i = 0; i < count; i++) {
                var n0 = this.nodes[i];
                for (var j = i + 1; j < count; j++) {
                    var n1 = this.nodes[j];
                    if (n0.getDistanceTo(n1) < range) {
                 
                        n0.reparentEdgesFrom(n1);
                        n1.mergedWith = n0;
                        n1.deleted = true;
                    }
                }

            }
        },

        setIndices : function() {
            var graph = this;
            $.each(this.nodes, function(index, node) {
                node.graph = graph;
                node.graphIndex = index;

                // Just in case this node isn't a node yet
                Edge.upgradeToNode(node);
            });

            $.each(this.edges, function(index, edge) {
                edge.graph = graph;
                edge.graphIndex = index;
            });
        },

        makeAllTouchable : function() {
            console.log("Make " + this + " touchable");

            $.each(this.paths, function() {
                this.makeAllTouchable();
            });
            $.each(this.nodes, function() {
                upgradeToTouchable(this);
            });
        },

        calculateAngles : function() {
            $.each(this.nodes, function() {
                this.calculateAngles();
            })
        },

        centerBoundingBox : function() {
            var graph = this;
            graph.expandBoxToFit(graph.boundingBox);

            // Center around the bounding box
            var box = graph.boundingBox;
            graph.transform.setTo(-box.x - box.w / 2, -box.y - box.h / 2);
        },

        reverseEdges : function() {
            $.each(this.edges, function(index, edge) {
                edge.reverse();
            });

        },
        //======================================================
        //======================================================
        //======================================================
        //======================================================
        applyToNodes : function(f) {
            $.each(this.nodes, function(index, node) {
                f(node);
            });
        },

        applyToEdges : function(f) {
            $.each(this.edges, function(index, edge) {
                f(edge);
            })
        },

        //======================================================
        //======================================================
        //======================================================
        //======================================================

        addNode : function(pt) {

            this.nodes.push(pt);
        },

        addEdge : function(edge) {

            this.edges.push(edge);
        },

        addGraph : function(graph) {
            this.edges.push.apply(this.edges, graph.edges);
            this.nodes.push.apply(this.nodes, graph.nodes);
        },

        // Make copies of all the original graph's nodes and edges
        cloneGraph : function(original) {
            var graph = this;

            var currentPointIndex = this.nodes.length;
            $.each(original.nodes, function(index, pt) {
                if (isNaN(pt.graphIndex)) {
                    throw ("Attempting to copy a graph with unset graph indices, use 'finish' first");
                }
                var ptIndex = pt.graphIndex + currentPointIndex;
                var pt2 = new Vector(pt);
                pt2.parent = pt;
                graph.addPoint(pt2);
            });

            $.each(original.edges, function(index, edge) {
                // Make a new edge from nodes with the same index
                var start = graph.nodes[edge.start.graphIndex + currentPointIndex];
                var end = graph.nodes[edge.end.graphIndex + currentPointIndex]
                var edge2 = new Edge(start, end);
                edge2.copyHandles(edge);
                edge2.parent = edge;
                graph.addEdge(edge2);
            });

            console.log("Finished importing " + original + " into " + this);
        },

        // From http://stackoverflow.com/questions/12367801/finding-all-Paths-in-undirected-graphs
        /*

         "An outer loop scans all nodes of the graph and starts a search from every node.
         Node neighbours (according to the list of edges) are added to the Path path.
         Recursion ends if no more non-visited neighbours can be added.
         A new Path is found if the path is longer than two nodes and the next neighbour is the start of the path.
         To avoid duplicate Paths, the Paths are normalized by rotating the smallest node to the start.
         Paths in inverted ordering are also taken into account."
         */
        findAllPaths : function() {
            this.markAllUnvisited();

            // Create all the junctions

            $.each(this.junctions, function(index, node) {
                // Try expanding
            });

        },

        // Expand this path by one
        expandPath : function(Path, edge, direction) {

        },

        //==================================================================
        //==================================================================
        //==================================================================

        drawDetails : function(context) {
            var g = context.g;
            var graph = this;
            $.each(this.nodes, function(index, node) {
                g.noStroke();

                // Draw special selected stuff
                if (context.drawHandles) {
                    g.fill(1, 0, 1, .5);
                    $.each(node.edges.outbound, function() {
                        if (this.handles) {
                            this.handles[0].draw(g);
                        }
                    });
                    $.each(node.edges.inbound, function() {
                        if (this.handles) {
                            this.handles[1].draw(g);
                        }
                    });
                }

                if (node.selected) {
                    g.strokeWeight(4)
                    g.stroke(.56, 1, 1);
                    $.each(node.edges.outbound, function() {
                        this.draw(g);

                    });
                    g.stroke(.86, 1, 1);
                    $.each(node.edges.inbound, function() {
                        this.draw(g);

                    });
                }

                g.fill(.3 + .2 * graph.idNumber, 1, 1);
                g.fill(.9, 1, .4);
                if (node.isSmooth)
                    g.fill(.6, 1, .4);

                if (node.testColor)
                    node.testColor.fill(g);
                if (node.touchable)
                    node.drawCircle(g, 4);
                else
                    node.drawCircle(g, 2);

                if (graph.debugDraw) {
                    g.strokeWeight(2);
                    g.stroke(0);
                    node.drawAngle(g, 30, node.normalAngle);
                    g.stroke(.8, 1, 1);
                    node.drawAngle(g, 30, node.inAngle);
                    g.stroke(.55, 1, 1);
                    node.drawAngle(g, 30, node.outAngle);
                }
            });
        },

        // Draw all the edges and any current markup stuff
        draw : function(context) {
            var graph = this;
            var g = context.g;

            g.pushMatrix();
            this.transform.applyTransform(g);

            if (context.drawBoundingBox || app.getOption("drawBoundingBox")) {
                g.fill(1, 0, 1, .5);
                this.boundingBox.draw(g);
            }

            // Draw subpaths
            if (this.paths !== undefined) {
                $.each(this.paths, function(index, path) {
                    path.draw(context);
                });
            }

            this.drawDetails(context);

            // draw bounding box
            g.popMatrix();

        },

        drawNodes : function(context) {
            var radius = 3;
            $.each(this.nodes, function(index, node) {
                if (context.useScreenPos)
                    node.screenPos.drawCircle(context.g, radius);
                else
                    node.drawCircle(context.g, radius);
            });
        },

        drawEdges : function(context) {
            $.each(this.edges, function(index, edge) {

                // Reset the style, or use the testcolor
                if (context.setStyle)
                    context.setStyle();
                if (edge.testColor) {
                    edge.testColor.stroke(context.g);
                    context.g.strokeWeight(3);
                }

                edge.draw(context);
            });
        },

        //==================================================================
        //==================================================================
        //==================================================================

        debugOutput : function() {
            $.each(this.nodes, function(index, node) {
                console.log(index + ": " + node + "(" + node.graphIndex + ")");
            });

            $.each(this.edges, function(index, edge) {
                console.log(index + ": " + edge + "(" + edge.start.graphIndex + "-" + edge.end.graphIndex + ")");
            });

            $.each(this.paths, function(index, path) {
                path.debugOutput();
            })
        },
        toString : function() {
            return this.name + "(" + this.nodes.length + " nodes, " + this.edges.length + " edges)";
        },

        cleanup : function() {
            this.nodes = this.nodes.filter(function(node) {
                return !node.deleted;
            });
        }
    });

    Graph.Edge = Edge;

    return Graph;

});
