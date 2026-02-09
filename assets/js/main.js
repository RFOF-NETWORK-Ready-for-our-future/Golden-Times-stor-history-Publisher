/*
  main.js
  Core UI behaviors for Golden Times Stor‑History Publisher
  Single-file approach: injects app-frame CSS/DOM/handlers so no other files must change
*/

/* Utility: DOM ready */
function onReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

/* Simple logger */
const GT = {
  log: function(...args) {
    if (window && window.console) console.log('[GT]', ...args);
  }
};

/* ------------------ Existing UI functions (kept and reused) ------------------ */

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
  if (stored === 'light') root.classList.add('gt-theme-light');
  else root.classList.remove('gt-theme-light');

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

  const firstSection = article.querySelector('section');
  if (firstSection) article.insertBefore(toc, firstSection);
}

/* Initialize animations (class toggles for CSS animations) */
function initAnimations() {
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

/* ------------------ New app-frame features injected via JS only ------------------ */

/* Inject viewport meta if missing */
function ensureViewportMeta() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const m = document.createElement('meta');
    m.name = 'viewport';
    m.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
    document.head.appendChild(m);
    GT.log('Viewport meta injected');
  }
}

/* Inject central CSS for app-frame and controls */
function injectAppCSS() {
  if (document.querySelector('style[data-injected-by="gt-app-frame"]')) return;
  const css = `
    :root {
      --design-width: 1200px;
      --app-scale: 0.85;
      --max-content-width: 1200px;
      --base-bg: #fffaf0;
      --base-font: system-ui, -apple-system, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }
    html,body { height:100%; margin:0; background:var(--base-bg); -webkit-text-size-adjust:100%; }
    .js-app-frame { box-sizing:border-box; width:var(--max-content-width); margin:0 auto; transform-origin:top center; transform:scale(var(--app-scale)); max-width:100%; min-height:100vh; overflow-x:hidden; transition:transform 220ms ease; position:relative; }
    .js-app-content { padding:48px; box-sizing:border-box; width:100%; }
    body { font-family:var(--base-font); color:#111; font-size:16px; line-height:1.6; }
    h1 { font-size:clamp(1.4rem, 2.2vw, 2.4rem); line-height:1.05; }
    p { font-size:clamp(0.95rem, 1.6vw, 1.05rem); }
    .app-scale-controls { position:fixed; right:12px; bottom:12px; z-index:9999; display:flex; gap:8px; background:rgba(255,255,255,0.85); padding:6px; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.08); font-size:14px; }
    .app-scale-controls button { padding:6px 8px; border:0; background:#111; color:#fff; border-radius:6px; cursor:pointer; }
    @media (max-width:900px) { :root { --app-scale: 0.95; --max-content-width: 900px; } }
  `;
  const style = document.createElement('style');
  style.setAttribute('data-injected-by', 'gt-app-frame');
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
  GT.log('App CSS injected');
}

/* Ensure app wrapper exists and create #app-content */
function ensureAppWrapper() {
  const prefer = ['app-root', 'app', 'app-frame', 'main'];
  let wrapper = null;
  for (const id of prefer) {
    const el = document.getElementById(id) || document.querySelector('.' + id);
    if (el) { wrapper = el; break; }
  }
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'js-app-root';
    document.body.prepend(wrapper);
    // move existing children into wrapper except scripts with data-injected-by
    const nodes = Array.from(document.body.childNodes).filter(n => n !== wrapper);
    nodes.forEach(n => wrapper.appendChild(n));
  }
  if (!wrapper.classList.contains('js-app-frame')) wrapper.classList.add('js-app-frame');

  let content = wrapper.querySelector('#app-content') || wrapper.querySelector('.app-content') || wrapper.querySelector('main');
  if (!content) {
    content = document.createElement('main');
    content.id = 'app-content';
    const children = Array.from(wrapper.childNodes).filter(n => n.nodeType === 1 && n !== content);
    children.forEach(c => content.appendChild(c));
    wrapper.appendChild(content);
  }
  if (!content.classList.contains('js-app-content')) content.classList.add('js-app-content');

  return { wrapper, content };
}

/* Prevent pinch zoom and double-tap (best-effort) */
function installTouchGuards() {
  let lastDist = null;
  document.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches.length === 2) lastDist = getDist(e.touches[0], e.touches[1]);
  }, { passive: false });

  document.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches.length === 2) e.preventDefault();
  }, { passive: false });

  let lastTap = 0;
  document.addEventListener('touchend', function (e) {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });

  function getDist(a, b) {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.hypot(dx, dy);
  }
  GT.log('Touch guards installed (best-effort)');
}

/* Adaptive scale and public API */
function installScaleLogic() {
  function adaptScale() {
    const w = window.innerWidth;
    let s = 0.85;
    if (w < 480) s = 0.98;
    else if (w < 900) s = 0.95;
    else s = 0.85;
    document.documentElement.style.setProperty('--app-scale', s.toString());
  }
  window.addEventListener('resize', adaptScale);
  adaptScale();

  window.AppFrame = {
    setScale: function (value) {
      const v = Math.max(0.6, Math.min(1.2, Number(value) || 0.85));
      document.documentElement.style.setProperty('--app-scale', v.toString());
    },
    getScale: function () {
      return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-scale')) || 1;
    }
  };
}

/* Add small accessibility controls for scale */
function addScaleControls() {
  if (document.querySelector('.app-scale-controls')) return;
  const controls = document.createElement('div');
  controls.className = 'app-scale-controls';
  controls.innerHTML = `
    <button data-action="zoom-in" aria-label="Zoom in">A+</button>
    <button data-action="zoom-out" aria-label="Zoom out">A-</button>
    <button data-action="reset" aria-label="Reset zoom">Reset</button>
  `;
  document.body.appendChild(controls);
  controls.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const cur = window.AppFrame.getScale();
    if (action === 'zoom-in') window.AppFrame.setScale(cur + 0.05);
    if (action === 'zoom-out') window.AppFrame.setScale(cur - 0.05);
    if (action === 'reset') {
      // re-run adaptive scale
      const evt = new Event('resize');
      window.dispatchEvent(evt);
    }
  });
}

/* AJAX navigation for internal links with focus management */
function installAjaxNavigation(appContent) {
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    // skip external, mailto, tel, hash-only
    if (href.startsWith('http') && new URL(href, location.href).origin !== location.origin) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (href.startsWith('#')) return;

    // optional: only intercept .html pages or same-folder pages
    if (!a.dataset.ajax && !href.endsWith('.html') && !href.startsWith('/')) return;

    e.preventDefault();
    fetch(href, { credentials: 'same-origin' })
      .then(r => {
        if (!r.ok) throw new Error('Network error');
        return r.text();
      })
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main') || doc.getElementById('app-content') || doc.body;
        appContent.innerHTML = newMain ? newMain.innerHTML : html;
        appContent.setAttribute('tabindex', '-1');
        appContent.focus();
        history.pushState({ ajax: true }, '', href);
      })
      .catch(err => {
        console.error('AJAX navigation failed', err);
        location.href = href;
      });
  });

  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.ajax) {
      fetch(location.href, { credentials: 'same-origin' })
        .then(r => r.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const newMain = doc.querySelector('main') || doc.getElementById('app-content') || doc.body;
          appContent.innerHTML = newMain ? newMain.innerHTML : html;
          appContent.setAttribute('tabindex', '-1');
          appContent.focus();
        });
    }
  });
}

/* ------------------ Boot sequence ------------------ */
onReady(() => {
  GT.log('Initializing Golden Times UI (app-frame single-file)');

  try {
    // inject viewport and CSS
    ensureViewportMeta();
    injectAppCSS();

    // ensure wrapper and content
    const { wrapper, content } = ensureAppWrapper();

    // install app behaviors
    installTouchGuards();
    installScaleLogic();
    addScaleControls();
    installAjaxNavigation(content);

    // initialize existing UI features
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
