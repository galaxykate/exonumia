/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';

    // Rad hack from: http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
    // "Sum over the edges, (x2-x1)(y2+y1).
    //  If the result is positive the curve is clockwise, if it's negative the curve is counter-clockwise.
    // (The result is twice the enclosed area, with a +/- convention.)"

    var calculateCycleArea = function(cycle) {
        var total = 0;
        $.each(cycle, function(index, edge) {
            total += (edge.end.x - edge.start.x) / (edge.end.y + edge.start.y);
        });

        return total / 2;
    };

    // A graph is a collection of edges
    var Graph = Class.extend({
        init : function() {
            this.edges = [];
            this.nodes = [];

            // Lists of nodes
            this.cycles = [];
        },

        clone : function() {

        },

        offsetNodes : function() {
            // Move each node ... inward?
        },

        reverseEdges : function(cycle) {
            $.each(cycle, function(index, edge) {
                edge.reverse();
            });

        },

        finish : function() {
            this.removeDuplicateNodes();

            var area = calculateCycleArea(this.edges);
            console.log(area);
            if (area > 0) {
                this.reverseEdges(this.edges);
            }
        },

        addEdge : function(edge) {
            if (arguments.length == 2) {
                edge = new common.Edge(arguments[0], arguments[1], true);
            }

            this.edges.push(edge);
            this.nodes.push(edge.start);
            this.nodes.push(edge.end);
        },

        removeDuplicateNodes : function() {
            this.nodes = this.nodes.filter(function(e, i, arr) {
                return arr.lastIndexOf(e) === i;
            });
        },

        markAllUnvisited : function() {
            $.each(this.nodes, function(index, node) {
                node.visited = false;
                node.visitedDepth = -1;
                node.visitedParent = undefined;
            });
        },

        // From http://stackoverflow.com/questions/12367801/finding-all-cycles-in-undirected-graphs
        /*

         "An outer loop scans all nodes of the graph and starts a search from every node.
         Node neighbours (according to the list of edges) are added to the cycle path.
         Recursion ends if no more non-visited neighbours can be added.
         A new cycle is found if the path is longer than two nodes and the next neighbour is the start of the path.
         To avoid duplicate cycles, the cycles are normalized by rotating the smallest node to the start.
         Cycles in inverted ordering are also taken into account."
         */

        findAllCycles : function() {
            this.markAllUnvisited();

            // Create all the junctions

            $.each(this.junctions, function(index, node) {
                // Try expanding
            });

        },

        // Expand this path by one
        expandPath : function(cycle, edge, direction) {

        },

        // Draw all the edges and any current markup stuff
        draw : function(g) {
            app.log("Draw " + this.edges.length + " edges");
            g.noFill();
            $.each(this.edges, function(index, edge) {
                g.stroke(1, 0, 0, .4);
                edge.draw(g);
                g.stroke(1, 1, 1, .4);
                edge.drawNormal(g);
            });

        }
    });

    return Graph;

});
