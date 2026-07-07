# Lena-Funktionsseiten + LinkedIn-Standbein — Design

**Datum:** 2026-07-07
**Autor:** Ben + Claude
**Status:** Entwurf zur Freigabe

---

## Idee in einem Satz

Statt der einen langen „Ein Tag mit Lena"-Story wird **jede Lena-Funktion eine eigene Mini-Seite**, die eine kleine, packende Geschichte erzählt (Schmerz → Lösung) — und dieselben Funktionen werden das **zweite LinkedIn-Standbein** neben dem Introvert-Vertrieb.

Herkunft: aus einem Podcast abgeleitet (Ben, 2026-07-07). Kern-Insight: Menschen kaufen keine Feature-Liste, sie erkennen sich in einer Geschichte wieder.

---

## Warum (der Wert)

- **Funnel-Tiefe:** Aus einer Übersichts-Sektion werden N einzelne, indexierbare Seiten — jede rankt auf ein konkretes Problem („niemand geht ans Telefon nach Feierabend"), das genau die Suchintention eines KMU-Chefs trifft.
- **Zwei Standbeine, geteilte Substanz:** Jede Funktion existiert als Website-Seite (SEO/Funnel) *und* als LinkedIn-Post (Reach). Die inhaltliche Arbeit — das Szenario finden, den Schmerz fühlbar machen — passiert einmal.
- **Passt zum Ton:** Die Geschichte verkauft, nicht der Claim. Deckt sich mit der Anti-Überversprechen-Regel und dem ehrlichen Introvert-Winkel.

---

## Die zwei Bausteine

### Baustein 1 — Website: Funktionsseiten (Astro Content-Collection)

**Struktur:** Neue Content-Collection `funktionen`, exakt dem vorhandenen `blog`/`tutorials`-Muster folgend (`src/content.config.ts`, `glob`-Loader, Zod-Schema). Jede Funktion = eine `.md`/`.mdx`-Datei unter `src/content/funktionen/`. Eine dynamische Route `src/pages/funktionen/[...slug].astro` rendert alle. Übersichtsseite unter `src/pages/funktionen/index.astro` (bzw. die umgebaute Homepage-Sektion) listet alle Funktionen als Kacheln.

**URL-Schema:** `k-aizen.de/funktionen/<slug>` (z.B. `/funktionen/verpasster-anruf`).

**Neue Funktion hinzufügen = neue Datei anlegen.** Kein Code. Das ist der Kern-Vorteil.

#### Fester Seiten-Aufbau (gleiches Gerüst für alle, nur Inhalt+Bilder wechseln)

1. **Der Schmerz** — als **Mini-Geschichte**, nicht als These. Wechselnder Protagonist:
   - die Kundin, die um 18:47 dreimal anruft und niemand rangeht (Feierabend) → geht zum Wettbewerber;
   - der Mitarbeiter, der die Rückrufnotiz verschludert;
   - die Kundenbeschwerde per Mail, die drei Tage liegen bleibt;
   - Markus selbst, der nicht mehr weiß, worum es beim letzten Kontakt ging.
   **Erzählt aus der Perspektive, die den Schmerz am fühlbarsten macht.** Kreativ, nicht schematisch. Illustration passend zur Perspektive (nicht immer Markus).
2. **Ohne Lena** — das Szenario läuft schief. Die konkrete Konsequenz (verlorener Auftrag, verärgerter Kunde, Chaos).
3. **Mit Lena** — dasselbe Szenario, gelöst. Schritt für Schritt, ruhig, konkret.
4. **So funktioniert's** — kurz die Mechanik: welche Quellen, welcher Ablauf. Nutzt die schon existierenden Bausteine der „Ein Tag"-Sektion (`sources`-Chips, `flow`-Steps).
5. **CTA** — weicher Übergang ins Erstgespräch → Button auf `/termin` (oder `/erstgespraech`).

#### Content-Schema (Zod, Vorschlag — final beim Bauen)

```
title: string              # "Verpasster Anruf"
slug: string (via Dateiname)
description: string        # SEO / OG
schmerz_kicker: string     # 1 Satz Schmerz für Kachel + <title>
protagonist: enum          # kunde | mitarbeiter | markus | ... (steuert evtl. Bild-Auswahl)
hero_image: string         # Pfad zum Comic-Bild
reihenfolge: number        # Sortierung in der Übersicht
draft: boolean (default true)
```
Body (Markdown) trägt die 5 Sektionen. Ob die Sektionen freies Markdown sind oder strukturierte Frontmatter-Felder → **Entscheidung beim Bauen** (Empfehlung: Markdown mit Konvention, maximale erzählerische Freiheit; strukturierte Felder nur für „So funktioniert's" sources/flow).

#### Homepage-Änderung

Die bestehende Sektion `#ein-tag` („Ein Tag mit Lena", `index.astro` ~Z. 583) wird **zur Funktions-Übersicht umgebaut**: kompaktes Kachel-Grid, jede Kachel = ein Schmerz-Kicker + Bild → verlinkt auf die Mini-Seite. Die Tages-Story-Substanz verteilt sich auf die einzelnen Funktionsseiten.

### Baustein 2 — LinkedIn: eigenständige native Posts

**Beziehung Post ↔ Seite:** entkoppelt. Der Post wird **LinkedIn-nativ** getextet (nicht Seiten-Zusammenfassung), erzählt die Mini-Geschichte fürs Feed. Die Funktionsseite ist die optionale Vertiefung.

**Regeln (aus LINKEDIN-PLAYBOOK.md + Brain):**
- **Kein externer Link im Post-Body** (Reach-Killer) → Link auf die Funktionsseite in den **ersten Kommentar** oder weglassen.
- Hook in Zeile 1 (Curiosity-Gap / konkrete Szene), kein „Heute erkläre ich…".
- Comic-Bild als Visual (vorhandene Markus-Assets, siehe unten).
- Zweites Standbein **neben** Introvert-Vertrieb — nicht ersetzend.

**Ablage:** LinkedIn-Post-Entwürfe unter `k-aizen/10-sales/linkedin-drafts/` (Ordner existiert bereits). Ein Draft pro Funktion, benannt nach Slug.

---

## Vorhandene Assets (Wiederverwendung, kein Neubau)

- **Comic-Stil** steht: „Pitch-Deck Premium-Comic" (siehe Memory `k-aizen-visual-style`), Master-Prompt + Charakter-Sheets für Markus/Lena vorhanden.
- **16 Markus-Comic-Bilder** liegen in `public/_pitch-archive/markus/` — u.a. `03-car.png` (unterwegs), `04-postcall.png` (nach Anruf), `12-old-day.png` (altes Chaos). Für „Verpasster Anruf" wahrscheinlich schon nutzbar oder nahe dran; fehlende Perspektiven (Kundin am Telefon) → neue Prompts nach dem Master-Rezept.
- **Lena-Bilder** in `public/animations/claude-design/` (headshot, hero, cockpit, coffee).
- **„Ein Tag"-Sektion** liefert die Mechanik-Bausteine (sources/flow/discord) als Vorlage.

---

## Erste Funktion (Musterseite + erster Post)

**Verpasster-Anruf-Fang.**
- Schmerz-Geschichte (Vorschlag): Kundin ruft nach Feierabend an, niemand geht ran, sie ruft beim Nächsten an. ODER: Markus auf der Baustelle, Telefon klingelt ins Leere.
- Mit Lena: nimmt eingehende Anrufe an, qualifiziert, hält den Lead warm, briefet Markus.
- **Rechtlicher Guard:** nur **eingehende** Anrufe (Kunde ruft an) — nie Voice-Bot-Outbound (§7 II UWG). Diese Regel gilt für alle Telefon-Funktionen.

Diese eine Funktion wird komplett durchgebaut als **Template-Beweis** für alle weiteren.

---

## Scope / YAGNI

**In Scope (erster Bau):**
- `funktionen`-Content-Collection + Schema + dynamische Route + Übersichtsseite.
- **Eine** vollständige Musterfunktion (Verpasster Anruf) inkl. Text + Bild.
- Homepage-Sektion `#ein-tag` → Funktions-Übersicht umbauen.
- **Ein** LinkedIn-Post-Draft zur Musterfunktion.

**Nicht in Scope (später, pro Funktion wiederholbar):**
- Die restlichen Funktionen (Anruf-Briefing, Angebot-Nachfassen, Mail-Triage, …) — kommen als eigene Dateien, sobald das Template steht.
- Automatische Post-Generierung aus Seiten-Daten (bewusst verworfen: Posts sind eigenständig).
- Bild-Produktion für alle Funktionen auf einmal.

---

## Offene Punkte (beim Bauen entscheiden)

1. Sektionen als freies Markdown vs. strukturierte Frontmatter-Felder (Empfehlung: Markdown + Konvention).
2. CTA-Ziel der Funktionsseiten: `/termin` (direkt buchen) oder `/erstgespraech` (Kontext-Landing). Tendenz: `/erstgespraech`, konsistent zum Mail-Funnel.
3. Braucht „Verpasster Anruf" ein neues Comic-Bild (Kundin am Telefon) oder reicht ein vorhandenes Markus-Asset?
4. Übersicht: eigene Seite `/funktionen` UND umgebaute Homepage-Sektion, oder Homepage-Sektion verlinkt nur auf `/funktionen`?

---

## Baureihenfolge (Vorschau, Details im Implementierungsplan)

1. `funktionen`-Collection in `content.config.ts` (klont `blog`-Muster).
2. `src/content/funktionen/verpasster-anruf.md` — die Musterfunktion (Text).
3. `src/pages/funktionen/[...slug].astro` — Template mit dem 5-Sektionen-Aufbau (klont `blog/[...slug].astro`).
4. `src/pages/funktionen/index.astro` — Übersicht (Kacheln).
5. Homepage `#ein-tag` → Funktions-Übersicht umbauen.
6. Bild für Verpasster Anruf (vorhandenes Asset prüfen / neuen Prompt).
7. `k-aizen/10-sales/linkedin-drafts/verpasster-anruf.md` — erster Post.
8. Build verifizieren, committen, deployen (Coolify via Tailscale, Muster steht).
