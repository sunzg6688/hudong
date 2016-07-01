/**
 * Created by sunzg on 15/9/13.
 */
var ActionInfo = (function () {
    function ActionInfo() {
    }
    var __egretProto__ = ActionInfo.prototype;
    return ActionInfo;
})();
ActionInfo.prototype.__class__ = "ActionInfo";
var Action = (function () {
    function Action() {
    }
    var __egretProto__ = Action.prototype;
    Action.MOVETIME = 83; //125;  //1000/8;
    Action.STANDTIME = 100; //166; //1000/6;
    Action.MOVE = "move";
    Action.STAND = "stand";
    return Action;
})();
Action.prototype.__class__ = "Action";
var Actor = (function () {
    function Actor(mcName) {
        //    public mcSource:egret.Bitmap;
        this._mcOffsetX = -186;
        this._mcOffsetY = -226;
        this._actions = {};
        this._currentTime = 0;
        this._frameTime = 0;
        this._prevTimeFrame = 0;
        this._currentFrame = 0;
        this._endFrame = 0;
        this._actionTotalFrames = 0;
        this._mcName = mcName;
        this._mcJson = RES.getRes(mcName + "_json");
        this._mcSheet = RES.getRes(mcName + "_sheet");
        this._mcFactory = new egret.MovieClipDataFactory(this._mcJson, this._mcSheet);
        this._mcData = this._mcFactory.generateMovieClipData(this._mcName);
        this.mc = new egret.MovieClip(this._mcData);
        this.mc.x = this._mcOffsetX;
        this.mc.y = this._mcOffsetY;
        //        this.mcSource=new egret.Bitmap();
        //        this.mcSource.x=-186;
        //        this.mcSource.y=-226;
        this._InitActionData();
        egret.Ticker.getInstance().register(this._Play, this);
        this.playAction(Action.STAND, 7);
    }
    var __egretProto__ = Actor.prototype;
    __egretProto__._InitActionData = function () {
        var labels = this._mcData.labels;
        var len = labels.length;
        var obj;
        var start;
        var end = this._mcData.numFrames;
        for (var i = len - 1; i > -1; i--) {
            obj = labels[i];
            start = obj.frame;
            var actionInfo = new ActionInfo();
            actionInfo.start = start;
            actionInfo.end = end;
            actionInfo.total = end - start;
            this._actions[obj.name] = actionInfo;
            end = start;
        }
    };
    __egretProto__._Play = function (dif) {
        this._currentTime += dif;
        while (this._currentTime >= this._frameTime) {
            this._currentTime -= this._frameTime;
            this._currentFrame++;
        }
        if (this._prevTimeFrame != this._currentFrame) {
            if (this._currentFrame >= this._endFrame) {
                this._currentFrame -= this._actionTotalFrames;
            }
            this._prevTimeFrame = this._currentFrame;
            this.mc.gotoAndStop(this._currentFrame);
        }
    };
    __egretProto__.playAction = function (action, dir) {
        var scale = 1;
        var _mcOffsetX = -186;
        var move_dir = dir;
        switch (dir) {
            case Direction.UP:
                dir = 0;
                break;
            case Direction.RIGHT_UP:
                dir = 1;
                break;
            case Direction.RIGHT:
                dir = 2;
                break;
            case Direction.RIGHT_DOWN:
                dir = 3;
                break;
            case Direction.DOWN:
                dir = 4;
                break;
            case Direction.LEFT_DOWN:
                dir = 3;
                scale = -1;
                _mcOffsetX = 186;
                break;
            case Direction.LEFT:
                dir = 2;
                scale = -1;
                _mcOffsetX = 186;
                break;
            case Direction.LEFT_UP:
                dir = 1;
                scale = -1;
                _mcOffsetX = 186;
                break;
            default:
                dir = 4;
                scale = 1;
                _mcOffsetX = -186;
                break;
        }
        //因为 dir被重置了。 比如从 1 到 10 转向运行时，下面的内容就不会运行。所以用move_dir 来判断
        if (this._move_dir != move_dir || this._action != action) {
            this._dir = dir;
            this._action = action;
            this._move_dir = move_dir;
            var actionName = action + "_" + dir;
            var actionInfo = this._actions[actionName];
            if (actionInfo) {
                this._currentFrame = actionInfo.start + 2;
                this._endFrame = actionInfo.end;
                this._actionTotalFrames = actionInfo.total;
                this._frameTime = action == Action.MOVE ? Action.MOVETIME : Action.STANDTIME;
                this._prevTimeFrame = this._currentFrame;
                this._currentTime = 0;
                this.mc.scaleX = scale;
                this.mc.x = _mcOffsetX;
                this._mcOffsetX = _mcOffsetX;
                this.mc.gotoAndStop(this._currentFrame);
            }
        }
    };
    __egretProto__.move = function (path, roleUI) {
        egret.Tween.get(roleUI);
    };
    return Actor;
})();
Actor.prototype.__class__ = "Actor";
