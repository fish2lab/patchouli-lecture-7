'use strict';
// 第 0 段：钩子。左页纸做的 Koishi 控制台，右页墨色的 DSH 终端；最后终端长成中墨板，写上片名。
// 顶层名字带 H0 / h0 前缀。
const H0LINES = dsSeq(.8, [
  ['做过 QQ bot 的人，大概率用过 Koishi。', { mood: 'happy' }],
  ['在网页控制台点一下，插件就装上了，bot 不用重启。', { pause: .2, hold: .5 }],
  ['今年八月，DeepSeek 开源了自己的 agent harness，叫 DSH。', { pause: .3, hold: .3 }],
  ['它的底层，就是从 Koishi 抽出来的那个框架：Cordis。', { pause: .2, hold: .8 }],
  ['同一套框架，以前伺候 QQ bot，现在伺候 agent？', { who: 'patchouli', mood: 'surprised', pause: .3 }],
  ['问题没变，只是动手的换了。', { mood: 'proud', pause: .2 }],
  ['以前是人给 bot 装插件，现在是 agent 给自己装插件。', { pause: .1, hold: 1.2 }],
  ['这期回答：agent 给自己装插件，为什么需要一整套新的地基。', { pause: .3, hold: .6 }],
]);
const H0T = i => H0LINES[i][0], H0E = i => H0LINES[i][1];
const H0DUR = H0E(H0LINES.length - 1) + 1.6;
function h0Draw(c, tau, L) { dsPage(c, tau, '第零页 · 施工中'); dsCast(c, tau, L, H0LINES); }
scene({ order: 0, key: 'hook', title: '钩子', dur: H0DUR, lines: H0LINES, fn: h0Draw, noFlip: true });
