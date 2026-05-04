/* ============================================================
   k-AIzen — Sections (scroll narrative)
   ------------------------------------------------------------
   11 Sektionen nach k-AIzen Content-Blueprint:
   1. Hero (in hero.jsx)
   2. Manifest (3 Prinzipien)
   3. Problem (4 Fallstricke)
   4. Anderer Weg (Anti-Personae)
   5. Angebot (Audit / Setup / Retainer)
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

// ---------- Reusable: SectionEyebrow ----------
function SectionEyebrow({ kanji, label, align = 'left' }) {
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
        <span className="kz-kanji" style={{ color: 'var(--kz-ember)' }}>{kanji}</span>
        <span>{label}</span>
      </div>
    </Reveal>
  );
}

// ============================================================
// SECTION 02 — Manifest (3 Prinzipien)
// ============================================================
function ManifestSection() {
  const principles = [
    {
      kanji: '価', title: 'Preise offen statt „auf Anfrage"',
      desc: 'Jeder Festpreis steht auf dieser Seite. Keine Stundenfallen, keine Geheim-Angebote, kein „das müssen wir uns mal anschauen".',
    },
    {
      kanji: '流', title: 'Übergebbar statt Vertrags-Knebel',
      desc: 'Dein Server, deine Workflows, dein Code. Bei Kündigung gehört dir alles. Übergabe in fünf Werktagen, dokumentiert, jederzeit.',
    },
    {
      kanji: '実', title: 'Liefern statt Workshops',
      desc: 'Ich rede nicht über KI-Strategien. Ich baue Tools, die nach dem Projekt laufen. Erfolg messen wir in Stunden, die dein Team zurück hat.',
    },
  ];
  return (
    <section data-screen-label="02 Manifest" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      overflow: 'hidden',
    }}>
      <Reveal duration={1600} y={40} style={{
        position: 'absolute',
        right: '-4%', bottom: '-2%',
        width: 'min(40vw, 480px)',
        opacity: 0.85,
        pointerEvents: 'none',
      }}>
        <img src="/animations/claude-design/sumi-cherry-tree.png" alt=""
          style={{ width: '100%', display: 'block', filter: 'saturate(0.92)' }} />
      </Reveal>

      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
        position: 'relative',
      }}>
        <SectionEyebrow kanji="禅" label="Manifest" />
        <RevealHeadline text="Drei Prinzipien. Keine Ausnahmen." accent={[1]} />

        <Reveal delay={300} style={{ marginTop: 64 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'clamp(20px, 2.5vw, 32px)',
          }}>
            {principles.map((p, i) => (
              <Reveal key={i} delay={200 + i * 120}>
                <div style={{
                  padding: '36px 32px',
                  background: 'var(--kz-cream-deep)',
                  borderRadius: 12,
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-jp)',
                    fontSize: 48, lineHeight: 1,
                    color: 'var(--kz-ember)', opacity: 0.85,
                    marginBottom: 18,
                  }}>{p.kanji}</div>
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
// SECTION 03 — Problem (4 Fallstricke)
// ============================================================
function ProblemSection() {
  const fallstricke = [
    {
      num: '01', title: 'ChatGPT in der Mittagspause',
      desc: 'Dein Team spielt mit KI in der Mittagspause. Aber niemand weiß, welche Prozesse wirklich davon profitieren — und welche nicht. Am Ende machen drei Leute irgendwas mit KI, ohne Plan, ohne Messung.',
    },
    {
      num: '02', title: 'Der Workshop-Verkäufer',
      desc: 'Drei Marketing-Agenturen haben dir einen ChatGPT-Workshop angeboten. Eine nennt sich plötzlich „KI-Agentur". Was fehlt: jemand, der nach dem Workshop noch da ist und die Lösung baut — nicht jemand, der dir ein Slide-Deck verkauft.',
    },
    {
      num: '03', title: 'Konzern-Beratung mit Junior-Team',
      desc: 'Die großen Häuser kosten ab 80.000 € und schicken drei Junior-Berater, die deinen Betrieb erst kennenlernen müssen. Für ein KMU mit 25 Leuten wirtschaftlich nicht darstellbar — und auch nicht nötig.',
    },
    {
      num: '04', title: 'DSGVO-Panik',
      desc: 'Wer ChatGPT ohne Rahmen nutzt, hat im Worst Case Daten in den USA und keine Auftragsverarbeitung. Die Angst vor Compliance-Problemen bremst jede ernsthafte KI-Initiative — dabei lässt sich das in zwei Stunden klären.',
    },
  ];
  return (
    <section data-screen-label="03 Problem" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--kz-cream-deep)',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow kanji="罠" label="Vier Fallstricke" />
        <RevealHeadline
          text="Die meisten KI-Projekte scheitern am Prozess, nicht an der Technik."
          accent={[5, 6]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 720, marginTop: 32, marginBottom: 64,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Die Modelle sind reif. Die Tools sind da. Was fehlt, ist jemand,
            der deine Realität kennt, die richtigen Stellen findet und die Lösung
            fertig baut — nicht als PowerPoint, sondern als Software, die dein
            Team am Montagmorgen aufruft.
          </p>
        </Reveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(20px, 2.5vw, 32px)',
        }}>
          {fallstricke.map((f, i) => (
            <Reveal key={i} delay={200 + i * 120}>
              <div style={{
                padding: '32px 28px',
                background: 'var(--kz-cream)',
                borderRadius: 12,
                height: '100%',
                borderLeft: '3px solid var(--kz-ember)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28, lineHeight: 1,
                  color: 'var(--kz-ember)',
                  marginBottom: 14, letterSpacing: '-0.02em',
                }}>{f.num}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(20px, 2vw, 24px)',
                  fontWeight: 400, lineHeight: 1.25,
                  margin: '0 0 14px',
                  letterSpacing: '-0.01em',
                }}>{f.title}</h3>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15, lineHeight: 1.6,
                  color: 'var(--fg-muted)',
                  margin: 0, textWrap: 'pretty',
                }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
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
        <SectionEyebrow kanji="道" label="Der andere Weg" />
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

        <div style={{
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
                  color: 'var(--kz-ember)',
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
// SECTION 05 — Angebot (Audit / Setup / Retainer)
// ============================================================
function AngebotSection() {
  return (
    <section data-screen-label="05 Angebot" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--kz-cream-deep)',
      overflow: 'hidden',
    }}>
      <Reveal duration={1600} y={40} style={{
        position: 'absolute',
        left: '-2%', top: '8%',
        width: 'min(24vw, 320px)',
        opacity: 0.78,
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
        <SectionEyebrow kanji="提" label="Angebot" />
        <RevealHeadline text="Drei Stufen. Festpreise. Keine versteckten Kosten." accent={[2]} />

        <Reveal delay={300}>
          <p style={{
            maxWidth: 720, marginTop: 32, marginBottom: 64,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(17px, 1.5vw, 20px)',
            lineHeight: 1.6, color: 'var(--fg-muted)',
            textWrap: 'pretty',
          }}>
            Jede Stufe hat einen klaren Umfang, einen Festpreis und ein definiertes
            Ergebnis. Du steigst ein, wo es für dich Sinn ergibt, und bleibst so lange,
            wie du Mehrwert siehst. Kein Abo-Zwang, kein versteckter Aufwand.
          </p>
        </Reveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'clamp(20px, 2.5vw, 28px)',
          marginBottom: 32,
        }}>
          {/* AUDIT */}
          <Reveal delay={200}>
            <div style={{
              padding: '36px 30px',
              background: 'var(--kz-cream)',
              borderRadius: 12,
              height: '100%',
              display: 'flex', flexDirection: 'column',
              border: '2px solid var(--kz-ember)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: -12, left: 24,
                background: 'var(--kz-ember)', color: 'var(--kz-cream)',
                padding: '4px 12px', borderRadius: 999,
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.16em',
              }}>Empfohlener Einstieg</div>
              <div style={{
                fontFamily: 'var(--font-jp)',
                fontSize: 36, color: 'var(--kz-ember)',
                marginBottom: 16,
              }}>始</div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26, fontWeight: 400, lineHeight: 1.15,
                margin: '0 0 6px', letterSpacing: '-0.01em',
              }}>Discovery-Audit</h3>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32, lineHeight: 1, color: 'var(--fg)',
                marginTop: 12, marginBottom: 4,
              }}>1.490 €</div>
              <div style={{
                fontSize: 13, color: 'var(--fg-muted)', marginBottom: 20,
              }}>Festpreis · 1 Tag · Lieferung in 5 Werktagen</div>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14, lineHeight: 1.55,
                color: 'var(--fg-muted)',
                margin: '0 0 20px', flex: 1, textWrap: 'pretty',
              }}>
                Ein Tag bei dir oder remote, ein paar Tage Auswertung, schriftliches
                Liefer-Artefakt mit Roadmap. Damit kannst du weiterarbeiten —
                auch wenn wir uns danach nicht wiedersehen.
              </p>
              <a href="/audit" style={ctaBtnStyle()}>
                Audit buchen <Arrow />
              </a>
            </div>
          </Reveal>

          {/* SETUP */}
          <Reveal delay={320}>
            <div style={{
              padding: '36px 30px',
              background: 'var(--kz-charcoal)',
              color: 'var(--kz-cream)',
              borderRadius: 12,
              height: '100%',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                fontFamily: 'var(--font-jp)',
                fontSize: 36, color: 'var(--kz-ember)',
                marginBottom: 16,
              }}>建</div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26, fontWeight: 400, lineHeight: 1.15,
                margin: '0 0 6px', letterSpacing: '-0.01em',
                color: 'var(--kz-cream)',
              }}>Setup-Module</h3>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32, lineHeight: 1, color: 'var(--kz-cream)',
                marginTop: 12, marginBottom: 4,
              }}>2.490 € – 9.990 €</div>
              <div style={{
                fontSize: 13, color: 'rgba(245,240,232,0.6)', marginBottom: 20,
              }}>Festpreis je Modul · 4–8 Wochen</div>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14, lineHeight: 1.55,
                color: 'rgba(245,240,232,0.78)',
                margin: '0 0 20px', flex: 1, textWrap: 'pretty',
              }}>
                Aus dem Audit suchst du dir ein Modul aus. Wir bauen, integrieren,
                übergeben. Komplett-PA-Bundle (S+M+L): <strong style={{ color: 'var(--kz-ember)' }}>14.999 €</strong> Festpreis.
              </p>
              <a href="/pricing#module" style={ctaBtnStyle({ ember: true })}>
                Module ansehen <Arrow />
              </a>
            </div>
          </Reveal>

          {/* RETAINER */}
          <Reveal delay={440}>
            <div style={{
              padding: '36px 30px',
              background: 'var(--kz-cream)',
              borderRadius: 12,
              height: '100%',
              display: 'flex', flexDirection: 'column',
              border: '1px solid var(--kz-border)',
            }}>
              <div style={{
                fontFamily: 'var(--font-jp)',
                fontSize: 36, color: 'var(--kz-ember)',
                marginBottom: 16,
              }}>続</div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26, fontWeight: 400, lineHeight: 1.15,
                margin: '0 0 6px', letterSpacing: '-0.01em',
              }}>Retainer</h3>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32, lineHeight: 1, color: 'var(--fg)',
                marginTop: 12, marginBottom: 4,
              }}>499 € – 1.299 €</div>
              <div style={{
                fontSize: 13, color: 'var(--fg-muted)', marginBottom: 20,
              }}>pro Monat · keine Mindestlaufzeit</div>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14, lineHeight: 1.55,
                color: 'var(--fg-muted)',
                margin: '0 0 20px', flex: 1, textWrap: 'pretty',
              }}>
                Laufender Betrieb, Hosting, Updates, Anpassungen. Drei Stufen je
                nach Modul-Anzahl. Direkter Ansprechpartner, kein Ticket-System.
              </p>
              <a href="/pricing#retainer" style={ctaBtnStyle()}>
                Retainer ansehen <Arrow />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={500}>
          <p style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 'clamp(15px, 1.4vw, 18px)',
            color: 'var(--fg-muted)',
            margin: '40px 0 0', textAlign: 'center',
          }}>
            Audit-Honorar wird zu 50% auf ein Setup-Paket angerechnet,
            wenn du innerhalb 30 Tagen nach Audit-Lieferung buchst.
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
    background: ember ? 'var(--kz-ember)' : 'var(--kz-charcoal)',
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
function MethodikSection() {
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
      background: 'var(--kz-cream)',
    }}>
      <div style={{
        maxWidth: 980, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow kanji="観" label="So arbeite ich" />
        <RevealHeadline
          text="Beobachten statt Beraten."
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
            beobachte ich einen Tag in deinem Büro.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gap: 36, marginBottom: 48 }}>
          {cases.map((c, i) => (
            <Reveal key={i} delay={200 + i * 140}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(120px, 200px) 1fr',
                gap: 'clamp(20px, 4vw, 48px)',
                paddingBottom: 28,
                borderBottom: i < cases.length - 1 ? '1px solid var(--kz-border)' : 'none',
                alignItems: 'baseline',
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
                    color: 'var(--kz-ember)',
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
        <SectionEyebrow kanji="信" label="Vertrauen" />
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

        <div style={{
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
                  color: 'var(--kz-ember)',
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
// SECTION 09 — Über mich (Bens Hero-Story)
// ============================================================
function UeberMichSection() {
  return (
    <section data-screen-label="09 Über mich" style={{
      position: 'relative',
      padding: 'clamp(80px, 14vh, 180px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--kz-cream-deep)',
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
        <SectionEyebrow kanji="人" label="Über mich" />
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
              }}>Gründer · Pulscraft Digital · Bayern</p>
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
              Zwölf Jahre Mobility-IT bei SKIDATA. Software, die jeden Tag ohne Pause
              läuft, an realen Maschinen, mit echten Kunden. Wer in der Mobility-IT
              durchhält, lernt zwei Dinge: Lösungen müssen am Montagmorgen
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
              '12+ Jahre IT-Praxis (Parkhaus-Systeme, SKIDATA-Stack, sweb.Validate/Control)',
              'Eigener KI-Stack: n8n + Claude API + React/Supabase, gehostet auf Hetzner',
              'Gebaut: Personalplanungs-Tool, News-Digest, Email-Triage, Telefonagent (in Exploration)',
              'DSGVO-konforme Auftragsverarbeitung',
              'Vor Ort im Raum Süddeutschland · remote in ganz DACH',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--kz-ember)', fontWeight: 600, flexShrink: 0 }}>·</span>
                <span style={{ textWrap: 'pretty' }}>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={560}>
          <div style={{
            marginTop: 56, padding: '32px clamp(24px, 4vw, 40px)',
            background: 'var(--kz-cream)', borderRadius: 12,
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
      a: 'Setup-Module 4–8 Wochen. Audit selbst etwa 2 Wochen: 1 Tag bei dir, ein paar Tage Auswertung, Übergabe-Call.',
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
      a: 'Audit 1.490 € fix. Setup-Module je nach Klasse 2.490 € – 9.990 €. Komplett-PA-Bundle 14.999 €. Retainer 499 € – 1.299 €/Monat je nach Modul-Anzahl. Alle Preise auf der Pricing-Seite. Keine versteckten Nachträge.',
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
      a: 'Im Setup sind 4 Wochen Begleitung nach Go-Live inklusive. Danach optional ein Retainer ab 499 €/Monat — laufender Betrieb, Anpassungen, Bug-Fixes. SLA < 24h Werktags.',
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
        <SectionEyebrow kanji="問" label="Häufige Fragen" />
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
                    color: 'var(--kz-ember)', fontSize: 14,
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
  const whatsappLink = 'https://wa.me/491590103192?text=' + encodeURIComponent('Hi Ben, ich habe Interesse an k-AIzen.');
  return (
    <section data-screen-label="11 Kontakt" style={{
      position: 'relative',
      padding: 'clamp(100px, 16vh, 200px) 0 clamp(80px, 14vh, 160px)',
      background: 'var(--kz-cream-deep)',
      overflow: 'hidden',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 64px)',
      }}>
        <SectionEyebrow kanji="話" label="Kontakt" />
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'clamp(20px, 2.5vw, 28px)',
        }}>
          <Reveal delay={200}>
            <div style={kontaktKarte()}>
              <div style={kontaktKanji()}>暦</div>
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
              <div style={kontaktKanji()}>話</div>
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
              <div style={kontaktKanji()}>書</div>
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
            Oder direkt: <a href="mailto:kontakt@k-aizen.de" style={{ color: 'var(--kz-ember)' }}>kontakt@k-aizen.de</a>
            {' · '}
            <a href="https://www.linkedin.com/in/benjamin-zirngibl-0963753ab"
               target="_blank" rel="noopener noreferrer"
               style={{ color: 'var(--kz-ember)' }}>LinkedIn</a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
function kontaktKarte() {
  return {
    padding: '36px 30px',
    background: 'var(--kz-cream)',
    borderRadius: 12,
    height: '100%',
    display: 'flex', flexDirection: 'column',
  };
}
function kontaktKanji() {
  return {
    fontFamily: 'var(--font-jp)',
    fontSize: 36, color: 'var(--kz-ember)',
    marginBottom: 16,
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
          { label: 'Audit buchen', href: '/audit' },
          { label: 'Preise & Module', href: '/pricing' },
          { label: 'Über mich', href: '/about' },
          { label: 'Erstgespräch', href: '/erstgespraech' },
        ]} />
        <FooterCol title="Kontakt" items={[
          { label: 'kontakt@k-aizen.de', href: 'mailto:kontakt@k-aizen.de' },
          { label: 'WhatsApp', href: 'https://wa.me/491590103192' },
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
        <span>© 2026 Benjamin Zirngibl · Pulscraft Digital · Bayern</span>
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
  KzProblem: ProblemSection,
  KzAndererWeg: AndererWegSection,
  KzAngebot: AngebotSection,
  KzMethodik: MethodikSection,
  KzVertrauen: VertrauenSection,
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
