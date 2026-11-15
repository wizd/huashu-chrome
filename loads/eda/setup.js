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
