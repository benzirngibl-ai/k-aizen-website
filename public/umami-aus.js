// Schaltet die Umami-Messung für dieses Gerät ab (?umami=aus) oder wieder an (?umami=an).
// Das Umami-Skript prüft vor jedem Senden localStorage "umami.disabled".
// Mit &kette=asbest,treppenlift,… geht es automatisch zur nächsten eigenen Seite weiter,
// damit Ben pro Gerät nur einen Link antippen muss. Weitergeleitet wird nur auf die Domains unten.
(function () {
  var SEITEN = {
    oeltank: 'oeltank-entfernen.de',
    asbest: 'asbest-entfernen.de',
    terrassendach: 'terrassendach-bauen-lassen.de',
    treppenlift: 'treppenlift-kosten-ratgeber.de',
    kreuzfahrt: 'kreuzfahrtschiff-check.de',
    fasssauna: 'fasssauna-kosten.de',
    kaizen: 'k-aizen.de'
  };
  try {
    var p = new URLSearchParams(location.search);
    var wert = p.get('umami');
    if (wert !== 'aus' && wert !== 'an') return;
    if (wert === 'aus') localStorage.setItem('umami.disabled', '1');
    else localStorage.removeItem('umami.disabled');

    var kette = (p.get('kette') || '').split(',').filter(function (k) { return SEITEN.hasOwnProperty(k); });
    if (kette.length) {
      var rest = kette.slice(1).join(',');
      location.replace('https://' + SEITEN[kette[0]] + '/?umami=' + wert + (rest ? '&kette=' + rest : ''));
      return;
    }

    document.addEventListener('DOMContentLoaded', function () {
      var d = document.createElement('div');
      d.setAttribute('role', 'status');
      d.textContent = wert === 'aus'
        ? 'Messung auf diesem Gerät ausgeschaltet.'
        : 'Messung auf diesem Gerät wieder eingeschaltet.';
      var s = d.style;
      s.position = 'fixed'; s.left = '16px'; s.right = '16px'; s.bottom = '16px';
      s.maxWidth = '420px'; s.padding = '14px 18px'; s.borderRadius = '10px';
      s.background = '#1f2329'; s.color = '#fff'; s.zIndex = '2147483647';
      s.font = '16px/1.4 system-ui, -apple-system, sans-serif';
      s.boxShadow = '0 6px 24px rgba(0,0,0,.25)';
      document.body.appendChild(d);
    });
  } catch (e) { /* localStorage gesperrt (privates Fenster) */ }
})();
