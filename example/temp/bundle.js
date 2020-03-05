/******/ (function (modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if (installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
            /******/
        }
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
            /******/
        };
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
        /******/
    }
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function (exports, name, getter) {
/******/ 		if (!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
        /******/
    });
            /******/
        }
        /******/
    };
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function (module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
        /******/
    };
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
    /******/
})
/************************************************************************/
/******/([
/* 0 */
/***/ (function (module, exports, __webpack_require__) {

        "use strict";


        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        var _sidebarTemplate = __webpack_require__(1);

        var _childPageTemplate = __webpack_require__(3);

        var _search = __webpack_require__(4);

        var _data = __webpack_require__(2);

        var _data2 = _interopRequireDefault(_data);

        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        (0, _sidebarTemplate.generatorMenubar)(_data2.default);
        (0, _childPageTemplate.addChildPage)(document.getElementById('content'));

        if (window.location.hash) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = _data2.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var obj = _step.value;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = obj.subitems[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var sub = _step2.value;

                            if (window.location.hash == '#' + sub.title.replace(/\s+/g, "")) {
                                (0, _childPageTemplate.loadChildPage)(sub);
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        } else {
            (0, _childPageTemplate.loadChildPage)(_data2.default[0].subitems[0]);
        }

        var matchSmallScreen = function matchSmallScreen() {
            var match = window.matchMedia("(max-width:767px)");
            if (match.matches) {
                return true;
            }
        };

        //click the li, addClass active.
        var sidebarClickHandle = function sidebarClickHandle() {
            $('#menu-bar>ul>li').on('click', function () {
                $('#menu-bar>ul>li').removeClass('active');
                $(this).addClass('active');
                var styleName = $(this).parent().prev().children().text();
                var title = $(this).children().children().text();
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = _data2.default[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _obj = _step3.value;

                        if (_obj.styleName === styleName) {
                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = _obj.subitems[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var _sub = _step4.value;

                                    if (_sub.title === title) {
                                        (0, _childPageTemplate.loadChildPage)(_sub);
                                        if (matchSmallScreen()) {
                                            hideMenuList();
                                        }
                                        break;
                                    }
                                }
                            } catch (err) {
                                _didIteratorError4 = true;
                                _iteratorError4 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                        _iterator4.return();
                                    }
                                } finally {
                                    if (_didIteratorError4) {
                                        throw _iteratorError4;
                                    }
                                }
                            }

                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            });
        };

        var hideMenuList = function hideMenuList() {
            document.getElementsByClassName('navbar-toggler')[0].classList.add('collapsed');
            document.getElementById('sidebar').classList.remove('show');
        };

        sidebarClickHandle();

        window.addEventListener('DOMContentLoaded', function () {

            document.getElementById('sidebar-search').oninput = function () {
                (0, _search.searchMenu)($('#sidebar-search').val());
            };

            var clickEvent = 'ontouchend' in document ? 'touchend' : 'click';
            document.getElementsByTagName('body')[0].addEventListener(clickEvent, function (e) {
                var target = void 0;
                if (e.touches && e.touches[0]) {
                    target = e.touches[0];
                } else {
                    target = e.target;
                }

                if (target.classList.contains('mobile-des') || target.classList.contains('info')) {
                    document.getElementsByClassName('mobile-des')[0].classList.remove('hide');
                } else {
                    document.getElementsByClassName('mobile-des')[0].classList.add('hide');
                }
            });

            // Set the height
            var totalH = document.querySelector('#content').clientHeight;
            var titleH = document.querySelector('#child-page-title').clientHeight;
            var navbarH = document.querySelector('.navbar').clientHeight;
            var u = navigator.userAgent;
            var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            var contentH = 0;
            if (isiOS) {
                contentH = totalH - titleH - navbarH - 60;
            } else {
                contentH = totalH - titleH - 36;
            }
            document.querySelector('#child-page-view').style.height = contentH + 'px';
        });

        exports.default = sidebarClickHandle;

        /***/
    }),
/* 1 */
/***/ (function (module, exports, __webpack_require__) {

        "use strict";


        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var createTemplate = function createTemplate(dataTarget, styleName, subitems) {
            return '<li data-toggle="collapse" data-target="#' + dataTarget + '"  aria-expanded="true">\n    <a href="#"  >' + styleName + '<span class="arrow"></span></a>\n</li>\n<ul id="' + dataTarget + '" class="sub-menu collapse nav" data-parent="#menu-bar">' + createTemplateLi(subitems) + '</ul>';
        };

        var createTemplateLi = function createTemplateLi(subitems) {
            var str = '';
            subitems.map(function (val) {
                str += '<li><a href="#' + val.replace(/\s+/g, "") + '"><span class="sub-arrow">' + val + '</span></a>\n        </li>';
            });
            return str;
        };

        var generatorMenubar = function generatorMenubar(data) {
            var str = '';
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var obj = _step.value;

                    var subitem = [];
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = obj.subitems[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var sub = _step2.value;

                            subitem.push(sub.title);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    str += createTemplate(obj.dataTarget, obj.styleName, subitem);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            $('#menu-bar').html(str);
            if (!window.location.href.split('/#')[1]) {
                //no item active
                $('#menu-bar>ul:nth-child(2)').addClass('show');
                $('#menu-bar>ul:nth-child(2)>li:first-child').addClass('active');
            } else {
                var mapTitle = window.location.href.split('/#')[1];
                var currentNavItem = $('a[href=\'#' + mapTitle + '\']');
                currentNavItem.parent().parent().addClass('show');
                currentNavItem.parent().addClass('active');
            }
        };

        exports.generatorMenubar = generatorMenubar;

        /***/
    }),
/* 2 */
/***/ (function (module, exports, __webpack_require__) {

        "use strict";


        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var menuData = [{
            dataTarget: 'openlayers',
            styleName: 'Openlayers',
            subitems: [{
                comments: "ThinkGeo's Map Suite WebAPI Edition makes it easy for you to add mapping functionality to your application quickly and efficiently. This sample shows some of the basic functionality of each of the JavaScript client libraries. The Quick Start Guide will show you everything you need to know to start building your first app.",
                title: 'Getting Started',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/vector-tiles.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Getting Started" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/GetStartedWithMap/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%;" style="width: 100%;" scrolling="no" title="Getting Started" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/GetStartedWithMap/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Customize your labeling with Map Suite WebAPI Edition. Explore different techniques for labeling features.",
                title: 'Labeling',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/vector-tiles-on-aerial-imagery.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Vector Tiles on Aerial Imagery" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Labeling/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Vector Tiles on Aerial Imagery" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Labeling/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Visualize your data with a variety of styles available in Map Suite WebAPI Edition. Some of the available styles include: filter styles, point cluster styles, ZedGraph, dot density renderers, heat styling and more.",
                title: 'Visualization',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/vector-tiles-on-3rd-party-imagery.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Vector Tiles on 3rd Party Imagery" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/visualization/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Vector Tiles on 3rd Party Imagery" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/visualization/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Utilize geometric functions to manipulate and analyze features in a variety of ways. From basic area and distance measurements to complex buffering; Map Suite WebAPI Edition provides you with a number of geometric functions.",
                title: 'Geometric Functions',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-tiles.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%;" style="width: 100%;" scrolling="no" title="Raster Tiles" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/GeometricFunctions/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%;" style="width: 100%;" scrolling="no" title="Raster Tiles" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/GeometricFunctions/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Create and edit shapes on the map. Draw and edit existing features to create powerful mapping applications.",
                title: 'Draw and Edit Features',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-maps-high-resolution.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/DrawEditFeatures/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/DrawEditFeatures/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Map Suite supports a number of data format. This sample shows you how to render some of the more common data formats.",
                title: 'Layers',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-map-through-wms.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Map through WMS" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Layers/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Map through WMS" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Layers/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Visualize your data with some of available styles, including PointStyle, LineStyle, AreaStyle, CompoundStyles, and PredefinedStyles. These can be used together to achieve desired effects.",
                title: 'Basic Styling',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-maps-high-resolution.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/BasicStyling/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/BasicStyling/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Explore how to make your maps more interactive by using Markers and Popups.",
                title: 'Markers and Popups',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-map-through-wms.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Map through WMS" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/MarkerAndPopup/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Map through WMS" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/MarkerAndPopup/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Discover all the different ways you can query your data. This sample contains various querying tools.",
                title: 'Query Tools',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-maps-high-resolution.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/QueryTools/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/QueryTools/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Discover how to use overlays to build up your map or add existing basemaps to your application. In this sample we show you how add World Map Kit, Open Street Map, Bing Maps, Google Maps and custom overlays.",
                title: 'Overlays',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-maps-high-resolution.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Overlays/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Overlays/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Learn about map projections and how to apply it to your data. This sample shows you some of the more common map projections.",
                title: 'Projection',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-maps-high-resolution.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Projection/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Projection/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Learn about how to use topology validation with map suite. You can add build those validation to your projects.",
                title: 'Topology Validation',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-maps-high-resolution.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Projection/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Projection/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Learn how to implement printing capabilities into your application.",
                title: 'Printing',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-maps-high-resolution.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;background-color:#ffffff" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Printing/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;background-color:#ffffff" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Printing/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }, {
                comments: "Learn how to add legends, scale bars, north arrows and many more adornments to your map.",
                title: 'Adornments',
                codePenDownloadUrl: 'https://cdn.thinkgeo.com/samples/cloud/thinkgeo-base-maps/raster-maps-high-resolution.zip',
                codePenIframeOnLargeScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Adornments/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>',
                codePenIframeOnSmallScreen: '<iframe height="100%" style="width: 100%;" scrolling="no" title="Raster Tiles (High Resolution)" src="https://samples.thinkgeo.com/WebApiEdition/SampleTemplates/Adornments/openlayers/" frameborder="no" allowtransparency="true" allowfullscreen="true"></iframe>'
            }]
        }];

        exports.default = menuData;

        /***/
    }),
/* 3 */
/***/ (function (module, exports, __webpack_require__) {

        "use strict";


        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

        function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

        var childPageTemplate = ' <div id="child-page-title" class="pl-md-0 pl-3">\n    <h1><span class="title"></span> <span class="info">i<p class="mobile-des hide"></p></span></h1>\n    <div class="description-wrap">\n        <p class="sample-description"><p>\n        <a type="button" class="download-sample">Download <span>Source</span></a>\n    </div>\n</div>\n<div class="tab-content" id="child-page-view">\n    \n</div>\n</div>';
        var addChildPage = function addChildPage(ele) {
            ele.innerHTML = childPageTemplate;
        };
        var ShowHandleFuns = function () {
            function ShowHandleFuns(childPageObj) {
                _classCallCheck(this, ShowHandleFuns);

                this.htmlPath = childPageObj.htmlPath;
                this.jsPath = childPageObj.jsPath;
                this.title = childPageObj.title;
                this.comments = childPageObj.comments;
                this.codePenDownloadUrl = childPageObj.codePenDownloadUrl;
                this.codePenIframeOnLargeScreen = childPageObj.codePenIframeOnLargeScreen;
                this.codePenIframeOnSmallScreen = childPageObj.codePenIframeOnSmallScreen;
                document.querySelector('.mobile-des').innerHTML = this.comments;
                document.querySelector('.title').innerHTML = this.title;
                // document.querySelector('#child-page-title>h1').innerText = this.title;
                document.querySelector('.sample-description').innerHTML = this.comments;
                document.querySelector('.download-sample').href = this.codePenDownloadUrl;
            }

            _createClass(ShowHandleFuns, [{
                key: 'showHtmlViewFun',
                value: function showHtmlViewFun(viewDiv) {
                    // Handle the Donload and description UI.
                    if (document.getElementById('child-page-view').offsetWidth >= 600) {
                        this.codePenIframe = this.codePenIframeOnLargeScreen;
                        document.querySelector('.download-sample span').style.display = 'inline-block';
                        document.querySelector('.sample-description').style.paddingRight = '132px';
                    } else {
                        this.codePenIframe = this.codePenIframeOnSmallScreen;
                        document.querySelector('.download-sample span').style.display = 'none';
                        document.querySelector('.sample-description').style.paddingRight = '90px';
                    }

                    // Load the viewport.
                    viewDiv.innerHTML = this.codePenIframe;
                }
            }]);

            return ShowHandleFuns;
        }();

        var loadChildPage = function loadChildPage(childPageObj) {
            var showHandlefun = new ShowHandleFuns(childPageObj);
            var viewDiv = document.getElementById('child-page-view');
            showHandlefun.showHtmlViewFun(viewDiv);
        };

        exports.addChildPage = addChildPage;
        exports.loadChildPage = loadChildPage;

        /***/
    }),
/* 4 */
/***/ (function (module, exports, __webpack_require__) {

        "use strict";


        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.searchMenu = undefined;

        var _data = __webpack_require__(2);

        var _data2 = _interopRequireDefault(_data);

        var _index = __webpack_require__(0);

        var _index2 = _interopRequireDefault(_index);

        var _sidebarTemplate = __webpack_require__(1);

        function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

        var searchMenu = function searchMenu(inputValue) {
            var data = [];
            if (inputValue.search(/^\S+$/g)) {
                (0, _sidebarTemplate.generatorMenubar)(_data2.default);
            } else {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _data2.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var obj = _step.value;

                        var re = new RegExp('' + inputValue, 'i');
                        if (obj.styleName.search(re) === -1) {
                            //father fail
                            var newObj = {
                                dataTarget: '',
                                styleName: '',
                                subitems: []
                            };
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = obj.subitems[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var child = _step2.value;

                                    if (child.title.search(re) !== -1) {
                                        //child success
                                        newObj.dataTarget = obj.dataTarget;
                                        newObj.styleName = obj.styleName;
                                        newObj.subitems.push(child);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError2 = true;
                                _iteratorError2 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                        _iterator2.return();
                                    }
                                } finally {
                                    if (_didIteratorError2) {
                                        throw _iteratorError2;
                                    }
                                }
                            }

                            if (newObj.dataTarget && newObj.styleName) {
                                data.push(newObj);
                            }
                        } else {
                            data.push(obj);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                (0, _sidebarTemplate.generatorMenubar)(data);
            }
            (0, _index2.default)();
        };

        exports.searchMenu = searchMenu;

        /***/
    })
/******/]);
//# sourceMappingURL=bundle.js.map