/**
 * @author Kate Compton
 */

define(["common", "graph", "threeUtils", "modules/shared/threeUtils/threeFonts"], function(common, Graph, threeUtils, threeFonts) {

    var defaultMaterial = new THREE.MeshNormalMaterial();
    var darkMaterial = new THREE.MeshBasicMaterial({
        color : 0xffffcc
    });
    var wireframeMaterial = new THREE.MeshBasicMaterial({
        color : 0x000000,
        wireframe : true,
        transparent : true
    });

    var multiMaterial = [defaultMaterial, wireframeMaterial];

    defaultMaterial.side = THREE.DoubleSide;

    var TextArea = Class.extend({
        init : function() {
            var textArea = this;
            this.offset = 40;
            this.rotation = 40;

            this.deformPoint = function(p) {
                // Save the original
                if (!p.original)
                    p.original = new Vector(p);
                var theta = p.original.x * .005 + textArea.rotation;
                var r = p.original.y + textArea.offset;

                p.setToPolar(r, theta);

            };

            this.mesh = new THREE.Object3D();
            this.createShapes();
            this.deformShapes();

        },

        createShapes : function() {
            var textArea = this;
            this.shapes = new Graph.Shape.ShapeSet();
            var textShapes = threeFonts.createShapesFromText("Adrian");
            this.shapes.addShapes(textShapes);
            this.shapes.setBoundingBox();

            this.deformed = new Graph.Shape.ShapeSet();
            this.deformed.clone(this.shapes);

            console.log(this.deformed);

            // Create mod geometries
            // For each shape, create a modegeo
            $.each(this.shapes.shapes, function(index, shape) {
                shape.geo = new threeUtils.ModGeo.Swiss(shape);
                var box = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 15), defaultMaterial);
                box.translateX(Math.random() * 100);
                box.translateY(Math.random() * 100);
                box.scale.x = shape.boundingBox.w;
                box.scale.y = shape.boundingBox.h;
                box.position.x = shape.boundingBox.x + shape.boundingBox.w / 2;
                box.position.y = shape.boundingBox.y + shape.boundingBox.h / 2;
                textArea.mesh.add(box);

                //  var textMesh = new THREE.Mesh(shape.geo.createGeometry(), defaultMaterial);
                var textMesh = THREE.SceneUtils.createMultiMaterialObject(shape.geo.createGeometry(), multiMaterial);

                textArea.mesh.add(textMesh);
            });

        },

        deformShapes : function() {
            var f = this.deformPoint;

            this.shapes.applyToNodes(function(node) {
                f(node);

            }, function(handle) {
                f(handle);
                handle.setFromPosition();
            });
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
            this.deformed.draw(context);
            g.popMatrix();
        },
    });
    return TextArea;
});
