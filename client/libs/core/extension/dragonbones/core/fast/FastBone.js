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
     * @class dragonBones.FastBone
     * @classdesc
     * FastBone 实例代表 FastArmature 中的一个骨头。一个FastArmature实例可以由很多 FastBone组成。
     * FastBone 在骨骼动画体系中是最重要的逻辑单元之一，负责动画中的平移旋转缩放的实现
     * 和Bone相比，FastBone不能动态添加子骨骼和子插槽
     * @extends dragonBones.FastDBObject
     * @see dragonBones.FastArmature
     * @see dragonBones.FastSlot
     * @see dragonBones.BoneData
     */
    var FastBone = (function (_super) {
        __extends(FastBone, _super);
        function FastBone() {
            _super.call(this);
            this.slotList = [];
            this.boneList = [];
            /** @private */
            this._needUpdate = 0;
            this._needUpdate = 2;
        }
        var __egretProto__ = FastBone.prototype;
        FastBone.initWithBoneData = function (boneData) {
            var outputBone = new FastBone();
            outputBone.name = boneData.name;
            outputBone.inheritRotation = boneData.inheritRotation;
            outputBone.inheritScale = boneData.inheritScale;
            outputBone.origin.copy(boneData.transform);
            return outputBone;
        };
        /**
         * 获取当前骨头包含的所有 FastBone 实例
         * @param returnCopy {boolean} 是否返回拷贝。默认：true
         * @returns {FastBone[]}
         */
        __egretProto__.getBones = function (returnCopy) {
            if (returnCopy === void 0) { returnCopy = true; }
            return returnCopy ? this.boneList.concat() : this.boneList;
        };
        /**
         * 获取当前骨头包含的所有 FastSlot 实例
         * @param returnCopy {boolean} 是否返回拷贝。默认：true
         * @returns {FastSlot[]}
         */
        __egretProto__.getSlots = function (returnCopy) {
            if (returnCopy === void 0) { returnCopy = true; }
            return returnCopy ? this.slotList.concat() : this.slotList;
        };
        /**
         * @inheritDoc
         */
        __egretProto__.dispose = function () {
            _super.prototype.dispose.call(this);
            this._timelineState = null;
        };
        //动画
        /**
         * 在下一帧强制更新当前 Bone 实例及其包含的所有 Slot 的动画。
         */
        __egretProto__.invalidUpdate = function () {
            this._needUpdate = 2;
        };
        __egretProto__._calculateRelativeParentTransform = function () {
            this._global.copy(this._origin);
            if (this._timelineState) {
                this._global.add(this._timelineState._transform);
            }
        };
        /** @private */
        __egretProto__.updateByCache = function () {
            _super.prototype.updateByCache.call(this);
            this._global = this._frameCache.globalTransform;
            this._globalTransformMatrix = this._frameCache.globalTransformMatrix;
        };
        /** @private */
        __egretProto__.update = function (needUpdate) {
            if (needUpdate === void 0) { needUpdate = false; }
            this._needUpdate--;
            if (needUpdate || this._needUpdate > 0 || (this._parent && this._parent._needUpdate > 0)) {
                this._needUpdate = 1;
            }
            else {
                return;
            }
            //计算global
            this._updateGlobal();
        };
        /** @private When bone timeline enter a key frame, call this func*/
        __egretProto__.arriveAtFrame = function (frame, animationState) {
            var childSlot;
            if (frame.event && this.armature.hasEventListener(dragonBones.FrameEvent.BONE_FRAME_EVENT)) {
                var frameEvent = new dragonBones.FrameEvent(dragonBones.FrameEvent.BONE_FRAME_EVENT);
                frameEvent.bone = this;
                frameEvent.animationState = animationState;
                frameEvent.frameLabel = frame.event;
                this.armature._addEvent(frameEvent);
            }
        };
        Object.defineProperty(__egretProto__, "childArmature", {
            /**
             * 不推荐的API,建议使用 slot.childArmature 替代
             */
            get: function () {
                var s = this.slot;
                if (s) {
                    return s.childArmature;
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "display", {
            /**
             * 不推荐的API,建议使用 slot.display 替代
             */
            get: function () {
                var s = this.slot;
                if (s) {
                    return s.display;
                }
                return null;
            },
            set: function (value) {
                var s = this.slot;
                if (s) {
                    s.display = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "visible", {
            /** @private */
            set: function (value) {
                if (this._visible != value) {
                    this._visible = value;
                    for (var i = 0, len = this.armature.slotList.length; i < len; i++) {
                        if (this.armature.slotList[i].parent == this) {
                            this.armature.slotList[i]._updateDisplayVisible(this._visible);
                        }
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "slot", {
            /**
             * 返回当前 FastBone 实例包含的第一个 FastSlot 实例
             * @member {FastSlot} dragonBones.FastBone#slot
             */
            get: function () {
                return this.slotList.length > 0 ? this.slotList[0] : null;
            },
            enumerable: true,
            configurable: true
        });
        return FastBone;
    })(dragonBones.FastDBObject);
    dragonBones.FastBone = FastBone;
    FastBone.prototype.__class__ = "dragonBones.FastBone";
})(dragonBones || (dragonBones = {}));
