/**
 * @author Kate Compton
 */
define(["common", "./edge", "threeUtils"], function(common, Edge, threeUtils) {'use strict';

    var graphCount = 0;

    // A graph is a collection of edges
    var Graph = Class.extend({
        init : function(name) {
            this.name = name;
            this.idNumber = graphCount;
            graphCount++;

            this.clear();

        },

        clear : function() {
            this.edges = [];
            this.nodes = [];
        },

        setBoundingBox : function() {
            this.boundingBox = new common.Rect();
            this.expandBoxToFit(this.boundingBox);
        },

        // Min box to hold all nodes and their control nodes
        expandBoxToFit : function(box) {

            $.each(this.nodes, function(index, pt) {
                box.stretchToContainPoint(pt);
            });
        },

        //======================================================
        //======================================================
        //======================================================
        //======================================================
        getNode : function(index) {
            return this.nodes[index];
        },

        // Make this into an exact copy of the original,
        //  but all the edges should connect to the nodes of the new one
        clone : function(original) {
            var graph = this;
            this.name = original.name + "(clone)";
            // Clone all hte nodes
            $.each(original.nodes, function(index, node) {
                var n = new Vector(node);
                graph.addNode(n);
            });

            // Connect up all the edges
            $.each(original.edges, function(index, edge) {
                var startIndex = edge.nodes[0].graphIndex;
                var endIndex = edge.nodes[1].graphIndex;
                var start = graph.getNode(startIndex);
                var end = graph.getNode(endIndex);
                var e = new Edge(start, end);
                e.clone(edge);
                graph.addEdge(e);
            });
        },

        //======================================================
        //======================================================
        //======================================================
        //======================================================

        applyToNodes : function(f, fControlHandles) {
            $.each(this.nodes, function(index, node) {
                f(node);
            });

            if (fControlHandles) {
                $.each(this.edges, function(index, edge) {
                    edge.applyToControlHandles(fControlHandles);
                })
            }
        },

        applyToEdges : function(f) {
            $.each(this.edges, function(index, edge) {
                f(edge);
            })
        },

        getRandomEdge : function() {
            return this.edges[Math.floor(Math.random() * this.edges.length)];
        },

        getRandomNode : function() {
            return this.nodes[Math.floor(Math.random() * this.nodes.length)];
        },

        addNode : function(pt) {
            pt.graphIndex = this.nodes.length;
            this.nodes.push(pt);
        },

        addEdge : function(edge) {
            this.edges.push(edge);
            return edge;
        },

        //==================================================================
        //==================================================================
        //==================================================================
        // Drawing

        drawNodes : function(context) {
            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].draw(context);
            }
        },

        drawEdges : function(context) {
            for (var i = 0; i < this.edges.length; i++) {
                this.edges[i].draw(context);
            }
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

            this.edges = this.edges.filter(function(edge) {
                return !edge.deleted;
            });
        }
    });

    Graph.Edge = Edge;

    return Graph;

});
