'use strict';
// 第 4 段 · 第四页 · 自进化：agent 怎么「学会」新本事。强调色 P.gold。
// 主物件是一摞侧面看的纸板：最底下是第 3 段交过来的 Cordis 地基板（dsHoSlab 原位不动），上面偏左依次落下
// 「PTC 模式」「创造模式」「进化循环」，每块落地压扁再弹回（fx/ice-slabs.js 的 fxIceSquash）。地基板右边留一块地方，最后「验证器」立在那里：
// 虚线圈住上面三层「可进化」，验证器在圈外，进化循环伸过去的箭头被一把纸挂锁挡回。
// 每句的细节画在这摞板子上方（代码纸 + 工具 + 检查闸；放大镜 + 检查工具；文件 → plugin_manager → 批准 → 新插件），
// 讲完收进对应的那块板里，变成板上的一张小纸条。段末三块上层板飞成第 5 段的三张窗口标题条（dsHoTrio）。
// 顶层名字带 E4 / e4 前缀。
const E4LINES = dsSeq(.8, [
  ['地基有了。agent 是怎么「学会」新本事的？', { who: 'patchouli' }],
  ['分两步。第一步叫 PTC 模式：模型写一小段程序，把现有的工具组合起来。', { pause: .2, hold: .5 }],
  ['程序里每调用一次工具，照样走完整条检查流程。', { pause: .2, hold: .6 }],
  ['第二步叫创造模式：模型写一个全新的插件，装进插件树。', { pause: .3, hold: .5 }],
  ['动手之前，它先用只读的检查工具，查清运行时有哪些服务和事件。', { pause: .2, hold: .4 }],
  ['再把插件写成工作区里的文件，交给 Plugin Manager 安装。这一步要你批准。', { pause: .2, hold: .8 }],
  ['那 Cordis 就是进化算法了？', { who: 'patchouli', mood: 'smug', pause: .3 }],
  ['不是。Cordis 只是地基：保证装上、拆下都干净。', { pause: .2, hold: 1 }],
  ['真正的进化循环，是社区写在上层的插件，比如 auto-evolve 和 evolver。', { pause: .2, hold: .5 }],
  ['它们有个共同点：验证器，放在可进化的集合之外。', { pause: .2, hold: 1.2 }],
  ['不然 agent 会顺手改掉考它的那张卷子。', { who: 'patchouli', mood: 'smug', pause: .3 }],
  ['对。会改自己的系统，第一件要锁住的，就是判断它改得好不好的那一块。', { mood: 'proud', pause: .2, hold: 1.4 }],
]);
const E4T = i => E4LINES[i][0], E4E = i => E4LINES[i][1], E4W = (i, w) => dsWordT(E4LINES[i], w);
const E4DUR = E4E(E4LINES.length - 1) + 1.3;
const E4AC = P.gold, E4ACD = mix(P.gold, P.ink, .42);   // 强调色；写字、细线用压暗一档的金
const E4HO0 = .6, E4HO1 = E4DUR - .9;                  // 段首 / 段末这几秒只画交接画面
const E4X = E4E(11) - 1.55;                            // 段末收场开始（最后一句念完之后）

// ---- 板子 ----
const E4F = DS_SLAB;   // 地基板 { x: 420, y: 716, w: 960, h: 120 }，和第 3 段末尾同一块
const E4SL = [         // 上面三块，偏左叠，右边给验证器留地方
  { x: 470, y: 632, w: 540, h: 86, name: 'PTC 模式', seed: 4410, color: DSC.slip },
  { x: 482, y: 548, w: 540, h: 86, name: '创造模式', seed: 4420, color: DSC.slip },
  { x: 464, y: 464, w: 540, h: 86, name: '进化循环', seed: 4430, color: mix(DSC.slip, P.gold, .16) },
];
const E4LAND = [E4W(1, 'PTC') + .3, E4W(3, '创造模式') + .25, E4W(8, '进化循环') + .25];   // 各块落地的时刻
const E4CHIP = i => [E4SL[i].x + 420, E4SL[i].y + 43];   // 板右半边那张小纸条的中心

// ---- 第 1、2 句：代码纸 → 检查闸 → 工具 ----
const E4CODE = { x: 420, y: 206, w: 590 };
const E4CL = ["const hits = await tools.grep({ pattern: 'TODO' })", 'for (const f of hits.slice(0, 3))', '  await tools.read({ path: f })'];
const E4TOOLS = [['grep', 1290, 212], ['read', 1290, 322], ['bash', 1290, 432]], E4TW = 150, E4TH = 56;
const E4LINK = [[0, 0], [2, 1]];   // [代码第几行, 哪个工具]
const E4CALL0 = E4W(2, '每调用') - .1;
const E4CALLS = [[E4CALL0, 0], [E4CALL0 + 1.1, 1], [E4CALL0 + 1.65, 1], [E4CALL0 + 2.2, 1]];   // grep 一次，read 三次
// ---- 第 5 句：文件 → plugin_manager → 批准 → 新插件 ----
const E4FILES = [['index.ts', 430, 196, 232, -.035], ['cordis.patch.yml', 466, 300, 262, .025]];
const E4PM = { x: 810, y: 240, w: 340, h: 116 };
const E4PL0 = E4W(5, '批准') + .5, E4PLUG = E4PL0 + .5;   // 新插件从 plugin_manager 出来、落进创造模式板
// ---- 第 9–11 句：验证器 ----
const E4V = { x: 1126, y: 568, w: 236, h: 146 };
const E4LOCK = [1126, 652];
const E4ARR = [[936, 494], [1098, 640]];   // 进化循环伸向验证器的箭头

function e4LinkAB(k) { const [li, tj] = E4LINK[k], C = E4CODE, T = E4TOOLS[tj];
  return [[C.x + C.w + 8, C.y + 68 + li * 28 - 6], [T[1] - E4TW / 2 - 8, T[2]]]; }
function e4Along(pts, u) { const k = clamp(Math.floor(u), 0, pts.length - 2), f = clamp(u - k, 0, 1); return [lerp(pts[k][0], pts[k + 1][0], f), lerp(pts[k][1], pts[k + 1][1], f)]; }
// 一次工具调用：小纸圆片从代码纸出发 → 停在闸前 → 过闸 → 到工具
const e4CallU = (tau, t0) => key(tau, [[t0, 0], [t0 + .35, 1], [t0 + .6, 1], [t0 + .72, 2], [t0 + 1, 3]], easeIO);

// 板子落下：返回实际画的矩形（落地压扁到 80% 厚再弹回），没落下来返回 null
function e4SlabAt(i, tau) {
  const S = E4SL[i], tL = E4LAND[i], fall = .42, u = clamp((tau - tL + fall) / fall, 0, 1); if (u <= 0) return null;
  const q = fxIceSquash(tau - tL), w = S.w * (1 + .05 * q), h = S.h * (1 - .2 * q), dy = -(1 - easeIn(u)) * 320;
  return { x: S.x + (S.w - w) / 2, y: S.y + S.h - h + dy, w, h, al: sm(0, .35, u, easeOut), lift: 1 - u };
}
// 画一块板：先把名义矩形映射到实际矩形 R，再按名义坐标画纸、名字和 inner（板上的小纸条）
function e4Slab(c, i, R, o = {}) {
  const S = E4SL[i], { txt = 1, color = S.color, inner = null } = o; if (!R || R.al <= 0) return;
  c.save(); c.globalAlpha *= R.al;
  c.translate(R.x, R.y); c.scale(R.w / S.w, R.h / S.h); c.translate(-S.x, -S.y);
  cutPaper(c, rectPts(S.x, S.y, S.w, S.h, 10), color, { seed: S.seed, step: 24, blur: 6 + R.lift * 12, sx: 2.5, sy: 5 + R.lift * 10 });
  if (txt > 0) { zh(c, S.name, S.x + 40, S.y + S.h / 2 + 12, { size: 34, color: i === 2 ? E4ACD : P.ink, al: txt }); if (inner) { c.save(); c.globalAlpha *= txt; inner(); c.restore(); } }
  c.restore();
}
// 虚线的空位（还没落下来的板 / 板上还没装的插件）
function e4Ghost(c, x, y, w, h, p, al, seed, t) { if (p <= 0 || al <= 0) return; rline(c, rectPts(x, y, w, h, 10), { w: 2.4, color: P.g2, close: true, dash: [12, 9], p, t, seed, amp: .6, al }); }

// 代码纸：顶上一行 run_code（示意），下面三行代码
function e4Code(c, x, y, w, lines, o = {}) {
  const { k = 1, p = 1, hl = {} } = o, size = 18, lh = 28, h = 50 + lines.length * lh + 16; if (k <= .001) return;
  pop(c, x + w / 2, y + h / 2, k, () => { dsSlip(c, x, y, w, h, { seed: 4401, r: 8 });
    dsMono(c, 'run_code', x + 22, y + 34, { size: 19, color: P.ink2 });
    zh(c, '（示意）', x + 26 + dsMonoW(c, 'run_code', 19), y + 34, { size: 20, color: P.g2 });
    rline(c, [[x + 18, y + 46], [x + w - 18, y + 46]], { w: 1.2, color: P.g1, seed: 4402, amp: .4 });
    dsCode(c, lines, x + 24, y + 68, { size, lh, p, hl, accent: E4AC }); });
}
// 第 1、2 句的整组东西：连线、检查闸、走动的纸圆片、工具、代码纸
function e4Program(c, tau, t) {
  const wk = E4W(1, '写一小段'), cb = E4W(1, '组合'), chk = dsK(tau, E4W(2, '检查') - .1, .4);
  E4LINK.forEach((_, k) => { const [a, b] = e4LinkAB(k); dsArrow(c, a, b, { p: dsK(tau, cb + .1 + k * .15, .35), seed: 4412 + k * 3, t, w: 3 }); });
  E4LINK.forEach((_, k) => { const [a, b] = e4LinkAB(k), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, gk = dsPop(tau, E4T(2) + .15 + k * .12); if (gk <= 0) return;
    const hot = Math.max(0, ...E4CALLS.filter(q => q[1] === k).map(([t0]) => win(t0 + .3, t0 + .8, tau, .12)));
    pop(c, mx, my, gk, () => { dsSlip(c, mx - 38, my - 22, 76, 44, { seed: 4420 + k, edge: hot > .01 ? alpha(E4AC, hot) : null, ew: 3 });
      zh(c, '检查', mx, my + 8, { size: 24, align: 'center', color: P.ink2 });
      if (chk > 0) rline(c, [[mx - 24, my + 15], [mx + 24, my + 15]], { w: 2.6, color: E4AC, p: chk, seed: 4424 + k, amp: .5 }); }); });
  E4CALLS.forEach(([t0, k], j) => { if (tau < t0 || tau > t0 + 1.05) return; const [a, b] = e4LinkAB(k), L = Math.hypot(b[0] - a[0], b[1] - a[1]), m = .5 - 50 / L, n = .5 + 50 / L;
    const pts = [a, [lerp(a[0], b[0], m), lerp(a[1], b[1], m)], [lerp(a[0], b[0], n), lerp(a[1], b[1], n)], b], [x, y] = e4Along(pts, e4CallU(tau, t0));
    dsToken(c, x, y, 10, E4AC, { al: win(t0, t0 + 1.05, tau, .1), seed: 4440 + j }); });
  E4TOOLS.forEach(([s, x, y], j) => { const k = dsPop(tau, cb - .3 + j * .12); if (k <= 0) return;
    const b = clamp(Math.max(0, ...E4CALLS.filter(q => E4LINK[q[1]][1] === j).map(([t0]) => dsBump(tau, t0 + .92, .35))), 0, 1);
    pop(c, x, y, k, () => { dsSlip(c, x - E4TW / 2, y - E4TH / 2, E4TW, E4TH, { seed: 4430 + j, lift: b });
      dsMono(c, s, x, y + 8 - b * 8, { size: 24, align: 'center', color: j === 2 ? P.g2 : P.ink }); }); });
  const hl = {}; E4CALLS.forEach(([t0, k]) => { const v = win(t0 - .05, t0 + 1.05, tau, .15), ls = k ? [1, 2] : [0]; ls.forEach(i => { hl[i] = Math.max(hl[i] || 0, v); }); });
  e4Code(c, E4CODE.x, E4CODE.y, E4CODE.w, E4CL, { k: dsPop(tau, wk - .15), p: dsK(tau, wk + .05, 1.5, x => x), hl });
}

// 纸放大镜：镜片里把地基板放大 1.45 倍
function e4Lens(c, x, y, r, al) { if (al <= 0) return;
  c.save(); c.globalAlpha *= al;
  c.save(); c.translate(x, y); c.rotate(.8); cutPaper(c, rectPts(r * .9, -r * .17, r * 1.35, r * .34, r * .16), P.g3, { seed: 4471, step: 10, blur: 5, sx: 3, sy: 5 }); c.restore();
  c.save(); c.beginPath(); c.arc(x, y, r * .9, 0, TAU); c.clip(); c.fillStyle = P.paper; c.fillRect(x - r, y - r, r * 2, r * 2);
  c.translate(x, y); c.scale(1.45, 1.45); c.translate(-x, -y); dsCordisSlab(c, E4F.x, E4F.y, E4F.w, E4F.h);
  c.restore();
  c.save(); c.globalAlpha *= .14; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r * .9, 0, TAU); c.fill(); c.restore();
  c.save(); c.shadowColor = 'rgba(30,20,35,.3)'; c.shadowBlur = 5; c.shadowOffsetX = 2; c.shadowOffsetY = 4; c.strokeStyle = P.g3; c.lineWidth = r * .17; c.beginPath(); c.arc(x, y, r * .98, 0, TAU); c.stroke(); c.restore();
  rline(c, Array.from({ length: 9 }, (_, i) => { const a = -2.5 + i * .09; return [x + Math.cos(a) * r * .66, y + Math.sin(a) * r * .66]; }), { w: 3, color: alpha('#ffffff', .75), seed: 4472, amp: .2 });
  c.restore(); }
// 工作区里的一张文件纸：文件名 + 几道灰线
function e4File(c, name, x, y, w, rot, k, seed) { const h = 104; if (k <= .001) return;
  pop(c, x + w / 2, y + h / 2, k, () => { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.translate(-x - w / 2, -y - h / 2);
    dsSlip(c, x, y, w, h, { seed, r: 6 });
    dsMono(c, name, x + 20, y + 32, { size: 20, color: P.ink });
    rline(c, [[x + 16, y + 44], [x + w - 16, y + 44]], { w: 1.2, color: P.g1, seed: seed + 1, amp: .4 });
    [.62, .46, .34].forEach((f, i) => rline(c, [[x + 22 + (i === 1 ? 22 : 0), y + 64 + i * 13], [x + 22 + w * f, y + 64 + i * 13]], { w: 3, color: P.g1, seed: seed + 2 + i, amp: .5 }));
    c.restore(); }); }
function e4PMBox(c, k, ins) { const { x, y, w, h } = E4PM; if (k <= .001) return;
  pop(c, x + w / 2, y + h / 2, k, () => { dsSlip(c, x, y, w, h, { seed: 4474 });
    dsMono(c, 'plugin_manager', x + w / 2, y + 50, { size: 26, align: 'center', color: P.ink });
    dsMono(c, 'install_bundle', x + w / 2, y + 88, { size: 21, align: 'center', color: P.ink2 });
    if (ins > 0) rline(c, [[x + w / 2 - 94, y + 98], [x + w / 2 + 94, y + 98]], { w: 2.6, color: E4AC, p: ins, seed: 4476, amp: .5 }); }); }
function e4Plug(c, x, y, k, sq = 0) { const w = 168, h = 52; if (k <= .001) return;
  c.save(); c.translate(x, y + h / 2); c.scale(1 + .06 * sq, 1 - .18 * sq); c.translate(-x, -y - h / 2);
  pop(c, x, y, k, () => { dsSlip(c, x - w / 2, y - h / 2, w, h, { seed: 4478, color: mix(DSC.slip, E4AC, .14) }); zh(c, '新插件', x, y + 9, { size: 26, align: 'center', color: P.ink }); });
  c.restore(); }
// 手画的循环箭头（进化循环板上）
function e4LoopIcon(c, cx, cy, r, p, color, seed, t) { if (p <= 0) return;
  const a0 = -Math.PI / 2 + .35, span = (TAU - .9) * p, pts = Array.from({ length: 28 }, (_, i) => { const a = a0 + i / 27 * span; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  rline(c, pts, { w: 3.4, color, seed, amp: .5, t });
  if (p > .95) { const ea = a0 + span, ex = cx + Math.cos(ea) * r, ey = cy + Math.sin(ea) * r, tg = ea + Math.PI / 2;
    rline(c, [[ex - Math.cos(tg - .5) * 12, ey - Math.sin(tg - .5) * 12], [ex, ey], [ex - Math.cos(tg + .5) * 12, ey - Math.sin(tg + .5) * 12]], { w: 3.4, color, seed: seed + 1, amp: .4, t }); } }
// 验证器：一张像卷子的纸（名字 + 两道横线 + 一个勾），立在地基板右边
function e4Verifier(c, k, lift, rot, edge) { const V = E4V, cx = V.x + V.w / 2, by = V.y + V.h; if (k <= .001) return;
  c.save(); c.translate(cx, by - lift); c.rotate(rot); c.scale(k, k); c.translate(-cx, -by);
  dsSlip(c, V.x, V.y, V.w, V.h, { seed: 4485, r: 8, edge, ew: 3.5 });
  zh(c, '验证器', cx, V.y + 54, { size: 36, align: 'center', color: P.ink });
  rline(c, [[V.x + 36, V.y + 90], [V.x + V.w - 78, V.y + 90]], { w: 2.4, color: P.g1, seed: 4486, amp: .5 });
  rline(c, [[V.x + 36, V.y + 118], [V.x + V.w - 100, V.y + 118]], { w: 2.4, color: P.g1, seed: 4487, amp: .5 });
  check(c, V.x + V.w - 46, V.y + 102, 30, { color: E4ACD, seed: 4488 });
  c.restore(); }

function e4Cast(c, tau, L) {
  dsCast(c, tau, L, E4LINES, {
    ranPose: tt => tt < E4HO0 || tt > E4X - .3 ? 'stand' : (tt > E4T(2) && tt < E4E(2)) || (tt > E4T(5) && tt < E4E(5)) || (tt > E4T(9) && tt < E4E(9)) ? 'point' : 'stand',
    pchPose: tt => tt > E4T(10) - .5 ? 'lecture' : tt > E4T(6) - .5 ? 'point' : 'lecture' });
}

function e4Draw(c, tau, L) {
  const t = tau;
  dsPage(c, tau, '第四页 · 自进化');
  // 段首：第 3 段交过来的地基板；段末：第 5 段的三张标题条
  if (tau < E4HO0) { dsHoSlab(c); e4Cast(c, tau, L); return; }
  if (tau >= E4HO1) { dsHoTrio(c); e4Cast(c, tau, L); return; }
  const ex = dsK(tau, E4X, .4), keep = 1 - ex;   // 段末收场：标签、验证器、锁、虚线框先收掉

  // ---- 地基板（第 7 句描一圈金边，贴上「装上 ✓ 拆下 ✓」）----
  const fOut = dsK(tau, E4X + .2, .5);
  dsCordisSlab(c, E4F.x, E4F.y + fOut * 16, E4F.w, E4F.h, { al: 1 - fOut });
  const fo = dsK(tau, E4W(7, '地基') - .15, .6) * (1 - dsK(tau, E4T(8) + .2, .4));
  if (fo > 0) rline(c, rectPts(E4F.x - 6, E4F.y - 6, E4F.w + 12, E4F.h + 12, 14), { w: 4, color: E4AC, close: true, p: fo, t, seed: 4445, amp: .8 });
  const okA = 1 - dsK(tau, E4T(8) + .1, .35);
  [['装上', E4W(7, '装上'), 757], ['拆下', E4W(7, '拆下'), 805]].forEach(([s, t0, y], i) => { const k = dsPop(tau, t0 - .1) * okA; if (k <= 0) return;
    dsLabel(c, s, 1222, y, { size: 26, k, seed: 4446 + i, rot: i ? .02 : -.02 });
    check(c, 1290, y, 26, { color: E4ACD, p: dsK(tau, t0 + .12, .3), seed: 4448 + i, al: okA }); });

  // ---- 空位：第 0 句「新本事？」，第 1 句「分两步」分成两格 ----
  const land = i => sm(E4LAND[i] - .1, E4LAND[i], tau, x => x);
  { const S = E4SL[0], p = dsK(tau, E4W(0, '新本事') - .3, .5), al = 1 - land(0);
    e4Ghost(c, S.x, S.y, S.w, S.h, p, al, 4451, t);
    zh(c, '新本事？', S.x + S.w / 2, S.y + S.h / 2 + 12, { size: 32, align: 'center', color: P.g2, al: al * dsK(tau, E4W(0, '新本事') - .1, .3) * (1 - dsK(tau, E4T(1), .25)) });
    zh(c, '第一步', S.x + S.w / 2, S.y + S.h / 2 + 12, { size: 32, align: 'center', color: P.g2, al: al * dsK(tau, E4W(1, '第一步') - .1, .3) }); }
  { const S = E4SL[1], p = dsK(tau, E4T(1) + .05, .5), al = 1 - land(1);
    e4Ghost(c, S.x, S.y, S.w, S.h, p, al, 4452, t);
    zh(c, '第二步', S.x + S.w / 2, S.y + S.h / 2 + 12, { size: 32, align: 'center', color: P.g2, al: al * dsK(tau, E4W(3, '第二步') - .1, .3) }); }

  // ---- 三块上层板（段末飞成三张标题条，最上面的先飞）----
  const mv = i => dsK(tau, E4X + .3 + (2 - i) * .1, .7, easeIO), shut = 1 - dsK(tau, E4HO1 - .35, .25);
  for (let i = 0; i < 3; i++) {
    let R = e4SlabAt(i, tau); if (!R) continue;
    const m = mv(i), S = E4SL[i], T = DS_TRIO;
    if (m > 0) R = { x: lerp(R.x, T.xs[i], m), y: lerp(R.y, T.y, m), w: lerp(R.w, T.w, m), h: lerp(R.h, T.h, m), al: R.al * shut, lift: R.lift + dsBump(tau, E4X + .3 + (2 - i) * .1, .7) };
    const inner = [
      () => dsLabel(c, 'run_code', ...E4CHIP(0), { size: 20, mono: true, k: dsPop(tau, E4T(3) + .45), seed: 4415 }),
      () => { const [x, y] = E4CHIP(1); e4Ghost(c, x - 84, y - 26, 168, 52, dsK(tau, E4W(3, '全新') - .15, .4), 1 - sm(E4PLUG - .1, E4PLUG, tau, v => v), 4425, t);
        zh(c, '新插件', x, y + 9, { size: 26, align: 'center', color: P.g2, al: dsK(tau, E4W(3, '全新') + .1, .3) * (1 - sm(E4PLUG - .1, E4PLUG, tau, v => v)) });
        if (tau >= E4PLUG) e4Plug(c, x, y, 1, fxIceSquash(tau - E4PLUG) * .7); },
      () => { const [x, y] = E4CHIP(2); e4LoopIcon(c, x + 4, y, 24, dsK(tau, E4LAND[2] + .25, .6), E4ACD, 4435, t); },
    ][i];
    e4Slab(c, i, R, { txt: keep, color: mix(S.color, DSC.shade, m), inner });
    if (m >= 1) { const ww = dsK(tau, E4X + 1.15, .45); if (ww > 0) dsWindow(c, T.xs[i], T.y, T.w, T.h, T.names[i], { seed: 7610 + i, al: ww, bar: T.h }); }
  }

  // ---- 第 1–3 句：代码纸那一组，第 3 句开头收进 PTC 板，变成板上的 run_code 小纸条 ----
  const gC = dsK(tau, E4T(3) + .05, .55, easeIO);
  if (tau > E4T(1) && gC < 1) { const gx = 890, gy = 320, [tx, ty] = E4CHIP(0), s = lerp(1, .1, gC);
    c.save(); c.globalAlpha *= 1 - sm(.5, 1, gC, x => x); c.translate(lerp(gx, tx, gC), lerp(gy, ty, gC)); c.scale(s, s); c.translate(-gx, -gy);
    e4Program(c, tau, t); c.restore(); }

  // ---- 第 4 句：只读的检查工具（放大镜扫过地基板，冒出两个工具名）----
  const insA = 1 - dsK(tau, E4T(5) + .05, .35);
  [['只读', 476, E4W(4, '只读') - .05, false, 28], ['cordis_inspect_list', 540, E4W(4, '检查工具') - .1, true, 20], ['cordis_inspect_query', 600, E4W(4, '检查工具') + .25, true, 20]].forEach(([s, y, t0, mono, size], j) => {
    const k = dsPop(tau, t0, .4) * insA; if (k <= 0) return; const rise = (1 - easeOut(dsK(tau, t0, .4))) * 60;
    dsLabel(c, s, 1244, y + rise, { size, mono, k, seed: 4460 + j, rot: [-.02, .015, -.01][j], ink: j === 0 ? E4ACD : P.ink }); });
  const lensA = dsK(tau, E4W(4, '只读') - .3, .3) * (1 - dsK(tau, E4E(4) - .35, .35));
  if (lensA > 0) { const q = E4W(4, '查清'), sv = E4W(4, '服务'), ev = E4W(4, '事件');
    const lx = key(tau, [[q - .25, 1250], [q + .2, 1010], [sv - .4, 1010], [sv, 790], [ev - .25, 790], [ev + .15, 570]], easeIO);
    e4Lens(c, lx, 786, 50, lensA); }

  // ---- 第 5 句：文件 → plugin_manager · install_bundle → 批准 → 新插件落进创造模式板 ----
  const wbA = 1 - dsK(tau, E4E(5) + .05, .35), fw = E4W(5, '文件'), pw = E4W(5, 'Plugin'), iw = E4W(5, '安装');
  if (wbA > 0 && tau > E4T(5) - .2) { c.save(); c.globalAlpha *= wbA;
    const go = j => dsK(tau, iw - .2 + j * .12, .45, easeIO), pmK = dsPop(tau, pw - .25);
    dsArrow(c, [744, 302], [800, 302], { p: dsK(tau, pw - .05, .3), seed: 4473, t, al: 1 - go(1) });
    e4PMBox(c, pmK, dsK(tau, iw + .1, .4));
    E4FILES.forEach(([s, x, y, w, rot], j) => { const g = go(j), cx = E4PM.x + E4PM.w / 2, cy = E4PM.y + E4PM.h / 2; if (g >= 1) return;
      c.save(); c.globalAlpha *= 1 - sm(.6, 1, g, v => v); const sc = lerp(1, .3, g), ox = x + w / 2, oy = y + 52;
      c.translate(lerp(ox, cx, g), lerp(oy, cy, g)); c.scale(sc, sc); c.translate(-ox, -oy);
      e4File(c, s, x, y, w, rot, dsPop(tau, fw - .25 + j * .25), 4490 + j * 6); c.restore(); });
    dsSeal(c, E4PM.x + E4PM.w, E4PM.y + 6, '批准', dsK(tau, E4W(5, '批准') - .12, .45, x => x), { s: 84, seed: 4479 });
    c.restore(); }
  if (tau > E4PL0 && tau < E4PLUG) { const u = easeIO(clamp((tau - E4PL0) / (E4PLUG - E4PL0), 0, 1)), [x1, y1] = E4CHIP(1), x0 = E4PM.x + E4PM.w / 2, y0 = E4PM.y + E4PM.h + 36;
    e4Plug(c, lerp(x0, x1, u), lerp(y0, y1, u), easeOutBack(clamp((tau - E4PL0) / .25, 0, 1))); }

  // ---- 第 6、7 句：「进化算法？」被划掉 ----
  const qK = dsPop(tau, E4W(6, '进化算法') - .1), qS = dsK(tau, E4T(7) + .05, .3), qF = dsK(tau, E4T(7) + .6, .45, easeIn);
  if (qK > 0 && qF < 1) { c.save(); c.globalAlpha *= 1 - qF; const y = 640 + qF * 40;
    dsLabel(c, '进化算法？', 1244, y, { size: 30, k: qK, seed: 4497, rot: -.03 });
    rline(c, [[1160, y + 2], [1328, y - 6]], { w: 3.4, color: P.ink2, p: qS, seed: 4498, amp: .8 }); c.restore(); }

  // ---- 第 8 句：进化循环板上的两个社区插件 ----
  [['auto-evolve', 668, E4W(8, 'auto-evolve')], ['evolver', 868, E4W(8, 'evolver')]].forEach(([s, x, t0], j) => {
    dsLabel(c, s, x, 446, { size: 22, mono: true, k: dsPop(tau, t0 - .1) * keep, seed: 4500 + j, rot: j ? .02 : -.015 }); });

  // ---- 第 9 句：验证器在可进化的圈外 ----
  const vK = dsPop(tau, E4W(9, '验证器') - .15, .4) * keep;
  const vt = E4W(10, '卷子') - .05, vs = tau - vt, wob = vs > 0 ? Math.sin(vs * 22) * Math.exp(-vs * 5) * .05 : 0;
  e4Verifier(c, vK, dsBump(tau, E4W(9, '之外') - .05, .45) * 14, wob, dsK(tau, E4W(11, '判断') - .1, .35) > 0 ? alpha(E4AC, dsK(tau, E4W(11, '判断') - .1, .35)) : null);
  dsDashBox(c, 440, 396, 600, 326, { p: dsK(tau, E4W(9, '可进化') - .35, .8, easeIO), t, label: '可进化', labelSize: 28, color: mix(P.g2, E4AC, .45), seed: 4482, al: keep });

  // ---- 第 10 句：循环伸向验证器；第 11 句：挂锁扣上，箭头被挡回 ----
  const ar = dsK(tau, E4W(10, '改掉') - .25, .45, easeOut), lockT = E4W(11, '锁住') - .05, ls = tau - lockT;
  if (ar > 0) { const r = ls > 0 ? .54 + .46 * Math.exp(-5 * ls) * Math.cos(9 * ls) : ar, [S, T] = E4ARR, E = [lerp(S[0], T[0], r), lerp(S[1], T[1], r)];
    dsArrow(c, S, E, { bend: -42 * r, w: 3.6, head: 16, color: E4ACD, seed: 4495, t, al: keep * clamp(ar * 4, 0, 1) }); }
  const lk = dsPop(tau, E4T(11) + .15, .4) * keep;
  if (lk > 0) pop(c, E4LOCK[0], E4LOCK[1], 1 + .14 * dsBump(tau, lockT, .3), () => dsLock(c, E4LOCK[0], E4LOCK[1], 74, { k: lk, open: 1 - dsK(tau, lockT - .1, .12, easeIn), seed: 4499 }));

  e4Cast(c, tau, L);
}

scene({ order: 4, key: 'evolve', title: '自进化', dur: E4DUR, lines: E4LINES, fn: e4Draw, noFlip: true });
