/**
 * Created by sunzg on 15/9/16.
 */
var BuildingIconList = (function (_super) {
    __extends(BuildingIconList, _super);
    function BuildingIconList() {
        _super.call(this);
        this.buildingCollections = new egret.gui.ArrayCollection();
        this.skinName = editorMapBuilding.BuildingIconListSkin;
    }
    var __egretProto__ = BuildingIconList.prototype;
    __egretProto__.setData = function (buildingIcon) {
        var icons = RES.getRes(buildingIcon);
        for (var key in icons._textureMap) {
            var building = { "resName": key };
            this.buildingCollections.addItem(building);
        }
        this.itemRenderer = new egret.gui.ClassFactory(BuildingIconRenderer);
        this.itemRendererSkinName = editorMapBuilding.BuildingIconRendererSkin;
        this.dataProvider = this.buildingCollections;
    };
    return BuildingIconList;
})(egret.gui.List);
BuildingIconList.prototype.__class__ = "BuildingIconList";
