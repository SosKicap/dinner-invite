function openEnvelope() {
  const envelope = document.querySelector('.envelope');
  const music = document.getElementById('bgMusic');
  music.volume = 0.3;
  music.play();

  envelope.classList.add('open');

  // Sparkles burst
  const sparkles = document.querySelectorAll("#envelope-sparkles span");
  sparkles.forEach(s => {
    const x = (Math.random() * 200 - 100) + "px";
    const y = (Math.random() * -150 - 50) + "px";
    s.style.setProperty("--x", x);
    s.style.setProperty("--y", y);
    s.style.animation = "burst 1.5s ease forwards";
  });

  // Launch confetti
  launchConfetti();

  // Zoom envelope
  setTimeout(() => envelope.classList.add('zoom'), 2000);

  // After zoom → Page 2
  setTimeout(() => {
    document.getElementById('page1').classList.add('hidden');
    goToPage(2);
  }, 2800);
}

function goToPage(pageNum) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const next = document.getElementById('page' + pageNum);
  next.classList.remove('hidden');

  if (pageNum === 3) {
    const card = next.querySelector('.card');
    card.classList.remove("fade-in");
    void card.offsetWidth;
    card.classList.add("fade-in");
  }
}

function moveNoButton(btn) {
  const maxX = window.innerWidth / 3;
  const maxY = window.innerHeight / 4;
  const x = Math.random() * maxX - maxX / 2;
  const y = Math.random() * maxY - maxY / 2;
  btn.style.transform = `translate(${x}px, ${y}px)`;
}

function yesClicked(btn) {
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width/2;
  const y = rect.top;

  // Fireworks
  for (let i = 0; i < 12; i++) {
    const f = document.createElement("span");
    f.textContent = ["💖","✨","🌟","🎆"][Math.floor(Math.random()*4)];
    f.classList.add("firework");
    f.style.left = x + "px";
    f.style.top = y + "px";
    f.style.setProperty("--x", (Math.random()*200-100)+"px");
    f.style.setProperty("--y", (Math.random()*200-100)+"px");
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  }

  setTimeout(() => { goToPage(3); }, 1600);
}

// Random emoji pops
const icons = ["💖","✨","🎂","🎈","💕","🌟"];
function spawnIcon(x = null, y = null) {
  const container = document.getElementById("popIcons");
  const icon = document.createElement("span");
  icon.textContent = icons[Math.floor(Math.random() * icons.length)];
  if (x === null || y === null) {
    x = Math.random() * window.innerWidth;
    y = Math.random() * window.innerHeight;
  }
  icon.style.left = `${x}px`;
  icon.style.top = `${y}px`;
  icon.style.position = "absolute";
  icon.style.fontSize = "2em";
  icon.style.animation = "popFloat 2s ease forwards, spin 2s linear";
  container.appendChild(icon);
  setTimeout(() => icon.remove(), 2000);
}
setInterval(() => spawnIcon(), 500);
document.addEventListener("click", (e) => spawnIcon(e.clientX, e.clientY));

const style = document.createElement("style");
style.innerHTML = `
@keyframes popFloat {
  0%{transform:scale(0.5) translateY(0);opacity:1;}
  50%{transform:scale(1.2) translateY(-40px);opacity:0.9;}
  100%{transform:scale(1) translateY(-100px);opacity:0;}
}
@keyframes spin {
  0%{transform:rotate(0deg);}
  100%{transform:rotate(360deg);}
}`;
document.head.appendChild(style);

// Particle background
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];
for (let i = 0; i < 50; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    d: Math.random() * 0.5
  });
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 223, 186, 0.8)";
  ctx.beginPath();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
  }
  ctx.fill();
  updateParticles();
}
function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.y -= p.d;
    if (p.y < 0) {
      p.y = canvas.height;
      p.x = Math.random() * canvas.width;
    }
  }
}
setInterval(drawParticles, 50);

// ---- ARROW SPAWNER ----
function spawnArrow() {
  const container = document.getElementById("arrowContainer");
  const envelope = document.querySelector(".envelope");
  if (!envelope) return;
  const envRect = envelope.getBoundingClientRect();

  let x, y;
  const side = Math.floor(Math.random() * 4);
  if (side === 0) { x = Math.random() * window.innerWidth; y = -50; }
  else if (side === 1) { x = window.innerWidth + 50; y = Math.random() * window.innerHeight; }
  else if (side === 2) { x = Math.random() * window.innerWidth; y = window.innerHeight + 50; }
  else { x = -50; y = Math.random() * window.innerHeight; }

  const arrow = document.createElement("div");
  arrow.textContent = "⬆";
  arrow.classList.add("random-arrow");
  const size = Math.random() * 2 + 2;
  arrow.style.fontSize = `${size}em`;
  arrow.style.left = `${x}px`;
  arrow.style.top = `${y}px`;
  container.appendChild(arrow);

  let targetX = envRect.left + envRect.width/2;
  let targetY = envRect.top + envRect.height/2;
  if (x < envRect.left) targetX = envRect.left;
  else if (x > envRect.right) targetX = envRect.right;
  else targetX = x;
  if (y < envRect.top) targetY = envRect.top;
  else if (y > envRect.bottom) targetY = envRect.bottom;
  else targetY = y;

  const dx = targetX - x;
  const dy = targetY - y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  arrow.style.transform = `rotate(${angle}deg)`;

  let progress = 0;
  const speed = 0.02 + Math.random() * 0.01;
  function animate() {
    progress += speed;
    if (progress >= 1) {
      arrow.style.left = `${targetX}px`;
      arrow.style.top = `${targetY}px`;
      createArrowBurst(targetX, targetY);
      arrow.remove();
      return;
    }
    const curX = x + dx * progress;
    const curY = y + dy * progress;
    arrow.style.left = `${curX}px`;
    arrow.style.top = `${curY}px`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
function createArrowBurst(x, y) {
  const container = document.getElementById("arrowContainer");
  for (let i = 0; i < 6; i++) {
    const heart = document.createElement("span");
    heart.textContent = ["💖","💕","✨","🌟"][Math.floor(Math.random()*4)];
    heart.classList.add("arrow-burst");
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--x", (Math.random()*120 - 60) + "px");
    heart.style.setProperty("--y", (Math.random()*120 - 60) + "px");
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }
}
setInterval(spawnArrow, 600);

// 🎉 Confetti
function launchConfetti() {
  const confettiCanvas = document.getElementById("confetti");
  const ctx = confettiCanvas.getContext("2d");
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  let confettiPieces = [];
  for (let i = 0; i < 50; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 10 + 5,
      color: `hsl(${Math.random()*360},100%,60%)`
    });
  }
  function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.r, p.r);
      p.y += p.d;
      if (p.y > confettiCanvas.height) p.y = -10;
    });
    requestAnimationFrame(drawConfetti);
  }
  drawConfetti();
}

// 💕 Cursor hearts
document.addEventListener("mousemove", e => {
  const container = document.getElementById("cursorHearts");
  const heart = document.createElement("span");
  heart.textContent = "💖";
  heart.style.left = e.pageX + "px";
  heart.style.top = e.pageY + "px";
  container.appendChild(heart);
  setTimeout(() => heart.remove(), 1000);
});
