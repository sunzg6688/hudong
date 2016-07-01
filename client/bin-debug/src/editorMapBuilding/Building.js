/**
 * Created by sunzg on 15/9/16.
 */
var Building = (function (_super) {
    __extends(Building, _super);
    function Building() {
        _super.call(this);
        this.resBitmap = new egret.Bitmap();
        this.resSprite = new egret.Sprite();
        this._offsetY = 0;
        this.canSetOffsetY = false;
        this.pos = new egret.Sprite();
        this.touchEnabled = true;
        this.touchChildren = true;
        this.resSprite.touchEnabled = true;
        this.resSprite.addEventListener(egret.TouchEvent.TOUCH_TAP, this.setPosY, this);
    }
    var __egretProto__ = Building.prototype;
    __egretProto__.drawReEditor = function () {
        this.canSetOffsetY = false;
        this.resSprite.graphics.clear();
        this.resSprite.graphics.beginFill(0x00ff00, 0.7);
        this.resSprite.graphics.drawRect(0, 0, this.resBitmap.texture._textureWidth, this.resBitmap.texture._textureHeight);
        this.resSprite.graphics.endFill();
    };
    __egretProto__.setRes = function (resName) {
        this.resName = resName;
        this.resBitmap.texture = RES.getRes(resName);
        this.resSprite.addChild(this.resBitmap);
        this.resSprite.x = -this.resBitmap.texture._textureWidth >> 1;
        this.resSprite.y = -this.resBitmap.texture._textureHeight >> 1;
        this.source = this.resSprite;
        this.pos.graphics.beginFill(0x000000, 1);
        this.pos.graphics.drawRect(0, 0, 10, 10);
        this.pos.graphics.endFill();
        this.resSprite.addChild(this.pos);
    };
    __egretProto__.finishEditor = function () {
        this.canSetOffsetY = true;
        if (this.pos.x == 0 && this.pos.y == 0) {
            this.resSprite.graphics.clear();
            this.resSprite.graphics.beginFill(0xff0000, 0.7);
            this.resSprite.graphics.drawRect(0, 0, this.resBitmap.texture._textureWidth, this.resBitmap.texture._textureHeight);
            this.resSprite.graphics.endFill();
        }
        else {
            this.resSprite.graphics.clear();
        }
    };
    __egretProto__.drawEditor = function () {
        this.canSetOffsetY = false;
        this.resSprite.graphics.clear();
        this.resSprite.graphics.lineStyle(1, 0x00ff00, 0.9);
        this.resSprite.graphics.moveTo(0, 0);
        this.resSprite.graphics.lineTo(this.resBitmap.texture._textureWidth, 0);
        this.resSprite.graphics.lineTo(this.resBitmap.texture._textureWidth, this.resBitmap.texture._textureHeight);
        this.resSprite.graphics.lineTo(0, this.resBitmap.texture._textureHeight);
        this.resSprite.graphics.lineTo(0, 0);
    };
    __egretProto__.setPosY = function (evt) {
        if (this.canSetOffsetY) {
            this._offsetY = evt.localY - 5;
            this.pos.y = evt.localY - 5;
            this.pos.x = evt.localX - 5;
            this.resSprite.graphics.clear();
        }
        else {
            MapBuildingGroup.me.setEditorBuilding(this);
        }
    };
    Object.defineProperty(__egretProto__, "posX", {
        get: function () {
            return this.resSprite.x + this.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(__egretProto__, "posY", {
        get: function () {
            return this.resSprite.y + this.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(__egretProto__, "offsetY", {
        get: function () {
            return this._offsetY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(__egretProto__, "depthY", {
        get: function () {
            return this.posY + this.offsetY;
        },
        enumerable: true,
        configurable: true
    });
    __egretProto__.createByConfig = function (config) {
        this.resName = config.buildingRes;
        this.resBitmap.texture = RES.getRes(config.buildingRes);
        this.resSprite.addChild(this.resBitmap);
        this.resSprite.x = -this.resBitmap.texture._textureWidth >> 1;
        this.resSprite.y = -this.resBitmap.texture._textureHeight >> 1;
        this.source = this.resSprite;
        this.x = config._x - this.resSprite.x;
        this.y = config._y - this.resSprite.y;
        this._offsetY = config.offsetY;
        this.pos.graphics.beginFill(0x000000, 1);
        this.pos.graphics.drawRect(0, 0, 10, 10);
        this.pos.graphics.endFill();
        this.pos.y = this._offsetY;
        this.resSprite.addChild(this.pos);
    };
    return Building;
})(egret.gui.UIAsset);
Building.prototype.__class__ = "Building";
