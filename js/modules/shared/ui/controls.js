/**
 * @author Kate Compton
 */

define(["common", "mousewheel"], function(common, MOUSEWHEEL) {'use strict';
    var activateDragDistance = 5;

    var Touchable = Class.extend({
        init : function(controls, name, selector) {

            var tw = this;
            this.name = name;
            this.selector = selector;

            this.selector.mousewheel(function(event, delta) {
                tw.touchScroll(delta);
                event.preventDefault();

            });

            var offset = this.selector.offset();
            this.rect = new common.Rect(offset.x, offset.y, this.selector.width(), this.selector.height());

            this.element = selector.get(0);
            this.controls = controls;
            this.localPos = new Vector();

            this.onDragFxns = [];
            this.onDownFxns = [];
            this.onScrollFxns = [];
            this.onUpFxns = [];
            this.onMoveFxns = [];

            // Record which div is being activated in the touch,
            selector.mousedown(function(event) {
                tw.activate();
                console.log("MOUSE DOWN");
                event.preventDefault();

            });

            selector.append("something");

        },

        onScroll : function(fxn) {
            this.onScrollFxns.push(fxn);
        },

        onMove : function(fxn) {
            this.onMoveFxns.push(fxn);
        },

        onDrag : function(fxn) {
            this.onDragFxns.push(fxn);
        },

        onDown : function(fxn) {
            this.onDownFxns.push(fxn);
        },

        onUp : function(fxn) {
            this.onUpFxns.push(fxn);
        },

        setLocalPos : function(screenPos) {
            var offset = this.selector.offset();
            //or $(this).offset(); if you really just want the current element's offset
            this.localPos.setTo(screenPos);
            this.localPos.x -= offset.left;
            this.localPos.y -= offset.top;
            return this.localPos;
        },

        activate : function() {
            console.log("Activate " + this.name);
            this.controls.setActiveTouchable(this);
        },

        deactivate : function() {
            console.log("Deactivate to " + this.name);
        },

        touchUp : function(screenPos) {
            var tw = this;
            this.setLocalPos(screenPos);

            $.each(this.onUpFxns, function(index, f) {
                f(tw, tw.localPos);
            });
            console.log(tw + "-up:" + this.localPos);
        },

        touchDown : function(screenPos) {
            var tw = this;
            this.setLocalPos(screenPos);

            $.each(this.onDownFxns, function(index, f) {
                f(tw, tw.localPos);
            });
            console.log(tw + "-down:" + this.localPos);
        },

        touchMove : function(mouseDown, screenPos) {
            var tw = this;
            this.setLocalPos(screenPos);

            if (mouseDown) {
                $.each(this.onDragFxns, function(index, f) {
                    f(tw, tw.localPos);
                });
                console.log(tw + "-drag:" + this.localPos);
            } else {
                $.each(this.onMoveFxns, function(index, f) {
                    f(tw, localPos);
                });
                console.log(tw + "-move:" + this.localPos);
            }
        },

        touchScroll : function(delta) {
             var tw = this;
           $.each(this.onScrollFxns, function(index, f) {
                f(tw, delta);
            });
        },

        toString : function() {
            return this.name;
        }
    });

    var createControlSet = function() {
        return {
            onKeyPress : {

            },
            onMove : function(touch) {
            },
            onDrag : function(touch) {
            },
            onPress : function(touch) {
            },
            onRelease : function(touch) {
            },
            onTap : function(touch) {
            },
            onDoubleTap : function(touch) {
            },
            onScroll : function(delta) {
            },
        }
    }
    var Controls = Class.extend({

        init : function(touchDiv, defaultControls) {
            this.touchDiv = touchDiv;
            // Default values:
            this.name = "Undefined control scheme";
            this.defaultControls = createControlSet();
            if (defaultControls !== undefined)
                $.extend(this.defaultControls, defaultControls);

            this.touch = {
                pos : new Vector(),

                lastMove : {
                    pos : new Vector(),
                    time : 0,
                    divID : undefined
                },
                lastDown : {
                    pos : new Vector(),
                    time : 0,
                    divID : undefined
                },
                lastUp : {
                    pos : new Vector(),
                    time : 0,
                    divID : undefined
                },

                activePos : new Vector(),
                down : false,
                dragging : false,

                velocity : new Vector(),
                offset : new Vector(),
                dragOffset : new Vector(),
                draggedDistance : 0,
            };

            // Keep sorted by distance?
            this.touchables = [];

            this.setActiveControls();

        },

        //===============================================================

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

        touchDown : function(position) {

            var controls = this.activeControls;
            var touch = this.touch;
            touch.lastDown.pos.setTo(position);
            touch.lastDown.time = app.appTime.total;
            touch.down = true;
            touch.dragging = false;
            touch.draggedDistance = 0;

            // Set to the local position of the active element
            if (this.activeTouchable !== undefined) {
                this.activeTouchable.touchDown(touch.pos);
            }
            controls.onPress(touch);
        },
        touchUp : function(position) {

            var controls = this.activeControls;
            var touch = this.touch;
            touch.lastUp.pos.setTo(position);
            touch.lastUp.time = app.appTime.total;
            touch.down = false;
            touch.dragging = false;

            var timeDown = touch.lastUp.time - touch.lastDown.time;

            if (timeDown < 200 && touch.draggedDistance < 10) {
                console.log("Tap");
                controls.onTap(touch);
            }

            // Set to the local position of the active element
            if (this.activeTouchable !== undefined) {
                this.activeTouchable.touchUp(touch.pos);
            }

            touch.draggedDistance = 0;
            controls.onRelease(touch);
            this.clearTouchable();

        },

        // drag or move (the same if using touchscreen)
        touchMove : function(position) {
            var controls = this;
            var touch = this.touch;

            touch.pos.setTo(position);
            app.moveLog("Move: " + touch.pos);

            // Set to the local position of the active element
            if (this.activeTouchable !== undefined) {
                this.activeTouchable.touchMove(touch.down, touch.pos);
            }

            app.moveLog("Active: " + touch.activeElement + ": " + touch.activePos);

            touch.offset.setToDifference(touch.pos, touch.lastMove.pos);
            var d = touch.offset.magnitude();

            // velocity

            touch.offset.setToMultiple(touch.offset, 1 / app.appTime.total);

            touch.lastMove.pos.setTo(position);
            touch.lastMove.time = t;

            if (touch.down) {
                touch.draggedDistance += d;
                if (touch.draggedDistance > activateDragDistance) {
                    touch.dragging = true;
                }
            }

            // Do something with this info
            if (touch.down) {
                if (touch.dragging) {
                    controls.activeControls.onDrag(touch);
                } else {
                    //   controls.onHold(touch);
                }
            } else {
                controls.activeControls.onMove(touch);
            }
        },
        activate : function() {

            var controls = this;

            var mousePos = new Vector();
            var touchDiv = this.touchDiv;

            // Key handlers
            $(document).keypress(function(event) {
                var c = String.fromCharCode(event.which);
                if (c === " ")
                    c = "space";

                var keyHandler = controls.activeControls.onKeyPress[c];
                if (keyHandler !== undefined) {
                    keyHandler.call(controls.activeControls);
                }

            });

            var getMousePosition = function(ev) {

                var x = ev.pageX;
                var y = ev.pageY;
                mousePos.setTo(x, y);
                return mousePos;
            };

            // Set up the mouse/touch controls
            // Note: these are for things which can't  be done with normal 'click' functions on divs
            //  such as clicking on things in Processing or ThreeJS
            //
            // Features:
            //      Click/tapping on an object
            //      Dragging on object to another
            //      Dragging from one point to another (movement in Stellar)

            // Activate processing-style mouse interaction
            touchDiv.mousemove(function(ev) {
                ev.preventDefault();
                app.ui.moveOutput.clear();

                var p = getMousePosition(ev);
                controls.touchMove(p);
            });

            touchDiv.mousedown(function(ev) {
                ev.preventDefault();
                app.ui.moveOutput.clear();

                var p = getMousePosition(ev);
                controls.touchDown(p);
            });

            touchDiv.mouseup(function(ev) {
                app.ui.moveOutput.clear();

                var p = getMousePosition(ev);
                controls.touchUp(p);

            });

            // Mousewheel zooming
            touchDiv.mousewheel(function(event, delta) {
                controls.activeControls.onScroll(delta);
                event.preventDefault();

            });
        },
        deactivate : function() {

        },
    });

    return Controls;

});
