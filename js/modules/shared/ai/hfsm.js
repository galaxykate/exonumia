/**
 * @author Kate Compton
 */

define(["common"], function(common) {
    var HFSM = common.Tree.extend({
        init : function(parent, name) {
            this._super();
            this.name = name;
            this.setParent(parent);
            this.transistions = [];

        },

        createTransistion : function(targetState, condition) {
            var t = new Transition(targetState, condition);
            this.transisitons.add(t);
        },

        attemptTransition : function() {
            // Find the current transistion

        },

        setPosition : function() {
            var border = 5;
            this.width = 0;
            this.height = 0;
            $.each(this.children, function(index, child) {
                child.setPosition();
            });

        },

        createDiv : function(parent) {
            var node = this;
            node.div = $("<div/>", {
                "class" : "hfsm",
                id : "hfsm" + node.idNumber,
                html : node.name + "<br>"
            });
            parent.append(node.div);

            $.each(node.children, function(index, child) {
                child.createDiv(node.div);
            });

        },

        testReduce : function() {
            var text = this.reduceDown(function(accumulator, node) {
                console.log("Base: " + accumulator + " tree: " + node);
                return accumulator + "[" + node.name + ": " + node.depth + "]";
            }, "");

            console.log(text);
        },
    });
    return HFSM;
});
