/**
 * @description Server that gets called by all all alive functions.
 * The server will create an unique set of alive_functions.txt
 * 
 * @version 0.1
 * @author Kishan Nirghin
 * @Date 07-02-2019
 * 
 * @param <instrumentedSourceFolder> 
 */
'use strict';

const express = require("express"),
    path = require("path"),
    fs = require("fs"),
    bodyParser = require("body-parser");

const { check } = require('express-validator/check');
const app = express()
const port = 8004

const fileName = path.basename(__filename);


if(process.argv.length < 3) {
    console.log(`usage: node ${fileName} <instrumented_sourcefolder>`);
    process.exit(1);
}
var instrumentedSourceLocation = process.argv[2];

var aliveFunctionsPath = path.join(instrumentedSourceLocation, "_alive_functions.json");
if (!fs.existsSync(aliveFunctionsPath)) {
    fs.writeFileSync(aliveFunctionsPath, "[]", 'utf8'); // default
}
var allFunctionsPath = path.join(instrumentedSourceLocation, "_all_functions.json");
var deadFunctionsPath = path.join(instrumentedSourceLocation, "_dead_functions.json");
var statisticsPath = path.join(instrumentedSourceLocation, "_statistics.json");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// parse application/json
app.use(bodyParser.json())


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(instrumentedSourceLocation));

/**
 * An alive function will call this method by default.
 */
app.post('/alivefunction', (req, res) => {
    var func = req.body;
    if (func) {
        /* Fancy way to prevent duplicates in the alive functions file */
        var result = JSON.parse(fs.readFileSync(aliveFunctionsPath, 'utf8'));
        var resultObj = convertToResultObj(result);
        
        var funcId = getFuncId(func);
        resultObj[funcId] = func;
        result = Object.values(resultObj);

        fs.writeFileSync(aliveFunctionsPath, JSON.stringify(result), 'utf8');
        
        updateStatistics();
    }
    res.send(JSON.stringify(req.body));
});

app.listen(port, () => {
    console.log(`Instrumentation_server listening on port ${port}!`);
    console.log("============== See function results here ==============");
    console.log(`[All]   \t ./${allFunctionsPath}`);
    console.log(`[Alive] \t ./${aliveFunctionsPath}`);
    console.log(`[Dead]  \t ./${deadFunctionsPath}`);
    console.log(`[Stats] \t ./${statisticsPath}`);
    console.log("=======================================================");
});

function convertToResultObj(result){
    var resultObj = {};
    result.forEach((func) => {
        var funcId = getFuncId(func);
        resultObj[funcId] = func;
    });
    return resultObj;
}



function updateStatistics() {
    var aliveFunctions = JSON.parse(fs.readFileSync(aliveFunctionsPath, 'utf8'));
    var allFunctions = JSON.parse(fs.readFileSync(allFunctionsPath, 'utf8'));
    
    var deadFunctions = [];
    allFunctions.forEach((func) => {
        if (!isAlive(aliveFunctions, func)) {
            deadFunctions.push(func);
        }
    });

    var statistics = {
        numberOfAliveFunctions: aliveFunctions.length,
        numberOfFunctions: allFunctions.length,
        numberOfDeadFunctions: deadFunctions.length
    };

    console.log(statistics);

    fs.writeFileSync(deadFunctionsPath, JSON.stringify(deadFunctions), 'utf8');
    fs.writeFileSync(statisticsPath, JSON.stringify(statistics), 'utf8');
}

/** 
 * Helper method
 * Uses the aliveFunctions global variable
 */
function isAlive(aliveFunctions, func) {
    var isAlive = false;
    aliveFunctions.forEach((aliveFunc) => {
        if (getFuncId(func) == getFuncId(aliveFunc)) { return isAlive = true; }
    });

    if (isAlive) { return func}
    return isAlive;
}

/**
 * Computes an unique function Id for every function
 * @param {*} func 
 */
function getFuncId(func) {
    return func.file + func.range[0];
}