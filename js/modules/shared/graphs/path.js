/**
 * @author Kate Compton
 */
define(["common", "./edge", "threeUtils", "./graph"], function(common, Edge, threeUtils, Graph) {'use strict';

    var debugOutputPath = function(s) {
        //    console.log(s);
    };

    var Path = Graph.extend({
        init : function() {
            this._super.apply(this, arguments);

        },

        //===========================================
        //===========================================
        // Extracting vertices

        createLinearPath : function() {
            var points = [new Vector(this.nodes[0])];

            for (var i = 0; i < this.edges.length; i++) {
                var edge = this.edges[i];
                if (edge.handles) {

                }
                points.push(new Vector(edge.end));
            }
            return points;
        },

        //===========================================
        //===========================================

        moveTo : function(p) {

            this.addNode(p);

            this.lastNode = p;
            debugOutputPath("Move to " + p);
        },

        lineTo : function(p) {
            if (this.lastNode) {

                var edge = new Edge(this.lastNode, p);
                this.addEdge(edge);
                this.addNode(p);

            } else {
                debugOutputPath("First node, move to " + p);
                this.addNode(p);
            }

            this.lastNode = p;
            debugOutputPath("Line to " + p);

        },

        quadCurveTo : function(c, p) {
            debugOutputPath("Quad to " + c + " " + p);
            if (this.lastNode) {

                var edge = new Edge(this.lastNode, p, c);
                this.addEdge(edge);
                this.addNode(p);

            } else {
                debugOutputPath("First node, move to " + p);
                this.addNode(p);
            }

            this.lastNode = p;
        },

        curveTo : function(c0, c1, p) {
            this.lineTo(p);
        },

        draw : function(context) {

            var g = context.g;
            g.beginShape();
            this.nodes[0].vertex(g);
            for (var i = 0; i < this.edges.length; i++) {
                this.edges[i].drawVertex(context);
            }

            app.log("Draw " + this + " " + this.edges.length);
            g.endShape();

        },
    });

    return Path;

});
