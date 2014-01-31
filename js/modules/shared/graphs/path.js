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

        getStart : function() {
            return this.nodes[0];
        },

        //===========================================
        //===========================================

        moveTo : function(p) {

            this.addNode(p);

            this.lastNode = p;
            debugOutputPath("Move to " + p);
        },

        lineTo : function(p) {
            var edge;
            if (this.lastNode) {

                edge = new Edge(this.lastNode, p);
                this.addEdge(edge);
                this.addNode(p);

            } else {
                debugOutputPath("First node, move to " + p);
                this.addNode(p);
            }

            this.lastNode = p;
            debugOutputPath("Line to " + p);

            return edge;
        },

        quadCurveTo : function(c, p) {
            var edge;
            debugOutputPath("Quad to " + c + " " + p);
            if (this.lastNode) {

                var node = this.addNode(p);
                edge = new Edge(this.lastNode, node, c);
                this.addEdge(edge);

            } else {
                var node = this.addNode(p);
                debugOutputPath("First node, move to " + p);
            }

            this.lastNode = p;
            return edge;
        },

        curveTo : function(c0, c1, p) {
            var edge;
            if (this.lastNode) {

                var node = this.addNode(p);
                edge = new Edge(this.lastNode, node, c0, c1);
                this.addEdge(edge);

            } else {
                var node = this.addNode(p);
                debugOutputPath("First node, move to " + p);
            }

            this.lastNode = p;
            return edge;
        },

        addNode : function(p) {
            var start = this.getStart()
            if (!start || p.getDistanceTo(start) > .01) {

                this._super(p);
                return p;
            } else {
                return start;
            }
        },

        //======================================================
        //======================================================
        calculateArea : function() {

            var area = 0;
            // Accumulates area in the loop

            for (var i = 0; i < this.nodes.length; i++) {
                var p0 = this.nodes[i];
                var p1 = this.nodes[(i + 1) % (this.nodes.length)];
                area = area + (p0.x + p1.x) * (p0.y - p1.y);

            }

            this.area = area / 2;
            return area / 2;

        },

        //======================================================
        //======================================================
        // Export

        createLinearPath : function(curveDetail) {
            var linearPath = new Path();
            linearPath.moveTo(this.edges[0].nodes[0]);

            for (var i = 0; i < this.edges.length; i++) {
                var edge = this.edges[i];
                if (edge.isCurve) {
                    for (var j = 0; j < curveDetail; j++) {
                        var pct = (j + .5) / curveDetail;
                        var p = edge.getSubdivisionPoint(pct);
                        linearPath.lineTo(p);
                    }
                }
                linearPath.lineTo(edge.nodes[1]);
            }
            return linearPath;
        },

        //===========================================
        //===========================================

        draw : function(context) {

            var g = context.g;
            g.beginShape();
            this.nodes[0].vertex(g);
            for (var i = 0; i < this.edges.length; i++) {
                this.edges[i].drawVertex(context);
            }

            g.endShape();

        },
        //===========================================
        //===========================================

        toDebugString : function() {
            var s = "";
            for (var i = 0; i < this.nodes.length; i++) {
                s += this.nodes[i].graphIndex + ":" + this.nodes[i] + " ";
            }
            return s;
        }
    });

    return Path;

});
