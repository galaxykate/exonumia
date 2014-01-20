/**
 * @author Kate Compton
 */

define(["common"], function(common) {
    // Labels for stars and such
    var labels = {
        active : [],
        inactive : [],
        getLabel : function() {
            if (this.inactive.length === 0) {
                console.log("out of labels!");
                return undefined;
            }
            var label = this.inactive.pop();
            this.active.push(label);
            return label;
        },

        cleanup : function() {
            var labels = this;

            // Filter all of the unused
            this.active = this.active.filter(function(label) {
                if (label.obj === undefined || label.obj.deleted) {
                    // Remove from active
                    labels.inactive.push(label);

                    return false;
                }
                return true;
            });
        },

        createLabels : function() {
            var detach = function() {
                this.obj.label = undefined;
                this.obj = undefined;
                this.div.css({
                    opacity : 0,
                    "-webkit-transform" : "translate(" + 0 + "px, " + this.index * 20 + "px)",
                });

            };

            var attachToObj = function(obj) {
                obj.label = this;
                this.obj = obj;
                this.div.html(obj.toLabelString());
                this.div.css({
                    opacity : 1,
                    "-webkit-transform" : "translate(" + obj.screenPos.x + "px, " + obj.screenPos.y + "px)",
                });

            };

            var overlay = $("#universe_overlay");
            for (var i = 0; i < 30; i++) {
                var x = Math.random() * 400;
                var y = Math.random() * 400;

                var div = $("<div/>", {
                    html : "label" + i,
                    "class" : "universe_label"
                });

                var label = {
                    div : div,
                    index : i,
                    obj : undefined,
                    attachToObj : attachToObj,
                    detach : detach,
                }

                div.css({
                    opacity : 0,
                    "-webkit-transform" : "translate(" + x + "px, " + y + "px)",
                });
                overlay.append(div);

                this.inactive.push(label);
            }

        }
    };

    return labels;
});
