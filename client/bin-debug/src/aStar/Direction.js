/**
 * Created by sunzg on 15/7/23.
 */
var Direction = (function () {
    function Direction() {
    }
    var __egretProto__ = Direction.prototype;
    //根据钟表区分:0-上，1-右上，3-右，4-右下，6-下，7-左下，9-左，10-左上
    Direction.UP = 0;
    Direction.RIGHT_UP = 1;
    Direction.RIGHT = 3;
    Direction.RIGHT_DOWN = 4;
    Direction.DOWN = 6;
    Direction.LEFT_DOWN = 7;
    Direction.LEFT = 9;
    Direction.LEFT_UP = 10;
    return Direction;
})();
Direction.prototype.__class__ = "Direction";
