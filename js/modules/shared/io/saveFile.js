/**
 * @author Kate Compton
 */

define([], function() {'use strict';

    function saveFile(fileName, extension, data) {
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
            fs.root.getFile(fileName + "." + extension, {
                create : true
            }, function(fileEntry) {// test.bin is filename
                fileEntry.createWriter(function(fileWriter) {
               /*
                    var arr = new Uint8Array(3);
                    // data length

                    arr[0] = 97;
                    // byte data; these are codes for 'abc'
                    arr[1] = 98;
                    arr[2] = 99;

                    var blob = new Blob([arr]);
                    */
                   var blob = new Blob(["Hello world!"], { type: "text/plain" });

                    fileWriter.addEventListener("writeend", function() {
                        // navigate to file, will download
                        location.href = fileEntry.toURL();
                    }, false);

                    fileWriter.write(blob);
                }, function() {
                });
            }, function() {
            });
        }, function() {
        });
    }

    return {
        saveFile : saveFile,
    }
});
