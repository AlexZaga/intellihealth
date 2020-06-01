'use strict'
require('dotenv/config');
const HELPER = require('../assets/helper');
const OBJUSER = require('../assets/newuser.json');
//Methods
const USUARIOS = {
    getAllUsers: async (callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLNAME).aggregate(
            [{
                $project: {
                    _id: 1,
                    usuarioID: 1,
                    nombre: 1,
                    apaterno: 1,
                    amaterno: 1,
                    nivel: 1,
                    estatus: 1,
                    sesion: 1,
                    fechaini: 1,
                    fechafin: 1
                }                
            }]).toArray();
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    getUserId: async (_ID, callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLNAME).findOne({_id: HELPER.getID(_ID)});
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    getUserName: async (_name, callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLNAME).aggregate(
            [
                {$match: { nombre: _name}},
                {$sort: { nombre: 1 }}
            ]).toArray();
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    getNameID: async (_nameId, callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLNAME).findOne({usuarioID: _nameId});
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    getUserStatus: async (_status, callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLNAME).aggregate(
            [
                {$match: { estatus: _status}},
                {$sort: { estatus: 1, usuarioID: 1, nombre: 1 }}
            ]).toArray();
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    newUser: async (_usrID, _name, _midlle, _last, _pwd, _level, callback) => {
        OBJUSER.usuarioID = _usrID;
        OBJUSER.nombre = _name;
        OBJUSER.apaterno = _midlle;
        OBJUSER.amaterno = _last;
        OBJUSER.clave = _pwd;
        OBJUSER.nivel = _level;
        OBJUSER.fechaini = new Date();
        OBJUSER.fechafin = new Date('9999-01-01 00:00:00');
        try{
            let result = await HELPER.useDB().collection(process.env.COLLNAME).insertOne(OBJUSER);
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    }
};

module.exports = USUARIOS;
