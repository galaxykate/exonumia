/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {'use strict';

    // Some modes can be active at different times, others must be switched between

    // Many modes are like finite state machines...maybe

    var Mode = Class.extend({

        init : function(context) {
            // Default values:
            this.title = "Undefined Mode";
            this.description = "Undefined Mode";
            this.active = false;
            this.panels = [];

            // Overlay with custom context
            $.extend(this, context);

   
        },

        toggle : function() {
            if (this.active)
                this.deactivate();
            else
                this.activate();

        },

        activate : function() {
            this.active = true;
            console.log("Activate Mode: " + this.title);
        
            // Activate all of the panels
            $.each(this.panels, function(index, panel) {
                panel.open();
            });

            if (this.onActivate) {
                this.onActivate();
            }
        },

        deactivate : function() {
            this.active = false;

            // Activate all of the panels
            $.each(this.panels, function(index, panel) {
                panel.close();
            });

            if (this.onDeactivate) {
                this.onDeactivate();
            }
        },

        toString : function() {
            return this.title;
        }
    });

    return Mode;

});
