(() => {
  "use strict";

  const body = document.body;
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const menuToggle = document.querySelector("#menu-toggle");
  const siteNav = document.querySelector("#site-nav");
  const navLinks = siteNav ? [...siteNav.querySelectorAll('a[href^="#"]')] : [];
  const diagram = document.querySelector("#diagram-dialog");
  const stage = document.querySelector("#diagram-stage");
  const fullImage = document.querySelector("#diagram-full-image");
  const zoomIn = document.querySelector("#zoom-in");
  const zoomOut = document.querySelector("#zoom-out");
  const zoomReset = document.querySelector("#zoom-reset");
  const zoomLevel = document.querySelector("#zoom-level");
  const copyButton = document.querySelector("#copy-citation");
  const copyStatus = document.querySelector("#copy-status");
  const zoomSteps = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6];
  let zoomIndex = 2;
  let fitWidth = 1;
  let dialogOpener = null;
  let previousOverflow = "";
  let copyOutcome = "";
  let selectedModel = "qwen";
  let selectedLength = "extended";

  const results = {
    qwen: {
      extended: { full: [0.715, 12646], dense: [0.753, 1338], bm25: [0.771, 1330], mmla: [[0.813, 0.830], 1368] },
      natural: { full: [0.805, 1521], dense: [0.594, 425], bm25: [0.701, 430], mmla: [[0.755, 0.760], 428] },
    },
    llama: {
      extended: { full: [0.666, 12024], dense: [0.621, 1300], bm25: [0.636, 1293], mmla: [[0.677, 0.684], 1325] },
      natural: { full: [0.714, 1477], dense: [0.516, 432], bm25: [0.601, 437], mmla: [[0.659, 0.663], 434] },
    },
  };

  const isEnglish = () => body.dataset.lang === "en";

  function closeMenu(restoreFocus = false) {
    if (!siteNav || !menuToggle) return;
    const wasOpen = siteNav.classList.contains("is-open");
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    if (wasOpen && restoreFocus) menuToggle.focus();
  }

  function updateResults(announce = false) {
    const current = results[selectedModel][selectedLength];
    const formatter = new Intl.NumberFormat(isEnglish() ? "en-US" : "zh-CN");
    document.querySelectorAll("#results-body [data-method]").forEach((row) => {
      const entry = current[row.dataset.method];
      if (!entry) return;
      const [f1, tokens] = entry;
      const values = Array.isArray(f1) ? f1 : [f1];
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      const score = row.querySelector("[data-result-f1]");
      const tokenCount = row.querySelector("[data-result-tokens]");
      const fill = row.querySelector(".result-fill");
      if (score) score.textContent = values.map((value) => value.toFixed(3)).join("\u2013");
      if (tokenCount) tokenCount.textContent = formatter.format(tokens);
      if (fill) fill.style.width = `${mean * 100}%`;
    });
    document.querySelectorAll("[data-model], [data-length]").forEach((button) => {
      const active = button.hasAttribute("data-model")
        ? button.dataset.model === selectedModel
        : button.dataset.length === selectedLength;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const model = selectedModel === "qwen" ? "Qwen2.5-14B" : "Llama-3.1-8B";
    const context = selectedLength === "extended"
      ? (isEnglish() ? "Extended context (8.2k words)" : "\u6269\u5c55\u4e0a\u4e0b\u6587\uff08\u7ea6 8,200 \u8bcd\uff09")
      : (isEnglish() ? "Natural context" : "\u81ea\u7136\u4e0a\u4e0b\u6587");
    const caption = `${model} \u00b7 ${context}`;
    const captionElement = document.querySelector("#results-caption");
    const status = document.querySelector("#results-status");
    if (captionElement) captionElement.textContent = caption;
    if (status && (announce || status.textContent)) status.textContent = caption;
  }

  function updateCopyStatus() {
    if (!copyStatus) return;
    const messages = {
      success: isEnglish() ? "Citation copied" : "\u5f15\u7528\u5df2\u590d\u5236",
      error: isEnglish() ? "Copy failed" : "\u590d\u5236\u5931\u8d25",
      pending: isEnglish() ? "Copying citation" : "\u6b63\u5728\u590d\u5236\u5f15\u7528",
    };
    copyStatus.textContent = messages[copyOutcome] || "";
  }

  function setLanguage(value, updateUrl = false) {
    const language = value === "en" ? "en" : "zh";
    body.dataset.lang = language;
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    document.title = language === "en"
      ? "MMLAv4 | Memory-Mediated Learning Architecture"
      : "MMLAv4 | \u8bb0\u5fc6\u4ecb\u5bfc\u5b66\u4e60\u67b6\u6784";
    languageButtons.forEach((button) => {
      const active = button.dataset.language === language;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
    document.querySelectorAll("[data-label-zh][data-label-en]").forEach((element) => {
      const label = language === "en" ? element.dataset.labelEn : element.dataset.labelZh;
      element.setAttribute("aria-label", label);
      element.setAttribute("title", label);
      if (element.tagName === "IMG") element.alt = label;
    });
    document.querySelectorAll("#architecture-image, #diagram-full-image").forEach((image) => {
      image.src = `assets/mmla-v4-architecture-${language}.png`;
    });
    document.querySelectorAll("[data-diagram-download]").forEach((link) => {
      const format = link.dataset.diagramDownload;
      if (format !== "svg" && format !== "png") return;
      const filename = `mmla-v4-architecture-${language}.${format}`;
      link.href = `assets/${filename}`;
      link.download = filename;
    });
    try {
      localStorage.setItem("mmla-language", language);
    } catch (_) {
      // Language switching also works when browser storage is unavailable.
    }
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.set("lang", language);
        history.replaceState(history.state, "", url);
      }
    }
    updateResults();
    updateCopyStatus();
    requestAnimationFrame(updateNavigation);
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language, true));
  });

  const flowRoot = document.querySelector("#mechanism-explorer");
  const flowTabs = flowRoot ? [...flowRoot.querySelectorAll("[data-flow-step]")] : [];
  const flowPanel = document.querySelector("#flow-panel");
  const flowCopies = flowRoot ? [...flowRoot.querySelectorAll("[data-flow-copy]")] : [];
  const flowScenes = flowRoot ? [...flowRoot.querySelectorAll("[data-flow-scene]")] : [];
  const flowCounter = document.querySelector("#flow-counter");
  const flowPrevious = document.querySelector("#flow-previous");
  const flowNext = document.querySelector("#flow-next");
  const flowSteps = ["read", "adapt", "consolidate", "publish"];
  if (flowRoot && flowPanel && flowTabs.length) {
    const tabsByStep = new Map(flowTabs.map((tab) => [tab.dataset.flowStep, tab]));
    const activateFlowStep = (step) => {
      const index = flowSteps.indexOf(step);
      if (index < 0 || !tabsByStep.has(step)) return;
      const focusedElement = document.activeElement;
      flowRoot.dataset.step = step;
      flowTabs.forEach((tab) => {
        const selected = tab.dataset.flowStep === step;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      flowPanel.setAttribute("aria-labelledby", tabsByStep.get(step).id);
      flowCopies.forEach((copy) => { copy.hidden = copy.dataset.flowCopy !== step; });
      flowScenes.forEach((scene) => { scene.hidden = scene.dataset.flowScene !== step; });
      if (flowCounter) flowCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(flowSteps.length).padStart(2, "0")}`;
      if (flowPrevious) flowPrevious.disabled = index === 0;
      if (flowNext) flowNext.disabled = index === flowSteps.length - 1;
      if (focusedElement === flowPrevious && flowPrevious?.disabled) flowNext?.focus({ preventScroll: true });
      if (focusedElement === flowNext && flowNext?.disabled) flowPrevious?.focus({ preventScroll: true });
    };
    flowTabs.forEach((tab) => {
      tab.addEventListener("click", () => activateFlowStep(tab.dataset.flowStep));
      tab.addEventListener("keydown", (event) => {
        const current = flowSteps.indexOf(tab.dataset.flowStep);
        const destinations = {
          ArrowLeft: (current + flowSteps.length - 1) % flowSteps.length,
          ArrowRight: (current + 1) % flowSteps.length,
          Home: 0,
          End: flowSteps.length - 1,
        };
        if (!(event.key in destinations)) return;
        event.preventDefault();
        const target = tabsByStep.get(flowSteps[destinations[event.key]]);
        if (target) {
          activateFlowStep(target.dataset.flowStep);
          target.focus();
        }
      });
    });
    flowPrevious?.addEventListener("click", () => {
      const index = flowSteps.indexOf(flowRoot.dataset.step);
      if (index > 0) activateFlowStep(flowSteps[index - 1]);
    });
    flowNext?.addEventListener("click", () => {
      const index = flowSteps.indexOf(flowRoot.dataset.step);
      if (index >= 0 && index < flowSteps.length - 1) activateFlowStep(flowSteps[index + 1]);
    });
    activateFlowStep(flowSteps.includes(flowRoot.dataset.step) ? flowRoot.dataset.step : "read");
  }

  const memoryOutcomeButtons = flowRoot ? [...flowRoot.querySelectorAll("[data-memory-outcome]")] : [];
  if (flowRoot && memoryOutcomeButtons.length) {
    const updateMemoryOutcome = (outcome) => {
      if (outcome !== "write" && outcome !== "null") return;
      flowRoot.dataset.outcome = outcome;
      memoryOutcomeButtons.forEach((button) => {
        const active = button.dataset.memoryOutcome === outcome;
        button.setAttribute("aria-pressed", String(active));
        button.classList.toggle("is-active", active);
      });
      flowRoot.querySelectorAll("[data-outcome-copy]").forEach((copy) => {
        copy.hidden = copy.dataset.outcomeCopy !== outcome;
      });
    };
    memoryOutcomeButtons.forEach((button) => {
      button.addEventListener("click", () => updateMemoryOutcome(button.dataset.memoryOutcome));
    });
    updateMemoryOutcome(flowRoot.dataset.outcome === "null" ? "null" : "write");
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const open = !siteNav.classList.contains("is-open");
      siteNav.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      if (open) navLinks[0]?.focus();
    });
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const wasOpen = siteNav.classList.contains("is-open");
        closeMenu();
        const target = document.getElementById(link.hash.slice(1));
        if (wasOpen && target) {
          if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
          target.focus({ preventScroll: true });
        }
      });
    });
    document.addEventListener("click", (event) => {
      if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    document.addEventListener("focusin", (event) => {
      if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
        event.preventDefault();
        closeMenu(true);
      }
    });
  }

  function renderZoom(preserveCenter = true) {
    if (!stage || !fullImage) return;
    const centerX = (stage.scrollLeft + stage.clientWidth / 2) / Math.max(1, stage.scrollWidth);
    const centerY = (stage.scrollTop + stage.clientHeight / 2) / Math.max(1, stage.scrollHeight);
    fullImage.style.width = `${fitWidth * zoomSteps[zoomIndex]}px`;
    fullImage.style.maxWidth = "none";
    fullImage.style.height = "auto";
    if (zoomLevel) zoomLevel.textContent = `${Math.round(zoomSteps[zoomIndex] * 100)}%`;
    if (zoomIn) zoomIn.disabled = zoomIndex === zoomSteps.length - 1;
    if (zoomOut) zoomOut.disabled = zoomIndex === 0;
    if (zoomReset) zoomReset.disabled = zoomIndex === 2;
    stage.scrollLeft = preserveCenter ? centerX * stage.scrollWidth - stage.clientWidth / 2 : 0;
    stage.scrollTop = preserveCenter ? centerY * stage.scrollHeight - stage.clientHeight / 2 : 0;
  }

  function fitDiagram() {
    if (!stage || !diagram?.open) return;
    const style = getComputedStyle(stage);
    fitWidth = Math.max(1, stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    renderZoom(false);
  }

  const openDiagram = document.querySelector("#open-diagram");
  const previewDiagram = document.querySelector(".diagram-preview");
  const closeDiagram = document.querySelector("#close-diagram");
  if (diagram && stage && fullImage && openDiagram) {
    const showDiagram = () => {
      if (diagram.open) return;
      dialogOpener = document.activeElement;
      previousOverflow = body.style.overflow;
      zoomIndex = 2;
      diagram.showModal();
      body.style.overflow = "hidden";
      fitDiagram();
    };
    openDiagram.addEventListener("click", showDiagram);
    previewDiagram?.addEventListener("click", showDiagram);
    const hideDiagram = () => {
      body.style.overflow = previousOverflow;
      diagram.close();
    };
    closeDiagram?.addEventListener("click", hideDiagram);
    diagram.addEventListener("cancel", (event) => {
      event.preventDefault();
      hideDiagram();
    });
    diagram.addEventListener("click", (event) => {
      if (event.target !== diagram) return;
      const bounds = diagram.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        hideDiagram();
      }
    });
    diagram.addEventListener("close", () => {
      if (diagram.open) return;
      body.style.overflow = previousOverflow;
      if (dialogOpener?.isConnected) dialogOpener.focus({ preventScroll: true });
    });
    fullImage.addEventListener("load", fitDiagram);
    zoomIn?.addEventListener("click", () => {
      zoomIndex = Math.min(zoomSteps.length - 1, zoomIndex + 1);
      renderZoom();
    });
    zoomOut?.addEventListener("click", () => {
      zoomIndex = Math.max(0, zoomIndex - 1);
      renderZoom();
    });
    zoomReset?.addEventListener("click", () => {
      zoomIndex = 2;
      renderZoom(false);
    });
  }

  document.querySelectorAll("[data-model]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!Object.hasOwn(results, button.dataset.model)) return;
      selectedModel = button.dataset.model;
      updateResults(true);
    });
  });
  document.querySelectorAll("[data-length]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!Object.hasOwn(results[selectedModel], button.dataset.length)) return;
      selectedLength = button.dataset.length;
      updateResults(true);
    });
  });

  function fallbackCopy(value) {
    const focused = document.activeElement;
    const selection = window.getSelection();
    const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : [];
    const inputSelection = focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement
      ? { start: focused.selectionStart, end: focused.selectionEnd, direction: focused.selectionDirection }
      : null;
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.readOnly = true;
    helper.tabIndex = -1;
    Object.assign(helper.style, { position: "fixed", top: "0", left: "-9999px", opacity: "0" });
    body.append(helper);
    try {
      helper.focus({ preventScroll: true });
      helper.select();
      return document.execCommand("copy") === true;
    } catch (_) {
      return false;
    } finally {
      helper.remove();
      if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
      if (selection) {
        selection.removeAllRanges();
        ranges.forEach((range) => selection.addRange(range));
      }
      if (inputSelection && inputSelection.start !== null) {
        focused.setSelectionRange(inputSelection.start, inputSelection.end, inputSelection.direction);
      }
    }
  }

  copyButton?.addEventListener("click", async () => {
    const value = document.querySelector("#bibtex")?.textContent.trim();
    if (!value) {
      copyOutcome = "error";
      updateCopyStatus();
      return;
    }
    const wasDisabled = copyButton.disabled;
    const focusedBeforeCopy = document.activeElement;
    copyButton.disabled = true;
    copyButton.setAttribute("aria-busy", "true");
    copyOutcome = "pending";
    updateCopyStatus();
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(value);
          copied = true;
        } catch (_) {
          copied = fallbackCopy(value);
        }
      } else {
        copied = fallbackCopy(value);
      }
    } finally {
      copyButton.disabled = wasDisabled;
      copyButton.removeAttribute("aria-busy");
      copyOutcome = copied ? "success" : "error";
      updateCopyStatus();
      if (focusedBeforeCopy === copyButton && document.activeElement === body) {
        copyButton.focus({ preventScroll: true });
      }
    }
  });

  function updateNavigation() {
    const header = document.querySelector(".site-header, .topbar, header");
    const offset = (header?.getBoundingClientRect().height || 72) + 24;
    let active = navLinks[0];
    navLinks.forEach((link) => {
      const section = document.getElementById(link.hash.slice(1));
      if (section && section.getBoundingClientRect().top <= offset) active = link;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) active = navLinks.at(-1);
    navLinks.forEach((link) => {
      const current = link === active;
      link.classList.toggle("is-active", current);
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  const hashAliases = { technology: "architecture", documents: "papers", "theory-family": "papers", review: "papers", why: "overview", roadmap: "implementation" };
  function resolveLegacyHash() {
    const replacement = hashAliases[window.location.hash.slice(1)];
    const target = replacement && document.getElementById(replacement);
    if (!target) return;
    const url = new URL(window.location.href);
    url.hash = replacement;
    history.replaceState(history.state, "", url);
    requestAnimationFrame(() => target.scrollIntoView({ behavior: "instant" }));
  }

  let scrollPending = false;
  window.addEventListener("scroll", () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      updateNavigation();
      scrollPending = false;
    });
  }, { passive: true });
  window.addEventListener("resize", () => {
    if (menuToggle && getComputedStyle(menuToggle).display === "none") closeMenu();
    fitDiagram();
    updateNavigation();
  });
  window.addEventListener("hashchange", resolveLegacyHash);
  window.addEventListener("load", updateNavigation, { once: true });

  let savedLanguage;
  try {
    savedLanguage = localStorage.getItem("mmla-language");
  } catch (_) {
    savedLanguage = null;
  }
  const requestedLanguage = new URL(window.location.href).searchParams.get("lang");
  const initialLanguage = ["zh", "en"].includes(requestedLanguage) ? requestedLanguage : savedLanguage;
  setLanguage(initialLanguage);
  resolveLegacyHash();
})();
