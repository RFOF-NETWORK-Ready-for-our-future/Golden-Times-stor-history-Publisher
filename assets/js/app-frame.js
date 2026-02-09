/* PATH: assets/js/app-frame.js
   Korrigierte App‑Frame Logik: Wrapper, initial zoom, pinch/double‑tap, zoom controls, keyboard & wheel.
*/
(function () {
  'use strict';

  // sichere Lesehilfe für CSS‑Variablen mit Fallback
  function cssVarFloat(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name);
      var n = parseFloat(v);
      return Number.isFinite(n) ? n : fallback;
    } catch (e) {
      return fallback;
    }
  }

  var state = {
    scale: cssVarFloat('--app-default-scale', 0.78),
    min: cssVarFloat('--app-zoom-min', 0.5),
    max: cssVarFloat('--app-zoom-max', 1.2),
    step: cssVarFloat('--app-zoom-step', 0.12),
    lastTouchDist: null,
    doubleTapTime: 300,
    lastTap: 0
  };

  // Ensure there is a frame wrapper; if one exists, keep it
  function ensureAppFrame() {
    var frame = document.querySelector('.app-frame');
    if (frame) return frame;

    var wrapper = document.createElement('div');
    wrapper.className = 'app-frame';

    // move existing body children into wrapper (preserve scripts)
    var nodes = Array.from(document.body.childNodes);
    nodes.forEach(function (n) {
      // avoid moving scripts that are marked as injected by us (optional)
      wrapper.appendChild(n);
    });

    document.body.appendChild(wrapper);
    document.documentElement.classList.add('app-frame-active');
    return wrapper;
  }

  // Set transform scale on the frame and update state
  function setScale(s, animate) {
    var clamped = Math.max(state.min, Math.min(state.max, Number(s) || state.scale));
    state.scale = clamped;
    var frame = document.querySelector('.app-frame');
    if (!frame) return;

    if (animate === false) {
      frame.style.transition = 'none';
    } else {
      // prefer explicit transition so we can remove it later
      frame.style.transition = 'transform 260ms cubic-bezier(.2,.9,.2,1)';
    }

    frame.style.transform = 'scale(' + clamped + ')';

    // restore transition by removing inline property (cleaner than setting empty string)
    if (animate === false) {
      // small timeout to allow the immediate transform to apply without transition
      setTimeout(function () {
        frame.style.removeProperty('transition');
      }, 20);
    }
  }

  function toggleZoom() {
    var defaultScale = cssVarFloat('--app-default-scale', 0.78);
    var target = (Math.abs(state.scale - 1) < 0.02) ? defaultScale : 1;
    setScale(target, true);
  }

  // Wheel handler: only when Ctrl (or Meta on Mac) is pressed to indicate intent
  function onWheel(e) {
    // respect user intent: require ctrlKey (or metaKey on macOS)
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();

    // Normalize delta: positive means scroll down (zoom out)
    var delta = (typeof e.deltaY === 'number') ? e.deltaY : (e.wheelDelta ? -e.wheelDelta : 0);
    var change = (delta < 0) ? state.step : -state.step; // wheel up -> zoom in
    setScale(state.scale + change, true);
  }

  // Touch helpers
  function distance(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function onTouchStart(e) {
    if (e.touches && e.touches.length === 2) {
      state.lastTouchDist = distance(e.touches);
    } else if (e.touches && e.touches.length === 1) {
      var now = Date.now();
      if (now - state.lastTap < state.doubleTapTime) {
        // double tap: toggle between 1 and default
        e.preventDefault && e.preventDefault();
        toggleZoom();
        state.lastTap = 0;
      } else {
        state.lastTap = now;
      }
    }
  }

  function onTouchMove(e) {
    if (e.touches && e.touches.length === 2 && state.lastTouchDist) {
      // pinch: scale relative to last distance
      var d = distance(e.touches);
      var ratio = d / state.lastTouchDist;
      var newScale = state.scale * ratio;
      setScale(newScale, false);
      state.lastTouchDist = d;
      // prevent the browser pinch-zoom where possible
      e.preventDefault && e.preventDefault();
    }
  }

  function onTouchEnd(e) {
    // finalize scale and clear state
    state.lastTouchDist = null;
    // ensure final scale is clamped and animated
    setScale(state.scale, true);
  }

  // Create zoom controls and attach them to the frame (not body) to avoid duplicates
  function createZoomControls() {
    // check globally to avoid duplicates regardless of placement
    if (document.querySelector('.zoom-controls')) return;

    var frame = document.querySelector('.app-frame') || ensureAppFrame();
    var controls = document.createElement('div');
    controls.className = 'zoom-controls';
    controls.setAttribute('aria-hidden', 'false');
    controls.innerHTML = '<button aria-label="Zoom out" data-zoom="-">−</button>' +
                         '<button aria-label="Reset/Toggle" data-zoom="t">⤢</button>' +
                         '<button aria-label="Zoom in" data-zoom="+">+</button>';

    // append to frame so CSS like ".app-frame .zoom-controls" matches
    frame.appendChild(controls);

    controls.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var v = btn.getAttribute('data-zoom');
      if (v === '+') setScale(state.scale + state.step, true);
      else if (v === '-') setScale(state.scale - state.step, true);
      else if (v === 't') toggleZoom();
    });
  }

  // Keyboard shortcuts for zoom
  function installKeyboard() {
    document.addEventListener('keydown', function (e) {
      // ignore when typing in inputs or contenteditable
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setScale(state.scale + state.step, true);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setScale(state.scale - state.step, true);
      } else if (e.key === '0') {
        e.preventDefault();
        setScale(cssVarFloat('--app-default-scale', 0.78), true);
      }
    });
  }

  // Public API (optional)
  function exposeAPI() {
    if (!window.AppFrame) {
      window.AppFrame = {
        setScale: function (v) { setScale(v, true); },
        getScale: function () { return state.scale; },
        toggle: toggleZoom
      };
    }
  }

  // Init
  function init() {
    var frame = ensureAppFrame();
    createZoomControls();
    // apply initial scale without animation
    setScale(state.scale, false);

    // listeners
    window.addEventListener('resize', function () { setScale(state.scale, true); }, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });

    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    // touchend may need to call preventDefault in some flows; keep passive:false for consistency
    document.addEventListener('touchend', onTouchEnd, { passive: false });

    installKeyboard();
    exposeAPI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
