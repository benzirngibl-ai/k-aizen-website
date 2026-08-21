# Archiv: /onboarding des KI-PA-Produkts

**Archiviert 21.08.2026.** Ersetzt durch den Meisterseite-Aufnahmebogen auf derselben URL.

## Warum

Das Formular gehörte zum **KI-PA** (Mailbox-Zugang, Calendly, Arbeitskanal, Tonfall).
Zwei Dinge stimmten nicht mehr:

- **Calendly ist seit 28.07.2026 raus** (Ben-Entscheid) — die Seite fragte es weiter ab.
- Das Einstiegsprodukt ist seit 28.07. die **Meisterseite**, nicht der KI-PA.

Ein Kunde, der es ausgefüllt hätte, hätte Zugänge für ein Produkt geliefert, das er
nicht gekauft hat.

## Was übernommen wurde

Der Absendeweg ist derselbe geblieben: `POST https://pa.k-aizen.de/api/onboarding`
mit den Pflichtfeldern `full_name`, `contact_email`, `consent` — geprüft am 21.08.,
Endpunkt antwortet (400 bei unvollständigen Daten = er lebt).

## Wiederherstellen

Datei zurück nach `src/pages/onboarding.astro` kopieren. Vorher Calendly-Abschnitt
entfernen — er fragt nach einem Dienst, den es nicht mehr gibt.
