#!/usr/bin/env node
/**
 * Prüft, dass die CSS-Cache-Buster in KaizenLayout.astro und index.astro
 * übereinstimmen. Läuft automatisch vor jedem `npm run build` (prebuild).
 *
 * Warum es das gibt: Die Startseite hat ein eigenes Layout und verlinkt
 * dieselben Stylesheets ein zweites Mal. Am 23.08.2026 wurde beim
 * Kontrast-Fix nur KaizenLayout auf ?v=9 gehoben — die Startseite blieb auf
 * ?v=8. Ergebnis: Alle Unterseiten zeigten den Fix, ausgerechnet die
 * meistbesuchte Seite lieferte wiederkehrenden Besuchern das alte CSS.
 * Der Build war grün, der Deploy erfolgreich, live war es trotzdem falsch.
 * Genau die Sorte Fehler, die man nicht durch Hinsehen findet.
 */
import { readFileSync } from 'node:fs';

const QUELLEN = ['src/layouts/KaizenLayout.astro', 'src/pages/index.astro'];
const MUSTER = /\/v2\/(kz-[a-z0-9-]+\.css)\?v=(\d+)/g;

const versionen = new Map();   // datei -> Map(quelle -> version)

for (const quelle of QUELLEN) {
  let text;
  try {
    text = readFileSync(quelle, 'utf8');
  } catch {
    console.error(`✗ Cache-Buster-Prüfung: ${quelle} nicht lesbar.`);
    process.exit(1);
  }
  for (const [, datei, version] of text.matchAll(MUSTER)) {
    if (!versionen.has(datei)) versionen.set(datei, new Map());
    versionen.get(datei).set(quelle, version);
  }
}

const abweichungen = [];
for (const [datei, proQuelle] of versionen) {
  // Nur prüfen, was in BEIDEN Dateien vorkommt — verlinkt nur eine Seite ein
  // Stylesheet, gibt es nichts abzugleichen.
  if (proQuelle.size < 2) continue;
  const werte = new Set(proQuelle.values());
  if (werte.size > 1) {
    abweichungen.push(
      `  ${datei}\n` +
      [...proQuelle].map(([q, v]) => `      ?v=${v}   ${q}`).join('\n')
    );
  }
}

if (abweichungen.length) {
  console.error('\n✗ Cache-Buster stimmen nicht überein:\n');
  console.error(abweichungen.join('\n\n'));
  console.error(
    '\n  Beide Stellen auf dieselbe Nummer heben. Sonst bekommen wiederkehrende\n' +
    '  Besucher auf der Startseite altes CSS, während der Rest der Seite stimmt.\n'
  );
  process.exit(1);
}

const zeilen = [...versionen].map(([d, m]) => `${d}?v=${[...m.values()][0]}`).join(' · ');
console.log(`✓ Cache-Buster einheitlich: ${zeilen}`);
