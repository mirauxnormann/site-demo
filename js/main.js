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
  const slider = document.getElementById('baSlider');
  const before = document.getElementById('baBefore');
  const handle = document.getElementById('baHandle');
  if (!slider) return;

  let dragging = false;

  function setPosition(clientX) {
    const rect = slider.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.min(Math.max(pct, 0.03), 0.97);

    before.style.clipPath = `inset(0 ${(1 - pct) * 100}% 0 0)`;
    handle.style.left = (pct * 100) + '%';
  }

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

// ─── Météo & Vigilance ───
(function () {
  const loading = document.getElementById('meteoLoading');
  const content = document.getElementById('meteoContent');
  const denied  = document.getElementById('meteoDenied');
  if (!content) return;

  const WMO = {
    0:  ['Ciel dégagé','☀️'],   1:  ['Peu nuageux','🌤️'],
    2:  ['Partiellement nuageux','⛅'], 3: ['Couvert','☁️'],
    45: ['Brouillard','🌫️'],    48: ['Brouillard givrant','🌫️'],
    51: ['Bruine légère','🌦️'], 53: ['Bruine','🌦️'],   55: ['Bruine dense','🌧️'],
    61: ['Pluie légère','🌧️'],  63: ['Pluie modérée','🌧️'], 65: ['Pluie forte','🌧️'],
    71: ['Neige légère','❄️'],   73: ['Neige modérée','❄️'], 75: ['Neige forte','❄️'],
    77: ['Grains de neige','🌨️'],
    80: ['Averses légères','🌦️'], 81: ['Averses','🌦️'], 82: ['Averses violentes','⛈️'],
    85: ['Averses de neige','🌨️'], 86: ['Averses de neige fortes','🌨️'],
    95: ['Orage','⛈️'], 96: ['Orage avec grêle','⛈️'], 99: ['Orage violent','⛈️'],
  };

  const LEVELS = {
    vert:   { label: 'Aucune vigilance',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: '🟢' },
    jaune:  { label: 'Vigilance jaune',    color: '#eab308', bg: 'rgba(234,179,8,0.12)',  icon: '🟡' },
    orange: { label: 'Vigilance orange',   color: '#f97316', bg: 'rgba(249,115,22,0.15)', icon: '🟠' },
    rouge:  { label: 'Vigilance rouge',    color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  icon: '🔴' },
  };
  const PRIO = { vert: 0, jaune: 1, orange: 2, rouge: 3 };

  function level(gust, code) {
    const storm = [95, 96, 99].includes(code);
    if (gust >= 117 || (storm && gust >= 89)) return 'rouge';
    if (gust >= 89  || (storm && gust >= 70)) return 'orange';
    if (gust >= 70  || storm)                  return 'jaune';
    return 'vert';
  }

  function fmtDatetime(iso) {
    return new Date(iso).toLocaleString('fr-FR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' });
  }

  async function getCity(lat, lon) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { 'Accept-Language': 'fr' } });
      const d = await r.json();
      return d.address.city || d.address.town || d.address.village || d.address.municipality || 'Votre région';
    } catch { return 'Votre région'; }
  }

  async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,wind_speed_10m,wind_gusts_10m,weather_code,precipitation`
      + `&hourly=wind_speed_10m,wind_gusts_10m,weather_code`
      + `&forecast_days=4&wind_speed_unit=kmh&timezone=auto`;
    const r = await fetch(url);
    return r.json();
  }

  function peakAlert(hourly) {
    const now = new Date();
    let best = 'vert', maxGust = 0, start = null, end = null;
    for (let i = 0; i < Math.min(hourly.time.length, 72); i++) {
      if (new Date(hourly.time[i]) < now) continue;
      const g = hourly.wind_gusts_10m[i];
      const lv = level(g, hourly.weather_code[i]);
      if (PRIO[lv] > PRIO[best]) best = lv;
      if (g > maxGust) { maxGust = g; }
      if (lv !== 'vert') { if (!start) start = hourly.time[i]; end = hourly.time[i]; }
    }
    return { level: best, gust: maxGust, start, end };
  }

  function render(city, data) {
    const cur = data.current;
    const h   = data.hourly;
    const [wLabel, wIcon] = WMO[cur.weather_code] || ['Variable', '🌡️'];
    const alert = peakAlert(h);
    const al = LEVELS[alert.level];

    // next 24h bars
    const now = new Date();
    const bars = [];
    for (let i = 0; i < h.time.length && bars.length < 24; i++) {
      if (new Date(h.time[i]) >= now) bars.push({ t: h.time[i], g: h.wind_gusts_10m[i], c: h.weather_code[i] });
    }
    const maxG = Math.max(...bars.map(b => b.g), 30);
    const barsHTML = bars.map((b, idx) => {
      const lv = level(b.g, b.c);
      const pct = Math.max(Math.round((b.g / Math.max(maxG, 120)) * 100), 4);
      const hr = new Date(b.t).toLocaleString('fr-FR', { hour:'2-digit', minute:'2-digit' });
      const lbl = idx % 6 === 0 ? `<span class="meteo-bar-label">${hr}</span>` : '';
      return `<div class="meteo-bar-wrap"><div class="meteo-bar" style="height:${pct}%;background:${LEVELS[lv].color}" title="${Math.round(b.g)} km/h · ${hr}"></div>${lbl}</div>`;
    }).join('');

    let alertHTML;
    if (alert.level === 'vert') {
      alertHTML = `<div class="meteo-alert" style="--al-color:${al.color};--al-bg:${al.bg}">
        <span class="meteo-alert-icon">${al.icon}</span>
        <div><strong>${al.label}</strong><p>Aucune perturbation significative prévue dans les 72 prochaines heures.</p></div>
      </div>`;
    } else {
      const typeLabel = ['rouge','orange'].includes(alert.level) ? 'VENT VIOLENT' : 'CONDITIONS DÉFAVORABLES';
      alertHTML = `<div class="meteo-alert meteo-alert--active" style="--al-color:${al.color};--al-bg:${al.bg}">
        <span class="meteo-alert-icon">${al.icon}</span>
        <div>
          <strong>${al.label} — ${typeLabel}</strong>
          <p>Rafales pouvant atteindre <strong>${Math.round(alert.gust)} km/h</strong></p>
          ${alert.start ? `<p>Début prévu : <strong>${fmtDatetime(alert.start)}</strong></p>` : ''}
          ${alert.end   ? `<p>Fin estimée : <strong>${fmtDatetime(alert.end)}</strong></p>`   : ''}
        </div>
      </div>`;
    }

    const now2 = new Date();
    const updated = now2.toLocaleString('fr-FR', { hour:'2-digit', minute:'2-digit' });

    content.innerHTML = `
      <div class="meteo-header">
        <div class="meteo-location">📍 <strong>${city}</strong></div>
        <div class="meteo-updated">Mis à jour à ${updated}</div>
      </div>
      <div class="meteo-current">
        <div class="meteo-main">
          <span class="meteo-icon">${wIcon}</span>
          <span class="meteo-temp">${Math.round(cur.temperature_2m)}°C</span>
          <span class="meteo-desc">${wLabel}</span>
        </div>
        <div class="meteo-stats">
          <div class="meteo-stat"><span class="meteo-stat-icon">💨</span><span class="meteo-stat-val">${Math.round(cur.wind_speed_10m)} km/h</span><small>Vent</small></div>
          <div class="meteo-stat"><span class="meteo-stat-icon">🌬️</span><span class="meteo-stat-val">${Math.round(cur.wind_gusts_10m)} km/h</span><small>Rafales</small></div>
          <div class="meteo-stat"><span class="meteo-stat-icon">🌧️</span><span class="meteo-stat-val">${cur.precipitation} mm</span><small>Précip.</small></div>
        </div>
      </div>
      ${alertHTML}
      <div class="meteo-forecast">
        <div class="meteo-forecast-label">Rafales sur les 24 prochaines heures</div>
        <div class="meteo-bars">${barsHTML}</div>
      </div>`;

    loading.style.display = 'none';
    content.style.display = 'block';
  }

  function load() {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const [weather, city] = await Promise.all([getWeather(lat, lon), getCity(lat, lon)]);
          render(city, weather);
        } catch {
          loading.innerHTML = '<p style="color:#f87171;padding:40px;text-align:center">Erreur de chargement météo.</p>';
        }
      },
      () => { loading.style.display = 'none'; denied.style.display = 'block'; },
      { timeout: 10000 }
    );
  }

  load();
  setInterval(load, 30 * 60 * 1000);
})();

// ─── Carte zones d'intervention ───
(function () {
  const mapEl = document.getElementById('zonesMap');
  if (!mapEl || typeof L === 'undefined') return;

  const versailles = [48.8014, 2.1301];

  const map = L.map('zonesMap', {
    center: versailles,
    zoom: 9,
    scrollWheelZoom: false,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  L.circle(versailles, {
    radius: 80000,
    color: '#f59e0b',
    fillColor: '#f59e0b',
    fillOpacity: 0.07,
    weight: 2,
    opacity: 0.5,
  }).addTo(map);

  const icon = L.divIcon({
    className: '',
    html: '<div class="zone-pin"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -14],
  });

  L.marker(versailles, { icon })
    .addTo(map)
    .bindPopup('<strong>Le Couvreur</strong><br>Siège social — Versailles (78)')
    .openPopup();
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
