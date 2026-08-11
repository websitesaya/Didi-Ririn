/* =========================================================
   THE WEDDING OF DIDI & RIRIN — script.js
   Design by Zhald_Design
   ========================================================= */

/* =========== ⚙️ KONFIGURASI JSONBIN (WAJIB DIISI) ===========
   1. Buat akun gratis di https://jsonbin.io
   2. Buat "Bin" baru berisi array kosong:  []
   3. Salin BIN ID dan X-MASTER-KEY ke bawah ini.
   ============================================================ */
const JSONBIN_BIN_ID   = "6a7ab399da38895dfed41fea";
const JSONBIN_API_KEY  = "$2a$10$nou5c3yZntdxwBqnGEEOvuCkZpg9GT4CfSp1IXgNhJpKQzhxI8NYO";
const JSONBIN_BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

const TOTAL_PHOTOS = 20; // Foto1.jpg s/d Foto20.jpg

/* =========================================================
   1. NAMA TAMU DARI URL (?to=Nama)
   ========================================================= */
(function initGuestName(){
  const params = new URLSearchParams(window.location.search);
  const guest = params.get('to');
  const el = document.getElementById('guestName');
  if (guest && el) {
    el.textContent = decodeURIComponent(guest.replace(/\+/g, ' '));
  }
})();

/* =========================================================
   2. CURTAIN OPEN + MUSIC AUTOPLAY
   ========================================================= */
const openBtn   = document.getElementById('openBtn');
const cover     = document.getElementById('cover');
const curtain   = document.getElementById('curtain');
const bgMusic   = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

function playMusic(){
  bgMusic.volume = 0.75;
  return bgMusic.play().then(() => {
    musicToggle.classList.add('playing');
    musicToggle.classList.remove('attn');
  });
}
function pauseMusic(){
  bgMusic.pause();
  musicToggle.classList.remove('playing');
}

openBtn.addEventListener('click', () => {
  // Mulai musik (dipicu oleh interaksi user agar lolos autoplay policy browser)
  playMusic().catch(() => {
    // Diblokir browser (mis. mode senyap iPhone, izin suara situs di-block, dll).
    // Beri isyarat visual + info singkat supaya tamu tahu harus tap ikon musik manual.
    musicToggle.classList.add('attn');
    showToast('Musik diblokir browser. Tap ikon 💿 di pojok untuk memutar.');
  });

  // 1) Cover memudar, menampakkan tirai yang masih tertutup di belakangnya
  cover.classList.add('hide');

  // 2) Setelah cover memudar, tirai baru terbuka
  setTimeout(() => {
    curtain.classList.add('open');
  }, 500);

  // 4) Setelah tirai selesai terbuka, tampilkan konten utama
  setTimeout(() => {
    curtain.classList.add('hide');
    document.body.style.overflow = 'auto';
    initScrollReveal();
    startCountdown();
  }, 500 + 1400);
});

musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    playMusic().catch(() => {
      showToast('Gagal memutar musik. Coba lagi beberapa saat.');
    });
  } else {
    pauseMusic();
  }
});

// Kunci scroll sebelum undangan dibuka
document.body.style.overflow = 'hidden';

/* =========================================================
   3. SALJU / GOLD PETAL FALLING EFFECT (Canvas — ringan & cepat)
   ========================================================= */
(function snowEffect(){
  const canvas = document.getElementById('snowCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, flakes = [];
  const FLAKE_COUNT = window.innerWidth < 640 ? 35 : 60;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function createFlake(){
    return {
      x: Math.random() * w,
      y: Math.random() * -h,
      r: Math.random() * 2.5 + 1.5,
      speed: Math.random() * 0.8 + 0.4,
      drift: Math.random() * 0.6 - 0.3,
      opacity: Math.random() * 0.5 + 0.4,
      angle: Math.random() * Math.PI * 2
    };
  }
  for (let i = 0; i < FLAKE_COUNT; i++) flakes.push(createFlake());

  function draw(){
    ctx.clearRect(0, 0, w, h);
    flakes.forEach(f => {
      f.y += f.speed;
      f.x += Math.sin(f.angle) * f.drift;
      f.angle += 0.01;
      if (f.y > h + 10) { f.y = -10; f.x = Math.random() * w; }
      if (f.x > w + 10) f.x = -10;
      if (f.x < -10) f.x = w + 10;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 217, 140, ${f.opacity})`;
      ctx.shadowColor = 'rgba(201,162,39,0.6)';
      ctx.shadowBlur = 4;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* =========================================================
   4. SCROLL REVEAL ANIMATION (IntersectionObserver — hemat performa)
   ========================================================= */
function initScrollReveal(){
  const items = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(item => observer.observe(item));
}

/* =========================================================
   5. COUNTDOWN TIMER (menuju Akad — 29 Nov 2026, 08:00 WIB)
   ========================================================= */
function startCountdown(){
  const targetDate = new Date('2026-11-29T08:00:00+07:00').getTime();

  const dEl = document.getElementById('cdDays');
  const hEl = document.getElementById('cdHours');
  const mEl = document.getElementById('cdMinutes');
  const sEl = document.getElementById('cdSeconds');
  if (!dEl) return;

  function tick(){
    const now = Date.now();
    const diff = targetDate - now;
    if (diff <= 0) {
      dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '00';
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    dEl.textContent = String(days).padStart(2, '0');
    hEl.textContent = String(hours).padStart(2, '0');
    mEl.textContent = String(minutes).padStart(2, '0');
    sEl.textContent = String(seconds).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

/* =========================================================
   6. GALLERY — LAZY LOAD 20 FOTO (biar tidak lemot)
   ========================================================= */
const galleryFiles = Array.from({ length: TOTAL_PHOTOS }, (_, i) => `Foto${i + 1}.jpg`);

(function buildGallery(){
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  galleryFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = index;

    const img = document.createElement('img');
    img.dataset.src = file;
    img.alt = `Prewedding Didi & Ririn ${index + 1}`;
    img.loading = 'lazy';

    item.appendChild(img);
    grid.appendChild(item);
    item.addEventListener('click', () => openLightbox(index));
  });

  // Lazy load pakai IntersectionObserver — hanya load saat mendekati layar
  const lazyObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target.querySelector('img');
        if (img && !img.src) {
          img.src = img.dataset.src;
          img.onload = () => img.classList.add('loaded');
        }
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '250px 0px' });

  document.querySelectorAll('.gallery-item').forEach(el => lazyObserver.observe(el));
})();

/* =========================================================
   7. LIGHTBOX
   ========================================================= */
let currentLightboxIndex = 0;
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

function openLightbox(index){
  currentLightboxIndex = index;
  lightboxImg.src = galleryFiles[index];
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.classList.remove('active');
  document.body.style.overflow = 'auto';
}
function navLightbox(dir){
  currentLightboxIndex = (currentLightboxIndex + dir + galleryFiles.length) % galleryFiles.length;
  lightboxImg.src = galleryFiles[currentLightboxIndex];
}
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => navLightbox(-1));
document.getElementById('lightboxNext').addEventListener('click', () => navLightbox(1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navLightbox(-1);
  if (e.key === 'ArrowRight') navLightbox(1);
});

/* =========================================================
   8. COPY REKENING (Kartu ATM Hadiah)
   ========================================================= */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const number = btn.dataset.copy;
    navigator.clipboard.writeText(number).then(() => {
      const original = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
      showToast(`Nomor rekening ${btn.dataset.bank} disalin`);
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = original;
      }, 2000);
    });
  });
});

/* =========================================================
   9. TOAST NOTIFICATION
   ========================================================= */
let toastTimer;
function showToast(message){
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* =========================================================
   10. UCAPAN & DOA — Integrasi JSONBin (realtime antar tamu)
   ========================================================= */
const wishesForm = document.getElementById('wishesForm');
const wishesList = document.getElementById('wishesList');
const wishSubmit = document.getElementById('wishSubmit');

async function fetchWishes(){
  if (JSONBIN_BIN_ID.includes('ISI_')) {
    wishesList.innerHTML = `<p class="wishes-empty">Ucapan belum aktif. Admin perlu mengisi JSONBIN_BIN_ID &amp; JSONBIN_API_KEY pada script.js.</p>`;
    return;
  }
  try {
    const res = await fetch(`${JSONBIN_BASE_URL}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY, 'X-Bin-Meta': 'false' }
    });
    const data = await res.json();
    const wishes = Array.isArray(data) ? data : (data.record || []);
    renderWishes(wishes);
  } catch (err) {
    wishesList.innerHTML = `<p class="wishes-empty">Gagal memuat ucapan. Silakan refresh halaman.</p>`;
  }
}

function renderWishes(wishes){
  if (!wishes || wishes.length === 0) {
    wishesList.innerHTML = `<p class="wishes-empty">Jadilah yang pertama memberikan ucapan &amp; doa 🤍</p>`;
    return;
  }
  const sorted = [...wishes].reverse();
  wishesList.innerHTML = sorted.map(w => `
    <div class="wish-item">
      <div class="wish-item-head">
        <span class="wish-name">${escapeHTML(w.name)}</span>
        <span class="wish-status ${statusClass(w.status)}">${escapeHTML(w.status || 'Hadir')}</span>
      </div>
      <p class="wish-message">${escapeHTML(w.message)}</p>
    </div>
  `).join('');
}

function statusClass(status){
  if (status === 'Tidak Hadir') return 'tidak-hadir';
  if (status === 'Ragu-ragu') return 'ragu-ragu';
  return 'hadir';
}

function escapeHTML(str){
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

wishesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('wishName').value.trim();
  const status = document.getElementById('wishStatus').value;
  const message = document.getElementById('wishMessage').value.trim();
  if (!name || !message) return;

  if (JSONBIN_BIN_ID.includes('ISI_')) {
    showToast('Fitur ucapan belum dikonfigurasi admin.');
    return;
  }

  wishSubmit.disabled = true;
  wishSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

  try {
    const getRes = await fetch(`${JSONBIN_BASE_URL}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY, 'X-Bin-Meta': 'false' }
    });
    const existing = await getRes.json();
    const wishes = Array.isArray(existing) ? existing : (existing.record || []);

    wishes.push({ name, status, message, time: new Date().toISOString() });

    await fetch(JSONBIN_BASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
      body: JSON.stringify(wishes)
    });

    renderWishes(wishes);
    wishesForm.reset();
    showToast('Terima kasih atas ucapan & doanya 🤍');
  } catch (err) {
    showToast('Gagal mengirim ucapan, coba lagi.');
  } finally {
    wishSubmit.disabled = false;
    wishSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Ucapan';
  }
});

fetchWishes();
