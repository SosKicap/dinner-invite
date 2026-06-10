// Smooth full-screen No button escape override
(function () {
  const state = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    raf: null,
    ready: false
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

    btn.style.position = "fixed";
    btn.style.left = "0px";
    btn.style.top = "0px";
    btn.style.margin = "0";
    btn.style.zIndex = "9999";
    btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    btn.style.transition = "box-shadow 0.18s ease, filter 0.18s ease";
    btn.style.willChange = "transform";

    state.ready = true;
  }

  function animate(btn) {
    state.x += (state.targetX - state.x) * 0.28;
    state.y += (state.targetY - state.y) * 0.28;

    btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;

    const dx = Math.abs(state.targetX - state.x);
    const dy = Math.abs(state.targetY - state.y);
    if (dx > 0.6 || dy > 0.6) {
      state.raf = requestAnimationFrame(() => animate(btn));
    } else {
      state.x = state.targetX;
      state.y = state.targetY;
      btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      state.raf = null;
    }
  }

  function pickTarget(btn, pointerX, pointerY) {
    const rect = btn.getBoundingClientRect();
    const padding = 24;
    const maxX = window.innerWidth - rect.width - padding;
    const maxY = window.innerHeight - rect.height - padding;

    let x;
    let y;
    let tries = 0;

    do {
      x = padding + Math.random() * Math.max(10, maxX - padding);
      y = padding + Math.random() * Math.max(10, maxY - padding);
      tries++;
    } while (
      pointerX !== undefined &&
      Math.hypot(x - pointerX, y - pointerY) < 230 &&
      tries < 18
    );

    if (Math.random() < 0.35) {
      const corners = [
        [padding, padding],
        [maxX, padding],
        [padding, maxY],
        [maxX, maxY]
      ];
      const corner = corners[Math.floor(Math.random() * corners.length)];
      x = corner[0] + (Math.random() * 70 - 35);
      y = corner[1] + (Math.random() * 70 - 35);
    }

    state.targetX = clamp(x, padding, maxX);
    state.targetY = clamp(y, padding, maxY);
  }

  window.moveNoButton = function (btn, event) {
    setupButton(btn);
    const pointerX = event?.clientX;
    const pointerY = event?.clientY;

    pickTarget(btn, pointerX, pointerY);

    btn.classList.add("escape-fast", "shake");
    setTimeout(() => btn.classList.remove("shake"), 220);

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

    if (distance < 95) {
      window.moveNoButton(btn, event);
    }
  });

  window.addEventListener("resize", () => {
    const btn = document.querySelector(".no-btn");
    if (!btn || !state.ready) return;

    const rect = btn.getBoundingClientRect();
    state.targetX = clamp(state.targetX, 18, window.innerWidth - rect.width - 18);
    state.targetY = clamp(state.targetY, 18, window.innerHeight - rect.height - 18);
    if (!state.raf) state.raf = requestAnimationFrame(() => animate(btn));
  });
})();
