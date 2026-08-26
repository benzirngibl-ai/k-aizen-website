/* Baut aus dist/ eine EINZIGE HTML-Datei, die per Doppelklick läuft.
 *
 * Zweck: Ben kann die Seite ansehen, ohne Terminal und ohne Server. Das
 * Artefakt auf claude.ai hat bei ihm mehrfach Probleme gemacht, die
 * Einzeldatei ist der verlässliche Weg.
 *
 * Warum ein eigenes Skript statt eines Einzeilers: Beim ersten Versuch fiel
 * das Bühnen-Skript still heraus. Mein Muster erwartete `is:inline` im
 * <script>-Tag, Astro schreibt aber `src="/js/…" defer`. Die Ersetzung griff
 * nicht, und eine spätere Aufräum-Regel löschte den Verweis — Ergebnis: eine
 * Seite ohne Scroll-Logik, die aussieht wie ein Standbild. Deshalb prüft
 * dieses Skript am Ende, ob wirklich alles drin ist, und bricht sonst ab.
 *
 *   node tools/einzeldatei.mjs <zielpfad.html>
 */
import fs from "node:fs";
import path from "node:path";

const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node tools/einzeldatei.mjs <zielpfad.html>"); process.exit(1); }

const wurzel = process.cwd();
const lies = (p) => fs.readFileSync(path.join(wurzel, p));
const da = (p) => fs.existsSync(path.join(wurzel, p));
const b64 = (p, typ) => "data:" + typ + ";base64," + lies(p).toString("base64");
const typVon = (f) =>
  /\.mp4$/.test(f) ? "video/mp4" :
  /\.webp$/.test(f) ? "image/webp" :
  /\.png$/.test(f) ? "image/png" :
  /\.svg$/.test(f) ? "image/svg+xml" : "image/jpeg";

let h = lies("dist/index.html").toString("utf8");

// ── 1 · Skripte einbetten ───────────────────────────────────────────────────
// Muss VOR dem Aufräumen der Link-Tags laufen, sonst verschwindet der Verweis,
// bevor er ersetzt werden konnte. Das war genau der Fehler.
let skripteEingebettet = 0;
h = h.replace(/<script\b[^>]*\bsrc="\/([^"?]+)(\?[^"]*)?"[^>]*><\/script>/g, (m, f) => {
  const kandidaten = ["public/" + f, "dist/" + f];
  const quelle = kandidaten.find(da);
  if (!quelle) return m;               // externes Skript: unangetastet lassen
  skripteEingebettet++;
  return "<script>\n" + lies(quelle).toString("utf8") + "\n</script>";
});

// ── 2 · Stylesheets einbetten ───────────────────────────────────────────────
let stileEingebettet = 0;
h = h.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="\/([^"?]+)(\?[^"]*)?"[^>]*>/g, (m, f) => {
  const quelle = ["public/" + f, "dist/" + f].find(da);
  if (!quelle) return "";
  stileEingebettet++;
  return "<style>\n" + lies(quelle).toString("utf8") + "\n</style>";
});

// ── 3 · Medien einbetten ────────────────────────────────────────────────────
// data-src ist der Blob-Weg des Hero-Films und muss data-src bleiben.
h = h.replace(/(\bdata-src|\bsrc|\bposter)="\/(video|images|icons)\/([^"]+)"/g,
  (m, attr, ordner, f) => {
    const p = "public/" + ordner + "/" + f;
    return da(p) ? `${attr}="${b64(p, typVon(f))}"` : m;
  });

// Schriften in allen CSS-Regeln (auch in dem, was Schritt 2 gerade einfügte).
h = h.replace(/url\(["']?\/fonts\/([^"')]+)["']?\)/g, (m, f) =>
  da("public/fonts/" + f) ? "url(" + b64("public/fonts/" + f, "font/woff2") + ")" : m);

// ── 4 · Tote Verweise entfernen ─────────────────────────────────────────────
// Erst JETZT, nachdem alles Verwertbare eingebettet ist.
h = h.replace(/<link\b[^>]*rel="(?:preload|icon|apple-touch-icon|manifest|alternate)"[^>]*href="\/[^"]*"[^>]*>/g, "");

// ── 5 · Gegenprobe: ist wirklich alles drin? ────────────────────────────────
// Auf FUNKTIONSNAMEN prüfen, nicht auf Kommentartexte: ein Kommentar wird beim
// Umbau umformuliert, und die Prüfung schlägt dann fehl, obwohl alles da ist.
const pflicht = [
  ["Bühnen-Skript",   /function\s+kopfZielSetzen/],
  ["Scroll-Strecke",  /kz-hero--strecke/],
  ["Hero-Film",       /data-src="data:video\/mp4/],
  ["Schriften",       /font\/woff2;base64/],
];
const fehlt = pflicht.filter(([, muster]) => !muster.test(h)).map(([name]) => name);
if (fehlt.length) {
  console.error("⛔ ABBRUCH — nicht eingebettet: " + fehlt.join(", "));
  process.exit(1);
}

fs.mkdirSync(path.dirname(ZIEL), { recursive: true });
fs.writeFileSync(ZIEL, h);

const offen = [...new Set(h.match(/(?:src|href)="\/(?!\/)[^"]*"/g) || [])]
  .filter((s) => !/href="\/(#|$)/.test(s));
console.log(`geschrieben: ${(fs.statSync(ZIEL).size / 1048576).toFixed(1)} MB`);
console.log(`  Skripte: ${skripteEingebettet} · Stile: ${stileEingebettet} · ` +
            `Videos: ${(h.match(/data:video\/mp4/g) || []).length} · ` +
            `Bilder: ${(h.match(/data:image\//g) || []).length} · ` +
            `Schriften: ${(h.match(/font\/woff2;base64/g) || []).length}`);
console.log(`  verbleibende Seitenlinks (normal): ${offen.length}`);
