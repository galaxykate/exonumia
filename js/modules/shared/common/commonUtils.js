/**
 * @author Kate Compton
 */

var utilities = {};
var prefix = "modules/shared/common/";
define('common', ["inheritance", "noise", prefix + "transform", prefix + "vector", prefix + "tree", prefix + "rect", prefix + "map", prefix + "kcolor", prefix + "timespan", prefix + "utilities", prefix + "range", "jQueryUI", "underscore"], function(Inheritance, _Noise, _Transform, _Vector, _Tree, _Rect, _Map, _KColor, _TimeSpan, _utilities, _Range, JQUERY, _) {
    var common = {
        Vector : _Vector,
        Tree : _Tree,
        KColor : _KColor,
        Map : _Map,
        TimeSpan : _TimeSpan,
        Range : _Range,
        Rect : _Rect,
        Transform : _Transform,

    }

    //=============================================================
    //=============================================================
    //=============================================================
    // Add watching
    /*
    * object.watch polyfill
    *
    * 2012-04-03
    *
    * By Eli Grey, http://eligrey.com
    * Public Domain.
    * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    */

    // object.watch
    if (!Object.prototype.watch) {
        Object.defineProperty(Object.prototype, "watch", {
            enumerable : false,
            configurable : true,
            writable : false,
            value : function(prop, handler) {
                var oldval = this[prop], newval = oldval, getter = function() {
                    return newval;
                }, setter = function(val) {
                    oldval = newval;
                    return newval = handler.call(this, prop, oldval, val);
                };

                if (
                delete this[prop]) {// can't watch constants
                    Object.defineProperty(this, prop, {
                        get : getter,
                        set : setter,
                        enumerable : true,
                        configurable : true
                    });
                }
            }
        });
    }

    // object.unwatch
    if (!Object.prototype.unwatch) {
        Object.defineProperty(Object.prototype, "unwatch", {
            enumerable : false,
            configurable : true,
            writable : false,
            value : function(prop) {
                var val = this[prop];
                delete this[prop];
                // remove accessors
                this[prop] = val;
            }
        });
    }

    //=============================================================
    //=============================================================
    //=============================================================

    utilities = _utilities;
    utilities.noiseObj = new _Noise();
    utilities.noise = function() {
        // use the correct number of args
        switch(arguments.length) {
            case 1:
                return utilities.noiseObj.noise2D(arguments[0], 1000);
                break;
            case 2:
                return utilities.noiseObj.noise2D(arguments[0], arguments[1]);
                break;
            case 3:
                return utilities.noiseObj.noise3D(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                return utilities.noiseObj.noise4D(arguments[0], arguments[1], arguments[2], arguments[3]);
                break;
            default:
                console.log("Attempting to use Noise with " + arguments.length + " arguments: not supported!");
                return 0;
                break;
        }
    };

    // renormalized to between [0, 1]
    utilities.unitNoise = function() {
        return utilities.noise.apply(undefined, arguments) * .5 + .5;
    };

    //==================================================
    // Handlers
    // For some list of actions ["remove", "click", "givePoints"]
    //   an object should be able to:
    //     - subscribe a new function to this actions with object.onAction(fxn)
    //     - notify all the subscribers with obj.applyToHandlers(actionName, args)

    // Make a list of functions that can be used to subscribe functions to actions
    utilities.addSubscribers = function(actions, actionNames) {
        $.each(actionNames, function(index, name) {
            var onName = "on" + utilities.capitaliseFirstLetter(name);

            // add a new handler
            actions[onName] = function(f) {
                // Make the list of handlers if it doesn't exist yet
                if (!this[name + "Handlers"])
                    this[name + "Handlers"] = [];
                this[name + "Handlers"].push(f);
            }
        });

    };

    // pass these arguments to all the handlers
    var applyToHandlers = function(actionName, args) {
          var handlers = this[actionName + "Handlers"];
        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].apply(this, args);
            }
        } else {
            console.log("No handlers for " + actionName);
        }
    };

    utilities.addHandlers = function(object, actions) {
        object.applyToHandlers = applyToHandlers;

        // Add some objects
        _.extend(object, actions);
    };

    //==================================================

    utilities = _utilities;

    console.log("utilities = " + utilities);
    return common;
});
