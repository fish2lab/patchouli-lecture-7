'use strict';
// 第 7 集共用：站位、墨板（3Blue1Brown 式的深色画板）、配色和画具（主会话维护；各段只调用，不改）。
// 顶层名字一律带 DS / ds 前缀（所有脚本共用一个全局作用域）。
//
// 这一集的画面 = 魔导书舞台 + 一块「墨板」：书页还是纸和剪纸人偶，讲道理的图画在一块深色墨板上，
// 线条干净、不抖（和书页上手抖的墨线区分开），颜色按 3Blue1Brown 的习惯分工：
//   DC.yellow 模型 / 当前焦点   DC.blue harness、事件、插件   DC.teal 撤销、恢复   DC.red 出错、卡住
//   DC.green 通过、验证器       DC.gold 人 / 用户              DC.purple 代码关键字
// 一种颜色在全片里只代表一件事：模型永远是黄的，harness 永远是蓝的。
//
//   DS.ran / DS.pch          两人的标准站位（蓝左、帕秋莉右，脚底 y=880，身高 500）
//   DS.slate                 两人之间的墨板 { x, y, w, h }；DS.wide 铺满跨页的墨板（两人缩到下角，见 DS.ranS / DS.pchS）
//   dsSeq(t0, items)         同 seq，默认说话人是八云蓝；帕秋莉的句子写 { who: 'patchouli' }
//   dsRan / dsPch            画两人（嘴型、表情、眨眼自动从台词取）
//   dsSlate(c, r, o)         画墨板，返回 r；dsClip(c, r, fn) 在墨板里裁剪着画
//   dsPath / dsArrow / dsBox / dsCircle / dsDot / dsBrace   干净的线和形状（p = 画出比例，3b1b 的 Create）
//   dsText / dsMono / dsCode / dsWindow                     中文字、等宽字、带高亮的代码块、终端窗口
//   dsMorph(A, B, u)         两个闭合轮廓之间插值（3b1b 的 Transform）
//   dsBump(tau, t0, d)       0→1→0 的一下（3b1b 的 Indicate）

const EP_HOST = 'ran';   // 主讲人：字幕里不加名字（film.js 用）
const DS = {
  ran: { x: 292, y: 880, h: 500 },                 // 八云蓝：左页，朝右（连尾巴宽约 0.8h）
  pch: { x: 1632, y: 880, h: 500, facing: -1 },    // 帕秋莉：右页，朝左
  slate: { x: 532, y: 96, w: 856, h: 776 },        // 两人之间的墨板（两人的站位区之外）
  wide: { x: 92, y: 70, w: 1736, h: 836 },         // 铺满跨页的墨板
  ranS: { x: 196, y: 896, h: 300 },                // 墨板铺满时：两人缩小站在下角（3b1b 的 π 生物的位置）
  pchS: { x: 1724, y: 896, h: 300, facing: -1 },
};
const DC = {
  bg: '#18161e', bg2: '#211e29', edge: '#3a3544', grid: 'rgba(236,230,243,.055)',
  ink: '#ece6f3', dim: '#a39cb1', faint: '#615a6d',
  yellow: '#f4d345', blue: '#58c4dd', teal: '#5cd0b3', red: '#fc6255', green: '#83c167', gold: '#f0ac5f', purple: '#b18fe0', pink: '#e98fb3',
  term: '#0f0e13', termBar: '#2a2633',
};
const DS_MONO = '"JetBrains Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace';

// ===================== 台词和人物 =====================
// dsSeq：同 core.js 的 seq，只是默认 who 是八云蓝；时长按「配音 + 0.35 秒」和「读得完字幕」取大，
// 读字幕按汉字 0.15 秒、一个英文词 0.3 秒算（seq 默认按字符数算，一个 harness 会被当成 7 个字，句子拖得太长）
function dsRead(text) { const s = String(text), latin = (s.match(/[A-Za-z][\w.-]*/g) || []).length, cjk = [...s.replace(/[A-Za-z][\w.-]*/g, '')].filter(ch => /[㐀-鿿]/.test(ch)).length; return cjk * .15 + latin * .3 + .5; }
function dsSeq(t0, items) { return seq(t0, items.map(it => { const [text, o = {}] = Array.isArray(it) ? it : [it], v = voiceOf(text);
  return [text, { who: 'ran', ...(o.dur || !v ? {} : { dur: Math.max(v.d + .35, dsRead(text)) }), ...o }]; })); }
function dsRan(c, tau, L, o = {}) { return drawRan(c, { ...DS.ran, pose: 'stand', mood: moodOf(L, 'ran', 'normal'), mouth: mouthOf(L, 'ran'), blink: blinkAt(tau, 3), t: tau, ...o }); }
function dsPch(c, tau, L, o = {}) { return drawPatchouli(c, { ...DS.pch, pose: 'stand', mood: moodOf(L, 'patchouli', 'normal'), mouth: mouthOf(L, 'patchouli'), blink: blinkAt(tau), t: tau, ...o }); }

// ===================== 时间 =====================
// dsBump：t0 起 d 秒内 0→1→0（强调一下）
const dsBump = (tau, t0, d = .6) => { const u = (tau - t0) / d; return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI); };
// dsK：t0 起 d 秒 0→1（默认 easeIO）
const dsK = (tau, t0, d = .5, e = easeIO) => sm(t0, t0 + d, tau, e);

// ===================== 几何 =====================
function dsLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
// dsTrim：折线按弧长取 [a, b] 这一段（0..1）
function dsTrim(pts, a, b = null) {
  if (b === null) { b = a; a = 0; }
  if (b <= a || pts.length < 2) return [];
  const L = dsLen(pts), s0 = L * clamp(a, 0, 1), s1 = L * clamp(b, 0, 1), out = []; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i], d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1e-6, at = u => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
    if (acc + d >= s0 && acc <= s1) {
      if (!out.length) out.push(at(clamp((s0 - acc) / d, 0, 1)));
      out.push(at(clamp((s1 - acc) / d, 0, 1)));
    }
    acc += d; if (acc > s1) break;
  }
  return out;
}
// dsAt：折线上弧长比例 u 处的点和切向角 [x, y, ang]
function dsAt(pts, u) {
  const L = dsLen(pts), s = L * clamp(u, 0, 1); let acc = 0;
  for (let i = 1; i < pts.length; i++) { const p = pts[i - 1], q = pts[i], d = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (acc + d >= s || i === pts.length - 1) { const v = d ? clamp((s - acc) / d, 0, 1) : 0; return [lerp(p[0], q[0], v), lerp(p[1], q[1], v), Math.atan2(q[1] - p[1], q[0] - p[0])]; } acc += d; }
  return [pts[0][0], pts[0][1], 0];
}
// dsRound：圆角矩形轮廓（闭合，起点在左上角圆弧之后，顺时针）
function dsRound(x, y, w, h, r = 12) { r = Math.min(r, w / 2, h / 2); const p = [], arc = (cx, cy, a0) => { for (let k = 0; k <= 6; k++) { const a = a0 + k / 6 * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI); return p; }
// dsResample：闭合轮廓按弧长等分成 n 个点
function dsResample(pts, n = 96) { const q = [...pts, pts[0]], L = dsLen(q), out = []; for (let k = 0; k < n; k++) { const [x, y] = dsAt(q, k / n); out.push([x, y]); } return out; }
// dsMorph：两个闭合轮廓之间插值（u = 0 是 A，1 是 B）。起点都对齐到最上面那个点附近，转起来不打结
function dsMorph(A, B, u, n = 96) {
  const a = dsResample(A, n), b = dsResample(B, n), top = q => q.reduce((m, p, i) => p[1] - p[0] * .001 < q[m][1] - q[m][0] * .001 ? i : m, 0), ia = top(a), ib = top(b);
  return a.map((_, k) => { const p = a[(k + ia) % n], q = b[(k + ib) % n]; return [lerp(p[0], q[0], u), lerp(p[1], q[1], u)]; });
}
function dsPoly(pts, close = false) { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); if (close) p.closePath(); return p; }

// ===================== 干净的线和形状（墨板上用；书页上照旧用 kit 的手抖线） =====================
// dsPath：折线。o = { w, color, p 画出比例（或 [a, b] 一段）, al, close, dash, glow 光晕强度 0..1, cap }
function dsPath(c, pts, o = {}) {
  const { w = 4, color = DC.ink, p = 1, al = 1, close = false, dash = null, glow = 0, cap = 'round' } = o;
  if (pts.length < 2 || al <= 0) return;
  let q = close ? [...pts, pts[0]] : pts;
  if (Array.isArray(p)) q = dsTrim(q, p[0], p[1]); else if (p < 1) { if (p <= 0) return; q = dsTrim(q, p); }
  if (q.length < 2) return;
  const path = dsPoly(q, close && !Array.isArray(p) && p >= 1);
  c.save(); c.globalAlpha *= al; c.lineCap = cap; c.lineJoin = 'round'; c.strokeStyle = color; if (dash) c.setLineDash(dash);
  if (glow > 0) { c.globalAlpha *= .14 * glow; c.lineWidth = w * 4.2; c.stroke(path); c.globalAlpha /= .14 * glow; c.globalAlpha *= .22 * glow; c.lineWidth = w * 2.2; c.stroke(path); c.globalAlpha /= .22 * glow; }
  c.lineWidth = w; c.stroke(path); c.restore();
}
// dsCurve：a → b 的二次曲线点列（bend 为法向弯曲量）
function dsCurve(a, b, bend = 0, n = 24) { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, cx = mx - dy / L * bend, cy = my + dx / L * bend, out = [];
  for (let i = 0; i <= n; i++) { const u = i / n; out.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * cx + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * cy + u * u * b[1]]); } return out; }
// dsArrow：实心箭头（3b1b 的 Arrow）。o = { w, color, p, bend, head, al, glow, pts（自给路径） }
function dsArrow(c, a, b, o = {}) {
  const { w = 4, color = DC.ink, p = 1, bend = 0, head = 18, al = 1, glow = 0, pts = null } = o; if (p <= 0 || al <= 0) return;
  const full = pts || dsCurve(a, b, bend), L = dsLen(full), hp = Math.min(.9, head * .8 / Math.max(1, L)), q = dsTrim(full, Math.max(0, p - hp * p));
  dsPath(c, q.length > 1 ? q : full.slice(0, 2), { w, color, al, glow });
  const [x, y, ang] = dsAt(full, p), hs = head * clamp(p * 3, 0, 1);
  c.save(); c.globalAlpha *= al; c.fillStyle = color; c.beginPath(); c.moveTo(x + Math.cos(ang) * hs * .2, y + Math.sin(ang) * hs * .2);
  c.lineTo(x - Math.cos(ang - .42) * hs, y - Math.sin(ang - .42) * hs); c.lineTo(x - Math.cos(ang + .42) * hs, y - Math.sin(ang + .42) * hs); c.closePath(); c.fill(); c.restore();
}
// dsBox：圆角框（描边 + 同色半透明填充）。o = { color, w, r, fa 填充透明度, fill 填充色（默认同描边色）, p 画出（0..1：先描边、后填色）, al, glow, dash }
function dsBox(c, x, y, w, h, o = {}) {
  const { color = DC.blue, w: lw = 3.5, r = 14, fa = .16, fill = null, p = 1, al = 1, glow = 0, dash = null } = o; if (p <= 0 || al <= 0) return;
  const pts = dsRound(x, y, w, h, r), fk = sm(.55, 1, p);
  if (fk > 0 && fa > 0) { c.save(); c.globalAlpha *= al * fk * (fill ? 1 : fa); c.fillStyle = fill || color; c.fill(dsPoly(pts, true)); c.restore(); }
  dsPath(c, pts, { w: lw, color, p: clamp(p / .7, 0, 1), close: true, al, glow, dash });
}
function dsCirclePts(x, y, r, n = 64, a0 = -Math.PI / 2) { const o = []; for (let k = 0; k < n; k++) { const a = a0 + k / n * TAU; o.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return o; }
// dsCircle：圆（同 dsBox 的填充规则）
function dsCircle(c, x, y, r, o = {}) {
  const { color = DC.blue, w = 3.5, fa = .16, fill = null, p = 1, al = 1, glow = 0, dash = null } = o; if (p <= 0 || al <= 0 || r <= .5) return;
  const fk = sm(.55, 1, p);
  if (fk > 0 && fa > 0) { c.save(); c.globalAlpha *= al * fk * (fill ? 1 : fa); c.fillStyle = fill || color; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); }
  dsPath(c, dsCirclePts(x, y, r), { w, color, p: clamp(p / .7, 0, 1), close: true, al, glow, dash });
}
// dsDot：带光晕的点（流动的事件、信号）
function dsDot(c, x, y, r, color = DC.yellow, o = {}) { const { al = 1, glow = 1 } = o; if (al <= 0 || r <= 0) return;
  c.save(); c.globalAlpha *= al; c.fillStyle = color;
  if (glow > 0) { c.globalAlpha *= .12 * glow; c.beginPath(); c.arc(x, y, r * 3, 0, TAU); c.fill(); c.globalAlpha /= .12 * glow; c.globalAlpha *= .25 * glow; c.beginPath(); c.arc(x, y, r * 1.8, 0, TAU); c.fill(); c.globalAlpha /= .25 * glow; }
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); }
// dsBrace：横向花括号（x0..x1，开口朝上 dir=1 或朝下 dir=-1），p 画出比例
function dsBrace(c, x0, x1, y, o = {}) { const { dir = 1, color = DC.ink, w = 3, p = 1, al = 1, d = 18 } = o, m = (x0 + x1) / 2, s = dir;
  const pts = spline([[x0, y], [x0 + 10, y + s * d * .7], [m - 14, y + s * d * .75], [m, y + s * d * 1.5], [m + 14, y + s * d * .75], [x1 - 10, y + s * d * .7], [x1, y]], 3);
  dsPath(c, pts, { w, color, p: [.5 - p / 2, .5 + p / 2], al }); }

// ===================== 字 =====================
// dsText：墨板上的中文（霞鹜文楷，默认浅色）。o 同 kit 的 zh（size、color、align、p、al、base、weight）
function dsText(c, text, x, y, o = {}) { zh(c, text, x, y, { color: DC.ink, ...o }); }
// dsMono：等宽字（英文、代码、事件名）。o = { size, color, align, p 逐字写出, al, weight, base }
function dsMono(c, text, x, y, o = {}) {
  const { size = 30, color = DC.ink, align = 'left', p = 1, al = 1, weight = 400, base = 'alphabetic' } = o; if (al <= 0) return;
  const s = String(text), n = p >= 1 ? s.length : Math.floor(s.length * clamp(p, 0, 1) + 1e-6); if (!n) return;
  c.save(); c.globalAlpha *= al; c.font = `${weight} ${size}px ${DS_MONO}`; c.textBaseline = base; c.fillStyle = color;
  const full = c.measureText(s).width, x0 = align === 'center' ? x - full / 2 : align === 'right' ? x - full : x;
  c.textAlign = 'left'; c.fillText(s.slice(0, n), x0, y); c.restore();
}
function dsMonoW(c, text, size = 30) { c.save(); c.font = `400 ${size}px ${DS_MONO}`; const w = c.measureText(String(text)).width; c.restore(); return w; }
// dsTok：一行代码切成 [文字, 颜色]（够用的 JS/TS 高亮：注释、字符串、关键字、数字、函数调用、属性）
const DS_KW = new Set('const let var return if else await async function export default import from new class extends this of in for while true false null undefined yield static readonly interface type as'.split(' '));
function dsTok(line) {
  const out = [], re = /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d'"`]+)/g;
  let m; while ((m = re.exec(line))) {
    if (m[1]) out.push([m[1], DC.faint]);
    else if (m[2]) out.push([m[2], DC.green]);
    else if (m[3]) out.push([m[3], DC.gold]);
    else if (m[4]) { const rest = line.slice(re.lastIndex); out.push([m[4], DS_KW.has(m[4]) ? DC.purple : /^\s*\(/.test(rest) ? DC.blue : /^\s*:/.test(rest) ? DC.teal : DC.ink]); }
    else out.push([m[5] || m[6], m[5] ? DC.ink : DC.dim]);
  }
  return out;
}
// dsCode：多行代码。src 是字符串（\n 分行）或行数组。o = { size, lh 行高, p 逐字打出比例, al, hl: { 行号: 颜色 } 高亮底, dim: 行号数组（压暗）, w 高亮底宽度 }
// 返回 { x, y, lh, rows }，方便在某一行旁边加箭头
function dsCode(c, src, x, y, o = {}) {
  const lines = Array.isArray(src) ? src : String(src).split('\n'), { size = 26, lh = size * 1.5, p = 1, al = 1, hl = {}, dim = [], w = null } = o;
  const total = lines.reduce((a, l) => a + l.length + 1, 0); let budget = p >= 1 ? Infinity : Math.floor(total * clamp(p, 0, 1));
  c.save(); c.globalAlpha *= al; c.font = `400 ${size}px ${DS_MONO}`; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  const cw = c.measureText('M').width;
  lines.forEach((ln, i) => {
    const yy = y + i * lh;
    if (hl[i]) { c.save(); c.globalAlpha *= .22; c.fillStyle = hl[i]; c.fillRect(x - 12, yy - size * 1.02, w || (ln.length * cw + 24), lh * .98); c.restore();
      c.save(); c.fillStyle = hl[i]; c.fillRect(x - 12, yy - size * 1.02, 4, lh * .98); c.restore(); }
    if (budget <= 0) return;
    let xx = x; c.save(); if (dim.includes(i)) c.globalAlpha *= .35;
    for (const [s, col] of dsTok(ln)) { if (budget <= 0) break; const t = budget >= s.length ? s : s.slice(0, budget); budget -= t.length; c.fillStyle = col; c.fillText(t, xx, yy); xx += c.measureText(t).width; }
    c.restore(); budget -= 1;
  });
  c.restore(); return { x, y, lh, rows: lines.length, cw };
}
// dsWindow：终端 / 编辑器窗口（深色剪纸卡片 + 标题栏三个点），返回内容区 { x, y, w, h }。o = { title, k 出现 0..1, accent 标题栏强调色, al }
function dsWindow(c, x, y, w, h, o = {}) {
  const { title = '', k = 1, accent = null, al = 1, seed = 7101 } = o; if (k <= 0 || al <= 0) return { x: x + 24, y: y + 70, w: w - 48, h: h - 90 };
  c.save(); c.globalAlpha *= al;
  pop(c, x + w / 2, y + h / 2, lerp(.92, 1, k), () => { c.save(); c.globalAlpha *= k;
    cutPaper(c, dsRound(x, y, w, h, 14), DC.term, { seed, step: 40, blur: 12, sx: 0, sy: 6, grain: .05, edge: false });
    c.save(); c.clip(dsPoly(dsRound(x, y, w, h, 14), true)); c.fillStyle = DC.termBar; c.fillRect(x, y, w, 44); if (accent) { c.fillStyle = accent; c.fillRect(x, y + 41, w, 3); } c.restore();
    [DC.red, DC.yellow, DC.green].forEach((col, i) => { c.fillStyle = alpha(col, .85); c.beginPath(); c.arc(x + 26 + i * 22, y + 22, 7, 0, TAU); c.fill(); });
    if (title) dsMono(c, title, x + w / 2, y + 30, { size: 20, color: DC.dim, align: 'center' });
    c.restore(); });
  c.restore(); return { x: x + 24, y: y + 70, w: w - 48, h: h - 90 };
}

// ===================== 墨板 =====================
// dsSlate：一块深色墨板（剪纸卡片 + 极淡的点阵）。r = { x, y, w, h }；o = { k 出现 0..1（从中线展开）, grid, al }
function dsSlate(c, r, o = {}) {
  const { k = 1, grid = true, al = 1, seed = 7001 } = o; if (k <= 0 || al <= 0) return r;
  const cy = r.y + r.h / 2, hh = r.h * easeOut(clamp(k, 0, 1)), y = cy - hh / 2, pts = dsRound(r.x, y, r.w, hh, 18);
  c.save(); c.globalAlpha *= al;
  cutPaper(c, pts, DC.bg, { seed, step: 46, blur: 18, sx: 0, sy: 8, grain: .07, edge: false });
  if (grid && hh > 40) { c.save(); c.clip(dsPoly(pts, true)); c.fillStyle = DC.grid; for (let gx = r.x + 28; gx < r.x + r.w; gx += 44) for (let gy = r.y + 28; gy < r.y + r.h; gy += 44) if (gy > y && gy < y + hh) c.fillRect(gx - 1.2, gy - 1.2, 2.4, 2.4); c.restore(); }
  dsPath(c, pts, { w: 2, color: DC.edge, close: true });
  c.restore(); return r;
}
// dsLerpRect：两个矩形之间插值（墨板从中间那块长成铺满的那块）
const dsLerpRect = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u), h: lerp(a.h, b.h, u) });
function dsClip(c, r, fn) { c.save(); c.clip(dsPoly(dsRound(r.x, r.y, r.w, r.h, 18), true)); fn(); c.restore(); }
// dsTitle：墨板上方的小标题（3b1b 左上角的章节名），逐字写出
function dsTitle(c, text, r, tau, t0 = 0, o = {}) { const { t1 = 1e9, color = DC.dim, size = 30 } = o, k = Math.min(dsK(tau, t0, .4), 1 - dsK(tau, t1, .3)); if (k <= 0) return;
  dsText(c, text, r.x + 34, r.y + 52, { size, color, al: k, p: writeP(tau, t0, text, .05) }); }
