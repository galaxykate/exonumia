/**
 * @author Kate Compton
 */

define(["common"], function(common) {
    var nodeFxns = {

     

        createEdges : function() {
            this.edges = [[], []];
        },

        reparentEdgesFrom : function(n) {
            var newParent = this;
            $.each(n.edges.outbound, function(index, edge) {
                edge.setStart(newParent);
            });
            $.each(n.edges.inbound, function(index, edge) {
                edge.setEnd(newParent);
            });
        },

        filterEdges : function(f) {
            return this.edges.outbound.filter(f).concat(this.edges.inbound.filter(f));
        },

        copyAngles : function(pt) {
            this.inAngle = pt.inAngle;
            this.outAngle = pt.outAngle;
            this.normalAngle = pt.normalAngle;
            this.dTheta = this.outAngle - this.inAngle;
            this.isSmooth = pt.isSmooth;
        },

        setToSmooth : function(normalAngle) {
            this.inAngle = normalAngle - Math.PI / 2;
            this.outAngle = normalAngle + Math.PI / 2;
            this.dTheta = this.outAngle - this.inAngle;
            this.normalAngle = normalAngle;
            this.isSmooth = true;
        },

        calculateAngles : function() {
            this.inAngle = this.getInboundAngle();
            this.outAngle = this.getOutboundAngle();

            if (isNaN(this.inAngle) && !isNaN(this.outAngle))
                this.inAngle = this.outAngle + Math.PI;

            if (isNaN(this.outAngle) && !isNaN(this.inAngle))
                this.outAngle = this.inAngle + Math.PI;

            // No edges at all
            if (isNaN(this.inAngle) && isNaN(this.outAngle)) {
                this.outAngle = Math.PI;
                this.inAngle = 0;
            }

            if (isNaN(this.inAngle) || isNaN(this.outAngle)) {
                console.log(this.inAngle + " " + this.outAngle);
                throw ("Angles not valid");
            }

            this.dTheta = this.outAngle - this.inAngle;
            this.dTheta = (this.dTheta % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);

            this.normalAngle = this.getLerpAngle(.5);

            this.isSmooth = (Math.abs(this.dTheta - Math.PI) % (2 * Math.PI)) < .1;
        },

        anglesToString : function() {

            return "in: " + numToString(this.inAngle) + "  out: " + numToString(this.outAngle) + " normal: " + numToString(this.normalAngle) + " dTheta: " + numToString(this.dTheta);

        },

        getLerpAngle : function(pct) {

            var angle = this.inAngle + this.dTheta * pct;
            if (isNaN(angle))
                throw ("Lerped angle is NaN: " + this.anglesToString());
            return angle;
        },

        addEdge : function(edge, side) {

            this.edges[side].push(edge);

        },

        removeEdge : function(edge, side) {
            if (this.edges !== undefined) {
                var index = this.edges[side].indexOf(edge);
                if (index > -1) {
                    this.edges.inbound.splice(index, 1);
                } else {
                    throw ("Inbound edge " + edge + " not found in " + this);
                }
            }
        },

        getSubpath : function(context) {
            var count = 0;
            var subPath = {
                edges : [],
                nodes : [],
            };

            if (context.graph)
                subPath = context.graph;

            context.onEdge = function(edge) {
                if (context.testHue) {
                    edge.testColor = new common.KColor(context.testHue + count * .01, .7 + .4 * Math.sin(context.testHue), .7 - .4 * Math.sin(context.testHue));
                }
                subPath.edges.push(edge);
            };

            context.onNode = function(node) {
                if (context.testHue) {
                    node.testColor = new common.KColor(context.testHue + count * .01, .7 + .4 * Math.sin(context.testHue), .7 - .4 * Math.sin(context.testHue));
                }
                subPath.nodes.push(node);
                count++;
            };

            this.followPath(context);
            return subPath;
        },

        // Follow edges until it gets back to this node
        followLoop : function(context, callback) {
            var count = 0;
            context.nodeEndCondition = function(node) {
                return count > 0 && node === this;
                count++;
            };
            this.followPath(context, callback);
        },

        followPath : function(context, callback) {
            if (context.nodeEndCondition && context.nodeEndCondition(this)) {
                if (callback)
                    callback(this);
            } else {

                if (context.onNode)
                    context.onNode(this);

                var next = this.edges.outbound[0];
                if (next === undefined) {
                    if (callback)
                        callback();
                } else
                    next.followPath(context, callback);
            }
        },

        draw : function(context) {
            context.g.fill(0);
            this.drawCircle(context.g, 4);
        },
    };

    var upgradeToNode = function(p) {
        if (p.edges === undefined) {
            $.extend(p, nodeFxns);
            p.createEdges();
            p.rotation = 0;
        }
    };
    return {
        upgradeToNode : upgradeToNode
    }
});
