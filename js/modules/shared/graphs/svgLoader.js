/**
 * @author Kate Compton
 */
define(["common", "./edge", "threeUtils", "./path", "./graph"], function(common, Edge, threeUtils, Path, Graph) {'use strict';
    var commandLengths = {
        C : 3,
        S : 2,
        L : 1,
        Z : 1,
        M : 1,
    };

    // Parse this SVG data into vectors
    var parseIntoVectors = function(data) {
        //var sections = data.split(" ");
        if (data.length === 0)
            return [];

        data = data.trim();
        var sections = data.split(/[ ,]+/);
        var index = 0;
        var vectors = [];
        var v;
        while (index < sections.length) {
            if (index !== sections.length - 1)
                v = new Vector(parseFloat(sections[index]), parseFloat(sections[index + 1]));
            else
                v = new Vector(parseFloat(sections[index]), parseFloat(sections[index]));

            vectors.push(v);

            index = index + 2;
        }
        return vectors;

    };

    var addSVGPath = function(graph, svg) {

        // Parse the svg
        var tokens = svg.split(" ");
        var index = 0;

        // Regex from "http://stackoverflow.com/questions/4681800/regex-to-match-svg-path-data-in-javascript"
        var pathSegmentPattern = /[a-z][^a-z]*/ig;
        var pathSegments = svg.match(pathSegmentPattern);
        var last = new Vector();

        var currentPath;

        var point;
        if (pathSegments === null) {

        } else {
            $.each(pathSegments, function(index, segment) {

                var command = segment.charAt(0);
                var data = segment.slice(1);
                data = data.replace(/-/g, ',-');
                data = data.replace(/,,/g, ',');
                data = data.replace(/\s,/g, ',');
                data = data.replace(/,/g, ' ');
                if (data.charAt(0) === ",")
                    data = data.slice(1);
                data = data.trim();

                var vectors = parseIntoVectors(data);

                var isRelative = (command === command.toLowerCase());

                // What type of command is it, and how many nodes does each step have?
                var commandType = command.toUpperCase();
                var commandLength = commandLengths[commandType];
                var count = vectors.length / commandLength;
                // For each step of this command
                for (var i = 0; i < count; i++) {
                    var index = i * commandLength;

                    if (isRelative) {

                        for (var j = 0; j < commandLength; j++) {
                            vectors[j + index].add(last);
                        }
                    }
                    switch(commandType) {

                        case "M":
                            if (currentPath !== undefined)
                                graph.addPath(currentPath);

                            currentPath = new Path("SVGPath" + graph.paths.length);
                            point = new Vector(vectors[index]);
                            var edge = currentPath.addEdgeTo(point);
                            break;

                        case "L":
                            point = new Vector(vectors[index]);

                            var edge = currentPath.addEdgeTo(point);
                            break;

                        case "V":
                            point = new Vector(last.x, vectors[index].y);

                            var edge = currentPath.addEdgeTo(point);
                            break;

                        case "H":
                            point = new Vector(vectors[index].x, last.y);

                            var edge = currentPath.addEdgeTo(point);
                            break;

                        case "C":

                            point = new Vector(vectors[index + 2]);
                            var edge = currentPath.addEdgeTo(point);
                            edge.makeHandles();
                            edge.handles[0].setFromPosition(vectors[index]);
                            edge.handles[1].setFromPosition(vectors[index + 1]);

                            break;

                        case  "S":

                            point = new Vector(vectors[index + 1]);
                            var edge = currentPath.addEdgeTo(point);

                            break;
                        case "Z":

                            break;
                    };

                    if (point !== undefined) {
                        point.command = command;
                        last.setTo(point);
                    }

                }

                if (commandType === 'Z') {
                    console.log(currentPath);
                    // Close the graph: make the end point the same as the start point
                    var lastEdge = currentPath.edges[currentPath.edges.length - 1];
                    lastEdge.setEnd(currentPath.nodes[0]);

                    // Remove the last point in the array
                    currentPath.nodes.pop();
                }

            });

        }

        if (currentPath !== undefined)
            graph.addPath(currentPath);

    };

    // Parse an svg file
    // Load a number of SVG "paths" but we'll call "regions", each of which might have MOVE
    //   commands and thus be a series of closed or non-closed paths
    var parseSVG = function(graph, filename, callback) {
        console.log("Load from SVG: " + filename);
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
                        addSVGPath(graph, pathData);
                    }
                });
       
                if (callback)
                    callback(graph);
            }
        });

    };

    return {
        parseSVG : parseSVG,

    }

});
