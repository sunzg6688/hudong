/**
 * Created by sunzg on 16/3/3.
 */

var os = require("os");

function getIP(){
    var ipConfig = os.networkInterfaces();
    var ip = "localhost";
    for (var key in ipConfig) {
        var arr = ipConfig[key];
        var length = arr.length;
        for (var i = 0; i < length; i++) {
            var ipData = arr[i];
            if (!ipData.internal && ipData.family == "IPv4") {
                ip = ipData.address;
                return ip;
            }
        }
    }
    return ip;
}

var ip=getIP();
var webPort=3000;
var socketPort=8030;

module.exports.webPort=webPort;
module.exports.ip=ip;
module.exports.socketPort=socketPort;
module.exports.socket_url="ws://"+ip+":"+socketPort;
module.exports.socket_io_js="http://"+ip+":"+socketPort+"/socket.io/socket.io.js";