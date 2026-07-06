/* ============================================================
   k-AIzen v2 — Premium interactions
   Magnetic buttons · scroll reveals · kinetic headline · nav state · tilt
   All guarded for reduced-motion + touch.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- Magnetic buttons ---------- */
  if (!reduce && !coarse) {
    document.querySelectorAll('[data-magnetic], .kz-btn').forEach(function (el) {
      var strength = 0.12;   // subtle — premium, not jumpy
      var cap = 6;           // max px the button may drift in any direction
      var clamp = function (v) { return Math.max(-cap, Math.min(cap, v)); };
      el.addEventListener('mouseenter', function () { el.style.transition = 'transform 0.18s cubic-bezier(0.16,1,0.3,1)'; });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = clamp((e.clientX - (r.left + r.width / 2)) * strength);
        var my = clamp((e.clientY - (r.top + r.height / 2)) * strength);
        el.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Card tilt on hover ---------- */
  if (!reduce && !coarse) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-py * 6) + 'deg) rotateY(' + (px * 8) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Scroll reveals ---------- */
  var reveals = document.querySelectorAll('.kz-reveal, .kz-kinetic');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Kinetic headline: wrap words + stagger ---------- */
  document.querySelectorAll('.kz-kinetic').forEach(function (el) {
    if (el.dataset.split) return; el.dataset.split = '1';
    var html = el.innerHTML;
    // split on spaces, but keep accent spans intact so gradient text stays visible.
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    function wrapTextNodes(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); }
            else if (w.length) { var s = document.createElement('span'); s.textContent = w; frag.appendChild(s); }
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('accent')) { wrapTextNodes(n); }
      });
    }
    wrapTextNodes(tmp);
    el.innerHTML = tmp.innerHTML;
    // stagger delays
    var spans = el.querySelectorAll('span:not(.accent)');
    spans.forEach(function (s, i) { s.style.transitionDelay = (i * 0.05) + 's'; });
  });

  /* ---------- Nav scroll state + scroll-progress bar ---------- */
  var nav = document.querySelector('.kz-nav');
  var prog = document.querySelector('.kz-progress');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (window.location.hash) {
    var scrollToHash = function () {
      var target = document.querySelector(window.location.hash);
      if (target) target.scrollIntoView({ block: 'start' });
      onScroll();
    };
    window.requestAnimationFrame(scrollToHash);
    window.setTimeout(scrollToHash, 180);
    window.setTimeout(scrollToHash, 700);
    window.addEventListener('load', scrollToHash, { once: true });
  }

  /* ---------- Count-up numbers when stats scroll into view ---------- */
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window && !reduce) {
    var numIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; numIO.unobserve(el);
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var dur = 1400, start = null;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { numIO.observe(n); });
  } else {
    nums.forEach(function (n) { n.textContent = n.dataset.count + (n.dataset.suffix || ''); });
  }
})();
