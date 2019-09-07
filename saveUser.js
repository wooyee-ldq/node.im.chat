'use strict';//启用严格模式
const User = require('./User');//导入操作模块
const crypto = require('crypto');//导入操作模块
const md5 = crypto.createHash('md5');//使用MD5加密登录密码，除了密码，用户其他的基本信息只是使用base64编码

//用户信息数据赋值：
// const id = Buffer.from("13509270762").toString('base64');//用户的登录账号
// const pic = Buffer.from("tx1.jpeg").toString('base64');//用户头像地址名称名称
// const name = Buffer.from("wooyee").toString('base64');//用户昵称
// const sex = Buffer.from("男♂").toString('base64');//用户性别
// const chat = '';//用户退出时最后聊天的好友，开始为空，这里填的是用户数据文档的_id
// const ps = md5.update("wooyee").digest('hex');//用户密码，使用md5加密

//用户信息数据赋值
// const id = Buffer.from("15306212701").toString('base64');//用户的登录账号
// const pic = Buffer.from("tx4.jpeg").toString('base64');//用户头像地址名称名称
// const name = Buffer.from("landucheg").toString('base64');//用户昵称
// const sex = Buffer.from("男♂").toString('base64');//用户性别
// const chat = '';//用户退出时最后聊天的好友，开始为空，这里填的是用户数据文档的_id
// const ps = md5.update("landucheg").digest('hex');//用户密码，使用md5加密

//用户信息数据赋值
// const id = Buffer.from("13794340183").toString('base64');//用户的登录账号
// const pic = Buffer.from("tx2.jpeg").toString('base64');//用户头像地址名称名称
// const name = Buffer.from("tineluna").toString('base64');//用户昵称
// const sex = Buffer.from("女♀").toString('base64');//用户性别
// const chat = '';//用户退出时最后聊天的好友，开始为空，这里填的是用户数据文档的_id
// const ps = crypto.createHash('md5').update("tineluna").digest('hex');//用户密码，使用md5加密

//用户信息数据赋值
// const id = Buffer.from("13703207624").toString('base64');//用户的登录账号
// const pic = Buffer.from("tx3.jpeg").toString('base64');//用户头像地址名称名称
// const name = Buffer.from("tinna").toString('base64');//用户昵称
// const sex = Buffer.from("女♀").toString('base64');//用户性别
// const chat = '';//用户退出时最后聊天的好友，开始为空，这里填的是用户数据文档的_id
// const ps = crypto.createHash('md5').update("tinna").digest('hex');//用户密码，使用md5加密

// //用户信息数据赋值
// const id = Buffer.from("16329738508").toString('base64');//用户的登录账号
// const pic = Buffer.from("tx5.jpeg").toString('base64');//用户头像地址名称名称
// const name = Buffer.from("saliden").toString('base64');//用户昵称
// const sex = Buffer.from("男♂").toString('base64');//用户性别
// const chat = '';//用户退出时最后聊天的好友，开始为空，这里填的是用户数据文档的_id
// const ps = md5.update("saliden").digest('hex');//用户密码，使用md5加密

// //组装用户对象model：
// const userdata = {
//     userid: id,
//     userpic: pic,
//     username: name,
//     password: ps,
//     sex: sex,
//     chatuser: chat
// };

// let user = new User(userdata); 
// user.save(function(err, res){
//  if(err){
//    console.log(err);
//  }
// });//保存用户，把用户添加到数据库