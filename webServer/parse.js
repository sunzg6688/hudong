/**
 * Created by sunzg on 16/3/4.
 */
var jsonStr='{"name":"tom","age":18,"family":[{"fav":"football","father":{"name":"tomFather","age":40,"www":[{"q1":123},{"wq":{"wwww":1222,"tname":"ttt"}}]}},{"mother":{"name":"tomMother","age":41},"fav":"cookie"}]}';

var jsonObject=JSON.parse(jsonStr);

parseObject(jsonObject,0,"");
function parseObject(obj,depth,space,douhao){

    console.log(space,"{");
    var consoleSpace=space+" ";
    for(var key in obj){
        var type=typeof obj[key];
        var keyConsoleSpace=consoleSpace;
        if(type=="object"){
            if(obj[key] instanceof Array){
                console.log(keyConsoleSpace,key,":");
                var array_key_space=keyConsoleSpace;
                var keyLength=key.length;
                for(var i=0;i<keyLength;i++){
                    array_key_space+=" ";
                }
                console.log(array_key_space,"   [");
                for(var i=0;i<obj[key].length;i++){
                    if(i==obj[key].length-1){
                        parseObject(obj[key][i],depth+1,array_key_space+"    ");
                    }else{
                        parseObject(obj[key][i],depth+1,array_key_space+"    ",",");
                    }
                }
                console.log(array_key_space,"   ]");
            }else{
                console.log(keyConsoleSpace,key,":","");
                var object_key_space=keyConsoleSpace+"   ";
                var keyLength=key.length;
                for(var i=0;i<keyLength;i++){
                    object_key_space+=" ";
                }
                parseObject(obj[key],depth+1,object_key_space);
            }
        }else{
            console.log(keyConsoleSpace,key,":",obj[key]);
        }
    }
    if(douhao){
        console.log(space,"},");
    }else{
        console.log(space,"}");
    }
}


//parseObject(jsonObject,0,"");

//function parseObject(obj,depth,keySpace,dh){
//
//    var space;
//    if(depth){
//        space=keySpace;
//    }else{
//        space="";
//    }
//    console.log(space,"{");
//    var consoleSpace=space+" ";
//    for(var key in obj){
//        var type=typeof obj[key];
//        var keyConsoleSpace=consoleSpace;
//        if(type=="object"){
//            if(obj[key] instanceof Array){
//                console.log(keyConsoleSpace,key,":","[");
//                var keyLength=key.length;
//                for(var i=0;i<keyLength;i++){
//                    consoleSpace+=" ";
//                }
//                for(var i=0;i<obj[key].length;i++){
//                    if(i==obj[key].length-1){
//                        parseObject(obj[key][i],depth+1,consoleSpace+"    ");
//                    }else{
//                        parseObject(obj[key][i],depth+1,consoleSpace+"    ",",");
//                    }
//                }
//                console.log(consoleSpace,"   ]");
//            }else{
//                console.log(keyConsoleSpace,key,":","");
//                consoleSpace+="   ";
//                var keyLength=key.length;
//                for(var i=0;i<keyLength;i++){
//                    consoleSpace+=" ";
//                }
//                parseObject(obj[key],depth+1,consoleSpace);
//            }
//        }else{
//            console.log(keyConsoleSpace,key,":",obj[key]);
//        }
//    }
//    if(dh){
//        console.log(space,"},");
//    }else{
//        console.log(space,"}");
//    }
//}