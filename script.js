function openEnvelope() {
  const envelope = document.querySelector('.envelope');
  const music = document.getElementById('bgMusic');

  // Play music softly when envelope opens
  music.volume = 0.3;
  music.play();

  envelope.classList.add('open');
  setTimeout(() => {
    goToPage(2);
  }, 1500); // wait for animation
}

function goToPage(pageNum) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page' + pageNum).classList.remove('hidden');
}

function moveNoButton(btn) {
  const x = Math.random() * 200 - 100;
  const y = Math.random() * 200 - 100;
  btn.style.transform = `translate(${x}px, ${y}px)`;
}
