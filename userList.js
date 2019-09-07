'use strict';
const mongoose = require('./db');
const Schema = mongoose.Schema;

const userListSchema = new Schema({
    chatid: String,
    chatpic: String,
    chatname: String,
    chatsex: String,
    date: Number
});

function getCollection(collName){
    return mongoose.model(collName, userListSchema);
}

module.exports.getCollection = getCollection;