// Slow, visible No button escape override
(function () {
  const state = { x: 0, y: 0, targetX: 0, targetY: 0, raf: null, ready: false };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = null;
  }

  function getBounds(btn) {
    const rect = btn.getBoundingClientRect();
    const padding = 30;
    const safeTop = 96;
    return {
      rect,
      minX: padding,
      maxX: window.innerWidth - rect.width - padding,
      minY: safeTop,
      maxY: window.innerHeight - rect.height - padding
    };
  }

  function animate(btn) {
    state.x += (state.targetX - state.x) * 0.13;
    state.y += (state.targetY - state.y) * 0.13;

    const bounds = getBounds(btn);
    state.x = clamp(state.x, bounds.minX, bounds.maxX);
    state.y = clamp(state.y, bounds.minY, bounds.maxY);

    btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;

    if (Math.abs(state.targetX - state.x) > 0.5 || Math.abs(state.targetY - state.y) > 0.5) {
      state.raf = requestAnimationFrame(() => animate(btn));
    } else {
      state.x = state.targetX;
      state.y = state.targetY;
      btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      btn.classList.remove("is-flying");
      state.raf = null;
    }
  }

  function chooseTarget(btn, pointerX, pointerY) {
    const bounds = getBounds(btn);
    const card = document.querySelector("#page2 .card");
    const cardRect = card?.getBoundingClientRect();
    const rect = bounds.rect;

    let candidates = [];
    if (cardRect) {
      candidates = [
        { x: cardRect.left - rect.width - 38, y: cardRect.top + cardRect.height * 0.35 },
        { x: cardRect.right + 38, y: cardRect.top + cardRect.height * 0.38 },
        { x: cardRect.left + cardRect.width * 0.22, y: cardRect.top - rect.height - 34 },
        { x: cardRect.left + cardRect.width * 0.68, y: cardRect.bottom + 34 },
        { x: cardRect.right - rect.width - 20, y: cardRect.bottom + 28 },
        { x: cardRect.left + 18, y: cardRect.bottom + 28 }
      ];
    } else {
      candidates = [
        { x: bounds.minX, y: bounds.minY + 120 },
        { x: bounds.maxX, y: bounds.minY + 120 },
        { x: bounds.minX + 150, y: bounds.maxY },
        { x: bounds.maxX - 150, y: bounds.maxY }
      ];
    }

    candidates = candidates.map(point => ({
      x: clamp(point.x, bounds.minX, bounds.maxX),
      y: clamp(point.y, bounds.minY, bounds.maxY)
    }));

    candidates.sort((a, b) => {
      const da = Math.hypot(a.x - pointerX, a.y - pointerY) + Math.hypot(a.x - state.x, a.y - state.y) * 0.25;
      const db = Math.hypot(b.x - pointerX, b.y - pointerY) + Math.hypot(b.x - state.x, b.y - state.y) * 0.25;
      return db - da;
    });

    const pick = candidates[0];
    state.targetX = pick.x;
    state.targetY = pick.y;
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

    chooseTarget(btn, pointerX, pointerY);
    btn.classList.add("is-flying", "shake");
    setTimeout(() => btn.classList.remove("shake"), 180);
    makeTrail(rect.left + rect.width / 2, rect.top + rect.height / 2);

    if (!state.raf) state.raf = requestAnimationFrame(() => animate(btn));
  };

  document.addEventListener("pointermove", (event) => {
    const btn = document.querySelector(".no-btn");
    const page2 = document.getElementById("page2");
    if (!btn || page2?.classList.contains("hidden")) return;

    const rect = btn.getBoundingClientRect();
    const distance = Math.hypot(
      event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2)
    );

    if (distance < 84 && !state.raf) {
      window.moveNoButton(btn, event);
    }
  });

  window.addEventListener("resize", () => {
    const btn = document.querySelector(".no-btn");
    if (!btn) return;
    if (!state.ready) return;
    const bounds = getBounds(btn);
    state.targetX = clamp(state.targetX, bounds.minX, bounds.maxX);
    state.targetY = clamp(state.targetY, bounds.minY, bounds.maxY);
    if (!state.raf) state.raf = requestAnimationFrame(() => animate(btn));
  });

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".no-btn");
    if (btn) resetButtonToStart(btn);
  });
})();
