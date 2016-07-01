/**
 * Created by samsung on 2016/2/1.
 */
//class Net {
//    private ws:egret.WebSocket;
//    public constructor(host,port){
//        //host="109.10.221.34";
//        //port=80;
//        //this.ws=new egret.WebSocket(host,port);
//        //this.ws.addEventListener(egret.ProgressEvent.SOCKET_DATA,this.onReceive,this);
//        //this.ws.addEventListener(egret.Event.CONNECT,this.onOpen,this);
//        //this.ws.addEventListener(egret.Event.CLOSE,this.onClose,this);
//        //this.ws.addEventListener(egret.IOErrorEvent.IO_ERROR,this.onError,this);
//        //this.ws.connect(host,port);
//    }
//
//    public onReceive(e:egret.ProgressEvent){
//        var msg=this.ws.readUTF();
//        var obj=JSON.parse(msg);
//        if(obj.action=="create"){
//
//        }else if(obj.action=="die"){
//
//        }else if(obj.action=="run"){
//
//        }
//    }
//
//    public onOpen(){
//        console.log("ws Open");
//    }
//
//    public onClose(){
//        console.log("ws Close");
//    }
//
//    public onError(){
//        console.log("ws Error");
//    }
//
//    public action(dir){
//        var userId=1001;
//        var roomId=10;
//        var cmd='{"dir":'+dir+',"userId":'+userId+',"roomId":'+roomId+'}';
//        this.ws.writeUTF(cmd);
//    }
//
//}
var SocketIO = (function () {
    function SocketIO() {
        //this.mapTileGroup=mapTileGroup;
        this.egretSocket = window["egretSocket"];
        window["Net"] = this;
    }
    var __egretProto__ = SocketIO.prototype;
    __egretProto__.onReceive = function (obj) {
        console.log("net::", obj);
        if (obj.action == "create") {
            Main.main.mapTileGroup.addActor(obj.user);
        }
        else if (obj.action == "remove") {
            Main.main.mapTileGroup.removeActor(obj.user);
        }
        else if (obj.action == "run") {
            Main.main.mapTileGroup.actorRunByPhone(obj.user);
        }
    };
    __egretProto__.login = function (obj) {
        Main.main.createScene(obj);
        var w = window;
        w.creatQRCode(obj.userid);
    };
    __egretProto__.onOpen = function () {
        console.log("ws Open");
    };
    __egretProto__.onClose = function () {
        console.log("ws Close");
    };
    __egretProto__.onError = function () {
        console.log("ws Error");
    };
    __egretProto__.sendAction = function (dir) {
        var userid = 1001;
        var roomid = 10;
        var user = '{"dir":' + dir + ',"userid":' + userid + ',"roomid":' + roomid + '}';
        this.egretSocket.sendMsg(user);
    };
    return SocketIO;
})();
SocketIO.prototype.__class__ = "SocketIO";
