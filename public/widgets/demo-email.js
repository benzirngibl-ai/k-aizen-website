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

        // Next Thursday as demo calendar date
        var d = new Date();
        d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7));
        var calDate = d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

        // Chat timestamps
        var now = new Date();
        var nowH = now.getHours();
        var nowM = now.getMinutes();
        var sentTime = nowH + ':' + String(nowM).padStart(2, '0');
        var replyTime = nowH + ':' + String((nowM + 2) % 60).padStart(2, '0');

        resultEl.innerHTML = [
          // --- Analysis result card ---
          '<div style="background:white;border-radius:10px;padding:24px;border:1px solid rgba(31,41,51,0.1);">',

          '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">',
          '<span style="padding:4px 14px;background:var(--kz-charcoal);color:var(--kz-cream);border-radius:999px;font-size:13px;font-weight:600;">' + escapeHtml(data.kategorie) + '</span>',
          '<span style="padding:4px 14px;border:1.5px solid ' + priorityColor + ';color:' + priorityColor + ';border-radius:999px;font-size:13px;font-weight:600;">Priorität: ' + escapeHtml(data.prioritaet) + '</span>',
          '</div>',

          '<div style="background:var(--kz-cream-deep);padding:16px;border-radius:8px;">',
          '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--fg-muted);margin-bottom:8px;">Antwort-Entwurf</div>',
          '<p style="margin:0;white-space:pre-wrap;font-size:15px;">' + escapeHtml(data.antwort_draft) + '</p>',
          '</div>',

          '</div>',

          // --- PA Simulation ---
          '<div style="margin-top:24px;" id="kz-sim-container">',
          '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--fg-muted);margin-bottom:12px;">Und jetzt — dein PA übernimmt:</div>',

          '<div style="background:var(--kz-charcoal);border-radius:14px;padding:18px;">',

          // PA card header
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(245,240,232,0.08);">',
          '<div style="width:36px;height:36px;background:var(--kz-ember);border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;">🤖</div>',
          '<div><div style="font-size:13px;font-weight:700;color:var(--kz-cream);">k-AIzen PA</div><div style="font-size:11px;color:rgba(245,240,232,0.45);">Neue Mail erkannt · gerade eben</div></div>',
          '</div>',

          // Kategorie + Priorität
          '<div style="font-size:14px;color:rgba(245,240,232,0.8);margin-bottom:8px;"><strong style="color:var(--kz-cream);">' + escapeHtml(data.kategorie) + '</strong> · Priorität ' + escapeHtml(data.prioritaet) + '</div>',

          // Triage-Begründung as PA analysis note
          '<div style="border-left:2px solid rgba(245,240,232,0.18);padding:6px 10px;font-size:12px;color:rgba(245,240,232,0.48);line-height:1.55;margin-bottom:10px;">',
          escapeHtml(data.triage_begruendung),
          '</div>',

          // Draft preview
          '<div style="background:rgba(245,240,232,0.07);border-radius:8px;padding:10px 12px;font-size:13px;color:rgba(245,240,232,0.65);font-style:italic;margin-bottom:14px;line-height:1.5;">"' + escapeHtml(data.antwort_draft.slice(0, 120)) + '…"</div>',

          '<button id="kz-sim-btn" style="width:100%;padding:13px;background:var(--kz-ember);color:var(--kz-cream);border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;">Ja — Antwort senden</button>',
          '</div>',

          // Chat window + calendar step area
          '<div id="kz-sim-steps" style="margin-top:12px;"></div>',
          '</div>',

          // CTA at bottom
          '<div style="margin-top:48px;padding:16px 20px;background:var(--kz-charcoal);border-radius:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">',
          '<span style="color:var(--kz-cream);font-weight:600;">Willst du das für dein Postfach?</span>',
          '<a href="/audit" style="background:var(--kz-ember);color:var(--kz-cream);padding:10px 22px;border-radius:999px;font-weight:600;text-decoration:none;font-size:14px;white-space:nowrap;">Audit buchen →</a>',
          '</div>',

        ].join('');

        resultEl.style.display = 'block';

        document.getElementById('kz-sim-btn').addEventListener('click', function () {
          var simBtn = document.getElementById('kz-sim-btn');
          var stepsEl = document.getElementById('kz-sim-steps');
          simBtn.disabled = true;
          simBtn.textContent = '📤 Wird gesendet…';

          // Button turns green
          setTimeout(function () {
            simBtn.textContent = '✅ Gesendet';
            simBtn.style.background = '#3a7d44';
          }, 900);

          // Create WhatsApp-style chat window
          setTimeout(function () {
            stepsEl.innerHTML = [
              '<div style="background:#ece5dd;border-radius:14px;overflow:hidden;border:1px solid rgba(31,41,51,0.08);">',

              // Chat header
              '<div style="background:#075e54;padding:10px 14px;display:flex;align-items:center;gap:10px;">',
              '<div style="width:34px;height:34px;background:var(--kz-ember);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🤖</div>',
              '<div style="flex:1;">',
              '<div style="font-size:14px;font-weight:600;color:#fff;">k-AIzen PA</div>',
              '<div style="font-size:11px;color:rgba(255,255,255,0.6);">online</div>',
              '</div>',
              '</div>',

              // Messages area
              '<div id="kz-chat-messages" style="padding:14px 12px;display:flex;flex-direction:column;gap:6px;min-height:50px;background-image:url(\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 opacity=%220.04%22><text y=%2240%22 font-size=%2236%22>💬</text></svg>\');">',
              '</div>',

              '</div>',
            ].join('');
          }, 1200);

          function addBubble(html, delay) {
            setTimeout(function () {
              var chatEl = document.getElementById('kz-chat-messages');
              if (!chatEl) return;
              var el = document.createElement('div');
              el.style.cssText = 'opacity:0;transform:translateY(6px);transition:opacity 0.3s ease,transform 0.3s ease;';
              el.innerHTML = html;
              chatEl.appendChild(el);
              requestAnimationFrame(function () { requestAnimationFrame(function () {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }); });
            }, delay);
          }

          function addStep(html, delay) {
            setTimeout(function () {
              var el = document.createElement('div');
              el.style.cssText = 'opacity:0;transform:translateY(6px);transition:opacity 0.3s ease,transform 0.3s ease;margin-top:8px;';
              el.innerHTML = html;
              stepsEl.appendChild(el);
              requestAnimationFrame(function () { requestAnimationFrame(function () {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }); });
            }, delay);
          }

          // Outgoing bubble (PA → Kunde)
          addBubble(
            '<div style="display:flex;justify-content:flex-end;padding:0 4px;">' +
            '<div style="max-width:82%;background:#dcf8c6;color:#1a1a1a;border-radius:18px 18px 4px 18px;' +
            'padding:9px 13px;font-size:13px;line-height:1.5;box-shadow:0 1px 1px rgba(0,0,0,0.1);">' +
            escapeHtml(data.antwort_draft.slice(0, 130)) + '…' +
            '<div style="display:flex;align-items:center;justify-content:flex-end;gap:3px;margin-top:4px;">' +
            '<span style="font-size:10px;color:#667;">' + sentTime + '</span>' +
            '<span style="font-size:13px;color:#4fc3f7;">✓✓</span>' +
            '</div>' +
            '</div>' +
            '</div>',
            1600
          );

          // Incoming bubble (Kunde → PA)
          addBubble(
            '<div style="display:flex;justify-content:flex-start;padding:0 4px;">' +
            '<div style="max-width:82%;background:#fff;color:#1a1a1a;border-radius:18px 18px 18px 4px;' +
            'padding:9px 13px;font-size:13px;line-height:1.5;box-shadow:0 1px 1px rgba(0,0,0,0.1);">' +
            'Danke! ' + calDate.split(',')[0] + ' 10:00 Uhr passt prima. 👍' +
            '<div style="text-align:right;font-size:10px;color:#888;margin-top:4px;">' + replyTime + '</div>' +
            '</div>' +
            '</div>',
            2800
          );

          // Calendar card below chat window
          addStep(
            '<div style="background:white;border:1px solid rgba(31,41,51,0.1);border-radius:12px;padding:16px;display:flex;align-items:center;gap:14px;">' +
            '<div style="background:var(--kz-ember);color:white;border-radius:8px;padding:8px 10px;text-align:center;min-width:44px;flex-shrink:0;">' +
            '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;opacity:0.85;">Neu</div>' +
            '<div style="font-size:22px;font-weight:800;line-height:1;">' + d.getDate() + '</div>' +
            '</div>' +
            '<div>' +
            '<div style="font-size:14px;font-weight:700;color:var(--kz-charcoal);">📅 Erstgespräch — 10:00 Uhr</div>' +
            '<div style="font-size:13px;color:var(--fg-muted);margin-top:2px;">' + calDate + '</div>' +
            '</div>' +
            '</div>',
            4000
          );

          // Calendar confirmation card
          addStep(
            '<div style="background:white;border-radius:12px;border:1px solid rgba(31,41,51,0.1);overflow:hidden;">' +
            '<div style="background:#f8f9fa;padding:9px 14px;border-bottom:1px solid rgba(31,41,51,0.06);display:flex;align-items:center;gap:8px;">' +
            '<span style="font-size:12px;">📅</span>' +
            '<span style="font-size:11px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.08em;">Kalender</span>' +
            '<span style="margin-left:auto;font-size:11px;color:#5f6368;">' + calDate.split(',')[0] + ', 07.05.2026</span>' +
            '</div>' +
            '<div style="padding:10px 14px;">' +
            '<div style="background:#1a73e8;color:white;border-radius:6px;padding:7px 11px;font-size:12px;line-height:1.4;">' +
            '<strong>Erstgespräch — k-AIzen</strong><br>10:00 – 10:30 Uhr' +
            '</div>' +
            '</div>' +
            '<div style="padding:10px 14px;background:#f0fdf4;border-top:1px solid rgba(31,41,51,0.06);display:flex;align-items:center;gap:8px;">' +
            '<span style="font-size:15px;">✅</span>' +
            '<span style="font-size:13px;color:#15803d;font-weight:600;">Termin automatisch eingetragen</span>' +
            '</div>' +
            '</div>',
            5200
          );
        });

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
