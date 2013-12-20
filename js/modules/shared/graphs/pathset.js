/**
 * @author Kate Compton
 */
define(["common", "./curvepath", "./pathregion"], function(common, CurvePath, PathRegion) {'use strict';
    var PathSet = Class.extend({
        init : function() {
            this.paths = [];

        },

        parseSVG : function(filename, callback) {
            var pathSet = this;
            var parser = new DOMParser();
            $.ajax({
                url : "svg/" + filename + ".svg",
                dataType : "text",
                success : function(data) {

                    var xml = $.parseXML(data);

                    // Make a path for each path in the xml and use the xml to fill it out
                    $("path", xml).each(function() {
                        var pathData = this.getAttribute("d");
                        if (pathData.length > 0) {
                            pathSet.pathFromSVG(pathData);
                        }
                    });
                    pathSet.calculateBoundingBox();
                    callback(pathSet);
                }
            });

        },

        calculateRegions : function() {
            this.regions = [];

            var pr = new PathRegion();
            pr.addPath(this.paths[0]);
            this.regions.push(pr);
            return this.regions;
        },

        pathFromSVG : function(pathData) {
            var path = new CurvePath();
            path.addSVG(pathData);
            this.paths.push(path);
        },

        calculateBoundingBox : function() {
            var b = this.paths[0].boundingBox.clone();

            $.each(this.paths, function(index, path) {
                b.stretchToContainBox(path.boundingBox);
            });
            this.boundingBox = b;

            var targetW = 300;
            var targetH = 300;
            var b = this.boundingBox;
            var scale = Math.min(targetW / b.w, targetH / b.h);
            var offset = new Vector(-b.x - b.w / 2, -b.y - b.h / 2);

            // center everything relative to this bounding box
            $.each(this.paths, function(index, path) {
                path.transform(offset, scale, 0);

            });

        },

        createMesh : function() {
            if (this.mesh === undefined)
                this.mesh = new THREE.Object3D();

            var set = this;
            $.each(this.paths, function(i, path) {
                var pathMesh = path.createThreeMesh({

                    rings : 3,
                    capRings : 0,
                    height : 160,
                });
                set.mesh.add(pathMesh);

            });
            console.log(set.mesh);

            return set.mesh;
        },

        draw : function(context) {
            var g = context.g;
            g.pushMatrix();

            $.each(this.paths, function(i, path) {
                path.draw(context);
            });

            g.popMatrix();

        },
    });

    return PathSet;
});
