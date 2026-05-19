// Page-Templates für den Katalog. Jede Funktion = eine Seite des Buchs.
// k-AIzen-Modern-Style: cream-Background, charcoal-Text, ember-Akzente, Cormorant-Display.

import React from 'react';

// ── Shared styles ───────────────────────────────────────────────────────
const CHARCOAL = '#1f2933';
const CHARCOAL_SOFT = '#4a5360';
const CREAM = '#F5F0E8';
const EMBER = '#E85A2B';
const BORDER = 'rgba(31,41,51,0.15)';

const fontDisplay = '"Cormorant Garamond", "Iowan Old Style", Georgia, serif';
const fontSans = 'system-ui, -apple-system, "Segoe UI", sans-serif';

const pageShell = {
  width: '100%', height: '100%',
  padding: 'clamp(20px, 3vh, 40px) clamp(22px, 3vw, 44px) 56px',
  color: CHARCOAL,
  fontFamily: fontSans,
  fontSize: 'clamp(11px, 1vw, 14px)',
  lineHeight: 1.55,
  display: 'flex', flexDirection: 'column',
  position: 'relative',
  background: CREAM,
  overflow: 'hidden',
};

const eyebrow = {
  fontFamily: fontSans,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: CHARCOAL_SOFT,
  marginBottom: 14,
};

const h1 = {
  fontFamily: fontDisplay,
  fontSize: 'clamp(28px, 3.4vw, 48px)',
  lineHeight: 1.05,
  letterSpacing: '-0.01em',
  color: CHARCOAL,
  margin: '0 0 18px',
  textWrap: 'balance',
  fontWeight: 500,
};

const h2 = {
  fontFamily: fontDisplay,
  fontSize: 'clamp(22px, 2.4vw, 32px)',
  lineHeight: 1.15,
  letterSpacing: '-0.005em',
  color: CHARCOAL,
  margin: '0 0 12px',
  fontWeight: 500,
};

const lead = {
  fontFamily: fontDisplay,
  fontStyle: 'italic',
  fontSize: 'clamp(15px, 1.4vw, 20px)',
  lineHeight: 1.45,
  color: CHARCOAL_SOFT,
  margin: '0 0 24px',
  textWrap: 'pretty',
};

const body = {
  fontFamily: fontSans,
  fontSize: 'clamp(12px, 1vw, 15px)',
  lineHeight: 1.6,
  color: CHARCOAL,
  margin: '0 0 14px',
};

const priceBadge = {
  display: 'inline-flex', alignItems: 'baseline', gap: 6,
  padding: '8px 16px',
  background: CHARCOAL,
  color: CREAM,
  borderRadius: 6,
  fontFamily: fontSans,
  fontSize: 14,
  fontWeight: 600,
};

const priceBadgeEmber = {
  ...priceBadge,
  background: EMBER,
};

const card = {
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: '12px 14px',
  background: 'rgba(255, 250, 240, 0.5)',
};

const folioFooter = () => ({
  position: 'absolute',
  bottom: 14,
  left: 'clamp(22px, 3vw, 44px)',
  right: 'clamp(22px, 3vw, 44px)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  fontFamily: fontSans, fontSize: 9, fontWeight: 600,
  letterSpacing: '0.14em', textTransform: 'uppercase',
  color: CHARCOAL_SOFT,
  borderTop: `1px solid ${BORDER}`,
  paddingTop: 6,
  opacity: 0.65,
});

function Footer({ label, num }) {
  return (
    <div style={folioFooter()}>
      <span>k-AIzen · {label}</span>
      <span>{String(num).padStart(2, '0')}</span>
    </div>
  );
}

// ── Page 0: Cover (left side of first spread = blank/spine area) ────────
export function CoverBlank() {
  return (
    <div style={{
      ...pageShell,
      background: 'linear-gradient(135deg, #E8DFD0 0%, #D8CBB4 100%)',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '60%', height: '70%',
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        background: 'rgba(255,250,240,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: fontDisplay,
          fontStyle: 'italic',
          fontSize: 'clamp(36px, 5vw, 64px)',
          color: 'rgba(31,41,51,0.25)',
          letterSpacing: '0.1em',
        }}>
          改善
        </div>
      </div>
    </div>
  );
}

// ── Page 1: Title Page ──────────────────────────────────────────────────
export function CoverTitle() {
  return (
    <div style={{
      ...pageShell,
      justifyContent: 'space-between',
    }}>
      <div>
        <div style={eyebrow}>Produkt-Katalog 2026</div>
        <h1 style={{
          ...h1,
          fontSize: 'clamp(36px, 4.8vw, 72px)',
          marginTop: 'clamp(40px, 8vh, 100px)',
        }}>
          Vier&nbsp;KI-Mitarbeiter.<br />
          <span style={{ color: EMBER, fontStyle: 'italic' }}>Für dein KMU.</span>
        </h1>
        <p style={{ ...lead, maxWidth: '95%', marginTop: 20 }}>
          KI-Personal-Assistent, Social-Media-Manager, Finanzer und Personaler — als feste Pakete oder einzeln. Persönlich betreut, in Deutschland gehostet, ohne Lock-in.
        </p>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        marginTop: 24,
      }}>
        <div style={{
          fontFamily: fontDisplay, fontStyle: 'italic', fontSize: 16,
          color: CHARCOAL_SOFT,
        }}>
          Benjamin Zirngibl · Bayern
        </div>
        <div style={{ fontFamily: fontSans, fontSize: 12, color: CHARCOAL_SOFT }}>
          k-aizen.de · kontakt@k-aizen.de
        </div>
      </div>

      <Footer label="Titel" num={1} />
    </div>
  );
}

// ── Page 2: Vorwort — Versicherungsmakler-Story (verso) ─────────────────
export function VorwortLeft() {
  return (
    <div style={pageShell}>
      <div style={eyebrow}>Vorwort</div>
      <h2 style={{ ...h2, fontSize: 'clamp(20px, 2.2vw, 28px)' }}>
        Ich bin nicht euer SaaS-Vendor.<br />
        <span style={{ color: EMBER, fontStyle: 'italic' }}>Ich bin euer KI-Guy.</span>
      </h2>
      <p style={{ ...body, fontSize: 'clamp(11.5px, 0.95vw, 14px)' }}>
        Stell dir vor, du hättest einen Versicherungsmakler — aber für KI. Jemand, der dein System aufsetzt, es auf dem neuesten Stand hält, sich für dich um neue Modelle informiert, und den du anrufst, wenn du Fragen hast.
      </p>
      <p style={{ ...body, fontSize: 'clamp(11.5px, 0.95vw, 14px)' }}>
        Genau das ist k-AIzen. Kein Tool, das du irgendwo abonnierst. Sondern ein persönlicher KI-Partner, der mit deinem Unternehmen mitwächst.
      </p>
      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontSize: 14, color: CHARCOAL, marginBottom: 6, lineHeight: 1.4 }}>
          „Wenn ein neues KI-Modell rauskommt — z. B. GPT-6 oder Claude 5 — informier ich mich, evaluier ob's für euer Setup besser wäre, und tausche es bei Bedarf aus."
        </div>
        <div style={{ fontSize: 10.5, color: CHARCOAL_SOFT, letterSpacing: '0.1em' }}>
          — k-AIzen Sales-Doktrin
        </div>
      </div>
      <Footer label="Vorwort" num={2} />
    </div>
  );
}

// ── Page 3: Übersicht 4 Mitarbeiter (recto) ─────────────────────────────
export function UebersichtRight() {
  const items = [
    { name: 'KI-PA', subtitle: 'Personal-Assistent', price: '14.999 €', desc: 'Mails, Kalender, Reisen, Mini-Tasks. Das Fundament.' },
    { name: 'Social', subtitle: 'Social-Media-Manager', price: 'ab 9.999 €', desc: 'Content-Pipeline, Posts, Community-Antworten.' },
    { name: 'Finanzer', subtitle: 'KI-Buchhaltung', price: 'ab 12.499 €', desc: 'Belege, Reports, Steuerberater-Schnittstelle.' },
    { name: 'Personaler', subtitle: 'HR & Schichtplan', price: 'ab 22.999 €', desc: 'Urlaub, Schichten, Multi-Standort-Koordination.' },
  ];
  return (
    <div style={pageShell}>
      <div style={eyebrow}>Übersicht</div>
      <h2 style={{ ...h2, fontSize: 'clamp(20px, 2.2vw, 28px)', margin: '0 0 8px' }}>Die vier&nbsp;Mitarbeiter</h2>
      <p style={{ ...body, fontSize: 'clamp(11.5px, 0.95vw, 13.5px)', marginBottom: 12 }}>
        Jeder als komplettes Paket. Einzeln buchbar — auch in Kombination.
      </p>
      <div style={{ display: 'grid', gap: 8, flex: 1, minHeight: 0 }}>
        {items.map((it) => (
          <div key={it.name} style={{
            ...card,
            padding: '10px 14px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 600, color: CHARCOAL, lineHeight: 1.15 }}>
                {it.name} <span style={{ fontStyle: 'italic', fontWeight: 400, color: CHARCOAL_SOFT, fontSize: 12.5 }}>· {it.subtitle}</span>
              </div>
              <div style={{ fontSize: 11, color: CHARCOAL_SOFT, marginTop: 2, lineHeight: 1.35 }}>
                {it.desc}
              </div>
            </div>
            <div style={{
              fontFamily: fontSans, fontSize: 13, fontWeight: 700,
              color: EMBER, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {it.price}
            </div>
          </div>
        ))}
      </div>
      <Footer label="Übersicht" num={3} />
    </div>
  );
}

// ── Page 4: KI-PA Hero (verso) ──────────────────────────────────────────
export function PaHeroLeft() {
  return (
    <div style={pageShell}>
      <div style={eyebrow}>Mitarbeiter 1 von 4</div>
      <h1 style={h1}>Der&nbsp;KI-PA</h1>
      <p style={lead}>
        Dein persönlicher Assistent. Liest deine Mails, plant deine Termine, organisiert deine Reisen — und denkt mit.
      </p>

      <div style={{ display: 'grid', gap: 10, flex: 1 }}>
        <Bullet label="Mail-Triage" desc="Wichtig / Sofort / Später — mit deinem Voice-Tone als Antwort-Entwurf." />
        <Bullet label="Kalender & Termine" desc="Calendly-Bookings, Pre-Call-Recherche, Audio→Protokoll." />
        <Bullet label="Reisen & Buchungen" desc="Hotels, Flüge, Mietwagen — du bestätigst per Discord." />
        <Bullet label="Mini-Automationen" desc="Wiederkehrende Tasks die dich täglich Zeit kosten." />
      </div>

      <Footer label="KI-PA" num={4} />
    </div>
  );
}

// ── Page 5: KI-PA Preis & Module (recto) ────────────────────────────────
export function PaPriceRight() {
  return (
    <div style={pageShell}>
      <div style={eyebrow}>KI-PA · Pakete</div>
      <h2 style={h2}>Festpreis. Kein Kleingedrucktes.</h2>

      <div style={{ ...card, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, gap: 12 }}>
          <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 600 }}>Komplett-Bundle</div>
          <div style={{ ...priceBadgeEmber, fontSize: 13, padding: '6px 12px' }}>14.999 €</div>
        </div>
        <div style={{ fontSize: 11.5, color: CHARCOAL_SOFT }}>
          Einmaliger Setup. Alle 4 Kern-Module: Mail-Triage, Kalender, Reisen, Mini-Tasks.
        </div>
      </div>

      <div style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontSize: 14, color: CHARCOAL_SOFT, marginBottom: 6 }}>
        Plus Retainer für die laufende Betreuung:
      </div>

      <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
        <RetainerRow label="Bundle-Retainer" price="1.299 €/Mo" desc="Hosting, Updates, 8h Anpassung/Monat." />
        <RetainerRow label="Bundle-Retainer Premium" price="1.799 €/Mo" desc="Reaktion < 4h Werktags, 16h/Monat." />
      </div>

      <div style={{
        padding: '10px 12px',
        background: CHARCOAL,
        color: CREAM,
        borderRadius: 8,
        fontFamily: fontSans, fontSize: 11.5, lineHeight: 1.45,
      }}>
        <strong style={{ fontWeight: 700 }}>Erstgespräch gratis.</strong> Audit ab 1.490 € — bei Buchung innerhalb 30 Tagen werden 50 % aufs Setup angerechnet.
      </div>

      <Footer label="KI-PA · Preis" num={5} />
    </div>
  );
}

function Bullet({ label, desc }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, alignItems: 'baseline' }}>
      <div style={{ width: 14, height: 1, background: EMBER, marginTop: 8 }} />
      <div>
        <div style={{ fontFamily: fontSans, fontSize: 14, fontWeight: 600, color: CHARCOAL }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: CHARCOAL_SOFT, marginTop: 2 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function RetainerRow({ label, price, desc }) {
  return (
    <div style={{ ...card, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: fontSans, fontSize: 13, fontWeight: 600, color: CHARCOAL }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: CHARCOAL_SOFT, marginTop: 2 }}>
          {desc}
        </div>
      </div>
      <div style={{ fontFamily: fontSans, fontSize: 13, fontWeight: 700, color: CHARCOAL, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {price}
      </div>
    </div>
  );
}

// ── Page 6: Closing (verso) — Coming Soon Spread ────────────────────────
export function ClosingLeft() {
  return (
    <div style={pageShell}>
      <div style={eyebrow}>Weiter geht's</div>
      <h2 style={h2}>Social · Finanzer · Personaler</h2>
      <p style={lead}>
        Die nächsten drei Mitarbeiter — jeweils einzeln oder in Kombination mit dem KI-PA. Vollständige Spreads folgen in der nächsten Katalog-Version.
      </p>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: fontDisplay, fontStyle: 'italic',
          fontSize: 'clamp(48px, 7vw, 96px)',
          color: 'rgba(31,41,51,0.15)',
          letterSpacing: '0.05em',
        }}>
          v0.1
        </div>
      </div>
      <Footer label="Roadmap" num={6} />
    </div>
  );
}

// ── Page 7: CTA (recto) ─────────────────────────────────────────────────
export function CtaRight() {
  return (
    <div style={pageShell}>
      <div style={eyebrow}>Nächster Schritt</div>
      <h1 style={h1}>Lass uns&nbsp;<span style={{ color: EMBER, fontStyle: 'italic' }}>reden.</span></h1>
      <p style={lead}>
        30 Minuten Erstgespräch. Kostenlos. Du beschreibst dein KMU, ich sage dir ehrlich was Sinn macht — und was nicht.
      </p>

      <div style={{ display: 'grid', gap: 8, marginTop: 'auto' }}>
        <a href="/erstgespraech" style={{
          display: 'block', textAlign: 'center',
          padding: '14px 24px',
          background: CHARCOAL, color: CREAM,
          textDecoration: 'none',
          fontFamily: fontSans, fontSize: 14, fontWeight: 600,
          letterSpacing: '0.06em',
          borderRadius: 8,
        }}>
          Erstgespräch buchen →
        </a>
        <a href="https://wa.me/4915901031928" style={{
          display: 'block', textAlign: 'center',
          padding: '12px 24px',
          background: 'transparent', color: CHARCOAL,
          textDecoration: 'none',
          fontFamily: fontSans, fontSize: 14, fontWeight: 600,
          letterSpacing: '0.06em',
          border: `1px solid ${CHARCOAL}`,
          borderRadius: 8,
        }}>
          WhatsApp direkt
        </a>
      </div>

      <div style={{
        fontFamily: fontDisplay, fontStyle: 'italic',
        fontSize: 13, color: CHARCOAL_SOFT, textAlign: 'center',
        marginTop: 12,
      }}>
        Benjamin Zirngibl · kontakt@k-aizen.de
      </div>

      <Footer label="Kontakt" num={7} />
    </div>
  );
}
