'use strict'
require('dotenv/config');
const HELPER = require('../assets/helper');
const USUARIOS = require('../models/usuarios');
const cors = require('cors');

//Implements authentication
var auth = (req, res, next) => {
    let _auth = req.headers;
    if (!_auth.authorization || _auth.authorization.indexOf('Basic ') === -1) {
        HELPER.printGlobalErrorMessage(res, HELPER.get403err(), 'Authorization not allowed!', 403, '');
    }else{
        //Verify auth credentials
        const credentialsBase64 =  _auth.authorization.split(' ')[1];
        if(credentialsBase64 === process.env.APICREDENTIALS){
            return next();
        }else{
            HELPER.printGlobalErrorMessage(res, HELPER.get401err(), 'Invalid Authentication', 401, '');
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
/***************************************** Users methods ************************************/
    app.get(HELPER.EndPoint().concat('/users/all'), auth, (req, res) => {
        USUARIOS.getAllUsers((err, _result) => {
            if(err){
                HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err);
            }else if(_result === null || _result.length === 0){
                HELPER.printGlobalErrorMessage(res, HELPER.get404err(), 'Users not found', 404, _result);
            }else{
                HELPER.printGlobalMessage(res, HELPER.get200suc(), 'Success', 200, _result);
            }
        });
    });
    app.post(HELPER.EndPoint().concat('/users/id'), auth, (req, res) => {
        const { ID } = req.body;
        if(HELPER.isValItem(ID)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            USUARIOS.getUserId(ID, (err, _result) => {
                if(err){
                    HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err);
                }else if(_result === null){
                    HELPER.printGlobalErrorMessage(res, HELPER.get404err(), 'User not found', 404, _result);
                }else{
                    HELPER.printGlobalMessage(res, HELPER.get200suc(), 'Success', 200, _result);
                }
            });
        }
    });
    app.post(HELPER.EndPoint().concat('/users/name'), auth, (req, res) => {
        const { name } = req.body;
        if(HELPER.isValItem(name)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            USUARIOS.getUserName(name, (err, _result) => {
                if(err){
                    HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err);
                }else if(_result === null || _result.length === 0){
                    HELPER.printGlobalErrorMessage(res, HELPER.get404err(), 'User not found', 404, _result);
                }else{
                    HELPER.printGlobalMessage(res, HELPER.get200suc(), 'Success', 200, _result);
                }
            });
        }
    });
    app.post(HELPER.EndPoint().concat('/users/status'), auth, (req, res) => {
        const { status } = req.body;
        if(HELPER.isValItem(status) || isNaN(status)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            USUARIOS.getUserStatus(parseInt(status), (err, _result) => {
                if(err){
                    HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err);
                }else if(_result === null || _result.length === 0){
                    HELPER.printGlobalErrorMessage(res, HELPER.get404err(), 'Users not found', 404, _result);
                }else{
                    HELPER.printGlobalMessage(res, HELPER.get200suc(), 'Success', 200, _result);
                }
            });
        }
    });
    app.post(HELPER.EndPoint().concat('/users/add'), auth, (req, res) => {
        const { usrID, name, middle, last, pwd, level } = req.body;
        if(HELPER.isValItem(usrID) || HELPER.isValItem(name) || HELPER.isValItem(middle) || HELPER.isValItem(last) || HELPER.isValItem(pwd) || HELPER.isValItem(level) || !HELPER.isValidEmail(usrID) || isNaN(level)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            let _pwd = HELPER.cipherPwd(pwd);
            //Exists same user?
            USUARIOS.getNameID(usrID, (err, _result) => {
                if(err){
                    HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err);
                }else if(_result !== null){
                    HELPER.printGlobalErrorMessage(res, HELPER.get409err(), 'User ['.concat(usrID).concat('] exists'), 409, null);
                }else{
                    USUARIOS.newUser(usrID, name, middle, last, _pwd, parseInt(level), (err, _resultt) => {
                        if(err){
                            HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err);
                        }else if(_resultt){
                            HELPER.printGlobalMessage(res, HELPER.get201cre(), 'New user ['.concat(usrID).concat('] added successfully'), 201, '');
                        }else{
                            HELPER.printGlobalErrorMessage(res, HELPER.get500err(), 'Proccess not performed', 500, null);
                        }
                    });
                }
            }); 
        }
    });
}
