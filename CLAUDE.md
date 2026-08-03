# FINA — Orientierung für Änderungen

Jahres- und Monatskassenbuch im Browser. Statische Dateien, keine Frameworks, kein Build,
kein Server. Alle Inhalte kommen aus einer JSON-Datei, die der Nutzer hochlädt — **im Code
stehen keine Beträge, Banken, Kategorien oder sonstigen Daten**.

Der Bereich, der früher **Kakeibo** hieß, heißt in der Oberfläche **Flexible Payments**.
Die Schlüssel im Zustand und in den Dateinamen (`kak`, `kakCats`, `flexActual`,
`ui.view='kakeibo'`, `js/views/kakeibo.js`) behalten ihren alten Namen — umbenannt wurde
nur der sichtbare Text in `js/i18n.js`.

Diese Datei ist die Landkarte: sie soll erlauben, gezielt eine Datei zu öffnen, statt das
ganze Projekt zu lesen.

## Wo ändere ich was?

| Anliegen | Datei |
|---|---|
| Beschriftung, Sprache, Monatsnamen, `YEAR`, `CUR` | `js/i18n.js` |
| Farbe, Schrift, Abstand global | `css/tokens.css` |
| Kopfzeile, Reiter, Karten, Kennzahlenleiste | `css/layout.css` |
| Knöpfe, Siegel, Lampen, Fenster, Formulare, Tooltip | `css/components.css` |
| Tabellen der Monats-/Prognose-/Flexible-Payments-Ansicht | `css/ledger.css` |
| Jahresmatrix: Spalten, Trennlinien, Betragsfarben | `css/matrix.css` |
| Reihenfolge der Reiter, Auswahllisten, SVG-Symbole | `js/config.js` |
| Zahlen-/Textformat, Fälligkeitsregeln (A/M/E, Zahltag) | `js/format.js` |
| Aufbau des Zustands, Altdateien reparieren (`migrate`) | `js/state.js` |
| Kategorie umbenennen/anlegen/löschen | `js/categories.js` |
| Summen, Salden, „Monat erledigt", Rangfolge der flexiblen Werte | `js/calc.js` |
| Datei laden/speichern, dirty-Zustand, Statuszeile | `js/storage.js` |
| CSV-Import aus Fast Budget | `js/csv.js` |
| Notizlampe, Tooltip, Kurzmeldung, Fenster schließen | `js/ui.js` |
| Inhalt einer Ansicht | `js/views/jahr·monat·prognose·kakeibo.js` |
| Inhalt eines Fensters | `js/dialogs/item·kakeibo-betraege·settings·csv-import·guide.js` |
| Was beim Klick passiert; Start der Anwendung | `js/app.js` |

## Die vier Regeln

**1. Views erzeugen `data-*`, `app.js` verdrahtet.**
Views und Dialoge liefern nur HTML-Zeichenketten zurück, sie hängen keine Klicks an. Jedes
`data-…`-Attribut in einer View wird in `wire()` in `js/app.js` abgeholt. Ein neuer Knopf
braucht also immer zwei Stellen: das Attribut in der View und eine Zeile in `wire()`.
Ausnahme: `data-note` und `data-tip` gehören `js/ui.js` und funktionieren überall von
selbst.

Bestehende Attribute: `paid` `kpaid` (Siegel) · `filter` `duefilter` `kd` (Filter) ·
`kpick` `ktop` `kmonth` (Flexible Payments: rechte Spalte, Zeitraum) · `goto` `kview`
(Sprünge in eine andere Ansicht) ·
`edit` `kedit` `lists` (Fenster) · `plan` (Prognose).

**2. Kategorien nie direkt umbenennen.**
Positionen zeigen über den *Namen* auf ihre Kategorie (`it.group`), die flexiblen Werte
hängen als Schlüssel in `kak`, `plan`, `flexActual` und `tx[].main`. Wird ein Name in `state.groups`
oder `state.kakCats` einfach überschrieben, verlieren die Zeilen ihren Bezug und
verschwinden aus der Anzeige. Immer `renameGroup()` / `renameKakCat()` aus
`js/categories.js` benutzen — die ziehen alles Abhängige mit.

**3. Kein sichtbarer Text im Code.**
Jede Beschriftung läuft über `t('schlüssel')` aus `js/i18n.js`, wo Englisch und Deutsch
nebeneinander stehen; Platzhalter sind `{0}`, `{1}`, … Die Oberfläche startet auf Englisch,
die Wahl steht in `state.lang` und damit in der JSON-Datei. `MONTHS`, `MONTHS_LONG`, `YEAR`
und `CUR` sind Getter auf `window` — sie lesen Sprache und Datei bei jedem Zugriff, die
Fundstellen (`MONTHS[i]`, `YEAR`) bleiben unverändert. **Achtung:** eine lokale Variable
namens `t` verdeckt die Übersetzungsfunktion. Buchungen heißen deshalb überall `x`.
`'EINNAHMEN'`, `'(ohne Hauptkategorie)'` und `'(ohne Kategorie)'` sind Schlüssel im
Zustand und dürfen **nicht** übersetzt werden — sonst verlieren die Zeilen ihre Daten.
Angezeigt werden sie über `keyLabel()` aus `js/i18n.js`, und zwar in jeder Sprache auf
Englisch (`INCOME`, `(no main category)`, `(no category)`). Überall, wo so ein Name auf den
Bildschirm geht, steht `esc(keyLabel(name))`; wo er als Wert, `data-…` oder Vergleich
gebraucht wird, bleibt der rohe Name stehen.

**4. Klassische Skripte, feste Reihenfolge.**
Keine ES-Module und kein `fetch`, damit die Seite auch per Doppelklick über `file://`
läuft. Neue Dateien in `fina-dashboard.html` eintragen: `i18n.js` zuerst, dann Werkzeuge,
dann Ansichten, `app.js` bleibt die letzte. Auf oberster Ebene deklarierte `const`/`function` sind für alle später
geladenen Dateien sichtbar.

## Die Saldokorrektur

`state.balance` ist eine einzelne Position über den Einnahmen — der Nutzer trägt dort je
Monat nach, was über die Monate an Ungenauigkeit aufgelaufen ist. Sie steht **nicht** in
`state.fixed`: dort geriete sie in `income()`, `fixedCost()`, die Filter und die
Kategorien. Stattdessen:

* `balanceFix(m)` in `js/calc.js` liefert den Monatsbetrag, `saldo()` addiert ihn.
* `findItem(id)` findet sie neben allen Posten aus `state.fixed` — `data-edit`,
  `data-paid` und die Notizlampe laufen darüber.
* Gepflegt wird sie im gewöhnlichen Posten-Fenster (`js/dialogs/item.js`); für sie
  entfallen dort Block-Auswahl und Löschknopf (`isBalanceItem(it)`).
* Gezeigt wird sie wie eine Kategorie: in der Monatsansicht als eigene Karte `.sec-bal`,
  in der Jahresmatrix über `mrow(…,{asCat:true, cls:'sec r-bal'})`, in der Prognose als
  Spalte `.balcol`. Die Farbe kommt aus `--bg-bal` / `--bg-bal-2` / `--edge-bal`.

## Nach jeder Änderung neu zeichnen

`render()` baut die Ansicht komplett neu auf und ruft danach `wire()`. Wer den Zustand
ändert, ruft `save()` (setzt nur das dirty-Flag) und dann `render()`. Geschrieben wird die
Datei ausschließlich über „Daten speichern".

## Prüfen

Es gibt keine Testsuite. Änderungen im Browser gegen `fina-demo-2026.json` prüfen und dabei
auf die Konsole achten. Sinnvolle Durchgänge: leerer Start ohne Datei (darf nirgends
abstürzen), Datei laden, alle vier Ansichten, **beide Sprachen**, Einstellungsfenster mit
Umbenennen **plus** einer zweiten Aktion, CSV-Import, Saldokorrektur eintragen und im Saldo
wiederfinden, Speichern und erneutes Laden.

Nach jeder Textänderung prüfen, ob jeder benutzte Schlüssel im Wörterbuch steht:

```sh
grep -rho "t('[a-z][a-zA-Z.]*'" js | sort -u   # benutzt
grep -o "^'[a-zA-Z.]*'" js/i18n.js | sort -u   # vorhanden
```
