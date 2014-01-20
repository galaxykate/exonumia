/**
 * @author Kate Compton
 */
define(["common", "./elementsEncyclopedia"], function(common, elementsEncyclopedia) {
    var gameElements = ["Helium", "Hydrogen", "Carbon", "Nitrogen", "Oxygen"];
    // Create the element list

    var elementsBySymbol = {};
    var elementsByNumber = [];
    var elementsByName = {};

    $.each(gameElements, function(index, name) {
        // Get the object from the encylopedia
        var entry = elementsEncyclopedia[name];

        var element = {
            name : name,
            symbol : entry.symbol,
            atomicNumber : entry.atomic_number,
            index : index,
            idColor : new common.KColor((index * .12 + .4) % 1, 1, 1),
        };
        if (index === 0)
            element.idColor = new common.KColor(.45, .3, .8);

        elementsByNumber[element.index] = element;

        elementsBySymbol[element.symbol] = element;
        elementsByName[element.name] = element;
    });

    var elements = elementsByNumber;

    var setApp = function(app) {
        app.getElement = function(query) {
            if (!isNaN(query))
                return elementsByNumber[query];

            var el = elementsBySymbol[query];
            if (el === undefined)
                el = elementsByName[query];

            if (el === undefined)
                throw ("Unable to find element " + query);
            return el;
        };

        // Do something for each element
        app.eachElement = function(f) {
            for (var i = 0; i < elements.length; i++) {
                f(elements[i]);
            }
        }
    };

    var ElementBag = Class.extend({

        // in the form of {hydrogen: 1, helium :32, etc}
        init : function() {

            this.amts = [];
            for (var i = 0; i < elements.length; i++) {
                this.amts[i] = 0;
            }

            this.capacity = [];
        },

        setCapacity : function(size, falloff) {
            for (var i = 0; i < elements.length; i++) {
                this.capacity[i] = Math.floor(size);
                size *= falloff;
            }
        },

        fill : function(quantity, rarity) {

            for (var i = 0; i < elements.length; i++) {
                var d = Math.abs(i - rarity*elements.length) / (elements.length / 2);
                this.amts[i] = Math.floor(quantity * d);
            }

        },

        removeRandom : function() {

            // FIX: should use weighted, but faking for now
            var which = Math.random() * Math.random();

        },

        addBag : function(bag) {

        },

        // Quantity rounds down
        add : function(element, qty) {
            var index = element.index;
            if (this.amts[index] !== undefined) {
                this.amts[index] = 0;
            }
            this.amts[index] += Math.floor(qty);
            console.log("Add " + qty + " to " + this.amts[index]);
        },
    });

    return {
        elementsBySymbol : elementsBySymbol,
        elementsByName : elementsByName,
        elementsByNumber : elementsByNumber,
        elements : elementsByNumber,
        ElementBag : ElementBag,
        setApp : setApp,
    };
});
