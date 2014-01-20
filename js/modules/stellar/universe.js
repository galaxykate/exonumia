/**
 * @author Kate Compton
 */
define(["common", "graph", "voronoi", "./regions/region", "./tuning", "./labels"], function(common, Graph, voronoi, Region, tuning, labels) {
    var frame = 0;
    var objCount = 0;
    var bgStars = [];
    var bgScribbles = [];

    for (var i = 0; i < 300; i++) {
        bgStars[i] = new Vector(99999 * utilities.noise(i), 99999 * utilities.noise(i * 30 + 99));
    }

    for (var i = 0; i < 6; i++) {
        bgScribbles[i] = new Vector(400 * Math.random() - 200, 400 * Math.random() - 200);
    }

    var objRange = 1000;

    // Create regions
    var regions = [];

    var regionGraph;

    var activeRegion;
    var activeRegions = [];

    var touch = {
        planarPos : new Vector(),
        screenPos : new Vector(),
        region : undefined,
        object : undefined,
    };

    var activeBox = new common.Rect(0, 0, 0, 0);

    var addWorldTimespan = function(context) {
        app.worldTime.addTimeSpan(new common.TimeSpan(context));

    };

    var animatePointTo = function(toAnimate, settings) {
        var start = settings.freezeStart ? new Vector(settings.start) : settings.start;
        var end = settings.freezeEnd ? new Vector(settings.end) : settings.end;

        addWorldTimespan({
            lifespan : settings.lifespan,
            onStart : settings.onStart,
            onChange : function(total, pct) {
                if (settings.modifyPct)
                    pct = settings.modifyPct(pct);
                toAnimate.setToLerp(start, end, pct);
                if (settings.afterChange)
                    settings.afterChange(total, pct);

            },
            onFinish : settings.onFinish,
        });
    };

    var universe = {

        initialize : function() {
            // Create a bunch of divs in the universe overlay
            for (var i = 0; i < 10; i++) {
                addWorldTimespan();
            }
            var range = 1500;
            activeBox.setPosition(-range / 2, -range / 2);
            activeBox.setDimensions(range, range);

            for (var i = 0; i < 16; i++) {
                regions[i] = new Region(this, objRange * (utilities.noise(i * 20)), objRange * (utilities.noise(i * 30 + 99)));
            }

            regionGraph = Graph.createVoronoiGraph(regions, activeBox);
            // generate content for the regions
            $.each(regions, function(index, region) {
                region.spawnContents();
            })
            this.touch = touch;

            labels.createLabels();
        },

        labelObject : function(obj) {
            var label = labels.getLabel();
            if (label !== undefined)
                label.attachToObj(obj);
        },

        activateRegion : function(region) {
            if (activeRegion !== region) {
                if (activeRegion)
                    activeRegion.deactivate();

                activeRegion = region;
                if (activeRegion)
                    activeRegion.activate();

            }
            labels.cleanup();
        },

        drawBG : function(context) {
            frame++;

            var t = app.worldTime.total;

            var g = context.g;
            var w = g.width - 80;
            var h = g.height - 80;

            g.noStroke();
            // g.fill(0, 0, 0, .6);
            g.background(.8, 1, .02);
            g.rect(-g.width / 2, -g.height / 2, g.width, g.height);

            for (var i = 0; i < bgScribbles.length; i++) {
                //     if (frame % 3 === i % 3) {
                var r = 90;
                var hue = .7 + .2 * Math.sin(i + t * .1);
                g.fill(hue, 1, 1, .03);
                g.ellipse(bgScribbles[i].x, bgScribbles[i].y, r * 4, r * 4);
                g.fill(hue + .2, .6, 1, .01);
                g.ellipse(bgScribbles[i].x, bgScribbles[i].y, r * 2, r * 2);
                //   g.ellipse(bgScribbles[i].x, bgScribbles[i].y, r, r);

                bgScribbles[i].addMultiple(bgScribbles[i], -.001);
                bgScribbles[i].addPolar(1, 40 * utilities.noise(i + .003 * t));

            }

            for (var i = 0; i < bgStars.length; i++) {
                var star = bgStars[i]

                // wrap around the size
                var x = ((star.x - star.x / 2) % w + w) % w - w / 2;
                var y = ((star.y - star.y / 2) % h + h) % h - h / 2;

                var rate =  (Math.sin(i) + 1);
                var r = 1.2*Math.sin(i + (t * rate)) + .2;
                g.noStroke();
                g.fill(1, 0, 1, r - .2);
                g.ellipse(x, y, r * .8, r * .8);
            }
        },

        // With the camera here, which regions go offscreen?
        //   Which need ot come onscreen?
        updateRegionVisibility : function(camera) {
            // Get a list to deactivate
            var toDeactivate = activeRegions.filter(function(region) {
                return !region.isOnscreen(camera);
            });

            // Deactivate each one
            $.each(toDeactivate, function(index, region) {
                region.active = false;
            });

            // Get a list to activate
            var toActivate = nearbyRegions.filter(function(region) {
                return region.isOnscreen(camera);
            });
            $.each(toActivate, function(index, region) {
                region.active = true;
                activeRegions.push(true);
            });
        },

        zoomTo : function(p) {
            var camera = this.camera;
            var startZoom = camera.zoom;
            var offset = camera.getOffsetTo(p);
            var d = offset.magnitude();
            d = .01 * Math.pow(d, .6) + .05;

            animatePointTo(camera, {
                lifespan : d,
                start : new Vector(camera),
                end : new Vector(p),
                modifyPct : function(pct) {
                    return utilities.sCurve(.9 * pct + .1);
                },
                afterChange : function(total, pct) {
                    var z = utilities.lerp(startZoom, tuning.lod.inspectorStart, pct);
                    universe.camera.setZoom(z);
                },
                onFinish : function() {

                },
            });

        },

        // run every n frames, cleanup all the lists
        cleanup : function() {
            $.each(regions, function(index, region) {
                region.cleanup();
            });
            // Remove non active regions
            activeRegions = activeRegions.filter(function(region) {
                return region.active;
            });

            labels.cleanup();
        },

        getRegionAt : function(p) {
            app.log("Find region at " + p);
            var found;
            $.each(regions, function(index, region) {
                if (region.contains(p)) {
                    found = region;
                    return;
                }
            });
            app.log("Found " + found);

            return found;
        },

        setTouchPos : function(universeCamera, screenPos) {
            universeCamera.screenToPlanar(screenPos, touch.planarPos);
            touch.region = this.getRegionAt(touch.planarPos);
            app.log("set Touched object " + touch.planarPos);
            this.activateRegion(touch.region);
        },

        setTouchedObject : function() {

            if (touch.region === undefined) {
                touch.overObject = undefined;
            } else {

                var obj = touch.region.getAt({
                    target : universe.touch.planarPos,
                    useScreenPos : false,
                }).obj;

                if (obj === touch.overObject) {
                    // Do nothing, nothing changed
                } else {
                    if (touch.overObject)
                        touch.overObject.onTouchExit(touch);
                    touch.overObject = obj;
                    if (touch.overObject)
                        touch.overObject.onTouchEnter(touch);
                }
            }

        },

        update : function() {
            this.setTouchPos(this.camera, this.touch.screenPos);
            this.setTouchedObject();

            this.cleanup();
        },

        drawRegions : function(context) {
            var g = context.g;

            // Set all the screen positions
            regionGraph.applyToNodes(function(node) {
                if (node.screenPos === undefined)
                    node.screenPos = new Vector();
                context.camera.worldToScreen(node, node.screenPos);
            });

            context.useScreenPos = true;
            context.setStyle = function() {
                this.g.stroke(1);
                this.g.strokeWeight(1);
            }
            /*
             // Draw the region graph
             regionGraph.drawEdges(context);
             g.noStroke();
             g.fill(0);
             regionGraph.drawNodes(context);
             regionGraph.applyToNodes(function(node) {
             node.screenPos.drawText(g, node.index, 5, 5);
             });
             */

            $.each(regions, function(index, region) {
                context.selected = (touch.region === region)
                region.draw(context);
            });
            $.each(regions, function(index, region) {
                context.selectedObject = touch.object;
                region.drawContents(context);
            });
        },
    };

    return universe;

});
