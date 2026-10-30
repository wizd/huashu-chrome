// 由 scripts/build-loads.mjs 生成，不要手改。上游：https://github.com/zhoushoujianwork/easyeda-agent.git @ 7a73a6834d8d76fd9765dd06f9d4e4bdd6b0556a（MIT AND Apache-2.0）
// 跑在上游代码之前（esbuild banner）。网页编辑器里没有扩展运行时，补上它给的全局变量：
// eda 就是页面上的 _EXTAPI_ROOT_；E*_ / I*_ 枚举挂在内置扩展的脚本空间里，搬到 window 上。
// 缺了枚举，上游有些 action 会报「EDMT_EditorDocumentType is not defined」。
(function () {
  var w = window;
  if (w._EXTAPI_ROOT_ && typeof w.eda === 'undefined') w.eda = w._EXTAPI_ROOT_;
  var spaces = w._EXTAPI_SCRIPT_SPACES_ || {};
  var sp = Object.values(spaces).find(function (s) { return s && s.EDMT_EditorDocumentType; });
  if (!sp) return;
  Object.getOwnPropertyNames(sp).forEach(function (k) {
    if (/^[EI][A-Z]+_/.test(k) && !(k in w)) w[k] = sp[k];
  });
})();

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // <define:__LOAD_ACTIONS__>
  var define_LOAD_ACTIONS_default;
  var init_define_LOAD_ACTIONS = __esm({
    "<define:__LOAD_ACTIONS__>"() {
      define_LOAD_ACTIONS_default = ["project.current", "project.find", "document.current", "document.source.get", "document.open", "document.close", "editor.panels", "view.fit", "view.zoom", "view.region", "board.list", "board.current", "schematic.pages.list", "schematic.page.open", "schematic.titleblock.get", "schematic.components.list", "schematic.attribute.inspect", "schematic.designators.list", "schematic.image.list", "schematic.text.list", "schematic.visible_text.bboxes", "schematic.read", "schematic.drc.check", "schematic.check", "schematic.bridgeCheck", "schematic.export.netlist", "schematic.export.image", "schematic.export.bom", "schematic.library.search", "schematic.library.get_by_lcsc", "library.list", "library.common.list", "library.footprint.get", "library.symbol.get", "library.symbol.export_source", "library.device.get", "pcb.documents.list", "pcb.board.info", "pcb.components.list", "pcb.layers.list", "pcb.layers.set_current", "pcb.layers.visibility", "pcb.view.side", "pcb.view.filter.get", "pcb.silk.list", "pcb.image.list", "pcb.nets.list", "pcb.net_class.list", "pcb.constraint.list", "pcb.report", "pcb.drc.check", "pcb.drc.rules", "pcb.config.get", "pcb.line.list", "pcb.via.list", "pcb.pour.list", "pcb.poured.list", "pcb.region.list", "pcb.fill.list", "pcb.outline.get", "pcb.origin.get", "pcb.snapshot", "pcb.export.dsn", "project.create", "project.open", "board.create", "board.new", "board.new_pcb", "board.rename", "board.copy", "board.rebind", "schematic.rename", "schematic.page.create", "schematic.page.rename", "schematic.titleblock.modify", "schematic.component.place", "schematic.component.modify", "schematic.component.delete", "schematic.component.replace", "schematic.component.resolve_lcsc", "schematic.rebind.footprint", "schematic.rebind.symbol", "schematic.attribute.move", "schematic.text.move", "schematic.group.move", "schematic.primitives.delete", "schematic.wire.create", "schematic.netflag.create", "schematic.power.connect_pin", "schematic.pin.set_no_connect", "schematic.pin.disconnect", "schematic.image.create", "schematic.image.modify", "schematic.save", "library.footprint.create", "library.footprint.copy", "library.footprint.build", "library.footprint.region_create", "library.symbol.create", "library.symbol.build", "library.device.create", "pcb.import_changes", "pcb.add_component", "pcb.component.attrs_backfill", "pcb.component.modify", "pcb.component.lock", "pcb.component.delete", "pcb.components.move", "pcb.components.arrange", "pcb.align", "pcb.distribute", "pcb.grid_snap", "pcb.stackup.set", "pcb.drc.rules.set", "pcb.config.set", "pcb.net.color.set", "pcb.net_class.create", "pcb.differential_pair.create", "pcb.differential_pair.delete", "pcb.differential_pair.rename", "pcb.equal_length_group.create", "pcb.equal_length_group.add_nets", "pcb.equal_length_group.delete", "pcb.outline.set", "pcb.outline.clear", "pcb.origin.set", "pcb.line.create", "pcb.via.create", "pcb.route.rip_up", "pcb.route.delete", "pcb.route.via_hop", "pcb.track.lock", "pcb.clear_routing", "pcb.route.auto", "pcb.import_autoroute", "pcb.pour.create", "pcb.pour.delete", "pcb.pour.rebuild", "pcb.region.create", "pcb.region.delete", "pcb.fill.create", "pcb.fill.delete", "pcb.silk.add", "pcb.silk.set", "pcb.silk.align", "pcb.silk.netnames", "pcb.silk.label_pads", "pcb.silk.import_svg", "pcb.image.create", "pcb.image.modify", "pcb.image.delete", "pcb.beautify", "pcb.save"];
    }
  });

  // node_modules/jszip/dist/jszip.min.js
  var require_jszip_min = __commonJS({
    "node_modules/jszip/dist/jszip.min.js"(exports, module) {
      init_define_LOAD_ACTIONS();
      /*!
      
      JSZip v3.10.1 - A JavaScript class for generating and reading zip files
      <http://stuartk.com/jszip>
      
      (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
      Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.
      
      JSZip uses the library pako released under the MIT license :
      https://github.com/nodeca/pako/blob/main/LICENSE
      */
      !function(e) {
        if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
        else if ("function" == typeof define && define.amd) define([], e);
        else {
          ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
        }
      }(function() {
        return function s(a, o, h) {
          function u(r, e2) {
            if (!o[r]) {
              if (!a[r]) {
                var t = "function" == typeof __require && __require;
                if (!e2 && t) return t(r, true);
                if (l) return l(r, true);
                var n = new Error("Cannot find module '" + r + "'");
                throw n.code = "MODULE_NOT_FOUND", n;
              }
              var i = o[r] = { exports: {} };
              a[r][0].call(i.exports, function(e3) {
                var t2 = a[r][1][e3];
                return u(t2 || e3);
              }, i, i.exports, s, a, o, h);
            }
            return o[r].exports;
          }
          for (var l = "function" == typeof __require && __require, e = 0; e < h.length; e++) u(h[e]);
          return u;
        }({ 1: [function(e, t, r) {
          "use strict";
          var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
          r.encode = function(e2) {
            for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
            return h.join("");
          }, r.decode = function(e2) {
            var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
            if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
            var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
            if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
            for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
            return l;
          };
        }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
          "use strict";
          var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
          function o(e2, t2, r2, n2, i2) {
            this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
          }
          o.prototype = { getContentWorker: function() {
            var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
            return e2.on("end", function() {
              if (this.streamInfo.data_length !== t2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
            }), e2;
          }, getCompressedWorker: function() {
            return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
          } }, o.createWorkerFrom = function(e2, t2, r2) {
            return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
          }, t.exports = o;
        }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
          "use strict";
          var n = e("./stream/GenericWorker");
          r.STORE = { magic: "\0\0", compressWorker: function() {
            return new n("STORE compression");
          }, uncompressWorker: function() {
            return new n("STORE decompression");
          } }, r.DEFLATE = e("./flate");
        }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
          "use strict";
          var n = e("./utils");
          var o = function() {
            for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
              e2 = r2;
              for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
              t2[r2] = e2;
            }
            return t2;
          }();
          t.exports = function(e2, t2) {
            return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? function(e3, t3, r2, n2) {
              var i = o, s = n2 + r2;
              e3 ^= -1;
              for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
              return -1 ^ e3;
            }(0 | t2, e2, e2.length, 0) : function(e3, t3, r2, n2) {
              var i = o, s = n2 + r2;
              e3 ^= -1;
              for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
              return -1 ^ e3;
            }(0 | t2, e2, e2.length, 0) : 0;
          };
        }, { "./utils": 32 }], 5: [function(e, t, r) {
          "use strict";
          r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
        }, {}], 6: [function(e, t, r) {
          "use strict";
          var n = null;
          n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
        }, { lie: 37 }], 7: [function(e, t, r) {
          "use strict";
          var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
          function h(e2, t2) {
            a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
          }
          r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
            this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
          }, h.prototype.flush = function() {
            a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
          }, h.prototype.cleanUp = function() {
            a.prototype.cleanUp.call(this), this._pako = null;
          }, h.prototype._createPako = function() {
            this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
            var t2 = this;
            this._pako.onData = function(e2) {
              t2.push({ data: e2, meta: t2.meta });
            };
          }, r.compressWorker = function(e2) {
            return new h("Deflate", e2);
          }, r.uncompressWorker = function() {
            return new h("Inflate", {});
          };
        }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
          "use strict";
          function A(e2, t2) {
            var r2, n2 = "";
            for (r2 = 0; r2 < t2; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
            return n2;
          }
          function n(e2, t2, r2, n2, i2, s2) {
            var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
            t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
            var S = 0;
            t2 && (S |= 8), l || !_ && !g || (S |= 2048);
            var z = 0, C = 0;
            w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= function(e3, t3) {
              var r3 = e3;
              return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
            }(h.unixPermissions, w)) : (C = 20, z |= function(e3) {
              return 63 & (e3 || 0);
            }(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
            var E = "";
            return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
          }
          var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
          function s(e2, t2, r2, n2) {
            i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
          }
          I.inherits(s, i), s.prototype.push = function(e2) {
            var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
            this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
          }, s.prototype.openedSource = function(e2) {
            this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
            var t2 = this.streamFiles && !e2.file.dir;
            if (t2) {
              var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
              this.push({ data: r2.fileRecord, meta: { percent: 0 } });
            } else this.accumulate = true;
          }, s.prototype.closedSource = function(e2) {
            this.accumulate = false;
            var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            if (this.dirRecords.push(r2.dirRecord), t2) this.push({ data: function(e3) {
              return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
            }(e2), meta: { percent: 100 } });
            else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
            this.currentFile = null;
          }, s.prototype.flush = function() {
            for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++) this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
            var r2 = this.bytesWritten - e2, n2 = function(e3, t3, r3, n3, i2) {
              var s2 = I.transformTo("string", i2(n3));
              return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
            }(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
            this.push({ data: n2, meta: { percent: 100 } });
          }, s.prototype.prepareNextSource = function() {
            this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
          }, s.prototype.registerPrevious = function(e2) {
            this._sources.push(e2);
            var t2 = this;
            return e2.on("data", function(e3) {
              t2.processChunk(e3);
            }), e2.on("end", function() {
              t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
            }), e2.on("error", function(e3) {
              t2.error(e3);
            }), this;
          }, s.prototype.resume = function() {
            return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
          }, s.prototype.error = function(e2) {
            var t2 = this._sources;
            if (!i.prototype.error.call(this, e2)) return false;
            for (var r2 = 0; r2 < t2.length; r2++) try {
              t2[r2].error(e2);
            } catch (e3) {
            }
            return true;
          }, s.prototype.lock = function() {
            i.prototype.lock.call(this);
            for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++) e2[t2].lock();
          }, t.exports = s;
        }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
          "use strict";
          var u = e("../compressions"), n = e("./ZipFileWorker");
          r.generateWorker = function(e2, a, t2) {
            var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
            try {
              e2.forEach(function(e3, t3) {
                h++;
                var r2 = function(e4, t4) {
                  var r3 = e4 || t4, n3 = u[r3];
                  if (!n3) throw new Error(r3 + " is not a valid compression method !");
                  return n3;
                }(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
                t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
              }), o.entriesCount = h;
            } catch (e3) {
              o.error(e3);
            }
            return o;
          };
        }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
          "use strict";
          function n() {
            if (!(this instanceof n)) return new n();
            if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
            this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
              var e2 = new n();
              for (var t2 in this) "function" != typeof this[t2] && (e2[t2] = this[t2]);
              return e2;
            };
          }
          (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
            return new n().loadAsync(e2, t2);
          }, n.external = e("./external"), t.exports = n;
        }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
          "use strict";
          var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
          function f(n2) {
            return new i.Promise(function(e2, t2) {
              var r2 = n2.decompressed.getContentWorker().pipe(new a());
              r2.on("error", function(e3) {
                t2(e3);
              }).on("end", function() {
                r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
              }).resume();
            });
          }
          t.exports = function(e2, o) {
            var h = this;
            return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
              var t2 = new s(o);
              return t2.load(e3), t2;
            }).then(function(e3) {
              var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
              if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t2.push(f(r2[n2]));
              return i.Promise.all(t2);
            }).then(function(e3) {
              for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
                var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
                h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
              }
              return t2.zipComment.length && (h.comment = t2.zipComment), h;
            });
          };
        }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
          "use strict";
          var n = e("../utils"), i = e("../stream/GenericWorker");
          function s(e2, t2) {
            i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
          }
          n.inherits(s, i), s.prototype._bindStream = function(e2) {
            var t2 = this;
            (this._stream = e2).pause(), e2.on("data", function(e3) {
              t2.push({ data: e3, meta: { percent: 0 } });
            }).on("error", function(e3) {
              t2.isPaused ? this.generatedError = e3 : t2.error(e3);
            }).on("end", function() {
              t2.isPaused ? t2._upstreamEnded = true : t2.end();
            });
          }, s.prototype.pause = function() {
            return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
          }, s.prototype.resume = function() {
            return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
          }, t.exports = s;
        }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
          "use strict";
          var i = e("readable-stream").Readable;
          function n(e2, t2, r2) {
            i.call(this, t2), this._helper = e2;
            var n2 = this;
            e2.on("data", function(e3, t3) {
              n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
            }).on("error", function(e3) {
              n2.emit("error", e3);
            }).on("end", function() {
              n2.push(null);
            });
          }
          e("../utils").inherits(n, i), n.prototype._read = function() {
            this._helper.resume();
          }, t.exports = n;
        }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
          "use strict";
          t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
            if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t2);
            if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
            return new Buffer(e2, t2);
          }, allocBuffer: function(e2) {
            if (Buffer.alloc) return Buffer.alloc(e2);
            var t2 = new Buffer(e2);
            return t2.fill(0), t2;
          }, isBuffer: function(e2) {
            return Buffer.isBuffer(e2);
          }, isStream: function(e2) {
            return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
          } };
        }, {}], 15: [function(e, t, r) {
          "use strict";
          function s(e2, t2, r2) {
            var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
            s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
            var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
            r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
            var o2 = null;
            o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
            var h2 = new d(e2, o2, s2);
            this.files[e2] = h2;
          }
          var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
            "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
            var t2 = e2.lastIndexOf("/");
            return 0 < t2 ? e2.substring(0, t2) : "";
          }, g = function(e2) {
            return "/" !== e2.slice(-1) && (e2 += "/"), e2;
          }, b = function(e2, t2) {
            return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
          };
          function h(e2) {
            return "[object RegExp]" === Object.prototype.toString.call(e2);
          }
          var n = { load: function() {
            throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
          }, forEach: function(e2) {
            var t2, r2, n2;
            for (t2 in this.files) n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
          }, filter: function(r2) {
            var n2 = [];
            return this.forEach(function(e2, t2) {
              r2(e2, t2) && n2.push(t2);
            }), n2;
          }, file: function(e2, t2, r2) {
            if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
            if (h(e2)) {
              var n2 = e2;
              return this.filter(function(e3, t3) {
                return !t3.dir && n2.test(e3);
              });
            }
            var i2 = this.files[this.root + e2];
            return i2 && !i2.dir ? i2 : null;
          }, folder: function(r2) {
            if (!r2) return this;
            if (h(r2)) return this.filter(function(e3, t3) {
              return t3.dir && r2.test(e3);
            });
            var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
            return n2.root = t2.name, n2;
          }, remove: function(r2) {
            r2 = this.root + r2;
            var e2 = this.files[r2];
            if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
            else for (var t2 = this.filter(function(e3, t3) {
              return t3.name.slice(0, r2.length) === r2;
            }), n2 = 0; n2 < t2.length; n2++) delete this.files[t2[n2].name];
            return this;
          }, generate: function() {
            throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
          }, generateInternalStream: function(e2) {
            var t2, r2 = {};
            try {
              if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
              u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
              var n2 = r2.comment || this.comment || "";
              t2 = o.generateWorker(this, r2, n2);
            } catch (e3) {
              (t2 = new l("error")).error(e3);
            }
            return new a(t2, r2.type || "string", r2.mimeType);
          }, generateAsync: function(e2, t2) {
            return this.generateInternalStream(e2).accumulate(t2);
          }, generateNodeStream: function(e2, t2) {
            return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
          } };
          t.exports = n;
        }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
          "use strict";
          t.exports = e("stream");
        }, { stream: void 0 }], 17: [function(e, t, r) {
          "use strict";
          var n = e("./DataReader");
          function i(e2) {
            n.call(this, e2);
            for (var t2 = 0; t2 < this.data.length; t2++) e2[t2] = 255 & e2[t2];
          }
          e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
            return this.data[this.zero + e2];
          }, i.prototype.lastIndexOfSignature = function(e2) {
            for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
            return -1;
          }, i.prototype.readAndCheckSignature = function(e2) {
            var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
            return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
          }, i.prototype.readData = function(e2) {
            if (this.checkOffset(e2), 0 === e2) return [];
            var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
            return this.index += e2, t2;
          }, t.exports = i;
        }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
          "use strict";
          var n = e("../utils");
          function i(e2) {
            this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
          }
          i.prototype = { checkOffset: function(e2) {
            this.checkIndex(this.index + e2);
          }, checkIndex: function(e2) {
            if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
          }, setIndex: function(e2) {
            this.checkIndex(e2), this.index = e2;
          }, skip: function(e2) {
            this.setIndex(this.index + e2);
          }, byteAt: function() {
          }, readInt: function(e2) {
            var t2, r2 = 0;
            for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--) r2 = (r2 << 8) + this.byteAt(t2);
            return this.index += e2, r2;
          }, readString: function(e2) {
            return n.transformTo("string", this.readData(e2));
          }, readData: function() {
          }, lastIndexOfSignature: function() {
          }, readAndCheckSignature: function() {
          }, readDate: function() {
            var e2 = this.readInt(4);
            return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
          } }, t.exports = i;
        }, { "../utils": 32 }], 19: [function(e, t, r) {
          "use strict";
          var n = e("./Uint8ArrayReader");
          function i(e2) {
            n.call(this, e2);
          }
          e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
            this.checkOffset(e2);
            var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
            return this.index += e2, t2;
          }, t.exports = i;
        }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
          "use strict";
          var n = e("./DataReader");
          function i(e2) {
            n.call(this, e2);
          }
          e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
            return this.data.charCodeAt(this.zero + e2);
          }, i.prototype.lastIndexOfSignature = function(e2) {
            return this.data.lastIndexOf(e2) - this.zero;
          }, i.prototype.readAndCheckSignature = function(e2) {
            return e2 === this.readData(4);
          }, i.prototype.readData = function(e2) {
            this.checkOffset(e2);
            var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
            return this.index += e2, t2;
          }, t.exports = i;
        }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
          "use strict";
          var n = e("./ArrayReader");
          function i(e2) {
            n.call(this, e2);
          }
          e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
            if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
            var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
            return this.index += e2, t2;
          }, t.exports = i;
        }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
          "use strict";
          var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
          t.exports = function(e2) {
            var t2 = n.getTypeOf(e2);
            return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
          };
        }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
          "use strict";
          r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
        }, {}], 24: [function(e, t, r) {
          "use strict";
          var n = e("./GenericWorker"), i = e("../utils");
          function s(e2) {
            n.call(this, "ConvertWorker to " + e2), this.destType = e2;
          }
          i.inherits(s, n), s.prototype.processChunk = function(e2) {
            this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
          }, t.exports = s;
        }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
          "use strict";
          var n = e("./GenericWorker"), i = e("../crc32");
          function s() {
            n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
          }
          e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
            this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
          }, t.exports = s;
        }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
          "use strict";
          var n = e("../utils"), i = e("./GenericWorker");
          function s(e2) {
            i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
          }
          n.inherits(s, i), s.prototype.processChunk = function(e2) {
            if (e2) {
              var t2 = this.streamInfo[this.propName] || 0;
              this.streamInfo[this.propName] = t2 + e2.data.length;
            }
            i.prototype.processChunk.call(this, e2);
          }, t.exports = s;
        }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
          "use strict";
          var n = e("../utils"), i = e("./GenericWorker");
          function s(e2) {
            i.call(this, "DataWorker");
            var t2 = this;
            this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
              t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
            }, function(e3) {
              t2.error(e3);
            });
          }
          n.inherits(s, i), s.prototype.cleanUp = function() {
            i.prototype.cleanUp.call(this), this.data = null;
          }, s.prototype.resume = function() {
            return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
          }, s.prototype._tickAndRepeat = function() {
            this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
          }, s.prototype._tick = function() {
            if (this.isPaused || this.isFinished) return false;
            var e2 = null, t2 = Math.min(this.max, this.index + 16384);
            if (this.index >= this.max) return this.end();
            switch (this.type) {
              case "string":
                e2 = this.data.substring(this.index, t2);
                break;
              case "uint8array":
                e2 = this.data.subarray(this.index, t2);
                break;
              case "array":
              case "nodebuffer":
                e2 = this.data.slice(this.index, t2);
            }
            return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
          }, t.exports = s;
        }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
          "use strict";
          function n(e2) {
            this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
          }
          n.prototype = { push: function(e2) {
            this.emit("data", e2);
          }, end: function() {
            if (this.isFinished) return false;
            this.flush();
            try {
              this.emit("end"), this.cleanUp(), this.isFinished = true;
            } catch (e2) {
              this.emit("error", e2);
            }
            return true;
          }, error: function(e2) {
            return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
          }, on: function(e2, t2) {
            return this._listeners[e2].push(t2), this;
          }, cleanUp: function() {
            this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
          }, emit: function(e2, t2) {
            if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t2);
          }, pipe: function(e2) {
            return e2.registerPrevious(this);
          }, registerPrevious: function(e2) {
            if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
            this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
            var t2 = this;
            return e2.on("data", function(e3) {
              t2.processChunk(e3);
            }), e2.on("end", function() {
              t2.end();
            }), e2.on("error", function(e3) {
              t2.error(e3);
            }), this;
          }, pause: function() {
            return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
          }, resume: function() {
            if (!this.isPaused || this.isFinished) return false;
            var e2 = this.isPaused = false;
            return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
          }, flush: function() {
          }, processChunk: function(e2) {
            this.push(e2);
          }, withStreamInfo: function(e2, t2) {
            return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
          }, mergeStreamInfo: function() {
            for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
          }, lock: function() {
            if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
            this.isLocked = true, this.previous && this.previous.lock();
          }, toString: function() {
            var e2 = "Worker " + this.name;
            return this.previous ? this.previous + " -> " + e2 : e2;
          } }, t.exports = n;
        }, {}], 29: [function(e, t, r) {
          "use strict";
          var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
          if (n.nodestream) try {
            o = e("../nodejs/NodejsStreamOutputAdapter");
          } catch (e2) {
          }
          function l(e2, o2) {
            return new a.Promise(function(t2, r2) {
              var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
              e2.on("data", function(e3, t3) {
                n2.push(e3), o2 && o2(t3);
              }).on("error", function(e3) {
                n2 = [], r2(e3);
              }).on("end", function() {
                try {
                  var e3 = function(e4, t3, r3) {
                    switch (e4) {
                      case "blob":
                        return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                      case "base64":
                        return u.encode(t3);
                      default:
                        return h.transformTo(e4, t3);
                    }
                  }(s2, function(e4, t3) {
                    var r3, n3 = 0, i3 = null, s3 = 0;
                    for (r3 = 0; r3 < t3.length; r3++) s3 += t3[r3].length;
                    switch (e4) {
                      case "string":
                        return t3.join("");
                      case "array":
                        return Array.prototype.concat.apply([], t3);
                      case "uint8array":
                        for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++) i3.set(t3[r3], n3), n3 += t3[r3].length;
                        return i3;
                      case "nodebuffer":
                        return Buffer.concat(t3);
                      default:
                        throw new Error("concat : unsupported type '" + e4 + "'");
                    }
                  }(i2, n2), a2);
                  t2(e3);
                } catch (e4) {
                  r2(e4);
                }
                n2 = [];
              }).resume();
            });
          }
          function f(e2, t2, r2) {
            var n2 = t2;
            switch (t2) {
              case "blob":
              case "arraybuffer":
                n2 = "uint8array";
                break;
              case "base64":
                n2 = "string";
            }
            try {
              this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
            } catch (e3) {
              this._worker = new s("error"), this._worker.error(e3);
            }
          }
          f.prototype = { accumulate: function(e2) {
            return l(this, e2);
          }, on: function(e2, t2) {
            var r2 = this;
            return "data" === e2 ? this._worker.on(e2, function(e3) {
              t2.call(r2, e3.data, e3.meta);
            }) : this._worker.on(e2, function() {
              h.delay(t2, arguments, r2);
            }), this;
          }, resume: function() {
            return h.delay(this._worker.resume, [], this._worker), this;
          }, pause: function() {
            return this._worker.pause(), this;
          }, toNodejsStream: function(e2) {
            if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
            return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
          } }, t.exports = f;
        }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
          "use strict";
          if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
          else {
            var n = new ArrayBuffer(0);
            try {
              r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
            } catch (e2) {
              try {
                var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
              } catch (e3) {
                r.blob = false;
              }
            }
          }
          try {
            r.nodestream = !!e("readable-stream").Readable;
          } catch (e2) {
            r.nodestream = false;
          }
        }, { "readable-stream": 16 }], 31: [function(e, t, s) {
          "use strict";
          for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
          u[254] = u[254] = 1;
          function a() {
            n.call(this, "utf-8 decode"), this.leftOver = null;
          }
          function l() {
            n.call(this, "utf-8 encode");
          }
          s.utf8encode = function(e2) {
            return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : function(e3) {
              var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
              for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
              for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
              return t2;
            }(e2);
          }, s.utf8decode = function(e2) {
            return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : function(e3) {
              var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
              for (t2 = r2 = 0; t2 < s2; ) if ((n2 = e3[t2++]) < 128) a2[r2++] = n2;
              else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t2 += i2 - 1;
              else {
                for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; ) n2 = n2 << 6 | 63 & e3[t2++], i2--;
                1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
              }
              return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
            }(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
          }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
            var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
            if (this.leftOver && this.leftOver.length) {
              if (h.uint8array) {
                var r2 = t2;
                (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
              } else t2 = this.leftOver.concat(t2);
              this.leftOver = null;
            }
            var n2 = function(e3, t3) {
              var r3;
              for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
              return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
            }(t2), i2 = t2;
            n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
          }, a.prototype.flush = function() {
            this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
          }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
            this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
          }, s.Utf8EncodeWorker = l;
        }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
          "use strict";
          var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
          function n(e2) {
            return e2;
          }
          function l(e2, t2) {
            for (var r2 = 0; r2 < e2.length; ++r2) t2[r2] = 255 & e2.charCodeAt(r2);
            return t2;
          }
          e("setimmediate"), a.newBlob = function(t2, r2) {
            a.checkSupport("blob");
            try {
              return new Blob([t2], { type: r2 });
            } catch (e2) {
              try {
                var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                return n2.append(t2), n2.getBlob(r2);
              } catch (e3) {
                throw new Error("Bug : can't construct the Blob.");
              }
            }
          };
          var i = { stringifyByChunk: function(e2, t2, r2) {
            var n2 = [], i2 = 0, s2 = e2.length;
            if (s2 <= r2) return String.fromCharCode.apply(null, e2);
            for (; i2 < s2; ) "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
            return n2.join("");
          }, stringifyByChar: function(e2) {
            for (var t2 = "", r2 = 0; r2 < e2.length; r2++) t2 += String.fromCharCode(e2[r2]);
            return t2;
          }, applyCanBeUsed: { uint8array: function() {
            try {
              return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
            } catch (e2) {
              return false;
            }
          }(), nodebuffer: function() {
            try {
              return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
            } catch (e2) {
              return false;
            }
          }() } };
          function s(e2) {
            var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
            if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t2; ) try {
              return i.stringifyByChunk(e2, r2, t2);
            } catch (e3) {
              t2 = Math.floor(t2 / 2);
            }
            return i.stringifyByChar(e2);
          }
          function f(e2, t2) {
            for (var r2 = 0; r2 < e2.length; r2++) t2[r2] = e2[r2];
            return t2;
          }
          a.applyFromCharCode = s;
          var c = {};
          c.string = { string: n, array: function(e2) {
            return l(e2, new Array(e2.length));
          }, arraybuffer: function(e2) {
            return c.string.uint8array(e2).buffer;
          }, uint8array: function(e2) {
            return l(e2, new Uint8Array(e2.length));
          }, nodebuffer: function(e2) {
            return l(e2, r.allocBuffer(e2.length));
          } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
            return new Uint8Array(e2).buffer;
          }, uint8array: function(e2) {
            return new Uint8Array(e2);
          }, nodebuffer: function(e2) {
            return r.newBufferFrom(e2);
          } }, c.arraybuffer = { string: function(e2) {
            return s(new Uint8Array(e2));
          }, array: function(e2) {
            return f(new Uint8Array(e2), new Array(e2.byteLength));
          }, arraybuffer: n, uint8array: function(e2) {
            return new Uint8Array(e2);
          }, nodebuffer: function(e2) {
            return r.newBufferFrom(new Uint8Array(e2));
          } }, c.uint8array = { string: s, array: function(e2) {
            return f(e2, new Array(e2.length));
          }, arraybuffer: function(e2) {
            return e2.buffer;
          }, uint8array: n, nodebuffer: function(e2) {
            return r.newBufferFrom(e2);
          } }, c.nodebuffer = { string: s, array: function(e2) {
            return f(e2, new Array(e2.length));
          }, arraybuffer: function(e2) {
            return c.nodebuffer.uint8array(e2).buffer;
          }, uint8array: function(e2) {
            return f(e2, new Uint8Array(e2.length));
          }, nodebuffer: n }, a.transformTo = function(e2, t2) {
            if (t2 = t2 || "", !e2) return t2;
            a.checkSupport(e2);
            var r2 = a.getTypeOf(t2);
            return c[r2][e2](t2);
          }, a.resolve = function(e2) {
            for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
              var i2 = t2[n2];
              "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
            }
            return r2.join("/");
          }, a.getTypeOf = function(e2) {
            return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
          }, a.checkSupport = function(e2) {
            if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
          }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
            var t2, r2, n2 = "";
            for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
            return n2;
          }, a.delay = function(e2, t2, r2) {
            setImmediate(function() {
              e2.apply(r2 || null, t2 || []);
            });
          }, a.inherits = function(e2, t2) {
            function r2() {
            }
            r2.prototype = t2.prototype, e2.prototype = new r2();
          }, a.extend = function() {
            var e2, t2, r2 = {};
            for (e2 = 0; e2 < arguments.length; e2++) for (t2 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
            return r2;
          }, a.prepareContent = function(r2, e2, n2, i2, s2) {
            return u.Promise.resolve(e2).then(function(n3) {
              return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
                var e3 = new FileReader();
                e3.onload = function(e4) {
                  t2(e4.target.result);
                }, e3.onerror = function(e4) {
                  r3(e4.target.error);
                }, e3.readAsArrayBuffer(n3);
              }) : n3;
            }).then(function(e3) {
              var t2 = a.getTypeOf(e3);
              return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = function(e4) {
                return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
              }(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
            });
          };
        }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
          "use strict";
          var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
          function h(e2) {
            this.files = [], this.loadOptions = e2;
          }
          h.prototype = { checkSignature: function(e2) {
            if (!this.reader.readAndCheckSignature(e2)) {
              this.reader.index -= 4;
              var t2 = this.reader.readString(4);
              throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
            }
          }, isSignature: function(e2, t2) {
            var r2 = this.reader.index;
            this.reader.setIndex(e2);
            var n2 = this.reader.readString(4) === t2;
            return this.reader.setIndex(r2), n2;
          }, readBlockEndOfCentral: function() {
            this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
            var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
            this.zipComment = this.loadOptions.decodeFileName(r2);
          }, readBlockZip64EndOfCentral: function() {
            this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
            for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
          }, readBlockZip64EndOfCentralLocator: function() {
            if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
          }, readLocalFiles: function() {
            var e2, t2;
            for (e2 = 0; e2 < this.files.length; e2++) t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
          }, readCentralDir: function() {
            var e2;
            for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
            if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
          }, readEndOfCentral: function() {
            var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
            if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
            this.reader.setIndex(e2);
            var t2 = e2;
            if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
              if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
              if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
              this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
            }
            var r2 = this.centralDirOffset + this.centralDirSize;
            this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
            var n2 = t2 - r2;
            if (0 < n2) this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
            else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
          }, prepareReader: function(e2) {
            this.reader = n(e2);
          }, load: function(e2) {
            this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
          } }, t.exports = h;
        }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
          "use strict";
          var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
          function l(e2, t2) {
            this.options = e2, this.loadOptions = t2;
          }
          l.prototype = { isEncrypted: function() {
            return 1 == (1 & this.bitFlag);
          }, useUTF8: function() {
            return 2048 == (2048 & this.bitFlag);
          }, readLocalPart: function(e2) {
            var t2, r2;
            if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
            if (null === (t2 = function(e3) {
              for (var t3 in h) if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3) return h[t3];
              return null;
            }(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
            this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
          }, readCentralPart: function(e2) {
            this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
            var t2 = e2.readInt(2);
            if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
            e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
          }, processAttributes: function() {
            this.unixPermissions = null, this.dosPermissions = null;
            var e2 = this.versionMadeBy >> 8;
            this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
          }, parseZIP64ExtraField: function() {
            if (this.extraFields[1]) {
              var e2 = n(this.extraFields[1].value);
              this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
            }
          }, readExtraFields: function(e2) {
            var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
            for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
            e2.setIndex(i2);
          }, handleUTF8: function() {
            var e2 = u.uint8array ? "uint8array" : "array";
            if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
            else {
              var t2 = this.findExtraFieldUnicodePath();
              if (null !== t2) this.fileNameStr = t2;
              else {
                var r2 = s.transformTo(e2, this.fileName);
                this.fileNameStr = this.loadOptions.decodeFileName(r2);
              }
              var n2 = this.findExtraFieldUnicodeComment();
              if (null !== n2) this.fileCommentStr = n2;
              else {
                var i2 = s.transformTo(e2, this.fileComment);
                this.fileCommentStr = this.loadOptions.decodeFileName(i2);
              }
            }
          }, findExtraFieldUnicodePath: function() {
            var e2 = this.extraFields[28789];
            if (e2) {
              var t2 = n(e2.value);
              return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
            }
            return null;
          }, findExtraFieldUnicodeComment: function() {
            var e2 = this.extraFields[25461];
            if (e2) {
              var t2 = n(e2.value);
              return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
            }
            return null;
          } }, t.exports = l;
        }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
          "use strict";
          function n(e2, t2, r2) {
            this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
          }
          var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
          n.prototype = { internalStream: function(e2) {
            var t2 = null, r2 = "string";
            try {
              if (!e2) throw new Error("No output type specified.");
              var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
              "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
              var i2 = !this._dataBinary;
              i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
            } catch (e3) {
              (t2 = new h("error")).error(e3);
            }
            return new s(t2, r2, "");
          }, async: function(e2, t2) {
            return this.internalStream(e2).accumulate(t2);
          }, nodeStream: function(e2, t2) {
            return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
          }, _compressWorker: function(e2, t2) {
            if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
            var r2 = this._decompressWorker();
            return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
          }, _decompressWorker: function() {
            return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
          } };
          for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
            throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
          }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
          t.exports = n;
        }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
          (function(t2) {
            "use strict";
            var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
            if (e2) {
              var i = 0, s = new e2(u), a = t2.document.createTextNode("");
              s.observe(a, { characterData: true }), r = function() {
                a.data = i = ++i % 2;
              };
            } else if (t2.setImmediate || void 0 === t2.MessageChannel) r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
              var e3 = t2.document.createElement("script");
              e3.onreadystatechange = function() {
                u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
              }, t2.document.documentElement.appendChild(e3);
            } : function() {
              setTimeout(u, 0);
            };
            else {
              var o = new t2.MessageChannel();
              o.port1.onmessage = u, r = function() {
                o.port2.postMessage(0);
              };
            }
            var h = [];
            function u() {
              var e3, t3;
              n = true;
              for (var r2 = h.length; r2; ) {
                for (t3 = h, h = [], e3 = -1; ++e3 < r2; ) t3[e3]();
                r2 = h.length;
              }
              n = false;
            }
            l.exports = function(e3) {
              1 !== h.push(e3) || n || r();
            };
          }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
        }, {}], 37: [function(e, t, r) {
          "use strict";
          var i = e("immediate");
          function u() {
          }
          var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
          function o(e2) {
            if ("function" != typeof e2) throw new TypeError("resolver must be a function");
            this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
          }
          function h(e2, t2, r2) {
            this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
          }
          function f(t2, r2, n2) {
            i(function() {
              var e2;
              try {
                e2 = r2(n2);
              } catch (e3) {
                return l.reject(t2, e3);
              }
              e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
            });
          }
          function c(e2) {
            var t2 = e2 && e2.then;
            if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2) return function() {
              t2.apply(e2, arguments);
            };
          }
          function d(t2, e2) {
            var r2 = false;
            function n2(e3) {
              r2 || (r2 = true, l.reject(t2, e3));
            }
            function i2(e3) {
              r2 || (r2 = true, l.resolve(t2, e3));
            }
            var s2 = p(function() {
              e2(i2, n2);
            });
            "error" === s2.status && n2(s2.value);
          }
          function p(e2, t2) {
            var r2 = {};
            try {
              r2.value = e2(t2), r2.status = "success";
            } catch (e3) {
              r2.status = "error", r2.value = e3;
            }
            return r2;
          }
          (t.exports = o).prototype.finally = function(t2) {
            if ("function" != typeof t2) return this;
            var r2 = this.constructor;
            return this.then(function(e2) {
              return r2.resolve(t2()).then(function() {
                return e2;
              });
            }, function(e2) {
              return r2.resolve(t2()).then(function() {
                throw e2;
              });
            });
          }, o.prototype.catch = function(e2) {
            return this.then(null, e2);
          }, o.prototype.then = function(e2, t2) {
            if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s) return this;
            var r2 = new this.constructor(u);
            this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
            return r2;
          }, h.prototype.callFulfilled = function(e2) {
            l.resolve(this.promise, e2);
          }, h.prototype.otherCallFulfilled = function(e2) {
            f(this.promise, this.onFulfilled, e2);
          }, h.prototype.callRejected = function(e2) {
            l.reject(this.promise, e2);
          }, h.prototype.otherCallRejected = function(e2) {
            f(this.promise, this.onRejected, e2);
          }, l.resolve = function(e2, t2) {
            var r2 = p(c, t2);
            if ("error" === r2.status) return l.reject(e2, r2.value);
            var n2 = r2.value;
            if (n2) d(e2, n2);
            else {
              e2.state = a, e2.outcome = t2;
              for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t2);
            }
            return e2;
          }, l.reject = function(e2, t2) {
            e2.state = s, e2.outcome = t2;
            for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t2);
            return e2;
          }, o.resolve = function(e2) {
            if (e2 instanceof this) return e2;
            return l.resolve(new this(u), e2);
          }, o.reject = function(e2) {
            var t2 = new this(u);
            return l.reject(t2, e2);
          }, o.all = function(e2) {
            var r2 = this;
            if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
            var n2 = e2.length, i2 = false;
            if (!n2) return this.resolve([]);
            var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
            for (; ++t2 < n2; ) h2(e2[t2], t2);
            return o2;
            function h2(e3, t3) {
              r2.resolve(e3).then(function(e4) {
                s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
              }, function(e4) {
                i2 || (i2 = true, l.reject(o2, e4));
              });
            }
          }, o.race = function(e2) {
            var t2 = this;
            if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
            var r2 = e2.length, n2 = false;
            if (!r2) return this.resolve([]);
            var i2 = -1, s2 = new this(u);
            for (; ++i2 < r2; ) a2 = e2[i2], t2.resolve(a2).then(function(e3) {
              n2 || (n2 = true, l.resolve(s2, e3));
            }, function(e3) {
              n2 || (n2 = true, l.reject(s2, e3));
            });
            var a2;
            return s2;
          };
        }, { immediate: 36 }], 38: [function(e, t, r) {
          "use strict";
          var n = {};
          (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
        }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
          "use strict";
          var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
          function p(e2) {
            if (!(this instanceof p)) return new p(e2);
            this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
            var t2 = this.options;
            t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
            var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
            if (r2 !== l) throw new Error(i[r2]);
            if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
              var n2;
              if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
              this._dict_set = true;
            }
          }
          function n(e2, t2) {
            var r2 = new p(t2);
            if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
            return r2.result;
          }
          p.prototype.push = function(e2, t2) {
            var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
            if (this.ended) return false;
            n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
            do {
              if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
              0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
            } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
            return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
          }, p.prototype.onData = function(e2) {
            this.chunks.push(e2);
          }, p.prototype.onEnd = function(e2) {
            e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
          }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
            return (t2 = t2 || {}).raw = true, n(e2, t2);
          }, r.gzip = function(e2, t2) {
            return (t2 = t2 || {}).gzip = true, n(e2, t2);
          };
        }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
          "use strict";
          var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
          function a(e2) {
            if (!(this instanceof a)) return new a(e2);
            this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
            var t2 = this.options;
            t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
            var r2 = c.inflateInit2(this.strm, t2.windowBits);
            if (r2 !== m.Z_OK) throw new Error(n[r2]);
            this.header = new s(), c.inflateGetHeader(this.strm, this.header);
          }
          function o(e2, t2) {
            var r2 = new a(t2);
            if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
            return r2.result;
          }
          a.prototype.push = function(e2, t2) {
            var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
            if (this.ended) return false;
            n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
            do {
              if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
              h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
            } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
            return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
          }, a.prototype.onData = function(e2) {
            this.chunks.push(e2);
          }, a.prototype.onEnd = function(e2) {
            e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
          }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
            return (t2 = t2 || {}).raw = true, o(e2, t2);
          }, r.ungzip = o;
        }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
          "use strict";
          var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
          r.assign = function(e2) {
            for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
              var r2 = t2.shift();
              if (r2) {
                if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
                for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
              }
            }
            return e2;
          }, r.shrinkBuf = function(e2, t2) {
            return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
          };
          var i = { arraySet: function(e2, t2, r2, n2, i2) {
            if (t2.subarray && e2.subarray) e2.set(t2.subarray(r2, r2 + n2), i2);
            else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
          }, flattenChunks: function(e2) {
            var t2, r2, n2, i2, s2, a;
            for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++) n2 += e2[t2].length;
            for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++) s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
            return a;
          } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
            for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
          }, flattenChunks: function(e2) {
            return [].concat.apply([], e2);
          } };
          r.setTyped = function(e2) {
            e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
          }, r.setTyped(n);
        }, {}], 42: [function(e, t, r) {
          "use strict";
          var h = e("./common"), i = true, s = true;
          try {
            String.fromCharCode.apply(null, [0]);
          } catch (e2) {
            i = false;
          }
          try {
            String.fromCharCode.apply(null, new Uint8Array(1));
          } catch (e2) {
            s = false;
          }
          for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
          function l(e2, t2) {
            if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
            for (var r2 = "", n2 = 0; n2 < t2; n2++) r2 += String.fromCharCode(e2[n2]);
            return r2;
          }
          u[254] = u[254] = 1, r.string2buf = function(e2) {
            var t2, r2, n2, i2, s2, a = e2.length, o = 0;
            for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
            for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
            return t2;
          }, r.buf2binstring = function(e2) {
            return l(e2, e2.length);
          }, r.binstring2buf = function(e2) {
            for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++) t2[r2] = e2.charCodeAt(r2);
            return t2;
          }, r.buf2string = function(e2, t2) {
            var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
            for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
            else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
            else {
              for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
              1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
            }
            return l(o, n2);
          }, r.utf8border = function(e2, t2) {
            var r2;
            for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
            return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
          };
        }, { "./common": 41 }], 43: [function(e, t, r) {
          "use strict";
          t.exports = function(e2, t2, r2, n) {
            for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
              for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; ) ;
              i %= 65521, s %= 65521;
            }
            return i | s << 16 | 0;
          };
        }, {}], 44: [function(e, t, r) {
          "use strict";
          t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
        }, {}], 45: [function(e, t, r) {
          "use strict";
          var o = function() {
            for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
              e2 = r2;
              for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
              t2[r2] = e2;
            }
            return t2;
          }();
          t.exports = function(e2, t2, r2, n) {
            var i = o, s = n + r2;
            e2 ^= -1;
            for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
            return -1 ^ e2;
          };
        }, {}], 46: [function(e, t, r) {
          "use strict";
          var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
          function R(e2, t2) {
            return e2.msg = n[t2], t2;
          }
          function T(e2) {
            return (e2 << 1) - (4 < e2 ? 9 : 0);
          }
          function D(e2) {
            for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
          }
          function F(e2) {
            var t2 = e2.state, r2 = t2.pending;
            r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
          }
          function N(e2, t2) {
            u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
          }
          function U(e2, t2) {
            e2.pending_buf[e2.pending++] = t2;
          }
          function P(e2, t2) {
            e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
          }
          function L(e2, t2) {
            var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
            e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
            do {
              if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
                s2 += 2, r2++;
                do {
                } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
                if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                  if (e2.match_start = t2, o2 <= (a2 = n2)) break;
                  d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
                }
              }
            } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
            return a2 <= e2.lookahead ? a2 : e2.lookahead;
          }
          function j(e2) {
            var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
            do {
              if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
                for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
                for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
                i2 += f2;
              }
              if (0 === e2.strm.avail_in) break;
              if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
            } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
          }
          function Z(e2, t2) {
            for (var r2, n2; ; ) {
              if (e2.lookahead < z) {
                if (j(e2), e2.lookahead < z && t2 === l) return A;
                if (0 === e2.lookahead) break;
              }
              if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
                for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
                e2.strstart++;
              } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
              else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
              if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            }
            return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
          }
          function W(e2, t2) {
            for (var r2, n2, i2; ; ) {
              if (e2.lookahead < z) {
                if (j(e2), e2.lookahead < z && t2 === l) return A;
                if (0 === e2.lookahead) break;
              }
              if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
                for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
                if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
              } else if (e2.match_available) {
                if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
              } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
            }
            return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
          }
          function M(e2, t2, r2, n2, i2) {
            this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
          }
          function H() {
            this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
          }
          function G(e2) {
            var t2;
            return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
          }
          function K(e2) {
            var t2 = G(e2);
            return t2 === m && function(e3) {
              e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
            }(e2.state), t2;
          }
          function Y(e2, t2, r2, n2, i2, s2) {
            if (!e2) return _;
            var a2 = 1;
            if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2) return R(e2, _);
            8 === n2 && (n2 = 9);
            var o2 = new H();
            return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
          }
          h = [new M(0, 0, 0, 0, function(e2, t2) {
            var r2 = 65535;
            for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
              if (e2.lookahead <= 1) {
                if (j(e2), 0 === e2.lookahead && t2 === l) return A;
                if (0 === e2.lookahead) break;
              }
              e2.strstart += e2.lookahead, e2.lookahead = 0;
              var n2 = e2.block_start + r2;
              if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
              if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            }
            return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
          }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
            return Y(e2, t2, v, 15, 8, 0);
          }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
            return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
          }, r.deflate = function(e2, t2) {
            var r2, n2, i2, s2;
            if (!e2 || !e2.state || 5 < t2 || t2 < 0) return e2 ? R(e2, _) : _;
            if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
            if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
            else {
              var a2 = v + (n2.w_bits - 8 << 4) << 8;
              a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
            }
            if (69 === n2.status) if (n2.gzhead.extra) {
              for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
              n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
            } else n2.status = 73;
            if (73 === n2.status) if (n2.gzhead.name) {
              i2 = n2.pending;
              do {
                if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                  s2 = 1;
                  break;
                }
                s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
              } while (0 !== s2);
              n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
            } else n2.status = 91;
            if (91 === n2.status) if (n2.gzhead.comment) {
              i2 = n2.pending;
              do {
                if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                  s2 = 1;
                  break;
                }
                s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
              } while (0 !== s2);
              n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
            } else n2.status = 103;
            if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
              if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
            } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f) return R(e2, -5);
            if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
            if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
              var o2 = 2 === n2.strategy ? function(e3, t3) {
                for (var r3; ; ) {
                  if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                    if (t3 === l) return A;
                    break;
                  }
                  if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
                }
                return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
              }(n2, t2) : 3 === n2.strategy ? function(e3, t3) {
                for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                  if (e3.lookahead <= S) {
                    if (j(e3), e3.lookahead <= S && t3 === l) return A;
                    if (0 === e3.lookahead) break;
                  }
                  if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                    s3 = e3.strstart + S;
                    do {
                    } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                    e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                  }
                  if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
                }
                return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
              }(n2, t2) : h[n2.level].func(n2, t2);
              if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
              if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
            }
            return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
          }, r.deflateEnd = function(e2) {
            var t2;
            return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
          }, r.deflateSetDictionary = function(e2, t2) {
            var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
            if (!e2 || !e2.state) return _;
            if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
            for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
              for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
              r2.strstart = n2, r2.lookahead = x - 1, j(r2);
            }
            return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
          }, r.deflateInfo = "pako deflate (from Nodeca project)";
        }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
          "use strict";
          t.exports = function() {
            this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
          };
        }, {}], 48: [function(e, t, r) {
          "use strict";
          t.exports = function(e2, t2) {
            var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
            r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
            e: do {
              p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
              t: for (; ; ) {
                if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
                else {
                  if (!(16 & y)) {
                    if (0 == (64 & y)) {
                      v = m[(65535 & v) + (d & (1 << y) - 1)];
                      continue t;
                    }
                    if (32 & y) {
                      r2.mode = 12;
                      break e;
                    }
                    e2.msg = "invalid literal/length code", r2.mode = 30;
                    break e;
                  }
                  w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                  r: for (; ; ) {
                    if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                      if (0 == (64 & y)) {
                        v = _[(65535 & v) + (d & (1 << y) - 1)];
                        continue r;
                      }
                      e2.msg = "invalid distance code", r2.mode = 30;
                      break e;
                    }
                    if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break e;
                    }
                    if (d >>>= y, p -= y, (y = s - a) < k) {
                      if (l < (y = k - y) && r2.sane) {
                        e2.msg = "invalid distance too far back", r2.mode = 30;
                        break e;
                      }
                      if (S = c, (x = 0) === f) {
                        if (x += u - y, y < w) {
                          for (w -= y; C[s++] = c[x++], --y; ) ;
                          x = s - k, S = C;
                        }
                      } else if (f < y) {
                        if (x += u + f - y, (y -= f) < w) {
                          for (w -= y; C[s++] = c[x++], --y; ) ;
                          if (x = 0, f < w) {
                            for (w -= y = f; C[s++] = c[x++], --y; ) ;
                            x = s - k, S = C;
                          }
                        }
                      } else if (x += f - y, y < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        x = s - k, S = C;
                      }
                      for (; 2 < w; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                      w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                    } else {
                      for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                      w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                    }
                    break;
                  }
                }
                break;
              }
            } while (n < i && s < o);
            n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
          };
        }, {}], 49: [function(e, t, r) {
          "use strict";
          var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
          function L(e2) {
            return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
          }
          function s() {
            this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
          }
          function a(e2) {
            var t2;
            return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
          }
          function o(e2) {
            var t2;
            return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
          }
          function h(e2, t2) {
            var r2, n2;
            return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
          }
          function u(e2, t2) {
            var r2, n2;
            return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
          }
          var l, f, c = true;
          function j(e2) {
            if (c) {
              var t2;
              for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; ) e2.lens[t2++] = 8;
              for (; t2 < 256; ) e2.lens[t2++] = 9;
              for (; t2 < 280; ) e2.lens[t2++] = 7;
              for (; t2 < 288; ) e2.lens[t2++] = 8;
              for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
              T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
            }
            e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
          }
          function Z(e2, t2, r2, n2) {
            var i2, s2 = e2.state;
            return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
          }
          r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
            return u(e2, 15);
          }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
            var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
            if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
            12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
            e: for (; ; ) switch (r2.mode) {
              case P:
                if (0 === r2.wrap) {
                  r2.mode = 13;
                  break;
                }
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (2 & r2.wrap && 35615 === u2) {
                  E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                  break;
                }
                if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                  e2.msg = "incorrect header check", r2.mode = 30;
                  break;
                }
                if (8 != (15 & u2)) {
                  e2.msg = "unknown compression method", r2.mode = 30;
                  break;
                }
                if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
                else if (k > r2.wbits) {
                  e2.msg = "invalid window size", r2.mode = 30;
                  break;
                }
                r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
                break;
              case 2:
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (r2.flags = u2, 8 != (255 & r2.flags)) {
                  e2.msg = "unknown compression method", r2.mode = 30;
                  break;
                }
                if (57344 & r2.flags) {
                  e2.msg = "unknown header flags set", r2.mode = 30;
                  break;
                }
                r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
              case 3:
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
              case 4:
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
              case 5:
                if (1024 & r2.flags) {
                  for (; l2 < 16; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
                } else r2.head && (r2.head.extra = null);
                r2.mode = 6;
              case 6:
                if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
                r2.length = 0, r2.mode = 7;
              case 7:
                if (2048 & r2.flags) {
                  if (0 === o2) break e;
                  for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
                  if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
                } else r2.head && (r2.head.name = null);
                r2.length = 0, r2.mode = 8;
              case 8:
                if (4096 & r2.flags) {
                  if (0 === o2) break e;
                  for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
                  if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
                } else r2.head && (r2.head.comment = null);
                r2.mode = 9;
              case 9:
                if (512 & r2.flags) {
                  for (; l2 < 16; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (u2 !== (65535 & r2.check)) {
                    e2.msg = "header crc mismatch", r2.mode = 30;
                    break;
                  }
                  l2 = u2 = 0;
                }
                r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
                break;
              case 10:
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
              case 11:
                if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
                e2.adler = r2.check = 1, r2.mode = 12;
              case 12:
                if (5 === t2 || 6 === t2) break e;
              case 13:
                if (r2.last) {
                  u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                  break;
                }
                for (; l2 < 3; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                  case 0:
                    r2.mode = 14;
                    break;
                  case 1:
                    if (j(r2), r2.mode = 20, 6 !== t2) break;
                    u2 >>>= 2, l2 -= 2;
                    break e;
                  case 2:
                    r2.mode = 17;
                    break;
                  case 3:
                    e2.msg = "invalid block type", r2.mode = 30;
                }
                u2 >>>= 2, l2 -= 2;
                break;
              case 14:
                for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                  e2.msg = "invalid stored block lengths", r2.mode = 30;
                  break;
                }
                if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2) break e;
              case 15:
                r2.mode = 16;
              case 16:
                if (d = r2.length) {
                  if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
                  I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                  break;
                }
                r2.mode = 12;
                break;
              case 17:
                for (; l2 < 14; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                  e2.msg = "too many length or distance symbols", r2.mode = 30;
                  break;
                }
                r2.have = 0, r2.mode = 18;
              case 18:
                for (; r2.have < r2.ncode; ) {
                  for (; l2 < 3; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
                }
                for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
                if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                  e2.msg = "invalid code lengths set", r2.mode = 30;
                  break;
                }
                r2.have = 0, r2.mode = 19;
              case 19:
                for (; r2.have < r2.nlen + r2.ndist; ) {
                  for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                  else {
                    if (16 === b) {
                      for (z = _ + 2; l2 < z; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                        e2.msg = "invalid bit length repeat", r2.mode = 30;
                        break;
                      }
                      k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                    } else if (17 === b) {
                      for (z = _ + 3; l2 < z; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                    } else {
                      for (z = _ + 7; l2 < z; ) {
                        if (0 === o2) break e;
                        o2--, u2 += n2[s2++] << l2, l2 += 8;
                      }
                      l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                    }
                    if (r2.have + d > r2.nlen + r2.ndist) {
                      e2.msg = "invalid bit length repeat", r2.mode = 30;
                      break;
                    }
                    for (; d--; ) r2.lens[r2.have++] = k;
                  }
                }
                if (30 === r2.mode) break;
                if (0 === r2.lens[256]) {
                  e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                  break;
                }
                if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                  e2.msg = "invalid literal/lengths set", r2.mode = 30;
                  break;
                }
                if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                  e2.msg = "invalid distances set", r2.mode = 30;
                  break;
                }
                if (r2.mode = 20, 6 === t2) break e;
              case 20:
                r2.mode = 21;
              case 21:
                if (6 <= o2 && 258 <= h2) {
                  e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                  break;
                }
                for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (g && 0 == (240 & g)) {
                  for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  u2 >>>= v, l2 -= v, r2.back += v;
                }
                if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                  r2.mode = 26;
                  break;
                }
                if (32 & g) {
                  r2.back = -1, r2.mode = 12;
                  break;
                }
                if (64 & g) {
                  e2.msg = "invalid literal/length code", r2.mode = 30;
                  break;
                }
                r2.extra = 15 & g, r2.mode = 22;
              case 22:
                if (r2.extra) {
                  for (z = r2.extra; l2 < z; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                }
                r2.was = r2.length, r2.mode = 23;
              case 23:
                for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (0 == (240 & g)) {
                  for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  u2 >>>= v, l2 -= v, r2.back += v;
                }
                if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                  e2.msg = "invalid distance code", r2.mode = 30;
                  break;
                }
                r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
              case 24:
                if (r2.extra) {
                  for (z = r2.extra; l2 < z; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
                }
                if (r2.offset > r2.dmax) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break;
                }
                r2.mode = 25;
              case 25:
                if (0 === h2) break e;
                if (d = c2 - h2, r2.offset > d) {
                  if ((d = r2.offset - d) > r2.whave && r2.sane) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break;
                  }
                  p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
                } else m = i2, p = a2 - r2.offset, d = r2.length;
                for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
                0 === r2.length && (r2.mode = 21);
                break;
              case 26:
                if (0 === h2) break e;
                i2[a2++] = r2.length, h2--, r2.mode = 21;
                break;
              case 27:
                if (r2.wrap) {
                  for (; l2 < 32; ) {
                    if (0 === o2) break e;
                    o2--, u2 |= n2[s2++] << l2, l2 += 8;
                  }
                  if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                    e2.msg = "incorrect data check", r2.mode = 30;
                    break;
                  }
                  l2 = u2 = 0;
                }
                r2.mode = 28;
              case 28:
                if (r2.wrap && r2.flags) {
                  for (; l2 < 32; ) {
                    if (0 === o2) break e;
                    o2--, u2 += n2[s2++] << l2, l2 += 8;
                  }
                  if (u2 !== (4294967295 & r2.total)) {
                    e2.msg = "incorrect length check", r2.mode = 30;
                    break;
                  }
                  l2 = u2 = 0;
                }
                r2.mode = 29;
              case 29:
                x = 1;
                break e;
              case 30:
                x = -3;
                break e;
              case 31:
                return -4;
              case 32:
              default:
                return U;
            }
            return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
          }, r.inflateEnd = function(e2) {
            if (!e2 || !e2.state) return U;
            var t2 = e2.state;
            return t2.window && (t2.window = null), e2.state = null, N;
          }, r.inflateGetHeader = function(e2, t2) {
            var r2;
            return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
          }, r.inflateSetDictionary = function(e2, t2) {
            var r2, n2 = t2.length;
            return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
          }, r.inflateInfo = "pako inflate (from Nodeca project)";
        }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
          "use strict";
          var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
          t.exports = function(e2, t2, r2, n, i, s, a, o) {
            var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
            for (b = 0; b <= 15; b++) O[b] = 0;
            for (v = 0; v < n; v++) O[t2[r2 + v]]++;
            for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
            if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
            for (y = 1; y < w && 0 === O[y]; y++) ;
            for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
            if (0 < z && (0 === e2 || 1 !== w)) return -1;
            for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
            for (v = 0; v < n; v++) 0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
            if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
            for (; ; ) {
              for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
              for (h = 1 << b - 1; E & h; ) h >>= 1;
              if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
                if (b === w) break;
                b = t2[r2 + a[v]];
              }
              if (k < b && (E & f) !== l) {
                for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
                if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
                i[l = E & f] = k << 24 | x << 16 | c - s | 0;
              }
            }
            return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
          };
        }, { "../utils/common": 41 }], 51: [function(e, t, r) {
          "use strict";
          t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
        }, {}], 52: [function(e, t, r) {
          "use strict";
          var i = e("../utils/common"), o = 0, h = 1;
          function n(e2) {
            for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
          }
          var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
          n(z);
          var C = new Array(2 * f);
          n(C);
          var E = new Array(512);
          n(E);
          var A = new Array(256);
          n(A);
          var I = new Array(a);
          n(I);
          var O, B, R, T = new Array(f);
          function D(e2, t2, r2, n2, i2) {
            this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
          }
          function F(e2, t2) {
            this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
          }
          function N(e2) {
            return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
          }
          function U(e2, t2) {
            e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
          }
          function P(e2, t2, r2) {
            e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
          }
          function L(e2, t2, r2) {
            P(e2, r2[2 * t2], r2[2 * t2 + 1]);
          }
          function j(e2, t2) {
            for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; ) ;
            return r2 >>> 1;
          }
          function Z(e2, t2, r2) {
            var n2, i2, s2 = new Array(g + 1), a2 = 0;
            for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
            for (i2 = 0; i2 <= t2; i2++) {
              var o2 = e2[2 * i2 + 1];
              0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
            }
          }
          function W(e2) {
            var t2;
            for (t2 = 0; t2 < l; t2++) e2.dyn_ltree[2 * t2] = 0;
            for (t2 = 0; t2 < f; t2++) e2.dyn_dtree[2 * t2] = 0;
            for (t2 = 0; t2 < c; t2++) e2.bl_tree[2 * t2] = 0;
            e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
          }
          function M(e2) {
            8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
          }
          function H(e2, t2, r2, n2) {
            var i2 = 2 * t2, s2 = 2 * r2;
            return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
          }
          function G(e2, t2, r2) {
            for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
            e2.heap[r2] = n2;
          }
          function K(e2, t2, r2) {
            var n2, i2, s2, a2, o2 = 0;
            if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
            L(e2, m, t2);
          }
          function Y(e2, t2) {
            var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
            for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
            for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
            for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
            for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
            e2.heap[--e2.heap_max] = e2.heap[1], function(e3, t3) {
              var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
              for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
              for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
              if (0 !== m2) {
                do {
                  for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
                  e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
                } while (0 < m2);
                for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
              }
            }(e2, t2), Z(s2, u2, e2.bl_count);
          }
          function X(e2, t2, r2) {
            var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
            for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
          }
          function V(e2, t2, r2) {
            var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
            for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
              if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
              else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
              s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
            }
          }
          n(T);
          var q = false;
          function J(e2, t2, r2, n2) {
            P(e2, (s << 1) + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
              M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
            }(e2, t2, r2, true);
          }
          r._tr_init = function(e2) {
            q || (function() {
              var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
              for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
              for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
              for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
              for (t2 = 0; t2 <= g; t2++) s2[t2] = 0;
              for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
              for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
              for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
              for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
              for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
              O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
            }(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
          }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
            var i2, s2, a2 = 0;
            0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = function(e3) {
              var t3, r3 = 4093624447;
              for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3]) return o;
              if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
              for (t3 = 32; t3 < u; t3++) if (0 !== e3.dyn_ltree[2 * t3]) return h;
              return o;
            }(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = function(e3) {
              var t3;
              for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--) ;
              return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
            }(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), function(e3, t3, r3, n3) {
              var i3;
              for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
              V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
            }(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
          }, r._tr_tally = function(e2, t2, r2) {
            return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
          }, r._tr_align = function(e2) {
            P(e2, 2, 3), L(e2, m, z), function(e3) {
              16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
            }(e2);
          };
        }, { "../utils/common": 41 }], 53: [function(e, t, r) {
          "use strict";
          t.exports = function() {
            this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
          };
        }, {}], 54: [function(e, t, r) {
          (function(e2) {
            !function(r2, n) {
              "use strict";
              if (!r2.setImmediate) {
                var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
                e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                  process.nextTick(function() {
                    c(e4);
                  });
                } : function() {
                  if (r2.postMessage && !r2.importScripts) {
                    var e4 = true, t3 = r2.onmessage;
                    return r2.onmessage = function() {
                      e4 = false;
                    }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
                  }
                }() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                  r2.postMessage(a + e4, "*");
                }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
                  c(e4.data);
                }, function(e4) {
                  t2.port2.postMessage(e4);
                }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                  var t3 = l.createElement("script");
                  t3.onreadystatechange = function() {
                    c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
                  }, s.appendChild(t3);
                }) : function(e4) {
                  setTimeout(c, 0, e4);
                }, e3.setImmediate = function(e4) {
                  "function" != typeof e4 && (e4 = new Function("" + e4));
                  for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++) t3[r3] = arguments[r3 + 1];
                  var n2 = { callback: e4, args: t3 };
                  return h[o] = n2, i(o), o++;
                }, e3.clearImmediate = f;
              }
              function f(e4) {
                delete h[e4];
              }
              function c(e4) {
                if (u) setTimeout(c, 0, e4);
                else {
                  var t3 = h[e4];
                  if (t3) {
                    u = true;
                    try {
                      !function(e5) {
                        var t4 = e5.callback, r3 = e5.args;
                        switch (r3.length) {
                          case 0:
                            t4();
                            break;
                          case 1:
                            t4(r3[0]);
                            break;
                          case 2:
                            t4(r3[0], r3[1]);
                            break;
                          case 3:
                            t4(r3[0], r3[1], r3[2]);
                            break;
                          default:
                            t4.apply(n, r3);
                        }
                      }(t3);
                    } finally {
                      f(e4), u = false;
                    }
                  }
                }
              }
              function d(e4) {
                e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
              }
            }("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
          }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
        }, {}] }, {}, [10])(10);
      });
    }
  });

  // loads/eda/entry.js
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/actions.ts
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/project-transfer.ts
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/protocol.ts
  init_define_LOAD_ACTIONS();
  var ErrorCodes = {
    UNKNOWN_ACTION: "UNKNOWN_ACTION",
    MISSING_PAYLOAD_FIELD: "MISSING_PAYLOAD_FIELD",
    EDA_API_UNAVAILABLE: "EDA_API_UNAVAILABLE",
    EDA_CALL_FAILED: "EDA_CALL_FAILED",
    INVALID_STATE: "INVALID_STATE",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    /**
     * 队首超过它自己的 timeoutMs 仍未 settle,被放弃以让队列继续流动。
     * **它的效果可能稍后才落地** —— 收到这个码 = 关于这次写的任何结论都不成立。
     */
    ACTION_ABANDONED: "ACTION_ABANDONED",
    /** 队列积压到上限,这次提交被明确拒绝(而不是无限堆积)。它**没有执行**。 */
    QUEUE_OVERFLOW: "QUEUE_OVERFLOW",
    /**
     * **请求本身不合法,handler 在动手前就拒了 —— 画布一个字节都没改。**
     *
     * 与 `INVALID_STATE` 的分工:`INVALID_STATE` 说的是「编辑器/文档处在做不了这件事
     * 的状态」(可能是平台侧的真问题);这个码说的是「**你要我做的事本身讲不通**」——
     * 网名板上没有、同名约束已存在且内容不同、正负网填成同一条…… 属于**调用方的
     * 输入问题**,连接器与平台都工作正常。
     *
     * 为什么要单独一个码:daemon 的写健康度(`writehealth.go`)把 `ok:false` 一律计成
     * 失败,于是「用户把网名打错了」会把连接器染成 DEGRADED,**真正的停摆信号被误报
     * 淹没**。带这个码的响应**不进写健康度采样**——它不含任何关于连接器是否健康的信息。
     *
     * 用它的前提是**零变异**:一旦已经写了任何东西,就不许再用这个码(该走 partial /
     * 结构化成功那条路,见 #151 部分应用约定)。
     */
    PRECONDITION_REFUSED: "PRECONDITION_REFUSED"
  };
  var ActionError = class extends Error {
    code;
    detail;
    constructor(code, message, detail) {
      super(message);
      this.name = "ActionError";
      this.code = code;
      this.detail = detail;
    }
  };

  // .cache/loads/eda@7a73a6834d8d/extension/src/util.ts
  init_define_LOAD_ACTIONS();
  var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function uint8ToBase64(bytes) {
    let output = "";
    const len = bytes.length;
    let i = 0;
    for (; i + 2 < len; i += 3) {
      const triple = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
      output += BASE64_CHARS[triple >> 18 & 63];
      output += BASE64_CHARS[triple >> 12 & 63];
      output += BASE64_CHARS[triple >> 6 & 63];
      output += BASE64_CHARS[triple & 63];
    }
    const remaining = len - i;
    if (remaining === 1) {
      const chunk = bytes[i];
      output += BASE64_CHARS[chunk >> 2 & 63];
      output += BASE64_CHARS[chunk << 4 & 63];
      output += "==";
    } else if (remaining === 2) {
      const chunk = bytes[i] << 8 | bytes[i + 1];
      output += BASE64_CHARS[chunk >> 10 & 63];
      output += BASE64_CHARS[chunk >> 4 & 63];
      output += BASE64_CHARS[chunk << 2 & 63];
      output += "=";
    }
    return output;
  }
  async function blobToBase64(blob) {
    const buffer = await blob.arrayBuffer();
    return uint8ToBase64(new Uint8Array(buffer));
  }
  function newArtifactId() {
    return `art_${crypto.randomUUID()}`;
  }
  function asPayload(payload) {
    return payload ?? {};
  }
  function pickNamedCandidate(name2, candidates) {
    const exact = candidates.filter((c) => c.name === name2);
    if (exact.length === 1) return { kind: "match", item: exact[0] };
    if (exact.length > 1) return { kind: "ambiguous", matches: exact };
    const lower = name2.toLowerCase();
    const ci = candidates.filter((c) => c.name.toLowerCase() === lower);
    if (ci.length === 1) return { kind: "match", item: ci[0] };
    if (ci.length > 1) return { kind: "ambiguous", matches: ci };
    return { kind: "none" };
  }
  function requireString(payload, field) {
    const value = payload[field];
    if (typeof value !== "string" || value.length === 0) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Missing required string field "${field}".`
      );
    }
    return value;
  }
  function requireStringArray(payload, field) {
    const value = payload[field];
    if (typeof value === "string" && value.length > 0) return [value];
    if (Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string" && v.length > 0)) {
      return value;
    }
    throw new ActionError(
      ErrorCodes.MISSING_PAYLOAD_FIELD,
      `Missing required string-array field "${field}".`
    );
  }
  function requireNumber(payload, field) {
    const value = payload[field];
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Missing required number field "${field}".`
      );
    }
    return value;
  }
  function optionalString(payload, field) {
    const value = payload[field];
    return typeof value === "string" ? value : void 0;
  }
  function optionalNumber(payload, field) {
    const value = payload[field];
    return typeof value === "number" && !Number.isNaN(value) ? value : void 0;
  }
  function optionalBoolean(payload, field) {
    const value = payload[field];
    return typeof value === "boolean" ? value : void 0;
  }
  function normalizeWirePoints(points) {
    if (!Array.isArray(points) || points.length === 0) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Missing required field "points" (number[] or number[][]).'
      );
    }
    let flat;
    if (Array.isArray(points[0])) {
      flat = [];
      for (const pair of points) {
        if (!Array.isArray(pair) || pair.length !== 2) {
          throw new ActionError(
            ErrorCodes.MISSING_PAYLOAD_FIELD,
            'Invalid "points": each nested entry must be a [x, y] pair.'
          );
        }
        flat.push(pair[0], pair[1]);
      }
    } else {
      flat = points;
    }
    if (flat.length < 4 || flat.length % 2 !== 0) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Invalid "points": expected an even number of coordinates (\u22654 = at least two [x, y] points), got ${flat.length}.`
      );
    }
    for (const n of flat) {
      if (typeof n !== "number" || !Number.isFinite(n)) {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          'Invalid "points": all coordinates must be finite numbers.'
        );
      }
    }
    return flat;
  }
  function normalizeRegion(left, right, top, bottom) {
    for (const [name2, value] of [["left", left], ["right", right], ["top", top], ["bottom", bottom]]) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          `Invalid region: "${name2}" must be a finite number.`
        );
      }
    }
    const minX = Math.min(left, right);
    const maxX = Math.max(left, right);
    const minY = Math.min(top, bottom);
    const maxY = Math.max(top, bottom);
    if (minX === maxX || minY === maxY) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Invalid region: zero-area box (x span ${maxX - minX}, y span ${maxY - minY}). left/right and top/bottom must each be two distinct bounds.`
      );
    }
    return { left: minX, right: maxX, top: minY, bottom: maxY };
  }
  var AUTO_NET_RE = /^\$\d+N\d+$/;
  function isAutoGeneratedNet(net) {
    return typeof net === "string" && AUTO_NET_RE.test(net.trim());
  }
  function classifyWireConnectivity(ends, net) {
    const anyMarker = ends.some((e) => e.touchesMarker);
    if (anyMarker) return "connected";
    const pinEnds = ends.filter((e) => e.touchesPin).length;
    if (pinEnds >= 2) return "connected";
    if (pinEnds === 1) {
      return net === "" || isAutoGeneratedNet(net) ? "orphan-stub" : "connected";
    }
    return "dangling";
  }
  function classifyPinConnectivity(hasNetlistNet, geomConnected, netlistAvailable) {
    if (hasNetlistNet) return "connected";
    if (!netlistAvailable) return geomConnected ? "connected" : "floating";
    if (geomConnected) return "geom-net-mismatch";
    return "floating";
  }
  function isLcscQuery(query) {
    return /^\s*C\d+\s*$/i.test(query);
  }
  function readLcscField(record3) {
    const op = record3.otherProperty ?? {};
    const raw = record3.supplierId ?? op["Supplier Part"];
    return raw == null ? "" : String(raw);
  }
  function filterExactLcsc(records, lcsc) {
    const want = lcsc.trim().toUpperCase();
    return records.filter((r) => readLcscField(r).trim().toUpperCase() === want);
  }
  var THROWN_DETAIL_MAX = 600;
  var MESSAGE_LIKE_KEYS = ["message", "msg", "error", "detail", "description"];
  function stringifySafe(value) {
    const seen = /* @__PURE__ */ new WeakSet();
    try {
      return JSON.stringify(value, (_key, val) => {
        if (typeof val === "bigint") return `${val}n`;
        if (typeof val === "function") return `[Function ${val.name || "anonymous"}]`;
        if (typeof val === "object" && val !== null) {
          if (seen.has(val)) return "[Circular]";
          seen.add(val);
        }
        return val;
      }) ?? "";
    } catch {
      return "";
    }
  }
  function pickMessageLike(record3) {
    for (const key of MESSAGE_LIKE_KEYS) {
      const value = record3[key];
      if (typeof value === "string" && value.trim() !== "") return value.trim();
    }
    return "";
  }
  function describeThrown(err, maxLength = THROWN_DETAIL_MAX) {
    const raw = describeThrownRaw(err);
    if (raw.length <= maxLength) return raw;
    return `${raw.slice(0, maxLength)}\u2026 (truncated, ${raw.length} chars total)`;
  }
  function describeThrownRaw(err) {
    if (err === null) return "null";
    if (err === void 0) return "undefined";
    if (typeof err === "string") return err;
    if (err instanceof Error) {
      const message = err.message?.trim();
      if (message) return message;
      return err.name || "Error";
    }
    if (typeof err !== "object") return String(err);
    const record3 = err;
    const label = pickMessageLike(record3);
    const code = typeof record3.code === "string" || typeof record3.code === "number" ? String(record3.code) : "";
    const json = stringifySafe(err);
    const hasJson = json !== "" && json !== "{}" && json !== "null";
    if (label) {
      const head = code === "" ? label : `[${code}] ${label}`;
      return hasJson ? `${head} | ${json}` : head;
    }
    if (hasJson) return json;
    return `${Object.prototype.toString.call(err)} (no enumerable properties)`;
  }
  function footprintNameEquals(a, b) {
    if (typeof a !== "string" || typeof b !== "string") return false;
    const left = a.trim();
    const right = b.trim();
    if (left === "" || right === "") return false;
    return left.toLowerCase() === right.toLowerCase();
  }
  function readDeviceFootprint(device) {
    const association = device.association && typeof device.association === "object" ? device.association : void 0;
    const nested = device.footprint ?? association?.footprint;
    const ref = nested && typeof nested === "object" && !Array.isArray(nested) ? nested : { uuid: device.footprintUuid ?? association?.footprintUuid, libraryUuid: device.footprintLibraryUuid, name: device.footprintName };
    const text2 = (value) => typeof value === "string" ? value.trim() : "";
    return { uuid: text2(ref.uuid), libraryUuid: text2(ref.libraryUuid), name: text2(ref.name) };
  }
  function projectFootprintSourceInventory(text2, documentUuid) {
    if (!documentUuid || text2.length > 64 * 1024 * 1024) throw new Error("native project source is missing its target or exceeds 64 MiB");
    const rows = text2.split(/\r?\n/);
    if (rows.length > 2e5) throw new Error("native project source exceeds 200000 rows");
    let lastRow = rows.length - 1;
    while (lastRow >= 0 && !rows[lastRow].trim()) lastRow--;
    const inventory = [];
    let current;
    let targetPages = 0;
    for (const [rowIndex, raw] of rows.entries()) {
      let line = raw.trim();
      if (!line) continue;
      const delimiter = line.indexOf("||");
      if (delimiter < 0) throw new Error("malformed native project source row");
      if (!line.endsWith("|")) {
        if (rowIndex !== lastRow) throw new Error("unterminated native project source row before EOF");
        JSON.parse(line.slice(delimiter + 2));
        line += "|";
      }
      const header = JSON.parse(line.slice(0, delimiter));
      if (header.type === "DOCHEAD") {
        const payload = JSON.parse(line.slice(delimiter + 2, -1));
        current = void 0;
        if (payload.docType === "SCH_PAGE" && payload.uuid === documentUuid) targetPages++;
        if (payload.docType === "FOOTPRINT") {
          if (typeof payload.uuid !== "string") throw new Error("footprint DOCHEAD has no instance UUID");
          current = { footprintUuid: payload.uuid, documentSource: line + "\n", sourceKind: "project-epro2" };
          inventory.push(current);
          if (inventory.length > 2048) throw new Error("native project exceeds 2048 footprint documents");
        }
      } else if (current && header.type === "META") {
        current.documentSource += line + "\n";
      }
    }
    if (targetPages !== 1) throw new Error(`native project contains ${targetPages} matching SCH_PAGE documents; one is required`);
    return inventory;
  }
  function projectSchematicAttributeInventory(text2, documentUuid) {
    if (!documentUuid || text2.length > 64 * 1024 * 1024) throw new Error("native project source is missing its target or exceeds 64 MiB");
    const rows = text2.split(/\r?\n/);
    if (rows.length > 2e5) throw new Error("native project source exceeds 200000 rows");
    let lastRow = rows.length - 1;
    while (lastRow >= 0 && !rows[lastRow].trim()) lastRow--;
    const attributes = /* @__PURE__ */ new Map();
    let target = false;
    let targetPages = 0;
    for (const [rowIndex, raw] of rows.entries()) {
      let line = raw.trim();
      if (!line) continue;
      const delimiter = line.indexOf("||");
      if (delimiter < 0) throw new Error("malformed native project source row");
      if (!line.endsWith("|")) {
        if (rowIndex !== lastRow) throw new Error("unterminated native project source row before EOF");
        JSON.parse(line.slice(delimiter + 2));
        line += "|";
      }
      const header = JSON.parse(line.slice(0, delimiter));
      if (header.type === "DOCHEAD") {
        const payload2 = JSON.parse(line.slice(delimiter + 2, -1));
        target = payload2.docType === "SCH_PAGE" && payload2.uuid === documentUuid;
        if (target) targetPages++;
        continue;
      }
      if (!target || header.type !== "ATTR") continue;
      const payload = JSON.parse(line.slice(delimiter + 2, -1));
      const id = header.id;
      const hasKeyVisible = Object.hasOwn(payload, "keyVisible");
      const hasValueVisible = Object.hasOwn(payload, "valueVisible");
      if (typeof id !== "string" || !id || typeof payload.key !== "string" || typeof payload.parentId !== "string" || !Object.hasOwn(payload, "value") || hasKeyVisible !== hasValueVisible || hasKeyVisible && payload.keyVisible !== null && typeof payload.keyVisible !== "boolean" || hasValueVisible && payload.valueVisible !== null && typeof payload.valueVisible !== "boolean") {
        throw new Error("native SCH_PAGE ATTR identity/visibility is incomplete");
      }
      if (attributes.has(id)) throw new Error(`duplicate native SCH_PAGE ATTR ${id}`);
      attributes.set(id, {
        id,
        key: payload.key,
        value: payload.value,
        parentId: payload.parentId,
        keyVisible: payload.keyVisible,
        valueVisible: payload.valueVisible
      });
      if (attributes.size > 2e5) throw new Error("native SCH_PAGE exceeds 200000 attributes");
    }
    if (targetPages !== 1) throw new Error(`native project contains ${targetPages} matching SCH_PAGE documents; one is required`);
    return attributes;
  }
  function readNativeFootprintSource(inventory, instanceUuid) {
    const object4 = (v) => v !== null && typeof v === "object" && !Array.isArray(v) ? v : void 0;
    if (!/^[0-9a-f]{16}$/i.test(instanceUuid) || !Array.isArray(inventory)) return { error: "native footprint source inventory unavailable" };
    const matching = inventory.filter((item) => object4(item)?.footprintUuid === instanceUuid);
    if (matching.length !== 1) return { error: `native footprint source inventory has ${matching.length} entries for ${instanceUuid}; one is required` };
    const text2 = object4(matching[0])?.documentSource;
    if (typeof text2 !== "string" || !text2.trim()) return { error: `native footprint source is empty for ${instanceUuid}` };
    let heads = 0;
    let metas = 0;
    let source;
    try {
      const rows = text2.split(/\r?\n/);
      let lastRow = rows.length - 1;
      while (lastRow >= 0 && !rows[lastRow].trim()) lastRow--;
      for (const [rowIndex, rawLine] of rows.entries()) {
        let line = rawLine.trim();
        if (!line) continue;
        const delimiter = line.indexOf("||");
        if (delimiter < 0 || !line.endsWith("|") && rowIndex !== lastRow) throw new Error("malformed native row");
        if (!line.endsWith("|")) line += "|";
        const header = object4(JSON.parse(line.slice(0, delimiter)));
        const payload = object4(JSON.parse(line.slice(delimiter + 2, -1)));
        if (!header || !payload) throw new Error("native row is not a pair of objects");
        if (header.type === "DOCHEAD") {
          heads++;
          if (heads !== 1 || payload.docType !== "FOOTPRINT" || payload.uuid !== instanceUuid) throw new Error("DOCHEAD does not identify exactly this footprint");
        } else if (header.type === "META") {
          metas++;
          if (heads !== 1 || metas !== 1) throw new Error("META must uniquely follow the footprint DOCHEAD");
          const parsed = typeof payload.source === "string" ? /^([0-9a-f]{32})\|([^|\s]+)$/i.exec(payload.source) : null;
          if (!parsed) throw new Error("META.source is not a 32-hex asset UUID and explicit library");
          source = {
            instanceUuid,
            uuid: parsed[1],
            libraryUuid: parsed[2],
            ...object4(matching[0])?.sourceKind === "project-epro2" ? { sourceKind: "project-epro2" } : {}
          };
        }
      }
      if (heads !== 1 || metas !== 1 || !source) throw new Error("footprint DOCHEAD/META.source evidence is incomplete");
      return { source };
    } catch (err) {
      return { error: `invalid native footprint source for ${instanceUuid}: ${err instanceof Error ? err.message : "parse failed"}` };
    }
  }
  function footprintMatchesInstance(instanceFootprint, candidate) {
    const instance = readDeviceFootprint({ footprint: instanceFootprint });
    const target = readDeviceFootprint(candidate);
    if (instance.libraryUuid && target.libraryUuid && instance.libraryUuid !== target.libraryUuid) return false;
    if (instance.uuid && target.uuid) return instance.uuid === target.uuid;
    return footprintNameEquals(instance.name, target.name);
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/deadlines.ts
  init_define_LOAD_ACTIONS();
  var entries = /* @__PURE__ */ new Set();
  function settle(entry) {
    if (entry.done) {
      return;
    }
    entry.done = true;
    entries.delete(entry);
    if (entry.timer !== void 0) {
      clearTimeout(entry.timer);
      entry.timer = void 0;
    }
  }
  function armDeadline(delayMs, fire) {
    const entry = {
      at: Date.now() + delayMs,
      fire,
      done: false,
      timer: void 0
    };
    entries.add(entry);
    const trip = () => {
      if (entry.done) {
        return;
      }
      settle(entry);
      entry.fire();
    };
    try {
      entry.timer = setTimeout(trip, Math.max(0, delayMs));
    } catch {
    }
    return {
      cancel() {
        settle(entry);
      }
    };
  }
  function sleep(ms) {
    return new Promise((resolve) => {
      armDeadline(ms, resolve);
    });
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/project-transfer.ts
  var ARCHIVE_LIMIT = 16 * 1024 * 1024;
  var pause = () => sleep(250);
  function fail(message) {
    throw new ActionError(ErrorCodes.EDA_CALL_FAILED, message);
  }
  function targetOf(payload) {
    const target = requireString(payload, "projectUuid");
    if (!target.trim()) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "projectUuid must not be blank.");
    return target;
  }
  async function assertProject(target) {
    const project = await eda.dmt_Project.getCurrentProjectInfo();
    if (!project || project.uuid !== target) fail("Active project does not match requested UUID; inspect state before retrying.");
    return project;
  }
  async function projectOpen(payload) {
    const target = targetOf(payload);
    if (payload.allowDiscardUnsaved !== true) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Save all documents first and explicitly pass allowDiscardUnsaved:true.");
    }
    const pageUUID = payload.pageUuid === void 0 ? void 0 : requireString(payload, "pageUuid");
    if (pageUUID !== void 0 && !pageUUID.trim()) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "pageUuid must not be blank.");
    if (!await eda.dmt_Project.openProject(target)) fail("Official openProject returned false; inspect state before retrying.");
    let project;
    for (let i = 0; i < 40; i++) {
      project = await eda.dmt_Project.getCurrentProjectInfo();
      if (project?.uuid === target) break;
      if (i === 39) fail("Opened project identity did not settle; inspect state before retrying.");
      await pause();
    }
    let document;
    if (pageUUID) {
      let found = false;
      for (let i = 0; i < 40; i++) {
        await assertProject(target);
        const pages = await eda.dmt_Schematic.getAllSchematicPagesInfo();
        if (Array.isArray(pages) && pages.some((p) => p.uuid === pageUUID)) {
          found = true;
          break;
        }
        await pause();
      }
      if (!found) fail("Project opened but requested schematic page is unavailable; do not repeat project creation.");
      await assertProject(target);
      if (!await eda.dmt_EditorControl.openDocument(pageUUID)) fail("Project opened but page open failed; inspect state before retrying.");
      for (let i = 0; i < 40; i++) {
        await assertProject(target);
        document = await eda.dmt_SelectControl.getCurrentDocumentInfo();
        if (document?.uuid === pageUUID && document?.parentProjectUuid === target) break;
        if (i === 39) fail("Project opened but page identity did not settle.");
        await pause();
      }
    }
    await assertProject(target);
    return { result: {
      uuid: target,
      friendlyName: project?.friendlyName,
      opened: true,
      verified: true,
      ...document ? { documentUuid: document.uuid, documentVerified: true } : {}
    } };
  }
  var IMPORT_OPTIONS = ["ImportDocument", "ImportDocumentExtractLibraries"];
  var IMPORT_TIMEOUT_MS = 12e4;
  async function projectImport(payload) {
    const fileName = requireString(payload, "fileName");
    const encoded = requireString(payload, "base64");
    const friendlyName = requireString(payload, "friendlyName");
    if (!fileName.trim() || !friendlyName.trim()) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "fileName and friendlyName must not be blank.");
    const importOption = payload.importOption === void 0 ? "ImportDocument" : requireString(payload, "importOption");
    if (!IMPORT_OPTIONS.includes(importOption)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `importOption must be one of ${IMPORT_OPTIONS.join(", ")}.`);
    if (encoded.length > Math.ceil(ARCHIVE_LIMIT / 3) * 4) fail("Project file exceeds 16 MiB transport limit.");
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    if (!bytes.length || bytes.length > ARCHIVE_LIMIT) fail("Project file empty or exceeds 16 MiB transport limit.");
    let teamUuid = payload.teamUuid === void 0 ? void 0 : requireString(payload, "teamUuid");
    if (!teamUuid) teamUuid = (await eda.dmt_Project.getCurrentProjectInfo())?.teamUuid;
    if (!teamUuid) fail("No teamUuid given and the active project has none; pass teamUuid explicitly.");
    const file = new File([bytes], fileName);
    let timer;
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        "Project import did not settle; outcome unknown. List projects by friendlyName before retrying."
      )), IMPORT_TIMEOUT_MS);
    });
    let brief;
    try {
      brief = await Promise.race([eda.sys_FileManager.importProjectByProjectFile(
        file,
        "EasyEDA Pro",
        { importOption },
        { operation: "New Project", newProjectOwnerTeamUuid: teamUuid, newProjectFriendlyName: friendlyName }
      ), deadline]);
    } finally {
      clearTimeout(timer);
    }
    if (!brief?.uuid) fail("Official project import returned no project; outcome unknown (issue #203). Run project find by friendlyName before retrying.");
    const info = await eda.dmt_Project.getProjectInfo(brief.uuid);
    if (!info || info.uuid !== brief.uuid) fail("Imported project is not readable by UUID; inspect project list before retrying.");
    return { result: {
      uuid: info.uuid,
      friendlyName: info.friendlyName,
      teamUuid: info.teamUuid,
      importOption,
      bytes: bytes.length,
      created: true,
      verified: true,
      contentVerified: false
    } };
  }
  async function projectExport(payload) {
    const target = targetOf(payload);
    await assertProject(target);
    const file = await eda.sys_FileManager.getProjectFile("project.epro2", void 0, "epro2");
    if (!file || typeof file.arrayBuffer !== "function") fail("Official project export returned no file.");
    if (!file.size || file.size > ARCHIVE_LIMIT) fail("Project archive empty or exceeds 16 MiB transport limit.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!bytes.length || bytes.length > ARCHIVE_LIMIT || bytes.length !== file.size) fail("Project archive size changed while reading.");
    await assertProject(target);
    return { result: { uuid: target, format: "epro2", size: bytes.length, base64: uint8ToBase64(bytes) } };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/pcb-export-3d.ts
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/eda-context.ts
  init_define_LOAD_ACTIONS();
  function documentTypeLabel(documentType) {
    if (documentType === void 0) {
      return void 0;
    }
    switch (documentType) {
      case EDMT_EditorDocumentType.HOME:
        return "home";
      case EDMT_EditorDocumentType.BLANK:
        return "blank";
      case EDMT_EditorDocumentType.SCHEMATIC_PAGE:
        return "schematic";
      case EDMT_EditorDocumentType.PCB:
        return "pcb";
      case EDMT_EditorDocumentType.SYMBOL_COMPONENT:
        return "symbol";
      case EDMT_EditorDocumentType.FOOTPRINT:
        return "footprint";
      case EDMT_EditorDocumentType.PANEL:
        return "panel";
      default:
        return `type_${documentType}`;
    }
  }
  function pageVisibility() {
    try {
      const state = globalThis.window?.document?.visibilityState;
      return typeof state === "string" ? state : void 0;
    } catch {
      return void 0;
    }
  }
  async function readResponseContext() {
    const context = {};
    const visibility = pageVisibility();
    if (visibility) context.pageVisibility = visibility;
    try {
      const project = await eda.dmt_Project.getCurrentProjectInfo();
      if (project) {
        context.projectUuid = project.uuid;
        context.projectName = project.friendlyName || project.name;
      }
    } catch {
    }
    try {
      const doc = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (doc) {
        context.documentUuid = doc.uuid;
        context.tabId = doc.tabId;
        const label = documentTypeLabel(doc.documentType);
        if (label) {
          context.documentType = label;
        }
      }
    } catch {
    }
    return context;
  }
  function mutationContextError(before, after) {
    for (const field of ["projectUuid", "documentUuid", "documentType"]) {
      if (typeof before[field] !== "string" || !before[field].trim() || typeof after[field] !== "string" || !after[field].trim()) {
        return `handler-boundary ${field} unavailable`;
      }
      if (before[field] !== after[field]) return `handler-boundary ${field} changed`;
    }
    const beforeTab = before.tabId, afterTab = after.tabId;
    const absent = (value) => value === void 0 || value === null || value === "";
    if (absent(beforeTab) && absent(afterTab)) return void 0;
    if (typeof beforeTab !== "string" || !beforeTab.trim() || typeof afterTab !== "string" || !afterTab.trim()) return "handler-boundary tabId unavailable on one side";
    if (beforeTab !== afterTab) return "handler-boundary tabId changed";
    return void 0;
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/pcb-export-3d.ts
  var MAX_3D_BYTES = 20 * 1024 * 1024;
  var ELEMENTS = ["Component Model", "Via", "Silkscreen", "Wire In Signal Layer"];
  async function pcbExport3D(payload) {
    const allowed = ["fileType", "fileName", "modelMode", "autoGenerateModels", "elements"];
    if (Object.keys(payload).some((k) => !allowed.includes(k))) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "Unknown 3D export option.");
    const fileType = payload.fileType ?? "obj", modelMode = payload.modelMode ?? "Outfit";
    const autoGenerateModels = payload.autoGenerateModels ?? false;
    const fileName = payload.fileName ?? `board.${fileType}`;
    const elements = payload.elements ?? ["Component Model"];
    if (typeof fileType !== "string" || !["obj", "step"].includes(fileType) || !["Outfit", "Parts"].includes(modelMode) || typeof autoGenerateModels !== "boolean" || typeof fileName !== "string" || !fileName.trim() || fileName.length > 128 || /[\\/\x00-\x1f]/.test(fileName) || !Array.isArray(elements) || !elements.length || elements.length > ELEMENTS.length || new Set(elements).size !== elements.length || elements.some((e) => !ELEMENTS.includes(e))) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "Use fileType=obj|step, modelMode=Outfit|Parts, a basename, boolean autoGenerateModels and unique official element names.");
    }
    const before = await readResponseContext();
    if (before.documentType !== "pcb" || !before.projectUuid || !before.documentUuid) {
      throw new ActionError(ErrorCodes.INVALID_STATE, "Activate the target PCB before exporting 3D.");
    }
    if (typeof eda.pcb_ManufactureData?.get3DFile !== "function") {
      throw new ActionError(ErrorCodes.EDA_API_UNAVAILABLE, "This host does not expose pcb_ManufactureData.get3DFile.");
    }
    const readModels = async () => {
      const components = await eda.pcb_PrimitiveComponent.getAll();
      if (!Array.isArray(components) || !components.length) throw new ActionError(ErrorCodes.INVALID_STATE, "No readable PCB components.");
      return components.map((c) => {
        const primitiveId = c.getState_PrimitiveId(), ref = c.getState_Designator();
        try {
          const model = c.getState_Model3D();
          return { primitiveId, ref, status: model?.uuid ? "bound" : "unbound", model: model ?? null };
        } catch {
          return { primitiveId, ref, status: "unknown", model: null };
        }
      }).sort((a, b) => a.primitiveId.localeCompare(b.primitiveId));
    };
    const models = await readModels();
    const file = await eda.pcb_ManufactureData.get3DFile(
      fileName,
      fileType,
      elements,
      modelMode,
      autoGenerateModels
    );
    if (!file) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Official ${fileType.toUpperCase()} export returned no file. Try OBJ; STEP requires STEP source component models.`);
    if (!file.size) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Official ${fileType.toUpperCase()} export returned an empty file. Try OBJ or inspect the source models.`);
    if (file.size > MAX_3D_BYTES) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Official ${fileType.toUpperCase()} export is ${file.size} bytes, exceeding the 20 MiB transport limit. Try OBJ or reduce model complexity.`, JSON.stringify({ fileType, size: file.size, limit: MAX_3D_BYTES }));
    const modelsAfter = await readModels();
    const after = await readResponseContext();
    const drift = mutationContextError(before, after);
    if (drift) throw new ActionError(ErrorCodes.INVALID_STATE, `3D export target changed: ${drift}. No artifact accepted.`);
    if (JSON.stringify(models) !== JSON.stringify(modelsAfter)) throw new ActionError(ErrorCodes.INVALID_STATE, "Component model bindings changed during 3D export. No artifact accepted.");
    const id = newArtifactId();
    return {
      result: {
        artifactId: id,
        fileType,
        fileName: file.name || fileName,
        size: file.size,
        modelMode,
        elements,
        autoGenerateModels,
        exportContext: before,
        models,
        modelCoverage: "binding-only",
        modelCoverageNote: "A bound model is not proof the host included it. Unbound models are omitted unless automatic placeholders were requested. STEP includes only STEP source models."
      },
      artifacts: [{
        id,
        kind: "pcb_3d",
        fileName: file.name || fileName,
        mimeType: file.type || "application/octet-stream",
        inlineBase64: await blobToBase64(file)
      }],
      warnings: ["3D geometry and model inclusion require independent inspection; this export does not verify manufacturing or electrical correctness."]
    };
  }
  async function pcbExport3DShell(payload) {
    if (Object.keys(payload).some((k) => !["fileType", "fileName"].includes(k))) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "Unknown 3D shell export option.");
    const fileType = payload.fileType ?? "stl";
    const fileName = payload.fileName ?? `shell.${fileType}`;
    if (typeof fileType !== "string" || !["stl", "step", "obj"].includes(fileType) || typeof fileName !== "string" || !fileName.trim() || fileName.length > 128 || /[\\/\x00-\x1f]/.test(fileName)) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "Use fileType=stl|step|obj and a basename.");
    }
    const before = await readResponseContext();
    if (before.documentType !== "pcb" || !before.projectUuid || !before.documentUuid) {
      throw new ActionError(ErrorCodes.INVALID_STATE, "Activate the target PCB before exporting its 3D shell.");
    }
    if (typeof eda.pcb_ManufactureData?.get3DShellFile !== "function") {
      throw new ActionError(ErrorCodes.EDA_API_UNAVAILABLE, "This host does not expose pcb_ManufactureData.get3DShellFile.");
    }
    const file = await eda.pcb_ManufactureData.get3DShellFile(fileName, fileType);
    if (!file || !file.size) throw new ActionError(ErrorCodes.INVALID_STATE, "This PCB has no 3D shell to export (design it in the EasyEDA shell editor first; the API cannot create one).");
    if (file.size > MAX_3D_BYTES) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `3D shell export is ${file.size} bytes, exceeding the 20 MiB transport limit.`);
    const drift = mutationContextError(before, await readResponseContext());
    if (drift) throw new ActionError(ErrorCodes.INVALID_STATE, `3D shell export target changed: ${drift}. No artifact accepted.`);
    const id = newArtifactId();
    return {
      result: { artifactId: id, fileType, fileName: file.name || fileName, size: file.size, exportContext: before },
      artifacts: [{
        id,
        kind: "pcb_3d_shell",
        fileName: file.name || fileName,
        mimeType: file.type || "application/octet-stream",
        inlineBase64: await blobToBase64(file)
      }]
    };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/pcb-model3d.ts
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/projected-keys.ts
  init_define_LOAD_ACTIONS();
  var PROJECTED_STATE_KEYS = /* @__PURE__ */ new Set([
    "Designator",
    "Unique ID",
    "Name",
    "Add into BOM",
    "Manufacturer",
    "Manufacturer Part",
    "Supplier",
    "Supplier Part"
  ]);

  // .cache/loads/eda@7a73a6834d8d/extension/src/pcb-model3d.ts
  var TRANSFORM_KEY = "3D Model Transform";
  var AXES = ["x", "y", "z"];
  var GROUPS = ["size", "rotation", "offset"];
  function parseTransform(raw) {
    if (typeof raw !== "string") return void 0;
    const parts = raw.split(",");
    if (parts.length !== 9 || parts.some((p) => p.trim() === "")) return void 0;
    const n = parts.map(Number);
    if (n.some((v) => !Number.isFinite(v))) return void 0;
    const vec = (i) => ({ x: n[i], y: n[i + 1], z: n[i + 2] });
    return { size: vec(0), rotation: vec(3), offset: vec(6) };
  }
  var fmt = (v) => String(Math.round(v * 1e4) / 1e4);
  function formatTransform(t) {
    return GROUPS.flatMap((g) => AXES.map((a) => fmt(t[g][a]))).join(",");
  }
  function applyTransformPatch(t, patch) {
    const next = JSON.parse(JSON.stringify(t));
    for (const g of GROUPS) for (const a of AXES) {
      const v = patch[g]?.[a];
      if (v !== void 0) next[g][a] = v;
    }
    return next;
  }
  function normalizePatch(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing object "patch" ({size?,rotation?,offset?} with x/y/z numbers).');
    const patch = {};
    let count = 0;
    for (const [g, vec] of Object.entries(raw)) {
      if (!GROUPS.includes(g) || !vec || typeof vec !== "object" || Array.isArray(vec)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Unknown or malformed patch group "${g}".`);
      const out = {};
      for (const [a, v] of Object.entries(vec)) {
        if (!AXES.includes(a) || typeof v !== "number" || !Number.isFinite(v)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `patch.${g}.${a} must be a finite number.`);
        out[a] = v;
        count++;
      }
      patch[g] = out;
    }
    if (!count) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "patch must set at least one size/rotation/offset axis.");
    return patch;
  }
  function otherProps(c) {
    try {
      return c.getState_OtherProperty() ?? {};
    } catch {
      return void 0;
    }
  }
  function describe(c) {
    const props = otherProps(c);
    let model = null;
    let status = "unknown";
    try {
      const m = c.getState_Model3D();
      status = m?.uuid ? "bound" : "unbound";
      if (m?.uuid) model = { uuid: m.uuid.split("|")[0], libraryUuid: m.libraryUuid, name: m.name ?? null, raw: m.uuid };
    } catch {
    }
    const rawTransform = props?.[TRANSFORM_KEY];
    const parsed = parseTransform(rawTransform);
    let footprint = null;
    try {
      footprint = c.getState_Footprint() ?? null;
    } catch {
    }
    return {
      primitiveId: c.getState_PrimitiveId(),
      designator: c.getState_Designator() ?? null,
      layer: c.getState_Layer(),
      footprint,
      model,
      status,
      transform: parsed ? { raw: rawTransform, ...parsed } : null,
      transformStatus: props === void 0 ? "unknown" : rawTransform === void 0 || rawTransform === "" ? "missing" : parsed ? "ok" : "malformed",
      height: typeof props?.Height === "string" && props.Height ? props.Height : null
    };
  }
  async function requirePcb() {
    const ctx = await readResponseContext();
    if (ctx.documentType !== "pcb") throw new ActionError(ErrorCodes.INVALID_STATE, "Activate the target PCB before reading or editing 3D models.");
    const all = await eda.pcb_PrimitiveComponent.getAll();
    if (!Array.isArray(all)) throw new ActionError(ErrorCodes.INVALID_STATE, "PCB component inventory unavailable.");
    return all;
  }
  async function pcbModel3dList(payload) {
    if (Object.keys(payload).length) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "pcb.model3d.list takes no payload; filter on the CLI side.");
    const components = (await requirePcb()).map(describe).sort((a, b) => String(a.designator).localeCompare(String(b.designator), void 0, { numeric: true }));
    const count = (s) => components.filter((c) => c.status === s).length;
    return { result: {
      components,
      summary: { total: components.length, bound: count("bound"), unbound: count("unbound"), unknown: count("unknown") },
      transformUnit: "mil",
      rotationUnit: "deg",
      transformMapping: "inferred"
    } };
  }
  async function pcbModel3dSetTransform(payload) {
    const patch = normalizePatch(payload.patch);
    const dryRun = payload.dryRun === true;
    const { designator, comp, primitiveId, before } = await targetComponent(payload);
    const current = parseTransform(before[TRANSFORM_KEY]);
    if (!current) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${designator} has no readable "${TRANSFORM_KEY}" (${JSON.stringify(before[TRANSFORM_KEY] ?? null)}); bind a model first. Nothing written.`);
    const next = applyTransformPatch(current, patch);
    const written = formatTransform(next);
    const base = { designator, primitiveId, before: formatTransform(current), after: written, transform: next, unit: "mil", rotationUnit: "deg" };
    if (written === base.before) return { result: { ...base, noop: true, verified: true } };
    if (dryRun) return { result: { ...base, dryRun: true } };
    const problems = await writeOwnKeys(comp, designator, before, { [TRANSFORM_KEY]: written });
    if (problems.length) return partial(base, problems, before);
    return { result: { ...base, verified: true } };
  }
  function partial(base, problems, before) {
    return {
      result: { ...base, partial: true, verified: false, problems, otherPropertyBefore: before },
      warnings: ["Readback differs from the requested change; do not retry blindly \u2014 restore from otherPropertyBefore if needed."]
    };
  }
  async function writeOwnKeys(comp, designator, before, changes) {
    const primitiveId = comp.getState_PrimitiveId();
    const merged = {};
    for (const [k, v] of Object.entries(before)) if (!PROJECTED_STATE_KEYS.has(k)) merged[k] = v;
    Object.assign(merged, changes);
    try {
      await eda.pcb_PrimitiveComponent.modify(primitiveId, { designator, otherProperty: merged });
    } catch (err) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `modify failed for ${designator}; inspect with pcb 3d models before retrying.`, String(err));
    }
    const fresh = await eda.pcb_PrimitiveComponent.get(primitiveId);
    const after = fresh ? otherProps(fresh) : void 0;
    if (!fresh || !after) return ["fresh readback unavailable"];
    const problems = [];
    if (fresh.getState_Designator() !== designator) problems.push(`designator now ${JSON.stringify(fresh.getState_Designator())}`);
    for (const k of /* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(after), ...Object.keys(changes)])) {
      if (PROJECTED_STATE_KEYS.has(k)) continue;
      const want = k in changes ? changes[k] : before[k];
      if (JSON.stringify(want) !== JSON.stringify(after[k])) problems.push(k in changes ? `"${k}" reads ${JSON.stringify(after[k])}` : `otherProperty "${k}" changed`);
    }
    return problems;
  }
  async function targetComponent(payload) {
    const designator = payload.designator;
    if (typeof designator !== "string" || !designator.trim()) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing required string "designator".');
    const matches = (await requirePcb()).filter((c) => c.getState_Designator() === designator);
    if (matches.length !== 1) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Designator "${designator}" matches ${matches.length} PCB components; need exactly one.`);
    const comp = matches[0];
    const before = otherProps(comp);
    if (!before) throw new ActionError(ErrorCodes.INVALID_STATE, `Cannot read otherProperty of ${designator}; nothing written.`);
    return { designator, comp, primitiveId: comp.getState_PrimitiveId(), before };
  }
  var MODEL_KEY = "3D Model";
  var MODEL_TITLE_KEY = "3D Model Title";
  async function pcbModel3dBind(payload) {
    const raw = payload.model;
    if (!raw || typeof raw.uuid !== "string" || !raw.uuid || raw.uuid.includes("|") || typeof raw.libraryUuid !== "string" || !raw.libraryUuid) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing object "model" {uuid, libraryUuid} (plain UUIDs).');
    }
    const uuid = raw.uuid, libraryUuid2 = raw.libraryUuid;
    const { designator, comp, primitiveId, before } = await targetComponent(payload);
    const model = await eda.lib_3DModel.get(uuid, libraryUuid2);
    if (!model) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `3D model ${uuid} not found in library ${libraryUuid2}; nothing written.`);
    const value = `${uuid}|${libraryUuid2}`;
    const base = {
      designator,
      primitiveId,
      model: { uuid, libraryUuid: libraryUuid2, name: model.name },
      previous: { [MODEL_KEY]: before[MODEL_KEY] ?? null, [MODEL_TITLE_KEY]: before[MODEL_TITLE_KEY] ?? null }
    };
    if (before[MODEL_KEY] === value && before[MODEL_TITLE_KEY] === model.name) return { result: { ...base, noop: true, verified: true } };
    if (payload.dryRun === true) return { result: { ...base, dryRun: true } };
    const problems = await writeOwnKeys(comp, designator, before, { [MODEL_KEY]: value, [MODEL_TITLE_KEY]: model.name });
    const fresh = await eda.pcb_PrimitiveComponent.get(primitiveId);
    let bound;
    try {
      bound = fresh?.getState_Model3D();
    } catch {
    }
    if (bound?.uuid?.split("|")[0] !== uuid || bound?.libraryUuid !== libraryUuid2) problems.push(`getState_Model3D reads ${JSON.stringify(bound ?? null)}`);
    if (problems.length) return partial(base, problems, before);
    return {
      result: { ...base, verified: true },
      warnings: ["Model placement was kept from the previous binding; review size/offset with pcb 3d models."]
    };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/schematic-attribute-move.ts
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/preserve-instance.ts
  init_define_LOAD_ACTIONS();
  var PRESERVED_INSTANCE_FIELDS = [
    "primitiveId",
    "designator",
    "uniqueId",
    "name",
    "subPartName",
    "addIntoBom",
    "addIntoPcb",
    "manufacturer",
    "manufacturerId",
    "supplier",
    "supplierId",
    "otherProperty",
    "component",
    "symbol",
    "footprint"
  ];
  function exactJSON(value) {
    if (Array.isArray(value)) return "[" + value.map(exactJSON).join(",") + "]";
    if (value !== null && typeof value === "object") return "{" + Object.keys(value).sort().map((k) => JSON.stringify(k) + ":" + exactJSON(value[k])).join(",") + "}";
    return JSON.stringify(value);
  }
  function preservedInstance(record3, pose = false) {
    const out = {};
    for (const key of [...PRESERVED_INSTANCE_FIELDS, ...pose ? ["x", "y", "rotation", "mirror"] : []]) {
      if (!(key in record3) || record3[key] === void 0) throw new Error(`instance ${String(record3.primitiveId)} field ${key} unavailable`);
      out[key] = record3[key];
    }
    for (const key of ["primitiveId", "designator"]) {
      if (typeof out[key] !== "string" || !String(out[key]).trim()) throw new Error(`instance ${key} must be nonempty`);
    }
    if (typeof out.uniqueId !== "string") throw new Error("instance uniqueId must be a string");
    for (const key of ["name", "subPartName", "manufacturer", "manufacturerId", "supplier", "supplierId"]) {
      if (out[key] !== null && typeof out[key] !== "string") throw new Error(`instance ${key} must be string or explicit null`);
    }
    for (const key of ["addIntoBom", "addIntoPcb"]) if (typeof out[key] !== "boolean") throw new Error(`instance ${key} must be boolean`);
    for (const key of ["otherProperty", "component", "symbol", "footprint"]) {
      if (!out[key] || typeof out[key] !== "object" || Array.isArray(out[key])) throw new Error(`instance ${key} must be an object`);
    }
    for (const [key, value] of Object.entries(out.otherProperty)) {
      if (!["string", "number", "boolean"].includes(typeof value) || typeof value === "number" && !Number.isFinite(value)) throw new Error(`instance otherProperty.${key} has unsupported type`);
    }
    if (pose && (["x", "y", "rotation"].some((k) => typeof out[k] !== "number" || !Number.isFinite(out[k])) || typeof out.mirror !== "boolean")) throw new Error("instance pose unavailable");
    return JSON.parse(JSON.stringify(out));
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/schematic-attribute-move.ts
  async function moveSchematicAttribute(payload, readState) {
    const refuse3 = (message) => {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, message);
    };
    const keys = /* @__PURE__ */ new Set(["projectUuid", "documentUuid", "primitiveId", "expected", "x", "y"]);
    if (Object.keys(payload).some((key) => !keys.has(key))) refuse3("Attribute move accepts only bound identity, expected state, x and y.");
    for (const key of ["projectUuid", "documentUuid", "primitiveId"]) {
      if (typeof payload[key] !== "string" || !payload[key].trim()) refuse3(`Attribute move requires ${key}.`);
    }
    for (const key of ["x", "y"]) if (typeof payload[key] !== "number" || !Number.isFinite(payload[key])) refuse3(`Attribute move ${key} must be finite.`);
    const expected = payload.expected;
    if (!expected || typeof expected !== "object" || Array.isArray(expected) || expected.primitiveId !== payload.primitiveId || typeof expected.ParentPrimitiveId !== "string" || !expected.ParentPrimitiveId.trim() || !["Name", "Designator"].includes(expected.Key)) refuse3("Attribute move requires the complete original Name/Designator state.");
    const identityBefore = await readResponseContext();
    if (identityBefore.projectUuid !== payload.projectUuid || identityBefore.documentUuid !== payload.documentUuid || identityBefore.documentType !== "schematic" || !identityBefore.tabId) refuse3("Attribute move requires the exact active schematic context.");
    const id = payload.primitiveId;
    const attribute = await eda.sch_PrimitiveAttribute.get(id);
    if (!attribute || attribute.getState_PrimitiveId() !== id) refuse3("Attribute move target is missing or has a different ID.");
    const before = await readState(attribute);
    if (exactJSON(before) !== exactJSON(expected)) refuse3("Attribute move original state changed or expected state is incomplete.");
    const parent = await eda.sch_PrimitiveComponent.get(expected.ParentPrimitiveId);
    if (!parent || parent.getState_PrimitiveId() !== expected.ParentPrimitiveId || String(parent.getState_ComponentType()) !== "part") refuse3("Attribute move supports only an existing placed part attribute.");
    const prewrite = await readResponseContext();
    if (mutationContextError(identityBefore, prewrite) || !prewrite.tabId) refuse3("Attribute move context changed before write.");
    const requested = { x: payload.x, y: payload.y };
    const moved = before.X !== requested.x || before.Y !== requested.y;
    const errors = [];
    let attempted = false;
    if (moved) {
      attempted = true;
      try {
        const ack = await eda.sch_PrimitiveAttribute.modify(id, requested);
        if (!ack) errors.push("modify returned no attribute; the write may have applied");
      } catch (error) {
        errors.push(`modify failed; the write may have applied: ${String(error)}`);
      }
    }
    let after;
    try {
      const fresh = await eda.sch_PrimitiveAttribute.get(id);
      if (!fresh || fresh.getState_PrimitiveId() !== id) throw new Error("fresh attribute is missing or has a different ID");
      after = await readState(fresh);
      if (exactJSON(after) !== exactJSON({ ...before, X: requested.x, Y: requested.y })) errors.push("fresh attribute coordinates or preserved state differ from requested result");
    } catch (error) {
      errors.push(`fresh read failed: ${String(error)}`);
    }
    const identityAfter = await readResponseContext();
    const drift = mutationContextError(identityBefore, identityAfter);
    if (drift || !identityAfter.tabId) errors.push(`attribute move context changed: ${drift ?? "missing tabId"}`);
    const verified = errors.length === 0;
    return {
      result: {
        scope: "attribute-position-only",
        primitiveId: id,
        requested,
        before,
        after: after ?? null,
        identityBefore,
        identityAfter,
        attempted,
        moved,
        preserved: verified,
        verified,
        partial: !verified,
        errors
      },
      ...verified ? {} : { warnings: ["Attribute position is not fully verified; retain this response and fresh state. Do not retry automatically."] }
    };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/document-source.ts
  init_define_LOAD_ACTIONS();
  var SOURCE_LIMIT = 2 * 1024 * 1024;
  var READ_TIMEOUT_MS = 1e4;
  var SCHEMA_VERSION = 1;
  function refuse(message) {
    throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, message);
  }
  function fields(value, allowed, name2) {
    for (const key of Object.keys(value)) if (!allowed.includes(key)) refuse(`Unknown ${name2} field: ${key}.`);
  }
  function targetRequest(payload) {
    const projectUuid = requireString(payload, "projectUuid");
    const documentUuid = requireString(payload, "documentUuid");
    if (projectUuid !== projectUuid.trim() || documentUuid !== documentUuid.trim()) refuse("Target UUIDs must not contain surrounding whitespace.");
    return { projectUuid, documentUuid };
  }
  function checkedSource(value) {
    if (typeof value !== "string" || !value.trim()) {
      throw new ActionError(ErrorCodes.INVALID_STATE, "Official document source is empty or does not use the supported string schema.");
    }
    if (value.length > SOURCE_LIMIT || new TextEncoder().encode(value).length > SOURCE_LIMIT) {
      throw new ActionError(ErrorCodes.INVALID_STATE, "Document source exceeds the 2 MiB UTF-8 limit.");
    }
    return value;
  }
  async function boundedRead(label, read) {
    let deadline;
    try {
      return await Promise.race([
        Promise.resolve().then(read),
        new Promise((_, reject) => {
          deadline = armDeadline(READ_TIMEOUT_MS, () => reject(new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `${label} did not settle within ${READ_TIMEOUT_MS} ms; inspect state before retrying.`
          )));
        })
      ]);
    } finally {
      deadline?.cancel();
    }
  }
  async function contextFor(requested, expectedType) {
    const context = await boundedRead("Document identity read", readResponseContext);
    if (context.projectUuid !== requested.projectUuid || context.documentUuid !== requested.documentUuid) {
      refuse("Active project/document identity does not match the explicit target, or changed during the probe.");
    }
    if (context.documentType !== "schematic" && context.documentType !== "pcb") {
      refuse("Document source probes support only schematic or PCB documents with readable identity.");
    }
    if (expectedType !== void 0 && context.documentType !== expectedType) refuse("Active document type changed during the source probe.");
    return { ...requested, documentType: context.documentType };
  }
  function sourceManager() {
    const manager = typeof eda === "undefined" ? void 0 : eda.sys_FileManager;
    const availability = {
      getDocumentSource: typeof manager?.getDocumentSource === "function",
      setDocumentSource: typeof manager?.setDocumentSource === "function"
    };
    return { manager, availability };
  }
  function requireGetter(manager) {
    if (typeof manager?.getDocumentSource !== "function") {
      throw new ActionError(ErrorCodes.EDA_API_UNAVAILABLE, "Official sys_FileManager.getDocumentSource is unavailable.");
    }
    return manager;
  }
  async function freshSource(manager) {
    const readable = requireGetter(manager);
    return checkedSource(await boundedRead("Document source read", () => readable.getDocumentSource()));
  }
  function snapshotOf(payload, requested) {
    const value = payload.snapshot;
    if (!value || typeof value !== "object" || Array.isArray(value)) refuse("A document source snapshot is required for exact fresh-source comparison.");
    const snapshot = value;
    fields(snapshot, ["schemaVersion", "projectUuid", "documentUuid", "documentType", "source"], "snapshot");
    if (snapshot.schemaVersion !== SCHEMA_VERSION) refuse("Unsupported document source snapshot schemaVersion; expected 1.");
    if (snapshot.projectUuid !== requested.projectUuid || snapshot.documentUuid !== requested.documentUuid) refuse("Snapshot project/document UUIDs do not match the explicit target.");
    if (snapshot.documentType !== "schematic" && snapshot.documentType !== "pcb") refuse("Snapshot documentType must be schematic or pcb.");
    let source;
    try {
      source = checkedSource(snapshot.source);
    } catch (err) {
      refuse(`Invalid snapshot source: ${describeThrown(err)}`);
    }
    return { ...requested, documentType: snapshot.documentType, source };
  }
  function comparisonOf(payload) {
    if (payload.comparison === void 0) return "exact";
    if (payload.comparison !== "exact" && payload.comparison !== "dochead-volatile-v1") {
      refuse("comparison must be exact or dochead-volatile-v1.");
    }
    return payload.comparison;
  }
  function compareSource(source, target, comparison) {
    if (comparison === "exact") return { projection: source };
    if (target.documentType !== "schematic") refuse("dochead-volatile-v1 supports only schematic documents.");
    const header = /^(\{"type":"DOCHEAD"\}\|\|\{"docType":"SCH_PAGE","client":")([0-9a-f]{16})(","uuid":")([0-9a-f]{16})(","updateTime":)([0-9]{13})(,"version":")([0-9]{13})(","editVersion":"[0-9]+\.[0-9]+\.[0-9]+"\}\|)(\r?\n)/.exec(source);
    if (!header) refuse("Document source does not match the narrow dochead-volatile-v1 header byte grammar.");
    if (header[4] !== target.documentUuid) refuse("DOCHEAD uuid does not match the explicit document target.");
    const updateTime = Number(header[6]);
    if (header[6] !== String(updateTime) || header[8] !== String(updateTime)) {
      refuse("DOCHEAD version must equal the 13-digit updateTime integer.");
    }
    const body = source.slice(header[0].length);
    if (body.includes("DOCHEAD")) refuse("Additional DOCHEAD text in the document body is unsupported.");
    return {
      projection: header[1] + "<client>" + header[3] + header[4] + header[5] + "<updateTime>" + header[7] + "<version>" + header[9] + header[10] + body,
      volatile: { client: header[2], updateTime, version: header[8] }
    };
  }
  async function documentSourceGet(payload) {
    fields(payload, ["projectUuid", "documentUuid"], "document source get");
    const requested = targetRequest(payload);
    const target = await contextFor(requested);
    const { manager, availability } = sourceManager();
    const source = await freshSource(requireGetter(manager));
    await contextFor(requested, target.documentType);
    return { result: {
      schemaVersion: SCHEMA_VERSION,
      target,
      availability,
      source,
      bytes: new TextEncoder().encode(source).length,
      verified: true,
      partial: false,
      incomplete: false
    }, context: target };
  }
  async function documentSourceRoundtrip(payload) {
    fields(payload, ["projectUuid", "documentUuid", "snapshot", "dryRun", "comparison"], "document source roundtrip");
    if (payload.dryRun !== void 0 && typeof payload.dryRun !== "boolean") refuse("dryRun must be a boolean.");
    const comparison = comparisonOf(payload);
    const requested = targetRequest(payload);
    const snapshot = snapshotOf(payload, requested);
    const snapshotComparison = compareSource(snapshot.source, snapshot, comparison);
    const target = await contextFor(requested, snapshot.documentType);
    const { manager, availability } = sourceManager();
    const readable = requireGetter(manager);
    if (typeof readable.setDocumentSource !== "function") {
      throw new ActionError(ErrorCodes.EDA_API_UNAVAILABLE, "Official sys_FileManager.setDocumentSource is unavailable.");
    }
    const beforeSource = await freshSource(readable);
    await contextFor(requested, target.documentType);
    const beforeComparison = compareSource(beforeSource, target, comparison);
    if (beforeComparison.projection !== snapshotComparison.projection) refuse("Fresh document source differs from the snapshot under the declared comparison; no source was written.");
    const base = {
      schemaVersion: SCHEMA_VERSION,
      target,
      availability,
      beforeSource,
      comparison,
      rawBeforeEqualsSnapshot: beforeSource === snapshot.source,
      ...comparison === "dochead-volatile-v1" ? { snapshotVolatile: snapshotComparison.volatile, beforeVolatile: beforeComparison.volatile } : {}
    };
    if (payload.dryRun === true) return { result: {
      ...base,
      dryRun: true,
      afterSource: beforeSource,
      rawAfterEqualsBefore: true,
      ...comparison === "dochead-volatile-v1" ? { afterVolatile: beforeComparison.volatile } : {},
      writeAttempted: false,
      written: false,
      verified: true,
      partial: false,
      incomplete: false
    }, context: target };
    await contextFor(requested, target.documentType);
    let written = null;
    let writeError;
    try {
      const result = await readable.setDocumentSource(beforeSource);
      if (typeof result === "boolean") written = result;
      else writeError = `Official setter returned unsupported ${typeof result} result.`;
    } catch (err) {
      writeError = describeThrown(err);
    }
    let afterSource = null;
    let readbackError;
    let identityAfter;
    let afterComparison;
    try {
      await contextFor(requested, target.documentType);
      afterSource = await freshSource(readable);
      identityAfter = await contextFor(requested, target.documentType);
      afterComparison = compareSource(afterSource, target, comparison);
    } catch (err) {
      readbackError = describeThrown(err);
    }
    const verified = written === true && !readbackError && afterComparison?.projection === beforeComparison.projection;
    return {
      result: {
        ...base,
        dryRun: false,
        afterSource,
        identityAfter,
        writeAttempted: true,
        written,
        rawAfterEqualsBefore: afterSource === beforeSource,
        ...comparison === "dochead-volatile-v1" ? { afterVolatile: afterComparison?.volatile ?? null } : {},
        writeError,
        readbackError,
        verified,
        partial: !verified,
        incomplete: !verified
      },
      // An explicit empty context avoids the dispatcher's unbounded fallback
      // when the post-write identity read itself failed. Never label the old
      // target as the current context after an unconfirmed host transition.
      context: identityAfter ?? {},
      ...!verified ? { warnings: ["Same-source roundtrip was not confirmed. Preserve before/after evidence; do not automatically retry or roll back."] } : {}
    };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/pcb-pour-order.ts
  init_define_LOAD_ACTIONS();
  var PourOrderError = class extends ActionError {
    constructor(message, evidence) {
      super(ErrorCodes.EDA_CALL_FAILED, `Pour ${evidence.primitiveId}: ${message}`, JSON.stringify(evidence));
      this.evidence = evidence;
      this.name = "PourOrderError";
    }
  };
  var NativePourSourceError = class extends ActionError {
    constructor(message, source) {
      super(ErrorCodes.PRECONDITION_REFUSED, message, JSON.stringify({ source }));
      this.source = source;
    }
  };
  function refuse2(message) {
    throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, message);
  }
  function object(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  function freeze(value) {
    if (value !== null && typeof value === "object") {
      for (const child of Object.values(value)) freeze(child);
      Object.freeze(value);
    }
    return value;
  }
  function canonical(value) {
    if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
    if (object(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
  }
  function withoutOrder(payload) {
    const value = { ...payload };
    delete value.order;
    return canonical(value);
  }
  function parseObject(text2, label) {
    let value;
    try {
      value = JSON.parse(text2);
    } catch {
      refuse2(`Malformed ${label}; native pour inventory is unavailable.`);
    }
    if (!object(value)) refuse2(`${label} must be an object; native pour inventory is unavailable.`);
    return value;
  }
  function parseNativePourOrderSource(source, target) {
    if (typeof source !== "string" || !source.trim()) refuse2("Native PCB source is empty or unavailable.");
    const lines = source.split(/\r?\n/);
    if (lines[lines.length - 1] === "") lines.pop();
    const pours = [];
    let docheads = 0;
    const ids = /* @__PURE__ */ new Set();
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (!line) refuse2("Blank native source record is unsupported.");
      const separator = line.indexOf("||");
      if (separator < 1) refuse2("Native source record framing is unavailable.");
      const header = parseObject(line.slice(0, separator), "native record header");
      if (typeof header.type !== "string" || !header.type) refuse2("Native record type is unavailable.");
      let payloadText = line.slice(separator + 2);
      if (payloadText.endsWith("|")) payloadText = payloadText.slice(0, -1);
      const payload = parseObject(payloadText, "native record payload");
      if (header.type === "DOCHEAD") {
        docheads++;
        if (index !== 0 || docheads !== 1 || payload.docType !== "PCB" || payload.uuid !== target.documentUuid) {
          refuse2("Native DOCHEAD does not identify the exact PCB target.");
        }
      }
      if (header.type !== "POUR") continue;
      if (typeof header.id !== "string" || !/^[0-9a-f]{16}$/.test(header.id)) refuse2("Native POUR ID is missing or unsupported.");
      if (!Number.isSafeInteger(header.ticket) || Number(header.ticket) < 0) refuse2("Native POUR ticket is unavailable.");
      if (ids.has(header.id)) refuse2(`Duplicate native POUR ID ${header.id}; inventory is ambiguous.`);
      ids.add(header.id);
      if (!Number.isSafeInteger(payload.layerId) || Number(payload.layerId) <= 0 || !Number.isSafeInteger(payload.order) || Number(payload.order) < 0) refuse2("Native POUR layer/order must be explicit nonnegative integers.");
      if (typeof payload.netName !== "string" || !payload.netName.trim() || typeof payload.width !== "number" || !Number.isFinite(payload.width) || payload.width <= 0 || typeof payload.name !== "string" || !payload.name || !Array.isArray(payload.path) || !payload.path.length || payload.path.some((path) => !Array.isArray(path) || !path.length) || !object(payload.pourType) || typeof payload.pourType.pourType !== "string" || typeof payload.keepIsland !== "boolean" || typeof payload.locked !== "boolean") {
        refuse2("Native POUR required fields are missing or unsupported; inventory is unavailable.");
      }
      pours.push({ primitiveId: header.id, layer: Number(payload.layerId), order: Number(payload.order), payload });
    }
    if (docheads !== 1) refuse2("Native PCB DOCHEAD is unavailable; do not treat missing source as an empty inventory.");
    return freeze({ source, pours });
  }
  async function exactContext(target) {
    const context = await readResponseContext();
    if (context.documentType !== "pcb" || typeof context.projectUuid !== "string" || !context.projectUuid.trim() || typeof context.documentUuid !== "string" || !context.documentUuid.trim()) refuse2("Exact PCB project/document identity is unavailable.");
    if (target && (context.projectUuid !== target.projectUuid || context.documentUuid !== target.documentUuid)) {
      refuse2("Active project/document changed during native pour-order verification.");
    }
    return { projectUuid: context.projectUuid, documentUuid: context.documentUuid, documentType: "pcb" };
  }
  async function readInventory(target) {
    await exactContext(target);
    const response = await documentSourceGet({ projectUuid: target.projectUuid, documentUuid: target.documentUuid });
    const result = response.result;
    if (!result || result.verified !== true || result.partial !== false || result.incomplete !== false || !object(result.target) || result.target.projectUuid !== target.projectUuid || result.target.documentUuid !== target.documentUuid || result.target.documentType !== "pcb") {
      if (typeof result?.source === "string") throw new NativePourSourceError("Identity-bound native PCB source read was not confirmed.", result.source);
      refuse2("Identity-bound native PCB source read was not confirmed.");
    }
    try {
      return parseNativePourOrderSource(result.source, target);
    } catch (error) {
      if (typeof result.source === "string") throw new NativePourSourceError(describeThrown(error), result.source);
      throw error;
    }
  }
  async function preparePourOrder(priority, layer) {
    if (priority === void 0) return void 0;
    if (!Number.isSafeInteger(priority) || Number(priority) < 0) refuse2("priority must be an explicit nonnegative safe integer (native order).");
    if (!Number.isSafeInteger(layer) || layer <= 0) refuse2("Pour-order target layer must be a positive integer.");
    const api = typeof eda === "undefined" ? void 0 : eda.pcb_PrimitivePour;
    if (typeof api?.create !== "function" || typeof api?.getAll !== "function") {
      throw new ActionError(ErrorCodes.EDA_API_UNAVAILABLE, "Public pour create/getAll API is unavailable; no pour was created.");
    }
    const target = await exactContext();
    const baseline = await readInventory(target);
    const layerPours = baseline.pours.filter((pour) => pour.layer === layer).sort((a, b) => a.order - b.order);
    if (layerPours.some((pour, index) => pour.order !== index)) refuse2("Existing target-layer native orders must be unique and contiguous 0..N-1; no pour was created.");
    if (Number(priority) > layerPours.length) refuse2(`priority is outside native insertion order 0..${layerPours.length}; no pour was created.`);
    return freeze({ target, layer, requested: Number(priority), baseline });
  }
  function oldInventoryUnchanged(plan, inventory, primitiveId) {
    if (inventory.pours.length !== plan.baseline.pours.length + 1) refuse2("Created pour inventory has missing or unexpected objects.");
    for (const old of plan.baseline.pours) {
      const current = inventory.pours.find((pour) => pour.primitiveId === old.primitiveId);
      if (!current || canonical(current.payload) !== canonical(old.payload)) refuse2(`Baseline pour ${old.primitiveId} changed before order application.`);
    }
    const created = inventory.pours.find((pour) => pour.primitiveId === primitiveId);
    if (!created || created.layer !== plan.layer) refuse2("Created pour is missing or on a different native layer.");
    const count = plan.baseline.pours.filter((pour) => pour.layer === plan.layer).length;
    if (created.order !== count) refuse2("Created host-default native order does not follow the frozen baseline.");
    return created;
  }
  function verifiedInventory(plan, inventory, createdBefore) {
    if (inventory.pours.length !== plan.baseline.pours.length + 1) refuse2("Final pour inventory has missing or unexpected objects.");
    for (const old of plan.baseline.pours) {
      const current = inventory.pours.find((pour) => pour.primitiveId === old.primitiveId);
      const expectedOrder = old.layer === plan.layer && old.order >= plan.requested ? old.order + 1 : old.order;
      if (!current || current.layer !== old.layer || current.order !== expectedOrder || withoutOrder(current.payload) !== withoutOrder(old.payload)) refuse2(`Pour ${old.primitiveId} differs from the expected complete native readback.`);
    }
    const created = inventory.pours.find((pour) => pour.primitiveId === createdBefore.primitiveId);
    if (!created || created.layer !== plan.layer || created.order !== plan.requested || withoutOrder(created.payload) !== withoutOrder(createdBefore.payload)) refuse2("Created pour native order or non-order fields differ from the requested insertion.");
    return created;
  }
  async function applyAndVerifyPourOrder(plan, freshCreated) {
    const fresh = freshCreated;
    let primitiveId = "unknown";
    try {
      if (typeof fresh?.getState_PrimitiveId === "function") primitiveId = fresh.getState_PrimitiveId();
    } catch {
    }
    const evidence = { primitiveId, requested: plan.requested, orderWriteAttempted: false, baselineSource: plan.baseline.source };
    let readingAfterWrite = false;
    try {
      if (!/^[0-9a-f]{16}$/.test(primitiveId) || plan.baseline.pours.some((pour) => pour.primitiveId === primitiveId)) refuse2("Fresh created primitive identity is missing or collides with the baseline.");
      for (const method of ["getState_Layer", "toAsync", "isAsync", "setState_PourPriority", "done"]) {
        if (typeof fresh?.[method] !== "function") refuse2(`Public created-pour method ${method} is unavailable; no order write was attempted.`);
      }
      const writable = fresh;
      if (writable.getState_Layer() !== plan.layer) refuse2("Fresh created pour belongs to a different layer.");
      if (typeof writable.getState_PourPriority === "function") {
        try {
          evidence.sdkPriorityBefore = writable.getState_PourPriority();
        } catch (error) {
          evidence.sdkPriorityReadError = describeThrown(error);
        }
      }
      const before = await readInventory(plan.target);
      evidence.beforeOrderSource = before.source;
      const createdBefore = oldInventoryUnchanged(plan, before, primitiveId);
      evidence.beforeNativeOrder = createdBefore.order;
      await exactContext(plan.target);
      if (writable.toAsync() !== writable || writable.isAsync() !== true) refuse2("Created-pour asynchronous mode was not confirmed; no order write was attempted.");
      writable.setState_PourPriority(plan.requested);
      evidence.orderWriteAttempted = true;
      await writable.done();
      readingAfterWrite = true;
      const after = await readInventory(plan.target);
      evidence.afterOrderSource = after.source;
      evidence.afterNativeOrder = after.pours.find((pour) => pour.primitiveId === primitiveId)?.order;
      const created = verifiedInventory(plan, after, createdBefore);
      return {
        ...evidence,
        verified: true,
        nativeOrder: created.order,
        target: plan.target,
        finalOrders: after.pours.map((pour) => ({ primitiveId: pour.primitiveId, layer: pour.layer, order: pour.order }))
      };
    } catch (error) {
      if (error instanceof NativePourSourceError) {
        if (readingAfterWrite) evidence.afterOrderSource = error.source;
        else evidence.beforeOrderSource = error.source;
      }
      throw new PourOrderError(describeThrown(error), evidence);
    }
  }
  async function verifyPourOrderReadback(plan, proof) {
    const evidence = {
      primitiveId: proof.primitiveId,
      requested: plan.requested,
      orderWriteAttempted: proof.orderWriteAttempted,
      baselineSource: proof.baselineSource,
      beforeOrderSource: proof.beforeOrderSource,
      afterOrderSource: proof.afterOrderSource,
      sdkPriorityBefore: proof.sdkPriorityBefore,
      sdkPriorityReadError: proof.sdkPriorityReadError,
      beforeNativeOrder: proof.beforeNativeOrder,
      afterNativeOrder: proof.afterNativeOrder
    };
    try {
      if (proof.verified !== true || proof.requested !== plan.requested || proof.nativeOrder !== plan.requested || proof.baselineSource !== plan.baseline.source || !proof.beforeOrderSource || proof.target.projectUuid !== plan.target.projectUuid || proof.target.documentUuid !== plan.target.documentUuid || proof.target.documentType !== "pcb") refuse2("Earlier pour-order proof does not match the frozen plan.");
      const before = parseNativePourOrderSource(proof.beforeOrderSource, plan.target);
      const createdBefore = oldInventoryUnchanged(plan, before, proof.primitiveId);
      const after = await readInventory(plan.target);
      evidence.afterRebuildSource = after.source;
      evidence.afterNativeOrder = after.pours.find((pour) => pour.primitiveId === proof.primitiveId)?.order;
      const created = verifiedInventory(plan, after, createdBefore);
      return {
        ...proof,
        ...evidence,
        verified: true,
        nativeOrder: created.order,
        finalOrders: after.pours.map((pour) => ({ primitiveId: pour.primitiveId, layer: pour.layer, order: pour.order }))
      };
    } catch (error) {
      if (error instanceof NativePourSourceError) evidence.afterRebuildSource = error.source;
      throw new PourOrderError(describeThrown(error), evidence);
    }
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/common-library.ts
  init_define_LOAD_ACTIONS();
  function invalid(message) {
    throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Unsupported Common Library source: ${message}`);
  }
  function record(value, label) {
    if (!value || typeof value !== "object" || Array.isArray(value)) invalid(`${label} must be an object.`);
    return value;
  }
  function textField(row, key) {
    const value = row[key];
    if (value === void 0 || value === null) return null;
    if (typeof value !== "string") invalid(`${key} must be a string.`);
    return value;
  }
  function enabledField(row, key) {
    const value = row[key];
    if (value === void 0 || value === null || value === "") return null;
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return invalid(`${key} must be a boolean or a true/false string.`);
  }
  function parseSystemCommonLibrary(value, systemLibraryUuid) {
    const envelope = record(value, "response");
    if (envelope.success !== true) invalid("response.success is not true.");
    let result = envelope.result;
    if (typeof result === "string") {
      try {
        result = JSON.parse(result);
      } catch {
        invalid("result is not valid JSON.");
      }
    }
    const setting = record(record(result, "result").commSystemSetting, "commSystemSetting");
    if (!Array.isArray(setting.BASE_LIBRARY)) invalid("BASE_LIBRARY must be an array.");
    if (!systemLibraryUuid.trim()) invalid("the official System library UUID is unavailable.");
    const models = [];
    for (const categoryValue of setting.BASE_LIBRARY) {
      const category = record(categoryValue, "category");
      const name2 = textField(category, "name");
      if (name2 === null) invalid("category needs a name.");
      if (category.data === void 0) {
        if (Object.keys(category).some((key) => key !== "name")) invalid("unknown category fields without data[].");
        continue;
      }
      if (!Array.isArray(category.data)) invalid("category data must be an array.");
      for (const modelValue of category.data) {
        const row = record(modelValue, "model");
        const deviceUuid = textField(row, "device");
        if (!deviceUuid?.trim()) invalid("model needs a non-empty device UUID.");
        const rowCategory = textField(row, "category");
        if (rowCategory !== null && rowCategory !== name2) invalid("model category differs from its container.");
        models.push({
          category: name2,
          group: textField(row, "group") ?? "",
          deviceUuid,
          libraryUuid: textField(row, "devicePath") || systemLibraryUuid,
          name: textField(row, "deviceName"),
          comment: textField(row, "comment"),
          symbolUuid: textField(row, "symbol"),
          footprintUuid: textField(row, "footprint"),
          schematic: enabledField(row, "sch"),
          pcb: enabledField(row, "pcb"),
          identityVerified: false
        });
      }
    }
    return models;
  }
  async function listSystemCommonLibrary(payload) {
    const category = optionalString(payload, "category");
    const group = optionalString(payload, "group");
    const query = optionalString(payload, "query")?.normalize("NFKC").trim().toLocaleLowerCase();
    const environment = eda.sys_Environment;
    if (typeof environment?.isWeb !== "function" || typeof environment.isProPrivateEdition !== "function" || !environment.isWeb() || environment.isProPrivateEdition()) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Common Library source discovery supports the public Web editor only.");
    }
    const origin = environment.isJLCEDAProEdition() ? "https://pro.lceda.cn" : environment.isEasyEDAProEdition() ? "https://pro.easyeda.com" : null;
    if (!origin) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "The editor site could not be identified.");
    const url = `${origin}/api/system/preference`;
    try {
      const response = await eda.sys_ClientUrl.request(url, "GET");
      if (!response.ok) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Common Library source refused HTTP ${response.status}.`, url);
      }
      const source = await response.json();
      const systemLibraryUuid = await eda.lib_LibrariesList.getSystemLibraryUuid();
      const models = parseSystemCommonLibrary(source, systemLibraryUuid ?? "");
      const scoped = models.filter((model) => (category === void 0 || model.category === category) && (group === void 0 || model.group === group));
      if (query && scoped.some((model) => !model.name?.trim())) {
        throw new ActionError(
          ErrorCodes.PRECONDITION_REFUSED,
          "Catalogue model names are unavailable. List without --query and resolve explicit UUIDs with lib device get."
        );
      }
      const devices = scoped.filter((model) => !query || [model.name, model.comment, model.group].some((value) => value?.normalize("NFKC").toLocaleLowerCase().includes(query)));
      return { result: {
        scope: "system",
        count: devices.length,
        catalogueCount: models.length,
        devices,
        selectedModelAvailable: false,
        source: { url, readVia: "eda.sys_ClientUrl.request", capturedAt: (/* @__PURE__ */ new Date()).toISOString() }
      } };
    } catch (error) {
      if (error instanceof ActionError) throw error;
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Failed to read the System Common Library catalogue.", describeThrown(error));
    }
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/pcb-silk-placement.ts
  init_define_LOAD_ACTIONS();
  function validSilkRect(r) {
    if (!r || typeof r !== "object") return false;
    const b = r;
    return [b.minX, b.minY, b.maxX, b.maxY].every((v) => typeof v === "number" && Number.isFinite(v)) && b.minX < b.maxX && b.minY < b.maxY;
  }
  function silkSlotFacts(rect, owner, attribute, layer, obstacles, labels, safeArea, labelMargin) {
    const overlap = (a, b, m) => a.minX < b.maxX + m && a.maxX > b.minX - m && a.minY < b.maxY + m && a.maxY > b.minY - m;
    const conflicts = [];
    let softRegions = 0, minClearance = Infinity;
    if (safeArea && !(rect.minX >= safeArea.minX && rect.maxX <= safeArea.maxX && rect.minY >= safeArea.minY && rect.maxY <= safeArea.maxY)) conflicts.push({ kind: "OUTLINE_BOUNDS", owner: "" });
    for (const o of obstacles) {
      if (o.layer != null && o.layer !== layer) continue;
      if (overlap(rect, o.rect, o.m)) {
        if (o.kind === "REGION_S") softRegions++;
        else conflicts.push({ kind: o.kind, owner: o.owner });
      }
      const dx = Math.max(0, rect.minX - o.rect.maxX, o.rect.minX - rect.maxX);
      const dy = Math.max(0, rect.minY - o.rect.maxY, o.rect.minY - rect.maxY);
      minClearance = Math.min(minClearance, Math.hypot(dx, dy));
    }
    for (const [id, label] of Object.entries(labels)) {
      if (id === attribute || label.layer !== layer) continue;
      if (overlap(rect, label.rect, labelMargin)) conflicts.push({ kind: "LABEL", owner: id });
      const dx = Math.max(0, rect.minX - label.rect.maxX, label.rect.minX - rect.maxX);
      const dy = Math.max(0, rect.minY - label.rect.maxY, label.rect.minY - rect.maxY);
      minClearance = Math.min(minClearance, Math.hypot(dx, dy));
    }
    return { clean: conflicts.length === 0, conflicts, softRegions, minClearance };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/beautify/index.ts
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/beautify/arcGeometry.ts
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/beautify/math.ts
  init_define_LOAD_ACTIONS();
  function dist(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }
  function lerp(p1, p2, t) {
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t
    };
  }
  function getAngle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  }
  function getAngleBetween(v1, v2) {
    let angle = getAngle({ x: 0, y: 0 }, v2) - getAngle({ x: 0, y: 0 }, v1);
    while (angle <= -180) angle += 360;
    while (angle > 180) angle -= 360;
    return angle;
  }
  function getLineIntersection(p1, p2, p3, p4) {
    if (!p1 || !p2 || !p3 || !p4)
      return null;
    const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(d) < 1e-6)
      return null;
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y)
    };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/beautify/arcGeometry.ts
  function computeCornerArcCandidate(points, orderedSegs, cornerIndex, settings, scale) {
    if (cornerIndex <= 0 || cornerIndex >= points.length - 1)
      return null;
    const pPrev = points[cornerIndex - 1];
    const pCorner = points[cornerIndex];
    const pNext = points[cornerIndex + 1];
    const prevWidth = orderedSegs[cornerIndex - 1]?.width ?? orderedSegs[0]?.width ?? 10;
    const nextWidth = orderedSegs[cornerIndex]?.width ?? prevWidth;
    const maxLineWidth = Math.max(prevWidth, nextWidth);
    const baseRadius = maxLineWidth * settings.cornerRadiusRatio;
    const radius = baseRadius * (scale ?? 1);
    const v1 = { x: pPrev.x - pCorner.x, y: pPrev.y - pCorner.y };
    const v2 = { x: pNext.x - pCorner.x, y: pNext.y - pCorner.y };
    const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
    const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
    if (mag1 < 1e-3 || mag2 < 1e-3)
      return null;
    const u1 = { x: v1.x / mag1, y: v1.y / mag1 };
    const u2 = { x: v2.x / mag2, y: v2.y / mag2 };
    const dot = Math.max(-1, Math.min(1, u1.x * u2.x + u1.y * u2.y));
    const angleRad = Math.acos(dot);
    const tanVal = Math.tan(angleRad / 2);
    const sinHalf = Math.sin(angleRad / 2);
    if (Math.abs(tanVal) < 1e-4 || Math.abs(sinHalf) < 1e-4)
      return null;
    const idealTangentLength = radius / tanVal;
    const maxAllowedTangentLength = Math.min(mag1 * 0.45, mag2 * 0.45);
    const tangentLength = Math.min(idealTangentLength, maxAllowedTangentLength);
    if (idealTangentLength > 1e-3 && tangentLength < idealTangentLength * 0.95 && !settings.forceArc)
      return null;
    const effectiveRadius = tangentLength * Math.abs(tanVal);
    if (effectiveRadius < maxLineWidth / 2 - 0.05)
      return null;
    if (tangentLength <= 0.05)
      return null;
    const start = lerp(pCorner, pPrev, tangentLength / mag1);
    const end = lerp(pCorner, pNext, tangentLength / mag2);
    const sweptAngle = getAngleBetween({ x: -v1.x, y: -v1.y }, { x: v2.x, y: v2.y });
    const centerDirRaw = { x: u1.x + u2.x, y: u1.y + u2.y };
    const centerDirLen = Math.sqrt(centerDirRaw.x ** 2 + centerDirRaw.y ** 2);
    if (centerDirLen < 1e-4)
      return null;
    const centerDir = { x: centerDirRaw.x / centerDirLen, y: centerDirRaw.y / centerDirLen };
    const centerDistance = effectiveRadius / sinHalf;
    const center = {
      x: pCorner.x + centerDir.x * centerDistance,
      y: pCorner.y + centerDir.y * centerDistance
    };
    return {
      cornerIndex,
      start,
      end,
      width: nextWidth,
      angle: sweptAngle,
      radius: effectiveRadius,
      baseRadius,
      center,
      centerDir,
      pPrev,
      pCorner,
      pNext,
      prevWidth,
      nextWidth,
      mag1,
      mag2,
      u1,
      u2,
      tangentLength
    };
  }
  function buildConcentricOverrides(candidates) {
    if (candidates.length < 2)
      return null;
    const commonCenter = findCommonCenter(candidates);
    if (!commonCenter)
      return null;
    const overrides = [];
    for (const candidate of candidates) {
      const fromCenter = {
        x: candidate.pCorner.x - commonCenter.x,
        y: candidate.pCorner.y - commonCenter.y
      };
      const forward = fromCenter.x * candidate.centerDir.x + fromCenter.y * candidate.centerDir.y;
      if (forward >= -0.05)
        return null;
      const start = projectPointToLine(commonCenter, candidate.pCorner, candidate.pPrev);
      const end = projectPointToLine(commonCenter, candidate.pCorner, candidate.pNext);
      const radiusToPrev = dist(commonCenter, start);
      const radiusToNext = dist(commonCenter, end);
      const radius = (radiusToPrev + radiusToNext) / 2;
      if (radius < Math.max(candidate.prevWidth, candidate.nextWidth) / 2 - 0.05)
        return null;
      if (Math.abs(radiusToPrev - radiusToNext) > Math.max(0.2, radius * 0.03))
        return null;
      const startDistance = dist(candidate.pCorner, start);
      const endDistance = dist(candidate.pCorner, end);
      if (startDistance < 0.05 || endDistance < 0.05)
        return null;
      if (startDistance > candidate.mag1 * 0.45 || endDistance > candidate.mag2 * 0.45)
        return null;
      if (!isPointBetween(start, candidate.pCorner, candidate.pPrev) || !isPointBetween(end, candidate.pCorner, candidate.pNext))
        return null;
      overrides.push({
        start,
        end,
        width: candidate.nextWidth,
        angle: candidate.angle
      });
    }
    return overrides;
  }
  function findCommonCenter(candidates) {
    const centers = [];
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const center = intersectRays(
          candidates[i].pCorner,
          candidates[i].centerDir,
          candidates[j].pCorner,
          candidates[j].centerDir
        );
        if (center)
          centers.push(center);
      }
    }
    if (centers.length === 0)
      return findCollinearCommonCenter(candidates);
    const average = centers.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    average.x /= centers.length;
    average.y /= centers.length;
    for (const candidate of candidates) {
      const centerVec = { x: average.x - candidate.pCorner.x, y: average.y - candidate.pCorner.y };
      if (centerVec.x * candidate.centerDir.x + centerVec.y * candidate.centerDir.y <= 0.05)
        return null;
    }
    return average;
  }
  function findCollinearCommonCenter(candidates) {
    const validCenters = candidates.map((candidate) => candidate.center).filter((center) => candidates.every((candidate) => isCenterOnRay(center, candidate)));
    if (validCenters.length === 0)
      return null;
    return validCenters.reduce((best, center) => {
      const bestScore = sumDistanceToCorners(best, candidates);
      const centerScore = sumDistanceToCorners(center, candidates);
      return centerScore > bestScore ? center : best;
    });
  }
  function isCenterOnRay(center, candidate) {
    const toCenter = {
      x: center.x - candidate.pCorner.x,
      y: center.y - candidate.pCorner.y
    };
    const forward = toCenter.x * candidate.centerDir.x + toCenter.y * candidate.centerDir.y;
    if (forward <= 0.05)
      return false;
    const cross = Math.abs(toCenter.x * candidate.centerDir.y - toCenter.y * candidate.centerDir.x);
    return cross <= 0.2;
  }
  function sumDistanceToCorners(center, candidates) {
    return candidates.reduce((sum, candidate) => sum + dist(center, candidate.pCorner), 0);
  }
  function intersectRays(p1, d1, p2, d2) {
    const cross = d1.x * d2.y - d1.y * d2.x;
    if (Math.abs(cross) < 1e-4)
      return null;
    const delta = { x: p2.x - p1.x, y: p2.y - p1.y };
    const t = (delta.x * d2.y - delta.y * d2.x) / cross;
    const u = (delta.x * d1.y - delta.y * d1.x) / cross;
    if (t <= 0.05 || u <= 0.05)
      return null;
    return {
      x: p1.x + d1.x * t,
      y: p1.y + d1.y * t
    };
  }
  function projectPointToLine(point, lineA, lineB) {
    const vx = lineB.x - lineA.x;
    const vy = lineB.y - lineA.y;
    const lenSq = vx ** 2 + vy ** 2;
    if (lenSq < 1e-6)
      return lineA;
    const t = ((point.x - lineA.x) * vx + (point.y - lineA.y) * vy) / lenSq;
    return {
      x: lineA.x + vx * t,
      y: lineA.y + vy * t
    };
  }
  function isPointBetween(point, a, b) {
    const ab = dist(a, b);
    return dist(a, point) <= ab + 0.05 && dist(b, point) <= ab + 0.05;
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/beautify/drc.ts
  init_define_LOAD_ACTIONS();
  async function runDrcCheckAndParse(ignoreCopperPour) {
    const violatedIds = /* @__PURE__ */ new Set();
    try {
      const categories = await eda.pcb_Drc.check(false, false, true);
      if (!Array.isArray(categories))
        return violatedIds;
      const filtered = ignoreCopperPour ? filterOutCopperPourIssues(categories) : categories;
      for (const category of filtered) {
        if (!Array.isArray(category.list))
          continue;
        for (const subCategory of category.list) {
          if (!Array.isArray(subCategory.list))
            continue;
          for (const issue of subCategory.list)
            extractViolatedIds(issue, violatedIds);
        }
      }
      return violatedIds;
    } catch {
      return violatedIds;
    }
  }
  function extractViolatedIds(issue, ids) {
    if (Array.isArray(issue.objs)) {
      for (const id of issue.objs)
        if (typeof id === "string") ids.add(id);
    }
    const errData = issue.explanation?.errData;
    if (errData) {
      if (typeof errData.obj1 === "string") ids.add(errData.obj1);
      if (typeof errData.obj2 === "string") ids.add(errData.obj2);
    }
  }
  function isCopperPourSubCategory(sub) {
    return sub.name?.includes("Copper Region") ?? false;
  }
  function isCopperPourIssue(issue) {
    return issue.errorObjType?.includes("Copper Region") ?? false;
  }
  function filterOutCopperPourIssues(categories) {
    return categories.map((category) => {
      const filteredSubs = (category.list ?? []).filter((sub) => !isCopperPourSubCategory(sub)).map((sub) => {
        const filteredIssues = (sub.list ?? []).filter((issue) => !isCopperPourIssue(issue));
        return { ...sub, list: filteredIssues, count: filteredIssues.length };
      }).filter((sub) => (sub.list?.length ?? 0) > 0);
      const totalCount = filteredSubs.reduce((n, s) => n + (s.count ?? 0), 0);
      return { ...category, list: filteredSubs, count: totalCount };
    }).filter((category) => (category.list?.length ?? 0) > 0);
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/beautify/index.ts
  function onCopper(layer) {
    const n = Number(layer);
    return n === 1 || n === 2 || n >= 15 && n <= 44;
  }
  function generatePathOps(path, settings, badCorners, cornerScales, cornerOverrides) {
    const { points, orderedSegs } = path;
    const ops = [];
    if (points.length < 3)
      return ops;
    const ratio = settings.cornerRadiusRatio;
    let currentStart = points[0];
    for (let i = 1; i < points.length - 1; i++) {
      const pPrev = points[i - 1];
      const pCorner = points[i];
      const pNext = points[i + 1];
      const prevSegWidth = orderedSegs[i - 1]?.width ?? orderedSegs[0].width;
      const nextSegWidth = orderedSegs[i]?.width ?? prevSegWidth;
      const maxLineWidth = Math.max(prevSegWidth, nextSegWidth);
      const baseRadius = maxLineWidth * ratio;
      if (badCorners.has(i)) {
        ops.push({ type: "line", start: currentStart, end: pCorner, width: prevSegWidth, cornerIndex: i });
        currentStart = pCorner;
        continue;
      }
      let radius = baseRadius;
      const scale = cornerScales.get(i);
      if (scale !== void 0)
        radius = baseRadius * scale;
      const override = cornerOverrides.get(i);
      if (override === null) {
        ops.push({ type: "line", start: currentStart, end: pCorner, width: prevSegWidth, cornerIndex: i });
        currentStart = pCorner;
        continue;
      }
      if (override) {
        ops.push({ type: "line", start: currentStart, end: override.start, width: prevSegWidth, cornerIndex: i });
        ops.push({ type: "arc", start: override.start, end: override.end, width: override.width, angle: override.angle, cornerIndex: i });
        currentStart = override.end;
        continue;
      }
      let isMerged = false;
      try {
        if (settings.mergeTransitionSegments && i < points.length - 2 && scale === void 0 && !badCorners.has(i + 1)) {
          const pAfter = points[i + 2];
          if (pAfter) {
            const segLen = dist(pCorner, pNext);
            if (segLen < radius * 1.5) {
              const vIn = { x: pPrev.x - pCorner.x, y: pPrev.y - pCorner.y };
              const vMid = { x: pNext.x - pCorner.x, y: pNext.y - pCorner.y };
              const vOut = { x: pAfter.x - pNext.x, y: pAfter.y - pNext.y };
              const angle1 = getAngleBetween({ x: -vIn.x, y: -vIn.y }, { x: vMid.x, y: vMid.y });
              const angle2 = getAngleBetween({ x: vMid.x, y: vMid.y }, { x: vOut.x, y: vOut.y });
              if (angle1 * angle2 > 0 && Math.abs(angle1) > 1 && Math.abs(angle2) > 1) {
                const intersection = getLineIntersection(pPrev, pCorner, pNext, pAfter);
                if (intersection) {
                  const dInt1 = dist(intersection, pCorner);
                  const dInt2 = dist(intersection, pNext);
                  if (dInt1 < segLen * 10 && dInt2 < segLen * 10) {
                    const tV1 = { x: pPrev.x - intersection.x, y: pPrev.y - intersection.y };
                    const tV2 = { x: pAfter.x - intersection.x, y: pAfter.y - intersection.y };
                    const tMag1 = Math.sqrt(tV1.x ** 2 + tV1.y ** 2);
                    const tMag2 = Math.sqrt(tV2.x ** 2 + tV2.y ** 2);
                    const tDot = (tV1.x * tV2.x + tV1.y * tV2.y) / (tMag1 * tMag2);
                    const tAngleRad = Math.acos(Math.max(-1, Math.min(1, tDot)));
                    const tTanVal = Math.tan(tAngleRad / 2);
                    let tD = 0;
                    if (Math.abs(tTanVal) > 1e-4)
                      tD = radius / tTanVal;
                    const tMaxAllowedRadius = Math.min(tMag1 * 0.95, tMag2 * 0.95);
                    const tActualD = Math.min(tD, tMaxAllowedRadius);
                    const tEffectiveRadius = tActualD * Math.abs(tTanVal);
                    if (tActualD > 0.05 && tEffectiveRadius >= maxLineWidth / 2 - 0.05) {
                      const pStart = lerp(intersection, pPrev, tActualD / tMag1);
                      const pEnd = lerp(intersection, pAfter, tActualD / tMag2);
                      if (dist(currentStart, pStart) > 1e-3)
                        ops.push({ type: "line", start: currentStart, end: pStart, width: prevSegWidth, cornerIndex: i });
                      const tSweptAngle = getAngleBetween({ x: -tV1.x, y: -tV1.y }, { x: tV2.x, y: tV2.y });
                      const afterSegWidth = orderedSegs[i + 1]?.width ?? nextSegWidth;
                      ops.push({ type: "arc", start: pStart, end: pEnd, width: afterSegWidth, angle: tSweptAngle, cornerIndex: i });
                      currentStart = pEnd;
                      i++;
                      isMerged = true;
                    }
                  }
                }
              }
            }
          }
        }
      } catch {
      }
      if (!isMerged) {
        const v1 = { x: pPrev.x - pCorner.x, y: pPrev.y - pCorner.y };
        const v2 = { x: pNext.x - pCorner.x, y: pNext.y - pCorner.y };
        const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
        const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
        const dot = (v1.x * v2.x + v1.y * v2.y) / (mag1 * mag2);
        const safeDot = Math.max(-1, Math.min(1, dot));
        const angleRad = Math.acos(safeDot);
        const tanVal = Math.tan(angleRad / 2);
        let d = 0;
        if (Math.abs(tanVal) > 1e-4)
          d = radius / tanVal;
        const maxAllowedRadius = Math.min(mag1 * 0.45, mag2 * 0.45);
        const actualD = Math.min(d, maxAllowedRadius);
        let isSkipped = false;
        if (d > 1e-3 && actualD < d * 0.95 && !settings.forceArc)
          isSkipped = true;
        if (!isSkipped) {
          const effectiveRadius = actualD * Math.abs(tanVal);
          if (effectiveRadius < maxLineWidth / 2 - 0.05)
            isSkipped = true;
        }
        if (actualD > 0.05 && !isSkipped) {
          const pStart = lerp(pCorner, pPrev, actualD / mag1);
          const pEnd = lerp(pCorner, pNext, actualD / mag2);
          ops.push({ type: "line", start: currentStart, end: pStart, width: prevSegWidth, cornerIndex: i });
          const sweptAngle = getAngleBetween({ x: -v1.x, y: -v1.y }, { x: v2.x, y: v2.y });
          ops.push({ type: "arc", start: pStart, end: pEnd, width: nextSegWidth, angle: sweptAngle, cornerIndex: i });
          currentStart = pEnd;
        } else {
          ops.push({ type: "line", start: currentStart, end: pCorner, width: prevSegWidth, cornerIndex: i });
          currentStart = pCorner;
        }
      }
    }
    const lastSegWidth = orderedSegs[orderedSegs.length - 1]?.width ?? orderedSegs[0].width;
    ops.push({ type: "line", start: currentStart, end: points[points.length - 1], width: lastSegWidth, cornerIndex: points.length - 1 });
    return ops;
  }
  async function loadProtectedNetGroups(settings) {
    if (!settings.protectDifferentialAndEqualLength)
      return [];
    const groups = [];
    try {
      const drcApi = eda.pcb_Drc;
      const differentialRaw = typeof drcApi.getAllDifferentialPairs === "function" ? await drcApi.getAllDifferentialPairs() : [];
      for (const pair of normalizeDifferentialPairs(differentialRaw)) {
        const nets = uniqueNets([pair.positiveNet, pair.negativeNet]);
        if (nets.length >= 2)
          groups.push({ key: `diff:${pair.name || nets.join("/")}`, name: pair.name || nets.join("/"), type: "differential", nets });
      }
      const equalLengthGroups = typeof drcApi.getAllEqualLengthNetGroups === "function" ? await drcApi.getAllEqualLengthNetGroups() : [];
      if (Array.isArray(equalLengthGroups)) {
        for (const group of equalLengthGroups) {
          const nets = uniqueNets(group?.nets || []);
          if (nets.length >= 2) {
            const name2 = group?.name || nets.join("/");
            groups.push({ key: `eq:${name2}`, name: name2, type: "equalLength", nets });
          }
        }
      }
    } catch {
    }
    return groups;
  }
  function normalizeDifferentialPairs(input) {
    const pairs = [];
    const visit = (value) => {
      if (!value)
        return;
      if (Array.isArray(value)) {
        for (const item of value) visit(item);
        return;
      }
      if (typeof value !== "object")
        return;
      const v = value;
      if (typeof v.positiveNet === "string" && typeof v.negativeNet === "string") {
        pairs.push(value);
        return;
      }
      for (const child of Object.values(value)) visit(child);
    };
    visit(input);
    return pairs;
  }
  function uniqueNets(nets) {
    const result = [];
    for (const net of nets) {
      if (typeof net !== "string" || !net)
        continue;
      if (!result.includes(net))
        result.push(net);
    }
    return result;
  }
  function buildNetToProtectedGroups(groups) {
    const map = /* @__PURE__ */ new Map();
    for (const group of groups) {
      for (const net of group.nets) {
        if (!map.has(net))
          map.set(net, []);
        map.get(net).push(group);
      }
    }
    return map;
  }
  function refreshProtectedCornerOverrides(activePaths, protectedGroups, settings) {
    for (const ctx of activePaths) {
      ctx.cornerOverrides.clear();
      ctx.protectedCornerKeys.clear();
    }
    if (!settings.protectDifferentialAndEqualLength || protectedGroups.length === 0)
      return;
    for (const group of protectedGroups) {
      const contexts = activePaths.filter((ctx) => ctx.protectedGroupKeys.includes(group.key));
      const contextsByLayer = /* @__PURE__ */ new Map();
      for (const ctx of contexts) {
        if (!contextsByLayer.has(ctx.layer))
          contextsByLayer.set(ctx.layer, []);
        contextsByLayer.get(ctx.layer).push(ctx);
      }
      for (const [layer, layerContexts] of contextsByLayer) {
        const groupNets = new Set(group.nets);
        const presentNets = new Set(layerContexts.map((ctx) => ctx.net));
        const hasFullGroup = Array.from(groupNets).every((net) => presentNets.has(net));
        if (!hasFullGroup) {
          for (const ctx of layerContexts)
            markAllProtectedCornersStraight(ctx, group.key, layer);
          continue;
        }
        const maxCornerCount = Math.max(...layerContexts.map((ctx) => ctx.points.length - 2));
        for (let cornerIndex = 1; cornerIndex <= maxCornerCount; cornerIndex++) {
          const cornerKey = `${group.key}#${layer}#${cornerIndex}`;
          const candidates = [];
          let canProtect = true;
          for (const ctx of layerContexts) {
            if (cornerIndex >= ctx.points.length - 1) {
              canProtect = false;
              break;
            }
            ctx.protectedCornerKeys.set(cornerIndex, cornerKey);
            if (ctx.badCorners.has(cornerIndex)) {
              canProtect = false;
              break;
            }
            const candidate = computeCornerArcCandidate(
              ctx.points,
              ctx.orderedSegs,
              cornerIndex,
              { ...settings, forceArc: false },
              ctx.cornerScales.get(cornerIndex)
            );
            if (!candidate) {
              canProtect = false;
              break;
            }
            candidates.push({ ctx, candidate });
          }
          if (!canProtect) {
            for (const ctx of layerContexts) {
              if (cornerIndex < ctx.points.length - 1)
                ctx.cornerOverrides.set(cornerIndex, null);
            }
            continue;
          }
          const overrides = buildConcentricOverrides(candidates.map((item) => item.candidate));
          if (!overrides) {
            for (const { ctx } of candidates)
              ctx.cornerOverrides.set(cornerIndex, null);
            continue;
          }
          for (let i = 0; i < candidates.length; i++)
            candidates[i].ctx.cornerOverrides.set(cornerIndex, overrides[i]);
        }
      }
    }
  }
  function markAllProtectedCornersStraight(ctx, groupKey, layer) {
    for (let cornerIndex = 1; cornerIndex < ctx.points.length - 1; cornerIndex++) {
      ctx.protectedCornerKeys.set(cornerIndex, `${groupKey}#${layer}#${cornerIndex}`);
      ctx.cornerOverrides.set(cornerIndex, null);
    }
  }
  function syncProtectedCornerRepair(activePaths, sourceCtx, cornerIndex, apply) {
    const cornerKey = sourceCtx.protectedCornerKeys.get(cornerIndex);
    if (!cornerKey) {
      apply(sourceCtx, cornerIndex);
      return [sourceCtx];
    }
    const changed = [];
    for (const ctx of activePaths) {
      for (const [idx, key] of ctx.protectedCornerKeys) {
        if (key === cornerKey) {
          apply(ctx, idx);
          changed.push(ctx);
        }
      }
    }
    return changed.length > 0 ? changed : [sourceCtx];
  }
  async function readRawTracks(opts) {
    let lines;
    const wantNets = /* @__PURE__ */ new Set([
      ...opts.net ? [opts.net] : [],
      ...opts.nets ?? []
    ]);
    const netFilter = wantNets.size > 0 ? wantNets : null;
    if (opts.scope === "selected") {
      const selectedIds = await eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId();
      if (!selectedIds || selectedIds.length === 0)
        return [];
      const want = new Set(selectedIds);
      const all = await eda.pcb_PrimitiveLine.getAll() ?? [];
      lines = all.filter((l) => want.has(l.getState_PrimitiveId()));
    } else {
      const single = netFilter && netFilter.size === 1 ? [...netFilter][0] : void 0;
      lines = await eda.pcb_PrimitiveLine.getAll(single) ?? [];
    }
    const out = [];
    for (const l of lines) {
      if (l.getState_PrimitiveLock())
        continue;
      const layer = Number(l.getState_Layer());
      if (!onCopper(layer))
        continue;
      if (netFilter && !netFilter.has(l.getState_Net()))
        continue;
      if (opts.layer != null && layer !== opts.layer)
        continue;
      out.push({
        id: l.getState_PrimitiveId(),
        net: l.getState_Net(),
        layer,
        width: l.getState_LineWidth(),
        p1: { x: l.getState_StartX(), y: l.getState_StartY() },
        p2: { x: l.getState_EndX(), y: l.getState_EndY() }
      });
    }
    return out;
  }
  async function runBeautify(opts) {
    const settings = {
      cornerRadiusRatio: opts.cornerRadiusRatio,
      forceArc: opts.forceArc,
      mergeTransitionSegments: opts.mergeTransitionSegments,
      protectDifferentialAndEqualLength: opts.protectDifferentialAndEqualLength
    };
    const summary = {
      scope: opts.scope,
      dryRun: opts.dryRun,
      tracksConsidered: 0,
      paths: 0,
      cornersRounded: 0,
      linesCreated: 0,
      arcsCreated: 0,
      protectedGroups: 0,
      drcRounds: 0,
      pourRebuilt: null
    };
    const tracks = await readRawTracks(opts);
    summary.tracksConsidered = tracks.length;
    if (tracks.length < 1) {
      summary.skipped = opts.scope === "selected" ? "\u672A\u9009\u4E2D\u53EF\u5904\u7406\u7684\u94DC\u5C42\u5BFC\u7EBF\uFF08\u5148\u5728 EasyEDA \u91CC\u6846\u9009\u8D70\u7EBF\uFF0C\u6216\u7528 scope=all\uFF09" : "\u672A\u627E\u5230\u53EF\u5904\u7406\u7684\u94DC\u5C42\u5BFC\u7EBF";
      return summary;
    }
    const protectedGroups = await loadProtectedNetGroups(settings);
    const netToProtectedGroups = buildNetToProtectedGroups(protectedGroups);
    summary.protectedGroups = protectedGroups.length;
    const groups = /* @__PURE__ */ new Map();
    for (const t of tracks) {
      const key = `${t.net}#@#${t.layer}`;
      if (!groups.has(key))
        groups.set(key, []);
      groups.get(key).push(t);
    }
    const activePaths = [];
    let pathIdCounter = 0;
    for (const [key, group] of groups) {
      const [net, layerStr] = key.split("#@#");
      const layer = Number(layerStr);
      const segs = group.map((t) => ({ p1: t.p1, p2: t.p2, width: t.width, id: t.id }));
      const pointKey = (p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`;
      const connections = /* @__PURE__ */ new Map();
      for (const seg of segs) {
        for (const k of [pointKey(seg.p1), pointKey(seg.p2)]) {
          if (!connections.has(k))
            connections.set(k, []);
          connections.get(k).push(seg);
        }
      }
      const used = /* @__PURE__ */ new Set();
      for (const startSeg of segs) {
        if (used.has(startSeg.id))
          continue;
        const points = [startSeg.p1, startSeg.p2];
        const orderedSegs = [startSeg];
        used.add(startSeg.id);
        let extended = true;
        while (extended) {
          extended = false;
          const lastKey = pointKey(points[points.length - 1]);
          const lastConns = connections.get(lastKey) || [];
          if (lastConns.length <= 2) {
            for (const seg of lastConns) {
              if (used.has(seg.id))
                continue;
              if (pointKey(seg.p1) === lastKey) {
                points.push(seg.p2);
                orderedSegs.push(seg);
                used.add(seg.id);
                extended = true;
                break;
              } else if (pointKey(seg.p2) === lastKey) {
                points.push(seg.p1);
                orderedSegs.push(seg);
                used.add(seg.id);
                extended = true;
                break;
              }
            }
          }
          if (!extended) {
            const firstKey = pointKey(points[0]);
            const firstConns = connections.get(firstKey) || [];
            if (firstConns.length <= 2) {
              for (const seg of firstConns) {
                if (used.has(seg.id))
                  continue;
                if (pointKey(seg.p1) === firstKey) {
                  points.unshift(seg.p2);
                  orderedSegs.unshift(seg);
                  used.add(seg.id);
                  extended = true;
                  break;
                } else if (pointKey(seg.p2) === firstKey) {
                  points.unshift(seg.p1);
                  orderedSegs.unshift(seg);
                  used.add(seg.id);
                  extended = true;
                  break;
                }
              }
            }
          }
        }
        if (points.length >= 3) {
          activePaths.push({
            pathId: pathIdCounter++,
            points,
            orderedSegs,
            net,
            layer,
            deleteIds: orderedSegs.map((s) => s.id),
            createdIds: [],
            idToCornerMap: /* @__PURE__ */ new Map(),
            badCorners: /* @__PURE__ */ new Set(),
            cornerScales: /* @__PURE__ */ new Map(),
            protectedGroupKeys: (netToProtectedGroups.get(net) || []).map((g) => g.key),
            protectedCornerKeys: /* @__PURE__ */ new Map(),
            cornerOverrides: /* @__PURE__ */ new Map(),
            arcN: 0,
            lineN: 0
          });
        }
      }
    }
    summary.paths = activePaths.length;
    if (activePaths.length === 0) {
      summary.skipped = "\u6CA1\u6709 >=3 \u70B9\u7684\u8FDE\u7EED\u8D70\u7EBF\u53EF\u5706\u6ED1\uFF08\u90FD\u662F\u5355\u6BB5\u6216\u5206\u53C9\uFF09";
      return summary;
    }
    refreshProtectedCornerOverrides(activePaths, protectedGroups, settings);
    if (opts.dryRun) {
      for (const ctx of activePaths) {
        const ops = generatePathOps(ctx, settings, ctx.badCorners, ctx.cornerScales, ctx.cornerOverrides);
        for (const op of ops) {
          if (dist(op.start, op.end) < 1e-3)
            continue;
          if (op.type === "arc") {
            summary.arcsCreated++;
            summary.cornersRounded++;
          } else summary.linesCreated++;
        }
      }
      return summary;
    }
    const resolveNewId = (res) => {
      if (typeof res === "string")
        return res;
      const r = res;
      if (r && r.id)
        return r.id;
      if (r && r.primitiveId)
        return r.primitiveId;
      if (r && r.getState_PrimitiveId)
        return r.getState_PrimitiveId();
      return null;
    };
    const commitOps = async (ops, ctx) => {
      ctx.arcN = 0;
      ctx.lineN = 0;
      for (const item of ops) {
        if (dist(item.start, item.end) < 1e-3)
          continue;
        let newId = null;
        if (item.type === "line") {
          const res = await eda.pcb_PrimitiveLine.create(
            ctx.net,
            ctx.layer,
            item.start.x,
            item.start.y,
            item.end.x,
            item.end.y,
            item.width
          );
          newId = resolveNewId(res);
          if (newId) ctx.lineN++;
        } else {
          const res = await eda.pcb_PrimitiveArc.create(
            ctx.net,
            ctx.layer,
            item.start.x,
            item.start.y,
            item.end.x,
            item.end.y,
            item.angle,
            item.width
          );
          newId = resolveNewId(res);
          if (newId) ctx.arcN++;
        }
        if (newId) {
          ctx.createdIds.push(newId);
          ctx.idToCornerMap.set(newId, item.cornerIndex);
        }
      }
    };
    for (const ctx of activePaths) {
      for (const id of ctx.deleteIds) {
        try {
          await eda.pcb_PrimitiveLine.delete([id]);
        } catch {
        }
      }
    }
    for (const ctx of activePaths) {
      const ops = generatePathOps(ctx, settings, ctx.badCorners, ctx.cornerScales, ctx.cornerOverrides);
      await commitOps(ops, ctx);
    }
    if (opts.enableDrc) {
      let drcAttempt = 0;
      const maxDrcRetries = opts.drcRetryCount || 4;
      while (drcAttempt <= maxDrcRetries) {
        const isFinalAttempt = drcAttempt === maxDrcRetries;
        const violatedIds = await runDrcCheckAndParse(opts.drcIgnoreCopperPour);
        if (violatedIds.size === 0)
          break;
        const pathsToRepair = /* @__PURE__ */ new Set();
        for (const ctx of activePaths) {
          for (const id of ctx.createdIds) {
            if (violatedIds.has(id)) {
              const idx = ctx.idToCornerMap.get(id);
              if (idx !== void 0) {
                const changed = syncProtectedCornerRepair(activePaths, ctx, idx, (repairCtx, repairIdx) => {
                  const currentScale = repairCtx.cornerScales.get(repairIdx) ?? 1;
                  const nextScale = currentScale * 0.5;
                  if (isFinalAttempt || nextScale < 0.1)
                    repairCtx.badCorners.add(repairIdx);
                  else
                    repairCtx.cornerScales.set(repairIdx, nextScale);
                });
                for (const changedCtx of changed)
                  pathsToRepair.add(changedCtx);
              }
            }
          }
        }
        if (pathsToRepair.size === 0)
          break;
        refreshProtectedCornerOverrides(activePaths, protectedGroups, settings);
        for (const ctx of pathsToRepair) {
          if (ctx.createdIds.length > 0) {
            try {
              await eda.pcb_PrimitiveLine.delete(ctx.createdIds);
              await eda.pcb_PrimitiveArc.delete(ctx.createdIds);
            } catch {
            }
            ctx.createdIds = [];
            ctx.idToCornerMap.clear();
          }
          const ops = generatePathOps(ctx, settings, ctx.badCorners, ctx.cornerScales, ctx.cornerOverrides);
          await commitOps(ops, ctx);
        }
        drcAttempt++;
      }
      summary.drcRounds = drcAttempt;
    }
    summary.arcsCreated = activePaths.reduce((n, c) => n + c.arcN, 0);
    summary.linesCreated = activePaths.reduce((n, c) => n + c.lineN, 0);
    summary.cornersRounded = summary.arcsCreated;
    if (opts.rebuildPour) {
      let rebuilt = 0;
      try {
        const pours = await eda.pcb_PrimitivePour.getAll() ?? [];
        for (const p of pours) {
          try {
            if (await p.rebuildCopperRegion()) rebuilt++;
          } catch {
          }
        }
      } catch {
      }
      summary.pourRebuilt = rebuilt;
    }
    return summary;
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/pcb-config.ts
  init_define_LOAD_ACTIONS();
  var fail2 = (message) => {
    throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `pcb config: ${message}`);
  };
  var object2 = (v, path) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) fail2(`${path} is unavailable or has an unsupported schema`);
    return v;
  };
  var own = (o, key) => Object.hasOwn(o, key) ? o[key] : void 0;
  var name = (v, field) => {
    if (typeof v !== "string" || !v.trim() || ["__proto__", "constructor", "prototype"].includes(v)) fail2(`${field} must be a non-empty rule/class name`);
    return v;
  };
  var positive = (v, field) => {
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) fail2(`${field} must be a finite positive number`);
    return v;
  };
  var clone = (value) => JSON.parse(JSON.stringify(value));
  function pcbRuleCanonicalLength(value, unit) {
    const mil = unit === "mm" ? value / 0.0254 : value;
    const rounded = Math.round(mil * 1e4) / 1e4;
    return unit === "mm" ? rounded * 0.0254 : rounded;
  }
  function pcbRulesEqual(a, b, unit) {
    if (typeof a === "number" && typeof b === "number") {
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      const x = unit ? pcbRuleCanonicalLength(a, unit) : a, y = unit ? pcbRuleCanonicalLength(b, unit) : b;
      return x === y || Math.abs(x - y) <= 8 * Number.EPSILON * Math.max(Math.abs(x), Math.abs(y));
    }
    if (a === b) return true;
    if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => pcbRulesEqual(v, b[i], unit));
    const keys = Object.keys(a);
    const own2 = a.unit;
    const scope = own2 === "mm" || own2 === "mil" ? own2 : unit;
    return keys.length === Object.keys(b).length && keys.every((k) => Object.hasOwn(b, k) && pcbRulesEqual(a[k], b[k], scope));
  }
  function barePcbRuleConfiguration(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const r = value;
    if (Object.hasOwn(r, "config")) return r.config && typeof r.config === "object" && !Array.isArray(r.config) ? r.config : null;
    return r;
  }
  function planPcbConfig(before, payload) {
    const fields2 = {
      clearance: ["name", "trackToTrack"],
      track: ["name", "copyFrom", "min", "default", "max"],
      via: ["name", "minOuter", "defaultOuter", "maxOuter", "minHole", "defaultHole", "maxHole"],
      bind: ["netClass", "trackRule"]
    };
    const kind = String(payload.kind);
    if (!Object.hasOwn(fields2, kind)) fail2("kind must be clearance, track, via or bind");
    for (const key of Object.keys(payload)) {
      if (!["kind", "unit", "dryRun", ...fields2[kind]].includes(key)) fail2(`unknown ${kind} field ${key}`);
    }
    if (payload.dryRun !== void 0 && typeof payload.dryRun !== "boolean") fail2("dryRun must be boolean");
    const inputUnit = payload.unit ?? "mil";
    if (inputUnit !== "mil" && inputUnit !== "mm") fail2("unit must be mil or mm");
    const rules = barePcbRuleConfiguration(before.ruleConfiguration);
    if (!rules) fail2("current rules are unavailable");
    const ruleConfiguration = clone(rules);
    const changes = [];
    const group = (section, category) => object2(own(object2(own(ruleConfiguration, section), section), category), `${section}.${category}`);
    const change = (target, key, value, path, unit) => {
      const old = target[key];
      if (pcbRulesEqual(old, value, unit === "mm" || unit === "mil" ? unit : void 0)) return;
      changes.push({ path, before: old ?? null, after: value, ...unit ? { unit } : {} });
      target[key] = value;
    };
    const convert = (v, rule, field) => {
      const n = positive(v, field);
      if (rule.unit !== "mm" && rule.unit !== "mil") fail2(`${field}: stored unit is unknown (${String(rule.unit)})`);
      return positive(inputUnit === rule.unit ? n : inputUnit === "mil" ? n * 0.0254 : n / 0.0254, `${field} after unit conversion`);
    };
    const range = (min, def, max, path) => {
      const lo = positive(min, `${path}.min`), mid = positive(def, `${path}.default`);
      if (max !== null) positive(max, `${path}.max`);
      if (lo > mid + 1e-10 || max !== null && mid > max + 1e-10) fail2(`${path}: require min <= default <= max; supply all needed values explicitly`);
    };
    let netRules;
    if (kind === "bind") {
      const className = name(payload.netClass, "netClass"), trackRule = name(payload.trackRule, "trackRule");
      object2(own(group("Physics", "Track"), trackRule), `Track.${trackRule}`);
      if (!Array.isArray(before.classes) || !Array.isArray(before.netRules)) fail2("net classes / net rules are unavailable");
      const classes = before.classes.filter((c) => c.name === className);
      if (classes.length !== 1 || !Array.isArray(classes[0].nets) || !classes[0].nets.length) fail2(`create a non-empty ${className} with pcb net-class create first`);
      const members = classes[0].nets;
      if (members.some((v) => typeof v !== "string" || !v) || new Set(members).size !== members.length) fail2("invalid or duplicate class members");
      netRules = clone(before.netRules);
      const entries2 = netRules.filter((r) => r.type === "netClass" && r.name === className);
      if (entries2.length !== 1 || !Array.isArray(entries2[0].sub)) fail2(`missing or ambiguous netRules for ${className}`);
      const entry = entries2[0];
      const children = entry.sub;
      if (children.some((c) => c.type !== "net") || exactJSON(children.map((c) => c.name).sort()) !== exactJSON([...members].sort())) fail2("class members and netRules children differ; read fresh state before binding");
      for (const r of [entry, ...children]) {
        if (typeof r.Track !== "string") fail2(`missing Track assignment for ${r.name}`);
        change(r, "Track", trackRule, `netRules.${className}.${r.type}:${r.name}.Track`);
      }
    } else {
      const ruleName = name(payload.name, "name");
      const section = kind === "clearance" ? "Spacing" : "Physics";
      const category = { clearance: "Safe Spacing", track: "Track", via: "Via Size" }[kind];
      const rulesOfKind = group(section, category);
      const path = `${section}.${category}.${ruleName}`;
      if (payload.copyFrom !== void 0) name(payload.copyFrom, "copyFrom");
      if (kind === "track" && !Object.hasOwn(rulesOfKind, ruleName)) {
        const sourceName = name(payload.copyFrom, "copyFrom (required for a new track rule)");
        const source = object2(own(rulesOfKind, sourceName), `Track.${sourceName}`);
        rulesOfKind[ruleName] = { ...clone(source), editName: ruleName, isSetDefault: false };
      }
      const rule = object2(own(rulesOfKind, ruleName), path);
      if (kind === "clearance") {
        const value = convert(payload.trackToTrack, rule, "trackToTrack");
        if (!Array.isArray(rule.row) || !Array.isArray(rule.column)) fail2(`${path}: missing object-pair labels`);
        const row = rule.row.indexOf("Track"), col = rule.column.indexOf("Track");
        if (row < 0 || col < 0 || rule.row.filter((x) => x === "Track").length !== 1 || rule.column.filter((x) => x === "Track").length !== 1) fail2(`${path}: ambiguous Track labels`);
        const tables = object2(rule.tables, `${path}.tables`);
        if (!Object.keys(tables).length) fail2(`${path}: empty spacing tables`);
        for (const [layer, table] of Object.entries(tables)) {
          if (!Array.isArray(table?.content?.[row]) || typeof table.content[row][col] !== "number") fail2(`${path}: missing Track/Track cell on table ${layer}`);
          change(table.content[row], col, value, `${path}.tables.${layer}.content.${row}.${col}`, rule.unit);
        }
      } else if (kind === "track") {
        if (!["min", "default", "max"].some((k) => payload[k] !== void 0)) fail2("supply at least one track dimension");
        const data = object2(object2(rule.form, `${path}.form`).data, `${path}.form.data`);
        if (!Object.keys(data).length) fail2(`${path}: empty track tables`);
        for (const [layer, value] of Object.entries(data)) {
          const entry = object2(value, `${path}.${layer}`);
          for (const key of ["min", "default", "max"]) if (payload[key] !== void 0) {
            if (!Object.hasOwn(entry, `${key}Value`)) fail2(`${path}: missing ${key}Value`);
            change(entry, `${key}Value`, convert(payload[key], rule, key), `${path}.form.data.${layer}.${key}Value`, rule.unit);
          }
          range(entry.minValue, entry.defaultValue, entry.maxValue, `${path}.${layer}`);
        }
        if (!Object.hasOwn(groupFrom(rules, section, category), ruleName)) {
          changes.unshift({ path, before: null, after: clone(rule), copiedFrom: payload.copyFrom });
        }
      } else {
        const form = object2(rule.form, `${path}.form`);
        const dimensions = { minOuter: "viaOuterdiameterMin", defaultOuter: "viaOuterdiameterDefault", maxOuter: "viaOuterdiameterMax", minHole: "viaInnerdiameterMin", defaultHole: "viaInnerdiameterDefault", maxHole: "viaInnerdiameterMax" };
        if (!Object.keys(dimensions).some((k) => payload[k] !== void 0)) fail2("supply at least one via dimension");
        for (const [key, field] of Object.entries(dimensions)) if (payload[key] !== void 0) {
          if (!Object.hasOwn(form, field)) fail2(`${path}: missing ${field}`);
          change(form, field, convert(payload[key], rule, key), `${path}.form.${field}`, rule.unit);
        }
        for (const side of ["Outer", "Inner"]) range(form[`via${side}diameterMin`], form[`via${side}diameterDefault`], form[`via${side}diameterMax`], `${path}.${side}`);
        for (const bound of ["Min", "Default", "Max"]) {
          const inner = form[`viaInnerdiameter${bound}`], outer = form[`viaOuterdiameter${bound}`];
          if (inner !== null && outer !== null && inner >= outer) fail2(`${path}.${bound}: hole must be smaller than outer diameter`);
        }
      }
    }
    return { ruleConfiguration, ...netRules ? { netRules } : {}, changes };
  }
  function groupFrom(rules, section, category) {
    return object2(own(object2(own(rules, section), section), category), `${section}.${category}`);
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/pcb-net-color.ts
  init_define_LOAD_ACTIONS();
  function readColor(value) {
    const color = value;
    if (!color || ["r", "g", "b", "alpha"].some((k) => {
      const n = color[k];
      return typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 1;
    })) throw new ActionError(ErrorCodes.INVALID_STATE, "Network color is unavailable or does not use the supported normalized RGBA schema.");
    return { r: color.r, g: color.g, b: color.b, alpha: color.alpha };
  }
  var same = (a, b) => ["r", "g", "b", "alpha"].every((k) => Math.abs(a[k] - b[k]) <= 1e-6);
  async function pcbNetColorSet(payload) {
    for (const key of Object.keys(payload)) if (!["net", "color", "dryRun"].includes(key)) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `Unknown net-color field: ${key}`);
    }
    const net = requireString(payload, "net"), color = requireString(payload, "color");
    if (!/^#[0-9a-f]{6}$/i.test(color) || !net.trim() || payload.dryRun !== void 0 && typeof payload.dryRun !== "boolean") {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "net-color requires a non-empty net, #RRGGBB color and optional boolean dryRun.");
    }
    const before = readColor(await eda.pcb_Net.getNetColor(net));
    const requested = { r: parseInt(color.slice(1, 3), 16) / 255, g: parseInt(color.slice(3, 5), 16) / 255, b: parseInt(color.slice(5, 7), 16) / 255, alpha: before.alpha };
    if (payload.dryRun === true) return { result: { dryRun: true, net, before, requested } };
    if (same(before, requested)) return { result: { net, before, requested, actual: before, changed: false, verified: true, partial: false } };
    let written = null, writeError;
    try {
      written = await eda.pcb_Net.setNetColor(net, requested);
    } catch (err) {
      writeError = describeThrown(err);
    }
    let actual = null, readbackError;
    try {
      actual = readColor(await eda.pcb_Net.getNetColor(net));
    } catch (err) {
      readbackError = describeThrown(err);
    }
    const verified = written === true && !!actual && same(actual, requested);
    return {
      result: { net, before, requested, actual, written, writeError, readbackError, verified, partial: !verified },
      ...!verified ? { warnings: ["Network color was not confirmed; inspect before/actual and do not blindly retry."] } : {}
    };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/schematic-netlist-file.ts
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/schematic-readiness.ts
  init_define_LOAD_ACTIONS();

  // .cache/loads/eda@7a73a6834d8d/extension/src/request-budget.ts
  init_define_LOAD_ACTIONS();
  var activeDeadlineAt;
  var BUDGET_REPLY_MARGIN_MS = 1500;
  function remainingBudgetMs(nowMs = Date.now()) {
    if (activeDeadlineAt === void 0) return void 0;
    return Math.max(0, activeDeadlineAt - nowMs - BUDGET_REPLY_MARGIN_MS);
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/schematic-readiness.ts
  var SchematicReadinessError = class extends ActionError {
  };
  function hostState() {
    try {
      const host = globalThis;
      const sch = host.window?.SCH;
      const value = sch?.app?.actionRunner;
      if (!value || typeof value.running !== "boolean" || !("currentAction" in value) || typeof sch?.docMemoryManager?.getActiveDoc !== "function") {
        throw new SchematicReadinessError(ErrorCodes.EDA_API_UNAVAILABLE, "Schematic transaction readiness is unsupported by this host.");
      }
      const document = sch.docMemoryManager.getActiveDoc();
      if (!document || typeof document !== "object") throw new SchematicReadinessError(ErrorCodes.INVALID_STATE, "Active schematic document instance is unavailable.");
      return { runner: value, document };
    } catch (err) {
      throw err instanceof SchematicReadinessError ? err : new SchematicReadinessError(ErrorCodes.INVALID_STATE, `Cannot read schematic readiness: ${String(err)}`);
    }
  }
  function isIdle(value) {
    const action = value.currentAction;
    if (!value.running && action === null) return true;
    if (value.running && action && action.name === "RealTimeSync" && ["willRun", "running", "willDidRun"].includes(action.status)) return false;
    throw new SchematicReadinessError(ErrorCodes.INVALID_STATE, "Schematic has an unknown or non-sync transaction; refusing to write.");
  }
  function captureSchematicReadiness(context) {
    try {
      const state = hostState();
      assertHostDocument(context, state.document);
      return state;
    } catch (err) {
      throw err instanceof SchematicReadinessError ? err : new SchematicReadinessError(ErrorCodes.INVALID_STATE, `Cannot read schematic readiness: ${String(err)}`);
    }
  }
  function assertHostDocument(context, doc) {
    if (doc.uuid !== context.uuid || doc.tabId !== context.tabId || doc.profileSetting?.readonlyMode !== false) {
      throw new SchematicReadinessError(ErrorCodes.INVALID_STATE, "Schematic host identity or writable state is unavailable or changed.");
    }
  }
  function assertSchematicReadinessContext(context, token) {
    const current = captureSchematicReadiness(context);
    if (current.runner !== token.runner || current.document !== token.document) {
      throw new SchematicReadinessError(ErrorCodes.INVALID_STATE, "Schematic runner or document instance changed during this operation.");
    }
  }
  function readinessTimeout(waitedMs) {
    const hidden = pageVisibility() === "hidden";
    return new SchematicReadinessError(ErrorCodes.INVALID_STATE, hidden ? `Schematic RealTimeSync did not settle within the request budget (${waitedMs} ms) while the EasyEDA tab is in the background; read back before any further write, then retry with a longer timeout.` : "Timed out waiting for schematic RealTimeSync; no further writes are allowed.");
  }
  function readinessWaitMs(timeoutMs, hidden, remainingMs) {
    if (!hidden || remainingMs === void 0) return timeoutMs;
    return Math.max(timeoutMs, remainingMs);
  }
  async function waitForSchematicReady(context, timeoutMs = 5e3, captured = captureSchematicReadiness(context), quietMs = 0) {
    timeoutMs = readinessWaitMs(timeoutMs, pageVisibility() === "hidden", remainingBudgetMs());
    const expiresAt = Date.now() + timeoutMs;
    await new Promise((resolve, reject) => {
      let settled = false;
      let poll;
      let idleSince;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        deadline.cancel();
        poll?.cancel();
        if (error) reject(error);
        else resolve();
      };
      const deadline = armDeadline(timeoutMs, () => finish(readinessTimeout(timeoutMs)));
      const check = async () => {
        try {
          const current = await eda.dmt_SelectControl.getCurrentDocumentInfo();
          if (settled) return;
          if (Date.now() >= expiresAt) throw readinessTimeout(timeoutMs);
          if (current?.uuid !== context.uuid || current.tabId !== context.tabId) {
            throw new SchematicReadinessError(ErrorCodes.INVALID_STATE, "Schematic document identity changed while waiting for readiness.");
          }
          assertSchematicReadinessContext(context, captured);
          if (!isIdle(captured.runner)) {
            idleSince = void 0;
            poll = armDeadline(quietMs > 0 ? 10 : 50, () => {
              void check();
            });
            return;
          }
          idleSince ??= Date.now();
          const quietLeft = quietMs - (Date.now() - idleSince);
          if (quietLeft <= 0) finish();
          else poll = armDeadline(Math.min(10, quietLeft), () => {
            void check();
          });
        } catch (err) {
          finish(err instanceof SchematicReadinessError ? err : new SchematicReadinessError(ErrorCodes.INVALID_STATE, `Cannot read schematic readiness: ${String(err)}`));
        }
      };
      void check();
    });
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/schematic-netlist-file.ts
  var NetlistContextError = class extends ActionError {
    constructor(message) {
      super(ErrorCodes.INVALID_STATE, message);
    }
  };
  var NETLIST_EXPORT_QUIET_MS = 150;
  async function getSchematicNetlistFile(fileName, type) {
    let before;
    try {
      before = await eda.dmt_SelectControl.getCurrentDocumentInfo();
    } catch (err) {
      throw new NetlistContextError(`Cannot identify schematic before netlist export: ${String(err)}`);
    }
    if (!before?.uuid || !before.tabId) throw new NetlistContextError("Netlist export requires an identifiable active schematic tab.");
    let readiness;
    try {
      readiness = captureSchematicReadiness({ uuid: before.uuid, tabId: before.tabId });
    } catch (err) {
      throw new NetlistContextError(`Cannot verify schematic readiness before netlist export: ${String(err)}`);
    }
    let file;
    try {
      file = await eda.sch_ManufactureData.getNetlistFile(fileName, type);
    } finally {
      try {
        await waitForSchematicReady({ uuid: before.uuid, tabId: before.tabId }, 5e3, readiness, NETLIST_EXPORT_QUIET_MS);
      } catch (err) {
        if (err instanceof NetlistContextError) throw err;
        throw new NetlistContextError(`Cannot verify schematic readiness after netlist export: ${String(err)}`);
      }
    }
    return file;
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/schematic-page-rename.ts
  init_define_LOAD_ACTIONS();
  var READ_TIMEOUT_MS2 = 2e3;
  function readPageInventory() {
    return new Promise((resolve, reject) => {
      let settled = false;
      const expiresAt = Date.now() + READ_TIMEOUT_MS2;
      const deadline = armDeadline(READ_TIMEOUT_MS2, () => finish(new Error("Page inventory read timed out.")));
      const finish = (error, pages) => {
        if (settled) return;
        settled = true;
        deadline.cancel();
        if (error !== void 0) reject(error);
        else resolve(pages);
      };
      Promise.resolve().then(() => eda.dmt_Schematic.getAllSchematicPagesInfo()).then((pages) => {
        if (Date.now() >= expiresAt) finish(new Error("Page inventory read timed out."));
        else finish(void 0, pages);
      }, (error) => finish(error));
    });
  }
  async function observePage(pageUuid, name2) {
    try {
      const pages = await readPageInventory();
      if (!Array.isArray(pages)) return { status: "unavailable", error: "Page inventory is not an array." };
      const matches = pages.filter((page) => page.uuid === pageUuid);
      if (matches.length === 0) return { status: "missing" };
      if (matches.length !== 1) return { status: "ambiguous" };
      const observed = matches[0].name;
      if (typeof observed !== "string") return { status: "unavailable", error: "Page name is unavailable." };
      return { status: observed === name2 ? "matched" : "different", name: observed };
    } catch (error) {
      return { status: "unavailable", error: String(error) };
    }
  }
  async function renameSchematicPage(pageUuid, name2) {
    let hostAccepted;
    let callError;
    try {
      hostAccepted = await eda.dmt_Schematic.modifySchematicPageName(pageUuid, name2);
    } catch (error) {
      callError = String(error);
    }
    let observed = await observePage(pageUuid, name2);
    const fail3 = (message) => {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, message, JSON.stringify({
        pageUuid,
        requestedName: name2,
        hostAccepted: hostAccepted ?? null,
        callError,
        verified: false,
        observation: observed
      }));
    };
    if (callError !== void 0) fail3("Schematic page rename call failed; write outcome is unknown. Inspect fresh state before any retry.");
    if (hostAccepted !== true) fail3("Host did not confirm schematic page rename. No mutation was retried; inspect the returned readback.");
    for (const delay of [0, 120, 250, 500]) {
      if (delay > 0) {
        await new Promise((resolve) => {
          armDeadline(delay, resolve);
        });
        observed = await observePage(pageUuid, name2);
      }
      if (observed.status === "matched") return { result: { ok: true, verified: true, pageUuid, name: name2 } };
      if (observed.status !== "different") break;
    }
    return fail3("Host accepted schematic page rename, but fresh page name was not verified. Stop dependent writes and inspect the returned readback.");
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/native-footprint-source.ts
  init_define_LOAD_ACTIONS();
  var import_jszip = __toESM(require_jszip_min());
  var MAX_ARCHIVE_BYTES = 64 * 1024 * 1024;
  var MAX_SOURCE_BYTES = 64 * 1024 * 1024;
  var CRC32_TABLE = Array.from({ length: 256 }, (_, value) => {
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 3988292384 ^ value >>> 1 : value >>> 1;
    return value >>> 0;
  });
  async function readProjectNativeSourceArchive(file) {
    if (!file || file.size <= 0 || file.size > MAX_ARCHIVE_BYTES) throw new Error("official project archive is empty or exceeds 64 MiB");
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength !== file.size || bytes.byteLength > MAX_ARCHIVE_BYTES) throw new Error("official project archive size changed while reading");
    const zip = await import_jszip.default.loadAsync(bytes);
    const files = Object.values(zip.files);
    if (files.length > 2048) throw new Error("official project archive exceeds 2048 entries");
    const sources = files.filter((f) => !f.dir && /^[^/\\]+\.epru$/i.test(f.name));
    if (sources.length !== 1) throw new Error(`official project archive has ${sources.length} root .epru files; one is required`);
    const source = sources[0];
    const originalName = source.unsafeOriginalName;
    if (originalName && originalName !== source.name) throw new Error("native source archive path was rewritten");
    const metadata = source._data;
    if (!metadata || !Number.isSafeInteger(metadata.uncompressedSize) || !Number.isInteger(metadata.crc32) || metadata.uncompressedSize < 0 || metadata.uncompressedSize > MAX_SOURCE_BYTES) throw new Error("native source ZIP integrity metadata is unavailable or exceeds 64 MiB");
    const streamingSource = source;
    if (typeof streamingSource.internalStream !== "function") throw new Error("bounded ZIP source streaming is unavailable");
    const stream = streamingSource.internalStream("uint8array");
    const chunks = [];
    let length = 0;
    let crc = 4294967295;
    const sourceBytes = await new Promise((resolve, reject) => {
      let failed = false;
      stream.on("data", (chunk) => {
        if (failed) return;
        length += chunk.byteLength;
        if (length > MAX_SOURCE_BYTES) {
          failed = true;
          stream.pause();
          reject(new Error("native source exceeds 64 MiB"));
          return;
        }
        for (const byte of chunk) crc = CRC32_TABLE[(crc ^ byte) & 255] ^ crc >>> 8;
        chunks.push(chunk);
      });
      stream.on("error", reject);
      stream.on("end", () => {
        if (failed) return;
        if (length !== metadata.uncompressedSize || (crc ^ 4294967295) >>> 0 !== metadata.crc32 >>> 0) {
          reject(new Error("native source ZIP length/CRC32 verification failed"));
          return;
        }
        const result = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.byteLength;
        }
        resolve(result);
      });
      stream.resume();
    });
    return new TextDecoder("utf-8", { fatal: true }).decode(sourceBytes);
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/native-device-source.ts
  init_define_LOAD_ACTIONS();
  var object3 = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : void 0;
  function projectDeviceSourceInventory(text2, documentUuid) {
    if (!documentUuid || text2.length > 64 * 1024 * 1024) throw new Error("native device source target is missing or exceeds 64 MiB");
    const rows = text2.split(/\r?\n/);
    if (rows.length > 2e5) throw new Error("native device source exceeds 200000 rows");
    let last = rows.length - 1;
    while (last >= 0 && !rows[last].trim()) last--;
    const entries2 = [];
    let current, pages = 0;
    for (const [index, raw] of rows.entries()) {
      let line = raw.trim();
      if (!line) continue;
      const delimiter = line.indexOf("||");
      if (delimiter < 0 || !line.endsWith("|") && index !== last) throw new Error("malformed native device source row");
      if (!line.endsWith("|")) {
        JSON.parse(line.slice(delimiter + 2));
        line += "|";
      }
      const header = object3(JSON.parse(line.slice(0, delimiter)));
      if (!header) throw new Error("native device source header is not an object");
      if (header.type === "DOCHEAD") {
        const payload = object3(JSON.parse(line.slice(delimiter + 2, -1)));
        if (!payload) throw new Error("native device DOCHEAD is not an object");
        current = void 0;
        if (payload.docType === "SCH_PAGE" && payload.uuid === documentUuid) pages++;
        if (payload.docType === "DEVICE") {
          if (typeof payload.uuid !== "string") throw new Error("DEVICE DOCHEAD has no instance UUID");
          current = { deviceUuid: payload.uuid, documentSource: line + "\n" };
          entries2.push(current);
          if (entries2.length > 2048) throw new Error("native project exceeds 2048 DEVICE documents");
        }
      } else if (current && header.type === "META") {
        if (!object3(JSON.parse(line.slice(delimiter + 2, -1)))) throw new Error("native DEVICE META is not an object");
        current.documentSource += line + "\n";
      }
    }
    if (pages !== 1) throw new Error(`native project contains ${pages} matching SCH_PAGE documents; one is required`);
    return entries2;
  }
  function readNativeDeviceSource(inventory, instanceUuid) {
    const entries2 = inventory.filter((entry) => entry.deviceUuid === instanceUuid);
    if (!entries2.length) return {};
    if (!/^[0-9a-f]{16}$/i.test(instanceUuid) || entries2.length !== 1) return { error: "native DEVICE source owner is invalid or duplicated" };
    let heads = 0, metas = 0, source;
    try {
      for (const raw of entries2[0].documentSource.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line) continue;
        const delimiter = line.indexOf("||");
        if (delimiter < 0 || !line.endsWith("|")) throw new Error("malformed DEVICE metadata row");
        const header = object3(JSON.parse(line.slice(0, delimiter))), payload = object3(JSON.parse(line.slice(delimiter + 2, -1)));
        if (!header || !payload) throw new Error("DEVICE metadata is not a pair of objects");
        if (header.type === "DOCHEAD") {
          if (++heads !== 1 || payload.docType !== "DEVICE" || payload.uuid !== instanceUuid) throw new Error("DEVICE DOCHEAD does not identify exactly this owner");
        } else if (header.type === "META") {
          if (heads !== 1 || ++metas !== 1) throw new Error("DEVICE META must uniquely follow its DOCHEAD");
          const origin = typeof payload.source === "string" ? /^([0-9a-f]{32})\|([^|\s]+)$/i.exec(payload.source) : null;
          const attrs = object3(payload.attributes);
          if (!origin || !attrs || typeof attrs.Footprint !== "string" || !/^[0-9a-f]{16}$/i.test(attrs.Footprint)) throw new Error("DEVICE source or placed footprint association is incomplete");
          source = { instanceUuid, uuid: origin[1], libraryUuid: origin[2], footprintInstanceUuid: attrs.Footprint, sourceKind: "project-epro2" };
        }
      }
      if (heads !== 1 || metas !== 1 || !source) throw new Error("DEVICE DOCHEAD/META evidence is incomplete");
      return { source };
    } catch (err) {
      return { error: `invalid native DEVICE source: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/placed-device-identity.ts
  init_define_LOAD_ACTIONS();
  var record2 = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  var text = (value) => typeof value === "string" ? value : "";
  var libraryUuid = (value) => /^[0-9a-f]{32}$/i.test(text(value));
  var libraryScope = (value) => /^[^|\s]+$/.test(text(value));
  var stableName = (value) => text(value).startsWith("=") ? "" : text(value);
  var candidateValues = (hit, field) => [text(hit[field]), text(record2(hit.otherProperty)[field === "supplierId" ? "Supplier Part" : "Manufacturer Part"])].filter(Boolean);
  var candidateField = (hit, field) => candidateValues(hit, field)[0] || "";
  function hydratePlacedIdentityCandidate(hit, value) {
    const detail = record2(value), property = record2(detail.property);
    if (!libraryUuid(hit.uuid) || !libraryScope(hit.libraryUuid) || detail.uuid !== hit.uuid || detail.libraryUuid !== hit.libraryUuid) {
      return { error: "device.get identity is missing or conflicts with the search candidate" };
    }
    const searched = readDeviceFootprint(hit), actual = readDeviceFootprint({ association: detail.association });
    if (!libraryUuid(actual.uuid) || !libraryScope(actual.libraryUuid)) return { error: "device.get has no complete library footprint association" };
    for (const field of ["uuid", "libraryUuid"]) {
      if (searched[field] && searched[field] !== actual[field]) return { error: `device.get footprint ${field} conflicts with nonempty search evidence` };
    }
    for (const field of ["supplierId", "manufacturerId"]) {
      const actualValue = text(property[field]);
      if (candidateValues(hit, field).some((value2) => value2 !== actualValue)) return { error: `device.get ${field} conflicts with nonempty search evidence` };
    }
    const searchedName = stableName(hit.name), actualName = stableName(detail.name) || stableName(property.name);
    if (searchedName && !actualName) return { error: "device.get has no stable name for nonempty search evidence" };
    if (searchedName && actualName && searchedName !== actualName) return { error: "device.get name conflicts with nonempty search evidence" };
    return { candidate: {
      ...hit,
      name: searchedName || actualName,
      supplierId: candidateField(hit, "supplierId") || text(property.supplierId),
      manufacturerId: candidateField(hit, "manufacturerId") || text(property.manufacturerId),
      footprint: { uuid: searched.uuid || actual.uuid, libraryUuid: searched.libraryUuid || actual.libraryUuid, name: searched.name || actual.name }
    } };
  }
  async function proveNativePlacedDevice(snapshot, source, reads, deviceSource) {
    const instance = readDeviceFootprint(snapshot), placed = record2(snapshot.device);
    const supplier = text(snapshot.supplierId);
    const mpn = text(snapshot.manufacturerId);
    const name2 = stableName(record2(snapshot.component).name) || stableName(snapshot.name) || stableName(placed.name);
    const query = mpn || name2, originalLibrary = text(placed.libraryUuid);
    const failure = (reason, candidates2 = []) => ({ reason, candidates: candidates2 });
    if (instance.uuid !== source.instanceUuid || !/^[0-9a-f]{16}$/i.test(source.instanceUuid) || instance.libraryUuid !== source.libraryUuid || !libraryScope(source.libraryUuid) || !libraryUuid(source.uuid) || !libraryScope(originalLibrary) || !query || supplier && !/^C\d+$/.test(supplier)) {
      return failure("incomplete native source, original-library scope or exact model/name evidence");
    }
    const call = async (read) => {
      await reads.assertContext();
      const value = await read();
      await reads.assertContext();
      return value;
    };
    if (deviceSource) {
      const componentUuid = text(record2(snapshot.component).uuid);
      if (deviceSource.sourceKind !== "project-epro2" || deviceSource.instanceUuid !== placed.uuid || componentUuid && componentUuid !== deviceSource.instanceUuid || !/^[0-9a-f]{16}$/i.test(deviceSource.instanceUuid) || !libraryUuid(deviceSource.uuid) || deviceSource.libraryUuid !== originalLibrary || deviceSource.footprintInstanceUuid !== source.instanceUuid) {
        return failure("native DEVICE source conflicts with the placed owner, library or footprint association");
      }
      try {
        const hydrated = hydratePlacedIdentityCandidate(
          { uuid: deviceSource.uuid, libraryUuid: deviceSource.libraryUuid },
          await call(() => reads.get(deviceSource.uuid, deviceSource.libraryUuid))
        );
        if (!hydrated.candidate) return failure(`native DEVICE device.get: ${hydrated.error}`);
        const candidate = hydrated.candidate, footprint = readDeviceFootprint(candidate);
        if ((supplier ? candidate.supplierId !== supplier : Boolean(text(candidate.supplierId))) || (mpn ? candidate.manufacturerId !== mpn : candidate.name !== name2) || footprint.uuid !== source.uuid || footprint.libraryUuid !== source.libraryUuid) {
          return failure("native DEVICE official detail conflicts with exact supplier/model/name or native FOOTPRINT source", [candidate]);
        }
        return {
          device: { uuid: deviceSource.uuid, libraryUuid: deviceSource.libraryUuid, via: "native-device-source" },
          ...supplier ? { lcsc: supplier } : {},
          deviceFootprint: footprint.name,
          footprintSource: source
        };
      } catch (err) {
        return failure(`native DEVICE exact detail failed: ${String(err)}`);
      }
    }
    let lcscRows, scopedRows;
    try {
      lcscRows = supplier ? await call(() => reads.byLcsc(supplier)) : [];
      scopedRows = await call(() => reads.search(query, originalLibrary));
    } catch (err) {
      return failure(`complete identity candidate query failed: ${String(err)}`);
    }
    if (!Array.isArray(lcscRows) || !Array.isArray(scopedRows) || lcscRows.length > 128 || scopedRows.length > 128) {
      return failure("complete or scoped identity inventory unavailable or exceeds 128 candidates");
    }
    const rows = [...lcscRows.map(record2), ...scopedRows.map(record2).filter((hit2) => !libraryScope(hit2.libraryUuid) || hit2.libraryUuid === originalLibrary)];
    if (new Set(rows.map((hit2) => JSON.stringify([hit2.libraryUuid, hit2.uuid]))).size > 128) return failure("merged identity inventory exceeds 128 distinct devices");
    const matches = /* @__PURE__ */ new Map(), detailCache = /* @__PURE__ */ new Map();
    const errors = [], candidates = [];
    const relevantKeys = new Set(rows.filter((hit2) => {
      const hitSuppliers = candidateValues(hit2, "supplierId"), hitMpns = candidateValues(hit2, "manufacturerId"), hitName = stableName(hit2.name);
      return (!supplier || !hitSuppliers.length || hitSuppliers.includes(supplier)) && (mpn ? !hitMpns.length || hitMpns.includes(mpn) : !hitName || hitName === name2);
    }).map((hit2) => JSON.stringify([hit2.libraryUuid, hit2.uuid])));
    for (const hit2 of rows) {
      const key = JSON.stringify([hit2.libraryUuid, hit2.uuid]);
      if (!relevantKeys.has(key)) continue;
      if (!libraryUuid(hit2.uuid) || !libraryScope(hit2.libraryUuid)) {
        errors.push("candidate lacks a library device identity");
        continue;
      }
      let detail;
      try {
        if (!detailCache.has(key)) detailCache.set(key, await call(() => reads.get(hit2.uuid, hit2.libraryUuid)));
        detail = detailCache.get(key);
      } catch (err) {
        errors.push(`device.get ${text(hit2.uuid)} failed: ${String(err)}`);
        continue;
      }
      const proof = hydratePlacedIdentityCandidate(hit2, detail);
      if (!proof.candidate) {
        errors.push(`${text(hit2.uuid)}: ${proof.error}`);
        continue;
      }
      const candidate = proof.candidate;
      if (!candidates.some((row) => row.uuid === candidate.uuid && row.libraryUuid === candidate.libraryUuid)) candidates.push(candidate);
      if (supplier && !text(candidate.supplierId)) {
        errors.push("device.get lacks exact supplier evidence");
        continue;
      }
      if (mpn && !text(candidate.manufacturerId)) {
        errors.push("device.get lacks exact model evidence");
        continue;
      }
      if (!mpn && !stableName(candidate.name)) {
        errors.push("device.get lacks stable exact name evidence");
        continue;
      }
      if (supplier && candidate.supplierId !== supplier) continue;
      if (!supplier && text(candidate.supplierId)) continue;
      if (mpn ? candidate.manufacturerId !== mpn : candidate.name !== name2) continue;
      const footprint = readDeviceFootprint(candidate);
      if (footprint.uuid !== source.uuid || footprint.libraryUuid !== source.libraryUuid) continue;
      matches.set(key, candidate);
    }
    try {
      await reads.assertContext();
    } catch (err) {
      return failure(`identity context changed: ${String(err)}`, candidates);
    }
    if (errors.length) return failure(errors.join("; "), candidates);
    if (matches.size !== 1) return failure(matches.size ? `${matches.size} distinct devices match exact LCSC/model and native footprint source \u2014 ambiguous` : "no device matches exact model/name and native footprint source (package-variant mismatch)", candidates);
    const hit = [...matches.values()][0];
    return {
      device: { uuid: text(hit.uuid), libraryUuid: text(hit.libraryUuid), via: supplier ? "lcsc-footprint-source" : "scoped-footprint-source" },
      ...supplier ? { lcsc: supplier } : {},
      deviceFootprint: readDeviceFootprint(hit).name,
      footprintSource: source
    };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/schematic-wire-topology.ts
  init_define_LOAD_ACTIONS();
  var WIRE_CONTACT_EPS = 1e-6;
  function parseObservedWireLine(raw) {
    if (!Array.isArray(raw) || raw.length === 0) throw new Error("Missing observed wire line.");
    const finite = (v) => typeof v === "number" && Number.isFinite(v);
    let segments;
    let rawLine;
    let rawEncoding;
    if (raw.every(finite)) {
      if (raw.length % 4 !== 0) throw new Error("Ambiguous observed flat wire: expected independent four-coordinate segments.");
      rawLine = [...raw];
      rawEncoding = "flat-segments";
      segments = [];
      for (let i = 0; i < raw.length; i += 4) segments.push(raw.slice(i, i + 4));
    } else if (raw.every((r) => Array.isArray(r) && r.length === 4 && r.every(finite))) {
      rawLine = raw.map((r) => [...r]);
      rawEncoding = "nested-segments";
      segments = raw.map((r) => [...r]);
    } else if (raw.length >= 2 && raw.every((r) => Array.isArray(r) && r.length === 2 && r.every(finite))) {
      rawLine = raw.map((r) => [...r]);
      rawEncoding = "nested-polyline";
      segments = [];
      for (let i = 0; i + 1 < raw.length; i++) segments.push([...raw[i], ...raw[i + 1]]);
    } else throw new Error("Invalid or unknown observed wire encoding.");
    return { segments, rawLine, rawEncoding };
  }
  function readObservedWireSegments(wires) {
    if (!Array.isArray(wires)) throw new Error("Wire enumeration did not return an array.");
    return wires.flatMap((w) => {
      const wirePrimitiveId = w.getState_PrimitiveId?.();
      if (typeof wirePrimitiveId !== "string" || !wirePrimitiveId) throw new Error("Missing observed wire primitive identity.");
      const net = w.getState_Net?.() ?? "";
      if (typeof net !== "string") throw new Error(`Invalid net for wire ${wirePrimitiveId}.`);
      const { segments, rawLine, rawEncoding } = parseObservedWireLine(w.getState_Line());
      return segments.map((seg, segmentIndex) => ({ seg, wirePrimitiveId, net, segmentIndex, rawLine, rawEncoding }));
    });
  }
  function wirePointOnSegment(p, s) {
    const e = WIRE_CONTACT_EPS;
    if (![p.x, p.y, ...s].every(Number.isFinite)) return false;
    if (p.x < Math.min(s[0], s[2]) - e || p.x > Math.max(s[0], s[2]) + e || p.y < Math.min(s[1], s[3]) - e || p.y > Math.max(s[1], s[3]) + e) return false;
    return Math.abs((p.x - s[0]) * (s[3] - s[1]) - (p.y - s[1]) * (s[2] - s[0])) <= e * Math.max(1, Math.hypot(s[2] - s[0], s[3] - s[1]));
  }
  function classifyWireSegment(s) {
    if (!s.every(Number.isFinite)) return "non-orthogonal";
    const h = Math.abs(s[1] - s[3]) <= WIRE_CONTACT_EPS;
    const v = Math.abs(s[0] - s[2]) <= WIRE_CONTACT_EPS;
    if (h && v) return "degenerate";
    if (h) return "horizontal";
    if (v) return "vertical";
    return "non-orthogonal";
  }
  function isDegenerateWireSegment(s) {
    return classifyWireSegment(s) === "degenerate";
  }
  function classifyWireContact(a, b) {
    const e = WIRE_CONTACT_EPS;
    const axis = (s) => {
      if (!s.every(Number.isFinite)) return -1;
      const h2 = Math.abs(s[1] - s[3]) <= e, v2 = Math.abs(s[0] - s[2]) <= e;
      if (h2 && v2) return -2;
      return h2 === v2 ? -1 : h2 ? 0 : 1;
    };
    const aa = axis(a), bb = axis(b);
    if (aa === -2 || bb === -2) return "disjoint";
    if (aa < 0 || bb < 0) return "unknown";
    if (aa === bb) {
      const fixed = aa === 0 ? 1 : 0, moving = 1 - fixed;
      if (Math.abs(a[fixed] - b[fixed]) > e) return "disjoint";
      const overlap = Math.min(Math.max(a[moving], a[moving + 2]), Math.max(b[moving], b[moving + 2])) - Math.max(Math.min(a[moving], a[moving + 2]), Math.min(b[moving], b[moving + 2]));
      return overlap < -e ? "disjoint" : overlap > e ? "collinear-overlap" : "endpoint-touch";
    }
    const h = aa === 0 ? a : b, v = aa === 1 ? a : b;
    const p = { x: v[0], y: h[1] };
    if (!wirePointOnSegment(p, a) || !wirePointOnSegment(p, b)) return "disjoint";
    const endOn = (s, other) => wirePointOnSegment({ x: s[0], y: s[1] }, other) || wirePointOnSegment({ x: s[2], y: s[3] }, other);
    return endOn(a, b) || endOn(b, a) ? "endpoint-touch" : "proper-cross";
  }
  function physicalWireIslands(segments, anchors = []) {
    const parent = segments.map((_, i) => i);
    const find = (i) => {
      while (parent[i] !== i) {
        parent[i] = parent[parent[i]];
        i = parent[i];
      }
      return i;
    };
    const union = (a, b) => {
      parent[find(a)] = find(b);
    };
    const describe2 = (i) => {
      const s = segments[i]?.seg;
      return `index=${i} seg=[${s?.join(",")}]`;
    };
    for (let i = 0; i < segments.length; i++) {
      const own2 = classifyWireSegment(segments[i].seg);
      if (own2 === "non-orthogonal") throw new Error(`Non-orthogonal wire segment cannot be reasoned about (${describe2(i)}). Refusing rather than guessing contact topology.`);
      if (own2 === "degenerate") continue;
      for (let j = i + 1; j < segments.length; j++) {
        const relation = classifyWireContact(segments[i].seg, segments[j].seg);
        if (relation === "unknown") throw new Error(`Unknown wire contact between ${describe2(i)} and ${describe2(j)}.`);
        if (relation === "endpoint-touch" || relation === "collinear-overlap" || relation === "proper-cross" && anchors.some((p) => wirePointOnSegment(p, segments[i].seg) && wirePointOnSegment(p, segments[j].seg))) union(i, j);
      }
    }
    const groups = /* @__PURE__ */ new Map();
    segments.forEach((_, i) => {
      const k = find(i);
      const group = groups.get(k) ?? [];
      group.push(i);
      groups.set(k, group);
    });
    return [...groups.values()];
  }
  function assertLegacySimpleWireOperation(segments, selected, delta) {
    const plans = /* @__PURE__ */ new Map();
    for (const id of selected) {
      const own2 = segments.filter((s) => s.wirePrimitiveId === id);
      if (own2.length === 0) continue;
      if (own2.length !== 1) throw new Error(`Wire ${id} has ${own2.length} observed segments, not one; take a fresh raw snapshot and use data-driven sch compose --preserve-instances.`);
      const axis = classifyWireSegment(own2[0].seg);
      if (axis === "degenerate") throw new Error(`Wire ${id} is a zero-length segment at (${own2[0].seg[0]},${own2[0].seg[1]}); delete it instead of moving or disconnecting it.`);
      if (axis === "non-orthogonal") throw new Error(`Wire ${id} is not axis-aligned (seg=[${own2[0].seg.join(",")}]); take a fresh raw snapshot and use data-driven sch compose --preserve-instances.`);
      plans.set(id, own2[0].seg);
    }
    const moved = (s) => delta && selected.has(s.wirePrimitiveId) ? [s.seg[0] + delta.x, s.seg[1] + delta.y, s.seg[2] + delta.x, s.seg[3] + delta.y] : s.seg;
    for (let i = 0; i < segments.length; i++) for (let j = i + 1; j < segments.length; j++) {
      if (!selected.has(segments[i].wirePrimitiveId) && !selected.has(segments[j].wirePrimitiveId)) continue;
      const relations = [classifyWireContact(segments[i].seg, segments[j].seg)];
      if (delta) relations.push(classifyWireContact(moved(segments[i]), moved(segments[j])));
      if (relations.some((r) => r === "proper-cross" || r === "unknown")) throw new Error("Crossing/unknown wire topology is not supported by legacy move/disconnect; take a fresh raw snapshot and use data-driven sch compose --preserve-instances.");
    }
    return plans;
  }
  function resolvePinNetFromWires(pin, segments) {
    const touching = segments.filter((s) => wirePointOnSegment(pin, s.seg));
    if (!touching.length) return { unresolved: "no-touching-wire" };
    const nets = [...new Set(touching.map((s) => s.net).filter((n) => n))];
    if (nets.length === 1) return { net: nets[0] };
    return { unresolved: nets.length ? "conflicting-wire-nets" : "unnamed-wire" };
  }

  // .cache/loads/eda@7a73a6834d8d/extension/src/actions.ts
  function edaError(err, message) {
    const detail = describeThrown(err);
    return new ActionError(ErrorCodes.EDA_CALL_FAILED, message, detail);
  }
  function normalizeDeviceRef(raw, name2) {
    const ref = raw ?? {};
    return {
      libraryUuid: typeof ref.libraryUuid === "string" ? ref.libraryUuid : "",
      uuid: typeof ref.uuid === "string" ? ref.uuid : "",
      name: typeof name2 === "string" ? name2 : ""
    };
  }
  function serializeComponent(component) {
    return {
      primitiveId: component.getState_PrimitiveId(),
      componentType: component.getState_ComponentType(),
      designator: component.getState_Designator(),
      name: component.getState_Name(),
      x: component.getState_X(),
      y: component.getState_Y(),
      rotation: component.getState_Rotation(),
      mirror: component.getState_Mirror(),
      net: component.getState_Net(),
      subPartName: component.getState_SubPartName(),
      addIntoBom: component.getState_AddIntoBom(),
      addIntoPcb: component.getState_AddIntoPcb(),
      uniqueId: component.getState_UniqueId(),
      manufacturer: component.getState_Manufacturer(),
      manufacturerId: component.getState_ManufacturerId(),
      supplier: component.getState_Supplier(),
      supplierId: component.getState_SupplierId(),
      component: component.getState_Component(),
      device: normalizeDeviceRef(component.getState_Component(), component.getState_Name()),
      symbol: component.getState_Symbol(),
      footprint: component.getState_Footprint(),
      otherProperty: component.getState_OtherProperty()
    };
  }
  function serializePin(pin) {
    const readOtherProperty = pin.getState_OtherProperty;
    return {
      primitiveId: pin.getState_PrimitiveId(),
      pinNumber: pin.getState_PinNumber(),
      pinName: pin.getState_PinName(),
      x: pin.getState_X(),
      y: pin.getState_Y(),
      rotation: pin.getState_Rotation(),
      noConnected: pin.getState_NoConnected(),
      // V4 exposes display/text metadata on the pin itself. Preserve it in
      // snapshots so diff/copy/rebuild code cannot silently erase information
      // that did not exist in the old public type package. The capability guard
      // keeps historical recorded fixtures readable.
      otherProperty: typeof readOtherProperty === "function" ? readOtherProperty.call(pin) : void 0
    };
  }
  function summarizeActivePageConnectivity(componentTypes, wires, buses) {
    const summary = {
      scope: "activePage",
      wires: wires.length,
      buses: buses.length,
      netflags: 0,
      netports: 0,
      netlabels: 0,
      shortSymbols: 0
    };
    for (const rawType of componentTypes) {
      switch (String(rawType ?? "")) {
        case "netflag":
          summary.netflags++;
          break;
        case "netport":
          summary.netports++;
          break;
        case "netlabel":
          summary.netlabels++;
          break;
        case "short_symbol":
          summary.shortSymbols++;
          break;
      }
    }
    return summary;
  }
  async function readActivePageConnectivitySummary() {
    try {
      const components = await eda.sch_PrimitiveComponent.getAll();
      const wires = await eda.sch_PrimitiveWire.getAll();
      const buses = await eda.sch_PrimitiveBus.getAll();
      if (!Array.isArray(components)) throw new Error("component getAll() did not return an array");
      if (!Array.isArray(wires)) throw new Error("wire getAll() did not return an array");
      if (!Array.isArray(buses)) throw new Error("bus getAll() did not return an array");
      return summarizeActivePageConnectivity(
        components.map((component) => component.getState_ComponentType()),
        wires,
        buses
      );
    } catch (err) {
      throw edaError(err, "Failed to summarize connectivity on the active schematic page.");
    }
  }
  function serializePcbComponent(component) {
    return {
      primitiveId: component.getState_PrimitiveId(),
      // uniqueId is the SAME namespace the schematic side reports (serializeComponent
      // already exposes it): a component keeps one `gge*` id across both documents,
      // minted by the platform at first sch→PCB import. primitiveId does NOT — each
      // document mints its own — so uniqueId is the only reliable schematic↔PCB join
      // key. `pcb sync-designators` uses it to repair placeholder designators
      // (U? / C? / RF?) on boards wiped by the old attrs_backfill Designator-key bug.
      uniqueId: component.getState_UniqueId(),
      designator: component.getState_Designator(),
      name: component.getState_Name(),
      layer: component.getState_Layer(),
      x: component.getState_X(),
      y: component.getState_Y(),
      rotation: component.getState_Rotation(),
      locked: component.getState_PrimitiveLock(),
      addIntoBom: component.getState_AddIntoBom(),
      manufacturerId: component.getState_ManufacturerId(),
      supplierId: component.getState_SupplierId()
    };
  }
  function pcbPadExtent(shape, rotation) {
    if (!Array.isArray(shape) || shape.length < 2 || typeof shape[0] !== "string") return null;
    if (typeof rotation !== "number" || !Number.isFinite(rotation)) return null;
    const rot = rotation;
    const angle = rot * Math.PI / 180;
    const c = Math.abs(Math.cos(angle));
    const s = Math.abs(Math.sin(angle));
    const positive2 = (value) => typeof value === "number" && Number.isFinite(value) && value > 0;
    if (shape[0] === "NGON") {
      if (!positive2(shape[1])) return null;
      return { width: shape[1], height: shape[1] };
    }
    if (!positive2(shape[1]) || !positive2(shape[2])) return null;
    const w = shape[1], h = shape[2];
    switch (shape[0]) {
      case "ELLIPSE":
        return {
          width: Math.hypot(w * c, h * s),
          height: Math.hypot(w * s, h * c)
        };
      case "OVAL": {
        const d = Math.min(w, h);
        if (w >= h) return { width: c * (w - h) + d, height: s * (w - h) + d };
        return { width: s * (h - w) + d, height: c * (h - w) + d };
      }
      case "RECT":
        return { width: w * c + h * s, height: w * s + h * c };
      default:
        return null;
    }
  }
  function unavailablePcbValue(code, message, value = null) {
    return { value, availability: "unavailable", error: { code, message } };
  }
  function classifyPcbValue(value, name2, valid) {
    if (value === void 0) return unavailablePcbValue("undefined-result", `${name2} returned undefined.`);
    if (value === null) return unavailablePcbValue("null-result", `${name2} returned null.`);
    if (!valid(value)) return unavailablePcbValue("invalid-result", `${name2} returned an invalid value.`, value);
    return { value, availability: "available" };
  }
  function capturePcbValue(getter, name2, valid, optionalProperty = false) {
    if (!getter) return unavailablePcbValue("missing-getter", `${name2} is unavailable.`);
    try {
      const value = getter();
      if (optionalProperty && (value === void 0 || value === null)) return { value: null, availability: "available" };
      return classifyPcbValue(value, name2, valid);
    } catch (err) {
      return unavailablePcbValue("getter-threw", `${name2}: ${describeThrown(err)}`);
    }
  }
  async function captureAsyncPcbValue(getter, name2, valid) {
    if (!getter) return unavailablePcbValue("missing-getter", `${name2} is unavailable.`);
    try {
      return classifyPcbValue(await getter(), name2, valid);
    } catch (err) {
      return unavailablePcbValue("getter-threw", `${name2}: ${describeThrown(err)}`);
    }
  }
  function capturePcbPadGeometry(pad) {
    return {
      shape: capturePcbValue(
        typeof pad.getState_Pad === "function" ? () => pad.getState_Pad() : void 0,
        "getState_Pad",
        (value) => Array.isArray(value) && value.length > 0 && typeof value[0] === "string"
      ),
      specialPad: capturePcbValue(
        typeof pad.getState_SpecialPad === "function" ? () => pad.getState_SpecialPad() : void 0,
        // The official SDK declares specialPad? on the primitive and constructor,
        // and getState_SpecialPad(): Shape | undefined. A successful nullish
        // read is the optional property's absent state, unlike missing/throwing.
        "getState_SpecialPad",
        Array.isArray,
        true
      )
    };
  }
  function capturedPcbPadExtent(geometry, rotation) {
    if (geometry.shape.availability !== "available" || geometry.specialPad.availability !== "available" || geometry.specialPad.value !== null && (!Array.isArray(geometry.specialPad.value) || geometry.specialPad.value.length !== 0)) return null;
    return pcbPadExtent(geometry.shape.value, rotation);
  }
  function padExtent(pad) {
    try {
      return capturedPcbPadExtent(capturePcbPadGeometry(pad), pad.getState_Rotation?.());
    } catch {
      return null;
    }
  }
  function serializePcbPad(pad) {
    const geometry = capturePcbPadGeometry(pad);
    const captureErrors = {};
    if (geometry.shape.error) captureErrors.shape = geometry.shape.error;
    if (geometry.specialPad.error) captureErrors.specialPad = geometry.specialPad.error;
    const hole = capturePcbValue(
      typeof pad.getState_Hole === "function" ? () => pad.getState_Hole() : void 0,
      "getState_Hole",
      (value) => Array.isArray(value) && typeof value[0] === "string",
      true
    );
    const metallization = capturePcbValue(
      typeof pad.getState_Metallization === "function" ? () => pad.getState_Metallization() : void 0,
      "getState_Metallization",
      (value) => typeof value === "boolean"
    );
    if (hole.error) captureErrors.hole = hole.error;
    const rotation = pad.getState_Rotation();
    const record3 = {
      primitiveId: pad.getState_PrimitiveId(),
      padNumber: pad.getState_PadNumber(),
      net: pad.getState_Net(),
      layer: pad.getState_Layer(),
      x: pad.getState_X(),
      y: pad.getState_Y(),
      rotation,
      padType: pad.getState_PadType(),
      // Keep the source tuple.  width/height are only a bbox for general PCB
      // clearance consumers; connectivity evidence must reason from shape.
      shape: geometry.shape.value,
      specialPad: geometry.specialPad.value,
      hole: hole.value,
      availability: { shape: geometry.shape.availability, specialPad: geometry.specialPad.availability, hole: hole.availability },
      captureErrors,
      captureSources: { shape: "getState_Pad", specialPad: "getState_SpecialPad", hole: "getState_Hole" }
    };
    if (metallization.availability === "available") record3.metallization = metallization.value;
    if (geometry.specialPad.availability === "available") record3.specialPadPresent = Array.isArray(geometry.specialPad.value) && geometry.specialPad.value.length > 0;
    const ext = capturedPcbPadExtent(geometry, rotation);
    if (ext) {
      record3.width = ext.width;
      record3.height = ext.height;
    }
    return record3;
  }
  async function blobToArtifact(blob, kind, fileName, fallbackMime) {
    const inlineBase64 = await blobToBase64(blob);
    return {
      id: newArtifactId(),
      kind,
      mimeType: blob.type || fallbackMime,
      fileName,
      inlineBase64
    };
  }
  var projectCurrent = async () => {
    let project;
    try {
      project = await eda.dmt_Project.getCurrentProjectInfo();
    } catch (err) {
      throw edaError(err, "Failed to read current project info.");
    }
    if (!project) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "No current project is open.");
    }
    return {
      result: {
        uuid: project.uuid,
        name: project.name,
        friendlyName: project.friendlyName,
        teamUuid: project.teamUuid,
        description: project.description
      }
    };
  };
  var MAX_PROJECT_SOURCE_BYTES = 8 << 20;
  var projectExportSource = async (payload) => {
    const uuid = requireString(payload, "uuid");
    if (typeof eda.sys_FileManager?.getProjectFile !== "function") {
      throw new ActionError(ErrorCodes.EDA_API_UNAVAILABLE, "Official project-file getter is unavailable in this EasyEDA build.");
    }
    let file;
    try {
      const before = await withTimeout(
        eda.dmt_Project.getCurrentProjectInfo(),
        7e3,
        "project source getCurrentProjectInfo timed out before export after 7000ms"
      );
      if (!before || before.uuid !== uuid) throw new ActionError(ErrorCodes.INVALID_STATE, "Current project UUID does not match the requested project.");
      file = await withTimeout(
        eda.sys_FileManager.getProjectFile("easyeda-agent-project.epro2", void 0, "epro2"),
        15e3,
        "project source getProjectFile timed out after 15000ms"
      );
      const after = await withTimeout(
        eda.dmt_Project.getCurrentProjectInfo(),
        7e3,
        "project source getCurrentProjectInfo timed out after export after 7000ms"
      );
      if (!after || after.uuid !== uuid) throw new ActionError(ErrorCodes.INVALID_STATE, "Current project changed during source export.");
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to export the native project file.");
    }
    if (!file || !Number.isSafeInteger(file.size) || file.size <= 0 || file.size > MAX_PROJECT_SOURCE_BYTES) {
      throw new ActionError(
        ErrorCodes.INVALID_STATE,
        `Official project file is missing, empty, or exceeds the ${MAX_PROJECT_SOURCE_BYTES}-byte transfer limit.`
      );
    }
    const artifact = await blobToArtifact(file, "project_source", "project-source.epro2", "application/octet-stream");
    return { result: { uuid, fileType: "epro2", size: file.size, artifactId: artifact.id }, artifacts: [artifact] };
  };
  var projectFind = async (payload) => {
    const friendlyName = requireString(payload, "friendlyName");
    const teamUuid = optionalString(payload, "teamUuid") || void 0;
    const scope = teamUuid ? "team-root" : "unscoped";
    const matches = [];
    const unreadableUuids = [];
    let uuids;
    try {
      const listed = await eda.dmt_Project.getAllProjectsUuid(teamUuid);
      if (!Array.isArray(listed) || listed.some((uuid) => typeof uuid !== "string" || !uuid)) {
        return { result: {
          friendlyName,
          teamUuid: teamUuid ?? null,
          presence: "unknown",
          matches,
          enumeration: { scope, complete: false, reason: "invalid_uuid_list", uuidCount: 0, readableCount: 0, unreadableUuids }
        } };
      }
      uuids = listed;
    } catch (err) {
      return { result: {
        friendlyName,
        teamUuid: teamUuid ?? null,
        presence: "unknown",
        matches,
        enumeration: { scope, complete: false, reason: "uuid_list_failed", uuidCount: 0, readableCount: 0, unreadableUuids }
      }, warnings: [`Project UUID enumeration failed: ${describeThrown(err)}`] };
    }
    const uniqueUuids = [...new Set(uuids)];
    let readableCount = 0;
    let teamScopeMismatch = false;
    for (const uuid of uniqueUuids) {
      try {
        const info = await eda.dmt_Project.getProjectInfo(uuid);
        if (!info || info.uuid !== uuid || typeof info.friendlyName !== "string" || typeof info.teamUuid !== "string") {
          unreadableUuids.push(uuid);
          continue;
        }
        readableCount++;
        if (teamUuid && info.teamUuid !== teamUuid) {
          teamScopeMismatch = true;
          continue;
        }
        if (info.friendlyName === friendlyName) {
          matches.push({ uuid, friendlyName: info.friendlyName, teamUuid: info.teamUuid, folderUuid: info.folderUuid ?? null });
        }
      } catch {
        unreadableUuids.push(uuid);
      }
    }
    const reason = uuids.length === 0 ? "empty_uuid_list" : uuids.length !== uniqueUuids.length ? "duplicate_uuids" : unreadableUuids.length > 0 ? "project_info_incomplete" : teamScopeMismatch ? "team_scope_mismatch" : !teamUuid ? "team_not_specified" : null;
    const complete = reason === null;
    return { result: {
      friendlyName,
      teamUuid: teamUuid ?? null,
      presence: matches.length > 0 ? "found" : complete ? "absent" : "unknown",
      matches,
      enumeration: { scope, complete, reason, uuidCount: uuids.length, readableCount, unreadableUuids }
    } };
  };
  var projectCreate = async (payload) => {
    const friendlyName = requireString(payload, "friendlyName");
    const projectName = optionalString(payload, "projectName");
    const teamUuid = optionalString(payload, "teamUuid");
    const folderUuid = optionalString(payload, "folderUuid");
    const description = optionalString(payload, "description");
    const open = optionalBoolean(payload, "open") === true;
    let uuid;
    try {
      uuid = await eda.dmt_Project.createProject(
        friendlyName,
        projectName,
        teamUuid,
        folderUuid,
        description
      );
    } catch (err) {
      throw edaError(err, "Failed to create EasyEDA project.");
    }
    if (!uuid) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Project creation returned no UUID.");
    }
    let opened = false;
    if (open) {
      try {
        opened = await eda.dmt_Project.openProject(uuid);
      } catch (err) {
        return {
          result: { partial: true, uuid, friendlyName, projectName: projectName ?? null, created: true, opened: false },
          warnings: [`Project was created, but opening it failed: ${describeThrown(err)}`]
        };
      }
      if (!opened) {
        return {
          result: { partial: true, uuid, friendlyName, projectName: projectName ?? null, created: true, opened: false },
          warnings: ["Project was created, but EasyEDA returned false while opening it; open the created project explicitly before creating documents."]
        };
      }
    }
    return { result: { uuid, friendlyName, projectName: projectName ?? null, created: true, opened } };
  };
  var documentCurrent = async () => {
    let doc;
    try {
      doc = await eda.dmt_SelectControl.getCurrentDocumentInfo();
    } catch (err) {
      throw edaError(err, "Failed to read current document info.");
    }
    if (!doc) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "No active document.");
    }
    return {
      result: {
        uuid: doc.uuid,
        tabId: doc.tabId,
        documentType: documentTypeLabel(doc.documentType),
        documentTypeCode: doc.documentType,
        parentProjectUuid: doc.parentProjectUuid
      }
    };
  };
  var systemPageReload = async (payload) => {
    const projectUuid = requireString(payload, "projectUuid");
    const documentUuid = requireString(payload, "documentUuid");
    const context = await readResponseContext();
    if (context.projectUuid !== projectUuid || context.documentUuid !== documentUuid) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        "Web page reload refused: current project/document differs from the exact requested UUIDs."
      );
    }
    const delayMs = 500;
    try {
      const AsyncFunction = Object.getPrototypeOf(async () => {
      }).constructor;
      const schedule = new AsyncFunction(`
			const page = window.top;
			if (!page || typeof page.location.reload !== 'function') {
				throw new Error('top-level page reload is unavailable');
			}
			setTimeout(() => page.location.reload(), ${delayMs});
		`);
      await schedule();
    } catch (err) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        "Web page reload is unavailable in this connector context.",
        describeThrown(err)
      );
    }
    return { result: { scheduled: true, delayMs, projectUuid, documentUuid }, context };
  };
  var schematicPagesList = async () => {
    let schematics;
    let pages;
    try {
      schematics = await eda.dmt_Schematic.getAllSchematicsInfo();
      pages = await eda.dmt_Schematic.getAllSchematicPagesInfo();
    } catch (err) {
      throw edaError(err, "Failed to list schematics/pages.");
    }
    return {
      result: {
        schematics: schematics.map((s) => ({
          uuid: s.uuid,
          name: s.name,
          parentProjectUuid: s.parentProjectUuid,
          page: s.page.map((p) => ({ uuid: p.uuid, name: p.name, parentSchematicUuid: p.parentSchematicUuid }))
        })),
        pages: pages.map((p) => ({
          uuid: p.uuid,
          name: p.name,
          parentSchematicUuid: p.parentSchematicUuid
        }))
      }
    };
  };
  var schematicPageOpen = async (payload) => {
    const schematicPageUuid = requireString(payload, "schematicPageUuid");
    let tabId;
    try {
      tabId = await eda.dmt_EditorControl.openDocument(schematicPageUuid);
    } catch (err) {
      throw edaError(err, "Failed to open schematic page.");
    }
    if (tabId === void 0) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Failed to open schematic page "${schematicPageUuid}".`);
    }
    const ready = await waitSchematicPageSettle();
    return { result: { tabId, ready } };
  };
  var schematicTitleBlockGet = async (payload) => {
    const pageUuid = optionalString(payload, "pageUuid");
    let info;
    try {
      info = pageUuid ? await eda.dmt_Schematic.getSchematicPageInfo(pageUuid) : await eda.dmt_Schematic.getCurrentSchematicPageInfo();
    } catch (err) {
      throw edaError(err, "Failed to read schematic page title block.");
    }
    if (!info) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "No schematic page found (open a page, or pass a valid pageUuid).");
    }
    return {
      result: {
        pageUuid: info.uuid,
        name: info.name,
        parentSchematicUuid: info.parentSchematicUuid,
        showTitleBlock: info.showTitleBlock,
        titleBlockData: info.titleBlockData
      }
    };
  };
  function titleBlockFieldApplied(actual, want) {
    if (!actual || typeof actual !== "object") return false;
    if (want.value !== void 0 && String(actual.value ?? "") !== String(want.value)) return false;
    if (want.showTitle !== void 0 && actual.showTitle !== want.showTitle) return false;
    if (want.showValue !== void 0 && actual.showValue !== want.showValue) return false;
    return true;
  }
  async function readFocusedTitleBlock() {
    try {
      const info = await eda.dmt_Schematic.getCurrentSchematicPageInfo();
      if (!info) return void 0;
      return {
        showTitleBlock: info.showTitleBlock,
        titleBlockData: info.titleBlockData ?? {}
      };
    } catch {
      return void 0;
    }
  }
  var TITLE_BLOCK_STRUCTURAL_FIELDS = /* @__PURE__ */ new Set([
    "Device",
    "Symbol",
    "ID",
    "Size",
    "Page Size",
    "Width",
    "Height",
    "Blade Width",
    "Region Start",
    "X Region Count",
    "Y Region Count",
    "Title Block Position",
    "Border",
    "Title Block",
    "Color"
  ]);
  function isTitleBlockStructuralKey(key) {
    return key.startsWith("@") || TITLE_BLOCK_STRUCTURAL_FIELDS.has(key);
  }
  var schematicTitleBlockModify = async (payload) => {
    const showTitleBlock = optionalBoolean(payload, "showTitleBlock");
    const titleBlockData = payload.titleBlockData;
    if (titleBlockData !== void 0 && (typeof titleBlockData !== "object" || titleBlockData === null || Array.isArray(titleBlockData))) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Field "titleBlockData" must be an object.');
    }
    if (showTitleBlock === void 0 && titleBlockData === void 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Pass at least one of "showTitleBlock" or "titleBlockData".');
    }
    const requested = titleBlockData ?? {};
    const before = await readFocusedTitleBlock();
    const writableKeys = Object.keys(requested).filter((k) => !isTitleBlockStructuralKey(k));
    const structuralKeys = Object.keys(requested).filter(isTitleBlockStructuralKey);
    const attemptedStructuralEdits = structuralKeys.filter(
      (k) => !titleBlockFieldApplied(before?.titleBlockData?.[k], requested[k])
    );
    if (attemptedStructuralEdits.length > 0) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `\u660E\u7EC6\u8868 modify \u62D2\u7EDD\u6539\u8FD9\u4E9B\u975E\u6587\u672C\u5B57\u6BB5: ${attemptedStructuralEdits.join(", ")}\u3002\u5B83\u4EEC\u662F\u56FE\u7EB8\u7ED3\u6784/\u5E73\u53F0\u6295\u5F71\u5B57\u6BB5(\u56FE\u6846\u7B26\u53F7\u3001\u7EB8\u5F20\u5C3A\u5BF8\u3001\u8FB9\u6846\u5F00\u5173\u3001@\u81EA\u52A8\u5B57\u6BB5),\u5199\u5B83\u4EEC\u4F1A\u628A\u7B26\u53F7\u540D\u704C\u8FDB\u56FE\u6846\u7684 UUID \u5F15\u7528\u4F4D \u2192 EasyEDA \u62A5\u300C\u5668\u4EF6/\u7B26\u53F7\u5C5E\u6027\u6709\u8BEF\u300D,\u4FDD\u5B58\u540E\u91CD\u542F\u62D2\u8F7D = \u56FE\u6846\u4E22\u5931(#186)\u3002**\u672C\u6B21\u4E00\u4E2A\u5B57\u8282\u90FD\u6CA1\u5199\u3002**\u660E\u7EC6\u9879(\u56FE\u7B7E\u4E0A\u7ED9\u4EBA\u586B\u7684\u6587\u672C,\u952E\u540D\u968F\u56FE\u6846\u6A21\u677F\u800C\u5F02)\u7167\u5E38\u53EF\u6539\u3002\u6362\u56FE\u6846/\u6539\u7EB8\u5F20\u8BF7\u8D70 \`sch prim-delete --allow-sheet\` + \`sch place\` \u91CD\u653E\u56FE\u6846\u7B26\u53F7\u3002`
      );
    }
    if (writableKeys.length === 0 && showTitleBlock === void 0) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        "\u6CA1\u6709\u53EF\u5199\u7684\u660E\u7EC6\u9879:\u4F20\u5165\u7684 key \u5168\u662F\u7ED3\u6784/\u6295\u5F71\u5B57\u6BB5(\u5DF2\u6309 #186 \u8FC7\u6EE4),\u4E14\u672A\u4F20 showTitleBlock\u3002\u5148\u8DD1 `sch titleblock-get` \u770B\u672C\u9875\u6709\u54EA\u4E9B\u660E\u7EC6\u9879\u3002\u672C\u6B21\u672A\u505A\u4EFB\u4F55\u4FEE\u6539\u3002"
      );
    }
    const wanted = {};
    for (const k of writableKeys) wanted[k] = requested[k];
    const wantedKeys = writableKeys;
    const ignoredKeys = structuralKeys;
    let ok;
    try {
      ok = await eda.dmt_Schematic.modifySchematicPageTitleBlock(
        showTitleBlock,
        wanted
      );
    } catch (err) {
      throw edaError(err, "Failed to modify schematic page title block.");
    }
    if (ok === false) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        "EasyEDA rejected the title-block modify (returned false)."
      );
    }
    let after = await readFocusedTitleBlock();
    for (let attempt = 0; attempt < 4 && after; attempt++) {
      const settled = wantedKeys.every((key) => titleBlockFieldApplied(after.titleBlockData[key], wanted[key])) && (showTitleBlock === void 0 || after.showTitleBlock === showTitleBlock);
      if (settled) break;
      await sleep(250);
      const retry = await readFocusedTitleBlock();
      if (!retry) break;
      after = retry;
    }
    if (!after) {
      return {
        result: { ok: true, verified: false, requestedKeys: wantedKeys, ...ignoredKeys.length ? { ignoredKeys } : {} },
        warnings: ["\u660E\u7EC6\u8868\u5DF2\u4E0B\u53D1\u4F46\u56DE\u8BFB\u4E0D\u53EF\u7528,\u65E0\u6CD5\u9A8C\u8BC1\u662F\u5426\u771F\u7684\u5199\u5165(verified:false)\u3002"]
      };
    }
    const visibilityApplied = showTitleBlock === void 0 || after.showTitleBlock === showTitleBlock;
    const unknownKeys = before ? wantedKeys.filter((key) => !(key in before.titleBlockData)) : [];
    const notApplied = wantedKeys.filter((key) => !titleBlockFieldApplied(after.titleBlockData[key], wanted[key]));
    const alreadySet = before ? wantedKeys.filter((key) => !notApplied.includes(key) && titleBlockFieldApplied(before.titleBlockData[key], wanted[key])) : [];
    const applied = wantedKeys.filter((key) => !notApplied.includes(key) && !alreadySet.includes(key));
    const somethingFailed = notApplied.length > 0 || !visibilityApplied;
    const nothingProven = applied.length === 0 && !(showTitleBlock !== void 0 && visibilityApplied);
    if (somethingFailed && nothingProven) {
      const failed = [...notApplied, ...visibilityApplied ? [] : ["showTitleBlock"]];
      const hint = unknownKeys.length > 0 ? ` \u5176\u4E2D ${unknownKeys.join(", ")} \u4E0D\u662F\u672C\u9875\u7684\u660E\u7EC6\u9879(\u5148\u8DD1 sch titleblock-get \u770B\u53EF\u7528 key)\u3002` : " \u5148\u8DD1 sch titleblock-get \u786E\u8BA4 key \u62FC\u5199\u4E0E\u5927\u5C0F\u5199\u3002";
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `Title block modify returned success but nothing was applied: ${failed.join(", ")}.${hint}`
      );
    }
    if (somethingFailed) {
      return {
        result: {
          ok: true,
          partial: true,
          verified: true,
          applied,
          alreadySet,
          notApplied,
          unknownKeys,
          visibilityApplied,
          ...ignoredKeys.length ? { ignoredKeys } : {},
          titleBlockBefore: before?.titleBlockData ?? {}
        },
        warnings: [
          `\u660E\u7EC6\u8868\u90E8\u5206\u672A\u751F\u6548: ${[...notApplied, ...visibilityApplied ? [] : ["showTitleBlock"]].join(", ")}(\u5E73\u53F0\u9759\u9ED8\u5FFD\u7565)\u3002` + (applied.length > 0 ? `\u5DF2\u5E94\u7528\u5B50\u96C6(${applied.join(", ")})\u5DF2\u5728\u753B\u5E03\u5E76\u7167\u5E38 autosave;` : "") + (unknownKeys.length > 0 ? `${unknownKeys.join(", ")} \u4E0D\u662F\u672C\u9875\u660E\u7EC6\u9879 \u2014\u2014 \u660E\u7EC6\u8868\u6539\u4E0D\u4E86\u7EB8\u5F20\u5C3A\u5BF8,\u5148 sch titleblock-get \u770B\u53EF\u7528 key\u3002` : "\u5148 sch titleblock-get \u786E\u8BA4 key \u62FC\u5199\u4E0E\u5927\u5C0F\u5199\u3002")
        ]
      };
    }
    return {
      result: {
        ok: true,
        verified: true,
        applied,
        alreadySet,
        visibilityApplied,
        ...ignoredKeys.length ? { ignoredKeys } : {},
        titleBlockBefore: before?.titleBlockData ?? {}
      }
    };
  };
  var schematicPageCreate = async (payload) => {
    const schematicUuid = requireString(payload, "schematicUuid");
    let uuid;
    try {
      uuid = await eda.dmt_Schematic.createSchematicPage(schematicUuid);
    } catch (err) {
      throw edaError(err, "Failed to create schematic page.");
    }
    if (uuid === void 0) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Failed to create schematic page (check schematicUuid).");
    }
    return { result: { pageUuid: uuid } };
  };
  var schematicPageRename = async (payload) => {
    return renameSchematicPage(requireString(payload, "pageUuid"), requireString(payload, "name"));
  };
  async function waitSchematicPageSettle() {
    const delays = [0, 200, 300, 400, 500, 600];
    let last;
    let sawStableEmpty = 0;
    for (const wait of delays) {
      if (wait > 0) {
        await sleep(wait);
      }
      let count;
      try {
        const comps = await eda.sch_PrimitiveComponent.getAll();
        count = Array.isArray(comps) ? comps.length : void 0;
      } catch {
        count = void 0;
      }
      if (count === void 0) continue;
      if (last !== void 0 && last === count) {
        if (count > 0) return true;
        sawStableEmpty++;
        if (sawStableEmpty >= 2) return true;
      }
      last = count;
    }
    return false;
  }
  var schematicPageDelete = async (payload) => {
    const pageUuid = requireString(payload, "pageUuid");
    let ok;
    try {
      ok = await eda.dmt_Schematic.deleteSchematicPage(pageUuid);
    } catch (err) {
      throw edaError(err, "Failed to delete schematic page.");
    }
    return { result: { ok } };
  };
  var schematicRename = async (payload) => {
    const schematicUuid = requireString(payload, "schematicUuid");
    const name2 = requireString(payload, "name");
    let ok;
    try {
      ok = await eda.dmt_Schematic.modifySchematicName(schematicUuid, name2);
    } catch (err) {
      throw edaError(err, "Failed to rename schematic.");
    }
    return { result: { ok } };
  };
  async function tagComponentPages(requireComplete = false) {
    const byId = /* @__PURE__ */ new Map();
    const failures = [];
    let current;
    try {
      current = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (requireComplete && !current?.uuid) throw new Error("original active page is unavailable");
      const pages = await eda.dmt_Schematic.getAllSchematicPagesInfo();
      if (requireComplete && (!Array.isArray(pages) || !pages.length)) throw new Error("schematic page inventory is unavailable or empty");
      for (const page of pages) {
        try {
          await eda.dmt_EditorControl.openDocument(page.uuid);
          if (requireComplete && (await eda.dmt_SelectControl.getCurrentDocumentInfo())?.uuid !== page.uuid) {
            throw new Error("page did not become active");
          }
          const parts = await eda.sch_PrimitiveComponent.getAll();
          if (!Array.isArray(parts)) throw new Error("component inventory is unavailable");
          for (const c of parts) {
            byId.set(c.getState_PrimitiveId(), { pageUuid: page.uuid, pageName: page.name });
          }
        } catch (err) {
          failures.push(`page ${page.uuid}: ${String(err)}`);
        }
      }
    } catch (err) {
      failures.push(String(err));
    } finally {
      try {
        if (current?.uuid) {
          await eda.dmt_EditorControl.openDocument(current.uuid);
          if (requireComplete && (await eda.dmt_SelectControl.getCurrentDocumentInfo())?.uuid !== current.uuid) {
            throw new Error("original page did not become active");
          }
        }
      } catch (err) {
        failures.push(`restore original page: ${String(err)}`);
      }
    }
    if (requireComplete && failures.length) {
      throw edaError(new Error(failures.join("; ")), "Full-project component inventory is incomplete.");
    }
    return byId;
  }
  var schematicDesignatorsList = async () => {
    try {
      const before = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (!before?.uuid) throw new Error("active schematic page identity unavailable");
      const components = await eda.sch_PrimitiveComponent.getAll(void 0, false);
      if (!Array.isArray(components)) throw new Error("current-page component inventory unavailable");
      const parts = components.filter((c) => String(c.getState_ComponentType()) === "part");
      const partIds = /* @__PURE__ */ new Set();
      const refs = /* @__PURE__ */ new Set();
      const attributeIds = /* @__PURE__ */ new Set();
      const designators = [];
      for (const part of parts) {
        const parentId = part.getState_PrimitiveId();
        const ref = part.getState_Designator();
        if (typeof parentId !== "string" || !parentId.trim() || partIds.has(parentId)) throw new Error(`missing/duplicate part primitiveId: ${String(parentId)}`);
        if (typeof ref !== "string" || !ref.trim() || refs.has(ref)) throw new Error(`missing/duplicate part designator: ${String(ref)}`);
        partIds.add(parentId);
        refs.add(ref);
        const attrs = await eda.sch_PrimitiveAttribute.getAll(parentId);
        if (!Array.isArray(attrs)) throw new Error(`Designator inventory unavailable for ${ref} (${parentId})`);
        const candidates = attrs.filter((a) => a.getState_Key() === "Designator");
        if (candidates.length !== 1) throw new Error(`${ref} (${parentId}) requires exactly one Designator attribute, got ${candidates.length}`);
        const attr = candidates[0];
        const id = attr.getState_PrimitiveId();
        const actualParent = attr.getState_ParentPrimitiveId();
        const value = attr.getState_Value();
        const visible = attr.getState_ValueVisible();
        if (typeof id !== "string" || !id.trim() || attributeIds.has(id)) throw new Error(`${ref} has missing/duplicate Designator attribute ID`);
        if (actualParent !== parentId) throw new Error(`${ref} Designator parent mismatch: ${String(actualParent)}`);
        if (value !== ref) throw new Error(`${ref} Designator value mismatch: ${String(value)}`);
        if (visible !== true) throw new Error(`${ref} Designator is hidden or visibility is unknown`);
        attributeIds.add(id);
        const measured = await eda.sch_Primitive.getPrimitivesBBox([id]);
        const bbox = measured;
        if (!bbox || ![bbox.minX, bbox.minY, bbox.maxX, bbox.maxY].every((n) => typeof n === "number" && Number.isFinite(n)) || bbox.maxX <= bbox.minX || bbox.maxY <= bbox.minY) {
          throw new Error(`${ref} Designator has missing or invalid official bbox`);
        }
        designators.push({
          id,
          parentId,
          key: "Designator",
          value,
          visible: true,
          bbox: { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY },
          source: "eda.sch_PrimitiveAttribute.getAll(parentId)+eda.sch_Primitive.getPrimitivesBBox([attributeId])"
        });
      }
      const after = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (after?.uuid !== before.uuid) throw new Error("active schematic page changed during Designator measurement");
      designators.sort((a, b) => String(a.parentId).localeCompare(String(b.parentId)));
      return { result: { documentId: before.uuid, count: designators.length, designators } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Could not measure every current-page Designator.");
    }
  };
  var schematicComponentsList = async (payload) => {
    const allPages = optionalBoolean(payload, "allPages") === true;
    const includePins = optionalBoolean(payload, "includePins") === true;
    const includePinNets = optionalBoolean(payload, "includePinNets") !== false;
    const includeDeviceIdentity = optionalBoolean(payload, "includeDeviceIdentity") === true;
    const identityReadContext = includeDeviceIdentity ? await readResponseContext() : void 0;
    const includeConnectivitySummary = optionalBoolean(payload, "includeConnectivitySummary") === true;
    const connectivitySummary = includeConnectivitySummary ? await readActivePageConnectivitySummary() : null;
    const includeBBox = optionalBoolean(payload, "includeBBox") === true;
    const includeWires = optionalBoolean(payload, "includeWires") === true;
    const includePagePrimitives = optionalBoolean(payload, "includePagePrimitives") === true;
    if (includePagePrimitives && allPages) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "includePagePrimitives requires one active page.");
    const tagPages = optionalBoolean(payload, "tagPages") === true;
    const pageById = tagPages ? await tagComponentPages(allPages) : null;
    let components;
    try {
      components = await eda.sch_PrimitiveComponent.getAll(void 0, allPages);
    } catch (err) {
      throw edaError(err, "Failed to list schematic components.");
    }
    let pinNetsByDesignator = null;
    let ambiguousDesignators = /* @__PURE__ */ new Set();
    let pinNetsAvailable = false;
    let pinNetsError;
    let wireSegmentsPromise;
    const pageWireSegments = () => wireSegmentsPromise ??= (async () => {
      if (allPages) return void 0;
      try {
        return readObservedWireSegments(await eda.sch_PrimitiveWire.getAll());
      } catch {
        return void 0;
      }
    })();
    if (includePins && includePinNets) {
      try {
        const collected = await collectNetlistPinNets();
        pinNetsByDesignator = collected.byDesignator;
        ambiguousDesignators = collected.ambiguous;
        pinNetsAvailable = collected.available;
        pinNetsError = collected.error;
      } catch (err) {
        if (err instanceof NetlistContextError) throw err;
        pinNetsByDesignator = null;
        pinNetsError = describeThrown(err);
      }
    }
    let nativeFootprintInventory;
    const getNativeFootprints = () => nativeFootprintInventory ??= loadNativeFootprintInventory(identityReadContext);
    const identityCache = /* @__PURE__ */ new Map();
    const serialized = [];
    for (const component of components) {
      const record3 = serializeComponent(component);
      if (includeDeviceIdentity && record3.componentType === "part") {
        const rawDevice = record3.device;
        const rawUuid = typeof rawDevice?.uuid === "string" ? rawDevice.uuid : "";
        if (rawUuid.length !== 32) {
          const identityKey = JSON.stringify([record3.device, record3.component, record3.footprint, record3.name, record3.supplierId, record3.manufacturerId]);
          let resolved = identityCache.get(identityKey);
          if (!resolved) {
            resolved = await resolvePlacedDevice(record3, getNativeFootprints, identityReadContext);
            identityCache.set(identityKey, resolved);
          }
          if (resolved.device) {
            record3.placedDevice = rawDevice;
            record3.device = {
              libraryUuid: resolved.device.libraryUuid,
              uuid: resolved.device.uuid,
              name: record3.name ?? ""
            };
            record3.deviceResolution = {
              via: resolved.device.via,
              ...["lcsc-footprint-source", "native-device-source"].includes(resolved.device.via) ? { sameFootprintUUID: true } : {},
              ...resolved.footprintSource ? { footprintSource: resolved.footprintSource } : {},
              ...resolved.lcsc ? { lcsc: resolved.lcsc } : {},
              ...resolved.deviceFootprint ? { footprint: resolved.deviceFootprint } : {}
            };
          } else {
            record3.deviceIdentityError = resolved.reason ?? "no exact library match";
            if (resolved.candidates?.length) record3.deviceIdentityCandidates = resolved.candidates;
          }
        }
      }
      if (pageById) {
        const page = pageById.get(component.getState_PrimitiveId());
        if (page) {
          record3.pageUuid = page.pageUuid;
          record3.pageName = page.pageName;
        }
      }
      if (includeBBox) {
        try {
          const box = await eda.sch_Primitive.getPrimitivesBBox([component.getState_PrimitiveId()]);
          if (box) record3.bbox = box;
        } catch {
        }
      }
      if (includePins) {
        try {
          const pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(
            component.getState_PrimitiveId()
          );
          if (!Array.isArray(pins)) throw new Error("Pin API did not return an array.");
          const designator = String(component.getState_Designator?.() ?? "");
          const ambiguous = ambiguousDesignators.has(designator);
          if (ambiguous) record3.netAmbiguous = true;
          const netByNumber = ambiguous ? null : pinNetsByDesignator?.get(designator) ?? null;
          const symbolKind = String(component.getState_ComponentType?.() ?? "");
          const absentFromNetlist = includePinNets && pinNetsAvailable && !ambiguous && netByNumber === null && (symbolKind === "part" || symbolKind === "block_symbol");
          const wireSegments = absentFromNetlist ? await pageWireSegments() : void 0;
          if (absentFromNetlist) record3.netSource = "wire-geometry";
          record3.pins = pins.map((pin) => {
            const rec = serializePin(pin);
            if (absentFromNetlist) {
              const resolved = wireSegments ? resolvePinNetFromWires({ x: Number(rec.x), y: Number(rec.y) }, wireSegments) : { unresolved: allPages ? "not-in-netlist" : "wires-unreadable" };
              if ("net" in resolved) rec.net = resolved.net;
              else {
                rec.net = null;
                rec.netUnresolved = resolved.unresolved;
              }
              return rec;
            }
            rec.net = netByNumber ? netByNumber.get(String(rec.pinNumber ?? "")) ?? "" : null;
            return rec;
          });
          record3.pinsAvailable = true;
        } catch (err) {
          record3.pinsAvailable = false;
          record3.pinsError = describeThrown(err);
        }
        if (includePins && includePinNets) {
          record3.netlistAvailable = pinNetsAvailable;
          if (!pinNetsAvailable) record3.netlistError = pinNetsError ?? "netlist unavailable";
        }
      }
      serialized.push(record3);
    }
    const wires = [];
    let wiresAvailable = false;
    let wiresError;
    if (includeWires) {
      try {
        const rawWires = await eda.sch_PrimitiveWire.getAll();
        if (!Array.isArray(rawWires)) throw new Error("Wire API did not return an array.");
        for (const s of collectWireSegments(rawWires)) {
          wires.push({ x0: s.seg[0], y0: s.seg[1], x1: s.seg[2], y1: s.seg[3], net: s.net, primitiveId: s.wirePrimitiveId, segmentIndex: s.segmentIndex, rawLine: s.rawLine, rawEncoding: s.rawEncoding });
        }
        wiresAvailable = true;
      } catch (err) {
        wires.length = 0;
        wiresError = describeThrown(err);
      }
    }
    const pagePrimitives = includePagePrimitives ? await readSchPagePrimitiveState() : void 0;
    return {
      result: {
        components: serialized,
        count: serialized.length,
        wires,
        ...includeWires ? { wiresAvailable, ...wiresError ? { wiresError } : {} } : {},
        ...includePagePrimitives ? { pagePrimitives } : {},
        // Netlist trust flag: without it a caller cannot tell "every pin is
        // genuinely unconnected" from "the netlist read failed, so every pin's net
        // is null". Emitted only when the caller asked for pin nets at all.
        ...includePins && includePinNets ? { pinNetsAvailable, ...pinNetsAvailable ? {} : { pinNetsError: pinNetsError ?? "netlist unavailable" } } : {},
        ...connectivitySummary ? { connectivitySummary } : {}
      }
    };
  };
  function planOtherPropertyBackfill(current, source, opts = {}) {
    const { overwrite = false, onlyExistingKeys = false } = opts;
    const filled = [];
    const merged = { ...current };
    for (const [key, value] of Object.entries(source)) {
      if (PROJECTED_STATE_KEYS.has(key)) continue;
      if (value === void 0 || value === null || value === "") continue;
      if (onlyExistingKeys && !(key in current)) continue;
      const existing = current[key];
      if (!overwrite && existing !== void 0 && existing !== null && existing !== "") continue;
      if (existing === value) continue;
      merged[key] = value;
      filled.push(key);
    }
    if (typeof merged["Designator"] === "string" && merged["Designator"].includes("?")) {
      delete merged["Designator"];
      filled.push("Designator (stale placeholder removed)");
    }
    return { merged, filled };
  }
  async function backfillOtherProperty(component, device) {
    let current = {};
    try {
      current = component.getState_OtherProperty() ?? {};
    } catch {
      return { component };
    }
    if (!Object.keys(current).length) return { component };
    let source = {};
    try {
      const item = await eda.lib_Device.get(device.uuid, device.libraryUuid);
      const op = item?.property?.otherProperty;
      if (op && typeof op === "object") source = op;
    } catch {
      return { component };
    }
    if (!Object.keys(source).length) return { component };
    const { merged, filled } = planOtherPropertyBackfill(current, source, { onlyExistingKeys: true });
    if (!filled.length) return { component };
    let designator = "";
    try {
      designator = String(component.getState_Designator() ?? "");
    } catch {
    }
    let supplierId = "";
    try {
      supplierId = String(component.getState_SupplierId() ?? "");
    } catch {
    }
    try {
      const m = await eda.sch_PrimitiveComponent.modify(component.getState_PrimitiveId(), {
        ...designator ? { designator } : {},
        .../^C\d+$/.test(supplierId) ? { supplierId } : {},
        otherProperty: merged
      });
      if (m) return { component: m, filled };
    } catch {
    }
    return {
      component,
      warning: `otherProperty backfill (${filled.join(", ")}) failed \u2014 the instance keeps the platform's empty values; the PCB-side \`sync-attrs\` pass will still fill them later.`
    };
  }
  async function backfillSupplierId(component, device) {
    let current = "";
    try {
      current = String(component.getState_SupplierId() ?? "");
    } catch {
    }
    if (/^C\d+$/.test(current)) return { component };
    let real = "";
    try {
      const item = await eda.lib_Device.get(device.uuid, device.libraryUuid);
      real = String(item?.property?.supplierId ?? "");
    } catch {
    }
    if (!/^C\d+$/.test(real)) return { component };
    try {
      const m = await eda.sch_PrimitiveComponent.modify(component.getState_PrimitiveId(), { supplierId: real });
      if (m) return { component: m, backfilled: real };
    } catch {
    }
    return {
      component,
      warning: `supplierId backfill to ${real} failed \u2014 the instance keeps the platform default (subPartName); fix with \`sch modify --patch '{"supplierId":"${real}"}'\`.`
    };
  }
  var schematicComponentPlace = async (payload) => {
    const libraryUuid2 = requireString(payload, "libraryUuid");
    const uuid = requireString(payload, "uuid");
    const x = requireNumber(payload, "x");
    const y = requireNumber(payload, "y");
    const subPartName = optionalString(payload, "subPartName");
    const rotation = optionalNumber(payload, "rotation");
    const mirror = optionalBoolean(payload, "mirror");
    const addIntoBom = optionalBoolean(payload, "addIntoBom");
    const addIntoPcb = optionalBoolean(payload, "addIntoPcb");
    const designator = optionalString(payload, "designator");
    await preflightV4DeviceVariant(libraryUuid2, uuid);
    let component;
    try {
      component = await eda.sch_PrimitiveComponent.create(
        { libraryUuid: libraryUuid2, uuid },
        x,
        y,
        subPartName,
        rotation,
        mirror,
        addIntoBom,
        addIntoPcb
      );
    } catch (err) {
      throw edaError(err, "Failed to place component.");
    }
    if (!component) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Component placement returned no primitive.");
    }
    if (designator) {
      const primitiveId = component.getState_PrimitiveId();
      let modified;
      try {
        modified = await eda.sch_PrimitiveComponent.modify(primitiveId, { designator });
      } catch (err) {
        throw edaError(err, `Placed component "${primitiveId}" but failed to assign designator "${designator}".`);
      }
      if (!modified) {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Placed component "${primitiveId}" but designator assignment "${designator}" returned no primitive.`
        );
      }
      component = modified;
    }
    const backfill = await backfillSupplierId(component, { libraryUuid: libraryUuid2, uuid });
    component = backfill.component;
    const attrs = await backfillOtherProperty(component, { libraryUuid: libraryUuid2, uuid });
    component = attrs.component;
    const warnings = [backfill.warning, attrs.warning].filter((w) => Boolean(w));
    return {
      result: {
        primitiveId: component.getState_PrimitiveId(),
        component: serializeComponent(component),
        ...backfill.backfilled ? { supplierIdBackfilled: backfill.backfilled } : {},
        ...attrs.filled?.length ? { otherPropertyBackfilled: attrs.filled.sort() } : {}
      },
      ...warnings.length ? { warnings } : {}
    };
  };
  var SCH_MODIFY_PATCH_KEYS = /* @__PURE__ */ new Set([
    "x",
    "y",
    "rotation",
    "mirror",
    "addIntoBom",
    "addIntoPcb",
    "designator",
    "name",
    "uniqueId",
    "manufacturer",
    "manufacturerId",
    "supplier",
    "supplierId",
    "otherProperty",
    "customAttributes"
  ]);
  function propertyApplied(actual, key, expected) {
    if (!(key in actual)) return false;
    const got = actual[key];
    return got === expected || String(got) === String(expected);
  }
  function requireSchematicPropertyPatch(value, field) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Component patch field "${field}" must be an object.`
      );
    }
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (typeof item !== "string" && typeof item !== "number" && typeof item !== "boolean") {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          `Component property "${field}.${key}" must be a string, number, or boolean.`
        );
      }
      out[key] = item;
    }
    return out;
  }
  var schematicComponentModify = async (payload) => {
    const primitiveId = requireString(payload, "primitiveId");
    const patch = payload.patch;
    if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing required object field "patch".');
    }
    const unknownKeys = Object.keys(patch).filter((key) => !SCH_MODIFY_PATCH_KEYS.has(key));
    if (unknownKeys.length > 0) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Unknown component patch field(s): ${unknownKeys.join(", ")}. Allowed: ${[...SCH_MODIFY_PATCH_KEYS].map((k) => k === "customAttributes" ? "customAttributes (alias of otherProperty \u2014 use one, not both)" : k).join(", ")}.`
      );
    }
    const normalizedPatch = { ...patch };
    if (optionalBoolean(payload, "preserveInstance") === true) {
      if (Object.keys(normalizedPatch).some((k) => !["x", "y", "rotation", "mirror"].includes(k))) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "preserveInstance permits geometry-only patches; instance properties cannot be changed.");
      }
      const current = await getComponentOrThrow(primitiveId);
      let source;
      try {
        source = preservedInstance(serializeComponent(current));
      } catch (err) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, describeThrown(err));
      }
      const safePatch = { ...normalizedPatch };
      for (const key of ["designator", "uniqueId", "name", "manufacturer", "manufacturerId", "supplier", "supplierId", "addIntoBom", "addIntoPcb", "otherProperty"]) safePatch[key] = source[key];
      let modified;
      try {
        modified = await eda.sch_PrimitiveComponent.modify(primitiveId, safePatch);
      } catch (err) {
        throw edaError(err, "Failed to move preserved component.");
      }
      if (!modified) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Preserved component modify returned no instance.");
      try {
        const fresh = await getComponentOrThrow(primitiveId);
        const actual = preservedInstance(serializeComponent(fresh));
        const notApplied = Object.keys(source).filter((k) => exactJSON(source[k]) !== exactJSON(actual[k]));
        return { result: {
          component: serializeComponent(fresh),
          instancePreserved: notApplied.length === 0,
          ...notApplied.length ? { partial: true, notApplied, instanceBefore: source } : {}
        } };
      } catch (err) {
        return { result: {
          component: serializeComponent(modified),
          instancePreserved: false,
          verified: false,
          partial: true,
          notApplied: ["instance-readback"],
          instanceBefore: source
        }, warnings: [describeThrown(err)] };
      }
    }
    const hasCustomAttributes = Object.prototype.hasOwnProperty.call(normalizedPatch, "customAttributes");
    const hasOtherProperty = Object.prototype.hasOwnProperty.call(normalizedPatch, "otherProperty");
    if (hasCustomAttributes && hasOtherProperty) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Use either "customAttributes" or "otherProperty" in one component patch, not both.'
      );
    }
    let expectedProperties;
    let propertiesBefore;
    let preservedPropertyKeys;
    if (hasCustomAttributes || hasOtherProperty) {
      const field = hasCustomAttributes ? "customAttributes" : "otherProperty";
      expectedProperties = requireSchematicPropertyPatch(normalizedPatch[field], field);
      const current = await getComponentOrThrow(primitiveId);
      propertiesBefore = cleanOtherProperty(
        current.getState_OtherProperty()
      ) ?? {};
      normalizedPatch.otherProperty = { ...propertiesBefore, ...expectedProperties };
      delete normalizedPatch.customAttributes;
    } else {
      const current = await getComponentOrThrow(primitiveId);
      const existing = cleanOtherProperty(
        current.getState_OtherProperty()
      );
      if (existing) {
        propertiesBefore = existing;
        preservedPropertyKeys = Object.keys(existing);
        normalizedPatch.otherProperty = { ...existing };
      }
    }
    let component;
    try {
      component = await eda.sch_PrimitiveComponent.modify(
        primitiveId,
        normalizedPatch
      );
    } catch (err) {
      throw edaError(err, "Failed to modify component.");
    }
    if (!component) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Failed to modify component "${primitiveId}".`);
    }
    if (expectedProperties || preservedPropertyKeys) {
      let fresh;
      try {
        fresh = await getComponentOrThrow(primitiveId);
      } catch {
      }
      if (!fresh) {
        await sleep(250);
        try {
          fresh = await getComponentOrThrow(primitiveId);
        } catch {
        }
      }
      if (!fresh) {
        return {
          result: {
            component: serializeComponent(component),
            verified: false,
            // 恰是最需要 before 快照支撑恢复的场景(画布状态未经验证)
            propertiesBefore: propertiesBefore ?? {}
          },
          warnings: [
            `\u4FEE\u6539\u5DF2\u63D0\u4EA4,\u4F46\u56DE\u8BFB\u6821\u9A8C\u7EC4\u4EF6 "${primitiveId}" \u5931\u8D25(\u91CD\u8BD5\u4E00\u6B21\u4ECD\u5931\u8D25);\u753B\u5E03\u72B6\u6001\u672A\u7ECF\u9010\u5B57\u6BB5\u9A8C\u8BC1,\u8BF7\u7528 schematic.component.get \u590D\u6838(issue #151)\u3002`
          ]
        };
      }
      const actual = cleanOtherProperty(
        fresh.getState_OtherProperty()
      ) ?? {};
      const before = propertiesBefore ?? {};
      if (!expectedProperties) {
        const lost = Object.keys(before).filter((key) => !propertyApplied(actual, key, before[key]));
        if (lost.length > 0) {
          return {
            result: {
              component: serializeComponent(fresh),
              partial: true,
              notApplied: lost,
              propertiesBefore: before
            },
            warnings: [
              `\u7EC4\u4EF6 "${primitiveId}" \u9876\u5C42\u5B57\u6BB5\u8865\u4E01\u5DF2\u751F\u6548,\u4F46\u81EA\u5B9A\u4E49\u5C5E\u6027\u4FDD\u7559\u5199\u56DE\u540E\u4ECD\u4E22\u5931: ${lost.join(", ")}(\u5E73\u53F0 modify \u6574\u4F53\u91CD\u5199 otherProperty,\u5199\u56DE\u672A\u88AB\u63A5\u53D7);\u91CD\u653E result.propertiesBefore \u53EF\u6062\u590D\u4E22\u5931\u952E(issue #175)\u3002`
            ]
          };
        }
        return {
          result: {
            component: serializeComponent(fresh),
            // 显式回报整体重写中被原样保留的键 + before 快照(审计约定):
            // 调用方能看见「哪些属性被这次顶层补丁连带重写过」,不再有静默面。
            propertiesPreserved: preservedPropertyKeys,
            propertiesBefore: before
          }
        };
      }
      const expectedKeys = Object.keys(expectedProperties);
      const notApplied = expectedKeys.filter((key) => !propertyApplied(actual, key, expectedProperties[key]));
      const alreadySet = expectedKeys.filter((key) => !notApplied.includes(key) && propertyApplied(before, key, expectedProperties[key]));
      const applied = expectedKeys.filter((key) => !notApplied.includes(key) && !alreadySet.includes(key));
      const patchedBeyondProperties = Object.keys(normalizedPatch).some((key) => key !== "otherProperty");
      if (notApplied.length > 0 && applied.length === 0 && !patchedBeyondProperties) {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Component "${primitiveId}" modify returned success but did not apply properties: ${notApplied.join(", ")}.`
        );
      }
      if (notApplied.length > 0) {
        const addedKeys = applied.filter((key) => !(key in before));
        return {
          result: {
            component: serializeComponent(fresh),
            partial: true,
            applied,
            alreadySet,
            notApplied,
            addedKeys,
            propertiesBefore: before
          },
          warnings: [
            `\u7EC4\u4EF6 "${primitiveId}" \u90E8\u5206\u5C5E\u6027\u672A\u751F\u6548: ${notApplied.join(", ")}(SDK \u9759\u9ED8\u5FFD\u7565)\u3002` + (applied.length > 0 ? `\u5DF2\u5E94\u7528\u5B50\u96C6(${applied.join(", ")})\u5DF2\u4FDD\u7559\u5728\u753B\u5E03\u5E76\u7167\u5E38 autosave;` : "\u5C5E\u6027\u5747\u672A\u751F\u6548,\u4F46\u51E0\u4F55/\u5143\u6570\u636E patch \u53EF\u80FD\u5DF2\u751F\u6548(\u7167\u5E38 autosave);") + "\u91CD\u653E result.propertiesBefore \u4EC5\u6062\u590D\u88AB\u8986\u76D6\u952E\u7684\u539F\u503C" + (addedKeys.length > 0 ? `,\u672C\u6B21\u65B0\u589E\u952E(${addedKeys.join(", ")})\u65E0\u6CD5\u7ECF modify \u79FB\u9664,\u9700\u7F16\u8F91\u5668\u624B\u5DE5\u5220\u9664` : "") + "(issue #151)\u3002"
          ]
        };
      }
      component = fresh;
    }
    return {
      result: {
        component: serializeComponent(component),
        // 审计 before/after:属性修改的 before 快照随全量成功一并返回
        // (纯几何 patch 无属性修改,不引入空对象噪音)。
        ...propertiesBefore !== void 0 ? { propertiesBefore } : {}
      }
    };
  };
  function planSchDeleteCascadeTrees(targets, wires, markers, survivorPins) {
    const segments = collectWireSegments(wires.map((w) => ({
      getState_Line: () => w.points,
      getState_PrimitiveId: () => w.id
    })));
    const anchors = [...targets.flatMap((t) => t.pins), ...survivorPins, ...markers];
    if (anchors.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error("Cascade anchor geometry unavailable.");
    const islands = physicalWireIslands(segments, anchors).map((indices) => {
      const segs = indices.map((i) => segments[i]);
      const onTree = (p) => segs.some((s) => wirePointOnSegment(p, s.seg));
      return {
        wireIds: [...new Set(segs.map((s) => s.wirePrimitiveId))],
        flagIds: [...new Set(markers.filter(onTree).map((m) => m.id))],
        ownerIds: targets.filter((t) => t.pins.some(onTree)).map((t) => t.id),
        hasSurvivor: survivorPins.some(onTree)
      };
    });
    const eligible = islands.map((t) => t.ownerIds.length > 0 && !t.hasSurvivor);
    const protectedIds = new Set(islands.flatMap((t, i) => eligible[i] ? [] : t.wireIds));
    let changed = true;
    while (changed) {
      changed = false;
      islands.forEach((t, i) => {
        if (eligible[i] && t.wireIds.some((id) => protectedIds.has(id))) {
          eligible[i] = false;
          t.wireIds.forEach((id) => protectedIds.add(id));
          changed = true;
        }
      });
    }
    return islands.filter((_, i) => eligible[i]).map(({ wireIds, flagIds, ownerIds }) => ({ wireIds, flagIds, ownerIds }));
  }
  async function executeSchDeleteCascade(plannedTrees, removed, deleteContext, alreadyHandled = /* @__PURE__ */ new Set()) {
    const warnings = [];
    const notApplied = [];
    const removedSet = new Set(removed);
    const wireIds = [];
    const flagIds = [];
    for (const tree of plannedTrees) {
      if (tree.ownerIds.some((id) => !removedSet.has(id))) {
        warnings.push(`cascade skipped a stub tree (${tree.wireIds.join(", ")}): component deletion was not verified`);
        continue;
      }
      wireIds.push(...tree.wireIds.filter((id) => !alreadyHandled.has(id)));
      flagIds.push(...tree.flagIds.filter((id) => !alreadyHandled.has(id)));
    }
    if (!wireIds.length && !flagIds.length) return { cascaded: { wires: [], flags: [] }, notApplied, warnings, unverified: {} };
    try {
      await assertSchDeletionContext(deleteContext);
      if (wireIds.length) await deleteSchGroup("wires", wireIds, deleteContext);
      if (flagIds.length) await deleteSchGroup("components", flagIds, deleteContext);
    } catch (err) {
      warnings.push(warnText("cascade delete failed", err));
    }
    const check = await verifySchPrimitiveDeletion({ wires: wireIds, components: flagIds }, deleteContext);
    warnings.push(...check.warnings);
    const wiresLeft = /* @__PURE__ */ new Set([...check.survived.wires ?? [], ...check.unverified.wires ?? []]);
    const flagsLeft = /* @__PURE__ */ new Set([...check.survived.components ?? [], ...check.unverified.components ?? []]);
    notApplied.push(
      ...[...wiresLeft].map((id) => ({ kind: "wire", id })),
      ...[...flagsLeft].map((id) => ({ kind: "flag", id }))
    );
    if (notApplied.length) {
      warnings.push(
        `cascade cleanup: ${notApplied.length} primitive(s) not verified deleted (${notApplied.map((n) => `${n.kind}:${n.id}`).join(", ")}) \u2014 re-read before assuming they are gone.`
      );
    }
    return { cascaded: { wires: check.deleted.wires ?? [], flags: check.deleted.components ?? [] }, notApplied, warnings, unverified: check.unverified };
  }
  async function collectSchDeleteCascadePlan(ids) {
    const idSet = new Set(ids);
    const components = await eda.sch_PrimitiveComponent.getAll();
    const rawWires = await eda.sch_PrimitiveWire.getAll();
    if (!Array.isArray(components) || !Array.isArray(rawWires)) {
      throw new Error("component/wire enumeration did not return arrays");
    }
    const wires = [];
    for (const w of rawWires) {
      wires.push({ id: String(w.getState_PrimitiveId?.() ?? ""), points: w.getState_Line() });
    }
    const NET_MARKER_TYPES = /* @__PURE__ */ new Set(["netflag", "netport", "netlabel", "short_symbol"]);
    const targets = [];
    const markers = [];
    const survivorPins = [];
    for (const c of components) {
      let type = "";
      let pid = "";
      try {
        type = String(c.getState_ComponentType?.() ?? "");
        pid = String(c.getState_PrimitiveId?.() ?? "");
      } catch (err) {
        throw new Error(`Cascade component identity unavailable: ${describeThrown(err)}`);
      }
      if (NET_MARKER_TYPES.has(type)) {
        if (idSet.has(pid)) continue;
        try {
          markers.push({ id: pid, x: c.getState_X(), y: c.getState_Y() });
        } catch (err) {
          throw new Error(`Cascade marker geometry unavailable: ${describeThrown(err)}`);
        }
        continue;
      }
      if (type === SCH_SHEET_TYPE) continue;
      let pins = [];
      try {
        const raw = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(pid);
        if (!Array.isArray(raw)) throw new Error("Pin API did not return an array.");
        pins = raw.map((p) => ({ x: p.getState_X(), y: p.getState_Y() }));
      } catch (err) {
        throw new Error(`Cascade pin geometry unavailable: ${describeThrown(err)}`);
      }
      if (idSet.has(pid)) targets.push({ id: pid, pins });
      else survivorPins.push(...pins);
    }
    return planSchDeleteCascadeTrees(targets, wires, markers, survivorPins);
  }
  var schematicComponentDelete = async (payload) => {
    const deleteContext = await captureSchDeletionContext();
    const primitiveIds = payload.primitiveIds;
    if (!(typeof primitiveIds === "string") && !(Array.isArray(primitiveIds) && primitiveIds.every((id) => typeof id === "string"))) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Missing required field "primitiveIds" (string or string[]).'
      );
    }
    const ids = [...new Set(typeof primitiveIds === "string" ? [primitiveIds] : primitiveIds)];
    const cascade = optionalBoolean(payload, "cascade") !== false;
    const warnings = [];
    let plannedTrees = [];
    if (cascade) {
      try {
        plannedTrees = await collectSchDeleteCascadePlan(ids);
      } catch (err) {
        warnings.push(warnText("cascade cleanup skipped (could not read the scene before deleting)", err));
      }
    }
    try {
      for (let i = 0; i < ids.length; i += SCH_DELETE_BATCH) {
        await waitForSchematicReady(deleteContext, 5e3, deleteContext.readiness);
        await eda.sch_PrimitiveComponent.delete(ids.slice(i, i + SCH_DELETE_BATCH));
      }
    } catch (err) {
      throw edaError(err, "Failed to delete components.");
    }
    const verification = await verifySchPrimitiveDeletion({ components: ids }, deleteContext);
    const survived = verification.survived.components ?? [];
    const unverified = verification.unverified.components ?? [];
    const removed = verification.deleted.components ?? [];
    const cascadeUnverified = {};
    warnings.push(...verification.warnings);
    let cascaded;
    const notApplied = [];
    if (cascade) {
      const done = await executeSchDeleteCascade(plannedTrees, removed, deleteContext);
      cascaded = done.cascaded;
      notApplied.push(...done.notApplied);
      warnings.push(...done.warnings);
      Object.assign(cascadeUnverified, done.unverified);
    }
    return {
      result: {
        deleted: removed.length === ids.length,
        requested: ids.length,
        removed: removed.length,
        deletedIds: removed,
        ...survived.length ? { survived } : {},
        ...unverified.length ? { verified: false, unverified } : {},
        ...Object.keys(cascadeUnverified).length ? { verified: false, cascadeUnverified } : {},
        ...cascaded ? { cascaded } : {},
        ...survived.length || unverified.length || notApplied.length ? { partial: true } : {},
        ...notApplied.length ? { notApplied } : {},
        ...warnings.length ? { warnings } : {}
      },
      ...warnings.length ? { warnings } : {}
    };
  };
  var SCH_PAGE_PRIMITIVE_KINDS = [
    { key: "wires", getAll: () => eda.sch_PrimitiveWire.getAll(), del: (ids) => eda.sch_PrimitiveWire.delete(ids) },
    { key: "buses", getAll: () => eda.sch_PrimitiveBus.getAll(), del: (ids) => eda.sch_PrimitiveBus.delete(ids) },
    { key: "arcs", getAll: () => eda.sch_PrimitiveArc.getAll(), del: (ids) => eda.sch_PrimitiveArc.delete(ids) },
    { key: "circles", getAll: () => eda.sch_PrimitiveCircle.getAll(), del: (ids) => eda.sch_PrimitiveCircle.delete(ids) },
    { key: "rectangles", getAll: () => eda.sch_PrimitiveRectangle.getAll(), del: (ids) => eda.sch_PrimitiveRectangle.delete(ids) },
    { key: "polygons", getAll: () => eda.sch_PrimitivePolygon.getAll(), del: (ids) => eda.sch_PrimitivePolygon.delete(ids) },
    { key: "texts", getAll: () => eda.sch_PrimitiveText.getAll(), del: (ids) => eda.sch_PrimitiveText.delete(ids) }
  ];
  var SCH_PAGE_STATE_FIELDS = {
    wires: ["Line", "Net", "Color", "LineWidth", "LineType"],
    buses: ["BusName", "Line", "Color", "LineWidth", "LineType"],
    arcs: ["StartX", "StartY", "ReferenceX", "ReferenceY", "EndX", "EndY", "Color", "FillColor", "LineWidth", "LineType"],
    circles: ["CenterX", "CenterY", "Radius", "Color", "FillColor", "LineWidth", "LineType", "FillStyle"],
    rectangles: ["TopLeftX", "TopLeftY", "Width", "Height", "CornerRadius", "Rotation", "Color", "FillColor", "LineWidth", "LineType", "FillStyle"],
    polygons: ["Line", "Color", "FillColor", "LineWidth", "LineType"],
    texts: ["X", "Y", "Content", "Rotation", "TextColor", "FontName", "FontSize", "Bold", "Italic", "UnderLine", "AlignMode"],
    attributes: ["X", "Y", "Rotation", "Color", "FontName", "FontSize", "Bold", "Italic", "UnderLine", "AlignMode", "FillColor", "Key", "Value", "KeyVisible", "ValueVisible", "ParentPrimitiveId"],
    objects: ["Content", "StartX", "StartY", "Width", "Height", "Rotation", "Mirror", "FileName"]
  };
  function schPrimitiveStateRecord(primitive, kind, native) {
    const primitiveId = primitive.getState_PrimitiveId();
    const record3 = { primitiveId };
    for (const field of SCH_PAGE_STATE_FIELDS[kind]) {
      const getter = primitive[`getState_${field}`];
      if (typeof getter !== "function") throw new Error(`Page ${kind}.${field} accessor unavailable for ${primitiveId}.`);
      let value = getter.call(primitive);
      if (value === void 0 && kind === "attributes" && native) {
        if (field === "KeyVisible") value = native.keyVisible;
        if (field === "ValueVisible") value = native.valueVisible;
      }
      if (value === void 0 || typeof value === "number" && !Number.isFinite(value) || typeof File !== "undefined" && value instanceof File) throw new Error(`Page ${kind}.${field} state unavailable or unsupported for ${primitiveId}.`);
      record3[field] = value;
    }
    return record3;
  }
  async function readCurrentNativePageAttributes() {
    if (typeof eda.sys_FileManager?.getProjectFile !== "function") throw new Error("Official native project export is unavailable for attribute visibility recovery.");
    const before = await readResponseContext();
    if (!before.projectUuid || !before.documentUuid || before.documentType !== "schematic") throw new Error("Current schematic identity is unavailable for native attribute recovery.");
    const file = await withTimeout(
      eda.sys_FileManager.getProjectFile("easyeda-agent-attribute-source.epro2", void 0, "epro2"),
      15e3,
      "Native attribute project export timed out after 15000ms"
    );
    const after = await readResponseContext();
    if (after.projectUuid !== before.projectUuid || after.documentUuid !== before.documentUuid || after.documentType !== before.documentType || after.tabId !== before.tabId) {
      throw new Error("Current schematic identity changed during native attribute recovery.");
    }
    if (!file || !Number.isSafeInteger(file.size) || file.size <= 0 || file.size > MAX_PROJECT_SOURCE_BYTES) {
      throw new Error("Official native project export is missing, empty, or exceeds the 8 MiB attribute recovery limit.");
    }
    return projectSchematicAttributeInventory(await readProjectNativeSourceArchive(file), before.documentUuid);
  }
  async function schAttributeStateRecord(attribute, nativeReader) {
    try {
      return schPrimitiveStateRecord(attribute, "attributes");
    } catch (firstError) {
      const id = attribute.getState_PrimitiveId();
      const reread = await eda.sch_PrimitiveAttribute.get(id);
      if (!reread || reread.getState_PrimitiveId() !== id) {
        throw new Error(`Page attribute ${id} cannot be reread after ${describeThrown(firstError)}.`);
      }
      try {
        return schPrimitiveStateRecord(reread, "attributes");
      } catch (rereadError) {
        if (nativeReader) {
          const native = (await nativeReader()).get(id);
          if (!native) throw new Error(`Page attribute ${id} is absent from the current native SCH_PAGE source.`);
          const item = reread;
          if (item.getState_Key?.() !== native.key || item.getState_ParentPrimitiveId?.() !== native.parentId || item.getState_Value?.() !== native.value) {
            throw new Error(`Page attribute ${id} identity/value differs from the current native SCH_PAGE source.`);
          }
          try {
            return schPrimitiveStateRecord(reread, "attributes", native);
          } catch (nativeError) {
            throw new Error(`Page attribute ${id} remains unreadable after exact native SCH_PAGE recovery: ${describeThrown(nativeError)}.`);
          }
        }
        throw new Error(`Page attribute ${id} remains unreadable after typed get(id): ${describeThrown(rereadError)}.`);
      }
    }
  }
  function attributeVisibilityValue(value) {
    if (value === void 0) return { type: "undefined", readable: false };
    if (value === null) return { type: "null", value: null, readable: true };
    if (typeof value === "boolean") return { type: "boolean", value, readable: true };
    return { type: typeof value, value: typeof value === "string" || typeof value === "number" ? value : String(value), readable: false };
  }
  function attributeVisibilityRecord(attribute) {
    if (!attribute) return {
      found: false,
      KeyVisible: { type: "unavailable", readable: false },
      ValueVisible: { type: "unavailable", readable: false }
    };
    return {
      found: true,
      primitiveId: attribute.getState_PrimitiveId(),
      KeyVisible: attributeVisibilityValue(attribute.getState_KeyVisible()),
      ValueVisible: attributeVisibilityValue(attribute.getState_ValueVisible())
    };
  }
  async function schematicAttributeInspect(payload) {
    const primitiveId = requireString(payload, "primitiveId");
    const identityBefore = await readResponseContext();
    if (!identityBefore.projectUuid || !identityBefore.documentUuid || identityBefore.documentType !== "schematic") {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Current schematic document identity is unavailable.");
    }
    const all = await eda.sch_PrimitiveAttribute.getAll();
    if (!Array.isArray(all)) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Attribute inventory is unavailable.");
    const matches = all.filter((attribute) => attribute.getState_PrimitiveId() === primitiveId);
    if (matches.length > 1) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Attribute ${primitiveId} appears more than once in the current page inventory.`);
    const bulkRecord = attributeVisibilityRecord(matches[0]);
    const direct = await eda.sch_PrimitiveAttribute.get(primitiveId);
    if (direct && direct.getState_PrimitiveId() !== primitiveId) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Attribute get(${primitiveId}) returned a different primitive ID.`);
    }
    const directRecord = attributeVisibilityRecord(direct);
    const asyncAttribute = direct?.toAsync();
    if (asyncAttribute && asyncAttribute.getState_PrimitiveId() !== primitiveId) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Attribute toAsync(${primitiveId}) returned a different primitive ID.`);
    }
    const reset = asyncAttribute ? await asyncAttribute.reset() : void 0;
    if (reset && reset.getState_PrimitiveId() !== primitiveId) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Attribute reset(${primitiveId}) returned a different primitive ID.`);
    }
    const resetRecord = attributeVisibilityRecord(reset);
    const identityAfter = await readResponseContext();
    if (identityAfter.projectUuid !== identityBefore.projectUuid || identityAfter.documentUuid !== identityBefore.documentUuid || identityAfter.documentType !== identityBefore.documentType || identityAfter.tabId !== identityBefore.tabId) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Current document identity changed while inspecting attribute ${primitiveId}.`);
    }
    return { result: {
      primitiveId,
      identityBefore,
      identityAfter,
      getAll: bulkRecord,
      get: directRecord,
      reset: resetRecord
    } };
  }
  async function schPartPinIds(partIds) {
    const out = [];
    for (const componentId of partIds) {
      const pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(componentId);
      if (!Array.isArray(pins)) throw new Error(`Pins of part ${componentId} are unreadable; pin-owned attributes cannot be classified.`);
      for (const pin of pins) {
        const primitiveId = pin.getState_PrimitiveId();
        if (typeof primitiveId !== "string" || !primitiveId) throw new Error(`A pin of part ${componentId} has no primitive ID.`);
        out.push({ primitiveId, componentId });
      }
    }
    return out.sort((a, b) => a.primitiveId.localeCompare(b.primitiveId));
  }
  async function readSchPagePrimitiveState() {
    const out = {};
    const components = await eda.sch_PrimitiveComponent.getAll();
    if (!Array.isArray(components)) throw new Error("Page component inventory unavailable.");
    out.components = components.map((c) => {
      const record3 = JSON.parse(JSON.stringify(serializeComponent(c)));
      if (record3.componentType === SCH_SHEET_TYPE && record3.otherProperty && typeof record3.otherProperty === "object") {
        const props = record3.otherProperty;
        delete props["@Update Date"];
        delete props["@Update Time"];
      }
      return record3;
    });
    for (const kind of SCH_PAGE_PRIMITIVE_KINDS) {
      const primitives = await kind.getAll();
      if (!Array.isArray(primitives)) throw new Error(`Page ${kind.key} inventory unavailable.`);
      out[kind.key] = primitives.map((primitive) => schPrimitiveStateRecord(primitive, kind.key));
      out[kind.key].sort((a, b) => String(a.primitiveId).localeCompare(String(b.primitiveId)));
    }
    const attributes = /* @__PURE__ */ new Map();
    const globalAttributes = await eda.sch_PrimitiveAttribute.getAll();
    if (!Array.isArray(globalAttributes)) throw new Error("Page attribute inventory unavailable.");
    for (const attribute of globalAttributes) attributes.set(attribute.getState_PrimitiveId(), attribute);
    const globalAttributeIds = await eda.sch_PrimitiveAttribute.getAllPrimitiveId();
    if (!Array.isArray(globalAttributeIds)) throw new Error("Page global attribute ID inventory unavailable.");
    for (const id of globalAttributeIds) {
      if (typeof id !== "string" || !id) throw new Error("Page global attribute ID unavailable.");
      if (!attributes.has(id)) {
        const attribute = await eda.sch_PrimitiveAttribute.get(id);
        if (!attribute) throw new Error(`Page attribute ${id} cannot be read.`);
        attributes.set(id, attribute);
      }
    }
    const globalSet = /* @__PURE__ */ new Set([...globalAttributes.map((a) => a.getState_PrimitiveId()), ...globalAttributeIds]);
    const pins = await schPartPinIds(components.filter((c) => String(c.getState_ComponentType()) === "part").map((c) => c.getState_PrimitiveId()));
    out.pins = pins;
    for (const parentId of [...components.map((c) => c.getState_PrimitiveId()), ...pins.map((p) => p.primitiveId)]) {
      const owned = await eda.sch_PrimitiveAttribute.getAll(parentId);
      if (!Array.isArray(owned)) throw new Error("Page per-component attribute inventory unavailable.");
      for (const attribute of owned) {
        const id = attribute.getState_PrimitiveId();
        if (!globalSet.has(id)) throw new Error("Page global attribute inventory is incomplete; orphan absence cannot be proven.");
        attributes.set(id, attribute);
      }
    }
    const sheets = new Set(components.filter((c) => c.getState_ComponentType() === SCH_SHEET_TYPE).map((c) => c.getState_PrimitiveId()));
    out.attributes = [];
    const attributeValues = [...attributes.values()];
    let nativePromise;
    const nativeReader = () => nativePromise ??= readCurrentNativePageAttributes();
    for (let offset = 0; offset < attributeValues.length; offset += 4) {
      const batch = await Promise.all(attributeValues.slice(offset, offset + 4).map(async (attribute) => {
        const record3 = await schAttributeStateRecord(attribute, nativeReader);
        if (sheets.has(String(record3.ParentPrimitiveId)) && (record3.Key === "@Update Date" || record3.Key === "@Update Time")) record3.Value = null;
        return record3;
      }));
      out.attributes.push(...batch);
    }
    out.attributes.sort((a, b) => String(a.primitiveId).localeCompare(String(b.primitiveId)));
    const objects = await eda.sch_PrimitiveObject.getAll();
    if (!Array.isArray(objects)) throw new Error("Page embedded-object inventory unavailable.");
    out.objects = objects.map((object4) => schPrimitiveStateRecord(object4, "objects"));
    out.objects.sort((a, b) => String(a.primitiveId).localeCompare(String(b.primitiveId)));
    out.components.sort((a, b) => String(a.primitiveId).localeCompare(String(b.primitiveId)));
    return out;
  }
  function independentSchPagePrimitives(page) {
    const parents = new Set([...page.components, ...page.pins ?? []].map((c) => String(c.primitiveId)));
    return {
      orphanAttributes: page.attributes.filter((a) => !parents.has(String(a.ParentPrimitiveId))).map((a) => String(a.primitiveId)),
      objects: page.objects.map((o) => String(o.primitiveId))
    };
  }
  async function verifyExpectedSchPagePrimitives(payload) {
    if (payload.expectedPagePrimitives === void 0) return void 0;
    let expected;
    try {
      expected = JSON.parse(requireString(payload, "expectedPagePrimitives"));
    } catch {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Invalid expectedPagePrimitives JSON.");
    }
    const current = await readSchPagePrimitiveState();
    if (exactJSON(expected) !== exactJSON(current)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "No primitives deleted: page drawing/object state differs from protected snapshot.");
    return current;
  }
  var SCH_COMPONENT_TYPE_KEY = {
    part: "components",
    netflag: "netflags",
    netport: "netports",
    netlabel: "netlabels",
    nonElectrical_symbol: "nonElectricalFlags",
    short_symbol: "shortCircuitFlags",
    sheet: "sheets"
  };
  var SCH_SHEET_TYPE = "sheet";
  function warnText(label, err) {
    return `${label}: ${describeThrown(err)}`;
  }
  var SCH_DELETE_BATCH = 50;
  async function captureSchDeletionContext() {
    const doc = await eda.dmt_SelectControl.getCurrentDocumentInfo();
    if (!doc?.uuid || !doc.tabId) throw new ActionError(ErrorCodes.INVALID_STATE, "Cannot identify the schematic tab for deletion.");
    const context = { uuid: doc.uuid, tabId: doc.tabId };
    return { ...context, readiness: captureSchematicReadiness(context) };
  }
  async function assertSchDeletionContext(expected) {
    const actual = await eda.dmt_SelectControl.getCurrentDocumentInfo();
    if (actual?.uuid !== expected.uuid || actual.tabId !== expected.tabId) throw new ActionError(ErrorCodes.INVALID_STATE, "Schematic tab changed during deletion; outcome unknown.");
    assertSchematicReadinessContext(expected, expected.readiness);
  }
  function checkedSchPrimitiveIds(live) {
    if (!Array.isArray(live)) throw new Error("getAll did not return an array");
    const ids = live.map((p) => {
      const id = p?.getState_PrimitiveId();
      if (typeof id !== "string" || !id) throw new Error("getAll returned an invalid primitive ID");
      return id;
    });
    if (new Set(ids).size !== ids.length) throw new Error("getAll returned duplicate primitive IDs");
    return ids;
  }
  async function verifySchPrimitiveDeletion(idsByKey, context) {
    const deleted = {};
    const survived = {};
    const unverified = {};
    const warnings = [];
    for (const [key, ids] of Object.entries(idsByKey)) {
      if (!ids.length) continue;
      const kind = SCH_PAGE_PRIMITIVE_KINDS.find((k) => k.key === key);
      try {
        await assertSchDeletionContext(context);
        const live = key === "objects" ? await eda.sch_PrimitiveObject.getAll() : kind ? await kind.getAll() : await eda.sch_PrimitiveComponent.getAll();
        const alive = new Set(checkedSchPrimitiveIds(live));
        await assertSchDeletionContext(context);
        survived[key] = ids.filter((id) => alive.has(id));
        deleted[key] = ids.filter((id) => !alive.has(id));
      } catch (err) {
        unverified[key] = [...ids];
        warnings.push(warnText(`delete readback unavailable for ${key}; outcome unknown`, err));
      }
    }
    return { deleted, survived, unverified, warnings };
  }
  async function deleteSchGroup(key, ids, context) {
    const kind = SCH_PAGE_PRIMITIVE_KINDS.find((k) => k.key === key);
    for (let i = 0; i < ids.length; i += SCH_DELETE_BATCH) {
      if (context) await waitForSchematicReady(context, 5e3, context.readiness);
      const batch = ids.slice(i, i + SCH_DELETE_BATCH);
      if (key === "objects") {
        if (!await deleteSchPagePrimitives(batch)) await eda.sch_PrimitiveObject.delete(batch);
        continue;
      }
      if (!kind) {
        await eda.sch_PrimitiveComponent.delete(batch);
        continue;
      }
      if (!await deleteSchPagePrimitives(batch)) await kind.del(batch);
    }
  }
  async function deleteSchPagePrimitives(ids) {
    const generic = eda.sch_PrimitiveObject;
    if (typeof generic?.delete !== "function") return false;
    await generic.delete(ids);
    return true;
  }
  var MAX_CLEAR_PASSES = 6;
  async function enumerateSchPagePrimitives(preserveSheet, warnings) {
    const idsByKey = {};
    let components;
    try {
      components = await eda.sch_PrimitiveComponent.getAll();
    } catch (err) {
      throw edaError(err, "Failed to enumerate schematic components.");
    }
    for (const c of components) {
      const type = String(c.getState_ComponentType());
      if (preserveSheet && type === SCH_SHEET_TYPE) continue;
      const key = SCH_COMPONENT_TYPE_KEY[type] ?? "otherComponents";
      (idsByKey[key] ??= []).push(c.getState_PrimitiveId());
    }
    for (const kind of SCH_PAGE_PRIMITIVE_KINDS) {
      try {
        for (const p of await kind.getAll()) (idsByKey[kind.key] ??= []).push(p.getState_PrimitiveId());
      } catch (err) {
        warnings.push(warnText(`enumerate ${kind.key}`, err));
      }
    }
    return idsByKey;
  }
  function countIds(idsByKey) {
    let n = 0;
    for (const ids of Object.values(idsByKey)) n += ids.length;
    return n;
  }
  var schematicPageClearPreservingParts = async (payload) => {
    if (optionalBoolean(payload, "preserveSheet") === false) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "preserveParts requires preserving the sheet.");
    const requested = requireStringArray(payload, "preservePartIds");
    if (!requested.length || requested.some((id) => !id.trim()) || new Set(requested).size !== requested.length) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "preservePartIds requires a complete unique nonempty part ID set.");
    const ids = [...requested].sort();
    const dryRun = optionalBoolean(payload, "dryRun") === true;
    let source;
    let protectedAttributes;
    let protectedPins;
    let protectedAttributeState;
    let nativePromise;
    let attributeCoverage = "existing-parents";
    const collect = async () => {
      const components = await eda.sch_PrimitiveComponent.getAll();
      const parts = components.filter((c) => String(c.getState_ComponentType()) === "part");
      const actualIds = parts.map((c) => c.getState_PrimitiveId()).sort();
      if (exactJSON(actualIds) !== exactJSON(ids)) throw new Error("preserveParts: fresh part set differs from explicit preservePartIds");
      const sheets = components.filter((c) => String(c.getState_ComponentType()) === SCH_SHEET_TYPE);
      if (sheets.length !== 1) throw new Error("preserveParts requires exactly one existing sheet");
      const current = {};
      const nativeIds = /* @__PURE__ */ new Set();
      for (const part of parts) {
        const state = preservedInstance(serializeComponent(part), true);
        const nativeId = String(state.uniqueId);
        if (nativeIds.has(nativeId)) throw new Error("preserveParts: duplicate native uniqueId");
        nativeIds.add(nativeId);
        current[part.getState_PrimitiveId()] = state;
      }
      if (source && exactJSON(source) !== exactJSON(current)) throw new Error("preserveParts: original instance state changed during clear");
      if (!source) source = current;
      const warnings2 = [];
      const groups = await enumerateSchPagePrimitives(true, warnings2);
      if (warnings2.length) throw new Error(warnings2.join("; "));
      if (exactJSON([...groups.components ?? []].sort()) !== exactJSON(ids)) throw new Error("preserveParts: part set changed during enumeration");
      delete groups.components;
      const pins = (await schPartPinIds(ids)).map((p) => p.primitiveId);
      if (protectedPins && exactJSON(protectedPins) !== exactJSON(pins)) throw new Error("preserveParts: preserved pin set changed during clear");
      if (!protectedPins) protectedPins = pins;
      const protectedParents = /* @__PURE__ */ new Set([...ids, ...pins, sheets[0].getState_PrimitiveId()]);
      const protectedIds = new Set(protectedParents);
      const attributes = /* @__PURE__ */ new Map();
      const globalAttributes = await eda.sch_PrimitiveAttribute.getAll();
      for (const attribute of globalAttributes) attributes.set(attribute.getState_PrimitiveId(), attribute);
      for (const parentId of [...components.map((c) => c.getState_PrimitiveId()), ...pins]) {
        for (const attribute of await eda.sch_PrimitiveAttribute.getAll(parentId)) attributes.set(attribute.getState_PrimitiveId(), attribute);
      }
      const globalIds = new Set(globalAttributes.map((a) => a.getState_PrimitiveId()));
      attributeCoverage = attributes.size > 0 && [...attributes.keys()].every((id) => globalIds.has(id)) ? "global-and-existing-parents" : "existing-parents";
      const owned = [];
      for (const attribute of attributes.values()) {
        const id = attribute.getState_PrimitiveId();
        if (protectedParents.has(attribute.getState_ParentPrimitiveId())) {
          protectedIds.add(id);
          owned.push(id);
        } else (groups.orphanAttributes ??= []).push(id);
      }
      owned.sort();
      if (protectedAttributes && exactJSON(protectedAttributes) !== exactJSON(owned)) throw new Error("preserveParts: original owned attribute IDs changed during clear");
      if (!protectedAttributes) protectedAttributes = owned;
      const nativeReader = () => nativePromise ??= readCurrentNativePageAttributes();
      const ownedState = [];
      for (const id of owned) ownedState.push(await schAttributeStateRecord(attributes.get(id), nativeReader));
      if (protectedAttributeState && exactJSON(protectedAttributeState) !== exactJSON(ownedState)) throw new Error("preserveParts: a preserved attribute changed (value, visibility or geometry) during clear");
      if (!protectedAttributeState) protectedAttributeState = ownedState;
      for (const object4 of await eda.sch_PrimitiveObject.getAll()) {
        const id = object4.getState_PrimitiveId();
        if (!protectedIds.has(id) && !Object.values(groups).some((group) => group.includes(id))) (groups.objects ??= []).push(id);
      }
      return groups;
    };
    let first;
    try {
      first = await collect();
    } catch (err) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `No primitives deleted: ${describeThrown(err)}`);
    }
    await verifyExpectedSchPagePrimitives(payload);
    let live = first, passes = 0;
    const warnings = [];
    if (!dryRun) {
      while (countIds(live) > 0 && passes < MAX_CLEAR_PASSES) {
        passes++;
        try {
          for (const [key, group] of Object.entries(live)) {
            if (key === "orphanAttributes" || key === "objects") {
              for (let i = 0; i < group.length; i += SCH_DELETE_BATCH) {
                const batch = group.slice(i, i + SCH_DELETE_BATCH);
                if (!await deleteSchPagePrimitives(batch)) {
                  if (key === "orphanAttributes") throw new Error("Generic persisted deletion is required for orphan attributes.");
                  else await eda.sch_PrimitiveObject.delete(batch);
                }
              }
            } else await deleteSchGroup(key, group);
          }
          live = await collect();
        } catch (err) {
          warnings.push(describeThrown(err));
          return { result: {
            preserveParts: true,
            preservedPartIds: ids,
            instancesPreserved: false,
            dryRun,
            deletedIds: first,
            remaining: countIds(live),
            passes,
            warnings,
            partial: true,
            notApplied: ["preserved-clear-verification"]
          } };
        }
      }
    }
    const remaining = countIds(live);
    const deleted = {};
    for (const [key, group] of Object.entries(first)) deleted[key] = dryRun ? group.length : group.length - (live[key]?.length ?? 0);
    return { result: {
      preserveParts: true,
      preserveSheet: true,
      preservedPartIds: ids,
      instancesPreserved: true,
      deleted,
      deletedIds: first,
      total: dryRun ? countIds(first) : countIds(first) - remaining,
      remaining,
      passes,
      dryRun,
      attributeCoverage,
      preservedAttributeIds: protectedAttributes,
      preservedPinIds: protectedPins,
      ...attributeCoverage === "existing-parents" ? { coverageNotes: ["Unscoped attribute inventory is not proven complete; attributes without a discoverable existing parent remain unverified."] } : {},
      ...!dryRun && remaining ? { partial: true, notApplied: ["remaining-primitives"], warnings: [`${remaining} drawing primitives remain`] } : {}
    } };
  };
  var schematicPageClear = async (payload) => {
    if (optionalBoolean(payload, "preserveParts") === true) return schematicPageClearPreservingParts(payload);
    if (payload.preservePartIds != null) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "preservePartIds requires preserveParts:true.");
    const preserveSheet = optionalBoolean(payload, "preserveSheet") !== false;
    const dryRun = optionalBoolean(payload, "dryRun") === true;
    const warnings = [];
    const firstPass = await enumerateSchPagePrimitives(preserveSheet, warnings);
    if (payload.expectedPagePrimitives !== void 0 && warnings.length) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `No primitives deleted: ${warnings.join("; ")}`);
    const protectedPage = await verifyExpectedSchPagePrimitives(payload);
    if (protectedPage) {
      const independent = independentSchPagePrimitives(protectedPage);
      if (independent.orphanAttributes.length || independent.objects.length) throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `No primitives deleted: ordinary clear cannot prove removal of ${independent.orphanAttributes.length} orphan attributes and ${independent.objects.length} embedded objects.`
      );
    }
    if (payload.requireCompleteInventory === true) {
      const current = protectedPage ?? await readSchPagePrimitiveState();
      const independent = independentSchPagePrimitives(current);
      if (independent.orphanAttributes.length || independent.objects.length) throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `Page is not empty: ${independent.orphanAttributes.length} orphan attributes and ${independent.objects.length} embedded objects remain.`
      );
    }
    const initialTotal = countIds(firstPass);
    if (dryRun) {
      const planned = {};
      for (const [key, ids] of Object.entries(firstPass)) planned[key] = ids.length;
      return {
        result: {
          deleted: planned,
          total: initialTotal,
          deletedIds: firstPass,
          passes: 0,
          remaining: initialTotal,
          preserveSheet,
          dryRun,
          ...warnings.length ? { warnings } : {}
        }
      };
    }
    let live = firstPass;
    let passes = 0;
    let stalls = 0;
    while (countIds(live) > 0 && passes < MAX_CLEAR_PASSES) {
      passes++;
      const before = countIds(live);
      for (const [key, ids] of Object.entries(live)) {
        if (!ids.length) continue;
        try {
          await deleteSchGroup(key, ids);
        } catch (err) {
          warnings.push(warnText(`delete ${key} (pass ${passes})`, err));
        }
      }
      live = await enumerateSchPagePrimitives(preserveSheet, warnings);
      if (countIds(live) >= before) {
        if (++stalls >= 2) break;
        await sleep(600);
      } else stalls = 0;
    }
    const remaining = countIds(live);
    if (remaining > 0) {
      warnings.push(`page NOT fully cleared: ${remaining} primitive(s) survived ${passes} pass(es) \u2014 they may be locked or platform-protected; inspect with \`easyeda sch list\``);
    }
    const deleted = {};
    for (const [key, ids] of Object.entries(firstPass)) {
      deleted[key] = ids.length - (live[key]?.length ?? 0);
    }
    return {
      result: {
        deleted,
        total: initialTotal - remaining,
        enumerated: initialTotal,
        remaining,
        passes,
        deletedIds: firstPass,
        preserveSheet,
        dryRun,
        ...warnings.length ? { warnings } : {}
      }
    };
  };
  var schematicPrimitivesDelete = async (payload) => {
    const raw = payload.primitiveIds;
    let requested;
    if (typeof raw === "string") {
      requested = [raw];
    } else if (Array.isArray(raw) && raw.every((id) => typeof id === "string")) {
      requested = raw;
    } else {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Missing required field "primitiveIds" (string or string[]); deleting the canvas selection is not supported.'
      );
    }
    const deleteContext = await captureSchDeletionContext();
    const index = /* @__PURE__ */ new Map();
    const enumerationWarnings = [];
    try {
      for (const id of checkedSchPrimitiveIds(await eda.sch_PrimitiveComponent.getAll())) index.set(id, "components");
    } catch (err) {
      throw edaError(err, "Failed to enumerate schematic components.");
    }
    for (const kind of SCH_PAGE_PRIMITIVE_KINDS) {
      try {
        for (const id of checkedSchPrimitiveIds(await kind.getAll())) index.set(id, kind.key);
      } catch (err) {
        enumerationWarnings.push(warnText(`enumerate ${kind.key}`, err));
      }
    }
    try {
      for (const id of checkedSchPrimitiveIds(await eda.sch_PrimitiveObject.getAll())) index.set(id, "objects");
    } catch (err) {
      enumerationWarnings.push(warnText("enumerate objects", err));
    }
    await assertSchDeletionContext(deleteContext);
    let targets = requested;
    const idsByKey = {};
    const notFound = [];
    const unlocated = [];
    targets = [...new Set(targets)];
    for (const id of targets) {
      const key = index.get(id);
      if (!key) {
        (enumerationWarnings.length ? unlocated : notFound).push(id);
        continue;
      }
      (idsByKey[key] ??= []).push(id);
    }
    const warnings = [];
    const cascade = optionalBoolean(payload, "cascade") === true;
    let plannedTrees = [];
    if (cascade && idsByKey.components?.length) {
      try {
        plannedTrees = await collectSchDeleteCascadePlan(idsByKey.components);
      } catch (err) {
        warnings.push(warnText("cascade cleanup skipped (could not read the scene before deleting)", err));
      }
    }
    for (const [key, ids] of Object.entries(idsByKey)) {
      if (!ids.length) continue;
      try {
        await assertSchDeletionContext(deleteContext);
        await deleteSchGroup(key, ids, deleteContext);
      } catch (err) {
        if (err instanceof SchematicReadinessError) throw err;
        warnings.push(warnText(`delete ${key}`, err));
      }
    }
    const verification = await verifySchPrimitiveDeletion(idsByKey, deleteContext);
    if (!Object.keys(idsByKey).length) await assertSchDeletionContext(deleteContext);
    if (unlocated.length) {
      verification.unverified.unknownKind = unlocated;
      verification.warnings.push(...enumerationWarnings);
    }
    const survivedByKey = verification.survived;
    warnings.push(...verification.warnings);
    const deleted = {};
    const deletedIds = {};
    let total = 0;
    let survivedTotal = 0;
    for (const [key, ids] of Object.entries(idsByKey)) {
      const survived2 = survivedByKey[key] ?? [];
      const gone = verification.deleted[key] ?? [];
      deleted[key] = gone.length;
      if (gone.length) deletedIds[key] = gone;
      total += gone.length;
      survivedTotal += survived2.length;
    }
    const survived = Object.fromEntries(
      Object.entries(survivedByKey).filter(([, ids]) => ids.length)
    );
    let cascadeResult;
    if (cascade) {
      cascadeResult = await executeSchDeleteCascade(plannedTrees, verification.deleted.components ?? [], deleteContext, new Set(targets));
      warnings.push(...cascadeResult.warnings);
    }
    if (survivedTotal) {
      warnings.push(
        `${survivedTotal} primitive(s) survived the delete and are still on the page (${Object.entries(survived).map(([k, v]) => `${k}:${v.length}`).join(", ")}). Re-read before assuming they are gone; some primitive classes accept the delete call and keep the primitive (issue #164).`
      );
    }
    return {
      result: {
        deleted,
        total,
        requested: targets.length,
        deletedIds,
        ...survivedTotal ? { partial: true, survived, survivedTotal } : {},
        ...Object.keys(verification.unverified).length ? { partial: true, verified: false, unverified: verification.unverified } : {},
        ...cascadeResult ? { cascaded: cascadeResult.cascaded } : {},
        ...cascadeResult?.notApplied.length ? { partial: true, notApplied: cascadeResult.notApplied } : {},
        ...cascadeResult && Object.keys(cascadeResult.unverified).length ? { verified: false, cascadeUnverified: cascadeResult.unverified } : {},
        ...notFound.length ? { notFound } : {},
        ...warnings.length ? { warnings } : {}
      },
      ...warnings.length ? { warnings } : {}
    };
  };
  var schematicWireCreate = async (payload) => {
    const points = normalizeWirePoints(payload.points);
    const net = optionalString(payload, "net");
    const color = optionalString(payload, "color") ?? null;
    const lineWidth = optionalNumber(payload, "lineWidth") ?? null;
    const lineType = payload.lineType ?? null;
    let wire;
    try {
      wire = await eda.sch_PrimitiveWire.create(
        points,
        net,
        color,
        lineWidth,
        lineType
      );
    } catch (err) {
      throw edaError(err, "Failed to create wire.");
    }
    if (!wire) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Wire creation returned no primitive.");
    }
    return {
      result: {
        primitiveId: wire.getState_PrimitiveId(),
        net: wire.getState_Net(),
        line: wire.getState_Line()
      }
    };
  };
  var MAX_SCH_IMAGE_SOURCE_BYTES = 8 << 20;
  var SCH_IMAGE_MIME_BY_EXT = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    svg: "image/svg+xml"
  };
  function schImageMimeFromFileName(fileName) {
    const dot = fileName.lastIndexOf(".");
    const ext = dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
    const mime = SCH_IMAGE_MIME_BY_EXT[ext];
    if (!mime) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `Unsupported reference-image extension ".${ext || fileName}" \u2014 supported: ${Object.keys(SCH_IMAGE_MIME_BY_EXT).join(", ")}.`
      );
    }
    return mime;
  }
  function schImageStateRecord(object4) {
    const o = object4;
    return {
      primitiveId: o.getState_PrimitiveId(),
      x: o.getState_StartX?.() ?? null,
      y: o.getState_StartY?.() ?? null,
      width: o.getState_Width?.() ?? null,
      height: o.getState_Height?.() ?? null,
      rotation: o.getState_Rotation?.() ?? 0,
      mirror: !!o.getState_Mirror?.(),
      fileName: o.getState_FileName?.() ?? ""
    };
  }
  var schematicImageCreate = async (payload) => {
    const dataBase64 = requireString(payload, "dataBase64");
    const fileName = requireString(payload, "fileName");
    const x = requireNumber(payload, "x");
    const y = requireNumber(payload, "y");
    const width = requireNumber(payload, "width");
    const height = requireNumber(payload, "height");
    const rotation = payload.rotation === void 0 ? 0 : requireNumber(payload, "rotation");
    if (![x, y, width, height, rotation].every(Number.isFinite) || width <= 0 || height <= 0) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Reference image coordinates/rotation must be finite and width/height must be positive finite numbers.");
    }
    if (payload.mirror !== void 0 && typeof payload.mirror !== "boolean") {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Reference image mirror must be boolean.");
    }
    const mirror = optionalBoolean(payload, "mirror") === true;
    const mimeType = schImageMimeFromFileName(fileName);
    let file;
    try {
      const bytes = Uint8Array.from(atob(dataBase64), (c) => c.charCodeAt(0));
      if (bytes.length === 0) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Reference image data is empty.");
      }
      if (bytes.length > MAX_SCH_IMAGE_SOURCE_BYTES) {
        throw new ActionError(
          ErrorCodes.PRECONDITION_REFUSED,
          `Reference image is ${bytes.length} bytes, exceeding the ${MAX_SCH_IMAGE_SOURCE_BYTES}-byte limit.`
        );
      }
      file = new File([bytes], fileName, { type: mimeType });
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to decode the reference image (expected base64 in dataBase64).");
    }
    if (typeof eda === "undefined" || typeof eda.sch_PrimitiveObject?.create !== "function") {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "unsupported: schematic embedded reference-object create API unavailable.");
    }
    let object4;
    try {
      object4 = await eda.sch_PrimitiveObject.create(file, x, y, width, height, rotation, mirror, fileName);
    } catch (err) {
      throw edaError(err, "Failed to create reference image.");
    }
    if (!object4) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "sch_PrimitiveObject.create returned no primitive.");
    }
    const id = object4.getState_PrimitiveId();
    let bbox;
    try {
      bbox = await eda.sch_Primitive.getPrimitivesBBox([id]);
    } catch {
    }
    return { result: { ...schImageStateRecord(object4), bbox } };
  };
  var schematicImageList = async () => {
    let objects;
    try {
      objects = await eda.sch_PrimitiveObject.getAll();
    } catch (err) {
      throw edaError(err, "Failed to enumerate reference images.");
    }
    if (!Array.isArray(objects)) {
      throw new Error("Page embedded-object inventory unavailable.");
    }
    const images = [];
    for (const object4 of objects) {
      const id = object4.getState_PrimitiveId();
      let bbox = null;
      try {
        bbox = await eda.sch_Primitive.getPrimitivesBBox([id]);
      } catch {
      }
      images.push({ ...schImageStateRecord(object4), bbox });
    }
    images.sort((a, b) => String(a.primitiveId).localeCompare(String(b.primitiveId)));
    return { result: { images, count: images.length, scope: "activePage" } };
  };
  var SCH_IMAGE_MODIFY_KEYS = ["x", "y", "width", "height", "rotation", "mirror"];
  var SCH_IMAGE_MODIFY_PROPERTY_KEY = {
    x: "startX",
    y: "startY",
    width: "width",
    height: "height",
    rotation: "rotation",
    mirror: "mirror"
  };
  var schematicImageModify = async (payload) => {
    const primitiveId = requireString(payload, "primitiveId");
    const requested = {};
    for (const key of SCH_IMAGE_MODIFY_KEYS) {
      if (payload[key] !== void 0 && payload[key] !== null) requested[key] = payload[key];
    }
    if (Object.keys(requested).length === 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "Nothing to modify \u2014 provide x/y/width/height/rotation/mirror.");
    }
    const property = {};
    for (const [key, value] of Object.entries(requested)) property[SCH_IMAGE_MODIFY_PROPERTY_KEY[key]] = value;
    let modified;
    try {
      modified = await eda.sch_PrimitiveObject.modify(primitiveId, property);
    } catch (err) {
      throw edaError(err, "Failed to modify reference image.");
    }
    if (!modified) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Failed to modify reference image "${primitiveId}".`);
    }
    let fresh;
    try {
      const got = await eda.sch_PrimitiveObject.get(primitiveId);
      fresh = Array.isArray(got) ? got[0] : got;
    } catch {
    }
    if (!fresh) {
      return { result: { primitiveId, ...schImageStateRecord(modified), partial: true, verified: false, notApplied: ["readback"] }, warnings: ["Reference image modify returned no fresh readback; applied fields could not be verified."] };
    }
    const actual = schImageStateRecord(fresh);
    const notApplied = Object.keys(requested).filter((key) => exactJSON(actual[key]) !== exactJSON(requested[key]));
    return {
      result: {
        ...actual,
        applied: Object.keys(requested).filter((key) => !notApplied.includes(key)),
        ...notApplied.length ? { partial: true, notApplied } : {}
      }
    };
  };
  function pcbReferenceAPI() {
    const api = eda.pcb_PrimitiveObject;
    if (!api || typeof api.create !== "function" || typeof api.get !== "function" || typeof api.getAll !== "function") {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "unsupported: PCB embedded reference-object API unavailable.");
    }
    return api;
  }
  function pcbReferenceState(o) {
    return {
      primitiveId: o.getState_PrimitiveId(),
      layer: o.getState_Layer(),
      x: o.getState_TopLeftX(),
      y: o.getState_TopLeftY(),
      width: o.getState_Width(),
      height: o.getState_Height(),
      rotation: o.getState_Rotation(),
      mirror: o.getState_Mirror(),
      fileName: o.getState_FileName()
    };
  }
  async function pcbReferenceRead(o) {
    let bbox = null;
    try {
      bbox = await eda.pcb_Primitive.getPrimitivesBBox([o.getState_PrimitiveId()]) ?? null;
    } catch {
    }
    return { ...pcbReferenceState(o), bbox };
  }
  function pcbReferenceGeometry(payload, required) {
    const requested = {};
    for (const key of ["x", "y", "width", "height", "rotation"]) {
      if (payload[key] === void 0 && !(required && ["x", "y", "width", "height"].includes(key))) continue;
      const value = requireNumber(payload, key);
      if (!Number.isFinite(value) || ["width", "height"].includes(key) && value <= 0) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Invalid reference picture ${key}.`);
      }
      requested[key] = value;
    }
    if (payload.mirror !== void 0) {
      if (typeof payload.mirror !== "boolean") throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "mirror must be boolean.");
      requested.mirror = payload.mirror;
    }
    return requested;
  }
  async function pcbReferenceTarget(id) {
    const o = await pcbReferenceAPI().get(id);
    if (!o || o.getState_PrimitiveId() !== id) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Reference picture ${id} not found or ID readback mismatched.`);
    if (o.getState_Layer() !== 13) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Reference picture ${id} is not on DOCUMENT layer 13; no mutation performed.`);
    return o;
  }
  async function pcbReferenceVerify(id, expected) {
    let fresh;
    try {
      fresh = await pcbReferenceAPI().get(id);
    } catch {
    }
    if (!fresh || fresh.getState_PrimitiveId() !== id) return { primitiveId: id, verified: false, partial: true, notApplied: ["readback"] };
    const actual = await pcbReferenceRead(fresh);
    const record3 = actual;
    const notApplied = Object.keys(expected).filter((key) => {
      const a = record3[key], b = expected[key];
      return typeof a === "number" && typeof b === "number" ? !Number.isFinite(a) || Math.abs(a - b) > 1e-6 : a !== b;
    });
    if (!actual.bbox) notApplied.push("bbox");
    return { ...actual, verified: notApplied.length === 0, ...notApplied.length ? { partial: true, notApplied } : {} };
  }
  var pcbImageCreate = async (payload) => {
    const fileName = requireString(payload, "fileName");
    const mime = schImageMimeFromFileName(fileName);
    const data = requireString(payload, "dataBase64");
    if (data.length > Math.ceil(MAX_SCH_IMAGE_SOURCE_BYTES / 3) * 4) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Reference image exceeds the 8 MiB limit.");
    const geometry = pcbReferenceGeometry(payload, true);
    if (payload.layer !== void 0 && payload.layer !== 13) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Reference pictures require DOCUMENT layer 13.");
    let decoded;
    try {
      decoded = atob(data);
    } catch {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Invalid reference image base64.");
    }
    if (!decoded.length || decoded.length > MAX_SCH_IMAGE_SOURCE_BYTES) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Reference image must contain 1 to 8388608 bytes.");
    const o = await pcbReferenceAPI().create(
      13,
      geometry.x,
      geometry.y,
      `data:${mime};base64,${data}`,
      geometry.width,
      geometry.height,
      geometry.rotation,
      geometry.mirror,
      fileName
    );
    if (!o) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "pcb_PrimitiveObject.create returned no primitive; inspect inventory before retrying.");
    const id = o.getState_PrimitiveId();
    return { result: await pcbReferenceVerify(id, { ...geometry, layer: 13, fileName }) };
  };
  var pcbImageList = async (payload) => {
    const api = pcbReferenceAPI();
    const id = payload.primitiveId === void 0 ? void 0 : requireString(payload, "primitiveId");
    const object4 = id ? await api.get(id) : void 0;
    if (object4 && object4.getState_PrimitiveId() !== id) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Reference-object ID readback mismatched.");
    const objects = id ? object4 ? [object4] : [] : await api.getAll();
    if (!Array.isArray(objects)) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Embedded reference-object inventory unavailable.");
    const images = [];
    for (const o of objects) images.push(await pcbReferenceRead(o));
    images.sort((a, b) => String(a.primitiveId).localeCompare(String(b.primitiveId)));
    return { result: { images, count: images.length } };
  };
  var pcbImageModify = async (payload) => {
    const id = requireString(payload, "primitiveId");
    const requested = pcbReferenceGeometry(payload, false);
    for (const key of Object.keys(payload)) if (!["primitiveId", "x", "y", "width", "height", "rotation", "mirror"].includes(key)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Unsupported reference-image modify field ${key}.`);
    if (!Object.keys(requested).length) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "No reference-image geometry to modify.");
    await pcbReferenceTarget(id);
    const property = { ...requested, ...requested.x !== void 0 ? { topLeftX: requested.x } : {}, ...requested.y !== void 0 ? { topLeftY: requested.y } : {} };
    delete property.x;
    delete property.y;
    const o = await pcbReferenceAPI().modify(id, property);
    if (!o) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Modify returned no primitive for ${id}; read back before retrying.`);
    return { result: await pcbReferenceVerify(id, { ...requested, layer: 13 }) };
  };
  var pcbImageDelete = async (payload) => {
    const id = requireString(payload, "primitiveId");
    await pcbReferenceTarget(id);
    const deleted = await pcbReferenceAPI().delete(id);
    let fresh;
    let readable = false;
    try {
      fresh = await pcbReferenceAPI().getAll();
      readable = Array.isArray(fresh);
    } catch {
    }
    const verified = deleted === true && readable && !fresh.some((o) => o.getState_PrimitiveId() === id);
    return { result: { primitiveId: id, deleted, verified, ...!verified ? { partial: true } : {} } };
  };
  var schematicGroupMove = async (payload) => {
    const raw = payload.primitiveIds;
    if (!Array.isArray(raw) || raw.length === 0 || !raw.every((id) => typeof id === "string")) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing required field "primitiveIds" (non-empty string[]).');
    }
    const wantIds = new Set(raw);
    const dx = requireNumber(payload, "dx");
    const dy = requireNumber(payload, "dy");
    let allComponents, allWires;
    try {
      allComponents = await eda.sch_PrimitiveComponent.getAll();
      allWires = await eda.sch_PrimitiveWire.getAll();
    } catch (err) {
      throw edaError(err, "group-move: failed to read components/wires for id resolution.");
    }
    if (!Array.isArray(allComponents) || !Array.isArray(allWires)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "group-move: component/wire inventory unavailable.");
    let wirePlans;
    try {
      wirePlans = assertLegacySimpleWireOperation(collectWireSegments(allWires), wantIds, { x: dx, y: dy });
    } catch (err) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `group-move: refused before mutation: ${describeThrown(err)}`);
    }
    const movedComponents = [];
    const movedFlags = [];
    const movedWires = [];
    const notFound = [];
    const seen = /* @__PURE__ */ new Set();
    const elements = [];
    const flagPlans = [];
    for (const comp of allComponents) {
      const id = comp.getState_PrimitiveId();
      if (!wantIds.has(id)) continue;
      seen.add(id);
      const ctype = String(comp.getState_ComponentType?.() ?? "");
      if (ctype === "netflag" || ctype === "netport") {
        const rawName = comp.getState_Component?.()?.name ?? comp.getState_Name?.() ?? "";
        const name2 = String(rawName).toLowerCase();
        let createArg = "";
        if (ctype === "netflag") {
          if (name2.includes("analog")) createArg = "AnalogGround";
          else if (name2.includes("protect")) createArg = "ProtectGround";
          else if (name2.startsWith("ground")) createArg = "Ground";
          else if (name2.startsWith("power")) createArg = "Power";
        } else {
          if (name2.endsWith("-bi")) createArg = "BI";
          else if (name2.endsWith("-in")) createArg = "IN";
          else if (name2.endsWith("-out")) createArg = "OUT";
        }
        if (!createArg) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `group-move: cannot derive recreate parameters for ${ctype} ${id} (symbol "${rawName}") \u2014 aborted BEFORE any mutation. Exclude it from the set or move it manually.`
          );
        }
        flagPlans.push({
          id,
          kind: ctype,
          createArg,
          net: String(comp.getState_Net?.() ?? ""),
          x: comp.getState_X(),
          y: comp.getState_Y(),
          rotation: Number(comp.getState_Rotation?.() ?? 0),
          mirror: Boolean(comp.getState_Mirror?.() ?? false)
        });
      } else if (ctype === "netlabel" || ctype === "short_symbol") {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `group-move: ${ctype} ${id} cannot be moved (no create API to recreate it) \u2014 aborted BEFORE any mutation. Exclude it from the set.`
        );
      } else {
        elements.push({ id, comp });
      }
    }
    for (const { id, comp } of elements) {
      const from = { x: comp.getState_X(), y: comp.getState_Y() };
      const to = { x: from.x + dx, y: from.y + dy };
      let moved;
      try {
        moved = await eda.sch_PrimitiveComponent.modify(id, { x: to.x, y: to.y });
      } catch (err) {
        throw edaError(err, `group-move: failed to translate component ${id}.`);
      }
      if (!moved) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `group-move: modify returned no primitive for component ${id}.`);
      movedComponents.push({ primitiveId: id, designator: moved.getState_Designator?.() ?? null, from, to });
    }
    for (const f of flagPlans) {
      try {
        await deleteSchGroup("components", [f.id]);
      } catch (err) {
        throw edaError(err, `group-move: failed to remove old ${f.kind} ${f.id} before recreating it shifted.`);
      }
      const applied = await appliedRotation(f.rotation);
      let created;
      try {
        created = f.kind === "netflag" ? await eda.sch_PrimitiveComponent.createNetFlag(f.createArg, f.net, f.x + dx, f.y + dy, applied, f.mirror) : await eda.sch_PrimitiveComponent.createNetPort(f.createArg, f.net, f.x + dx, f.y + dy, applied, f.mirror);
      } catch (err) {
        throw edaError(err, `group-move: failed to recreate ${f.kind} ${f.id} ("${f.net}") at the shifted position (original was deleted \u2014 recreate manually at (${f.x + dx},${f.y + dy})).`);
      }
      if (!created) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `group-move: recreating ${f.kind} ${f.id} ("${f.net}") returned no primitive (original was deleted).`);
      movedFlags.push({ oldPrimitiveId: f.id, newPrimitiveId: created.getState_PrimitiveId(), kind: f.kind, net: f.net });
    }
    const labelsByWire = /* @__PURE__ */ new Map();
    const movedLabels = [];
    const labelFailures = [];
    if ([...wantIds].some((id) => allWires.some((w) => w.getState_PrimitiveId() === id))) {
      const attrs = await eda.sch_PrimitiveAttribute.getAll();
      if (!Array.isArray(attrs)) throw new ActionError(ErrorCodes.INVALID_STATE, "group-move: attribute inventory unavailable \u2014 net labels on the moved wires could not be recorded; aborted BEFORE any mutation.");
      for (const a of attrs) {
        const parent = a.getState_ParentPrimitiveId?.();
        if (!parent || !wantIds.has(parent) || a.getState_Key() !== "Name") continue;
        const x = a.getState_X(), y = a.getState_Y();
        if (typeof x !== "number" || typeof y !== "number") {
          throw new ActionError(ErrorCodes.INVALID_STATE, `group-move: net label on wire ${parent} has no readable position \u2014 aborted BEFORE any mutation.`);
        }
        const list = labelsByWire.get(parent) ?? [];
        list.push({ x, y, net: String(a.getState_Value() ?? "") });
        labelsByWire.set(parent, list);
      }
    }
    for (const wire of allWires) {
      const id = wire.getState_PrimitiveId();
      if (!wantIds.has(id)) continue;
      seen.add(id);
      const line = wirePlans.get(id);
      const shifted = line.map((v, i) => i % 2 === 0 ? v + dx : v + dy);
      const net = wire.getState_Net();
      const color = wire.getState_Color();
      const lineWidth = wire.getState_LineWidth();
      const lineType = wire.getState_LineType();
      try {
        await eda.sch_PrimitiveWire.delete([id]);
      } catch (err) {
        throw edaError(err, `group-move: failed to remove old wire ${id} before recreating it shifted.`);
      }
      let created;
      try {
        created = await eda.sch_PrimitiveWire.create(shifted, net, color, lineWidth, lineType);
      } catch (err) {
        throw edaError(err, `group-move: failed to recreate wire ${id} at the shifted position (original was deleted \u2014 rerun with the same spec to retry).`);
      }
      if (!created) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `group-move: recreating wire ${id} returned no primitive (original was deleted).`);
      movedWires.push({ oldPrimitiveId: id, newPrimitiveId: created.getState_PrimitiveId(), net });
      for (const label of labelsByWire.get(id) ?? []) {
        const placed = await createVerifiedNetLabel(label.x + dx, label.y + dy, label.net, created.getState_PrimitiveId());
        const r = placed.result;
        if (r.verified === true) movedLabels.push({ wire: created.getState_PrimitiveId(), net: label.net, primitiveId: r.primitiveId });
        else labelFailures.push({ wire: created.getState_PrimitiveId(), net: label.net, x: label.x + dx, y: label.y + dy, error: r.error });
      }
    }
    for (const id of wantIds) {
      if (!seen.has(id)) notFound.push(id);
    }
    if (!movedComponents.length && !movedFlags.length && !movedWires.length) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `group-move: none of the ${wantIds.size} id(s) resolved to a component, flag, or wire. Pull fresh ids first.`);
    }
    return {
      result: {
        dx,
        dy,
        movedComponents,
        movedFlags,
        movedWires,
        movedLabels,
        count: movedComponents.length + movedFlags.length + movedWires.length,
        ...notFound.length ? { notFound } : {},
        // The canvas already moved: a label that could not be re-placed is a
        // partial result to read back, never a thrown error (#151).
        ...labelFailures.length ? { partial: true, verified: false, labelFailures } : {}
      }
    };
  };
  var NET_FLAG_KINDS = {
    power: "Power",
    ground: "Ground",
    analog_ground: "AnalogGround",
    protective_ground: "ProtectGround",
    protect_ground: "ProtectGround"
  };
  var NET_PORT_KINDS = {
    net_port_in: "IN",
    net_port_out: "OUT",
    net_port_bi: "BI"
  };
  var NET_LABEL_KIND = "net_label";
  async function createVerifiedNetLabel(x, y, net, expectedParentId) {
    const identity = await readResponseContext();
    if (!identity.projectUuid || !identity.documentUuid || !identity.tabId || identity.documentType !== "schematic") {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Schematic identity unavailable; net label was not dispatched.");
    }
    const before = await eda.sch_PrimitiveAttribute.getAll();
    if (!Array.isArray(before)) throw new ActionError(ErrorCodes.INVALID_STATE, "Attribute inventory unavailable; net label was not dispatched.");
    const ids = new Set(before.map((a) => a.getState_PrimitiveId()));
    let returnedId;
    let apiError;
    let settled = false;
    try {
      const pending = Promise.resolve().then(() => eda.sch_PrimitiveAttribute.createNetLabel(x, y, net)).finally(() => {
        settled = true;
      });
      const created = await withTimeout(
        pending,
        CONNECT_PIN_OP_TIMEOUT_MS,
        "Net label creation timed out; write state is unknown."
      );
      returnedId = created?.getState_PrimitiveId();
    } catch (err) {
      apiError = describeThrown(err);
    }
    let addedIds = [];
    try {
      const after = await eda.sch_PrimitiveAttribute.getAll();
      if (!Array.isArray(after)) throw new Error("Post-write attribute inventory unavailable.");
      const added = after.filter((a) => !ids.has(a.getState_PrimitiveId()));
      addedIds = added.map((a) => a.getState_PrimitiveId());
      const afterIdentity = await readResponseContext();
      if (["projectUuid", "documentUuid", "tabId", "documentType"].some((key) => identity[key] !== afterIdentity[key])) throw new Error("Document identity changed during net label creation.");
      if (!settled) throw new Error("Native label call is still pending; a matching snapshot cannot prove completion.");
      const matches = added.filter((a) => a.getState_Key() === "Name" && a.getState_Value() === net && a.getState_X() === x && a.getState_Y() === y);
      if (matches.length !== 1) throw new Error(`Expected one new matching Name attribute; found ${matches.length}.`);
      const attribute = matches[0];
      const record3 = await schAttributeStateRecord(attribute, readCurrentNativePageAttributes);
      const parentId = attribute.getState_ParentPrimitiveId();
      if (expectedParentId !== void 0 && parentId !== expectedParentId) throw new Error(`Label belongs to wire ${parentId}, not the created stub ${expectedParentId}.`);
      const wire = parentId ? await eda.sch_PrimitiveWire.get(parentId) : void 0;
      if (!wire || wire.getState_PrimitiveId() !== parentId || wire.getState_Net() !== net || record3.ValueVisible !== true) {
        throw new Error("Label visibility or parent wire network does not match.");
      }
      return { result: {
        primitiveId: attribute.getState_PrimitiveId(),
        parentPrimitiveId: parentId,
        verified: true,
        recoveredFromReadback: returnedId !== attribute.getState_PrimitiveId(),
        attribute: record3,
        ...apiError ? { apiError } : {}
      } };
    } catch (err) {
      return {
        result: {
          partial: true,
          verified: false,
          writeState: "unknown",
          primitiveId: returnedId ?? null,
          addedAttributeIds: addedIds,
          error: describeThrown(err),
          ...apiError ? { apiError } : {}
        },
        warnings: ["Net label write could not be verified. Save and inspect attributes and wires before retrying; no automatic retry or rollback was attempted."]
      };
    }
  }
  var schematicNetflagCreate = async (payload) => {
    const kind = requireString(payload, "kind");
    const x = requireNumber(payload, "x");
    const y = requireNumber(payload, "y");
    const rotation = optionalNumber(payload, "rotation");
    const mirror = optionalBoolean(payload, "mirror");
    if (kind === NET_LABEL_KIND) return createVerifiedNetLabel(x, y, requireString(payload, "net"));
    let component;
    try {
      if (kind in NET_FLAG_KINDS) {
        const net = requireString(payload, "net");
        component = await eda.sch_PrimitiveComponent.createNetFlag(
          NET_FLAG_KINDS[kind],
          net,
          x,
          y,
          rotation,
          mirror
        );
      } else if (kind in NET_PORT_KINDS) {
        const net = requireString(payload, "net");
        component = await eda.sch_PrimitiveComponent.createNetPort(
          NET_PORT_KINDS[kind],
          net,
          x,
          y,
          rotation,
          mirror
        );
      } else if (kind === "short_circuit") {
        component = await eda.sch_PrimitiveComponent.createShortCircuitFlag(x, y, rotation, mirror);
      } else {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          `Unknown netflag kind "${kind}". Expected one of: ${[...Object.keys(NET_FLAG_KINDS), ...Object.keys(NET_PORT_KINDS), "short_circuit"].join(", ")}.`
        );
      }
    } catch (err) {
      if (err instanceof ActionError) {
        throw err;
      }
      throw edaError(err, "Failed to create net flag.");
    }
    if (!component) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Failed to create net flag of kind "${kind}".`);
    }
    return {
      result: {
        primitiveId: component.getState_PrimitiveId(),
        ...kind === NET_LABEL_KIND ? {} : { component: serializeComponent(component) }
      }
    };
  };
  var schematicPinSetNoConnect = async (payload) => {
    const designator = requireString(payload, "designator");
    const rawPins = payload.pins;
    if (!Array.isArray(rawPins) || rawPins.length === 0 || !rawPins.every((p) => typeof p === "string" || typeof p === "number")) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Missing required field "pins" (non-empty array of pin numbers).'
      );
    }
    const wantPins = rawPins.map(String);
    const value = optionalBoolean(payload, "noConnected") === false ? false : true;
    let components;
    try {
      components = await eda.sch_PrimitiveComponent.getAll(void 0, true);
    } catch (err) {
      throw edaError(err, "Failed to read schematic components.");
    }
    const target = (components ?? []).find((c) => c.getState_Designator() === designator);
    if (!target) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `No component with designator "${designator}" on the schematic.`
      );
    }
    const cid = target.getState_PrimitiveId();
    let component;
    try {
      component = await eda.sch_PrimitiveComponent.get(cid);
    } catch (err) {
      throw edaError(err, `Failed to read component instance "${designator}".`);
    }
    if (!component) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `Component instance "${designator}" (${cid}) is no longer available.`
      );
    }
    let pins;
    try {
      pins = await component.getAllPins();
    } catch (err) {
      throw edaError(err, `Failed to read pins of "${designator}".`);
    }
    const byNumber = new Map((pins ?? []).map((p) => [p.getState_PinNumber(), p]));
    const missing = wantPins.filter((n) => !byNumber.has(n));
    if (missing.length) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `"${designator}" has no pin(s): ${missing.join(", ")}. Available: ${[...byNumber.keys()].join(", ")}.`
      );
    }
    for (const n of wantPins) {
      try {
        const pin = byNumber.get(n);
        pin.setState_NoConnected(value);
        await pin.done();
      } catch (err) {
        throw edaError(err, `Failed to apply no-connect on ${designator} pin ${n}.`);
      }
    }
    let freshComponent;
    try {
      freshComponent = await eda.sch_PrimitiveComponent.get(cid);
    } catch (err) {
      throw edaError(err, `Failed to verify component instance "${designator}".`);
    }
    if (!freshComponent) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `Could not re-fetch component instance "${designator}" (${cid}) for verification.`
      );
    }
    let freshPins;
    try {
      freshPins = await freshComponent.getAllPins();
    } catch (err) {
      throw edaError(err, `Failed to verify pins of "${designator}".`);
    }
    const freshByNumber = new Map((freshPins ?? []).map((p) => [p.getState_PinNumber(), p]));
    const confirmed = wantPins.map((n) => ({
      pin: n,
      noConnected: freshByNumber.get(n)?.getState_NoConnected() ?? null
    }));
    const notApplied = confirmed.filter((c) => c.noConnected !== value);
    if (notApplied.length === wantPins.length) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `EasyEDA did not persist no-connect on ${designator} pin(s) ${wantPins.join(", ")} after pin.done() (verified by fresh component readback).`
      );
    }
    return {
      result: {
        designator,
        primitiveId: cid,
        noConnected: value,
        pins: confirmed,
        // Per-pin pass/fail so partial application (should a future build allow
        // it) is visible rather than masked by the top-level noConnected.
        notApplied: notApplied.map((c) => c.pin)
      }
    };
  };
  async function waitForCanvasSettle() {
    const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : void 0;
    await new Promise((resolve) => {
      let done = false;
      const settle2 = () => {
        if (done) return;
        done = true;
        resolve();
      };
      armDeadline(120, settle2);
      if (raf) {
        raf(() => raf(settle2));
      }
    });
  }
  async function blobSha256(blob) {
    try {
      if (typeof crypto === "undefined" || !crypto.subtle) return null;
      const buf = await blob.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", buf);
      return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return null;
    }
  }
  function classifyDrcSeverity(raw) {
    const s = String(raw ?? "").toLowerCase();
    if (s.includes("fatal")) return "fatal";
    if (s.includes("error") || s === "err") return "error";
    if (s.includes("warn")) return "warn";
    if (s.includes("info") || s.includes("note") || s.includes("tip")) return "info";
    return "unknown";
  }
  function firstString(obj, keys) {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === "string" && v.length > 0) return v;
      if (typeof v === "number" && Number.isFinite(v)) return String(v);
    }
    return void 0;
  }
  function firstNumber(obj, keys) {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === "number" && Number.isFinite(v)) return v;
    }
    return void 0;
  }
  function collectStrings(obj, keys) {
    const out = [];
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === "string" && v.length > 0) out.push(v);
      else if (Array.isArray(v)) {
        for (const e of v) {
          if (typeof e === "string" && e.length > 0) out.push(e);
          else if (e && typeof e === "object") {
            const id = firstString(e, ["primitiveId", "id", "designator", "name"]);
            if (id) out.push(id);
          }
        }
      }
    }
    return out.length > 0 ? out : void 0;
  }
  function flattenDrcNodes(node, inherited, out) {
    if (Array.isArray(node)) {
      for (const n of node) flattenDrcNodes(n, inherited, out);
      return;
    }
    if (node == null || typeof node !== "object") return;
    const obj = node;
    const type = firstString(obj, ["type", "level", "severity", "errorType"]) ?? inherited.type;
    const rule = firstString(obj, ["rule", "ruleName", "title", "name", "errorType"]) ?? inherited.rule;
    const list = obj.list;
    if (Array.isArray(list) && list.length > 0) {
      flattenDrcNodes(list, { type, rule }, out);
      return;
    }
    const message = firstString(obj, ["message", "text", "desc", "description", "detail", "info", "tip"]);
    const primitiveIds = collectStrings(obj, ["primitiveIds", "primitiveId", "objs", "obj1", "obj2", "ids"]);
    const designators = collectStrings(obj, ["designators", "designator", "components"]);
    const x = firstNumber(obj, ["x", "posX"]);
    const y = firstNumber(obj, ["y", "posY"]);
    const count = firstNumber(obj, ["count"]);
    out.push({
      level: classifyDrcSeverity(type),
      type,
      rule,
      message,
      primitiveIds,
      designators,
      x,
      y,
      // Only surface `count` when this leaf is an aggregate-only node (no per-item
      // detail) so the human view can still say "warn × N" without faking coords.
      count: count !== void 0 && message === void 0 && x === void 0 ? count : void 0,
      raw: node
    });
  }
  function normalizeDrc(raw) {
    if (typeof raw === "boolean") {
      const summary2 = raw ? { fatal: 0, error: 0, warn: 0, info: 0, unknown: 0, total: 0 } : { fatal: 0, error: 0, warn: 0, info: 0, unknown: 1, total: 1 };
      const violations2 = raw ? [] : [{
        level: "unknown",
        type: "boolean-fail",
        rule: "sch_Drc.check",
        message: "EDA SDK returned false without per-item detail",
        count: 1,
        raw
      }];
      return { passed: raw, fatal: 0, summary: summary2, violations: violations2, raw };
    }
    const violations = Array.isArray(raw) ? raw : [];
    const leaves = [];
    flattenDrcNodes(violations, {}, leaves);
    const summary = { fatal: 0, error: 0, warn: 0, info: 0, unknown: 0, total: 0 };
    for (const v of leaves) {
      const n = v.count !== void 0 && v.count > 0 ? v.count : 1;
      summary[v.level] += n;
      summary.total += n;
    }
    const fatal = summary.fatal + summary.error;
    return { passed: leaves.length === 0, fatal, summary, violations: leaves, raw };
  }
  var schematicDrcCheck = async (payload) => {
    const strict = optionalBoolean(payload, "strict") === true;
    const includeVerbose = optionalBoolean(payload, "includeVerboseError") !== false;
    let raw;
    let nativePassed;
    try {
      if (includeVerbose) raw = await eda.sch_Drc.check(strict, false, true);
      nativePassed = await eda.sch_Drc.check(strict, false, false);
    } catch (err) {
      throw edaError(err, "Failed to run DRC.");
    }
    if (typeof nativePassed !== "boolean") {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "DRC returned no boolean verdict.");
    }
    if (!includeVerbose || typeof raw === "boolean") {
      return { result: {
        passed: nativePassed,
        nativePassed,
        strict,
        fatal: null,
        summary: null,
        violations: [],
        countsAvailable: false,
        detailsAvailable: false,
        raw: includeVerbose ? raw : nativePassed
      } };
    }
    if (!Array.isArray(raw)) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "DRC returned an unsupported detailed result; counts are unavailable.");
    }
    const normalized = normalizeDrc(raw);
    return { result: {
      ...normalized,
      passed: nativePassed,
      nativePassed,
      strict,
      countsAvailable: true,
      detailsAvailable: raw.length === 0 || normalized.violations.length > 0 && normalized.violations.every((v) => v.count === void 0),
      // These are two sequential SDK reads, not an atomic snapshot.
      verdictSource: "boolean-overload"
    } };
  };
  var CHECK_EPS = 0.05;
  var SCH_GRID = 5;
  var GRID_EPS = 0.01;
  var nearestGrid = (v) => Math.round(v / SCH_GRID) * SCH_GRID;
  function pointOnSegment(px, py, x1, y1, x2, y2) {
    if (px < Math.min(x1, x2) - CHECK_EPS || px > Math.max(x1, x2) + CHECK_EPS) return false;
    if (py < Math.min(y1, y2) - CHECK_EPS || py > Math.max(y1, y2) + CHECK_EPS) return false;
    const cross = (px - x1) * (y2 - y1) - (py - y1) * (x2 - x1);
    return Math.abs(cross) <= CHECK_EPS * Math.max(1, Math.hypot(x2 - x1, y2 - y1));
  }
  function collectWireSegments(wires) {
    return readObservedWireSegments(wires);
  }
  function isWhollyDegenerateWire(own2) {
    return own2.length > 0 && own2.every((s) => isDegenerateWireSegment(s.seg));
  }
  function connectivityWireSegments(segments) {
    const byWire = /* @__PURE__ */ new Map();
    for (const s of segments) {
      const own2 = byWire.get(s.wirePrimitiveId) ?? [];
      own2.push(s);
      byWire.set(s.wirePrimitiveId, own2);
    }
    const dropped = /* @__PURE__ */ new Set();
    for (const [wirePid, own2] of byWire) {
      if (isWhollyDegenerateWire(own2)) dropped.add(wirePid);
    }
    return segments.filter((s) => !dropped.has(s.wirePrimitiveId));
  }
  async function collectNetlistPinNets(_allPages = false) {
    const byDesignator = /* @__PURE__ */ new Map();
    const ambiguous = /* @__PURE__ */ new Set();
    const muted = (error) => ({ byDesignator, ambiguous, available: false, ...error ? { error } : {} });
    let file;
    try {
      file = await getSchematicNetlistFile();
    } catch (err) {
      if (err instanceof NetlistContextError) throw err;
      return muted(describeThrown(err));
    }
    if (!file) return muted("netlist export returned no file");
    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch (err) {
      return muted(`netlist JSON parse failed: ${describeThrown(err)}`);
    }
    const components = parsed?.components;
    if (!components || typeof components !== "object") return muted("netlist JSON carries no components map");
    for (const comp of Object.values(components)) {
      const designator = String(comp.props?.Designator ?? "");
      if (!designator || !comp.pinInfoMap) continue;
      if (byDesignator.has(designator)) ambiguous.add(designator);
      const pins = byDesignator.get(designator) ?? /* @__PURE__ */ new Map();
      for (const pin of Object.values(comp.pinInfoMap)) {
        const number = String(pin?.number ?? "");
        const net = String(pin?.net ?? "");
        if (number && net) pins.set(number, net);
      }
      byDesignator.set(designator, pins);
    }
    return { byDesignator, ambiguous, available: true };
  }
  function isGroundLikeNet(net) {
    return /^(gnd|agnd|dgnd|pgnd|vss|earth|ground)/i.test(net);
  }
  function isPowerRailNet(net) {
    return /^[+-]?\d+(\.\d+)?v/i.test(net) || /^v(cc|dd|pp|bat|bus|in|out|sys|usb|mic|aux)/i.test(net);
  }
  var POLARITY_MIN_GROUP = 3;
  var POLARITY_MAJORITY_FRACTION = 0.75;
  function detectPolarityConventionOutliers(candidates) {
    const matched = [];
    for (const c of candidates) {
      if (!c.pins || c.pins.length !== 2) continue;
      const [a, b] = c.pins;
      const cls = (net) => isGroundLikeNet(net) ? "gnd" : isPowerRailNet(net) ? "pwr" : "other";
      if (cls(a.net) === "pwr" && cls(b.net) === "gnd") {
        matched.push({ designator: c.designator, primitiveId: c.primitiveId, powerPin: a.number, gndPin: b.number, powerNet: a.net, gndNet: b.net });
      } else if (cls(a.net) === "gnd" && cls(b.net) === "pwr") {
        matched.push({ designator: c.designator, primitiveId: c.primitiveId, powerPin: b.number, gndPin: a.number, powerNet: b.net, gndNet: a.net });
      }
    }
    if (matched.length < POLARITY_MIN_GROUP) return [];
    const byPowerPin = /* @__PURE__ */ new Map();
    for (const m of matched) byPowerPin.set(m.powerPin, (byPowerPin.get(m.powerPin) ?? 0) + 1);
    const ranked = [...byPowerPin.entries()].sort((x, y) => y[1] - x[1]);
    if (ranked.length < 2) return [];
    const [majorityPin, majorityCount] = ranked[0];
    if (ranked[1][1] === majorityCount) return [];
    if (majorityCount < Math.ceil(matched.length * POLARITY_MAJORITY_FRACTION)) return [];
    return matched.filter((m) => m.powerPin !== majorityPin).map((m) => ({ ...m, majorityPowerPin: majorityPin, majorityCount, totalMatched: matched.length }));
  }
  function segIntersection(s1, s2) {
    const [x1, y1, x2, y2] = s1;
    const [x3, y3, x4, y4] = s2;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(den) < 1e-9) return null;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    return { x: Math.round((x1 + t * (x2 - x1)) * 100) / 100, y: Math.round((y1 + t * (y2 - y1)) * 100) / 100 };
  }
  function interiorOnSegment(px, py, s) {
    if (!pointOnSegment(px, py, s[0], s[1], s[2], s[3])) return false;
    const endTol = CHECK_EPS * 8;
    return Math.hypot(px - s[0], py - s[1]) > endTol && Math.hypot(px - s[2], py - s[3]) > endTol;
  }
  var schematicCheck = async (payload) => {
    const allPages = optionalBoolean(payload, "allPages") === true;
    let components, wires;
    const { byDesignator: netlistPinNets, available: netlistAvailable } = await collectNetlistPinNets();
    try {
      components = await eda.sch_PrimitiveComponent.getAll(void 0, allPages);
      wires = await eda.sch_PrimitiveWire.getAll();
    } catch (err) {
      throw edaError(err, "Failed to read schematic for design check.");
    }
    if (!Array.isArray(components) || !Array.isArray(wires)) throw new Error("Incomplete design-check component/wire enumeration.");
    const wireSegs = collectWireSegments(wires);
    const connectivitySegs = connectivityWireSegments(wireSegs);
    const segs = connectivitySegs.map((w) => w.seg);
    const NET_MARKER_TYPES = /* @__PURE__ */ new Set(["netflag", "netport", "netlabel", "short_symbol"]);
    const connectionMarkers = [];
    for (const c of components ?? []) {
      let type;
      try {
        type = String(c.getState_ComponentType?.() ?? "");
      } catch (err) {
        throw new Error(`Check component identity unavailable: ${describeThrown(err)}`);
      }
      if (!NET_MARKER_TYPES.has(type)) continue;
      try {
        connectionMarkers.push({
          x: c.getState_X(),
          y: c.getState_Y(),
          net: String(c.getState_Net?.() ?? ""),
          primitiveId: String(c.getState_PrimitiveId?.() ?? ""),
          componentType: type
        });
      } catch (err) {
        throw new Error(`Check marker geometry unavailable: ${describeThrown(err)}`);
      }
    }
    const wireEndpoints = [];
    for (const s of segs) {
      wireEndpoints.push({ x: s[0], y: s[1] }, { x: s[2], y: s[3] });
    }
    const COINCIDE_TOL = CHECK_EPS * 8;
    const coincidesWithAnchor = (x, y) => connectionMarkers.some((m) => Math.hypot(x - m.x, y - m.y) <= COINCIDE_TOL) || wireEndpoints.some((e) => Math.hypot(x - e.x, y - e.y) <= COINCIDE_TOL);
    const findings = [];
    let netMarkerMismatches = 0;
    let multiNetWires = 0;
    const wireMarkerNets = /* @__PURE__ */ new Map();
    const seenMarkerWire = /* @__PURE__ */ new Set();
    const seenMismatch = /* @__PURE__ */ new Set();
    for (const m of connectionMarkers) {
      if (!m.net) continue;
      for (const ws of wireSegs) {
        if (!wirePointOnSegment(m, ws.seg)) continue;
        if (ws.wirePrimitiveId) {
          const markerWireKey = `${ws.wirePrimitiveId}\0${m.primitiveId || m.x + "," + m.y}\0${m.net}`;
          if (!seenMarkerWire.has(markerWireKey)) {
            seenMarkerWire.add(markerWireKey);
            const arr = wireMarkerNets.get(ws.wirePrimitiveId) ?? [];
            arr.push({ net: m.net, markerPrimitiveId: m.primitiveId, at: { x: m.x, y: m.y } });
            wireMarkerNets.set(ws.wirePrimitiveId, arr);
          }
        }
        if (ws.net && ws.net !== m.net) {
          const mismatchKey = `${ws.wirePrimitiveId}\0${m.primitiveId || m.x + "," + m.y}\0${ws.net}\0${m.net}`;
          if (seenMismatch.has(mismatchKey)) continue;
          seenMismatch.add(mismatchKey);
          netMarkerMismatches++;
          findings.push({
            type: "net-marker-mismatch",
            level: "warn",
            wirePrimitiveId: ws.wirePrimitiveId || void 0,
            markerPrimitiveId: m.primitiveId || void 0,
            wireNet: ws.net,
            markerNet: m.net,
            at: { x: m.x, y: m.y },
            message: `\u7F51\u7EDC\u6807\u8BC6 ${m.net} \u4E0E\u6240\u8FDE\u5BFC\u7EBF ${ws.net} \u540D\u79F0\u4E0D\u4E00\u81F4`
          });
        }
      }
    }
    for (const [wireId, refs] of wireMarkerNets) {
      const nets = refs.map((r) => r.net).filter(Boolean);
      if (nets.length <= 1) continue;
      const unique = [...new Set(nets)];
      if (unique.length > 1) {
        multiNetWires++;
        findings.push({
          type: "multi-net-wire",
          level: "warn",
          wirePrimitiveId: wireId,
          nets: unique,
          count: unique.length,
          message: `\u5BFC\u7EBF\u6709\u591A\u4E2A\u7F51\u7EDC\u540D: ${unique.join("\u3001")}`
        });
      }
    }
    let floatingTotal = 0;
    let componentsWithFloating = 0;
    let geomNetMismatches = 0;
    const allPins = [];
    const polarityCandidates = [];
    for (const c of components ?? []) {
      const primitiveId = c.getState_PrimitiveId();
      let pins;
      try {
        pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(primitiveId);
      } catch (err) {
        throw new Error(`Check pin geometry unavailable: ${describeThrown(err)}`);
      }
      if (!Array.isArray(pins)) throw new Error("Check pin API did not return an array.");
      if (pins.length === 0) continue;
      const designator = c.getState_Designator?.() ?? "";
      if (/^c\d/i.test(designator) && pins.length === 2 && netlistAvailable) {
        const pinNets = pins.map((p) => ({
          number: String(p.getState_PinNumber?.() ?? ""),
          net: netlistPinNets.get(designator)?.get(String(p.getState_PinNumber?.() ?? "")) ?? ""
        }));
        if (pinNets.every((pn) => pn.number !== "" && pn.net !== "")) {
          polarityCandidates.push({ designator, primitiveId, pins: pinNets });
        }
      }
      const floating = [];
      const floatingDetails = [];
      for (const p of pins) {
        const px = p.getState_X();
        const py = p.getState_Y();
        const num = String(p.getState_PinNumber?.() ?? "");
        allPins.push({ designator, number: num, x: px, y: py });
        try {
          if (p.getState_NoConnected && p.getState_NoConnected()) continue;
        } catch {
        }
        const netlistNet = netlistPinNets.get(designator)?.get(num) ?? "";
        const geomConnected = segs.some((s) => pointOnSegment(px, py, s[0], s[1], s[2], s[3])) || connectionMarkers.some((m) => Math.hypot(px - m.x, py - m.y) <= COINCIDE_TOL);
        const status = classifyPinConnectivity(Boolean(netlistNet), geomConnected, netlistAvailable && Boolean(designator));
        if (status === "floating") {
          floating.push(num);
          const name2 = (() => {
            try {
              return String(p.getState_PinName?.() ?? "");
            } catch {
              return "";
            }
          })();
          floatingDetails.push({ number: num, name: name2 || void 0, x: px, y: py });
        } else if (status === "geom-net-mismatch") {
          geomNetMismatches++;
          findings.push({
            type: "geom-net-mismatch",
            level: "warn",
            designator,
            primitiveId,
            pins: [num],
            at: { x: px, y: py },
            message: "\u5BFC\u7EBF\u89E6\u78B0\u8BE5\u5F15\u811A\u4F46\u7F51\u8868\u672A\u5C06\u5176\u5F52\u5165\u4EFB\u4F55 net(\u7591\u4F3C\u6F0F\u8FDE:\u672A\u7F16\u8BD1\u7F51\u8868\u6216\u4EC5\u51E0\u4F55\u8D34\u5408\u672A\u771F\u6B63\u8FDE\u901A)"
          });
        }
      }
      if (floating.length > 0) {
        floatingTotal += floating.length;
        componentsWithFloating++;
        findings.push({
          type: "floating-pin",
          level: "warn",
          designator,
          primitiveId,
          pins: floating,
          pinDetails: floatingDetails,
          count: floating.length,
          message: `${floating.length} \u4E2A\u5F15\u811A\u60AC\u7A7A(\u65E0\u5BFC\u7EBF\u8FDE\u63A5,\u672A\u6253 NC \u6807\u8BC6)`
        });
      }
    }
    let polarityConventionOutliers = 0;
    {
      const outliers = detectPolarityConventionOutliers(polarityCandidates);
      polarityConventionOutliers = outliers.length;
      const poolingNote = allPages ? ";\u6CE8\u610F --all-pages \u4E0B\u7EDF\u8BA1\u4E3A\u8DE8\u9875\u6C60\u5316\u800C\u975E\u9010\u9875\u7EA6\u5B9A" : "";
      for (const o of outliers) {
        findings.push({
          type: "polarity-convention-outlier",
          level: "warn",
          designator: o.designator,
          primitiveId: o.primitiveId,
          pins: [o.powerPin, o.gndPin],
          nets: [o.powerNet, o.gndNet],
          count: o.majorityCount,
          // rule-specific slot: majority vote count (see CheckFinding.count)
          message: `\u6781\u6027\u811A\u7EA6\u5B9A\u4E0E\u540C\u9875\u591A\u6570\u4E0D\u4E00\u81F4:\u8BE5\u7535\u5BB9\u7535\u6E90\u4FA7\u63A5\u5728 pin ${o.powerPin}(${o.gndNet} \u4FA7\u4E3A pin ${o.gndPin}),\u540C\u9875 ${o.totalMatched} \u9897\u540C\u7C7B\u4E2D ${o.majorityCount} \u9897\u7535\u6E90\u4FA7\u4E3A pin ${o.majorityPowerPin} \u2014\u2014 \u94BD/\u7535\u89E3\u7535\u5BB9\u53CD\u63A5\u6709\u70ED\u5931\u63A7\u98CE\u9669\u52A1\u5FC5\u6838\u5BF9;MLCC \u65E0\u6781\u6027\u53EF\u5FFD\u7565 (#183)${poolingNote}`
        });
      }
    }
    if ([...allPins, ...connectionMarkers].some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error("Incomplete check anchor coordinates.");
    const crossingAnchors = [...allPins, ...connectionMarkers];
    const physicalIslands = physicalWireIslands(wireSegs, crossingAnchors);
    const verifiedSegments = /* @__PURE__ */ new Set();
    for (const island of physicalIslands) {
      const own2 = island.map((i) => wireSegs[i]);
      const onIsland = (p) => own2.some((w) => wirePointOnSegment(p, w.seg));
      const witnesses = allPins.filter((p) => p.designator && onIsland(p));
      const markers = connectionMarkers.filter(onIsland);
      const rawNets = own2.map((w) => w.net).filter(Boolean);
      const pinNets = witnesses.map((p) => netlistPinNets.get(p.designator)?.get(p.number) ?? "");
      const markerNets = markers.map((m) => m.net);
      const evidence = /* @__PURE__ */ new Set([...rawNets, ...pinNets.filter(Boolean), ...markerNets.filter(Boolean)]);
      const verified = netlistAvailable && !allPages && witnesses.length > 0 && pinNets.every(Boolean) && markerNets.every(Boolean) && evidence.size === 1;
      if (verified) island.forEach((i) => verifiedSegments.add(i));
    }
    const CROSS_CAP = 50;
    let crossingTotal = 0;
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        const relation = classifyWireContact(segs[i], segs[j]);
        const a = wireSegs[i], b = wireSegs[j];
        if ((relation === "endpoint-touch" || relation === "collinear-overlap") && a.net && b.net && a.net !== b.net) {
          findings.push({
            type: "wire-contact",
            level: "error",
            nets: [a.net, b.net],
            message: "\u5F02\u7F51\u5BFC\u7EBF\u5B58\u5728\u7AEF\u70B9/T\u63A5/\u5171\u7EBF\u91CD\u53E0\u7684\u771F\u5B9E\u7535\u6C14\u63A5\u89E6",
            segments: [a, b].map((s) => ({ primitiveId: s.wirePrimitiveId, segmentIndex: s.segmentIndex, rawEncoding: s.rawEncoding }))
          });
        }
        if (relation !== "proper-cross") continue;
        crossingTotal++;
        if (findings.filter((f) => f.type === "wire-crossing").length >= CROSS_CAP) continue;
        const anchorAtCrossing = [...crossingAnchors, ...wireEndpoints].some((p) => wirePointOnSegment(p, segs[i]) && wirePointOnSegment(p, segs[j]));
        const verified = !anchorAtCrossing && verifiedSegments.has(i) && verifiedSegments.has(j);
        findings.push({
          type: "wire-crossing",
          level: verified ? "info" : "error",
          count: 1,
          at: segIntersection(segs[i], segs[j]) ?? void 0,
          segments: [a, b].map((s) => ({ primitiveId: s.wirePrimitiveId, segmentIndex: s.segmentIndex, rawEncoding: s.rawEncoding })),
          message: verified ? "\u5DF2\u9A8C\u8BC1\u65E0\u63A5\u70B9\u6B63\u4EA4\u5185\u90E8\u4EA4\u53C9\uFF1A\u539F\u59CB\u6BB5\u7AEF\u4E0D\u5728\u4EA4\u70B9\u3001\u65E0\u5F15\u811A/\u6807\u8BB0\uFF0C\u4E24\u4E2A\u7269\u7406\u7EBF\u5C9B\u7684\u9010pin\u7F51\u7EDC\u8BC1\u636E\u5B8C\u6574" : "\u4EA4\u53C9\u672A\u83B7\u5F97\u65E0\u63A5\u70B9\u8BC1\u636E\uFF1A\u5B58\u5728\u5F15\u811A/\u6807\u8BB0\u6216\u9010pin\u7F51\u7EDC/\u539F\u59CB\u51E0\u4F55\u4E0D\u5B8C\u6574\uFF0C\u4E0D\u80FD\u8C41\u514D"
        });
      }
    }
    let overPinTotal = 0;
    for (const p of allPins) {
      if (coincidesWithAnchor(p.x, p.y)) continue;
      const hit = segs.some((s) => interiorOnSegment(p.x, p.y, s));
      if (hit) {
        overPinTotal++;
        findings.push({
          type: "wire-over-pin",
          level: "warn",
          designator: p.designator,
          pins: [p.number],
          at: { x: p.x, y: p.y },
          message: "\u5BFC\u7EBF\u7A7F\u8FC7\u8BE5\u5F15\u811A(EasyEDA \u4F1A\u5728\u6B64\u5904\u622A\u65AD\u5E76\u8FDE\u63A5 \u2014 \u975E\u9884\u671F\u77ED\u63A5)"
        });
      }
    }
    let zeroLengthWires = 0;
    let danglingWires = 0;
    const STRAY_CAP = 50;
    const byWire = /* @__PURE__ */ new Map();
    for (const s of wireSegs) {
      const own2 = byWire.get(s.wirePrimitiveId) ?? [];
      own2.push(s);
      byWire.set(s.wirePrimitiveId, own2);
    }
    for (const [wirePid, own2] of byWire) {
      const verts = own2.flatMap((s) => [[s.seg[0], s.seg[1]], [s.seg[2], s.seg[3]]]);
      const wnet = own2[0].net;
      const isZero = verts.every((v) => Math.hypot(v[0] - verts[0][0], v[1] - verts[0][1]) <= CHECK_EPS);
      if (isZero) {
        zeroLengthWires++;
        if (findings.filter((f) => f.type === "zero-length-wire").length < STRAY_CAP) {
          findings.push({
            type: "zero-length-wire",
            level: "warn",
            wirePrimitiveId: wirePid || void 0,
            at: { x: verts[0][0], y: verts[0][1] },
            message: "\u96F6\u957F\u5EA6\u5BFC\u7EBF(\u9996\u5C3E\u5750\u6807\u76F8\u540C,\u4E0D\u8FDE\u63A5\u4EFB\u4F55\u4E1C\u897F,\u5E94\u5220\u9664)"
          });
        }
        continue;
      }
      const endpoints = (() => {
        const segs2 = own2.map((s) => [[s.seg[0], s.seg[1]], [s.seg[2], s.seg[3]]]);
        const deg = /* @__PURE__ */ new Map();
        const keyOf = (v) => `${Math.round(v[0] * 100)}:${Math.round(v[1] * 100)}`;
        for (const [a, b] of segs2) {
          for (const v of [a, b]) {
            const k = keyOf(v);
            const e = deg.get(k);
            if (e) e.n++;
            else deg.set(k, { v, n: 1 });
          }
        }
        const free = [];
        for (const { v, n } of deg.values()) {
          if (n === 1) free.push(v);
        }
        return free.length > 0 ? free : [verts[0], verts[verts.length - 1]];
      })();
      const touchOf = (v) => ({
        touchesPin: allPins.some((p) => Math.hypot(v[0] - p.x, v[1] - p.y) <= COINCIDE_TOL),
        touchesMarker: connectionMarkers.some((m) => Math.hypot(v[0] - m.x, v[1] - m.y) <= COINCIDE_TOL) || wireSegs.some((ws) => ws.wirePrimitiveId !== wirePid && pointOnSegment(v[0], v[1], ws.seg[0], ws.seg[1], ws.seg[2], ws.seg[3]))
      });
      const ends = endpoints.map(touchOf);
      const verdict = classifyWireConnectivity(ends, wnet);
      if (verdict !== "connected") {
        danglingWires++;
        if (findings.filter((f) => f.type === "dangling-wire").length < STRAY_CAP) {
          const orphan = verdict === "orphan-stub";
          findings.push({
            type: "dangling-wire",
            level: "warn",
            wirePrimitiveId: wirePid || void 0,
            wireNet: orphan ? wnet : void 0,
            at: { x: verts[0][0], y: verts[0][1] },
            message: orphan ? `\u7591\u4F3C\u5B64\u513F stub(\u4E00\u7AEF\u8FDE\u5F15\u811A\u3001\u53E6\u4E00\u7AEF\u6E38\u79BB,\u7F51\u540D ${wnet} \u4E3A EasyEDA \u81EA\u52A8\u751F\u6210 \u2014 flag/port \u7591\u4F3C\u5DF2\u5220\u9664,wire \u6B8B\u7559;\u7528 sch disconnect \u6E05\u9664)` : `\u60AC\u6302\u5BFC\u7EBF(\u4E24\u7AEF\u4E0D\u63A5\u4EFB\u4F55\u5F15\u811A/\u6807\u8BC6/\u5BFC\u7EBF${wnet ? "" : "\u3001\u7A7A\u7F51\u540D"},\u5B64\u7ACB\u6B8B\u7559)`
          });
        }
      }
    }
    const summary = {
      floatingPins: floatingTotal,
      componentsWithFloating,
      geomNetMismatches,
      netMarkerMismatches,
      multiNetWires,
      wireCrossings: crossingTotal,
      wireOverPins: overPinTotal,
      zeroLengthWires,
      danglingWires,
      polarityConventionOutliers,
      total: findings.length
    };
    return { result: { passed: findings.every((f) => f.level === "info"), summary, findings } };
  };
  var schematicBridgeCheck = async (payload) => {
    const allPages = optionalBoolean(payload, "allPages") === true;
    let components, wires;
    try {
      components = await eda.sch_PrimitiveComponent.getAll(void 0, allPages);
      wires = await eda.sch_PrimitiveWire.getAll();
    } catch (err) {
      throw edaError(err, "Failed to read schematic for bridge check.");
    }
    if (!Array.isArray(components) || !Array.isArray(wires)) throw new Error("Incomplete bridge component/wire enumeration.");
    const wireSegs = connectivityWireSegments(collectWireSegments(wires));
    const COINCIDE_TOL = CHECK_EPS * 8;
    const NET_MARKER_TYPES = /* @__PURE__ */ new Set(["netflag", "netport", "netlabel", "short_symbol"]);
    const markers = [];
    const pins = [];
    for (const c of components ?? []) {
      let type;
      try {
        type = String(c.getState_ComponentType?.() ?? "");
      } catch (err) {
        throw new Error(`Bridge component identity unavailable: ${describeThrown(err)}`);
      }
      if (NET_MARKER_TYPES.has(type)) {
        try {
          markers.push({ x: c.getState_X(), y: c.getState_Y(), net: String(c.getState_Net?.() ?? ""), primitiveId: String(c.getState_PrimitiveId?.() ?? "") });
        } catch (err) {
          throw new Error(`Bridge marker geometry unavailable: ${describeThrown(err)}`);
        }
        continue;
      }
      const primitiveId = c.getState_PrimitiveId();
      let compPins;
      try {
        compPins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(primitiveId);
      } catch (err) {
        throw new Error(`Bridge pin geometry unavailable: ${describeThrown(err)}`);
      }
      if (!Array.isArray(compPins)) throw new Error("Bridge pin API did not return an array.");
      if (compPins.length === 0) continue;
      const designator = String(c.getState_Designator?.() ?? "");
      for (const p of compPins) {
        try {
          pins.push({ designator, number: String(p.getState_PinNumber?.() ?? ""), x: p.getState_X(), y: p.getState_Y() });
        } catch (err) {
          throw new Error(`Bridge pin coordinates unavailable: ${describeThrown(err)}`);
        }
      }
    }
    if ([...pins, ...markers].some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error("Non-finite bridge anchor geometry.");
    const treeMap = new Map(physicalWireIslands(wireSegs, [...pins, ...markers]).map((indices, i) => [i, {
      wireIds: new Set(indices.map((j) => wireSegs[j].wirePrimitiveId)),
      segs: indices.map((j) => wireSegs[j].seg),
      wireNets: new Set(indices.map((j) => wireSegs[j].net).filter(Boolean)),
      sources: indices.map((j) => ({ primitiveId: wireSegs[j].wirePrimitiveId, segmentIndex: wireSegs[j].segmentIndex, rawEncoding: wireSegs[j].rawEncoding }))
    }]));
    const distToSeg = (px, py, x0, y0, x1, y1) => wirePointOnSegment({ x: px, y: py }, [x0, y0, x1, y1]) ? 0 : Number.POSITIVE_INFINITY;
    const trees = [];
    const anchoredMarkers = /* @__PURE__ */ new Set();
    for (const t of treeMap.values()) {
      const onTree = (x, y) => t.segs.some((s) => distToSeg(x, y, s[0], s[1], s[2], s[3]) <= COINCIDE_TOL);
      const flagIds = [];
      const nets = new Set(t.wireNets);
      for (const m of markers) {
        if (!onTree(m.x, m.y)) continue;
        if (m.primitiveId) {
          flagIds.push(m.primitiveId);
          anchoredMarkers.add(m.primitiveId);
        }
        if (m.net) nets.add(m.net);
      }
      const touchedPins = [];
      for (const p of pins) {
        if (onTree(p.x, p.y)) touchedPins.push(`${p.designator}:${p.number}`);
      }
      const netList = [...nets];
      if (netList.length > 1) {
        trees.push({ kind: "BRIDGE", wireIds: [...t.wireIds], flagIds, pins: [...new Set(touchedPins)], nets: netList, segments: t.sources });
      } else if (flagIds.length === 0 && netList.length === 0 && touchedPins.length > 0) {
        const uniquePins = [...new Set(touchedPins)];
        if (uniquePins.length < 2) {
          trees.push({ kind: "ORPHAN", wireIds: [...t.wireIds], flagIds, pins: uniquePins, nets: netList, segments: t.sources });
        }
      } else if (touchedPins.length === 0) {
        trees.push({ kind: "ORPHAN_TREE", wireIds: [...t.wireIds], flagIds, pins: [], nets: netList, segments: t.sources });
      }
    }
    for (const m of markers) {
      if (!m.primitiveId || anchoredMarkers.has(m.primitiveId)) continue;
      let onAnyWire = false;
      for (const t of treeMap.values()) {
        if (t.segs.some((s) => distToSeg(m.x, m.y, s[0], s[1], s[2], s[3]) <= COINCIDE_TOL)) {
          onAnyWire = true;
          break;
        }
      }
      if (onAnyWire) continue;
      const touchedPins = pins.filter((p) => Math.hypot(p.x - m.x, p.y - m.y) <= COINCIDE_TOL).map((p) => `${p.designator}:${p.number}`);
      trees.push({ kind: "ORPHAN_FLAG", wireIds: [], flagIds: [m.primitiveId], pins: touchedPins, nets: m.net ? [m.net] : [] });
    }
    const bridges = trees.filter((t) => t.kind === "BRIDGE").length;
    const orphans = trees.filter((t) => t.kind === "ORPHAN").length;
    const orphanFlags = trees.filter((t) => t.kind === "ORPHAN_FLAG").length;
    const orphanTrees = trees.filter((t) => t.kind === "ORPHAN_TREE").length;
    const summary = { trees: trees.length, bridges, orphans, orphanFlags, orphanTrees, wireTreesTotal: treeMap.size };
    return { result: { passed: trees.length === 0, summary, trees } };
  };
  async function assertSaveContext(payload, documentType) {
    if (payload.expectedContext === void 0) return;
    if (typeof payload.expectedContext !== "object" || payload.expectedContext === null || Array.isArray(payload.expectedContext)) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "expectedContext must contain projectUuid, documentUuid and documentType.");
    }
    const expected = payload.expectedContext;
    const expectedContext = {
      projectUuid: requireString(expected, "projectUuid"),
      documentUuid: requireString(expected, "documentUuid"),
      documentType: requireString(expected, "documentType"),
      tabId: expected.tabId === void 0 ? void 0 : requireString(expected, "tabId")
    };
    if (expectedContext.documentType !== documentType) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${documentType}.save refused: expectedContext.documentType must be ${documentType}.`);
    }
    const actualContext = await readResponseContext();
    const keys = ["projectUuid", "documentUuid", "documentType"];
    if (expectedContext.tabId !== void 0) keys.push("tabId");
    const unavailableFields = keys.filter((key) => typeof actualContext[key] !== "string" || actualContext[key] === "");
    const mismatchedFields = keys.filter((key) => actualContext[key] !== expectedContext[key]);
    if (unavailableFields.length > 0 || mismatchedFields.length > 0) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `${documentType}.save refused: active project/document context is unavailable or differs from expectedContext.`,
        JSON.stringify({ expectedContext, actualContext, unavailableFields, mismatchedFields })
      );
    }
  }
  var schematicSave = async (payload) => {
    await assertSaveContext(payload, "schematic");
    let saved;
    try {
      saved = await eda.sch_Document.save();
    } catch (err) {
      throw edaError(err, "Failed to save schematic.");
    }
    return { result: { saved } };
  };
  var schematicExportNetlist = async (payload) => {
    const fileName = optionalString(payload, "fileName");
    const netlistType = payload.netlistType;
    let file;
    try {
      file = await getSchematicNetlistFile(fileName, netlistType);
    } catch (err) {
      throw edaError(err, "Failed to export netlist.");
    }
    if (!file) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Netlist export returned no file.");
    }
    const artifact = await blobToArtifact(
      file,
      "schematic_netlist",
      file.name || `${fileName ?? "netlist"}.net`,
      "text/plain"
    );
    return { result: { artifactId: artifact.id, netlistType: netlistType ?? null }, artifacts: [artifact] };
  };
  var SCH_EXPORT_OBJECT = {
    selection: "Current Page Selected Items",
    page: "Current Page",
    project: "Project"
  };
  var SCH_EXPORT_FORMAT = {
    svg: { fileType: "SVG", ext: "svg", mime: "image/svg+xml" },
    png: { fileType: "PNG", ext: "png", mime: "image/png" },
    pdf: { fileType: "PDF", ext: "pdf", mime: "application/pdf" }
  };
  var SCH_EXPORT_TIMEOUT_MS = 3e4;
  var schematicExportImage = async (payload) => {
    const format = (optionalString(payload, "format") ?? "svg").toLowerCase();
    const spec = SCH_EXPORT_FORMAT[format];
    if (!spec) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Unsupported format "${format}". Use one of: ${Object.keys(SCH_EXPORT_FORMAT).join(", ")}.`
      );
    }
    const rawIds = payload.primitiveIds;
    let ids;
    if (typeof rawIds === "string") ids = [rawIds];
    else if (Array.isArray(rawIds) && rawIds.every((id) => typeof id === "string")) ids = rawIds;
    else if (rawIds !== void 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, '"primitiveIds" must be a string or string[].');
    }
    const scope = optionalString(payload, "scope") ?? (ids && ids.length ? "selection" : "page");
    const objectLiteral = SCH_EXPORT_OBJECT[scope];
    if (!objectLiteral) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Unknown scope "${scope}". Use one of: ${Object.keys(SCH_EXPORT_OBJECT).join(", ")}.`
      );
    }
    if (ids && ids.length) {
      try {
        await eda.sch_SelectControl.doSelectPrimitives(ids);
      } catch (err) {
        throw edaError(err, "Failed to select the primitives to export.");
      }
    }
    let selected = [];
    try {
      selected = await eda.sch_SelectControl.getAllSelectedPrimitives_PrimitiveId() ?? [];
    } catch {
    }
    if (scope === "selection" && selected.length === 0) {
      throw new ActionError(
        ErrorCodes.INVALID_STATE,
        'Nothing is selected, so a selection export would be empty. Pass primitiveIds, or use scope "page".'
      );
    }
    const fileName = optionalString(payload, "fileName") ?? `schematic-export.${spec.ext}`;
    const typeParams = {
      theme: optionalString(payload, "theme") ?? "Default",
      lineWidth: optionalString(payload, "lineWidth") ?? "Default"
    };
    let file;
    try {
      file = await withTimeout(
        eda.sch_ManufactureData.getExportDocumentFile(
          fileName,
          spec.fileType,
          typeParams,
          objectLiteral
        ),
        SCH_EXPORT_TIMEOUT_MS,
        `Export did not settle within ${SCH_EXPORT_TIMEOUT_MS}ms. The platform drops the request without rejecting when it dislikes an argument \u2014 the editor will show a stuck progress toast; reload the document to clear it.`
      );
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to export the schematic image.");
    } finally {
      setTimeout(() => {
        try {
          eda.sys_LoadingAndProgressBar.destroyProgressBar();
        } catch {
        }
        try {
          eda.sys_LoadingAndProgressBar.destroyLoading();
        } catch {
        }
      }, 400);
    }
    if (!file) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Export returned no file.");
    }
    const artifact = await blobToArtifact(file, "schematic_export", file.name || fileName, spec.mime);
    return {
      result: {
        artifactId: artifact.id,
        format,
        scope,
        selectedCount: selected.length,
        bytes: file.size,
        fileName: file.name || fileName
      },
      artifacts: [artifact]
    };
  };
  function withTimeout(p, ms, message) {
    return new Promise((resolve, reject) => {
      const handle = armDeadline(ms, () => reject(new ActionError(ErrorCodes.EDA_CALL_FAILED, message)));
      p.then(
        (v) => {
          handle.cancel();
          resolve(v);
        },
        (e) => {
          handle.cancel();
          reject(e);
        }
      );
    });
  }
  var schematicRead = async (payload) => {
    const allPages = optionalBoolean(payload, "allPages") === true;
    const includeCheck = optionalBoolean(payload, "includeCheck") !== false;
    let comps;
    try {
      comps = await eda.sch_PrimitiveComponent.getAll(void 0, allPages);
    } catch (err) {
      throw edaError(err, "Failed to read schematic components.");
    }
    const { byDesignator: pinNets, available: netlistAvailable, error: netlistError } = await collectNetlistPinNets(allPages);
    const netToPins = /* @__PURE__ */ new Map();
    const floating = [];
    const components = [];
    for (const c of comps ?? []) {
      const designator = String(c.getState_Designator?.() ?? "");
      const pinNetMap = pinNets.get(designator) ?? /* @__PURE__ */ new Map();
      const pins = [];
      try {
        const pinPrims = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(c.getState_PrimitiveId());
        for (const p of pinPrims ?? []) {
          const number = String(p.getState_PinNumber?.() ?? "");
          const net = pinNetMap.get(number) ?? "";
          if (net) {
            const key = `${designator}.${number}`;
            const list = netToPins.get(net) ?? [];
            list.push(key);
            netToPins.set(net, list);
          } else if (designator && number) {
            floating.push(`${designator}.${number}`);
          }
          pins.push({ number, name: p.getState_PinName?.() ?? "", net: net || null });
        }
      } catch {
      }
      components.push({
        designator,
        // The MUTATION handle: what select / component.delete / modify /
        // prim-delete / replace / rebind consume. Was MISSING from read's
        // output, so agents grabbed the only id-shaped field — uniqueId
        // ("gge…") — and every by-id mutation came back notFound/empty
        // (live-incident on motobox 2026-08-05). Keep both, never mix.
        primitiveId: c.getState_PrimitiveId?.() ?? "",
        componentType: c.getState_ComponentType?.() ?? "",
        name: c.getState_Name?.() ?? "",
        uniqueId: c.getState_UniqueId?.() ?? "",
        // sch↔PCB link key (for pcb.add_component) — NOT a primitiveId
        footprint: c.getState_Footprint?.() ?? "",
        supplierId: c.getState_SupplierId?.() ?? "",
        // LCSC C-number when present
        x: c.getState_X?.(),
        y: c.getState_Y?.(),
        pins
      });
    }
    const nets = [...netToPins.entries()].map(([net, pins]) => ({ net, pins, degree: pins.length, isGlobal: isGlobalNetName(net) })).sort((a, b) => a.net.localeCompare(b.net));
    let check = null;
    if (includeCheck) {
      try {
        check = (await schematicCheck(payload)).result;
      } catch (err) {
        check = { error: describeThrown(err) };
      }
    }
    return {
      result: {
        components,
        componentCount: components.length,
        nets,
        netCount: nets.length,
        floatingPins: floating,
        floatingPinCount: floating.length,
        // When the netlist is muted, EVERY pin lands in floatingPins and every
        // per-pin net is null. That is not a statement about the design; the flag
        // (and the cause) have to travel with the data so nobody reads it as one.
        netlistAvailable,
        ...netlistAvailable ? {} : { netlistError: netlistError ?? "netlist unavailable" },
        check
      }
    };
  };
  var schematicExportBom = async (payload) => {
    const fileName = optionalString(payload, "fileName");
    const fileType = optionalString(payload, "fileType") ?? "xlsx";
    const template = optionalString(payload, "template");
    const filterOptions = payload.filterOptions;
    const statistics = payload.statistics;
    const property = payload.property;
    const columns = payload.columns;
    let file;
    try {
      file = await eda.sch_ManufactureData.getBomFile(
        fileName,
        fileType,
        template,
        filterOptions,
        statistics,
        property,
        columns
      );
    } catch (err) {
      throw edaError(err, "Failed to export BOM.");
    }
    if (!file) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "BOM export returned no file.");
    }
    const fallbackMime = fileType === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const artifact = await blobToArtifact(
      file,
      "schematic_bom",
      file.name || `${fileName ?? "bom"}.${fileType}`,
      fallbackMime
    );
    return { result: { artifactId: artifact.id, fileType }, artifacts: [artifact] };
  };
  var schematicLibrarySearch = async (payload) => {
    const query = requireString(payload, "query");
    const limit = optionalNumber(payload, "limit") ?? 10;
    const allowFuzzy = optionalBoolean(payload, "allowFuzzy") ?? false;
    const libraryUuid2 = optionalString(payload, "libraryUuid");
    let raw;
    try {
      raw = await eda.lib_Device.search(query, libraryUuid2);
    } catch (err) {
      throw edaError(err, "Failed to search device library.");
    }
    if (!Array.isArray(raw)) {
      return { result: { count: 0, components: [] } };
    }
    if (!allowFuzzy && isLcscQuery(query)) {
      const exact = filterExactLcsc(raw, query).slice(0, limit).map((r) => {
        const otherProperty = r.otherProperty ?? {};
        return {
          uuid: r.uuid,
          libraryUuid: r.libraryUuid,
          name: r.name,
          value: otherProperty.Value,
          footprintName: r.footprintName,
          symbolName: r.symbolName,
          lcsc: r.supplierId ?? otherProperty["Supplier Part"],
          manufacturer: r.manufacturer ?? otherProperty.Manufacturer,
          manufacturerId: r.manufacturerId ?? otherProperty["Manufacturer Part"],
          description: typeof r.description === "string" ? r.description.slice(0, 200) : r.description
        };
      });
      if (exact.length === 0) {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `No device exactly matches LCSC id "${query}". The raw search returned ${raw.length} fuzzy candidate(s) whose LCSC field differs \u2014 re-run with allowFuzzy (CLI: --allow-fuzzy) to see them, or use "lib by-lcsc" for a deterministic lookup.`
        );
      }
      return { result: { count: exact.length, query, exactMatch: true, components: exact } };
    }
    const terms = query.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const norm = (s) => String(s ?? "").toLowerCase();
    const scoreOf = (r) => {
      const op = r.otherProperty ?? {};
      const strong = `${norm(r.name)} ${norm(op.Value)} ${norm(r.manufacturerId)}`;
      const mid = `${norm(r.footprintName)} ${norm(r.symbolName)} ${norm(r.manufacturer)}`;
      const weak = norm(r.description);
      let s = 0;
      for (const t of terms) {
        if (strong.includes(t)) s += 3;
        else if (mid.includes(t)) s += 2;
        else if (weak.includes(t)) s += 1;
      }
      return s;
    };
    const ranked = raw.map((d, i) => ({ d, i, s: scoreOf(d) })).sort((a, b) => b.s - a.s || a.i - b.i).slice(0, limit);
    const components = ranked.map(({ d: r, s }) => {
      const otherProperty = r.otherProperty ?? {};
      return {
        uuid: r.uuid,
        libraryUuid: r.libraryUuid,
        name: r.name,
        value: otherProperty.Value,
        footprintName: r.footprintName,
        symbolName: r.symbolName,
        lcsc: r.supplierId,
        manufacturer: r.manufacturer,
        manufacturerId: r.manufacturerId,
        score: s,
        description: typeof r.description === "string" ? r.description.slice(0, 200) : r.description
      };
    });
    return { result: { count: components.length, query, components } };
  };
  var schematicLibraryGetByLcscIds = async (payload) => {
    const rawIds = payload.lcscIds;
    let lcscIds;
    if (typeof rawIds === "string") lcscIds = [rawIds];
    else if (Array.isArray(rawIds) && rawIds.every((id) => typeof id === "string")) lcscIds = rawIds;
    else {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Missing required field "lcscIds" (a string or string[] of LCSC C-numbers, e.g. "C6186").'
      );
    }
    let raw;
    try {
      raw = await eda.lib_Device.getByLcscIds(lcscIds, void 0, true);
    } catch (err) {
      throw edaError(err, "Failed to look up devices by LCSC id.");
    }
    if (!Array.isArray(raw)) {
      return { result: { count: 0, requested: lcscIds, components: [], notFound: lcscIds } };
    }
    const components = raw.map((r) => {
      const otherProperty = r.otherProperty ?? {};
      return {
        uuid: r.uuid,
        libraryUuid: r.libraryUuid,
        name: r.name,
        value: otherProperty.Value,
        footprintName: r.footprintName,
        symbolName: r.symbolName,
        lcsc: r.supplierId ?? otherProperty["Supplier Part"],
        manufacturer: r.manufacturer ?? otherProperty.Manufacturer,
        manufacturerId: r.manufacturerId ?? otherProperty["Manufacturer Part"],
        description: typeof r.description === "string" ? r.description.slice(0, 200) : r.description
      };
    });
    const found = new Set(components.map((c) => String(c.lcsc ?? "")).filter(Boolean));
    const notFound = found.size ? lcscIds.filter((id) => !found.has(id)) : [];
    return {
      result: {
        count: components.length,
        requested: lcscIds,
        components,
        ...notFound.length ? { notFound } : {}
      }
    };
  };
  var libraryList = async () => {
    try {
      const [libraries, personalLibraryUuid, projectLibraryUuid, systemLibraryUuid] = await Promise.all([
        eda.lib_LibrariesList.getAllLibrariesList(),
        eda.lib_LibrariesList.getPersonalLibraryUuid(),
        eda.lib_LibrariesList.getProjectLibraryUuid(),
        eda.lib_LibrariesList.getSystemLibraryUuid()
      ]);
      return {
        result: {
          libraries: Array.isArray(libraries) ? libraries : [],
          personalLibraryUuid: personalLibraryUuid ?? null,
          projectLibraryUuid: projectLibraryUuid ?? null,
          systemLibraryUuid: systemLibraryUuid ?? null
        }
      };
    } catch (err) {
      throw edaError(err, "Failed to read EasyEDA library list.");
    }
  };
  function optionalStringArray(payload, key) {
    const value = payload[key];
    if (value === void 0) return void 0;
    if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `"${key}" must be a string array.`);
    }
    return value;
  }
  async function resolveWritableLibraryUuid(payload) {
    const explicit = optionalString(payload, "libraryUuid");
    if (explicit) return explicit;
    const scope = optionalString(payload, "scope") ?? "personal";
    let uuid;
    if (scope === "personal") uuid = await eda.lib_LibrariesList.getPersonalLibraryUuid();
    else if (scope === "project") uuid = await eda.lib_LibrariesList.getProjectLibraryUuid();
    else throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, '"scope" must be "personal" or "project".');
    if (!uuid) throw new ActionError(ErrorCodes.INVALID_STATE, `EasyEDA did not expose a ${scope} library UUID.`);
    return uuid;
  }
  function normalizeLibraryNamePart(value, fallback) {
    const normalized = value.normalize("NFKC").trim().toUpperCase().replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "").replace(/_+/g, "_");
    return normalized || fallback;
  }
  async function namespacedLibraryAssetName(requestedName) {
    const assetMark = normalizeLibraryNamePart(requestedName, "ASSET");
    const namespace = "EA_AGENT";
    const prefix = `${namespace}__`;
    return {
      name: requestedName.toUpperCase().startsWith(prefix) ? requestedName : `${prefix}${assetMark}`,
      requestedName,
      namespace
    };
  }
  var libraryFootprintCreate = async (payload) => {
    const requestedName = requireString(payload, "name");
    const description = optionalString(payload, "description");
    const classification = optionalStringArray(payload, "classification");
    try {
      const { name: name2, namespace } = await namespacedLibraryAssetName(requestedName);
      const libraryUuid2 = await resolveWritableLibraryUuid(payload);
      const uuid = await eda.lib_Footprint.create(libraryUuid2, name2, classification, description);
      if (!uuid) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "EasyEDA returned no UUID after creating the footprint.");
      const footprint = await eda.lib_Footprint.get(uuid, libraryUuid2);
      if (!footprint) {
        return { result: { partial: true, created: { uuid, libraryUuid: libraryUuid2, name: name2 }, verified: false }, warnings: ["Footprint was created but immediate readback returned no record; do not retry blindly."] };
      }
      return { result: { uuid, libraryUuid: libraryUuid2, name: name2, requestedName, namespace, verified: true, footprint } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to create footprint library asset.");
    }
  };
  var libraryFootprintGet = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = optionalString(payload, "libraryUuid");
    try {
      const footprint = await eda.lib_Footprint.get(uuid, libraryUuid2);
      if (!footprint) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Footprint "${uuid}" was not found.`);
      return { result: { footprint } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to read footprint library asset.");
    }
  };
  var libraryFootprintCopy = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const sourceLibraryUuid = requireString(payload, "sourceLibraryUuid");
    const requestedName = requireString(payload, "name");
    const classification = optionalStringArray(payload, "classification");
    try {
      const source = await eda.lib_Footprint.get(uuid, sourceLibraryUuid);
      if (!source) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Source footprint "${uuid}" was not found.`);
      const { name: name2, namespace } = await namespacedLibraryAssetName(requestedName);
      const libraryUuid2 = await resolveWritableLibraryUuid(payload);
      const copiedUuid = await eda.lib_Footprint.copy(uuid, sourceLibraryUuid, libraryUuid2, classification, name2);
      if (!copiedUuid) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "EasyEDA returned no UUID after copying the footprint.");
      const footprint = await eda.lib_Footprint.get(copiedUuid, libraryUuid2);
      if (!footprint) return {
        result: { partial: true, created: { uuid: copiedUuid, libraryUuid: libraryUuid2, name: name2 }, source: { uuid, libraryUuid: sourceLibraryUuid }, verified: false },
        warnings: ["Footprint copy returned a UUID but immediate readback was empty; do not retry blindly."]
      };
      return { result: { uuid: copiedUuid, libraryUuid: libraryUuid2, name: name2, requestedName, namespace, source: { uuid, libraryUuid: sourceLibraryUuid }, verified: true, footprint } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to copy footprint library asset.");
    }
  };
  var libraryFootprintDelete = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = requireString(payload, "libraryUuid");
    const expectedName = requireString(payload, "expectedName");
    try {
      const before = await eda.lib_Footprint.get(uuid, libraryUuid2);
      if (!before) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Footprint "${uuid}" was not found; nothing was deleted.`);
      if (before.name !== expectedName) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Footprint name mismatch: expected "${expectedName}", found "${before.name}".`);
      if (!await eda.lib_Footprint.delete(uuid, libraryUuid2)) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `EasyEDA refused to delete footprint "${expectedName}".`);
      if (!await libraryAssetGone(() => eda.lib_Footprint.get(uuid, libraryUuid2))) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Footprint "${expectedName}" still exists after delete returned success.`);
      return { result: { uuid, libraryUuid: libraryUuid2, name: expectedName, deleted: true, verified: true } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to delete footprint library asset.");
    }
  };
  function finiteField(raw, key, label) {
    const value = raw[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${label}.${key} must be a finite number.`);
    }
    return value;
  }
  var FOOTPRINT_APERTURE_KEYS = ["topSolderMask", "bottomSolderMask", "topPasteMask", "bottomPasteMask"];
  function parseFootprintApertures(value, label) {
    if (value === void 0) return value;
    if (value === null) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${label}: rule-based apertures cannot be independently verified by the current public SDK; use explicit numeric fields.`);
    if (typeof value !== "object" || Array.isArray(value)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${label} must be an aperture object or null (follow rules).`);
    }
    const raw = value;
    const keys = Object.keys(raw);
    if (keys.length === 0) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${label} must include at least one explicit numeric aperture field.`);
    const result = {};
    for (const key of keys) {
      if (!FOOTPRINT_APERTURE_KEYS.includes(key)) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${label}.${key} is not a supported aperture field.`);
      }
      result[key] = finiteField(raw, key, label);
    }
    return result;
  }
  async function verifyFootprintApertures(primitive, id, expected) {
    if (primitiveIdOf(primitive) !== id) throw new Error(`pad ${expected.number} fresh readback has a different primitive id`);
    const requested = expected.solderMaskAndPasteMaskExpansion;
    if (requested === void 0) return;
    const pad = primitive;
    if (typeof pad.toAsync !== "function" || typeof pad.reset !== "function") throw new Error(`pad ${expected.number} precise aperture readback is unavailable`);
    pad.toAsync();
    await pad.reset();
    if (primitiveIdOf(primitive) !== id) throw new Error(`pad ${expected.number} precise readback has a different primitive id`);
    const getter = primitive.getState_SolderMaskAndPasteMaskExpansion;
    if (typeof getter !== "function") throw new Error(`pad ${expected.number} fresh aperture readback is unavailable`);
    const actual = getter.call(primitive);
    if (requested === null) {
      if (actual !== null) throw new Error(`pad ${expected.number} did not retain rule-based apertures`);
      return;
    }
    for (const key of FOOTPRINT_APERTURE_KEYS) {
      if (requested[key] === void 0) continue;
      const observed = actual?.[key];
      if (typeof observed !== "number" || !Number.isFinite(observed) || Math.abs(observed - requested[key]) > 1e-6) {
        throw new Error(`pad ${expected.number} aperture ${key} mismatch: requested ${requested[key]}, observed ${String(observed)}`);
      }
    }
  }
  function padShapeTupleError(shape) {
    const format = 'must be an official pad-shape tuple: ["RECT", width, height, cornerRadius%], ["ELLIPSE"|"OVAL"|"NGON", width, height] or ["POLYGON", polygonSource]';
    if (!Array.isArray(shape) || typeof shape[0] !== "string") return format;
    const positive2 = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;
    switch (shape[0]) {
      case "RECT":
        return shape.length === 4 && positive2(shape[1]) && positive2(shape[2]) && typeof shape[3] === "number" && Number.isFinite(shape[3]) && shape[3] >= 0 ? void 0 : format;
      case "ELLIPSE":
      case "OVAL":
      case "NGON":
        return shape.length === 3 && positive2(shape[1]) && positive2(shape[2]) ? void 0 : format;
      case "POLYGON":
        return shape.length === 2 && Array.isArray(shape[1]) && shape[1].length > 0 ? void 0 : format;
      default:
        return format;
    }
  }
  function parseFootprintBuildSpec(payload) {
    const rawPads = payload.pads ?? [];
    const rawLines = payload.lines ?? [];
    if (!Array.isArray(rawPads) || !Array.isArray(rawLines) || rawPads.length + rawLines.length === 0) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Footprint build requires a non-empty pads[] and/or lines[] array.");
    }
    const pads = rawPads.map((value, index) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `pads[${index}] must be an object.`);
      }
      const p = value;
      if (typeof p.number !== "string" || !p.number) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `pads[${index}].number is required.`);
      const shapeError = padShapeTupleError(p.shape);
      if (shapeError) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `pads[${index}].shape ${shapeError}`);
      if (p.hole !== void 0 && p.hole !== null && !Array.isArray(p.hole)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `pads[${index}].hole must be null or a hole tuple.`);
      return {
        number: p.number,
        layer: finiteField(p, "layer", `pads[${index}]`),
        x: finiteField(p, "x", `pads[${index}]`),
        y: finiteField(p, "y", `pads[${index}]`),
        rotation: p.rotation === void 0 ? 0 : finiteField(p, "rotation", `pads[${index}]`),
        shape: p.shape,
        hole: p.hole ?? null,
        metallization: p.metallization === void 0 ? true : Boolean(p.metallization),
        padType: p.padType === void 0 ? 0 : finiteField(p, "padType", `pads[${index}]`),
        solderMaskAndPasteMaskExpansion: parseFootprintApertures(p.solderMaskAndPasteMaskExpansion, `pads[${index}].solderMaskAndPasteMaskExpansion`)
      };
    });
    const numbers = /* @__PURE__ */ new Set();
    for (const p of pads) {
      if (numbers.has(p.number)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Duplicate pad number "${p.number}".`);
      numbers.add(p.number);
    }
    const lines = rawLines.map((value, index) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `lines[${index}] must be an object.`);
      const l = value;
      return {
        layer: finiteField(l, "layer", `lines[${index}]`),
        startX: finiteField(l, "startX", `lines[${index}]`),
        startY: finiteField(l, "startY", `lines[${index}]`),
        endX: finiteField(l, "endX", `lines[${index}]`),
        endY: finiteField(l, "endY", `lines[${index}]`),
        width: finiteField(l, "width", `lines[${index}]`)
      };
    });
    return { pads, lines };
  }
  function primitiveIdOf(primitive) {
    if (!primitive || typeof primitive !== "object") return "";
    const getter = primitive.getState_PrimitiveId;
    const id = typeof getter === "function" ? getter.call(primitive) : void 0;
    return typeof id === "string" ? id : "";
  }
  async function requireLibraryAssetIn(uuid, libraryUuid2, label) {
    const api = label === "symbol" ? eda.lib_Symbol : eda.lib_Footprint;
    if (typeof api?.get !== "function") return void 0;
    let recordLibrary;
    const found = async (lib) => {
      try {
        const record3 = await api.get(uuid, lib);
        if (record3 && lib === libraryUuid2 && typeof record3.libraryUuid === "string") recordLibrary = record3.libraryUuid;
        return Boolean(record3);
      } catch {
        return void 0;
      }
    };
    const here = await found(libraryUuid2);
    if (here === true) return recordLibrary;
    const candidates = ["project"];
    try {
      const personal = await eda.lib_LibrariesList.getPersonalLibraryUuid();
      if (personal) candidates.push(personal);
    } catch {
    }
    const elsewhere = [];
    for (const lib of candidates) {
      if (lib !== libraryUuid2 && await found(lib) === true) elsewhere.push(lib);
    }
    if (here === void 0 && elsewhere.length !== 1) return void 0;
    const fix = elsewhere.length === 1 ? ` It is in library "${elsewhere[0]}": pass --library ${elsewhere[0]} (use the top-level libraryUuid from \`lib ${label} create\`; the asset record's own libraryUuid can name the personal library for a project asset).` : ` Create it first with \`lib ${label} create\` and pass the uuid and top-level libraryUuid it returns.`;
    throw new ActionError(
      ErrorCodes.PRECONDITION_REFUSED,
      `${label[0].toUpperCase()}${label.slice(1)} "${uuid}" was not found in library "${libraryUuid2}"; no editor was opened and no geometry was created.${fix}`
    );
  }
  async function activateLibraryDocument(uuid, libraryUuid2, libraryType, expectedDocumentType, label) {
    const recordLibrary = await requireLibraryAssetIn(uuid, libraryUuid2, label);
    const libraryNames = new Set([libraryUuid2, recordLibrary].filter((x) => Boolean(x)));
    let splitScreenId;
    try {
      const before = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (before?.tabId) splitScreenId = await eda.dmt_EditorControl.getSplitScreenIdByTabId(before.tabId);
    } catch {
    }
    let tabId = await eda.dmt_EditorControl.openLibraryDocument(libraryUuid2, libraryType, uuid, splitScreenId);
    if (!tabId) {
      const api = label === "symbol" ? eda.lib_Symbol : eda.lib_Footprint;
      if (typeof api?.openInEditor === "function") {
        tabId = await api.openInEditor(uuid, libraryUuid2, splitScreenId);
      }
    }
    if (!tabId && label === "footprint" && libraryNames.has("project")) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `EasyEDA does not open project-library footprints for API editing; no geometry was created. Create the footprint in the personal library (\`lib footprint create --scope personal\`) and build it there.`
      );
    }
    if (!tabId) throw new ActionError(ErrorCodes.INVALID_STATE, `EasyEDA did not open the ${label} editor.`);
    await eda.dmt_EditorControl.activateDocument(tabId);
    let actual;
    const focusBy = Date.now() + 4e3;
    for (; ; ) {
      try {
        actual = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      } catch {
        actual = void 0;
      }
      if (actual?.uuid === uuid && (libraryNames.has(actual.parentLibraryUuid ?? "") || // A desktop local asset record has an empty libraryUuid, but its
      // editor reports an internal UUID. Accept the alias only when both
      // the returned and active tab bind this exact asset to that alias.
      recordLibrary === "" && tabId === `${uuid}@${libraryUuid2}` && actual.tabId === tabId) && actual.documentType === expectedDocumentType) return tabId;
      if (Date.now() >= focusBy) break;
      await sleep(50);
    }
    const actualSummary = actual ? `uuid=${actual.uuid}, parentLibraryUuid=${actual.parentLibraryUuid ?? "<missing>"}, documentType=${actual.documentType}` : "no current document";
    const hidden = pageVisibility() === "hidden" ? " The EasyEDA tab is in the background, where editor tabs activate late; bring the window forward and retry." : "";
    throw new ActionError(
      ErrorCodes.INVALID_STATE,
      `EasyEDA did not focus the requested ${label} before mutation (${actualSummary}); no geometry was created.${hidden}`
    );
  }
  async function requireEmptyLibraryBuildTarget(label, readers) {
    let inventories;
    try {
      inventories = await Promise.all(readers.map(async (reader) => {
        const ids = await reader.getAllPrimitiveId();
        if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" || !id)) {
          throw new Error(`${reader.key} inventory returned an invalid primitive-id list`);
        }
        return { key: reader.key, ids };
      }));
    } catch (err) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `${label} build could not prove the opened asset is empty; no geometry was created. Inventory error: ${describeThrown(err)}`
      );
    }
    const occupied = inventories.filter((item) => item.ids.length > 0);
    if (!occupied.length) return;
    const count = occupied.reduce((sum, item) => sum + item.ids.length, 0);
    const evidence = occupied.map((item) => `${item.key}=${item.ids.length}`).join(", ");
    throw new ActionError(
      ErrorCodes.PRECONDITION_REFUSED,
      `${label} build requires an empty target, but the opened asset already contains ${count} primitive(s) (${evidence}); no geometry was created. Create a fresh asset instead of replaying build.`
    );
  }
  var libraryFootprintBuild = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = requireString(payload, "libraryUuid");
    const { pads, lines } = parseFootprintBuildSpec(payload);
    let tabId;
    const createdPads = [];
    const createdLines = [];
    try {
      tabId = await activateLibraryDocument(
        uuid,
        libraryUuid2,
        "4",
        4,
        "footprint"
      );
      await requireEmptyLibraryBuildTarget("Footprint", [
        { key: "pads", getAllPrimitiveId: () => eda.pcb_PrimitivePad.getAllPrimitiveId() },
        { key: "polylines", getAllPrimitiveId: () => eda.pcb_PrimitivePolyline.getAllPrimitiveId() }
      ]);
      for (const p of pads) {
        const primitive = await eda.pcb_PrimitivePad.create(
          p.layer,
          p.number,
          p.x,
          p.y,
          p.rotation,
          p.shape,
          "",
          p.hole,
          0,
          0,
          0,
          p.metallization,
          p.padType,
          void 0,
          p.solderMaskAndPasteMaskExpansion
        );
        const id = primitiveIdOf(primitive);
        if (!primitive || !id) throw new Error(`pad ${p.number} create returned no persistent primitive id`);
        createdPads.push(id);
        if (p.solderMaskAndPasteMaskExpansion !== void 0) {
          const fresh = await eda.pcb_PrimitivePad.get([id]);
          if (!Array.isArray(fresh) || fresh.length !== 1) throw new Error(`pad ${p.number} fresh aperture readback is incomplete`);
          await verifyFootprintApertures(fresh[0], id, p);
        }
      }
      for (const l of lines) {
        const source = [l.startX, l.startY, "L", l.endX, l.endY];
        const polygon = eda.pcb_MathPolygon.createPolygon(source);
        if (!polygon) throw new Error("line polygon creation returned no geometry");
        const primitive = await eda.pcb_PrimitivePolyline.create("", l.layer, polygon, l.width, false);
        const id = primitiveIdOf(primitive);
        if (!primitive || !id) throw new Error("line create returned no persistent primitive id");
        createdLines.push(id);
      }
      if (await eda.pcb_Document.save() !== true) throw new Error("Footprint save did not explicitly confirm success");
      const [padReadback, lineReadback] = await Promise.all([
        createdPads.length ? eda.pcb_PrimitivePad.get(createdPads) : Promise.resolve([]),
        createdLines.length ? eda.pcb_PrimitivePolyline.get(createdLines) : Promise.resolve([])
      ]);
      if (padReadback.length !== createdPads.length || lineReadback.length !== createdLines.length) throw new Error("Footprint post-save primitive readback is incomplete");
      const padsById = new Map(padReadback.map((p) => [primitiveIdOf(p), p]));
      if (padsById.size !== createdPads.length) throw new Error("Footprint post-save pad IDs are not unique");
      for (let index = 0; index < pads.length; index++) await verifyFootprintApertures(padsById.get(createdPads[index]), createdPads[index], pads[index]);
      const lineIds = new Set(lineReadback.map(primitiveIdOf));
      if (lineIds.size !== createdLines.length || createdLines.some((id) => !lineIds.has(id))) throw new Error("Footprint post-save line IDs do not match");
      const verified = true;
      return {
        result: { uuid, libraryUuid: libraryUuid2, tabId, created: { pads: createdPads, lines: createdLines }, verified, apertureVerifiedPads: pads.filter((p) => p.solderMaskAndPasteMaskExpansion !== void 0).length },
        ...verified ? {} : { warnings: ["Footprint geometry was created but immediate primitive readback was incomplete; do not retry blindly."] }
      };
    } catch (err) {
      if (err instanceof ActionError && createdPads.length + createdLines.length === 0) throw err;
      const rollback = { pads: false, lines: false };
      try {
        rollback.pads = createdPads.length === 0 || await eda.pcb_PrimitivePad.delete(createdPads);
      } catch {
      }
      try {
        rollback.lines = createdLines.length === 0 || await eda.pcb_PrimitivePolyline.delete(createdLines);
      } catch {
      }
      return {
        result: {
          partial: true,
          uuid,
          libraryUuid: libraryUuid2,
          tabId: tabId ?? null,
          created: { pads: createdPads, lines: createdLines },
          rollback,
          error: describeThrown(err),
          verified: false
        },
        warnings: [
          "Footprint build failed after mutation began; inspect rollback and the opened footprint before retrying.",
          ...rollback.pads && rollback.lines ? ["The platform error may be transient; re-read the target inventory and retry only after it is proven empty."] : []
        ]
      };
    }
  };
  var REGION_GEOMETRY_EPSILON = 1e-6;
  function sameRegionVertex(a, b) {
    return Math.abs(a[0] - b[0]) <= REGION_GEOMETRY_EPSILON && Math.abs(a[1] - b[1]) <= REGION_GEOMETRY_EPSILON;
  }
  function linearRegionRing(source) {
    let candidate = source;
    if (Array.isArray(candidate) && candidate.length === 1 && Array.isArray(candidate[0])) {
      candidate = candidate[0];
    }
    const decoded = polygonSourceToPoints(candidate);
    if (!decoded.points || decoded.format !== "polyline") return null;
    const points = decoded.points.map((point) => [point[0], point[1]]);
    while (points.length > 3 && sameRegionVertex(points[0], points[points.length - 1])) points.pop();
    return points.length >= 3 ? points : null;
  }
  function equivalentLinearRegionGeometry(requested, actual) {
    const expected = linearRegionRing(requested);
    const observed = linearRegionRing(actual);
    if (!expected || !observed || expected.length !== observed.length) return false;
    for (let observedStart = 0; observedStart < observed.length; observedStart++) {
      if (!sameRegionVertex(expected[0], observed[observedStart])) continue;
      for (const direction of [1, -1]) {
        let matches = true;
        for (let i = 1; i < expected.length; i++) {
          const observedIndex = (observedStart + direction * i + observed.length) % observed.length;
          if (!sameRegionVertex(expected[i], observed[observedIndex])) {
            matches = false;
            break;
          }
        }
        if (matches) return true;
      }
    }
    return false;
  }
  var NATIVE_REGION_MIN_AREA = 1e-6;
  function normalizeNativeRegionSegments(segments, start) {
    let end = segments.length;
    while (end > 0) {
      const last = segments[end - 1];
      if (last.kind !== "L" || !sameRegionVertex(last.start, last.end)) break;
      const previous = segments[end - 2];
      if (!previous || !sameRegionVertex(previous.end, start) || !sameRegionVertex(last.start, start)) return null;
      end--;
    }
    const kept = segments.slice(0, end);
    if (kept.some((segment) => segment.kind === "L" && sameRegionVertex(segment.start, segment.end))) return null;
    return kept.length >= 2 ? kept : null;
  }
  function nativeRegionSegments(source) {
    if (!Array.isArray(source) || !sourceIsClosed(source)) return null;
    const decoded = polygonSourceToPoints(source);
    if (!decoded.points || polygonArea(decoded.points) <= NATIVE_REGION_MIN_AREA) return null;
    const segments = [];
    let current = [source[0], source[1]];
    let i = 2;
    while (i < source.length) {
      const command = source[i++];
      if (command === "L") {
        let count = 0;
        while (i + 1 < source.length && typeof source[i] === "number" && Number.isFinite(source[i]) && typeof source[i + 1] === "number" && Number.isFinite(source[i + 1])) {
          const end = [source[i++], source[i++]];
          segments.push({ kind: "L", start: current, end });
          current = end;
          count++;
        }
        if (!count) return null;
      } else if (command === "ARC") {
        const sweep = source[i++], x = source[i++], y = source[i++];
        if (typeof sweep !== "number" || !Number.isFinite(sweep) || typeof x !== "number" || !Number.isFinite(x) || typeof y !== "number" || !Number.isFinite(y)) return null;
        const end = [x, y];
        segments.push({ kind: "ARC", start: current, end, sweep });
        current = end;
      } else return null;
    }
    return normalizeNativeRegionSegments(segments, [source[0], source[1]]);
  }
  function nativeReadbackSegments(actual) {
    if (!Array.isArray(actual)) return null;
    if (Array.isArray(actual[0])) {
      if (actual.length !== 1) return null;
      return nativeRegionSegments(actual[0]);
    }
    return nativeRegionSegments(actual);
  }
  function equivalentNativeRegionGeometry(requested, actual) {
    const expected = nativeRegionSegments(requested);
    const observed = nativeReadbackSegments(actual);
    if (!expected || !observed || expected.length !== observed.length) return false;
    const samePoint = (a, b) => Math.abs(a[0] - b[0]) <= 0.011 && Math.abs(a[1] - b[1]) <= 0.011;
    for (let start = 0; start < observed.length; start++) {
      for (const direction of [1, -1]) {
        if (expected.every((segment, i) => {
          const candidate = observed[(start + direction * i + observed.length) % observed.length];
          return segment.kind === candidate.kind && samePoint(segment.start, direction === 1 ? candidate.start : candidate.end) && samePoint(segment.end, direction === 1 ? candidate.end : candidate.start) && (segment.kind === "L" || Math.abs((segment.sweep ?? 0) - direction * (candidate.sweep ?? 0)) <= 1e-6);
        })) return true;
      }
    }
    return false;
  }
  var libraryFootprintRegionCreate = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = requireString(payload, "libraryUuid");
    const poly = closedPolygonFromPoints(payload.points);
    const layer = optionalNumber(payload, "layer") ?? 12;
    const ruleTypes = parseRegionRuleTypes(payload.ruleType ?? payload.ruleTypes ?? ["no-components"]);
    const regionName = optionalString(payload, "name");
    const lineWidth = optionalNumber(payload, "lineWidth");
    const lock = optionalBoolean(payload, "locked") !== false;
    const requestedSource = poly.getSource();
    let tabId;
    let primitiveId = "";
    let actualState = null;
    try {
      const systemLibraryUuid = await eda.lib_LibrariesList.getSystemLibraryUuid();
      if (systemLibraryUuid && libraryUuid2 === systemLibraryUuid) {
        throw new ActionError(
          ErrorCodes.PRECONDITION_REFUSED,
          `Footprint "${uuid}" belongs to EasyEDA's immutable system library; no editor was opened and no geometry was created. Keep the existing device/footprint/3D-model binding and use a parameterized PCB instance region, or explicitly author a verified writable-library variant when changing the binding is intended.`
        );
      }
      tabId = await activateLibraryDocument(
        uuid,
        libraryUuid2,
        "4",
        4,
        "footprint"
      );
      const region = await eda.pcb_PrimitiveRegion.create(
        layer,
        poly,
        ruleTypes,
        regionName,
        lineWidth,
        lock
      );
      if (!region) throw new Error("region create returned no primitive");
      primitiveId = region.getState_PrimitiveId();
      const saved = await eda.pcb_Document.save();
      if (!saved) throw new Error("pcb_Document.save returned false after region creation");
      const actual = await eda.pcb_PrimitiveRegion.get(primitiveId);
      if (!actual) throw new Error("region readback returned no primitive");
      actualState = {
        primitiveId: actual.getState_PrimitiveId(),
        layer: Number(actual.getState_Layer()),
        ruleType: [...actual.getState_RuleType()].map(Number).sort((a, b) => a - b),
        name: actual.getState_RegionName() ?? null,
        lineWidth: actual.getState_LineWidth(),
        locked: actual.getState_PrimitiveLock(),
        source: actual.getState_ComplexPolygon().getSource()
      };
      const expectedRuleTypes = [...ruleTypes].sort((a, b) => a - b);
      const differences = [];
      const warnings = [];
      const requestedName = regionName ?? null;
      const actualName = actualState.name;
      const requestedNameIsAbsent = requestedName === null || requestedName === "";
      const actualNameIsAbsent = actualName === null || actualName === "";
      const nameIgnoredByHost = !requestedNameIsAbsent && actualNameIsAbsent;
      if (actualState.primitiveId !== primitiveId) differences.push("primitiveId");
      if (actualState.layer !== Number(layer)) differences.push("layer");
      if (exactJSON(actualState.ruleType) !== exactJSON(expectedRuleTypes)) differences.push("ruleType");
      if (!nameIgnoredByHost && !(requestedNameIsAbsent && actualNameIsAbsent) && actualName !== requestedName) differences.push("name");
      if (lineWidth !== void 0 && actualState.lineWidth !== lineWidth) differences.push("lineWidth");
      if (actualState.locked !== lock) differences.push("locked");
      if (!equivalentLinearRegionGeometry(requestedSource, actualState.source)) differences.push("source");
      if (differences.length) throw new Error(`region readback differs for: ${differences.join(", ")}`);
      if (nameIgnoredByHost) {
        warnings.push(
          `Footprint region name was requested as ${JSON.stringify(requestedName)}, but host readback returned ${JSON.stringify(actualName)}. The verified rule region was kept because name is optional metadata.`
        );
      }
      return {
        result: {
          uuid,
          libraryUuid: libraryUuid2,
          tabId,
          primitiveId,
          saved: true,
          verified: true,
          requested: { layer: Number(layer), ruleType: expectedRuleTypes, name: requestedName, lineWidth: lineWidth ?? null, locked: lock, source: requestedSource },
          actual: actualState,
          ...nameIgnoredByHost ? { readbackDifferences: ["name"], namePersisted: false } : {}
        },
        ...warnings.length ? { warnings } : {}
      };
    } catch (err) {
      if (primitiveId) {
        let deleteRolledBack = false;
        let saveRolledBack = false;
        let absentAfterRollback = false;
        const rollbackErrors = [];
        try {
          deleteRolledBack = await eda.pcb_PrimitiveRegion.delete(primitiveId);
        } catch (rollbackErr) {
          rollbackErrors.push(`delete: ${describeThrown(rollbackErr)}`);
        }
        try {
          saveRolledBack = await eda.pcb_Document.save();
        } catch (rollbackErr) {
          rollbackErrors.push(`save: ${describeThrown(rollbackErr)}`);
        }
        try {
          absentAfterRollback = !await eda.pcb_PrimitiveRegion.get(primitiveId);
        } catch (rollbackErr) {
          rollbackErrors.push(`readback: ${describeThrown(rollbackErr)}`);
        }
        const rolledBack = saveRolledBack && absentAfterRollback;
        return {
          result: {
            partial: true,
            uuid,
            libraryUuid: libraryUuid2,
            tabId: tabId ?? null,
            primitiveId,
            verified: false,
            actual: actualState,
            deleteRolledBack,
            saveRolledBack,
            absentAfterRollback,
            rolledBack,
            rollbackErrors,
            error: describeThrown(err)
          },
          warnings: ["Footprint region creation failed after mutation began; inspect the opened footprint before retrying."]
        };
      }
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to create a rule region inside the footprint editor.");
    }
  };
  var librarySymbolCreate = async (payload) => {
    const requestedName = requireString(payload, "name");
    const description = optionalString(payload, "description");
    const classification = optionalStringArray(payload, "classification");
    const symbolType = optionalNumber(payload, "symbolType");
    try {
      const { name: name2, namespace } = await namespacedLibraryAssetName(requestedName);
      const libraryUuid2 = await resolveWritableLibraryUuid(payload);
      const uuid = await eda.lib_Symbol.create(
        libraryUuid2,
        name2,
        classification,
        symbolType,
        description
      );
      if (!uuid) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "EasyEDA returned no UUID after creating the symbol.");
      const symbol = await eda.lib_Symbol.get(uuid, libraryUuid2);
      if (!symbol) {
        return { result: { partial: true, created: { uuid, libraryUuid: libraryUuid2, name: name2 }, verified: false }, warnings: ["Symbol was created but immediate readback returned no record; do not retry blindly."] };
      }
      return { result: { uuid, libraryUuid: libraryUuid2, name: name2, requestedName, namespace, verified: true, symbol } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to create symbol library asset.");
    }
  };
  var librarySymbolGet = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = optionalString(payload, "libraryUuid");
    try {
      const symbol = await eda.lib_Symbol.get(uuid, libraryUuid2);
      if (!symbol) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Symbol "${uuid}" was not found.`);
      return { result: { symbol } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to read symbol library asset.");
    }
  };
  var MAX_SYMBOL_SOURCE_BYTES = 8 << 20;
  var librarySymbolExportSource = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = requireString(payload, "libraryUuid");
    if (typeof eda.sys_FileManager?.getSymbolFileBySymbolUuid !== "function") {
      throw new ActionError(ErrorCodes.EDA_API_UNAVAILABLE, "Official symbol-file getter is unavailable in this EasyEDA build.");
    }
    let file;
    try {
      file = await eda.sys_FileManager.getSymbolFileBySymbolUuid(uuid, libraryUuid2, "elibz2");
    } catch (err) {
      throw edaError(err, "Failed to export the native symbol file.");
    }
    if (!file || !Number.isSafeInteger(file.size) || file.size <= 0 || file.size > MAX_SYMBOL_SOURCE_BYTES) {
      throw new ActionError(
        ErrorCodes.INVALID_STATE,
        `Official symbol file is missing, empty, or exceeds the ${MAX_SYMBOL_SOURCE_BYTES}-byte transfer limit.`
      );
    }
    const artifact = await blobToArtifact(file, "library_symbol_source", "symbol-source.elibz2", "application/octet-stream");
    return { result: { uuid, libraryUuid: libraryUuid2, fileType: "elibz2", size: file.size, artifactId: artifact.id }, artifacts: [artifact] };
  };
  var librarySymbolBuild = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = requireString(payload, "libraryUuid");
    if (!Array.isArray(payload.pins) || payload.pins.length === 0) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Symbol build requires a non-empty pins[] array.");
    }
    if (!Array.isArray(payload.outline) || payload.outline.length < 8 || payload.outline.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Symbol build requires outline[] with at least four finite x/y points.");
    }
    const pins = payload.pins.map((raw, index) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `pins[${index}] must be an object.`);
      const p = raw;
      if (typeof p.number !== "string" || !p.number || typeof p.name !== "string") throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `pins[${index}] requires number and name strings.`);
      return {
        x: finiteField(p, "x", `pins[${index}]`),
        y: finiteField(p, "y", `pins[${index}]`),
        number: p.number,
        name: p.name,
        rotation: p.rotation === void 0 ? 0 : finiteField(p, "rotation", `pins[${index}]`),
        length: p.length === void 0 ? 20 : finiteField(p, "length", `pins[${index}]`),
        shape: p.shape ?? "None",
        pinType: p.pinType ?? "Passive"
      };
    });
    const rawCircles = payload.circles ?? [];
    if (!Array.isArray(rawCircles)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "circles must be an array.");
    const circles = rawCircles.map((raw, index) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `circles[${index}] must be an object.`);
      const c = raw;
      const radius = finiteField(c, "radius", `circles[${index}]`);
      if (radius <= 0) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `circles[${index}].radius must be greater than zero.`);
      return { centerX: finiteField(c, "centerX", `circles[${index}]`), centerY: finiteField(c, "centerY", `circles[${index}]`), radius, lineWidth: c.lineWidth === void 0 ? 1 : finiteField(c, "lineWidth", `circles[${index}]`) };
    });
    const createdPins = [];
    const createdCircles = [];
    let outlineId = "";
    let tabId;
    try {
      tabId = await activateLibraryDocument(
        uuid,
        libraryUuid2,
        "2",
        2,
        "symbol"
      );
      await requireEmptyLibraryBuildTarget("Symbol", [
        { key: "pins", getAllPrimitiveId: () => eda.sch_PrimitivePin.getAllPrimitiveId() },
        { key: "polygons", getAllPrimitiveId: () => eda.sch_PrimitivePolygon.getAllPrimitiveId() },
        { key: "circles", getAllPrimitiveId: () => eda.sch_PrimitiveCircle.getAllPrimitiveId() }
      ]);
      const outline = await eda.sch_PrimitivePolygon.create(payload.outline, null, "none", 1, null);
      outlineId = primitiveIdOf(outline);
      if (!outlineId) throw new Error("symbol outline create returned no persistent primitive id");
      for (const p of pins) {
        const primitive = await eda.sch_PrimitivePin.create(p.x, p.y, p.number, p.name, p.rotation, p.length, null, p.shape, p.pinType);
        const id = primitiveIdOf(primitive);
        if (!id) throw new Error(`symbol pin ${p.number} create returned no persistent primitive id`);
        createdPins.push(id);
      }
      for (const c of circles) {
        const primitive = await eda.sch_PrimitiveCircle.create(c.centerX, c.centerY, c.radius, null, "none", c.lineWidth, null, null);
        const id = primitiveIdOf(primitive);
        if (!id) throw new Error("symbol circle create returned no persistent primitive id");
        createdCircles.push(id);
      }
      await eda.sch_Document.save();
      const [pinReadback, outlineReadback, circleReadback] = await Promise.all([
        eda.sch_PrimitivePin.get(createdPins),
        eda.sch_PrimitivePolygon.get(outlineId),
        createdCircles.length ? eda.sch_PrimitiveCircle.get(createdCircles) : Promise.resolve([])
      ]);
      const verified = pinReadback.length === createdPins.length && Boolean(outlineReadback) && circleReadback.length === createdCircles.length;
      return { result: { uuid, libraryUuid: libraryUuid2, tabId, created: { pins: createdPins, outline: outlineId, circles: createdCircles }, verified } };
    } catch (err) {
      if (err instanceof ActionError && createdPins.length + createdCircles.length === 0 && !outlineId) throw err;
      try {
        if (createdPins.length) await eda.sch_PrimitivePin.delete(createdPins);
      } catch {
      }
      try {
        if (createdCircles.length) await eda.sch_PrimitiveCircle.delete(createdCircles);
      } catch {
      }
      try {
        if (outlineId) await eda.sch_PrimitivePolygon.delete(outlineId);
      } catch {
      }
      return { result: { partial: true, uuid, libraryUuid: libraryUuid2, tabId: tabId ?? null, created: { pins: createdPins, outline: outlineId, circles: createdCircles }, error: describeThrown(err), verified: false }, warnings: ["Symbol build failed; created geometry was rolled back where possible."] };
    }
  };
  var librarySymbolDelete = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = requireString(payload, "libraryUuid");
    const expectedName = requireString(payload, "expectedName");
    try {
      const before = await eda.lib_Symbol.get(uuid, libraryUuid2);
      if (!before) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Symbol "${uuid}" was not found; nothing was deleted.`);
      if (before.name !== expectedName) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Symbol name mismatch: expected "${expectedName}", found "${before.name}".`);
      if (!await eda.lib_Symbol.delete(uuid, libraryUuid2)) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `EasyEDA refused to delete symbol "${expectedName}".`);
      if (!await libraryAssetGone(() => eda.lib_Symbol.get(uuid, libraryUuid2))) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Symbol "${expectedName}" still exists after delete returned success.`);
      return { result: { uuid, libraryUuid: libraryUuid2, name: expectedName, deleted: true, verified: true } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to delete symbol library asset.");
    }
  };
  var libraryModel3DCreate = async (payload) => {
    const requestedName = requireString(payload, "name");
    const dataBase64 = requireString(payload, "dataBase64");
    const description = optionalString(payload, "description");
    const classification = optionalStringArray(payload, "classification");
    const unitRaw = optionalString(payload, "unit") ?? "mm";
    if (!["mm", "cm", "m", "mil", "inch"].includes(unitRaw)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "unit must be one of mm, cm, m, mil, inch.");
    const unit = unitRaw;
    try {
      const { name: name2, namespace } = await namespacedLibraryAssetName(requestedName);
      const libraryUuid2 = await resolveWritableLibraryUuid(payload);
      const bytes = Uint8Array.from(atob(dataBase64), (c) => c.charCodeAt(0));
      if (!bytes.length) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "3D model file is empty.");
      const fileName = optionalString(payload, "fileName") ?? `${name2}.step`;
      const file = new File([bytes], fileName, { type: optionalString(payload, "mimeType") ?? "application/step" });
      const uuids = await eda.lib_3DModel.create(libraryUuid2, file, classification, unit);
      if (!uuids?.length) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "EasyEDA returned no UUID after importing the 3D model.");
      const uuid = uuids[0];
      if (!await eda.lib_3DModel.modify(uuid, libraryUuid2, name2, classification, description)) {
        return { result: { partial: true, uuid, uuids, libraryUuid: libraryUuid2, name: name2, verified: false }, warnings: ["3D model imported but metadata rename failed; inspect before retrying."] };
      }
      const model = await eda.lib_3DModel.get(uuid, libraryUuid2);
      const verified = Boolean(model && model.name === name2);
      return { result: { uuid, uuids, libraryUuid: libraryUuid2, name: name2, requestedName, namespace, model, verified } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to import 3D model library asset.");
    }
  };
  var libraryModel3DGet = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = optionalString(payload, "libraryUuid");
    try {
      const model = await eda.lib_3DModel.get(uuid, libraryUuid2);
      if (!model) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `3D model "${uuid}" was not found.`);
      return { result: { model } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to read 3D model library asset.");
    }
  };
  var libraryModel3DSearch = async (payload) => {
    const query = requireString(payload, "query");
    const libraryUuid2 = optionalString(payload, "libraryUuid");
    const classification = optionalStringArray(payload, "classification");
    const limit = payload.limit === void 0 ? 20 : finiteField(payload, "limit", "payload");
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "limit must be an integer from 1 to 100.");
    try {
      const models = await eda.lib_3DModel.search(query, libraryUuid2, classification, limit, 1);
      return { result: { query, libraryUuid: libraryUuid2 ?? null, models, count: models.length } };
    } catch (err) {
      throw edaError(err, "Failed to search 3D model library assets.");
    }
  };
  var libraryModel3DCopy = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const sourceLibraryUuid = requireString(payload, "sourceLibraryUuid");
    const requestedName = requireString(payload, "name");
    const classification = optionalStringArray(payload, "classification");
    try {
      const { name: name2, namespace } = await namespacedLibraryAssetName(requestedName);
      const libraryUuid2 = await resolveWritableLibraryUuid(payload);
      const copiedUuid = await eda.lib_3DModel.copy(uuid, sourceLibraryUuid, libraryUuid2, classification, name2);
      if (!copiedUuid) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "EasyEDA returned no UUID after copying the 3D model.");
      const model = await eda.lib_3DModel.get(copiedUuid, libraryUuid2);
      if (!model) return { result: { partial: true, uuid: copiedUuid, libraryUuid: libraryUuid2, name: name2, verified: false }, warnings: ["3D model copy returned a UUID but immediate readback was empty; do not retry blindly."] };
      return { result: { uuid: copiedUuid, libraryUuid: libraryUuid2, name: name2, requestedName, namespace, source: { uuid, libraryUuid: sourceLibraryUuid }, model, verified: true } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to copy 3D model library asset.");
    }
  };
  var libraryDeviceSetModel3D = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = requireString(payload, "libraryUuid");
    const expectedName = requireString(payload, "expectedName");
    const clear = payload.clear === true;
    const model3D = clear ? null : requireLibraryRef(payload, "model3D");
    try {
      const before = await eda.lib_Device.get(uuid, libraryUuid2);
      if (!before) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Device "${uuid}" was not found.`);
      if (before.name !== expectedName) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Device name mismatch: expected "${expectedName}", found "${before.name}".`);
      if (!clear && !await eda.lib_3DModel.get(model3D.uuid, model3D.libraryUuid)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `3D model "${model3D.uuid}" was not found.`);
      if (!await eda.lib_Device.modify(uuid, libraryUuid2, void 0, void 0, { model3D })) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "EasyEDA refused the Device 3D-model association update.");
      const device = await eda.lib_Device.get(uuid, libraryUuid2);
      const association = device?.association;
      const actual = association?.model3D;
      const legacyUuid = association?.model3DUuid;
      const verified = clear ? !actual && !legacyUuid : actual?.uuid === model3D.uuid && actual?.libraryUuid === model3D.libraryUuid;
      if (!verified) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Device update returned success but 3D-model association readback did not match.");
      return { result: { uuid, libraryUuid: libraryUuid2, name: expectedName, model3D, cleared: clear, verified: true, device } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to update Device 3D-model association.");
    }
  };
  var libraryModel3DDelete = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = requireString(payload, "libraryUuid");
    const expectedName = requireString(payload, "expectedName");
    try {
      const before = await eda.lib_3DModel.get(uuid, libraryUuid2);
      if (!before || before.name !== expectedName) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `3D model name mismatch or missing: expected "${expectedName}".`);
      if (!await eda.lib_3DModel.delete(uuid, libraryUuid2)) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `EasyEDA refused to delete 3D model "${expectedName}".`);
      if (!await libraryAssetGone(() => eda.lib_3DModel.get(uuid, libraryUuid2))) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `3D model "${expectedName}" still exists after delete returned success.`);
      return { result: { uuid, libraryUuid: libraryUuid2, name: expectedName, deleted: true, verified: true } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to delete 3D model library asset.");
    }
  };
  function requireLibraryRef(payload, key) {
    const raw = payload[key];
    if (!raw || typeof raw !== "object") {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `Missing required object "${key}" ({uuid, libraryUuid}).`);
    }
    const ref = raw;
    if (typeof ref.uuid !== "string" || !ref.uuid || typeof ref.libraryUuid !== "string" || !ref.libraryUuid) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `"${key}" must contain non-empty uuid and libraryUuid strings.`);
    }
    return { uuid: ref.uuid, libraryUuid: ref.libraryUuid };
  }
  var libraryDeviceCreate = async (payload) => {
    for (const key of ["symbols", "footprints", "devices", "symbolVariants", "footprintVariants", "deviceVariants"]) {
      if (payload[key] !== void 0) {
        throw new ActionError(
          ErrorCodes.PRECONDITION_REFUSED,
          `V4 multi-variant field "${key}" is not representable by the current canonical Device schema. Refusing before mutation instead of selecting the first variant.`
        );
      }
    }
    const requestedName = requireString(payload, "name");
    const symbol = requireLibraryRef(payload, "symbol");
    const footprint = payload.footprint === void 0 ? void 0 : requireLibraryRef(payload, "footprint");
    const model3D = payload.model3D === void 0 ? void 0 : requireLibraryRef(payload, "model3D");
    const description = optionalString(payload, "description");
    const classification = optionalStringArray(payload, "classification");
    const property = payload.property;
    if (property !== void 0 && (!property || typeof property !== "object" || Array.isArray(property))) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, '"property" must be an object.');
    }
    try {
      const { name: name2, namespace } = await namespacedLibraryAssetName(requestedName);
      const libraryUuid2 = await resolveWritableLibraryUuid(payload);
      const uuid = await eda.lib_Device.create(
        libraryUuid2,
        name2,
        classification,
        { symbol, ...footprint ? { footprint } : {}, ...model3D ? { model3D } : {} },
        description,
        property
      );
      if (!uuid) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "EasyEDA returned no UUID after creating the device.");
      const device = await eda.lib_Device.get(uuid, libraryUuid2);
      if (!device) {
        return { result: { partial: true, created: { uuid, libraryUuid: libraryUuid2, name: name2 }, verified: false }, warnings: ["Device was created but immediate readback returned no record; do not retry blindly."] };
      }
      return { result: { uuid, libraryUuid: libraryUuid2, name: name2, requestedName, namespace, verified: true, device } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to create device library asset.");
    }
  };
  function unsupportedV4DeviceVariant(device) {
    if (!device || typeof device !== "object") return void 0;
    const root = device;
    const association = root.association && typeof root.association === "object" ? root.association : {};
    for (const [owner, record3] of [["device", root], ["association", association]]) {
      for (const key of ["symbols", "footprints", "devices", "symbolVariants", "footprintVariants", "deviceVariants"]) {
        const value = record3[key];
        if (Array.isArray(value) && value.length > 1) return `${owner}.${key} has ${value.length} variants`;
      }
      for (const key of ["symbol", "footprint", "device"]) {
        const value = record3[key];
        if (Array.isArray(value) && value.length > 1) return `${owner}.${key} has ${value.length} variants`;
      }
    }
    return void 0;
  }
  async function preflightV4DeviceVariant(libraryUuid2, uuid) {
    const api = eda.lib_Device;
    if (typeof api?.get !== "function") return;
    let device;
    try {
      device = await api.get(uuid, libraryUuid2);
    } catch {
      return;
    }
    if (device === void 0 || device === null || device === false) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `Device "${uuid}" was not found in library "${libraryUuid2}". Placement was not attempted; resolve the 32-char device uuid with \`easyeda lib search\` / \`lib by-lcsc\` (a component's 16-char symbol id is not a device uuid).`
      );
    }
    const issue = unsupportedV4DeviceVariant(device);
    if (issue) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `V4 multi-variant device is unsupported (${issue}). Placement was not attempted; add a canonical variant selector and typed API first.`
      );
    }
  }
  async function libraryAssetGone(read) {
    const deadline = Date.now() + 5e3;
    for (; ; ) {
      let present;
      try {
        present = await read();
      } catch {
        present = void 0;
      }
      if (!present) return true;
      if (Date.now() >= deadline) return false;
      await sleep(500);
    }
  }
  var libraryDeviceGet = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = optionalString(payload, "libraryUuid");
    try {
      const device = await eda.lib_Device.get(uuid, libraryUuid2);
      if (!device) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Device "${uuid}" was not found.`);
      return { result: { device } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to read device library asset.");
    }
  };
  var libraryDeviceDelete = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const libraryUuid2 = requireString(payload, "libraryUuid");
    const expectedName = requireString(payload, "expectedName");
    try {
      const before = await eda.lib_Device.get(uuid, libraryUuid2);
      if (!before) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Device "${uuid}" was not found; nothing was deleted.`);
      if (before.name !== expectedName) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Device name mismatch: expected "${expectedName}", found "${before.name}".`);
      if (!await eda.lib_Device.delete(uuid, libraryUuid2)) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `EasyEDA refused to delete Device "${expectedName}".`);
      if (!await libraryAssetGone(() => eda.lib_Device.get(uuid, libraryUuid2))) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Device "${expectedName}" still exists after delete returned success.`);
      return { result: { uuid, libraryUuid: libraryUuid2, name: expectedName, deleted: true, verified: true } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to delete Device library asset.");
    }
  };
  function cleanOtherProperty(op) {
    if (!op) return void 0;
    const out = {};
    for (const [k, v] of Object.entries(op)) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out[k] = v;
    }
    return Object.keys(out).length ? out : void 0;
  }
  var REBIND_OP_TIMEOUT_MS = 15e3;
  async function readRebindComponent(primitiveId) {
    try {
      const component = await withTimeout(
        Promise.resolve(eda.sch_PrimitiveComponent.get(primitiveId)),
        REBIND_OP_TIMEOUT_MS,
        `Rebind readback for component "${primitiveId}" timed out after ${REBIND_OP_TIMEOUT_MS}ms.`
      );
      return { present: Boolean(component), ...component ? { component } : {} };
    } catch (err) {
      return { present: null, error: describeThrown(err) };
    }
  }
  function rebindInstanceDifferences(expected, actual) {
    const differences = [];
    const exactFields = [
      "designator",
      "uniqueId",
      "subPartName",
      "mirror",
      "addIntoBom",
      "addIntoPcb",
      "manufacturer",
      "manufacturerId",
      "supplier",
      "supplierId",
      "otherProperty"
    ];
    for (const field of exactFields) {
      if (exactJSON(actual[field]) !== exactJSON(expected[field])) differences.push(field);
    }
    for (const field of ["x", "y", "rotation"]) {
      const want = expected[field];
      const got = actual[field];
      if (typeof want !== "number" || typeof got !== "number" || !Number.isFinite(want) || !Number.isFinite(got) || Math.abs(want - got) > 1e-6) differences.push(field);
    }
    return differences;
  }
  function rebindFactsDetail(facts) {
    return `rebind transaction facts: ${JSON.stringify(facts)}`;
  }
  function deviceAssociationRef(value, kind) {
    const record3 = identityRecord(value);
    const association = identityRecord(record3.association);
    const raw = identityRecord(association[kind] ?? record3[kind]);
    return typeof raw.uuid === "string" && typeof raw.libraryUuid === "string" ? { uuid: raw.uuid, libraryUuid: raw.libraryUuid } : void 0;
  }
  function sameDeviceRef(a, b) {
    return Boolean(a && b && a.uuid === b.uuid && a.libraryUuid === b.libraryUuid);
  }
  async function readRebindDeviceAssociation(device, kind, strictIdentity = false) {
    try {
      const detail = await withTimeout(
        Promise.resolve(eda.lib_Device.get(device.uuid, device.libraryUuid)),
        REBIND_OP_TIMEOUT_MS,
        `Device association readback for "${device.uuid}" timed out after ${REBIND_OP_TIMEOUT_MS}ms.`
      );
      if (strictIdentity && (detail?.uuid !== device.uuid || detail?.libraryUuid !== device.libraryUuid)) {
        return { error: "device.get returned a different library device identity" };
      }
      const ref = deviceAssociationRef(detail, kind);
      if (strictIdentity && (!ref || !libraryIdentityUuid(ref.uuid) || !ref.libraryUuid)) return { error: "device.get returned no complete library asset association" };
      return ref ? { ref } : { error: `device.get returned no ${kind} association` };
    } catch (err) {
      return { error: describeThrown(err) };
    }
  }
  async function componentMissError(primitiveId) {
    let existsElsewhere = false;
    try {
      const all = await eda.sch_PrimitiveComponent.getAll(void 0, true);
      existsElsewhere = (all ?? []).some((c) => c.getState_PrimitiveId() === primitiveId);
    } catch {
    }
    if (!existsElsewhere) {
      return new ActionError(
        ErrorCodes.INVALID_STATE,
        `No schematic component found with primitiveId "${primitiveId}" on any page.`
      );
    }
    const page = (await tagComponentPages()).get(primitiveId);
    const where = page ? `page "${page.pageName}" (${page.pageUuid})` : "another page";
    const fix = page ? `easyeda doc switch ${page.pageName}` : "easyeda doc ls  \u2192  easyeda doc switch <page>";
    return new ActionError(
      ErrorCodes.INVALID_STATE,
      `Component "${primitiveId}" is on ${where}, not the ACTIVE page \u2014 this action only reaches the active page. Switch to it first: ${fix}`
    );
  }
  async function getComponentOrThrow(primitiveId) {
    let component;
    try {
      component = await eda.sch_PrimitiveComponent.get(primitiveId);
    } catch (err) {
      throw edaError(err, `Failed to read component "${primitiveId}".`);
    }
    if (!component) {
      throw await componentMissError(primitiveId);
    }
    return component;
  }
  function makeRebindHandler(kind) {
    return async (payload) => {
      const primitiveId = requireString(payload, "primitiveId");
      const targetName = optionalString(payload, kind);
      const explicitUuid = optionalString(payload, `${kind}Uuid`);
      const explicitLibraryUuid = optionalString(payload, `${kind}LibraryUuid`);
      const scope = optionalString(payload, "scope") ?? "project";
      if (!targetName && !explicitUuid) {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          `Provide either "${kind}" (a name to search) or "${kind}Uuid" (+ optional "${kind}LibraryUuid").`
        );
      }
      const rlog = (m) => {
        try {
          eda.sys_Log.add(`[rebind] ${m}`);
        } catch {
        }
      };
      rlog(`start ${kind} ${primitiveId}`);
      const identityContext = await readResponseContext();
      const component = await getComponentOrThrow(primitiveId);
      const snapshot = serializeComponent(component);
      const nativeInstanceDomain = instanceIdentityUuid(readDeviceFootprint(snapshot).uuid);
      const assertRebindContext = async () => {
        if (nativeInstanceDomain) await assertPlacedIdentityContext(identityContext);
      };
      const mutate = async (call) => {
        await assertRebindContext();
        return call();
      };
      const readPlaced = async (id) => {
        try {
          await assertRebindContext();
          const observed = await readRebindComponent(id);
          await assertRebindContext();
          return observed;
        } catch (err) {
          return { present: null, error: describeThrown(err) };
        }
      };
      const readAssociation = async (dev) => {
        try {
          await assertRebindContext();
          const observed = await readRebindDeviceAssociation(dev, kind, nativeInstanceDomain);
          await assertRebindContext();
          return observed;
        } catch (err) {
          return { error: describeThrown(err) };
        }
      };
      const oldSymbol = component.getState_Symbol();
      const oldFootprint = component.getState_Footprint();
      const originalUniqueId = snapshot.uniqueId;
      if (typeof originalUniqueId !== "string" || !originalUniqueId.trim()) {
        throw new ActionError(
          ErrorCodes.PRECONDITION_REFUSED,
          `Component "${primitiveId}" has no stable non-empty uniqueId. Rebind was refused before any library or canvas mutation because sch\u2194PCB identity could not be restored and verified.`
        );
      }
      const device = await resolvePlacedDeviceIdentity(snapshot, identityContext);
      rlog(`identity via=${device.via} ${device.uuid}`);
      let target;
      if (explicitUuid) {
        target = { uuid: explicitUuid, libraryUuid: explicitLibraryUuid ?? device.libraryUuid, name: targetName ?? explicitUuid };
      } else {
        let results;
        try {
          const searcher = kind === "footprint" ? eda.lib_Footprint : eda.lib_Symbol;
          results = await searcher.search(targetName, scope);
        } catch (err) {
          throw edaError(err, `Failed to search ${kind} library for "${targetName}".`);
        }
        const match = pickNamedCandidate(targetName, Array.isArray(results) ? results : []);
        if (match.kind === "none") {
          throw new ActionError(
            ErrorCodes.INVALID_STATE,
            `No ${kind} named "${targetName}" found in scope "${scope}". Pass "${kind}Uuid" (+ "${kind}LibraryUuid") to bind directly, or check the name.`
          );
        }
        if (match.kind === "ambiguous") {
          const uuids = match.matches.map((m) => m.uuid).join(", ");
          throw new ActionError(
            ErrorCodes.INVALID_STATE,
            `${match.matches.length} ${kind}s named "${targetName}" match (uuids: ${uuids}). Pass "${kind}Uuid" to pick one.`
          );
        }
        target = match.item;
      }
      const newAssoc = kind === "footprint" ? { footprint: { uuid: target.uuid, libraryUuid: target.libraryUuid } } : { symbol: { uuid: target.uuid, libraryUuid: target.libraryUuid } };
      const oldPlacedRef = kind === "footprint" ? oldFootprint : oldSymbol;
      const oldRef = kind === "footprint" && device.footprintSource ? { uuid: device.footprintSource.uuid, libraryUuid: device.footprintSource.libraryUuid } : oldPlacedRef;
      if (nativeInstanceDomain && kind === "footprint" && (!device.footprintSource || device.footprintSource.instanceUuid !== oldPlacedRef?.uuid || device.footprintSource.libraryUuid !== oldPlacedRef.libraryUuid)) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Original placed footprint lacks an exact native-to-library association; rollback identity is unproven.");
      }
      if (!oldRef?.uuid || !oldRef.libraryUuid) {
        throw new ActionError(
          ErrorCodes.PRECONDITION_REFUSED,
          `Component "${primitiveId}" has no complete original ${kind} identity. Rebind was refused before mutation because the device association could not be rolled back exactly.`
        );
      }
      const rollbackAssoc = oldRef ? kind === "footprint" ? { footprint: { uuid: oldRef.uuid, libraryUuid: oldRef.libraryUuid } } : { symbol: { uuid: oldRef.uuid, libraryUuid: oldRef.libraryUuid } } : void 0;
      if (nativeInstanceDomain) {
        const originalAssociation = await readAssociation(device);
        if (!sameDeviceRef(originalAssociation.ref, oldRef)) {
          throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Original library association changed after the native identity proof; rebind refused before mutation.", originalAssociation.error);
        }
      }
      const x = typeof snapshot.x === "number" ? snapshot.x : 0;
      const y = typeof snapshot.y === "number" ? snapshot.y : 0;
      const subPartName = typeof snapshot.subPartName === "string" ? snapshot.subPartName : void 0;
      const rotation = typeof snapshot.rotation === "number" ? snapshot.rotation : void 0;
      const mirror = typeof snapshot.mirror === "boolean" ? snapshot.mirror : void 0;
      const addIntoBom = typeof snapshot.addIntoBom === "boolean" ? snapshot.addIntoBom : void 0;
      const addIntoPcb = typeof snapshot.addIntoPcb === "boolean" ? snapshot.addIntoPcb : void 0;
      const restoreProps = {
        ...typeof snapshot.designator === "string" ? { designator: snapshot.designator } : {},
        ...typeof snapshot.uniqueId === "string" ? { uniqueId: snapshot.uniqueId } : {},
        ...typeof snapshot.manufacturer === "string" ? { manufacturer: snapshot.manufacturer } : {},
        ...typeof snapshot.manufacturerId === "string" ? { manufacturerId: snapshot.manufacturerId } : {},
        ...typeof snapshot.supplier === "string" ? { supplier: snapshot.supplier } : {},
        ...typeof snapshot.supplierId === "string" ? { supplierId: snapshot.supplierId } : {},
        ...cleanOtherProperty(snapshot.otherProperty) ? { otherProperty: cleanOtherProperty(snapshot.otherProperty) } : {}
      };
      const createPlaced = async (dev, purpose, onCreatedId) => {
        await assertRebindContext();
        const created2 = await withTimeout(
          mutate(() => eda.sch_PrimitiveComponent.create(
            { libraryUuid: dev.libraryUuid, uuid: dev.uuid },
            x,
            y,
            subPartName,
            rotation,
            mirror,
            addIntoBom,
            addIntoPcb
          )),
          REBIND_OP_TIMEOUT_MS,
          `${purpose} create did not settle within ${REBIND_OP_TIMEOUT_MS}ms. The operation may still land late; do not retry or run PCB import-changes until a fresh schematic read proves the actual instances.`
        );
        if (!created2) {
          throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `${purpose} create returned no primitive.`);
        }
        const createdId = created2.getState_PrimitiveId();
        if (!createdId) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `${purpose} create returned a primitive without an id.`);
        onCreatedId?.(createdId);
        await assertRebindContext();
        const fresh = await readPlaced(createdId);
        if (fresh.present !== true || !fresh.component) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `${purpose} "${createdId}" was not proven present by a fresh readback.`,
            fresh.error
          );
        }
        return fresh.component;
      };
      const verifyPlacedBinding = async (placed, expectedDevice, expectedRef, purpose) => {
        await assertRebindContext();
        const observed = serializeComponent(placed);
        let resolved;
        try {
          resolved = await resolvePlacedDeviceIdentity(observed, identityContext);
        } catch (err) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `${purpose} device identity could not be proven from fresh placed-instance data.`,
            rebindFactsDetail({ purpose, expectedDevice, expectedRef, cause: describeThrown(err) })
          );
        }
        if (!sameDeviceRef(resolved, expectedDevice)) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `${purpose} resolved to a different device than the one requested.`,
            rebindFactsDetail({ purpose, expectedDevice, actualDevice: resolved, expectedRef })
          );
        }
        const association = await readAssociation(expectedDevice);
        if (!sameDeviceRef(association.ref, expectedRef)) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `${purpose} device ${kind} association does not match the requested binding.`,
            rebindFactsDetail({ purpose, expectedDevice, expectedRef, actualRef: association.ref ?? null, associationError: association.error })
          );
        }
      };
      const restoreAndVerify = async (primitiveIdToRestore, expectedDevice, expectedRef, purpose) => {
        await assertRebindContext();
        await withTimeout(
          mutate(() => eda.sch_PrimitiveComponent.modify(primitiveIdToRestore, restoreProps)),
          REBIND_OP_TIMEOUT_MS,
          `Identity/property restore for component "${primitiveIdToRestore}" did not settle within ${REBIND_OP_TIMEOUT_MS}ms. The write may still land late; fresh readback is mandatory.`
        );
        const fresh = await readPlaced(primitiveIdToRestore);
        if (fresh.present !== true || !fresh.component) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Restored component "${primitiveIdToRestore}" was not proven present by fresh readback.`,
            fresh.error
          );
        }
        const actual = serializeComponent(fresh.component);
        const differences = rebindInstanceDifferences(snapshot, actual);
        if (differences.length) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Restored component "${primitiveIdToRestore}" does not exactly match the original instance (${differences.join(", ")}).`,
            rebindFactsDetail({ phase: "restore-verify", differences, expectedUniqueId: originalUniqueId, actualUniqueId: actual.uniqueId })
          );
        }
        await verifyPlacedBinding(fresh.component, expectedDevice, expectedRef, purpose);
        return fresh.component;
      };
      const armLibConflictAutoClicker = async () => {
        const AsyncFunction = Object.getPrototypeOf(async () => {
        }).constructor;
        const arm = new AsyncFunction(`
				let clicks = 0;
				const tryClick = () => {
					const modals = Array.from(document.querySelectorAll('.arco-modal, [class*=modal]'))
						.filter(e => e.offsetParent !== null && /\u53E6\u5B58\u4E3A|\u540C\u540D\u5E93/.test(e.innerText || ''));
					if (!modals.length) return;
					const btn = modals.flatMap(m => Array.from(m.querySelectorAll('button')))
						.find(b => (b.innerText || '').replace(/\\s+/g, '') === '\u786E\u8BA4' && b.offsetParent !== null);
					if (btn) { btn.click(); clicks++; }
				};
				tryClick();
				const obs = new MutationObserver(tryClick);
				obs.observe(document.body, { childList: true, subtree: true, attributes: true });
				return () => { obs.disconnect(); return clicks; };
			`);
        return arm();
      };
      let inPlaceCall = "returned-false";
      let inPlaceCallError;
      try {
        const returned = await withTimeout(
          mutate(() => eda.lib_Device.modify(device.uuid, device.libraryUuid, void 0, void 0, newAssoc)),
          REBIND_OP_TIMEOUT_MS,
          `Device association update did not settle within ${REBIND_OP_TIMEOUT_MS}ms. It may land late; the canvas is still unchanged, but do not retry the rebind or run PCB import-changes until fresh library and schematic readback.`
        );
        inPlaceCall = returned === false ? "returned-false" : "returned-true";
      } catch (err) {
        if (err instanceof ActionError && /did not settle/.test(err.message)) throw err;
        inPlaceCall = "rejected";
        inPlaceCallError = describeThrown(err);
      }
      const applied = await readAssociation(device);
      const inPlaceOk = sameDeviceRef(applied.ref, target);
      const associationStillOriginal = sameDeviceRef(applied.ref, oldRef);
      rlog(`in-place modify call=${inPlaceCall} readback=${inPlaceOk ? "target" : associationStillOriginal ? "original" : "unknown"}`);
      if (!inPlaceOk && !associationStillOriginal) {
        const rollbackErrors = [];
        try {
          await withTimeout(
            mutate(() => eda.lib_Device.modify(device.uuid, device.libraryUuid, void 0, void 0, rollbackAssoc)),
            REBIND_OP_TIMEOUT_MS,
            `Rollback after ambiguous in-place ${kind} association did not settle within ${REBIND_OP_TIMEOUT_MS}ms.`
          );
        } catch (err) {
          rollbackErrors.push(describeThrown(err));
        }
        const rolledBack = await readAssociation(device);
        const oldPresence = await readPlaced(primitiveId);
        const rollbackVerified = sameDeviceRef(rolledBack.ref, oldRef) && oldPresence.present === true && rollbackErrors.length === 0;
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Device ${kind} mutation outcome was ambiguous after fresh association readback. The original instance was not deleted.`,
          rebindFactsDetail({
            phase: "bind-device-association",
            call: { outcome: inPlaceCall, ...inPlaceCallError ? { error: inPlaceCallError } : {} },
            expectedRef: { uuid: target.uuid, libraryUuid: target.libraryUuid },
            oldRef,
            actualRef: applied.ref ?? null,
            associationError: applied.error,
            oldPrimitive: { primitiveId, present: oldPresence.present, ...oldPresence.error ? { error: oldPresence.error } : {} },
            replacement: { primitiveId: null, present: false },
            rollback: { attempted: true, verified: rollbackVerified, actualRef: rolledBack.ref ?? null, errors: rollbackErrors }
          })
        );
      }
      let effectiveDevice = device;
      let clonedDevice;
      if (!inPlaceOk) {
        let personalLib;
        try {
          personalLib = await eda.lib_LibrariesList.getPersonalLibraryUuid();
        } catch {
        }
        if (!personalLib) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `lib_Device.modify rejected the ${kind} rebind (read-only library record) and no personal library is available for the clone fallback.`
          );
        }
        let baseName = "";
        try {
          baseName = (await eda.lib_Device.get(device.uuid, device.libraryUuid))?.name ?? "";
        } catch {
        }
        if (!baseName) {
          baseName = typeof snapshot.manufacturerId === "string" && snapshot.manufacturerId || device.uuid.slice(0, 8);
        }
        const suffix = target.name && target.name !== target.uuid ? target.name : `${kind}-${target.uuid.slice(0, 8)}`;
        const cloneName = `${baseName}_${suffix}`;
        const stopClicker = await armLibConflictAutoClicker();
        let copied;
        let copiedByThisAction = false;
        let reusedClonePreviousRef;
        try {
          const attemptCopy = async (name2) => {
            rlog(`copy start ${name2}`);
            const got = await withTimeout(
              mutate(() => eda.lib_Device.copy(device.uuid, device.libraryUuid, personalLib, void 0, name2)).catch((e) => {
                rlog(`copy rejected: ${String(e && e.message || e).slice(0, 80)}`);
                return void 0;
              }).then((v) => v ?? void 0),
              REBIND_OP_TIMEOUT_MS,
              `Device clone "${name2}" did not settle within ${REBIND_OP_TIMEOUT_MS}ms. The clone may still land late; do not retry the rebind until a fresh library and schematic read establishes the actual state.`
            );
            if (got) {
              copiedByThisAction = true;
              return got;
            }
            try {
              const hits = await eda.lib_Device.search(name2, personalLib);
              const exact = (Array.isArray(hits) ? hits : []).filter((h) => h.name === name2 && typeof h.uuid === "string" && (!nativeInstanceDomain || h.libraryUuid === personalLib && libraryIdentityUuid(h.uuid)));
              if (exact.length > 1) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Multiple exact personal-library clones were found; no first-hit identity is permitted.");
              const hit = exact[0];
              rlog(`landed check: ${hit ? "found" : "missing"}`);
              return hit ? hit.uuid : void 0;
            } catch (err) {
              if (err instanceof ActionError) throw err;
              return void 0;
            }
          };
          try {
            const pre = await eda.lib_Device.search(cloneName, personalLib);
            const exact = (Array.isArray(pre) ? pre : []).filter((h) => h.name === cloneName && typeof h.uuid === "string" && (!nativeInstanceDomain || h.libraryUuid === personalLib && libraryIdentityUuid(h.uuid)));
            if (exact.length > 1) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Multiple exact personal-library clones were found; reuse is ambiguous.");
            const hit = exact[0];
            if (hit) {
              const detail = await eda.lib_Device.get(hit.uuid, personalLib);
              if (nativeInstanceDomain && (detail?.uuid !== hit.uuid || detail?.libraryUuid !== personalLib || detail.property?.manufacturerId !== snapshot.manufacturerId || detail.property?.supplierId !== snapshot.supplierId)) {
                throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Personal clone detail conflicts with the exact original model/supplier identity.");
              }
              const previousRef = deviceAssociationRef(detail, kind);
              if (previousRef) {
                copied = hit.uuid;
                reusedClonePreviousRef = previousRef;
                rlog(`clone reused: ${copied}`);
              }
            }
          } catch (err) {
            if (err instanceof ActionError) throw err;
          }
          if (!copied) copied = await attemptCopy(cloneName);
          if (!copied) copied = await attemptCopy(`${cloneName}_2`);
          if (!copied) {
            throw new ActionError(
              ErrorCodes.EDA_CALL_FAILED,
              `The device record is read-only and cloning it into the personal library failed (tried "${cloneName}"). Canvas unchanged.`
            );
          }
          let cloneModOk = false;
          try {
            cloneModOk = await withTimeout(
              mutate(() => eda.lib_Device.modify(copied, personalLib, void 0, void 0, newAssoc)),
              REBIND_OP_TIMEOUT_MS,
              `Device clone association update did not settle within ${REBIND_OP_TIMEOUT_MS}ms. It may land late; do not retry the rebind until fresh library and schematic readback.`
            ) !== false;
          } catch (err) {
            if (err instanceof ActionError && /did not settle/.test(err.message)) throw err;
            cloneModOk = false;
          }
          rlog(`clone modify: ${cloneModOk}`);
          if (!cloneModOk) {
            try {
              await mutate(() => eda.lib_Device.delete(copied, personalLib));
            } catch {
            }
            throw new ActionError(
              ErrorCodes.EDA_CALL_FAILED,
              `Failed to bind the new ${kind} onto the personal-library clone "${cloneName}" (clone removed, canvas unchanged).`
            );
          }
        } finally {
          const clicks = stopClicker();
          rlog(`clone segment done (dialog clicks: ${clicks})`);
        }
        effectiveDevice = { uuid: copied, libraryUuid: personalLib };
        clonedDevice = {
          uuid: copied,
          libraryUuid: personalLib,
          name: cloneName,
          owned: copiedByThisAction,
          ...reusedClonePreviousRef ? { previousRef: reusedClonePreviousRef } : {}
        };
        rlog(`clone bound: ${copied}`);
      }
      let phase = "candidate-create";
      let candidateId;
      let oldDeleted = false;
      let candidateMayLandLate = false;
      const rollback = async () => {
        const errors = [];
        try {
          await assertRebindContext();
        } catch (err) {
          return { attempted: false, verified: false, errors: [describeThrown(err)], contextUnavailable: true };
        }
        let candidatePresence = candidateId ? await readPlaced(candidateId) : { present: candidateMayLandLate ? null : false };
        if (candidateId && candidatePresence.present !== false) {
          try {
            await withTimeout(
              mutate(() => eda.sch_PrimitiveComponent.delete(candidateId)),
              REBIND_OP_TIMEOUT_MS,
              `Rollback delete for replacement "${candidateId}" did not settle within ${REBIND_OP_TIMEOUT_MS}ms.`
            );
          } catch (err) {
            errors.push(`candidate delete: ${describeThrown(err)}`);
          }
          candidatePresence = await readPlaced(candidateId);
          if (candidatePresence.present !== false) {
            errors.push(`candidate removal unverified (present=${String(candidatePresence.present)}${candidatePresence.error ? `: ${candidatePresence.error}` : ""})`);
          }
        }
        let deviceAssociationRestored = !inPlaceOk;
        if (inPlaceOk) {
          try {
            await withTimeout(
              mutate(() => eda.lib_Device.modify(device.uuid, device.libraryUuid, void 0, void 0, rollbackAssoc)),
              REBIND_OP_TIMEOUT_MS,
              `Rollback of the original device association did not settle within ${REBIND_OP_TIMEOUT_MS}ms.`
            );
            const detail = await withTimeout(
              Promise.resolve(eda.lib_Device.get(device.uuid, device.libraryUuid)),
              REBIND_OP_TIMEOUT_MS,
              `Rollback device-association readback timed out after ${REBIND_OP_TIMEOUT_MS}ms.`
            );
            deviceAssociationRestored = sameDeviceRef(deviceAssociationRef(detail, kind), oldRef);
            if (!deviceAssociationRestored) errors.push("original device association readback does not match the pre-rebind identity");
          } catch (err) {
            errors.push(`device association rollback: ${describeThrown(err)}`);
          }
        }
        let reusedCloneRestored = true;
        if (clonedDevice && !clonedDevice.owned && clonedDevice.previousRef) {
          const previousAssoc = kind === "footprint" ? { footprint: clonedDevice.previousRef } : { symbol: clonedDevice.previousRef };
          try {
            await withTimeout(
              mutate(() => eda.lib_Device.modify(clonedDevice.uuid, clonedDevice.libraryUuid, void 0, void 0, previousAssoc)),
              REBIND_OP_TIMEOUT_MS,
              `Rollback of the reused clone association did not settle within ${REBIND_OP_TIMEOUT_MS}ms.`
            );
            const detail = await withTimeout(
              Promise.resolve(eda.lib_Device.get(clonedDevice.uuid, clonedDevice.libraryUuid)),
              REBIND_OP_TIMEOUT_MS,
              `Reused-clone rollback readback timed out after ${REBIND_OP_TIMEOUT_MS}ms.`
            );
            reusedCloneRestored = sameDeviceRef(deviceAssociationRef(detail, kind), clonedDevice.previousRef);
            if (!reusedCloneRestored) errors.push("reused clone association readback does not match its pre-rebind identity");
          } catch (err) {
            reusedCloneRestored = false;
            errors.push(`reused clone rollback: ${describeThrown(err)}`);
          }
        }
        let oldPresence = await readPlaced(primitiveId);
        let restoredOriginalId;
        let restoredOriginalVerified = oldPresence.present === true;
        if (nativeInstanceDomain && oldPresence.present === true && oldPresence.component) {
          try {
            await verifyPlacedBinding(oldPresence.component, device, oldRef, "rollback-original");
            const differences = rebindInstanceDifferences(snapshot, serializeComponent(oldPresence.component));
            if (differences.length) throw new Error(`original instance differs: ${differences.join(", ")}`);
          } catch (err) {
            restoredOriginalVerified = false;
            errors.push(`original instance verification: ${describeThrown(err)}`);
          }
        }
        if (oldPresence.present === false && deviceAssociationRestored) {
          try {
            const restored = await createPlaced(device, "rollback-original", (id) => {
              restoredOriginalId = id;
            });
            await restoreAndVerify(restored.getState_PrimitiveId(), device, oldRef, "rollback-original");
            restoredOriginalVerified = true;
          } catch (err) {
            errors.push(`original instance restore: ${describeThrown(err)}`);
          }
        } else if (oldPresence.present === null) {
          errors.push(`original instance presence unverified${oldPresence.error ? `: ${oldPresence.error}` : ""}`);
        }
        let ownedCloneRemoved = !clonedDevice?.owned;
        if (clonedDevice?.owned) {
          try {
            await withTimeout(
              mutate(() => eda.lib_Device.delete(clonedDevice.uuid, clonedDevice.libraryUuid)),
              REBIND_OP_TIMEOUT_MS,
              `Rollback delete for owned clone "${clonedDevice.uuid}" did not settle within ${REBIND_OP_TIMEOUT_MS}ms.`
            );
            const after = await withTimeout(
              Promise.resolve(eda.lib_Device.get(clonedDevice.uuid, clonedDevice.libraryUuid)),
              REBIND_OP_TIMEOUT_MS,
              `Owned-clone delete readback timed out after ${REBIND_OP_TIMEOUT_MS}ms.`
            );
            ownedCloneRemoved = !after;
            if (!ownedCloneRemoved) errors.push("owned clone still exists after rollback delete");
          } catch (err) {
            errors.push(`owned clone rollback: ${describeThrown(err)}`);
          }
        }
        oldPresence = await readPlaced(primitiveId);
        const rollbackVerified = candidatePresence.present === false && restoredOriginalVerified && deviceAssociationRestored && reusedCloneRestored && ownedCloneRemoved && errors.length === 0;
        return {
          attempted: true,
          verified: rollbackVerified,
          oldPrimitive: { primitiveId, present: oldPresence.present, ...oldPresence.error ? { error: oldPresence.error } : {} },
          replacement: { primitiveId: candidateId ?? null, present: candidatePresence.present, mayLandLate: candidateMayLandLate },
          ...restoredOriginalId ? { restoredOriginal: { primitiveId: restoredOriginalId, verified: restoredOriginalVerified } } : {},
          deviceAssociationRestored,
          reusedCloneRestored,
          ownedCloneRemoved,
          errors
        };
      };
      const failWithRollback = async (err) => {
        const failedPhase = phase;
        const rollbackFacts = await rollback();
        const oldNow = await readPlaced(primitiveId);
        const candidateNow = candidateId ? await readPlaced(candidateId) : { present: candidateMayLandLate ? null : false };
        const facts = {
          phase: failedPhase,
          oldPrimitive: { primitiveId, present: oldNow.present, ...oldNow.error ? { error: oldNow.error } : {} },
          replacement: { primitiveId: candidateId ?? null, present: candidateNow.present, mayLandLate: candidateMayLandLate },
          rollback: rollbackFacts,
          cause: describeThrown(err)
        };
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Schematic ${kind} rebind failed during phase "${failedPhase}". Do not blindly retry or run PCB import-changes; use a fresh schematic read to reconcile the old and replacement instances first.`,
          rebindFactsDetail(facts)
        );
      };
      let candidate;
      try {
        candidate = await createPlaced(effectiveDevice, "candidate", (id) => {
          candidateId = id;
        });
      } catch (err) {
        candidateMayLandLate = /may still land late|did not settle/.test(describeThrown(err));
        return failWithRollback(err);
      }
      candidateId = candidate.getState_PrimitiveId();
      rlog(`candidate verified ${candidateId}`);
      if (nativeInstanceDomain) {
        phase = "candidate-binding-readback";
        try {
          await assertRebindContext();
          const observed = serializeComponent(candidate);
          const inventory = await loadNativeFootprintInventory(identityContext);
          if (inventory.error) throw new Error(inventory.error);
          const native = readNativeFootprintSource(inventory.entries, readDeviceFootprint(observed).uuid);
          const association = await readAssociation(effectiveDevice);
          if (!native.source || !sameDeviceRef(native.source, target) || identityRecord(observed.device).libraryUuid !== effectiveDevice.libraryUuid || !sameDeviceRef(association.ref, target)) {
            throw new Error(`Candidate native source or library binding differs from the requested target: ${native.error ?? association.error ?? "identity mismatch"}`);
          }
          await assertRebindContext();
        } catch (err) {
          return failWithRollback(err);
        }
      }
      phase = "delete-original";
      try {
        await withTimeout(
          mutate(() => eda.sch_PrimitiveComponent.delete(primitiveId)),
          REBIND_OP_TIMEOUT_MS,
          `Original-instance delete did not settle within ${REBIND_OP_TIMEOUT_MS}ms. It may have applied; do not retry until fresh readback.`
        );
        const oldAfterDelete = await readPlaced(primitiveId);
        if (oldAfterDelete.present !== false) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Original instance "${primitiveId}" was not proven absent after delete.`,
            oldAfterDelete.error
          );
        }
        oldDeleted = true;
      } catch (err) {
        return failWithRollback(err);
      }
      rlog("old instance deletion verified");
      phase = "restore-and-verify";
      let created;
      try {
        created = await restoreAndVerify(candidateId, effectiveDevice, target, "replacement");
      } catch (err) {
        return failWithRollback(err);
      }
      rlog(`replacement identity verified ${created.getState_PrimitiveId()}`);
      const warnings = [
        `Re-placing minted a new primitiveId; wires on the old instance's pins may need re-drawing \u2014 run \`sch drc\` / \`sch check\` to confirm connectivity.`
      ];
      if (clonedDevice) {
        warnings.push(
          `The original device record is read-only (system library), so the component now references a personal-library clone "${clonedDevice.name}" carrying the new ${kind}. BOM identity (manufacturer/supplier) was restored from the original part.`
        );
      }
      return {
        result: {
          primitiveId: created.getState_PrimitiveId(),
          previousPrimitiveId: primitiveId,
          rebound: kind,
          verified: true,
          ...nativeInstanceDomain ? { originalPlacedReference: oldPlacedRef, originalLibraryReference: oldRef } : {},
          mode: clonedDevice ? "cloned-to-personal-library" : "in-place",
          device: { uuid: effectiveDevice.uuid, libraryUuid: effectiveDevice.libraryUuid },
          ...clonedDevice ? {
            clonedDevice: { uuid: clonedDevice.uuid, libraryUuid: clonedDevice.libraryUuid, name: clonedDevice.name },
            originalDevice: { uuid: device.uuid, libraryUuid: device.libraryUuid }
          } : {},
          [kind]: { uuid: target.uuid, libraryUuid: target.libraryUuid, name: target.name },
          component: serializeComponent(created),
          transaction: {
            order: ["candidate-create", "candidate-readback", "delete-original", "restore-and-verify"],
            oldDeleted,
            verified: true
          }
        },
        warnings
      };
    };
  }
  var schematicRebindFootprint = makeRebindHandler("footprint");
  var schematicRebindSymbol = makeRebindHandler("symbol");
  var schematicTextList = async () => {
    let texts;
    try {
      texts = await eda.sch_PrimitiveText.getAll();
    } catch (err) {
      throw edaError(err, "Failed to list schematic text primitives.");
    }
    const items = (Array.isArray(texts) ? texts : []).map((t) => ({
      primitiveId: t.getState_PrimitiveId(),
      content: t.getState_Content(),
      x: t.getState_X(),
      y: t.getState_Y(),
      rotation: t.getState_Rotation(),
      fontSize: t.getState_FontSize(),
      fontName: t.getState_FontName(),
      color: t.getState_TextColor(),
      bold: t.getState_Bold(),
      italic: t.getState_Italic()
    }));
    return { result: { count: items.length, scope: "activePage", texts: items } };
  };
  var schematicTextMove = async (payload) => {
    const raw = payload.moves;
    if (!Array.isArray(raw) || !raw.length) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "moves must be a non-empty array of {primitiveId, x, y}.");
    const moves = raw.map((m, i) => {
      if (!m || typeof m !== "object") throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `moves[${i}] must be an object.`);
      const r = m;
      const primitiveId = typeof r.primitiveId === "string" && r.primitiveId ? r.primitiveId : "";
      if (!primitiveId || typeof r.x !== "number" || !Number.isFinite(r.x) || typeof r.y !== "number" || !Number.isFinite(r.y)) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `moves[${i}] needs primitiveId and finite x, y.`);
      }
      return { primitiveId, x: r.x, y: r.y };
    });
    if (new Set(moves.map((m) => m.primitiveId)).size !== moves.length) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Duplicate primitiveId in moves.");
    const at = async (id) => {
      try {
        const t = await eda.sch_PrimitiveText.get(id);
        return t ? { x: t.getState_X(), y: t.getState_Y() } : void 0;
      } catch {
        return void 0;
      }
    };
    for (const m of moves) if (!await at(m.primitiveId)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Text ${m.primitiveId} not found on the active page; nothing was moved.`);
    const near = (a, b) => Math.abs(a - b) < 1e-3;
    const moved = [];
    const notMoved = [];
    for (const m of moves) {
      let error;
      try {
        await eda.sch_PrimitiveText.modify(m.primitiveId, { x: m.x, y: m.y });
      } catch (err) {
        error = describeThrown(err);
      }
      let actual = await at(m.primitiveId);
      for (const deadline = Date.now() + 2e3; actual && !(near(actual.x, m.x) && near(actual.y, m.y)) && Date.now() < deadline; ) {
        await sleep(100);
        actual = await at(m.primitiveId);
      }
      if (actual && near(actual.x, m.x) && near(actual.y, m.y)) moved.push(m.primitiveId);
      else notMoved.push({ ...m, ...actual ? { actual } : {}, ...error ? { error } : {} });
    }
    const result = { moved, verified: notMoved.length === 0 };
    if (notMoved.length) {
      result.partial = moved.length > 0;
      result.notMoved = notMoved;
    }
    return { result };
  };
  var schematicVisibleTextBBoxes = async () => {
    try {
      const before = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (!before?.uuid) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "No active document.");
      const items = [];
      const unmeasured = [];
      const measure = async (id) => {
        const b = await eda.sch_Primitive.getPrimitivesBBox([id]);
        return b && [b.minX, b.minY, b.maxX, b.maxY].every((n) => typeof n === "number" && Number.isFinite(n)) ? { minX: b.minX, minY: b.minY, maxX: b.maxX, maxY: b.maxY } : null;
      };
      const texts = await eda.sch_PrimitiveText.getAll();
      for (const t of Array.isArray(texts) ? texts : []) {
        const id = t.getState_PrimitiveId();
        const bbox = await measure(id);
        (bbox ? items : unmeasured).push({ id, kind: "text", content: t.getState_Content(), ...bbox ? { bbox } : {} });
      }
      const comps = await eda.sch_PrimitiveComponent.getAll(void 0, false);
      for (const c of Array.isArray(comps) ? comps : []) {
        const parentId = c.getState_PrimitiveId();
        const attrs = await eda.sch_PrimitiveAttribute.getAll(parentId);
        for (const a of Array.isArray(attrs) ? attrs : []) {
          if (a.getState_ValueVisible() !== true && a.getState_KeyVisible() !== true) continue;
          const id = a.getState_PrimitiveId();
          const bbox = await measure(id);
          (bbox ? items : unmeasured).push({
            id,
            kind: "attribute",
            parentId,
            componentType: String(c.getState_ComponentType()),
            designator: c.getState_Designator?.() ?? null,
            key: a.getState_Key(),
            ...bbox ? { bbox } : {}
          });
        }
      }
      const after = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (after?.uuid !== before.uuid) throw new Error("active schematic page changed during measurement");
      return { result: { documentId: before.uuid, count: items.length, items, unmeasured } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Could not measure visible schematic text.");
    }
  };
  async function readPinSnapshots(primitiveId) {
    try {
      const pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(primitiveId);
      if (!Array.isArray(pins)) return void 0;
      return pins.map((p) => ({
        pinNumber: String(p.getState_PinNumber() ?? ""),
        pinName: String(p.getState_PinName() ?? ""),
        x: p.getState_X(),
        y: p.getState_Y()
      }));
    } catch {
      return void 0;
    }
  }
  function diffPins(oldPins, newPins) {
    const oldByNumber = new Map(oldPins.map((p) => [p.pinNumber, p]));
    const newByNumber = new Map(newPins.map((p) => [p.pinNumber, p]));
    const removed = oldPins.filter((p) => !newByNumber.has(p.pinNumber));
    const added = newPins.filter((p) => !oldByNumber.has(p.pinNumber));
    const moved = [];
    for (const [num, oldPin] of oldByNumber) {
      const newPin = newByNumber.get(num);
      if (newPin && (newPin.x !== oldPin.x || newPin.y !== oldPin.y)) {
        moved.push({ pinNumber: num, pinName: newPin.pinName, from: { x: oldPin.x, y: oldPin.y }, to: { x: newPin.x, y: newPin.y } });
      }
    }
    return { removed, added, moved };
  }
  var asCandidate = (r) => {
    const footprint = readDeviceFootprint(r);
    return {
      name: String(r.name ?? ""),
      lcsc: String(r.supplierId ?? ""),
      uuid: String(r.uuid ?? ""),
      libraryUuid: String(r.libraryUuid ?? ""),
      footprintName: footprint.name,
      footprintUuid: footprint.uuid,
      footprintLibraryUuid: footprint.libraryUuid
    };
  };
  var identityRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  var identityText = (value) => typeof value === "string" ? value : "";
  var instanceIdentityUuid = (value) => /^[0-9a-f]{16}$/i.test(identityText(value));
  var libraryIdentityUuid = (value) => /^[0-9a-f]{32}$/i.test(identityText(value));
  async function assertPlacedIdentityContext(expected) {
    const current = await readResponseContext();
    if (!expected.projectUuid || !expected.documentUuid || current.projectUuid !== expected.projectUuid || current.documentUuid !== expected.documentUuid || expected.documentType && current.documentType !== expected.documentType || expected.tabId && current.tabId !== expected.tabId) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "project/document context changed or unavailable during placed-device identity proof; no mutation is permitted in another context");
    }
  }
  async function loadNativeFootprintInventory(expectedContext) {
    try {
      const before = await readResponseContext();
      if (!before.projectUuid || !before.documentUuid) return { error: "native footprint source requires a known current project and document" };
      if (expectedContext && (before.projectUuid !== expectedContext.projectUuid || before.documentUuid !== expectedContext.documentUuid)) return { error: "project/document changed since the component identity snapshot" };
      let entries2;
      let deviceEntries;
      let documentError = "";
      try {
        entries2 = await withTimeout(eda.sys_FileManager.getDocumentFootprintSources(), 7e3, "identity getDocumentFootprintSources timed out after 7000ms");
      } catch (err) {
        documentError = describeThrown(err);
      }
      if (!Array.isArray(entries2) || entries2.length === 0) {
        if (typeof eda.sys_FileManager?.getProjectFile !== "function") return { error: `official footprint source inventory unavailable; project export unavailable${documentError ? ` (${documentError})` : ""}` };
        const archive = await withTimeout(eda.sys_FileManager.getProjectFile("easyeda-agent-identity.epro2", void 0, "epro2"), 1e4, "identity getProjectFile timed out after 10000ms");
        if (!archive) return { error: "official project export did not return a source archive" };
        const sourceText = await withTimeout(readProjectNativeSourceArchive(archive), 7e3, "identity source archive decoding timed out after 7000ms");
        entries2 = projectFootprintSourceInventory(sourceText, before.documentUuid);
        deviceEntries = projectDeviceSourceInventory(sourceText, before.documentUuid);
      }
      if (!Array.isArray(entries2) || entries2.length > 2048) return { error: "official footprint source inventory is incomplete or exceeds 2048 entries" };
      const after = await readResponseContext();
      if (after.projectUuid !== before.projectUuid || after.documentUuid !== before.documentUuid) return { error: "project/document changed while reading native footprint source" };
      return { entries: entries2, ...deviceEntries ? { deviceEntries } : {} };
    } catch (err) {
      return { error: `official footprint source query failed: ${describeThrown(err)}` };
    }
  }
  async function resolveInstanceFootprintDevice(snapshot, getNativeFootprints, expectedContext) {
    const instanceFp = readDeviceFootprint(snapshot);
    const context = `instance footprint uuid=${JSON.stringify(instanceFp.uuid)}, libraryUuid=${JSON.stringify(instanceFp.libraryUuid)}`;
    const failure = (reason, candidates = []) => ({
      reason: `${reason}; ${context}; instance/library UUID domains require native META.source plus exact LCSC/model and official asset-library evidence`,
      ...candidates.length ? { candidates: candidates.slice(0, 5) } : {}
    });
    try {
      await assertPlacedIdentityContext(expectedContext);
    } catch (err) {
      return failure(describeThrown(err));
    }
    const inventory = await getNativeFootprints();
    if (inventory.error) return failure(inventory.error);
    const native = readNativeFootprintSource(inventory.entries, instanceFp.uuid);
    if (!native.source) return failure(native.error ?? "native footprint source is missing; name-only evidence cannot establish reconstruction identity");
    if (native.source.libraryUuid !== instanceFp.libraryUuid) return failure("native footprint source library conflicts with the placed footprint provenance");
    const deviceOrigin = inventory.deviceEntries ? readNativeDeviceSource(inventory.deviceEntries, identityText(identityRecord(snapshot.device).uuid)) : {};
    if (deviceOrigin.error) return failure(deviceOrigin.error);
    const proof = await proveNativePlacedDevice(snapshot, native.source, {
      assertContext: () => assertPlacedIdentityContext(expectedContext),
      byLcsc: (id) => withTimeout(eda.lib_Device.getByLcscIds([id], void 0, true), 7e3, `identity getByLcscIds ${id} timed out after 7000ms`),
      search: (query, library) => withTimeout(eda.lib_Device.search(query, library), 7e3, `identity scoped search ${query} timed out after 7000ms`),
      get: (uuid, library) => withTimeout(eda.lib_Device.get(uuid, library), 7e3, `identity device.get ${uuid} timed out after 7000ms`)
    }, deviceOrigin.source);
    if (!proof.device) return failure(proof.reason ?? "native placed device proof failed", (proof.candidates ?? []).map(asCandidate));
    return { device: proof.device, lcsc: proof.lcsc, deviceFootprint: proof.deviceFootprint, footprintSource: proof.footprintSource };
  }
  async function resolvePlacedDevice(snapshot, getNativeFootprints = loadNativeFootprintInventory, expectedContext) {
    const instanceFp = readDeviceFootprint(snapshot);
    if ((instanceIdentityUuid(identityRecord(snapshot.device).uuid) || libraryIdentityUuid(identityRecord(snapshot.device).uuid)) && instanceIdentityUuid(instanceFp.uuid)) {
      return resolveInstanceFootprintDevice(snapshot, getNativeFootprints, expectedContext ?? await readResponseContext());
    }
    const fpIdentity = instanceFp.name || instanceFp.uuid || instanceFp.libraryUuid;
    const finish = (hits, via) => {
      let pool = hits.filter((r) => typeof r.uuid === "string" && typeof r.libraryUuid === "string");
      const before = pool;
      if (fpIdentity) pool = pool.filter((r) => footprintMatchesInstance(instanceFp, r));
      if (pool.length === 1) {
        const hit = pool[0];
        return {
          device: { uuid: hit.uuid, libraryUuid: hit.libraryUuid, via },
          lcsc: /^C\d+$/.test(String(hit.supplierId ?? "")) ? String(hit.supplierId) : void 0,
          deviceFootprint: readDeviceFootprint(hit).name
        };
      }
      if (before.length > 0) {
        return {
          reason: pool.length === 0 ? `matched ${before.length} device(s) by ${via} but NONE carries the instance footprint "${fpIdentity}" (package-variant mismatch; instance footprint uuid=${JSON.stringify(instanceFp.uuid)}, libraryUuid=${JSON.stringify(instanceFp.libraryUuid)}; UUID/library identity takes priority over name)` : `${pool.length} devices match by ${via} + footprint \u2014 ambiguous`,
          candidates: before.slice(0, 5).map(asCandidate)
        };
      }
      return void 0;
    };
    const supplierId = typeof snapshot.supplierId === "string" ? snapshot.supplierId : "";
    if (/^C\d+$/.test(supplierId)) {
      try {
        const raw = await eda.lib_Device.getByLcscIds([supplierId], void 0, true);
        const r = finish(Array.isArray(raw) ? raw : [], "lcsc");
        if (r) return r;
      } catch {
      }
    }
    const mpn = typeof snapshot.manufacturerId === "string" ? snapshot.manufacturerId : "";
    if (mpn) {
      let raw = [];
      try {
        raw = await eda.lib_Device.search(mpn);
      } catch {
      }
      const r = finish((Array.isArray(raw) ? raw : []).filter((h) => h.manufacturerId === mpn), "mpn");
      if (r) return r;
    }
    const name2 = typeof snapshot.name === "string" ? snapshot.name : "";
    if (name2 && !name2.startsWith("={")) {
      let raw = [];
      try {
        raw = await eda.lib_Device.search(name2, "project");
      } catch {
      }
      const r = finish((Array.isArray(raw) ? raw : []).filter((h) => h.name === name2), "project-name");
      if (r) return r;
    }
    return { reason: "no exact LCSC/MPN/project-name library match" };
  }
  async function resolvePlacedDeviceIdentity(snapshot, expectedContext) {
    const res = await resolvePlacedDevice(snapshot, () => loadNativeFootprintInventory(expectedContext), expectedContext);
    if (res.device) return { ...res.device, ...res.footprintSource ? { footprintSource: res.footprintSource } : {} };
    throw new ActionError(
      ErrorCodes.INVALID_STATE,
      `Cannot resolve the placed component's 32-char device-library uuid (${res.reason ?? "no match"}) \u2014 aborting BEFORE any canvas change because rollback would be impossible. Note: the component's own device.uuid is a 16-char placed-symbol id and cannot re-create the part.`
    );
  }
  var schematicComponentResolveLcsc = async (payload) => {
    const onlyId = optionalString(payload, "primitiveId");
    const apply = optionalBoolean(payload, "apply") === true;
    let comps;
    try {
      comps = await eda.sch_PrimitiveComponent.getAll();
    } catch (err) {
      throw edaError(err, "Failed to list schematic components.");
    }
    const parts = (comps ?? []).filter((c) => {
      try {
        if (String(c.getState_ComponentType()) !== "part") return false;
        return !onlyId || c.getState_PrimitiveId() === onlyId;
      } catch {
        return false;
      }
    });
    if (onlyId && parts.length === 0) {
      throw new ActionError(ErrorCodes.INVALID_STATE, `No part with primitiveId "${onlyId}" on the active page.`);
    }
    const cache = /* @__PURE__ */ new Map();
    const items = [];
    const unresolved = [];
    let appliedCount = 0;
    for (const comp of parts) {
      const snapshot = serializeComponent(comp);
      const designator = String(snapshot.designator ?? "");
      const current = typeof snapshot.supplierId === "string" ? snapshot.supplierId : "";
      const footprint = readDeviceFootprint(snapshot);
      const fp = footprint.name;
      if (/^C\d+$/.test(current)) {
        items.push({ designator, lcsc: current, via: "instance", footprint: fp });
        continue;
      }
      const mpn = typeof snapshot.manufacturerId === "string" ? snapshot.manufacturerId : "";
      const cacheKey = JSON.stringify([
        current,
        mpn,
        typeof snapshot.name === "string" ? snapshot.name : "",
        footprint.uuid,
        footprint.libraryUuid,
        footprint.name.toLowerCase()
      ]);
      let res = cache.get(cacheKey);
      if (!res) {
        res = await resolvePlacedDevice(snapshot);
        cache.set(cacheKey, res);
      }
      if (!res.lcsc) {
        unresolved.push({
          designator,
          mpn,
          footprint: fp,
          reason: res.reason ?? (res.device ? "device resolved but carries no LCSC C-number" : "no match"),
          ...res.candidates ? { candidates: res.candidates } : {}
        });
        continue;
      }
      const item = { designator, lcsc: res.lcsc, via: res.device?.via, footprint: fp, previousSupplierId: current };
      if (apply) {
        try {
          const m = await eda.sch_PrimitiveComponent.modify(comp.getState_PrimitiveId(), { supplierId: res.lcsc });
          item.applied = Boolean(m);
          if (m) appliedCount++;
        } catch {
          item.applied = false;
        }
      }
      items.push(item);
    }
    return {
      result: {
        total: parts.length,
        resolvedCount: items.length,
        unresolvedCount: unresolved.length,
        ...apply ? { appliedCount } : {},
        items,
        ...unresolved.length ? { unresolved } : {},
        scope: "activePage"
      },
      ...unresolved.length ? { warnings: [`${unresolved.length} part(s) could not be resolved deterministically \u2014 review result.unresolved (candidates included); nothing was guessed.`] } : {}
    };
  };
  var schematicComponentReplace = async (payload) => {
    const primitiveId = requireString(payload, "primitiveId");
    const lcsc = optionalString(payload, "lcsc");
    const explicitUuid = optionalString(payload, "deviceUuid");
    const explicitLibraryUuid = optionalString(payload, "deviceLibraryUuid");
    const query = optionalString(payload, "query");
    const keepProperties = optionalBoolean(payload, "keepProperties") === true;
    const selectors = [lcsc, explicitUuid, query].filter(Boolean).length;
    if (selectors !== 1) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Provide exactly ONE target selector: "lcsc" (C-number), "deviceUuid" (+ "deviceLibraryUuid"), or "query" (device name, must match uniquely).'
      );
    }
    const identityContext = await readResponseContext();
    const component = await getComponentOrThrow(primitiveId);
    const snapshot = serializeComponent(component);
    const nativeInstanceDomain = instanceIdentityUuid(readDeviceFootprint(snapshot).uuid);
    const assertReplaceContext = async () => {
      if (nativeInstanceDomain) await assertPlacedIdentityContext(identityContext);
    };
    const readReplacePresence = async (id) => {
      try {
        await assertReplaceContext();
        const observed = await readRebindComponent(id);
        await assertReplaceContext();
        return observed;
      } catch (err) {
        return { present: null, error: describeThrown(err) };
      }
    };
    const oldName = typeof snapshot.name === "string" ? snapshot.name : void 0;
    const oldDevice = await resolvePlacedDeviceIdentity(snapshot, identityContext);
    const oldPins = await readPinSnapshots(primitiveId);
    let target;
    if (explicitUuid) {
      if (!explicitLibraryUuid) {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          '"deviceUuid" requires "deviceLibraryUuid" (both come from schematic.library.search / get_by_lcsc).'
        );
      }
      target = { uuid: explicitUuid, libraryUuid: explicitLibraryUuid };
    } else if (lcsc) {
      let raw;
      try {
        raw = await eda.lib_Device.getByLcscIds([lcsc], void 0, true);
      } catch (err) {
        throw edaError(err, `Failed to resolve LCSC id "${lcsc}".`);
      }
      const hits = (Array.isArray(raw) ? raw : []).filter((r) => typeof r.uuid === "string" && typeof r.libraryUuid === "string");
      if (hits.length === 0) {
        throw new ActionError(ErrorCodes.INVALID_STATE, `LCSC id "${lcsc}" did not resolve to any library device.`);
      }
      if (hits.length > 1) {
        const uuids = hits.map((h) => h.uuid).join(", ");
        throw new ActionError(
          ErrorCodes.INVALID_STATE,
          `LCSC id "${lcsc}" resolved to ${hits.length} devices (uuids: ${uuids}). Pass "deviceUuid" to pick one.`
        );
      }
      target = { uuid: hits[0].uuid, libraryUuid: hits[0].libraryUuid, name: typeof hits[0].name === "string" ? hits[0].name : void 0 };
    } else {
      let raw;
      try {
        raw = await eda.lib_Device.search(query);
      } catch (err) {
        throw edaError(err, `Failed to search the device library for "${query}".`);
      }
      const match = pickNamedCandidate(query, Array.isArray(raw) ? raw : []);
      if (match.kind === "none") {
        throw new ActionError(
          ErrorCodes.INVALID_STATE,
          `No device named "${query}" found. Use schematic.library.search to explore candidates, then pass "deviceUuid" or "lcsc".`
        );
      }
      if (match.kind === "ambiguous") {
        const uuids = match.matches.map((m) => m.uuid).join(", ");
        throw new ActionError(
          ErrorCodes.INVALID_STATE,
          `${match.matches.length} devices named "${query}" match (uuids: ${uuids}). Pass "deviceUuid" to pick one.`
        );
      }
      target = match.item;
    }
    if (target.uuid === oldDevice.uuid) {
      throw new ActionError(
        ErrorCodes.INVALID_STATE,
        `Target device is the SAME as the placed one (${target.uuid}) \u2014 nothing to replace. Use schematic.component.modify for property-only changes.`
      );
    }
    const x = typeof snapshot.x === "number" ? snapshot.x : 0;
    const y = typeof snapshot.y === "number" ? snapshot.y : 0;
    const rotation = typeof snapshot.rotation === "number" ? snapshot.rotation : void 0;
    const mirror = typeof snapshot.mirror === "boolean" ? snapshot.mirror : void 0;
    const addIntoBom = typeof snapshot.addIntoBom === "boolean" ? snapshot.addIntoBom : void 0;
    const addIntoPcb = typeof snapshot.addIntoPcb === "boolean" ? snapshot.addIntoPcb : void 0;
    const carryProps = {
      ...typeof snapshot.designator === "string" ? { designator: snapshot.designator } : {},
      ...typeof snapshot.uniqueId === "string" ? { uniqueId: snapshot.uniqueId } : {},
      ...keepProperties && cleanOtherProperty(snapshot.otherProperty) ? { otherProperty: cleanOtherProperty(snapshot.otherProperty) } : {}
    };
    const rollbackProps = {
      ...carryProps,
      ...typeof snapshot.manufacturer === "string" ? { manufacturer: snapshot.manufacturer } : {},
      ...typeof snapshot.manufacturerId === "string" ? { manufacturerId: snapshot.manufacturerId } : {},
      ...typeof snapshot.supplier === "string" ? { supplier: snapshot.supplier } : {},
      ...typeof snapshot.supplierId === "string" ? { supplierId: snapshot.supplierId } : {},
      ...cleanOtherProperty(snapshot.otherProperty) ? { otherProperty: cleanOtherProperty(snapshot.otherProperty) } : {}
    };
    const place = async (dev, props, onCreated) => {
      await assertReplaceContext();
      let c = await eda.sch_PrimitiveComponent.create(
        { libraryUuid: dev.libraryUuid, uuid: dev.uuid },
        x,
        y,
        void 0,
        rotation,
        mirror,
        addIntoBom,
        addIntoPcb
      );
      if (c) onCreated?.(c.getState_PrimitiveId());
      await assertReplaceContext();
      if (c && Object.keys(props).length) {
        try {
          await assertReplaceContext();
          const m = await eda.sch_PrimitiveComponent.modify(c.getState_PrimitiveId(), props);
          if (m) c = m;
          await assertReplaceContext();
        } catch (err) {
          if (nativeInstanceDomain) throw err;
        }
      }
      if (c && !nativeInstanceDomain) c = (await backfillSupplierId(c, dev)).component;
      if (c && nativeInstanceDomain && !/^C\d+$/.test(identityText(c.getState_SupplierId()))) {
        await assertReplaceContext();
        const detail = await withTimeout(eda.lib_Device.get(dev.uuid, dev.libraryUuid), REBIND_OP_TIMEOUT_MS, "Replacement supplier detail timed out.");
        await assertReplaceContext();
        const supplierId = identityText(detail?.property?.supplierId);
        if (detail?.uuid !== dev.uuid || detail.libraryUuid !== dev.libraryUuid) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Replacement supplier detail returned a different device.");
        if (/^C\d+$/.test(supplierId)) {
          const modified = await eda.sch_PrimitiveComponent.modify(c.getState_PrimitiveId(), { supplierId });
          await assertReplaceContext();
          if (modified) c = modified;
        }
      }
      if (c && nativeInstanceDomain) {
        await assertReplaceContext();
        const fresh = await readRebindComponent(c.getState_PrimitiveId());
        await assertReplaceContext();
        if (fresh.present !== true || !fresh.component) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Replacement instance was not proven present by fresh readback.", fresh.error);
        const observed = serializeComponent(fresh.component);
        const identity = await resolvePlacedDeviceIdentity(observed, identityContext);
        if (!sameDeviceRef(identity, dev)) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Replacement or rollback-original resolved to a different library device.");
        for (const [key, value] of Object.entries(props)) {
          if (exactJSON(observed[key]) !== exactJSON(value)) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Replacement or rollback-original property ${key} was not restored.`);
        }
        for (const key of ["x", "y", "rotation", "mirror", "addIntoBom", "addIntoPcb"]) {
          if (exactJSON(observed[key]) !== exactJSON(snapshot[key])) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Replacement or rollback-original pose ${key} differs from the original.`);
        }
        c = fresh.component;
      }
      return c ?? void 0;
    };
    let attemptedCandidateId;
    let restoredOriginalId;
    const failNativeReplace = async (err, phase, rollback) => {
      const original = await readReplacePresence(primitiveId);
      const replacement = attemptedCandidateId ? await readReplacePresence(attemptedCandidateId) : { present: null };
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `Schematic replacement failed during phase "${phase}". Read the original document and reconcile the reported instances before retrying.`,
        `replace transaction facts: ${JSON.stringify({
          phase,
          cause: describeThrown(err),
          oldPrimitive: { primitiveId, present: original.present, ...original.error ? { error: original.error } : {} },
          replacement: { primitiveId: attemptedCandidateId ?? null, present: replacement.present, ...replacement.error ? { error: replacement.error } : {} },
          rollback
        })}`
      );
    };
    let oldDeleteReturned = false;
    try {
      await assertReplaceContext();
      await eda.sch_PrimitiveComponent.delete(primitiveId);
      oldDeleteReturned = true;
      await assertReplaceContext();
      if (nativeInstanceDomain && (await readReplacePresence(primitiveId)).present !== false) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Original instance was not proven absent after replacement delete.");
      }
    } catch (err) {
      if (nativeInstanceDomain) return failNativeReplace(err, "original-delete", { attempted: false, verified: false, oldDeleteReturned });
      throw edaError(err, oldDeleteReturned ? `Old-instance delete returned but could not be verified in the original document; no further mutation was performed. Read the original document before retrying.` : `Failed to delete the old instance "${primitiveId}"; mutation outcome is unverified.`);
    }
    let created;
    let placeError;
    try {
      created = await place({ libraryUuid: target.libraryUuid, uuid: target.uuid }, carryProps, (id) => {
        attemptedCandidateId = id;
      });
    } catch (err) {
      placeError = err;
    }
    if (!created) {
      if (nativeInstanceDomain) {
        try {
          await assertReplaceContext();
        } catch (err) {
          return failNativeReplace(placeError ?? err, "replacement-readback", { attempted: false, verified: false, contextUnavailable: true, errors: [describeThrown(err)] });
        }
        if (!attemptedCandidateId) return failNativeReplace(placeError ?? "Replacement create returned no identifiable primitive.", "replacement-create", {
          attempted: false,
          verified: false,
          errors: ["Replacement absence could not be proven without a returned primitiveId; rollback was not attempted."]
        });
        try {
          await eda.sch_PrimitiveComponent.delete(attemptedCandidateId);
          await assertReplaceContext();
          if ((await readReplacePresence(attemptedCandidateId)).present !== false) throw new Error("Replacement removal could not be proven; rollback was not attempted.");
        } catch (err) {
          return failNativeReplace(placeError ?? err, "replacement-cleanup", { attempted: false, verified: false, errors: [describeThrown(err)] });
        }
        let restored2 = false;
        const rollbackErrors = [];
        try {
          restored2 = Boolean(await place(oldDevice, rollbackProps, (id) => {
            restoredOriginalId = id;
          }));
        } catch (err) {
          rollbackErrors.push(describeThrown(err));
        }
        return failNativeReplace(placeError ?? "Replacement create returned no primitive.", "replacement-restore", {
          attempted: true,
          verified: restored2,
          errors: rollbackErrors,
          ...restoredOriginalId ? { restoredOriginal: { primitiveId: restoredOriginalId, verified: restored2 } } : {}
        });
      }
      let restored = false;
      try {
        restored = Boolean(await place(oldDevice, rollbackProps));
      } catch {
      }
      const rollbackNote = restored ? "rolled back \u2014 the original component was re-created (with a NEW primitiveId; verify wires)" : "ROLLBACK FAILED \u2014 the original component is GONE; re-place it manually";
      if (placeError) throw edaError(placeError, `Failed to place the replacement device (${rollbackNote}).`);
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `Placing the replacement device returned no primitive (${rollbackNote}).`
      );
    }
    const newId = created.getState_PrimitiveId();
    const newPins = await readPinSnapshots(newId);
    const pinDiff = oldPins && newPins ? (() => {
      const d = diffPins(oldPins, newPins);
      return {
        available: true,
        oldCount: oldPins.length,
        newCount: newPins.length,
        removed: d.removed.slice(0, 20),
        added: d.added.slice(0, 20),
        moved: d.moved.slice(0, 20),
        removedCount: d.removed.length,
        addedCount: d.added.length,
        movedCount: d.moved.length
      };
    })() : { available: false };
    const warnings = [
      "Re-placing minted a new primitiveId; wires on the old pins may need re-drawing \u2014 run `sch drc` / `sch check` to confirm connectivity."
    ];
    if (pinDiff.available && (pinDiff.removedCount || pinDiff.addedCount || pinDiff.movedCount)) {
      warnings.push(
        `Pin geometry differs from the old device (removed=${pinDiff.removedCount}, added=${pinDiff.addedCount}, moved=${pinDiff.movedCount}) \u2014 existing wires will NOT line up; re-wire the affected pins.`
      );
    }
    return {
      result: {
        primitiveId: newId,
        previousPrimitiveId: primitiveId,
        previousDevice: { uuid: oldDevice.uuid, libraryUuid: oldDevice.libraryUuid, resolvedVia: oldDevice.via, ...oldName ? { name: oldName } : {} },
        device: { uuid: target.uuid, libraryUuid: target.libraryUuid, ...target.name ? { name: target.name } : {} },
        pinDiff,
        component: serializeComponent(created)
      },
      warnings
    };
  };
  function connectPinEndpoint(pinX, pinY, offset, direction) {
    let endX = pinX;
    let endY = pinY;
    switch (direction) {
      case "up":
        endY = pinY + offset;
        break;
      case "down":
        endY = pinY - offset;
        break;
      case "left":
        endX = pinX - offset;
        break;
      case "right":
        endX = pinX + offset;
        break;
      default:
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          `Unknown direction "${direction}"; expected up/down/left/right.`
        );
    }
    return { x: nearestGrid(endX), y: nearestGrid(endY) };
  }
  function defaultDirection(kind) {
    if (["ground", "analog_ground", "protective_ground", "protect_ground"].includes(kind)) return "down";
    if (kind === "power") return "up";
    if (kind === "net_port_in") return "left";
    return "right";
  }
  var ROTATION_CYCLE = ["up", "left", "down", "right"];
  var BODY_ANCHOR_AT_ROT0 = {
    power: "up",
    ground: "down",
    port: "right"
  };
  function deriveBodyRotation() {
    const out = {};
    for (const family of ["power", "ground", "port"]) {
      const anchorIdx = ROTATION_CYCLE.indexOf(BODY_ANCHOR_AT_ROT0[family]);
      const table = {};
      for (const dir of ROTATION_CYCLE) {
        table[dir] = ((ROTATION_CYCLE.indexOf(dir) - anchorIdx) % 4 + 4) % 4 * 90;
      }
      out[family] = table;
    }
    return out;
  }
  var BODY_ROTATION = deriveBodyRotation();
  function flagFamily(kind) {
    if (["ground", "analog_ground", "protective_ground", "protect_ground"].includes(kind)) return "ground";
    if (kind.startsWith("net_port")) return "port";
    return "power";
  }
  function rotationFor(kind, direction) {
    return BODY_ROTATION[flagFamily(kind)][direction];
  }
  var rotationNegates = null;
  async function detectRotationNegation() {
    if (rotationNegates !== null) {
      return rotationNegates;
    }
    try {
      const probe = await eda.sch_PrimitiveComponent.createNetFlag("Power", "__ROTPROBE__", 99e4, 99e4, 90);
      if (!probe) {
        rotationNegates = false;
        return false;
      }
      const pid = probe.getState_PrimitiveId();
      let stored = 90;
      for (const c of await eda.sch_PrimitiveComponent.getAll()) {
        if (c.getState_PrimitiveId() === pid) {
          stored = c.getState_Rotation();
          break;
        }
      }
      await deleteProbeVerified(pid);
      rotationNegates = stored === 270;
    } catch {
      rotationNegates = false;
    }
    return rotationNegates;
  }
  async function deleteProbeVerified(pid) {
    const log = (m) => {
      try {
        eda.sys_Log.add(`[rotprobe] ${m}`);
      } catch {
      }
    };
    const stillThere = async () => {
      for (const c of await eda.sch_PrimitiveComponent.getAll()) {
        if (c.getState_PrimitiveId() === pid) return true;
      }
      return false;
    };
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await eda.sch_PrimitiveComponent.delete([pid]);
      } catch (e) {
        log(`delete attempt ${attempt} threw: ${e}`);
      }
      if (!await stillThere()) {
        if (attempt > 1) log(`probe ${pid} deleted on attempt ${attempt}`);
        return;
      }
      log(`delete reported success but probe ${pid} survived (attempt ${attempt})`);
    }
    log(`probe ${pid} LEAKED after 3 attempts \u2014 clear it with \`sch prim-delete --ids ${pid}\``);
  }
  async function appliedRotation(desired) {
    return await detectRotationNegation() ? ((360 - desired) % 360 + 360) % 360 : desired;
  }
  var CONNECT_PIN_OP_TIMEOUT_MS = 7e3;
  var CONNECT_PIN_HANDLER_BUDGET_MS = 16e3;
  var CONNECT_PIN_REPLY_MARGIN_MS = 500;
  async function settleWithGrace(p, ms, graceMs) {
    const settled = p.then(
      (value) => ({ state: "resolved", value }),
      (error) => ({ state: "rejected", error })
    );
    const wait = (t) => sleep(Math.max(0, t)).then(() => "timeout");
    const first = await Promise.race([settled, wait(ms)]);
    if (first !== "timeout") return first.state === "resolved" ? { ...first, late: false } : first;
    const second = await Promise.race([settled, wait(graceMs)]);
    if (second === "timeout") return { state: "pending" };
    return second.state === "resolved" ? { ...second, late: true } : second;
  }
  var schematicPowerConnectPin = async (payload) => {
    const connectPinDeadline = Date.now() + CONNECT_PIN_HANDLER_BUDGET_MS;
    const pinX = requireNumber(payload, "pinX");
    const pinY = requireNumber(payload, "pinY");
    const kind = requireString(payload, "kind");
    const net = requireString(payload, "net");
    const offset = optionalNumber(payload, "offset") ?? 30;
    const direction = optionalString(payload, "direction") ?? defaultDirection(kind);
    const rotation = optionalNumber(payload, "rotation") ?? rotationFor(kind, direction);
    const applied = kind === NET_LABEL_KIND ? rotation : await appliedRotation(rotation);
    const viaRaw = payload.via;
    let via;
    if (viaRaw !== void 0) {
      if (!Array.isArray(viaRaw) || viaRaw.length !== 2 || !viaRaw.every((v) => typeof v === "number" && Number.isFinite(v))) {
        throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "via must be [x, y] with finite numbers.");
      }
      via = { x: nearestGrid(viaRaw[0]), y: nearestGrid(viaRaw[1]) };
    }
    const startX = via ? via.x : pinX;
    const startY = via ? via.y : pinY;
    const endpoint = connectPinEndpoint(startX, startY, offset, direction);
    const endX = endpoint.x;
    const endY = endpoint.y;
    const pinGX = nearestGrid(pinX);
    const pinGY = nearestGrid(pinY);
    if (via && (via.x !== pinGX && via.y !== pinGY || via.x === pinGX && via.y === pinGY || via.x === endX && via.y === endY)) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `via (${via.x}, ${via.y}) must be a distinct point on the pin's own axis (pin ${pinGX}, ${pinGY}).`
      );
    }
    if (endX === pinGX && endY === pinGY) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `offset must be non-zero (got ${offset}); pin and netflag would overlap.`
      );
    }
    const offGridX = Math.abs(pinX - pinGX) > GRID_EPS;
    const offGridY = Math.abs(pinY - pinGY) > GRID_EPS;
    if (direction === "left" || direction === "right" ? offGridY : offGridX) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `Pin (${pinX}, ${pinY}) sits OFF the ${SCH_GRID}-unit schematic grid on the stub's cross axis \u2014 the snapped endpoint would make the stub diagonal (EasyEDA refuses it) or leave the flag floating. Re-place the part so its anchor lands on the ${SCH_GRID}-grid (sch autolayout does this automatically), then reconnect.`
      );
    }
    let wire;
    let wireErr;
    for (let attempt = 0; attempt < 2 && !wire; attempt++) {
      if (attempt > 0) await sleep(250);
      try {
        wire = await withTimeout(
          eda.sch_PrimitiveWire.create(via ? [pinGX, pinGY, via.x, via.y, endX, endY] : [pinGX, pinGY, endX, endY]),
          CONNECT_PIN_OP_TIMEOUT_MS,
          `Stub-wire create did not settle within ${CONNECT_PIN_OP_TIMEOUT_MS}ms \u2014 the platform dropped the request without rejecting (the stuck-at-99% hang). Failing this attempt so the retry/caller can re-issue instead of hanging until the dispatch timeout.`
        );
        wireErr = void 0;
      } catch (err) {
        wireErr = err;
      }
    }
    if (wireErr) {
      throw edaError(wireErr, `Failed to create pin-stub wire (${pinGX},${pinGY})\u2192(${endX},${endY}) after retry \u2014 check for a primitive already occupying the endpoint.`);
    }
    if (!wire) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Wire creation returned no primitive for (${pinGX},${pinGY})\u2192(${endX},${endY}).`);
    }
    const rollbackWire = async () => {
      try {
        await deleteSchGroup("wires", [wire.getState_PrimitiveId()]);
      } catch {
      }
    };
    let pendingFlag;
    if (kind in NET_FLAG_KINDS) {
      pendingFlag = Promise.resolve(eda.sch_PrimitiveComponent.createNetFlag(NET_FLAG_KINDS[kind], net, endX, endY, applied));
    } else if (kind in NET_PORT_KINDS) {
      pendingFlag = Promise.resolve(eda.sch_PrimitiveComponent.createNetPort(NET_PORT_KINDS[kind], net, endX, endY, applied));
    } else if (kind === NET_LABEL_KIND) {
      try {
        const label = await createVerifiedNetLabel(endX, endY, net, wire.getState_PrimitiveId());
        return { ...label, result: {
          ...label.result,
          wirePrimitiveId: wire.getState_PrimitiveId(),
          flagPrimitiveId: label.result?.primitiveId,
          endPoint: { x: endX, y: endY },
          direction,
          offset,
          rotation,
          appliedRotation: applied
        } };
      } catch (err) {
        await rollbackWire();
        if (err instanceof ActionError) throw err;
        throw edaError(err, "Failed to create net label at wire end (stub wire rolled back).");
      }
    } else {
      await rollbackWire();
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Unknown kind "${kind}"; expected one of: ${[...Object.keys(NET_FLAG_KINDS), "ground", ...Object.keys(NET_PORT_KINDS)].join(", ")}.`
      );
    }
    const flagLabel = kind in NET_FLAG_KINDS ? "Netflag" : "Netport";
    const outcome = await settleWithGrace(
      pendingFlag,
      CONNECT_PIN_OP_TIMEOUT_MS,
      Math.max(0, connectPinDeadline - Date.now() - CONNECT_PIN_REPLY_MARGIN_MS)
    );
    if (outcome.state === "rejected") {
      await rollbackWire();
      if (outcome.error instanceof ActionError) throw outcome.error;
      throw edaError(outcome.error, "Failed to create netflag/netport at wire end (stub wire rolled back).");
    }
    if (outcome.state === "pending") {
      return {
        result: {
          partial: true,
          verified: false,
          pending: "flag-create",
          wirePrimitiveId: wire.getState_PrimitiveId(),
          flagPrimitiveId: null,
          endPoint: { x: endX, y: endY },
          direction,
          offset,
          rotation,
          appliedRotation: applied,
          reason: `${flagLabel} create still pending after ${CONNECT_PIN_OP_TIMEOUT_MS}ms + grace; the stub wire is kept so a late ${flagLabel.toLowerCase()} is not orphaned \u2014 read back this endpoint before any retry.`
        }
      };
    }
    const flag = outcome.value;
    if (!flag) {
      await rollbackWire();
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Failed to create ${kind} (stub wire rolled back).`);
    }
    return {
      result: {
        wirePrimitiveId: wire.getState_PrimitiveId(),
        flagPrimitiveId: flag.getState_PrimitiveId(),
        endPoint: { x: endX, y: endY },
        direction,
        offset,
        rotation,
        appliedRotation: applied,
        ...outcome.late ? { lateSettle: true } : {}
      }
    };
  };
  var schematicPinDisconnect = async (payload) => {
    const deleteContext = await captureSchDeletionContext();
    const designator = optionalString(payload, "designator");
    const pinNumber = optionalString(payload, "pin");
    const flagPrimitiveId = optionalString(payload, "flagPrimitiveId");
    const wirePrimitiveId = optionalString(payload, "wirePrimitiveId");
    const payloadPinX = optionalNumber(payload, "pinX");
    const payloadPinY = optionalNumber(payload, "pinY");
    const hasCoord = payloadPinX !== void 0 && payloadPinY !== void 0;
    if (!flagPrimitiveId && !wirePrimitiveId && !hasCoord && !(designator && pinNumber)) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Provide "designator"+"pin", "pinX"+"pinY", or a "flagPrimitiveId"/"wirePrimitiveId" to disconnect.'
      );
    }
    let components;
    let wires;
    try {
      components = await eda.sch_PrimitiveComponent.getAll();
      wires = await eda.sch_PrimitiveWire.getAll();
    } catch (err) {
      throw edaError(err, "Failed to read schematic primitives.");
    }
    if (!Array.isArray(components) || !Array.isArray(wires)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "disconnect: component/wire inventory unavailable.");
    let observed;
    try {
      observed = collectWireSegments(wires);
    } catch (err) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `disconnect: unknown observed wire geometry; no mutation: ${describeThrown(err)}`);
    }
    let pinX = payloadPinX;
    let pinY = payloadPinY;
    if (!hasCoord && designator && pinNumber) {
      for (const c of components ?? []) {
        if ((c.getState_Designator?.() ?? "") !== designator) continue;
        let pins;
        try {
          pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(c.getState_PrimitiveId());
        } catch {
          continue;
        }
        for (const p of pins ?? []) {
          if (String(p.getState_PinNumber?.() ?? "") === pinNumber) {
            pinX = p.getState_X();
            pinY = p.getState_Y();
          }
        }
      }
      if (pinX === void 0 || pinY === void 0) {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Pin ${designator}:${pinNumber} not found on the current schematic.`
        );
      }
    }
    const TOL = WIRE_CONTACT_EPS;
    const targetAnchors = [];
    if (pinX !== void 0 && pinY !== void 0) targetAnchors.push({ x: pinX, y: pinY });
    if (flagPrimitiveId) {
      const flag = components.find((c) => c.getState_PrimitiveId() === flagPrimitiveId);
      if (flag) targetAnchors.push({ x: flag.getState_X(), y: flag.getState_Y() });
    }
    if (targetAnchors.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "disconnect: target coordinates unavailable.");
    const candidateIds = new Set(observed.filter((s) => s.wirePrimitiveId === wirePrimitiveId || targetAnchors.some((p) => wirePointOnSegment(p, s.seg))).map((s) => s.wirePrimitiveId));
    try {
      assertLegacySimpleWireOperation(observed, candidateIds);
    } catch (err) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `disconnect: refused before mutation: ${describeThrown(err)}`);
    }
    const endpointsOf = (w) => {
      const own2 = observed.filter((s2) => s2.wirePrimitiveId === w.getState_PrimitiveId());
      if (own2.length !== 1) return [];
      const s = own2[0].seg;
      return [[s[0], s[1]], [s[2], s[3]]];
    };
    const stubWires = [];
    const addStub = (pid, ends) => {
      if (!pid) return;
      if (!stubWires.some((s) => s.pid === pid)) stubWires.push({ pid, ends });
    };
    if (wirePrimitiveId) {
      for (const w of wires ?? []) {
        if (String(w.getState_PrimitiveId?.() ?? "") === wirePrimitiveId) {
          addStub(wirePrimitiveId, endpointsOf(w));
        }
      }
    }
    if (stubWires.length === 0 && flagPrimitiveId && (pinX === void 0 || pinY === void 0)) {
      for (const c of components ?? []) {
        if (String(c.getState_PrimitiveId?.() ?? "") === flagPrimitiveId) {
          const fx = c.getState_X();
          const fy = c.getState_Y();
          for (const w of wires ?? []) {
            const ends = endpointsOf(w);
            if (ends.length !== 2) continue;
            const [a, b] = ends;
            const aFlag = Math.hypot(a[0] - fx, a[1] - fy) <= TOL;
            const bFlag = Math.hypot(b[0] - fx, b[1] - fy) <= TOL;
            if (aFlag || bFlag) {
              const pinEnd = aFlag ? b : a;
              if (pinX === void 0 || pinY === void 0) {
                pinX = pinEnd[0];
                pinY = pinEnd[1];
              }
              addStub(String(w.getState_PrimitiveId?.() ?? ""), ends);
            }
          }
        }
      }
    }
    if (stubWires.length === 0 && pinX !== void 0 && pinY !== void 0) {
      for (const w of wires ?? []) {
        const ends = endpointsOf(w);
        if (ends.length !== 2) continue;
        const onPin = ends.some((e) => Math.hypot(e[0] - pinX, e[1] - pinY) <= TOL);
        if (onPin) {
          addStub(String(w.getState_PrimitiveId?.() ?? ""), ends);
        }
      }
    }
    if (stubWires.length === 0) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        "No stub wire found on the target pin \u2014 nothing to disconnect (already clean?)."
      );
    }
    const stubPids = new Set(stubWires.map((s) => s.pid));
    try {
      assertLegacySimpleWireOperation(observed, stubPids);
    } catch (err) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `disconnect: refused before mutation: ${describeThrown(err)}`);
    }
    const wireSegsAll = observed.filter((s) => stubPids.has(s.wirePrimitiveId)).map((s) => s.seg);
    const onWire = (x, y) => wireSegsAll.some((s) => wirePointOnSegment({ x, y }, s));
    const NET_MARKER_TYPES = /* @__PURE__ */ new Set(["netflag", "netport", "netlabel", "short_symbol"]);
    const flagIds = [];
    const alsoDisconnectedPins = [];
    for (const c of components ?? []) {
      let type;
      try {
        type = String(c.getState_ComponentType?.() ?? "");
      } catch (err) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `disconnect: component identity unavailable: ${describeThrown(err)}`);
      }
      if (NET_MARKER_TYPES.has(type)) {
        let cx;
        let cy;
        try {
          cx = c.getState_X();
          cy = c.getState_Y();
        } catch (err) {
          throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `disconnect: marker coordinates unavailable: ${describeThrown(err)}`);
        }
        if (!Number.isFinite(cx) || !Number.isFinite(cy)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "disconnect: marker coordinates unavailable.");
        if (onWire(cx, cy)) flagIds.push(String(c.getState_PrimitiveId?.() ?? ""));
        continue;
      }
      let compPins;
      try {
        compPins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(c.getState_PrimitiveId());
      } catch (err) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `disconnect: pin geometry unavailable: ${describeThrown(err)}`);
      }
      if (!Array.isArray(compPins)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "disconnect: pin inventory unavailable.");
      const cDesig = String(c.getState_Designator?.() ?? "");
      for (const p of compPins ?? []) {
        let px;
        let py;
        try {
          px = p.getState_X();
          py = p.getState_Y();
        } catch (err) {
          throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `disconnect: pin coordinates unavailable: ${describeThrown(err)}`);
        }
        if (!Number.isFinite(px) || !Number.isFinite(py)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "disconnect: pin coordinates unavailable.");
        if (pinX !== void 0 && pinY !== void 0 && Math.hypot(px - pinX, py - pinY) <= TOL) continue;
        if (onWire(px, py)) alsoDisconnectedPins.push(`${cDesig}:${String(p.getState_PinNumber?.() ?? "")}`);
      }
    }
    const wireIds = [...stubPids].filter(Boolean);
    const validFlags = [...new Set(flagIds.filter(Boolean))];
    try {
      await assertSchDeletionContext(deleteContext);
      if (wireIds.length) {
        await deleteSchGroup("wires", wireIds, deleteContext);
      }
      if (validFlags.length) {
        await deleteSchGroup("components", validFlags, deleteContext);
      }
    } catch (err) {
      throw edaError(err, "Failed to delete stub wire / flag.");
    }
    const verification = await verifySchPrimitiveDeletion({ wires: wireIds, components: validFlags }, deleteContext);
    const survivedWireIds = verification.survived.wires ?? [];
    const survivedFlagIds = verification.survived.components ?? [];
    const unverifiedWireIds = verification.unverified.wires ?? [];
    const unverifiedFlagIds = verification.unverified.components ?? [];
    const survivedIds = [...survivedWireIds, ...survivedFlagIds];
    const notApplied = [
      ...survivedWireIds.map((id) => ({ kind: "wire", id })),
      ...survivedFlagIds.map((id) => ({ kind: "flag", id })),
      ...unverifiedWireIds.map((id) => ({ kind: "wire", id })),
      ...unverifiedFlagIds.map((id) => ({ kind: "flag", id }))
    ];
    const fullyApplied = notApplied.length === 0;
    return {
      result: {
        // True only when every targeted primitive is PROVEN gone by re-read.
        disconnected: fullyApplied,
        ...fullyApplied ? {} : { partial: true },
        ...verification.warnings.length ? { verified: false, unverified: verification.unverified, warnings: verification.warnings } : {},
        pin: designator && pinNumber ? `${designator}:${pinNumber}` : void 0,
        at: pinX !== void 0 && pinY !== void 0 ? { x: pinX, y: pinY } : void 0,
        // Only ids verified gone — never the mere delete-call arguments.
        deletedWires: verification.deleted.wires ?? [],
        deletedFlags: verification.deleted.components ?? [],
        // Survivors of the delete call (platform silently kept them): the pin
        // may still be electrically connected. Empty on full success.
        notApplied,
        survivedIds,
        // Non-empty when the deleted wire was a merged tree serving other pins:
        // those pins are now floating and need reconnecting (issue #137).
        alsoDisconnectedPins: [...new Set(alsoDisconnectedPins)]
      },
      ...fullyApplied ? {} : {
        warnings: [
          `disconnect only partially applied: ${survivedIds.length} primitive(s) survived deletion (${survivedIds.join(", ")}) \u2014 the pin may still be connected; verify with the netlist and retry or delete the survivors explicitly.`
        ]
      }
    };
  };
  var documentOpen = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const requestedSplitScreenId = optionalString(payload, "splitScreenId")?.trim() || void 0;
    let splitScreenId = requestedSplitScreenId;
    if (splitScreenId === void 0) {
      try {
        const current = await eda.dmt_SelectControl.getCurrentDocumentInfo();
        if (typeof current?.tabId === "string" && current.tabId.trim()) {
          const split = await eda.dmt_EditorControl.getSplitScreenIdByTabId(current.tabId);
          if (typeof split === "string" && split.trim()) {
            splitScreenId = split;
          }
        }
      } catch {
      }
    }
    let tabId;
    try {
      tabId = splitScreenId === void 0 ? await eda.dmt_EditorControl.openDocument(uuid) : await eda.dmt_EditorControl.openDocument(uuid, splitScreenId);
    } catch (err) {
      throw edaError(err, "Failed to open document.");
    }
    if (tabId === void 0) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Failed to open document "${uuid}".`);
    }
    let ready = false;
    try {
      const doc = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (doc?.uuid === uuid) {
        ready = documentTypeLabel(doc.documentType) === "schematic" ? await waitSchematicPageSettle() : true;
      }
    } catch {
    }
    return { result: { tabId, ready } };
  };
  var documentClose = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const tabId = requireString(payload, "tabId");
    let current;
    try {
      current = await eda.dmt_SelectControl.getCurrentDocumentInfo();
    } catch (err) {
      throw edaError(err, "Failed to verify the active document before close.");
    }
    if (!current || current.uuid !== uuid || current.tabId !== tabId) {
      throw new ActionError(
        ErrorCodes.INVALID_STATE,
        `Refusing to close document: expected active uuid/tabId ${uuid}/${tabId}, got ${current?.uuid ?? "<none>"}/${current?.tabId ?? "<none>"}.`
      );
    }
    let splitScreenId = null;
    try {
      const split = await eda.dmt_EditorControl.getSplitScreenIdByTabId(tabId);
      if (typeof split === "string" && split.trim()) splitScreenId = split.trim();
    } catch {
    }
    let closed;
    try {
      closed = await eda.dmt_EditorControl.closeDocument(tabId);
    } catch (err) {
      throw edaError(err, `Failed to close document "${uuid}".`);
    }
    if (closed !== true) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `Closing document "${uuid}" returned no success.`
      );
    }
    return { result: { closed: true, uuid, tabId, splitScreenId } };
  };
  var pcbDocumentsList = async () => {
    let pcbs;
    try {
      pcbs = await eda.dmt_Pcb.getAllPcbsInfo();
    } catch (err) {
      throw edaError(err, "Failed to list PCB documents.");
    }
    if (!Array.isArray(pcbs)) {
      return { result: { pcbs: [], count: 0 } };
    }
    return {
      result: {
        pcbs: pcbs.map((p) => ({
          uuid: p.uuid,
          name: p.name,
          parentProjectUuid: p.parentProjectUuid
        })),
        count: pcbs.length
      }
    };
  };
  var pcbComponentsList = async (payload) => {
    const layer = payload.layer;
    const includePads = optionalBoolean(payload, "includePads") === true;
    const includeBBox = optionalBoolean(payload, "includeBBox") === true;
    let components;
    try {
      components = await eda.pcb_PrimitiveComponent.getAll(layer);
    } catch (err) {
      throw edaError(err, "Failed to list PCB components.");
    }
    const serialized = [];
    const coverage = {
      pads: { requested: includePads, available: 0, unavailable: 0, notRequested: 0, observed: 0, serialized: 0, failed: 0, geometryAvailable: 0, geometryUnavailable: 0 },
      bbox: { requested: includeBBox, available: 0, unavailable: 0, notRequested: 0 }
    };
    for (const component of components) {
      const record3 = serializePcbComponent(component);
      const componentPrimitiveId = record3.primitiveId;
      const availability = { pads: "not-requested", bbox: "not-requested" };
      const captureErrors = {};
      if (includeBBox) {
        const captured = await captureAsyncPcbValue(
          typeof eda.pcb_Primitive?.getPrimitivesBBox === "function" ? () => eda.pcb_Primitive.getPrimitivesBBox([componentPrimitiveId]) : void 0,
          "getPrimitivesBBox",
          (value) => {
            if (typeof value !== "object" || value === null) return false;
            const box = value;
            return ["minX", "minY", "maxX", "maxY"].every((key) => typeof box[key] === "number" && Number.isFinite(box[key])) && box.minX <= box.maxX && box.minY <= box.maxY;
          }
        );
        availability.bbox = captured.availability;
        if (captured.availability === "available") record3.bbox = captured.value;
        if (captured.error) captureErrors.bbox = captured.error;
      }
      if (includePads) {
        const captured = await captureAsyncPcbValue(
          typeof eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId === "function" ? () => eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(componentPrimitiveId) : void 0,
          "getAllPinsByPrimitiveId",
          Array.isArray
        );
        availability.pads = captured.availability;
        if (captured.error) captureErrors.pads = captured.error;
        if (captured.availability === "available") {
          const pads = captured.value;
          const serializedPads = [];
          const padFailures = [];
          coverage.pads.observed += pads.length;
          for (let index = 0; index < pads.length; index++) {
            const pad = pads[index];
            try {
              const serializedPad = serializePcbPad(pad);
              serializedPads.push(serializedPad);
              coverage.pads.serialized++;
              const geometry = serializedPad.availability;
              if (geometry.shape === "available" && geometry.specialPad === "available") coverage.pads.geometryAvailable++;
              else coverage.pads.geometryUnavailable++;
            } catch (err) {
              const failure = {
                index,
                componentPrimitiveId,
                error: { code: "pad-serialization-failed", message: describeThrown(err) }
              };
              try {
                const id = pad?.getState_PrimitiveId?.();
                if (id !== void 0 && id !== null) failure.primitiveId = id;
              } catch {
              }
              try {
                const number = pad?.getState_PadNumber?.();
                if (number !== void 0 && number !== null) failure.padNumber = number;
              } catch {
              }
              padFailures.push(failure);
              coverage.pads.failed++;
            }
          }
          record3.pads = serializedPads;
          record3.padFailures = padFailures;
          if (padFailures.length > 0) {
            availability.pads = "unavailable";
            captureErrors.pads = { code: "pad-serialization-failed", message: `${padFailures.length} of ${pads.length} pad records could not be serialized.` };
          }
        }
      }
      record3.availability = availability;
      record3.captureErrors = captureErrors;
      for (const field of ["pads", "bbox"]) {
        if (availability[field] === "not-requested") coverage[field].notRequested++;
        else coverage[field][availability[field]]++;
      }
      serialized.push(record3);
    }
    const partial2 = coverage.pads.unavailable > 0 || coverage.bbox.unavailable > 0 || coverage.pads.geometryUnavailable > 0;
    return { result: { components: serialized, count: serialized.length, partial: partial2, incomplete: partial2, coverage } };
  };
  var PCB_LAYER_ALIASES = {
    top: 1,
    topcopper: 1,
    toplayer: 1,
    bottom: 2,
    bottomcopper: 2,
    bottomlayer: 2,
    topsilk: 3,
    topsilkscreen: 3,
    bottomsilk: 4,
    bottomsilkscreen: 4
  };
  function resolveLayerId(spec, layers) {
    if (typeof spec === "number" && Number.isFinite(spec)) return spec;
    if (typeof spec === "string") {
      const raw = spec.trim();
      if (/^\d+$/.test(raw)) return Number(raw);
      const key = raw.toLowerCase().replace(/[\s_-]+/g, "");
      if (key in PCB_LAYER_ALIASES) return PCB_LAYER_ALIASES[key];
      for (const l of layers) {
        if (l.name.toLowerCase().replace(/[\s_-]+/g, "") === key) {
          return l.id;
        }
      }
    }
    throw new ActionError(
      ErrorCodes.MISSING_PAYLOAD_FIELD,
      `could not resolve layer "${String(spec)}" \u2014 pass a numeric id, top|bottom, or a layer name from pcb.layers.list`
    );
  }
  var pcbLayersList = async () => {
    try {
      const cur = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (cur?.tabId) await eda.dmt_EditorControl.activateDocument(cur.tabId);
    } catch {
    }
    let layers;
    try {
      layers = await eda.pcb_Layer.getAllLayers();
    } catch (err) {
      throw edaError(err, "Failed to list PCB layers.");
    }
    let currentLayer = null;
    try {
      currentLayer = eda.pcb_Layer.getCurrentLayer() ?? null;
    } catch {
    }
    let copperLayerCount = null;
    try {
      copperLayerCount = await eda.pcb_Layer.getTheNumberOfCopperLayers();
    } catch {
    }
    let visibleLayers = null;
    if (currentLayer == null && Array.isArray(layers)) {
      visibleLayers = layers.filter(
        (l) => l.layerStatus === 1
        /* EPCB_LayerStatus.SHOW */
      ).map((l) => ({ id: l.id, name: l.name }));
    }
    return { result: { layers, currentLayer, visibleLayers, copperLayerCount, count: layers.length } };
  };
  var pcbLayerSetCurrent = async (payload) => {
    const layers = await eda.pcb_Layer.getAllLayers();
    const id = resolveLayerId(payload.layer, layers);
    let ok;
    try {
      ok = await eda.pcb_Layer.selectLayer(id);
    } catch (err) {
      throw edaError(err, `Failed to select layer ${id}.`);
    }
    let currentLayer = null;
    try {
      currentLayer = eda.pcb_Layer.getCurrentLayer() ?? null;
    } catch {
    }
    await waitForCanvasSettle();
    return { result: { ok, requested: payload.layer ?? null, layer: id, currentLayer } };
  };
  var VISIBILITY_PRESETS = {
    "top-only": [1, 3],
    "bottom-only": [2, 4],
    "copper-only": [1, 2],
    "silk-only": [3, 4]
  };
  var pcbLayerVisibility = async (payload) => {
    const layers = await eda.pcb_Layer.getAllLayers();
    const preset = optionalString(payload, "preset");
    const shown = [];
    const hidden = [];
    if (preset) {
      const key = preset.trim().toLowerCase();
      const ids = VISIBILITY_PRESETS[key];
      if (!ids) {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          `unknown preset "${preset}" \u2014 use top-only|bottom-only|copper-only|silk-only, or show/hide`
        );
      }
      try {
        await eda.pcb_Layer.setLayerVisible(ids, true);
      } catch (err) {
        throw edaError(err, `Failed to apply visibility preset "${preset}".`);
      }
      shown.push(...ids);
    } else {
      const show = Array.isArray(payload.show) ? payload.show : [];
      const hide = Array.isArray(payload.hide) ? payload.hide : [];
      if (show.length === 0 && hide.length === 0) {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          "nothing to do \u2014 pass preset, or show[] / hide[] layer specs"
        );
      }
      const exclusive = optionalBoolean(payload, "exclusive") === true;
      if (show.length > 0) {
        const ids = show.map((s) => resolveLayerId(s, layers));
        try {
          await eda.pcb_Layer.setLayerVisible(ids, exclusive);
        } catch (err) {
          throw edaError(err, "Failed to show layers.");
        }
        shown.push(...ids);
      }
      if (hide.length > 0) {
        const ids = hide.map((s) => resolveLayerId(s, layers));
        try {
          await eda.pcb_Layer.setLayerInvisible(ids, false);
        } catch (err) {
          throw edaError(err, "Failed to hide layers.");
        }
        hidden.push(...ids);
      }
    }
    await waitForCanvasSettle();
    const after = await eda.pcb_Layer.getAllLayers();
    return { result: { preset: preset ?? null, shown, hidden, layers: after } };
  };
  var pcbViewSide = async (payload) => {
    const side = (optionalString(payload, "side") ?? "").trim().toLowerCase();
    if (side !== "top" && side !== "bottom") {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'side must be "top" or "bottom"');
    }
    const copperId = side === "top" ? 1 : 2;
    const focusIds = side === "top" ? [1, 3] : [2, 4];
    try {
      const cur = await eda.dmt_SelectControl.getCurrentDocumentInfo();
      if (cur?.tabId) await eda.dmt_EditorControl.activateDocument(cur.tabId);
    } catch {
    }
    try {
      await eda.pcb_Layer.selectLayer(copperId);
    } catch (err) {
      throw edaError(err, `Failed to select ${side} copper layer.`);
    }
    try {
      await eda.pcb_Layer.setLayerVisible(focusIds, true);
    } catch (err) {
      throw edaError(err, `Failed to focus ${side}-side layers.`);
    }
    await waitForCanvasSettle();
    let currentLayer = null;
    try {
      currentLayer = eda.pcb_Layer.getCurrentLayer() ?? null;
    } catch {
    }
    return {
      result: {
        side,
        currentLayer,
        focusedLayers: focusIds,
        note: "Layer-focus approximation (no native canvas flip API). Take pcb.snapshot next; thread its sha256 back as previousSha256 to defeat a stale frame."
      }
    };
  };
  var STACKUP_LAYER_TYPE = {
    signal: "SIGNAL",
    plane: "PLANE",
    "internal-electrical": "PLANE",
    "internal": "PLANE",
    power: "PLANE",
    ground: "PLANE",
    gnd: "PLANE"
  };
  var pcbStackupSet = async (payload) => {
    const count = optionalNumber(payload, "count");
    const beforeLayers = await eda.pcb_Layer.getAllLayers();
    const beforeCount = await eda.pcb_Layer.getTheNumberOfCopperLayers();
    let setCount = null;
    if (count != null) {
      const allowed = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32];
      if (!allowed.includes(count)) {
        throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `count must be an even number 2..32, got ${count}`);
      }
      try {
        if (beforeCount !== count) {
          setCount = await eda.pcb_Layer.setTheNumberOfCopperLayers(count);
        }
      } catch (err) {
        throw edaError(err, `Failed to set copper layer count to ${count}.`);
      }
    }
    const modified = [];
    const layers = payload.layers;
    if (Array.isArray(layers)) {
      for (const spec of layers) {
        if (!spec || typeof spec !== "object") {
          continue;
        }
        const s = spec;
        const id = s.id ?? s.layer;
        if (typeof id !== "number") {
          throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "each layers[] entry needs a numeric id/layer");
        }
        const prop = {};
        if (typeof s.type === "string") {
          const mapped = STACKUP_LAYER_TYPE[s.type.trim().toLowerCase()];
          if (!mapped) {
            throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `layer type must be signal|plane, got "${String(s.type)}"`);
          }
          prop.type = mapped;
        }
        if (typeof s.name === "string") {
          prop.name = s.name;
        }
        const before = beforeLayers.find((layer) => Number(layer.id) === id);
        const alreadyMatches = (!prop.type || before?.type === prop.type) && (!prop.name || before?.name === prop.name);
        let written = null;
        try {
          if (!alreadyMatches) {
            written = await eda.pcb_Layer.modifyLayer(id, prop);
          }
        } catch (err) {
          throw edaError(err, `Failed to modify layer ${id} (only inner layers accept a type change).`);
        }
        modified.push({ layer: id, before: before ?? null, written, ...prop });
      }
    }
    const allLayers = await eda.pcb_Layer.getAllLayers();
    const copperLayerCount = await eda.pcb_Layer.getTheNumberOfCopperLayers();
    const countVerified = count == null || copperLayerCount === count;
    for (const item of modified) {
      const actual = allLayers.find((layer) => Number(layer.id) === item.layer) ?? null;
      item.actual = actual;
      item.verified = !!actual && (item.type == null || actual.type === item.type) && (item.name == null || actual.name === item.name);
      item.changed = !!actual && !!item.before && (actual.type !== item.before.type || actual.name !== item.before.name);
    }
    const layersVerified = modified.every((item) => item.verified === true);
    const verified = countVerified && layersVerified;
    const changed = copperLayerCount !== beforeCount || modified.some((item) => item.changed === true);
    const partial2 = changed && !verified;
    return {
      result: {
        before: { copperLayerCount: beforeCount, layers: beforeLayers },
        requested: { ...count == null ? {} : { copperLayerCount: count }, ...Array.isArray(layers) ? { layers } : {} },
        copperLayerCount,
        setCount,
        modified,
        layers: allLayers,
        countVerified,
        layersVerified,
        changed,
        verified,
        partial: partial2
      },
      ...verified ? {} : { warnings: ["PCB stackup was not fully applied; inspect each layer written/actual field before continuing."] }
    };
  };
  function silkOverlap(a, b, m) {
    return a.minX < b.maxX + m && a.maxX > b.minX - m && a.minY < b.maxY + m && a.maxY > b.minY - m;
  }
  var silkCenter = (r) => ({ x: (r.minX + r.maxX) / 2, y: (r.minY + r.maxY) / 2 });
  var silkInflate = (r, m) => ({ minX: r.minX - m, minY: r.minY - m, maxX: r.maxX + m, maxY: r.maxY + m });
  var silkRectGap = (a, b) => {
    const dx = Math.max(0, a.minX - b.maxX, b.minX - a.maxX), dy = Math.max(0, a.minY - b.maxY, b.minY - a.maxY);
    return Math.hypot(dx, dy);
  };
  var silkLabelOwnedBy = (L, own2, ownerId, obstacles) => {
    const mine = silkRectGap(L, own2);
    return obstacles.every((o) => o.kind !== "BODY" || o.owner === ownerId || silkRectGap(L, o.rect) > mine);
  };
  var silkInside = (inner, outer) => inner.minX >= outer.minX && inner.minY >= outer.minY && inner.maxX <= outer.maxX && inner.maxY <= outer.maxY;
  function silkInventory(value, name2) {
    if (!Array.isArray(value)) throw new Error(`Unreadable ${name2} inventory`);
    return value;
  }
  async function boardOutlineIds(strict = false) {
    const ids = [];
    const inventory = (value, name2) => strict ? silkInventory(value, name2) : value ?? [];
    const layer = (value) => {
      if (strict && (typeof value !== "number" || !Number.isFinite(value))) throw new Error("Outline primitive layer unavailable");
      return Number(value);
    };
    for (const l of inventory(await eda.pcb_PrimitiveLine.getAll(), "outline lines")) if (layer(l.getState_Layer()) === 11) ids.push(l.getState_PrimitiveId());
    for (const a of inventory(await eda.pcb_PrimitiveArc.getAll(), "outline arcs")) if (layer(a.getState_Layer()) === 11) ids.push(a.getState_PrimitiveId());
    try {
      for (const p of inventory(await eda.pcb_PrimitivePolyline.getAll(), "outline polylines")) if (layer(p.getState_Layer()) === 11) ids.push(p.getState_PrimitiveId());
    } catch (err) {
      if (strict) throw err;
    }
    return ids;
  }
  function silkCorridor(cb, dx, dy, obs, self2, perp, MAX_SCAN) {
    const c = silkCenter(cb);
    let best = MAX_SCAN;
    for (const o of obs) {
      if (o.owner === self2) continue;
      if (o.kind !== "BODY" && o.kind !== "PAD") continue;
      if (dx !== 0) {
        if (o.rect.maxY < c.y - perp / 2 || o.rect.minY > c.y + perp / 2) continue;
        const gap = dx > 0 ? o.rect.minX - cb.maxX : cb.minX - o.rect.maxX;
        if (gap >= 0 && gap < best) best = gap;
      } else {
        if (o.rect.maxX < c.x - perp / 2 || o.rect.minX > c.x + perp / 2) continue;
        const gap = dy > 0 ? o.rect.minY - cb.maxY : cb.minY - o.rect.maxY;
        if (gap >= 0 && gap < best) best = gap;
      }
    }
    return best;
  }
  var pcbSilkAlign = async (payload) => {
    for (const key of ["offset", "spacing"]) if (payload[key] !== void 0 && typeof payload[key] !== "number") throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${key} must be a number`);
    if (payload.side !== void 0 && typeof payload.side !== "string") throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "side must be a string");
    const side = (optionalString(payload, "side") ?? "").toLowerCase();
    const refs = optionalStringArray(payload, "refs") ?? null;
    if (refs && (!refs.length || refs.some((ref) => !ref.trim()))) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "refs must contain nonempty designators");
    const spacing = optionalNumber(payload, "spacing") ?? 1.5;
    const offset = optionalNumber(payload, "offset") ?? 15;
    if (!Number.isFinite(spacing) || spacing <= 0 || !Number.isFinite(offset) || offset < 0 || side && !["top", "bottom", "left", "right"].includes(side)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Invalid silk placement offset, spacing or side.");
    const baseOffset = offset * spacing;
    if (!Number.isFinite(baseOffset)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Silk offset \xD7 spacing is not finite.");
    const Cpad = 12, Cedge = 15, Cregion = 6, Clabel = 6, Cbody = 6, HALO = 2, Cassembly = 10;
    const STEP = 22, R_MAX = 6, MAX_SCAN = 200, GAP_CAP = 120;
    let comps = silkInventory(await eda.pcb_PrimitiveComponent.getAll(), "components");
    const componentIdentity = (c) => JSON.stringify([c.getState_PrimitiveId(), c.getState_Designator(), c.getState_Layer()]);
    const initialIdentities = comps.map(componentIdentity).sort();
    const items = [];
    const skipped = [];
    const unresolved = [];
    const details = [];
    const normalization = [];
    const appliedIds = [];
    const verification = [];
    const finish = (verified) => ({ result: {
      aligned: details.filter((d) => d.ok === true).length,
      warned: 0,
      unresolved: unresolved.length,
      skipped: skipped.length,
      verified,
      partial: !verified && (appliedIds.length > 0 || normalization.length > 0),
      details,
      unresolvedDetails: unresolved,
      skippedDetails: skipped,
      normalization,
      appliedIds,
      verification,
      geometryScope: "rendered component envelopes, measured pads and text; outline bounding-box containment"
    } });
    const bbox1 = async (id) => {
      const b = await eda.pcb_Primitive.getPrimitivesBBox([id]);
      if (!validSilkRect(b)) throw new Error(`Missing or invalid rendered bbox: ${id}`);
      return { minX: b.minX, minY: b.minY, maxX: b.maxX, maxY: b.maxY };
    };
    let safeArea = null;
    let OBS = [];
    const BODY = {};
    const LAB = {};
    const onSilk = (layer) => layer === 3 || layer === 4;
    const textVisible = (a) => {
      const key = a.getState_KeyVisible?.(), value = a.getState_ValueVisible?.();
      if (typeof key !== "boolean" || typeof value !== "boolean") throw new Error("Text visibility unavailable");
      return key || value;
    };
    const readPose = (a) => {
      const x = a.getState_X(), y = a.getState_Y(), layer = a.getState_Layer(), rotation = a.getState_Rotation(), mirror = a.getState_Mirror(), reverse = a.getState_Reverse();
      if (typeof x !== "number" || !Number.isFinite(x) || typeof y !== "number" || !Number.isFinite(y) || typeof layer !== "number" || !Number.isFinite(layer) || typeof rotation !== "number" || !Number.isFinite(rotation) || typeof mirror !== "boolean" || typeof reverse !== "boolean") throw new Error("Designator pose fields unavailable");
      return { x, y, layer, rotation, mirror, reverse };
    };
    const readLayer = (value) => {
      if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Obstacle layer unavailable");
      return value;
    };
    const assertSelectedIdentity = (a, cid, desig, attrId) => {
      if (!attrId || a.getState_PrimitiveId() !== attrId || a.getState_ParentPrimitiveId() !== cid || a.getState_Value() !== desig) throw new Error(`Designator identity mismatch: ${desig}`);
      if (!textVisible(a) || a.getState_ValueVisible() !== true) throw new Error(`Designator visibility not verified: ${desig}`);
    };
    const readSelected = async (it) => {
      const a = await eda.pcb_PrimitiveAttribute.get(it.attrId);
      if (!a) throw new Error(`Designator disappeared: ${it.desig}`);
      assertSelectedIdentity(a, it.cid, it.desig, it.attrId);
      const pose = readPose(a);
      return { a, pose };
    };
    const readObstacles = async () => {
      const obs = [];
      comps = silkInventory(await eda.pcb_PrimitiveComponent.getAll(), "fresh components");
      if (JSON.stringify(comps.map(componentIdentity).sort()) !== JSON.stringify(initialIdentities)) throw new Error("Component identity/side inventory changed during silk alignment");
      const ids = await boardOutlineIds(true);
      if (!ids.length) throw new Error("Board outline bbox unavailable; cannot verify placement bounds.");
      const outline = await eda.pcb_Primitive.getPrimitivesBBox(ids);
      if (!validSilkRect(outline) || !validSilkRect(silkInflate(outline, -Cedge))) throw new Error("Invalid board outline bbox.");
      safeArea = silkInflate(outline, -Cedge);
      for (const c of comps) {
        const cid = c.getState_PrimitiveId(), componentLayer = readLayer(c.getState_Layer());
        if (componentLayer !== 1 && componentLayer !== 2) throw new Error(`Unknown component side: ${cid}`);
        const body = await bbox1(cid);
        BODY[cid] = body;
        obs.push({ rect: body, kind: "BODY", owner: cid, m: Cbody, layer: componentLayer === 2 ? 4 : 3 });
        for (const pad of silkInventory(await eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(cid), `pads of ${cid}`)) {
          const padLayer = readLayer(pad.getState_Layer());
          if (![1, 2, 12].includes(padLayer)) throw new Error(`Unknown pad layer: ${pad.getState_PrimitiveId()}`);
          obs.push({
            rect: silkInflate(await bbox1(pad.getState_PrimitiveId()), Cpad),
            kind: "PAD",
            owner: cid,
            m: 0,
            ...padLayer === 12 ? {} : { layer: padLayer === 2 ? 4 : 3 }
          });
        }
      }
      for (const region of silkInventory(await eda.pcb_PrimitiveRegion.getAll(), "regions")) {
        const layer = readLayer(region.getState_Layer());
        if (layer !== 1 && layer !== 2 && layer !== 12 && layer !== 3 && layer !== 4) continue;
        const rules = region.getState_RuleType();
        if (!Array.isArray(rules) || !rules.every((rule) => [2, 5, 6, 7, 8, 9].includes(rule))) throw new Error("Region rules unavailable or unsupported");
        obs.push({
          rect: await bbox1(region.getState_PrimitiveId()),
          kind: rules.includes(2) ? "REGION_H" : "REGION_S",
          owner: region.getState_PrimitiveId(),
          m: Cregion,
          ...layer === 12 ? {} : { layer: layer === 2 || layer === 4 ? 4 : 3 }
        });
      }
      for (const text2 of silkInventory(await eda.pcb_PrimitiveString.getAll(), "strings")) {
        const layer = readLayer(text2.getState_Layer());
        if (onSilk(layer)) obs.push({ rect: await bbox1(text2.getState_PrimitiveId()), kind: "FROZEN", owner: text2.getState_PrimitiveId(), m: Clabel, layer });
      }
      const selected = new Set(items.map((it) => it.attrId));
      for (const attr of silkInventory(await eda.pcb_PrimitiveAttribute.getAll(), "attributes")) {
        const layer = readLayer(attr.getState_Layer());
        if (!selected.has(attr.getState_PrimitiveId()) && onSilk(layer) && textVisible(attr)) {
          obs.push({ rect: await bbox1(attr.getState_PrimitiveId()), kind: "FROZEN", owner: attr.getState_PrimitiveId(), m: Clabel, layer });
        }
      }
      return obs;
    };
    const measure = async (it, expected) => {
      const { pose } = await readSelected(it), { x, y } = pose;
      if (pose.layer !== it.targetLayer || pose.mirror !== it.targetMirror || pose.rotation !== 0 || pose.reverse) throw new Error(`Designator pose not verified: ${it.desig}`);
      if (expected && (Math.abs(x - expected.x) > 1e-6 || Math.abs(y - expected.y) > 1e-6)) throw new Error(`Designator anchor mismatch: ${it.desig}`);
      const b = await bbox1(it.attrId), bc = silkCenter(b);
      it.w = b.maxX - b.minX;
      it.h = b.maxY - b.minY;
      it.offx = bc.x - x;
      it.offy = bc.y - y;
      LAB[it.attrId] = { rect: silkInflate(b, HALO), layer: it.targetLayer };
      return b;
    };
    try {
      for (const c of comps) {
        const cid = c.getState_PrimitiveId(), desig = c.getState_Designator?.() ?? "";
        if (!desig || refs && !refs.includes(desig)) continue;
        const attrs = silkInventory(await eda.pcb_PrimitiveAttribute.getAll(cid), `attributes of ${cid}`);
        const matches = attrs.filter((a2) => String(a2.getState_Key?.() ?? "").toLowerCase().includes("desig"));
        const matchingValue = attrs.filter((a2) => a2.getState_Value?.() === desig);
        const a = matches.length === 1 ? matches[0] : matches.length === 0 && matchingValue.length === 1 ? matchingValue[0] : null;
        if (!a || !textVisible(a)) {
          skipped.push({ designator: desig, reason: "Designator identity ambiguous, missing or hidden" });
          continue;
        }
        if (typeof a.getState_PrimitiveId() !== "string") throw new Error(`Designator ID unavailable: ${desig}`);
        assertSelectedIdentity(a, cid, desig, a.getState_PrimitiveId());
        readPose(a);
        const layer = Number(c.getState_Layer()), b = await bbox1(a.getState_PrimitiveId());
        items.push({
          cid,
          desig,
          attrId: a.getState_PrimitiveId(),
          cb: await bbox1(cid),
          w: b.maxX - b.minX,
          h: b.maxY - b.minY,
          offx: 0,
          offy: 0,
          layer,
          targetLayer: layer === 2 ? 4 : 3,
          targetMirror: layer === 2
        });
      }
      if (refs) {
        for (const ref of new Set(refs)) if (!items.some((it) => it.desig === ref)) skipped.push({ designator: ref, reason: "Requested designator not uniquely readable" });
      }
      for (const it of items) if (items.filter((other) => other.desig === it.desig).length !== 1) skipped.push({ designator: it.desig, reason: "Duplicate designator identity" });
      if (!items.length || skipped.length) return finish(false);
      OBS = await readObstacles();
      for (const it of items) {
        const { pose } = await readSelected(it);
        if (pose.rotation !== 0 || pose.layer !== it.targetLayer || pose.mirror !== it.targetMirror || pose.reverse) {
          const entry = { designator: it.desig, primitiveId: it.attrId, requested: { rotation: 0, layer: it.targetLayer, mirror: it.targetMirror, reverse: false }, ok: false };
          normalization.push(entry);
          const result = await eda.pcb_PrimitiveAttribute.modify(it.attrId, entry.requested);
          if (!result) throw new Error(`Normalization returned no object: ${it.desig}`);
          await measure(it);
          entry.ok = true;
        } else await measure(it);
      }
      OBS = await readObstacles();
      for (const it of items) it.cb = BODY[it.cid];
    } catch (err) {
      skipped.push({ reason: String(err), phase: "preflight-or-normalization" });
      return finish(false);
    }
    const boardCenter = safeArea ? silkCenter(safeArea) : null;
    const N = [0, 1], S = [0, -1], E = [1, 0], W = [-1, 0];
    const diags = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    const prefBase = { "0,1": 1, "0,-1": 0.85, "1,0": 0.6, "-1,0": 0.6 };
    const sideDir = side === "bottom" ? S : side === "left" ? W : side === "right" ? E : side === "top" ? N : null;
    for (const it of items) {
      let free = 0;
      for (const [dx, dy] of [N, S, E, W]) {
        const perp = dx !== 0 ? it.h + 2 * Cbody : it.w + 2 * Cbody;
        if (silkCorridor(it.cb, dx, dy, OBS, it.cid, perp, MAX_SCAN) >= it.h + baseOffset) free++;
      }
      it.free = free;
    }
    const edgeProx = (it) => safeArea ? Math.min(
      silkCenter(it.cb).x - safeArea.minX,
      safeArea.maxX - silkCenter(it.cb).x,
      silkCenter(it.cb).y - safeArea.minY,
      safeArea.maxY - silkCenter(it.cb).y
    ) : 1e9;
    items.sort((p, q) => {
      const fp = p.free, fq = q.free;
      if (fp !== fq) return fp - fq;
      const ep = edgeProx(p), eq = edgeProx(q);
      if (Math.abs(ep - eq) > 1) return ep - eq;
      const ap = (p.cb.maxX - p.cb.minX) * (p.cb.maxY - p.cb.minY), aq = (q.cb.maxX - q.cb.minX) * (q.cb.maxY - q.cb.minY);
      if (ap !== aq) return aq - ap;
      return p.desig < q.desig ? -1 : 1;
    });
    const rankSides = (it) => {
      const cc = silkCenter(it.cb);
      let near = null, nd = Infinity;
      for (const o of OBS) {
        if (o.kind !== "BODY" || o.owner === it.cid) continue;
        const oc = silkCenter(o.rect);
        const d = Math.hypot(oc.x - cc.x, oc.y - cc.y);
        if (d < nd) {
          nd = d;
          near = o.rect;
        }
      }
      const crowdVertical = near ? Math.abs(silkCenter(near).y - cc.y) >= Math.abs(silkCenter(near).x - cc.x) : false;
      let u = 0.5, v = 0.5;
      if (safeArea) {
        u = (cc.x - safeArea.minX) / Math.max(1, safeArea.maxX - safeArea.minX);
        v = (cc.y - safeArea.minY) / Math.max(1, safeArea.maxY - safeArea.minY);
      }
      const edgeness = Math.max(0, Math.min(1, 2 * Math.max(Math.abs(u - 0.5), Math.abs(v - 0.5))));
      const toCenter = boardCenter ? { x: boardCenter.x - cc.x, y: boardCenter.y - cc.y } : { x: 0, y: 0 };
      const tcLen = Math.hypot(toCenter.x, toCenter.y) || 1;
      const scored = [N, S, E, W].map(([dx, dy]) => {
        const perp = dx !== 0 ? it.h + 2 * Cbody : it.w + 2 * Cbody;
        const clr = silkCorridor(it.cb, dx, dy, OBS, it.cid, perp, MAX_SCAN);
        const Pfree = Math.min(clr, GAP_CAP) / GAP_CAP;
        const Ppos = ((dx * toCenter.x + dy * toCenter.y) / tcLen + 1) / 2;
        const Pref = sideDir && sideDir[0] === dx && sideDir[1] === dy ? 1 : prefBase[`${dx},${dy}`] ?? 0.3;
        const crowdBonus = crowdVertical && dx !== 0 || !crowdVertical && dy !== 0 ? 1 : 0;
        let off = false;
        if (safeArea) {
          const lx = cc.x + dx * ((it.cb.maxX - it.cb.minX) / 2 + baseOffset + it.w / 2);
          const ly = cc.y + dy * ((it.cb.maxY - it.cb.minY) / 2 + baseOffset + it.h / 2);
          off = !silkInside({ minX: lx - it.w / 2, minY: ly - it.h / 2, maxX: lx + it.w / 2, maxY: ly + it.h / 2 }, safeArea);
        }
        const requested = sideDir && sideDir[0] === dx && sideDir[1] === dy ? 1 : 0;
        const score = off ? -Infinity : 0.5 * Pfree + 0.35 * edgeness * Ppos + 0.15 * Pref + 0.2 * crowdBonus + requested;
        return { dir: [dx, dy], score };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored.map((s) => s.dir).concat(diags);
    };
    const evaluate = (L, it, rank) => {
      const facts = silkSlotFacts(L, it.cid, it.attrId, it.targetLayer, OBS, LAB, safeArea, Clabel);
      return { ...facts, cost: 100 * facts.softRegions + rank * 25 - 25 * Math.min(facts.minClearance, 30) / 30 };
    };
    const plans = [];
    for (const it of items) {
      const cc = silkCenter(it.cb), cbP = silkInflate(it.cb, Cassembly);
      const hw = (cbP.maxX - cbP.minX) / 2, hh = (cbP.maxY - cbP.minY) / 2, pref = rankSides(it);
      let best = null;
      for (let ring = 0; ring < R_MAX && !best; ring++) {
        const d = baseOffset + ring * STEP;
        for (let i = 0; i < pref.length; i++) {
          const [dx, dy] = pref[i], lx = cc.x + dx * (hw + d + it.w / 2), ly = cc.y + dy * (hh + d + it.h / 2);
          const L = silkInflate({ minX: lx - it.w / 2, minY: ly - it.h / 2, maxX: lx + it.w / 2, maxY: ly + it.h / 2 }, HALO);
          const facts = evaluate(L, it, i < 4 ? i : 3);
          if (facts.clean && silkLabelOwnedBy(L, it.cb, it.cid, OBS) && (!best || facts.cost < best.cost)) best = { it, lx, ly, L, cost: facts.cost, x: lx - it.offx, y: ly - it.offy };
        }
      }
      if (!best) unresolved.push({ designator: it.desig, primitiveId: it.attrId, reason: "No collision-free slot within search range that sits closer to its own part than to any other part" });
      else {
        plans.push(best);
        LAB[it.attrId] = { rect: best.L, layer: it.targetLayer };
      }
    }
    if (unresolved.length) return finish(false);
    for (const plan of plans) {
      const { it, x, y } = plan;
      try {
        const { pose } = await readSelected(it);
        if (pose.layer !== it.targetLayer || pose.mirror !== it.targetMirror || pose.rotation !== 0 || pose.reverse) throw new Error("Designator pose changed before position write");
        appliedIds.push(it.attrId);
        const r = await eda.pcb_PrimitiveAttribute.modify(it.attrId, { x, y, rotation: 0, layer: it.targetLayer, mirror: it.targetMirror, reverse: false });
        if (!r) throw new Error("modify returned no object");
        details.push({ designator: it.desig, primitiveId: it.attrId, x, y, clean: false, ok: true });
      } catch (err) {
        skipped.push({ designator: it.desig, primitiveId: it.attrId, reason: String(err), phase: "position-write" });
        break;
      }
    }
    try {
      OBS = await readObstacles();
      const actual = /* @__PURE__ */ new Map();
      for (const plan of plans) actual.set(plan.it.attrId, await measure(plan.it, { x: plan.x, y: plan.y }));
      for (const plan of plans) {
        const it = plan.it, bbox = actual.get(it.attrId);
        const facts = evaluate(silkInflate(bbox, HALO), it, 0);
        verification.push({ designator: it.desig, primitiveId: it.attrId, bbox, clean: facts.clean, conflicts: facts.conflicts });
        const detail = details.find((d) => d.primitiveId === it.attrId);
        if (detail) detail.clean = facts.clean;
      }
    } catch (err) {
      skipped.push({ reason: String(err), phase: "fresh-verification" });
    }
    return finish(skipped.length === 0 && details.length === items.length && verification.length === items.length && verification.every((v) => v.clean === true));
  };
  var PCB_TOP_SILK = 3;
  var PCB_BOTTOM_SILK = 4;
  function pcbSilkLineWidth(primitive) {
    if (typeof primitive.getState_LineWidth !== "function") {
      return { lineWidthAvailability: "unknown", lineWidthError: "missing-getter" };
    }
    try {
      const width = primitive.getState_LineWidth();
      if (typeof width !== "number" || !Number.isFinite(width) || width < 0) {
        return { lineWidthAvailability: "unknown", lineWidthSource: "getState_LineWidth", lineWidthError: "invalid-result" };
      }
      return { lineWidth: width, lineWidthAvailability: "available", lineWidthSource: "getState_LineWidth" };
    } catch (err) {
      return { lineWidthAvailability: "unknown", lineWidthSource: "getState_LineWidth", lineWidthError: err instanceof Error ? err.message : String(err) };
    }
  }
  function pcbSilkAttributeVisibility(primitive) {
    const result = {};
    for (const [field, getter, prefix] of [
      ["valueVisible", "getState_ValueVisible", "visibility"],
      ["keyVisible", "getState_KeyVisible", "keyVisibility"]
    ]) {
      if (typeof primitive[getter] !== "function") {
        result[`${prefix}Availability`] = "unknown";
        result[`${prefix}Error`] = "missing-getter";
        continue;
      }
      result[`${prefix}Source`] = getter;
      try {
        const value = primitive[getter]();
        if (typeof value !== "boolean") {
          result[`${prefix}Availability`] = "unknown";
          result[`${prefix}Error`] = "invalid-result";
          continue;
        }
        result[field] = value;
        if (field === "valueVisible") result.visible = value;
        result[`${prefix}Availability`] = "available";
      } catch (err) {
        result[`${prefix}Availability`] = "unknown";
        result[`${prefix}Error`] = err instanceof Error ? err.message : String(err);
      }
    }
    return result;
  }
  var pcbSilkList = async () => {
    const isSilk = (l) => l === PCB_TOP_SILK || l === PCB_BOTTOM_SILK;
    const compLayer = /* @__PURE__ */ new Map();
    try {
      for (const c of await eda.pcb_PrimitiveComponent.getAll() ?? []) {
        compLayer.set(c.getState_PrimitiveId(), Number(c.getState_Layer()));
      }
    } catch (err) {
      throw edaError(err, "Failed to list components for silk-list.");
    }
    const texts = [];
    const silkBBox = async (id) => {
      try {
        const b = await eda.pcb_Primitive.getPrimitivesBBox([id]);
        return b ? { minX: b.minX, minY: b.minY, maxX: b.maxX, maxY: b.maxY } : null;
      } catch {
        return null;
      }
    };
    try {
      for (const a of await eda.pcb_PrimitiveAttribute.getAll() ?? []) {
        const layer = Number(a.getState_Layer());
        if (!isSilk(layer)) {
          continue;
        }
        const pid = a.getState_ParentPrimitiveId?.() ?? "";
        texts.push({
          primitiveId: a.getState_PrimitiveId(),
          ...pcbSilkLineWidth(a),
          ...pcbSilkAttributeVisibility(a),
          bbox: await silkBBox(a.getState_PrimitiveId()),
          kind: "attribute",
          text: a.getState_Value?.() ?? "",
          key: a.getState_Key?.() ?? "",
          layer,
          mirror: !!a.getState_Mirror?.(),
          reverse: !!a.getState_Reverse?.(),
          rotation: Number(a.getState_Rotation?.() ?? 0),
          fontFamily: a.getState_FontFamily?.() ?? "",
          fontSize: Number(a.getState_FontSize?.() ?? 0) || 0,
          componentId: pid,
          componentLayer: compLayer.get(pid) ?? 0,
          x: a.getState_X() ?? 0,
          y: a.getState_Y() ?? 0
        });
      }
    } catch (err) {
      throw edaError(err, "Failed to enumerate silkscreen attributes.");
    }
    try {
      for (const s of await eda.pcb_PrimitiveString.getAll() ?? []) {
        const layer = Number(s.getState_Layer());
        if (!isSilk(layer)) {
          continue;
        }
        texts.push({
          primitiveId: s.getState_PrimitiveId(),
          ...pcbSilkLineWidth(s),
          visible: true,
          visibilityAvailability: "available",
          visibilitySource: "primitive-string",
          bbox: await silkBBox(s.getState_PrimitiveId()),
          kind: "string",
          text: s.getState_Text?.() ?? "",
          layer,
          mirror: !!s.getState_Mirror?.(),
          reverse: !!s.getState_Reverse?.(),
          rotation: Number(s.getState_Rotation?.() ?? 0),
          fontFamily: s.getState_FontFamily?.() ?? "",
          fontSize: Number(s.getState_FontSize?.() ?? 0) || 0,
          componentId: "",
          componentLayer: 0,
          x: s.getState_X() ?? 0,
          y: s.getState_Y() ?? 0
        });
      }
    } catch (err) {
      throw edaError(err, "Failed to enumerate silkscreen strings.");
    }
    return { result: { texts, count: texts.length } };
  };
  var pcbSilkAdd = async (payload) => {
    const text2 = requireString(payload, "text");
    const x = requireNumber(payload, "x");
    const y = requireNumber(payload, "y");
    const layer = optionalNumber(payload, "layer") ?? PCB_TOP_SILK;
    const fontSize = optionalNumber(payload, "fontSize") ?? 40;
    const lineWidth = optionalNumber(payload, "lineWidth") ?? 6;
    const rotation = optionalNumber(payload, "rotation") ?? 0;
    const fontFamily = optionalString(payload, "fontFamily") ?? "default";
    if (fontFamily !== "default") {
      try {
        const fonts = await eda.sys_FontManager.getFontsList() ?? [];
        if (!fonts.some((f) => f.toLowerCase() === fontFamily.toLowerCase())) {
          const added = await eda.sys_FontManager.addFont(fontFamily);
          if (!added) throw new Error(`font manager did not add ${fontFamily}`);
        }
      } catch (err) {
        throw edaError(err, `Font ${fontFamily} is not available to EasyEDA.`);
      }
    }
    let s;
    try {
      s = await eda.pcb_PrimitiveString.create(
        layer,
        x,
        y,
        text2,
        fontFamily,
        fontSize,
        lineWidth,
        1,
        rotation,
        false,
        0,
        false,
        false
      );
    } catch (err) {
      throw edaError(err, "Failed to create silkscreen string.");
    }
    if (!s) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "silkscreen string create returned no primitive.");
    }
    const id = s.getState_PrimitiveId();
    let bbox;
    try {
      bbox = await eda.pcb_Primitive.getPrimitivesBBox([id]);
    } catch {
    }
    return { result: { primitiveId: id, layer: Number(layer), x, y, fontFamily: s.getState_FontFamily?.() ?? fontFamily, fontSize, lineWidth, rotation, bbox } };
  };
  var pcbSilkImportSvg = async (payload) => {
    const raw = payload.polygons;
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "polygons must be a non-empty array of contour arrays.");
    }
    for (const c of raw) {
      if (!Array.isArray(c) || c.length < 3) {
        throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'each contour must be an array like [x0,y0,"L",x1,y1,\u2026].');
      }
    }
    const x = requireNumber(payload, "x");
    const y = requireNumber(payload, "y");
    const layer = optionalNumber(payload, "layer") ?? PCB_TOP_SILK;
    const width = optionalNumber(payload, "width");
    const height = optionalNumber(payload, "height");
    const rotation = optionalNumber(payload, "rotation") ?? 0;
    const mirror = optionalBoolean(payload, "mirror") === true;
    const complexPolygon = raw.length === 1 ? raw[0] : raw;
    let img;
    try {
      img = await eda.pcb_PrimitiveImage.create(
        x,
        y,
        complexPolygon,
        layer,
        width,
        height,
        rotation,
        mirror
      );
    } catch (err) {
      throw edaError(err, "Failed to create silkscreen image from SVG.");
    }
    if (!img) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "pcb_PrimitiveImage.create returned no primitive (check the polygon contours are valid closed shapes).");
    }
    const id = img.getState_PrimitiveId();
    let bbox;
    try {
      bbox = await eda.pcb_Primitive.getPrimitivesBBox([id]);
    } catch {
    }
    return { result: { primitiveId: id, layer: Number(layer), x, y, rotation, mirror, contours: raw.length, bbox } };
  };
  async function resolveSilkRefBBox(ref) {
    const r = ref.trim().toLowerCase();
    if (r === "board" || r === "outline") {
      const ids = await boardOutlineIds();
      return ids.length ? await eda.pcb_Primitive.getPrimitivesBBox(ids) : null;
    }
    if (r === "fill") {
      const ids = (await eda.pcb_PrimitiveFill.getAll() ?? []).map((f) => f.getState_PrimitiveId());
      return ids.length ? await eda.pcb_Primitive.getPrimitivesBBox(ids) : null;
    }
    for (const c of await eda.pcb_PrimitiveComponent.getAll() ?? []) {
      if (c.getState_Designator?.() === ref) return await eda.pcb_Primitive.getPrimitivesBBox([c.getState_PrimitiveId()]);
    }
    return null;
  }
  var pcbSilkSet = async (payload) => {
    const raw = payload.primitiveIds ?? payload.ids;
    let ids;
    if (typeof raw === "string") ids = [raw];
    else if (Array.isArray(raw) && raw.every((v) => typeof v === "string")) ids = raw;
    else throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing "primitiveIds" (string or string[]).');
    if (!ids.length || ids.some((id) => !id.trim()) || new Set(ids).size !== ids.length) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "primitiveIds must contain distinct nonempty IDs.");
    }
    const baseProps = {};
    const fields2 = ["x", "y", "rotation", "fontFamily", "fontSize", "lineWidth", "text", "mirror", "reverse"];
    for (const k of fields2) {
      if (!Object.prototype.hasOwnProperty.call(payload, k)) continue;
      const value = payload[k];
      if (k === "mirror" || k === "reverse") {
        if (typeof value !== "boolean") throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${k} must be a boolean.`);
      } else if (k === "text" || k === "fontFamily") {
        if (typeof value !== "string" || k === "fontFamily" && !value.trim()) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${k} must be ${k === "fontFamily" ? "a nonempty" : "a"} string.`);
      } else if (typeof value !== "number" || !Number.isFinite(value) || (k === "fontSize" || k === "lineWidth") && value <= 0) {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `${k} must be a finite${k === "fontSize" || k === "lineWidth" ? " positive" : ""} number.`);
      }
      baseProps[k] = value;
    }
    const align = (optionalString(payload, "align") ?? "").trim().toLowerCase();
    if (align && (!["center", "mid", "centerx", "centery", "left", "right", "top", "bottom"].includes(align) || Object.keys(baseProps).length)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "align must be a supported mode and cannot be combined with other silk fields; restyle first, then align.");
    }
    let refBox = null;
    const ref = optionalString(payload, "ref") ?? "board";
    if (align) {
      refBox = await resolveSilkRefBBox(ref);
      if (!validSilkRect(refBox)) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `could not resolve align --ref "${ref}" (use a designator, "board", or "fill").`);
      }
    }
    if (Object.keys(baseProps).length === 0 && !align) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "nothing to do \u2014 provide x/y/rotation/fontFamily/fontSize/lineWidth/text/mirror/reverse, or --align (+ --ref).");
    }
    if (typeof baseProps.fontFamily === "string" && baseProps.fontFamily !== "default") {
      try {
        const fontFamily = baseProps.fontFamily;
        const fonts = await eda.sys_FontManager.getFontsList() ?? [];
        if (!fonts.some((f) => f.toLowerCase() === fontFamily.toLowerCase())) {
          const added = await eda.sys_FontManager.addFont(fontFamily);
          if (!added) throw new Error(`font manager did not add ${fontFamily}`);
        }
      } catch (err) {
        throw edaError(err, `Font ${String(baseProps.fontFamily)} is not available to EasyEDA.`);
      }
    }
    const attrIds = new Set(silkInventory(await eda.pcb_PrimitiveAttribute.getAll(), "attributes").map((a) => a.getState_PrimitiveId()));
    const results = [];
    const appliedIds = [];
    let stopped = false;
    for (const id of ids) {
      if (stopped) {
        results.push({ primitiveId: id, ok: false, verified: false, attempted: false, requested: { ...baseProps }, actual: null, error: "not attempted after an unverified silk write; read back before recomputing" });
        continue;
      }
      const isAttr = attrIds.has(id);
      const props = { ...baseProps };
      const errors = [];
      const actual = {};
      let attempted = false;
      try {
        const get = () => isAttr ? eda.pcb_PrimitiveAttribute.get(id) : eda.pcb_PrimitiveString.get(id);
        const cur = await get();
        if (!cur || cur.getState_PrimitiveId?.() !== id) throw new Error("silk primitive identity was not found by readback");
        if (align && refBox) {
          const sb = await eda.pcb_Primitive.getPrimitivesBBox([id]);
          const x = cur.getState_X(), y = cur.getState_Y();
          if (!validSilkRect(sb) || typeof x !== "number" || !Number.isFinite(x) || typeof y !== "number" || !Number.isFinite(y)) throw new Error("align requires a valid rendered bbox and finite anchors");
          const offx = x - sb.minX, offy = y - sb.minY;
          const w = sb.maxX - sb.minX, h = sb.maxY - sb.minY;
          const rcx = (refBox.minX + refBox.maxX) / 2, rcy = (refBox.minY + refBox.maxY) / 2;
          let tMinX = sb.minX, tMinY = sb.minY;
          if (align === "center" || align === "mid" || align === "centerx") tMinX = rcx - w / 2;
          if (align === "center" || align === "mid" || align === "centery") tMinY = rcy - h / 2;
          if (align === "left") tMinX = refBox.minX;
          if (align === "right") tMinX = refBox.maxX - w;
          if (align === "top") tMinY = refBox.maxY - h;
          if (align === "bottom") tMinY = refBox.minY;
          props.x = tMinX + offx;
          props.y = tMinY + offy;
        }
        const sdkProps = { ...props };
        if (isAttr && "text" in sdkProps) {
          sdkProps.value = sdkProps.text;
          delete sdkProps.text;
        }
        attempted = true;
        appliedIds.push(id);
        try {
          const modified = isAttr ? await eda.pcb_PrimitiveAttribute.modify(id, sdkProps) : await eda.pcb_PrimitiveString.modify(id, sdkProps);
          if (!modified) errors.push("modify returned no primitive; the write may already have applied");
        } catch (err) {
          errors.push(`modify failed; the write may already have applied: ${String(err)}`);
        }
        const fresh = await get();
        if (!fresh) throw new Error("modified primitive was not found by fresh readback");
        actual.primitiveId = fresh.getState_PrimitiveId?.() ?? null;
        if (actual.primitiveId !== id) errors.push("fresh primitive identity differs");
        const getters = {
          x: "getState_X",
          y: "getState_Y",
          rotation: "getState_Rotation",
          fontFamily: "getState_FontFamily",
          fontSize: "getState_FontSize",
          lineWidth: "getState_LineWidth",
          mirror: "getState_Mirror",
          reverse: "getState_Reverse",
          text: isAttr ? "getState_Value" : "getState_Text"
        };
        for (const [key, want] of Object.entries(props)) {
          try {
            const getter = fresh[getters[key]];
            const got = typeof getter === "function" ? getter.call(fresh) : void 0;
            actual[key] = got ?? null;
            const matches = typeof want === "number" ? typeof got === "number" && Number.isFinite(got) && Math.abs(got - want) <= 1e-6 : key === "fontFamily" ? typeof got === "string" && got.toLowerCase() === String(want).toLowerCase() : typeof got === typeof want && got === want;
            if (!matches) errors.push(`${key} readback differs: requested=${String(want)} actual=${String(got)}`);
          } catch (err) {
            actual[key] = null;
            errors.push(`${key} readback failed: ${String(err)}`);
          }
        }
        if (align && refBox) {
          const bbox = await eda.pcb_Primitive.getPrimitivesBBox([id]);
          actual.bbox = bbox ?? null;
          const freshRef = await resolveSilkRefBBox(ref);
          if (!validSilkRect(bbox) || !validSilkRect(freshRef)) errors.push("fresh align geometry is unavailable");
          else {
            if (Object.keys(refBox).some((k) => Math.abs(refBox[k] - freshRef[k]) > 1e-6)) errors.push("align reference bbox changed");
            const pairs = [];
            if (["center", "mid", "centerx"].includes(align)) pairs.push([(bbox.minX + bbox.maxX) / 2, (freshRef.minX + freshRef.maxX) / 2]);
            if (["center", "mid", "centery"].includes(align)) pairs.push([(bbox.minY + bbox.maxY) / 2, (freshRef.minY + freshRef.maxY) / 2]);
            if (align === "left") pairs.push([bbox.minX, freshRef.minX]);
            if (align === "right") pairs.push([bbox.maxX, freshRef.maxX]);
            if (align === "top") pairs.push([bbox.maxY, freshRef.maxY]);
            if (align === "bottom") pairs.push([bbox.minY, freshRef.minY]);
            if (pairs.some(([a, b]) => Math.abs(a - b) > 1e-6)) errors.push("fresh rendered bbox does not satisfy align");
          }
        }
      } catch (err) {
        errors.push(String(err));
      }
      const verified2 = errors.length === 0;
      results.push({
        primitiveId: id,
        ok: verified2,
        verified: verified2,
        attempted,
        requested: { ...props },
        actual,
        fontFamily: actual.fontFamily ?? null,
        ...verified2 ? {} : { error: errors.join("; ") }
      });
      stopped = !verified2;
    }
    const verified = results.length === ids.length && results.every((r) => r.verified === true);
    return { result: { align: align || void 0, count: results.length, requestedIds: ids, verified, partial: !verified && appliedIds.length > 0, appliedIds, results } };
  };
  var pcbSilkNetnames = async (payload) => {
    const zoneRect = payload.zone_rect;
    if (!zoneRect || typeof zoneRect.left !== "number" || typeof zoneRect.top !== "number" || typeof zoneRect.right !== "number" || typeof zoneRect.bottom !== "number") {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing "zone_rect" ({left, top, right, bottom} in mil).');
    }
    const layer = optionalNumber(payload, "layer") ?? 3;
    const align = optionalString(payload, "align") ?? "left";
    const fontSize = optionalNumber(payload, "fontSize") ?? 40;
    const lineWidth = optionalNumber(payload, "lineWidth") ?? 6;
    const excludeNets = Array.isArray(payload.exclude_nets) ? payload.exclude_nets : [];
    let netNames = [];
    let pads = [];
    try {
      netNames = await eda.pcb_Net.getAllNetsName() ?? [];
    } catch (err) {
      throw edaError(err, "Failed to read PCB net names.");
    }
    try {
      const allPads = await eda.pcb_PrimitivePad.getAll() ?? [];
      for (const pad of allPads) {
        const net = pad.getState_Net?.() ?? null;
        const padId = pad.getState_PrimitiveId?.() ?? null;
        const x = pad.getState_X?.() ?? 0;
        const y = pad.getState_Y?.() ?? 0;
        if (net && padId) {
          const ext = padExtent(pad);
          const width = ext?.width ?? 50, height = ext?.height ?? 50;
          pads.push({ primitiveId: padId, net, x, y, width, height });
        }
      }
    } catch (err) {
      throw edaError(err, "Failed to read PCB pads.");
    }
    const excludeSet = new Set(excludeNets);
    const activeNets = [];
    for (const netName of netNames) {
      if (excludeSet.has(netName)) continue;
      const netPads = pads.filter((p) => p.net === netName);
      const inZone = netPads.some((p) => p.x >= zoneRect.left && p.x <= zoneRect.right && p.y >= zoneRect.bottom && p.y <= zoneRect.top);
      if (inZone && netPads.length > 0) {
        activeNets.push({ name: netName, pads: netPads });
      }
    }
    activeNets.sort((a, b) => {
      const minA = Math.min(...a.pads.map((p) => p.x));
      const minB = Math.min(...b.pads.map((p) => p.x));
      return align === "right" ? minB - minA : minA - minB;
    });
    const created = [];
    const failed = [];
    const occupied = [];
    const canPlaceLabel = (labelBbox, margin = 5) => {
      if (labelBbox.minX < zoneRect.left - margin || labelBbox.maxX > zoneRect.right + margin || labelBbox.minY < zoneRect.bottom - margin || labelBbox.maxY > zoneRect.top + margin) {
        return false;
      }
      for (const occ of occupied) {
        if (silkOverlap(labelBbox, occ, margin)) return false;
      }
      return true;
    };
    const estimateLabelBbox = (x, y) => {
      const textLen = Math.max(5, 2) * fontSize * 0.6;
      return { minX: x, minY: y - fontSize, maxX: x + textLen, maxY: y };
    };
    for (const net of activeNets) {
      try {
        const zoneCx = (zoneRect.left + zoneRect.right) / 2;
        const zoneCy = (zoneRect.top + zoneRect.bottom) / 2;
        const padInZone = net.pads.filter(
          (p) => p.x >= zoneRect.left && p.x <= zoneRect.right && p.y >= zoneRect.bottom && p.y <= zoneRect.top
        );
        const padsToTry = padInZone.length > 0 ? padInZone : net.pads;
        let best = null;
        for (const pad of padsToTry) {
          if (best) break;
          const margin = 10;
          const candidates = [
            { x: pad.x + pad.width / 2 + margin, y: pad.y + margin, dir: "right" },
            { x: pad.x - pad.width / 2 - margin, y: pad.y + margin, dir: "left" },
            { x: pad.x + margin, y: pad.y + pad.height / 2 + margin, dir: "top" },
            { x: pad.x + margin, y: pad.y - pad.height / 2 - margin, dir: "bottom" }
          ];
          for (const cand of candidates) {
            const estBbox = estimateLabelBbox(cand.x, cand.y);
            if (canPlaceLabel(estBbox)) {
              best = { x: cand.x, y: cand.y };
              break;
            }
          }
        }
        if (!best) {
          failed.push({ net: net.name, reason: "no free space found (zone fully occupied)" });
          continue;
        }
        const created_prim = await eda.pcb_PrimitiveString.create(
          layer,
          best.x,
          best.y,
          net.name,
          "default",
          fontSize,
          lineWidth,
          1,
          0,
          // rotation
          false,
          // reverse
          0,
          // expansion
          false,
          // isMirror
          false
          // primitiveLock
        );
        if (!created_prim) {
          failed.push({ net: net.name, reason: "create returned no primitive" });
          continue;
        }
        const bbox = await eda.pcb_Primitive.getPrimitivesBBox([created_prim.getState_PrimitiveId?.() ?? ""]);
        if (bbox) occupied.push(bbox);
        created.push({
          net: net.name,
          primitiveId: created_prim.getState_PrimitiveId?.() ?? "",
          x: best.x,
          y: best.y,
          fontSize,
          lineWidth,
          bbox
        });
      } catch (err) {
        failed.push({ net: net.name, reason: String(err) });
      }
    }
    return {
      result: {
        created,
        total: created.length,
        failed: failed.length > 0 ? failed : void 0
      }
    };
  };
  var pcbSilkLabelPads = async (payload) => {
    const refs = Array.isArray(payload.refs) ? payload.refs : [];
    if (refs.length === 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing "refs" ([]string of designators, e.g. ["J2", "U1"]).');
    }
    const layer = optionalNumber(payload, "layer") ?? 3;
    const fontSize = optionalNumber(payload, "fontSize") ?? 30;
    const lineWidth = optionalNumber(payload, "lineWidth") ?? 4;
    const content = optionalString(payload, "content") ?? "both";
    const userSide = optionalString(payload, "side") ?? "auto";
    const userAlignAxis = optionalString(payload, "align_axis") ?? "auto";
    const excludeNets = Array.isArray(payload.exclude_nets) ? payload.exclude_nets : [];
    const excludeSet = new Set(excludeNets);
    const created = [];
    const failed = [];
    const occupied = [];
    const canPlaceLabel = (labelBbox, margin = 5) => {
      for (const occ of occupied) {
        if (silkOverlap(labelBbox, occ, margin)) return false;
      }
      return true;
    };
    const estimateLabelBbox = (x, y, text2) => {
      const textLen = Math.max(2, text2.length) * fontSize * 0.6;
      return { minX: x, minY: y - fontSize, maxX: x + textLen, maxY: y };
    };
    let components = [];
    try {
      components = await eda.pcb_PrimitiveComponent.getAll() ?? [];
    } catch (err) {
      throw edaError(err, "Failed to read PCB components.");
    }
    const refSet = new Set(refs);
    const targetComps = components.filter((c) => {
      const des = c.getState_Designator?.() ?? "";
      return refSet.has(des);
    });
    if (targetComps.length === 0) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `No components found with refs: ${refs.join(", ")}`);
    }
    let chosenSide = "right";
    let chosenAlignAxis = "x";
    if (userSide !== "auto" && ["right", "below", "above", "left"].includes(userSide)) {
      chosenSide = userSide;
    }
    if (userAlignAxis !== "auto" && ["x", "y"].includes(userAlignAxis)) {
      chosenAlignAxis = userAlignAxis;
    }
    if ((userSide === "auto" || userAlignAxis === "auto") && targetComps.length > 0) {
      try {
        const firstCompId = targetComps[0].getState_PrimitiveId?.() ?? "";
        const firstBbox = await eda.pcb_Primitive.getPrimitivesBBox?.([firstCompId]);
        if (firstBbox) {
          const width = firstBbox.maxX - firstBbox.minX;
          const height = firstBbox.maxY - firstBbox.minY;
          if (userAlignAxis === "auto") {
            chosenAlignAxis = height > width ? "x" : "y";
          }
          if (userSide === "auto") {
            chosenSide = height > width ? "right" : "below";
          }
        }
      } catch {
      }
    }
    for (const comp of targetComps) {
      const compId = comp.getState_PrimitiveId?.() ?? "";
      const designator = comp.getState_Designator?.() ?? "";
      let pins = [];
      try {
        pins = await eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId?.(compId) ?? [];
      } catch (err) {
        failed.push({ ref: designator, pin: "all", reason: `Failed to read pins: ${String(err)}` });
        continue;
      }
      let compBbox = null;
      try {
        compBbox = await eda.pcb_Primitive.getPrimitivesBBox?.([compId]);
      } catch {
      }
      const validPins = pins.filter((pin) => {
        const net = pin.getState_Net?.() ?? "";
        return !(net && excludeSet.has(net));
      });
      if (validPins.length === 0) continue;
      let pinIndex = 0;
      for (const pin of validPins) {
        try {
          const pinNum = pin.getState_PadNumber?.() ?? "?";
          const net = pin.getState_Net?.() ?? "";
          const pinX = pin.getState_X?.() ?? 0;
          const pinY = pin.getState_Y?.() ?? 0;
          let labelText = "";
          if (content === "pin-number") labelText = String(pinNum);
          else if (content === "net-name") labelText = net || "NC";
          else labelText = `${pinNum}(${net || "NC"})`;
          let bestPos = null;
          const margin = 20;
          if (compBbox) {
            if (chosenAlignAxis === "x") {
              if (chosenSide === "right") {
                bestPos = { x: compBbox.maxX + margin, y: pinY };
              } else if (chosenSide === "left") {
                bestPos = { x: compBbox.minX - margin, y: pinY };
              } else {
                bestPos = { x: compBbox.maxX + margin, y: pinY };
              }
            } else {
              if (chosenSide === "below") {
                bestPos = { x: pinX, y: compBbox.minY - margin };
              } else if (chosenSide === "above") {
                bestPos = { x: pinX, y: compBbox.maxY + margin };
              } else {
                bestPos = { x: pinX, y: compBbox.minY - margin };
              }
            }
          } else {
            bestPos = { x: pinX + 30, y: pinY };
          }
          pinIndex++;
          if (!bestPos) {
            failed.push({ ref: designator, pin: String(pinNum), reason: "no space found" });
            continue;
          }
          const estBbox = estimateLabelBbox(bestPos.x, bestPos.y, labelText);
          if (!canPlaceLabel(estBbox)) {
            failed.push({ ref: designator, pin: String(pinNum), reason: "collision detected" });
            continue;
          }
          const label = await eda.pcb_PrimitiveString.create(
            layer,
            bestPos.x,
            bestPos.y,
            labelText,
            "default",
            fontSize,
            lineWidth,
            1,
            0,
            // rotation
            false,
            // reverse
            0,
            // expansion
            false,
            // isMirror
            false
            // primitiveLock
          );
          if (!label) {
            failed.push({ ref: designator, pin: String(pinNum), reason: "create returned no primitive" });
            continue;
          }
          const bbox = await eda.pcb_Primitive.getPrimitivesBBox([label.getState_PrimitiveId?.() ?? ""]);
          if (bbox) occupied.push(bbox);
          created.push({
            ref: designator,
            pin: String(pinNum),
            net: net || "",
            primitiveId: label.getState_PrimitiveId?.() ?? "",
            x: bestPos.x,
            y: bestPos.y,
            bbox
          });
        } catch (err) {
          failed.push({ ref: designator, pin: "unknown", reason: String(err) });
        }
      }
    }
    return {
      result: {
        created,
        total: created.length,
        side_chosen: chosenSide,
        align_axis_chosen: chosenAlignAxis,
        failed: failed.length > 0 ? failed : void 0
      }
    };
  };
  var pcbNetsList = async () => {
    let nets;
    try {
      nets = await eda.pcb_Net.getAllNets();
    } catch (err) {
      throw edaError(err, "Failed to list PCB nets.");
    }
    return { result: { nets, count: nets.length } };
  };
  var pcbReport = async () => {
    const result = {};
    const lengthOf = /* @__PURE__ */ new Map();
    const len = async (net) => {
      if (lengthOf.has(net)) return lengthOf.get(net) ?? null;
      let l = null;
      try {
        l = await eda.pcb_Net.getNetLength(net) ?? null;
      } catch {
      }
      lengthOf.set(net, l);
      return l;
    };
    try {
      const names = await eda.pcb_Net.getAllNetsName() ?? [];
      const nets = [];
      for (const net of names) nets.push({ net, length: await len(net) });
      result.nets = nets;
      result.netCount = nets.length;
    } catch (err) {
      result.netsError = describeThrown(err);
    }
    try {
      const classes = await eda.pcb_Drc.getAllNetClasses() ?? [];
      result.netClasses = await Promise.all(classes.map(async (c) => {
        let total = 0, measured = 0;
        for (const n of c.nets ?? []) {
          const l = await len(n);
          if (typeof l === "number") {
            total += l;
            measured++;
          }
        }
        return { name: c.name, nets: c.nets, totalLength: measured ? total : null };
      }));
    } catch (err) {
      result.netClassesError = describeThrown(err);
    }
    try {
      const pairsRaw = await eda.pcb_Drc.getAllDifferentialPairs();
      const pairs = (Array.isArray(pairsRaw) ? pairsRaw : Object.values(pairsRaw ?? {})).filter((p) => !!p && typeof p === "object" && "positiveNet" in p && "negativeNet" in p);
      result.differentialPairs = await Promise.all(pairs.map(async (p) => {
        const lp = await len(p.positiveNet);
        const ln = await len(p.negativeNet);
        const skew = typeof lp === "number" && typeof ln === "number" ? Math.abs(lp - ln) : null;
        return { name: p.name, positiveNet: p.positiveNet, negativeNet: p.negativeNet, positiveLength: lp, negativeLength: ln, skew };
      }));
    } catch (err) {
      result.differentialPairsError = describeThrown(err);
    }
    try {
      const groups = await eda.pcb_Drc.getAllEqualLengthNetGroups() ?? [];
      result.equalLengthNetGroups = await Promise.all(groups.map(async (g) => {
        const members = [];
        const vals = [];
        for (const n of g.nets ?? []) {
          const l = await len(n);
          members.push({ net: n, length: l });
          if (typeof l === "number") vals.push(l);
        }
        const spread = vals.length ? Math.max(...vals) - Math.min(...vals) : null;
        return { name: g.name, members, spread };
      }));
    } catch (err) {
      result.equalLengthNetGroupsError = describeThrown(err);
    }
    return { result };
  };
  function constraintList(raw) {
    return Array.isArray(raw) ? raw : Object.values(raw ?? {});
  }
  async function readDiffPairs() {
    const raw = await eda.pcb_Drc.getAllDifferentialPairs();
    return constraintList(raw).filter((p) => !!p && typeof p === "object" && "positiveNet" in p && "negativeNet" in p);
  }
  async function readEqLenGroups() {
    const raw = await eda.pcb_Drc.getAllEqualLengthNetGroups();
    return constraintList(raw).filter((g) => !!g && typeof g === "object" && "name" in g);
  }
  async function assertNetsExist(nets, what) {
    let known = [];
    try {
      known = await eda.pcb_Net.getAllNetsName() ?? [];
    } catch {
      return;
    }
    if (!known.length) return;
    const missing = nets.filter((n) => !known.includes(n));
    if (!missing.length) return;
    throw new ActionError(
      ErrorCodes.PRECONDITION_REFUSED,
      `${what}: net(s) not on this PCB: ${missing.join(", ")}. Nothing was created. List the board's nets with \`easyeda pcb nets\` and use those exact names (net names are case-sensitive and come from the schematic).`
    );
  }
  var pcbConstraintList = async () => {
    const [pairs, groups] = await Promise.all([
      readDiffPairs().catch((err) => {
        throw edaError(err, "Failed to read differential pairs.");
      }),
      readEqLenGroups().catch((err) => {
        throw edaError(err, "Failed to read equal-length groups.");
      })
    ]);
    return { result: { differentialPairs: pairs, equalLengthGroups: groups, count: pairs.length + groups.length } };
  };
  var pcbDiffPairCreate = async (payload) => {
    const name2 = requireString(payload, "name");
    const positiveNet = requireString(payload, "positiveNet");
    const negativeNet = requireString(payload, "negativeNet");
    if (positiveNet === negativeNet) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `differential pair "${name2}": positiveNet and negativeNet are both "${positiveNet}" \u2014 a pair needs two different nets.`
      );
    }
    const existing = await readDiffPairs();
    const already = existing.find((p) => p.name === name2);
    if (already) {
      if (already.positiveNet === positiveNet && already.negativeNet === negativeNet) {
        return { result: { name: name2, positiveNet, negativeNet, alreadyExists: true, verified: true } };
      }
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `differential pair "${name2}" already exists on ${already.positiveNet}/${already.negativeNet}, not ${positiveNet}/${negativeNet}. Delete it first (\`easyeda pcb diff-pair delete --name ${name2}\`) or pick another name.`
      );
    }
    await assertNetsExist([positiveNet, negativeNet], `differential pair "${name2}"`);
    let ok = false;
    try {
      ok = await eda.pcb_Drc.createDifferentialPair(name2, positiveNet, negativeNet);
    } catch (err) {
      throw edaError(err, `Failed to create differential pair "${name2}".`);
    }
    const after = (await readDiffPairs()).find((p) => p.name === name2);
    const verified = !!after && after.positiveNet === positiveNet && after.negativeNet === negativeNet;
    if (!verified) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `createDifferentialPair("${name2}") returned ${ok} but the pair is not on the board when read back. Check that the PCB document is the foreground tab, then retry.`
      );
    }
    return { result: { name: name2, positiveNet, negativeNet, created: true, verified } };
  };
  var pcbDiffPairDelete = async (payload) => {
    const name2 = requireString(payload, "name");
    const before = await readDiffPairs();
    if (!before.some((p) => p.name === name2)) {
      return {
        result: { name: name2, deleted: false, notFound: true, verified: true },
        warnings: [`differential pair "${name2}" does not exist \u2014 nothing to delete (known: ${before.map((p) => p.name).join(", ") || "none"}).`]
      };
    }
    let ok = false;
    try {
      ok = await eda.pcb_Drc.deleteDifferentialPair(name2);
    } catch (err) {
      throw edaError(err, `Failed to delete differential pair "${name2}".`);
    }
    const stillThere = (await readDiffPairs()).some((p) => p.name === name2);
    if (stillThere) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `deleteDifferentialPair("${name2}") returned ${ok} but the pair is still on the board when read back.`
      );
    }
    return { result: { name: name2, deleted: true, verified: true } };
  };
  var pcbDiffPairRename = async (payload) => {
    const name2 = requireString(payload, "name");
    const newName = requireString(payload, "newName");
    const before = await readDiffPairs();
    if (!before.some((p) => p.name === name2)) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `differential pair "${name2}" does not exist (known: ${before.map((p) => p.name).join(", ") || "none"}).`
      );
    }
    if (before.some((p) => p.name === newName)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `a differential pair named "${newName}" already exists.`);
    }
    let ok = false;
    try {
      ok = await eda.pcb_Drc.modifyDifferentialPairName(name2, newName);
    } catch (err) {
      throw edaError(err, `Failed to rename differential pair "${name2}" \u2192 "${newName}".`);
    }
    const after = await readDiffPairs();
    const verified = after.some((p) => p.name === newName) && !after.some((p) => p.name === name2);
    if (!verified) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `modifyDifferentialPairName("${name2}","${newName}") returned ${ok} but the rename is not visible on read-back.`
      );
    }
    return { result: { name: newName, previousName: name2, renamed: true, verified } };
  };
  var pcbEqGroupCreate = async (payload) => {
    const name2 = requireString(payload, "name");
    const nets = requireStringArray(payload, "nets");
    if (nets.length < 2) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `equal-length group "${name2}" needs at least 2 nets (got ${nets.length}) \u2014 a one-net group constrains nothing.`
      );
    }
    const existing = await readEqLenGroups();
    const already = existing.find((g) => g.name === name2);
    if (already) {
      const same2 = already.nets?.length === nets.length && nets.every((n) => already.nets.includes(n));
      if (same2) return { result: { name: name2, nets, alreadyExists: true, verified: true } };
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `equal-length group "${name2}" already exists with nets [${(already.nets ?? []).join(", ")}]. Add to it with \`easyeda pcb eq-group add --name ${name2} --nets \u2026\`, or delete it first.`
      );
    }
    await assertNetsExist(nets, `equal-length group "${name2}"`);
    let ok = false;
    try {
      ok = await eda.pcb_Drc.createEqualLengthNetGroup(name2, nets, void 0);
    } catch (err) {
      throw edaError(err, `Failed to create equal-length group "${name2}".`);
    }
    const after = (await readEqLenGroups()).find((g) => g.name === name2);
    const verified = !!after && nets.every((n) => (after.nets ?? []).includes(n));
    if (!verified) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `createEqualLengthNetGroup("${name2}") returned ${ok} but the group is not on the board when read back.`
      );
    }
    return { result: { name: name2, nets: after.nets ?? nets, created: true, verified } };
  };
  var pcbEqGroupAddNets = async (payload) => {
    const name2 = requireString(payload, "name");
    const nets = requireStringArray(payload, "nets");
    const before = (await readEqLenGroups()).find((g) => g.name === name2);
    if (!before) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `equal-length group "${name2}" does not exist \u2014 create it first with \`easyeda pcb eq-group create --name ${name2} --nets \u2026\`.`
      );
    }
    const fresh = nets.filter((n) => !(before.nets ?? []).includes(n));
    if (!fresh.length) {
      return { result: { name: name2, nets: before.nets ?? [], added: [], alreadyMembers: nets, verified: true } };
    }
    await assertNetsExist(fresh, `equal-length group "${name2}"`);
    let ok = false;
    try {
      ok = await eda.pcb_Drc.addNetToEqualLengthNetGroup(name2, fresh);
    } catch (err) {
      throw edaError(err, `Failed to add nets to equal-length group "${name2}".`);
    }
    const after = (await readEqLenGroups()).find((g) => g.name === name2);
    const landed = fresh.filter((n) => (after?.nets ?? []).includes(n));
    const notApplied = fresh.filter((n) => !landed.includes(n));
    if (notApplied.length) {
      return {
        result: { name: name2, nets: after?.nets ?? [], added: landed, partial: true, notApplied, verified: false },
        warnings: [`addNetToEqualLengthNetGroup("${name2}") returned ${ok} but ${notApplied.join(", ")} did not appear on read-back \u2014 retry those, or check they are real nets on this board.`]
      };
    }
    return { result: { name: name2, nets: after?.nets ?? [], added: landed, verified: true } };
  };
  var pcbEqGroupDelete = async (payload) => {
    const name2 = requireString(payload, "name");
    const before = await readEqLenGroups();
    if (!before.some((g) => g.name === name2)) {
      return {
        result: { name: name2, deleted: false, notFound: true, verified: true },
        warnings: [`equal-length group "${name2}" does not exist \u2014 nothing to delete (known: ${before.map((g) => g.name).join(", ") || "none"}).`]
      };
    }
    let ok = false;
    try {
      ok = await eda.pcb_Drc.deleteEqualLengthNetGroup(name2);
    } catch (err) {
      throw edaError(err, `Failed to delete equal-length group "${name2}".`);
    }
    if ((await readEqLenGroups()).some((g) => g.name === name2)) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `deleteEqualLengthNetGroup("${name2}") returned ${ok} but the group is still on the board when read back.`
      );
    }
    return { result: { name: name2, deleted: true, verified: true } };
  };
  var pcbBoardInfo = async () => {
    let board;
    try {
      board = await eda.dmt_Board.getCurrentBoardInfo();
    } catch (err) {
      throw edaError(err, "Failed to read current Board info.");
    }
    let pcb;
    try {
      pcb = await eda.dmt_Pcb.getCurrentPcbInfo();
    } catch {
    }
    return {
      result: {
        linked: !!board,
        board: board ? serializeBoard(board) : null,
        pcb: pcb ? { uuid: pcb.uuid, name: pcb.name } : null
      }
    };
  };
  function serializeBoard(board) {
    return {
      name: board.name,
      schematicUuid: board.schematic?.uuid ?? null,
      schematicName: board.schematic?.name ?? null,
      pcbUuid: board.pcb?.uuid ?? null,
      pcbName: board.pcb?.name ?? null,
      parentProjectUuid: board.parentProjectUuid
    };
  }
  var boardList = async () => {
    let boards;
    try {
      boards = await eda.dmt_Board.getAllBoardsInfo();
    } catch (err) {
      throw edaError(err, "Failed to list Boards.");
    }
    return { result: { boards: boards.map(serializeBoard), count: boards.length } };
  };
  var boardCurrent = async () => {
    let board;
    try {
      board = await eda.dmt_Board.getCurrentBoardInfo();
    } catch (err) {
      throw edaError(err, "Failed to read current Board.");
    }
    return { result: { linked: !!board, board: board ? serializeBoard(board) : null } };
  };
  var boardCreate = async (payload) => {
    const schematicUuid = optionalString(payload, "schematicUuid");
    const pcbUuid = optionalString(payload, "pcbUuid");
    if (schematicUuid === void 0 && pcbUuid === void 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Pass at least one of "schematicUuid" or "pcbUuid".');
    }
    let name2;
    try {
      name2 = await eda.dmt_Board.createBoard(schematicUuid, pcbUuid);
    } catch (err) {
      throw edaError(err, "Failed to create Board.");
    }
    if (name2 === void 0) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Failed to create Board (check the schematic/PCB UUIDs).");
    }
    return { result: { boardName: name2 } };
  };
  var boardRename = async (payload) => {
    const name2 = requireString(payload, "name");
    const newName = requireString(payload, "newName");
    let hostReturned;
    try {
      hostReturned = await eda.dmt_Board.modifyBoardName(name2, newName);
    } catch (err) {
      throw edaError(err, "Failed to rename Board.");
    }
    const deadline = Date.now() + 5e3;
    let names = [];
    for (; ; ) {
      try {
        names = (await eda.dmt_Board.getAllBoardsInfo() ?? []).map((b) => b?.name);
      } catch {
      }
      const verified = names.includes(newName) && !names.includes(name2);
      if (verified || !hostReturned || Date.now() >= deadline) {
        return { result: { ok: verified, verified, hostReturned: hostReturned === true, name: name2, newName, boards: names } };
      }
      await sleep(250);
    }
  };
  var boardCopy = async (payload) => {
    const name2 = requireString(payload, "name");
    let newName;
    try {
      newName = await eda.dmt_Board.copyBoard(name2);
    } catch (err) {
      throw edaError(err, "Failed to copy Board.");
    }
    if (newName === void 0) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Failed to copy Board "${name2}".`);
    }
    return { result: { boardName: newName } };
  };
  async function readProjectDocuments() {
    const [schematics, pcbs] = await Promise.all([eda.dmt_Schematic.getAllSchematicsInfo(), eda.dmt_Pcb.getAllPcbsInfo()]);
    return [
      ...(schematics ?? []).map((s) => ({ kind: "schematic", uuid: s.uuid, name: s.name, parentBoardName: s.parentBoardName ?? null })),
      ...(pcbs ?? []).map((p) => ({ kind: "pcb", uuid: p.uuid, name: p.name, parentBoardName: p.parentBoardName ?? null }))
    ];
  }
  async function documentsAfterDelete(uuids) {
    const deadline = Date.now() + 5e3;
    for (; ; ) {
      let docs;
      try {
        docs = await readProjectDocuments();
      } catch {
        docs = void 0;
      }
      if (docs && !docs.some((d) => uuids.includes(d.uuid))) return docs;
      if (Date.now() >= deadline) return docs;
      await sleep(500);
    }
  }
  var boardDelete = async (payload) => {
    const name2 = requireString(payload, "name");
    const dryRun = optionalBoolean(payload, "dryRun") === true;
    const keepDocuments = optionalBoolean(payload, "keepDocuments") === true;
    let board;
    try {
      board = (await eda.dmt_Board.getAllBoardsInfo() ?? []).find((b) => b?.name === name2);
    } catch (err) {
      throw edaError(err, "Failed to list Boards before delete.");
    }
    if (!board) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Board "${name2}" was not found; nothing was deleted.`);
    }
    const documents = [];
    if (board.pcb?.uuid) documents.push({ kind: "pcb", uuid: board.pcb.uuid, name: board.pcb.name, parentBoardName: name2 });
    if (board.schematic?.uuid) documents.push({ kind: "schematic", uuid: board.schematic.uuid, name: board.schematic.name, parentBoardName: name2 });
    const toDelete = keepDocuments ? [] : documents;
    if (dryRun) {
      return { result: { name: name2, dryRun: true, keepDocuments, documents, wouldDelete: toDelete } };
    }
    let ok;
    try {
      ok = await eda.dmt_Board.deleteBoard(name2);
    } catch (err) {
      throw edaError(err, "Failed to delete Board.");
    }
    if (!ok) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `EasyEDA refused to delete Board "${name2}"; its documents were not touched.`);
    }
    const warnings = [];
    for (const doc of toDelete) {
      try {
        const done = doc.kind === "pcb" ? await eda.dmt_Pcb.deletePcb(doc.uuid) : await eda.dmt_Schematic.deleteSchematic(doc.uuid);
        if (!done) warnings.push(`EasyEDA returned false deleting ${doc.kind} "${doc.name}" (${doc.uuid}); readback decides.`);
      } catch (err) {
        warnings.push(`Deleting ${doc.kind} "${doc.name}" (${doc.uuid}) threw: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    const after = await documentsAfterDelete(toDelete.map((d) => d.uuid));
    let boardGone = false;
    try {
      boardGone = !(await eda.dmt_Board.getAllBoardsInfo() ?? []).some((b) => b?.name === name2);
    } catch {
    }
    const residual = after ? documents.filter((d) => after.some((a) => a.uuid === d.uuid)) : documents;
    const deleted = after ? toDelete.filter((d) => !after.some((a) => a.uuid === d.uuid)) : [];
    if (!after) warnings.push("The project document list could not be read back; deletion is unverified.");
    if (!boardGone) warnings.push(`Board "${name2}" is still listed after deleteBoard returned success.`);
    const complete = boardGone && !!after && deleted.length === toDelete.length;
    if (!complete) warnings.push("Partial delete: do not retry blindly \u2014 inspect `residual` and the project document list first.");
    return {
      result: { name: name2, boardDeleted: boardGone, keepDocuments, documents, deleted, residual, partial: !complete, verified: complete },
      warnings
    };
  };
  var pcbDocumentDelete = async (payload) => {
    const uuid = requireString(payload, "uuid");
    const expectedName = requireString(payload, "expectedName");
    const dryRun = optionalBoolean(payload, "dryRun") === true;
    let before;
    let boards;
    try {
      before = await readProjectDocuments();
      boards = await eda.dmt_Board.getAllBoardsInfo() ?? [];
    } catch (err) {
      throw edaError(err, "Failed to read project documents before PCB delete.");
    }
    const pcb = before.find((d) => d.kind === "pcb" && d.uuid === uuid);
    if (!pcb) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `PCB "${uuid}" was not found; nothing was deleted.`);
    if (pcb.name !== expectedName) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `PCB name mismatch: expected "${expectedName}", found "${pcb.name}".`);
    const holder = boards.find((b) => b?.pcb?.uuid === uuid)?.name ?? pcb.parentBoardName;
    if (holder) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `PCB "${pcb.name}" is bound to Board "${holder}"; refusing to delete a bound PCB. Use board.delete to remove the Board with its documents, or board.delete keepDocuments=true to unbind first.`
      );
    }
    if (dryRun) return { result: { uuid, name: pcb.name, dryRun: true, wouldDelete: [pcb] } };
    let ok;
    try {
      ok = await eda.dmt_Pcb.deletePcb(uuid);
    } catch (err) {
      throw edaError(err, `Failed to delete PCB "${pcb.name}".`);
    }
    const after = await documentsAfterDelete([uuid]);
    if (!after) {
      return {
        result: { uuid, name: pcb.name, platformOk: ok, deleted: false, partial: true, verified: false },
        warnings: ["deletePcb was sent but the project document list could not be read back; do not retry blindly."]
      };
    }
    if (after.some((d) => d.uuid === uuid)) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `PCB "${pcb.name}" (${uuid}) is still listed after deletePcb (platform ok=${ok}); not deleted.`);
    }
    const alsoDeleted = before.filter((d) => d.uuid !== uuid && !after.some((a) => a.uuid === d.uuid));
    return {
      result: { uuid, name: pcb.name, platformOk: ok, deleted: true, verified: true, alsoDeleted },
      warnings: alsoDeleted.length ? [`deletePcb also removed ${alsoDeleted.map((d) => `${d.kind} "${d.name}"`).join(", ")} (reuse-module cascade).`] : void 0
    };
  };
  var boardRebind = async (payload) => {
    const schematicUuid = requireString(payload, "schematicUuid");
    const pcbUuid = optionalString(payload, "pcbUuid");
    const name2 = optionalString(payload, "name");
    const force = optionalBoolean(payload, "force") === true;
    let boards;
    try {
      boards = await eda.dmt_Board.getAllBoardsInfo() ?? [];
    } catch (err) {
      throw edaError(err, "Failed to list Boards for rebind.");
    }
    let target;
    if (name2) {
      target = boards.find((b) => b?.name === name2);
    } else {
      try {
        target = await eda.dmt_Board.getCurrentBoardInfo() ?? void 0;
      } catch {
      }
    }
    if (!force) {
      const holder = boards.find((b) => b?.schematic?.uuid === schematicUuid && b?.name !== target?.name);
      if (holder) {
        throw new ActionError(
          ErrorCodes.INVALID_STATE,
          `Schematic ${schematicUuid} is already bound to board "${holder.name}". Rebinding here would MOVE it out of "${holder.name}" (a schematic can belong to only one board). Pass force=true only if you really want to move it.`
        );
      }
    }
    const oldName = target?.name;
    const oldSchematicUuid = target?.schematic?.uuid;
    const oldPcbUuid = target?.pcb?.uuid;
    if (oldName) {
      try {
        await eda.dmt_Board.deleteBoard(oldName);
      } catch (err) {
        throw edaError(err, `Failed to delete the stale Board "${oldName}" before rebinding.`);
      }
    }
    let newName;
    try {
      newName = await eda.dmt_Board.createBoard(schematicUuid, pcbUuid);
    } catch (err) {
      if (oldSchematicUuid || oldPcbUuid) {
        try {
          await eda.dmt_Board.createBoard(oldSchematicUuid, oldPcbUuid);
        } catch {
        }
      }
      throw edaError(err, "Failed to create the rebound Board (rolled back to the previous binding).");
    }
    if (!newName) {
      if (oldSchematicUuid || oldPcbUuid) {
        try {
          await eda.dmt_Board.createBoard(oldSchematicUuid, oldPcbUuid);
        } catch {
        }
      }
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "createBoard returned nothing (check the schematic/PCB UUIDs); rolled back to the previous binding.");
    }
    const wantName = name2 ?? oldName;
    if (wantName && wantName !== newName) {
      try {
        await eda.dmt_Board.modifyBoardName(newName, wantName);
        newName = wantName;
      } catch {
      }
    }
    return {
      result: {
        boardName: newName,
        schematicUuid,
        pcbUuid: pcbUuid ?? null,
        replaced: oldName ? { name: oldName, schematicUuid: oldSchematicUuid ?? null, pcbUuid: oldPcbUuid ?? null } : null
      }
    };
  };
  var pcbNewBoard = async (payload) => {
    let schematicUuid = optionalString(payload, "schematicUuid") ?? optionalString(payload, "schematic");
    const force = optionalBoolean(payload, "force") === true;
    if (!schematicUuid) {
      try {
        schematicUuid = (await eda.dmt_Board.getCurrentBoardInfo())?.schematic?.uuid;
      } catch {
      }
      if (!schematicUuid) {
        try {
          schematicUuid = (await eda.dmt_Board.getAllBoardsInfo())?.[0]?.schematic?.uuid;
        } catch {
        }
      }
    }
    if (!schematicUuid) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'No schematic to bind \u2014 pass "schematicUuid" (no current board to infer one from).');
    }
    if (!force) {
      let boundBoardName;
      try {
        const boards = await eda.dmt_Board.getAllBoardsInfo() ?? [];
        boundBoardName = boards.find((b) => b?.schematic?.uuid === schematicUuid)?.name;
      } catch {
      }
      if (boundBoardName) {
        throw new ActionError(
          ErrorCodes.INVALID_STATE,
          `Schematic ${schematicUuid} is already bound to board "${boundBoardName}". Creating a new board would MOVE it out of "${boundBoardName}" (a schematic can belong to only one board), leaving "${boundBoardName}" with just its PCB. To lay out a fresh PCB for this schematic, work inside "${boundBoardName}"; pass force=true only if you really want to move the schematic into a new board.`
        );
      }
    }
    let boardName;
    try {
      boardName = await eda.dmt_Board.createBoard(schematicUuid);
    } catch (err) {
      throw edaError(err, "Failed to create the board shell.");
    }
    if (!boardName) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "createBoard returned nothing (check the schematicUuid).");
    }
    let pcbUuid;
    try {
      pcbUuid = await eda.dmt_Pcb.createPcb(boardName);
    } catch (err) {
      try {
        await eda.dmt_Board.deleteBoard(boardName);
      } catch {
      }
      throw edaError(err, "Failed to create the PCB in the new board.");
    }
    if (!pcbUuid) {
      try {
        await eda.dmt_Board.deleteBoard(boardName);
      } catch {
      }
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "createPcb returned nothing \u2014 this EasyEDA build did not create a PCB (SDK no-op).");
    }
    const wantName = optionalString(payload, "name");
    if (wantName) {
      try {
        await eda.dmt_Board.modifyBoardName(boardName, wantName);
        boardName = wantName;
      } catch {
      }
    }
    let pcbName;
    try {
      pcbName = (await eda.dmt_Pcb.getAllPcbsInfo() ?? []).find((p) => p.uuid === pcbUuid)?.name;
    } catch {
    }
    return { result: { boardName, pcbName, pcbUuid, schematicUuid } };
  };
  var boardNew = async (payload) => {
    const projectUuid = requireString(payload, "projectUuid");
    const wantName = optionalString(payload, "name");
    let current;
    let boards;
    try {
      current = await eda.dmt_Project.getCurrentProjectInfo();
      boards = await eda.dmt_Board.getAllBoardsInfo() ?? [];
    } catch (err) {
      throw edaError(err, "Failed to read the current project before creating a Board.");
    }
    if (current?.uuid !== projectUuid) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Current project is ${current?.uuid ?? "unknown"}, not the requested ${projectUuid}; nothing was created.`);
    }
    if (wantName && boards.some((b) => b?.name === wantName)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `A Board named "${wantName}" already exists; nothing was created.`);
    }
    const created = {};
    const rollback = async () => {
      const notes = [];
      const attempt = async (label, run) => {
        try {
          notes.push(`${label}: ${await run() ? "deleted" : "host returned false"}`);
        } catch (err) {
          notes.push(`${label}: threw ${err instanceof Error ? err.message : String(err)}`);
        }
      };
      if (created.pcbUuid) await attempt(`pcb ${created.pcbUuid}`, () => eda.dmt_Pcb.deletePcb(created.pcbUuid));
      if (created.boardName) await attempt(`board ${created.boardName}`, () => eda.dmt_Board.deleteBoard(created.boardName));
      if (created.schematicUuid) await attempt(`schematic ${created.schematicUuid}`, () => eda.dmt_Schematic.deleteSchematic(created.schematicUuid));
      return notes;
    };
    const fail3 = async (step, err) => {
      const notes = await rollback();
      const cause = err === void 0 ? "host returned nothing" : err instanceof Error ? err.message : String(err);
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `board.new failed at ${step} (${cause}); rolled back what this call created \u2014 verify with board.list before retrying.`, `rollback: ${notes.join("; ") || "nothing to undo"}`);
    };
    try {
      created.schematicUuid = await eda.dmt_Schematic.createSchematic();
    } catch (err) {
      return fail3("createSchematic", err);
    }
    if (!created.schematicUuid) return fail3("createSchematic");
    try {
      created.boardName = await eda.dmt_Board.createBoard(created.schematicUuid);
    } catch (err) {
      return fail3("createBoard", err);
    }
    if (!created.boardName) return fail3("createBoard");
    try {
      created.pcbUuid = await eda.dmt_Pcb.createPcb(created.boardName);
    } catch (err) {
      return fail3("createPcb", err);
    }
    if (!created.pcbUuid) return fail3("createPcb");
    let pageUuid;
    try {
      pageUuid = (await eda.dmt_Schematic.getSchematicInfo(created.schematicUuid))?.page?.[0]?.uuid ?? await eda.dmt_Schematic.createSchematicPage(created.schematicUuid);
    } catch (err) {
      return fail3("createSchematicPage", err);
    }
    if (!pageUuid) return fail3("createSchematicPage");
    let boardName = created.boardName;
    const warnings = [];
    const notApplied = [];
    const createdName = boardName;
    let renameReturned;
    if (wantName && wantName !== createdName) {
      try {
        renameReturned = await eda.dmt_Board.modifyBoardName(createdName, wantName);
      } catch {
        renameReturned = false;
      }
    }
    const deadline = Date.now() + 5e3;
    let board;
    let pages = [];
    let pcbListed = false;
    for (; ; ) {
      try {
        const all = await eda.dmt_Board.getAllBoardsInfo() ?? [];
        const renamed = wantName && wantName !== createdName ? all.find((b) => b?.name === wantName) : void 0;
        board = renamed ?? all.find((b) => b?.name === createdName);
        boardName = board?.name ?? (renameReturned ? wantName : createdName);
        pages = ((await eda.dmt_Schematic.getSchematicInfo(created.schematicUuid))?.page ?? []).map((p) => ({ uuid: p.uuid, name: p.name }));
        pcbListed = (await eda.dmt_Pcb.getAllPcbsInfo() ?? []).some((p) => p.uuid === created.pcbUuid);
      } catch {
      }
      const verified = board?.schematic?.uuid === created.schematicUuid && board?.pcb?.uuid === created.pcbUuid && pages.some((p) => p.uuid === pageUuid) && pcbListed;
      const nameSettled = !wantName || boardName === wantName || !renameReturned;
      if (verified && nameSettled || Date.now() >= deadline) {
        if (wantName && boardName !== wantName) {
          notApplied.push("name");
          warnings.push(`Board was created as "${boardName}"; the host ${renameReturned ? "reported the rename to" : "refused to rename it to"} "${wantName}" but the readback still lists "${boardName}" \u2014 rename it later or delete it with board.delete.`);
        }
        if (!verified) warnings.push("Created documents did not all appear in the fresh board/document readback; inspect board.list before retrying.");
        return {
          result: {
            boardName,
            schematicUuid: created.schematicUuid,
            schematicName: board?.schematic?.name ?? null,
            schematicPageUuid: pageUuid,
            schematicPages: pages,
            pcbUuid: created.pcbUuid,
            pcbName: board?.pcb?.name ?? null,
            projectUuid,
            ...wantName ? { requestedName: wantName } : {},
            ...notApplied.length ? { notApplied } : {},
            partial: !verified || notApplied.length > 0,
            verified
          },
          warnings: warnings.length ? warnings : void 0
        };
      }
      await sleep(500);
    }
  };
  var systemNotify = async (payload) => {
    const message = requireString(payload, "message");
    const raw = (optionalString(payload, "type") ?? "info").toLowerCase();
    const kind = raw === "warning" ? "warn" : raw;
    const allowed = /* @__PURE__ */ new Set(["info", "success", "warn", "error", "question"]);
    const t = allowed.has(kind) ? kind : "info";
    const timer = optionalNumber(payload, "duration") ?? 3;
    try {
      eda.sys_Message.showToastMessage(message, t, timer);
    } catch (err) {
      throw edaError(err, "Failed to show the notification toast.");
    }
    return { result: { shown: true, message, type: t } };
  };
  var IMPORT_CONFIRM_DIALOG_TITLES = [
    "\u786E\u8BA4\u5BFC\u5165\u4FE1\u606F",
    "Confirm Importing changes information"
  ];
  var IMPORT_CONFIRM_APPLY_LABELS = [
    "\u5E94\u7528\u4FEE\u6539",
    "Apply Changes"
  ];
  function importConfirmStepSource(titles = IMPORT_CONFIRM_DIALOG_TITLES, applyLabels = IMPORT_CONFIRM_APPLY_LABELS, apply = true) {
    const norm = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();
    return `
		const norm = s => String(s || '').replace(/\\s+/g, ' ').trim().toLowerCase();
		const titles = ${JSON.stringify(titles.map(norm))};
		const applyLabels = ${JSON.stringify(applyLabels.map(norm))};
		const modals = Array.from(document.querySelectorAll('.arco-modal, [class*=modal]'))
			.filter(e => e.offsetParent !== null && titles.some(t => norm(e.innerText).includes(t)));
		if (!modals.length) return 'none';
		${apply ? "" : "return 'present';"}
		const btn = modals.flatMap(m => Array.from(m.querySelectorAll('button')))
			.find(b => applyLabels.includes(norm(b.innerText)) && b.offsetParent !== null);
		if (!btn) return 'no-button';
		btn.click();
		return 'clicked';
	`;
  }
  async function clickImportConfirm(timeoutMs, clock = {
    now: () => Date.now(),
    pause: sleep
  }, landed) {
    const AsyncFunction = Object.getPrototypeOf(async () => {
    }).constructor;
    const step = new AsyncFunction(importConfirmStepSource());
    const observe = new AsyncFunction(importConfirmStepSource(void 0, void 0, false));
    const deadline = clock.now() + timeoutMs;
    while (clock.now() < deadline) {
      const r = await step();
      if (r === "clicked") {
        const closeBy = clock.now() + 1e4;
        while (clock.now() < closeBy) {
          if (await observe() === "none") return "applied";
          if (landed && await landed()) return "applied";
          await clock.pause(250);
        }
        return "dialog-open";
      }
      if (r === "no-button") return "no-button";
      await clock.pause(250);
    }
    return "no-dialog";
  }
  function pcbEmbeddedParent(id, componentIds) {
    return componentIds.find((cid) => id.startsWith(cid) && /^e\d+$/.test(id.slice(cid.length)));
  }
  function pcbImportDuplicateIdentities(components) {
    const groups = /* @__PURE__ */ new Map();
    for (const component of components) {
      if (!component.uniqueId) continue;
      const ids = groups.get(component.uniqueId) ?? [];
      ids.push(component.primitiveId);
      groups.set(component.uniqueId, ids);
    }
    return [...groups].filter(([, ids]) => ids.length > 1).map(([uniqueId, primitiveIds]) => ({ uniqueId, primitiveIds }));
  }
  var pcbImportChanges = async (payload) => {
    const schematicUuid = optionalString(payload, "schematicUuid");
    const ensureBoard = optionalBoolean(payload, "ensureBoard") !== false;
    const recomputeRatline = optionalBoolean(payload, "recomputeRatline") !== false;
    const autoConfirm = optionalBoolean(payload, "confirm") !== false;
    let board;
    try {
      board = await eda.dmt_Board.getCurrentBoardInfo();
    } catch {
      board = void 0;
    }
    let createdBoard = false;
    if (!board && ensureBoard) {
      let pcbUuid;
      try {
        pcbUuid = (await eda.dmt_Pcb.getCurrentPcbInfo())?.uuid;
      } catch {
      }
      try {
        await eda.dmt_Board.createBoard(schematicUuid, pcbUuid);
        board = await eda.dmt_Board.getCurrentBoardInfo();
        createdBoard = !!board;
      } catch (err) {
        throw edaError(err, "Failed to create a Board linking the schematic and PCB.");
      }
    }
    const countComponents = async () => {
      try {
        return (await eda.pcb_PrimitiveComponent.getAll() ?? []).length;
      } catch {
        return -1;
      }
    };
    const componentsBefore = await countComponents();
    const inventorySignature = async () => {
      try {
        return (await eda.pcb_PrimitiveComponent.getAll() ?? []).map((c) => c.getState_UniqueId() || c.getState_PrimitiveId()).sort().join("|");
      } catch {
        return void 0;
      }
    };
    const inventoryBefore = await inventorySignature();
    let dialogLagged = false;
    const inventoryChanged = async () => {
      if (inventoryBefore === void 0) return false;
      const now = await inventorySignature();
      dialogLagged = now !== void 0 && now !== inventoryBefore;
      return dialogLagged;
    };
    const importPromise = eda.pcb_Document.importChanges(schematicUuid).catch(() => false);
    let confirmOutcome = "skipped";
    if (autoConfirm) {
      confirmOutcome = await clickImportConfirm(8e3, void 0, inventoryChanged);
    }
    let imported;
    let apiTimedOut = false;
    imported = await Promise.race([
      importPromise,
      sleep(12e3).then(() => void 0)
    ]);
    if (imported === void 0) {
      apiTimedOut = true;
      imported = confirmOutcome === "applied";
    }
    let componentsAfter = await countComponents();
    if (confirmOutcome === "applied") {
      const settleBy = Date.now() + 1e4;
      while (Date.now() < settleBy) {
        await sleep(1e3);
        const again = await countComponents();
        if (again === componentsAfter && again !== componentsBefore) break;
        componentsAfter = again;
      }
    }
    let duplicateUniqueIds = [];
    let identityInventoryAvailable = false;
    try {
      const inventory = await eda.pcb_PrimitiveComponent.getAll();
      if (Array.isArray(inventory)) {
        duplicateUniqueIds = pcbImportDuplicateIdentities(inventory.map((component) => ({
          uniqueId: component.getState_UniqueId(),
          primitiveId: component.getState_PrimitiveId()
        })));
        identityInventoryAvailable = true;
      }
    } catch {
    }
    const noChanges = imported === true && confirmOutcome === "no-dialog" && componentsAfter === componentsBefore;
    const verified = imported === true && (confirmOutcome === "applied" || noChanges) && identityInventoryAvailable && duplicateUniqueIds.length === 0 && componentsAfter >= 0;
    const partial2 = !verified && (imported === true || confirmOutcome === "dialog-open");
    if (verified && recomputeRatline) {
      try {
        await eda.pcb_Document.startCalculatingRatline();
      } catch {
      }
    }
    return {
      result: {
        imported,
        confirm: confirmOutcome,
        // true: applied judged by the changed inventory while the modal was
        // still closing (background tab), not by the modal disappearing.
        ...dialogLagged && confirmOutcome === "applied" ? { dialogLagged: true } : {},
        noChanges,
        apiTimedOut,
        componentsBefore,
        componentsAfter,
        confirmationClickCount: confirmOutcome === "applied" || confirmOutcome === "dialog-open" ? 1 : 0,
        identityInventoryAvailable,
        duplicateUniqueIds,
        partial: partial2,
        verified,
        createdBoard,
        // Read schematic/pcb defensively: a Board can legitimately hold only one
        // side (e.g. after a rebuild the schematic ref may be a deleted/orphaned
        // UUID), so `board.schematic.uuid` would crash — mirror serializeBoard.
        board: board ? { name: board.name, schematicUuid: board.schematic?.uuid ?? null, pcbUuid: board.pcb?.uuid ?? null } : null,
        reason: partial2 ? "import not verified: confirmation dialog still open, duplicate uniqueIds, or unreadable identity inventory; preserve returned IDs and fresh state, do not repeat import" : imported ? confirmOutcome === "no-button" ? 'the \u786E\u8BA4\u5BFC\u5165\u4FE1\u606F / "Confirm Importing changes information" dialog is open but its \u5E94\u7528\u4FEE\u6539 / "Apply Changes" button was not found \u2014 stop and inspect the dialog/readback; update the typed import handler before retrying' : null : "importChanges returned false \u2014 the PCB may be floating (no linked schematic) or schematicUuid is invalid."
      }
    };
  };
  var pcbComponentAttrsBackfill = async (payload) => {
    const overwrite = optionalBoolean(payload, "overwrite") === true;
    let comps;
    try {
      comps = await eda.pcb_PrimitiveComponent.getAll();
    } catch (err) {
      throw edaError(err, "Failed to list PCB components.");
    }
    const parts = [];
    const noLcsc = [];
    for (const comp of comps ?? []) {
      let designator = "";
      let lcsc = "";
      try {
        designator = String(comp.getState_Designator() ?? "");
        lcsc = String(comp.getState_SupplierId() ?? "");
      } catch {
        continue;
      }
      if (!designator) continue;
      if (/^C\d+$/.test(lcsc)) parts.push({ comp, designator, lcsc });
      else noLcsc.push(designator);
    }
    const attrsByLcsc = /* @__PURE__ */ new Map();
    const distinct = [...new Set(parts.map((p) => p.lcsc))];
    for (let i = 0; i < distinct.length; i += 20) {
      const batch = distinct.slice(i, i + 20);
      let raw = [];
      try {
        raw = await eda.lib_Device.getByLcscIds(batch);
      } catch {
      }
      for (const r of Array.isArray(raw) ? raw : []) {
        const id = String(r.supplierId ?? r.otherProperty?.["Supplier Part"] ?? "");
        const op = r.otherProperty;
        if (/^C\d+$/.test(id) && op && typeof op === "object") attrsByLcsc.set(id, op);
      }
    }
    const projectedStateKeys = PROJECTED_STATE_KEYS;
    const updated = [];
    const unresolved = [];
    for (const { comp, designator, lcsc } of parts) {
      const source = attrsByLcsc.get(lcsc);
      if (!source) {
        unresolved.push(designator);
        continue;
      }
      let current = {};
      try {
        current = comp.getState_OtherProperty() ?? {};
      } catch {
      }
      const filled = [];
      const merged = { ...current };
      for (const [key, value] of Object.entries(source)) {
        if (projectedStateKeys.has(key)) continue;
        if (value === void 0 || value === null || value === "") continue;
        const existing = current[key];
        if (!overwrite && existing !== void 0 && existing !== null && existing !== "") continue;
        if (existing === value) continue;
        merged[key] = value;
        filled.push(key);
      }
      if (typeof merged["Designator"] === "string" && merged["Designator"].includes("?")) {
        delete merged["Designator"];
        filled.push("Designator (stale placeholder removed)");
      }
      if (!filled.length) continue;
      try {
        await eda.pcb_PrimitiveComponent.modify(comp.getState_PrimitiveId(), { designator, otherProperty: merged });
        updated.push({ designator, lcsc, filledKeys: filled.sort() });
      } catch {
      }
    }
    return {
      result: {
        updatedCount: updated.length,
        partsWithLcsc: parts.length,
        updated,
        ...unresolved.length ? { unresolvedDesignators: unresolved } : {},
        ...noLcsc.length ? { noLcscDesignators: noLcsc } : {}
      }
    };
  };
  var pcbAddComponent = async (payload) => {
    const dev = payload.device;
    const libraryUuid2 = optionalString(payload, "libraryUuid") ?? dev?.libraryUuid;
    const uuid = optionalString(payload, "uuid") ?? dev?.uuid;
    if (!libraryUuid2 || !uuid) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "device is required: pass libraryUuid + uuid (a device {libraryUuid, uuid}).");
    }
    const layer = optionalNumber(payload, "layer") ?? 1;
    const x = requireNumber(payload, "x");
    const y = requireNumber(payload, "y");
    const rotation = optionalNumber(payload, "rotation");
    const designator = optionalString(payload, "designator");
    const uniqueId = optionalString(payload, "uniqueId");
    const nets = payload.nets && typeof payload.nets === "object" ? payload.nets : {};
    let comp;
    try {
      comp = await eda.pcb_PrimitiveComponent.create({ libraryUuid: libraryUuid2, uuid }, layer, x, y, rotation, false);
    } catch (err) {
      throw edaError(err, "Failed to place the component footprint on the PCB.");
    }
    if (!comp) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "PCB component create returned no primitive (check device uuid / layer).");
    }
    const id = comp.getState_PrimitiveId();
    const prop = {};
    if (designator) prop.designator = designator;
    if (uniqueId) prop.uniqueId = uniqueId;
    if (Object.keys(prop).length) {
      try {
        await eda.pcb_PrimitiveComponent.modify(id, prop);
      } catch {
      }
    }
    let assignedNets = 0;
    const unmatched = [];
    let pads = [];
    try {
      pads = await eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(id) ?? [];
    } catch {
      pads = [];
    }
    for (const p of pads) {
      const num = String(p.getState_PadNumber?.() ?? "");
      const net = num ? nets[num] : void 0;
      if (net) {
        try {
          await eda.pcb_PrimitivePad.modify(p.getState_PrimitiveId(), { net });
          assignedNets++;
        } catch {
          unmatched.push(num);
        }
      }
    }
    let embeddedVias;
    try {
      const rects = [];
      for (const p of pads) {
        const num = String(p.getState_PadNumber?.() ?? "");
        const net = num ? nets[num] : void 0;
        if (!net) continue;
        const ext = padExtent(p);
        if (!ext) continue;
        const px = p.getState_X(), py = p.getState_Y();
        rects.push({ net, minX: px - ext.width / 2, minY: py - ext.height / 2, maxX: px + ext.width / 2, maxY: py + ext.height / 2 });
      }
      if (rects.length) {
        const allVias = await eda.pcb_PrimitiveVia.getAll() ?? [];
        const wanted = /* @__PURE__ */ new Map();
        for (const v of allVias) {
          if (String(v.getState_Net?.() ?? "").trim() !== "") continue;
          const vx = v.getState_X(), vy = v.getState_Y();
          const hit = rects.find((r) => vx >= r.minX && vx <= r.maxX && vy >= r.minY && vy <= r.maxY);
          if (hit) wanted.set(v.getState_PrimitiveId(), hit.net);
        }
        if (wanted.size) {
          const failed = [];
          for (const [vid, net] of wanted) {
            try {
              await eda.pcb_PrimitiveVia.modify(vid, { net });
            } catch {
              failed.push(vid);
            }
          }
          let verified = 0;
          try {
            const after = await eda.pcb_PrimitiveVia.getAll() ?? [];
            for (const v of after) {
              const want = wanted.get(v.getState_PrimitiveId());
              if (want && String(v.getState_Net?.() ?? "") === want) verified++;
            }
          } catch {
            verified = -1;
          }
          embeddedVias = { assigned: wanted.size - failed.length, verified, failed };
        }
      }
    } catch {
    }
    try {
      await eda.pcb_Document.startCalculatingRatline();
    } catch {
    }
    const warnings = [];
    try {
      const board = await eda.dmt_Board.getCurrentBoardInfo();
      const boundSchUuid = board?.schematic?.uuid;
      if (boundSchUuid) {
        const schematics = await eda.dmt_Schematic.getAllSchematicsInfo() ?? [];
        if (!schematics.some((s) => s.uuid === boundSchUuid)) {
          warnings.push(
            `Board "${board?.name}" is bound to schematic ${boundSchUuid}, which is not among the open schematics \u2014 DRC may report a false Netlist Error. Run \`easyeda board rebind --schematic <uuid> --pcb <uuid>\` to repair the binding.`
          );
        }
      }
    } catch {
    }
    let actualDesignator = null;
    let actualUniqueId = null;
    let bindingVerified = false;
    try {
      const inventory = await eda.pcb_PrimitiveComponent.getAll();
      const fresh = Array.isArray(inventory) ? inventory.find((c) => c.getState_PrimitiveId() === id) : void 0;
      if (fresh) {
        actualDesignator = fresh.getState_Designator() ?? null;
        actualUniqueId = fresh.getState_UniqueId() ?? null;
        bindingVerified = (!designator || actualDesignator === designator) && (!uniqueId || actualUniqueId === uniqueId);
      }
    } catch {
    }
    if (!bindingVerified) warnings.push("Placed component identity/link could not be verified; inspect this primitive ID before retrying.");
    return {
      result: {
        primitiveId: id,
        designator: actualDesignator,
        uniqueId: actualUniqueId,
        bindingVerified,
        ...!bindingVerified ? { partial: true } : {},
        padCount: (pads ?? []).length,
        assignedNets,
        unmatchedPads: unmatched,
        ...embeddedVias ? { embeddedVias } : {}
      },
      ...warnings.length ? { warnings } : {}
    };
  };
  var DSN_RESOLUTION = 1e3;
  function dsnRound(v) {
    return Math.round(v * DSN_RESOLUTION) / DSN_RESOLUTION;
  }
  function vertsFromPolygonSource(src) {
    if (!Array.isArray(src)) return [];
    const nums = [];
    for (const t of src) if (typeof t === "number") nums.push(t);
    const verts = [];
    for (let i = 0; i + 1 < nums.length; i += 2) verts.push([nums[i], nums[i + 1]]);
    return verts;
  }
  function parseDsnBoundaryMin(dsn) {
    const m = dsn.match(/\(\s*boundary\s*\(\s*path\s+\S+\s+[\d.eE+-]+((?:\s+[\d.eE+-]+)+)\s*\)/);
    if (!m) return null;
    const nums = m[1].trim().split(/\s+/).map(Number).filter((n) => !Number.isNaN(n));
    let minX = Infinity, minY = Infinity;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      minX = Math.min(minX, nums[i]);
      minY = Math.min(minY, nums[i + 1]);
    }
    return Number.isFinite(minX) && Number.isFinite(minY) ? { x: minX, y: minY } : null;
  }
  function dsnLayerName(layer) {
    if (layer === 1) return "TopLayer";
    if (layer === 2) return "BottomLayer";
    return "signal";
  }
  function spliceIntoStructure(dsn, block) {
    const start = dsn.indexOf("(structure");
    if (start < 0) return dsn;
    let depth = 0;
    for (let i = start; i < dsn.length; i++) {
      if (dsn[i] === "(") depth++;
      else if (dsn[i] === ")") {
        depth--;
        if (depth === 0) return dsn.slice(0, i) + block + "\n  " + dsn.slice(i);
      }
    }
    return dsn;
  }
  async function injectRegionKeepouts(dsn) {
    const regions = await eda.pcb_PrimitiveRegion.getAll();
    if (!regions || !regions.length) return { text: dsn, count: 0 };
    const boundaryMin = parseDsnBoundaryMin(dsn);
    let bboxMin = { x: 0, y: 0 };
    try {
      const polys = await eda.pcb_PrimitivePolyline.getAll(void 0, BOARD_OUTLINE_LAYER);
      if (polys.length) {
        const bb = await eda.pcb_Primitive.getPrimitivesBBox(polys.map((p) => p.getState_PrimitiveId()));
        if (bb) bboxMin = { x: bb.minX, y: bb.minY };
      }
    } catch {
    }
    const offX = (boundaryMin ? boundaryMin.x : 0) - bboxMin.x;
    const offY = (boundaryMin ? boundaryMin.y : 0) - bboxMin.y;
    const routingRules = /* @__PURE__ */ new Set([5, 6, 7]);
    const clauses = [];
    for (const r of regions) {
      const rules = r.getState_RuleType() ?? [];
      if (!rules.some((v) => routingRules.has(v))) continue;
      const cp = r.getState_ComplexPolygon();
      const src = typeof cp?.getSource === "function" ? cp.getSource() : cp?.polygon;
      const verts = vertsFromPolygonSource(src);
      if (verts.length < 3) continue;
      const coords = verts.map(([x, y]) => `${dsnRound(x + offX)} ${dsnRound(y + offY)}`).join(" ");
      const name2 = r.getState_RegionName() || `region_keepout_${clauses.length + 1}`;
      clauses.push(`    (keepout "${name2}" (polygon ${dsnLayerName(r.getState_Layer())} 0 ${coords}))`);
    }
    if (!clauses.length) return { text: dsn, count: 0 };
    return { text: spliceIntoStructure(dsn, "\n" + clauses.join("\n")), count: clauses.length };
  }
  var pcbExportDsn = async (payload) => {
    const fileName = optionalString(payload, "fileName") ?? "design.dsn";
    const inject = payload.injectKeepout !== false;
    let file;
    try {
      file = await eda.pcb_ManufactureData.getDsnFile(fileName);
    } catch (err) {
      throw edaError(err, "Failed to export DSN.");
    }
    if (!file) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        "DSN export returned no file \u2014 the PCB may be empty or have no nets (run pcb.import_changes first)."
      );
    }
    let text2 = await file.text();
    let keepouts = 0;
    if (inject) {
      try {
        const injected = await injectRegionKeepouts(text2);
        text2 = injected.text;
        keepouts = injected.count;
      } catch {
      }
    }
    const outFile = new File([text2], file.name || fileName, { type: "text/plain" });
    const artifact = await blobToArtifact(outFile, "pcb_dsn", file.name || fileName, "text/plain");
    return { result: { artifactId: artifact.id, fileName: file.name || fileName, size: outFile.size, keepouts }, artifacts: [artifact] };
  };
  var pcbImportAutoroute = async (payload) => {
    const format = (optionalString(payload, "format") ?? "ses").toLowerCase();
    const base64 = requireString(payload, "fileBase64");
    const fileName = optionalString(payload, "fileName") ?? (format === "json" ? "route.json" : "route.ses");
    let file;
    try {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      file = new File([bytes], fileName);
    } catch (err) {
      throw edaError(err, "Failed to decode the routed file (expected base64 in fileBase64).");
    }
    let imported;
    try {
      imported = format === "json" ? await eda.pcb_Document.importAutoRouteJsonFile(file) : await eda.pcb_Document.importAutoRouteSesFile(file);
    } catch (err) {
      throw edaError(err, "Failed to import the autoroute result file.");
    }
    if (imported) {
      try {
        await eda.pcb_Document.startCalculatingRatline();
      } catch {
      }
    }
    return {
      result: {
        imported: Boolean(imported),
        format,
        reason: imported ? null : "importAutoRoute* returned false \u2014 wrong format, stale DSN, or net/layer mismatch."
      }
    };
  };
  var pcbViewFilterGet = async () => {
    const documentApi = eda.pcb_Document;
    if (typeof documentApi.getCurrentFilterConfiguration !== "function") {
      throw new ActionError(
        ErrorCodes.EDA_API_UNAVAILABLE,
        "This EasyEDA host does not expose pcb_Document.getCurrentFilterConfiguration(). No view state was changed."
      );
    }
    let configuration;
    try {
      configuration = await documentApi.getCurrentFilterConfiguration();
    } catch (err) {
      throw edaError(err, "Failed to read the PCB canvas filter configuration.");
    }
    if (!configuration || typeof configuration !== "object" || Array.isArray(configuration)) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        "PCB canvas filter getter returned no configuration. No view state was changed."
      );
    }
    return {
      result: {
        configuration,
        readable: true,
        writable: false,
        componentAttributesVisible: null,
        componentAttributesPath: null,
        api: {
          getter: "eda.pcb_Document.getCurrentFilterConfiguration",
          setter: null
        },
        note: "The public SDK has no filter setter. Do not modify pcb_PrimitiveAttribute visibility as a workaround because that changes design data."
      }
    };
  };
  function pcbSnapshotFitMode(payload) {
    const requested = optionalString(payload, "fitMode");
    if (requested !== void 0) {
      if (requested === "board" || requested === "all" || requested === "none") return requested;
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        '"fitMode" must be "board", "all", or "none".'
      );
    }
    const legacyFit = optionalBoolean(payload, "fit");
    if (legacyFit !== void 0) return legacyFit ? "all" : "none";
    return "board";
  }
  async function fitPcbSnapshotViewport(requested) {
    if (requested === "none") return { requested, applied: "none", fitted: false, api: null };
    if (requested === "board") {
      try {
        const ok = await eda.pcb_Document.zoomToBoardOutline();
        if (ok !== false) {
          return { requested, applied: "board", fitted: true, api: "eda.pcb_Document.zoomToBoardOutline" };
        }
      } catch {
      }
    }
    try {
      await eda.dmt_EditorControl.zoomToAllPrimitives();
      return {
        requested,
        applied: "all",
        fitted: true,
        api: "eda.dmt_EditorControl.zoomToAllPrimitives",
        ...requested === "board" ? { fallbackReason: "zoomToBoardOutline unavailable or returned false" } : {}
      };
    } catch {
      return {
        requested,
        applied: "none",
        fitted: false,
        api: null,
        fallbackReason: `${requested} fit failed; captured the current viewport`
      };
    }
  }
  var pcbSnapshot = async (payload) => {
    if (pageVisibility() === "hidden") {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        "The EasyEDA tab is hidden, so the canvas is not repainted and a capture would be stale (nothing was captured). Bring the EasyEDA window to the front and retry, or render from fresh readback (no tracks/pours): `easyeda pcb dump --include-copper --out board.json && easyeda pcb layout render --actual --board board.json --out board.svg`. Schematic pages export in the background with `easyeda sch export-image`."
      );
    }
    const tabId = optionalString(payload, "tabId");
    const fitMode = pcbSnapshotFitMode(payload);
    const previousSha = optionalString(payload, "previousSha256");
    let fitState = await fitPcbSnapshotViewport(fitMode);
    await waitForCanvasSettle();
    const capture = async () => {
      let b;
      try {
        b = await eda.dmt_EditorControl.getCurrentRenderedAreaImage(tabId);
      } catch (err) {
        throw edaError(err, "Failed to capture PCB snapshot.");
      }
      if (!b) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "PCB snapshot returned no image.");
      }
      return b;
    };
    let blob = await capture();
    let sha256 = await blobSha256(blob);
    let staleRetry = false;
    if (previousSha && sha256 && sha256 === previousSha) {
      staleRetry = true;
      try {
        await eda.pcb_Document.startCalculatingRatline();
      } catch {
      }
      fitState = await fitPcbSnapshotViewport(fitMode);
      await waitForCanvasSettle();
      blob = await capture();
      sha256 = await blobSha256(blob);
    }
    const stale = Boolean(previousSha && sha256 && sha256 === previousSha);
    const artifact = await blobToArtifact(blob, "pcb_snapshot", "pcb-snapshot.png", "image/png");
    return {
      result: {
        artifactId: artifact.id,
        fitted: fitState.fitted,
        fitModeRequested: fitState.requested,
        fitModeApplied: fitState.applied,
        fitApi: fitState.api,
        fitFallbackReason: fitState.fallbackReason ?? null,
        captureKind: fitState.applied === "board" ? "board-fitted-viewport-png" : fitState.applied === "all" ? "all-primitives-fitted-viewport-png" : "current-viewport-png",
        objectLevelExport: false,
        sha256,
        stale,
        staleRetry,
        capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
        staleHint: "EasyEDA may not auto-redraw after API edits. Thread this sha256 back as previousSha256 on the next snapshot to auto-detect a stale frame; judge state by data (pcb list/drc), screenshot for layout only."
      },
      artifacts: [artifact]
    };
  };
  var PCB_COMPONENT_PATCH_READBACK = {
    layer: "layer",
    x: "x",
    y: "y",
    rotation: "rotation",
    primitiveLock: "locked",
    addIntoBom: "addIntoBom",
    designator: "designator",
    name: "name",
    uniqueId: "uniqueId",
    manufacturerId: "manufacturerId",
    supplierId: "supplierId",
    manufacturer: null,
    supplier: null,
    otherProperty: null
  };
  var PCB_COMPONENT_PATCH_ALIASES = {
    locked: "primitiveLock",
    lock: "primitiveLock"
  };
  function normalizePcbComponentPatch(raw) {
    const out = {};
    const unknown = [];
    for (const [rawKey, value] of Object.entries(raw)) {
      const key = PCB_COMPONENT_PATCH_ALIASES[rawKey] ?? rawKey;
      if (!(key in PCB_COMPONENT_PATCH_READBACK)) {
        unknown.push(rawKey);
        continue;
      }
      if (key in out && out[key] !== value) {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          `Patch sets "${key}" twice with conflicting values (an alias like "locked" maps onto "primitiveLock").`
        );
      }
      out[key] = value;
    }
    if (unknown.length > 0) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Unknown patch field(s): ${unknown.join(", ")}. The platform silently ignores unknown keys and still reports success (#174), so they are rejected here. Valid keys: ${Object.keys(PCB_COMPONENT_PATCH_READBACK).join(", ")} (aliases: locked/lock \u2192 primitiveLock).`
      );
    }
    if (Object.keys(out).length === 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "Patch object is empty \u2014 nothing to modify.");
    }
    if ("layer" in out) out.layer = pcbComponentLayerId(out.layer);
    return out;
  }
  function pcbComponentLayerId(value) {
    if (value === 1 || value === 2) return value;
    if (typeof value === "string") {
      const name2 = value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
      if (name2 === "top" || name2 === "top layer" || name2 === "1") return 1;
      if (name2 === "bottom" || name2 === "bottom layer" || name2 === "2") return 2;
    }
    throw new ActionError(
      ErrorCodes.PRECONDITION_REFUSED,
      `Component layer ${JSON.stringify(value)} is not a component side; use "top"/"bottom" or 1/2. Nothing was modified.`
    );
  }
  var normDeg = (v) => (v % 360 + 360) % 360;
  function verifyPcbComponentPatch(patch, readback) {
    const v = { applied: [], notApplied: [], unverified: [] };
    for (const [field, expected] of Object.entries(patch)) {
      const readKey = PCB_COMPONENT_PATCH_READBACK[field];
      if (readKey === null || readKey === void 0) {
        v.unverified.push(field);
        continue;
      }
      const actual = readback[readKey];
      let ok;
      if (field === "layer" && typeof expected !== "number") {
        ok = null;
      } else if (typeof expected === "number" && typeof actual === "number") {
        ok = field === "rotation" ? Math.abs(normDeg(expected) - normDeg(actual)) < 1e-3 : Math.abs(expected - actual) < 1e-3;
      } else if (expected === null) {
        ok = actual === null || actual === void 0 || actual === "";
      } else {
        ok = actual === expected;
      }
      if (ok === null) v.unverified.push(field);
      else if (ok) v.applied.push(field);
      else v.notApplied.push({ field, expected, actual });
    }
    return v;
  }
  var pcbComponentModify = async (payload) => {
    const primitiveId = requireString(payload, "primitiveId");
    const rawPatch = payload.patch;
    if (typeof rawPatch !== "object" || rawPatch === null || Array.isArray(rawPatch)) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing required object field "patch".');
    }
    const patch = normalizePcbComponentPatch(rawPatch);
    const inventory = await eda.pcb_PrimitiveComponent.getAll();
    if (!Array.isArray(inventory)) throw new ActionError(ErrorCodes.INVALID_STATE, "PCB component inventory unavailable; modification was not dispatched.");
    if (!inventory.some((c) => c.getState_PrimitiveId() === primitiveId)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `PCB component primitive ID not found: ${primitiveId}. Pull fresh IDs from pcb list; no modification was dispatched.`);
    }
    let component;
    try {
      component = await eda.pcb_PrimitiveComponent.modify(
        primitiveId,
        patch
      );
    } catch (err) {
      throw edaError(err, "Failed to modify PCB component.");
    }
    if (!component) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Failed to modify PCB component "${primitiveId}".`);
    }
    const freshRead = async () => {
      try {
        const c = await eda.pcb_PrimitiveComponent.get(primitiveId);
        return c ? serializePcbComponent(c) : null;
      } catch {
        return null;
      }
    };
    let readback = await freshRead();
    let verification = readback ? verifyPcbComponentPatch(patch, readback) : null;
    let lockFallback = false;
    if (verification?.notApplied.some((f) => f.field === "primitiveLock")) {
      lockFallback = true;
      try {
        const c = await eda.pcb_PrimitiveComponent.get(primitiveId);
        if (c) {
          c.setState_PrimitiveLock(patch.primitiveLock === true);
          await c.done();
        }
      } catch {
      }
      readback = await freshRead() ?? readback;
      verification = readback ? verifyPcbComponentPatch(patch, readback) : verification;
    }
    if (verification && verification.applied.length === 0 && verification.notApplied.length > 0) {
      const detail = verification.notApplied.map((f) => `${f.field}: wrote ${JSON.stringify(f.expected)}, read back ${JSON.stringify(f.actual)}`).join("; ");
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `modify reported success but the readback shows no patched field was applied (${detail}). The platform accepts and drops such writes without erroring (#174).`
      );
    }
    const result = {
      component: readback ?? serializePcbComponent(component),
      verified: verification !== null && verification.notApplied.length === 0
    };
    if (verification) {
      result.applied = verification.applied;
      if (verification.notApplied.length > 0) result.notApplied = verification.notApplied;
      if (verification.unverified.length > 0) result.unverified = verification.unverified;
    }
    if (lockFallback) result.lockFallback = true;
    return { result };
  };
  function classifyLockReadback(written, freshLockById, locked) {
    const applied = [];
    const notApplied = [];
    for (const id of written) {
      if (freshLockById.get(id) === locked) applied.push(id);
      else notApplied.push(id);
    }
    return { applied, notApplied };
  }
  var pcbComponentLock = async (payload) => {
    const locked = optionalBoolean(payload, "locked") ?? true;
    const rawIds = payload.primitiveIds;
    let ids;
    if (typeof rawIds === "string") ids = [rawIds];
    else if (Array.isArray(rawIds) && rawIds.every((id) => typeof id === "string") && rawIds.length > 0) {
      ids = [...new Set(rawIds)];
    } else {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Missing required field "primitiveIds" (string or non-empty string[]).'
      );
    }
    let comps;
    try {
      comps = await eda.pcb_PrimitiveComponent.get(ids);
    } catch (err) {
      throw edaError(err, "Failed to read the components to lock/unlock.");
    }
    const byId = new Map((comps ?? []).map((c) => [c.getState_PrimitiveId(), c]));
    const missing = ids.filter((id) => !byId.has(id));
    if (byId.size === 0) {
      throw new ActionError(
        ErrorCodes.INVALID_STATE,
        `None of the ${ids.length} primitiveId(s) exist on the active PCB \u2014 pull fresh ids via pcb.components.list.`
      );
    }
    const alreadyInState = [];
    const written = [];
    const writeFailed = [];
    for (const [id, c] of byId) {
      try {
        if (c.getState_PrimitiveLock() === locked) {
          alreadyInState.push(id);
          continue;
        }
        c.setState_PrimitiveLock(locked);
        await c.done();
        written.push(id);
      } catch {
        writeFailed.push(id);
      }
    }
    const freshLockById = /* @__PURE__ */ new Map();
    if (written.length > 0) {
      let fresh = [];
      try {
        fresh = await eda.pcb_PrimitiveComponent.get(written);
      } catch {
        fresh = [];
      }
      for (const c of fresh ?? []) freshLockById.set(c.getState_PrimitiveId(), c.getState_PrimitiveLock());
    }
    const { applied, notApplied } = classifyLockReadback(written, freshLockById, locked);
    notApplied.push(...writeFailed);
    if (applied.length === 0 && alreadyInState.length === 0 && notApplied.length > 0) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `The ${locked ? "lock" : "unlock"} write did not stick on any of the ${notApplied.length} component(s) (readback still reports locked=${!locked}). Nothing changed on the canvas.`
      );
    }
    return {
      result: {
        locked,
        requested: ids.length,
        applied,
        alreadyInState,
        notApplied,
        missing,
        verified: notApplied.length === 0
      }
    };
  };
  var pcbComponentDelete = async (payload) => {
    const primitiveIds = payload.primitiveIds;
    if (!(typeof primitiveIds === "string") && !(Array.isArray(primitiveIds) && primitiveIds.every((id) => typeof id === "string"))) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        'Missing required field "primitiveIds" (string or string[]).'
      );
    }
    const requested = typeof primitiveIds === "string" ? [primitiveIds] : primitiveIds;
    if (requested.length === 0 || requested.some((id) => !id)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "PCB component deletion requires non-empty primitive IDs.");
    }
    let components;
    try {
      components = await eda.pcb_PrimitiveComponent.getAll();
    } catch (err) {
      throw edaError(err, "Failed to verify PCB component IDs before deletion.");
    }
    if (!Array.isArray(components)) {
      throw new ActionError(ErrorCodes.INVALID_STATE, "PCB component inventory unavailable; deletion was not dispatched.");
    }
    const liveIds = new Set(components.map((component) => component.getState_PrimitiveId()));
    const missing = [...new Set(requested)].filter((id) => !liveIds.has(id));
    if (missing.length > 0) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `PCB component primitive ID(s) not found: ${missing.join(", ")}. Pull fresh IDs from pcb list; no deletion was dispatched.`
      );
    }
    let deleted;
    try {
      deleted = await eda.pcb_PrimitiveComponent.delete(primitiveIds);
    } catch (err) {
      throw edaError(err, "Failed to delete PCB components.");
    }
    return { result: { deleted } };
  };
  var PCB_CLEAR_SCOPES = ["components", "routing", "copper", "regions", "silk"];
  var PCB_BOARD_OUTLINE_LAYER = 11;
  var onPcbCopperLayer = (layer) => layer === 1 || layer === 2 || layer >= 15 && layer <= 44;
  var isPcbSilkLayer = (layer) => layer === PCB_TOP_SILK || layer === PCB_BOTTOM_SILK;
  function pcbPrimLocked(p) {
    const f = p.getState_PrimitiveLock;
    try {
      return typeof f === "function" ? f.call(p) === true : false;
    } catch {
      return false;
    }
  }
  function pcbPrimLayer(p) {
    const f = p.getState_Layer;
    try {
      return typeof f === "function" ? Number(f.call(p)) : NaN;
    } catch {
      return NaN;
    }
  }
  var PCB_CLEAR_KINDS = [
    { key: "components", scope: "components", getAll: () => eda.pcb_PrimitiveComponent.getAll(), del: (ids) => eda.pcb_PrimitiveComponent.delete(ids) },
    { key: "tracks", scope: "routing", getAll: () => eda.pcb_PrimitiveLine.getAll(), del: (ids) => eda.pcb_PrimitiveLine.delete(ids), filter: (p) => onPcbCopperLayer(pcbPrimLayer(p)) },
    { key: "arcs", scope: "routing", getAll: () => eda.pcb_PrimitiveArc.getAll(), del: (ids) => eda.pcb_PrimitiveArc.delete(ids), filter: (p) => onPcbCopperLayer(pcbPrimLayer(p)) },
    { key: "vias", scope: "routing", getAll: () => eda.pcb_PrimitiveVia.getAll(), del: (ids) => eda.pcb_PrimitiveVia.delete(ids) },
    { key: "pours", scope: "copper", getAll: () => eda.pcb_PrimitivePour.getAll(), del: (ids) => eda.pcb_PrimitivePour.delete(ids) },
    { key: "fills", scope: "copper", getAll: () => eda.pcb_PrimitiveFill.getAll(), del: (ids) => eda.pcb_PrimitiveFill.delete(ids) },
    { key: "regions", scope: "regions", getAll: () => eda.pcb_PrimitiveRegion.getAll(), del: (ids) => eda.pcb_PrimitiveRegion.delete(ids) },
    { key: "silkStrings", scope: "silk", getAll: () => eda.pcb_PrimitiveString.getAll(), del: (ids) => eda.pcb_PrimitiveString.delete(ids), filter: (p) => isPcbSilkLayer(pcbPrimLayer(p)) },
    { key: "silkLines", scope: "silk", getAll: () => eda.pcb_PrimitiveLine.getAll(), del: (ids) => eda.pcb_PrimitiveLine.delete(ids), filter: (p) => isPcbSilkLayer(pcbPrimLayer(p)) },
    { key: "silkArcs", scope: "silk", getAll: () => eda.pcb_PrimitiveArc.getAll(), del: (ids) => eda.pcb_PrimitiveArc.delete(ids), filter: (p) => isPcbSilkLayer(pcbPrimLayer(p)) }
  ];
  var PCB_OUTLINE_KINDS = [
    { key: "outlineLines", getAll: () => eda.pcb_PrimitiveLine.getAll(), del: (ids) => eda.pcb_PrimitiveLine.delete(ids), filter: (p) => pcbPrimLayer(p) === PCB_BOARD_OUTLINE_LAYER },
    { key: "outlineArcs", getAll: () => eda.pcb_PrimitiveArc.getAll(), del: (ids) => eda.pcb_PrimitiveArc.delete(ids), filter: (p) => pcbPrimLayer(p) === PCB_BOARD_OUTLINE_LAYER },
    { key: "outlinePolylines", getAll: () => eda.pcb_PrimitivePolyline.getAll(), del: (ids) => eda.pcb_PrimitivePolyline.delete(ids), filter: (p) => pcbPrimLayer(p) === PCB_BOARD_OUTLINE_LAYER }
  ];
  function parsePcbClearScopes(raw) {
    if (raw === void 0 || raw === null || raw === "") return [...PCB_CLEAR_SCOPES];
    const list = Array.isArray(raw) ? raw : String(raw).split(",");
    const wanted = list.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
    if (!wanted.length) return [...PCB_CLEAR_SCOPES];
    const invalid2 = wanted.filter((s) => !PCB_CLEAR_SCOPES.includes(s));
    if (invalid2.length) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `Unknown clear scope(s): ${invalid2.join(", ")}. Valid: ${PCB_CLEAR_SCOPES.join(", ")}.`
      );
    }
    return PCB_CLEAR_SCOPES.filter((s) => wanted.includes(s));
  }
  var PCB_CLEAR_MAX_ROUNDS = 5;
  var pcbPageClear = async (payload) => {
    const dryRun = optionalBoolean(payload, "dryRun") === true;
    const includeLocked = optionalBoolean(payload, "includeLocked") === true;
    const preserveOutline = optionalBoolean(payload, "preserveOutline") !== false;
    const scopes = parsePcbClearScopes(payload.only);
    const active = new Set(scopes);
    const targets = [];
    for (const kind of PCB_CLEAR_KINDS) {
      if (kind.scope && active.has(kind.scope)) targets.push({ kind, ignoreLock: false });
    }
    if (!preserveOutline) {
      for (const kind of PCB_OUTLINE_KINDS) targets.push({ kind, ignoreLock: true });
    }
    const idsByKey = {};
    const seenByKey = {};
    const skippedLocked = {};
    const warnings = [];
    const failedSet = /* @__PURE__ */ new Set();
    const componentIds = /* @__PURE__ */ new Set();
    const embeddedSkipped = /* @__PURE__ */ new Set();
    const collect = async (kind, ignoreLock, countLocked) => {
      let items;
      try {
        items = await kind.getAll() ?? [];
      } catch (err) {
        warnings.push(warnText(`enumerate ${kind.key}`, err));
        return [];
      }
      const ids = [];
      for (const p of items) {
        if (kind.filter && !kind.filter(p)) continue;
        if (kind.key === "vias") {
          const id = p.getState_PrimitiveId();
          if (pcbEmbeddedParent(id, [...componentIds])) {
            embeddedSkipped.add(id);
            continue;
          }
        }
        if (!ignoreLock && !includeLocked && pcbPrimLocked(p)) {
          if (countLocked) skippedLocked[kind.key] = (skippedLocked[kind.key] ?? 0) + 1;
          continue;
        }
        ids.push(p.getState_PrimitiveId());
      }
      return ids;
    };
    const record3 = (key, ids) => {
      const seen = seenByKey[key] ??= /* @__PURE__ */ new Set();
      for (const id of ids) {
        if (seen.has(id)) continue;
        seen.add(id);
        (idsByKey[key] ??= []).push(id);
      }
    };
    const delByKey = /* @__PURE__ */ new Map();
    for (const kind of [...PCB_CLEAR_KINDS, ...PCB_OUTLINE_KINDS]) delByKey.set(kind.key, kind.del);
    const maxRounds = dryRun ? 1 : PCB_CLEAR_MAX_ROUNDS;
    let rounds = 0;
    let leftover = 0;
    for (let r = 0; r < maxRounds; r++) {
      rounds++;
      try {
        for (const c of await eda.pcb_PrimitiveComponent.getAll() ?? []) componentIds.add(c.getState_PrimitiveId());
      } catch (err) {
        warnings.push(warnText("enumerate components for embedded-via ownership", err));
      }
      const round = {};
      let found = 0;
      for (const { kind, ignoreLock } of targets) {
        if (failedSet.has(kind.key)) continue;
        const ids = await collect(kind, ignoreLock, rounds === 1);
        if (!ids.length) continue;
        round[kind.key] = ids;
        found += ids.length;
      }
      if (dryRun) {
        for (const [key, ids] of Object.entries(round)) record3(key, ids);
        break;
      }
      leftover = found;
      if (!found) break;
      for (const [key, ids] of Object.entries(round)) {
        record3(key, ids);
        const del = delByKey.get(key);
        if (!del) continue;
        try {
          const ok = await del(ids);
          if (ok === false) {
            failedSet.add(key);
            warnings.push(`delete ${key}: batch delete returned false \u2014 ${ids.length} primitive(s) may remain`);
          }
        } catch (err) {
          failedSet.add(key);
          warnings.push(warnText(`delete ${key}`, err));
        }
      }
    }
    if (!dryRun && rounds >= maxRounds && leftover > 0) {
      warnings.push(`clear did not converge after ${rounds} round(s) \u2014 ${leftover} primitive(s) still enumerated on the last pass; save + \`easyeda doc reload\`, then re-run clear`);
    }
    const deleted = {};
    let total = 0;
    for (const [key, ids] of Object.entries(idsByKey)) {
      deleted[key] = ids.length;
      total += ids.length;
    }
    const skippedTotal = Object.values(skippedLocked).reduce((a, b) => a + b, 0);
    const failed = [...failedSet];
    return {
      result: {
        scopes,
        deleted,
        total,
        deletedIds: idsByKey,
        rounds,
        ...skippedTotal ? { skippedLocked, skippedLockedTotal: skippedTotal } : {},
        ...embeddedSkipped.size ? { skippedEmbeddedVias: embeddedSkipped.size } : {},
        ...failed.length ? { failed } : {},
        preserveOutline,
        includeLocked,
        dryRun,
        ...warnings.length ? { warnings } : {}
      }
    };
  };
  async function resolvePcbTargetIds(payload) {
    const raw = payload.primitiveIds;
    if (typeof raw === "string") return [raw];
    if (Array.isArray(raw) && raw.every((id) => typeof id === "string")) return raw;
    throw new ActionError(
      ErrorCodes.MISSING_PAYLOAD_FIELD,
      'Missing required field "primitiveIds" (string or string[]); layout ops never act on the canvas selection.'
    );
  }
  async function readPcbComponentLayout(id) {
    const component = await eda.pcb_PrimitiveComponent.get(id);
    if (!component) return null;
    const box = await eda.pcb_Primitive.getPrimitivesBBox([id]);
    if (!box) return null;
    return {
      id,
      designator: component.getState_Designator(),
      x: component.getState_X(),
      y: component.getState_Y(),
      box
    };
  }
  var pcbAlign = async (payload) => {
    const mode = requireString(payload, "mode");
    const ids = await resolvePcbTargetIds(payload);
    const items = (await Promise.all(ids.map(readPcbComponentLayout))).filter((i) => i !== null);
    if (items.length < 2) {
      throw new ActionError(
        ErrorCodes.MISSING_PAYLOAD_FIELD,
        `align needs >= 2 components (got ${items.length}); pass primitiveIds.`
      );
    }
    const cx = (b) => (b.minX + b.maxX) / 2;
    const cy = (b) => (b.minY + b.maxY) / 2;
    let targetFor;
    switch (mode) {
      case "left": {
        const t = Math.min(...items.map((i) => i.box.minX));
        targetFor = (i) => ({ x: i.x + (t - i.box.minX) });
        break;
      }
      case "right": {
        const t = Math.max(...items.map((i) => i.box.maxX));
        targetFor = (i) => ({ x: i.x + (t - i.box.maxX) });
        break;
      }
      // y-up: "top" is the larger y.
      case "top": {
        const t = Math.max(...items.map((i) => i.box.maxY));
        targetFor = (i) => ({ y: i.y + (t - i.box.maxY) });
        break;
      }
      case "bottom": {
        const t = Math.min(...items.map((i) => i.box.minY));
        targetFor = (i) => ({ y: i.y + (t - i.box.minY) });
        break;
      }
      case "centerX": {
        const t = items.reduce((s, i) => s + cx(i.box), 0) / items.length;
        targetFor = (i) => ({ x: i.x + (t - cx(i.box)) });
        break;
      }
      case "centerY": {
        const t = items.reduce((s, i) => s + cy(i.box), 0) / items.length;
        targetFor = (i) => ({ y: i.y + (t - cy(i.box)) });
        break;
      }
      default:
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          `Unknown align mode "${mode}"; expected left|right|top|bottom|centerX|centerY.`
        );
    }
    const moved = [];
    for (const it of items) {
      const t = targetFor(it);
      const nx = t.x ?? it.x;
      const ny = t.y ?? it.y;
      try {
        if (nx !== it.x || ny !== it.y) await eda.pcb_PrimitiveComponent.modify(it.id, { x: nx, y: ny });
      } catch (err) {
        throw edaError(err, `Failed to align component ${it.designator ?? it.id}.`);
      }
      moved.push({ primitiveId: it.id, designator: it.designator, from: { x: it.x, y: it.y }, to: { x: nx, y: ny } });
    }
    return { result: { mode, moved, count: moved.length } };
  };
  var pcbDistribute = async (payload) => {
    const axis = requireString(payload, "axis");
    if (axis !== "x" && axis !== "y") {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `Unknown axis "${axis}"; expected x or y.`);
    }
    const ids = await resolvePcbTargetIds(payload);
    const items = (await Promise.all(ids.map(readPcbComponentLayout))).filter((i) => i !== null);
    if (items.length < 3) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `distribute needs >= 3 components (got ${items.length}).`);
    }
    const center = (it) => axis === "x" ? (it.box.minX + it.box.maxX) / 2 : (it.box.minY + it.box.maxY) / 2;
    const sorted = [...items].sort((a, b) => center(a) - center(b));
    const first = center(sorted[0]);
    const last = center(sorted[sorted.length - 1]);
    const step = (last - first) / (sorted.length - 1);
    const moved = [];
    for (let i = 0; i < sorted.length; i++) {
      const it = sorted[i];
      const delta = first + i * step - center(it);
      const nx = axis === "x" ? it.x + delta : it.x;
      const ny = axis === "y" ? it.y + delta : it.y;
      try {
        if (i !== 0 && i !== sorted.length - 1 && Math.abs(delta) > 1e-6) {
          await eda.pcb_PrimitiveComponent.modify(it.id, { x: nx, y: ny });
        }
      } catch (err) {
        throw edaError(err, `Failed to distribute component ${it.designator ?? it.id}.`);
      }
      moved.push({ primitiveId: it.id, designator: it.designator, from: { x: it.x, y: it.y }, to: { x: nx, y: ny } });
    }
    return { result: { axis, moved, count: moved.length } };
  };
  var pcbGridSnap = async (payload) => {
    const grid = requireNumber(payload, "grid");
    if (grid <= 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `grid must be > 0 (got ${grid}).`);
    }
    const ids = await resolvePcbTargetIds(payload);
    if (ids.length === 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "No target components; pass primitiveIds.");
    }
    const snap = (v) => Math.round(v / grid) * grid;
    const snapped = [];
    for (const id of ids) {
      const component = await eda.pcb_PrimitiveComponent.get(id);
      if (!component) continue;
      const x = component.getState_X();
      const y = component.getState_Y();
      const nx = snap(x);
      const ny = snap(y);
      try {
        if (nx !== x || ny !== y) await eda.pcb_PrimitiveComponent.modify(id, { x: nx, y: ny });
      } catch (err) {
        throw edaError(err, `Failed to grid-snap component ${component.getState_Designator() ?? id}.`);
      }
      snapped.push({ primitiveId: id, designator: component.getState_Designator(), from: { x, y }, to: { x: nx, y: ny } });
    }
    return { result: { grid, snapped, count: snapped.length } };
  };
  var pcbComponentsMove = async (payload) => {
    const dx = requireNumber(payload, "dx");
    const dy = requireNumber(payload, "dy");
    const ids = await resolvePcbTargetIds(payload);
    if (ids.length === 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "No target components; pass primitiveIds.");
    }
    const moved = [];
    for (const id of ids) {
      const component = await eda.pcb_PrimitiveComponent.get(id);
      if (!component) continue;
      const x = component.getState_X();
      const y = component.getState_Y();
      const nx = x + dx;
      const ny = y + dy;
      try {
        await eda.pcb_PrimitiveComponent.modify(id, { x: nx, y: ny });
      } catch (err) {
        throw edaError(err, `Failed to move component ${component.getState_Designator() ?? id}.`);
      }
      moved.push({ primitiveId: id, designator: component.getState_Designator(), from: { x, y }, to: { x: nx, y: ny } });
    }
    return { result: { dx, dy, moved, count: moved.length } };
  };
  function isGlobalNetName(net) {
    return /^(?:[adp])?gnd$|^v(?:cc|dd|ss|in|out|bus|bat|sys|ref)\b|^[+-]?\d+v\d*$|^[+-]/i.test(net) || /gnd|vcc|vdd|vss/i.test(net);
  }
  function clusterByLocalNets(items) {
    const netToIdx = /* @__PURE__ */ new Map();
    items.forEach((it, idx) => {
      for (const n of it.nets) {
        if (!n || isGlobalNetName(n)) continue;
        const arr = netToIdx.get(n) ?? [];
        arr.push(idx);
        netToIdx.set(n, arr);
      }
    });
    const parent = items.map((_, i) => i);
    const find = (a) => {
      while (parent[a] !== a) {
        parent[a] = parent[parent[a]];
        a = parent[a];
      }
      return a;
    };
    const union = (a, b) => {
      parent[find(a)] = find(b);
    };
    for (const idxs of netToIdx.values()) {
      if (idxs.length < 2 || idxs.length > 8) continue;
      for (let i = 1; i < idxs.length; i++) union(idxs[0], idxs[i]);
    }
    const groups = /* @__PURE__ */ new Map();
    items.forEach((it, idx) => {
      const root = find(idx);
      const g = groups.get(root) ?? [];
      g.push(it);
      groups.set(root, g);
    });
    return [...groups.values()].sort((a, b) => b.length - a.length);
  }
  var pcbComponentsArrange = async (payload) => {
    const mode = optionalString(payload, "mode") ?? "cluster";
    const pitch = optionalNumber(payload, "pitch") ?? 50;
    const gutter = optionalNumber(payload, "gutter") ?? 150;
    const colsIn = optionalNumber(payload, "cols");
    const ids = await resolvePcbTargetIds(payload);
    if (ids.length < 2) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `arrange needs >= 2 components (got ${ids.length}); pass primitiveIds.`);
    }
    const items = [];
    for (const id of ids) {
      const component = await eda.pcb_PrimitiveComponent.get(id);
      if (!component) continue;
      const box = await eda.pcb_Primitive.getPrimitivesBBox([id]);
      if (!box) continue;
      let nets = [];
      try {
        const pads = await eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(id);
        nets = [...new Set((pads ?? []).map((p) => p.getState_Net()).filter((n) => Boolean(n)))];
      } catch {
      }
      items.push({
        id,
        designator: component.getState_Designator(),
        x: component.getState_X(),
        y: component.getState_Y(),
        box,
        locked: component.getState_PrimitiveLock(),
        nets
      });
    }
    const movable = items.filter((i) => !i.locked);
    if (movable.length === 0) {
      return { result: { mode, groups: 0, moved: [], count: 0, note: "all target components are locked" } };
    }
    const originX = Math.min(...movable.map((i) => i.box.minX));
    const originY = Math.max(...movable.map((i) => i.box.maxY));
    const groups = mode === "grid" ? [movable] : clusterByLocalNets(movable);
    const moved = [];
    let blockX = originX;
    for (const group of groups) {
      const cellW = Math.max(...group.map((i) => i.box.maxX - i.box.minX)) + pitch;
      const cellH = Math.max(...group.map((i) => i.box.maxY - i.box.minY)) + pitch;
      const cols = colsIn ?? Math.max(1, Math.ceil(Math.sqrt(group.length)));
      group.sort((a, b) => (a.designator ?? "").localeCompare(b.designator ?? "", void 0, { numeric: true }));
      for (let k = 0; k < group.length; k++) {
        const it = group[k];
        const col = k % cols;
        const row = Math.floor(k / cols);
        const cellCenterX = blockX + col * cellW + cellW / 2;
        const cellCenterY = originY - row * cellH - cellH / 2;
        const bcx = (it.box.minX + it.box.maxX) / 2;
        const bcy = (it.box.minY + it.box.maxY) / 2;
        const nx = cellCenterX - bcx + it.x;
        const ny = cellCenterY - bcy + it.y;
        try {
          await eda.pcb_PrimitiveComponent.modify(it.id, { x: nx, y: ny });
        } catch (err) {
          throw edaError(err, `Failed to arrange component ${it.designator ?? it.id}.`);
        }
        moved.push({ primitiveId: it.id, designator: it.designator, from: { x: it.x, y: it.y }, to: { x: nx, y: ny } });
      }
      const usedCols = Math.min(cols, group.length);
      blockX += usedCols * cellW + gutter;
    }
    return { result: { mode, groups: groups.length, moved, count: moved.length } };
  };
  var pcbDrcCheck = async (payload) => {
    const strict = optionalBoolean(payload, "strict") !== false;
    let violations;
    try {
      violations = await eda.pcb_Drc.check(strict, false, true);
    } catch (err) {
      throw edaError(err, "Failed to run PCB DRC (ensure the PCB document is the active/foreground tab).");
    }
    let binding;
    const hasNetlistError = violations.some((v) => JSON.stringify(v ?? "").toLowerCase().includes("netlist"));
    if (hasNetlistError) {
      try {
        const board = await eda.dmt_Board.getCurrentBoardInfo();
        if (board) {
          binding = {
            boardName: board.name,
            schematicUuid: board.schematic?.uuid ?? null,
            schematicName: board.schematic?.name ?? null,
            pcbUuid: board.pcb?.uuid ?? null,
            pcbName: board.pcb?.name ?? null,
            hint: "Netlist Error is often a stale Board binding \u2014 verify the schematic UUID matches the open schematic; if not, run `easyeda board rebind --schematic <uuid> --pcb <uuid>`."
          };
        }
      } catch {
      }
    }
    return { result: { passed: violations.length === 0, violations, ...binding ? { binding } : {} } };
  };
  var pcbDrcRules = async () => {
    let rules;
    try {
      rules = await eda.pcb_Drc.getCurrentRuleConfiguration();
    } catch (err) {
      throw edaError(err, "Failed to read PCB DRC rule configuration (ensure the PCB document is the active/foreground tab).");
    }
    return { result: { rules: rules ?? null } };
  };
  var pcbDrcRulesSet = async (payload) => writePcbRules(payload);
  async function writePcbRules(payload, expected) {
    const suppliedRuleConfiguration = payload.ruleConfiguration ?? payload.rules;
    const ruleConfiguration = barePcbRuleConfiguration(suppliedRuleConfiguration);
    if (!ruleConfiguration) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "ruleConfiguration must be a complete JSON object.");
    }
    const netRules = payload.netRules;
    if (netRules !== void 0 && !Array.isArray(netRules)) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "netRules must be an array when provided.");
    }
    let beforeRules = null;
    let beforeNetRules;
    try {
      beforeRules = barePcbRuleConfiguration(await eda.pcb_Drc.getCurrentRuleConfiguration());
      if (netRules !== void 0) beforeNetRules = await eda.pcb_Drc.getNetRules();
    } catch (err) {
      throw edaError(err, "Failed to read the current PCB rules before overwrite.");
    }
    if (!beforeRules || typeof beforeRules !== "object" || Array.isArray(beforeRules)) {
      throw new ActionError(ErrorCodes.INVALID_STATE, "Current PCB rule configuration is unavailable; refusing an overwrite that cannot be rolled back.");
    }
    if (netRules !== void 0 && !Array.isArray(beforeNetRules)) {
      throw new ActionError(ErrorCodes.INVALID_STATE, "Current PCB net rules are unavailable; refusing a two-stage overwrite that cannot be rolled back.");
    }
    if (payload.dryRun === true) {
      return { result: {
        dryRun: true,
        before: { ruleConfiguration: beforeRules, ...netRules === void 0 ? {} : { netRules: beforeNetRules } },
        requested: { ruleConfiguration, ...netRules === void 0 ? {} : { netRules } }
      } };
    }
    if (expected && (exactJSON(beforeRules) !== exactJSON(expected.ruleConfiguration) || netRules !== void 0 && exactJSON(beforeNetRules) !== exactJSON(expected.netRules))) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "PCB configuration changed during planning; read fresh state and retry. No write was attempted.");
    }
    const readActual = async () => {
      try {
        const actualRules = barePcbRuleConfiguration(await eda.pcb_Drc.getCurrentRuleConfiguration());
        const actualNetRules = netRules === void 0 ? void 0 : await eda.pcb_Drc.getNetRules();
        return {
          actual: { ruleConfiguration: actualRules ?? null, ...actualNetRules === void 0 ? {} : { netRules: actualNetRules } },
          error: null
        };
      } catch (err) {
        return { actual: null, error: describeThrown(err) };
      }
    };
    const rollback = async () => {
      let rollbackRulesWritten = false;
      let rollbackNetRulesWritten = netRules === void 0;
      const rollbackErrors = [];
      try {
        rollbackRulesWritten = await eda.pcb_Drc.overwriteCurrentRuleConfiguration(beforeRules);
      } catch (err) {
        rollbackErrors.push(`ruleConfiguration: ${describeThrown(err)}`);
      }
      if (netRules !== void 0) {
        try {
          rollbackNetRulesWritten = await eda.pcb_Drc.overwriteNetRules(beforeNetRules);
        } catch (err) {
          rollbackErrors.push(`netRules: ${describeThrown(err)}`);
        }
      }
      const finalReadback = await readActual();
      const rolledBack = !finalReadback.error && !!finalReadback.actual && pcbRulesEqual(finalReadback.actual.ruleConfiguration, beforeRules) && (netRules === void 0 || exactJSON(finalReadback.actual.netRules) === exactJSON(beforeNetRules));
      return { rollbackRulesWritten, rollbackNetRulesWritten, rollbackErrors, rolledBack, finalReadback };
    };
    let rulesWritten = false;
    try {
      rulesWritten = await eda.pcb_Drc.overwriteCurrentRuleConfiguration(ruleConfiguration);
    } catch (err) {
      const rollbackResult = await rollback();
      return {
        result: {
          partial: true,
          verified: false,
          rulesWritten: null,
          netRulesWritten: false,
          writeError: describeThrown(err),
          rollbackAttempted: true,
          rollbackRulesWritten: rollbackResult.rollbackRulesWritten,
          rollbackNetRulesWritten: rollbackResult.rollbackNetRulesWritten,
          rollbackErrors: rollbackResult.rollbackErrors,
          rolledBack: rollbackResult.rolledBack,
          actual: rollbackResult.finalReadback.actual,
          readbackError: rollbackResult.finalReadback.error
        },
        warnings: ["The rule-configuration write threw after the call began; rollback was attempted because mutation status was uncertain."]
      };
    }
    if (!rulesWritten) {
      const readback2 = await readActual();
      const changed = !!readback2.actual && !pcbRulesEqual(readback2.actual.ruleConfiguration, beforeRules);
      return {
        result: {
          partial: changed || !!readback2.error,
          writeFailed: true,
          verified: false,
          rulesWritten: false,
          netRulesWritten: false,
          actual: readback2.actual,
          readbackError: readback2.error
        },
        warnings: ["EasyEDA returned false while writing the rule configuration; net rules were not attempted."]
      };
    }
    let netRulesWritten = netRules === void 0;
    let netRulesWriteError = null;
    if (netRules !== void 0) {
      try {
        netRulesWritten = await eda.pcb_Drc.overwriteNetRules(netRules);
      } catch (err) {
        netRulesWriteError = describeThrown(err);
      }
    }
    if (!netRulesWritten || netRulesWriteError) {
      const rollbackResult = await rollback();
      return {
        result: {
          partial: true,
          verified: false,
          rulesWritten: true,
          netRulesWritten: netRulesWriteError ? null : false,
          ...netRulesWriteError ? { writeError: netRulesWriteError } : { writeFailed: true },
          rollbackAttempted: true,
          rollbackRulesWritten: rollbackResult.rollbackRulesWritten,
          rollbackNetRulesWritten: rollbackResult.rollbackNetRulesWritten,
          rollbackErrors: rollbackResult.rollbackErrors,
          rolledBack: rollbackResult.rolledBack,
          actual: rollbackResult.finalReadback.actual,
          readbackError: rollbackResult.finalReadback.error
        },
        warnings: ["The net-rule write failed after the rule configuration was written; both rule sets were rolled back and read back."]
      };
    }
    const readback = await readActual();
    if (readback.error || !readback.actual) {
      return {
        result: {
          partial: true,
          rulesWritten: true,
          netRulesWritten: true,
          verified: false,
          actual: readback.actual,
          readbackError: readback.error ?? "readback returned no data"
        },
        warnings: ["PCB rules were written, but final readback failed; the applied state is unavailable."]
      };
    }
    const ruleConfigurationVerified = pcbRulesEqual(readback.actual.ruleConfiguration, ruleConfiguration);
    const netRulesVerified = netRules === void 0 || exactJSON(readback.actual.netRules) === exactJSON(netRules);
    return {
      result: {
        rulesWritten,
        netRulesWritten,
        ruleConfigurationVerified,
        netRulesVerified,
        verified: rulesWritten && netRulesWritten && ruleConfigurationVerified && netRulesVerified,
        actual: readback.actual
      },
      ...rulesWritten && netRulesWritten && ruleConfigurationVerified && netRulesVerified ? {} : {
        warnings: ["EasyEDA reported both writes successful, but readback differs beyond machine roundoff; inspect actual before continuing."]
      }
    };
  }
  var readPcbConfig = async () => {
    const raw = await eda.pcb_Drc.getCurrentRuleConfiguration();
    const ruleConfiguration = barePcbRuleConfiguration(raw);
    const classes = await eda.pcb_Drc.getAllNetClasses();
    const netRules = await eda.pcb_Drc.getNetRules();
    if (!ruleConfiguration || !Array.isArray(classes) || !Array.isArray(netRules)) {
      throw new ActionError(ErrorCodes.INVALID_STATE, "PCB rules, net classes or net rules are unavailable.");
    }
    return JSON.parse(JSON.stringify({ ruleConfiguration, classes, netRules, configurationName: raw?.name ?? null }));
  };
  var pcbConfigGet = async () => ({ result: await readPcbConfig() });
  var pcbConfigSet = async (payload) => {
    const before = await readPcbConfig();
    const { changes, ...requested } = planPcbConfig(before, payload);
    if (payload.dryRun === true) return { result: { dryRun: true, before, requested, changes } };
    if (!changes.length) {
      const current = await readPcbConfig();
      if (exactJSON(current) !== exactJSON(before)) throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "PCB configuration changed during planning; no write was attempted.");
      return { result: { before, requested, changes, changed: false, verified: true, partial: false, actual: requested } };
    }
    if (payload.kind === "bind" && exactJSON(await eda.pcb_Drc.getAllNetClasses()) !== exactJSON(before.classes)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "PCB net classes changed during planning; no write was attempted.");
    }
    const result = await writePcbRules(requested, before);
    let verified = result.result?.verified === true;
    let classEvidence = {};
    if (payload.kind === "bind") {
      try {
        const actualClasses = await eda.pcb_Drc.getAllNetClasses();
        const classesVerified = exactJSON(actualClasses) === exactJSON(before.classes);
        verified = verified && classesVerified;
        classEvidence = { actualClasses, classesVerified };
      } catch (err) {
        verified = false;
        classEvidence = { classesVerified: false, classesReadbackError: describeThrown(err) };
      }
    }
    return { ...result, result: { ...result.result, before, requested, changes, ...classEvidence, verified, partial: !verified } };
  };
  var pcbNetClassList = async () => {
    try {
      const classes = await eda.pcb_Drc.getAllNetClasses() ?? [];
      const netRules = await eda.pcb_Drc.getNetRules() ?? [];
      return { result: { classes, netRules, count: classes.length } };
    } catch (err) {
      throw edaError(err, "Failed to list PCB net classes and their rule assignments.");
    }
  };
  var pcbNetClassCreate = async (payload) => {
    const name2 = requireString(payload, "name");
    const nets = [...new Set(requireStringArray(payload, "nets"))];
    if (!nets.length) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "nets must contain at least one PCB net name.");
    const allNets = new Set(await eda.pcb_Net.getAllNetsName() ?? []);
    const missing = nets.filter((n) => !allNets.has(n));
    if (missing.length) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `Net class ${name2} references missing net(s): ${missing.join(", ")}`);
    }
    const existing = (await eda.pcb_Drc.getAllNetClasses() ?? []).find((c) => c.name === name2);
    if (existing) {
      const requested = [...nets].sort();
      const actual = [...existing.nets ?? []].sort();
      if (exactJSON(requested) === exactJSON(actual)) {
        return { result: { created: false, alreadyExists: true, verified: true, netClass: existing } };
      }
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        `Net class ${name2} already exists with different members; use a different name or edit it explicitly in EasyEDA.`,
        `existing=${actual.join(",")} requested=${requested.join(",")}`
      );
    }
    const colorRaw = payload.color;
    const color = colorRaw && typeof colorRaw === "object" && !Array.isArray(colorRaw) ? colorRaw : { r: 0, g: 128, b: 255, alpha: 1 };
    let ok = false;
    try {
      ok = await eda.pcb_Drc.createNetClass(name2, nets, color);
    } catch (err) {
      throw edaError(err, `Failed to create PCB net class ${name2}.`);
    }
    const readback = (await eda.pcb_Drc.getAllNetClasses() ?? []).find((c) => c.name === name2);
    const verified = !!readback && exactJSON([...readback.nets ?? []].sort()) === exactJSON([...nets].sort());
    return {
      result: { created: ok, verified, netClass: readback ?? null },
      ...verified ? {} : { warnings: [`Net class ${name2} was not confirmed by readback; do not assume the rule assignment exists.`] }
    };
  };
  var pcbLineCreate = async (payload) => {
    const startX = requireNumber(payload, "startX");
    const startY = requireNumber(payload, "startY");
    const endX = requireNumber(payload, "endX");
    const endY = requireNumber(payload, "endY");
    const net = optionalString(payload, "net") ?? "";
    const lineWidth = optionalNumber(payload, "lineWidth") ?? 6;
    const layer = optionalNumber(payload, "layer") ?? 1;
    let line;
    try {
      line = await eda.pcb_PrimitiveLine.create(net, layer, startX, startY, endX, endY, lineWidth);
    } catch (err) {
      throw edaError(err, "Failed to create PCB track (\u5BFC\u7EBF).");
    }
    if (!line) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "PCB track creation returned no primitive (check the layer id and coordinates).");
    }
    return {
      result: {
        primitiveId: line.getState_PrimitiveId(),
        net,
        layer: Number(layer),
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        lineWidth
      }
    };
  };
  var pcbViaCreate = async (payload) => {
    const x = requireNumber(payload, "x");
    const y = requireNumber(payload, "y");
    const net = optionalString(payload, "net") ?? "";
    const holeDiameter = optionalNumber(payload, "holeDiameter") ?? 12;
    const diameter = optionalNumber(payload, "diameter") ?? 24;
    let via;
    try {
      via = await eda.pcb_PrimitiveVia.create(net, x, y, holeDiameter, diameter);
    } catch (err) {
      throw edaError(err, "Failed to create PCB via (\u8FC7\u5B54).");
    }
    if (!via) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "PCB via creation returned no primitive (check coordinates and diameters).");
    }
    return {
      result: {
        primitiveId: via.getState_PrimitiveId(),
        net,
        x,
        y,
        holeDiameter,
        diameter
      }
    };
  };
  var pcbSave = async (payload) => {
    await assertSaveContext(payload, "pcb");
    let saved;
    try {
      saved = await eda.pcb_Document.save();
    } catch (err) {
      throw edaError(err, "Failed to save PCB.");
    }
    return { result: { saved } };
  };
  function regionBoundaryWidth(payload) {
    const width = payload.lineWidth;
    if (width !== void 0 && width !== 0.2) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        "Region, pour and fill boundary width only supports 0.2mil; omit lineWidth or use 0.2. No primitive was created."
      );
    }
    return width;
  }
  var pcbPourCreate = async (payload) => {
    const lineWidth = regionBoundaryWidth(payload);
    if (payload.points === void 0 === (payload.source === void 0)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Pass exactly one of points or source, not both.");
    }
    let src;
    if (payload.source !== void 0) {
      if (!nativeRegionSegments(payload.source)) {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          "source must be one closed EasyEDA polygon contour using finite L/ARC commands (mil, signed sweep degrees)."
        );
      }
      src = [...payload.source];
    } else {
      const rawPts = payload.points;
      if (!Array.isArray(rawPts) || rawPts.length < 3) {
        throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "points must be an array of >= 3 [x,y] pairs (mil).");
      }
      const pts = [];
      for (const p of rawPts) {
        if (!Array.isArray(p) || p.length < 2 || typeof p[0] !== "number" || typeof p[1] !== "number") {
          throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "each point must be [x, y] numbers.");
        }
        pts.push([p[0], p[1]]);
      }
      src = [pts[0][0], pts[0][1], "L"];
      for (let i = 1; i < pts.length; i++) src.push(pts[i][0], pts[i][1]);
      src.push(pts[0][0], pts[0][1]);
    }
    const net = (optionalString(payload, "net") ?? "").trim();
    if (net === "") {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "net is required \u2014 a copper pour must bind to a net (e.g. GND). A netless pour is dead copper.");
    }
    const layer = optionalNumber(payload, "layer") ?? 1;
    const fillMap = { solid: "solid", grid: "90grid", grid45: "45grid" };
    const fill = fillMap[optionalString(payload, "fill") ?? "solid"] ?? "solid";
    const pourName = optionalString(payload, "name");
    const orderPlan = await preparePourOrder(payload.priority, Number(layer));
    const requestedSource = src.slice();
    const poly = eda.pcb_MathPolygon.createPolygon(src);
    if (!poly) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Failed to build pour polygon from points (createPolygon returned undefined \u2014 points must form a valid closed polygon).");
    }
    let pour;
    try {
      pour = await eda.pcb_PrimitivePour.create(net, layer, poly, fill, void 0, pourName, void 0, lineWidth);
    } catch (err) {
      throw edaError(err, "Failed to create copper pour (\u94FA\u94DC).");
    }
    if (!pour) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Copper pour creation returned no primitive (check layer/net/points).");
    }
    const primitiveId = pour.getState_PrimitiveId();
    let poured = false;
    let rebuildAttempted = false;
    let rebuildError;
    let orderProof;
    const readBoundary = async () => {
      const pours = await eda.pcb_PrimitivePour.getAll();
      if (!Array.isArray(pours)) throw new Error("Pour inventory unavailable after creation.");
      const matches = pours.filter((p) => p.getState_PrimitiveId() === primitiveId);
      if (matches.length !== 1) throw new Error("Created pour is missing or ambiguous in fresh readback.");
      const fresh = matches[0];
      let sdkPriority = null;
      let sdkPriorityReadError;
      try {
        sdkPriority = fresh.getState_PourPriority();
      } catch (err) {
        sdkPriorityReadError = describeThrown(err);
      }
      const actual = {
        primitiveId,
        net: fresh.getState_Net(),
        layer: fresh.getState_Layer(),
        fill: fresh.getState_PourFillMethod(),
        pourName: fresh.getState_PourName() ?? null,
        priority: sdkPriority,
        ...sdkPriorityReadError ? { sdkPriorityReadError } : {},
        lineWidth: fresh.getState_LineWidth(),
        locked: fresh.getState_PrimitiveLock(),
        source: fresh.getState_ComplexPolygon().getSource()
      };
      const differences = [];
      if (actual.net !== net) differences.push("net");
      if (actual.layer !== Number(layer)) differences.push("layer");
      if (actual.fill !== String(fill)) differences.push("fill");
      if (pourName !== void 0 && actual.pourName !== pourName) differences.push("pourName");
      if (lineWidth !== void 0 && actual.lineWidth !== lineWidth) differences.push("lineWidth");
      if (!(payload.source === void 0 ? equivalentLinearRegionGeometry(requestedSource, actual.source) : equivalentNativeRegionGeometry(requestedSource, actual.source))) differences.push("geometry");
      return { fresh, actual, differences };
    };
    try {
      let state = await readBoundary();
      if (state.differences.length === 0) {
        if (orderPlan) {
          orderProof = await applyAndVerifyPourOrder(orderPlan, state.fresh);
          state = await readBoundary();
        }
      }
      if (state.differences.length === 0) {
        rebuildAttempted = true;
        try {
          poured = !!await state.fresh.rebuildCopperRegion();
        } catch (err) {
          rebuildError = describeThrown(err);
        }
        state = await readBoundary();
        if (orderPlan && orderProof) orderProof = await verifyPourOrderReadback(orderPlan, orderProof);
      }
      return { result: {
        ...state.actual,
        ...orderProof ? {
          sdkPriority: state.actual.priority,
          priority: orderProof.nativeOrder,
          prioritySource: "native-source",
          priorityVerified: true,
          orderProof
        } : { prioritySource: "sdk", priorityVerified: false },
        poured,
        rebuildAttempted,
        ...rebuildError ? { rebuildError } : {},
        verified: state.differences.length === 0,
        ...state.differences.length ? { partial: true, differences: state.differences } : {}
      } };
    } catch (err) {
      return {
        result: {
          primitiveId,
          poured,
          rebuildAttempted,
          ...err instanceof PourOrderError ? { orderProof: err.evidence } : orderProof ? { orderProof } : {},
          ...rebuildError ? { rebuildError } : {},
          partial: true,
          verified: false,
          error: describeThrown(err)
        },
        warnings: ["Pour was created but boundary readback failed; inspect this ID before retrying."]
      };
    }
  };
  var pcbPourList = async (payload) => {
    const net = optionalString(payload, "net");
    let pours;
    try {
      pours = await eda.pcb_PrimitivePour.getAll(net);
    } catch (err) {
      throw edaError(err, "Failed to list copper pours.");
    }
    const list = (pours ?? []).map((p) => {
      let source = null;
      let geometryAvailable = false;
      try {
        source = p.getState_ComplexPolygon().getSource();
        geometryAvailable = Array.isArray(source);
      } catch {
      }
      return {
        primitiveId: p.getState_PrimitiveId(),
        net: p.getState_Net(),
        layer: p.getState_Layer(),
        pourName: p.getState_PourName(),
        fillMethod: p.getState_PourFillMethod(),
        priority: p.getState_PourPriority(),
        lineWidth: p.getState_LineWidth(),
        locked: p.getState_PrimitiveLock(),
        geometryAvailable,
        source
      };
    });
    return { result: { pours: list, count: list.length } };
  };
  var POURED_NATIVE_TO_MIL = 10;
  function pouredFinite(value, label) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `Materialized poured polygon ${label} is not a finite number.`
      );
    }
    return value;
  }
  function normalizePouredFlatSource(raw) {
    if (raw.length === 0) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Materialized poured polygon contour is empty.");
    }
    if (typeof raw[0] === "string") {
      if (raw[0] === "R") {
        if (raw.length !== 7) {
          throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Materialized poured R contour must contain x, y, width, height, rotation and round.");
        }
        const n = raw.slice(1).map((v, i) => pouredFinite(v, `R[${i}]`));
        return [
          "R",
          n[0] * POURED_NATIVE_TO_MIL,
          n[1] * POURED_NATIVE_TO_MIL,
          n[2] * POURED_NATIVE_TO_MIL,
          n[3] * POURED_NATIVE_TO_MIL,
          n[4],
          n[5] * POURED_NATIVE_TO_MIL
        ];
      }
      if (raw[0] === "CIRCLE") {
        if (raw.length !== 4) {
          throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Materialized poured CIRCLE contour must contain cx, cy and radius.");
        }
        return [
          "CIRCLE",
          pouredFinite(raw[1], "CIRCLE.cx") * POURED_NATIVE_TO_MIL,
          pouredFinite(raw[2], "CIRCLE.cy") * POURED_NATIVE_TO_MIL,
          pouredFinite(raw[3], "CIRCLE.radius") * POURED_NATIVE_TO_MIL
        ];
      }
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        `Materialized poured polygon starts with unsupported command ${raw[0]}.`
      );
    }
    if (raw.length < 5) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Materialized poured polygon contour is too short.");
    }
    const out = [
      pouredFinite(raw[0], "start.x") * POURED_NATIVE_TO_MIL,
      pouredFinite(raw[1], "start.y") * POURED_NATIVE_TO_MIL
    ];
    for (let i = 2; i < raw.length; ) {
      const command = raw[i];
      if (typeof command !== "string") {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Materialized poured polygon command at index ${i} is invalid.`
        );
      }
      out.push(command);
      i++;
      switch (command) {
        case "L":
        case "C": {
          const first = i;
          while (i < raw.length && typeof raw[i] !== "string") {
            out.push(pouredFinite(raw[i], `${command}[${i - first}]`) * POURED_NATIVE_TO_MIL);
            i++;
          }
          const count = i - first;
          const valid = command === "L" ? count >= 2 && count % 2 === 0 : count >= 6 && count % 6 === 0;
          if (!valid) {
            throw new ActionError(
              ErrorCodes.EDA_CALL_FAILED,
              `Materialized poured ${command} command has an invalid coordinate count (${count}).`
            );
          }
          break;
        }
        case "ARC":
        case "CARC": {
          if (i + 2 >= raw.length) {
            throw new ActionError(
              ErrorCodes.EDA_CALL_FAILED,
              `Materialized poured ${command} command is incomplete.`
            );
          }
          out.push(
            pouredFinite(raw[i], `${command}.sweep`),
            pouredFinite(raw[i + 1], `${command}.endX`) * POURED_NATIVE_TO_MIL,
            pouredFinite(raw[i + 2], `${command}.endY`) * POURED_NATIVE_TO_MIL
          );
          i += 3;
          break;
        }
        default:
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Materialized poured polygon command ${command} is unsupported.`
          );
      }
    }
    return out;
  }
  function normalizePouredStrictComplexSource(raw) {
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        "Materialized poured polygon source must be a non-empty array."
      );
    }
    const hasNested = raw.some(Array.isArray);
    if (!hasNested) return normalizePouredFlatSource(raw);
    if (!raw.every(Array.isArray)) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        "Materialized poured polygon source mixes contour arrays with flat tokens."
      );
    }
    return raw.map((contour) => normalizePouredStrictComplexSource(contour));
  }
  var pcbPouredList = async (payload) => {
    const net = optionalString(payload, "net");
    let poured;
    let pours;
    try {
      poured = await eda.pcb_PrimitivePoured.getAll();
      pours = await eda.pcb_PrimitivePour.getAll();
    } catch (err) {
      throw edaError(err, "Failed to read materialized poured copper.");
    }
    if (!Array.isArray(poured)) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        "Materialized poured copper inventory is unavailable (expected an array, including [] for known-empty)."
      );
    }
    if (!Array.isArray(pours)) {
      throw new ActionError(
        ErrorCodes.EDA_CALL_FAILED,
        "Copper pour boundary inventory is unavailable (expected an array, including [] for known-empty)."
      );
    }
    const boundary = /* @__PURE__ */ new Map();
    for (let i = 0; i < pours.length; i++) {
      const p = pours[i];
      let primitiveId;
      let boundaryNet;
      let boundaryLayer;
      try {
        primitiveId = p.getState_PrimitiveId();
        boundaryNet = p.getState_Net();
        boundaryLayer = p.getState_Layer();
      } catch (err) {
        throw edaError(err, `Copper pour boundary[${i}] attribution is unreadable.`);
      }
      if (typeof primitiveId !== "string" || primitiveId.trim() === "") {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Copper pour boundary[${i}] has no readable primitiveId.`);
      }
      if (typeof boundaryNet !== "string" || boundaryNet.trim() === "") {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Copper pour boundary ${primitiveId} has no readable net.`);
      }
      if (typeof boundaryLayer !== "number" || !Number.isFinite(boundaryLayer) || !Number.isInteger(boundaryLayer) || !(boundaryLayer === 1 || boundaryLayer === 2 || boundaryLayer >= 15 && boundaryLayer <= 44)) {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Copper pour boundary ${primitiveId} has no readable copper layer.`
        );
      }
      if (boundary.has(primitiveId)) {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Copper pour boundary attribution is ambiguous: duplicate primitiveId ${primitiveId}.`
        );
      }
      boundary.set(primitiveId, { net: boundaryNet, layer: boundaryLayer });
    }
    const list = [];
    for (let i = 0; i < poured.length; i++) {
      const p = poured[i];
      let primitiveId;
      let pourPrimitiveId;
      let rawFills;
      try {
        primitiveId = p.getState_PrimitiveId();
        pourPrimitiveId = p.getState_PourPrimitiveId();
        rawFills = p.getState_PourFills();
      } catch (err) {
        throw edaError(err, `Materialized poured object[${i}] attribution or fills are unreadable.`);
      }
      if (typeof primitiveId !== "string" || primitiveId.trim() === "") {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Materialized poured object[${i}] has no readable primitiveId.`);
      }
      if (typeof pourPrimitiveId !== "string" || pourPrimitiveId.trim() === "") {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Materialized poured object ${primitiveId} has no readable pourPrimitiveId.`
        );
      }
      const meta = boundary.get(pourPrimitiveId);
      if (!meta) {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Materialized poured object ${primitiveId} references missing boundary ${pourPrimitiveId}; net/layer attribution is unavailable.`
        );
      }
      if (!Array.isArray(rawFills)) {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Materialized pour ${pourPrimitiveId} fills are unavailable (expected an array, including [] for known-empty).`
        );
      }
      const fills = [];
      for (let fillIndex = 0; fillIndex < rawFills.length; fillIndex++) {
        const f = rawFills[fillIndex];
        if (!f || typeof f !== "object") {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Materialized pour ${pourPrimitiveId} fill[${fillIndex}] is unreadable.`
          );
        }
        if (typeof f.id !== "string" || f.id.trim() === "") {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Materialized pour ${pourPrimitiveId} fill[${fillIndex}] has no readable id.`
          );
        }
        if (!f.path || typeof f.path.getSourceStrictComplex !== "function") {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Materialized pour ${pourPrimitiveId} fill ${f.id} has no readable polygon path.`
          );
        }
        let rawSource;
        try {
          rawSource = f.path.getSourceStrictComplex();
        } catch (err) {
          throw edaError(err, `Materialized pour ${pourPrimitiveId} fill ${f.id} has unreadable polygon geometry.`);
        }
        if (!Array.isArray(rawSource) || rawSource.length === 0) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Materialized pour ${pourPrimitiveId} fill ${f.id} returned no polygon source.`
          );
        }
        if (typeof f.fill !== "boolean") {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Materialized pour ${pourPrimitiveId} fill ${f.id} has no readable fill flag.`
          );
        }
        const nativeLineWidth = pouredFinite(f.lineWidth, `fill ${f.id} lineWidth`);
        if (nativeLineWidth < 0) {
          throw new ActionError(
            ErrorCodes.EDA_CALL_FAILED,
            `Materialized pour ${pourPrimitiveId} fill ${f.id} has a negative lineWidth.`
          );
        }
        const source = normalizePouredStrictComplexSource(rawSource);
        fills.push({
          id: f.id,
          lineWidth: nativeLineWidth * POURED_NATIVE_TO_MIL,
          fill: f.fill,
          source,
          sourceUnits: "mil",
          lineWidthUnits: "mil",
          arcSweepUnits: "degree",
          nativeSourceUnits: "0.1mil",
          nativeLineWidthUnits: "0.1mil",
          geometryKind: f.fill ? "filled-complex-polygon" : "stroked-thermal-spoke-path"
        });
      }
      if (net && meta.net !== net) continue;
      list.push({
        primitiveId,
        pourPrimitiveId,
        net: meta.net,
        layer: meta.layer,
        fills
      });
    }
    return { result: { available: true, poured: list, count: list.length } };
  };
  var pcbPourDelete = async (payload) => {
    const raw = payload.primitiveIds;
    let ids;
    if (typeof raw === "string") ids = [raw];
    else if (Array.isArray(raw) && raw.every((id) => typeof id === "string")) ids = raw;
    else throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing required field "primitiveIds" (string or string[]).');
    let deleted;
    try {
      deleted = await eda.pcb_PrimitivePour.delete(ids);
    } catch (err) {
      throw edaError(err, "Failed to delete copper pours.");
    }
    return { result: { deleted, primitiveIds: ids } };
  };
  var pcbPourRebuild = async (payload) => {
    const net = optionalString(payload, "net");
    let pours;
    try {
      pours = await eda.pcb_PrimitivePour.getAll(net);
    } catch (err) {
      throw edaError(err, "Failed to list pours for rebuild.");
    }
    let rebuilt = 0;
    for (const p of pours ?? []) {
      try {
        if (await p.rebuildCopperRegion()) rebuilt++;
      } catch {
      }
    }
    return { result: { pours: (pours ?? []).length, rebuilt } };
  };
  var pcbBeautify = async (payload) => {
    const scope = optionalString(payload, "scope") ?? "all";
    if (scope !== "all" && scope !== "selected") {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `scope must be "all" or "selected" (got "${scope}").`);
    }
    const rawNets = payload.nets;
    const nets = Array.isArray(rawNets) ? rawNets.filter((n) => typeof n === "string" && n.length > 0) : void 0;
    const opts = {
      scope,
      net: optionalString(payload, "net"),
      nets,
      layer: optionalNumber(payload, "layer"),
      cornerRadiusRatio: optionalNumber(payload, "cornerRadiusRatio") ?? 3,
      forceArc: optionalBoolean(payload, "forceArc") ?? false,
      mergeTransitionSegments: optionalBoolean(payload, "mergeTransitionSegments") ?? false,
      protectDifferentialAndEqualLength: optionalBoolean(payload, "protect") ?? true,
      enableDrc: optionalBoolean(payload, "drc") ?? true,
      drcIgnoreCopperPour: optionalBoolean(payload, "drcIgnoreCopperPour") ?? true,
      drcRetryCount: optionalNumber(payload, "drcRetryCount") ?? 4,
      rebuildPour: optionalBoolean(payload, "rebuildPour") ?? true,
      dryRun: optionalBoolean(payload, "dryRun") ?? false
    };
    let summary;
    try {
      summary = await runBeautify(opts);
    } catch (err) {
      throw edaError(err, "Failed to beautify PCB routing (ensure the PCB document is the active/foreground tab).");
    }
    return { result: summary };
  };
  var REGION_RULE_BY_NAME = {
    "no-components": 2,
    "keepout-components": 2,
    components: 2,
    "no-wires": 5,
    "no-routing": 5,
    "keepout-routing": 5,
    wires: 5,
    routing: 5,
    "no-fills": 6,
    fills: 6,
    "no-pours": 7,
    "no-copper": 7,
    "keepout-copper": 7,
    pours: 7,
    copper: 7,
    "no-inner": 8,
    "no-inner-electrical": 8,
    inner: 8,
    "follow-rule": 9,
    constraint: 9
  };
  var REGION_RULE_NAME = {
    2: "no-components",
    5: "no-wires",
    6: "no-fills",
    7: "no-pours",
    8: "no-inner-electrical",
    9: "follow-rule"
  };
  var DEFAULT_REGION_RULES = [2, 5, 7];
  function parseRegionRuleTypes(raw) {
    if (raw == null) return [...DEFAULT_REGION_RULES];
    const arr = Array.isArray(raw) ? raw : [raw];
    const out = [];
    for (const r of arr) {
      if (typeof r === "number") {
        out.push(r);
        continue;
      }
      if (typeof r === "string") {
        const normalized = r.trim().toLowerCase();
        if (/^\d+$/.test(normalized)) {
          out.push(Number(normalized));
          continue;
        }
        const v = REGION_RULE_BY_NAME[normalized];
        if (v == null) {
          throw new ActionError(
            ErrorCodes.MISSING_PAYLOAD_FIELD,
            `Unknown region ruleType "${r}". Use a name (${Object.keys(REGION_RULE_BY_NAME).join(", ")}) or an enum number.`
          );
        }
        out.push(v);
        continue;
      }
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "ruleType entries must be names or numbers.");
    }
    return out.length ? out : [...DEFAULT_REGION_RULES];
  }
  function closedPolygonFromPoints(raw, sourceSnapshot) {
    if (!Array.isArray(raw) || raw.length < 3) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "points must be an array of >= 3 [x,y] pairs (mil).");
    }
    const pts = [];
    for (const p of raw) {
      if (!Array.isArray(p) || p.length < 2 || typeof p[0] !== "number" || typeof p[1] !== "number") {
        throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "each point must be [x, y] numbers.");
      }
      pts.push([p[0], p[1]]);
    }
    const src = [pts[0][0], pts[0][1], "L"];
    for (let i = 1; i < pts.length; i++) src.push(pts[i][0], pts[i][1]);
    src.push(pts[0][0], pts[0][1]);
    if (sourceSnapshot) sourceSnapshot.source = src.slice();
    const poly = eda.pcb_MathPolygon.createPolygon(src);
    if (!poly) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Failed to build polygon from points (createPolygon returned undefined \u2014 points must form a valid closed polygon).");
    }
    return poly;
  }
  var pcbRegionCreate = async (payload) => {
    const lineWidth = regionBoundaryWidth(payload);
    const request = { source: [] };
    const poly = closedPolygonFromPoints(payload.points, request);
    const requestedSource = request.source;
    const layer = optionalNumber(payload, "layer") ?? 1;
    const ruleTypes = parseRegionRuleTypes(payload.ruleType ?? payload.ruleTypes);
    const regionName = optionalString(payload, "name");
    if (regionName !== void 0 && !ruleTypes.includes(9)) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Region name is only supported with follow-rule (9); no region was created.");
    }
    const lock = payload.locked === true;
    let region;
    try {
      region = await eda.pcb_PrimitiveRegion.create(
        layer,
        poly,
        ruleTypes,
        regionName,
        lineWidth,
        lock
      );
    } catch (err) {
      throw edaError(err, "Failed to create PCB region (\u7981\u6B62\u533A\u57DF).");
    }
    if (!region) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Region creation returned no primitive (check layer/points/ruleType).");
    }
    const primitiveId = region.getState_PrimitiveId();
    try {
      const regions = await eda.pcb_PrimitiveRegion.getAll();
      if (!Array.isArray(regions)) throw new Error("Region inventory unavailable after creation.");
      const matches = regions.filter((r) => r.getState_PrimitiveId() === primitiveId);
      if (matches.length !== 1) throw new Error("Created region is missing or ambiguous in fresh readback.");
      const fresh = matches[0];
      const actual = {
        primitiveId,
        layer: fresh.getState_Layer(),
        ruleType: fresh.getState_RuleType(),
        regionName: fresh.getState_RegionName() ?? null,
        source: fresh.getState_ComplexPolygon().getSource(),
        lineWidth: fresh.getState_LineWidth(),
        locked: fresh.getState_PrimitiveLock()
      };
      const differences = [];
      if (actual.layer !== Number(layer)) differences.push("layer");
      if (JSON.stringify([...actual.ruleType].sort()) !== JSON.stringify([...ruleTypes].sort())) differences.push("ruleType");
      if (regionName !== void 0 && actual.regionName !== regionName) differences.push("regionName");
      if (!equivalentLinearRegionGeometry(requestedSource, actual.source)) differences.push("geometry");
      if (lineWidth !== void 0 && actual.lineWidth !== lineWidth) differences.push("lineWidth");
      if (actual.locked !== lock) differences.push("locked");
      return { result: {
        ...actual,
        ruleTypeNames: actual.ruleType.map((v) => REGION_RULE_NAME[v] ?? String(v)),
        verified: differences.length === 0,
        ...differences.length ? { partial: true, differences } : {}
      } };
    } catch (err) {
      return {
        result: { primitiveId, partial: true, verified: false, error: describeThrown(err) },
        warnings: ["Region was created but readback failed; inspect this ID before retrying."]
      };
    }
  };
  var pcbRegionList = async (payload) => {
    const layer = optionalNumber(payload, "layer");
    let regions;
    try {
      regions = await eda.pcb_PrimitiveRegion.getAll(
        layer == null ? void 0 : layer
      );
    } catch (err) {
      throw edaError(err, "Failed to list PCB regions.");
    }
    if (!Array.isArray(regions)) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "PCB region inventory is unavailable: getAll did not return an array.");
    }
    const list = [];
    for (const r of regions) {
      const rules = r.getState_RuleType() ?? [];
      let bbox;
      try {
        bbox = await eda.pcb_Primitive.getPrimitivesBBox([r.getState_PrimitiveId()]);
      } catch {
      }
      list.push({
        primitiveId: r.getState_PrimitiveId(),
        layer: r.getState_Layer(),
        ruleType: rules,
        ruleTypeNames: rules.map((v) => REGION_RULE_NAME[v] ?? String(v)),
        regionName: r.getState_RegionName() ?? null,
        geometryAvailable: (() => {
          try {
            return Array.isArray(r.getState_ComplexPolygon().getSource());
          } catch {
            return false;
          }
        })(),
        source: (() => {
          try {
            return r.getState_ComplexPolygon().getSource();
          } catch {
            return null;
          }
        })(),
        bbox,
        lineWidth: r.getState_LineWidth(),
        locked: r.getState_PrimitiveLock()
      });
    }
    return { result: { regions: list, count: list.length } };
  };
  var pcbRegionDelete = async (payload) => {
    const raw = payload.primitiveIds;
    let ids;
    if (typeof raw === "string") ids = [raw];
    else if (Array.isArray(raw) && raw.every((id) => typeof id === "string")) ids = raw;
    else throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing required field "primitiveIds" (string or string[]).');
    let deleted;
    try {
      deleted = await eda.pcb_PrimitiveRegion.delete(ids);
    } catch (err) {
      throw edaError(err, "Failed to delete PCB regions.");
    }
    return { result: { deleted, primitiveIds: ids } };
  };
  var FILL_MODE_BY_NAME = { solid: 0, mesh: 1, grid: 1, inner: 2, "inner-electrical": 2 };
  var FILL_MODE_NAME = { 0: "solid", 1: "mesh", 2: "inner-electrical" };
  function parseFillMode(raw) {
    if (raw == null) return 0;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const v = FILL_MODE_BY_NAME[raw.trim().toLowerCase()];
      if (v == null) throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `Unknown fillMode "${raw}". Use solid | mesh | inner.`);
      return v;
    }
    throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "fillMode must be a name or number.");
  }
  var pcbFillCreate = async (payload) => {
    const lineWidth = regionBoundaryWidth(payload);
    const request = { source: [] };
    const poly = closedPolygonFromPoints(payload.points, request);
    const requestedSource = request.source;
    const layer = optionalNumber(payload, "layer") ?? 1;
    const net = optionalString(payload, "net");
    const fillMode = parseFillMode(payload.fillMode);
    const lock = payload.locked === true;
    let fill;
    try {
      fill = await eda.pcb_PrimitiveFill.create(layer, poly, net, fillMode, lineWidth, lock);
    } catch (err) {
      throw edaError(err, "Failed to create PCB fill (\u586B\u5145\u533A\u57DF).");
    }
    if (!fill) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Fill creation returned no primitive (check layer/points/net).");
    }
    const primitiveId = fill.getState_PrimitiveId();
    try {
      const fills = await eda.pcb_PrimitiveFill.getAll();
      if (!Array.isArray(fills)) throw new Error("Fill inventory unavailable after creation.");
      const matches = fills.filter((f) => f.getState_PrimitiveId() === primitiveId);
      if (matches.length !== 1) throw new Error("Created fill is missing or ambiguous in fresh readback.");
      const fresh = matches[0];
      const actualMode = fresh.getState_FillMode();
      const actual = {
        primitiveId,
        net: fresh.getState_Net() ?? null,
        layer: fresh.getState_Layer(),
        fillMode: FILL_MODE_NAME[Number(actualMode)] ?? String(actualMode),
        lineWidth: fresh.getState_LineWidth(),
        locked: fresh.getState_PrimitiveLock(),
        source: fresh.getState_ComplexPolygon().getSource()
      };
      const differences = [];
      if (actual.layer !== Number(layer)) differences.push("layer");
      if (net !== void 0 && actual.net !== net) differences.push("net");
      if (actualMode !== fillMode) differences.push("fillMode");
      if (lineWidth !== void 0 && actual.lineWidth !== lineWidth) differences.push("lineWidth");
      if (actual.locked !== lock) differences.push("locked");
      if (!equivalentLinearRegionGeometry(requestedSource, actual.source)) differences.push("geometry");
      return { result: {
        ...actual,
        verified: differences.length === 0,
        ...differences.length ? { partial: true, differences } : {}
      } };
    } catch (err) {
      return {
        result: { primitiveId, partial: true, verified: false, error: describeThrown(err) },
        warnings: ["Fill was created but readback failed; inspect this ID before retrying."]
      };
    }
  };
  var pcbFillList = async (payload) => {
    const layer = optionalNumber(payload, "layer");
    const net = optionalString(payload, "net");
    const includeBBox = optionalBoolean(payload, "includeBBox") === true;
    let fills;
    try {
      fills = await eda.pcb_PrimitiveFill.getAll(
        layer == null ? void 0 : layer,
        net
      );
    } catch (err) {
      throw edaError(err, "Failed to list PCB fills.");
    }
    const list = [];
    for (const f of fills ?? []) {
      const id = f.getState_PrimitiveId();
      const item = {
        primitiveId: id,
        net: f.getState_Net() ?? null,
        layer: Number(f.getState_Layer()),
        fillMode: FILL_MODE_NAME[Number(f.getState_FillMode() ?? 0)] ?? String(f.getState_FillMode()),
        lineWidth: f.getState_LineWidth(),
        locked: f.getState_PrimitiveLock()
      };
      try {
        item.source = f.getState_ComplexPolygon().getSource();
        item.geometryAvailable = Array.isArray(item.source);
      } catch {
        item.source = null;
        item.geometryAvailable = false;
      }
      if (includeBBox) {
        try {
          const box = await eda.pcb_Primitive.getPrimitivesBBox([id]);
          item.bbox = box ? { minX: box.minX, minY: box.minY, maxX: box.maxX, maxY: box.maxY } : null;
        } catch {
          item.bbox = null;
        }
      }
      list.push(item);
    }
    return { result: { fills: list, count: list.length } };
  };
  var pcbFillDelete = async (payload) => {
    const raw = payload.primitiveIds;
    let ids;
    if (typeof raw === "string") ids = [raw];
    else if (Array.isArray(raw) && raw.every((id) => typeof id === "string")) ids = raw;
    else throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing required field "primitiveIds" (string or string[]).');
    let deleted;
    try {
      deleted = await eda.pcb_PrimitiveFill.delete(ids);
    } catch (err) {
      throw edaError(err, "Failed to delete PCB fills.");
    }
    return { result: { deleted, primitiveIds: ids } };
  };
  var pcbLineList = async (payload) => {
    const net = optionalString(payload, "net");
    const layer = optionalNumber(payload, "layer");
    let lines;
    try {
      lines = await eda.pcb_PrimitiveLine.getAll(net, layer);
    } catch (err) {
      throw edaError(err, "Failed to list PCB tracks.");
    }
    let arcs = [];
    let arcsAvailable = true;
    try {
      arcs = await eda.pcb_PrimitiveArc.getAll(net, layer);
    } catch {
      arcs = [];
      arcsAvailable = false;
    }
    const list = (lines ?? []).map((l) => ({
      primitiveId: l.getState_PrimitiveId(),
      net: l.getState_Net(),
      layer: l.getState_Layer(),
      startX: l.getState_StartX(),
      startY: l.getState_StartY(),
      endX: l.getState_EndX(),
      endY: l.getState_EndY(),
      lineWidth: l.getState_LineWidth(),
      locked: l.getState_PrimitiveLock()
    }));
    const arcList = (arcs ?? []).map((a) => ({
      primitiveId: a.getState_PrimitiveId(),
      net: a.getState_Net(),
      layer: a.getState_Layer(),
      startX: a.getState_StartX(),
      startY: a.getState_StartY(),
      endX: a.getState_EndX(),
      endY: a.getState_EndY(),
      arcAngle: a.getState_ArcAngle(),
      lineWidth: a.getState_LineWidth(),
      locked: a.getState_PrimitiveLock()
    }));
    return { result: { lines: list, arcs: arcList, arcsAvailable, count: list.length, arcCount: arcList.length } };
  };
  var pcbViaList = async (payload) => {
    const net = optionalString(payload, "net");
    let vias;
    try {
      vias = await eda.pcb_PrimitiveVia.getAll(net);
    } catch (err) {
      throw edaError(err, "Failed to list PCB vias.");
    }
    const list = (vias ?? []).map((v) => ({
      primitiveId: v.getState_PrimitiveId(),
      net: v.getState_Net(),
      x: v.getState_X(),
      y: v.getState_Y(),
      holeDiameter: v.getState_HoleDiameter(),
      diameter: v.getState_Diameter(),
      locked: v.getState_PrimitiveLock()
    }));
    return { result: { vias: list, count: list.length } };
  };
  var pcbTrackLock = async (payload) => {
    const locked = optionalBoolean(payload, "locked") ?? true;
    const all = optionalBoolean(payload, "all") === true;
    const includeFills = optionalBoolean(payload, "includeFills") ?? true;
    const rawNet = payload.net ?? payload.nets;
    let nets = null;
    if (typeof rawNet === "string") nets = [rawNet];
    else if (Array.isArray(rawNet) && rawNet.every((n) => typeof n === "string")) nets = rawNet;
    const want = nets && nets.length > 0 ? new Set(nets.map((n) => n.toUpperCase())) : null;
    const rawIds = payload.primitiveIds;
    const wantIds = Array.isArray(rawIds) && rawIds.every((i) => typeof i === "string") && rawIds.length > 0 ? new Set(rawIds) : null;
    if (!want && !wantIds && !all) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Provide "net" (string or string[]), "primitiveIds", or all=true \u2014 refusing to lock the whole board implicitly.');
    }
    let lines, arcs, vias, fills;
    try {
      lines = await eda.pcb_PrimitiveLine.getAll();
      arcs = await eda.pcb_PrimitiveArc.getAll();
      vias = await eda.pcb_PrimitiveVia.getAll();
      fills = includeFills ? await eda.pcb_PrimitiveFill.getAll().catch(() => []) : [];
    } catch (err) {
      throw edaError(err, "Failed to read tracks/arcs/vias/fills for lock.");
    }
    const matches = (net, pid) => {
      if (wantIds !== null && wantIds.has(pid)) return true;
      if (want !== null) return want.has(net.toUpperCase());
      return all && net !== "";
    };
    const counts = { lines: 0, arcs: 0, vias: 0, fills: 0 };
    const failures = [];
    const apply = async (prims, kind) => {
      for (const p of prims ?? []) {
        let pid = "";
        try {
          pid = p.getState_PrimitiveId();
          if (!matches(String(p.getState_Net() ?? ""), pid)) continue;
          if (p.getState_PrimitiveLock() === locked) {
            counts[kind]++;
            continue;
          }
          p.setState_PrimitiveLock(locked);
          await p.done();
          counts[kind]++;
        } catch {
          failures.push(pid || kind);
        }
      }
    };
    await apply(lines, "lines");
    await apply(arcs, "arcs");
    await apply(vias, "vias");
    await apply(fills, "fills");
    return { result: { locked, counts, total: counts.lines + counts.arcs + counts.vias + counts.fills, failures } };
  };
  var pcbRouteRipUp = async (payload) => {
    const rawNet = payload.net ?? payload.nets;
    let nets = null;
    if (typeof rawNet === "string") nets = [rawNet];
    else if (Array.isArray(rawNet) && rawNet.every((n) => typeof n === "string")) nets = rawNet;
    const want = nets ? new Set(nets) : null;
    const onCopper2 = (layer) => {
      const n = Number(layer);
      return n === 1 || n === 2 || n >= 15 && n <= 44;
    };
    let lines, arcs, vias;
    try {
      lines = await eda.pcb_PrimitiveLine.getAll();
      arcs = await eda.pcb_PrimitiveArc.getAll();
      vias = await eda.pcb_PrimitiveVia.getAll();
    } catch (err) {
      throw edaError(err, "Failed to read tracks/arcs/vias for rip-up.");
    }
    const lineIds = (lines ?? []).filter((l) => (!want || want.has(l.getState_Net())) && onCopper2(l.getState_Layer()) && !l.getState_PrimitiveLock()).map((l) => l.getState_PrimitiveId());
    const arcIds = (arcs ?? []).filter((a) => (!want || want.has(a.getState_Net())) && onCopper2(a.getState_Layer()) && !a.getState_PrimitiveLock()).map((a) => a.getState_PrimitiveId());
    let componentIds;
    try {
      componentIds = (await eda.pcb_PrimitiveComponent.getAll() ?? []).map((c) => c.getState_PrimitiveId());
    } catch (err) {
      throw edaError(err, "Failed to read components for embedded-via ownership during rip-up.");
    }
    const viaIds = (vias ?? []).filter((v) => (!want || want.has(v.getState_Net())) && !v.getState_PrimitiveLock() && !pcbEmbeddedParent(v.getState_PrimitiveId(), componentIds)).map((v) => v.getState_PrimitiveId());
    const ripDelete = async (kind, ids, fn) => {
      if (!ids.length) return { requested: 0, ok: true };
      try {
        return { requested: ids.length, ok: await fn(ids) };
      } catch (err) {
        throw edaError(err, `Failed to delete ${kind} during rip-up.`);
      }
    };
    const linesRes = await ripDelete("tracks", lineIds, (ids) => eda.pcb_PrimitiveLine.delete(ids));
    const arcsRes = await ripDelete("arcs", arcIds, (ids) => eda.pcb_PrimitiveArc.delete(ids));
    const viasRes = await ripDelete("vias", viaIds, (ids) => eda.pcb_PrimitiveVia.delete(ids));
    return { result: { nets: nets ?? "all", lines: linesRes, arcs: arcsRes, vias: viasRes } };
  };
  var pcbClearRouting = async (payload) => {
    const type = optionalString(payload, "type") ?? "all";
    let cleared;
    try {
      cleared = await eda.pcb_Document.clearRouting(type);
    } catch (err) {
      throw edaError(err, "clearRouting is @alpha and may be unavailable on this build \u2014 use pcb.route.rip_up for a reliable net-scoped rip-up.");
    }
    return { result: { cleared, type } };
  };
  function parsePcbAutoRouteProps(payload) {
    const nets = optionalStringArray(payload, "nets");
    const ignoreNets = optionalStringArray(payload, "ignoreNets");
    const layers = payload.layers;
    if (layers !== void 0 && (!Array.isArray(layers) || !layers.length || !layers.every((l) => Number.isInteger(l) && onPcbCopperLayer(l)))) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, '"layers" must be a non-empty array of copper layer ids (TOP=1, BOTTOM=2, inner 15-44).');
    }
    const corner = optionalString(payload, "cornerStyle") ?? "45";
    if (corner !== "45" && corner !== "90") throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, '"cornerStyle" must be "45" or "90".');
    const optimization = optionalString(payload, "optimization") ?? "completion";
    if (optimization !== "completion" && optimization !== "faster") throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, '"optimization" must be "completion" or "faster".');
    return {
      ...nets?.length ? { RoutingNets: nets } : {},
      ...ignoreNets?.length ? { ignoreNets } : {},
      ...layers !== void 0 ? { layers } : {},
      cornerStyle: corner === "45" ? 0 : 1,
      // EPCB_AutoRoutingCornerStyle.DEGREE_45 / DEGREE_90
      existingPrimitiveMode: "keep",
      // EPCB_AutoRoutingExistingPrimitiveMode.KEEP — never 'remove'
      optimization: optimization === "completion" ? 1 : 0
      // EPCB_AutoRoutingOptimization
    };
  }
  async function pcbCopperInventory() {
    const inv = { lines: /* @__PURE__ */ new Set(), arcs: /* @__PURE__ */ new Set(), vias: /* @__PURE__ */ new Set(), locked: /* @__PURE__ */ new Set() };
    const take = (items, into, layerFilter) => {
      for (const p of items ?? []) {
        if (layerFilter && !onPcbCopperLayer(pcbPrimLayer(p))) continue;
        const id = p.getState_PrimitiveId();
        into.add(id);
        if (pcbPrimLocked(p)) inv.locked.add(id);
      }
    };
    take(await eda.pcb_PrimitiveLine.getAll(), inv.lines, true);
    take(await eda.pcb_PrimitiveArc.getAll(), inv.arcs, true);
    take(await eda.pcb_PrimitiveVia.getAll(), inv.vias, false);
    return inv;
  }
  var pcbRouteAuto = async (payload) => {
    const props = parsePcbAutoRouteProps(payload);
    const route = eda.pcb_Document.autoRouting;
    if (typeof route !== "function") {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "unsupported: eda.pcb_Document.autoRouting is not available on this EasyEDA build.");
    }
    let before;
    try {
      before = await pcbCopperInventory();
    } catch (err) {
      throw edaError(err, "Copper inventory before auto-routing is unavailable; nothing was routed.");
    }
    let report;
    try {
      report = await route.call(eda.pcb_Document, props);
    } catch (err) {
      throw edaError(err, "eda.pcb_Document.autoRouting failed.");
    }
    const after = await pcbCopperInventory();
    const added = (a, b) => [...b].filter((id) => !a.has(id)).length;
    const removed = (a, b) => [...a].filter((id) => !b.has(id));
    const lockedLost = [...before.locked].filter((id) => !after.locked.has(id));
    const removedIds = [...removed(before.lines, after.lines), ...removed(before.arcs, after.arcs), ...removed(before.vias, after.vias)];
    const created = { tracks: added(before.lines, after.lines), arcs: added(before.arcs, after.arcs), vias: added(before.vias, after.vias) };
    const changed = created.tracks + created.arcs + created.vias + removedIds.length > 0;
    const ok = report?.success;
    const failedNets = report?.failedNets;
    if (!changed && (ok !== true || Array.isArray(failedNets) && failedNets.length > 0)) {
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `autoRouting changed nothing (router report: ${JSON.stringify(report)}).`);
    }
    return {
      result: {
        router: report ?? null,
        props,
        created,
        removedPrimitiveIds: removedIds,
        lockedBefore: before.locked.size,
        lockedLost,
        before: { tracks: before.lines.size, arcs: before.arcs.size, vias: before.vias.size },
        after: { tracks: after.lines.size, arcs: after.arcs.size, vias: after.vias.size }
      }
    };
  };
  var pcbRouteDelete = async (payload) => {
    const raw = payload.primitiveIds ?? payload.ids;
    let ids;
    if (typeof raw === "string") ids = [raw];
    else if (Array.isArray(raw) && raw.every((id) => typeof id === "string") && raw.length > 0) ids = raw;
    else throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Missing required field "primitiveIds" (string or non-empty string[]).');
    const kindGuard = optionalString(payload, "kind");
    let lines, arcs, vias;
    try {
      lines = await eda.pcb_PrimitiveLine.getAll();
      arcs = await eda.pcb_PrimitiveArc.getAll();
      vias = await eda.pcb_PrimitiveVia.getAll();
    } catch (err) {
      throw edaError(err, "Failed to read routing primitives for delete.");
    }
    const byId = /* @__PURE__ */ new Map();
    for (const l of lines ?? []) {
      byId.set(l.getState_PrimitiveId(), {
        kind: "track",
        locked: l.getState_PrimitiveLock(),
        before: { net: l.getState_Net(), layer: Number(l.getState_Layer()), startX: l.getState_StartX(), startY: l.getState_StartY(), endX: l.getState_EndX(), endY: l.getState_EndY(), lineWidth: l.getState_LineWidth() }
      });
    }
    for (const a of arcs ?? []) {
      byId.set(a.getState_PrimitiveId(), {
        kind: "arc",
        locked: a.getState_PrimitiveLock(),
        before: { net: a.getState_Net(), layer: Number(a.getState_Layer()) }
      });
    }
    for (const v of vias ?? []) {
      byId.set(v.getState_PrimitiveId(), {
        kind: "via",
        locked: v.getState_PrimitiveLock(),
        before: { net: v.getState_Net(), x: v.getState_X(), y: v.getState_Y(), holeDiameter: v.getState_HoleDiameter(), diameter: v.getState_Diameter() }
      });
    }
    let componentIds = [];
    try {
      const comps = await eda.pcb_PrimitiveComponent.getAll();
      componentIds = (comps ?? []).map((c) => c.getState_PrimitiveId()).filter(Boolean);
    } catch {
    }
    const embeddedParent = (id) => pcbEmbeddedParent(id, componentIds);
    const toDelete = { track: [], arc: [], via: [] };
    const removed = [];
    const skippedLocked = [];
    const notFound = [];
    const wrongKind = [];
    const notDeletable = [];
    for (const id of ids) {
      const entry = byId.get(id);
      if (!entry) {
        notFound.push(id);
        continue;
      }
      if (kindGuard && entry.kind !== kindGuard) {
        wrongKind.push(`${id} is a ${entry.kind}`);
        continue;
      }
      if (entry.locked) {
        skippedLocked.push(id);
        continue;
      }
      const parent = embeddedParent(id);
      if (parent) {
        notDeletable.push({ primitiveId: id, parentComponent: parent, reason: "footprint-embedded \u2014 the primitive API cannot delete it (delete claims success, the next reload re-materializes it); edit the footprint in EasyEDA or delete the whole component" });
        continue;
      }
      toDelete[entry.kind].push(id);
      removed.push({ primitiveId: id, kind: entry.kind, ...entry.before });
    }
    if (wrongKind.length) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `kind=${kindGuard} refused mismatched ids: ${wrongKind.join("; ")}. Drop the kind guard or fix the id list.`);
    }
    if (!removed.length) {
      if (notDeletable.length) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Nothing deletable: ${notDeletable.length} id(s) are FOOTPRINT-EMBEDDED (e.g. EPAD thermal vias \u2014 part of ${notDeletable[0].parentComponent}); the primitive API cannot delete them. To bond them to a net use \`easyeda pcb via-bond\`; to remove them edit the footprint or delete the component.`);
      }
      throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `Nothing to delete: ${notFound.length} id(s) not found among routing primitives${skippedLocked.length ? `, ${skippedLocked.length} locked` : ""}. Pull fresh ids from pcb.line.list / pcb.via.list.`);
    }
    const results = {};
    const deleters = {
      track: (batch) => eda.pcb_PrimitiveLine.delete(batch),
      arc: (batch) => eda.pcb_PrimitiveArc.delete(batch),
      via: (batch) => eda.pcb_PrimitiveVia.delete(batch)
    };
    for (const kind of ["track", "arc", "via"]) {
      const batch = toDelete[kind];
      if (!batch.length) continue;
      try {
        results[`${kind}s`] = { requested: batch.length, ok: await deleters[kind](batch) };
      } catch (err) {
        throw edaError(err, `Failed to delete ${kind}s.`);
      }
    }
    const notDeleted = [];
    try {
      const [l2, a2, v2] = await Promise.all([
        toDelete.track.length ? eda.pcb_PrimitiveLine.getAll() : Promise.resolve([]),
        toDelete.arc.length ? eda.pcb_PrimitiveArc.getAll() : Promise.resolve([]),
        toDelete.via.length ? eda.pcb_PrimitiveVia.getAll() : Promise.resolve([])
      ]);
      const survivors = /* @__PURE__ */ new Set();
      for (const p of [...l2 ?? [], ...a2 ?? [], ...v2 ?? []]) survivors.add(p.getState_PrimitiveId());
      for (const kind of ["track", "arc", "via"]) {
        for (const id of toDelete[kind]) if (survivors.has(id)) notDeleted.push(id);
      }
    } catch {
    }
    const actuallyRemoved = removed.filter((r) => !notDeleted.includes(r.primitiveId));
    const out = { deleted: results, removed: actuallyRemoved, count: actuallyRemoved.length, skippedLocked, notFound };
    if (notDeletable.length) {
      out.ok = false;
      out.notDeletable = notDeletable;
    }
    if (notDeleted.length) {
      out.ok = false;
      out.notDeleted = notDeleted;
      out.notDeletedReason = "these primitives survived the delete (verified by readback) \u2014 most likely FOOTPRINT-EMBEDDED under a component the pre-check could not attribute; edit the footprint in EasyEDA or delete the whole component instead";
    }
    return { result: out };
  };
  var pcbRouteViaHop = async (payload) => {
    const net = requireString(payload, "net");
    const fromX = requireNumber(payload, "fromX");
    const fromY = requireNumber(payload, "fromY");
    const toX = requireNumber(payload, "toX");
    const toY = requireNumber(payload, "toY");
    const layer = optionalNumber(payload, "layer") ?? 1;
    const hopLayer = optionalNumber(payload, "hopLayer") ?? 2;
    const lineWidth = optionalNumber(payload, "lineWidth") ?? 6;
    const holeDiameter = optionalNumber(payload, "holeDiameter") ?? 12;
    const viaDiameter = optionalNumber(payload, "viaDiameter") ?? 24;
    const stub = optionalNumber(payload, "stub") ?? 20;
    const bondFill = optionalBoolean(payload, "bondFill") === true;
    const bondSize = optionalNumber(payload, "bondSize") ?? 20;
    if (Number(layer) === Number(hopLayer)) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "layer and hopLayer must differ (a hop changes layers).");
    }
    const dx = toX - fromX, dy = toY - fromY;
    const dist2 = Math.hypot(dx, dy);
    if (dist2 <= 2 * stub + viaDiameter) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, `from\u2192to distance ${dist2.toFixed(1)}mil is too short for a hop (needs > 2\xD7stub + viaDiameter = ${2 * stub + viaDiameter}mil) \u2014 route it directly on one layer instead.`);
    }
    const ux = dx / dist2, uy = dy / dist2;
    const v1 = { x: fromX + ux * stub, y: fromY + uy * stub };
    const v2 = { x: toX - ux * stub, y: toY - uy * stub };
    const created = { tracks: [], vias: [], fills: [] };
    const rollback = async () => {
      try {
        if (created.fills.length) await eda.pcb_PrimitiveFill.delete(created.fills);
        if (created.vias.length) await eda.pcb_PrimitiveVia.delete(created.vias);
        if (created.tracks.length) await eda.pcb_PrimitiveLine.delete(created.tracks);
      } catch {
      }
    };
    const mkTrack = async (lyr, x1, y1, x2, y2, what) => {
      const line = await eda.pcb_PrimitiveLine.create(net, lyr, x1, y1, x2, y2, lineWidth);
      if (!line) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `via-hop: ${what} track creation returned no primitive (check layer ids).`);
      created.tracks.push(line.getState_PrimitiveId());
    };
    const mkVia = async (p, what) => {
      const via = await eda.pcb_PrimitiveVia.create(net, p.x, p.y, holeDiameter, viaDiameter);
      if (!via) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, `via-hop: ${what} creation returned no primitive.`);
      created.vias.push(via.getState_PrimitiveId());
    };
    const mkBond = async (p, lyr) => {
      const h = bondSize / 2;
      const poly = closedPolygonFromPoints([[p.x - h, p.y - h], [p.x + h, p.y - h], [p.x + h, p.y + h], [p.x - h, p.y + h]]);
      const fill = await eda.pcb_PrimitiveFill.create(lyr, poly, net, 0, void 0, false);
      if (!fill) throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "via-hop: bond fill creation returned no primitive.");
      created.fills.push(fill.getState_PrimitiveId());
    };
    try {
      await mkTrack(layer, fromX, fromY, v1.x, v1.y, "entry stub");
      await mkVia(v1, "via 1");
      await mkTrack(hopLayer, v1.x, v1.y, v2.x, v2.y, "hop");
      await mkVia(v2, "via 2");
      await mkTrack(layer, v2.x, v2.y, toX, toY, "exit stub");
      if (bondFill) {
        for (const p of [v1, v2]) {
          await mkBond(p, layer);
          await mkBond(p, hopLayer);
        }
      }
    } catch (err) {
      await rollback();
      throw err instanceof ActionError ? err : edaError(err, "via-hop failed mid-sequence; created primitives were rolled back.");
    }
    return {
      result: {
        net,
        layer: Number(layer),
        hopLayer: Number(hopLayer),
        vias: [{ ...v1 }, { ...v2 }],
        trackIds: created.tracks,
        viaIds: created.vias,
        fillIds: created.fills,
        bonded: bondFill,
        note: bondFill ? "optional bond fills placed on both layers of both vias (extra copper; NOT required for connectivity)" : "no bond fills \u2014 track\u2194via registers as connected on its own (pro-api-sdk#31 was a misdiagnosis); verify with pcb.drc.check after a pour-rebuild"
      }
    };
  };
  var BOARD_OUTLINE_LAYER = 11;
  function pointInPolygon(x, y, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }
  function sourceIsClosed(source) {
    if (source.length < 6 || typeof source[0] !== "number" || typeof source[1] !== "number") return false;
    const endX = source[source.length - 2];
    const endY = source[source.length - 1];
    return typeof endX === "number" && Number.isFinite(endX) && typeof endY === "number" && Number.isFinite(endY) && Math.abs(source[0] - endX) <= 1e-6 && Math.abs(source[1] - endY) <= 1e-6;
  }
  function outlineSourceCounts(source) {
    let segments = 0;
    let arcs = 0;
    let i = 2;
    while (i < source.length) {
      if (source[i] === "ARC") {
        arcs++;
        i += 4;
        continue;
      }
      if (source[i] !== "L") break;
      i++;
      while (i + 1 < source.length && typeof source[i] === "number" && typeof source[i + 1] === "number") {
        segments++;
        i += 2;
      }
    }
    return { segments, arcs };
  }
  function roundedRectRadius(source) {
    if (!Array.isArray(source) || source.length < 6 || typeof source[0] !== "number" || !Number.isFinite(source[0]) || typeof source[1] !== "number" || !Number.isFinite(source[1])) return null;
    const startX = source[0];
    const startY = source[1];
    let currentX = startX;
    let currentY = startY;
    const segments = [];
    let i = 2;
    while (i < source.length) {
      const command = source[i++];
      if (command === "ARC") {
        const sweep = source[i++];
        const endX = source[i++];
        const endY = source[i++];
        if (typeof sweep !== "number" || !Number.isFinite(sweep) || typeof endX !== "number" || !Number.isFinite(endX) || typeof endY !== "number" || !Number.isFinite(endY)) return null;
        segments.push({ kind: "ARC", startX: currentX, startY: currentY, endX, endY, sweep });
        currentX = endX;
        currentY = endY;
        continue;
      }
      if (command !== "L") return null;
      let points = 0;
      while (i + 1 < source.length && typeof source[i] === "number" && typeof source[i + 1] === "number") {
        const endX = source[i++];
        const endY = source[i++];
        if (!Number.isFinite(endX) || !Number.isFinite(endY)) return null;
        segments.push({ kind: "L", startX: currentX, startY: currentY, endX, endY });
        currentX = endX;
        currentY = endY;
        points++;
      }
      if (points === 0) return null;
    }
    const closeTolerance = 1e-6;
    if (segments.length !== 8 || Math.abs(currentX - startX) > closeTolerance || Math.abs(currentY - startY) > closeTolerance) return null;
    for (let index = 0; index < segments.length; index++) {
      if (segments[index].kind === segments[(index + 1) % segments.length].kind) return null;
    }
    const coordinateTolerance = 1e-6;
    const radiusTolerance = 0.011;
    const radii = [];
    let sweepSign = 0;
    for (const segment of segments) {
      const dx = segment.endX - segment.startX;
      const dy = segment.endY - segment.startY;
      if (segment.kind === "L") {
        if (Math.hypot(dx, dy) <= coordinateTolerance || Math.abs(dx) > coordinateTolerance && Math.abs(dy) > coordinateTolerance) return null;
        continue;
      }
      if (segment.sweep === void 0 || Math.abs(Math.abs(segment.sweep) - 90) > coordinateTolerance || Math.abs(dx) <= coordinateTolerance || Math.abs(dy) <= coordinateTolerance || Math.abs(Math.abs(dx) - Math.abs(dy)) > radiusTolerance) return null;
      const sign = Math.sign(segment.sweep);
      if (sweepSign !== 0 && sign !== sweepSign) return null;
      sweepSign = sign;
      radii.push(Math.hypot(dx, dy) / Math.SQRT2);
    }
    if (radii.length !== 4 || radii.some((radius) => !(radius > 0) || Math.abs(radius - radii[0]) > radiusTolerance)) return null;
    return radii.reduce((sum, radius) => sum + radius, 0) / radii.length;
  }
  function centerlineBounds(points) {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }
  var pcbOutlineSet = async (payload) => {
    const rawPoints = payload.points;
    const rawSource = payload.source;
    if (rawPoints !== void 0 && rawSource !== void 0) {
      throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, "Pass exactly one of points or source, not both.");
    }
    let points;
    let src;
    let outlineFormat;
    if (rawSource !== void 0) {
      const parsed = polygonSourceToPoints(rawSource);
      if (!Array.isArray(rawSource) || !parsed.points || !sourceIsClosed(rawSource)) {
        throw new ActionError(
          ErrorCodes.MISSING_PAYLOAD_FIELD,
          "source must be a closed EasyEDA polygon source using verified L/ARC commands."
        );
      }
      src = [...rawSource];
      points = parsed.points;
      outlineFormat = parsed.format ?? "unknown";
    } else {
      if (!Array.isArray(rawPoints) || rawPoints.length < 3) {
        throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "points must be an array of >= 3 [x,y] pairs (mil).");
      }
      points = [];
      for (const p of rawPoints) {
        if (!Array.isArray(p) || p.length < 2 || typeof p[0] !== "number" || !Number.isFinite(p[0]) || typeof p[1] !== "number" || !Number.isFinite(p[1])) {
          throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "each point must be [x, y] finite numbers.");
        }
        points.push([p[0], p[1]]);
      }
      if (points.length > 3 && Math.abs(points[0][0] - points[points.length - 1][0]) <= 1e-6 && Math.abs(points[0][1] - points[points.length - 1][1]) <= 1e-6) points.pop();
      src = [points[0][0], points[0][1], "L"];
      for (let i = 1; i < points.length; i++) src.push(points[i][0], points[i][1]);
      src.push(points[0][0], points[0][1]);
      outlineFormat = "polyline";
    }
    const replace = optionalBoolean(payload, "replace") !== false;
    const lineWidth = optionalNumber(payload, "lineWidth") ?? 10;
    if (!Number.isFinite(lineWidth) || lineWidth <= 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "lineWidth must be a finite number greater than zero.");
    }
    try {
      const poly = eda.pcb_MathPolygon.createPolygon(src);
      if (!poly) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Failed to build outline polygon (createPolygon returned undefined \u2014 points must form a valid closed polygon).");
      }
      if (replace) {
        const deleteAndConfirm = async (kind, getAll, remove) => {
          const oldIds = (await getAll()).map((item) => item.getState_PrimitiveId());
          if (!oldIds.length) return;
          const deleted = await remove(oldIds);
          if (!deleted) {
            throw new ActionError(
              ErrorCodes.EDA_CALL_FAILED,
              `Failed to delete existing board-outline ${kind}; no replacement was created.`
            );
          }
          const remaining = new Set((await getAll()).map((item) => item.getState_PrimitiveId()));
          const residual = oldIds.filter((id) => remaining.has(id));
          if (residual.length) {
            throw new ActionError(
              ErrorCodes.INVALID_STATE,
              `Existing board-outline ${kind} remained after delete (${residual.join(", ")}); no replacement was created.`
            );
          }
        };
        await deleteAndConfirm(
          "polylines",
          () => eda.pcb_PrimitivePolyline.getAll(void 0, BOARD_OUTLINE_LAYER),
          (ids) => eda.pcb_PrimitivePolyline.delete(ids)
        );
        await deleteAndConfirm(
          "lines",
          () => eda.pcb_PrimitiveLine.getAll(void 0, BOARD_OUTLINE_LAYER),
          (ids) => eda.pcb_PrimitiveLine.delete(ids)
        );
        await deleteAndConfirm(
          "arcs",
          () => eda.pcb_PrimitiveArc.getAll(void 0, BOARD_OUTLINE_LAYER),
          (ids) => eda.pcb_PrimitiveArc.delete(ids)
        );
      }
      const outline = await eda.pcb_PrimitivePolyline.create("", BOARD_OUTLINE_LAYER, poly, lineWidth, true);
      if (!outline) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Board outline creation returned no primitive (check points/layer).");
      }
      const outlineId = outline.getState_PrimitiveId();
      const counts = outlineSourceCounts(src);
      let zoomed = false;
      try {
        zoomed = await eda.pcb_Document.zoomToBoardOutline();
      } catch {
      }
      const bbox = centerlineBounds(points);
      const radius = roundedRectRadius(src);
      const outside = [];
      try {
        const comps = await eda.pcb_PrimitiveComponent.getAll();
        for (const c of comps) {
          const box = await eda.pcb_Primitive.getPrimitivesBBox([c.getState_PrimitiveId()]);
          if (!box) continue;
          const corners = [
            [box.minX, box.minY],
            [box.maxX, box.minY],
            [box.minX, box.maxY],
            [box.maxX, box.maxY]
          ];
          if (corners.some(([x, y]) => !pointInPolygon(x, y, points))) {
            outside.push(c.getState_Designator() ?? c.getState_PrimitiveId());
          }
        }
      } catch {
      }
      return { result: {
        outlineId,
        segments: counts.segments,
        arcs: counts.arcs,
        zoomed,
        bbox,
        width: bbox.maxX - bbox.minX,
        height: bbox.maxY - bbox.minY,
        radius,
        lineWidth: outline.getState_LineWidth(),
        locked: outline.getState_PrimitiveLock(),
        outlineFormat,
        allInside: outside.length === 0,
        outside
      } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to set board outline.");
    }
  };
  var pcbOutlineGet = async () => {
    let polylines, lines;
    try {
      polylines = await eda.pcb_PrimitivePolyline.getAll(void 0, BOARD_OUTLINE_LAYER);
      lines = await eda.pcb_PrimitiveLine.getAll(void 0, BOARD_OUTLINE_LAYER);
    } catch (err) {
      throw edaError(err, "Failed to read board outline.");
    }
    let arcCount = 0;
    try {
      arcCount = (await eda.pcb_PrimitiveArc.getAll(void 0, BOARD_OUTLINE_LAYER)).length;
    } catch {
    }
    let bbox = null;
    if (polylines.length) {
      try {
        bbox = await eda.pcb_Primitive.getPrimitivesBBox(polylines.map((p) => p.getState_PrimitiveId())) ?? null;
      } catch {
      }
    } else if (lines.length) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const l of lines) {
        for (const [x, y] of [[l.getState_StartX(), l.getState_StartY()], [l.getState_EndX(), l.getState_EndY()]]) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
      bbox = { minX, maxX, minY, maxY };
    }
    let points = null;
    let outlineFormat = null;
    let centerlineBBox = null;
    let width = null;
    let height = null;
    let radius = null;
    let lineWidth = null;
    let locked = null;
    let sourceSegments = null;
    let sourceArcs = null;
    if (polylines.length > 0) {
      try {
        const sources = polylines.map((p) => p.getState_Polygon()?.getSource());
        const selected = selectBoardOutlineSource(sources);
        points = selected.points;
        outlineFormat = selected.format;
        if (points && selected.index >= 0) {
          centerlineBBox = centerlineBounds(points);
          width = centerlineBBox.maxX - centerlineBBox.minX;
          height = centerlineBBox.maxY - centerlineBBox.minY;
          radius = roundedRectRadius(sources[selected.index]);
          lineWidth = polylines[selected.index].getState_LineWidth();
          locked = polylines[selected.index].getState_PrimitiveLock();
          const sourceCounts = outlineSourceCounts(sources[selected.index]);
          sourceSegments = sourceCounts.segments;
          sourceArcs = sourceCounts.arcs;
        }
      } catch {
      }
    }
    return { result: {
      outline: polylines.length,
      segments: lines.length,
      arcs: arcCount,
      legacyArcs: arcCount,
      sourceSegments,
      sourceArcs,
      nativeArcs: sourceArcs,
      bbox,
      points,
      outlineFormat,
      centerlineBBox,
      width,
      height,
      radius,
      lineWidth,
      locked
    } };
  };
  function polygonSourceToPoints(src) {
    if (!Array.isArray(src) || src.length < 6) return { points: null, format: "empty" };
    const pts = [];
    let i = 0;
    if (typeof src[0] !== "number" || !Number.isFinite(src[0]) || typeof src[1] !== "number" || !Number.isFinite(src[1])) {
      return { points: null, format: `unexpected-start:${String(src[0])}` };
    }
    let currentX = src[0];
    let currentY = src[1];
    let hasArc = false;
    pts.push([currentX, currentY]);
    i = 2;
    while (i < src.length) {
      const tok = src[i];
      if (typeof tok !== "string") return { points: null, format: `unexpected-token:${String(tok)}` };
      if (tok === "L") {
        i++;
        let consumed = 0;
        while (i + 1 < src.length && typeof src[i] === "number" && Number.isFinite(src[i]) && typeof src[i + 1] === "number" && Number.isFinite(src[i + 1])) {
          currentX = src[i];
          currentY = src[i + 1];
          pts.push([currentX, currentY]);
          i += 2;
          consumed++;
        }
        if (consumed === 0) return { points: null, format: "malformed-L" };
        continue;
      }
      if (tok !== "ARC") return { points: null, format: `unsupported-command:${tok}` };
      if (i + 3 >= src.length || typeof src[i + 1] !== "number" || !Number.isFinite(src[i + 1]) || typeof src[i + 2] !== "number" || !Number.isFinite(src[i + 2]) || typeof src[i + 3] !== "number" || !Number.isFinite(src[i + 3])) {
        return { points: null, format: "malformed-ARC" };
      }
      const sweepDegrees = src[i + 1];
      const endX = src[i + 2];
      const endY = src[i + 3];
      const absSweep = Math.abs(sweepDegrees);
      const chordX = endX - currentX;
      const chordY = endY - currentY;
      const chord = Math.hypot(chordX, chordY);
      const sineHalf = Math.sin(absSweep * Math.PI / 360);
      if (absSweep <= 0 || absSweep >= 360 || chord <= 1e-12 || sineHalf <= 1e-12) {
        return { points: null, format: "malformed-ARC" };
      }
      const radius = chord / (2 * sineHalf);
      const midX = (currentX + endX) / 2;
      const midY = (currentY + endY) / 2;
      const centerOffset = Math.sqrt(Math.max(0, radius * radius - chord * chord / 4));
      const normalX = -chordY / chord;
      const normalY = chordX / chord;
      let best = null;
      for (const sign of [1, -1]) {
        const centerX = midX + sign * centerOffset * normalX;
        const centerY = midY + sign * centerOffset * normalY;
        const startAngle = Math.atan2(currentY - centerY, currentX - centerX) * 180 / Math.PI;
        const endAngle = Math.atan2(endY - centerY, endX - centerX) * 180 / Math.PI;
        const directed = ((sweepDegrees >= 0 ? endAngle - startAngle : startAngle - endAngle) % 360 + 360) % 360;
        const mismatch = Math.abs(directed - absSweep);
        if (!best || mismatch < best.mismatch) best = { mismatch, centerX, centerY };
      }
      if (!best || best.mismatch >= 0.5) return { points: null, format: "arc-sweep-mismatch" };
      const startRadians = Math.atan2(currentY - best.centerY, currentX - best.centerX);
      const steps = Math.max(2, Math.ceil(absSweep / 2));
      for (let step = 1; step < steps; step++) {
        const angle = startRadians + sweepDegrees * Math.PI / 180 * step / steps;
        pts.push([best.centerX + radius * Math.cos(angle), best.centerY + radius * Math.sin(angle)]);
      }
      pts.push([endX, endY]);
      currentX = endX;
      currentY = endY;
      hasArc = true;
      i += 4;
    }
    if (pts.length > 2) {
      const [fx, fy] = pts[0];
      const [lx, ly] = pts[pts.length - 1];
      if (Math.abs(fx - lx) < 1e-6 && Math.abs(fy - ly) < 1e-6) pts.pop();
    }
    if (pts.length < 3) return { points: null, format: "degenerate" };
    return { points: pts, format: hasArc ? "arc-polyline" : "polyline" };
  }
  function polygonArea(points) {
    let twice = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      twice += points[j][0] * points[i][1] - points[i][0] * points[j][1];
    }
    return Math.abs(twice) / 2;
  }
  function pointOnRing(x, y, ring) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const ax = ring[j][0], ay = ring[j][1], bx = ring[i][0], by = ring[i][1];
      const dx = bx - ax, dy = by - ay;
      const length2 = dx * dx + dy * dy;
      const t = length2 <= 1e-18 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length2));
      if (Math.hypot(x - (ax + t * dx), y - (ay + t * dy)) <= 1e-6) return true;
    }
    return false;
  }
  function segmentCrossesRing(a, b, ring) {
    const cross = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
    const onSegment = (p, q, r) => Math.abs(cross(p, q, r)) <= 1e-9 && r[0] >= Math.min(p[0], q[0]) - 1e-9 && r[0] <= Math.max(p[0], q[0]) + 1e-9 && r[1] >= Math.min(p[1], q[1]) - 1e-9 && r[1] <= Math.max(p[1], q[1]) + 1e-9;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const c = ring[j], d = ring[i];
      const abC = cross(a, b, c), abD = cross(a, b, d);
      const cdA = cross(c, d, a), cdB = cross(c, d, b);
      if ((abC > 1e-9 && abD < -1e-9 || abC < -1e-9 && abD > 1e-9) && (cdA > 1e-9 && cdB < -1e-9 || cdA < -1e-9 && cdB > 1e-9)) return true;
      if (onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b)) return true;
    }
    return false;
  }
  function ringStrictlyInside(candidate, outer) {
    if (!candidate.every(([x, y]) => pointInPolygon(x, y, outer) && !pointOnRing(x, y, outer))) return false;
    for (let i = 0, j = candidate.length - 1; i < candidate.length; j = i++) {
      if (segmentCrossesRing(candidate[j], candidate[i], outer)) return false;
    }
    return true;
  }
  function selectBoardOutlineSource(sources) {
    if (!Array.isArray(sources) || sources.length === 0) return { points: null, format: "empty", index: -1 };
    const parsed = sources.map(polygonSourceToPoints);
    const failed = parsed.find((result) => !result.points);
    if (failed) {
      return { points: null, format: sources.length === 1 ? failed.format : `ambiguous:${sources.length}-polylines:${failed.format}`, index: -1 };
    }
    if (parsed.length === 1) return { ...parsed[0], index: 0 };
    const ranked = parsed.map((result, index) => ({ ...result, index, area: polygonArea(result.points) })).sort((a, b) => b.area - a.area);
    if (ranked[0].area <= 1e-9 || Math.abs(ranked[0].area - ranked[1].area) <= 1e-9) {
      return { points: null, format: `ambiguous:${sources.length}-polylines`, index: -1 };
    }
    const outer = ranked[0].points;
    const containsEveryOtherRing = ranked.slice(1).every((candidate) => ringStrictlyInside(candidate.points, outer));
    if (!containsEveryOtherRing) return { points: null, format: `ambiguous:${sources.length}-polylines`, index: -1 };
    return { points: outer, format: `${ranked[0].format};outer-of:${sources.length}`, index: ranked[0].index };
  }
  var pcbOutlineClear = async () => {
    let removed = 0;
    try {
      const polylines = await eda.pcb_PrimitivePolyline.getAll(void 0, BOARD_OUTLINE_LAYER);
      if (polylines.length) {
        await eda.pcb_PrimitivePolyline.delete(polylines.map((p) => p.getState_PrimitiveId()));
        removed += polylines.length;
      }
      const lines = await eda.pcb_PrimitiveLine.getAll(void 0, BOARD_OUTLINE_LAYER);
      if (lines.length) {
        await eda.pcb_PrimitiveLine.delete(lines.map((l) => l.getState_PrimitiveId()));
        removed += lines.length;
      }
    } catch (err) {
      throw edaError(err, "Failed to clear board outline.");
    }
    try {
      const arcs = await eda.pcb_PrimitiveArc.getAll(void 0, BOARD_OUTLINE_LAYER);
      if (arcs.length) {
        await eda.pcb_PrimitiveArc.delete(arcs.map((a) => a.getState_PrimitiveId()));
        removed += arcs.length;
      }
    } catch {
    }
    return { result: { removed } };
  };
  var pcbOriginGet = async () => {
    try {
      const origin = await eda.pcb_Document.getCanvasOrigin();
      if (!origin || !Number.isFinite(origin.offsetX) || !Number.isFinite(origin.offsetY)) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "PCB canvas origin returned invalid offsets.");
      }
      return { result: {
        offsetX: origin.offsetX,
        offsetY: origin.offsetY,
        affectsGeometry: false,
        note: "Display/canvas origin only; PCB data coordinates and primitive geometry are unchanged."
      } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to read the PCB canvas origin.");
    }
  };
  var pcbOriginSet = async (payload) => {
    const offsetX = requireNumber(payload, "offsetX");
    const offsetY = requireNumber(payload, "offsetY");
    if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, "offsetX and offsetY must be finite numbers in mil.");
    }
    try {
      const before = await eda.pcb_Document.getCanvasOrigin();
      const applied = await eda.pcb_Document.setCanvasOrigin(offsetX, offsetY);
      if (!applied) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "setCanvasOrigin returned false; the display origin was not confirmed.");
      }
      const after = await eda.pcb_Document.getCanvasOrigin();
      const verified = !!after && Number.isFinite(after.offsetX) && Number.isFinite(after.offsetY) && Math.abs(after.offsetX - offsetX) <= 1e-6 && Math.abs(after.offsetY - offsetY) <= 1e-6;
      if (!verified) {
        throw new ActionError(
          ErrorCodes.EDA_CALL_FAILED,
          `Canvas origin readback mismatch: requested (${offsetX}, ${offsetY}), got (${String(after?.offsetX)}, ${String(after?.offsetY)}).`
        );
      }
      return { result: {
        offsetX: after.offsetX,
        offsetY: after.offsetY,
        previous: before ?? null,
        changed: !before || before.offsetX !== after.offsetX || before.offsetY !== after.offsetY,
        verified: true,
        affectsGeometry: false,
        note: "Display/canvas origin changed; PCB data coordinates and primitive geometry were not moved."
      } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to set the PCB canvas origin.");
    }
  };
  var editorPanels = async (payload) => {
    const sides = { left: optionalString(payload, "left"), right: optionalString(payload, "right") };
    if (sides.left === void 0 && sides.right === void 0) {
      throw new ActionError(ErrorCodes.MISSING_PAYLOAD_FIELD, 'Pass "left" and/or "right" as "open" or "closed".');
    }
    for (const [side, want] of Object.entries(sides)) {
      if (want !== void 0 && want !== "open" && want !== "closed") {
        throw new ActionError(ErrorCodes.PRECONDITION_REFUSED, `"${side}" must be "open" or "closed", got "${want}".`);
      }
    }
    const panel = eda.sys_PanelControl;
    const result = { stateReadable: false };
    const warnings = [];
    for (const side of ["left", "right"]) {
      const want = sides[side];
      if (want === void 0) continue;
      let locked = null;
      try {
        locked = side === "left" ? await panel.isLeftPanelLocked() : await panel.isRightPanelLocked();
      } catch {
      }
      const call = `${want === "open" ? "open" : "close"}${side === "left" ? "Left" : "Right"}Panel`;
      try {
        if (side === "left") {
          if (want === "open") panel.openLeftPanel();
          else panel.closeLeftPanel();
        } else if (want === "open") panel.openRightPanel();
        else panel.closeRightPanel();
      } catch (err) {
        throw edaError(err, `Failed to ${want === "open" ? "open" : "close"} the ${side} panel.`);
      }
      if (locked) warnings.push(`The ${side} panel is locked (pinned); ${call} was sent but the host may keep it in place \u2014 not unlocking it.`);
      result[side] = { requested: want, call, locked };
    }
    return { result, warnings: warnings.length ? warnings : void 0 };
  };
  var viewFit = async () => {
    try {
      const region = await eda.dmt_EditorControl.zoomToAllPrimitives();
      if (region === false) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Canvas does not support fit-all (or no focused canvas).");
      }
      return { result: { region } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to fit all primitives.");
    }
  };
  var viewZoom = async (payload) => {
    const x = optionalNumber(payload, "x");
    const y = optionalNumber(payload, "y");
    const scale = optionalNumber(payload, "scale");
    try {
      const region = await eda.dmt_EditorControl.zoomTo(x, y, scale);
      if (region === false) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Canvas does not support this zoom (or no focused canvas).");
      }
      return { result: { region } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to zoom.");
    }
  };
  var viewRegion = async (payload) => {
    const left = requireNumber(payload, "left");
    const right = requireNumber(payload, "right");
    const top = requireNumber(payload, "top");
    const bottom = requireNumber(payload, "bottom");
    const region = normalizeRegion(left, right, top, bottom);
    try {
      const ok = await eda.dmt_EditorControl.zoomToRegion(region.left, region.right, region.top, region.bottom);
      if (!ok) {
        throw new ActionError(ErrorCodes.EDA_CALL_FAILED, "Canvas does not support region zoom (or no focused canvas).");
      }
      return { result: { ok, region } };
    } catch (err) {
      if (err instanceof ActionError) throw err;
      throw edaError(err, "Failed to zoom to region.");
    }
  };
  var debugExecJs = async (payload) => {
    const code = requireString(payload, "code");
    let fn;
    let value;
    try {
      const AsyncFunction = Object.getPrototypeOf(async () => {
      }).constructor;
      fn = new AsyncFunction("eda", code);
    } catch (err) {
      throw new ActionError(
        ErrorCodes.PRECONDITION_REFUSED,
        "exec_js script could not be compiled; no code was executed. Fix JavaScript syntax and shell/JSON escaping before retrying.",
        describeThrown(err)
      );
    }
    try {
      value = await fn(eda);
    } catch (err) {
      throw edaError(err, "exec_js failed.");
    }
    if (value instanceof Blob) {
      return {
        result: {
          value: {
            __type: "blob",
            mimeType: value.type || "application/octet-stream",
            size: value.size,
            base64: await blobToBase64(value)
          }
        }
      };
    }
    if (value instanceof ArrayBuffer) {
      const bytes = new Uint8Array(value);
      return { result: { value: { __type: "bytes", size: bytes.byteLength, base64: uint8ToBase64(bytes) } } };
    }
    if (ArrayBuffer.isView(value)) {
      const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      return { result: { value: { __type: "bytes", size: bytes.byteLength, base64: uint8ToBase64(bytes) } } };
    }
    return { result: { value: value ?? null } };
  };
  var HANDLERS = {
    "system.page_reload": systemPageReload,
    "project.current": projectCurrent,
    "project.export_source": projectExportSource,
    "project.find": projectFind,
    "project.create": projectCreate,
    "project.open": projectOpen,
    "project.export": projectExport,
    "project.import": projectImport,
    "document.current": documentCurrent,
    "document.source.get": documentSourceGet,
    "document.source.roundtrip": documentSourceRoundtrip,
    "document.open": documentOpen,
    "document.close": documentClose,
    "view.fit": viewFit,
    "editor.panels": editorPanels,
    "view.zoom": viewZoom,
    "view.region": viewRegion,
    "schematic.pages.list": schematicPagesList,
    "schematic.page.open": schematicPageOpen,
    "schematic.page.create": schematicPageCreate,
    "schematic.page.rename": schematicPageRename,
    "schematic.page.delete": schematicPageDelete,
    "schematic.page.clear": schematicPageClear,
    "schematic.primitives.delete": schematicPrimitivesDelete,
    "schematic.rename": schematicRename,
    "schematic.titleblock.get": schematicTitleBlockGet,
    "schematic.titleblock.modify": schematicTitleBlockModify,
    "schematic.components.list": schematicComponentsList,
    "schematic.attribute.inspect": schematicAttributeInspect,
    "schematic.attribute.move": (payload) => moveSchematicAttribute(payload, (attribute) => schAttributeStateRecord(attribute, readCurrentNativePageAttributes)),
    "schematic.designators.list": schematicDesignatorsList,
    "schematic.component.place": schematicComponentPlace,
    "schematic.component.modify": schematicComponentModify,
    "schematic.component.delete": schematicComponentDelete,
    "schematic.wire.create": schematicWireCreate,
    "schematic.image.create": schematicImageCreate,
    "schematic.image.list": schematicImageList,
    "schematic.image.modify": schematicImageModify,
    "schematic.group.move": schematicGroupMove,
    "schematic.netflag.create": schematicNetflagCreate,
    "schematic.pin.set_no_connect": schematicPinSetNoConnect,
    "schematic.pin.disconnect": schematicPinDisconnect,
    "schematic.drc.check": schematicDrcCheck,
    "schematic.check": schematicCheck,
    "schematic.bridgeCheck": schematicBridgeCheck,
    "schematic.read": schematicRead,
    "schematic.save": schematicSave,
    "schematic.export.netlist": schematicExportNetlist,
    "schematic.export.image": schematicExportImage,
    "schematic.export.bom": schematicExportBom,
    "schematic.power.connect_pin": schematicPowerConnectPin,
    "schematic.library.search": schematicLibrarySearch,
    "schematic.library.get_by_lcsc": schematicLibraryGetByLcscIds,
    "library.list": libraryList,
    "library.common.list": listSystemCommonLibrary,
    "library.footprint.create": libraryFootprintCreate,
    "library.footprint.get": libraryFootprintGet,
    "library.footprint.copy": libraryFootprintCopy,
    "library.footprint.delete": libraryFootprintDelete,
    "library.footprint.build": libraryFootprintBuild,
    "library.footprint.region_create": libraryFootprintRegionCreate,
    "library.symbol.create": librarySymbolCreate,
    "library.symbol.build": librarySymbolBuild,
    "library.symbol.get": librarySymbolGet,
    "library.symbol.export_source": librarySymbolExportSource,
    "library.symbol.delete": librarySymbolDelete,
    "library.model3d.create": libraryModel3DCreate,
    "library.model3d.get": libraryModel3DGet,
    "library.model3d.search": libraryModel3DSearch,
    "library.model3d.copy": libraryModel3DCopy,
    "library.model3d.delete": libraryModel3DDelete,
    "library.device.create": libraryDeviceCreate,
    "library.device.get": libraryDeviceGet,
    "library.device.set_model3d": libraryDeviceSetModel3D,
    "library.device.delete": libraryDeviceDelete,
    "schematic.rebind.footprint": schematicRebindFootprint,
    "schematic.rebind.symbol": schematicRebindSymbol,
    "schematic.component.replace": schematicComponentReplace,
    "schematic.component.resolve_lcsc": schematicComponentResolveLcsc,
    "schematic.text.list": schematicTextList,
    "schematic.text.move": schematicTextMove,
    "schematic.visible_text.bboxes": schematicVisibleTextBBoxes,
    "pcb.documents.list": pcbDocumentsList,
    "pcb.components.list": pcbComponentsList,
    "pcb.layers.list": pcbLayersList,
    "pcb.layers.set_current": pcbLayerSetCurrent,
    "pcb.layers.visibility": pcbLayerVisibility,
    "pcb.view.side": pcbViewSide,
    "pcb.stackup.set": pcbStackupSet,
    "pcb.silk.align": pcbSilkAlign,
    "pcb.silk.list": pcbSilkList,
    "pcb.silk.add": pcbSilkAdd,
    "pcb.silk.import_svg": pcbSilkImportSvg,
    "pcb.image.create": pcbImageCreate,
    "pcb.image.list": pcbImageList,
    "pcb.image.modify": pcbImageModify,
    "pcb.image.delete": pcbImageDelete,
    "pcb.silk.set": pcbSilkSet,
    "pcb.silk.netnames": pcbSilkNetnames,
    "pcb.silk.label_pads": pcbSilkLabelPads,
    "pcb.nets.list": pcbNetsList,
    "pcb.net_class.list": pcbNetClassList,
    "pcb.net_class.create": pcbNetClassCreate,
    "pcb.report": pcbReport,
    "pcb.constraint.list": pcbConstraintList,
    "pcb.differential_pair.create": pcbDiffPairCreate,
    "pcb.differential_pair.delete": pcbDiffPairDelete,
    "pcb.differential_pair.rename": pcbDiffPairRename,
    "pcb.equal_length_group.create": pcbEqGroupCreate,
    "pcb.equal_length_group.add_nets": pcbEqGroupAddNets,
    "pcb.equal_length_group.delete": pcbEqGroupDelete,
    "pcb.board.info": pcbBoardInfo,
    "board.list": boardList,
    "board.current": boardCurrent,
    "board.create": boardCreate,
    "board.new_pcb": pcbNewBoard,
    "board.new": boardNew,
    "system.notify": systemNotify,
    "board.rename": boardRename,
    "board.copy": boardCopy,
    "board.delete": boardDelete,
    "pcb.document.delete": pcbDocumentDelete,
    "board.rebind": boardRebind,
    "pcb.import_changes": pcbImportChanges,
    "pcb.add_component": pcbAddComponent,
    "pcb.component.attrs_backfill": pcbComponentAttrsBackfill,
    "pcb.component.modify": pcbComponentModify,
    "pcb.component.lock": pcbComponentLock,
    "pcb.component.delete": pcbComponentDelete,
    "pcb.page.clear": pcbPageClear,
    "pcb.align": pcbAlign,
    "pcb.distribute": pcbDistribute,
    "pcb.grid_snap": pcbGridSnap,
    "pcb.components.move": pcbComponentsMove,
    "pcb.components.arrange": pcbComponentsArrange,
    "pcb.drc.check": pcbDrcCheck,
    "pcb.drc.rules": pcbDrcRules,
    "pcb.drc.rules.set": pcbDrcRulesSet,
    "pcb.config.get": pcbConfigGet,
    "pcb.config.set": pcbConfigSet,
    "pcb.net.color.set": pcbNetColorSet,
    "pcb.line.create": pcbLineCreate,
    "pcb.via.create": pcbViaCreate,
    "pcb.line.list": pcbLineList,
    "pcb.via.list": pcbViaList,
    "pcb.route.rip_up": pcbRouteRipUp,
    "pcb.track.lock": pcbTrackLock,
    "pcb.route.delete": pcbRouteDelete,
    "pcb.route.via_hop": pcbRouteViaHop,
    "pcb.clear_routing": pcbClearRouting,
    "pcb.route.auto": pcbRouteAuto,
    "pcb.pour.create": pcbPourCreate,
    "pcb.pour.list": pcbPourList,
    "pcb.poured.list": pcbPouredList,
    "pcb.pour.delete": pcbPourDelete,
    "pcb.pour.rebuild": pcbPourRebuild,
    "pcb.beautify": pcbBeautify,
    "pcb.region.create": pcbRegionCreate,
    "pcb.region.list": pcbRegionList,
    "pcb.region.delete": pcbRegionDelete,
    "pcb.fill.create": pcbFillCreate,
    "pcb.fill.list": pcbFillList,
    "pcb.fill.delete": pcbFillDelete,
    "pcb.save": pcbSave,
    "pcb.export.dsn": pcbExportDsn,
    "pcb.export.3d": pcbExport3D,
    "pcb.model3d.list": pcbModel3dList,
    "pcb.model3d.set_transform": pcbModel3dSetTransform,
    "pcb.model3d.bind": pcbModel3dBind,
    "pcb.export.3d_shell": pcbExport3DShell,
    "pcb.import_autoroute": pcbImportAutoroute,
    "pcb.view.filter.get": pcbViewFilterGet,
    "pcb.snapshot": pcbSnapshot,
    "pcb.outline.set": pcbOutlineSet,
    "pcb.outline.get": pcbOutlineGet,
    "pcb.outline.clear": pcbOutlineClear,
    "pcb.origin.get": pcbOriginGet,
    "pcb.origin.set": pcbOriginSet,
    "debug.exec_js": debugExecJs
  };
  async function runAction(action, payload) {
    const handler = HANDLERS[action];
    if (!handler) {
      throw new ActionError(ErrorCodes.UNKNOWN_ACTION, `Unknown action "${action}".`);
    }
    if (typeof eda === "undefined") {
      throw new ActionError(ErrorCodes.EDA_API_UNAVAILABLE, "The eda object is not available in this context.");
    }
    const before = await readResponseContext();
    const result = await handler(asPayload(payload));
    const after = await readResponseContext();
    if (!result.context) result.context = after;
    let identityError = mutationContextError(before, after);
    if (identityError === void 0 && result.context !== after) {
      identityError = mutationContextError({ ...result.context, tabId: result.context?.tabId ?? after.tabId }, after);
    }
    result.mutationContext = { ...before };
    result.mutationContextAvailable = identityError === void 0;
    if (identityError !== void 0) result.mutationContextError = identityError;
    return result;
  }

  // loads/eda/entry.js
  var ALLOWED = new Set(define_LOAD_ACTIONS_default);
  (window.__vcorpLoads ||= {}).eda = {
    version: "1.15.0+7a73a68.2c3bbb",
    async ready() {
      if (typeof eda === "undefined") return { ok: false, reason: "\u7F16\u8F91\u5668\u8FD8\u6CA1\u52A0\u8F7D\u5B8C" };
      const info = { ok: true, editor: "", project: null };
      try {
        info.editor = await eda.sys_Environment.getEditorCurrentVersion();
      } catch {
      }
      try {
        const p = await eda.dmt_Project.getCurrentProjectInfo();
        if (p) info.project = { uuid: p.uuid, name: p.friendlyName };
      } catch {
      }
      if (!info.project && /[#&]id=[0-9a-f]{32}/.test(location.hash)) {
        return { ok: false, reason: "\u5730\u5740\u91CC\u7684\u5DE5\u7A0B\u8FD8\u5728\u6253\u5F00" };
      }
      return info;
    },
    call(action, payload) {
      if (!ALLOWED.has(action)) {
        throw Object.assign(new Error(`eda \u80FD\u529B\u5305\u4E0D\u63A5\u53D7 ${action}`), { code: "LOAD_DENIED" });
      }
      return runAction(action, payload);
    }
  };
})();
