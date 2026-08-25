/* Hintergrund-Bühne: ein fixierter Träger hinter der ganzen Seite, dessen
 * Motiv beim Scrollen wechselt.
 *
 * Der Inhalt der Seite bleibt davon unberührt — hier wird ausschließlich
 * entschieden, WELCHE Lage gerade sichtbar ist und WIE weit sie sich
 * gegenüber dem Text verschiebt.
 *
 * Der Film im Hero läuft NICHT von selbst ab. Das Scrollrad ist sein
 * Abspielkopf: oben steht der erste Frame, eine Bildschirmhöhe weiter der
 * letzte. Wer nicht scrollt, sieht ein Standbild — der Dachdecker bewegt
 * sich genau so weit, wie der Leser dreht.
 *
 * Rücksichten, die den Code länger machen als das Prinzip:
 *
 * 1. Ein Handwerker schaut die Seite oft im Mobilfunk an. 2,6 MB Video beim
 *    ersten Laden wären unhöflich. Deshalb `preload=none` im Markup und ein
 *    echtes `src` erst hier, nach dem ersten Bild.
 * 2. Wer Bewegung reduziert hat, bekommt gar kein Video, sondern das Poster.
 * 3. Springen im Video ist asynchron und vom Decoder begrenzt. Deshalb eine
 *    eigene Schleife mit Totband statt eines Sprungs pro Scroll-Ereignis.
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
  // Der Abspielkopf des Hero-Films. Er wird ausschließlich vom Scrollrad
  // bewegt — siehe unten.
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

  // ── Der Film im Hero: das Scrollrad IST der Abspielkopf ─────────────────
  //
  // Der Film läuft NICHT von selbst. Er bewegt sich nur, solange gescrollt
  // wird — das Rad ist der Regler, nicht ein Startknopf. Steht die Maus
  // still, steht auch der Dachdecker still.
  //
  // (`film` ist oben deklariert, weil zeigen() es schon braucht.)

  var kopf = { bereit: false, ziel: 0, ist: 0, gemalt: false };

  function filmLaden() {
    if (!film || ruhig.matches || film.src) return;
    var quelle = schmal.matches
      ? film.dataset.srcMobile || film.dataset.src
      : film.dataset.src;
    if (!quelle) return;

    // Als Blob laden, nicht per src. Springen im Video braucht sonst
    // Range-Unterstützung vom Server; über einen Blob liegt die Datei
    // vollständig im Speicher und jeder Sprung ist sofort möglich.
    fetch(quelle)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(function (blob) {
        // Zuhörer VOR dem src setzen: das Zuweisen startet den Ladevorgang,
        // ein späteres Anhängen würde ihn abbrechen und neu starten.
        film.addEventListener('loadedmetadata', function () {
          kopf.bereit = true;
          // Einmal erzwungen springen, auch wenn das Ziel 0 ist: das Poster
          // wird erst über 'seeked' abgelöst, und die Schleife springt nur,
          // wenn sich die Zeit ändert. Ohne das bliebe am Seitenanfang ewig
          // das Standbild stehen.
          try { film.currentTime = 0.001; } catch (e) {}
        });
        film.addEventListener('seeked', function () {
          kopf.gemalt = true;
          buehne.classList.add('film-an');
        }, { once: true });
        film.preload = 'auto';
        film.src = URL.createObjectURL(blob);
      })
      .catch(function () { /* Poster bleibt stehen — die Seite sieht aus wie vorher */ });
  }

  if ('requestIdleCallback' in window) filmLaden && requestIdleCallback(filmLaden, { timeout: 2500 });
  else addEventListener('load', function () { setTimeout(filmLaden, 500); });

  // Das Ziel kommt aus der Scrollposition innerhalb der HERO-STRECKE, nicht
  // aus einer festen Bildschirmhöhe: der Hero ist 2,8 Bildschirmhöhen hoch
  // und pinnt seine Bühne darin. Mit einer Bildschirmhöhe war der ganze
  // Fünf-Sekünder nach einem Rad-Ruck durch — die Bewegung war vorbei,
  // bevor sie auffiel.
  var hero = document.querySelector('.kz-hero');

  function kopfZielSetzen() {
    if (!hero) return;
    // Nutzbarer Weg = Höhe der Strecke minus der einen Bildschirmhöhe, die
    // die gepinnte Bühne selbst einnimmt.
    var weg = Math.max(1, hero.offsetHeight - innerHeight);
    var p = Math.min(1, Math.max(0, scrollY / weg));
    // Verweilen (dwell): in der Mitte langsamer, an den Rändern schneller.
    // Ohne das rauscht der Anfang vorbei und das Ende zieht sich. Entspricht
    // data-sc-dwell="0.36" der Scroll-Fassung.
    var d = 0.36;
    kopf.ziel = p + d * Math.sin(2 * Math.PI * p) / (2 * Math.PI) * -1;
    kopf.ziel = Math.min(1, Math.max(0, kopf.ziel));
  }

  // Eigene Schleife, getrennt vom Scroll-Zuhörer. Springen im Video ist
  // asynchron und wird vom Decoder begrenzt; der Scroll-Zuhörer muss dagegen
  // billig bleiben. Die Annäherung in kleinen Schritten ist außerdem das,
  // was aus ruckeligen Radschritten eine Fahrt macht.
  function schleife() {
    if (kopf.bereit && !ruhig.matches) {
      // Nie einen neuen Sprung anfordern, solange der Decoder noch am letzten
      // arbeitet — sonst stapeln sich auf dem Handy die Anfragen und das Bild
      // friert ein.
      if (!film.seeking) {
        var totband = schmal.matches ? 0.02 : 0.008;
        kopf.ist += (kopf.ziel - kopf.ist) * 0.16;
        var dauer = film.duration || 1;
        var t = Math.min(0.999, Math.max(0, kopf.ist)) * dauer;
        if (Math.abs(film.currentTime - t) > totband) {
          try { film.currentTime = t; } catch (e) {}
        }
      }
    }
    requestAnimationFrame(schleife);
  }
  requestAnimationFrame(schleife);

  // iOS malt ein stummes Video nicht, das nie eine Nutzergeste gesehen hat —
  // es kann geladen und gesprungen sein und trotzdem schwarz bleiben. Ein
  // einmaliges play/pause bei der ersten Berührung schaltet es frei.
  var freigeschaltet = false;
  function freischalten() {
    if (freigeschaltet || !film || !film.src) return;
    freigeschaltet = true;
    var v = film.play();
    if (v && v.then) v.then(function () { film.pause(); }).catch(function () {});
    else { try { film.pause(); } catch (e) {} }
  }
  ['touchstart', 'pointerdown'].forEach(function (e) {
    addEventListener(e, freischalten, { once: true, passive: true });
  });

  ruhig.addEventListener('change', function () {
    if (ruhig.matches) { kopf.bereit = false; buehne.classList.remove('film-an'); }
    else filmLaden();
  });

  // Beim Scrollen wird jetzt beides nachgeführt: Lage UND Abspielkopf.
  addEventListener('scroll', kopfZielSetzen, { passive: true });
  kopfZielSetzen();
  lesen();
})();
