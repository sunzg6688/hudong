/**
 * Created by sunzg on 15/9/16.
 */
var BuildingIconRenderer = (function (_super) {
    __extends(BuildingIconRenderer, _super);
    function BuildingIconRenderer() {
        _super.call(this);
        this.resName = "";
        this.canSeleted = false;
        this.skinName = "editorMapBuilding.BuildingIconRendererSkin";
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.begin, this);
        this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.move, this);
        this.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.outSide, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.end, this);
    }
    var __egretProto__ = BuildingIconRenderer.prototype;
    __egretProto__.dataChanged = function () {
        _super.prototype.dataChanged.call(this);
        this.resName = this.data.resName;
        this.res.source = this.data.resName;
    };
    __egretProto__.begin = function () {
        this.canSeleted = true;
        egret.setTimeout(this.seletedMe, this, 1500);
    };
    __egretProto__.outSide = function () {
        this.canSeleted = false;
    };
    __egretProto__.end = function () {
        this.canSeleted = false;
    };
    __egretProto__.move = function () {
    };
    __egretProto__.seletedMe = function () {
        if (this.canSeleted) {
            MapBuildingGroup.me.createBuilding(this.data);
        }
    };
    return BuildingIconRenderer;
})(egret.gui.ItemRenderer);
BuildingIconRenderer.prototype.__class__ = "BuildingIconRenderer";
