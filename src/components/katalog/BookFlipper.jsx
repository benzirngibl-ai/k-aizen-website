// BookFlipper.jsx — 3D-Flip-Book mit k-AIzen-Modern-Theme
// Portiert aus claude-design-export/grimoire-book-flipper.jsx,
// Grimoire-Styling (Leder, Pergament, Latein-Chrome) entfernt.
//
// Mechanik unverändert: Stack-of-Leaves, jede Leaf hat front/back-Face,
// progress 0..(totalSpreads-1) steuert rotateY auf der aktiven Leaf.
//
// Props:
//   pages: Array<ReactNode> — flach, paarweise (recto, verso) zu Spreads
//   spreadAspect: number — width/height der zweiseitigen Aufschlagsfläche (default 1.55)
//
// Input: Mausrad, Pfeiltasten, Touch-Swipe, sichtbare Buttons.

import React from 'react';

function useBookScroll(totalSpreads) {
  const [progress, setProgress] = React.useState(0);
  const targetRef = React.useRef(0);
  const rafRef = React.useRef(0);

  const animate = React.useCallback(() => {
    setProgress((cur) => {
      const target = targetRef.current;
      const delta = target - cur;
      if (Math.abs(delta) < 0.001) {
        rafRef.current = 0;
        return target;
      }
      const next = cur + delta * 0.14;
      rafRef.current = requestAnimationFrame(animate);
      return next;
    });
  }, []);

  const setTarget = React.useCallback((v) => {
    const clamped = Math.max(0, Math.min(totalSpreads - 1, v));
    targetRef.current = clamped;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
  }, [totalSpreads, animate]);

  React.useEffect(() => {
    let acc = 0;
    let lastTime = 0;
    const onWheel = (e) => {
      e.preventDefault();
      const now = performance.now();
      acc += e.deltaY;
      const THRESHOLD = 80;
      if (Math.abs(acc) > THRESHOLD && now - lastTime > 180) {
        const dir = acc > 0 ? 1 : -1;
        setTarget(targetRef.current + dir);
        acc = 0;
        lastTime = now;
      }
    };
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault(); setTarget(targetRef.current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault(); setTarget(targetRef.current - 1);
      } else if (e.key === 'Home') {
        e.preventDefault(); setTarget(0);
      } else if (e.key === 'End') {
        e.preventDefault(); setTarget(totalSpreads - 1);
      }
    };
    let touchStartX = 0;
    const onTouchStart = (e) => { touchStartX = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
      const dx = (e.changedTouches[0].clientX - touchStartX);
      if (Math.abs(dx) > 40) setTarget(targetRef.current + (dx < 0 ? 1 : -1));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [setTarget, totalSpreads]);

  return [progress, targetRef, setTarget];
}

function BlankPage() {
  return <div style={{ width: '100%', height: '100%', background: '#F5F0E8' }} />;
}

export default function BookFlipper({ pages, spreadAspect = 1.55 }) {
  const pad = pages.length % 2 === 0 ? pages : [...pages, <BlankPage key="pad" />];
  const totalSpreads = pad.length / 2;
  const [progress, targetRef, setTarget] = useBookScroll(totalSpreads);
  const currentSpread = Math.round(progress);

  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden',
      background: 'radial-gradient(ellipse 90% 70% at 50% 45%, #F5F0E8 0%, #E8DFD0 75%, #D8CBB4 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      perspective: '2400px',
    }}>
      <BookStage
        pad={pad}
        totalSpreads={totalSpreads}
        progress={progress}
        currentSpread={currentSpread}
        spreadAspect={spreadAspect}
      />
      <BookChrome
        current={currentSpread + 1}
        total={totalSpreads}
        onPrev={() => setTarget(targetRef.current - 1)}
        onNext={() => setTarget(targetRef.current + 1)}
        progress={progress}
      />
    </div>
  );
}

function BookStage({ pad, totalSpreads, progress, currentSpread, spreadAspect }) {
  const [dim, setDim] = React.useState({ w: 1200, h: 780 });
  React.useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const padX = 80, padY = 140;
      const maxW = vw - padX, maxH = vh - padY;
      let w = maxW, h = w / spreadAspect;
      if (h > maxH) { h = maxH; w = h * spreadAspect; }
      setDim({ w: Math.round(w), h: Math.round(h) });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [spreadAspect]);

  const halfW = dim.w / 2;
  const H = dim.h;

  const leftStatic  = pad[2 * currentSpread] || <BlankPage />;
  const rightStatic = pad[2 * currentSpread + 1] || <BlankPage />;

  return (
    <div style={{
      position: 'relative', width: dim.w, height: dim.h,
      transformStyle: 'preserve-3d',
      WebkitTransformStyle: 'preserve-3d',
    }}>
      {/* Soft desk shadow */}
      <div style={{
        position: 'absolute', left: -30, right: -30, bottom: -36, height: 70,
        background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(31,41,51,0.22), transparent 70%)',
        filter: 'blur(12px)', zIndex: 0,
      }} />

      {/* Subtle binding background (k-aizen charcoal, thin) */}
      <div style={{
        position: 'absolute', inset: -10, borderRadius: 4,
        background: '#1f2933',
        boxShadow:
          'inset 0 0 30px rgba(0,0,0,0.35), ' +
          '0 30px 70px -22px rgba(0,0,0,0.45), ' +
          '0 10px 30px -12px rgba(0,0,0,0.35)',
        zIndex: 0,
      }} />

      {/* Static left page */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: halfW, height: H,
        zIndex: 1, background: '#F5F0E8', overflow: 'hidden',
      }}>
        {leftStatic}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 60, pointerEvents: 'none',
          background: 'linear-gradient(270deg, rgba(31,41,51,0.18), rgba(31,41,51,0.04) 50%, transparent)' }} />
      </div>

      {/* Static right page (beneath stack) */}
      <div style={{
        position: 'absolute', right: 0, top: 0, width: halfW, height: H,
        zIndex: 1, background: '#F5F0E8', overflow: 'hidden',
      }}>
        {rightStatic}
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 60, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(31,41,51,0.18), rgba(31,41,51,0.04) 50%, transparent)' }} />
      </div>

      {/* Flipping leaves */}
      {Array.from({ length: totalSpreads }).map((_, l) => {
        const raw = progress - l;
        if (raw <= -0.5) return null;
        if (raw >= 1.5) return null;
        const t = Math.max(0, Math.min(1, raw));
        const rotY = -t * 180;
        const isActive = raw > 0.001 && raw < 0.999;
        const zIndex = isActive ? 50 : (raw >= 1 ? 10 - l : 20 + (totalSpreads - l));
        const frontPage = pad[2 * l + 1];
        const backPage  = pad[2 * l + 2] || <BlankPage />;
        if (raw >= 1.02) return null;
        return (
          <Leaf
            key={l} half={halfW} height={H} rotY={rotY}
            zIndex={zIndex}
            front={frontPage}
            back={backPage}
          />
        );
      })}

      {/* Center binding hairline */}
      <div style={{
        position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
        background: 'linear-gradient(180deg, transparent, rgba(31,41,51,0.45) 15%, rgba(31,41,51,0.45) 85%, transparent)',
        transform: 'translateX(-0.5px)', zIndex: 100, pointerEvents: 'none',
      }} />
    </div>
  );
}

function Leaf({ half, height, rotY, zIndex, front, back }) {
  const shadow = Math.sin(Math.abs(rotY) * Math.PI / 180);
  const showingBack = Math.abs(rotY) > 90;

  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, width: half, height,
      transformStyle: 'preserve-3d',
      WebkitTransformStyle: 'preserve-3d',
      transformOrigin: 'left center',
      transform: `rotateY(${rotY}deg)`,
      zIndex,
      willChange: 'transform',
      pointerEvents: 'none',
    }}>
      {/* FRONT face */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: 'translateZ(0.5px)',
        visibility: showingBack ? 'hidden' : 'visible',
        background: '#F5F0E8',
        overflow: 'hidden',
      }}>
        {front}
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 60, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(31,41,51,0.18), rgba(31,41,51,0.04) 50%, transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(${270 + rotY * 0.4}deg, rgba(31,41,51,${shadow * 0.22}), transparent 55%)` }} />
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 20,
          background: `linear-gradient(270deg, rgba(255,250,240,${shadow * 0.3}), transparent)`,
          pointerEvents: 'none',
        }} />
      </div>

      {/* BACK face */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: 'rotateY(180deg) translateZ(0.5px)',
        visibility: showingBack ? 'visible' : 'hidden',
        background: '#F5F0E8',
        overflow: 'hidden',
      }}>
        {back}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 60, pointerEvents: 'none',
          background: 'linear-gradient(270deg, rgba(31,41,51,0.18), rgba(31,41,51,0.04) 50%, transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(${90 - rotY * 0.4}deg, rgba(31,41,51,${shadow * 0.22}), transparent 55%)` }} />
      </div>
    </div>
  );
}

function BookChrome({ current, total, onPrev, onNext, progress }) {
  const [showHint, setShowHint] = React.useState(true);
  React.useEffect(() => {
    if (progress > 0.3) setShowHint(false);
  }, [progress]);

  const btnStyle = {
    background: 'transparent',
    border: '1px solid rgba(31,41,51,0.35)',
    color: '#1f2933',
    padding: '8px 18px',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    borderRadius: 4,
    transition: 'all 200ms ease-out',
  };

  return (
    <>
      {/* Top chrome — brand + close */}
      <div style={{
        position: 'fixed', top: 18, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 24px',
        pointerEvents: 'none', zIndex: 200,
      }}>
        <div style={{
          color: '#1f2933',
          fontFamily: '"Cormorant Garamond", "Iowan Old Style", Georgia, serif',
          fontStyle: 'italic', fontSize: 18,
        }}>
          k-<span style={{ color: '#E85A2B' }}>AI</span>zen · Katalog
        </div>
        <a href="/" style={{
          pointerEvents: 'auto',
          fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#1f2933', textDecoration: 'none',
          padding: '8px 14px', border: '1px solid rgba(31,41,51,0.25)',
          borderRadius: 4, background: 'rgba(245,240,232,0.7)',
          backdropFilter: 'blur(6px)',
        }}>Schließen ✕</a>
      </div>

      {/* Bottom chrome — nav + counter */}
      <div style={{
        position: 'fixed', bottom: 24, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18,
        zIndex: 200,
      }}>
        <button onClick={onPrev} style={btnStyle} onMouseEnter={(e) => { e.currentTarget.style.background = '#1f2933'; e.currentTarget.style.color = '#F5F0E8'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1f2933'; }}>← Zurück</button>
        <span style={{
          fontFamily: 'system-ui, sans-serif', fontSize: 13, color: '#1f2933',
          letterSpacing: '0.1em', fontWeight: 500,
        }}>
          Seite <strong style={{ color: '#E85A2B' }}>{String(current).padStart(2, '0')}</strong> / {String(total).padStart(2, '0')}
        </span>
        <button onClick={onNext} style={btnStyle} onMouseEnter={(e) => { e.currentTarget.style.background = '#1f2933'; e.currentTarget.style.color = '#F5F0E8'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1f2933'; }}>Weiter →</button>
      </div>

      {showHint && (
        <div style={{
          position: 'fixed', bottom: 90, right: 36, zIndex: 200,
          color: '#1f2933',
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic', fontSize: 17, textAlign: 'right',
          animation: 'kz-hint 2.2s ease-in-out infinite', maxWidth: 240, lineHeight: 1.4,
          opacity: 0.85,
        }}>
          Scrollen oder klicken, um zu blättern<br />
          <span style={{ fontSize: 24 }}>↻</span>
        </div>
      )}

      <style>{`
        @keyframes kz-hint {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50%      { opacity: 0.95; transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
