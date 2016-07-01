/**
 * Created by sunzg on 15/7/22.
 */
class PathNode extends egret.Point{

    public direction:number=-1;

    public up:number;
    public down:number;
    public left:number;
    public right:number;

    public is_turn=false;

    constructor(x,y,direction,size){
        super();
        this.x=x;
        this.y=y;
        this.direction=direction;
        this.left=this.x*size;
        this.right=this.left+size;
        this.up=this.y*size;
        this.down=this.up+size;

    }
}