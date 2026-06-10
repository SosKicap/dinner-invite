// Safe No button movement: relative only, never fixed, never disappears
(function () {
  const state = {
    x: 0,
    y: 0,
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

  function trail(btn) {
    const rect = btn.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "no-trail";
    span.textContent = Math.random() > 0.5 ? "✨" : "🪶";
    span.style.left = `${rect.left + rect.width / 2}px`;
    span.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 650);
  }

  function keepInsideScreen(btn, nextX, nextY) {
    const oldTransform = btn.style.transform;
    btn.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
    const rect = btn.getBoundingClientRect();

    const pad = 18;
    if (rect.left < pad || rect.right > window.innerWidth - pad) {
      nextX = state.x * -0.45;
    }

    if (rect.top < 86 || rect.bottom > window.innerHeight - pad) {
      nextY = state.y * -0.45;
    }

    btn.style.transform = oldTransform;
    return { x: nextX, y: nextY };
  }

  window.moveNoButton = function (btn, event) {
    const now = Date.now();
    if (now - state.lastMove < 220) return;
    state.lastMove = now;

    setLabel(btn);
    btn.style.position = "relative";
    btn.style.left = "";
    btn.style.top = "";
    btn.style.margin = "";
    btn.style.zIndex = "9999";
    btn.style.willChange = "transform";
    btn.style.transition = "transform 0.42s cubic-bezier(.2,.85,.2,1), box-shadow .18s ease, filter .18s ease";

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const pointerX = event?.clientX ?? centerX;
    const pointerY = event?.clientY ?? centerY;

    let dirX = centerX - pointerX;
    let dirY = centerY - pointerY;

    if (Math.abs(dirX) < 8 && Math.abs(dirY) < 8) {
      dirX = Math.random() > 0.5 ? 1 : -1;
      dirY = Math.random() > 0.5 ? 0.6 : -0.6;
    }

    const length = Math.hypot(dirX, dirY) || 1;
    dirX /= length;
    dirY /= length;

    let nextX = state.x + dirX * 118;
    let nextY = state.y + dirY * 82;

    nextX = clamp(nextX, -190, 190);
    nextY = clamp(nextY, -120, 120);

    const safe = keepInsideScreen(btn, nextX, nextY);
    state.x = clamp(safe.x, -190, 190);
    state.y = clamp(safe.y, -120, 120);

    btn.classList.add("is-flying", "shake");
    btn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    trail(btn);

    setTimeout(() => btn.classList.remove("shake"), 180);
    setTimeout(() => btn.classList.remove("is-flying"), 520);
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

    if (distance < 68) window.moveNoButton(btn, event);
  });

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.querySelector(".no-btn");
    if (!btn) return;
    setLabel(btn);
    btn.style.position = "relative";
    btn.style.transform = "translate3d(0, 0, 0)";
  });
})();
