/**
 * Created by sunzg on 15/9/16.
 */
class BuildingIconList extends egret.gui.List{

    constructor(){
        super();
        this.skinName=editorMapBuilding.BuildingIconListSkin;
    }

    private buildingCollections:egret.gui.ArrayCollection=new egret.gui.ArrayCollection();

    public setData(buildingIcon){
        var icons:egret.SpriteSheet=RES.getRes(buildingIcon);
        for(var key in icons._textureMap){
            var building={"resName":key};
            this.buildingCollections.addItem(building);
        }

        this.itemRenderer = new egret.gui.ClassFactory(BuildingIconRenderer);
        this.itemRendererSkinName=editorMapBuilding.BuildingIconRendererSkin;
        this.dataProvider=this.buildingCollections;
    }
}