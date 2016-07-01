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
     * @class dragonBones.FastSlot
     * @classdesc
     * FastSlot 实例是骨头上的一个插槽，是显示图片的容器。
     * 一个 FastBone 上可以有多个FastSlot，每个FastSlot中同一时间都会有一张图片用于显示，不同的FastSlot中的图片可以同时显示。
     * 每个 FastSlot 中可以包含多张图片，同一个 FastSlot 中的不同图片不能同时显示，但是可以在动画进行的过程中切换，用于实现帧动画。
     * @extends dragonBones.DBObject
     * @see dragonBones.FastArmature
     * @see dragonBones.FastBone
     * @see dragonBones.SlotData
     */
    var FastSlot = (function (_super) {
        __extends(FastSlot, _super);
        function FastSlot(self) {
            _super.call(this);
            this._currentDisplayIndex = 0;
            if (self != this) {
                throw new Error("Abstract class can not be instantiated!");
            }
            this.hasChildArmature = false;
            this._currentDisplayIndex = -1;
            this._originZOrder = 0;
            this._tweenZOrder = 0;
            this._offsetZOrder = 0;
            this._colorTransform = new dragonBones.ColorTransform();
            this._isColorChanged = false;
            this._displayDataList = null;
            this._currentDisplay = null;
            this.inheritRotation = true;
            this.inheritScale = true;
        }
        var __egretProto__ = FastSlot.prototype;
        /**
         * 通过传入 SlotData 初始化FastSlot
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
            this._displayDataList = null;
            this._displayList = null;
            this._currentDisplay = null;
        };
        //动画
        /** @private */
        __egretProto__.updateByCache = function () {
            _super.prototype.updateByCache.call(this);
            this._updateTransform();
            //颜色
            var cacheColor = (this._frameCache).colorTransform;
            var cacheColorChanged = cacheColor != null;
            if (this.colorChanged != cacheColorChanged || (this.colorChanged && cacheColorChanged && !dragonBones.ColorTransformUtil.isEqual(this._colorTransform, cacheColor))) {
                cacheColor = cacheColor || dragonBones.ColorTransformUtil.originalColor;
                this._updateDisplayColor(cacheColor.alphaOffset, cacheColor.redOffset, cacheColor.greenOffset, cacheColor.blueOffset, cacheColor.alphaMultiplier, cacheColor.redMultiplier, cacheColor.greenMultiplier, cacheColor.blueMultiplier, cacheColorChanged);
            }
            //displayIndex
            this._changeDisplayIndex((this._frameCache).displayIndex);
        };
        /** @private */
        __egretProto__._update = function () {
            if (this._parent._needUpdate <= 0) {
                return;
            }
            this._updateGlobal();
            this._updateTransform();
        };
        __egretProto__._calculateRelativeParentTransform = function () {
            this._global.copy(this._origin);
        };
        __egretProto__.initDisplayList = function (newDisplayList) {
            this._displayList = newDisplayList;
        };
        __egretProto__.clearCurrentDisplay = function () {
            if (this.hasChildArmature) {
                var targetArmature = this.childArmature;
                if (targetArmature) {
                    targetArmature.resetAnimation();
                }
            }
            var slotIndex = this._getDisplayIndex();
            this._removeDisplayFromContainer();
            return slotIndex;
        };
        /** @private */
        __egretProto__._changeDisplayIndex = function (displayIndex) {
            if (displayIndex === void 0) { displayIndex = 0; }
            if (this._currentDisplayIndex == displayIndex) {
                return;
            }
            var slotIndex = -1;
            if (this._currentDisplayIndex >= 0) {
                slotIndex = this.clearCurrentDisplay();
            }
            this._currentDisplayIndex = displayIndex;
            if (this._currentDisplayIndex >= 0) {
                this._origin.copy(this._displayDataList[this._currentDisplayIndex].transform);
                this.initCurrentDisplay(slotIndex);
            }
        };
        //currentDisplayIndex不变，改变内容，必须currentDisplayIndex >=0
        __egretProto__.changeSlotDisplay = function (value) {
            var slotIndex = this.clearCurrentDisplay();
            this._displayList[this._currentDisplayIndex] = value;
            this.initCurrentDisplay(slotIndex);
        };
        __egretProto__.initCurrentDisplay = function (slotIndex) {
            if (slotIndex === void 0) { slotIndex = 0; }
            var display = this._displayList[this._currentDisplayIndex];
            if (display) {
                if (display instanceof dragonBones.FastArmature) {
                    this._currentDisplay = display.display;
                }
                else {
                    this._currentDisplay = display;
                }
            }
            else {
                this._currentDisplay = null;
            }
            this._updateDisplay(this._currentDisplay);
            if (this._currentDisplay) {
                if (slotIndex != -1) {
                    this._addDisplayToContainer(this.armature.display, slotIndex);
                }
                else {
                    this.armature._slotsZOrderChanged = true;
                    this._addDisplayToContainer(this.armature.display);
                }
                if (this._blendMode) {
                    this._updateDisplayBlendMode(this._blendMode);
                }
                if (this._isColorChanged) {
                    this._updateDisplayColor(this._colorTransform.alphaOffset, this._colorTransform.redOffset, this._colorTransform.greenOffset, this._colorTransform.blueOffset, this._colorTransform.alphaMultiplier, this._colorTransform.redMultiplier, this._colorTransform.greenMultiplier, this._colorTransform.blueMultiplier, true);
                }
                this._updateTransform();
                if (display instanceof dragonBones.FastArmature) {
                    var targetArmature = (display);
                    if (this.armature && this.armature.animation.animationState && targetArmature.animation.hasAnimation(this.armature.animation.animationState.name)) {
                        targetArmature.animation.gotoAndPlay(this.armature.animation.animationState.name);
                    }
                    else {
                        targetArmature.animation.play();
                    }
                }
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
             * @member {any[]} dragonBones.FastSlot#displayList
             */
            get: function () {
                return this._displayList;
            },
            set: function (value) {
                //todo: 考虑子骨架变化的各种情况
                if (!value) {
                    throw new Error();
                }
                var newDisplay = value[this._currentDisplayIndex];
                var displayChanged = this._currentDisplayIndex >= 0 && this._displayList[this._currentDisplayIndex] != newDisplay;
                this._displayList = value;
                if (displayChanged) {
                    this.changeSlotDisplay(newDisplay);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "display", {
            /**
             * 当前的显示对象(可能是 display 或者 子骨架)
             * @member {any} dragonBones.FastSlot#display
             */
            get: function () {
                return this._currentDisplay;
            },
            set: function (value) {
                //todo: 考虑子骨架变化的各种情况
                if (this._currentDisplayIndex < 0) {
                    return;
                }
                if (this._displayList[this._currentDisplayIndex] == value) {
                    return;
                }
                this.changeSlotDisplay(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "childArmature", {
            /**
             * 当前的子骨架
             * @member {FastArmature} dragonBones.Slot#childArmature
             */
            get: function () {
                return (this._displayList[this._currentDisplayIndex] instanceof dragonBones.Armature || this._displayList[this._currentDisplayIndex] instanceof dragonBones.FastArmature) ? this._displayList[this._currentDisplayIndex] : null;
            },
            set: function (value) {
                this.display = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "zOrder", {
            /**
             * 显示顺序。(支持小数用于实现动态插入slot)
             * @member {number} dragonBones.FastSlot#zOrder
             */
            get: function () {
                return this._originZOrder + this._tweenZOrder + this._offsetZOrder;
            },
            set: function (value) {
                if (this.zOrder != value) {
                    this._offsetZOrder = value - this._originZOrder - this._tweenZOrder;
                    if (this.armature) {
                        this.armature._slotsZOrderChanged = true;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "blendMode", {
            /**
             * 混合模式
             * @member {string} dragonBones.FastSlot#blendMode
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
        Object.defineProperty(__egretProto__, "colorTransform", {
            /**
             * Indicates the Bone instance that directly contains this DBObject instance if any.
             */
            get: function () {
                return this._colorTransform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "displayIndex", {
            get: function () {
                return this._currentDisplayIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "colorChanged", {
            get: function () {
                return this._isColorChanged;
            },
            enumerable: true,
            configurable: true
        });
        //Abstract method
        /**
         * @private
         */
        __egretProto__._updateDisplay = function (value) {
            throw new Error("Abstract method needs to be implemented in subclass!");
        };
        /**
         * @private
         */
        __egretProto__._getDisplayIndex = function () {
            throw new Error("Abstract method needs to be implemented in subclass!");
        };
        /**
         * @private
         * Adds the original display object to another display object.
         * @param container
         * @param index
         */
        __egretProto__._addDisplayToContainer = function (container, index) {
            if (index === void 0) { index = -1; }
            throw new Error("Abstract method needs to be implemented in subclass!");
        };
        /**
         * @private
         * remove the original display object from its parent.
         */
        __egretProto__._removeDisplayFromContainer = function () {
            throw new Error("Abstract method needs to be implemented in subclass!");
        };
        /**
         * @private
         * Updates the transform of the slot.
         */
        __egretProto__._updateTransform = function () {
            throw new Error("Abstract method needs to be implemented in subclass!");
        };
        /**
         * @private
         */
        __egretProto__._updateDisplayVisible = function (value) {
            throw new Error("Abstract method needs to be implemented in subclass!");
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
        /** @private When slot timeline enter a key frame, call this func*/
        __egretProto__._arriveAtFrame = function (frame, animationState) {
            var slotFrame = frame;
            var displayIndex = slotFrame.displayIndex;
            this._changeDisplayIndex(displayIndex);
            this._updateDisplayVisible(slotFrame.visible);
            if (displayIndex >= 0) {
                if (!isNaN(slotFrame.zOrder) && slotFrame.zOrder != this._tweenZOrder) {
                    this._tweenZOrder = slotFrame.zOrder;
                    this.armature._slotsZOrderChanged = true;
                }
            }
            //[TODO]currently there is only gotoAndPlay belongs to frame action. In future, there will be more.  
            //后续会扩展更多的action，目前只有gotoAndPlay的含义
            if (frame.action) {
                var targetArmature = this.childArmature;
                if (targetArmature) {
                    targetArmature.getAnimation().gotoAndPlay(frame.action);
                }
            }
        };
        /** @private */
        __egretProto__.hideSlots = function () {
            this._changeDisplayIndex(-1);
            this._removeDisplayFromContainer();
            if (this._frameCache) {
                this._frameCache.clear();
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
        return FastSlot;
    })(dragonBones.FastDBObject);
    dragonBones.FastSlot = FastSlot;
    FastSlot.prototype.__class__ = "dragonBones.FastSlot";
})(dragonBones || (dragonBones = {}));
