(() => {
  "use strict";

  const Matter = window.Matter;
  const study = document.querySelector(".state-study");
  const map = study?.querySelector(".study-map");
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  if (!Matter || !study || !map) return;

  const { Engine, Bodies, Body, Composite, Vector } = Matter;
  const engine = Engine.create({ enableSleeping: false });
  engine.gravity.x = 0;
  engine.gravity.y = 0;
  engine.gravity.scale = 0;
  engine.timing.timeScale = 0.82;

  const canvas = document.createElement("canvas");
  canvas.className = "physics-field";
  canvas.setAttribute("aria-hidden", "true");
  map.prepend(canvas);
  const context = canvas.getContext("2d");
  if (!context) {
    canvas.remove();
    return;
  }

  const lanes = [
    { name: "policy", color: "#0071e3", trigger: ".study-trigger.study-policy", carrier: ".study-carrier.study-policy" },
    { name: "memory", color: "#167d68", trigger: ".study-trigger.study-memory", carrier: ".study-carrier.study-memory" },
  ];
  const motes = [];
  const boundaries = [];
  const cardStates = [];
  const size = { width: 1, height: 1, dpr: 1 };
  const pointer = { x: 0, y: 0, active: false };
  let mapRect = null;
  let running = false;
  let visible = true;
  let frame = 0;
  let resizeFrame = 0;
  let lastTime = 0;
  let pulseStartedAt = 0;
  let pulseUntil = 0;
  let pointerQuietUntil = 0;
  let pulseTimer = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const alpha = (hex, opacity) => {
    const value = hex.replace("#", "");
    const number = Number.parseInt(value, 16);
    return `rgba(${number >> 16}, ${(number >> 8) & 255}, ${number & 255}, ${opacity})`;
  };
  const nodeRect = selector => map.querySelector(selector).getBoundingClientRect();
  const localRect = rect => ({
    left: rect.left - mapRect.left,
    top: rect.top - mapRect.top,
    width: rect.width,
    height: rect.height,
  });

  class Spring {
    constructor(stiffness = 62, damping = 15) {
      this.value = 0;
      this.velocity = 0;
      this.target = 0;
      this.stiffness = stiffness;
      this.damping = damping;
    }

    step(seconds) {
      const acceleration = (this.target - this.value) * this.stiffness - this.velocity * this.damping;
      this.velocity += acceleration * seconds;
      this.value += this.velocity * seconds;
      return this.value;
    }

    reset() {
      this.value = 0;
      this.velocity = 0;
      this.target = 0;
    }
  }

  function initializeCardMotion() {
    study.querySelectorAll(".study-carrier").forEach(card => {
      cardStates.push({ card, x: new Spring(), y: new Spring(), rx: new Spring(), ry: new Spring(), bounds: null });
    });
  }

  function resetCardMotion() {
    cardStates.forEach(state => {
      state.x.reset();
      state.y.reset();
      state.rx.reset();
      state.ry.reset();
      state.card.style.setProperty("--physics-x", "0px");
      state.card.style.setProperty("--physics-y", "0px");
      state.card.style.setProperty("--physics-rx", "0deg");
      state.card.style.setProperty("--physics-ry", "0deg");
    });
  }

  function refreshGeometry() {
    mapRect = map.getBoundingClientRect();
    lanes.forEach(lane => {
      const trigger = localRect(nodeRect(lane.trigger));
      const source = { x: trigger.left + trigger.width / 2, y: trigger.top + trigger.height + 2 };
      const carrier = localRect(nodeRect(lane.carrier));
      const target = { x: carrier.left + carrier.width / 2, y: carrier.top - 2 };
      const difference = Vector.sub(target, source);
      lane.route = {
        source,
        target,
        direction: Vector.normalise(difference),
      };
    });
    cardStates.forEach(state => {
      state.bounds = localRect(state.card.getBoundingClientRect());
    });
  }

  function addBoundaries() {
    boundaries.splice(0).forEach(boundary => Composite.remove(engine.world, boundary));
    const thickness = 42;
    boundaries.push(
      Bodies.rectangle(size.width / 2, -thickness / 2, size.width + thickness * 2, thickness, { isStatic: true }),
      Bodies.rectangle(size.width / 2, size.height + thickness / 2, size.width + thickness * 2, thickness, { isStatic: true }),
      Bodies.rectangle(-thickness / 2, size.height / 2, thickness, size.height + thickness * 2, { isStatic: true }),
      Bodies.rectangle(size.width + thickness / 2, size.height / 2, thickness, size.height + thickness * 2, { isStatic: true }),
    );
    boundaries.forEach(boundary => {
      boundary.collisionFilter.category = 0x0002;
      boundary.collisionFilter.mask = 0x0002;
    });
    Composite.add(engine.world, boundaries);
  }

  function createMotes() {
    Composite.clear(engine.world, false);
    motes.splice(0);
    addBoundaries();
    lanes.forEach(lane => {
      const { source, target, direction } = lane.route;
      const perpendicular = { x: -direction.y, y: direction.x };
      const count = 4;
      for (let index = 0; index < count; index += 1) {
        const progress = (index + 1) / (count + 1);
        const offset = (index % 2 ? 1 : -1) * (4 + (index % 3) * 2);
        const anchor = {
          x: source.x + (target.x - source.x) * progress + perpendicular.x * offset,
          y: source.y + (target.y - source.y) * progress + perpendicular.y * offset,
        };
        const radius = 1.9 + (index % 3) * 0.55;
        const body = Bodies.circle(anchor.x, anchor.y, radius, {
          frictionAir: 0.1,
          restitution: 0.72,
          friction: 0.01,
          density: 0.0012,
          slop: 0.01,
          collisionFilter: { group: 0, category: 0x0002, mask: 0x0002 },
        });
        body.render.visible = false;
        Composite.add(engine.world, body);
        motes.push({ body, anchor, lane: lane.name, color: lane.color, radius, progress, lastPulse: 0, previous: { x: anchor.x, y: anchor.y } });
      }
    });
  }

  function updateCanvasSize() {
    resetCardMotion();
    pointer.active = false;
    const rect = map.getBoundingClientRect();
    size.width = Math.max(1, rect.width);
    size.height = Math.max(1, rect.height);
    size.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size.width * size.dpr);
    canvas.height = Math.round(size.height * size.dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    context.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    refreshGeometry();
    createMotes();
    if (!preference.matches && visible && !document.hidden) drawScene(performance.now());
    else context.clearRect(0, 0, size.width, size.height);
  }

  function drawRoute(lane, now) {
    const { source, target } = lane.route;
    const bend = Math.min(18, Math.max(5, Math.abs(target.y - source.y) * 0.15));
    const control = { x: source.x + (target.x - source.x) * 0.38, y: source.y + bend };
    context.beginPath();
    context.moveTo(source.x, source.y);
    context.quadraticCurveTo(control.x, control.y, target.x, target.y);
    context.strokeStyle = alpha(lane.color, 0.09);
    context.lineWidth = 1;
    context.setLineDash([2, 10]);
    context.lineDashOffset = -(now * 0.004);
    context.stroke();
    context.setLineDash([]);
    if (lane.name !== study.dataset.path || now >= pulseUntil) return;
    const progress = clamp((now - pulseStartedAt) / 1120, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const inverse = 1 - eased;
    const x = inverse * inverse * source.x + 2 * inverse * eased * control.x + eased * eased * target.x;
    const y = inverse * inverse * source.y + 2 * inverse * eased * control.y + eased * eased * target.y;
    context.beginPath();
    context.arc(x, y, 3.7, 0, Math.PI * 2);
    context.fillStyle = alpha(lane.color, (1 - Math.max(0, progress - 0.82) / 0.18) * 0.9);
    context.fill();
  }

  function drawMotes(now) {
    motes.forEach(mote => {
      const { body } = mote;
      const velocity = Vector.sub(body.position, mote.previous);
      const speed = Math.min(1, Vector.magnitude(velocity) * 0.9);
      const emphasized = now < pulseUntil && mote.lane === study.dataset.path;
      if (speed > 0.025) {
        context.beginPath();
        context.moveTo(body.position.x, body.position.y);
        context.lineTo(body.position.x - velocity.x * 6, body.position.y - velocity.y * 6);
        context.strokeStyle = alpha(mote.color, (emphasized ? 0.38 : 0.14) * speed);
        context.lineWidth = emphasized ? 1.35 : 1;
        context.stroke();
      }
      context.beginPath();
      context.arc(body.position.x, body.position.y, mote.radius * (emphasized ? 1.25 : 1), 0, Math.PI * 2);
      context.fillStyle = alpha(mote.color, emphasized ? 0.72 : 0.34 + speed * 0.28);
      context.fill();
      mote.previous.x = body.position.x;
      mote.previous.y = body.position.y;
    });
  }

  function drawScene(now) {
    context.clearRect(0, 0, size.width, size.height);
    lanes.forEach(lane => drawRoute(lane, now));
    drawMotes(now);
  }

  function applyForces(now) {
    const pulseProgress = pulseUntil > now ? clamp((now - pulseStartedAt) / 920, 0, 1) : -1;
    motes.forEach(mote => {
      const { body, anchor } = mote;
      const delta = Vector.sub(anchor, body.position);
      Body.applyForce(body, body.position, Vector.mult(delta, 0.000018));
      if (pointer.active) {
        const fromPointer = Vector.sub(body.position, pointer);
        const distance = Math.max(1, Vector.magnitude(fromPointer));
        if (distance < 135) {
          const strength = (1 - distance / 135) * 0.00014;
          Body.applyForce(body, body.position, Vector.mult(Vector.normalise(fromPointer), strength));
        }
      }
      if (pulseProgress < 0 || mote.lane !== study.dataset.path || now - mote.lastPulse < 110) return;
      if (Math.abs(pulseProgress - mote.progress) > 0.055) return;
      const direction = lanes.find(lane => lane.name === mote.lane).route.direction;
      Body.applyForce(body, body.position, Vector.mult(direction, 0.000085));
      mote.lastPulse = now;
    });
  }

  function updateCardMotion(seconds) {
    cardStates.forEach(state => {
      const bounds = state.bounds;
      const inside = pointer.active && pointer.x >= bounds.left - 40 && pointer.x <= bounds.left + bounds.width + 40 && pointer.y >= bounds.top - 40 && pointer.y <= bounds.top + bounds.height + 40;
      const nx = inside ? clamp((pointer.x - bounds.left - bounds.width / 2) / Math.max(1, bounds.width / 2), -1, 1) : 0;
      const ny = inside ? clamp((pointer.y - bounds.top - bounds.height / 2) / Math.max(1, bounds.height / 2), -1, 1) : 0;
      state.x.target = nx * 4.8;
      state.y.target = ny * 3.2;
      state.rx.target = -ny * 2.2;
      state.ry.target = nx * 3.2;
      state.card.style.setProperty("--physics-x", `${state.x.step(seconds).toFixed(3)}px`);
      state.card.style.setProperty("--physics-y", `${state.y.step(seconds).toFixed(3)}px`);
      state.card.style.setProperty("--physics-rx", `${state.rx.step(seconds).toFixed(3)}deg`);
      state.card.style.setProperty("--physics-ry", `${state.ry.step(seconds).toFixed(3)}deg`);
    });
  }

  function settled(now) {
    if (now < pulseUntil || now < pointerQuietUntil) return false;
    if (cardStates.some(state => [state.x, state.y, state.rx, state.ry].some(spring => Math.abs(spring.target - spring.value) > 0.035 || Math.abs(spring.velocity) > 0.035))) return false;
    return motes.every(mote => {
      const speed = Vector.magnitude(mote.body.velocity);
      if (speed > 0.035) return false;
      if (pointer.active) return true;
      return Vector.magnitude(Vector.sub(mote.body.position, mote.anchor)) < 0.7;
    });
  }

  function tick(now) {
    if (!running) return;
    const elapsed = Math.min(1000 / 60, lastTime ? now - lastTime : 1000 / 60);
    lastTime = now;
    applyForces(now);
    Engine.update(engine, elapsed);
    updateCardMotion(elapsed / 1000);
    drawScene(now);
    if (settled(now)) {
      stop();
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (running || preference.matches || document.hidden || !visible) return;
    running = true;
    study.classList.add("physics-active");
    lastTime = 0;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  }

  function stop(reset = false) {
    running = false;
    cancelAnimationFrame(frame);
    frame = 0;
    study.classList.remove("physics-active");
    if (reset) {
      if (pulseTimer) window.clearTimeout(pulseTimer);
      pulseTimer = 0;
      pulseUntil = 0;
      pulseStartedAt = 0;
      study.classList.remove("physics-pulsing");
      resetCardMotion();
    }
    if (document.hidden || !visible || preference.matches) {
      context.clearRect(0, 0, size.width, size.height);
      return;
    }
    drawScene(performance.now());
  }

  function pulse(path = study.dataset.path) {
    if (preference.matches || !path || !visible || document.hidden) return;
    if (pulseTimer) window.clearTimeout(pulseTimer);
    study.dataset.path = path;
    study.classList.remove("physics-pulsing");
    void study.offsetWidth;
    study.classList.add("physics-pulsing");
    pulseStartedAt = performance.now();
    pulseUntil = pulseStartedAt + 1480;
    const activeCard = cardStates.find(state => state.card.classList.contains(`study-${path}`));
    if (activeCard) activeCard.y.velocity = -125;
    motes.forEach(mote => { mote.lastPulse = 0; });
    pulseTimer = window.setTimeout(() => {
      study.classList.remove("physics-pulsing");
      pulseTimer = 0;
    }, 1510);
    start();
  }

  function scheduleSceneRefresh() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(updateCanvasSize);
  }

  map.addEventListener("pointermove", event => {
    const rect = map.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
    pointerQuietUntil = performance.now() + 220;
    start();
  }, { passive: true });
  map.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointerQuietUntil = 0;
    start();
  });
  document.addEventListener("mmla:studypulse", event => pulse(event.detail?.path));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(true);
    else if (pulseUntil > performance.now()) start();
    else if (visible && !preference.matches) drawScene(performance.now());
  });
  preference.addEventListener("change", () => {
    if (preference.matches) {
      stop(true);
    } else if (visible && !document.hidden) drawScene(performance.now());
  });
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleSceneRefresh);
    observer.observe(map);
  }
  window.addEventListener("resize", scheduleSceneRefresh, { passive: true });
  document.addEventListener("mmla:languagechange", scheduleSceneRefresh);
  document.addEventListener("mmla:contentchange", scheduleSceneRefresh);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (!visible) {
        pointer.active = false;
        stop(true);
      } else if (pulseUntil > performance.now()) start();
      else if (!preference.matches) drawScene(performance.now());
    }, { threshold: 0.01 });
    observer.observe(study);
  }

  initializeCardMotion();
  updateCanvasSize();
  window.MMLAPhysics = { engine, canvas, motes, pulse, get running() { return running; } };
})();
