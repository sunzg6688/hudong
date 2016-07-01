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
     * @class dragonBones.FastArmature
     * @classdesc
     * FastArmature 是 DragonBones 高效率的骨骼动画系统。他能缓存动画数据，大大减少动画播放的计算
     * 不支持动态添加Bone和Slot，换装请通过更换Slot的dispaly或子骨架childArmature来实现
     * @extends dragonBones.EventDispatcher
     * @see dragonBones.ArmatureData
     *
     * @example
       <pre>
        //获取动画数据
        var skeletonData = RES.getRes("skeleton");
        //获取纹理集数据
        var textureData = RES.getRes("textureConfig");
        //获取纹理集图片
        var texture = RES.getRes("texture");
      
        //创建一个工厂，用来创建Armature
        var factory:dragonBones.EgretFactory = new dragonBones.EgretFactory();
        //把动画数据添加到工厂里
        factory.addSkeletonData(dragonBones.DataParser.parseDragonBonesData(skeletonData));
        //把纹理集数据和图片添加到工厂里
        factory.addTextureAtlas(new dragonBones.EgretTextureAtlas(texture, textureData));
      
        //获取Armature的名字，dragonBones4.0的数据可以包含多个骨架，这里取第一个Armature
        var armatureName:string = skeletonData.armature[0].name;
        //从工厂里创建出Armature
        var armature:dragonBones.FastArmature = factory.buildFastArmature(armatureName);
        //获取装载Armature的容器
        var armatureDisplay = armature.display;
        //把它添加到舞台上
        this.addChild(armatureDisplay);
        
        //以60fps的帧率开启动画缓存，缓存所有的动画数据
        var animationCachManager:dragonBones.AnimationCacheManager = armature.enableAnimationCache(60);
      
       //取得这个Armature动画列表中的第一个动画的名字
        var curAnimationName = armature.animation.animationList[0];
        //播放这个动画，gotoAndPlay各个参数说明
        //第一个参数 animationName {string} 指定播放动画的名称.
        //第二个参数 fadeInTime {number} 动画淡入时间 (>= 0), 默认值：-1 意味着使用动画数据中的淡入时间.
        //第三个参数 duration {number} 动画播放时间。默认值：-1 意味着使用动画数据中的播放时间.
        //第四个参数 layTimes {number} 动画播放次数(0:循环播放, >=1:播放次数, NaN:使用动画数据中的播放时间), 默认值：NaN
        armature.animation.gotoAndPlay(curAnimationName,0.3,-1,0);
      
        //把Armature添加到心跳时钟里
        dragonBones.WorldClock.clock.add(armature);
        //心跳时钟开启
        egret.Ticker.getInstance().register(function (advancedTime) {
            dragonBones.WorldClock.clock.advanceTime(advancedTime / 1000);
        }, this);
       </pre>
     */
    var FastArmature = (function (_super) {
        __extends(FastArmature, _super);
        function FastArmature(display) {
            _super.call(this);
            /**
             * 保证CacheManager是独占的前提下可以开启，开启后有助于性能提高
             */
            this.isCacheManagerExclusive = false;
            this._enableEventDispatch = true;
            this.useCache = true;
            this._display = display;
            this._animation = new dragonBones.FastAnimation(this);
            this._slotsZOrderChanged = false;
            this._armatureData = null;
            this.boneList = [];
            this._boneDic = {};
            this.slotList = [];
            this._slotDic = {};
            this.slotHasChildArmatureList = [];
            this._eventList = [];
            this._delayDispose = false;
            this._lockDispose = false;
        }
        var __egretProto__ = FastArmature.prototype;
        /**
         * Cleans up any resources used by this instance.
         */
        __egretProto__.dispose = function () {
            this._delayDispose = true;
            if (!this._animation || this._lockDispose) {
                return;
            }
            this.userData = null;
            this._animation.dispose();
            var i = this.slotList.length;
            while (i--) {
                this.slotList[i].dispose();
            }
            i = this.boneList.length;
            while (i--) {
                this.boneList[i].dispose();
            }
            this.slotList.length = 0;
            this.boneList.length = 0;
            this._armatureData = null;
            this._animation = null;
            this.slotList = null;
            this.boneList = null;
            this._eventList = null;
        };
        /**
         * Update the animation using this method typically in an ENTERFRAME Event or with a Timer.
         * @param The amount of second to move the playhead ahead.
         */
        __egretProto__.advanceTime = function (passedTime) {
            this._lockDispose = true;
            this._animation.advanceTime(passedTime);
            var bone;
            var slot;
            var i = 0;
            if (this._animation.animationState.isUseCache()) {
                if (!this.useCache) {
                    this.useCache = true;
                }
                i = this.slotList.length;
                while (i--) {
                    slot = this.slotList[i];
                    slot.updateByCache();
                }
            }
            else {
                if (this.useCache) {
                    this.useCache = false;
                    i = this.slotList.length;
                    while (i--) {
                        slot = this.slotList[i];
                        slot.switchTransformToBackup();
                    }
                }
                i = this.boneList.length;
                while (i--) {
                    bone = this.boneList[i];
                    bone.update();
                }
                i = this.slotList.length;
                while (i--) {
                    slot = this.slotList[i];
                    slot._update();
                }
            }
            i = this.slotHasChildArmatureList.length;
            while (i--) {
                slot = this.slotHasChildArmatureList[i];
                var childArmature = slot.childArmature;
                if (childArmature) {
                    childArmature.advanceTime(passedTime);
                }
            }
            if (this._slotsZOrderChanged) {
                this.updateSlotsZOrder();
            }
            while (this._eventList.length > 0) {
                this.dispatchEvent(this._eventList.shift());
            }
            this._lockDispose = false;
            if (this._delayDispose) {
                this.dispose();
            }
        };
        /**
         * 开启动画缓存
         * @param  {number} 帧速率，每秒缓存多少次数据，越大越流畅,若值小于零会被设置为动画数据中的默认帧率
         * @param  {Array<any>} 需要缓存的动画列表，如果为null，则全部动画都缓存
         * @param  {boolean} 动画是否是循环动画，仅在3.0以下的数据格式使用，如果动画不是循环动画请设置为false，默认为true。
         * @return {AnimationCacheManager}  返回缓存管理器，可以绑定到其他armature以减少内存
         */
        __egretProto__.enableAnimationCache = function (frameRate, animationList, loop) {
            if (animationList === void 0) { animationList = null; }
            if (loop === void 0) { loop = true; }
            var animationCacheManager = dragonBones.AnimationCacheManager.initWithArmatureData(this.armatureData, frameRate);
            if (animationList) {
                var length = animationList.length;
                for (var i = 0; i < length; i++) {
                    var animationName = animationList[i];
                    animationCacheManager.initAnimationCache(animationName);
                }
            }
            else {
                animationCacheManager.initAllAnimationCache();
            }
            animationCacheManager.setCacheGeneratorArmature(this);
            animationCacheManager.generateAllAnimationCache(loop);
            animationCacheManager.bindCacheUserArmature(this);
            this.enableCache = true;
            return animationCacheManager;
        };
        /**
         * 获取指定名称的 Bone
         * @param boneName {string} Bone名称
         * @returns {FastBone}
         */
        __egretProto__.getBone = function (boneName) {
            return this._boneDic[boneName];
        };
        /**
         * 获取指定名称的 Slot
         * @param slotName {string} Slot名称
         * @returns {FastSlot}
         */
        __egretProto__.getSlot = function (slotName) {
            return this._slotDic[slotName];
        };
        /**
         * 获取包含指定显示对象的 Bone
         * @param display {any} 显示对象实例
         * @returns {FastBone}
         */
        __egretProto__.getBoneByDisplay = function (display) {
            var slot = this.getSlotByDisplay(display);
            return slot ? slot.parent : null;
        };
        /**
         * 获取包含指定显示对象的 Slot
         * @param displayObj {any} 显示对象实例
         * @returns {FastSlot}
         */
        __egretProto__.getSlotByDisplay = function (displayObj) {
            if (displayObj) {
                for (var i = 0, len = this.slotList.length; i < len; i++) {
                    if (this.slotList[i].display == displayObj) {
                        return this.slotList[i];
                    }
                }
            }
            return null;
        };
        /**
         * 获取骨架包含的所有插槽
         * @param returnCopy {boolean} 是否返回拷贝。默认：true
         * @returns {FastSlot[]}
         */
        __egretProto__.getSlots = function (returnCopy) {
            if (returnCopy === void 0) { returnCopy = true; }
            return returnCopy ? this.slotList.concat() : this.slotList;
        };
        __egretProto__._updateBonesByCache = function () {
            var i = this.boneList.length;
            var bone;
            while (i--) {
                bone = this.boneList[i];
                bone.update();
            }
        };
        /**
         * 在骨架中为指定名称的 FastBone 添加一个子 FastBone.
         * 和Armature不同,FastArmature的这个方法不能在运行时动态添加骨骼
         * @param bone {FastBone} FastBone 实例
         * @param parentName {string} 父骨头名称 默认：null
         */
        __egretProto__.addBone = function (bone, parentName) {
            if (parentName === void 0) { parentName = null; }
            var parentBone;
            if (parentName) {
                parentBone = this.getBone(parentName);
                parentBone.boneList.push(bone);
            }
            bone.armature = this;
            bone.setParent(parentBone);
            this.boneList.unshift(bone);
            this._boneDic[bone.name] = bone;
        };
        /**
         * 为指定名称的 FastBone 添加一个子 FastSlot.
         * 和Armature不同,FastArmature的这个方法不能在运行时动态添加插槽
         * @param slot {FastSlot} FastSlot 实例
         * @param boneName {string}
         * @see dragonBones.Bone
         */
        __egretProto__.addSlot = function (slot, parentBoneName) {
            var bone = this.getBone(parentBoneName);
            if (bone) {
                slot.armature = this;
                slot.setParent(bone);
                bone.slotList.push(slot);
                slot._addDisplayToContainer(this.display);
                this.slotList.push(slot);
                this._slotDic[slot.name] = slot;
                if (slot.hasChildArmature) {
                    this.slotHasChildArmatureList.push(slot);
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * 按照显示层级为所有 Slot 排序
         */
        __egretProto__.updateSlotsZOrder = function () {
            this.slotList.sort(this.sortSlot);
            var i = this.slotList.length;
            while (i--) {
                var slot = this.slotList[i];
                if ((slot._frameCache && (slot._frameCache).displayIndex >= 0) || (!slot._frameCache && slot.displayIndex >= 0)) {
                    slot._addDisplayToContainer(this._display);
                }
            }
            this._slotsZOrderChanged = false;
        };
        __egretProto__.sortBoneList = function () {
            var i = this.boneList.length;
            if (i == 0) {
                return;
            }
            var helpArray = [];
            while (i--) {
                var level = 0;
                var bone = this.boneList[i];
                var boneParent = bone;
                while (boneParent) {
                    level++;
                    boneParent = boneParent.parent;
                }
                helpArray[i] = [level, bone];
            }
            helpArray.sort(dragonBones.ArmatureData.sortBoneDataHelpArrayDescending);
            i = helpArray.length;
            while (i--) {
                this.boneList[i] = helpArray[i][1];
            }
            helpArray.length = 0;
        };
        /** @private When AnimationState enter a key frame, call this func*/
        __egretProto__.arriveAtFrame = function (frame, animationState) {
            if (frame.event && this.hasEventListener(dragonBones.FrameEvent.ANIMATION_FRAME_EVENT)) {
                var frameEvent = new dragonBones.FrameEvent(dragonBones.FrameEvent.ANIMATION_FRAME_EVENT);
                frameEvent.animationState = animationState;
                frameEvent.frameLabel = frame.event;
                this._addEvent(frameEvent);
            }
            if (frame.action) {
                this.animation.gotoAndPlay(frame.action);
            }
        };
        __egretProto__.invalidUpdate = function (boneName) {
            if (boneName === void 0) { boneName = null; }
            if (boneName) {
                var bone = this.getBone(boneName);
                if (bone) {
                    bone.invalidUpdate();
                }
            }
            else {
                var i = this.boneList.length;
                while (i--) {
                    this.boneList[i].invalidUpdate();
                }
            }
        };
        __egretProto__.resetAnimation = function () {
            this.animation.animationState._resetTimelineStateList();
            var length = this.boneList.length;
            for (var i = 0; i < length; i++) {
                var boneItem = this.boneList[i];
                boneItem._timelineState = null;
            }
            this.animation.stop();
        };
        __egretProto__.sortSlot = function (slot1, slot2) {
            return slot1.zOrder < slot2.zOrder ? 1 : -1;
        };
        /**
         * 获取FastAnimation实例
         * @returns {any} FastAnimation实例
         */
        __egretProto__.getAnimation = function () {
            return this._animation;
        };
        Object.defineProperty(__egretProto__, "armatureData", {
            /**
             * ArmatureData.
             * @see dragonBones.objects.ArmatureData.
             */
            get: function () {
                return this._armatureData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "animation", {
            /**
             * An Animation instance
             * @see dragonBones.animation.Animation
             */
            get: function () {
                return this._animation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "display", {
            /**
             * Armature's display object. It's instance type depends on render engine. For example "flash.display.DisplayObject" or "startling.display.DisplayObject"
             */
            get: function () {
                return this._display;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "enableCache", {
            get: function () {
                return this._enableCache;
            },
            set: function (value) {
                this._enableCache = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "enableEventDispatch", {
            get: function () {
                return this._enableEventDispatch;
            },
            set: function (value) {
                this._enableEventDispatch = value;
            },
            enumerable: true,
            configurable: true
        });
        __egretProto__._addEvent = function (event) {
            if (this._enableEventDispatch) {
                this._eventList.push(event);
            }
        };
        return FastArmature;
    })(dragonBones.EventDispatcher);
    dragonBones.FastArmature = FastArmature;
    FastArmature.prototype.__class__ = "dragonBones.FastArmature";
})(dragonBones || (dragonBones = {}));
