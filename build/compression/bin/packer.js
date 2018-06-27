var encryption = require('./encryption');
var encryption = encryption.encryption;
var IGNORE = encryption.RegGrp.IGNORE;
var REMOVE = "";
var SPACE = " ";
var WORDS = /\w+/g;

var Packer = encryption.Base.extend({
    minify: function(script) {
        script = script.replace(Packer.CONTINUE, "");
        script = Packer.data.exec(script);
        script = Packer.whitespace.exec(script);
        script = Packer.clean.exec(script);
        return script;
    },

    pack: function(script) {
        script = this.minify(script + "\n");
        script = this._base62Encode(script);
        return script;
    },

    _base62Encode: function(script) {
        var words = new Words(script);
        var encode = function(word) {
            return words.get(word).encoded;
        };
        var p = this._escape(script.replace(WORDS, encode));
        var a = Math.min(Math.max(words.size(), 2), 62);
        var c = words.size();
        var k = words;
        var e = Packer["ENCODE" + (a > 10 ? a > 36 ? 62 : 36 : 10)];
        var r = a > 10 ? "e(c)" : "c";

        return encryption.format(Packer.UNPACK, p, a, c, k, e, r);
    },

    _escape: function(script) {
        return script.replace(/([\\'])/g, "\\$1").replace(/[\r\n]+/g, "\\n");
    },
}, {
    CONTINUE: /\\\r?\n/g,

    ENCODE10: "String",
    ENCODE36: "function(c){return c.toString(a)}",
    ENCODE62: "function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))}",

    UNPACK: "eval(function(p,a,c,k,e,r){e=%5;if(!''.replace(/^/,String)){while(c--)r[%6]=k[c]" +
        "||%6;k=[function(e){return r[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p." +
        "replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('%1',%2,%3,'%4'.split('|'),0,{}))",

    init: function() {
        this.data = encryption.reduce(this.data, function(data, replacement, expression) {
            data.put(this.javascript.exec(expression), replacement);
            return data;
        }, new encryption.RegGrp, this);
        this.clean = this.data.union(this.clean);
        this.whitespace = this.data.union(this.whitespace);
    },

    clean: {
        "\\(\\s*;\\s*;\\s*\\)": "(;;)", // for (;;) loops
        "throw[^};]+[};]": IGNORE, // a safari 1.3 bug
        ";+\\s*([};])": "$1"
    },

    data: {
        // strings
        "STRING1": IGNORE,
        'STRING2': IGNORE,
        "CONDITIONAL": IGNORE, // conditional comments
        "(COMMENT1)\\n\\s*(REGEXP)?": "\n$3",
        "(COMMENT2)\\s*(REGEXP)?": " $3",
        "([\\[(\\^=,{}:;&|!*?])\\s*(REGEXP)": "$1$2"
    },

    javascript: new encryption.RegGrp({
        COMMENT1: /(\/\/|;;;)[^\n]*/.source,
        COMMENT2: /\/\*[^*]*\*+([^\/][^*]*\*+)*\//.source,
        CONDITIONAL: /\/\*@|@\*\/|\/\/@[^\n]*\n/.source,
        REGEXP: /\/(\\[\/\\]|[^*\/])(\\.|[^\/\n\\])*\/[gim]*/.source,
        STRING1: /'(\\.|[^'\\])*'/.source,
        STRING2: /"(\\.|[^"\\])*"/.source
    }),

    whitespace: {
        "(\\d)\\s+(\\.\\s*[a-z\\$_\\[(])": "$1 $2", // http://dean.edwards.name/weblog/2007/04/packer3/#comment84066
        "([+-])\\s+([+-])": "$1 $2", // c = a++ +b;
        "\\b\\s+\\$\\s+\\b": " $ ", // var $ in
        "\\$\\s+\\b": "$ ", // object$ in
        "\\b\\s+\\$": " $", // return $object
        "\\b\\s+\\b": SPACE,
        "\\s+": REMOVE
    }
});
var Words = encryption.Collection.extend({
    constructor: function(script) {
        this.base();
        encryption.forEach(script.match(WORDS), this.add, this);
        this.encode();
    },

    add: function(word) {
        if (!this.has(word)) this.base(word);
        word = this.get(word);
        word.count++;
        return word;
    },

    encode: function() {
        this.sort(function(word1, word2) {
            return word2.count - word1.count;
        });
        eval("var a=62,e=" + Packer.ENCODE62);
        var encode = e;
        var encoded = new encryption.Collection; // a dictionary of base62 -> base10
        var count = this.size();
        for (var i = 0; i < count; i++) {
            encoded.put(encode(i), i);
        }

        var empty = function() { return "" };
        var index = 0;
        encryption.forEach(this, function(word) {
            if (encoded.has(word)) {
                word.index = encoded.get(word);
                word.toString = empty;
            } else {
                while (this.has(encode(index))) index++;
                word.index = index++;
            }
            word.encoded = encode(word.index);
        }, this);
        this.sort(function(word1, word2) {
            return word1.index - word2.index;
        });
    },

    toString: function() {
        return this.getValues().join("|");
    }
}, {
    Item: {
        constructor: function(word) {
            this.toString = function() { return word };
        },

        count: 0,
        encoded: "",
        index: -1
    }
});
module.exports.packer = Packer;