/**
 * Created by sunzg on 15/9/15.
 */
var AStarUtils = (function () {
    function AStarUtils() {
        this.mapData = [];
        this.openList = [];
        this.closeList = [];
        this.startTime = 0;
        this.aNodePool = [];
        this.getTarget = false;
    }
    var __egretProto__ = AStarUtils.prototype;
    __egretProto__.getPaths = function (start, target, mapData, tileMapSize) {
        this.mapData = mapData;
        this.tileMapSize = tileMapSize;
        if (!this.canCrossNode(target.x, target.y)) {
            //console.log("目标点无法到达==>目标点不是可穿越类型");
            //return false;
            return [];
        }
        this.startTime = egret.getTimer();
        this.targetNode = this.getNodeFromPool(target.x, target.y);
        this.startNode = this.getNodeFromPool(start.x, start.y);
        this.resetNode(this.startNode, 0, null);
        this.pushNodeToOpenList(this.startNode);
        this.getTarget = false;
        this.searchPath();
        return this.getPathNodes();
    };
    __egretProto__.getPathNodes = function () {
        var pathNode;
        if (this.targetNode.parent) {
            pathNode = this.targetNode;
        }
        else {
            for (var i = 0; i < this.closeList.length; i++) {
                if (i == 0) {
                    pathNode = this.closeList[i];
                }
                else {
                    if (this.closeList[i].hValue < pathNode.hValue) {
                        pathNode = this.closeList[i];
                    }
                }
            }
        }
        var path = [];
        var childNode;
        while (pathNode.parent) {
            var run_path_node = new PathNode(pathNode.point.x, pathNode.point.y, pathNode.direction, this.tileMapSize);
            path.unshift(run_path_node);
            childNode = pathNode;
            pathNode = pathNode.parent;
            if (this.setNodeDirection(pathNode, childNode)) {
                run_path_node.is_turn = true;
            }
        }
        this.setNodeDirection(this.startNode, childNode);
        path.unshift(new PathNode(this.startNode.point.x, this.startNode.point.y, this.startNode.direction, this.tileMapSize));
        //        console.log("寻路消耗的时间为:"+(egret.getTimer()-this.startTime));
        //console.log(path);
        if (path.length > 1) {
            path[path.length - 1].direction = path[path.length - 2].direction;
        }
        else {
            path[path.length - 1].direction = 4;
        }
        this.clearNodes();
        return path;
    };
    __egretProto__.setNodeDirection = function (from, to) {
        if (!to)
            return true;
        if (from.point.x == to.point.x && from.point.y - 2 == to.point.y) {
            from.direction = Direction.UP;
        }
        else if (from.point.x == to.point.x && from.point.y + 2 == to.point.y) {
            from.direction = Direction.DOWN;
        }
        else if (from.point.x - 1 == to.point.x && from.point.y == to.point.y) {
            from.direction = Direction.LEFT;
        }
        else if (from.point.x + 1 == to.point.x && from.point.y == to.point.y) {
            from.direction = Direction.RIGHT;
        }
        if (from.point.y & 1) {
            if (from.point.x + 1 == to.point.x && from.point.y - 1 == to.point.y) {
                from.direction = Direction.RIGHT_UP;
            }
            else if (from.point.x + 1 == to.point.x && from.point.y + 1 == to.point.y) {
                from.direction = Direction.RIGHT_DOWN;
            }
            else if (from.point.x == to.point.x && from.point.y + 1 == to.point.y) {
                from.direction = Direction.LEFT_DOWN;
            }
            else if (from.point.x == to.point.x && from.point.y - 1 == to.point.y) {
                from.direction = Direction.LEFT_UP;
            }
        }
        else {
            if (from.point.x == to.point.x && from.point.y - 1 == to.point.y) {
                from.direction = Direction.RIGHT_UP;
            }
            else if (from.point.x == to.point.x && from.point.y + 1 == to.point.y) {
                from.direction = Direction.RIGHT_DOWN;
            }
            else if (from.point.x - 1 == to.point.x && from.point.y + 1 == to.point.y) {
                from.direction = Direction.LEFT_DOWN;
            }
            else if (from.point.x - 1 == to.point.x && from.point.y - 1 == to.point.y) {
                from.direction = Direction.LEFT_UP;
            }
        }
        if (this.turn_dir != from.direction) {
            this.turn_dir = from.direction;
            return true;
        }
        return false;
    };
    __egretProto__.resetNode = function (node, gValue, parent) {
        node.parent = parent;
        node.gValue = gValue;
        node.hValue = this.setHValue(node, this.targetNode);
        node.fValue = node.gValue + node.hValue;
    };
    __egretProto__.setHValue = function (node, targetNode) {
        var nodeX = node.point.x * 120 + (node.point.y & 1) * 60;
        var endX = targetNode.point.x * 120 + (targetNode.point.y & 1) * 60;
        var h = Math.abs(endX - nodeX) + Math.abs(targetNode.point.y - node.point.y) * 30;
        return h;
    };
    __egretProto__.pushNodeToOpenList = function (node) {
        this.mapData[node.point.y][node.point.x].inOpenList = true;
        if (this.openList.length == 0) {
            this.openList.push(this.getNodeFromPool(-1, -1));
            this.openList.push(node);
        }
        else {
            this.openList.push(node);
            var last = this.openList.length - 1;
            while (last > 1) {
                var half = last >> 1;
                if (this.openList[last].fValue >= this.openList[half].fValue) {
                    break;
                }
                var tmpNode = this.openList[last];
                this.openList[last] = this.openList[half];
                this.openList[half] = tmpNode;
                last = last >> 1;
            }
        }
    };
    __egretProto__.shiftNodeFromOpenList = function () {
        var shiftNode = this.openList[1];
        var last = this.openList.length - 1;
        this.openList[1] = this.openList[last];
        this.openList.pop();
        last = this.openList.length - 1;
        var head = 1;
        while ((head << 1) + 1 <= last) {
            var child1 = head << 1;
            var child2 = child1 + 1;
            var childMin = this.openList[child1].fValue < this.openList[child2].fValue ? child1 : child2;
            if (this.openList[head].fValue <= this.openList[childMin].fValue) {
                break;
            }
            var tmpNode = this.openList[head];
            this.openList[head] = this.openList[childMin];
            this.openList[childMin] = tmpNode;
            head = childMin;
        }
        return shiftNode;
    };
    __egretProto__.resetOpenListByNode = function (node, index) {
        var last = index;
        while (last > 1) {
            var half = last >> 1;
            if (this.openList[last].fValue >= this.openList[half].fValue) {
                break;
            }
            var tmpNode = this.openList[last];
            this.openList[last] = this.openList[half];
            this.openList[half] = tmpNode;
            last = last >> 1;
        }
    };
    __egretProto__.getNodeFromPool = function (posX, posY) {
        var node;
        if (this.aNodePool.length != 0) {
            node = this.aNodePool.shift();
            node.updatePos(posX, posY);
        }
        else {
            node = new ANode(posX, posY);
        }
        node.indexOpenList = -1;
        node.parent = null;
        return node;
    };
    __egretProto__.clearNodes = function () {
        var node;
        while (this.openList.length) {
            node = this.openList.shift();
            if (node.point.x == -1 && node.point.y == -1) {
            }
            else {
                this.mapData[node.point.y][node.point.x].inCloseList = false;
                this.mapData[node.point.y][node.point.x].inOpenList = false;
            }
            node.updatePos(-1, -1);
            node.parent = null;
            node.direction = -1;
            node.indexOpenList = -1;
            node.addValue = node.fValue = node.gValue = node.hValue = -1;
            this.aNodePool.push(node);
        }
        while (this.closeList.length) {
            node = this.closeList.shift();
            this.mapData[node.point.y][node.point.x].inCloseList = false;
            this.mapData[node.point.y][node.point.x].inOpenList = false;
            node.updatePos(-1, -1);
            node.parent = null;
            node.direction = -1;
            node.indexOpenList = -1;
            node.addValue = node.fValue = node.gValue = node.hValue = -1;
            this.aNodePool.push(node);
        }
    };
    __egretProto__.getNode = function (posX, posY, node) {
        var aNode;
        if (posX == this.targetNode.point.x && posY == this.targetNode.point.y) {
            aNode = this.targetNode;
            this.getTarget = true;
            return aNode;
        }
        if (this.mapData[posY][posX].inOpenList) {
            for (var i = 0; i < this.openList.length; i++) {
                if (this.openList[i].point.x == posX && this.openList[i].point.y == posY) {
                    aNode = this.openList[i];
                    aNode.indexOpenList = i;
                    return aNode;
                }
            }
        }
        return this.getNodeFromPool(posX, posY);
    };
    __egretProto__.setAddValue = function (childNode, parentNode) {
        if (childNode.point.x == parentNode.point.x) {
            childNode.addValue = 60;
        }
        else if (childNode.point.y == parentNode.point.y) {
            childNode.addValue = 120;
        }
        else {
            childNode.addValue = 67;
        }
    };
    __egretProto__.canCrossAndNotInCloseList = function (newX, newY) {
        if (newX < 0 || newY < 0 || newX > this.mapData[0].length - 1 || newY > this.mapData.length - 1)
            return false;
        if (this.mapData[newY][newX] && this.mapData[newY][newX].canCross && !this.mapData[newY][newX].inCloseList) {
            return true;
        }
        else {
            return false;
        }
    };
    __egretProto__.canCrossNode = function (posX, posY) {
        if (posX < 0 || posY < 0 || posX > this.mapData[0].length - 1 || posY > this.mapData.length - 1)
            return false;
        if (this.mapData[posY][posX] && this.mapData[posY][posX].canCross) {
            return true;
        }
        else {
            return false;
        }
    };
    __egretProto__.getAroundNodes = function (currentNode) {
        var posX = currentNode.point.x;
        var posY = currentNode.point.y;
        var array = [];
        var self = this;
        function add(posX, posY) {
            var childNode = self.getNode(posX, posY, currentNode);
            self.setAddValue(childNode, currentNode);
            array.push(childNode);
        }
        if (posY % 2 == 1) {
            var upNode;
            var newX = posX;
            var newY = posY - 2;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                if (this.canCrossNode(newX, newY + 1) || this.canCrossNode(newX + 1, newY + 1)) {
                    add(newX, newY);
                }
            }
            var rightUpNode;
            newX = posX + 1;
            newY = posY - 1;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                add(newX, newY);
            }
            var rightNode;
            newX = posX + 1;
            newY = posY;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                if (this.canCrossNode(newX, newY - 1) || this.canCrossNode(newX, newY + 1)) {
                    add(newX, newY);
                }
            }
            var rightDownNode;
            newX = posX + 1;
            newY = posY + 1;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                add(newX, newY);
            }
            var downNode;
            newX = posX;
            newY = posY + 2;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                if (this.canCrossNode(newX, newY - 1) || this.canCrossNode(newX + 1, newY - 1)) {
                    add(newX, newY);
                }
            }
            var leftDownNode;
            newX = posX;
            newY = posY + 1;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                add(newX, newY);
            }
            var leftNode;
            newX = posX - 1;
            newY = posY;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                if (this.canCrossNode(newX + 1, newY - 1) || this.canCrossNode(newX + 1, newY + 1)) {
                    add(newX, newY);
                }
            }
            var leftUpNode;
            newX = posX;
            newY = posY - 1;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                add(newX, newY);
            }
        }
        else {
            var upNode;
            var newX = posX;
            var newY = posY - 2;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                if (this.canCrossNode(newX - 1, newY + 1) || this.canCrossNode(newX, newY + 1)) {
                    add(newX, newY);
                }
            }
            var rightUpNode;
            newX = posX;
            newY = posY - 1;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                add(newX, newY);
            }
            var rightNode;
            newX = posX + 1;
            newY = posY;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                if (this.canCrossNode(newX - 1, newY - 1) || this.canCrossNode(newX - 1, newY + 1)) {
                    add(newX, newY);
                }
            }
            var rightDownNode;
            newX = posX;
            newY = posY + 1;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                add(newX, newY);
            }
            var downNode;
            newX = posX;
            newY = posY + 2;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                if (this.canCrossNode(newX - 1, newY - 1) || this.canCrossNode(newX, newY - 1)) {
                    add(newX, newY);
                }
            }
            var leftDownNode;
            newX = posX - 1;
            newY = posY + 1;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                add(newX, newY);
            }
            var leftNode;
            newX = posX - 1;
            newY = posY;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                if (this.canCrossNode(newX, newY - 1) || this.canCrossNode(newX, newY + 1)) {
                    add(newX, newY);
                }
            }
            var leftUpNode;
            newX = posX - 1;
            newY = posY - 1;
            if (this.canCrossAndNotInCloseList(newX, newY)) {
                add(newX, newY);
            }
        }
        return array;
    };
    __egretProto__.searchPath = function () {
        while (this.openList.length > 1 && !this.getTarget) {
            var currentNode = this.shiftNodeFromOpenList();
            this.closeList.push(currentNode);
            this.mapData[currentNode.point.y][currentNode.point.x].inCloseList = true;
            var aroundNodes = this.getAroundNodes(currentNode);
            for (var i = 0; i < aroundNodes.length; i++) {
                if (aroundNodes[i].indexOpenList != -1) {
                    var newGValue = currentNode.gValue + aroundNodes[i].addValue;
                    if (newGValue < aroundNodes[i].gValue) {
                        this.resetNode(aroundNodes[i], newGValue, currentNode);
                        this.resetOpenListByNode(aroundNodes[i], aroundNodes[i].indexOpenList);
                    }
                }
                else {
                    var newGValue = currentNode.gValue + aroundNodes[i].addValue;
                    this.resetNode(aroundNodes[i], newGValue, currentNode);
                    this.pushNodeToOpenList(aroundNodes[i]);
                }
            }
        }
    };
    return AStarUtils;
})();
AStarUtils.prototype.__class__ = "AStarUtils";
