<!-- PATH: Golden-Times-stor-history-Publisher/assets/js/animations.js -->
/*
  animations.js
  Lightweight UI animation utilities for Golden Times Stor‑History Publisher
  RWPO‑conform: vanilla JS, no external dependencies
*/

(function () {
  'use strict';

  /* Respect user preference for reduced motion */
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Helper: throttle */
  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  /* Fade-in on scroll: elements with .gt-reveal */
  function initScrollReveal() {
    if (prefersReducedMotion) return;

    const reveals = Array.from(document.querySelectorAll('.gt-reveal'));
    if (!reveals.length) return;

    const onIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    });

    reveals.forEach(el => {
      // initial state
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }

  /* Simple parallax for elements with data-gt-parallax */
  function initParallax() {
    if (prefersReducedMotion) return;

    const parallaxEls = Array.from(document.querySelectorAll('[data-gt-parallax]'));
    if (!parallaxEls.length) return;

    function updateParallax() {
      const scrollY = window.scrollY || window.pageYOffset;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-gt-parallax')) || 0.2;
        const offset = (el.getBoundingClientRect().top + scrollY) * speed;
        el.style.transform = `translateY(${Math.round(offset * 0.02)}px)`;
      });
    }

    updateParallax();
    window.addEventListener('scroll', throttle(updateParallax, 40));
    window.addEventListener('resize', throttle(updateParallax, 120));
  }

  /* Micro-interactions: button press animation for .btn-gt */
  function initButtonInteractions() {
    const buttons = Array.from(document.querySelectorAll('.btn-gt, .btn-ghost'));
    if (!buttons.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        btn.style.transform = 'translateY(1px) scale(0.998)';
      });
      btn.addEventListener('pointerup', () => {
        btn.style.transform = '';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* Simple progress indicator for long scrollable articles */
  function initReadingProgress() {
    const article = document.querySelector('article');
    if (!article) return;

    let progressBar = document.querySelector('.gt-reading-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'gt-reading-progress';
      progressBar.style.position = 'fixed';
      progressBar.style.left = '0';
      progressBar.style.top = '0';
      progressBar.style.height = '3px';
      progressBar.style.width = '0%';
      progressBar.style.background = 'linear-gradient(90deg, rgba(212,160,23,0.9), rgba(212,160,23,0.6))';
      progressBar.style.zIndex = '9999';
      progressBar.style.transition = 'width 120ms linear';
      document.body.appendChild(progressBar);
    }

    function updateProgress() {
      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const articleHeight = rect.height;
      const scroll = window.scrollY;
      const progress = Math.min(100, Math.max(0, ((scroll - articleTop) / (articleHeight - window.innerHeight)) * 100));
      progressBar.style.width = `${progress}%`;
      if (progress <= 0 || progress >= 100) progressBar.style.opacity = '0.6';
      else progressBar.style.opacity = '1';
    }

    updateProgress();
    window.addEventListener('scroll', throttle(updateProgress, 50));
    window.addEventListener('resize', throttle(updateProgress, 120));
  }

  /* Entrance animation for modal/dialog elements */
  function initModalAnimations() {
    const modals = Array.from(document.querySelectorAll('[role="dialog"], .gt-modal'));
    if (!modals.length) return;

    modals.forEach(modal => {
      modal.addEventListener('animationend', (e) => {
        if (e.animationName === 'gt-modal-out') {
          modal.style.display = 'none';
        }
      });
    });
  }

  /* Public init function */
  function initAnimations() {
    try {
      initScrollReveal();
      initParallax();
      initButtonInteractions();
      initReadingProgress();
      initModalAnimations();
    } catch (err) {
      if (window && window.console) console.warn('[GT][animations] init error', err);
    }
  }

  /* Auto-run on DOM ready */
  if (document.readyState !== 'loading') initAnimations();
  else document.addEventListener('DOMContentLoaded', initAnimations);

  /* Export for manual invocation if needed */
  window.GTAnimations = {
    init: initAnimations,
    prefersReducedMotion: prefersReducedMotion
  };
})();
