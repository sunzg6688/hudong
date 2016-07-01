var editorMapBuilding;
(function (editorMapBuilding) {
    var BuildingIconListSkin = (function (_super) {
        __extends(BuildingIconListSkin, _super);
        function BuildingIconListSkin() {
            _super.call(this);
            this.__s = egret.gui.setProperties;
            this.__s(this, ["height", "width"], [670, 180]);
            this.elementsContent = [this.__4_i()];
            this.states = [
                new egret.gui.State("normal", []),
                new egret.gui.State("disabled", [])
            ];
        }
        var __egretProto__ = BuildingIconListSkin.prototype;
        Object.defineProperty(__egretProto__, "skinParts", {
            get: function () {
                return BuildingIconListSkin._skinParts;
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__.__4_i = function () {
            var t = new egret.gui.Scroller();
            this.__s(t, ["autoTouchEnabled", "percentHeight", "horizontalScrollPolicy", "touchEnabled", "verticalScrollPolicy", "percentWidth"], [true, 100, "on", true, "on", 100]);
            t.viewport = this.dataGroup_i();
            return t;
        };
        __egretProto__.dataGroup_i = function () {
            var t = new egret.gui.DataGroup();
            this.dataGroup = t;
            t.layout = this.__3_i();
            return t;
        };
        __egretProto__.__3_i = function () {
            var t = new egret.gui.VerticalLayout();
            this.__s(t, ["gap", "horizontalAlign"], [0, "contentJustify"]);
            return t;
        };
        BuildingIconListSkin._skinParts = ["dataGroup"];
        return BuildingIconListSkin;
    })(egret.gui.Skin);
    editorMapBuilding.BuildingIconListSkin = BuildingIconListSkin;
    BuildingIconListSkin.prototype.__class__ = "editorMapBuilding.BuildingIconListSkin";
})(editorMapBuilding || (editorMapBuilding = {}));
