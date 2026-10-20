'use strict';
// 第 1 段 · 第一页 · 循环：agent = 模型 + harness（样板段）。
// 主物件是一张最普通的流程图：上面一个「模型」纸片，下面一个虚线框（harness），框里五个圆角纸片排成一圈：
//   拼提示词 → 请求模型 → 解析工具调用
//      ↑                      ↓
//   回填结果  ←————————  执行工具
// 先往框里丢 harness 管的五件事（散着的纸条），再把它们排成 DSH 的五站；一枚小纸圆片走一圈 = 一个 step，左边一列 = 一个 turn。
// 最后这一圈被四颗图钉钉死在纸上；说到「插件」时图钉弹掉，整圈收成一张「agent loop」纸片被拿起来（交给第 2 段）。
// 顶层名字带 L1 / l1 前缀。
const L1LINES = dsSeq(.8, [
  ['先对齐一下词。你说的 harness，到底指哪一块？', { who: 'patchouli' }],
  ['一句话：agent 等于模型，加上 harness。', { pause: .2, hold: 1.2 }],
  ['模型只做一件事：读进一段文字，吐出一段文字。', { pause: .2, hold: .5 }],
  ['其余的都归 harness：拼提示词、调用工具、管上下文、管权限、记会话日志。', { pause: .2, hold: .8 }],
  ['ReAct 那种「想一步、做一步」的循环呢？', { who: 'patchouli', mood: 'smug', pause: .3 }],
  ['那是骨架，不是全部。我们用 DSH 自己的说法，把这一圈拆开。', { pause: .2, hold: .5 }],
  ['拼提示词，请求模型，解析出工具调用，执行，再把结果填回去。', { pause: .2, hold: 1 }],
  ['转一圈叫一个 step：一次模型请求，加上它调用的工具。', { pause: .2, hold: 1.2 }],
  ['从领到一句话，到不再欠任何活，叫一个 turn。一个 turn 有零到多个 step。', { pause: .2, hold: 1.4 }],
  ['这一圈本身，是谁写死的？', { who: 'patchouli', mood: 'annoyed', pause: .3 }],
  ['大多数 harness 里，它是写死的。在 DSH 里，它也只是一个插件。', { mood: 'proud', pause: .2, hold: 3.2 }],
]);
const L1T = i => L1LINES[i][0], L1E = i => L1LINES[i][1], L1W = (i, w) => dsWordT(L1LINES[i], w);
const L1DUR = L1E(L1LINES.length - 1) + 1.4;
const L1AC = P.blue;   // 本页的强调色

// 流程图的位置：五站（顺时针），每站 [x, y, 标题, 事件名, 第 6 句里念到它的词]
const L1NW = 236, L1NH = 116;
const L1ST = [[470, 384, '拼提示词', 'system-prompt/assemble', '拼提示词'], [790, 384, '请求模型', 'agent/request', '请求模型'], [1110, 384, '解析工具调用', 'tool/call', '解析出工具调用'],
  [1110, 640, '执行工具', 'tools/execute', '执行'], [470, 640, '回填结果', 'tool/result', '填回去']];
const L1MODEL = [818, 168, 180, 100];                 // 模型纸片
const L1BOX = [430, 330, 960, 470];                   // harness 虚线框
const L1C = k => [L1ST[k][0] + L1NW / 2, L1ST[k][1] + L1NH / 2];   // 第 k 站的中心
// 第 3 句：harness 管的五件事，先散着丢进框里（之后飞到五站的位置变成节点）
const L1JOB = [['拼提示词', 560, 470, -.06], ['调用工具', 880, 560, .05], ['管上下文', 1180, 450, -.03], ['管权限', 720, 690, .07], ['记会话日志', 1080, 700, -.05]];

// 站与站之间的箭头（顺时针）：上排向右、右边向下、下排向左、左边向上
function l1Edge(k) { const a = L1ST[k], b = L1ST[(k + 1) % 5], [ax, ay] = L1C(k), [bx, by] = L1C((k + 1) % 5);
  if (k === 0 || k === 1) return [[a[0] + L1NW + 6, ay], [b[0] - 10, by]];
  if (k === 2) return [[ax, a[1] + L1NH + 6], [bx, b[1] - 10]];
  if (k === 3) return [[a[0] - 6, ay], [b[0] + L1NW + 10, by]];
  return [[ax, a[1] - 6], [bx, b[1] + L1NH + 10]]; }
// 小纸圆片走到哪了：返回 [x, y, 站号, 在走第几圈]。第 6 句按念到站名走，第 7 句再走一圈，第 8 句再走两圈
function l1Run(tau) {
  const K = [[L1T(6) - .2, 0]]; L1ST.forEach((s, k) => K.push([L1W(6, s[4]), k]));   // 圈数 u：整数 = 停在第 u%5 站
  K.push([L1E(6) - .8, 5], [L1T(7) + .1, 5], [L1W(7, 'step') - .2, 10], [L1T(8) + .2, 10], [L1W(8, '不再欠') - 1, 15], [L1W(8, '不再欠'), 20]);
  const u = key(tau, K, easeIO), k = Math.floor(u + 1e-6) % 5, f = u - Math.floor(u + 1e-6), at = j => [L1ST[j][0] + L1NW - 26, L1ST[j][1] + 4], [[ax, ay], [bx, by]] = [at(k), at((k + 1) % 5)];
  // 在站里停一会儿（f < .35），然后沿箭头走到下一站
  const g = clamp((f - .35) / .65, 0, 1); return [lerp(ax, bx, easeIO(g)), lerp(ay, by, easeIO(g)), k, Math.floor(u / 5 + 1e-6)];
}

function l1Draw(c, tau, L) {
  const t = tau;
  dsPage(c, tau, '第一页 · 循环');
  // ---- 第 1 句：模型 + harness ----
  const mK = dsPop(tau, L1W(1, '模型') - .15), boxP = dsK(tau, L1W(1, 'harness') - .2, .8, easeIO);
  const endK = dsK(tau, L1DUR - 1.4, .7, easeIO), nodeA = 1 - endK;
  // 公式（左上，手写）
  const fx = 110, fy = 238, fk = dsK(tau, L1W(1, 'agent') - .2, .3) * (1 - dsK(tau, L1T(9) - .4, .4));
  if (fk > 0) { const parts = [['agent = ', P.ink, L1W(1, 'agent')], ['模型', P.purple, L1W(1, '模型')], [' + ', P.ink, L1W(1, '加上')], ['harness', L1AC, L1W(1, 'harness')]]; let x = fx;
    parts.forEach(([s, col, t0]) => { zh(c, s, x, fy, { size: 46, color: col, al: fk * dsK(tau, t0 - .15, .25) }); x += zhWidth(c, s, 46); }); }
  // 模型纸片（淡紫纸）
  const req = dsBump(tau, L1W(6, '请求模型') - .1, 1.1) + dsBump(tau, L1W(7, '模型请求') - .1, .9);
  if (mK > 0) { const [x, y, w, h] = L1MODEL; dsNode(c, x, y, w, h, '模型', { size: 38, color: mix(DSC.slip, P.purple, .28), k: mK * nodeA, accent: P.purple, hi: clamp(req, 0, 1), seed: 7110 }); }
  // harness 虚线框
  if (boxP > 0) { const [x, y, w, h] = L1BOX; dsDashBox(c, x, y, w, h, { p: boxP, t, label: 'harness', labelSize: 30, al: nodeA, color: mix(P.g2, L1AC, .4) }); }
  // 模型和 harness 之间的两根箭头（请求、回复）
  const linkK = dsK(tau, L1W(1, 'harness') + .4, .5) * nodeA;
  if (linkK > 0) { const mx = L1MODEL[0] + L1MODEL[2] / 2, hot = clamp(req, 0, 1);
    dsArrow(c, [mx - 30, L1MODEL[1] + L1MODEL[3] + 6], [mx - 30, L1ST[1][1] - 8], { p: linkK, seed: 7121, t, color: mix(P.ink2, L1AC, hot) });
    dsArrow(c, [mx + 30, L1ST[1][1] - 8], [mx + 30, L1MODEL[1] + L1MODEL[3] + 6], { p: linkK, seed: 7123, t, color: mix(P.ink2, L1AC, hot) }); }
  // ---- 第 2 句：读进一段文字，吐出一段文字 ----
  const ioA = win(L1T(2) + .1, L1E(2) - .1, tau, .3);
  if (ioA > 0) { const my = L1MODEL[1] + L1MODEL[3] / 2;
    dsLabel(c, '一段文字', 610, my, { size: 28, k: dsPop(tau, L1W(2, '读进') - .1) * ioA, seed: 7131, rot: -.03 });
    dsArrow(c, [688, my], [L1MODEL[0] - 10, my], { p: dsK(tau, L1W(2, '读进'), .4) * ioA, seed: 7132, t, al: ioA });
    dsArrow(c, [L1MODEL[0] + L1MODEL[2] + 10, my], [1130, my], { p: dsK(tau, L1W(2, '吐出'), .4) * ioA, seed: 7133, t, al: ioA });
    dsLabel(c, '一段文字', 1210, my, { size: 28, k: dsPop(tau, L1W(2, '吐出') + .2) * ioA, seed: 7134, rot: .03 }); }
  // ---- 第 3 句：harness 管的五件事（散纸条）→ 第 5 句：飞到五站的位置，长成节点 ----
  const toNode = dsK(tau, L1W(5, '拆开') - .3, .7, easeIO);   // 散纸条 → 五站
  L1JOB.forEach(([s, x, y, rot], k) => { const t0 = L1W(3, s) - .1, a = dsPop(tau, t0); if (a <= 0 || toNode >= 1) return;
    const [nx, ny] = L1C(k), dim = win(L1W(4, 'ReAct') - .2, L1T(5) + .4, tau, .3) * .5;
    c.save(); c.globalAlpha *= 1 - toNode * .9 - dim; dsLabel(c, s, lerp(x, nx, toNode), lerp(y, ny, toNode), { size: 30, k: a, seed: 7140 + k, rot: rot * (1 - toNode) }); c.restore(); });
  // 第 4 句：ReAct 的「想 ⇄ 做」，一个手画的小循环
  const ra = win(L1W(4, '想一步') - .2, L1T(5) + .9, tau, .35);
  if (ra > 0) { const cx = 910, cy = 560;
    dsLabel(c, '想', cx - 110, cy, { size: 34, k: dsPop(tau, L1W(4, '想一步') - .1) * ra, seed: 7151 }); dsLabel(c, '做', cx + 110, cy, { size: 34, k: dsPop(tau, L1W(4, '做一步') - .1) * ra, seed: 7152 });
    dsArrow(c, [cx - 70, cy - 30], [cx + 70, cy - 30], { bend: -40, p: dsK(tau, L1W(4, '想一步'), .4) * ra, seed: 7153, t, al: ra });
    dsArrow(c, [cx + 70, cy + 30], [cx - 70, cy + 30], { bend: -40, p: dsK(tau, L1W(4, '做一步'), .4) * ra, seed: 7154, t, al: ra }); }
  // ---- 五站 ----
  const [tx, ty, tk, lap] = l1Run(tau), runA = dsK(tau, L1T(6) - .3, .3) * (1 - dsK(tau, L1T(9) - .3, .3));
  const pinK = dsPop(tau, L1W(10, '写死') - .1, .3), unpin = dsK(tau, L1W(10, '插件') - .4, .35), collapse = dsK(tau, L1W(10, '插件') - .1, .7, easeIO);
  const [ccx, ccy] = [L1BOX[0] + L1BOX[2] / 2, lerp(L1BOX[1] + L1BOX[3] / 2, DS_LOOPCARD.y + DS_LOOPCARD.h / 2, collapse)], cardW = lerp(L1BOX[2], 420, collapse), cardH = lerp(L1BOX[3], 190, collapse);
  if (toNode > 0) {
    // 第 10 句后半：整圈收成一张纸片（先画在下面，节点在它上面缩进去）
    if (collapse > 0) dsSlip(c, ccx - cardW / 2, ccy - cardH / 2, cardW, cardH, { color: mix(DSC.slip, L1AC, .12), seed: 7160, lift: collapse * (1 - endK), al: sm(0, .3, collapse) * nodeA });
    c.save(); c.translate(ccx, ccy); c.scale(lerp(1, .26, collapse), lerp(1, .26, collapse)); c.translate(-ccx, -ccy); c.globalAlpha *= (1 - sm(.5, .9, collapse)) * nodeA;
    for (let k = 0; k < 5; k++) { const [e0, e1] = l1Edge(k); dsArrow(c, e0, e1, { p: dsK(tau, L1W(5, '拆开') + .2 + k * .12, .35), seed: 7170 + k, t, color: runA > 0 && tk === k && tau > L1T(6) ? L1AC : P.ink2 }); }
    L1ST.forEach(([x, y, s, ev, w], k) => { const lit = tau > L1W(6, w) - .15, here = runA > 0 && tk === k;
      dsNode(c, x, y, L1NW, L1NH, s, { size: 32, sub: lit ? ev : null, subSize: 16, k: toNode, hi: here ? .8 : 0, accent: L1AC, seed: 7180 + k }); });
    c.restore();
  }
  // 小纸圆片
  if (runA > 0) { const dive = dsBump(tau, L1W(6, '请求模型'), 1.1), my = L1MODEL[1] + L1MODEL[3] - 14; dsToken(c, tx, lerp(ty, my, dive), 15, P.moon, { al: runA }); }
  // 第 7 句：一圈 = 一个 step（圈中间一张纸条）
  const stA = dsPop(tau, L1W(7, 'step') - .1) * (1 - dsK(tau, L1T(9) - .3, .3));
  if (stA > 0) { const [cx, cy] = [L1BOX[0] + L1BOX[2] / 2, 570];
    dsLabel(c, 'step', cx, cy - 30, { size: 40, k: stA, seed: 7191, ink: L1AC });
    zh(c, '一次模型请求 + 它调用的工具', cx, cy + 40, { size: 28, align: 'center', color: P.ink2, al: stA * dsK(tau, L1W(7, '一次'), .3) }); }
  // 第 8 句：左边一列 = 一个 turn（一句话 → step 1/2/3 → 不再欠活），右边一道竖着的花括号
  const tuA = dsK(tau, L1W(8, '领到') - .2, .3) * (1 - dsK(tau, L1T(9) - .5, .35));
  if (tuA > 0) { const x = 176, ys = [330, 420, 500, 580, 670];
    dsLabel(c, '一句话', x, ys[0], { size: 28, k: dsPop(tau, L1W(8, '领到') - .1) * tuA, seed: 7201, color: mix(DSC.slip, P.moon, .25) });
    [L1W(7, 'step') - .1, L1T(8) + 1.3, L1W(8, '不再欠') - .1].forEach((t0, i) => dsLabel(c, `step ${i + 1}`, x, ys[i + 1], { size: 28, k: dsPop(tau, Math.max(t0, L1W(8, '领到'))) * tuA, seed: 7202 + i, mono: true }));
    dsLabel(c, '不再欠活', x, ys[4], { size: 28, k: dsPop(tau, L1W(8, '不再欠') + .2) * tuA, seed: 7206 });
    for (let i = 0; i < 4; i++) dsArrow(c, [x, ys[i] + 24], [x, ys[i + 1] - 24], { w: 2.4, head: 11, p: dsK(tau, L1W(8, '领到') + i * .3, .3) * tuA, seed: 7210 + i, t });
    const bk = dsK(tau, L1W(8, 'turn') - .2, .4) * tuA;
    if (bk > 0) { c.save(); c.translate(282, (ys[0] + ys[4]) / 2); c.rotate(-Math.PI / 2); dsBrace(c, -(ys[4] - ys[0]) / 2 - 10, (ys[4] - ys[0]) / 2 + 10, 0, { p: bk, seed: 7215, t, color: L1AC, dir: 1 }); c.restore();
      zh(c, 'turn', 312, (ys[0] + ys[4]) / 2 + 14, { size: 36, color: L1AC, al: bk }); } }
  // 第 10 句：四颗图钉把这一圈钉死（写死），说到「插件」时弹掉
  if (pinK > 0 && collapse < 1) { const [x, y, w, h] = L1BOX;
    [[x + 18, y + 18], [x + w - 18, y + 18], [x + w - 18, y + h - 18], [x + 18, y + h - 18]].forEach(([px, py], i) => { const fly = unpin * (1 + i * .15);
      pop(c, px, py - fly * 60, pinK * (1 - sm(.5, 1, unpin)), () => brassPin(c, px + (i % 3 ? 1 : -1) * fly * 30, py - fly * 60, 13)); });
    zh(c, '写死', x + w - 90, y - 14, { size: 30, color: P.red, al: pinK * (1 - unpin) }); }
  // 收成的纸片上：agent loop 的包名，旁边一张代码纸
  if (collapse > 0) { const a = sm(.6, 1, collapse) * nodeA;
    zh(c, 'agent loop', ccx, ccy - 10, { size: 44, align: 'center', color: L1AC, al: a });
    dsMono(c, '@deepseek-ai/dsh-agent-loop', ccx, ccy + 44, { size: 21, align: 'center', color: P.ink2, al: a });
    dsCodeSlip(c, 520, 670, 780, ['export class AgentLoop extends Service {', "  static inject = ['agents', 'sessions', 'llm', 'tools', …]"], { size: 19, title: 'packages/core/agent-loop/src/index.ts', mark: ['AgentLoop', 'Service'], accent: L1AC,
      k: dsPop(tau, L1W(10, '插件') + .6) * nodeA, p: dsK(tau, L1W(10, '插件') + .7, 1, x => x), seed: 7230 }); }
  // 段末：纸片飞到下一段的位置（交接画面），淡入交接纸片
  if (endK > 0) dsHoLoopCard(c, { al: endK });
  // ---- 人物 ----
  dsCast(c, tau, L, L1LINES, {
    ranPose: tt => tt > L1W(10, '插件') ? 'present' : tt > L1T(6) && tt < L1T(9) ? 'point' : tt > L1T(5) && tt < L1T(6) ? 'read' : tt > L1T(1) && tt < L1T(2) ? 'point' : 'stand',
    pchPose: tt => tt > L1T(9) - .5 ? 'cross' : tt > L1T(4) - .5 && tt < L1E(4) + 1 ? 'point' : 'lecture' });
}

scene({ order: 1, key: 'loop', title: '循环', dur: L1DUR, lines: L1LINES, fn: l1Draw, noFlip: true });
