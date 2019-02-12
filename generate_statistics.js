/**
 * @description Script that will generate statistics 
 * Once the _alive_functions.json is filled, by running the application
 * long enough to ensure all alive functionality has been covered, this
 * script will make a comparison between all_functions and alive_functions
 * to generate statistics regarding this matter.
 * 
 * @version 0.1
 * @author Kishan Nirghin
 * @Date 12-02-2019
 * 
 * @param <sourceFolder> 
 */

const path = require("path"),
    fs = require("fs");

if(process.argv.length < 3) {
    console.log(`usage: node ${fileName} <instrumented_source>`);
    process.exit(1);
}

var instrumentedSourceLocation = process.argv[2];
var aliveFunctionsPath = path.join(instrumentedSourceLocation, "_alive_functions.json");
var allFunctionsPath = path.join(instrumentedSourceLocation, "_all_functions.json");
var deadFunctionsPath = path.join(instrumentedSourceLocation, "_dead_functions.json");
var statisticsPath = path.join(instrumentedSourceLocation, "_statistics.json");

var aliveFunctions = JSON.parse(fs.readFileSync(aliveFunctionsPath, 'utf8'));
var allFunctions = JSON.parse(fs.readFileSync(allFunctionsPath, 'utf8'));


var deadFunctions = [];
allFunctions.forEach((func) => {
    if (!isAlive(func)) {
        deadFunctions.push(func);
    }
});

var statistics = {
    numberOfAliveFunctions: aliveFunctions.length,
    numberOfFunctions: allFunctions.length,
    numberOfDeadFunctions: deadFunctions.length
};

fs.writeFileSync(deadFunctionsPath, JSON.stringify(deadFunctions), 'utf8');
fs.writeFileSync(statisticsPath, JSON.stringify(statistics), 'utf8');

/** 
 * Helper method
 * Uses the aliveFunctions global variable
 */
function isAlive(func) {
    var isAlive = false;
    aliveFunctions.forEach((aliveFunc) => {
        if (func.index == aliveFunc.index) { return isAlive = true; }
    });
    return isAlive;
}