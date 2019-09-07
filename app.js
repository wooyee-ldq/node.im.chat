//引入模块：
// const server = require('./server_io').server;
// const app = require('./server_io').app;
// const socket = require('./socket');
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const uuid = require('uuid');

//引入路由模块：
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

//创建express()对象：
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const sendMsg = io.of('/sendMsg');
const adduser = io.of('/adduser');
const select = io.of('/select');
const chatMsg = require('./chatMsg');
const addList = require('./addList');
const userList = require('./userList');
const User = require('./User');

adduser.on('connection', function (socket) {
  socket.on('add', function (data) {
    let addlist = addList.getAddList(data.addid + 'addlist');
    let applydata = {
      id: data.id,
      pic: data.pic,
      name: data.name,
      sex: data.sex,
      addid: data.addid,
      date: new Date().getTime()
    };
    let apply = new addlist(applydata);
    apply.save(function (err, res) {
      if (err) {
        adduser.emit(data.id + "error", { err: '发送失败：系统错误.' });
      } else {
        adduser.emit(data.addid + 'add', data);
      }
    });
  });

  socket.on('agree', function (data) {
    let addlist = addList.getAddList(data.userid + 'addlist');
    //保存接受人的好友信息：
    //base64编码函数：
    function base64Code(str) {
      return Buffer.from(String(str)).toString('base64');
    }
    //base64解码函数：
    function base64Decode(str) {
      return Buffer.from(String(str), 'base64').toString();
    }
    //用户信息解码函数：
    function decodeList(list) {
      list.userpic = base64Decode(list.userpic);
      list.username = base64Decode(list.username);
      list.sex = base64Decode(list.sex);
      return list;
    }
    //查找申请人的信息，并保存到同意人的好友列表：
    addlist.findOne({ id: data.applyid }, function (err, res) {
      if (err) {
        adduser.emit(data.userid + "error", { err: '操作失败：系统错误.' });
        return;
        // console.log(1);
      } else {
        if (res) {
          let userlist = userList.getCollection(data.userid);
          let userdata = {
            chatid: res.id,
            chatpic: base64Code(res.pic),
            chatname: base64Code(res.name),
            chatsex: base64Code(res.sex),
            date: new Date().getTime()
          };
          let user = new userlist(userdata);
          user.save(function (err, res) {
            if (err) {
              adduser.emit(data.userid + "error", { err: '操作失败：系统错误.' });
              return;
              // console.log(2);
            }
          });
        } else {
          adduser.emit(data.userid + "error", { err: '操作失败：系统错误.' });
          return;
        }
      }
    });
    //保存申请人的好友信息：
    User.findById(data.userid, function (err, res) {
      if (err) {
        adduser.emit(data.userid + "error", { err: '操作失败：系统错误.' });
        return;
      } else {
        if (res) {
          let applyuserlist = userList.getCollection(data.applyid);
          let applyuserdata = {
            chatid: res._id,
            chatpic: res.userpic,
            chatname: res.username,
            chatsex: res.sex,
            date: new Date().getTime()
          }
          let applyuser = new applyuserlist(applyuserdata);
          applyuser.save(function (err, res1) {
            if (err) {
              adduser.emit(data.userid + "error", { err: '操作失败：系统错误.' });
              return;
            } else {
              let fd = decodeList(res);
              adduser.emit(data.applyid + 'hasagree', fd);
            }
          });
        } else {
          adduser.emit(data.userid + "error", { err: '操作失败：系统错误.' });
          return;
        }
      }
    });
    //删除申请信息：
    addlist.remove({ id: data.applyid }, function (err, res) {
      if (err) {
        adduser.emit(data.userid + "error", { err: '操作失败：系统错误.' });
      } else {
        //这个功能是发送好友申请结果，现在暂时不开放该功能：
        console.log(res);
        return;
      }
    });
  });

  socket.on('refuse', function (data) {
    let addlist = addList.getAddList(data.userid + 'addlist');
    //删除申请信息：
    addlist.remove({ id: data.applyid }, function (err, res) {
      if (err) {
        adduser.emit(data.userid + "error", { err: '操作失败：系统错误.' });
      } else {
        let applyid = data.applyid;
        adduser.emit(applyid + 'error', { err: 'ID:' + data.userid + '的用户拒绝了您的好友申请.' });
      }
    });
  });

  socket.on('getaddlist', function (data) {
    let addlist = addList.getAddList(data.userid + 'addlist');
    addlist.find({}, function (err, res) {
      if (err) {
        adduser.emit(data.userid + "error", { err: '系统错误：数据获取失败.' });
      } else {
        if (res.length) {
          adduser.emit(data.userid + 'add', res);
          // console.log(res);
        }
      }
    });
  });
});


select.on('connection', function (socket) {
  socket.on('getchat', function (data) {
    let userid = data.userid;
    let id = data.id;
    if (id == '' || id == null) {
      return;
    }
    let collName = userid + id;
    let skipnum = data.skipnum;
    let record = chatMsg.getChatMsg(collName);
    let sort = { 'date': -1 };
    record.find({}).sort(sort).skip(skipnum).limit(6).exec(function (err, res) {
      if (err) {
        select.emit(userid + "error", { err: "系统错误：数据获取失败." });
      } else {
        select.emit(userid, { id: id, record: res });
      }
    });
  });
});

sendMsg.on('connection', function (socket) {
  socket.on('send', function (data) {
    let date = data.date;
    let sender = data.sender;
    // let pic = data.pic;
    let id = data.id;
    let msg = data.msg;
    let newMsg = chatMsg.getChatMsg(id + "newmsg");
    let chatData = chatMsg.getChatMsg(sender + id);
    let msgdata = {
      talker: sender,
      msg: msg,
      date: date
    };
    let chatdata = new chatData(msgdata);
    let newmsg = new newMsg(msgdata);
    chatdata.save(function (err, res) {
      if (err) {
        sendMsg.emit(sender + "error", { err: "系统错误：发送失败." });
      }
    });
    newmsg.save(function (err, res) {
      if (err) {
        sendMsg.emit(sender + "error", { err: "系统错误：发送失败." });
      } else {
        sendMsg.emit(id, { sender: sender, msg: msg, date: date });
      }
    });
  });

  socket.on("hasread", function (data) {
    let id = data.id;
    let msgdata = data.msgdata;
    let len = msgdata.length;
    let newMsg = chatMsg.getChatMsg(id + "newmsg");
    if (len) {
      newMsg.remove({ talker: msgdata[0].sender }, function (err, res) {
        if (err) {
          sendMsg.emit(id + "error", { err: "系统错误：请稍后重试." });
        }
      });
      let chatmsg = chatMsg.getChatMsg(id + msgdata[0].sender);
      for (let i = 0; i < len; i++) {
        let Msg = {
          talker: msgdata[i].sender,
          msg: msgdata[i].msg,
          date: msgdata[i].date
        };
        let msg = new chatmsg(Msg);
        msg.save(function (err, res) {
          if (err) {
            sendMsg.emit(id + "error", { err: "系统错误." });
          }
        });
      }

    } else {
      let Msg = {
        talker: msgdata.sender,
        msg: msgdata.msg,
        date: msgdata.date
      };

      newMsg.remove(Msg, function (err, res) {
        if (err) {
          sendMsg.emit(id + "error", { err: "系统错误：请稍后重试." });
        }
      });
      let chatmsg = chatMsg.getChatMsg(id + msgdata.sender);
      let msg = new chatmsg(Msg);
      msg.save(function (err, res) {
        if (err) {
          sendMsg.emit(id + "error", { err: "系统错误." });
        }
      });
    }
  });

  socket.on('getallchat', function (data) {
    let userid = data.userid;
    let collName = userid + "newmsgs";
    let chatmsg = chatMsg.getChatMsg(collName);
    chatmsg.find({}, function (err, msglist) {
      if (err) {
        sendMsg.emit(userid + "error", { err: "系统错误:请重新登录或稍后在尝试登录." });
      } else {
        let len = msglist.length;
        if (len) {
          for (let i = 0; i < len; i++) {
            sendMsg.emit(userid, { sender: msglist[i].talker, msg: msglist[i].msg, date: msglist[i].date });
          }
        }
      }
    });
  });
});


// view engine setup设置视图默认路径和模板：
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

//使用中间件：
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: uuid.v1(),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(socket.socketStart());

//使用路由：（添加路由）
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// module.exports = app;
//添加监听，创建服务：
// app.listen(3000, function () {
//   console.log('The app run at:\thttp://localhost:3000');
// });
server.listen(3000, function () {
  // socket.socketRun();
  console.log('The app run at:\thttp://localhost:3000');
});

