var editorMapBuilding;
(function (editorMapBuilding) {
    var BuildingIconRendererSkin = (function (_super) {
        __extends(BuildingIconRendererSkin, _super);
        function BuildingIconRendererSkin() {
            _super.call(this);
            this.__s = egret.gui.setProperties;
            this.__s(this, ["height", "width"], [200, 180]);
            this.elementsContent = [this.__4_i(), this.res_i()];
            this.states = [
                new egret.gui.State("up", []),
                new egret.gui.State("down", []),
                new egret.gui.State("disabled", [])
            ];
        }
        var __egretProto__ = BuildingIconRendererSkin.prototype;
        Object.defineProperty(__egretProto__, "skinParts", {
            get: function () {
                return BuildingIconRendererSkin._skinParts;
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__.res_i = function () {
            var t = new egret.gui.UIAsset();
            this.res = t;
            this.__s(t, ["height", "horizontalCenter", "verticalCenter", "width"], [150, 0, 0, 150]);
            return t;
        };
        __egretProto__.__4_i = function () {
            var t = new egret.gui.UIAsset();
            this.__s(t, ["bottom", "left", "right", "scale9Grid", "source", "top"], [0, 0, 0, egret.gui.getScale9Grid("4,3,13,14"), "button_down_png", 0]);
            return t;
        };
        BuildingIconRendererSkin._skinParts = ["res"];
        return BuildingIconRendererSkin;
    })(egret.gui.Skin);
    editorMapBuilding.BuildingIconRendererSkin = BuildingIconRendererSkin;
    BuildingIconRendererSkin.prototype.__class__ = "editorMapBuilding.BuildingIconRendererSkin";
})(editorMapBuilding || (editorMapBuilding = {}));
