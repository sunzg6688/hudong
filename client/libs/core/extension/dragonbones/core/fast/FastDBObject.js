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
     * @class dragonBones.FastDBObject
     * @classdesc
     * FastDBObject 是 FastBone 和 FastSlot 的基类
     * @see dragonBones.FastBone
     * @see dragonBones.FastSlot
     */
    var FastDBObject = (function () {
        function FastDBObject() {
            this._globalTransformMatrix = new dragonBones.Matrix();
            this._global = new dragonBones.DBTransform();
            this._origin = new dragonBones.DBTransform();
            this._visible = true;
            this.armature = null;
            this._parent = null;
            this.userData = null;
            this.inheritRotation = true;
            this.inheritScale = true;
            this.inheritTranslation = true;
        }
        var __egretProto__ = FastDBObject.prototype;
        /** @private */
        __egretProto__.updateByCache = function () {
            this._global = this._frameCache.globalTransform;
            this._globalTransformMatrix = this._frameCache.globalTransformMatrix;
        };
        /** @private */
        __egretProto__.switchTransformToBackup = function () {
            if (!this._globalBackup) {
                this._globalBackup = new dragonBones.DBTransform();
                this._globalTransformMatrixBackup = new dragonBones.Matrix();
            }
            this._global = this._globalBackup;
            this._globalTransformMatrix = this._globalTransformMatrixBackup;
        };
        /** @private */
        __egretProto__.setParent = function (value) {
            this._parent = value;
        };
        /**
         * Cleans up any resources used by this DBObject instance.
         */
        __egretProto__.dispose = function () {
            this.userData = null;
            this._globalTransformMatrix = null;
            this._global = null;
            this._origin = null;
            this.armature = null;
            this._parent = null;
        };
        __egretProto__._calculateParentTransform = function () {
            if (this.parent && (this.inheritTranslation || this.inheritRotation || this.inheritScale)) {
                var parentGlobalTransform = this._parent._global;
                var parentGlobalTransformMatrix = this._parent._globalTransformMatrix;
                if (!this.inheritTranslation && (parentGlobalTransform.x != 0 || parentGlobalTransform.y != 0) || !this.inheritRotation && (parentGlobalTransform.skewX != 0 || parentGlobalTransform.skewY != 0) || !this.inheritScale && (parentGlobalTransform.scaleX != 1 || parentGlobalTransform.scaleY != 1)) {
                    parentGlobalTransform = FastDBObject._tempParentGlobalTransform;
                    parentGlobalTransform.copy(this._parent._global);
                    if (!this.inheritTranslation) {
                        parentGlobalTransform.x = 0;
                        parentGlobalTransform.y = 0;
                    }
                    if (!this.inheritScale) {
                        parentGlobalTransform.scaleX = 1;
                        parentGlobalTransform.scaleY = 1;
                    }
                    if (!this.inheritRotation) {
                        parentGlobalTransform.skewX = 0;
                        parentGlobalTransform.skewY = 0;
                    }
                    parentGlobalTransformMatrix = dragonBones.DBObject._tempParentGlobalTransformMatrix;
                    dragonBones.TransformUtil.transformToMatrix(parentGlobalTransform, parentGlobalTransformMatrix);
                }
                FastDBObject.tempOutputObj.parentGlobalTransform = parentGlobalTransform;
                FastDBObject.tempOutputObj.parentGlobalTransformMatrix = parentGlobalTransformMatrix;
                return FastDBObject.tempOutputObj;
            }
            return null;
        };
        __egretProto__._updateGlobal = function () {
            this._calculateRelativeParentTransform();
            var output = this._calculateParentTransform();
            if (output != null) {
                //计算父骨头绝对坐标
                var parentMatrix = output.parentGlobalTransformMatrix;
                var parentGlobalTransform = output.parentGlobalTransform;
                //计算绝对坐标
                var x = this._global.x;
                var y = this._global.y;
                this._global.x = parentMatrix.a * x + parentMatrix.c * y + parentMatrix.tx;
                this._global.y = parentMatrix.d * y + parentMatrix.b * x + parentMatrix.ty;
                if (this.inheritRotation) {
                    this._global.skewX += parentGlobalTransform.skewX;
                    this._global.skewY += parentGlobalTransform.skewY;
                }
                if (this.inheritScale) {
                    this._global.scaleX *= parentGlobalTransform.scaleX;
                    this._global.scaleY *= parentGlobalTransform.scaleY;
                }
            }
            dragonBones.TransformUtil.transformToMatrix(this._global, this._globalTransformMatrix, true);
            return output;
        };
        __egretProto__._calculateRelativeParentTransform = function () {
        };
        Object.defineProperty(__egretProto__, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "global", {
            /**
             * This DBObject instance global transform instance.
             * @see dragonBones.objects.DBTransform
             */
            get: function () {
                return this._global;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "globalTransformMatrix", {
            get: function () {
                return this._globalTransformMatrix;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "origin", {
            /**
             * This DBObject instance related to parent transform instance.
             * @see dragonBones.objects.DBTransform
             */
            get: function () {
                return this._origin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "parent", {
            /**
             * Indicates the Bone instance that directly contains this DBObject instance if any.
             */
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "visible", {
            get: function () {
                return this._visible;
            },
            set: function (value) {
                this._visible = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(__egretProto__, "frameCache", {
            set: function (cache) {
                this._frameCache = cache;
            },
            enumerable: true,
            configurable: true
        });
        FastDBObject._tempParentGlobalTransform = new dragonBones.DBTransform();
        FastDBObject.tempOutputObj = {};
        return FastDBObject;
    })();
    dragonBones.FastDBObject = FastDBObject;
    FastDBObject.prototype.__class__ = "dragonBones.FastDBObject";
})(dragonBones || (dragonBones = {}));
