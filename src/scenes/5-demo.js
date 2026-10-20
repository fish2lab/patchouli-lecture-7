'use strict';
// 第 5 段：同题三解。三个窗口（Claude Code / pi / DSH），后半段只剩 DSH 的事件链：漏掉 next → 卸载 → 重启 → dump-config。
// 顶层名字带 M5 / m5 前缀。
const M5LINES = dsSeq(.8, [
  ['来做个对比：同一个需求，三个 harness 各做一遍。', { hold: .3 }],
  ['需求是：测试连续失败三次以后，拦下第四次，让 agent 先写下失败原因。', { pause: .2, hold: .8 }],
  ['Claude Code：让 Claude 写一个 mod，挂在工具调用事件上，数失败次数，第四次直接拒绝。', { pause: .3, hold: .5 }],
  ['pi：写一个 extension，在工具调用时返回 block 和原因，放进目录，reload 一下。', { pause: .3, hold: .5 }],
  ['DSH：agent 先查运行时，找到工具执行前的那个事件，再自己写插件、自己装上。', { pause: .3, hold: .8 }],
  ['三家都做到了。那 DSH 的看点在哪？', { who: 'patchouli', mood: 'smug', pause: .3 }],
  ['在出错以后。我们故意写错一个插件：漏掉一句 next。', { mood: 'proud', pause: .2, hold: .5 }],
  ['链条断在这一层：后面的监听器和默认的放行全被吞掉，工具一个都跑不起来。', { mood: 'awkward', pause: .2, hold: 1.2 }],
  ['把它卸载。它注册的监听器和工具按相反的顺序撤销，其余工具恢复正常。', { pause: .3, hold: 1 }],
  ['再重启一次。只活在内存里的动态定义，会被清空。', { pause: .3, hold: .6 }],
  ['经 Plugin Manager 装进配置的插件，重启以后还在。', { pause: .2, hold: .8 }],
  ['最后把整棵插件树打印出来：agent loop，只是其中一行。', { mood: 'proud', pause: .3, hold: 1.4 }],
]);
const M5T = i => M5LINES[i][0], M5E = i => M5LINES[i][1];
const M5DUR = M5E(M5LINES.length - 1) + 1.2;
function m5Draw(c, tau, L) { dsPage(c, tau, '第五页 · 施工中'); dsCast(c, tau, L, M5LINES); }
scene({ order: 5, key: 'demo', title: '同题三解', dur: M5DUR, lines: M5LINES, fn: m5Draw, noFlip: true });
