/**
 * @author Kate Compton
 */

define(["common", "three"], function(common, THREE) {'use strict';
    var flipFace = function(face) {
        var temp = face.a;
        face.a = face.b;
        face.b = temp;
    };

    var vertexArrayToString = function(array) {
        var s = "";
        for (var i = 0; i < array.length; i++) {
            var p = array[i];
            s += "(" + p.x.toFixed(2) + ", " + p.y.toFixed(2) + ", " + p.z.toFixed(2) + ") [" + p.meshIndex + "]";
        }
        return s;
    };

    var faceToString = function(face, vertices) {
        var s = "[" + face.a + ", " + face.b + ", " + face.c + "]";

        if (vertices) {
            s += vertices[faces.a] + " " + vertices[faces.b] + " " + vertices[faces.c];
        }
        return s;
    };

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

    var addRingsOfVerticesToGeo = function(rings, geo) {
        for (var i = 0; i < rings.length; i++) {

            for (var j = 0; j < rings[i].length; j++) {
                var v = rings[i][j];
                v.vertIndex = geo.vertices.length;
                geo.vertices[v.vertIndex] = v;
            }
        }
    };

    var addVerticesToGeo = function(verts, geo) {
        for (var i = 0; i < verts.length; i++) {
            var v = verts[i];
            v.vertIndex = geo.vertices.length;
            geo.vertices[v.vertIndex] = v;
        }
    };

    var createRingsOfVertices = function(rows, columns) {
        var rings = [];
        for (var i = 0; i < rows; i++) {
            rings[i] = [];

            for (var j = 0; j < columns; j++) {
                rings[i][j] = new Vector();
            }
        }
        return rings;
    };

    var connectRings = function(faces, ring0, ring1, open) {
        var end = ring0.length;
        if (open)
            end = ring0.length - 1;

        for (var i = 0; i < end; i++) {
            var i0 = i;
            var i1 = (i + 1) % ring0.length;
            var v0 = ring0[i0].meshIndex;
            var v1 = ring0[i1].meshIndex;
            var v2 = ring1[i0].meshIndex;
            var v3 = ring1[i1].meshIndex;
            var f0 = new THREE.Face3(v0, v1, v3);
            var f1 = new THREE.Face3(v3, v2, v0);
            faces.push(f0);
            faces.push(f1);
        }
    };

    var connectRingToPoint = function(faces, ring, point, open) {
        var end = rings.length;
        if (open)
            end = rings.length - 1;

        var pointIndex = point.meshIndex;
        for (var i = 0; i < end; i++) {
            var i0 = i;
            var i1 = (i + 1) % rings.length;
            var v0 = ring0[i0].meshIndex;
            var v1 = ring0[i1].meshIndex;
            var f0 = new THREE.Face3(v0, v1, pointIndex);
            faces.push(f0);
        }
    };

    var addRingVertices = function(vertices, ring) {
        for (var i = 0; i < ring.length; i++) {
            ring[i].meshIndex = vertices.length;
            vertices.push(ring[i]);
        }
    };

    var GeoRing = Class.extend({
        init : function(geometry, ringCount, segmentCount, topVertices, bottomVertices) {
            this.geom = geometry;

            this.ringCount = ringCount;
            this.segmentCount = segmentCount;

            this.rings = [];
            for (var i = 0; i < ringCount + 1; i++) {
                if (i === 0 && bottomVertices) {
                    this.rings[i] = bottomVertices;
                }

                if (i === ringCount && topVertices) {
                    this.rings[i] = topVertices;
                }

                if (!this.rings[i]) {
                    this.rings[i] = [];
                    for (var j = 0; j < segmentCount; j++) {
                        var r = 30 * (2 + Math.sin(.9 * i));
                        var theta = Math.PI * 2 * j / segmentCount;
                        var z = i * 100 / ringCount;
                        this.rings[i][j] = new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z);
                    }

                    // Only add these vertices that were created just now,
                    //   otherwise, we'd be duplicating vertices,
                    //   and thats a BIG poblem since they have the wrong index numbers
                    addRingVertices(this.geom.vertices, this.rings[i]);
                }
            }

            this.faces = [];
            for (var i = 0; i < ringCount; i++) {

                connectRings(this.faces, this.rings[i], this.rings[i + 1], false);

            }

            for (var i = 0; i < this.faces.length; i++) {
                geometry.faces.push(this.faces[i]);
            }
        },

        flipFaces : function() {
            for (var i = 0; i < this.faces.length; i++) {
                flipFace(this.faces[i]);
            }
        },

        getRing : function(index) {
            return this.rings[index];
        },

        modVertices : function(f, context) {
            if (!context)
                context = {};

            // Do something with each vertex
            _.extend(context, {
                ring : 0,
                segment : 0,
                pctSegment : 0,
                pctRing : 0,
            });

            for (var i = 0; i < this.rings.length; i++) {
                var ring = this.rings[i];
                var seg = ring.length;
                context.ring = i;
                context.pctRing = i / this.rings.length;
                for (var j = 0; j < seg; j++) {
                    context.pctSegment = j / seg;
                    context.segment = j;
                    f(ring[j], context);
                }
            }
        }
    });

    // How do you share the vertices?  Pass them in
    // Radiating outwards with a central connection point
    var GeoRadial = Class.extend({
        init : function(rings, segments, ringVertices) {

        }
    });

    var Swiss = ModGeo.extend({

        // Make a swiss geometry out of some shape
        // Single outer hull, plus points
        init : function(overrides) {
            var settings = {
                ringCount : 3,
            }

            _.extend(settings, overrides);

            this.geom = new THREE.Geometry();
            this.outerPath = settings.outerPath;
            this.exterior = new GeoRing(this.geom, settings.ringCount, this.outerPath.nodes.length);

            this.setToPath();

            this.makeLayerFaces(0, true);
            this.makeLayerFaces(settings.ringCount, false);

            if (settings.flipSides)
                this.exterior.flipFaces();
        },

        setToPath : function() {
            this.modOuterRing(function(p, context) {
                var i = context.segment;
                var node = context.path.nodes[i];
                p.x = node.x;
                p.y = node.y;
            });

            this.update();

        },

        makeLayerFaces : function(ringIndex, flip) {
            var ring = this.exterior.getRing(ringIndex);
            var faces = THREE.Shape.Utils.triangulateShape(ring, []);

            for (var i = 0; i < faces.length; i++) {

                for (var j = 0; j < 3; j++) {
                    var index = faces[i][j];

                    faces[i][j] = ring[index].meshIndex;
                }

                var f = new THREE.Face3(faces[i][0], faces[i][1], faces[i][2]);
                if (flip) {
                    flipFace(f);
                }
                this.geom.faces.push(f);
            }

        },

        modOuterRing : function(f) {
            var outerPath = this.outerPath;

            this.exterior.modVertices(f, {
                path : outerPath
            });
        },

        createGeometry : function() {
            // return new THREE.CubeGeometry(10, 10, 150);
            this.geom.computeFaceNormals();
            return this.geom;
        },
    });

    ModGeo.GeoRing = GeoRing;
    ModGeo.Swiss = Swiss;
    return ModGeo;
});
