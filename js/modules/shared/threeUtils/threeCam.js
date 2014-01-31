/**
 * @author Kate Compton
 */

define(["common", "three"], function(common, THREE) {'use strict';
    var threeToString = function(v) {
        return "(" + v.x.toFixed(2) + "," + v.y.toFixed(2) + "," + v.z.toFixed(2) + ")";
    };

    var ThreeCam = Vector.extend({
        init : function(w, h) {
            this._super();
            this.projector = new THREE.Projector();
            this.w = w;
            this.h = h;

            this.orbit = {
                position : new Vector(),
                distance : 200,
                phi : 3.9,
                theta : .95,
                phiMin : 3.2,
                phiMax : 4.7,
            }

            this.forward = new THREE.Vector3(0, 1, 0);
            this.right = new THREE.Vector3(1, 0, 0);
            this.up = new THREE.Vector3(0, 0, -1);

            this.screenCenter = new Vector(0, 0);

            // Make a camera
            var VIEW_ANGLE = 45, ASPECT = w / h, NEAR = 0.1, FAR = 10000;
            this.screenQuadCorners = [];
            for (var i = 0; i < 4; i++) {
                this.screenQuadCorners[i] = new Vector();
            }

            this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
            this.camera.position.z = 300;
            //    this.updateOrbit();
        },

        worldToScreen : function(worldPos, screenPos) {

            var threeVector = new THREE.Vector3();
            worldPos.cloneInto(threeVector)

            var ray = Vector.sub(worldPos, this.orbit.position);
            var d = ray.magnitude();
            if (this.testForward) {
                if (!this.forward)
                    return false;

                var angle = Vector.angleBetween(this.forward, ray);
                if (angle < -2)
                    return false;
            }

            var threeScreen = this.projector.projectVector(threeVector, this.camera);
            var scale = .5;
            screenPos.setTo(threeScreen.x * this.w * scale, -threeScreen.y * this.h * scale, d);
            screenPos.add(this.screenCenter);

            return true;
        },

        screenToPlanar : function(screenPos, planarPos) {
            // Calculate the intersection with the ground plane

            var pos = new Vector(screenPos);
            pos.sub(this.screenCenter);

            var sweep = .0325;
            var p = new Vector(this.orbit.position);

            var ray = new Vector(0, 0, 0);
            ray.addMultiple(this.forward, 20);
            ray.addMultiple(this.up, sweep * -pos.y);
            ray.addMultiple(this.right, sweep * pos.x);

            var m = -p.z / ray.z;
            planarPos.setTo(this.orbit.position);

            planarPos.addMultiple(ray, m);
        },

        cloneOrbit : function(orbit) {
            return {
                position : new Vector(orbit.position),
                distance : orbit.distance,
                phi : orbit.phi,
                theta : orbit.theta,
            }
        },

        copyInto : function(original, orbit) {
            orbit.position.setTo(original.position);
            orbit.distance = original.distance;

            orbit.phi = original.phi;
            orbit.theta = original.theta;
        },

        bookmark : function() {
            console.log("Bookmark " + this);
            this.bookmarkOrbit = this.cloneOrbit(this.orbit);
        },

        offsetFromBookmark : function(dTheta, dPhi) {
            if (!this.bookmarkOrbit)
                throw ("Can't offset from non-existant bookmark");
            this.copyInto(this.bookmarkOrbit, this.orbit);
            this.orbit.theta += dTheta;

            this.orbit.phi += dPhi;
            this.orbit.phi = utilities.constrain(this.orbit.phi, this.orbit.phiMin, this.orbit.phiMax);
            this.updateOrbit();
        },

        clearBookmark : function(reset) {
            console.log("Clear bookmark for " + this);
            //   this.copyInto(this.bookmarkOrbit, this.orbit);
            this.bookmarkOrbit = undefined;
        },

        updateOrbit : function() {
            var camera = this.camera;

            this.orbit.position.setTo(this);
            this.orbit.position.addSpherical(this.orbit.distance, this.orbit.theta, this.orbit.phi);

            camera.position.copy(this.orbit.position);
            camera.up = new THREE.Vector3(0, 0, -1);
            camera.lookAt(this);

            camera.updateMatrix();
            // make sure camera's local matrix is updated
            camera.updateMatrixWorld();
            // make sure camera's world matrix is updated
            camera.matrixWorldInverse.getInverse(camera.matrixWorld);

            // Find the forward, etc vectors for the camera
            var forward = new THREE.Vector3(0, 0, -1);
            forward.applyEuler(camera.rotation, camera.eulerOrder);
            this.forward = new Vector(forward);

            var up = new THREE.Vector3(0, 1, 0);
            up.applyEuler(camera.rotation, camera.eulerOrder);
            this.up = new Vector(up);

            var right = new THREE.Vector3(1, 0, 0);
            right.applyEuler(camera.rotation, camera.eulerOrder);
            this.right = new Vector(right);

            // Calculate the quad points
            var screenBorder = 20;
            var quadWidth = this.width - screenBorder * 2;
            var quadHeight = this.height - screenBorder * 2;

            for (var i = 0; i < 2; i++) {
                var xSide = i * 2 - 1;
                for (var j = 0; j < 2; j++) {
                    var ySide = j * 2 - 1;

                    // Calculate the intersection with the ground plane
                    var x = (i - .5) * quadWidth;
                    var y = (j - .5) * quadHeight;
                    //  this.universeView.projectToPlanePosition(new Vector(x, y), camera.screenQuadCorners[i * 2 + j]);
                }
            }
            // Swap 2 and 3
            var temp = new Vector(this.screenQuadCorners[2]);
            this.screenQuadCorners[2].setTo(this.screenQuadCorners[3]);
            this.screenQuadCorners[3].setTo(temp);
        }
    });

    return ThreeCam;
});
