/* ============================================================
   k-AIzen — Sections (scroll narrative)
   ------------------------------------------------------------
   11 Sektionen nach k-AIzen Content-Blueprint:
   1. Hero (in hero.jsx)
   2. Manifest (3 Prinzipien)
   3. Anderer Weg (Anti-Personae)
   5. Angebot (Setup / Retainer)
   6. Methodik (Observation-driven)
   7. Vertrauen (4 Punkte)
   8. Use-Cases (kommt in einem späteren Sprint)
   9. Über mich (Bens Hero-Story)
   10. FAQ (9 Fragen)
   11. Kontakt (3 Wege)
   ============================================================ */

const KZ_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// ---------- scroll-driven utilities ----------
function useScrollY() {
  const [y, setY] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const tick = () => { setY(window.scrollY || 0); raf = 0; };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return y;
}

function useScrollDirection() {
  const [dir, setDir] = React.useState('up');
  React.useEffect(() => {
    let last = window.scrollY || 0;
    let raf = 0;
    const tick = () => {
      const y = window.scrollY || 0;
      const dy = y - last;
      if (Math.abs(dy) > 4) {
        setDir(dy > 0 ? 'down' : 'up');
        last = y;
      }
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return dir;
}

function useReveal(opts = {}) {
  const { threshold = 0.18, rootMargin = '0px 0px -10% 0px', once = false } = opts;
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        if (once) obs.unobserve(el);
      } else if (!once) {
        setVisible(false);
      }
    }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, y = 18, duration = 900, as: Tag = 'div', style, ...rest }) {
  const [ref, visible] = useReveal();
  // Mobile: kein translateY → keine staggered-stack-order-quirks, nur opacity-fade
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 720;
  const effY = isMobile ? 0 : y;
  return (
    <Tag ref={ref} style={{
      opacity: 1,
      transform: visible ? 'none' : `translateY(${effY}px)`,
      transition: `transform ${duration}ms ${KZ_EASE} ${delay}ms`,
      ...style,
    }} {...rest}>
      {children}
    </Tag>
  );
}

function RevealHeadline({ text, delay = 0, style, accent }) {
  const [ref, visible] = useReveal({ threshold: 0.3 });
  const words = text.split(' ');
  return (
    <h2 ref={ref} style={{
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(40px, 6.5vw, 88px)',
      lineHeight: 1.02,
      letterSpacing: '-0.02em',
      margin: 0,
      color: 'var(--fg)',
      textWrap: 'balance',
      ...style,
    }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: 'inline-block',
          overflow: 'hidden',
          marginRight: '0.28em',
          verticalAlign: 'top',
          paddingBottom: '0.18em',
          marginBottom: '-0.18em',
        }}>
          <span style={{
            display: 'inline-block',
            transform: visible ? 'translateY(0)' : 'translateY(110%)',
            opacity: 1,
            transition: `transform 1100ms ${KZ_EASE} ${delay + i * 70}ms`,
            color: accent && accent.includes(i) ? 'var(--kz-ember-text)' : 'inherit',
            willChange: 'transform',
          }}>
            {w}
          </span>
        </span>
      ))}
    </h2>
  );
}

// ---------- Crane: flies across screen as you scroll ----------
function Crane() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current; if (!el) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, (window.scrollY || 0) / Math.max(1, total)));
      const startP = 0.04;
      const endP = 0.92;
      const t = Math.max(0, Math.min(1, (p - startP) / (endP - startP)));
      const x = -20 + t * 130;
      const yArc = -Math.sin(t * Math.PI) * 18;
      const yBase = 8 + t * 6;
      const wing = Math.sin((window.scrollY || 0) * 0.018) * 1.6;
      const opacity = t > 0 && t < 1 ? 1 : 0;
      el.style.transform = `translate3d(${x}vw, calc(${yBase}vh + ${yArc}vh), 0) rotate(${wing}deg)`;
      el.style.opacity = String(opacity);
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', tick);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      pointerEvents: 'none', zIndex: 4,
    }}>
      <img ref={ref} src="/animations/claude-design/sumi-crane.png" alt=""
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: 'clamp(180px, 22vw, 320px)',
          opacity: 0,
          willChange: 'transform, opacity',
          filter: 'saturate(0.9)',
        }} />
    </div>
  );
}

// ---------- Scroll progress bar ----------
function ScrollProgress() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, (window.scrollY || 0) / Math.max(1, total)));
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 2,
      zIndex: 60, pointerEvents: 'none',
      background: 'rgba(31,41,51,0.06)',
    }}>
      <div ref={ref} style={{
        height: '100%', width: '100%',
        background: 'var(--kz-ember)',
        transformOrigin: 'left center',
        transform: 'scaleX(0)',
        transition: 'transform 80ms linear',
      }} />
    </div>
  );
}

// ---------- Reusable: LogoMark ----------
function LogoMark({ size = 26, opacity = 1, style }) {
  return (
    <img src="/animations/claude-design/logo-mark.png" alt="" style={{
      height: size, width: 'auto', opacity,
      display: 'inline-block', verticalAlign: 'middle',
      flexShrink: 0,
      ...style,
    }} />
  );
}

// ---------- Reusable: LogoFull ----------
function LogoFull({ size = 44, opacity = 1, style }) {
  return (
    <img src="/animations/claude-design/logo-full.png" alt="k-AIzen" style={{
      height: size, width: 'auto', opacity,
      display: 'inline-block', verticalAlign: 'middle',
      flexShrink: 0,
      ...style,
    }} />
  );
}

// ---------- Reusable: SectionDivider ----------
function SectionDivider() {
  const [ref, visible] = useReveal({ threshold: 0.3 });
  return (
    <div ref={ref} style={{
      maxWidth: 1120, margin: '0 auto',
      padding: '0 clamp(24px, 5vw, 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 24,
    }}>
      <div style={{
        flex: 1, height: 1, maxWidth: 240,
        background: 'linear-gradient(to right, transparent, var(--kz-border) 40%, var(--kz-border))',
        transform: visible ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'right center',
        transition: `transform 1100ms ${KZ_EASE}`,
      }} />
      <LogoMark size={42} opacity={visible ? 0.7 : 0}
        style={{ transition: `opacity 800ms ${KZ_EASE} 200ms` }} />
      <div style={{
        flex: 1, height: 1, maxWidth: 240,
        background: 'linear-gradient(to left, transparent, var(--kz-border) 40%, var(--kz-border))',
        transform: visible ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left center',
        transition: `transform 1100ms ${KZ_EASE} 100ms`,
      }} />
    </div>
  );
}

// ---------- Global Mobile-Style-Inject ----------
function KzGlobalStyles() {
  return (
    <style>{`
      /* Mobile: forciere mehr Card-Stack-Gap, verhindert visual-overlap
         durch Reveal-transform-stacking-quirks */
      @media (max-width: 720px) {
        .kz-section-grid { row-gap: 64px !important; }
      }
    `}</style>
  );
}

// ---------- Reusable: Leaf-Icon (Sumi-Tusche-Sprites als Brand-Akzent) ----------
const KZ_LEAVES = [
  '/icons/icon-sakura-branch.png',   // 0 — rosa Sakura mit grünen Blättern
  '/icons/icon-maple-red.png',       // 1 — rotes Ahorn-Bouquet
  '/icons/icon-ginkgo.png',          // 2 — gelbe Ginkgo-Blätter
  '/icons/icon-plum-blossom.png',    // 3 — weiß-rosa Pflaumenblüten
  '/icons/icon-camellia.png',        // 4 — rote Kamelien
  '/icons/icon-pine.png',            // 5 — Kiefernzweig mit Zapfen
];
function KzLeaf({ index = 0, size = 28, opacity = 0.95, style }) {
  const src = KZ_LEAVES[((index % KZ_LEAVES.length) + KZ_LEAVES.length) % KZ_LEAVES.length];
  return (
    <img src={src} alt="" aria-hidden="true" style={{
      width: size, height: size,
      objectFit: 'contain',
      opacity,
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      ...style,
    }} />
  );
}

// ---------- Reusable: SectionEyebrow ----------
function SectionEyebrow({ leaf = 0, label, align = 'left' }) {
  return (
    <Reveal>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.18em',
        color: 'var(--fg-muted)', marginBottom: 24,
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      }}>
        <LogoMark size={28} opacity={0.75} />
        <KzLeaf index={leaf} size={26} />
        <span>{label}</span>
      </div>
    </Reveal>
  );
}

// ============================================================
// SECTION 02 — Manifest (3 Prinzipien)
// ============================================================
function ManifestSection() {
  // KzGlobalStyles wird hier gerendert weil ManifestSection als erstes
  // Section nach dem Hero kommt — Style-Tag injiziert sich einmalig in HEAD
  const principles = [
    {
      leaf: 0, title: 'Preise offen statt „auf Anfrage"',
      desc: 'Jeder Festpreis steht auf dieser Seite. Keine Stundenfallen, keine Geheim-Angebote, kein „das müssen wir uns mal anschauen".',
    },
    {
      leaf: 5, title: 'Übergebbar statt Vertrags-Knebel',
      desc: 'Dein Server, deine Workflows, dein Code. Bei Kündigung gehört dir alles. Übergabe in fünf Werktagen, dokumentiert, jederzeit.',
    },
    {
      leaf: 3, title: 'Liefern statt Workshops',
      desc: 'Ich rede nicht über KI-Strategien. Ich baue Tools, die nach dem Projekt laufen. Erfolg messen wir in Stunden, die dein Team zurück hat.',
    },
  ];
  return (
    <section data-screen-label="02 Manifest" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      overflow: 'hidden',
    }}>
      <KzGlobalStyles />
      <Reveal duration={1600} y={40} className="kz-cherry-decoration" style={{
        position: 'absolute',
        right: '-4%', bottom: '-2%',
        width: 'min(40vw, 480px)',
        opacity: 0.85,
        pointerEvents: 'none',
      }}>
        <img src="/animations/claude-design/sumi-cherry-tree.png" alt=""
          style={{ width: '100%', display: 'block', filter: 'saturate(0.92)' }} />
      </Reveal>
      <style>{`
        @media (max-width: 720px) {
          .kz-cherry-decoration { display: none; }
        }
      `}</style>

      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
        position: 'relative',
      }}>
        <SectionEyebrow leaf={0} label="Manifest" />
        <RevealHeadline text="Drei Prinzipien. Keine Ausnahmen." accent={[1]} />

        <Reveal delay={300} style={{ marginTop: 64 }}>
          <div className="kz-section-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(20px, 2.5vw, 32px)',
          }}>
            {principles.map((p, i) => (
              <Reveal key={i} delay={200 + i * 120}>
                <div style={{
                  padding: '36px 32px',
                  background: 'var(--bg)',
                  borderRadius: 12,
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <KzLeaf index={p.leaf} size={56} style={{ marginBottom: 18 }} />
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(20px, 2vw, 24px)',
                    fontWeight: 400, lineHeight: 1.25,
                    margin: '0 0 14px',
                    letterSpacing: '-0.01em',
                  }}>{p.title}</h3>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 15, lineHeight: 1.6,
                    color: 'var(--fg-muted)',
                    margin: 0, textWrap: 'pretty',
                  }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// SECTION 04 — Anderer Weg (Anti-Personae)
// ============================================================
function AndererWegSection() {
  const prinzipien = [
    {
      negativ: 'Kein Tool-First',
      positiv: 'Prozess-First',
      desc: 'Wir starten bei deiner Klick-Routine, nicht bei einer KI-Liste.',
    },
    {
      negativ: 'Kein Stunden-Salat',
      positiv: 'Festpreise',
      desc: 'Du weißt vorher, was es kostet. Keine Nachträge, keine Überraschungen.',
    },
    {
      negativ: 'Kein Pitch-Team',
      positiv: 'Ein Ansprechpartner',
      desc: 'Du sprichst mit mir. Nicht mit drei Account-Managern.',
    },
  ];
  return (
    <section data-screen-label="04 Anderer Weg" style={{
      position: 'relative',
      padding: 'clamp(100px, 16vh, 200px) 0 clamp(100px, 16vh, 200px)',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow leaf={2} label="Der andere Weg" />
        <RevealHeadline text="Es gibt einen anderen Weg." accent={[3]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 720, marginTop: 32, marginBottom: 72,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Kein Workshop-Verkäufer. Kein Konzern-Beratungs-Theater.
            Ein Mensch, der deinen Betrieb versteht, die Lösung baut und
            danach als Partner bleibt — solange du Mehrwert siehst.
          </p>
        </Reveal>

        <div className="kz-section-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'clamp(24px, 3vw, 48px)',
        }}>
          {prinzipien.map((p, i) => (
            <Reveal key={i} delay={200 + i * 120}>
              <div style={{ borderTop: '1px solid var(--kz-border)', paddingTop: 28 }}>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13, fontWeight: 500,
                  color: 'var(--fg-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: 8,
                  textDecoration: 'line-through',
                  textDecorationColor: 'var(--kz-ember)',
                  textDecorationThickness: '1.5px',
                }}>{p.negativ}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 3vw, 38px)',
                  fontWeight: 400, lineHeight: 1.1,
                  margin: '0 0 16px',
                  letterSpacing: '-0.015em',
                  color: 'var(--kz-ember-text)',
                }}>{p.positiv}</h3>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 16, lineHeight: 1.6,
                  color: 'var(--fg)',
                  margin: 0, textWrap: 'pretty',
                }}>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION — Ein Tag mit Lena (5 Szenen Story-Herzstück)
// ============================================================

// Discord-Mockup für die Story (JSX-Port der pitch/DiscordMockup.astro).
// Light-Markdown: **bold** → <strong>, \n → <br>. priority='alert' = rote Beschwerde-Markierung.
function dcRenderContent(raw) {
  const esc = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:600">$1</strong>')
    .replace(/\n/g, '<br>');
}
function DiscordCard({ channel, author = 'k-AIzen PA', timestamp, content, priority }) {
  const isAlert = priority === 'alert';
  return (
    <div style={{
      background: 'linear-gradient(180deg, #2b2d31 0%, #26282c 100%)',
      borderRadius: 18,
      color: '#dbdee1',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      fontSize: 14, lineHeight: 1.55, overflow: 'hidden',
      boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
      width: '100%',
    }}>
      <header style={{
        background: 'linear-gradient(180deg, #1e1f22 0%, #1a1b1e 100%)',
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        color: '#f2f3f5', fontWeight: 600,
      }}>
        <span style={{ color: '#80848e', fontSize: 20, lineHeight: 1, fontWeight: 300 }}>#</span>
        <span style={{ fontSize: 15, letterSpacing: '-0.01em' }}>{channel.replace(/^#/, '')}</span>
        <span style={{
          marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
          background: '#23a559', boxShadow: '0 0 8px rgba(35,165,89,0.5)',
        }} />
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 14, padding: 18,
        ...(isAlert ? { borderLeft: '3px solid #f23f43', background: 'rgba(242,63,67,0.06)' } : {}) }}>
        <img src="/animations/claude-design/logo-mark.png" alt="" style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF5500 0%, #FF7733 100%)',
          padding: 7, objectFit: 'contain',
          boxShadow: '0 4px 12px rgba(255,85,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
        }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#f2f3f5', fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{author}</span>
            <span style={{
              background: 'linear-gradient(135deg, #5865f2, #4752c4)', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.5px',
            }}>BOT</span>
            {isAlert && (
              <span style={{
                background: 'linear-gradient(135deg, #f23f43, #c62828)', color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.5px',
              }}>! HOCH</span>
            )}
            <span style={{ color: '#949ba4', fontSize: 12 }}>heute · {timestamp}</span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: '#dbdee1' }}
            dangerouslySetInnerHTML={{ __html: dcRenderContent(content) }} />
        </div>
      </div>
    </div>
  );
}

function SzeneRow({ index, time, spoken, result, image, alt, discord, side = 'left' }) {
  const textFirst = side === 'left';
  const textBlock = (
    <div className="kz-szene-text">
      <div className="kz-szene-time" style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 13, fontWeight: 500,
        color: 'var(--kz-ember-text)',
        textTransform: 'uppercase', letterSpacing: '0.12em',
        marginBottom: 16,
      }}>{time}</div>
      {spoken && (
        <div className="kz-bubble" style={{
          background: 'var(--bg-alt)',
          borderRadius: 14,
          borderLeft: '3px solid var(--kz-ember)',
          padding: '18px 22px',
          margin: '0 0 18px',
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(16px, 1.5vw, 19px)',
          lineHeight: 1.5,
          fontStyle: 'italic',
          color: 'var(--fg)',
          textWrap: 'pretty',
        }}>„{spoken}"</div>
      )}
      <p className="kz-szene-result" style={{
        margin: 0,
        fontFamily: 'var(--font-sans)',
        fontSize: 'clamp(16px, 1.5vw, 19px)',
        lineHeight: 1.6,
        color: 'var(--fg-muted)',
        textWrap: 'pretty',
      }}>{result}</p>
      {discord && (
        <div style={{ marginTop: 24 }}>
          {(Array.isArray(discord) ? discord : [discord]).map((d, di) => (
            <div key={di} style={{ marginTop: di > 0 ? 14 : 0 }}>
              <DiscordCard {...d} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
  const illuBlock = image ? (
    <div className="kz-szene-illu" style={{
      position: 'relative',
      borderRadius: 16,
      overflow: 'hidden',
      aspectRatio: '16 / 9',
      boxShadow: '0 24px 48px -20px rgba(26,26,26,0.32), 0 0 0 1px rgba(26,26,26,0.05)',
    }}>
      <img src={image} alt={alt || ''} loading="lazy" style={{
        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
      }} />
    </div>
  ) : (
    <div className="kz-szene-illu" aria-hidden="true" style={{
      minHeight: 200,
      borderRadius: 12,
      background: 'var(--bg-alt)',
      border: '1px solid var(--kz-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 12, letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--fg-muted)', opacity: 0.55,
      }}>Illustration Szene {index + 1}</span>
    </div>
  );
  return (
    <Reveal delay={index * 100} y={28}>
      <div className="kz-szene" data-side={side} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'clamp(28px, 4vw, 56px)',
        alignItems: 'center',
        margin: 'clamp(48px, 7vh, 80px) 0',
      }}>
        {textFirst ? textBlock : illuBlock}
        {textFirst ? illuBlock : textBlock}
      </div>
    </Reveal>
  );
}

function EinTagMitLenaSection() {
  const szenen = [
    { time: 'Früher — ohne Assistent', spoken: null, image: '/pitch/markus/12-old-day.png', alt: 'Unternehmer überfordert am Schreibtisch, Papierchaos', result: '47 ungelesene Mails. Drei davon dringend — aber welche? Termine, die du fast vergisst, Rückfragen vom Team. Schon vor dem ersten Kaffee hinterher. So sah dein Morgen bisher aus.' },
    { time: '06:30 — Aufwachen', spoken: null, image: '/pitch/markus/01-morning.png', alt: 'Unternehmer wacht entspannt auf, liest Briefing am Handy', result: 'Statt Chaos: ein Briefing. Umsatz gestern, was über Nacht reinkam, deine Termine, was heute wichtig ist. 90 Sekunden lesen — du weißt, woran du bist, bevor der Tag dich kriegt.' },
    { time: '07:00 — Kaffee & Freigaben', spoken: null, image: '/pitch/markus/02-coffee.png', alt: 'Unternehmer gibt am Handy Aufgaben frei', result: 'Drei Freigaben warten: Bestellung ✅, Antwort an einen Kunden ✏️ noch persönlicher, Hotel für nächste Woche ✅. Drei Sekunden pro Entscheidung. Du entscheidest — dein Assistent macht den Rest.',
      discord: { channel: '#aufgaben', timestamp: '06:45', content: '📌 **3 Freigaben warten**\n\n**1. Bürobedarf nachbestellen**\nOffice-Discount · 38,50 €\n→ ✅ zum Bestellen\n\n**2. Antwort an Kunde Müller**\nDraft liegt im Thread\n→ ✅ senden · ✏️ ändern\n\n**3. Hotel Berlin · 03.–05.06.**\n487 € · stornofrei bis 02.06.\n→ ✅ zum Buchen' } },
    { time: '07:45 — Vor dem Aufbruch', spoken: 'Schmidt mag direkte Mails, kein Geschwafel — und sein neuer Einkäufer heißt Bernhardt, kommt aus dem Banken-Sektor.', image: '/pitch/markus/09-memory.png', alt: 'Unternehmer spricht Sprachnotiz ins Handy', result: 'Du sprichst es einfach ins Handy, drei Sekunden. Für immer gespeichert. Dein Assistent lernt dich und deine Kunden kennen — wie ein Mitarbeiter, der nie vergisst.' },
    { time: '6 Monate später', spoken: null, image: '/pitch/markus/10-memory-retrieve.png', alt: 'Unternehmer sieht erfreut die zusammengezogene Kundenhistorie', result: 'Eine Mail von Schmidt kommt rein. Dein Assistent zieht alles zusammen: Historie, Tonfall-Hinweise, deine Notizen. Du antwortest in der Sprache, die dein Kunde mag — ohne nachzudenken.' },
    { time: '08:10 — Eine Beschwerde kommt rein', spoken: 'Sag Herrn Brandt, dass es mir leid tut — und dass wir uns gerne auf einen Kaffee zusammensetzen, um das aus der Welt zu schaffen.', image: '/pitch/markus/04-postcall.png', alt: 'Unternehmer am Schreibtisch diktiert eine Antwort ins Handy', result: 'Eine verärgerte Mail landet im Posteingang — dein Assistent erkennt: Beschwerde, hoch priorisiert, und legt sie dir oben hin. Du sagst in einem Satz, was passieren soll. Sekunden später liegt die fertige, höfliche Mail bereit. Du liest, drückst Approve — raus. Aus einem Stoßseufzer wird eine professionelle Antwort.',
      discord: [
        { channel: '#posteingang', priority: 'alert', timestamp: '08:09', content: '🚨 **Beschwerde erkannt — hoch priorisiert**\n\n👤 Thomas Brandt (Bestandskunde)\n\n„…die letzte Lieferung war zwei Wochen zu spät, so kann ich nicht arbeiten. Ich erwarte eine Reaktion."\n\n📌 Oben angepinnt · wartet auf dich' },
        { channel: '#posteingang', timestamp: '08:11', content: '✏️ **Antwort-Entwurf · an Thomas Brandt**\n\n„Sehr geehrter Herr Brandt,\n\nes tut mir aufrichtig leid, dass die Lieferung so spät kam — das entspricht nicht unserem Anspruch. Lassen Sie uns das persönlich klären: Ich lade Sie gerne auf einen Kaffee ein, um eine Lösung zu finden, die für Sie passt.\n\nWann würde es Ihnen diese Woche passen?"\n\n→ ✅ senden · ✏️ ändern' },
      ] },
    { time: '08:30 — Im Auto', spoken: 'Brief mich nochmal zum Termin Schmidt GmbH.', image: '/pitch/markus/03-car.png', alt: 'Unternehmer fährt Auto, hört Briefing', result: 'Während du fährst, liest dir dein Assistent das Wichtigste vor: wer im Termin sitzt, was zuletzt besprochen wurde, frische News zur Firma. Du kommst vorbereitet an.' },
    { time: '09:43 — Nach dem Termin', spoken: null, image: '/pitch/markus/04-postcall.png', alt: 'Unternehmer zufrieden nach dem Meeting am Schreibtisch', result: 'Audio in den Channel. Drei Minuten später: Action-Items, Insights, Risiken — strukturiert. Du schickst direkt das Follow-up raus, ohne eine Notiz abzutippen.' },
    { time: '11:15 — Team-Frage', spoken: null, image: '/pitch/markus/14-team.png', alt: 'Unternehmer geht entspannt durchs Büro', result: '„Wie war nochmal der Ablauf für die Reisekostenabrechnung?" Früher unterbricht dich das. Jetzt antwortet dein Assistent aus dem Firmen-Wissen — die Antwort, die DU mal hinterlegt hast. Du wirst nur bei echtem Neuland gefragt.' },
    { time: '14:30 — Beim Geschäftsessen', spoken: null, image: '/pitch/markus/15-beleg.png', alt: 'Unternehmer fotografiert Beleg im Café', result: 'Bewirtungsbeleg abfotografiert, fertig. Datum, Betrag, Kategorie, Lieferant — alles ausgelesen und sortiert abgelegt. Was dein Steuerberater braucht, ist immer bereit. Keine Zettel im Handschuhfach.',
      discord: { channel: '#rechnungen', timestamp: '14:31', content: '🧾 **Beleg erfasst**\n\n  • Datum: 03.06.2026\n  • Betrag: 87,40 €\n  • Kategorie: Bewirtung (70 %)\n  • Lieferant: Trattoria da Vinci\n\n✅ Abgelegt + für Steuerberater markiert' } },
    { time: '18:00 — Feierabend', spoken: null, image: '/pitch/markus/07-evening.png', alt: 'Unternehmer entspannt abends auf dem Sofa', result: 'Du klappst den Laptop zu. Im Briefing wartet dein Tages-Wrap: alles erledigt, alles dokumentiert, Morgen-Plan steht schon. Du kannst loslassen — der Assistent hat den Faden.' },
  ];
  return (
    <section data-screen-label="03 Ein Tag mit Lena" id="story" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow leaf={1} label="Ein Tag mit deinem KI-Assistenten" />
        <RevealHeadline
          text="So fühlt sich ein Tag mit deinem KI-Mitarbeiter an."
          accent={[6, 7]} />
        {szenen.map((s, i) => (
          <SzeneRow key={i} index={i} time={s.time} spoken={s.spoken}
            result={s.result} image={s.image} alt={s.alt} discord={s.discord}
            side={i % 2 === 0 ? 'left' : 'right'} />
        ))}
      </div>
    </section>
  );
}

// ============================================================
// SECTION 05 — Angebot (Setup / Retainer)
// ============================================================
function AngebotSection() {
  const basisFeatures = [
    'Mail-Triage + Antwort-Drafts in deinem Ton',
    'Termine + tägliche Briefings',
    'Meeting-Protokolle in 60 Sekunden',
    'Customer-Memory — kennt deine Kunden',
    'Web-Recherche + Branchen-News',
    'Beleg-Erfassung',
    'Eigener Server in Deutschland · DSGVO inklusive · kein Lock-in',
  ];
  const module = [
    { name: 'Telefon-Empfang', desc: 'KI nimmt Anrufe an, beantwortet FAQs, bucht Termine.', preis: '+799 €/Mo' },
    { name: 'Social-Maschine', desc: 'Auto-Posting für LinkedIn in deinem Ton, mit Content-Kalender & Approve-Flow. Meta & Insta folgen.', preis: '+499 €/Mo' },
    { name: 'Lead-Pipeline', desc: 'Täglich passende Leads + fertige Outreach-Drafts.', preis: '+399 €/Mo' },
    { name: 'Beleg & Steuer', desc: 'DATEV-konformer Monats-Export an deinen Steuerberater.', preis: '+289 €/Mo' },
    { name: 'HR / Bewerber-Triage', desc: 'Bewerbungen geparst, bewertet und vorsortiert.', preis: '+189 €/Mo' },
  ];
  return (
    <section data-screen-label="05 Angebot" id="preis" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <style>{`
        .kz-bamboo-decoration {
          position: absolute;
          left: -2%; top: 8%;
          width: min(24vw, 320px);
          opacity: 0.78;
          pointer-events: none;
        }
        @media (max-width: 720px) {
          .kz-bamboo-decoration { display: none; }
        }
        .kz-basis-card {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: clamp(28px, 4vw, 56px);
        }
        @media (max-width: 760px) {
          .kz-basis-card { grid-template-columns: 1fr; }
        }
      `}</style>
      <Reveal duration={1600} y={40} className="kz-bamboo-decoration">
        <img src="/animations/claude-design/sumi-bamboo-full.png" alt=""
          style={{ width: '100%', display: 'block', filter: 'saturate(0.92)' }} />
      </Reveal>

      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
        position: 'relative',
      }}>
        <SectionEyebrow leaf={3} label="Angebot" />
        <RevealHeadline text="Ein PA. Ein Preis. Module nach Bedarf." accent={[2]} />

        {/* WERT-ANKER — vor dem Preis */}
        <Reveal delay={300}>
          <div style={{
            maxWidth: 760, marginTop: 32, marginBottom: 'clamp(48px, 7vh, 72px)',
            display: 'grid', gap: 24,
          }}>
            <p style={{
              margin: 0,
              borderLeft: '3px solid var(--kz-ember)',
              paddingLeft: 22,
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(16px, 1.5vw, 19px)',
              lineHeight: 1.6, color: 'var(--fg)',
              textWrap: 'pretty',
            }}>
              Eine Teilzeit-Assistenz (30 h) kostet dich als Arbeitgeber real
              {' '}<strong style={{ color: 'var(--kz-ember-text)' }}>~2.200–3.500 €/Mo</strong>{' '}
              — inkl. Lohnnebenkosten, Urlaub, Krankheit. Dein KI-PA: ein Bruchteil
              davon, 24/7, kündigt nie.
            </p>
            <p style={{
              margin: 0,
              borderLeft: '3px solid var(--kz-ember)',
              paddingLeft: 22,
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(16px, 1.5vw, 19px)',
              lineHeight: 1.6, color: 'var(--fg)',
              textWrap: 'pretty',
            }}>
              Spezialisierte Inbox-Services verlangen
              {' '}<strong style={{ color: 'var(--kz-ember-text)' }}>1.000–2.000 €/Mo</strong>{' '}
              — nur für E-Mails. Dein PA macht das plus Termine, Memory, Briefings,
              Belege und Protokolle — zum selben Preis.
            </p>
          </div>
        </Reveal>

        {/* BASIS-KARTE */}
        <Reveal delay={360}>
          <div className="kz-basis-card" style={{
            padding: 'clamp(32px, 4vw, 48px)',
            background: 'var(--kz-charcoal)',
            color: 'var(--kz-cream)',
            borderRadius: 14,
            marginBottom: 'clamp(40px, 6vh, 64px)',
            alignItems: 'start',
          }}>
            <div>
              <KzLeaf index={5} size={44} style={{ marginBottom: 16 }} />
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 400, lineHeight: 1.12,
                margin: '0 0 14px', letterSpacing: '-0.015em',
                color: 'var(--kz-cream)',
              }}>Dein KI-PA</h3>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 5vw, 56px)', lineHeight: 1,
                color: 'var(--kz-cream)',
                marginBottom: 6,
              }}>
                <span style={{ fontSize: '0.45em', color: 'rgba(245,240,232,0.6)' }}>ab </span>
                1.490 €<span style={{ fontSize: '0.4em', color: 'rgba(245,240,232,0.6)' }}> /Mo</span>
              </div>
              <div style={{
                fontSize: 13, color: 'rgba(245,240,232,0.6)', marginBottom: 24,
              }}>keine Mindestlaufzeit · Setup besprechen wir im Gespräch</div>
              <a href="/erstgespraech" style={ctaBtnStyle({ ember: true })}>
                Erstgespräch buchen <Arrow />
              </a>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'rgba(245,240,232,0.55)',
                marginBottom: 18,
              }}>Alles drin</div>
              <ul style={{
                listStyle: 'none', margin: 0, padding: 0,
                display: 'grid', gap: 12,
              }}>
                {basisFeatures.map((f, i) => (
                  <li key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 15, lineHeight: 1.45,
                    color: 'rgba(245,240,232,0.88)',
                    textWrap: 'pretty',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="var(--kz-ember-text)" strokeWidth="2.4" strokeLinecap="round"
                      strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* MODULE */}
        <Reveal delay={420}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 2.4vw, 28px)', fontWeight: 400,
            lineHeight: 1.15, letterSpacing: '-0.01em',
            margin: '0 0 8px', color: 'var(--fg)',
          }}>Dazubuchbare Module</h3>
          <p style={{
            margin: '0 0 28px',
            fontFamily: 'var(--font-sans)',
            fontSize: 16, lineHeight: 1.6, color: 'var(--fg-muted)',
            maxWidth: 640, textWrap: 'pretty',
          }}>
            Du erweiterst deinen PA genau dort, wo dein Betrieb es braucht — Modul
            dazu, fertig.
          </p>
        </Reveal>

        <div className="kz-section-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
        }}>
          {module.map((m, i) => (
            <Reveal key={i} delay={440 + i * 80}>
              <div style={{
                padding: '24px 26px',
                background: 'var(--bg-alt)',
                border: '1px solid var(--kz-border)',
                borderRadius: 12,
                height: '100%',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', gap: 12, marginBottom: 8,
                }}>
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20, fontWeight: 400, lineHeight: 1.15,
                    margin: 0, letterSpacing: '-0.01em', color: 'var(--fg)',
                  }}>{m.name}</h4>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 19, lineHeight: 1, whiteSpace: 'nowrap',
                    color: 'var(--kz-ember-text)',
                  }}>{m.preis}</div>
                </div>
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14, lineHeight: 1.55,
                  color: 'var(--fg-muted)', textWrap: 'pretty',
                }}>{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={840}>
          <p style={{
            margin: '28px 0 0',
            fontFamily: 'var(--font-sans)',
            fontSize: 16, lineHeight: 1.6,
            color: 'var(--fg-muted)', textWrap: 'pretty',
          }}>
            Rechnungen, Mahnwesen &amp; mehr —{' '}
            <a href="#kontakt" style={{
              color: 'var(--kz-ember-text)', textDecoration: 'none',
              borderBottom: '1px solid var(--kz-ember)',
            }}>sprich mich an</a>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ctaBtnStyle({ ember = false } = {}) {
  return {
    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
    padding: '12px 20px',
    background: ember ? 'var(--kz-ember-deep)' : 'var(--kz-charcoal)',
    color: 'var(--kz-cream)',
    borderRadius: 8, textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start',
  };
}
function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

// ============================================================
// SECTION 06 — Methodik (Observation-driven)
// ============================================================
/* entfernt: Audit-Geschäft eingestellt 2026-06-01, finale Entscheidung in Task 5 */
// Stub hält den Object.assign-Export + App()-Render gültig, rendert aber nichts.
function MethodikSection() {
  return null;
}
/* eslint-disable */
/* ORIGINAL — Audit-/Beobachtungs-Prozess, deaktiviert:
function MethodikSectionLegacy() {
  const cases = [
    {
      who: 'Buchhalterin',
      what: 'Mail-Anhänge runterladen, in Ordner sortieren, in DATEV importieren.',
      cost: '1h pro Tag · 250h pro Jahr',
    },
    {
      who: 'Vertriebsleiter',
      what: 'Drei Reports aus CRM, ERP und Mail-Stats zusammenkopieren und per Mail rumschicken.',
      cost: '4h pro Woche',
    },
    {
      who: 'Chef',
      what: 'Abends Offerten schreiben — weil tagsüber nichts zu schaffen ist.',
      cost: '10h pro Woche · Familienzeit weg',
    },
  ];
  return (
    <section data-screen-label="06 Methodik" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--bg-alt)',
    }}>
      <div style={{
        maxWidth: 980, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow leaf={4} label="So arbeite ich" />
        <RevealHeadline
          text="Ein Mitarbeiter, kein Werkzeug."
          accent={[0]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 640, marginTop: 32, marginBottom: 56,
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 'clamp(20px, 2vw, 26px)',
            lineHeight: 1.4, color: 'var(--fg)',
            textWrap: 'pretty',
          }}>
            Während andere KI-Strategien in PowerPoint diskutieren,
            baue ich dir eine KI-PA, die remote mitarbeitet.
          </p>
        </Reveal>

        <style>{`
          .kz-methodik-row {
            display: grid;
            grid-template-columns: minmax(120px, 200px) 1fr;
            gap: clamp(20px, 4vw, 48px);
            padding-bottom: 28px;
            align-items: baseline;
          }
          @media (max-width: 720px) {
            .kz-methodik-row { grid-template-columns: 1fr; gap: 12px; }
          }
        `}</style>
        <div style={{ display: 'grid', gap: 36, marginBottom: 48 }}>
          {cases.map((c, i) => (
            <Reveal key={i} delay={200 + i * 140}>
              <div className="kz-methodik-row" style={{
                borderBottom: i < cases.length - 1 ? '1px solid var(--kz-border)' : 'none',
              }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(22px, 2.4vw, 28px)',
                    fontWeight: 400, color: 'var(--fg)',
                    letterSpacing: '-0.01em',
                  }}>{c.who}</div>
                  <div style={{
                    fontFamily: 'var(--font-brush)',
                    fontSize: 'clamp(16px, 1.5vw, 20px)',
                    color: 'var(--kz-ember-text)',
                    marginTop: 6,
                  }}>{c.cost}</div>
                </div>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(15px, 1.3vw, 18px)',
                  lineHeight: 1.6, color: 'var(--fg-muted)',
                  margin: 0, textWrap: 'pretty',
                }}>{c.what}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={500}>
          <p style={{
            maxWidth: 640,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg)',
            margin: 0, textWrap: 'pretty',
          }}>
            Dann baue ich genau das Tool, das diese Klick-Routine wegnimmt.
            Sichtbares Ergebnis in Wochen, nicht Monaten.
            <span className="kz-pause"></span>
            Übergebbar, wenn du willst.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
END ORIGINAL */
/* eslint-enable */

// ============================================================
// SECTION 07 — Vertrauen (4 Punkte)
// ============================================================
function VertrauenSection() {
  const punkte = [
    {
      num: '01', title: 'EU-Datenhaltung',
      desc: 'Dein Daten-Stack läuft auf einem dedizierten Hetzner-Server in Deutschland (Nürnberg oder Falkenstein). Kein Datenexport, kein US-CLOUD-Act. Server-Zugang bekommst du, wenn du willst.',
    },
    {
      num: '02', title: 'DSGVO-konform ab Tag 1',
      desc: 'Auftragsverarbeitungsvertrag schriftlich vor Projektstart. Lösch- und Aufbewahrungskonzept dokumentiert. Keine Blackbox, kein „wir kümmern uns dann".',
    },
    {
      num: '03', title: 'On-Prem-Option',
      desc: 'Für Steuerberater, Anwälte, Treuhand und sensible Branchen: komplette Lösung läuft auf deiner eigenen Infrastruktur. Open-Source-Modelle (Llama, Mistral) lokal — Daten verlassen das Gebäude nicht.',
    },
    {
      num: '04', title: 'Transparente Tool-Wahl',
      desc: 'Ich verdiene nichts an Tool-Provisionen. Ich empfehle, was für deinen Fall am besten passt — Claude, GPT, Mistral oder Open-Source on-prem. Begründung kriegst du schriftlich.',
    },
  ];
  return (
    <section data-screen-label="07 Vertrauen" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow leaf={5} label="Vertrauen" />
        <RevealHeadline text="Deine Daten bleiben in Deutschland. Und bei dir." accent={[3, 4]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 720, marginTop: 32, marginBottom: 64,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Der größte Hemmschuh für KI im Mittelstand ist Datenschutz-Angst —
            und zwar mit gutem Grund. Wer ChatGPT ohne Rahmen nutzt, hat im Worst Case
            Daten in den USA und keine Auftragsverarbeitung. Wer mit mir arbeitet,
            hat das ab Tag 1 sauber.
          </p>
        </Reveal>

        <div className="kz-section-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'clamp(28px, 3vw, 48px)',
        }}>
          {punkte.map((p, i) => (
            <Reveal key={i} delay={200 + i * 120}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28, lineHeight: 1,
                  color: 'var(--kz-ember-text)',
                  marginBottom: 14, letterSpacing: '-0.02em',
                }}>{p.num}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(22px, 2.2vw, 28px)',
                  fontWeight: 400, lineHeight: 1.2,
                  margin: '0 0 14px',
                  letterSpacing: '-0.01em',
                }}>{p.title}</h3>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15, lineHeight: 1.6,
                  color: 'var(--fg-muted)',
                  margin: 0, textWrap: 'pretty',
                }}>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION 08 — Meet Lena (Brand-Avatar-Persona)
// ============================================================
function MeetLenaSection() {
  return (
    <section data-screen-label="08 Meet Lena" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow leaf={3} label="Dein KI-PA" />
        <RevealHeadline text="Das ist Lena." accent={[1]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 640, marginTop: 32, marginBottom: 64,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Lena ist nicht ein Tool. Sie ist eine <strong style={{ color: 'var(--fg)' }}>Person</strong>,
            mit der du arbeitest. Sie liest deine Mails, bereitet deine Termine vor,
            schreibt Antwort-Entwürfe in deinem Tonfall, recherchiert was du brauchst,
            und merkt sich, wer Frau Hauser ist. Du sprichst mit ihr im Discord —
            sie erledigt den Rest.
          </p>
        </Reveal>

        <div className="kz-section-grid kz-lena-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
          gap: 'clamp(32px, 4vw, 64px)',
          alignItems: 'center',
        }}>
          <Reveal delay={200}>
            <div style={{ position: 'relative' }}>
              <img src="/animations/claude-design/lena-hero.png"
                alt="Lena, dein KI-Personal-Assistent"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 'clamp(12px, 1.5vw, 20px)',
                  display: 'block',
                  boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4), 0 12px 24px -8px rgba(0,0,0,0.25)',
                  filter: 'saturate(0.96)',
                }} />
            </div>
          </Reveal>

          <Reveal delay={420}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--fg)',
            }}>
              <ul style={{
                listStyle: 'none', padding: 0, margin: 0,
                display: 'flex', flexDirection: 'column', gap: 22,
              }}>
                {[
                  { label: 'Persönlich, nicht generisch.', desc: 'Du redest mit Lena, nicht „mit der KI". Sie hat einen Namen, einen Tonfall, einen Stil — und du arbeitest mit ihr wie mit einer Top-Assistentin.' },
                  { label: 'Sie kennt dich.', desc: 'Customer-Memory von Tag 1. Sie weiß, dass Frau Hauser im Oktober nach dem Penthouse in Schwabing gefragt hat — und sagt es dir, bevor du durchstellst.' },
                  { label: 'Sie macht Schluss.', desc: 'Sie endet jede Mail mit konkretem Vorschlag, nicht mit „Was meinst du?". Sie schickt im Customer-Discord-Kanal nicht 50 Notifications am Tag, sondern eine 3-Punkt-Tages-Übersicht morgens um 7.' },
                  { label: 'Sie ist nicht ChatGPT.', desc: 'Eigener Hetzner-Server in Deutschland pro Customer. Mail-Triage läuft auf Claude Opus, Briefings auf Sonnet, Voice (optional) auf ElevenLabs — kein US-Cloud-Lock-in, kein Datenleak.' },
                ].map((row, i) => (
                  <li key={i}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(20px, 1.8vw, 24px)',
                      fontWeight: 400, lineHeight: 1.2,
                      color: 'var(--kz-ember-text)',
                      letterSpacing: '-0.01em',
                      marginBottom: 6,
                    }}>{row.label}</div>
                    <div style={{
                      fontSize: 15, lineHeight: 1.6,
                      color: 'var(--fg-muted)',
                      textWrap: 'pretty',
                    }}>{row.desc}</div>
                  </li>
                ))}
              </ul>

              <Reveal delay={780}>
                <div style={{ marginTop: 40, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <a href="/erstgespraech" style={ctaBtnStyle({ ember: true })}>
                    Erstgespräch buchen <Arrow />
                  </a>
                </div>
              </Reveal>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION 09 — Über mich (Bens Hero-Story)
// ============================================================
function UeberMichSection() {
  return (
    <section data-screen-label="09 Über mich" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '50%', right: '-4%',
        transform: 'translateY(-50%)',
        height: 'min(60vh, 480px)',
        opacity: 0.06,
        pointerEvents: 'none',
      }}>
        <img src="/animations/claude-design/logo-mark.png" alt=""
          style={{ height: '100%', width: 'auto', display: 'block' }} />
      </div>

      <div style={{
        maxWidth: 880, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
        position: 'relative', zIndex: 1,
      }}>
        <SectionEyebrow leaf={6} label="Über mich" />
        <RevealHeadline text="Hands-On-Bauer statt KI-Theoretiker." accent={[0, 1]} />

        <Reveal delay={200}>
          <div style={{
            marginTop: 48,
            display: 'flex', alignItems: 'center',
            gap: 'clamp(24px, 4vw, 40px)',
            flexWrap: 'wrap',
          }}>
            <img
              src="/images/ben-portrait.png"
              alt="Benjamin Zirngibl, Gründer k-AIzen"
              loading="lazy"
              style={{
                width: 'clamp(120px, 14vw, 180px)',
                height: 'clamp(120px, 14vw, 180px)',
                borderRadius: '50%', objectFit: 'cover',
                border: '4px solid var(--kz-cream)',
                boxShadow: '0 16px 32px -8px rgba(31,41,51,0.18)',
                flexShrink: 0,
              }} />
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 2vw, 26px)',
                lineHeight: 1.3, color: 'var(--fg)', margin: 0,
              }}>Benjamin Zirngibl</p>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 14,
                color: 'var(--fg-muted)', margin: '4px 0 0',
              }}>Gründer · <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--fg)' }}>k-<span style={{ color: 'var(--kz-ember-text)' }}>AI</span>zen</span> · Bayern</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div style={{ marginTop: 40 }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(16px, 1.4vw, 18px)',
              lineHeight: 1.65, color: 'var(--fg)',
              margin: '0 0 20px', textWrap: 'pretty',
            }}>
              Sieben Jahre bei SKIDATA in der Mobility-Branche. Quereinsteiger,
              kein klassischer IT-Background — den IT-Schwerpunkt habe ich erst
              kürzlich gefunden. Aber in der Mobility-Praxis lernt man zwei Dinge,
              die sich auf alles übertragen: Lösungen müssen am Montagmorgen
              funktionieren, nicht nur in der Demo. Und Übergabe an andere ist
              Pflicht, nicht Kür.
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(16px, 1.4vw, 18px)',
              lineHeight: 1.65, color: 'var(--fg)',
              margin: 0, textWrap: 'pretty',
            }}>
              Vor zwei Jahren habe ich entdeckt, dass dieselben Werkzeuge, mit denen
              ich anspruchsvolle Mobility-Software baue, in jedem Mittelständler
              dieselben Klick-Routinen wegautomatisieren können, die jeden Tag
              Stunden fressen. Heute baue ich genau das für dich — direkt,
              schnell, übergebbar.
            </p>
          </div>
        </Reveal>

        <Reveal delay={440}>
          <ul style={{
            marginTop: 40,
            listStyle: 'none', padding: 0,
            display: 'grid', gap: 14,
            fontFamily: 'var(--font-sans)', fontSize: 15,
            color: 'var(--fg)',
          }}>
            {[
              '7 Jahre Mobility-Praxis bei SKIDATA (Parkhaus-Systeme, sweb.Validate/Control) — IT-Schwerpunkt seit kurzem, mehrere praxisnahe Projekte fertig',
              'Eigener KI-Stack: n8n + Claude API + React/Supabase, gehostet auf Hetzner',
              'Gebaut: Personalplanungs-Tool, News-Digest, Email-Triage, Telefonagent (in Exploration)',
              'DSGVO-konforme Auftragsverarbeitung',
              'Vor Ort im Raum Süddeutschland · remote in ganz DACH',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--kz-ember-text)', fontWeight: 600, flexShrink: 0 }}>·</span>
                <span style={{ textWrap: 'pretty' }}>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={560}>
          <div style={{
            marginTop: 56, padding: '32px clamp(24px, 4vw, 40px)',
            background: 'var(--bg-alt)', borderRadius: 12,
            borderLeft: '3px solid var(--kz-ember)',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 2vw, 24px)',
              fontWeight: 400, lineHeight: 1.25,
              margin: '0 0 14px', letterSpacing: '-0.01em',
            }}>Ein Ansprechpartner. Ein Netzwerk dahinter.</h3>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15, lineHeight: 1.65,
              color: 'var(--fg-muted)',
              margin: '0 0 12px', textWrap: 'pretty',
            }}>
              Du sprichst immer mit einer Person: mir. Das bleibt so — auch wenn
              ein Projekt tiefer geht, als ein Kopf allein schultern kann.
              Für Spezialfragen ziehe ich punktuell Expertinnen und Experten aus
              einem kuratierten Netzwerk dazu.
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15, lineHeight: 1.65,
              color: 'var(--fg-muted)',
              margin: 0, textWrap: 'pretty',
            }}>
              Bei Krankheit oder Urlaub ist die Vertretung vorher benannt und wird
              dir spätestens bei Projektstart vorgestellt. Kein „wir melden uns
              demnächst wieder".
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// SECTION 10 — FAQ (9 Fragen)
// ============================================================
function FaqSection() {
  const fragen = [
    {
      q: 'Wie lange dauert ein Projekt?',
      a: 'Setup-Module 4–8 Wochen — vom Kick-off über Bau und Integration bis zur Übergabe inklusive Schulung der Key-User.',
    },
    {
      q: 'Wir haben keine IT-Leute. Ist das ein Problem?',
      a: 'Nein. Ich bringe die Technik, du bringst das Prozess-Wissen. Gemeinsam bauen wir eine Lösung, die deine bestehenden Mitarbeiter nutzen können — ohne dass du einen Entwickler einstellen musst.',
    },
    {
      q: 'Was passiert mit unseren Daten?',
      a: 'Sie bleiben auf einem dedizierten Server in Deutschland — oder direkt bei dir auf eigener Infrastruktur (On-Prem-Option). Vor Projektstart schließen wir eine Auftragsverarbeitung nach DSGVO ab. Bei Kündigung gehören dir alle Daten, alle Workflows, der Code.',
    },
    {
      q: 'Was kostet es wirklich?',
      a: 'Dein KI-PA startet bei 1.490 €/Monat. Module buchst du nach Bedarf dazu — Telefon-Empfang +799 €, Social +499 €, Lead-Pipeline +399 €, Beleg & Steuer +289 €, Recruiting +189 €/Monat. Das Setup besprechen wir im Erstgespräch. Festpreise, keine versteckten Nachträge.',
    },
    {
      q: 'Macht ihr auch nur Workshops?',
      a: 'Nein. Workshops ohne anschließende Umsetzung sind nicht mein Angebot. Wenn du reinen Kurs-Charakter suchst, gibt es günstigere Anbieter. Ich liefere Lösungen, die nach dem Projekt laufen.',
    },
    {
      q: 'Wie viele Projekte gleichzeitig?',
      a: 'Üblicherweise 2–3. Bewusst — ich betreue jeden Kunden persönlich, kein Account-Manager-Modell. Lieber weniger Projekte und dafür verlässlich geliefert.',
    },
    {
      q: 'Was, wenn im Betrieb später ein Problem auftritt?',
      a: 'Laufender Betrieb, Anpassungen und Bug-Fixes sind im monatlichen KI-PA ab 1.490 €/Monat schon enthalten — kein Extra-Retainer. SLA < 24h Werktags.',
    },
    {
      q: 'Brauchen wir einen eigenen KI-Spezialisten?',
      a: 'Nein. Ziel ist, dass deine bestehenden Mitarbeiter die Lösung selbständig nutzen können. Schulung der Key-User ist im Setup-Paket inklusive.',
    },
    {
      q: 'Bist du Einzelkämpfer? Was, wenn du ausfällst?',
      a: 'Ich bin persönlich dein Ansprechpartner und arbeite als Boutique. Dahinter steht ein kuratiertes Netzwerk aus Spezialisten — Computer Vision, regulierte Branchen, juristische Fragen — auf das ich punktuell zugreifen kann. Bei Ausfall (Krankheit, Urlaub) bin ich erreichbar, oder es übernimmt eine vorher benannte Vertretung.',
    },
  ];
  return (
    <section data-screen-label="10 FAQ" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
    }}>
      <div style={{
        maxWidth: 880, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow leaf={0} label="Häufige Fragen" />
        <RevealHeadline text="Was Inhaber vor dem Erstgespräch wissen wollen." accent={[5, 6]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 640, marginTop: 32, marginBottom: 56,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Die Fragen, die im ersten Gespräch am häufigsten kommen.
            Wenn deine Frage nicht dabei ist — schreib mir direkt auf WhatsApp
            oder per Mail.
          </p>
        </Reveal>

        <div>
          {fragen.map((f, i) => (
            <Reveal key={i} delay={120 + i * 40}>
              <details style={{
                borderTop: i === 0 ? '1px solid var(--kz-border)' : 'none',
                borderBottom: '1px solid var(--kz-border)',
                padding: '24px 0',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(18px, 1.8vw, 22px)',
                  fontWeight: 400, lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                  listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', gap: 16,
                }}>
                  <span>{f.q}</span>
                  <span style={{
                    color: 'var(--kz-ember-text)', fontSize: 14,
                    fontFamily: 'var(--font-sans)', flexShrink: 0,
                  }}>+</span>
                </summary>
                <p style={{
                  marginTop: 14,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15, lineHeight: 1.65,
                  color: 'var(--fg-muted)', textWrap: 'pretty',
                }}>{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SECTION 11 — Kontakt (3 Wege)
// ============================================================
function KontaktSection() {
  const whatsappLink = 'https://wa.me/4915901031928?text=' + encodeURIComponent('Hi Ben, ich habe Interesse an k-AIzen.');
  return (
    <section data-screen-label="11 Kontakt" id="kontakt" style={{
      position: 'relative',
      padding: 'clamp(100px, 16vh, 200px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow leaf={2} label="Kontakt" />
        <RevealHeadline text="Erstgespräch. 30 Minuten. Gratis." accent={[2]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 640, marginTop: 32, marginBottom: 64,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Drei Wege, mich zu erreichen. Alle führen direkt zu mir — kein Callcenter,
            kein Sales-Team, keine Wartezeit über 24 Stunden.
          </p>
        </Reveal>

        <div className="kz-section-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'clamp(20px, 2.5vw, 28px)',
        }}>
          <Reveal delay={200}>
            <div style={kontaktKarte()}>
              <KzLeaf index={4} size={44} style={{ marginBottom: 16 }} />
              <h3 style={kontaktH3()}>Erstgespräch</h3>
              <p style={kontaktDesc()}>
                30 Minuten, gratis, per Video oder Telefon. Wir klären, ob wir
                zusammenpassen und wo der größte Hebel in deinem Betrieb liegt.
              </p>
              <a href="/erstgespraech" style={ctaBtnStyle()}>
                Termin vorschlagen <Arrow />
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div style={kontaktKarte()}>
              <KzLeaf index={5} size={44} style={{ marginBottom: 16 }} />
              <h3 style={kontaktH3()}>WhatsApp</h3>
              <p style={kontaktDesc()}>
                Schnelle Frage zwischendurch? Schreib mir direkt.
                Antwort werktags innerhalb eines Arbeitstages.
              </p>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                 style={ctaBtnStyle({ ember: true })}>
                Chat starten <Arrow />
              </a>
            </div>
          </Reveal>

          <Reveal delay={440}>
            <div style={kontaktKarte()}>
              <KzLeaf index={6} size={44} style={{ marginBottom: 16 }} />
              <h3 style={kontaktH3()}>Mail / Formular</h3>
              <p style={kontaktDesc()}>
                Für ausführliche Anfragen. Du beschreibst deine Situation,
                ich melde mich per Mail mit einer ersten Einschätzung.
              </p>
              <a href="/kontakt" style={ctaBtnStyle()}>
                Zum Formular <Arrow />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={560}>
          <p style={{
            marginTop: 56, textAlign: 'center',
            fontFamily: 'var(--font-sans)', fontSize: 14,
            color: 'var(--fg-muted)',
          }}>
            Oder direkt: <a href="mailto:kontakt@k-aizen.de" style={{ color: 'var(--kz-ember-text)' }}>kontakt@k-aizen.de</a>
            {' · '}
            <a href="https://www.linkedin.com/in/benjamin-zirngibl-0963753ab"
               target="_blank" rel="noopener noreferrer"
               style={{ color: 'var(--kz-ember-text)' }}>LinkedIn</a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
function kontaktKarte() {
  return {
    padding: '36px 30px',
    background: 'var(--bg-alt)',
    borderRadius: 12,
    height: '100%',
    display: 'flex', flexDirection: 'column',
  };
}
function kontaktH3() {
  return {
    fontFamily: 'var(--font-display)',
    fontSize: 26, fontWeight: 400, lineHeight: 1.15,
    margin: '0 0 14px', letterSpacing: '-0.01em',
  };
}
function kontaktDesc() {
  return {
    fontFamily: 'var(--font-sans)',
    fontSize: 15, lineHeight: 1.6,
    color: 'var(--fg-muted)',
    margin: '0 0 24px', flex: 1, textWrap: 'pretty',
  };
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer style={{
      background: 'var(--kz-charcoal)',
      color: 'var(--kz-cream)',
      padding: 'clamp(60px, 8vh, 100px) 0 40px',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)',
        gap: 'clamp(28px, 5vw, 60px)',
      }}>
        <div>
          <div style={{ marginBottom: 22 }}>
            <img src="/animations/claude-design/logo-full.png" alt="k-AIzen"
              style={{ height: 52, width: 'auto', display: 'block',
                       filter: 'invert(1) brightness(1.05)' }} />
          </div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22, fontStyle: 'italic',
            lineHeight: 1.3, color: 'rgba(245,240,232,0.7)',
            maxWidth: 320, margin: 0,
          }}>
            Jeden Tag 1% besser.<br/>Mit KI.
          </p>
        </div>
        <FooterCol title="Angebot" items={[
          { label: 'Preise & Module', href: '#preis' },
          { label: 'Erstgespräch buchen', href: '/erstgespraech' },
        ]} />
        <FooterCol title="Kontakt" items={[
          { label: 'kontakt@k-aizen.de', href: 'mailto:kontakt@k-aizen.de' },
          { label: 'WhatsApp', href: 'https://wa.me/4915901031928' },
          { label: 'LinkedIn', href: 'https://www.linkedin.com/in/benjamin-zirngibl-0963753ab' },
          { label: 'Impressum', href: '/impressum' },
          { label: 'Datenschutz', href: '/datenschutz' },
          { label: 'AGB', href: '/agb' },
        ]} />
      </div>
      <div style={{
        maxWidth: 1120, margin: '60px auto 0',
        padding: '24px clamp(24px, 5vw, 64px) 0',
        borderTop: '1px solid rgba(245,240,232,0.12)',
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-sans)', fontSize: 13,
        color: 'rgba(245,240,232,0.5)',
        flexWrap: 'wrap', gap: 12,
      }}>
        <span>© 2026 Benjamin Zirngibl · k-AIzen · Bayern</span>
        <span>Made in Germany · Hosted in Germany</span>
      </div>
    </footer>
  );
}
function FooterCol({ title, items }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.18em',
        color: 'rgba(245,240,232,0.5)', marginBottom: 18,
      }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {items.map((it, i) => (
          <li key={i}>
            <a href={it.href} style={{
              fontFamily: 'var(--font-sans)', fontSize: 15,
              color: 'var(--kz-cream)', textDecoration: 'none',
              opacity: 0.85,
            }}>{it.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// expose to hero.jsx
Object.assign(window, {
  KzManifest: ManifestSection,
  KzAndererWeg: AndererWegSection,
  KzEinTagMitLena: EinTagMitLenaSection,
  KzAngebot: AngebotSection,
  KzMethodik: MethodikSection,
  KzVertrauen: VertrauenSection,
  KzMeetLena: MeetLenaSection,
  KzUeberMich: UeberMichSection,
  KzFaq: FaqSection,
  KzKontakt: KontaktSection,
  KzFooter: Footer,
  KzCrane: Crane,
  KzScrollProgress: ScrollProgress,
  KzSectionDivider: SectionDivider,
  KzLogoMark: LogoMark,
  KzLogoFull: LogoFull,
  KzUseScrollY: useScrollY,
  KzUseScrollDir: useScrollDirection,
});
