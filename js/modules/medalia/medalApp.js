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

define(["ui", "app", "common", "threeUtils", "./coin"], function(UI, App, common, threeUtils, Coin) {
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

            var textFields = [$("#textLine1")];

            $.each(textFields, function(index, field) {
                field.val("Hello");
                field.on('input', function() {
                    console.log(field.val());
                    app.coin.changeTextLine(index, field.val());

                });

            });

            $("#new_text").click(function() {
                app.addNewTextLine();
            });

        },

        //================================================================

        addNewTextLine : function() {
            console.log("add new text line");
            var textLineHolder = $("#text_panel");

            var idNumber = this.textLineCount;
            // Create the div
            var textLine = {
                idNumber : idNumber,
                div : $("<div/>", {
                    html : "text:",
                    id : "textLine" + idNumber,
                    "class" : "subpanel textLine"
                }),
                textArea : $("<textarea/>", {
                    rows : 1,
                    cols : 20,
                    html : utilities.getRandom(mottos),
                }),

                fontChoice : $("<select/>", {
                    html : app.fontSelectionOptions,
                })
            };

            textLine.div.append(textLine.textArea);
            textLine.div.append(textLine.fontChoice);

            textLineHolder.append(textLine.div);

            this.textLineCount++;
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
                cam.offsetFromBookmark(-0.007 * dragOffset.x, 0.01 * dragOffset.y);
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
                cam.orbit.distance = utilities.constrain(cam.orbit.distance, 300, 1200);
                cam.updateOrbit();

            });

            touchDraw.onDrag(function(touchwindow, p) {
                app.coin.designTransform.setTo(p.x, p.y, 0);
            });

            touchDraw.onMove(function(touchwindow, p) {
                app.coin.selectAt(new Vector(p.x, p.y));

            });

            touchDraw.onScroll(function(touchwindow, delta) {
                app.coin.designTransform.scale *= 1 + .03 * delta;
                app.coin.designTransform.scale = utilities.constrain(app.coin.designTransform.scale, .3, 3);

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
            function updateCoin() {
                app.coin.changeBorder({
                    sides : app.getTuningValue("sides"),
                    peakTilt : app.getTuningValue("peakTilt"),
                    upperWidth : app.getTuningValue("upperWidth"),
                    lowerWidth : app.getTuningValue("lowerWidth"),
                    spin : app.getTuningValue("spin"),
                });
            }


            ui.addTuningValue("sides", 8, 4, 16, function() {
                updateCoin();
            });

            ui.addTuningValue("upperWidth", 1, 0, 3, function() {
                updateCoin();
            });
            ui.addTuningValue("lowerWidth", 1, 0, 3, function() {
                updateCoin();
            });

            ui.addTuningValue("peakTilt", 0, -1.85, 1.85, function() {
                updateCoin();
            });

            ui.addTuningValue("spin", 0, -1.85, 1.85, function() {
                updateCoin();
            });

            // Create the Three scene
            app.threeRender = new threeUtils.ThreeView($("#three_panel"), function() {
                // update the camera

                if (!app.pauseSpinning) {
                    this.camera.orbit.theta += .01;
                }
                // app.log(this.camera.orbit.theta);
                this.camera.updateOrbit();
            });

            var cam = app.threeRender.camera;
            cam.orbit.distance = 600;
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
                            g.background(.55, 1, 1);
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
