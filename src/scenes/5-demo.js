'use strict';
// 第 5 段 · 第五页 · 同题三解。
// 前半：三张窗口标题条（第 4 段交过来的 dsHoTrio）往下长成三个纸窗口 Claude Code / pi / DSH，
//   顶上一张需求纸条（测试 ✗ ✗ ✗ → 拦下 → 先写原因），三个窗口依次打出各自的写法，帕秋莉进来时三个窗口卷回成标题条、各打一个勾。
// 后半：DSH 的标题条拉长、裂成一条 tools/pre-execute 事件链（监听器 → test-gate → 监听器 → 默认放行 → 执行工具），这条链撑到段末：
//   漏掉 next（代码纸上划掉）→ 小纸圆片堆在 test-gate 上、后面全灰 → 符倒序揭掉、test-gate 拿走、链条接上 →
//   重启两次（动态定义没了，钉在 profile 上的插件还在）→ profile 摊成 dump-config 的 YAML 纸，收成 agent-loop 那一行（= dsHoRow）。
// 顶层名字带 M5 / m5 前缀。
const M5LINES = dsSeq(.8, [
  ['来做个对比：同一个需求，三个 harness 各做一遍。', { hold: .3 }],
  ['需求是：测试连续失败三次以后，拦下第四次，让 agent 先写下失败原因。', { pause: .2, hold: .8 }],
  ['Claude Code：让 Claude 写一个 mod，挂在工具调用事件上，数失败次数，第四次直接拒绝。', { pause: .3, hold: .5 }],
  ['pi：写一个 extension，在工具调用时返回 block 和原因，放进目录，reload 一下。', { pause: .3, hold: .5 }],
  ['DSH：agent 先查运行时，找到工具执行前的那个事件，再自己写插件、自己装上。', { pause: .3, hold: 1.1 }],
  ['三家都做到了。那 DSH 的看点在哪？', { who: 'patchouli', mood: 'smug', pause: .3 }],
  ['在出错以后。我们故意写错一个插件：漏掉一句 next。', { mood: 'proud', pause: .2, hold: .5 }],
  ['链条断在这一层：后面的监听器和默认的放行全被吞掉，工具一个都跑不起来。', { mood: 'awkward', pause: .2, hold: 1.2 }],
  ['把它卸载。它注册的监听器和工具按相反的顺序撤销，其余工具恢复正常。', { pause: .3, hold: 1 }],
  ['再重启一次。只活在内存里的动态定义，会被清空。', { pause: .3, hold: .6 }],
  ['经 Plugin Manager 装进配置的插件，重启以后还在。', { pause: .2, hold: .8 }],
  ['最后把整棵插件树打印出来：agent loop，只是其中一行。', { mood: 'proud', pause: .3, hold: 1.4 }],
]);
const M5T = i => M5LINES[i][0], M5E = i => M5LINES[i][1], M5W = (i, w) => dsWordT(M5LINES[i], w);
const M5DUR = M5E(M5LINES.length - 1) + 1.2;
const M5AC = P.blue;   // 本页的强调色
const M5MONO = DS_MONO.replace(/monospace\s*$/, 'WenKai, monospace');   // 代码里的中文字符串落到霞鹜文楷，不落到系统黑体

// ===================== 前半：三个窗口 =====================
const M5WIN = { y: DS_TRIO.y, w: DS_TRIO.w, bar: DS_TRIO.h, h: 530, hs: 140 };   // 长开以后 y 330–860；帕秋莉进来时卷成 140 高（底边 470，在她帽子上面）
// 卷起来以后每个窗口只留它拦下的那一句
const M5SUM = [["return { deny: … }", 'deny'], ['return { block: true, … }', 'block'], ["return { kind: 'deny', … }", 'kind']];
// 三家的写法（窗口只有 432 宽，按 19px 等宽字折行；isTest / fails 是示意）
const M5CODE = [
  ["on('tool.call', { tool: 'Bash' },",
   '  async ($, e, next) => {',
   '    if (isTest(e.command) &&',
   '        fails >= 3)',
   '      return { deny:',
   "        '先写下前三次失败的原因' }",
   '    return next(e)',
   '  })'],
  ['pi.on("tool_call",',
   '  async (event, ctx) => {',
   '    if (isTest(event) &&',
   '        fails >= 3)',
   '      return { block: true,',
   '        reason: "先写下失败原因" }',
   '  })'],
  ['> cordis_inspect_query',
   '  → tools/pre-execute',
   '',
   "ctx.on('tools/pre-execute',",
   '  async (exec, next) => {',
   '    if (isTest(exec) &&',
   '        fails >= 3)',
   "      return { kind: 'deny',",
   "        reason: '先写下失败原因' }",
   '    return next()',
   '  })',
   '',
   '> plugin_manager install_bundle'],
];

// m5Code：多行代码（同 dsCode，但中文落到霞鹜文楷、宽度按实际量）。
// o = { size, lh, p 整体打字进度, lp 每行打字进度（给了就不用 p）, al, hl {行: 0..1}, mark {词: 0..1}, strike {行: 0..1}, dim {行: 0..1} }
function m5Code(c, lines, x, y, o = {}) {
  const { size = 19, lh = Math.round(size * 1.5), p = 1, lp = null, al = 1, hl = {}, mark = {}, strike = {}, dim = {}, accent = M5AC } = o; if (al <= 0) return;
  const total = lines.reduce((a, l) => a + [...l].length + 1, 0), F = wt => `${wt} ${size}px ${M5MONO}`;
  let budget = p >= 1 ? Infinity : Math.floor(total * clamp(p, 0, 1) + 1e-6);
  c.save(); c.globalAlpha *= al; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  lines.forEach((ln, i) => { const yy = y + i * lh, len = [...ln].length;
    let n = lp ? Math.floor(len * clamp(lp[i] ?? 0, 0, 1) + 1e-6) : Math.min(len, budget); if (!lp) budget -= len + 1;
    c.font = F(400); const full = c.measureText(ln).width, ind = c.measureText(ln.slice(0, ln.length - ln.trimStart().length)).width;
    if ((hl[i] || 0) > 0) { c.save(); c.globalAlpha *= .2 * clamp(hl[i], 0, 1); c.fillStyle = accent; c.fillRect(x + ind - 8, yy - size * 1.02, full - ind + 16, lh * .95); c.restore(); }
    if (n > 0) { let xx = x; c.save(); if (dim[i]) c.globalAlpha *= 1 - .65 * clamp(dim[i], 0, 1);
      for (const [s, col, wt] of dsTok(ln)) { if (n <= 0) break; const cs = [...s], tt = cs.length <= n ? s : cs.slice(0, n).join(''); n -= cs.length;
        const mk = mark[s] ?? mark[s.replace(/^['"]|['"]$/g, '')] ?? 0;
        c.font = F(wt); c.fillStyle = mk > 0 ? mix(col, accent, clamp(mk, 0, 1)) : col; c.fillText(tt, xx, yy); xx += c.measureText(tt).width; }
      c.restore(); }
    if ((strike[i] || 0) > 0) rline(c, [[x + ind - 6, yy - size * .32], [x + full + 8, yy - size * .38]], { w: 3.2, color: P.red, p: strike[i], seed: 7540 + i, amp: .7 }); });
  c.restore();
}
// m5Strip：一张白纸条，上面一行等宽字（可以逐字打出来）。返回宽度
function m5Strip(c, text, x, y, o = {}) { const { size = 22, p = 1, k = 1, seed = 7560, al = 1, ink = P.ink } = o, w = dsMonoW(c, text, size) + size * 1.1, h = size * 1.7; if (k <= .001 || al <= 0) return w;
  c.save(); c.globalAlpha *= al;
  pop(c, x + w / 2, y, k, () => { cutPaper(c, [[x, y - h / 2 + 2], [x + w, y - h / 2], [x + w - 3, y + h / 2], [x + 2, y + h / 2 - 1]], DSC.slip, { seed, step: 30, blur: 4 });
    dsMono(c, text, x + size * .55, y + size * .34, { size, color: ink, p }); });
  c.restore(); return w; }

// 需求纸条（第 1 句）：测试 ✗ ✗ ✗ → 拦下 → 先写原因，放在窗口上面一排
function m5Req(c, tau, al) { if (al <= 0) return; const y = 246, t = tau;
  c.save(); c.globalAlpha *= al;
  dsLabel(c, '测试', 170, y, { size: 30, k: dsPop(tau, M5W(1, '测试') - .1), seed: 7301 });
  [M5W(1, '连续'), M5W(1, '失败') + .1, M5W(1, '三次')].forEach((t0, i) => cross(c, 284 + i * 78, y, 44, { p: dsK(tau, t0 - .05, .3), seed: 7302 + i, w: 6 }));
  const bk = dsK(tau, M5W(1, '拦下') - .15, .3);
  dsArrow(c, [500, y], [560, y], { p: bk, seed: 7306, t, w: 2.8, head: 12 });
  dsLabel(c, '拦下', 612, y, { size: 30, k: dsPop(tau, M5W(1, '拦下') + .05), seed: 7307, color: mix(DSC.slip, M5AC, .2), ink: mix(P.ink, M5AC, .6) });
  const wk = dsK(tau, M5W(1, '先写下') - .15, .3);
  dsArrow(c, [664, y], [724, y], { p: wk, seed: 7308, t, w: 2.8, head: 12 });
  dsLabel(c, '先写原因', 806, y, { size: 30, k: dsPop(tau, M5W(1, '先写下') + .05), seed: 7309, rot: -.015 });
  c.restore(); }

// 一个窗口和里面的东西。h 当前高度，ca 内容可见度
function m5Window(c, tau, i, o) { if ((o.k ?? 1) < 1) { const x = o.x ?? DS_TRIO.xs[i], y = o.y ?? M5WIN.y; pop(c, x + M5WIN.w / 2, y + o.h / 2, o.k, () => m5Window(c, tau, i, { ...o, k: 1 })); return; }
  const x = o.x ?? DS_TRIO.xs[i], y = o.y ?? M5WIN.y, w = M5WIN.w, h = o.h, t = tau, ca = o.ca ?? 1;
  const body = dsWindow(c, x, y, w, h, DS_TRIO.names[i], { seed: 7610 + i, bar: M5WIN.bar, al: o.al ?? 1, accent: o.tint > .001 ? mix(DSC.shade, M5AC, o.tint) : null });
  if (o.check > 0) { c.save(); c.globalAlpha *= o.al ?? 1; check(c, x + w - 46, y + M5WIN.bar / 2 + 2, 40, { p: o.check, seed: 7620 + i, t }); c.restore(); }
  if ((o.sum || 0) > 0 && h <= M5WIN.hs + 1) { const [ln, kw] = M5SUM[i];
    m5Code(c, [ln], x + w / 2 - dsMonoW(c, ln, 20) / 2, y + M5WIN.bar + 46, { size: 20, al: o.sum * (o.al ?? 1), mark: { [kw]: 1 } }); }
  if (ca <= 0 || h < M5WIN.h - 2) return;
  c.save(); c.globalAlpha *= ca * (o.al ?? 1);
  const cx = body.x, cy = body.y + 44;
  if (i === 0) {   // Claude Code：mod，挂在 tool.call 上
    const t0 = M5W(2, '写一个 mod') - .1, t1 = M5W(2, '直接拒绝') + .2;
    m5Code(c, M5CODE[0], cx, cy, { size: 19, lh: 30, p: dsK(tau, t0, t1 - t0, x => x),
      mark: { 'tool.call': dsK(tau, M5W(2, '挂在'), .3), fails: dsK(tau, M5W(2, '数失败'), .3), deny: dsK(tau, M5W(2, '直接拒绝'), .3) },
      hl: { 4: dsK(tau, M5W(2, '直接拒绝') + .1, .3), 5: dsK(tau, M5W(2, '直接拒绝') + .1, .3) } });
    dsLabel(c, '示意', x + w - 58, body.y + 8, { size: 24, k: dsPop(tau, t0 + .3), seed: 7631, rot: .04, ink: P.ink2 });
    zh(c, '本会话热加载（要你同意）', cx, y + h - 34, { size: 24, color: P.ink2, al: dsK(tau, M5W(2, '直接拒绝') + .7, .35) });
  } else if (i === 1) {   // pi：extension，返回 block
    const t0 = M5W(3, '写一个') - .1, t1 = M5W(3, '和原因') + .2;
    m5Code(c, M5CODE[1], cx, cy, { size: 19, lh: 30, p: dsK(tau, t0, t1 - t0, x => x),
      mark: { tool_call: dsK(tau, M5W(3, '工具调用时'), .3), block: dsK(tau, M5W(3, 'block'), .3), reason: dsK(tau, M5W(3, '和原因'), .3) },
      hl: { 4: dsK(tau, M5W(3, 'block'), .3), 5: dsK(tau, M5W(3, '和原因'), .3) } });
    dsLabel(c, '示意', x + w - 58, body.y + 8, { size: 24, k: dsPop(tau, t0 + .3), seed: 7632, rot: -.03, ink: P.ink2 });
    dsMono(c, '.pi/extensions/', cx, y + h - 34, { size: 20, color: P.ink2, al: dsK(tau, M5W(3, '放进目录') - .1, .3) });
    const dx = dsMonoW(c, '.pi/extensions/', 20);
    zh(c, '·', cx + dx + 12, y + h - 34, { size: 24, color: P.g2, al: dsK(tau, M5W(3, 'reload') - .1, .3) });
    dsMono(c, '/reload', cx + dx + 34, y + h - 34, { size: 20, color: mix(P.ink, M5AC, .6), al: dsK(tau, M5W(3, 'reload') - .1, .3) });
  } else {   // DSH：先查运行时 → 找到事件 → 写插件 → 自己装上
    const L = M5CODE[2], tq = M5W(4, '先查') - .1, tf = M5W(4, '找到') - .05, tw = M5W(4, '自己写插件') - .1, ti = M5W(4, '自己装上') - .1;
    const lp = L.map((ln, j) => j === 0 ? dsK(tau, tq, .6, x => x) : j === 1 ? dsK(tau, tf, .45, x => x) : j >= 3 && j <= 10 ? clamp((tau - tw - (j - 3) * .22) / .3, 0, 1) : j === 12 ? dsK(tau, ti, .6, x => x) : 0);
    m5Code(c, L, cx, cy, { size: 19, lh: 28, lp,
      mark: { 'tools/pre-execute': dsK(tau, tf + .3, .3), cordis_inspect_query: dsK(tau, tq + .5, .3) * .7, plugin_manager: dsK(tau, ti + .5, .3) * .7, install_bundle: dsK(tau, ti + .5, .3) * .7 },
      hl: { 1: dsK(tau, tf + .35, .3) } });
    dsLabel(c, '示意', x + w - 58, body.y + 8, { size: 24, k: dsPop(tau, tw + .3), seed: 7633, rot: .03, ink: P.ink2 });
  }
  c.restore(); }

// ===================== 后半：tools/pre-execute 事件链 =====================
const M5CH = { y: 230, h: 110, w: 190, xs5: [170, 434, 698, 962, 1226], xs4: [170, 522, 874, 1226], names: ['监听器', 'test-gate', '监听器', '默认放行', '执行工具'] };
const M5CY = M5CH.y + M5CH.h / 2, M5GX = M5CH.xs5[1] + M5CH.w / 2;   // 链的中线、test-gate 的中心 x
const M5EXEC = M5CH.xs5[4] + M5CH.w / 2;                               // 执行工具的中心 x
// 小纸圆片堆在 test-gate 顶上的位置（相对 test-gate 顶边中点）：底下 4 个，中间 3 个，上面 2 个
const M5HEAP = [[4, 0], [3, 1], [2, 2]].flatMap(([n, row]) => Array.from({ length: n }, (_, j) => [(j - (n - 1) / 2) * 27 + (row % 2 ? 2 : 0), -15 - row * 23]));
// 坏插件（漏掉 next）的代码纸
const M5BAD = ["ctx.on('tools/pre-execute', async (exec, next) => {",
  '  if (isTest(exec) && fails >= 3)',
  "    return { kind: 'deny', reason: '先写下失败原因' }",
  '  return next()',
  '})'];
const M5BADBOX = { x: 220, y: 420, w: 700 };
// 下半页（第 9–11 句）
const M5RST = [744, 446];                 // 「重启」纸条（左边一个手画的回转箭头）
const M5DYN = [220, 548, 400, 128];       // 虚线纸片：动态定义（内存）
const M5PRO = [800, 520, 520, 300];       // profile 纸
const M5PLG = [880, 610, 320, 126];       // 钉在 profile 上的插件纸片
const M5YAML = { x: 430, y: 490, w: 660, h: 330 };
const M5DUMP = ['# == @deepseek-ai/dsh-base',
  '- id: tools',
  "  name: '@deepseek-ai/dsh-tools'",
  '- id: system-prompt',
  "  name: '@deepseek-ai/dsh-system-prompt'",
  '- id: agent-loop',
  "  name: '@deepseek-ai/dsh-agent-loop'",
  '  config: { agents: [] }'];

// 关键时刻（段内秒）
function m5Times() {
  const peel1 = M5W(8, '撤销') + .05, gone = peel1 + .6;
  return {
    grow: M5W(0, '三个') - .25, roll: M5T(5) - .75, out: M5T(6) + .05, stretch: M5T(6) + .2, split: M5T(6) + .75,
    tok0: M5T(7) + .1, unload: M5W(8, '卸载') - .15, tal1: M5W(8, '监听器') - .1, tal2: M5W(8, '和工具') - .05, peel2: M5W(8, '相反') - .05, peel1, gone, rel: gone + .15, close: gone + .25,
    blink1: M5W(9, '清空') - .1, blink2: M5W(10, '重启以后') - .1, dump: M5T(11) + .15, yaml: M5W(11, '打印') - .25, settle: M5DUR - 1.35,
  };
}
// 重启：页面上的东西 0.15 秒淡出、空 0.22 秒、0.3 秒回来
const m5Dip = (tau, t0) => 1 - sm(t0, t0 + .15, tau) + sm(t0 + .37, t0 + .67, tau);

// 第 k 枚小纸圆片：返回 [x, y, 透明度, 半径, 画在节点上面?] 或 null（走在链上的从节点底下穿过去，堆在 test-gate 顶上的画在上面）
function m5Tok(k, tau, T) {
  const r0 = 13;
  if (k < 9) {   // 第 7 句：一枚枚走到 test-gate，过不去，堆在它顶上；第 8 句 test-gate 拿走后落回链上，流到执行工具
    const s = T.tok0 + k * .62; if (tau < s) return null;
    const [hx, hy] = [M5GX + M5HEAP[k][0], M5CH.y + M5HEAP[k][1]], rel = T.rel + k * .08;
    const gx0 = M5CH.xs5[1] - 18;   // 停在 test-gate 左边
    if (tau < s + .8) return [lerp(96, gx0, easeIO((tau - s) / .8)), M5CY, sm(s, s + .15, tau), r0, false];
    if (tau < rel) { const u = clamp((tau - s - .8) / .32, 0, 1), e = easeOut(u); return [lerp(gx0, hx, e), lerp(M5CY, hy, e) - Math.sin(u * Math.PI) * 36, 1, r0, true]; }
    if (tau < rel + .3) { const u = easeIn((tau - rel) / .3); return [hx, lerp(hy, M5CY, u), 1, r0, true]; }
    const u = (tau - rel - .3) / .95; if (u >= 1.25) return null;
    return [lerp(hx, M5EXEC, easeIO(clamp(u, 0, 1))), M5CY, 1 - sm(1, 1.25, u), r0, false];
  }
  const s = M5W(8, '其余') + (k - 9) * .42, u = (tau - s) / 1.5; if (u < 0 || u >= 1.25) return null;   // 恢复以后：从头一路走到执行工具
  return [lerp(96, M5EXEC, easeIO(clamp(u, 0, 1))), M5CY, sm(0, .1, u) * (1 - sm(1, 1.25, u)), r0, false];
}

// 事件链（含 test-gate 身上的符、代码纸、小纸圆片）。o = { k 出现 0..1, al }
function m5Chain(c, tau, T, al) { if (al <= 0) return; const t = tau, C = M5CH;
  c.save(); c.globalAlpha *= al;
  const close = dsK(tau, T.close, .45, easeIO), goneK = dsK(tau, T.gone, .4, easeIn);   // 合拢、test-gate 拿走
  const nx = j => j === 0 ? C.xs5[0] : j === 1 ? C.xs5[1] : lerp(C.xs5[j], C.xs4[j - 1], close);
  const nk = j => dsPop(tau, T.split + j * .08, .35);
  const dimOf = j => j < 2 ? 0 : Math.max(0, dsK(tau, [M5W(7, '后面的监听器'), M5W(7, '默认的放行'), M5W(7, '工具一个')][j - 2] - .1, .35) - close);
  // 事件名
  dsLabel(c, 'tools/pre-execute', C.xs5[0], 186, { mono: true, size: 24, align: 'left', k: dsPop(tau, T.split + .3), seed: 7701 });
  // 箭头：入口 → 监听器 → test-gate → 监听器 → 默认放行 → 执行工具（test-gate 拿走后，第一个监听器直接连到第二个）
  const ap = j => dsK(tau, T.split + .35 + j * .1, .3);
  dsArrow(c, [96, M5CY], [C.xs5[0] - 10, M5CY], { p: ap(0), seed: 7710, t, w: 3 });
  const gA = 1 - goneK, dimA = j => 1 - .55 * dimOf(j);
  dsArrow(c, [nx(0) + C.w + 6, M5CY], [nx(1) - 10, M5CY], { p: ap(1), seed: 7711, t, al: gA });
  dsArrow(c, [nx(1) + C.w + 6, M5CY], [nx(2) - 10, M5CY], { p: ap(2), seed: 7712, t, al: gA * dimA(2) });
  dsArrow(c, [nx(0) + C.w + 6, M5CY], [nx(2) - 10, M5CY], { p: dsK(tau, T.close + .25, .35), seed: 7713, t });
  dsArrow(c, [nx(2) + C.w + 6, M5CY], [nx(3) - 10, M5CY], { p: ap(3), seed: 7714, t, al: dimA(3) });
  dsArrow(c, [nx(3) + C.w + 6, M5CY], [nx(4) - 10, M5CY], { p: ap(4), seed: 7715, t, al: dimA(4) });
  // 第 7 句：链条在 test-gate 后面断开（一道红的断口）
  const brk = dsK(tau, M5W(7, '断在') - .05, .3) * gA;
  if (brk > 0) { const bx = C.xs5[1] + C.w + 30; [-7, 7].forEach((d, i) => rline(c, [[bx + d - 7, M5CY - 20], [bx + d + 7, M5CY + 20]], { w: 4, color: P.red, p: brk, seed: 7716 + i, t, al: gA })); }
  // 走在链上的小纸圆片（从节点底下穿过去）
  const toks = Array.from({ length: 13 }, (_, k) => m5Tok(k, tau, T));
  toks.forEach((q, k) => { if (q && !q[4]) dsToken(c, q[0], q[1], q[3], P.moon, { al: q[2], seed: 7760 + k }); });
  // 节点
  [0, 2, 3, 4].forEach(j => dsNode(c, nx(j), C.y, C.w, C.h, C.names[j], { size: 30, k: nk(j), dim: dimOf(j), seed: 7720 + j, hi: j === 4 ? dsBump(tau, M5W(8, '恢复正常') - .1, 1.6) : 0, accent: M5AC }));
  if (goneK < 1) { const gk = nk(1); c.save(); c.globalAlpha *= 1 - goneK; c.translate(0, -goneK * 70);
    dsNode(c, nx(1), C.y, C.w, C.h, C.names[1], { size: 30, k: gk * (1 + goneK * .08), seed: 7721, color: mix(DSC.slip, P.red, .1 * dsK(tau, M5W(6, '写错') - .1, .4)) });
    // 第 8 句：它身上的两张符（监听事件、注册工具），按相反的顺序揭掉
    dsTalisman(c, M5GX - 30, C.y + C.h + 52, '监听事件', { k: dsK(tau, T.tal1, .35), peel: dsK(tau, T.peel1, .6, easeIn), rot: -.06, seed: 7731, w: 48, h: 136 });
    dsTalisman(c, M5GX + 30, C.y + C.h + 52, '注册工具', { k: dsK(tau, T.tal2, .35), peel: dsK(tau, T.peel2, .6, easeIn), rot: .05, seed: 7733, w: 48, h: 136 });
    c.restore(); }
  // 执行工具恢复以后打个勾
  const ok = dsK(tau, M5W(8, '恢复正常') + .2, .35) * (1 - dsK(tau, M5T(9) - .2, .4));
  if (ok > 0) check(c, C.xs4[3] + C.w - 4, C.y - 14, 40, { p: ok, seed: 7740, t });
  // 第 6 句：坏插件的代码纸（漏掉 next，那行被划掉）；第 8 句「卸载」时收回 test-gate 里
  const bk = dsPop(tau, M5W(6, '写错') - .05), suck = dsK(tau, T.unload, .4, easeIn);
  if (bk > 0 && suck < 1) { const B = M5BADBOX, bh = 26 + M5BAD.length * 31 + 18;
    c.save(); c.globalAlpha *= 1 - sm(.6, 1, suck); c.translate(lerp(0, M5GX - (B.x + B.w / 2), suck), lerp(0, M5CY - (B.y + bh / 2), suck));
    pop(c, B.x + B.w / 2, B.y + bh / 2, bk * (1 - .85 * suck), () => {
      rline(c, [[M5GX, B.y - 4], [M5GX, C.y + C.h + 6]], { w: 2, color: P.g2, dash: [6, 7], seed: 7751, amp: .5, al: 1 - suck });
      dsSlip(c, B.x, B.y, B.w, bh, { seed: 7752, r: 8 });
      m5Code(c, M5BAD, B.x + 26, B.y + 26 + 20, { size: 20, lh: 31, strike: { 3: dsK(tau, M5W(6, 'next') - .1, .4) }, dim: { 3: dsK(tau, M5W(6, 'next') + .2, .3) }, mark: { next: dsK(tau, M5W(6, 'next') - .2, .3) } }); });
    c.restore(); }
  // 堆在 test-gate 顶上的小纸圆片
  toks.forEach((q, k) => { if (q && q[4]) dsToken(c, q[0], q[1], q[3], P.moon, { al: q[2], seed: 7760 + k }); });
  c.restore(); }

// 回转箭头（重启）
function m5Spin(c, x, y, r, a, o = {}) { const al = o.al ?? 1; if (al <= 0) return;
  c.save(); c.globalAlpha *= al; c.translate(x, y); c.rotate(a);
  const pts = Array.from({ length: 22 }, (_, i) => { const b = -Math.PI / 2 + .35 + i / 21 * (TAU - 1.1); return [Math.cos(b) * r, Math.sin(b) * r]; });
  rline(c, pts, { w: 3, color: o.color || P.ink2, seed: 7781, amp: .4 });
  const e = pts.at(-1), b = -Math.PI / 2 + .35 + (TAU - 1.1), tg = b + Math.PI / 2;
  rline(c, [[e[0] - Math.cos(tg - .55) * 11, e[1] - Math.sin(tg - .55) * 11], e, [e[0] - Math.cos(tg + .55) * 11, e[1] - Math.sin(tg + .55) * 11]], { w: 3, color: o.color || P.ink2, seed: 7782, amp: .3 });
  c.restore(); }

// 下半页：重启、动态定义、profile、dump-config
function m5Lower(c, tau, T, dip) { const t = tau;
  // 「重启」纸条：第 9 句出来，两次重启时转一圈，第 10 句说完收走
  const rk = dsPop(tau, M5W(9, '重启') - .1) * (1 - dsK(tau, M5E(10) - .3, .35));
  if (rk > 0) { const spin = TAU * (sm(T.blink1, T.blink1 + .67, tau) + sm(T.blink2, T.blink2 + .67, tau));
    m5Spin(c, M5RST[0] - 62, M5RST[1], 19, spin, { al: rk, color: M5AC });
    dsLabel(c, '重启', M5RST[0], M5RST[1], { size: 30, k: rk, seed: 7783, ink: mix(P.ink, M5AC, .5) }); }
  c.save(); c.globalAlpha *= dip;
  // 虚线纸片：动态定义（内存）——第一次重启时没了，只剩一圈虚线慢慢淡掉
  const dk = dsPop(tau, M5W(9, '动态定义') - .1), gone1 = tau >= T.blink1 + .26;
  if (dk > 0) { const [x, y, w, h] = M5DYN;
    if (!gone1) { pop(c, x + w / 2, y + h / 2, dk, () => { c.save(); c.globalAlpha *= .55; cutPaper(c, rectPts(x, y, w, h, 12), '#f4f1ea', { seed: 7784, step: 22, blur: 3, sx: 1, sy: 2, grain: .05 }); c.restore();
        dsDashBox(c, x, y, w, h, { p: 1, t, seed: 7785, color: P.g3, r: 12 });
        zh(c, '动态定义（内存）', x + w / 2, y + h / 2 + 11, { size: 30, align: 'center', color: P.ink2 }); }); }
    else dsDashBox(c, x, y, w, h, { p: 1, t, seed: 7785, color: P.g2, r: 12, al: 1 - dsK(tau, T.blink1 + .7, .6) }); }
  // profile 纸 + 钉在上面的插件纸片（第 10 句），第 11 句摊成 dump-config 的 YAML 纸
  const pk = dsPop(tau, M5W(10, 'Plugin') - .1), yk = dsK(tau, T.yaml, .45, easeIO);
  if (pk > 0 && yk < 1) {
    const R = { x: lerp(M5PRO[0], M5YAML.x, yk), y: lerp(M5PRO[1], M5YAML.y, yk), w: lerp(M5PRO[2], M5YAML.w, yk), h: lerp(M5PRO[3], M5YAML.h, yk) };
    const inA = 1 - sm(0, .4, yk);   // profile 上的东西先淡掉
    dsSlip(c, R.x, R.y, R.w, R.h, { seed: 7700, r: 8, k: pk });
    if (inA > 0) { c.save(); c.globalAlpha *= inA;
      dsLabel(c, 'profile', M5PRO[0] + 26, M5PRO[1], { mono: true, size: 24, align: 'left', k: pk, seed: 7791 });
      const lk = dsK(tau, M5W(10, '装进配置') - .2, .4, easeOut);   // 插件纸片落下来，钉上
      if (lk > 0) { const [x, y, w, h] = M5PLG, dy = (1 - lk) * -60;
        dsNode(c, x, y + dy, w, h, '插件', { size: 34, sub: 'install_bundle', subSize: 18, seed: 7792, al: sm(0, .3, lk), hi: dsBump(tau, M5W(10, '还在') - .1, 1.2) * .8, accent: M5AC });
        const pin = dsPop(tau, M5W(10, '装进配置') + .2, .3); pop(c, x + w / 2, y + 14, pin, () => brassPin(c, x + w / 2, y + 14, 11)); }
      const ok = dsK(tau, M5W(10, '还在') - .05, .35);
      if (ok > 0) check(c, M5PLG[0] + M5PLG[2] + 46, M5PLG[1] + M5PLG[3] / 2, 48, { p: ok, seed: 7793, t });
      c.restore(); }
  }
  c.restore();
}

// 第 11 句：dump-config 的命令、YAML、收成 agent-loop 那一行
function m5Dump(c, tau, T) {
  const yk = dsK(tau, T.yaml, .45, easeIO); if (tau < T.dump) return;
  const fold = dsK(tau, T.settle, .35, easeIO), move = dsK(tau, T.settle + .35, .45, easeIO);
  const restA = 1 - fold;
  // 命令
  m5Strip(c, '$ dsh --profile web --dump-config', M5YAML.x, M5YAML.y - 46, { size: 22, k: dsPop(tau, T.dump), p: dsK(tau, T.dump + .15, .8, x => x), al: restA, seed: 7795 });
  if (yk <= 0) return;
  const Y = M5YAML, cy0 = Y.y + 46, lh = 36, hlK = dsK(tau, M5W(11, 'agent loop') - .15, .35);
  // 收：前 5 行淡掉，纸边收到 agent-loop 那三行，再整体挪到 DS_ROW
  const top = lerp(Y.y, Y.y + 5 * lh, fold), hh = lerp(Y.h, DS_ROW.h, fold), dy = lerp(0, DS_ROW.y - (Y.y + 5 * lh), move);
  if (yk >= 1) dsSlip(c, Y.x, top + dy, Y.w, hh, { seed: 7700, r: 8 });
  const p = dsK(tau, T.yaml + .3, .75, x => x);
  c.save(); c.translate(0, dy);
  if (restA > 0) { c.save(); c.globalAlpha *= restA * yk; dsCode(c, M5DUMP.slice(0, 5), Y.x + 30, cy0, { size: 22, lh, p: clamp(p * 1.6, 0, 1) }); c.restore(); }
  dsCode(c, M5DUMP.slice(5), Y.x + 30, cy0 + 5 * lh, { size: 22, lh, p: clamp(p * 1.6 - .6, 0, 1), hl: { 0: hlK, 1: hlK }, accent: M5AC, al: yk });
  c.restore();
  dsLabel(c, '节选', Y.x + Y.w - 52, Y.y + 2, { size: 24, k: dsPop(tau, T.yaml + .5), seed: 7796, rot: .04, ink: P.ink2, al: restA });
}

function m5Draw(c, tau, L) {
  const T = m5Times();
  dsPage(c, tau, '第五页 · 同题三解');
  const endK = tau >= T.settle + .8;
  if (tau < T.grow) dsHoTrio(c);                // 段首：只画交接画面
  else if (endK) dsHoRow(c);                     // 段末：只画交接画面
  else {
    // ---- 前半：三个窗口 ----
    const roll = dsK(tau, T.roll, .35, easeIO), out = dsK(tau, T.out, .4, easeIn);
    m5Req(c, tau, 1 - dsK(tau, T.out, .35));
    if (tau < T.split + .4) for (let i = 0; i < 3; i++) {
      const g = dsK(tau, T.grow + i * .15, .5, easeIO), h = roll > 0 ? lerp(M5WIN.h, M5WIN.hs, roll) : lerp(M5WIN.bar, M5WIN.h, g);
      const ca = 1 - dsK(tau, T.roll - .1, .2), check = dsK(tau, M5W(5, '三家') + i * .18, .3), sum = dsK(tau, T.roll + .3, .3) * (1 - dsK(tau, T.stretch, .2));
      const tint = .3 * dsWin(tau, [[M5T(2 + i) - .2, M5E(2 + i) - .3]]) + (i === 2 ? .45 * dsK(tau, M5W(5, 'DSH') - .1, .35) : 0);   // 正在讲的那个窗口，标题条染一点蓝
      if (i < 2) m5Window(c, tau, i, { h, ca, check, sum, tint, k: 1 - .08 * out, al: 1 - out });
      else { // DSH：先拉长成一条纸带（铺满链的位置），再裂成五个节点
        const st = dsK(tau, T.stretch, .5, easeIO), sp = dsK(tau, T.split, .35);
        const x = lerp(DS_TRIO.xs[2], M5CH.xs5[0], st), y = lerp(M5WIN.y, M5CH.y, st), w = lerp(M5WIN.w, M5CH.xs5[4] + M5CH.w - M5CH.xs5[0], st);
        if (st <= 0) m5Window(c, tau, 2, { h, ca, check, sum, tint });
        else { c.save(); c.globalAlpha *= 1 - sp; const bh = lerp(M5WIN.hs, M5CH.h, st);
          dsWindow(c, x, y, w, bh, 'DSH', { seed: 7612, bar: lerp(M5WIN.bar, M5CH.h, st), accent: mix(DSC.shade, M5AC, .45) }); c.restore(); }
      }
    }
    // ---- 后半：事件链 + 下半页 ----
    if (tau >= T.split) {
      const dip = m5Dip(tau, T.blink1) * m5Dip(tau, T.blink2), chA = dip * (1 - dsK(tau, T.settle, .35));
      m5Chain(c, tau, T, chA);
      m5Lower(c, tau, T, dip);
      m5Dump(c, tau, T);
    }
  }
  // ---- 人物 ----
  dsCast(c, tau, L, M5LINES, {
    ranPose: tt => tt < M5T(0) + .3 || tt > M5DUR - .9 ? 'stand' : tt < M5T(2) ? 'present' : tt < M5E(4) ? 'point' : tt < M5T(6) ? 'stand' : tt < M5E(8) ? 'point' : tt < M5T(11) ? 'stand' : 'present',
    pchPose: tt => tt < M5W(5, '那') ? 'point' : 'lecture' });
}

scene({ order: 5, key: 'demo', title: '同题三解', dur: M5DUR, lines: M5LINES, fn: m5Draw, noFlip: true });
