/**
 * @author Kate Compton
 */
define(["common", "threeUtils", "graph", "ui", "./coinFeature"], function(common, threeUtils, Graph, UI, Feature) {
    var svgs = ["tricky", "cw", "ccw", "flower", "Tiki_Statue", "bird", "testshape2", "labyrinth"];
    var sourceIndex = 4;
    // What does a medalion have?
    // Like the textLine, it's both a UI and a mesh
    var Design = Feature.extend({
        init : function(uiDiv) {

            var sliders = {
                height : {
                    name : "height",
                    defaultVal : 90,
                    min : 20,
                    max : 100,
                    onChange : "remod"
                },

                radius : {
                    name : "radius",
                    defaultVal : utilities.random(140, 160),
                    min : 100,
                    max : 170,
                    onChange : "rebuild"
                },

                sides : {
                    name : "sides",
                    defaultVal : 9,
                    min : 3,
                    max : 30,
                    onChange : "rebuild"
                }
            };
            this._super("Design", sliders, uiDiv)

            sourceIndex = (sourceIndex + 1) % svgs.length;

        },

        update : function(time) {

        },

        buildShapeDetails : function() {

            console.log("Build shape for " + this);

            // Load svg
            this.loadPathsFromSVG();

        },

        loadPathsFromSVG : function() {
            var design = this;

            Graph.parseSVGIntoShapes(svgs[sourceIndex], function(shapes) {
                console.log("SHAPES:", shapes);
                design.shape.addShapes(shapes);
                // Calculate and center
                design.shape.setBoundingBox();
                console.log(design.shape.boundingBox);
                var b = design.shape.boundingBox;

                var center = new Vector(-b.x + -b.w / 2, -b.y + -b.h / 2);
                design.shape.translateVertices(center);

                for (var i = 0; i < shapes.length; i++) {
                    console.log("================");
                    console.log(design.id + ": Create svg feature " + i);
                    var shape = shapes[i];
                    var letterFeatureShape = new Feature.FeatureShape(design, shape);
                    design.featureShapes.push(letterFeatureShape);
                }
                design.buildMesh();
                design.remod();
            });

        },
    });

    return Design;

});
