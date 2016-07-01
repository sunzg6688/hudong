/**
 * Created by sunzg on 15/9/16.
 */
class Building extends egret.gui.UIAsset{

    public resName:string;

    private resBitmap:egret.Bitmap=new egret.Bitmap();
    private resSprite:egret.Sprite=new egret.Sprite();

    private _offsetY=0;
    public canSetOffsetY:boolean=false;

    constructor(){
        super();
        this.touchEnabled=true;
        this.touchChildren=true;
        this.resSprite.touchEnabled=true;
        this.resSprite.addEventListener(egret.TouchEvent.TOUCH_TAP,this.setPosY,this);
    }


    public drawReEditor(){
        this.canSetOffsetY=false;
        this.resSprite.graphics.clear();
        this.resSprite.graphics.beginFill(0x00ff00,0.7);
        this.resSprite.graphics.drawRect(0,0,this.resBitmap.texture._textureWidth,this.resBitmap.texture._textureHeight);
        this.resSprite.graphics.endFill();

    }

    public setRes(resName){
        this.resName=resName;
        this.resBitmap.texture=RES.getRes(resName);
        this.resSprite.addChild(this.resBitmap);

        this.resSprite.x=-this.resBitmap.texture._textureWidth>>1;
        this.resSprite.y=-this.resBitmap.texture._textureHeight>>1;
        this.source=this.resSprite;

        this.pos.graphics.beginFill(0x000000,1);
        this.pos.graphics.drawRect(0,0,10,10);
        this.pos.graphics.endFill();
        this.resSprite.addChild(this.pos);
    }

    public finishEditor(){
        this.canSetOffsetY=true;
        if(this.pos.x==0&&this.pos.y==0){
            this.resSprite.graphics.clear();
            this.resSprite.graphics.beginFill(0xff0000,0.7);
            this.resSprite.graphics.drawRect(0,0,this.resBitmap.texture._textureWidth,this.resBitmap.texture._textureHeight);
            this.resSprite.graphics.endFill();
        }else{
            this.resSprite.graphics.clear();
        }
    }

    public drawEditor(){
        this.canSetOffsetY=false;
        this.resSprite.graphics.clear();
        this.resSprite.graphics.lineStyle(1,0x00ff00,0.9);
        this.resSprite.graphics.moveTo(0,0);
        this.resSprite.graphics.lineTo(this.resBitmap.texture._textureWidth,0);
        this.resSprite.graphics.lineTo(this.resBitmap.texture._textureWidth,this.resBitmap.texture._textureHeight);
        this.resSprite.graphics.lineTo(0,this.resBitmap.texture._textureHeight);
        this.resSprite.graphics.lineTo(0,0);
    }

    private pos:egret.Sprite=new egret.Sprite();
    private setPosY(evt:egret.TouchEvent){
        if(this.canSetOffsetY){
            this._offsetY=evt.localY-5;
            this.pos.y=evt.localY-5;
            this.pos.x=evt.localX-5;
            this.resSprite.graphics.clear();
        }else{
            MapBuildingGroup.me.setEditorBuilding(this);
        }
    }

    public get posX(){
        return this.resSprite.x+this.x;
    }

    public get posY(){
        return this.resSprite.y+this.y;
    }

    public get offsetY(){
        return this._offsetY;
    }

    public get depthY(){
        return this.posY+this.offsetY;
    }

    public createByConfig(config:any){

        this.resName=config.buildingRes;
        this.resBitmap.texture=RES.getRes(config.buildingRes);
        this.resSprite.addChild(this.resBitmap);

        this.resSprite.x=-this.resBitmap.texture._textureWidth>>1;
        this.resSprite.y=-this.resBitmap.texture._textureHeight>>1;
        this.source=this.resSprite;

        this.x=config._x-this.resSprite.x;
        this.y=config._y-this.resSprite.y;

        this._offsetY=config.offsetY;

        this.pos.graphics.beginFill(0x000000,1);
        this.pos.graphics.drawRect(0,0,10,10);
        this.pos.graphics.endFill();

        this.pos.y=this._offsetY;
        this.resSprite.addChild(this.pos);
    }
}