/**
 * Created by sunzg on 15/9/16.
 */
class BuildingIconRenderer extends egret.gui.ItemRenderer{

    public resName:string="";
    public res:egret.gui.UIAsset;

    constructor(){
        super();
        this.skinName="editorMapBuilding.BuildingIconRendererSkin";

        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.begin,this);
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.move,this);
        this.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE,this.outSide,this);
        this.addEventListener(egret.TouchEvent.TOUCH_END,this.end,this);
    }

    public dataChanged(){
        super.dataChanged();

        this.resName=this.data.resName;
        this.res.source=this.data.resName;

    }

    private canSeleted:boolean=false;
    public begin(){
        this.canSeleted=true;
        egret.setTimeout(this.seletedMe,this,1500);
    }

    public outSide(){
        this.canSeleted=false;
    }

    public end(){
        this.canSeleted=false;
    }

    public move(){
    }

    public seletedMe(){
        if(this.canSeleted){
            MapBuildingGroup.me.createBuilding(this.data);
        }
    }

}