// ─────────────────────────────────────────────────────────────────────────────
// Sicherheitskontakt nach RFC 9116 → https://k-aizen.de/.well-known/security.txt
//
// Anlass: BSI-Messung vom 06.08.2026 (Cyberdome) — nur 1,8 % der deutschen
// Webseitenbetreiber stellen eine security.txt bereit. Pflicht ist sie nicht,
// aber sie ist die niedrigschwelligste IT-Sicherheitsmaßnahme, die es gibt, und
// gehört damit auf jede Seite, die wir betreiben oder ausliefern.
//
// WARUM ENDPUNKT UND NICHT public/: `Expires` ist ein PFLICHTFELD und veraltet.
// Hier wird es bei jedem Build neu gesetzt — die Datei heilt sich mit jedem
// Deploy selbst. Bleibt ein Deploy länger als GUELTIG_TAGE aus, LÄUFT DER
// EINTRAG AB. Das ist gewollt: ein abgelaufener Kontakt ist ehrlicher als ein
// falscher. (Und wir wissen seit dem 06.08., dass Deploys hier ausbleiben
// können — k-aizen.de lief sechs Tage auf altem Stand.)
//
// Gleiche Datei im Meisterseite-Baukasten:
// k-aizen/demo-sites/template/src/pages/.well-known/security.txt.ts
// ─────────────────────────────────────────────────────────────────────────────
import type { APIRoute } from 'astro';

/** Gültigkeit ab Build — kurz genug, dass ein toter Kontakt nicht jahrelang
 *  steht, lang genug, dass ein normaler Deploy-Rhythmus sie nie reißt. */
const GUELTIG_TAGE = 180;

/** Bewusst kontakt@ und nicht security@: kontakt@k-aizen.de empfängt
 *  nachweislich Mail (Resend-Absender, 24 Fundstellen auf der Seite). Ein
 *  hübscheres security@ ohne Postfach dahinter würde genau den Zweck der Datei
 *  zerstören — dass die Meldung ankommt. Wird security@ später als Alias
 *  eingerichtet, hier tauschen. */
const KONTAKT = 'kontakt@k-aizen.de';

export const GET: APIRoute = ({ site }) => {
  const basis = (site?.href ?? 'https://k-aizen.de/').replace(/\/+$/, '');
  const expires = new Date(Date.now() + GUELTIG_TAGE * 86_400_000)
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z');

  const zeilen = [
    '# Sicherheitskontakt nach RFC 9116 — https://www.rfc-editor.org/rfc/rfc9116',
    '# k-AIzen — Benjamin Zirngibl, Nuernberg. Automatisierung und KI-Assistenz',
    '# fuer kleine Betriebe.',
    '#',
    '# Sie haben eine Schwachstelle in einem unserer Dienste gefunden? Bitte',
    '# melden Sie sie an den untenstehenden Kontakt, bevor Sie sie',
    '# veroeffentlichen. Wir bestaetigen den Eingang und halten Sie auf dem',
    '# Laufenden. Wir gehen gegen niemanden vor, der eine Schwachstelle in guter',
    '# Absicht meldet und dabei keine Daten Dritter abruft, veraendert oder',
    '# weitergibt.',
    '#',
    '# Dieser Kontakt gilt auch fuer die von uns betriebenen Dienste unter',
    '# *.k-aizen.de sowie fuer die Meisterseiten, die wir fuer Betriebe',
    '# ausliefern.',
    '',
    `Contact: mailto:${KONTAKT}`,
    `Expires: ${expires}`,
    'Preferred-Languages: de, en',
    `Canonical: ${basis}/.well-known/security.txt`,
    '',
  ];

  return new Response(zeilen.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
