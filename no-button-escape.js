// Stable No button movement: no disappearing, stays near original area
(function () {
  const state = {
    baseX: 0,
    baseY: 0,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    raf: null,
    active: false,
    lastMove: 0
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setLabel(btn) {
    if (!btn.querySelector(".no-label")) {
      btn.innerHTML = '<span class="no-label">No 😭</span>';
    }
  }

  function resetButton(btn) {
    setLabel(btn);
    btn.style.position = "relative";
    btn.style.left = "";
    btn.style.top = "";
    btn.style.margin = "";
    btn.style.zIndex = "";
    btn.style.transform = "translate3d(0px, 0px, 0px)";
    btn.style.willChange = "transform";
    btn.classList.remove("is-flying", "shake");
    state.active = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = null;
  }

  function activate(btn) {
    if (state.active) return;

    setLabel(btn);
    const rect = btn.getBoundingClientRect();
    state.baseX = rect.left;
    state.baseY = rect.top;
    state.x = rect.left;
    state.y = rect.top;
    state.targetX = rect.left;
    state.targetY = rect.top;

    btn.style.position = "fixed";
    btn.style.left = "0px";
    btn.style.top = "0px";
    btn.style.margin = "0";
    btn.style.zIndex = "9999";
    btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    btn.style.willChange = "transform";
    btn.style.transition = "box-shadow 0.18s ease, filter 0.18s ease";
    state.active = true;
  }

  function visibleBounds(btn) {
    const rect = btn.getBoundingClientRect();
    const pad = 28;
    const topPad = 80;
    return {
      minX: pad,
      maxX: Math.max(pad, window.innerWidth - rect.width - pad),
      minY: topPad,
      maxY: Math.max(topPad, window.innerHeight - rect.height - pad)
    };
  }

  function chooseTarget(btn, pointerX, pointerY) {
    const b = visibleBounds(btn);
    const distance = 135;
    const options = [
      { x: state.baseX - distance, y: state.baseY },
      { x: state.baseX + distance, y: state.baseY },
      { x: state.baseX, y: state.baseY - 95 },
      { x: state.baseX, y: state.baseY + 95 },
      { x: state.baseX - 95, y: state.baseY + 75 },
      { x: state.baseX + 95, y: state.baseY + 75 }
    ].map(p => ({
      x: clamp(p.x, b.minX, b.maxX),
      y: clamp(p.y, b.minY, b.maxY)
    }));

    options.sort((a, bPoint) => {
      const da = Math.hypot(a.x - pointerX, a.y - pointerY);
      const db = Math.hypot(bPoint.x - pointerX, bPoint.y - pointerY);
      return db - da;
    });

    state.targetX = options[0].x;
    state.targetY = options[0].y;
  }

  function animate(btn) {
    const speed = 0.12;
    state.x += (state.targetX - state.x) * speed;
    state.y += (state.targetY - state.y) * speed;

    const b = visibleBounds(btn);
    state.x = clamp(state.x, b.minX, b.maxX);
    state.y = clamp(state.y, b.minY, b.maxY);
    btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;

    if (Math.abs(state.targetX - state.x) > 0.6 || Math.abs(state.targetY - state.y) > 0.6) {
      state.raf = requestAnimationFrame(() => animate(btn));
    } else {
      state.x = state.targetX;
      state.y = state.targetY;
      btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      btn.classList.remove("is-flying");
      state.raf = null;
    }
  }

  function trail(x, y) {
    const span = document.createElement("span");
    span.className = "no-trail";
    span.textContent = Math.random() > 0.5 ? "✨" : "🪶";
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 650);
  }

  window.moveNoButton = function (btn, event) {
    const now = Date.now();
    if (now - state.lastMove < 500 && state.raf) return;
    state.lastMove = now;

    activate(btn);
    const rect = btn.getBoundingClientRect();
    const pointerX = event?.clientX ?? rect.left;
    const pointerY = event?.clientY ?? rect.top;

    chooseTarget(btn, pointerX, pointerY);
    btn.classList.add("is-flying", "shake");
    setTimeout(() => btn.classList.remove("shake"), 180);
    trail(rect.left + rect.width / 2, rect.top + rect.height / 2);

    if (!state.raf) state.raf = requestAnimationFrame(() => animate(btn));
  };

  document.addEventListener("pointermove", function (event) {
    const btn = document.querySelector(".no-btn");
    const page2 = document.getElementById("page2");
    if (!btn || page2?.classList.contains("hidden")) return;

    const rect = btn.getBoundingClientRect();
    const distance = Math.hypot(
      event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2)
    );

    if (distance < 70) window.moveNoButton(btn, event);
  });

  window.addEventListener("resize", function () {
    const btn = document.querySelector(".no-btn");
    if (btn) resetButton(btn);
  });

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.querySelector(".no-btn");
    if (btn) resetButton(btn);
  });
})();
