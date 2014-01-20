/**
 * @author Kate Compton
 */
define(["common", "./edge", "./graph", "./path"], function(common, Edge, Graph, Path) {'use strict';
    var vertToString = function(v) {

        var index = "???";
        if (v.graphVertex)
            index = v.graphVertex.index;
        return index + "(" + v.x.toFixed(2) + v.y.toFixed(2) + ")"
    };

    var createVoronoiGraph = function(regionCenters, boundingBox) {
        var voronoiGraph = new Graph("Voronoi");
        var delaunayGraph = new Graph("Delaunay");
        var regions = [];

        var voronoi = new Voronoi();
        var range = 800;
        var bbox = {
            xl : boundingBox.x,
            xr : boundingBox.x + boundingBox.w,
            yt : boundingBox.y,
            yb : boundingBox.y + boundingBox.h
        };

        // From the example:
        // "a 'vertex' is an object exhibiting 'x' and 'y' properties. The
        // Voronoi object will add a unique 'voronoiId' property to all
        // sites. The 'voronoiId' can be used as a key to lookup the associated cell
        // in diagram.cells."

        var diagram = voronoi.compute(regionCenters, bbox);
    
        // Number all the indices
        $.each(diagram.vertices, function(index, v) {
            v.z = 0;
            var v2 = new Vector(v);
            voronoiGraph.nodes[index] = v2;
            v.graphVertex = v2;
            v2.index = index;
        });

        $.each(diagram.edges, function(index, edge) {

            // get the nodes associated with this edges
            var p0 = edge.va.graphVertex;
            var p1 = edge.vb.graphVertex;

            var edge2 = new Graph.Edge(p0, p1);
            voronoiGraph.edges[index] = edge2;
            edge.graphEdge = edge2;

     
        });

        // Sometimes there are duplicate nodes
        voronoiGraph.mergeNodes(1);

        // Create the region edges for each center
        $.each(regionCenters, function(index, center) {

            var path = new Path();
            center.path = path;
       
            var halfedges = diagram.cells[center.voronoiId].halfedges;
            if (halfedges.length === 0) {
            } else {

                // Some edges are missing, find them
                var nodeUse = [];

                // Add all the half-edges for this region
                $.each(halfedges, function(index, halfedge) {
                    var edge = halfedge.edge.graphEdge;
                    path.addEdge(edge);

                    edge.testColor = center.idColor;

                    var n0 = edge.start;
                    var n1 = edge.end;

                    // Error detection
                    if (n0.mergedWith) {
                        throw ("Using merged vert! " + n0);
                        n0 = n0.mergedWith;
                    }
                    if (n1.mergedWith) {
                        throw ("Using merged vert! " + n0);
                        n1 = n1.mergedWith;
                    }

                    // Count the node uses to see if there are ends
                    if (isNaN(nodeUse[n0.index]))
                        nodeUse[n0.index] = 0;
                    if (isNaN(nodeUse[n1.index]))
                        nodeUse[n1.index] = 0;

                    nodeUse[edge.start.index]++;
                    nodeUse[n1.index]++;
                });

                // Get any ends (things without 2 connections)
                var endIndices = [];
                $.each(nodeUse, function(index, val) {
                    if (!isNaN(val)) {
                        if (val !== 2) {
                            endIndices.push(index);
                        }
                    }
                });

                if (endIndices.length > 0) {
                    console.log("End indices " + endIndices[0] + " " + endIndices[1]);
                }
                 path.buildPath();
            }

        });
        voronoiGraph.cleanup();

        // Pack all the stuff into the graph object
        voronoiGraph.regions = regions;
        voronoiGraph.delaunayGraph = delaunayGraph;
        return voronoiGraph;
    };

    return {
        createVoronoiGraph : createVoronoiGraph
    }
});
