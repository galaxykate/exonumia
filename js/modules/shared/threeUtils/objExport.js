/**
 * @author Kate Compton
 */
/**
 * @author Kate Compton
 */
define(["common"], function(common) {"use strict";

    var precision = 2;
    var scaleFactor = .1;
    // utility functions
    var vectorToOBJ = function(v) {
        return "" + v.x.toFixed(precision) + " " + v.y.toFixed(precision) + " " + v.z.toFixed(precision);
    };

    var OBJFile = Class.extend({
        init : function(name) {
            this.name = name;

            this.vertCount = 1;
            this.faceCount = 1;

            this.lines = [];
        },

        //--------------------------------------------------
        addVertex : function(p, object) {
            var vector = p.clone();
            var s = vectorToOBJ(vector);
            vector.applyMatrix4(object.matrixWorld);

            //   console.log(s + "->" + vectorToOBJ(vector));
            this.lines.push("v " + vectorToOBJ(vector));

        },

        addMesh : function(object) {

            if (object.children) {
                console.log("Export children of " + object.name);
                for (var i = 0; i < object.children.length; i++) {
                    this.addMesh(object.children[i]);
                }
            }

            // Actually add the geometry
            if (object.geometry) {
                var geo = object.geometry;
                var vertLen = geo.vertices.length;
                var faceLen = geo.faces.length;

                console.log("Export geometry: " + object.name);

                // get the vertex offset
                var vertOffset = this.vertCount;
                var normalOffset = this.faceCount;

                // Add all the vertices
                this.lines.push("\n# " + object.name + " Vertices");
                for (var i = 0; i < vertLen; i++) {
                    this.addVertex(geo.vertices[i], object);
                }

                /*
                obj.push("\n# Face Normals");
                for ( i = 0; i < facelen; i++) {
                this.addNormal(rotationMatrix);
                }
                */

                // Add all the faces
                this.lines.push("\n# " + object.name + " Face Definitions");
                for ( i = 0; i < faceLen; i++) {
                    this.addFace(geo.faces[i], vertOffset, normalOffset);
                }

                this.vertCount += vertLen;
                this.faceCount += faceLen;

                console.log("Total, verts:" + this.vertCount + " faces:" + this.faceCount);
            }

        },
        //--------------------------------------------------
        // Add a face, given the offset of the vertices
        addFace : function(face, vertOffset, normalOffset, faceNormal) {
            var a = face.a + vertOffset;
            var b = face.b + vertOffset;
            var c = face.c + vertOffset;
            var d = face.d + vertOffset;

            var lines = this.lines;
            // Tri faces
            if (face.d === undefined) {
                if (faceNormal === undefined)
                    lines.push('f ' + a + ' ' + b + ' ' + c);
                else
                    lines.push('f ' + a + '//' + faceNormal + ' ' + b + '//' + faceNormal + ' ' + c + '//' + faceNormal);

            }
            // Quad faces
            else {
                if (faceNormal === undefined)
                    lines.push('f ' + a + ' ' + b + ' ' + c + ' ' + d);
                else
                    lines.push('f ' + a + '//' + faceNormal + ' ' + b + '//' + faceNormal + ' ' + c + '//' + faceNormal + ' ' + d + '//' + faceNormal);
            }
        },
        toHTMLText : function() {
            return this.lines.join("<br>");
        },
        toText : function(useNewLines) {
            if (useNewLines)
                return this.lines.join("\n");
            return this.lines.join(" ");
        },

        chromeSave : function() {

            var textToWrite = this.toText(true);
            var textFileAsBlob = new Blob([textToWrite], {
                type : 'text/plain'
            });
            var fileNameToSaveAs = "xyzlog";

            var downloadLink = document.createElement("a");
            downloadLink.download = fileNameToSaveAs;
            downloadLink.innerHTML = "Download File";
            if (window.webkitURL != null) {
                // Chrome allows the link to be clicked
                // without actually adding it to the DOM.
                downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            } else {
                // Firefox requires the link to be added to the DOM
                // before it can be clicked.
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }

            downloadLink.click();
        },
    });

    return OBJFile;

});

