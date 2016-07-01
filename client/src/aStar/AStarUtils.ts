/**
 * Created by sunzg on 15/9/15.
 */
class AStarUtils{

    private mapData:Array<any>=[];
    private openList:Array<ANode>=[];
    private closeList:Array<ANode>=[];
    private startNode:ANode;
    private targetNode:ANode;
    private tileMapSize:number;

    constructor(){

    }

    private startTime:number=0;
    public getPaths(start:egret.Point,target:egret.Point,mapData:any,tileMapSize):any{
        this.mapData=mapData;
        this.tileMapSize=tileMapSize;
        if(!this.canCrossNode(target.x,target.y)){
            //console.log("目标点无法到达==>目标点不是可穿越类型");
            //return false;
            return [];
        }
        this.startTime=egret.getTimer();
        this.targetNode=this.getNodeFromPool(target.x,target.y);
        this.startNode=this.getNodeFromPool(start.x,start.y);
        this.resetNode(this.startNode,0,null)
        this.pushNodeToOpenList(this.startNode);
        this.getTarget=false;
        this.searchPath();
        return this.getPathNodes();
    }

    private getPathNodes(){
        var pathNode:ANode;
        if(this.targetNode.parent){
            pathNode=this.targetNode;
        }else{
            //console.log("目标点无法到达==>无法搜索到有效路径,给出离目标最近的点");
            for(var i=0;i<this.closeList.length;i++){
                if(i==0){
                    pathNode=this.closeList[i];
                }else{
                    if(this.closeList[i].hValue<pathNode.hValue){
                        pathNode=this.closeList[i];
                    }
                }
            }
        }
        var path:Array<any>=[];
        var childNode:ANode;
        while(pathNode.parent){
            var run_path_node:PathNode=new PathNode(pathNode.point.x,pathNode.point.y,pathNode.direction,this.tileMapSize);
            path.unshift(run_path_node);
            childNode=pathNode;
            pathNode=pathNode.parent;
            if(this.setNodeDirection(pathNode,childNode)){
                run_path_node.is_turn=true;
            }
        }

        this.setNodeDirection(this.startNode,childNode);
        path.unshift(new PathNode(this.startNode.point.x,this.startNode.point.y,this.startNode.direction,this.tileMapSize));
//        console.log("寻路消耗的时间为:"+(egret.getTimer()-this.startTime));
        //console.log(path);
        if(path.length>1){
            path[path.length-1].direction=path[path.length-2].direction;
        }else{
            path[path.length-1].direction=4;
        }
        this.clearNodes();
        return path;
    }

    private turn_dir;

    private setNodeDirection(from:ANode,to:ANode){
        if(!to)return true;
        if(from.point.x==to.point.x&&from.point.y-2==to.point.y){
            from.direction=Direction.UP;
        }else if(from.point.x==to.point.x&&from.point.y+2==to.point.y){
            from.direction=Direction.DOWN;
        }else if(from.point.x-1==to.point.x&&from.point.y==to.point.y){
            from.direction=Direction.LEFT;
        }else if(from.point.x+1==to.point.x&&from.point.y==to.point.y){
            from.direction=Direction.RIGHT;
        }

        if(from.point.y&1){
            if(from.point.x+1==to.point.x&&from.point.y-1==to.point.y){
                from.direction=Direction.RIGHT_UP;
            }else if(from.point.x+1==to.point.x&&from.point.y+1==to.point.y){
                from.direction=Direction.RIGHT_DOWN;
            }else if(from.point.x==to.point.x&&from.point.y+1==to.point.y){
                from.direction=Direction.LEFT_DOWN;
            }else if(from.point.x==to.point.x&&from.point.y-1==to.point.y){
                from.direction=Direction.LEFT_UP;
            }
        }else{
            if(from.point.x==to.point.x&&from.point.y-1==to.point.y){
                from.direction=Direction.RIGHT_UP;
            }else if(from.point.x==to.point.x&&from.point.y+1==to.point.y){
                from.direction=Direction.RIGHT_DOWN;
            }else if(from.point.x-1==to.point.x&&from.point.y+1==to.point.y){
                from.direction=Direction.LEFT_DOWN;
            }else if(from.point.x-1==to.point.x&&from.point.y-1==to.point.y){
                from.direction=Direction.LEFT_UP;
            }
        }

        if(this.turn_dir!=from.direction){
            this.turn_dir=from.direction;
            return true;
        }
        return false;
    }

    private resetNode(node:ANode,gValue:number,parent:ANode){
        node.parent=parent;
        node.gValue=gValue;
        node.hValue=this.setHValue(node,this.targetNode);
        node.fValue=node.gValue+node.hValue;
    }

    private setHValue(node:ANode,targetNode:ANode):number{
        var nodeX= node.point.x * 120 + ( node.point.y & 1 ) * 60;
        var endX= targetNode.point.x*120 + ( targetNode.point.y & 1 ) * 60;
        var h=Math.abs (endX - nodeX ) + Math.abs( targetNode.point.y - node.point.y ) * 30;
        return h;
    }

    private pushNodeToOpenList(node:ANode){
        this.mapData[node.point.y][node.point.x].inOpenList=true;

        if(this.openList.length==0){
            this.openList.push(this.getNodeFromPool(-1,-1));
            this.openList.push(node);
        }else{
            this.openList.push(node);
            var last = this.openList.length - 1;
            while (last > 1)
            {
                var half = last>>1;
                if(this.openList[last].fValue>=this.openList[half].fValue)
                {
                    break;
                }
                var tmpNode = this.openList[last];
                this.openList[last] = this.openList[half];
                this.openList[half] = tmpNode;
                last=last>>1;
            }
        }
    }

    private shiftNodeFromOpenList():ANode{
        var shiftNode:ANode=this.openList[1];
        var last = this.openList.length - 1;
        this.openList[1] = this.openList[last];
        this.openList.pop();
        last = this.openList.length - 1;
        var head = 1;
        while((head<<1)+1 <= last)
        {
            var child1 = head<<1;
            var child2 = child1+1;
            var childMin = this.openList[child1].fValue<this.openList[child2].fValue?child1:child2;
            if(this.openList[head].fValue<=this.openList[childMin].fValue)
            {
                break;
            }
            var tmpNode = this.openList[head];
            this.openList[head] = this.openList[childMin];
            this.openList[childMin] = tmpNode;
            head = childMin;
        }
        return shiftNode;
    }

    private resetOpenListByNode(node:ANode,index){
        var last = index;
        while (last > 1)
        {
            var half = last>>1;
            if(this.openList[last].fValue>=this.openList[half].fValue)
            {
                break;
            }
            var tmpNode = this.openList[last];
            this.openList[last] = this.openList[half];
            this.openList[half] = tmpNode;
            last=last>>1;
        }
    }

    private aNodePool:Array<ANode>=[];
    private getNodeFromPool(posX,posY):ANode{
        var node:ANode;
        if(this.aNodePool.length!=0){
            node=this.aNodePool.shift();
            node.updatePos(posX,posY);

        }else{
            node=new ANode(posX,posY);
        }
        node.indexOpenList=-1;
        node.parent=null;
        return node;
    }

    private clearNodes(){
        var node:ANode;
        while(this.openList.length){
            node=this.openList.shift();

            if(node.point.x==-1&&node.point.y==-1){

            }else{
                this.mapData[node.point.y][node.point.x].inCloseList=false;
                this.mapData[node.point.y][node.point.x].inOpenList=false;
            }

            node.updatePos(-1,-1);
            node.parent=null;
            node.direction=-1;
            node.indexOpenList=-1;
            node.addValue=node.fValue=node.gValue=node.hValue=-1;
            this.aNodePool.push(node);
        }
        while(this.closeList.length){
            node=this.closeList.shift();

            this.mapData[node.point.y][node.point.x].inCloseList=false;
            this.mapData[node.point.y][node.point.x].inOpenList=false;

            node.updatePos(-1,-1);
            node.parent=null;
            node.direction=-1;
            node.indexOpenList=-1;
            node.addValue=node.fValue=node.gValue=node.hValue=-1;
            this.aNodePool.push(node);
        }
    }

    private getTarget:boolean=false;
    private getNode(posX,posY,node:ANode):ANode{
        var aNode:ANode;
        if(posX==this.targetNode.point.x&&posY==this.targetNode.point.y){
            aNode=this.targetNode;
            this.getTarget=true;
            return aNode;
        }

        if(this.mapData[posY][posX].inOpenList){
            for(var i=0;i<this.openList.length;i++){
                if(this.openList[i].point.x==posX&&this.openList[i].point.y==posY){
                    aNode=this.openList[i];
                    aNode.indexOpenList=i;
                    return aNode;
                }
            }
        }

        return this.getNodeFromPool(posX,posY);
    }

    private setAddValue(childNode:ANode,parentNode:ANode){
        if(childNode.point.x==parentNode.point.x){
            childNode.addValue=60;
        }else if(childNode.point.y==parentNode.point.y){
            childNode.addValue=120;
        }else{
            childNode.addValue=67;
        }
    }

    private canCrossAndNotInCloseList(newX,newY):boolean{
        if(newX<0||newY<0||newX>this.mapData[0].length-1||newY>this.mapData.length-1)return false;
        if(this.mapData[newY][newX]&&this.mapData[newY][newX].canCross&&!this.mapData[newY][newX].inCloseList){
            return true;
        }else{
            return false;
        }
    }

    private canCrossNode(posX,posY):boolean{
        if(posX<0||posY<0||posX>this.mapData[0].length-1||posY>this.mapData.length-1)return false;
        if(this.mapData[posY][posX]&&this.mapData[posY][posX].canCross){
            return true;
        }else{
            return false;
        }
    }

    private getAroundNodes(currentNode:ANode):Array<ANode>{

        var posX=currentNode.point.x;
        var posY=currentNode.point.y;
        var array:Array<ANode>=[];

        var self=this;
        function add(posX,posY){
            var childNode:ANode=self.getNode(posX,posY,currentNode);
            self.setAddValue(childNode,currentNode);
            array.push(childNode);
        }

        if(posY%2==1){

            var upNode:ANode;
            var newX=posX;
            var newY=posY-2;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                if(this.canCrossNode(newX,newY+1)||this.canCrossNode(newX+1,newY+1)){
                    add(newX,newY);
                }
            }

            var rightUpNode:ANode;
            newX=posX+1;
            newY=posY-1;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                add(newX,newY);
            }

            var rightNode:ANode;
            newX=posX+1;
            newY=posY;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                if(this.canCrossNode(newX,newY-1)||this.canCrossNode(newX,newY+1)){
                    add(newX,newY);
                }
            }

            var rightDownNode:ANode;
            newX=posX+1;
            newY=posY+1;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                add(newX,newY);
            }

            var downNode:ANode;
            newX=posX;
            newY=posY+2;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                if(this.canCrossNode(newX,newY-1)||this.canCrossNode(newX+1,newY-1)){
                    add(newX,newY);
                }
            }

            var leftDownNode:ANode;
            newX=posX;
            newY=posY+1;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                add(newX,newY);
            }

            var leftNode:ANode;
            newX=posX-1;
            newY=posY;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                if(this.canCrossNode(newX+1,newY-1)||this.canCrossNode(newX+1,newY+1)){
                    add(newX,newY);
                }
            }

            var leftUpNode:ANode;
            newX=posX;
            newY=posY-1;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                add(newX,newY);
            }

        }else{

            var upNode:ANode;
            var newX=posX;
            var newY=posY-2;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                if(this.canCrossNode(newX-1,newY+1)||this.canCrossNode(newX,newY+1)){
                    add(newX,newY);
                }
            }

            var rightUpNode:ANode;
            newX=posX;
            newY=posY-1;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                add(newX,newY);
            }

            var rightNode:ANode;
            newX=posX+1;
            newY=posY;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                if(this.canCrossNode(newX-1,newY-1)||this.canCrossNode(newX-1,newY+1)){
                    add(newX,newY);
                }
            }

            var rightDownNode:ANode;
            newX=posX;
            newY=posY+1;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                add(newX,newY);
            }

            var downNode:ANode;
            newX=posX;
            newY=posY+2;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                if(this.canCrossNode(newX-1,newY-1)||this.canCrossNode(newX,newY-1)){
                    add(newX,newY);
                }
            }

            var leftDownNode:ANode;
            newX=posX-1;
            newY=posY+1;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                add(newX,newY);
            }

            var leftNode:ANode;
            newX=posX-1;
            newY=posY;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                if(this.canCrossNode(newX,newY-1)||this.canCrossNode(newX,newY+1)){
                    add(newX,newY);
                }
            }

            var leftUpNode:ANode;
            newX=posX-1;
            newY=posY-1;
            if(this.canCrossAndNotInCloseList(newX,newY)){
                add(newX,newY);
            }
        }
        return array;
    }

    private searchPath(){
        while(this.openList.length>1&&!this.getTarget){
            var currentNode:ANode=this.shiftNodeFromOpenList();
            this.closeList.push(currentNode);
            this.mapData[currentNode.point.y][currentNode.point.x].inCloseList=true;
            var aroundNodes:Array<ANode>=this.getAroundNodes(currentNode);
            for(var i=0;i<aroundNodes.length;i++){
                if(aroundNodes[i].indexOpenList!=-1){
                    var newGValue=currentNode.gValue+aroundNodes[i].addValue;
                    if(newGValue<aroundNodes[i].gValue){
                        this.resetNode(aroundNodes[i],newGValue,currentNode);
                        this.resetOpenListByNode(aroundNodes[i],aroundNodes[i].indexOpenList);
                    }
                }else{
                    var newGValue=currentNode.gValue+aroundNodes[i].addValue;
                    this.resetNode(aroundNodes[i],newGValue,currentNode);
                    this.pushNodeToOpenList(aroundNodes[i]);
                }
            }
        }
    }
}