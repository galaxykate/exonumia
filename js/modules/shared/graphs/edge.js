/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["common"], function(common) {

    var nodeFxns = {

        createEdges : function() {
            this.edges = {
                outbound : [],
                inbound : [],
            }
        },
        addOutbound : function(edge) {
            if (this.edges === undefined) {
                this.createEdges();
            }
            this.edges.outbound.push(edge);
        },
        addInbound : function(edge) {
            if (this.edges === undefined) {
                this.createEdges();
            }
            this.edges.inbound.push(edge);
        },

        removeOutbound : function(edge) {
            if (this.edges === undefined) {

                var index = this.edges.outbound.indexOf(edge);
                if (index > -1) {
                    this.edges.outbound.splice(index, 1);
                }
            }
        },
        removeInbound : function(edge) {
            if (this.edges === undefined) {

                var index = this.edges.inbound.indexOf(edge);
                if (index > -1) {
                    this.edges.inbound.splice(index, 1);
                }
            }
        },
    };

    var upgradeToNode = function(p) {
        $.extend(p, nodeFxns);
    };

    var Edge = Class.extend({
        init : function(start, end, useNodes) {
            this.start = start;
            this.end = end;

            this.useNodes = useNodes;

            if (this.useNodes) {
                upgradeToNode(start);
                upgradeToNode(end);
                this.addToNodes();
            }

            this.normal = new Vector();
            this.edge = new Vector();
            this.midpoint = new Vector();

            this.addToNodes();
            this.updatePosition();
        },

        //========================================
        //========================================
        //========================================
        // End node management

        addToNodes : function() {
            this.start.addOutbound(this);
            this.end.addInbound(this);
        },

        removeFromNodes : function() {
            this.start.removeOutbound(this);
            this.end.removeInbound(this);
        },

        //========================================
        //========================================
        //========================================
        //
        reverse : function() {
            this.removeFromNodes();
            var tmp = this.end;
            this.end = this.start;
            this.start = tmp;
            this.addToNodes();
            this.updatePosition();
        },

        updatePosition : function() {
            this.edge.setToDifference(this.end, this.start);
            this.normal.setTo(this.edge.y, -this.edge.x);
            this.normal.normalize();
            this.setToTracer(this.midpoint, .5, 0);
            if (!this.normal.isValid())
                console.log(this.toString());
        },

        setToTracer : function(p, pct, offset) {
            p.setToLerp(this.end, this.start, pct);
            if (offset)
                p.addMultiple(this.normal, offset)
        },

        //==============================================================================
        //==============================================================================
        //==============================================================================
        // External points

        getAngleTo : function(p) {
            var u = this.getOffset();
            var v = this.start.getOffsetTo(p);

            var theta = Math.acos(u.dot(v) / (u.magnitude() * v.magnitude()));
            return theta;
        },

        // Get which side p is on
        getSide : function(p) {
            var offset = this.getOffset();
            var val = (offset.x * (p.y - this.start.y) - offset.y * (p.x - this.start.x));
            if (val > 0)
                return 1;
            if (val < 0)
                return -1;
            return 0;
        },

        //==============================================================================
        //==============================================================================
        //==============================================================================
        //

        getOtherEnd : function(p) {
            if (p === this.start)
                return this.end;
            if (p === this.end)
                return this.start;
        },

        getOffset : function() {
            return this.start.getOffsetTo(this.end);
        },

        //==============================================================================
        //==============================================================================
        //==============================================================================
        // Outputs

        draw : function(g) {
            this.start.drawLineTo(g, this.end);
        },

        drawNormal : function(g) {
            this.midpoint.drawArrow(g, this.normal, 10);
        },

        toString : function() {
            return "[" + this.start + " to " + this.end + "]";
        },
    });

    return Edge;

});
