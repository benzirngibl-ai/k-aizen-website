---
title: "Die 86%-Lücke: Wie dein KMU AI endlich nutzt (in 30 Tagen)"
description: "Praktische 30-Tage-Anleitung für KMU-Inhaber: Vom ChatGPT-Abo zur echten täglichen Nutzung. Acht Schritte, keine Tech-Kenntnisse nötig."
pubDate: 2026-05-27
slug: ai-brueckenbauer-kmu-30-tage
author: "Benjamin Zirngibl"
source_video: "https://www.youtube.com/watch?v=iIfOprq2kCM"
---

# Die 86%-Lücke: Wie dein KMU AI endlich nutzt (in 30 Tagen)

## Anna zahlt 23 € im Monat für nichts

Anna ist Steuerberaterin in Augsburg. Drei Mitarbeiterinnen, gut gehende Kanzlei. Vor acht Monaten hat sie ChatGPT Plus abonniert, weil ihr Steuerberater-Kollege beim Kammer-Frühstück davon geschwärmt hat. 23 € im Monat. Macht 184 €, die sie bisher gezahlt hat.

Genutzt hat sie es ungefähr sechsmal. Einmal für einen Brief an einen Mandanten, zweimal um ein BMF-Schreiben zusammenfassen zu lassen, dreimal aus Neugier. Ihre Mitarbeiterinnen? Haben's bei der Einführung einmal probiert, fanden's "ganz nett" und sind zurück zur Word-Vorlage von 2019.

Das ist nicht Annas Problem. Das ist das Problem von gefühlt drei Vierteln aller KMUs, die ich besuche. Die Tools sind da. Die Leute könnten sie auch bedienen. Es nutzt sie nur niemand.

Nate Herk hat in einem Video diese Woche eine IBM-Studie zitiert, die genau das in Zahlen gegossen hat: 86% der Mitarbeiter in großen Firmen hätten die Fähigkeiten, AI zu nutzen — oder könnten sie sich mit wenig Training aneignen. Aber nur 25% nutzen sie wirklich im Alltag. Eine Lücke von 61 Prozentpunkten. Und in kleinen Betrieben ist sie noch größer.

In diesem Tutorial zeige ich dir, wie du in deinem Betrieb diese Lücke schließt. Nicht in einem Jahr. Nicht mit einer großen Schulung. Sondern in 30 Tagen, mit 30 Minuten pro Tag, und mit dem Tool, für das du wahrscheinlich schon zahlst.

## Was du brauchst

- **Ein bezahltes AI-Abo, das du schon hast**: ChatGPT Plus (23 €/Monat) oder Claude Pro (20 €/Monat). Egal welches. Wenn du noch keins hast: nimm ChatGPT Plus, die Oberfläche ist für Einsteiger angenehmer.
- **30 Minuten pro Tag für 4 Wochen.** Am besten zur gleichen Zeit. Morgens nach dem Kaffee funktioniert bei den meisten meiner Kunden am besten.
- **Ein Notizbuch oder ein Google Doc.** Du wirst Sachen aufschreiben, die funktionieren, und Sachen, die nicht funktionieren.
- **Akzeptanz, dass du in Woche 1 langsamer bist als sonst.** Das ist normal. Das gibt sich.

Kein neuer Tech-Stack. Keine n8n-Workflows. Keine API-Keys. Du tippst in ein Textfeld und liest, was rauskommt.

## Die 8 Schritte

### Schritt 1: Mach dir den Tag-Audit (Tag 1-2)

Nimm dir ein leeres Blatt und schreib auf, was du letzten Dienstag den ganzen Tag gemacht hast. Wirklich alles. Mail beantwortet. Angebot getippt. Telefonat mit dem Lieferanten. Rechnung geschrieben. Kundentermin. Was-auch-immer.

Dann markiere alles, was du in irgendeiner Form **schon mal in ähnlicher Form gemacht hast.** Das sind Routineaufgaben. Die hundertste Anfragebestätigung. Das vierzigste Angebot über eine Badsanierung. Der wöchentliche Bericht ans Team. Solche Sachen.

Das ist deine Liste. Wahrscheinlich stehen da 8-15 Aufgaben drauf.

### Schritt 2: Wähle GENAU EINE Aufgabe (Tag 3)

Das ist der Schritt, an dem 90% scheitern. Sie wollen alles auf einmal optimieren.

Mach das nicht. Wähle eine einzige Aufgabe. Idealerweise eine, die:

- du mindestens 3x pro Woche machst
- dich 15-30 Minuten kostet
- aus Text besteht (Mail, Angebot, Beschreibung, Zusammenfassung)
- nicht haarsträubend wichtig ist (also nicht der Jahresabschluss, sondern eher die Standard-Anfrage-Beantwortung)

Bei Anna war das: Mandanten-Mails beantworten, in denen sie um eine Frist-Verlängerung beim Finanzamt gebeten wird. Macht sie 4-6 mal pro Woche. Standardisierter Vorgang.

### Schritt 3: Beschreib die Aufgabe wie einem neuen Azubi (Tag 4-5)

Jetzt machst du etwas, das sich erst mal blöd anfühlt: Du schreibst auf, wie du diese Aufgabe machst. Schritt für Schritt. So, als müsstest du es einem 17-Jährigen erklären, der am ersten Tag bei dir anfängt.

Bei Anna sah das so aus:

> Wenn ein Mandant um Fristverlängerung bittet, prüfe ich erst, ob es eine ESt-Erklärung oder eine USt-Voranmeldung ist. Bei ESt-Erklärungen können wir bis zum 31.8. des Folgejahres normal verlängern. Bei USt geht das nur in Ausnahmen. Dann schreibe ich eine kurze Mail an den Mandanten mit dem Stand und parallel ein Schreiben ans Finanzamt mit der Begründung. Begründung ist meistens: hohe Arbeitsauslastung des Steuerberaters, oder fehlende Unterlagen vom Mandanten...

Das ist dein **Kontext**. Das ist Gold. Genau dieses Wissen ist das, was AI nicht aus dem Internet ziehen kann.

### Schritt 4: Bau dein erstes Prompt-Template (Tag 6-7)

Öffne ChatGPT. Erstelle einen neuen Chat. Tipp folgendes (das ist ein Beispiel, du passt es auf deine Aufgabe an):

```
Du bist meine Assistenz in einer Steuerberatungs-Kanzlei.
Ich bin Steuerberaterin in Bayern, mein Name ist Anna Müller.

Deine Aufgabe: Mandanten-Mails beantworten, wenn um Fristverlängerung
gebeten wird. So funktioniert das bei uns:

[hier deine Schritt-für-Schritt-Beschreibung aus Schritt 3]

Ich gebe dir jetzt die eingehende Mail vom Mandanten. 
Du schreibst zwei Texte:
1. Antwort an den Mandanten (freundlich, klar, max. 5 Sätze)
2. Begründungs-Schreiben ans Finanzamt (formell, mit Aktenzeichen-Platzhalter)

Hier ist die Mail:
[einfügen]
```

Das ist dein Template. Speicher es. Wenn du ChatGPT Plus hast, klick oben auf "GPT erstellen" und mach daraus ein eigenes Custom-GPT — dann musst du den ganzen Kontext nicht jedes Mal neu reinpasten. Wenn dir das zu kompliziert ist: speicher den Text in einer Notiz-App und kopier ihn jedes Mal rein. Reicht völlig.

### Schritt 5: Teste 5-7 Mal in einer Woche (Tag 8-14)

In der zweiten Woche nutzt du dein Template für jede Aufgabe, die reinkommt. Wirklich jede. Nicht "ach, diese ist zu speziell". Auch die speziellen. Du lernst, wann es funktioniert und wann nicht.

Führ eine Mini-Liste: Was hat funktioniert? Was nicht? Was musste ich nachbessern?

Anna hat in der ersten Woche fünf Mails so beantwortet. Drei waren mit minimalen Änderungen verschickbar. Eine musste sie komplett neu schreiben, weil der Fall wirklich speziell war. Eine war 80% gut, 20% Quatsch (ChatGPT hat einen Paragraphen erfunden — dazu gleich mehr).

Das ist normal. Das ist exakt die Lernkurve.

### Schritt 6: Dokumentier, was funktioniert (Tag 15-18)

Nach der Testwoche überarbeitest du dein Template. Du fügst hinzu, was gut lief. Du nimmst raus, was zu Quatsch geführt hat. Du machst Regeln klarer ("Erfinde NIEMALS Paragraphen oder Aktenzeichen. Wenn du eine konkrete Rechtsgrundlage nennen würdest, schreib stattdessen [BITTE PARAGRAPH PRÜFEN].").

Das Dokument muss nicht schön sein. Ein Word-Doc reicht. Ein Google Doc reicht. Wichtig ist: es existiert, und du baust es Stück für Stück aus.

### Schritt 7: Hol genau eine Person mit ins Boot (Tag 19-25)

Jetzt der entscheidende Schritt. Jetzt wirst du zum Brückenbauer.

Wähle EINE Person aus deinem Team. Die, die am offensten ist. Nicht die, die am meisten Zeit hat — die, die am meisten Lust hat. Setz dich 60 Minuten mit ihr hin. Zeig ihr dein Template. Lass sie es einmal selbst nutzen, während du daneben sitzt. Beantworte ihre Fragen.

Dann gibst du ihr diese Aufgabe komplett ab. Sie macht ab jetzt die Fristverlängerungs-Mails mit dem Template. Du machst stichprobenhaft Qualitäts-Check.

Warum genau eine Person? Weil zwei oder drei gleichzeitig zu trainieren ist Stress, und du verlierst Fokus. Wenn die erste Person stabil läuft, kommt die zweite dran.

### Schritt 8: Nächste Aufgabe wählen (Tag 26-30)

Woche vier: Du gehst zurück auf deine Liste aus Schritt 1 und wählst die nächste Aufgabe. Du wiederholst Schritt 2-7. Diesmal geht's schneller, weil du die Methode kennst.

Nach 90 Tagen hast du 3 Aufgaben automatisiert. Nach 180 Tagen 6. Das hört sich nach wenig an. Aber 6 Routineaufgaben, die vorher 30 Minuten brauchten und jetzt 5, das sind 2,5 Stunden pro Tag pro Person.

## Was schief gehen kann

**Du willst zu viel auf einmal.** Klassiker Nummer eins. Du machst nicht eine Aufgabe, sondern fünf parallel, und nach zwei Wochen ist alles halbgar. Disziplin: eine nach der anderen.

**Du erwartest 100% sofort.** AI macht Fehler. ChatGPT erfindet manchmal Paragraphen, Personen, Zitate. Das nennt sich Halluzination. Dein Job in Woche 1-2 ist, das zu erkennen. Schreib in dein Prompt-Template explizit rein: "Erfinde keine Fakten. Wenn du unsicher bist, markiere die Stelle mit [PRÜFEN]."

**Du nimmst keinen mit.** Wenn nur du das Template nutzt, hast du dir einen zweiten Job geschaffen. Der Punkt ist, dass dein Team das übernimmt. Sonst wird's nie eine Routine, sondern bleibt dein Hobby.

**Du speicherst dein Template nicht.** Klingt banal. Passiert ständig. Schreib dein bestes Prompt-Template in ein Dokument, das deine Mitarbeiter finden. Sonst lebt das Wissen nur in deinem Kopf — und stirbt mit deinem nächsten Urlaub.

**Du machst es heimlich.** Ich hatte Kunden, die sich genierten, AI zu nutzen, und es vor dem Team versteckten. Schlechte Idee. Dein Team merkt, dass irgendwas anders ist, und vermutet das Schlimmste. Sag offen: "Ich teste was. Ich werde es mit euch teilen, wenn ich rausgefunden habe, wie's geht."

## Was es dir konkret bringt

Lass mich nicht rumreden. Hier sind die Zahlen, die ich bei meinen KMU-Kunden im ersten Halbjahr immer wieder sehe:

- **5-8 Stunden pro Woche zurück** für den Inhaber selbst, weil Routinekram nicht mehr bei ihm landet.
- **Eine zweite Person im Team, die's auch kann.** Das ist das, was Berater Bus-Faktor nennen — wenn du krank wirst, bricht nicht alles zusammen.
- **Dokumentierte Prozesse**, die du vorher nur im Kopf hattest. Allein das ist Gold wert, wenn du mal einen Mitarbeiter einarbeitest.
- **Ein echter Wettbewerbsvorteil**, solange dein Mitbewerber im Café noch über "dieses ChatGPT-Zeug" lästert. Das Fenster ist offen, aber nicht ewig.

Anna hat in den letzten drei Monaten 22 Stunden pro Monat zurückgewonnen. Das sind grob 5 Stunden pro Woche. Bei ihrem Stundensatz von 180 € sind das 3.960 € pro Monat. Für ein Abo, das sie ohnehin schon hatte.

## Wie geht's weiter

Wenn du das hier liest und denkst "klingt gut, aber ich weiß nicht, mit welcher Aufgabe ich anfangen soll" — dann ist genau das, wofür ich da bin.

Ich biete für KMU-Inhaber ein kostenloses 30-Minuten-Erstgespräch an, in dem wir gemeinsam deinen Tag-Audit machen und genau eine Aufgabe finden, mit der du loslegen kannst. Kein Verkaufsgespräch, kein Druck. Wenn du danach selbst weitermachen willst — gerne. Wenn du Hilfe willst — auch gerne.

Termin buchen kannst du auf [k-aizen.de/erstgespraech](https://k-aizen.de/erstgespraech).

---

*Inspiriert von einem Video von Nate Herk über die Karrierechancen, die rund um AI gerade in großen Firmen entstehen. Ich habe seine Kern-Idee — die Lücke zwischen "könnte AI nutzen" und "nutzt es wirklich" — auf KMU runtergebrochen. Original-Video: https://www.youtube.com/watch?v=iIfOprq2kCM*

---

*Inspired by [Nate Herk's video](https://www.youtube.com/watch?v=iIfOprq2kCM). Diese Version: KMU-Fokus, deutsch, kürzer.*
