/**
 * @author Kate Compton
 */

/*
 * a region is some closed path with no self-intersections
 */

define(["common", "./curvepath", "./graph"], function(common, CurvePath, Graph) {'use strict';

    // A single horizontal slice of the region (if it were lofted)
    //   It may contain many rings

    var RegionLevel = Class.extend({
        init : function(region, levelNumber) {
            this.region = region;
            this.levelNumber = levelNumber;

            this.graph = new Graph();

        },

        makeLevel : function(index, offset) {
            var level = new RegionLevel(this.region, index);
            level.copySegments(this);

            // Offset the points
            $.each(level.points, function(index, pt) {
                pt.addPolar(offset, pt.rotation);
            });
            return level;
        },

        addCurvePathSegments : function(path) {
            var curvePts = path.createVertices(3);
            var graph = this.graph;
            var last = undefined;

            $.each(curvePts, function(index, pt) {
                if (last !== undefined) {
                    graph.addEdge(last, pt);
                }
                last = pt;

            });

            // Close the loop
            graph.addEdge(last, curvePts[0]);

            graph.finish();

        },

        draw : function(context) {
            app.log("Draw " + this.levelNumber);
            var lvl = this;
            var g = context.g;
            this.graph.draw(g);

        }
    });

    var regionCount = 0;
    var Region = Class.extend({

        init : function() {

            this.idNumber = regionCount;
            regionCount++;

            this.originalPaths = [];
            this.levels = [];
        },

        addPath : function(path) {
            this.originalPaths.push(path)
        },

        loft : function() {
            console.log("Loft " + this);
            var startLevel = new RegionLevel(this, 0);
            this.levels[0] = startLevel;
            // Add all the segments
            $.each(this.originalPaths, function(index, path) {
                startLevel.addCurvePathSegments(path);

            });

            var levelCount = 0;
            for (var i = 0; i < levelCount; i++) {
                var index = i + 1;
                var lvl = this.levels[0].makeLevel(index, -14 * index);
                this.levels[index] = lvl;
            }
        },

        createMesh : function() {
            this.loft();
            this.mesh = new THREE.Object3D();
            return this.mesh;
        },

        draw : function(context) {

            var g = context.g;

            $.each(this.levels, function(index, level) {
                level.draw(context);
            });
        },

        toString : function() {
            return "Region" + this.idNumber;
        }
    });

    return Region;

});
