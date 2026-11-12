/* ============================================================
   PORTFOLIO — Pablo Mascaró Jiménez
   script.js · Interacciones (v4)
   ------------------------------------------------------------
   · HUD eliminado (no funcionaba)
   · Split-flap aeroportuario en el navbar
   ============================================================ */

'use strict';

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ============================================================
   1. RELOJ LOCAL (Europe/Madrid)
   ============================================================ */
const clockEl = $('#clock');

if (clockEl) {
  const timeFmt = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

  const tick = () => {
    clockEl.textContent = `${timeFmt.format(new Date())} · ES`;
  };

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   2. REVEAL AL HACER SCROLL
   ============================================================ */
const revealEls = $$('.reveal');

if (prefersReduced) {
  revealEls.forEach(el => el.classList.add('in-view'));
} else {
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      revealIO.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealIO.observe(el));
}

/* ============================================================
   3. NAV — estado compacto al desplazarse + enlace activo
   ============================================================ */
const nav = $('#nav');

if (nav) {
  const updateNavState = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });
}

const sections = $$('main section[id]');
const navLinks = $$('.nav-links a');

if (sections.length && navLinks.length) {
  const activeIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;

      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, {
    rootMargin: '-40% 0px -55% 0px'
  });

  sections.forEach(sec => activeIO.observe(sec));
}

/* ============================================================
   4. MENÚ MÓVIL
   ============================================================ */
const navToggle = $('#navToggle');
const navLinksBox = $('#navLinks');

if (navToggle && navLinksBox) {
  const setMenu = (open) => {
    navLinksBox.classList.toggle('open', open);
    nav?.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
  };

  navToggle.addEventListener('click', () => {
    setMenu(!navLinksBox.classList.contains('open'));
  });

  navLinksBox.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
}

/* ============================================================
   5. BARRA DE PROGRESO DE SCROLL
   ============================================================ */
const progressEl = $('#scrollProgress');

if (progressEl) {
  const updateProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    progressEl.style.width = `${pct}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
}

/* ============================================================
   6. CURSOR PERSONALIZADO
   ============================================================ */
if (finePointer && !prefersReduced) {
  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');

  if (dot && ring) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX, dotY = mouseY;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      document.body.classList.add('cursor-active');
    });

    document.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-active');
    });

    const animateCursor = () => {
      dotX  += (mouseX - dotX)  * 0.35;
      dotY  += (mouseY - dotY)  * 0.35;
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;

      dot.style.setProperty('--x', `${dotX}px`);
      dot.style.setProperty('--y', `${dotY}px`);
      ring.style.setProperty('--x', `${ringX}px`);
      ring.style.setProperty('--y', `${ringY}px`);

      requestAnimationFrame(animateCursor);
    };

    animateCursor();

    $$('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }
}

/* ============================================================
   7. PARALLAX SUAVE DEL FONDO
   ============================================================ */
const blobsEl = $('.blobs');

if (blobsEl && finePointer && !prefersReduced) {
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 30;
    targetY = (e.clientY / window.innerHeight - 0.5) * 30;
  });

  const animateBlobs = () => {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    blobsEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(animateBlobs);
  };

  animateBlobs();
}

/* ============================================================
   8. MARQUEE — JS-driven, acelera con el scroll
   ============================================================ */
let scrollVelocity = 0;
let lastY = window.scrollY;
let velocityDecayTimer = null;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  scrollVelocity = y - lastY;
  lastY = y;

  document.body.classList.toggle('fast-scroll', Math.abs(scrollVelocity) > 45);

  clearTimeout(velocityDecayTimer);
  velocityDecayTimer = setTimeout(() => { scrollVelocity = 0; }, 120);
}, { passive: true });

class Marquee {
  constructor(el, baseSpeed, dir) {
    this.el = el;
    this.track = el.querySelector('.marquee-track');
    if (!this.track) return;

    [...this.track.children].forEach((c) => this.track.appendChild(c.cloneNode(true)));

    this.baseSpeed = baseSpeed;
    this.dir = dir;
    this.x = 0;
    this.halfWidth = 0;
    this.paused = false;

    el.addEventListener('mouseenter', () => { this.paused = true; });
    el.addEventListener('mouseleave', () => { this.paused = false; });

    this.measure();
    window.addEventListener('resize', () => this.measure());
  }

  measure() {
    this.halfWidth = this.track.scrollWidth / 2;
    if (this.dir === 1) this.x = -this.halfWidth;
  }

  tick() {
    if (!this.halfWidth) return;
    if (!this.paused) {
      const boost = Math.min(Math.abs(scrollVelocity) * 0.5, 38);
      this.x += (this.baseSpeed + boost) * this.dir;

      if (this.x <= -this.halfWidth) this.x += this.halfWidth;
      if (this.x >= 0)              this.x -= this.halfWidth;

      this.track.style.transform = `translate3d(${this.x.toFixed(2)}px,0,0)`;
    }
  }
}

const marquees = [];
if (!prefersReduced) {
  $$('.marquee').forEach((el) => {
    const reverse = el.classList.contains('marquee-reverse');
    marquees.push(new Marquee(el, reverse ? 0.45 : 0.65, reverse ? 1 : -1));
  });
}

function tickMarquees() {
  marquees.forEach((m) => m.tick());
  requestAnimationFrame(tickMarquees);
}
if (marquees.length) tickMarquees();

/* ============================================================
   9. DOT-TOY del hero
   ============================================================ */
const dotToy = document.getElementById('dotToy');
const heroEl = document.querySelector('.hero');

if (dotToy && heroEl && finePointer && !prefersReduced) {
  const COLS = 12;
  const ROWS = 6;
  for (let i = 0; i < COLS * ROWS; i++) {
    const d = document.createElement('i');
    d.className = 'toy-dot';
    dotToy.appendChild(d);
  }
  const dots = [...dotToy.children];
  let positions = [];

  const layout = () => {
    positions = dots.map((d) => {
      const r = d.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  };
  layout();
  window.addEventListener('resize', layout);
  window.addEventListener('scroll', layout, { passive: true });

  heroEl.addEventListener('mousemove', (e) => {
    dots.forEach((d, i) => {
      const p = positions[i];
      if (!p) return;
      const dist = Math.hypot(e.clientX - p.x, e.clientY - p.y);
      d.classList.toggle('lit', dist < 110);
    });
  });

  heroEl.addEventListener('mouseleave', () => {
    dots.forEach((d) => d.classList.remove('lit'));
  });
}

/* ============================================================
   10. SPLIT: títulos de sección palabra por palabra
   ============================================================ */
$$('.section-title').forEach((el) => {
  const original = [...el.childNodes];
  el.innerHTML = '';
  let wordIndex = 0;

  original.forEach((node) => {
    if (node.nodeType === 3) {
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          el.appendChild(document.createTextNode(part));
          return;
        }
        const wrap = document.createElement('span');
        wrap.className = 'word';
        const inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.style.setProperty('--i', wordIndex++);
        inner.textContent = part;
        wrap.appendChild(inner);
        el.appendChild(wrap);
      });
    } else {
      el.appendChild(node);
    }
  });
});

/* ============================================================
   11. SPLIT: letras del hero con hover juguetón
   ============================================================ */
$$('.hero-title .line').forEach((line) => {
  const nodes = [...line.childNodes];
  line.innerHTML = '';
  nodes.forEach((node) => {
    if (node.nodeType === 3) {
      [...node.textContent].forEach((ch) => {
        if (ch.trim() === '') {
          line.appendChild(document.createTextNode(ch));
          return;
        }
        const s = document.createElement('span');
        s.className = 'char';
        s.textContent = ch;
        line.appendChild(s);
      });
    } else {
      line.appendChild(node);
    }
  });
});

/* ============================================================
   12. BOTONES MAGNÉTICOS
   ============================================================ */
if (finePointer && !prefersReduced) {
  $$('.glass-btn, .contact-mail, .back-top').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.22;
      const y = (e.clientY - r.top - r.height / 2) * 0.22;
      el.style.transition = 'transform 0.08s ease-out';
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.4s var(--ease)';
      el.style.transform = '';
    });
  });
}

/* ============================================================
   13. GALERÍA
   ============================================================ */
const gallery = $('.gallery');

if (gallery) {
  const track = $('.gallery-track', gallery);
  const previousButton = $('.gallery-prev', gallery);
  const nextButton = $('.gallery-next', gallery);
  const currentLabel = $('.gallery-current', gallery);
  const totalLabel = $('.gallery-total', gallery);

  if (track && previousButton && nextButton && currentLabel && totalLabel) {
    let currentIndex = 0;

    const updateGallery = () => {
      currentLabel.textContent = String(currentIndex + 1).padStart(2, '0');
      [...track.children].forEach((item, index) => {
        item.setAttribute('aria-hidden', String(index !== 1));
      });
    };

    totalLabel.textContent = String(track.children.length).padStart(2, '0');
    if (track.children.length > 1) {
      track.prepend(track.lastElementChild);
    }
    updateGallery();

    nextButton.addEventListener('click', () => {
      track.append(track.firstElementChild);
      currentIndex = (currentIndex + 1) % track.children.length;
      updateGallery();
    });

    previousButton.addEventListener('click', () => {
      track.prepend(track.lastElementChild);
      currentIndex = (currentIndex - 1 + track.children.length) % track.children.length;
      updateGallery();
    });
  }
}

/* ============================================================
   14. AÑO DEL FOOTER
   ============================================================ */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();