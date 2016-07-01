/**
 * Created by sunzg on 15/9/15.
 */
class MapBuilding{

    private _x:number;
    private _y:number;
    private _offsetX:number;
    private _offsetY:number;
    private _resName:string;
    private _res:egret.gui.UIAsset;
    private _parent:egret.gui.Group;

    public index:number=0;

    constructor(_x,_y,_offsetY,_resName,_parent){
        this._x=_x;
        this._y=_y;
        this._offsetY=parseInt(_offsetY);

        this._resName=_resName;
        this._parent=_parent;

        this._res=new egret.gui.UIAsset();
        this._res.source=_resName;

        this._res.x=_x;
        this._res.y=_y;
        this._parent.addElement(this._res);

//        this._res.addEventListener(egret.TouchEvent.TOUCH_TAP,this.setOffsetY,this);
    }

    private setOffsetY(evt:egret.TouchEvent){
        console.log("index:::",this.index,"   offsetY:::",evt.localY);
        this._offsetY=evt.localY;
    }

    public get y():number{
        return this._y+this._offsetY;
    }

    public addParent(){
        this._parent.addElement(this._res);
    }
}