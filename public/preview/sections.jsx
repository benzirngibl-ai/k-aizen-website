/* ============================================================
   k-AIzen — Sections (scroll narrative)
   ------------------------------------------------------------
   Sections compose the post-hero story. Each is a wrapper +
   reveal-on-enter using IntersectionObserver and a long premium
   easing. The crane flies across the page on scroll progress.
   ============================================================ */

/* depends on hero.jsx loading first (uses the global React refs) */

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
  const [dir, setDir] = React.useState('up'); // 'up' | 'down'
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

// IntersectionObserver-based reveal — returns ref + visible state.
function useReveal(opts = {}) {
  const { threshold = 0.18, rootMargin = '0px 0px -10% 0px', once = true } = opts;
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

// Reveal wrapper: fades + lifts + lets you stagger children via delay.
function Reveal({ children, delay = 0, y = 28, duration = 1100, as: Tag = 'div', style, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate3d(0,0,0)' : `translate3d(0, ${y}px, 0)`,
      transition: `opacity ${duration}ms ${KZ_EASE} ${delay}ms, transform ${duration}ms ${KZ_EASE} ${delay}ms`,
      willChange: 'opacity, transform',
      ...style,
    }} {...rest}>
      {children}
    </Tag>
  );
}

// Word-by-word reveal for big headlines.
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
        }}>
          <span style={{
            display: 'inline-block',
            transform: visible ? 'translateY(0)' : 'translateY(110%)',
            opacity: visible ? 1 : 0,
            transition: `transform 1100ms ${KZ_EASE} ${delay + i * 70}ms, opacity 800ms ${KZ_EASE} ${delay + i * 70}ms`,
            color: accent && accent.includes(i) ? 'var(--kz-ember)' : 'inherit',
            willChange: 'transform, opacity',
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
      // path: enters from far-left at p=0.05, traverses with gentle arc, exits right
      const startP = 0.04;
      const endP = 0.92;
      const t = Math.max(0, Math.min(1, (p - startP) / (endP - startP)));
      const x = -20 + t * 130; // -20vw → 110vw
      // arc up then down
      const yArc = -Math.sin(t * Math.PI) * 18;        // peak around middle
      const yBase = 8 + t * 6;                          // drift down a bit
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

// ---------- Section: Manifesto with plum tree ----------
function ManifestoSection() {
  return (
    <section data-screen-label="02 Manifest" style={{
      position: 'relative',
      minHeight: '110vh',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      overflow: 'hidden',
    }}>
      {/* plum tree right */}
      <Reveal duration={1600} y={40} style={{
        position: 'absolute',
        right: '-4%', bottom: '-2%',
        width: 'min(46vw, 560px)',
        opacity: 0.92,
        pointerEvents: 'none',
      }}>
        <img src="/animations/claude-design/sumi-plum-tree.png" alt=""
          style={{ width: '100%', display: 'block', filter: 'saturate(0.92)' }} />
      </Reveal>

      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.55fr)',
        gap: 'clamp(32px, 6vw, 80px)',
        alignItems: 'start',
      }}>
        <div>
          <Reveal>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.18em',
              color: 'var(--fg-muted)', marginBottom: 24,
            }}>
              <span className="kz-kanji" style={{ marginRight: 10, color: 'var(--kz-ember)' }}>禅</span>
              Manifest
            </div>
          </Reveal>

          <RevealHeadline
            text="Wir machen einen Schritt nach dem anderen."
            accent={[3]} />

          <Reveal delay={320}>
            <p style={{
              maxWidth: 560, marginTop: 36,
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(17px, 1.5vw, 20px)',
              lineHeight: 1.6,
              color: 'var(--fg)',
              textWrap: 'pretty',
            }}>
              KI ist kein Wundermittel. Sie ist ein Werkzeug —
              wertvoll, wenn sie an der richtigen Stelle eingesetzt wird.
              Wir hören zu. Wir verstehen, wo Zeit verloren geht.
              Dann automatisieren wir genau diesen einen Prozess.
              <span className="kz-pause"></span>
              Wenn er läuft, kommt der nächste.
            </p>
          </Reveal>

          <Reveal delay={520} style={{ marginTop: 56 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(20px, 3vw, 40px)' }}>
              {[
                { k: '12', l: 'Workflows live' },
                { k: '~38h', l: 'gespart pro Monat' },
                { k: 'KMU', l: 'Mittelstand-Fokus' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(36px, 4vw, 56px)',
                    color: 'var(--fg)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>{s.k}</div>
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.14em',
                    color: 'var(--fg-muted)', marginTop: 10,
                  }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------- Section: Workflows with bamboo accent ----------
function WorkflowsSection() {
  const items = [
    { kanji: '一', title: 'Inbox-Triage', desc: 'Anfragen werden klassifiziert, kategorisiert, priorisiert. Antworten vorgeschlagen — nicht versendet.' },
    { kanji: '二', title: 'Angebots-Generator', desc: 'Aus drei Stichworten ein vollständiges, individualisiertes Angebot. Du prüfst, signierst, sendest.' },
    { kanji: '三', title: 'Tagesreport', desc: 'Jeden Morgen 7:30. Zahlen, Auffälligkeiten, To-dos. Gelesen in zwei Minuten.' },
    { kanji: '四', title: 'Wissens-Suche', desc: 'Eigene Dokumente, Mails, Tickets — eine Suche, eine Antwort. Mit Quellen.' },
  ];
  return (
    <section data-screen-label="03 Workflows" style={{
      position: 'relative',
      minHeight: '120vh',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--kz-cream-deep)',
      overflow: 'hidden',
    }}>
      {/* bamboo left */}
      <Reveal duration={1600} y={40} style={{
        position: 'absolute',
        left: '-2%', top: '8%',
        width: 'min(28vw, 360px)',
        opacity: 0.85,
        pointerEvents: 'none',
      }}>
        <img src="/animations/claude-design/sumi-bamboo-full.png" alt=""
          style={{ width: '100%', display: 'block', filter: 'saturate(0.92)' }} />
      </Reveal>

      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
        position: 'relative',
      }}>
        <Reveal>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: 'var(--fg-muted)', marginBottom: 24,
            textAlign: 'right',
          }}>
            Workflows
            <span className="kz-kanji" style={{ marginLeft: 10, color: 'var(--kz-ember)' }}>流</span>
          </div>
        </Reveal>

        <div style={{ textAlign: 'right' }}>
          <RevealHeadline text="Vier Prozesse. Sofort einsatzbereit."
            accent={[2]} />
        </div>

        <Reveal delay={300} style={{ marginTop: 80 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 1,
            background: 'var(--kz-border)',
            border: '1px solid var(--kz-border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {items.map((it, i) => (
              <WorkflowCard key={i} {...it} index={i} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WorkflowCard({ kanji, title, desc, index }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--kz-charcoal)' : 'var(--kz-card)',
        color: hover ? 'var(--kz-cream)' : 'var(--fg)',
        padding: '40px 36px 44px',
        minHeight: 280,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: `background 520ms ${KZ_EASE}, color 520ms ${KZ_EASE}`,
        cursor: 'pointer',
        position: 'relative',
      }}>
      <div style={{
        fontFamily: 'var(--font-jp)',
        fontSize: 56, lineHeight: 1,
        color: hover ? 'var(--kz-ember)' : 'var(--kz-charcoal)',
        opacity: hover ? 1 : 0.18,
        transition: `opacity 420ms ${KZ_EASE}, color 420ms ${KZ_EASE}`,
      }}>{kanji}</div>
      <div>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 24, lineHeight: 1.1,
          margin: '0 0 12px',
          letterSpacing: '-0.01em',
        }}>{title}</h3>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 15, lineHeight: 1.55,
          color: hover ? 'rgba(245,240,232,0.78)' : 'var(--fg-muted)',
          margin: 0, textWrap: 'pretty',
        }}>{desc}</p>
      </div>
      <div style={{
        position: 'absolute',
        right: 28, bottom: 28,
        opacity: hover ? 1 : 0,
        transform: hover ? 'translateX(0)' : 'translateX(-8px)',
        transition: `opacity 320ms ${KZ_EASE}, transform 420ms ${KZ_EASE}`,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

// ---------- Section: CTA ----------
function CtaSection() {
  return (
    <section data-screen-label="04 Erstgespräch" style={{
      position: 'relative',
      minHeight: '90vh',
      padding: 'clamp(100px, 16vh, 200px) 0 clamp(80px, 14vh, 160px)',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 760, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
        textAlign: 'center',
        position: 'relative',
      }}>
        <Reveal>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: 'var(--fg-muted)', marginBottom: 28,
          }}>
            <span className="kz-kanji" style={{ marginRight: 10, color: 'var(--kz-ember)' }}>始</span>
            Anfangen
          </div>
        </Reveal>

        <RevealHeadline text="Erstgespräch. 30 Minuten. Ohne Verkaufsdruck."
          accent={[1]} />

        <Reveal delay={340}>
          <p style={{
            maxWidth: 540, margin: '32px auto 0',
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(16px, 1.4vw, 19px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Du erzählst, wo Zeit verloren geht. Wir hören zu.
            Am Ende weisst Du, ob ein Workflow Sinn macht — oder eben nicht.
          </p>
        </Reveal>

        <Reveal delay={560} style={{ marginTop: 48 }}>
          <a href="#" style={{
            fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
            padding: '18px 32px',
            background: 'var(--kz-charcoal)', color: 'var(--kz-cream)',
            borderRadius: 10, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 12,
            boxShadow: '0 18px 40px -8px rgba(31,41,51,0.16), 0 6px 14px rgba(31,41,51,0.08)',
          }}>
            Termin vorschlagen
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Footer ----------
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <img src="/animations/claude-design/logo-mark.png" alt="" style={{ width: 28, height: 28, filter: 'invert(1) brightness(1.2)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em' }}>
              k-AI<span style={{ color: 'var(--kz-ember)' }}>·</span>zen
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20, fontStyle: 'italic',
            lineHeight: 1.3, color: 'rgba(245,240,232,0.7)',
            maxWidth: 320, margin: 0,
          }}>
            Eins nach dem anderen.<br/>Auch bei AI.
          </p>
        </div>
        <FooterCol title="Workflows" items={['Inbox-Triage', 'Angebote', 'Tagesreport', 'Wissens-Suche']} />
        <FooterCol title="Kontakt" items={['hallo@k-aizen.de', 'LinkedIn', 'Impressum', 'Datenschutz']} />
      </div>
      <div style={{
        maxWidth: 1120, margin: '60px auto 0',
        padding: '24px clamp(24px, 5vw, 64px) 0',
        borderTop: '1px solid rgba(245,240,232,0.12)',
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-sans)', fontSize: 13,
        color: 'rgba(245,240,232,0.5)',
      }}>
        <span>© 2026 k-AIzen GmbH</span>
        <span>München <span className="kz-pause"></span> Tokio</span>
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
            <a href="#" style={{
              fontFamily: 'var(--font-sans)', fontSize: 15,
              color: 'var(--kz-cream)', textDecoration: 'none',
              opacity: 0.85,
            }}>{it}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Scroll progress bar (1px ember line at top) ----------
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

// expose to hero.jsx
Object.assign(window, {
  KzManifesto: ManifestoSection,
  KzWorkflows: WorkflowsSection,
  KzCta: CtaSection,
  KzFooter: Footer,
  KzCrane: Crane,
  KzScrollProgress: ScrollProgress,
  KzUseScrollY: useScrollY,
  KzUseScrollDir: useScrollDirection,
});
