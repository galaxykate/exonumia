/**
 * @author Kate Compton
 */
/**
 * @author Kate Compton
 */

var prefix = "modules/shared/ui/";
define(["common", "processing", prefix + "panel", prefix + "controls", prefix + "popup", prefix + "mode", prefix + "output", prefix + "window"], function(common, Processing, Panel, Controls, Popup, Mode, Output, DrawingWindow) {'use strict';

    //==============================================================
    //==============================================================
    //==============================================================
    // UI, mode switching, panel opening/closing

    var UI = Class.extend({

        init : function(context) {
            this.modes = {

            };
            this.panels = {};
            this.options = {};
            this.tuningValues = {};
            this.popupManagers = {};

            $.extend(this, context);

            $.each(this.modes, function(index, mode) {
                mode.enabled = false;
            });

        },

        addProcessingWindow : function(div, setupFunc, drawFunc) {

            var canvas = div.get(0);

            var processingInstance = new Processing(canvas, function sketchProc(processing) {
                // Setup
                processing.size(div.width(), div.height());

                setupFunc(processing);

                // Override draw function, by default it will be called 60 times per second
                processing.draw = function() {
                    drawFunc(processing);
                }
            });

        },

        addPanel : function(options) {
            this.panels[options.id] = new Panel(options);
        },

        getPanels : function(names) {
            var ui = this;
            var panels = _.map(names, function(name) {
                return ui.panels[name];
            });

            console.log("Get Panels " + names + " -> " + panels);
            return panels;
        },

        addDevUI : function(parentDiv) {
            console.log("Add Dev UI");
            var ui = this;
            var w = 170;
            var h = 300;
            var offset = 250;
            var spacing = 24;

            // Create divs for the panels
            if (parentDiv !== undefined) {
                var slidersDiv = $("<div/>", {
                    id : "dev_sliders",
                    "class" : "panel text_panel"
                });

                var optionsDiv = $("<div/>", {
                    id : "dev_options",
                    "class" : "panel text_panel"
                });

                var outputDiv = $("<div/>", {
                    id : "dev_output",
                    "class" : "panel text_panel"
                });

                parentDiv.append(slidersDiv);
                parentDiv.append(optionsDiv);
                parentDiv.append(outputDiv);

                outputDiv.append($("<div/>", {
                    id : "debugOutput",
                }));
                outputDiv.append($("<div/>", {
                    id : "moveOutput",
                }));

                outputDiv.append($("<div/>", {
                    id : "modeOutput",
                }));
            }

            $.extend(this.panels, {
                devOutput : new Panel({
                    title : "Dev Output",
                    div : $("#dev_output"),
                    dimensions : new Vector(w, h),
                    side : "top",
                    sidePos : (w + spacing) * 2 + offset,
                }),

                devOptions : new Panel({
                    title : "Dev Options",
                    div : $("#dev_options"),
                    dimensions : new Vector(w, h),
                    side : "top",
                    sidePos : (w + spacing) * 0 + offset,
                }),

                devSliders : new Panel({
                    title : "Dev Tuning Values",
                    div : $("#dev_sliders"),
                    dimensions : new Vector(w, h),
                    side : "top",
                    sidePos : (w + spacing) * 1 + offset,
                }),

            });

            this.devMode = new Mode({

                title : "Dev Mode",
                description : "For Dev Eyes Only",
                panels : ui.getPanels(["devOptions", "devSliders", "devOutput"]),
            });

            this.moveOutput = new Output($("#moveOutput"));
            this.modeOutput = new Output($("#modeOutput"));
            this.output = new Output($("#debugOutput"));
        },

        addOption : function(key, defaultValue, onChange) {
            var ui = this;

            var optionDiv = $("<div/>", {

            });

            var parent = this.panels.devOptions.div;
            parent.append(optionDiv);

            var checkbox = $('<input />', {
                type : 'checkbox',
                id : 'cb_' + key,
                value : key
            });

            checkbox.appendTo(optionDiv);

            $('<label />', {
                'for' : 'cb' + key,
                text : key
            }).appendTo(optionDiv);

            ui.options[key] = {
                value : defaultValue,
                checkbox : checkbox,
            };
            checkbox.prop('checked', defaultValue);

            checkbox.click(function() {
                ui.options[key].value = checkbox.prop('checked');
                console.log(key + ": " + ui.options[key].value);
                if (onChange !== undefined) {
                    onChange(key, ui.options[key].value);
                }
            });

        },
        addTuningValue : function(key, defaultValue, minValue, maxValue, onChange) {
            var ui = this;

            var optionDiv = $("<div/>", {

            });

            var parent = this.panels.devSliders.div;
            parent.append(optionDiv);

            var slider = $('<div />', {
                id : 'slider_' + key,
                class : "tuning_slider",
                value : key
            });

            slider.appendTo(optionDiv);
            slider.slider({
                range : "min",
                value : 37,
                min : 1,
                max : 700,
                slide : function(event, ui) {
                    $("#amount").val("$" + ui.value);
                }
            });

            $('<label />', {
                'for' : 'slider_' + key,
                text : key
            }).appendTo(optionDiv);

            ui.tuningValues[key] = {
                value : defaultValue,
                slider : slider,
            };

            slider.click(function() {
                ui.tuningValues[key].value = slider.value
                console.log(key + ": " + ui.tuningValues[key].value);
                if (onChange !== undefined) {
                    onChange(key, ui.tuningValues[key].value);
                }
            });

        },
        addPopupManager : function(id, manager) {
            this.popupManagers[id] = manager;
            return manager;
        },
    });

    UI.Controls = Controls;
    UI.DrawingWindow = DrawingWindow;
    UI.Panel = Panel;
    UI.Popup = Popup;
    UI.Mode = Mode;

    return UI;
});
