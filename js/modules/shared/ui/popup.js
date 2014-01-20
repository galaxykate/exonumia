/**
 * @author Kate Compton
 */
/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {'use strict';
    var popupCount = 0;

    var listDivs = function(array) {
        var s = array.reduce(function(acc, current) {
            return acc + " " + current.popupIndex;

        }, "");
        return s;
    };

    var getRectCSS = function(position, dimensions, css) {
        if (css === undefined) {
            css = {};
        }

        css.left = Math.round(position.x) + "px";
        css.top = Math.round(position.y) + "px";
        css.width = Math.round(dimensions.x) + "px";
        css.height = Math.round(dimensions.y) + "px";
        return css;
    };
    // Popup contains a div at some location
    // Popup features
    //      Pointing popups: popups with an arrow to an onscreen object
    //      Click-to-zoom popups, click to show...something
    //      Thumbnail popups: popups containing some processing drawing
    //      Click-to-close popups, click

    var Popup = Class.extend({

        init : function(context) {
            this.idNumber = popupCount;
            popupCount++;

            // Default values:

            this.id = "popup" + this.idNumber;
            this.title = "";
            this.html = "";
            this.active = false;
            this.timeout = 0;
            this.animate = true;
            this.clickToClose = true;
            this.addCloseButton = false;

            // Nothing to point to
            this.pointerTarget = undefined;
            this.pointerRelative = false;

            this.closedDimensions = new Vector(0, 0);
            // random location
            this.positions = {
                open : new Vector(Math.random() * 400, Math.random() * 400)
            }

            // Overlay with custom context
            $.extend(this, context);

            if (this.pointerTarget !== undefined) {
                this.location.setTo(this.pointerTarget);
                console.log(this.pointerTarget);
            }

            // Ignore birth and death locations for now...but how would we do them?
        },

        setDimensions : function(p) {
            this.div.css({
                width : Math.round(p.x) + "px",
                height : Math.round(p.y) + "px",

            });
        },

        setPosition : function(p) {

            if (app.getOption("usePositioning")) {
                app.log("Set using positioning");
                this.div.css({
                    left : Math.round(p.x) + "px",
                    top : Math.round(p.y) + "px",

                });
            }

            if (app.getOption("use2DTranslate")) {
                app.log("Set using 2DTranslate");
                this.div.css({
                    transform : "translate(" + Math.round(p.x) + "px, " + Math.round(p.y) + "px)",
                });
            }

            if (app.getOption("use3DTranslate")) {
                app.log("Set using 3DTranslate");
                this.div.css({
                    transform : "translate3D(" + Math.round(p.x) + "px, " + Math.round(p.y) + "px, 0px)",
                });
            }

        },

        // Setup this div to represent this popup (div pooling)
        setDiv : function(div) {

            var popup = this;
            this.div = div;
            div.removeClass();

            var html = this.html;
            if (this.title) {
                html = "<b>" + this.title + "</b><br>" + html;
            }

            div.html(html);
           
            div.addClass("popup");

            // Add a click handler
            div.click(function(event) {
                console.log("clicked " + popup);
                if (this.onClick !== undefined) {

                    this.onClick();
                }
                if (popup.clickToClose) {
                    popup.close();
                }
            });

            this.open();

        },

        open : function() {
            var div = this.div;
            var popup = this;

            div.removeClass("popup_hidden");
            div.addClass("popup_active");

            this.setPosition(this.positions.open);

            // start the timer
            if (this.timeout > 0 && this.timeout !== undefined) {
                setTimeout(function() {
                    popup.close();
                }, this.timeout);
            }
        },

        close : function() {
            var popup = this;

            if (popup.onClose !== undefined) {
                popup.onClose();
            }

            popup.div.addClass("popup_hidden");
            popup.div.removeClass("popup_active");
            // remove it quickly
            setTimeout(function() {

                popup.deleted = true;
                popup.manager.cleanup();
            }, 700);

        },
    });

    var PopupManager = Class.extend({
        init : function(context) {

            // Default values:
            this.maxPopups = 0;
            this.divCount = 0;
            // Overlay with custom context
            $.extend(this, context);

            this.popupHolder = $("#" + this.divName);

            this.freeDivs = [];
            this.popups = [];

            // Create a div pool
            for (var i = 0; i < this.maxPopups; i++) {
                var popupDiv = this.createPopupDiv(i);
                this.freeDivs[i] = popupDiv;
            }

        },

        createPopupDiv : function(index) {
            var popupDiv = $("<div/>", {
                "class" : "popup popup_hidden",
                id : "popup" + this.divCount,
            });

            popupDiv.popupIndex = this.divCount;

            // Add to the holder
            this.popupHolder.append(popupDiv);
            this.divCount++;
            return popupDiv;
        },

        getFreeDiv : function() {
            return this.createPopupDiv();
        },

        // Do something to add a popup
        addPopup : function(context) {
            // Get a free div

            if (this.freeDivs.length === 0) {
            }
            var div = this.getFreeDiv();
            var popup = new Popup(context);
            popup.manager = this;
            popup.setDiv(div);
            this.popups.push(popup);

            return popup;

        },

        cleanup : function() {
            var manager = this;

            // Free up all the divs
            $.each(manager.popups, function(index, popup) {
                if (popup.deleted) {
                    popup.div.remove();
                    // manager.freeDivs.push(popup.div);
                }
            });

            manager.popups = _.filter(manager.popups, function(popup) {
                return !popup.deleted;
            });

        }
    });

    var NoticeBar = PopupManager.extend({
        init : function(context) {
            this._super(context);

            // test
            // this.testPopupChain();
            this.testCount = 0;
        },

        testPopupChain : function() {
            var pm = this;
            setTimeout(function() {
                pm.addPopup({
                    html : "popup" + String.fromCharCode(65 + (pm.testCount % 26)),
                    timeout : Math.random() * 6000 + 400,
                });
                pm.testCount++;
                pm.testPopupChain();
            }, Math.random() * 2000 + 100);
        },

        addPopup : function(context) {
            // Overwrite the locations
            var popup = this._super(context);

            popup.div.css({
                position : "static",
            });

            return popup;
        },
    });

    var CenterPopup = Class.extend({
        init : function(divName, openStyle, closedStyle) {
            var popup = this;
            this.div = $("#" + divName);
            this.div.addClass(closedStyle);

            this.openStyle = openStyle;
            this.closedStyle = closedStyle;
            this.div.click(function() {
                popup.close();
            });
        },

        open : function(decorate) {
            this.div.html("");

            this.div.removeClass(this.closedStyle);
            decorate(this.div);
            this.div.addClass(this.openStyle);

        },
        close : function() {
            this.div.removeClass(this.openStyle);
            this.div.addClass(this.closedStyle);

        }
    });
    Popup.CenterPopup = CenterPopup;

    Popup.PopupManager = PopupManager;
    Popup.NoticeBar = NoticeBar;
    return Popup;

});
