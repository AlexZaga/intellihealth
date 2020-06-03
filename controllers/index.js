'use strict'
require('dotenv/config');
const HELPER = require('../assets/helper');
const USUARIOS = require('../models/usuarios');
const PRODUCTOS = require('../models/productos');
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
//User Scope
var isUserScope = (req, res, next) => {
    const { _id } = req.body;
    //Check user session
    USUARIOS.getUserId(_id, (err, _result) => {
        if(err || _result === null){
            printGlobalErrorMessage(res, UTILS.get401err(), 'User not in session', 401);
        }else if(_result){
            return next();
        }else{
            printGlobalErrorMessage(res, UTILS.get403err(), 'Access not Allowed', 403);
        }
    });
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
    app.put(HELPER.EndPoint().concat('/users/edit'), auth, (req, res) => {
        let _pwd = "";
        const { Id, name, middle, last, pwd, level, status, session } = req.body;
        if(HELPER.isValItem(Id) || HELPER.isValItem(name) || HELPER.isValItem(middle) || HELPER.isValItem(last) || HELPER.isValItem(pwd) || HELPER.isValItem(level) || HELPER.isValItem(status) || HELPER.isValItem(session) || isNaN(level) || isNaN(status) || isNaN(session)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            let _pswd = pwd.split('|');
            if(_pswd.length > 1){
                _pwd = HELPER.cipherPwd(_pswd[0]) || "";
            }
            USUARIOS.updateUser(Id, name, middle, last, _pwd, parseInt(level), parseInt(status), parseInt(session), (err, _result) => {
                if(_result.modifiedCount === 1) {
                    HELPER.printGlobalMessage(res, HELPER.get202suc(), 'User updated successfully', 202, _result.modifiedCount);
                }else{
                    HELPER.printGlobalErrorMessage(res, HELPER.get422err(), 'User not modified', 422, null);
                }
            });
        }
    });
/***************************************** Products methods ************************************/
    app.get(HELPER.EndPoint().concat('/products/all'), auth, (req, res) => {
        PRODUCTOS.getAllProducts((err, _result) => {
            if(err){
                HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err);
            }else if(_result === null || _result.length === 0){
                HELPER.printGlobalErrorMessage(res, HELPER.get404err(), 'Products not found', 404, _result);
            }else{
                HELPER.printGlobalMessage(res, HELPER.get200suc(), 'Success', 200, _result);
            }
        });
    });
    app.post(HELPER.EndPoint().concat('/products/labs'), auth, (req, res) => {
        const { laboratory } = req.body;
        if(HELPER.isValItem(laboratory)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            PRODUCTOS.getLab(laboratory, (err, _result) => {
                if(err){
                    HELPER.printGlobalErrorMessage(res, HELPER,get406err(), 'Something went wong', 406, err);
                }else if(_result === null || _result.length === 0){
                    HELPER.printGlobalErrorMessage(res, HELPER.get404err(), 'Laboratory not found', 404, _result);
                }else{
                    HELPER.printGlobalMessage(res, HELPER.get200suc(), 'Success', 200, _result);
                }
            });
        }
    });
    app.post(HELPER.EndPoint().concat('/products/status'), auth, (req, res) => {
        const { status } = req. body;
        if(HELPER.isValItem(status) || isNaN(status)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            PRODUCTOS.getStatus(parseInt(status), (err, _result) => {
                if(err || _result === null || _result.length === 0){
                    HELPER.printGlobalErrorMessage(res, HELPER.get404err(), 'Product not found', 404, _result);
                }else{
                    HELPER.printGlobalMessage(res, HELPER.get200suc(), 'Success', 200, _result);
                }
            });
        }
    });
    app.post(HELPER.EndPoint().concat('/products/manager'), auth, (req, res) => {
        const { manager } = req.body;
        if(HELPER.isValItem(manager)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            PRODUCTOS.getManager(manager, (err, _result) => {
                if(err){
                    HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err);
                }else if(_result === null || _result.length === 0){
                    HELPER.printGlobalErrorMessage(res, HELPER.get404err(), 'Manager not found', 404, _result);
                }else{
                    HELPER.printGlobalMessage(res, HELPER.get200suc(), 'Success', 200, _result);
                }
            });
        }
    });
    app.post(HELPER.EndPoint().concat('/products/add'), auth, (req, res) => {
        const { lab, compund, desc, month, price1, price2, price3, stock, image, manager } = req.body;
        if(HELPER.isValItem(lab) || HELPER.isValItem(compund) || HELPER.isValItem(desc) || HELPER.isValItem(month) || isNaN(month) || HELPER.isValItem(price1) || isNaN(price1) || HELPER.isValItem(price2) || isNaN(price2) || HELPER.isValItem(price3) || isNaN(price3) || HELPER.isValItem(stock) || isNaN(stock) || HELPER.isValItem(image) || HELPER.isValItem(manager)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            //Eval if not duplicate
            let _key = lab.concat(compund).concat(desc);
            PRODUCTOS.getItemID(_key, (err, _result) => {
                if(err){
                    HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err.errmsg);
                }else if(_result.length > 0){
                    HELPER.printGlobalErrorMessage(res, HELPER.get409err(), 'Product already exists', 409, _result.length);
                }else{
                    //Add new product
                    PRODUCTOS.newProduct(lab, compund, desc, parseInt(month), price1, price2, price3, parseInt(stock), image, manager, (err, _resultt) => {
                        if(err){
                            HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err.errmsg);
                        }else if(_resultt){
                            HELPER.printGlobalMessage(res, HELPER.get201cre(), 'New Product added successfully', 201, _resultt.insertedId);
                        }else{
                            HELPER.printGlobalErrorMessage(res, HELPER.get500err(), 'Proccess not performed', 500, null);
                        }
                    });
                }
            })
        }
    });
    app.put(HELPER.EndPoint().concat('/products/edit'), auth, (req, res) => {
        const { id, lab, compund, desc, month, price1, price2, price3, status } = req.body;
        if(HELPER.isValItem(lab) || HELPER.isValItem(compund) || HELPER.isValItem(desc) || HELPER.isValItem(month) || isNaN(month) || HELPER.isValItem(price1) || isNaN(price1) || HELPER.isValItem(price2) || isNaN(price2) || HELPER.isValItem(price3) || isNaN(price3) || HELPER.isValItem(status) || isNaN(status) || HELPER.isValItem(id)){
            HELPER.printGlobalErrorMessage(res, HELPER.get400err(), 'Missing Parameters', 400, '');
        }else{
            PRODUCTOS.updateProduct(id, lab, compund, desc, parseInt(month), price1, price2, price3, parseInt(status), (err, _result) => {
                if(err){
                    HELPER.printGlobalErrorMessage(res, HELPER.get406err(), 'Something went wrong', 406, err);   
                }else if(_result.modifiedCount === 1){
                    HELPER.printGlobalMessage(res, HELPER.get202suc(), 'User updated successfully', 202, _result.modifiedCount);
                }else{
                    HELPER.printGlobalErrorMessage(res, HELPER.get422err(), 'User not modified', 422, null);
                }
            });
        }
    });
}
