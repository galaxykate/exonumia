/**
 * @author Kate Compton
 */
define(["common", "modules/geo/path", "modules/geo/pathset", "modules/geo/particles/particle"], function(common, Path, PathSet, Particle) {'use strict';

    var geo = {
        Path : Path,
        PathSet : PathSet,
        Particle : Particle
    }
    return geo;

});
