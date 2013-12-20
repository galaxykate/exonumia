/**
 * @author Kate Compton
 */
define(["common", "three", 'helvetiker'], function(common, THREE, helv) {'use strict';

    var createText = function() {

        // add 3D text

        var materialArray = [defaultMaterial, defaultMaterial];
        var options = {
            size : 15,
            height : 20,
            curveSegments : 1,
            font : "helvetiker",
            weight : "normal",
            style : "normal"
        };

        console.log(THREE.FontUtils);
        var textGeom = new THREE.TextGeometry("Hello, World!", options);
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
    }
}); 