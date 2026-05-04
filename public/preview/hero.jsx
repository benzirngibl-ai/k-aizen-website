/* ============================================================
   k-AIzen — Hero
   Sumi-Tusche × restrained motion. Cursor-reactive sakura.
   ------------------------------------------------------------
   Layered depth (back→front):
     0  cream wash (page bg)
     1  sumi-mountains (slow parallax, ink-wash)
     2  ember sun-disc (single brand marker)
     3  cherry-branch silhouettes — sway in noise wind
     4  petal canvas (cursor-reactive particles)
     5  overlay UI (eyebrow, headline, sub, CTA, scroll cue)
   ============================================================ */

const { useState, useEffect, useRef, useMemo } = React;

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "petalCount": 55,
  "wind": 0.3,
  "repelRadius": 170,
  "showMountains": true,
  "showSun": true,
  "branchCount": 3,
  "headline": "Jeden Tag 1% besser.",
  "sub": "Mit KI."
} /*EDITMODE-END*/;

// ---------- hooks ----------
function useRaf(cb, active = true) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!active) return;
    let id,last = performance.now();
    const loop = (t) => {
      const dt = Math.min(48, t - last);
      last = t;
      cbRef.current(dt, t);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}

function useMouseSmooth() {
  const mouse = useRef({ x: -9999, y: -9999, sx: -9999, sy: -9999, active: false });
  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };
    const onLeave = () => {mouse.current.active = false;};
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  return mouse;
}

// ---------- Mountains: slow parallax sumi wash ----------
function Mountains({ mouse, show }) {
  const ref = useRef(null);
  useRaf((dt) => {
    const el = ref.current;if (!el) return;
    const tx = (mouse.current.x / window.innerWidth - 0.5) * 18;
    const ty = (mouse.current.y / window.innerHeight - 0.5) * 8;
    el.__tx = (el.__tx ?? 0) + (tx - (el.__tx ?? 0)) * 0.06;
    el.__ty = (el.__ty ?? 0) + (ty - (el.__ty ?? 0)) * 0.06;
    el.style.transform = `translate3d(${el.__tx}px, ${el.__ty + 4}px, 0)`;
  });
  if (!show) return null;
  return (
    <div ref={ref} style={{
      position: 'absolute', left: '-4%', right: '-4%',
      bottom: '8%', height: '52%',
      backgroundImage: 'url(/animations/claude-design/sumi-mountains.png)',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center bottom',
      backgroundSize: 'contain',
      opacity: 0.42,
      filter: 'saturate(0.7)',
      pointerEvents: 'none',
      mixBlendMode: 'multiply',
      willChange: 'transform'
    }} />);

}

// ---------- Ember sun: single brand marker ----------
function Sun({ mouse, show }) {
  const ref = useRef(null);
  useRaf(() => {
    const el = ref.current;if (!el) return;
    const tx = (mouse.current.x / window.innerWidth - 0.5) * 8;
    const ty = (mouse.current.y / window.innerHeight - 0.5) * 4;
    el.__tx = (el.__tx ?? 0) + (tx - (el.__tx ?? 0)) * 0.04;
    el.__ty = (el.__ty ?? 0) + (ty - (el.__ty ?? 0)) * 0.04;
    el.style.transform = `translate3d(${el.__tx}px, ${el.__ty}px, 0)`;
  });
  if (!show) return null;
  return (
    <div ref={ref} style={{
      position: 'absolute',
      top: '18%', right: '14%',
      width: 180, height: 180,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 50% 50%, #E85A2B 0%, #E85A2B 38%, rgba(232,90,43,0.0) 70%)',
      opacity: 0.85,
      filter: 'blur(0.5px)',
      pointerEvents: 'none',
      willChange: 'transform'
    }} />);

}

// ---------- Cherry branches with noise sway ----------
function Branch({ index, total, mouse, onGust }) {
  const ref = useRef(null);
  const config = useMemo(() => {
    // distribute, varied
    const presets = [
    { left: '-6%', top: '4%', width: '58%', rotate: -4, flip: false, depth: 0.6, scale: 1.0 },
    { left: '38%', top: '-8%', width: '52%', rotate: 8, flip: true, depth: 1.0, scale: 0.85 },
    { left: '-8%', top: '68%', width: '48%', rotate: -2, flip: false, depth: 1.4, scale: 0.75 },
    { left: '46%', top: '-12%', width: '60%', rotate: 6, flip: true, depth: 0.4, scale: 0.9 }];

    return presets[index % presets.length];
  }, [index]);

  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const lastGust = useRef(performance.now() + 4000 + Math.random() * 5000);

  useRaf((dt, t) => {
    const el = ref.current;if (!el) return;
    // base sway: sine + secondary, ~4s period
    const baseSway = Math.sin(t * 0.0011 + phase) * 1.6 +
    Math.sin(t * 0.00037 + phase * 1.7) * 0.7;
    // mouse lean
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = mouse.current.active ? mouse.current.x - cx : 0;
    const dy = mouse.current.active ? mouse.current.y - cy : 0;
    const dist = Math.hypot(dx, dy);
    const lean = mouse.current.active && dist < 360 ?
    dx / 360 * (1 - dist / 360) * 3 :
    0;
    el.__lean = (el.__lean ?? 0) + (lean - (el.__lean ?? 0)) * 0.05;

    // parallax
    const tx = (mouse.current.x / window.innerWidth - 0.5) * 26 * config.depth;
    const ty = (mouse.current.y / window.innerHeight - 0.5) * 12 * config.depth;
    el.__tx = (el.__tx ?? 0) + (tx - (el.__tx ?? 0)) * 0.08;
    el.__ty = (el.__ty ?? 0) + (ty - (el.__ty ?? 0)) * 0.08;

    const rot = config.rotate + baseSway + el.__lean;
    el.style.transform =
    `translate3d(${el.__tx}px, ${el.__ty}px, 0) ` +
    `rotate(${rot}deg) ` +
    `scaleX(${config.flip ? -1 : 1}) scale(${config.scale})`;

    // wind gusts
    if (t > lastGust.current) {
      lastGust.current = t + 6000 + Math.random() * 6000;
      // shed petals from middle of branch
      const r2 = el.getBoundingClientRect();
      onGust(r2.left + r2.width * (0.3 + Math.random() * 0.4),
      r2.top + r2.height * (0.4 + Math.random() * 0.3),
      5 + Math.floor(Math.random() * 11));
    }
  });

  return (
    <div ref={ref} style={{
      position: 'absolute',
      left: config.left, top: config.top, width: config.width,
      transformOrigin: config.flip ? '90% 50%' : '10% 50%',
      pointerEvents: 'none',
      willChange: 'transform'
    }}>
      <img src="/animations/claude-design/sumi-cherry-branch.png" alt=""
      style={{ width: '100%', display: 'block', filter: 'saturate(0.92)' }} />
    </div>);

}

// ---------- Petal canvas controller ----------
function PetalLayer({ count, wind, repelRadius, mouse, registerSpawnGust, registerSpawnExtra, registerSetLandingZones }) {
  const ref = useRef(null);
  const sysRef = useRef(null);

  useEffect(() => {
    const canvas = ref.current;if (!canvas) return;

    // Petal variants: scale tuned per leaf so maple leaves don't dwarf petals.
    // weight = relative spawn frequency. Sakura blossom & small ovals weighted higher.
    const variantDefs = [
      { src: '/animations/claude-design/leaf-sakura.png',       weight: 3.0, scale: 0.06 },
      { src: '/animations/claude-design/leaf-oval-green.png',   weight: 2.2, scale: 0.07 },
      { src: '/animations/claude-design/leaf-oval-yellow.png',  weight: 2.2, scale: 0.07 },
      { src: '/animations/claude-design/leaf-yellow-2.png',     weight: 1.8, scale: 0.07 },
      { src: '/animations/claude-design/leaf-maple-green.png',  weight: 1.2, scale: 0.05 },
      { src: '/animations/claude-design/leaf-maple-red.png',    weight: 1.2, scale: 0.05 },
      { src: '/animations/claude-design/leaf-branch-green.png', weight: 0.5, scale: 0.05 },
    ];
    const sprites = variantDefs.map(v => {
      const img = new Image();
      img.src = v.src;
      return { img, weight: v.weight, scale: v.scale };
    });

    const sys = new window.PetalSystem(canvas, {
      count, wind, repelRadius, sprites
    });
    sysRef.current = sys;
    // re-init kinematics now that sprites are set so spriteIdx picks correctly
    for (const p of sys.petals) sys._initKinematics(p);
    registerSpawnGust((x, y, strength) => sys.spawnGust(x, y, strength));
    registerSpawnExtra((x, y, n) => sys.spawnExtraPetals(x, y, n));
    if (registerSetLandingZones) {
      registerSetLandingZones((zones) => sys.setLandingZones(zones));
    }
    // Cleanup bei Component-Unmount: removes resize-listener + clears pool
    return () => {
      if (sys && typeof sys.destroy === 'function') sys.destroy();
      sysRef.current = null;
    };
  }, []);

  // update opts when tweaks change
  useEffect(() => {
    if (sysRef.current) {
      sysRef.current.opts.count = count;
      sysRef.current.opts.wind = wind;
      sysRef.current.opts.repelRadius = repelRadius;
      // grow/shrink pool
      const pool = sysRef.current.petals;
      while (pool.length < count) pool.push(sysRef.current._makePetal(true));
      if (pool.length > count) pool.length = count;
    }
  }, [count, wind, repelRadius]);

  useRaf((dt) => {
    const sys = sysRef.current;if (!sys) return;
    if (mouse.current.active) sys.setMouse(mouse.current.x, mouse.current.y);else
    sys.setMouseInactive();
    sys.update(dt);
    sys.draw();
  });

  // pause when tab hidden
  useEffect(() => {
    const onVis = () => {






































      // Loop already running; we just skip work when hidden via dt clamp.
      // No-op here, but kept for parity with brief.
    };document.addEventListener('visibilitychange', onVis);return () => document.removeEventListener('visibilitychange', onVis);}, []);return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'block', zIndex: 6 }} />;} // ---------- Header (k-AIzen brand bar, 64px) ----------
function Header() {
  const KZ_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const [hidden, setHidden] = React.useState(false);
  const [atTop, setAtTop] = React.useState(true);
  React.useEffect(() => {
    let last = window.scrollY || 0;
    let raf = 0;
    const tick = () => {
      const y = window.scrollY || 0;
      setAtTop(y < 24);
      const dy = y - last;
      if (Math.abs(dy) > 6) {
        if (y > 80 && dy > 0) setHidden(true);
        else if (dy < 0) setHidden(false);
        last = y;
      }
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  const linkBase = {
    color: 'var(--fg)', textDecoration: 'none',
    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
    transition: `opacity 600ms ${KZ_EASE}, transform 600ms ${KZ_EASE}`,
  };
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 88,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', zIndex: 50,
      background: atTop ? 'rgba(245,240,232,0.0)' : 'rgba(245,240,232,0.88)',
      borderBottom: atTop ? '1px solid transparent' : '1px solid var(--kz-border)',
      backdropFilter: atTop ? 'none' : 'blur(12px)',
      WebkitBackdropFilter: atTop ? 'none' : 'blur(12px)',
      transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
      transition: `transform 520ms ${KZ_EASE}, background 420ms ${KZ_EASE}, border-color 420ms ${KZ_EASE}, backdrop-filter 420ms ${KZ_EASE}`,
      willChange: 'transform',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--fg)' }} aria-label="k-AIzen Startseite">
        <img src="/animations/claude-design/logo-full.png" alt="k-AIzen"
          style={{ height: 56, width: 'auto', display: 'block' }} />
      </a>
      <nav style={{ display: 'flex', gap: 24 }} aria-label="Hauptnavigation">
        {[
          { label: 'Audit', href: '/audit' },
          { label: 'Preise', href: '/pricing' },
          { label: 'Über mich', href: '/about' },
          { label: 'FAQ', href: '/#faq' },
          { label: 'Kontakt', href: '/kontakt' },
        ].map((item, i) => (
          <a key={item.label} href={item.href} style={{
            ...linkBase,
            transitionDelay: `${i * 60}ms`,
            opacity: hidden ? 0 : 1,
            transform: hidden ? 'translateY(-6px)' : 'translateY(0)',
          }}>{item.label}</a>
        ))}
      </nav>
      <a href="/audit" style={{
        fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
        padding: '8px 16px',
        background: 'var(--kz-charcoal)', color: 'var(--kz-cream)',
        borderRadius: 8, textDecoration: 'none',
      }}>
        Audit buchen
      </a>
    </header>
  );
}

// ---------- Overlay UI ----------
function HeroOverlay({ headline, sub }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', textAlign: 'center',
      pointerEvents: 'none'
    }}>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.18em',
        color: 'var(--fg-muted)',
        marginBottom: 18,
        animation: 'kz-fade-up 700ms var(--ease-out) 200ms both'
      }}>
        <span className="kz-kanji" style={{ marginRight: 10, color: 'var(--kz-ember)' }}>改善</span>
        AI-Automation für den Mittelstand
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(48px, 8vw, 112px)',
        lineHeight: 0.98,
        letterSpacing: '-0.02em',
        margin: 0,
        color: 'var(--fg)',
        textWrap: 'balance',
        animation: 'kz-fade-up 900ms var(--ease-out) 350ms both'
      }}>
        {headline}
      </h1>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4.4vw, 56px)',
        lineHeight: 1.0,
        marginTop: 6,
        color: 'var(--kz-ember)',
        animation: 'kz-fade-up 900ms var(--ease-out) 520ms both'
      }}>
        {sub}
      </div>

      <p style={{
        fontFamily: 'var(--font-sans)',
        maxWidth: 620, marginTop: 28,
        fontSize: 17, lineHeight: 1.55,
        color: 'var(--fg-muted)',
        textWrap: 'pretty',
        animation: 'kz-fade-up 900ms var(--ease-out) 700ms both'
      }}>
        Ich bin dein persönlicher KI-Bauer für sichtbare Prozess-Automatisierung.
        Kein Workshop-Zirkus, kein Konzern-Theater. Ein Mensch, der baut.
        Ein Stack, der dir gehört. Eine Lösung, die am Montagmorgen läuft.
      </p>

      <div style={{
        display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center',
        pointerEvents: 'auto',
        animation: 'kz-fade-up 900ms var(--ease-out) 880ms both'
      }}>
        <a href="/audit"
        data-petal-landing="true"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600,
          padding: '14px 26px',
          background: hover ? 'var(--kz-charcoal-soft)' : 'var(--kz-charcoal)',
          color: 'var(--kz-cream)',
          borderRadius: 8, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          boxShadow: hover ?
          '0 18px 40px -8px rgba(31,41,51,0.16), 0 6px 14px rgba(31,41,51,0.08)' :
          '0 6px 18px -4px rgba(31,41,51,0.12), 0 2px 6px rgba(31,41,51,0.06)',
          transition: 'background 140ms var(--ease-out), box-shadow 220ms var(--ease-out), transform 220ms var(--ease-out)',
          transform: hover ? 'translateY(-1px)' : 'translateY(0)'
        }}>
          Audit buchen
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
        <a href="/pricing"
          data-petal-landing="true"
          style={{
          fontSize: 15, fontWeight: 500,
          padding: '14px 22px',
          background: 'transparent', color: 'var(--fg)',
          borderRadius: 8, textDecoration: 'none',
          border: '1.5px solid var(--kz-border)', fontFamily: 'var(--font-sans)'
        }}>
          Pakete & Festpreise
        </a>
        <a href="https://wa.me/491590103192"
          target="_blank" rel="noopener noreferrer"
          data-petal-landing="true"
          style={{
          fontSize: 15, fontWeight: 500,
          padding: '14px 22px',
          background: 'transparent', color: 'var(--fg)',
          borderRadius: 8, textDecoration: 'none',
          border: '1.5px solid var(--kz-border)', fontFamily: 'var(--font-sans)'
        }}>
          WhatsApp
        </a>
      </div>

      {/* Trust-Trio */}
      <div style={{
        marginTop: 28,
        fontFamily: 'var(--font-sans)', fontSize: 13,
        color: 'var(--fg-muted)',
        letterSpacing: '0.04em',
        animation: 'kz-fade-up 1000ms var(--ease-out) 1100ms both'
      }}>
        12+ Jahre Mobility-IT · Eigener Stack auf Hetzner · Kein Lock-in
      </div>

      {/* Scroll cue */}
      <div style={{
        position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.2em',
        color: 'var(--fg-muted)',
        animation: 'kz-fade-up 1000ms var(--ease-out) 1500ms both'
      }}>
        <span>Scrollen</span>
        <div style={{
          width: 1, height: 36,
          background: 'linear-gradient(to bottom, var(--fg-muted) 0%, var(--fg-muted) 50%, transparent 100%)',
          animation: 'kz-scroll-line 2.4s var(--ease-zen) infinite'
        }} />
      </div>
    </div>);

}

// ---------- Tweaks ----------
function HeroTweaks({ tweak, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Petals">
        <TweakSlider label="Anzahl" value={tweak.petalCount} min={40} max={500} step={10}
        onChange={(v) => setTweak('petalCount', v)} />
        <TweakSlider label="Wind" value={tweak.wind} min={0} max={3} step={0.05}
        onChange={(v) => setTweak('wind', v)} />
        <TweakSlider label="Cursor-Radius" value={tweak.repelRadius} min={60} max={300} step={5}
        onChange={(v) => setTweak('repelRadius', v)} />
      </TweakSection>
      <TweakSection title="Komposition">
        <TweakToggle label="Sumi-Berge" value={tweak.showMountains}
        onChange={(v) => setTweak('showMountains', v)} />
        <TweakToggle label="Ember-Sonne" value={tweak.showSun}
        onChange={(v) => setTweak('showSun', v)} />
        <TweakSlider label="Kirschzweige" value={tweak.branchCount} min={1} max={4} step={1}
        onChange={(v) => setTweak('branchCount', v)} />
      </TweakSection>
      <TweakSection title="Copy">
        <TweakText label="Headline" value={tweak.headline}
        onChange={(v) => setTweak('headline', v)} />
        <TweakText label="Sub" value={tweak.sub}
        onChange={(v) => setTweak('sub', v)} />
      </TweakSection>
    </TweaksPanel>);

}

// ---------- App ----------
function App() {
  const [tweak, setTweak] = useTweaks(TWEAKS_DEFAULTS);
  const mouse = useMouseSmooth();
  const gustFn = useRef(() => {});
  const extraFn = useRef(() => {});
  const setZonesFn = useRef(() => {});

  // detect mobile -> reduce
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 720;
  const effectiveCount = isMobile ? Math.min(80, tweak.petalCount) : tweak.petalCount;
  const branches = isMobile ? Math.min(2, tweak.branchCount) : tweak.branchCount;

  // Measure CTA-Buttons → register als Landing-Zones im Petal-System.
  // Coords sind hero-section-relative (= canvas-relative) damit Petal-x/y matchen.
  React.useEffect(() => {
    const updateZones = () => {
      const heroSection = document.querySelector('[data-screen-label="01 Hero"]');
      if (!heroSection) return;
      const heroRect = heroSection.getBoundingClientRect();
      const buttons = document.querySelectorAll('[data-petal-landing="true"]');
      const zones = Array.from(buttons).map((btn) => {
        const r = btn.getBoundingClientRect();
        return {
          x: r.left - heroRect.left,
          y: r.top - heroRect.top,
          w: r.width,
          h: r.height,
        };
      });
      setZonesFn.current(zones);
    };
    // initial passes — multiple um Font-Load-Reflow abzufangen
    const t1 = setTimeout(updateZones, 200);
    const t2 = setTimeout(updateZones, 800);
    const t3 = setTimeout(updateZones, 1800);
    window.addEventListener('resize', updateZones);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      window.removeEventListener('resize', updateZones);
    };
  }, []);

  return (
    <>
      <KzScrollProgress />
      <Header />

      <section data-screen-label="01 Hero" style={{
        position: 'relative',
        width: '100%', height: '100vh',
        overflow: 'hidden',
        background: 'var(--kz-cream)',
        zIndex: 2,
      }}>
        {/* Subtle ink wash so the cream isn't dead-flat */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 90% 60% at 50% 100%, rgba(31,41,51,0.07) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <Sun mouse={mouse} show={tweak.showSun} />
        <Mountains mouse={mouse} show={tweak.showMountains} />

        {/* Branches */}
        {Array.from({ length: branches }).map((_, i) =>
        <Branch key={i} index={i} total={branches} mouse={mouse}
        onGust={(x, y, n) => {
          gustFn.current(x, y, 1);
          extraFn.current(x, y, n);
        }} />
        )}

        {/* Falling petals — scoped to hero */}
        <PetalLayer
          count={effectiveCount}
          wind={tweak.wind}
          repelRadius={tweak.repelRadius}
          mouse={mouse}
          registerSpawnGust={(fn) => {gustFn.current = fn;}}
          registerSpawnExtra={(fn) => {extraFn.current = fn;}}
          registerSetLandingZones={(fn) => {setZonesFn.current = fn;}} />

        <HeroOverlay headline={tweak.headline} sub={tweak.sub} />
      </section>

      <main style={{ position: 'relative', zIndex: 2, background: 'var(--kz-cream)' }}>
        <KzManifest />
        <KzProblem />
        <KzAndererWeg />
        <KzAngebot />
        <KzSectionDivider />
        <KzMethodik />
        <KzVertrauen />
        <KzSectionDivider />
        <KzUeberMich />
        <div id="faq"></div>
        <KzFaq />
        <KzKontakt />
        <KzFooter />
      </main>

      {/* Tweaks-Panel nur sichtbar mit ?tweaks=1 in URL — Kunden sehen es nicht */}
      {typeof window !== 'undefined' && window.location.search.includes('tweaks=1') &&
        <HeroTweaks tweak={tweak} setTweak={setTweak} />}
    </>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);