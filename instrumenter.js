/**
 * @description Instruments all JS functions of a project with logging 
 * information. Relies on Esprima parser to detect all JS functions.
 * 
 * The instrumentation functions can be found in the js_editor.js
 * Currently it uses the instrumentation_log function which makes a
 * request to the instrumentation_server; which will store all alive functions
 * under _alive_functions.json
 * 
 * @version 0.1
 * @author Kishan Nirghin
 * @Date 05-02-2019
 * 
 * @param <sourceFolder> 
 */
'use strict';

const fs = require("fs-extra"),
    path = require("path"),
    commandLineArgs = require('command-line-args'),
    fileName = path.basename(__filename);

var helper = require("./helper");
var JsEditor = require("./js_editor"),
    HTMLEditor = require("./html_editor");

require("./prototype_extension");

/* get the instrumenter options */
var options = {
    remove: false,
    file: false,
    source: null,
}
try {
    var argv = commandLineArgs([
        /* Force overrides of source code */
        { name: 'force', type: Boolean, alias: 'f' },

        /* Source can either be a file or a folder */
        { name: 'source', type: String, alias: 's' },

        /* instrumented source folder (output) */
        { name: 'output', type: String, alias: 'o' },
    ]);
    options.extend(argv);
} catch(exception) {
	console.log(exception.message);
	process.exit(1);
}

if( ! options["source"] ) {
    console.log(`usage: node ${fileName} -s <source>`);
    process.exit(1);
}

options["file"] = (path.extname(options["source"]) != ""); // True or false on whether the source is a file.


var sourceFolder = path.dirname(options["source"]);
// exception to get the source folder (dirname gives the parent folder when source is a folder)
if (!options["file"]) {
    sourceFolder = "./" + path.join(sourceFolder, path.basename(options["source"]));
}

var instrumentedSourceFolder =  sourceFolder + "_instrumented";
if (options["output"]) {
    instrumentedSourceFolder = options["output"];
}

var instrumentedSourceFile = null;
if (options["file"]) {
    instrumentedSourceFile = "./" + path.join(instrumentedSourceFolder, path.basename(options["source"]));
}


if (fs.existsSync(instrumentedSourceFolder)) {
    console.log(`Warning folder ${instrumentedSourceFolder} already exists`);

    if (!options["force"]) { process.exit(1); }
    console.log(`(Force override activated, continuing..)`);
    
}

/* allow users to override the source folder */
if (sourceFolder != instrumentedSourceFolder){
    fs.copySync(sourceFolder, instrumentedSourceFolder);
}

var allFunctions = []; // keep track of all functions that were instrumented

if (options["file"]) {
    var htmle = new HTMLEditor().loadFile(instrumentedSourceFile);

    var externalScripts = htmle.getExternalScripts();
    externalScripts.forEach((extScript) => {
        var jse = new JsEditor().loadFile(extScript.src);
        var functionsOfFile = jse.instrumentFunctions();
        allFunctions = allFunctions.concat(functionsOfFile);
        jse.saveFile();
    });

    var internalScripts = htmle.getInternalScripts();
    internalScripts.forEach((intScript) => {
        var jse = new JsEditor().loadSource(intScript.source, intScript.src);
        var functionsOfFile = jse.instrumentFunctions();
        allFunctions = allFunctions.concat(functionsOfFile);
        htmle.updateInternalScript(jse.getOriginalSource(), jse.getSource());
        htmle.saveFile();
    });
} else {
    /* retrieve all .js files within these folders */
    var jsFilePaths = helper.getJsFilePaths(instrumentedSourceFolder);

    /* instrument all functions in these .js files */
    jsFilePaths.forEach((jsFilePath) => {    
        var jse = new JsEditor().loadFile(jsFilePath);

        var functionsOfFile = jse.instrumentFunctions();
        allFunctions = allFunctions.concat(functionsOfFile);
        jse.saveFile();
    });
}

var resultLocation = path.join(instrumentedSourceFolder, "_all_functions.json");
fs.writeFileSync(resultLocation, JSON.stringify(allFunctions), 'utf8');

