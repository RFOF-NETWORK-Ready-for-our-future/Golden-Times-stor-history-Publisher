/* PATH: Golden-Times-stor-history-Publisher/assets/js/navigation.js
   navigation.js
   Navigation helpers for Golden Times Stor‑History Publisher
   RWPO‑conform: vanilla JS, no external dependencies
*/

/* Highlight active navigation link based on current URL */
(function() {
  function setActiveNav() {
    try {
      const links = document.querySelectorAll('.gt-nav-link');
      if (!links || !links.length) return;
      const path = window.location.pathname || '';
      links.forEach(link => {
        try {
          const href = link.getAttribute('href') || '';
          // Normalize paths for comparison
          const normalizedHref = new URL(href, window.location.origin).pathname;
          if (normalizedHref === path || (normalizedHref !== '/' && path.endsWith(normalizedHref))) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        } catch (e) {
          // ignore malformed hrefs
        }
      });
    } catch (err) {
      // silent fail to avoid breaking page
      if (window && window.console) console.warn('[GT][nav] setActiveNav error', err);
    }
  }

  /* Keyboard navigation for main nav (left/right arrows) */
  function initKeyboardNav() {
    const nav = document.querySelector('.gt-nav');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll('.gt-nav-link'));
    if (!links.length) return;

    nav.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      const idx = links.indexOf(active);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = links[(idx + 1) % links.length];
        next.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = links[(idx - 1 + links.length) % links.length];
        prev.focus();
      }
    });

    // Make links focusable for keyboard nav
    links.forEach(link => link.setAttribute('tabindex', '0'));
  }

  /* Close navigation when clicking outside (mobile) */
  function initNavAutoClose() {
    const nav = document.querySelector('.gt-nav');
    const toggle = document.querySelector('.gt-nav-toggle');
    if (!nav || !toggle) return;

    document.addEventListener('click', (e) => {
      const expanded = nav.getAttribute('data-expanded') === 'true';
      if (!expanded) return;
      const target = e.target;
      if (!nav.contains(target) && target !== toggle) {
        nav.setAttribute('data-expanded', 'false');
        nav.style.display = 'none';
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Ensure accessible ARIA attributes on nav links */
  function enhanceNavAccessibility() {
    const nav = document.querySelector('.gt-nav');
    if (!nav) return;
    nav.setAttribute('role', 'navigation');
    const links = nav.querySelectorAll('.gt-nav-link');
    links.forEach(link => {
      link.setAttribute('role', 'link');
      if (!link.hasAttribute('aria-label')) {
        const text = (link.textContent || '').trim();
        if (text) link.setAttribute('aria-label', text);
      }
    });
  }

  /* Initialize navigation behaviors */
  function init() {
    setActiveNav();
    initKeyboardNav();
    initNavAutoClose();
    enhanceNavAccessibility();

    // Recompute active nav on history navigation
    window.addEventListener('popstate', setActiveNav);
    // Also update on hashchange for single-page anchors
    window.addEventListener('hashchange', setActiveNav);
  }

  // Run on DOM ready
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
