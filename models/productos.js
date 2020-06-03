'use strict'
require('dotenv/config');
const HELPER = require('../assets/helper');
const OBJPRODUCT = require('../assets/newproducts.json');
//Methods
const PRODUCTS = {
    getAllProducts: async (callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLPRODUCTS).aggregate(
            { $project:
                {
                    _id: 1,
                    laboratorio: 1,
                    sustancia: 1,
                    descripcion: 1,
                    fecha: 1,
                    mes: 1,
                    datos: 1,
                    imagen: 1,
                    estatus: 1,
                    responsable: 1
                }   
            },
            { $sort:
                {
                    laboratorio: 1,
                    fecha: 1
                }
            }).toArray();
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    getLab: async (labID, callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLPRODUCTS).aggregate(
            [
                {$match: { laboratorio: labID}},
                {$sort: { laboratorio: 1, fecha: 1}}
            ]).toArray();
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    getStatus: async (_status, callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLPRODUCTS).aggregate(
            [
                {$match: {estatus: _status}},
                {$sort: {fecha: 1, estatus: 1}}
            ]).toArray();
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    getManager: async (_manager, callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLPRODUCTS).aggregate(
            [
                {$match: {responsable: _manager}},
                {$sort: {responsable:1, fecha: 1}}
            ]).toArray();
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    getItemID: async (_itemID, callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLPRODUCTS).aggregate(
            [
                {$match: {itemID: _itemID}},
                {$sort: {itemID:1, fecha: 1}}
            ]).toArray();
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    newProduct: async (_lab, _compund, _desc, _month, _price1, _price2, _price3, _stock, _image, _manager, callback) => {
        try{
            let _purchase = parseFloat(parseFloat(_price3) * parseFloat(process.env.FACTOR1));
            let _utility = parseFloat(_purchase * parseFloat(process.env.FACTOR2));
            let _sale = parseFloat(_purchase + _utility);
            OBJPRODUCT._id = HELPER.generateId();
            OBJPRODUCT.itemID = _lab.concat(_compund).concat(_desc).toUpperCase();
            OBJPRODUCT.laboratorio = _lab;
            OBJPRODUCT.sustancia = _compund;
            OBJPRODUCT.descripcion = _desc;
            OBJPRODUCT.fecha = new Date();
            OBJPRODUCT.mes = _month;
            OBJPRODUCT.datos.precio_farmacia = parseFloat(_price1);
            OBJPRODUCT.datos.precio_publico = parseFloat(_price2);
            OBJPRODUCT.datos.precio_cliente = parseFloat(_price3);
            OBJPRODUCT.datos.precio_neto_compra = _purchase;
            OBJPRODUCT.datos.utilidad = _utility;
            OBJPRODUCT.datos.precio_venta = _sale;
            OBJPRODUCT.datos.existencias = _stock;
            OBJPRODUCT.imagen = _image;
            OBJPRODUCT.responsable = _manager;

            let result = await HELPER.useDB().collection(process.env.COLLPRODUCTS).insertOne(OBJPRODUCT);
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    },
    updateProduct: async (_id, _lab, _compund, _desc, _month, _price1, _price2, _price3, _status, callback) => {
        try{
            let result = await HELPER.useDB().collection(process.env.COLLPRODUCTS).updateOne(
            {
                _id: HELPER.getID(_id)
            },
            {
                $set: {
                    itemID: _lab.concat(_compund).concat(_desc),
                    laboratorio: _lab,
                    sustancia: _compund,
                    descripcion: _desc,
                    mes: _month,
                    "datos.precio_farmacia": parseFloat(_price1),
                    "datos.precio_publico": parseFloat(_price2),
                    "datos.precio_cliente": parseFloat(_price3),
                    estatus: _status
                }
            });
            return callback(null, result);
        }catch(error){
            return callback(error, null);
        }
    }
};

module.exports = PRODUCTS;
