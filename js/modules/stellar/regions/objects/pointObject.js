/**
 * @author Kate Compton
 */
define(["common"], function(common) {

    // Message based
    // What can happen to an object?
    var pointObjectActions = {

        click : function() {
            this.applyToHandlers("click");
        },

        dblClick : function() {
            this.applyToHandlers("dblClick");
        },

        remove : function() {
            var obj = this;
            this.deleted = true;
            this.applyToHandlers("remove");
            if (this.label)
                this.label.detach();

            app.addToNewsFeed({
                html : "Removed " + obj.idNumber,
                timeout : 6000,
            });
        },
        //========
        // Handlers
    };

    // Add subscription functions
    utilities.addSubscribers(pointObjectActions, ["remove", "click", "dblClick"]);

    var upgradeToGameObject = function(obj) {
        utilities.addHandlers(obj, pointObjectActions);
    };

    //========================================================================
    //========================================================================

    var objCount = 0;

    var PointObject = Vector.extend({
        init : function() {
            this._super.apply(this, arguments);

            var obj = this;

            this.name = utilities.words.getRandomWord();

            this.screenPos = new Vector();

            this.idNumber = objCount;
            objCount++;

            this.idColor = new common.KColor((this.idNumber * .302112) % 1, 1, 1);
            upgradeToGameObject(this);

            this.onRemove(function() {
                console.log("Removed " + this);
            });

            this.onClick(function() {
                console.log("Clicked " + this);
                /*
                 app.openCentralPopupObjInfo(obj, function() {
                 app.zoomToInspect(obj);
                 });
                 */
            });

            this.onDblClick(function() {
                console.log("DBLClicked " + this);
                app.zoomToInspect(obj);
            });
        },

        onTouchEnter : function() {
            console.log("Enter " + this)
        },

        onTouchExit : function() {
            console.log("Exit " + this);
        },

        getLabelHTML : function() {
            return "Point object " + this.idNumber;
        },

        getDistanceTo : function(query) {
            if (query.useScreenPos) {
                return this.screenPos.getDistanceTo(query.target);

            } else {
                return this._super(query.target);
            }
        },

        drawThumbnail : function(context) {
            var g = context.g;
            var t = app.worldTime.total;
            g.fill(t % 1, 1, 1, 1);
            g.ellipse(0, 0, 50, 50);
        },

        drawDetails : function(context) {
            var g = context.g;
            g.noStroke();
            g.strokeWeight(1);
            var r = 5;
            var shadowR = r * 1.6;

            if (context.selectedObject === this) {
                var highlightR = r * 2.6;
                g.fill(1, 0, 1, .4);
                g.ellipse(0, r * Math.cos(context.planeAngle), highlightR, highlightR * Math.sin(context.planeAngle));

            }

            g.fill(0, 0, 0, .4);
            g.ellipse(0, r * Math.cos(context.planeAngle), shadowR, shadowR * Math.sin(context.planeAngle));

            this.idColor.fill(g, 0, -1 + context.opacity);
            this.idColor.stroke(g, -.6, -1 + context.opacity);

        },

        draw : function(context) {
            context.scale = Math.pow(1000 / this.screenPos.z, .6);
            context.opacity = context.camera.getUniverseOpacity(.4);

            // Set the camera position
            context.camera.worldToScreen(this, this.screenPos);
            if (this.label) {
                this.label.div.css({
                    "-webkit-transform" : "translate(" + this.screenPos.x + "px, " + this.screenPos.y + "px)",
                });
            }
            context.g.pushMatrix();
            this.screenPos.translateTo(context.g);
            this.drawDetails(context);
            context.g.popMatrix();
        },

        toLabelString : function() {
            return this.name;
        },

        toString : function() {
            return this.name;
        }
    });

    return PointObject;
});
