"use strict";
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler = require("errorhandler");
var cors = require('cors');
var index_1 = require('./routes/index');
var geometry_1 = require('./routes/geometry');
var multer = require('multer');
var app = express();
app.use(cors());
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'HEC-RAS-Geometry-file-parser/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use('/bower_components', express.static(__dirname + '/bower_components/'));
app.use('/systemjs.config.js', express.static(__dirname + '/systemjs.config.js'));
app.get('/', index_1.index);
app.get('/index', index_1.index);
app.get('/geometry', geometry_1.geometry);
app.post('/geometry', upload.single('file'), geometry_1.uploadGeometry);
var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    app.use(errorHandler());
}
module.exports = app;
//# sourceMappingURL=app.js.map