'use strict';
// 第 2 段 · 第二页 · 阶梯：想改一个 harness 的行为，有三级做法。
// 主物件是三级纸台阶（props.js 的 dsStairs / DS_STAIR）：开头依次「啪」地立起（fxPopAngle），讲到哪一级哪一级亮起，讲完贴上「能改 / 地基」两张纸条。
// 台阶上方的空地（x 380–1080、y 150–525；帕秋莉不在场时左边也能用）放每一级的小演示，讲完缩进对应的那一级：
//   第一级：harness 纸盒，三张纸条（说明 / 工具 / 脚本）沿箭头喂进去，盒子不变；SKILL.md 被铅笔改一行 →「下次读取」箭头 + 勾。
//   第二级：纸盒打开成一条事件管道，管道上三个预留的口子；tool.call 的处理器链（next 放行，第三个 deny 打回）+ CC 文档里的代码纸；
//          Claude 写的新处理器盖「同意」印、插进链里；拉远：管道是盒子的外沿，口子都在外沿上，盒子里的 agent loop 被四颗图钉钉死。
//   第三级：第一段交来的 agent loop 纸片（开头飞到右上角候着）落到第三级上，被抽出来换成「另一种 loop」，再换回来。
// 段首 ≥0.4 秒 = dsHoLoopCard，段末 ≥0.4 秒 = dsHoStairs。顶层名字带 D2 / d2 前缀。
const D2LINES = dsSeq(.8, [
  ['想改一个 harness 的行为，有三级做法。', { hold: .4 }],
  ['第一级，声明式扩展：skill、MCP、settings 里的 hook。', { pause: .2, hold: .4 }],
  ['它们只能给 harness 喂材料：多一段说明，多一个工具，多一个外部脚本。', { pause: .2, hold: .8 }],
  ['我改了一个 skill，要重启才生效吗？', { who: 'patchouli', mood: 'surprised', pause: .3 }],
  ['不用。skill 就是一个文本文件，下次读的时候就生效了。', { mood: 'happy', pause: .2, hold: .8 }],
  ['第二级，进程内中间件：pi 的 extension，Claude Code 的 mod。', { pause: .4, hold: .4 }],
  ['它们跑在 harness 的进程里，能拦截、改写官方预留的事件。', { pause: .2, hold: .6 }],
  ['拿 Claude Code 的 mod 来说：同一个事件的处理器，串成一条链。', { pause: .2, hold: .3 }],
  ['每一个处理器都能决定：调用 next 往下传，或者就地拒绝。', { pause: .2, hold: 1.2 }],
  ['而且 Claude 能自己写 mod。你点头之后，当前会话就加载，不用重启。', { pause: .3, hold: .8 }],
  ['这已经很强了。还缺什么？', { who: 'patchouli', mood: 'smug', pause: .3 }],
  ['缺在「官方预留」这四个字上。口子是官方挖的，循环本身不在口子里。', { mood: 'proud', pause: .2, hold: 1.2 }],
  ['第三级，可组合内核，就是 DSH：连 agent loop 都是一个能换掉的插件。', { pause: .4, hold: 1.2 }],
  ['越往上，能改的越多，需要的地基也越重。', { pause: .2, hold: 1.4 }],
]);
const D2T = i => D2LINES[i][0], D2E = i => D2LINES[i][1], D2W = (i, w) => dsWordT(D2LINES[i], w);
const D2DUR = D2E(D2LINES.length - 1) + 1.2;
const D2AC = P.purple;   // 本页的强调色

// ---- 位置 ----
const D2WAIT = [1170, 160, 220, 104];                  // agent loop 纸片在右上角候着（第三级上方）
const D2PARK = [850, 196, 220, 104];                   // 第 12 句换 loop 时，另一张纸片停在这里
const D2STEP = [DS_STAIRCARD.x, DS_STAIRCARD.y, DS_STAIRCARD.w, DS_STAIRCARD.h];
const D2HB = [830, 245, 240, 116];                     // 第一级的 harness 纸盒（合着）
const D2SRC = [['说明', 520, 196], ['工具', 520, 303], ['脚本', 520, 410]];   // 喂进盒子的三张纸条
const D2SK = [430, 190, 250, 228];                     // SKILL.md 纸片
const D2BAND = { open: [420, 252, 640, 72], top: [420, 152, 640, 60], back: [480, 222, 520, 52] };   // 打开后的事件管道（第 6 句 / 第 7–10 句 / 拉远后是盒子的上沿）
const D2SOCK = [60, 250, 440];                         // 管道上三个预留口子（按 640 宽的管道算）
const D2BODY = [480, 248, 520, 257];                   // 拉远后 harness 盒子的身子
const D2LOOP = [610, 300, 260, 150];                   // 盒子里被钉死的 agent loop
const D2CH3 = [[420, 228, 130, 60], [650, 228, 130, 60], [880, 228, 130, 60]];                       // 三个处理器
const D2CH4 = [[426, 228, 116, 60], [598, 228, 116, 60], [770, 228, 116, 60], [942, 228, 116, 60]];   // 插进第四个以后
const D2CODE = [100, 312, 670];                        // CC 文档里的代码纸（帕秋莉不在场时用左边）
const D2NEW = [800, 330, 240];                         // Claude 写的新处理器
const D2CODE_SRC = ["on('tool.call', { tool: 'Bash' }, async ($, e, next) => {", '  if (/git push .*--force/.test(e.command)) {', "    return { deny: 'Force pushes are not allowed…' }", '  }', '  return next(e)', '})'];

const d2Mix = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
const d2Mid = r => [r[0] + r[2] / 2, r[1] + r[3] / 2];

// ===================== 小画具 =====================
// d2Card：agent loop 纸片。不抬起时直接用 props.js 的 dsLoopCard（交接画面一模一样）；抬起时整张一起抬（dsLoopCard 只抬纸不抬字）
function d2Card(c, r, o = {}) { const [x, y, w, h] = r, { lift = 0, k = 1, squash = 0 } = o; if (k <= .001) return;
  c.save(); if (squash) { c.translate(0, y + h); c.scale(1 + squash * .06, 1 - squash * .1); c.translate(0, -(y + h)); }
  if (lift <= .001) dsLoopCard(c, x, y, w, h, { k });
  else { c.save(); c.translate(0, -lift * 10); dsSlip(c, x, y, w, h, { color: mix(DSC.slip, P.blue, .12), seed: 7900, lift: 0, k, }); c.restore();
    // 影子随抬起变大：在纸片下面先垫一层淡影
    pop(c, x + w / 2, y + h / 2, k, () => { c.save(); c.translate(0, -lift * 10);
      const cx = x + w / 2, cy = y + h * .4, rr = h * .2;
      rline(c, Array.from({ length: 26 }, (_, i) => { const a = -Math.PI / 2 + .3 + i / 25 * (TAU - .9); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; }), { w: 3, color: P.blue, seed: 7901, amp: .5 });
      const ea = -Math.PI / 2 + .3 + (TAU - .9), ex = cx + Math.cos(ea) * rr, ey = cy + Math.sin(ea) * rr, tg = ea + Math.PI / 2;
      rline(c, [[ex - Math.cos(tg - .5) * 12, ey - Math.sin(tg - .5) * 12], [ex, ey], [ex - Math.cos(tg + .5) * 12, ey - Math.sin(tg + .5) * 12]], { w: 3, color: P.blue, seed: 7902, amp: .4 });
      dsMono(c, 'agent loop', cx, y + h - 26, { size: 24, align: 'center', color: P.ink }); c.restore(); }); }
  c.restore(); }
// d2LiftShadow：抬起的纸片投在纸面上的一块软影（越高越淡、越偏）
function d2LiftShadow(c, r, lift) { if (lift <= .01) return; const [x, y, w, h] = r;
  c.save(); c.globalAlpha *= .16 * lift; c.fillStyle = '#281a22'; c.fill(polyPath(rectPts(x + 6 + lift * 8, y + 10 + lift * 14, w, h, 12))); c.restore(); }
// d2AltCard：另一种 loop（三根箭头首尾相接成三角形，紫色）
function d2AltCard(c, r, o = {}) { const [x, y, w, h] = r, { k = 1, lift = 0, seed = 7960 } = o; if (k <= .001) return;
  pop(c, x + w / 2, y + h / 2, k, () => { c.save(); c.translate(0, -lift * 10);
    dsSlip(c, x, y, w, h, { color: mix(DSC.slip, D2AC, .16), seed });
    const cx = x + w / 2, cy = y + h * .36, rr = h * .2, V = [0, 1, 2].map(i => { const a = -Math.PI / 2 + i * TAU / 3; return [cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr]; });
    for (let i = 0; i < 3; i++) { const a = V[i], b = V[(i + 1) % 3]; arrow(c, [lerp(a[0], b[0], .14), lerp(a[1], b[1], .14)], [lerp(a[0], b[0], .86), lerp(a[1], b[1], .86)], { w: 3, head: 9, color: D2AC, seed: seed + 1 + i * 2 }); }
    zh(c, '另一种 loop', cx, y + h - 22, { size: 24, align: 'center', color: P.ink }); c.restore(); }); }
// d2Pencil：一支剪纸铅笔，笔尖在 (x, y)，笔杆朝右上
function d2Pencil(c, x, y, o = {}) { const { al = 1, th = -1.02, L = 200, hw = 10 } = o; if (al <= 0) return;
  const ux = Math.cos(th), uy = Math.sin(th), vx = -uy, vy = ux, at = (u, v) => [x + ux * u + vx * v, y + uy * u + vy * v];
  c.save(); c.globalAlpha *= al;
  cutPaper(c, [at(10, -hw * .32), at(38, -hw), at(L - 30, -hw), at(L - 30, hw), at(38, hw), at(10, hw * .32)], mix(P.g2, P.g1, .35), { seed: 7971, step: 30, blur: 6, sx: 5, sy: 8 });   // 笔杆
  cutPaper(c, [at(L - 30, -hw), at(L - 14, -hw), at(L - 14, hw), at(L - 30, hw)], mix(P.g1, '#ffffff', .2), { seed: 7972, step: 10, shadow: false });                                 // 铁箍
  cutPaper(c, [at(L - 14, -hw), at(L - 2, -hw * .9), at(L, 0), at(L - 2, hw * .9), at(L - 14, hw)], mix(P.g1, P.paper, .5), { seed: 7973, step: 8, shadow: false });                // 橡皮
  cutPaper(c, [at(9, -hw * .36), at(38, -hw), at(38, hw), at(9, hw * .36)], mix(P.paper, P.gold, .3), { seed: 7974, step: 8, shadow: false });                                     // 削开的木头
  cutPaper(c, [at(0, 0), at(11, -hw * .38), at(11, hw * .38)], P.g3, { seed: 7975, step: 4, shadow: false, grain: 0 });                                                            // 铅芯
  rline(c, [at(44, -hw * .35), at(L - 34, -hw * .35)], { w: 1.4, color: alpha('#ffffff', .45), seed: 7976, amp: .3 });
  c.restore(); }
// d2Socket：管道上的一个预留口子（一个方形小孔）。plug 0..1 有处理器插在里面（紫色）
function d2Socket(c, x, y, s, o = {}) { const { k = 1, plug = 0, seed = 7980 } = o; if (k <= .001) return;
  pop(c, x, y, k, () => { cutPaper(c, rectPts(x - s / 2, y - s / 2, s, s, 5), mix(P.g3, P.paper, .25), { seed, step: 8, shadow: false, grain: .05 });
    c.save(); c.strokeStyle = alpha(P.ink, .35); c.lineWidth = 1.5; c.strokeRect(x - s / 2 + 2, y - s / 2 + 2, s - 4, s - 4); c.restore();
    if (plug > 0) pop(c, x, y, plug, () => cutPaper(c, rectPts(x - s * .34, y - s * .34, s * .68, s * .68, 3), mix(DSC.slip, D2AC, .5), { seed: seed + 1, step: 6, blur: 2, sx: 1, sy: 1.5 })); }); }
// d2TextRows：SKILL.md 上几行「字」（灰色的词块）
function d2Rows(x, y, seed) { return [0, 1, 2, 3].map(r => { const out = []; let xx = x; const n = 3 + Math.floor(hash(r, seed) * 2), total = [150, 168, 112, 156][r];
  for (let k = 0; k < n; k++) { const wd = total / n * (.7 + hash(r * 7 + k, seed + 1) * .5) - 8; out.push([xx, xx + wd]); xx += wd + 12; } return out; }); }
const D2ROWS = d2Rows(D2SK[0] + 26, 0, 7990);

// ===================== 每一段的时刻 =====================
// 台阶立起 / 亮起 / 纸条
function d2Up(tau) { return [0, 1, 2].map(i => { const t0 = D2W(0, '三级') - .4 + i * .32; return tau < t0 ? 0 : Math.sin(fxPopAngle(tau, t0)); }); }
function d2Lit(tau) { return [dsK(tau, D2W(1, '第一级') - .1, .5), dsK(tau, D2W(5, '第二级') - .1, .5), dsK(tau, D2W(12, '第三级') - .1, .5)]; }
function d2Notes(tau) { const lin = (t0, d) => clamp((tau - t0) / d, 0, 1), a = D2W(13, '能改的'), b = D2W(13, '地基');
  return [lin(D2T(5) - .45, .7), lin(D2E(11) + .3, .7), key(tau, [[a - .15, 0], [a + .2, .2857], [b - .15, .2857], [b + .3, 1]], x => x)]; }
// harness 管道的位置：合着的盒子 → 打开（第 6 句）→ 挪到上面（第 7 句）→ 拉远成盒子上沿（第 11 句）
const d2Open = tau => dsK(tau, D2W(6, '进程里') - .35, .55, easeIO);
const d2Up7 = tau => dsK(tau, D2T(7) - .15, .45, easeIO);
const d2Back = tau => dsK(tau, D2T(11) - .1, .6, easeIO);
function d2Band(tau) { const op = d2Open(tau), pb = d2Back(tau);
  if (op < 1) return d2Mix(D2HB, D2BAND.open, op); if (pb > 0) return d2Mix(D2BAND.top, D2BAND.back, pb); return d2Mix(D2BAND.open, D2BAND.top, d2Up7(tau)); }
const d2SockXY = (b, i) => [b[0] + b[2] * D2SOCK[i] / 640, b[1] + b[3] / 2];
// 处理器链：第 9 句插进第四个时其余三个往左让
const d2Squeeze = tau => dsK(tau, D2W(9, '加载') - .5, .55, easeIO);
function d2Chain(tau) { const cm = d2Squeeze(tau); return D2CH3.map((r, i) => d2Mix(r, D2CH4[i], cm)); }
// 事件纸圆片（tool.call）在链上的位置 u：0 = 口子，1/2/3 = 第 1/2/3 个处理器
function d2TokU(tau) { const n1 = D2W(8, 'next'), n2 = D2W(8, '往下传'), dn = D2W(8, '拒绝'), drop = D2W(7, '一条链') - .1;
  return key(tau, [[drop, 0], [drop + .45, 1], [n1 - .4, 1], [n1 + .1, 2], [n2 - .05, 2], [n2 + .4, 3], [dn - .05, 3], [dn + .75, 0]], easeIO); }
function d2TokXY(tau, band) { const u = d2TokU(tau), ch = d2Chain(tau), [sx, sy] = d2SockXY(band, 0), pts = [[sx, sy], ...ch.map(r => [r[0] + r[2] / 2, r[1] - 2])];
  const i = Math.min(2, Math.floor(u)), f = u - i, a = pts[i], b = pts[i + 1], back = tau > D2W(8, '拒绝');   // pts：口子中心、各处理器上沿的中点
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f) - (back ? Math.sin(f * Math.PI) * 26 : 0)]; }

// ===================== 画 =====================
function d2Draw(c, tau, L) {
  const t = tau;
  dsPage(c, tau, '第二页 · 阶梯');
  const end = tau >= D2E(13) - .05;   // 段末：只画交接画面
  // ---- 主物件：三级台阶 ----
  if (end) dsHoStairs(c);
  else dsStairs(c, { up: d2Up(tau), lit: d2Lit(tau), notes: d2Notes(tau), hi: dsK(tau, D2W(13, '越往上') - .1, .6), accent: D2AC, t });
  if (!end) { d2Tier1(c, tau); d2Tier2(c, tau); d2Loops(c, tau); }
  // ---- 人物 ----
  dsCast(c, tau, L, D2LINES, {
    ranPose: tt => tt < D2T(0) ? 'present' : tt > D2E(13) - .05 ? 'stand' : (tt > D2T(3) - .2 && tt < D2T(4)) || (tt > D2T(10) - .2 && tt < D2T(11)) ? 'stand' : tt > D2T(8) && tt < D2T(9) ? 'read' : 'point',
    pchPose: tt => tt > D2T(10) - .5 ? 'cross' : 'lecture' });
}

// ---- 第一级：harness 纸盒、三张纸条、SKILL.md、铅笔、下次读取 ----
function d2Tier1(c, tau) {
  const t = tau, clr = dsK(tau, D2T(5) - .65, .45, easeIn), keep = 1 - clr;   // 第 5 句前：第一级的演示缩进第一级台阶
  // 三张纸条沿箭头喂进盒子（先画纸条，盒子盖在上面）
  const arA = 1 - dsK(tau, D2T(3) - .45, .35);
  D2SRC.forEach(([s, x, y], i) => { const tw = D2W(2, s), by = 303 + (y - 303) * .25, a = [x + 52, y], b = [D2HB[0] - 8, by];
    const ap = dsK(tau, D2W(2, '喂材料') - .15 + i * .12, .35);
    if (ap > 0 && arA > 0) dsArrow(c, a, b, { p: ap, seed: 8001 + i * 3, t, al: arA, w: 2.8, head: 13 });
    const k = dsPop(tau, tw - .12), s2 = dsK(tau, tw + .4, .5, easeIn); if (k <= 0 || s2 >= 1) return;
    dsLabel(c, s, lerp(x, D2HB[0] + 50, s2), lerp(y, by, s2), { size: 30, k: k * (1 - sm(.55, 1, s2) * .5), al: 1 - sm(.75, 1, s2), seed: 8010 + i, rot: (i - 1) * .03 * (1 - s2) }); });
  // harness 纸盒（第 6 句里打开，交给 d2Tier2）
  const bk = dsPop(tau, D2W(2, 'harness') - .15), op = d2Open(tau);
  if (bk > 0 && op <= 0) { const [x, y, w, h] = D2HB, hit = dsBump(tau, D2W(4, '生效') - .05, .5) * .6; dsNode(c, x, y, w, h, 'harness', { size: 36, k: bk, hi: hit, accent: D2AC, seed: 8020 }); }
  if (keep <= 0) return;
  pop(c, 560, 770, keep, () => {
    // SKILL.md（第 3 句，帕秋莉问）
    const sk = dsPop(tau, D2T(3) - .35), lf = dsBump(tau, D2W(4, '文本文件') - .1, .7);
    if (sk > 0) { const [x, y, w, h] = D2SK;
      pop(c, x + w / 2, y + h / 2, sk, () => { c.save(); c.translate(0, -lf * 8);
        dsSlip(c, x, y, w, h, { r: 8, seed: 8030, lift: 0 });
        dsMono(c, 'SKILL.md', x + 26, y + 40, { size: 22, color: P.ink2 }); rline(c, [[x + 20, y + 54], [x + w - 20, y + 54]], { w: 1.2, color: P.g1, seed: 8031, amp: .4 });
        const st = dsK(tau, D2W(3, '改了') - .05, .45, x => x), wr = dsK(tau, D2W(3, '改了') + .55, .6, x => x);
        D2ROWS.forEach((row, r) => { const yy = y + 86 + r * 38; row.forEach(([a, b], j) => rline(c, [[a, yy], [b, yy]], { w: 5, color: alpha(P.g2, r === 2 && st >= 1 ? .45 : .7), seed: 8040 + r * 5 + j, amp: .5 })); });
        // 改的那一行：划掉，旁边写上新的
        const ry = y + 86 + 2 * 38, rx0 = D2ROWS[2][0][0] - 6, rx1 = D2ROWS[2].at(-1)[1] + 6;
        if (st > 0) rline(c, [[rx0, ry - 1], [rx1, ry - 3]], { w: 3, color: P.g3, p: st, seed: 8050, amp: .5 });
        if (wr > 0) rline(c, d2Scrawl(rx1 + 14, ry), { w: 3, color: P.g3, p: wr, seed: 8051, amp: .4, smooth: true });
        c.restore(); }); }
    // 铅笔
    const pin = D2W(3, '改了') - .5, pAl = dsK(tau, pin, .3) * (1 - dsK(tau, D2W(3, '重启') - .05, .45));
    if (pAl > 0) { const ry = D2SK[1] + 86 + 2 * 38, rx0 = D2ROWS[2][0][0] - 6, rx1 = D2ROWS[2].at(-1)[1] + 6, S = d2Scrawl(rx1 + 14, ry);
      const st = dsK(tau, D2W(3, '改了') - .05, .45, x => x), mv = dsK(tau, D2W(3, '改了') + .4, .15), wr = dsK(tau, D2W(3, '改了') + .55, .6, x => x), out = dsK(tau, D2W(3, '重启') - .05, .45, easeIn);
      let [px, py] = [lerp(rx0 + 180, rx0, dsK(tau, pin, .45)), lerp(ry - 150, ry, dsK(tau, pin, .45))];
      if (st > 0) [px, py] = [lerp(rx0, rx1, st), ry - 1 - st * 2];
      if (mv > 0) [px, py] = [lerp(rx1, S[0][0], mv), lerp(ry - 3, S[0][1], mv)];
      if (wr > 0) { const f = wr * (S.length - 1), j = Math.min(S.length - 2, Math.floor(f)), g = f - j; [px, py] = [lerp(S[j][0], S[j + 1][0], g), lerp(S[j][1], S[j + 1][1], g)]; }
      d2Pencil(c, px + out * 120, py - out * 160, { al: pAl }); }
    // 下次读取（第 4 句）
    const ak = dsK(tau, D2W(4, '下次读') - .15, .45);
    if (ak > 0) { dsArrow(c, [D2SK[0] + D2SK[2] + 10, 298], [D2HB[0] - 10, 300], { p: ak, bend: -34, seed: 8060, t, w: 3, head: 14, color: mix(P.ink2, D2AC, .5) });
      dsLabel(c, '下次读取', 756, 244, { size: 26, k: dsPop(tau, D2W(4, '下次读') + .05), seed: 8061, rot: -.02 }); }
    const ck = dsK(tau, D2W(4, '生效') - .1, .35);
    if (ck > 0) check(c, 1106, 300, 58, { p: ck, seed: 8062, t });
  });
}
// 铅笔写的一行新字（手写的波浪）
function d2Scrawl(x, y) { return Array.from({ length: 13 }, (_, i) => { const u = i / 12; return [x + u * 66 + Math.sin(u * TAU * 3) * 4, y - Math.sin(u * TAU * 3 + .6) * 6 - 2]; }); }

// ---- 第二级：打开的 harness、事件管道、处理器链、代码纸、新处理器、拉远 ----
function d2Tier2(c, tau) {
  const t = tau, op = d2Open(tau); if (op <= 0) return;
  const fd = dsK(tau, D2E(11) - .05, .45, easeIn); if (fd >= 1) return;   // 第 12 句前：整个盒子缩进第二级台阶
  pop(c, 910, 640, 1 - fd, () => {
    const band = d2Band(tau), [bx, by, bw, bh] = band, cy = by + bh / 2, inA = sm(.55, 1, op), pb = d2Back(tau), s = bh / 60;
    // 拉远后：盒子的身子（在管道下面），里面钉死的 agent loop
    if (pb > 0) { const [x, y, w, h] = D2BODY;
      popup(c, y, pb, () => cutPaper(c, rectPts(x, y, w, h, 14), DSC.slip, { seed: 8100, step: 26, blur: 7, sx: 3, sy: 5 }), [x, x + w]);
      const lk = dsPop(tau, D2W(11, '循环本身') - .1, .4);
      if (lk > 0) { const [lx, ly, lw, lh] = D2LOOP; dsLoopCard(c, lx, ly, lw, lh, { k: lk, accent: P.g3, seed: 8110 });
        [[lx + 16, ly + 16], [lx + lw - 16, ly + 16], [lx + lw - 16, ly + lh - 16], [lx + 16, ly + lh - 16]].forEach(([px, py], i) => pop(c, px, py, dsPop(tau, D2W(11, '不在口子里') - .1 + i * .12, .3), () => brassPin(c, px, py, 12))); } }
    // 管道：合着的盒子 → 一条长纸带（槽里有一道带箭头的墨线），三个预留口子
    if (op < 1) { dsSlip(c, bx, by, bw, bh, { color: mix(DSC.slip, DSC.shade, op), seed: 8020, r: 12 }); zh(c, 'harness', bx + bw / 2, cy + 13, { size: 36, align: 'center', color: P.ink, al: 1 - sm(0, .5, op) }); }
    else dsSlip(c, bx, by, bw, bh, { color: DSC.shade, seed: 8020, r: 12 });
    if (inA > 0) { c.save(); c.globalAlpha *= inA;
      dsArrow(c, [bx + 22, cy], [bx + bw - 18, cy], { w: 2.4, head: 11, color: P.g2, seed: 8121, t });
      const pulse = i => dsBump(tau, D2W(6, '官方预留') - .05 + i * .1, .55) * .3 + dsBump(tau, D2W(11, '口子') - .05 + i * .1, .55) * .3;
      for (let i = 0; i < 3; i++) { const [sx, sy] = d2SockXY(band, i); d2Socket(c, sx, sy, 30 * s * (1 + pulse(i)), { k: dsPop(tau, d2Open0() + .35 + i * .1), plug: i === 0 ? sm(.45, 1, pb) : 0, seed: 8130 + i * 2 }); }
      dsLabel(c, 'harness', bx + bw - 122, by, { size: 26, align: 'left', seed: 8139 });
      // 事件名 tool.call 写在第一个口子旁边
      const tcA = dsK(tau, D2W(7, '事件') - .15, .35); if (tcA > 0) { const [sx, sy] = d2SockXY(band, 0), lx = sx + 24 * s, lw = dsMonoW(c, 'tool.call', 20);
        c.save(); c.globalAlpha *= tcA; c.fillStyle = DSC.shade; c.fillRect(lx - 6, sy - 13, lw + 12, 24); c.restore();   // 槽线在字后面断开
        dsMono(c, 'tool.call', lx, sy + 7, { size: 20, color: P.ink2, al: tcA }); }
      c.restore(); }
    // 第 6 句：拦截 / 改写（处理器从口子外面伸进来的小舌头 + 两个走过的事件）
    const g6 = 1 - dsK(tau, D2T(7) - .4, .3);
    if (g6 > 0 && inA > 0) { const iA = D2W(6, '拦截'), iB = D2W(6, '改写');
      [[0, iA], [1, iB]].forEach(([i, t0]) => { const [sx] = d2SockXY(band, i), k = dsPop(tau, t0 - .14, .3) * g6;
        if (k > 0) popup(c, by + 4, k, () => cutPaper(c, rectPts(sx - 11, by - 30, 22, 36, 5), mix(DSC.slip, D2AC, .45), { seed: 8140 + i, step: 6, blur: 3 }), [sx - 11, sx + 11]);
        dsLabel(c, i ? '改写' : '拦截', sx, by + bh + 40, { size: 28, k: dsPop(tau, t0 + .05) * g6, seed: 8142 + i }); });
      // 事件一：走到第一个口子被拦住、吞进去
      const [s0x] = d2SockXY(band, 0), [s1x] = d2SockXY(band, 1), x0 = bx + 34;
      const a1 = dsK(tau, iA - .6, .3) * (1 - dsK(tau, iA + .3, .3, easeIn));
      if (a1 > 0) dsToken(c, lerp(x0, s0x, dsK(tau, iA - .55, .5, easeIO)), cy, 13 * (.4 + .6 * a1), P.moon, { seed: 8150 });
      // 事件二：走到第二个口子被改写（换成紫色），接着往下走
      const a2 = dsK(tau, iB - .75, .25) * (1 - dsK(tau, iB + .75, .3)), go = key(tau, [[iB - .72, x0], [iB - .08, s1x], [iB + .3, s1x], [iB + 1, bx + bw - 44]], easeIO);
      if (a2 > 0) dsToken(c, go, cy - dsBump(tau, iB - .05, .35) * 10, 13, mix(P.moon, D2AC, dsK(tau, iB, .25)), { al: a2 * g6, seed: 8151 }); }
    // 第 7–10 句：tool.call 的处理器链（拉远时缩回第一个口子）
    if (pb < 1) { const [s0x, s0y] = d2SockXY(band, 0); pop(c, s0x, s0y, 1 - pb, () => d2ChainDraw(c, tau, band)); }
    // 第 11 句：官方预留
    const q0 = Math.max(D2W(11, '官方预留') - .05, D2T(11) + .55), qk = dsPop(tau, q0);
    if (qk > 0) { const [a] = d2SockXY(band, 0), [b] = d2SockXY(band, 2);
      dsBrace(c, a - 22, b + 22, by - 30, { dir: 1, p: dsK(tau, q0 + .1, .4), seed: 8160, t, color: D2AC, d: 14 });
      dsLabel(c, '官方预留', (a + b) / 2, by - 56, { size: 28, k: qk, seed: 8161, ink: mix(P.ink, D2AC, .5) }); }
  });
}
const d2Open0 = () => D2W(6, '进程里') - .35;
// 处理器链 + 代码纸 + 新处理器
function d2ChainDraw(c, tau, band) {
  const t = tau, ch = d2Chain(tau), cm = d2Squeeze(tau), n1 = D2W(8, 'next'), n2 = D2W(8, '往下传'), dn = D2W(8, '拒绝');
  // 链上的箭头
  for (let i = 0; i < 3; i++) { const a = ch[i], b = i < 2 ? ch[i + 1] : D2CH4[3], p = i < 2 ? dsK(tau, D2W(7, '串成') - .1 + i * .2, .35) : sm(.6, 1, cm); if (p <= 0) continue;
    const y = a[1] + a[3] / 2 + 6, hot = i === 0 ? dsBump(tau, n1 - .25, .7) : i === 1 ? dsBump(tau, n2 - .2, .7) : 0;
    dsArrow(c, [a[0] + a[2] + 6, y], [b[0] - 8, y], { p, seed: 8201 + i * 3, t, w: 2.8, head: 12, color: mix(P.ink2, D2AC, hot) });
    // next(e)：前两根箭头上，事件走过时写上
    if (i < 2) { const nA = dsK(tau, (i ? n2 : n1) - .3, .3) * (1 - dsK(tau, D2W(9, '加载') - .7, .3)); if (nA > 0) dsMono(c, 'next(e)', (a[0] + a[2] + b[0]) / 2, a[1] + a[3] + 6, { size: 18, align: 'center', color: mix(P.ink2, D2AC, .6), al: nA }); } }
  // 三个处理器
  ch.forEach((r, i) => dsNode(c, r[0], r[1], r[2], r[3], '处理器', { size: 26, k: dsPop(tau, D2W(7, '处理器') - .1 + i * .18), seed: 8210 + i, hi: i === 2 ? dsBump(tau, dn - .05, .8) * .7 : 0, accent: P.red }));
  // 第三个就地拒绝：一个叉
  const xk = dsK(tau, dn - .05, .3) * (1 - dsK(tau, D2T(9) + .2, .3));
  if (xk > 0) { const r = ch[2]; cross(c, r[0] + r[2] + 30, r[1] + r[3] / 2 + 2, 36, { p: xk, seed: 8220, t }); }
  // 事件纸圆片
  const tokA = dsK(tau, D2W(7, '事件') - .1, .3) * (1 - dsK(tau, D2T(9) + .1, .3));
  if (tokA > 0) { const [x, y] = d2TokXY(tau, band); dsToken(c, x, y, 13, P.moon, { al: tokA, seed: 8230 }); }
  // 第 8 句：CC 文档里的真代码（next 那一行、deny 那一行跟着念到的词亮）
  const ck = dsPop(tau, D2T(8) - .05, .4) * (1 - dsK(tau, D2T(9) + .05, .35, easeIn));
  if (ck > 0) { const [x, y, w] = D2CODE;
    c.save(); c.letterSpacing = '0.3px';   // JetBrains Mono 会把 => 连写成 ⇒：字距不为 0 时连字关掉，代码照原样显示
    dsCodeSlip(c, x, y, w, D2CODE_SRC, { size: 18, lh: 25, k: ck, title: 'code.claude.com · mods/events', seed: 8240, accent: D2AC, mark: ['next', 'deny'],
      hl: { 4: dsK(tau, n1 - .2, .3) * (1 - dsK(tau, dn - .25, .3)), 2: dsK(tau, dn - .1, .3) } }); c.restore(); }
  // 第 9 句：Claude 写的新处理器——一个字一个字打出来，盖「同意」，插进链里
  const nk = dsPop(tau, D2W(9, '自己写') - .3, .4); if (nk <= 0) return;
  const [nx, ny, nw] = D2NEW, nh = 92, tp = dsK(tau, D2W(9, '自己写') - .05, 1.1, x => x), sk = clamp((tau - D2W(9, '点头') + .05) / .45, 0, 1);
  if (cm < 1) { const m = cm, r = d2Mix([nx, ny, nw, nh], D2CH4[3], m);
    pop(c, nx + nw / 2, ny + nh / 2, nk, () => {
      dsSlip(c, r[0], r[1], r[2], r[3], { color: mix(DSC.slip, D2AC, .16 * sm(.3, 1, m)), seed: 8250, r: 10, lift: Math.sin(m * Math.PI) });
      if (m < .5) { c.save(); c.globalAlpha *= 1 - m * 2; dsMono(c, 'mod', r[0] + 22, r[1] + 32, { size: 16, color: P.g2 }); rline(c, [[r[0] + 18, r[1] + 42], [r[0] + r[2] - 18, r[1] + 42]], { w: 1.2, color: P.g1, seed: 8251, amp: .4 });
        dsCode(c, ["on('tool.call', …)"], r[0] + 24, r[1] + 46 + 18, { size: 18, p: tp }); c.restore(); }
      else zh(c, '处理器', r[0] + r[2] / 2, r[1] + r[3] / 2 + 9, { size: 26, align: 'center', color: mix(P.ink, D2AC, .55), al: m * 2 - 1 });
      if (sk > 0) { c.save(); c.globalAlpha *= 1 - sm(0, .4, m); dsSeal(c, lerp(nx + nw - 34, r[0] + r[2] - 10, m), lerp(ny + nh + 8, r[1] + r[3] - 4, m), '同意', sk, { s: 64, seed: 8252 }); c.restore(); } }); }
  else { const r = D2CH4[3]; dsNode(c, r[0], r[1], r[2], r[3], '处理器', { size: 26, seed: 8250, hi: .55 + dsBump(tau, D2W(9, '加载') + .05, .6) * .45, accent: D2AC }); }
}

// ---- agent loop 纸片：飞到右上角候着 → 落到第三级 → 被换成另一种 loop → 换回来 ----
function d2Loops(c, tau) {
  const fly = dsK(tau, D2T(0) - .05, .55, easeIO), flyL = dsBump(tau, D2T(0) - .05, .55);
  const tDrop = D2W(12, 'DSH') - .1, drop = dsK(tau, tDrop, .35, easeIn), land = tDrop + .35;
  const tS1 = D2W(12, '能换掉') - .25, s1 = dsK(tau, tS1, .6, easeIO), tS2 = D2W(12, '插件') + .05, s2 = dsK(tau, tS2, .6, easeIO);
  const B0 = [DS_LOOPCARD.x, DS_LOOPCARD.y, DS_LOOPCARD.w, DS_LOOPCARD.h];
  let rA = fly < 1 ? d2Mix(B0, D2WAIT, fly) : d2Mix(D2WAIT, D2STEP, drop), liftA = flyL * .8, sqA = tau > land ? fxIceSquash(tau - land) : 0;
  const arc = (a, b, u, hgt) => { const r = d2Mix(a, b, u); r[1] -= Math.sin(u * Math.PI) * hgt; return r; };
  if (s2 > 0) { rA = arc(D2PARK, D2STEP, s2, 60); liftA = Math.sin(s2 * Math.PI); sqA = tau > tS2 + .6 ? fxIceSquash(tau - tS2 - .6) * .7 : 0; }
  else if (s1 > 0) { rA = arc(D2STEP, D2PARK, s1, 60); liftA = Math.sin(s1 * Math.PI); sqA = 0; }
  // 另一种 loop：念到 agent loop 时出现在左边，和它换位，再换回来，最后收起
  const kB = dsPop(tau, D2W(12, 'agent loop') - .05) * (1 - dsK(tau, D2E(12) - .5, .35, easeIn));
  let rB = D2PARK, liftB = 0, sqB = 0;
  if (s2 > 0) { rB = arc(D2STEP, D2PARK, s2, -30); liftB = Math.sin(s2 * Math.PI) * .7; }
  else if (s1 > 0) { rB = arc(D2PARK, D2STEP, s1, -30); liftB = Math.sin(s1 * Math.PI) * .7; sqB = tau > tS1 + .6 ? fxIceSquash(tau - tS1 - .6) * .7 : 0; }
  if (kB > 0) { d2LiftShadow(c, rB, liftB); c.save(); if (sqB) { const yb = rB[1] + rB[3]; c.translate(0, yb); c.scale(1 + sqB * .06, 1 - sqB * .1); c.translate(0, -yb); } d2AltCard(c, rB, { k: kB, lift: liftB }); c.restore(); }
  d2LiftShadow(c, rA, liftA); d2Card(c, rA, { lift: liftA, squash: sqA });
}

scene({ order: 2, key: 'ladder', title: '阶梯', dur: D2DUR, lines: D2LINES, fn: d2Draw, noFlip: true });
