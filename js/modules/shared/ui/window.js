/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var DrawingWindow = Class.extend({
        init : function(name, element) {
            this.name = name;
            this.w = element.width();
            this.h = element.height();
            this.element = element;
            this.active = false;
            this.transform = new common.Transform();
            this.localPos = new Vector();

        },

        setProcessing : function(processing) {
            this.processing = processing;
            this.transform.setTo(processing.width / 2, processing.height / 2);

        },

        getPositionRelativeTo : function(element, pos) {
            var v = new Vector(pos.x - element.offset().left, pos.y - element.offset().top);
            return v;
        },

        setLocalPosition : function(mousePos) {
            var p = app.getPositionRelativeTo(this.element, mousePos);
            this.transform.toLocal(p, this.localPos);
        },

        render : function(toRender) {
            var g = this.processing;
            g.ellipseMode(g.CENTER_RADIUS);
            var context = {
                g : g

            };

            g.colorMode(g.HSB, 1);

            g.pushMatrix();
            this.transform.applyTransform(g);
            toRender(context);

            g.popMatrix();
        },

        toString : function() {
            return "Window " + this.name + "(" + this.active + ")";
        }
    });
    return DrawingWindow;
});
