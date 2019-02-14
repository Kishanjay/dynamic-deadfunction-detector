/**
 * Helper functions.
 */

const fs = require("fs-extra"),
    path = require("path");

var getJsFilePaths = (dir, nesting = true, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            if (nesting) {
                filelist = getJsFilePaths(path.join(dir, file), filelist)
            }
        } else if (path.extname(file) == ".js") {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
}

module.exports = {
    getJsFilePaths
}