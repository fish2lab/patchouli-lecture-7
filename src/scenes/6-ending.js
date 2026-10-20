'use strict';
// 第 6 段：结尾。回到阶梯，第三级高亮；预告下期；书合上。
// 顶层名字带 N6 / n6 前缀。
const N6LINES = dsSeq(.8, [
  ['所以，日常写代码，该换成 DSH 吗？', { who: 'patchouli' }],
  ['未必。有人拆过：对大多数人的日常开发，DSH 不会让体验更好。', { pause: .2, hold: .6 }],
  ['它独有的是：harness 本身，能被 agent 改写、进化。', { mood: 'proud', pause: .2, hold: 1.2 }],
  ['另外它还在开发者预览，以后会有不兼容的改动。', { mood: 'awkward', pause: .2, hold: .5 }],
  ['下期讲：harness 怎么变成模型的训练分布。', { mood: 'happy', pause: .3, hold: .8 }],
  ['这一页，我先收进图书馆了。', { who: 'patchouli', mood: 'smile', pause: .3, hold: 2.4 }],
]);
const N6T = i => N6LINES[i][0], N6E = i => N6LINES[i][1];
const N6DUR = N6E(N6LINES.length - 1) + 2.2;
function n6Draw(c, tau, L) { spread(c, tau); dsSlate(c, DS.slate); dsRan(c, tau, L); dsPch(c, tau, L); }
scene({ order: 6, key: 'ending', title: '结尾', dur: N6DUR, lines: N6LINES, fn: n6Draw, noFlip: true });
