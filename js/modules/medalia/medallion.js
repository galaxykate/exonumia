/**
 * @author Kate Compton
 */
define(["common", "threeUtils", "graph", "ui", "./coinFeature"], function(common, threeUtils, Graph, UI, Feature) {

    // What does a medalion have?
    // Like the textLine, it's both a UI and a mesh
    var Medallion = Feature.extend({
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

            this._super("Medallion", sliders, uiDiv)

        },

        update : function(time) {

        },

        buildShapeDetails : function() {

            console.log("Build shape for " + this);

            var outerPath = new Graph.Path();
            var lastTheta = 0;
            var outerSpread = 30;
            var innerSpread = 20;

            var r0 = this.currentValues.radius;
            var r1 = r0 * .8;
            outerPath.moveTo(Vector.polar(r0, 0));

            var sides = this.currentValues.sides;
            for (var i = 0; i < sides; i++) {
                var theta0 = Math.PI * 2 * (i) / sides;
                var theta1 = Math.PI * 2 * (i + .5) / sides;
                var theta2 = Math.PI * 2 * (i + 1) / sides;

                var inner0 = Vector.polar(r0, theta0);
                var outer = Vector.polar(r1, theta1);
                var inner1 = Vector.polar(r0, theta2);
                var edge0 = outerPath.lineTo(outer);
                var edge1 = outerPath.lineTo(inner1);

                edge0.makeRelativeHandles(outerSpread, theta0 + Math.PI / 2, innerSpread, theta1 - Math.PI / 2);
                edge1.makeRelativeHandles(innerSpread, theta1 + Math.PI / 2, outerSpread, theta2 - Math.PI / 2);
            }

            var shape = new Graph.Shape("medallion shape");
            shape.setOuterPath(outerPath);
            var medalFeatureShape = new Feature.FeatureShape(this, shape);
            this.featureShapes.push(medalFeatureShape);
        },
    });

    return Medallion;

});
