/**
 * @author Kate Compton
 */
define(["common", "three", 'helvetiker', "graph"], function(common, THREE, helv, Graph) {'use strict';
    var defaultMaterial = new THREE.MeshNormalMaterial();
    defaultMaterial.side = THREE.DoubleSide;

    /*
     material : coin.material,
     text : s,
     size : 10,
     font : "foo",
     */

    var toVectorArray = function(argArray, expectedArguments) {

        var array = [];
        if (argArray.length === expectedArguments) {
            for (var i = 0; i < expectedArguments; i++) {
                array.push(new Vector(argArray[i].x, argArray[i].y));
            }
            return array;
        }

        if (argArray.length === expectedArguments * 2) {
            for (var i = 0; i < expectedArguments; i++) {
                array.push(new Vector(argArray[i * 2], argArray[i * 2 + 1]));
            }
            return array;
        }
        if (argArray.length === expectedArguments * 3) {
            for (var i = 0; i < expectedArguments; i++) {
                array.push(new Vector(argArray[i * 3], argArray[i * 3 + 1], argArray[i * 3 + 2]));
            }
            return array;
        }

        throw ("Expected arguments of length " + expectedArguments + ", unsure of what to do with ", argArray);
    };

    var createShapeFromThreePath = function(name, threePath) {
        var shape = new Graph.Shape(name);
        var path;
        for (var i = 0; i < threePath.actions.length; i++) {
            var action = threePath.actions[i];
            switch(action.action) {
                case "moveTo" :
                    if (path) {
                        // add the previous path to the shape
                        shape.addPath(path);
                    }
                    path = new Graph.Path();
                    var points = toVectorArray(action.args, 1);
                    path.moveTo(points[0]);
                    break;
                case "lineTo" :
                    var points = toVectorArray(action.args, 1);
                    path.lineTo(points[0]);
                    break;
                case "quadraticCurveTo" :
                    var points = toVectorArray(action.args, 2);
                    path.quadCurveTo(points[0], points[1]);
                    break;
                case "curveTo" :
                    var points = toVectorArray(action.args, 3);
                    path.curveTo(points[0], points[1], points[2]);
                    break;
                default:
                    console.log("Unknown action: " + action.action);
            }

        }
        shape.addPath(path);
        return shape;
    };

    var createShapesFromText = function(text) {

        var textPaths = THREE.FontUtils.drawText(text).paths;
        var shapes = [];

        for (var i = 0; i < textPaths.length; i++) {
            shapes[i] = createShapeFromThreePath(text.charAt(i), textPaths[i]);
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
