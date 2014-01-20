/**
 * @author Kate Compton
 */
define(["common", "./tuning", "modules/shared/threeUtils/threeCam"], function(common, tuning, threeCam) {

    var fadeRange = .07;

    var UniverseCamera = threeCam.extend({
        init : function(w, h) {
            this._super(w, h);
            this.setZoom(.5);
            this.force = new Vector();
            this.zoomForce = 0;
            this.zoomSpeed = 0;
        },

        getRangePct : function(v, low, high) {
            var pct = utilities.constrain((v - low) / (high - low), 0, 1);
            return pct;
        },

        getUniverseOpacity : function(baseLOD) {
            // Fading out as we go into zoom mode
            if (this.zoom < tuning.lod.inspectFadeHigh)
                this.getRangePct(this.zoom, tuning.lod.inspectFadeLow, tuning.lod.inspectFadeHigh);

            // Fading in as we get into range
            if (this.zoom > baseLOD)
                return 1 - this.getRangePct(this.zoom, baseLOD, baseLOD + fadeRange);

            return 1;
        },

        setZoomForce : function(zp) {

            this.lastScroll = zp;
            if (zp !== 0) {
                var dir = zp / Math.abs(zp);
                //zp = dir * Math.pow(Math.abs(zp), .4);
                this.zoomForce += zp*30;
                //     this.zoomForce = utilities.constrain(this.zoomForce, -1, 1);
                //   this.zoomSpeed = utilities.lerp(.3*this.zoomForce, this.zoomSpeed, .6);
            }
        },

        update : function(t) {
            this.zoomForce *= Math.pow(.1, t.ellapsed);
            app.log("ZOOMFORCE " + this.zoomForce);
            //  this.zoomSpeed += this.zoomForce * t.ellapsed;
            //  this.zoomSpeed *= Math.pow(.1, t.ellapsed);
            this.modifyZoom(.2 * this.zoomForce * t.ellapsed);

            this.addMultiple(this.force, t.ellapsed);
            if (!this.force.isValid() || !this.isValid()) {
                console.log(this.force.invalidToString() + " " + this.invalidToString());
                throw ("invalid camera pos");
            }

        },

        // zoom should be [0, 1]
        setZoom : function(v) {
            this.zoom = utilities.constrain(v, 0, 1);
            this.orbit.phi = -1.2 * Math.pow(this.zoom, 2) + Math.PI / 2;
            this.orbit.distance = Math.pow(this.zoom, 2) * 2000 + 200;
            zoomInfo.html(this.zoom);

        },

        modifyZoom : function(delta) {
            this.setZoom(this.zoom + delta);
        },
    });

    return UniverseCamera;

});
