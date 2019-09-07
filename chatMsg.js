'use strict';
const mongoose = require('./db');
const Schema = mongoose.Schema;

const chatMegSchema = new Schema({
    talker: String,
    msg: String,
    date: Number
});

function getChatMsg(collName){
    return mongoose.model(collName, chatMegSchema);
}

module.exports.getChatMsg = getChatMsg;