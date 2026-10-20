帕秋莉讲座 · 第 7 集：会给自己装插件的 agent（DeepSeek Harness 设计拆解 · 上）

八云蓝主讲、帕秋莉提问，约 8 分钟：agent = 模型 + harness；harness 扩展能力的三级阶梯（声明式 → 进程内中间件 → 可组合内核）；DSH 连 agent loop 都是一个能换掉的插件，靠的是 Cordis 的可逆副作用和依赖响应；地基不等于进化算法，验证器要放在可进化的集合之外。

**附件**

- `patchouli-lecture-7.mp4`：成片，1920×1080，30fps，带油库里语音和八音盒 BGM，由 CI 用无头 Chromium 逐帧渲染。
- `patchouli-lecture-7.html`：同一部片子的单文件网页版，浏览器打开就能实时播放，拖到任意一秒。

**出处**：deepseek-ai/deepseek-harness（0.2.1-rc.2）的 docs/architecture.md、docs/cordis-primer.md 和源码；arXiv 2608.25512；Koishi v4.7 更新日志与生命周期文档；Claude Code mods 文档；pi extensions 文档；鸭哥《深入拆解 DSH》；cofy-x/dsh-evolver；dsh-auto-evolve。详见仓库 docs/方案.md。

**许可**：代码 MIT；字体霞鹜文楷（OFL）；配音 AquesTalk（株式会社アクエスト）；BGM 为东方妖妖梦「少女幻葬 ～ Necro-Fantasy」（ZUN）的八音盒改编，音符取自 touhou-midi-collection 的 ZUN 原版 MIDI。东方 Project 角色版权属于上海爱丽丝幻乐团（ZUN），本片是同人作品。
