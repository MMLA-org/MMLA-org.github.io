(() => {
  "use strict";
  const order = ["v4", "rtt", "rows", "admission", "dual", "consolidation"];
  const parts = [...(window.MMLA_GUIDE_PARTS || [])].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const content = document.querySelector("#guide-content");
  const nav = document.querySelector("#guide-nav");
  const search = document.querySelector("#guide-search");
  const clearSearch = document.querySelector("#clear-guide-search");
  const status = document.querySelector("#guide-status");
  const expand = document.querySelector("#expand-mechanisms");
  const collapse = document.querySelector("#collapse-mechanisms");
  const chapterSelect = document.querySelector("#guide-chapter-select");
  if (!parts.length || !content || !nav || !search) return;

  const labels = {
    v4: { zh: "v4 总体机制", en: "v4 architecture & components" },
    rtt: { zh: "推理时训练", en: "Reasoning-Time Training" },
    rows: { zh: "原子记忆行", en: "Atomic Memory Rows" },
    admission: { zh: "预测式记忆准入", en: "Predictive Memory Admission" },
    dual: { zh: "双状态适应", en: "Dual-State Adaptation" },
    consolidation: { zh: "完成片段整合", en: "Completed-Segment Consolidation" },
  };
  let selectedPart = parts[0];
  let contentAnimation = null;
  let activeFrame = 0;
  let lastActiveEntry = "";
  const entryAnimations = new WeakMap();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const index = new Map();
  parts.forEach(part => {
    index.set(part.id, { part });
    part.sections.forEach(section => index.set(section.id, { part, section }));
  });

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function bilingual(tag, className, value) {
    const node = element(tag, className);
    node.append(element("span", "lang-zh", value.zh), element("span", "lang-en", value.en));
    return node;
  }

  function icon(name, className = "") {
    const image = element("img", className);
    image.src = "assets/icons/" + name + ".svg";
    image.alt = "";
    return image;
  }

  function clearEntryAnimation(entry) {
    const animation = entryAnimations.get(entry);
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
      entryAnimations.delete(entry);
    }
    entry.style.removeProperty("height");
    entry.style.removeProperty("overflow");
  }

  function setEntryOpen(entry, open) {
    const summary = entry.querySelector(".mechanism-summary");
    const running = entryAnimations.get(entry);
    const target = Boolean(open);
    const currentTarget = entry._targetOpen ?? entry.open;
    if (currentTarget === target && !running) {
      entry.open = target;
      return Promise.resolve();
    }
    if (!summary || reducedMotion.matches || typeof entry.animate !== "function") {
      clearEntryAnimation(entry);
      entry._targetOpen = target;
      entry.open = target;
      if (!target && entry.contains(document.activeElement)) summary?.focus({ preventScroll: true });
      return Promise.resolve();
    }

    const currentHeight = entry.getBoundingClientRect().height;
    if (running) clearEntryAnimation(entry);
    if (!target && entry.contains(document.activeElement)) summary.focus({ preventScroll: true });
    entry._targetOpen = target;
    entry.open = true;
    const naturalHeight = entry.getBoundingClientRect().height;
    const entryStyle = getComputedStyle(entry);
    const borderHeight = parseFloat(entryStyle.borderTopWidth) + parseFloat(entryStyle.borderBottomWidth);
    const endHeight = target ? naturalHeight : summary.getBoundingClientRect().height + borderHeight;
    if (Math.abs(endHeight - currentHeight) < 1) {
      clearEntryAnimation(entry);
      entry.open = target;
      return Promise.resolve();
    }

    entry.style.height = `${currentHeight}px`;
    entry.style.overflow = "hidden";
    const animation = entry.animate(
      [{ height: `${currentHeight}px` }, { height: `${endHeight}px` }],
      { duration: 190, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
    );
    entryAnimations.set(entry, animation);
    return new Promise(resolve => {
      animation.onfinish = () => {
        if (entryAnimations.get(entry) !== animation) return;
        entryAnimations.delete(entry);
        entry.open = target;
        entry._targetOpen = target;
        entry.style.removeProperty("height");
        entry.style.removeProperty("overflow");
        resolve();
      };
      animation.oncancel = resolve;
    });
  }

  function updateCurrentMechanism() {
    activeFrame = 0;
    const entries = [...content.querySelectorAll(".mechanism-entry")];
    if (!entries.length) return;
    const readingLine = Math.min(240, Math.max(120, window.innerHeight * 0.3));
    let current = entries.find(entry => entry.getBoundingClientRect().bottom > readingLine) || entries[entries.length - 1];
    for (const entry of entries) {
      if (entry.getBoundingClientRect().top <= readingLine) current = entry;
      else break;
    }
    if (current.id === lastActiveEntry) return;
    lastActiveEntry = current.id;
    content.querySelectorAll(".mechanism-entry.is-current").forEach(entry => entry.classList.remove("is-current"));
    current.classList.add("is-current");
    const activePart = index.get(current.id)?.part;
    nav.querySelectorAll(".guide-chapter-link").forEach(link => {
      const active = Boolean(activePart && link.hash.slice(1) === activePart.id);
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    nav.querySelectorAll(".guide-subnav a").forEach(link => {
      const active = link.hash.slice(1) === current.id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function queueCurrentMechanism() {
    if (activeFrame) return;
    activeFrame = requestAnimationFrame(updateCurrentMechanism);
  }

  function finishRender() {
    contentAnimation?.cancel();
    contentAnimation = null;
    if (!reducedMotion.matches && typeof content.animate === "function") {
      contentAnimation = content.animate(
        [{ opacity: 0, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 190, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
      );
      contentAnimation.onfinish = () => { contentAnimation = null; };
    }
    lastActiveEntry = "";
    document.dispatchEvent(new CustomEvent("mmla:contentchange", { detail: { content } }));
    queueCurrentMechanism();
  }

  function sourceLink(file, page, label) {
    const link = element("a", "guide-source");
    link.href = file + "#page=" + page;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(element("span", "", label), icon("arrow-up-right"));
    return link;
  }

  function chapterHeader(part, searchResult = false) {
    const header = element("header", "guide-chapter-header");
    const number = String(order.indexOf(part.id) + 1).padStart(2, "0");
    header.append(element("p", "section-index", number + " / " + (part.id === "v4" ? "MMLAv4" : "COMPANION PAPER")));
    header.append(bilingual("h2", "", part.title));
    if (!searchResult) {
      header.id = part.id;
      header.append(bilingual("p", "guide-chapter-subtitle", part.subtitle));
      header.append(bilingual("p", "guide-chapter-lead", part.lead));
      const links = element("div", "guide-source-links");
      links.append(sourceLink(part.source.file, part.source.page, part.source.label));
      header.append(links);
      const figure = window.renderMechanismFigure?.(part.id);
      if (figure) header.append(figure);
    }
    return header;
  }

  function mechanismEntry(part, section) {
    const details = element("details", "mechanism-entry");
    details.id = section.id;
    const summary = element("summary", "mechanism-summary");
    const position = part.sections.indexOf(section) + 1;
    summary.append(element("span", "mechanism-entry-number", String(order.indexOf(part.id) + 1).padStart(2, "0") + "." + String(position).padStart(2, "0")));
    const heading = element("div", "mechanism-summary-copy");
    heading.append(bilingual("h3", "", section.title), bilingual("p", "", section.purpose));
    const indicator = element("span", "entry-indicator");
    indicator.append(icon("plus", "entry-expand"), icon("minus", "entry-collapse"));
    summary.append(heading, indicator);
    details.append(summary);
    const body = element("div", "mechanism-entry-body");
    if (section.steps) {
      const steps = element("ol", "mechanism-steps");
      section.steps.forEach((step, i) => {
        const row = element("li");
        row.append(element("span", "step-label", "W" + (i + 1)), bilingual("p", "mechanism-process", step));
        steps.append(row);
      });
      body.append(steps);
    } else {
      body.append(bilingual("p", "mechanism-process", section.process));
    }
    const list = element("dl", "mechanism-explanation");
    [["input", { zh: "输入", en: "Input" }], ["output", { zh: "输出", en: "Output" }]].forEach(([key, label]) => {
      const row = element("div", "explanation-" + key);
      row.append(bilingual("dt", "", label), bilingual("dd", "", section[key]));
      list.append(row);
    });
    body.append(list);
    const scope = element("aside", "mechanism-scope");
    scope.append(bilingual("span", "scope-label", { zh: "适用范围", en: "Scope" }), bilingual("p", "", section.boundary));
    body.append(scope);
    const references = element("div", "entry-references");
    references.append(sourceLink("https://github.com/MMLA-org/mmla-memory/raw/main/2606.28876v4.pdf", section.reference.page, section.reference.label));
    const permalink = bilingual("a", "guide-permalink", { zh: "本节链接", en: "Link to section" });
    permalink.href = "#" + section.id;
    references.append(permalink);
    body.append(references);
    details.append(body);
    return details;
  }

  function renderNavigation() {
    nav.replaceChildren();
    parts.forEach((part, i) => {
      const group = element("div", "guide-nav-group");
      const link = element("a", "guide-chapter-link");
      link.href = "#" + part.id;
      if (part.id === selectedPart.id && !search.value.trim()) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "location");
      }
      link.append(element("span", "guide-nav-number", String(i + 1).padStart(2, "0")));
      link.append(bilingual("span", "", labels[part.id]));
      link.append(element("span", "guide-nav-count", String(part.sections.length)));
      group.append(link);
      nav.append(group);
    });
    if (!search.value.trim()) {
      const subnav = element("div", "guide-subnav");
      subnav.append(bilingual("p", "guide-topics-label", { zh: "本章机制", en: "In this chapter" }));
      selectedPart.sections.forEach(section => {
        const anchor = bilingual("a", "", section.title);
        anchor.href = "#" + section.id;
        subnav.append(anchor);
      });
      nav.append(subnav);
    }
    chapterSelect.value = search.value.trim() ? "search" : selectedPart.id;
    chapterSelect.querySelector('[value="search"]').hidden = !search.value.trim();
  }

  function announceCount(count, searching) {
    status.replaceChildren(bilingual("span", "", searching
      ? { zh: count + " 项搜索结果", en: count + " matching mechanisms" }
      : { zh: count + " 项机制", en: count + " mechanisms" }));
    expand.disabled = count === 0;
    collapse.disabled = count === 0;
  }

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    clearSearch.hidden = !query;
    content.querySelectorAll("details.mechanism-entry").forEach(entry => clearEntryAnimation(entry));
    content.replaceChildren();
    renderNavigation();
    if (terms.length) {
      let count = 0;
      parts.forEach(part => {
        const matches = part.sections.filter(section => {
          const text = [part.title, part.subtitle, section.title, section.purpose, section.input, section.process, section.output, section.boundary]
            .flatMap(value => [value.zh, value.en]).join(" ").toLocaleLowerCase();
          return terms.every(term => text.includes(term));
        });
        if (!matches.length) return;
        const group = element("section", "guide-search-group");
        group.append(chapterHeader(part, true));
        matches.forEach(section => group.append(mechanismEntry(part, section)));
        group.querySelectorAll("details").forEach(entry => { entry.open = true; });
        content.append(group);
        count += matches.length;
      });
      if (!count) content.append(bilingual("p", "guide-empty", { zh: "未找到相关机制。", en: "No matching mechanisms." }));
      announceCount(count, true);
      finishRender();
      return;
    }
    content.append(chapterHeader(selectedPart));
    selectedPart.sections.forEach(section => {
      const entry = mechanismEntry(selectedPart, section);
      entry.open = true;
      content.append(entry);
    });
    const chapterNavigation = element("nav", "guide-chapter-pagination");
    const currentIndex = parts.indexOf(selectedPart);
    for (const offset of [-1, 1]) {
      const adjacent = parts[currentIndex + offset];
      if (!adjacent) {
        chapterNavigation.append(element("span"));
        continue;
      }
      const link = element("a");
      link.href = "#" + adjacent.id;
      const arrow = icon("arrow-right", offset < 0 ? "arrow-back" : "");
      if (offset < 0) link.append(arrow);
      link.append(bilingual("span", "", labels[adjacent.id]));
      if (offset > 0) link.append(arrow);
      chapterNavigation.append(link);
    }
    content.append(chapterNavigation);
    announceCount(selectedPart.sections.length, false);
    finishRender();
  }

  function followHash(scroll = true) {
    const key = window.location.hash.slice(1);
    if (key === "main") return;
    const target = index.get(key) || index.get("v4");
    if (!target) return;
    const mustRender = selectedPart.id !== target.part.id || search.value.trim() || !content.children.length;
    selectedPart = target.part;
    search.value = "";
    if (mustRender) render();
    const section = target.section && document.getElementById(target.section.id);
    const opened = section ? setEntryOpen(section, true) : Promise.resolve();
    if (scroll) opened.then(() => {
      requestAnimationFrame(() => {
        (section || document.querySelector(".guide-reading")).scrollIntoView({ behavior: "instant", block: "start" });
        queueCurrentMechanism();
      });
    });
  }

  content.addEventListener("click", event => {
    const summary = event.target instanceof Element ? event.target.closest("summary.mechanism-summary") : null;
    if (!summary || !content.contains(summary)) return;
    const entry = summary.parentElement;
    event.preventDefault();
    setEntryOpen(entry, !(entry._targetOpen ?? entry.open));
  });
  content.addEventListener("toggle", event => {
    const entry = event.target;
    if (!(entry instanceof HTMLDetailsElement) || !entry.classList.contains("mechanism-entry") || entry._targetOpen === undefined) return;
    if (entry.open !== entry._targetOpen) setEntryOpen(entry, entry.open);
  }, true);

  search.addEventListener("input", () => {
    render();
    if (content.getBoundingClientRect().top < 100) {
      document.querySelector(".guide-reading").scrollIntoView({ behavior: "instant", block: "start" });
    }
  });
  clearSearch.addEventListener("click", () => {
    search.value = "";
    render();
    search.focus();
  });
  expand.addEventListener("click", () => content.querySelectorAll("details").forEach(entry => setEntryOpen(entry, true)));
  collapse.addEventListener("click", () => content.querySelectorAll("details").forEach(entry => setEntryOpen(entry, false)));
  window.addEventListener("scroll", queueCurrentMechanism, { passive: true });
  window.addEventListener("resize", () => {
    content.querySelectorAll("details.mechanism-entry").forEach(entry => {
      clearEntryAnimation(entry);
      if (entry._targetOpen !== undefined) entry.open = entry._targetOpen;
    });
    contentAnimation?.cancel();
    contentAnimation = null;
    queueCurrentMechanism();
  });
  document.addEventListener("mmla:languagechange", () => {
    content.querySelectorAll("details.mechanism-entry").forEach(entry => {
      clearEntryAnimation(entry);
      if (entry._targetOpen !== undefined) entry.open = entry._targetOpen;
    });
    contentAnimation?.cancel();
    contentAnimation = null;
    queueCurrentMechanism();
  });
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    content.querySelectorAll("details.mechanism-entry").forEach(entry => {
      clearEntryAnimation(entry);
      if (entry._targetOpen !== undefined) entry.open = entry._targetOpen;
    });
    contentAnimation?.cancel();
    contentAnimation = null;
    queueCurrentMechanism();
  });
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !index.has(link.hash.slice(1))) return;
    if (window.location.hash === link.hash) {
      event.preventDefault();
      followHash();
    }
  });
  window.addEventListener("hashchange", () => followHash());
  [{ id: "search", label: { zh: "全部论文 · 搜索结果", en: "All papers · Search results" } }, ...parts.map(part => ({ id: part.id, label: labels[part.id] }))].forEach(({ id, label }) => {
    const option = element("option", "", document.body.dataset.lang === "en" ? label.en : label.zh);
    option.value = id;
    option.dataset.textZh = label.zh;
    option.dataset.textEn = label.en;
    option.disabled = id === "search";
    option.hidden = id === "search";
    chapterSelect.append(option);
  });
  chapterSelect.addEventListener("change", () => {
    const hash = "#" + chapterSelect.value;
    if (window.location.hash === hash) followHash();
    else window.location.hash = hash;
  });
  document.querySelector("#guide-total").textContent = parts.length + " / " + parts.reduce((sum, part) => sum + part.sections.length, 0);
  render();
  followHash(Boolean(window.location.hash));
})();
