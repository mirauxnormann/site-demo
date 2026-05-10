/* ═══════════════════════════════════════════════
   LE COUVREUR — Main JS
   ═══════════════════════════════════════════════ */

// ─── Navbar scroll effect ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ─── Mobile burger menu ───
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ─── Reveal on scroll ───
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// ─── Counter animation ───
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const step = target / (1800 / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, 16);
}
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ─── Gallery filter + lightbox integration ───
const filterBtns = document.querySelectorAll('.filter-btn');
let allItems = Array.from(document.querySelectorAll('.gallery-item[data-src]'));
let visibleItems = [...allItems];

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    visibleItems = filter === 'all' ? [...allItems] : allItems.filter(i => i.dataset.category === filter);

    allItems.forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.style.transition = 'opacity 0.3s, transform 0.3s';
      if (match) {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
        item.style.display = '';
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.94)';
        setTimeout(() => { item.style.display = 'none'; }, 300);
      }
    });
  });
});

// ─── Lightbox ───
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbTitle   = document.getElementById('lbTitle');
const lbDesc    = document.getElementById('lbDesc');
const lbCat     = document.getElementById('lbCat');
const lbCurrent = document.getElementById('lbCurrent');
const lbTotal   = document.getElementById('lbTotal');
const lbLoader  = document.getElementById('lbLoader');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');
const lbBackdrop = document.getElementById('lbBackdrop');

let lbIndex = 0;

function lbOpen(index) {
  lbIndex = index;
  lbRender();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function lbClose_() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function lbRender() {
  const item = visibleItems[lbIndex];
  if (!item) return;

  // loader
  lbLoader.classList.remove('hidden');
  lbImg.classList.add('loading');

  const src = item.dataset.src;
  const img = new Image();
  img.onload = () => {
    lbImg.src = src;
    lbImg.alt = item.dataset.title || '';
    lbImg.classList.remove('loading');
    lbLoader.classList.add('hidden');
  };
  img.src = src;

  lbTitle.textContent   = item.dataset.title || '';
  lbDesc.textContent    = item.dataset.desc  || '';
  lbCat.textContent     = item.dataset.cat   || '';
  lbCurrent.textContent = lbIndex + 1;
  lbTotal.textContent   = visibleItems.length;

  lbPrev.disabled = lbIndex === 0;
  lbNext.disabled = lbIndex === visibleItems.length - 1;
}

function lbGo(dir) {
  const next = lbIndex + dir;
  if (next >= 0 && next < visibleItems.length) {
    lbIndex = next;
    lbRender();
  }
}

// Open on click
allItems.forEach((item, _) => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => {
    const idx = visibleItems.indexOf(item);
    if (idx !== -1) lbOpen(idx);
  });
});

lbClose.addEventListener('click', lbClose_);
lbBackdrop.addEventListener('click', lbClose_);
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); lbGo(-1); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); lbGo(1); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      lbClose_();
  if (e.key === 'ArrowLeft')   lbGo(-1);
  if (e.key === 'ArrowRight')  lbGo(1);
});

// Touch swipe on lightbox
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) lbGo(dx < 0 ? 1 : -1);
});

// ─── Avant / Après slider ───
(function () {
  const slider      = document.getElementById('baSlider');
  const beforeWrap  = document.getElementById('baBeforeWrap');
  const handle      = document.getElementById('baHandle');
  if (!slider) return;

  let dragging = false;

  function setPosition(clientX) {
    const rect = slider.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.min(Math.max(pct, 0.03), 0.97); // limites 3%–97%

    const pctPx = pct * 100;
    beforeWrap.style.width = pctPx + '%';
    handle.style.left      = pctPx + '%';

    // Maintient la largeur réelle de l'image avant (pour object-fit: cover)
    const realW = slider.offsetWidth;
    beforeWrap.querySelector('.ba-img').style.width = realW + 'px';
  }

  // Init à 50%
  function init() {
    beforeWrap.querySelector('.ba-img').style.width = slider.offsetWidth + 'px';
  }
  window.addEventListener('resize', init);
  // Attend que les images soient chargées
  const imgs = slider.querySelectorAll('img');
  let loaded = 0;
  imgs.forEach(img => {
    if (img.complete) { loaded++; if (loaded === imgs.length) init(); }
    else img.addEventListener('load', () => { loaded++; if (loaded === imgs.length) init(); });
  });

  // Mouse
  slider.addEventListener('mousedown', e => {
    dragging = true;
    slider.classList.add('dragging');
    setPosition(e.clientX);
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (dragging) setPosition(e.clientX);
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    slider.classList.remove('dragging');
  });

  // Touch
  slider.addEventListener('touchstart', e => {
    dragging = true;
    slider.classList.add('dragging');
    setPosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (dragging) setPosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => {
    dragging = false;
    slider.classList.remove('dragging');
  });
})();

// ─── Contact form ───
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Envoi en cours…';
    setTimeout(() => {
      form.style.display = 'none';
      formSuccess.classList.add('show');
    }, 1200);
  });
}

// ─── Active nav link ───
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active-link'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active-link');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => navObserver.observe(s));

// ─── Parallax hero shapes ───
window.addEventListener('mousemove', (e) => {
  const shapes = document.querySelectorAll('.shape');
  const x = (e.clientX / window.innerWidth  - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  shapes.forEach((s, i) => {
    const f = (i + 1) * 0.4;
    s.style.transform = `translate(${x*f}px, ${y*f}px)`;
  });
});
