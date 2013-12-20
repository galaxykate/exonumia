var prefix = "modules/shared/graphs/";

define([prefix + "curvepath", prefix + "linepath", prefix + "pathpoint", prefix + "pathset"], function(CurvePath, LinePath, PathPoint, PathSet) {
    return {
        CurvePath : CurvePath,
        LinePath : LinePath,
        PathPoint : PathPoint,
        PathSet : PathSet,
    }
});
