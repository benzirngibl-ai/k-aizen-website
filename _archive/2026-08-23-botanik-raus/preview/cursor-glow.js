/* =========================================================================
   k-AIzen Light-Tech — Cursor-Glow
   1) Ein weicher Indigo-Spotlight folgt der Maus (global, hinter dem Inhalt).
   2) Buttons & Headlines leuchten auf, wenn der Cursor in die Nähe kommt
      (Proximity-Glow via CSS-Custom-Properties --gx/--gy + --near).
   Reines Vanilla-JS, kein React. Respektiert prefers-reduced-motion & Touch.
   ========================================================================= */
(function () {
  if (typeof window === 'undefined') return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (reduce || coarse) return; // kein Glow auf Touch / bei reduzierter Bewegung

  // ---- 1) Globaler Spotlight ----
  var spot = document.createElement('div');
  spot.id = 'lt-cursor-spot';
  document.body.appendChild(spot);

  var tx = window.innerWidth / 2, ty = window.innerHeight / 2; // Ziel
  var cx = tx, cy = ty;                                        // aktuell (gelerpt)
  var raf = null;

  function onMove(e) {
    tx = e.clientX; ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // ---- 2) Proximity-Targets (Buttons + Headlines) ----
  // Wir sammeln Kandidaten lazy bei jedem Tick neu in einem leichten Cache,
  // weil die React-Sektionen erst nach Mount existieren.
  var GLOW_RADIUS = 260; // px Reichweite des Naheffekts
  var cache = [], cacheAt = 0;
  function targets() {
    var now = performance.now();
    if (now - cacheAt > 1200) { // alle ~1.2s neu einsammeln (günstig)
      cache = Array.prototype.slice.call(
        document.querySelectorAll('h1, h2, .kz-h1, .kz-h2, a[style], button, .kz-btn')
      );
      cacheAt = now;
    }
    return cache;
  }

  function tick() {
    raf = null;
    // sanftes Nachziehen
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    spot.style.transform = 'translate(' + (cx - 300) + 'px,' + (cy - 300) + 'px)';

    var list = targets();
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var r = el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < -GLOW_RADIUS || r.top > window.innerHeight + GLOW_RADIUS) continue;
      // nächster Punkt des Elements zum Cursor
      var nx = Math.max(r.left, Math.min(cx, r.right));
      var ny = Math.max(r.top, Math.min(cy, r.bottom));
      var dx = cx - nx, dy = cy - ny;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var near = dist < GLOW_RADIUS ? (1 - dist / GLOW_RADIUS) : 0;
      // lokale Position des Glows innerhalb des Elements (für radialen Schein)
      el.style.setProperty('--near', near.toFixed(3));
      if (near > 0) {
        el.style.setProperty('--gx', ((cx - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', ((cy - r.top) / r.height * 100).toFixed(1) + '%');
        el.classList.add('lt-glow-on');
      } else if (el.classList.contains('lt-glow-on')) {
        el.classList.remove('lt-glow-on');
      }
    }
    // weiter animieren solange Cursor sich noch bewegt / nachzieht
    if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf = requestAnimationFrame(tick);
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  // einmal initial positionieren
  requestAnimationFrame(tick);
})();
