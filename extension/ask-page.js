// 「交给 maker」的输入窗口。用户的那句话只在这里写：这是扩展自己的页面，网页进不来。
// 上下文不在这里保管——窗口只拿着一个 id，background 凭它从自己的存储里取。

import { L, setupPage } from './i18n.js';

await setupPage();

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get('id') || '';
const call = (op, more = {}) => chrome.runtime.sendMessage({ __hcAsk: op, id, ...more });

function say(text, kind = 'bad') {
  $('hint').hidden = !!text;
  $('msg').hidden = !text;
  $('msg').className = `msg ${kind}`;
  $('msg').textContent = text;
}

function blockWith(text) {
  say(text);
  $('text').disabled = true;
  $('send').hidden = true;
  showClose();
}

function showClose() {
  $('close').hidden = false;
  $('close').focus();
}

async function load() {
  const r = await call('ctx').catch(() => null);
  if (!r?.ok) return blockWith(r?.error || L('这个窗口过期了。关掉它，回到网页上重新点一次。', 'This window has expired. Close it and click again on the web page.'));
  const it = r.item || {};
  if (it.host || it.what || it.url) {
    $('item').hidden = false;
    $('host').textContent = it.host || '';
    $('what').textContent = it.what || '';
    $('what').hidden = !it.what;
    $('url').textContent = it.url || '';
    $('excerpt').textContent = it.excerpt || '';
    $('excerpt').hidden = !it.excerpt;
  }
  if (!r.target) return blockWith(L('这个浏览器还没有和 maker 配对。点工具栏上的 vcorp-chrome，在侧栏里配对后再交办。', 'This browser is not paired with maker yet. Click vcorp-chrome in the toolbar and pair in the side panel first.'));
  let host = '';
  try { host = new URL(r.target.origin).host; } catch { /* 没有地址 */ }
  $('who').textContent = [r.target.account, host].filter(Boolean).join(' · ');
  if (r.target.paused) return blockWith(L('云端通道暂停着。在侧栏里恢复后再交办。', 'The cloud link is paused. Resume it in the side panel first.'));
  $('text').focus();
}

let done = false;
async function send() {
  if (done || $('send').disabled) return;
  const text = $('text').value.trim();
  if (!text) return say(L('先写下要办的事', 'Write what you want done first'));
  $('send').disabled = true;
  $('text').disabled = true;
  say(L('正在安排，通常要十几秒到一分钟…', 'Setting it up; this usually takes 10 seconds to a minute…'), 'ok');
  const r = await call('send', { text }).catch((e) => ({ ok: false, error: e.message }));
  if (!r?.ok) {
    $('send').disabled = false;
    $('text').disabled = false;
    $('text').focus();
    return say(r?.error || L('没能交给 maker，稍后再试', 'Could not hand it to maker; try again later'));
  }
  done = true;
  $('send').hidden = true;
  const msg = $('msg');
  say('', 'ok');
  $('hint').hidden = true;
  msg.hidden = false;
  msg.className = 'msg ok';
  msg.textContent = L(`已交给 maker${r.title ? `：${r.title}` : ''}　`, `Handed to maker${r.title ? `: ${r.title}` : ''}  `);
  if (r.url) {
    const a = document.createElement('a');
    a.href = r.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = L('打开任务', 'Open task');
    a.addEventListener('click', () => setTimeout(() => window.close(), 200));
    msg.append(a);
  }
  showClose();
  setTimeout(() => window.close(), 8000);
}

$('send').addEventListener('click', send);
$('close').addEventListener('click', () => window.close());
$('text').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); void send(); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.close(); });

void load();
