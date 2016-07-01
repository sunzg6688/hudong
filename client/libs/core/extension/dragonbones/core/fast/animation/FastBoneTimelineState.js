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
     * @class dragonBones.FastBoneTimelineState
     * @classdesc
     * FastBoneTimelineState 负责计算 Bone 的时间轴动画。
     * FastBoneTimelineState 实例隶属于 FastAnimationState. FastAnimationState在创建时会为每个包含动作的 FastBone生成一个 FastBoneTimelineState 实例.
     * @see dragonBones.FastAnimation
     * @see dragonBones.FastAnimationState
     * @see dragonBones.FastBone
     */
    var FastBoneTimelineState = (function () {
        function FastBoneTimelineState() {
            this._totalTime = 0; //duration
            this._currentTime = 0;
            this._lastTime = 0;
            this._currentFrameIndex = 0;
            this._currentFramePosition = 0;
            this._currentFrameDuration = 0;
            this._updateMode = 0;
            this._transform = new dragonBones.DBTransform();
            this._durationTransform = new dragonBones.DBTransform();
            this._transformToFadein = new dragonBones.DBTransform();
        }
        var __egretProto__ = FastBoneTimelineState.prototype;
        /** @private */
        FastBoneTimelineState.borrowObject = function () {
            if (FastBoneTimelineState._pool.length == 0) {
                return new FastBoneTimelineState();
            }
            return FastBoneTimelineState._pool.pop();
        };
        /** @private */
        FastBoneTimelineState.returnObject = function (timeline) {
            if (FastBoneTimelineState._pool.indexOf(timeline) < 0) {
                FastBoneTimelineState._pool[FastBoneTimelineState._pool.length] = timeline;
            }
            timeline.clear();
        };
        /** @private */
        FastBoneTimelineState.clear = function () {
            var i = FastBoneTimelineState._pool.length;
            while (i--) {
                FastBoneTimelineState._pool[i].clear();
            }
            FastBoneTimelineState._pool.length = 0;
        };
        __egretProto__.clear = function () {
            if (this._bone) {
                this._bone._timelineState = null;
                this._bone = null;
            }
            this._animationState = null;
            this._timelineData = null;
        };
        /** @private */
        __egretProto__.fadeIn = function (bone, animationState, timelineData) {
            this._bone = bone;
            this._animationState = animationState;
            this._timelineData = timelineData;
            this.name = timelineData.name;
            this._totalTime = this._timelineData.duration;
            this._isComplete = false;
            this._tweenTransform = false;
            this._currentFrameIndex = -1;
            this._currentTime = -1;
            this._tweenEasing = NaN;
            switch (this._timelineData.frameList.length) {
                case 0:
                    this._updateMode = 0;
                    break;
                case 1:
                    this._updateMode = 1;
                    break;
                default:
                    this._updateMode = -1;
                    break;
            }
            if (animationState._fadeTotalTime > 0) {
                var pivotToFadein;
                if (this._bone._timelineState) {
                    this._transformToFadein.copy(this._bone._timelineState._transform);
                }
                else {
                    this._transformToFadein = new dragonBones.DBTransform();
                }
                var firstFrame = (this._timelineData.frameList[0]);
                this._durationTransform.copy(firstFrame.transform);
                this._durationTransform.minus(this._transformToFadein);
            }
            this._bone._timelineState = this;
        };
        /** @private */
        __egretProto__.updateFade = function (progress) {
            this._transform.x = this._transformToFadein.x + this._durationTransform.x * progress;
            this._transform.y = this._transformToFadein.y + this._durationTransform.y * progress;
            this._transform.scaleX = this._transformToFadein.scaleX * (1 + (this._durationTransform.scaleX - 1) * progress);
            this._transform.scaleY = this._transformToFadein.scaleX * (1 + (this._durationTransform.scaleY - 1) * progress);
            this._transform.rotation = this._transformToFadein.rotation + this._durationTransform.rotation * progress;
            this._bone.invalidUpdate();
        };
        /** @private */
        __egretProto__.update = function (progress) {
            if (this._updateMode == 1) {
                this._updateMode = 0;
                this.updateSingleFrame();
            }
            else if (this._updateMode == -1) {
                this.updateMultipleFrame(progress);
            }
        };
        __egretProto__.updateSingleFrame = function () {
            var currentFrame = (this._timelineData.frameList[0]);
            this._bone.arriveAtFrame(currentFrame, this._animationState);
            this._isComplete = true;
            this._tweenEasing = NaN;
            this._tweenTransform = false;
            this._transform.copy(currentFrame.transform);
            this._bone.invalidUpdate();
        };
        __egretProto__.updateMultipleFrame = function (progress) {
            var currentPlayTimes = 0;
            progress /= this._timelineData.scale;
            progress += this._timelineData.offset;
            var currentTime = this._totalTime * progress;
            var playTimes = this._animationState.playTimes;
            if (playTimes == 0) {
                this._isComplete = false;
                currentPlayTimes = Math.ceil(Math.abs(currentTime) / this._totalTime) || 1;
                currentTime -= Math.floor(currentTime / this._totalTime) * this._totalTime;
                if (currentTime < 0) {
                    currentTime += this._totalTime;
                }
            }
            else {
                var totalTimes = playTimes * this._totalTime;
                if (currentTime >= totalTimes) {
                    currentTime = totalTimes;
                    this._isComplete = true;
                }
                else if (currentTime <= -totalTimes) {
                    currentTime = -totalTimes;
                    this._isComplete = true;
                }
                else {
                    this._isComplete = false;
                }
                if (currentTime < 0) {
                    currentTime += totalTimes;
                }
                currentPlayTimes = Math.ceil(currentTime / this._totalTime) || 1;
                if (this._isComplete) {
                    currentTime = this._totalTime;
                }
                else {
                    currentTime -= Math.floor(currentTime / this._totalTime) * this._totalTime;
                }
            }
            if (this._currentTime != currentTime) {
                this._lastTime = this._currentTime;
                this._currentTime = currentTime;
                var frameList = this._timelineData.frameList;
                var prevFrame;
                var currentFrame;
                for (var i = 0, l = this._timelineData.frameList.length; i < l; ++i) {
                    if (this._currentFrameIndex < 0) {
                        this._currentFrameIndex = 0;
                    }
                    else if (this._currentTime < this._currentFramePosition || this._currentTime >= this._currentFramePosition + this._currentFrameDuration || this._currentTime < this._lastTime) {
                        this._currentFrameIndex++;
                        this._lastTime = this._currentTime;
                        if (this._currentFrameIndex >= frameList.length) {
                            if (this._isComplete) {
                                this._currentFrameIndex--;
                                break;
                            }
                            else {
                                this._currentFrameIndex = 0;
                            }
                        }
                    }
                    else {
                        break;
                    }
                    currentFrame = (frameList[this._currentFrameIndex]);
                    if (prevFrame) {
                        this._bone.arriveAtFrame(prevFrame, this._animationState);
                    }
                    this._currentFrameDuration = currentFrame.duration;
                    this._currentFramePosition = currentFrame.position;
                    prevFrame = currentFrame;
                }
                if (currentFrame) {
                    this._bone.arriveAtFrame(currentFrame, this._animationState);
                    this.updateToNextFrame(currentPlayTimes);
                }
                if (this._tweenTransform) {
                    this.updateTween();
                }
            }
        };
        __egretProto__.updateToNextFrame = function (currentPlayTimes) {
            if (currentPlayTimes === void 0) { currentPlayTimes = 0; }
            var nextFrameIndex = this._currentFrameIndex + 1;
            if (nextFrameIndex >= this._timelineData.frameList.length) {
                nextFrameIndex = 0;
            }
            var currentFrame = (this._timelineData.frameList[this._currentFrameIndex]);
            var nextFrame = (this._timelineData.frameList[nextFrameIndex]);
            var tweenEnabled = false;
            if (nextFrameIndex == 0 && (this._animationState.playTimes && this._animationState.currentPlayTimes >= this._animationState.playTimes && ((this._currentFramePosition + this._currentFrameDuration) / this._totalTime + currentPlayTimes - this._timelineData.offset) * this._timelineData.scale > 0.999999)) {
                this._tweenEasing = NaN;
                tweenEnabled = false;
            }
            else if (this._animationState.autoTween) {
                this._tweenEasing = this._animationState.animationData.tweenEasing;
                if (isNaN(this._tweenEasing)) {
                    this._tweenEasing = currentFrame.tweenEasing;
                    this._tweenCurve = currentFrame.curve;
                    if (isNaN(this._tweenEasing) && this._tweenCurve == null) {
                        tweenEnabled = false;
                    }
                    else {
                        if (this._tweenEasing == 10) {
                            this._tweenEasing = 0;
                        }
                        //_tweenEasing [-1, 0) 0 (0, 1] (1, 2]
                        tweenEnabled = true;
                    }
                }
                else {
                    //_tweenEasing [-1, 0) 0 (0, 1] (1, 2]
                    tweenEnabled = true;
                }
            }
            else {
                this._tweenEasing = currentFrame.tweenEasing;
                this._tweenCurve = currentFrame.curve;
                if ((isNaN(this._tweenEasing) || this._tweenEasing == 10) && this._tweenCurve == null) {
                    this._tweenEasing = NaN;
                    tweenEnabled = false;
                }
                else {
                    //_tweenEasing [-1, 0) 0 (0, 1] (1, 2]
                    tweenEnabled = true;
                }
            }
            if (tweenEnabled) {
                //transform
                this._durationTransform.x = nextFrame.transform.x - currentFrame.transform.x;
                this._durationTransform.y = nextFrame.transform.y - currentFrame.transform.y;
                this._durationTransform.skewX = nextFrame.transform.skewX - currentFrame.transform.skewX;
                this._durationTransform.skewY = nextFrame.transform.skewY - currentFrame.transform.skewY;
                this._durationTransform.scaleX = nextFrame.transform.scaleX - currentFrame.transform.scaleX + nextFrame.scaleOffset.x;
                this._durationTransform.scaleY = nextFrame.transform.scaleY - currentFrame.transform.scaleY + nextFrame.scaleOffset.y;
                this._durationTransform.normalizeRotation();
                if (nextFrameIndex == 0) {
                    this._durationTransform.skewX = dragonBones.TransformUtil.formatRadian(this._durationTransform.skewX);
                    this._durationTransform.skewY = dragonBones.TransformUtil.formatRadian(this._durationTransform.skewY);
                }
                if (this._durationTransform.x || this._durationTransform.y || this._durationTransform.skewX || this._durationTransform.skewY || this._durationTransform.scaleX != 1 || this._durationTransform.scaleY != 1) {
                    this._tweenTransform = true;
                }
                else {
                    this._tweenTransform = false;
                }
            }
            else {
                this._tweenTransform = false;
            }
            if (!this._tweenTransform) {
                this._transform.copy(currentFrame.transform);
                this._bone.invalidUpdate();
            }
        };
        __egretProto__.updateTween = function () {
            var progress = (this._currentTime - this._currentFramePosition) / this._currentFrameDuration;
            if (this._tweenCurve) {
                progress = this._tweenCurve.getValueByProgress(progress);
            }
            else if (this._tweenEasing) {
                progress = dragonBones.MathUtil.getEaseValue(progress, this._tweenEasing);
            }
            var currentFrame = (this._timelineData.frameList[this._currentFrameIndex]);
            var currentTransform = currentFrame.transform;
            var currentPivot = currentFrame.pivot;
            //normal blending
            this._transform.x = currentTransform.x + this._durationTransform.x * progress;
            this._transform.y = currentTransform.y + this._durationTransform.y * progress;
            this._transform.skewX = currentTransform.skewX + this._durationTransform.skewX * progress;
            this._transform.skewY = currentTransform.skewY + this._durationTransform.skewY * progress;
            this._transform.scaleX = currentTransform.scaleX + this._durationTransform.scaleX * progress;
            this._transform.scaleY = currentTransform.scaleY + this._durationTransform.scaleY * progress;
            this._bone.invalidUpdate();
        };
        FastBoneTimelineState._pool = [];
        return FastBoneTimelineState;
    })();
    dragonBones.FastBoneTimelineState = FastBoneTimelineState;
    FastBoneTimelineState.prototype.__class__ = "dragonBones.FastBoneTimelineState";
})(dragonBones || (dragonBones = {}));
