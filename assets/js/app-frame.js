/* PATH: assets/js/app-frame.js
   App‑Frame JS: wrap DOM, initial zoom, pinch/double‑tap, zoom controls, keyboard & wheel.
   Füge diese Datei hinzu oder ersetze die vorhandene app-frame.js komplett. */

(function(){
  'use strict';

  var state = {
    scale: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-default-scale')) || 0.78,
    min: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-zoom-min')) || 0.5,
    max: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-zoom-max')) || 1.2,
    step: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-zoom-step')) || 0.12,
    lastTouchDist: null,
    doubleTapTime: 300,
    lastTap: 0
  };

  function ensureAppFrame() {
    if (document.querySelector('.app-frame')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'app-frame';
    while (document.body.firstChild) wrapper.appendChild(document.body.firstChild);
    document.body.appendChild(wrapper);
    document.documentElement.classList.add('app-frame-active');
  }

  function setScale(s, animate) {
    s = Math.max(state.min, Math.min(state.max, s));
    state.scale = s;
    var frame = document.querySelector('.app-frame');
    if (!frame) return;
    if (animate === false) frame.style.transition = 'none';
    else frame.style.transition = 'transform 260ms cubic-bezier(.2,.9,.2,1)';
    frame.style.transform = 'scale(' + s + ')';
    if (animate === false) setTimeout(function(){ frame.style.transition = ''; }, 20);
  }

  function toggleZoom() {
    var target = (Math.abs(state.scale - 1) < 0.02) ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-default-scale')) || 0.78) : 1;
    setScale(target, true);
  }

  function onWheel(e) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    var delta = -e.deltaY || e.wheelDelta;
    var change = (delta > 0) ? state.step : -state.step;
    setScale(state.scale + change, true);
  }

  function distance(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function onTouchStart(e) {
    if (e.touches && e.touches.length === 2) {
      state.lastTouchDist = distance(e.touches);
    } else if (e.touches && e.touches.length === 1) {
      var now = Date.now();
      if (now - state.lastTap < state.doubleTapTime) {
        toggleZoom();
        state.lastTap = 0;
      } else {
        state.lastTap = now;
      }
    }
  }

  function onTouchMove(e) {
    if (e.touches && e.touches.length === 2 && state.lastTouchDist) {
      var d = distance(e.touches);
      var ratio = d / state.lastTouchDist;
      var newScale = state.scale * ratio;
      setScale(newScale, false);
      state.lastTouchDist = d;
    }
  }

  function onTouchEnd() {
    state.lastTouchDist = null;
    setScale(state.scale, true);
  }

  function createZoomControls() {
    if (document.querySelector('.app-frame .zoom-controls')) return;
    var controls = document.createElement('div');
    controls.className = 'zoom-controls';
    controls.innerHTML = '<button aria-label="Zoom out" data-zoom="-">−</button><button aria-label="Reset/Toggle" data-zoom="t">⤢</button><button aria-label="Zoom in" data-zoom="+">+</button>';
    document.body.appendChild(controls);
    controls.addEventListener('click', function(e){
      var btn = e.target.closest('button');
      if (!btn) return;
      var v = btn.getAttribute('data-zoom');
      if (v === '+') setScale(state.scale + state.step, true);
      else if (v === '-') setScale(state.scale - state.step, true);
      else if (v === 't') toggleZoom();
    });
  }

  function init() {
    ensureAppFrame();
    createZoomControls();
    setScale(state.scale, false);

    window.addEventListener('resize', function(){ setScale(state.scale, true); }, {passive:true});
    window.addEventListener('wheel', onWheel, {passive:false});
    document.addEventListener('touchstart', onTouchStart, {passive:false});
    document.addEventListener('touchmove', onTouchMove, {passive:false});
    document.addEventListener('touchend', onTouchEnd, {passive:true});

    document.addEventListener('keydown', function(e){
      if (e.key === '+' || e.key === '=') setScale(state.scale + state.step, true);
      if (e.key === '-' || e.key === '_') setScale(state.scale - state.step, true);
      if (e.key === '0') setScale(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-default-scale')) || 0.78, true);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
