'use strict';
// 第 6 段：结尾。YAML 里 agent-loop 那一行变回第三级台阶；日常开发未必更好、DSH 独有的是 harness 本身能进化、开发者预览的便签、下期预告；
// 最后整页淡回魔导书，封面合上，封面上写片名，桌上一张出处纸条。最后几秒不动。
// 顶层名字带 N6 / n6 前缀。
const N6LINES = dsSeq(.8, [
  ['所以，日常写代码，该换成 DSH 吗？', { who: 'patchouli' }],
  ['未必。有人拆过：对大多数人的日常开发，DSH 不会让体验更好。', { pause: .2, hold: .6 }],
  ['它独有的是：harness 本身，能被 agent 改写、进化。', { mood: 'proud', pause: .2, hold: 1.2 }],
  ['另外它还在开发者预览，以后会有不兼容的改动。', { mood: 'awkward', pause: .2, hold: .5 }],
  ['下期讲：harness 怎么变成模型的训练分布。', { mood: 'happy', pause: .3, hold: .8 }],
  ['这一页，我先收进图书馆了。', { who: 'patchouli', mood: 'smile', pause: .3, hold: 1.4 }],
]);
const N6T = i => N6LINES[i][0], N6E = i => N6LINES[i][1], N6W = (i, w) => dsWordT(N6LINES[i], w);
const N6CLOSE = N6E(5) - .6;                 // 合书开始
const N6DUR = N6CLOSE + 6.4;
const N6AC = P.purple;
const N6SRC = ['出处', 'deepseek-ai/deepseek-harness（0.2.1-rc.2）', 'docs/architecture.md · cordis-primer.md', 'arXiv 2608.25512 · Koishi v4.7 更新日志',
  'Claude Code mods 文档 · pi extensions 文档', '鸭哥：深入拆解 DSH · dsh-evolver · dsh-auto-evolve', '配音 小米 MiMo TTS（AI 合成，音色由文字描述生成）', 'BGM 少女幻葬 ～ Necro-Fantasy（ZUN）八音盒改编'];

function n6Draw(c, tau, L) {
  const t = tau, toBook = dsK(tau, N6CLOSE, .8, easeIO), close = sm(N6CLOSE + .8, N6CLOSE + 2.2, tau, easeIO);
  // ---- 书页上的内容（合书前） ----
  if (toBook < 1) {
    dsPage(c, tau, '结尾 · 回到阶梯', { t0: 1 });
    const row = 1 - dsK(tau, .45, .5, easeIn), up = [0, 1, 2].map(i => Math.sin(fxPopAngle(tau, .55 + i * .15)) / Math.sin(Math.PI / 2));
    if (row > 0) dsHoRow(c, { al: row });
    const hi = Math.max(dsK(tau, N6W(2, '独有'), .5), 0), notes = [0, 0, dsK(tau, N6W(2, '改写') - .2, .5)];
    dsStairs(c, { up, lit: [1, 1, 1], notes, hi, accent: N6AC, t });
    // agent loop 纸片站在第三级上；念到「进化」时被拿起来一下
    const B = DS_STAIRCARD, ck = dsPop(tau, 1.0, .4), lift = dsBump(tau, N6W(2, '进化') - .2, 1);
    dsLoopCard(c, B.x, B.y - lift * 16, B.w, B.h, { k: ck, lift, accent: P.blue });
    // 第 1 句：日常开发未必更好（小纸条 + 出处）
    const k1 = dsPop(tau, N6W(1, '日常开发') - .2) * (1 - dsK(tau, N6T(4) - .3, .3));
    if (k1 > 0) { dsLabel(c, '日常开发：未必更好', 560, 300, { size: 32, k: k1, seed: 8601, rot: -.02 });
      zh(c, '鸭哥《深入拆解 DSH》，2026-08-13', 560, 356, { size: 22, align: 'center', color: P.g2, al: k1 }); }
    // 第 3 句：开发者预览的便签（黄纸，斜贴在第二级上方）
    const k3 = dsPop(tau, N6W(3, '开发者预览') - .2, .4);
    if (k3 > 0) pop(c, 910, 410, k3, () => { c.save(); c.translate(910, 410); c.rotate(.06);
      cutPaper(c, rectPts(-130, -70, 260, 140, 4), '#efd98a', { seed: 8602, step: 18, blur: 5 });
      zh(c, '开发者预览', 0, -12, { size: 32, align: 'center', color: P.ink }); zh(c, '会有不兼容的改动', 0, 32, { size: 22, align: 'center', color: P.ink2 }); c.restore(); });
    // 第 4 句：下期预告：agent loop → 一摞数据纸
    const k4 = dsK(tau, N6T(4), .4);
    if (k4 > 0) { const x0 = 420, y0 = 210;
      for (let i = 0; i < 5; i++) { const kk = dsPop(tau, N6W(4, '训练分布') - .2 + i * .08); dsSlip(c, x0 + i * 6, y0 + 90 - i * 18, 230, 120, { seed: 8610 + i, k: kk, r: 6 }); }
      dsMono(c, 'session log → data', x0 + 140, y0 + 160, { size: 18, align: 'center', color: P.ink2, al: dsK(tau, N6W(4, '训练分布'), .4) });
      dsArrow(c, [B.x - 20, B.y + 30], [x0 + 268, y0 + 110], { bend: 40, p: dsK(tau, N6W(4, '怎么'), .5), seed: 8620, t, color: N6AC });
      dsLabel(c, '下期', x0 + 60, y0 - 2, { size: 30, k: dsPop(tau, N6T(4) + .1), seed: 8621, color: mix(DSC.slip, N6AC, .25) }); }
    dsCast(c, tau, L, N6LINES, { ranPose: tt => tt > N6T(2) && tt < N6T(3) ? 'present' : tt > N6T(4) && tt < N6T(5) ? 'point' : 'stand', pchPose: tt => tt > N6T(5) ? 'lecture' : 'stand' });
  }
  // ---- 合书 ----
  if (toBook > 0) { c.save(); c.globalAlpha *= toBook;
    dsBook(c, tau, close, { cover: [H0TITLE, 'DSH 设计拆解 · 上'], small: '帕秋莉讲座 · 第七集' });
    // 桌上一张出处纸条（合上以后出现）
    const sk = dsK(tau, N6CLOSE + 2.3, .6);
    if (sk > 0) { const x = 150, y = 300; dsSlip(c, x, y, 600, 420, { seed: 8630, k: sk, r: 6 });
      N6SRC.forEach((s, i) => zh(c, s, x + 34, y + 62 + i * 46, { size: i ? 22 : 30, color: i ? P.ink2 : P.ink, al: sk })); }
    c.restore(); }
}
scene({ order: 6, key: 'ending', title: '结尾', dur: N6DUR, lines: N6LINES, fn: n6Draw, noFlip: true });
