#!/usr/bin/env python3
"""
Holt das Portrait in die dunkle Bildwelt der Seite.

Warum keine Freistellung: Ohne ML-Segmentierung entsteht an Haaren und
Brillenrand ein Halo — auf dunklem Grund fällt genau das auf.

Warum nicht über Helligkeit: gemessen am Original ist die Haut mit 0.69
GENAU SO HELL wie die Wand (0.54–0.67). Eine Tonwertkurve trifft damit
zwangsläufig das Gesicht mit und wäscht es aus (erster Versuch, verworfen).

Was die beiden trennt, ist die SÄTTIGUNG:
    Haut   0.287 – 0.305
    Wand   0.032 – 0.065
    Haare  0.049   ← niedrig, aber ohnehin dunkel (0.147)
    Hemd   0.055   ← desgleichen (0.185)

Die Maske ist deshalb: gesättigt ODER dunkel = Person, alles andere =
Hintergrund. Nur der Hintergrund wird nach Charcoal gezogen.

Aufruf:  python3 tools/portrait-eindunkeln.py
Ergebnis: public/images/ben-portrait-dunkel.webp
"""
import os
from PIL import Image, ImageFilter
import numpy as np

# Original liegt bewusst AUSSERHALB von public/ — es wiegt 614 KB und
# soll nicht ausgeliefert werden, sondern nur Quelle der Bearbeitung sein.
QUELLE = "tools/quellen/ben-portrait.png"
ZIEL   = "public/images/ben-portrait-dunkel.webp"

# Anzeigegröße 296×370 (4:5), doppelt für Retina.
BREITE, HOEHE = 592, 740

CHARCOAL = np.array([0x14, 0x12, 0x10], dtype=float) / 255
EMBER    = np.array([0xE8, 0x5A, 0x2B], dtype=float) / 255

# Sättigungs-Fenster: unterhalb SAT_MIN ist es sicher Hintergrund, ab SAT_VOLL
# sicher Haut. Die Wand liegt mit 0.03–0.065 klar unter SAT_MIN — ohne diesen
# Sockel blieb sie als Mittelgrau stehen, statt nach Charcoal zu fallen.
SAT_MIN        = 0.11
SAT_VOLL       = 0.25
DUNKEL_SCHWELLE= 0.34   # darunter ebenfalls Person (Haare, Hemd)
MASKE_ERODIER  = 9      # Maske zuerst schrumpfen, dann weichzeichnen — sonst
MASKE_WEICH    = 4      # blutet sie nach außen und erzeugt einen Lichtkranz
HINTERGRUND_AB = 0.94   # wie stark der Hintergrund nach Charcoal fällt
WAERME         = 0.16   # Glut im Hintergrund, damit er nicht neutralgrau bleibt
KONTRAST       = 1.06   # Person minimal knackiger, damit sie nicht flau wirkt


def beschneiden(img):
    b, h = img.size
    ziel = BREITE / HOEHE
    if b / h > ziel:
        neu_b = int(h * ziel)
        img = img.crop(((b - neu_b) // 2, 0, (b - neu_b) // 2 + neu_b, h))
    else:
        img = img.crop((0, 0, b, int(b / ziel)))   # Kopf sitzt oben
    return img.resize((BREITE, HOEHE), Image.LANCZOS)


def main():
    img = beschneiden(Image.open(QUELLE).convert("RGB"))
    a = np.asarray(img, dtype=float) / 255.0

    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    sat = a.max(axis=2) - a.min(axis=2)

    # --- Personen-Maske: gesättigt ODER dunkel ---------------------------
    m_sat    = np.clip((sat - SAT_MIN) / (SAT_VOLL - SAT_MIN), 0, 1)
    m_dunkel = np.clip((DUNKEL_SCHWELLE - lum) / DUNKEL_SCHWELLE, 0, 1)
    person   = np.maximum(m_sat, m_dunkel)

    # Gesichtszone hart schützen: Die Brille ist blass-rosa und läge sonst
    # unter SAT_MIN — sie würde als Hintergrund abgedunkelt mitten im Gesicht.
    yy, xx = np.mgrid[0:HOEHE, 0:BREITE].astype(float)
    gesicht = np.clip(1.0 - np.sqrt(((xx - BREITE * 0.50) / (BREITE * 0.205)) ** 2 +
                                    ((yy - HOEHE * 0.42) / (HOEHE * 0.265)) ** 2), 0, 1)
    person = np.maximum(person, np.clip(gesicht * 3.0, 0, 1))

    # Erst schrumpfen, dann weichzeichnen. Nur weichzeichnen lässt die Maske
    # über die Silhouette hinauswachsen — die Wand direkt an Haaren und Brille
    # bleibt dann hell stehen und bildet einen Lichtkranz um den Kopf.
    bild = Image.fromarray((person * 255).astype(np.uint8))
    bild = bild.filter(ImageFilter.MinFilter(MASKE_ERODIER))
    person = np.asarray(bild.filter(ImageFilter.GaussianBlur(MASKE_WEICH)),
                        dtype=float) / 255.0

    hintergrund = 1.0 - person

    # --- Hintergrund nach Charcoal ziehen --------------------------------
    staerke = hintergrund * HINTERGRUND_AB
    a = a * (1 - staerke[..., None]) + CHARCOAL[None, None, :] * staerke[..., None]

    # --- Glut nur im Hintergrund, von links oben -------------------------
    # Wirkt als beleuchteter Bildgrund, nicht als Fleck auf dem Gesicht,
    # weil die Personen-Maske sie aussperrt.
    glut = np.clip(1.0 - np.sqrt(((xx - BREITE * 0.06) / (BREITE * 0.85)) ** 2 +
                                 ((yy - HOEHE * 0.20) / (HOEHE * 0.85)) ** 2), 0, 1) ** 2
    a = np.clip(a + EMBER[None, None, :] * (glut * hintergrund * WAERME)[..., None], 0, 1)

    # --- Person leicht anziehen ------------------------------------------
    mitte = 0.5
    a = np.clip(mitte + (a - mitte) * (1 + (KONTRAST - 1) * person[..., None]), 0, 1)

    # --- Vignette ganz außen, damit die Ecken sicher schließen -----------
    d = np.sqrt(((xx - BREITE * 0.5) / (BREITE * 0.5)) ** 2 +
                ((yy - HOEHE * 0.45) / (HOEHE * 0.5)) ** 2)
    v = np.clip((d - 0.78) / 0.55, 0, 1)
    v = (v * v * (3 - 2 * v)) * 0.85
    a = a * (1 - v[..., None]) + CHARCOAL[None, None, :] * v[..., None]

    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(
        ZIEL, "WEBP", quality=88, method=6)

    print(f"{ZIEL}  {BREITE}×{HOEHE}  {os.path.getsize(ZIEL)/1024:.0f} KB "
          f"(vorher {os.path.getsize(QUELLE)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
