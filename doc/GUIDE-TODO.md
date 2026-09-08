# Noch nicht in der Anleitung

Was hier steht, gibt es in der Anwendung, aber noch nicht in **„Schritt für Schritt"** oder
**„Was FINA kann"** (`js/dialogs/guide.js`). Die Liste ist der Merkzettel dafür: diese
beiden Reiter werden nicht bei jeder Änderung mitgeschrieben, sondern in einem Zug
nachgezogen, wenn der Nutzer es sagt.

Wer eine Funktion baut, trägt sie hier ein — mit einem ⚠, wenn dadurch ein vorhandener
Absatz der Anleitung **falsch** geworden ist; solche Stellen gehen vor. Wer die Anleitung
nachzieht, arbeitet die Punkte ab und streicht sie hier. Die Bildschirmfotos in `doc/img/`
bleiben dabei liegen: neue werden nur gemacht, wenn ausdrücklich darum gebeten wird.

---

*(leer — Stand 6.9.26 spät, siehe „Zuletzt eingearbeitet")*

**Der Reiter „Was ist neu" läuft nicht über diese Liste.** Eine neue Version bekommt
ihren Eintrag automatisch, sobald ein Stand fertig ist — nicht erst auf Zuruf (siehe
CLAUDE.md, Abschnitt „Drei Reiter, drei Fragen"). Ein Punkt hier kann also schon im Reiter
„Was ist neu" stehen und trotzdem offen bleiben, weil „Schritt für Schritt" oder „Was FINA
kann" ihn noch nicht kennen — das steht dann direkt beim Punkt.

## Offen, aber keine Textstelle

- **Die Bildschirmfotos in `doc/img/` sind vom 7. September 2026** und zeigen den Stand
  26.9.6 (Mac-Chrome, ein Fenster für alle Posten, Wizard-Schritt 3). Die Anleitung zeigt
  `welcome`, `set-general`, `set-groups`, `item-dialog`, `item-flex`, `month-page`,
  `month-slim`, `year-left`, `forecast`, `item-months`, `csv-step3`,
  `ui-filter`; `legend` (alt, nicht mehr in `SHOTS`), `set-lists`, `month`, `month-in`,
  `month-flex`, `month-out`, `month-bal`, `ui-header`, `ui-kpi`, `ui-analytics`,
  `ui-waterfall`, `item-quick`, `year`, `flexible`, `guide` liegen ungenutzt oder dienen
  README und Startseite. Neue Abzüge nur auf ausdrückliche Bitte (`doc/make-shots.py`).
- **Das Impressum fehlt** (Anschrift offen) — sobald es da ist, gehört ein Satz in „Was
  FINA kann", Abschnitt „Speichern und Sicherheit", neben der Datenschutzerklärung.

## Zuletzt eingearbeitet

Am 7. September 2026, **alle drei Reiter und die Wizard-Anleitung neu gebaut** nach den
beiden Vorlagen in `_BusinessCenter/DESIGN/260907 Guide für FINA (von GPT).html` und
`… Guide für Wizard (von GPT).html`: nummerierte Schritte mit je einem Bild (außer
„Speichern"), ein Merksatz „Die einfache Regel", vier Kärtchen für die Bereiche, je
Funktion ein Block mit Titel und Text, im Reiter „Was ist neu" je Version eine Karte mit
Überschrift, Satz und Häkchenliste (die neueste gelb als „Aktuelle Version"). Die
Wizard-Anleitung beginnt mit „Kurz erklärt" und der Tabelle „Was möchtest du tun?". Die
Bausteine heißen `gcall` · `gstep` · `gcard` · `gfeat` · `gver` (`js/dialogs/guide.js`),
ihre Regeln stehen in `css/components.css`. Alle Bilder neu aus `fina-demo-en.json`.

Am 6. September 2026 (spät), **beide Reiter neu geschrieben**, beide Sprachen — nach dem
Vorbild der ChatGPT-Produktseite: zuerst, was man bekommt (drei Fragen, die FINA
beantwortet), dann Beispiele, dann kurze Abschnitte mit je einer Frage, nummerierte
Schritte, ein ehrlicher Abschnitt „Was FINA nicht ist", am Ende die Einladung zur Umfrage.
Damit sind **alle** Punkte abgearbeitet, die seit dem 11. August aufgelaufen waren:

- **Schritt für Schritt** hat sieben Schritte statt acht: der Tabellenimport ist weg,
  „Einnahmen" und „Rechnungen" sind ein Schritt (ein Fenster, ein Knopf „Neuer Eintrag"),
  die flexiblen Ausgaben nennen den CSV-Import als zweiten Weg. Die Kreise (grün · blau
  mit Pfeil · Fragezeichen) ersetzen die Siegelerklärung samt Bild `legend`.
- **Was FINA kann** beschreibt den Stand 26.9.6: das Mac-Chrome (Segmented Control,
  ☰-Menü, „Daten speichern" tritt heraus), drei Bereiche mit je einem „N/A", die
  Filterzeile mit „Filteroptionen…" und drei Aufklappmenüs (gelb, wenn ein Filter greift),
  die Monatsleiste unter der Filterzeile, die vierte Kennzahl „Saldo", Klappen per Klick
  mit Pfeil beim Überfahren, der Zeitstrahl mit „Jetzt" und gefilterter Fassung, die
  Jahrestabelle mit Filtermenüs und den beiden Ausblenden-Knöpfen als Sitzungsschalter
  (Vorgabe unter „Darstellung"), die Prognose mit SUM und PROG und beiden Doppelklicks,
  „Import Details" aus den Quellzeilen der flexiblen Posten (ohne „korrigiert"), das
  Posten-Fenster in Blöcken mit „In den Einstellungen ändern:", gesperrten Import-Monaten
  und „Importdaten zeigen", der CSV-Import in drei Schritten mit gemerkten Strukturen und
  Importkriterien, die Filteroptionen in den Einstellungen (fünf Kästchen plus sechster
  Haken), der Hinweis auf das ältere Dateiformat, die zwei Netzverbindungen (Umfrage,
  Update-Prüfung in den Apps), die Schriften ohne fremden Server, das Telefon zum
  Nachsehen, die Umfrage statt eines Preises, die Apps als „in Arbeit" (kein Download,
  kein Preis).
- **Gestrichen** sind alle Absätze zum Fast-Budget-Import, zum Tabellenimport, zum
  Beträge-Fenster der flexiblen Kategorien, zu CORRECTED/IMPORTED, zu „Noch offen", zum
  Sammellink „Banken, Zahlungsarten & Kategorien bearbeiten", zur Sprachwahl in der
  Kopfzeile, zum Tastengriff D und zur ✓/?-Zeile neben den Reitern.
- **Die Anleitung neben dem CSV-Import** (`C2_GUIDE`) nennt seit demselben Abend das
  Klappen der Blockzeilen und „Alle aufklappen / Alle zuklappen", die sechs
  Vergleichsarten und die genauen Knopfnamen; die Farbliste ist entdoppelt.

## Offen seit dem Abend des 8.9.26 (Fassung 26.9.8, zweiter Stand des Tages)

Nur „Was ist neu" ist nachgezogen. Für **„Was FINA kann"** fehlen:

- **Eigene Namen für die Referenzfelder** — der Stift in Schritt 2 des Imports und im
  Fenster der Importzuordnung; der Name gilt dem nächsten Import, was im Buch steht,
  behält seinen. ⚠ Der Absatz über den CSV-Import spricht noch von „Referenz 1 bis 5" als
  festen Namen.
- **Die Filterzeile im schmalen Fenster**: alle Filter rücken in ein ☰ neben dem Suchfeld,
  roter Punkt, solange einer greift.
- **Die lokale Datenbank** — ⚠ überall dort, wo die Anleitung „Datei" für das Buch sagt,
  heißt es in der Oberfläche jetzt „lokale Datenbank"; die Knopfnamen im Text
  („Daten hochladen", „Daten schließen") stimmen nicht mehr.
- Kleinkram ohne eigenen Absatz: die Zahlen der Auswertung zählen sich um, die Seite
  blendet beim Öffnen ein, „Suchen nach Betrag" schreibt in den Schnellfilter.

Für **„Schritt für Schritt"**: der neue Kasten „Diese Anleitung ging von selbst auf" steht
schon darin; sonst ist nichts nachzuziehen — die sieben Schritte sind unberührt.

Die Historie der früheren Durchgänge (4. bis 11. August 2026) und die Punkteliste vom
11. August bis 6. September stehen in der Git-Geschichte dieser Datei; sie werden hier
nicht mehr mitgeführt.
