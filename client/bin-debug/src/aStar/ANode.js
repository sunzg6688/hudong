/**
 * Created by sunzg on 15/7/20.
 */
var ANode = (function () {
    function ANode(posX, posY, canCross) {
        if (canCross === void 0) { canCross = true; }
        this.indexOpenList = -1;
        //根据钟表区分:0-上，1-右上，3-右，4-右下，6-下，7-左下，9-左，10-左上
        this.direction = -1;
        this.point = new egret.Point(posX, posY);
    }
    var __egretProto__ = ANode.prototype;
    __egretProto__.updatePos = function (posX, posY) {
        this.point.x = posX;
        this.point.y = posY;
    };
    return ANode;
})();
ANode.prototype.__class__ = "ANode";
