(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");



var routes = [];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forRoot(routes)],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());



/***/ }),

/***/ "./src/app/app.component.css":
/*!***********************************!*\
  !*** ./src/app/app.component.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "#map {\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n\r\n#lines {\r\n  position: absolute;\r\n  right: 0;\r\n  top: 0;\r\n  background: #fff;\r\n  padding: 0.6rem;\r\n  box-shadow: 0 2px 4px rgba(0, 0, 0, .2), 0 -1px 0 rgba(0, 0, 0, .02);\r\n  border-bottom-left-radius: 5px;\r\n  z-index: 1000;\r\n}\r\n\r\n#lines label {\r\n  display: inline-block;\r\n  width: 100px;\r\n  color: #5f6b78;\r\n  text-align: right;\r\n  margin: 12px 5px;\r\n}\r\n\r\n#lines input,\r\n#lines select {\r\n  width: 143px;\r\n  padding: 3px 12px;\r\n  line-height: 1.42857;\r\n  color: #555;\r\n  background-color: #fff;\r\n  background-image: none;\r\n  border: 1px solid #ccc;\r\n  border-radius: 4px;\r\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\r\n  transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\r\n}\r\n\r\n#lines select {\r\n  width: 169px;\r\n}\r\n\r\n#lines input:focus,\r\n#lines select:focus {\r\n  border-color: #66afe9;\r\n  outline: 0;\r\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);\r\n}\r\n\r\n#lines button {\r\n  display: inline-block;\r\n  padding: 6px 12px;\r\n  margin-bottom: 0;\r\n  font-size: 14px;\r\n  font-weight: normal;\r\n  line-height: 1.428571429;\r\n  text-align: right;\r\n  white-space: nowrap;\r\n  vertical-align: middle;\r\n  cursor: pointer;\r\n  border: 1px solid #357ebd;\r\n  border-radius: 4px;\r\n  color: #fff;\r\n  background-color: #428bca;\r\n}\r\n\r\n#lines button:focus {\r\n  outline: 0;\r\n}\r\n\r\n#lines button:active {\r\n  box-shadow: inset 0 5px 4px rgba(0, 0, 0, .075);\r\n}\r\n\r\n#lines div {\r\n  width: 100%;\r\n  text-align: right;\r\n}\r\n\r\n\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvYXBwLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxZQUFZO0VBQ1osYUFBYTtDQUNkOztBQUVEO0VBQ0UsbUJBQW1CO0VBQ25CLFNBQVM7RUFDVCxPQUFPO0VBQ1AsaUJBQWlCO0VBQ2pCLGdCQUFnQjtFQUNoQixxRUFBcUU7RUFDckUsK0JBQStCO0VBQy9CLGNBQWM7Q0FDZjs7QUFFRDtFQUNFLHNCQUFzQjtFQUN0QixhQUFhO0VBQ2IsZUFBZTtFQUNmLGtCQUFrQjtFQUNsQixpQkFBaUI7Q0FDbEI7O0FBRUQ7O0VBRUUsYUFBYTtFQUNiLGtCQUFrQjtFQUNsQixxQkFBcUI7RUFDckIsWUFBWTtFQUNaLHVCQUF1QjtFQUN2Qix1QkFBdUI7RUFDdkIsdUJBQXVCO0VBQ3ZCLG1CQUFtQjtFQUVuQixnREFBZ0Q7RUFHaEQsdUVBQXVFO0NBQ3hFOztBQUVEO0VBQ0UsYUFBYTtDQUNkOztBQUVEOztFQUVFLHNCQUFzQjtFQUN0QixXQUFXO0VBRVgsaUZBQWlGO0NBQ2xGOztBQUVEO0VBQ0Usc0JBQXNCO0VBQ3RCLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsZ0JBQWdCO0VBQ2hCLG9CQUFvQjtFQUNwQix5QkFBeUI7RUFDekIsa0JBQWtCO0VBQ2xCLG9CQUFvQjtFQUNwQix1QkFBdUI7RUFDdkIsZ0JBQWdCO0VBQ2hCLDBCQUEwQjtFQUMxQixtQkFBbUI7RUFDbkIsWUFBWTtFQUNaLDBCQUEwQjtDQUMzQjs7QUFFRDtFQUNFLFdBQVc7Q0FDWjs7QUFFRDtFQUVFLGdEQUFnRDtDQUNqRDs7QUFFRDtFQUNFLFlBQVk7RUFDWixrQkFBa0I7Q0FDbkIiLCJmaWxlIjoic3JjL2FwcC9hcHAuY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIiNtYXAge1xyXG4gIHdpZHRoOiAxMDAlO1xyXG4gIGhlaWdodDogMTAwJTtcclxufVxyXG5cclxuI2xpbmVzIHtcclxuICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgcmlnaHQ6IDA7XHJcbiAgdG9wOiAwO1xyXG4gIGJhY2tncm91bmQ6ICNmZmY7XHJcbiAgcGFkZGluZzogMC42cmVtO1xyXG4gIGJveC1zaGFkb3c6IDAgMnB4IDRweCByZ2JhKDAsIDAsIDAsIC4yKSwgMCAtMXB4IDAgcmdiYSgwLCAwLCAwLCAuMDIpO1xyXG4gIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6IDVweDtcclxuICB6LWluZGV4OiAxMDAwO1xyXG59XHJcblxyXG4jbGluZXMgbGFiZWwge1xyXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcclxuICB3aWR0aDogMTAwcHg7XHJcbiAgY29sb3I6ICM1ZjZiNzg7XHJcbiAgdGV4dC1hbGlnbjogcmlnaHQ7XHJcbiAgbWFyZ2luOiAxMnB4IDVweDtcclxufVxyXG5cclxuI2xpbmVzIGlucHV0LFxyXG4jbGluZXMgc2VsZWN0IHtcclxuICB3aWR0aDogMTQzcHg7XHJcbiAgcGFkZGluZzogM3B4IDEycHg7XHJcbiAgbGluZS1oZWlnaHQ6IDEuNDI4NTc7XHJcbiAgY29sb3I6ICM1NTU7XHJcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcclxuICBiYWNrZ3JvdW5kLWltYWdlOiBub25lO1xyXG4gIGJvcmRlcjogMXB4IHNvbGlkICNjY2M7XHJcbiAgYm9yZGVyLXJhZGl1czogNHB4O1xyXG4gIC13ZWJraXQtYm94LXNoYWRvdzogaW5zZXQgMCAxcHggMXB4IHJnYmEoMCwgMCwgMCwgLjA3NSk7XHJcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAxcHggMXB4IHJnYmEoMCwgMCwgMCwgLjA3NSk7XHJcbiAgLXdlYmtpdC10cmFuc2l0aW9uOiBib3JkZXItY29sb3IgZWFzZS1pbi1vdXQgLjE1cywgLXdlYmtpdC1ib3gtc2hhZG93IGVhc2UtaW4tb3V0IC4xNXM7XHJcbiAgLW8tdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIGVhc2UtaW4tb3V0IC4xNXMsIGJveC1zaGFkb3cgZWFzZS1pbi1vdXQgLjE1cztcclxuICB0cmFuc2l0aW9uOiBib3JkZXItY29sb3IgZWFzZS1pbi1vdXQgLjE1cywgYm94LXNoYWRvdyBlYXNlLWluLW91dCAuMTVzO1xyXG59XHJcblxyXG4jbGluZXMgc2VsZWN0IHtcclxuICB3aWR0aDogMTY5cHg7XHJcbn1cclxuXHJcbiNsaW5lcyBpbnB1dDpmb2N1cyxcclxuI2xpbmVzIHNlbGVjdDpmb2N1cyB7XHJcbiAgYm9yZGVyLWNvbG9yOiAjNjZhZmU5O1xyXG4gIG91dGxpbmU6IDA7XHJcbiAgLXdlYmtpdC1ib3gtc2hhZG93OiBpbnNldCAwIDFweCAxcHggcmdiYSgwLCAwLCAwLCAuMDc1KSwgMCAwIDhweCByZ2JhKDEwMiwgMTc1LCAyMzMsIC42KTtcclxuICBib3gtc2hhZG93OiBpbnNldCAwIDFweCAxcHggcmdiYSgwLCAwLCAwLCAuMDc1KSwgMCAwIDhweCByZ2JhKDEwMiwgMTc1LCAyMzMsIC42KTtcclxufVxyXG5cclxuI2xpbmVzIGJ1dHRvbiB7XHJcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xyXG4gIHBhZGRpbmc6IDZweCAxMnB4O1xyXG4gIG1hcmdpbi1ib3R0b206IDA7XHJcbiAgZm9udC1zaXplOiAxNHB4O1xyXG4gIGZvbnQtd2VpZ2h0OiBub3JtYWw7XHJcbiAgbGluZS1oZWlnaHQ6IDEuNDI4NTcxNDI5O1xyXG4gIHRleHQtYWxpZ246IHJpZ2h0O1xyXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XHJcbiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcclxuICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgYm9yZGVyOiAxcHggc29saWQgIzM1N2ViZDtcclxuICBib3JkZXItcmFkaXVzOiA0cHg7XHJcbiAgY29sb3I6ICNmZmY7XHJcbiAgYmFja2dyb3VuZC1jb2xvcjogIzQyOGJjYTtcclxufVxyXG5cclxuI2xpbmVzIGJ1dHRvbjpmb2N1cyB7XHJcbiAgb3V0bGluZTogMDtcclxufVxyXG5cclxuI2xpbmVzIGJ1dHRvbjphY3RpdmUge1xyXG4gIC13ZWJraXQtYm94LXNoYWRvdzogaW5zZXQgMCA1cHggNHB4IHJnYmEoMCwgMCwgMCwgLjA3NSk7XHJcbiAgYm94LXNoYWRvdzogaW5zZXQgMCA1cHggNHB4IHJnYmEoMCwgMCwgMCwgLjA3NSk7XHJcbn1cclxuXHJcbiNsaW5lcyBkaXYge1xyXG4gIHdpZHRoOiAxMDAlO1xyXG4gIHRleHQtYWxpZ246IHJpZ2h0O1xyXG59XHJcblxyXG4iXX0= */"

/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!--The content below is only a placeholder and can be replaced.-->\n\n<div id=\"map\">\n  <form id=\"lines\" #form=\"ngForm\" (submit)=\"refresh(form.value)\">\n    <label>Poi Size: </label>\n    <input type=\"number\" name=\"poiSize\" ngModel={{defaultSize}}>\n    <br>\n    <label>Water Color: </label>\n    <select name=\"waterColor\" ngModel={{defaultWaterColor}}>\n      <option *ngFor=\"let color of waterColors\" value=\"{{ color }}\"> {{ color }}</option>\n    </select>\n    <br>\n    <label>Park Color: </label>\n    <select name=\"parkColor\" ngModel={{defaultParkColor}}>\n      <option *ngFor=\"let color of parkColors\" value=\"{{ color }}\"> {{ color }}</option>\n    </select>\n    <br>\n    <div>\n      <button type=\"submit\">refresh</button>\n    </div>\n  </form>\n</div>\n\n\n<router-outlet></router-outlet>\n"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var AppComponent = /** @class */ (function () {
    function AppComponent() {
        this.waterColors = ['#0000CD', '#4169E1', '#0000FF', '#1E90FF'];
        this.defaultWaterColor = this.waterColors[0];
        this.parkColors = ['#25ff00', '#25ff00', '#a29708', '#fe6c00'];
        this.defaultParkColor = this.parkColors[0];
        this.defaultSize = 30;
    }
    AppComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        var layer = new ol.mapsuite.VectorTileLayer('https://samples.thinkgeo.com/cloud/example/data/light.json', {
            'apiKey': 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'
        });
        var map = new ol.Map({
            loadTilesWhileInteracting: true,
            layers: [layer],
            target: 'map',
            view: new ol.View({
                center: ol.proj.fromLonLat([-96.917754, 33.087878]),
                maxZoom: 19,
                maxResolution: 40075016.68557849 / 512,
                zoom: 15,
            }),
        });
        map.addControl(new ol.control.FullScreen());
        var getJson = function () {
            var readTextFile = new Promise(function (resolve, reject) {
                var file = "https://samples.thinkgeo.com/cloud/example/data/light.json";
                var rawFile = new XMLHttpRequest();
                rawFile.overrideMimeType("application/json");
                rawFile.open("GET", file, true);
                rawFile.onreadystatechange = function (ERR) {
                    if (rawFile.readyState === 4) {
                        resolve(rawFile.responseText);
                    }
                };
                rawFile.send(null);
            });
            return readTextFile;
        };
        getJson().then(function (data) {
            _this.json = data;
            _this.json = JSON.parse(_this.json);
        });
        this.updatedstyle = function (poiSize, waterColor, parkColor) {
            var styles = _this.json.styles;
            var stylesLength = styles.length;
            for (var i = 0; i < stylesLength; i++) {
                if (styles[i].id === 'poi_icon') {
                    styles[i]['point-size'] = poiSize;
                }
                else if (styles[i].id === 'water') {
                    styles[i]['polygon-fill'] = waterColor;
                }
                else if (styles[i].id === 'landcover') {
                    var length_1 = styles[i]['style'].length;
                    for (var j = 0; j < length_1; j++) {
                        var innerStyle = styles[i]['style'];
                        if (innerStyle[j]['filter'] === "class='park'") {
                            innerStyle[j]['polygon-fill'] = parkColor;
                        }
                    }
                }
            }
            return _this.json;
        };
        this.clickRefresh = function (json) {
            var layers = map.getLayers().getArray();
            map.removeLayer(layers[0]);
            var newLayer = new ol.mapsuite.VectorTileLayer(json, {
                'apiKey': 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~'
            });
            map.addLayer(newLayer);
        };
    };
    AppComponent.prototype.refresh = function (formValue) {
        console.log(formValue.waterColor);
        this.json = this.updatedstyle(formValue.poiSize || 30, formValue.waterColor || '#0000CD', formValue.parkColor || '#fe6c00');
        this.clickRefresh(this.json);
    };
    AppComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.css */ "./src/app/app.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], AppComponent);
    return AppComponent;
}());

;


/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./app-routing.module */ "./src/app/app-routing.module.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");






var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"]
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
                _app_routing_module__WEBPACK_IMPORTED_MODULE_4__["AppRoutingModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"]
            ],
            providers: [],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.error(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\thinkgeo\my-app\src\main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map