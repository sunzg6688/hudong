/**
 * Created by samsung on 2016/2/2.
 */
(function(window,document){
    var document = document;
    var window = window;

    var socket_url=window.socket_url;

    window.webSocket={
        username:null,
        userid:null,
        socket:null,

        mobileConnect:function(userid){
            this.userid=userid;
            this.username = document.getElementById("username").value;
            this.socket=io.connect(socket_url);
            this.socket.emit("login", { userid:userid,username:this.username});
            this.socket.on("login",function(){
                var controller=document.getElementById("controller");
                controller.style.display="block";
                initController();
            })
        },
        mobileAction:function(userid,dir,angle){
          this.socket.emit("cmd",{action:"controller",user:{userid:userid,dir:dir,angle:angle}});
        },
        mobileStopAction:function(userid,dir,angle){
            this.socket.emit("cmd",{action:"stopController",user:{userid:userid}});
        },
        setName:function(){
            this.username = document.getElementById("username").value;
            this.socket.emit("cmd",{action:"setName",user:{userid:this.userid,username:this.username}})
        },

        pcConnect:function(){
            this.socket=io.connect(socket_url);
            //带过去出生坐标
            this.socket.emit("login", {x:900,y:2300});

            this.socket.on('login', function(obj){
                if(obj.startGaming){
                    disposeQRCode();
                    if(window["egretNet"]){
                        window["egretNet"].login(obj.user);
                    }else{
                        gameUser=obj.user;
                        setTimeCreateGaming();
                    }
                    document.getElementById("gameDiv").style.display="block";
                }else {
                    creatQRCode(obj.user.userid);
                }
            });

            this.socket.on('cmd', function(obj){
                //console.log("receive:",obj);
                if(window["egretNet"]){
                    window["egretNet"].receive(obj);
                }
            });
        },

        send:function(obj){
            this.socket.emit("cmd", obj);
        }

    }

})(window,document);