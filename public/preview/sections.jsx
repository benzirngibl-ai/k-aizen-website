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
// once=false (default) → re-triggers beim erneuten In-View, nicht nur einmalig.
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
      {/* cherry tree right */}
      <Reveal duration={1600} y={40} style={{
        position: 'absolute',
        right: '-4%', bottom: '-2%',
        width: 'min(46vw, 560px)',
        opacity: 0.92,
        pointerEvents: 'none',
      }}>
        <img src="/animations/claude-design/sumi-cherry-tree.png" alt=""
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
              display: 'flex', alignItems: 'center', gap: 14,
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.18em',
              color: 'var(--fg-muted)', marginBottom: 24,
            }}>
              <LogoMark size={28} opacity={0.75} />
              <span className="kz-kanji" style={{ color: 'var(--kz-ember)' }}>禅</span>
              <span>Manifest</span>
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
            display: 'inline-flex', alignItems: 'center', gap: 14,
            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: 'var(--fg-muted)', marginBottom: 28,
          }}>
            <LogoMark size={32} opacity={0.8} />
            <span className="kz-kanji" style={{ color: 'var(--kz-ember)' }}>始</span>
            <span>Anfangen</span>
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

// ---------- Reusable: LogoMark (size = height, width auto-scales mit Aspect ~0.56) ----------
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

// ---------- Reusable: LogoFull (Wordmark mit Schrift, für Footer / prominente Stellen) ----------
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

// ---------- Reusable: Section-Divider mit Logo + Brush-Stroke ----------
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

// ---------- Section: Process — Vier Schritte. Im Kreis. ----------
function ProcessSection() {
  const steps = [
    {
      num: '一', title: 'Beobachten', dur: '2 Wochen',
      desc: 'Wir schauen zu. Nicht das Tools-Inventar, der echte Tagesablauf. Was wiederholt sich? Was ärgert? Was wird vergessen?',
    },
    {
      num: '二', title: 'Verstehen', dur: '3 Tage',
      desc: 'Aus fünfzig Beobachtungen pickt man eine. Den einen Schritt, der am meisten weh tut, am häufigsten passiert, am klarsten zu beschreiben ist. Nur den.',
    },
    {
      num: '三', title: 'Eines ändern', dur: '1–2 Wochen',
      desc: 'Wir bauen die kleinste mögliche Automation für genau diesen Schritt. Ein Skript. Ein Cron. Ein Output. Live in Tagen, nicht Quartalen.',
    },
    {
      num: '四', title: 'Wieder beobachten', dur: '4 Wochen',
      desc: 'Was läuft, läuft. Was bricht, dokumentieren wir. Was du besser verstehst, fließt in Schritt 1 vom nächsten Loop.',
    },
  ];
  return (
    <section data-screen-label="03 Prozess" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--kz-cream)',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 980, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <Reveal>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: 'var(--fg-muted)', marginBottom: 24,
          }}>
            <LogoMark size={28} opacity={0.75} />
            <span className="kz-kanji" style={{ color: 'var(--kz-ember)' }}>改善</span>
            <span>So arbeiten wir</span>
          </div>
        </Reveal>

        <RevealHeadline text="Vier Schritte. Im Kreis." accent={[2]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 600, marginTop: 32, marginBottom: 80,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Kaizen ist kein einmaliges Setup-Projekt. Es ist ein Loop.
            Wir gehen ihn mit dir, immer wieder, bis ihr ihn selbst geht.
          </p>
        </Reveal>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative' }}>
          {/* Vertical brush-line connector */}
          <div style={{
            position: 'absolute',
            left: 24, top: 36, bottom: 36,
            width: 1,
            background: 'linear-gradient(to bottom, transparent, var(--kz-border) 8%, var(--kz-border) 92%, transparent)',
            opacity: 0.7,
          }} />

          {steps.map((s, i) => (
            <Reveal key={i} delay={200 + i * 120} as="li" style={{
              position: 'relative',
              padding: '32px 0 32px 80px',
              borderBottom: i < steps.length - 1 ? '1px solid var(--kz-border)' : 'none',
            }}>
              {/* Kanji-Marker */}
              <div style={{
                position: 'absolute', left: 0, top: 32,
                width: 48, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--kz-cream)',
                border: '1.5px solid var(--kz-border)',
                borderRadius: '50%',
                fontFamily: 'var(--font-jp)',
                fontSize: 22, fontWeight: 600,
                color: 'var(--fg)',
              }}>
                {s.num}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'baseline' }}>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(26px, 3vw, 36px)',
                    fontWeight: 400, lineHeight: 1.1,
                    margin: '0 0 12px',
                    letterSpacing: '-0.01em',
                  }}>{s.title}</h3>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(15px, 1.2vw, 17px)',
                    lineHeight: 1.6, color: 'var(--fg-muted)',
                    margin: 0, maxWidth: 560,
                    textWrap: 'pretty',
                  }}>{s.desc}</p>
                </div>
                <div style={{
                  fontFamily: 'var(--font-brush)',
                  fontSize: 'clamp(22px, 2vw, 28px)',
                  color: 'var(--kz-ember)',
                  whiteSpace: 'nowrap',
                  alignSelf: 'center',
                }}>{s.dur}</div>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={300} style={{ marginTop: 64, textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(20px, 2vw, 24px)',
            color: 'var(--fg-muted)',
            margin: 0,
          }}>
            Dann beginnt der nächste Schritt.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Section: Quote — Big Bored-Monk-Wisdom ----------
function QuoteSection() {
  const [ref, visible] = useReveal({ threshold: 0.4 });
  return (
    <section data-screen-label="05 Maxime" style={{
      position: 'relative',
      padding: 'clamp(100px, 16vh, 200px) 0 clamp(100px, 16vh, 200px)',
      background: 'var(--kz-cream-deep)',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      <div ref={ref} style={{
        maxWidth: 980, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <div style={{
          marginBottom: 36,
          opacity: visible ? 0.6 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 1000ms ${KZ_EASE}, transform 1000ms ${KZ_EASE}`,
        }}>
          <LogoMark size={64} />
        </div>

        <blockquote style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 5.5vw, 72px)',
          fontStyle: 'italic',
          fontWeight: 400, lineHeight: 1.15,
          letterSpacing: '-0.015em',
          color: 'var(--fg)',
          margin: 0,
          textWrap: 'balance',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity 1400ms ${KZ_EASE} 200ms, transform 1400ms ${KZ_EASE} 200ms`,
        }}>
          „Setz dich hin. Atme. Hier ist der echte Workflow."
        </blockquote>

        <p style={{
          fontFamily: 'var(--font-brush)',
          fontSize: 'clamp(22px, 2vw, 28px)',
          color: 'var(--fg-muted)',
          marginTop: 36,
          opacity: visible ? 0.85 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 1400ms ${KZ_EASE} 600ms, transform 1400ms ${KZ_EASE} 600ms`,
        }}>
          — k-AIzen Maxime
        </p>
      </div>
    </section>
  );
}

// ---------- Section: Trust — Was uns unterscheidet ----------
function TrustSection() {
  const pillars = [
    {
      kanji: '近', title: 'Lokal & persönlich',
      desc: 'Du sprichst mit dem, der baut. Kein Tier-3-Support, kein Account-Manager-Karussell. Bayern, deutsche Stunden, deutscher Vertrag.',
    },
    {
      kanji: '法', title: 'Compliance-aware',
      desc: 'DSGVO, Auftragsverarbeitungsverträge, EU-AI-Act sind keine Tabu-Themen. Wir bauen mit deinem Datenschutzbeauftragten am Tisch.',
    },
    {
      kanji: '実', title: 'Ehrlich rechnen',
      desc: 'Wir berechnen den Stundenwert jedes Workflows bevor wir bauen. Wenn die Mathematik nicht aufgeht, bauen wir nicht.',
    },
  ];
  return (
    <section data-screen-label="06 Vertrauen" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--kz-cream)',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <Reveal>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: 'var(--fg-muted)', marginBottom: 24,
          }}>
            <LogoMark size={28} opacity={0.75} />
            <span className="kz-kanji" style={{ color: 'var(--kz-ember)' }}>信</span>
            <span>Vertrauen</span>
          </div>
        </Reveal>

        <RevealHeadline text="Was uns von der Hype-Industrie unterscheidet." accent={[3]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 640, marginTop: 32, marginBottom: 80,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Drei Dinge, die wir anders machen als die meisten AI-Agencies.
            Es sind nicht die spektakulärsten — aber die wichtigsten für dich.
          </p>
        </Reveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(24px, 3vw, 48px)',
        }}>
          {pillars.map((p, i) => (
            <Reveal key={i} delay={200 + i * 120}>
              <div style={{
                fontFamily: 'var(--font-jp)',
                fontSize: 56, lineHeight: 1,
                color: 'var(--kz-ember)',
                opacity: 0.85,
                marginBottom: 20,
              }}>{p.kanji}</div>
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
                margin: 0,
                textWrap: 'pretty',
              }}>{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Section: About — Hinter k-AIzen ----------
function AboutSection() {
  return (
    <section data-screen-label="07 Hinter" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--kz-cream-deep)',
      overflow: 'hidden',
    }}>
      {/* Logo-Watermark im Hintergrund */}
      <div style={{
        position: 'absolute',
        top: '50%', right: '-4%',
        transform: 'translateY(-50%)',
        height: 'min(70vh, 560px)',
        opacity: 0.07,
        pointerEvents: 'none',
      }}>
        <img src="/animations/claude-design/logo-mark.png" alt=""
          style={{ height: '100%', width: 'auto', display: 'block' }} />
      </div>

      <div style={{
        maxWidth: 880, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
        position: 'relative',
        zIndex: 1,
      }}>
        <Reveal>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            color: 'var(--fg-muted)', marginBottom: 24,
          }}>
            <LogoMark size={28} opacity={0.75} />
            <span className="kz-kanji" style={{ color: 'var(--kz-ember)' }}>人</span>
            <span>Wer dahinter steht</span>
          </div>
        </Reveal>

        <RevealHeadline text="Hinter k-AIzen." accent={[1]} />

        <Reveal delay={280}>
          <div style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(24px, 4vw, 56px)',
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(16px, 1.4vw, 18px)',
              lineHeight: 1.65, color: 'var(--fg)',
              margin: 0, textWrap: 'pretty',
            }}>
              Mein Name ist Benjamin Zirngibl. Ich bin Pulscraft Digital —
              eine kleine Firma in Bayern, die KMUs hilft, mit AI zu arbeiten
              ohne Hype und ohne Buzzword-Bingo.
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(16px, 1.4vw, 18px)',
              lineHeight: 1.65, color: 'var(--fg)',
              margin: 0, textWrap: 'pretty',
            }}>
              k-AIzen ist das fokussierte Outlet — nur Workflow-Automation,
              keine Web-Designs, keine Side-Quests. Was funktioniert, bleibt.
              Was nicht funktioniert, fliegt raus.
            </p>
          </div>
        </Reveal>

        <Reveal delay={500}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(22px, 2.4vw, 30px)',
            lineHeight: 1.3, color: 'var(--fg-muted)',
            marginTop: 48,
            maxWidth: 640,
            textWrap: 'pretty',
          }}>
            Wenn du wissen willst wie wir bauen — scroll wieder hoch.
            Da steht alles.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// expose to hero.jsx
Object.assign(window, {
  KzManifesto: ManifestoSection,
  KzProcess: ProcessSection,
  KzWorkflows: WorkflowsSection,
  KzQuote: QuoteSection,
  KzTrust: TrustSection,
  KzAbout: AboutSection,
  KzCta: CtaSection,
  KzFooter: Footer,
  KzCrane: Crane,
  KzScrollProgress: ScrollProgress,
  KzSectionDivider: SectionDivider,
  KzLogoMark: LogoMark,
  KzLogoFull: LogoFull,
  KzUseScrollY: useScrollY,
  KzUseScrollDir: useScrollDirection,
});
