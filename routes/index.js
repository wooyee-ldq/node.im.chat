'use strict';
const express = require('express');
const crypto = require('crypto');
// const userDbHandle = require('.././userDbHandle');
const router = express.Router();
const User = require('.././User');
const userList = require('.././userList');

//路由到登录页面：
router.get('/', function (req, res) {
  res.render('login', { error: '' });
});

router.post('/quit', function(req, res){
  let chatid = req.body.chatid;
  let userid = req.body.userid;
  User.findByIdAndUpdate(userid, {chatuser: chatid}, function(err, res){
    if(err){
      console.log(err);
    }
  });
  res.end();
});

//base64编码函数：
function base64Code(str) {
  return Buffer.from(String(str)).toString('base64');
}

//base64解码函数：
function base64Decode(str) {
  return Buffer.from(String(str), 'base64').toString();
}

//搜索列表的base64数组[对象, ...]解码函数：
function decodeList (list){
  let listArr = [];
  let len = list.length;
  if(len){
    for(let i = 0; i < len; i++){
      list[i].userpic = base64Decode(list[i].userpic);
      list[i].username = base64Decode(list[i].username);
      list[i].sex = base64Decode(list[i].sex);
      listArr.push(list[i]);
    }
  }else{
    list.userpic = base64Decode(list.userpic);
    list.username = base64Decode(list.username);
    list.sex = base64Decode(list.sex);
    listArr.push(list);
  }
  return listArr;
}

//好友列表的base64数组[对象, ...]解码函数：
function decodeFdList(list){
  let listArr = [];
  for(let i = 0; i < list.length; i++){
    list[i].chatpic = base64Decode(list[i].chatpic);
    list[i].chatname = base64Decode(list[i].chatname);
    list[i].chatsex = base64Decode(list[i].chatsex);
    listArr.push(list[i]);
  }
  return listArr;
}


//用户验证的中间件：
router.post('/index', function (req, res, next) {
  const userid = req.body.userName;
  const password = req.body.password;
  if (userid != '' && password != '' && userid != null && password != null) {
    let md5 = crypto.createHash('md5');
    let id = base64Code(userid);
    let ps = md5.update(password).digest('hex');
    md5 = null;
    let userDate = {
      userid: id,
      password: ps
    };
    User.findOne(userDate, function (err, user) {
      if (err) {
        res.render('login', { error: '系统错误，请稍后再尝试登录！' });
        res.end();
      } else {
        if (user) {
          var chatuserid = user.chatuser;
          if (chatuserid == '' || chatuserid == null) {
            let data = {
              title: '聊天室(IM)',
              pic: base64Decode(user.userpic),
              name: base64Decode(user.username),
              sex: base64Decode(user.sex),
              id: user._id,
              chatpic: '',
              chatname: '',
              chatsex: '',
              chatid: '',
            };
            res.render('index', data);
            res.end();
            return;
          }
          User.findById(chatuserid, function (err, chatuser) {
            if (err) {
              res.render('login', { error: '系统错误，请稍后再尝试登录！' });
              res.end();
            } else {
              if (chatuser) {
                let data = {
                  title: '聊天室(IM)',
                  pic: base64Decode(user.userpic),
                  name: base64Decode(user.username),
                  sex: base64Decode(user.sex),
                  id: user._id,
                  chatpic: base64Decode(chatuser.userpic),
                  chatname: base64Decode(chatuser.username),
                  chatsex: base64Decode(chatuser.sex),
                  chatid: chatuser._id,
                };
                res.render('index', data);
                res.end();
              } else {
                res.render('login', { error: '系统错误，请稍后再尝试登录' });
                res.end();
              }
            }
          });
        } else {
          res.render('login', { error: '用户名或密码错误！' });
          res.end();
        }
      }
    });
  } else {
    res.render('login', { error: '用户名或密码不能为空！' });
    res.end();
  }
});


//ajax获取好友列表：
router.post('/getUserList', function (req, res, next) {
  let collName = req.body.collName;
  let collNameHd = userList.getCollection(collName);
  collNameHd.find({}, function (err, list) {
    if (err) {
      res.json(null);
      res.end();
    } else {
      if (list.length) {
        list = decodeFdList(list);
        res.json(list);
        res.end();
      } else {
        res.json(null);
        res.end();
      }
    }
  });
});


//ajax搜索请求处理:
//用户模糊查询函数：
function usersFind(res, userDate) {
  let condition = { $or: [{ userid: { $regex: userDate } }, { username: { $regex: userDate } }] };
  User.find(condition, function (err, list) {
    if (err) {
      console.log(err);
      res.json(null);
      res.end();
    } else {
      if (list.length) {
        // console.log(list);
        list = decodeList(list);
        res.json(list);
        res.end();
      } else {
        res.json(null);
        res.end();
      }
    }
  });
}

router.post('/searchHandle', function (req, res, next) {
  let id = req.body.text;
  var userDate = Buffer.from(id).toString('base64');
  //通过用户ID查询好友：
  User.findById(id, function (err, user) {
    if (err) {
      usersFind(res, userDate);
    } else {
      if (user) {
        // console.log(user);
        user = decodeList(user);
        res.json(user);
        res.end();
      } else {
        usersFind(res, userDate);
      }
    }
  });
});

module.exports = router;
