(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["tg"] = factory();
	else
		root["tg"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Advanced/BaseClient.js":
/*!************************************!*\
  !*** ./src/Advanced/BaseClient.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Eventable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Eventable */ "./src/Advanced/Eventable.js");
/* harmony import */ var _shared_Util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/Util */ "./src/shared/Util.js");
/* harmony import */ var _shared_AccessToken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/AccessToken */ "./src/shared/AccessToken.js");
/* harmony import */ var _BaseClientEventType_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./BaseClientEventType.js */ "./src/Advanced/BaseClientEventType.js");
/* harmony import */ var _GettingAccessTokenEventArgs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./GettingAccessTokenEventArgs */ "./src/Advanced/GettingAccessTokenEventArgs.js");
/* harmony import */ var _SendingRequestEventArgs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./SendingRequestEventArgs */ "./src/Advanced/SendingRequestEventArgs.js");
/* harmony import */ var _SentRequestEventArgs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./SentRequestEventArgs */ "./src/Advanced/SentRequestEventArgs.js");








class BaseClient extends _Eventable__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(apiKey) {
        super();

        this.baseUrls_ = [
            'https://cloud1.thinkgeo.com',
            'https://cloud2.thinkgeo.com',
            'https://cloud3.thinkgeo.com',
            'https://cloud4.thinkgeo.com',
            'https://cloud5.thinkgeo.com',
            'https://cloud6.thinkgeo.com'
        ];
        this.baseUrlIndex_ = -1;
        this.authNames_ = [];
        this.authentications_ = {
            'API Key': {
                type: 'apiKey',
                in: 'query',
                name: 'ApiKey'
            },
            'Client Credentials': {
                type: 'oauth2'
            }
        };
        if (apiKey) {
            this.authentications_["API Key"]["apiKey"] = apiKey;
            this.authNames_.push("API Key");
        }

        //// comments accessToken code
        // else {
        //     if (options["clientId"] && options["clientSecret"]) {
        //         this.authentications["Client Credentials"]["clientId"] = options["clientId"];
        //         this.authentications["Client Credentials"]["clientSecret"] = options["clientSecret"];
        //         this.authNames.push("Client Credentials");

        //         // TODO: make sure the token url 
        //         this.tokenUrl = 'https://cloud.thinkgeo.com/identity/connect/token';
        //         // TODO:REMOVE
        //         // this.authentications["Client Credentials"]["accessToken"] = {
        //         //     "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiZTNiZDczLWViN2QtNDI4MC1hNzg4LTcxMjYyMjZkMGU3YyIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE1NDY1MTQ2OTcsImV4cCI6MTU0NjUxODI5NywiaXNzIjoiaHR0cHM6Ly9jbG91ZC50aGlua2dlby5jb20vaWRlbnRpdHkiLCJhdWQiOlsiaHR0cHM6Ly9jbG91ZC50aGlua2dlby5jb20vaWRlbnRpdHkvcmVzb3VyY2VzIiwiVGhpbmtHZW9DbG91ZEFQSXMiXSwiY2xpZW50X2lkIjoiSEcxdFlBc0FGY1JqSFV3MkI4cXJPdHg5ZTVlTFpWZU5jNko2cnhQVWpvNH4iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL2FjY2Vzc2NvbnRyb2xzZXJ2aWNlLzIwMTAvMDcvY2xhaW1zL2lkZW50aXR5cHJvdmlkZXIiOiJBU1AuTkVUIElkZW50aXR5IiwiYXBpS2V5IjoiSEcxdFlBc0FGY1JqSFV3MkI4cXJPdHg5ZTVlTFpWZU5jNko2cnhQVWpvNH4iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImVkMzM1NjUwLTlkYTQtNDNmNS04YWI5LTAyODE3NDFiMzMzNyIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJQcm9mZXNzaW9uYWwgU3ViIFRlc3QgQWNjb3VudCIsIlNoYXJlZE1vZGUiOiJJcEFkZHJlc3MiLCJjbGllbnRJZCI6IjBlMzRlMTE5LTlhNDItNDI5Ny04ODMxLTI5YTllNTFiZjg1NSIsImNsaWVudE5hbWUiOiJTYW1wbGUgTmF0aXZlIENsaWVudCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IjliZWI5MjQ1LTcwODAtNGRhMy1hZDM0LWIzZmYxNzk5YzFjYiIsIklwQWRkcmVzcyI6IiouKi4qLioiLCJzY29wZSI6WyJUaGlua0dlb0Nsb3VkQVBJcyJdfQ.hj5CYv6XfmlwFqjh623Bgp-2-mxWFSoJum6RyvfkZgsZLdgv39xv6Sl5LJj4rwX9IuGxMo1kzV_JJbLKOMQ9FRHUbUMmE38mCutYX_n2Q1EZrbYBINDpF8iowMvkCoAYO67bdM4sjfE7HbhhcwPOEzIkLWlhKz-SF0mExYbItK1TwvTKBJSJm8TLfxQhPpMS1NoVx0T4x32zPjHP5Lj0R7OAZfl6HLCemIvsp_drAki-BmTPIl0dTjpy1FUTCQWvafTyHU6fvRPF_4Gdc7wJj0BW0zA9Eg0crJQ-t3_F4U8insBZXzK1mtEnoNDr0vluYGSwWVHlZImihivGrQk9OA",
        //         //     "expires_in": 3600,
        //         //     "token_type": "Bearer"
        //         // }

        //         // TODO:REMOVE for testing we are hoad code the token.
        //         // let tokenInfo = {
        //         //     accessToken:"eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiZTNiZDczLWViN2QtNDI4MC1hNzg4LTcxMjYyMjZkMGU3YyIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE1NDY4MzgyNjIsImV4cCI6MTU0Njg0MTg2MiwiaXNzIjoiaHR0cHM6Ly9jbG91ZC50aGlua2dlby5jb20vaWRlbnRpdHkiLCJhdWQiOlsiaHR0cHM6Ly9jbG91ZC50aGlua2dlby5jb20vaWRlbnRpdHkvcmVzb3VyY2VzIiwiVGhpbmtHZW9DbG91ZEFQSXMiXSwiY2xpZW50X2lkIjoiSEcxdFlBc0FGY1JqSFV3MkI4cXJPdHg5ZTVlTFpWZU5jNko2cnhQVWpvNH4iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL2FjY2Vzc2NvbnRyb2xzZXJ2aWNlLzIwMTAvMDcvY2xhaW1zL2lkZW50aXR5cHJvdmlkZXIiOiJBU1AuTkVUIElkZW50aXR5IiwiYXBpS2V5IjoiSEcxdFlBc0FGY1JqSFV3MkI4cXJPdHg5ZTVlTFpWZU5jNko2cnhQVWpvNH4iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImVkMzM1NjUwLTlkYTQtNDNmNS04YWI5LTAyODE3NDFiMzMzNyIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJQcm9mZXNzaW9uYWwgU3ViIFRlc3QgQWNjb3VudCIsIlNoYXJlZE1vZGUiOiJJcEFkZHJlc3MiLCJjbGllbnRJZCI6IjBlMzRlMTE5LTlhNDItNDI5Ny04ODMxLTI5YTllNTFiZjg1NSIsImNsaWVudE5hbWUiOiJTYW1wbGUgTmF0aXZlIENsaWVudCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IjliZWI5MjQ1LTcwODAtNGRhMy1hZDM0LWIzZmYxNzk5YzFjYiIsIklwQWRkcmVzcyI6IiouKi4qLioiLCJzY29wZSI6WyJUaGlua0dlb0Nsb3VkQVBJcyJdfQ.JkLiclD3vgMRj-eN7crBadwHPrU4j4xTrIMol6zFBfdEstkboZnC0dBjvYqS2Kj-aWx6fVnEDPz0IU6PUjEr94YhPfrzn6aTszXSaTavF1OzmEuO4zcyFArxud1CBGvD_gDEYw3PExIkzMKYqSnVLhpouyI936v9D8VO04TJDbbxyGkNqF3kxq4fYIbjGKByg3ipuZNymXVT8b8w9hRWiWS4LiP2vzJeDmhGGzbJMC6u7fiV3CMBR5fPoVVuWj7HWvWDxfWT_kqd_AuU0O4keknRoA_70gukFl1sOzSoY7pZIPZ91y_UmpqsNV9p2uMYJNl67aw2gU0DfaNq0AIWMg",
        //         //     tokenType: "Bearer",
        //         //     expiresTime: Date.now() + 3600000
        //         // }
        //         // let testAccessToken = new AccessToken(tokenInfo.accessToken, tokenInfo.tokenType, tokenInfo.expiresTime)
        //         // Util.setAccessTokenToLocalStorage(testAccessToken);
        //     }
        // }
    }

    getNextCandidateBaseUri() {
        this.baseUrlIndex_++;
        if (this.baseUrls_) {
            let baseUrlsLength = this.baseUrls_.length;
            if (this.baseUrlIndex_ > baseUrlsLength - 1) {
                this.baseUrlIndex_ = 0;
            }
            return this.baseUrls_[this.baseUrlIndex_];
        }
        else {
            throw new ThinkGeoCloudApplicationException("the urls is empty, please set it in option of client");
        }
    }

    callApi(path, httpMethod, pathParams, queryParams, bodyParam, authNames, contentTypes, returnType, callback) {
        let params = {
            queryObj: queryParams
        }
        if (httpMethod.toLowerCase() === 'post') {
            params["setHeaderObj"] = {
                "Content-type": contentTypes
            }
        }

        let applyAuthNames = authNames === undefined ? this.authNames_ : authNames;

        let xhr = new XMLHttpRequest();

        params = _shared_Util__WEBPACK_IMPORTED_MODULE_1__["default"].applyAuthToRequest(applyAuthNames, this.authentications_, params);
        let url = _shared_Util__WEBPACK_IMPORTED_MODULE_1__["default"].buildUrl(this.getNextCandidateBaseUri(), path, pathParams, params.queryObj);

        xhr.open(httpMethod, url, true);

        if(params.setHeaderObj){
            _shared_Util__WEBPACK_IMPORTED_MODULE_1__["default"].setRequestHeader(xhr, params.setHeaderObj);
        }        

        if (returnType) {
            if (returnType.toLowerCase() === 'blob') {
                xhr.responseType = "blob";
            } else if (returnType.toLowerCase() === 'arrayBuffer') {
                xhr.responseType = "arrayBuffer";
            } else if (returnType.toLowerCase() === 'json') {
                xhr.responseType = "json";
            }
        }

        let sendingRequestEventArgs = new _SendingRequestEventArgs__WEBPACK_IMPORTED_MODULE_5__["default"](xhr);
        this.fire(sendingRequestEventArgs);

        if (!sendingRequestEventArgs.cancel) {
            if (callback) {
                sendingRequestEventArgs.xhr.onload = (event) => {
                    let sentRequestEventArgs = new _SentRequestEventArgs__WEBPACK_IMPORTED_MODULE_6__["default"](sendingRequestEventArgs.xhr);
                    this.fire(sentRequestEventArgs);

                    if (callback) {
                        callback(sentRequestEventArgs.xhr.status, sentRequestEventArgs.xhr.response);
                    }
                }
                sendingRequestEventArgs.xhr.onerror = (error) => {
                    if (callback) {
                        callback("error", error.type);
                    }
                }
            }

            if (bodyParam) {
                sendingRequestEventArgs.xhr.send(bodyParam);
            } else {
                sendingRequestEventArgs.xhr.send();
            }
        }
    }

    // // comments accessToken Code
    // getToken() {
    //     return this.getTokenCore();
    // }
    // getTokenCore() {
    //     let accessToken = new AccessToken();
    //     Util.getAccessTokenFromLocalStorage(accessToken);

    //     var now = Date.now();
    //     var expiresTime = accessToken.expiresTime;

    //     // expiresTime buffer is 3000 millis
    //     if (now > expiresTime - 3000) {
    //         Util.removeAccessTokenFromLocalStorage(accessToken);
    //         accessToken = undefined;
    //     }

    //     if (!accessToken) {
    //         accessToken = this.requestAccessToken();
    //         if (accessToken) {
    //             Util.setAccessTokenToLocalStorage(accessToken);
    //         }
    //     }
    //     return accessToken;
    // }

    // // comments accessToken code
    // requestAccessToken() {
    //     let requestTokenTime = Date.now();
    //     let accessTokenObject = undefined;
    //     let xhr = new XMLHttpRequest();
    //     xhr.open('POST', this.tokenUrl, false);
    //     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //     xhr.onreadystatechange = function (e) {
    //         if (xhr.readyState === 4 && xhr.status === 200) {
    //             let accessToken = JSON.stringify(xhr.response.access_token);
    //             accessTokenObject = new AccessToken(accessToken.accessToken, accessToken.tokenType, requestTokenTime + (accessToken.expires_in * 1000));
    //         }
    //     };
    //     let body = 'client_id=' + this.authentications["Client Credentials"].clientId + '&client_secret=' + this.authentications["Client Credentials"].clientSecret + '&grant_type=client_credentials';

    //     let gettingAccessTokenObj = new GettingAccessTokenEventArgs(xhr);

    //     this.fire(gettingAccessTokenObj);

    //     xhr.send(body);

    //     return accessTokenObject;
    // }

    formatResponse(response) {
        return response;
    }

    disposeCore() {
    }
}

/* harmony default export */ __webpack_exports__["default"] = (BaseClient);


/***/ }),

/***/ "./src/Advanced/BaseClientEventType.js":
/*!*********************************************!*\
  !*** ./src/Advanced/BaseClientEventType.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
    GETTINGACCESSTOKEN: "gettingaccesstoken",
    SENDINGREQUEST: "sendingrequest",
    SENTREQUEST: "sentrequest"
});

/***/ }),

/***/ "./src/Advanced/Disposable.js":
/*!************************************!*\
  !*** ./src/Advanced/Disposable.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class Disposable {
    constructor() {
        this.disposed_ = false;
    }

    dispose() {
        if (!this.disposed_) {
            this.disposed_ = true;
            this.disposeCore();
        }
    }

    disposeCore() {
    }
}

/* harmony default export */ __webpack_exports__["default"] = (Disposable);

/***/ }),

/***/ "./src/Advanced/Eventable.js":
/*!***********************************!*\
  !*** ./src/Advanced/Eventable.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Disposable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Disposable */ "./src/Advanced/Disposable.js");


class Eventable extends _Disposable__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor() {
        super();

        this.listeners_ = {};
    }

    on(type, listener) {
        let listeners = this.listeners_[type];
        if (!listeners) {
            listeners = this.listeners_[type] = [];
        }
        if (listeners.indexOf(listener) === -1) {
            listeners.push(listener);
        }
    }

    fire(event) {
        const listeners = this.listeners_[event.type];
        if (listeners) {
            for (let i = 0; i < listeners.length; ++i) {
                listeners[i].call(this, event);
            }
        }
    }

    un(type, listener) {
        const listeners = this.listeners_[type];
        if (listeners) {
            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
            if (listeners.lengtxlh === 0) {
                delete this.listeners_[type];
            }
        }
    }

    unAll() {
        this.listeners_ = {};
    }

    disposeCore() {
        unAll(this);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (Eventable);

/***/ }),

/***/ "./src/Advanced/GettingAccessTokenEventArgs.js":
/*!*****************************************************!*\
  !*** ./src/Advanced/GettingAccessTokenEventArgs.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _BaseClientEventType__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseClientEventType */ "./src/Advanced/BaseClientEventType.js");


class GettingAccessTokenEventArgs {
    constructor(xhr, cancel) {
        this.xhr = xhr;
        this.cancel = cancel;
        this.type = _BaseClientEventType__WEBPACK_IMPORTED_MODULE_0__["default"].GETTINGACCESSTOKEN
    }
}
/* harmony default export */ __webpack_exports__["default"] = (GettingAccessTokenEventArgs);

/***/ }),

/***/ "./src/Advanced/SendingRequestEventArgs.js":
/*!*************************************************!*\
  !*** ./src/Advanced/SendingRequestEventArgs.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _BaseClientEventType__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseClientEventType */ "./src/Advanced/BaseClientEventType.js");


class SendingRequestEventArgs {
    constructor(xhr, cancel) {
        this.xhr = xhr;
        this.cancel = cancel;
        this.type = _BaseClientEventType__WEBPACK_IMPORTED_MODULE_0__["default"].SENDINGREQUEST;
    }
}
/* harmony default export */ __webpack_exports__["default"] = (SendingRequestEventArgs);

/***/ }),

/***/ "./src/Advanced/SentRequestEventArgs.js":
/*!**********************************************!*\
  !*** ./src/Advanced/SentRequestEventArgs.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _BaseClientEventType__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseClientEventType */ "./src/Advanced/BaseClientEventType.js");



class SentRequestEventArgs {
    constructor(xhr) {
        this.xhr = xhr
        this.type = _BaseClientEventType__WEBPACK_IMPORTED_MODULE_0__["default"].SENTREQUEST;
    }
}

/* harmony default export */ __webpack_exports__["default"] = (SentRequestEventArgs);

/***/ }),

/***/ "./src/Advanced/ThinkGeoCloudApplicationException.js":
/*!***********************************************************!*\
  !*** ./src/Advanced/ThinkGeoCloudApplicationException.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class ThinkGeoCloudApplicationException extends Error {
    constructor(message, code, e) {
        super(message);

        this.code = code;
        this.message = message;
        this.e = e;
    }
}

/* harmony default export */ __webpack_exports__["default"] = (ThinkGeoCloudApplicationException);

/***/ }),

/***/ "./src/ColorUtilities/ColorClient.js":
/*!*******************************************!*\
  !*** ./src/ColorUtilities/ColorClient.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Advanced/BaseClient */ "./src/Advanced/BaseClient.js");
/* harmony import */ var _Advanced_ThinkGeoCloudApplicationException__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Advanced/ThinkGeoCloudApplicationException */ "./src/Advanced/ThinkGeoCloudApplicationException.js");



class ColorClient extends _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(apiKey) {
        super(apiKey);
    }

    getColorsInAnalogousFamily(options, callback) {
        let opts = options || {};
        let inputColor = opts["color"];
        let numberOfColors = opts["numberOfColors"];

        // verify the required parameter 'numberOfColors' is set
        if (numberOfColors === undefined || numberOfColors === null || numberOfColors === '') {
            throw new Error("Missing the required parameter 'numberOfColors' when calling getColorsInAnalogousFamily");
        }
        let path = '/api/v1/color/scheme/analogous/random/{numberOfColors}';
        let pathParams = {
            'numberOfColors': numberOfColors
        };
        let queryParams = {
            'outFormat': opts['outFormat'],
        };
        if (inputColor) {
            path = '/api/v1/color/scheme/analogous/{inputColor}/{numberOfColors}';
            pathParams.inputColor = inputColor;
            queryParams.inFormat = opts['inFormat']
        }

        let httpMethod = 'GET';
        let bodyParam = {};

        var contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getColorsInComplementaryFamily(options, callback) {
        let opts = options || {};
        let inputColor = opts["color"];
        let numberOfColors = opts["numberOfColors"];
        // verify the required parameter 'numberOfColors' is set
        if (numberOfColors === undefined || numberOfColors === null || numberOfColors === '') {
            throw new Error("Missing the required parameter 'numberOfColors' when calling getColorSchemeComplementaryRandomByNumberOfColorV1");
        }

        let path = '/api/v1/color/scheme/complementary/random/{numberOfColors}';
        let pathParams = {
            'numberOfColors': numberOfColors
        };
        let queryParams = {
            'outFormat': opts['outFormat'],
        };

        if (inputColor) {
            path = '/api/v1/color/scheme/complementary/{inputColor}/{numberOfColors}';
            pathParams.inputColor = inputColor;
            queryParams.inFormat = opts['inFormat'];
        }

        let httpMethod = 'GET';
        let bodyParam = {};

        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getColorsInContrastingFamily(options, callback) {
        let opts = options || {};
        let inputColor = opts["color"];
        let numberOfColors = opts["numberOfColors"];

        // verify the required parameter 'numberOfColors' is set
        if (numberOfColors === undefined || numberOfColors === null || numberOfColors === '') {
            throw new Error("Missing the required parameter 'numberOfColors' when calling getColorsInContrastingFamily");
        }

        let path = '/api/v1/color/scheme/contrasting/random/{numberOfColors}';
        let pathParams = {
            'numberOfColors': numberOfColors
        };
        let queryParams = {
            'outFormat': opts['outFormat'],
        };

        if (inputColor) {
            path = '/api/v1/color/scheme/contrasting/{inputColor}/{numberOfColors}';
            pathParams.inputColor = inputColor;
            queryParams.inFormat = opts['inFormat']
        }

        let httpMethod = 'GET';
        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getColorsInHueFamily(options, callback) {
        let opts = options || {};
        let inputColor = opts["color"];
        let numberOfColors = opts["numberOfColors"];

        // verify the required parameter 'numberOfColors' is set
        if (numberOfColors === undefined || numberOfColors === null || numberOfColors === '') {
            throw new Error("Missing the required parameter 'numberOfColors' when calling getColorsInHueFamily");
        }

        let path = '/api/v1/color/scheme/sequential/random/{numberOfColors}';
        let pathParams = {
            'numberOfColors': numberOfColors
        };
        let queryParams = {
            'outFormat': opts['outFormat'],
        };

        if (inputColor) {
            path = '/api/v1/color/scheme/sequential/{inputColor}/{numberOfColors}';
            pathParams.inputColor = inputColor;
            queryParams.inFormat = opts['inFormat'];
        }

        let httpMethod = 'GET';
        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getColorsInQualityFamily(options, callback) {
        let opts = options || {};
        let inputColor = opts['color'];
        let numberOfColors = opts['numberOfColors'];

        // verify the required parameter 'numberOfColors' is set
        if (numberOfColors === undefined || numberOfColors === null || numberOfColors === '') {
            throw new Error("Missing the required parameter 'numberOfColors' when calling getColorsInQualityFamily");
        }

        let path = '/api/v1/color/scheme/qualitative/random/{numberOfColors}';
        let pathParams = {
            'numberOfColors': numberOfColors
        };
        let queryParams = {
            'outFormat': opts['outFormat'],
        };

        if (inputColor) {
            path = '/api/v1/color/scheme/qualitative/{inputColor}/{numberOfColors}';
            pathParams.inputColor = inputColor;
            queryParams.inFormat = opts['inFormat'];
        }

        let httpMethod = 'GET';
        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getColorsInTetradFamily(options, callback) {
        let opts = options || {};
        let inputColor = opts['color'];
        let numberOfColors = opts['numberOfColors'];

        // verify the required parameter 'numberOfColors' is set
        if (numberOfColors === undefined || numberOfColors === null || numberOfColors === '') {
            throw new Error("Missing the required parameter 'numberOfColors' when calling getColorSchemeTetradRandomByNumberOfColor");
        }

        let path = '/api/v1/color/scheme/tetrad/random/{numberOfColors}';
        let pathParams = {
            'numberOfColors': numberOfColors
        };
        let queryParams = {
            'outFormat': opts['outFormat'],
        };

        if (inputColor) {
            path = '/api/v1/color/scheme/tetrad/{inputColor}/{numberOfColors}';
            pathParams.inputColor = inputColor;
            queryParams.inFormat = opts['inFormat'];
        }

        let httpMethod = 'GET';
        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getColorsInTriadFamily(options, callback) {
        let opts = options || {};
        let inputColor = opts['color'];
        let numberOfColors = opts['numberOfColors'];

        // verify the required parameter 'numberOfColors' is set
        if (numberOfColors === undefined || numberOfColors === null || numberOfColors === '') {
            throw new Error("Missing the required parameter 'numberOfColors' when calling getColorsInTriadFamily");
        }

        let path = '/api/v1/color/scheme/triad/random/{numberOfColors}';
        let pathParams = {
            'numberOfColors': numberOfColors
        };
        let queryParams = {
            'outFormat': opts['outFormat'],
        };

        if (inputColor) {
            path = '/api/v1/color/scheme/triad/{inputColor}/{numberOfColors}';
            pathParams.inputColor = inputColor;
            queryParams.inFormat = opts['inFormat'];
        }

        let httpMethod = 'GET';
        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (ColorClient);

/***/ }),

/***/ "./src/Elevation/ElevationClient.js":
/*!******************************************!*\
  !*** ./src/Elevation/ElevationClient.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Advanced/BaseClient */ "./src/Advanced/BaseClient.js");


class ElevationClient extends _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(apiKey) {
        super(apiKey);
    }

    getElevationOfPoint(options, callback) {
        let opts = options || {};
        let pointX = opts['pointX'];
        let pointY = opts['pointY'];

        let path = '/api/v1/elevation/{pointY},{pointX}';
        let httpMethod = 'GET';
        let pathParams = {
            'pointY': pointY,
            'pointX': pointX
        };
        let queryParams = {
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'ElevationUnit': opts['elevationUnit'],
        };

        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, undefined, undefined, contentTypes, returnType, callback);
    }

    getElevationOfPoints(options, callback) {
        let opts = options || {};
        let path = '/api/v1/elevation/point/multi';
        let httpMethod = 'POST';
        let queryParams = {
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'ElevationUnit': opts['elevationUnit'],
        };
        let bodyParam = JSON.stringify(opts['body']);
        let contentTypes = ['application/json-patch+json', 'application/json', 'text/json', 'application/_*+json'];
        let returnType = 'json';

        this.callApi(path, httpMethod, undefined, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getElevationOfLine(options, callback) {
        let opts = options || {};
        let wkt = opts['wkt'];
        let path = '/api/v1/elevation/line';
        let httpMethod = 'GET';

        let pathParams = {};
        let queryParams = {
            'wkt': wkt,
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'NumberOfSegments': opts['numberOfSegments'],
            'ElevationUnit': opts['elevationUnit'],
            'IntervalDistance': opts['intervalDistance'],
            'IntervalDistanceUnit': opts['intervalDistanceUnit'],
        };

        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, undefined, undefined, contentTypes, returnType, callback);
    }

    getGradeOfLine(options, callback) {
        let opts = options || {};
        let wkt = opts['wkt'];
        let path = '/api/v1/elevation/grade/line';
        let httpMethod = 'GET';

        let queryParams = {
            'wkt': wkt,
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'NumberOfSegments': opts['numberOfSegments'],
            'ElevationUnit': opts['elevationUnit'],
            'IntervalDistance': opts['intervalDistance'],
            'IntervalDistanceUnit': opts['intervalDistanceUnit'],
        };
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, undefined, queryParams, undefined, undefined, contentTypes, returnType, callback);
    }

    getElevationOfArea(options, callback) {
        let opts = options || {};
        let wkt = opts['wkt'];
        let path = '/api/v1/elevation/area';
        let httpMethod = 'GET';
        let pathParams = {};
        let queryParams = {
            'wkt': wkt,
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'IntervalDistance': opts['intervalDistance'],
            'IntervalDistanceUnit': opts['intervalDistanceUnit'],
            'ElevationUnit': opts['elevationUnit'],
        };

        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, undefined, undefined, contentTypes, returnType, callback);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (ElevationClient);

/***/ }),

/***/ "./src/Geocoding/GeocodingClient.js":
/*!******************************************!*\
  !*** ./src/Geocoding/GeocodingClient.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Advanced/BaseClient */ "./src/Advanced/BaseClient.js");


class GeocodingClient extends _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(apiKey) {
        super(apiKey);
    }

    search(options, callback) {
        let opts = options || {};
        let location = opts['location'];
        let body = opts['body'];
        if (location != undefined) {
            this.searchByPoint(location, callback, opts);
        }
        else if (body != undefined) {
            this.searchBatch(opts, callback);
        }
    }
    
    searchByPoint(location, callback, options) {
        if (location === undefined || location === null || location === '') {
            throw new Error("Missing the required parameter 'searchText' when calling searchByPoint");
        }
        let path = '/api/v1/location/geocode/{searchText}';
        let httpMethod = 'GET';
        let pathParams = {
            'searchText': location
        };

        let queryParams = options || {};
        delete queryParams["location"];

        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    searchBatch(options, callback) {
        let opts = options || {};

        let path = '/api/v1/location/geocode/multi';
        let httpMethod = 'POST';
        let pathParams = {
        };

        let queryParams = options || {};
        delete queryParams["body"];
        
        let bodyParam = opts['body'];
        let contentTypes = ['application/json-patch+json', 'application/json', 'text/json', 'application/_*+json'];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (GeocodingClient);

/***/ }),

/***/ "./src/MapsQuery/MapsQueryClient.js":
/*!******************************************!*\
  !*** ./src/MapsQuery/MapsQueryClient.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Advanced/BaseClient */ "./src/Advanced/BaseClient.js");
/* harmony import */ var _constants_DistanceUnit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/DistanceUnit */ "./src/constants/DistanceUnit.js");



class MapsQueryClient extends _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor (apiKey){
        super(apiKey);
    }

    /**
     * 
     * @param {string} queryLayer 
     * @param {string} wkt 
     * @param {'within'|'containing'|'intersecting'|'overlapping'|'touching'} queryType 
     * @param {function(number, object) : undefined} callback 
     * @param {{
     *     srid:number,
     *     proj4String:string,
     *     maxResults:number,
     *     returnFeatureAttributes:boolean
     *     featureAttributesToReturn:string[]}} options 
     */
    getFeaturesWithin(layerName, wkt, callback, options) {
        this._spatialQuery(layerName, wkt, 'within', callback, options);
    }

    /**
     * 
     * @param {string} queryLayer 
     * @param {string} wkt 
     * @param {'within'|'containing'|'intersecting'|'overlapping'|'touching'} queryType 
     * @param {function(number, object) : undefined} callback 
     * @param {{
     *     srid:number,
     *     proj4String:string,
     *     maxResults:number,
     *     returnFeatureAttributes:boolean
     *     featureAttributesToReturn:string[]}} options 
     */
    getFeaturesContaining(layerName, wkt, callback, options) {
        this._spatialQuery(layerName, wkt, 'containing', callback, options);
    }

    /**
     * 
     * @param {string} queryLayer 
     * @param {string} wkt 
     * @param {'within'|'containing'|'intersecting'|'overlapping'|'touching'} queryType 
     * @param {function(number, object) : undefined} callback 
     * @param {{
     *     srid:number,
     *     proj4String:string,
     *     maxResults:number,
     *     returnFeatureAttributes:boolean
     *     featureAttributesToReturn:string[]}} options 
     */
    getFeaturesIntersecting(layerName, wkt, callback, options) {
        this._spatialQuery(layerName, wkt, 'intersecting', callback, options);
    }

    /**
     * 
     * @param {string} queryLayer 
     * @param {string} wkt 
     * @param {'within'|'containing'|'intersecting'|'overlapping'|'touching'} queryType 
     * @param {function(number, object) : undefined} callback 
     * @param {{
     *     srid:number,
     *     proj4String:string,
     *     maxResults:number,
     *     returnFeatureAttributes:boolean
     *     featureAttributesToReturn:string[]}} options 
     */
    getFeaturesOverlapping(layerName, wkt, callback, options) {
        this._spatialQuery(layerName, wkt, 'overlapping', callback, options);
    }
    
    /**
     * 
     * @param {string} queryLayer 
     * @param {string} wkt 
     * @param {'within'|'containing'|'intersecting'|'overlapping'|'touching'} queryType 
     * @param {function(number, object) : undefined} callback 
     * @param {{
     *     srid:number,
     *     proj4String:string,
     *     maxResults:number,
     *     returnFeatureAttributes:boolean
     *     featureAttributesToReturn:string[]}} options 
     */
    getFeaturesTouching(layerName, wkt, callback, options) {
        this._spatialQuery(layerName, wkt, 'touching', callback, options);
    }

    /**
     * 
     * @param {string} queryLayer 
     * @param {string} wkt 
     * @param {'within'|'containing'|'intersecting'|'overlapping'|'touching'} queryType 
     * @param {function(number, object) : undefined} callback 
     * @param {{
    *     srid:number,
    *     proj4String:string,
    *     searchRadius:number,
    *     searchRadiusUnit:DistanceUnit,
    *     maxResults:number,
    *     returnFeatureAttributes:boolean
    *     featureAttributesToReturn:string[]}} options 
    */
    getFeaturesNearest(layerName, wkt, callback, options) {
        if (layerName === undefined || layerName === null || layerName === '') {
            throw new Error('Missing the required parameter \'layerName\' when calling getFeaturesNearest');
        }
        if (wkt === undefined || wkt === null || wkt === '') {
            throw new Error('Missing the required parameter \'wkt\' when calling getFeaturesNearest');
        }
        let opt = options || {};

        let path = '/api/v1/maps/query/{queryLayer}/nearest';
        let httpMethod = 'GET';
        let pathParams = {
            queryLayer: layerName,
        };
        let queryParams = {
            Wkt: wkt,
            Srid: opt['srid'],
            Proj4String: opt['proj4String'],
            SearchRadius: opt['searchRadius'],
            SearchRadiusUnit: opt['searchRadiusUnit'],
            MaxResults: opt['maxResults'],
            ReturnFeatureAttributes: opt['returnFeatureAttributes'],
            FeatureAttributesToReturn: opt['featureAttributesToReturn'],
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    /**
     * 
     * @param {string} queryLayer 
     * @param {string} wkt 
     * @param {'within'|'containing'|'intersecting'|'overlapping'|'touching'} queryType 
     * @param {function(number, object) : undefined} callback 
     * @param {{
    *     srid:number,
    *     proj4String:string,
    *     distance:number,
    *     distanceUnit:DistanceUnit,
    *     maxResults:number,
    *     returnFeatureAttributes:boolean
    *     featureAttributesToReturn:string[]}} options 
    */
    getFeaturesWithinDistance(layerName, wkt, callback, options) {
        if (layerName === undefined || layerName === null || layerName === '') {
            throw new Error('Missing the required parameter \'layerName\' when calling getFeaturesWithinDistance');
        }
        if (wkt === undefined || wkt === null || wkt === '') {
            throw new Error('Missing the required parameter \'wkt\' when calling getFeaturesWithinDistance');
        }
        let opt = options || {};

        let path = '/api/v1/maps/query/{queryLayer}/within-distance';
        let httpMethod = 'GET';
        let pathParams = {
            queryLayer: layerName,
        };
        let queryParams = {
            Wkt: wkt,
            Srid: opt['srid'],
            Proj4String: opt['proj4String'],
            Distance: opt['distance'],
            DistanceUnit: opt['distanceUnit'],
            MaxResults: opt['maxResults'],
            ReturnFeatureAttributes: opt['returnFeatureAttributes'],
            FeatureAttributesToReturn: opt['featureAttributesToReturn'],
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    /**
     * 
     * @param {string} layerName 
     * @param {string} wkt 
     * @param {'within'|'containing'|'intersecting'|'overlapping'|'touching'|'nearest'|'within-distance'} queryType 
     * @param {function(number, object) : undefined} callback 
     * @param {{
     *     srid:number,
     *     proj4String:string,
     *     distance:number,
     *     distanceUnit:DistanceUnit,
     *     searchRadius:number,
     *     searchRadiusUnit:DistanceUnit,
     *     maxResults:number,
     *     returnFeatureAttributes:boolean
     *     featureAttributesToReturn:string[]}} options 
     */
    getFeaturesCustom(layerName, wkt, queryType, callback, options){
        if (layerName === undefined || layerName === null || layerName === '') {
            throw new Error('Missing the required parameter \'layerName\' when calling getFeaturesCustom');
        }
        if (wkt === undefined || wkt === null || wkt === '') {
            throw new Error('Missing the required parameter \'wkt\' when calling getFeaturesCustom');
        }
        if (queryType === undefined || queryType === null || queryType === '') {
            throw new Error('Missing the required parameter \'queryType\' when calling getFeaturesCustom');
        }
        let opt = options || {};

        let path = '/api/v1/maps/query/custom';
        let httpMethod = 'POST';
        let pathParams = {};
        let queryParams = {};
        let bodyParam = JSON.stringify({
            QueryLayer: layerName,
            QueryType: queryType,
            Wkt: wkt,
            Srid: opt['srid'],
            Proj4String: opt['proj4String'],
            Distance: opt['distance'],
            DistanceUnit: opt['distanceUnit'],
            SearchRadius: opt['searchRadius'],
            SearchRadiusUnit: opt['searchRadiusUnit'],
            MaxResults: opt['maxResults'],
            ReturnFeatureAttributes: opt['returnFeatureAttributes'],
            FeatureAttributesToReturn: opt['featureAttributesToReturn'],
        });
        let contentTypes = ['application/json-patch+json', 'application/json', 'text/json', 'application/_*+json'];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    /**
     * 
     * @param {function(number, object) : undefined} callback 
     */
    getLayers(callback) {
        let path = '/api/v1/maps/query/layers';
        let httpMethod = 'GET';
        let pathParams = undefined;
        let queryParams = {};
        let bodyParam = null;
        let contentTypes = '';
        let returnType = 'json';
        
        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }
    
    /**
     * 
     * @param {string} queryLayer 
     * @param {function(number, object) : undefined} callback 
     */
    getAttributesOfLayer(queryLayer, callback) {
        if (queryLayer === undefined || queryLayer === null || queryLayer === '') {
            throw new Error('Missing the required parameter \'layerName\' when calling getAttributesOfLayer');
        }
        let path = '/api/v1/maps/query/{queryLayer}/attributes';
        let httpMethod = 'GET';
        let pathParams = {
            queryLayer: queryLayer,
        };
        let queryParams = undefined;
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';
        
        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    /**
     * 
     * @param {string} queryLayer 
     * @param {string} wkt 
     * @param {'within'|'containing'|'intersecting'|'overlapping'|'touching'} queryType 
     * @param {function(number, object) : undefined} callback 
     * @param {{
     *     srid:number,
     *     proj4String:string,
     *     maxResults:number,
     *     returnFeatureAttributes:boolean
     *     featureAttributesToReturn:string[]}} options 
     */
    _spatialQuery(queryLayer, wkt, queryType, callback, options){
        if (queryLayer === undefined || queryLayer === null || queryLayer === '') {
            throw new Error('Missing the required parameter \'layerName\' when calling _spatialQuery');
        }
        if (wkt === undefined || wkt === null || wkt === '') {
            throw new Error('Missing the required parameter \'wkt\' when calling _spatialQuery');
        }

        let opt = options || {};

        let path = '/api/v1/maps/query/{queryLayer}/{queryType}';
        let httpMethod = 'GET';
        let pathParams = {
            queryLayer: queryLayer,
            queryType: queryType,
        };
        let queryParams = {
            Wkt: wkt,
            Srid: opt['srid'],
            Proj4String: opt['proj4String'],
            MaxResults: opt['maxResults'],
            ReturnFeatureAttributes: opt['returnFeatureAttributes'],
            FeatureAttributesToReturn: opt['featureAttributesToReturn'],
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (MapsQueryClient);

/***/ }),

/***/ "./src/MapsTile/MapProjection.js":
/*!***************************************!*\
  !*** ./src/MapsTile/MapProjection.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const MapProjection = {
    SphericalMercator: 3857
};

Object.freeze(MapProjection);

/* harmony default export */ __webpack_exports__["default"] = (MapProjection);

/***/ }),

/***/ "./src/MapsTile/MapsClient.js":
/*!************************************!*\
  !*** ./src/MapsTile/MapsClient.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Advanced/BaseClient */ "./src/Advanced/BaseClient.js");
/* harmony import */ var _RasterMapType__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./RasterMapType */ "./src/MapsTile/RasterMapType.js");


class MapsClient extends _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(apiKey) {
        super(apiKey);
    }

    getRasterTile(options, callback) {
        let opts = options || {};
        let z = opts['z'];
        let x = opts['x'];
        let y = opts['y'];
        let projection = opts['projection'];
        let mapType = opts['mapType'];
        let tileSize = opts['tileSize'];
        let tileResolution = opts['tileResolution'];

        // verify the required parameter 'style' is set
        if (mapType === undefined || mapType === null || mapType === '') {
            throw new Error("Missing the required parameter 'mapType' when calling getRasterTile");
        }
        else {
            switch (mapType) {
                case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].Default:
                    mapType = "light";
                    break;
                case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].Light:
                case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].Dark:
                case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].Hybrid:
                case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].Aerial:
                    break;
                case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].TransparentBackground:
                    mapType = "transparent-background";
                    break;
                default:
                    throw new Error("The 'style' didn't match any RasterMapType");
            }
        }

        // verify the required parameter 'resolution' is set
        if (tileResolution === undefined || tileResolution === null || tileResolution === '') {
            throw new Error("Missing the required parameter 'tileResolution' when calling getRasterTile");
        }

        // verify the required parameter 'srid' is set
        if (projection === undefined || projection === null || projection === '') {
            throw new Error("Missing the required parameter 'projection' when calling getRasterTile");
        }

        // verify the required parameter 'tileSize' is set
        if (tileSize === undefined || tileSize === null || tileSize === '') {
            throw new Error("Missing the required parameter 'tileSize' when calling getRasterTile");
        }

        // verify the required parameter 'tileZ' is set
        if (z === undefined || z === null || z === '') {
            throw new Error("Missing the required parameter 'z' when calling getRasterTile");
        }

        // verify the required parameter 'tileX' is set
        if (x === undefined || x === null || x === '') {
            throw new Error("Missing the required parameter 'x' when calling getRasterTile");
        }

        // verify the required parameter 'tileY' is set
        if (y === undefined || y === null || y === '') {
            throw new Error("Missing the required parameter 'y' when calling getRasterTile");
        }

        var fileExtension = "jpeg";
        switch (style) {
            case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].Aerial:
            case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].Hybrid:
                fileExtension = "jpeg";
                break;
            case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].Light:
            case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].Dark:
            case _RasterMapType__WEBPACK_IMPORTED_MODULE_1__["default"].TransparentBackground:
            default:
                fileExtension = "png";
                break;
        }

        let path = '/api/v1/maps/raster/{style}/x{resolution}/{srid}/{tileSize}/{tileZ}/{tileX}/{tileY}.{fileExtension}';
        let httpMethod = 'GET';
        let pathParams = {
            'style': mapType,
            'resolution': tileResolution,
            'srid': projection,
            'tileSize': tileSize,
            'tileZ': z,
            'tileX': x,
            'tileY': y,
            'fileExtension': fileExtension
        };
        let queryParams = {};
        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'Blob';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getVectorTile(options, callback) {
        let opts = options || {};
        let z = opts['z'];
        let x = opts['x'];
        let y = opts['y'];
        let projection = opts['projection'];

        // verify the required parameter 'srid' is set
        if (projection === undefined || projection === null || projection === '') {
            throw new Error("Missing the required parameter 'projection' when calling getVectorTile");
        }

        // verify the required parameter 'tileZ' is set
        if (z === undefined || z === null || z === '') {
            throw new Error("Missing the required parameter 'z' when calling getVectorTile");
        }

        // verify the required parameter 'tileX' is set
        if (x === undefined || x === null || x === '') {
            throw new Error("Missing the required parameter 'x' when calling getVectorTile");
        }

        // verify the required parameter 'tileY' is set
        if (y === undefined || y === null || y === '') {
            throw new Error("Missing the required parameter 'y' when calling getVectorTile");
        }

        let path = '/api/v1/maps/vector/streets/{srid}/{tileZ}/{tileX}/{tileY}.pbf';
        let httpMethod = 'GET';
        let pathParams = {
            'srid': projection,
            'tileZ': z,
            'tileX': x,
            'tileY': y
        };
        let queryParams = {};
        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'arrayBuffer';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (MapsClient);

/***/ }),

/***/ "./src/MapsTile/RasterMapType.js":
/*!***************************************!*\
  !*** ./src/MapsTile/RasterMapType.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const RasterMapType = {
    Default: 'default',
    Light: 'light',
    Dark: 'dark',
    Hybrid: 'hybrid',
    Aerial: 'aerial',
    TransparentBackground: 'transparentBackground',
};

Object.freeze(RasterMapType);

/* harmony default export */ __webpack_exports__["default"] = (RasterMapType);

/***/ }),

/***/ "./src/MapsTile/TileResolution.js":
/*!****************************************!*\
  !*** ./src/MapsTile/TileResolution.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const TileResolution = {
    Default: 1,
    Standard: 1,
    High: 2
};

Object.freeze(TileResolution);

/* harmony default export */ __webpack_exports__["default"] = (TileResolution);

/***/ }),

/***/ "./src/MapsTile/TileSize.js":
/*!**********************************!*\
  !*** ./src/MapsTile/TileSize.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const TileSize = {
    Default: 512,
    Small: 256,
    Medium: 512,
};

Object.freeze(TileSize);

/* harmony default export */ __webpack_exports__["default"] = (TileSize);

/***/ }),

/***/ "./src/Projection/ProjectionClient.js":
/*!********************************************!*\
  !*** ./src/Projection/ProjectionClient.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Advanced/BaseClient */ "./src/Advanced/BaseClient.js");


class ProjectionClient extends _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(apiKey) {
        super(apiKey);
    }

    project(options, callback) {
        let opts = options || {};

        let pointX = opts['pointX'];
        let pointY = opts['pointY'];

        let wkt = opts['wkt'];

        let body = opts['body'];

        let fromProj = opts['fromProj'];
        let toProj = opts['toProj'];

        if (pointX != undefined && pointY != undefined) {
            this.projectForPoint(pointY, pointX, fromProj, toProj, callback);
        }
        else if (wkt != undefined) {
            this.projectForGeometry(wkt, fromProj, toProj, callback)
        }
        else {
            this.projecForGeometries(opts, callback);
        }
    }

    projectForPoint(pointY, pointX, fromProj, toProj, callback) {
        // verify the required parameter 'pointY' is set
        if (pointY === undefined || pointY === null || pointY === '') {
            throw new Error("Missing the required parameter 'pointY' when calling projectionForPoint");
        }

        // verify the required parameter 'pointX' is set
        if (pointX === undefined || pointX === null || pointX === '') {
            throw new Error("Missing the required parameter 'pointX' when calling projectionForPoint");
        }

        // verify the required parameter 'fromProj' is set
        if (fromProj === undefined || fromProj === null || fromProj === '') {
            throw new Error("Missing the required parameter 'fromProj' when calling projectionForPoint");
        }

        // verify the required parameter 'toProj' is set
        if (toProj === undefined || toProj === null || toProj === '') {
            throw new Error("Missing the required parameter 'toProj' when calling projectionForPoint");
        }
        let path = '/api/v1/projection/{pointY},{pointX}';
        let httpMethod = 'GET';
        let pathParams = {
            'pointY': pointY,
            'pointX': pointX
        };
        let queryParams = {
            'fromProj': fromProj,
            'toProj': toProj,
        };
        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    projectForGeometry(wkt, fromProj, toProj, callback) {
        // verify the required parameter 'wkt' is set
        if (wkt === undefined || wkt === null || wkt === '') {
            throw new Error("Missing the required parameter 'wkt' when calling projectionForGeometry");
        }

        // verify the required parameter 'fromProj' is set
        if (fromProj === undefined || fromProj === null || fromProj === '') {
            throw new Error("Missing the required parameter 'fromProj' when calling projectionForGeometry");
        }

        // verify the required parameter 'toProj' is set
        if (toProj === undefined || toProj === null || toProj === '') {
            throw new Error("Missing the required parameter 'toProj' when calling projectionForGeometry");
        }

        let path = '/api/v1/projection';
        let httpMethod = 'GET';
        let pathParams = {};
        let queryParams = {
            'wkt': wkt,
            'fromProj': fromProj,
            'toProj': toProj,
        };
        let bodyParam = {};
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    projectForGeometries(options, callback) {
        let opts = options || {};

        let path = '/api/v1/projection/multi';
        let httpMethod = 'POST';
        let pathParams = {};
        let queryParams = {};
        let bodyParam = JSON.stringify(opts['body']);
        var contentTypes = ['application/json-patch+json', 'application/json', 'text/json', 'application/_*+json'];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (ProjectionClient);

/***/ }),

/***/ "./src/ReverseGeocoding/LocationCategories.js":
/*!****************************************************!*\
  !*** ./src/ReverseGeocoding/LocationCategories.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const LocationCategories = {
    None: 'None',
    Common: 'Common',
    All: 'All',
    Aeroway: 'Aeroway',
    Amenity: 'Amenity',
    Barrier: 'Barrier',
    Boundary: 'Boundary',
    Building: 'Building',
    Education: 'Education',
    Entertainment: 'Entertainment',
    Financial: 'Financial',
    Healthcare: 'Healthcare',
    Historic: 'Historic',
    Leisure: 'Leisure',
    Manmade: 'Manmade',
    Natural: 'Natural',
    Rail: 'Rail',
    Power: 'Power',
    Road: 'Road',
    Shop: 'Shop',
    Sport: 'Sport',
    Sustenance: 'Sustenance',
    Tourism: 'Tourism',
    Transportation: 'Transportation',
    Waterway: 'Waterway',
    Intersection: 'Intersection',
    AddressPoint: 'AddressPoint',
    Others: 'Others',
};

Object.freeze(LocationCategories);

/* harmony default export */ __webpack_exports__["default"] = (LocationCategories);

/***/ }),

/***/ "./src/ReverseGeocoding/ReverseGeocodingClient.js":
/*!********************************************************!*\
  !*** ./src/ReverseGeocoding/ReverseGeocodingClient.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Advanced/BaseClient */ "./src/Advanced/BaseClient.js");


class ReverseGeocodingClient extends _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(apiKey) {
        super(apiKey);
    }

    search(options, callback) {
        let opts = options || {};

        let pointX = opts['pointX'];
        let pointY = opts['pointY'];


        let body = opts['body'];

        let placeId = opts['placeId'];

        if (pointX != undefined && pointY != undefined) {
            this.searchPlaceByPoint(pointY, pointX, callback, opts);
        }
        else if (opts["wkt"] != undefined) {
            if (opts["wkt"].indexOf("LINESTRING") >= 0 || opts["wkt"].indexOf("linestring") >= 0) {
                this.searchPlaceByLine(opts["wkt"], callback, opts);
            }
            else {
                this.searchPlaceByArea(opts["wkt"], callback, opts);
            }
        }
        else if (body != undefined) {
            this.searchPlaceByPoints(opts, callback);
        }
        else if (placeId != undefined) {
            this.searchPlaceById(placeId, callback, opts);
        }
    }

    searchPlaceByPoint(pointY, pointX, callback, options) {
        let opts = options || {};

        // verify the required parameter 'pointY' is set
        if (pointY === undefined || pointY === null || pointY === '') {
            throw new Error("Missing the required parameter 'pointY' when calling searchPlaceByPoint");
        }

        // verify the required parameter 'pointX' is set
        if (pointX === undefined || pointX === null || pointX === '') {
            throw new Error("Missing the required parameter 'pointX' when calling searchPlaceByPoint");
        }
        let path = '/api/v1/location/reverse-geocode/{pointY},{pointX}';
        let httpMethod = 'GET';
        let pathParams = {
            'pointY': pointY,
            'pointX': pointX
        };
        let queryParams = {
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'Lang': opts['lang'],
            'SearchRadius': opts['searchRadius'],
            'SearchRadiusUnit': opts['searchRadiusUnit'],
            'MaxResults': opts['maxResults'],
            'LocationCategories': opts['locationCategories'],
            'LocationTypes': opts['locationTypes'],
            'VerboseResults': opts['verboseResults'],
            'DistanceFromQueryFeatureUnit': opts['distanceFromQueryFeatureUnit'],
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    searchPlaceByLine(wkt, callback, options) {
        let opts = options || {};

        // verify the required parameter 'wkt' is set
        if (wkt === undefined || wkt === null || wkt === '') {
            throw new Error("Missing the required parameter 'wkt' when calling searchPlaceByLine");
        }
        let path = '/api/v1/location/reverse-geocode/line';
        let httpMethod = 'GET';
        let pathParams = {};
        let queryParams = {
            'wkt': wkt,
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'Lang': opts['lang'],
            'SearchRadius': opts['searchRadius'],
            'SearchRadiusUnit': opts['searchRadiusUnit'],
            'MaxResults': opts['maxResults'],
            'LocationCategories': opts['locationCategories'],
            'LocationTypes': opts['locationTypes'],
            'VerboseResults': opts['verboseResults'],
            'DistanceFromQueryFeatureUnit': opts['distanceFromQueryFeatureUnit'],
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    searchPlaceByArea(wkt, callback, options) {
        let opts = options || {};
        // verify the required parameter 'wkt' is set
        if (wkt === undefined || wkt === null || wkt === '') {
            throw new Error("Missing the required parameter 'wkt' when calling searchPlaceByArea");
        }
        let path = '/api/v1/location/reverse-geocode/area';
        let httpMethod = 'GET';
        let pathParams = {};
        let queryParams = {
            'wkt': wkt,
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'Lang': opts['lang'],
            'SearchRadius': opts['searchRadius'],
            'SearchRadiusUnit': opts['searchRadiusUnit'],
            'MaxResults': opts['maxResults'],
            'LocationCategories': opts['locationCategories'],
            'LocationTypes': opts['locationTypes'],
            'VerboseResults': opts['verboseResults'],
            'DistanceFromQueryFeatureUnit': opts['distanceFromQueryFeatureUnit'],
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    searchPlaceByPoints(options, callback) {
        let opts = options || {};

        let path = '/api/v1/location/reverse-geocode/multi';
        let httpMethod = 'POST';
        let pathParams = {};
        let queryParams = {
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'Lang': opts['lang'],
            'SearchRadius': opts['searchRadius'],
            'SearchRadiusUnit': opts['searchRadiusUnit'],
            'MaxResults': opts['maxResults'],
            'LocationCategories': opts['locationCategories'],
            'LocationTypes': opts['locationTypes'],
            'VerboseResults': opts['verboseResults'],
            'DistanceFromQueryFeatureUnit': opts['distanceFromQueryFeatureUnit'],
        };
        let bodyParam = JSON.stringify(opts['body']);
        var contentTypes = ['application/json-patch+json', 'application/json', 'text/json', 'application/_*+json'];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    searchPlaceById(placeId, callback, options) {
        let opts = options || {};

        // verify the required parameter 'placeId' is set
        if (placeId === undefined || placeId === null || placeId === '') {
            throw new Error("Missing the required parameter 'placeId' when calling searchPlaceById");
        }

        let path = '/api/v1/location/place/{placeId}';
        let httpMethod = 'GET';
        let pathParams = {
            'placeId': placeId
        };
        let queryParams = {
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
            'Lang': opts['lang'],
            'SearchRadius': opts['searchRadius'],
            'SearchRadiusUnit': opts['searchRadiusUnit'],
            'MaxResults': opts['maxResults'],
            'LocationCategories': opts['locationCategories'],
            'LocationTypes': opts['locationTypes'],
            'VerboseResults': opts['verboseResults'],
            'DistanceFromQueryFeatureUnit': opts['distanceFromQueryFeatureUnit'],
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getPlaceCatergories(callback) {
        let path = '/api/v1/location/reverse-geocode/location-categories';
        let httpMethod = 'GET';
        let pathParams = {};
        let queryParams = {};
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    getCommonCatergories(callback) {
        let path = '/api/v1/location/reverse-geocode/location-categories/common';
        let httpMethod = 'GET';
        let pathParams = {};
        let queryParams = {};
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    searchPlaceInAdvance(options, callback) {
        let opts = options || {};

        let path = '/api/v1/location/reverse-geocode/advanced';
        let httpMethod = 'POST';
        let pathParams = {};
        let queryParams = {};
        let bodyParam = JSON.stringify({
            'Wkt': opts['wkt'],
            'Srid': opts['srid'],
            'Lang': opts['lang'],
            'Proj4String': opts['proj4String'],
            'SearchRadius': opts['searchRadius'],
            'SearchRadiusUnit': opts['searchRadiusUnit'],
            'MaxResults': opts['maxResults'],
            'LocationCategories': opts['locationCategories'],
            'LocationTypes': opts['locationTypes'],
            'VerboseResults': opts['verboseResults'],
            'DistanceFromQueryFeatureUnit': opts['distanceFromQueryFeatureUnit']
        });
        var contentTypes = ['application/json-patch+json', 'application/json', 'text/json', 'application/_*+json'];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (ReverseGeocodingClient);

/***/ }),

/***/ "./src/Routing/RoutingClient.js":
/*!**************************************!*\
  !*** ./src/Routing/RoutingClient.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Advanced/BaseClient */ "./src/Advanced/BaseClient.js");
/* harmony import */ var _RoutingGetRouteOptions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./RoutingGetRouteOptions */ "./src/Routing/RoutingGetRouteOptions.js");
/* harmony import */ var _RoutingGetServiceAreaOptions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./RoutingGetServiceAreaOptions */ "./src/Routing/RoutingGetServiceAreaOptions.js");




class RoutingClient extends _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor (apiKey){
        super(apiKey);
    }

    /**
     * 
     * @param {{x:number, y:number}[]} waypoints 
     * @param {function(number, object) : undefined} callback 
     * @param {RoutingGetRouteOptions | undefined} options 
     */
    getRoute(waypoints, callback, options){
        let opts = options || {};
        
        let coordinatesString;
        waypoints.forEach((waypoint, index) => {
            if (index === 0){
                coordinatesString = (waypoint.y + ',' + waypoint.x);
            }
            else{
                coordinatesString += (';' + waypoint.y + ',' + waypoint.x);
            }
        });
        
        let path = '/api/v1/route/{coordinates}';
        let httpMethod = 'GET';
        let pathParams = {
            coordinates: coordinatesString,
        };
        let queryParams = {
            Srid: opts.srid,
            Proj4String: opts.proj4String,
            TurnByTurn: opts.turnByTurn,
            CoordinateSnapRadius: opts.coordinateSnapRadius,
            CoordinateSnapRadiusUnit: opts.coordinateSnapRadiusUnit,
            DistanceUnit: opts.distanceUnit,
            DurationUnit: opts.durationUnit,
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }

    /**
     * 
     * @param {number} pointY 
     * @param {number} pointX 
     * @param {number[]} serviceLimits 
     * @param {function(number, object) : undefined} callback 
     * @param {RoutingGetServiceAreaOptions | undefined} options 
     */
    getServiceArea(pointY, pointX, serviceLimits, callback, options){
        let opts = options || {};
        
        let path = '/api/v1/service-area/{pointY},{pointX}';
        let httpMethod = 'GET';
        let pathParams = {
            pointX: pointX,
            pointY: pointY,
        };
        let queryParams = {
            ServiceLimits: serviceLimits,
            Srid: opts.srid,
            Proj4String: opts.proj4String,
            ContourGranularity: opts.contourGranularity,
            CoordinateSnapRadius: opts.coordinateSnapRadius,
            CoordinateSnapRadiusUnit: opts.coordinateSnapRadiusUnit,
            DistanceUnit: opts.distanceUnit,
            DurationUnit: opts.durationUnit,
            GridSizeInMeters: opts.gridSizeInMeters,
            ServiceAreaSeparationType: opts.serviceAreaSeparationType,
            ServiceAreaType: opts.serviceAreaType,
            ServiceLimitsType: opts.serviceLimitsType,
            TravelDirection: opts.travelDirection,
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (RoutingClient);

/***/ }),

/***/ "./src/Routing/RoutingGetRouteOptions.js":
/*!***********************************************!*\
  !*** ./src/Routing/RoutingGetRouteOptions.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RoutingGetRouteOptions; });
/* harmony import */ var _constants_DistanceUnit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/DistanceUnit */ "./src/constants/DistanceUnit.js");


class RoutingGetRouteOptions{
    /**
     * 
     */
    constructor(){
        /**
         * @type {number | undefined}
         */
        this.srid = undefined;
        /**
         * @type {string | undefined}
         */
        this.proj4String = undefined;
        /**
         * @type {boolean | undefined}
         */
        this.turnByTurn = undefined;
        /**
         * @type {number | undefined}
         */
        this.coordinateSnapRadius = undefined;
        /**
         * @type {DistanceUnit | undefined}
         */
        this.coordinateSnapRadiusUnit = undefined;
        /**
         * @type {DistanceUnit | undefined}
         */
        this.distanceUnit = undefined;
        /**
         * @type {'Hour' | 'Minute' | 'Second' | undefined}
         */
        this.durationUnit = undefined;
    }
}

/***/ }),

/***/ "./src/Routing/RoutingGetServiceAreaOptions.js":
/*!*****************************************************!*\
  !*** ./src/Routing/RoutingGetServiceAreaOptions.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return GetServiceAreaOptions; });
/* harmony import */ var _constants_DistanceUnit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/DistanceUnit */ "./src/constants/DistanceUnit.js");


class GetServiceAreaOptions{
    /**
     * 
     */
    constructor(){
        /**
         * @type {number | undefined}
         */
        this.srid = undefined;
        /**
         * @type {string | undefined}
         */
        this.proj4String = undefined;
        /**
         * @type {number | undefined}
         */
        this.contourGranularity = undefined;
        /**
         * @type {number | undefined}
         */
        this.coordinateSnapRadius = undefined;
        /**
         * @type {DistanceUnit | undefined}
         */
        this.coordinateSnapRadiusUnit = undefined;
        /**
         * @type {DistanceUnit | undefined}
         */
        this.distanceUnit = undefined;
        /**
         * @type {'Hour' | 'Minute' | 'Second' | undefined}
         */
        this.durationUnit = undefined;
        /**
         * @type {number | undefined}
         */
        this.gridSizeInMeters = undefined;
        /**
         * @type {'Separated' | 'Merged' | undefined}
         */
        this.serviceAreaSeparationType = undefined;
        /**
         * @type {'Polygon' | 'LineString' | undefined}
         */
        this.serviceAreaType = undefined;
        /**
         * @type {'Time' | 'Distance' | undefined}
         */
        this.serviceLimitsType = undefined;
        /**
         * @type {'From' | 'To' | undefined}
         */
        this.travelDirection = undefined;
    }
}

/***/ }),

/***/ "./src/TimeZone/TimeZoneClient.js":
/*!****************************************!*\
  !*** ./src/TimeZone/TimeZoneClient.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Advanced/BaseClient */ "./src/Advanced/BaseClient.js");


class TimeZoneClient extends _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(apiKey) {
        super(apiKey);
    }

    getTimeZoneByCoordinate(pointY, pointX, callback, options) {
        let opts = options || {};

        // verify the required parameter 'pointY' is set
        if (pointY === undefined || pointY === null || pointY === '') {
            throw new Error('Missing the required parameter \'pointY\' when calling getTimeZoneByCoordinate');
        }

        // verify the required parameter 'pointX' is set
        if (pointX === undefined || pointX === null || pointX === '') {
            throw new Error('Missing the required parameter \'pointX\' when calling getTimeZoneByCoordinate');
        }
        let path = '/api/v1/timezones/{pointY},{pointX}';
        let httpMethod = 'GET';
        let pathParams = {
            'pointY': pointY,
            'pointX': pointX
        };
        let queryParams = {
            'Srid': opts['srid'],
            'Proj4String': opts['proj4String'],
        };
        let bodyParam = null;
        let contentTypes = [];
        let returnType = 'json';

        this.callApi(path, httpMethod, pathParams, queryParams, bodyParam, undefined, contentTypes, returnType, callback);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (TimeZoneClient);

/***/ }),

/***/ "./src/constants/DistanceUnit.js":
/*!***************************************!*\
  !*** ./src/constants/DistanceUnit.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * @enum {string}
 */
const DistanceUnit = {
    Meter: 'Meter',
    Feet: 'Feet',
    Kilometer: 'Kilometer',
    Mile: 'Mile',
    UsSurveyFeet: 'UsSurveyFeet',
    Yard: 'Yard',
    NauticalMile: 'NauticalMile',
    Inch: 'Inch',
    Link: 'Link',
    Chain: 'Chain',
    Pole: 'Pole',
    Rod: 'Rod',
    Furlong: 'Furlong',
    Vara: 'Vara',
    Arpent: 'Arpent',
};
Object.freeze(DistanceUnit);
/* harmony default export */ __webpack_exports__["default"] = (DistanceUnit);

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants_DistanceUnit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants/DistanceUnit */ "./src/constants/DistanceUnit.js");
/* harmony import */ var _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Advanced/BaseClient */ "./src/Advanced/BaseClient.js");
/* harmony import */ var _Elevation_ElevationClient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Elevation/ElevationClient */ "./src/Elevation/ElevationClient.js");
/* harmony import */ var _Projection_ProjectionClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Projection/ProjectionClient */ "./src/Projection/ProjectionClient.js");
/* harmony import */ var _Geocoding_GeocodingClient__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Geocoding/GeocodingClient */ "./src/Geocoding/GeocodingClient.js");
/* harmony import */ var _ReverseGeocoding_ReverseGeocodingClient__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ReverseGeocoding/ReverseGeocodingClient */ "./src/ReverseGeocoding/ReverseGeocodingClient.js");
/* harmony import */ var _ReverseGeocoding_LocationCategories__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ReverseGeocoding/LocationCategories */ "./src/ReverseGeocoding/LocationCategories.js");
/* harmony import */ var _ColorUtilities_ColorClient__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ColorUtilities/ColorClient */ "./src/ColorUtilities/ColorClient.js");
/* harmony import */ var _MapsTile_MapsClient__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./MapsTile/MapsClient */ "./src/MapsTile/MapsClient.js");
/* harmony import */ var _MapsTile_RasterMapType__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./MapsTile/RasterMapType */ "./src/MapsTile/RasterMapType.js");
/* harmony import */ var _MapsTile_MapProjection__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./MapsTile/MapProjection */ "./src/MapsTile/MapProjection.js");
/* harmony import */ var _MapsTile_TileResolution__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./MapsTile/TileResolution */ "./src/MapsTile/TileResolution.js");
/* harmony import */ var _MapsTile_TileSize__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./MapsTile/TileSize */ "./src/MapsTile/TileSize.js");
/* harmony import */ var _Routing_RoutingClient__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./Routing/RoutingClient */ "./src/Routing/RoutingClient.js");
/* harmony import */ var _TimeZone_TimeZoneClient__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./TimeZone/TimeZoneClient */ "./src/TimeZone/TimeZoneClient.js");
/* harmony import */ var _MapsQuery_MapsQueryClient__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./MapsQuery/MapsQueryClient */ "./src/MapsQuery/MapsQueryClient.js");



























let tg = {};
tg.DistanceUnit = _constants_DistanceUnit__WEBPACK_IMPORTED_MODULE_0__["default"];
tg.BaseClient = _Advanced_BaseClient__WEBPACK_IMPORTED_MODULE_1__["default"];

tg.ElevationClient = _Elevation_ElevationClient__WEBPACK_IMPORTED_MODULE_2__["default"];

tg.ProjectionClient = _Projection_ProjectionClient__WEBPACK_IMPORTED_MODULE_3__["default"];

tg.GeocodingClient = _Geocoding_GeocodingClient__WEBPACK_IMPORTED_MODULE_4__["default"];

tg.ReverseGeocodingClient = _ReverseGeocoding_ReverseGeocodingClient__WEBPACK_IMPORTED_MODULE_5__["default"];
tg.LocationCategories = _ReverseGeocoding_LocationCategories__WEBPACK_IMPORTED_MODULE_6__["default"];

tg.ColorClient = _ColorUtilities_ColorClient__WEBPACK_IMPORTED_MODULE_7__["default"];

tg.MapsClient = _MapsTile_MapsClient__WEBPACK_IMPORTED_MODULE_8__["default"];
tg.RasterMapType = _MapsTile_RasterMapType__WEBPACK_IMPORTED_MODULE_9__["default"];
tg.MapProjection = _MapsTile_MapProjection__WEBPACK_IMPORTED_MODULE_10__["default"];
tg.TileResolution = _MapsTile_TileResolution__WEBPACK_IMPORTED_MODULE_11__["default"];
tg.TileSize = _MapsTile_TileSize__WEBPACK_IMPORTED_MODULE_12__["default"];

tg.RoutingClient = _Routing_RoutingClient__WEBPACK_IMPORTED_MODULE_13__["default"];

tg.TimeZoneClient = _TimeZone_TimeZoneClient__WEBPACK_IMPORTED_MODULE_14__["default"];

tg.MapsQueryClient = _MapsQuery_MapsQueryClient__WEBPACK_IMPORTED_MODULE_15__["default"];

/* harmony default export */ __webpack_exports__["default"] = (tg);

/***/ }),

/***/ "./src/shared/AccessToken.js":
/*!***********************************!*\
  !*** ./src/shared/AccessToken.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class AccessToken {
    constructor(accessToken, tokenType, expiresTime) {
        this.accessToken = accessToken
        this.tokenType = tokenType
        this.expiresTime = expiresTime
    }
}

/* harmony default export */ __webpack_exports__["default"] = (AccessToken);

/***/ }),

/***/ "./src/shared/Util.js":
/*!****************************!*\
  !*** ./src/shared/Util.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class Util {
    static applyAuthToRequest(authNames, authentications, params) {
        authNames.forEach((authName) => {
            let auth = authentications[authName];
            switch (auth.type) {
                case 'basic':
                    if (auth.username || auth.password) {
                        let username = auth.username || '';
                        let password = auth.password || '';
                        params.setHeaderObj['Authorization'] = "Basic " + btoa(`${username}:${password}`);
                    }
                    break;
                case 'apiKey':
                    if (auth.apiKey) {
                        let data = {};
                        if (auth.apiKeyPrefix) {
                            data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
                        } else {
                            data[auth.name] = auth.apiKey;
                        }
                        if (auth['in'] === 'header') {
                            params.setHeaderObj['X-API-Key'] = data[auth.name]; //data[auth.name] -> apiKey
                        } else { //apiKey in query
                            params.queryObj['apikey'] = data[auth.name];
                        }
                    }
                    break;
                case 'oauth2':
                    // // comments accessToken code
                    // let accessToken = this.getToken();
                    // if (accessToken) {
                    //     params.setHeaderObj['Authorization'] = accessToken["tokenType"] + ' ' + accessToken["accessToken"];
                    // } else {
                    //     params.setHeaderObj['Authorization'] = accessToken["tokenType"] + ' ' + accessToken["accessToken"];
                    // }
                    break;
                default:
                    throw new Error('Unknown authentication type: ' + auth.type);
            }
        });
        return params
    }
    static paramToString(param) {
        if (param === undefined || param === null) {
            return '';
        }
        if (param instanceof Date) {
            return param.toJSON();
        }
        return param.toString();
    }

    static buildUrl(baseUri, path, pathParams, queryParams) {
        if (!path.match(/^\//)) {
            path = '/' + path;
        }
        let url = baseUri + path;
        url = url.replace(/\{([\w-]+)\}/g, (fullMatch, key) => {
            let value;
            if (pathParams.hasOwnProperty(key)) {
                value = Util.paramToString(pathParams[key]);
            } else {
                value = fullMatch;
            }
            return encodeURIComponent(value);
        });

        let queryString = '';
        let keysArr = Object.keys(queryParams);
        keysArr.forEach((key) => {
            if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== '') {
                if (queryString === '') {
                    queryString += `?${key}=${queryParams[key]}`
                } else {
                    queryString += `&${key}=${queryParams[key]}`
                }
            }
        });
        url += queryString;
        return url;
    }

    static setRequestHeader(xhr, setHeaderObj) {
        Object.keys(setHeaderObj).forEach(function (key) {
            xhr.setRequestHeader(key, setHeaderObj[key]);
        });
    }

    static getAccessTokenFromLocalStorage(accessToken) {
        for (let key in accessToken) {
            let itemValue = localStorage.getItem(key);
            if (itemValue === undefined) {
                throw "Token Item Missing";
            }
            else {
                accessToken[key] = itemValue;
            }
        }
    }
    static setAccessTokenToLocalStorage(accessToken) {
        for (let key in accessToken) {
            localStorage.setItem(key, accessToken[key])
        }
    }
    static removeAccessTokenFromLocalStorage(accessToken) {
        for (let key in accessToken) {
            localStorage.removeItem(key)
        }
    }

    static getLocalStorage(name) {
        return localStorage.getItem(name);
    }
    static setLocalStorage(name, value) {
        localStorage.setItem(name, value)
    }

    static setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 1000));
        // d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    static getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}

/* harmony default export */ __webpack_exports__["default"] = (Util);

/***/ })

/******/ })["default"];
});
//# sourceMappingURL=thinkgeocloudclient-dev.js.map