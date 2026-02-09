<!-- PATH: Golden-Times-stor-history-Publisher/assets/js/app-frame.js -->
/* Wrap page content in .app-frame and keep mobile-like rendering.
   Insert this script before </body>. It does not modify your HTML content. */

(function(){
  'use strict';

  function ensureAppFrame() {
    if (document.querySelector('.app-frame')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'app-frame';
    while (document.body.firstChild) {
      wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);
    if (document.body.dataset.device === 'true') wrapper.classList.add('app-frame--device');
    document.documentElement.classList.add('app-frame-active');
  }

  function applyScaling() {
    var refWidth = 412;
    var viewport = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    var scale = 1;
    if (viewport > refWidth + 120) scale = Math.min(1, (viewport - 120) / refWidth);
    else scale = 1;
    scale = Math.max(0.6, Math.min(1, scale));
    var frame = document.querySelector('.app-frame');
    if (frame) {
      frame.style.transform = 'scale(' + scale + ')';
      frame.style.transformOrigin = 'top center';
    }
  }

  var resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){ applyScaling(); }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      ensureAppFrame();
      applyScaling();
      window.addEventListener('resize', onResize, {passive:true});
      window.addEventListener('orientationchange', onResize, {passive:true});
    });
  } else {
    ensureAppFrame();
    applyScaling();
    window.addEventListener('resize', onResize, {passive:true});
    window.addEventListener('orientationchange', onResize, {passive:true});
  }
})();
