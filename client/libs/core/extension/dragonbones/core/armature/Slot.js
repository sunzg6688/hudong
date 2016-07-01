//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var dragonBones;
(function (dragonBones) {
    /**
     * @class dragonBones.Slot
     * @classdesc
     * Slot 实例是骨头上的一个插槽，是显示图片的容器。
     * 一个 Bone 上可以有多个Slot，每个Slot中同一时间都会有一张图片用于显示，不同的Slot中的图片可以同时显示。
     * 每个 Slot 中可以包含多张图片，同一个 Slot 中的不同图片不能同时显示，但是可以在动画进行的过程中切换，用于实现帧动画。
     * @extends dragonBones.DBObject
     * @see dragonBones.Armature
     * @see dragonBones.Bone
     * @see dragonBones.SlotData
     *
     * @example
       <pre>
        //获取动画数据 本例使用Knight例子.
        //资源下载地址http://dragonbones.github.io/download_forwarding.html?download_url=downloads/dragonbonesdemos_v2.4.zip
        var skeletonData = RES.getRes("skeleton");
        //获取纹理集数据
        var textureData = RES.getRes("textureConfig");
        //获取纹理集图片
        var texture = RES.getRes("texture");
        //这个资源需要自己准备
        var horseHat = RES.getRes("horseHat");
        //创建一个工厂，用来创建Armature
        var factory:dragonBones.EgretFactory = new dragonBones.EgretFactory();
        //把动画数据添加到工厂里
        factory.addSkeletonData(dragonBones.DataParser.parseDragonBonesData(skeletonData));
        //把纹理集数据和图片添加到工厂里
        factory.addTextureAtlas(new dragonBones.EgretTextureAtlas(texture, textureData));

        //获取Armature的名字，dragonBones4.0的数据可以包含多个骨架，这里取第一个Armature
        var armatureName:string = skeletonData.armature[1].name;
        //从工厂里创建出Armature
        var armature:dragonBones.Armature = factory.buildArmature(armatureName);
        //获取装载Armature的容器
        var armatureDisplay = armature.display;
        //把它添加到舞台上
        armatureDisplay.x = 200;
        armatureDisplay.y = 300;
        this.addChild(armatureDisplay);

        //以下四句代码，实现给骨骼添加slot的功能
        //1.获取马头的骨骼
        var horseHead:dragonBones.Bone = armature.getBone("horseHead");
        //2.创建一个slot
        var horseHatSlot:dragonBones.EgretSlot = new dragonBones.EgretSlot();
        //3.给这个slot赋一个图片
        horseHatSlot.display = new egret.Bitmap(horseHat);
        //4.把这个slot添加到骨骼上
        horseHead.addSlot(horseHatSlot);

        //以下3句代码，实现了子骨骼的获取和播放子骨架的动画
        //1.获取包含子骨架的骨骼
        var weaponBone:dragonBones.Bone = armature.getBone("armOutside");
        //2.获取骨骼上的子骨架
        var childArmature:dragonBones.Armature = weaponBone.childArmature;
        //3.播放子骨架的动画
        childArmature.animation.gotoAndPlay("attack_sword_1",0,-1,0);


        //取得这个Armature动画列表中的第一个动画的名字
        var curAnimationName = armature.animation.animationList[0];
        armature.animation.gotoAndPlay(curAnimationName,0.3,-1,0);

        //把Armature添加到心跳时钟里
        dragonBones.WorldClock.clock.add(armature);
        //心跳时钟开启
        egret.Ticker.getInstance().register(function (advancedTime) {
            dragonBones.WorldClock.clock.advanceTime(advancedTime / 1000);
        }, this);
       </pre>
     */
    var Slot = (function (_super) {
        __extends(Slot, _super);
        function Slot(self) {
            _super.call(this);
            this._currentDisplayIndex = 0;
            if (self != this) {
                throw new Error(egret.getString(4001));
            }
            this._displayList = [];
            this._timelineStateList = [];
            this._currentDisplayIndex = -1;
            this._originZOrder = 0;
            this._tweenZOrder = 0;
            this._offsetZOrder = 0;
            this._isShowDisplay = false;
            this._colorTransform = new dragonBones.ColorTransform();
            this._displayDataList = null;
            //_childArmature = null;
            this._currentDisplay = null;
            this.inheritRotation = true;
            this.inheritScale = true;
        }
        var __egretProto__ = Slot.prototype;
        /**
         * 通过传入 SlotData 初始化Slot
         * @param slotData
         */
        __egretProto__.initWithSlotData = function (slotData) {
            this.name = slotData.name;
            this.blendMode = slotData.blendMode;
            this._originZOrder = slotData.zOrder;
            this._displayDataList = slotData.displayDataList;
        };
        /**
         * @inheritDoc
         */
        __egretProto__.dispose = function () {
            if (!this._displayList) {
                return;
            }
            _super.prototype.dispose.call(this);
            this._displayList.length = 0;
            this._displayDataList = null;
            this._displayList = null;
            this._currentDisplay = null;
            //_childArmature = null;
        };
        __egretProto__.sortState = function (state1, state2) {
            return state1._animationState.layer < state2._animationState.layer ? -1 : 1;
        };
        /** @private */
        __egretProto__._addState = function (timelineState) {
            if (this._timelineStateList.indexOf(timelineState) < 0) {
                this._timelineStateList.push(timelineState);
                this._timelineStateList.sort(this.sortState);
            }
        };
        /** @private */
        __egretProto__._removeState = function (timelineState) {
            var index = this._timelineStateList.indexOf(timelineState);
            if (index >= 0) {
                this._timelineStateList.splice(index, 1);
            }
        };
        //骨架装配
        /** @private */
        __egretProto__.setArmature = function (value) {
            if (this._armature == value) {
                return;
            }
            if (this._armature) {
                this._armature._removeSlotFromSlotList(this);
            }
            this._armature = value;
            if (this._armature) {
                this._armature._addSlotToSlotList(this);
                this._armature._slotsZOrderChanged = true;
                this._addDisplayToContainer(this._armature.display);
            }
            else {
                this._removeDisplayFromContainer();
            }
        };
        //动画
        /** @private */
        __egretProto__._update = function () {
            if (this._parent._needUpdate <= 0) {
                return;
            }
            this._updateGlobal();
            this._updateTransform();
        };
        __egretProto__._calculateRelativeParentTransform = function () {
            this._global.scaleX = this._origin.scaleX * this._offset.scaleX;
            this._global.scaleY = this._origin.scaleY * this._offset.scaleY;
            this._global.skewX = this._origin.skewX + this._offset.skewX;
            this._global.skewY = this._origin.skewY + this._offset.skewY;
            this._global.x = this._origin.x + this._offset.x + this._parent._tweenPivot.x;
            this._global.y = this._origin.y + this._offset.y + this._parent._tweenPivot.y;
        };
        __egretProto__.updateChildArmatureAnimation = function () {
            if (this.childArmature) {
                if (this._isShowDisplay) {
                    if (this._armature && this._armature.animation.lastAnimationState && this.childArmature.animation.hasAnimation(this._armature.animation.lastAnimationState.name)) {
                        this.childArmature.animation.gotoAndPlay(this._armature.animation.lastAnimationState.name);
                    }
                    else {
                        this.childArmature.animation.play();
                    }
                }
                else {
                    this.childArmature.animation.stop();
                    this.childArmature.animation._lastAnimationState = null;
                }
            }
        };
        /** @private */
        __egretProto__._changeDisplay = function (displayIndex) {
            if (displayIndex === void 0) { displayIndex = 0; }
            if (displayIndex < 0) {
                if (this._isShowDisplay) {
                    this._isShowDisplay = false;
                    this._removeDisplayFromContainer();
                    this.updateChildArmatureAnimation();
                }
            }
            else if (this._displayList.length > 0) {
                var length = this._displayList.length;
                if (displayIndex >= length) {
                    displayIndex = length - 1;
                }
                if (this._currentDisplayIndex != displayIndex) {
                    this._isShowDisplay = true;
                    this._currentDisplayIndex = displayIndex;
                    this._updateSlotDisplay();
                    this.updateChildArmatureAnimation();
                    if (this._displayDataList && this._displayDataList.length > 0 && this._currentDisplayIndex < this._displayDataList.length) {
                        this._origin.copy(this._displayDataList[this._currentDisplayIndex].transform);
                    }
                }
                else if (!this._isShowDisplay) {
                    this._isShowDisplay = true;
                    if (this._armature) {
                        this._armature._slotsZOrderChanged = true;
                        this._addDisplayToContainer(this._armature.display);
                    }
                    this.updateChildArmatureAnimation();
                }
            }
        };
        /** @private
         * Updates the display of the slot.
         */
        __egretProto__._updateSlotDisplay = function () {
            var currentDisplayIndex = -1;
            if (this._currentDisplay) {
                currentDisplayIndex = this._getDisplayIndex();
                this._removeDisplayFromContainer();
            }
            var displayObj = this._displayList[this._currentDisplayIndex];
            if (displayObj) {
                if (displayObj instanceof dragonBones.Armature) {
                    //_childArmature = display as Armature;
                    this._currentDisplay = displayObj.display;
                }
                else {
                    //_childArmature = null;
                    this._currentDisplay = displayObj;
                }
            }
            else {
                this._currentDisplay = null;
            }
            this._updateDisplay(this._currentDisplay);
            if (this._currentDisplay) {
                if (this._armature && this._isShowDisplay) {
                    if (currentDisplayIndex < 0) {
                        this._armature._slotsZOrderChanged = true;
                        this._addDisplayToContainer(this._armature.display);
                    }
                    else {
                        this._addDisplayToContainer(this._armature.display, currentDisplayIndex);
                    }
                }
                this._updateDisplayBlendMode(this._blendMode);
                this._updateDisplayColor(this._colorTransform.alphaOffset, this._colorTransform.redOffset, this._colorTransform.greenOffset, this._colorTransform.blueOffset, this._colorTransform.alphaMultiplier, this._colorTransform.redMultiplier, this._colorTransform.greenMultiplier, this._colorTransform.blueMultiplier);
                this._updateDisplayVisible(this._visible);
                this._updateTransform();
            }
        };
        Object.defineProperty(__egretProto__, "visible", {
            /** @private */
            set: function (value) {
                if (this._visible != value) {
                    this._visible = value;
                    this._updateDisplayVisible(this._visible);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "displayList", {
            /**
             * 显示对象列表(包含 display 或者 子骨架)
             * @member {any[]} dragonBones.Slot#displayList
             */
            get: function () {
                return this._displayList;
            },
            set: function (value) {
                if (!value) {
                    throw new Error();
                }
                //为什么要修改_currentDisplayIndex?
                if (this._currentDisplayIndex < 0) {
                    this._currentDisplayIndex = 0;
                }
                var i = this._displayList.length = value.length;
                while (i--) {
                    this._displayList[i] = value[i];
                }
                //在index不改变的情况下强制刷新 TO DO需要修改
                var displayIndexBackup = this._currentDisplayIndex;
                this._currentDisplayIndex = -1;
                this._changeDisplay(displayIndexBackup);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "display", {
            /**
             * 当前的显示对象(可能是 display 或者 子骨架)
             * @member {any} dragonBones.Slot#display
             */
            get: function () {
                return this._currentDisplay;
            },
            set: function (value) {
                if (this._currentDisplayIndex < 0) {
                    this._currentDisplayIndex = 0;
                }
                if (this._displayList[this._currentDisplayIndex] == value) {
                    return;
                }
                this._displayList[this._currentDisplayIndex] = value;
                this._updateSlotDisplay();
                this.updateChildArmatureAnimation();
                this._updateTransform(); //是否可以延迟更新？
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 不推荐的 API. 使用 display 属性代替
         */
        __egretProto__.getDisplay = function () {
            return this.display;
        };
        /**
         * Unrecommended API. Please use .display = instead.
         * @returns {any}
         */
        __egretProto__.setDisplay = function (value) {
            this.display = value;
        };
        Object.defineProperty(__egretProto__, "childArmature", {
            /**
             * 当前的子骨架
             * @member {Armature} dragonBones.Slot#childArmature
             */
            get: function () {
                if (this._displayList[this._currentDisplayIndex] instanceof dragonBones.Armature) {
                    return (this._displayList[this._currentDisplayIndex]);
                }
                return null;
            },
            set: function (value) {
                //设计的不好，要修改
                this.display = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "zOrder", {
            /**
             * 显示顺序。(支持小数用于实现动态插入slot)
             * @member {number} dragonBones.Slot#zOrder
             */
            get: function () {
                return this._originZOrder + this._tweenZOrder + this._offsetZOrder;
            },
            set: function (value) {
                if (this.zOrder != value) {
                    this._offsetZOrder = value - this._originZOrder - this._tweenZOrder;
                    if (this._armature) {
                        this._armature._slotsZOrderChanged = true;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "blendMode", {
            /**
             * 混合模式
             * @member {string} dragonBones.Slot#blendMode
             */
            get: function () {
                return this._blendMode;
            },
            set: function (value) {
                if (this._blendMode != value) {
                    this._blendMode = value;
                    this._updateDisplayBlendMode(this._blendMode);
                }
            },
            enumerable: true,
            configurable: true
        });
        //Abstract method
        /**
         * @private
         */
        __egretProto__._updateDisplay = function (value) {
            throw new Error("");
        };
        /**
         * @private
         */
        __egretProto__._getDisplayIndex = function () {
            throw new Error(egret.getString(4001));
        };
        /**
         * @private
         * Adds the original display object to another display object.
         * @param container
         * @param index
         */
        __egretProto__._addDisplayToContainer = function (container, index) {
            if (index === void 0) { index = -1; }
            throw new Error(egret.getString(4001));
        };
        /**
         * @private
         * remove the original display object from its parent.
         */
        __egretProto__._removeDisplayFromContainer = function () {
            throw new Error(egret.getString(4001));
        };
        /**
         * @private
         * Updates the transform of the slot.
         */
        __egretProto__._updateTransform = function () {
            throw new Error(egret.getString(4001));
        };
        /**
         * @private
         */
        __egretProto__._updateDisplayVisible = function (value) {
            throw new Error(egret.getString(4001));
        };
        /**
         * @private
         * Updates the color of the display object.
         * @param a
         * @param r
         * @param g
         * @param b
         * @param aM
         * @param rM
         * @param gM
         * @param bM
         */
        __egretProto__._updateDisplayColor = function (aOffset, rOffset, gOffset, bOffset, aMultiplier, rMultiplier, gMultiplier, bMultiplier, colorChanged) {
            if (colorChanged === void 0) { colorChanged = false; }
            this._colorTransform.alphaOffset = aOffset;
            this._colorTransform.redOffset = rOffset;
            this._colorTransform.greenOffset = gOffset;
            this._colorTransform.blueOffset = bOffset;
            this._colorTransform.alphaMultiplier = aMultiplier;
            this._colorTransform.redMultiplier = rMultiplier;
            this._colorTransform.greenMultiplier = gMultiplier;
            this._colorTransform.blueMultiplier = bMultiplier;
            this._isColorChanged = colorChanged;
        };
        /**
         * @private
         * Update the blend mode of the display object.
         * @param value The blend mode to use.
         */
        __egretProto__._updateDisplayBlendMode = function (value) {
            throw new Error("Abstract method needs to be implemented in subclass!");
        };
        /** @private When bone timeline enter a key frame, call this func*/
        __egretProto__._arriveAtFrame = function (frame, timelineState, animationState, isCross) {
            var displayControl = animationState.displayControl && animationState.containsBoneMask(this.parent.name);
            if (displayControl) {
                var slotFrame = frame;
                var displayIndex = slotFrame.displayIndex;
                var childSlot;
                this._changeDisplay(displayIndex);
                this._updateDisplayVisible(slotFrame.visible);
                if (displayIndex >= 0) {
                    if (!isNaN(slotFrame.zOrder) && slotFrame.zOrder != this._tweenZOrder) {
                        this._tweenZOrder = slotFrame.zOrder;
                        this._armature._slotsZOrderChanged = true;
                    }
                }
                //[TODO]currently there is only gotoAndPlay belongs to frame action. In future, there will be more.
                //后续会扩展更多的action，目前只有gotoAndPlay的含义
                if (frame.action) {
                    if (this.childArmature) {
                        this.childArmature.animation.gotoAndPlay(frame.action);
                    }
                }
            }
        };
        __egretProto__._updateGlobal = function () {
            this._calculateRelativeParentTransform();
            dragonBones.TransformUtil.transformToMatrix(this._global, this._globalTransformMatrix, true);
            var output = this._calculateParentTransform();
            if (output) {
                this._globalTransformMatrix.concat(output.parentGlobalTransformMatrix);
                dragonBones.TransformUtil.matrixToTransform(this._globalTransformMatrix, this._global, this._global.scaleX * output.parentGlobalTransform.scaleX >= 0, this._global.scaleY * output.parentGlobalTransform.scaleY >= 0);
            }
            return output;
        };
        return Slot;
    })(dragonBones.DBObject);
    dragonBones.Slot = Slot;
    Slot.prototype.__class__ = "dragonBones.Slot";
})(dragonBones || (dragonBones = {}));
