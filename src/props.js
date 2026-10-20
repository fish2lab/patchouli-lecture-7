'use strict';
// 第 7 集共用：站位、纸条和流程图画具、人物出场、段间交接（主会话维护；各段只调用，不改）。顶层名字一律带 DS / ds 前缀。
// 画风照第 1 集（patchouli-lecture-1）：整页暖色旧纸，东西是剪纸做的（剪刀边、纸纹、软影），标签是一张张白纸条，
// 字是霞鹜文楷，线是手画的墨线。讲 CS 的图就画最普通的流程图：圆角矩形的纸片 + 手画箭头。
// 一页一种压暗的颜色做强调（P.blue / P.purple / P.green / P.red 之一），其余都是纸、墨、灰。
//
//   页面    dsPage(c, tau, title, o)                     整页旧纸 + 左上角页眉（第一页 · 循环）
//   纸片    dsSlip(c, x, y, w, h, o)                     一张剪纸圆角矩形（流程图的框、标签、卡片都用它）
//           dsNode(c, x, y, w, h, title, o)              流程图节点：纸片 + 中间一行字 + 下面一行等宽小字（事件名）
//           dsLabel(c, text, x, y, o)                    白纸条小标签（第 1 集「菌群」那种），宽度随字
//           dsCodeSlip(c, x, y, w, lines, o)             一张写着代码的纸片
//   线      dsArrow(c, a, b, o)                          手画墨线箭头（kit 的 arrow，每秒抖 8 次）
//           dsDashBox(c, x, y, w, h, o)                  手画虚线框（圈出一块范围，比如 harness）
//           dsBrace(c, x0, x1, y, o)                     手画花括号
//   字      zh(…)（kit）中文；dsMono(c, text, x, y, o) 等宽英文 / 事件名；dsCode(c, lines, x, y, o) 代码
//   小物    dsToken 走动的小纸圆片；dsSeal 朱印；dsPin 图钉（kit 的 brassPin）
//   人物    dsCast(c, tau, L, LINES, o)                  八云蓝站在右边讲；帕秋莉在她自己的台词里从左边进来（o.pchPeek = { x, y } 改成从纸边探头）
//   台词    dsSeq(t0, items) 默认八云蓝说；dsWordT(line, word) 念到某个词的时刻

const EP_HOST = 'ran';   // 主讲人（film.js 用：字幕里不给她加名字）
const DS = {
  ran: { x: 1650, y: 900, h: 450, facing: -1 },   // 八云蓝：右边讲解，朝左（连尾巴约 x 1470–1830）
  pch: { x: 236, y: 900, h: 420 },                // 帕秋莉：提问时从左边走进来（约 x 130–340）
  area: { x0: 90, x1: 1430, y0: 150, y1: 880 },   // 八云蓝在右边时的内容区；帕秋莉进来时左边 x<380 也要空出来
};
const DSC = { slip: '#f7f3ea', slip2: '#eee7d8', shade: '#e2d9c6', ink: P.ink, ink2: P.ink2, mute: P.g2, faint: P.faint };
const DS_MONO = '"JetBrains Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace';

// ===================== 台词 =====================
// dsSeq：同 seq，默认 who 是八云蓝；时长按「配音 + 0.35 秒」和「读得完字幕」取大（读字幕按汉字 0.15 秒、一个英文词 0.3 秒；
// seq 默认按字符数算，harness 会被当成 7 个字，句子拖得太长）。注意 seq 给了 dur 就不再加 hold，所以这里把 hold 加进 dur
function dsRead(text) { const s = String(text), latin = (s.match(/[A-Za-z][\w.-]*/g) || []).length, cjk = [...s.replace(/[A-Za-z][\w.-]*/g, '')].filter(ch => /[㐀-鿿]/.test(ch)).length; return cjk * .15 + latin * .3 + .5; }
function dsSeq(t0, items) { return seq(t0, items.map(it => { const [text, o = {}] = Array.isArray(it) ? it : [it], v = voiceOf(text);
  return [text, { who: 'ran', ...o, ...(o.dur || !v ? {} : { dur: Math.max(v.d + .35, dsRead(text)) + (o.hold || 0) }) }]; })); }
// dsWordT：一句台词里念到 word 的大约时刻（段内秒）。按配音时长摊开：汉字 1 份、英文词 2.5 份、标点 0.6 份（停顿）
function dsWordT(line, word) {
  const [t0, t1, text] = line, v = voiceOf(text), d = v ? v.d : (t1 - t0) * .85, at = text.indexOf(word);
  if (at < 0) return t0;
  const w = s => (s.match(/[A-Za-z][\w.-]*/g) || []).length * 2.5 + [...s.replace(/[A-Za-z][\w.-]*/g, '')].reduce((a, ch) => a + (/[㐀-鿿]/.test(ch) ? 1 : /\s/.test(ch) ? 0 : .6), 0);
  return t0 + d * clamp(w(text.slice(0, at)) / Math.max(1, w(text)), 0, 1);
}

// ===================== 时间 =====================
const dsK = (tau, t0, d = .4, e = easeOut) => sm(t0, t0 + d, tau, e);                       // t0 起 d 秒 0→1
const dsPop = (tau, t0, d = .35) => sm(t0, t0 + d, tau, easeOutBack);                       // 弹出来（略过冲）
const dsBump = (tau, t0, d = .6) => { const u = (tau - t0) / d; return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI); };
function dsWin(tau, wins, fi = .35, fo = .45) { let v = 0; for (const [a, b] of wins) v = Math.max(v, Math.min(sm(a, a + fi, tau, easeOut), 1 - sm(b, b + fo, tau, easeIn))); return v; }

// ===================== 页面 =====================
// dsPage：整页旧纸 + 左上角页眉。o = { color 纸色, t0 页眉出现, t1 收起, lines 横格 }
// 页眉在段末 0.5 秒前淡出，交接画面里不带页眉，下一页的页眉再淡入
function dsPage(c, tau, title, o = {}) { paperBg(c, { color: o.color || P.paper, lines: o.lines ?? true }); if (!title) return;
  const sc = FILM.T.find(s => s.start === CLOCK0); pageHeader(c, title, tau, o.t0 ?? .3, { x: 70, y: 86, t1: o.t1 ?? (sc ? sc.dur - .5 : 1e9) }); }

// ===================== 纸片 =====================
// dsSlip：一张剪纸圆角矩形。o = { color, r, seed, k 弹出 0..1（以中心缩放）, lift 抬起 0..1, al, edge 描一圈颜色, ew, blur, step }
function dsSlip(c, x, y, w, h, o = {}) {
  const { color = DSC.slip, r = 12, seed = 7001, k = 1, lift = 0, al = 1, edge = null, ew = 3, step = 22 } = o; if (k <= .001 || al <= 0) return null;
  let path = null;
  pop(c, x + w / 2, y + h / 2, k, () => {
    c.save(); c.globalAlpha *= al; c.translate(0, -lift * 8);
    path = cutPaper(c, rectPts(x, y, w, h, r), color, { seed, step, blur: 5 + lift * 14, sx: 2 + lift * 3, sy: 3.5 + lift * 9, grain: .09 });
    if (edge) { c.strokeStyle = edge; c.lineWidth = ew; c.stroke(path); }
    c.restore(); });
  return path;
}
// dsNode：流程图节点。o = { size 字号, sub 下面一行等宽小字, color 纸色, hi 0..1 高亮（纸染一点强调色 + 字下一道线）, accent 强调色, k, seed, dim 0..1 压暗, al }
function dsNode(c, x, y, w, h, title, o = {}) {
  const { size = 34, sub = null, color = DSC.slip, hi = 0, accent = P.blue, k = 1, seed = 7100, dim = 0, al = 1, subSize = 17 } = o; if (k <= .001 || al <= 0) return;
  const fill = mix(mix(color, accent, .16 * hi), P.g1, .5 * dim);
  pop(c, x + w / 2, y + h / 2, k, () => { c.save(); c.globalAlpha *= al * (1 - .45 * dim);
    dsSlip(c, x, y, w, h, { color: fill, seed });
    const ty = sub ? y + h / 2 + size * .12 : y + h / 2 + size * .36;
    zh(c, title, x + w / 2, ty, { size, align: 'center', color: mix(P.ink, accent, .55 * hi) });
    if (hi > .01) rline(c, [[x + w / 2 - zhWidth(c, title, size) / 2, ty + 8], [x + w / 2 + zhWidth(c, title, size) / 2, ty + 8]], { w: 3, color: accent, p: hi, seed: seed + 3, amp: .6 });
    if (sub) dsMono(c, sub, x + w / 2, y + h - 18, { size: subSize, align: 'center', color: P.ink2 });
    c.restore(); });
}
// dsLabel：白纸条小标签，宽度随字。o = { size, color, ink, k, seed, rot, align 'center'|'left' }
function dsLabel(c, text, x, y, o = {}) { const { size = 32, color = DSC.slip, ink = P.ink, k = 1, seed = 7200, rot = 0, align = 'center', al = 1, mono = false } = o; if (k <= .001 || al <= 0) return 0;
  const tw = mono ? dsMonoW(c, text, size) : zhWidth(c, text, size), w = tw + size * .9, h = size * 1.55, x0 = align === 'center' ? x - w / 2 : x;
  c.save(); c.globalAlpha *= al; c.translate(x0 + w / 2, y); c.rotate(rot); c.translate(-x0 - w / 2, -y);
  pop(c, x0 + w / 2, y, k, () => { cutPaper(c, [[x0, y - h / 2 + 2], [x0 + w, y - h / 2], [x0 + w - 3, y + h / 2], [x0 + 2, y + h / 2 - 1]], color, { seed, step: 30, blur: 4 });
    if (mono) dsMono(c, text, x0 + w / 2, y + size * .34, { size, align: 'center', color: ink }); else zh(c, text, x0 + w / 2, y + size * .36, { size, align: 'center', color: ink }); });
  c.restore(); return w; }

// ===================== 线 =====================
// dsArrow：手画墨线箭头。o = { w, color, p, bend, head, seed, t（传了就每秒抖 8 次）, al }
function dsArrow(c, a, b, o = {}) { const { al = 1 } = o; if (al <= 0) return; c.save(); c.globalAlpha *= al; arrow(c, a, b, { w: 3.2, color: P.ink2, head: 16, ...o }); c.restore(); }
// dsPath：手画折线（rline），o 同 rline
function dsPath(c, pts, o = {}) { rline(c, pts, { w: 3.2, color: P.ink2, ...o }); }
// dsDashBox：手画虚线框，左上角一张小标签。o = { color, p, t, seed, label, labelSize, al, r }
function dsDashBox(c, x, y, w, h, o = {}) { const { color = P.g2, p = 1, t = null, seed = 7300, label = null, labelSize = 28, al = 1, r = 26 } = o; if (p <= 0 || al <= 0) return;
  c.save(); c.globalAlpha *= al; rline(c, rectPts(x, y, w, h, r), { w: 2.6, color, close: true, p, t, seed, dash: [14, 10], amp: .8 });
  if (label) dsLabel(c, label, x + 30, y, { size: labelSize, align: 'left', k: sm(.3, .8, p, easeOutBack), seed: seed + 1 }); c.restore(); }
// dsBrace：手画横向花括号（尖朝 dir：1 下、-1 上）
function dsBrace(c, x0, x1, y, o = {}) { const { dir = 1, color = P.ink2, w = 3, p = 1, t = null, seed = 7400, d = 18, al = 1 } = o, m = (x0 + x1) / 2, s = dir;
  rline(c, [[x0, y], [x0 + 12, y + s * d * .7], [m - 16, y + s * d * .7], [m, y + s * d * 1.5], [m + 16, y + s * d * .7], [x1 - 12, y + s * d * .7], [x1, y]], { w, color, p, t, seed, smooth: true, al }); }

// ===================== 等宽字和代码 =====================
function dsMono(c, text, x, y, o = {}) {
  const { size = 22, color = P.ink, align = 'left', p = 1, al = 1, weight = 400 } = o; if (al <= 0) return;
  const s = String(text), n = p >= 1 ? s.length : Math.floor(s.length * clamp(p, 0, 1) + 1e-6); if (!n) return;
  c.save(); c.globalAlpha *= al; c.font = `${weight} ${size}px ${DS_MONO}`; c.textRendering = 'optimizeSpeed'; c.textBaseline = 'alphabetic'; c.fillStyle = color;   // optimizeSpeed 关掉连字（=> 不变成 ⇒）
  const full = c.measureText(s).width, x0 = align === 'center' ? x - full / 2 : align === 'right' ? x - full : x; c.textAlign = 'left'; c.fillText(s.slice(0, n), x0, y); c.restore(); }
function dsMonoW(c, text, size = 22) { c.save(); c.font = `400 ${size}px ${DS_MONO}`; c.textRendering = 'optimizeSpeed'; const w = c.measureText(String(text)).width; c.restore(); return w; }
// dsCode：多行代码。关键字加粗，注释和字符串用灰，o.mark 里的词用强调色，o.hl 的行底下铺一层强调色淡底，o.strike 的行被手画线划掉
const DS_KW = new Set('const let var return if else await async function export default import from new class extends this of in for while true false null undefined static'.split(' '));
function dsTok(line) {
  const out = [], re = /(\/\/.*$|#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$@][\w$/-]*)|(\s+)|([^\sA-Za-z_$@\d'"`#]+)/g;
  let m; while ((m = re.exec(line))) {
    if (m[1]) out.push([m[1], P.g2, 400]); else if (m[2]) out.push([m[2], P.g3, 400]); else if (m[3]) out.push([m[3], P.g3, 400]);
    else if (m[4]) out.push([m[4], P.ink, DS_KW.has(m[4]) ? 700 : 400]); else out.push([m[5] || m[6], m[5] ? P.ink : P.g3, 400]);
  }
  return out;
}
function dsCode(c, src, x, y, o = {}) {
  const lines = Array.isArray(src) ? src : String(src).split('\n'), { size = 22, lh = size * 1.55, p = 1, al = 1, hl = {}, mark = [], accent = P.blue, strike = {}, dim = [] } = o;
  const total = lines.reduce((a, l) => a + l.length + 1, 0); let budget = p >= 1 ? Infinity : Math.floor(total * clamp(p, 0, 1));
  c.save(); c.globalAlpha *= al; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.textRendering = 'optimizeSpeed'; c.font = `400 ${size}px ${DS_MONO}`; const cw = c.measureText('M').width;
  lines.forEach((ln, i) => { const yy = y + i * lh;
    if (hl[i] > 0) { c.save(); c.globalAlpha *= .2 * clamp(hl[i], 0, 1); c.fillStyle = accent; c.fillRect(x - 10, yy - size * 1.02, ln.length * cw + 20, lh * .95); c.restore(); }
    if (budget > 0) { let xx = x; c.save(); if (dim.includes(i)) c.globalAlpha *= .35;
      for (const [s, col, wt] of dsTok(ln)) { if (budget <= 0) break; const tt = budget >= s.length ? s : s.slice(0, budget); budget -= tt.length; c.font = `${wt} ${size}px ${DS_MONO}`; c.fillStyle = mark.includes(s) ? accent : col; c.fillText(tt, xx, yy); xx += c.measureText(tt).width; }
      c.restore(); budget -= 1; }
    if (strike[i] > 0) { const ind = (ln.length - ln.trimStart().length) * cw; rline(c, [[x + ind - 4, yy - size * .3], [x + ln.length * cw + 6, yy - size * .34]], { w: 3, color: P.red, p: strike[i], seed: 7500 + i, amp: .7 }); } });
  c.restore(); return { lh, cw };
}
// dsCodeSlip：写着代码的纸片（宽 w，高按行数算）。o = { title 纸片顶上的文件名, size, k, seed, … 其余同 dsCode }
function dsCodeSlip(c, x, y, w, lines, o = {}) { const { size = 22, lh = size * 1.55, k = 1, seed = 7600, title = null, al = 1 } = o, n = lines.length, top = title ? 46 : 26, h = top + n * lh + 18;
  if (k <= .001 || al <= 0) return h;
  pop(c, x + w / 2, y + h / 2, k, () => { c.save(); c.globalAlpha *= al; dsSlip(c, x, y, w, h, { color: DSC.slip, seed, r: 8 });
    if (title) { dsMono(c, title, x + 22, y + 32, { size: 16, color: P.g2 }); rline(c, [[x + 18, y + 42], [x + w - 18, y + 42]], { w: 1.2, color: P.g1, seed: seed + 1, amp: .4 }); }
    dsCode(c, lines, x + 24, y + top + size, { ...o, size, lh }); c.restore(); });
  return h; }

// ===================== 小物 =====================
// dsDot：一个实心小圆点
function dsDot(c, x, y, r, color = P.ink, o = {}) { const al = o.al ?? 1; if (al <= 0 || r <= 0) return; c.save(); c.globalAlpha *= al; c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); }
// dsToken：一枚走动的小纸圆片（流程里「正在跑」的那一步）
function dsToken(c, x, y, r = 14, color = P.moon, o = {}) { if ((o.al ?? 1) <= 0) return; c.save(); c.globalAlpha *= o.al ?? 1; cutPaper(c, circPts(x, y, r, 20), color, { seed: o.seed ?? 7700, step: 6, blur: 3, sx: 1, sy: 2, grain: .05 }); c.restore(); }
// dsSeal：朱印（方形，纸色字），k 0..1 盖下去
function dsSeal(c, x, y, text, k, o = {}) { const { s = 86, seed = 7800 } = o; if (k <= 0) return;
  const z = k < .45 ? lerp(1.8, .95, easeIn(k / .45)) : lerp(.95, 1, easeOutBack((k - .45) / .55));
  c.save(); c.translate(x, y); c.rotate(-.08); c.scale(z, z); c.globalAlpha *= clamp(k * 3, 0, 1);
  const path = cutPaper(c, rectPts(-s / 2, -s / 2, s, s, 8), '#b0473a', { seed, step: 8, blur: 2, sx: 0, sy: 1, grain: .22 });
  c.strokeStyle = alpha('#f3e9da', .85); c.lineWidth = 2.5; c.strokeRect(-s / 2 + 7, -s / 2 + 7, s - 14, s - 14);
  const chs = [...String(text)], fs = chs.length > 2 ? s * .32 : s * .4;
  if (chs.length <= 2) zh(c, chs.join(''), 0, fs * .36, { size: fs, align: 'center', color: '#f3e9da' });
  else { zh(c, chs.slice(0, 2).join(''), 0, -fs * .2, { size: fs, align: 'center', color: '#f3e9da' }); zh(c, chs.slice(2).join(''), 0, fs * .95, { size: fs, align: 'center', color: '#f3e9da' }); }
  c.restore(); }

// ===================== 人物 =====================
// dsCast：八云蓝站在右边讲（o.ranPose 可以是 tau => 姿势；o.ran 可覆盖站位，o.ranAl 透明度）；
// 帕秋莉在她自己的台词（前 0.4 秒到后 0.9 秒，o.pchWins 可加）从左边走进来、说完退出去。o.pchPose 同 ranPose
function dsCast(c, tau, L, LINES, o = {}) {
  const pw = LINES.filter(l => (l[3] || {}).who === 'patchouli').map(l => [l[0] - .4, l[1] + .9]).concat(o.pchWins || []), pv = dsWin(tau, pw, .45, .5);
  if (pv > 0 && o.pchPeek) { const q = o.pchPeek;   // 探头：从 q.y 那条纸边下面升上来，只露帽子、脸和两只手
    c.save(); c.beginPath(); c.rect(0, 0, W, q.y + 1); c.clip();
    drawPatchouli(c, { x: q.x, y: q.y + 2 + (1 - easeOut(pv)) * 230, h: q.h || 460, pose: 'peek', mood: moodOf(L, 'patchouli', 'normal'), mouth: mouthOf(L, 'patchouli'), blink: blinkAt(tau), t: tau }); c.restore(); }
  else if (pv > 0) { const pose = typeof o.pchPose === 'function' ? o.pchPose(tau) : o.pchPose || 'stand';
    drawPatchouli(c, { ...DS.pch, ...(o.pch || {}), x: (o.pch?.x ?? DS.pch.x) - (1 - easeOut(pv)) * 380, pose, mood: moodOf(L, 'patchouli', 'normal'), mouth: mouthOf(L, 'patchouli'), blink: blinkAt(tau), t: tau }); }
  if (o.noRan) return;
  const rp = typeof o.ranPose === 'function' ? o.ranPose(tau) : o.ranPose || 'stand';
  c.save(); c.globalAlpha *= o.ranAl ?? 1;
  drawRan(c, { ...DS.ran, ...(o.ran || {}), pose: rp, mood: moodOf(L, 'ran', 'normal'), mouth: mouthOf(L, 'ran'), blink: blinkAt(tau, 3), t: tau }); c.restore();
}

// ===================== 段间交接画面 =====================
// 只画「内容」（纸和人物由各段自己画），前一段最后 ≥0.4 秒和后一段最前 ≥0.4 秒都只画它。
// H2 循环 → 阶梯：页面中间一张写着 agent loop 的纸片（上面一个小循环箭头）
const DS_LOOPCARD = { x: 700, y: 430, w: 420, h: 190 };   // 和第 1 段末尾收成的那张纸片同一个位置
function dsLoopCard(c, x, y, w, h, o = {}) { const { k = 1, al = 1, seed = 7900, lift = 0, accent = P.blue } = o; if (k <= .001 || al <= 0) return;
  pop(c, x + w / 2, y + h / 2, k, () => { c.save(); c.globalAlpha *= al;
    dsSlip(c, x, y, w, h, { color: mix(DSC.slip, accent, .12), seed, lift }); c.translate(0, -lift * 8);   // 圈和字跟着纸抬
    const fs = Math.min(24, h * .23), cx = x + w / 2, cy = y + h * .36, r = h * .2;
    rline(c, Array.from({ length: 26 }, (_, i) => { const a = -Math.PI / 2 + .3 + i / 25 * (TAU - .9); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }), { w: 3, color: accent, seed: seed + 1, amp: .5 });
    const ea = -Math.PI / 2 + .3 + (TAU - .9), ex = cx + Math.cos(ea) * r, ey = cy + Math.sin(ea) * r, tg = ea + Math.PI / 2;
    rline(c, [[ex - Math.cos(tg - .5) * 12, ey - Math.sin(tg - .5) * 12], [ex, ey], [ex - Math.cos(tg + .5) * 12, ey - Math.sin(tg + .5) * 12]], { w: 3, color: accent, seed: seed + 2, amp: .4 });
    dsMono(c, 'agent loop', cx, y + h - Math.max(h * .14, 18), { size: fs, align: 'center', color: P.ink }); c.restore(); }); }
function dsHoLoopCard(c, o = {}) { const B = DS_LOOPCARD; dsLoopCard(c, B.x, B.y, B.w, B.h, o); }

// ===================== 第 2 段的主物件：三级纸台阶（第 3 段开头、第 6 段也用） =====================
// 侧面看的一段台阶，从左往右一级比一级高；每级正面写「做法 + 代表」，台阶上方两张纸条写「能改什么 / 需要的地基」。
const DS_STAIR = { xs: [380, 740, 1080, 1420], top: [690, 530, 370], base: 862,
  color: ['#efe7d5', '#e7dcc6', '#ddd0b6'],
  rows: [['声明式扩展', 'skill · MCP · hook', '能改：只能喂材料', '地基：读文件、起子进程'],
         ['进程内中间件', 'pi extension · CC mod', '能改：拦截预留的事件', '地基：进程内事件管线'],
         ['可组合内核', 'DSH on Cordis', '能改：连 loop 都能换', '地基：可逆副作用 + 依赖响应']] };
// dsStairs：o = { up: [三级立起 0..1], lit: [三级亮度 0..1]（暗 = 还没讲到）, notes: [三级的纸条 0..1], hi 第三级高亮 0..1, accent, al, t }
function dsStairs(c, o = {}) {
  const S = DS_STAIR, { up = [1, 1, 1], lit = [1, 1, 1], notes = [0, 0, 0], hi = 0, accent = P.purple, al = 1, t = null } = o; if (al <= 0) return;
  c.save(); c.globalAlpha *= al;
  for (let i = 0; i < 3; i++) { const k = clamp(up[i], 0, 1.2); if (k <= .001) continue; const x0 = S.xs[i], x1 = S.xs[i + 1], y0 = S.top[i], [name, ex] = S.rows[i], lt = clamp(lit[i], 0, 1), h2 = i === 2 ? hi : 0;
    popup(c, S.base, k, () => { cutPaper(c, rectPts(x0, y0, x1 - x0, S.base - y0, 4), mix(mix(S.color[i], P.g1, .45 * (1 - lt)), accent, .14 * h2), { seed: 7400 + i, step: 26, blur: 6, sx: 3, sy: 4 });
      // 台阶面上的一道亮边（踏面）
      rline(c, [[x0 + 6, y0 + 7], [x1 - 6, y0 + 7]], { w: 2, color: alpha('#ffffff', .5), seed: 7410 + i, amp: .4 });
      zh(c, name, (x0 + x1) / 2, y0 + 56, { size: 34, align: 'center', color: mix(P.g2, mix(P.ink, accent, .6 * h2), lt) });
      dsMono(c, ex, (x0 + x1) / 2, y0 + 90, { size: 17, align: 'center', color: mix(P.g2, P.ink2, lt) }); }, [x0, x1]);
    if (notes[i] > 0) { const nx = (x0 + x1) / 2, ny = i === 2 ? 168 : y0 - 128;   // 第三级的纸条放高一点，给站在上面的 agent loop 纸片让位
      dsLabel(c, S.rows[i][2], nx, ny, { size: 24, k: easeOutBack(clamp(notes[i], 0, 1)), seed: 7420 + i, rot: -.02 });
      dsLabel(c, S.rows[i][3], nx, ny + 54, { size: 22, k: easeOutBack(clamp(notes[i] * 1.4 - .4, 0, 1)), seed: 7425 + i, rot: .015, ink: i === 2 ? mix(P.ink, accent, hi) : P.ink2 }); }
  }
  c.restore();
}
// H3 阶梯 → Cordis：三级全立起、全亮、纸条全出，第三级高亮，agent loop 纸片站在第三级上
const DS_STAIRCARD = { x: 1140, y: 262, w: 220, h: 104 };
function dsHoStairs(c, o = {}) { dsStairs(c, { up: [1, 1, 1], lit: [1, 1, 1], notes: [1, 1, 1], hi: 1, ...o });
  const B = DS_STAIRCARD; dsLoopCard(c, B.x, B.y, B.w, B.h, { al: o.al ?? 1, accent: P.blue }); }

// ===================== H4 Cordis → 自进化：底部一块淡绿的地基板 =====================
const DS_SLAB = { x: 420, y: 716, w: 960, h: 120 };
function dsCordisSlab(c, x, y, w, h, o = {}) { const { k = 1, al = 1, seed = 7500, sub = '可逆副作用 · 依赖响应' } = o; if (k <= .001 || al <= 0) return;
  pop(c, x + w / 2, y + h / 2, k, () => { c.save(); c.globalAlpha *= al;
    cutPaper(c, rectPts(x, y, w, h, 10), mix(DSC.slip, P.green, .22), { seed, step: 24, blur: 6, sy: 5 });
    zh(c, 'Cordis', x + w / 2, y + h / 2 + (sub ? 4 : 16), { size: 46, align: 'center', color: mix(P.ink, P.green, .5) });
    if (sub) zh(c, sub, x + w / 2, y + h / 2 + 40, { size: 24, align: 'center', color: P.ink2 }); c.restore(); }); }
function dsHoSlab(c, o = {}) { const S = DS_SLAB; dsCordisSlab(c, S.x, S.y, S.w, S.h, o); }

// ===================== H5 自进化 → 同题三解：一排三张窗口的标题条 =====================
const DS_TRIO = { names: ['Claude Code', 'pi', 'DSH'], xs: [100, 556, 1012], y: 330, w: 432, h: 64 };
// dsWindow：一张纸做的窗口：上面一条深一点的标题条（三个小圆点 + 等宽标题），下面是正文区。返回正文区 { x, y, w, h }。o = { k, seed, al, accent 标题条染色 }
function dsWindow(c, x, y, w, h, title, o = {}) { const { k = 1, seed = 7600, al = 1, accent = null, bar = 56 } = o, body = { x: x + 24, y: y + bar + 22, w: w - 48, h: h - bar - 40 }; if (k <= .001 || al <= 0) return body;
  pop(c, x + w / 2, y + h / 2, k, () => { c.save(); c.globalAlpha *= al;
    const path = cutPaper(c, rectPts(x, y, w, h, 10), DSC.slip, { seed, step: 26, blur: 6 });
    c.save(); c.clip(path); c.fillStyle = accent ? mix(DSC.shade, accent, .25) : DSC.shade; c.fillRect(x, y, w, bar); c.restore();
    [0, 1, 2].forEach(i => { c.fillStyle = alpha(P.ink2, .35); c.beginPath(); c.arc(x + 24 + i * 20, y + bar / 2, 6, 0, TAU); c.fill(); });
    dsMono(c, title, x + w / 2, y + bar / 2 + 8, { size: 22, align: 'center', color: P.ink }); c.restore(); });
  return body; }
function dsHoTrio(c, o = {}) { const T = DS_TRIO; T.names.forEach((n, i) => dsWindow(c, T.xs[i], T.y, T.w, T.h, n, { seed: 7610 + i, al: o.al ?? 1, bar: T.h })); }

// ===================== H6 同题三解 → 结尾：插件树里 agent-loop 那一行 =====================
const DS_ROW = { x: 430, y: 410, w: 660, h: 150 };
function dsHoRow(c, o = {}) { const R = DS_ROW, al = o.al ?? 1; if (al <= 0) return;
  c.save(); c.globalAlpha *= al; dsSlip(c, R.x, R.y, R.w, R.h, { color: DSC.slip, seed: 7700, r: 8 });
  dsCode(c, ['- id: agent-loop', "  name: '@deepseek-ai/dsh-agent-loop'", '  config: { agents: [] }'], R.x + 30, R.y + 46, { size: 22, lh: 36, hl: { 0: 1, 1: 1 }, accent: P.blue }); c.restore(); }

// ===================== 小物（第 3、4、5 段） =====================
// dsTalisman：一张符（竖条黄纸，朱色字竖排，边上一道朱线）——插件做的一次注册就贴一张。o = { k 贴上 0..1, peel 揭掉 0..1, rot, seed, w, h, al }
function dsTalisman(c, x, y, text, o = {}) { const { k = 1, peel = 0, rot = 0, seed = 7800, w = 50, h = 150, al = 1 } = o; if (k <= .001 || peel >= 1 || al <= 0) return;
  c.save(); c.globalAlpha *= al * (1 - sm(.55, 1, peel)); c.translate(x + peel * 60, y - peel * 120 - peel * peel * 40); c.rotate(rot + peel * .9); c.scale(lerp(.6, 1, easeOutBack(clamp(k, 0, 1))), lerp(.6, 1, easeOutBack(clamp(k, 0, 1))));
  cutPaper(c, rectPts(-w / 2, -h / 2, w, h, 2), '#eedfae', { seed, step: 14, blur: 3 + peel * 10, sx: 1 + peel * 6, sy: 2 + peel * 8, grain: .12 });
  rline(c, rectPts(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10), { w: 1.6, color: alpha(P.red, .8), close: true, seed: seed + 1, amp: .5 });
  const chs = [...String(text)], fs = Math.min(w * .62, (h - 24) / Math.max(1, chs.length) * .95);
  chs.forEach((ch, i) => zh(c, ch, 0, -h / 2 + 18 + fs * (i + .86), { size: fs, align: 'center', color: P.red }));
  c.restore(); }
// dsLock：剪纸挂锁。o = { open 0..1 锁梁抬起, k, al, seed }
function dsLock(c, x, y, s = 70, o = {}) { const { open = 0, k = 1, al = 1, seed = 7900 } = o; if (k <= .001 || al <= 0) return;
  pop(c, x, y, k, () => { c.save(); c.globalAlpha *= al; const lift = open * s * .25;
    rline(c, Array.from({ length: 21 }, (_, i) => { const a = Math.PI + i / 20 * Math.PI; return [x + Math.cos(a) * s * .26, y - s * .1 - lift + Math.sin(a) * s * .3]; }).concat([[x + s * .26, y - s * .1 - lift + (open > 0 ? 0 : s * .12)]]), { w: s * .09, color: P.g3, seed, amp: .3 });
    cutPaper(c, rectPts(x - s * .4, y - s * .12, s * .8, s * .62, 6), P.gold, { seed: seed + 1, step: 10, blur: 3 });
    c.fillStyle = P.ink2; c.beginPath(); c.arc(x, y + s * .12, s * .07, 0, TAU); c.fill(); c.fillRect(x - s * .025, y + s * .12, s * .05, s * .14); c.restore(); }); }

// ===================== 开场、结尾：魔导书开合 =====================
// dsBook：u = 0 摊开（spread），u = 1 合上（封面盖在右半边）；中间封面绕书脊翻。o = { cover: [大字, 小字], small 封面小字 }
function dsBook(c, tau, u, o = {}) {
  const { cover = ['帕秋莉讲座', '第七集'] } = o;
  if (u <= 0) { spread(c, tau); return; }
  desk(c);
  c.save(); c.beginPath(); c.rect(CX - 14, 0, W, H); c.clip(); spread(c, tau); c.restore();   // 右页先画出来，封面盖在上面
  const R = BOOK.R, w = R.w + 34, a = (1 - clamp(u, 0, 1)) * Math.PI, cw = w * Math.cos(a), lift = Math.sin(a) * 40;
  if (cw > 2) { c.save(); c.beginPath(); c.moveTo(CX, 0); c.lineTo(CX + cw, -lift); c.lineTo(CX + cw, H + lift); c.lineTo(CX, H); c.closePath(); c.clip();
    c.translate(CX, 0); c.scale(cw / w, 1); c.translate(-CX, 0); grimoireCover(c, CX - 2, w, { clasp: null });
    zh(c, cover[0], CX + w / 2, 470, { size: cover[0].length > 6 ? 54 : 64, align: 'center', color: GRIMOIRE.gold });
    if (cover[1]) zh(c, cover[1], CX + w / 2, 556, { size: 36, align: 'center', color: alpha(GRIMOIRE.gold, .85) });
    if (o.small) zh(c, o.small, CX + w / 2, 640, { size: 26, align: 'center', color: alpha(GRIMOIRE.gold, .7) }); c.restore(); }
  else if (cw < -2) { const pts = [[CX, BOOK.y + 18], [CX + cw, BOOK.y + 18 - lift], [CX + cw, BOOK.y + BOOK.h - 18 + lift], [CX, BOOK.y + BOOK.h - 18]];
    c.save(); c.shadowColor = 'rgba(30,20,10,.3)'; c.shadowBlur = 24; c.shadowOffsetY = 8; c.fillStyle = mix(BOOK.page2, BOOK.page, sm(.6, 1, 1 - u)); c.fill(polyPath(pts)); c.restore(); }
}
