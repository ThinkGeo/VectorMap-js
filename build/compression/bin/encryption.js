var encryption = {
    name: "encryption",
    version: "1.0 (beta 1)",
    exports: "Base, Package, Abstract, Module, Enumerable, Map, Collection, RegGrp, " + "assert, assertArity, assertType, " +
        "assignID, copy, counter, detect, extend, forEach, format, instanceOf, match, rescape, slice, trim, " +
        "I, K, Undefined, Null, True, False, bind, delegate, flip, not, partial, unbind",
    global: this,
    namespace: "var global=encryption.global;function base(o,a){return o.base.apply(o,a)};",
    detect: new function(_) {
        var global = _;
        var jscript /*@cc_on=@_jscript_version@*/ ;
        var java = _.java ? true : false;
        if (_.navigator) {
            var element = document.createElement("span");
            var userAgent = navigator.platform + " " + navigator.userAgent;
            if (!jscript) userAgent = userAgent.replace(/MSIE\s[\d.]+/, "");
            userAgent = userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
            java &= navigator.javaEnabled()
        }
        return function(a) {
            var r = false;
            var b = a.charAt(0) == "!";
            if (b) a = a.slice(1);
            if (a.charAt(0) == "(") {
                try {
                    eval("r=!!" + a)
                } catch (error) {}
            } else { r = new RegExp("(" + a + ")", "i").test(userAgent) }
            return !!(b ^ r)
        }
    }(this)
};
new function(_) {
    var detect = encryption.detect;
    var slice = Array.slice || (function(b) { return function(a) { return b.apply(a, b.call(arguments, 1)) } })(Array.prototype.slice);
    var Undefined = K(),
        Null = K(null),
        True = K(true),
        False = K(false);
    var _0 = /%([1-9])/g;
    var _1 = /^\s\s*/;
    var _2 = /\s\s*$/;
    var _3 = /([\/()[\]{}|*+-.,^$?\\])/g;
    var _4 = /eval/.test(detect) ? /\bbase\s*\(/ : /.*/;
    var _5 = ["constructor", "toString", "valueOf"];
    var _6 = String(new RegExp);
    var _7 = 1;
    _8();
    eval(encryption.namespace);
    var _9 = function(a, b) {
        encryption.__prototyping = true;
        var c = new this;
        extend(c, a);
        delete encryption.__prototyping;
        var d = c.constructor;

        function _10() {
            if (!encryption.__prototyping) {
                if (this.constructor == arguments.callee || this.__constructing) {
                    this.__constructing = true;
                    d.apply(this, arguments);
                    delete this.__constructing
                } else { return extend(arguments[0], c) }
            }
            return this
        };
        c.constructor = _10;
        for (var i in Base) _10[i] = this[i];
        _10.toString = K(String(d));
        _10.ancestor = this;
        _10.base = Undefined;
        _10.init = Undefined;
        extend(_10, b);
        _10.prototype = c;
        _10.init();
        return _10
    };
    var Base = _9.call(Object, {
            constructor: function() {
                if (arguments.length > 0) {
                    this.extend(arguments[0])
                }
            },
            base: function() {},
            extend: delegate(extend)
        },
        Base = {
            ancestorOf: delegate(_11),
            extend: _9,
            forEach: delegate(_8),
            implement: function(a) {
                if (typeof a == "function") { if (_11(Base, a)) { a(this.prototype) } } else { extend(this.prototype, a) }
                return this
            }
        });
    var Package = Base.extend({
        constructor: function(d, e) {
            this.extend(e);
            if (this.init) this.init();
            if (this.name != "encryption") {
                if (!this.parent) this.parent = encryption;
                this.parent.addName(this.name, this);
                this.namespace = format("var %1=%2;", this.name, String(this).slice(1, -1))
            }
            var f = /[^\s,]+/g;
            if (d) {
                d.imports = Array2.reduce(this.imports.match(f), function(a, b) {
                    eval("var ns=encryption." + b);
                    assert(ns, format("Package not found: '%1'.", b));
                    return a += ns.namespace
                }, encryption.namespace + JavaScript.namespace);
                d.exports = Array2.reduce(this.exports.match(f), function(a, b) {
                    var c = this.name + "." + b;
                    this.namespace += "var " + b + "=" + c + ";";
                    return a += "if(!" + c + ")" + c + "=" + b + ";"
                }, "", this)
            }
        },
        exports: "",
        imports: "",
        name: "",
        namespace: "",
        parent: null,
        addName: function(a, b) {
            if (!this[a]) {
                this[a] = b;
                this.exports += ", " + a;
                this.namespace += format("var %1=%2.%1;", a, this.name)
            }
        },
        addPackage: function(a) { this.addName(a, new Package(null, { name: a, parent: this })) },
        toString: function() { return format("[%1]", this.parent ? String(this.parent).slice(1, -1) + "." + this.name : this.name) }
    });
    var Abstract = Base.extend({ constructor: function() { throw new TypeError("Class cannot be instantiated."); } });
    var Module = Abstract.extend(null, {
        extend: function(a, b) {
            var c = this.base();
            _12(c, this);
            c.implement(a);
            extend(c, b);
            c.init();
            return c
        },
        implement: function(c) {
            var d = this;
            if (typeof c == "function") { d.base(c); if (_11(Module, c)) { _12(d, c) } } else {
                var e = {};
                _8(Object, c, function(a, b) {
                    if (b.charAt(0) == "@") {
                        if (detect(b.slice(1))) { forEach(a, arguments.callee) }
                    } else if (!Module[b] && typeof a == "function" && a.call) {
                        function _13() {
                            return d[b].apply(d, [this].concat(slice(arguments)))
                        };
                        _13.__base = _4.test(a);
                        e[b] = _13
                    }
                });
                extend(d.prototype, e);
                extend(d, c)
            }
            return d
        }
    });

    function _12(a, b) {
        for (var c in b) {
            var method = b[c];
            if (!Module[c] && typeof method == "function" && method.call) {
                a[c] = method
            }
        }
    };
    var Enumerable = Module.extend({
        every: function(c, d, e) {
            var f = true;
            try {
                this.forEach(c, function(a, b) {
                    f = d.call(e, a, b, c);
                    if (!f) throw StopIteration;
                })
            } catch (error) {
                if (error != StopIteration) throw error;
            }
            return !!f
        },
        filter: function(d, e, f) {
            var i = 0;
            return this.reduce(d, function(a, b, c) {
                if (e.call(f, b, c, d)) {
                    a[i++] = b
                }
                return a
            }, [])
        },
        invoke: function(b, c) {
            var d = slice(arguments, 2);
            return this.map(b, (typeof c == "function") ?
                function(a) {
                    return (a == null) ? undefined : c.apply(a, d)
                } : function(a) {
                    return (a == null) ? undefined : a[c].apply(a, d)
                })
        },
        map: function(c, d, e) {
            var f = [],
                i = 0;
            this.forEach(c, function(a, b) { f[i++] = d.call(e, a, b, c) });
            return f
        },
        pluck: function(b, c) { return this.map(b, function(a) { return (a == null) ? undefined : a[c] }) },
        reduce: function(c, d, e, f) {
            var g = arguments.length > 2;
            this.forEach(c, function(a, b) {
                if (g) { e = d.call(f, e, a, b, c) } else {
                    e = a;
                    g = true
                }
            });
            return e
        },
        some: function(a, b, c) { return !this.every(a, not(b), c) }
    }, { forEach: forEach });
    var _14 = "#";
    var Map = Base.extend({
        constructor: function(a) { this.merge(a) },
        copy: delegate(copy),
        forEach: function(a, b) {
            for (var c in this)
                if (c.charAt(0) == _14) { a.call(b, this[c], c.slice(1), this) }
        },
        get: function(a) { return this[_14 + a] },
        getKeys: function() { return this.map(flip(I)) },
        getValues: function() { return this.map(I) },
        has: function(a) { /*@cc_on@*/ /*@if(@_jscript_version<5.5)return $Legacy.has(this,_14+a);@else@*/ return _14 + a in this; /*@end@*/ },
        merge: function(b) {
            var c = flip(this.put);
            forEach(arguments, function(a) { forEach(a, c, this) }, this);
            return this
        },
        remove: function(a) { delete this[_14 + a] },
        put: function(a, b) {
            if (arguments.length == 1) b = a;
            this[_14 + a] = b
        },
        size: function() {
            var a = 0;
            for (var b in this)
                if (b.charAt(0) == _14) a++;
            return a
        },
        union: function(a) { return this.merge.apply(this.copy(), arguments) }
    });
    Map.implement(Enumerable);
    var _15 = "~";
    var Collection = Map.extend({
        constructor: function(a) {
            this[_15] = new Array2;
            this.base(a)
        },
        add: function(a, b) {
            assert(!this.has(a), "Duplicate key '" + a + "'.");
            this.put.apply(this, arguments)
        },
        copy: function() {
            var a = this.base();
            a[_15] = this[_15].copy();
            return a
        },
        forEach: function(a, b) { var c = this[_15]; var d = c.length; for (var i = 0; i < d; i++) { a.call(b, this[_14 + c[i]], c[i], this) } },
        getAt: function(a) { if (a < 0) a += this[_15].length; var b = this[_15][a]; return (b === undefined) ? undefined : this[_14 + b] },
        getKeys: function() { return this[_15].concat() },
        indexOf: function(a) { return this[_15].indexOf(String(a)) },
        insertAt: function(a, b, c) {
            assert(Math.abs(a) < this[_15].length, "Index out of bounds.");
            assert(!this.has(b), "Duplicate key '" + b + "'.");
            this[_15].insertAt(a, String(b));
            this.put.apply(this, slice(arguments, 1))
        },
        item: Undefined,
        put: function(a, b) {
            if (arguments.length == 1) b = a;
            if (!this.has(a)) { this[_15].push(String(a)) }
            var c = this.constructor;
            if (c.Item && !instanceOf(b, c.Item)) { b = c.create.apply(c, arguments) }
            this[_14 + a] = b
        },
        putAt: function(a, b) {
            assert(Math.abs(a) < this[_15].length, "Index out of bounds.");
            arguments[0] = this[_15].item(a);
            this.put.apply(this, arguments)
        },
        remove: function(a) {
            if (this.has(a)) {
                this[_15].remove(String(a));
                delete this[_14 + a]
            }
        },
        removeAt: function(a) {
            this[_15].removeAt(a);
            delete this[_14 + key]
        },
        reverse: function() { this[_15].reverse(); return this },
        size: function() { return this[_15].length },
        sort: function(c) {
            if (c) {
                var d = this;
                this[_15].sort(function(a, b) { return c(d[_14 + a], d[_14 + b], a, b) })
            } else this[_15].sort();
            return this
        },
        toString: function() { return String(this[_15]) }
    }, {
        Item: null,
        init: function() { this.prototype.item = this.prototype.getAt },
        create: function(a, b) { return this.Item ? new this.Item(a, b) : b },
        extend: function(a, b) {
            var c = this.base(a);
            c.create = this.create;
            extend(c, b);
            if (!c.Item) { c.Item = this.Item } else if (typeof c.Item != "function") { c.Item = (this.Item || Base).extend(c.Item) }
            c.init();
            return c
        }
    });
    var _16 = /\\(\d+)/g,
        _17 = /\\./g,
        _18 = /\(\?[:=!]|\[[^\]]+\]/g,
        _19 = /\(/g,
        _20 = /\$(\d+)/,
        _21 = /^\$\d+$/;
    var RegGrp = Collection.extend({
        constructor: function(a, b) {
            this.base(a);
            if (typeof b == "string") {
                this.global = /g/.test(b);
                this.ignoreCase = /i/.test(b)
            }
        },
        global: true,
        ignoreCase: false,
        exec: function(h, j) {
            var k = (this.global ? "g" : "") + (this.ignoreCase ? "i" : "");
            h = String(h) + "";
            if (arguments.length == 1) {
                var l = this;
                var m = this[_15];
                j = function(a) {
                    if (a) {
                        var b, c = 1,
                            i = 0;
                        while ((b = l[_14 + m[i++]])) {
                            var d = c + b.length + 1;
                            if (arguments[c]) {
                                var e = b.replacement;
                                switch (typeof e) {
                                    case "function":
                                        var f = slice(arguments, c, d);
                                        var g = arguments[arguments.length - 2];
                                        return e.apply(l, f.concat(g, h));
                                    case "number":
                                        return arguments[c + e];
                                    default:
                                        return e
                                }
                            }
                            c = d
                        }
                    }
                    return ""
                }
            }
            return h.replace(new RegExp(this, k), j)
        },
        insertAt: function(a, b, c) { if (instanceOf(b, RegExp)) { arguments[1] = b.source } return base(this, arguments) },
        test: function(a) { return this.exec(a) != a },
        toString: function() {
            var e = 0;
            return "(" + this.map(function(c) {
                var d = String(c).replace(_16, function(a, b) { return "\\" + (1 + Number(b) + e) });
                e += c.length + 1;
                return d
            }).join(")|(") + ")"
        }
    }, {
        IGNORE: "$0",
        init: function() {
            forEach("add,get,has,put,remove".split(","), function(b) {
                _22(this, b, function(a) {
                    if (a && a.source) { arguments[0] = a.source }
                    return base(this, arguments)
                })
            }, this.prototype)
        },
        Item: {
            constructor: function(a, b) {
                a = (a && a.source) ? a.source : String(a);
                if (typeof b == "number") b = String(b);
                else if (b == null) b = "";
                if (typeof b == "string" && _20.test(b)) {
                    if (_21.test(b)) { b = parseInt(b.slice(1)) } else {
                        var Q = /'/.test(b.replace(/\\./g, "")) ? '"' : "'";
                        b = b.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\$(\d+)/g, Q + "+(arguments[$1]||" + Q + Q + ")+" + Q);
                        b = new Function("return " + Q + b.replace(/(['"])\1\+(.*)\+\1\1$/, "$1") + Q)
                    }
                }
                this.length = RegGrp.count(a);
                this.replacement = b;
                this.toString = K(a)
            },
            length: 0,
            replacement: ""
        },
        count: function(a) { a = String(a).replace(_17, "").replace(_18, ""); return match(a, _19).length }
    });
    var JavaScript = {
        name: "JavaScript",
        version: encryption.version,
        exports: "Array2, Date2, String2",
        namespace: "",
        bind: function(c) {
            forEach(this.exports.match(/\w+/g), function(a) {
                var b = a.slice(0, -1);
                extend(c[b], this[a]);
                this[a](c[b].prototype)
            }, this)
        }
    };
    if ((new Date).getYear() > 1900) {
        Date.prototype.getYear = function() { return this.getFullYear() - 1900 };
        Date.prototype.setYear = function(a) { return this.setFullYear(a + 1900) }
    }
    Function.prototype.prototype = {};
    if ("".replace(/^/, K("$$")) == "$") {
        extend(String.prototype, "replace", function(a, b) {
            if (typeof b == "function") {
                var c = b;
                b = function() { return String(c.apply(null, arguments)).split("$").join("$$") }
            }
            return this.base(a, b)
        })
    }
    var Array2 = _23(Array, Array, "concat,join,pop,push,reverse,shift,slice,sort,splice,unshift", [Enumerable, {
        combine: function(d, e) { if (!e) e = d; return this.reduce(d, function(a, b, c) { a[b] = e[c]; return a }, {}) },
        contains: function(a, b) { return this.indexOf(a, b) != -1 },
        copy: function(a) { var b = this.slice(a); if (!b.swap) this(b); return b },
        flatten: function(c) {
            return this.reduce(c, function(a, b) {
                if (this.like(b)) {
                    this.reduce(b, arguments.callee, a, this)
                } else { a.push(b) }
                return a
            }, [], this)
        },
        forEach: _24,
        indexOf: function(a, b, c) {
            var d = a.length;
            if (c == null) { c = 0 } else if (c < 0) { c = Math.max(0, d + c) }
            for (var i = c; i < d; i++) { if (a[i] === b) return i }
            return -1
        },
        insertAt: function(a, b, c) {
            this.splice(a, b, 0, c);
            return c
        },
        item: function(a, b) { if (b < 0) b += a.length; return a[b] },
        lastIndexOf: function(a, b, c) {
            var d = a.length;
            if (c == null) { c = d - 1 } else if (from < 0) { c = Math.max(0, d + c) }
            for (var i = c; i >= 0; i--) { if (a[i] === b) return i }
            return -1
        },
        map: function(c, d, e) {
            var f = [];
            this.forEach(c, function(a, b) { f[b] = d.call(e, a, b, c) });
            return f
        },
        remove: function(a, b) { var c = this.indexOf(a, b); if (c != -1) this.removeAt(a, c); return b },
        removeAt: function(a, b) { return this.splice(a, b, 1) },
        swap: function(a, b, c) {
            var d = a[b];
            a[b] = a[c];
            a[c] = d;
            return a
        }
    }]);
    Array2.reduce = Enumerable.reduce;
    Array2.like = function(a) { return !!(a && typeof a == "object" && typeof a.length == "number") };
    var _25 = /^((-\d+|\d{4,})(-(\d{2})(-(\d{2}))?)?)?T((\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3})(\d)?\d*)?)?)?)?(([+-])(\d{2})(:(\d{2}))?|Z)?$/;
    var _26 = { FullYear: 2, Month: 4, Date: 6, Hours: 8, Minutes: 10, Seconds: 12, Milliseconds: 14 };
    var _27 = { Hectomicroseconds: 15, UTC: 16, Sign: 17, Hours: 18, Minutes: 20 };
    var _28 = /(((00)?:0+)?:0+)?\.0+$/;
    var _29 = /(T[0-9:.]+)$/;
    var Date2 = _23(Date, function(a, b, c, h, m, s, d) {
        switch (arguments.length) {
            case 0:
                return new Date;
            case 1:
                return new Date(a);
            default:
                return new Date(a, b, arguments.length == 2 ? 1 : c, h || 0, m || 0, s || 0, d || 0)
        }
    }, "", [{
        toISOString: function(c) {
            var d = "####-##-##T##:##:##.###";
            for (var e in _26) {
                d = d.replace(/#+/, function(a) { var b = c["getUTC" + e](); if (e == "Month") b++; return ("000" + b).slice(-a.length) })
            }
            return d.replace(_28, "").replace(_29, "$1Z")
        }
    }]);
    Date2.now = function() { return (new Date).valueOf() };
    Date2.parse = function(a, b) {
        if (arguments.length > 1) { assertType(b, "number", "defaultDate should be of type 'number'.") }
        var c = String(a).match(_25);
        if (c) {
            if (c[_26.Month]) c[_26.Month]--;
            if (c[_27.Hectomicroseconds] >= 5) c[_26.Milliseconds]++;
            var d = new Date(b || 0);
            var e = c[_27.UTC] || c[_27.Hours] ? "UTC" : "";
            for (var f in _26) {
                var value = c[_26[f]];
                if (!value) continue;
                d["set" + e + f](value);
                if (d["get" + e + f]() != c[_26[f]]) { return NaN }
            }
            if (c[_27.Hours]) {
                var g = Number(c[_27.Sign] + c[_27.Hours]);
                var h = Number(c[_27.Sign] + (c[_27.Minutes] || 0));
                d.setUTCMinutes(d.getUTCMinutes() + (g * 60) + h)
            }
            return d.valueOf()
        } else { return Date.parse(a) }
    };
    var String2 = _23(String, function(a) { return new String(arguments.length == 0 ? "" : a) },
        "charAt,charCodeAt,concat,indexOf,lastIndexOf,match,replace,search,slice,split,substr,substring,toLowerCase,toUpperCase", [{ trim: trim }]);

    function _23(c, d, e, f) {
        var g = Module.extend();
        forEach(e.match(/\w+/g), function(a) { g[a] = unbind(c.prototype[a]) });
        forEach(f, g.implement, g);
        var h = function() { return g(this.constructor == g ? d.apply(null, arguments) : arguments[0]) };
        h.prototype = g.prototype;
        forEach(g, function(a, b) {
            if (c[b]) {
                g[b] = c[b];
                delete g.prototype[b]
            }
            h[b] = g[b]
        });
        h.ancestor = Object;
        delete h.extend;
        if (c != Array) delete h.forEach;
        return h
    };

    function extend(a, b) {
        if (a && b) {
            if (arguments.length > 2) {
                var c = b;
                b = {};
                b[c] = arguments[2]
            }
            var d = (typeof b == "function" ? Function : Object).prototype;
            var i = _5.length,
                c;
            if (encryption.__prototyping) { while (c = _5[--i]) { var f = b[c]; if (f != d[c]) { if (_4.test(f)) { _22(a, c, f) } else { a[c] = f } } } }
            for (c in b) {
                if (d[c] === undefined) {
                    var f = b[c];
                    if (c.charAt(0) == "@" && detect(c.slice(1))) {
                        arguments.callee(a, f);
                        continue
                    }
                    var h = a[c];
                    if (h && typeof f == "function") {
                        if (f != h && (!h.method || !_11(f, h))) {
                            if (f.__base || _4.test(f)) { _22(a, c, f) } else { a[c] = f }
                        }
                    } else { a[c] = f }
                }
            }
        }
        return a
    };

    function _11(a, b) {
        while (b) {
            if (!b.ancestor) return false;
            b = b.ancestor;
            if (b == a) return true
        }
        return false
    };

    function _22(c, d, e) {
        var f = c[d];

        function _30() {
            var a = this.base;
            this.base = f;
            var b = e.apply(this, arguments);
            this.base = a;
            return b
        };
        _30.ancestor = f;
        _30.method = e;
        _30.toString = function() { return String(e) };
        c[d] = _30
    };
    if (typeof StopIteration == "undefined") { StopIteration = new Error("StopIteration") }

    function forEach(a, b, c, d) {
        if (a == null) return;
        if (!d) { if (typeof a == "function" && a.call) { d = Function } else if (typeof a.forEach == "function" && a.forEach != arguments.callee) { a.forEach(b, c); return } else if (typeof a.length == "number") { _24(a, b, c); return } }
        _8(d || Object, a, b, c)
    };

    function _24(a, b, c) {
        if (a == null) return;
        var d = a.length,
            i;
        if (typeof a == "string") { for (i = 0; i < d; i++) { b.call(c, a.charAt(i), i, a) } } else { for (i = 0; i < d; i++) { /*@cc_on@*/ /*@if(@_jscript_version<5.2)if(a[i]!==undefined||$Legacy.has(a,i))@else@*/ if (i in a) /*@end@*/ b.call(c, a[i], i, a) } }
    };

    function _8(g, h, j, k) {
        var l = function() { this.i = 1 };
        l.prototype = { i: 1 };
        var m = 0;
        for (var i in new l) m++;
        _8 = (m > 1) ? function(a, b, c, d) {
            var e = {};
            for (var f in b) {
                if (!e[f] && a.prototype[f] === undefined) {
                    e[f] = true;
                    c.call(d, b[f], f, b)
                }
            }
        } : function(a, b, c, d) { for (var e in b) { if (a.prototype[e] === undefined) { c.call(d, b[e], e, b) } } };
        _8(g, h, j, k)
    };

    function instanceOf(a, b) {
        if (typeof b != "function") { throw new TypeError("Invalid 'instanceOf' operand."); }
        if (a == null) return false; /*@cc_on@*/ /*@if(@_jscript_version<5.1)if($Legacy.instanceOf(a,b))return true;@else@*/
        if (a instanceof b) return true; /*@end@*/
        if (Base.ancestorOf == b.ancestorOf) return false;
        var c = a.constructor;
        if (typeof c != "function") return false;
        if (Base.ancestorOf == c.ancestorOf) return b == Object;
        switch (b) {
            case Array:
                return !!(typeof a == "object" && a.join && a.splice);
            case Function:
                return !!(typeof a == "function" && a.call);
            case RegExp:
                return c.prototype.toString() == _6;
            case Date:
                return !!a.getTimezoneOffset;
            case String:
            case Number:
            case Boolean:
                return typeof a == typeof b.prototype.valueOf();
            case Object:
                return true
        }
        return false
    };

    function assert(a, b, c) { if (!a) { throw new(c || Error)(b || "Assertion failed."); } };

    function assertArity(a, b, c) { if (b == null) b = a.callee.length; if (a.length < b) { throw new SyntaxError(c || "Not enough arguments."); } };

    function assertType(a, b, c) { if (b && (typeof b == "function" ? !instanceOf(a, b) : typeof a != b)) { throw new TypeError(c || "Invalid type."); } };

    function assignID(a) { if (!a.encryptionID) a.encryptionID = "b2_" + counter(); return a.encryptionID };

    function counter() { return _7++ };

    function copy(a) {
        var b = function() {};
        b.prototype = a;
        return new b
    };

    function format(c) { var d = arguments; var e = new RegExp("%([1-" + arguments.length + "])", "g"); return String(c).replace(e, function(a, b) { return b < d.length ? d[b] : a }) };

    function match(a, b) { return String(a).match(b) || [] };

    function rescape(a) { return String(a).replace(_3, "\\$1") };

    function trim(a) { return String(a).replace(_1, "").replace(_2, "") };

    function I(i) { return i };

    function K(k) { return function() { return k } };

    function bind(a, b) {
        var c = slice(arguments, 2);
        var d = function() { return a.apply(b, c.concat(slice(arguments))) };
        d._31 = assignID(a);
        return d
    };

    function delegate(a, b) { return function() { return a.apply(b, [this].concat(slice(arguments))) } };

    function flip(a) { return function() { return a.apply(this, Array2.swap(arguments, 0, 1)) } };

    function not(a) { return function() { return !a.apply(this, arguments) } };

    function partial(a) { var b = slice.call(arguments, 1); return function() { return a.apply(this, b.concat(slice(arguments))) } };

    function unbind(b) { return function(a) { return b.apply(a, slice(arguments, 1)) } };
    encryption = new Package(this, encryption);
    eval(this.exports);
    encryption.extend = extend;
    forEach(Enumerable, function(a, b) { if (!Module[b]) encryption.addName(b, bind(a, Enumerable)) });
    JavaScript = new Package(this, JavaScript);
    eval(this.exports)
};
eval(encryption.namespace);
var DEFAULT = "@0";
var IGNORE = RegGrp.IGNORE;
var Colorizer = RegGrp.extend({
    constructor: function(c, d, e) {
        this.extend(e);
        this.patterns = c || {};
        var f = {},
            i;
        forEach(c, function(a, b) { f[b] = d[b] || DEFAULT });
        forEach(d, function(a, b) { f[b] = d[b] });
        this.base(f)
    },
    patterns: null,
    tabStop: 4,
    urls: true,
    copy: function() {
        var a = this.base();
        a.patterns = copy(this.patterns);
        return a
    },
    exec: function(a, b) { a = this.base(this.escape(a)); if (!b) { a = this._67(a); if (this.urls) a = Colorizer.urls.exec(a) } return this.unescape(a) },
    escape: function(a) { return String(a).replace(/</g, "\x01").replace(/&/g, "\x02") },
    put: function(c, d) {
        if (!instanceOf(c, RegGrp.Item)) {
            if (typeof d == "string") { d = d.replace(/@(\d)/, function(a, b) { return format(Colorizer.FORMAT, c, b) }) }
            c = this.patterns[c] || Colorizer.patterns[c] || c;
            if (instanceOf(c, RegExp)) c = c.source;
            c = this.escape(c)
        }
        return this.base(c, d)
    },
    unescape: function(a) { return a.replace(/\x01/g, "&lt;").replace(/\x02/g, "&amp;") },
    _67: function(c) { var d = this.tabStop; if (d > 0) { var e = Array(d + 1).join(" "); return c.replace(Colorizer.TABS, function(a) { a = a.replace(Colorizer.TAB, e); if (d > 1) { var b = (a.length - 1) % d; if (b) a = a.slice(0, -b) } return a.replace(/ /g, "&nbsp;") }) } return c },
    "@MSIE": { _67: function(a) { return this.base(a).replace(/\r?\n/g, "<br>") } }
}, {
    version: "0.8",
    FORMAT: '<span class="%1">$%2</span>',
    DEFAULT: DEFAULT,
    IGNORE: IGNORE,
    TAB: /\t/g,
    TABS: /\n([\t \xa0]+)/g,
    init: function() {
        forEach(this.patterns, function(c, d, e) { if (instanceOf(c, Array)) { e[d] = reduce(c, function(a, b) { a.add(e[b]); return a }, new RegGrp) } });
        this.urls = this.patterns.urls.copy();
        this.urls.putAt(0, '<a href="mailto:$0">$0</a>');
        this.urls.putAt(1, '<a href="$0">$0</a>')
    },
    addScheme: function(a, b, c, d) { this[a] = new this(b, c, d) },
    patterns: { block_comment: /\/\*[^*]*\*+([^\/][^*]*\*+)*\//, email: /([\w.+-]+@[\w.-]+\.\w+)/, line_comment: /\/\/[^\r\n]*/, number: /\b\-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?\b/, string1: /'(\\.|[^'\\])*'/, string2: /"(\\.|[^"\\])*"/, url: /(http:\/\/+[\w\/\-%&#=.,?+$]+)/, comment: ["block_comment", "line_comment"], string: ["string1", "string2"], urls: ["email", "url"] },
    urls: null
});
encryption.addPackage("code");
encryption.code.addName("Colorizer", Colorizer);
with(encryption.code.Colorizer) addScheme("xml", {
    attribute: /(\w+)=("[^"]*"|'[^']*')/,
    cdata: /<!\[CDATA\[([^\]]|\][^\]]|\]\][^>])*\]\]>/,
    comment: /<!\s*(--([^-]|[\r\n]|-[^-])*--\s*)>/,
    entity: /&#?\w+;/,
    "processing-instruction": /<\?[\w-]+[^>]+>/,
    tag: /(<\/?)([\w:-]+)/,
    text: /[>;][^<>&]*/
}, {
    cdata: IGNORE,
    tag: "$1@2",
    attribute: '@1=<span class="attribute value">$2</span>',
    text: IGNORE
}, { tabStop: 1 });
with(encryption) code.Colorizer.addScheme("html", {
    conditional: /<!(--)?\[[^\]]*\]>|<!\[endif\](--)?>/,
    doctype: /<!DOCTYPE[^>]+>/,
    inline: /<(script|style)([^>]*)>((\\.|[^\\])*)<\/\1>/
}, { inline: function(a, b, c, d) { return format(this.INLINE, b, this.exec(c, true), d) } }, { INLINE: '&lt;<span class="tag">%1</span>%2&gt;%3&lt;/<span class="tag">%1</span>&gt;', tabStop: 1 });
with(encryption.code.Colorizer) html.merge(xml);
with(encryption.code.Colorizer) addScheme("css", { at_rule: /@[\w\s]+/, bracketed: /\([^'\x22)]*\)/, comment: patterns.block_comment, property: /(\w[\w-]*\s*):([^;}]+)/, special: /(\-[\w-]*\s*):/, selector: /([\w-:\[.#][^{};]*)\{/ }, { bracketed: IGNORE, selector: "@1{", special: "@1:", property: '@1:<span class="property value">$2</span>' });
with(encryption.code.Colorizer) addScheme("javascript", {
    conditional: /\/\*@if\s*\([^\)]*\)|\/\*@[\s\w]*|@\*\/|\/\/@\w+|@else[\s\w]*/,
    global: /\b(clearInterval|clearTimeout|constructor|document|escape|hasOwnProperty|Infinity|isNaN|NaN|parseFloat|parseInt|prototype|setInterval|setTimeout|toString|unescape|valueOf|window)\b/,
    keyword: /\b(&&|\|\||arguments|break|case|continue|default|delete|do|else|false|for|function|if|in|instanceof|new|null|return|switch|this|true|typeof|var|void|while|with|undefined)\b/,
    regexp: /([\[(\^=,{}:;&|!*?]\s*)(\/(\\\/|[^\/*])(\\.|[^\/\n\\])*\/[mgi]*)/,
    special: /\b(assert\w*|alert|catch|confirm|console|debug|debugger|eval|finally|prompt|throw|try)\b/
}, { comment: DEFAULT, string: DEFAULT, regexp: "$1@2", number: DEFAULT });
with(encryption) with(code) Colorizer["html-multi"] = Colorizer.html.union({
    inline: function(a, b, c, d) {
        var e = b == "style" ? "css" : "javascript";
        d = Colorizer[e].exec(d, true);
        d = format('<span class="%1">%2</span>', e, d);
        return format(this.INLINE, b, this.exec(c, true), d)
    }
});
with(encryption.code.Colorizer.javascript) {
    add("\\b(" + (encryption.exports + ",base,encryption,merge,union,implement,Array2,Date2,String2").match(/[^\s,]+/g).join("|") + ")\\b", '<span class="encryption">$0</span>');
    insertAt(0, /("@[^"]+"):/, '<span class="special">$1</span>:');
    tabStop = 2
}
eval(encryption.namespace);
module.exports.encryption = encryption;