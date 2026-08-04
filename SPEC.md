# FINA — Technische Spezifikation

Stand: 2. August 2026 · Version 1.2 · Einstieg: `index.html`

## 1. Zweck

FINA ersetzt eine manuell gepflegte Google-Sheets-Jahresabrechnung. Die Anwendung führt zwei
Datenquellen zusammen:

- **Regelmäßige Kosten und Einnahmen** — Verträge, Kredite, Abos, Miete, Unterhalt. Werden in
  der Anwendung selbst gepflegt und monatsweise als bezahlt abgehakt.
- **Flexible Payments** — flexible Alltagsausgaben, die der Nutzer täglich in der App
  *Fast Budget* erfasst und monatlich als CSV exportiert. FINA importiert diese Datei und
  ordnet die Buchungen den Hauptkategorien zu. Der Bereich hieß früher „Kakeibo"; die
  Schlüssel im Zustand (`kak`, `kakCats`, `flexActual`) tragen deshalb weiter dieses Kürzel.

Darüber liegt eine dritte, von Hand gepflegte Zeile: die **Saldokorrektur**
(`state.balance`), mit der der Nutzer je Monat ausgleicht, was über die Monate an
Ungenauigkeit aufgelaufen ist.

Daraus entstehen eine Jahresmatrix, eine Monatsabrechnung, eine Restjahres-Prognose und eine
Kategorienauswertung.

## 2. Technische Rahmenbedingungen

| Punkt | Entscheidung |
|---|---|
| Auslieferung | Statische Dateien: `index.html` plus `css/` und `js/`. Läuft auf GitHub Pages und ebenso lokal per Doppelklick |
| Aufbau | Gestaltung in `css/`, Logik in `js/`, Struktur in der HTML-Datei. Klassische `<script>`-Dateien in fester Reihenfolge, keine Module und kein `fetch` — damit auch `file://` funktioniert |
| Abhängigkeiten | Keine Frameworks. Google Fonts (Zilla Slab, Archivo, IBM Plex Mono) per CDN, mit Fallbacks |
| Persistenz | Ausschließlich eine vom Nutzer gewählte JSON-Datei. Kein `localStorage`, kein Server |
| Datei-API | File System Access API (`showOpenFilePicker` / `showSaveFilePicker`). Fallback auf `<input type=file>` und Download-Blob |
| Sprache | Englisch und Deutsch, umschaltbar in den Einstellungen (`state.lang`, Vorgabe `en`). Alle Texte in `js/i18n.js`, Zugriff nur über `t('schlüssel', …)`. Zahlen bleiben in beiden Sprachen im Format `de-DE` — so stehen sie in der Datei und so werden sie eingetippt. Feste Schlüssel im Zustand (`EINNAHMEN`, `(ohne Hauptkategorie)`, `(ohne Kategorie)`) dürfen nicht übersetzt werden und erscheinen über `keyLabel()` in jeder Sprache auf Englisch |
| Jahr | `state.year`, einstellbar in den Einstellungen. `YEAR` und `CUR` sind Getter auf `window` und lesen die Datei; `CUR` ist der reale Monat, sonst Januar |

Kein Auto-Save: Jede Änderung setzt ein `dirty`-Flag; gespeichert wird nur auf Klick.
`beforeunload` warnt bei ungespeicherten Änderungen.

## 3. Datenmodell

Der gesamte Zustand liegt in einem Objekt `state`, das unverändert als JSON geschrieben wird.

```jsonc
{
  "year": 2026,             // Abrechnungsjahr, Einstellung
  "lang": "de",             // Oberflächensprache "en" | "de", Einstellung
  "labWidth": 250,          // Breite der Positionsspalte in px
  "monWidth": 100,          // Breite der Monats-Betragsspalten in px
  "topMin": 50,             // ab diesem Betrag zählt eine Buchung als größter Einzelposten
  "lastImport": "1.8.2026, 17:50:15",

  "banks":  [{ "code": "H",  "label": "Sparkasse Heidenheim" }],
  "pays":   [{ "code": "L",  "label": "Lastschrift" }],
  "groups": ["WOHNKOSTEN", "AUTO", "KREDITE", "TOOLS", "SCHEIDUNG",
             "SPORT", "VERSICHERUNGEN", "SONSTIGES"],

  "balance": {                      // Saldokorrektur — genau eine Position,
    "id": "balance-correction",     // feste Kennung, nicht löschbar
    "name": "Balance Correction",
    "group": "",                    // gehört keinem Block an
    "amounts": [0, 0, …],           // 12 Werte, plus wie minus erlaubt
    "paid": [false, …], "note": "", "notes": ["", …],
    "estimated": false, "bank": "", "pay": "", "dueDay": "", "end": null, "url": ""
  },

  "fixed": [{
    "id": "ix8f2ac",
    "name": "Kassel, Bunte Berna 15 (Miete)",
    "group": "WOHNKOSTEN",           // "EINNAHMEN" oder ein Eintrag aus groups
    "amounts": [-500, -500, …],      // 12 Werte, Ausgaben negativ
    "paid":    [true, true, …],      // 12 Flags
    "note":    "",                   // Notiz zur ganzen Position
    "notes":   ["", "", …],          // 12 Freitexte, je Monat einer
    "estimated": false,              // true = Summe nur geschätzt
    "bank": "H",                     // Code aus banks
    "pay":  "D",                     // Code aus pays
    "dueDay": "A",                   // "A" | "M" | "E" | "1".."31" | ""
    "end": { "y": 2028, "m": 5 },    // letzte Zahlung, oder null
    "url": "https://…"               // Beleg oder Vertrag, oder ""
  }],

  "kakCats": ["D-AILY", "E-X-TRA", …],   // aus dem CSV-Import oder von Hand gepflegt
  "kak": {
    "D-AILY": {
      "plan":     [-1062, …],   // Planwerte je Monat
      "paid":     [true, …],    // manuell als erfasst markiert
      "override": [null, …],    // Korrektur eines importierten Werts
      "note":     "",           // Notiz zur ganzen Kategorie
      "notes":    ["", …],      // je Monat eine
      "estimated": true,
      "url":      ""            // Beleg oder Vertrag, oder ""
    }
  },

  "flexActual": { "1": { "D-AILY": -1062 }, … },   // Ist-Werte je Monat
  "flexSource": { "1": "Fast Budget", "5": null },  // Herkunft, null = kein Import
  "plan": { "D-AILY": -800 },                       // Restwert der alten Planlogik
  "tx": [{ "y":2026, "m":5, "d":3, "main":"D-AILY", "cat":"Lebensmittel",
           "acc":"N26", "note":"", "v":-42.90 }]
}
```

`migrate(state)` füllt fehlende Felder auf und wandelt Altformate um (frühere
`status`-Arrays, `booked`, monatsweises `unclear`). Jede geladene Datei läuft durch diese
Funktion, ältere Dateien bleiben also lesbar.

Die Anwendung selbst enthält **keine** Beispieldaten. Banken, Zahlungsarten, Kategorien und
Posten stehen ausschließlich in der JSON-Datei; ohne geladene Datei startet FINA leer. Alle
vier Listen werden im Fenster „Einstellungen" gepflegt; eine Flexible-Payments-Kategorie
lässt sich zusätzlich in ihrem eigenen Fenster anlegen, umbenennen und löschen (`editKak`,
`editKak(null)` für eine neue). Beim Umbenennen wandern `kak`, `plan`, `flexActual` und die
`main`-Felder in `tx` mit, damit die Beträge am Namen hängen bleiben — deshalb immer
`renameKakCat()`, nie eine direkte Zuweisung.

`state.balance` steht bewusst **neben** `fixed`: in der Liste geriete die Zeile in
`income()`, `fixedCost()`, die Filter und die Kategoriesummen. `findItem(id)` in
`js/calc.js` findet sie trotzdem neben allen Posten, damit Stift, Siegel und Notizlampe
unverändert funktionieren.

## 4. Rechenregeln

```
income(m)        Σ amounts[m] aller Positionen mit group == "EINNAHMEN"
fixedCost(m)     Σ amounts[m] aller übrigen Positionen
paidCost(m)      wie fixedCost, nur paid[m] == true
openCost(m)      wie fixedCost, nur paid[m] == false

kakVal(k,m)      override[m]  ≠ null → override[m]
                 sonst hasActual(m) → flexActual[m][k]
                 sonst              → kak[k].plan[m]
kakeiboFor(m)    Σ kakVal(k,m) über alle kakCats
balanceFix(m)    balance.amounts[m]
saldo(m)         income(m) + fixedCost(m) + kakeiboFor(m) + balanceFix(m)
```

`hasActual(m)` ist wahr, sobald `flexSource[m]` gesetzt ist.

**Erledigt-Logik**

```
paidAt(it,m)     it.paid[m]
kakDone(k,m)     override gesetzt  ODER  hasActual(m)  ODER  paid[m]
                 ODER (nicht estimated UND plan[m] ≠ 0)
monthDone(m)     alle Positionen mit amounts[m] ≠ 0 sind bezahlt
                 UND alle Flexible-Payments-Kategorien sind erledigt
                 (die Saldokorrektur zählt hier nicht mit)
```

Ein erledigter Monat wird in der Monatsleiste und in der Jahresmatrix durchgestrichen und in
der Jahresansicht standardmäßig ausgeblendet.

## 5. CSV-Import (Fast Budget)

Der Parser sucht die Kopfzeile über das Vorkommen von `Hauptkategorie`, erkennt das Trennzeichen
selbst (`;` oder `,`) und liest die Spalten `Datum`, `Wert (EUR)`, `Kategorie`,
`Hauptkategorie`, `Konto`, `Notizen`. Beträge im deutschen Format (`-1.234,56`), Datum
`TT.MM.JJJJ`.

Die gewählte Datei wird zunächst nur gelesen. `scanImport` ermittelt daraus Zeitraum, Monate
mit Anzahl und Summe sowie noch unbekannte Hauptkategorien; geändert wird nichts. Darauf setzt
das zweistufige Fenster in `js/dialogs/csv-import.js` auf:

1. **Monate wählen** — alle Monate, die in der Datei vorkommen, sind vorausgewählt und einzeln
   abwählbar; Monate ohne Daten in der Datei sind gesperrt. Monate, in denen schon Daten
   stehen, tragen die Marke `ERSETZT`.
2. **Bestätigen** — je gewähltem Monat steht nebeneinander, was heute darin liegt (Buchungen,
   Quelle, Korrekturen, Summe) und was danach darin liegt. Erst dieser Knopf ändert den
   Zustand; `Zurück` und `Abbrechen` lassen ihn unberührt.

Ablauf von `applyImport(rows, monate)`:

1. Nur Zeilen des Zieljahres **und** der gewählten Monate übernehmen, Rest zählen und melden
   (`skipped` = anderes Jahr, `dropped` = abgewählter Monat).
2. Unbekannte Hauptkategorien zu `kakCats` hinzufügen und in `kak` anlegen.
3. Alle bisherigen Transaktionen der gewählten Monate verwerfen und durch die neuen ersetzen.
   Ein erneuter Import desselben Monats ist damit idempotent.
4. `flexActual` je Monat und Hauptkategorie neu summieren, `flexSource` auf `"Fast Budget"`
   setzen, vorhandene `override`-Korrekturen dieser Monate löschen.

Nicht angetastet werden dabei `plan`, `notes` und `paid` der Kategorien sowie jeder
nicht gewählte Monat. Geschrieben wird die Datei erst über „Daten speichern".

## 6. Ansichten

**Jahr** (Startansicht) — eine gemeinsam scrollende Matrix. Feste Spalten links: Stift, Link,
Notizlampe der Position, Position, B (bank), PT (payment type), DD (due date), LP (last payment). Danach je sichtbarem Monat zwei Spalten (Betrag, Markierung), rechts
die Gesamtspalte. Reihenfolge der Blöcke: Saldo, Saldokorrektur, Einnahmen, Flexible
Payments, regelmäßige Kosten, getrennt durch Leerzeilen. Die drei Symbolspalten links
(Stift, Link, Lampe) sind gleich breit, damit ihre Abstände untereinander und zur
Beschriftung gleich ausfallen. Der laufende Monat ist senkrecht rot eingerahmt. Die Matrix steht in
voller Länge im Dokument — senkrecht scrollt allein die Seite, waagerecht der Rahmen um die
Tabelle. Die linken Spalten bleiben über `position:sticky` stehen; die Knopfleiste darüber
klebt unter der Kopfzeile der Seite und die Spaltenköpfe unter der Knopfleiste — beides stellt
`syncMatrixHead()` in `js/app.js` bei jedem Scrollen ein (`--headY`, `#yearBar`). Positionen,
bei denen im Jahr nichts mehr aussteht (`yearSettled`), stehen grau hinterlegt und ohne
Ende-Ampel; der Knopf „Abgeschlossene ausblenden" nimmt sie ganz aus der Tabelle, die Summen
bleiben davon unberührt. Ans Ende ihrer Kategorie rutschen sie zusammen mit ausgelaufenen
Positionen (`yearFinished` = abbezahlt **oder** Laufzeit vor dem laufenden Monat beendet und
nichts mehr anstehend). Ausgelaufene ohne Haken bleiben farbig, damit der fehlende Haken
sichtbar bleibt. `settledLast` sortiert ebenso in der Monatsansicht.

**Monat** — vier farbige Karten: Saldokorrektur (hellblau, eine einzige Zeile), Einnahmen
(grün), Flexible Payments (gelb), regelmäßige Kosten (rot).
Spalten je Zeile: Bezahlt-Kreis, Betrag, Stift und die Lampe der Monatsnotiz, Name mit
Metazeile. Kategoriesummen stehen in der Betragsspalte. Zwei unabhängige Filterreihen:

- Zahlungsstand — alle, nur offene, nur geschätzte.
- Fälligkeit — alle, Monatsanfang, Monatsmitte, Monatsende. Ein als Zahltag hinterlegter Tag
  zählt mit: 1.–10. Monatsanfang, 11.–20. Monatsmitte, ab dem 21. Monatsende.

Die Reiter stehen in dieser Reihenfolge: **Monat · Jahr · Flexible Payments · Prognose**.

**Prognose** — fünf Kennzahlen ab dem laufenden Monat: erwartete Einnahmen, erwartete
regelmäßige Kosten (davon offen), erwartete Flexible Payments, Saldo bisher (Januar bis
Vormonat) und Saldo zum Jahresende. Darunter die Hochrechnung Monat für Monat, frühere Monate
ausgegraut; die Kumulation läuft über alle zwölf Monate, die letzte Zeile ist also der
Jahresendsaldo. Die Saldokorrektur steht darin als eigene Spalte „Balance corr.".
Rechts die Annahme je Kategorie in zwei Spalten: die Annahme, mit der gerechnet
wird, und daneben der Durchschnitt der letzten drei Ist-Monate (`avgMonths` / `avgActual` in
`js/calc.js`). „Ø übernehmen" schreibt den Durchschnitt in die Annahme — erst nach Rückfrage,
weil die bisherigen Werte dabei verloren gehen.

**Flexible Payments** — Auswertung der importierten Transaktionen; gezeigt werden nur Hauptkategorien aus
`kakCats`. Der Zeitraum kommt aus der Auswahlliste oben — „Ganzes Jahr" oder ein einzelner
Monat, daneben Vormonat, Folgemonat und Ganzes Jahr als Knöpfe — und gilt für beide Spalten. Links die Summen nach
Haupt- und Unterkategorie (umschaltbar), rechts die Buchungen dazu. Der Pfeil an einer Zeile
links füllt die rechte Spalte mit genau dieser Kategorie (`ui.kakPick`), nach Datum aufsteigend
und im Jahreszeitraum nach Monaten gruppiert. „Größte Einzelposten" schaltet zurück auf alle
Buchungen ab `topMin` (Vorgabe 50 €, einstellbar), nach Hauptkategorie gebündelt und darin
nach Betrag; der Wechsel
zwischen Haupt- und Unterkategorien schaltet ebenfalls dorthin zurück. Spalten rechts:
Datum · Beschreibung mit Notiz · Betrag. Hier liegt auch der CSV-Import.

**Einstellungen** (Knopf in der Kopfzeile) — links ein Menü mit fünf Bereichen, rechts der
gewählte: *Allgemein* (Sprache, Abrechnungsjahr), *Darstellung* (die beiden Spaltenbreiten
der Jahresmatrix, die Grenze für die größten Einzelposten `topMin`, 0 zeigt alle),
*Banken & Zahlungsarten*, *Regelmäßige Kategorien*, *Flexible-Payments-Kategorien*. Jede
Liste trägt ihr Pluszeichen direkt hinter der Überschrift. Gebaut werden immer alle
Bereiche, umgeschaltet wird nur die Sichtbarkeit — getippte Änderungen überleben deshalb
den Wechsel, und der gewählte Bereich (`setPane`) überlebt den Neuaufbau des Fensters beim
Hinzufügen, Entfernen und Sortieren. Alles davon steht in der JSON-Datei.
Die Sprache wirkt sofort, das Fenster wechselt mit.

**Anleitung** (Knopf in der Kopfzeile) — die Bedienung auf einer Seite, in der gewählten
Sprache. Der Text liegt in `js/dialogs/guide.js` und kommt bewusst ohne Bildschirmfotos
aus: sie veralten mit jeder Änderung an der Oberfläche.

## 7. Bedienelemente und Zeichen

| Zeichen | Bedeutung |
|---|---|
| Grüner Kreis mit Haken | bezahlt beziehungsweise erfasst |
| Leerer Kreis, gestrichelt | offen |
| Gelb gefüllter Kreis | offen, Betrag nur geschätzt |
| Oranger Betrag | Position ist geschätzt **und** in diesem Monat noch offen |
| Roter / grüner Betrag | Position mit bestätigtem Betrag: Ausgabe / Einnahme |
| Grau hinterlegte Zeile (Jahr) | im Jahr abbezahlt — jeder Betrag ist abgehakt, es steht nichts mehr aus; die Ampel in „Ende" entfällt dann |
| Farbige Zelle in „Ende" | Restlaufzeit **einschließlich** des laufenden Monats: grün nur noch dieser · blau 2 · gelb 3 bis 6 · rot mehr |
| Grüner Haken in der Jahresmatrix | bezahlt |
| Oranges Fragezeichen | geschätzt und offen |
| Glühbirne neben dem Namen | Notiz zur ganzen Position — in jeder Ansicht, in der die Position vorkommt |
| Glühbirne in einer Monatszelle | Notiz nur für diesen Monat |
| Graue Glühbirne | keine Notiz — kein Tooltip beim Überfahren |
| Gelbe Glühbirne | Notiz vorhanden, Text im Tooltip |
| `IMPORTED` | Wert stammt aus dem CSV-Import |
| `CORRECTED` | importierter Wert wurde von Hand überschrieben |
| Hellblaue Zeile | Saldokorrektur — von Hand nachgetragener Ausgleich, geht in den Saldo ein; wird nicht abgehakt |

## 8. Bekannte Grenzen

- Der vollständige Dateipfad ist nicht ermittelbar; die File System Access API gibt nur den
  Dateinamen heraus.
- Firefox und Safari unterstützen die API nicht. Dort greift der Fallback: Laden über einen
  Dateidialog, Speichern als Download.
- Ein Jahreswechsel erfordert eine Codeänderung an `YEAR` und eine neue Datei.
- Kein Mehrbenutzerbetrieb, keine Synchronisation, keine Historie. Ein Ablageort in einem
  Cloud-Ordner ersetzt das teilweise.
