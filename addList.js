'use strict';
const mongoose = require('./db');
const Schema = mongoose.Schema;

const addListSchema = new Schema({
    id: String,
    pic: String,
    name: String,
    sex: String,
    addid: String,
    date: Number
});

function getAddList(collName){
    return mongoose.model(collName, addListSchema);
}

module.exports.getAddList = getAddList;