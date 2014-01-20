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

        addTimeSpan : function(timespan) {
            this.timespans.add(timespan);
        },

        addElapsed : function(t) {
            this.ellapsed = t;
            this.total += t;
        },
        updateTime : function(t) {
            if (isNaN(t)) {
                throw ("Update time " + this.name + " with bad total value " + t);
            }

            this.ellapsed = t - this.total;
            if (isNaN(this.ellapsed) || this.ellapsed < .001 && this.ellapsed > 1) {
                throw ("Update time " + this.name + " with bad ellapsed value " + this.ellapsed);

            }
            this.total = t;
            this.timespans.update(this.ellapsed);
        },
        toString : function() {
            return this.name + ": " + this.total.toFixed(2) + "(" + this.ellapsed.toFixed(3) + ")";
        }
    });

    var App = Class.extend({

        init : function(name, dimensions) {
            app = this;
            console.log("app", app);
            app.div = $("#app");

            app.dimensions = dimensions;

            app.worldTime = new Time("world");
            app.appTime = new Time("app");

            app.rect = new common.Rect(0, 0, app.dimensions.x, app.dimensions.y);
            app.ui = new UI({
                app : app
            });

            app.ui.addDevUI($("#dev_controls"));

            console.log(name + ": INIT UI");
            this.initUI();

            console.log(name + ": INIT CONTROLS");
            this.initControls();

            console.log(name + ": INIT MODES");
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

    });

    return App;
});
