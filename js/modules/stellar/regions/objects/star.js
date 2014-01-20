/**
 * @author Kate Compton
 */
define(["common", "./pointObject"], function(common, PointObject) {
    var Star = PointObject.extend({

        init : function(p) {
            this._super(p);
            this.bgColor = new common.KColor(.3 + .3 * Math.random(1), .3, 1);
            this.radius = 10;
            this.points = Math.random() * 2 + 5;
            this.isLabelable = this;

            this.drama = "";
            if (Math.random() > .5) {
                var planetCount = Math.floor(Math.random() * 5);
                this.drama += "<br>Has " + planetCount + " planets";
                if (Math.random() > .4)
                    this.drama += "<br>Home to the " + utilities.words.getRandomWord() + " aliens";

            }
            if (Math.random() > .8) {
                count = Math.floor(Math.random() * 15) + 7;
                this.drama += "<br>Going " + app.makeSpanColor("red", "supernova in " + count + " minutes");

            }

        },

        drawDetails : function(context) {
            var g = context.g;
            g.noStroke();
            g.strokeWeight(1);
            var t = app.worldTime.total * 1;
            var radius = this.radius * context.scale;
            g.noStroke();
            var points = 5;
            var starLevels = 2;
            for (var j = 0; j < starLevels; j++) {
                var jPct = j * 1.0 / (starLevels - 1);
                g.fill(.65, (.3 - .3 * jPct), 1, .2 + jPct);
                g.beginShape();
                g.vertex(0, 0);
                var pop = 0;
                var segments = points * 10;
                for (var i = 0; i < segments + 1; i++) {
                    var theta = i * 2 * Math.PI / segments;

                    var spike = Math.abs(Math.sin(theta * points / 2));
                    spike = 1 - Math.pow(spike, .2);

                    var sparkle = 1.1 * utilities.noise(t * 2 + theta + this.idNumber);
                    sparkle = Math.pow(sparkle, 2);

                    var r = .6 * radius * (spike * sparkle);

                    r += 1 + 1.5 * pop;
                    r *= radius * .7 * (1.2 - Math.pow(.7 * jPct, 1));
                    g.vertex(r * Math.cos(theta), r * Math.sin(theta));
                }
                g.endShape();
            }
        },

        toLabelString : function() {
            var drama = this.drama;
            return this.name + "<br><font size='-2'>" + drama + "</font>";
        },
    });
    return Star;
});
