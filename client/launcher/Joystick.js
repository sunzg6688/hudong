/**
 * Created by samsung on 2016/2/18.
 */
(function (dom) {
    var JoytickTimer = {
        fps: 20,
        step:0,
        loopId: 0,
        loopCount: 0,
        start: function () {
            this.step=Math.round(1000 / this.fps);
            var self = this;
            this.loop = function () {
                self.run();
            };
            this.run();
        },
        self: null,
        run: function () {
            this.loopCount++;
            this.loopId = setTimeout(this.loop, this.step);
            controller();
        }
    };

    var dir = {
        UP: 0,
        RIGHT_UP: 1,
        RIGHT: 3,
        RIGHT_DOWN: 4,
        DOWN: 6,
        LEFT_DOWN: 7,
        LEFT: 9,
        LEFT_UP: 10
    }

    var angle=0;
    var current_dir=-1;
    function controller() {
        if (Math.abs(joystick.offsetX) > 50 || Math.abs(joystick.offsetY) > 50) {
            var new_angle = Math.atan2(-joystick.offsetY, joystick.offsetX) * 180 / Math.PI;

            angle=new_angle;
            var runDir;
            var dirDesc;
            if (angle < -157.5) {
                runDir = dir.LEFT;
                dirDesc = "左";
            } else if (-157.5 <= angle && angle < -112.5) {
                runDir = dir.LEFT_DOWN;
                dirDesc = "左-下";
            } else if (-112.5 <= angle && angle < -67.5) {
                runDir = dir.DOWN;
                dirDesc = "下";
            } else if (-67.5 <= angle && angle < -22.5) {
                runDir = dir.RIGHT_DOWN;
                dirDesc = "右-下";
            } else if (-22.5 <= angle && angle < 22.5) {
                runDir = dir.RIGHT;
                dirDesc = "右";
            } else if (22.5 <= angle && angle < 67.5) {
                runDir = dir.RIGHT_UP;
                dirDesc = "右-上";
            } else if (67.5 <= angle && angle < 112.5) {
                runDir = dir.UP;
                dirDesc = "上";
            } else if (112.5 <= angle && angle < 157.5) {
                runDir = dir.LEFT_UP;
                dirDesc = "左-上";
            } else {
                runDir = dir.LEFT;
                dirDesc = "左";
            }

            if(Math.abs(angle-new_angle)>5||runDir!=current_dir){

                console.log(runDir, dirDesc,angle);

                current_dir=runDir;

                sendAction(runDir,angle);
            }
        }
    }


    var joystick = {
        offsetX: 0,
        offsetY: 0,
        startX: 0,
        startY: 0,
        touching: false,
        dom: null,
        tip: null,
        useMouse: false,
        init: function (dom, tip) {
            this.dom = dom;
            this.tip = tip;
            var joystick = this;
            JoytickTimer.start();
            this.supportMultiTouch = "ontouchstart" in dom;
            if (!this.supportMultiTouch) {
                this.useMouse = true;
            }

            if (this.useMouse) {
                joystick.START = "mousedown";
                joystick.MOVE = "mousemove";
                joystick.END = "mouseup";
                joystick.CANCEL = null;
            } else {
                joystick.START = "touchstart";
                joystick.MOVE = "touchmove";
                joystick.END = "touchend";
                joystick.CANCEL = "touchcancel";
            }

            var self = this;
            dom.addEventListener(joystick.START, function (event) {
                var pos = {};
                if (self.useMouse) {
                    pos.x = event.offsetX
                    pos.y = event.offsetY;
                    //pos.x = 100;
                    //pos.y = 100;
                } else {
                    pos.x = event.touches[0].clientX;
                    pos.y = event.touches[0].clientY;
                    //pos.x = 100;
                    //pos.y = 100;
                }
                self.touching = true;
                self.startHandler(pos);
                event.preventDefault();
            },true);

            dom.addEventListener(joystick.MOVE, function (event) {
                if (!self.touching)return;
                var pos = {};
                if (self.useMouse) {
                    pos.x = event.offsetX
                    pos.y = event.offsetY;
                } else {
                    pos.x = event.touches[0].clientX;
                    pos.y = event.touches[0].clientY;
                }
                self.moveHandler(pos);
                event.preventDefault();
            },true);

            dom.addEventListener(joystick.END, function (event) {
                self.endHandler(event);
                self.touching = false;
                event.preventDefault();
            },true);

        },
        startHandler: function (pos) {
            this.startX = pos.x;
            this.startY = pos.y;
            console.log(this.startX, this.startY);
        },
        moveHandler: function (pos) {
            this.offsetX = pos.x - this.startX;
            this.offsetY = pos.y - this.startY;
            if (this.offsetX < -100) {
                this.offsetX = -100;
            }
            if (this.offsetY < -100) {
                this.offsetY = -100;
            }
            if (this.offsetX > 100) {
                this.offsetX = 100;
            }
            if (this.offsetY > 100) {
                this.offsetY = 100;
            }
            this.tip.style.left = (100 + this.offsetX) + "px";
            this.tip.style.top = (100 + this.offsetY) + "px";
        },
        endHandler: function (event) {
            this.startX = 0;
            this.startY = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.tip.style.left = "100px";
            this.tip.style.top = "100px";
            sendAction(-1,-1);
            //必须重置，防止下次同一方向时，controller不发送数据
            current_dir=-1;
            angle=0;
        }

    };

    window.joystick = joystick;

})()