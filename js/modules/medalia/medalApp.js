/**
 * @author Kate Compton
 */

var mottos = ["Sine scientia ars nihil est"];
var fontChoices = {
    gentilis : {
        name : "Gentilis",
        bold : "gentilis_bold",
        regular : "gentilis_regular",

    },

    helvetiker : {
        name : "Helvetiker",
        bold : "helvetiker_bold",
        regular : "helvetiker_regular",
    }
};

define(["ui", "app", "common", "threeUtils", "./coin", "./medallion", "./textLine", "./design"], function(UI, App, common, threeUtils, Coin, Medallion, TextLine, Design) {
    var w = 500;
    var h = 500;

    var MedalApp = App.extend({

        init : function() {

            this.textLines = [];
            this.textLineCount = 0;

            this._super("MedalsApp", new Vector(w, h));

            this.paused = false;

            this.changeMode("drawing");

            this.coin = new Coin(this);
            console.log(this + ": coin: " + this.coin);
            this.threeRender.scene.add(this.coin.mesh);

            // Font choices
            app.fontSelectionOptions = "";
            for (var key in fontChoices) {
                if (fontChoices.hasOwnProperty) {
                    var font = fontChoices[key];
                    app.fontSelectionOptions += "<option value='" + key + "'> " + font.name + "</option>";
                }
            };

            console.log(app.fontSelectionOptions);

            //this.addNewMedallion();
            this.addNewDesign();

            $("#new_text").click(function() {
                app.addNewTextLine();
            });
            $("#new_medallion").click(function() {
                app.addNewMedallion();
            });

            $("#new_design").click(function() {
                app.addNewDesign();
            });

            $("#export").click(function() {
                app.coin.exportToOBJ();
            });

        },

        //================================================================

        addNewMedallion : function() {
            var medallionHolder = $("#medallion_panel");
            var medallion = new Medallion(medallionHolder);
            app.coin.addMedallion(medallion);
        },

        addNewTextLine : function() {
            var textHolder = $("#text_panel");
            var text = new TextLine(textHolder);
            app.coin.addTextLine(text);

        },

        addNewDesign : function() {
            var designHolder = $("#design_panel");
            var design = new Design(designHolder);
            app.coin.addDesign(design);

        },

        //================================================================

        initModes : function() {

            var ui = this.ui;

            // Create modes:
            // Each mode has some panels that only appear during that mode, and
            // Some custom control functionality

            this.modes = {

                drawing : new UI.Mode({
                    app : this,
                    title : "drawing",
                    panels : this.ui.getPanels(),
                    // Control mapping

                }),

            };

            $.each(this.modes, function(key, mode) {
                mode.id = key;
            });

        },
        initControls : function() {
            var app = this;
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

            }, app);

            var touchRender = app.controls.addTouchable("three", $("#three_panel"));
            var touchDraw = app.controls.addTouchable("drawing", $("#drawing_canvas"));
            var cam = app.threeRender.camera;

            touchRender.onDrag(function(touchwindow, p, dragOffset) {
                cam.offsetFromBookmark(0.007 * dragOffset.x, 0.01 * dragOffset.y);
                cam.updateOrbit();
            });

            touchRender.onUp(function(touchwindow, p) {
                app.pauseSpinning = false;
            });

            touchRender.onDown(function(touchwindow, p) {
                console.log("ON DOWN");
                cam.bookmark();
                app.pauseSpinning = true;
            });

            touchRender.onScroll(function(touchwindow, delta) {
                var cam = app.threeRender.camera;
                cam.orbit.distance *= 1 + .03 * delta;
                cam.orbit.distance = utilities.constrain(cam.orbit.distance, 200, 1200);
                cam.updateOrbit();

            });

            touchDraw.onDrag(function(touchwindow, p) {
                //         app.coin.designTransform.setTo(p.x, p.y, 0);
            });

            touchDraw.onMove(function(touchwindow, p) {
                app.coin.selectAt(new Vector(p.x, p.y));

            });

            touchDraw.onScroll(function(touchwindow, delta) {
                //    app.coin.designTransform.scale *= 1 + .03 * delta;
                //  app.coin.designTransform.scale = utilities.constrain(app.coin.designTransform.scale, .3, 3);

            });
        },
        initUI : function() {
            var ui = this.ui;

            $('input').keypress(function(e) {
                e.stopPropagation();
            });

            // Tunign values and options
            ui.addTuningValue("hamsteropacity", 50, 1, 100, function() {

            });

            ui.addOption("useGraphic", true, function() {
            });
            ui.addOption("drawBoundingBox", true, function() {
            });

            // Create the Three scene
            app.threeRender = new threeUtils.ThreeView($("#three_panel"), function() {
                // update the camera

                if (!app.pauseSpinning) {
                    this.camera.orbit.theta -= .01;
                }
                // app.log(this.camera.orbit.theta);
                this.camera.updateOrbit();
            });

            var cam = app.threeRender.camera;
            cam.orbit.distance = 400;
            cam.updateOrbit();

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
                        app.coin.update(app.worldTime);
                        app.drawingWindow.render(function(context) {
                            g.background(.55, 0, 1);
                            if (app.coin)
                                app.coin.draw(g);

                        });
                    }
                }
            });

        },
    });

    return MedalApp;
});
