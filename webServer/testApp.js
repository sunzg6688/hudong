/**
 * Created by sunzg on 16/3/3.
 */
var app = require('express')();
var http = require('http').Server(app);


app.get('/', function(req, res){
    res.send('<h1>年轻人，你本不应该来到这里！！！</h1>');
});


var socketPort=8088;

http.listen(socketPort, function(){
    console.log("socket server listening on : ",socketPort);
});


var jsonStr='{"name":"tom","age":18,"family":[{"father":{"name":"tomFather","age":40}},{"mother":{"name":"tomMother","age":41}}]}';

var jsonObject=JSON.parse(jsonStr);

parseObject(jsonObject,0);

function parseObject(obj,depth){
    var space="";
    for(var i=0;i<depth;i++){
        space+="  ";
    }
    console.log(space,"{");
    for(var key in obj){
        var type=typeof obj[key];
        if(type=="object"){
            if(obj[key] instanceof Array){
                console.log(space,key,":","[");
                for(var i=0;i<obj[key].length;i++){
                    parseObject(obj[key][i],depth+1);
                }
                var keyLength=key.length;
                for(var i=0;i<keyLength;i++){
                    space+=" ";
                }
                console.log(space,"   ]");
            }else{
                console.log(space,key,":","Object");
                parseObject(obj[key],depth+1);
            }
        }else{
            console.log(space,key,":",obj[key]);
        }
    }
    console.log(space,"}");
}

