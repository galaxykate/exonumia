/**
 * @author Kate Compton
 */
define(["common"], function(common) {'use strict';
    var springCount = 0;
    var Spring = common.Edge.extend({
        init : function(start, end, strength, length) {
            this._super(start, end);
            this.force = new Vector();
            this.strength = strength;
            this.length = length;
            this.idNumber = springCount;
            springCount++;
        },

        update : function() {
            this.updatePosition();
        },

        applyForce : function() {
            var d = this.edge.magnitude();
            var delta = this.length - d;
            var f = 1 * delta;
            this.force.setToMultiple(this.edge, f / d);
            app.log("Spring " + this.idNumber + ": " + this.force);
            this.end.force.add(this.force);
            this.force.mult(-1);
            this.start.force.add(this.force);
            app.log("start " + this.start.force);
        },

        draw : function(g) {
            g.stroke(0, 1, 0, .2);
            this._super(g);

        }
    });

    var ParticleSystem = Class.extend({
        init : function() {
            this.particles = [];
            this.springs = [];
        },

        add : function(p) {
            if (p.velocity === undefined) {
                console.log("Make " + p + " a particle");
                p.velocity = new Vector();
                p.force = new Vector();
            }
            this.particles.push(p);
            console.log(this.particles);
        },

        addSpring : function(start, end, strength, length) {
            this.springs.push(new Spring(start, end, strength, length));
        },

        update : function(time) {
            app.log("update particles");

            var ellapsed = time.ellapsed;
            var t = time.total;

            app.log("Update " + this.particles.length + " for " + t);
            var range = 200;
            var p = new Vector();
            $.each(this.springs, function(index, spring) {
                spring.update(t);
            });

            $.each(this.particles, function(index, particle) {
                particle.force.mult(0);
            });

            $.each(this.springs, function(index, spring) {
                spring.applyForce();
            });

            $.each(this.particles, function(index, particle) {

                var d = particle.magnitude();
                var strength = Math.max(0, d - range);
                strength = 10 * Math.pow(strength, 1.2);

                // Gravity
                particle.force.addMultiple(particle, -strength / d);
                // Wander
                var wanderStrength = utilities.noise(.03 * p.x, .03 * p.y, t);
                wanderStrength = 200 * Math.pow(wanderStrength, 2);
                particle.force.addPolar(wanderStrength, 10 * utilities.noise(.02 * p.x, .02 * p.y, 2 * t));

                particle.velocity.addMultiple(particle.force, ellapsed);
                particle.addMultiple(particle.velocity, ellapsed);

                particle.velocity.mult(.998);
                if (particle.onPositionChange !== undefined) {
                    particle.onPositionChange();
                }

            });

        },

        render : function(g, drawSprings) {

        },

        drawSprings : function(g) {

            $.each(this.springs, function(index, spring) {
                spring.draw(g);
            });
        }
    });

    var Particle = {

        ParticleSystem : ParticleSystem,
    };

    return Particle;
});
