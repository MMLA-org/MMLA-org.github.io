# MMLAv4 项目页面

零依赖、可直接打开的中英双语静态网站。主入口是 [arXiv:2606.28876v4](https://arxiv.org/abs/2606.28876v4)，论文题名为 *MMLA: Memory-Mediated Learning Architecture for Predictive Dual-State Adaptation*。首页展示总体架构、机制示例和代表性组件结果；机制详解页逐篇展开 v4 与五篇配套论文，PDF 链接指向论文仓库。

## 内容来源

- [2606.28876v4.pdf](https://github.com/MMLA-org/mmla-memory/blob/main/2606.28876v4.pdf)：论文仓库中的 222 页 v4 报告。页面图表、数字、架构契约与证据边界以此为准。
- `assets/mmla-v4-architecture-{zh,en}.svg`：依据报告第 2–3 节及图 3 新绘制的大架构图；PNG 为网页显示和下载版本。图中把因果读取、策略状态 Φ、权威记忆 M 与仅训练时使用的未来监督分开。
- `assets/mmla-v4-cover.png`：从报告第一页渲染的封面预览。
- 五篇配套论文由 [mmla-memory](https://github.com/MMLA-org/mmla-memory) 维护。详解页链接到仓库中的对应 PDF，首页也保留论文仓库入口。这些 R02 稿件是理论候选稿；修订后的定义与结论以 v4 为准。
- PDSA 系列代码仅用于内部理解机制，页面不提供这些仓库的链接或源码路径。公开的机制说明和实验结论以 v4 论文为准。

`mmla-memory` 当前 README 说明该论文仓库仅分发 PDF 与文档，不包含可执行源码、模型权重或原始数据；旧版报告及 v4 提到的独立重建材料包也不在该仓库中。本网站不提供或暗示这些材料已经发布。

## 页面与内容

机制部分先对照 Φ、M 保存的内容、更新方式和触发时机，再用一道整数约束题贯穿读取、策略更新、候选组装和记忆提交。分步图展示候选行字段，以及写入或 NULL 对后续读取的影响；准入说明涵盖同起点动作重放、未来分支监督和线上风险预测。示例只说明机制，不是实验运行记录或效果证据。

[`mechanisms.html`](mechanisms.html) 包含六章、64 个机制主题：v4 总体架构、RTT、原子记忆行、预测式准入、双状态适应、完成片段整合。每章配一张机制图，正文说明运行过程、输入输出和适用范围，附 v4 章节与 PDF 页码。支持全文搜索、展开收起、章节导航和单项链接。

- `guide-v4.js`、`guide-adaptation.js`、`guide-memory.js`：双语机制内容及引用。
- `mechanisms.js`、`mechanisms.css`：详解页渲染、导航、搜索和排版。
- `guide-figures.js`、`guide-figures.css`：六章的 HTML/CSS 机制图。
- `script.js`、`styles.css`：共享导航、语言切换和首页交互。
- `design.css`、`motion.js`：首页双路径动态示意、章节进入、步骤切换、图表反馈及阅读进度；动效单次播放，遵循系统“减少动态效果”设置。
- `diagram-interaction.js`、`diagram-interaction.css`：架构图拖拽、指针位置缩放、双击适配/放大及查看器转场。

机制内容区分架构定义、理论条件与组件实验。首页结果选自 v4 的受控生命周期、类型化传输和扩展上下文问答，保留任务范围、原表引用与成本口径。

## 本地预览与部署

直接打开 [`index.html`](index.html) 或 [`mechanisms.html`](mechanisms.html) 即可预览，也可使用任意静态文件服务器。PDF 链接需要联网访问 GitHub。中英文切换会记住本地选择，支持 `?lang=zh` / `?lang=en`。结果表可切换读者模型；架构图可放大并下载中英文 PNG / SVG。

GitHub Pages 部署使用 `.github/workflows/static.yml`，将仓库根目录发布。图标来自 [Lucide](https://lucide.dev/)，许可见 `assets/icons/LICENSE`。项目及论文各自的许可请以其仓库文件为准。
