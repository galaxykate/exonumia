/**
 * @author Kate Compton
 */
var defaultMaterial, multimaterial;

define(["common", "graph", "threeUtils", "modules/shared/threeUtils/threeFonts", "./coinFeature"], function(common, Graph, threeUtils, threeFonts, Feature) {

    var TextArea = Feature.extend({
        init : function(uiDiv) {
            var sliders = {
                height : {
                    name : "height",
                    defaultVal : 90,
                    min : 20,
                    max : 100,
                    onChange : "remod"
                },

                offset : {
                    name : "offset",
                    defaultVal : 80,
                    min : 50,
                    max : 128,
                    onChange : "rebuild"
                },

                size : {
                    name : "size",
                    defaultVal : utilities.random(.2, .2),
                    min : .2,
                    max : .8,
                    onChange : "rebuild"
                },

            };
            this.text = "hello world";
            this.originalShape = new Graph.Shape("Original");
            this.deformedShape = new Graph.Shape("Deformed");

            this._super("TextLine", sliders, uiDiv);

        },

        update : function(time) {

        },

        //======================================================
        buildUIDetails : function(uiDiv) {
            var feature = this;

            console.log("add new text line");

            var idNumber = this.textLineCount;
            // Create the div
            var textLine = {
                idNumber : idNumber,
                div : $("<div/>", {
                    html : "text:",
                    id : "textLine" + idNumber,
                    "class" : ""
                }),
                textArea : $("<textarea/>", {
                    rows : 1,
                    cols : 20,
                    html : utilities.getRandom(mottos),
                }),

                fontChoice : $("<select/>", {
                    html : app.fontSelectionOptions,
                })
            };

            textLine.textArea.keyup(function() {
                console.log(textLine.textArea.val());
                feature.setText(textLine.textArea.val());
            });

            textLine.div.append(textLine.textArea);
            textLine.div.append(textLine.fontChoice);

            uiDiv.append(textLine.div);

        },

        //======================================================
        //======================================================

        setText : function(text) {
            this.text = text;
            this.rebuild();
        },

        buildShapeDetails : function() {
            this.originalShape = new Graph.Shape();
            this.deformedShape = new Graph.Shape();

            this.createTextShapes(this.text);
            this.deformText();
            this.createTextMeshes(this.deformedShape.shapes);

        },

        createTextShapes : function(text) {
            console.log("createTextShapes " + text);
            this.letterShapes = threeFonts.createShapesFromText(text);
            // center them

            this.originalShape.addShapes(this.letterShapes);
            var scale = this.getCurrentValue("size");
            this.originalShape.scaleVertices(scale, -scale);
            this.originalShape.setBoundingBox();
            this.originalShape.translateVertices(new Vector(-this.originalShape.boundingBox.w / 2, 0));

            this.deformedShape.clone(this.originalShape);
            this.createTextFeatureShapes(this.deformedShape.shapes);
        },

        createTextFeatureShapes : function(shapes) {
            console.log(shapes);
            for (var i = 0; i < shapes.length; i++) {
                var shape = shapes[i];
                var letterFeatureShape = new Feature.FeatureShape(this, shape);
                this.featureShapes.push(letterFeatureShape);
            }
        },

        deformText : function() {
            var textArea = this;

            var deformPoint = function(p) {
                // Save the original

                if (!p.original)
                    p.original = new Vector(p);
                var theta = -p.original.x * .009 + -Math.PI / 2;
                var r = -p.original.y - textArea.getCurrentValue("offset");

                p.setToPolar(r, theta);

                //   p.x += 90;

            };

            this.deformedShape.applyToNodes(function(node) {
                deformPoint(node);
            }, function(handle) {
                deformPoint(handle);
                handle.setFromPosition();
            });
        },

        createTextMeshes : function(shapeSet) {
            console.log("Create text meshes");
            this.modGeos = [];
            for (var i = 0; i < shapeSet.length; i++) {
                var shape = shapeSet[i];
                var modGeo = new threeUtils.ModGeo.Swiss({
                    outerPath : shape.outerPath,
                    ringCount : 1,
                    flipSides : false
                });

                var geo = modGeo.createGeometry();
                var shapeMesh = THREE.SceneUtils.createMultiMaterialObject(geo, multiMaterial);

                modGeo.modOuterRing(function(p, context) {
                    var bump = 1 + 1.5 * Math.sin(context.pctRing * 3);
                    var i = context.segment;
                    var node = context.path.nodes[i];
                    p.x = node.x;
                    p.y = node.y;
                    p.z = context.pctRing * 190;
                });

                this.modGeos.push(modGeo);

                this.mesh.add(shapeMesh);
            }

        },
        draw : function(context) {
            var g = context.g;
            var startTheta = this.rotation;
            var endTheta = 1.8 + startTheta;
            var r0 = this.offset;
            var r1 = r0 + 150;

            g.noStroke();
            g.fill(.87, 1, 1);
            g.beginShape(g.TRIANGLE_STRIP);
            var sides = 10;

            for (var i = 0; i < sides; i++) {

                var pct = i / (sides - 1);
                var theta = utilities.lerp(startTheta, endTheta, pct);
                g.vertex(r0 * Math.cos(theta), r0 * Math.sin(theta));
                g.vertex(r1 * Math.cos(theta), r1 * Math.sin(theta));
            }

            g.endShape();

            this.shapes.draw(context);

            g.pushMatrix();
            g.translate(-30, 0);
            context.drawNodes = true;
            this.deformed.draw(context);
            g.popMatrix();
        },
    });
    return TextArea;
});
