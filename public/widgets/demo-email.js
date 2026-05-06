(function () {
  'use strict';

  var SAMPLES = [
    {
      label: 'Angebotsanfrage',
      text: 'Betreff: Anfrage KI-Automatisierung\n\nHallo,\n\nwir betreiben einen Handwerksbetrieb mit 18 Mitarbeitern und suchen eine Lösung für die automatische Belegerfassung. Wir arbeiten aktuell mit DATEV. Könnten Sie uns ein Angebot schicken?\n\nMit freundlichen Grüßen\nMartin Huber\nHuber GmbH & Co. KG'
    },
    {
      label: 'Beschwerde',
      text: 'Betreff: Unzufriedenheit mit letzter Lieferung\n\nSehr geehrte Damen und Herren,\n\nich bin sehr unzufrieden. Die Ware kam beschädigt an und auf meine letzte E-Mail vor 10 Tagen habe ich noch keine Antwort erhalten. Das ist inakzeptabel.\n\nKundennummer: KD-4821\nBitte melden Sie sich umgehend.\n\nMaria Schmidt'
    },
    {
      label: 'Terminanfrage',
      text: 'Betreff: Erstgespräch\n\nGuten Morgen,\n\nich habe Ihre Website gefunden und bin interessiert. Würde gerne 30 Minuten mit Ihnen sprechen. Passt es Ihnen diese Woche noch, am besten Donnerstag oder Freitag Vormittag?\n\nDanke,\nThomas Berger\nBerger & Partner Steuerberatung'
    }
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildWidget(container) {
    container.innerHTML = [
      '<div style="background:var(--kz-cream-deep);border-radius:12px;padding:28px 24px;margin-top:24px;">',

      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;">',
      '<span style="font-size:13px;color:var(--fg-muted);white-space:nowrap;">Beispiel laden:</span>',
      SAMPLES.map(function (s, i) {
        return '<button class="kz-demo-sample" data-idx="' + i + '" style="' +
          'padding:5px 14px;border:1px solid var(--kz-ember-text);border-radius:999px;' +
          'background:transparent;color:var(--kz-ember-text);font-size:13px;cursor:pointer;' +
          'font-family:inherit;">' + escapeHtml(s.label) + '</button>';
      }).join(''),
      '</div>',

      '<textarea id="kz-demo-mail-input" rows="7" placeholder="E-Mail-Text hier einfügen…" style="' +
        'width:100%;box-sizing:border-box;padding:14px;border:1px solid rgba(31,41,51,0.15);' +
        'border-radius:8px;font-family:inherit;font-size:15px;resize:vertical;' +
        'background:var(--kz-cream);color:var(--kz-charcoal);"></textarea>',

      '<p style="font-size:12px;color:var(--fg-muted);margin:6px 0 14px;">',
      'Datenschutz: Der Text wird nicht gespeichert und nach der Verarbeitung sofort gelöscht.',
      '</p>',

      '<button id="kz-demo-submit" style="' +
        'display:inline-block;background:var(--kz-ember);color:var(--kz-cream);' +
        'padding:12px 28px;border-radius:999px;border:none;font-weight:600;font-size:16px;' +
        'cursor:pointer;font-family:inherit;">Jetzt analysieren</button>',

      '<div id="kz-demo-result" style="display:none;margin-top:24px;"></div>',

      '</div>'
    ].join('');

    container.querySelectorAll('.kz-demo-sample').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        document.getElementById('kz-demo-mail-input').value = SAMPLES[idx].text;
      });
    });

    document.getElementById('kz-demo-submit').addEventListener('click', async function () {
      var mail = document.getElementById('kz-demo-mail-input').value.trim();
      if (!mail) return;

      var btn = document.getElementById('kz-demo-submit');
      var resultEl = document.getElementById('kz-demo-result');

      btn.disabled = true;
      btn.textContent = 'Analysiere…';
      resultEl.style.display = 'none';

      try {
        var base = (window.KAIZEN_DEMO_BASE || 'https://chat.k-aizen.de');
        var res = await fetch(base + '/demo/email-triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mail: mail })
        });

        if (res.status === 429) {
          resultEl.innerHTML = '<p style="color:var(--kz-ember-text);padding:12px;background:rgba(232,90,43,0.08);border-radius:8px;">Zu viele Demo-Anfragen — bitte 15 Minuten warten.</p>';
          resultEl.style.display = 'block';
          return;
        }

        if (!res.ok) {
          resultEl.innerHTML = '<p style="color:var(--kz-ember-text);padding:12px;background:rgba(232,90,43,0.08);border-radius:8px;">Fehler bei der Analyse — bitte nochmal versuchen.</p>';
          resultEl.style.display = 'block';
          return;
        }

        var data = await res.json();

        var priorityColor = data.prioritaet === 'hoch'
          ? 'var(--kz-ember-text)'
          : data.prioritaet === 'mittel'
            ? '#5A6670'
            : '#7A9A78';

        resultEl.innerHTML = [
          '<div style="background:white;border-radius:10px;padding:24px;border:1px solid rgba(31,41,51,0.1);">',

          '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">',
          '<span style="padding:4px 14px;background:var(--kz-charcoal);color:var(--kz-cream);border-radius:999px;font-size:13px;font-weight:600;">' + escapeHtml(data.kategorie) + '</span>',
          '<span style="padding:4px 14px;border:1.5px solid ' + priorityColor + ';color:' + priorityColor + ';border-radius:999px;font-size:13px;font-weight:600;">Priorität: ' + escapeHtml(data.prioritaet) + '</span>',
          '</div>',

          '<div style="background:var(--kz-cream-deep);padding:16px;border-radius:8px;margin-bottom:12px;">',
          '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--fg-muted);margin-bottom:8px;">Antwort-Entwurf</div>',
          '<p style="margin:0;white-space:pre-wrap;font-size:15px;">' + escapeHtml(data.antwort_draft) + '</p>',
          '</div>',

          '<p style="font-size:13px;color:var(--fg-muted);margin:0;font-style:italic;">' + escapeHtml(data.triage_begruendung) + '</p>',

          '</div>',

          '<div style="margin-top:20px;padding:16px 20px;background:var(--kz-charcoal);border-radius:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">',
          '<span style="color:var(--kz-cream);font-weight:600;">Willst du das für dein Postfach?</span>',
          '<a href="/audit" style="background:var(--kz-ember);color:var(--kz-cream);padding:10px 22px;border-radius:999px;font-weight:600;text-decoration:none;font-size:14px;white-space:nowrap;">Audit buchen →</a>',
          '</div>'
        ].join('');

        resultEl.style.display = 'block';

      } finally {
        btn.disabled = false;
        btn.textContent = 'Nochmal analysieren';
      }
    });
  }

  function init() {
    var container = document.getElementById('kz-demo-email');
    if (container) buildWidget(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
