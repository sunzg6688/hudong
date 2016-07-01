/**
 * Created by sunzg on 15/7/20.
 */
class MapTileDesc{
    public x:number;
    public y:number;
    public canCross:boolean;
    public source:string;
    //0普通地图点，1起点，2终点，3npc，4建筑物...
    public type:number=0;


    public up:any;
    public right:any;
    public down:any;
    public left:any;

    public inCloseList:boolean=false;
    public inOpenList:boolean=false;

    constructor(x,y,canCross,type,source){
        this.x=x;
        this.y=y;
        this.canCross=canCross;
        this.type=type;
        this.source=source;
    }
}