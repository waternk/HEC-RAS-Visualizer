"use strict";
var child_process = require('child_process');
var path = require('path');
var os = require("os");
function uploadGeometry(req, res) {
    console.log(os);
    if (os.platform() == "win32") {
        child_process.exec("cd HEC-RAS-Geometry-file-parser && hec uploads/" + req.file.originalname, function (error, stdout, stderr) {
            if (error !== null) {
                console.log(error);
                res.statusMessage = error.message;
                res.status(500).end();
            }
            else {
                res.sendFile(path.join(__dirname, '../HEC-RAS-Geometry-file-parser/finalno.txt'));
            }
        });
    }
    else {
        child_process.exec("cd HEC-RAS-Geometry-file-parser && ./hec uploads/" + req.file.originalname, function (error, stdout, stderr) {
            if (error !== null) {
                console.log(error);
                res.statusMessage = error.message;
                res.status(500).end();
            }
            else {
                res.sendFile(path.join(__dirname, '../HEC-RAS-Geometry-file-parser/finalno.txt'));
            }
        });
    }
}
exports.uploadGeometry = uploadGeometry;
//# sourceMappingURL=geometry.js.map