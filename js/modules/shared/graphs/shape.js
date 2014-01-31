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
            this.idColor = common.KColor.makeIDColor(this.idNumber * .89);
            shapeCount++;

            this.clear();

        },

        clear : function() {
            this.shapes = [];
            this.innerPaths = [];
            this.outerPath
            this.paths = [];
            this.setBoundingBox();

        },

        //================================================
        //================================================
        setOuterPath : function(path) {
            this.outerPath = path;
            this.paths.push(path);

        },

        addInnerPath : function(path) {
            this.innerPaths.push(path);
            this.paths.push(path);
        },
        //================================================
        //================================================

        getOuterPath : function() {
            return this.outerPath;
        },

        clone : function(original) {

            this.outerPath = new Path();
            if (original.outerPath)
                this.outerPath.clone(original.outerPath);

            for (var i = 0; i < original.innerPaths.length; i++) {
                this.innerPaths[i] = new Path();
                this.innerPaths[i].clone(original.innerPaths[i]);
            }

            this.paths = this.innerPaths.slice(0);
            if (original.outerPath)
                this.paths.push(this.outerPath);

            for (var i = 0; i < original.shapes.length; i++) {
                this.shapes[i] = new Shape();
                this.shapes[i].clone(original.shapes[i]);
            }
        },

        //========================================================
        //========================================================

        setBoundingBox : function() {
            this.boundingBox = new common.Rect();
            this.expandBoxToFit(this.boundingBox);
        },
        expandBoxToFit : function(r) {
            for (var i = 0; i < this.paths.length; i++) {
                this.paths[i].expandBoxToFit(r);
            }
            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].expandBoxToFit(r);
            }
        },
        applyToNodes : function(f, fControlHandles) {
            for (var i = 0; i < this.paths.length; i++) {
                this.paths[i].applyToNodes(f, fControlHandles);
            }
            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].applyToNodes(f, fControlHandles);
            }
        },
        //========================================================
        //========================================================

        translateVertices : function(offset) {
            this.applyToNodes(function(node) {
                node.add(offset);
            }, function(handle) {
                handle.add(offset);
                handle.setFromPosition();
            });
        },

        scaleVertices : function(mx, my) {
            this.applyToNodes(function(node) {
                node.multEach(mx, my);
            }, function(handle) {
                handle.multEach(mx, my);
                handle.setFromPosition();
            });
        },

        //========================================================
        //========================================================

        addShape : function(shape) {
            this.shapes.push(shape);
        },

        addShapes : function(shapes) {
            for (var i = 0; i < shapes.length; i++) {
                this.shapes.push(shapes[i]);
            }
        },

        //========================================================
        //========================================================

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
        // Drawing

        draw : function(context) {

            // Draw the shapes
            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].draw(context);
            }

            var g = context.g;
            g.pushMatrix();

            if (this.boundingBox) {
                this.idColor.fill(context.g, .3, -.5);
                this.idColor.stroke(context.g, .3, 1);
                this.boundingBox.draw(context.g);
            }

            for (var i = 0; i < this.paths.length; i++) {
                this.idColor.fill(context.g, 0, -.5);
                this.idColor.stroke(context.g, -.3, 1);
                this.paths[i].draw(context);

                if (context.drawHandles) {
                    this.paths[i].applyToEdges(function(edge) {
                        edge.drawHandles(context);
                    });
                }

                g.noStroke();

                if (context.drawNodes)
                    this.paths[i].drawNodes(context);

            }
            this.idColor.fill(context.g, -.3, 1);

            g.text(this.name, 0, this.idNumber * 30);
            g.popMatrix();
        },
        //========================================================
        //========================================================

        debugOutput : function(spacing) {
            if (!spacing)
                spacing = "";

            console.log(spacing + this.name);
            console.log(spacing + "  outerPath: " + this.outerPath.area);
            for (var i = 0; i < this.innerPaths.length; i++) {
                console.log(spacing + "  innerPath: " + this.innerPaths[i].area);
            }

            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].debugOutput(spacing + "   ");
            }

        }
    });

    return Shape;

});
