/**
 * @author Kate Compton
 */

define(["common", "./quests", "./inventory"], function(common, Quest, Inventory) {

    var Player = Class.extend({
        init : function() {
            var player = this;
            app.player = this;

            this.inventory = new Inventory(player);
            this.points = 0;
            this.questManager = new Quest.QuestManager(this);

            // Add subscription functions
            var playerActions = {};
            utilities.addSubscribers(playerActions, ["getPoints", "getElement"]);
            utilities.addHandlers(player, playerActions);

            // Which actions should trigger a quest-completion check?

            this.onGetElement(function(element, qty) {

            });

            this.onGetPoints(function(qty) {

            });

            // Add a test quest
            var ptQuest = new Quest({
                id : "points0",
                title : "Get some points",
                onStart : {
                    popupText : "Welcome to Stellar, brave player!  Get some points!"
                },
                onEnd : {
                    reward : {
                        points : 200,
                    },
                    popupText : "Well done, have some more points"
                }
            });

            ptQuest.addRequirement({
                pointsGained : 100,
            });

            ptQuest.activate(player);

            setInterval(function() {
               player.testEvent();
            }, 500);

        },

        testEvent : function() {

            var option = Math.floor(Math.random() * 3);
            switch(option) {
                case 0:
                    var qty = Math.floor(Math.random() * 10) + 1;

                    var choice = Math.floor(6 * Math.random() * Math.random());
                    var element = app.getElement(choice);
                    var color = element.idColor.toCSS();

                    this.getElement(element, qty);
                    app.addToNewsFeed({
                        html : "Just received " + app.makeSpanColor(color, qty + " " + element.name),
                        timeout : 1600,
                    });
                    break;

                case 1:

                    app.addToNewsFeed({
                        html : "The " + utilities.words.getRandomWord() + "are requesting help!",
                        timeout : 2200,
                    });
                    break;

            }

        },

        update : function(worldTime) {
            this.questManager.update(worldTime);
            this.questManager.cleanup();
        },

        //======================================================================
        //======================================================================
        //======================================================================
        // actions

        getPoints : function(pts) {
            this.points += pts;
            this.applyToHandlers("getPoints", [pts]);

            // Were any quests waiting for points?
            this.questManager.applyToActiveQuestsRequirements(function(req) {
                req.onGetPoints(pts);
            });
        },
        getElement : function(element, qty) {
            console.log(element);
            this.applyToHandlers("getElement", [element, qty]);
            this.inventory.wallet.add(element, qty);
            this.inventory.updateElement(element);

        },
        getItem : function(item) {

        },
        getQuest : function(quest) {
            quest.player = this;
            questManager.addQuest(quest);
        },
    });

    return Player;
});
