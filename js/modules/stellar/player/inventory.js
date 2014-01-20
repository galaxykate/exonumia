/**
 * @author Kate Compton
 */

define(["common", "../elements/elements"], function(common, Elements) {

    var InventoryUI = Class.extend({
        init : function(bag) {
            this.bag = bag;
            this.createWalletUI();
        },

        updateWalletUI : function() {

        },

        createWalletUI : function() {

            var ui = this;
            var divs = [];
            // Make a div for each element
            $.each(Elements.elements, function(index, element) {
                divs[index] = ui.addWalletElement(element);
            });
            this.divs = divs;

        },

        addWalletElement : function(element) {
            var divWallet = $("#element_wallet");
            var elementDiv = $("<div/>", {
                "class" : "elementHolder",
                id : element + "Holder",
            });

            var elementFill = $("<div/>", {
                "class" : "elementFill",
                id : element + "Fill",
            });

            var elementBG = $("<div/>", {
                "class" : "elementBG",
                id : element + "BG",
            });

            var elementLabel = $("<div/>", {
                "class" : "elementLabel",
                html : element.name,
                id : element + "Label",
            });

            var bag = this.bag;
            elementDiv.update = function() {
                var width = Math.pow(bag.capacity[element.index], .4) * 60;
                console.log(bag.capacity);
                var pct = bag.amts[element.index] / bag.capacity[element.index];

                console.log("update div for element " + element.name + " " + pct + " " + width);

                elementDiv.css({
                    width : width + "px",
                });
                elementBG.css({
                    width : width + "px",
                });
                elementFill.css({
                    width : (pct * width) + "px",
                });
            };

            var main = element.idColor.cloneShade(-.1, -.8);
            var highlight = element.idColor.cloneShade(.5, 1);
            var highlight2 = element.idColor.cloneShade(.3, 1);
            var highlight3 = element.idColor.cloneShade(.3, -.6);
            var bg0 = element.idColor.cloneShade(-.4, -.8);
            var bg1 = element.idColor.cloneShade(-.8, 1);

            divWallet.append(elementDiv);
            elementDiv.append(elementBG);
            elementDiv.append(elementFill);
            elementDiv.append(elementLabel);
            elementDiv.css({
                border : "2px solid " + highlight3.toCSS(),
            });
            elementLabel.css({
                color : highlight.toCSS(),

            })
            elementFill.css({
                border : "1px solid " + highlight3.toCSS(),
                background : main.toCSS(),
                "box-shadow" : "inset 5px 5px 5px " + highlight2.toCSS(),
            })
            elementBG.css({
                background : bg0.toCSS(),
                "box-shadow" : "inset 5px 5px 10px " + bg1.toCSS(),
            });

            elementDiv.update();
            return elementDiv;
        }
    });

    var Inventory = Class.extend({
        init : function(player) {
            this.player = player;
            this.wallet = new Elements.ElementBag();
            this.wallet.setCapacity(20, 1);
            this.wallet.fill(10, 0);
            this.ui = new InventoryUI(this.wallet);
        },

        updateElement : function(element) {
            this.ui.divs[element.index].update();
        },
    });

    return Inventory;
});
