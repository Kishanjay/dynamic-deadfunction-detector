/**
 * @description Instruments all JS functions of a project with logging 
 * information. Relies on Esprima parser to detect all JS functions.
 * 
 * The instrumentation functions can be found in the js_editor.js
 * Currently it uses the instrumentation_log function which makes a
 * request to the instrumentation_server; which will store all alive functions
 * under alive_functions.json
 * 
 * @version 0.1
 * @author Kishan Nirghin
 * @Date 05-02-2019
 * 
 * @param <sourceFolder> 
 */
'use strict';

const cheerio = require("cheerio"),
    esprima = require("esprima"),
    fs = require("fs-extra"),
    path = require("path"),
    fileName = path.basename(__filename);

var helper = require("./helper");
var JsEditor = require("./js_editor");

require("./prototype_extension");

if(process.argv.length < 3) {
    console.log(`usage: node ${fileName} <source>`);
    process.exit(1);
}

var sourceLocation = process.argv[2];
/* append the source location with _instrumented and copy the sourcecode (preserving the original) */
var instrumentedSourceLocation = "./" + path.join(path.dirname(sourceLocation), path.basename(sourceLocation) + "_instrumented");
// if (fs.existsSync(instrumentedSourceLocation)) {
//     console.log(`Warning folder ${instrumentedSourceLocation} already exists`);
//     process.exit(1);
// }
fs.copySync(sourceLocation, instrumentedSourceLocation);

/* retrieve all .js files within these folders */
var jsFilePaths = helper.getJsFilePaths(instrumentedSourceLocation);

/* instrument all functions in these .js files */
var allFunctions = [];
jsFilePaths.forEach((jsFilePath) => {    
    var jse = new JsEditor().loadFile(jsFilePath);

    var functionsOfFile = jse.instrumentFunctions();
    allFunctions = allFunctions.concat(functionsOfFile);
    jse.saveFile();
});

var resultLocation = path.join(instrumentedSourceLocation, "_all_functions.json");
fs.writeFileSync(resultLocation, JSON.stringify(allFunctions), 'utf8');

