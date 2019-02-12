/**
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
};

function sayHello() {
// @startinstrumentation (github.com/dynamic-deadfunction-detector)
instrumentation_log('{"type":"FunctionDeclaration","bodyRange":[20,71],"range":[0,71],"id":{"type":"Identifier","name":"sayHello","range":[9,17]},"file":"example/proj1_instrumented/script.js","index":0}');
// @endinstrumentation
    console.log("Hello there my dear friend.");
}

var hi = function () {
// @startinstrumentation (github.com/dynamic-deadfunction-detector)
instrumentation_log('{"type":"FunctionExpression","bodyRange":[94,135],"range":[82,135],"id":null,"file":"example/proj1_instrumented/script.js","index":1}');
// @endinstrumentation
    console.log("Hi, how are you")   
}

var hi_softdelete = function () {
// @startinstrumentation (github.com/dynamic-deadfunction-detector)
instrumentation_log('{"type":"FunctionExpression","bodyRange":[169,207],"range":[157,207],"id":null,"file":"example/proj1_instrumented/script.js","index":2}');
// @endinstrumentation
    console.log("Old hi function")
}

var hi_v2 = () => {
// @startinstrumentation (github.com/dynamic-deadfunction-detector)
instrumentation_log('{"type":"ArrowFunctionExpression","bodyRange":[227,262],"range":[221,262],"id":null,"file":"example/proj1_instrumented/script.js","index":3}');
// @endinstrumentation
    console.log("some new hi");
}

// sayHello();