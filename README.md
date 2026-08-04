# FINA — Kassenbuch

Jahres- und Monatsabrechnung im Browser. Ersetzt eine handgepflegte
Google-Sheets-Tabelle und führt zwei Quellen zusammen: die regelmäßigen Kosten und
Einnahmen, die in FINA selbst gepflegt werden, und die flexiblen Alltagsausgaben
(**Flexible Payments**), die als CSV aus *Fast Budget* importiert werden. Darüber steht
eine einzelne Zeile **Balance Correction**, mit der sich der Saldo je Monat von Hand
ausgleichen lässt.

Kein Server, keine Datenbank, keine Frameworks. Die Anwendung enthält **keine Daten** —
sie startet leer und liest alles aus einer JSON-Datei, die auf dem eigenen Rechner liegt.

## Benutzen

Die Seite öffnen und auf **Load data** klicken. Bearbeiten, dann **Save data**.

- Chrome und Edge schreiben direkt in dieselbe Datei zurück.
- Firefox und Safari können das nicht; dort wird die Datei heruntergeladen.
- Gespeichert wird nur auf Klick. Ungespeichertes steht **fett und rot** am Dateinamen in der
  Kopfzeile; die Knöpfe daneben bleiben schlicht.
- Die Oberfläche startet auf **Englisch**. Unter **Settings** lässt sich auf Deutsch
  umstellen — zusammen mit Abrechnungsjahr, Spaltenbreiten, der Grenze für die größten
  Einzelposten und den vier Listen. Alle diese Einstellungen stehen in der JSON-Datei und
  kommen beim Laden mit ihr zurück.
- **Guide** öffnet die Anleitung in der gewählten Sprache.
- Zum Ausprobieren liegt `fina-demo-2026.json` bei: erfundene Zahlen, sieben importierte
  Monate, alle Kategorien besetzt.

Lokal genügt ein Doppelklick auf `index.html` — es wird nichts nachgeladen, was
ein Browser bei `file://` blockieren würde.

## Aufbau

Struktur, Gestaltung und Logik liegen getrennt. Wer etwas ändern will, findet die Stelle
über den Dateinamen.

```
index.html              Gerüst der Seite und die Ladereihenfolge
fina-demo-2026.json     Beispieldatei zum Ausprobieren

css/
  tokens.css            Farben, Schriften, Reset — hier wirkt jede Änderung global
  layout.css            Kopfzeile, Reiter, Karten, Kennzahlen
  components.css        Schaltflächen, Siegel, Lampen, Formulare, Fenster, Listen
  ledger.css            die einspaltigen Tabellen (Monat, Prognose, Flexible Payments)
  matrix.css            die Jahresmatrix

js/
  i18n.js               alle Texte auf Englisch und Deutsch, Monatsnamen, YEAR, CUR
  config.js             Ansichtsliste, Auswahllisten, Symbole
  format.js             Zahlen, Text, Fälligkeitsbeschriftungen — reine Funktionen
  state.js              Datenmodell, leerer Zustand, migrate() für ältere Dateien
  categories.js         Kategorien umbenennen/anlegen/löschen samt Referenzen
  calc.js               alle abgeleiteten Zahlen; liest den Zustand, ändert ihn nie
  storage.js            Laden und Speichern der JSON-Datei
  csv.js                CSV-Import aus Fast Budget
  ui.js                 Kurzmeldung, Fensterschließen, Notizlampe
  views/                je Ansicht eine Datei: jahr · monat · prognose · kakeibo
  dialogs/              item · kakeibo-betraege · settings · csv-import · guide
  app.js                zeichnet, verdrahtet die Klicks, startet — wird zuletzt geladen
```

Die `<script>`-Dateien sind klassische Skripte in fester Reihenfolge, keine ES-Module.
Das ist Absicht: Module würden über `file://` an der CORS-Regel scheitern und die Datei
ließe sich nicht mehr per Doppelklick öffnen. Neue Dateien deshalb in
`index.html` an der passenden Stelle eintragen — Werkzeuge vor Ansichten,
`app.js` bleibt die letzte.

## Einstellungen und Listen

Sprache, Abrechnungsjahr, Spaltenbreiten der Jahresmatrix, die Grenze für die größten
Einzelposten und alle vier Listen — Banken,
Zahlungsarten, regelmäßige Kategorien und Flexible-Payments-Kategorien — liegen im Fenster
**Settings**. Es ist in fünf Bereiche geteilt: links das Menü, rechts der gewählte Bereich;
das Pluszeichen zum Anlegen steht direkt hinter der jeweiligen Überschrift.
Alle vier lassen sich anlegen,
umbenennen, per Ziehen sortieren und entfernen. Benennt man eine Flexible-Payments-Kategorie
um, wandern Planwerte, Ist-Werte, Korrekturen und die importierten Buchungen mit. Entfernt
man sie, werden genau diese Daten gelöscht — die Auswertung zeigt nur Kategorien, die in
dieser Liste stehen.

Die Beträge einer solchen Kategorie werden nicht dort, sondern über den Stift in der
Jahres- oder Monatsansicht eingetragen.

Eigene Kategorienamen sind Daten und stehen in der JSON-Datei; wer sie auf Englisch haben
möchte, benennt sie hier um. Die fest eingebauten Namen — `EINNAHMEN`,
`(ohne Hauptkategorie)`, `(ohne Kategorie)` — erscheinen dagegen in jeder Sprache
englisch (`INCOME`, `(no main category)`, `(no category)`), während der Schlüssel in der
Datei unverändert bleibt.

## Balance Correction

Eine feste Zeile über dem Einnahmenblock, hellblau, in der Monats- wie in der
Jahresansicht. Sie nimmt je Monat einen Betrag auf — plus oder minus — für alles, was über
die Monate nicht aufgeht. Der Wert geht in den Saldo ein und steht in der Prognose als
eigene Spalte. Gepflegt wird sie über denselben Stift wie jeder andere Posten; löschen
lässt sie sich nicht.

## Weiterlesen

- [CLAUDE.md](CLAUDE.md) — Landkarte für Änderungen: welche Datei wofür, und die drei Regeln
- [SPEC.md](SPEC.md) — Datenmodell, Rechenregeln, CSV-Format, bekannte Grenzen
- [PR.md](PR.md) — warum es FINA gibt und was es gegenüber der Tabelle besser macht
