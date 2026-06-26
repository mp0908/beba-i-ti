document.addEventListener('DOMContentLoaded', () => {

  /* ── Godina ── */
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ── Header scroll + hero state ── */
  const header = document.getElementById('siteHeader');
  const hero   = document.getElementById('hero');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (hero && header) {
    const io = new IntersectionObserver(entries => {
      header.classList.toggle('on-hero', entries[0].isIntersecting);
    }, { threshold: 0.2 });
    io.observe(hero);
    header.classList.add('on-hero');
  }

  /* ── Hero image fade-in ── */
  const heroImg = document.querySelector('.hero-bg img');
  if (heroImg) {
    if (heroImg.complete) {
      heroImg.classList.add('loaded');
    } else {
      heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
    }
  }

  /* ── Hero text animation ── */
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  const heroTitle   = document.querySelector('.hero-title');
  const heroTagline = document.querySelector('.hero-tagline');
  const heroActions = document.querySelector('.hero-actions');
  setTimeout(() => heroEyebrow && heroEyebrow.classList.add('in'), 300);
  setTimeout(() => heroTitle   && heroTitle.classList.add('in'),   500);
  setTimeout(() => heroTagline && heroTagline.classList.add('in'), 650);
  setTimeout(() => heroActions && heroActions.classList.add('in'), 800);

  /* ── Mobile nav ── */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav  = document.getElementById('mobileNav');

  function closeMobile() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });
  }

  /* ── Scroll reveal ── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── Back to top ── */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const body = b.nextElementSibling;
        if (body) body.style.maxHeight = null;
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        const body = btn.nextElementSibling;
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ── Lightbox ── */
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCounter = document.getElementById('lbCounter');
  const lbLabel   = document.getElementById('lbLabel');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');
  const lbThumbs  = document.getElementById('lbThumbs');

  if (!lightbox || !lbImg || !lbClose || !lbPrev || !lbNext) return;

  let gallery = [];
  let idx = 0;

  function renderLb() {
    const item = gallery[idx];
    if (!item) return;
    lbImg.src = item.src;
    lbImg.alt = item.label || '';
    if (lbCounter) lbCounter.textContent = `${idx + 1} / ${gallery.length}`;
    if (lbLabel)   lbLabel.textContent   = item.label || '';
    if (lbThumbs) {
      lbThumbs.querySelectorAll('.lb-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === idx);
        if (i === idx) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      });
    }
  }

  function openLb(imgs, startSrc) {
    gallery = imgs;
    idx = Math.max(0, imgs.findIndex(i => i.src === startSrc));

    if (lbThumbs) {
      lbThumbs.innerHTML = '';
      imgs.forEach((im, i) => {
        const t = document.createElement('img');
        t.src = im.src;
        t.className = 'lb-thumb';
        t.alt = im.label || '';
        t.addEventListener('click', () => { idx = i; renderLb(); });
        lbThumbs.appendChild(t);
      });
    }

    renderLb();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLb() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prev() { idx = (idx - 1 + gallery.length) % gallery.length; renderLb(); }
  function next() { idx = (idx + 1) % gallery.length; renderLb(); }

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  let touchX = 0;
  lightbox.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  });

  /* ── Wire galleries ── */
  document.querySelectorAll('.gallery-grid').forEach(grid => {
    const figures = Array.from(grid.querySelectorAll('figure'));
    const imgs = figures.map(fig => {
      const img = fig.querySelector('img');
      return img ? { src: img.src, label: img.alt } : null;
    }).filter(Boolean);

    figures.forEach((fig, i) => {
      fig.addEventListener('click', () => openLb(imgs, imgs[i].src));
    });
  });

  /* ── Wire homepage strip ── */
  const strip = document.getElementById('photoStrip');
  if (strip) {
    const photos = Array.from(strip.querySelectorAll('.strip-photo'));
    const imgs = photos.map(p => {
      const img = p.querySelector('img');
      return img ? { src: img.src, label: img.alt } : null;
    }).filter(i => i && i.src && !i.src.endsWith('undefined'));

    photos.forEach((p, i) => {
      const img = p.querySelector('img');
      if (img && imgs[i]) img.addEventListener('click', () => openLb(imgs, imgs[i].src));
    });
  }

});