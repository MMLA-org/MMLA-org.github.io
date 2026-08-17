# MMLA GitHub Pages 主页

这是 MMLA 研究仓库的零依赖静态主页。页面、样式与交互位于仓库根目录；公开 PDF 由 [MMLA-org/mmla-memory](https://github.com/MMLA-org/mmla-memory) 维护，页面通过 GitHub 链接引用当前公开版本。不需要 Node、构建工具或第三方 CDN。

## 部署到 GitHub Pages

仓库已经包含 `.github/workflows/static.yml`。将代码推送到 [`MMLA-org/MMLA-org.github.io`](https://github.com/MMLA-org/MMLA-org.github.io) 后：

1. 打开仓库的 **Settings → Pages**。
2. 将 **Source** 设为 **GitHub Actions**。
3. 推送到 `main` 分支，或在 Actions 页面手动运行 **Deploy MMLA GitHub Pages**。

工作流会把仓库根目录作为 GitHub Pages 制品发布。也可以在本地直接打开 `index.html`，或用任意静态文件服务器预览。

## 当前公开内容

主页引用 [MMLA-org/mmla-memory](https://github.com/MMLA-org/mmla-memory) 中的当前公开文件：

- `MMLA_Technical_Report.pdf`：MMLA 正式技术报告，共 196 页。
- `MMLA_arXiv_public.pdf`：从 [arXiv 2606.28876](https://arxiv.org/pdf/2606.28876) 下载的公开稿，共 16 页。
- 其余五份 PDF 按一次记忆更新的逻辑链分工：完成片段何时可以回看、什么是完整权威记忆行、如何在精确不写与目标行替换之间决策、如何分开记忆状态与策略状态，以及什么证据才能称为同一问题内的学习。
- 页面只展示当前正式公开材料，不展示内部修订后缀。
- 主页明确区分：技术规则和文档已经整理好；自动找到并正确读回记忆、自动覆盖旧记忆、长上下文或效率优势，仍不能直接宣称为已经证明的系统效果。

页面的技术主线是一条可执行的状态转移协议：生成只读旧记忆，片段明确封口后才允许双向整理；每个候选都面向一条旧记忆装配为完整新行；无效动作先被排除，上线选择不能看未来；最后要么原子替换整行，要么让状态每一位都保持不变。新状态只能影响之后的生成。

引用区按 `mmla-memory` release README 的 BibTeX 整理，包含公开稿、正式技术报告和五个理论后续。若未来公开材料发生变化，应同步检查页面卡片和引用说明。

## 目录

- `index.html`：主页内容与文档入口
- `styles.css`：响应式视觉样式
- `script.js`：中英文切换、文档筛选和 BibTeX 复制
- `assets/mmla-mark.svg`：MMLA Memory-knot 标识
