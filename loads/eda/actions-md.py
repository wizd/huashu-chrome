# 从上游 action 目录生成 opus-video-maker 的 skills/easyeda/references/actions.md。
# 用法见那边 SKILL.md 的「维护」一节。只取 load.json 白名单里的 action，⚠ 取自 load.json 的 confirm。
import re, json, sys

src = open(sys.argv[1], encoding='utf-8').read()
L = json.load(open(sys.argv[2], encoding='utf-8'))
STR = r'"((?:[^"\\]|\\.)*)"'


def strs(body, key):
    m = re.search(key + r':\s*\[\]string\{(.*?)\},?\n', body, re.S)
    return [x.replace('\\"', '"') for x in re.findall(STR, m.group(1))] if m else []


specs = {}
for name, body in re.findall(r'\{\s*\n\s*Name:\s*"([^"]+)"(.*?)\n\t\t\},', src, re.S):
    d = re.search(r'Description:\s*' + STR, body)
    desc = d.group(1).replace('\\"', '"') if d else ''
    first = re.split(r'(?<=[.;])\s', desc, 1)[0]
    if len(first) > 220:
        first = first[:217] + '…'
    specs[name] = dict(desc=first, inputs=strs(body, 'Inputs'), verify=strs(body, 'VerifyWith'),
                       confirm=bool(re.search(r'NeedsConfirm:\s*true', body)))

v = L['vendor']
out = [
    '# eda 能力包的 action\n',
    f"由 easyeda-agent 的 action 目录（`internal/protocol/actions.go` @ `{v['commit'][:7]}`）按 vcorp-chrome "
    "`loads/eda/load.json` 的白名单整理，说明保留上游英文首句。重新生成：见 SKILL.md 末尾。\n",
    '调用：`node "$OVM_BROWSE/browser.mjs" call \'{"name":"eda","action":"<action>","payload":{…}}\'`。',
    '参数名以 Inputs 为准；拿不准就先传 `{}`，错误信息会说缺哪个字段。'
    '⚠ 标记的 action 会删东西或整片重做：扩展会在用户的浏览器里弹确认，同意后才执行，不用再另外 `ask`。'
    '用户不同意或没人响应时回 `CONFIRM_DECLINED`，不要重试。\n',
]
for kind, title in (('read', '## 只读（不改设计文件）'), ('write', '## 改动设计')):
    out.append(title + '\n')
    for a in L['actions'][kind]:
        s = specs.get(a, {})
        line = f"- `{a}`{' ⚠' if a in L.get('confirm', {}) else ''} — {s.get('desc', '')}".rstrip(' —')
        if s.get('inputs'):
            line += f"\n  - Inputs: {'; '.join(s['inputs'])}"
        if s.get('verify'):
            line += f"\n  - 核对：{', '.join('`' + x + '`' for x in s['verify'])}"
        out.append(line)
    out.append('')
out.append('## 不开放\n')
for a, why in L['denied'].items():
    out.append(f'- `{a}`：{why}')
open(sys.argv[3], 'w', encoding='utf-8', newline='\n').write('\n'.join(out) + '\n')
missing = [a for k in ('read', 'write') for a in L['actions'][k] if a not in specs]
print('missing from catalog:', missing)
