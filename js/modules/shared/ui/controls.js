/**
 * @author Kate Compton
 */

define(["common", "mousewheel"], function(common, MOUSEWHEEL) {'use strict';

    var setToLocalPos = function(localPos, selector, evt) {
        var offset = selector.offset();
        localPos.setTo(evt.pageX - offset.left, evt.pageY - offset.top);
    };

    var activateDragDistance = 5;

    var actions = ["drag", "scroll", "up", "down", "move", "hover", "tap", "doubletap"];

    var Touchable = Class.extend({
        init : function(controls, name, selector) {

            var touchable = this;

            this.name = name;
            this.selector = selector;

            var offset = this.selector.offset();
            this.rect = new common.Rect(offset.x, offset.y, this.selector.width(), this.selector.height());

            this.element = selector.get(0);
            this.controls = controls;
            this.localPos = new Vector();

            // create function holders/adders
            // for each action, make a function to add a handler
            // using jquery like syntax "onDoThing(myFxn)" will add a function to call on doing a thing
            $.each(actions, function(index, name) {
                var handlerName = name + "Handlers";
                var onName = "on" + utilities.capitaliseFirstLetter(name);
                touchable[onName] = function(fxn) {
                    if (touchable[handlerName] === undefined) {
                        touchable[handlerName] = [];
                    }
                    touchable[handlerName].push(fxn);
                }
            });

            // Test out adding a handler
            $.each(actions, function(index, name) {
                var onName = "on" + utilities.capitaliseFirstLetter(name);
                touchable[onName](function() {
                    app.ui.moveOutput.clear();
                    app.moveLog(touchable.name + ": " + name + " " + touchable.localPos);
        
                });
            });

            selector.mousewheel(function(evt, delta) {
                touchable.callAll("scrollHandlers", [touchable, delta]);
                evt.preventDefault();

            });

            // Record which div is being activated in the touch,
            selector.mousedown(function(evt) {
                touchable.activate();
                controls.touch.isDown = true;
                controls.touch.dragStart.setTo(touchable.localPos);
                touchable.callAll("downHandlers", [touchable, touchable.localPos]);
                //          evt.preventDefault();
            });

            selector.mouseup(function(evt) {
                touchable.deactivate();
                controls.touch.isDown = false;
                touchable.callAll("upHandlers", [touchable, touchable.localPos]);
                evt.preventDefault();
            });

            selector.mousemove(function(evt) {
                if (controls.touch.isDown) {
                    // Dragging!  Pass back to the controls to distribute to the other stuff
                } else {
                    touchable.setLocalPos(evt);
                    touchable.callAll("moveHandlers", [touchable, touchable.localPos]);

                }
                event.preventDefault();
            });

            selector.append("something");

        },

        drag : function(down, current) {
            var touchable = this;

            var dragOffset = down.getOffsetTo(current);
            //  touchable.setLocalPos(evt);
            app.ui.moveOutput.clear();
            app.moveLog("Drag: " + down + " " + current);
            touchable.callAll("dragHandlers", [touchable, touchable.localPos, dragOffset]);

        },

        setLocalPos : function(evt) {
            setToLocalPos(this.localPos, this.selector, evt);
        },

        callAll : function(handlers, args) {
            var touchable = this;
            if (this[handlers]) {
                $.each(this[handlers], function(index, fxn) {
                    fxn.apply(touchable, args);
                });

            }
        },

        activate : function() {
            //    console.log("Activate " + this.name);
            this.controls.setActiveTouchable(this);
        },

        deactivate : function() {
            //       console.log("Deactivate to " + this.name);
        },

        toString : function() {
            return this.name;
        }
    });

    var Controls = Class.extend({

        init : function(touchDiv, overrideControls, app) {
            var controls = this;
            controls.app = app;
            controls.touchDiv = touchDiv;
            // Default values:
            controls.name = "Undefined control scheme";

            // Touchable windows
            controls.touchables = [];

            controls.setActiveControls(overrideControls);

            controls.touch = {
                isDown : false,
                localPos : new Vector(),
                dragStart : new Vector(),
                dragCurrent : new Vector(),
            };

            touchDiv.mousemove(function(evt) {
                app.ui.moveOutput.clear();
                app.moveLog("Overcontrols move:" + controls.touch.localPos);
                setToLocalPos(controls.touch.localPos, controls.touchDiv, evt);

                if (controls.touch.isDown) {
                    setToLocalPos(controls.touch.dragCurrent, controls.activeTouchable.selector, evt);
                    controls.activeTouchable.drag(controls.touch.dragStart, controls.touch.dragCurrent);
                }
                return false;
            });

        },

        //===============================================================

        enterTouchable : function(touchable) {
            this.hoveredTouchable = touchable;
        },
        exitTouchable : function(touchable) {
            if (this.hoveredTouchable === touchable)
                this.hoveredTouchable = undefined;
        },
        addTouchable : function(name, element) {
            var t = new Touchable(this, name, element);
            this.touchables.push(t);
            return t;
        },
        setActiveTouchable : function(touchable) {
            this.activeTouchable = touchable;
        },
        clearTouchable : function() {
            if (this.activeTouchable)
                this.activeTouchable.deactivate();
            this.activeTouchable = undefined;
        },

        //===============================================================
        setActiveControls : function(customControls) {
            this.activeControls = { };
            $.extend(this.activeControls, this.defaultControls);
            $.extend(this.activeControls, customControls);

        },

        //=================
        // Window relative

        getPositionRelativeTo : function(element, pos) {
            var v = new Vector(pos.x - element.offset().left, pos.y - element.offset().top);
            return v;
        },

        //================

        activate : function() {
            var app = this.app;
            var controls = this;

            var mousePos = new Vector();
            var touchDiv = this.touchDiv;

            // Key handlers
            $(document).keypress(function(ev) {

                if ($(ev.target).is('input, textarea')) {
                    // event invoked from input or textarea
                } else {

                    var c = String.fromCharCode(ev.which);
                    if (c === " ")
                        c = "space";

                    var keyHandler = controls.activeControls.onKeyPress[c];
                    if (keyHandler !== undefined) {
                        keyHandler.call(controls.activeControls);
                    }

                    //                    ev.preventDefault();
                }
            });

            var getMousePosition = function(ev) {

                var x = ev.pageX;
                var y = ev.pageY;
                mousePos.setTo(x, y);
                return mousePos;
            };

        },
    });

    return Controls;

});
