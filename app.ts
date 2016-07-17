import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as errorHandler from "errorhandler"; 
import * as assert from 'assert';
import { index } from './routes/index';
import { geometry, uploadGeometry } from './routes/geometry';
var multer = require('multer');

var app = express();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'HEC-RAS-Geometry-file-parser/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
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



app.get('/', index);
app.get('/index', index);
app.get('/geometry', geometry);

app.post('/geometry', upload.single('file'), uploadGeometry);

var env = process.env.NODE_ENV || 'development';
if (env === 'development')
{
    app.use(errorHandler());
}

module.exports = app;