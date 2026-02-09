/* PATH: Golden-Times-stor-history-Publisher/assets/js/reader-mode.js
   reader-mode.js
   Reader mode utilities for Golden Times Stor‑History Publisher
   RWPO‑conform: vanilla JS, no external dependencies
*/

(function () {
  'use strict';

  const STORAGE_KEY = 'gt-reader-preferences';

  /* Default preferences */
  const DEFAULTS = {
    enabled: false,
    fontSize: 18,        // px
    lineHeight: 1.6,
    maxWidth: 720,       // px
    highContrast: false,
    serif: false
  };

  /* Merge stored prefs with defaults */
  function loadPreferences() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      const parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULTS, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function savePreferences(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      // ignore storage errors
    }
  }

  /* Apply preferences to the article element */
  function applyPreferences(prefs, article) {
    if (!article) return;
    if (prefs.enabled) {
      article.classList.add('gt-reader-mode');
      article.style.maxWidth = prefs.maxWidth ? `${prefs.maxWidth}px` : '';
      article.style.fontSize = prefs.fontSize ? `${prefs.fontSize}px` : '';
      article.style.lineHeight = prefs.lineHeight ? String(prefs.lineHeight) : '';
      article.style.margin = '0 auto';
      article.style.padding = '1.25rem';
      article.style.background = 'transparent';
      if (prefs.highContrast) {
        article.style.color = '#0f0b05';
        article.style.backgroundColor = '#fff';
      } else {
        article.style.color = '';
        article.style.backgroundColor = '';
      }
      if (prefs.serif) {
        article.style.fontFamily = 'Georgia, "Times New Roman", serif';
      } else {
        article.style.fontFamily = '';
      }
    } else {
      article.classList.remove('gt-reader-mode');
      article.style.maxWidth = '';
      article.style.fontSize = '';
      article.style.lineHeight = '';
      article.style.margin = '';
      article.style.padding = '';
      article.style.background = '';
      article.style.color = '';
      article.style.backgroundColor = '';
      article.style.fontFamily = '';
    }
  }

  /* Toggle reader mode on/off */
  function toggleReaderMode(targetSelector = 'article') {
    const article = document.querySelector(targetSelector);
    if (!article) return;
    const prefs = loadPreferences();
    prefs.enabled = !prefs.enabled;
    savePreferences(prefs);
    applyPreferences(prefs, article);
  }

  /* Programmatic setters for controls */
  function setFontSize(size, targetSelector = 'article') {
    const prefs = loadPreferences();
    prefs.fontSize = Math.max(12, Math.min(28, Number(size) || prefs.fontSize));
    savePreferences(prefs);
    applyPreferences(prefs, document.querySelector(targetSelector));
  }

  function setLineHeight(value, targetSelector = 'article') {
    const prefs = loadPreferences();
    prefs.lineHeight = Math.max(1.1, Math.min(2.2, Number(value) || prefs.lineHeight));
    savePreferences(prefs);
    applyPreferences(prefs, document.querySelector(targetSelector));
  }

  function setMaxWidth(px, targetSelector = 'article') {
    const prefs = loadPreferences();
    prefs.maxWidth = Math.max(480, Math.min(1200, Number(px) || prefs.maxWidth));
    savePreferences(prefs);
    applyPreferences(prefs, document.querySelector(targetSelector));
  }

  function setHighContrast(enabled, targetSelector = 'article') {
    const prefs = loadPreferences();
    prefs.highContrast = Boolean(enabled);
    savePreferences(prefs);
    applyPreferences(prefs, document.querySelector(targetSelector));
  }

  function setSerif(enabled, targetSelector = 'article') {
    const prefs = loadPreferences();
    prefs.serif = Boolean(enabled);
    savePreferences(prefs);
    applyPreferences(prefs, document.querySelector(targetSelector));
  }

  /* Reset to defaults */
  function resetReaderPreferences(targetSelector = 'article') {
    savePreferences(Object.assign({}, DEFAULTS));
    applyPreferences(DEFAULTS, document.querySelector(targetSelector));
  }

  /* Wire up UI controls if present */
  function initControls() {
    const toggleButtons = document.querySelectorAll('[data-gt-reader-toggle]');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = btn.getAttribute('data-gt-reader-target') || 'article';
        toggleReaderMode(target);
      });
    });

    const fontInputs = document.querySelectorAll('[data-gt-reader-fontsize]');
    fontInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        const target = input.getAttribute('data-gt-reader-target') || 'article';
        setFontSize(val, target);
      });
    });

    const lineInputs = document.querySelectorAll('[data-gt-reader-lineheight]');
    lineInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        const target = input.getAttribute('data-gt-reader-target') || 'article';
        setLineHeight(val, target);
      });
    });

    const widthInputs = document.querySelectorAll('[data-gt-reader-maxwidth]');
    widthInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        const target = input.getAttribute('data-gt-reader-target') || 'article';
        setMaxWidth(val, target);
      });
    });

    const contrastToggles = document.querySelectorAll('[data-gt-reader-contrast]');
    contrastToggles.forEach(el => {
      el.addEventListener('change', (e) => {
        const checked = e.target.checked;
        const target = el.getAttribute('data-gt-reader-target') || 'article';
        setHighContrast(checked, target);
      });
    });

    const serifToggles = document.querySelectorAll('[data-gt-reader-serif]');
    serifToggles.forEach(el => {
      el.addEventListener('change', (e) => {
        const checked = e.target.checked;
        const target = el.getAttribute('data-gt-reader-target') || 'article';
        setSerif(checked, target);
      });
    });

    const resetButtons = document.querySelectorAll('[data-gt-reader-reset]');
    resetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-gt-reader-target') || 'article';
        resetReaderPreferences(target);
      });
    });
  }

  /* Apply stored preferences on load */
  function applyOnLoad() {
    const prefs = loadPreferences();
    const article = document.querySelector('article');
    if (!article) return;
    applyPreferences(prefs, article);
  }

  /* Public API */
  window.GTReader = {
    toggle: toggleReaderMode,
    setFontSize,
    setLineHeight,
    setMaxWidth,
    setHighContrast,
    setSerif,
    reset: resetReaderPreferences,
    loadPreferences,
    savePreferences
  };

  /* Initialize on DOM ready */
  if (document.readyState !== 'loading') {
    initControls();
    applyOnLoad();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initControls();
      applyOnLoad();
    });
  }
})();
