// Slow but sharp No button escape override
(function () {
  const state = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    raf: null,
    ready: false,
    flightCount: 0
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getBounds(btn) {
    const rect = btn.getBoundingClientRect();
    const padding = 26;
    const safeTop = 92;
    const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
    const maxY = Math.max(safeTop, window.innerHeight - rect.height - padding);
    return { rect, padding, safeTop, maxX, maxY };
  }

  function setupButton(btn) {
    if (state.ready) return;

    const rect = btn.getBoundingClientRect();
    state.x = rect.left;
    state.y = rect.top;
    state.targetX = state.x;
    state.targetY = state.y;

    btn.innerHTML = '<span class="wing left">🪽</span><span class="no-label">No 😭</span><span class="wing right">🪽</span>';
    btn.style.position = "fixed";
    btn.style.left = "0px";
    btn.style.top = "0px";
    btn.style.margin = "0";
    btn.style.zIndex = "9999";
    btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    btn.style.transition = "box-shadow 0.14s ease, filter 0.14s ease";
    btn.style.willChange = "transform";

    state.ready = true;
  }

  function resetButtonToStart(btn) {
    btn.innerHTML = '<span class="wing left">🪽</span><span class="no-label">No 😭</span><span class="wing right">🪽</span>';
    btn.style.position = "relative";
    btn.style.left = "";
    btn.style.top = "";
    btn.style.margin = "";
    btn.style.zIndex = "";
    btn.style.transform = "";
    btn.style.willChange = "transform";
    btn.classList.remove("is-flying", "shake");
    state.ready = false;
    state.raf = null;
  }

  function animate(btn) {
    state.x += (state.targetX - state.x) * 0.16;
    state.y += (state.targetY - state.y) * 0.16;

    const { padding, safeTop, maxX, maxY } = getBounds(btn);
    state.x = clamp(state.x, padding, maxX);
    state.y = clamp(state.y, safeTop, maxY);

    btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;

    const dx = Math.abs(state.targetX - state.x);
    const dy = Math.abs(state.targetY - state.y);
    if (dx > 0.35 || dy > 0.35) {
      state.raf = requestAnimationFrame(() => animate(btn));
    } else {
      state.x = state.targetX;
      state.y = state.targetY;
      btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      state.raf = null;
      btn.classList.remove("is-flying");
    }
  }

  function isInsideCard(x, y, btn, cardRect) {
    if (!cardRect) return false;
    const rect = btn.getBoundingClientRect();
    return (
      x > cardRect.left - 18 &&
      x < cardRect.right - rect.width + 18 &&
      y > cardRect.top - 18 &&
      y < cardRect.bottom - rect.height + 18
    );
  }

  function pickTarget(btn, pointerX, pointerY) {
    const { padding, safeTop, maxX, maxY } = getBounds(btn);
    const card = document.querySelector("#page2 .card");
    const cardRect = card?.getBoundingClientRect();

    const outsideZones = [
      () => ({ x: padding + Math.random() * Math.max(40, window.innerWidth * 0.22), y: safeTop + Math.random() * Math.max(40, window.innerHeight - safeTop - 90) }),
      () => ({ x: window.innerWidth * 0.73 + Math.random() * Math.max(40, window.innerWidth * 0.2), y: safeTop + Math.random() * Math.max(40, window.innerHeight - safeTop - 90) }),
      () => ({ x: padding + Math.random() * Math.max(40, window.innerWidth - 160), y: safeTop + Math.random() * 130 }),
      () => ({ x: padding + Math.random() * Math.max(40, window.innerWidth - 160), y: window.innerHeight * 0.72 + Math.random() * Math.max(30, window.innerHeight * 0.18) })
    ];

    let x = state.x;
    let y = state.y;
    let tries = 0;

    do {
      const zone = outsideZones[Math.floor(Math.random() * outsideZones.length)]();
      x = clamp(zone.x, padding, maxX);
      y = clamp(zone.y, safeTop, maxY);
      tries++;
    } while (
      (isInsideCard(x, y, btn, cardRect) || Math.hypot(x - pointerX, y - pointerY) < 180) &&
      tries < 24
    );

    state.targetX = clamp(x, padding, maxX);
    state.targetY = clamp(y, safeTop, maxY);
  }

  function makeTrail(x, y) {
    const sparkle = document.createElement("span");
    sparkle.className = "no-trail";
    sparkle.textContent = Math.random() > 0.45 ? "✨" : "🪶";
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 650);
  }

  window.moveNoButton = function (btn, event) {
    setupButton(btn);

    const rect = btn.getBoundingClientRect();
    const pointerX = event?.clientX ?? rect.left;
    const pointerY = event?.clientY ?? rect.top;

    pickTarget(btn, pointerX, pointerY);

    state.flightCount++;
    btn.classList.add("is-flying", "shake");
    setTimeout(() => btn.classList.remove("shake"), 180);

    makeTrail(rect.left + rect.width / 2, rect.top + rect.height / 2);

    if (!state.raf) {
      state.raf = requestAnimationFrame(() => animate(btn));
    }
  };

  document.addEventListener("pointermove", (event) => {
    const btn = document.querySelector(".no-btn");
    const page2 = document.getElementById("page2");
    if (!btn || page2?.classList.contains("hidden")) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

    if (distance < 90) {
      window.moveNoButton(btn, event);
    }
  });

  window.addEventListener("resize", () => {
    const btn = document.querySelector(".no-btn");
    if (!btn) return;

    if (!state.ready) {
      resetButtonToStart(btn);
      return;
    }

    const { padding, safeTop, maxX, maxY } = getBounds(btn);
    state.targetX = clamp(state.targetX, padding, maxX);
    state.targetY = clamp(state.targetY, safeTop, maxY);
    if (!state.raf) state.raf = requestAnimationFrame(() => animate(btn));
  });

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".no-btn");
    if (btn) resetButtonToStart(btn);
  });
})();
