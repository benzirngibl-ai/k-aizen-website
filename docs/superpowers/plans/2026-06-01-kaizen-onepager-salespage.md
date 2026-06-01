# k-aizen.de One-Pager Sales-Page „Ein Tag mit Lena" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die bestehende k-aizen.de-Startseite zu einer fokussierten Direct-Response One-Page Sales-Seite für den KI-PA umbauen: „Ein Tag mit Lena" als 5-Szenen-Herzstück, Wert-vor-Preis, Audit raus, ein CTA.

**Architecture:** Die Seite ist KEINE normale Astro-Build-Seite. `src/pages/index.astro` liefert nur die HTML-Hülle + `<div id="root">` + SEO-Schema + noscript-Fallback. Der echte Inhalt sind **browser-kompilierte JSX-Dateien** in `public/preview/`, geladen via `<script type="text/babel" src=...>` mit React 18 UMD + Babel-standalone vom CDN. `hero.jsx` enthält `App()` (mountet in `#root`, rendert Hero + Sektionen). `sections.jsx` enthält die einzelnen Sektions-Komponenten. **Wir bearbeiten diese JSX-Dateien direkt** — keine `.tsx`-Komponenten, kein Astro-Island.

**Tech Stack:** Astro 6 (nur Hülle) · React 18 UMD (CDN) · Babel-standalone (Browser-JSX) · `public/preview/*.jsx` · Tailwind-unabhängig (eigenes CSS in `colors_and_type.css`).

---

## Aktueller Stand (verifiziert 2026-06-01)

**`public/preview/hero.jsx` (779 Z.):** `App()` (Z.664) rendert die Seite, `ReactDOM.createRoot(#root).render(<App/>)` (Z.780). Enthält Hero-Animation (Petals, Mountains, Sun), `Header()`, `HeroOverlay({headline, sub})`.

**`public/preview/sections.jsx` (1626 Z.):** Sektions-Komponenten in Render-Reihenfolge:
- `ManifestSection` (Z.326) — „02 Manifest", injiziert `KzGlobalStyles`
- `ProblemSection` (Z.416) — „03 Problem" / „Vier Fallstricke"
- `AndererWegSection` (Z.510) — „04 Anderer Weg"
- `AngebotSection` (Z.599) — „05 Angebot" (= Preise, enthält Audit!)
- `MethodikSection` (Z.834) — „06 Methodik" / „So arbeite ich" (Audit-Geschäftslogik)
- `VertrauenSection` (Z.945) — „07 Vertrauen"
- `MeetLenaSection` (Z.1030) — „08 Meet Lena" / „Dein KI-PA"
- `UeberMichSection` (Z.1136) — „09 Über mich"
- Reusable: `Reveal`, `RevealHeadline`, `SectionEyebrow`, `SectionDivider`, `KzGlobalStyles`, `KzLeaf`, `ScrollProgress`

**`src/pages/index.astro`:** SEO-JSON-LD mit Offers inkl. Audit (Z.95), Tier1 (Z.96), Tier2 (Z.97), Voice (Z.98). noscript-Fallback (Z.246+).

**SICHERHEIT:** Vorgängerversion liegt als `old-index.astro` als Backup (laut Header-Kommentar). Wir arbeiten auf `index.astro` + `public/preview/*.jsx`.

---

## File Structure

**Modify:**
- `public/preview/sections.jsx` — Sektions-Umbau: Audit raus, neue Story-Sektion, Reihenfolge, Angebot auf Basis+Module
- `public/preview/hero.jsx` — Hero-Headline + neuer Render-Order der Sektionen in `App()`
- `src/pages/index.astro` — SEO-Schema: Audit-Offer raus, Description anpassen; noscript-Fallback anpassen

**Verify (lesen, nicht ändern wenn nicht nötig):**
- `public/preview/colors_and_type.css` — Brand-Style, für neue Sektionen wiederverwenden
- `old-index.astro` — Backup, NICHT anfassen

**Kein neues File** — wir bauen in der bestehenden JSX-Struktur. (Die Architektur lädt nur die 3 fest verdrahteten `/preview/*.jsx` — eine neue Datei würde nicht geladen ohne `index.astro`-Änderung. Daher: alles in `sections.jsx`.)

---

## Wichtige Test-Realität

Diese Seite hat **keine Unit-Test-Infrastruktur** (browser-kompiliertes JSX, kein Vitest/Jest-Setup). „Test" bedeutet hier: **visuelle Verifikation im Browser** via lokalem Dev-Server + Screenshot. Jede Task endet mit einem Browser-Check statt einem `pytest`-Lauf. Das ist die korrekte Verifikationsmethode für diese Architektur — keine künstliche Test-Suite erfinden.

Dev-Server starten (einmal, Hintergrund): `cd k-aizen/website/site && npm run dev` → öffnet auf `http://localhost:4321`.

---

## Task 1: Backup-Branch + Sicherung vor dem Umbau

**Files:**
- Git-Branch + Kopie von `public/preview/sections.jsx`

- [ ] **Step 1: Feature-Branch anlegen**

```bash
cd "k-aizen/website/site"
git checkout -b onepager-ein-tag-mit-lena
```

- [ ] **Step 2: Sicherungskopien der JSX-Dateien (zusätzlich zu git)**

```bash
cp public/preview/sections.jsx public/preview/sections.jsx.bak-20260601
cp public/preview/hero.jsx public/preview/hero.jsx.bak-20260601
```

- [ ] **Step 3: Dev-Server starten + Ist-Zustand-Screenshot**

Run: `npm run dev` (Hintergrund), dann im Browser `http://localhost:4321` öffnen, Screenshot der ganzen Seite machen.
Expected: Die aktuelle Seite rendert (Hero + Manifest/Problem/AndererWeg/Angebot/Methodik/Vertrauen/MeetLena/ÜberMich). Screenshot als Referenz „vorher" ablegen.

- [ ] **Step 4: Commit (nur die .bak-Dateien + Branch-Start)**

```bash
git add public/preview/*.bak-20260601
git commit -m "chore: backup jsx before onepager rebuild

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Audit komplett entfernen (SEO-Schema + Methodik-Sektion)

**Ziel:** Das Discovery-Audit (1.490€) fällt aus dem Geschäft → aus der Seite raus. Drei Stellen: SEO-Offer, Methodik-Sektion (Audit-Prozess), `knowsAbout`-Schema.

**Files:**
- Modify: `src/pages/index.astro` (SEO-Schema)
- Modify: `public/preview/sections.jsx` (`MethodikSection` Z.834)

- [ ] **Step 1: Audit-Offer aus SEO-Schema entfernen**

In `src/pages/index.astro`, die Zeile mit `"@type": "Offer", "name": "Discovery-Audit Standard"` (Z.95) **ganz löschen** (die komplette Offer-Objektzeile). Die Tier1/Tier2/Voice-Offers bleiben.

- [ ] **Step 2: "Discovery-Audit für KMU" aus knowsAbout entfernen**

In `src/pages/index.astro`, im `organizationSchema.knowsAbout`-Array die Zeile `"Discovery-Audit für KMU",` löschen.

- [ ] **Step 3: MethodikSection prüfen — Audit-Prozess raus oder Sektion entfernen**

`MethodikSection` (sections.jsx Z.834, „So arbeite ich") beschreibt den Audit-/Beobachtungs-Prozess („Beobachten statt Beraten"). Da das Audit-Geschäft eingestellt ist:
- **Entscheidung:** Diese Sektion wird in Task 5 durch die neue Reihenfolge entweder entfernt oder zur „Warum k-AIzen / So läuft das Setup remote"-Sektion umgewidmet. In DIESER Task nur: Audit-spezifische Sätze (Vor-Ort, „1 Tag remote Report", Audit-Preis) markieren/entfernen, Rest stehen lassen.
- Konkret: In `MethodikSection` alle Textstellen mit „Audit", „Beobachten statt Beraten", „1 Tag", „Report binnen 5 Werktagen" entfernen. Falls dadurch die Sektion leer/sinnlos wird, ganzen `MethodikSection`-Block auskommentieren (wird in Task 5 final entschieden).

- [ ] **Step 4: Browser-Verifikation**

Dev-Server neu laden (`http://localhost:4321`). Expected: Kein „Discovery-Audit", kein „1.490€" mehr auf der Seite sichtbar. SEO-Schema im Page-Source enthält keinen Audit-Offer mehr.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro public/preview/sections.jsx
git commit -m "feat: remove Discovery-Audit (Geschäftsmodell eingestellt)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Neue „Ein Tag mit Lena"-Story-Sektion (5 Szenen) bauen

**Ziel:** Das Herzstück. Eine neue Komponente `EinTagMitLenaSection` mit 5 scrollenden Szenen, jede Text + Illustration/Chat-Bubble-Mockup. Nutzt bestehende `Reveal`, `SectionEyebrow`, `SectionDivider` für Brand-Konsistenz.

**Files:**
- Modify: `public/preview/sections.jsx` (neue Funktion, vor `MeetLenaSection`)

- [ ] **Step 1: `EinTagMitLenaSection`-Komponente schreiben**

In `sections.jsx`, nach `AndererWegSection` (oder an passender Stelle vor dem Angebot), neue Komponente einfügen. Struktur (echtes JSX, Brand-Pattern aus bestehenden Sektionen übernehmen — `SectionEyebrow`, `Reveal`, inline-styles wie in den Nachbarsektionen):

```jsx
// ---------- Ein Tag mit Lena (5 Szenen) ----------
function SzeneRow({ index, time, spoken, result, side = 'left' }) {
  // side: 'left' = Sprechblase links / Ergebnis rechts, alterniert
  return (
    <Reveal delay={index * 80} y={24}>
      <div className="kz-szene" data-side={side} style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem',
        alignItems: 'center', margin: '3.5rem 0',
      }}>
        <div className="kz-szene-text">
          <div className="kz-szene-time" style={{ opacity: 0.6, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{time}</div>
          {spoken && (
            <div className="kz-bubble" style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: '1.2rem',
              padding: '1rem 1.3rem', margin: '0.8rem 0', fontStyle: 'italic',
            }}>„{spoken}"</div>
          )}
          <p className="kz-szene-result" style={{ marginTop: '0.6rem' }}>{result}</p>
        </div>
        <div className="kz-szene-illu" aria-hidden="true" style={{
          minHeight: '180px', borderRadius: '1rem',
          background: 'rgba(255,255,255,0.03)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.85,
        }}>
          {/* ILLUSTRATION-SLOT Szene {index+1} — Brand-Illustration/Mockup später einsetzen */}
          <span style={{ opacity: 0.4, fontSize: '0.8rem' }}>Illustration Szene {index + 1}</span>
        </div>
      </div>
    </Reveal>
  );
}

function EinTagMitLenaSection() {
  const szenen = [
    { time: '08:14 — Im Auto', spoken: 'Ey Lena, Herr Meier — seine Frau mag rote Rosen. Und merk dir: drei Kunden mit dem Lieferproblem.', result: 'Du sprichst es einfach ins Handy. Lena merkt sich alles — kein Notizzettel, kein Vergessen.' },
    { time: '6 Monate später', spoken: null, result: 'Lena meldet sich: „Frau Meier hat morgen Geburtstag — sie mag rote Rosen." Der Assistent, der nie vergisst.' },
    { time: '09:30 — Posteingang', spoken: null, result: 'Mails kommen rein und werden automatisch sortiert. Wichtiges oben, Spam weg, alles nach Kunde gruppiert.' },
    { time: '11:00 — Eine Rechnung kommt', spoken: null, result: 'Du bekommst auf dein Dashboard: „Rechnung Müller bearbeitet — Antwort-Vorschau bereit." Du liest, drückst Approve, raus geht sie. Volle Kontrolle, null Tipparbeit.' },
    { time: '15:20 — Auf der Baustelle', spoken: null, result: 'Du machst ein Foto, postest es ins Dashboard. Sekunden später ist es auf Instagram und Facebook. Ein Klick, überall präsent.' },
  ];
  return (
    <section data-screen-label="03 Ein Tag mit Lena" id="story" style={{ padding: '6rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <SectionEyebrow leaf={1} label="Ein Tag mit Lena" />
        <RevealHeadline text="So fühlt sich ein Tag mit Ihrem KI-Mitarbeiter an." />
        {szenen.map((s, i) => (
          <SzeneRow key={i} index={i} time={s.time} spoken={s.spoken} result={s.result} side={i % 2 === 0 ? 'left' : 'right'} />
        ))}
      </div>
    </section>
  );
}
```

(Hinweis für Umsetzer: `data-screen-label`, `SectionEyebrow leaf={...}`, `RevealHeadline`, `Reveal` sind bestehende Bausteine in dieser Datei — exakt wie in den Nachbarsektionen verwenden. Inline-Styles an den Stil der bestehenden Sektionen angleichen, falls die Beispiel-Styles abweichen.)

- [ ] **Step 2: Browser-Verifikation der Sektion isoliert**

Die Sektion ist geschrieben, aber noch nicht in `App()` eingehängt (das macht Task 5). Zwischen-Check: JSX-Syntax korrekt? Dev-Server-Konsole (Browser DevTools) zeigt KEINEN Babel-Compile-Fehler beim Laden von `sections.jsx`.
Expected: Keine roten Babel/JSX-Fehler in der Browser-Konsole.

- [ ] **Step 3: Commit**

```bash
git add public/preview/sections.jsx
git commit -m "feat: EinTagMitLenaSection (5-Szenen Story-Herzstück)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Angebot-Sektion auf „Basis + Module" umbauen (Audit raus)

**Ziel:** `AngebotSection` (sections.jsx Z.599) zeigt aktuell die Tiers inkl. Audit. Umbau auf: **EIN Basis-Produkt (KI-PA) + dazubuchbare Module.** Preis erst hier (= unten im Scroll).

**Files:**
- Modify: `public/preview/sections.jsx` (`AngebotSection` Z.599)

- [ ] **Step 1: AngebotSection-Inhalt auf Basis+Module umstellen**

In `AngebotSection`: Audit-Karte/Spalte entfernen. Struktur auf:
- **Basis-Block:** „KI-PA — Ihr persönlicher KI-Assistent" mit Kernpreis. Aus dem bestehenden Tier-1 ableiten: **ab 10.299 € Setup + 1.029 €/Mo** (oder SaaS-Style 1.899 €/Mo) — exakt die Zahlen aus der bestehenden `DESCRIPTION` in index.astro übernehmen, damit Schema + Seite konsistent sind.
- **Module-Block (dazubuchbar):** Liste/Karten:
  - „Voice-Empfangsdame" — eigene Firmen-Nummer, KI nimmt Anrufe (9.999 €, aus Schema)
  - „Concierge-Upgrade" — Anrufe/Behörden/Reklamationen als Mensch übernommen (= alter Tier-2-Aufpreis, ab 12.999 €)
  - „weitere Module folgen" — Platzhalter-Zeile, signalisiert „wächst mit"
- Festpreis-Transparenz-Hinweis beibehalten („Festpreise, sichtbar" — ist Marken-DNA).

Den bestehenden visuellen Stil der `AngebotSection` (Karten, Eyebrow, Reveal) beibehalten — nur Inhalt/Struktur ändern, nicht das Design neu erfinden.

- [ ] **Step 2: id="preis" für Scroll-Anker setzen**

Dem `<section>`-Tag von `AngebotSection` `id="preis"` geben (für die Sticky-Nav in Task 6).

- [ ] **Step 3: Browser-Verifikation**

Dev-Server neu laden. Expected: Angebot-Sektion zeigt Basis-KI-PA + Module, KEIN Audit, Preise sichtbar. Keine Konsolen-Fehler.

- [ ] **Step 4: Commit**

```bash
git add public/preview/sections.jsx
git commit -m "feat: Angebot als Basis-KI-PA + dazubuchbare Module (Audit raus)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Render-Reihenfolge in App() auf Spec-Struktur bringen

**Ziel:** Die Sektionen in `App()` (hero.jsx Z.664) in die Spec-Reihenfolge bringen: Hero → Problem/Hook → Ein Tag mit Lena → Warum k-AIzen → Vertrauen → Angebot(Preis) → CTA. Story VOR Preis.

**Files:**
- Modify: `public/preview/hero.jsx` (`App()` Z.664)
- ggf. Modify: `public/preview/sections.jsx` (MethodikSection final entscheiden)

- [ ] **Step 1: Aktuelle Render-Reihenfolge in App() finden**

In `hero.jsx`, `App()` (Z.664): die JSX-Liste der gerenderten Sektionen lokalisieren (`<ManifestSection/>`, `<ProblemSection/>`, … `<MeetLenaSection/>`, `<UeberMichSection/>`).

- [ ] **Step 2: Reihenfolge umstellen auf Spec**

Neue Reihenfolge (Spec §3):
```
<Hero ... />            (bleibt oben, Headline aus Task 7)
<ProblemSection/>       (Hook/Problem — kurz)
<EinTagMitLenaSection/> (NEU, das Herzstück — Task 3)
<AndererWegSection/>    → umwidmen/behalten als "Warum k-AIzen / USPs" (DSGVO, EU-Server)
<MeetLenaSection/>      (Dein KI-PA — passt zu USP/Produkt)
<VertrauenSection/>     (Proof)
<AngebotSection/>       (Preis — erst HIER, id="preis")
<UeberMichSection/>     (Über mich — Vertrauen/Person, kurz vor CTA ok)
<CTA/>                  (Erstgespräch — Task 8)
```
- `ManifestSection`: entfernen oder in den Hook integrieren (Spec hat keine separate Manifest-Sektion). Empfehlung: entfernen, Kernsatz ggf. in Hero-Sub.
- `MethodikSection`: nach Audit-Entfernung (Task 2) — wenn leer, hier final aus `App()` rausnehmen.

- [ ] **Step 3: Browser-Verifikation der ganzen Seite**

Dev-Server, ganze Seite durchscrollen + Full-Page-Screenshot. Expected: Reihenfolge ist Hero → Problem → Ein Tag mit Lena (5 Szenen) → Warum/USP → MeetLena → Vertrauen → Angebot(Preis unten) → ÜberMich → CTA. Preis erscheint NACH der Story. Keine Konsolen-Fehler.

- [ ] **Step 4: Commit**

```bash
git add public/preview/hero.jsx public/preview/sections.jsx
git commit -m "feat: Sektionen auf Wert-vor-Preis Reihenfolge (Story vor Angebot)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Sticky-Nav auf Scroll-Anker (statt Tabs/Seitenwechsel)

**Ziel:** Die Nav (in `Header()`, hero.jsx Z.310) so, dass Links nur scrollen (`#story`, `#preis`), keine Seitenwechsel. Logo links, CTA-Button rechts.

**Files:**
- Modify: `public/preview/hero.jsx` (`Header()` Z.310)

- [ ] **Step 1: Header-Links auf Anchor-Scroll umstellen**

In `Header()`: Nav-Links so setzen, dass sie auf `#story` und `#preis` zeigen (Anker aus Task 3/4). Falls aktuell Links auf `/pricing`, `/katalog`, `/ki-pa` etc. zeigen → ersetzen durch Anchor-Links auf der gleichen Seite. Smooth-Scroll: `html { scroll-behavior: smooth; }` in `colors_and_type.css` ergänzen, falls nicht vorhanden.

- [ ] **Step 2: CTA-Button rechts in der Nav**

In `Header()` rechts ein CTA-Button „Erstgespräch" der auf das Booking-Ziel zeigt (siehe Task 8 für finale URL — vorerst `/erstgespraech`).

- [ ] **Step 3: Browser-Verifikation**

Dev-Server. Klick auf Nav-„Preis" → Seite scrollt zur Angebot-Sektion (kein Seitenwechsel). Klick auf „Story" → scrollt zu den Szenen.
Expected: Reine Scroll-Navigation, URL bleibt `/` (höchstens `#anker`).

- [ ] **Step 4: Commit**

```bash
git add public/preview/hero.jsx public/preview/colors_and_type.css
git commit -m "feat: Nav als Scroll-Anker (#story #preis), kein Seitenwechsel

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Hero-Headline + Video-Slot

**Ziel:** Hero-Headline auf die emotionale Direct-Response-Richtung. Video-Slot reservieren (Platzhalter jetzt, Video später).

**Files:**
- Modify: `public/preview/hero.jsx` (`HeroOverlay` Z.490, `App` Z.664)

- [ ] **Step 1: Hero-Headline + Sub setzen**

In `HeroOverlay` (oder wo `headline`/`sub` als Props gesetzt werden, in `App()`): Headline-Richtung (freigegeben):
- Headline: „Ihr Mitarbeiter, der nie etwas vergisst, nie krank wird und um 3 Uhr nachts ans Telefon geht."
- Sub: „Ein KI-PA, remote eingerichtet. DSGVO-konform, auf Ihrem Server in Deutschland."
(Exakte Worte darf der Umsetzer leicht glätten — Richtung ist verbindlich, nicht jedes Wort.)

- [ ] **Step 2: Video-Slot-Platzhalter im Hero**

Unter der Headline einen Video-Slot-Container einfügen: ein `<div className="kz-video-slot">` mit Poster-Platzhalter (Brand-Bild oder dezenter „▶ Video"-Rahmen) + Kommentar `{/* VIDEO-SLOT — Auto/Handy-Moment, Higgsfield/Seedance, Quelle später */}`. Muss layout-stabil sein, sodass später nur `<video>`/Embed reingesetzt wird.

- [ ] **Step 3: Browser-Verifikation**

Dev-Server. Expected: Neue Headline sichtbar, Video-Slot-Platzhalter sichtbar (kein gebrochenes Layout), Hero-Animation läuft weiter.

- [ ] **Step 4: Commit**

```bash
git add public/preview/hero.jsx
git commit -m "feat: Hero-Headline (Direct-Response) + Video-Slot Platzhalter

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Single CTA durchziehen + Sekundärziele entfernen

**Ziel:** Ein einziges Seitenziel: „Erstgespräch buchen". Alle CTA-Buttons zeigen dorthin. Konkurrierende Ziele (Newsletter, Audit-Funnel, Katalog-Download) raus.

**Files:**
- Modify: `public/preview/sections.jsx`, `public/preview/hero.jsx`
- Verify: `src/pages/erstgespraech.astro` (Ziel existiert)

- [ ] **Step 1: CTA-Ziel bestätigen**

Run: `ls src/pages/erstgespraech.astro && grep -iE "cal|booking|kalender|calendly|termin" src/pages/erstgespraech.astro | head`
Expected: Datei existiert; finde heraus, ob sie ein Booking einbettet. Falls ja → das ist die CTA-Ziel-URL `/erstgespraech`.

- [ ] **Step 2: Alle CTAs auf /erstgespraech vereinheitlichen**

In `hero.jsx` + `sections.jsx`: jeden primären CTA-Button auf `/erstgespraech` setzen, Label „Erstgespräch buchen". Mindestens: Hero-CTA, Nav-CTA, Angebot-Sektion-CTA, Schluss-CTA.

- [ ] **Step 3: Sekundärziele entfernen**

Suchen + entfernen: Links zu „Katalog herunterladen", „Newsletter", „Audit anfragen", separate „Pricing-Seite"-Buttons innerhalb der Story/Angebot-Flow. (Footer-Links zu Impressum/Datenschutz/AGB bleiben — rechtlich nötig.)

- [ ] **Step 4: Browser-Verifikation**

Dev-Server. Jeden sichtbaren Haupt-Button klicken → alle landen bei `/erstgespraech`. Expected: Kein konkurrierendes Primärziel mehr.

- [ ] **Step 5: Commit**

```bash
git add public/preview/hero.jsx public/preview/sections.jsx
git commit -m "feat: Single CTA Erstgespräch, Sekundärziele entfernt

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: noscript-Fallback + SEO-Description aktualisieren

**Ziel:** Der noscript-Fallback (Crawler/initial paint) und die Meta-Description müssen zur neuen Seite passen (Audit raus, Story-Framing).

**Files:**
- Modify: `src/pages/index.astro` (noscript Z.246+, DESCRIPTION Z.8)

- [ ] **Step 1: DESCRIPTION anpassen**

`DESCRIPTION` (Z.8): „Discovery-Audit"-Erwähnung raus. Neue Description Richtung: „KI-PA für KMU in Deutschland — Ihr KI-Mitarbeiter für Mails, Termine, Anrufe und Social. Remote eingerichtet, DSGVO-konform, eigener Server in Deutschland. Basis + dazubuchbare Module. Festpreise, sichtbar."

- [ ] **Step 2: noscript-Fallback-Inhalt anpassen**

Im `kz-noscript-fallback`-`<article>` (Z.246+): Audit-Erwähnungen raus, Kern-Story + Angebot (Basis + Module) als Text-Fallback. Muss kein Pixel-Match sein — Crawler-/No-JS-Sicht, sachlich korrekt zum neuen Angebot.

- [ ] **Step 3: Browser-Verifikation (JS aus)**

Dev-Server, im Browser JS deaktivieren (oder noscript-CSS testen). Expected: Fallback zeigt das neue Angebot ohne Audit. Page-Source-Description aktualisiert.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: noscript-Fallback + Meta-Description auf neues Angebot

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Gesamt-Verifikation + Multi-Reviewer-Visual-Check

**Ziel:** Die ganze Seite end-to-end prüfen — Struktur, Mobile, Konsistenz. (Bens Vision-Check-Pattern: eigener Check + parallele Reviewer.)

**Files:** keine Änderung (Verifikation); Fixes als Folge-Commits.

- [ ] **Step 1: Full-Page-Screenshot Desktop + Mobile**

Dev-Server. Screenshot ganze Seite bei 1440px UND bei 390px (Mobile). Expected: Scrollt sauber Hero→Problem→Story(5 Szenen)→USP→MeetLena→Vertrauen→Angebot→CTA. Mobile: keine überlappenden Elemente, Szenen-Grid bricht sauber auf 1 Spalte um.

- [ ] **Step 2: Checkliste gegen Spec**

Prüfen:
- [ ] Kein „Audit"/„1.490€" mehr auf der Seite
- [ ] Story (5 Szenen) kommt VOR dem Preis
- [ ] Preis = Basis-KI-PA + Module
- [ ] Nav = Scroll-Anker, kein Seitenwechsel
- [ ] Genau ein Primärziel (Erstgespräch), alle CTAs dorthin
- [ ] Video-Slot-Platzhalter vorhanden
- [ ] Keine Browser-Konsolen-Fehler (Babel/JSX)

- [ ] **Step 3: Mobile-Fixes falls nötig**

Falls Step 1 Layout-Brüche zeigt: `kz-szene`-Grid auf Mobile `gridTemplateColumns: '1fr'` via Media-Query in `colors_and_type.css`. Commit als Fix.

- [ ] **Step 4: Aufräumen — .bak-Dateien entfernen**

```bash
rm public/preview/sections.jsx.bak-20260601 public/preview/hero.jsx.bak-20260601
git add -A
git commit -m "chore: remove jsx backups after verified rebuild

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 5: Branch-Status für Merge/Deploy melden**

Run: `git log --oneline main..onepager-ein-tag-mit-lena`
Expected: ~10 saubere Commits. Bereit für Review/Merge + Deploy (Deploy-Weg via kint-operations-autonomy / bestehender Website-Deploy).

---

## Self-Review (gegen Spec)

**Spec-Coverage:**
- §1 Wert-vor-Preis → Task 5 (Story vor Angebot) ✓
- §1 Scroll statt Tabs → Task 6 ✓
- §1 Story statt Demo → Task 3 ✓
- §1 Audit raus → Task 2, 4, 9 ✓
- §1 Basis+Module → Task 4 ✓
- §3 Sektionsstruktur → Task 5 ✓
- §3 5 Szenen → Task 3 ✓
- §4 Single CTA → Task 8 ✓
- §5 Stack bleibt / Wiederverwenden → alle Tasks nutzen bestehende JSX + Bausteine ✓
- §5 Video-Slot → Task 7 ✓
- §5 SEO-Schema Audit raus → Task 2 ✓

**Placeholder-Scan:** Die „Illustration Szene N"-Platzhalter in Task 3 sind ABSICHT (Spec §5: Text+Illu jetzt, echte Illustrationen später). Video-Slot-Platzhalter ebenso (Spec). Keine unbeabsichtigten TODOs.

**Typ-Konsistenz:** `SzeneRow`-Props (`index, time, spoken, result, side`) konsistent zwischen Definition und `EinTagMitLenaSection`-Aufruf. `id="story"` (Task 3) + `id="preis"` (Task 4) matchen die Nav-Anker (Task 6). ✓

**Offen (kein Blocker):** Exakte Basis-Preis-Zahl in Task 4 aus bestehender DESCRIPTION abgeleitet — Umsetzer bestätigt mit Ben falls abweichend.
