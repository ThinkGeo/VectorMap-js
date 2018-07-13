/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoStyle; });
var GeoStyle = /** @class */ (function () {
    function GeoStyle(styleJson) {
        this.styles = [];
        if (styleJson) {
            this.id = styleJson["id"];
            this.visible = styleJson["visible"] === undefined ? true : styleJson["visible"];
        }
    }
    GeoStyle.prototype.initialize = function () {
        if (!this.initialized) {
            this.initializeCore();
            this.initialized = true;
        }
    };
    GeoStyle.prototype.initializeCore = function () {
    };
    GeoStyle.prototype.getStyles = function (feature, resolution, options) {
        var results = [];
        if (this.visible) {
            results = this.getConvertedStyle(feature, resolution, options);
        }
        return results;
    };
    GeoStyle.prototype.getConvertedStyle = function (feature, resolution, options) {
        this.initialize();
        return this.getConvertedStyleCore(feature, resolution, options);
    };
    GeoStyle.prototype.getConvertedStyleCore = function (feature, resolution, options) {
        return [];
    };
    GeoStyle.prototype.skewGeometry = function (geometry, xDeg, yDeg) {
        var center = ol.extent.getCenter(geometry.getExtent());
        for (var i = 0; i < geometry.flatCoordinates.length; i += 2) {
            var x = geometry.flatCoordinates[i];
            var y = geometry.flatCoordinates[i + 1];
            var rx = this.skewX(x, y, center[0], center[1], xDeg);
            var ry = this.skewY(x, y, center[0], center[1], yDeg);
            geometry.flatCoordinates[i] = rx;
            geometry.flatCoordinates[i + 1] = ry;
        }
    };
    GeoStyle.prototype.skewX = function (x, y, cx, cy, xDeg) {
        var rx = x;
        if (xDeg !== 0) {
            var xResolution = Math.tan(1.0 * xDeg * Math.PI / 180);
            var distance = void 0;
            if (x > cx) {
                if (y > cy) {
                    distance = xResolution * Math.abs(y - cy);
                }
                else {
                    distance = 0 - xResolution * Math.abs(y - cy);
                }
            }
            else {
                if (y > cy) {
                    distance = xResolution * Math.abs(y - cy);
                }
                else {
                    distance = 0 - xResolution * Math.abs(y - cy);
                }
            }
            rx += Math.round(distance);
        }
        return rx;
    };
    GeoStyle.prototype.skewY = function (x, y, cx, cy, yDeg) {
        var ry = y;
        if (yDeg !== 0) {
            var yResolution = Math.tan(1.0 * yDeg * Math.PI / 180);
            var distance = void 0;
            if (y > cy) {
                if (x > cx) {
                    distance = yResolution * Math.abs(x - cx);
                }
                else {
                    distance = 0 - yResolution * Math.abs(x - cx);
                }
            }
            else {
                if (x > cx) {
                    distance = yResolution * Math.abs(x - cx);
                }
                else {
                    distance = 0 - yResolution * Math.abs(x - cx);
                }
            }
            ry += Math.round(distance);
        }
        return ry;
    };
    GeoStyle.toRGBAColor = function (color, opacity) {
        if (opacity === void 0) { opacity = 1; }
        if (color.indexOf("#") === 0) {
            var array = void 0;
            var r = void 0;
            var g = void 0;
            var b = void 0;
            var a = void 0;
            if (color.length === 4) {
                r = +("0x" + color.substr(1, 1) + color.substr(1, 1));
                g = +("0x" + color.substr(2, 1) + color.substr(2, 1));
                b = +("0x" + color.substr(3, 1) + color.substr(3, 1));
                a = opacity;
            }
            else {
                r = +("0x" + color.substr(1, 2));
                g = +("0x" + color.substr(3, 2));
                b = +("0x" + color.substr(5, 2));
                a = opacity;
            }
            array = [r, g, b, a];
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                return "rgba(" + array.join(",") + ")";
            }
            else {
                return "rgba(0,0,0,0)";
            }
        }
        if (color.indexOf("rgb(") === 0) {
            color = color.replace("rgb(", "rgba(");
            color = color.substring(0, color.length - 1) + "," + opacity + ")";
        }
        if (color.indexOf("argb(") === 0) {
            color = color.replace("argb(", "").replace(")", "");
            var array = color.split(",");
            var a = array.shift();
            array.push(a);
            color = "rgba(" + array.join(",") + ")";
        }
        return color;
    };
    GeoStyle.toOLLinearGradient = function (color, opacity, size) {
        if (opacity === void 0) { opacity = 1; }
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.rect(0, 0, size, size);
        var grd = context.createLinearGradient(0, 0, size, size);
        var colorStops = color.split(",");
        for (var _i = 0, colorStops_1 = colorStops; _i < colorStops_1.length; _i++) {
            var colorStop = colorStops_1[_i];
            colorStop = colorStop.trim();
            var tmpColorStop = colorStop.substr(1, colorStop.length - 2);
            var cs = tmpColorStop.split(":");
            grd.addColorStop(Number(cs[0].trim()), this.toRGBAColor(cs[1].trim(), opacity));
        }
        return grd;
    };
    GeoStyle.toOLRadialGradient = function (color, opacity, size) {
        if (opacity === void 0) { opacity = 1; }
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.rect(0, 0, size, size);
        var grd = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        var colorStops = color.split(",");
        for (var _i = 0, colorStops_2 = colorStops; _i < colorStops_2.length; _i++) {
            var colorStop = colorStops_2[_i];
            colorStop = colorStop.trim();
            var tmpColorStop = colorStop.substr(1, colorStop.length - 2);
            var cs = tmpColorStop.split(":");
            grd.addColorStop(Number(cs[0].trim()), this.toRGBAColor(cs[1].trim(), opacity));
        }
        return grd;
    };
    return GeoStyle;
}());



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TextLabelingStrategy; });
var TextLabelingStrategy = /** @class */ (function () {
    function TextLabelingStrategy() {
    }
    TextLabelingStrategy.prototype.markLocation = function (flatCoordinates, width, height, resolution, geometryType, textStyle, strategyTree, frameState) {
        return this.markLocationCore(flatCoordinates, width, height, resolution, geometryType, textStyle, strategyTree, frameState);
    };
    TextLabelingStrategy.prototype.markLocationCore = function (flatCoordinates, width, height, resolution, geometryType, textStyle, strategyTree, frameState) {
        if (this.isOverlapping(flatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, strategyTree, frameState)) {
            return undefined;
        }
        else {
            return flatCoordinates;
        }
    };
    TextLabelingStrategy.prototype.isOverlapping = function (flatCoordinates, width, height, margin, minDistance, minPadding, spacing, strategyTree, frameState) {
        if (flatCoordinates === undefined) {
            return true;
        }
        var distance = (margin ? margin : 0) + (minDistance ? minDistance : 0) + (minPadding ? minPadding : 0) + (spacing ? spacing : 0);
        var coordinate = [flatCoordinates[0], flatCoordinates[1]];
        var screenCoordinates = this.convertPixelFromCoordinate(coordinate, frameState);
        var minX = screenCoordinates[0] - width / 2 - distance * 0.5;
        var minY = screenCoordinates[1] - height / 2 - distance * 0.5;
        var maxX = minX + width + distance;
        var maxY = minY + height + distance;
        var box = {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY
        };
        if (!strategyTree.collides(box)) {
            strategyTree.insert(box);
            return false;
        }
        else {
            return true;
        }
    };
    TextLabelingStrategy.prototype.convertPixelFromCoordinate = function (coordinate, frameState) {
        if (!frameState) {
            return null;
        }
        return ol.transform.apply(frameState.coordinateToPixelTransform, coordinate.slice(0, 2));
    };
    return TextLabelingStrategy;
}());



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoFilter; });
var GeoFilter = /** @class */ (function () {
    function GeoFilter(filterItems) {
        this.filterItems = filterItems || [];
        this.replacedValueToIndex = false;
    }
    GeoFilter.prototype.addFilterItem = function (filterItem) {
        this.filterItems.push(filterItem);
    };
    GeoFilter.prototype.initialize = function () {
        this.initializeCore();
        this.initialized = true;
    };
    GeoFilter.prototype.initializeCore = function () { };
    GeoFilter.prototype.matchOLFeature = function (feature, zoom) {
        if (!this.initialized) {
            this.initialize();
        }
        return this.matchFeatureCore(feature, zoom);
    };
    GeoFilter.prototype.replaceVaulesToPbfIndex = function (pbfLayer) {
        this.replaceVaulesToPbfIndexCore(pbfLayer);
    };
    return GeoFilter;
}());



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DetectTextLabelingStrategy; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__textLabelingStrategy__ = __webpack_require__(1);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var DetectTextLabelingStrategy = /** @class */ (function (_super) {
    __extends(DetectTextLabelingStrategy, _super);
    function DetectTextLabelingStrategy() {
        var _this = _super.call(this) || this;
        _this.markLocationCore = _this.markLocationCoreCustom;
        return _this;
    }
    DetectTextLabelingStrategy.prototype.markLocationCoreCustom = function (flatCoordinates, width, height, resolution, geometryType, textStyle, grid, frameState) {
        switch (geometryType) {
            case ol.geom.GeometryType.POINT:
            case ol.geom.GeometryType.MULTI_POINT:
            case ol.geom.GeometryType.CIRCLE:
                if (this.isOverlapping(flatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, grid, frameState)) {
                    flatCoordinates = this.movePointLabel(flatCoordinates, width, height, resolution, textStyle, grid, frameState);
                }
                break;
            case ol.geom.GeometryType.LINE_STRING:
            case ol.geom.GeometryType.MULTI_LINE_STRING:
            case ol.geom.GeometryType.POLYGON:
            case ol.geom.GeometryType.MULTI_POLYGON:
                if (this.isOverlapping(flatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, grid, frameState)) {
                    flatCoordinates = undefined;
                }
        }
        return flatCoordinates;
    };
    DetectTextLabelingStrategy.prototype.movePointLabel = function (flatCoordinates, width, height, resolution, textStyle, grid, frameState) {
        var gridSize = 50;
        var distance = gridSize * resolution;
        if (textStyle.placements) {
            var placements = textStyle.placements.split(",");
            for (var _i = 0, placements_1 = placements; _i < placements_1.length; _i++) {
                var placement = placements_1[_i];
                var newFlatCoordinates = this.getMovedPosition(flatCoordinates, placement, distance);
                if (!this.isOverlapping(newFlatCoordinates, width, height, textStyle.margin, textStyle.minDistance, textStyle.minPadding, textStyle.spacing, grid, frameState)) {
                    return newFlatCoordinates;
                }
            }
        }
        return undefined;
    };
    DetectTextLabelingStrategy.prototype.getMovedPosition = function (flatCoordinates, placement, distance) {
        var newFlatCoordinates;
        switch (placement) {
            case "UR":
                newFlatCoordinates = this.moveToUR(flatCoordinates, distance);
                break;
            case "U":
                newFlatCoordinates = this.moveToU(flatCoordinates, distance);
                break;
            case "UL":
                newFlatCoordinates = this.moveToUL(flatCoordinates, distance);
                break;
            case "B":
                newFlatCoordinates = this.moveToB(flatCoordinates, distance);
                break;
            case "BR":
                newFlatCoordinates = this.moveToBR(flatCoordinates, distance);
                break;
            case "BL":
                newFlatCoordinates = this.moveToBL(flatCoordinates, distance);
                break;
            case "L":
                newFlatCoordinates = this.moveToL(flatCoordinates, distance);
                break;
            case "R":
                newFlatCoordinates = this.moveToR(flatCoordinates, distance);
                break;
        }
        return newFlatCoordinates;
    };
    DetectTextLabelingStrategy.prototype.moveToUR = function (flatCoordinates, distance) {
        var newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] + distance);
        newFlatCoordinates.push(flatCoordinates[1] + distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    };
    DetectTextLabelingStrategy.prototype.moveToU = function (flatCoordinates, distance) {
        var newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0]);
        newFlatCoordinates.push(flatCoordinates[1] + distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    };
    DetectTextLabelingStrategy.prototype.moveToUL = function (flatCoordinates, distance) {
        var newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] - distance);
        newFlatCoordinates.push(flatCoordinates[1] + distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    };
    DetectTextLabelingStrategy.prototype.moveToB = function (flatCoordinates, distance) {
        var newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0]);
        newFlatCoordinates.push(flatCoordinates[1] - distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    };
    DetectTextLabelingStrategy.prototype.moveToBR = function (flatCoordinates, distance) {
        var newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] + distance);
        newFlatCoordinates.push(flatCoordinates[1] - distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    };
    DetectTextLabelingStrategy.prototype.moveToBL = function (flatCoordinates, distance) {
        var newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] - distance);
        newFlatCoordinates.push(flatCoordinates[1] - distance);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    };
    DetectTextLabelingStrategy.prototype.moveToL = function (flatCoordinates, distance) {
        var newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] - distance);
        newFlatCoordinates.push(flatCoordinates[1]);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    };
    DetectTextLabelingStrategy.prototype.moveToR = function (flatCoordinates, distance) {
        var newFlatCoordinates = new Array();
        newFlatCoordinates.push(flatCoordinates[0] + distance);
        newFlatCoordinates.push(flatCoordinates[1]);
        newFlatCoordinates.push(flatCoordinates[2]);
        return newFlatCoordinates;
    };
    return DetectTextLabelingStrategy;
}(__WEBPACK_IMPORTED_MODULE_0__textLabelingStrategy__["a" /* TextLabelingStrategy */]));



/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return VectorTileLayerThreadMode; });
var VectorTileLayerThreadMode;
(function (VectorTileLayerThreadMode) {
    VectorTileLayerThreadMode[VectorTileLayerThreadMode["Default"] = 1] = "Default";
    VectorTileLayerThreadMode[VectorTileLayerThreadMode["SingleThread"] = 2] = "SingleThread";
    VectorTileLayerThreadMode[VectorTileLayerThreadMode["SingleBackgroundWorker"] = 3] = "SingleBackgroundWorker";
    VectorTileLayerThreadMode[VectorTileLayerThreadMode["MultiBackgroundWorker"] = 4] = "MultiBackgroundWorker";
})(VectorTileLayerThreadMode || (VectorTileLayerThreadMode = {}));


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoTextStyle; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoStyle__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__geoStyleProperty__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__textLabelingStrategy__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__detectTextLabelingStrategy__ = __webpack_require__(3);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var GeoTextStyle = /** @class */ (function (_super) {
    __extends(GeoTextStyle, _super);
    function GeoTextStyle(styleJson) {
        var _this = _super.call(this, styleJson) || this;
        _this.textAligns = ["left", "right", "center", "end", "start"];
        _this.textBaseline = ["bottom", "top", "middle", "alphabetic", "hanging", "ideographic"];
        _this.textTransforms = ["default", "uppercase", "lowercase"];
        _this.drawnMask = false;
        _this.BATCH_CONSTRUCTORS_DEFAULT = {
            Point: __WEBPACK_IMPORTED_MODULE_2__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            MultiPoint: __WEBPACK_IMPORTED_MODULE_2__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            LineString: __WEBPACK_IMPORTED_MODULE_2__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            Circle: __WEBPACK_IMPORTED_MODULE_2__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            MultiLineString: __WEBPACK_IMPORTED_MODULE_2__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            Polygon: __WEBPACK_IMPORTED_MODULE_2__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            MultiPolygon: __WEBPACK_IMPORTED_MODULE_2__textLabelingStrategy__["a" /* TextLabelingStrategy */]
        };
        _this.BATCH_CONSTRUCTORS_DETECT = {
            Point: __WEBPACK_IMPORTED_MODULE_3__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            MultiPoint: __WEBPACK_IMPORTED_MODULE_3__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            LineString: __WEBPACK_IMPORTED_MODULE_3__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            Circle: __WEBPACK_IMPORTED_MODULE_3__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            MultiLineString: __WEBPACK_IMPORTED_MODULE_3__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            Polygon: __WEBPACK_IMPORTED_MODULE_3__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            MultiPolygon: __WEBPACK_IMPORTED_MODULE_3__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */]
        };
        _this.labelInfos = [];
        _this.charWidths = {};
        if (styleJson) {
            _this.align = styleJson["text-align"];
            _this.baseline = styleJson["text-base-line"];
            _this.dx = styleJson["text-dx"];
            _this.dy = styleJson["text-dy"];
            _this.font = styleJson["text-font"];
            _this.fill = styleJson["text-fill"];
            _this.forceHorizontalForLine = styleJson["text-force-horizontal-for-line"];
            _this.haloFill = styleJson["text-halo-fill"];
            _this.haloRadius = styleJson["text-halo-radius"];
            _this.margin = styleJson["text-margin"];
            _this.maskColor = styleJson["text-mask-color"];
            _this.maskMargin = styleJson["text-mask-margin"];
            _this.maskOutlineColor = styleJson["text-mask-outline-color"];
            _this.maskOutlineWidth = styleJson["text-mask-outline-width"];
            _this.maskType = styleJson["text-mask-type"];
            _this.maxCharAngle = styleJson["text-max-char-angle"];
            _this.minDistance = styleJson["text-min-distance"];
            _this.minPadding = styleJson["text-min-padding"];
            _this.name = styleJson["text-name"];
            _this.opacity = styleJson["text-opacity"];
            _this.rotateAngle = styleJson["text-rotate-angle"];
            _this.propertyPlacements = new __WEBPACK_IMPORTED_MODULE_1__geoStyleProperty__["a" /* GeoStyleProperty */](styleJson[GeoTextStyle.placementsName], "U,B,L,R");
            _this.placementType = styleJson["text-placement-type"] ? styleJson["text-placement-type"] : "default";
            _this.spacing = styleJson["text-spacing"] !== undefined ? styleJson["text-spacing"] : 10;
            _this.wrapBefore = styleJson["text-wrap-before"] ? true : styleJson["text-wrap-before"];
            _this.wrapWidth = styleJson["text-wrap-width"];
            _this.textFormat = styleJson["text-text-format"];
            _this.dateFormat = styleJson["text-date-format"];
            _this.numericFormat = styleJson["text-numeric-format"];
            _this.textTransform = styleJson["text-letter-case"];
            _this.letterSpacing = styleJson["text-letter-spacing"];
            // TODO
            _this.avoidEdge = styleJson["text-avoid-edge"];
            // TODO
            _this.splineType = styleJson["text-spline-type"];
            // TODO
            _this.polygonLabelingLocation = styleJson["text-polygon-labeling-location"];
            var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (var i = 0; i < chars.length; i++) {
                _this.charWidths[chars[i]] = ol.render.canvas.measureTextWidth(_this.font, chars[i]);
            }
            _this.charWidths[" "] = ol.render.canvas.measureTextWidth(_this.font, " ");
            for (var i = 0; i <= 9; i++) {
                _this.charWidths[i] = ol.render.canvas.measureTextWidth(_this.font, i);
            }
        }
        return _this;
    }
    GeoTextStyle.prototype.initializeCore = function () {
        this.propertyPlacements.initialize();
        this.placements = this.propertyPlacements.getValue();
        if (this.fill) {
            this.fillColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.fill, this.opacity);
        }
        if (this.haloFill) {
            this.haloFillColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.haloFill, this.opacity);
        }
        var fill = new ol.style.Fill();
        var stroke = new ol.style.Stroke();
        var textStyle = new ol.style.Text({
            fill: fill,
            stroke: stroke
        });
        this.style = new ol.style.Style({
            text: textStyle
        });
        if (this.textAligns.indexOf(this.align) >= 0) {
            textStyle.setTextAlign(this.align);
        }
        if (this.textBaseline.indexOf(this.baseline) >= 0) {
            textStyle.setTextBaseline(this.baseline);
        }
        if (this.dx) {
            textStyle.setOffsetX(this.dx);
        }
        if (this.dy) {
            textStyle.setOffsetY(this.dy);
        }
        if (this.font) {
            textStyle.setFont(this.font);
        }
        if (this.fillColor) {
            fill.setColor(this.fillColor);
        }
        if (this.haloFillColor) {
            stroke.setColor(this.haloFillColor);
        }
        if (this.haloRadius) {
            stroke.setWidth(this.haloRadius);
        }
        if (this.haloFillColor === undefined && this.haloRadius === undefined) {
            textStyle.setStroke(undefined);
        }
        if (this.rotateAngle) {
            textStyle.setRotation(this.rotateAngle);
        }
        if (this.maxCharAngle >= 0) {
            textStyle.setMaxAngle(this.maxCharAngle);
        }
        if (this.textTransforms.includes(this.textTransform)) {
        }
        else {
            // TODO: invalid inputs.
            this.textTransform = this.textTransforms[0];
        }
    };
    GeoTextStyle.prototype.getConvertedStyleCore = function (feature, resolution, options) {
        var textStyles = [];
        var featureText = "";
        var featureProperties = feature.getProperties();
        if (this.name) {
            featureText = feature.get(this.name);
        }
        // A workaround for the language, remove the data update
        if ((featureText === undefined || featureText === "") && this.name.indexOf("name_") === 0) {
            featureText = feature.get("name");
        }
        if (this.numericFormat) {
            featureText = this.getTextWithNumericFormat(featureText);
        }
        if (this.dateFormat) {
            featureText = this.getTextWithDateFormat(featureText);
        }
        if (this.textFormat) {
            featureText = this.getTextWithFormat(featureText);
        }
        if (featureText === undefined || featureText === "") {
            return textStyles;
        }
        featureText = this.getTextTransform(featureText);
        this.placements = this.propertyPlacements.getValue(featureProperties);
        this.style.getText().setText(featureText);
        if (this.setLabelPosition(featureText, feature, resolution, this.style.getText(), options.strategyTree, options.frameState)) {
            var featureZindex = feature["tempTreeZindex"];
            if (featureZindex === undefined) {
                featureZindex = 0;
            }
            this.style.setZIndex(featureZindex);
            textStyles.push(this.style);
        }
        return textStyles;
    };
    GeoTextStyle.prototype.setLabelPosition = function (text, geometry, resolution, textState, strategyTree, frameState) {
        var flatCoordinates;
        var geometryType = geometry.getType();
        if ((geometryType === ol.geom.GeometryType.LINE_STRING || geometryType === ol.geom.GeometryType.MULTI_LINE_STRING) && !this.forceHorizontalForLine) {
            var geometryType_1 = geometry.getType();
            flatCoordinates = geometry.getFlatCoordinates();
            if (flatCoordinates === undefined) {
                return false;
            }
        }
        else {
            var labelInfo = this.labelInfos[text];
            if (!labelInfo) {
                labelInfo = this.getLabelInfo(text, textState);
                this.labelInfos[text] = labelInfo;
            }
            var labelWidth = labelInfo.labelWidth;
            var labelHeight = labelInfo.labelHeight;
            var scale = labelInfo.scale;
            var font = labelInfo.font;
            var strokeWidth = labelInfo.strokeWidth;
            var numLines = labelInfo.numLines;
            var lines = labelInfo.lines;
            var lineHeight = labelInfo.lineHeight;
            var renderWidth = labelInfo.renderWidth;
            var height = labelInfo.height;
            var widths = labelInfo.widths;
            var Constructor = void 0;
            if (this.placementType === "default") {
                Constructor = this.BATCH_CONSTRUCTORS_DEFAULT[geometryType];
            }
            else if (this.placementType === "detect") {
                Constructor = this.BATCH_CONSTRUCTORS_DETECT[geometryType];
            }
            var textLabelingStrategy = new Constructor();
            var tmpLabelWidth = labelWidth / window.devicePixelRatio;
            var tmpLabelHeight = labelHeight / window.devicePixelRatio;
            switch (geometryType) {
                case ol.geom.GeometryType.POINT:
                    flatCoordinates = geometry.getFlatCoordinates();
                    break;
                case ol.geom.GeometryType.MULTI_POINT:
                    flatCoordinates = geometry.getCenter();
                    break;
                case ol.geom.GeometryType.LINE_STRING:
                    flatCoordinates = /** @type {ol.geom.LineString} */ (geometry).getFlatMidpoint();
                    break;
                case ol.geom.GeometryType.CIRCLE:
                    flatCoordinates = /** @type {ol.geom.Circle} */ (geometry).getCenter();
                    break;
                case ol.geom.GeometryType.MULTI_LINE_STRING:
                    flatCoordinates = /** @type {ol.geom.MultiLineString} */ (geometry).getFlatMidpoints();
                    break;
                case ol.geom.GeometryType.POLYGON:
                    flatCoordinates = /** @type {ol.geom.Polygon} */ (geometry).getFlatInteriorPoint();
                    break;
                case ol.geom.GeometryType.MULTI_POLYGON:
                    var interiorPoints = /** @type {ol.geom.MultiPolygon} */ (geometry).getFlatMidpoint();
                    break;
                default:
            }
            flatCoordinates = textLabelingStrategy.markLocation(flatCoordinates, tmpLabelWidth, tmpLabelHeight, resolution, geometryType, this, strategyTree, frameState);
            if (flatCoordinates === undefined) {
                return false;
            }
            var labelImage = this.getImage(textState, labelWidth, labelHeight, scale, font, strokeWidth, numLines, lines, lineHeight, renderWidth, height, widths);
            if (labelImage === undefined) {
                return;
            }
            textState.label = labelImage;
        }
        textState.labelPosition = flatCoordinates;
        return true;
    };
    GeoTextStyle.prototype.getLabelInfo = function (text, textState) {
        var font = textState.getFont();
        text = this.wrapText(text, font);
        var strokeState = textState.getStroke();
        var strokeWidth = strokeState && strokeState.getWidth() ? strokeState.getWidth() : 0;
        var lines = text.split("\n");
        var numLines = lines.length;
        var textScale = textState.getScale();
        textScale = textScale === undefined ? 1 : textScale;
        var scale = textScale * window.devicePixelRatio;
        var widths = [];
        var width = this.getEstimatedWidth(font, lines, widths, this.letterSpacing);
        var lineHeight = ol.render.canvas.measureTextHeight(font);
        var tmpMaskMargin = (this.maskMargin ? this.maskMargin : "0").split(',');
        var tmpMaskHeightMargin = 0;
        var tmpMaskWidthMargin = 0;
        switch (tmpMaskMargin.length) {
            case 1:
                tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) * 2;
                tmpMaskWidthMargin = parseInt(tmpMaskMargin[0]) * 2;
                break;
            case 2:
                tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) * 2;
                tmpMaskWidthMargin = parseInt(tmpMaskMargin[1]) * 2;
                break;
            case 3:
                tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) + parseInt(tmpMaskMargin[2]);
                tmpMaskWidthMargin = parseInt(tmpMaskMargin[1]) * 2;
                break;
            case 4:
                tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) + parseInt(tmpMaskMargin[2]);
                tmpMaskWidthMargin = parseInt(tmpMaskMargin[1]) + parseInt(tmpMaskMargin[3]);
                break;
            default:
                break;
        }
        if (this.maskType) {
            if (this.maskType.toLowerCase() === "circle") {
                tmpMaskHeightMargin = tmpMaskHeightMargin > tmpMaskWidthMargin ? tmpMaskHeightMargin : tmpMaskWidthMargin;
                tmpMaskWidthMargin = tmpMaskHeightMargin;
            }
        }
        var height = lineHeight * numLines + strokeWidth + tmpMaskHeightMargin;
        var renderWidth = width + strokeWidth + tmpMaskWidthMargin;
        var tmpMaskOutlineWidth = (this.maskOutlineWidth ? this.maskOutlineWidth : 0);
        var labelWidth = Math.ceil((renderWidth + tmpMaskOutlineWidth * 3) * 1.1 * scale);
        var labelHeight = Math.ceil((height + tmpMaskOutlineWidth * 3) * 1.1 * scale);
        var labelInfo = {
            labelWidth: labelWidth,
            labelHeight: labelHeight,
            scale: scale,
            font: font,
            strokeWidth: strokeWidth,
            numLines: numLines,
            lines: lines,
            lineHeight: lineHeight,
            renderWidth: renderWidth,
            height: height,
            widths: widths
        };
        return labelInfo;
    };
    GeoTextStyle.prototype.getEstimatedWidth = function (font, lines, widths, letterSpacing) {
        var numLines = lines.length;
        var width = 0;
        var currentWidth, i;
        for (i = 0; i < numLines; ++i) {
            currentWidth = 0;
            for (var j = 0; j < lines[i].length; j++) {
                var charWidth = this.charWidths[lines[i][j]];
                if (charWidth) {
                    currentWidth += charWidth;
                }
                else {
                    currentWidth += this.charWidths["W"];
                }
            }
            if (letterSpacing) {
                currentWidth = currentWidth + (lines[i].length - 1) * letterSpacing;
            }
            width = Math.max(width, currentWidth);
            widths.push(currentWidth);
        }
        return width;
    };
    GeoTextStyle.prototype.getImage = function (textState, labelWidth, labelHeight, scale, font, strokeWidth, numLines, lines, lineHeight, renderWidth, height, widths) {
        var labelCache = ol.render.canvas.labelCache;
        var key = this.id !== undefined ? this.id : ol.getUid(this);
        key += lines.toString();
        if (!labelCache.containsKey(key)) {
            var fillState = textState.getFill();
            var strokeState = textState.getStroke();
            var label = void 0;
            var align = ol.render.replay.TEXT_ALIGN[textState.getTextAlign() || ol.render.canvas.defaultTextAlign];
            var context = ol.dom.createCanvasContext2D(labelWidth, labelHeight);
            label = context.canvas;
            labelCache.set(key, label);
            label.style.display = "none";
            // For letterSpacing we need app
            var body = void 0;
            if (this.letterSpacing) {
                body = document.getElementsByTagName("body")[0];
                if (body) {
                    label.style.display = "none";
                    body.appendChild(label);
                }
                label.style.letterSpacing = this.letterSpacing + "px";
                context = label.getContext("2d");
            }
            if (scale !== 1) {
                context.scale(scale, scale);
            }
            context.font = font;
            if (strokeState) {
                context.strokeStyle = strokeState.getColor();
                context.lineWidth = strokeWidth * (ol.has.SAFARI ? scale : 1);
                context.lineCap = strokeState.getLineCap();
                context.lineJoin = strokeState.getLineJoin();
                context.miterLimit = strokeState.getMiterLimit();
                var lineDash = strokeState.getLineDash();
                lineDash = lineDash ? lineDash.slice() : ol.render.canvas.defaultLineDash;
                if (ol.has.CANVAS_LINE_DASH && lineDash.length) {
                    context.setLineDash(strokeState.getLineDash());
                    context.lineDashOffset = strokeState.getLineDashOffset();
                }
            }
            this.drawMask(context, 0, 0, renderWidth, height);
            if (this.maskType) {
                if (this.maskType.toLowerCase() === "circle") {
                    if (scale !== 1) {
                        context.scale(scale, scale);
                    }
                    context.font = font;
                    if (strokeState) {
                        context.strokeStyle = strokeState.getColor();
                        context.lineWidth = strokeWidth * (ol.has.SAFARI ? scale : 1);
                        context.lineCap = strokeState.getLineCap();
                        context.lineJoin = strokeState.getLineJoin();
                        context.miterLimit = strokeState.getMiterLimit();
                        var lineDash = strokeState.getLineDash();
                        lineDash = lineDash ? lineDash.slice() : ol.render.canvas.defaultLineDash;
                        if (ol.has.CANVAS_LINE_DASH && lineDash.length) {
                            context.setLineDash(strokeState.getLineDash());
                            context.lineDashOffset = strokeState.getLineDashOffset();
                        }
                    }
                }
            }
            context.textBaseline = "middle";
            context.textAlign = "center";
            var leftRight = 0.5 - align;
            var x = align * label.width / scale + leftRight * strokeWidth;
            var i = void 0;
            var tmpMaskMargin = (this.maskMargin ? this.maskMargin : "0").split(',');
            var tmpMaskOutlineWidth = this.maskOutlineWidth ? this.maskOutlineWidth : 0;
            if (strokeState) {
                if (strokeState.getColor() !== null) {
                    context.strokeStyle = strokeState.getColor();
                    context.lineWidth = this.haloRadius ? this.haloRadius : 0;
                    for (i = 0; i < numLines; ++i) {
                        if (this.drawnMask) {
                            context.strokeText(lines[i], x + leftRight * widths[i] * 1.2 - strokeWidth * 1.2 + tmpMaskOutlineWidth * 0.5 / 1.2 - (tmpMaskMargin[3] ? parseInt(tmpMaskMargin[1]) - parseInt(tmpMaskMargin[3]) : 0) * 0.5, this.maskType.toLowerCase() === "circle" ? context.canvas.height / scale * 0.5 - (tmpMaskMargin[2] ? parseInt(tmpMaskMargin[2]) - parseInt(tmpMaskMargin[0]) : 0) : strokeWidth + (i + 1) * lineHeight * 0.5 + parseInt(tmpMaskMargin[0]) + tmpMaskOutlineWidth);
                        }
                        else {
                            context.strokeText(lines[i], x + leftRight * widths[i] * 1.2 - (tmpMaskMargin[3] ? parseInt(tmpMaskMargin[1]) - parseInt(tmpMaskMargin[3]) : 0) * 0.5, 0.5 * (strokeWidth + lineHeight) + i * lineHeight * 1.2 - +parseInt(tmpMaskMargin[0]) + (this.maskOutlineWidth ? this.maskOutlineWidth : 0));
                        }
                    }
                }
            }
            if (fillState) {
                if (fillState.getColor() !== null) {
                    context.fillStyle = fillState.getColor();
                    for (i = 0; i < numLines; ++i) {
                        if (this.drawnMask) {
                            context.fillText(lines[i], x + leftRight * widths[i] * 1.2 - strokeWidth * 1.2 + tmpMaskOutlineWidth * 0.5 / 1.2 - (tmpMaskMargin[3] ? parseInt(tmpMaskMargin[1]) - parseInt(tmpMaskMargin[3]) : 0) * 0.5, this.maskType.toLowerCase() === "circle" ? context.canvas.height / scale * 0.5 - (tmpMaskMargin[2] ? parseInt(tmpMaskMargin[2]) - parseInt(tmpMaskMargin[0]) : 0) : strokeWidth + (i + 1) * lineHeight * 0.5 + parseInt(tmpMaskMargin[0]) + tmpMaskOutlineWidth);
                        }
                        else {
                            context.fillText(lines[i], x + leftRight * widths[i] * 1.2 - (tmpMaskMargin[3] ? parseInt(tmpMaskMargin[1]) - parseInt(tmpMaskMargin[3]) : 0) * 0.5, 0.5 * (strokeWidth + lineHeight) + i * lineHeight * 1.2 + parseInt(tmpMaskMargin[0]) + (this.maskOutlineWidth ? this.maskOutlineWidth : 0));
                        }
                    }
                }
            }
            if (this.letterSpacing && body) {
                body.removeChild(label);
            }
        }
        return labelCache.get(key);
    };
    GeoTextStyle.prototype.wrapText = function (text, font) {
        var resultText;
        if (text !== "") {
            var lines = [text];
            var widths = [];
            var width = this.getEstimatedWidth(font, lines, widths, this.letterSpacing);
            var wrapWidth = this.wrapWidth;
            var wrapCharacter = " ";
            var isWrapBefore = this.wrapBefore;
            if (wrapWidth > 0 && width > wrapWidth && text.includes(wrapCharacter)) {
                var textLines = [];
                lines = text.split(wrapCharacter);
                var wrapLines = [];
                var wrapWidthSum = 0;
                var tmpWrapWidth = void 0;
                if (isWrapBefore) {
                    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        var line = lines_1[_i];
                        var tmpLine = [line];
                        tmpWrapWidth = this.getEstimatedWidth(font, tmpLine, widths, this.letterSpacing);
                        wrapWidthSum += tmpWrapWidth;
                        if (tmpWrapWidth > wrapWidth) {
                            wrapLines = [];
                            textLines = [];
                            wrapWidthSum = 0;
                            break;
                        }
                        if (wrapLines.length > 0) {
                            if (wrapWidthSum > wrapWidth) {
                                wrapLines.push("\n");
                                textLines.push(wrapLines.join(""));
                                wrapLines = [];
                                wrapWidthSum = 0;
                            }
                        }
                        wrapLines.push(" " + line);
                    }
                    if (wrapLines.length > 0) {
                        textLines.push(wrapLines.join(""));
                    }
                }
                else {
                    for (var _a = 0, lines_2 = lines; _a < lines_2.length; _a++) {
                        var line = lines_2[_a];
                        wrapLines.push(" " + line);
                        var tmpLine = [line];
                        tmpWrapWidth = this.getEstimatedWidth(font, tmpLine, widths, this.letterSpacing);
                        wrapWidthSum += tmpWrapWidth;
                        if (wrapWidthSum > wrapWidth) {
                            wrapLines.push("\n");
                            textLines.push(wrapLines.join(""));
                            wrapLines = [];
                            wrapWidthSum = 0;
                        }
                    }
                    if (wrapLines.length > 0) {
                        textLines.push(wrapLines.join(""));
                    }
                }
                resultText = textLines.join("");
                if (resultText.lastIndexOf("\n") === resultText.length - 1) {
                    resultText = resultText.substr(0, resultText.length - 1);
                }
            }
            else {
                resultText = text;
            }
        }
        return resultText;
    };
    GeoTextStyle.prototype.drawMask = function (context, x, y, width, height) {
        var fill = undefined;
        var stroke = undefined;
        if (this.maskColor) {
            fill = new ol.style.Fill();
            fill.setColor(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.maskColor, this.opacity ? this.opacity : 1));
        }
        if (this.maskOutlineColor && this.maskOutlineWidth) {
            stroke = new ol.style.Stroke();
            if (this.maskOutlineColor) {
                stroke.setColor(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.maskOutlineColor, this.opacity ? this.opacity : 1));
            }
            if (this.maskOutlineWidth) {
                stroke.setWidth(this.maskOutlineWidth ? this.maskOutlineWidth : 0);
            }
        }
        if (this.maskType) {
            this.drawnMask = true;
        }
        else {
            this.drawnMask = false;
        }
        switch (this.maskType) {
            case "default":
            case "Default":
            case "rectangle":
            case "Rectangle":
                this.drawRectangle(context, x, y, width, height, fill, stroke);
                break;
            case "roundedCorners":
            case "RoundedCorners":
                this.drawRoundRectangle(context, x, y, width, height, fill, stroke);
                break;
            case "roundedEnds":
            case "RoundedEnds":
                this.drawRoundedEnds(context, x, y, width, height, fill, stroke);
                break;
            case "circle":
            case "Circle":
                this.drawCircle(context, x, y, width, height, fill, stroke);
                break;
        }
    };
    GeoTextStyle.prototype.drawRectangle = function (context, x, y, width, height, fill, stroke) {
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fillRect(x + stroke.getWidth(), y + stroke.getWidth(), width + stroke.getWidth() * 2, height);
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.strokeRect(x + stroke.getWidth(), y + stroke.getWidth(), width + stroke.getWidth() * 2, height);
        }
    };
    GeoTextStyle.prototype.drawRoundRectangle = function (context, x, y, width, height, fill, stroke) {
        var radius = (width < height ? width : height) * 0.3;
        // width *= 0.9;
        // height *= 0.8;
        if (stroke) {
            x = x + (stroke.getWidth() ? stroke.getWidth() : 0);
            y = y + (stroke.getWidth() ? stroke.getWidth() : 0);
        }
        context.beginPath();
        context.moveTo(x + radius + stroke.getWidth() * 2, y);
        context.lineTo(x + width - radius + stroke.getWidth() * 2, y);
        context.quadraticCurveTo(x + width + stroke.getWidth() * 2, y, x + width + stroke.getWidth() * 2, y + radius);
        context.lineTo(x + width + stroke.getWidth() * 2, y + height - radius);
        context.quadraticCurveTo(x + width + stroke.getWidth() * 2, y + height, x + width - radius + stroke.getWidth() * 2, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
    };
    GeoTextStyle.prototype.drawRoundedEnds = function (context, x, y, width, height, fill, stroke) {
        var radius = (width < height ? width : height) * 0.2;
        // width *= 0.9;
        // height *= 0.8;
        var strokeWidth = (stroke.getWidth() ? stroke.getWidth() : 0);
        if (stroke) {
            x = x + strokeWidth;
            y = y + strokeWidth;
        }
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius + strokeWidth * 2, y);
        context.quadraticCurveTo(x + width + strokeWidth * 2, y + height * 0.5, x + width - radius + strokeWidth * 2, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height * 0.5, x + radius, y);
        context.closePath();
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
    };
    GeoTextStyle.prototype.drawCircle = function (context, x, y, width, height, fill, stroke) {
        context.canvas.width = context.canvas.width > context.canvas.height ? context.canvas.width : context.canvas.height;
        context.canvas.height = context.canvas.width;
        var radius = 0;
        if (stroke) {
            radius -= stroke.getWidth();
        }
        radius += context.canvas.width * 0.5;
        context.beginPath();
        context.arc(x + context.canvas.width * 0.5, y + context.canvas.width * 0.5, radius, 0, 2 * Math.PI, false);
        context.closePath();
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth() * window.devicePixelRatio;
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
    };
    GeoTextStyle.prototype.getTextWithNumericFormat = function (featureText) {
        var tmpArguments = this.numericFormat.split(",");
        var numericFormatOptions = {};
        for (var _i = 0, tmpArguments_1 = tmpArguments; _i < tmpArguments_1.length; _i++) {
            var tmpArgument = tmpArguments_1[_i];
            var keyValuePair = tmpArgument.split(":");
            switch (keyValuePair[0].trim()) {
                case "localeMatcher":
                    numericFormatOptions.localeMatcher = keyValuePair[1].trim();
                    break;
                case "style":
                    numericFormatOptions.style = keyValuePair[1].trim();
                    break;
                case "currency":
                    numericFormatOptions.currency = keyValuePair[1].trim();
                    break;
                case "currencyDisplay":
                    numericFormatOptions.currencyDisplay = keyValuePair[1].trim();
                    break;
                case "useGrouping":
                    numericFormatOptions.useGrouping = keyValuePair[1].trim();
                    break;
                case "minimumIntegerDigits":
                    numericFormatOptions.minimumIntegerDigits = keyValuePair[1].trim();
                    break;
                case "minimumFractionDigits":
                    numericFormatOptions.minimumFractionDigits = keyValuePair[1].trim();
                    break;
                case "maximumFractionDigits":
                    numericFormatOptions.maximumFractionDigits = keyValuePair[1].trim();
                    break;
                case "minimumSignificantDigits":
                    numericFormatOptions.minimumSignificantDigits = keyValuePair[1].trim();
                    break;
                case "maximumSignificantDigits":
                    numericFormatOptions.maximumSignificantDigits = keyValuePair[1].trim();
                    break;
            }
        }
        var numeric = new Intl.NumberFormat(tmpArguments[0], numericFormatOptions);
        return numeric.format(Number(featureText));
    };
    GeoTextStyle.prototype.getTextWithDateFormat = function (featureText) {
        return (new Date(featureText)).format(this.dateFormat);
    };
    GeoTextStyle.prototype.getTextWithFormat = function (featureText) {
        return String.format(this.textFormat, featureText);
    };
    GeoTextStyle.prototype.getTextTransform = function (featureText) {
        if (featureText !== undefined) {
            switch (this.textTransform) {
                case "uppercase":
                    featureText = featureText.toLocaleUpperCase();
                    break;
                case "lowercase":
                    featureText = featureText.toLocaleLowerCase();
                    break;
                default:
                    break;
            }
        }
        return featureText;
    };
    GeoTextStyle.placementsName = "text-placements";
    return GeoTextStyle;
}(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */]));

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
};
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoFilterItem; });
var GeoFilterItem = /** @class */ (function () {
    function GeoFilterItem(key, operator, value) {
        this.key = key;
        this.operator = operator;
        this.value = value;
    }
    GeoFilterItem.createFilterItem = function (filterItemString) {
        var operator = filterItemString.match(this.operatorRegex)[0];
        var parts = filterItemString.split(operator);
        var item = new GeoFilterItem(parts[0], operator, parts[1]);
        return item;
    };
    GeoFilterItem.operatorRegex = new RegExp("[<>!=]+", "g");
    return GeoFilterItem;
}());



/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoZoomFilter; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoRangeFilter__ = __webpack_require__(8);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var GeoZoomFilter = /** @class */ (function (_super) {
    __extends(GeoZoomFilter, _super);
    function GeoZoomFilter(filterItems) {
        return _super.call(this, filterItems) || this;
    }
    GeoZoomFilter.prototype.matchFeatureCore = function (feature, zoom) {
        return this.isInRange(zoom);
    };
    GeoZoomFilter.prototype.replaceVaulesToPbfIndexCore = function (pbfLayer) {
        this.replacedValueToIndex = true;
    };
    return GeoZoomFilter;
}(__WEBPACK_IMPORTED_MODULE_0__geoRangeFilter__["a" /* GeoRangeFilter */]));



/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoRangeFilter; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoFilter__ = __webpack_require__(2);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var GeoRangeFilter = /** @class */ (function (_super) {
    __extends(GeoRangeFilter, _super);
    function GeoRangeFilter(filterItems) {
        var _this = _super.call(this, filterItems) || this;
        _this.ranges = [];
        _this.allowedValues = [];
        _this.disallowedValues = [];
        return _this;
    }
    GeoRangeFilter.prototype.initializeCore = function () {
        this.filterItems.sort(function (a, b) { return +a.value - +b.value; });
        for (var i = 0; i < this.filterItems.length; i++) {
            var filterItem = this.filterItems[i];
            this.key = filterItem.key;
            var value = +filterItem.value;
            switch (filterItem.operator) {
                case ">":
                    this.ranges.push([value + 0.00001, Number.POSITIVE_INFINITY]);
                    break;
                case ">=":
                    this.ranges.push([value, Number.POSITIVE_INFINITY]);
                    break;
                case "!=":
                    this.disallowedValues.push(value);
                    break;
                case "=":
                    this.allowedValues.push(value);
                    break;
            }
        }
        for (var i = 0; i < this.filterItems.length; i++) {
            var filterItem = this.filterItems[i];
            var value = +filterItem.value;
            var range = GeoRangeFilter.getRange(this.ranges, value);
            switch (filterItem.operator) {
                case "<":
                    if (range) {
                        range[1] = value + 0.00001;
                    }
                    else {
                        range = [Number.NEGATIVE_INFINITY, value + 0.00001];
                        this.ranges.push(range);
                    }
                    break;
                case "<=":
                    if (range) {
                        range[1] = value;
                    }
                    else {
                        range = [Number.NEGATIVE_INFINITY, value];
                        this.ranges.push(range);
                    }
                    break;
            }
        }
    };
    GeoRangeFilter.prototype.matchFeatureCore = function (feature, zoom) {
        var currentValue;
        if (this.replacedValueToIndex) {
            currentValue = feature.properties[this.key];
        }
        else {
            currentValue = feature.properties[this.key];
        }
        return this.isInRange(+currentValue);
    };
    GeoRangeFilter.prototype.replaceVaulesToPbfIndexCore = function (pbfLayer) {
        this.replacedValueToIndex = true;
    };
    GeoRangeFilter.prototype.isInRange = function (currentValue) {
        if (this.disallowedValues.includes(currentValue)) {
            return false;
        }
        if (this.allowedValues.includes(currentValue)) {
            return true;
        }
        for (var i = 0; i < this.ranges.length; i++) {
            var range = this.ranges[i];
            if (range.length === 1) {
                if (currentValue >= range[0]) {
                    return true;
                }
            }
            else {
                if (currentValue >= range[0] && currentValue <= range[1]) {
                    return true;
                }
            }
        }
    };
    GeoRangeFilter.getRange = function (ranges, value) {
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            if (value >= range[0] && value <= range[1]) {
                return range;
            }
        }
        return null;
    };
    return GeoRangeFilter;
}(__WEBPACK_IMPORTED_MODULE_0__geoFilter__["a" /* GeoFilter */]));



/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoStringAttributeFilter; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoFilter__ = __webpack_require__(2);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var GeoStringAttributeFilter = /** @class */ (function (_super) {
    __extends(GeoStringAttributeFilter, _super);
    function GeoStringAttributeFilter(filterItems) {
        return _super.call(this, filterItems) || this;
    }
    GeoStringAttributeFilter.prototype.initializeCore = function () {
        var expectedValue = this.filterItems[0].value;
        expectedValue = expectedValue.slice(1, expectedValue.length - 1);
        this.expectedValues = expectedValue.split(",");
        this.key = this.filterItems[0].key;
    };
    GeoStringAttributeFilter.prototype.matchFeatureCore = function (feature, zoom) {
        var currentValue;
        var currentExpectedValues;
        if (this.replacedValueToIndex) {
            currentValue = feature.propertiesIndex[this.keyIndex];
            currentExpectedValues = this.expectedValueIndexs;
        }
        else {
            currentValue = feature.properties[this.key];
            currentExpectedValues = this.expectedValues;
        }
        switch (this.filterItems[0].operator) {
            case "=":
                return currentExpectedValues.includes(currentValue);
            case "!=":
            default:
                return !currentExpectedValues.includes(currentValue);
        }
    };
    GeoStringAttributeFilter.prototype.replaceVaulesToPbfIndexCore = function (pbfLayer) {
        if (!this.initialized) {
            this.initialize();
        }
        this.keyIndex = pbfLayer.keys.indexOf(this.key);
        var replacedExpectedVaules = [];
        for (var j = 0, jj = this.expectedValues.length; j < jj; j++) {
            var numberValue = +this.expectedValues[j];
            if (isNaN(numberValue)) {
                replacedExpectedVaules.push(pbfLayer.values.indexOf(this.expectedValues[j]));
            }
            else {
                replacedExpectedVaules.push(pbfLayer.values.indexOf(numberValue));
            }
        }
        this.expectedValueIndexs = replacedExpectedVaules;
        this.replacedValueToIndex = true;
    };
    return GeoStringAttributeFilter;
}(__WEBPACK_IMPORTED_MODULE_0__geoFilter__["a" /* GeoFilter */]));



/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoRegexFilter; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoFilter__ = __webpack_require__(2);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var GeoRegexFilter = /** @class */ (function (_super) {
    __extends(GeoRegexFilter, _super);
    function GeoRegexFilter(filterItems) {
        return _super.call(this, filterItems) || this;
    }
    GeoRegexFilter.prototype.initializeCore = function () {
        var value = this.filterItems[0].value;
        value = value.slice(2, value.length - 1);
        this.regex = new RegExp(value, "g");
        this.key = this.filterItems[0].key;
    };
    GeoRegexFilter.prototype.matchFeatureCore = function (feature, zoom) {
        var currentValue;
        if (this.replacedValueToIndex) {
            currentValue = feature.properties[this.key];
        }
        else {
            currentValue = feature.properties[this.key];
        }
        if (!currentValue) {
            return false;
        }
        return currentValue.toString().match(this.regex) !== null;
    };
    GeoRegexFilter.prototype.replaceVaulesToPbfIndexCore = function (pbfLayer) {
        this.replacedValueToIndex = true;
    };
    return GeoRegexFilter;
}(__WEBPACK_IMPORTED_MODULE_0__geoFilter__["a" /* GeoFilter */]));



/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoNumberAttributeFilter; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoRangeFilter__ = __webpack_require__(8);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var GeoNumberAttributeFilter = /** @class */ (function (_super) {
    __extends(GeoNumberAttributeFilter, _super);
    function GeoNumberAttributeFilter(filterItems) {
        return _super.call(this, filterItems) || this;
    }
    return GeoNumberAttributeFilter;
}(__WEBPACK_IMPORTED_MODULE_0__geoRangeFilter__["a" /* GeoRangeFilter */]));



/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_vectorTileLayer__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__worker_vectorTileLayerThreadMode__ = __webpack_require__(4);


ol.mapsuite = {};
ol.mapsuite["VectorTileLayer"] = __WEBPACK_IMPORTED_MODULE_0__layer_vectorTileLayer__["a" /* VectorTileLayer */];
ol.mapsuite["VectorTileLayerThreadMode"] = __WEBPACK_IMPORTED_MODULE_1__worker_vectorTileLayerThreadMode__["a" /* VectorTileLayerThreadMode */];
window["ol"] = ol;


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return VectorTileLayer; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__source_geoVectorTileSource__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__geoVectorTile__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__style_geoStyle__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__format_geoMvt__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__tree_styleJsonCache__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__tree_styleJsonCacheItem__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__render_geoVectorTilelayerRender__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__tree_TreeNode__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__tree_tree__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__worker_workerManager__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__worker_vectorTileLayerThreadMode__ = __webpack_require__(4);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();











var VectorTileLayer = /** @class */ (function (_super) {
    __extends(VectorTileLayer, _super);
    function VectorTileLayer(styleJson, opt_options) {
        var _this = this;
        // default
        if (opt_options !== undefined) {
            opt_options["declutter"] = opt_options["declutter"] === undefined ? true : opt_options["declutter"];
            opt_options["minimalist"] = opt_options["minimalist"] === undefined ? true : opt_options["minimalist"];
            _this = _super.call(this, opt_options) || this;
        }
        else {
            var options = {};
            options["declutter"] = true;
            options["minimalist"] = true;
            _this = _super.call(this, options) || this;
        }
        if (opt_options !== undefined) {
            // temp Emil
            var tempIsMultithread = opt_options["multithread"] === undefined ? true : opt_options["multithread"];
            _this.threadMode = opt_options["threadMode"] === undefined ? true : opt_options["threadMode"];
            _this.isMultithread = _this.threadMode !== __WEBPACK_IMPORTED_MODULE_10__worker_vectorTileLayerThreadMode__["a" /* VectorTileLayerThreadMode */].SingleThread;
            _this.backgroundWorkerCount = opt_options["backgroundWorkerCount"];
            // temp Emil
            if (tempIsMultithread) {
                _this.threadMode = __WEBPACK_IMPORTED_MODULE_10__worker_vectorTileLayerThreadMode__["a" /* VectorTileLayerThreadMode */].Default;
                _this.backgroundWorkerCount = 1;
            }
            _this.minimalist = opt_options["minimalist"] === undefined ? true : opt_options["minimalist"];
            _this.maxDataZoom = opt_options["maxDataZoom"] === undefined ? 14 : opt_options["maxDataZoom"];
            _this.proxy = opt_options["proxy"];
            _this.clientId = opt_options["clientId"];
            _this.clientSecret = opt_options["clientSecret"];
            _this.apiKey = opt_options["apiKey"];
        }
        else {
            _this.isMultithread = true;
            _this.minimalist = true;
            _this.maxDataZoom = 14;
        }
        _this.registerGeoVector();
        if (_this.isStyleJsonUrl(styleJson)) {
            _this.loadStyleJsonAsyn(styleJson);
        }
        else {
            _this.loadStyleJson(styleJson);
        }
        _this.type = ol.LayerType.MAPSUITE_VECTORTILE;
        return _this;
    }
    VectorTileLayer.prototype.loadStyleJsonAsyn = function (styleJsonUrl) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", styleJsonUrl, false);
        xhr.onload = function (event) {
            if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                var source = void 0;
                source = xhr.responseText;
                this.styleJson = JSON.parse(source);
                this.loadStyleJson(JSON.parse(source));
            }
        }.bind(this);
        xhr.onerror = function () {
        }.bind(this);
        xhr.send();
    };
    VectorTileLayer.prototype.loadStyleJson = function (inputStyleJson) {
        var styleJson = this.styleJson = JSON.parse(JSON.stringify(inputStyleJson));
        this.version = styleJson["version"];
        this.owner = styleJson["owner"];
        this.dateTime = styleJson["dateTime"];
        this.variables = this.getVariables(styleJson["variables"]);
        this.background = styleJson["background"];
        this.replaceVariables(styleJson, this.variables);
        this.geoSources = {};
        if (styleJson["layers"] && styleJson["layers"].length > 0) {
            var layerJson = styleJson["layers"][0];
            var sourceId = layerJson["source"];
            var source = this.getGeoSource(sourceId);
            if (source) {
                this.setSource(source);
                if (this.background) {
                    var backgroundColor = __WEBPACK_IMPORTED_MODULE_2__style_geoStyle__["a" /* GeoStyle */].toRGBAColor(this.background);
                    if (backgroundColor) {
                        this["background"] = backgroundColor;
                    }
                }
                var styleJsons = styleJson["styles"];
                var styleIds = layerJson["styles"];
                var minZoom = 0;
                var maxZoom = 22;
                var layerName = source.getGeoFormat().getLayerName();
                var styleJsonCache = new __WEBPACK_IMPORTED_MODULE_4__tree_styleJsonCache__["a" /* StyleJsonCache */]();
                var styleIdIndex = 0;
                for (var _i = 0, styleIds_1 = styleIds; _i < styleIds_1.length; _i++) {
                    var styleId = styleIds_1[_i];
                    var styleJson_1 = void 0;
                    for (var index = 0; index < styleJsons.length; index++) {
                        if (styleJsons[index].id === styleId) {
                            styleJson_1 = styleJsons[index];
                        }
                    }
                    if (styleJson_1) {
                        styleJsonCache.styleJson[styleId] = styleJson_1;
                        var item = new __WEBPACK_IMPORTED_MODULE_5__tree_styleJsonCacheItem__["a" /* StyleJsonCacheItem */](styleJson_1, minZoom, maxZoom, layerName);
                        for (var zoom = item.minZoom; zoom <= item.maxZoom; zoom++) {
                            var treeNode = new __WEBPACK_IMPORTED_MODULE_7__tree_TreeNode__["a" /* TreeNode */](item);
                            this.createChildrenNode(treeNode, item, zoom);
                            styleJsonCache.add(zoom, item.dataLayerName, new __WEBPACK_IMPORTED_MODULE_8__tree_tree__["a" /* Tree */](treeNode, styleIdIndex));
                        }
                        styleIdIndex += 1;
                    }
                }
                var geoFormat = source.getGeoFormat();
                geoFormat["styleJsonCache"] = styleJsonCache;
                if (this.isMultithread) {
                    if (this.workerManager) {
                        var messageData = {
                            formatId: ol.getUid(geoFormat),
                            styleJson: styleJsonCache.styleJson,
                            geoTextStyleInfos: styleJsonCache.geoTextStyleInfo
                        };
                        for (var i = 0; i < this.workerManager.workerCount; i++) {
                            this.workerManager.postMessage(ol.getUid(messageData), "initStyleJSON", messageData, undefined, i);
                        }
                    }
                }
            }
        }
    };
    VectorTileLayer.prototype.getGeoSource = function (sourceId) {
        var _this = this;
        if (this.geoSources && this.geoSources[sourceId]) {
            return this.geoSources[sourceId];
        }
        if (this.styleJson["sources"]) {
            this.styleJson['sources'].find(function (sourceJson) {
                if (sourceId === sourceJson['id']) {
                    if (!sourceJson['urls'] && sourceJson['url']) {
                        sourceJson['urls'] = [sourceJson['url']];
                        delete sourceJson['url'];
                    }
                    sourceJson['urls'] = sourceJson['urls'].map(function (url) {
                        if (url.indexOf('http') === -1 && url.indexOf('https') === -1) {
                            var host = location.host;
                            var protocol = location.protocol;
                            if (url.indexOf('/') !== 0) {
                                url = protocol + '//' + host + '/' + url;
                            }
                            else if (url.indexOf('/') === 0) {
                                url = protocol + '//' + host + url;
                            }
                        }
                        // apiKey
                        if (url.indexOf('apiKey') === -1 && _this.apiKey) {
                            url = url + '?apiKey=' + _this.apiKey;
                        }
                        // proxy
                        if (_this.proxy) {
                            url = _this.proxy + encodeURIComponent(url);
                        }
                        return url;
                    });
                    _this.geoSources[sourceJson["id"]] = _this.createVectorTileSource(sourceJson);
                    return true;
                }
            });
            return this.geoSources[sourceId];
        }
        return false;
    };
    VectorTileLayer.prototype.createVectorTileSource = function (sourceJson) {
        if (sourceJson["type"] === "MVT") {
            var format = this.getVectorSourceFormat();
            var source = new __WEBPACK_IMPORTED_MODULE_0__source_geoVectorTileSource__["a" /* GeoVectorTileSource */]({
                tileClass: __WEBPACK_IMPORTED_MODULE_1__geoVectorTile__["a" /* GeoVectorTile */],
                urls: sourceJson["urls"],
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                format: format,
                projection: "EPSG:3857",
                tileGrid: this.createVectorTileGrid(),
                cacheSize: 1024,
                multithread: this.isMultithread,
                minimalist: this.minimalist,
                maxDataZoom: this.maxDataZoom
            });
            format['source'] = source;
            return source;
        }
    };
    VectorTileLayer.prototype.getVectorSourceFormat = function () {
        var format = new __WEBPACK_IMPORTED_MODULE_3__format_geoMvt__["a" /* GeoMVTFormat */](undefined, { multithread: this.isMultithread, minimalist: this.minimalist });
        if (this.isMultithread) {
            if (!this.workerManager || !this.workerManager.inited) {
                this.workerManager = new __WEBPACK_IMPORTED_MODULE_9__worker_workerManager__["a" /* WorkerManager */](this.threadMode, this.backgroundWorkerCount);
                this.workerManager.initWorkers();
            }
            if (this.workerManager.inited) {
                format["workerManager"] = this.workerManager;
            }
        }
        return format;
    };
    VectorTileLayer.prototype.createVectorTileGrid = function () {
        return ol.tilegrid.createXYZ({ tileSize: 512, maxZoom: 22 });
    };
    VectorTileLayer.prototype.getVariables = function (variablesJson) {
        var variables = {};
        for (var variablesName in variablesJson) {
            if (variablesName.indexOf(",") > 0) {
                var variableNames = variablesName.split(",");
                for (var i = 0; i < variableNames.length; i++) {
                    variables[variableNames[i]] = variablesJson[variablesName];
                }
            }
            else {
                variables[variablesName] = variablesJson[variablesName];
            }
        }
        return variables;
    };
    VectorTileLayer.prototype.replaceVariables = function (styleJson, variables) {
        for (var propertyName in styleJson) {
            var property = styleJson[propertyName];
            if (typeof property === "object") {
                this.replaceVariables(property, variables);
            }
            else if (typeof property === "string") {
                var keyWordIndex = property.indexOf("@");
                if (keyWordIndex >= 0) {
                    var lines = property.split(" ");
                    if (lines.length > 1) {
                        var tempWord = void 0;
                        var results = [];
                        for (var i = 0; i < lines.length; i++) {
                            tempWord = lines[i];
                            if (tempWord.indexOf("@") === 0) {
                                tempWord = variables[tempWord];
                            }
                            results.push(tempWord);
                        }
                        styleJson[propertyName] = results.join(" ");
                    }
                    else {
                        styleJson[propertyName] = variables[lines[0]];
                    }
                }
            }
        }
    };
    VectorTileLayer.prototype.createChildrenNode = function (currentNode, item, zoom) {
        if (item.subStyleCacheItems && item.subStyleCacheItems.length > 0) {
            for (var i = 0, ii = item.subStyleCacheItems.length; i < ii; i++) {
                var subStyleItem = item.subStyleCacheItems[i];
                if (zoom >= subStyleItem.minZoom && zoom <= subStyleItem.maxZoom) {
                    var node = new __WEBPACK_IMPORTED_MODULE_7__tree_TreeNode__["a" /* TreeNode */](subStyleItem);
                    currentNode.children.push(node);
                    this.createChildrenNode(node, subStyleItem, zoom);
                }
            }
        }
    };
    VectorTileLayer.prototype.isStyleJsonUrl = function (styleJson) {
        if (styleJson) {
            if (typeof styleJson !== "object") {
                return true;
            }
        }
        return false;
    };
    VectorTileLayer.prototype.registerGeoVector = function () {
        ol.LayerType["GEOVECTORTILE"] = "GEOVECTORTILE";
        // TODO: check the plugin had been registed.
        ol.plugins.register(ol.PluginType.LAYER_RENDERER, __WEBPACK_IMPORTED_MODULE_6__render_geoVectorTilelayerRender__["a" /* GeoVectorTileLayerRender */]);
        ol.VectorTile.Event = function (type, xhr) {
            ol.events.Event.call(this, type);
            this.xhr = xhr;
        };
        ol.inherits(ol.VectorTile, ol.events.Event);
        ol.VectorImageTile.prototype.disposeInternal = function () {
            for (var i = 0, ii = this.tileKeys.length; i < ii; ++i) {
                var sourceTileKey = this.tileKeys[i];
                var sourceTile = this.getTile(sourceTileKey);
                sourceTile.consumers--;
                if (sourceTile.consumers == 0) {
                    delete this.sourceTiles_[sourceTileKey];
                    sourceTile.dispose();
                }
            }
            this.sourceTiles_ = null;
            this.loadListenerKeys_.forEach(ol.events.unlistenByKey);
            this.loadListenerKeys_.length = 0;
            if (this.interimTile) {
                this.interimTile.dispose();
            }
            this.state = ol.TileState.ABORT;
            this.changed();
            // for the disposeInternal
            this.tileKeys.length = 0;
            this.sourceTileListenerKeys_.forEach(ol.events.unlistenByKey);
            this.sourceTileListenerKeys_.length = 0;
            ol.Tile.prototype.disposeInternal.call(this);
        };
        ol.TileQueue.prototype.handleTileChange = function (event) {
            var tile = /** @type {ol.Tile} */ (event.target);
            var state = tile.getState();
            if (state === ol.TileState.LOADED || state === ol.TileState.ERROR ||
                state === ol.TileState.EMPTY || state === ol.TileState.ABORT ||
                state === ol.TileState.CANCEL) {
                if (state === ol.TileState.ABORT || state === ol.TileState.ERROR) {
                    ol.events.unlisten(tile, ol.events.EventType.CHANGE, this.handleTileChange, this);
                }
                var tileKey = tile.getKey();
                if (tileKey in this.tilesLoadingKeys_) {
                    delete this.tilesLoadingKeys_[tileKey];
                    --this.tilesLoading_;
                }
                // Remove the enqueue records, if the tile has been dispose before load
                if (tileKey in this.queuedElements_) {
                    delete this.queuedElements_[tileKey];
                }
                this.tileChangeCallback_();
            }
        };
        // remove quickZoom when animation complete
        ol.View.prototype.updateAnimations_ = function () {
            if (this.updateAnimationKey_ !== undefined) {
                cancelAnimationFrame(this.updateAnimationKey_);
                this.updateAnimationKey_ = undefined;
            }
            if (!this.getAnimating()) {
                return;
            }
            var now = Date.now();
            var more = false;
            for (var i = this.animations_.length - 1; i >= 0; --i) {
                var series = this.animations_[i];
                var seriesComplete = true;
                for (var j = 0, jj = series.length; j < jj; ++j) {
                    var animation = series[j];
                    if (animation.complete) {
                        continue;
                    }
                    var elapsed = now - animation.start;
                    var fraction = animation.duration > 0 ? elapsed / animation.duration : 1;
                    if (fraction >= 1) {
                        animation.complete = true;
                        fraction = 1;
                    }
                    else {
                        seriesComplete = false;
                    }
                    var progress = animation.easing(fraction);
                    if (animation.sourceCenter) {
                        var x0 = animation.sourceCenter[0];
                        var y0 = animation.sourceCenter[1];
                        var x1 = animation.targetCenter[0];
                        var y1 = animation.targetCenter[1];
                        var x = x0 + progress * (x1 - x0);
                        var y = y0 + progress * (y1 - y0);
                        this.set(ol.ViewProperty.CENTER, [x, y]);
                    }
                    if (animation.sourceResolution && animation.targetResolution) {
                        var resolution = progress === 1 ?
                            animation.targetResolution :
                            animation.sourceResolution + progress * (animation.targetResolution - animation.sourceResolution);
                        if (animation.anchor) {
                            this.set(ol.ViewProperty.CENTER, this.calculateCenterZoom(resolution, animation.anchor));
                        }
                        this.set(ol.ViewProperty.RESOLUTION, resolution);
                    }
                    if (animation.sourceRotation !== undefined && animation.targetRotation !== undefined) {
                        var rotation = progress === 1 ?
                            ol.math.modulo(animation.targetRotation + Math.PI, 2 * Math.PI) - Math.PI :
                            animation.sourceRotation + progress * (animation.targetRotation - animation.sourceRotation);
                        if (animation.anchor) {
                            this.set(ol.ViewProperty.CENTER, this.calculateCenterRotate(rotation, animation.anchor));
                        }
                        this.set(ol.ViewProperty.ROTATION, rotation);
                    }
                    more = true;
                    if (!animation.complete) {
                        break;
                    }
                }
                if (seriesComplete) {
                    this.animations_[i] = null;
                    this.setHint(ol.ViewHint.ANIMATING, -1);
                    var callback = series[0].callback;
                    if (callback) {
                        callback(true);
                    }
                }
            }
            // prune completed series
            this.animations_ = this.animations_.filter(Boolean);
            if (more && this.updateAnimationKey_ === undefined) {
                this.updateAnimationKey_ = requestAnimationFrame(this.updateAnimations_);
            }
        };
        // Get quickZoom zoom in/out
        ol.View.prototype.animate = function (var_args) {
            var animationCount = arguments.length;
            var callback;
            if (animationCount > 1 && typeof arguments[animationCount - 1] === 'function') {
                callback = arguments[animationCount - 1];
                --animationCount;
            }
            if (!this.isDef()) {
                // if view properties are not yet set, shortcut to the final state
                var state = arguments[animationCount - 1];
                if (state.center) {
                    this.setCenter(state.center);
                }
                if (state.zoom !== undefined) {
                    this.setZoom(state.zoom);
                }
                if (state.rotation !== undefined) {
                    this.setRotation(state.rotation);
                }
                if (callback) {
                    callback(true);
                }
                return;
            }
            var start = Date.now();
            var center = this.getCenter().slice();
            var resolution = this.getResolution();
            var rotation = this.getRotation();
            var series = [];
            var quickZoom = false;
            for (var i = 0; i < animationCount; ++i) {
                var options = /** @type {olx.AnimationOptions} */ (arguments[i]);
                var animation = /** @type {ol.ViewAnimation} */ ({
                    start: start,
                    complete: false,
                    anchor: options.anchor,
                    duration: options.duration !== undefined ? options.duration : 1000,
                    easing: options.easing || ol.easing.inAndOut
                });
                if (options.center) {
                    animation["sourceCenter"] = center;
                    animation["targetCenter"] = options.center;
                    center = animation["targetCenter"];
                }
                if (options.zoom !== undefined) {
                    animation["sourceResolution"] = resolution;
                    animation["targetResolution"] = this.constrainResolution(this.maxResolution_, options.zoom - this.minZoom_, 0);
                    resolution = animation["targetResolution"];
                    if (!quickZoom) {
                        quickZoom = Math.abs(animation["sourceResolution"] - animation["targetResolution"]) * 2 >= animation["sourceResolution"];
                    }
                }
                else if (options.resolution) {
                    animation["sourceResolution"] = resolution;
                    animation["targetResolution"] = options.resolution;
                    resolution = animation["targetResolution"];
                    if (!quickZoom) {
                        quickZoom = Math.abs(animation["sourceResolution"] - animation["targetResolution"]) * 2 >= animation["sourceResolution"];
                    }
                }
                if (options.rotation !== undefined) {
                    animation["sourceRotation"] = rotation;
                    var delta = ol.math.modulo(options.rotation - rotation + Math.PI, 2 * Math.PI) - Math.PI;
                    animation["targetRotation"] = rotation + delta;
                    rotation = animation["targetRotation"];
                }
                animation["callback"] = callback;
                // check if animation is a no-op
                if (ol.View.isNoopAnimation(animation)) {
                    animation.complete = true;
                    // we still push it onto the series for callback handling
                }
                else {
                    start += animation.duration;
                }
                series.push(animation);
            }
            this.animations_.push(series);
            this["quickZoom"] = quickZoom;
            this.setHint(ol.ViewHint.ANIMATING, 1);
            this.updateAnimations_();
        };
        // add quickZoom into frameState
        ol.PluggableMap.prototype.renderFrame_ = function (time) {
            var i, ii, viewState;
            var size = this.getSize();
            var view = this.getView();
            var extent = ol.extent.createEmpty();
            var previousFrameState = this.frameState_;
            /** @type {?olx.FrameState} */
            var frameState = null;
            if (size !== undefined && ol.size.hasArea(size) && view && view.isDef()) {
                var viewHints = view.getHints(this.frameState_ ? this.frameState_.viewHints : undefined);
                var quickZoom = view["quickZoom"];
                var layerStatesArray = this.getLayerGroup().getLayerStatesArray();
                var layerStates = {};
                for (i = 0, ii = layerStatesArray.length; i < ii; ++i) {
                    layerStates[ol.getUid(layerStatesArray[i].layer)] = layerStatesArray[i];
                }
                viewState = view.getState();
                var center = viewState.center;
                var pixelResolution = viewState.resolution / this.pixelRatio_;
                center[0] = Math.round(center[0] / pixelResolution) * pixelResolution;
                center[1] = Math.round(center[1] / pixelResolution) * pixelResolution;
                frameState = /** @type {olx.FrameState} */ ({
                    animate: false,
                    coordinateToPixelTransform: this.coordinateToPixelTransform_,
                    extent: extent,
                    focus: !this.focus_ ? center : this.focus_,
                    index: this.frameIndex_++,
                    layerStates: layerStates,
                    layerStatesArray: layerStatesArray,
                    logos: ol.obj.assign({}, this.logos_),
                    pixelRatio: this.pixelRatio_,
                    pixelToCoordinateTransform: this.pixelToCoordinateTransform_,
                    postRenderFunctions: [],
                    size: size,
                    skippedFeatureUids: this.skippedFeatureUids_,
                    tileQueue: this.tileQueue_,
                    time: time,
                    usedTiles: {},
                    viewState: viewState,
                    viewHints: viewHints,
                    quickZoom: quickZoom,
                    currentResolution: viewState.resolution,
                    wantedTiles: {}
                });
            }
            if (frameState) {
                frameState.extent = ol.extent.getForViewAndSize(viewState.center, viewState.resolution, viewState.rotation, frameState.size, extent);
            }
            this.frameState_ = frameState;
            this.renderer_.renderFrame(frameState);
            if (frameState) {
                if (frameState.animate) {
                    this.render();
                }
                Array.prototype.push.apply(this.postRenderFunctions_, frameState.postRenderFunctions);
                if (previousFrameState) {
                    var moveStart = !this.previousExtent_ ||
                        (!ol.extent.isEmpty(this.previousExtent_) &&
                            !ol.extent.equals(frameState.extent, this.previousExtent_));
                    if (moveStart) {
                        this.dispatchEvent(new ol.MapEvent(ol.MapEventType.MOVESTART, this, previousFrameState));
                        this.previousExtent_ = ol.extent.createOrUpdateEmpty(this.previousExtent_);
                    }
                }
                var idle = this.previousExtent_ &&
                    !frameState.viewHints[ol.ViewHint.ANIMATING] &&
                    !frameState.viewHints[ol.ViewHint.INTERACTING] &&
                    !ol.extent.equals(frameState.extent, this.previousExtent_);
                if (idle) {
                    this.dispatchEvent(new ol.MapEvent(ol.MapEventType.MOVEEND, this, frameState));
                    ol.extent.clone(frameState.extent, this.previousExtent_);
                }
            }
            this.dispatchEvent(new ol.MapEvent(ol.MapEventType.POSTRENDER, this, frameState));
            setTimeout(this.handlePostRender.bind(this), 0);
        };
        // refine drawImage performance
        ol.renderer.canvas.TileLayer.prototype.drawTileImage = function (tile, frameState, layerState, x, y, w, h, gutter, transition) {
            var image = tile.getImage(this.getLayer());
            if (!image) {
                return;
            }
            var uid = ol.getUid(this);
            var alpha = transition ? tile.getAlpha(uid, frameState.time) : 1;
            if (alpha === 1 && !this.getLayer().getSource().getOpaque(frameState.viewState.projection)) {
                this.context.clearRect(x, y, w, h);
            }
            var alphaChanged = alpha !== this.context.globalAlpha;
            if (alphaChanged) {
                this.context.save();
                this.context.globalAlpha = alpha;
            }
            // // before
            this.context.drawImage(image, gutter, gutter, image.width - 2 * gutter, image.height - 2 * gutter, x, y, w, h);
            // console.log(gutter, gutter, image.width - 2 * gutter, image.height - 2 * gutter, x, y, w, h)
            // // after
            // this.context.save();
            // var ptrn = this.context.createPattern(image, 'repeat');
            // this.context.fillStyle = ptrn;
            // this.context.fillRect(x, y, w, h);
            // this.context.restore();
            if (alphaChanged) {
                this.context.restore();
            }
            if (alpha !== 1) {
                frameState.animate = true;
            }
            else if (transition) {
                tile.endTransition(uid);
            }
        };
        //refine drawing, and remove instructions after using
        ol.render.canvas.Replay.prototype.replay_ = function (context, transform, skippedFeaturesHash, instructions, featureCallback, opt_hitExtent) {
            /** @type {Array.<number>} */
            var pixelCoordinates;
            if (this.instructions != instructions) {
                // hit instructions
                if (this.pixelCoordinates_ && ol.array.equals(transform, this.renderedTransform_)) {
                    pixelCoordinates = this.pixelCoordinates_;
                }
                else {
                    pixelCoordinates = ol.geom.flat.transform.transform2D(this.coordinates, 0, this.coordinates.length, 2, transform, []);
                }
            }
            else {
                // instructions
                if (this.pixelCoordinates_ && ol.array.equals(transform, this.renderedTransform_)) {
                    pixelCoordinates = this.pixelCoordinates_;
                }
                else {
                    if (!this.pixelCoordinates_) {
                        this.pixelCoordinates_ = [];
                    }
                    pixelCoordinates = ol.geom.flat.transform.transform2D(this.coordinates, 0, this.coordinates.length, 2, transform, this.pixelCoordinates_);
                    ol.transform.setFromArray(this.renderedTransform_, transform);
                }
            }
            var skipFeatures = !ol.obj.isEmpty(skippedFeaturesHash);
            var i = 0; // instruction index
            var ii = instructions.length; // end of instructions
            var d = 0; // data index
            var dd; // end of per-instruction data
            var anchorX, anchorY, prevX, prevY, roundX, roundY, declutterGroup, image;
            var pendingFill = 0;
            var pendingStroke = 0;
            var lastFillInstruction = null;
            var lastStrokeInstruction = null;
            var coordinateCache = this.coordinateCache_;
            var viewRotation = this.viewRotation_;
            var state = /** @type {olx.render.State} */ ({
                context: context,
                pixelRatio: this.pixelRatio,
                resolution: this.resolution,
                rotation: viewRotation
            });
            // When the batch size gets too big, performance decreases. 200 is a good
            // balance between batch size and number of fill/stroke instructions.
            var batchSize = this.instructions != instructions || this.overlaps ? 0 : 200;
            while (i < ii) {
                var instruction = instructions[i];
                var type = /** @type {ol.render.canvas.Instruction} */ (instruction[0]);
                var /** @type {ol.Feature|ol.render.Feature} */ feature, x, y;
                switch (type) {
                    case ol.render.canvas.Instruction.BEGIN_GEOMETRY:
                        feature = /** @type {ol.Feature|ol.render.Feature} */ (instruction[1]);
                        if ((skipFeatures &&
                            skippedFeaturesHash[ol.getUid(feature).toString()]) ||
                            !feature.getGeometry()) {
                            i = /** @type {number} */ (instruction[2]);
                        }
                        else if (opt_hitExtent !== undefined && !ol.extent.intersects(opt_hitExtent, feature.getGeometry().getExtent())) {
                            i = /** @type {number} */ (instruction[2]) + 1;
                        }
                        else {
                            ++i;
                        }
                        break;
                    case ol.render.canvas.Instruction.BEGIN_PATH:
                        if (pendingFill > batchSize) {
                            this.fill_(context);
                            pendingFill = 0;
                        }
                        if (pendingStroke > batchSize) {
                            context.stroke();
                            pendingStroke = 0;
                        }
                        if (!pendingFill && !pendingStroke) {
                            context.beginPath();
                            prevX = prevY = NaN;
                        }
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.CIRCLE:
                        d = /** @type {number} */ (instruction[1]);
                        var x1 = pixelCoordinates[d];
                        var y1 = pixelCoordinates[d + 1];
                        var x2 = pixelCoordinates[d + 2];
                        var y2 = pixelCoordinates[d + 3];
                        var dx = x2 - x1;
                        var dy = y2 - y1;
                        var r = Math.sqrt(dx * dx + dy * dy);
                        context.moveTo(x1 + r, y1);
                        context.arc(x1, y1, r, 0, 2 * Math.PI, true);
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.CLOSE_PATH:
                        context.closePath();
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.CUSTOM:
                        d = /** @type {number} */ (instruction[1]);
                        dd = instruction[2];
                        var geometry = /** @type {ol.geom.SimpleGeometry} */ (instruction[3]);
                        var renderer = instruction[4];
                        var fn = instruction.length == 6 ? instruction[5] : undefined;
                        state["geometry"] = geometry;
                        state["feature"] = feature;
                        if (!(i in coordinateCache)) {
                            coordinateCache[i] = [];
                        }
                        var coords = coordinateCache[i];
                        if (fn) {
                            fn(pixelCoordinates, d, dd, 2, coords);
                        }
                        else {
                            coords[0] = pixelCoordinates[d];
                            coords[1] = pixelCoordinates[d + 1];
                            coords.length = 2;
                        }
                        renderer(coords, state);
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.DRAW_IMAGE:
                        d = /** @type {number} */ (instruction[1]);
                        dd = /** @type {number} */ (instruction[2]);
                        image = /** @type {HTMLCanvasElement|HTMLVideoElement|Image} */
                            (instruction[3]);
                        // Remaining arguments in DRAW_IMAGE are in alphabetical order
                        anchorX = /** @type {number} */ (instruction[4]);
                        anchorY = /** @type {number} */ (instruction[5]);
                        declutterGroup = featureCallback ? null : /** @type {ol.DeclutterGroup} */ (instruction[6]);
                        var height = /** @type {number} */ (instruction[7]);
                        var opacity = /** @type {number} */ (instruction[8]);
                        var originX = /** @type {number} */ (instruction[9]);
                        var originY = /** @type {number} */ (instruction[10]);
                        var rotateWithView = /** @type {boolean} */ (instruction[11]);
                        var rotation = /** @type {number} */ (instruction[12]);
                        var scale = /** @type {number} */ (instruction[13]);
                        var snapToPixel = /** @type {boolean} */ (instruction[14]);
                        var width = /** @type {number} */ (instruction[15]);
                        var padding, backgroundFill, backgroundStroke;
                        if (instruction.length > 16) {
                            padding = /** @type {Array.<number>} */ (instruction[16]);
                            backgroundFill = /** @type {boolean} */ (instruction[17]);
                            backgroundStroke = /** @type {boolean} */ (instruction[18]);
                        }
                        else {
                            padding = ol.render.canvas.defaultPadding;
                            backgroundFill = backgroundStroke = false;
                        }
                        if (rotateWithView) {
                            rotation += viewRotation;
                        }
                        for (; d < dd; d += 2) {
                            this.replayImage_(context, pixelCoordinates[d], pixelCoordinates[d + 1], image, anchorX, anchorY, declutterGroup, height, opacity, originX, originY, rotation, scale, snapToPixel, width, padding, backgroundFill ? /** @type {Array.<*>} */ (lastFillInstruction) : null, backgroundStroke ? /** @type {Array.<*>} */ (lastStrokeInstruction) : null);
                        }
                        this.renderDeclutter_(declutterGroup, feature);
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.DRAW_CHARS:
                        var begin = /** @type {number} */ (instruction[1]);
                        var end = /** @type {number} */ (instruction[2]);
                        var baseline = /** @type {number} */ (instruction[3]);
                        declutterGroup = featureCallback ? null : /** @type {ol.DeclutterGroup} */ (instruction[4]);
                        var overflow = /** @type {number} */ (instruction[5]);
                        var fillKey = /** @type {string} */ (instruction[6]);
                        var maxAngle = /** @type {number} */ (instruction[7]);
                        var measure = /** @type {function(string):number} */ (instruction[8]);
                        var offsetY = /** @type {number} */ (instruction[9]);
                        var strokeKey = /** @type {string} */ (instruction[10]);
                        var strokeWidth = /** @type {number} */ (instruction[11]);
                        var text = /** @type {string} */ (instruction[12]);
                        var textKey = /** @type {string} */ (instruction[13]);
                        var textScale = /** @type {number} */ (instruction[14]);
                        var pathLength = ol.geom.flat.length.lineString(pixelCoordinates, begin, end, 2);
                        var textLength = measure(text);
                        if (overflow || textLength <= pathLength) {
                            var textAlign = /** @type {ol.render.canvas.TextReplay} */ (this).textStates[textKey].textAlign;
                            var startM = (pathLength - textLength) * ol.render.replay.TEXT_ALIGN[textAlign];
                            var parts = ol.geom.flat.textpath.lineString(pixelCoordinates, begin, end, 2, text, measure, startM, maxAngle);
                            if (parts) {
                                var c, cc, chars, label, part;
                                if (strokeKey) {
                                    for (c = 0, cc = parts.length; c < cc; ++c) {
                                        part = parts[c]; // x, y, anchorX, rotation, chunk
                                        chars = /** @type {string} */ (part[4]);
                                        label = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, '', strokeKey);
                                        anchorX = /** @type {number} */ (part[2]) + strokeWidth;
                                        anchorY = baseline * label.height + (0.5 - baseline) * 2 * strokeWidth - offsetY;
                                        this.replayImage_(context, 
                                        /** @type {number} */ (part[0]), /** @type {number} */ (part[1]), label, anchorX, anchorY, declutterGroup, label.height, 1, 0, 0, 
                                        /** @type {number} */ (part[3]), textScale, false, label.width, ol.render.canvas.defaultPadding, null, null);
                                    }
                                }
                                if (fillKey) {
                                    for (c = 0, cc = parts.length; c < cc; ++c) {
                                        part = parts[c]; // x, y, anchorX, rotation, chunk
                                        chars = /** @type {string} */ (part[4]);
                                        label = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, fillKey, '');
                                        anchorX = /** @type {number} */ (part[2]);
                                        anchorY = baseline * label.height - offsetY;
                                        this.replayImage_(context, 
                                        /** @type {number} */ (part[0]), /** @type {number} */ (part[1]), label, anchorX, anchorY, declutterGroup, label.height, 1, 0, 0, 
                                        /** @type {number} */ (part[3]), textScale, false, label.width, ol.render.canvas.defaultPadding, null, null);
                                    }
                                }
                            }
                        }
                        this.renderDeclutter_(declutterGroup, feature);
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.END_GEOMETRY:
                        if (featureCallback !== undefined) {
                            feature = /** @type {ol.Feature|ol.render.Feature} */ (instruction[1]);
                            var result = featureCallback(feature);
                            if (result) {
                                return result;
                            }
                        }
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.FILL:
                        if (batchSize) {
                            pendingFill++;
                        }
                        else {
                            this.fill_(context);
                        }
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.MOVE_TO_LINE_TO:
                        d = /** @type {number} */ (instruction[1]);
                        dd = /** @type {number} */ (instruction[2]);
                        x = pixelCoordinates[d];
                        y = pixelCoordinates[d + 1];
                        roundX = (x + 0.5) | 0;
                        roundY = (y + 0.5) | 0;
                        if (roundX !== prevX || roundY !== prevY) {
                            context.moveTo(x, y);
                            prevX = roundX;
                            prevY = roundY;
                        }
                        for (d += 2; d < dd; d += 2) {
                            x = pixelCoordinates[d];
                            y = pixelCoordinates[d + 1];
                            roundX = (x + 0.5) | 0;
                            roundY = (y + 0.5) | 0;
                            if (d == dd - 2 || roundX !== prevX || roundY !== prevY) {
                                context.lineTo(x, y);
                                prevX = roundX;
                                prevY = roundY;
                            }
                        }
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.SET_FILL_STYLE:
                        lastFillInstruction = instruction;
                        this.fillOrigin_ = instruction[2];
                        if (pendingFill) {
                            this.fill_(context);
                            pendingFill = 0;
                            if (pendingStroke) {
                                context.stroke();
                                pendingStroke = 0;
                            }
                        }
                        context.fillStyle = /** @type {ol.ColorLike} */ (instruction[1]);
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.SET_STROKE_STYLE:
                        lastStrokeInstruction = instruction;
                        if (pendingStroke) {
                            context.stroke();
                            pendingStroke = 0;
                        }
                        this.setStrokeStyle_(context, /** @type {Array.<*>} */ (instruction));
                        ++i;
                        break;
                    case ol.render.canvas.Instruction.STROKE:
                        if (batchSize) {
                            pendingStroke++;
                        }
                        else {
                            context.stroke();
                        }
                        ++i;
                        break;
                    default:
                        ++i; // consume the instruction anyway, to avoid an infinite loop
                        break;
                }
            }
            if (pendingFill) {
                this.fill_(context);
            }
            if (pendingStroke) {
                context.stroke();
            }
            // //release instructions
            // if (this.instructions === instructions&&!(this instanceof (<any>ol).render.canvas.ImageReplay))
            // {
            //     this.instructions.length=0;
            //     this.pixelCoordinates_=null;
            // }
            return undefined;
        };
        ol.renderer.canvas.VectorTileLayer.prototype.forEachFeatureAtCoordinate = function (coordinate, frameState, hitTolerance, callback, thisArg) {
            var resolution = frameState.viewState.resolution;
            var rotation = frameState.viewState.rotation;
            hitTolerance = hitTolerance == undefined ? 0 : hitTolerance;
            var layer = this.getLayer();
            /** @type {Object.<string, boolean>} */
            var features = {};
            /** @type {Array.<ol.VectorImageTile>} */
            var renderedTiles = this.renderedTiles;
            var source = /** @type {ol.source.VectorTile} */ (layer.getSource());
            var tileGrid = source.getTileGridForProjection(frameState.viewState.projection);
            var bufferedExtent, found;
            var i, ii, replayGroup;
            var tile, tileCoord, tileExtent;
            for (i = 0, ii = renderedTiles.length; i < ii; ++i) {
                tile = renderedTiles[i];
                tileCoord = tile.wrappedTileCoord;
                tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent);
                bufferedExtent = ol.extent.buffer(tileExtent, hitTolerance * resolution, bufferedExtent);
                if (!ol.extent.containsCoordinate(bufferedExtent, coordinate)) {
                    continue;
                }
                for (var t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
                    var sourceTile = tile.getTile(tile.tileKeys[t]);
                    if (sourceTile.getState() == ol.TileState.ERROR) {
                        continue;
                    }
                    replayGroup = sourceTile.getReplayGroup(layer, tileCoord.toString());
                    found = found || replayGroup.forEachFeatureAtCoordinate(coordinate, resolution, rotation, hitTolerance, {}, 
                    /**
                     * @param {ol.Feature|ol.render.Feature} feature Feature.
                     * @return {?} Callback result.
                     */
                    function (feature) {
                        var key = ol.getUid(feature).toString();
                        if (!(key in features)) {
                            features[key] = true;
                            return callback.call(thisArg, feature, layer);
                        }
                    }, null);
                }
            }
            return found;
        };
    };
    return VectorTileLayer;
}(ol.layer.VectorTile));



/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoVectorTileSource; });
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GeoVectorTileSource = /** @class */ (function (_super) {
    __extends(GeoVectorTileSource, _super);
    function GeoVectorTileSource(options) {
        var _this_1 = _super.call(this, options) || this;
        _this_1.maxDataZoom = options.maxDataZoom;
        if (options["tileUrlFunction"] === undefined) {
            _this_1.setTileUrlFunction(_this_1.getGeoTileUrlFunction());
        }
        _this_1.clientId = options.clientId;
        _this_1.clientSecret = options.clientSecret;
        _this_1.geoFormat = options.format;
        _this_1.tileLoadFunction = _this_1.vectorTileLoadFunction.bind(_this_1);
        _this_1.isMultithread = options["multithread"] === undefined ? true : options["multithread"];
        return _this_1;
    }
    GeoVectorTileSource.prototype.getGeoFormat = function () {
        return this.geoFormat;
    };
    GeoVectorTileSource.prototype.getGeoTileUrlFunction = function () {
        var zRegEx = /\{z\}/g;
        var xRegEx = /\{x\}/g;
        var yRegEx = /\{y\}/g;
        var dashYRegEx = /\{-y\}/g;
        var urls = this.urls;
        var tileGrid = this.tileGrid;
        var maxDataZoom = this.maxDataZoom;
        return function (tileCoord) {
            if (!tileCoord) {
                return undefined;
            }
            else {
                var requestCoord_1 = [tileCoord[0], tileCoord[1], tileCoord[2]];
                if (maxDataZoom && requestCoord_1[0] > maxDataZoom) {
                    while (requestCoord_1[0] !== maxDataZoom) {
                        requestCoord_1[0] -= 1;
                        requestCoord_1[1] = Math.floor(requestCoord_1[1] / 2);
                        requestCoord_1[2] = Math.floor(requestCoord_1[2] / 2);
                    }
                }
                var h = ol.tilecoord.hash(tileCoord);
                var index = ol.math.modulo(h, urls.length);
                var template = urls[index];
                return template.replace(zRegEx, requestCoord_1[0].toString())
                    .replace(xRegEx, requestCoord_1[1].toString())
                    .replace(yRegEx, function () {
                    var y = -requestCoord_1[2] - 1;
                    return y.toString();
                })
                    .replace(dashYRegEx, function () {
                    var z = requestCoord_1[0];
                    var range = tileGrid.getFullTileRange(z);
                    ol.asserts.assert(range, 55); // The {-y} placeholder requires a tile grid with extent
                    var y = range.getHeight() + requestCoord_1[2];
                    return y.toString();
                });
            }
        };
    };
    GeoVectorTileSource.prototype.vectorTileLoadFunction = function (tile, url) {
        var loader = this.loadFeaturesXhr(url, tile.getFormat(), tile.onLoad.bind(tile), tile.onError.bind(tile), this);
        tile.setLoader(loader);
    };
    GeoVectorTileSource.prototype.getIDAndSecret = function (self) {
        var xhr = new XMLHttpRequest();
        var url = 'https://gisserver.thinkgeo.com/api/v1/auth/token';
        var content = 'ApiKey=' + self.clientId + '&ApiSecret=' + self.clientSecret;
        xhr.open("POST", url, false);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function (event) {
            if (!xhr.status || xhr.status >= 200 && xhr.status < 300) {
                var token = JSON.parse(xhr.responseText).data.access_token;
                self.token = token;
            }
        }.bind(this);
        xhr.onerror = function () {
        }.bind(this);
        xhr.send(content);
    };
    GeoVectorTileSource.prototype.loadFeaturesXhr = function (url, format, success, failure, self) {
        return (function (extent, resolution, projection) {
            var _this = this;
            var maxDataZoom = format.maxDataZoom;
            var requestTileCoord = [this.tileCoord[0], this.tileCoord[1], this.tileCoord[2]];
            if (maxDataZoom && requestTileCoord[0] > maxDataZoom) {
                while (requestTileCoord[0] !== maxDataZoom) {
                    requestTileCoord[0] -= 1;
                    requestTileCoord[1] = Math.floor(requestTileCoord[1] / 2);
                    requestTileCoord[2] = Math.floor(requestTileCoord[2] / 2);
                }
            }
            this.requestTileCoord = requestTileCoord;
            var callback = function (tile, callbackFunction, sourceProjection, lastExtent) {
                callbackFunction.call(tile, sourceProjection, lastExtent);
            };
            var hasRequested = false;
            hasRequested = format.registerTileLoadEvent(this, success, failure, callback);
            if (!hasRequested) {
                // Client ID and Client Secret   
                if (url.indexOf('apiKey') === -1 && self.clientId && self.clientSecret && !self.token) {
                    self.getIDAndSecret(self);
                }
                if (format.isMultithread && format.workerManager) {
                    var requestInfo = {
                        url: typeof url === "function" ? url(extent, resolution, projection) : url,
                        type: format.getType(),
                        tileCoord: this.tileCoord,
                        requestCoord: requestTileCoord,
                        minimalist: format.minimalist,
                        maxDataZoom: format.maxDataZoom,
                        formatId: ol.getUid(format),
                        layerName: format.layerName,
                        token: self.token,
                        vectorTileDataCahceSize: format["vectorTileDataCahceSize"],
                        tileRange: _this.tileRange,
                        tileCoordWithSourceCoord: _this.tileCoordWithSourceCoord,
                        vectorImageTileCoord: _this.vectorImageTileCoord
                    };
                    var loadedCallback = function (data, methodInfo) {
                        var requestKey = data.requestKey;
                        var tileLoadEventInfos = format.registeredLoadEvents[requestKey];
                        delete format.registeredLoadEvents[requestKey];
                        for (var i = 0; i < tileLoadEventInfos.length; i++) {
                            var loadEventInfo = tileLoadEventInfos[i];
                            loadEventInfo.tile.workerId = methodInfo.workerId; // Currently, we just one web worker for one layer.
                            // let tileKey = "" + loadEventInfo.tile.tileCoord[1] + "," + loadEventInfo.tile.tileCoord[2];
                            // FIXME Eric
                            if (data.status === "cancel") {
                                loadEventInfo.tile.setState(ol.TileState.CANCEL);
                            }
                            else if (data.status === "succeed") {
                                loadEventInfo.callback(loadEventInfo.tile, loadEventInfo.successFunction, format.readProjection());
                            }
                            else {
                                loadEventInfo.callback(loadEventInfo.tile, loadEventInfo.failureFunction, format.readProjection());
                            }
                        }
                    };
                    format.workerManager.postMessage(this.tileCoord + ol.getUid(loadedCallback), "request", requestInfo, loadedCallback, undefined);
                }
                else {
                    var tileCoord_1 = this.tileCoord;
                    var tile_1 = this;
                    var xhr_1 = new XMLHttpRequest();
                    xhr_1.open("GET", typeof url === "function" ? url(extent, resolution, projection) : url, true);
                    if (self.token) {
                        xhr_1.setRequestHeader('Authorization', 'Bearer ' + self.token);
                    }
                    if (format.getType() === ol.format.FormatType.ARRAY_BUFFER) {
                        xhr_1.responseType = "arraybuffer";
                    }
                    xhr_1.onload = function (event) {
                        if (!xhr_1.status || xhr_1.status >= 200 && xhr_1.status < 300) {
                            var type = format.getType();
                            /** @type {Document|Node|Object|string|undefined} */
                            var source = void 0;
                            if (type === ol.format.FormatType.JSON ||
                                type === ol.format.FormatType.TEXT) {
                                source = xhr_1.responseText;
                            }
                            else if (type === ol.format.FormatType.XML) {
                                source = xhr_1.responseXML;
                                if (!source) {
                                    source = ol.xml.parse(xhr_1.responseText);
                                }
                            }
                            else if (type === ol.format.FormatType.ARRAY_BUFFER) {
                                source = /** @type {ArrayBuffer} */ (xhr_1.response);
                            }
                            if (source) {
                                // ReadFeature
                                var data = format.readFeaturesAndCreateInstructsNew(source, requestTileCoord, tileCoord_1);
                                // Call Load Event
                                var requestKey = tile_1.requestTileCoord.join(",") + "," + tile_1.tileCoord[0];
                                var tileLoadEventInfos = format.registeredLoadEvents[requestKey];
                                delete format.registeredLoadEvents[requestKey];
                                for (var i = 0; i < tileLoadEventInfos.length; i++) {
                                    var loadEventInfo = tileLoadEventInfos[i];
                                    var tileKey = "" + loadEventInfo.tile.tileCoord[1] + "," + loadEventInfo.tile.tileCoord[2];
                                    loadEventInfo.tile.featuresAndInstructs = { features: data[0], instructs: data[1][tileKey] };
                                    loadEventInfo.callback(loadEventInfo.tile, loadEventInfo.successFunction, format.readProjection());
                                }
                            }
                            else {
                                failure.call(this);
                            }
                        }
                        else {
                            failure.call(this);
                        }
                    }.bind(this);
                    xhr_1.onerror = function () {
                        failure.call(this);
                    }.bind(this);
                    this["xhr"] = xhr_1;
                    format.source.dispatchEvent(new ol.VectorTile.Event("sendingTileRequest", xhr_1));
                    xhr_1.send();
                }
            }
        });
    };
    return GeoVectorTileSource;
}(ol.source.VectorTile));



/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoVectorTile; });
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GeoVectorTile = /** @class */ (function (_super) {
    __extends(GeoVectorTile, _super);
    function GeoVectorTile(tileCoord, state, src, format, tileLoadFunction) {
        var _this = _super.call(this, tileCoord, state, src, format, tileLoadFunction) || this;
        _this.disposeInternal = _this.disposeInternalCustom;
        return _this;
    }
    GeoVectorTile.prototype.disposeInternalCustom = function () {
        this.features_ = null;
        this.replayGroups_ = {};
        // this.state = ol.TileState.ABORT;
        this.state = ol.TileState.IDLE;
        this.changed();
        if (this["xhr"] != undefined) {
            this["xhr"].abort();
        }
        if (this.workerId !== undefined) {
            var disposeInfo = {
                formatId: ol.getUid(this.getFormat()),
                maxDataZoom: this.getFormat().maxDataZoom,
                tileCoord: this.tileCoord,
                requestTileCoord: this.requestTileCoord
            };
            this.getFormat().workerManager.postMessage(this.tileCoord + ol.getUid(disposeInfo), "vectorTileDispose", disposeInfo, null, this.workerId);
        }
        ol.Tile.prototype.disposeInternal.call(this);
    };
    GeoVectorTile.prototype.onLoad = function (dataProjection, extent) {
        this.setProjection(dataProjection);
        this.setFeatures();
        this.setExtent(extent);
    };
    GeoVectorTile.prototype.setRenderFeatureInstructs = function (instructs) {
        this.instructs = instructs;
    };
    GeoVectorTile.prototype.getRenderFeatureInstructs = function (instructs) {
        return this.instructs;
    };
    return GeoVectorTile;
}(ol.VectorTile));



/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoMVTFormat; });
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GeoMVTFormat = /** @class */ (function (_super) {
    __extends(GeoMVTFormat, _super);
    function GeoMVTFormat(styleJSonCache, options) {
        var _this = this;
        options.layerName = options.layerName ? options.layerName : "layerName";
        _this = _super.call(this, options) || this;
        _this.isMultithread = options.multithread;
        _this.minimalist = options.minimalist;
        _this.maxDataZoom = options.maxDataZoom ? options.maxDataZoom : 14;
        _this.layerName = options.layerName;
        _this.styleJsonCache = styleJSonCache;
        _this.maxDataZoomCache = {};
        _this.registeredLoadEvents = {};
        _this.lruCache = new ol.structs.LRUCache(15);
        _this.sourceCache = {};
        return _this;
    }
    GeoMVTFormat.prototype.getLayerName = function () {
        return this.layerName;
    };
    GeoMVTFormat.prototype.registerTileLoadEvent = function (tile, success, failure, callback) {
        var hasRequested = true;
        var requestKey = tile.requestTileCoord.join(",") + "," + tile.tileCoord[0];
        var loadEventInfo = {
            tile: tile,
            successFunction: success,
            failureFunction: failure,
            callback: callback
        };
        if (this.registeredLoadEvents[requestKey] === undefined) {
            this.registeredLoadEvents[requestKey] = [];
            hasRequested = false;
        }
        this.registeredLoadEvents[requestKey].push(loadEventInfo);
        return hasRequested;
    };
    GeoMVTFormat.prototype.readFeaturesAndCreateInstructsNew = function (source, requestTileCoord, tileCoord) {
        var pbf = new ol.ext.PBF((source));
        var pbfLayers = pbf.readFields(ol.format.MVT.pbfReaders_.layers, {});
        var pbfLayer;
        var features = [];
        var featureIndex = -1;
        var zoomMatchedGeoStylesGroupByLayerId = this.styleJsonCache.geoStyleGroupByZoom[tileCoord[0]];
        if (!zoomMatchedGeoStylesGroupByLayerId) {
            return features;
        }
        var pbfLayerNamesWithGeoStyle = [];
        for (var pbfLayerName in zoomMatchedGeoStylesGroupByLayerId) {
            pbfLayerNamesWithGeoStyle.push(pbfLayerName);
        }
        var instructsCache = [];
        for (var name_1 in pbfLayers) {
            if (this.layers_ && this.layers_.indexOf(name_1) === -1) {
                continue;
            }
            if (pbfLayerNamesWithGeoStyle.indexOf(name_1) === -1) {
                continue;
            }
            pbfLayer = pbfLayers[name_1];
            var cacheTrees = zoomMatchedGeoStylesGroupByLayerId[name_1];
            if (cacheTrees && cacheTrees.length > 0) {
                this.replaceFiltersToIndexOfPbfLayer(cacheTrees, pbfLayer);
                var _loop_1 = function (i) {
                    var rawFeature = ol.format.MVT.readRawFeature_(pbf, pbfLayer, i);
                    var feature_1 = void 0;
                    var _loop_2 = function (j) {
                        var cacheTree = cacheTrees[j];
                        var treeIndex = cacheTree.treeIndex;
                        if (instructsCache[treeIndex] === undefined) {
                            instructsCache[treeIndex] = {
                                min: 10,
                                max: -10
                            };
                        }
                        var matchedNode;
                        var checkNodeMatched = function (node) {
                            var styleJsonCacheItem = node.data;
                            var matched = false;
                            if (styleJsonCacheItem.filterGroup.length > 0) {
                                for (var i_1 = 0; i_1 < styleJsonCacheItem.filterGroup.length; i_1++) {
                                    var filters = styleJsonCacheItem.filterGroup[i_1];
                                    var groupMatched = true;
                                    for (var j_1 = 0; j_1 < filters.length; j_1++) {
                                        var filter = filters[j_1];
                                        if (!filter.matchOLFeature(rawFeature, tileCoord[0])) {
                                            groupMatched = false;
                                            break;
                                        }
                                    }
                                    if (groupMatched) {
                                        matched = true;
                                        break;
                                    }
                                }
                            }
                            else {
                                matched = true;
                            }
                            return matched;
                        };
                        var selectNode = function (node) {
                            matchedNode = node.data;
                        };
                        cacheTree.traverseNode(checkNodeMatched, selectNode);
                        if (matchedNode) {
                            if (feature_1 === undefined) {
                                feature_1 = this_1.createFeature_(pbf, rawFeature);
                                features.push(feature_1);
                                featureIndex += 1;
                            }
                            var zindex = void 0;
                            if (cacheTree.root.data.zIndex) {
                                zindex = rawFeature.properties[cacheTree.root.data.zIndex];
                                feature_1.properties_[cacheTree.root.data.zIndex] = zindex;
                            }
                            if (isNaN(zindex)) {
                                zindex = 0;
                            }
                            if (instructsCache[treeIndex][zindex] === undefined) {
                                instructsCache[treeIndex][zindex] = [];
                                if (zindex < instructsCache[treeIndex]["min"]) {
                                    instructsCache[treeIndex]["min"] = zindex;
                                }
                                if (zindex > instructsCache[treeIndex]["max"]) {
                                    instructsCache[treeIndex]["max"] = zindex;
                                }
                            }
                            instructsCache[treeIndex][zindex].push([featureIndex, matchedNode]);
                            feature_1.extent_ = undefined;
                        }
                    };
                    for (var j = 0; j < cacheTrees.length; j++) {
                        _loop_2(j);
                    }
                };
                var this_1 = this;
                for (var i = 0; i < pbfLayer.length; i++) {
                    _loop_1(i);
                }
            }
            this.extent_ = pbfLayer ? [0, 0, pbfLayer.extent, pbfLayer.extent] : null;
        }
        var instructs = [];
        for (var i = 0; i < instructsCache.length; i++) {
            var instructsInOneTree = instructsCache[i];
            if (instructsInOneTree) {
                for (var j = instructsInOneTree.min, jj = instructsInOneTree.max; j <= jj; j++) {
                    var instructsInOneZIndex = instructsInOneTree[j];
                    if (instructsInOneZIndex) {
                        var childrenInstructs = [];
                        for (var h = 0; h < instructsInOneZIndex.length; h++) {
                            var instruct = instructsInOneZIndex[h];
                            var feature = features[instruct[0]];
                            feature.styleId = feature.styleId ? feature.styleId : {};
                            if (instruct[1].geoStyle) {
                                feature.styleId[instruct[1].geoStyle.id] = 0;
                                instructs.push([instruct[0], instruct[1].geoStyle, i]);
                            }
                            if (instruct[1].childrenGeoStyles) {
                                for (var k = 0; k < instruct[1].childrenGeoStyles.length; k++) {
                                    feature.styleId[instruct[1].childrenGeoStyles[k].id] = 1;
                                    childrenInstructs.push([instruct[0], instruct[1].childrenGeoStyles[k], i]);
                                }
                            }
                        }
                        Array.prototype.push.apply(instructs, childrenInstructs);
                    }
                }
            }
        }
        var subTileCachedInstruct = {};
        var offsetZ = tileCoord[0] - requestTileCoord[0];
        // TODO Get Extent 
        var tileSize = 4096 / Math.pow(2, offsetZ);
        var tileRange = this.getTileRange(requestTileCoord, tileCoord[0]);
        var tiles = {};
        for (var x = tileRange[0]; x <= tileRange[2]; x++) {
            var minX = (x - tileRange[0]) * tileSize;
            var maxX = (x - tileRange[0] + 1) * tileSize;
            for (var y = tileRange[3]; y >= tileRange[1]; y--) {
                var minY = (tileRange[3] - y) * tileSize;
                var maxY = (tileRange[3] - y + 1) * tileSize;
                tiles["" + [x, y]] = [minX, minY, maxX, maxY];
            }
        }
        for (var i = 0; i < instructs.length; i++) {
            var instruct = instructs[i];
            var feature_2 = features[instruct[0]];
            var featureExtent = feature_2.getExtent();
            var featureTileRange = this.getFeatureTileRange(featureExtent, 4096, tileSize, requestTileCoord, offsetZ);
            for (var x = tileRange[0] > featureTileRange[0] ? tileRange[0] : featureTileRange[0], xx = featureTileRange[2] > tileRange[2] ? tileRange[2] : featureTileRange[2]; x <= xx; x++) {
                for (var y = tileRange[1] > featureTileRange[1] ? tileRange[1] : featureTileRange[1], yy = featureTileRange[3] > tileRange[3] ? tileRange[3] : featureTileRange[3]; y <= yy; y++) {
                    var tileKey = "" + [x, y];
                    var tileExtent = tiles[tileKey];
                    if (subTileCachedInstruct[tileKey] === undefined) {
                        subTileCachedInstruct[tileKey] = [];
                    }
                    subTileCachedInstruct[tileKey].push(instruct);
                }
            }
        }
        return [features, subTileCachedInstruct];
    };
    GeoMVTFormat.prototype.getCachedSource = function (tileCoord) {
        return this.sourceCache[tileCoord];
    };
    GeoMVTFormat.prototype.tryLoadTileFromCacheOrRegosterLoadEvent = function (tileCoord, originalZoom, cacheTileInfo) {
        var hasRequested = true;
        var tileCoordKey = tileCoord.join(",") + "," + originalZoom;
        if (this.lruCache.containsKey(tileCoordKey)) {
            var oTile = this.lruCache.get(tileCoordKey);
            this.cachedTileCallback(oTile, [cacheTileInfo]);
        }
        else {
            if (this.registeredLoadEvents[tileCoordKey] === undefined) {
                this.registeredLoadEvents[tileCoordKey] = [];
                hasRequested = false;
            }
            this.registeredLoadEvents[tileCoordKey].push(cacheTileInfo);
        }
        return hasRequested;
    };
    GeoMVTFormat.prototype.addSourceToCache = function (source, zoom, options) {
        if (this.sourceCache[options.tileCoord] === undefined) {
            this.sourceCache[options.tileCoord] = source;
        }
        var instructsTree = this.readFeaturesAndCreateInstructTrees(source, zoom, options);
        var instructs = this.getInstructs(instructsTree);
        var subTileInstructCaches = this.createSubTileInstructCaches(instructs, options);
        var sourceProject = this.readProjection(source);
        var tileCoordKey = options.tileCoord.join(",") + "," + zoom;
        var lastExtent = this.getLastExtent();
        var oTile = { subTileInstructCaches: subTileInstructCaches, sourceProject: sourceProject, lastExtent: lastExtent };
        this.lruCache.set(tileCoordKey, oTile);
        var cachedTileInfo = this.registeredLoadEvents[tileCoordKey];
        delete this.registeredLoadEvents[tileCoordKey];
        this.cachedTileCallback(oTile, cachedTileInfo);
    };
    GeoMVTFormat.prototype.readFeaturesAndCreateInstructTrees = function (source, zoom, options) {
        var pbf = new ol.ext.PBF((source));
        var pbfLayers = pbf.readFields(ol.format.MVT.pbfReaders_.layers, {});
        var features = [];
        var pbfLayer;
        var zoomMatchedGeoStylesGroupByLayerId = this.styleJsonCache.geoStyleGroupByZoom[zoom];
        if (!zoomMatchedGeoStylesGroupByLayerId) {
            return features;
        }
        var pbfLayerNamesWithGeoStyle = [];
        for (var pbfLayerName in zoomMatchedGeoStylesGroupByLayerId) {
            pbfLayerNamesWithGeoStyle.push(pbfLayerName);
        }
        var instructsCache = [];
        for (var name_2 in pbfLayers) {
            if (this.layers_ && this.layers_.indexOf(name_2) === -1) {
                continue;
            }
            if (pbfLayerNamesWithGeoStyle.indexOf(name_2) === -1) {
                continue;
            }
            pbfLayer = pbfLayers[name_2];
            options["extent"] = pbfLayer.extent;
            var cacheTrees = zoomMatchedGeoStylesGroupByLayerId[name_2];
            if (cacheTrees && cacheTrees.length > 0) {
                this.replaceFiltersToIndexOfPbfLayer(cacheTrees, pbfLayer);
                var _loop_3 = function (i) {
                    var rawFeature = ol.format.MVT.readRawFeature_(pbf, pbfLayer, i);
                    var feature = void 0;
                    var _loop_4 = function (j) {
                        var cacheTree = cacheTrees[j];
                        var treeIndex = cacheTree.treeIndex;
                        if (instructsCache[treeIndex] === undefined) {
                            instructsCache[treeIndex] = {
                                min: 10,
                                max: -10
                            };
                        }
                        var matchedNode;
                        var checkNodeMatched = function (node) {
                            var styleJsonCacheItem = node.data;
                            var matched = false;
                            if (styleJsonCacheItem.filterGroup.length > 0) {
                                for (var i_2 = 0; i_2 < styleJsonCacheItem.filterGroup.length; i_2++) {
                                    var filters = styleJsonCacheItem.filterGroup[i_2];
                                    var groupMatched = true;
                                    for (var j_2 = 0; j_2 < filters.length; j_2++) {
                                        var filter = filters[j_2];
                                        if (!filter.matchOLFeature(rawFeature, zoom)) {
                                            groupMatched = false;
                                            break;
                                        }
                                    }
                                    if (groupMatched) {
                                        matched = true;
                                        break;
                                    }
                                }
                            }
                            else {
                                matched = true;
                            }
                            return matched;
                        };
                        var selectNode = function (node) {
                            matchedNode = node.data;
                        };
                        cacheTree.traverseNode(checkNodeMatched, selectNode);
                        if (matchedNode) {
                            if (feature === undefined) {
                                feature = this_2.createFeature_(pbf, rawFeature);
                                if (this_2.minimalist) {
                                    feature.properties_ = {};
                                }
                            }
                            var zindex = void 0;
                            if (cacheTree.root.data.zIndex) {
                                zindex = rawFeature.properties[cacheTree.root.data.zIndex];
                                feature.properties_[cacheTree.root.data.zIndex] = zindex;
                            }
                            if (isNaN(zindex)) {
                                zindex = 0;
                            }
                            if (instructsCache[treeIndex][zindex] === undefined) {
                                instructsCache[treeIndex][zindex] = [];
                                if (zindex < instructsCache[treeIndex]["min"]) {
                                    instructsCache[treeIndex]["min"] = zindex;
                                }
                                if (zindex > instructsCache[treeIndex]["max"]) {
                                    instructsCache[treeIndex]["max"] = zindex;
                                }
                            }
                            instructsCache[treeIndex][zindex].push([feature, matchedNode]);
                            if (this_2.minimalist) {
                                if (matchedNode.geoStyle && (matchedNode.geoStyle.constructor.name === "GeoTextStyle" || matchedNode.geoStyle.constructor.name === "GeoShieldStyle")) {
                                    feature.properties_[matchedNode.geoStyle.name] = rawFeature.properties[matchedNode.geoStyle.name];
                                }
                                if (matchedNode.childrenGeoStyles && matchedNode.childrenGeoStyles.length > 0) {
                                    for (var i_3 = 0; i_3 < matchedNode.childrenGeoStyles.length; i_3++) {
                                        feature.properties_[matchedNode.childrenGeoStyles[i_3].name] = rawFeature.properties[matchedNode.childrenGeoStyles[i_3].name];
                                    }
                                }
                            }
                            feature.extent_ = undefined;
                        }
                    };
                    for (var j = 0; j < cacheTrees.length; j++) {
                        _loop_4(j);
                    }
                };
                var this_2 = this;
                for (var i = 0; i < pbfLayer.length; i++) {
                    _loop_3(i);
                }
            }
            this.extent_ = pbfLayer ? [0, 0, pbfLayer.extent, pbfLayer.extent] : null;
        }
        return instructsCache;
    };
    GeoMVTFormat.prototype.getInstructs = function (instructsTree) {
        var instructs = [];
        // the tress index means the index of SyleId.
        for (var i = 0; i < instructsTree.length; i++) {
            var instructsInOneTree = instructsTree[i];
            if (instructsInOneTree) {
                for (var j = instructsInOneTree.min, jj = instructsInOneTree.max; j <= jj; j++) {
                    var instructsInOneZIndex = instructsInOneTree[j];
                    if (instructsInOneZIndex) {
                        var childrenInstructs = [];
                        for (var h = 0; h < instructsInOneZIndex.length; h++) {
                            var instruct = instructsInOneZIndex[h];
                            instruct[0].styleId = instruct[0].styleId ? instruct[0].styleId : {};
                            if (instruct[1].geoStyle) {
                                instruct[0].styleId[instruct[1].geoStyle.id] = 0;
                                instructs.push([instruct[0], instruct[1].geoStyle, i]);
                            }
                            if (instruct[1].childrenGeoStyles) {
                                for (var k = 0; k < instruct[1].childrenGeoStyles.length; k++) {
                                    instruct[0].styleId[instruct[1].childrenGeoStyles[k].id] = 1;
                                    childrenInstructs.push([instruct[0], instruct[1].childrenGeoStyles[k], i]);
                                }
                            }
                        }
                        Array.prototype.push.apply(instructs, childrenInstructs);
                    }
                }
            }
        }
        return instructs;
    };
    GeoMVTFormat.prototype.createSubTileInstructCaches = function (instructs, options) {
        var subTileCachedInstruct = {};
        var offsetZ = options.originalCoord[0] - options.tileCoord[0];
        var tileSize = options.extent / Math.pow(2, offsetZ);
        var tileRange = this.getTileRange(options.tileCoord, options.originalCoord[0]);
        var tiles = {};
        for (var x = tileRange[0]; x <= tileRange[2]; x++) {
            var minX = (x - tileRange[0]) * tileSize;
            var maxX = (x - tileRange[0] + 1) * tileSize;
            for (var y = tileRange[3]; y >= tileRange[1]; y--) {
                var minY = (tileRange[3] - y) * tileSize;
                var maxY = (tileRange[3] - y + 1) * tileSize;
                tiles["" + [x, y]] = [minX, minY, maxX, maxY];
            }
        }
        for (var i = 0; i < instructs.length; i++) {
            var instruct = instructs[i];
            var featureExtent = instruct[0].getGeometry().getExtent();
            var featureTileRange = this.getFeatureTileRange(featureExtent, options.extent, tileSize, options.tileCoord, offsetZ);
            for (var x = tileRange[0] > featureTileRange[0] ? tileRange[0] : featureTileRange[0], xx = featureTileRange[2] > tileRange[2] ? tileRange[2] : featureTileRange[2]; x <= xx; x++) {
                for (var y = tileRange[1] > featureTileRange[1] ? tileRange[1] : featureTileRange[1], yy = featureTileRange[3] > tileRange[3] ? tileRange[3] : featureTileRange[3]; y <= yy; y++) {
                    var tileKey = "" + [x, y];
                    var tileExtent = tiles[tileKey];
                    if (subTileCachedInstruct[tileKey] === undefined) {
                        subTileCachedInstruct[tileKey] = [];
                    }
                    subTileCachedInstruct[tileKey].push(instruct);
                }
            }
        }
        return subTileCachedInstruct;
    };
    GeoMVTFormat.prototype.cachedTileCallback = function (oTile, cacheTileInfos) {
        for (var i = 0; i < cacheTileInfos.length; i++) {
            var cacheTileInfo = cacheTileInfos[i];
            var tileKey = "" + cacheTileInfo.tile.tileCoord[1] + "," + cacheTileInfo.tile.tileCoord[2];
            cacheTileInfo.callback(cacheTileInfo.tile, cacheTileInfo.successFunction, [], oTile.subTileInstructCaches[tileKey], oTile.sourceProject, oTile.lastExtent);
        }
    };
    GeoMVTFormat.prototype.getTileRange = function (tileCoord, zoom) {
        var x = tileCoord[1];
        var y = tileCoord[2];
        var minX = x;
        var maxX = x;
        var minY = y;
        var maxY = y;
        for (var i = tileCoord[0]; i < zoom; i++) {
            minX = minX * 2;
            maxX = maxX * 2 + 1;
            minY = minY * 2;
            maxY = maxY * 2 + 1;
        }
        return [minX, minY, maxX, maxY];
    };
    GeoMVTFormat.prototype.getFeatureTileRange = function (featureExtent, extent, tileSize, requestTileCoord, offsetZ) {
        var minX = requestTileCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[0] / tileSize);
        var maxX = requestTileCoord[1] * Math.pow(2, offsetZ) + Math.floor(featureExtent[2] / tileSize);
        var minY = requestTileCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[3]) / tileSize);
        var maxY = requestTileCoord[2] * Math.pow(2, offsetZ) + Math.floor((extent - featureExtent[1]) / tileSize);
        return [minX, minY, maxX, maxY];
    };
    GeoMVTFormat.prototype.getExtent = function (originalCoord, tilecoord, extent) {
        var ox = originalCoord[1];
        var x = tilecoord[1];
        var xPath = [];
        while (ox !== x) {
            var remainder = ox % 2;
            xPath.push(remainder);
            ox = Math.floor(ox / 2);
        }
        var newExtent = extent;
        var offsetX = 0;
        for (var i = xPath.length - 1; i >= 0; i--) {
            newExtent = newExtent / 2;
            if (xPath[i] === 1) {
                offsetX += newExtent;
            }
        }
        var oy = originalCoord[2];
        var y = tilecoord[2];
        var yPath = [];
        while (oy !== y) {
            var remainder = oy % 2;
            yPath.push(remainder);
            oy = Math.floor(oy / 2);
        }
        newExtent = extent;
        var offsetY = 0;
        for (var i = yPath.length - 1; i >= 0; i--) {
            newExtent = newExtent / 2;
            if (yPath[i] === 0) {
                offsetY += newExtent;
            }
        }
        // TODO: add the buffer
        return [offsetX, offsetY, offsetX + newExtent, offsetY + newExtent];
    };
    GeoMVTFormat.prototype.replaceFiltersToIndexOfPbfLayer = function (cacheTrees, pbfLayer) {
        for (var i = 0, ii = cacheTrees.length; i < ii; i++) {
            var cacheTree = cacheTrees[i];
            this.replaceCacheItemFiltersToIndexOfPbfLayer(cacheTree.root, pbfLayer);
        }
    };
    GeoMVTFormat.prototype.replaceCacheItemFiltersToIndexOfPbfLayer = function (node, pbfLayer) {
        var data = node.data;
        for (var i = 0; i < data.filterGroup.length; i++) {
            var filters = data.filterGroup[i];
            var geoFilter = void 0;
            for (var j = 0; j < filters.length; j++) {
                geoFilter = filters[j];
                geoFilter.replaceVaulesToPbfIndex(pbfLayer);
            }
        }
        if (node.children) {
            for (var i = 0, ii = node.children.length; i < ii; i++) {
                this.replaceCacheItemFiltersToIndexOfPbfLayer(node.children[i], pbfLayer);
            }
        }
    };
    GeoMVTFormat.prototype.readFeaturesAndCreateInstructs = function (source, zoom, options) {
        var pbf = new ol.ext.PBF((source));
        var pbfLayers = pbf.readFields(ol.format.MVT.pbfReaders_.layers, {});
        var features = [];
        var pbfLayer;
        var zoomMatchedGeoStylesGroupByLayerId = this.styleJsonCache.geoStyleGroupByZoom[zoom];
        if (!zoomMatchedGeoStylesGroupByLayerId) {
            return features;
        }
        var pbfLayerNamesWithGeoStyle = [];
        for (var pbfLayerName in zoomMatchedGeoStylesGroupByLayerId) {
            pbfLayerNamesWithGeoStyle.push(pbfLayerName);
        }
        var instructsCache = [];
        for (var name_3 in pbfLayers) {
            if (this.layers_ && this.layers_.indexOf(name_3) === -1) {
                continue;
            }
            if (pbfLayerNamesWithGeoStyle.indexOf(name_3) === -1) {
                continue;
            }
            pbfLayer = pbfLayers[name_3];
            var cacheTrees = zoomMatchedGeoStylesGroupByLayerId[name_3];
            if (cacheTrees && cacheTrees.length > 0) {
                this.replaceFiltersToIndexOfPbfLayer(cacheTrees, pbfLayer);
                var _loop_5 = function (i) {
                    var rawFeature = ol.format.MVT.readRawFeature_(pbf, pbfLayer, i);
                    var feature = void 0;
                    var _loop_6 = function (j) {
                        var cacheTree = cacheTrees[j];
                        var treeIndex = cacheTree.treeIndex;
                        if (instructsCache[treeIndex] === undefined) {
                            instructsCache[treeIndex] = {
                                min: 10,
                                max: -10
                            };
                        }
                        var matchedNode;
                        var checkNodeMatched = function (node) {
                            var styleJsonCacheItem = node.data;
                            var matched = false;
                            if (styleJsonCacheItem.filterGroup.length > 0) {
                                for (var i_4 = 0; i_4 < styleJsonCacheItem.filterGroup.length; i_4++) {
                                    var filters = styleJsonCacheItem.filterGroup[i_4];
                                    var groupMatched = true;
                                    for (var j_3 = 0; j_3 < filters.length; j_3++) {
                                        var filter = filters[j_3];
                                        if (!filter.matchOLFeature(rawFeature, zoom)) {
                                            groupMatched = false;
                                            break;
                                        }
                                    }
                                    if (groupMatched) {
                                        matched = true;
                                        break;
                                    }
                                }
                            }
                            else {
                                matched = true;
                            }
                            return matched;
                        };
                        var selectNode = function (node) {
                            matchedNode = node.data;
                        };
                        cacheTree.traverseNode(checkNodeMatched, selectNode);
                        if (matchedNode) {
                            if (feature === undefined) {
                                feature = this_3.createFeature_(pbf, rawFeature);
                                if (this_3.minimalist) {
                                    feature.properties_ = {};
                                }
                            }
                            var zindex = void 0;
                            if (cacheTree.root.data.zIndex) {
                                zindex = rawFeature.properties[cacheTree.root.data.zIndex];
                                feature.properties_[cacheTree.root.data.zIndex] = zindex;
                            }
                            if (isNaN(zindex)) {
                                zindex = 0;
                            }
                            if (instructsCache[treeIndex][zindex] === undefined) {
                                instructsCache[treeIndex][zindex] = [];
                                if (zindex < instructsCache[treeIndex]["min"]) {
                                    instructsCache[treeIndex]["min"] = zindex;
                                }
                                if (zindex > instructsCache[treeIndex]["max"]) {
                                    instructsCache[treeIndex]["max"] = zindex;
                                }
                            }
                            instructsCache[treeIndex][zindex].push([feature, matchedNode]);
                            if (this_3.minimalist) {
                                if (matchedNode.geoStyle && matchedNode.geoStyle.constructor.name === "GeoTextStyle") {
                                    feature.properties_[matchedNode.geoStyle.name] = rawFeature.properties[matchedNode.geoStyle.name];
                                }
                                if (matchedNode.childrenGeoStyles && matchedNode.childrenGeoStyles.length > 0) {
                                    for (var i_5 = 0; i_5 < matchedNode.childrenGeoStyles.length; i_5++) {
                                        feature.properties_[matchedNode.childrenGeoStyles[i_5].name] = rawFeature.properties[matchedNode.childrenGeoStyles[i_5].name];
                                    }
                                }
                            }
                            feature.extent_ = undefined;
                        }
                    };
                    for (var j = 0; j < cacheTrees.length; j++) {
                        _loop_6(j);
                    }
                };
                var this_3 = this;
                for (var i = 0; i < pbfLayer.length; i++) {
                    _loop_5(i);
                }
            }
            this.extent_ = pbfLayer ? [0, 0, pbfLayer.extent, pbfLayer.extent] : null;
        }
        var instructs = [];
        // the tress index means the index of SyleId.
        for (var i = 0; i < instructsCache.length; i++) {
            var instructsInOneTree = instructsCache[i];
            if (instructsInOneTree) {
                for (var j = instructsInOneTree.min, jj = instructsInOneTree.max; j <= jj; j++) {
                    var instructsInOneZIndex = instructsInOneTree[j];
                    if (instructsInOneZIndex) {
                        var childrenInstructs = [];
                        for (var h = 0; h < instructsInOneZIndex.length; h++) {
                            var instruct = instructsInOneZIndex[h];
                            instruct[0].styleId = instruct[0].styleId ? instruct[0].styleId : {};
                            if (instruct[1].geoStyle) {
                                instruct[0].styleId[instruct[1].geoStyle.id] = 0;
                                instructs.push([instruct[0], instruct[1].geoStyle, i]);
                            }
                            if (instruct[1].childrenGeoStyles) {
                                for (var k = 0; k < instruct[1].childrenGeoStyles.length; k++) {
                                    instruct[0].styleId[instruct[1].childrenGeoStyles[k].id] = 1;
                                    childrenInstructs.push([instruct[0], instruct[1].childrenGeoStyles[k], i]);
                                }
                            }
                        }
                        Array.prototype.push.apply(instructs, childrenInstructs);
                    }
                }
            }
        }
        return [features, instructs];
    };
    GeoMVTFormat.readRawFeature_ = function (pbf, layer, i) {
        pbf.pos = layer.features[i];
        var end = pbf.readVarint() + pbf.pos;
        var feature = {
            layer: layer,
            type: 0,
            properties: {},
            propertiesIndex: {}
        };
        pbf.readFields(ol.format.MVT.pbfReaders_.featureColumnValue, feature, end);
        return feature;
    };
    GeoMVTFormat.featureColumnValue = function (tag, feature, pbf) {
        if (tag === 1) {
            feature.id = pbf.readVarint();
        }
        else if (tag === 2) {
            var end = pbf.readVarint() + pbf.pos;
            while (pbf.pos < end) {
                var key = pbf.readVarint();
                var value = pbf.readVarint();
                feature.propertiesIndex[key] = value;
                key = feature.layer.keys[key];
                value = feature.layer.values[value];
                feature.properties[key] = value;
            }
        }
        else if (tag === 3) {
            feature.type = pbf.readVarint();
        }
        else if (tag === 4) {
            feature.geometry = pbf.pos;
        }
    };
    return GeoMVTFormat;
}(ol.format.MVT));

ol.format.MVT.readRawFeature_ = GeoMVTFormat.readRawFeature_;
ol.format.MVT.pbfReaders_["featureColumnValue"] = GeoMVTFormat.featureColumnValue;


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return StyleJsonCache; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__style_geoTextStyle__ = __webpack_require__(5);

var StyleJsonCache = /** @class */ (function () {
    function StyleJsonCache() {
        this.geoStyleGroupByZoom = [];
        this.styleJson = {};
        this.geoStyles = {};
        this.geoTextStyleInfo = {};
    }
    StyleJsonCache.prototype.add = function (zoom, dataLayerName, tree) {
        if (this.geoStyleGroupByZoom[zoom] === undefined) {
            this.geoStyleGroupByZoom[zoom] = {};
        }
        if (this.geoStyleGroupByZoom[zoom] === undefined) {
            this.geoStyleGroupByZoom[zoom] = {};
        }
        if (this.geoStyleGroupByZoom[zoom][dataLayerName] === undefined) {
            this.geoStyleGroupByZoom[zoom][dataLayerName] = [];
        }
        this.geoStyleGroupByZoom[zoom][dataLayerName].push(tree);
        this.readGeoStyleFromTree(tree);
    };
    StyleJsonCache.prototype.readGeoStyleFromTree = function (tree) {
        return this.readGeoStyleFromTreeNode(tree.root);
    };
    StyleJsonCache.prototype.readGeoStyleFromTreeNode = function (node) {
        var result = [];
        if (node.data.geoStyle) {
            this.geoStyles[node.data.geoStyle.id] = node.data.geoStyle;
            // get the widths of GeoTextStyle
            if (node.data.geoStyle instanceof __WEBPACK_IMPORTED_MODULE_0__style_geoTextStyle__["a" /* GeoTextStyle */]) {
                this.geoTextStyleInfo[node.data.geoStyle.id] = node.data.geoStyle.charWidths;
            }
        }
        if (node.data.childrenGeoStyles && node.data.childrenGeoStyles.length > 0) {
            for (var i = 0; i < node.data.childrenGeoStyles.length; i++) {
                this.geoStyles[node.data.childrenGeoStyles[i].id] = node.data.childrenGeoStyles[i];
                if (node.data.childrenGeoStyles[i] instanceof __WEBPACK_IMPORTED_MODULE_0__style_geoTextStyle__["a" /* GeoTextStyle */]) {
                    this.geoTextStyleInfo[node.data.childrenGeoStyles[i].id] = node.data.childrenGeoStyles[i];
                }
            }
        }
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                this.readGeoStyleFromTreeNode(node.children[i]);
            }
        }
        return result;
    };
    StyleJsonCache.prototype.clear = function () {
        this.geoStyleGroupByZoom.length = 0;
    };
    return StyleJsonCache;
}());



/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoStyleProperty; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__filter_geoFilterItem__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__filter_geoZoomFilter__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__filter_geoStringAttributeFilter__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__filter_geoRegexFilter__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__filter_geoNumberAttributeFilter__ = __webpack_require__(11);





var GeoStyleProperty = /** @class */ (function () {
    function GeoStyleProperty(styleJsonValue, defaultValue) {
        this.styleJsonValue = styleJsonValue;
        this.defaultValue = defaultValue;
    }
    GeoStyleProperty.prototype.initialize = function () {
        if (this.styleJsonValue !== undefined) {
            if (typeof this.styleJsonValue === "object") {
                this.conditions = [];
                this.values = [];
                for (var name_1 in this.styleJsonValue) {
                    var filters = this.createFilter(name_1);
                    this.conditions.push(filters);
                    this.values.push(this.initializeValue(this.styleJsonValue[name_1]));
                }
            }
        }
        this.value = this.initializeValue(this.defaultValue);
    };
    GeoStyleProperty.prototype.initializeValue = function (value) {
        return value;
    };
    GeoStyleProperty.prototype.isCondition = function () {
        return this.conditions && this.conditions.length > 0;
    };
    GeoStyleProperty.prototype.getValue = function (columnValue) {
        if (this.conditions && this.conditions.length > 0) {
            if (columnValue) {
                var i = 0;
                var matched = false;
                for (i = 0; i < this.conditions.length; i++) {
                    var filterGroup = this.conditions[i];
                    for (var j = 0; j < filterGroup.length; j++) {
                        var filters = filterGroup[j];
                        var groupMatched = true;
                        for (var k = 0; k < filters.length; k++) {
                            var filter = filters[k];
                            var rawFeature = { properties: columnValue };
                            if (!filter.matchOLFeature(rawFeature, 0)) {
                                groupMatched = false;
                                break;
                            }
                        }
                        if (groupMatched) {
                            matched = true;
                            break;
                        }
                    }
                    if (matched) {
                        break;
                    }
                }
                if (matched) {
                    return this.values[i];
                }
            }
            else {
                return this.value;
            }
        }
        else {
            return this.value;
        }
    };
    GeoStyleProperty.prototype.createFilter = function (filterString) {
        var filterGroup = [];
        if (filterString) {
            var filterStrings = filterString.split("|");
            for (var i = 0; i < filterStrings.length; i++) {
                var filterStr = filterStrings[i];
                var expression = "(\\w+?=~'.+?')|(\\w+?[<>!=]*'[^;]+?')|(\\w+?[<>!=]*[^;]+)";
                var regex = new RegExp(expression, "g");
                var results = filterStr.match(regex);
                var rangeFilters = {};
                var filters = [];
                var geoZoomFilter = void 0;
                for (var i_1 = 0; i_1 < results.length; i_1++) {
                    if (results[i_1]) {
                        var filterItem = __WEBPACK_IMPORTED_MODULE_0__filter_geoFilterItem__["a" /* GeoFilterItem */].createFilterItem(results[i_1]);
                        if (filterItem.value.indexOf("~'") === 0) {
                            filters.push(new __WEBPACK_IMPORTED_MODULE_3__filter_geoRegexFilter__["a" /* GeoRegexFilter */]([filterItem]));
                        }
                        else if (filterItem.key === "zoom") {
                            if (geoZoomFilter === undefined) {
                                geoZoomFilter = new __WEBPACK_IMPORTED_MODULE_1__filter_geoZoomFilter__["a" /* GeoZoomFilter */]([]);
                            }
                            geoZoomFilter.addFilterItem(filterItem);
                        }
                        else if (filterItem.value.includes("'")) {
                            filters.push(new __WEBPACK_IMPORTED_MODULE_2__filter_geoStringAttributeFilter__["a" /* GeoStringAttributeFilter */]([filterItem]));
                        }
                        else {
                            rangeFilters[filterItem.key] = rangeFilters[filterItem.key] || new __WEBPACK_IMPORTED_MODULE_4__filter_geoNumberAttributeFilter__["a" /* GeoNumberAttributeFilter */]([]);
                            rangeFilters[filterItem.key].addFilterItem(filterItem);
                        }
                    }
                }
                for (var name_2 in rangeFilters) {
                    filters.push(rangeFilters[name_2]);
                }
                filterGroup.push(filters);
            }
        }
        return filterGroup;
    };
    return GeoStyleProperty;
}());



/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return StyleJsonCacheItem; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__filter_geoFilterItem__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__filter_geoZoomFilter__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__filter_geoStringAttributeFilter__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__filter_geoRegexFilter__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__filter_geoNumberAttributeFilter__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__style_geoAreaStyle__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__style_geoLineStyle__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__style_geoPointStyle__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__style_geoTextStyle__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__style_geoShieldStyle__ = __webpack_require__(24);










var StyleJsonCacheItem = /** @class */ (function () {
    function StyleJsonCacheItem(styleJson, minZoom, maxZoom, dataLayerColumnName) {
        this.childrenGeoStyles = [];
        this.subStyleCacheItems = [];
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.zIndex = styleJson["z-index"];
        this.styleFirst = styleJson["style-first"];
        this.filterGroup = this.createFilters(styleJson.filter, dataLayerColumnName) || [];
        this.createSubItems(styleJson, dataLayerColumnName);
        this.geoStyle = this.createGeoStyle(styleJson);
        this.createChildrenGeoStyle(styleJson);
    }
    StyleJsonCacheItem.prototype.createFilters = function (filterString, dataLayerColumnName) {
        var filterGroup = [];
        var tempMinZoom = this.maxZoom;
        var tempMaxZoom = this.minZoom;
        if (filterString) {
            var filterStrings = filterString.split("|");
            for (var i = 0; i < filterStrings.length; i++) {
                var filterStr = filterStrings[i];
                var expression = "(\\w+?=~'.+?')|(\\w+?[<>!=]*'[^;]+?')|(\\w+?[<>!=]*[^;]+)";
                var regex = new RegExp(expression, "g");
                var results = filterStr.match(regex);
                var rangeFilters = {};
                var filters = [];
                var geoZoomFilter = void 0;
                var dataLayerNameFilter = void 0;
                for (var i_1 = 0; i_1 < results.length; i_1++) {
                    if (results[i_1]) {
                        var filterItem = __WEBPACK_IMPORTED_MODULE_0__filter_geoFilterItem__["a" /* GeoFilterItem */].createFilterItem(results[i_1]);
                        if (filterItem.value.indexOf("~'") === 0) {
                            filters.push(new __WEBPACK_IMPORTED_MODULE_3__filter_geoRegexFilter__["a" /* GeoRegexFilter */]([filterItem]));
                        }
                        else if (filterItem.key === "zoom") {
                            if (geoZoomFilter === undefined) {
                                geoZoomFilter = new __WEBPACK_IMPORTED_MODULE_1__filter_geoZoomFilter__["a" /* GeoZoomFilter */]([]);
                            }
                            geoZoomFilter.addFilterItem(filterItem);
                        }
                        else if (filterItem.value.includes("'")) {
                            if (filterItem.key === dataLayerColumnName) {
                                if (dataLayerNameFilter === undefined) {
                                    dataLayerNameFilter = new __WEBPACK_IMPORTED_MODULE_2__filter_geoStringAttributeFilter__["a" /* GeoStringAttributeFilter */]([filterItem]);
                                }
                            }
                            else {
                                filters.push(new __WEBPACK_IMPORTED_MODULE_2__filter_geoStringAttributeFilter__["a" /* GeoStringAttributeFilter */]([filterItem]));
                            }
                        }
                        else {
                            rangeFilters[filterItem.key] = rangeFilters[filterItem.key] || new __WEBPACK_IMPORTED_MODULE_4__filter_geoNumberAttributeFilter__["a" /* GeoNumberAttributeFilter */]([]);
                            rangeFilters[filterItem.key].addFilterItem(filterItem);
                        }
                    }
                }
                // update the minZoom and maxZoom by ZoomFilter
                if (geoZoomFilter) {
                    filters.push(geoZoomFilter);
                    geoZoomFilter.initialize();
                    if (geoZoomFilter.ranges.length > 0) {
                        var minZ = +geoZoomFilter.ranges[0][0];
                        var maxZ = +geoZoomFilter.ranges[0][1];
                        if (minZ <= tempMinZoom) {
                            tempMinZoom = minZ;
                        }
                        if (maxZ >= tempMaxZoom) {
                            tempMaxZoom = maxZ;
                        }
                    }
                    else {
                        var z = +geoZoomFilter.allowedValues[0];
                        if (z <= tempMinZoom) {
                            tempMinZoom = z;
                        }
                        if (z >= tempMaxZoom) {
                            tempMaxZoom = z;
                        }
                    }
                }
                // update the dataLayerName
                if (dataLayerNameFilter) {
                    dataLayerNameFilter.initialize();
                    this.dataLayerName = dataLayerNameFilter.expectedValues[0];
                }
                for (var name_1 in rangeFilters) {
                    filters.push(rangeFilters[name_1]);
                }
                filterGroup.push(filters);
            }
        }
        if (tempMaxZoom !== this.minZoom || tempMinZoom !== this.maxZoom) {
            this.maxZoom = tempMaxZoom;
            this.minZoom = tempMinZoom;
        }
        return filterGroup;
    };
    StyleJsonCacheItem.prototype.createSubItems = function (styleJson, dataLayerColumnName) {
        if (styleJson.style) {
            // apply the property to sub style.
            for (var key in styleJson) {
                if (key !== "style" && key !== "filter") {
                    for (var i = 0; i < styleJson.style.length; i++) {
                        // Apply the property to sub style if the sub style does not included.
                        if (styleJson.style[i][key] === undefined) {
                            if (key === "id") {
                                styleJson.style[i][key] = styleJson[key] + "#" + i;
                            }
                            else {
                                styleJson.style[i][key] = styleJson[key];
                            }
                        }
                    }
                }
            }
            var subItemMinZoom = void 0;
            var subItemMaxZoom = void 0;
            for (var _i = 0, _a = styleJson.style; _i < _a.length; _i++) {
                var subStyle = _a[_i];
                var styleJsonCacheSubItem = new StyleJsonCacheItem(subStyle, this.minZoom, this.maxZoom, dataLayerColumnName);
                if (subItemMaxZoom === undefined || styleJsonCacheSubItem.maxZoom > subItemMaxZoom) {
                    subItemMaxZoom = styleJsonCacheSubItem.maxZoom;
                }
                if (subItemMinZoom === undefined || styleJsonCacheSubItem.minZoom < subItemMinZoom) {
                    subItemMinZoom = styleJsonCacheSubItem.minZoom;
                }
                this.subStyleCacheItems.push(styleJsonCacheSubItem);
            }
            if (subItemMinZoom && subItemMinZoom > this.minZoom) {
                this.minZoom = subItemMinZoom;
            }
            if (subItemMaxZoom && subItemMaxZoom < this.maxZoom) {
                this.maxZoom = subItemMaxZoom;
            }
        }
    };
    StyleJsonCacheItem.prototype.createGeoStyle = function (styleJson) {
        var geoStyle;
        for (var key in styleJson) {
            if (key !== "style" && key !== "filter") {
                var keys = key.split("-");
                if (keys.length > 1) {
                    switch (keys[0]) {
                        case "polygon":
                            geoStyle = new __WEBPACK_IMPORTED_MODULE_5__style_geoAreaStyle__["a" /* GeoAreaStyle */](styleJson);
                            break;
                        case "line":
                            geoStyle = new __WEBPACK_IMPORTED_MODULE_6__style_geoLineStyle__["a" /* GeoLineStyle */](styleJson);
                            break;
                        case "text":
                            geoStyle = new __WEBPACK_IMPORTED_MODULE_8__style_geoTextStyle__["a" /* GeoTextStyle */](styleJson);
                            break;
                        case "point":
                            geoStyle = new __WEBPACK_IMPORTED_MODULE_7__style_geoPointStyle__["a" /* GeoPointStyle */](styleJson);
                            break;
                        case "shield":
                            geoStyle = new __WEBPACK_IMPORTED_MODULE_9__style_geoShieldStyle__["a" /* GeoShieldStyle */](styleJson);
                            break;
                        default:
                            break;
                    }
                    break;
                }
            }
        }
        return geoStyle;
    };
    StyleJsonCacheItem.prototype.createChildrenGeoStyle = function (styleJson) {
        if (styleJson["children"]) {
            for (var i = 0; i < styleJson["children"].length; i++) {
                var childrenGeoStyleJson = styleJson["children"][i];
                if (childrenGeoStyleJson["id"] === undefined) {
                    childrenGeoStyleJson["id"] = styleJson["id"] + "#c" + i;
                }
                this.childrenGeoStyles.push(this.createGeoStyle(childrenGeoStyleJson));
            }
        }
    };
    return StyleJsonCacheItem;
}());



/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoAreaStyle; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoStyle__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__style_geoBrush__ = __webpack_require__(21);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var GeoAreaStyle = /** @class */ (function (_super) {
    __extends(GeoAreaStyle, _super);
    function GeoAreaStyle(styleJson) {
        var _this = _super.call(this, styleJson) || this;
        if (styleJson) {
            _this.brushType = styleJson["polygon-brush-type"];
            _this.rotateAngle = styleJson["polygon-rotate-angle"];
            _this.dx = styleJson["polygon-dx"];
            _this.dy = styleJson["polygon-dy"];
            _this.fill = styleJson["polygon-fill"];
            _this.foregroundFill = styleJson["polygon-foreground-fill"];
            _this.gamma = styleJson["polygon-gamma"] ? styleJson["polygon-gamma"] : true;
            _this.geometryTransform = styleJson["polygon-geometry-transform"];
            _this.hatchStyle = styleJson["polygon-hatch-style"];
            _this.opacity = styleJson["polygon-opacity"];
            _this.outlineColor = styleJson["polygon-outline-color"];
            _this.outlineDashArray = styleJson["polygon-outline-dasharray"];
            _this.outlineOpacity = styleJson["polygon-outline-opacity"];
            _this.outlineWidth = styleJson["polygon-outline-width"];
            _this.linearGradient = styleJson["polygon-linear-gradient"];
            _this.radialGradient = styleJson["polygon-radial-gradient"];
            _this.textureFile = styleJson["polygon-texture-file"];
            _this.shadowColor = styleJson["polygon-shadow-color"];
            _this.shadowDx = styleJson["polygon-shadow-dx"];
            _this.shadowDy = styleJson["polygon-shadow-dy"];
        }
        return _this;
    }
    GeoAreaStyle.prototype.initializeCore = function () {
        this.brushType = this.brushType || "solid";
        this.brushOptions = {
            fillColor: this.fill,
            fillOpacity: this.opacity,
            linearGradient: this.linearGradient,
            radialGradient: this.radialGradient,
            textureFile: this.textureFile,
            foregroundFill: this.foregroundFill,
            hatchStyle: this.hatchStyle
        };
        if (this.geometryTransform) {
            this.geometryTransformValue = this.getTransformValues(this.geometryTransform);
        }
        if (this.brushType === "solid" || this.brushType === "hatch") {
            this.geoBrush = __WEBPACK_IMPORTED_MODULE_1__style_geoBrush__["a" /* GeoBrush */].createBrushByType(this.brushType, null, null, this.brushOptions);
        }
        if (this.outlineColor) {
            this.convertedOutlineColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.outlineColor, this.outlineOpacity);
        }
        if (this.outlineDashArray) {
            this.convertedOutlineDashArray = this.outlineDashArray.split(",");
        }
        if (this.shadowColor) {
            this.convertedShadowColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.shadowColor);
        }
        this.shadowTranslateValueByResolution = {};
    };
    GeoAreaStyle.prototype.getTransformValues = function (transform) {
        // get transform values which look like transform(value1, value2)
        var start = transform.indexOf("(");
        var end = transform.indexOf(")");
        var valueString = transform.substring(start + 1, end);
        var values = [];
        if (valueString.includes(",")) {
            values = valueString.split(",");
        }
        else {
            values.push(valueString);
        }
        return values;
    };
    GeoAreaStyle.prototype.GetTransformedCoordinates = function (feature) {
        var tmpFlatCoordinates = feature.getFlatCoordinates();
        var tmpCoordinates = [[]];
        var index = 0;
        for (var i = 0; i < tmpFlatCoordinates.length; i += 2) {
            tmpCoordinates[index] || (tmpCoordinates[index] = []);
            tmpCoordinates[index].push([tmpFlatCoordinates[i], tmpFlatCoordinates[i + 1]]);
            if (tmpCoordinates[index].length > 3 && tmpCoordinates[index][0][0] === tmpFlatCoordinates[i] && tmpCoordinates[index][0][1] === tmpFlatCoordinates[i + 1]) {
                index++;
            }
        }
        var geometry = new ol.geom.Polygon(tmpCoordinates, "XY");
        if (this.geometryTransform.indexOf("translate") === 0) {
            geometry.translate(+this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
        }
        else if (this.geometryTransform.indexOf("scale") === 0) {
            geometry.scale(+this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
        }
        else if (this.geometryTransform.indexOf("rotate") === 0) {
            var center = ol.extent.getCenter(geometry.getExtent());
            var angle = +this.geometryTransformValue[0].trim() * Math.PI / 180;
            geometry.rotate(angle, center);
        }
        else if (this.geometryTransform.indexOf("skew") === 0) {
            this.skewGeometry(geometry, +this.geometryTransformValue[0].trim(), +this.geometryTransformValue[1].trim());
        }
        return geometry.flatCoordinates;
    };
    GeoAreaStyle.prototype.getConvertedStyleCore = function (feature, resolution, options) {
        var length = 0;
        this.styles = [];
        if (this.fill || (this.outlineColor && this.outlineWidth) || this.linearGradient || this.radialGradient) {
            if (this.geometryTransform) {
                feature.flatCoordinates_ = this.GetTransformedCoordinates(feature);
            }
            if (this.shadowDx || this.shadowDy) {
                var shadowTranslateValue = this.shadowTranslateValueByResolution[resolution];
                if (shadowTranslateValue === undefined) {
                    var tmpResolution = Math.round(resolution * 100000000) / 100000000;
                    this.shadowTranslate = ("translate(" + (this.shadowDx ? this.shadowDx : 0) * tmpResolution + "," + (this.shadowDy ? this.shadowDy : 0) * tmpResolution + ")");
                    shadowTranslateValue = this.getTransformValues(this.shadowTranslate);
                    this.shadowTranslateValueByResolution[resolution] = shadowTranslateValue;
                }
                var tmpFlatCoordinates = feature.getFlatCoordinates();
                var newFlatCoordinates = ol.geom.flat.transform.translate(tmpFlatCoordinates, 0, tmpFlatCoordinates.length, 2, +shadowTranslateValue[0].trim(), +shadowTranslateValue[1].trim(), undefined);
                var tmpCoordinates = [[]];
                var index = 0;
                for (var i = 0; i < newFlatCoordinates.length; i += 2) {
                    tmpCoordinates[index] || (tmpCoordinates[index] = []);
                    tmpCoordinates[index].push([newFlatCoordinates[i], newFlatCoordinates[i + 1]]);
                    if (tmpCoordinates[index].length > 3 && tmpCoordinates[index][0][0] === newFlatCoordinates[i] && tmpCoordinates[index][0][1] === newFlatCoordinates[i + 1]) {
                        index++;
                    }
                }
                var geometry = new ol.geom.Polygon(tmpCoordinates, "XY");
                GeoAreaStyle.areaShadowStyle.getFill().setColor(this.convertedShadowColor);
                GeoAreaStyle.areaShadowStyle.setGeometry(geometry);
                this.styles[length++] = GeoAreaStyle.areaShadowStyle;
            }
            if (this.fill) {
                this.geoBrush = __WEBPACK_IMPORTED_MODULE_1__style_geoBrush__["a" /* GeoBrush */].createBrushByType(this.brushType, feature, resolution, this.brushOptions);
                GeoAreaStyle.areaStyle.getFill().setColor(this.geoBrush);
            }
            // stroke to handle outlineColor, outlineDashArray, outlineOpacity and outlineWidth
            if (this.outlineColor || this.outlineDashArray || this.outlineWidth) {
                var newStroke = new ol.style.Stroke();
                newStroke.setColor(this.convertedOutlineColor);
                newStroke.setLineDash(this.convertedOutlineDashArray);
                newStroke.setWidth(this.outlineWidth);
                GeoAreaStyle.areaStyle.setStroke(newStroke);
            }
            else {
                GeoAreaStyle.areaStyle.setStroke(undefined);
            }
            GeoAreaStyle.areaStyle.setGeometry(feature);
            this.styles[length++] = GeoAreaStyle.areaStyle;
            if (this.gamma !== undefined && options.layer) {
                var styleGamma_1 = this.gamma;
                options.layer.on("precompose", function (evt) {
                    evt.context.imageSmoothingEnabled = styleGamma_1;
                    evt.context.webkitImageSmoothingEnabled = styleGamma_1;
                    evt.context.mozImageSmoothingEnabled = styleGamma_1;
                    evt.context.msImageSmoothingEnabled = styleGamma_1;
                });
            }
        }
        return this.styles;
    };
    GeoAreaStyle.areaStyle = new ol.style.Style({
        fill: new ol.style.Fill({}),
        stroke: new ol.style.Stroke({})
    });
    GeoAreaStyle.areaShadowStyle = new ol.style.Style({
        fill: new ol.style.Fill({}),
    });
    return GeoAreaStyle;
}(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */]));



/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoBrush; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoStyle__ = __webpack_require__(0);

var GeoBrush = /** @class */ (function () {
    function GeoBrush() {
    }
    GeoBrush.createBrushByType = function (brushType, feature, resolution, brushTypeOptions) {
        var geoBrushFunction = this.geoBrushFunctions[brushType];
        if (typeof geoBrushFunction === "function") {
            return geoBrushFunction(feature, resolution, brushTypeOptions);
        }
        else {
            return null;
        }
    };
    GeoBrush.registerGeoBrushFunction = function (key, geoBrushFunction) {
        this.geoBrushFunctions[key] = geoBrushFunction;
    };
    GeoBrush.createGeoSolidBrush = function (feature, resolution, geoBrushOptions) {
        if (geoBrushOptions.fillColor) {
            return __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(geoBrushOptions.fillColor, geoBrushOptions.fillOpacity);
        }
    };
    GeoBrush.createRadialGradientColor = function (feature, resolution, geoBrushOptions) {
        var extent = feature.getExtent();
        // TODO: try to create it when creating the GeoStyle.
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        // TODO: check if there is a difference by srid.
        var width = ol.extent.getWidth(extent) / resolution * ol.has.DEVICE_PIXEL_RATIO;
        var height = ol.extent.getHeight(extent) / resolution * ol.has.DEVICE_PIXEL_RATIO;
        // TODO: the (x0,y0) is the center of feature extent, optimize it
        var x0 = width / 2;
        var y0 = height / 2;
        var r1 = x0;
        var grd = context.createRadialGradient(x0, y0, 0, x0, y0, r1);
        var gradientColors = geoBrushOptions.radialGradient.split(",");
        for (var _i = 0, gradientColors_1 = gradientColors; _i < gradientColors_1.length; _i++) {
            var gradientColor = gradientColors_1[_i];
            gradientColor = gradientColor.trim();
            var colorStop = gradientColor.substr(1, gradientColor.length - 2);
            var cs = colorStop.split(":");
            grd.addColorStop(Number(cs[0].trim()), __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(cs[1].trim(), geoBrushOptions.fillOpacity));
        }
        return grd;
    };
    GeoBrush.createLinearGradientColor = function (feature, resolution, geoBrushOptions) {
        var extent = feature.getExtent();
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        // TODO: the direction Angle by x0,y0,x1,y1. this.directionAngle
        var grd = context.createLinearGradient(0, 0, ol.extent.getWidth(extent) / resolution * ol.has.DEVICE_PIXEL_RATIO, ol.extent.getHeight(extent) / resolution * ol.has.DEVICE_PIXEL_RATIO);
        var gradientColors = geoBrushOptions.linearGradient.split(",");
        for (var _i = 0, gradientColors_2 = gradientColors; _i < gradientColors_2.length; _i++) {
            var gradientColor = gradientColors_2[_i];
            gradientColor = gradientColor.trim();
            var colorStop = gradientColor.substr(1, gradientColor.length - 2);
            var cs = colorStop.split(":");
            grd.addColorStop(Number(cs[0].trim()), __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(cs[1].trim(), geoBrushOptions.fillOpacity));
        }
        return grd;
    };
    GeoBrush.createImageCanvasPattern = function (feature, resolution, geoBrushOptions) {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        var imageElement = document.createElement("img");
        imageElement.src = geoBrushOptions.textureFile;
        return context.createPattern(imageElement, "repeat");
    };
    GeoBrush.createPatternColor = function (feature, resolution, geoBrushOptions) {
        var createPatternFunction = GeoBrush.geoPatternFunctions[geoBrushOptions.hatchStyle];
        if (typeof createPatternFunction === "function") {
            return createPatternFunction(geoBrushOptions.fillColor, geoBrushOptions.foregroundFill);
        }
        else {
            return __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(geoBrushOptions.fillColor, geoBrushOptions.fillOpacity);
        }
    };
    GeoBrush.getCrossPattern = function (fill, foregroundFill) {
        var size = 6;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // horizon line
        context.fillStyle = foregroundFill;
        context.fillRect(0, canvas.height / 2, canvas.width, 1);
        // vertical line
        context.fillRect(canvas.width / 2, 0, 1, canvas.height);
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getHorizontalPattern = function (fill, foregroundFill) {
        var size = 6;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // horizon line
        context.fillStyle = foregroundFill;
        context.fillRect(0, canvas.height / 2, canvas.width, 1);
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getVerticalPattern = function (fill, foregroundFill) {
        var size = 6;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // vertical line
        context.fillStyle = foregroundFill;
        context.fillRect(canvas.width / 2, 0, 1, canvas.height);
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getForwardDiagonalPattern = function (fill, foregroundFill) {
        var size = 6;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // vertical line
        context.strokeStyle = foregroundFill;
        context.moveTo(0, 0);
        context.lineTo(canvas.width, canvas.height);
        context.stroke();
        // context.fillStyle = foregroundFill;
        // context.moveTo(-1, -1);
        // context.lineTo(1, -1);
        // context.lineTo(canvas.width + 1, canvas.height);
        // context.lineTo(canvas.width + 1, canvas.height + 1);
        // context.lineTo(canvas.width, canvas.height + 1);
        // context.lineTo(-1, 0);
        // context.lineTo(-1, -1);
        // context.closePath();
        // context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getBackwardDiagonalPattern = function (fill, foregroundFill) {
        var size = 6;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // vertical line
        context.strokeStyle = foregroundFill;
        context.moveTo(canvas.width, 0);
        context.lineTo(0, canvas.height);
        context.stroke();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent05Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.95 + 1) * ratio;
        canvas.height = size * (2 * 0.95 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.45);
        context.lineTo(canvas.width * 0.55, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.55);
        context.lineTo(canvas.width * 0.45, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.45);
        context.closePath();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent10Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.9 + 1) * ratio;
        canvas.height = size * (2 * 0.9 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.4);
        context.lineTo(canvas.width * 0.6, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.6);
        context.lineTo(canvas.width * 0.4, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.4);
        context.closePath();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent20Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.8 + 1) * ratio;
        canvas.height = size * (2 * 0.8 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.3);
        context.lineTo(canvas.width * 0.7, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.7);
        context.lineTo(canvas.width * 0.3, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.3);
        context.closePath();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent25Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * 0.4 * ratio;
        canvas.height = size * 0.4 * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.strokeStyle = foregroundFill;
        context.beginPath();
        context.ellipse(canvas.width * 0.25, canvas.height * 0.25, 0.8, 0.8, 0, 0, 2 * Math.PI);
        // context.stroke();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent30Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.7 + 1) * ratio;
        canvas.height = size * (2 * 0.7 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.2);
        context.lineTo(canvas.width * 0.8, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.8);
        context.lineTo(canvas.width * 0.2, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.2);
        context.closePath();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent40Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.4 + 1) * ratio;
        canvas.height = size * (2 * 0.4 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, canvas.height * 0.1);
        context.lineTo(canvas.width * 0.9, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.9);
        context.lineTo(canvas.width * 0.1, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height * 0.1);
        context.closePath();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent50Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.5 + 1) * ratio;
        canvas.height = size * (2 * 0.5 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.5, 0);
        context.lineTo(canvas.width, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, canvas.height);
        context.lineTo(0, canvas.height * 0.5);
        context.lineTo(canvas.width * 0.5, 0);
        context.closePath();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent60Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.4 + 1) * ratio;
        canvas.height = size * (2 * 0.4 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.4, 0);
        context.lineTo(canvas.width * 0.6, 0);
        context.lineTo(canvas.width, canvas.height * 0.4);
        context.lineTo(canvas.width, canvas.height * 0.6);
        context.lineTo(canvas.width * 0.6, canvas.height);
        context.lineTo(canvas.width * 0.4, canvas.height);
        context.lineTo(0, canvas.height * 0.6);
        context.lineTo(0, canvas.height * 0.4);
        context.lineTo(canvas.width * 0.4, 0);
        context.closePath();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent70Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.3 + 1) * ratio;
        canvas.height = size * (2 * 0.3 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.3, 0);
        context.lineTo(canvas.width * 0.7, 0);
        context.lineTo(canvas.width, canvas.height * 0.3);
        context.lineTo(canvas.width, canvas.height * 0.7);
        context.lineTo(canvas.width * 0.7, canvas.height);
        context.lineTo(canvas.width * 0.3, canvas.height);
        context.lineTo(0, canvas.height * 0.7);
        context.lineTo(0, canvas.height * 0.3);
        context.lineTo(canvas.width * 0.3, 0);
        context.closePath();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent75Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.25 + 1) * ratio;
        canvas.height = size * (2 * 0.25 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.beginPath();
        context.moveTo(canvas.width * 0.25, 0);
        context.lineTo(canvas.width * 0.75, 0);
        context.lineTo(canvas.width, canvas.height * 0.25);
        context.lineTo(canvas.width, canvas.height * 0.75);
        context.lineTo(canvas.width * 0.75, canvas.height);
        context.lineTo(canvas.width * 0.25, canvas.height);
        context.lineTo(0, canvas.height * 0.75);
        context.lineTo(0, canvas.height * 0.25);
        context.lineTo(canvas.width * 0.25, 0);
        context.closePath();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent80Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * 0.8 * ratio;
        canvas.height = size * 0.8 * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.strokeStyle = foregroundFill;
        context.beginPath();
        context.ellipse(canvas.width * 0.1, canvas.height * 0.1, 0.8, 0.8, 0, 0, 2 * Math.PI);
        // context.stroke();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getPercent90Pattern = function (fill, foregroundFill) {
        var size = 5;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * (2 * 0.1 + 1) * ratio;
        canvas.height = size * (2 * 0.1 + 1) * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // percentage region
        context.fillStyle = foregroundFill;
        context.strokeStyle = foregroundFill;
        context.beginPath();
        context.ellipse(canvas.width * 0.1, canvas.height * 0.1, 0.4, 0.4, 0, 0, 2 * Math.PI);
        // context.stroke();
        context.fill();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getLargeGridPattern = function (fill, foregroundFill) {
        var size = 6;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // grid rect
        context.strokeStyle = foregroundFill;
        context.strokeRect(0, 0, canvas.width, canvas.height);
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.getDiagonalCrossPattern = function (fill, foregroundFill) {
        var size = 6;
        var ratio = ol.has.DEVICE_PIXEL_RATIO;
        var canvas = document.createElement("canvas");
        canvas.width = size * 2 * ratio;
        canvas.height = size * 2 * ratio;
        var context = canvas.getContext("2d");
        context.fillStyle = fill;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // left to right diagonal line
        context.strokeStyle = foregroundFill;
        context.moveTo(0, 0);
        context.lineTo(canvas.width, canvas.height);
        context.stroke();
        // right to left diagonal line
        context.strokeStyle = foregroundFill;
        context.moveTo(canvas.width, 0);
        context.lineTo(0, canvas.height);
        context.stroke();
        return context.createPattern(canvas, "repeat");
    };
    GeoBrush.geoBrushFunctions = {
        solid: GeoBrush.createGeoSolidBrush,
        radialgradient: GeoBrush.createRadialGradientColor,
        lineargradient: GeoBrush.createLinearGradientColor,
        hatch: GeoBrush.createPatternColor,
        texture: GeoBrush.createImageCanvasPattern
    };
    GeoBrush.geoPatternFunctions = {
        Cross: GeoBrush.getCrossPattern,
        Horizontal: GeoBrush.getHorizontalPattern,
        Vertical: GeoBrush.getVerticalPattern,
        ForwardDiagonal: GeoBrush.getForwardDiagonalPattern,
        BackwardDiagonal: GeoBrush.getBackwardDiagonalPattern,
        LargeGrid: GeoBrush.getLargeGridPattern,
        DiagonalCross: GeoBrush.getDiagonalCrossPattern,
        Percent05: GeoBrush.getPercent05Pattern,
        Percent10: GeoBrush.getPercent10Pattern,
        Percent20: GeoBrush.getPercent20Pattern,
        Percent25: GeoBrush.getPercent25Pattern,
        Percent30: GeoBrush.getPercent30Pattern,
        Percent40: GeoBrush.getPercent40Pattern,
        Percent50: GeoBrush.getPercent50Pattern,
        Percent60: GeoBrush.getPercent60Pattern,
        Percent70: GeoBrush.getPercent70Pattern,
        Percent75: GeoBrush.getPercent75Pattern,
        Percent80: GeoBrush.getPercent80Pattern,
        Percent90: GeoBrush.getPercent90Pattern,
    };
    return GeoBrush;
}());



/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoLineStyle; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoStyle__ = __webpack_require__(0);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var GeoLineStyle = /** @class */ (function (_super) {
    __extends(GeoLineStyle, _super);
    function GeoLineStyle(styleJson) {
        var _this = _super.call(this, styleJson) || this;
        _this.geometryLineCaps = [
            "triangle",
            "squareanchor",
            "roundanchor",
            "diamondanchor",
            "arrowanchor"
        ];
        _this.olLineCapsMap = {
            butt: "butt",
            flat: "square",
            square: "square",
            round: "round",
            noanchor: "square",
            anchormask: "square",
            custom: "square"
        };
        _this.convertedDashArray = new Array();
        _this.convertedInnerDashArray = new Array();
        _this.convertedCenterDashArray = new Array();
        _this.lineStroke = new ol.style.Stroke();
        _this.lineStyle = new ol.style.Style({ stroke: _this.lineStroke });
        _this.lineCapFill = new ol.style.Fill();
        _this.lineCapStyle = new ol.style.Style({ fill: _this.lineCapFill });
        _this.lineInnerStroke = new ol.style.Stroke();
        _this.lineInnerStyle = new ol.style.Style({ stroke: _this.lineInnerStroke });
        _this.lineCapInnerFill = new ol.style.Fill();
        _this.lineCapInnerStyle = new ol.style.Style({
            fill: _this.lineCapInnerFill
        });
        _this.lineCenterStroke = new ol.style.Stroke();
        _this.lineCenterStyle = new ol.style.Style({
            stroke: _this.lineCenterStroke
        });
        _this.lineCapCenterFill = new ol.style.Fill();
        _this.lineCapCenterStyle = new ol.style.Style({
            fill: _this.lineCapCenterFill
        });
        if (styleJson) {
            _this.lineCap = styleJson["line-cap"];
            _this.color = styleJson["line-color"];
            _this.dashArray = styleJson["line-dasharray"];
            _this.gamma = styleJson["line-gamma"];
            _this.geometryTransform = styleJson["line-geometry-transform"];
            _this.lineJoin = styleJson["line-join"];
            _this.miterLimit = styleJson["line-miterlimit"];
            _this.offset = styleJson["line-offset"];
            _this.opacity = styleJson["line-opacity"];
            _this.width = styleJson["line-width"];
            _this.lineCapInner = styleJson["line-cap-inner"];
            _this.colorInner = styleJson["line-color-inner"];
            _this.dashArrayInner = styleJson["line-dasharray-inner"];
            _this.lineJoinInner = styleJson["line-join-inner"];
            _this.miterLimitInner = styleJson["line-miterlimit-inner"];
            _this.widthInner = styleJson["line-width-inner"];
            _this.lineCapCenter = styleJson["line-cap-center"];
            _this.colorCenter = styleJson["line-color-center"];
            _this.dashArrayCenter = styleJson["line-dasharray-center"];
            _this.lineJoinCenter = styleJson["line-join-center"];
            _this.miterLimitCenter = styleJson["line-miterlimit-center"];
            _this.widthCenter = styleJson["line-width-center"];
            _this.onewaySymbol = styleJson["line-oneway-symbol"];
        }
        return _this;
    }
    GeoLineStyle.prototype.initializeCore = function () {
        if (this.color) {
            this.olColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.color, this.opacity);
            this.lineStroke.setColor(this.olColor);
            this.lineCapFill.setColor(this.olColor);
        }
        if (this.dashArray) {
            var tmpArray = this.dashArray.split(",");
            for (var _i = 0, tmpArray_1 = tmpArray; _i < tmpArray_1.length; _i++) {
                var a = tmpArray_1[_i];
                this.convertedDashArray.push(parseFloat(a));
            }
        }
        // Drawing inner
        if (this.colorInner) {
            this.olInnerColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.colorInner, this.opacity);
            this.lineInnerStroke.setColor(this.olInnerColor);
            this.lineCapInnerFill.setColor(this.olInnerColor);
        }
        if (this.dashArrayInner) {
            var tmpArray = this.dashArrayInner.split(",");
            for (var _a = 0, tmpArray_2 = tmpArray; _a < tmpArray_2.length; _a++) {
                var a = tmpArray_2[_a];
                this.convertedInnerDashArray.push(parseFloat(a));
            }
        }
        // Drawing center
        if (this.colorCenter) {
            this.olCenterColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.colorCenter, this.opacity);
            this.lineCenterStroke.setColor(this.olCenterColor);
            this.lineCapCenterFill.setColor(this.olCenterColor);
        }
        if (this.dashArrayCenter) {
            var tmpArray = this.dashArrayCenter.split(",");
            for (var _b = 0, tmpArray_3 = tmpArray; _b < tmpArray_3.length; _b++) {
                var a = tmpArray_3[_b];
                this.convertedCenterDashArray.push(parseFloat(a));
            }
        }
        if (this.onewaySymbol) {
            this.onewayIcon = new ol.style.Icon({
                src: this.onewaySymbol,
                imgSize: [18, 5],
                anchor: [0.5, 0.5],
                rotateWithView: true
            });
            this.onewayStyle = new ol.style.Style({
                image: this.onewayIcon
            });
        }
    };
    GeoLineStyle.prototype.getTransformValues = function (transform) {
        // get transform values which look like transform(value1, value2)
        var start = transform.indexOf("(");
        var end = transform.indexOf(")");
        var valueString = transform.substring(start + 1, end);
        var values = [];
        if (valueString.includes(",")) {
            values = valueString.split(",");
        }
        else {
            values.push(valueString);
        }
        return values;
    };
    GeoLineStyle.prototype.getConvertedStyleCore = function (feature, resolution, options) {
        var _this = this;
        var length = 0;
        this.styles = [];
        if (this.color && this.width) {
            if (this.olLineCapsMap[this.lineCap]) {
                this.lineStroke.setLineCap(this.olLineCapsMap[this.lineCap]);
            }
            if (this.color) {
                this.lineStroke.setColor(this.olColor);
                this.lineCapFill.setColor(this.olColor);
            }
            if (this.dashArray) {
                this.lineStroke.setLineDash(this.convertedDashArray);
            }
            if (this.lineJoin) {
                this.lineStroke.setLineJoin(this.lineJoin);
            }
            if (this.miterLimit !== 4) {
                this.lineStroke.setMiterLimit(this.miterLimit);
            }
            if (this.width) {
                this.lineStroke.setWidth(this.width);
            }
            // Set inner
            if (this.colorInner) {
                this.lineInnerStroke.setColor(this.olInnerColor);
                this.lineCapInnerFill.setColor(this.olInnerColor);
            }
            if (this.dashArrayInner) {
                this.lineInnerStroke.setLineDash(this.convertedInnerDashArray);
            }
            if (this.lineJoinInner) {
                this.lineInnerStroke.setLineJoin(this.lineJoinInner);
            }
            if (this.miterLimitInner !== 4) {
                this.lineInnerStroke.setMiterLimit(this.miterLimitInner);
            }
            if (this.widthInner) {
                this.lineInnerStroke.setWidth(this.widthInner);
            }
            // Set center
            if (this.colorCenter) {
                this.lineCenterStroke.setColor(this.olCenterColor);
                this.lineCapCenterFill.setColor(this.olCenterColor);
                this.lineCenterStroke.setLineCap("butt");
            }
            if (this.dashArrayCenter) {
                this.lineCenterStroke.setLineDash(this.convertedCenterDashArray);
            }
            if (this.lineJoinCenter) {
                this.lineCenterStroke.setLineJoin(this.lineJoinCenter);
            }
            if (this.miterLimitCenter !== 4) {
                this.lineCenterStroke.setMiterLimit(this.miterLimitCenter);
            }
            if (this.widthCenter) {
                this.lineCenterStroke.setWidth(this.widthCenter);
            }
            var geometryFunction = function (feature) {
                if (_this.geometryTransform) {
                    var geometry = _this.getGeometry(feature);
                    if (_this.geometryTransform) {
                        var values = _this.getTransformValues(_this.geometryTransform);
                        if (_this.geometryTransform.indexOf("translate") === 0) {
                            geometry.translate(+values[0].trim(), +values[1].trim());
                        }
                        else if (_this.geometryTransform.indexOf("scale") === 0) {
                            geometry.scale(+values[0].trim(), +values[1].trim());
                        }
                        else if (_this.geometryTransform.indexOf("rotate") === 0) {
                            var center = ol.extent.getCenter(geometry.getExtent());
                            var angle = +values[0].trim() * Math.PI / 180;
                            geometry.rotate(angle, center);
                        }
                        else if (_this.geometryTransform.indexOf("skew") === 0) {
                            _this.skewGeometry(geometry, +values[0].trim(), +values[1].trim());
                        }
                    }
                }
                return feature.getGeometry();
            };
            this.lineStyle.setGeometry(geometryFunction);
            this.styles[length++] = this.lineStyle;
            if (this.gamma !== undefined && options.layer) {
                var styleGamma_1 = this.gamma;
                options.layer.on("precompose", function (evt) {
                    evt.context.imageSmoothingEnabled = styleGamma_1;
                    evt.context.webkitImageSmoothingEnabled = styleGamma_1;
                    evt.context.mozImageSmoothingEnabled = styleGamma_1;
                    evt.context.msImageSmoothingEnabled = styleGamma_1;
                });
            }
            if (this.geometryLineCaps.includes(this.lineCap)) {
                var geometryFunction_1 = function (feature) {
                    var geometry = _this.getGeometry(feature);
                    return GeoLineStyle.createAnchoredGeometry(geometry, _this.lineCap, _this.width, resolution);
                };
                this.lineCapStyle.setGeometry(geometryFunction_1);
                this.styles[length++] = this.lineCapStyle;
            }
            // Drawing inner
            if (this.colorInner && this.widthInner) {
                var geometryFunction_2 = function (feature) {
                    var geometry = _this.getGeometry(feature);
                    if (_this.geometryTransform) {
                        var values = _this.getTransformValues(_this.geometryTransform);
                        if (_this.geometryTransform.indexOf("translate") === 0) {
                            geometry.translate(+values[0].trim(), +values[1].trim());
                        }
                        else if (_this.geometryTransform.indexOf("scale") === 0) {
                            geometry.scale(+values[0].trim(), +values[1].trim());
                        }
                        else if (_this.geometryTransform.indexOf("rotate") === 0) {
                            var center = ol.extent.getCenter(geometry.getExtent());
                            var angle = +values[0].trim() * Math.PI / 180;
                            geometry.rotate(angle, center);
                        }
                        else if (_this.geometryTransform.indexOf("skew") === 0) {
                            _this.skewGeometry(geometry, +values[0].trim(), +values[1].trim());
                        }
                    }
                    return feature.getGeometry();
                };
                this.lineInnerStyle.setGeometry(geometryFunction_2);
                this.styles[length++] = this.lineInnerStyle;
                if (this.geometryLineCaps.includes(this.lineCapInner)) {
                    var geometryFunction_3 = function (feature) {
                        var geometry = _this.getGeometry(feature);
                        return GeoLineStyle.createAnchoredGeometry(geometry, _this.lineCapInner, _this.widthInner, resolution);
                    };
                    this.lineCapInnerStyle.setGeometry(geometryFunction_3);
                    this.styles[length++] = this.lineCapInnerStyle;
                }
            }
            // Drawing center
            if (this.colorCenter && this.widthCenter) {
                var geometryFunction_4 = function (feature) {
                    var geometry = _this.getGeometry(feature);
                    if (_this.geometryTransform) {
                        var values = _this.getTransformValues(_this.geometryTransform);
                        if (_this.geometryTransform.indexOf("translate") === 0) {
                            geometry.translate(+values[0].trim(), +values[1].trim());
                        }
                        else if (_this.geometryTransform.indexOf("scale") === 0) {
                            geometry.scale(+values[0].trim(), +values[1].trim());
                        }
                        else if (_this.geometryTransform.indexOf("rotate") === 0) {
                            var center = ol.extent.getCenter(geometry.getExtent());
                            var angle = +values[0].trim() * Math.PI / 180;
                            geometry.rotate(angle, center);
                        }
                        else if (_this.geometryTransform.indexOf("skew") === 0) {
                            _this.skewGeometry(geometry, +values[0].trim(), +values[1].trim());
                        }
                    }
                    return feature.getGeometry();
                };
                this.lineCenterStyle.setGeometry(geometryFunction_4);
                this.styles[length++] = this.lineCenterStyle;
                if (this.geometryLineCaps.includes(this.lineCapCenter)) {
                    var geometryFunction_5 = function (feature) {
                        var geometry = _this.getGeometry(feature);
                        return GeoLineStyle.createAnchoredGeometry(geometry, _this.lineCapCenter, _this.widthCenter, resolution);
                    };
                    this.lineCapCenterStyle.setGeometry(geometryFunction_5);
                    this.styles[length++] = this.lineCapCenterStyle;
                }
            }
        }
        if (this.onewaySymbol) {
            var flatCoordinates = feature.getFlatCoordinates();
            var longest = 0;
            var longestIndex = void 0;
            for (var i = 0; i <= flatCoordinates.length - 4; i += 2) {
                var dX = Math.abs(flatCoordinates[i] - flatCoordinates[i + 2]);
                var dY = Math.abs(flatCoordinates[i + 1] - flatCoordinates[i + 3]);
                var distance = dX + dY;
                if (distance > longest) {
                    longest = distance;
                    longestIndex = i;
                }
            }
            var start = [flatCoordinates[longestIndex], flatCoordinates[longestIndex + 1]];
            var end = [flatCoordinates[longestIndex + 2], flatCoordinates[longestIndex + 3]];
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            var centerPoint = [(start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5];
            var geometry = new ol.geom.Point(centerPoint, "XY");
            this.onewayIcon.rotation_ = -rotation;
            this.onewayStyle.setGeometry(geometry);
            this.styles[length++] = this.onewayStyle;
        }
        return this.styles;
    };
    GeoLineStyle.prototype.getGeometry = function (feature) {
        var tmpFlatCoordinates = feature.getFlatCoordinates();
        var tmpCoordinates = [];
        for (var i = 0; i < tmpFlatCoordinates.length; i += 2) {
            tmpCoordinates.push([tmpFlatCoordinates[i], tmpFlatCoordinates[i + 1]]);
        }
        return new ol.geom.LineString(tmpCoordinates);
    };
    GeoLineStyle.createAnchoredGeometry = function (geometry, lineCap, lineWidth, resolution) {
        var segments = GeoLineStyle.getTerminalSegments(geometry);
        var linearRing = undefined;
        var multiPolygon = new ol.geom.MultiPolygon([]);
        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
            var segment = segments_1[_i];
            var first = segment[0];
            var last = segment[1];
            var delta = lineWidth * resolution / 2;
            var translateDelta = (lineWidth - 1) * resolution / 2;
            switch (lineCap) {
                case "triangle":
                    linearRing = new ol.geom.LinearRing([
                        [last[0], last[1] + delta],
                        [last[0] + delta, last[1]],
                        [last[0], last[1] - delta],
                        [last[0], last[1] + delta]
                    ]);
                    break;
                case "squareanchor":
                    delta *= 1.5;
                    linearRing = new ol.geom.LinearRing([
                        [last[0] - delta, last[1] + delta],
                        [last[0] + delta, last[1] + delta],
                        [last[0] + delta, last[1] - delta],
                        [last[0] - delta, last[1] - delta],
                        [last[0] - delta, last[1] + delta]
                    ]);
                    break;
                case "roundanchor":
                    delta *= 2;
                    var radiusDelta = Math.PI / 18;
                    var coordinates = [];
                    var radius = 0;
                    for (var i = 0; i < 36; i++) {
                        coordinates.push([
                            Math.cos(radius) * delta + last[0],
                            Math.sin(radius) * delta + last[1]
                        ]);
                        radius += radiusDelta;
                    }
                    coordinates.push(coordinates[0]);
                    linearRing = new ol.geom.LinearRing(coordinates);
                    break;
                case "diamondanchor":
                    delta *= 1.5;
                    linearRing = new ol.geom.LinearRing([
                        [last[0] - delta, last[1] + delta],
                        [last[0] + delta, last[1] + delta],
                        [last[0] + delta, last[1] - delta],
                        [last[0] - delta, last[1] - delta],
                        [last[0] - delta, last[1] + delta]
                    ]);
                    linearRing.rotate(Math.PI / 4, last);
                    break;
                case "arrowanchor":
                    delta *= 2;
                    linearRing = new ol.geom.LinearRing([
                        [last[0], last[1] + delta],
                        [last[0] + delta * Math.cos(Math.PI / 6) * 2, last[1]],
                        [last[0], last[1] - delta],
                        [last[0], last[1] + delta]
                    ]);
                    break;
            }
            if (first[0] === last[0]) {
                if (first[1] > last[1]) {
                    linearRing.rotate(-Math.PI / 2, last);
                    linearRing.translate(0, -translateDelta);
                }
                else {
                    linearRing.rotate(Math.PI / 2, last);
                    linearRing.translate(0, translateDelta);
                }
            }
            else if (first[1] === last[1]) {
                if (last[0] < first[0]) {
                    linearRing.rotate(Math.PI, last);
                    linearRing.translate(-translateDelta, 0);
                }
                else {
                    linearRing.translate(translateDelta, 0);
                }
            }
            else {
                var dx = last[0] - first[0];
                var dy = last[1] - first[1];
                var radians = Math.atan(dy / dx);
                if (last[0] > first[0]) {
                    linearRing.rotate(radians, last);
                    linearRing.translate(Math.cos(radians) * translateDelta, Math.sin(radians) * translateDelta);
                }
                else {
                    linearRing.rotate(radians + Math.PI, last);
                    linearRing.translate(-Math.cos(radians) * translateDelta, -Math.sin(radians) * translateDelta);
                }
            }
            var polygon = new ol.geom.Polygon([]);
            polygon.appendLinearRing(linearRing);
            multiPolygon.appendPolygon(polygon);
        }
        return multiPolygon;
    };
    GeoLineStyle.getTerminalSegments = function (geometry) {
        var type = geometry.getType();
        var results = [];
        var geometryType = ol.geom.GeometryType;
        switch (type) {
            case geometryType.LINE_STRING:
                var coords = geometry.getCoordinates();
                var start = [coords[1], coords[0]];
                var end = [coords[coords.length - 2], coords[coords.length - 1]];
                results.push(start);
                results.push(end);
                break;
            case geometryType.MULTI_LINE_STRING:
                var lines = geometry.getLineStrings();
                for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                    var line = lines_1[_i];
                    Array.prototype.push.apply(results, GeoLineStyle.getTerminalSegments(line));
                }
                break;
            case geometryType.GEOMETRY_COLLECTION:
                var geometries = geometry.getGeometries();
                for (var _a = 0, geometries_1 = geometries; _a < geometries_1.length; _a++) {
                    var geom = geometries_1[_a];
                    Array.prototype.push.apply(results, GeoLineStyle.getTerminalSegments(geom));
                }
                break;
        }
        return results;
    };
    return GeoLineStyle;
}(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */]));



/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoPointStyle; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoStyle__ = __webpack_require__(0);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var GeoPointStyle = /** @class */ (function (_super) {
    __extends(GeoPointStyle, _super);
    function GeoPointStyle(styleJson) {
        var _this = _super.call(this, styleJson) || this;
        if (styleJson) {
            _this.glyph = styleJson["point-glyph"];
            _this.linearGradient = styleJson["point-linear-gradient"];
            _this.radialGradient = styleJson["point-radial-gradient"];
            _this.fill = styleJson["point-fill"];
            _this.glyphName = styleJson["point-glyph-name"];
            _this.glyphMaskColor = styleJson["point-glyph-mask-color"];
            _this.glyphMaskMargin = styleJson["point-glyph-mask-margin"];
            _this.glyphMaskOutlineColor = styleJson["point-glyph-mask-outline-color"];
            _this.glyphMaskOutlineWidth = styleJson["point-glyph-mask-outline-width"];
            _this.glyphMaskType = styleJson["point-glyph-mask-type"];
            _this.outlineColor = styleJson["point-outline-color"];
            _this.outlineWidth = styleJson["point-outline-width"];
            _this.size = styleJson["point-size"];
            _this.angle = styleJson["point-rotate-angle"] ? styleJson["point-rotate-angle"] : 0;
            _this.dx = styleJson["point-dx"];
            _this.dy = styleJson["point-dy"];
            _this.pointFile = styleJson["point-file"];
            _this.opacity = styleJson["point-opacity"];
            _this.symbolType = styleJson["point-symbol-type"];
            _this.transform = styleJson["point-transform"];
            _this.pointType = styleJson["point-type"];
            if (_this.outlineColor) {
                _this.convertedGlyphOutLineColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(_this.outlineColor, _this.opacity);
            }
            if (_this.fill) {
                _this.convertedGlyphFill = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(_this.fill, _this.opacity);
            }
            if (_this.linearGradient) {
                if (GeoPointStyle.linearGradientDictionary.hasOwnProperty(_this.linearGradient)) {
                    _this.convertedGlyphFill = GeoPointStyle.linearGradientDictionary[_this.linearGradient];
                }
                else {
                    _this.convertedGlyphFill = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toOLLinearGradient(_this.linearGradient, _this.opacity, _this.size);
                    GeoPointStyle.linearGradientDictionary[_this.linearGradient] = _this.convertedGlyphFill;
                }
            }
            if (_this.radialGradient) {
                if (GeoPointStyle.radialGradientDictionary.hasOwnProperty(_this.radialGradient)) {
                    _this.convertedGlyphFill = GeoPointStyle.radialGradientDictionary[_this.radialGradient];
                }
                else {
                    _this.convertedGlyphFill = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toOLRadialGradient(_this.radialGradient, _this.opacity, _this.size);
                    GeoPointStyle.radialGradientDictionary[_this.radialGradient] = _this.convertedGlyphFill;
                }
            }
        }
        return _this;
    }
    GeoPointStyle.prototype.initializeCore = function () {
        this.style = new ol.style.Style();
        switch (this.pointType) {
            case "symbol":
                this.initSymbolStyle();
                break;
            case "image":
                this.initBitmapStyle();
                break;
            case "glyph":
                this.initGlyphStyle();
            default:
                break;
        }
        if (this.pointType === "glyph") {
            if (this.glyph && this.glyphName) {
                this.textStyle.label = this.getGlyphImage(this.textStyle);
                this.style.setImage(null);
                this.style.setText(this.textStyle);
            }
        }
        else {
            this.style.setImage(this.imageStyle);
        }
    };
    GeoPointStyle.prototype.getConvertedStyleCore = function (feature, resolution, options) {
        if (this.pointType === "glyph") {
            if (this.glyph && this.glyphName) {
                this.textStyle.labelPosition = feature.getFlatCoordinates();
            }
        }
        var featureZindex = feature["tempTreeZindex"];
        if (featureZindex === undefined) {
            featureZindex = 0;
        }
        this.style.setZIndex(featureZindex);
        this.styles = [];
        this.styles[0] = this.style;
        return this.styles;
    };
    GeoPointStyle.prototype.getGlyphImage = function (textState) {
        var font = textState.font_;
        var strokeColor;
        var outlineWidth = 0;
        var textStrok = textState.getStroke();
        if (textStrok) {
            strokeColor = textStrok.getColor();
            outlineWidth = textStrok.getWidth();
        }
        var scale = window.devicePixelRatio;
        // here
        var width = ol.render.canvas.TextReplay.measureTextWidths(font, [textState.text_], []) + outlineWidth * 2;
        var height = ol.render.canvas.measureTextHeight(font) + outlineWidth * 2;
        var tmpMaskMargin = (this.glyphMaskMargin ? this.glyphMaskMargin : "0").split(',');
        var tmpMaskHeightMargin = 0;
        var tmpMaskWidthMargin = 0;
        switch (tmpMaskMargin.length) {
            case 1:
                tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) * 2;
                tmpMaskWidthMargin = parseInt(tmpMaskMargin[0]) * 2;
                break;
            case 2:
                tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) * 2;
                tmpMaskWidthMargin = parseInt(tmpMaskMargin[1]) * 2;
                break;
            case 3:
                tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) + parseInt(tmpMaskMargin[2]);
                tmpMaskWidthMargin = parseInt(tmpMaskMargin[1]) * 2;
                break;
            case 4:
                tmpMaskHeightMargin = parseInt(tmpMaskMargin[0]) + parseInt(tmpMaskMargin[2]);
                tmpMaskWidthMargin = parseInt(tmpMaskMargin[1]) + parseInt(tmpMaskMargin[3]);
                break;
            default:
                break;
        }
        var tmpMaskOutlineWidth = (this.glyphMaskOutlineWidth ? this.glyphMaskOutlineWidth : 0) * 2;
        var renderWidth = width + tmpMaskWidthMargin;
        var renderHeight = height + tmpMaskWidthMargin;
        var canvasWidth = width + tmpMaskWidthMargin + tmpMaskOutlineWidth;
        var canvasHeight = height + tmpMaskHeightMargin + tmpMaskOutlineWidth;
        var context = ol.dom.createCanvasContext2D(canvasWidth * scale, canvasHeight * scale);
        if (scale !== 1) {
            context.scale(scale, scale);
        }
        this.drawMask(context, 0, 0, renderWidth, renderHeight);
        context.font = font;
        context.textBaseline = "middle";
        context.textAlign = "center";
        if (textStrok) {
            if (strokeColor && outlineWidth > 0) {
                context.strokeStyle = strokeColor;
                context.lineWidth = outlineWidth * (ol.has.SAFARI ? scale : 1);
                context.strokeText(textState.text_, canvasWidth / 2, canvasHeight / 2);
            }
        }
        var textFill = textState.getFill();
        if (textFill) {
            var color = textFill.getColor();
            if (color) {
                context.fillStyle = color;
                context.fillText(textState.text_, canvasWidth / 2, canvasHeight / 2);
            }
        }
        return context.canvas;
    };
    GeoPointStyle.prototype.drawMask = function (context, x, y, width, height) {
        var fill = undefined;
        var stroke = undefined;
        if (this.glyphMaskColor) {
            fill = new ol.style.Fill();
            fill.setColor(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.glyphMaskColor, this.opacity ? this.opacity : 1));
        }
        if (this.glyphMaskOutlineColor && this.glyphMaskOutlineWidth) {
            stroke = new ol.style.Stroke();
            if (this.glyphMaskOutlineColor) {
                stroke.setColor(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.glyphMaskOutlineColor, this.opacity ? this.opacity : 1));
            }
            if (this.glyphMaskOutlineWidth) {
                stroke.setWidth(this.glyphMaskOutlineWidth ? this.glyphMaskOutlineWidth : 0);
            }
        }
        switch (this.glyphMaskType) {
            case "default":
            case "Default":
            case "rectangle":
            case "Rectangle":
                this.drawRectangle(context, x, y, width, height, fill, stroke);
                break;
            case "roundedCorners":
            case "RoundedCorners":
                this.drawRoundRectangle(context, x, y, width, height, fill, stroke);
                break;
            case "roundedEnds":
            case "RoundedEnds":
                this.drawRoundedEnds(context, x, y, width, height, fill, stroke);
                break;
            case "circle":
            case "Circle":
                this.drawCircle(context, x, y, width, height, fill, stroke);
                break;
        }
    };
    GeoPointStyle.prototype.drawRectangle = function (context, x, y, width, height, fill, stroke) {
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fillRect(x, y, width, height);
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.strokeRect(x + stroke.getWidth(), y + stroke.getWidth(), width, height);
        }
    };
    GeoPointStyle.prototype.drawRoundRectangle = function (context, x, y, width, height, fill, stroke) {
        var radius = (width < height ? width : height) * 0.3;
        // width *= 0.9;
        // height *= 0.8;
        if (stroke) {
            x = x + (stroke.getWidth() ? stroke.getWidth() : 0);
            y = y + (stroke.getWidth() ? stroke.getWidth() : 0);
        }
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
    };
    GeoPointStyle.prototype.drawRoundedEnds = function (context, x, y, width, height, fill, stroke) {
        var radius = (width < height ? width : height) * 0.2;
        // width *= 0.9;
        // height *= 0.8;
        if (stroke) {
            x = x + (stroke.getWidth() ? stroke.getWidth() : 0);
            y = y + (stroke.getWidth() ? stroke.getWidth() : 0);
        }
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y + height * 0.5, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height * 0.5, x + radius, y);
        context.closePath();
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
    };
    GeoPointStyle.prototype.drawCircle = function (context, x, y, width, height, fill, stroke) {
        var radius = (width < height ? width : height) * 0.5;
        // width *= 0.9;
        // height *= 0.8;
        if (stroke) {
            x = x + (stroke.getWidth() ? stroke.getWidth() : 0);
            y = y + (stroke.getWidth() ? stroke.getWidth() : 0);
        }
        context.beginPath();
        context.arc(x + width * 0.5, y + height * 0.5, radius, 0, 2 * Math.PI, false);
        context.closePath();
        if (fill) {
            context.fillStyle = fill.getColor();
            context.fill();
        }
        if (stroke) {
            context.lineWidth = stroke.getWidth();
            context.strokeStyle = stroke.getColor();
            context.stroke();
        }
    };
    GeoPointStyle.prototype.initSymbolStyle = function () {
        var radius = this.size / 2;
        switch (this.symbolType) {
            case "circle":
                this.imageStyle = new ol.style.Circle({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    radius: radius
                });
                break;
            case "square":
                this.imageStyle = new ol.style.RegularShape({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    points: 4,
                    radius: radius,
                    angle: Math.PI / 4 + this.angle
                });
                break;
            case "triangle":
                this.imageStyle = new ol.style.RegularShape({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    points: 3,
                    radius: radius,
                    angle: this.angle
                });
                break;
            case "cross":
                this.imageStyle = new ol.style.RegularShape({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    points: 4,
                    radius: radius,
                    radius2: 0,
                    angle: this.angle
                });
                break;
            case "diamond":
                break;
            case "diamond2":
                break;
            case "star":
                this.imageStyle = new ol.style.RegularShape({
                    fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                        color: this.convertedGlyphFill
                    })) : undefined,
                    stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                        color: this.convertedGlyphOutLineColor,
                        width: this.outlineWidth
                    })) : undefined,
                    points: 5,
                    radius: radius,
                    radius2: radius / 2.5,
                    angle: this.angle
                });
                break;
            case "star2":
                break;
        }
    };
    GeoPointStyle.prototype.initBitmapStyle = function () {
        if (this.pointFile) {
            this.imageStyle = new ol.style.Icon(({
                opacity: this.opacity || 1,
                src: this.pointFile,
                rotation: this.angle * Math.PI / 180,
                offset: [this.dx, -this.dy]
            }));
        }
    };
    GeoPointStyle.prototype.initGlyphStyle = function () {
        if (this.glyph) {
            this.textStyle = new ol.style.Text(({
                font: this.size + "px " + this.glyph,
                offsetX: this.dx,
                offsetY: this.dy,
                text: this.glyphName,
                fill: this.convertedGlyphFill !== undefined ? new ol.style.Fill(({
                    color: this.convertedGlyphFill
                })) : undefined,
                stroke: this.convertedGlyphOutLineColor !== undefined && this.outlineWidth > 0 ? new ol.style.Stroke(({
                    color: this.convertedGlyphOutLineColor,
                    width: this.outlineWidth
                })) : undefined,
                rotation: this.angle * Math.PI / 180
            }));
        }
    };
    GeoPointStyle.prototype.applyTransForm = function (style) {
        var transformRgx = /([a-z]+)\((.*?)\)/i;
        if (this.transform && transformRgx.test(this.transform)) {
            var matchedResults = this.transform.match(transformRgx);
            var transFormType = matchedResults.length > 2 ? matchedResults[1] : "";
            var transFormValue = matchedResults.length > 2 ? matchedResults[2] : "";
            switch (transFormType) {
                case "rotate":
                    style.getImage() && style.getImage().setRotation(parseInt(transFormValue));
                    style.getText() && style.getText().setRotation(parseInt(transFormValue));
                    break;
                case "scale":
                    var scale = parseInt(transFormValue.split(",")[0]);
                    style.getImage() && style.getImage().setScale(scale);
                    style.getText() && style.getText().setScale(scale);
                    break;
                case "translate":
                default:
                    throw "not support " + this.transform;
            }
        }
    };
    GeoPointStyle.linearGradientDictionary = {};
    GeoPointStyle.radialGradientDictionary = {};
    return GeoPointStyle;
}(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */]));



/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoShieldStyle; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__geoStyle__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__textLabelingStrategy__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__detectTextLabelingStrategy__ = __webpack_require__(3);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var GeoShieldStyle = /** @class */ (function (_super) {
    __extends(GeoShieldStyle, _super);
    function GeoShieldStyle(styleJson) {
        var _this = _super.call(this, styleJson) || this;
        _this.textAligns = ["left", "right", "center", "end", "start"];
        _this.BATCH_CONSTRUCTORS_DEFAULT = {
            Point: __WEBPACK_IMPORTED_MODULE_1__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            MultiPoint: __WEBPACK_IMPORTED_MODULE_1__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            LineString: __WEBPACK_IMPORTED_MODULE_1__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            Circle: __WEBPACK_IMPORTED_MODULE_1__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            MultiLineString: __WEBPACK_IMPORTED_MODULE_1__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            Polygon: __WEBPACK_IMPORTED_MODULE_1__textLabelingStrategy__["a" /* TextLabelingStrategy */],
            MultiPolygon: __WEBPACK_IMPORTED_MODULE_1__textLabelingStrategy__["a" /* TextLabelingStrategy */]
        };
        _this.BATCH_CONSTRUCTORS_DETECT = {
            Point: __WEBPACK_IMPORTED_MODULE_2__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            MultiPoint: __WEBPACK_IMPORTED_MODULE_2__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            LineString: __WEBPACK_IMPORTED_MODULE_2__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            Circle: __WEBPACK_IMPORTED_MODULE_2__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            MultiLineString: __WEBPACK_IMPORTED_MODULE_2__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            Polygon: __WEBPACK_IMPORTED_MODULE_2__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            MultiPolygon: __WEBPACK_IMPORTED_MODULE_2__detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */]
        };
        _this.imageCache = [];
        _this.labelInfos = [];
        _this.charWidths = {};
        if (styleJson) {
            _this.iconType = styleJson["shield-icon-type"];
            _this.iconSymbolType = styleJson["shield-icon-symbol-type"];
            _this.iconSize = styleJson["shield-icon-size"] ? styleJson["shield-icon-size"] : 0;
            _this.iconSrc = styleJson["shield-icon-src"];
            _this.iconColor = styleJson["shield-icon-color"];
            _this.iconOutlineColor = styleJson["shield-icon-outline-color"];
            _this.iconOutlineWidth = styleJson["shield-icon-outline-width"] ? styleJson["shield-icon-outline-width"] : 0;
            if (_this.iconSrc) {
                if (!GeoShieldStyle.poiCache[_this.iconSrc]) {
                    var imageElement = document.createElement("img");
                    imageElement.src = _this.iconSrc;
                    GeoShieldStyle.poiCache[_this.iconSrc] = imageElement;
                }
            }
            _this.name = styleJson["shield-name"];
            _this.font = styleJson["shield-font"];
            _this.align = styleJson["shield-align"];
            _this.angle = styleJson["shield-rotate-angle"] ? styleJson["shield-rotate-angle"] : 0;
            // this.avoidEdges = styleJson["shield-avoid-edges"];
            _this.dateFormat = styleJson["shield-date-format"];
            // TODO
            _this.dx = styleJson["shield-dx"] ? styleJson["shield-dx"] : 0;
            _this.dy = styleJson["shield-dy"] ? styleJson["shield-dy"] : 0;
            _this.faceName = styleJson["shield-face-name"];
            _this.fill = styleJson["shield-fill"];
            // this.forceHorizontalForLine = styleJson["shield-force-horizontal-for-line"];
            _this.haloFill = styleJson["shield-halo-fill"] ? styleJson["shield-halo-fill"] : "Transparent";
            _this.haloRadius = styleJson["shield-halo-radius"] ? styleJson["shield-halo-radius"] : 0;
            // using in strategy
            _this.margin = styleJson["shield-margin"];
            // this.maxCharAngleDelta = styleJson["shield-max-char-angle-delta"];
            // using in strategy
            _this.minDistance = styleJson["shield-min-distance"];
            // using in strategy
            _this.minPadding = styleJson["shield-min-padding"];
            _this.name = styleJson["shield-name"];
            _this.numericFormat = styleJson["shield-numeric-format"];
            _this.opacity = styleJson["shield-opacity"];
            _this.orientation = styleJson["shield-orientation"];
            // using in strategy
            _this.placements = styleJson["shield-placements"] ? styleJson["shield-placements"] : "UR,U,UL,B,BR,BL,L,R";
            // using in strategy
            _this.placementType = styleJson["shield-placement-type"] ? styleJson["shield-placement-type"] : "default";
            _this.size = styleJson["shield-size"];
            // using in strategy
            _this.spacing = styleJson["shield-spacing"] !== undefined ? styleJson["shield-spacing"] : 10;
            _this.textFormat = styleJson["shield-text-format"];
            _this.wrap = styleJson["shield-wrap-before"] ? true : styleJson["shield-wrap-before"];
            _this.wrapWidth = styleJson["shield-wrap-width"];
        }
        return _this;
    }
    GeoShieldStyle.prototype.initializeCore = function () {
        var font;
        var size;
        this.textStyle = new ol.style.Text({
            stroke: new ol.style.Stroke()
        });
        if (this.textAligns.indexOf(this.align) >= 0) {
            this.textStyle.setTextAlign(this.align);
        }
        if (this.font) {
            this.textStyle.setFont(this.font ? this.font : "10px sans-serif");
        }
        if (this.fill) {
            this.textStyle.getFill().setColor(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.fill, this.opacity));
        }
        if (this.haloFill) {
            this.textStyle.getStroke().setColor(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.haloFill, this.opacity));
        }
        if (this.haloRadius) {
            this.textStyle.getStroke().setWidth(this.haloRadius);
        }
        if (this.orientation) {
            this.textStyle.setRotation(this.orientation);
        }
        if (this.iconColor) {
            this.convertSymbolColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.iconColor);
        }
        if (this.iconOutlineColor) {
            this.convertSymbolOutlineColor = __WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */].toRGBAColor(this.iconOutlineColor);
        }
        this.style = new ol.style.Style({
            text: this.textStyle
        });
        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = 0; i < chars.length; i++) {
            this.charWidths[chars[i]] = ol.render.canvas.measureTextWidth(this.font, chars[i]);
        }
        this.charWidths[" "] = ol.render.canvas.measureTextWidth(this.font, " ");
        for (var i = 0; i <= 9; i++) {
            this.charWidths[i] = ol.render.canvas.measureTextWidth(this.font, i);
        }
        switch (this.iconType) {
            case "image":
            case "Image":
                this.setShiledImageIcon();
                break;
            case "symbol":
            case "Symbol":
                this.setShieldSymbolIcon();
                break;
        }
    };
    GeoShieldStyle.prototype.getConvertedStyleCore = function (feature, resolution, options) {
        var featureText = "";
        if (this.name) {
            featureText = feature.get(this.name);
        }
        featureText = this.formatText(featureText);
        if (featureText === undefined || featureText === "") {
            return;
        }
        this.textStyle.setText(featureText);
        var labelInfo = this.labelInfos[featureText];
        if (!labelInfo) {
            labelInfo = this.getLabelInfo(featureText);
            this.labelInfos[featureText] = labelInfo;
        }
        var flatCoordinates = this.setLabelPosition(feature, resolution, labelInfo, options.strategyTree, options.frameState);
        if (flatCoordinates === undefined || flatCoordinates.length < 2) {
            return;
        }
        this.style.setGeometry(new ol.geom.Point(flatCoordinates, "XY"));
        var labelimage = this.getImage(labelInfo);
        this.textStyle.label = labelimage;
        this.textStyle.labelPosition = flatCoordinates;
        if (this.imageCache[featureText] === undefined) {
            this.imageCache[featureText] = [];
        }
        var featureZindex = feature["tempTreeZindex"];
        if (featureZindex === undefined) {
            featureZindex = 0;
        }
        this.style.setZIndex(featureZindex);
        return [this.style];
    };
    GeoShieldStyle.prototype.setShieldSymbolIcon = function () {
        if (this.iconSymbolType !== undefined) {
            switch (this.iconSymbolType) {
                case "circle":
                    this.setCircleIcon();
                    break;
                case "square":
                    this.setSquareIcon();
                    break;
                case "triangle":
                    this.setTriangleIcon();
                    break;
                case "cross":
                    this.setCrossIcon();
                    break;
                case "star":
                    this.setStarIcon();
                    break;
            }
            this.style.setImage(this.image);
        }
    };
    GeoShieldStyle.prototype.setStarIcon = function () {
        var fill = undefined;
        var stroke = undefined;
        var radius = this.iconSize * 0.5;
        if (this.iconColor) {
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }
        this.image = new ol.style.RegularShape({
            fill: fill,
            stroke: stroke,
            points: 5,
            radius: radius,
            radius2: radius / 2.5,
            angle: this.angle
        });
    };
    GeoShieldStyle.prototype.setCrossIcon = function () {
        var fill = undefined;
        var stroke = undefined;
        var radius = this.iconSize * 0.5;
        if (this.iconColor) {
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }
        this.image = new ol.style.RegularShape({
            fill: fill,
            stroke: stroke,
            points: 4,
            radius: radius,
            radius2: 0,
            angle: this.angle
        });
    };
    GeoShieldStyle.prototype.setTriangleIcon = function () {
        var fill = undefined;
        var stroke = undefined;
        var radius = this.iconSize * 0.5;
        if (this.iconColor) {
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }
        this.image = new ol.style.RegularShape({
            fill: fill,
            stroke: stroke,
            points: 3,
            radius: radius,
            angle: this.angle
        });
    };
    GeoShieldStyle.prototype.setSquareIcon = function () {
        var fill = undefined;
        var stroke = undefined;
        var radius = this.iconSize * 0.5;
        if (this.iconColor) {
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }
        this.image = new ol.style.RegularShape({
            fill: fill,
            stroke: stroke,
            points: 4,
            radius: radius,
            angle: Math.PI / 4 + this.angle
        });
    };
    GeoShieldStyle.prototype.setCircleIcon = function () {
        var fill = undefined;
        var stroke = undefined;
        var radius = this.iconSize * 0.5;
        if (this.iconColor) {
            fill = new ol.style.Fill(({ color: this.convertSymbolColor }));
        }
        if (this.iconOutlineColor || this.iconOutlineWidth) {
            stroke = new ol.style.Stroke(({
                color: this.convertSymbolOutlineColor,
                width: this.iconOutlineWidth
            }));
        }
        this.image = new ol.style.Circle({
            fill: fill,
            stroke: stroke,
            radius: radius
        });
    };
    GeoShieldStyle.prototype.setShiledImageIcon = function () {
        if (this.iconSrc !== undefined) {
            var poiImg = GeoShieldStyle.poiCache[this.iconSrc];
            if (poiImg.complete) {
                if (poiImg.naturalWidth !== 0) {
                    this.image = new ol.style.Icon({
                        img: poiImg,
                        imgSize: [poiImg.width, poiImg.height],
                        rotation: this.angle * Math.PI / 180
                    });
                    this.style.setImage(this.image);
                }
            }
        }
    };
    GeoShieldStyle.prototype.getLabelInfo = function (text) {
        var font = this.formatFont(this.textStyle.getFont());
        text = this.wrapText(text, font);
        var fillState = this.textStyle.getFill();
        var strokeState = this.textStyle.getStroke();
        var pixelRatio = window.devicePixelRatio;
        var scale = this.textStyle.getScale();
        scale = (scale ? scale : 1) * pixelRatio;
        var align = ol.render.replay.TEXT_ALIGN[this.textStyle.getTextAlign() || ol.render.canvas.defaultTextAlign];
        var strokeWidth = strokeState && strokeState.getWidth() ? strokeState.getWidth() : 0;
        var lines = text.split("\n");
        var numLines = lines.length;
        var widths = [];
        // let width = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, lines, widths);
        var width = this.getEstimatedWidth(font, lines, widths);
        var renderWidth = width + strokeWidth;
        var lineHeight = ol.render.canvas.measureTextHeight(font);
        var height = lineHeight * numLines;
        if (this.dx) {
            this.textStyle.setOffsetX(this.dx + height / 2);
        }
        if (this.dy) {
            this.textStyle.setOffsetY(this.dy + height / 2);
        }
        var labelWidth = Math.ceil(renderWidth * scale);
        var labelHeight = Math.ceil((height + strokeWidth) * scale);
        var labelInfo = {
            width: labelWidth,
            height: labelHeight,
            scale: scale,
            numLines: numLines,
            lines: lines,
            widths: widths,
            lineHeight: lineHeight,
            font: font
        };
        return labelInfo;
    };
    GeoShieldStyle.prototype.setLabelPosition = function (geometry, resolution, labelInfo, strategyTree, frameState) {
        var geometryType = geometry.getType();
        var flatCoordinates;
        var i, ii;
        var Constructor;
        if (this.placementType === "default") {
            Constructor = this.BATCH_CONSTRUCTORS_DEFAULT[geometryType];
        }
        else if (this.placementType === "detect") {
            Constructor = this.BATCH_CONSTRUCTORS_DETECT[geometryType];
        }
        var textLabelingStrategy = new Constructor();
        var width = labelInfo.width;
        var height = labelInfo.height;
        switch (geometryType) {
            case ol.geom.GeometryType.POINT:
            case ol.geom.GeometryType.MULTI_POINT:
                flatCoordinates = geometry.getFlatCoordinates();
                break;
            case ol.geom.GeometryType.LINE_STRING:
                flatCoordinates = /** @type {ol.geom.LineString} */ (geometry).getFlatMidpoint();
                break;
            case ol.geom.GeometryType.CIRCLE:
                flatCoordinates = /** @type {ol.geom.Circle} */ (geometry).getCenter();
                break;
            case ol.geom.GeometryType.MULTI_LINE_STRING:
                flatCoordinates = /** @type {ol.geom.MultiLineString} */ (geometry).getFlatMidpoints();
                break;
            case ol.geom.GeometryType.POLYGON:
                flatCoordinates = /** @type {ol.geom.Polygon} */ (geometry).getFlatInteriorPoint();
                break;
            case ol.geom.GeometryType.MULTI_POLYGON:
                var interiorPoints = /** @type {ol.geom.MultiPolygon} */ (geometry).getFlatInteriorPoints();
                flatCoordinates = [];
                for (i = 0, ii = interiorPoints.length; i < ii; i += 3) {
                    if (this.textStyle.overflow || interiorPoints[i + 2] / resolution >= width) {
                        flatCoordinates.push(interiorPoints[i], interiorPoints[i + 1]);
                    }
                }
                break;
            default:
        }
        flatCoordinates = textLabelingStrategy.markLocation(flatCoordinates, width, height, resolution, geometryType, this, strategyTree, frameState);
        return flatCoordinates;
    };
    GeoShieldStyle.prototype.getEstimatedWidth = function (font, lines, widths) {
        var numLines = lines.length;
        var width = 0;
        var currentWidth, i;
        for (i = 0; i < numLines; ++i) {
            currentWidth = 0;
            for (var j = 0; j < lines[i].length; j++) {
                var charWidth = this.charWidths[lines[i][j]];
                if (charWidth) {
                    currentWidth += charWidth;
                }
                else {
                    currentWidth += this.charWidths["W"];
                }
            }
            width = Math.max(width, currentWidth);
            widths.push(currentWidth);
        }
        return width;
    };
    GeoShieldStyle.prototype.getImage = function (labelInfo) {
        if (labelInfo.label === undefined) {
            var context = ol.dom.createCanvasContext2D(labelInfo.width, labelInfo.height);
            var label = context.canvas;
            if (labelInfo.scale !== 1) {
                context.scale(labelInfo.scale, labelInfo.scale);
            }
            context.font = labelInfo.font;
            var strokeState = this.textStyle.getStroke();
            var strokeWidth = strokeState && strokeState.getWidth() ? strokeState.getWidth() : 0;
            var fillState = this.textStyle.getFill();
            if (strokeState) {
                context.strokeStyle = strokeState.getColor() ? strokeState.getColor() : "Transparent";
                context.lineWidth = strokeWidth * (ol.has.SAFARI ? labelInfo.scale : 1);
                context.lineCap = strokeState.getLineCap();
                context.lineJoin = strokeState.getLineJoin();
                context.miterLimit = strokeState.getMiterLimit();
                var lineDash = strokeState.getLineDash();
                lineDash = lineDash ? lineDash.slice() : ol.render.canvas.defaultLineDash;
                if (ol.has.CANVAS_LINE_DASH && lineDash.length) {
                    context.setLineDash(strokeState.getLineDash());
                    context.lineDashOffset = strokeState.getLineDashOffset();
                }
            }
            if (fillState) {
                context.fillStyle = fillState.getColor();
            }
            context.textBaseline = "middle";
            context.textAlign = "center";
            var align = ol.render.replay.TEXT_ALIGN[this.textStyle.getTextAlign() || ol.render.canvas.defaultTextAlign];
            var leftRight = (0.5 - align);
            var x = align * label.width / labelInfo.scale + leftRight * strokeWidth;
            var i = void 0;
            if (strokeState) {
                for (i = 0; i < labelInfo.numLines; ++i) {
                    context.strokeText(labelInfo.lines[i], x + leftRight * labelInfo.widths[i], 0.5 * (strokeWidth + labelInfo.lineHeight) + i * labelInfo.lineHeight);
                }
            }
            if (fillState) {
                for (i = 0; i < labelInfo.numLines; ++i) {
                    context.fillText(labelInfo.lines[i], x + leftRight * labelInfo.widths[i], 0.5 * (strokeWidth + labelInfo.lineHeight) + i * labelInfo.lineHeight);
                }
            }
            labelInfo["label"] = label;
        }
        return labelInfo["label"];
    };
    GeoShieldStyle.prototype.formatText = function (featureText) {
        if (this.numericFormat) {
            featureText = this.getTextWithNumericFormat(featureText);
        }
        if (this.dateFormat) {
            featureText = this.getTextWithDateFormat(featureText);
        }
        if (this.textFormat) {
            featureText = this.getTextWithFormat(featureText);
        }
        return featureText;
    };
    GeoShieldStyle.prototype.getTextWithNumericFormat = function (featureText) {
        var tmpArguments = this.numericFormat.split(",");
        var numericFormatOptions = {};
        for (var _i = 0, tmpArguments_1 = tmpArguments; _i < tmpArguments_1.length; _i++) {
            var tmpArgument = tmpArguments_1[_i];
            var keyValuePair = tmpArgument.split(":");
            switch (keyValuePair[0].trim()) {
                case "localeMatcher":
                    numericFormatOptions.localeMatcher = keyValuePair[1].trim();
                    break;
                case "style":
                    numericFormatOptions.style = keyValuePair[1].trim();
                    break;
                case "currency":
                    numericFormatOptions.currency = keyValuePair[1].trim();
                    break;
                case "currencyDisplay":
                    numericFormatOptions.currencyDisplay = keyValuePair[1].trim();
                    break;
                case "useGrouping":
                    numericFormatOptions.useGrouping = keyValuePair[1].trim();
                    break;
                case "minimumIntegerDigits":
                    numericFormatOptions.minimumIntegerDigits = keyValuePair[1].trim();
                    break;
                case "minimumFractionDigits":
                    numericFormatOptions.minimumFractionDigits = keyValuePair[1].trim();
                    break;
                case "maximumFractionDigits":
                    numericFormatOptions.maximumFractionDigits = keyValuePair[1].trim();
                    break;
                case "minimumSignificantDigits":
                    numericFormatOptions.minimumSignificantDigits = keyValuePair[1].trim();
                    break;
                case "maximumSignificantDigits":
                    numericFormatOptions.maximumSignificantDigits = keyValuePair[1].trim();
                    break;
            }
        }
        var numeric = new Intl.NumberFormat(tmpArguments[0], numericFormatOptions);
        return numeric.format(Number(featureText));
    };
    GeoShieldStyle.prototype.getTextWithDateFormat = function (featureText) {
        return (new Date(featureText)).format(this.dateFormat);
    };
    GeoShieldStyle.prototype.getTextWithFormat = function (featureText) {
        return String.format(featureText, this.textFormat);
    };
    GeoShieldStyle.prototype.getPointGeometry = function (feature) {
        return feature.getGeometry();
    };
    GeoShieldStyle.prototype.wrapText = function (text, font) {
        var resultText;
        if (text !== "") {
            var lines = [text];
            var widths = [];
            // let width = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, lines, widths);
            var width = this.getEstimatedWidth(font, lines, widths);
            var wrapWidth = this.wrapWidth;
            var wrapCharacter = " ";
            var isWrapBefore = this.wrap;
            if (wrapWidth > 0 && width > wrapWidth && text.includes(wrapCharacter)) {
                var textLines = [];
                lines = text.split(wrapCharacter);
                var wrapLines = [];
                var wrapWidthSum = 0;
                var tmpWrapWidth = void 0;
                if (isWrapBefore) {
                    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        var line = lines_1[_i];
                        var tmpLine = [line];
                        // tmpWrapWidth = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, tmpLine, widths);
                        tmpWrapWidth = this.getEstimatedWidth(font, tmpLine, widths);
                        wrapWidthSum += tmpWrapWidth;
                        if (tmpWrapWidth > wrapWidth) {
                            wrapLines = [];
                            textLines = [];
                            wrapWidthSum = 0;
                            break;
                        }
                        if (wrapLines.length > 0) {
                            if (wrapWidthSum > wrapWidth) {
                                wrapLines.push("\n");
                                textLines.push(wrapLines.join(""));
                                wrapLines = [];
                                wrapWidthSum = 0;
                            }
                        }
                        wrapLines.push(" " + line);
                    }
                    if (wrapLines.length > 0) {
                        textLines.push(wrapLines.join(""));
                    }
                }
                else {
                    for (var _a = 0, lines_2 = lines; _a < lines_2.length; _a++) {
                        var line = lines_2[_a];
                        wrapLines.push(" " + line);
                        var tmpLine = [line];
                        // tmpWrapWidth = (<any>ol.render.canvas).TextReplay.measureTextWidths(font, tmpLine, widths);
                        tmpWrapWidth = this.getEstimatedWidth(font, tmpLine, widths);
                        wrapWidthSum += tmpWrapWidth;
                        if (wrapWidthSum > wrapWidth) {
                            wrapLines.push("\n");
                            textLines.push(wrapLines.join(""));
                            wrapLines = [];
                            wrapWidthSum = 0;
                        }
                    }
                    if (wrapLines.length > 0) {
                        textLines.push(wrapLines.join(""));
                    }
                }
                resultText = textLines.join("");
                if (resultText.lastIndexOf("\n") === resultText.length - 1) {
                    resultText = resultText.substr(0, resultText.length - 1);
                }
            }
            else {
                resultText = text;
            }
        }
        return resultText;
    };
    GeoShieldStyle.prototype.formatFont = function (font) {
        var tmpFonts = font.split(" ");
        var formatedFont = [];
        if (tmpFonts[tmpFonts.length - 1].includes("bold") || tmpFonts[tmpFonts.length - 1].includes("italic")) {
            formatedFont.push(tmpFonts[tmpFonts.length - 1] + " ");
            for (var i = 0; i < tmpFonts.length - 1; i++) {
                formatedFont.push(tmpFonts[i] + " ");
            }
        }
        else {
            return font;
        }
        return formatedFont.join("").trim();
    };
    GeoShieldStyle.poiCache = [];
    return GeoShieldStyle;
}(__WEBPACK_IMPORTED_MODULE_0__geoStyle__["a" /* GeoStyle */]));



/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GeoVectorTileLayerRender; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__replayGroupCustom__ = __webpack_require__(26);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var GeoVectorTileLayerRender = /** @class */ (function (_super) {
    __extends(GeoVectorTileLayerRender, _super);
    function GeoVectorTileLayerRender(layer) {
        var _this = _super.call(this, layer) || this;
        _this.VECTOR_REPLAYS_CUSTOM = {
            "image": [ol.render.ReplayType.DEFAULT],
            "hybrid": [ol.render.ReplayType.IMAGE, ol.render.ReplayType.TEXT, ol.render.ReplayType.DEFAULT],
            "vector": ol.render.replay.ORDER
        };
        _this.VECTOR_REPLAYS = _this.VECTOR_REPLAYS_CUSTOM;
        _this.prepareFrame = _this.prepareFrameCustom;
        _this.renderTileImage_ = _this.renderTileImageCustom;
        return _this;
    }
    GeoVectorTileLayerRender.prototype.tileLayerPrepareFrameCustom = function (frameState, layerState) {
        var pixelRatio = frameState.pixelRatio;
        var size = frameState.size;
        var viewState = frameState.viewState;
        var projection = viewState.projection;
        var viewResolution = viewState.resolution;
        var viewCenter = viewState.center;
        var tileLayer = this.getLayer();
        var tileSource = /** @type {ol.source.Tile} */ (tileLayer.getSource());
        var sourceRevision = tileSource.getRevision();
        var tileGrid = tileSource.getTileGridForProjection(projection);
        var z = tileGrid.getZForResolution(viewResolution, this.zDirection);
        var tileResolution = tileGrid.getResolution(z);
        var oversampling = Math.round(viewResolution / tileResolution) || 1;
        var extent = frameState.extent;
        if (layerState.extent !== undefined) {
            extent = ol.extent.getIntersection(extent, layerState.extent);
        }
        if (ol.extent.isEmpty(extent)) {
            // Return false to prevent the rendering of the layer.
            return false;
        }
        var tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z);
        // Adjust tile cache size according to tile Range, TODO: add a property for that
        var xOffset = (tileRange.maxX - tileRange.minX);
        var yOffset = (tileRange.maxY - tileRange.minY);
        xOffset = xOffset <= 0 ? 1 : xOffset * 2 + 3;
        yOffset = yOffset <= 0 ? 1 : yOffset * 2 + 3;
        var cacheSize = xOffset * yOffset;
        tileSource.tileCache.highWaterMark = cacheSize <= 15 ? 15 : cacheSize;
        //// Adjust vectorTileData cache size according to the tile Range in data max zoom. it will pass 
        var dataTileRand = tileGrid.getTileRangeForExtentAndZ(extent, tileSource.maxDataZoom);
        var offsetX = dataTileRand.maxX - dataTileRand.minX;
        var offsetY = dataTileRand.maxY - dataTileRand.minY;
        offsetX = offsetX <= 0 ? 1 : offsetX + 3;
        offsetY = offsetY <= 0 ? 1 : offsetY + 3;
        var vectorTileDataCahceSize = offsetX * offsetY;
        tileSource["vectorTileDataCahceSize"] = vectorTileDataCahceSize;
        tileSource.getGeoFormat()["vectorTileDataCahceSize"] = vectorTileDataCahceSize;
        var imageExtent = tileGrid.getTileRangeExtent(z, tileRange);
        var tilePixelRatio = tileSource.getTilePixelRatio(pixelRatio);
        /**
         * @type {Object.<number, Object.<string, ol.Tile>>}
         */
        var tilesToDrawByZ = {};
        tilesToDrawByZ[z] = {};
        var findLoadedTiles = this.createLoadedTileFinder(tileSource, projection, tilesToDrawByZ);
        var tmpExtent = this.tmpExtent;
        var tmpTileRange = this.tmpTileRange_;
        var newTiles = false;
        var tile, x, y;
        for (x = tileRange.minX; x <= tileRange.maxX; ++x) {
            for (y = tileRange.minY; y <= tileRange.maxY; ++y) {
                tile = tileSource.getTile(z, x, y, pixelRatio, projection);
                // FIXME Eric
                tile.tileRange = tileRange;
                if (tile.getState() === ol.TileState.ERROR) {
                    if (!tileLayer.getUseInterimTilesOnError()) {
                        // When useInterimTilesOnError is false, we consider the error tile as loaded.
                        tile.setState(ol.TileState.LOADED);
                    }
                    else if (tileLayer.getPreload() > 0) {
                        // Preloaded tiles for lower resolutions might have finished loading.
                        newTiles = true;
                    }
                }
                if (!this.isDrawableTile_(tile)) {
                    tile = tile.getInterimTile();
                }
                if (this.isDrawableTile_(tile)) {
                    var uid = ol.getUid(this);
                    if (tile.getState() === ol.TileState.LOADED) {
                        tilesToDrawByZ[z][tile.tileCoord.toString()] = tile;
                        var inTransition = tile.inTransition(uid);
                        if (!newTiles && (inTransition || this.renderedTiles.indexOf(tile) === -1)) {
                            newTiles = true;
                        }
                    }
                    if (tile.getAlpha(uid, frameState.time) === 1) {
                        // don't look for alt tiles if alpha is 1
                        continue;
                    }
                }
                var childTileRange = tileGrid.getTileCoordChildTileRange(tile.tileCoord, tmpTileRange, tmpExtent);
                var covered = false;
                if (childTileRange) {
                    covered = findLoadedTiles(z + 1, childTileRange);
                }
                if (!covered) {
                    tileGrid.forEachTileCoordParentTileRange(tile.tileCoord, findLoadedTiles, null, tmpTileRange, tmpExtent);
                }
            }
        }
        var renderedResolution = tileResolution * pixelRatio / tilePixelRatio * oversampling;
        var hints = frameState.viewHints;
        var animatingOrInteracting = hints[ol.ViewHint.ANIMATING] || hints[ol.ViewHint.INTERACTING];
        if (!(this.renderedResolution && Date.now() - frameState.time > 16 && animatingOrInteracting) && (newTiles ||
            !(this.renderedExtent_ && ol.extent.containsExtent(this.renderedExtent_, extent)) ||
            this.renderedRevision !== sourceRevision ||
            oversampling !== this.oversampling_ ||
            !animatingOrInteracting && renderedResolution !== this.renderedResolution)) {
            var context = this.context;
            if (context) {
                var tilePixelSize = tileSource.getTilePixelSize(z, pixelRatio, projection);
                var width = Math.round(tileRange.getWidth() * tilePixelSize[0] / oversampling);
                var height = Math.round(tileRange.getHeight() * tilePixelSize[1] / oversampling);
                var canvas = context.canvas;
                if (canvas.width !== width || canvas.height !== height) {
                    this.oversampling_ = oversampling;
                    canvas.width = width;
                    canvas.height = height;
                }
                else {
                    if (this.renderedExtent_ && !ol.extent.equals(imageExtent, this.renderedExtent_)) {
                        context.clearRect(0, 0, width, height);
                    }
                    oversampling = this.oversampling_;
                }
            }
            this.renderedTiles.length = 0;
            /** @type {Array.<number>} */
            var zs = Object.keys(tilesToDrawByZ).map(Number);
            zs.sort(function (a, b) {
                if (a === z) {
                    return 1;
                }
                else if (b === z) {
                    return -1;
                }
                else {
                    return a > b ? 1 : a < b ? -1 : 0;
                }
            });
            var currentResolution = void 0, currentScale = void 0, currentTilePixelSize = void 0, currentZ = void 0, i = void 0, ii = void 0;
            var tileExtent = void 0, tileGutter = void 0, tilesToDraw = void 0, w = void 0, h = void 0;
            for (i = 0, ii = zs.length; i < ii; ++i) {
                currentZ = zs[i];
                currentTilePixelSize = tileSource.getTilePixelSize(currentZ, pixelRatio, projection);
                currentResolution = tileGrid.getResolution(currentZ);
                currentScale = currentResolution / tileResolution;
                tileGutter = tilePixelRatio * tileSource.getGutter(projection);
                tilesToDraw = tilesToDrawByZ[currentZ];
                for (var tileCoordKey in tilesToDraw) {
                    tile = tilesToDraw[tileCoordKey];
                    tileExtent = tileGrid.getTileCoordExtent(tile.getTileCoord(), tmpExtent);
                    x = (tileExtent[0] - imageExtent[0]) / tileResolution * tilePixelRatio / oversampling;
                    y = (imageExtent[3] - tileExtent[3]) / tileResolution * tilePixelRatio / oversampling;
                    w = currentTilePixelSize[0] * currentScale / oversampling;
                    h = currentTilePixelSize[1] * currentScale / oversampling;
                    this.drawTileImage(tile, frameState, layerState, x, y, w, h, tileGutter, z === currentZ);
                    this.renderedTiles.push(tile);
                }
            }
            this.renderedRevision = sourceRevision;
            this.renderedResolution = tileResolution * pixelRatio / tilePixelRatio * oversampling;
            this.renderedExtent_ = imageExtent;
        }
        var scale = this.renderedResolution / viewResolution;
        var transform = ol.transform.compose(this.imageTransform_, pixelRatio * size[0] / 2, pixelRatio * size[1] / 2, scale, scale, 0, (this.renderedExtent_[0] - viewCenter[0]) / this.renderedResolution * pixelRatio, (viewCenter[1] - this.renderedExtent_[3]) / this.renderedResolution * pixelRatio);
        ol.transform.compose(this.coordinateToCanvasPixelTransform, pixelRatio * size[0] / 2 - transform[4], pixelRatio * size[1] / 2 - transform[5], pixelRatio / viewResolution, -pixelRatio / viewResolution, 0, -viewCenter[0], -viewCenter[1]);
        this.updateUsedTiles(frameState.usedTiles, tileSource, z, tileRange);
        this.manageTilePyramid(frameState, tileSource, tileGrid, pixelRatio, projection, extent, z, tileLayer.getPreload());
        this.scheduleExpireCache(frameState, tileSource);
        this.updateLogos(frameState, tileSource);
        return this.renderedTiles.length > 0;
    };
    // public manageTilePyramidCustom = function (
    //     frameState, tileSource, tileGrid, pixelRatio, projection, extent,
    //     currentZ, preload, opt_tileCallback, opt_this) {
    //     var tileSourceKey = (<any>ol).getUid(tileSource).toString();
    //     if (!(tileSourceKey in frameState.wantedTiles)) {
    //         frameState.wantedTiles[tileSourceKey] = {};
    //     }
    //     var wantedTiles = frameState.wantedTiles[tileSourceKey];
    //     var tileQueue = frameState.tileQueue;
    //     var minZoom = tileGrid.getMinZoom();
    //     var tile, tileRange, tileResolution, x, y, z;
    //     for (z = minZoom; z <= currentZ; ++z) {
    //         tileRange = tileGrid.getTileRangeForExtentAndZ(extent, z, tileRange);
    //         tileResolution = tileGrid.getResolution(z);
    //         for (x = tileRange.minX; x <= tileRange.maxX; ++x) {
    //             for (y = tileRange.minY; y <= tileRange.maxY; ++y) {
    //                 if (currentZ - z <= preload) {
    //                     tile = tileSource.getTile(z, x, y, pixelRatio, projection);
    //                     // FIXME Eric
    //                     if (tile.getState() == (<any>ol).TileState.IDLE || tile.getState() == (<any>ol).TileState.CANCEL) {
    //                         wantedTiles[tile.getKey()] = true;
    //                         if (!tileQueue.isKeyQueued(tile.getKey())) {
    //                             tileQueue.enqueue([tile, tileSourceKey,
    //                                 tileGrid.getTileCoordCenter(tile.tileCoord), tileResolution]);
    //                         }
    //                     }
    //                     if (opt_tileCallback !== undefined) {
    //                         opt_tileCallback.call(opt_this, tile);
    //                     }
    //                 } else {
    //                     tileSource.useTile(z, x, y, projection);
    //                 }
    //             }
    //         }
    //     }
    // };
    GeoVectorTileLayerRender.prototype.prepareFrameCustom = function (frameState, layerState) {
        var layer = this.getLayer();
        var layerRevision = layer.getRevision();
        if (this.renderedLayerRevision_ !== layerRevision) {
            this.renderedTiles.length = 0;
            var renderMode = layer.getRenderMode();
            if (!this.context && renderMode !== ol.layer.VectorTileRenderType.VECTOR) {
                this.context = ol.dom.createCanvasContext2D();
            }
            if (this.context && renderMode === ol.layer.VectorTileRenderType.VECTOR) {
                this.context = null;
            }
        }
        this.renderedLayerRevision_ = layerRevision;
        return this.tileLayerPrepareFrameCustom.apply(this, arguments);
    };
    GeoVectorTileLayerRender.prototype.postCompose = function (context, frameState, layerState) {
        var layer = this.getLayer();
        var declutterReplays = layer.getDeclutter() ? {} : null;
        var source = /** @type {ol.source.VectorTile} */ (layer.getSource());
        var renderMode = layer.getRenderMode();
        var replayTypes = this.VECTOR_REPLAYS_CUSTOM[renderMode];
        var pixelRatio = frameState.pixelRatio;
        var rotation = frameState.viewState.rotation;
        var size = frameState.size;
        var offsetX, offsetY;
        if (rotation) {
            offsetX = Math.round(pixelRatio * size[0] / 2);
            offsetY = Math.round(pixelRatio * size[1] / 2);
            ol.render.canvas.rotateAtOffset(context, -rotation, offsetX, offsetY);
        }
        if (declutterReplays) {
            this.declutterTree_.clear();
        }
        var tiles = this.renderedTiles;
        var tileGrid = source.getTileGridForProjection(frameState.viewState.projection);
        var clips = [];
        var zs = [];
        for (var i = tiles.length - 1; i >= 0; --i) {
            var tile = /** @type {ol.VectorImageTile} */ (tiles[i]);
            if (tile.getState() === ol.TileState.ABORT) {
                continue;
            }
            var tileCoord = tile.tileCoord;
            var worldOffset = tileGrid.getTileCoordExtent(tileCoord)[0] -
                tileGrid.getTileCoordExtent(tile.wrappedTileCoord)[0];
            var transform = undefined;
            for (var t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
                var sourceTile = tile.getTile(tile.tileKeys[t]);
                if (sourceTile.getState() === ol.TileState.ERROR) {
                    continue;
                }
                //// reuse replayGroup of source Tile to reduce the memory.
                // let replayGroup = sourceTile.getReplayGroup(layer, tileCoord.toString());
                var replayGroup = sourceTile.getReplayGroup(layer, sourceTile.tileCoord.toString());
                if (renderMode !== ol.layer.VectorTileRenderType.VECTOR && !replayGroup.hasReplays(replayTypes)) {
                    continue;
                }
                if (!transform) {
                    transform = this.getTransform(frameState, worldOffset);
                }
                var currentZ = sourceTile.tileCoord[0];
                var currentClip = replayGroup.getClipCoords(transform);
                context.save();
                context.globalAlpha = layerState.opacity;
                // Create a clip mask for regions in this low resolution tile that are
                // already filled by a higher resolution tile
                for (var j = 0, jj = clips.length; j < jj; ++j) {
                    var clip = clips[j];
                    if (currentZ < zs[j]) {
                        context.beginPath();
                        // counter-clockwise (outer ring) for current tile
                        context.moveTo(currentClip[0], currentClip[1]);
                        context.lineTo(currentClip[2], currentClip[3]);
                        context.lineTo(currentClip[4], currentClip[5]);
                        context.lineTo(currentClip[6], currentClip[7]);
                        // clockwise (inner ring) for higher resolution tile
                        context.moveTo(clip[6], clip[7]);
                        context.lineTo(clip[4], clip[5]);
                        context.lineTo(clip[2], clip[3]);
                        context.lineTo(clip[0], clip[1]);
                        context.clip();
                    }
                }
                replayGroup.replay(context, transform, rotation, {}, replayTypes, declutterReplays);
                context.restore();
                clips.push(currentClip);
                zs.push(currentZ);
            }
        }
        if (declutterReplays) {
            var hints = frameState.viewHints;
            var animatingOrInteracting = hints[ol.ViewHint.ANIMATING] || hints[ol.ViewHint.INTERACTING];
            delete context["quickZoom"];
            if (animatingOrInteracting) {
                context["quickZoom"] = frameState["quickZoom"];
            }
            context["currentResolution"] = frameState["currentResolution"];
            ol.render.canvas.ReplayGroup.replayDeclutter(declutterReplays, context, rotation);
        }
        if (rotation) {
            ol.render.canvas.rotateAtOffset(context, rotation, 
            /** @type {number} */ (offsetX), /** @type {number} */ (offsetY));
        }
        ol.renderer.canvas.TileLayer.prototype.postCompose.apply(this, arguments);
    };
    GeoVectorTileLayerRender.prototype.createReplayGroup_ = function (tile, frameState) {
        var layer = this.getLayer();
        var pixelRatio = frameState.pixelRatio;
        var projection = frameState.viewState.projection;
        var revision = layer.getRevision();
        var renderOrder = /** @type {ol.RenderOrderFunction} */ (layer.getRenderOrder()) || null;
        var replayState = tile.getReplayState(layer);
        if (!replayState.dirty && replayState.renderedRevision === revision &&
            replayState.renderedRenderOrder === renderOrder) {
            return;
        }
        var source = /** @type {ol.source.VectorTile} */ (layer.getSource());
        var sourceTileGrid = source.getTileGrid();
        var tileGrid = source.getTileGridForProjection(projection);
        var resolution = tileGrid.getResolution(tile.tileCoord[0]);
        var tileExtent = tileGrid.getTileCoordExtent(tile.wrappedTileCoord);
        var zIndexKeys = {};
        var _loop_1 = function (t, tt) {
            var sourceTile = tile.getTile(tile.tileKeys[t]);
            if (sourceTile.getState() === ol.TileState.ERROR) {
                return "continue";
            }
            var sourceTileCoord = sourceTile.requestTileCoord;
            var sourceTileExtent = sourceTileGrid.getTileCoordExtent(sourceTileCoord);
            var sharedExtent = ol.extent.getIntersection(tileExtent, sourceTileExtent);
            var bufferedExtent = ol.extent.equals(sourceTileExtent, sharedExtent) ? null :
                ol.extent.buffer(sharedExtent, layer.getRenderBuffer() * resolution);
            var tileProjection = sourceTile.getProjection();
            var reproject = true;
            replayState.dirty = false;
            //// reuse replayGroup of source Tile to reduce the memory.
            var distReplayGroup = sourceTile.getReplayGroup(layer, tile.wrappedTileCoord.toString());
            if (distReplayGroup) {
                // Check replayGroup has  replays
                var replaysZindexCount = 0;
                if (distReplayGroup.replaysByZIndex_) {
                    for (var zindex in distReplayGroup.replaysByZIndex_) {
                        replaysZindexCount++;
                    }
                }
                if (source.isMultithread && replaysZindexCount === 0) {
                    // the replays did not created, it will create after web worker call back
                    if (sourceTile)
                        if (sourceTile["reuseVectorImageTile"] === undefined) {
                            sourceTile["reuseVectorImageTile"] = [];
                        }
                    sourceTile["reuseVectorImageTile"].push(tile);
                }
                else {
                    replayState.renderedRevision = revision;
                    replayState.renderedRenderOrder = renderOrder;
                    replayState.renderedTileLoaded = true;
                }
            }
            else {
                var replayGroup_1 = new __WEBPACK_IMPORTED_MODULE_0__replayGroupCustom__["a" /* ReplayGroupCustom */](0, sharedExtent, resolution, pixelRatio, source.getOverlaps(), this_1.declutterTree_, layer.getRenderBuffer());
                var squaredTolerance_1 = ol.renderer.vector.getSquaredTolerance(resolution, pixelRatio);
                var strategyTree_1 = ol.ext.rbush(9);
                /**
                 * @param {ol.Feature|ol.render.Feature} feature Feature.
                 * @this {ol.renderer.canvas.VectorTileLayer}
                 */
                var renderFeature_1 = function (feature, geoStyles, options) {
                    var styles;
                    if (geoStyles) {
                        if (geoStyles && geoStyles.length > 0) {
                            for (var i = 0, ii = geoStyles.length; i < ii; i++) {
                                if (geoStyles[i]) {
                                    var ol4Styles = geoStyles[i].getStyles(feature, resolution, options);
                                    if (styles === undefined) {
                                        styles = [];
                                    }
                                    Array.prototype.push.apply(styles, ol4Styles);
                                }
                            }
                        }
                    }
                    else {
                        var styleFunction = feature.getStyleFunction();
                        if (styleFunction) {
                            styles = styleFunction.call(/** @type {ol.Feature} */ (feature), resolution);
                        }
                        else {
                            styleFunction = layer.getStyleFunction();
                            if (styleFunction) {
                                styles = styleFunction(feature, resolution);
                            }
                        }
                    }
                    if (styles) {
                        var dirty = this.renderFeature(feature, squaredTolerance_1, styles, replayGroup_1);
                        this.dirty_ = this.dirty_ || dirty;
                        replayState.dirty = replayState.dirty || dirty;
                    }
                };
                var instructs = void 0;
                var features = void 0;
                if (sourceTile.featuresAndInstructs) {
                    instructs = sourceTile.featuresAndInstructs["instructs"];
                    features = sourceTile.featuresAndInstructs["features"];
                }
                if (source.isMultithread) {
                    var render = this_1;
                    if (tileProjection.getUnits() === ol.proj.Units.TILE_PIXELS) {
                        tileProjection.setWorldExtent(sourceTileExtent);
                        tileProjection.setExtent(sourceTile.getExtent());
                    }
                    var tileProjectionInfo = {};
                    for (var name_1 in tileProjection) {
                        if (typeof tileProjection[name_1] !== "function") {
                            tileProjectionInfo[name_1] = tileProjection[name_1];
                        }
                    }
                    var projectInfo = {};
                    for (var name_2 in projection) {
                        if (typeof projection[name_2] !== "function") {
                            projectInfo[name_2] = projection[name_2];
                        }
                    }
                    var geoStyles_1 = source.getGeoFormat().styleJsonCache.geoStyles;
                    if (features && instructs) {
                        for (var i = 0; i < instructs.length; i++) {
                            var geoStyleId = instructs[i][1];
                            var geoStyle = geoStyles_1[geoStyleId];
                            var featureInfo = features[instructs[i][0]];
                            var feature = new ol.render.Feature(featureInfo.type_, featureInfo.flatCoordinates_, featureInfo.ends_, featureInfo.properties_);
                            if (featureInfo["projected"] === undefined) {
                                if (tileProjection.getUnits() === ol.proj.Units.TILE_PIXELS) {
                                    // projected tile extent
                                    tileProjection.setWorldExtent(sourceTileExtent);
                                    // tile extent in tile pixel space
                                    tileProjection.setExtent(sourceTile.getExtent());
                                }
                                feature.getGeometry().transform(tileProjection, projection);
                                feature.extent_ = null;
                                featureInfo["projected"] = "";
                            }
                            feature["tempTreeZindex"] = instructs[i][2];
                            feature["styleId"] = geoStyleId;
                            renderFeature_1.call(this_1, feature, [geoStyle], { strategyTree: strategyTree_1, frameState: frameState });
                        }
                    }
                    var messageData = [
                        [0, tileExtent, resolution, pixelRatio, source.getOverlaps(), this_1.declutterTree_, layer.getRenderBuffer(), source.getGeoFormat().minimalist],
                        sourceTile.requestTileCoord,
                        sourceTile.tileCoord,
                        tileProjectionInfo,
                        projectInfo,
                        squaredTolerance_1,
                        window.devicePixelRatio,
                        ol.getUid(source.getGeoFormat()),
                        frameState["coordinateToPixelTransform"],
                        source.getGeoFormat().maxDataZoom,
                        source["vectorTileDataCahceSize"]
                    ];
                    rendera = this_1;
                    var callabck = function (messageData) {
                        var replaysByZIndex_ = messageData["replays"];
                        var features = messageData["features"];
                        var instructs = messageData["instructs"];
                        if (features && instructs) {
                            for (var i_1 = 0; i_1 < instructs.length; i_1++) {
                                var geoStyleId = instructs[i_1][1];
                                var geoStyle = geoStyles_1[geoStyleId];
                                var featureInfo = features[instructs[i_1][0]];
                                var feature = new ol.render.Feature(featureInfo.type_, featureInfo.flatCoordinates_, featureInfo.ends_, featureInfo.properties_);
                                feature["tempTreeZindex"] = instructs[i_1][2];
                                feature["styleId"] = geoStyleId;
                                renderFeature_1.call(rendera, feature, [geoStyle], { strategyTree: strategyTree_1, frameState: frameState });
                            }
                        }
                        for (var zindex_1 in replaysByZIndex_) {
                            for (var replayType in replaysByZIndex_[zindex_1]) {
                                var replay = replayGroup_1.getReplayCustom(zindex_1, replayType);
                                var workReplay = replaysByZIndex_[zindex_1][replayType];
                                if (!source.getGeoFormat().minimalist && workReplay.instructions) {
                                    for (var i_2 = 0; i_2 < workReplay.instructions.length; i_2++) {
                                        var instruction = workReplay.instructions[i_2];
                                        if (instruction[0] === ol.render.canvas.Instruction.SET_FILL_STYLE && instruction[1].indexOf("hatch") === 0) {
                                            var hatchInstruction = instruction[1];
                                            var geoStyleId = hatchInstruction.split("|")[1];
                                            var geoStyle = geoStyles_1[geoStyleId];
                                            if (geoStyle) {
                                                geoStyle.initialize();
                                                instruction[1] = geoStyle.geoBrush;
                                            }
                                        }
                                        if (instruction[0] === ol.render.canvas.Instruction.BEGIN_GEOMETRY || instruction[0] === ol.render.canvas.Instruction.END_GEOMETRY) {
                                            var featureInfo = instruction[1];
                                            var feature = new ol.render.Feature(featureInfo.type_, featureInfo.flatCoordinates_, featureInfo.ends_, featureInfo.properties_);
                                            feature["styleId"] = featureInfo.styleId;
                                            instruction[1] = feature;
                                        }
                                    }
                                    for (var i_3 = 0; i_3 < workReplay.hitDetectionInstructions.length; i_3++) {
                                        var hitInstruction = workReplay.hitDetectionInstructions[i_3];
                                        if (hitInstruction[0] === ol.render.canvas.Instruction.SET_FILL_STYLE && hitInstruction[1].indexOf("hatch") === 0) {
                                            var hatchInstruction = hitInstruction[1];
                                            var geoStyleId = hatchInstruction.split("|")[1];
                                            var geoStyle = geoStyles_1[geoStyleId];
                                            if (geoStyle) {
                                                geoStyle.initialize();
                                                hitInstruction[1] = geoStyle.geoBrush;
                                            }
                                        }
                                        if (hitInstruction[0] === ol.render.canvas.Instruction.BEGIN_GEOMETRY || hitInstruction[0] === ol.render.canvas.Instruction.END_GEOMETRY) {
                                            var hitfeatureInfo = hitInstruction[1];
                                            var hitfeature = new ol.render.Feature(hitfeatureInfo.type_, hitfeatureInfo.flatCoordinates_, hitfeatureInfo.ends_, hitfeatureInfo.properties_);
                                            hitfeature["styleId"] = hitfeatureInfo.styleId;
                                            hitInstruction[1] = hitfeature;
                                        }
                                    }
                                }
                                for (var key in workReplay) {
                                    if (key === "pixelCoordinates_") {
                                        replay[key] = new Int32Array(workReplay[key]);
                                    }
                                    else {
                                        replay[key] = workReplay[key];
                                    }
                                }
                            }
                        }
                        for (var r in replayGroup_1.getReplays()) {
                            zIndexKeys[r] = true;
                        }
                        replayState.renderedTileLoaded = true;
                        sourceTile.state = ol.TileState.LOADED;
                        if (sourceTile["reuseVectorImageTile"]) {
                            for (var i = 0; i < sourceTile["reuseVectorImageTile"].length; i++) {
                                var reusedVectorImageTile = sourceTile["reuseVectorImageTile"][i];
                                delete sourceTile["reuseVectorImageTile"][i];
                                var vectorImageTileReplayState = reusedVectorImageTile.getReplayState(layer);
                                vectorImageTileReplayState.renderedRevision = revision;
                                vectorImageTileReplayState.renderedRenderOrder = renderOrder;
                                vectorImageTileReplayState.renderedTileLoaded = true;
                                reusedVectorImageTile.setState(ol.TileState.LOADED);
                            }
                        }
                        tile.setState(ol.TileState.LOADED);
                    };
                    //// reuse replayGroup of source Tile to reduce the memory.
                    sourceTile.setReplayGroup(layer, sourceTile.tileCoord.toString(), replayGroup_1);
                    source.getGeoFormat().workerManager.postMessage(sourceTile.tileCoord + ol.getUid(callabck), "createReplay", messageData, callabck, sourceTile.workerId);
                    replayState.renderedRevision = revision;
                    replayState.renderedTileLoaded = false;
                }
                else {
                    if (instructs && instructs.length > 0) {
                        for (var i = 0; i < instructs.length; i++) {
                            var featureIndex = instructs[i][0];
                            var feature = features[featureIndex];
                            if (feature["projected"] === undefined) {
                                if (reproject) {
                                    if (tileProjection.getUnits() === ol.proj.Units.TILE_PIXELS) {
                                        // projected tile extent
                                        tileProjection.setWorldExtent(sourceTileExtent);
                                        // tile extent in tile pixel space
                                        tileProjection.setExtent(sourceTile.getExtent());
                                    }
                                    feature.getGeometry().transform(tileProjection, projection);
                                    feature.extent_ = null;
                                    feature.getExtent();
                                }
                                feature["projected"] = "";
                            }
                            feature["tempTreeZindex"] = instructs[i][2];
                            renderFeature_1.call(this_1, feature, [instructs[i][1]], { strategyTree: strategyTree_1, frameState: frameState });
                        }
                    }
                    replayGroup_1.finish();
                    for (var r in replayGroup_1.getReplays()) {
                        zIndexKeys[r] = true;
                    }
                    sourceTile.setReplayGroup(layer, sourceTile.tileCoord.toString(), replayGroup_1);
                    replayState.renderedRevision = revision;
                    replayState.renderedRenderOrder = renderOrder;
                    replayState.renderedTileLoaded = true;
                }
            }
        };
        var this_1 = this, rendera;
        for (var t = 0, tt = tile.tileKeys.length; t < tt; ++t) {
            _loop_1(t, tt);
        }
    };
    GeoVectorTileLayerRender.prototype.renderTileImageCustom = function (tile, frameState, layerState) {
        var layer = this.getLayer();
        var replayState = tile.getReplayState(layer);
        var revision = layer.getRevision();
        var replays = ol.renderer.canvas.VectorTileLayer.IMAGE_REPLAYS[layer.getRenderMode()];
        if (replays && replayState.renderedTileLoaded && replayState.renderedTileRevision !== revision) {
            replayState.renderedTileRevision = revision;
            var tileCoord = tile.wrappedTileCoord;
            var z = tileCoord[0];
            var pixelRatio = frameState.pixelRatio;
            var source = /** @type {ol.source.VectorTile} */ (layer.getSource());
            var tileGrid = source.getTileGridForProjection(frameState.viewState.projection);
            var resolution = tileGrid.getResolution(z);
            var context = tile.getContext(layer);
            var size = source.getTilePixelSize(z, pixelRatio, frameState.viewState.projection);
            context.canvas.width = size[0];
            context.canvas.height = size[1];
            var tileExtent = tileGrid.getTileCoordExtent(tileCoord);
            if (layer.background) {
                context.rect(0, 0, size[0], size[1]);
                context.fillStyle = layer.background;
                context.fill();
            }
            for (var i = 0, ii = tile.tileKeys.length; i < ii; ++i) {
                var sourceTile = tile.getTile(tile.tileKeys[i]);
                if (sourceTile.getState() === ol.TileState.ERROR) {
                    continue;
                }
                var pixelScale = pixelRatio / resolution;
                var transform = ol.transform.reset(this.tmpTransform_);
                ol.transform.scale(transform, pixelScale, -pixelScale);
                ol.transform.translate(transform, -tileExtent[0], -tileExtent[3]);
                //// reuse replayGroup of source Tile to reduce the memory.
                var replayGroup = sourceTile.getReplayGroup(layer, tileCoord);
                replayGroup.replay(context, transform, 0, {}, replays);
            }
        }
    };
    GeoVectorTileLayerRender.handles = function (type, layer) {
        return type === ol.renderer.Type.CANVAS && layer.getType() === ol.LayerType.MAPSUITE_VECTORTILE;
    };
    GeoVectorTileLayerRender.create = function (mapRenderer, layer) {
        return new GeoVectorTileLayerRender(layer);
    };
    return GeoVectorTileLayerRender;
}(ol.renderer.canvas.VectorTileLayer));



/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ReplayGroupCustom; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__textReplayCustom__ = __webpack_require__(27);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var ReplayGroupCustom = /** @class */ (function (_super) {
    __extends(ReplayGroupCustom, _super);
    function ReplayGroupCustom(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree, opt_renderBuffer) {
        var _this = _super.call(this, tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree, opt_renderBuffer) || this;
        _this.BATCH_CONSTRUCTORS_CUSTOM = {
            "Circle": ol.render.canvas.PolygonReplay,
            "Default": ol.render.canvas.Replay,
            "Image": ol.render.canvas.ImageReplay,
            "LineString": ol.render.canvas.LineStringReplay,
            "Polygon": ol.render.canvas.PolygonReplay,
            "Text": __WEBPACK_IMPORTED_MODULE_0__textReplayCustom__["a" /* TextReplayCustom */]
        };
        _this.getReplay = _this.getReplayCustom;
        _this.BATCH_CONSTRUCTORS_ = _this.BATCH_CONSTRUCTORS_CUSTOM;
        // this.replay = this.replayCustom;
        _this.forEachFeatureAtCoordinate = _this.forEachFeatureAtCoordinateCustom;
        return _this;
    }
    ReplayGroupCustom.prototype.forEachFeatureAtCoordinateCustom = function (coordinate, resolution, rotation, hitTolerance, skippedFeaturesHash, callback, declutterReplays) {
        hitTolerance = Math.round(hitTolerance);
        var contextSize = hitTolerance * 2 + 1;
        var transform = ol.transform.compose(this.hitDetectionTransform_, hitTolerance + 0.5, hitTolerance + 0.5, 1 / resolution, -1 / resolution, -rotation, -coordinate[0], -coordinate[1]);
        var context = this.hitDetectionContext_;
        if (context.canvas.width !== contextSize || context.canvas.height !== contextSize) {
            context.canvas.width = contextSize;
            context.canvas.height = contextSize;
        }
        else {
            context.clearRect(0, 0, contextSize, contextSize);
        }
        /**
         * @type {ol.Extent}
         */
        var hitExtent;
        if (this.renderBuffer_ !== undefined) {
            hitExtent = ol.extent.createEmpty();
            ol.extent.extendCoordinate(hitExtent, coordinate);
            ol.extent.buffer(hitExtent, resolution * (this.renderBuffer_ + hitTolerance), hitExtent);
        }
        var mask = ol.render.canvas.ReplayGroup.getCircleArray_(hitTolerance);
        var declutteredFeatures;
        // if (this.declutterTree_) {
        //     declutteredFeatures = this.declutterTree_.all().map(function (entry) {
        //         return entry.value;
        //     });
        // }
        /**
         * @param {ol.Feature|ol.render.Feature} feature Feature.
         * @return {?} Callback result.
         */
        function hitDetectionCallback(feature) {
            var imageData = context.getImageData(0, 0, contextSize, contextSize).data;
            for (var i = 0; i < contextSize; i++) {
                for (var j = 0; j < contextSize; j++) {
                    if (mask[i][j]) {
                        if (imageData[(j * contextSize + i) * 4 + 3] > 0) {
                            var result = void 0;
                            if (!declutteredFeatures || declutteredFeatures.indexOf(feature) !== -1) {
                                result = callback(feature);
                            }
                            if (result) {
                                return result;
                            }
                            else {
                                context.clearRect(0, 0, contextSize, contextSize);
                                return undefined;
                            }
                        }
                    }
                }
            }
        }
        return this.replayHitDetection_(context, transform, rotation, skippedFeaturesHash, hitDetectionCallback, hitExtent, declutterReplays);
    };
    ReplayGroupCustom.prototype.replayCustom = function (context, transform, viewRotation, skippedFeaturesHash, opt_replayTypes, opt_declutterReplays) {
        /** @type {Array.<number>} */
        var zs = Object.keys(this.replaysByZIndex_).map(Number);
        zs.sort(ol.array.numberSafeCompareFunction);
        // setup clipping so that the parts of over-simplified geometries are not
        // visible outside the current extent when panning
        context.save();
        this.clip(context, transform);
        var replayTypes = opt_replayTypes ? opt_replayTypes : ol.render.replay.ORDER;
        var i, ii, j, jj, replays, replay;
        for (i = 0, ii = zs.length; i < ii; ++i) {
            var zIndexKey = zs[i].toString();
            replays = this.replaysByZIndex_[zIndexKey];
            for (j = 0, jj = replayTypes.length; j < jj; ++j) {
                var replayType = replayTypes[j];
                replay = replays[replayType];
                if (replay !== undefined) {
                    if (opt_declutterReplays &&
                        (replayType === ol.render.ReplayType.IMAGE || replayType === ol.render.ReplayType.TEXT)) {
                        var declutter = opt_declutterReplays[zIndexKey];
                        if (!declutter) {
                            opt_declutterReplays[zIndexKey] = [replay, transform.slice(0)];
                        }
                        else {
                            declutter.push(replay, transform.slice(0));
                        }
                    }
                    else {
                        replay.replay(context, transform, viewRotation, skippedFeaturesHash);
                    }
                }
            }
        }
        context.restore();
    };
    ReplayGroupCustom.prototype.getReplayCustom = function (zIndex, replayType) {
        var zIndexKey = zIndex !== undefined ? zIndex.toString() : "0";
        var replays = this.replaysByZIndex_[zIndexKey];
        if (replays === undefined) {
            replays = {};
            this.replaysByZIndex_[zIndexKey] = replays;
        }
        var replay = replays[replayType];
        if (replay === undefined) {
            var Constructor = this.BATCH_CONSTRUCTORS_[replayType];
            replay = new Constructor(this.tolerance_, this.maxExtent_, this.resolution_, this.pixelRatio_, this.overlaps_, this.declutterTree_);
            replays[replayType] = replay;
        }
        return replay;
    };
    return ReplayGroupCustom;
}(ol.render.canvas.ReplayGroup));



/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TextReplayCustom; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__style_textLabelingStrategy__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__style_detectTextLabelingStrategy__ = __webpack_require__(3);
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var TextReplayCustom = /** @class */ (function (_super) {
    __extends(TextReplayCustom, _super);
    function TextReplayCustom(tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree) {
        var _this = _super.call(this, tolerance, maxExtent, resolution, pixelRatio, overlaps, declutterTree) || this;
        _this.renderDeclutterChar_ = function (declutterGroup, feature) {
            if (declutterGroup && declutterGroup.length > 5) {
                var groupCount = declutterGroup[4];
                if (groupCount == 1 || groupCount == declutterGroup.length - 5) {
                    /** @type {ol.RBushEntry} */
                    var box = {
                        minX: /** @type {number} */ (declutterGroup[0]),
                        minY: /** @type {number} */ (declutterGroup[1]),
                        maxX: /** @type {number} */ (declutterGroup[2]),
                        maxY: /** @type {number} */ (declutterGroup[3]),
                        value: feature
                    };
                    if (!this.declutterTree.collides(box)) {
                        this.declutterTree.insert(box);
                        var drawImage = ol.render.canvas.drawImage;
                        for (var j = 5, jj = declutterGroup.length; j < jj; ++j) {
                            var declutterData = /** @type {Array} */ (declutterGroup[j]);
                            if (declutterData) {
                                if (declutterData.length > 11) {
                                    this.replayTextBackground_(declutterData[0], declutterData[13], declutterData[14], declutterData[15], declutterData[16], declutterData[11], declutterData[12]);
                                }
                                var labelInfo = declutterData[3];
                                var labelImage = this.getImage(labelInfo["text"], labelInfo["textKey"], labelInfo["fillKey"], labelInfo["strokeKey"]);
                                declutterData[3] = labelImage;
                                drawImage.apply(undefined, declutterData);
                            }
                        }
                    }
                    declutterGroup.length = 5;
                    ol.extent.createOrUpdateEmpty(declutterGroup);
                }
            }
        };
        _this.BATCH_CONSTRUCTORS_CUSTOM = {
            "Point": __WEBPACK_IMPORTED_MODULE_1__style_detectTextLabelingStrategy__["a" /* DetectTextLabelingStrategy */],
            "MultiPoint": __WEBPACK_IMPORTED_MODULE_0__style_textLabelingStrategy__["a" /* TextLabelingStrategy */],
            "LineString": __WEBPACK_IMPORTED_MODULE_0__style_textLabelingStrategy__["a" /* TextLabelingStrategy */],
            "Circle": __WEBPACK_IMPORTED_MODULE_0__style_textLabelingStrategy__["a" /* TextLabelingStrategy */],
            "MultiLineString": __WEBPACK_IMPORTED_MODULE_0__style_textLabelingStrategy__["a" /* TextLabelingStrategy */],
            "Polygon": __WEBPACK_IMPORTED_MODULE_0__style_textLabelingStrategy__["a" /* TextLabelingStrategy */],
            "MultiPolygon": __WEBPACK_IMPORTED_MODULE_0__style_textLabelingStrategy__["a" /* TextLabelingStrategy */]
        };
        _this.drawText = _this.drawTextCustom;
        _this.setTextStyle = _this.setTextStyleCustom;
        _this.replay_ = _this.replayCustom;
        _this.labelInfoCache = new ol.structs.LRUCache();
        return _this;
    }
    TextReplayCustom.prototype.replayCustom = function (context, transform, skippedFeaturesHash, instructions, featureCallback, opt_hitExtent) {
        /** @type {Array.<number>} */
        var pixelExten;
        pixelExten = ol.geom.flat.transform.transform2D(this.maxExtent, 0, this.maxExtent.length, 2, transform, this["pixelExten"]);
        var pixelCoordinates;
        if (this.pixelCoordinates_ && ol.array.equals(transform, this.renderedTransform_)) {
            pixelCoordinates = this.pixelCoordinates_;
        }
        else {
            if (!this.pixelCoordinates_) {
                this.pixelCoordinates_ = [];
            }
            pixelCoordinates = ol.geom.flat.transform.transform2D(this.coordinates, 0, this.coordinates.length, 2, transform, this.pixelCoordinates_);
            ol.transform.setFromArray(this.renderedTransform_, transform);
        }
        var quickZoom = false;
        if (context["quickZoom"] !== undefined) {
            quickZoom = context["quickZoom"];
        }
        var skipFeatures = !ol.obj.isEmpty(skippedFeaturesHash);
        var i = 0; // instruction index
        var ii = instructions.length; // end of instructions
        var d = 0; // data index
        var dd; // end of per-instruction data
        var anchorX, anchorY, prevX, prevY, roundX, roundY, declutterGroup, image;
        var pendingFill = 0;
        var pendingStroke = 0;
        var lastFillInstruction = null;
        var lastStrokeInstruction = null;
        var coordinateCache = this.coordinateCache_;
        var viewRotation = this.viewRotation_;
        var state = /** @type {olx.render.State} */ ({
            context: context,
            pixelRatio: this.pixelRatio,
            resolution: this.resolution,
            rotation: viewRotation
        });
        // When the batch size gets too big, performance decreases. 200 is a good
        // balance between batch size and number of fill/stroke instructions.
        var batchSize = this.instructions !== instructions || this.overlaps ? 0 : 200;
        var currentResolution = context["currentResolution"];
        var ratio = window.devicePixelRatio * 1.194328566955879 / currentResolution;
        if (ratio >= 3) {
            ratio /= 2;
        }
        while (i < ii) {
            var instruction = instructions[i];
            var type = /** @type {ol.render.canvas.Instruction} */ (instruction[0]);
            var /** @type {ol.Feature|ol.render.Feature} */ feature = void 0, x = void 0, y = void 0;
            switch (type) {
                case ol.render.canvas.Instruction.BEGIN_GEOMETRY:
                    feature = /** @type {ol.Feature|ol.render.Feature} */ (instruction[1]);
                    if ((skipFeatures && skippedFeaturesHash[ol.getUid(feature).toString()]) || !feature.getGeometry()) {
                        i = /** @type {number} */ (instruction[2]);
                    }
                    else if (opt_hitExtent !== undefined && !ol.extent.intersects(opt_hitExtent, feature.getGeometry().getExtent())) {
                        i = /** @type {number} */ (instruction[2]) + 1;
                    }
                    else {
                        ++i;
                    }
                    break;
                case ol.render.canvas.Instruction.BEGIN_PATH:
                    if (pendingFill > batchSize) {
                        this.fill_(context);
                        pendingFill = 0;
                    }
                    if (pendingStroke > batchSize) {
                        context.stroke();
                        pendingStroke = 0;
                    }
                    if (!pendingFill && !pendingStroke) {
                        context.beginPath();
                        prevX = prevY = NaN;
                    }
                    ++i;
                    break;
                case ol.render.canvas.Instruction.CIRCLE:
                    d = /** @type {number} */ (instruction[1]);
                    var x1 = pixelCoordinates[d];
                    var y1 = pixelCoordinates[d + 1];
                    var x2 = pixelCoordinates[d + 2];
                    var y2 = pixelCoordinates[d + 3];
                    var dx = x2 - x1;
                    var dy = y2 - y1;
                    var r = Math.sqrt(dx * dx + dy * dy);
                    context.moveTo(x1 + r, y1);
                    context.arc(x1, y1, r, 0, 2 * Math.PI, true);
                    ++i;
                    break;
                case ol.render.canvas.Instruction.CLOSE_PATH:
                    context.closePath();
                    ++i;
                    break;
                case ol.render.canvas.Instruction.CUSTOM:
                    d = /** @type {number} */ (instruction[1]);
                    dd = instruction[2];
                    var geometry = /** @type {ol.geom.SimpleGeometry} */ (instruction[3]);
                    var renderer = instruction[4];
                    var fn = instruction.length === 6 ? instruction[5] : undefined;
                    state.geometry = geometry;
                    state.feature = feature;
                    if (!(i in coordinateCache)) {
                        coordinateCache[i] = [];
                    }
                    var coords = coordinateCache[i];
                    if (fn) {
                        fn(pixelCoordinates, d, dd, 2, coords);
                    }
                    else {
                        coords[0] = pixelCoordinates[d];
                        coords[1] = pixelCoordinates[d + 1];
                        coords.length = 2;
                    }
                    renderer(coords, state);
                    ++i;
                    break;
                case ol.render.canvas.Instruction.DRAW_IMAGE:
                    d = /** @type {number} */ (instruction[1]);
                    dd = /** @type {number} */ (instruction[2]);
                    image = /** @type {HTMLCanvasElement|HTMLVideoElement|Image} */ (instruction[3]);
                    // Remaining arguments in DRAW_IMAGE are in alphabetical order
                    anchorX = /** @type {number} */ (instruction[4]);
                    anchorY = /** @type {number} */ (instruction[5]);
                    declutterGroup = featureCallback ? null : /** @type {ol.DeclutterGroup} */ (instruction[6]);
                    var height = /** @type {number} */ (instruction[7]);
                    var opacity = /** @type {number} */ (instruction[8]);
                    var originX = /** @type {number} */ (instruction[9]);
                    var originY = /** @type {number} */ (instruction[10]);
                    var rotateWithView = /** @type {boolean} */ (instruction[11]);
                    var rotation = /** @type {number} */ (instruction[12]);
                    var scale = /** @type {number} */ (instruction[13]);
                    var snapToPixel = /** @type {boolean} */ (instruction[14]);
                    var width = /** @type {number} */ (instruction[15]);
                    var padding = void 0, backgroundFill = void 0, backgroundStroke = void 0;
                    if (instruction.length > 16) {
                        padding = /** @type {Array.<number>} */ (instruction[16]);
                        backgroundFill = /** @type {boolean} */ (instruction[17]);
                        backgroundStroke = /** @type {boolean} */ (instruction[18]);
                    }
                    else {
                        padding = ol.render.canvas.defaultPadding;
                        backgroundFill = backgroundStroke = false;
                    }
                    if (rotateWithView) {
                        rotation += viewRotation;
                    }
                    for (; d < dd; d += 2) {
                        this.replayImage_(context, pixelCoordinates[d], pixelCoordinates[d + 1], image, anchorX, anchorY, declutterGroup, height, opacity, originX, originY, rotation, scale, snapToPixel, width, padding, backgroundFill ? /** @type {Array.<*>} */ (lastFillInstruction) : null, backgroundStroke ? /** @type {Array.<*>} */ (lastStrokeInstruction) : null);
                    }
                    this.renderDeclutter_(declutterGroup, feature);
                    ++i;
                    break;
                case ol.render.canvas.Instruction.DRAW_CHARS:
                    if (!quickZoom) {
                        var begin = /** @type {number} */ (instruction[1]);
                        var end = /** @type {number} */ (instruction[2]);
                        var baseline = /** @type {number} */ (instruction[3]);
                        declutterGroup = featureCallback ? null : /** @type {ol.DeclutterGroup} */ (instruction[4]);
                        var overflow = /** @type {number} */ (instruction[5]);
                        var fillKey = /** @type {string} */ (instruction[6]);
                        var maxAngle = /** @type {number} */ (instruction[7]);
                        var measure = /** @type {function(string):number} */ (instruction[8]);
                        var offsetY = /** @type {number} */ (instruction[9]);
                        var strokeKey = /** @type {string} */ (instruction[10]);
                        var strokeWidth = /** @type {number} */ (instruction[11]);
                        var text = /** @type {string} */ (instruction[12]);
                        var textKey = /** @type {string} */ (instruction[13]);
                        var textScale = /** @type {number} */ (instruction[14]);
                        var declutterGroups = [];
                        var pathLength = ol.geom.flat.length.lineString(pixelCoordinates, begin, end, 2);
                        var textLength = measure(text);
                        if (overflow || textLength * 1.2 <= pathLength) {
                            // The original logical is create label image --> declutterGroup --> draw label image to context
                            // The newest logical is  create label info and create image instruction --> declutterGroup --> create label image --> draw label image to context
                            var labelInstructions = [];
                            var labelIndex = 0;
                            if (currentResolution < 1) {
                                var distance = 180 * ratio;
                                var tmpLength = pathLength - textLength;
                                var centerPoint = tmpLength / 2;
                                var leftPoint = centerPoint;
                                var rightPoint = centerPoint;
                                var pointArray = [];
                                pointArray.push(centerPoint);
                                while (leftPoint > ((textLength / 2) + distance)) {
                                    leftPoint = leftPoint - distance;
                                    pointArray.push(leftPoint);
                                }
                                while (rightPoint < ((pathLength - textLength / 2) - distance)) {
                                    rightPoint = rightPoint + distance;
                                    pointArray.push(rightPoint);
                                }
                                for (var len = 0; len < pointArray.length; len++) {
                                    var tempDeclutterGroup = void 0;
                                    if (declutterGroup) {
                                        tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                                    }
                                    var startM = pointArray[len];
                                    var parts = ol.geom.flat.textpath.lineString(pixelCoordinates, begin, end, 2, text, measure, startM, maxAngle);
                                    if (parts) {
                                        var c = void 0, cc = void 0, chars = void 0, label = void 0, part = void 0;
                                        if (strokeKey) {
                                            for (c = 0, cc = parts.length; c < cc; ++c) {
                                                part = parts[c]; // x, y, anchorX, rotation, chunk
                                                chars = /** @type {string} */ (part[4]);
                                                var labelInfo = undefined;
                                                if (tempDeclutterGroup) {
                                                    labelInfo = this.getImageInfo(chars, textKey, "", strokeKey);
                                                    labelInstructions[labelIndex] = {
                                                        chars: chars,
                                                        textKey: textKey,
                                                        fillKey: fillKey,
                                                        strokeKey: ""
                                                    };
                                                    labelIndex += 1;
                                                }
                                                else {
                                                    labelInfo = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, "", strokeKey);
                                                }
                                                anchorX = /** @type {number} */ (part[2]) + strokeWidth;
                                                anchorY = baseline * labelInfo["height"] + (0.5 - baseline) * 2 * strokeWidth - offsetY;
                                                this.replayImage_(context, /** @type {number} */ (part[0]), /** @type {number} */ (part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */ (part[3]), textScale, false, labelInfo["width"], ol.render.canvas.defaultPadding, null, null);
                                            }
                                        }
                                        if (fillKey) {
                                            for (c = 0, cc = parts.length; c < cc; ++c) {
                                                part = parts[c]; // x, y, anchorX, rotation, chunk
                                                chars = /** @type {string} */ (part[4]);
                                                var labelInfo = undefined;
                                                if (tempDeclutterGroup) {
                                                    labelInfo = this.getImageInfo(chars, textKey, fillKey, "");
                                                    labelInstructions[labelIndex] = {
                                                        chars: chars,
                                                        textKey: textKey,
                                                        fillKey: fillKey,
                                                        strokeKey: ""
                                                    };
                                                    labelIndex += 1;
                                                }
                                                else {
                                                    labelInfo = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, fillKey, "");
                                                }
                                                anchorX = /** @type {number} */ (part[2]);
                                                anchorY = baseline * labelInfo["height"] - offsetY;
                                                this.replayImage_(context, /** @type {number} */ (part[0]), /** @type {number} */ (part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */ (part[3]), textScale, false, labelInfo["width"], ol.render.canvas.defaultPadding, null, null);
                                            }
                                        }
                                        declutterGroups.push(tempDeclutterGroup);
                                    }
                                }
                            }
                            else {
                                var tempDeclutterGroup = void 0;
                                if (declutterGroup) {
                                    tempDeclutterGroup = featureCallback ? null : declutterGroup.slice(0);
                                }
                                var textAlign = /** @type {ol.render.canvas.TextReplay} */ (this).textStates[textKey].textAlign;
                                var startM_1 = (pathLength - textLength) * ol.render.replay.TEXT_ALIGN[textAlign];
                                var parts = ol.geom.flat.textpath.lineString(pixelCoordinates, begin, end, 2, text, measure, startM_1, maxAngle);
                                if (parts) {
                                    var c = void 0, cc = void 0, chars = void 0, label = void 0, part = void 0;
                                    if (strokeKey) {
                                        for (c = 0, cc = parts.length; c < cc; ++c) {
                                            part = parts[c]; // x, y, anchorX, rotation, chunk
                                            chars = /** @type {string} */ (part[4]);
                                            var labelInfo = undefined;
                                            if (tempDeclutterGroup) {
                                                labelInfo = this.getImageInfo(chars, textKey, "", strokeKey);
                                                labelInstructions[labelIndex] = {
                                                    chars: chars,
                                                    textKey: textKey,
                                                    fillKey: fillKey,
                                                    strokeKey: ""
                                                };
                                                labelIndex += 1;
                                            }
                                            else {
                                                labelInfo = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, "", strokeKey);
                                            }
                                            // label = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, "", strokeKey);
                                            anchorX = /** @type {number} */ (part[2]) + strokeWidth;
                                            anchorY = baseline * labelInfo["height"] + (0.5 - baseline) * 2 * strokeWidth - offsetY;
                                            this.replayImage_(context, /** @type {number} */ (part[0]), /** @type {number} */ (part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */ (part[3]), textScale, false, labelInfo["width"], ol.render.canvas.defaultPadding, null, null);
                                        }
                                    }
                                    if (fillKey) {
                                        for (c = 0, cc = parts.length; c < cc; ++c) {
                                            part = parts[c]; // x, y, anchorX, rotation, chunk
                                            chars = /** @type {string} */ (part[4]);
                                            var labelInfo = undefined;
                                            if (tempDeclutterGroup) {
                                                labelInfo = this.getImageInfo(chars, textKey, fillKey, "");
                                                labelInstructions[labelIndex] = {
                                                    chars: chars,
                                                    textKey: textKey,
                                                    fillKey: fillKey,
                                                    strokeKey: ""
                                                };
                                                labelIndex += 1;
                                            }
                                            else {
                                                labelInfo = /** @type {ol.render.canvas.TextReplay} */ (this).getImage(chars, textKey, fillKey, "");
                                            }
                                            anchorX = /** @type {number} */ (part[2]);
                                            anchorY = baseline * labelInfo["height"] - offsetY;
                                            this.replayImage_(context, /** @type {number} */ (part[0]), /** @type {number} */ (part[1]), labelInfo, anchorX, anchorY, tempDeclutterGroup, labelInfo["height"], 1, 0, 0, /** @type {number} */ (part[3]), textScale, false, labelInfo["width"], ol.render.canvas.defaultPadding, null, null);
                                        }
                                    }
                                    declutterGroups.push(tempDeclutterGroup);
                                }
                            }
                        }
                        for (var d_1 = 0; d_1 < declutterGroups.length; d_1++) {
                            var targetDeclutterGroup = declutterGroups[d_1];
                            if (targetDeclutterGroup && targetDeclutterGroup.length > 5) {
                                var targetExtent = [targetDeclutterGroup[0], targetDeclutterGroup[1], targetDeclutterGroup[2], targetDeclutterGroup[3]];
                                if (targetExtent[0] > pixelExten[0] && targetExtent[1] > pixelExten[3] && targetExtent[2] < pixelExten[2] && targetExtent[3] < pixelExten[1]) {
                                    this.renderDeclutterChar_(targetDeclutterGroup, feature);
                                }
                            }
                        }
                    }
                    ++i;
                    break;
                case ol.render.canvas.Instruction.END_GEOMETRY:
                    if (featureCallback !== undefined) {
                        feature = /** @type {ol.Feature|ol.render.Feature} */ (instruction[1]);
                        var result = featureCallback(feature);
                        if (result) {
                            return result;
                        }
                    }
                    ++i;
                    break;
                case ol.render.canvas.Instruction.FILL:
                    if (batchSize) {
                        pendingFill++;
                    }
                    else {
                        this.fill_(context);
                    }
                    ++i;
                    break;
                case ol.render.canvas.Instruction.MOVE_TO_LINE_TO:
                    d = /** @type {number} */ (instruction[1]);
                    dd = /** @type {number} */ (instruction[2]);
                    x = pixelCoordinates[d];
                    y = pixelCoordinates[d + 1];
                    roundX = (x + 0.5) | 0;
                    roundY = (y + 0.5) | 0;
                    if (roundX !== prevX || roundY !== prevY) {
                        context.moveTo(x, y);
                        prevX = roundX;
                        prevY = roundY;
                    }
                    for (d += 2; d < dd; d += 2) {
                        x = pixelCoordinates[d];
                        y = pixelCoordinates[d + 1];
                        roundX = (x + 0.5) | 0;
                        roundY = (y + 0.5) | 0;
                        if (d === dd - 2 || roundX !== prevX || roundY !== prevY) {
                            context.lineTo(x, y);
                            prevX = roundX;
                            prevY = roundY;
                        }
                    }
                    ++i;
                    break;
                case ol.render.canvas.Instruction.SET_FILL_STYLE:
                    lastFillInstruction = instruction;
                    this.fillOrigin_ = instruction[2];
                    if (pendingFill) {
                        this.fill_(context);
                        pendingFill = 0;
                        if (pendingStroke) {
                            context.stroke();
                            pendingStroke = 0;
                        }
                    }
                    context.fillStyle = /** @type {ol.ColorLike} */ (instruction[1]);
                    ++i;
                    break;
                case ol.render.canvas.Instruction.SET_STROKE_STYLE:
                    lastStrokeInstruction = instruction;
                    if (pendingStroke) {
                        context.stroke();
                        pendingStroke = 0;
                    }
                    this.setStrokeStyle_(context, /** @type {Array.<*>} */ (instruction));
                    ++i;
                    break;
                case ol.render.canvas.Instruction.STROKE:
                    if (batchSize) {
                        pendingStroke++;
                    }
                    else {
                        context.stroke();
                    }
                    ++i;
                    break;
                default:
                    ++i; // consume the instruction anyway, to avoid an infinite loop
                    break;
            }
        }
        if (pendingFill) {
            this.fill_(context);
        }
        if (pendingStroke) {
            context.stroke();
        }
        return undefined;
    };
    TextReplayCustom.prototype.replayImage_ = function (context, x, y, labelInfo, anchorX, anchorY, declutterGroup, height, opacity, originX, originY, rotation, scale, snapToPixel, width, padding, fillInstruction, strokeInstruction) {
        var fillStroke = fillInstruction || strokeInstruction;
        var localTransform = this.tmpLocalTransform_;
        anchorX *= scale;
        anchorY *= scale;
        x -= anchorX;
        y -= anchorY;
        if (snapToPixel) {
            x = Math.ceil(x);
            y = Math.ceil(y);
        }
        var w = (width + originX > labelInfo.width) ? labelInfo.width - originX : width;
        var h = (height + originY > labelInfo.height) ? labelInfo.height - originY : height;
        var box = this.tmpExtent_;
        var boxW = padding[3] + w * scale + padding[1];
        var boxH = padding[0] + h * scale + padding[2];
        var boxX = x - padding[3];
        var boxY = y - padding[0];
        /** @type {ol.Coordinate} */
        var p1;
        /** @type {ol.Coordinate} */
        var p2;
        /** @type {ol.Coordinate} */
        var p3;
        /** @type {ol.Coordinate} */
        var p4;
        if (fillStroke || rotation !== 0) {
            p1 = [boxX, boxY];
            p2 = [boxX + boxW, boxY];
            p3 = [boxX + boxW, boxY + boxH];
            p4 = [boxX, boxY + boxH];
        }
        var transform = null;
        if (rotation !== 0) {
            var centerX = x + anchorX;
            var centerY = y + anchorY;
            transform = ol.transform.compose(localTransform, centerX, centerY, 1, 1, rotation, -centerX, -centerY);
            ol.extent.createOrUpdateEmpty(box);
            ol.extent.extendCoordinate(box, ol.transform.apply(localTransform, p1));
            ol.extent.extendCoordinate(box, ol.transform.apply(localTransform, p2));
            ol.extent.extendCoordinate(box, ol.transform.apply(localTransform, p3));
            ol.extent.extendCoordinate(box, ol.transform.apply(localTransform, p4));
        }
        else {
            ol.extent.createOrUpdate(boxX, boxY, boxX + boxW, boxY + boxH, box);
        }
        var canvas = context.canvas;
        var intersects = box[0] <= canvas.width && box[2] >= 0 && box[1] <= canvas.height && box[3] >= 0;
        if (declutterGroup) {
            if (!intersects && declutterGroup[4] == 1) {
                return;
            }
            ol.extent.extend(declutterGroup, box);
            var declutterArgs = intersects ?
                [context, transform ? transform.slice(0) : null, opacity, labelInfo, originX, originY, w, h, x, y, scale] :
                null;
            if (declutterArgs && fillStroke) {
                declutterArgs.push(fillInstruction, strokeInstruction, p1, p2, p3, p4);
            }
            declutterGroup.push(declutterArgs);
        }
        else if (intersects) {
            if (fillStroke) {
                this.replayTextBackground_(context, p1, p2, p3, p4, 
                /** @type {Array.<*>} */ (fillInstruction), 
                /** @type {Array.<*>} */ (strokeInstruction));
            }
            ol.render.canvas.drawImage(context, transform, opacity, labelInfo, originX, originY, w, h, x, y, scale);
        }
    };
    ;
    // Get the image info, such as width, height
    TextReplayCustom.prototype.getImageInfo = function (text, textKey, fillKey, strokeKey) {
        var labelInfo = {};
        labelInfo["text"] = text;
        labelInfo["textKey"] = textKey;
        labelInfo["fillKey"] = fillKey;
        labelInfo["strokeKey"] = strokeKey;
        var label;
        var key = strokeKey + textKey + text + fillKey + this.pixelRatio;
        if (!this.labelInfoCache.containsKey(key)) {
            var strokeState = strokeKey ? this.strokeStates[strokeKey] || this.textStrokeState_ : null;
            var fillState = fillKey ? this.fillStates[fillKey] || this.textFillState_ : null;
            var textState = this.textStates[textKey] || this.textState_;
            var pixelRatio = this.pixelRatio;
            var scale = textState.scale * pixelRatio;
            var align = ol.render.replay.TEXT_ALIGN[textState.textAlign || ol.render.canvas.defaultTextAlign];
            var strokeWidth = strokeKey && strokeState.lineWidth ? strokeState.lineWidth : 0;
            var lines = text.split('\n');
            var numLines = lines.length;
            var widths = [];
            var width = ol.render.canvas.TextReplay.measureTextWidths(textState.font, lines, widths);
            var lineHeight = textState.lineHeight;
            var height = lineHeight * numLines;
            var renderWidth = (width + strokeWidth);
            labelInfo["width"] = Math.ceil(renderWidth * scale);
            labelInfo["widths"] = widths;
            labelInfo["height"] = Math.ceil((height + strokeWidth) * scale);
            this.labelInfoCache.set(key, labelInfo);
            return labelInfo;
        }
        return this.labelInfoCache.get(key);
    };
    TextReplayCustom.prototype.getImage = function (text, textKey, fillKey, strokeKey) {
        var label;
        var key = strokeKey + textKey + text + fillKey + this.pixelRatio;
        var labelCache = ol.render.canvas.labelCache;
        if (!labelCache.containsKey(key)) {
            var labelInfo = this.labelInfoCache["key"];
            var strokeState = strokeKey ? this.strokeStates[strokeKey] || this.textStrokeState_ : null;
            var fillState = fillKey ? this.fillStates[fillKey] || this.textFillState_ : null;
            var textState = this.textStates[textKey] || this.textState_;
            var pixelRatio = this.pixelRatio;
            var scale = textState.scale * pixelRatio;
            var align = ol.render.replay.TEXT_ALIGN[textState.textAlign || ol.render.canvas.defaultTextAlign];
            var strokeWidth = strokeKey && strokeState.lineWidth ? strokeState.lineWidth : 0;
            var lines = text.split('\n');
            var numLines = lines.length;
            var widths = [];
            var width;
            var lineHeight;
            if (labelInfo) {
                width = labelInfo["width"];
            }
            else {
                width = ol.render.canvas.TextReplay.measureTextWidths(textState.font, lines, widths);
            }
            var lineHeight = textState["lineHeight"];
            var height = lineHeight * numLines;
            var renderWidth = (width + strokeWidth);
            var context = ol.dom.createCanvasContext2D(Math.ceil(renderWidth * scale), Math.ceil((height + strokeWidth) * scale));
            label = context.canvas;
            labelCache.set(key, label);
            if (scale != 1) {
                context.scale(scale, scale);
            }
            context.font = textState.font;
            if (strokeKey) {
                context.strokeStyle = strokeState.strokeStyle;
                context.lineWidth = strokeWidth * (ol.has.SAFARI ? scale : 1);
                context.lineCap = strokeState.lineCap;
                context.lineJoin = strokeState.lineJoin;
                context.miterLimit = strokeState.miterLimit;
                if (ol.has.CANVAS_LINE_DASH && strokeState.lineDash.length) {
                    context.setLineDash(strokeState.lineDash);
                    context.lineDashOffset = strokeState.lineDashOffset;
                }
            }
            if (fillKey) {
                context.fillStyle = fillState.fillStyle;
            }
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            var leftRight = (0.5 - align);
            var x = align * label.width / scale + leftRight * strokeWidth;
            var i;
            if (strokeKey) {
                for (i = 0; i < numLines; ++i) {
                    context.strokeText(lines[i], x + leftRight * widths[i], 0.5 * (strokeWidth + lineHeight) + i * lineHeight);
                }
            }
            if (fillKey) {
                for (i = 0; i < numLines; ++i) {
                    context.fillText(lines[i], x + leftRight * widths[i], 0.5 * (strokeWidth + lineHeight) + i * lineHeight);
                }
            }
        }
        return labelCache.get(key);
    };
    ;
    TextReplayCustom.prototype.drawChars_ = function (begin, end, declutterGroup) {
        var strokeState = this.textStrokeState_;
        var textState = this.textState_;
        var fillState = this.textFillState_;
        var strokeKey = this.strokeKey_;
        if (strokeState) {
            if (!(strokeKey in this.strokeStates)) {
                this.strokeStates[strokeKey] = /** @type {ol.CanvasStrokeState} */ ({
                    strokeStyle: strokeState.strokeStyle,
                    lineCap: strokeState.lineCap,
                    lineDashOffset: strokeState.lineDashOffset,
                    lineWidth: strokeState.lineWidth,
                    lineJoin: strokeState.lineJoin,
                    miterLimit: strokeState.miterLimit,
                    lineDash: strokeState.lineDash
                });
            }
        }
        var textKey = this.textKey_;
        if (!(this.textKey_ in this.textStates)) {
            this.textStates[this.textKey_] = /** @type {ol.CanvasTextState} */ ({
                font: textState.font,
                lineHeight: ol.render.canvas.measureTextHeight(textState.font),
                textAlign: textState.textAlign || ol.render.canvas.defaultTextAlign,
                scale: textState.scale
            });
        }
        var fillKey = this.fillKey_;
        if (fillState) {
            if (!(fillKey in this.fillStates)) {
                this.fillStates[fillKey] = /** @type {ol.CanvasFillState} */ ({
                    fillStyle: fillState.fillStyle
                });
            }
        }
        var pixelRatio = this.pixelRatio;
        var baseline = ol.render.replay.TEXT_ALIGN[textState.textBaseline];
        var offsetY = this.textOffsetY_ * pixelRatio;
        var text = this.text_;
        var font = textState.font;
        var textScale = textState.scale;
        var strokeWidth = strokeState ? strokeState.lineWidth * textScale / 2 : 0;
        var widths = this.widths_[font];
        if (!widths) {
            this.widths_[font] = widths = {};
        }
        this.instructions.push([ol.render.canvas.Instruction.DRAW_CHARS,
            begin, end, baseline, declutterGroup,
            textState.overflow, fillKey, textState.maxAngle,
            function (text) {
                var width = widths[text];
                if (!width) {
                    width = widths[text] = ol.render.canvas.measureTextWidth(font, text);
                }
                return width * textScale * pixelRatio;
            },
            offsetY, strokeKey, strokeWidth * pixelRatio, text, textKey, 1
        ]);
        this.hitDetectionInstructions.push([ol.render.canvas.Instruction.DRAW_CHARS,
            begin, end, baseline, declutterGroup,
            textState.overflow, fillKey, textState.maxAngle,
            function (text) {
                var width = widths[text];
                if (!width) {
                    width = widths[text] = ol.render.canvas.measureTextWidth(font, text);
                }
                return width * textScale;
            },
            offsetY, strokeKey, strokeWidth, text, textKey, 1 / pixelRatio
        ]);
    };
    ;
    TextReplayCustom.prototype.setTextStyleCustom = function (textStyle, declutterGroup) {
        var textState, fillState, strokeState;
        if (!textStyle) {
            this.text_ = "";
        }
        else {
            this.declutterGroup_ = /** @type {ol.DeclutterGroup} */ (declutterGroup);
            var textFillStyle = textStyle.getFill();
            if (!textFillStyle) {
                fillState = this.textFillState_ = null;
            }
            else {
                fillState = this.textFillState_;
                if (!fillState) {
                    fillState = this.textFillState_ = /** @type {ol.CanvasFillState} */ ({});
                }
                fillState.fillStyle = ol.colorlike.asColorLike(textFillStyle.getColor() || ol.render.canvas.defaultFillStyle);
            }
            var textStrokeStyle = textStyle.getStroke();
            if (!textStrokeStyle) {
                strokeState = this.textStrokeState_ = null;
            }
            else {
                strokeState = this.textStrokeState_;
                if (!strokeState) {
                    strokeState = this.textStrokeState_ = /** @type {ol.CanvasStrokeState} */ ({});
                }
                var lineDash = textStrokeStyle.getLineDash();
                var lineDashOffset = textStrokeStyle.getLineDashOffset();
                var lineWidth = textStrokeStyle.getWidth();
                var miterLimit = textStrokeStyle.getMiterLimit();
                strokeState.lineCap = textStrokeStyle.getLineCap() || ol.render.canvas.defaultLineCap;
                strokeState.lineDash = lineDash ? lineDash.slice() : ol.render.canvas.defaultLineDash;
                strokeState.lineDashOffset =
                    lineDashOffset === undefined ? ol.render.canvas.defaultLineDashOffset : lineDashOffset;
                strokeState.lineJoin = textStrokeStyle.getLineJoin() || ol.render.canvas.defaultLineJoin;
                strokeState.lineWidth =
                    lineWidth === undefined ? ol.render.canvas.defaultLineWidth : lineWidth;
                strokeState.miterLimit =
                    miterLimit === undefined ? ol.render.canvas.defaultMiterLimit : miterLimit;
                strokeState.strokeStyle = ol.colorlike.asColorLike(textStrokeStyle.getColor() || ol.render.canvas.defaultStrokeStyle);
            }
            textState = this.textState_;
            var font = textStyle.getFont() || ol.render.canvas.defaultFont;
            ol.render.canvas.checkFont(font);
            var textScale = textStyle.getScale();
            textState.overflow = textStyle.getOverflow();
            textState.font = font;
            textState.maxAngle = textStyle.getMaxAngle();
            textState.placement = textStyle.getPlacement();
            textState.textAlign = textStyle.getTextAlign();
            textState.textBaseline = textStyle.getTextBaseline() || ol.render.canvas.defaultTextBaseline;
            textState.backgroundFill = textStyle.getBackgroundFill();
            textState.backgroundStroke = textStyle.getBackgroundStroke();
            textState.padding = textStyle.getPadding() || ol.render.canvas.defaultPadding;
            textState.scale = textScale === undefined ? 1 : textScale;
            var textOffsetX = textStyle.getOffsetX();
            var textOffsetY = textStyle.getOffsetY();
            var textRotateWithView = textStyle.getRotateWithView();
            var textRotation = textStyle.getRotation();
            this.text_ = textStyle.getText() || "";
            this.textOffsetX_ = textOffsetX === undefined ? 0 : textOffsetX;
            this.textOffsetY_ = textOffsetY === undefined ? 0 : textOffsetY;
            this.textRotateWithView_ = textRotateWithView === undefined ? false : textRotateWithView;
            this.textRotation_ = textRotation === undefined ? 0 : textRotation;
            this.strokeKey_ = strokeState ?
                (typeof strokeState.strokeStyle === "string" ? strokeState.strokeStyle : ol.getUid(strokeState.strokeStyle)) +
                    strokeState.lineCap + strokeState.lineDashOffset + "|" + strokeState.lineWidth +
                    strokeState.lineJoin + strokeState.miterLimit + "[" + strokeState.lineDash.join() + "]" :
                "";
            this.textKey_ = textState.font + textState.scale + (textState.textAlign || "?");
            this.fillKey_ = fillState ?
                (typeof fillState.fillStyle === "string" ? fillState.fillStyle : ("|" + ol.getUid(fillState.fillStyle))) :
                "";
            this.label = textStyle.label;
            this.labelPosition = textStyle.labelPosition;
        }
    };
    TextReplayCustom.prototype.drawTextCustom = function (geometry, feature) {
        var fillState = this.textFillState_;
        var strokeState = this.textStrokeState_;
        var textState = this.textState_;
        var geometryType = geometry.getType();
        if (this.text_ === "" || !textState || (!fillState && !strokeState)) {
            return;
        }
        if (this.labelPosition === undefined) {
            return;
        }
        if ((geometryType === ol.geom.GeometryType.LINE_STRING || geometryType === ol.geom.GeometryType.MULTI_LINE_STRING) && !this.label) {
            var begin_1 = this.coordinates.length;
            var geometryType_1 = geometry.getType();
            var flatCoordinates_1 = this.labelPosition;
            var end_1 = 2;
            var stride_1 = 2;
            var i = void 0, ii = void 0;
            // if (!ol.extent.intersects(this.getBufferedMaxExtent(), geometry.getExtent())) {
            //     return;
            // }
            var ends = void 0;
            // flatCoordinates = geometry.getFlatCoordinates();
            stride_1 = geometry.getStride();
            if (geometryType_1 === ol.geom.GeometryType.LINE_STRING) {
                ends = [flatCoordinates_1.length];
            }
            else if (geometryType_1 === ol.geom.GeometryType.MULTI_LINE_STRING) {
                ends = geometry.getEnds();
            }
            else if (geometryType_1 === ol.geom.GeometryType.POLYGON) {
                ends = geometry.getEnds().slice(0, 1);
            }
            else if (geometryType_1 === ol.geom.GeometryType.MULTI_POLYGON) {
                var endss = geometry.getEndss();
                ends = [];
                for (i = 0, ii = endss.length; i < ii; ++i) {
                    ends.push(endss[i][0]);
                }
            }
            this.beginGeometry(geometry, feature);
            var textAlign = textState.textAlign;
            var flatOffset = 0;
            var flatEnd = void 0;
            for (var o = 0, oo = ends.length; o < oo; ++o) {
                if (textAlign === undefined) {
                    var range = ol.geom.flat.straightchunk.lineString(textState.maxAngle, flatCoordinates_1, flatOffset, ends[o], stride_1);
                    flatOffset = range[0];
                    flatEnd = range[1];
                }
                else {
                    flatEnd = ends[o];
                }
                for (i = flatOffset; i < flatEnd; i += stride_1) {
                    this.coordinates.push(flatCoordinates_1[i], flatCoordinates_1[i + 1]);
                }
                end_1 = this.coordinates.length;
                flatOffset = ends[o];
                this.drawChars_(begin_1, end_1, this.declutterGroup_);
                begin_1 = end_1;
            }
            this.endGeometry(geometry, feature);
            return;
        }
        // if (this.label === undefined) { return; }
        var begin = this.coordinates.length;
        var flatCoordinates = this.labelPosition;
        var end = 2;
        var stride = 2;
        var label = this.label;
        if (geometry.getType() === ol.geom.GeometryType.POLYGON) {
            stride = 3;
        }
        // let begin = this.coordinates.length;
        // let geometryType = geometry.getType();
        // let flatCoordinates = null;
        // let end = 2;
        // let stride = 2;
        // let i, ii;
        // if (textState.placement === (<any>ol.style).TextPlacement.LINE) {
        //     if (!ol.extent.intersects(this.getBufferedMaxExtent(), geometry.getExtent())) {
        //         return;
        //     }
        //     let ends;
        //     flatCoordinates = geometry.getFlatCoordinates();
        //     stride = geometry.getStride();
        //     if (geometryType === (<any>ol.geom).GeometryType.LINE_STRING) {
        //         ends = [flatCoordinates.length];
        //     } else if (geometryType === (<any>ol.geom).GeometryType.MULTI_LINE_STRING) {
        //         ends = geometry.getEnds();
        //     } else if (geometryType === (<any>ol.geom).GeometryType.POLYGON) {
        //         ends = geometry.getEnds().slice(0, 1);
        //     } else if (geometryType === (<any>ol.geom).GeometryType.MULTI_POLYGON) {
        //         let endss = geometry.getEndss();
        //         ends = [];
        //         for (i = 0, ii = endss.length; i < ii; ++i) {
        //             ends.push(endss[i][0]);
        //         }
        //     }
        //     this.beginGeometry(geometry, feature);
        //     let textAlign = textState.textAlign;
        //     let flatOffset = 0;
        //     let flatEnd;
        //     for (let o = 0, oo = ends.length; o < oo; ++o) {
        //         if (textAlign === undefined) {
        //             let range = (<any>ol.geom).flat.straightchunk.lineString(
        //                 textState.maxAngle, flatCoordinates, flatOffset, ends[o], stride);
        //             flatOffset = range[0];
        //             flatEnd = range[1];
        //         } else {
        //             flatEnd = ends[o];
        //         }
        //         for (i = flatOffset; i < flatEnd; i += stride) {
        //             this.coordinates.push(flatCoordinates[i], flatCoordinates[i + 1]);
        //         }
        //         end = this.coordinates.length;
        //         flatOffset = ends[o];
        //         this.drawChars_(begin, end, this.declutterGroup_);
        //         begin = end;
        //     }
        //     this.endGeometry(geometry, feature);
        // } else {
        //     let label = this.getImage(this.text_, this.textKey_, this.fillKey_, this.strokeKey_);
        //     let width = label.width / this.pixelRatio;
        //     let Constructor = this.BATCH_CONSTRUCTORS_CUSTOM[geometryType];
        //     let textLabelingStrategy = new Constructor();
        //     switch (geometryType) {
        //         case (<any>ol.geom).GeometryType.POINT:
        //         case (<any>ol.geom).GeometryType.MULTI_POINT:
        //             flatCoordinates = geometry.getFlatCoordinates();
        //             end = flatCoordinates.length;
        //             break;
        //         case (<any>ol.geom).GeometryType.LINE_STRING:
        //             flatCoordinates = /** @type {ol.geom.LineString} */ (geometry).getFlatMidpoint();
        //             if (!textLabelingStrategy.MarkLocation(flatCoordinates, label, this.resolution)) {
        //                 return;
        //             }
        //             break;
        //         case (<any>ol.geom).GeometryType.CIRCLE:
        //             flatCoordinates = /** @type {ol.geom.Circle} */ (geometry).getCenter();
        //             break;
        //         case (<any>ol.geom).GeometryType.MULTI_LINE_STRING:
        //             flatCoordinates = /** @type {ol.geom.MultiLineString} */ (geometry).getFlatMidpoints();
        //             end = flatCoordinates.length;
        //             break;
        //         case (<any>ol.geom).GeometryType.POLYGON:
        //             flatCoordinates = /** @type {ol.geom.Polygon} */ (geometry).getFlatInteriorPoint();
        //             if (!textState.overflow && flatCoordinates[2] / this.resolution < width) {
        //                 return;
        //             }
        //             // if (!textLabelingStrategy.MarkLocation(flatCoordinates, label, this.resolution)) {
        //             //     return;
        //             // }
        //             stride = 3;
        //             break;
        //         case (<any>ol.geom).GeometryType.MULTI_POLYGON:
        //             let interiorPoints = /** @type {ol.geom.MultiPolygon} */ (geometry).getFlatInteriorPoints();
        //             flatCoordinates = [];
        //             for (i = 0, ii = interiorPoints.length; i < ii; i += 3) {
        //                 if (textState.overflow || interiorPoints[i + 2] / this.resolution >= width) {
        //                     flatCoordinates.push(interiorPoints[i], interiorPoints[i + 1]);
        //                 }
        //             }
        //             end = flatCoordinates.length;
        //             if (end === 0) {
        //                 return;
        //             }
        //             break;
        //         default:
        //     }
        end = this.appendFlatCoordinates(flatCoordinates, 0, end, stride, false, false);
        this.beginGeometry(geometry, feature);
        if (textState.backgroundFill || textState.backgroundStroke) {
            this.setFillStrokeStyle(textState.backgroundFill, textState.backgroundStroke);
            this.updateFillStyle(this.state, this.applyFill, geometry);
            this.updateStrokeStyle(this.state, this.applyStroke);
        }
        this.drawTextImage_(label, begin, end);
        this.endGeometry(geometry, feature);
        // }
    };
    return TextReplayCustom;
}(ol.render.canvas.TextReplay));



/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TreeNode; });
var TreeNode = /** @class */ (function () {
    function TreeNode(data) {
        this.data = data;
        this.children = [];
    }
    return TreeNode;
}());



/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Tree; });
var Tree = /** @class */ (function () {
    function Tree(node, treeIndex) {
        this.node = node;
        this.root = node;
        this.treeIndex = treeIndex;
    }
    Tree.prototype.traverseNode = function (callback, select) {
        (function recurse(currentNode) {
            if (callback(currentNode)) {
                if (currentNode.children.length > 0) {
                    for (var i = 0, length_1 = currentNode.children.length; i < length_1; i++) {
                        if (recurse(currentNode.children[i])) {
                            break;
                        }
                    }
                }
                else {
                    // current node is matched, and without children
                    select(currentNode);
                }
                // true: the currentNode is matched.
                return true;
            }
            // false: the currentNode is not matched.
            return false;
        })(this.root);
    };
    return Tree;
}());



/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WorkerManager; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__vectorTileLayerThreadMode__ = __webpack_require__(4);

var WorkerManager = /** @class */ (function () {
    function WorkerManager(threadMode, workerCount) {
        if (threadMode === __WEBPACK_IMPORTED_MODULE_0__vectorTileLayerThreadMode__["a" /* VectorTileLayerThreadMode */].SingleBackgroundWorker) {
            this.workerCount = 1;
        }
        else {
            if (isNaN(workerCount) || workerCount <= 0) {
                this.workerCount = Math.max(Math.floor(window.navigator.hardwareConcurrency / 2), 1);
            }
            else {
                // passed by parm
                this.workerCount = workerCount;
            }
        }
        this.currentWorkerIndex = 0;
        this.workers = [];
        this.workerCallback = {};
    }
    WorkerManager.prototype.initWorkers = function () {
        try {
            var callbacks_1 = this.workerCallback;
            for (var i = 0; i < this.workerCount; i++) {
                var source = '(' + window["olInit"] + ')()';
                var blob = new Blob([source]);
                var worker = new Worker(window.URL.createObjectURL(blob));
                worker.onmessage = function (e) {
                    var methodInfo = e.data["methodInfo"];
                    var messageData = e.data["messageData"];
                    var uid = methodInfo.uid;
                    var callback = callbacks_1[uid];
                    if (callback) {
                        callback(messageData, methodInfo);
                    }
                    delete callbacks_1[uid];
                };
                this.workers.push(worker);
            }
            this.inited = true;
            return true;
        }
        catch (e) {
            this.inited = false;
            return false;
        }
    };
    WorkerManager.prototype.postMessage = function (uid, methodName, messageData, callbackInfo, workerIndex) {
        if (typeof workerIndex !== "number" || isNaN(workerIndex) || workerIndex >= this.workers.length) {
            workerIndex = this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length;
        }
        var methodInfo = {
            uid: uid,
            methodName: methodName,
            workerId: workerIndex
        };
        if (callbackInfo) {
            this.workerCallback[uid] = callbackInfo;
        }
        var postMessage = {
            methodInfo: methodInfo,
            messageData: messageData
        };
        this.workers[workerIndex].postMessage(postMessage);
        return workerIndex;
    };
    return WorkerManager;
}());



/***/ })
/******/ ]);