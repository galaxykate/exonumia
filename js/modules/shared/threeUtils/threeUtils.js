/**
 * @author Kate Compton
 */

var prefix = "modules/shared/threeUtils/";
define(["common", prefix + "threeView", prefix + "threeCam", prefix + "threeFonts", prefix + "modGeo", prefix + "objExport"], function(common, ThreeView, ThreeCam, ThreeFonts, ModGeo, OBJFile) {'use strict';

    return {
        ThreeView : ThreeView,
        OBJFile : OBJFile,
        ThreeCam : ThreeCam,
        ThreeFonts : ThreeFonts,
        ModGeo : ModGeo,
    };
});
