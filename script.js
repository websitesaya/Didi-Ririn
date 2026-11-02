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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FLAKE_COUNT = reduceMotion ? 0 : (window.innerWidth < 640 ? 28 : 50);

  // Pre-render 1 butiran emas bercahaya ke canvas kecil (sekali saja) —
  // jauh lebih ringan daripada shadowBlur di setiap frame.
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  (function(){
    const s = sprite.getContext('2d');
    const g = s.createRadialGradient(16,16,0,16,16,16);
    g.addColorStop(0,   'rgba(255,240,190,1)');
    g.addColorStop(0.35,'rgba(240,217,140,.95)');
    g.addColorStop(0.6, 'rgba(201,162,39,.35)');
    g.addColorStop(1,   'rgba(201,162,39,0)');
    s.fillStyle = g; s.fillRect(0,0,32,32);
  })();

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

  let running = false;
  function draw(){
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.speed;
      f.x += Math.sin(f.angle) * f.drift;
      f.angle += 0.01;
      if (f.y > h + 10) { f.y = -10; f.x = Math.random() * w; }
      if (f.x > w + 10) f.x = -10;
      if (f.x < -10) f.x = w + 10;
      const size = f.r * 4;
      ctx.globalAlpha = f.opacity;
      ctx.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size);
    }
    requestAnimationFrame(draw);
  }
  function start(){ if (!running && FLAKE_COUNT) { running = true; requestAnimationFrame(draw); } }
  function stop(){ running = false; }
  // Hemat baterai: berhenti saat tab/aplikasi tidak sedang dilihat
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  start();
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
   5. COUNTDOWN TIMER (menuju Akad — 29 Nov 2026, 08:30 WIB)
   ========================================================= */
function startCountdown(){
  const targetDate = new Date('2026-11-29T08:30:00+07:00').getTime();

  const dEl = document.getElementById('cdDays');
  const hEl = document.getElementById('cdHours');
  const mEl = document.getElementById('cdMinutes');
  const sEl = document.getElementById('cdSeconds');
  if (!dEl) return;

  function setNum(el, n){
    const v = String(n).padStart(2, '0');
    if (el.textContent !== v) {
      el.textContent = v;
      el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
    }
  }
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

    setNum(dEl, days); setNum(hEl, hours); setNum(mEl, minutes); setNum(sEl, seconds);
  }
  tick();
  setInterval(tick, 1000);
}

/* =========================================================
   6. GALLERY — LAZY LOAD 20 FOTO (biar tidak lemot)
   ========================================================= */
// Urutan foto tetap Foto1 → Foto20.
// Grid memakai versi kecil di folder thumbs/ (cepat), lightbox memakai versi besar.
const galleryFiles = Array.from({ length: TOTAL_PHOTOS }, (_, i) => `Foto${i + 1}.jpg`);
const galleryThumbs = galleryFiles.map(f => `thumbs/${f}`);

(function buildGallery(){
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  galleryFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = index;

    item.style.setProperty('--d', `${(index % 2) * 0.12}s`);

    const img = document.createElement('img');
    img.dataset.src = galleryThumbs[index];
    img.alt = `Prewedding Didi & Ririn ${index + 1}`;
    img.decoding = 'async';

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
          img.onload = () => img.classList.add('loaded');
          img.src = img.dataset.src;
        }
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '250px 0px' });

  // Animasi muncul saat foto benar-benar terlihat di layar
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.gallery-item').forEach(el => { lazyObserver.observe(el); revealObserver.observe(el); });
})();

/* =========================================================
   7. LIGHTBOX
   ========================================================= */
let currentLightboxIndex = 0;
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');

function showLightboxImage(index){
  lightboxImg.classList.remove('show');
  // tampilkan thumbnail dulu (sudah ter-cache) lalu ganti versi tajam
  lightboxImg.src = galleryThumbs[index];
  const full = new Image();
  full.onload = () => { if (currentLightboxIndex === index) lightboxImg.src = full.src; };
  full.src = galleryFiles[index];
  requestAnimationFrame(() => lightboxImg.classList.add('show'));
  lightboxCounter.textContent = `${index + 1} / ${galleryFiles.length}`;
  // pre-load foto sebelah supaya geser terasa instan
  [1, -1].forEach(d => { new Image().src = galleryFiles[(index + d + galleryFiles.length) % galleryFiles.length]; });
}
function openLightbox(index){
  currentLightboxIndex = index;
  showLightboxImage(index);
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'auto';
}
function navLightbox(dir){
  currentLightboxIndex = (currentLightboxIndex + dir + galleryFiles.length) % galleryFiles.length;
  showLightboxImage(currentLightboxIndex);
}
// Geser (swipe) kiri/kanan di HP
let touchX = null, touchY = null;
lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
lightbox.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) navLightbox(dx < 0 ? 1 : -1);
  else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLightbox();
  touchX = touchY = null;
}, { passive: true });
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
    copyText(number).then(() => {
      const original = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
      showToast(`Nomor rekening ${btn.dataset.bank} disalin`);
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = original;
      }, 2000);
    }).catch(() => showToast('Gagal menyalin. Silakan salin nomor secara manual.'));
  });
});

// Salin teks — dengan cadangan untuk browser bawaan WhatsApp/IG yang kadang menolak clipboard API
function copyText(text){
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
  }
  return legacyCopy(text);
}
function legacyCopy(text){
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
    document.body.removeChild(ta);
  });
}

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
