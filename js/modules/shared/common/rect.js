/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["./vector"], function(Vector) {
    var Rect = Class.extend({

        // use as init(x, y, w, h) or init(position:Vector, dimensions:Vector)
        init : function() {
            if (arguments.length == 4) {
                this.x = arguments[0];
                this.y = arguments[1];
                this.w = arguments[2];
                this.h = arguments[3];

            } else {
                this.x = arguments[0].x;
                this.y = arguments[0].y;
                this.w = arguments[1].x;
                this.h = arguments[1].y;
            }
        },

        clone : function() {
            return new Rect(this.x, this.y, this.w, this.h);
        },

        setPosition : function(p) {
            if (arguments.length == 2) {
                this.x = arguments[0];
                this.y = arguments[1];
            } else {
                this.x = p.x;
                this.y = p.y;
            }
        },

        setDimensions : function(p) {
            if (arguments.length == 2) {
                this.w = arguments[0];
                this.h = arguments[1];
            } else {
                this.w = p.x;
                this.h = p.y;
            }
        },

        // return the Vectors of the corners
        getCorners : function(ccw) {
            var x0 = this.x + this.w;
            var x1 = this.x;
            var y0 = this.y;
            var y1 = this.y + this.h;

            if (ccw)
                return [new Vector(x0, y0), new Vector(x1, y0), new Vector(x1, y1), new Vector(x0, y1)];
            return [new Vector(x0, y0), new Vector(x0, y1), new Vector(x1, y1), new Vector(x1, y0)];
        },

        stretchToContainBox : function(b) {
            var box = this;
            var c = b.getCorners();
            $.each(c, function(index, corner) {
                box.stretchToContainPoint(corner);
            });
        },

        stretchToContainPoint : function(pt) {
            if (pt.x < this.x)
                this.x = pt.x;
            if (pt.y < this.y)
                this.y = pt.y;
            if (pt.x > this.x + this.w)
                this.w = pt.x - this.x;
            if (pt.y > this.y + this.h)
                this.h = pt.y - this.y;

        },

        getRandomPosition : function(border) {
            var x = this.x + border + Math.random() * (this.w - border * 2);
            var y = this.y + border + Math.random() * (this.h - border * 2);

            return new Vector(x, y);
        },

        getSidePosition : function(side, sidePos, outset) {
            var x = sidePos;

            if (side === "left") {
                x = outset;
            }
            if (side === "right") {
                x = this.w - outset;
            }

            var y = sidePos;

            if (side === "top") {
                y = outset;
            }
            if (side === "bottom") {
                y = this.h - outset;
            }

            var p = new Vector(x + this.x, y + this.y);
            return p;
        },

        toCSS : function() {
            return {
                width : this.w + "px",
                height : this.h + "px",
                top : this.y + "px",
                left : this.x + "px",

            }
        },
        toString : function() {
            return "[(" + this.x.toFixed(2) + "," + this.y.toFixed(2) + "), " + this.w.toFixed(2) + "x" + this.h.toFixed(2) + "]";
        }
    });

    return Rect;

});
