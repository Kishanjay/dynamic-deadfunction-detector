# Intro
This project helps detecting dead functions<sup>1</sup> within JavaScript source code. Dead functions can increase the comprehension and modification efforts needed by developers, therefore minimizing deadcode may be benefitial to any project.

This code is designed to work on any project and does not have any dependencies or constraints for the source code. Therefore feel free to apply this to your own code base and gain some insights.

<sup>1</sup>_Dead functions are functions that are never executed._
### How it works
This is a dynamic dead code detector, meaning that it requires program execution.

Essentially all JavaScript functions are extended with logging information. These logs contain execution traces of all executed functions. Monitoring these logs over a given period of time can give a fair indication of the dead functions.

_Note: for this to work the user has to make sure not to have skipped some functionality of the website as this will cause false positives._

### Dependencies
**NodeJS** to run the instrumenter script and instrumentation_server
**Esprima** to detect the function locations [http://esprima.org/](http://esprima.org/)

## How to use
1. **Run the instrumenter.js on your project**.
This will instrument all JavaScript functions with the mentioned logging information. See [js_editor](./js_editor.js) for more.

_Note: the source can either be a file or a folder, when a file is selected it will only instrument all referenced JS code from that file (when a folder is chosen, it will instrument all .js files within that folder_

`node instrumenter.js -s ./example/proj1`

`node instrumenter.js -s ./example/proj1/index.html`

2. **Run the instrumentation_server** 
The main purpose for this server is to catch all execution traces from the instrumented functions. As a helping hand it will also host your instrumented project at: [http://localhost:8004](http://localhost:8004).

`node instrumentation_server.js ./example/proj1_instrumented`

3. **Interact with the application**
While the instrumentation_server is running interact with the instrumented application and ensure that you've covered all functionality.


4. **Interpret the results**
Once you did all of the above; enjoy the results: `_all_functions.json`, `_alive_functions.json`, `_dead_functions.json`, `_statistics.json`
## Endpoints
### instrumenter.js
The instrumenter will instrument all JS functions it encounters. Also it will create the _all_functions.json file which contains an overview with all functions it found and instrumented.

_Note: the instrumenter will copy the source code rather than overwrite it; When overwrite is desired choose the same source as output folder and use the force option_

**Runtime options**

| option       | description                                                       | default                                                      |
|--------------|-------------------------------------------------------------------|--------------------------------------------------------------|
| -s, --source | Source file or folder to be instrumented                          | (Required)                                                   |
| -o, --output | Output folder where the instrumented source code should be stored | "sourceFolder"_instrumented                                  |
| -f, --force  | Allow overriding existing files                                   | The application stops whenever a override is about to happen |

`node instrumenter.js -s <sourceFolder>`

`node instrumenter.js -s ./example/proj1/index.html -o ./example/test -f`


### instrumentation_server.js
The instrumentation server will montor all incomming logs from instrumented functions. These will be stored at runtime in the following files:

- _alive_functions.json
- _dead_functions.json
- _statistics.json

`node ./instrumentation_server.js <instrumented_sourceFolder>`

`node ./instrumentation_server.js ./example/proj1_instrumented`

### Function output format
In the .json files, all the functions are stored in the following format:
For now, a function can be uniquely identified wit a combination of file and range/bodyRange.
```text
{
    file: (the file where the function is present; can be either js or html files)
    index: (the index of the function relative to the script)
    range: (the charnumbers from the beginning to the end of the function)
    bodyRange: (the charnumbers from the beginning and end of the function body)
}
```


# TODO
Thoughts I had throughout this project that will make this project better.
- should also grab js functions from non .js files (when picking folder)
- Export variables such as filenames that are used in multiple files to a
seperate file. -> Reduce code duplication.
- Generate more visual statistics regarding the dead code
- Create a cleanup file that can maybe add comments to dead functions
or even remove them.