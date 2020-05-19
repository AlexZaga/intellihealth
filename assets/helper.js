'use strict'
require('dotenv/config');
//Declaration header
const fs = require('fs');
const _log = './logs/APIlogs.log';
const MongoClient = require('mongodb').MongoClient;
const crypto = require('crypto');
const QRCode = require('qrcode');
//Info API Results
const _200suc = '200 Success';
const _201cre = '201 Created';
const _202suc = '202 Accepted'
const _204err = '204 No Content';
const _304err = '304 Not Modified';
const _400err = '400 Bad Request';
const _401err = '401 Unauthorized';
const _403err = '403 Forbidden';
const _404err = '404 Not Found';
const _406err = '406 Not Acceptable';
const _409err = '409 Conflict';
const _422err = '422 Unprocessable Entity';
const _428pre = '428 Precondition Required';
const _500err = '500 Internal Server Error';
const _501err = '501 Not Implemented';
//Init Object State
const state = {
    db: null
};
//Init Message
var _message = 'Default message';
var ObjectId = require('mongodb').ObjectID;
var uid = require('uid-safe');

//Functions
var timeLog = () => {
    var date = new Date();
    //Get values 
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day  = date.getDate();
    var hours = date.getHours();
    var min = date.getMinutes();
    var secs = date.getSeconds();
    //Format values
    month = (month < 10 ? "0" : "").concat(month);
    day = (day < 10 ? "0" : "").concat(day);
    hours = (hours < 10 ? "0" : "").concat(hours);
    min = (min < 10 ? "0" : "").concat(min);
    secs = (secs < 10 ? "0" : "").concat(secs);
    return day.concat(month).concat(year).concat(' ').concat(hours).concat(':').concat(min).concat(':').concat(secs);
};
var saveLog = (_log) => {
    HELPER.setmessageLog(_log);
    HELPER.saveLog();
    console.log(HELPER.getmessageLog());
};
var encode64 = (_object) => {
    let _buff = new Buffer.from(_object);
    return _buff.toString('base64');
};
var decode64 = (_object) => {
    let _buff = new Buffer.from(_object, 'base64');
    return _buff.toString('ascii');
};
var qrgenerate = async (_qrpath, _urlqry) => {
    try{
        await QRCode.toFile(_qrpath, _urlqry);
        saveLog(HELPER.infoLog().concat('QRCode generated => ').concat(_qrpath)); 
        return true;
    }catch(error){
        saveLog(HELPER.errorLog().concat('Something went wrong QR => ').concat(error));
        return false;
    }
};
var validemail = (objemail) => {
    var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
    var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
    var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
    var sQuotedPair = '\\x5c[\\x00-\\x7f]';
    var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
    var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
    var sDomain_ref = sAtom;
    var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
    var sWord = '(' + sAtom + '|' + sQuotedString + ')';
    var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
    var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
    var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
    var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
    
    var reValidEmail = new RegExp(sValidEmail);
    return reValidEmail.test(objemail);
};
var validitem = (_object) => {
    if(_object === "" || _object === undefined || _object === null){
        return true
    }else{
        return false;
    }
};

//Method
const HELPER = {
    InitDB: () => {
        //Init DB Connection
        MongoClient.connect(process.env.DBHOST, { useNewUrlParser: true,  useUnifiedTopology: true }, (err, database) => {
            if(err){
                HELPER.setmessageLog(HELPER.errorLog() + err);
                HELPER.saveLog();
                console.error(HELPER.errorLog() + 'Something went wrong => '+ err);
            }else{
                state.db = database.db(process.env.DBNAME);
                HELPER.setmessageLog(HELPER.infoLog() + 'Database [ ' + process.env.DBNAME + ' ] connected!');
                HELPER.saveLog();
                console.log(HELPER.infoLog() + 'Database [ ' + process.env.DBNAME + ' ] connected!');
            }
        })
    },
    printGlobalErrorMessage: (_res, _errmsg, _customsg, _errId, _data) => {
        saveLog(HELPER.errorLog().concat(_customsg).concat(' => ').concat(_errmsg));
        _res.status(_errId).json(UTILS.formatMessage(_errId, _customsg, _data));    
    },
    printGlobalMessage: (_res, _infomsg, _customsg, _infoId, _data) => {
        saveLog(HELPER.infoLog().concat(_customsg).concat(' => ').concat(_infomsg));
        _res.status(_infoId).json(HELPER.formatMessage(_infoId, _customsg, _data));
    },
    encodeItem: (_object) => {
        return encode64(_object);
    },
    decodeItem: (_object) => {
        return decode64(_object);
    },
    codeQR: (_qrpath, _urlqry) => {
        return qrgenerate(_qrpath, _urlqry);
    },
    dtisEndPoint: () => {
        return process.env.APIDTISENDPOINT;
    },
    isValidEmail: (email) => {
        return validemail(email);
    },
    isValItem: (_objec) => {
        return validitem(_objec);
    },
    getDateTimeLog: () => {
        return timeLog();
    },
    get200suc: () => {
        return _200suc;
    },
    get201cre: () => {
        return _201cre;
    },
    get202suc: () => {
        return _202suc;
    },
    get204err: () => {
        return _204err;
    },
    get304err: () => {
        return _304err;
    },
    get400err: () => {
        return _400err;
    },
    get401err: () => {
        return _401err;
    },
    get403err: () => {
        return _403err;
    },
    get404err: () => {
        return _404err;
    },
    get406err: () => {
        return _406err;
    },
    get409err: () => {
        return _409err;
    },
    get422err: () => {
        return _422err;
    },
    get428pre: () => {
        return _428pre;
    },
    get500err: () => {
        return _500err;
    },
    get501err: () => {
        return _501err;
    },
    getUID: () => {
        return uid;
    },
    formatMessage: (_infoId, _customsg, _data) => {
        let _result = {
            status: _infoId,
            message: _customsg,
            data: _data
        };
        return _result;
    },
    formatOrder : (_objeto) => {
        let tmp = JSON.parse(_objeto);
        return tmp;
    },
    //Data log
    saveLog: () => {
        return HELPER.getDateTimeLog().concat(' [Save] ');
    },
    updateLog: () => {
        return HELPER.getDateTimeLog().concat(' [Update] ');
    },
    infoLog: () => {
        return HELPER.getDateTimeLog().concat(' [Info] ');
    },
    errorLog: () => {
        return HELPER.getDateTimeLog().concat(' [Error] ');
    },
    //GET & SETTERS
    setmessageLog: (msg) => {
        _message = msg;
    },
    getmessageLog: () => {
        return _message;
    },
    //Save system logs
    saveLog: () => {
        fs.appendFile(_log, HELPER.getmessageLog() + '\n', (err) => {
            if (err) {
                console.error(err);
            }
        });
    },
    useDB: () => {
        return state.db;
    },
    //Encrypt information
    cipherPwd: (_secret) => {
        let _hash = crypto.createHash("sha256").update(_secret).digest("hex");
        return _hash;
    },
    cipherSign: (_company) => {
        let _signA = crypto.createECDH("secp521r1").setPrivateKey(crypto.createHash("sha256").update(_company, "utf8").digest("base64"));
        let _sign = "0x" + _signA.getPrivateKey('hex', 'compressed');
        return _sign;
    },
    generateId: () => {
        return ObjectId();
    },
    getID: (_str) => {
        return ObjectId(_str);
    }
};

module.exports = HELPER;
