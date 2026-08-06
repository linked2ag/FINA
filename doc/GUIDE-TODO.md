# Noch nicht in der Anleitung

Was hier steht, gibt es in der Anwendung, aber noch nicht im Bereich **Guide**
(`js/dialogs/guide.js`). Die Liste ist der Merkzettel dafür: die Anleitung wird nicht bei
jeder Änderung mitgeschrieben, sondern in einem Zug nachgezogen, wenn der Nutzer es sagt.

Wer eine Funktion baut, trägt sie hier ein — mit einem ⚠, wenn dadurch ein vorhandener
Absatz der Anleitung **falsch** geworden ist; solche Stellen gehen vor. Wer die Anleitung
nachzieht, arbeitet die Punkte ab und streicht sie hier. Die Bildschirmfotos in `doc/img/`
bleiben dabei liegen: neue werden nur gemacht, wenn ausdrücklich darum gebeten wird.

---

Der Reiter **Was ist neu** wird ebenfalls nicht laufend mitgeschrieben: eine neue Version
entsteht nur, wenn der Nutzer ausdrücklich darum bittet — sonst gäbe es zu viele. Diese
Liste ist deshalb der Merkzettel für **alle drei** Reiter.

## Offen

Am 6. August 2026 gebaut, noch in keinem Reiter:

- **Der erste Balken franst aus statt einer Marke.** Ist die Achse beschnitten, läuft der
  Balken der Monatseröffnung zum Rand hin ins Durchsichtige aus; der gestrichelte Strich ist
  weg. Betrifft **keinen** Absatz — die Anleitung beschreibt das seit jeher so. Nur
  `doc/img/ui-waterfall.png` zeigt weiter den alten Stand.
- **Begrüßungsseite:** der Text läuft so breit wie die beiden Knöpfe darunter, und der Satz,
  der zur Anleitung schickt, steht in deren Orange. Braucht keinen eigenen Absatz — betrifft
  nur `doc/img/welcome.png`.
- **Der Reiter „Flexible Payment Details"** startet mit dem ganzen Jahr und der ersten
  Kategorie im rechten Bereich. Ein Halbsatz im Produktreiter, wo der Reiter beschrieben ist.
- **Sprechblasen stehen jetzt über oder unter dem Element**, nicht mehr daneben. Verhalten,
  kein Absatz — nur zu erwähnen, falls die Anleitung einmal beschreibt, wo sie erscheinen.
- **Die Schnelleingabe ist flacher**: der Hinweis steht in derselben Zeile wie die Knöpfe.
  Betrifft `doc/img/item-quick.png`.

**Der Reiter „Was ist neu" ist bewusst unangetastet.** Eine neue Version entsteht nur auf
ausdrückliche Bitte — sag Bescheid, dann bekommt alles unten eine Nummer.

## Zuletzt eingearbeitet

Am 6. August 2026, vierter Durchgang — in **Schritt für Schritt** und **Was FINA kann**,
beide Sprachen. Die Bildschirmfotos blieben liegen; zwei Stellen zeigten Dinge, die es nicht
mehr gibt, und wurden deshalb entfernt statt neu beschriftet:

- **Zwei Kategorielisten** im Einstellungsbereich: Einnahmen links, Ausgaben rechts, und die
  Regel, dass ein Name über beide Listen hinweg nur einmal vorkommen darf — daran erkennt
  FINA, ob ein Posten Geld bringt oder kostet (Schritt 5 in beiden Sprachen)
- **Die Bezeichnung ist die Überschrift**: kein Feld mehr, ein Klick öffnet ein kleines
  Fenster mit Abbrechen und Übernehmen; „Speichern" ohne Namen öffnet dasselbe Fenster. Gilt
  für Kategorien wie für Posten (Schritt 7)
- **Der Mittelwert über der Schnelleingabe**, orange, aus den feststehenden Monaten
  gerechnet und beim Tippen mitlaufend (Schritt 7)
- **Die Prognose neu beschrieben** (Schritt 13 und Produktreiter): eine Tabelle über die
  volle Breite, kurze Überschriften mit Erklärung beim Überfahren, der laufende Monat
  hervorgehoben, die abgerechneten blass — und die Spalte **Verlauf** mit ihrem Raster. Die
  rechte Karte mit den Annahmen gibt es nicht mehr; wo sie stand, steht jetzt, dass die
  Annahme im Fenster der Kategorie gepflegt wird. **`forecast-plan.png` ist aus beiden
  Reitern entfernt** — das Bild zeigte eine Karte, die es nicht mehr gibt


Am 6. August 2026, dritter Durchgang: **alle Bildschirmfotos neu**, und zwar aus der neuen
Beispieldatei `fina-demo-en.json` — durchweg englisch, ohne persönliche Daten, mit den
üblichen Posten eines Haushalts. `doc/make-shots.py` nimmt sie jetzt als Vorgabe (der Pfad
lässt sich mit `FINA_DEMO=…` überschreiben). Sechs Abzüge sind auf eine feste Höhe
beschnitten, weil die Datei mehr Posten hat als die alte und die Bilder sonst zu lang für
den Anleitungsbereich würden: `year`, `month`, `flexible`, `month-out`, `year-left`,
`flex-view`.

Am 6. August 2026, zweiter Durchgang — in **alle drei** Reiter und beide Sprachen, dazu neue
Abzüge von `welcome`, `month`, `month-in`, `month-flex`, `month-out`, `ui-kpi`,
`ui-analytics`, `legend` und `guide`:

- die **Begrüßungsseite** in Schritt 1 (mit Bild) und in „Die ersten Schritte"; dass die
  Kopfzeile keinen Knopf zum Öffnen mehr hat und auf der Begrüßungsseite nur die Anleitung
  trägt
- die **Klapp-Pfeile** samt Doppelklick auf die Überschrift, Vorgabe „alles offen", die
  Ablage in der Datei und das automatische Klappen beim Filtern (Schritt 9 und Produktreiter)
- **Version 26.8.6.1** im Reiter „Was ist neu", in beiden Sprachen: Begrüßungsseite,
  Auswertung mit Zeitstrahl und Wasserfall, Filterzeile für alle Bereiche, klappbare Blöcke,
  Kleinigkeiten

Am 6. August 2026 in die Reiter **Schritt für Schritt** und **Was FINA kann** übernommen, in
beiden Sprachen — dazu neue Bildschirmfotos `ui-analytics`, `ui-waterfall` und frische Abzüge
von `ui-kpi`, `month`, `month-in`, `month-flex`, `month-out`, `month-bal`:

- der **Auswertungsbereich** als eigener Abschnitt im Produktreiter: die dünne Zahlenzeile, der
  Klick, der sie aufklappt, die fünf Zeilen des Zeitstrahls (Monatseröffnung · Monatsanfang ·
  Monatsmitte · Monatsende · Monatsabschluss), der Wasserfall mit seinen Farben, der Maßstab
  am Kontostand samt beschnittener Achse, die Sprechblase nur an den Farben, der Klickfilter
  und die Regel, dass alles ohne Zahltag beim Monatsabschluss aufgenommen wird
- Schritt 10 heißt weiter „Die Zahlen oben lesen", verweist jetzt aber auf die Auswertung und
  zeigt sie
- Schritt 9 und der Absatz zur Monatsansicht im Produktreiter: die **Filterzeile steht oben und
  gilt für alle drei Bereiche**, mit dem fünften Knopf „Monatsabschluss" und dem Hinweis
  „(n ausgeblendet)" neben der Überschrift
- die **Klapp-Pfeile**: jeder Bereich lässt sich zuklappen, in der Farbe des Bereichs und über
  der Abhakspalte; die Wahl steht in der Datei und gilt für alle zwölf Monate

Am 5. August 2026 in **beide** Reiter der Anleitung und beide Sprachen übernommen — die
Bildschirmfotos blieben dabei liegen, sie zeigen den Stand davor:

- der Hamburger-Knopf vor jedem Suchfeld: worin der Filter sucht (Bezeichnung · Notizen ·
  Monatsbeträge · Jahressummen · Kategorie, Bank, Zahlungsart, Fälligkeit), Speichern und
  Abbrechen, mindestens eine Angabe, die Wahl in der Datei, der dunkle Knopf. Schritt 9 und
  12, im Produktreiter der neue Abschnitt „Etwas wiederfinden" — und als einziger Punkt auch
  im Reiter „Was ist neu", Version 26.8.5.2
- abbezahlte Zeilen auf grauem Grund, in beiden Ansichten dasselbe Grau (Schritt 8, Absatz
  zur Monatsansicht)
- die Spalte „Art" der Flexible Payment Details, mit den fünf Wörtern und der Zählung übers
  Jahr (Produktreiter)
- der Reiter „Flexible Payment Details" nur mit Import und als letzter, und sein Name gegen
  den der Geldart abgegrenzt (Schritt 1, Fast-Budget-Schritt, Abschnitt „Die Ansichten" —
  vorher „Die vier Ansichten")
- der CSV-Import in der Kopfzeile, mit dem Fenster über die benötigten Spalten davor
  (Fast-Budget-Schritt, Absatz „Die alltäglichen Ausgaben")
- die Prognose rechnet nur noch: beide Spalten gerechnet, die Annahme im Fenster der
  Kategorie (Produktreiter)
- Duplizieren in beiden Fenstern (Schritt 6 und 7, Absatz „Regelmäßige Kosten, Schritt für
  Schritt")
- „Saldo je Monat" bleibt beim Filtern stehen (Schritt 12, Aufzählung „Die Jahrestabelle
  lesen")
- Vorzeichenfarbe beim Tippen (Schritt 6, Absatz zu den Beträgen)
- Notizlampen vor dem ersten Speichern und Zeilenumbrüche in Notizen (Schritt 6, Abschnitt
  „Notizen")
- Doppelklick in jeder Ansicht, auf Betrag **und** Bezeichnung (Schritt 9 und 12, Absatz zur
  Monatsansicht, Aufzählung „Die Jahrestabelle lesen")
- die Fokusregel des Suchfelds auch in der Jahresansicht, und das Feld wird beim Öffnen einer
  Datei geleert (Schritt 12, Abschnitt „Etwas wiederfinden")

Am 4. August 2026 in beide Reiter und beide Sprachen übernommen:

- Startansicht je nach Datei (mit Datei der laufende Monat, ohne das Jahr)
- der Block wird gewählt, nicht vorgegeben; ohne ihn wird nicht gespeichert
- die Filterzeile der Monatsansicht in neuer Reihenfolge, mit „Bezahlt", zum Abschalten
  und mit Sofort-Hinweisen
- die Fokusregel des Suchfelds — zurück nur, wenn etwas darin steht
- Suchfeld und Doppelklick auf einen Betrag in der Jahresansicht
- die beiden Jahresfilter: feste Beschriftung, dunkel wenn angewendet, in der Datei
  gespeichert, Vorgabe aus
- klebende Kartenköpfe (Monat) und Blockzeilen (Jahr)
- die Marken der Flexible Payments am rechten Zeilenende
