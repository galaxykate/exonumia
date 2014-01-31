/**
 * @author Kate Compton
 */
define(["common", "three", 'helvetiker', "graph"], function(common, THREE, helv, Graph) {'use strict';

    /*
     material : coin.material,
     text : s,
     size : 10,
     font : "foo",
     */

    var toVectorArray = function(argArray, expectedArguments, replacement) {

        var array = [];
        if (argArray.length === expectedArguments) {
            for (var i = 0; i < expectedArguments; i++) {
                array.push(new Vector(argArray[i].x, argArray[i].y));
            }

        }

        if (argArray.length === expectedArguments * 2) {
            for (var i = 0; i < expectedArguments; i++) {
                array.push(new Vector(argArray[i * 2], argArray[i * 2 + 1]));
            }
        }
        if (argArray.length === expectedArguments * 3) {
            for (var i = 0; i < expectedArguments; i++) {
                array.push(new Vector(argArray[i * 3], argArray[i * 3 + 1], argArray[i * 3 + 2]));
            }
        }
        if (array.length > 0) {

            if (replacement) {
                if (array[0].getDistanceTo(replacement) < .1)
                    array[0] = replacement;
            }
            return array;
        }

        throw ("Expected arguments of length " + expectedArguments + ", unsure of what to do with ", argArray);
    };

    var createPathsFromThreePath = function(threePath) {
        var paths = [];
        var path;
        for (var i = 0; i < threePath.actions.length; i++) {
            var action = threePath.actions[i];
            switch(action.action) {
                case "moveTo" :
                    if (path) {
                        // add the previous path to the shape
                        paths.push(path);
                    }
                    path = new Graph.Path();
                    var points = toVectorArray(action.args, 1, path.getStart());

                    path.moveTo(points[0]);
                    break;
                case "lineTo" :
                    var points = toVectorArray(action.args, 1, path.getStart());
                    path.lineTo(points[0]);
                    break;
                case "quadraticCurveTo" :
                    var points = toVectorArray(action.args, 2, path.getStart());
                    path.quadCurveTo(points[0], points[1]);
                    break;
                case "curveTo" :
                    var points = toVectorArray(action.args, 3, path.getStart());
                    path.curveTo(points[0], points[1], points[2]);
                    break;
                default:
                    console.log("Unknown action: " + action.action);
            }

        }

        paths.push(path);
        return paths;
    };

    var createShapesFromText = function(text) {
        var textNoSpaces = text.replace(/\s/g, '');
        var textPaths = THREE.FontUtils.drawText(text).paths;
        var shapes = [];
        var currentShape;
        for (var i = 0; i < textPaths.length; i++) {

            var paths = createPathsFromThreePath(textPaths[i]);
            // A list for each letter containing every path that makes up that letter (two each for 'A' and 'i', etc)
            //  But these paths might be exterior or interior

            var count = 0;
            for (var j = 0; j < paths.length; j++) {

                var path = paths[j];
                if (path) {
                    var area = path.calculateArea();

                    if (area > 0) {
                        // exterior path, start a new shape

                        currentShape = new Graph.Shape(textNoSpaces.charAt(i) + count);
                        count++
                        shapes.push(currentShape);
                        currentShape.setOuterPath(paths[j]);
                    } else {
                        // interior path
                        currentShape.addInnerPath(paths[j]);
                    }
                }

            }
        }

        for (var i = 0; i < shapes.length; i++) {
            //    shapes[i].debugOutput();
        }

        return shapes;
    };

    var createText = function(context) {
        if (!context.text || context.text.length === 0)
            return new THREE.Object3D();

        // add 3D text

        var materialArray = [context.material, context.material];
        var options = {
            size : 15,
            height : 20,
            curveSegments : 1,
            font : "helvetiker",
            weight : "normal",
            style : "normal"
        };

        var textGeom = new THREE.TextGeometry(context.text, options);
        // font: helvetiker, gentilis, droid sans, droid serif, optimer
        // weight: normal, bold

        var textMaterial = new THREE.MeshFaceMaterial(materialArray);
        var textMesh = new THREE.Mesh(textGeom, textMaterial);

        textGeom.computeBoundingBox();
        var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;

        textMesh.position.set(-0.5 * textWidth, -8, 3);
        //textMesh.rotation.x = -Math.PI / 2;
        return textMesh;

    }

    return {
        createText : createText,
        createShapesFromText : createShapesFromText,
    }
});
