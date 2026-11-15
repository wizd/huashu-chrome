// agent-desktop 信封 → 给模型看的短文本。纯函数：本机执行器（src/lib/desktop.js）和
// 云端通道（cloud.js，经原生宿主）用同一份，两边的 agent 读到的是同一种回执。
import { DESKTOP_CMDS } from './desktop-policy.js';

const LINES_MAX = 400;

export function renderTree(tree) {
  const lines = [];
  let cut = 0;
  const walk = (n, depth) => {
    if (!n || typeof n !== 'object') return;
    const named = n.name || n.value;
    const show = n.ref_id || (named && depth < 30);
    if (show) {
      if (lines.length >= LINES_MAX) { cut += 1; } else {
        const bits = [];
        if (n.value !== undefined && n.value !== null && n.value !== n.name) bits.push(`value: ${JSON.stringify(String(n.value).slice(0, 120))}`);
        for (const s of n.states || []) if (s !== 'readonly') bits.push(s);
        if (n.subtree_truncated) bits.push('subtree_truncated');
        if (n.children_count !== undefined && !n.children) bits.push(`${n.children_count} children`);
        const ref = n.ref_id ? `[${n.ref_id}] ` : '';
        lines.push(`${'  '.repeat(Math.min(depth, 12))}${ref}${n.role || '?'}${n.name ? ` ${JSON.stringify(String(n.name).slice(0, 80))}` : ''}${bits.length ? ` (${bits.join(', ')})` : ''}`);
      }
    }
    for (const c of Array.isArray(n.children) ? n.children : []) walk(c, show ? depth + 1 : depth);
  };
  walk(tree, 0);
  if (cut) lines.push(`…还有 ${cut} 个节点没列出：用 root:<ref> 往某一块里钻，或 skeleton:true 先看轮廓`);
  return lines.join('\n');
}

// disposition → 效果行。agent-desktop 的语义：delivered_verified 读回过，
// delivered_unverified 只是发出去了，retry: unsafe 就是「可能已经生效」。
export function effectLine(env) {
  const d = env?.data?.disposition || env?.error?.disposition;
  if (env?.ok) {
    if (!d) return '';
    if (d.delivery === 'delivered_verified') return `效果：已读回验证${env.data.details?.verification_scope ? `（${env.data.details.verification_scope}）` : ''}`;
    if (d.delivery === 'delivered_unverified') return '效果：已送达，但没有读回证据——重新 snapshot 核对它变成了你要的样子没有';
    if (d.delivery === 'not_delivered') return '效果：本来就是这个状态，什么都没做';
    return '';
  }
  if (!d) return '';
  if (d.retry === 'safe') return '没有送达，可以按建议重试';
  return '⚠️ 这一下可能已经生效了。不要直接重试，先 snapshot 看现状';
}

function renderData(cmd, data) {
  if (cmd === 'snapshot') {
    const head = `# ${data.app || ''}${data.window?.title ? ` — ${data.window.title}` : ''}${data.window?.id ? ` [${data.window.id}]` : ''} [snapshot ${data.snapshot_id}] ${data.ref_count ?? 0} refs${data.complete === false ? '（不完整：观察时间用完了，可以 timeout 调大或用 root 往下钻）' : ''}`;
    return `${head}\n\n${renderTree(data.tree)}`;
  }
  if (cmd === 'find') {
    const list = data.match ? [data.match] : Array.isArray(data.matches) ? data.matches : [];
    if (data.count !== undefined && !list.length) return `命中 ${data.count} 个`;
    return list.map((m) => `[${m.ref_id}] ${m.role} ${JSON.stringify(m.name || '')}${m.value ? ` value: ${JSON.stringify(String(m.value).slice(0, 80))}` : ''}  ← ${(m.path || []).slice(-3).join(' › ')}`).join('\n') || '没有匹配';
  }
  if (cmd === 'list-windows') {
    return (data || []).map((w) => `${w.id}  ${w.app_name}  ${JSON.stringify(w.title || '')}${w.minimized ? ' (minimized)' : ''}${w.is_focused ? ' (focused)' : ''}${w.blocked ? `  ⛔ ${w.blocked}` : ''}`).join('\n') || '没有窗口';
  }
  if (cmd === 'list-apps') return (data?.apps || []).map((a) => a.name).join('\n');
  if (cmd === 'list-notifications') return JSON.stringify(data, null, 1).slice(0, 6000);
  const keep = { ...data };
  delete keep.disposition;
  delete keep.steps;
  if (keep.details) { delete keep.details.auto_wait; if (!Object.keys(keep.details).length) delete keep.details; }
  const s = JSON.stringify(keep);
  return s === '{}' ? '' : s.slice(0, 4000);
}

export function renderEnvelope(cmd, env, { target } = {}) {
  const what = `${cmd}${target ? ` ${target.role} ${JSON.stringify(target.name || '')}` : ''}`;
  if (!env?.ok) {
    const e = env?.error || {};
    return [`❌ ${what}：${e.code || 'INTERNAL'} ${e.message || ''}`, e.suggestion ? `建议：${e.suggestion}` : '', effectLine(env)].filter(Boolean).join('\n');
  }
  const body = renderData(cmd, env.data);
  const eff = effectLine(env);
  const head = DESKTOP_CMDS[cmd]?.kind === 'write' ? `✅ ${what}` : '';
  return [head, eff, body].filter(Boolean).join('\n');
}
