/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     */
    private loadingView: LoadingUI;
    public static main;

    public static scene;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        Main.main=this;
    }

    private onAddToStage(event: egret.Event) {

        //注入自定义的素材解析器
        egret.Injector.mapClass("egret.gui.IAssetAdapter", AssetAdapter);
        //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
        egret.gui.Theme.load("resource/theme.thm");
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
    }
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    }
    /**
     * preload资源组加载完成
     */

    public egretNet:EgretNet;
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            //this.createScene();
            this.readyConnect();
        }
    }

    /**
    * 资源组加载出错
    */
    private onResourceLoadError(event: RES.ResourceEvent): void {
        //TODO
        console.warn("Group:" + event.groupName + " 中有加载失败的项目");
        //忽略加载失败的项目
        this.onResourceLoadComplete(event);
    }
    /**
     * preload资源组加载进度
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    public readyConnect(){
        this.egretNet=new EgretNet();
        var win:any=window;
        win.egretLoaded=true;
        console.log("pc resource loaded, ready for connect");
    }

    private bgLayer: egret.Sprite;
    private guiLayer: egret.gui.UIStage;

    /**
     * 创建场景界面
     */

    public mapBuildingGroup:MapBuildingGroup;
    public mapTileGroup:MapTileGroup;

    public mapId="m_home"

    //hall
    //public static actorPosX=2000;
    //public static actorPosY=2000;

    //f_home or m_home
    public static actorPosX=700;
    public static actorPosY=700;

    private mapIdConfig;

    private mainActor;

    private createScene(user): void {

        this.mainActor=user;
        this.mapIdConfig=RES.getRes("mapIdConfig");

        this.mapId=this.mapIdConfig.defalut_map;

        var mapArray=this.mapIdConfig.mapArray;

        for(var i=0;i<mapArray.length;i++){
            if(this.mapId==mapArray[i].name);
            Main.actorPosX=mapArray[i].posX;
            Main.actorPosY=mapArray[i].posY;
        }

        this.bgLayer = new egret.Sprite();
        this.bgLayer.graphics.beginFill(0xeeeeee);
        this.bgLayer.graphics.drawRect(0,0,1125,750);
        this.bgLayer.graphics.endFill();
        this.addChild(this.bgLayer);

        //GUI的组件必须都在这个容器内部,UIStage会始终自动保持跟舞台一样大小。
        this.guiLayer = new egret.gui.UIStage();
        this.addChild(this.guiLayer);

        this.mapBuildingGroup=new MapBuildingGroup(this.mapId);
        this.mapBuildingGroup.visible=false;
        this.guiLayer.addElement(this.mapBuildingGroup);

        this.mapTileGroup=new MapTileGroup(this.mapId);
        this.guiLayer.addElement(this.mapTileGroup);

        egret.Ticker.getInstance().register(this.update, this);

    }

    public update(time:number){
        dragonBones.WorldClock.clock.advanceTime(time/1000);
    }

    public gotoMapTileGroup(offset:egret.Point){
        this.mapBuildingGroup.visible=false;
        this.mapTileGroup.visible=true;
        this.mapTileGroup.resetBuilding(this.mapBuildingGroup.saveBuildingConfig());

        this.mapTileGroup.setOffset(offset);
    }

    public gotoMapBuildingGroup(offset:egret.Point){
        this.mapBuildingGroup.visible=true;
        this.mapTileGroup.visible=false;

        this.mapBuildingGroup.setOffset(offset);

    }

}


