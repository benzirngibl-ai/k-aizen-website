# Social-Card neu erzeugen

`og-card.html` ist die Quelle für `public/og-image.png` — das Bild, das erscheint, wenn
jemand k-aizen.de in WhatsApp, LinkedIn oder Slack teilt. Gestaltung: Fable 5 (23.08.2026).

## Warum ein HTML-File und kein Grafikprogramm

Die Karte benutzt dieselben Schriften und Farbwerte wie die Live-Seite. Ändert sich die
Positionierung, wird hier Text geändert und neu aufgenommen — statt eine Bilddatei zu suchen,
die niemand mehr öffnen kann.

## Neu aufnehmen

```bash
cd k-aizen/website/site
python3 -m http.server 8099 --bind 127.0.0.1 &   # file:// geht nicht, Playwright blockt es
```

Dann im Browser bei **exakt 1200 × 630** aufnehmen (Playwright-MCP oder Chrome-DevTools):
`http://127.0.0.1:8099/tools/og/og-card.html`

⚠️ **Vor dem Auslösen auf `document.fonts.ready` warten.** Sonst rendert Plus Jakarta Sans
als Systemschrift und die Karte sieht falsch aus, ohne dass es auffällt.

## Danach IMMER komprimieren

Der Rohschuss wiegt ~730 KB, weil das Korn über der Fläche sich nicht komprimieren lässt.
**WhatsApp zeigt Vorschaubilder oberhalb von etwa 600 KB gar nicht mehr an** — die Karte
wäre also genau dort unsichtbar, wo sie am häufigsten geteilt wird.

```bash
pngquant --quality=70-90 --speed 1 --force --output public/og-image.png <rohschuss>.png
```

Ergebnis ~100 KB, ohne sichtbare Streifen im Glutverlauf. Danach einmal ansehen:
Quantisierung kann weiche Verläufe bandieren, das sieht man nur im Bild, nicht in der Dateigröße.

## Prüfen, ob es draußen ankommt

Facebook und LinkedIn halten das alte Bild im Cache. Nach dem Deploy:
- https://developers.facebook.com/tools/debug/ → URL eingeben → „Scrape Again"
- https://www.linkedin.com/post-inspector/

WhatsApp cacht ebenfalls; dort hilft nur Zeit oder ein Link mit `?v=2`.
