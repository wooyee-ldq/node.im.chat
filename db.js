'use strict';
const mongoose = require('mongoose');
const db_url = "mongodb://localhost:27017/IM";
//连接：
mongoose.connect(db_url,{ config: {autoIndex: false }, useNewUrlParser: true });

// 获取连接对象：
const conn = mongoose.connection;

//如果连接成功：
conn.on('connected', function(){
    console.log('success to connect');
});

// 连接失败：
conn.on('error', function(error){
    console.log("error:" + error);
});

// 断开连接：
conn.on('disconnected', function(){
    console.log('mongoose disconnected');
});

module.exports = mongoose;