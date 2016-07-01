/**
 * Created by sunzg on 15/9/15.
 */
var MapBuilding = (function () {
    function MapBuilding(_x, _y, _offsetY, _resName, _parent) {
        this.index = 0;
        this._x = _x;
        this._y = _y;
        this._offsetY = parseInt(_offsetY);
        this._resName = _resName;
        this._parent = _parent;
        this._res = new egret.gui.UIAsset();
        this._res.source = _resName;
        this._res.x = _x;
        this._res.y = _y;
        this._parent.addElement(this._res);
        //        this._res.addEventListener(egret.TouchEvent.TOUCH_TAP,this.setOffsetY,this);
    }
    var __egretProto__ = MapBuilding.prototype;
    __egretProto__.setOffsetY = function (evt) {
        console.log("index:::", this.index, "   offsetY:::", evt.localY);
        this._offsetY = evt.localY;
    };
    Object.defineProperty(__egretProto__, "y", {
        get: function () {
            return this._y + this._offsetY;
        },
        enumerable: true,
        configurable: true
    });
    __egretProto__.addParent = function () {
        this._parent.addElement(this._res);
    };
    return MapBuilding;
})();
MapBuilding.prototype.__class__ = "MapBuilding";
