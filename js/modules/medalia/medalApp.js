/**
 * @author Kate Compton
 */

define(["ui", "app", "common", "threeUtils", "./coin"], function(UI, App, common, threeUtils, Coin) {
    var w = 500;
    var h = 500;

    var MedalApp = App.extend({

        init : function() {
            window.watch("app", function() {
                console.log("app changed to " + app);
            });

            this._super("Medals", new Vector(w, h));

            app.paused = false;

            this.changeMode("drawing");

            this.coin = new Coin();
            app.threeRender.scene.add(app.coin.mesh);

        },

        initModes : function() {

            var ui = app.ui;

            // Create modes:
            // Each mode has some panels that only appear during that mode, and
            // Some custom control functionality

            this.modes = {

                drawing : new UI.Mode({
                    title : "drawing",
                    panels : app.ui.getPanels(),
                    // Control mapping

                }),

            };

            $.each(this.modes, function(key, mode) {
                mode.id = key;
            });

        },

        initControls : function() {

            // Set all the default UI controls
            app.controls = new UI.Controls($("body"), {

                onKeyPress : {
                    d : function(event) {
                        app.ui.devMode.toggle();
                        console.log("Dev mode");
                    },

                    c : function() {
                        app.coin.loadPathsFromSVG();
                    },

                    space : function() {
                        app.paused = !app.paused;
                    },
                },

            });

            var touchRender = app.controls.addTouchable("three", $("#three_panel"));
            var touchDraw = app.controls.addTouchable("drawing", $("#drawing_canvas"));
            touchRender.onDrag(function(touchwindow, p) {
                var cam = app.threeRender.camera;
                cam.orbit.theta = p.x * -.003;
                cam.orbit.phi = -p.y * .004 + 1.7;
                console.log(p);
                cam.updateOrbit();

            });
            touchRender.onUp(function(touchwindow, p) {
                app.pauseSpinning = false;
            });

            touchRender.onDown(function(touchwindow, p) {
                app.pauseSpinning = true;
            });

            touchRender.onScroll(function(touchwindow, delta) {
                var cam = app.threeRender.camera;
                cam.orbit.distance *= 1 + .03 * delta;
                cam.orbit.distance = utilities.constrain(cam.orbit.distance, 200, 1000);
                console.log(delta + " " + cam.orbit.distance);
                cam.updateOrbit();

            });

            touchDraw.onDrag(function(touchwindow, p) {
                var x = p.x - touchwindow.rect.w / 2;
                var y = p.y - touchwindow.rect.h / 2;
                app.coin.designTransform.setTo(x, y, 0);
                console.log(app.coin.designTransform);
            });

            touchDraw.onScroll(function(touchwindow, delta) {
                app.coin.designTransform.scale *= 1 + .03 * delta;
                app.coin.designTransform.scale = utilities.constrain(app.coin.designTransform.scale, .3, 3);

            });
        },

        initUI : function() {

            var ui = this.ui;

            // Create the Three scene
            app.threeRender = new threeUtils.ThreeView($("#three_panel"), function() {
                // update the camera

                if (!app.pauseSpinning) {
                    this.camera.orbit.theta += .01;

                    this.camera.orbit.phi = .93;
                }
                // app.log(this.camera.orbit.theta);
                this.camera.updateOrbit();
            });

            app.threeWindow = new UI.DrawingWindow("3D Bot View", $("#three_panel"));
            app.drawingWindow = new UI.DrawingWindow("drawing", $("#drawing_canvas"));

            app.drawingProcessing = ui.addProcessingWindow(app.drawingWindow.element, function(g) {
                app.drawingWindow.setProcessing(g);

            }, function(g) {
                // Updates

                // only do if its the inspector mode
                if (app.mode === app.modes.drawing) {
                    // Updates
                    app.ui.output.clear();
                    if (!app.paused) {
                        app.worldTime.updateTime(g.millis() * .001);

                        app.drawingWindow.render(function(context) {
                            g.background(.55, 1, 1);

                            app.coin.draw(g);
                        });
                    }
                }
            });

        },
    });

    return MedalApp;
});
