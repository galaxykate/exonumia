/**
 * @author Kate Compton
 */
/**
 * @author Kate Compton
 */
define(["common", "./path"], function(common, Path) {'use strict';
    var shapeCount = 0;
    // A shapes is a collection of paths, some inside and some outside
    var Shape = Class.extend({
        init : function(name) {
            this.name = name;
            this.idNumber = shapeCount;
            this.idColor = common.KColor.makeIDColor(this.idNumber);
            shapeCount++;

            this.paths = [];

            for (var i = 0; i < 0; i++) {
                this.createRandomPath();
            }
            this.setBoundingBox();

        },

        clone : function(original) {

            for (var i = 0; i < original.paths.length; i++) {
                this.paths[i] = new Path();
                this.paths[i].clone(original.paths[i]);
            }
        },

        setBoundingBox : function() {
            this.boundingBox = new common.Rect();
            for (var i = 0; i < this.paths.length; i++) {
                this.paths[i].expandBoxToFit(this.boundingBox);
            }
        },

        expandBoxToFit : function(r) {
            for (var i = 0; i < this.paths.length; i++) {
                this.paths[i].expandBoxToFit(r);
            }
        },

        addPath : function(path) {
            this.paths.push(path);
            this.setBoundingBox();
        },

        applyToNodes : function(f, fControlHandles) {
            for (var i = 0; i < this.paths.length; i++) {
                this.paths[i].applyToNodes(f, fControlHandles);
            }
        },

        createRandomPath : function(interior) {
            var center = Vector.polar(Math.random() * 200, Math.random() * 200);
            var seed = Math.random() * 1000;
            var path = new Path();

            var sides = Math.floor(Math.random() * 10 + 5);
            var dTheta = Math.PI * 2 / sides;
            for (var i = 0; i < sides; i++) {
                var r = 50 * (utilities.noise(seed + i * .2) + 1);
                var theta = dTheta * i;
                path.lineTo(Vector.polarOffset(center, r, theta));
            }
            this.paths.push(path);
        },

        //===========================================
        //===========================================
        // Extracting vertices

        createLinearPaths : function() {

        },

        //===========================================
        //===========================================
        // Drawing

        draw : function(context) {

            var g = context.g;
            g.pushMatrix();

            if (this.boundingBox) {
                this.idColor.fill(context.g, .3, -.5);
                this.idColor.stroke(context.g, .3, 1);
                this.boundingBox.draw(context.g);
            }

            this.idColor.fill(context.g);
            for (var i = 0; i < this.paths.length; i++) {
                this.paths[i].draw(context);

                this.paths[i].applyToEdges(function(edge) {
                    edge.drawHandles(context);
                });
                this.paths[i].drawNodes(context);
            }
            g.popMatrix();
        }
    });

    var ShapeSet = Class.extend({
        init : function() {
            this.shapes = [];
            this.boundingBox = new common.Rect();
            for (var i = 0; i < 0; i++) {
                this.shapes.push(new Shape("Shape" + i));
            }

            this.setBoundingBox();
        },

        clone : function(original) {
            for (var i = 0; i < original.shapes.length; i++) {
                this.shapes[i] = new Shape();
                this.shapes[i].clone(original.shapes[i]);
            }
        },

        applyToNodes : function(f, includeControlHandles) {
            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].applyToNodes(f, includeControlHandles);
            }
        },

        setBoundingBox : function() {
            this.boundingBox = new common.Rect();
            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].expandBoxToFit(this.boundingBox);
            }
        },

        addShapes : function(shapes) {
            for (var i = 0; i < shapes.length; i++) {
                this.shapes.push(shapes[i]);
            }
        },

        draw : function(context) {
            if (this.boundingBox) {
                context.g.fill(.3, 1, 1, .3);
                this.boundingBox.draw(context.g);
            }

            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].draw(context);
            }
        }
    });

    Shape.ShapeSet = ShapeSet;
    return Shape;

});
