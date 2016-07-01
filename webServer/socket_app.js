/**
 * Created by sunzg on 16/3/3.
 */
//下面是 socketServer 内容

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var address=require('./addressConfig');

//打印内存堆栈信息
//var heapdump=require("heapdump");


app.get('/', function(req, res){
    res.send('<h1>年轻人，你本不应该来到这里！！！</h1>');
});

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

var totalUserid=0;

var sockets={};

function sendUserList(socket){
    var userList=[];
    for(var key in sockets){
        if(sockets[key]["pc"]){
            userList.push(sockets[key]["pc"].user);
        }
    }
    socket.emit("cmd",{"action":"refreshUsers","userList":userList});
};


io.on('connection', function(socket){

    totalUserid++;
    //监听新用户加入
    socket.on('login', function(obj){
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        if(obj.userid){
            socket.isPC=false;
            console.log("mobile端 login userid ：",obj.userid);
            socket.name=obj.userid;
            if(sockets.hasOwnProperty(obj.userid)){
                //if(!sockets[obj.userid].phone){
                sockets[obj.userid].phone=socket;
                sockets[obj.userid].pc.user.username=obj.username;
                console.log('mobile端 username '+sockets[obj.userid].pc.user.username);
                //}

                socket.emit("login")
                sockets[obj.userid].pc.emit("login",{user:sockets[obj.userid].pc.user,startGaming:true});
                sendUserList(sockets[obj.userid].pc);

                if(!onlineUsers.hasOwnProperty(obj.userid)) {
                    onlineUsers[obj.userid] = obj.user.username;
                }

                //io.emit('cmd',{'action':'create','user':sockets[obj.userid].pc.user});

                for(var key in sockets){
                    if(sockets[key]["pc"]&&key!=obj.userid){
                        sockets[key]["pc"].emit('cmd',{'action':'create','user':sockets[obj.userid].pc.user});
                    }
                }
            }
        }else{
            console.log("pc端 login");
            obj.userid=totalUserid;
            obj.username="mobile未登录";

            socket.name = obj.userid;
            socket.isPC=true;
            socket.user=obj;

            sockets[obj.userid]={"pc":socket};
            onlineUsers[obj.userid] = obj.username;
            onlineCount++;

            socket.emit('login',{user:obj});
            console.log("pc端 userid "+obj.userid+' 加入了');
        }


//        if(totalUserid==1){
//            var file='myapp-'+process.pid+'---'+totalUserid+'.heapsnapshot';
//            heapdump.writeSnapshot(file,function(err){
//            })
//        }else if(totalUserid==2){
//            var file='myapp-'+process.pid+'---'+totalUserid+'.heapsnapshot';
//            heapdump.writeSnapshot(file,function(err){
//                if(err)console.log(err);
//            })
//        }else if(totalUserid==7){
//            var file='myapp-'+process.pid+'---'+totalUserid+'.heapsnapshot';
//            heapdump.writeSnapshot(file,function(err){
//                if(err)console.log(err);
//
//            })
//        }


    });

    //监听用户发布聊天内容
    socket.on('cmd', function(obj){
        //console.log("cmd::",obj.user.userid);
        //有可能pc端退出了，mobile端没有退出
        if(obj.action=="position"&&sockets.hasOwnProperty(obj.user.userid)){
            sockets[obj.user.userid]["pc"].user.x=obj.user.x;
            sockets[obj.user.userid]["pc"].user.y=obj.user.y;
        }
        if(obj.action=="setPos"&&sockets.hasOwnProperty(obj.user.userid)){
            sockets[obj.user.userid]["pc"].user.x=obj.user.x;
            sockets[obj.user.userid]["pc"].user.y=obj.user.y;
            return;
        }
        //向所有客户端广播发布的消息
        for(var key in sockets){
            if(sockets[key]["pc"]){
                sockets[key]["pc"].emit('cmd', obj);
            }
        }
        //io.emit('cmd', {'action':"run","user":obj.user});
    });

    //监听用户退出
    socket.on('disconnect', function(){
        //将退出的用户从在线列表中删除 (socket.name就是user.userid)
        if(socket.name&&sockets.hasOwnProperty(socket.name)&&socket.isPC) {
            delete sockets[socket.name];
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;
            //向所有客户端广播用户退出
            for(var key in sockets){
                if(sockets[key]["pc"]){
                    sockets[key]["pc"].emit("cmd",{"action":"remove","user":socket.user});
                }
            }
            //io.emit("cmd",{"action":"remove","user":socket.user});
            console.log("pc端 userid "+socket.name+' 退出了');
        }else{
            if(sockets.hasOwnProperty(socket.name)){
                sockets[socket.name].phone=null;
            }
            console.log("mobile端 userid "+socket.name+" 退出了");
        }
    });
});


var socketPort=address.socketPort;

http.listen(socketPort, function(){
    console.log("socket server listening on : ",address.ip,":",address.socketPort)
});