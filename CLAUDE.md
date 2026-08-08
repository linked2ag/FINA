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
| Begrüßungsseite (ohne Datei) | `js/views/willkommen.js` |
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

Bestehende Attribute: `paid` `kpaid` (Siegel) · `filter` `duefilter` `tpart` `q` `qfields` `kd` (Filter) ·
`ana` (Auswertung auf-/zuklappen) · `fold` `dblfold` (einen Bereich der Monatsansicht
zuklappen) · `yfold` `dblyfold` (einen Block der Jahresmatrix zuklappen) · `qclear` (Filter
zurücknehmen) ·
`wload` `wnew` (Begrüßungsseite) ·
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

**Im Beträge-Fenster steht der Name nicht als Feld.** Er ist keine Angabe unter vielen,
sondern der Schlüssel — deshalb steht er in der **Überschrift**, und die ist der Knopf, der
ihn ändert (`.titlebtn`, `#kTitle`). Ein Klick öffnet `askName()` in
`js/dialogs/kakeibo-betraege.js`: ein schmales Fenster (`.box.narrow`) mit dem Namen fertig
markiert, dazu „Abbrechen" und „Übernehmen". Enter übernimmt, Escape bricht ab (das
erledigt `js/ui.js` für jedes oberste Fenster). Übernommen wird nur ins offene Fenster —
in die Datei kommt der Name erst mit „Speichern", deshalb heißt der Knopf nicht so.

Bis dahin lebt der Name allein in der Variablen `name` in `editKak()`; **ein Feld, aus dem
man ihn lesen könnte, gibt es nicht mehr** (`#kName` ist weg). Wer dort etwas anbaut, das
den Namen braucht — Duplizieren, der Entwurf der Notizlampen, das Speichern —, liest diese
Variable. Ohne Namen wird nicht gespeichert: `#kSave` öffnet dann das Namensfenster, statt
eine Meldung zu zeigen, denn dorthin müsste man ohnehin.

`tabThroughFields()` nimmt `.titlebtn` ausdrücklich **nicht** aus der Tab-Reihenfolge: die
Überschrift ist der einzige Weg zu dieser Angabe, ein Symbol neben einem Feld ist sie nicht.

**Über der Schnelleingabe steht der bisherige Mittelwert** (`#kAvg`, orange): der Durchschnitt der
Monate, die schon feststehen — abgehakt oder importiert, bis zum laufenden Monat. Er steht
rechts, also über dem Betragsfeld, weil genau dort die Annahme für die kommenden Monate
eingetippt wird.

Gerechnet wird er in `showAvg()` **aus den Feldern des Fensters**, nicht aus dem Zustand:
wer einen Monat abhakt oder einen Betrag ändert, soll die Wirkung sehen, bevor er die
Annahme setzt — und eine neue Kategorie hat im Zustand ohnehin nichts zu lesen. Die Regel,
welche Monate zählen, ist dieselbe wie in `avgActual()` (`js/calc.js`); wer sie dort ändert,
ändert sie hier mit, sonst nennt das Fenster einen anderen Schnitt als die Prognose.
Genannt wird der **letzte mitgezählte** Monat, nicht der laufende — welcher es ist,
entscheiden die Siegel.

Aufgerufen wird `showAvg()` an sechs Stellen: beim Aufbau, an jedem Siegel, an den beiden
Sammelknöpfen, an „Übernehmen" und an „Leeren". **Was ein Knopf ins Feld schreibt, löst kein
`input` aus** — dieselbe Regel wie bei der Vorzeichenfarbe.

## Einnahmen haben Kategorien wie die Kosten

`state.incomeGroups` ist die zweite Kategorieliste — gepflegt im Einstellungsfenster, neben
`state.groups`. Früher gab es dafür den einen festen Block `'EINNAHMEN'`; er ist jetzt nur
noch die **Vorgabe**, mit der `migrate()` alte Dateien versorgt (die Posten zeigen mit
`it.group='EINNAHMEN'` schon darauf, für sie ändert sich nichts) und auf die
`incomeGroups()` zurückfällt, wenn die Liste leer wäre. Als roher Schlüssel wird er **nicht**
übersetzt; angezeigt wird er über `keyLabel()` als `INCOME` (Regel 3).

**`isIncome(it)` fragt die Liste, nicht einen festen Namen** (`js/calc.js`). Daraus folgt
das Wichtigste: **ein Name darf über beide Listen zusammen nur einmal vorkommen.** Stünde
er in beiden, wäre nicht mehr entscheidbar, ob ein Posten Geld bringt oder kostet.
Durchgesetzt wird das in `applyRenames()` in `js/dialogs/settings.js`, das bei einer
Kategorieliste auch gegen die jeweils andere prüft.

Beide Listen laufen dort durch dieselben Zweige — `collect()`, `applyRenames()`,
Hinzufügen, Entfernen, Speichern kennen `'incomeGroups'` neben `'groups'`. Beim Entfernen
ziehen die Posten in die erste verbliebene Kategorie **derselben** Liste um: eine Einnahme
darf nicht bei den Kosten landen. Bleibt am Ende keine Einnahme-Kategorie übrig, kehrt
`'EINNAHMEN'` zurück.

**Im Posten-Fenster steht eine Liste, nicht zwei.** `groupOpts()` in `js/dialogs/item.js`
baut sie mit `<optgroup>`: erst die Einnahmen, dann die Ausgaben, grün und rot wie überall.
Die Beschriftung einer Gruppe ist von Haus aus **nicht wählbar** — man trifft also immer
eine Kategorie und nie die Überschrift darüber. Das Feld steht in derselben Reihe wie Bank,
Zahlungsart und Fälligkeit (`c4`), bei der Saldokorrektur entfällt es (`c3`).

**Monats- und Jahresansicht bündeln die Einnahmen nach Kategorie**, genau wie die Kosten —
sonst wäre die Kategorie an der einzigen Stelle unsichtbar, an der man sie liest. **Bei
genau einer Kategorie entfällt die Zwischenzeile:** sie stünde über allem und sagte nichts.
Die Zeile trägt die Farbe ihrer Geldart (`tr.group` in `.card.sec-in`, `tr.grp.r-in` in der
Matrix). `data-newitem` im Einnahmenblock trägt die **erste** Einnahme-Kategorie, nicht mehr
den festen Namen.

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

## Woher ein Wert der Flexible Payments stammt

Hinter dem Namen der Hauptkategorie steht **in Klammern**, woher der Betrag kommt:
`flexKind(k,m)` in `js/calc.js` liefert `corr` · `imp` · `done` · `fix` · `est` · `none`,
gebaut wird die Marke in `kindTag()` in `js/views/kakeibo.js`, beschriftet über
`FLEX_KIND_LABEL` und die Schlüssel `kak.kImp` … `kak.kEst`.

**Eine eigene Spalte ist es nicht mehr.** Sie hielt zwischen Kategorie und Betrag eine
Breite frei, in der bei einem einzelnen Monat ein Wort stand und in den Unterzeilen gar
nichts — und sie trennte die beiden Angaben, die man zusammen liest. In der Klammer trägt
die Marke auch keinen Rahmen mehr (`.kinds`, `.kk`, `.ksep` in `css/ledger.css`): die
Klammer fasst schon zusammen, es bleibt die Farbe.

**`flexKind()` prüft in derselben Reihenfolge wie `kakVal()` und `kakDone()`** — Korrektur
vor Import, Import vor Haken, Haken vor eingetipptem Betrag. Wer die Rangfolge dort ändert,
ändert sie hier mit, sonst behauptet die Marke etwas anderes, als gerechnet wird.

Bei einem einzelnen Monat steht ein Wort, beim ganzen Jahr je Art eine Marke mit der Zahl
der Monate, die häufigste zuerst; Monate ohne Betrag zählen nicht mit. Die Unterzeilen
tragen nichts — Unterkategorien kennt nur der Import, ihre Art steht schon in der
Hauptzeile. Was die fünf Wörter bedeuten, sagt `kak.kindHint` unter der Tabelle.

**Der Weg zurück ins Jetzt** steht gleich hinter der Monatsauswahl: `data-kmonth="cur"`
setzt `ui.month=CUR` und `ui.scope='monat'` (`kak.cur`, gesperrt, wenn der laufende Monat
schon gewählt ist).

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

## Die Spalte „Verlauf" der Prognose

Die letzte Spalte der linken Karte zeigt als Balken, was die Spalte „Kumuliert" als Zahl
zeigt: **dieselbe Grafik wie der Zeitstrahl der Monatsansicht, eine Ebene höher.** Eine
Zeile je Monat, die Achse ist der Kontostand über das Jahr; der Monat beginnt beim Stand
des Monats davor (`prev`) und endet bei seinem eigenen (`run`), dazwischen liegen die
Anteile in der Farbe ihrer Geldart.

Eine eigene Karte bräuchte Monatsnamen und Achse ein zweites Mal — beides steht in der
Tabelle schon. Als Spalte liest man Zahl und Form in derselben Zeile.

Gerechnet wird in `yearFlow()` (`js/calc.js`), gebaut in `yearTrack()`
(`js/views/prognose.js`), die Spalte selbst ist `.flowcell` in `css/ledger.css`.
**In schmalen Fenstern (unter 1100 px) fällt sie weg** — die Zahlen daneben sagen dasselbe,
und ein Balken von 60 px wäre keine Aussage mehr.

**Drei Dinge teilen sich die beiden Grafiken, und keins davon darf auseinanderlaufen:**

* **Die Achsenregel** — `spanScale(lo,hi,force)` in `js/calc.js`. `flowScale()` (Monat) und
  `yearScale()` (Jahr) sammeln nur ihre Werte und geben sie dort hinein. Wer an der Grenze
  für den Schnitt dreht, dreht an beiden Ansichten. `force` schneidet ohne zu fragen und
  wird nur vom Jahr benutzt, wenn ein Anfangsbestand gesetzt ist (siehe unten).
* **Die Anteile eines Balkens** — `flowParts()` und `FLOW_LABEL` in `js/ui.js`. Sie standen
  früher in `js/views/monat.js`; dort hinge die Prognose unsichtbar an der Monatsansicht.
* **Der abgeschnittene erste Balken.** Im Monat ist es die Monatseröffnung, im Jahr der
  Januar — beide franst die Ansicht zum Rand hin aus. Der Monat färbt dafür den Hintergrund
  (`.tsum.cutl/.cutr`), das Jahr braucht eine **Maske** (`.ytrack .tup.cutl` …): sein Balken
  besteht aus mehreren Farben, ein Verlauf im Hintergrund käme dort nicht an.

**Ohne Anfangsbestand** ist der Stand vor dem Januar die Null, an der sein Balken anfängt,
und **kein Wert des Jahres** — `yearScale()` lässt ihn für den Maßstab dann weg (`f.m!==1`),
genau wie `flowScale()` den Stand vor dem Monat. Zählte er mit, spannte die Achse immer von
der Null aus und schnitte nie: ein Januar mit 120.000 drückte die elf Monate danach zu
Strichen zusammen. **Mit Anfangsbestand** ist derselbe Wert ein echter Kontostand und zählt
mit (`f.m!==1||op`), sonst liefe der Januarbalken aus der Fläche.

**Und dann fängt die Achse nicht mehr bei null an.** `yearScale()` gibt `spanScale()` in
diesem Fall ein `force` mit: gerechnet wird über die Werte selbst, wie beim beschnittenen
Zeitstrahl. Wer mit 10.000 anfängt, bewegt sich das Jahr über zwischen 10.000 und 20.000 —
die Null ist dann keine Aussage über das Jahr, sondern der Abstand zu einem Konto, das nie
leer war, und sie schöbe alle zwölf Monate in die rechte Hälfte.

Dazu bekommt die Achse in `viewPrognose()` **einen Rasterschritt Luft unter dem
Anfangsbestand** — so weit reicht sein Balken, und ohne den Platz wäre er nicht zu sehen.
Das geht erst nach der ersten Rechnung, denn die Schrittweite steht erst danach fest: `sc`
ist deshalb `let`, `step` bleibt, nur die Grenze wandert.

Und er bekommt eine **eigene Zeile über dem Januar** (`openRow` in `viewPrognose()`,
`tr.openrow`) — so wie die Monatseröffnung im Zeitstrahl eine eigene Zeile ist: er ist keine
Bewegung eines Monats, sondern der Stand, auf dem das Jahr aufsetzt. Im Januarbalken sähe er
aus wie etwas, das der Januar bewegt hätte. Zahlen stehen darin nur zwei — der Name und
derselbe Betrag in „Kumuliert"; die Spalten dazwischen beschreiben Bewegungen.

Die Zeile ist **so hoch wie jede andere** (`two` an ihrem `.ttrack`, der Balken darin
`solo`) und endet mit demselben schwarzen Strich (`.tmark`) wie die Monatszeilen — er
markiert überall den Stand, mit dem die Zeile schließt.

**Sein Balken wird abgeschnitten, sobald er länger ist als ein Rasterschritt** (`step`): bei
120.000 auf einem Raster von 2.000 wären es sechzig Schritte, ein Balken über die ganze
Zeile, der nichts mehr sagt. Gezeigt wird dann der letzte Schritt vor dem Stand, und der
franst zum Rand hin aus (`.tsum.cutl/.cutr` an `.ytrack`) — dieselbe Aussage und dasselbe
Mittel wie beim beschnittenen Balken der Monatsansicht: ein Farbverlauf ins Durchsichtige,
keine Kante. Ausgefranst wird an der Seite, aus der er kommt: bei einem Guthaben links, bei
einem Minus rechts.

**Über der Spalte steht keine Überschrift, sondern die Achse selbst**: an jeder Rasterlinie
der Betrag, für den sie steht (`axis` in `viewPrognose()`, `th.axishead .tax` in
`css/ledger.css`). „Verlauf (Raster 2.000)" nannte nur den Abstand — man musste von der Null
aus durchzählen. Die Marken erben Schrift und Größe der Kopfzelle und sitzen auf deren
Innenabstand (`top:7px`), damit sie auf einer Zeile mit M · IN · REG · … stehen; ganz außen
legen sie sich an die Kante, statt über den Rand zu ragen. Bei beschnittener Achse wandern
sie mit — sie kommen aus derselben Rechnung wie die Linien.

Die Farberklärung steht als `.thint` unter der Tabelle — dieselben Marken wie im Zeitstrahl,
und bei beschnittener Achse ihr Maßstab dazu. **Vergangene Monate bleiben blass**
(`opacity:.42` an der Zeile): das gilt für die Zahlen wie für den Balken, Ist und Plan
sollen unterscheidbar bleiben.

## Die Leiste der Jahresansicht

Links das Suchfeld, gleich dahinter die beiden Knöpfe, die ebenfalls filtern („Erledigte
Monate ausblenden", „Abgeschlossene ausblenden"); rechts steht nur, was etwas anlegt. Was
die Zeichen ✓ und ? bedeuten, steht nicht mehr in dieser Leiste, sondern rechts auf Höhe
der Ansichtsreiter (`.viewkey`, gesetzt in `renderChrome()`) — dort ist Platz, und
zwischen lauter Knöpfen las es sich wie eine Beschriftung.

**Unter der Tabelle steht nichts.** Der lange `.note`-Absatz, der dort stand — Stift und
Doppelklick, die Kürzel B · PT · DD · LP, die Ampel der Restlaufzeit, der graue Grund, der
durchgestrichene Monat, der laufende Monat —, erklärte die Ansicht ein zweites Mal: jede
dieser Angaben trägt ihre eigene Sprechblase, und die Anleitung sagt es ausführlich. Am Ende
einer Tabelle, die man ohnehin scrollt, las ihn niemand. Die Schlüssel (`year.hint` …
`year.current`) stehen weiter in `js/i18n.js` — sie gehören zur Anleitung.

**Die beiden Knöpfe wechseln ihre Beschriftung nicht.** Sie heißen immer, was sie tun, und
sagen über den dunklen Grund (`aria-pressed`), ob sie gerade gelten; ein zweiter Klick
schaltet sie ab. In Klammern steht, wie viel sie gerade verstecken. Genau wie die Filter
der Monatsansicht.

**Ihr Zustand steht in der Datei**, nicht in `ui`: `state.hideDoneMonths` und
`state.hideSettled` (siehe `emptyState()` und `migrate()` in `js/state.js`). Der Nutzer
stellt sie einmal ein und findet sie beim nächsten Öffnen wieder — deshalb rufen ihre
Klicks `save()`. **Vorgabe ist beides `false`:** eine frisch geöffnete Datei zeigt alles.
Neben ihnen stehen nur noch die zugeklappten Bereiche in der Datei — `state.folded` und
`state.foldedYear` (siehe unten); alles andere (Monatsfilter, Suchfeld, gewählter Monat,
aufgeklappte Auswertung) bleibt in `ui` und damit ungespeichert.

## Die Auswertung über der Monatsansicht

Über den Karten steht eine einzige dünne Zeile mit den fünf Zahlen des Monats — Einnahmen,
Flexible Payments, regelmäßige Kosten, noch offen, Saldo — und klein **darüber** die
Überschrift „Auswertung" (`.analab`). Sie ist kein Kästchen in der Reihe: sie benennt die
Leiste, sie ist keine Kennzahl. Ein Klick irgendwo darauf klappt sie auf, und darunter
erscheint der Zeitstrahl. **Einen Pfeil trägt sie nicht:** ob sie offen ist, sagt der Zeitstrahl
selbst; für Tastatur und Vorlesehilfe steht es in `aria-expanded`. Gebaut wird sie in
`anaBar()` / `timeline()` in `js/views/monat.js`.

Darunter, in derselben `.stickybar`, steht die Filterzeile (siehe unten). Alles zusammen
bleibt beim Scrollen unter der Kopfzeile stehen.

**Eingeklappt ist der Grundzustand.** Die Leiste nimmt oben dauerhaft Platz weg, den die
Liste darunter braucht. Der Schalter ist `ui.ana` — er gehört zur Anzeige, nicht in die
Datei, und `afterLoad()` setzt ihn bei jedem Öffnen zurück. Die Zahlenzeile ist **ein**
Knopf (`data-ana`); in den Kästchen steht deshalb nichts weiter Anklickbares, nur
`data-tip`. Die Filterzeile steht daneben, nicht darin — sie hat ihre eigenen Knöpfe.

**Der Zeitstrahl teilt den Monat in fünf Zeilen** — Monatseröffnung, Monatsanfang,
Monatsmitte, Monatsende, Monatsabschluss. Jede Zeile nennt links ihren Namen samt Tagen
(1.–10., 11.–20., ab dem 21.), dann die Veränderung und den Kontostand danach; rechts
steht über die ganze übrige Breite ihr Balken. Gerechnet wird das in `monthFlow()`
(`js/calc.js`) aus der Fälligkeit der einzelnen Positionen.

Die Tage stehen deshalb in der Beschriftung und nicht mehr als Leiste darunter: die Breite
gehört jetzt dem Betrag, nicht der Zeit. Fällt der heutige Tag in eine Zeile, trägt sie
eine rote Marke (`.tnow`).

**„Monatseröffnung" (`'P'`) ist kein Zeitraum, sondern ein Stand:** `carryIn(m)`, die
Summe der Monate davor in derselben Datei. Ein Kontoauszug ist das nicht — die Datei kennt
keinen Anfangsbestand, im Januar steht dort also nichts. In diesen Abschnitt wird nichts
fällig: er ist ein `span` statt eines Knopfes und kein Filter — grau hinterlegt ist er
deswegen nicht, er sieht aus wie jede andere Zeile. Einen Balken hat er sehr wohl: von der
Null bis zu seinem Wert, damit man sieht, wo der Monat anfängt. Daraus
folgt, dass der letzte laufende Wert `carryIn(m) + saldo(m)` ist und **nicht** mehr `saldo(m)`
— die Kennzahl „Saldo" in der Zeile darüber meint weiter den Monat allein.

**Der Monatsabschluss ist der Sammelplatz für alles ohne Fälligkeit**: die Flexible
Payments, die Saldokorrektur und jeden Posten ohne Zahltag. Deshalb liefert `dueGroup()` in
`js/format.js` für einen leeren Zahltag jetzt `'Z'` statt `''`. Wer an dieser Zuordnung
dreht, dreht am Saldo des Zeitstrahls mit.

**Der Zeitstrahl ist ein Wasserfall.** Die Achse ist der **Kontostand selbst**, nicht die
Veränderung: `flowScale()` (`js/calc.js`) spannt sie über die Stände des Monats und die
Punkte, die er dabei berührt. Wo die Null liegt, teilt den roten vom grünen Bereich; liegt
der Monat ganz im Plus, ist die ganze Fläche grün, und der Balken der Eröffnung steht mitten
darin.

**Die Null gehört nur dazu, solange die Bewegungen dabei lesbar bleiben.** Wer 110.000 auf
dem Konto hat und im Monat 9.000 bewegt, sähe von den Bewegungen nichts mehr — sie
schrumpften auf ein Zwanzigstel der Breite. **Die Grenze ist die Hälfte:** bekämen die
Bewegungen des Monats nicht wenigstens die halbe Breite, wird die Achse **beschnitten**
(`sc.cut`) und läuft nur über die Werte selbst, mit 8 % Luft an beiden Enden — die
Bewegungen haben die Fläche dann für sich. Die Ansicht sagt das zweimal: der Balken der
Monatseröffnung **franst zum Rand hin aus** (`.tsum.cutl` / `.cutr` in `css/layout.css`, ein
Farbverlauf ins Durchsichtige), und der Maßstab steht am Ende der Farberklärung. Ohne beides
läse man die Länge dieses Balkens als seinen ganzen Betrag. Ausgefranst wird an der Seite, an
der die Null hinausfällt — bei einem Guthaben links, bei einem Minus rechts; welche es ist,
entscheidet `flowTrack()` an `zero<0`. **Eine Marke an dieser Stelle wäre die falsche
Aussage:** sie behauptet eine Kante, wo der Balken gerade keine hat, und sie musste den
Balken abdunkeln, um selbst sichtbar zu bleiben. Der Verlauf sagt dasselbe, ohne etwas zu
behaupten, und der Balken bleibt so kräftig wie jeder andere.
Die Null der ersten Zeile zählt für den Maßstab **nicht** mit: sie ist der Anfang ihres
Balkens, kein Wert des Monats — sonst schnitte die Achse nie.

Jede Zeile beginnt beim Stand der Zeile darüber (`f.prev`) und endet bei ihrem eigenen
(`f.run`). Dazwischen steht, was den Unterschied gemacht hat (`flowTrack()` in
`js/views/monat.js`):

* **Zuflüsse** wachsen von `prev` nach rechts bis zum höchsten Punkt der Zeile
  (`top = prev + alle Zuflüsse`),
* **Abflüsse** holen von dort nach links zurück bis `run`,
* jeder Anteil in der Farbe seiner Geldart — `--edge-in` Einnahmen, `--bg-flex-3` Flexible
  Payments, `--edge-out` regelmäßige Kosten, `--edge-bal` Saldokorrektur.

**Beide Strecken überdecken sich auf der Achse**, sobald in einer Zeile erst eine Einnahme
kommt und danach Kosten abgehen. Deshalb liegt der Zufluss auf der oberen, der Abfluss auf
der unteren Hälfte der Zeile; gibt es nur eine Richtung, nimmt sie die volle Höhe (`.solo`).
Der Balken reicht dann sichtbar über sein eigenes Ergebnis hinaus und kommt zurück — genau
das soll man sehen.

**Die Treppe** entsteht aus zwei Marken je Zeile: `.tconn`, eine feine Linie beim Stand
davor, und `.tmark`, ein kräftiger Strich beim neuen Stand. Weil der neue Stand einer Zeile
der alte der nächsten ist, stehen sie genau untereinander. Die erste Zeile hat statt dessen
einen vollen Balken von der Null bis zu ihrem Wert (`.tsum`, in der Farbe des Saldos): sie
ist keine Veränderung, sondern ein Stand.

**Nur die Anteile tragen eine Sprechblase, und darin steht nur der Betrag.** Die Zeilen
selbst tragen keine — sonst spränge beim Überfahren der halben Leiste ein Kasten auf.
Welche Geldart ein Anteil ist, sagt seine Farbe; weil sie es allein sagt, steht unter den
Zeilen eine Farberklärung (`.thint`). Was ein Klick tut, sagt der graue Satz **über** der
Grafik (`.anafilter`, `month.anaFilterHint`) — er steht zwischen den Zahlen und dem
Zeitstrahl und nur, solange die Auswertung offen ist.

**Ein Balken ist 12 px hoch, immer.** Hat eine Zeile beide Richtungen, trägt ihre Fläche die
Klasse `two` und wird doppelt so hoch — jede Zeile ist so hoch, wie sie sein muss, und keine
höher. Über und unter den Balken bleiben `--bpad` frei, damit der Strich des Kontostands
über sie hinausragt und auch dort zu sehen ist, wo ein Balken endet. Die Maße stehen als
`--bh`, `--bgap` und `--bpad` an `.ttrack`.

Unter der Farberklärung steht noch ein Satz (`.tnote`, `month.tlNoDue`): dass alles ohne
Zahltag beim Monatsabschluss aufgenommen wird. Er sagt dasselbe wie der Filterknopf
„Monatsabschluss" — nur dort, wo man die Zeile sieht.

**Jede Zelle einer Zeile steht in ihrer Spalte** (`grid-column` in `css/layout.css`). In
schmalen Fenstern fällt die Veränderung weg (`display:none`), und ohne feste Spalte rückten
Kontostand und Balken dann eine Spalte nach links — ein `display:none`-Element wird im
Raster nicht mehr platziert.

**Ein Klick auf eine Zeile filtert** (`data-tpart`) — dieselben Werte wie die Filterknöpfe
darunter (`A` · `M` · `E` · `Z`), über dasselbe `toggleFilter('dueFilter',…)` in `wire()`.
Ein zweiter Klick nimmt ihn zurück. Den Filter gibt es nur bei aufgeklappter Auswertung —
zugeklappt gibt es die Zeilen nicht.
Gefiltert **wird** dabei nicht dunkel hinterlegt wie sonst: in der Fläche steht der
Kontostand und muss lesbar bleiben, deshalb ein Rahmen nach innen.

## Die Begrüßungsseite

`ui.welcome` entscheidet, ob statt einer Ansicht `viewWelcome()` (`js/views/willkommen.js`)
im `#view` steht: beim Start und wieder nach `unlinkData()`. Sie sagt zuerst, worum es geht,
und bietet dann die beiden einzigen Wege an — `data-wload` öffnet eine Datei (`loadData()`),
`data-wnew` fängt leer an (`startEmpty()` in `js/storage.js`).

**Sie hängt nicht am Inhalt der Datei, sondern daran, ob überhaupt eine gewählt wurde** —
deshalb steht sie in `ui` und nicht in `afterLoad()`, das nur den Inhalt auswertet. Ein
leeres Buch (`startEmpty`) ist keine Begrüßung mehr, obwohl `fileName` noch leer ist.

Zwei Dinge hängen daran, beide in `renderChrome()`: Ansichts- und Monatsreiter sind auf der
Begrüßungsseite **verborgen** (es gibt nichts zu wählen), und **von der Kopfzeile bleibt
dort nur die Anleitung** — Öffnen und Anfangen bietet die Seite selbst an, alles andere hat
ohne Datei keinen Sinn. Im geladenen Buch fehlt umgekehrt „Daten hochladen": geladen wird
auf der Seite, gearbeitet in der Anwendung. Beides steht in einer Zeile, der Liste der
Kennungen.

Die Knöpfe der Seite bleiben in der Tab-Reihenfolge: `tabThroughFields()` nimmt `.welcome`
ausdrücklich aus (`js/ui.js`), dort sind die Knöpfe der Inhalt und nicht das Beiwerk.

## Zugeklappte Bereiche

Dieselben drei Bereiche klappen in **beiden** Ansichten zu — die Karten der Monatsansicht
und die Blöcke der Jahresmatrix. Sichtbar bleibt jeweils nur die oberste Zeile:
Überschrift, Knöpfe, Summe. Was darunter hinge, wird gar nicht erst gebaut.

**Der Schalter ist ein Pfeil, kein Wort** (`data-fold="in|flex|out"`, gebaut in
`foldBtn()`): ▾ offen, ▸ zugeklappt, in der Kantenfarbe seines Bereichs. Er steht ganz
links in der Kopfzeile und ist so breit wie die Siegelspalte der Tabelle darunter
(`--markw` aus `css/ledger.css`) — dadurch steht er senkrecht über den Haken der
Positionen. Das Polster rechts (`padding:0 4px 0 0`) schiebt seine Mitte auf die der
Siegel; wer an `--markw` oder am Innenabstand von `.markcell` dreht, prüft diese Flucht
nach. **Der Pfeil ist ein Dreieck von rund 18 px** (▼ / ▶ bei `font-size:23px`, die
Zeilenhöhe hält die Kopfzeile flach) — kein kleines Zeichen in einem großen Kreis, sondern
das Zeichen selbst, in der Farbe des Bereichs.

**Ein Doppelklick auf die Kopfzeile tut dasselbe** (`data-dblfold` an der `.sechead`,
verdrahtet in `wire()`); auf Knöpfen und Links darin nicht, die haben ihr eigenes Ziel.

**Zugeklappt trägt der Kopf keine Linie mehr** (`.card.folded>.sechead`): unter ihm steht
keine Zeile, die er abtrennen könnte — der Bereich ist dann nur noch eine Farbe.

### Dieselben drei Blöcke in der Jahresmatrix

Die Blockzeilen der Jahresansicht klappen genauso (`viewJahr()` in `js/views/jahr.js`).
Zugeklappt bleibt die **Blockzeile mit ihren zwölf Summen** stehen, die Zeilen darunter
werden gar nicht erst gebaut — dasselbe Versprechen wie im Monat: Überschrift und Summe
bleiben.

Der Pfeil (`data-yfold`, gebaut in `yfoldBtn()`) steht in `td.ed`, der **Stiftspalte** —
eine Blockzeile hat dort nichts, und es ist die erste Spalte, also dieselbe Stelle wie im
Kartenkopf des Monats. Er trägt die Kantenfarbe seines Blocks
(`.matrix tr.sec.r-* .foldarrow` in `css/matrix.css`), ist mit 15 px kleiner als der der
Monatsansicht und macht die Blockzeile über `line-height:.8` nicht höher. Der Doppelklick
sitzt hier an der **ganzen Zeile** (`data-dblyfold` am `tr`), nicht an einer Zelle: die
Zeile ist die Überschrift.

**Zwei Schalter, nicht einer:** `state.folded` gilt der Monatsansicht, `state.foldedYear`
der Matrix. Es sind zwei verschiedene Listen im selben Buch — wer den Monat aufräumt, will
nicht die halbe Matrix verlieren. Beide Objekte haben dieselben Schlüssel (`FOLD_KEYS`),
werden von `blankFolded()` gebaut, in `migrate()` einzeln aufgefüllt und über `isFolded(k)`
bzw. `isFoldedYear(k)` gelesen, nie direkt.

**Der Zustand steht in der Datei** und gilt für **alle zwölf Monate** — es ist eine
Einstellung wie die beiden Jahresfilter, deshalb `save()` vor dem `render()`. **Vorgabe ist
alles offen:** wer eine Datei zum ersten Mal öffnet, soll sehen, was darin steht. Ältere
Dateien kennen stattdessen das einzelne Feld `flexCollapsed`; `migrate()` zieht es in
`state.folded` herüber und löscht es — die Matrix fängt dabei offen an.

Verdrahtet sind beide Ansichten in `wire()` durch dieselbe Schleife über
`[['fold','dblfold','folded'],['yfold','dblyfold','foldedYear']]`; `toggleFold()` bekommt
den Namen der Liste als erstes Argument.

### Was das Klappen überschreibt

`foldOf(k)` entscheidet in beiden Ansichten, was **zu sehen** ist — die Datei bleibt dabei
unberührt. Zwei Dinge klappen alles auf, und gegen sie lässt sich **gar nicht** klappen:

1. **Ein Filter.** Wer sucht, soll den Treffer sehen und nicht daran denken müssen, in
   welchem zugeklappten Bereich er steckt. Im Monat sind das Suchfeld, Fälligkeit und
   Zahlungsstand (`filterOn`); in der Jahresansicht das Suchfeld und „Abgeschlossene
   ausblenden" — **„Erledigte Monate ausblenden" nicht**: es nimmt Spalten weg, in einem
   Block verbirgt sich dadurch nichts.
2. **Die offene Auswertung** der Monatsansicht: der Zeitstrahl daneben soll sich in der
   Liste wiederfinden lassen.

**Solange eins von beidem gilt, gibt es keinen Pfeil und keinen Doppelklick.** `foldBtn()`
liefert im Monat ein leeres `.foldpad` derselben Breite — sonst spränge die Überschrift —,
in der Matrix bleibt die Stiftspalte einfach leer; `data-dblfold` / `data-dblyfold` bleiben
weg. Ein Pfeil, der gegen eine Überschreibung anklappen wollte, hielte nicht, was er
verspricht, und ein Wert, den niemand sieht, soll auch nicht heimlich kippen. Fällt beides
weg, gilt wieder die Datei — unverändert.

Daraus folgt: `(n ausgeblendet)` neben einer Überschrift steht beim Filtern **immer**,
denn dann ist nichts zugeklappt.

Was der Pfeil tut, sagt sein `title` und sein `aria-label` (`month.minAreaTip` /
`year.minAreaTip` und die beiden Gegenstücke); ob der Bereich offen ist, sagt
`aria-expanded` und die Richtung des Pfeils. Geklappt wird gegen das, was zu sehen ist —
`toggleFold()` liest `aria-expanded` und schreibt das Gegenteil in die Datei.

## Die Filterzeile der Monatsansicht

Sie steht **oben in der Leiste**, unter der Auswertung, und **gilt für alle drei Bereiche** —
Einnahmen, Flexible Payments, regelmäßige Kosten und die Saldokorrektur gleich mit. In
einer der Karten stünde sie an der falschen Stelle: sie filtert nicht diese Karte, sondern
den ganzen Monat. In der Reihenfolge, in der man filtert: das Suchfeld (`data-q`), dann die
Fälligkeit (`data-duefilter`: `alle` · `A` · `M` · `E` · `Z`), dann der Zahlungsstand
(`data-filter`: `alle` · `offen` · `unklar` · `bezahlt`).

Wie die drei Bereiche gefiltert werden, steht in `viewMonat()`:

| | Zahlungsstand | Fälligkeit | Suchbegriff |
|---|---|---|---|
| Posten (Einnahmen, Kosten) | `paidAt` / `estOf` | `dueGroup(it.dueDay)` | `hayItem` |
| Flexible Payments | `kakDone` / `e.estimated` | immer `Z` — sie haben keinen Zahltag | `hayKak` |
| Saldokorrektur | — sie wird nicht abgehakt | immer `Z` | `hayItem` |

Was eine Karte dabei verliert, steht als `(n ausgeblendet)` neben ihrer Überschrift; bleibt
gar nichts übrig, sagt der Satz darin, ob es am Filter liegt oder ob der Bereich leer ist.
**Und solange gefiltert wird, steht jede Karte offen** — auch eine, die in der Datei
zugeklappt ist, und zuklappen lässt sie sich dabei nicht (siehe „Zugeklappte Bereiche").
Eine Karte ohne Treffer zeigt also ihren Satz, nicht bloß ihren Kopf. Die drei Gruppen der Zeile — Suchfeld, Fälligkeit,
Zahlungsstand — trennt eine senkrechte Linie (`.anabar .fbgroup`).

Gebaut werden Feld und Knöpfe von `filterField()` und `fbtn()` in `js/ui.js`; die
Jahresansicht benutzt dasselbe Feld. Ein Knopf zeigt am dunklen Grund, dass er angewendet
ist, und ein zweiter Klick nimmt ihn zurück (`toggleFilter()` in `wire()` — er springt dann
auf `alle`). Die Erklärung hängt als `data-tip` daran; das Suchfeld trägt zusätzlich
`data-tiphover`, seine Sprechblase kommt also **nur von der Maus**. Beim Fokus stünde sie
die ganze Zeit daneben, denn der Fokus kehrt immer wieder dorthin zurück (siehe unten).

**Rechts vom Feld steht `data-qclear`**, das Gegenstück zum Tippen: es setzt `ui.q`,
`ui.filter` und `ui.dueFilter` in einem Zug zurück und ist gesperrt, solange keiner davon
gilt. Die beiden Knöpfe der Jahresansicht rührt es **nicht** an — die stehen in der Datei
und sind eine Einstellung, kein Handgriff. **Escape tut dasselbe** (Handler in `js/app.js`),
aber nur, wenn kein Fenster offen ist: dort gehört Escape dem Fenster (`js/ui.js`).

**Drei Wege führen ins Feld**, alle drei als Handler unten in `js/app.js`:

* **Einfach lostippen.** Ein einzelnes Zeichen ohne Strg/Cmd/Alt hängt sich an `ui.q`, wenn
  gerade kein Feld den Fokus hat — in Monat und Jahr gibt es nichts anderes, wohin ein
  Buchstabe gehörte. Außen vor bleiben: ein offenes Fenster, die Begrüßungsseite, Ansichten
  ohne Suchfeld und das Leerzeichen bei leerem Feld (es filterte auf nichts und nähme dem
  Browser das Blättern).
* **Strg/Cmd + Umschalt + F** von überall; ohne Suchfeld in der Ansicht wechselt es zuerst
  in die Jahresansicht, weil die alle zwölf Monate durchsucht.
* **Der Fokus von selbst**, wenn nach dem Zeichnen niemand sonst ihn hat (siehe `wire()`).

Sie ist ein eigener Bereich und sieht auch so aus: **grauer Grund und eine dunkle Kante
links**, wie die Karten darunter ihre Farbe tragen — nur ist ihre Farbe keine Geldart, sie
gehört zu allen dreien.

Weil die Zeile oben klebt, kostet jeder Umbruch dauerhaft Platz. Deshalb sitzt sie enger
als sonst (`.anabar .filterbar` in `css/layout.css`), und ihr Suchfeld gibt nach
(`.fltbox.flttop`, 230 px statt der `--leadw`-Breite der Jahresansicht): bis hinunter zu
etwa 1100 px bleibt alles in einer Zeile.

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
selbst steht auf dunklem Grund (`aria-pressed`), sobald die Suche anders eingestellt ist als
von Haus aus: wie bei den Filterknöpfen heißt dunkel „gilt gerade".

**Der sechste Haken beantwortet eine andere Frage.** `#ffHidden` → `state.qHidden`, gelesen
über `qAll()` (`js/state.js`), steht abgesetzt unter den fünf (`.wherelist`) und zählt bei
„mindestens eins" **nicht** mit — die fünf sagen, *worin* gesucht wird, dieser sagt, *wo*.
Steht er, überstimmt ein Suchbegriff die übrigen Filter: beide Ansichten rechnen dafür ein
`wide = !!q && qAll()`.

* **Monat** (`viewMonat`): `show()` prüft nur noch den Suchbegriff, Zahlungsstand und
  Fälligkeit entfallen — und gesucht wird in `state.fixed` statt in `dueIn(m)`, also auch in
  Posten, die in diesem Monat gar keinen Betrag haben.
* **Jahr** (`viewJahr`): `base()` lässt „Abgeschlossene ausblenden" und die Regel fallen,
  dass eine Position ohne jeden Betrag nicht in der Matrix steht.

**Ohne Suchbegriff ändert der Haken nichts** — er ist kein Schalter für „alles zeigen",
sondern gehört der Suche. Vorgabe ist aus.

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
Namen (`.noteprev`), als Monatsnotiz in der Monatsansicht (`.itemnote`, aufrecht und
linksbündig — kursiv las sie sich wie ein Einschub; ein senkrechter Strich davor bindet sie
an ihre Position und wächst über alle ihre Zeilen mit) und in der Monatszelle
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

## Der Anfangsbestand

`state.opening` ist der Kontostand **vor dem Januar** — eine einzelne Zahl, gelesen über
`opening()` aus `js/state.js`, nie direkt (ältere Dateien haben das Feld nicht, und eine
Null ist dann die richtige Antwort). Sie darf negativ sein. Gepflegt wird sie auf der
Hauptseite der Einstellungen, im dritten Feld neben dem Abrechnungsjahr (`#sOpen`,
`set.opening`): ein Textfeld wie jeder Betrag — `parseGermanNumber` beim Speichern,
Vorzeichenfarbe über `.signed`, deshalb `bindSign(box)` in `openSettings()`.

**Sie ist kein Posten.** Sie steht in keiner Kategorie, wird nicht abgehakt und gehört
keinem Monat — deshalb `state.opening` und nicht `state.fixed`, und deshalb die
Einstellungen und keine Zeile in einer Ansicht.

Sie wirkt an **drei** Stellen, und alle drei müssen dasselbe sagen:

* `carryIn(m)` in `js/calc.js` — der Stand, den ein Monat vorfindet, und damit die Zeile
  „Monatseröffnung" des Zeitstrahls. Im Januar steht dort genau der Anfangsbestand.
* `yearFlow()` fängt bei ihm an (`let run=opening()`), und `yearScale()` zählt den Stand vor
  dem Januar dann für den Maßstab mit (siehe „Die Spalte „Verlauf"").
* `viewPrognose()` — die Spalte „Kumuliert" (`let cum=opening()`), die Kennzahl „Saldo
  bisher" und die eigene Zeile über dem Januar (`openRow`). Alle drei müssen mit dem Verlauf
  daneben übereinstimmen.

Wer eine vierte Stelle baut, die einen laufenden Stand zeigt, fängt ebenfalls bei
`opening()` an. Ohne Anfangsbestand ist alles wie zuvor: die Null.

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
der Karten: dieselben Siegel gibt es in allen drei Blöcken. Gesetzt ist sie wie die
Statuszeile ganz unten — dünne Linie darüber, kleine Schreibmaschinenschrift, kein Kasten:
sie erklärt etwas, sie meldet nichts.

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
Flexible Payments, die Auswertung samt Filterzeile im Monat und die Kennzahlenleiste der
Prognose. Das `top` dieser Leisten steht **nicht**
im Stylesheet — die Kopfzeile ist je nach Ansicht unterschiedlich hoch, weil es die
Monatsreiter nur im Monat gibt. `syncStickyTops()` in `js/app.js` misst sie und setzt das
Maß; die Funktion läuft am Ende von `wire()` sowie bei jedem Scrollen und Größenwechsel.
Eine neue mitlaufende Leiste braucht deshalb nur die Klasse. Weil gemessen und nicht
geraten wird, rücken die Kartenköpfe darunter von selbst nach, wenn die Auswertung
aufgeklappt wird.

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
welchem Block er liest und was der Block kostet; die Filterzeile steht oben in der Leiste
und ist ohnehin die ganze Zeit zu sehen. `position:sticky`
reicht nie über den Elternteil hinaus: die Überschrift wandert mit ihrer Karte aus dem
Bild, sobald die nächste kommt — genau das ist gewollt.

Die Maße staffeln sich, und keins davon steht im Stylesheet: Kopfzeile → Leiste der
Ansicht → Kartenkopf. `syncStickyTops()` misst die Höhen der Reihe nach und setzt `top` an
jeder Stelle — deshalb rücken die Kartenköpfe von selbst nach, wenn die Auswertung
aufgeklappt wird. Auch hier gilt: deckender Hintergrund — der Kartenkopf trägt
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
