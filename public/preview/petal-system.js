/* ============================================================
   PETAL SYSTEM — canvas, object-pooled, cursor-reactive
   ------------------------------------------------------------
   Physics approach:
   • Each petal carries position, velocity, rotation, age.
   • Global wind = Perlin-ish low-freq sine sum (cheap, smooth).
   • Gravity is gentle (terminal-velocity feel via drag).
   • Cursor acts as an inverse-square repulsor inside a 150px
     radius — radial outward push falling off with distance,
     blended with a tangential swirl so flow looks like a fan.
   • Object pool: dead petals are recycled, never GC'd.
   • Single offscreen petal canvas is drawn rotated/scaled —
     this is essentially CPU instancing.
   ============================================================ */

(function () {
  'use strict';

  const TAU = Math.PI * 2;

  // ---------- pseudo-noise: 3 stacked sines (cheap, smooth) ----------
  function noise(x, y, t) {
    return (
      Math.sin(x * 0.0021 + t * 0.00041) * 0.5 +
      Math.sin(y * 0.0017 - t * 0.00033 + 1.7) * 0.3 +
      Math.sin((x + y) * 0.0009 + t * 0.00021 + 3.1) * 0.2
    );
  }

  class PetalSystem {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.opts = Object.assign({
        count: 280,
        sprite: null,         // HTMLImage of leaf-sakura.png (legacy single)
        sprites: null,        // array of {img, weight} for variant petals
        wind: 1.0,
        gravity: 0.042,       // 30% reduziert für ruhigere Fall-Geschwindigkeit
        repelRadius: 160,
        repelStrength: 1.0,
        spawnFromBranches: [], // array of {x,y, w,h} normalized 0..1
        landingZones: [],         // [{x,y,w,h}] — petals settle on top edge
        cursorWakeRadius: 95,     // landed petals wake when cursor enters this radius
        windWakeThreshold: 0.82,  // |noise| above this can wake landed petals
        landingFriction: 0.35,    // vx multiplier on impact
        landingPad: 5,            // pixels above zone-top petal sits at
      }, opts);

      this.petals = [];
      this.mouse = { x: -9999, y: -9999, active: false, vx: 0, vy: 0, lx: 0, ly: 0 };
      this.t = 0;
      this.W = 0; this.H = 0;
      this.gusts = [];        // {x, y, strength, life, maxLife}
      this._resize();
      window.addEventListener('resize', () => this._resize());

      // Build pool
      for (let i = 0; i < this.opts.count; i++) {
        this.petals.push(this._makePetal(true));
      }
    }

    _resize() {
      const r = this.canvas.getBoundingClientRect();
      this.W = r.width;
      this.H = r.height;
      this.canvas.width = Math.floor(r.width * this.dpr);
      this.canvas.height = Math.floor(r.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    setMouse(x, y) {
      // velocity (smoothed)
      this.mouse.vx = (x - this.mouse.x) * 0.5 + this.mouse.vx * 0.5;
      this.mouse.vy = (y - this.mouse.y) * 0.5 + this.mouse.vy * 0.5;
      this.mouse.lx = this.mouse.x;
      this.mouse.ly = this.mouse.y;
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.active = true;
    }

    setMouseInactive() { this.mouse.active = false; }

    setLandingZones(zones) {
      this.opts.landingZones = Array.isArray(zones) ? zones : [];
    }

    spawnGust(x, y, strength = 1, life = 800) {
      this.gusts.push({ x, y, strength, life, maxLife: life });
    }

    spawnExtraPetals(x, y, n = 10) {
      // Recycle some far-offscreen-or-dead petals near (x,y)
      let placed = 0;
      for (let i = 0; i < this.petals.length && placed < n; i++) {
        const p = this.petals[i];
        if (p.y > this.H + 40 || p.dead) {
          this._respawnAt(p, x + (Math.random() - 0.5) * 60,
                              y + (Math.random() - 0.5) * 30);
          p.vy = -0.6 - Math.random() * 0.6;
          p.vx = (Math.random() - 0.5) * 1.4;
          placed++;
        }
      }
    }

    _pickSpriteIndex() {
      const sprites = this.opts.sprites;
      if (!sprites || !sprites.length) return -1;
      // weighted pick
      let total = 0;
      for (let s of sprites) total += (s.weight ?? 1);
      let r = Math.random() * total;
      for (let i = 0; i < sprites.length; i++) {
        r -= (sprites[i].weight ?? 1);
        if (r <= 0) return i;
      }
      return sprites.length - 1;
    }

    _makePetal(spreadVertical) {
      const p = {
        x: 0, y: 0, vx: 0, vy: 0,
        a: 0, va: 0,         // angle, angular velocity
        s: 1,                // scale
        hue: 0,              // hue shift for variance
        opacity: 1,
        spriteIdx: 0,        // which sprite variant
        dead: false,
      };
      this._respawn(p, spreadVertical);
      return p;
    }

    _respawn(p, spreadVertical) {
      p.x = Math.random() * (this.W + 200) - 100;
      p.y = spreadVertical
        ? Math.random() * this.H - this.H * 0.3
        : -20 - Math.random() * 100;
      this._initKinematics(p);
    }

    _respawnAt(p, x, y) {
      p.x = x; p.y = y;
      this._initKinematics(p);
    }

    _initKinematics(p) {
      // Initial-Velocities um 30% reduziert für ruhigere Fall-Bewegung
      p.vx = (Math.random() - 0.5) * 0.42;
      p.vy = 0.28 + Math.random() * 0.63;
      p.a = Math.random() * TAU;
      p.va = (Math.random() - 0.5) * 0.028;
      // per-variant scale: maple leaves are larger; sakura petals smaller
      p.spriteIdx = this._pickSpriteIndex();
      const variant = this.opts.sprites && this.opts.sprites[p.spriteIdx];
      const baseScale = variant?.scale ?? 0.07;
      p.s = baseScale * (0.7 + Math.random() * 0.6);
      p.hue = (Math.random() - 0.5) * 18;
      p.opacity = 0.7 + Math.random() * 0.3;
      p.dead = false;
      p.landed = false;
      p.restTime = 0;
    }

    update(dt) {
      this.t += dt;
      const W = this.W, H = this.H;
      const wind = this.opts.wind;
      const grav = this.opts.gravity;
      const mx = this.mouse.x, my = this.mouse.y;
      const r = this.opts.repelRadius;
      const r2 = r * r;
      const rs = this.opts.repelStrength;
      const mActive = this.mouse.active && mx > -1000;

      // tick gusts
      for (let i = this.gusts.length - 1; i >= 0; i--) {
        const g = this.gusts[i];
        g.life -= dt;
        if (g.life <= 0) this.gusts.splice(i, 1);
      }

      const zones = this.opts.landingZones;
      const wakeR = this.opts.cursorWakeRadius;
      const wakeR2 = wakeR * wakeR;
      const windWake = this.opts.windWakeThreshold;
      const friction = this.opts.landingFriction;
      const padTop = this.opts.landingPad;

      const petals = this.petals;
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // ============================================================
        // LANDED-STATE: petal liegt auf einem Button. Skip Physik,
        // check für Disturbance (Cursor / Wind / Gust) → wake.
        // ============================================================
        if (p.landed) {
          p.restTime += dt;
          let woken = false;

          // Cursor-Wake: Maus kommt nahe → Petal fliegt weg
          if (mActive) {
            const dx = p.x - mx, dy = p.y - my;
            const d2 = dx * dx + dy * dy;
            if (d2 < wakeR2 && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const fall = 1 - d / wakeR;
              // Push direction = AWAY vom Cursor + Cursor-Velocity
              p.vx = (dx / d) * 1.4 * fall + this.mouse.vx * 0.45;
              p.vy = (dy / d) * 0.5 * fall + this.mouse.vy * 0.32 - 0.7 * fall; // upward-kick
              p.va = (Math.random() - 0.5) * 0.06;
              p.landed = false;
              p.restTime = 0;
              woken = true;
            }
          }

          // Gust-Wake: Wind-Stoß über die Position
          if (!woken) {
            for (let g of this.gusts) {
              const dx = p.x - g.x, dy = p.y - g.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < 220 * 220) {
                const d = Math.sqrt(d2) + 0.001;
                const fall = (g.life / g.maxLife) * (1 - d / 220) * g.strength;
                if (fall > 0.28) {
                  p.vx = (dx / d) * fall * 1.6;
                  p.vy = -fall * 0.85 + (dy / d) * fall * 0.3;
                  p.va = (Math.random() - 0.5) * 0.05;
                  p.landed = false;
                  p.restTime = 0;
                  woken = true;
                  break;
                }
              }
            }
          }

          // Wind-Noise-Wake: starke Noise-Sektion blast Petal weg
          if (!woken) {
            const nfL = noise(p.x, p.y, this.t);
            if (Math.abs(nfL) > windWake && Math.random() < 0.035) {
              p.vx = nfL * 1.4 * wind;
              p.vy = -0.4 - Math.random() * 0.3;
              p.va = (Math.random() - 0.5) * 0.04;
              p.landed = false;
              p.restTime = 0;
              woken = true;
            }
          }

          if (!woken) {
            // Bleibt liegen — leichter Settle-Drift an Rotation, keine Position-Änderung
            p.va *= 0.92;
            p.a += p.va;
            continue; // skip rest of physics + recycle
          }
        }

        // ============================================================
        // NORMAL PHYSICS für nicht-landed Petals
        // ============================================================

        // global wind: noise field
        const nf = noise(p.x, p.y, this.t);
        const wx = nf * 0.55 * wind;
        const wy = Math.abs(nf) * 0.05 * wind;

        // gusts
        let gx = 0, gy = 0;
        for (let g of this.gusts) {
          const dx = p.x - g.x, dy = p.y - g.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 220 * 220) {
            const d = Math.sqrt(d2) + 0.001;
            const fall = (g.life / g.maxLife) * (1 - d / 220) * g.strength;
            gx += (dx / d) * fall * 1.2;
            gy += (dy / d) * fall * 0.4 - fall * 0.6;
          }
        }

        // cursor repulsion — gentle nudge, mostly tangential swirl + drift
        let mx2 = 0, my2 = 0;
        if (mActive) {
          const dx = p.x - mx, dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const fall = 1 - d / r;
            const force = fall * 0.9 * rs;
            mx2 += (dx / d) * force * 0.55;
            my2 += (dy / d) * force * 0.55;
            mx2 += (-dy / d) * force * 0.85;
            my2 += ( dx / d) * force * 0.85;
            mx2 += this.mouse.vx * fall * 0.06;
            my2 += this.mouse.vy * fall * 0.06;
            p.va += fall * 0.005 * Math.sign(dx);
          }
        }

        // integrate
        p.vx += wx * dt * 0.06 + mx2 + gx;
        p.vy += grav * dt * 0.06 + wy * dt * 0.04 + my2 + gy;

        // drag (terminal velocity feel)
        p.vx *= 0.965;
        p.vy *= 0.985;

        const prevY = p.y;
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;
        p.va *= 0.97;

        // ============================================================
        // LANDING-DETECTION: hat das Petal gerade die Top-Edge einer Zone
        // gekreuzt? (nur wenn nach unten fallend)
        // ============================================================
        if (zones.length && p.vy > 0) {
          for (let z = 0; z < zones.length; z++) {
            const zone = zones[z];
            if (p.x < zone.x - 4 || p.x > zone.x + zone.w + 4) continue;
            const top = zone.y;
            if (prevY < top && p.y >= top) {
              // Land
              p.y = top - padTop;
              p.vy = 0;
              p.vx *= friction;
              p.va *= 0.3;
              p.landed = true;
              p.restTime = 0;
              break;
            }
          }
        }

        // recycle when offscreen (skip for landed petals — already handled above)
        if (!p.landed && (p.y > H + 40 || p.x < -120 || p.x > W + 120)) {
          this._respawn(p, false);
        }
      }
    }

    draw() {
      const ctx = this.ctx;
      const sprites = this.opts.sprites;
      const fallback = this.opts.sprite;
      ctx.clearRect(0, 0, this.W, this.H);

      // build a quick "ready" check
      const useVariants = sprites && sprites.length > 0;
      if (!useVariants && (!fallback || !fallback.complete)) return;

      const petals = this.petals;
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        let img;
        if (useVariants) {
          const v = sprites[p.spriteIdx % sprites.length];
          img = v && v.img;
          if (!img || !img.complete || !img.naturalWidth) continue;
        } else {
          img = fallback;
        }
        const sw = img.naturalWidth;
        const sh = img.naturalHeight;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.globalAlpha = p.opacity;
        const w = sw * p.s;
        const h = sh * p.s;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  }

  window.PetalSystem = PetalSystem;
})();
