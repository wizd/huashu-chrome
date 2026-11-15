// eda 能力包的页面侧入口：把 easyeda-agent 的 runAction 注册成 load 的统一接口。
// 白名单在扩展侧（cloud-policy.js、background.js）已经查过一遍，这里再查一遍：
// 页面里谁拿到 __vcorpLoads.eda，也只能调清单里的 action。
import { runAction } from '@upstream/extension/src/actions';

const ALLOWED = new Set(__LOAD_ACTIONS__);

// 上游的 project.find 不给 teamUuid 时调 getAllProjectsUuid()，V4 上这个不带团队的清单是空的
// （实测个人团队有 2 个工程，它回 []），结果总是 presence:unknown。而能力包里没有哪个 action
// 能拿到 teamUuid，agent 只能停下来找用户要链接。所以不给 teamUuid 时这里自己挨个查：
// 用户所在的每个团队，团队根目录加每个文件夹。结果的形状和判定规则照上游。
async function findAcrossTeams(payload) {
  const friendlyName = typeof payload?.friendlyName === 'string' ? payload.friendlyName : '';
  if (!friendlyName || payload.teamUuid) return runAction('project.find', payload);
  const matches = [];
  const unreadableUuids = [];
  const places = [];
  let reason = null;
  let uuidCount = 0;
  let readableCount = 0;
  let teams;
  try { teams = await eda.dmt_Team.getAllTeamsInfo(); } catch { teams = null; }
  if (!Array.isArray(teams) || !teams.length) return runAction('project.find', payload);
  const seen = new Set();
  for (const team of teams) {
    let folders = [];
    try { folders = await eda.dmt_Folder.getAllFoldersUuid(team.uuid); } catch { reason ||= 'folder_list_failed'; }
    for (const folder of [undefined, ...(Array.isArray(folders) ? folders : [])]) {
      let uuids;
      try { uuids = await eda.dmt_Project.getAllProjectsUuid(team.uuid, folder); } catch { reason ||= 'uuid_list_failed'; continue; }
      if (!Array.isArray(uuids)) { reason ||= 'invalid_uuid_list'; continue; }
      places.push({ team: team.name || team.uuid, folder: folder || null, projects: uuids.length });
      for (const uuid of uuids) {
        if (seen.has(uuid)) continue;
        seen.add(uuid);
        uuidCount++;
        try {
          const info = await eda.dmt_Project.getProjectInfo(uuid);
          if (!info || info.uuid !== uuid || typeof info.friendlyName !== 'string') { unreadableUuids.push(uuid); continue; }
          readableCount++;
          if (info.friendlyName === friendlyName) {
            matches.push({ uuid, friendlyName: info.friendlyName, teamUuid: info.teamUuid ?? team.uuid, folderUuid: info.folderUuid ?? null });
          }
        } catch { unreadableUuids.push(uuid); }
      }
    }
  }
  if (!reason && unreadableUuids.length) reason = 'project_info_incomplete';
  if (!reason && !uuidCount) reason = 'empty_uuid_list';
  const complete = reason === null;
  return { result: {
    friendlyName, teamUuid: null,
    presence: matches.length ? 'found' : complete ? 'absent' : 'unknown',
    matches,
    enumeration: { scope: 'all-teams', complete, reason, uuidCount, readableCount, unreadableUuids, places },
  } };
}

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
    if (action === 'project.find') return findAcrossTeams(payload);
    return runAction(action, payload);
  },
};
