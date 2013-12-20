/**
 * @author Kate Compton
 */

var prefix = "modules/shared/threeUtils/";
define(["common", prefix + "threeView", prefix + "threeCam", prefix + "threeFonts", prefix + "modGeo"], function(common, ThreeView, ThreeCam, ThreeFonts, ModGeo) {'use strict';

    return {
        ThreeView : ThreeView,
        ThreeCam : ThreeCam,
        ThreeFonts : ThreeFonts,
        ModGeo : ModGeo,
    };
});
