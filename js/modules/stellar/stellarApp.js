/**
 * @author Kate Compton
 */

define(["ui", "app", "common", "./universe", "./universeCamera", "./tuning", "./player/player", "./elements/elements"], function(UI, App, common, universe, UniverseCamera, tuning, Player, Elements) {
    var appDimensions = new Vector(790, 490);
    var cssDim = appDimensions.toCSSDimensions()
    $("#drawing_panel").css(cssDim);
    $("#drawing_canvas").css(cssDim);
    $("#universe_overlay").css(cssDim);

    $("#universe_overlay").css({
        left : appDimensions.x / 2 + "px",
        top : appDimensions.y / 2 + "px"
    });

    zoomInfo = $("#zoom_info");

    var universeCamera = new UniverseCamera(appDimensions.x, appDimensions.y);
    universe.camera = universeCamera;

    var cameraOutput = $("#camera_info");
    cameraOutput.dblclick(function() {
        universeCamera.mult(0);
        universeCamera.updateOrbit();

    });

    var StellarApp = App.extend({

        init : function() {

            this._super("Stellar", appDimensions);
            Elements.setApp(this);
            app.player = new Player();
            app.paused = false;
            app.changeMode("nav");
            universeCamera.setZoom(.5);

            // Start the game
            universe.initialize();
        },

        //=================================================
        //=================================================
        //=================================================
        // Favorite handlers

        /// Span styles
        makeSpanColor : function(color, text) {
            return '<span style="color:' + color + '">' + text + '</span>';
        },

        zoomToInspect : function(obj) {
            universe.zoomTo(obj);
        },
        addToNewsFeed : function(context) {
            this.ui.popupManagers.newsFeed.addPopup(context);
        },

        // Common things to do with a central popup:

        openCentralPopup : function() {
            this.centralPopup.open(function(div) {

            });
        },
        openCentralPopupObjInfo : function(obj, onThumbnailClick) {

            // Decorate this div to show info about this obj
            this.centralPopup.open(function(div) {
                div.append("<h3>" + obj + "</h3>");

                var procDiv = $("<div/>", {
                    "class" : "popupThumbnail",
                });

                var procCanvas = $("<canvas/>", {
                    "class" : "popupThumbnail",
                    width : 200,
                    height : 200,

                });

                div.append(procDiv);
                procDiv.append(procCanvas);
                procDiv.click(function() {
                    onThumbnailClick();
                });

                // Create and append a processing window
                var startTime = 0;
                app.drawingProcessing = app.ui.addProcessingWindow(procCanvas, function(g) {
                    // do setup
                    g.background(0);
                }, function(g) {
                    g.background(0);
                    g.fill(0, 0, 0, .9);
                    // g.rect(0, 0, g.width, g.height);
                    g.pushMatrix();
                    g.translate(g.width / 2, g.height / 2);

                    // Make stars
                    for (var i = 0; i < 100; i++) {
                        var r = 120 * (utilities.noise(i) + 1);
                        var theta = 20 * i;
                        g.fill(1);
                        g.ellipse(r * Math.cos(theta), r * Math.sin(theta), 2, 2);
                    }

                    obj.drawThumbnail({
                        g : g
                    });

                    g.popMatrix();
                });
            });
        },

        //=================================================
        //=================================================
        //=================================================

        initModes : function() {

            var ui = app.ui;

            // Create modes:
            // Each mode has some panels that only appear during that mode, and
            // Some custom control functionality
            var switchToMode = function(mode) {
                $("#mode_info").html("<h3>" + mode.title + "</h3>" + mode.description);
            };

            // Create the different modes
            this.modes = {
                inspect : new UI.Mode({
                    title : "Inspect",
                    description : "Interacting with the stars",
                    panels : app.ui.getPanels(["inventory"]),
                    onActivate : function(mode) {
                        switchToMode(mode);
                    },
                }),

                nav : new UI.Mode({
                    title : "Nav",
                    description : "Move around the universe",
                    panels : app.ui.getPanels(["inventory"]),
                    onActivate : function(mode) {
                        switchToMode(mode);
                    },
                }),

                universe : new UI.Mode({
                    title : "Universe",
                    description : "Zoom out to look around",
                    panels : app.ui.getPanels(["inventory"]),
                    onActivate : function(mode) {
                        switchToMode(mode);
                    },
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

                    // Standard controls: d toggles dev mode, space pauses
                    d : function(event) {
                        app.ui.devMode.toggle();
                        console.log("Dev mode");
                    },

                    space : function() {
                        app.paused = !app.paused;
                    },
                },

            });

            var touchDraw = app.controls.addTouchable("drawing", $("#drawing_canvas"));

            universe.dragStart = new Vector();

            var getTouchPos = function(touchwindow, p) {
                var x = p.x - touchwindow.rect.w / 2;
                var y = p.y - touchwindow.rect.h / 2;
                var pos = new Vector(x, y);
                universe.touch.screenPos.setTo(x, y);
                return pos;
            };

            touchDraw.onDrag(function(touchwindow, p) {
                var pos = getTouchPos(touchwindow, p);

                // Navigate
                if (app.mode === app.modes.nav) {
                    var dragOffset = universe.dragStart.getOffsetTo(universe.touch.planarPos);
                    if (!dragOffset.isValid()) {
                        console.log(universe.dragStart + " " + universe.touch.planarPos);
                        throw ("Invalid drag offset! " + dragOffset);
                    }
                    console.log(dragOffset + " " + universe.dragStart + " " + universe.touch.planarPos);
                    var d = dragOffset.magnitude();
                    var speed = 1000;
                    if (d !== 0)
                        universeCamera.force.setToMultiple(dragOffset, speed / d);
                }

                if (app.mode === app.modes.inspect) {

                }

                if (app.mode === app.modes.universe) {
                    // Look around
                }
            });

            touchDraw.onMove(function(touchwindow, p) {
                //  get midPoint

                // get whats's at the universe
                var pos = getTouchPos(touchwindow, p);

                if (universe.touch.object) {
                    console.log("Tapped object ", universe.touch.object);
                    universe.touch.object.click();
                }
            });

            touchDraw.onTap(function(touchwindow, p) {
                var pos = getTouchPos(touchwindow, p)
                if (universe.touch.object) {
                    console.log("Tapped object ", universe.touch.object);
                    universe.touch.object.click();
                }
            })

            touchDraw.onDblTap(function(touchwindow, p) {
                var pos = getTouchPos(touchwindow, p);
                if (universe.touch.object) {
                    console.log("DblTapped object ", universe.touch.object);
                    universe.touch.object.dblClick();
                } else
                    universe.zoomTo(universe.touch.planarPos);
            });

            touchDraw.onUp(function(touchwindow, p) {
                universeCamera.drag = .9;
                universeCamera.force.mult(0);
            })

            touchDraw.onDown(function(touchwindow, p) {

                universe.dragStart.setTo(universe.touch.planarPos);
                universeCamera.drag = .1
            })

            touchDraw.onScroll(function(touchwindow, delta) {
                // Change zoom?

                if (app.mode === app.modes.nav) {

                    universeCamera.setZoomForce(-delta * .001);

                }

                if (app.mode === app.modes.universe) {
                    // Look around

                }

            });
        },
        initUI : function() {
            console.log("Init UI");
            var app = this;

            var ui = this.ui;

            $("#universe_info").hide();
            // Tuning value example
            ui.addTuningValue("hamsterOpacity", 50, 1, 100, function(key, value) {
                // do something on change
            });

            ui.addTuningValue("unicornFluffiness", 100, 1, 700, function(key, value) {
                // do something on change
            });

            // Add the various panels
            // Options: id, title, description, side [right, left, top, bottom], dimensions (vector)

            ui.addPopupManager("newsFeed", new UI.Popup.NoticeBar({
                divName : "noticeBar"
            }));

            // Central popup
            app.centralPopup = new UI.Popup.CenterPopup("centralPopup", "centralPopupOpen", "centralPopupClosed");

            ui.addPanel({
                id : "inventory",
                title : "Inventory",
                side : "left",
                sidePos : -5,
                dimensions : new Vector(200, 400)
            });

            console.log("Create drawing window");
            app.drawingWindow = new UI.DrawingWindow("drawing", $("#drawing_canvas"));

            app.drawingProcessing = ui.addProcessingWindow(app.drawingWindow.element, function(g) {
                app.drawingWindow.setProcessing(g);

            }, function(g) {

                // only do if its the inspector mode
                // Updates
                app.ui.output.clear();
                if (!app.paused) {
                    app.worldTime.updateTime(g.millis() * .001);
                    var ellapsed = app.worldTime.ellapsed;
                    // Updates
                    universe.update(app.worldTime);
                    app.player.update(app.worldTime);

                    // Update the controls

                    //universeCamera.orbit.theta += ellapsed;
                    universeCamera.update(app.worldTime);
                    universeCamera.updateOrbit();
                    cameraOutput.html("Camera: " + universeCamera.toString());

                    app.drawingWindow.render(function(context) {
                        context.camera = universeCamera;
                        context.planeAngle = context.camera.orbit.phi;

                        app.log("LOD: " + universeCamera.zoom);

                        universe.drawBG(context);

                        g.pushMatrix();
                        universe.drawRegions(context);

                        /*
                         g.translate(-g.width / 2, 0);
                         g.strokeWeight(2);
                         g.stroke(0);
                         g.fill(.5, 1, 1);
                         g.rect(30, 0, 30, 300 * universeCamera.lastScroll);
                         g.fill(.75, 1, 1);
                         g.rect(70, 0, 30, 300 * universeCamera.zoomForce);
                         g.fill(.95, 1, 1);
                         g.rect(100, 0, 30, 300 * universeCamera.zoom);
                         g.popMatrix();
                         */
                    });
                }

            });

        },
    });

    return StellarApp;
});
