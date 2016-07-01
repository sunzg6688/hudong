/**
 * Created by sunzg on 15/9/16.
 */
class MapBuildingGroup extends egret.gui.Group{

    public static me:MapBuildingGroup;
    private mapName:string;
    private buildingIcons:BuildingIconList=new BuildingIconList();

    private mapBg:egret.gui.UIAsset=new egret.gui.UIAsset();

    private mapScroller:egret.gui.Scroller;
    private mapContainer:egret.gui.Group;
    private bottomGroup:egret.gui.Group;

    private backButton:egret.gui.Button;

    private scaleBigBtn:egret.gui.Button;
    private scaleSmallBtn:egret.gui.Button;
    private saveConfigBtn:egret.gui.Button;
    private editorBtn:egret.gui.Button;

    constructor(mapName:string){
        super();
        this.mapName=mapName;

        MapBuildingGroup.me=this;

        this.width=Const.screenWidth;
        this.height=Const.screenHeight;

        this.mapContainer=new egret.gui.Group();
        this.mapScroller=new egret.gui.Scroller();
        this.mapScroller.x=0;
        this.mapScroller.y=0;
        this.mapScroller.width=Const.mapWidth;
        this.mapScroller.height=Const.mapHeight;
        this.mapScroller.viewport=this.mapContainer;
        this.addElement(this.mapScroller);

        this.mapBg.source=mapName+"_bg";
        this.mapContainer.addElement(this.mapBg);

        this.buildingIcons.setData(mapName+"_buildingIcon");
        this.buildingIcons.x=Const.mapWidth+10;
        this.addElement(this.buildingIcons);

        /*底部工具栏*/
        this.bottomGroup=new egret.gui.Group();
        this.bottomGroup.layout=new egret.gui.HorizontalLayout();
        this.bottomGroup.y=Const.mapHeight+10;
        this.addElement(this.bottomGroup);

        this.backButton=new egret.gui.Button();
        this.backButton.label="返回打点地图";
        this.backButton.addEventListener(egret.TouchEvent.TOUCH_TAP,this.backMapTileGroup,this);
        this.bottomGroup.addElement(this.backButton);

        this.scaleSmallBtn=new egret.gui.Button();
        this.scaleSmallBtn.label="缩小";
        this.scaleSmallBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.scaleSize,this);
        this.bottomGroup.addElement(this.scaleSmallBtn);

        this.scaleBigBtn=new egret.gui.Button();
        this.scaleBigBtn.label="放大";
        this.scaleBigBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.scaleSize,this);
        this.bottomGroup.addElement(this.scaleBigBtn);

        this.editorBtn=new egret.gui.Button();
        this.editorBtn.label="重新编辑";
        this.editorBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.reEditorBuildings,this);
        this.bottomGroup.addElement(this.editorBtn);

        this.saveConfigBtn=new egret.gui.Button();
        this.saveConfigBtn.label="保存配置";
        this.saveConfigBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.saveBuildingConfig,this);
        this.bottomGroup.addElement(this.saveConfigBtn);


        var laber:egret.gui.Label=new egret.gui.Label();
        laber.textColor=0x00ff00;
        laber.size=30;
        laber.stroke=2;
        laber.text="正在编辑 建筑物！！！";
        laber.y=700;
        laber.x=800;
        this.addElement(laber);


        egret.Ticker.getInstance().register(this.buildingPos,this);

        this.addEventListener(egret.TouchEvent.TOUCH_MOVE,this.mousePos,this);
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.mousePos,this);
        this.addEventListener(egret.TouchEvent.TOUCH_END,this.setBuilding,this);

        this.addEventListener(egret.gui.UIEvent.CREATION_COMPLETE,this.initBuildings,this);

        var self = this;
        document.addEventListener("keydown",function(event:KeyboardEvent){
            //console.log("event.keyCode::::",event.keyCode);
            switch (event.keyCode) {
                case 8://delete
                    self.deleteEditorBuilding();
                    break;
                case 46://delete
                    self.deleteEditorBuilding();
                    break;
                case 13://enter
                    self.setBuildingByEnter();
                    break;
                case 38:
                    self.resetXY(Direction.UP);
                    break;
                case 39:
                    self.resetXY(Direction.RIGHT);
                    break;
                case 40:
                    self.resetXY(Direction.DOWN);
                    break;
                case 37:
                    self.resetXY(Direction.LEFT);
                    break;
            }
        });
    }

    private scaleSize(evt:egret.TouchEvent){
        var scale=this.mapContainer.scaleX;
        if(evt.currentTarget==this.scaleBigBtn){
            scale+=0.1;
        }else{
            scale-=0.1;
        }
        if(scale<0.2){
            scale=0.2;
        }
        if(scale>1){
            scale=1;
        }
        this.mapContainer.scaleX=this.mapContainer.scaleY=scale;
    }

    public deleteEditorBuilding(){
        if(this.editorBuilding){
            var index=this.buildingList.indexOf(this.editorBuilding);
            if(index!=-1){
                this.buildingList.splice(index,1);
            }
            (<egret.gui.Group>this.editorBuilding.parent).removeElement(this.editorBuilding);
            this.editorBuilding=null;
        }
    }

    public buildingList:Array<Building>=[];

    public saveBuildingConfig(){
        console.log("=============建筑物数据=============");
        if(this.buildingList.length==0)return "{}";
        var buildDesc:string='[';
        for(var i=0;i<this.buildingList.length;i++){
            var end:string;
            if(i==this.buildingList.length-1){
                end="}]"
            }else{
                end="},"
            }
            buildDesc+='{"buildingRes":"'+this.buildingList[i].resName+'","_x":'+this.buildingList[i].posX+',"_y":'+this.buildingList[i].posY+',"offsetY":'+this.buildingList[i].offsetY+end;
        }

        console.log(buildDesc);

        return buildDesc;
    }

    private initBuildings(){
        var buildings=RES.getRes(this.mapName+"_buildings");
        if(buildings){
            for(var i=0;i<buildings.length;i++){
                var building:Building=new Building();
                building.createByConfig(buildings[i]);

                this.buildingList.push(building);
                this.mapContainer.addElement(building);
            }
        }

        egret.Ticker.getInstance().register(this.updateDepth,this);

    }

    private updateDepth(){

        var depthArray:Array<any>=[];
        function pushItem(item:Building){
            var index=-1;
            for(var i=0;i<depthArray.length;i++){
                if(item.depthY<=depthArray[i].depthY){
                    index=i;
                    depthArray.splice(i,0,item);
                    break;
                }
            }
            if(index==-1){
                depthArray.push(item);
            }
        }

        for(var i=0;i<this.buildingList.length;i++){
            pushItem(this.buildingList[i]);
        }

        for(var j=0;j<depthArray.length;j++){
            this.mapContainer.addElement(depthArray[j]);
        }
    }

    public setBuilding(){
        if(this.mouseX<0||this.mouseX>Const.mapWidth||this.mouseY<0||this.mouseY>Const.mapHeight){
            if(this.newBuilding){
                this.removeElement(this.newBuilding);
                this.newBuilding=null;
            }
        }else{
            if(this.newBuilding){
                this.newBuilding.x=this.mapContainer.horizontalScrollPosition+this.mouseX;
                this.newBuilding.y=this.mapContainer.verticalScrollPosition+this.mouseY;
                this.mapContainer.addElement(this.newBuilding);
                this.buildingList.push(this.newBuilding);
                this.editorBuilding=this.newBuilding;
                this.editorBuilding.drawEditor();
                this.newBuilding=null;
            }
        }
    }

    private editorBuilding:Building;
    private setBuildingByEnter(){
        if(this.editorBuilding){
            this.editorBuilding.finishEditor();
            this.editorBuilding=null;
        }
    }

    public resetXY(dir){
        if(this.editorBuilding){
            if(dir==Direction.UP){
                this.editorBuilding.y-=1;
            }else if(dir==Direction.DOWN){
                this.editorBuilding.y+=1;
            }else if(dir==Direction.LEFT){
                this.editorBuilding.x-=1;
            }else if(dir==Direction.RIGHT){
                this.editorBuilding.x+=1;
            }
        }
    }

    private backMapTileGroup(evt:egret.TouchEvent){
        Main.main.gotoMapTileGroup(new egret.Point(this.mapContainer.horizontalScrollPosition,this.mapContainer.verticalScrollPosition));
    }

    public setOffset(point:egret.Point){
        this.mapContainer.horizontalScrollPosition=point.x;
        this.mapContainer.verticalScrollPosition=point.y;
    }

    private newBuilding:Building;
    public createBuilding(data){
        var resName=data.resName;
        this.newBuilding=new Building();
        this.newBuilding.setRes(resName);
        this.addElement(this.newBuilding);
    }

    public reEditorBuildings(){
        for(var i=0;i<this.buildingList.length;i++){
            this.buildingList[i].drawReEditor();
        }
    }

    public setEditorBuilding(building:Building){
        for(var i=0;i<this.buildingList.length;i++){
            if(this.buildingList[i]==building){
                this.editorBuilding=this.buildingList[i];
                this.editorBuilding.drawEditor();
            }else{
                this.buildingList[i].finishEditor();
            }
        }
    }

    private buildingPos(){
        if(this.newBuilding){
            this.newBuilding.x=this.mouseX;
            this.newBuilding.y=this.mouseY;
        }
    }

    private mouseX;
    private mouseY;
    private mousePos(evt:egret.TouchEvent){
        if(this.editorBuilding){
            window.alert("正在摆放物品！！！enter or delete ???");
            return;
        }
        this.mouseX=evt.localX;
        this.mouseY=evt.localY;
    }


}