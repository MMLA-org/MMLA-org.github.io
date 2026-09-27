(() => {
  "use strict";

  const bilingual = (zh, en, tag = "span", extraClass = "") =>
    `<${tag} class="lang-zh${extraClass ? ` ${extraClass}` : ""}">${zh}</${tag}><${tag} class="lang-en${extraClass ? ` ${extraClass}` : ""}">${en}</${tag}>`;

  const figures = {
    v4: () => `
      <figcaption>${bilingual("两个状态载体，各自更新、分别生效", "Two state carriers, separate update paths", "span", "mf-title")}</figcaption>
      <div class="mf-lanes">
        <div class="mf-lane mf-policy-lane">
          <div class="mf-lane-key"><strong>Φ</strong><span>${bilingual("策略状态", "Policy state")}</span></div>
          <div class="mf-lane-steps"><span>${bilingual("同题反馈", "Within-problem feedback")}</span><i></i><span>${bilingual("有界更新", "Bounded update")}</span><i></i><span>${bilingual("新提案分布", "New proposal law")}</span></div>
          <div class="mf-lane-end"><strong>Φ<sub>j</sub> → Φ<sub>j+1</sub></strong></div>
        </div>
        <div class="mf-lane mf-memory-lane">
          <div class="mf-lane-key"><strong>M</strong><span>${bilingual("权威记忆", "Authoritative memory")}</span></div>
          <div class="mf-lane-steps"><span>${bilingual("完成片段", "Completed segment")}</span><i></i><span>${bilingual("可信组装", "Trusted assembly")}</span><i></i><span>${bilingual("完整行 / NULL", "Complete row / NULL")}</span></div>
          <div class="mf-lane-end"><strong>M<sub>j</sub> → M<sub>j+1</sub></strong></div>
        </div>
      </div>
      <p class="mf-note">${bilingual("后续视图可读取两者；写入者、版本链与回滚域保持独立。", "Later views may read both; writers, version chains, and rollback domains stay independent.")}</p>
    `,
    rtt: () => `
      <figcaption>${bilingual("同题未解决期间的反馈—更新—复用轨迹", "Feedback, update, and reuse while one problem remains open", "span", "mf-title")}</figcaption>
      <div class="mf-sequence mf-rtt-sequence">
        <div class="mf-node"><small>01</small><strong>${bilingual("尝试 j", "Attempt j")}</strong><span>${bilingual("问题仍在进行", "Problem active")}</span></div><i></i>
        <div class="mf-node"><small>02</small><strong>${bilingual("反馈 fⱼ", "Feedback fⱼ")}</strong><span>${bilingual("由本次尝试产生", "From this attempt")}</span></div><i></i>
        <div class="mf-node mf-policy-node"><small>03</small><strong>${bilingual("更新 Φ", "Update Φ")}</strong><span>${bilingual("提交新版本", "Commit new version")}</span></div><i></i>
        <div class="mf-node"><small>04</small><strong>${bilingual("后续尝试 j+1", "Later attempt j+1")}</strong><span>${bilingual("实际读取 Φⱼ₊₁", "Actually reads Φⱼ₊₁")}</span></div>
      </div>
      <p class="mf-note">${bilingual("同一题目 · 反馈先于更新 · 更新先于后续读取", "Same problem · feedback precedes update · update precedes later read")}</p>
    `,
    rows: () => `
      <figcaption>${bilingual("完整记忆行由三类字段共同组成", "A complete memory row combines three field classes", "span", "mf-title")}</figcaption>
      <div class="mf-row-inputs">
        <div class="mf-row-part"><small>01</small><strong>${bilingual("规范内容", "Canonical content")}</strong><span>${bilingual("类型 · 键 · 文本", "Type · key · text")}</span></div><b aria-hidden="true">+</b>
        <div class="mf-row-part mf-neural-part"><small>02</small><strong>${bilingual("神经载荷", "Neural payload")}</strong><span>${bilingual("有界表示 · 校验", "Bounded representation · checks")}</span></div><b aria-hidden="true">+</b>
        <div class="mf-row-part mf-system-part"><small>03</small><strong>${bilingual("系统字段", "System fields")}</strong><span>${bilingual("租户 · 版本 · 权限 · 收据", "Tenant · version · ACL · receipt")}</span></div>
      </div>
      <div class="mf-row-result"><span class="mf-row-arrow" aria-hidden="true"></span><strong>${bilingual("可信组装 + 原子提交", "Trusted assembly + atomic commit")}</strong><span class="mf-row-branches"><em>${bilingual("完整行", "Complete row")}</em><em>NULL</em></span></div>
    `,
    admission: () => `
      <figcaption>${bilingual("离线风险目标：动作 × 同前缀未来分支", "Offline risk targets: action × future branch from one prefix", "span", "mf-title")}</figcaption>
      <div class="mf-admission-grid">
        <table>
          <caption>${bilingual("各动作在相同前缀的后续分支上的损失", "Loss for each action across continuations from the same prefix")}</caption>
          <thead><tr><th scope="col">${bilingual("动作", "Action")}</th><th scope="col">${bilingual("分支 A", "Branch A")}</th><th scope="col">${bilingual("分支 B", "Branch B")}</th><th scope="col">${bilingual("分支 C", "Branch C")}</th></tr></thead>
          <tbody><tr><th scope="row">${bilingual("写入", "Write")}</th><td>ℓ<sub>W,A</sub></td><td>ℓ<sub>W,B</sub></td><td>ℓ<sub>W,C</sub></td></tr><tr><th scope="row">NULL</th><td>ℓ<sub>N,A</sub></td><td>ℓ<sub>N,B</sub></td><td>ℓ<sub>N,C</sub></td></tr></tbody>
        </table>
        <div class="mf-risk-output"><span>${bilingual("按分支权重汇总预期风险", "Aggregate expected risk with branch weights")}</span><i></i><strong>${bilingual("部署：当前前缀 → 预测各动作风险 → 选择", "Deploy: current prefix → predict action risks → choose")}</strong></div>
      </div>
    `,
    dual: () => `
      <figcaption>${bilingual("策略 × 记忆：分别测主效应与交互", "Policy × memory: estimate main effects and interaction", "span", "mf-title")}</figcaption>
      <div class="mf-dual-wrap"><table class="mf-dual-table">
        <caption>${bilingual("四格干预：每个格子都记录结果 Yₚₘ", "Four interventions: record outcome Yₚₘ in every cell")}</caption>
        <thead><tr><th></th><th class="mf-memory-head">M−</th><th class="mf-memory-head">M+</th></tr></thead>
        <tbody><tr><th class="mf-policy-head">Φ−</th><td><strong>Y₀₀</strong><small>${bilingual("基线", "Baseline")}</small></td><td><strong>Y₀₁</strong><small>${bilingual("仅记忆", "Memory only")}</small></td></tr><tr><th class="mf-policy-head">Φ+</th><td><strong>Y₁₀</strong><small>${bilingual("仅策略", "Policy only")}</small></td><td><strong>Y₁₁</strong><small>${bilingual("联合", "Joint")}</small></td></tr></tbody>
      </table><div class="mf-effects"><span>${bilingual("策略效应：固定 M 比较 Φ− / Φ+", "Policy effect: compare Φ− / Φ+ at fixed M")}</span><span>${bilingual("记忆效应：固定 Φ 比较 M− / M+", "Memory effect: compare M− / M+ at fixed Φ")}</span><strong>${bilingual("交互", "Interaction")} = (Y₁₁ − Y₁₀) − (Y₀₁ − Y₀₀)</strong></div></div>
    `,
    consolidation: () => `
      <figcaption>${bilingual("片段巩固：因果生成与后续读取的时间线", "Segment consolidation: causal generation to later read", "span", "mf-title")}</figcaption>
      <div class="mf-sequence mf-consolidation-sequence">
        <div class="mf-node"><small>t</small><strong>${bilingual("观察与生成", "Observe & generate")}</strong><span>${bilingual("前缀在线推进", "Advance causal prefix")}</span></div><i></i>
        <div class="mf-node"><small>b</small><strong>${bilingual("关闭片段", "Close segment")}</strong><span>${bilingual("封存边界", "Seal boundary")}</span></div><i></i>
        <div class="mf-node"><small>view</small><strong>${bilingual("局部回看", "Local review")}</strong><span>${bilingual("闭合片段双向编码", "Bidirectional encode completed view")}</span></div><i></i>
        <div class="mf-node mf-memory-node"><small>(b, j)</small><strong>${bilingual("提交事件", "Commit event")}</strong><span>${bilingual("完整行 / NULL", "Complete row / NULL")}</span></div><i></i>
        <div class="mf-node mf-memory-node"><small>later</small><strong>${bilingual("后续读取", "Later read")}</strong><span>${bilingual("固定版本视图", "Pinned version view")}</span></div>
      </div>
      <p class="mf-note">${bilingual("局部回顾发生在关闭之后；提交版本只进入后续读取视图。", "Local review follows closure; committed versions enter later read views.")}</p>
    `
  };

  window.renderMechanismFigure = (id) => {
    const render = figures[id];
    if (!render) return null;
    const figure = document.createElement("figure");
    figure.className = `mechanism-figure mf-${id}`;
    figure.innerHTML = render();
    return figure;
  };
})();
