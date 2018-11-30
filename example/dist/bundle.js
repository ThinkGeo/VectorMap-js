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
/******/ 	__webpack_require__.p = "temp/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

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
(0, _childPageTemplate.loadChildPage)(_data2.default[0].subitems[0]);

//click the li, addclass active.
var sidebarClickHandle = function sidebarClickHandle() {
    $('#menu-bar>ul>li').on('click', function () {
        $('#menu-bar>ul>li').removeClass('active');
        $(this).addClass('active');
        var styleName = $(this).parent().prev().children().text();
        var title = $(this).children().children().text();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = _data2.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var obj = _step.value;

                if (obj.styleName === styleName) {
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = obj.subitems[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var sub = _step2.value;

                            if (sub.title === title) {
                                (0, _childPageTemplate.loadChildPage)(sub);
                                break;
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

                    break;
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
    });
};
sidebarClickHandle();

document.getElementById('sidebar-search').oninput = function () {
    (0, _search.searchMenu)($('#sidebar-search').val());
};

exports.default = sidebarClickHandle;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

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
        str += '<li><a href="#"><span class="sub-arrow">' + val + '</span></a>\n        </li>';
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
    $('#menu-bar>ul:nth-child(2)').addClass('show');
    $('#menu-bar>ul:nth-child(2)>li:first-child').addClass('active');
};

exports.generatorMenubar = generatorMenubar;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var menuData = [{
    dataTarget: 'base-Maps',
    styleName: 'Base Maps',
    subitems: [{
        title: 'Cloud Vector Maps',
        htmlPath: './html/cloud-vector-maps.html',
        jsPath: './js/cloud-vector-maps.js'
    }, {
        title: 'Cloud Raster Maps',
        htmlPath: './html/cloud-raster-maps.html',
        jsPath: './js/cloud-raster-maps.js'
    }, {
        title: 'Satellite with Labels ',
        htmlPath: './html/satellite-with-labels.html',
        jsPath: './js/satellite-with-labels.js'
    }, {
        title: 'Imagery with Labels  ',
        htmlPath: './html/imagery-with-labels.html',
        jsPath: './js/imagery-with-labels.js'
    }, {
        title: 'Retina Maps ',
        htmlPath: './html/retina-maps.html',
        jsPath: './js/retina-maps.js'
    }]
}, {
    dataTarget: 'statistics',
    styleName: 'Statistics',
    subitems: [{
        title: 'Heatmap KML',
        htmlPath: './html/heatmap-KML.html',
        jsPath: './js/heatmap-KML.js'
    }, {
        title: 'Heatmap JSON',
        htmlPath: './html/heatmap-json.html',
        jsPath: './js/heatmap-json.js'
    }, {
        title: 'Contour Line',
        htmlPath: './html/contour-line.html',
        jsPath: './js/contour-line.js'
    }, {
        title: 'Contour Plane',
        htmlPath: './html/contour-plane.html',
        jsPath: './js/contour-plane.js'
    }, {
        title: 'Scatter',
        htmlPath: './html/scatter.html',
        jsPath: './js/scatter.js'
    }, {
        title: 'Pie Chart',
        htmlPath: './html/pie-chart.html',
        jsPath: './js/pie-chart.js'
    }, {
        title: 'AQI Radar',
        htmlPath: './html/AQI-radar.html',
        jsPath: './js/AQI-radar.js'
    }, {
        title: 'Cluster Envelope',
        htmlPath: './html/cluster-envelope.html',
        jsPath: './js/cluster-envelope.js'
    }, {
        title: 'Hexagon',
        htmlPath: './html/hexagon.html',
        jsPath: './js/hexagon.js'
    }, {
        title: 'Average Round Trip Commute Time',
        htmlPath: './html/trip-commute-time.html',
        jsPath: './js/trip-commute-time.js'
    }]
}, {
    dataTarget: 'styling',
    styleName: 'Styling',
    subitems: [{
        title: 'Styling Points',
        htmlPath: './html/styling-points.html',
        jsPath: './js/styling-points.js'
    }, {
        title: 'Styling Lines',
        htmlPath: './html/styling-lines.html',
        jsPath: './js/styling-lines.js'
    }, {
        title: 'Styling Polygons',
        htmlPath: './html/styling-polygons.html',
        jsPath: './js/styling-polygons.js'
    }, {
        title: 'Labeling Features',
        htmlPath: './html/labeling-features.html',
        jsPath: './js/labeling-features.js'
    }, {
        title: 'Marking Places',
        htmlPath: './html/marking-places.html',
        jsPath: './js/marking-places.js'
    }]
}, {
    dataTarget: 'vector-data',
    styleName: 'Vector Data',
    subitems: [{
        title: 'Vector Tile',
        htmlPath: './html/vector-tile.html',
        jsPath: './js/vector-tile.js'
    }, {
        title: 'GeoJSON ',
        htmlPath: './html/geojson.html',
        jsPath: './js/geojson.js'
    }, {
        title: 'KML ',
        htmlPath: './html/KML.html',
        jsPath: './js/KML.js'
    }, {
        title: 'WFS ',
        htmlPath: './html/WFS.html',
        jsPath: './js/WFS.js'
    }, {
        title: 'WKT ',
        htmlPath: './html/WKT.html',
        jsPath: './js/WKT.js'
    }, {
        title: 'GML ',
        htmlPath: './html/GML.html',
        jsPath: './js/GML.js'
    }, {
        title: 'GPX ',
        htmlPath: './html/GPX.html',
        jsPath: './js/GPX.js'
    }]
}, {
    dataTarget: 'thinkGeo-cloud',
    styleName: 'ThinkGeo Cloud',
    subitems: [{
        title: 'Elevation along Path ',
        htmlPath: './html/elevation.html',
        jsPath: './js/elevation.js'
    }, {
        title: 'Reverse Geocoding',
        htmlPath: './html/reverse-geocoding.html',
        jsPath: './js/reverse-geocoding.js'
    }, {
        title: 'Color Utilities ',
        htmlPath: './html/color-creation.html',
        jsPath: './js/color-creation.js'
    }]
}, {
    dataTarget: 'JavaScript-frameworks',
    styleName: 'JavaScript frameworks',
    subitems: [{
        title: 'JQuery',
        htmlPath: './html/jquery.html',
        jsPath: './js/Jquery.js'
    }, {
        title: 'Angular JS',
        htmlPath: './html/event2.html',
        jsPath: './js/event2.js'
    }, {
        title: 'React JS',
        htmlPath: './html/event3.html',
        jsPath: './js/event3.js'
    }, {
        title: 'Vue.JS',
        htmlPath: './html/vue.html',
        jsPath: './js/vue.js'
    }]
}];
exports.default = menuData;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var childPageTemplate = ' <div id="child-page-title">\n    <h4></h4>\n</div>\n<ul class="nav nav-tabs" id="child-page-component" role="tablist">\n     <li class="nav-item">\n        <a class="nav-link active"  data-toggle="tab" href="#child-page-view">View</a>\n    </li>\n      <li class="nav-item">\n        <a class="nav-link "  data-toggle="tab" href="#child-page-html">Html</a>\n    </li>\n      <li class="nav-item mr-auto">\n        <a class="nav-link "  data-toggle="tab" href="#child-page-js">JavaScript</a>\n    </li>\n    <li class="nav-item">\n      <a  class="nav-link" href="https://codepen.io" target="_blank">\n        <img src="./image/edit-icon.png">\n        Edit</a>\n    </li>\n \n \n</ul>\n<div class="tab-content">\n    <div id="child-page-view" class="tab-pane fade show active">\n        <iframe src="" frameborder=0 height=100% width=100% align=center></iframe>\n    </div>\n    <div id="child-page-html" class="tab-pane fade">\n    </div>\n    <div id="child-page-js" class="tab-pane fade">\n    </div>\n</div>\n</div>';
var addChildPage = function addChildPage(ele) {
    ele.innerHTML = childPageTemplate;
};
var ShowHandleFuns = function () {
    function ShowHandleFuns(childPageObj) {
        _classCallCheck(this, ShowHandleFuns);

        this.htmlPath = childPageObj.htmlPath;
        this.jsPath = childPageObj.jsPath;
        this.title = childPageObj.title;
        var childPageClickButtonsParent = document.querySelector('#child-page-component');
        document.querySelector('#child-page-title>h4').innerText = this.title;
    }

    _createClass(ShowHandleFuns, [{
        key: 'showCodeFun',
        value: function showCodeFun(div, path) {
            fetch(path, {
                method: 'GET'
            }).then(function (res) {
                if (res.ok) {
                    res.blob().then(function (data) {
                        var reader = new FileReader();
                        reader.addEventListener('loadend', function () {
                            var str = reader.result;
                            str = str.replace(/\</gm, '&lt;');
                            str = str.replace(/\>/gm, '&gt;');
                            var preCode = '<pre style="height: ' + (window.innerHeight - 200) + 'px"><code> ' + str + '\n                              </code></pre>';
                            div.innerHTML = preCode;
                            (function () {
                                $('pre code').each(function () {
                                    var lines = $(this).text().split('\n').length - 1;
                                    if (lines < 4) return;
                                    var $numbering = $('<ol/>').addClass('pre-numbering');
                                    $(this).addClass('has-numbering').parent().append($numbering);
                                    for (var i = 1; i <= lines; i++) {
                                        $numbering.append($('<li/>').text(i));
                                    }
                                });
                            })();
                            $(div).each(function (i, e) {
                                hljs.highlightBlock(e, null, true);
                            });
                        });
                        reader.readAsText(data);
                    });
                } else {
                    console.log("Looks like the response wasn't perfect, got status", res.status);
                }
            }, function (e) {
                console.log("Fetch failed!", e);
            });
        }
    }, {
        key: 'showHtmlViewFun',
        value: function showHtmlViewFun(viewDiv) {
            viewDiv.querySelector('iframe').src = this.htmlPath;
        }
    }, {
        key: 'showHtmlCodeFun',
        value: function showHtmlCodeFun(htmlDiv) {
            this.showCodeFun(htmlDiv, this.htmlPath);
        }
    }, {
        key: 'showJsCodeFun',
        value: function showJsCodeFun(jsDiv) {
            this.showCodeFun(jsDiv, this.jsPath);
        }
    }]);

    return ShowHandleFuns;
}();
/**
 * loadChildPage({
    title: 'Title',
    htmlPath: 'http://ap.thinkgeo.com:9205/areaStyle.html',
    jsPath: 'pages/stylejson/areastyle/bundle.js'
    });
 */
var loadChildPage = function loadChildPage(childPageObj) {
    if (!childPageObj.htmlPath || !childPageObj.jsPath) {
        alert('html path or js path is not right!');
        return;
    }
    //for queryselect
    var viewDivId = '#child-page-view',
        htmlDivId = '#child-page-html',
        jsDivId = '#child-page-js';
    var _ref = [document.querySelector(viewDivId), document.querySelector(htmlDivId), document.querySelector(jsDivId)],
        viewDiv = _ref[0],
        htmlDiv = _ref[1],
        jsDiv = _ref[2];


    var showHandlefun = new ShowHandleFuns(childPageObj);

    showHandlefun.showHtmlViewFun(viewDiv);
    var childPageClickButtonsParent = document.querySelector('#child-page-component');
    childPageClickButtonsParent.addEventListener('click', function (event) {
        var eleAHerf = event.target.getAttribute('href');
        switch (eleAHerf) {
            case viewDivId:
                {
                    showHandlefun.showHtmlViewFun(viewDiv);
                    break;
                }
            case htmlDivId:
                {
                    showHandlefun.showHtmlCodeFun(htmlDiv);
                    break;
                }
            case jsDivId:
                {
                    showHandlefun.showJsCodeFun(jsDiv);
                    break;
                }
            default:
                {
                    return;
                }
        }
    });
};

exports.addChildPage = addChildPage;
exports.loadChildPage = loadChildPage;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ })
/******/ ]);