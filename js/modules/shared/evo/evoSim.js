/**
 * @author Kate Compton
 */

define(["common"], function(common) {'use strict';

    var EvoSim = Class.extend({

        //createGenome, createIndividual, mutateGenome, crossoverGenomes, evaluatePopulation
        // evaluatePopulation returns an array of objects{individual:obj, avgScore:num}
        init : function() {

        },

        // Create a population with random genomes
        createPopulation : function(count) {
            var population = [];
            console.log("Generate a population of " + count)
            for (var i = 0; i < count; i++) {
                var seed = Math.floor(Math.random() * 9999999);
                var genome = this.createGenome(seed);

                population[i] = this.createIndividual(genome);
                console.log(" Created " + i + ": " + population[i]);
            }
            return population;
        },

        runGenerations : function(generationCount) {
            console.log("Run " + generationCount + " generation");
            var evoRun = {
                crossoverPct : .5,
                generations : [],
                currentGeneration : 0,
                generationCount : generationCount,
            };

            var population = this.createPopulation(this.cohortSize);

            this.runGeneration(evoRun, population);
        },

        runGeneration : function(evoRun, population) {
            var evoSim = this;
            if (evoRun.currentGeneration < evoRun.generationCount) {
                console.log("Run generation " + evoRun.currentGeneration + "/" + evoRun.generationCount);

                this.evaluatePopulation(population, function(scoredPopulation) {
                    // After evaluation
                    console.log("Finished Scoring!!!");
                    // Pick out the winners
                    // Sort the population by score
                    scoredPopulation.sort(function(a, b) {
                        return a.avgScore < b.avgScore;
                    });

                    console.log(scoredPopulation);

                    // Fill the next generation with crossovers and mutants
                    var crossoverCount = Math.floor(evoSim.cohortSize * evoRun.crossoverPct);

                    evoRun.generationCount++;
                });
            }
        },
    });

    return EvoSim;
});
