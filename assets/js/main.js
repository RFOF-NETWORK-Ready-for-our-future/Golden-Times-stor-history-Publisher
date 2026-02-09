<!-- PATH: Golden-Times-stor-history-Publisher/assets/js/main.js -->
/*
  main.js
  Core UI behaviors for Golden Times Stor‑History Publisher
  RWPO‑conform: no external dependencies, only vanilla JS
*/

/* Utility: DOM ready */
function onReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

/* Simple logger (no external telemetry) */
const GT = {
  log: function(...args) {
    if (window && window.console) console.log('[GT]', ...args);
  }
};

/* Navigation toggle for small screens */
function initNavigationToggle() {
  const toggle = document.querySelector('.gt-nav-toggle');
  const nav = document.querySelector('.gt-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = nav.getAttribute('data-expanded') === 'true';
    nav.setAttribute('data-expanded', String(!expanded));
    nav.style.display = expanded ? 'none' : 'flex';
    toggle.setAttribute('aria-expanded', String(!expanded));
  });

  // Ensure initial responsive state
  function updateNavOnResize() {
    if (window.innerWidth <= 900) {
      nav.style.display = 'none';
      nav.setAttribute('data-expanded', 'false');
      if (toggle) toggle.style.display = 'inline-block';
    } else {
      nav.style.display = 'flex';
      nav.setAttribute('data-expanded', 'true');
      if (toggle) toggle.style.display = 'none';
    }
  }
  updateNavOnResize();
  window.addEventListener('resize', updateNavOnResize);
}

/* Smooth in‑page anchor scrolling */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a[href^="#"]');
    if (!el) return;
    const href = el.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', href);
  });
}

/* Simple theme toggle (persists in localStorage) */
function initThemeToggle() {
  const key = 'gt-theme';
  const root = document.documentElement;
  const stored = localStorage.getItem(key);
  if (stored === 'light') {
    root.classList.add('gt-theme-light');
  } else {
    root.classList.remove('gt-theme-light');
  }

  const toggles = document.querySelectorAll('[data-gt-theme-toggle]');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = root.classList.toggle('gt-theme-light');
      localStorage.setItem(key, isLight ? 'light' : 'dark');
      GT.log('Theme set to', isLight ? 'light' : 'dark');
    });
  });
}

/* Reader mode: simplified article view */
function initReaderMode() {
  const readerButtons = document.querySelectorAll('[data-gt-reader-toggle]');
  if (!readerButtons.length) return;

  function enableReaderMode(article) {
    article.classList.add('gt-reader-mode');
    document.body.classList.add('gt-reader-active');
  }
  function disableReaderMode(article) {
    article.classList.remove('gt-reader-mode');
    document.body.classList.remove('gt-reader-active');
  }

  readerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.getAttribute('data-gt-reader-target') || 'article';
      const article = document.querySelector(targetSelector);
      if (!article) return;
      const active = article.classList.contains('gt-reader-mode');
      if (active) disableReaderMode(article);
      else enableReaderMode(article);
    });
  });
}

/* Lightweight accessibility helpers */
function initAccessibilityHelpers() {
  // Add skip link focus handling if present
  const skip = document.querySelector('.gt-skip-link');
  if (skip) {
    skip.addEventListener('click', (e) => {
      const target = document.querySelector(skip.getAttribute('href'));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
        window.setTimeout(() => target.removeAttribute('tabindex'), 1000);
      }
    });
  }
}

/* Simple in-page table of contents generator for articles */
function initAutoTOC() {
  const article = document.querySelector('article.gt-doc-article, article.gt-crypto, article');
  if (!article) return;
  const headings = article.querySelectorAll('h2[id], h3[id]');
  if (!headings.length) return;

  const toc = document.createElement('nav');
  toc.className = 'gt-auto-toc';
  const list = document.createElement('ul');
  list.className = 'gt-auto-toc-list';
  headings.forEach(h => {
    const li = document.createElement('li');
    li.className = 'gt-auto-toc-item';
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });
  toc.appendChild(list);

  // Insert TOC before the first section if space allows
  const firstSection = article.querySelector('section');
  if (firstSection) article.insertBefore(toc, firstSection);
}

/* Initialize animations (class toggles for CSS animations) */
function initAnimations() {
  // Add fade-in to elements with .fade-in
  const els = document.querySelectorAll('.fade-in');
  els.forEach((el, i) => {
    el.style.animationDelay = `${i * 80}ms`;
  });
}

/* Basic client-side search placeholder (non-indexed) */
function initSearchPlaceholder() {
  const input = document.querySelector('[data-gt-search-input]');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const results = document.querySelectorAll('[data-gt-searchable]');
    results.forEach(el => {
      const text = el.textContent.toLowerCase();
      el.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

/* Boot sequence */
onReady(() => {
  GT.log('Initializing Golden Times UI');
  try {
    initNavigationToggle();
    initSmoothScroll();
    initThemeToggle();
    initReaderMode();
    initAccessibilityHelpers();
    initAutoTOC();
    initAnimations();
    initSearchPlaceholder();
    GT.log('Initialization complete');
  } catch (err) {
    GT.log('Initialization error', err);
  }
});
