/**
 * @author Kate Compton
 */
define(["inheritance"], function(Inheritance) {
    var Range = Class.extend({
        init : function(context) {

            // default values
            this.min = 0;
            this.max = 1;
            this.defaultValue = .5;

            // Translate all the context into this
            $.extend(this, context);
            this.value = this.defaultValue;
        },

        setToMax : function() {
            this.setTo(this.max);
        },

        setToMin : function() {
            this.setTo(this.min);
        },

        setToPct : function(pct) {
            this.setTo((this.max - this.min) * pct + this.min);
        },

        add : function(val) {
            this.setTo(val + this.value);
        },

        setTo : function(val) {
            this.value = Math.min(this.max, Math.max(this.min, val));
        },

        getValue : function() {
            return this.value;
        },

        toString : function() {
            return this.value + " [" + this.min + "-" + this.max + "]";
        },
    });
    return Range;
});
