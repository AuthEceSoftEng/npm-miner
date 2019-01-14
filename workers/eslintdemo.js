// Aggregate eslint results working demo

a = [
    {
      "filePath": "/home/kyrcha/Workspace/github/npm-miner/workers/downloads-undefined/angular2-swiper-fc-0.1.6/package/angular2-swiper-fc.umd.js",
      "messages": [
        {
          "ruleId": "no-undef",
          "severity": 2,
          "message": "'define' is not defined.",
          "line": 3,
          "column": 34,
          "nodeType": "Identifier",
          "source": "\ttypeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :",
          "endLine": 3,
          "endColumn": 40
        },
        {
          "ruleId": "no-undef",
          "severity": 2,
          "message": "'define' is not defined.",
          "line": 3,
          "column": 47,
          "nodeType": "Identifier",
          "source": "\ttypeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :",
          "endLine": 3,
          "endColumn": 53
        },
        {
          "ruleId": "security/detect-object-injection",
          "severity": 1,
          "message": "Generic Object Injection Sink",
          "line": 17,
          "column": 24,
          "nodeType": "MemberExpression",
          "source": "        args[_i - 1] = arguments[_i];",
          "endLine": 17,
          "endColumn": 37
        },
        {
          "ruleId": "security/detect-object-injection",
          "severity": 1,
          "message": "Generic Object Injection Sink",
          "line": 20,
          "column": 39,
          "nodeType": "MemberExpression",
          "source": "        var /** @type {?} */ source = arguments[i] || {};",
          "endLine": 20,
          "endColumn": 51
        },
        {
          "ruleId": "security/detect-object-injection",
          "severity": 1,
          "message": "Generic Object Injection Sink",
          "line": 23,
          "column": 17,
          "nodeType": "MemberExpression",
          "source": "                dest[key] = source[key];",
          "endLine": 23,
          "endColumn": 26
        },
        {
          "ruleId": "security/detect-object-injection",
          "severity": 1,
          "message": "Generic Object Injection Sink",
          "line": 23,
          "column": 29,
          "nodeType": "MemberExpression",
          "source": "                dest[key] = source[key];",
          "endLine": 23,
          "endColumn": 40
        },
        {
          "ruleId": "no-shadow",
          "severity": 2,
          "message": "'KSSwiperContainer' is already declared in the upper scope.",
          "line": 33,
          "column": 14,
          "nodeType": "Identifier",
          "source": "    function KSSwiperContainer(elementRef) {",
          "endLine": 33,
          "endColumn": 31
        },
        {
          "ruleId": "no-unused-vars",
          "severity": 2,
          "message": "'options' is assigned a value but never used.",
          "line": 41,
          "column": 30,
          "nodeType": "Identifier",
          "source": "        var /** @type {?} */ options = defaults({",
          "endLine": 41,
          "endColumn": 37
        },
        {
          "ruleId": "no-shadow",
          "severity": 2,
          "message": "'KSSwiperSlide' is already declared in the upper scope.",
          "line": 82,
          "column": 14,
          "nodeType": "Identifier",
          "source": "    function KSSwiperSlide(elementRef, swiper) {",
          "endLine": 82,
          "endColumn": 27
        },
        {
          "ruleId": "no-shadow",
          "severity": 2,
          "message": "'KSSwiperModule' is already declared in the upper scope.",
          "line": 105,
          "column": 14,
          "nodeType": "Identifier",
          "source": "    function KSSwiperModule() {",
          "endLine": 105,
          "endColumn": 28
        },
        {
          "ruleId": "no-empty-function",
          "severity": 1,
          "message": "Unexpected empty function 'KSSwiperModule'.",
          "line": 105,
          "column": 31,
          "nodeType": "FunctionDeclaration",
          "source": "    function KSSwiperModule() {",
          "messageId": "unexpected"
        }
      ],
      "errorCount": 6,
      "warningCount": 5,
      "fixableErrorCount": 0,
      "fixableWarningCount": 0,
      "source": "(function (global, factory) {\n\ttypeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :\n\ttypeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :\n\t(factory((global['angular2-swiper-fc'] = global['angular2-swiper-fc'] || {}),global._angular_core,global._angular_common));\n}(this, (function (exports,_angular_core,_angular_common) { 'use strict';\n\n// import Swiper from 'swiper';\nvar Swiper = require('swiper');\n/**\n * @param {?} dest\n * @param {...?} args\n * @return {?}\n */\nfunction defaults(dest) {\n    var args = [];\n    for (var _i = 1; _i < arguments.length; _i++) {\n        args[_i - 1] = arguments[_i];\n    }\n    for (var /** @type {?} */ i = arguments.length - 1; i >= 1; i--) {\n        var /** @type {?} */ source = arguments[i] || {};\n        for (var /** @type {?} */ key in source) {\n            if (source.hasOwnProperty(key) && !dest.hasOwnProperty(key)) {\n                dest[key] = source[key];\n            }\n        }\n    }\n    return dest;\n}\nvar KSSwiperContainer = (function () {\n    /**\n     * @param {?} elementRef\n     */\n    function KSSwiperContainer(elementRef) {\n        this.elementRef = elementRef;\n    }\n    /**\n     * @return {?}\n     */\n    KSSwiperContainer.prototype.ngOnInit = function () {\n        var _this = this;\n        var /** @type {?} */ options = defaults({\n            pagination: '.swiper-pagination',\n        }, this.options);\n        var /** @type {?} */ nativeElement = this.elementRef.nativeElement;\n        setTimeout(function () {\n            _this.swiper = new Swiper(nativeElement.children[0], _this.options);\n        });\n    };\n    /**\n     * @return {?}\n     */\n    KSSwiperContainer.prototype.update = function () {\n        var _this = this;\n        setTimeout(function () {\n            _this.swiper.update();\n        });\n    };\n    return KSSwiperContainer;\n}());\nKSSwiperContainer.decorators = [\n    { type: _angular_core.Injectable },\n    { type: _angular_core.Component, args: [{\n                selector: 'ks-swiper-container',\n                template: \"<div class=\\\"swiper-container\\\">\\n    <div class=\\\"swiper-wrapper\\\">\\n      <ng-content></ng-content>\\n    </div>\\n    <div class=\\\"swiper-pagination\\\"></div>\\n  </div>\"\n            },] },\n];\n/**\n * @nocollapse\n */\nKSSwiperContainer.ctorParameters = function () { return [\n    { type: _angular_core.ElementRef, decorators: [{ type: _angular_core.Inject, args: [_angular_core.ElementRef,] },] },\n]; };\nKSSwiperContainer.propDecorators = {\n    'pager': [{ type: _angular_core.Input },],\n    'options': [{ type: _angular_core.Input },],\n};\nvar KSSwiperSlide = (function () {\n    /**\n     * @param {?} elementRef\n     * @param {?} swiper\n     */\n    function KSSwiperSlide(elementRef, swiper) {\n        this.ele = elementRef.nativeElement;\n        this.ele.classList.add('swiper-slide');\n        swiper.update();\n    }\n    return KSSwiperSlide;\n}());\nKSSwiperSlide.decorators = [\n    { type: _angular_core.Injectable },\n    { type: _angular_core.Component, args: [{\n                selector: 'ks-swiper-slide',\n                template: '<div><ng-content></ng-content></div>'\n            },] },\n];\n/**\n * @nocollapse\n */\nKSSwiperSlide.ctorParameters = function () { return [\n    { type: _angular_core.ElementRef, decorators: [{ type: _angular_core.Inject, args: [_angular_core.ElementRef,] },] },\n    { type: KSSwiperContainer, decorators: [{ type: _angular_core.Host }, { type: _angular_core.Inject, args: [KSSwiperContainer,] },] },\n]; };\n\nvar KSSwiperModule = (function () {\n    function KSSwiperModule() {\n    }\n    return KSSwiperModule;\n}());\nKSSwiperModule.decorators = [\n    { type: _angular_core.NgModule, args: [{\n                imports: [_angular_common.CommonModule],\n                declarations: [KSSwiperContainer, KSSwiperSlide],\n                exports: [KSSwiperContainer, KSSwiperSlide]\n            },] },\n];\n/**\n * @nocollapse\n */\nKSSwiperModule.ctorParameters = function () { return []; };\n\nexports.KSSwiperModule = KSSwiperModule;\nexports.KSSwiperContainer = KSSwiperContainer;\nexports.KSSwiperSlide = KSSwiperSlide;\n\nObject.defineProperty(exports, '__esModule', { value: true });\n\n})));\n"
    },
    {
      "filePath": "/home/kyrcha/Workspace/github/npm-miner/workers/downloads-undefined/angular2-swiper-fc-0.1.6/package/index.js",
      "messages": [
        {
          "ruleId": "security/detect-object-injection",
          "severity": 1,
          "message": "Generic Object Injection Sink",
          "line": 14,
          "column": 24,
          "nodeType": "MemberExpression",
          "source": "        args[_i - 1] = arguments[_i];",
          "endLine": 14,
          "endColumn": 37
        },
        {
          "ruleId": "security/detect-object-injection",
          "severity": 1,
          "message": "Generic Object Injection Sink",
          "line": 17,
          "column": 39,
          "nodeType": "MemberExpression",
          "source": "        var /** @type {?} */ source = arguments[i] || {};",
          "endLine": 17,
          "endColumn": 51
        },
        {
          "ruleId": "security/detect-object-injection",
          "severity": 1,
          "message": "Generic Object Injection Sink",
          "line": 20,
          "column": 17,
          "nodeType": "MemberExpression",
          "source": "                dest[key] = source[key];",
          "endLine": 20,
          "endColumn": 26
        },
        {
          "ruleId": "security/detect-object-injection",
          "severity": 1,
          "message": "Generic Object Injection Sink",
          "line": 20,
          "column": 29,
          "nodeType": "MemberExpression",
          "source": "                dest[key] = source[key];",
          "endLine": 20,
          "endColumn": 40
        },
        {
          "ruleId": "no-shadow",
          "severity": 2,
          "message": "'KSSwiperContainer' is already declared in the upper scope.",
          "line": 30,
          "column": 14,
          "nodeType": "Identifier",
          "source": "    function KSSwiperContainer(elementRef) {",
          "endLine": 30,
          "endColumn": 31
        },
        {
          "ruleId": "no-unused-vars",
          "severity": 2,
          "message": "'options' is assigned a value but never used.",
          "line": 38,
          "column": 30,
          "nodeType": "Identifier",
          "source": "        var /** @type {?} */ options = defaults({",
          "endLine": 38,
          "endColumn": 37
        },
        {
          "ruleId": "no-shadow",
          "severity": 2,
          "message": "'KSSwiperSlide' is already declared in the upper scope.",
          "line": 79,
          "column": 14,
          "nodeType": "Identifier",
          "source": "    function KSSwiperSlide(elementRef, swiper) {",
          "endLine": 79,
          "endColumn": 27
        },
        {
          "ruleId": "no-shadow",
          "severity": 2,
          "message": "'KSSwiperModule' is already declared in the upper scope.",
          "line": 102,
          "column": 14,
          "nodeType": "Identifier",
          "source": "    function KSSwiperModule() {",
          "endLine": 102,
          "endColumn": 28
        },
        {
          "ruleId": "no-empty-function",
          "severity": 1,
          "message": "Unexpected empty function 'KSSwiperModule'.",
          "line": 102,
          "column": 31,
          "nodeType": "FunctionDeclaration",
          "source": "    function KSSwiperModule() {",
          "messageId": "unexpected"
        }
      ],
      "errorCount": 4,
      "warningCount": 5,
      "fixableErrorCount": 0,
      "fixableWarningCount": 0,
      "source": "import { Component, ElementRef, Host, Inject, Injectable, Input, NgModule } from '@angular/core';\nimport { CommonModule } from '@angular/common';\n\n// import Swiper from 'swiper';\nvar Swiper = require('swiper');\n/**\n * @param {?} dest\n * @param {...?} args\n * @return {?}\n */\nfunction defaults(dest) {\n    var args = [];\n    for (var _i = 1; _i < arguments.length; _i++) {\n        args[_i - 1] = arguments[_i];\n    }\n    for (var /** @type {?} */ i = arguments.length - 1; i >= 1; i--) {\n        var /** @type {?} */ source = arguments[i] || {};\n        for (var /** @type {?} */ key in source) {\n            if (source.hasOwnProperty(key) && !dest.hasOwnProperty(key)) {\n                dest[key] = source[key];\n            }\n        }\n    }\n    return dest;\n}\nvar KSSwiperContainer = (function () {\n    /**\n     * @param {?} elementRef\n     */\n    function KSSwiperContainer(elementRef) {\n        this.elementRef = elementRef;\n    }\n    /**\n     * @return {?}\n     */\n    KSSwiperContainer.prototype.ngOnInit = function () {\n        var _this = this;\n        var /** @type {?} */ options = defaults({\n            pagination: '.swiper-pagination',\n        }, this.options);\n        var /** @type {?} */ nativeElement = this.elementRef.nativeElement;\n        setTimeout(function () {\n            _this.swiper = new Swiper(nativeElement.children[0], _this.options);\n        });\n    };\n    /**\n     * @return {?}\n     */\n    KSSwiperContainer.prototype.update = function () {\n        var _this = this;\n        setTimeout(function () {\n            _this.swiper.update();\n        });\n    };\n    return KSSwiperContainer;\n}());\nKSSwiperContainer.decorators = [\n    { type: Injectable },\n    { type: Component, args: [{\n                selector: 'ks-swiper-container',\n                template: \"<div class=\\\"swiper-container\\\">\\n    <div class=\\\"swiper-wrapper\\\">\\n      <ng-content></ng-content>\\n    </div>\\n    <div class=\\\"swiper-pagination\\\"></div>\\n  </div>\"\n            },] },\n];\n/**\n * @nocollapse\n */\nKSSwiperContainer.ctorParameters = function () { return [\n    { type: ElementRef, decorators: [{ type: Inject, args: [ElementRef,] },] },\n]; };\nKSSwiperContainer.propDecorators = {\n    'pager': [{ type: Input },],\n    'options': [{ type: Input },],\n};\nvar KSSwiperSlide = (function () {\n    /**\n     * @param {?} elementRef\n     * @param {?} swiper\n     */\n    function KSSwiperSlide(elementRef, swiper) {\n        this.ele = elementRef.nativeElement;\n        this.ele.classList.add('swiper-slide');\n        swiper.update();\n    }\n    return KSSwiperSlide;\n}());\nKSSwiperSlide.decorators = [\n    { type: Injectable },\n    { type: Component, args: [{\n                selector: 'ks-swiper-slide',\n                template: '<div><ng-content></ng-content></div>'\n            },] },\n];\n/**\n * @nocollapse\n */\nKSSwiperSlide.ctorParameters = function () { return [\n    { type: ElementRef, decorators: [{ type: Inject, args: [ElementRef,] },] },\n    { type: KSSwiperContainer, decorators: [{ type: Host }, { type: Inject, args: [KSSwiperContainer,] },] },\n]; };\n\nvar KSSwiperModule = (function () {\n    function KSSwiperModule() {\n    }\n    return KSSwiperModule;\n}());\nKSSwiperModule.decorators = [\n    { type: NgModule, args: [{\n                imports: [CommonModule],\n                declarations: [KSSwiperContainer, KSSwiperSlide],\n                exports: [KSSwiperContainer, KSSwiperSlide]\n            },] },\n];\n/**\n * @nocollapse\n */\nKSSwiperModule.ctorParameters = function () { return []; };\n\nexport { KSSwiperModule, KSSwiperContainer, KSSwiperSlide };\n"
    }
  ]

_ = require('lodash');




console.log(
    _.chain(a)
    .map((result) => {
        const errorTypes = _.values(_.reduce(result.messages, (result, obj) => {
        const type = obj.ruleId;
        result[type] = {
          type,
          count: 1 + (result[type] ? result[type].count : 0),
        };
        return result;
      }, {}));
      return errorTypes;
    })
    .flattenDeep()
    .groupBy('type')
    .map((objs, key) => ({
    'type': key,
    'count': _.sumBy(objs, 'count') }))
    .keyBy('type')
    .mapValues('count')
    .value());