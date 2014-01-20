/**
 * @author Kate Compton
 */
define(["common", "graph", "voronoi", "./objects/objects"], function(common, Graph, voronoi, Obj) {
    var universe;
    //=================================================================
    //=================================================================
    //=================================================================
    // Region class

    var regionCount = 0;
    var Region = Vector.extend({
        init : function(parentUniverse, x, y) {
            universe = parentUniverse;
            this._super(x, y);
            this.idNumber = regionCount;
            regionCount++;
            this.idColor = new common.KColor((this.idNumber * .302112) % 1, 1, 1);

            this.screenPos = new Vector();
            this.objects = [];
        },

        cleanup : function() {
            this.objects = _.filter(this.objects, function(obj) {
                return !obj.deleted;
            });
        },

        //====================================================================
        activate : function() {
            var region = this;
            // get a label for each object
            $.each(this.objects, function(index, obj) {
                if (obj === undefined)
                    throw (this + " contains undefined objects");
                else {
                    if (obj.isLabelable)
                        universe.labelObject(obj);
                }

            });

        },
        deactivate : function() {
            $.each(this.objects, function(index, obj) {
                if (obj.label !== undefined)
                    obj.label.detach();
            });
        },
        //====================================================================

        spawnContents : function() {
            this.objects = [];

            // Spawn stars
            var count = 10;
            for (var i = 0; i < count; i++) {
                var r = 70 * Math.pow(i, .6) + 12;
                var theta = 2.7 * Math.pow(i, .6);
                var p = Vector.polar(r, theta);
                p.add(this);
                if (this.contains(p)) {
                    var obj = new Obj.Star(p)
                    this.objects.push(obj);
                }
            }

            count = 30;

            for (var i = 0; i < count; i++) {
                var r = 50 * Math.pow(i, .5) + 20;
                var theta =1.2 * Math.pow(i, .6);
                var p = Vector.polar(r, theta);
                p.add(this);
                if (this.contains(p)) {
                    var obj = new Obj.Dust(p)
                    this.objects.push(obj);
                }
            }
        },

        // Find the thing at target, filter, range, useScreenPos
        getAt : function(query) {
            var found = {
                obj : undefined,
                distance : query.range !== undefined ? query.range : 99999,
            };

            this.objects.reduce(function(best, obj, index, array) {
                var d = obj.getDistanceTo(query);
                if (d < best.distance) {
                    best.obj = obj;
                    best.distance = d;
                }
                return best;
            }, found);

            return found;
        },
        setPath : function(path) {
            this.path = path;
        },
        contains : function(target, useScreenPos) {
            if (this.path && this.path.nodesInOrder)
                return target.isInPolygon(this.path.nodesInOrder);
            return false;
        },
        draw : function(context) {
            var g = context.g;

            context.camera.worldToScreen(this, this.screenPos);

            if (this.path && this.path.nodesInOrder) {
                this.idColor.fill(g, .3);
                g.noFill();
                this.idColor.stroke(g, .4);
                g.strokeWeight(1);

                if (context.selected) {
                    g.strokeWeight(4);

                }
                g.beginShape();
                $.each(this.path.nodesInOrder, function(index, node) {
                    node.screenPos.vertex(g);
                });
                g.endShape(g.CLOSE);
            }

            this.screenPos.drawCircle(g, 5);
        },
        drawContents : function(context) {
            $.each(this.objects, function(index, obj) {
                obj.draw(context);
            });
        },
        toString : function() {
            return "Region " + this.idNumber;
        }
    });
    return Region;
});
