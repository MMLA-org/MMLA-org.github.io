(() => {
  "use strict";
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const running = new Map();
  const ease = "cubic-bezier(.22, 1, .36, 1)";

  function animate(node, frames, options = {}) {
    if (!node) return null;
    running.get(node)?.cancel();
    if (preference.matches || !node.animate) return null;
    const animation = node.animate(frames, { duration: 360, easing: ease, ...options });
    running.set(node, animation);
    const release = () => { if (running.get(node) === animation) running.delete(node); };
    animation.finished.then(release, release);
    return animation;
  }

  function enter(nodes, { distance = 10, stagger = 35, duration = 380 } = {}) {
    [...nodes].forEach((node, i) => animate(node,
      [{ opacity: 0, transform: "translateY(" + distance + "px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration, delay: i * stagger, fill: "backwards" }));
  }

  window.MMLAMotion = { animate, enter, get reduced() { return preference.matches; } };
  preference.addEventListener("change", () => {
    if (preference.matches) running.forEach(animation => animation.cancel());
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running.forEach(animation => animation.cancel());
  });
  document.addEventListener("mmla:languagechange", () => {
    running.forEach(animation => animation.cancel());
  });

  const header = document.querySelector(".site-header");
  const progress = document.createElement("span");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  header?.append(progress);
  let scheduled = false;
  function updateProgress() {
    const length = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = "scaleX(" + (length > 0 ? Math.min(1, Math.max(0, scrollY / length)) : 0) + ")";
    header?.classList.toggle("has-scrolled", scrollY > 20);
    scheduled = false;
  }
  function scheduleProgress() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
  }
  addEventListener("scroll", scheduleProgress, { passive: true });
  addEventListener("resize", scheduleProgress);
  if ("ResizeObserver" in window) new ResizeObserver(scheduleProgress).observe(document.body);

  // Content always exists visibly in CSS. Entering the viewport supplies one
  // short animation; browser or script failure never leaves text hidden.
  const observed = new WeakSet();
  const pendingReveal = new Set();
  const reveal = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal.unobserve(entry.target);
      pendingReveal.delete(entry.target);
      const node = entry.target;
      if (node.matches(".state-study")) playStudy();
      else if (node.matches(".mechanism-figure")) {
        enter(node.querySelectorAll(".mf-lane, .mf-node, .mf-row-part, .mf-admission-grid, .mf-dual-wrap"),
          { distance: 7, stagger: 60, duration: 440 });
      } else {
        enter([node], { distance: 12, duration: 500 });
        node.querySelectorAll(".result-fill").forEach(bar => animate(bar,
          [{ transform: "scaleX(0)", transformOrigin: "left" }, { transform: "scaleX(1)", transformOrigin: "left" }],
          { duration: 600 }));
      }
    });
  }, { threshold: .08, rootMargin: "0px 0px -24px 0px" }) : null;
  function observeContent() {
    pendingReveal.forEach(node => {
      if (!node.isConnected) {
        reveal?.unobserve(node);
        pendingReveal.delete(node);
      }
    });
    document.querySelectorAll(".section-heading, .state-definitions, .update-schedule, .worked-example, .admission-section, .paper-guide-heading, .paper-guide-topics, .architecture-principles, .evidence-stats, .results-section, .featured-paper, .companion-head, .mechanism-figure, .state-study").forEach(node => {
      if (observed.has(node)) return;
      observed.add(node);
      if (reveal) { pendingReveal.add(node); reveal.observe(node); }
    });
    scheduleProgress();
  }
  document.addEventListener("mmla:contentchange", observeContent);

  const study = document.querySelector(".state-study");
  const studyButtons = [...document.querySelectorAll("[data-study-path]")];
  function playStudy() {
    if (!study) return;
    study.querySelectorAll("*").forEach(node => running.get(node)?.cancel());
    const path = study.dataset.path;
    const lane = ".study-" + path;
    const input = study.querySelector(lane + ".study-input-wire i");
    const output = study.querySelector(lane + ".study-output-wire i");
    animate(input, [{ transform: "scaleX(0)", opacity: 1, offset: 0 }, { transform: "scaleX(1)", opacity: 1, offset: .6 }, { transform: "scaleX(1)", opacity: 0, offset: 1 }],
      { duration: 700 });
    animate(study.querySelector(lane + ".study-trigger .study-point"),
      [{ boxShadow: "0 0 0 0px transparent" }, { boxShadow: "0 0 0 5px " + (path === "policy" ? "#4168a020" : "#27634b20") }, { boxShadow: "0 0 0 0px transparent" }],
      { duration: 700 });
    if (path === "policy") {
      study.querySelectorAll(".study-values i").forEach((bar, i) => animate(bar,
        [{ transform: "scaleY(.35)" }, { transform: "scaleY(" + (.6 + (i % 3) * .2) + ")" }, { transform: "scaleY(1)" }],
        { duration: 500, delay: 240 + i * 28, fill: "backwards" }));
    } else {
      animate(study.querySelector(".study-write-row"),
        [{ backgroundColor: "#eef2ef", transform: "translateX(-5px)" }, { backgroundColor: "#aecdbb", transform: "translateX(0)" }, { backgroundColor: "#dae9e0", transform: "translateX(0)" }],
        { duration: 600, delay: 260, fill: "backwards" });
    }
    animate(output, [{ transform: "scaleX(0)", opacity: 1 }, { transform: "scaleX(1)", opacity: 1 }, { transform: "scaleX(1)", opacity: 0 }],
      { duration: 600, delay: 610, fill: "backwards" });
    animate(study.querySelector(".study-reader-symbol"),
      [{ opacity: .45, transform: "translateY(3px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 400, delay: 820, fill: "backwards" });
  }
  studyButtons.forEach(button => button.addEventListener("click", () => {
    study.dataset.path = button.dataset.studyPath;
    studyButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    study.querySelectorAll("[data-study-copy]").forEach(copy => { copy.hidden = copy.dataset.studyCopy !== study.dataset.path; });
    playStudy();
    enter(study.querySelectorAll("[data-study-copy]:not([hidden])"), { distance: 4, duration: 260 });
  }));
  document.querySelector("#study-replay")?.addEventListener("click", playStudy);

  // Give the tab underline a single moving element across all four stages.
  const tabs = document.querySelector(".flow-tabs");
  const marker = tabs && document.createElement("span");
  if (marker) { marker.className = "flow-tab-marker"; marker.setAttribute("aria-hidden", "true"); tabs.append(marker); }
  function positionMarker() {
    const active = tabs?.querySelector('[aria-selected="true"]');
    if (!active) return;
    marker.style.setProperty("--tab-left", active.offsetLeft + "px");
    marker.style.setProperty("--tab-width", active.offsetWidth + "px");
  }
  document.addEventListener("mmla:flowchange", event => {
    positionMarker();
    if (!event.detail.animate) return;
    const { step } = event.detail;
    const copy = document.querySelector('[data-flow-copy="' + step + '"]');
    const scene = document.querySelector('[data-flow-scene="' + step + '"]');
    document.querySelectorAll("[data-flow-copy], [data-flow-scene] *").forEach(node => running.get(node)?.cancel());
    enter([copy], { distance: 7, duration: 280 });
    const parts = {
      read: ".read-pair, .merge-connector, .reasoning-node, .scene-caption",
      adapt: ".feedback-source, .vertical-arrow, .policy-update, .unchanged-states, .scene-caption",
      consolidate: ".completed-segment, .candidate-fields > div, .scene-caption",
      publish: ".memory-choice, .memory-ledger, .scene-caption:not([hidden]), .later-read:not([hidden])",
    };
    enter(scene.querySelectorAll(parts[step]), { distance: 7, stagger: 38, duration: 340 });
  });
  document.addEventListener("mmla:outcomechange", event => {
    if (!event.detail.animate) return;
    const root = document.querySelector("#mechanism-explorer");
    const row = root.querySelector(".target-row");
    animate(row, [{ opacity: .45 }, { opacity: 1 }], { duration: 280 });
    enter(root.querySelectorAll('.later-read:not([hidden])'), { distance: 4, duration: 240 });
  });
  addEventListener("resize", positionMarker);
  document.addEventListener("mmla:languagechange", () => requestAnimationFrame(positionMarker));
  document.addEventListener("DOMContentLoaded", () => {
    if (!location.hash) enter(document.querySelectorAll(".lead-topline, .lead-heading, .lead-description, .lead-actions, .guide-masthead"), { distance: 10, stagger: 55, duration: 550 });
    observeContent();
    positionMarker();
  });
})();
