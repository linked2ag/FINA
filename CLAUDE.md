# FINA — Orientierung für Änderungen

Jahres- und Monatskassenbuch im Browser. Statische Dateien, keine Frameworks, kein Build,
kein Server. Alle Inhalte kommen aus einer JSON-Datei, die der Nutzer hochlädt — **im Code
stehen keine Beträge, Banken, Kategorien oder sonstigen Daten**.

**Es gibt FINA dreimal, aus denselben Dateien:** als Webseite auf GitHub Pages, als
Mac-App und als Windows-App. Der Rahmen für die beiden Apps steht in `desktop/`
(Electron); die Anwendung selbst weiß davon nur eins — `window.FINA_NATIVE`. Siehe
„Die drei Fassungen" weiter unten und `desktop/README.md`.

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
| Farbe, Schrift, Abstand global; die `@font-face`-Regeln | `css/tokens.css` |
| Die Schriftdateien selbst und ihre Lizenz | `css/fonts/` |
| Kopfzeile, Reiter, Karten, Kennzahlenleiste, mitlaufende Leisten | `css/layout.css` |
| Knöpfe, Siegel, Lampen, Fenster, Formulare, Tooltip | `css/components.css` |
| Tabellen der Monats-/Prognose-/Flexible-Payments-Ansicht | `css/ledger.css` |
| Jahresmatrix: Spalten, Trennlinien, Betragsfarben | `css/matrix.css` |
| Reihenfolge der Reiter, welcher Reiter überhaupt erscheint, Auswahllisten, SVG-Symbole | `js/config.js` |
| Die Versionsnummer — **die einzige Stelle** | `js/config.js` (`VERSION`) |
| Zahlen-/Textformat, Fälligkeitsregeln (A/M/E, Zahltag) | `js/format.js` |
| Aufbau des Zustands, Altdateien reparieren (`migrate`) | `js/state.js` |
| Kategorie umbenennen/anlegen/löschen | `js/categories.js` |
| Summen, Salden, „Monat erledigt", Rangfolge der flexiblen Werte, mittlerer Verbrauch | `js/calc.js` |
| Datei laden/speichern, dirty-Zustand, Statuszeile | `js/storage.js` |
| CSV-Import aus Fast Budget | `js/csv.js` |
| CSV-Import einer FINA-Tabelle | `js/sheet.js` |
| Notizlampe, Tooltip, Kurzmeldung, Fenster schließen, Entwürfe, Vorzeichenfarbe | `js/ui.js` |
| Inhalt einer Ansicht | `js/views/jahr·monat·prognose·kakeibo.js` |
| Begrüßungsseite (ohne Datei) | `js/views/willkommen.js` |
| Inhalt eines Fensters | `js/dialogs/item·kakeibo-betraege·settings·csv-import·sheet-import·filter-fields.js` |
| Text der Anleitung und der Bereich rechts | `js/dialogs/guide.js` |
| Bildschirmfotos für README und Anleitung | `doc/make-shots.py` → `doc/img/` |
| Was der Anleitung noch fehlt (Merkzettel) | `doc/GUIDE-TODO.md` |
| Was beim Klick passiert; Start der Anwendung | `js/app.js` |
| Fenster, Menü, fremde Links der Mac-/Windows-App | `desktop/main.js` |
| Wie die Apps gebaut und veröffentlicht werden | `desktop/README.md` |
| Die Startseite — Verkauf, Preise, Downloads, Sprachweiche | `index.html`, `css/landing.css` |
| Die Guide-Seite (Kurzübersicht fürs Netz) | `guide.html` |
| Alle Funktionen im Einzelnen (Verkaufsseite) | `features.html` |
| Der Vergleich mit dem, was es sonst gibt | `compare.html` |
| Sprache, Sprungmenü, Ausschnitt, Downloads, Bewegung **dieser vier Seiten** | `js/landing.js` |
| Der Web-Client — die Anwendung selbst | `Webclient.html` (lädt `js/` und `css/`) |
| Welche Fassung die Apps als aktuell melden | `version.json` |
| Das Symbol — Reiter der Seite **und** App-Icon | `desktop/build/icon.html` → `icon.png` |

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
`wload` `wnew` (Begrüßungsseite) · `opening` (Anfangsbestand in den Einstellungen öffnen) ·
`kpick` `ktop` `kmonth` (Flexible Payments: rechte Spalte, Zeitraum) · `goto` `kview`
(Sprünge in eine andere Ansicht) ·
`edit` `kedit` `dbledit` `dblkedit` `lists` (Fenster) · `newitem` `newkak` (neu anlegen) ·
`links` (Auswahl der zugehörigen Links).

`data-dbledit` und `data-dblkedit` sitzen an der **Zeile**, nicht an der Zelle, und sie
gibt es in **jeder** Ansicht: ein Doppelklick auf den Betrag oder auf die Bezeichnung
öffnet dasselbe Fenster wie der Stift. Gebaut werden sie mit `dblItem(id)` /
`dblKak(key)` aus `js/ui.js`; verdrahtet sind sie einmal in `wire()`.

**Ausnahme Prognose: dort trägt die Zelle das Merkmal.** Eine Zeile ist da ein Monat und
keine Position — an der Zeile stünde der Doppelklick über sechs Zahlen, die verschiedenen
Dingen gehören. In der Spalte COR trägt deshalb jede Monatszelle `dblItem(state.balance.id)`
samt `data-m` (siehe „Die Spalten der Prognose"). Für `wire()` ändert das nichts: der
Doppelklick hängt am Element mit dem Merkmal, und `td.num` steht ohnehin in `DBLCELL`.

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
`state.groups`. Früher gab es dafür den einen festen Block `'EINNAHMEN'`; er ist heute nur
noch der Name, unter dem `migrate()` eine **alte** Datei weiterführt — die Posten zeigen mit
`it.group='EINNAHMEN'` schon darauf, für sie ändert sich nichts. Als roher Schlüssel wird er
**nicht** übersetzt; angezeigt wird er über `keyLabel()` als `INCOME` (Regel 3).

**Die Liste darf leer sein**, und `incomeGroups()` fällt auf nichts mehr zurück (siehe „Ein
neues Buch weiß nichts"). Leer heißt: es gibt noch keine Einnahmen — dieselbe Antwort, die
`costGroups()` und `kakCats()` in diesem Fall geben. Wer irgendwo `incomeGroups()[0]` liest,
rechnet also mit `undefined`.

**`isIncome(it)` fragt die Liste, nicht einen festen Namen** (`js/calc.js`). Daraus folgt
das Wichtigste: **ein Name darf über beide Listen zusammen nur einmal vorkommen.** Stünde
er in beiden, wäre nicht mehr entscheidbar, ob ein Posten Geld bringt oder kostet.
Durchgesetzt wird das in `applyRenames()` in `js/dialogs/settings.js`, das bei einer
Kategorieliste auch gegen die jeweils andere prüft.

Beide Listen laufen dort durch dieselben Zweige — `collect()`, `applyRenames()`,
Hinzufügen, Entfernen, Speichern kennen `'incomeGroups'` neben `'groups'`. Beim Entfernen
ziehen die Posten in die erste verbliebene Kategorie **derselben** Liste um: eine Einnahme
darf nicht bei den Kosten landen; die letzte Kategorie **in Gebrauch** gibt das Fenster
nicht her (`set.keepOne`).

**Keine Einnahme-Kategorie ist erlaubt.** Wer die letzte leert, meint es so — ein frisch
angefangenes Buch hat ohnehin keine. `#lSave` holt nur das zurück, worauf noch ein Posten
zeigt: ohne seine Kategorie entschiede `isIncome()` ihn stillschweigend zu den Kosten, und
seine Zeile wechselte den Block. Dafür merkt sich das Fenster die Liste **vor**
`applyEdits()` — danach steht dort schon die neue.

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
läuft. Neue Dateien in `Webclient.html` eintragen: `i18n.js` zuerst, dann Werkzeuge,
dann Ansichten, `app.js` bleibt die letzte. Auf oberster Ebene deklarierte `const`/`function` sind für alle später
geladenen Dateien sichtbar.

**Die Regel gilt dem Laden der eigenen Dateien.** Die müssen über `<script>` und `<link>`
hereinkommen — `fetch` auf eine Datei daneben scheitert unter `file://`, und genau deshalb
gibt es hier keinen Build. Eine Abfrage an eine **fremde** Adresse ist etwas anderes: es
gibt sie genau einmal (`checkUpdate()` in `js/app.js`, siehe „Die drei Fassungen"), sie
läuft nur in der App, und sie darf scheitern.

## Die drei Fassungen

Dieselben Dateien laufen an drei Orten: als **Webseite** auf GitHub Pages, als **Mac-App**
und als **Windows-App**. Der Rahmen für die beiden Apps steht in `desktop/` — Electron,
also dieselbe Chromium-Maschine, an der FINA ohnehin gemessen ist. Wie gebaut und
veröffentlicht wird, steht in `desktop/README.md`; hier steht nur, was die **Anwendung**
davon merkt.

**Sie merkt genau eins: `window.FINA_NATIVE`.** Gesetzt wird es von `desktop/preload.js`,
im Browser ist es undefiniert. Daran hängen drei Stellen und sonst nichts:

* **`js/storage.js`** — `beforeunload` fragt in der App **nicht** selbst. Dort greift es
  unzuverlässig, und ein gesetztes `returnValue` kann das Fenster stumm am Schließen
  hindern. Gefragt wird im Hauptprozess (`win.on('close')` in `desktop/main.js`), der dafür
  die Variable `dirty` aus der Seite liest.
* **`js/app.js`** — `checkUpdate()` fragt `version.json` ab. **Nur in der App**, denn die
  Seite im Browser ist immer die neueste; **einmal je Sitzung**, weil ein Kassenbuch
  stundenlang offen steht; **erst mit offenem Buch**, weil der Schalter dafür in der Datei
  steht (`state.updateCheck`) und auf der Begrüßungsseite noch gar nicht gelesen ist.
  Gemerkt wird nichts — FINA führt keine Ablage neben der Datei des Nutzers.
* **`renderChrome()` in `js/app.js`** — das Wortzeichen oben links ist im Browser ein Link
  zur Startseite (`<a href="index.html">` in `Webclient.html`). In der App heißt der
  Web-Client selbst `index.html` (siehe unten): der Klick wäre dort ein stilles Neuladen
  mitsamt der ungespeicherten Arbeit, deshalb nimmt `renderChrome()` dem Link dort `href`
  und `title`.
Die Begrüßungsseite braucht `FINA_NATIVE` nicht mehr: sie nennt keine Downloads — das
erledigt die Startseite (`index.html`), und `download/` leitet als Stub dorthin weiter
(ältere App-Fassungen öffnen diese Adresse beim Update-Hinweis).

**Der Web-Client heißt in der Auslieferung der App weiter `index.html`:** `desktop/sync.mjs`
kopiert `Webclient.html` nach `desktop/app/index.html` — so bleibt `desktop/main.js`
unberührt, und in die App gelangt nie die Verkaufsseite.

**Die Sprachwahl gilt überall und in beide Richtungen.** Sie steht an vier Stellen — der
DE/EN-Schalter der Verkaufsseiten (`js/landing.js`), die Kopfzeile, die Begrüßungsseite und
das Einstellungsfenster —, und alle vier führen **eine** Notiz: `finaLang` im localStorage.
Englisch ist der Grundzustand. Die drei Stellen in der Anwendung schreiben über
`chooseLang()` (`js/i18n.js`), die Verkaufsseiten über `setLang()`; gelesen wird sie beim
Aufruf jeder Verkaufsseite und beim Start des Web-Clients für das noch leere Buch (Block
„Start" in `js/app.js`). Wer auf der Seite Deutsch wählt, bekommt die Anwendung auf Deutsch —
und umgekehrt.

**Geschrieben wird nur, was jemand ausdrücklich umstellt.** Eine geladene Datei überstimmt
die Vorgabe wie immer (`state.lang`), schreibt aber **nicht** zurück: wer ein englisches Buch
öffnet, hat damit nichts über die Webseite gesagt — sie wechselte sonst bei jedem
Dateiwechsel ungefragt die Sprache.

**Ein Cookie ist es ausdrücklich nicht.** Ein Cookie ginge bei jedem Aufruf an den Server;
im Kopf von `index.html` steht, dass die Seite nichts hochlädt, und das soll auch für die
Sprache gelten. Der localStorage hält genauso lange und verlässt den Rechner nie. Unter
`file://` kann er fehlen — dann bleibt es bei Englisch, deshalb steht jeder Zugriff in einem
`try`.

**macOS braucht mindestens eine Ad-hoc-Signatur.** `identity: null` allein ließe die App
ganz unsigniert, und eine unsignierte App startet auf Apple Silicon überhaupt nicht —
macOS meldet „beschädigt", was wie ein kaputter Download aussieht. `desktop/adhoc.cjs`
(afterPack in `desktop/package.json`) signiert deshalb ad hoc; der erste Start läuft dann
über „Trotzdem öffnen", wie es die Downloadhilfe auf der Startseite beschreibt.

**Die Versionsnummer steht an einer Stelle:** `VERSION` in `js/config.js`, dreiteilig als
`Jahr.Monat.Tag`. `desktop/sync.mjs` schreibt sie in `desktop/package.json` (und weist eine
vierte Stelle zurück — electron-builder braucht gültiges semver), `stateJson()` in
`js/storage.js` legt sie beim Speichern als `state.v` in die Datei. Der Guide-Reiter „Was
ist neu" trägt dieselbe Form, muss aber **nicht** dieselbe Nummer nennen: Versionen
entstehen dort nur auf Zuruf.

**Web und Apps laufen auseinander, und das ist ein Kanal, kein Fehler.** Die Webseite
bekommt jeden Push, die Apps nur eine gesetzte Marke. `version.json` beschreibt deshalb den
**App-Kanal** — stünde dort die Webversion, meldete jeder Push allen Apps ein Update, das
es als Download gar nicht gibt.

**Daraus folgt eine Bedingung an `migrate()`:** es **darf niemals zu einer Positivliste
werden**. `migrate(s)` in `js/state.js` flickt das übergebene Objekt an Ort und Stelle
(`if(!s.groups) s.groups=[]` …) und baut es **nicht** aus bekannten Feldern neu auf.
Unbekannte Felder überleben deshalb, und `stateJson()` schreibt sie wieder hinaus — dadurch
kann eine Datei zwischen den Fassungen wandern: wer in der neueren Webfassung arbeitet und
dieselbe Datei später in der älteren App öffnet und speichert, verliert nichts. Wer
`migrate()` als „neues Objekt aus den bekannten Feldern zusammensetzen" umschreibt — was
sauberer aussieht —, zerstört das lautlos, und der Datenverlust fällt erst Wochen später
auf.

**In `desktop/main.js` steht kein Verhalten der Anwendung.** Was dort steht, gilt nur
dafür, dass FINA außerhalb eines Browsers läuft: wohin fremde Links gehen
(`setWindowOpenHandler` / `will-navigate` → `shell.openExternal`), dass `about:blank` — die
ganzseitige Anleitung — als eigenes Fenster erlaubt bleibt, das Menü (ohne `editMenu` gäbe
es auf dem Mac kein Cmd+C) und die Einzelinstanz. Wer an FINA etwas ändert, ändert es in
`js/` und `css/`.

## Die vier Seiten außerhalb der Anwendung

`index.html` (Verkauf), `features.html` (alle Funktionen), `compare.html` (der Vergleich)
und `guide.html` (Kurzübersicht) sind **keine** Anwendung: sie laden nichts aus `js/`
außer `js/landing.js` und wissen von `state`, `render()` und `t()` nichts. Gemeinsam sind
ihnen `css/tokens.css`, `css/landing.css` und `js/landing.js` — Kopfzeile, Fußzeile,
Sprachschalter, Sprungmenü, Bewegung. **Wer eins davon ändert, ändert es auf allen vier.**

**Jede Seite beantwortet genau eine Frage.** `index.html`: „was ist das und was kostet
es". `features.html`: „was kann das". `compare.html`: „wie steht es neben dem, was es
sonst gibt". `guide.html`: „wie sieht das aus". Wer beides mischt, beantwortet keins von
beiden — deshalb sind Funktionen und Vergleich zwei Seiten und nicht zwei Abschnitte.

**Der erste Satz der Startseite sagt, WAS FINA ist** (`.hero-what`), erst danach kommt,
wogegen es sich abgrenzt („Andere zeigen dir, was war"). Dort stand bis August 2026 eine
Zeile in 11 px Versalien; wer die Seite zum ersten Mal sah, wusste danach, dass FINA
„zeigt, was kommt" — aber nicht, was es ist.

**„Guide" heißt auf Deutsch „Anleitung"**, wie `app.guide` in der Anwendung. Der
Dateiname `guide.html` bleibt, wie er ist — er ist keine Beschriftung.

**Nur, was es wirklich gibt.** Jede Zeile auf `features.html` und in der Tabelle auf
`compare.html` ist eine Zusage. Wer eine hinzufügt, prüft sie an der Anwendung. Auf
`compare.html` kommen zwei Regeln dazu: **kein Konkurrent wird beim Namen genannt** (nur
die Tendenz — „die meisten", „üblicherweise"), und **die Grenzen stehen auf derselben
Seite** (`.honest`, „Was FINA nicht ist"). Eine Vergleichsseite ohne sie liest sich wie
Werbung.

### Das Sprungmenü unten links

Der Knopf `[data-jump]` klappt eine Liste der Abschnitte auf — auf jeder Breite. Die
Kopfzeile führt zwischen den Seiten, dieses Menü innerhalb einer Seite; auf dem Telefon
entfällt die Navigation der Kopfzeile ganz (`@media (max-width:640px)`), und dort war
Scrollen bisher der einzige Weg an eine bestimmte Stelle.

**Die Liste steht im HTML jeder Seite**, nicht im Skript: nur die Seite weiß, welche
Überschriften sie hat, und beide Sprachen müssen dabei sein. `js/landing.js` schaltet auf
und zu (Klick daneben und Escape schließen) und hebt über einen `IntersectionObserver`
hervor, wo man gerade ist (`.here`). Ein neuer Abschnitt braucht also zwei Zeilen: die
Kennung am `<section>` und den Eintrag im Menü.

### Den Ausschnitt schieben

Zwei Stellen zeigen etwas, das breiter ist als sein Rahmen: die nachgebaute Jahrestabelle
im Kopf von `index.html` und das Bildschirmfoto der Matrix in `guide.html`. Beide stehen
in **Lesegröße** und sind beschnitten; rechts unten liegt die ganze Fläche als Karte mit
einem Rahmen um das, was man sieht. Ziehen verschiebt — auf der Karte wie im Ausschnitt.

Verkleinern wäre die einfache Antwort und die falsche: eine Matrix mit zwölf
Monatsspalten, die ins Fenster passt, hat 4-px-Zahlen. Man sieht dann, dass es viel ist,
und liest nichts.

Gebaut wird das in Block 3 von `js/landing.js`, das Bild dazu in `css/landing.css`
(`.panbox`, `.panview`, `.panmap`). Drei Dinge muss wissen, wer daran arbeitet:

* **Die Karte ist eine Kopie** (`cloneNode`) des Rahmeninhalts und wird auf die Breite der
  Karte geschrumpft. Ein von Hand gepflegtes Übersichtsbild — und drei nachgerechnete
  Prozentwerte für den Rahmen, wie sie bis August 2026 im Stylesheet standen — liefen
  früher oder später neben dem her, was sie zeigen sollen.
* **Gemessen wird, nicht geraten:** Höhe der Karte, Größe und Lage des Rahmens kommen aus
  `scrollWidth`/`clientWidth` des Rahmens. Passt alles hinein, verschwindet die Karte
  (`.nopan`) — wie die Rollleiste der Anwendung.
* **`overflow-y:hidden` heißt nicht unbeweglich.** Der Rahmen rollt waagerecht von selbst
  (Touch!), senkrecht nur über `scrollTop` aus dem Skript. Wäre er senkrecht rollbar,
  finge er das Mausrad ab, das der Seite gehört.

Ein neuer Ausschnitt braucht `data-pan` am Kasten, `.panview` um den Inhalt und ein leeres
`.panmap` daneben; `data-pan-y="8"` sagt, wo er senkrecht aufsetzt.

## Die Anwendung heißt FINA Buch / FINA Book

**Nach außen sprachabhängig: `FINA Buch` auf Deutsch, `FINA Book` auf Englisch — im
Fließtext `FINA`.** In der Anwendung setzt `renderChrome()` Wortzeichen und Seitentitel
über `t('app.name')`; im HTML von `Webclient.html` steht nur der englische Rückfall. Auf
Startseite und Guide-Seite steht der Name als `data-l`-Paar. **Sprachunabhängig englisch
bleiben** die Pakete (`productName` und die drei `artifactName` in
`desktop/package.json`) und der Fenstertitel der App (`title` in `desktop/main.js`) —
eine installierte App wechselt ihren Namen nicht mit der Oberflächensprache.

**„Kassenbuch" und „cash book" sind gestrichen** — überall „Haushaltsbuch" /
„household book"; wer einen Satz ergänzt, hält sich daran. In der Kopfzeile steht neben
dem Namen nur noch das Jahr (`app.sub` ist `{0}`).

**Im Fließtext bleibt es beim kurzen FINA**, und zwar in beiden Sprachen: „FINA liest den
CSV-Export", „Ist das eine FINA-Tabelle?". Die Tabelle, aus der die Anwendung entstanden
ist, heißt so — sie ist kein Buch, und `FINA-Book-Tabelle` wäre falsch. Wer einen Satz
ergänzt, hält sich daran; wer eine neue Stelle baut, an der sich das Programm **vorstellt**,
nimmt den langen Namen.

`appId` (`de.linked2ag.fina`) und der Paketname `fina` bleiben, wie sie sind: daran hängen
die Einstellungen und der Datenpfad einer schon installierten App, und sichtbar sind sie
nirgends.

## Das Symbol gibt es einmal

`icon.png` im Stamm ist beides — das Zeichen der **Webseite** (`<link rel="icon">` in
`Webclient.html`, `index.html`, `guide.html`, dem `download/`-Stub und in
`guideDoc()`) und die Vorlage, aus der **electron-builder** .icns und .ico macht.
`desktop/sync.mjs` legt es vor jedem Bau nach `desktop/build/icon.png`, wo
electron-builder es sucht; deshalb steht diese Kopie in `.gitignore`. Zwei gepflegte
Bilder liefen früher oder später auseinander, und man sähe es erst an der fertigen App.

Gezeichnet wird es aus `desktop/build/icon.html` — Farben und Schrift kommen aus
`css/tokens.css`, das Symbol kann also gar nicht anders aussehen als die Anwendung. Der
Befehl steht oben in dieser Datei.

**Der farbige Rücken ist 150 px breit und nicht 96.** Bei 32 px — Reiter, Dock, Taskleiste
— blieben von 96 px knapp drei Pixel für drei Farben übrig; die Rundung der Ecken nimmt
oben und unten ohnehin einen Teil davon weg. Wer ihn ändert, ändert das Polster von `.f`
mit: das F steht mittig auf dem **Papier**, nicht mittig im Bild.

## Die Schriften liegen bei

Zilla Slab, Archivo und IBM Plex Mono stehen als `.woff2` in `css/fonts/`, eingebunden über
`@font-face` ganz oben in `css/tokens.css`. Sie kamen bis August 2026 von
`fonts.googleapis.com`; das war an drei Stellen falsch: die App sähe ohne Internet anders
aus, als sie soll; im Kopf von `index.html` steht, die Seite lade nichts hoch, während jeder
Aufruf die IP-Adresse des Besuchers an Google überträgt; und dasselbe Einbinden hat das LG
München im Januar 2022 als DSGVO-Verstoß gewertet.

Je Schnitt zwei Dateien: `latin` deckt Deutsch und Englisch ab, `latin-ext` holt der Browser
nur nach, wenn wirklich ein Zeichen daraus auf dem Schirm steht. **Archivo ist variabel** —
eine Datei je Bereich trägt 400 bis 600, deshalb dort `font-weight:400 600` statt dreier
Regeln. Alle drei stehen unter der SIL Open Font License; `css/fonts/OFL.txt` muss
mitgeliefert werden, und der Pages-Workflow prüft, dass sie da ist.

Wer einen weiteren Schnitt braucht, legt die `.woff2` daneben und schreibt eine Regel dazu.
**Heruntergeladen wird nichts mehr** — auch nicht von `guideDoc()`, das seine ganzseitige
Anleitung über dasselbe `tokens.css` versorgt.

## Welche Reiter es gibt

`VIEWS` in `js/config.js` ist die Reihenfolge der Reiter — und die Liste selbst hängt am
Zustand: **„Fast Budget Details" erscheint nur, wenn einmal importiert wurde**
(`hasImport()` in `js/calc.js`: Buchungen in `state.tx` oder eine Quelle in
`state.flexSource`). Der Reiter wertet genau diese Buchungen aus; ohne sie stünde dort eine
leere Gliederung. Er steht als **letzter**, nach der Prognose.

**Jeder Reiter hat einen Tastengriff**, `VIEW_KEYS` unten in `js/app.js`:
Strg/Cmd + Umschalt + **M** Monat · **Y** Jahr · **F** Prognose · **D** Fast Budget
Details. Die Buchstaben folgen den **englischen** Namen und wechseln deshalb nicht mit der
Sprache — wie B · PT · DD · LP in der Jahresmatrix. Y statt J, weil „Year"; F für
„Forecast"; D für „Details" — F und B sind schon vergeben. Wer einen Reiter hinzufügt,
trägt ihn dort ein. **Gesprungen wird nur in Reiter, die es gerade gibt** — der Griff prüft
`VIEWS`, sonst führte D ohne Import in eine Ansicht ohne Reiter.

**Jeder Reiter nennt seinen Griff in der Sprechblase** (`view.keyTip`, gesetzt in
`renderChrome()` über `viewKey(k)`). Ein Griff, den niemand findet, gibt es nicht — und die
Sprechblase ist die einzige Stelle, an der die vier Buchstaben stehen; eine eigene Zeile
dafür wäre den Platz nicht wert.

Daraus folgen drei Stellen, die zusammengehören:

* **Der Weg zum Import darf nicht in diesem Reiter liegen.** Der Knopf steht im
  Einstellungsfenster im Bereich **Import** (`#impFast`, siehe „Der Bereich Import") und
  öffnet `openImportInfo()` — ein Fenster, das erst sagt, aus welcher App die Datei kommt
  und welche Spalten darin stehen müssen, und dann zur Dateiauswahl führt. Danach laufen wie
  bisher Schritt 1 und 2 in `js/dialogs/csv-import.js`. Denselben Weg nimmt der Knopf
  `#btnImportK` in der Ansicht selbst.
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

**Im Beträge-Fenster steht dieselbe Auskunft je Monat** (`tag()` in
`js/dialogs/kakeibo-betraege.js`): **IMPORTED** grün für den unveränderten Import,
**CORRECTED** orange für den von Hand gesetzten Wert.

**Die Marke liest das Feld, nicht den Zustand**, und springt beim Tippen sofort um — nicht
erst nach Speichern und erneutem Öffnen. Sie sitzt dafür in einem eigenen Platzhalter
(`.tagslot`, `data-tag`), den `showTag(i)` austauscht. Die Regel ist **dieselbe wie beim
Speichern** (`override` bleibt leer, wenn der Wert dem Import entspricht) — stünde hier eine
andere, verspräche die Marke etwas anderes, als die Datei bekommt. Und wie überall gilt:
**was ein Knopf ins Feld schreibt, löst kein `input` aus** — Schnelleingabe und „Leeren"
rufen `showTags()` deshalb selbst, genau wie `signValues()` und `showAvg()`. Beim Aufbau
gibt es die Felder noch nicht; dann zählt der gespeicherte Stand — dieselbe Farbe, die in der ganzen
Anwendung „steht noch nicht fest, das hat jemand gesetzt" heißt. Rot wäre eine Warnung, und
eine Korrektur ist keine. Die Marke sagt beim Überfahren, **was importiert war**
(`kdlg.corrTip`): wer eine Korrektur sieht, will als Erstes wissen, wovon abgewichen wurde.
Der Ursprungswert steht weiter in `state.flexActual` — die Korrektur liegt daneben in
`override` und überschreibt ihn nicht.

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

## Die Spalten der Prognose

Eine Zeile liest sich wie ein Kontoauszug des Monats: **womit er anfängt, was ihn bewegt,
womit er schließt.**

| M | START | IN · REG · FLEX · COR | END |
|---|---|---|---|
| Monat | Stand, den der Monat vorfindet | die vier Bewegungen | Stand danach |

`START` einer Zeile ist `END` der Zeile darüber, im Januar der Anfangsbestand — und er ist
zugleich der Anfang des Balkens daneben. Beides kommt aus derselben Zahl (`start` in
`viewPrognose()`), damit Tabelle und Grafik nicht auseinanderlaufen können.

**Jede Bewegung trägt die Farbe ihrer Geldart.** Die vier mittleren Spalten bekommen den
hellen Grund, den dieselbe Geldart überall trägt — `--bg-in` · `--bg-out` · `--bg-flex` ·
`--bg-bal`, dieselben Farben wie die Kennzahlen darüber und die Karten der Monatsansicht. In
einer Tabelle aus sieben Zahlenspalten sagt die Farbe schneller als die Überschrift, was man
gerade liest. Die Klassen stehen in `PROG_COLS` (Kopf) **und** an den Zellen der Zeile
(`incol` · `outcol` · `flexcol` · `balcol` · `endcol`, gefärbt in `css/ledger.css`): gefärbt
wird die ganze Spalte, Kopfzelle eingeschlossen, sonst liest sie sich als zwölf getönte
Zellen statt als ein Streifen.

**`START` bleibt ungefärbt** — es ist keine Bewegung, sondern ein Stand, derselbe, der eine
Zeile höher unter `END` steht. **`END` trägt `--bg-sal`**, das Violett von „alles zusammen"
(Anfangsbestand, Saldozeile), in der hellsten Stufe: es ist ein Grund und keine Marke. Die
Monatsspalte links bleibt frei — sie klebt beim seitlichen Rollen und braucht ihren
deckenden Grund für sich.

**Vorher standen dort „BAL" und „CUM"** — die Summe der Bewegungen und der laufende Stand.
Dieselbe Rechnung, aber die falsche Erzählung: die Zahl, die man im Balken daneben sieht,
ist der **Kontostand**, und der stand ganz rechts, während links eine Summe stand, die es
auf keinem Konto gibt. Wer in einem Monat −823,97 las und im Balken das Konto bei 5.422 sah,
musste beides erst zusammenrechnen und hielt die Grafik für falsch. Die Summe der Bewegungen
gibt es weiterhin: als Unterschied zwischen START und END und als Länge des Balkens. Eine
eigene Spalte braucht sie nicht.

## Was sich in der Prognose ändern lässt

Die Prognose rechnet, sie führt keine Werte — mit **zwei** Ausnahmen, und beide sind
Doppelklicks auf die Zahl selbst. Wo eine Zahl steht, soll auch der Weg zu ihr sein; sonst
wechselt man die Ansicht, um etwas zu ändern, das man gerade ansieht.

* **Spalte COR, eine Monatszeile** → die Saldokorrektur dieses Monats, dasselbe Fenster und
  dieselbe Hervorhebung wie ein Doppelklick auf ihre Zeile in der Jahresmatrix. Gebaut in
  `corEdit(m)` (`js/views/prognose.js`): `dblItem(state.balance.id)` **an der Zelle**, dazu
  `data-m` — verdrahtet ist das schon (siehe die Ausnahme unter Regel 1). Die COR-Zelle der
  Anfangsbestandszeile bleibt außen vor: sie gehört keinem Monat.
* **Spalte END, die Zeile „Anfangsbestand"** → das Einstellungsfenster, Bereich
  „Allgemein", mit der Schreibmarke in `#sOpen` und dem Wert markiert. Das Merkmal ist
  `data-opening`, verdrahtet in `wire()`; es öffnet `openSettings('sOpen')`. Der
  Anfangsbestand ist eine Einstellung und hat kein eigenes Fenster (siehe „Der
  Anfangsbestand"), diese Zeile ist aber die einzige Stelle, an der er in einer Ansicht
  steht. **Nur diese eine Zelle**: END einer Monatszeile ist eine gerechnete Summe.

Die beiden Sprechblasen sind der einzige Hinweis darauf, dass hier etwas anfassbar ist —
`prog.tipBal` am Spaltenkopf COR und `prog.openEdit` an der Zelle selbst. Wer die Wege
ändert, ändert die beiden Sätze mit.

**`openSettings(wohin, done)` nimmt einen Bereich oder ein Feld.** Ein Bereichsname steht in
`SET_PANE_LABEL` (das ist zugleich die Reihenfolge des Menüs), eine Feldkennung in
`SET_FIELD_PANE` — dort steht, in welchem Bereich das Feld wohnt. Gestellt wird der Bereich,
**bevor** gebaut wird, sonst führte der Weg auf ein verborgenes Feld. Ohne Argument bekommt
nichts den Fokus: wer die Einstellungen selbst öffnet, sucht sich, was er ändern will. Wer
ein weiteres Feld von außen ansteuerbar macht, trägt es dort ein; `done` ist der Rückweg für
ein Fenster darunter (siehe „Der Weg zu einer Liste steht über der Liste").

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

**Die Untergrenze gilt dem einzelnen Rasterfeld, nicht der Spalte.** Der Abstand von einer
Linie zur nächsten ist mindestens so breit wie die Monatsspalte daneben (`--progleadw` an
`.progtable`, 120 px): zwei Linien im Abstand von 40 px sind kein Maß mehr, an dem sich etwas
ablesen ließe, und die Beträge darüber schöben sich ineinander.

Wie viele Felder die Achse hat, weiß nur die Rechnung — Spanne durch Schrittweite. Sie geht
als `--flowcells` an die Tabelle (`viewPrognose()`), die Breite kommt aus dem Stylesheet:
`min-width:calc(var(--progleadw) * var(--flowcells))`. **Wer an `step` oder an `yearScale()`
dreht, ändert damit auch die Mindestbreite der Spalte.**

Reicht das Fenster dafür nicht, **scrollt die Tabelle waagerecht** in ihrem `.scroll`-Rahmen,
und die Monatsspalte bleibt stehen (`position:sticky` an `td/th:first-child`) — eine Zahl
ohne ihren Monat ist keine Zeile mehr.

**Gerollt wird frei** — die Tabelle rastet nirgends ein (siehe „Waagerecht scrollen" weiter
unten). Die klebende Monatsspalte braucht dafür einen **deckenden** Grund; deshalb tritt sie
in vergangenen Monaten mit ihrer *Schriftfarbe* zurück und nicht mit der Deckkraft
(`opacity` färbte auch den Hintergrund durchsichtig).

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

**Luft unter dem Anfangsbestand braucht die Achse nicht.** Sein Balken fängt an der
Rasterlinie vor ihm an — bei 2.123 auf einem Raster von 5.000 also bei der Null —, und die
liegt ohnehin in der Fläche. Früher bekam die Achse dafür pauschal einen ganzen Schritt
geschenkt; das schob ihren Anfang auf −5.000 hinunter, wo nichts steht.

Und er bekommt eine **eigene Zeile über dem Januar** (`openRow` in `viewPrognose()`,
`tr.openrow`) — so wie die Monatseröffnung im Zeitstrahl eine eigene Zeile ist: er ist keine
Bewegung eines Monats, sondern der Stand, auf dem das Jahr aufsetzt. Im Januarbalken sähe er
aus wie etwas, das der Januar bewegt hätte. Zahlen stehen darin nur zwei — der Name und
derselbe Betrag in „Kumuliert"; die Spalten dazwischen beschreiben Bewegungen.

Die Zeile ist **so hoch wie jede andere** (`two` an ihrem `.ttrack`, der Balken darin
`solo`) und endet mit demselben schwarzen Strich (`.tmark`) wie die Monatszeilen — er
markiert überall den Stand, mit dem die Zeile schließt.

**Sein Balken fängt an der Rasterlinie vor ihm an**, nicht bei der Null: bei 120.000 auf
einem Raster von 2.000 also bei 118.000. **Liegt er genau auf einer Linie**, wäre der Balken
null breit und die Zeile leer — dann wird das ganze Feld davor genommen. Bei einem Guthaben
liegt es links vom Strich, bei einem Minus rechts: der Balken kommt immer von der Seite, auf
der der Betrag weiter von der Null entfernt ist. Von der Null aus wäre er bei großen Beständen die
ganze Zeile lang und sagte nichts mehr — und er zwänge die Achse dazu, unterhalb des ersten
Werts anzufangen. Liegt sein Anfang nicht genau auf der Null, ist er ein abgeschnittenes
Stück und
franst zum Rand hin aus (`.tsum.cutl/.cutr` an `.ytrack`) — dieselbe Aussage und dasselbe
Mittel wie beim beschnittenen Balken der Monatsansicht: ein Farbverlauf ins Durchsichtige,
keine Kante. Ausgefranst wird an der Seite, aus der er kommt: bei einem Guthaben links, bei
einem Minus rechts.

**Raster und Balken rechnen in derselben Breite.** Die Rasterlinien liegen in der *Zelle*,
der Balken samt seinem kräftigen Strich in einer Fläche darin — hat die Zelle einen
Innenabstand, sind das zwei verschiedene Maßstäbe, und der Strich landet ein bis zwei Pixel
neben seiner Linie. `.flowcell` hat deshalb **auf keiner Seite** ein Polster, und `.tmark`
rückt in `.ytrack` ein halbes Pixel weiter als im Zeitstrahl: der Strich ist 2 px breit, die
Rasterlinie 1 px, und beide sollen dieselbe Mitte haben. Wer daran dreht, prüft es an einem
Anfangsbestand, der genau auf einer Rasterlinie liegt.

**Die Achse liegt auf dem Raster.** Anfang und Ende werden auf ein Vielfaches der
Schrittweite gezogen (`viewPrognose()`), und die Schrittweite danach neu gewählt: die
feinste Stufe, die für die gezogene Spanne höchstens zehn Felder ergibt.

**Gezogen wird auf die Werte selbst, nicht auf die gepolsterte Spanne.** `spanScale()` gibt
dafür `rawLo`/`rawHi` zurück — die Grenzen **ohne** die 8 % Luft. Die Luft braucht der
Zeitstrahl der Monatsansicht, weil er kein Raster hat, an dem sich ein Balken festhalten
könnte; hier schöbe sie die Grenze über die nächste Rasterlinie hinaus, und vorn stünde ein
Feld, in dem nichts ist. **Ein leeres Feld ist keine Aussage, nur Weg zum Lesen.** Der
Balken des Anfangsbestands zählt dabei mit (`openFrom(v)`): er fängt an der Rasterlinie vor
ihm an und liegt damit unter allen anderen Werten — wo genau, hängt von der Schrittweite ab,
deshalb wird er je Stufe mitgerechnet und nicht einmal vorab. Dadurch fällt die
**erste Rasterlinie genau auf den linken Rand der Spalte** — und das ist derselbe Strich,
der die Spalte „Kumuliert" abschließt. Die Grafik zeichnet die äußeren beiden Linien deshalb
**nicht** selbst (links der Strich der Tabelle, rechts ihr Rand) und fängt ohne
Innenabstand an; ihre Beträge stehen trotzdem darüber. Vorher fing die Achse irgendwo an,
die erste Linie stand ein Stück drinnen, und zwischen der letzten Zahl und dem Raster klaffte
eine Lücke, die nichts bedeutete.

**Über der Spalte steht keine Überschrift, sondern die Achse selbst**: an jeder Rasterlinie
der Betrag, für den sie steht (`axis` in `viewPrognose()`, `th.axishead .tax` in
`css/ledger.css`). „Verlauf (Raster 2.000)" nannte nur den Abstand — man musste von der Null
aus durchzählen. Die Marken erben Schrift und Größe der Kopfzelle und sitzen auf deren
Innenabstand (`top:7px`), damit sie auf einer Zeile mit M · IN · REG · … stehen. Die beiden
äußeren legen sich an die Kante, statt über den Rand zu ragen — und halten dabei **denselben
Abstand von der Trennlinie wie die Beschriftung der Nachbarspalte** auf der anderen Seite
(die 6 px Innenabstand aus `.ledger td,.ledger th`). Bei beschnittener Achse wandern
sie mit — sie kommen aus derselben Rechnung wie die Linien.

Die Farberklärung steht als `.thint` unter der Tabelle — dieselben Marken wie im Zeitstrahl,
und bei beschnittener Achse ihr Maßstab dazu. **Vergangene Monate bleiben blass**
(`opacity:.42` an der Zeile): das gilt für die Zahlen wie für den Balken, Ist und Plan
sollen unterscheidbar bleiben.

## In der Jahresmatrix steht jede Position, auch die ohne einen einzigen Betrag

Die Matrix ist die Ansicht, in der **angelegt** wird: hier entsteht eine Position, und
danach werden ihre Monatswerte eingetragen. Wäre sie erst zu sehen, sobald irgendwo eine
Zahl steht, verschwände sie genau zwischen diesen beiden Schritten — der Nutzer hätte sie
gerade eingetippt und fände sie nirgends wieder.

`base(it)` in `js/views/jahr.js` prüft deshalb nur noch „Abgeschlossene ausblenden". Für die
Flexible Payments galt das schon immer (`kakRows` in derselben Datei); Einnahmen und Kosten
folgen jetzt derselben Regel, und eine Kategorie, in der nur solche Posten stehen, bleibt
mit ihrer Zwischenzeile stehen.

**„Abgeschlossene ausblenden" nimmt sie nicht weg:** `yearSettled()` in `js/calc.js`
verlangt mindestens einen Betrag — was nie etwas gekostet hat, ist auch nicht abbezahlt. Aus
demselben Grund zählt `countHidden()` sie nicht in die Zahl neben dem Knopf.

**Die Monatsansicht bleibt davon unberührt.** Dort steht, was in *diesem* Monat fällig ist;
ein Posten ohne Betrag ist es nicht. Wer ihn dort sucht, findet ihn über das Suchfeld mit
dem sechsten Haken (siehe „Worin das Suchfeld sucht").

## Die oberste Zeile der Jahresmatrix ist der Monat selbst

Sie zeigt `saldo(m)` — alles, was der Monat bringt, und alles, was er kostet, für **diesen
einen Monat** (`totRow` in `js/views/jahr.js`, `year.totalRow` „Gesamt je Monat").

**Ihre Zahlen tragen die Vorzeichenfarbe**, grün und rot wie jeder Betrag einer Position
(`.matrix tr.balpin td.num.pos/.neg` in `css/matrix.css`) — die Gesamtspalte rechts
eingeschlossen. Kategorie- und Blockzeilen bleiben schwarz, weil sie Überschriften über
etwas sind; diese Zeile ist keine Überschrift, sondern das **Ergebnis** des Monats, und ob er
ins Plus oder ins Minus läuft, ist ihre ganze Aussage. Dieselbe Ausnahme gilt schon für die
Saldokorrektur (`tr.r-bal`). Damit
liest sich die Matrix von oben nach unten als **Aufschlüsselung derselben Zahl**: die Zeile
nennt das Ergebnis, die drei Blöcke darunter sagen, woraus es besteht. In der Gesamtspalte
steht folglich die gewöhnliche Summe der zwölf Monate — das Ergebnis des Jahres.

**Der Kontostand steht hier nicht mehr.** Er stand hier als `carryIn(m) + saldo(m)` und trug
damit den Anfangsbestand und alle Monate davor in eine Tabelle hinein, in der jede andere
Zahl genau **einem** Monat gehört: zwei Bedeutungen in derselben Spalte. Wo das Konto am
Monatsende steht, sagt die **Prognose** in der Spalte `END` — dort steht es neben dem
Verlauf, an dem man es liest, und dort ist auch der Anfangsbestand eine eigene Zeile. Mit
dem Kontostand ist auch der Anfangsbestand aus der Beschriftung verschwunden (`.openhint`,
`year.openLab`, `year.openTip` — alle drei sind weg): er steckt in keiner Zahl dieser Zeile
mehr.

**Vor dem ersten Block steht eine Leerzeile wie zwischen allen Blöcken.** Die Gesamtzeile
hängt im `<thead>` (damit sie klebt), die Saldokorrektur ist die erste Zeile des ersten
`<tbody>` — ohne die Lücke klebte sie unmittelbar an ihr, während alle übrigen Blöcke
voneinander abgesetzt sind. Deshalb setzt `viewJahr()` den `spacer()` vor **jedes** Stück
und nicht mehr nur zwischen zweien. Beim Scrollen verschwindet die Lücke unter der
Gesamtzeile: die klebt, die Leerzeile nicht.

`mrow()` kann eine Zeile weiterhin mit `opt.total` von der Summe abbringen. Zur Zeit tut das
keine — der Weg bleibt, weil er die Stelle ist, an der eine Zeile aus Ständen richtig würde.

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

Über den Karten steht eine einzige dünne Zeile mit den vier Zahlen des Monats — Einnahmen,
Flexible Payments, regelmäßige Kosten, noch offen. **Es sind die Zahlen der Zeilen, die
darunter stehen**, nicht die des ganzen Monats: wird gefiltert, rechnet die Leiste mit
(siehe „Was ein Filter mit den Summen macht"). Und klein **darüber** die Überschrift
„Auswertung" (`.analab`). **Ein Kontostand steht dort nicht:** den zeigt die Jahresansicht,
wo er neben den elf anderen Monaten steht und sich lesen lässt; hier stünde er allein und
ohne Vergleich. Was der Monat mit dem Konto macht, sagt der Zeitstrahl darunter, Zeile für
Zeile. Sie ist kein Kästchen in der Reihe: sie benennt die
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
(`js/calc.js`) aus der Fälligkeit der einzelnen Positionen — und zwar aus denen, die der
Filter übrig lässt (`sel`, siehe „Was ein Filter mit den Summen macht").

Die Tage stehen deshalb in der Beschriftung und nicht mehr als Leiste darunter: die Breite
gehört jetzt dem Betrag, nicht der Zeit. Fällt der heutige Tag in eine Zeile, trägt sie
eine rote Marke (`.tnow`).

**„Monatseröffnung" (`'P'`) ist kein Zeitraum, sondern ein Stand:** `carryIn(m)`, die
Summe der Monate davor in derselben Datei. Ein Kontoauszug ist das nicht — die Datei kennt
keinen Anfangsbestand, im Januar steht dort also nichts. In diesen Abschnitt wird nichts
fällig: er ist ein `span` statt eines Knopfes und kein Filter — grau hinterlegt ist er
deswegen nicht, er sieht aus wie jede andere Zeile. Einen Balken hat er sehr wohl: von der
Null bis zu seinem Wert, damit man sieht, wo der Monat anfängt. Daraus folgt, dass der
letzte laufende Wert `carryIn(m) + saldo(m)` ist — **dieselbe Zahl, die in der Jahresmatrix
und in der Prognose steht.** **Solange nicht gefiltert wird**: dieser Abschnitt filtert
nie mit (die Monate davor stehen nicht zur Auswahl), die vier darunter schon.

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

**Oben rechts steht die Sprachwahl** (`.wlangs`, `data-wlang`, verdrahtet in `wire()`): das
Einstellungsfenster gibt es erst im geladenen Buch, und ohne diesen Weg säße, wer ohne die
Startseite ankommt, auf der falschen Sprache fest. Geschrieben wird über `chooseLang()` in
`state.lang` des leeren Buches **und** in den localStorage — die Wahl gilt damit auch für die
Verkaufsseiten (siehe „Die Sprachwahl gilt überall"). Kein `save()`: es gibt noch nichts, das
schmutzig werden könnte; eine geladene Datei überstimmt die Wahl wie immer. Die Kürzel EN · DE
kommen aus `LANGS` und wechseln die Sprache nicht — wie im Kopf der Anleitung.

**Dieselben Pillen stehen in der Kopfzeile des geladenen Buches** (`#hdrLangs`, gefüllt und
verdrahtet in `renderChrome()`, nicht in `wire()`): `renderChrome()` läuft auch allein — nach
dem Sprachwechsel im Einstellungsfenster etwa —, und frisch gebaute Knöpfe ohne Handler wären
bis zum nächsten `render()` taub. Dort ruft der Klick zusätzlich `save()`: im Buch ist die
Sprache eine Einstellung der Datei.

**Sie hängt nicht am Inhalt der Datei, sondern daran, ob überhaupt eine gewählt wurde** —
deshalb steht sie in `ui` und nicht in `afterLoad()`, das nur den Inhalt auswertet. Ein
leeres Buch (`startEmpty`) ist keine Begrüßung mehr, obwohl `fileName` noch leer ist.

### Ein neues Buch weiß nichts

„Neu anfangen" heißt leer: **keine** Kategorien — weder Einnahmen noch Kosten noch Flexible
Payments —, **keine** Banken, **keine** Zahlungsarten. Der Nutzer richtet sich selbst ein,
und die Begrüßungsseite verspricht genau das (`wel.newSub`).

Früher zog `emptyState()` die vier Listen aus dem vorigen Buch mit und legte die
Einnahme-Kategorie `'EINNAHMEN'` dazu. Beides waren Angaben, die niemand gemacht hat: die
Ordnung eines fremden Jahres in einem Buch, das gerade erst anfängt — und eine Kategorie,
die man erst suchen und löschen muss, um die eigene anzulegen. Was bleibt, ist keine Angabe
über Geld: Sprache, Abrechnungsjahr und die Wahl, worin das Suchfeld sucht.

Daran hängen vier Stellen, und alle vier sagen dasselbe:

* **`emptyState()`** (`js/state.js`) — alle vier Listen leer.
* **`incomeGroups()`** (`js/calc.js`) — kein Rückfall auf `'EINNAHMEN'` mehr.
* **`migrate()`** — eine **fehlende** Liste bekommt `'EINNAHMEN'` (alte Datei, deren Posten
  darauf zeigen), eine **leere** bleibt leer. Sonst stünde die Kategorie nach dem ersten
  Speichern wieder da.
* **`#lSave`** im Einstellungsfenster — holt nur zurück, was ein Posten braucht (siehe
  „Einnahmen haben Kategorien wie die Kosten"). Ebenso `applySheet()` in `js/sheet.js`: eine
  Tabelle ohne Einnahmenblock ergibt keine Einnahme-Kategorie.

**Ein leeres Buch ist damit erst einmal eine Sackgasse — und das ist richtig so.** Wer „Neue
Einnahme" oder „Neuer Posten" drückt, findet im Fenster keine Kategorie zur Wahl; `#fSave`
weist das Speichern zurück und `item.needBlock` sagt, dass Kategorien in den Einstellungen
entstehen. Für die Kosten war das immer schon so — die Einnahmen folgen jetzt derselben
Regel. Aus demselben Grund trägt der Knopf „Neue Einnahme" der Monatsansicht `"1"` statt
`incomeGroups()[0]`, wenn die Liste leer ist.

Zwei Dinge hängen daran, beide in `renderChrome()`: Ansichts- und Monatsreiter sind auf der
Begrüßungsseite **verborgen** (es gibt nichts zu wählen), und **die Kopfzeile ist dort
leer** — auch Anleitung und Jahr erscheinen erst im geladenen Buch: die Anleitung gehört
zur Arbeit, und ein Jahr gibt es ohne Datei noch nicht. Öffnen und Anfangen bietet die
Seite selbst an. Im geladenen Buch fehlt umgekehrt „Daten hochladen": geladen wird auf der
Seite, gearbeitet in der Anwendung. Alles steht in einer Zeile, der Liste der Kennungen.

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

**Ein Druck, eine Wirkung.** Der Handler des Fensters hängt am *Dokument*, der des Filters am
*Fenster* — er läuft also danach, und das Fenster ist da schon aus dem DOM: eine Abfrage auf
`.modal` allein genügt nicht, sie ginge ins Leere und der Filter wäre nebenbei mit weg.
Deshalb **verbraucht das Fenster den Druck** (`preventDefault()` in `js/ui.js`), und der
Filter-Handler lässt `defaultPrevented` liegen. Bei zwei Fenstern übereinander schließt jedes
Escape genau eins; erst wenn keins mehr steht, nimmt der nächste Druck den Filter zurück.
Gefiltert nichts und kein Fenster offen, bleibt Escape unangetastet beim Browser.

**Drei Wege führen ins Feld**, alle drei als Handler unten in `js/app.js`:

* **Einfach lostippen.** Ein einzelnes Zeichen ohne Strg/Cmd/Alt hängt sich an `ui.q`, wenn
  gerade kein Feld den Fokus hat — in Monat und Jahr gibt es nichts anderes, wohin ein
  Buchstabe gehörte. Außen vor bleiben: ein offenes Fenster, die Begrüßungsseite, Ansichten
  ohne Suchfeld und das Leerzeichen bei leerem Feld (es filterte auf nichts und nähme dem
  Browser das Blättern).
* **Der Fokus von selbst**, wenn nach dem Zeichnen niemand sonst ihn hat (siehe `wire()`).

Einen eigenen Tastengriff ins Suchfeld gibt es **nicht mehr**: seit ein einzelner Buchstabe
dort von selbst landet, war Strg/Cmd+Umschalt+F der umständlichere von zwei Wegen. Die
Tastenkombination gehört jetzt dem vierten Reiter (siehe unten).

Sie ist ein eigener Bereich und sieht auch so aus: **grauer Grund und eine dunkle Kante
links**, wie die Karten darunter ihre Farbe tragen — nur ist ihre Farbe keine Geldart, sie
gehört zu allen dreien.

Weil die Zeile oben klebt, kostet jeder Umbruch dauerhaft Platz. Deshalb sitzt sie enger
als sonst (`.anabar .filterbar` in `css/layout.css`), und ihr Suchfeld gibt nach
(`.fltbox.flttop`, 230 px statt der `--leadw`-Breite der Jahresansicht): bis hinunter zu
etwa 1100 px bleibt alles in einer Zeile.

## Was ein Filter mit den Summen macht

**Jede Zahl der beiden Ansichten zählt, was zu sehen ist.** Die vier Kennzahlen der
Auswertung, der Zeitstrahl, Kartensumme und Kategoriezeile der Monatsansicht, Block-,
Kategorie- und Gesamtzeile der Jahresmatrix — alle rechnen über die übrig gebliebenen
Zeilen und nicht über den Zustand. Eine Karte, die drei von zwanzig Posten zeigt und
darüber die Summe aller zwanzig nennt, beantwortet eine Frage, die niemand gestellt hat:
wer filtert, will wissen, was das Gefundene zusammen ausmacht. Ohne Filter ist beides
dieselbe Zahl — dann steht überall wieder die volle Summe.

**Prognose und Fast Budget Details bleiben draußen** — dort wird nicht gefiltert, und
`income(m)`, `fixedCost(m)`, `kakeiboFor(m)` und `openCost(m)` stehen weiter für den ganzen
Monat.

Daraus folgt für beide Views eine feste Reihenfolge: **erst sammeln, was gezeigt wird, dann
summieren.**

* **`js/views/monat.js`** — `sumIt(arr)` über die Monatsbeträge; `incSum`, `flexSum`
  (über `kakVal`, nicht über `amounts`) und `outSum` entstehen aus `incUse`, `flexUse` und
  `outItems`, der flachen Liste der gezeigten Kosten. `groupHead()` summiert `items`, nicht
  `all` — `all` sagt nur noch, wie viele fehlen.
* **`js/views/jahr.js`** — `monSums(arr)` liefert die zwölf Monatssummen einer Liste. Die
  Blöcke füllen beim Bauen `incVis`, `kakVis` und `outVis`; die Gesamtspalte rechnet `mrow()`
  ohnehin aus den zwölf Werten.

**Die Auswertung bekommt die Auswahl als ein Stück.** `sel = {items, kaks, bal}` entsteht in
`viewMonat()` aus **denselben** Listen, aus denen die Zeilen gebaut werden, und geht an
`anaBar(m,sel)` → `timeline(m,sel)` → `monthFlow(m,sel)`. Deshalb können Leiste, Zeitstrahl
und Karten nicht auseinanderlaufen. Ohne `sel` rechnet `monthFlow()` wie bisher über den
ganzen Monat — dieser Weg bleibt, weil er der ist, den eine Ansicht ohne Filter nähme.

**`carryIn(m)` filtert nicht mit.** Die erste Zeile des Zeitstrahls ist der Stand, den der
Monat vorfindet, und den machen die Monate davor. Gefiltert steht dort also der echte
Anfang, und was darunter kommt, ist das, was die gezeigten Zeilen daraus machen; der letzte
laufende Wert ist dann **nicht** mehr `saldo(m)`.

Zwei Nebenwirkungen, die man kennen muss:

* **Die Sprechblase an „noch offen"** zählt „x von y" ebenfalls über die gezeigten Posten —
  sonst stünde dort „3 von 20", während darunter drei Zeilen sind. Dafür ist
  `unclearCount()` aus `js/calc.js` verschwunden: die Zahl steht nicht mehr im Zustand.
* **Der Zeitstrahl ist zugleich der Fälligkeitsfilter** (`data-tpart`). Wer eine Zeile
  anklickt, sieht danach nur noch ihre Bewegung, die übrigen vier liegen flach. Das ist
  gewollt — ein zweiter Klick nimmt es zurück —, aber es ist der einzige Filter, der seine
  eigene Bedienung mitfiltert.

**Die Gesamtzeile wird deshalb erst nach den Blöcken gebaut** und dann in den Kopf gehängt
(`matrixHead(totRow)`): sie ist die Summe der drei Blockzeilen samt Saldokorrektur, nicht
mehr `saldo(m)`. Ohne Filter ist das dieselbe Zahl; mit Filter wäre `saldo(m)` das Ergebnis
von Zeilen, die man gerade nicht sieht, und die Matrix ginge von oben nach unten nicht mehr
auf. Weggefiltert wird die Zeile weiterhin nie — sie gehört zum Gerüst.

Zuklappen ist **kein** Filter: eine zugeklappte Karte behält ihre volle Summe, und die
Blockzeile der Matrix zeigt ihre zwölf Summen wie zuvor. Ohnehin schließen beide einander
aus (siehe „Was das Klappen überschreibt").

Wer eine weitere Summe baut, rechnet sie aus derselben Liste, aus der die Zeilen entstehen —
nicht aus `state`.

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
* **Jahr** (`viewJahr`): `base()` lässt „Abgeschlossene ausblenden" fallen — mehr nimmt dort
  nichts weg.

**Ohne Suchbegriff ändert der Haken nichts** — er ist kein Schalter für „alles zeigen",
sondern gehört der Suche. Vorgabe ist aus.

In der Jahresansicht gilt der Filter für jede Zeile mit Inhalt, auch für die Saldokorrektur
und die drei Blockzeilen — sonst stünde nach einer Suche noch das halbe Gerüst da.
**Eine Ausnahme: „Gesamt je Monat" (`.balpin`) bleibt immer stehen.** Diese Zeile gehört zum
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

## Zugehörige Links

Eine Position und eine Flexible-Payments-Kategorie tragen eine **Liste** von Links —
Vertrag, Rechnung, Kundenkonto. Jeder Eintrag ist `{name,url}`; **höchstens zehn**
(`MAX_LINKS`).

**Ohne Namen wird kein Link angelegt.** Der Name ist das Einzige, was der Link später zeigt
— in der Liste, in der Auswahl und in der Sprechblase des Kettensymbols. Meistens merkt der
Nutzer davon nichts, weil `siteName()` ihn aus der Adresse holt; kommt dabei nichts heraus,
**umrandet sich das Namensfeld rot** (`input.bad` in `css/components.css`, gesetzt von
`mark()` in `editLink()`), sobald in der Adresse etwas steht. Der Rahmen ist der Hinweis,
nicht die Sperre: er zeigt beim Tippen, was fehlt, statt erst beim Klick auf „Übernehmen" zu
widersprechen — dort steht dann `link.nameEmpty`.

`linkLabel()` in `js/ui.js` fällt trotzdem weiter auf die Adresse zurück: **ältere Dateien**
können namenlose Links enthalten, und eine leere Zeile wäre schlimmer als eine lange
Adresse.

**Ältere Dateien haben statt der Liste ein Feld `url`.** `normLinks()` in `js/state.js`
zieht es als ersten Eintrag hinein und **löscht es**: ein Wert an zwei Stellen läuft früher
oder später auseinander. Dort steht auch `linkUrl()`, das ein fehlendes `https://` ergänzt —
ohne Schema hält der Browser eine Adresse für einen Pfad der eigenen Seite. Es wird an zwei
Stellen gebraucht: beim Laden alter Dateien und beim Eintippen im Fenster.

**Im Fenster steht kein Eingabefeld mehr, sondern eine Liste** (`linkRows()` /
`bindLinks()`, gebaut in `js/ui.js`, verwendet von `js/dialogs/item.js` und
`js/dialogs/kakeibo-betraege.js`). Je Zeile von links: der **Griff** ⋮⋮ zum Sortieren, der
**Stift** (öffnet das Webseitenänderungsfenster), das **Kreuz** (löschen) — und dann erst
der **Link als Text**. Der Link ist ein Link: ein Klick öffnet die Seite in einem neuen
Reiter, beim Überfahren nennt die Sprechblase die volle Adresse. Der Name allein wäre eine
Behauptung, die man nicht prüfen kann.

**Die drei Bedienelemente stehen vorn und auseinander** (14 px zwischen Griff und Stift,
10 px zwischen Stift und Kreuz, 18 px vor dem Link). Sie tun sehr verschiedene Dinge —
verschieben, ändern, löschen —, und eines davon ist nicht zurückzunehmen: dicht an dicht
träfe man beim schnellen Klicken das falsche. Stift und Kreuz sind dabei **gleich groß**
(13 px, Feld 20×20): sie stehen nebeneinander und sind gleich wichtig — der Stift trägt
außerhalb dieser Liste 17 px, das ist die Größe für eine Tabellenzeile.

**Die Liste sieht aus wie eine Tabelle:** ein Strich unter der Überschrift, einer unter
jeder Zeile — auch unter der letzten, auch wenn es nur eine gibt. Erst der Abschluss unten
macht aus den Zeilen einen Block; ohne ihn franst die Liste aus, und man weiß nicht, ob noch
etwas kommt. Ohne Links gibt es keinen einzigen Strich: dann steht dort nur die Überschrift
mit ihrem Plus. Das ergibt sich von selbst, weil `linkRows()` dann gar nichts liefert.
Im **Auswahlfenster** (`openLinkList()`) bleibt es beim alten Bild — dort schließt der Knopf
darunter ab, kein Strich (`.linklist:not(.edit)`).

**Sortiert wird durch Ziehen**, mit derselben Mechanik wie die Listen im
Einstellungsfenster (`.grip`, `.dragging`, `.over`; Vorbild in `js/dialogs/settings.js`).
Die Reihenfolge ist keine Kleinigkeit: **der erste Link ist der, den das Kettensymbol
öffnet**, wenn es nur einen gibt, und der, der in der Auswahl oben steht. Über der Liste steht „Associated links" und **direkt dahinter das Plus** — dieselbe
Bauart wie die Listen im Einstellungsfenster (`linkHead()` in `js/ui.js`, Vorbild
`listHead()` in `js/dialogs/settings.js`, dieselbe Klasse `.plusmini`). Am rechten Rand
suchte man es, und bei einer langen Liste stünde es weit weg von dem, was es ergänzt.

**Ohne Links steht darunter nichts.** Ein Satz „noch keine Links" sagte nur, was die leere
Fläche schon zeigt, und machte aus einer Zeile Überschrift drei Zeilen Fenster.

**Gelöscht wird nur nach Rückfrage.** Ein Link ist schnell angelegt, aber hinterher weiß
niemand mehr, welche Adresse dort stand.

Die Liste ist eine **Arbeitskopie**: geändert wird im Fenster, übernommen erst mit
„Speichern" — wie der Name und die Beträge. Wer abbricht, hinterlässt nichts.

**Das Webseitenänderungsfenster** (`editLink()` in `js/ui.js`) hat zwei Felder: oben der
Name, darunter die Adresse. Die Reihenfolge ist Absicht — man liest zuerst, *wofür* der Link
steht, und dann erst, wohin er zeigt. Enter übernimmt, Escape bricht ab. Ohne Adresse wird
nicht übernommen; ein Link, der nirgendwohin führt, ist kein Eintrag, sondern ein Fehler.

**Der Name füllt sich aus der Adresse** — `siteName()` in `js/format.js`: aus
`https://www.telekom.de/kundencenter` wird „Telekom". Den *Titel* der Seite könnte nur ein
Server holen; FINA hat keinen, und `fetch` scheidet unter `file://` ohnehin aus (Regel 4).
Genommen wird die Domäne ohne `www.` und ohne Länderkürzel, bei zusammengesetzten Endungen
(`bbc.co.uk`) eine Ebene weiter — sonst hieße die Seite „Co". Bis zu drei Buchstaben werden
groß geschrieben (ING, BBC, N26), Bindestriche trennen Wörter. Eine IP-Adresse bleibt, wie
sie ist; was gar keine Adresse ist, bekommt **keinen** Vorschlag — lieber nichts als
„Irgendein%20Text".

**Gefüllt wird nur, was niemand selbst geschrieben hat** (`auto` in `editLink()`): sobald im
Namensfeld getippt wurde, rührt die Adresse es nicht mehr an — auch nicht, wenn der Name
danach wieder geleert wird. Beim Ändern eines vorhandenen Links, der schon einen Namen hat,
gilt dasselbe von Anfang an. Wer eine Adresse einfügt und sofort Enter drückt, bekommt den
Namen trotzdem: `ok()` holt ihn nach.

**In den Ansichten bleibt es beim Kettensymbol** (`linkIcon()`): bei **keinem** Link ein
Strich `–` mit `data-lnnew`, bei **einem** ein gewöhnlicher `<a>`, bei **mehreren** ein Knopf
mit `data-links="item:<id>"` bzw. `kak:<name>`, der `openLinkList()` öffnet — ein Fenster, in dem alle Links stehen. Ein
Symbol je Link stünde bei zehn Links zehnmal vor dem Namen und nähme der
Bezeichnungsspalte der Jahresmatrix den Platz, den sie ohnehin knapp hat. Alle drei Formen
sehen gleich aus (`.linkicon` trägt deshalb `background:none;border:0`); welche es ist,
geht den Leser nichts an.

**In der Sprechblase des Symbols steht nur die Bezeichnung** — bei mehreren ihre Anzahl. Die
Adresse dahinter war eine zweite Zeile Kleingedrucktes über einem Symbol von 15 px; wer sie
sehen will, findet sie in der Statuszeile des Browsers. In der **Liste** des Fensters und in
der **Auswahl** steht sie weiterhin: dort ist der Name der sichtbare Text, und wer gleich
klickt, will wissen, wohin.

**Der Strich ist kein Platzhalter, sondern ein Weg.** Eine leere Zelle sagt nur, dass hier
nichts ist; der Strich sagt, dass hier etwas hinkönnte — und ein Klick darauf öffnet das
Fenster der Position und darin gleich das Webseitenänderungsfenster. Verdrahtet ist das in
`wire()`: es öffnet das Fenster und **drückt dessen Plus** (`[data-lnadd]`), statt den Weg
ein zweites Mal zu beschreiben. **Nur wo eine Position steht** — Summen- und Gruppenzeilen
bekommen keinen Strich, dort gäbe es nichts, dem ein Link gehören könnte; erkennbar am
fehlenden Schlüssel.

## Ein geschätzter Betrag wird nicht einfach abgehakt

Abhaken heißt „so war es". Bei einem geschätzten Betrag stimmt das gerade nicht — der Haken
machte aus einer Vermutung eine Tatsache, ohne dass jemand die Zahl angesehen hat.

Deshalb öffnet der Klick auf das Siegel dort **das Fenster der Position**, mit dem Betrag
genau dieses Monats fertig markiert und seine Zelle gelb umrandet (`.askcell`): erst die
Zahl richtigstellen, dann im Fenster abhaken, dann speichern. Wer abbricht, hat nichts
geändert und nichts abgehakt.

Gebaut ist das in `wire()` (`js/app.js`, `askFirst()`): `editItem(it,null,null,ui.month)`
bzw. `editKak(k,null,ui.month)` — der vierte bzw. dritte Parameter ist der Monat, dessen
Feld hervorgehoben wird. **Nur beim Setzen des Hakens.** Einen Haken wieder wegzunehmen
ändert keine Zahl und braucht keinen Umweg.

## Welcher Monat im Fenster hervorgehoben ist

Denselben Parameter bekommt der **Doppelklick auf einen Betrag** — in jeder Ansicht. Er
zeigt auf genau einen Monat, und im Fenster soll man wiederfinden, worauf man geklickt hat:

* **Der orange Rahmen kommt immer** (`.askcell`), ob der Monat abgehakt ist oder nicht. Er
  beantwortet die Frage „welcher Monat war das?", und die stellt sich bei einem gesperrten
  Feld genauso.
* **Markiert wird nur ein offenes Feld.** Ein gesperrtes lässt sich nicht ändern; die
  Schreibmarke darin sähe nach einem Angebot aus, das es nicht gibt.
* **Ein Doppelklick auf die Bezeichnung meint keinen Monat** — dann bleibt das Fenster
  unmarkiert, genau wie beim Stift, beim Sprung aus einer anderen Ansicht und bei jedem
  anderen Weg ins Fenster.

Woher der Monat kommt, entscheidet `dblMonth(cell)` in `wire()`: in der Jahresmatrix steht
er an der Zelle (`data-m`, gesetzt in `mrow()`), in der Monatsansicht ist es der gezeigte
Monat (`td.amt` → `ui.month`), in den Fast Budget Details nur bei einem einzelnen Monat —
über das ganze Jahr zeigt ein Betrag auf zwölf und damit auf keinen.

## Stift und Notizlampe der Monatsansicht

Zwischen Betrag und Bezeichnung stehen **drei** Symbole — Stift, Link, Notizlampe, in
derselben Reihenfolge wie die festen Spalten der Jahresmatrix —, und **alle Abstände sind
gleich: 12 px**. Die Symbole gehören zu keiner der beiden Angaben; wäre ein Abstand kleiner, sähe das Symbol wie
ein Anhängsel der näheren Angabe aus.

Gemacht wird das von den Innenabständen der Zellen (6 px links und rechts, also 12 px an
jeder Grenze) und einem gleich großen Abstand im Flex dazwischen (`.pencell .ptools` in
`css/ledger.css`). Die Spalte ist deshalb genau so breit wie ihr Inhalt:
3 × 20 + 2 × 12 + 12 Polster = **96 px** (`--penw`). **Wer an `--penw` dreht, verschiebt auch
die Breite des Suchfelds** (`--leadw`) und muss die Abstände hier nachrechnen.

**Der Stift ist so groß wie das Symbol der Lampe** (15 px): sie stehen nebeneinander und
sind gleich wichtig. Außerhalb dieser Spalte behält er seine 17 px — das ist die Größe für
eine Tabellenzeile ohne Nachbarn.



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
Vorzeichenfarbe über `.signed`, deshalb `bindSign(box)` in `openSettings()`. Der zweite Weg
dorthin ist der Doppelklick auf seine Zeile in der Prognose (siehe „Was sich in der Prognose
ändern lässt") — das Feld steht dann fertig markiert da.

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

**Seine Zeile ist violett — Beschriftung, Betrag und Balken.** Die Farbe ist `--ink-sal`
(`css/tokens.css`), das kräftige Gegenstück zur hellen Kante `--edge-sal`: die reicht für
einen Balken, aber nicht für ein Wort und nicht für eine Zahl. Der Betrag bekommt deshalb
**nicht** die Vorzeichenfarbe der Monate darunter — ein grünes „5.530,00" läse sich wie eine
Einnahme des Januars. Die drei gehören zusammen und sollen zusammen ins Auge fallen.

**Sein Betrag ist dabei blass** (`opacity:.42`, dieselbe Deckkraft wie die abgerechneten
Monate): er ist geschehen, bevor das Jahr anfing, und keine Bewegung, die noch aussteht. Die
Beschriftung bleibt kräftig — sie sagt, was die Zeile ist.

**Der laufende Monat trägt dagegen keine Fläche**, sondern zwei feine rote Linien über und
unter seiner Zeile und seinen Namen in Rot (`.progtable tr.now`). Das ist dieselbe Marke wie
in der Jahresmatrix, nur um 90° gedreht: dort fassen `.cm-l` / `.cm-r` die Spalte des
laufenden Monats ein. Rot heißt in der ganzen Anwendung „jetzt". Eine getönte Zeile legte
einen Balken quer über die Tabelle und stritte mit dem Violett darüber um dieselbe
Aufmerksamkeit.

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
  Abschließen (`isBalanceItem(it)`). Geöffnet wird es aus jeder Ansicht, in der ihr Betrag
  steht — auch aus der Spalte COR der Prognose (siehe „Was sich in der Prognose ändern
  lässt").
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

## Der Weg zu einer Liste steht über der Liste

Ein Fenster, in dem aus einer Liste gewählt wird, sagt auch, wo diese Liste gepflegt wird:
eine dünne Zeile **über** den Auswahllisten, ein Weg je Liste (`setLinks()` /
`bindSetLinks()` in `js/ui.js`, `.listlinks` in `css/components.css`, Text `item.listsIn`).

* **Posten-Fenster**: Kategorien (Bereich `groups`) · Banken · Zahlungsarten (beide
  `banks`). Zwei Wege in denselben Bereich sind kein Fehler: geklickt wird auf das, was
  gerade fehlt, nicht auf den Bereich, in dem es zufällig wohnt. Der Saldokorrektur fehlt
  die Kategorie, ihr fehlt auch der Weg.
* **Fenster der Flexible Payments**: deren **eigene** Kategorien (Bereich `kak`) — nicht die
  der regelmäßigen Kosten.

Vorher stand dort ein einzelner Sammellink (`item.lists`, `#fLists`) weit unten hinter der
Betragsart, und er **schloss das Fenster**. Beides ist weg.

**Das Einstellungsfenster legt sich darüber, ohne dieses zu schließen.** Gestapelt wird über
die Reihenfolge im Dokument — das jüngste `.modal` liegt oben und bekommt auch Escape
(`js/ui.js`); zu tun ist dafür nichts. Was im Fenster darunter getippt ist, bleibt stehen,
denn es war nie weg.

**Zurück kommt die Steuerung über `done`** — das zweite Argument von `openSettings()`. Es
läuft auf jedem Weg hinaus (Speichern, Abbrechen, Klick daneben, Escape), aber nur einmal,
und `reopen()` reicht es weiter: „+", Entfernen und Sortieren bauen das Fenster neu auf, und
ein Rückweg, der dabei verloren ginge, wäre der Rückweg für den häufigsten Fall überhaupt —
man kommt ja her, um etwas anzulegen.

Was die beiden Fenster damit tun:

* **`relist()` im Posten-Fenster** baut die drei Auswahllisten neu. **Gewählt bleibt, was
  gewählt war**; nur wenn es den Eintrag nicht mehr gibt, zählt der Posten selbst
  (`it.group`, `it.bank`, `it.pay`) — Umbenennen zieht ihn mit (`renameGroup`,
  `askCarryCodes`), und ein Fenster, das den alten Namen behielte, schriebe ihn beim
  Speichern zurück. Ein leeres Feld bleibt leer: „—" ist eine Wahl und keine Lücke.
* **`relist()` im Kategorie-Fenster** prüft den **Schlüssel**. Dort steht dieselbe Kategorie
  in der Liste, sie kann also umbenannt oder entfernt worden sein: `k` wäre dann veraltet und
  legte beim Speichern eine zweite an. Wiedergefunden wird sie über ihren Eintrag selbst
  (`Object.keys(state.kak).find(n=>state.kak[n]===e)`) — `renameKakCat()` verschiebt genau
  dieses Objekt. Ist er nirgends mehr, schließt das Fenster mit `kdlg.gone`.

**Ein Import nimmt alles mit.** `leaveTo()` entfernt **jedes** offene Fenster, nicht nur das
eigene: ein Posten-Fenster, das darunter stehen bliebe, schriebe seinen Stand danach in ein
Buch, das es so nicht mehr gibt.

Das Merkmal heißt `data-setlist` und **nicht** `data-lists`: jenes gehört den Ansichten und
wird in `wire()` bei jedem Zeichnen neu verdrahtet — es überschriebe den Rückweg.

## Das Einstellungsfenster

Links ein Menü, rechts der gewählte Bereich (`js/dialogs/settings.js`). Gebaut werden
**immer alle** Bereiche, umgeschaltet wird nur `hidden`. Das ist Absicht: `collect()` liest
die Felder aller Bereiche, und Getipptes überlebt so den Wechsel. Der gewählte Bereich
steht in `setPane` — einer Modulvariablen, nicht im Zustand: das Fenster baut sich bei
„+", Entfernen und Sortieren komplett neu auf, und ohne `setPane` landete man dabei jedes
Mal wieder ganz vorn. Ein neuer Bereich braucht drei Zeilen: einen Eintrag in `NAV`, einen
`pane(…)`-Aufruf und die Texte in `js/i18n.js`.

### Der Bereich „Import"

Beide Wege, die Zahlen von außen hereinholen, stehen hier — `#impFast` (Fast Budget,
einzelne Monate) und `#impSheet` (FINA-Tabelle, ein ganzes Jahr). In der **Kopfzeile** steht
dafür kein Knopf mehr: dort saß er zwischen „Daten hochladen" und „Daten speichern" und sah
aus wie ein dritter Weg, eine Datei zu öffnen. Er ist keiner — er ändert das Buch, das schon
offen ist.

**Beide schließen das Fenster, bevor sie öffnen** (`leaveTo()`). Ein Import legt selbst
Kategorien an; bliebe das Einstellungsfenster daneben stehen, schriebe sein „Speichern" die
Listen zurück, die vor dem Import darin standen, und der Import wäre wieder weg. Übernommen
wird dabei wie beim Wechsel der Sprache: `applyEdits()`, `tidy()`, `save()` — Getipptes geht
also nicht verloren.

## Eine FINA-Tabelle einlesen

Die Vorlage ist die Tabellenkalkulation, aus der FINA entstanden ist: eine Zeile je
Position, zwölf Monatsspalten, davor `URL` · `Deadline` · `B` · `Z` · `P` · `T` und die
Spalte mit den Bezeichnungen, über der das **Jahr** steht. Gelesen wird sie in
`js/sheet.js`, das Fenster steht in `js/dialogs/sheet-import.js`.

**Die Gliederung wird gerechnet, nicht geraten.** Ein CSV-Export kennt keine Einrückung, die
Ebenen stehen aber trotzdem darin — in den Summen:

* **Blockzeile:** trägt in der schmalen Spalte hinter jedem Monat ein `/`. Das sind die vier
  Summenzeilen der Tabelle (GESAMT, EINNAHMEN, FLEXIBLE PAYMENTS, REGULAR COSTS).
* **Kategoriezeile:** hat keine Kürzel, und ihre zwölf Werte sind **genau die Summe der
  Zeilen darunter** (`claim()`). Genommen wird die kürzeste Folge, die aufgeht — dadurch
  erkennt FINA auch eine Überschrift, vor der keine Leerzeile steht.
* Alles Übrige ist eine **Position**.

Geht die Summe nicht auf, greift ein Rückfall (`untilBlank()`: eine kürzellose Zeile nach
einer Leerzeile ist eine Überschrift bis zur nächsten Leerzeile). **Verborgen bleibt das
nicht:** das Fenster stellt je Block die Summenzeile der Tabelle neben das, was FINA gelesen
hat, und schreibt STIMMT oder WEICHT AB daneben. Weicht es ab, wurde eine Überschrift als
Position gelesen und die Zahlen stünden doppelt da.

**Welcher Block was ist, entscheidet der Nutzer** — geraten wird nur die Vorauswahl (die
Zeile, die alle anderen zusammenzählt, ist die Gesamtsumme und wird übergangen; danach der
Name, danach die Reihenfolge). Jede Änderung baut Schritt 1 neu auf, wie „+" im
Einstellungsfenster.

**Ein Buch wird ersetzt, nicht ergänzt.** `applySheet()` leert `fixed`, `groups`,
`incomeGroups`, `kakCats`, `kak`, `tx`, `flexActual`, `flexSource` — und die
**Saldokorrektur**: sie sagt, was in *diesen* zwölf Monaten aufgelaufen ist, und trüge sonst
unsichtbar die Korrekturen eines anderen Jahres in das eingelesene hinein. Der
**Anfangsbestand** bleibt: er ist eine Einstellung, steht an einer Stelle und ist dort in
einem Griff geändert. Wer hier etwas ergänzt, das dem Buch gehört, leert es mit.

Zwei Dinge folgen aus dem Datenmodell:

* **Die Flexible Payments kennen nur eine Ebene.** Die Tabelle gliedert sie zweistufig
  („KAKEIBO – PRIVAT" über „D-AILY"); zu `kakCats` werden deshalb die **untersten** Zeilen,
  denn dort stehen die Zahlen, die man vergleicht. Geschrieben wird nach `plan[]` mit
  `estimated=false` — nicht nach `flexActual`: eine Quelle in `flexSource[m]` überstimmt in
  `kakVal()` jeden Planwert und ließe zugleich den Reiter „Fast Budget Details" ohne eine
  einzige Buchung erscheinen.
* **Ein Kategoriename darf über Einnahmen und Kosten zusammen nur einmal vorkommen** (siehe
  „Einnahmen haben Kategorien wie die Kosten"). Zwei Überschriften desselben Namens werden
  deshalb auseinandergehalten (`(2)`), nicht zusammengelegt: zusammengelegt stimmte danach
  keine der beiden Summen mehr mit der Tabelle überein.

**Was kein Gegenstück hat, geht nicht stillschweigend verloren.** Die Spalte `P` (Zahlungen
im Jahr) wird nicht übernommen — die zwölf Monatsbeträge sagen dasselbe genauer, und das
Fenster sagt es vorher. Was in `Deadline` steht und kein Monat ist („Variabel", „mtl.
kündbar"), wird zur **Notiz** der Position. Kürzel, die die Listen nicht kennen, kommen als
`{code, label:code}` hinein; ohne das trüge der Posten im Fenster ein Fragezeichen.

**Abhaken ist eine Aussage über die Vergangenheit.** Der Haken „Abgeschlossene Monate
abhaken" setzt `paid[]` bis `completedMonths()` — in einem vergangenen Jahr also alle zwölf,
im laufenden bis zum Monat vor diesem. Gefragt wird **nach** dem Jahr: das Jahr entscheidet,
was „abgeschlossen" heißt.

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

`renderChrome()` ruft `renderGuide()` — die Funktion tut nichts mehr (siehe unten). Escape
schließt den Bereich nicht: das gehört den Fenstern.

**Die Anleitung hat ihre eigene Sprache.** `gLang` (Modulvariable, Vorgabe `'en'`) steht
neben `state.lang` und wird im Kopf des Bereichs umgeschaltet — zwei Kürzel EN · DE links
neben dem Kreuz (`.glangs`, `data-glang`, verdrahtet in `fillGuide()`). Wer die Oberfläche
auf Deutsch führt, darf die Anleitung auf Englisch lesen; **an `state.lang` ändert sich
nichts**, und in der Datei steht die Wahl auch nicht — sie lebt wie `guideW` nur in der
Sitzung. Die Kürzel kommen aus `LANGS` (`js/i18n.js`) und wechseln nicht mit der Sprache,
wie B · PT · DD · LP in der Jahresmatrix.

Gebaut wird der **ganze** Bereich in dieser Sprache — Überschrift, Reiter, Text. `t()` liest
`state.lang`, deshalb setzt `inGuideLang(build)` sie für die Dauer des Aufbaus auf `gLang`
und danach zurück. Dazwischen entsteht nur eine Zeichenkette; gezeichnet oder gespeichert
wird nichts. Wer dort etwas anbaut, das `t()` benutzt, baut es **innerhalb** dieses Aufrufs,
sonst spricht ein Teil des Kopfes die andere Sprache. Und weil die Anleitung damit an keiner
Angabe der Oberfläche mehr hängt, hat `renderGuide()` nichts mehr zu prüfen.

**Womit sie aufgeht, entscheidet `guideLangOnOpen()`** — aufgerufen in `openGuide()`, also
bei **jedem** Öffnen: mit geladener Datei setzt es `gLang` auf `state.lang`. Wer die
Oberfläche auf Deutsch führt, bekommt die Anleitung auf Deutsch, ohne sie umzuschalten; die
Kürzel im Kopf bleiben der Weg, beim Lesen eine andere Sprache zu wählen, und diese Wahl
gilt bis zum nächsten Öffnen. Auf der **Begrüßungsseite** bleibt es beim bisherigen Wert:
dort gibt es keine Einstellung, an der man sich ausrichten könnte — `state.lang` ist die
Vorgabe eines leeren Buches und keine Entscheidung des Nutzers.

**Die Anleitung geht auch über die ganze Seite.** Der Seitenbereich ist zum Nachschlagen
neben der Tabelle da. Wer die Anleitung wirklich liest, braucht die ganze Seite — dafür
steht im Kopf zwischen der Sprachwahl und dem Kreuz
`#gFull` (`EXPAND_SVG` aus `js/config.js`, Erklärung über `data-tip`). `openGuideTab()`
baut mit `guideDoc()` eine **vollständige Seite**, schreibt sie in einen neuen Reiter des
Browsers und schließt danach den Bereich: beides nebeneinander wäre dieselbe Anleitung
zweimal, einmal davon zu schmal.

Geschrieben wird mit `document.write` in ein `window.open('','_blank')` — es gibt keinen
Server, und `fetch` scheidet unter `file://` aus (Regel 4). Das `<base href>` der neuen
Seite zeigt auf die Anwendung, damit die Stylesheets und die Bilder aus `doc/img/` mit ihren
gewohnten relativen Pfaden gefunden werden; **eigene Gestaltung steht nicht im JavaScript**,
die Seite lädt `tokens.css`, `layout.css` und `components.css` und trägt `.guide.gpage`.
Hält der Browser den Reiter auf, bleibt der Bereich stehen und `toast()` sagt es — sonst
stünde der Nutzer ohne beides da.

**Die drei Teile stehen dort hintereinander**, jeder als `<section id="g-…">` mit seinem
`<h2>` — verbergen muss auf einer ganzen Seite niemand etwas. Oben führt trotzdem dieselbe
**Reiterzeile** hin wie im Seitenbereich (`.gnav`, gestaltet wie `.gtabs`): gleiches Bild,
gleiche Bedienung. Sie **klebt** (`position:sticky`), damit man von überall zum nächsten
Teil kommt, ohne zurückzurollen. Es sind Sprungmarken und keine Schalter — welchen Teil man
liest, sagt die Überschrift darunter, und ohne Skript ließe sich ein „gewählt" ohnehin nicht
führen. Damit kommt die Seite ohne eigenes Skript aus. Gebaut wird sie in `gLang`, nicht in
der Sprache der Oberfläche: `guideDoc()` steht ganz in `inGuideLang()`.

**Unten rechts steht in beiden Fassungen derselbe Knopf zurück nach oben** (`.gtop`). Auf
der ganzen Seite ist es ein **Anker** auf `#g-top` — die Seite hat kein Skript; im
Seitenbereich ein **Knopf**, der `.gbody` rollt, denn ein Anker rollte dort die Seite
dahinter und nicht den Text. Im Seitenbereich zeigt er sich erst ab 200 px Rollweg: ein
Knopf, der nichts täte, soll auch nicht dastehen.

**„Schritt für Schritt" ist kurz und bleibt kurz.** Acht Schritte, je zwei bis vier Sätze:
was einer braucht, um sein Buch zum Laufen zu bringen, und nichts darüber hinaus. Jede
Ausnahme, jede Nebenwirkung, jeder zweite Weg gehört in **„Was FINA kann"** — der Reiter
endet auch mit diesem Verweis. Wer hier etwas ergänzt, prüft zuerst, ob es wirklich zum
**Anfangen** gebraucht wird; sonst wächst der Reiter wieder auf die vierzehn Schritte
zurück, die niemand zu Ende gelesen hat.

**Der Ton: kurze Sätze, einfache Wörter, ein Gedanke je Absatz.** Die Anleitung liest jemand,
der zum ersten Mal ein Kassenbuch führt, und sie steht in einer schmalen Spalte. Ein Satz mit
drei Einschüben wird deshalb zu drei Sätzen; Gedankenstriche, die einen Nebensatz einschieben,
werden zu Punkten. Das gilt für **alle drei Reiter** und für **beide Sprachen** — wer einen
Absatz ergänzt, schreibt ihn in diesem Ton, sonst fällt er auf.

**Drei Reiter, drei Fragen.** `GUIDE` in `js/dialogs/guide.js` hat drei Zweige mit je einer
englischen und einer deutschen Fassung: `steps` führt einen Anfänger einmal von oben nach
unten durch das Anlegen des Buches und endet mit dem Monatsrhythmus; `product` beschreibt,
was die Anwendung kann; `news` ist die Versionsliste und steht als letzter. Gewählt wird
über `guideTab` (Modulvariable, nicht im Zustand) und `guideTo(tab)`. Ein weiterer Reiter
braucht einen Zweig in `GUIDE`, eine Zeile in `GUIDE_TABS` und einen Schlüssel in
`js/i18n.js`.

**Im Reiter „Was ist neu" steht je Punkt eine Zeile.** Nur die **größeren funktionalen**
Änderungen bekommen einen eigenen Punkt, und der sagt in einem Satz, was der Nutzer jetzt
tun kann — kein Warum, keine Begründung, keine Aufzählung von Einzelheiten. Alles Übrige —
Kosmetik, kleine Anpassungen, behobene Fehler — wird zu **einem** Punkt am Ende
zusammengefasst: „Bugfixing und kosmetische Anpassungen." Eine Versionsliste wird gelesen,
solange sie sich überfliegen lässt.

**Die Marke an der neuesten Fassung ist gelb** (`.guide .pill`, `--amber`): Schrift wie
Rahmen. Rot wäre eine Warnung, Grün eine Bestätigung — Gelb zieht den Blick, ohne etwas zu
behaupten.

**Der Reiter wächst nach oben:** die neueste Fassung zuoberst. Die Nummer ist
das Datum — `Jahr.Monat.Tag`, also `26.8.4` für den 4. August 2026, **dieselbe Form wie
`VERSION` in `js/config.js`**. Eine Zählung als vierte Stelle gab es bis August 2026
(`26.8.13.1`); sie ist weg, weil sie kein gültiges semver ergibt und electron-builder sie
zurückweist. Wo an einem Tag zweimal etwas fertig wurde, steht es seitdem unter einer
Nummer. **Erklärt wird das im Reiter nicht**: er fängt ohne Vorrede mit der ersten Version
an. Wie die Nummer zustande kommt, geht den Leser nichts an; er sieht nur, was neu ist. Eine
neue Version bekommt ein eigenes `<h4>` mit der Nummer, und das `<span class="pill">`
(„neu") wandert von der bisher obersten dorthin. Beschrieben wird grob und in der Sprache
des Nutzers — was er merkt, nicht was im Code steht. Der Hinweis auf die Bilder erscheint
nur über Reitern, die welche haben; die Versionsliste kommt ohne aus.

**Der Reiter muss die Nummer aus `js/config.js` nicht einholen.** Die Webseite läuft ihm
voraus (jeder Push), die Apps hinken ihm nach (nur auf Marke) — dass die oberste Überschrift
eine ältere Nummer trägt als `VERSION`, ist der Normalfall und kein Rückstand.

**Eine Version wird automatisch angelegt, sobald ein Stand fertig ist** — nicht erst auf
Zuruf. Was seit der obersten Fassung an größeren funktionalen Änderungen zusammengekommen
ist, bekommt seinen eigenen Punkt; das hält die Liste aktuell, ohne dass jemand eigens
danach fragen muss. Kurz bleibt sie trotzdem, weil nur die größeren Änderungen überhaupt
einen eigenen Punkt bekommen (siehe oben) — alles Kleinere sammelt sich in der einen Zeile
„Bugfixing und kosmetische Anpassungen" am Ende des Blocks, statt die Liste aufzublähen.
Ein neuer `<h4>`-Block entsteht dabei nur zu einem tatsächlichen Versionswechsel
(`VERSION` in `js/config.js`), nicht zu jedem einzelnen Commit dazwischen.

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

Dort fällt auch die **Vorauswahl der rechten Karte** in „Fast Budget Details": **keine** —
`ui.kakPick=null` heißt „größte Einzelposten" (`kak.top`), und genau damit geht der Reiter
auf. Eine vorgewählte Kategorie wäre die falsche Antwort: die erste der Liste steht dort,
weil sie zuerst angelegt wurde, und die teuerste sagt nur, was die linke Spalte ohnehin
zeigt. Wer den Reiter öffnet, will die einzelnen Buchungen sehen, die am meisten ausmachen.
Der Zeitraum ist das ganze Jahr (`ui.scope='jahr'`): hier wird verglichen.

Dort steht auch, **womit man begrüßt wird**: mit Datei der laufende Monat
(`ui.view='monat'`, `ui.month=CUR`), ohne Datei die Jahresansicht. Der Unterschied ist der
Zweck der beiden Ansichten — im Monat wird gearbeitet, im Jahr angelegt, und ein leerer
Monat zeigt nichts. Die Unterscheidung hängt an `fileName` aus `js/storage.js`: der Name
steht schon, bevor `afterLoad()` läuft, und ist beim Trennen wieder leer. `ui` selbst wird
nie gespeichert — die Wahl gehört zur Anzeige, nicht in die Datei.

Wer weitere Vorgaben ans Öffnen hängen will, hängt sie in `afterLoad()`.

## Ein Feld anklicken heißt: überschreiben

Beim Hineingehen in ein **einzeiliges** Eingabefeld steht sein Inhalt markiert da — tippen
ersetzt ihn, wer ihn behalten will, drückt eine Pfeiltaste. Bei zwölf Monatsbeträgen
hintereinander spart das je Feld ein Markieren. Der Handler steht unten in `js/app.js`.

Drei Dinge, die man dort nicht überliest:

* **`focus` steigt nicht auf** — der Handler hängt in der Einfangphase am Fenster.
* **Die Maus hebt die Markierung sofort wieder auf**, weil der Klick beim Loslassen die
  Schreibmarke setzt. Deshalb wird das folgende `mouseup` einmal abgefangen — aber nur,
  wenn der Fokus wirklich von der Maus kam (`byMouse`): wer mit dem Tabulator hineinspringt
  und danach in dasselbe Feld klickt, will die Schreibmarke setzen dürfen.
* **`textarea` bleibt außen vor.** Eine Notiz wird ergänzt, nicht ersetzt.

Wer danach selbst eine Auswahl setzt, behält das letzte Wort — das Suchfeld in `wire()` tut
genau das und bleibt deshalb beim Tippen am Ende stehen statt markiert.

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
Maß; die Funktion läuft am Ende von `wire()` und bei jedem Größenwechsel.
Eine neue mitlaufende Leiste braucht deshalb nur die Klasse. Weil gemessen und nicht
geraten wird, rücken die Kartenköpfe darunter von selbst nach, wenn die Auswertung
aufgeklappt wird.

Zwei Dinge gehören dazu: ein **deckender Hintergrund** und ein **Polster statt Rand** nach
unten. Ein Rand ist durchsichtig — dort schiene der Inhalt durch, der darunter wegscrollt.
Die Kennzahlen der Prognose stecken aus demselben Grund in einem Rahmen: `.kpi` braucht
ihre eigene Hintergrundfarbe für die 1px-Trennlinien und kann den Papiergrund nicht
zugleich tragen.

## Die Jahresmatrix ist eine eigene Fläche

**Sie rollt in beiden Richtungen selbst, und die Seite rollt in dieser Ansicht gar nicht.**
`.yearscroll` trägt `overflow:auto` und eine Höhe, die `sizeMatrix()` in `js/app.js` einmal
je Zeichnung setzt: alles, was unter der Knopfleiste bis zum Fensterrand bleibt. Was danach
noch übersteht — Statuszeile, Polster —, wird gemessen und abgezogen; `body.yearview`
nimmt dem Seitenende zusätzlich sein Polster (`css/layout.css`). Sieben Pixel Überstand
genügen, damit die ganze Fläche beim Rollen davonwandert.

Daran hängt alles Weitere: **Spaltenköpfe, Gesamtzeile und Blockzeilen bleiben mit
`position:sticky` stehen** — sticky richtet sich am nächsten Rollrahmen aus, und der ist
jetzt die Matrix selbst. Der Browser hält sie fest; es wird nichts gerechnet und nichts
nachgeschoben.

Vorher rollte die Seite senkrecht, und die Zeilen wurden bei jedem Scroll-Ereignis per
`translateY` nachgeschoben. Das lief dem Scrollen immer ein Bild hinterher — die Kopfzeile
schwamm sichtbar und blieb bei jeder verpassten Messung stehen. **Kein Maß der Welt macht
das ruhig; die Rechnung musste weg, nicht schneller werden.** Wer dort etwas anbaut, baut es
nicht in einen Scroll-Handler zurück.

Zwei Maße bleiben, beide nur beim Zeichnen: `--headH` und `--pinH`, die Höhen von
Spaltenkopf und Gesamtzeile. An ihnen kleben die Zeilen darunter (`css/matrix.css`).

**Die Gesamtzeile steht im `<thead>`**, nicht im Rumpf (`matrixHead(extra)` in
`js/views/jahr.js`). Sie gehört zum Gerüst wie die Spaltennamen — kein Filter nimmt sie weg
—, und im Kopf klebt sie über die ganze Tabelle: sticky hält nur innerhalb desselben
Elternteils, eine Zeile im Rumpf hörte am Ende ihres `tbody` auf.

**Die drei Blockzeilen decken sich zu, statt sich zu schieben.** Alle drei kleben an
derselben Höhe (`--headH` + `--pinH`), und die Stapelfolge entscheidet, welche man sieht:
Einnahmen 2, Flexible Payments 3, Regelmäßige Kosten 4 — der spätere Block deckt den
früheren zu, sichtbar ist immer die Zeile des Blocks, in dem man liest. Ein Hinausschieben
wäre das Naheliegende, geht aber nicht: **`position:sticky` an einer Tabellenzeile wird vom
`tbody` nicht begrenzt** (der umgebende Block einer Zeile ist die Tabelle, und
`position:relative` am `tbody` ändert daran nichts — geprüft). Daraus folgt eine Bedingung:
**die Hintergründe der Blockzeilen müssen deckend bleiben**, sonst schiene die verdeckte
Zeile durch. Sie sitzen an den Zellen (`.matrix tr.sec.r-* td`), nicht an der Zeile.

Geklebt wird an der **Zeile**, nicht an ihren Zellen: je Zelle ein eigener Klebepunkt risse
die Zeile beim seitlichen Rollen auseinander. Die festen Spalten links kleben zusätzlich
nach links — eine Zelle darf in beiden Richtungen kleben, die Kopfzellen tun genau das.

**Wer dort etwas verschiebt, denkt an die Stapelfolge.** Die Leiter steht oben in
`css/matrix.css`: gewöhnliche Zellen 0, feste Spalten links 1 (innerhalb ihrer Zeile),
Blockzeilen 2 · 3 · 4, Gesamtzeile 5, Spaltenköpfe 6/7. **Geprüft wird so etwas an der
Monatsspalte, nicht an der Bezeichnung:** links liegen die Köpfe ohnehin oben, verdeckt wird
nur rechts davon.

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

## Waagerecht scrollen: Jahresmatrix und Prognose

Zwei Tabellen sind breiter als das Fenster — die Jahresmatrix und die Prognose. Beide rollen
**frei wie jede andere Tabelle**: kein Einrasten, kein Nachrollen, keine Rechnung. Wer rollt,
bestimmt selbst, wo es stehen bleibt. (Es gab beides schon — `scroll-snap-type:x mandatory`
und danach ein sanftes Gleiten nach dem Rollen; beides ist wieder heraus. Wer es
zurückbauen will, weiß jetzt, dass es zweimal nicht überzeugt hat.)

**Der Rollbalken steht über der Tabelle, nicht darunter.** Von Haus aus sitzt er am unteren
Rand des Rollrahmens, also quer über der letzten Zeile. Deshalb verbergen beide Tabellen
ihren waagerechten und bekommen einen eigenen darüber: `scrollRail(id)` / `bindRails()` in
`js/ui.js`, `.scrollrail` in `css/layout.css` — ein Rollrahmen mit einem Streifen darin, der
so breit ist wie die Tabelle. In der Matrix steht er **in der Knopfleiste** (`#yearBar`), in
der Prognose in der Karte direkt über der Tabelle. Er wird ausdrücklich **gestaltet**, damit
er dauerhaft zu sehen ist: hier ist er der Weg zum Rollen und nicht dessen Anzeige. Passt
eine Tabelle ins Fenster, verschwindet er (`.off`).

Wie versteckt wird, ist je Tabelle verschieden — und das ist kein Zufall, sondern die
einzige Möglichkeit:

* **Die Prognose** rollt nur waagerecht und legt ihren Balken ganz ab
  (`scrollbar-width:none`, `::-webkit-scrollbar{display:none}`).
* **Die Jahresmatrix** rollt in beiden Richtungen und **braucht** ihren senkrechten. Je Achse
  lässt sich ein Balken nicht abschalten: `::-webkit-scrollbar:horizontal` befolgt Chrome
  nicht (geprüft), und `scrollbar-width` kennt keine Achse. Ihr waagerechter wird deshalb
  **abgeschnitten**: die Fläche steckt in `.yearpane` (`overflow:hidden`) und ist um genau
  die Höhe ihres Balkens höher als der Rahmen, der sie zeigt — `sizeMatrix()` misst und
  setzt beides.

  **`overflow-x:hidden` wäre der naheliegende Weg und ist der falsche.** Dann rollt der
  Browser nicht mehr selbst, und was man von Hand im Rad-Ereignis nachrechnet, verliert den
  Schwung: es ruckelt sichtbar, während dieselbe Tabelle in der Prognose weich läuft. Der
  Balken wird versteckt, das Rollen bleibt beim Browser.

  Gemessen wird die Balkenhöhe, nicht geraten — gestaltete Balken sind 11 px hoch,
  überlagernde (macOS) messen 0 und schweben trotzdem über der letzten Zeile, deshalb
  mindestens 14 px und nur, wenn es waagerecht überhaupt etwas zu rollen gibt.

Beide Richtungen der Leiste sind verdrahtet; nach einem Zug an ihr wird sie 180 ms lang
nicht nachgeführt, damit sie sich nicht selbst schiebt, und was sie gesetzt bekommt, gibt sie
nicht weiter (`<1`).

## Wie die Datei heißt

Chrome und Edge schreiben über die File System Access API in **dieselbe** Datei zurück
(`canFS` in `js/storage.js`); dort ist der Name keine Frage. Jeder andere Browser kann das
nicht und legt bei jedem Speichern eine neue Datei im Download-Ordner ab — und zwei Dateien
desselben Namens werden dort zu „fina (1).json", „fina (2).json": eine Reihe, der man nicht
ansieht, welche die neueste ist.

**„Sicherung speichern" geht denselben Weg — in jedem Browser.** Der Knopf steht zwischen
„Daten speichern" und „Daten schließen" (`#btnBackup` → `saveBackup()`) und legt eine
datierte Kopie in den Download-Ordner, auch in Chrome und Edge, die sonst in dieselbe Datei
zurückschreiben und deshalb nie einen zweiten Stand hinterlassen. **Der dirty-Zustand bleibt
dabei, wie er ist:** eine Sicherung ist kein Speichern, die Datei, in der gearbeitet wird,
hat die Änderung danach immer noch nicht. Die Meldung sagt beides.

**Deshalb trägt die heruntergeladene Kopie einen Zeitstempel vorn**, gebaut in
`downloadName()`: `YYMMDD-HHMM ` vor dem ursprünglichen Namen. Die Stände stehen damit im
Ordner von selbst in der richtigen Reihenfolge, und der Name der Datei bleibt hinten
erhalten. Ein **vorhandener** Stempel wird ersetzt, nicht gestapelt (`STAMP_RE`) — sonst
hieße die Datei nach dem zweiten Mal „260808-2100 260808-2045 fina.json".

**Auf die Minute, nicht auf die Sekunde.** Der Stempel sortiert und soll sich lesen lassen;
zwei Sicherungen in derselben Minute sind der seltene Fall, und dann hängt der Browser von
sich aus „ (1)" an. `STAMP_RE` erkennt deshalb **beide** Formen (`\d{4}(\d{2})?`): aus einer
Datei mit dem alten Stempel bliebe sonst ein „00" mitten im Namen stehen. Ein Name, der
selbst mit Ziffern anfängt („2026 Kasse.json"), wird nicht getroffen — dafür steht der
Bindestrich an fester Stelle.

Die Meldung nennt den Namen (`store.downloaded`): er ist nicht der, unter dem die Datei
geöffnet wurde, und man soll ihn im Download-Ordner wiederfinden.

## Nach jeder Änderung neu zeichnen

`render()` baut die Ansicht komplett neu auf und ruft danach `wire()`. Wer den Zustand
ändert, ruft `save()` (setzt nur das dirty-Flag) und dann `render()`. Geschrieben wird die
Datei ausschließlich über „Daten speichern".

## Die Anleitung wird nicht bei jeder Änderung mitgeschrieben

Das gilt für **„Schritt für Schritt"** und **„Was FINA kann"** — nicht mehr für **„Was ist
neu"**, siehe dort. Neue Funktionen kommen **nicht** sofort in diese beiden Reiter. Wer eine
baut, schreibt sie stattdessen in `doc/GUIDE-TODO.md` — mit einem ⚠, wenn ein vorhandener
Absatz dadurch falsch geworden ist. Nachgezogen werden die beiden Reiter dann in einem Zug,
wenn der Nutzer es verlangt; danach wird die Liste geleert. Die Bilder bleiben dabei, wie
sie sind — neue werden nur auf ausdrückliche Bitte gemacht.
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

**Ein Import hat eine Probe, die etwas beweist:** die Summenzeile der Tabelle gegen
`saldo(m)`, Monat für Monat. Stimmen alle zwölf, ist die Gliederung richtig gelesen und
nichts doppelt gezählt — das ist die eine Prüfung, die sich nicht durch Hinsehen ersetzen
lässt. Geprüft wird sie über ein Buch, das schon voll ist (die Kategorien müssen ganz
verschwinden), und danach über Speichern und erneutes Laden.

**Die App hat ihre eigene Liste** — vierzehn Punkte in `desktop/README.md`, darunter die
drei, die nur dort schiefgehen können: schreibt „Daten speichern" wirklich in dieselbe
Datei zurück, kommt die Rückfrage beim Schließen (und lässt sich beides, abbrechen *und*
schließen), und sehen die Schriften **ohne Netzverbindung** richtig aus.

**Ohne Fenster prüfen geht auch, und oft genauer.** Die gebaute App lässt sich mit
`--remote-debugging-port=…` starten und über das DevTools-Protokoll ausfragen — Maße,
berechnete Stile, `window.FINA_NATIVE`, geladene Schriftschnitte. Ein Bildschirmfoto sagt
darüber weniger. **In VS Code muss dafür `ELECTRON_RUN_AS_NODE` weg** (`env -u
ELECTRON_RUN_AS_NODE …`), sonst läuft jede Electron-Binary als reines Node und `main.js`
bricht mit `Cannot read properties of undefined (reading 'requestSingleInstanceLock')` ab.

Nach jeder Textänderung prüfen, ob jeder benutzte Schlüssel im Wörterbuch steht:

```sh
grep -rho "t('[a-z][a-zA-Z.]*'" js | sort -u   # benutzt
grep -o "^'[a-zA-Z.]*'" js/i18n.js | sort -u   # vorhanden
```
