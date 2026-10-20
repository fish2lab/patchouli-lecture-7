'use strict';
// 第 2 段：可扩展性阶梯。三级台阶：声明式 → 进程内中间件 → 可组合内核。
// 顶层名字带 D2 / d2 前缀。
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
const D2T = i => D2LINES[i][0], D2E = i => D2LINES[i][1];
const D2DUR = D2E(D2LINES.length - 1) + 1.2;
function d2Draw(c, tau, L) { spread(c, tau); dsSlate(c, DS.slate); dsRan(c, tau, L); dsPch(c, tau, L); }
scene({ order: 2, key: 'ladder', title: '阶梯', dur: D2DUR, lines: D2LINES, fn: d2Draw, noFlip: true });
