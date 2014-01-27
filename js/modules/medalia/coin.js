/**
 * @author Kate Compton
 */
define(["common", "graph", "threeUtils", "./textLine"], function(common, Graph, threeUtils, TextArea) {
    var svgs = ["tricky", "cw", "ccw", "flower", "Tiki_Statue", "bird", "testshape2", "labyrinth"];

    var Coin = Class.extend({
        init : function(app) {
            var coin = this;

            this.material = new THREE.MeshLambertMaterial({
                color : 0xffffff,
                ambient : 0xaaaaaa,
                shading : THREE.FlatShading
            });

            this.border = new Graph.Path();
            this.mesh = new THREE.Object3D();
            this.mesh.name = "coin";
            this.sourceIndex = 0;

            this.designTransform = new common.Transform();

            this.changeBorder({
                sides : 8
            });

            //==========
            // Lights and shading
            var light = new THREE.PointLight(0xffffff, 1);
            light.position.set(150, 350, 350);
            this.mesh.add(light);

            this.embossingShapes = new Graph.Shape.ShapeSet();

            this.textMesh = new THREE.Object3D();

            this.mesh.add(this.textMesh);

            this.textAreas = [new TextArea()];
            // Add each text area to the mesh
            $.each(this.textAreas, function(index, area) {
                coin.textMesh.add(area.mesh);

            });

            //  if (app.getOption("useGraphic"))
            //    this.loadPathsFromSVG();

            this.exportToOBJ();
        },

        update : function(time) {

        },

        distortText : function(geo) {

            // Update the geometry
            geo.computeFaceNormals();
            geo.verticesNeedUpdate = true;

        },

        changeBorder : function(settings) {
            var defaultSettings = {
                sides : 8,
                radius : 90,
                fluteDepth : .2,
                upperWidth : 1,
                lowerWidth : 1,
                upperTilt : 0,
                lowerTilt : 0,
                peakTilt : .5,
            }

            $.extend(defaultSettings, settings);

            this.mesh.remove(this.borderMesh);
            this.border.clear();
            Graph.addFlutedCircle(this.border, defaultSettings);
            /*
             this.borderMesh = this.border.createThreeMesh({
             rings : 3,
             capRings : 5,
             height : 40,
             material : this.material,
             });
             */

            var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, 40, 10, 10, false), new THREE.MeshNormalMaterial());
            cylinder.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

            this.mesh.add(cylinder);
        },

        loadPathsFromSVG : function() {
            var coin = this;

            coin.design = new Graph("Coin Design");
            // Load an svg into a graph
            Graph.parseSVG(this.design, svgs[this.sourceIndex], function() {
                //   coin.design.loftPaths();
                coin.design.centerBoundingBox();

            });

            // Don't put hings here, it won't be after the loading, due to async
            this.sourceIndex = (this.sourceIndex + 1) % svgs.length;

        },

        selectAt : function(p) {
            this.designTransform.toLocal(p, p);

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

            context.drawPoints = true;
            context.drawControlPoints = true;

            this.embossingShapes.draw(context);

            $.each(this.textAreas, function(index, area) {
                area.draw(context);
            });

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
