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
    console.log(`usage: node ${fileName} <instrumented_source>`);
    process.exit(1);
}

var instrumentedSourceLocation = process.argv[2];
var resultLocation = path.join(instrumentedSourceLocation, "_alive_functions.json");

if (!fs.existsSync(resultLocation)) {
    fs.writeFileSync(resultLocation, "[]", 'utf8');
}

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
    if (req.body) {
        /* doing this to prevent duplicates */
        var result = JSON.parse(fs.readFileSync(resultLocation, 'utf8'));
        var resultObj = convertToResultObj(result);
        resultObj[req.body.index] = req.body; // add entry to obj
        result = Object.values(resultObj); // convert back to array

        fs.writeFileSync(resultLocation, JSON.stringify(result), 'utf8');
    }
    res.send(JSON.stringify(req.body));
});

app.listen(port, () => {
    console.log(`Instrumentation_server listening on port ${port}!`);
    console.log(`See results: ${resultLocation}`);
});

function convertToResultObj(result){
    var resultObj = {};
    result.forEach((func) => {
        resultObj[func.index] = func;
    });
    return resultObj;
}