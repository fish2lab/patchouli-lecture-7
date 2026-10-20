'use strict';
// 第 3 段：Cordis。满墨板上一棵插件树；每一次注册是一张「符」：可逆副作用（时间）+ 依赖响应（空间）。
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
const C3T = i => C3LINES[i][0], C3E = i => C3LINES[i][1];
const C3DUR = C3E(C3LINES.length - 1) + 1.6;
function c3Draw(c, tau, L) { dsPage(c, tau, '第三页 · 施工中'); dsCast(c, tau, L, C3LINES); }
scene({ order: 3, key: 'cordis', title: 'Cordis', dur: C3DUR, lines: C3LINES, fn: c3Draw, noFlip: true });
