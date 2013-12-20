/**
 * @author Kate Compton
 */

define(["common", "three"], function(common, THREE) {'use strict';
    var defaultMaterial = new THREE.MeshNormalMaterial();
    defaultMaterial.side = THREE.DoubleSide;

    var ModGeo = Class.extend({
        init : function() {
            this.geom = new THREE.Geometry();
            this.geom.dynamic = true;
        },

        update : function() {

            // Update the geometry
            this.geom.computeFaceNormals();
            this.geom.verticesNeedUpdate = true;
        },

        createMesh : function(material) {
            if (material === undefined)
                material = defaultMaterial;
            var mesh = new THREE.Mesh(this.geom, material);
            var geo = this;
          
            return mesh;
        },
    });
    var Cylinder = ModGeo.extend({
        init : function(sides, rings, capRings) {
            this._super();
            this.sides = sides;
            this.rings = rings;
            this.capRings = capRings;

            this.edgeVertices = [];
            this.capVertices = [];
            this.capCenters = [];
            this.edgeVertCount = sides * (rings + 1);
            this.capVertCount = sides * capRings + 1;

            // Store the edge vertices in a way that we can access them easily
            for (var i = 0; i < rings + 1; i++) {
                this.edgeVertices[i] = [];
                for (var j = 0; j < sides; j++) {
                    var v = new THREE.Vector3(0, 0, 0);

                    this.edgeVertices[i][j] = v;
                    this.geom.vertices.push(v);
                }
            }

            // Create cap vertices
            for (var k = 0; k < 2; k++) {
                this.capVertices[k] = [];
                var v = new THREE.Vector3(0, 0, 0);

                this.capCenters[k] = v;
                this.geom.vertices.push(v);

                for (var i = 0; i < capRings; i++) {
                    this.capVertices[k][i] = [];
                    for (var j = 0; j < sides; j++) {
                        var v = new THREE.Vector3(0, 0, 0);
                        this.capVertices[k][i][j] = v;
                        this.geom.vertices.push(v);
                    }
                }
            }

            // Create all the faces
            //    For the sides
            for (var i = 0; i < sides; i++) {
                for (var j = 0; j < rings; j++) {
                    var p0 = this.getSideVertexIndex(i, j);
                    var p1 = this.getSideVertexIndex(i + 1, j);
                    var p2 = this.getSideVertexIndex(i, j + 1);
                    var p3 = this.getSideVertexIndex(i + 1, j + 1);

                    var f0 = new THREE.Face3(p0, p1, p3);
                    var f1 = new THREE.Face3(p3, p2, p0);
                    this.geom.faces.push(f0);
                    this.geom.faces.push(f1);
                }
            }

            // For the caps
            for (var k = 0; k < 2; k++) {
                for (var i = 0; i < sides; i++) {
                    for (var j = 0; j < capRings - 1; j++) {
                        var p0 = this.getCapVertexIndex(k, i, j);
                        var p1 = this.getCapVertexIndex(k, i + 1, j);
                        var p2 = this.getCapVertexIndex(k, i, j + 1);
                        var p3 = this.getCapVertexIndex(k, i + 1, j + 1);

                        var f0 = new THREE.Face3(p0, p1, p3);
                        var f1 = new THREE.Face3(p3, p2, p0);
                        this.geom.faces.push(f0);
                        this.geom.faces.push(f1);
                    }
                }
            }
        },

        modSideVertices : function(modVertex) {
            var v = new Vector();
            var context = {

            };

            for (var i = 0; i < this.rings + 1; i++) {
                context.rings = i;
                context.lengthPct = i / this.rings;
                for (var j = 0; j < this.sides; j++) {
                    context.side = j;
                    context.thetaPct = j / this.sides;
                    var vertex = this.getSideVertex(i, j);
                    v.setTo(vertex);
                    modVertex(v, context);
                    vertex.set(v.x, v.y, v.z);
                }
            }
            this.update();
        },

        modTopVertices : function(modVertex) {
            var v = new Vector();
            var context = {

            };

            for (var i = 0; i < this.capRings; i++) {
                context.rings = i;
                context.radiusPct = (i + 1) / this.capRings;
                for (var j = 0; j < this.sides; j++) {
                    context.side = j;
                    context.thetaPct = j / this.sides;
                    var vertex = this.getCapVertex(0, i, j);
                    v.setTo(vertex);
                    modVertex(v, context);
                    vertex.set(v.x, v.y, v.z);
                }
            }
            this.update();
        },

        getSideVertex : function(ring, side) {
            var ringArray = this.edgeVertices[ring];
            return ringArray[side % (this.sides)];

        },

        getCapVertex : function(cap, ring, side) {
            var ringArray = this.capVertices[cap][ring];

            return ringArray[side % (this.sides)];

        },

        getSideVertexIndex : function(side, ring) {
            return (side % this.sides) + ring * this.sides;
        },

        getCapVertexIndex : function(cap, side, capRing) {
            return this.edgeVertCount + this.capVertCount * cap + 1 + (side % this.sides) + capRing * this.sides;
        },
    });

    ModGeo.Cylinder = Cylinder;
    return ModGeo;
});
