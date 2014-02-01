/**
 * @author Kate Compton
 */
define(["common", "graph", "threeUtils"], function(common, Graph, threeUtils) {

    var Coin = Class.extend({
        init : function(app) {
            var coin = this;

            this.border = new Graph.Path();
            this.mesh = new THREE.Object3D();
            this.mesh.name = "coin";
            this.sourceIndex = 0;

            //==========
            // Lights and shading
            var light = new THREE.PointLight(0xfff44f, .6);
            light.position.set(150, -350, -350);
            this.mesh.add(light);

            var light2 = new THREE.PointLight(0xf00fff, .8);
            light2.position.set(850, 350, -350);
            this.mesh.add(light2);

            this.shapes = new Graph.Shape("Coin");
            this.textLines = [];
            this.medallions = [];
            this.designs = [];

            var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 60, 10, 10, false), new THREE.MeshNormalMaterial());
            cylinder.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            this.mesh.add(cylinder);

            // this.exportToOBJ();
        },

        addMedallion : function(medallion) {
            this.medallions.push(medallion);
            this.mesh.add(medallion.mesh);
            console.log("Add medallion mesh: " + medallion.mesh);
            this.shapes.addShape(medallion.shape);
        },

        addTextLine : function(textLine) {
            this.textLines.push(textLine)
            this.mesh.add(textLine.mesh);
            this.shapes.addShape(textLine.shape);
        },

        addDesign : function(design) {
            this.designs.push(design)
            this.mesh.add(design.mesh);
            this.shapes.addShape(design.shape);
        },

        update : function(time) {
            for (var i = 0; i < this.textLines.length; i++) {
                this.textLines[i].update(time);
            }

            for (var i = 0; i < this.medallions.length; i++) {
                this.medallions[i].update(time);
            }
        },

        selectAt : function(p) {
            //  this.designTransform.toLocal(p, p);

        },

        draw : function(g) {

            g.fill(.12, 1, 1);
            g.stroke(0);
            g.strokeWeight(2);

            var context = {
                g : g,
                drawPath : true,
                useCurves : true,
                drawHandles : false,
            }
            //this.border.draw(context);
            g.pushMatrix();

            context.drawPoints = false;
            context.drawControlPoints = false;

            this.shapes.draw(context);

            g.popMatrix();
        },

        exportToOBJ : function() {
            var objFile = new threeUtils.OBJFile();
            objFile.addMesh(this.mesh);
            objFile.chromeSave();
        }
    });

    return Coin;
});
