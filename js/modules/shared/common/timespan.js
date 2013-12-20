/**
 * @author Kate Compton
 */
define(["inheritance"], function(Inheritance) {
    var TimeSpan = Class.extend({

        // context options:
        // onStart, onChange, onFinish, lifespan
        init : function(context) {

            // default values
            this.lifespan = 1;
            this.ellapsed = 0;
            // Translate all the context into this
            $.extend(this, context);
        },

        start : function(startTime) {
            this.startTime = startTime;
            this.ellapsed = 0;

            if (this.onStart)
                this.onStart(t);
        },

        increment : function(ellapsed) {
            this.ellapsed += ellapsed;
            if (this.onChange)
                this.onChange(this.ellapsed, this.getPct());

            if (this.ellapsed > this.lifespan)
                this.finish();
        },

        finish : function() {
            this.completed = true;

            if (this.onFinish)
                this.onFinish();

        },

        getPct : function() {
            return (this.ellapsed) / this.lifespan;
        },

        drawClock : function(g, center, radius) {
            var pct = this.getPct();
            g.fill(0);
            g.ellipse(center.x, center.y, radius, radius);
            g.fill(1);
            g.arc(center.x, center.y, radius - 1, radius - 1, 0, 2 * pct * Math.PI);
            g.fill(0);
            g.ellipse(center.x, center.y, radius * .2, radius * .2);

        },

        toString : function() {
            return this.ellapsed + "/" + this.lifespan + " = " + this.getPct();
        },
    });

    var TimeSpanManager = Class.extend({
        init : function() {
            this.timespans = [];
        },

        add : function(timespan) {
            this.timespans.push(timespan);
        },

        update : function(ellapsed) {
            $.each(this.timespans, function(index, t) {
                t.increment(ellapsed);
            });

            // cleanup
            this.timespans = _.filter(this.timespans, function(t) {
                return !t.completed;
            });
        }
    });
    TimeSpan.Manager = TimeSpanManager;
    return TimeSpan;
});
