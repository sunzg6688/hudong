/**
 * Created by sunzg on 15/9/13.
 */
class ActionInfo
{
    public start: number;
    public end: number;
    public total: number;
}

class Action{
    public static MOVETIME:number=83;//125;  //1000/8;
    public static STANDTIME:number=100;//166; //1000/6;

    public static MOVE:string="move";
    public static STAND:string="stand";
}

class Actor{

    private _mcName;
    private _mcJson;
    private _mcSheet;
    private _mcFactory:egret.MovieClipDataFactory;
    private _mcData:egret.MovieClipData;

    public mc:egret.MovieClip;
//    public mcSource:egret.Bitmap;
    public _mcOffsetX=-186;
    public _mcOffsetY=-226;

    constructor(mcName:string){

        this._mcName=mcName;
        this._mcJson=RES.getRes(mcName+"_json");
        this._mcSheet=RES.getRes(mcName+"_sheet");
        this._mcFactory=new egret.MovieClipDataFactory(this._mcJson,this._mcSheet);
        this._mcData=this._mcFactory.generateMovieClipData(this._mcName);
        this.mc=new egret.MovieClip(this._mcData);
        this.mc.x=this._mcOffsetX;
        this.mc.y=this._mcOffsetY;
//        this.mcSource=new egret.Bitmap();
//        this.mcSource.x=-186;
//        this.mcSource.y=-226;
        this._InitActionData();

        egret.Ticker.getInstance().register(this._Play,this);
        this.playAction(Action.STAND,7);
    }

    private _actions={};
    private _InitActionData(){
        var labels:any[] = this._mcData.labels;
        var len:number = labels.length;
        var obj:any;
        var start:number;
        var end:number = this._mcData.numFrames;
        for (var i:number = len - 1; i > -1; i--)
        {
            obj = labels[i];
            start = obj.frame;
            var actionInfo: ActionInfo=new ActionInfo();
            actionInfo.start = start;
            actionInfo.end = end;
            actionInfo.total = end - start;
            this._actions[obj.name] = actionInfo;
            end = start;
        }
    }


    private _currentTime=0;
    private _frameTime=0;
    private _prevTimeFrame=0;
    private _currentFrame=0;
    private _endFrame=0;
    private _actionTotalFrames=0;

    private _Play(dif){
        this._currentTime+=dif;
        while(this._currentTime>=this._frameTime){
            this._currentTime-=this._frameTime;
            this._currentFrame++;
        }
        if(this._prevTimeFrame!=this._currentFrame){
            if(this._currentFrame>=this._endFrame){
                this._currentFrame-=this._actionTotalFrames;
            }
            this._prevTimeFrame=this._currentFrame;
            this.mc.gotoAndStop(this._currentFrame);
//            this.mcSource.texture=this._mcData.getTextureByFrame(this._currentFrame);
        }
    }

    private _action;
    private _dir;
    private _move_dir;
    public playAction(action:string,dir:number){
        var scale=1;
        var _mcOffsetX=-186;
        var move_dir=dir;

        switch (dir){
            case Direction.UP:
                dir=0;
                break;
            case Direction.RIGHT_UP:
                dir=1;
                break;
            case Direction.RIGHT:
                dir=2;
                break;
            case Direction.RIGHT_DOWN:
                dir=3;
                break;
            case Direction.DOWN:
                dir=4;
                break;
            case Direction.LEFT_DOWN:
                dir=3;
                scale=-1;
                _mcOffsetX=186;
                break;
            case Direction.LEFT:
                dir=2;
                scale=-1;
                _mcOffsetX=186;
                break;
            case Direction.LEFT_UP:
                dir=1;
                scale=-1;
                _mcOffsetX=186;
                break;
            default :
                dir=4;
                scale=1;
                _mcOffsetX=-186;
                break;
        }
        //因为 dir被重置了。 比如从 1 到 10 转向运行时，下面的内容就不会运行。所以用move_dir 来判断
        if(this._move_dir!=move_dir||this._action!=action){
            this._dir=dir;
            this._action=action;
            this._move_dir=move_dir;

            var actionName=action+"_"+dir;
            var actionInfo:ActionInfo=this._actions[actionName];
            if(actionInfo){
                this._currentFrame=actionInfo.start+2;
                this._endFrame=actionInfo.end;
                this._actionTotalFrames=actionInfo.total;

                this._frameTime=action==Action.MOVE?Action.MOVETIME:Action.STANDTIME;
                this._prevTimeFrame=this._currentFrame;
                this._currentTime=0;
                this.mc.scaleX=scale;
                this.mc.x=_mcOffsetX;
                this._mcOffsetX=_mcOffsetX;
                this.mc.gotoAndStop(this._currentFrame);
                //this.mcSource.scaleX=scale;
                //this.mcSource.texture=this._mcData.getTextureByFrame(this._currentFrame);
            }
        }
    }

    public move(path:Array<PathNode>,roleUI){
        egret.Tween.get(roleUI)
    }

}