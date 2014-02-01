/**
 * @author Kate Compton
 */
define(["common", "./edge", "threeUtils", "./path", "./graph", "./shape"], function(common, Edge, threeUtils, Path, Graph, Shape) {'use strict';
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

    var svgToPaths = function(svg) {
        // Parse the svg
        var tokens = svg.split(" ");
        var index = 0;

        // Regex from "http://stackoverflow.com/questions/4681800/regex-to-match-svg-path-data-in-javascript"
        var pathSegmentPattern = /[a-z][^a-z]*/ig;
        var pathSegments = svg.match(pathSegmentPattern);

        var last = new Vector();

        var paths = [];
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
                //   console.log(command + " " + data);

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

                    point = vectors[index];
                    switch(commandType) {

                        case "M":
                            if (currentPath !== undefined)
                                paths.push(currentPath);

                            currentPath = new Path("SVGPath" + paths.length);
                            currentPath.moveTo(point);
                            break;

                        case "L":
                            currentPath.lineTo(point);
                            break;

                        case "V":
                            point = new Vector(last.x, vectors[index].y);
                            currentPath.lineTo(point);

                            break;

                        case "H":
                            point = new Vector(vectors[index].x, last.y);

                            currentPath.lineTo(point);

                            break;

                        case "C":

                            point = new Vector(vectors[index + 2]);

                            currentPath.curveTo(vectors[index], vectors[index + 1], point);

                            break;

                        case  "S":
                            // FIX: does this work?
                            point = new Vector(vectors[index + 1]);
                            currentPath.smoothCurveTo(vectors[index], point);

                            break;
                        case "Z":

                            break;

                        default:
                            throw ("Unknown command: " + commandType);
                    };

                    if (point !== undefined) {
                        point.command = command;
                        last.setTo(point);
                    }

                }

                if (commandType === 'Z') {
                    // Add last edge?
                }

            });
        }

        if (currentPath !== undefined)
            paths.push(currentPath);

        console.log(paths);
        return paths;

    };

    // Parse an svg file
    // Load a number of SVG "paths" but we'll call "regions", each of which might have MOVE
    //   commands and thus be a series of closed or non-closed paths
    var parseSVGIntoShapes = function(filename, callback) {

        console.log("Load from SVG: " + filename);

        var parser = new DOMParser();
        $.ajax({
            url : "svg/" + filename + ".svg",
            dataType : "text",
            success : function(data) {
                var shapes = [];

                var xml = $.parseXML(data);
                // Make a path for each path in the xml and use the xml to fill it out
                $("path", xml).each(function(index) {
                    var pathData = this.getAttribute("d");

                    var paths = svgToPaths(pathData);
                    var shape = new Shape("SVG " + index);
                    var outerArea = 0;
                    var outerSign = 1;
                    for (var i = 0; i < paths.length; i++) {
                        var area, sign;
                        var isInner = false;
                        if (i === 0) {
                            area = paths[i].calculateArea();
                            sign = area ? area < 0 ? -1 : 1 : 0;
                            isInner = false;
                        } else {
                            // is it the same winding as the outer?
                            area = paths[i].calculateArea();
                            sign = area ? area < 0 ? -1 : 1 : 0;
                            if (sign === outerSign) {
                                // start a new shape
                                shapes.push(shape);
                                shape = new Shape("SVG " + index + "." + i);
                                isInner = false;
                            } else {
                                isInner = true;
                            }

                        }

                        console.log(i + ": " + sign + " " + area + ": " + isInner);

                        if (isInner) {
                            shape.addInnerPath(paths[i]);
                        } else {
                            shape.setOuterPath(paths[i]);
                            outerArea = paths[i].calculateArea();
                            outerSign = outerArea ? outerArea < 0 ? -1 : 1 : 0;
                        }
                    }

                    shapes.push(shape);
                    //   console.log("shape: " + shape);
                });

                console.log("Generated " + shapes.length + " shapes");
                for (var i = 0; i < shapes.length; i++) {
                    console.log("Shape " + i);
                    console.log("  outer: " + shapes[i].outerPath.calculateArea());
                    for (var j = 0; j < shapes[i].innerPaths.length; j++) {
                        console.log("  " + j + ": " + shapes[i].innerPaths[j].calculateArea());
                    }
                }

                if (callback)
                    callback(shapes);
            }
        });

    };

    return {
        parseSVGIntoShapes : parseSVGIntoShapes,

    }

});
