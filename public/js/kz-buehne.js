/* Hintergrund-Bühne: ein fixierter Träger hinter der ganzen Seite, dessen
 * Motiv beim Scrollen wechselt.
 *
 * Der Inhalt der Seite bleibt davon unberührt — hier wird ausschließlich
 * entschieden, WELCHE Lage gerade sichtbar ist und WIE weit sie sich
 * gegenüber dem Text verschiebt.
 *
 * Drei Rücksichten, die den Code länger machen als das Prinzip:
 *
 * 1. Ein Handwerker schaut die Seite oft im Mobilfunk an. 2,6 MB Video beim
 *    ersten Laden wären unhöflich. Deshalb `preload=none` im Markup und ein
 *    echtes `src` erst hier, nach dem ersten Bild.
 * 2. Wer Bewegung reduziert hat, bekommt gar kein Video, sondern das Poster.
 *    Deshalb steht `autoplay` NICHT im Markup: sonst lädt der Browser die
 *    Datei, bevor JavaScript die Einstellung prüfen kann.
 * 3. Läuft der Hero aus dem Bild, wird pausiert. Ein unsichtbares Video
 *    kostet Akku ohne Gegenwert.
 */
(function () {
  'use strict';

  var buehne = document.querySelector('.kz-buehne');
  if (!buehne) return;

  var lagen = {};
  [].forEach.call(buehne.querySelectorAll('[data-lage]'), function (el) {
    lagen[el.dataset.lage] = el;
  });

  var ruhig = matchMedia('(prefers-reduced-motion: reduce)');
  var schmal = matchMedia('(max-width: 760px)');
  var aktuell = 'hero';
  // Vor zeigen() deklariert: die Funktion ruft filmNachfuehren(), und das
  // braucht `film`. Sonst wäre es beim ersten Lauf noch undefined.
  var film = buehne.querySelector('.kz-buehne__film');

  // ── Lagenwechsel ────────────────────────────────────────────────────────
  // Welcher Abschnitt die Bildschirmmitte belegt, bestimmt das Motiv. Ein
  // reiner Scroll-Schwellwert würde beim Zurückscrollen flackern.
  var abschnitte = [].slice.call(document.querySelectorAll('[data-buehne]'));

  function zeigen(name) {
    if (name === aktuell || !lagen[name]) return;
    if (lagen[aktuell]) lagen[aktuell].classList.remove('ist-da');
    lagen[name].classList.add('ist-da');
    aktuell = name;
    filmNachfuehren();
  }

  function lesen() {
    var mitte = innerHeight / 2;
    var treffer = null;
    for (var i = 0; i < abschnitte.length; i++) {
      var r = abschnitte[i].getBoundingClientRect();
      if (r.top <= mitte && r.bottom >= mitte) { treffer = abschnitte[i]; break; }
    }
    // Über dem ersten markierten Abschnitt gilt der Hero; darunter bleibt die
    // letzte Lage stehen, statt auf leer zu springen.
    zeigen(treffer ? treffer.dataset.buehne : (scrollY < innerHeight ? 'hero' : aktuell));

    // Sanfte Eigenbewegung: die Bühne zieht langsamer als der Text. Der Wert
    // ist bewusst klein — mehr liest sich nicht als Tiefe, sondern als Fehler.
    if (!ruhig.matches) {
      var p = Math.min(1, scrollY / Math.max(1, document.body.scrollHeight - innerHeight));
      buehne.style.setProperty('--kz-buehne-p', p.toFixed(4));
    }
  }

  var laeuft = false;
  function anstossen() {
    if (laeuft) return;
    laeuft = true;
    requestAnimationFrame(function () { lesen(); laeuft = false; });
  }

  addEventListener('scroll', anstossen, { passive: true });
  addEventListener('resize', anstossen, { passive: true });

  // ── Der Film im Hero ────────────────────────────────────────────────────
  // (`film` ist oben deklariert, weil zeigen() es schon braucht.)

  function filmStarten() {
    if (!film || ruhig.matches || film.src) return;
    var quelle = schmal.matches
      ? film.dataset.srcMobile || film.dataset.src
      : film.dataset.src;
    if (!quelle) return;
    film.src = quelle;
    // play() darf abgelehnt werden (Energiesparmodus, iOS-Regeln). Das ist
    // kein Fehler: dann bleibt das Poster stehen und die Seite sieht aus wie
    // vorher. Daher der leere catch statt einer Meldung.
    var v = film.play();
    if (v && v.catch) v.catch(function () {});
    buehne.classList.add('film-an');
  }

  if ('requestIdleCallback' in window) requestIdleCallback(filmStarten, { timeout: 2500 });
  else addEventListener('load', function () { setTimeout(filmStarten, 500); });

  // Film pausieren, sobald eine andere Lage ihn zudeckt.
  //
  // NICHT über einen IntersectionObserver auf der Hero-Lage: die ist
  // `position:fixed; inset:0` und schneidet damit IMMER den Viewport — das
  // Video liefe dann bis zum Seitenende weiter, unsichtbar unter einer
  // anderen Lage, und kostete die ganze Zeit Akku. Maßgeblich ist deshalb,
  // welche Lage gerade gilt, nicht ob ein fixiertes Element „sichtbar" ist.
  function filmNachfuehren() {
    if (!film || !film.src) return;
    if (aktuell === 'hero' && !ruhig.matches) {
      var v = film.play();
      if (v && v.catch) v.catch(function () {});
    } else if (!film.paused) {
      film.pause();
    }
  }

  ruhig.addEventListener('change', function () {
    if (ruhig.matches && film) { film.pause(); buehne.classList.remove('film-an'); }
    else filmStarten();
  });

  lesen();
})();
