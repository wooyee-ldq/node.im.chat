$(document).ready(function () {
    //创建socket对象：
    const socketsend = io.connect('/sendMsg');
    const socketadd = io.connect('/adduser');
    const socketselect = io.connect('/select');
    const userID = $('.id-date').text();
    const newmsg = {};

    //获取好友列表数据并加载好友列表信息：
    $.ajax({
        url: "/getUserList",
        method: "post",
        async: true,
        dataType: "json",
        data: {
            collName: $('.id-date').text()
        },
        success: function (list) {
            if (list == null) {
                let tips = "<p class='well msg-color'>您还没添加好友...<br><br>" +
                    "点击‘好友列表’，搜用户，加好友...</p>";
                $('.fd-list').append(tips);
                $('.side').hide();
                $('#IM').hide();
                $('#user').addClass('offset4')
                    .removeClass('span3')
                    .addClass('span4');
            } else {
                for (let i = 0; i < list.length; i++) {
                    let li = "<li id='" + list[i].chatid + "'>" +
                        "<img class='list-img' src='/images/pic/" +
                        list[i].chatpic + "'>" +
                        "<div>" +
                        list[i].chatsex + "</div><div>" + list[i].chatname +
                        "</div></li>";
                    $('.fd-list ul').append(li);
                }
            }
            //登录的时候获取下线时的新消息：
            socketsend.emit('getallchat', { userid: userID });
        },
        error: function (err) {
            let tips = "<div class='well msg-color'>系统错误：无法获取好友列表...</div>";
            $('.fd-list').append(tips);
            $('.side').hide();
            $('#IM').hide();
            $('#user').addClass('offset4')
                .removeClass('span3')
                .addClass('span4');
        }
    });

    /** -------------------------socket操作： ------------------------------------------------------*/

    //加载好友列表后，再通过socket发送聊天记录数据请求：
    socketselect.emit('getchat', { userid: userID, id: $('.chatuser-id').text(), skipnum: 0 });

    //聊天记录数据接收：
    socketselect.on(userID, function (data) {
        $('.text-box').hide();
        let id = data.id;
        let chatbox = $('#' + id + 'div');
        if (!chatbox.length) {
            let box = "<div id='" + id + "div' class='text-box'></div>";
            $('.IM').prepend(box);
            chatbox = $('#' + id + 'div');
        }
        chatbox.show();
        let record = data.record;
        let len = record.length;
        if (len) {
            let chatpic = $('#side .pic').clone().html();
            let userpic = $('#user .pic').clone().html();
            for (let i = 0; i < len; i++) {
                let li = "";
                let msg = record[i].msg;
                let date = '';
                if(i < len-1){
                    if(record[i].date-record[i+1].date > 60000){
                        date = new Date(record[i].date).toLocaleString();
                    }
                }else{
                    date = new Date(record[i].date).toLocaleString();
                }
                if (record[i].talker == id) {
                    li = "<li id='" + date + "' class='date-time'>" + date + "</li>"+
                    "<li class='msg textright'>" + 
                    "<span class='rightbg'>"+msg+"</span><div class='rightmsg'></div>" +
                     chatpic + "</li>";
                } else {
                    li = "<li id='" + date + "' class='date-time'>" + date + "</li>"+
                    "<li class='msg textleft'>" + userpic +
                    "<div class='leftmsg'></div><span class='leftbg'>"+msg+"</span></li>";
                }
                chatbox.prepend(li);
            }
            chatbox.scrollTop(0);
        }
        $('.IM').prepend($('#gethistory'));
    });


    //历史记录点击事件：
    $('#gethistory').click(function () {
        let id = $('.chatuser-id').text();
        let skipnum = $('#' + id + 'div .msg').length;
        socketselect.emit('getchat', { userid: userID, id: id, skipnum: skipnum });
    });

    //接收聊天消息：
    socketsend.on(userID, function (data) {
        let sender = data.sender;
        let pic = $('#' + sender + ' img')[0].outerHTML;
        let msg = data.msg;
        let date = new Date(data.date).toLocaleString();
        if (sender == $('.chatuser-id').text()) {
            let li = "<li id='" + date + "' class='date-time'>" + date + 
            "</li><li class='msg textright'>" + "<span class='rightbg'>"+msg+"</span>"+
            "<div class='rightmsg'></div>" + pic + "</li>"
            $('#' + sender + 'div').append(li)
                .scrollTop($('#' + sender + 'div')[0].scrollHeight);
            socketsend.emit("hasread", { id: userID, msgdata: data });
        } else {
            let cahedivdata = newmsg[sender];
            if (cahedivdata == null || cahedivdata == 'undefined') {
                newmsg[sender] = [];
                newmsg[sender].push(data);
            } else {
                cahedivdata.push(data);
            }
            let cahediv = $('#' + sender + 'div');
            if (cahediv.length) {
                let li = "<li id='" + date + "' class='date-time'>" + date + 
                "</li><li class='msg textright'>" + "<span class='rightbg'>"+msg+"</span>"+
                "<div class='rightmsg'></div>" + pic + "</li>"
                cahediv.append(li)
                    .scrollTop($('#' + sender + 'div')[0].scrollHeight)
                    .hide();
            } else {
                let cahediv = "<div id='" + sender + "div' class='text-box'></div>";
                let li = "<li id='" + date + "' class='date-time'>" + date + 
                "</li><li class='msg textright'>" + "<span class='rightbg'>"+msg+"</span>"+
                "<div class='rightmsg'></div>" + pic + "</li>"
                $('.IM').prepend(cahediv)
                    .children('#' + sender + 'div')
                    .append(li)
                    .scrollTop($('#' + sender + 'div')[0].scrollHeight)
                    .hide();
            }
            let newli = $('#' + sender);
            if (!newli.find('.new').length) {
                newli.prepend("<span class='new'>.</span>");
            }
            $('.fd-list ul').prepend(newli);
            $('.IM').prepend($('#gethistory'));
        }
    })

    //接收error消息：
    socketadd.on(userID + "error", function (err) {
        alert(err.err);
    });
    socketsend.on(userID + "error", function (err) {
        alert(err.err);
    });
    socketselect.on(userID + "error", function (err) {
        alert(err.err);
    });


    //发送消息函数：
    function send() {
        let input = $('#send-text');
        let msg = input.val();
        let id = $('.chatuser-id').text();
        let pic = $('#user .pic').clone().html();
        let time = new Date().getTime();
        let date = new Date(time).toLocaleString();
        input.val("").focus();
        socketsend.emit('send', { sender: userID, id: id, msg: msg, date: time });
        let li = "<li id='" + date + "' class='date-time'>" + date + 
        "</li><li class='msg textleft'>" + pic + 
        "<div class='leftmsg'></div><span class='leftbg'>"+msg+"</span></li>";
        $('#' + id + 'div')
            .append(li)
            .scrollTop($('#' + id + 'div')[0].scrollHeight);
    }


    //添加好友按钮点击事件：
    $('.search-res').on('click', 'button', function () {
        let addid = $(this).attr('id');
        let fdlis = $('.fd-list ul li');
        let len = 0;
        let todo = true;
        if (addid == userID) {
            todo = false;
            alert("不用添加自己为好友！");
        } else {
            len = fdlis.length;
        }
        if (len) {
            for (let i = 0; i < len; i++) {
                if (fdlis[i].getAttribute('id') == addid) {
                    todo = false;
                    alert("该用户已添加为好友！");
                    break;
                }
            }
        }
        if (todo) {
            let pic = $('#user .pic img').attr('picsrc');
            let name = $('#user .user-msg div span')[0].innerText;
            let sex = $('#user .user-msg div span')[1].innerText;
            socketadd.emit('add', { id: userID, pic: pic, name: name, sex: sex, addid: addid });
        }
    });

    //好友申请接收：
    socketadd.on(userID + 'add', function (data) {
        let len = data.length;
        let applydiv = $('.apply');
        if (len) {
            for (let i = 0; i < len; i++) {
                let addli = "<li applyid='" + data[i].id + "'>" +
                    "<img src='/images/pic/" + data[i].pic + "'>" +
                    "<span>" + data[i].sex + "&nbsp;&nbsp;" + data[i].name + "</span>" +
                    "<div><button class='refuse'>拒绝</button>&nbsp;&nbsp;&nbsp;&nbsp;" +
                    "<button class='agree'>同意</button>" +
                    "</div></li>";
                applydiv.append(addli);
            }
        } else {
            let addli = "<li applyid='" + data.id + "'>" +
                "<img src='/images/pic/" + data.pic + "'>" +
                "<span>" + data.sex + "</span>" + "&nbsp;&nbsp;" + "<span>" + data.name + "</span>" +
                "<div><button class='refuse'>拒绝</button>&nbsp;&nbsp;&nbsp;&nbsp;" +
                "<button class='agree'>同意</button>" +
                "</div></li>";
            applydiv.append(addli);
        }
        applydiv.show();
    });

    //获取好友申请数据的请求：
    socketadd.emit('getaddlist', { userid: userID });

    //好友申请结果接收:
    socketadd.on(userID + 'hasagree', function (data) {
        let id = data._id;
        let pic = data.userpic;
        let sex = data.sex;
        let name = data.username;
        let li = "<li id='" + id + "'>" +
            "<img class='list-img' src='/images/pic/" +
            pic + "'>" +
            "<div>" + sex +
            "</div><div>" + name +
            "</div></li>";
        let p = $('.fd-list p');
        if (p) {
            p.remove()
        }
        $('.fd-list ul').prepend(li);
        if ($('.chatuser-id').text() == '') {
            let side = $('.side');
            $('#IM').show();
            $('#user').addClass('span3')
                .removeClass('offset4')
                .removeClass('span4');
            side.find('.pic img').attr('src', '/images/pic/' + pic);
            side.find('.user-msg div')[0].innerHTML = name + "&nbsp;&nbsp;&nbsp;&nbsp;" + sex;
            side.find('.user-msg div')[1].innerText = id;
            side.show();
        }
    });

    //同意按钮点击事件：
    $('.apply').on('click', '.agree', function () {
        let applyid = $(this).parent().parent().attr('applyid');
        let applyli = $("li[applyid=" + applyid + "]");
        applyli.hide();
        let chatpic = applyli.find('img').attr('src');
        let chatsex = applyli.find('span')[0].innerHTML;
        let chatname = applyli.find('span')[1].innerHTML;
        let li = "<li id='" + applyid + "'>" +
            "<img class='list-img' src='" +
            chatpic + "'>" +
            "<div>" +
            chatsex + "</div><div>" + chatname +
            "</div></li>";
        $('.fd-list ul').prepend(li);
        socketadd.emit('agree', { userid: userID, applyid: applyid });
    });
    //拒绝按钮点击事件：
    $('.apply').on('click', '.refuse', function () {
        let applyid = $(this).parent().parent().attr('applyid');
        $("li[applyid=" + applyid + "]").hide();
        socketadd.emit('refuse', { userid: userID, applyid: applyid });
    });

    //退出确定按钮点击事件：
    $('.sure').click(function () {
        Quit();
    });

    //退出操作函数：
    function Quit() {
        $.ajax({
            url: "/quit",
            method: "post",
            async: true,
            data: {
                userid: userID,
                chatid: $('.chatuser-id').text()
            },
            success: function () {
                window.location.replace('/');
            },
            error: function () {
                alert('系统错误：退出失败.');
            }
        });
    }


    //好友列表点击事件：
    $('.fd-list').on('click', 'li', function () {
        let li = $(this).clone();
        let side = $('#side');
        let id = li.attr('id');
        let newtips = $(this).find('.new');
        if (id == $('.chatuser-id').text()) {
            side.fadeToggle(400).fadeToggle(400);
        } else {
            //删除新消息提示：
            if (newtips.length) {
                let msglist = newmsg[id];
                // let len = msglist.length;
                // let userpic = $('#user .pic').clone().html();
                socketsend.emit("hasread", { id: userID, msgdata: msglist });
                newmsg[id] = [];
                newtips.remove();
                // $('#' + id + 'div').scrollTop($('#' + id + 'div')[0].scrollHeight);
            }

            let iskip = $("#" + id + "div li").length;
            if (!iskip) {
                socketselect.emit('getchat', { userid: userID, id: id, skipnum: 0 });
            } else {
                $('.text-box').hide();
                $('#' + id + 'div').show();
            }
            //更改聊天对象边栏的用户信息：
            let pic = li.children('img')[0];
            let sex = li.children('div')[0].innerText;
            let name = li.children('div')[1].innerText;
            side.find('.pic').html(pic);
            side.find('.user-msg div')[0].innerHTML = name + "&nbsp;&nbsp;&nbsp;&nbsp;" + sex;
            side.find('.user-msg div')[1].innerText = id;
        }
    });



    // 好友列表按钮点击事件：
    $('.fd-list-btn').click(function () {
        // $('.fd-list').fadeToggle(1000);
        // $('.fd-list').slideToggle(1000);
        $('.fd-list').toggle(1000);
        $('.search').fadeToggle(1500);
        $('.user-id').slideToggle(1000);
    });


    // 发送按钮点击事件：
    $('.send-btn button').click(function () {
        send();
    });


    //搜索用户ajax搜索提交函数：
    function ajaxSearch() {
        $('.search-res').html('');
        var input = $('.search input');
        var data = input.val();
        var tips = "<p class='well msg-color'>找不到相关用户...<br>换个关键字再搜搜看...</p>";
        if (data == '' || data == null) {
            $('.search-res').append(tips);
        } else {
            $.ajax({
                url: '/searchHandle',
                method: "post",
                async: true,
                dataType: 'json',
                data: {
                    text: data
                },
                success: function (list) {
                    if (list == null) {
                        $('.search-res').append(tips);
                    } else {
                        $('.search-res').append("<ul class='msg-color'></ul>");
                        for (let i = 0; i < list.length; i++) {
                            let li = "<li>" +
                                "<img class='list-img' src='/images/pic/" +
                                list[i].userpic + "'>" +
                                "<div>" +
                                list[i].sex + "</div><div>" + list[i].username +
                                "</div>" +
                                "<button id='" + list[i]._id + "'" +
                                "class='add btn btn-info pull-right'>加好友</button>" +
                                "<div class='clearfix'></div></li>";
                            $('.search-res ul').append(li);
                        }
                    }
                },
                error: function (msg) {
                    alert('系统错误！');
                }
            });
        }
    }

    // 搜索按钮点击事件：
    $('.search button').click(function () {
        ajaxSearch();
    });


    //搜索enter事件：
    $('input').keyup(function (e) {
        if (!e.ctrlKey && !e.shiftKey && e.keyCode == 13) {
            ajaxSearch();
        }
    });

    //发送消息enter事件：
    $('textarea').keyup(function (e) {
        if (!e.ctrlKey && !e.shiftKey && e.keyCode == 13) {
            send();
        }
    })

    // 全局的按键按下后升起的事件：
    $(document).keyup(function (e) {
        // Esc事件：
        if (e.keyCode == 27) {
            $('#quit').slideToggle(1000);
        }

    });

    // 搜索框获得焦点和失去焦点的事件：
    $('.search input').focus(function () {
        $(this).attr('placeholder', "enter 搜索");
    }).blur(function () {
        $(this).attr('placeholder', "搜用户，加好友...");
    });

    // 退出按钮点击事件：
    $('.quit button').click(function () {
        $('#quit').slideToggle(1000);
    });

    // 退出确定界面的取消按钮点击事件：
    $('.cancel').click(function () {
        $('#quit').slideToggle(1000);
    });













});