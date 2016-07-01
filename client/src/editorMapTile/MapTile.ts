/**
 * Created by sunzg on 15/7/20.
 */
class MapTile extends egret.Sprite{
    public point:egret.Point;
    public canCross:boolean;
    public size:number;
    public mapType:number=0;//0普通地形（包含可通过和不可通过），1起点，2终点 ...
    public txt:egret.TextField=new egret.TextField();
    private bg:egret.Bitmap=new egret.Bitmap();
    private bgSize:number=120;
    constructor(point:egret.Point,canCross,mapType,size:number){
        super();
        this.point=point;
        this.canCross=canCross;
        this.size=this.width=size;
        this.height=this.size/2;
        this.mapType=mapType;
        this.bg.alpha=0.5;
        this.bg.scaleX=this.bg.scaleY=(this.size/this.bgSize);
        this.addChild(this.bg);
        if(canCross){
            this.drawCanCross();
        }else{
            this.drawNotCanCross();
        }
    }

    public resetSize(size=120){
        this.size=this.width=size;
        this.height=size/2;
        this.bg.scaleX=this.bg.scaleY=(size/this.bgSize);
        this.drawCanCross();
    }

    public drawCanCross(){
        this.graphics.clear();
        this.bg.visible=false;

    }

    public drawNotCanCross(){
        this.drawBorder();
        this.bg.visible=true;
        this.bg.texture=RES.getRes("notCross");
    }

    public drawStart(){
        this.drawBorder();
        this.bg.visible=true;
        this.bg.texture=RES.getRes("start");
    }

    public drawTarget(){
        this.drawBorder();
        this.bg.visible=true;
        this.bg.texture=RES.getRes("target");
    }

    public drawPath(dir){
        var dirDesc:string=""
        if(dir==Direction.UP){
            dirDesc="上";
        }else if(dir==Direction.RIGHT_UP){
            dirDesc="右上";
        }else if(dir==Direction.RIGHT){
            dirDesc="右";
        }else if(dir==Direction.RIGHT_DOWN){
            dirDesc="右下";
        }else if(dir==Direction.DOWN){
            dirDesc="下";
        }else if(dir==Direction.LEFT_DOWN){
            dirDesc="左下";
        }else if(dir==Direction.LEFT){
            dirDesc="左";
        }else if(dir==Direction.LEFT_UP){
            dirDesc="左上";
        }
        this.drawBorder(dirDesc);
        this.bg.visible=true;
        this.bg.texture=RES.getRes("path");
    }


    public drawPath2(dir){
        var dirDesc:string=""
        if(dir==Direction.UP){
            dirDesc="上";
        }else if(dir==Direction.RIGHT_UP){
            dirDesc="右上";
        }else if(dir==Direction.RIGHT){
            dirDesc="右";
        }else if(dir==Direction.RIGHT_DOWN){
            dirDesc="右下";
        }else if(dir==Direction.DOWN){
            dirDesc="下";
        }else if(dir==Direction.LEFT_DOWN){
            dirDesc="左下";
        }else if(dir==Direction.LEFT){
            dirDesc="左";
        }else if(dir==Direction.LEFT_UP){
            dirDesc="左上";
        }
        this.graphics.lineStyle(0x0,0.8);
        this.graphics.moveTo(this.width/2,0);
        this.graphics.lineTo(this.width,this.height/2);
        this.graphics.lineTo(this.width/2,this.height);
        this.graphics.lineTo(0,this.height/2);
        this.graphics.lineTo(this.width/2,0);
        this.bg.visible=true;
        this.bg.texture=RES.getRes("path");

        this.drawBorder(dirDesc);

    }

    public drawPath3(dir){
        var dirDesc:string=""
        if(dir==Direction.UP){
            dirDesc="上";
        }else if(dir==Direction.RIGHT_UP){
            dirDesc="右上";
        }else if(dir==Direction.RIGHT){
            dirDesc="右";
        }else if(dir==Direction.RIGHT_DOWN){
            dirDesc="右下";
        }else if(dir==Direction.DOWN){
            dirDesc="下";
        }else if(dir==Direction.LEFT_DOWN){
            dirDesc="左下";
        }else if(dir==Direction.LEFT){
            dirDesc="左";
        }else if(dir==Direction.LEFT_UP){
            dirDesc="左上";
        }
        this.graphics.lineStyle(0x0,0.8);
        this.graphics.moveTo(this.width/2,0);
        this.graphics.lineTo(this.width,this.height/2);
        this.graphics.lineTo(this.width/2,this.height);
        this.graphics.lineTo(0,this.height/2);
        this.graphics.lineTo(this.width/2,0);
        this.bg.visible=true;
        this.bg.texture=RES.getRes("target");
        this.drawBorder(dirDesc);

    }

    private drawBorder(dir:string=""){
        /*画菱形*/
        //this.graphics.lineStyle(0x0,0.8);
        //this.graphics.moveTo(this.width/2,0);
        //this.graphics.lineTo(this.width,this.height/2);
        //this.graphics.lineTo(this.width/2,this.height);
        //this.graphics.lineTo(0,this.height/2);
        //this.graphics.lineTo(this.width/2,0);

        /*画边框*/
//        if(this.point.x==2&&this.point.y==4){
//            this.graphics.lineTo(this.width,0);
//            this.graphics.lineTo(this.width,this.height);
//            this.graphics.lineTo(0,this.height);
//            this.graphics.lineTo(0,0);
//            this.graphics.lineTo(this.width/2,0);
//        }
//

        this.txt.size=10;
        this.txt.alpha=0.3;
        this.txt.textColor=0;
        this.txt.x=5;
        this.txt.y=10;
//        if(dir!=""){
//            this.txt.text="  "+dir+" ";
//        }else{
//            this.txt.text="("+this.point.x+" "+this.point.y+")";
//        }
        this.txt.text="("+this.point.x+" "+this.point.y+")";
        this.addChild(this.txt);

    }
}