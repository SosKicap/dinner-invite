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

  // ✅ Lock/unlock scroll based on page
  if (pageNum === 3) {
    document.body.style.overflow = "auto";   // allow scroll
    document.documentElement.style.overflow = "auto";
  } else {
    document.body.style.overflow = "hidden"; // lock scroll
    document.documentElement.style.overflow = "hidden";
  }

  if (pageNum === 3) {
    const card = next.querySelector('.card');
    card.classList.remove("fade-in");
    void card.offsetWidth;
    card.classList.add("fade-in");
  }
}

let noButtonEscapeCount = 0;  // track how many times No button escaped

function moveNoButton(btn) {
  noButtonEscapeCount++;

  const card = btn.closest(".card");
  const cardRect = card.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();

  // 🔹 Detect if we’re on mobile
  const isMobile = window.innerWidth <= 600;

  let x, y;
  if (isMobile) {
    const offsetX = (Math.random() * 60 - 30);
    const offsetY = (Math.random() * 40);
    x = offsetX;
    y = offsetY;
  } else {
    const maxX = cardRect.width - btnRect.width - 20;
    const maxY = cardRect.height - btnRect.height - 20;
    x = Math.random() * maxX - maxX / 2;
    y = Math.random() * maxY - maxY / 2;
  }

  btn.style.transform = `translate(${x}px, ${y}px)`;

  btn.classList.add("shake");
  setTimeout(() => btn.classList.remove("shake"), 300);

  if (noButtonEscapeCount >= 4) {
    btn.style.transition = "opacity 0.6s ease";
    btn.style.opacity = "0";
    setTimeout(() => btn.remove(), 600);
  }
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

  icon.style.position = "fixed";
  if (x === null || y === null) {
    x = Math.random() * window.innerWidth;
    y = Math.random() * window.innerHeight;
  }
  icon.style.left = `${x}px`;
  icon.style.top = `${y}px`;

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
    heart.style.position = "fixed";
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

  let opacity = 1;
  let animationFrame;

  function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    ctx.globalAlpha = opacity;

    confettiPieces.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.r, p.r);
      p.y += p.d;
      if (p.y > confettiCanvas.height) p.y = -10;
    });

    ctx.globalAlpha = 1;
    animationFrame = requestAnimationFrame(drawConfetti);
  }

  drawConfetti();

  setTimeout(() => {
    const fadeInterval = setInterval(() => {
      opacity -= 0.05;
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }, 100);
  }, 3000);
}

// 💕 Cursor hearts
document.addEventListener("mousemove", e => {
  const container = document.getElementById("cursorHearts");
  const heart = document.createElement("span");
  heart.textContent = "💖";
  heart.style.position = "fixed";
  heart.style.left = e.clientX + "px";
  heart.style.top = e.clientY + "px";
  container.appendChild(heart);
  setTimeout(() => heart.remove(), 1000);
});

// Track scroll direction
let lastScrollY = window.scrollY;
let scrollDirection = "down";

window.addEventListener("scroll", () => {
  const currentY = window.scrollY;
  scrollDirection = currentY > lastScrollY ? "down" : "up";
  lastScrollY = currentY;
});

// 🎬 Scroll reveal for Page 3 sections
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.classList.remove('exit');

      // Animate children one by one
      const children = entry.target.querySelectorAll(':scope > *');
      children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 150}ms`;
      
        // Start offset depending on scroll direction
        if (scrollDirection === "down") {
          child.style.transform = "translateY(20px)";
        } else {
          child.style.transform = "translateY(-20px)";
        }
      
        requestAnimationFrame(() => {
          child.style.opacity = "1";
          child.style.transform = "translateY(0)";
        });
      });
    
      // Special case: activities list
      if (entry.target.classList.contains('activities')) {
        const items = entry.target.querySelectorAll('li');
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 200);
        });
      }
    
    } else {
      entry.target.classList.remove('visible');
      entry.target.classList.add('exit');
    
      const children = entry.target.querySelectorAll(':scope > *');
      children.forEach(child => {
        child.style.transitionDelay = "0ms";
        child.style.opacity = "0";
      
        // Exit direction opposite of scroll
        if (scrollDirection === "down") {
          child.style.transform = "translateY(-40px)";
        } else {
          child.style.transform = "translateY(40px)";
        }
      });
    
      if (entry.target.classList.contains('activities')) {
        const items = entry.target.querySelectorAll('li');
        items.forEach(item => item.classList.remove('visible'));
      }
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('#page3 .section').forEach(section => {
  observer.observe(section);
});

// 🎇 Random floating emojis around final message
function spawnFloatingFromHeart() {
  const heart = document.getElementById("textHeart");
  if (!heart) return;

  const rect = heart.getBoundingClientRect();
  const container = document.querySelector(".final-message-container");
  const containerRect = container.getBoundingClientRect();

  const x = rect.left + rect.width / 2 - containerRect.left;
  const y = rect.top + rect.height / 2 - containerRect.top;

  const emojis = ["💖","💕","✨","🌟","💝"];
  const span = document.createElement("span");
  span.className = "floating";
  span.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  // place inside container at heart position
  span.style.left = `${x}px`;
  span.style.top = `${y}px`;

  // random float offsets
  const offsetX = (Math.random() * 240 - 120) + "px";
  const offsetY = (Math.random() * -200 - 100) + "px";
  span.style.setProperty("--x", offsetX);
  span.style.setProperty("--y", offsetY);

  container.appendChild(span);

  setTimeout(() => span.remove(), 3000);
}

setInterval(spawnFloatingFromHeart, 1000);
