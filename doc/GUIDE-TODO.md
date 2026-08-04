# Noch nicht in der Anleitung

Was hier steht, gibt es in der Anwendung, aber noch nicht im Bereich **Guide**
(`js/dialogs/guide.js`). Die Liste ist der Merkzettel dafür: die Anleitung wird nicht bei
jeder Änderung mitgeschrieben, sondern in einem Zug nachgezogen, wenn der Nutzer es sagt.

Wer eine Funktion baut, trägt sie hier ein — mit einem ⚠, wenn dadurch ein vorhandener
Absatz der Anleitung **falsch** geworden ist; solche Stellen gehen vor. Wer die Anleitung
nachzieht, arbeitet die Punkte ab und streicht sie hier. Die Bildschirmfotos in `doc/img/`
bleiben dabei liegen: neue werden nur gemacht, wenn ausdrücklich darum gebeten wird.

---

Der Reiter **Was ist neu** ist davon unberührt: dort steht jede Änderung schon, sobald sie
gebaut ist. Diese Liste betrifft nur die beiden erklärenden Reiter.

## Offen

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
