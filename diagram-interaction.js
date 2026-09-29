(() => {
  "use strict";

  const dialog = document.querySelector("#diagram-dialog");
  const stage = document.querySelector("#diagram-stage");
  const image = document.querySelector("#diagram-full-image");
  const zoomIn = document.querySelector("#zoom-in");
  const zoomOut = document.querySelector("#zoom-out");
  const zoomReset = document.querySelector("#zoom-reset");
  const zoomLevel = document.querySelector("#zoom-level");
  if (!dialog || !stage || !image || !zoomIn || !zoomOut || !zoomReset || !zoomLevel) return;
  dialog.classList.add("diagram-interaction-ready");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const setStageLabel = (language = document.body.dataset.lang) => {
    stage.dataset.labelZh = "架构图。双击切换适配宽度和 200% 放大；拖动平移，也可使用缩放按钮。";
    stage.dataset.labelEn = "Architecture diagram. Double-click to toggle fit and 200%; drag to pan or use the zoom controls.";
    stage.setAttribute("aria-label", language === "en" ? stage.dataset.labelEn : stage.dataset.labelZh);
  };
  let activePointer = null;
  let dragOrigin = null;
  let lastPoint = null;
  let dragVelocity = { x: 0, y: 0 };
  let inertiaFrame = 0;
  let moved = false;

  stage.tabIndex = 0;
  setStageLabel();
  image.draggable = false;
  document.addEventListener("mmla:languagechange", (event) => setStageLabel(event.detail?.language));

  const hasOverflow = () => (
    stage.scrollWidth > stage.clientWidth + 1 ||
    stage.scrollHeight > stage.clientHeight + 1
  );

  const updatePanState = () => {
    stage.classList.toggle("diagram-pan-ready", dialog.open && hasOverflow());
  };

  const stopInertia = () => {
    if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
    inertiaFrame = 0;
    dragVelocity = { x: 0, y: 0 };
  };

  const startInertia = () => {
    if (reducedMotion.matches || (!dragVelocity.x && !dragVelocity.y)) return;
    const tick = () => {
      stage.scrollLeft += dragVelocity.x;
      stage.scrollTop += dragVelocity.y;
      const maxLeft = Math.max(0, stage.scrollWidth - stage.clientWidth);
      const maxTop = Math.max(0, stage.scrollHeight - stage.clientHeight);
      if (stage.scrollLeft <= 0 || stage.scrollLeft >= maxLeft) dragVelocity.x = 0;
      if (stage.scrollTop <= 0 || stage.scrollTop >= maxTop) dragVelocity.y = 0;
      dragVelocity.x *= 0.93;
      dragVelocity.y *= 0.93;
      if (Math.abs(dragVelocity.x) < 0.08 && Math.abs(dragVelocity.y) < 0.08) {
        stopInertia();
        updatePanState();
        return;
      }
      inertiaFrame = requestAnimationFrame(tick);
    };
    inertiaFrame = requestAnimationFrame(tick);
  };

  const zoomByButton = (direction) => {
    const button = direction > 0 ? zoomIn : zoomOut;
    if (!button.disabled) button.click();
    updatePanState();
  };

  const fitOrMagnify = () => {
    const current = Number.parseInt(zoomLevel.value || zoomLevel.textContent, 10) || 100;
    if (current >= 200) {
      zoomReset.click();
      return;
    }
    while (!zoomIn.disabled) {
      const level = Number.parseInt(zoomLevel.value || zoomLevel.textContent, 10) || 100;
      if (level >= 200) break;
      zoomIn.click();
    }
    updatePanState();
  };

  stage.addEventListener("pointerdown", (event) => {
    if (!dialog.open || !stage.classList.contains("diagram-pan-ready")) return;
    if (event.button !== 0 || !image.contains(event.target)) return;
    stopInertia();
    activePointer = event.pointerId;
    moved = false;
    lastPoint = { x: event.clientX, y: event.clientY };
    dragVelocity = { x: 0, y: 0 };
    dragOrigin = {
      x: event.clientX,
      y: event.clientY,
      left: stage.scrollLeft,
      top: stage.scrollTop,
    };
    stage.classList.add("diagram-panning");
    stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  stage.addEventListener("pointermove", (event) => {
    if (activePointer !== event.pointerId || !dragOrigin) return;
    const dx = event.clientX - dragOrigin.x;
    const dy = event.clientY - dragOrigin.y;
    const stepX = event.clientX - lastPoint.x;
    const stepY = event.clientY - lastPoint.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    stage.scrollLeft = dragOrigin.left - dx;
    stage.scrollTop = dragOrigin.top - dy;
    dragVelocity.x = dragVelocity.x * 0.62 - stepX * 0.38;
    dragVelocity.y = dragVelocity.y * 0.62 - stepY * 0.38;
    lastPoint = { x: event.clientX, y: event.clientY };
  });

  const finishPan = (event) => {
    if (activePointer !== event.pointerId) return;
    const wasMoved = moved;
    activePointer = null;
    dragOrigin = null;
    lastPoint = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    stage.classList.remove("diagram-panning");
    updatePanState();
    if (wasMoved) startInertia();
  };
  stage.addEventListener("pointerup", finishPan);
  stage.addEventListener("pointercancel", finishPan);
  stage.addEventListener("lostpointercapture", finishPan);

  stage.addEventListener("dragstart", (event) => event.preventDefault());
  stage.addEventListener("dblclick", (event) => {
    if (event.target !== image) return;
    event.preventDefault();
    fitOrMagnify();
  });

  stage.addEventListener("click", (event) => {
    if (!moved) return;
    moved = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  stage.addEventListener("wheel", (event) => {
    if (!dialog.open || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();

    const stageRect = stage.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const anchorX = Math.max(0, Math.min(1, (event.clientX - imageRect.left) / Math.max(1, imageRect.width)));
    const anchorY = Math.max(0, Math.min(1, (event.clientY - imageRect.top) / Math.max(1, imageRect.height)));
    const pointX = event.clientX - stageRect.left;
    const pointY = event.clientY - stageRect.top;

    zoomByButton(event.deltaY < 0 ? 1 : -1);

    const nextImageRect = image.getBoundingClientRect();
    const anchorAfterX = nextImageRect.left - stageRect.left + anchorX * nextImageRect.width;
    const anchorAfterY = nextImageRect.top - stageRect.top + anchorY * nextImageRect.height;
    stage.scrollLeft += anchorAfterX - pointX;
    stage.scrollTop += anchorAfterY - pointY;
  }, { passive: false });

  [zoomIn, zoomOut, zoomReset].forEach((button) => {
    button.addEventListener("click", () => {
      stopInertia();
      requestAnimationFrame(updatePanState);
    });
  });

  const animateOpen = () => {
    dialog.classList.remove("diagram-interaction-visible");
    updatePanState();
    if (reducedMotion.matches) {
      dialog.classList.add("diagram-interaction-visible");
      return;
    }
    requestAnimationFrame(() => {
      if (dialog.open) dialog.classList.add("diagram-interaction-visible");
    });
  };

  const observer = new MutationObserver(() => {
    if (dialog.open) animateOpen();
    else {
      dialog.classList.remove("diagram-interaction-visible");
      stage.classList.remove("diagram-pan-ready", "diagram-panning");
      stopInertia();
      activePointer = null;
      dragOrigin = null;
      lastPoint = null;
    }
  });
  observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  dialog.addEventListener("close", () => {
    dialog.classList.remove("diagram-interaction-visible");
    stage.classList.remove("diagram-pan-ready", "diagram-panning");
    stopInertia();
  });
  image.addEventListener("load", updatePanState);
  window.addEventListener("resize", updatePanState, { passive: true });
  reducedMotion.addEventListener?.("change", () => {
    if (reducedMotion.matches) {
      stopInertia();
      dialog.classList.add("diagram-interaction-visible");
    }
  });
})();
