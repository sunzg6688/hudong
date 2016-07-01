/**
 * Created by sunzg on 16/3/3.
 */
//下面是webServer内容


var webIP="127.0.0.1";
var webPORT = 3000;

var webhttp = require('http');
var weburl=require('url');
var webfs=require('fs');
var webpath=require('path');

var os = require("os");


var mine={
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "mp3": "audio/mpeg",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
}

function findIP() {
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
    webIP=ip;
}

findIP();

var webserver=webhttp.createServer(function(request, response){
    var pathname = weburl.parse(request.url).pathname;
    var realPath = webpath.join("client", pathname);
//    console.log(realPath);
    var ext = webpath.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';

    webfs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });

            response.write("This request URL " + pathname + " was not found on this server.");
            response.end();
        } else {
            webfs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err);
                } else {
                    var contentType = mine[ext] || "text/plain";
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
});

webserver.listen(webPORT);
console.log("web Server runing at port: " + webPORT + ".");