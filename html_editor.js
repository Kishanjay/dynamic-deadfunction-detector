const cheerio = require("cheerio"),
    fs = require("fs"),
    path = require("path");

module.exports = class HTMLEditor {
    loadFile(filePath) {
        this.filePath = filePath;
        this.source = this.originalSource = fs.readFileSync(filePath).toString();
        this.html = this.originalHtml = cheerio.load(this.source);
        return this;
    }

    getExternalScripts() {
        var cScripts = this.html('script');

        var scripts = [];
        cScripts.each((index, cScriptElement) => {
            if (cScriptElement.attribs["src"]) {
                var scriptSrc = path.join(
                    path.dirname(this.filePath),
                    cScriptElement.attribs['src']
                );
                
                scripts.push({
                    src: scriptSrc,
                    index: index,
                });    
            }   
        });
        return scripts;  
    }
    getInternalScripts() {
        var cScripts = this.html('script');

        var scripts = [];
        cScripts.each((index, cScriptElement) => {
            if (!cScriptElement.attribs["src"]) {
                var source = cheerio(cScriptElement).html();
                var bodyStart = this.source.indexOf(source);
                var bodyEnd = bodyStart + source.length;

                scripts.push({
                    src: this.filePath,
                    index: index,
                    source: cheerio(cScriptElement).html(),
                    bodyRange: [bodyStart, bodyEnd]
                });
            }
        });
        return scripts;
    }

    /**
     * Update an inline script in the html
     * @param {*} script the original script content
     * @param {*} newScript the new script content
     */
    updateInternalScript(oldScriptContent, newScriptContent) {
        var index = this.source.indexOf(oldScriptContent);
        if (index < 0) {
            return console.log("html_editor updateInternalScript error: oldScriptContent not found");
        }
        this.source = this.source.splice(index, oldScriptContent.length, newScriptContent);
    }

    saveFile() {
        fs.writeFileSync( this.filePath, this.source );
    }
}