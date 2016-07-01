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

class EgretNet{
    private webSocket:any;
    public constructor(){
        this.webSocket=window["webSocket"];
        window["egretNet"]=this;
    }

    public logined:boolean=false;
    public login(obj){
        if(!this.logined){
            this.logined=true;
            Main.main.createScene(obj);
        }
        //var win:any=window;
        //win.creatQRCode(obj.userid);
    }

    public receive(obj){
        if(!Main.scene)return;
        switch (obj.action){
            case "create":
                Main.scene.addActor(obj.user);
                break;
            case "remove":
                Main.scene.removeActor(obj.user);
                break;
            case "run":
                Main.scene.actorRunByPhone(obj.user);
                break;
            case "refreshUsers":
                for(var i=0;i<obj.userList.length;i++){
                    Main.scene.addActor(obj.userList[i]);
                }
                break;
            case "position":
                Main.scene.actorToPos(obj.user);
                break;
            case "controller":
                Main.scene.actorController(obj.user);
                break;

        }
    }

    //public sendAction(userid,dir){
    //    var userid=1001;
    //    var roomid=10;
    //    var user='{"dir":'+dir+',"userid":'+userid+',"roomid":'+roomid+'}';
    //    this.webSocket.send({"action":"run","user":user});
    //}

    public pcAction(pos:egret.Point){
        var userid=Main.scene.mainActor.id;
        var user={"userid":userid,"x":pos.x,"y":pos.y};
        this.webSocket.send({"action":"position","user":user});
    }

    public setPos(pos:egret.Point){
        var userid=Main.scene.mainActor.id;
        var user={"userid":userid,"x":pos.x,"y":pos.y};
        this.webSocket.send({"action":"setPos","user":user});
    }




    public onOpen(){
        console.log("ws Open");
    }

    public onClose(){
        console.log("ws Close");
    }

    public onError(){
        console.log("ws Error");
    }
}