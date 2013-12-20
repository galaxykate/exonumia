/**
 * @author Kate Compton
 */
define(["common", "graph", "threeUtils"], function(common, graph, threeUtils) {
    var svgs = ["tricky", "cw", "ccw", "flower", "Tiki_Statue", "bird", "testshape2", "labyrinth"];
    var Coin = Class.extend({
        init : function() {

            this.regions = [];

            this.path = new graph.CurvePath();
            this.sourceIndex = 0;

            var sides = 40;
            this.radius = 100;
            var handleW = 2.8 * this.radius / sides;
            this.designTransform = new common.Transform();

            var dTheta = Math.PI * 2 / sides;
            for (var i = 0; i < sides; i++) {
                var theta = i * dTheta;
                var offset = (i % 2);
                var r = this.radius * (1 - .1 * offset);
                var w = handleW * (1 - .5 * offset);
                var pt = new graph.PathPoint(r * Math.cos(theta), r * Math.sin(theta), w, w, theta - Math.PI / 2);
                this.path.addPoint(pt);

            }

            this.mesh = this.path.createThreeMesh({
                rings : 3,
                capRings : 5,
                height : 40,
            });

            this.loadPathsFromSVG();
        },

        loadPathsFromSVG : function() {
            var coin = this;
            console.log("Load SVG for: " + svgs[this.sourceIndex]);
            console.log("Remove mesh children");
            if (this.pathSet !== undefined) {

                // Remove the region meshes and reset the regions
                $.each(this.regions, function(index, region) {
                    coin.mesh.remove(region.mesh);
                })
                coin.regions = [];
            }

            this.pathSet = new graph.PathSet();

            this.pathSet.parseSVG(svgs[this.sourceIndex], function(pathSet) {
                coin.regions = pathSet.calculateRegions();
                $.each(coin.regions, function(index, region) {
                    //     coin.mesh.add(region.createMesh());
                });
            });

            this.sourceIndex = (this.sourceIndex + 1) % svgs.length;

        },

        draw : function(g) {

            g.fill(.12, 1, 1);
            g.stroke(0);
            g.strokeWeight(2);

            var context = {
                g : g,
                drawPath : true,
                useCurves : true,
            }
            this.path.draw(context);
            g.pushMatrix();

            context.drawPoints = true;
            context.drawControlPoints = true;
            //console.log(this.designTransform.toString());
            this.designTransform.applyTransform(g);
            this.pathSet.draw(context);
            $.each(this.regions, function() {
                //   this.draw(context);
            });
            g.popMatrix();
        }
    });

    return Coin;
});
