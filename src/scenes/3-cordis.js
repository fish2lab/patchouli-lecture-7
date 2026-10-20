'use strict';
// 第 3 段 · 第三页 · Cordis：插件在进程里是有状态的 → 可逆副作用（时间）+ 依赖响应（空间）→ 它来自 Koishi → DSH 收进 vendor/cordis。
// 主物件：一棵用铜钉和线钉在纸上的插件树。根 DSH 在下面，上面一道弧排着服务和插件的纸片（服务的纸色深一点），线从根上的钉拉到每张纸片的钉。
// 插件做的每一次注册，是贴在它身上的一张符（props 的 dsTalisman）；依赖是一根绿线。
//   开头：第 2 段的阶梯（dsHoStairs），第三级「可组合内核」缩成树根，agent loop 纸片落进树里变成 agent-loop，前两级倒下去。
//   1–6 句：推近 test-gate：贴三张符、别的插件拉一根线 → 硬拔（符悬空、线头垂下）→ 倒回 → 符翻面「撤销」+ register() 真代码
//          → 下面一根时间线：贴上是 1、2、3，卸载时 3、2、1 揭掉。
//   7–9 句：回到整棵树：consumer 用 inject 要 greeter；greeter 拿走 → 线垂下、consumer 变灰「等待」→ 回来 → 重新亮起；论文纸条。
//   11–13 句：树缩到右边，左边长出 Koishi 的小树（根也是 Cordis）；卸一个插件，符一张张揭掉；
//          Cordis 的根复制一份嵌进 DSH 树底下（vendor/cordis），整棵树压进去，变成地基板（= dsHoSlab）。
// 顶层名字带 C3 / c3 前缀。
const C3LINES = dsSeq(.8, [
  ['连循环都能换……拔错一个，不就全乱了？', { who: 'patchouli', mood: 'flustered' }],
  ['难点就在这儿：插件在进程里是有状态的。', { pause: .2, hold: .4 }],
  ['它注册了工具，挂了监听器，还被别的插件依赖着。', { pause: .2, hold: .5 }],
  ['要是直接拔掉，这些注册还留在原地，就成了悬空引用。', { mood: 'awkward', pause: .2, hold: 1.2 }],
  ['就像撤掉一个式神，贴出去的符也要一张张收回来？', { who: 'patchouli', mood: 'smug', pause: .3 }],
  ['正是。Cordis 管这叫可逆副作用：每一次注册，都附带一张撤销的符。', { mood: 'happy', pause: .2, hold: 1 }],
  ['插件卸载时，按相反的顺序，一张张揭掉。这是时间上的可组合。', { pause: .2, hold: 1.2 }],
  ['第二件事，叫依赖响应。插件用 inject 写明自己要哪些服务。', { pause: .4, hold: .4 }],
  ['服务到齐才启动；服务一走，依赖它的插件先停下，等它回来再重新加载。', { pause: .2, hold: 1 }],
  ['这是空间上的可组合。Cordis 的论文，题目就叫时空可组合性的编程范式。', { pause: .2, hold: 1.2 }],
  ['这套东西，是为 agent 发明的？', { who: 'patchouli', pause: .3 }],
  ['不是。它来自 Koishi：4.7 版把核心框架独立出来，取名 Cordis。', { pause: .2, hold: .6 }],
  ['Koishi 的插件本来就要支持热重载，卸载时必须清掉所有副作用。', { pause: .2, hold: .6 }],
  ['DSH 把 Cordis 的源码整个收进了自己的仓库。', { pause: .2, hold: 1.2 }],
]);
const C3T = i => C3LINES[i][0], C3E = i => C3LINES[i][1], C3W = (i, w) => dsWordT(C3LINES[i], w);
const C3DUR = C3E(C3LINES.length - 1) + 1.6;
const C3AC = P.green;                         // 本页的强调色
const C3DEP = mix(P.green, P.ink, .2);        // 依赖的线

// ---- 树：根 DSH 在下，六个位置排成一道弧（从左到右 0..5）----
const C3RT = { x: 810, y: 640, w: 220, h: 90 }, C3ANC = [920, 730];   // 根纸片、整棵树缩放的锚点（根底边中点）
const C3NW = 180, C3NH = 76;
const C3SL = [-165, -135, -105, -75, -45, -15].map(a => [920 + Math.cos(a * Math.PI / 180) * 420, 650 + Math.sin(a * Math.PI / 180) * 420]);
const C3PIN = (x, y, s = 1) => [x, y + (C3NH / 2 - 13) * s];          // 纸片底边中间的钉（树上的线拴在这儿）
const C3RPIN = x => [920 + (x - 920) * .2, 654];                       // 根上的钉：每根线一颗，沿根的上沿排开
// ---- 推近以后的 test-gate、它身上的三张符、「别的插件」----
const C3F = { x: 590, y: 330, s: 1.6 };
const C3TAL = [['注册工具', -72, -.05], ['监听事件', 0, .03], ['副作用', 72, -.03]];   // [字, 相对 test-gate 中心的 x, 歪一点]
const C3TALY = 446, C3TW = 56, C3TH = 166;
const C3OTH = { x: 1010, y: 332, w: 240, h: 92 };
const C3CODE = ['register(label, hooks, callback, options) {', "  const method = options.prepend ? 'unshift' : 'push'", '  return this.ctx.fiber.effect(() => {',
  '    hooks[method]({ ctx: this.ctx, callback, ...options })', '    return () => this.unregister(hooks, callback)', '  }, label)', '}'];
// ---- Koishi 的小树（第 11–13 句，左边）：根和 dsCordisSlab(sub: null) 同一张纸，好让复制出来的那张和它一模一样 ----
const C3KR = { x: 290, y: 646, w: 200, h: 84 }, C3KPIN = [390, 660];
const C3KN = [['echo', 165, 516], ['dice', 390, 386], ['weather', 615, 516]], C3KW = 150, C3KH = 64;
const C3KTAL = [['监听事件', -25], ['注册指令', 25]];
const C3LAND = { x: 980, y: 743, w: 200, h: 84 };      // 复制的 Cordis 落在 DSH 根底下（树缩到右边时根底边中点在 x 1080）

// ===================== 时间 =====================
const c3Fo = tau => dsK(tau, C3W(1, '插件') - .15, .45, easeIO);                      // 推近 test-gate
const c3Uf = tau => dsK(tau, C3T(7) - .35, .45, easeIO);                              // 拉回整棵树
const c3Yank = tau => dsK(tau, C3W(3, '拔掉') - .2, .4, easeIn) * (1 - dsK(tau, C3T(4) + .15, .45, easeOut));   // 硬拔，第 4 句倒回去
const c3Stick = i => i < 2 ? C3W(2, ['注册', '监听'][i]) - .05 : C3W(2, '监听') + .55;
const c3Peel = i => C3W(6, '一张张') - .1 + (2 - i) * .45;                          // 3、2、1 依次揭掉
const c3Unload = () => c3Peel(0) + .45;
const c3Cp = tau => dsK(tau, C3W(13, '仓库') + .45, .8, easeIO);                       // 整棵树压进地基板
const c3End = () => C3W(13, '仓库') + .45 + .8 + .05;
const c3Swing = (tau, t0, a = 22) => tau < t0 ? 0 : Math.sin((tau - t0) * 5.5) * a * Math.exp(-(tau - t0) * 1.7);

// ===================== 画具 =====================
// c3Plug：一张插件 / 服务纸片（中心 x, y），等宽名字。o = { w, h, s, k, al, dim 变灰, hi 强调（绿）, svc 服务, lift, rot, seed, size, zhName }
function c3Plug(c, x, y, name, o = {}) {
  const { w = C3NW, h = C3NH, s = 1, k = 1, al = 1, dim = 0, hi = 0, svc = false, lift = 0, rot = 0, seed = 3100, size = 26, zhName = false } = o;
  if (k <= .001 || al <= .001) return;
  const base = svc ? mix(DSC.slip, DSC.shade, .6) : DSC.slip, col = mix(mix(base, C3AC, .22 * hi), P.g1, .6 * dim), ink = mix(mix(P.ink, C3AC, .75 * hi), P.g2, .8 * dim);
  c.save(); c.globalAlpha *= al; c.translate(x, y); c.rotate(rot); c.scale(s * k, s * k);
  dsSlip(c, -w / 2, -h / 2, w, h, { color: col, seed, lift, r: 12 });
  const ty = (zhName ? size * .36 : size * .34) - 7 - lift * 8;
  if (zhName) zh(c, name, 0, ty, { size, align: 'center', color: ink }); else dsMono(c, name, 0, ty, { size, align: 'center', color: ink });
  c.restore();
}
// c3Loc：纸片局部坐标 → 屏幕坐标（纸片中心 x, y，缩放 s，转 rot，抬起 lift）
function c3Loc(x, y, s, rot, lx, ly, lift = 0) { const yy = ly - lift * 8, ca = Math.cos(rot), sa = Math.sin(rot); return [x + (lx * ca - yy * sa) * s, y + (lx * sa + yy * ca) * s]; }
function c3Pin(c, p, s = 1, al = 1) { if (al <= .001) return; c.save(); c.globalAlpha *= al; brassPin(c, p[0], p[1], 7.5 * s); c.restore(); }
// c3Rope：一根线（照 kit 的 thread）：a → b，中间往下垂 sag，再往一侧鼓 bow（垂着的线头用 bow 弯一点）
function c3Rope(c, a, b, o = {}) {
  const { sag = 16, bow = 0, p = 1, color = '#6b4f55', w = 2.2, seed = 3200, al = 1 } = o; if (p <= 0 || al <= .001) return;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, pts = [];
  for (let i = 0; i <= 20; i++) { const u = i / 20, s = Math.sin(u * Math.PI); pts.push([a[0] + dx * u + nx * bow * s, a[1] + dy * u + sag * s + ny * bow * s]); }
  c.save(); c.globalAlpha *= al; rline(c, pts, { w, color, p, seed, amp: .4 }); c.restore();
}
// c3TalBack：符的背面——同样的纸型，淡绿纸、绿字（「撤销」）。参数同 dsTalisman
function c3TalBack(c, x, y, text, o = {}) { const { k = 1, peel = 0, rot = 0, seed = 3300, w = 50, h = 150, al = 1 } = o; if (k <= .001 || peel >= 1 || al <= 0) return;
  c.save(); c.globalAlpha *= al * (1 - sm(.55, 1, peel)); c.translate(x + peel * 60, y - peel * 120 - peel * peel * 40); c.rotate(rot + peel * .9);
  const z = lerp(.6, 1, easeOutBack(clamp(k, 0, 1))); c.scale(z, z);
  cutPaper(c, rectPts(-w / 2, -h / 2, w, h, 2), mix(DSC.slip, C3AC, .2), { seed, step: 14, blur: 3 + peel * 10, sx: 1 + peel * 6, sy: 2 + peel * 8, grain: .12 });
  rline(c, rectPts(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10), { w: 1.6, color: alpha(C3AC, .85), close: true, seed: seed + 1, amp: .5 });
  const chs = [...String(text)], fs = Math.min(w * .62, (h - 24) / Math.max(1, chs.length) * .95);
  chs.forEach((ch, i) => zh(c, ch, 0, -h / 2 + 18 + fs * (i + .86), { size: fs, align: 'center', color: mix(C3AC, P.ink, .25) }));
  c.restore(); }
// c3Tal：一张能翻面的符（flip 0 正面 → 1 背面），绕竖轴翻
function c3Tal(c, x, y, front, o = {}) {
  const { flip = 0, back = '撤销' } = o, sx = Math.abs(Math.cos(clamp(flip, 0, 1) * Math.PI)); if (sx < .03) return;
  c.save(); c.translate(x, y); c.scale(sx, 1); c.translate(-x, -y);
  if (flip < .5) dsTalisman(c, x, y, front, o); else c3TalBack(c, x, y, back, o);
  c.restore();
}
// c3Root：根。m = 0 时和第 2 段第三级台阶（dsStairs 的第三级，全亮、高亮）一模一样，m = 1 时是树根 DSH
function c3Root(c, m) {
  const S = DS_STAIR, x = lerp(S.xs[2], C3RT.x, m), y = lerp(S.top[2], C3RT.y, m), w = lerp(S.xs[3] - S.xs[2], C3RT.w, m), h = lerp(S.base - S.top[2], C3RT.h, m);
  cutPaper(c, rectPts(x, y, w, h, lerp(4, 12, m)), mix(mix(S.color[2], P.purple, .14), DSC.slip2, m), { seed: 7402, step: 26, blur: lerp(6, 5, m), sx: lerp(3, 2.5, m), sy: lerp(4, 3.5, m) });
  const a0 = 1 - sm(0, .4, m), a1 = sm(.6, 1, m);
  if (a0 > 0) { c.save(); c.globalAlpha *= a0;
    rline(c, [[x + 6, y + 7], [x + w - 6, y + 7]], { w: 2, color: alpha('#ffffff', .5), seed: 7412, amp: .4 });
    zh(c, S.rows[2][0], x + w / 2, y + 56, { size: 34, align: 'center', color: mix(P.ink, P.purple, .6) });
    dsMono(c, S.rows[2][1], x + w / 2, y + 90, { size: 17, align: 'center', color: P.ink2 }); c.restore(); }
  if (a1 > 0) zh(c, 'DSH', x + w / 2, y + h / 2 + 22, { size: 40, align: 'center', color: P.ink, al: a1 });
}
// c3Slab：Cordis 那张淡绿纸。v = 0 时等于 dsCordisSlab(sub: null)，v = 1 时等于 dsCordisSlab（带副标题）。o = { al, lift, name 名字的透明度 }
function c3Slab(c, x, y, w, h, v, o = {}) { const { al = 1, lift = 0, name = 1 } = o; if (al <= .001) return;
  c.save(); c.globalAlpha *= al; const yy = y - lift * 8;
  cutPaper(c, rectPts(x, yy, w, h, 10), mix(DSC.slip, P.green, .22), { seed: 7500, step: 24, blur: 6 + lift * 12, sx: 2.5 + lift * 3, sy: 5 + lift * 8 });
  if (name > 0) zh(c, 'Cordis', x + w / 2, yy + h / 2 + lerp(16, 4, v), { size: 46, align: 'center', color: mix(P.ink, P.green, .5), al: name });
  if (v > 0) zh(c, '可逆副作用 · 依赖响应', x + w / 2, yy + h / 2 + 40, { size: 24, align: 'center', color: P.ink2, al: v });
  c.restore(); }

// ===================== 整棵 DSH 树 =====================
// 变换：第 11 句缩到右边（0.7 倍，根底边中点到 x 1080），第 13 句压进地基板
function c3Xf(tau) { const sh = dsK(tau, C3T(11) + .45, .5, easeIO), cp = c3Cp(tau);
  let s = lerp(1, .7, sh), ax = lerp(C3ANC[0], 1080, sh), ay = C3ANC[1], sy = s;
  if (cp > 0) { ax = lerp(ax, DS_SLAB.x + DS_SLAB.w / 2, cp); ay = lerp(ay, DS_SLAB.y + DS_SLAB.h / 2, cp); sy = s * (1 - cp); s *= lerp(1, 1.3, cp); }
  return { s, sy, ax, ay }; }
// test-gate 在推近层里的样子：{ x, y, s, rot, al, lift }
function c3TG(tau) {
  const f = c3Fo(tau), [sx, sy] = C3SL[1], yk = c3Yank(tau), ul = dsK(tau, c3Unload(), .45);
  let x = lerp(sx, C3F.x, f), y = lerp(sy, C3F.y, f), s = lerp(1, C3F.s, f), rot = 0, al = 1, lift = 0;
  if (yk > 0) { x -= 90 * yk; y -= 640 * yk; rot = -.55 * yk; lift = Math.min(1, yk * 3); }
  return { x, y, s, rot, al, lift, dim: ul };
}
function c3Tree(c, tau, m, lc, treeA) {
  const X = c3Xf(tau), f = c3Fo(tau);
  c.save(); c.globalAlpha *= treeA * (1 - sm(.55, .95, c3Cp(tau)));
  c.translate(X.ax, X.ay); c.scale(X.s, X.sy); c.translate(-C3ANC[0], -C3ANC[1]);
  c3Root(c, m); const rootPin = sm(.8, 1, m);
  const slips = [], ropes = [], pins = [];
  const node = (name, slot, o, thr, tAl = 1) => { const [x, y] = slot; slips.push([x, y, name, o]); if (thr > 0) ropes.push([C3RPIN(x), C3PIN(x, y), thr, tAl]); if ((o.k ?? 1) > .3 && (o.al ?? 1) > .05) pins.push([C3PIN(x, y), o.al ?? 1]); };
  // 第 0 句：树长出来（agent-loop 是第 2 段的 agent loop 纸片落下来变成的）
  const g = { loop: C3W(0, '循环') + .5, tools: 1.6, llm: 1.85, sess: 2.1, test: Math.max(2.4, C3W(0, '拔错') - .15) };
  node('agent-loop', C3SL[3], { al: sm(.35, .9, lc), seed: 3103 }, dsK(tau, g.loop, .3));
  node('tools', C3SL[2], { svc: true, k: dsPop(tau, g.tools + .22), seed: 3102 }, dsK(tau, g.tools, .3));
  node('llm', C3SL[4], { svc: true, k: dsPop(tau, g.llm + .22), seed: 3104 }, dsK(tau, g.llm, .3));
  node('sessions', C3SL[5], { svc: true, k: dsPop(tau, g.sess + .22), seed: 3105 }, dsK(tau, g.sess, .3));
  // test-gate：推近之前画在树上；推近以后由推近层画，这里只画根到它的线（线头跟着它走）
  if (f <= 0) node('test-gate', C3SL[1], { k: dsPop(tau, g.test + .22), seed: 3101 }, dsK(tau, g.test, .3));
  else if (f < 1) { const T = c3TG(tau); ropes.push([C3RPIN(C3SL[1][0]), c3Loc(T.x, T.y, T.s, 0, 0, C3NH / 2 - 13), 1, 1]); }
  // 第 7–8 句：consumer（inject greeter）和 greeter
  const tC = C3W(7, '插件') - .15, tG = C3W(7, '服务') - .2;
  const lit = clamp(dsK(tau, C3W(8, '启动') - .1, .3) - dsK(tau, C3W(8, '停下') - .3, .3) + dsK(tau, C3W(8, '重新加载') - .1, .3), 0, 1);
  const cHi = clamp(dsBump(tau, C3W(8, '启动') - .1, 1) + dsBump(tau, C3W(8, '重新加载') - .1, 1), 0, 1);
  const away = dsK(tau, C3W(8, '一走') - .15, .45, easeIO) * (1 - dsK(tau, C3W(8, '回来') - .25, .45, easeIO));
  const [gx0, gy0] = C3SL[0], gx = lerp(gx0, 330, away), gy = lerp(gy0, 700, away);
  if (tau > tC) node('consumer', C3SL[1], { k: dsPop(tau, tC + .22), dim: .85 * (1 - lit), hi: cHi, seed: 3106 }, dsK(tau, tC, .3));
  if (tau > tG) { slips.push([gx, gy, 'greeter', { svc: true, k: dsPop(tau, tG + .22), lift: away * .9, al: 1 - .4 * away, seed: 3107 }]);
    ropes.push([C3RPIN(gx0), C3PIN(gx0, gy0), dsK(tau, tG, .3) * (1 - sm(0, .6, away)), 1]); if (tau > tG + .3) pins.push([[gx, gy + C3NH / 2 - 13 - away * 7], 1 - .4 * away]); }
  // 画：纸片 → 线 → 钉
  if (away > 0) dsDashBox(c, gx0 - C3NW / 2, gy0 - C3NH / 2, C3NW, C3NH, { al: sm(.4, 1, away), r: 12, t: tau, seed: 3110 });
  for (const [x, y, name, o] of slips) c3Plug(c, x, y, name, o);
  for (const [a, b, p, al] of ropes) c3Rope(c, a, b, { p, al, sag: 12, seed: 3200 + (b[0] | 0) % 50 });
  // consumer → greeter 的依赖线：greeter 一走，线头掉下来垂着
  if (tau > tG + .3) { const cp = [C3SL[1][0] - 74, C3SL[1][1] + 4], gp = [gx0, gy0 - 25], dangle = [cp[0] - 6 + c3Swing(tau, C3W(8, '一走') + .1, 16), cp[1] + 150], d = sm(0, .5, away);
    c3Rope(c, cp, [lerp(gp[0], dangle[0], d), lerp(gp[1], dangle[1], d)], { p: dsK(tau, tG + .3, .4), sag: lerp(10, 0, d), bow: lerp(-8, 16, d), color: C3DEP, w: 2.6, seed: 3230 });
    pins.push([cp, 1]); if (away < .5) pins.push([gp, 1]); }
  if (rootPin > 0) for (const [a] of ropes) pins.push([a, rootPin]);
  for (const [p, al] of pins) c3Pin(c, p, 1, al);
  c.restore();
}

// ===================== 推近 test-gate（第 1–6 句） =====================
function c3Focus(c, tau, FA) {
  const t = tau, T = c3TG(tau), yk = c3Yank(tau), back = dsK(tau, C3T(4) + .1, .3);
  c.save(); c.globalAlpha *= FA;
  // 「别的插件」：用一根绿线连着 test-gate（第 2 句），第 5 句收走
  const oK = dsPop(tau, C3W(2, '别的插件') - .1), oA = 1 - dsK(tau, C3T(5) - .1, .4), O = C3OTH;
  if (oK > 0 && oA > 0) c3Plug(c, O.x, O.y, '别的插件', { w: O.w, h: O.h, k: oK, al: oA, zhName: true, size: 30, seed: 3120 });
  // 硬拔以后：原地一个虚线框（拔走的那张纸片的位置）
  const gA = sm(.3, .8, yk); if (gA > 0) dsDashBox(c, C3F.x - C3NW * C3F.s / 2, C3F.y - C3NH * C3F.s / 2, C3NW * C3F.s, C3NH * C3F.s, { al: gA, r: 16, t, seed: 3130, color: P.g2 });
  // test-gate 本身
  c3Plug(c, T.x, T.y, 'test-gate', { s: T.s, rot: T.rot, lift: T.lift, dim: .8 * T.dim, seed: 3101 });
  // 依赖线：别的插件 → test-gate；拔掉时线头掉下来垂着、晃一晃
  const dp = dsK(tau, C3W(2, '别的插件') + .15, .45);
  if (dp > 0 && oA > 0) { const a = [O.x - O.w / 2 + 18, O.y + 2], att = c3Loc(T.x, T.y, T.s, T.rot, C3NW / 2 - 12, 20, T.lift), d = sm(0, .25, yk);
    const dang = [a[0] - 30 + c3Swing(tau, C3W(3, '拔掉'), 26) * (1 - back), a[1] + 150];
    c3Rope(c, a, [lerp(att[0], dang[0], d), lerp(att[1], dang[1], d)], { p: dp, sag: lerp(24, 0, d), bow: lerp(0, -18, d), color: C3DEP, w: 2.6, seed: 3240, al: oA });
    c3Pin(c, a, 1, oA * sm(.3, .8, oK)); if (d < .5) c3Pin(c, att, T.s, oA);
    // 第 3 句：「悬空」
    const hk = dsPop(tau, C3W(3, '悬空') - .1) * (1 - back);
    if (hk > 0) { c.save(); c.globalAlpha *= clamp(hk, 0, 1); cross(c, dang[0] + 4, dang[1] + 18, 26, { t, seed: 3250 }); c.restore(); } }
  const fo = c3Fo(tau); if (fo < 1) c3Pin(c, c3Loc(T.x, T.y, T.s, T.rot, 0, C3NH / 2 - 13, T.lift), T.s, 1 - fo);
  // 三张符：贴上（第 2 句）→ 拔掉时悬在原地（第 3 句）→ 翻面「撤销」（第 5 句）→ 3、2、1 揭掉（第 6 句）
  const nA = dsK(tau, C3W(6, '卸载') - .1, .3);
  C3TAL.forEach(([s, dx, rot], i) => { const k = dsPop(tau, c3Stick(i), .35); if (k <= 0) return;
    const jig = dsBump(tau, C3W(3, '留在原地') - .1 + i * .08, .5) * .07 * (i % 2 ? 1 : -1) + Math.sin(tau * 2.1 + i * 1.7) * .018 * yk, x = C3F.x + dx;
    const flip = dsK(tau, C3W(5, '撤销') - .25 + i * .15, .35, easeIO), peel = dsK(tau, c3Peel(i), .5);
    c3Tal(c, x, C3TALY + yk * 6, s, { k, flip, peel, rot: rot + jig, seed: 3300 + i * 7, w: C3TW, h: C3TH });
    if (nA > 0) dsMono(c, String(i + 1), x, C3TALY + C3TH / 2 + 34, { size: 22, align: 'center', color: C3AC, al: nA * (1 - sm(.1, .5, peel)) }); });
  // 「悬空」标签
  const hk = dsPop(tau, C3W(3, '悬空') - .1) * (1 - back);
  if (hk > 0) dsLabel(c, '悬空', C3F.x, 610, { size: 32, k: hk, ink: P.red, seed: 3260, rot: -.03 });
  // 关键词：有状态（第 1 句）→ 可逆副作用（第 5 句）
  dsLabel(c, '有状态', C3F.x, 222, { size: 32, ink: C3AC, k: dsPop(tau, C3W(1, '有状态') - .1), al: 1 - dsK(tau, C3T(3), .3), seed: 3270 });
  dsLabel(c, '可逆副作用', C3F.x, 222, { size: 34, ink: C3AC, k: dsPop(tau, C3W(5, '可逆') - .1), seed: 3271 });
  // 第 5 句：register() 的真代码
  const ck = dsPop(tau, C3W(5, '每一次') - .15);
  if (ck > 0) { const cw = Math.max(...C3CODE.map(l => dsMonoW(c, l, 18))) + 48, cx = 1424 - cw;
    c.save(); c.letterSpacing = '0.01px';   // 等宽字体的连字（=> 变成箭头）关掉
    dsCodeSlip(c, cx, 250, cw, C3CODE, { size: 18, lh: 28, title: 'vendor/cordis/src/events.ts', k: ck, seed: 3280, accent: C3AC, mark: ['effect', 'unregister'],
      p: clamp((tau - C3W(5, '每一次')) / 1.3, 0, 1), hl: { 2: dsK(tau, C3W(5, '每一次') + 1.3, .3), 4: dsK(tau, C3W(5, '撤销') - .1, .3) } }); c.restore();
    dsLabel(c, '节选', 1380, 252, { size: 24, k: dsPop(tau, C3W(5, '每一次') + .2), rot: .05, seed: 3281 }); }
  // 第 6 句：时间线。左边是贴上的顺序 1、2、3，右边是卸载时揭掉的顺序 3、2、1
  const tl0 = C3W(6, '卸载') - .25, ap = dsK(tau, tl0, .5);
  if (ap > 0) { dsArrow(c, [450, 836], [1400, 836], { p: ap, t, seed: 3290, w: 3 });
    [0, 1, 2].forEach(i => c3Tal(c, 530 + i * 58, 768, String(i + 1), { w: 40, h: 96, k: dsPop(tau, tl0 + .25 + i * .12), seed: 3291 + i, rot: (i - 1) * .03 }));
    [0, 1, 2].forEach(j => c3Tal(c, 950 + j * 58, 768, '', { w: 40, h: 96, flip: 1, back: String(3 - j), k: dsPop(tau, c3Peel(2 - j) + .1), seed: 3295 + j, rot: (j - 1) * .03 }));
    dsLabel(c, '卸载', 1008, 682, { size: 30, k: dsPop(tau, C3W(6, '卸载') - .05), seed: 3298 });
    dsLabel(c, '时间', 1352, 786, { size: 32, ink: C3AC, k: dsPop(tau, C3W(6, '时间') - .1), seed: 3299 }); }
  c.restore();
}

// ===================== Koishi 的小树（第 11–13 句） =====================
function c3Koishi(c, tau) {
  const t = tau, tK = Math.max(C3W(11, 'Koishi'), C3T(11) + .95), kA = 1 - dsK(tau, C3W(13, '仓库'), .5); if (tau < tK - .2 || kA <= 0) return;
  c.save(); c.globalAlpha *= kA;
  dsLabel(c, 'Koishi', 390, 292, { size: 34, k: dsPop(tau, tK - .1), seed: 3500 });
  // weather：第 12 句贴两张符 → 热重载 → 卸载时 2、1 揭掉 → 纸片拿走再装回来
  const w12 = (w, d = 0) => C3W(12, w) + d, wu = dsK(tau, w12('清掉', -.1), .4) * (1 - dsK(tau, w12('副作用', .35), .4));
  const kids = C3KN.map(([n, x, y], i) => ({ n, x, y, thr: dsK(tau, tK + .2 + i * .15, .3), k: dsPop(tau, tK + .4 + i * .15), u: i === 2 ? wu : 0 }));
  const rk = dsPop(tau, tK), R = C3KR;
  const lift = .6 * dsK(tau, C3W(11, '独立') - .1, .35) * (1 - dsK(tau, C3W(11, 'Cordis') + .5, .4)) + .7 * dsBump(tau, C3W(13, 'Cordis') - .15, .7);
  const pre = dsK(tau, C3W(11, '核心框架') - .1, .3) * (1 - dsK(tau, C3W(11, 'Cordis') - .15, .3)), name = dsK(tau, C3W(11, 'Cordis') - .1, .35);
  pop(c, R.x + R.w / 2, R.y + R.h / 2, rk, () => { c3Slab(c, R.x, R.y, R.w, R.h, 0, { lift, name });
    if (pre > 0) zh(c, '核心框架', R.x + R.w / 2, R.y + R.h / 2 + 11 - lift * 8, { size: 30, align: 'center', color: P.ink2, al: pre }); });
  kids.forEach((q, i) => c3Plug(c, q.x, q.y, q.n, { w: C3KW, h: C3KH, size: 24, k: q.k, al: 1 - q.u, lift: q.u, seed: 3510 + i }));
  kids.forEach(q => { const pin = [q.x, q.y + C3KH / 2 - 12], rp = [C3KPIN[0] + (q.x - C3KPIN[0]) * .25, C3KPIN[1] - lift * 8]; c3Rope(c, rp, pin, { p: q.thr * (1 - q.u), sag: 10, seed: 3520 + (q.x | 0) % 40 });
    if (q.k > .3) c3Pin(c, pin, 1, 1 - q.u); if (rk > .3 && q.thr > 0) c3Pin(c, rp); });
  const W = kids[2]; C3KTAL.forEach(([s, dx], j) => c3Tal(c, W.x + dx, W.y + 86, s, { w: 44, h: 136, k: dsPop(tau, w12('插件', -.1 + j * .35)), peel: dsK(tau, w12('卸载', -.1 + (1 - j) * .45), .5), rot: (j ? .04 : -.04), seed: 3530 + j * 5 }));
  dsLabel(c, '4.7', 548, 690, { mono: true, size: 24, k: dsPop(tau, C3W(11, '4.7') - .1), seed: 3540 });
  dsLabel(c, '热重载', 615, 440, { size: 28, k: dsPop(tau, w12('热重载', -.1)), seed: 3541, rot: .03 });
  c.restore();
}

// ===================== 整段 =====================
function c3Content(c, tau) {
  const t = tau, m = dsK(tau, .5, .7, easeIO), lc = dsK(tau, C3W(0, '循环') - .1, .55, easeIO);
  const f = c3Fo(tau), uf = c3Uf(tau), treeA = 1 - f * (1 - uf);
  // 开头：前两级台阶倒下去，第三级的纸条收起（第三级本身在 c3Root 里缩成树根）
  if (m < 1) { const S = DS_STAIR, n = 1 - m;
    c.save(); c.globalAlpha *= n; c.translate(0, m * 30);
    dsStairs(c, { up: [1, 1, 0], lit: [1, 1, 1], notes: [1, 1, 0], hi: 1 });
    dsLabel(c, S.rows[2][2], 1250, 168, { size: 24, seed: 7422, rot: -.02 });
    dsLabel(c, S.rows[2][3], 1250, 222, { size: 22, seed: 7427, rot: .015, ink: mix(P.ink, P.purple, 1) }); c.restore(); }
  // 第 7–10 句的字条（画在树下面：inject 那张纸塞在 consumer 底下）
  const fadeL = 1 - dsK(tau, C3T(10) - .9, .4);
  if (tau > C3T(7) && fadeL > 0) { c.save(); c.globalAlpha *= fadeL;
    dsLabel(c, '依赖响应', 120, 190, { size: 34, align: 'left', ink: C3AC, k: dsPop(tau, C3W(7, '依赖响应') - .1), seed: 3600 });
    const ik = dsPop(tau, C3W(7, 'inject') - .15), line = "export const inject = ['greeter']";
    if (ik > 0) { dsCodeSlip(c, 120, 252, dsMonoW(c, line, 20) + 48, [line], { size: 20, k: ik, seed: 3601, mark: ['inject'], accent: C3AC, p: clamp((tau - C3W(7, 'inject')) / .8, 0, 1) }); }
    dsLabel(c, '空间', 300, 452, { size: 34, ink: C3AC, k: dsPop(tau, C3W(9, '空间') - .1), seed: 3602 });
    c.restore(); }
  // 整棵 DSH 树
  if (treeA > .001) c3Tree(c, tau, m, lc, treeA);
  // 第 8 句：「等待」
  const wk = dsPop(tau, C3W(8, '停下') - .1) * (1 - dsK(tau, C3W(8, '重新加载') - .1, .3));
  if (wk > 0) dsLabel(c, '等待', 640, 282, { size: 30, ink: P.g3, k: wk, seed: 3603, rot: -.03 });
  // agent loop 纸片（第 2 段交过来的）落进树里
  if (lc < 1) { const B = DS_STAIRCARD, [nx, ny] = C3SL[3];
    dsLoopCard(c, lerp(B.x, nx - C3NW / 2, lc), lerp(B.y, ny - C3NH / 2, lc), lerp(B.w, C3NW, lc), lerp(B.h, C3NH, lc), { al: 1 - sm(.35, .9, lc), accent: P.blue, lift: dsBump(tau, C3W(0, '循环') - .1, .55) }); }
  // 推近 test-gate
  if (f > 0 && uf < 1) c3Focus(c, tau, 1 - uf);
  // 第 9 句：论文纸条
  const pk = dsPop(tau, C3W(9, '论文') - .1), pA = 1 - dsK(tau, C3T(11) + .3, .4);
  if (pk > 0 && pA > 0) { const ti = 'A Programming Paradigm for Spatiotemporal Composability', sz = 28, tw = zhWidth(c, ti, sz), w = tw + 64, x = 920 - w / 2, y = 758;
    c.save(); c.globalAlpha *= pA; pop(c, 920, y + 56, pk, () => { dsSlip(c, x, y, w, 112, { seed: 3610, r: 8 });
      zh(c, ti, x + 32, y + 48, { size: sz, color: P.ink });
      dsMono(c, 'arXiv 2608.25512', x + 32, y + 88, { size: 20, color: P.ink2 });
      const u0 = x + 32 + zhWidth(c, 'A Programming Paradigm for ', sz), u1 = u0 + zhWidth(c, 'Spatiotemporal', sz);
      rline(c, [[u0, y + 57], [u1, y + 56]], { w: 3, color: C3AC, p: dsK(tau, C3W(9, '时空') - .1, .4), t, seed: 3611, amp: .6 }); }); c.restore(); }
  // Koishi 的小树
  c3Koishi(c, tau);
  // 第 13 句：Koishi 的 Cordis 复制一份，嵌进 DSH 树底下；整棵树压进去，变成地基板
  const lf = dsK(tau, C3W(13, '源码') - .1, .3), fl = dsK(tau, C3W(13, '收进') - .25, .55, easeIO), cp = c3Cp(tau);
  if (lf > 0) { const R = C3KR, L = C3LAND, S = DS_SLAB;
    let x = lerp(R.x, L.x, fl), y = lerp(R.y, L.y, fl) - Math.sin(fl * Math.PI) * 60, w = R.w, h = R.h;
    if (cp > 0) { x = lerp(x, S.x, cp); y = lerp(y, S.y, cp); w = lerp(w, S.w, cp); h = lerp(h, S.h, cp); }
    c3Slab(c, x, y, w, h, cp, { lift: lf * (1 - sm(.75, 1, fl)) });
    dsLabel(c, 'vendor/cordis', L.x + L.w + 16, L.y + L.h / 2, { mono: true, size: 22, align: 'left', k: dsPop(tau, C3W(13, '收进') + .3), al: 1 - sm(0, .4, cp), seed: 3620 }); }
}

function c3Draw(c, tau, L) {
  dsPage(c, tau, '第三页 · Cordis');
  if (tau < .5) dsHoStairs(c);                      // 段首：和第 2 段最后一样
  else if (tau >= c3End()) dsHoSlab(c);             // 段末：交给第 4 段
  else c3Content(c, tau);
  const on = (i, a = 0, b = 0) => tau > C3T(i) + a && tau < C3E(i) + b;
  dsCast(c, tau, L, C3LINES, {
    ranPose: tt => (on(1) || on(2) || on(3, 0, -1) || on(5, .8) || on(6) || on(7, .8) || on(8) || on(11, 1) || on(12)) ? 'point' : on(9, 2) ? 'present' : 'stand',
    pchPose: tt => tt > C3T(4) - .5 && tt < C3E(4) + 1 ? 'point' : 'lecture' });
}
scene({ order: 3, key: 'cordis', title: 'Cordis', dur: C3DUR, lines: C3LINES, fn: c3Draw, noFlip: true });
