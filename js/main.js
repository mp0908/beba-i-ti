/* ============================================================
   BEBA I TI — main.js
   - Header scroll / dark-section state
   - Mobile meni
   - Aktivan link u navigaciji
   - Scroll-reveal "develop" efekat (IntersectionObserver)
   - Automatsko učitavanje galerije iz foldera (1.jpg, 2.jpg, ...)
   - Lightbox sa tastaturom i navigacijom
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Godina u footeru ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: scroll + dark hero state ---------- */
  const header = document.getElementById('siteHeader');
  const hero = document.getElementById('hero');

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (hero) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          header.classList.toggle('is-on-dark', entry.isIntersecting);
        });
      },
      { threshold: 0.6 }
    );
    heroObserver.observe(hero);
  }

  /* ---------- Mobilni meni ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');

  const closeMobileNav = () => {
    mobileNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('[data-mobile-link]').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* ---------- Aktivan link prilikom skrolovanja ---------- */
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const sectionIds = ['o-meni', 'galerija', 'pitanja', 'kontakt'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle(
              'is-active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach((sec) => navObserver.observe(sec));
  }

  /* ---------- Povratak na vrh ---------- */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Scroll-reveal "develop" efekat ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-developed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- FAQ akordeon ---------- */
  document.querySelectorAll('.faq-question').forEach((btn) => {
    const answer = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-question').forEach((other) => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  });

  /* ===========================================================
     GALERIJA — automatsko učitavanje slika iz foldera
     Stavite slike u odgovarajući folder i nazovite ih redom:
     1.jpg, 2.jpg, 3.jpg ... (podržani formati: jpg, jpeg, png, webp)
     Skripta sama prepoznaje koliko slika postoji — nije potrebno
     ništa menjati u kodu.
  =========================================================== */

  const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'PNG'];
  const MAX_CONSECUTIVE_MISSES = 4;
  const HARD_CAP = 150;

  function probeImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function findImageAtIndex(folder, index) {
    for (const ext of EXTENSIONS) {
      const path = encodeURI(`${folder}/${index}.${ext}`);
      // eslint-disable-next-line no-await-in-loop
      const found = await probeImage(path);
      if (found) return found;
    }
    return null;
  }

  async function loadGalleryImages(folder) {
    const results = [];
    let consecutiveMisses = 0;

    for (let i = 1; i <= HARD_CAP; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const path = await findImageAtIndex(folder, i);
      if (path) {
        results.push(path);
        consecutiveMisses = 0;
      } else {
        consecutiveMisses += 1;
        if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) break;
      }
    }
    return results;
  }

  function buildFigure(src, index, galleryImages) {
    const figure = document.createElement('figure');
    figure.className = 'reveal';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Beba i Ti — fotografija iz portfolija';
    img.loading = 'lazy';

    const tag = document.createElement('span');
    tag.className = 'frame-tag mono';
    tag.textContent = `No. ${String(index).padStart(3, '0')}`;

    figure.appendChild(img);
    figure.appendChild(tag);

    // Navigacija u lightbox-u ostaje unutar SVOJE galerije (Studio / Dom / Hrast)
    figure.addEventListener('click', () => openLightbox(galleryImages, src));
    revealObserver.observe(figure);

    return figure;
  }

  async function initGallery(gridId, folder) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const images = await loadGalleryImages(folder);
    grid.innerHTML = '';

    if (!images.length) {
      const empty = document.createElement('p');
      empty.className = 'gallery-empty mono';
      empty.textContent = `Galerija "${folder}" se uskoro puni…`;
      grid.appendChild(empty);
      return;
    }

    images.forEach((src, i) => {
      grid.appendChild(buildFigure(src, i + 1, images));
    });
  }

  const galleryGrids = document.querySelectorAll('[data-gallery-folder]');
  galleryGrids.forEach((grid) => {
    initGallery(grid.id, grid.dataset.galleryFolder);
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGallery = [];
  let currentIndex = 0;

  function renderLightbox() {
    const src = currentGallery[currentIndex];
    lightboxImg.src = src;
    lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(currentGallery.length).padStart(2, '0')}`;
  }

  function openLightbox(gallery, src) {
    currentGallery = gallery;
    currentIndex = Math.max(0, gallery.indexOf(src));
    renderLightbox();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    renderLightbox();
  }
  function showPrev() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    renderLightbox();
  }

  if (lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', showNext);
    lightboxPrev.addEventListener('click', showPrev);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });
  }

});