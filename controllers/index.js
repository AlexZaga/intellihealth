'use strict'
require('dotenv/config');
const HELPER = require('../assets/helper');
const cors = require('cors');

//Implements authentication
var auth = (req, res, next) => {
    let _auth = req.headers;
    if (!_auth.authorization || _auth.authorization.indexOf('Basic ') === -1) {
        HELPER.printGlobalErrorMessage(res, UTILS.get403err(), 'Authorization not allowed!', 403, '');
    }else{
        //Verify auth credentials
        const credentialsBase64 =  _auth.authorization.split(' ')[1];
        if(credentialsBase64 === process.env.APICREDENTIALS){
            return next();
        }else{
            HELPER.printGlobalErrorMessage(res, UTILS.get401err(), 'Invalid Authentication', 401, '');
        }
    }
};
var validate = (_obj) => {
    if(parseInt(_obj.status) === 0 || parseInt(_obj.session) === 1) return false;
    if(parseInt(_obj.status) === 1 && parseInt(_obj.session) === 0) return true;
};
//API point entry
module.exports = (app) => {
    app.get('/', cors(), (req, res) =>{
        HELPER.printGlobalMessage(res, HELPER.get200suc(), 'System ready for the action', 200, '');
    });
}
