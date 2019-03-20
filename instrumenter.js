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

const commandLineArgs = require('command-line-args');
const instrumenter = require("./instrumenter_runner");

require("./prototype_extension");

/* get the instrumenter options */
var options = {
    remove: false,
    file: false,
    source: null,
    label: null,
    console: false,
    unique: false
}
try {
    var argv = commandLineArgs([
        /* Force overrides of source code */
        { name: 'force', type: Boolean, alias: 'f' },

        /* Source can either be a file or a folder */
        { name: 'source', type: String,  defaultOption: true },

        /* instrumented source folder output */
        { name: 'destination', type: String, alias: 'd' },

        /* A label that should be included in every log */
        { name: 'label', type: String, alias: 'l' },

        /* Echo the log to console only (no http request/ quicker/ performance) */
        { name: 'console', type: Boolean, alias: 'c' },

        /* whether we should only log unique logs */ 
        { name: 'unique', type: Boolean, alias: 'u' }
    ]);
    options.extend(argv);
} catch(exception) {
	console.log(exception.message);
	process.exit(1);
}

instrumenter.run(options);