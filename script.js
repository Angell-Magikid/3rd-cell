/* ═══════════════════════════════════════════════════
   3rd Cell — interaction layer
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── Sticky header ───────── */
  const header = $('#siteHeader');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ───────── Search bar ───────── */
  const searchToggle = $('#searchToggle');
  const searchClose  = $('#searchClose');
  const searchInput  = $('#searchBar input');
  searchToggle.addEventListener('click', () => {
    const open = header.classList.toggle('search-open');
    if (open) setTimeout(() => searchInput.focus(), 240);
  });
  searchClose.addEventListener('click', () => header.classList.remove('search-open'));
  $('#searchBar').addEventListener('submit', e => e.preventDefault());

  /* ───────── Mobile navigation ───────── */
  const nav = $('#primaryNav');
  const burger = $('#navToggle');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-link').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* ───────── Hero carousel ───────── */
  const hero     = $('#hero');
  const slides   = $$('.hero-slide', hero);
  const dotsWrap = $('#heroDots');
  const titleEl  = $('.hero-title', hero);
  const eyebrowEl= $('.hero-eyebrow', hero);
  const subEl    = $('.hero-sub', hero);
  const ctaEl    = $('.hero-copy .btn', hero);
  const scriptEl = $('.hero-script', hero);

  const COPY = [
    {
      theme: 'light',
      eyebrow: 'Regenerate<br>Activate<br>Live Brighter',
      lines: ['3rd Cell', 'Super Power', 'for a Healthier', 'Tomorrow'],
      sub: 'Engineering the Future of Cell Manufacturing',
      cta: 'Explore Our Solutions',
      script: 'Healthy Cells<br><span>Brighter Lives</span>'
    },
    {
      theme: 'light',
      eyebrow: 'Precision<br>Automation<br>Consistency',
      lines: ['Intelligent Cell', 'Manufacturing', 'Programmable', '&amp; Scalable'],
      sub: 'AI-Native CDMO for Cell &amp; Gene Therapy',
      cta: 'Our Technology',
      script: 'Automated<br><span>Cell Production</span>'
    },
    {
      theme: 'dark',
      eyebrow: 'Robotics<br>Intelligence<br>Scale',
      lines: ['One Platform', 'Every Cell Type', 'From iPSC', 'to CAR-T'],
      sub: 'iPSC &middot; MSC &middot; CAR-T &middot; CAR-NK &middot; HSC',
      cta: 'Explore the Platform',
      script: 'Living Products<br><span>Industrial Precision</span>'
    }
  ];

  let current = 0;
  let timer = null;

  // build dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Slide ' + (i + 1));
    b.addEventListener('click', () => go(i, true));
    dotsWrap.appendChild(b);
  });
  const dots = $$('button', dotsWrap);

  function render(i) {
    const c = COPY[i] || COPY[0];
    hero.dataset.theme = c.theme;
    eyebrowEl.innerHTML = c.eyebrow
      .split('<br>')
      .map(t => `<span>${t}</span>`)
      .join('');
    titleEl.innerHTML = c.lines
      .map((t, n) => `<span class="${n < 2 ? 't-dark' : 't-blue'}">${t}</span>`)
      .join('');
    subEl.innerHTML = c.sub;
    ctaEl.childNodes[0].nodeValue = c.cta + ' ';
    scriptEl.innerHTML = c.script;
  }

  function go(i, userInitiated) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('is-active', n === current));
    dots.forEach((d, n) => d.setAttribute('aria-selected', String(n === current)));
    render(current);
    if (userInitiated) restart();
  }

  function restart() {
    if (reduceMotion) return;
    clearInterval(timer);
    timer = setInterval(() => go(current + 1), 7000);
  }

  $('#heroPrev').addEventListener('click', () => go(current - 1, true));
  $('#heroNext').addEventListener('click', () => go(current + 1, true));
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', restart);
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  go(current - 1, true);
    if (e.key === 'ArrowRight') go(current + 1, true);
  });

  // swipe
  let touchX = null;
  hero.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 55) go(current + (dx < 0 ? 1 : -1), true);
    touchX = null;
  });

  render(0);
  go(0);
  restart();

  /* ───────── Scroll reveal ───────── */
  const revealables = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en, i) => {
        if (!en.isIntersecting) return;
        const delay = (Array.from(en.target.parentElement.children).indexOf(en.target) % 5) * 90;
        setTimeout(() => en.target.classList.add('is-in'), delay);
        io.unobserve(en.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }

  /* ───────── Scroll spy for the nav ───────── */
  const links = $$('.nav-link');
  const targets = links
    .map(l => ({ link: l, el: $(l.getAttribute('href')) }))
    .filter(t => t.el);

  if ('IntersectionObserver' in window && targets.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => l.classList.remove('is-active'));
        const hit = targets.find(t => t.el === en.target);
        if (hit) hit.link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => spy.observe(t.el));
  }

  /* ───────── Subscribe form ───────── */
  const form = $('#subForm');
  const note = $('#subNote');
  const email = $('#subEmail');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = email.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (!ok) {
      note.textContent = 'Please enter a valid email address.';
      note.style.color = '#FFC9C9';
      email.focus();
      return;
    }
    note.textContent = 'Thank you — you are on the list.';
    note.style.color = '#8EE0DC';
    form.reset();
  });

  /* ───────── Video modal ───────── */
  const modal = $('#videoModal');
  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  $('#watchVideo').addEventListener('click', openModal);
  $$('[data-close]', modal).forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();
