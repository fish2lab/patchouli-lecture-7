'use strict';
// 第 0 段：钩子。合着的魔导书翻开：左页一张纸做的 Koishi 控制台（人点「安装」，bot 不重启），右页 DSH（agent 自己写插件、自己装上），
// 两页底下是同一块 Cordis。最后左页写上片名，书和桌面淡成第一页的整页旧纸（八云蓝站的位置不变，接得上）。
// 顶层名字带 H0 / h0 前缀。
const H0LINES = dsSeq(1.9, [
  ['做过 QQ bot 的人，大概率用过 Koishi。', { mood: 'happy' }],
  ['在网页控制台点一下，插件就装上了，bot 不用重启。', { pause: .2, hold: .5 }],
  ['今年八月，DeepSeek 开源了自己的 agent harness，叫 DSH。', { pause: .3, hold: .3 }],
  ['它的底层，就是从 Koishi 抽出来的那个框架：Cordis。', { pause: .2, hold: .8 }],
  ['同一套框架，以前伺候 QQ bot，现在伺候 agent？', { who: 'patchouli', mood: 'surprised', pause: .3 }],
  ['问题没变，只是动手的换了。', { mood: 'proud', pause: .2 }],
  ['以前是人给 bot 装插件，现在是 agent 给自己装插件。', { pause: .1, hold: 1.2 }],
  ['这期回答：agent 给自己装插件，为什么需要一整套新的地基。', { pause: .3, hold: 1.6 }],
]);
const H0T = i => H0LINES[i][0], H0E = i => H0LINES[i][1], H0W = (i, w) => dsWordT(H0LINES[i], w);
const H0DUR = H0E(H0LINES.length - 1) + 1.4;
const H0AC = P.purple;
const H0KW = [130, 150, 760, 450];      // 左页：Koishi 控制台窗口
const H0DW = [990, 150, 450, 450];      // 右页：DSH 窗口（八云蓝站在它右边）
const H0PLUG = ['echo', 'dice', 'weather'];

// 开书：0–0.6 秒合着（封面在右半边），0.6–1.6 秒封面绕书脊翻到左边
const h0Open = (c, tau) => dsBook(c, tau, 1 - sm(.6, 1.6, tau, easeIO));
// 一个小 bot（圆角方脸 + 两只眼 + 天线），呼吸一样轻轻上下
function h0Bot(c, x, y, s, tau) { const b = Math.sin(tau * 3) * 2;
  rline(c, [[x, y - s * .55 + b], [x, y - s * .78 + b]], { w: 3, color: P.ink2, seed: 8001 }); dsDot(c, x, y - s * .82 + b, 6, H0AC);
  cutPaper(c, rectPts(x - s * .5, y - s * .55 + b, s, s * .8, 14), mix(DSC.slip, H0AC, .18), { seed: 8002, step: 14, blur: 4 });
  const bl = blinkAt(tau, 9) > .5; [-1, 1].forEach(d => { if (bl) rline(c, [[x + d * s * .2 - 7, y - s * .18 + b], [x + d * s * .2 + 7, y - s * .18 + b]], { w: 3, color: P.ink, seed: 8003 + d }); else dsDot(c, x + d * s * .2, y - s * .18 + b, 6, P.ink); }); }
// 心跳线：一直往前走（bot 在跑）
function h0Beat(c, x0, x1, y, tau, al = 1) { const pts = []; for (let x = x0; x <= x1; x += 4) { const ph = ((x - x0) / 90 - tau * 1.6) % 1, u = ph < 0 ? ph + 1 : ph, v = u > .42 && u < .58 ? Math.sin((u - .42) / .16 * TAU) * (u < .5 ? 16 : 7) : 0; pts.push([x, y - v]); }
  rline(c, pts, { w: 2.4, color: mix(P.green, P.ink, .2), seed: 8010, amp: .3, al }); }
// 剪纸手指（人）
function h0Hand(c, x, y, s, press = 0) { c.save(); c.translate(x, y); c.scale(1 - press * .08, 1 - press * .08);
  cutPaper(c, rectPts(-s * .14, -s * .02, s * .28, s * .62, s * .14), '#f1e2d6', { seed: 8020, step: 8, blur: 4 });
  cutPaper(c, rectPts(-s * .3, s * .32, s * .6, s * .5, s * .18), '#f1e2d6', { seed: 8021, step: 10, blur: 4 });
  cutPaper(c, rectPts(-s * .32, s * .74, s * .64, s * .36, 4), mix(P.ribbonBlue, P.paper, .3), { seed: 8022, step: 12, blur: 3 }); c.restore(); }

function h0Draw(c, tau, L) {
  const t = tau, fade = dsK(tau, H0DUR - 1.3, .9, easeIO);   // 段末：书和桌面淡成整页旧纸
  h0Open(c, tau);
  const show = 1 - dsK(tau, H0T(7) - .2, .5);                  // 第 7 句：窗口都收起来，写片名
  // ---- 左页：Koishi 控制台 ----
  const kK = dsPop(tau, H0T(0) - .1, .45) * show;
  if (kK > 0) { const [x, y, w, h] = H0KW, body = dsWindow(c, x, y, w, h, 'Koishi 控制台', { k: kK, seed: 8030, accent: H0AC });
    if (kK > .9) { const bx = x + 160, by = y + 220;
      h0Bot(c, bx, by, 130, tau); zh(c, 'bot', bx, by + 70, { size: 28, align: 'center', color: P.ink2 });
      h0Beat(c, x + 50, x + 270, by + 120, tau); zh(c, '运行中', bx, by + 162, { size: 24, align: 'center', color: P.g2 });
      // 右边：插件市场三张纸条，每张一个「安装」
      zh(c, '插件市场', x + 560, y + 104, { size: 26, align: 'center', color: P.g2 });
      const tIn = H0W(1, '点一下') + .2, slide = dsK(tau, tIn + .25, .6, easeIO);
      H0PLUG.forEach((n, i) => { const py = y + 136 + i * 84, moving = i === 1;
        const px = moving ? lerp(x + 400, x + 60, slide) : x + 400, pyy = moving ? lerp(py, y + 360, slide) : py;
        if (!(moving && slide >= 1)) { dsSlip(c, px, pyy, 320, 62, { seed: 8040 + i, r: 8 }); dsMono(c, n, px + 22, pyy + 40, { size: 24 });
          if (!moving || slide < .05) dsLabel(c, '安装', px + 270, pyy + 31, { size: 22, seed: 8050 + i, color: mix(DSC.slip, H0AC, .3) }); } });
      // 已装：bot 下面的一行
      const inst = ['echo'].concat(slide >= 1 ? ['dice'] : []);
      zh(c, '已装：', x + 50, y + 418, { size: 26, color: P.g2 }); dsMono(c, inst.join('  '), x + 130, y + 418, { size: 24, color: P.ink });
      if (slide >= 1) check(c, x + 310, y + 410, 30, { p: dsK(tau, tIn + .9, .3) });
      // 剪纸手指（人）：移到 dice 的「安装」，按一下
      // 按完以后退到窗口右下角歇着（不压住别的纸条）
      const hk = win(H0T(1), H0T(7), tau, .4), go = dsK(tau, H0T(1), .5) * (1 - dsK(tau, tIn + .5, .5)), hx = lerp(x + 700, x + 676, go), hy = lerp(y + 360, y + 236, go);
      if (hk > 0) { c.save(); c.globalAlpha *= hk; h0Hand(c, hx, hy, 90, dsBump(tau, tIn, .3)); c.restore();
        dsLabel(c, '人', hx + 2, hy + 132, { size: 28, k: dsPop(tau, H0T(5)) * hk, seed: 8080, color: mix(DSC.slip, P.moon, .3) }); } } }
  // ---- 右页：DSH ----
  const dK = dsPop(tau, H0W(2, 'DSH') - .2, .45) * show;
  if (dK > 0) { const [x, y, w, h] = H0DW; dsWindow(c, x, y, w, h, 'dsh', { k: dK, seed: 8060, accent: P.blue });
    if (dK > .9) { const ax = x + 100, ay = y + 220, wob = Math.sin(tau * 2.4) * 3;
      cutPaper(c, circPts(ax, ay + wob, 40, 28), mix(DSC.slip, H0AC, .45), { seed: 8061, step: 8, blur: 4 }); zh(c, 'agent', ax, ay + 80, { size: 28, align: 'center', color: P.ink2 });
      zh(c, '插件', x + 330, y + 104, { size: 26, align: 'center', color: P.g2 });
      ['tools', 'llm'].forEach((n, i) => { dsSlip(c, x + 230, y + 130 + i * 72, 196, 56, { seed: 8062 + i, r: 8 }); dsMono(c, n, x + 250, y + 166 + i * 72, { size: 22 }); });
      // 第 6 句：agent 自己写一张插件纸条（逐字），自己塞进列表
      const wT = H0W(6, 'agent'), wp = dsK(tau, wT, .9, x => x), mv = dsK(tau, wT + 1.1, .6, easeIO);
      if (wp > 0) { const sx = lerp(ax - 70, x + 230, mv), sy = lerp(y + 340, y + 274, mv);
        dsSlip(c, sx, sy, 196, 56, { seed: 8064, r: 8, color: mix(DSC.slip, H0AC, .14 * (1 - mv)) }); dsMono(c, 'my-plugin', sx + 20, sy + 36, { size: 22, p: wp });
        if (mv < 1) rline(c, [[ax + 20, ay + 20], [sx + 20, sy + 6]], { w: 2, color: alpha(H0AC, .6), seed: 8065, dash: [6, 6], p: wp }); } } }
  // ---- 第 3 句：两页底下同一块 Cordis（越过书脊连成一块） ----
  const cK = dsPop(tau, H0W(3, 'Cordis') - .2, .45) * show;
  if (cK > 0) { dsCordisSlab(c, 400, 660, 1040, 96, { k: cK, sub: '' });   // 左端留出帕秋莉探头的那一角
    [[H0KW[0] + H0KW[2] / 2, H0KW[1] + H0KW[3]], [H0DW[0] + H0DW[2] / 2, H0DW[1] + H0DW[3]]].forEach(([x, y], i) => rline(c, [[x, y + 4], [x, 656]], { w: 2.4, color: P.ink2, p: cK, seed: 8070 + i, dash: [8, 6] })); }
  // ---- 第 5、6 句：动手的人换了：人 → 模型 ----
  const swK = dsK(tau, H0T(5), .4) * show;
  if (swK > 0) { dsLabel(c, '换了', CX, 630, { size: 26, k: dsPop(tau, H0T(5) + .3) * show, seed: 8083, rot: -.03 });
    dsArrow(c, [806, 630], [920, 630], { p: dsK(tau, H0W(6, '现在'), .4) * show, seed: 8082, t, color: H0AC, w: 3 });
    dsArrow(c, [1000, 630], [1110, 630], { p: dsK(tau, H0W(6, '现在') + .3, .4) * show, seed: 8084, t, color: H0AC, w: 3 }); }
  // ---- 第 7 句：片名写在左页 ----
  const tk = dsK(tau, H0T(7), .4) * (1 - fade);
  if (tk > 0) { const x = 140;
    zh(c, '会给自己装插件的 agent', x, 400, { size: 70, color: P.ink, p: writeP(tau, H0T(7) + .1, '会给自己装插件的 agent', .07) });
    rline(c, [[x, 432], [x + 760 * dsK(tau, H0T(7) + 1.2, .6), 432]], { w: 3, color: H0AC, seed: 8090, t });
    zh(c, 'DeepSeek Harness 设计拆解 · 上', x, 490, { size: 36, color: P.ink2, al: dsK(tau, H0T(7) + 1.4, .4) });
    zh(c, '帕秋莉讲座 · 第七集', x, 548, { size: 28, color: P.g2, al: dsK(tau, H0T(7) + 1.8, .4) }); }
  // 段末：书和桌面淡成第一页的整页旧纸
  if (fade > 0) { c.save(); c.globalAlpha *= fade; dsPage(c, 99, null); c.restore(); }
  // ---- 人物：八云蓝开书以后出来，站在右页上；帕秋莉只在她那句进来 ----
  c.save(); c.globalAlpha *= dsK(tau, H0T(0) - .5, .5);
  dsCast(c, tau, L, H0LINES, { ranPose: tt => tt > H0T(6) && tt < H0T(7) ? 'point' : tt > H0T(2) && tt < H0T(3) ? 'present' : 'stand', pchPeek: { x: 250, y: BOOK.y + BOOK.h - 22 } });
  c.restore();
}
scene({ order: 0, key: 'hook', title: '钩子', dur: H0DUR, lines: H0LINES, fn: h0Draw, noFlip: true });
