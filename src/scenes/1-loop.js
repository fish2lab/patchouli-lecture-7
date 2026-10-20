'use strict';
// 第 1 段：agent = 模型 + harness。中墨板上一圈蓝色的 harness 环，中间一颗黄色的模型；拆成 DSH 的 turn / step。
// 顶层名字带 L1 / l1 前缀。
const L1LINES = dsSeq(.8, [
  ['先对齐一下词。你说的 harness，到底指哪一块？', { who: 'patchouli' }],
  ['一句话：agent 等于模型，加上 harness。', { pause: .2, hold: 1.2 }],
  ['模型只做一件事：读进一段文字，吐出一段文字。', { pause: .2, hold: .5 }],
  ['其余的都归 harness：拼提示词、调用工具、管上下文、管权限、记会话日志。', { pause: .2, hold: .8 }],
  ['ReAct 那种「想一步、做一步」的循环呢？', { who: 'patchouli', mood: 'smug', pause: .3 }],
  ['那是骨架，不是全部。我们用 DSH 自己的说法，把这一圈拆开。', { pause: .2, hold: .3 }],
  ['拼提示词，请求模型，解析出工具调用，执行，再把结果填回去。', { pause: .2, hold: .8 }],
  ['转一圈叫一个 step：一次模型请求，加上它调用的工具。', { pause: .2, hold: 1.2 }],
  ['从领到一句话，到不再欠任何活，叫一个 turn。一个 turn 有零到多个 step。', { pause: .2, hold: 1.2 }],
  ['这一圈本身，是谁写死的？', { who: 'patchouli', mood: 'annoyed', pause: .3 }],
  ['大多数 harness 里，它是写死的。在 DSH 里，它也只是一个插件。', { mood: 'proud', pause: .2, hold: 1.4 }],
]);
const L1T = i => L1LINES[i][0], L1E = i => L1LINES[i][1];
const L1DUR = L1E(L1LINES.length - 1) + 1.2;
function l1Draw(c, tau, L) { spread(c, tau); dsSlate(c, DS.slate); dsRan(c, tau, L); dsPch(c, tau, L); }
scene({ order: 1, key: 'loop', title: '循环', dur: L1DUR, lines: L1LINES, fn: l1Draw, noFlip: true });
