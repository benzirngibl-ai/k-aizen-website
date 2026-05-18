---
title: "Mein Mail-Eingang läuft jetzt durch KI. Hier ist was passiert."
description: "Drei Wochen lang habe ich meinen kompletten Posteingang von Claude Haiku vortriagieren lassen. Was funktioniert, was nicht, und warum ich n8n dafür rausgeworfen habe."
pubDate: 2026-05-18
pillar: B
tags:
  - mail-triage
  - claude-haiku
  - kmu-automation
  - build-in-public
  - n8n
author: Benjamin Zirngibl
---

Ich bekomme zwischen 60 und 120 Mails pro Tag. Newsletter, Calendly-Bestätigungen, Steuerberater, Rechnungen, alte Bekannte. Drei Wochen lang habe ich das komplette Inbound von einem KI-Modell vorsortieren lassen — Claude Haiku, kostet ~3 Cent pro Stunde Polling. Hier ist was funktioniert hat, was nicht, und warum die erste Version nach vier Tagen in den Müll geflogen ist.

## Versuch 1: n8n-Workflow (gescheitert)

Mein erster Anlauf war ein n8n-Workflow. n8n ist eine Low-Code-Automation-Plattform, sehr beliebt im KMU-Bereich, weil man Workflows visuell zusammenklickt. Klingt gut auf dem Papier.

Was schief ging:

- **Cost-Runaway:** Mein erster Filter war zu lasch. Bei 80 Mails pro Tag und einem unsauberen Loop habe ich an einem Tag ungefähr 1.500 Claude-API-Calls erzeugt. Nicht ruinös, aber unnötig.
- **Workflow-Komplexität:** Jede neue Bedingung — "ignoriere Mails aus diesem Newsletter, außer wenn 'Black Friday' im Betreff" — bedeutet einen neuen Node, einen neuen IF-Branch, einen neuen Edge-Case. Nach zwei Wochen sah das Diagramm aus wie ein Schaltplan.
- **Debugging-Schmerz:** Wenn etwas schief ging, musste ich durch zehn visual Nodes klicken um zu verstehen warum eine Mail nicht klassifiziert wurde. In Code wäre das ein `grep`.

Ich habe das Ding nach knapp vier Wochen aus dem Stack geworfen.

## Versuch 2: Eigenes Backend mit Poller (läuft)

Die neue Version ist ein einzelnes TypeScript-Modul. Ein `setInterval`, der alle 15 Minuten den Gmail-Posteingang via IMAP zieht, jede Mail einmal durch Claude Haiku schickt, und das Ergebnis in eine SQLite ablegt. Etwa 400 Zeilen Code, kein Visual-Editor, kein Plattform-Lock-in.

```ts
// vereinfacht
const mails = await imap.fetchSince(lastPoll);
for (const mail of mails) {
  const verdict = await claude.haiku({
    system: TRIAGE_PROMPT,
    user: `Subject: ${mail.subject}\n\n${mail.body.slice(0, 4000)}`,
  });
  await db.insert(mail.id, verdict);
}
```

Das war's. Kein Drag-and-Drop, keine fünf Plugin-Versionen, kein "warum funktioniert der Webhook nicht mehr."

Triagiert wird in vier Kategorien:

- **NEED_READ** — wirkliche Person schreibt mir, oder es geht um Geld/Termin/Frist
- **NICE_TO_KNOW** — Newsletter mit gelegentlichem Wert, aber nicht heute wichtig
- **JUNK** — Werbung, Cold-Outreach, Phishing-nahe Geschichten
- **AUTO_ACK** — Calendly-Bestätigungen, Order-Confirmations, automatische Quittungen

Ein Discord-Channel zeigt mir alle 15 Minuten die `NEED_READ`-Mails als Übersicht. Den Rest sehe ich nur, wenn ich gezielt im Backend-Dashboard nachgucke.

## Was nach drei Wochen funktioniert

- **Die Triage-Quality liegt bei ~92% Precision auf NEED_READ.** Acht von hundert wichtigen Mails landen fälschlich in NICE_TO_KNOW. Damit kann ich leben — ich scanne den NICE_TO_KNOW-Bucket trotzdem einmal am Tag, dauert zwei Minuten.
- **JUNK-Detection ist quasi perfekt.** Cold-DMs, "Wir können Ihr SEO verbessern", LinkedIn-Phishing — alles weg.
- **Calendly-Bestätigungen werden separat geroutet.** Sie landen in einem Bookings-Channel, nicht in der allgemeinen Triage. Sehe ich nur, wenn ich Termine plane.
- **Cost ist berechenbar.** Bei aktuellem Volumen kostet das ganze Setup zwischen 80 Cent und einem Euro pro Tag. Skaliert linear mit Mail-Aufkommen.

## Was nicht funktioniert

- **Lange Threads sind schwierig.** Wenn jemand vier Mal hin und her schreibt, weiß die Triage nicht automatisch dass die letzte Mail wichtiger ist als die erste. Ich klassifiziere jede Mail isoliert. Lösung wäre Thread-Aware-Triage, kommt in einem späteren Sprint.
- **Sprachliche Nuancen werden manchmal falsch gelesen.** "Wir würden gern unser Audit verschieben" hat das Modell mal als NICE_TO_KNOW eingeordnet weil es sehr höflich formuliert war. Verschiebungs-Anfragen sind aber NEED_READ.
- **First-Time-Senders.** Wenn ein neuer Kunde schreibt, fehlt der Kontext. Das Modell rät meistens richtig, aber nicht immer. Ich habe Whitelist-Regex für meine Customer-Domains gebaut — die werden automatisch zu NEED_READ hochgestuft.

## Was das einem KMU bringt

Wenn du 60-120 Mails am Tag bekommst, sparst du nach meiner Erfahrung etwa 30-45 Minuten pro Tag. Klingt nach wenig, ist aber: über ein Jahr gerechnet zwischen 130 und 200 Stunden. Plus den kognitiven Wechsel — Inbox öffnen und nur die 12 echten Mails sehen, statt zwischen 80 News und Spam zu navigieren — das ist nicht zu unterschätzen.

Was das nicht ersetzt: ein Assistent, der für dich antwortet. Triage entscheidet *was du anschaust*, nicht *wie du reagierst*. Wer Antwort-Generation will, braucht ein anderes Setup (mit menschlichem Approval, weil falsche Antworten teurer sind als falsche Klassifikation).

## Was ich heute anders bauen würde

Wenn ich nochmal anfange: ich würde direkt mit eigenem Code starten und mir die n8n-Phase sparen. n8n hat seinen Platz für Customer-Workflows die ich zeigen will, aber für meinen eigenen Posteingang war es Overhead. Plain Code, ein Modul, ein systemd-Service, fertig.

Konkret: ~400 Zeilen TypeScript, SQLite für Persistenz, IMAP für Inbox-Read, Claude Haiku für Klassifikation. Das ganze läuft als systemd-Unit auf einem 10-Euro-Server. Keine Magic, kein Vendor-Lock-in.

Wer das nachbauen will: die schwierigste Stelle ist nicht die KI, sondern Gmail-App-Passwörter zu generieren. Google macht es einem nicht leicht.

---

*Wenn du wissen willst, ob KI-Mail-Triage für dein KMU Sinn ergibt, kannst du ein [Erstgespräch](/erstgespraech) buchen. 30 Minuten, kostenlos, kein Folgevertrag.*
