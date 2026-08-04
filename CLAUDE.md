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
| Kopfzeile, Reiter, Karten, Kennzahlenleiste, mitlaufende Leisten | `css/layout.css` |
| Knöpfe, Siegel, Lampen, Fenster, Formulare, Tooltip | `css/components.css` |
| Tabellen der Monats-/Prognose-/Flexible-Payments-Ansicht | `css/ledger.css` |
| Jahresmatrix: Spalten, Trennlinien, Betragsfarben | `css/matrix.css` |
| Reihenfolge der Reiter, Auswahllisten, SVG-Symbole | `js/config.js` |
| Zahlen-/Textformat, Fälligkeitsregeln (A/M/E, Zahltag) | `js/format.js` |
| Aufbau des Zustands, Altdateien reparieren (`migrate`) | `js/state.js` |
| Kategorie umbenennen/anlegen/löschen | `js/categories.js` |
| Summen, Salden, „Monat erledigt", Rangfolge der flexiblen Werte, mittlerer Verbrauch | `js/calc.js` |
| Datei laden/speichern, dirty-Zustand, Statuszeile | `js/storage.js` |
| CSV-Import aus Fast Budget | `js/csv.js` |
| Notizlampe, Tooltip, Kurzmeldung, Fenster schließen | `js/ui.js` |
| Inhalt einer Ansicht | `js/views/jahr·monat·prognose·kakeibo.js` |
| Inhalt eines Fensters | `js/dialogs/item·kakeibo-betraege·settings·csv-import.js` |
| Text der Anleitung und der Bereich rechts | `js/dialogs/guide.js` |
| Bildschirmfotos für README und Anleitung | `doc/make-shots.py` → `doc/img/` |
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
`edit` `kedit` `lists` (Fenster) · `newitem` `newkak` (neu anlegen) · `plan` (Prognose).

`data-newitem` trägt den vorgewählten Block: `"1"` heißt „der erste der Liste", sonst steht
dort der Name (`EINNAHMEN` aus dem Einnahmenblock der Monatsansicht). `data-newkak` öffnet
`editKak(null)` — dasselbe Fenster wie für eine vorhandene Kategorie, nur leer. Angelegt
wird erst beim Speichern; wer abbricht, hinterlässt nichts.

**2. Kategorien nie direkt umbenennen.**
Positionen zeigen über den *Namen* auf ihre Kategorie (`it.group`), die flexiblen Werte
hängen als Schlüssel in `kak`, `plan`, `flexActual` und `tx[].main`. Wird ein Name in `state.groups`
oder `state.kakCats` einfach überschrieben, verlieren die Zeilen ihren Bezug und
verschwinden aus der Anzeige. Immer `renameGroup()` / `renameKakCat()` aus
`js/categories.js` benutzen — die ziehen alles Abhängige mit.
Umbenannt wird an zwei Stellen: im Einstellungsfenster und im Beträge-Fenster
(`editKak`). Beide rufen `renameKakCat()` und führen danach `state.kakCats` selbst nach —
die Funktion rührt die Liste nicht an.

**Kürzel sind der Sonderfall.** Banken und Zahlungsarten hängen genauso über ihren Wert an
den Posten (`it.bank`, `it.pay`), wandern aber **nicht** selbständig mit: das Kürzel steht
so auch in der Jahresübersicht, und ein alter Wert kann gewollt sein. `js/dialogs/settings.js`
vergleicht die Kürzel vor der Zuweisung (`scanCodes`) und fragt einmal für alle Änderungen
zusammen (`askCarryCodes`), mit Zahl der betroffenen Posten und der Folge einer Ablehnung.
Wer ablehnt, behält die alten Werte in der Datei — die Posten passen dann zu keinem
Listeneintrag mehr und tragen im Posten-Fenster ein Fragezeichen.

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
läuft. Neue Dateien in `index.html` eintragen: `i18n.js` zuerst, dann Werkzeuge,
dann Ansichten, `app.js` bleibt die letzte. Auf oberster Ebene deklarierte `const`/`function` sind für alle später
geladenen Dateien sichtbar.

## Die Saldokorrektur

`state.balance` ist eine einzelne Position über den Einnahmen — der Nutzer trägt dort je
Monat nach, was über die Monate an Ungenauigkeit aufgelaufen ist. Sie steht **nicht** in
`state.fixed`: dort geriete sie in `income()`, `fixedCost()`, die Filter und die
Kategorien. Stattdessen:

* `balanceFix(m)` in `js/calc.js` liefert den Monatsbetrag, `saldo()` addiert ihn.
* `findItem(id)` findet sie neben allen Posten aus `state.fixed` — `data-edit` und die
  Notizlampe laufen darüber.
* **Sie wird nicht abgehakt.** Ihr Betrag *ist* die Korrektur, die der Nutzer von Hand
  einträgt; es gibt nichts zu bestätigen. Deshalb hat sie kein Siegel in der Monatsansicht,
  kein Zeichen in der Jahresmatrix und keine Monatssiegel im Fenster — nur die Notizlampen
  bleiben. `paid` und `estimated` sind für sie bedeutungslos und werden in `migrate()`
  zurückgesetzt.
* Gepflegt wird sie im gewöhnlichen Posten-Fenster (`js/dialogs/item.js`); für sie
  entfallen dort Block-Auswahl, Betragsart, Löschknopf und die beiden Sammelknöpfe zum
  Abschließen (`isBalanceItem(it)`).
* Gezeigt wird sie wie eine Kategorie: in der Monatsansicht als eigene Karte `.sec-bal`,
  in der Jahresmatrix über `mrow(…,{asCat:true, cls:'sec r-bal'})`, in der Prognose als
  Spalte `.balcol`. Die Farbe kommt aus `--bg-bal` / `--bg-bal-2` / `--edge-bal`.

## Der laufende Monat

Nirgends steht ein Monatsname fest im Code — auch nicht in einer Beschriftung. Wer „jetzt"
meint, nimmt eine der beiden Stellen:

* `CUR` (`js/i18n.js`) ist der laufende Monat 1…12. Gehört die Datei zu einem anderen Jahr,
  liefert `CUR` eine 1 — der laufende Monat liegt dann außerhalb.
* `elapsedMonths()` (`js/calc.js`) sagt, wie weit das Jahr der Datei gelaufen ist: im
  laufenden Jahr `CUR`, in einem vergangenen 12, in einem künftigen 0. Damit rechnet
  alles, was „bis heute" bedeutet — etwa der Durchschnitt in `avgMonths()`.
* `completedMonths()` ist dasselbe **ohne** den laufenden Monat (`CUR-1`): er ist noch
  nicht abgerechnet. Damit rechnet alles, was „abschließen" heißt — die Knöpfe „Alle
  Monate bis … abschließen" in den beiden Beträge-Fenstern.

Der Name dazu kommt immer aus `MONTHS[CUR-1]` bzw. `MONTHS_LONG[…]`, nie aus dem Text.

## Das Einstellungsfenster

Links ein Menü, rechts der gewählte Bereich (`js/dialogs/settings.js`). Gebaut werden
**immer alle** Bereiche, umgeschaltet wird nur `hidden`. Das ist Absicht: `collect()` liest
die Felder aller Bereiche, und Getipptes überlebt so den Wechsel. Der gewählte Bereich
steht in `setPane` — einer Modulvariablen, nicht im Zustand: das Fenster baut sich bei
„+", Entfernen und Sortieren komplett neu auf, und ohne `setPane` landete man dabei jedes
Mal wieder ganz vorn. Ein neuer Bereich braucht drei Zeilen: einen Eintrag in `NAV`, einen
`pane(…)`-Aufruf und die Texte in `js/i18n.js`.

## Die Anleitung ist ein Bereich, kein Fenster

`js/dialogs/guide.js` hängt die Anleitung als `<aside class="guidepanel">` rechts an den
Bildschirmrand: sie bleibt offen, während man in der Tabelle weiterarbeitet. Derselbe
orange Knopf `#btnGuide` klappt sie auf und wieder zu (`toggleGuide()`), `aria-pressed`
sagt, ob sie offen ist.

Die Breite steht in der CSS-Variablen `--guidew` — beim ersten Öffnen ein Drittel des
Fensters, danach das, was am Griff (`.ghandle`) gezogen wurde, begrenzt auf 300 px bis zwei
Drittel. Dieselbe Variable macht die Seite schmaler (`body.guideon .wrap`); überdeckt wird
nichts. Der Wert lebt nur in der Sitzung (`guideW`), nicht im Zustand und nicht in der
Datei. Jede Änderung der Breite ruft `syncMatrixHead()` — die mitlaufenden Leisten sind
sonst falsch gemessen.

`renderChrome()` ruft `renderGuide()`: der Bereich wird nur dann neu gebaut, wenn sich die
Sprache geändert hat. Escape schließt ihn nicht — das gehört den Fenstern.

**Zwei Reiter, zwei Leser.** `GUIDE` in `js/dialogs/guide.js` hat zwei Zweige mit je einer
englischen und einer deutschen Fassung: `steps` führt einen Anfänger einmal von oben nach
unten durch das Anlegen des Buches und endet mit dem Monatsrhythmus; `product` beschreibt,
was die Anwendung kann. Gewählt wird über `guideTab` (Modulvariable, nicht im Zustand) und
`guideTo(tab)`. Ein dritter Reiter braucht einen Zweig in `GUIDE`, eine Zeile in
`GUIDE_TABS` und einen Schlüssel in `js/i18n.js`.

**Bilder.** `gshot('dateiname','Bildunterschrift')` setzt ein Bild aus `doc/img/`; der Klick
öffnet es in voller Größe in einem neuen Reiter, weil im schmalen Bereich sonst nichts zu
erkennen wäre. Die Bilder werden nicht von Hand gemacht: `doc/make-shots.py` baut aus
`index.html` eine Wegwerfseite, lädt eine Beispieldatei hinein und fotografiert die
Ausschnitte mit Chrome ohne Fenster (`python3 doc/make-shots.py [name …]`). Wer die
Oberfläche ändert, ruft das Skript hinterher auf; ein neues Bild braucht eine Zeile in
`SHOTS`.

Die Zeichenerklärung der Monatsansicht (`.legendbar`) steht aus demselben Grund außerhalb
der Karten: dieselben Siegel gibt es in allen drei Blöcken.

## Die Kürzelspalten der Jahresmatrix

**B** (bank) · **PT** (payment type) · **DD** (due date) · **LP** (last payment) — in beiden
Sprachen gleich, wie „Fast Budget" auch. Die Buchstaben stehen in `matrixHead()` in
`js/views/jahr.js`; die Klassen `cB/cZ/cF/cE` und `col.c-b/c-z/c-f/c-e` in `css/matrix.css`
tragen noch die alten Namen und sagen nur, welche Spalte gemeint ist. Wer die Buchstaben
ändert, ändert sie an fünf Stellen mit: `year.hint`, `year.hintTerm`, `set.banksSub`,
`item.pay`/`item.due`/`item.endM`/`item.endY` und `set.pays` in `js/i18n.js`. `year.end` ist
die Überschrift der LP-Spalte, kein Wort — der Text „letzte Zahlung" steht in `end.tip`.

## Die Farbstufen der drei Geldarten

Jede Geldart hat in `css/tokens.css` drei Stufen und eine Kante: `--bg-x` für die Posten,
`--bg-x-2` für die Kategorie darüber, `--bg-x-3` für die Kopfzeile des Blocks, `--edge-x`
für Kanten und Linien (`x` = `in`, `flex`, `out`, `bal`). Die Stufen sind der Grund, warum
man in der Jahresmatrix ohne Suchen sieht, worin man gerade liest — wer eine Farbe ändert,
ändert sie hier und nicht an der einzelnen Zeile.

In der Jahresmatrix tragen `tr.sec.r-*` die dritte Stufe, `tr.grp.r-out` die zweite, die
Posten die erste; die Kante wiederholt sich schmal als `box-shadow: inset` am ersten Feld,
damit sie auch beim seitlichen Scrollen stehen bleibt. In der Monatsansicht tragen die
Karten `.card.sec-*` die Kante links und eine Linie unter der Überschrift, die
Kategoriezeile darin (`.card.sec-out .ledger tr.group`) die zweite Stufe. Die neutrale
`tr.group` bleibt neutral — im Flexible-Payments-Bereich gliedert dieselbe Zeile Monate und
Hauptkategorien, keine Kostenblöcke.

## Was beim Öffnen einer Datei einmal entschieden wird

`afterLoad()` in `js/state.js` läuft **nur** beim Öffnen, Trennen und beim Start — nicht
bei jedem Zeichnen. Es setzt `ui.kakDetail` auf „mit Unterkategorien", wenn die Datei
importierte Buchungen mitbringt, und sonst auf „nur Hauptkategorien": ohne Import gibt es
keine Unterkategorien, der Knopf dazu ist dann in `js/views/kakeibo.js` auch gesperrt. Die
View erzwingt das zusätzlich (`canDetail`), damit Anzeige und Knopf nie auseinanderlaufen.
Kommen die ersten Buchungen per Import herein, schaltet `js/dialogs/csv-import.js` die
Unterkategorien ein — aber nur, wenn vorher gar keine da waren; eine spätere eigene Wahl
bleibt unangetastet.

Dort steht auch, **womit man begrüßt wird**: mit Datei der laufende Monat
(`ui.view='monat'`, `ui.month=CUR`), ohne Datei die Jahresansicht. Der Unterschied ist der
Zweck der beiden Ansichten — im Monat wird gearbeitet, im Jahr angelegt, und ein leerer
Monat zeigt nichts. Die Unterscheidung hängt an `fileName` aus `js/storage.js`: der Name
steht schon, bevor `afterLoad()` läuft, und ist beim Trennen wieder leer. `ui` selbst wird
nie gespeichert — die Wahl gehört zur Anzeige, nicht in die Datei.

Wer weitere Vorgaben ans Öffnen hängen will, hängt sie in `afterLoad()`.

## Tab läuft nur durch die Felder

`tabThroughFields(root)` in `js/ui.js` nimmt alles aus der Tab-Reihenfolge, was kein
Eingabefeld ist — Notizlampen, Siegel, Stifte, Beleglinks, Zeilenknöpfe. Anklickbar bleibt
alles, nur der Tabulator springt daran vorbei; sonst käme man beim Ausfüllen der zwölf
Monatsfelder nur jeden dritten Sprung an ein Feld. Zwei Bereiche bleiben absichtlich
vollständig erreichbar: die Knöpfe der Fußzeile eines Fensters (`.row-end`) und die
Kopfzeile der Seite.

Aufgerufen wird sie an zwei Stellen: in `wire()` für `#view` und in jedem Fenster direkt
nach `document.body.appendChild(box)`. **Ein neues Fenster muss den Aufruf mitbringen** —
sonst fällt es aus der Regel heraus.

## Leisten, die stehen bleiben

Die Kopfzeile klebt oben (`header{position:sticky}`), alles mit der Klasse `.stickybar`
klebt darunter: die Knopfleiste der Jahresmatrix (`#yearBar`), die Bedienleiste der
Flexible Payments und die Kennzahlenleisten von Monat und Prognose. Das `top` dieser Leisten steht **nicht**
im Stylesheet — die Kopfzeile ist je nach Ansicht unterschiedlich hoch, weil es die
Monatsreiter nur im Monat gibt. `syncStickyTops()` in `js/app.js` misst sie und setzt das
Maß; die Funktion läuft am Ende von `wire()` sowie bei jedem Scrollen und Größenwechsel.
Eine neue mitlaufende Leiste braucht deshalb nur die Klasse.

Zwei Dinge gehören dazu: ein **deckender Hintergrund** und ein **Polster statt Rand** nach
unten. Ein Rand ist durchsichtig — dort schiene der Inhalt durch, der darunter wegscrollt.
Die Kennzahlen der Prognose stecken aus demselben Grund in einem Rahmen: `.kpi` braucht
ihre eigene Hintergrundfarbe für die 1px-Trennlinien und kann den Papiergrund nicht
zugleich tragen.

## Nach jeder Änderung neu zeichnen

`render()` baut die Ansicht komplett neu auf und ruft danach `wire()`. Wer den Zustand
ändert, ruft `save()` (setzt nur das dirty-Flag) und dann `render()`. Geschrieben wird die
Datei ausschließlich über „Daten speichern".

## Prüfen

Es gibt keine Testsuite. Änderungen im Browser gegen eine eigene Datei prüfen und dabei
auf die Konsole achten. Sinnvolle Durchgänge: leerer Start ohne Datei (darf nirgends
abstürzen), Datei laden, alle vier Ansichten, **beide Sprachen**, Einstellungsfenster mit
Umbenennen **plus** einer zweiten Aktion, CSV-Import, Saldokorrektur eintragen und im Saldo
wiederfinden, Speichern und erneutes Laden. Dazu: aus Jahr **und** Monat je einen Posten und
eine Flexible-Payments-Kategorie anlegen, eine Kategorie ohne jeden Betrag in allen drei
Ansichten wiederfinden, und in beiden Beträge-Fenstern abschließen und wieder öffnen.

Nach jeder Textänderung prüfen, ob jeder benutzte Schlüssel im Wörterbuch steht:

```sh
grep -rho "t('[a-z][a-zA-Z.]*'" js | sort -u   # benutzt
grep -o "^'[a-zA-Z.]*'" js/i18n.js | sort -u   # vorhanden
```
