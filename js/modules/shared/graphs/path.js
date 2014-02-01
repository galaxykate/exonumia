/**
 * @author Kate Compton
 */
define(["common", "./edge", "threeUtils", "./graph"], function(common, Edge, threeUtils, Graph) {'use strict';

    var debugOutputPath = function(s) {
        //console.log(s);
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
            var p0 = this.lastNode;
            var edge;
            if (this.lastNode) {

                debugOutputPath("Line to " + p);
                var p = this.addNode(p);
                edge = new Edge(p0, p);
                this.addEdge(edge);

            } else {
                debugOutputPath("First node, move to " + p);
                this.addNode(p);
            }

            this.lastNode = p;

            return edge;
        },

        quadCurveTo : function(c, p) {
            var p0 = this.lastNode;
            var edge;
            debugOutputPath("Quad to " + c + " " + p);
            if (p0) {

                var node = this.addNode(p);
                edge = new Edge(p0, node, c);
                this.addEdge(edge);

            } else {
                var node = this.addNode(p);
                debugOutputPath("First node, move to " + p);
            }

            return edge;
        },

        smoothCurveTo : function(c1, p) {
            var p0 = this.lastNode;
            debugOutputPath("Smooth curve to " + c1 + " " + p);
            var lastHandleOffset = new Vector();
            if (this.lastHandle)
                lastHandleOffset.setToDifference(this.lastHandle, p0);
            var c0 = new Vector(p0);
            c0.add(lastHandleOffset);
            // FIX: add handle offset

            return this.curveTo(c0, c1, p);
        },

        curveTo : function(c0, c1, p) {
            var p0 = this.lastNode;
            var edge;
            if (this.lastNode) {
                debugOutputPath("Last node: " + p0);
                debugOutputPath("Curve thru " + c0 + " " + c1 + " to " + p);

                var node = this.addNode(p);
                edge = new Edge(p0, node, c0, c1);
                this.addEdge(edge);

            } else {
                var node = this.addNode(p);
                debugOutputPath("Curve, but First node, move to " + p);
            }

            return edge;
        },

        close : function() {

        },

        addEdge : function() {

            var edge = this._super.apply(this, arguments);
            this.lastHandle = undefined;
            if (edge.handles)
                this.lastHandle = edge.handles[1];
            return edge;
        },

        addNode : function(p) {
            var start = this.getStart()
            if (!start || p.getDistanceTo(start) > .01) {

                this._super(p);
                this.lastNode = p;

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
