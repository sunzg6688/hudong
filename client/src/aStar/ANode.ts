/**
 * Created by sunzg on 15/7/20.
 */
class ANode{
    public point:egret.Point;
    public parent:ANode;
    public canCross:boolean;
    public gValue:number;
    public hValue:number;
    public fValue:number;
    public addValue:number;
    public indexOpenList:number=-1;
    //根据钟表区分:0-上，1-右上，3-右，4-右下，6-下，7-左下，9-左，10-左上
    public direction:number=-1;

    constructor(posX,posY,canCross:boolean=true){
        this.point=new egret.Point(posX,posY);
    }

    public updatePos(posX,posY){
        this.point.x=posX;
        this.point.y=posY;
    }
}