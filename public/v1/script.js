/* ============================================================
   k-AIzen Premium Landing — Animation Engine
   GSAP + ScrollTrigger + Canvas-Particle-Leaves + Crane-Flight
   ============================================================ */

(function () {
  "use strict";

  // ============================================================
  // PRELOADER
  // ============================================================
  window.addEventListener("load", () => {
    setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.classList.add("fade-out");
    }, 1800);
  });

  // ============================================================
  // NAV — scroll-state + smooth-scroll
  // ============================================================
  const nav = document.getElementById("nav");
  const updateNavState = () => {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", updateNavState, { passive: true });
  updateNavState();

  // ============================================================
  // HERO BRUSH-REVEAL (Tagline)
  // ============================================================
  setTimeout(() => {
    document.querySelectorAll(".brush-reveal").forEach((el) => {
      const delay = parseFloat(el.dataset.delay || 0) * 1000;
      setTimeout(() => el.classList.add("revealed"), delay);
    });
  }, 1900);

  // ============================================================
  // GSAP ScrollTrigger Reveals
  // ============================================================
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll(".reveal-up").forEach((el) => {
      const delay = parseFloat(el.dataset.delay || 0);
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.delayedCall(delay, () => el.classList.add("in-view"));
        },
      });
    });

    // Brush-Divider reveal in Manifest
    document.querySelectorAll(".brush-divider").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => el.classList.add("in-view"),
      });
    });

    // Mountains parallax — drift very slowly with scroll
    const mountains = document.querySelector(".hero-mountains img");
    if (mountains) {
      gsap.to(mountains, {
        y: 60,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }

    // Hero-tree opacity-fade on scroll-out
    const tree = document.querySelector(".hero-tree");
    if (tree) {
      gsap.to(tree, {
        opacity: 0.3,
        y: 80,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom 30%",
          scrub: 1,
        },
      });
    }

    // Hero-content fade on scroll
    const heroContent = document.querySelector(".hero-content");
    if (heroContent) {
      gsap.to(heroContent, {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "60% top",
          scrub: 0.8,
        },
      });
    }
  }

  // ============================================================
  // MOUSE PARALLAX — Hero-Tree follows mouse subtly
  // ============================================================
  const heroTree = document.querySelector(".hero-tree");
  const mountainsWrap = document.querySelector(".hero-mountains");
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

  document.querySelector(".hero")?.addEventListener("mousemove", (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = cx;
    targetY = cy;
  });

  function parallaxLoop() {
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    if (heroTree) {
      heroTree.style.setProperty(
        "transform",
        `translate(${currentX * -10}px, ${currentY * -8}px)`
      );
    }
    if (mountainsWrap) {
      mountainsWrap.style.setProperty(
        "transform",
        `translateX(calc(-50% + ${currentX * -14}px)) translateY(${currentY * -6}px)`
      );
    }
    requestAnimationFrame(parallaxLoop);
  }
  parallaxLoop();

  // ============================================================
  // CRANE FLIGHT — periodic flyby
  // ============================================================
  const crane = document.querySelector(".crane-flight");
  function triggerCraneFlight() {
    if (!crane) return;
    crane.classList.remove("fly");
    // Random vertical position in upper hero
    const yOff = Math.random() * 120 + 80;
    crane.style.top = yOff + "px";
    // Force reflow so animation restarts
    void crane.offsetWidth;
    crane.classList.add("fly");
  }
  // First flight after 8s, then every 35-55s
  setTimeout(() => {
    triggerCraneFlight();
    setInterval(triggerCraneFlight, 38000 + Math.random() * 18000);
  }, 8000);

  // ============================================================
  // CANVAS LEAVES — Particle-System
  // Drifting leaves that spawn occasionally and float diagonally
  // ============================================================
  const canvas = document.getElementById("leaves-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let leaves = [];
    let animationId;
    let lastSpawn = 0;
    const SPAWN_INTERVAL_MIN = 4500;
    const SPAWN_INTERVAL_MAX = 9000;
    let nextSpawn = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
    let startTime = performance.now();

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Leaf-Color-Palette (subtle warm tones)
    const LEAF_PALETTE = [
      { fill: "rgba(196, 74, 32, 0.55)", stroke: "rgba(132, 50, 22, 0.7)" }, // ember-deep
      { fill: "rgba(120, 95, 60, 0.5)", stroke: "rgba(80, 60, 40, 0.7)" },   // muted brown
      { fill: "rgba(110, 130, 80, 0.45)", stroke: "rgba(70, 90, 50, 0.7)" }, // muted green
      { fill: "rgba(180, 130, 100, 0.5)", stroke: "rgba(120, 80, 60, 0.7)" }, // tan
      { fill: "rgba(232, 90, 43, 0.5)", stroke: "rgba(160, 60, 30, 0.7)" }, // ember
    ];

    function spawnLeaf() {
      const rect = canvas.getBoundingClientRect();
      const fromLeft = Math.random() > 0.45;
      const palette = LEAF_PALETTE[Math.floor(Math.random() * LEAF_PALETTE.length)];

      leaves.push({
        x: fromLeft ? -30 : rect.width + 30,
        y: Math.random() * rect.height * 0.4,
        vx: (fromLeft ? 1 : -1) * (0.4 + Math.random() * 0.6),
        vy: 0.3 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        size: 12 + Math.random() * 14,
        wave: Math.random() * Math.PI * 2,
        waveSpeed: 0.012 + Math.random() * 0.018,
        waveAmp: 0.4 + Math.random() * 0.8,
        opacity: 0,
        targetOpacity: 0.6 + Math.random() * 0.3,
        fillColor: palette.fill,
        strokeColor: palette.stroke,
        born: performance.now(),
      });
    }

    function drawLeaf(leaf) {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.globalAlpha = leaf.opacity;

      // Leaf shape — pointed oval (Ahorn/Cherry-blossom-style)
      ctx.beginPath();
      const s = leaf.size;
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.7, -s * 0.6, s * 0.7, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.7, -s * 0.6, 0, -s);
      ctx.closePath();
      ctx.fillStyle = leaf.fillColor;
      ctx.fill();

      // Mid-vein
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.9);
      ctx.lineTo(0, s * 0.9);
      ctx.strokeStyle = leaf.strokeColor;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Side-veins
      for (let i = -1; i <= 1; i += 0.5) {
        if (i === 0) continue;
        const yPos = i * s * 0.3;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(s * 0.4, yPos + s * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(-s * 0.4, yPos + s * 0.15);
        ctx.stroke();
      }
      ctx.restore();
    }

    function update() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();
      if (now - lastSpawn > nextSpawn && leaves.length < 8) {
        spawnLeaf();
        lastSpawn = now;
        nextSpawn = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
      }

      leaves = leaves.filter((leaf) => {
        // Position update
        leaf.wave += leaf.waveSpeed;
        leaf.x += leaf.vx + Math.sin(leaf.wave) * leaf.waveAmp * 0.4;
        leaf.y += leaf.vy + Math.cos(leaf.wave * 1.3) * 0.15;
        leaf.rotation += leaf.rotationSpeed;

        // Fade-in
        const age = now - leaf.born;
        if (age < 1500) {
          leaf.opacity = Math.min(leaf.targetOpacity, age / 1500 * leaf.targetOpacity);
        } else if (leaf.x > rect.width - 80 || leaf.x < 80) {
          // Fade-out near edges
          leaf.opacity = Math.max(0, leaf.opacity - 0.008);
        } else {
          leaf.opacity = leaf.targetOpacity;
        }

        // Remove off-screen leaves
        if (leaf.x < -50 || leaf.x > rect.width + 50 || leaf.y > rect.height + 60 || leaf.opacity <= 0) {
          return false;
        }
        drawLeaf(leaf);
        return true;
      });

      animationId = requestAnimationFrame(update);
    }

    // Pause animation when hero out of view (perf)
    const heroEl = document.querySelector(".hero");
    if (heroEl && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!animationId) update();
          } else {
            if (animationId) {
              cancelAnimationFrame(animationId);
              animationId = null;
            }
          }
        });
      }, { threshold: 0.05 });
      observer.observe(heroEl);
    } else {
      update();
    }
  }
})();
