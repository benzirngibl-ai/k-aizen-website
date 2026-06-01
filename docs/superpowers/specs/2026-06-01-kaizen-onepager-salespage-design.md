# k-aizen.de — One-Page Sales-Page „Ein Tag mit Lena" — Design-Spec

**Datum:** 2026-06-01
**Status:** Erste Version, von Ben freigegeben (Struktur). Spec → Plan → Umsetzung.
**Repo:** `k-aizen/website/site/` (Astro 6 + React 19 + Tailwind)

---

## 1. Ziel & Strategie

Eine fokussierte **Direct-Response One-Page Sales-Seite** für EIN Produkt: den **KI-PA**.
Ersetzt die heutige Multi-Sektions-Startseite (`src/pages/index.astro`, `#root`-React-App).

**Kernprinzipien (Ben-Entscheidungen 2026-06-01):**
- **Ein Produkt, eine Entscheidung, ein CTA** — klassischer One-Pager statt Tab-Navigation.
- **Wert VOR Preis** — Preis ist sichtbar/ehrlich (Marken-DNA), steht aber UNTEN nach dem Wert.
- **Scroll statt Tabs** — der Besucher wird durch EINE Geschichte geführt (kontrollierte Reihenfolge), Nav-Links sind nur Scroll-Anker, keine Seitenwechsel.
- **Story statt Demo** — kein fragiles Live-Produkt, sondern ein erzählter „Tag mit Lena". Löst das „Demo funktioniert nicht zuverlässig"-Problem.
- **Remote/Homeoffice-Positionierung** — KI-PA wird remote eingerichtet+betreut. **Discovery-Audit (1.490€) fällt RAUS** (kein Vor-Ort-Geschäft mehr).
- **Basis + Module** — KI-PA als Kernprodukt, Module dazubuchbar (skalierbar, wächst mit).

**Was NICHT verkauft wird:** k-AIzen OS (das Dashboard im Bau) ist hier NICHT das Produkt. Diese Seite verkauft die KI-PA. (k-AIzen OS kommt später / separat.)

---

## 2. Gewählter Ansatz

**Ansatz B — „Resequence + neue Hero/Story":**
- Hero + Story-Sektion werden NEU & stark gebaut (= die conversion-entscheidenden ersten Sektionen).
- Bestehende gute Teile (Vertrauen-Sektion, Lena-Chatbot, Brand-Style, Festpreis-Transparenz) werden umsortiert + vom Audit befreit, NICHT neu erfunden.
- Begründung: Hero + Story entscheiden ~80% der Conversion → dort lohnt Neubau; der Rest ist inhaltlich schon markenkonform.

Verworfen: Ansatz A (nur umsortieren — zu wenig Wirkung im Hero), Ansatz C (Full Relaunch — zu viel Aufwand, wirft Funktionierendes weg).

---

## 3. Seitenstruktur (Scroll, oben → unten)

```
1. HERO
   - Emotionaler Ein-Satz-Hook (Richtung: "Ihr Mitarbeiter, der nie etwas
     vergisst, nie krank wird, um 3 Uhr nachts ans Telefon geht")
   - Sub: KI-PA, remote eingerichtet, DSGVO, EU-Server in Deutschland
   - ▶ VIDEO-SLOT reserviert (Auto/Handy-Moment — Text+Illu zum Launch,
     Video später via Higgsfield/Seedance, Skript folgt)
   - CTA: "Erstgespräch buchen"

2. HOOK / PROBLEM (kurz)
   - "Sie sitzen im Auto. Ihnen fällt etwas ein. Bis Sie im Büro sind,
     ist es weg." → macht es persönlich, setzt die Szene

3. EIN TAG MIT LENA  ← HERZSTÜCK, 5 scrollende Szenen
   Szene 1 — Auto:      reinsprechen ("Herr Meier, seine Frau mag rote Rosen")
   Szene 2 — 6 Monate:  Lena erinnert: "Frau Meier hat Geburtstag, rote Rosen"
   Szene 3 — Inbox:     Mails kommen → automatisch sortiert
   Szene 4 — Dashboard: Rechnung → KI-Antwort-Vorschau → Chef drückt Approve → raus
   Szene 5 — Social:    Foto ins Dashboard → Sekunden später auf Instagram+Facebook
   - Je Szene: Text + Illustration/Chat-Bubble/Mockup (zum Launch)
   - Jede Szene verkauft eine Fähigkeit als GELEBTE Situation, nicht als Feature

4. WARUM k-AIzen (USPs, kurz)
   - DSGVO · EU-Server Deutschland · echte KI · kein US-Tool · remote eingerichtet

5. VERTRAUEN / PROOF
   - Bestehende "Vertrauen"-Sektion + Lena-Chatbot bleiben (umsortiert)

6. DAS ANGEBOT (Preis — erst HIER)
   - Basis: KI-PA [Kernpreis, abgeleitet aus Tier 1 ~10.299€ Setup + Retainer]
   - + Module dazubuchbar: Voice-Empfangsdame (9.999€), Concierge-Upgrade,
     (weitere folgen)
   - Festpreis, transparent. KEIN Audit mehr.

7. CTA (Wiederholung)
   - "Erstgespräch buchen" — ein Ziel, ein Button
```

**Sticky-Nav:** Logo links, CTA-Button rechts, Mitte = Scroll-Anker (`#story`, `#preis`). KEINE Seitenwechsel-Tabs.

---

## 4. Single CTA

Das einzige Ziel der gesamten Seite: **„Erstgespräch buchen"**.
Kein konkurrierendes Zweitziel (kein Newsletter, kein Audit-Funnel). Jeder CTA-Button auf der Seite führt zum selben Ziel (vermutlich `erstgespraech.astro` / Kalender-Booking).

---

## 5. Technische Leitplanken

- **Stack bleibt:** Astro 6 + React 19 + Tailwind. Kein Framework-Wechsel.
- **`index.astro`** wird die neue One-Page-Sales-Seite (ersetzt die alte `#root`-Struktur bzw. baut sie um).
- **Wiederverwenden:** Lena-Chatbot-Komponente, Brand-Style/Visual-Sprache (k-aizen visual style), bestehende Festpreis-Copy, SEO-Schema (Tiers — Audit-Offer entfernen).
- **Bestehende Seiten** (`pricing.astro`, `katalog.astro`, `ki-pa.astro`, `audit.astro`): NICHT Teil dieses Umbaus. `audit.astro` ggf. später deaktivieren/depriorisieren (Audit-Geschäft eingestellt) — NICHT in diesem Scope löschen.
- **SEO-Schema:** Audit-Offer aus dem JSON-LD in `index.astro` entfernen, da Audit nicht mehr verkauft wird.
- **Video-Slot:** als Komponente mit Platzhalter (Poster-Bild/Illustration) bauen, sodass später nur die Video-Quelle eingesetzt wird, ohne Layout-Umbau.

---

## 6. Bewusst NICHT in dieser Version (YAGNI / später)

- **Video-Produktion** — Slot reserviert, Video kommt später (Higgsfield/Seedance + Skript).
- **k-AIzen OS** als Produkt auf dieser Seite.
- **Live-Produkt-Demo** — durch erzählte Story ersetzt.
- **Discovery-Audit** — Geschäftsmodell eingestellt, raus aus der Seite.
- **A/B-Testing, Analytics-Funnel-Tracking** — nicht Teil v1.

---

## 7. Offene Punkte für die Umsetzungsphase (kein Blocker fürs Design)

- Finale Hero-Headline-Copy (Richtung freigegeben, exakte Worte im Plan).
- Genauer Basis-Kernpreis (aus Tier-1-Logik ableiten, mit Ben final bestätigen).
- Welche Illustrationen/Mockups pro Szene (Brand-Style-konform erzeugen).
- CTA-Ziel-URL (Erstgespräch-Booking) bestätigen.

---

## 8. Erfolgskriterium

Eine Besucherin/ein Besucher scrollt von oben nach unten, versteht durch die 5 Szenen WAS der KI-PA im Alltag tut (ohne Feature-Liste), sieht DANN den transparenten Festpreis, und hat genau eine Handlungsoption: Erstgespräch buchen. Keine Tabs, kein Preis-Schock vor dem Wert, keine tote Demo.
