这是一个手机端操控电脑端的H5双屏互动的游戏demo。<br>
服务器端用的是node.js，使用express作为web服务器，socket通信服务用到了socket.io<br>
游戏前端是用基于typescript的 egret H5 游戏引擎编写。<br>
client为游戏前端展示源码，server为websocket的服务器端源码，webserver是基于express的可以运行的完整web项目（包含游戏前端和服务器端）。

游戏服务器端和web服务器端逻辑都比较简单，关键词node.js，express，websocket，socket.io。<br>
client端的逻辑会比较复杂些, 首先要了解游戏开发相关的知识（游戏场景，游戏层级，人物行走，地图打点，斜45度地图，A＊寻路等），关键词typescript，egret，A*，maptile，Staggered。<br>
实现了Staggered斜45度地图的A*寻路，并大幅度优化了A＊寻路的效率。

demo启动方式
1.需要安装node环境
2.启动
     2-1.windows启动：直接解压之后，双击打开webServer/bin/run.bat启动（或者双击webServer/bin/runner.vbs－－这个是后台隐藏启动）
     2-2.mac启动：node环境下直接运行 webServer/bin/www.js 即可
3.浏览器访问地址：本机的局域网ip:3000（例如192.168.1.15:3000）可以直接运行。（注：手机扫码控制时需要和pc电脑处于同一局域网内）
