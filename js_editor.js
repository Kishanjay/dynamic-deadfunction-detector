/**
 * @description Class that is responsible for editing JS files.
 * Thus contains the instrumentation code aswell.
 * 
 * @version 0.1
 * @author Kishan Nirghin
 * @Date 10-02-2019
 */

const fs = require("fs"),
    esprima = require("esprima"),
    path = require("path");

require("./prototype_extension");


const ESPRIMA_FUNCTION_TYPES = ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'];
module.exports = class JsEditor {
    constructor(filePath = null) {
        if (filePath) { this.loadFile(filePath); }
    }

    loadSource(source, filePath = null) {
        this.source = this.originalSource = source;
        this.filePath = filePath;

        this._onLoadedHook();
        return this;
    }
    
    loadFile(filePath) {
        this.filePath = filePath;
        this.source = this.originalSource = fs.readFileSync(filePath).toString();

        this._onLoadedHook();
        return this;
    }

    loadFunctionData() {
        var functionData = [];
        var index = 0;
        esprima.parse(this.source, { range: true }, (node) => {
            if (ESPRIMA_FUNCTION_TYPES.includes(node.type)) {
                functionData.push({
                    type: node.type,
                    bodyRange: node.body.range,
                    range: node.range,
                    id: node.id,
                    file: this.filePath,
                    index: index++
                });
            }
        });
        return functionData;
    }

    instrumentFunctions() {
        var functionData = this.loadFunctionData();

        var instrumentationLogFunction = this._getInstrumentationLogFunction();
        this.source = this.source.insert(0, instrumentationLogFunction);
        var offset = instrumentationLogFunction.length;
        
        functionData.forEach((funcData, index) => {
            /* The code that has to be inserted at the top of the function */
            var instrumentationCode = this._instrumentationBuilder(funcData, index);

            let sourceIndex = funcData.bodyRange[0] + offset + 1; // +1 to skip the opening bracket
            this.source = this.source.insert(sourceIndex, instrumentationCode);

            offset += instrumentationCode.length;
        });

        return functionData;
    }

    /**
     * The function that will catch all instrumentation logs
     * Note that this function goes hand-in-hand with the _instrumentationBuilder
     * annd with the instrumentation_server
     * 
     * Currently this function does a call to the instrumentation server with 
     * the function information of the alive function.
     */
    _getInstrumentationLogFunction() {
        return `/**
* Instrumentation log function used by the instrumenter
* note that the data object is already stringified.
*/
function instrumentation_log(data) {
    fetch("http://127.0.0.1:8004/alivefunction", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: data
    }).then((response) => { console.log(response.body); });
    console.log(JSON.parse(data));
};\n\n`
    }

    /**
     * Creates the code that should be ran at the top of any function
     * Currently makes a call to instrumentation_log with 3 params
     */
    _instrumentationBuilder(funcData, index) {
        var data = JSON.stringify(funcData);

        return `
// @startinstrumentation (github.com/dynamic-deadfunction-detector)
instrumentation_log('${data}');
// @endinstrumentation`;
    }

    /**
     * Note: this function should only be called when its the js file that gets
     * overwritten. (should not be the html file)
     */
    saveFile() {
        if(this.filePath == null) {
			return console.log("js_editor save error: No file loaded");
        }
        if (path.extname(this.filePath) != ".js") {
            return console.log("js_editor save error: Invalid file");
        }
		fs.writeFileSync( this.filePath, this.source );
    }

    _onLoadedHook() {
        // doesnt do anything at the moment.
    }

    getSource() {
        return this.source;
    }

    getOriginalSource() {
        return this.originalSource;
    }
}