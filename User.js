'use strict';
const mongoose = require('./db');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userid: String,//用户账号
    userpic: String,//用户头像名+后缀
    username: String,//用户昵称、用户名
    password: String,//登录密码
    sex: String,//性别
    chatuser: String,//退出时最后的聊天好友
    // logindate: Date//最近登录时间，暂时不需要
});

module.exports = mongoose.model('users',userSchema);