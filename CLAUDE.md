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
| Reihenfolge der Reiter, welcher Reiter überhaupt erscheint, Auswahllisten, SVG-Symbole | `js/config.js` |
| Zahlen-/Textformat, Fälligkeitsregeln (A/M/E, Zahltag) | `js/format.js` |
| Aufbau des Zustands, Altdateien reparieren (`migrate`) | `js/state.js` |
| Kategorie umbenennen/anlegen/löschen | `js/categories.js` |
| Summen, Salden, „Monat erledigt", Rangfolge der flexiblen Werte, mittlerer Verbrauch | `js/calc.js` |
| Datei laden/speichern, dirty-Zustand, Statuszeile | `js/storage.js` |
| CSV-Import aus Fast Budget | `js/csv.js` |
| Notizlampe, Tooltip, Kurzmeldung, Fenster schließen, Entwürfe, Vorzeichenfarbe | `js/ui.js` |
| Inhalt einer Ansicht | `js/views/jahr·monat·prognose·kakeibo.js` |
| Inhalt eines Fensters | `js/dialogs/item·kakeibo-betraege·settings·csv-import·filter-fields.js` |
| Text der Anleitung und der Bereich rechts | `js/dialogs/guide.js` |
| Bildschirmfotos für README und Anleitung | `doc/make-shots.py` → `doc/img/` |
| Was der Anleitung noch fehlt (Merkzettel) | `doc/GUIDE-TODO.md` |
| Was beim Klick passiert; Start der Anwendung | `js/app.js` |

## Die vier Regeln

**1. Views erzeugen `data-*`, `app.js` verdrahtet.**
Views und Dialoge liefern nur HTML-Zeichenketten zurück, sie hängen keine Klicks an. Jedes
`data-…`-Attribut in einer View wird in `wire()` in `js/app.js` abgeholt. Ein neuer Knopf
braucht also immer zwei Stellen: das Attribut in der View und eine Zeile in `wire()`.
Ausnahme: `data-note` und `data-tip` gehören `js/ui.js` und funktionieren überall von
selbst.

Bestehende Attribute: `paid` `kpaid` (Siegel) · `filter` `duefilter` `q` `qfields` `kd` (Filter) ·
`kpick` `ktop` `kmonth` (Flexible Payments: rechte Spalte, Zeitraum) · `goto` `kview`
(Sprünge in eine andere Ansicht) ·
`edit` `kedit` `dbledit` `dblkedit` `lists` (Fenster) · `newitem` `newkak` (neu anlegen).

`data-dbledit` und `data-dblkedit` sitzen an der **Zeile**, nicht an der Zelle, und sie
gibt es in **jeder** Ansicht: ein Doppelklick auf den Betrag oder auf die Bezeichnung
öffnet dasselbe Fenster wie der Stift. Gebaut werden sie mit `dblItem(id)` /
`dblKak(key)` aus `js/ui.js`; verdrahtet sind sie einmal in `wire()`.

Welche Zelle zählt, steht dort in `DBLCELL`: `td.num` (Beträge), `td.amt` (Betrag der
Monatsansicht), `td.lab` (Bezeichnung der Jahresmatrix), `td.nm` (Bezeichnung überall
sonst). **Eine neue Zeile mit Bezeichnung braucht also `class="nm"` an dieser Zelle**,
sonst reagiert nur der Betrag. Nicht ausgelöst wird der Doppelklick auf Knöpfen, Links und
Eingabefeldern — Siegel, Stift, Lampe und Beleglink behalten ihr
gewohntes Verhalten. Summen-, Gruppen- und Unterkategoriezeilen tragen das Merkmal nicht:
dort gibt es keine Position zu öffnen.

`data-newitem` trägt den vorgewählten Block: `"1"` heißt **ohne Vorauswahl**, sonst steht
dort der Name (`EINNAHMEN` aus dem Einnahmenblock der Monatsansicht). Ohne Vorauswahl steht
im Fenster `item.blockPick` („— bitte wählen —"), und `#fSave` weist das Speichern zurück:
ein Posten ohne Block stünde in keiner Kategorie der Monatsansicht und in keiner Gruppe der
Jahresmatrix. Eine stille Vorauswahl landete unbemerkt in der Datei — deshalb keine. `data-newkak` öffnet
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

## Welche Reiter es gibt

`VIEWS` in `js/config.js` ist die Reihenfolge der Reiter — und die Liste selbst hängt am
Zustand: **„Flexible Payment Details" erscheint nur, wenn einmal importiert wurde**
(`hasImport()` in `js/calc.js`: Buchungen in `state.tx` oder eine Quelle in
`state.flexSource`). Der Reiter wertet genau diese Buchungen aus; ohne sie stünde dort eine
leere Gliederung. Er steht als **letzter**, nach der Prognose.

Daraus folgen drei Stellen, die zusammengehören:

* **Der Weg zum Import darf nicht in diesem Reiter liegen.** Der Knopf steht in der
  Kopfzeile (`#btnImport` in `index.html`, verdrahtet unten in `js/app.js` wie
  `#btnSettings`) und öffnet `openImportInfo()` — ein Fenster, das erst sagt, aus welcher
  App die Datei kommt und welche Spalten darin stehen müssen, und dann zur Dateiauswahl
  führt. Danach laufen wie bisher Schritt 1 und 2 in `js/dialogs/csv-import.js`.
* **`render()` lenkt um.** Steht `ui.view` noch auf `'kakeibo'`, obwohl es den Reiter nicht
  mehr gibt (Datei getrennt, Datei ohne Buchungen), wäre kein Reiter ausgewählt — dann
  tritt die Prognose an seine Stelle.
* **Was in den Reiter springt, prüft `hasImport()` mit.** In der Monatsansicht erscheint
  der Knopf „Auswertung öffnen" (`data-kview`) nur mit Import.

Der Name des Reiters (`view.kakeibo`) ist nicht der Name der Geldart. Für die drei Blöcke,
die Kategorien und alles, was „Flexible Payments" als Art von Geld meint, steht `g.flex`.

## Die Spalte „Art" der Flexible Payments

Die linke Karte des Reiters zeigt links vor dem Betrag, **woher** er stammt: `flexKind(k,m)`
in `js/calc.js` liefert `corr` · `imp` · `done` · `fix` · `est` · `none`, gebaut wird die
Zelle in `kindCell()` in `js/views/kakeibo.js`, beschriftet über `FLEX_KIND_LABEL` und die
Schlüssel `kak.kImp` … `kak.kEst`.

**`flexKind()` prüft in derselben Reihenfolge wie `kakVal()` und `kakDone()`** — Korrektur
vor Import, Import vor Haken, Haken vor eingetipptem Betrag. Wer die Rangfolge dort ändert,
ändert sie hier mit, sonst behauptet die Spalte etwas anderes, als gerechnet wird.

Bei einem einzelnen Monat steht ein Wort in der Zelle, beim ganzen Jahr je Art eine Marke
mit der Zahl der Monate, die häufigste zuerst; Monate ohne Betrag zählen nicht mit. Die
Unterzeilen bleiben leer — Unterkategorien kennt nur der Import, ihre Art steht schon in
der Hauptzeile. Was die fünf Wörter bedeuten, sagt `kak.kindHint` unter der Tabelle.

## Die Annahme der Prognose

Die rechte Karte zeigt je Kategorie zwei **gerechnete** Zahlen: die Annahme, mit der
gerechnet wird (`state.kak[k].plan[CUR-1]`), und den Durchschnitt der feststehenden Monate
(`avgActual`). **Beide sind nur zu lesen, und die Ansicht schreibt nichts.** Getippt wurde
die Annahme früher an dieser Stelle, und jedes Zeichen schrieb sich sofort in alle zwölf
Monate — auch in vergangene und ohne Rückfrage. Einen Knopf, der den Ø in einem Zug
übernimmt, gibt es ebenfalls nicht mehr: welcher Monat welchen Betrag bekommt, entscheidet
sich dort, wo die zwölf Monate stehen.

Geändert wird die Annahme also nur im Fenster der Kategorie (Stift oder Doppelklick).
Unter der Tabelle steht stattdessen `.calchint` — drei Sätze, die sagen, woher die beiden
Spalten kommen (`prog.howCurrent`, `prog.howAvg`, `prog.howEdit`). Wer die Rangfolge der
Werte ändert (`kakVal` in `js/calc.js`) oder die Grundlage des Durchschnitts (`avgMonths`),
ändert diese drei Sätze mit — sie beschreiben genau das.

## Die Leiste der Jahresansicht

Links das Suchfeld, gleich dahinter die beiden Knöpfe, die ebenfalls filtern („Erledigte
Monate ausblenden", „Abgeschlossene ausblenden"); rechts steht nur, was etwas anlegt. Was
die Zeichen ✓ und ? bedeuten, steht nicht mehr in dieser Leiste, sondern rechts auf Höhe
der Ansichtsreiter (`.viewkey`, gesetzt in `renderChrome()`) — dort ist Platz, und
zwischen lauter Knöpfen las es sich wie eine Beschriftung.

**Die beiden Knöpfe wechseln ihre Beschriftung nicht.** Sie heißen immer, was sie tun, und
sagen über den dunklen Grund (`aria-pressed`), ob sie gerade gelten; ein zweiter Klick
schaltet sie ab. In Klammern steht, wie viel sie gerade verstecken. Genau wie die Filter
der Monatsansicht.

**Ihr Zustand steht in der Datei**, nicht in `ui`: `state.hideDoneMonths` und
`state.hideSettled` (siehe `emptyState()` und `migrate()` in `js/state.js`). Der Nutzer
stellt sie einmal ein und findet sie beim nächsten Öffnen wieder — deshalb rufen ihre
Klicks `save()`. **Vorgabe ist beides `false`:** eine frisch geöffnete Datei zeigt alles.
Sie sind die einzigen Ansichtsschalter in der Datei; alles andere (Monatsfilter, Suchfeld,
gewählter Monat) bleibt in `ui` und damit ungespeichert.

## Die Filterzeile der Monatsansicht

Eine Zeile über den regelmäßigen Kosten, in der Reihenfolge, in der man filtert: das
Suchfeld (`data-q`), dann die Fälligkeit (`data-duefilter`), dann der Zahlungsstand
(`data-filter`: `alle` · `offen` · `unklar` · `bezahlt`). Zwei Zeilen kosteten Platz, den
die Liste besser gebraucht — aus demselben Grund ist die Kopfzeile flach gehalten.

Gebaut werden Feld und Knöpfe von `filterField()` und `fbtn()` in `js/ui.js`; die
Jahresansicht benutzt dasselbe Feld. Ein Knopf zeigt am dunklen Grund, dass er angewendet
ist, und ein zweiter Klick nimmt ihn zurück (`toggleFilter()` in `wire()` — er springt dann
auf `alle`). Die Erklärung hängt als `data-tip` daran, das Suchfeld trägt stattdessen
`title`: eine Sprechblase neben dem Feld, in das man gerade tippt, wäre nur im Weg.

Die Breite des Suchfelds ist kein Geschmackswert: sie ist `--leadw` aus `css/ledger.css`,
die Summe der drei Spalten vor der Bezeichnung (Siegel, Betrag, Werkzeuge), abzüglich der
Fuge zum ersten Knopf. Dadurch fangen die Knöpfe genau über der Bezeichnungsspalte an. Wer
eine dieser Spaltenbreiten ändert, ändert sie dort — die Zeile richtet sich danach. Getragen
wird das Maß von `.fltbox`, dem Kasten aus Hamburger-Knopf und Feld; das Feld selbst füllt
nur, was übrig bleibt.

## Worin das Suchfeld sucht

Vor jedem Suchfeld steht ein Hamburger-Knopf (`data-qfields`), der
`openFilterFields()` aus `js/dialogs/filter-fields.js` öffnet: fünf Kästchen, „Speichern"
und „Abbrechen". Die Wahl steht in **der Datei** (`state.filterFields`, siehe `QFIELDS` und
`allQFields()` in `js/state.js`) — sie ist eine Einstellung wie die beiden Jahresfilter,
kein Anzeigezustand. Vorgabe ist alles gewählt; eine Datei ohne die Angabe bekommt in
`migrate()` alles.

Die fünf Schlüssel und was zu ihnen zählt, steht in `hayItem()` / `hayKak()` in
`js/calc.js`, abgefragt über `qField(k)`:

| Schlüssel | Vergleichsstoff |
|---|---|
| `name` | Bezeichnung des Postens, Name der Flexible-Payments-Kategorie |
| `note` | Notiz zur Position und die zwölf Monatsnotizen |
| `amount` | die Monatsbeträge, in beiden Schreibweisen |
| `total` | die Jahressumme — auch in der Monatsansicht, es ist dieselbe Zeile |
| `meta` | Kategorie, Bank, Zahlungsart, Fälligkeit — **und** `hit()` in `js/views/jahr.js`, also die Namen der Blöcke und Kategorien |

Wer einen Teil hinzufügt, braucht vier Stellen: den Schlüssel in `QFIELDS`, den Zweig in
beiden `hay…`-Funktionen, die Zeile in `QFIELD_ROWS()` und zwei Texte in `js/i18n.js`
(`flt.f…` und `flt.f…Hint`).

**Mindestens ein Kästchen bleibt stehen.** Ein Suchbegriff, der nirgends sucht, fände nie
etwas und sähe aus wie ein Fehler. Durchgesetzt wird das im Fenster — `#ffSave` weist die
leere Wahl zurück und zeigt `.errline` in Rot — und beim Laden in `migrate()`. Der Knopf
selbst steht auf dunklem Grund (`aria-pressed`), sobald nicht mehr alles gewählt ist: wie
bei den Filterknöpfen heißt dunkel „gilt gerade".

In der Jahresansicht gilt der Filter für jede Zeile mit Inhalt, auch für die Saldokorrektur
und die drei Blockzeilen — sonst stünde nach einer Suche noch das halbe Gerüst da.
**Eine Ausnahme: „Saldo je Monat" (`.balpin`) bleibt immer stehen.** Diese Zeile gehört zum
Gerüst wie die Spaltenköpfe: sie hat nichts unter sich, was man suchen könnte, sie klebt beim
Scrollen unter den Köpfen, und man liest jede andere Zeile gegen sie. Am Suchbegriff hing sie
ohnehin nur zufällig — er musste in ihrer Beschriftung vorkommen, damit sie blieb.
Trifft der Begriff einen Namen, unter dem etwas hängt (einen Block wie
„Regelmäßige Kosten", eine Kategorie wie „WOHNEN"), gilt der Treffer für alles darunter:
man sucht eine Kategorie, um sie ganz zu sehen. Die Kategorie eines Posten steckt schon in
seinem Vergleichsstoff; die Blocknamen kommen in `viewJahr()` dazu (`hit()`). Gebaut wird
der Rumpf deshalb blockweise in `parts` und erst am Ende mit `spacer()` verbunden — ein
weggefilterter Block hinterließe sonst eine doppelte Lücke.

Das Suchfeld filtert beim Tippen. Gesucht wird in allem, was an der Zeile zu sehen ist —
Name, Betrag, Bank, Zahlungsart, Kategorie, Fälligkeit, Notizen —, soweit der Nutzer es im
Fenster hinter dem Hamburger-Knopf gewählt hat (siehe unten), in Teilstücken und ohne
Rücksicht auf Groß- und Kleinschreibung; `norm()` in `js/format.js` macht dabei Punkt und
Komma gleich, damit „1.234,56" und „1234.56" dasselbe finden. Den Vergleichsstoff liefern
`hayItem(it,m)` und `hayKak(k,m)` in `js/calc.js` — mit Monat für die Monatsansicht, ohne
für die Jahresansicht, die alle zwölf durchsucht. Der Suchbegriff steht in `ui.q` und gilt
in **beiden** Ansichten; die Bedingung selbst in `show()` in `js/views/monat.js` und in
`shown()` in `js/views/jahr.js`. Kategoriezeilen bleiben stehen, sobald ein
Posten darunter passt; wie bei den anderen Filtern zeigt die Kategorie weiter ihre volle
Summe und vermerkt die Zahl der ausgeblendeten Zeilen.

**Der Fokus bleibt im Feld — solange dort etwas steht.** Jeder Tastendruck zeichnet die
Ansicht neu, und `render()` baut das Feld mit auf; ohne Zutun wäre der Fokus nach dem
ersten Zeichen weg. Deshalb merkt `ui.qFocus` ihn vor, und `wire()` setzt ihn am Ende
zurück (mit `preventScroll`, die Seite steht danach ohnehin wieder auf ihrer alten Höhe).

Zwei Fälle, und der Unterschied ist wichtig:

* **Das Feld selbst** (`oninput`) setzt `ui.qFocus=true` **unbedingt**. Wer das letzte
  Zeichen zurücklöscht, steht noch im Feld — würde der Fokus dann ausbleiben, risse er
  mitten im Tippen ab.
* **Alles andere** ruft `keepQFocus()` in `js/app.js`: das setzt den Fokus nur, wenn im
  Feld etwas steht. Ein leeres Feld filtert nicht; die Schreibmarke bei jedem Haken dorthin
  zu werfen wäre bloß im Weg. Aufgerufen wird es an den Siegeln, den Filterknöpfen und den
  Monatsreitern der Monatsansicht, an den beiden Filterknöpfen der Jahresansicht und beim
  Sprung aus der Matrix in einen Monat (`data-goto`) — dort steht dasselbe Feld mit
  demselben Wort.

Wer einen weiteren Knopf baut, nach dem man weitertippen will, ruft `keepQFocus()` davor.

`ui.q` wird in `afterLoad()` geleert: eine frisch geöffnete Datei wird nicht gefiltert,
sonst versteckte der Suchbegriff der vorigen die halbe neue.

## Duplizieren und Entwürfe

`editItem(item,group,copyOf)` und `editKak(k,copy)` bauen aus einem dritten Argument dasselbe
Fenster wie für etwas Neues: `isNew` ist dann wahr, es gibt keinen Löschknopf, und angelegt
wird erst beim Speichern. Die Kopie baut der Knopf `#fDup` / `#kDup` selbst — aus dem
**getippten** Stand des Fensters, nicht aus der Datei. Beim Posten liest `collect(o)` die
Felder (dieselbe Funktion, die auch `#fSave` benutzt), bei der Kategorie werden die zwölf
Felder in `plan` geschrieben; Haken, Notizen und `override` bleiben leer. Die Vorlage wird
dabei nie angefasst — auch das im Fenster Getippte wandert in die Kopie, nicht in sie.

**Ein Entwurf ist keine Position im Zustand.** `findItem()` und `state.kak` finden ihn nicht,
die Notizlampen liefen also ins Leere. Deshalb meldet jedes Fenster, das erst anlegt, seinen
Entwurf mit `useDraft(kind,key,obj,label,box)` aus `js/ui.js` an; `noteTarget()` sieht dort
zuerst nach. Der Schlüssel ist beim Posten `it.id`, bei der Kategorie der leere Name.
`label` ist eine Funktion und liest den Namen aus dem Feld — im Zustand steht er ja noch
nicht. Abgemeldet wird nichts: der Entwurf gilt nur, solange sein Kasten im Dokument hängt
(`box.isConnected`), ein geschlossenes Fenster nimmt ihn also von selbst mit. Die Notiz eines
Entwurfs setzt **kein** dirty-Flag — geschrieben wird sie erst mit dem Fenster.

**Wer ein Fenster baut, das eine Position anlegt, ruft `useDraft()` nach `appendChild`** —
sonst melden seine Lampen „gibt es nicht mehr".

## Notizen behalten ihre Zeilen

Eine Notiz wird an vier Stellen gezeigt: in der Sprechblase (`.tip`), als Vorschau unter dem
Namen (`.noteprev`), als Monatsnotiz in der Monatsansicht (`.itemnote`) und in der Monatszelle
des Bearbeitungsfensters (`.cellnote`). Alle vier stehen auf `white-space:pre-wrap` — ein
Zeilenumbruch im Notizfeld ist gewollt, eine Aufzählung bliebe sonst ein langer Satz. Wer eine
fünfte Stelle baut, setzt es dort ebenso. Umbrüche im Quelltext der View gehören deshalb
**nicht** in diese Elemente: bei `pre-wrap` steht jedes Leerzeichen davon auf dem Schirm.

## Vorzeichen beim Tippen

Ein Betragsfeld mit der Klasse `signed` färbt sich nach seinem Wert: `.neg` rot ab Minus,
`.pos` grün ab Plus, die Null und das leere Feld bleiben schwarz (`input.num.neg` in
`css/components.css`). **Auch der gesperrte Monat trägt die Farbe** — zwei Klassen wiegen
schwerer als das `input:disabled` darunter; dass er gesperrt ist, sagen der graue Grund der
Zelle und der gestrichelte Rand. Gesetzt wird die Klasse von `signValue()` / `bindSign(root)` aus
`js/ui.js`; ein Fenster ruft `bindSign()` einmal nach `appendChild`. **Was ein Knopf ins Feld
schreibt, löst kein `input` aus** — Schnelleingabe und „Leeren" rufen deshalb selbst
`signValues(box)`. Nur Beträge tragen die Klasse: das Jahr der letzten Zahlung ist keiner.

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

**Drei Reiter, drei Fragen.** `GUIDE` in `js/dialogs/guide.js` hat drei Zweige mit je einer
englischen und einer deutschen Fassung: `steps` führt einen Anfänger einmal von oben nach
unten durch das Anlegen des Buches und endet mit dem Monatsrhythmus; `product` beschreibt,
was die Anwendung kann; `news` ist die Versionsliste und steht als letzter. Gewählt wird
über `guideTab` (Modulvariable, nicht im Zustand) und `guideTo(tab)`. Ein weiterer Reiter
braucht einen Zweig in `GUIDE`, eine Zeile in `GUIDE_TABS` und einen Schlüssel in
`js/i18n.js`.

**Der Reiter „Was ist neu" wächst nach oben:** die neueste Fassung zuoberst. Die Nummer ist
das Datum — `Jahr.Monat.Tag.Zählung`, also `26.8.4.1` für die erste Änderung des 4. August
2026. **Erklärt wird das im Reiter nicht**: er fängt ohne Vorrede mit der ersten Version an.
Wie die Nummer zustande kommt, geht den Leser nichts an; er sieht nur, was neu ist. Eine
neue Version bekommt ein eigenes `<h4>` mit der Nummer, und das `<span class="pill">`
(„neu") wandert von der bisher obersten dorthin. Beschrieben wird grob und in der Sprache
des Nutzers — was er merkt, nicht was im Code steht. Der Hinweis auf die Bilder erscheint
nur über Reitern, die welche haben; die Versionsliste kommt ohne aus.

**Angelegt wird eine Version nur, wenn der Nutzer es verlangt.** Nicht bei jeder Änderung
und auch nicht als weiterer Punkt in der obersten — sonst wächst die Liste schneller, als
sie jemand liest. Bis dahin steht das Gebaute in `doc/GUIDE-TODO.md`; von dort wird auf
Zuruf eine Version gemacht.

**Bilder.** `gshot('dateiname','Bildunterschrift')` setzt ein Bild aus `doc/img/`; der Klick
öffnet es in voller Größe in einem neuen Reiter, weil im schmalen Bereich sonst nichts zu
erkennen wäre. Die Bilder entstehen mit `doc/make-shots.py` (baut aus `index.html` eine
Wegwerfseite, lädt eine Beispieldatei hinein, fotografiert mit Chrome ohne Fenster).

**Das Skript wird nicht mehr von selbst aufgerufen.** Bildschirmfotos macht nur, wer
ausdrücklich darum gebeten wird — die Bilder in `doc/img/` altern also gegenüber der
Oberfläche, und das ist so gewollt. Prüfen lässt sich eine Änderung auch ohne Bild: Maße
und berechnete Stile aus dem DOM lesen (`--dump-dom`) sagt genauer, ob etwas an der
richtigen Stelle steht, als ein Blick auf ein Standbild.

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

**Die Ampel der LP-Spalte** steht in `endClass()` in `js/format.js`, gezählt wird
einschließlich des laufenden Monats: grün nur noch dieser (1) · blau 2 bis 3 · gelb 4 bis 6
· rot 7 und mehr. Die Farben kommen aus `--end-now/-soon/-mid/-far` in `css/tokens.css`.
Wer die Grenzen verschiebt, verschiebt die Beschriftungen mit: `year.key2`, `year.key36`
und `year.endTip` in `js/i18n.js` sowie die vier `.endkey` in der Anleitung.

## Felder nebeneinander fluchten

Mehrere Felder in einer Reihe stehen in `<div class="cols c2|c3|c4|c6">`, jedes als
`<div class="field"><label>…</label><eingabe></div>` — **genau zwei Kinder**. Die Reihe ist
ein Raster mit zwei Zeilen je Feld (Beschriftung, Eingabe), die sich alle Felder einer Reihe
teilen (`grid-template-rows:subgrid` in `css/components.css`). Nur dadurch liegen die
Eingaben auf einer Linie, wenn eine Beschriftung zweizeilig wird und die daneben einzeilig —
„Last payment (LP) — month" neben „Link to receipt or contract". Ein drittes Kind im Feld
bricht das Raster. Der Abstand nach unten sitzt an `.cols`, nicht mehr am einzelnen
`.field`; ein Feld außerhalb einer Reihe behält seinen eigenen.

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

In der **Jahresmatrix** gilt dasselbe für die drei Blockzeilen (Einnahmen, Flexible
Payments, Regelmäßige Kosten): sie tragen die Klasse `secpin` und bleiben oben stehen,
solange ihr Block läuft. `position:sticky` griffe dort nicht — der Rollrahmen der Matrix
rollt nur waagerecht —, deshalb dasselbe Mittel wie bei den Spaltenköpfen und der
Saldozeile: `syncSecRows()` in `js/app.js` rechnet je Zeile ein `--secY` und begrenzt es
auf das Ende des Blocks, die nächste Blockzeile schiebt die vorige hinaus.

**Wer dort etwas verschiebt, denkt an die Stapelfolge.** Alle drei Sorten sind
positioniert; bei gleichem `z-index` entschiede die Reihenfolge im Dokument, und die
späteren Zeilen gewännen gegen die Kopfzeile — eine Blockzeile, die am Ende ihres Blocks
nach oben aus dem Bild wandert, lief dann über die Monatsnamen. Sichtbar wurde das vor
allem beim Filtern, weil kurze Blöcke schnell enden. Die Leiter steht oben in
`css/matrix.css`: gewöhnliche Zellen 0, feste Spalten links 1, Blockzeile 2/3, Saldozeile
4/5, Spaltenköpfe 6/7 — die linke Spaltengruppe jeweils eine Stufe über den Monatszellen
derselben Zeile. **Geprüft wird so etwas an der Monatsspalte, nicht an der Bezeichnung:**
links liegen die Köpfe ohnehin oben, verdeckt wird nur rechts davon.

**Und darunter die Köpfe der Karten.** `.card > .sechead` klebt ebenfalls — solange die
Karte im Bild ist. Wer sich durch die regelmäßigen Kosten scrollt, sieht so immer, in
welchem Block er liest und was der Block kostet; bei den regelmäßigen Kosten klebt die
Filterzeile gleich mit, damit man auch weit unten noch filtern kann. `position:sticky`
reicht nie über den Elternteil hinaus: die Überschrift wandert mit ihrer Karte aus dem
Bild, sobald die nächste kommt — genau das ist gewollt.

Die drei Maße staffeln sich, und keins davon steht im Stylesheet: Kopfzeile → Leiste der
Ansicht → Kartenkopf → Filterzeile. `syncStickyTops()` misst die Höhen der Reihe nach und
setzt `top` an jeder Stelle. Auch hier gilt: deckender Hintergrund — der Kartenkopf trägt
die Farbe seiner Karte (`--bg-in/-flex/-out`) und wird über negative Außenabstände auf die
volle Kartenbreite gezogen, damit rechts und links nichts durchscheint.

## Nach jeder Änderung neu zeichnen

`render()` baut die Ansicht komplett neu auf und ruft danach `wire()`. Wer den Zustand
ändert, ruft `save()` (setzt nur das dirty-Flag) und dann `render()`. Geschrieben wird die
Datei ausschließlich über „Daten speichern".

## Die Anleitung wird nicht bei jeder Änderung mitgeschrieben

Neue Funktionen kommen **nicht** sofort in den Guide-Bereich. Wer eine baut, schreibt sie
stattdessen in `doc/GUIDE-TODO.md` — mit einem ⚠, wenn ein vorhandener Absatz dadurch
falsch geworden ist. Die Anleitung wird dann in einem Zug nachgezogen, wenn der Nutzer es
verlangt; danach wird die Liste geleert. Die Bilder bleiben dabei, wie sie sind — neue
werden nur auf ausdrückliche Bitte gemacht.
Der Grund ist schlicht Aufwand: die Anleitung steht in zwei Sprachen und in zwei Reitern,
jede kleine Änderung dort kostet mehr als die Änderung selbst.

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
