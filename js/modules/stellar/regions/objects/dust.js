/**
 * @author Kate Compton
 */
define(["common", "./pointObject", "../../elements/elements"], function(common, PointObject, Elements) {
    var Star = PointObject.extend({

        init : function(p) {
            this._super(p);
            this.bgColor = new common.KColor(.3 + .3 * Math.random(1), .3, 1);
            this.radius = 10 + Math.random(30);

            this.contents = new Elements.ElementBag();
            // Fill the bag with stuff
            var quality = Math.random() * Math.random();
            this.contents.fill(Math.random() * 10, quality);
        },

        drawDetails : function(context) {
            var g = context.g;
            var t = app.worldTime.total;

            for (var i = 0; i < 5; i++) {
                var radius = this.radius * (1.2 + Math.sin(i * 2 + .3 * t));
                g.fill(.3, .1, 1, .05);
                var r = this.radius * 2 * utilities.noise(i + this.idNumber + t * .01 + 20);
                var theta = 40 * utilities.noise(i + this.idNumber + t * .1) * (1 / r);
                g.ellipse(r * Math.cos(theta), r * Math.sin(theta), radius, radius);
            }
        },
    });
    return Star;
});
