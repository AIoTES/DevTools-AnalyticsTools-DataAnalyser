var tmp = require("tmp");
var fs = require("fs");
const path = require("path");

module.exports = {

    // TODO: remove promise versions of file system read/writes, using node.js v10 fs/promises.

    // Writes contents to a file and returns a Promise.
    writeFilePromise: function(filename, contentsStr) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filename, contentsStr, err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    },

    // Reads a file and returns the contents in a Promise.
    readFilePromise: function(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, contents) => {
                if (err) {
                    console.log(err);
                    reject(err)
                }
                else {
                    resolve(contents.toString());
                }
            });
        });
    },

    // ------------------------------------------------------------------------------------

    // Calls a process and returns stdout as a Promise.
    callProcessPromise: function(name, parameters) {
        const spawn = require("child_process").spawn;
        return new Promise((resolve, reject) => {
            const proc = spawn(name, parameters);
            let dataStr = "";
            proc.stdout.on('data', contents => {
                dataStr += contents.toString();
            });
            proc.stdout.on('end', () => {
                resolve(dataStr)
            });
        });
    },

    // Runs a python script using temporary files to pass input and output.
    // The script is expected to be called in the following format:
    // python scriptname.py input_data_file output_data_file [parameter1 parameter2 ...]
    runPythonScript: async function(scriptPath, inputData, parameters) {
        let tmpDir = path.resolve(".") + path.sep + "tmp";
        let tmpFileInputData = tmp.fileSync({postfix: ".tmp.json", dir: tmpDir});
        let tmpFileOutputData = tmp.fileSync({postfix: ".tmp.json", dir: tmpDir});
    
        let output = "";
        try {
            await this.writeFilePromise(tmpFileInputData.name, JSON.stringify(inputData));
            await this.callProcessPromise('python', [scriptPath, tmpFileInputData.name, tmpFileOutputData.name, ...parameters]);
            let writtenOutput = await this.readFilePromise(tmpFileOutputData.name);
            output = JSON.parse(writtenOutput);
        } catch(e) {
            console.log(e);
        }

        return output;
    }
    
}
