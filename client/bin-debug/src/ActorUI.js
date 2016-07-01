/**
 * Created by samsung on 2016/2/1.
 */
var ActorUI = (function (_super) {
    __extends(ActorUI, _super);
    function ActorUI(actor) {
        _super.call(this);
        this.actorUIAsset = new egret.gui.UIAsset();
        this.actorDir = 4;
        this.speed = (Const.mapTileSize / 2) / 200;
        this.position = new egret.Point();
        this.last_pos_time = 0;
        //通过点击地图的某一点，并到达到此点的移动的方式。
        //为了走最短路程，需要先判断走直线是否能到达，如果可以先走直线，若直线上有障碍点，再根据A＊寻路去移动
        this.target_pos = new egret.Point();
        this.current_pos = new egret.Point();
        this.angle_30 = 30 * Math.PI / 180;
        this.angle_150 = 150 * Math.PI / 180;
        this.angle_minus_30 = -(30 * Math.PI / 180);
        this.angle_minus_150 = -(150 * Math.PI / 180);
        this.path_pos = [];
        this.next_pos = { x: 0, y: 0 };
        this.id = actor.userid;
        this.username = actor.username;
        this.x = actor.x;
        this.y = actor.y;
        this.nameTxt = new egret.gui.Label();
        this.nameTxt.text = this.username;
        this.nameTxt.size = 20;
        this.nameTxt.y = -100;
        this.nameTxt.x = -20;
        this.addElement(this.nameTxt);
        this.actor = new Actor("scenePlayer_0");
        this.actorUIAsset.source = this.actor.mc;
        this.actorUIAsset.scaleX = this.actorUIAsset.scaleY = 0.7;
        this.addElement(this.actorUIAsset);
    }
    var __egretProto__ = ActorUI.prototype;
    __egretProto__.setName = function (name) {
        this.nameTxt.text = name;
    };
    __egretProto__.action = function (action, dir) {
        this.actor.playAction(action, dir);
    };
    __egretProto__.control = function (actor) {
        this.actorDir = actor.dir;
        //200毫秒走距离
        this.speed = (Const.mapTileSize / 2) / 200;
        this.radian = (actor.angle * Math.PI / 180);
        //console.log(actor.dir,actor.angle,this.angle);
        this.last_pos_time = 0;
        this.position.x = this.x;
        this.position.y = this.y;
        egret.Ticker.getInstance().unregister(this.controlRun, this);
        if (actor.dir != -1) {
            egret.Ticker.getInstance().register(this.controlRun, this);
            this.last_move_dir = actor.dir;
        }
        else {
            this.action(Action.STAND, this.last_move_dir);
        }
    };
    __egretProto__.controlRun = function (update_time) {
        var radius = this.speed * update_time;
        this.updatePosition(radius, this.radian, this.position);
        var pos_map_tile = Main.scene.getMapPoint(this.position.x, this.position.y);
        if (Main.scene.mapDataArray[pos_map_tile.y] && Main.scene.mapDataArray[pos_map_tile.y][pos_map_tile.x] && Main.scene.mapDataArray[pos_map_tile.y][pos_map_tile.x].canCross) {
            this.x = this.position.x;
            this.y = this.position.y;
            this.action(Action.MOVE, this.actorDir);
        }
        else {
            this.action(Action.STAND, this.actorDir);
            //防止一直按住某个方向会穿越障碍物
            egret.Ticker.getInstance().unregister(this.controlRun, this);
            return;
        }
        this.last_pos_time += update_time;
        if (this.last_pos_time >= 1000) {
            Main.main.egretNet.setPos(new egret.Point(this.x, this.y));
            this.last_pos_time = 0;
        }
    };
    __egretProto__.pos = function (click_pos) {
        this.target_pos.x = click_pos.x;
        this.target_pos.y = click_pos.y;
        this.path_pos = [];
        egret.Ticker.getInstance().unregister(this.autoRun, this);
        if (!this.lineSearch()) {
            this.aStarSearch();
        }
    };
    __egretProto__.lineSearch = function () {
        this.current_pos.x = this.x;
        this.current_pos.y = this.y;
        var target_tile = Main.scene.getMapPoint(this.target_pos.x, this.target_pos.y);
        var current_tile = Main.scene.getMapPoint(this.current_pos.x, this.current_pos.y);
        var min_tileX = Math.min(target_tile.x, current_tile.x);
        var max_tileX = Math.max(target_tile.x, current_tile.x);
        var min_tileY = Math.min(target_tile.y, current_tile.y);
        var max_tileY = Math.max(target_tile.y, current_tile.y);
        if (max_tileY % 2 == 0)
            min_tileX -= 1;
        if (min_tileY % 2 != 0)
            max_tileX += 1;
        var min_tile_pos = Main.scene.getStagePoint(min_tileX, min_tileY);
        var max_tile_pos = Main.scene.getStagePoint(max_tileX, max_tileY);
        var min_posY = Math.min(this.current_pos.y, this.target_pos.y);
        var max_posY = Math.max(this.current_pos.y, this.target_pos.y);
        if (min_tile_pos.y > min_posY)
            min_tileY -= 1;
        if (max_tile_pos.y < max_posY)
            max_tileY += 1;
        var min_posX = Math.min(this.current_pos.x, this.target_pos.x);
        var max_posX = Math.max(this.current_pos.x, this.target_pos.x);
        //垂直与y轴时，斜率 k 不存在的情况。
        if (this.target_pos.x == this.current_pos.x) {
            this.target_pos.x += 1;
        }
        var k = (this.target_pos.y - this.current_pos.y) / (this.target_pos.x - this.current_pos.x);
        var offsetY = this.target_pos.y - this.current_pos.y;
        var offestX = this.target_pos.x - this.current_pos.x;
        var angel = Math.atan2(-offsetY, offestX);
        var is_left_right = false;
        if ((angel > this.angle_30 && angel < this.angle_150) || (angel < this.angle_minus_30 && angel > this.angle_minus_150)) {
            is_left_right = true;
        }
        for (var y = min_tileY; y <= max_tileY; y++) {
            for (var x = min_tileX; x <= max_tileX; x++) {
            }
        }
        for (var y = min_tileY; y <= max_tileY; y++) {
            for (var x = min_tileX; x <= max_tileX; x++) {
                if (is_left_right) {
                    var left = Main.scene.mapDataArray[y][x].left;
                    var right = Main.scene.mapDataArray[y][x].right;
                    //根据 y＝kx+b 的斜线方程式，求出左右两点是否在直线的两侧。vv<0 说明在两侧。
                    var left_v = k * (left.x - this.current_pos.x) - left.y + this.current_pos.y;
                    var right_v = k * (right.x - this.current_pos.x) - right.y + this.current_pos.y;
                    var vv = left_v * right_v;
                    if (vv < 0) {
                        if (!Main.scene.mapDataArray[y][x].canCross) {
                            console.log("此tile不可通过", "y:", y, "x:", x);
                            //                            Main.scene.setNotCross(x, y);
                            if (Main.scene.mapDataArray[y][x].down.y < min_posY || Main.scene.mapDataArray[y][x].up.y > max_posY) {
                            }
                            else {
                                return false;
                            }
                        }
                    }
                    ;
                }
                else {
                    var up = Main.scene.mapDataArray[y][x].up;
                    var down = Main.scene.mapDataArray[y][x].down;
                    var up_v = k * (up.x - this.current_pos.x) - up.y + this.current_pos.y;
                    var down_v = k * (down.x - this.current_pos.x) - down.y + this.current_pos.y;
                    var vv = up_v * down_v;
                    if (vv < 0) {
                        if (!Main.scene.mapDataArray[y][x].canCross) {
                            console.log("此tile不可通过", "y:", y, "x:", x);
                            //                            Main.scene.setNotCross(x, y);
                            if (Main.scene.mapDataArray[y][x].right.x < min_posX || Main.scene.mapDataArray[y][x].left.x > max_posX) {
                            }
                            else {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        Main.scene.setline(this.current_pos, this.target_pos);
        this.next_pos.x = this.target_pos.x;
        this.next_pos.y = this.target_pos.y;
        this.position.x = this.x;
        this.position.y = this.y;
        var a = this.next_pos.x - this.position.x;
        var b = this.next_pos.y - this.position.y;
        this.current_distance = Math.sqrt(a * a + b * b);
        console.log("next", this.next_pos.x, this.next_pos.y);
        console.log("pos", this.position.x, this.position.y);
        console.log("dis", this.current_distance);
        var radian = Math.atan2(-b, a);
        this.radian = radian;
        this.actorDir = this.setDir(radian);
        console.log("dir radian:", this.actorDir, this.radian);
        this.action(Action.MOVE, this.actorDir);
        egret.Ticker.getInstance().register(this.autoRun, this);
        return true;
    };
    __egretProto__.aStarSearch = function () {
        var current_map_tile = Main.scene.getMapPoint(this.x, this.y);
        if (Main.scene.xyTiles[current_map_tile.y] && Main.scene.xyTiles[current_map_tile.y][current_map_tile.x]) {
            this.current_tile = Main.scene.xyTiles[current_map_tile.y][current_map_tile.x];
        }
        var target_map_tile = Main.scene.getMapPoint(this.target_pos.x, this.target_pos.y);
        if (Main.scene.xyTiles[target_map_tile.y] && Main.scene.xyTiles[target_map_tile.y][target_map_tile.x]) {
            this.target_tile = Main.scene.xyTiles[target_map_tile.y][target_map_tile.x];
        }
        this.path_pos = [];
        var pathArray = Main.scene.a.getPaths(this.current_tile.point, this.target_tile.point, Main.scene.mapDataArray, Const.mapTileSize);
        if (pathArray.length)
            pathArray.shift();
        for (var i = 0; i < pathArray.length; i++) {
            var pos = Main.scene.getStagePoint(pathArray[i].x, pathArray[i].y);
            console.log("pathNode", pathArray[i].x, pathArray[i].y, pos.x, pos.y);
            Main.scene.setCross(pathArray[i].x, pathArray[i].y);
            if (pathArray[i].is_turn) {
                var pos = Main.scene.getStagePoint(pathArray[i].x, pathArray[i].y);
                this.path_pos.push(pos);
                Main.scene.setNotCross(pathArray[i].x, pathArray[i].y);
            }
        }
        this.setRun();
        if (this.path_pos.length)
            egret.Ticker.getInstance().register(this.autoRun, this);
    };
    __egretProto__.setRun = function () {
        if (this.path_pos.length) {
            this.next_pos = this.path_pos.shift();
            this.position.x = this.x;
            this.position.y = this.y;
            var a = this.next_pos.x - this.position.x;
            var b = this.next_pos.y - this.position.y;
            this.current_distance = Math.sqrt(a * a + b * b);
            console.log("next", this.next_pos.x, this.next_pos.y);
            console.log("pos", this.position.x, this.position.y);
            console.log("dis", this.current_distance);
            var radian = Math.atan2(-b, a);
            this.radian = radian;
            this.radian = radian;
            this.actorDir = this.setDir(radian);
            console.log(this.actorDir, this.radian);
            var a = this.next_pos.x - this.position.x;
            var b = this.next_pos.y - this.position.y;
            this.current_distance = Math.sqrt(a * a + b * b);
            this.action(Action.MOVE, this.actorDir);
        }
        else {
            egret.Ticker.getInstance().unregister(this.autoRun, this);
            this.action(Action.STAND, this.actorDir);
        }
    };
    __egretProto__.autoRun = function (update_time) {
        var radius = this.speed * update_time;
        this.updatePosition(radius, this.radian, this.position);
        var a = this.next_pos.x - this.position.x;
        var b = this.next_pos.y - this.position.y;
        var position_distance = Math.sqrt(a * a + b * b);
        if (position_distance > this.current_distance) {
            this.x = this.next_pos.x;
            this.y = this.next_pos.y;
            this.setRun();
        }
        else {
            this.x = this.position.x;
            this.y = this.position.y;
            this.current_distance = position_distance;
        }
    };
    __egretProto__.updatePosition = function (radius, radian, position) {
        if (radian == 0) {
            position.x += radius;
        }
        else if (radian > 0 && radian < Math.PI / 2) {
            position.x += radius * Math.cos(radian);
            position.y -= radius * Math.sin(radian);
        }
        else if (radian == Math.PI / 2) {
            position.y -= radius;
        }
        else if (radian > Math.PI / 2) {
            var new_angle = radian - Math.PI / 2;
            position.x -= radius * Math.sin(new_angle);
            position.y -= radius * Math.cos(new_angle);
        }
        else if (radian > (-Math.PI / 2) && radian < 0) {
            var new_angle = Math.abs(radian);
            position.x += radius * Math.cos(new_angle);
            position.y += radius * Math.sin(new_angle);
        }
        else if (radian == -Math.PI / 2) {
            position.y += radius;
        }
        else if (radian < (-Math.PI / 2)) {
            var new_angle = Math.abs(radian) - Math.PI / 2;
            position.x -= radius * Math.sin(new_angle);
            position.y += radius * Math.cos(new_angle);
        }
        return position;
    };
    __egretProto__.setDir = function (radian) {
        var angle = radian * 180 / Math.PI;
        var run_dir;
        if (angle < -157.5) {
            run_dir = Direction.LEFT;
        }
        else if (-157.5 <= angle && angle < -112.5) {
            run_dir = Direction.LEFT_DOWN;
        }
        else if (-112.5 <= angle && angle < -67.5) {
            run_dir = Direction.DOWN;
        }
        else if (-67.5 <= angle && angle < -22.5) {
            run_dir = Direction.RIGHT_DOWN;
        }
        else if (-22.5 <= angle && angle < 22.5) {
            run_dir = Direction.RIGHT;
        }
        else if (22.5 <= angle && angle < 67.5) {
            run_dir = Direction.RIGHT_UP;
        }
        else if (67.5 <= angle && angle < 112.5) {
            run_dir = Direction.UP;
        }
        else if (112.5 <= angle && angle < 157.5) {
            run_dir = Direction.LEFT_UP;
        }
        else {
            run_dir = Direction.LEFT;
        }
        return run_dir;
    };
    return ActorUI;
})(egret.gui.Group);
ActorUI.prototype.__class__ = "ActorUI";
