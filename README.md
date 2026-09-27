# MMLAv4 项目页面

零依赖、可直接打开的中英双语静态网站。主入口是 [arXiv:2606.28876v4](https://arxiv.org/abs/2606.28876v4)，论文题名为 *MMLA: Memory-Mediated Learning Architecture for Predictive Dual-State Adaptation*。页面以本地 PDF 为主要引用，按 2026 年 9 月 13 日的论文证据截止范围展示实验结果与未决问题。

## 内容来源

- `assets/papers/2606.28876v4.pdf`：来自本地 `mmla-memory/2606.28876v4.pdf` 的 222 页 v4 报告。页面图表、数字、架构契约与证据边界以此为准。
- `assets/mmla-v4-architecture-{zh,en}.svg`：依据报告第 2–3 节及图 3 新绘制的大架构图；PNG 为网页显示和下载版本。图中把因果读取、策略状态 Φ、权威记忆 M 与仅训练时使用的未来监督分开。
- `assets/mmla-v4-cover.png`：从报告第一页渲染的封面预览。
- 五篇配套论文由 [mmla-memory](https://github.com/MMLA-org/mmla-memory) 维护，页面直接链接该仓库中的 PDF。这些 R02 稿件是待独立评审的理论候选稿，不新增实验；若与 v4 整合报告不一致，以 v4 为准。
- PDSA 系列代码仅用于内部理解机制，页面不提供这些仓库的链接或源码路径。公开的机制说明和实验结论以 v4 论文为准。

`mmla-memory` 当前 README 说明该论文仓库仅分发 PDF 与文档，不包含可执行源码、模型权重或原始数据；旧版报告及 v4 提到的独立重建材料包也不在该仓库中。本网站不提供或暗示这些材料已经发布。

## 本地预览与部署

机制部分按读取、策略更新、候选组装、记忆提交四个阶段展开。分步图支持键盘切换，并以写入与 NULL 两种动作说明记忆变化；后续图解区分离线未来监督与线上准入。图中状态与槽位仅用于说明机制，不是实验运行记录。

直接打开 [`index.html`](index.html) 即可预览，或使用任意静态文件服务器。中英文切换会记住本地选择，也支持 `?lang=zh` / `?lang=en`。证据表可切换读者模型与上下文长度；架构图可放大并下载中英文 PNG / SVG。

GitHub Pages 部署使用 `.github/workflows/static.yml`，将仓库根目录发布。图标来自 [Lucide](https://lucide.dev/)，许可见 `assets/icons/LICENSE`。项目及论文各自的许可请以其仓库文件为准。
