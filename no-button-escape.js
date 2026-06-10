// Sharp but visible No button escape override
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

  function animate(btn) {
    state.x += (state.targetX - state.x) * 0.42;
    state.y += (state.targetY - state.y) * 0.42;

    btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;

    const dx = Math.abs(state.targetX - state.x);
    const dy = Math.abs(state.targetY - state.y);
    if (dx > 0.4 || dy > 0.4) {
      state.raf = requestAnimationFrame(() => animate(btn));
    } else {
      state.x = state.targetX;
      state.y = state.targetY;
      btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      state.raf = null;
      btn.classList.remove("is-flying");
    }
  }

  function pickTarget(btn, pointerX, pointerY) {
    const rect = btn.getBoundingClientRect();
    const padding = 28;
    const safeTop = 96;
    const maxX = window.innerWidth - rect.width - padding;
    const maxY = window.innerHeight - rect.height - padding;

    const card = document.querySelector("#page2 .card");
    const cardRect = card?.getBoundingClientRect();

    let x;
    let y;
    let tries = 0;

    do {
      const moveDistance = 260 + Math.random() * 260;
      const angle = Math.random() * Math.PI * 2;
      const baseX = pointerX ?? state.x;
      const baseY = pointerY ?? state.y;

      x = baseX + Math.cos(angle) * moveDistance;
      y = baseY + Math.sin(angle) * moveDistance;

      x = clamp(x, padding, maxX);
      y = clamp(y, safeTop, maxY);
      tries++;
    } while (
      cardRect &&
      x > cardRect.left + 20 &&
      x < cardRect.right - rect.width - 20 &&
      y > cardRect.top + 20 &&
      y < cardRect.bottom - rect.height - 20 &&
      tries < 14
    );

    state.targetX = clamp(x, padding, maxX);
    state.targetY = clamp(y, safeTop, maxY);
  }

  function makeTrail(x, y) {
    const sparkle = document.createElement("span");
    sparkle.className = "no-trail";
    sparkle.textContent = Math.random() > 0.5 ? "✨" : "🪶";
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
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const distance = Math.hypot(
      event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2)
    );

    if (distance < 86) {
      window.moveNoButton(btn, event);
    }
  });

  window.addEventListener("resize", () => {
    const btn = document.querySelector(".no-btn");
    if (!btn || !state.ready) return;

    const rect = btn.getBoundingClientRect();
    state.targetX = clamp(state.targetX, 28, window.innerWidth - rect.width - 28);
    state.targetY = clamp(state.targetY, 96, window.innerHeight - rect.height - 28);
    if (!state.raf) state.raf = requestAnimationFrame(() => animate(btn));
  });
})();
