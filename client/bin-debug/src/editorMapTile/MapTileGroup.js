/**
 * Created by sunzg on 15/9/19.
 */
var MapTileGroup = (function (_super) {
    __extends(MapTileGroup, _super);
    //public net:Net=new Net('ws://109.10.221.34',80);
    function MapTileGroup(mapName) {
        _super.call(this);
        this.mapName = 'hall';
        this.mapDataArray = [];
        this.xyTiles = [];
        this.specialMapData = [];
        this.mapArticles = [];
        this.showGrids = true;
        this._canMapData = true;
        //public centerX:number=420;
        //public centerY:number=330;
        this.centerX = 450;
        this.centerY = 330;
        this.actorList = [];
        this.isGridsUp = false;
        this.locked = false;
        this.lineS = new egret.Sprite();
        this.lineU = new egret.gui.UIAsset();
        this.moveRect = new egret.Sprite();
        this.startPos = new egret.Point(0, 0);
        this.endPos = new egret.Point(0, 0);
        this.isSettingStart = false;
        this.isSettingTarget = false;
        this.pathMapTiles = [];
        this.a = new AStarUtils();
        this.runPath = [];
        this.actorDir = 4;
        this.mapTxt = '';
        this.mapName = mapName;
        MapTileGroup.me = this;
        Main.scene = this;
        this.init();
    }
    var __egretProto__ = MapTileGroup.prototype;
    __egretProto__.init = function () {
        this.mapBg = new egret.Bitmap();
        this.mapBg.texture = RES.getRes(this.mapName + "_bg");
        this.mapBgUIAsset = new egret.gui.UIAsset();
        this.mapBgUIAsset.width = this.mapBg.texture._textureWidth;
        this.mapBgUIAsset.height = this.mapBg.texture._textureHeight;
        this.mapBgUIAsset.source = this.mapBg;
        this.mapView = new egret.gui.Group();
        this.mapView.addElement(this.mapBgUIAsset);
        this.mapContainer = new egret.gui.Group();
        this.mapContainer.visible = false;
        this.mapContainer.addElement(this.mapView);
        this.mapGrids = new egret.Sprite();
        this.tileW = Const.mapTileSize;
        this.tileH = Const.mapTileSize / 2;
        this.xLength = Math.round(this.mapBg.texture._textureWidth / this.tileW) + 1;
        this.yLength = Math.round(this.mapBg.texture.textureHeight * 2 / this.tileH) + 2;
        this.initMapData();
        this.mapGridsUIAsset = new egret.gui.UIAsset();
        this.mapGridsUIAsset.source = this.mapGrids;
        this.mapGridsUIAsset.touchChildren = true;
        this.mapGrids.touchEnabled = true;
        this.mapGridsUIAsset.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.setMoveStartPos, this);
        this.mapGridsUIAsset.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.setMoveRectSize, this);
        this.mapGridsUIAsset.addEventListener(egret.TouchEvent.TOUCH_END, this.setMoveEndPos, this);
        this.mapGridsUIAsset.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickMapTile, this);
        this.mapView.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickMapView, this);
        this.mapView.addElement(this.mapGridsUIAsset);
        this.mapScroller = new egret.gui.Scroller();
        this.mapScroller.x = 0;
        this.mapScroller.y = 0;
        this.mapScroller.width = Const.mapWidth;
        this.mapScroller.height = Const.mapHeight;
        this.mapScroller.viewport = this.mapContainer;
        this.addElement(this.mapScroller);
        this.initMainActor();
        this.initToolBtn();
        this.addEventListener(egret.gui.UIEvent.CREATION_COMPLETE, this.createCompleted, this);
    };
    __egretProto__.createCompleted = function () {
        var _this = this;
        egret.setTimeout(function () {
            _this.centerMainActor();
            egret.Ticker.getInstance().register(_this.centerMainActor, _this);
            _this.setMapData();
            _this.isShowGrids();
            _this.initFinger();
            _this.articlesSceneDepth();
            egret.Ticker.getInstance().register(_this.articlesSceneDepth, _this);
            _this.mapContainer.visible = true;
        }, this, 100);
    };
    __egretProto__.initFinger = function () {
        this.finger = new egret.gui.UIAsset();
        var skeletonData = RES.getRes("skeleton_j_shouzhi");
        var textureData = RES.getRes("texture_j_shouzhi");
        var texture = RES.getRes("texture_p_shouzhi");
        var factory = new dragonBones.EgretFactory();
        factory.addSkeletonData(dragonBones.DataParser.parseDragonBonesData(skeletonData));
        factory.addTextureAtlas(new dragonBones.EgretTextureAtlas(texture, textureData));
        this.fingerArmature = factory.buildArmature("shouzhi");
        this.finger.source = this.fingerArmature.getDisplay();
        this.finger.scaleX = this.finger.scaleY = 0.4;
        dragonBones.WorldClock.clock.add(this.fingerArmature);
    };
    __egretProto__.showFinger = function (targeTile) {
        this.finger.visible = true;
        var pos = this.getStagePoint(targeTile.point.x, targeTile.point.y);
        this.finger.x = pos.x;
        this.finger.y = pos.y;
        this.fingerArmature.animation.gotoAndPlay("2");
        this.mapView.addElement(this.finger);
        this.mapArticles.push(this.finger);
    };
    __egretProto__.hideFinger = function () {
        if (this.finger)
            this.finger.visible = false;
    };
    __egretProto__.addActor = function (actor) {
        //if(actor.userid==this.mainActor.id)return;
        for (var i = 0; i < this.actorList.length; i++) {
            if (actor.userid == this.actorList[i].id) {
                this.actorList[i].setName(actor.username);
                return;
            }
        }
        var actorUI = new ActorUI(actor);
        this.mapView.addElement(actorUI);
        this.mapArticles.push(actorUI);
        this.actorList.push(actorUI);
        //actorUI.starAutoTimer();
    };
    __egretProto__.removeActor = function (actor) {
        for (var i = 0; i < this.actorList.length; i++) {
            if (actor.userid == this.actorList[i].id) {
                this.mapView.removeElement(this.actorList[i]);
                var index = this.mapArticles.indexOf(this.actorList[i]);
                if (index != -1) {
                    this.mapArticles.splice(index, 1);
                }
                this.actorList.splice(i, 1);
            }
        }
    };
    __egretProto__.actorRunByPhone = function (actor) {
        for (var i = 0; i < this.actorList.length; i++) {
            if (actor.userid == this.actorList[i].id) {
                this.actorList[i].control(actor.dir);
            }
        }
    };
    __egretProto__.actorToPos = function (actor) {
        if (actor.userid == this.mainActor.id)
            return;
        for (var i = 0; i < this.actorList.length; i++) {
            if (actor.userid == this.actorList[i].id) {
                this.actorList[i].pos(actor);
            }
        }
    };
    __egretProto__.actorController = function (actor) {
        for (var i = 0; i < this.actorList.length; i++) {
            if (actor.userid == this.actorList[i].id) {
                this.actorList[i].control(actor);
            }
        }
    };
    __egretProto__.initMainActor = function () {
        this.mainActor = new ActorUI(Main.main.mainActor);
        this.mapView.addElement(this.mainActor);
        this.mapArticles.push(this.mainActor);
        this.actorList.push(this.mainActor);
        var self = this;
        document.addEventListener("keydown", function (event) {
            console.log("event.keyCode::::", event.keyCode);
            self.mainActorKeyRun(event.keyCode);
        });
        //for(var i=0;i<20;i++){
        //    this.addActor({"id":i,"username":i});
        //}
    };
    __egretProto__.mainActorKeyRun = function (keyCode) {
        //        this.mainActor.keyRun(keyCode);
    };
    __egretProto__.initToolBtn = function () {
        /*底部工具栏*/
        this.bottomGroup = new egret.gui.Group();
        this.bottomGroup.layout = new egret.gui.HorizontalLayout();
        this.bottomGroup.y = Const.mapHeight + 10;
        //this.addElement(this.bottomGroup);
        this.backBtn = new egret.gui.Button();
        this.backBtn.label = "编辑建筑";
        this.backBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.backEditorBuildingGroup, this);
        this.bottomGroup.addElement(this.backBtn);
        var button = new egret.gui.Button();
        button.label = "点击寻路";
        button.addEventListener(egret.TouchEvent.TOUCH_TAP, this.mainActorSearch, this);
        //this.bottomGroup.addElement(button);
        var button1 = new egret.gui.Button();
        button1.label = "清除路径";
        button1.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClearPath, this);
        this.bottomGroup.addElement(button1);
        var button2 = new egret.gui.Button();
        button2.label = "重设起点";
        button2.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onResetStart, this);
        //this.bottomGroup.addElement(button2);
        var button3 = new egret.gui.Button();
        button3.label = "重设终点";
        button3.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onResetTarget, this);
        //this.bottomGroup.addElement(button3);
        var button4 = new egret.gui.Button();
        button4.label = "保存地图";
        button4.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onSaveMap, this);
        this.bottomGroup.addElement(button4);
        var laber = new egret.gui.Label();
        laber.textColor = 0xff0000;
        laber.size = 30;
        laber.stroke = 2;
        laber.text = "正在编辑 地图！！！";
        laber.y = 700;
        laber.x = 800;
        this.addElement(laber);
        this.rightGroup = new egret.gui.Group();
        this.rightGroup.layout = new egret.gui.VerticalLayout();
        this.rightGroup.x = Const.mapWidth + 10;
        //this.addElement(this.rightGroup);
        //右侧的工具栏
        this.sizeTxt = new egret.gui.TextInput();
        this.sizeTxt.width = 140;
        this.sizeTxt.text = Const.mapTileSize + "";
        this.rightGroup.addElement(this.sizeTxt);
        var button5 = new egret.gui.Button();
        button5.label = "重设格子";
        button5.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onResetMapTileSize, this);
        this.rightGroup.addElement(button5);
        var button6 = new egret.gui.Button();
        button6.label = "取消打点";
        this.mapDataBtn = button6;
        button6.addEventListener(egret.TouchEvent.TOUCH_TAP, this.setMapData, this);
        this.rightGroup.addElement(button6);
        var button7 = new egret.gui.Button();
        button7.label = "隐藏网格";
        this.showGridsBtn = button7;
        button7.addEventListener(egret.TouchEvent.TOUCH_TAP, this.isShowGrids, this);
        this.rightGroup.addElement(button7);
        var button8 = new egret.gui.Button();
        button8.label = "锁定区域";
        this.lockedBtn = button8;
        button8.addEventListener(egret.TouchEvent.TOUCH_TAP, this.lockMap, this);
        this.rightGroup.addElement(button8);
        var button9 = new egret.gui.Button();
        button9.label = "grids置上";
        this.gridsUpBtn = button9;
        button9.addEventListener(egret.TouchEvent.TOUCH_TAP, this.gridsIndex, this);
        this.rightGroup.addElement(button9);
    };
    __egretProto__.gridsIndex = function () {
        this.isGridsUp = !this.isGridsUp;
        if (this.isGridsUp) {
            this.gridsUpBtn.label = "grids置下";
        }
        else {
            this.gridsUpBtn.label = "grids置上";
        }
    };
    __egretProto__.lockMap = function (evt) {
        this.locked = !this.locked;
        if (this.locked) {
            this.lockedBtn.label = "解除锁定";
            this.mapScroller.horizontalScrollPolicy = egret.gui.ScrollPolicy.OFF;
            this.mapScroller.verticalScrollPolicy = egret.gui.ScrollPolicy.OFF;
        }
        else {
            this.lockedBtn.label = "锁定区域";
            this.mapScroller.horizontalScrollPolicy = egret.gui.ScrollPolicy.ON;
            this.mapScroller.verticalScrollPolicy = egret.gui.ScrollPolicy.ON;
        }
    };
    __egretProto__.backEditorBuildingGroup = function (evt) {
        //Main.main.gotoMapBuildingGroup(new egret.Point(this.mapContainer.horizontalScrollPosition,this.mapContainer.verticalScrollPosition));
    };
    __egretProto__.setOffset = function (point) {
        //this.mapContainer.horizontalScrollPosition=point.x;
        //this.mapContainer.verticalScrollPosition=point.y;
    };
    __egretProto__.isShowGrids = function () {
        this.showGrids = !this.showGrids;
        if (this.showGrids) {
            this.showGridsBtn.label = "隐藏网格";
            this.mapGrids.visible = true;
        }
        else {
            this.showGridsBtn.label = "显示网格";
            this.mapGrids.visible = false;
        }
    };
    __egretProto__.setMapData = function () {
        this._canMapData = !this._canMapData;
        if (this._canMapData) {
            this.mapDataBtn.label = "取消打点";
        }
        else {
            this.mapDataBtn.label = "开始打点";
        }
    };
    __egretProto__.removeTile = function () {
        return;
        this.lineS.removeChildren();
    };
    __egretProto__.setline = function (c, t) {
        return;
        this.lineS.width = this.mapView.width;
        this.lineS.height = this.mapView.height;
        this.lineS.graphics.clear();
        this.lineS.graphics.lineStyle(1, 0xff0000);
        this.lineS.graphics.moveTo(c.x, c.y);
        this.lineS.graphics.lineTo(t.x, t.y);
        this.lineU.source = this.lineS;
        this.lineU.x = 0;
        this.lineU.y = 0;
        this.mapView.addElement(this.lineU);
    };
    __egretProto__.setCross = function (x, y) {
        return;
        this.lineS.addChild(this.xyTiles[y][x]);
        this.xyTiles[y][x].drawPath2(1);
    };
    __egretProto__.setNotCross = function (x, y) {
        return;
        this.lineS.addChild(this.xyTiles[y][x]);
        this.xyTiles[y][x].drawPath3(1);
    };
    __egretProto__.clickMapView = function (evt) {
        if (!this.showGrids && this.runPath.length == 0) {
            var posx = evt.localX;
            var posy = evt.localY;
            this.removeTile();
            this.mainActor.pos({ x: posx, y: posy });
            return;
            this.clickMapTileByPos(posx, posy);
        }
    };
    __egretProto__.setMoveStartPos = function (evt) {
        if (this.locked) {
            this.startPos.x = evt.localX + evt.target.x;
            this.startPos.y = evt.localY + evt.target.y;
            this.moveRect.x = this.startPos.x;
            this.moveRect.y = this.startPos.y;
            this.mapGrids.addChild(this.moveRect);
        }
    };
    __egretProto__.setMoveRectSize = function (evt) {
        this.moveRect.graphics.clear();
        this.moveRect.width = evt.localX + evt.target.x - this.startPos.x;
        this.moveRect.height = evt.localY + evt.target.y - this.startPos.y;
        if (this.moveRect.width <= 0)
            this.moveRect.width = 0;
        if (this.moveRect.height <= 0)
            this.moveRect.height = 0;
        this.moveRect.graphics.beginFill(0xff0000, 0.7);
        this.moveRect.graphics.drawRect(0, 0, this.moveRect.width, this.moveRect.height);
        this.moveRect.graphics.endFill();
    };
    __egretProto__.setMoveEndPos = function (evt) {
        if (this.locked) {
            this.endPos.x = evt.localX + evt.target.x;
            this.endPos.y = evt.localY + evt.target.y;
            this.mapGrids.removeChild(this.moveRect);
            var leftUp = this.getMapPoint(this.startPos.x, this.startPos.y);
            var rightUp = this.getMapPoint(this.endPos.x, this.startPos.y);
            var leftDown = this.getMapPoint(this.startPos.x, this.endPos.y);
            var rightDown = this.getMapPoint(this.endPos.x, this.endPos.y);
        }
        this.moveRect.graphics.clear();
        this.startPos.x = this.startPos.y = this.endPos.x = this.endPos.y = 0;
    };
    __egretProto__.clickMapTile = function (evt) {
        console.log("this.runPath.length::", this.runPath.length);
        if (this.endPos.x == this.startPos.x && this.endPos.y == this.startPos.y && this.runPath.length == 0) {
            var posx = evt.localX + evt.target.x;
            var posy = evt.localY + evt.target.y;
            this.clickMapTileByPos(posx, posy);
        }
    };
    __egretProto__.clickMapTileByPos = function (posX, posY) {
        var point = this.getMapPoint(posX, posY);
        if (this.xyTiles[point.y] && this.xyTiles[point.y][point.x]) {
            var mapTile = this.xyTiles[point.y][point.x];
            if (mapTile.point.x == point.x && mapTile.point.y == point.y) {
                if (this._canMapData) {
                    if (this.isSettingStart) {
                        this.setStartPoint(mapTile);
                    }
                    else if (this.isSettingTarget) {
                        this.setTargetPoint(mapTile);
                    }
                    else {
                        this.resetMapTileCanCross(mapTile);
                    }
                }
                else {
                    this.setTargetPoint(mapTile);
                    this.mainActorSearch(null);
                }
                return;
            }
        }
    };
    __egretProto__.onResetMapTileSize = function (evt) {
        var newSize = parseInt(this.sizeTxt.text);
        if (Const.mapTileSize != newSize) {
            //this.mapTiles=[];
            this.xyTiles = [];
            this.mapGrids.removeChildren();
            Const.mapTileSize = newSize;
            this.tileW = Const.mapTileSize;
            this.tileH = Const.mapTileSize / 2;
            this.xLength = Math.round(this.mapBg.texture._textureWidth / this.tileW) + 1;
            this.yLength = Math.round(this.mapBg.texture.textureHeight * 2 / this.tileH) + 2;
            this.createMapData();
        }
    };
    __egretProto__.onResetStart = function (evt) {
        this.isSettingStart = true;
    };
    __egretProto__.onResetTarget = function (evt) {
        this.isSettingTarget = true;
    };
    __egretProto__.resetMapTileCanCross = function (mapTile) {
        mapTile.canCross = !mapTile.canCross;
        this.mapDataArray[mapTile.point.y][mapTile.point.x].canCross = mapTile.canCross;
        if (mapTile.canCross) {
            mapTile.drawCanCross();
        }
        else {
            mapTile.drawNotCanCross();
        }
    };
    __egretProto__.setStartPoint = function (mapTile) {
        if (this.startMapTile) {
            this.startMapTile.mapType = 0;
            this.startMapTile.drawCanCross();
            this.mapDataArray[this.startMapTile.point.y][this.startMapTile.point.x].type = 0;
        }
        this.startMapTile = mapTile;
        this.startMapTile.mapType = 1;
        this.startMapTile.drawStart();
        this.mapDataArray[this.startMapTile.point.y][this.startMapTile.point.x].type = 1;
        this.isSettingStart = false;
    };
    __egretProto__.setTargetPoint = function (mapTile) {
        if (this.targetMapTile) {
            this.targetMapTile.mapType = 0;
            this.targetMapTile.drawCanCross();
            this.mapDataArray[this.targetMapTile.point.y][this.targetMapTile.point.x].type = 0;
        }
        this.targetMapTile = mapTile;
        this.targetMapTile.mapType = 2;
        this.targetMapTile.drawTarget();
        this.mapDataArray[this.targetMapTile.point.y][this.targetMapTile.point.x].type = 2;
        this.isSettingTarget = false;
    };
    __egretProto__.onClearPath = function (evt) {
        for (var i = 0; i < this.pathMapTiles.length; i++) {
            var mapTile = this.pathMapTiles[i];
            mapTile.drawCanCross();
        }
        this.pathMapTiles = [];
    };
    __egretProto__.getMapTile = function (pathNode) {
        if (this.xyTiles[pathNode.y] && this.xyTiles[pathNode.y][pathNode.x]) {
            return this.xyTiles[pathNode.y][pathNode.x];
        }
    };
    __egretProto__.mainActorSearch = function (event) {
        this.getActorPos();
        this.mainActor.current_tile = this.startMapTile;
        this.mainActor.target_tile = this.targetMapTile;
        if (!this.targetMapTile || !this.startMapTile)
            return;
        if (this.targetMapTile.point.x == this.startMapTile.point.x && this.targetMapTile.point.y == this.startMapTile.point.y) {
            this.mainActor.action(Action.STAND, 4);
        }
        else {
            //            this.mainActor.onSearch();
            var pathArray = this.a.getPaths(this.startMapTile.point, this.targetMapTile.point, this.mapDataArray, Const.mapTileSize);
            for (var i = 0; i < pathArray.length; i++) {
                var mapTile = this.getMapTile(pathArray[i]);
                if (this.startMapTile != mapTile && this.targetMapTile != mapTile) {
                    mapTile.drawPath(pathArray[i].direction);
                    this.pathMapTiles.push(mapTile);
                }
            }
        }
    };
    __egretProto__.getActorPos = function () {
        var posx = this.mainActor.x;
        var posy = this.mainActor.y;
        var point = this.getMapPoint(posx, posy);
        if (this.xyTiles[point.y] && this.xyTiles[point.y][point.x]) {
            this.startMapTile = this.xyTiles[point.y][point.x];
        }
    };
    __egretProto__.articlesSceneDepth = function () {
        var depthArray = [];
        function pushItem(item) {
            var index = -1;
            for (var i = 0; i < depthArray.length; i++) {
                if (item.y <= depthArray[i].y) {
                    index = i;
                    depthArray.splice(i, 0, item);
                    break;
                }
            }
            if (index == -1) {
                depthArray.push(item);
            }
        }
        for (var n = 0; n < this.mapArticles.length; n++) {
            pushItem(this.mapArticles[n]);
        }
        for (var j = 0; j < depthArray.length; j++) {
            if (depthArray[j] instanceof ActorUI) {
                this.mapView.addElement(depthArray[j]);
            }
            else if (depthArray[j] instanceof MapBuilding) {
                var building = depthArray[j];
                building.addParent();
            }
        }
        if (this.isGridsUp) {
            this.mapView.addElement(this.mapGridsUIAsset);
        }
    };
    __egretProto__.centerMainActor = function () {
        this.mapContainer.horizontalScrollPosition = this.mainActor.x - this.centerX;
        this.mapContainer.verticalScrollPosition = this.mainActor.y - this.centerY;
        return;
        this.mapView.x = -this.mainActor.x + this.centerX;
        this.mapView.y = -this.mainActor.y + this.centerY;
        if (this.mapView.x > 0) {
            this.mapView.x = 0;
        }
        if (this.mapView.y > 0) {
            this.mapView.y = 0;
        }
        if (this.mapView.x < Const.mapWidth - this.mapBgUIAsset.width) {
            this.mapView.x = Const.mapWidth - this.mapBgUIAsset.width;
        }
        if (this.mapView.y < Const.mapHeight - this.mapBgUIAsset.height) {
            this.mapView.y = Const.mapHeight - this.mapBgUIAsset.height;
        }
    };
    __egretProto__.initMapData = function () {
        var mapData = RES.getRes(this.mapName + "_data");
        if (mapData) {
            this.specialMapData = mapData.mapDataArray;
            Const.mapTileSize = mapData.mapTileSize;
            this.tileW = Const.mapTileSize;
            this.tileH = Const.mapTileSize / 2;
            this.xLength = mapData.xLength;
            this.yLength = mapData.yLength;
            var self = this;
            function getPointData(x, y) {
                var point = new egret.Point(x, y);
                var pointData = { "point": point, "canCross": false, "type": 0 };
                var lg = self.specialMapData.length;
                for (var i = 0; i < lg; i++) {
                    if (x == self.specialMapData[i].x && y == self.specialMapData[i].y) {
                        if (self.specialMapData[i].c == 1) {
                            pointData.canCross = true;
                        }
                        pointData.type = self.specialMapData[i].t;
                        return pointData;
                    }
                }
                return pointData;
            }
            for (var y = 0; y < this.yLength; y++) {
                var yArray = [];
                var yTiles = [];
                for (var x = 0; x < this.xLength; x++) {
                    var pointData = getPointData(x, y);
                    var mapTile = new MapTile(pointData.point, pointData.canCross, pointData.type, Const.mapTileSize);
                    if (mapTile.point.y % 2 == 0) {
                        mapTile.x = -this.tileW / 2 + mapTile.point.x * this.tileW;
                    }
                    else {
                        mapTile.x = mapTile.point.x * this.tileW;
                    }
                    mapTile.y = -this.tileH / 2 + mapTile.point.y * this.tileH / 2;
                    //this.mapTiles.push(mapTile);
                    yTiles.push(mapTile);
                    this.mapGrids.addChild(mapTile);
                    var mapDesc = new MapTileDesc(x, y, pointData.canCross, pointData.type, "");
                    mapDesc.up = { x: mapTile.x + this.tileW / 2, y: mapTile.y };
                    mapDesc.right = { x: mapTile.x + this.tileW, y: mapTile.y + this.tileH / 2 };
                    mapDesc.down = { x: mapTile.x + this.tileW / 2, y: mapTile.y + this.tileH };
                    mapDesc.left = { x: mapTile.x, y: mapTile.y + this.tileH / 2 };
                    yArray.push(mapDesc);
                }
                this.mapDataArray.push(yArray);
                this.xyTiles.push(yTiles);
            }
        }
        else {
            this.createMapData();
        }
        var buildings = RES.getRes(this.mapName + "_buildings");
        if (buildings) {
            for (var i = 0; i < buildings.length; i++) {
                var building = new MapBuilding(buildings[i]._x, buildings[i]._y, buildings[i].offsetY, buildings[i].buildingRes, this.mapView);
                this.mapArticles.push(building);
            }
        }
    };
    __egretProto__.resetBuilding = function (buildingsDesc) {
        this.buildingsDesc = buildingsDesc;
        var buildings = JSON.parse(buildingsDesc);
        while (this.mapArticles.length) {
            var article = this.mapArticles.shift();
            if (article instanceof MapBuilding) {
                if (article.parent)
                    this.mapView.removeElement(article);
            }
        }
        for (var i = 0; i < buildings.length; i++) {
            var building = new MapBuilding(buildings[i]._x, buildings[i]._y, buildings[i].offsetY, buildings[i].buildingRes, this.mapView);
            this.mapArticles.push(building);
        }
        this.mapArticles.push(this.mainActor);
    };
    __egretProto__.createMapData = function () {
        this.mapDataArray = [];
        var count = 0;
        for (var posY = 0; posY < this.yLength; posY++) {
            var array = [];
            var yTiles = [];
            for (var posX = 0; posX < this.xLength; posX++) {
                var canCross = false;
                var tileDesc = new MapTileDesc(posX, posY, canCross, 0, "");
                count++;
                array.push(tileDesc);
                var mapTile = new MapTile(new egret.Point(posX, posY), tileDesc.canCross, 0, Const.mapTileSize);
                if (mapTile.point.y % 2 == 0) {
                    mapTile.x = -this.tileW / 2 + mapTile.point.x * this.tileW;
                }
                else {
                    mapTile.x = mapTile.point.x * this.tileW;
                }
                mapTile.y = -this.tileH / 2 + mapTile.point.y * this.tileH / 2;
                this.mapGrids.addChild(mapTile);
                yTiles.push(mapTile);
                tileDesc.up = { x: mapTile.x + this.tileW / 2, y: mapTile.y };
                tileDesc.right = { x: mapTile.x + this.tileW, y: mapTile.y + this.tileH / 2 };
                tileDesc.down = { x: mapTile.x + this.tileW / 2, y: mapTile.y + this.tileH };
                tileDesc.left = { x: mapTile.x, y: mapTile.y + this.tileH / 2 };
            }
            this.xyTiles.push(yTiles);
            this.mapDataArray.push(array);
        }
        console.log("地图打点总数:::", count);
    };
    __egretProto__.onSaveMap = function (evt) {
        console.log("=============地图打点数据=============");
        this.mapTxt = '';
        this.mapTxt = '{"map":"' + this.mapName + '","mapTileSize":' + Const.mapTileSize + ',"xLength":' + this.xLength + ',"yLength":' + this.yLength;
        this.mapTxt += ',"mapDataArray":[';
        var dataTxt = "";
        for (var posY = 0; posY < this.mapDataArray.length; posY++) {
            for (var posX = 0; posX < this.mapDataArray[0].length; posX++) {
                var ss = ',';
                if (this.mapDataArray[posY][posX].canCross || this.mapDataArray[posY][posX].type != 0) {
                    var canCross;
                    if (this.mapDataArray[posY][posX].canCross) {
                        canCross = 1;
                    }
                    else {
                        canCross = 0;
                    }
                    dataTxt += '{"x":' + this.mapDataArray[posY][posX].x + ',"y":' + this.mapDataArray[posY][posX].y + ',"c":' + canCross + ',"t":' + this.mapDataArray[posY][posX].type + '}' + ss;
                }
            }
        }
        if (dataTxt != "") {
            dataTxt = dataTxt.substring(0, dataTxt.length - 1);
        }
        this.mapTxt += dataTxt + ']}';
        console.log(this.mapTxt);
        Main.main.mapBuildingGroup.saveBuildingConfig();
    };
    __egretProto__.getStagePoint = function (mapx, mapy) {
        var tileCenter = mapx * this.tileW;
        var xPixel = tileCenter + (mapy & 1) * this.tileW / 2;
        var yPixel = mapy * this.tileH / 2;
        var point = new egret.Point(xPixel, yPixel);
        return point;
    };
    __egretProto__.getMapPoint = function (posx, posy) {
        posx += this.tileW / 2;
        posy += this.tileH / 2;
        var cx = Math.floor(posx / this.tileW) * this.tileW + this.tileW / 2;
        var cy = Math.floor(posy / this.tileH) * this.tileH + this.tileH / 2;
        var rx = (posx - cx) * this.tileH / 2;
        var ry = (posy - cy) * this.tileW / 2;
        var xtile;
        var ytile;
        if (Math.abs(rx) + Math.abs(ry) <= this.tileW * this.tileH / 4) {
            xtile = Math.floor(posx / this.tileW);
            ytile = Math.floor(posy / this.tileH) * 2;
        }
        else {
            posx = posx - this.tileW / 2;
            xtile = Math.floor(posx / this.tileW) + 1;
            posy = posy - this.tileH / 2;
            ytile = Math.floor(posy / this.tileH) * 2 + 1;
        }
        var point = new egret.Point(xtile - (ytile & 1), ytile);
        return point;
    };
    return MapTileGroup;
})(egret.gui.Group);
MapTileGroup.prototype.__class__ = "MapTileGroup";
