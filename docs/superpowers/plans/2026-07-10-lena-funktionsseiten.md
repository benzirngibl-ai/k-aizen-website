# Lena-Funktionsseiten Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jede Lena-Funktion wird eine eigene Mini-Seite (`/funktionen/<slug>`) mit Schmerz-als-Geschichte-Dramaturgie; Musterfunktion „Der verpasste Anruf" komplett, Homepage-Sektion `#ein-tag` wird zum Funktions-Grid, plus Bild-Prompt und LinkedIn-Post-Draft.

**Architecture:** Astro Content-Collection `funktionen` (klont das vorhandene `blog`-Muster in `src/content.config.ts`). Story-Sektionen (Schmerz/Ohne/Mit) = freies Markdown im Body; Mechanik (Quellen/Ablauf/Discord-Mock) = strukturierte Frontmatter; CTA = fest im Template. Homepage-Sektion behält `id="ein-tag"` (Anker wird von `/erstgespraech` + `_shared/LINKS.md` verlinkt!), Inhalt wird Kachel-Grid aus der Collection.

**Tech Stack:** Astro 6.1.9 (SSG), Content-Collections mit glob-Loader + Zod, vorhandene kz-* CSS-Klassen, KaizenLayout.

**Verifikation statt Unit-Tests:** Repo hat kein Test-Framework; eine statische Astro-Site testet man über `npm run build` + gezielte Greps im `dist/`-Output (bewährtes Muster: /termin-Redirect-Verifikation 07-07). Ben-Review erfolgt IMMER am gerenderten Ergebnis (Preview-URL), nie an Dateien.

**Deploy-Vorsicht:** `benzirngibl-ai/k-aizen-website` hat Auto-Deploy via Coolify-Webhook auf Push zu `main` (LINKS.md). Deshalb: Commits pro Task LOKAL, `git push` erst NACH Bens Preview-Freigabe (letzter Task).

**Session-Board:** Vor Task 1 Claim aktualisieren auf: `src/content.config.ts, src/content/funktionen/**, src/pages/funktionen/**, src/pages/index.astro, docs/superpowers/**` + k-aizen-Repo-Dateien (Prompt, LinkedIn-Draft).

---

### Task 1: Content-Collection `funktionen` definieren

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Collection hinzufügen**

In `src/content.config.ts` nach dem `tutorials`-Block einfügen:

```ts
// Lena-Funktionsseiten — 1 Datei pro Funktion (Spec: docs/superpowers/specs/2026-07-07-lena-funktionsseiten-design.md)
// Story-Sektionen (Schmerz/Ohne/Mit) leben als freies Markdown im Body;
// Mechanik (sources/flow/discord) strukturiert, weil das Template sie als Chips/Steps/Mock rendert.
const funktionen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/funktionen' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    schmerzKicker: z.string(), // 1 Satz Schmerz — Kachel-Text + Seiten-Unterzeile
    protagonist: z.enum(['kunde', 'mitarbeiter', 'markus']),
    heroImage: z.string(),
    heroAlt: z.string(),
    reihenfolge: z.number(),
    sources: z.array(z.string()).default([]),
    flow: z.array(z.string()).default([]),
    discord: z
      .object({
        channel: z.string(),
        time: z.string(),
        alert: z.boolean().optional(),
        body: z.string(),
      })
      .optional(),
    draft: z.boolean().default(true),
  }),
});
```

- [ ] **Step 2: Export erweitern**

```ts
export const collections = { blog, tutorials, funktionen };
```

- [ ] **Step 3: Build läuft noch durch (Collection leer = ok)**

Run: `npm run build 2>&1 | tail -3`
Expected: exit 0, kein Schema-Fehler. (Leere Collection ist in Astro 6 kein Fehler.)

- [ ] **Step 4: Commit (lokal, kein Push)**

```bash
git add src/content.config.ts
git commit -m "feat(funktionen): Content-Collection nach blog-Muster"
```

---

### Task 2: Musterfunktion „Der verpasste Anruf" (Content)

**Files:**
- Create: `src/content/funktionen/verpasster-anruf.md`

**Bild-Interim:** `heroImage` zeigt vorerst auf ein EXISTIERENDES Pitch-Asset; getauscht wird nach Bens Bild-Generierung (Task 6). Vor dem Schreiben prüfen, was live liegt:

- [ ] **Step 1: Vorhandene Pitch-Bilder prüfen**

Run: `ls public/pitch/ | head -20`
Expected: Liste mit `12-old-day.png` u.a. Falls `06-waiting.png` existiert → das nehmen (wartende Person passt zur Kundin-Perspektive), sonst `12-old-day.png`.

- [ ] **Step 2: Content-Datei schreiben**

`src/content/funktionen/verpasster-anruf.md` (Interim-Bild ggf. per Step-1-Ergebnis anpassen):

```markdown
---
title: "Der verpasste Anruf"
description: "Was ein nicht angenommener Anruf wirklich kostet — und wie Lena jeden Anruf annimmt, das Anliegen erfasst und mit Kontext übergibt."
schmerzKicker: "18:47 Uhr. Der Auftrag ist vierstellig. Und niemand geht ran."
protagonist: kunde
heroImage: "/pitch/06-waiting.png"
heroAlt: "Kundin wartet mit Telefon am Ohr — niemand nimmt ab"
reihenfolge: 1
sources: ["Telefon", "Kundenliste", "Kalender"]
flow: ["Anruf annehmen — auch um 18:47", "Anliegen + Rückrufnummer erfassen", "Vorgang anlegen + Chef briefen"]
discord:
  channel: "#anrufe"
  time: "18:49"
  body: "📞 **Neuer Anruf angenommen**\n\n👤 Frau Berger · neu\n📱 0171 4…\n\n„Heizung macht seit zwei Tagen Geräusche, bittet um Rückruf — gern vormittags."\n\n✅ Kontakt angelegt · Rückruf-Aufgabe für morgen früh"
draft: false
---

## Donnerstag, 18:47

Die Heizung macht seit zwei Tagen Geräusche. Frau Berger ruft an — nach Feierabend,
weil sie tagsüber selbst im Betrieb steht. Es klingelt. Sechsmal. Dann die Mailbox.
Sie spricht nichts drauf — bei Mailboxen weiß man ja nie, ob die jemand abhört.

Freitagmittag versucht sie es noch einmal: besetzt.

Am Samstag ruft sie den nächsten Betrieb aus der Google-Liste an. Dort geht jemand ran.
Der Auftrag — Austausch, gut vierstellig — ist vergeben.

## Ohne Lena

Montagmorgen im Büro: zwei entgangene Anrufe im Display, unbekannte Nummer, keine
Nachricht. Kein Name, kein Anliegen, kein Rückruf möglich.

Niemand hat etwas falsch gemacht. Um 18:47 war Feierabend. Freitagmittag war die
Leitung belegt, weil das Büro telefonierte. Genau so gehen Aufträge verloren —
lautlos. Der Betrieb erfährt nie, dass es diesen Anruf gab.

## Mit Lena

Gleicher Donnerstag, 18:47. Lena nimmt ab — freundlich, als Assistenz des Betriebs.
Sie fragt nach dem Anliegen, notiert Name und Rückrufnummer und sagt verbindlich zu,
dass sich jemand am nächsten Werktag meldet.

Noch am Abend steht der Vorgang im System: neue Kontaktkarte, das Anliegen in zwei
Sätzen, Wunschzeit für den Rückruf. Freitagmorgen sieht der Chef die Zusammenfassung
beim ersten Kaffee — ein Anruf zurück, Termin vereinbart.

Frau Berger musste nie einen zweiten Betrieb googeln.
```

- [ ] **Step 3: Build prüft Schema**

Run: `npm run build 2>&1 | tail -3`
Expected: exit 0. Bei Zod-Fehler: Frontmatter gegen Task-1-Schema abgleichen.

- [ ] **Step 4: Commit (lokal)**

```bash
git add src/content/funktionen/verpasster-anruf.md
git commit -m "feat(funktionen): Musterfunktion 'Der verpasste Anruf'"
```

---

### Task 3: Detail-Template `/funktionen/[slug]`

**Files:**
- Create: `src/pages/funktionen/[...slug].astro`

**Muster:** klont `src/pages/blog/[...slug].astro` (getStaticPaths + render), Mechanik-Blöcke übernehmen die Optik der `#ein-tag`-Szenen (`kz-source-*`, `kz-flow*`, `kz-discord*` — diese Klassen existieren global durch die Homepage; falls sie in `index.astro` lokal-scoped sind, Styles in diese Datei kopieren — Step 2 prüft das).

- [ ] **Step 1: Template schreiben**

```astro
---
import { getCollection, render } from 'astro:content';
import KaizenLayout from '../../layouts/KaizenLayout.astro';

export async function getStaticPaths() {
  const funktionen = await getCollection('funktionen', ({ data }) => !data.draft);
  return funktionen.map((f) => ({ params: { slug: f.id }, props: { funktion: f } }));
}

const { funktion } = Astro.props;
const { Content } = await render(funktion);
const d = funktion.data;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `${d.title} — Lena-Funktion · k-AIzen`,
  description: d.description,
  isPartOf: { '@id': 'https://k-aizen.de/#website' },
  about: { '@id': 'https://k-aizen.de/ki-pa#service' },
};
---

<KaizenLayout
  title={`${d.title} — was Lena übernimmt`}
  description={d.description}
  path={`/funktionen/${funktion.id}`}
  activeNav="ki-pa"
  jsonLd={jsonLd}
  breadcrumbs={[
    { name: 'Funktionen', href: '/funktionen' },
    { name: d.title, href: `/funktionen/${funktion.id}` },
  ]}
>
  <article class="kz-page">
    <div class="kz-page-eyebrow">
      <img src="/animations/claude-design/logo-mark.png" alt="" class="kz-mark" />
      <span>Lena-Funktion</span>
    </div>
    <h1 class="kz-h1">{d.title}</h1>
    <p class="kz-lead kz-fn-kicker">{d.schmerzKicker}</p>

    <div class="kz-fn-hero">
      <img src={d.heroImage} alt={d.heroAlt} loading="eager" />
    </div>

    <div class="kz-fn-prose">
      <Content />
    </div>

    <section class="kz-fn-mechanik">
      <h2>So funktioniert's</h2>
      {d.sources.length > 0 && (
        <div class="kz-fn-row">
          <span class="kz-fn-label">Quellen</span>
          <div class="kz-fn-chips">{d.sources.map((s) => <span>{s}</span>)}</div>
        </div>
      )}
      {d.flow.length > 0 && (
        <div class="kz-fn-flow">
          {d.flow.map((step, i) => (
            <div class="kz-fn-step"><span class="kz-fn-num">{i + 1}</span><span>{step}</span></div>
          ))}
        </div>
      )}
      {d.discord && (
        <div class="kz-fn-discord">
          <div class={`kz-fn-discord-head${d.discord.alert ? ' alert' : ''}`}>
            <span class="ch">{d.discord.channel}</span><span> · {d.discord.time}</span>
          </div>
          <div class="kz-fn-discord-body" set:html={d.discord.body.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')} />
        </div>
      )}
    </section>

    <section class="kz-fn-cta">
      <h2>Klingt nach Ihrem Betrieb?</h2>
      <p>30 Minuten, kostenlos, unverbindlich: Wir schauen gemeinsam, ob und wo das bei Ihnen trägt. Wenn nicht, ist auch das eine klare Antwort.</p>
      <div class="kz-fn-cta-row">
        <a href="/erstgespraech" class="kz-btn">Erstgespräch vereinbaren</a>
        <a href="/funktionen" class="kz-btn kz-btn-ghost">← Alle Funktionen</a>
      </div>
    </section>
  </article>

  <style>
    .kz-fn-kicker { font-style: italic; }
    .kz-fn-hero { margin: 40px 0 56px; border-radius: 12px; overflow: hidden; }
    .kz-fn-hero img { width: 100%; height: auto; display: block; }
    .kz-fn-prose { font-family: var(--font-sans); font-size: 18px; line-height: 1.7; max-width: 720px; }
    .kz-fn-prose :global(h2) { font-family: var(--font-display); font-size: clamp(26px, 3vw, 34px); margin: 56px 0 16px; line-height: 1.2; }
    .kz-fn-prose :global(p) { margin: 0 0 20px; }
    .kz-fn-mechanik { margin-top: 72px; padding: 32px; background: var(--kz-cream-deep); color: var(--fg-inverse); border-radius: 12px; }
    .kz-fn-mechanik h2 { font-family: var(--font-display); font-size: clamp(22px, 2.4vw, 28px); margin: 0 0 20px; }
    .kz-fn-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .kz-fn-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(31,41,51,0.6); }
    .kz-fn-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .kz-fn-chips span { padding: 4px 12px; border-radius: 999px; background: rgba(255,255,255,0.6); border: 1px solid rgba(232,90,43,0.18); font-size: 13px; }
    .kz-fn-flow { display: grid; gap: 10px; margin: 20px 0; }
    .kz-fn-step { display: flex; gap: 12px; align-items: baseline; font-size: 15px; }
    .kz-fn-num { width: 22px; height: 22px; border-radius: 50%; background: var(--accent, #e85a2b); color: #fff; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; flex: none; }
    .kz-fn-discord { margin-top: 24px; border-radius: 10px; background: #2b2d31; color: #dbdee1; font-size: 14px; overflow: hidden; max-width: 480px; }
    .kz-fn-discord-head { padding: 10px 16px; background: #1e1f22; font-size: 12px; color: #949ba4; }
    .kz-fn-discord-head.alert { color: #f0b132; }
    .kz-fn-discord-head .ch { font-weight: 600; }
    .kz-fn-discord-body { padding: 14px 16px; line-height: 1.55; }
    .kz-fn-cta { margin-top: 72px; padding: 48px clamp(24px, 4vw, 40px); background: var(--kz-cream-deep); color: var(--fg-inverse); border-radius: 12px; }
    .kz-fn-cta h2 { font-family: var(--font-display); margin: 0 0 12px; }
    .kz-fn-cta p { max-width: 560px; margin: 0 0 24px; }
    .kz-fn-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
  </style>
</KaizenLayout>
```

- [ ] **Step 2: Build + dist-Verifikation**

Run: `npm run build 2>&1 | tail -3 && ls dist/funktionen/ && grep -c "Der verpasste Anruf" dist/funktionen/verpasster-anruf/index.html`
Expected: exit 0 · Ordner `verpasster-anruf/` existiert · grep ≥ 1.
Falls kz-btn/kz-Klassen fehlen (Seite unstyled bei Preview): global.css prüfen — Klassen sind laut erstgespraech.astro/blog global verfügbar.

- [ ] **Step 3: Commit (lokal)**

```bash
git add "src/pages/funktionen/[...slug].astro"
git commit -m "feat(funktionen): Detail-Template mit 5-Sektionen-Dramaturgie"
```

---

### Task 4: Übersichtsseite `/funktionen`

**Files:**
- Create: `src/pages/funktionen/index.astro`

**Muster:** klont `src/pages/blog/index.astro` (Card-Grid), Kachel = schmerzKicker (fett, Hook) + title + Thumb.

- [ ] **Step 1: Seite schreiben**

```astro
---
import KaizenLayout from '../../layouts/KaizenLayout.astro';
import { getCollection } from 'astro:content';

const funktionen = (await getCollection('funktionen'))
  .filter((f) => !f.data.draft)
  .sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
---

<KaizenLayout
  title="Funktionen — was Lena im Betrieb übernimmt"
  description="Jede Funktion eine echte Alltagssituation: was ohne Assistenz schiefgeht und wie Lena sie löst. Telefon, Mail, Termine, Belege — Stück für Stück."
  path="/funktionen"
  activeNav="ki-pa"
>
  <article class="kz-page">
    <div class="kz-page-eyebrow">
      <img src="/animations/claude-design/logo-mark.png" alt="" class="kz-mark" />
      <span>Funktionen</span>
    </div>
    <h1 class="kz-h1">Was Lena im Betrieb übernimmt.</h1>
    <p class="kz-lead">
      Keine Feature-Liste. Jede Funktion ist eine Situation, die es in kleinen Betrieben
      wirklich gibt — erst wie sie schiefgeht, dann wie Lena sie löst.
    </p>

    {funktionen.length === 0 ? (
      <p class="kz-fn-empty">Die ersten Funktionsseiten entstehen gerade. Bald hier.</p>
    ) : (
      <section class="kz-fn-list">
        {funktionen.map((f) => (
          <a href={`/funktionen/${f.id}`} class="kz-fn-card">
            <div class="kz-fn-thumb"><img src={f.data.heroImage} alt={f.data.heroAlt} loading="lazy" /></div>
            <div class="kz-fn-card-body">
              <p class="kz-fn-card-kicker">{f.data.schmerzKicker}</p>
              <h2 class="kz-fn-card-title">{f.data.title}</h2>
              <span class="kz-fn-card-more">Ansehen →</span>
            </div>
          </a>
        ))}
      </section>
    )}
  </article>

  <style>
    .kz-fn-empty { font-family: var(--font-sans); font-size: 17px; color: var(--fg-muted); margin-top: 32px; }
    .kz-fn-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-top: 40px; }
    .kz-fn-card { display: block; text-decoration: none !important; color: var(--fg); background: var(--kz-cream-deep, #ede5d4); border: 1px solid var(--kz-border); border-radius: 12px; overflow: hidden; transition: transform 220ms var(--ease-out), box-shadow 220ms var(--ease-out); }
    .kz-fn-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(31, 41, 51, 0.08); }
    .kz-fn-thumb img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }
    .kz-fn-card-body { padding: 24px; }
    .kz-fn-card-kicker { font-family: var(--font-display); font-style: italic; font-size: 17px; margin: 0 0 8px; color: var(--fg-inverse); }
    .kz-fn-card-title { font-family: var(--font-display); font-size: 22px; margin: 0 0 12px; color: var(--fg-inverse); }
    .kz-fn-card-more { font-size: 14px; color: var(--accent, #e85a2b); font-weight: 600; }
  </style>
</KaizenLayout>
```

- [ ] **Step 2: Build + dist-Verifikation**

Run: `npm run build 2>&1 | tail -3 && grep -c "verpasster-anruf" dist/funktionen/index.html`
Expected: exit 0 · grep ≥ 1 (Kachel verlinkt auf die Detail-Seite).

- [ ] **Step 3: Commit (lokal)**

```bash
git add src/pages/funktionen/index.astro
git commit -m "feat(funktionen): /funktionen Uebersicht als Kachel-Grid"
```

---

### Task 5: Homepage-Sektion `#ein-tag` → Funktions-Grid

**Files:**
- Modify: `src/pages/index.astro` (szenen-Array Zeilen ~21–75, Sektion ~583–640, Nav-Link ~349)

**KRITISCH:** `id="ein-tag"` MUSS erhalten bleiben — `/erstgespraech` (Pre-Read-Button „Tagesbeispiel ansehen") und `_shared/LINKS.md` verlinken `/#ein-tag`. Nur der INHALT der Sektion wird getauscht.

- [ ] **Step 1: Collection-Import + Daten laden**

Am Anfang des Frontmatter-Blocks von `index.astro`:

```ts
import { getCollection } from 'astro:content';

const funktionenListe = (await getCollection('funktionen'))
  .filter((f) => !f.data.draft)
  .sort((a, b) => a.data.reihenfolge - b.data.reihenfolge)
  .slice(0, 6);
```

- [ ] **Step 2: szenen-Array entfernen**

Das komplette `const szenen = [ … ];`-Array (~Z. 21–75) löschen. Vorher: `grep -n "szenen" src/pages/index.astro` — ALLE Verwendungen müssen mit raus (Array + `.map` in der Sektion).

- [ ] **Step 3: Sektion-Inhalt tauschen**

Die Sektion `<section class="kz-section" id="ein-tag">` (~Z. 584–640) ersetzen durch:

```astro
<!-- 5.5 — FUNKTIONEN (ehem. Ein Tag mit Lena; Anker #ein-tag bleibt — extern verlinkt!) -->
<section class="kz-section" id="ein-tag">
  <div class="kz-wrap">
    <span class="kz-eyebrow kz-reveal">Funktionen</span>
    <h2 class="kz-h2 kz-reveal" data-delay="1">Was Lena im Betrieb übernimmt.</h2>
    <p class="kz-lead kz-reveal" data-delay="2">
      Keine Feature-Liste. Jede Funktion ist eine Situation, die es in kleinen Betrieben wirklich
      gibt — erst wie sie ohne Assistenz schiefgeht, dann wie Lena sie löst. Mit Freigaben,
      nicht auf Autopilot.
    </p>

    <div class="kz-fn-home-grid">
      {funktionenListe.map((f) => (
        <a href={`/funktionen/${f.id}`} class="kz-fn-home-card kz-reveal">
          <img src={f.data.heroImage} alt={f.data.heroAlt} loading="lazy" />
          <div class="kz-fn-home-body">
            <p class="kz-fn-home-kicker">{f.data.schmerzKicker}</p>
            <h3>{f.data.title}</h3>
          </div>
        </a>
      ))}
    </div>

    <div class="kz-fn-home-more kz-reveal">
      <a href="/funktionen" class="kz-btn">Alle Funktionen ansehen →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Styles ergänzen + tote Styles prüfen**

In den `<style>`-Block von `index.astro` (bzw. ans Ende, falls global.css):

```css
.kz-fn-home-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-top: clamp(32px, 5vw, 56px); }
.kz-fn-home-card { display: block; text-decoration: none !important; color: var(--fg); background: var(--kz-cream-deep, #ede5d4); border: 1px solid var(--kz-border); border-radius: 12px; overflow: hidden; transition: transform 220ms var(--ease-out), box-shadow 220ms var(--ease-out); }
.kz-fn-home-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(31,41,51,0.08); }
.kz-fn-home-card img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }
.kz-fn-home-body { padding: 20px 24px; }
.kz-fn-home-kicker { font-family: var(--font-display); font-style: italic; font-size: 16px; margin: 0 0 6px; }
.kz-fn-home-body h3 { font-family: var(--font-display); font-size: 20px; margin: 0; }
.kz-fn-home-more { margin-top: 32px; }
```

Dann: `grep -n "kz-day\|kz-scene\|kz-source-\|kz-flow\|kz-discord" src/pages/index.astro src/styles/*.css` — nur noch UNGENUTZTE lokale Styles der alten Timeline entfernen (globale Styles, die andere Seiten nutzen könnten, stehen lassen).

- [ ] **Step 5: Nav-Label prüfen**

`grep -n "ein-tag" src/pages/index.astro` — der Nav-Link „Ein Tag mit Lena" (~Z. 349) → Label auf `Funktionen` ändern, href `#ein-tag` bleibt.

- [ ] **Step 6: Build + Verifikation**

Run: `npm run build 2>&1 | tail -3 && grep -c 'id="ein-tag"' dist/index.html && grep -c "funktionen/verpasster-anruf" dist/index.html && grep -c "kz-scene" dist/index.html`
Expected: exit 0 · `id="ein-tag"` = 1 · Funktions-Link ≥ 1 · kz-scene = 0 (alte Timeline weg).

- [ ] **Step 7: Commit (lokal)**

```bash
git add src/pages/index.astro
git commit -m "feat(homepage): #ein-tag wird Funktions-Grid (Anker bleibt erhalten)"
```

---

### Task 6: Bild-Prompt „Kundin am Telefon" (k-aizen-Repo, nicht Website)

**Files:**
- Create: `../../00-blueprints/visual-style-library/IMAGE-PROMPTS-funktionsseiten.md` (relativ zum Website-Repo; absolut: `k-aizen/00-blueprints/visual-style-library/`)

- [ ] **Step 1: Prompt-Datei schreiben** (Master-Stil aus Memory `k-aizen-visual-style` — cream-beige #F5F0E8, ember orange #FF5500, warm premium comic)

```markdown
# Image-Prompts — Funktionsseiten

> Stil-Quelle: Pitch-Deck Premium-Comic (Memory `k-aizen-visual-style`).
> Generierung: ChatGPT Image · 16:9 für Seiten-Hero · 1:1 zusätzlich für LinkedIn.
> Nach Generierung: PNG nach `website/site/public/funktionen/<slug>.png`, `heroImage` im Content-File umstellen.

## verpasster-anruf — Hero (16:9)

Modern editorial illustration in a warm, premium comic style. Clean confident linework,
soft warm shading with subtle gradients, limited color palette: cream-beige background
(#F5F0E8), ember orange accents (#FF5500), dark warm brown (#1a1a1a) for inks. Inspired
by Linear and Pitch.com illustrations but with more personality, warmth and depth.
Stylized, NOT photorealistic. Cinematic lighting, slight grain texture. Professional,
premium feel. No text or UI overlays in the image. 16:9 aspect ratio.

Scene: A woman in her late 30s, small-business owner energy (practical blouse, hair
tied back), standing in her kitchen in the early evening, phone pressed to her ear,
waiting — visibly on hold, slightly annoyed, one hand on her hip. Warm evening light
through a window. On the counter: a kettle and a folded note. The mood: "I'm trying
to give someone my business and nobody picks up." Composition rule of thirds, character
slightly off-axis.

## verpasster-anruf — LinkedIn (1:1)

Same character, same style as above ("same character as previous image"), tighter crop:
close on the woman lowering the phone from her ear, looking at the screen — call ended,
nobody answered. Subtle ember-orange glow from the phone screen. 1:1 aspect ratio.
```

- [ ] **Step 2: Commit im k-aizen-Repo** (separates Repo!)

```bash
cd ../.. && git add 00-blueprints/visual-style-library/IMAGE-PROMPTS-funktionsseiten.md && git commit -m "Image-Prompts Funktionsseiten: Kundin-am-Telefon (verpasster-anruf)" && cd website/site
```

---

### Task 7: LinkedIn-Post-Draft (k-aizen-Repo)

**Files:**
- Create: `k-aizen/10-sales/linkedin-drafts/funktion-01-verpasster-anruf.md`

- [ ] **Step 1: Draft schreiben** (Regeln: Hook Zeile 1 · KEIN Link im Body · Link in ersten Kommentar · kein Prozent-Versprechen · ruhig-direkt, keine Buzzwords)

```markdown
# LinkedIn-Post · Funktion 01 · Verpasster Anruf

**Status:** DRAFT — Bild fehlt noch (1:1-Variante aus IMAGE-PROMPTS-funktionsseiten.md)
**Kanal:** Ben persönlich · Standbein 2 (Funktions-Serie)
**Bild:** Kundin senkt Telefon, niemand ging ran (1:1)

---

18:47 Uhr. Der Auftrag ist vierstellig. Und niemand geht ran.

Frau Berger ruft einen Handwerksbetrieb an, nach Feierabend —
tagsüber steht sie selbst im Laden.

Es klingelt. Sechsmal. Mailbox. Sie spricht nichts drauf.

Freitag: besetzt.
Samstag: ruft sie den nächsten Betrieb aus der Google-Liste an.

Der Auftrag ist weg. Und das Bittere daran:
Der erste Betrieb erfährt nie, dass es diesen Anruf gab.
Im Display steht Montag nur „2 entgangene Anrufe, unbekannte Nummer".

Niemand hat etwas falsch gemacht. Um 18:47 ist eben Feierabend.

Genau für diese Momente baue ich eine KI-Assistenz für kleine
Betriebe: Sie nimmt ab — auch um 18:47. Fragt nach dem Anliegen,
notiert Name und Nummer, und der Chef sieht morgens beim ersten
Kaffee eine kurze Zusammenfassung. Ein Rückruf, Termin steht.

Kein Callcenter. Keine Warteschleife. Nur: es geht jemand ran.

Wie viele Anrufe verpasst euer Betrieb pro Woche — ehrlich geschätzt?

---

**Erster Kommentar (nach dem Posten):**
Wie das im Detail funktioniert, habe ich hier aufgeschrieben:
https://k-aizen.de/funktionen/verpasster-anruf
```

- [ ] **Step 2: Commit im k-aizen-Repo**

```bash
cd "/Users/zirngibl/zirngibl/KÜNSTLICHE INTELLIGENZ/k-aizen" && git add 10-sales/linkedin-drafts/funktion-01-verpasster-anruf.md && git commit -m "LinkedIn-Draft Funktion 01: Verpasster Anruf"
```

---

### Task 8: Preview → Ben-Review → Push/Deploy

- [ ] **Step 1: Lokale Preview starten** (Ben reviewt GERENDERT, nie Dateien)

Run: `npm run preview -- --port 4321` (im Hintergrund) → Ben öffnet:
- `http://localhost:4321/funktionen/verpasster-anruf` (Musterseite)
- `http://localhost:4321/funktionen` (Übersicht)
- `http://localhost:4321/#ein-tag` (Homepage-Grid — Achtung: mit nur 1 Funktion wirkt das Grid sparsam; Bens Call: so live ODER Homepage-Task zurückhalten bis ≥3 Funktionen)

- [ ] **Step 2: Bens Verdikt einholen** — Änderungen einarbeiten, zurück zu Step 1.

- [ ] **Step 3: Nach Freigabe: Push (löst Auto-Deploy aus)**

```bash
git push origin main
```

- [ ] **Step 4: Live-Verifikation (Muster /termin-Check)**

Run (nach ~2 Min): `curl -s -m 8 -o /dev/null -w "%{http_code}\n" https://k-aizen.de/funktionen/verpasster-anruf && curl -s https://k-aizen.de/funktionen/verpasster-anruf | grep -c "Der verpasste Anruf"`
Expected: `200` · grep ≥ 1. Falls 404 nach 5 Min: Coolify manuell triggern (Tailscale-Muster, access.md Z. 186ff).

- [ ] **Step 5: LINKS.md ergänzen** (`_shared/LINKS.md`, Konversions-Punkte): Zeile für `https://k-aizen.de/funktionen` + Hinweis, dass `/#ein-tag` jetzt das Funktions-Grid ist.

- [ ] **Step 6: Session-Board `done` + Blueprint-Hinweis**: neue Funktion hinzufügen = nur neue md-Datei — als Einzeiler in `k-aizen/blueprints-tech/` vermerken? NEIN — steht schon in der Spec; kein Doppel. Board-Eintrag abschließen.

---

## Nach diesem Plan (bewusst NICHT enthalten — YAGNI)

- Weitere Funktionen (Anruf-Briefing, Angebot-Nachfassen, WhatsApp-Empfang, …) = je 1 neue Content-Datei + 1 Bild + 1 Post-Draft. Kein Code.
- Bild-Tausch verpasster-anruf: sobald Ben generiert hat → PNG nach `public/funktionen/`, `heroImage` ändern, commit, push.
- OG-Images pro Funktionsseite (Social-Preview) — erst wenn die Serie läuft.
