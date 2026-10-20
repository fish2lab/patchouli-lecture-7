'use strict';
// 第 4 段：自进化。三层叠起来的板（Cordis 地基 / PTC 模式 / 创造模式 / 进化循环），验证器锁在外面。
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
const E4T = i => E4LINES[i][0], E4E = i => E4LINES[i][1];
const E4DUR = E4E(E4LINES.length - 1) + 1.2;
function e4Draw(c, tau, L) { dsPage(c, tau, '第四页 · 施工中'); dsCast(c, tau, L, E4LINES); }
scene({ order: 4, key: 'evolve', title: '自进化', dur: E4DUR, lines: E4LINES, fn: e4Draw, noFlip: true });
