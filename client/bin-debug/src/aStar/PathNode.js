/**
 * Created by sunzg on 15/7/22.
 */
var PathNode = (function (_super) {
    __extends(PathNode, _super);
    function PathNode(x, y, direction, size) {
        _super.call(this);
        this.direction = -1;
        this.is_turn = false;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.left = this.x * size;
        this.right = this.left + size;
        this.up = this.y * size;
        this.down = this.up + size;
    }
    var __egretProto__ = PathNode.prototype;
    return PathNode;
})(egret.Point);
PathNode.prototype.__class__ = "PathNode";
