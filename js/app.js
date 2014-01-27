/**
 * @author Kate Compton
 */
var app;

define(["ui", "common"], function(UI, common) {

    var Time = Class.extend({
        init : function(name) {
            this.name = name;
            this.ellapsed = 0;
            this.total = 0;
            this.timespans = new common.TimeSpan.Manager();

        },

        addElapsed : function(t) {
            this.ellapsed = t;
            this.total += t;
        },

        updateTime : function(t) {

            this.ellapsed = t - this.total;
            this.total = t;
        },

        toString : function() {
            return this.name + ": " + this.total.toFixed(2) + "(" + this.ellapsed.toFixed(3) + ")";
        }
    });

    var App = Class.extend({

        init : function(name, dimensions) {
            this.name = name;
            console.log("INIT APP " + this);

            app = this;
            app.div = $("#app");

            app.dimensions = dimensions;

            app.worldTime = new Time("world");
            app.appTime = new Time("app");

            app.rect = new common.Rect(0, 0, app.dimensions.x, app.dimensions.y);
            app.ui = new UI({
                app : app
            });

            app.ui.addDevUI($("#dev_controls"));
            this.initUI();

            this.initControls();

            this.initModes();

            this.touch = this.controls.touch;
            this.controls.activate();
        },

        start : function() {

            // Set the starting time of the app
            var date = new Date();
            this.startTime = date.getTime();

        },

        changeMode : function(modeName) {
            console.log("MODE: Change to " + modeName);
            var next = this.modes[modeName];
            if (this.mode !== next) {

                if (this.mode !== undefined)
                    this.mode.deactivate();

                this.mode = next;
                this.mode.activate();

                if (this.mode.controls !== undefined) {
                    this.controls.setActiveControls(this.mode.controls);
                }
            }
        },

        initModes : function() {

        },

        initControls : function() {
        },

        initUI : function() {

        },

        getPositionRelativeTo : function(div, pos) {
            var v = new Vector(pos.x - div.offset().left, pos.y - div.offset().top);
            return v;
        },

        //========================================
        // Make a shortcut for outputs

        log : function(line) {
            app.ui.output.log(line);
        },

        moveLog : function(line) {
            app.ui.moveOutput.log(line);
        },

        modeLog : function(line) {
            app.ui.modeOutput.log(line);
        },

        //========================================
        // option/tuning value accessors
        getOption : function(key) {
            if (app.ui.options[key] !== undefined)
                return app.ui.options[key].value;
            return false;
        },

        getTuningValue : function(key) {
            if (app.ui.tuningValues[key]) {
                return app.ui.tuningValues[key].value;
            }
            return 0;
        },
        //========================================
        // time

        toString : function() {
            return "App:" + this.name;
        }
    });

    return App;
});
