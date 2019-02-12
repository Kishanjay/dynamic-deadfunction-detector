# Intro
Detects dead JavaScript functions within a project by applying dynamic analysis
using instrumented source code.

## How it works
Essentially all JavaScript functions are extended with logging information;
these logs provide execution traces of all executed functions.

Thus running the website, and going over all execution traces will result in
logs for all executed functions. Meaning the functions that did not produce
any log-entry are considered dead.

_Note: for this to work the user has to make sure not to have skipped some
functionality of the website as this will cause false positives._

The functionality relies on esprima to detect function locations.
[http://esprima.org/] 

## How to use
1. **Run the instrumenter.js** on your project to instrument all javascript functions
which is required to measure its use over time.
2. **Run the instrumentation_server** this server monitors and catches all logs
comming from alive functions.
3. While the instrumentation_server is running **interact with the application**
to ensure that all functions have been executed.
4. **Run the generate_statistics.js** file to generate the _dead_functions and statistics
files.

## Endpoints
- **instrumenter.js** Instruments all JS files from the input folder
furthermore the _all_functions.json file will be generated containing all 
spotted functions of these files

- **instrumentation_server.js** Captures the alive functions of the instrumented
applications. Generates the _alive_functions.json file.

_ **generate_statistics.js** Compares the alive_functions with all_functions
and makes some statistics about these facts. Also generates the _dead_functions.json
and _statistics.json file.



The output format of the functions is the same overal
{
    id: (not always present),
    index: (the index of the function, can be used as identifier)
    file: (the file where the function is present)
    range: (the charnumbers from the beginning to the end of the function)
    bodyRange: (the charnumbers from the beginning and end of the function body)
}



# TODO
Some things that would make this project better are:

- Export variables such as filenames that are used in multiple files to a
seperate file. -> Reduce code duplication.
- Generate more visual statistics regarding the dead code
- Create a cleanup file ? that can maybe add comments to dead functions
or even remove them.