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

- **Abbezahlte Positionen stehen jetzt auch in der Monatsansicht auf grauem Grund** — dieselbe
  Aussage wie in der Jahresansicht, und das Grau ist in beiden eine Spur heller geworden. Die
  Zeichenerklärung der Monatsansicht nennt es nicht.

- **Neue Spalte „Art" in der linken Karte der Flexible Payment Details** — importiert,
  korrigiert, abgeschlossen, fest oder geschätzt, beim ganzen Jahr mit der Zahl der Monate je
  Art. Der Absatz zu dieser Ansicht beschreibt bisher nur Balken und Betrag.

- ⚠ **Den Reiter „Flexible Payment Details" gibt es nur mit Import**, und er steht als letzter
  nach der Prognose. Die Anleitung nennt ihn an mehreren Stellen als eine der vier Ansichten,
  die immer da sind — Schritt 3 (Rundgang), der Absatz „Vier Ansichten" und die Aufzählung im
  Produktreiter. Dazu heißt er jetzt anders als die Geldart: die Blöcke und Kategorien bleiben
  „Flexible Payments".

- ⚠ **Der CSV-Import steht in der Kopfzeile**, nicht mehr im Reiter, und führt zuerst durch ein
  Fenster mit den benötigten Spalten. Die Absätze zum Import sagen „hier hochladen" und meinen
  den Reiter; der Knopfname wurde schon nachgezogen, der Ort noch nicht.

- ⚠ **Die Prognose schreibt nichts mehr.** Der Absatz „das ist die rechte Spalte" beschreibt ein
  Eingabefeld, das es nicht mehr gibt, und den Knopf zum Übernehmen des Ø gibt es auch nicht
  mehr. Beide Spalten sind gerechnet und nur zu lesen; darunter steht jetzt eine Erklärung, woher
  sie kommen. Schritt 13 ist bereits umgeschrieben, der Absatz im Produktreiter noch nicht.

- **Duplizieren gibt es in beiden Fenstern** — Posten wie Flexible-Payments-Kategorie. Die Kopie
  trägt alle Stammdaten und die zwölf Beträge, aber keinen Haken und keine Notiz; angelegt wird
  sie erst mit „Speichern". Schritt 5 und 7 der Anleitung nennen bisher nur „Hinzufügen".

- ⚠ **„Saldo je Monat" wird nicht mehr mitgefiltert.** Die Zeile bleibt in der Jahresansicht
  immer stehen. Wo die Anleitung sagt, der Filter gelte für jede Zeile der Jahrestabelle, ist
  das jetzt falsch.

- **Beträge färben sich beim Tippen** nach ihrem Vorzeichen (rot/grün), in den Monatsfeldern und
  in der schnellen Eingabe. Der Absatz „Ausgaben mit Minus" könnte das erwähnen.

- ⚠ **Notizen gibt es schon vor dem ersten Speichern.** Die Anleitung sagt bei den Notizen
  sinngemäß, dass eine Position dafür vorhanden sein muss; neue Posten und neue Kategorien haben
  ihre Lampen jetzt sofort. Dazu: **eine Notiz behält ihre Zeilenumbrüche** — in der
  Sprechblase, in der Vorschau unter dem Namen und in der Monatszelle des Fensters.

- ⚠ **Doppelklick gibt es jetzt in jeder Ansicht**, auf dem Betrag **und** auf der
  Bezeichnung. Schritt 12 und der Absatz „Die Jahrestabelle lesen" nennen ihn bisher nur
  für die Jahresansicht und nur für den Betrag; die Monatsansicht (Schritt 9), die
  Flexible Payments und die Prognose erwähnen ihn gar nicht.

- **Die Fokusregel gilt auch für das Suchfeld der Jahresansicht.** Nach den beiden
  Filterknöpfen und nach einem Sprung in einen Monat kehrt die Schreibmarke dorthin
  zurück, solange etwas im Feld steht. Schritt 12 sagt das bisher nur für die
  Monatsansicht (Schritt 9). Dazu: beim Öffnen einer Datei wird das Feld geleert.

## Zuletzt eingearbeitet

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
