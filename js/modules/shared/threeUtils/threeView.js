/**
 * @author Kate Compton
 */

define(["common", "three", "./threeCam"], function(common, THREE, ThreeCam) {'use strict';

    THREE.Vector3.prototype.toString = function() {
        return "(" + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.z.toFixed(2) + ")";
    };

    var ThreeView = Class.extend({
        init : function(div, prerender) {

            var view = this;
            this.prerender = prerender;

            this.w = div.width();
            this.h = div.height();

            this.onscreenObjects = [];

            this.rendering = true;

            view.camera = new ThreeCam(this.w, this.h);
            view.renderer = new THREE.WebGLRenderer();

            var camera = this.camera.camera;

            // start the renderer
            view.renderer.setSize(this.w, this.h);

            view.scene = new THREE.Scene();
            var sphere = new THREE.Mesh(new THREE.SphereGeometry(50, 10, 10), new THREE.MeshNormalMaterial());
            var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, 40, 10, 10, false), new THREE.MeshNormalMaterial());
            cylinder.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI/2);
            view.scene.add(cylinder);

            this.marker = new THREE.Mesh(new THREE.SphereGeometry(10, 5, 5), new THREE.MeshNormalMaterial());
            this.marker.position.x += 80;
            //  view.scene.add(this.marker);

            // add the camera to the scene
            view.scene.add(camera);

            view.addLights();

            this.frameCount = 0;
            function render() {

                if (view.rendering) {
                    view.frameCount++;
                    if (view.prerender !== undefined)
                        view.prerender();

                    view.renderer.render(view.scene, camera);
                }
            }

            // Set up the repeating rendering to create animation
            // Paul Irish's Shim
            // shim layer with setTimeout fallback
            window.requestAnimFrame = (function() {
                return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
            })();

            (function animloop() {
                requestAnimFrame(animloop);
                render();
            })();
            // place the rAF *before* the render() to assure as close to
            // 60fps with the setTimeout fallback.

            // attach the render-supplied DOM element
            div.append(view.renderer.domElement);

            // Test
            this.screenCorners = [];
            for (var i = 0; i < 4; i++) {
                this.screenCorners[i] = new Vector();
            }
            this.setScreenQuadCorners(this.screenCorners, -20);

        },

        moveMarkerToScreenPos : function(screenPos) {
            var planarPos = new Vector();
            this.screenToPlanar(screenPos, planarPos);

            this.marker.position.copy(planarPos);

        },
        //========================================================
        //========================================================
        //========================================================
        //========================================================
        // Screenquad

        setScreenQuadCorners : function(corners, border) {
            for (var i = 0; i < 4; i++) {
                var x = Math.floor(((i + 1) % 4) / 2) * 2 - 1;
                var y = Math.floor(((i + 4) % 4) / 2) * 2 - 1;

            }
        },

        //========================================================
        //========================================================
        //========================================================
        //========================================================
        // Position conversions

        screenToPlanar : function(screenPos, planarPos) {
            return this.camera.screenToPlanar(screenPos, planarPos);
        },

        worldToScreen : function(worldPos, screenPos) {
            return this.camera.worldToScreen(worldPos, screenPos);
        },

        //========================================================
        //========================================================
        //========================================================
        //========================================================
        // Scene accessories

        addLights : function() {

            // create a point light
            var pointLight = new THREE.PointLight(0xFFFFFF);

            // set its position
            pointLight.position.x = 10;
            pointLight.position.y = 50;
            pointLight.position.z = 130;

            // add to the scene
            this.scene.add(pointLight);
        }
    });

    return ThreeView;
});
