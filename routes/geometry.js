"use strict";
var child_process = require('child_process');
var path = require('path');
function geometry(req, res) {
    child_process.exec("cd HEC-RAS-Geometry-file-parser && ./hec /Users/filiptubic/Downloads/GRF-Ustaljeno18122015/DjerdapTestovi-GRF.g07", function (error, stdout, stderr) {
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
exports.geometry = geometry;
;
function uploadGeometry(req, res) {
    console.log(req.file.path);
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
exports.uploadGeometry = uploadGeometry;
//# sourceMappingURL=geometry.js.map