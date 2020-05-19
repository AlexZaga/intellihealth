'use strict'
//Server Headers
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compress = require('compression');
const http = require('http');
//Define Object
const HELPER = require('./assets/helper');
//Create Server
const app = express();
//Allow Cross Domain
const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-methods','GET, POST, PUT');
    res.header('Access-Control-Allow-Headers','Content-Type, Authorization');
    next();
};
//Sanitize port
app.set('port', process.env.HOSTPORT);
//Best practice secure
app.set('trusty-prox', 1);
//Compress all request
app.use(compress());
//Middleware to protect for http vulnerabilities
app.use(helmet());
//Middleware to parse body
app.use(bodyParser.urlencoded({extended: false}));
//Understand JSON format
app.use(bodyParser.json());
//Use secure options
app.use(allowCrossDomain);
//Set Route object
app.use(express.Router());
//Timer log registry
app.use((req, res, next) => {
    HELPER.setmessageLog(HELPER.infoLog().concat('Foreing IP: ').concat(req.ip));
    HELPER.saveLog();
    console.log(HELPER.getmessageLog());
    next();
});
//Start server
HELPER.InitDB();
//require('./controllers')(app);
http.createServer(app).listen(app.get('port'), () => {
    HELPER.setmessageLog(HELPER.infoLog().concat('Server App listening and ready on ').concat(app.get('port')).concat(' port.'));
    HELPER.saveLog();
    console.log(HELPER.getmessageLog());
});
