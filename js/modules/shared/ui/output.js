/**
 * @author Kate Compton
 */

define(["common"], function(COMMON) {'use strict';

    // Some output that gets dumped to a div, and reset on occaision
    var Output = Class.extend({
        init : function(div) {
            this.div = div;
            this.div.html("DEBUG");
        },

        log : function(line) {

            this.div.append(line + "<br>");

        },

        clear : function() {
            this.div.html("");
        },
    });

    return Output;
});
