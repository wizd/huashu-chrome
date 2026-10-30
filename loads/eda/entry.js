// eda 能力包的页面侧入口：把 easyeda-agent 的 runAction 注册成 load 的统一接口。
// 白名单在扩展侧（cloud-policy.js、background.js）已经查过一遍，这里再查一遍：
// 页面里谁拿到 __vcorpLoads.eda，也只能调清单里的 action。
import { runAction } from '@upstream/extension/src/actions';

const ALLOWED = new Set(__LOAD_ACTIONS__);

(window.__vcorpLoads ||= {}).eda = {
  version: __LOAD_VERSION__,

  async ready() {
    if (typeof eda === 'undefined') return { ok: false, reason: '编辑器还没加载完' };
    const info = { ok: true, editor: '', project: null };
    try { info.editor = await eda.sys_Environment.getEditorCurrentVersion(); } catch { /* 老版本没有这个接口 */ }
    try {
      const p = await eda.dmt_Project.getCurrentProjectInfo();
      if (p) info.project = { uuid: p.uuid, name: p.friendlyName };
    } catch { /* 在首页，还没打开工程 */ }
    // 刷新后 _EXTAPI_ROOT_ 先出来，地址里的工程要再过几秒才打开（实测）。
    // 这时就说没准备好，让扩展接着等，免得第一条 call 撞上「No current project」。
    if (!info.project && /[#&]id=[0-9a-f]{32}/.test(location.hash)) {
      return { ok: false, reason: '地址里的工程还在打开' };
    }
    return info;
  },

  call(action, payload) {
    if (!ALLOWED.has(action)) {
      throw Object.assign(new Error(`eda 能力包不接受 ${action}`), { code: 'LOAD_DENIED' });
    }
    return runAction(action, payload);
  },
};
