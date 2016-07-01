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
     * @class dragonBones.AnimationCacheManager
     * @classdesc
     * AnimationCacheManager 实例是动画缓存管理器，他可以为一个或多个同类型的Armature生成动画缓存数据，从而提高动画运行效率。
     * 目前AnimationCacheManager只支持对FastArmatrue生成缓存，以后会扩展为对任何实现ICacheableArmature接口的Armature生成缓存。
     * @see dragonBones.ICacheableArmature
     * @see dragonBones.FastArmature
     * @see dragonBones.AnimationCache
     * @see dragonBones.FrameCache
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
    var AnimationCacheManager = (function () {
        function AnimationCacheManager() {
            this.animationCacheDic = {};
            //		public var boneFrameCacheDic:Object = {};
            this.slotFrameCacheDic = {};
        }
        var __egretProto__ = AnimationCacheManager.prototype;
        /**
         * 通过ArmatrueData创建并初始化AnimationCacheManager。
         * AnimationCacheManager的创建需要依赖ArmatrueData。
         * @param armatureData {ArmatureData} 骨架数据实例。
         * @param frameRate {number} 帧频。帧频决定生成数据缓存的采样率。
         * @see dragonBones.ArmatureData.
         */
        AnimationCacheManager.initWithArmatureData = function (armatureData, frameRate) {
            if (frameRate === void 0) { frameRate = 0; }
            var output = new AnimationCacheManager();
            output.armatureData = armatureData;
            if (frameRate <= 0) {
                var animationData = armatureData.animationDataList[0];
                if (animationData) {
                    output.frameRate = animationData.frameRate;
                }
            }
            else {
                output.frameRate = frameRate;
            }
            return output;
        };
        /**
         * 为所有动画初始化AnimationCache实例。在生成动画缓存之前需要调用这个API生成相应的AnimationCache实例
         * @see dragonBones.AnimationCache.
         */
        __egretProto__.initAllAnimationCache = function () {
            var length = this.armatureData.animationDataList.length;
            for (var i = 0; i < length; i++) {
                var animationData = this.armatureData.animationDataList[i];
                this.animationCacheDic[animationData.name] = dragonBones.AnimationCache.initWithAnimationData(animationData, this.armatureData);
            }
        };
        /**
         * 指定动画名，初始化AnimationCache实例。在生成动画缓存之前需要调用这个API生成相应的AnimationCache实例
         * @param animationName {string} 动画名。
         * @see dragonBones.AnimationCache.
         */
        __egretProto__.initAnimationCache = function (animationName) {
            this.animationCacheDic[animationName] = dragonBones.AnimationCache.initWithAnimationData(this.armatureData.getAnimationData(animationName), this.armatureData);
        };
        /**
         * 绑定Armature列表做为动画缓存的使用者。
         * 在为Armature生成动画缓存之前，需要将其绑定为动画缓存的使用者
         * @param armatures {Array<any>} 骨架列表。
         * @see dragonBones.ICacheableArmature.
         */
        __egretProto__.bindCacheUserArmatures = function (armatures) {
            var length = armatures.length;
            for (var i = 0; i < length; i++) {
                var armature = armatures[i];
                this.bindCacheUserArmature(armature);
            }
        };
        /**
         * 绑定制定Armature做为动画缓存的使用者。
         * 在为Armature生成动画缓存之前，需要将其绑定为动画缓存的使用者
         * @param armatures {FastArmature} 要绑定为缓存使用者的骨架对象。
         * @see dragonBones.ICacheableArmature.
         */
        __egretProto__.bindCacheUserArmature = function (armature) {
            armature.animation.animationCacheManager = this;
            var cacheUser;
            for (var k in armature._slotDic) {
                cacheUser = armature._slotDic[k];
                cacheUser.frameCache = this.slotFrameCacheDic[cacheUser.name];
            }
            /*
            var length:number = armature._slotDic.length;
            for(var i:number = 0;i < length;i++){
                cacheUser = armature._slotDic[i];
                cacheUser.frameCache = this.slotFrameCacheDic[cacheUser.name];
            }
            */
        };
        /**
         * 设置指定的Armature做为动画缓存的生成器。（同一个Armature可以既是缓存使用者，也是缓存生成器）
         * 在为Armature生成动画缓存之前，需要设置动画缓存的生成器
         * @param armatures {FastArmature} 要设置为缓存生成器的骨架对象。
         * @see dragonBones.ICacheableArmature.
         */
        __egretProto__.setCacheGeneratorArmature = function (armature) {
            this.cacheGeneratorArmature = armature;
            var cacheUser;
            for (var slot in armature._slotDic) {
                cacheUser = armature._slotDic[slot];
                this.slotFrameCacheDic[cacheUser.name] = new dragonBones.SlotFrameCache();
            }
            for (var anim in this.animationCacheDic) {
                var animationCache = this.animationCacheDic[anim];
                animationCache.initSlotTimelineCacheDic(armature._slotDic, this.slotFrameCacheDic);
            }
            /*
            var length1:number = this.animationCacheDic.length;
            for(var i1:number = 0;i1 < length1;i1++){
                var animationCache:AnimationCache = this.animationCacheDic[i1];
//				animationCache.initBoneTimelineCacheDic(armature._boneDic, boneFrameCacheDic);
                animationCache.initSlotTimelineCacheDic(armature._slotDic, this.slotFrameCacheDic);
            }
            */
        };
        /**
         * 生成所有动画缓存数据。生成之后，所有绑定CacheUser的Armature就都能够使用这些缓存了。
         * 在为调用这个API生成动画缓存之前，需要：
         * 1.调用API initAllAnimationCache 初始化AnimationCache实例
         * 2.调用API setCacheGeneratorArmature 设置动画缓存的生成器,
         * 3.调用API bindCacheUserArmatures 绑定动画缓存的使用者
         * @param loop {boolean} 要生成缓存的动画是否需要循环播放。如果该动画在播放时只需要播放一次，则设置为false。如果需要播放大于一次，则设置为true。
         * @see dragonBones.AnimationCache
         */
        __egretProto__.generateAllAnimationCache = function (loop) {
            for (var anim in this.animationCacheDic) {
                var animationCache = this.animationCacheDic[anim];
                this.generateAnimationCache(animationCache.name, loop);
            }
        };
        /**
         * 生成指定动画缓存数据。生成之后，所有绑定CacheUser的Armature就都能够使用这些缓存了。
         * 在为调用这个API生成动画缓存之前，需要：
         * 1.调用API initAnimationCache 初始化AnimationCache实例
         * 2.调用API setCacheGeneratorArmature 设置动画缓存的生成器,
         * 3.调用API bindCacheUserArmatures 绑定动画缓存的使用者
         * @param animationName {string} 要生成缓存的动画名。
         * @param loop {boolean} 要生成缓存的动画是否需要循环播放。如果该动画在播放时只需要播放一次，则设置为false。如果需要播放大于一次，则设置为true。
         * @see dragonBones.AnimationCache
         */
        __egretProto__.generateAnimationCache = function (animationName, loop) {
            var temp = this.cacheGeneratorArmature.enableCache;
            this.cacheGeneratorArmature.enableCache = false;
            var animationCache = this.animationCacheDic[animationName];
            if (!animationCache) {
                return;
            }
            var animationState = this.cacheGeneratorArmature.getAnimation().animationState;
            var passTime = 1 / this.frameRate;
            if (loop) {
                this.cacheGeneratorArmature.getAnimation().gotoAndPlay(animationName, 0, -1, 0);
            }
            else {
                this.cacheGeneratorArmature.getAnimation().gotoAndPlay(animationName, 0, -1, 1);
            }
            var tempEnableEventDispatch = this.cacheGeneratorArmature.enableEventDispatch;
            this.cacheGeneratorArmature.enableEventDispatch = false;
            var lastProgress;
            do {
                lastProgress = animationState.progress;
                this.cacheGeneratorArmature.advanceTime(passTime);
                animationCache.addFrame();
            } while (animationState.progress >= lastProgress && animationState.progress < 1);
            this.cacheGeneratorArmature.enableEventDispatch = tempEnableEventDispatch;
            this.resetCacheGeneratorArmature();
            this.cacheGeneratorArmature.enableCache = temp;
        };
        /**
         * 将缓存生成器骨架重置，生成动画缓存后调用。
         * @see dragonBones.ICacheableArmature
         */
        __egretProto__.resetCacheGeneratorArmature = function () {
            this.cacheGeneratorArmature.resetAnimation();
        };
        /**
         * 获取制定名称的AnimationCache实例。
         * @param animationName {string} 动画名。
         * @see dragonBones.AnimationCache
         */
        __egretProto__.getAnimationCache = function (animationName) {
            return this.animationCacheDic[animationName];
        };
        return AnimationCacheManager;
    })();
    dragonBones.AnimationCacheManager = AnimationCacheManager;
    AnimationCacheManager.prototype.__class__ = "dragonBones.AnimationCacheManager";
})(dragonBones || (dragonBones = {}));
