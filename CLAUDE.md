# FINA — Orientierung für Änderungen

Jahres- und Monatskassenbuch im Browser. Statische Dateien, keine Frameworks, kein Build,
kein Server. Alle Inhalte kommen aus einer JSON-Datei, die der Nutzer hochlädt — **im Code
stehen keine Beträge, Banken, Kategorien oder sonstigen Daten**.

**Es gibt FINA dreimal, aus denselben Dateien:** als Webseite auf GitHub Pages, als
Mac-App und als Windows-App. Der Rahmen für die beiden Apps steht in `desktop/`
(Electron); die Anwendung selbst weiß davon nur eins — `window.FINA_NATIVE`. Siehe
„Die drei Fassungen" weiter unten und `desktop/README.md`.

**Drei Bereiche, ein Posten-Modell** (seit 6.9.26): **Einnahmen · Flexibel · Regulär**
(`g.in` · `g.flex` · `g.fixed`; englisch Income · Flexible · Regular). Jeder Posten steht
in `state.fixed`, seine Kategorie (`it.group`) sagt über die Liste, in der sie steht, zu
welchem Bereich er gehört — `incomeGroups`, `flexGroups`, `groups`, gelesen über
`isIncome()` · `isFlex()` · `isCost()` in `js/calc.js`. Der Bereich, der früher **Kakeibo**
und dann **Flexible Payments** hieß, hat kein eigenes Modell mehr: `kak`, `kakCats`,
`plan`, `flexActual` und `tx` sind aus der Datei heraus (`migrateKak()` in `js/state.js`
zieht sie beim Öffnen in Posten), das Beträge-Fenster ist weg. Geblieben sind nur Namen:
`ui.view='kakeibo'` und `js/views/kakeibo.js` (der Reiter „Import Details", er liest die
Quellzeilen der flexiblen Posten über `flexTx()`), dazu `state.flexSource` als Etikett am
Kartenkopf. Wie die Datei innen aussieht, steht je Fassung in
`FINA Strukturen und Objekte/` (benannt nach dem Tag; `v260906` ist der aktuelle Stand).

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
| Summen, Salden, „Monat erledigt", die drei Bereiche (`isIncome/isFlex/isCost`), Quellzeilen als Buchungen (`flexTx`), mittlerer Verbrauch | `js/calc.js` |
| Datei laden/speichern, dirty-Zustand, Statuszeile | `js/storage.js` |
| CSV-Import — Wizard, Anleitung daneben, Struktur- und Kriterien-Fenster | `js/dialogs/csv2-wizard.js` |
| Die Struktur der JSON-Datei, je Fassung eine Datei nach dem Tag | `FINA Strukturen und Objekte/` |
| Notizlampe, Tooltip, Kurzmeldung, Fenster schließen, Entwürfe, Vorzeichenfarbe — **und die Bewegung**: Geister, Fenster-Übergänge, Klappen, Menüs (siehe „Bewegung") | `js/ui.js` |
| Inhalt einer Ansicht | `js/views/jahr·monat·prognose·kakeibo.js` |
| Begrüßungsseite (ohne Datei) | `js/views/willkommen.js` |
| Inhalt eines Fensters | `js/dialogs/item·settings.js` (Posten, Einstellungen); die Fenster des Imports in `csv2-wizard.js` |
| Die Umfrage — Knopf, Fenster, Absenden | `js/dialogs/umfrage.js` |
| Text der Anleitung und der Bereich rechts | `js/dialogs/guide.js` |
| Bildschirmfotos für README und Anleitung | `doc/make-shots.py` → `doc/img/` |
| Was der Anleitung noch fehlt (Merkzettel) | `doc/GUIDE-TODO.md` |
| Was beim Klick passiert; Start der Anwendung | `js/app.js` |
| Fenster, Menü, fremde Links der Mac-/Windows-App | `desktop/main.js` |
| Wie die Apps gebaut und veröffentlicht werden | `desktop/README.md` |
| Die Startseite — Verkauf, Pilotphase, Apps, Sprachweiche | `index.html`, `css/landing.css` |
| Die Guide-Seite (Kurzübersicht fürs Netz) | `guide.html` |
| Alle Funktionen im Einzelnen (Verkaufsseite) | `features.html` |
| Der Vergleich mit dem, was es sonst gibt | `compare.html` |
| Die Datenschutzerklärung | `datenschutz.html` |
| Sprache, Sprungmenü, Ausschnitt, Bewegung **dieser fünf Seiten** | `js/landing.js` |
| Der Web-Client — die Anwendung selbst | `fina-online.html` (lädt `js/` und `css/`); `Webclient.html` ist seit 5.9.26 nur noch der Stub, der alte Lesezeichen dorthin weiterleitet |
| Welche Fassung die Apps als aktuell melden | `version.json` |
| Das Symbol — Reiter der Seite **und** App-Icon | `desktop/build/icon.html` → `icon.png` |

## Das Mac-Chrome (Redesign 22.8.26)

Die Oberfläche trägt seit dem 22.8.26 das Mac-Gewand aus
`_BusinessCenter/260822 ReDesign FINA - Mac Style` (Referenz `FINA Mac Redesign.dc.html`,
maßgeblich die Turns 5a/5b · 4a/4b/4c · 3a/3b/3c · 2c; das dortige README ist der
Auftrag). Farbpalette und Schriften sind unverändert — neu sind nur die Chrome-Töne
`--chrome-hi` · `--chrome` · `--hairline` und die Verläufe/Schatten `--grad-bar` ·
`--grad-btn` · `--sh-btn/-card/-pop/-modal` in `css/tokens.css`. **Wo ein älterer Absatz
dieser Datei noch das alte Chrome beschreibt** — Knopfreihe in der Kopfzeile, Filter als
Knopfreihen, Anlege-Knöpfe in den Ansichten, violettes „Gesamt je Monat" —, **gilt dieser
Abschnitt.**

* **Die Kopfzeile ist eine Toolbar:** links das Wortzeichen mit dem Jahr, in der Mitte die
  Ansichten als Segmented Control (`#views`, weiterhin von `renderChrome()` gefüllt),
  rechts der ☰-Knopf (`#btnMenu`, Klasse `.burger`) und davor bis zu zwei Knöpfe, die
  aus dem Menü heraustreten (siehe „Zwei Knöpfe treten aus dem Menü heraus") — der
  Dateiname steht seit
  22.8.26 **nur noch im Menü** (`#menuFile` zuoberst; `.filepath` bleibt im HTML, ist
  aber per CSS verborgen). **Alle Aktionsknöpfe
  wohnen im Menü dahinter** (`#hdrTools`, auf jeder Breite), seit dem Abend des 8.9.26 in
  dieser Ordnung und mit diesen Linien (`.mi-sep`): „Lokale Datenbank öffnen (JSON-Datei)" ·
  „Daten importieren (CSV-Datei)" (`#btnImportCsv` → `openCsvWizard()`; **die Dateiart steht
  bei beiden in Klammern dahinter**, in jeder Sprache so geschrieben, wie man sie dort
  schreibt) ‖ Neuer Eintrag ‖ Speichern · Sicherung ‖ Schließen ‖ Einstellungen ‖ Anleitung
  (**orange Schrift auf hellem Grund**, `.btn.guidebtn`; vom 6.9.26 bis 9.9.26 umgekehrt
  als orange Fläche mit weißer Schrift — im Menü tragen Einträge ihre Farbe als Text, wie
  „Neuer Eintrag" daneben, und dass die Anleitung gerade steht, sagt der getönte Grund).
  **Öffnen und Importieren stehen ohne Linie beieinander** (Lex, 8.9.26): beide holen Zahlen
  herein, das eine die ganze lokale Datenbank, das andere eine CSV-Spalte. **„Neuer Eintrag"
  (`#mNewOut`) steht dazwischen und dem Speichern** — allein zwischen zwei Linien, in der
  Reihenfolge, in der man arbeitet; er trug vom 6. bis zum 8.9.26 Tinte mit weißer Schrift
  und ist seitdem ein Eintrag wie jeder andere: eine schwarze Fläche in einem Menü aus acht
  Wegen liest sich als Anweisung. Sein Plus im Kreis bleibt (`.tools .mi-new::before`). **Der Menükopf hat zwei Zeilen** (`renderStatus()` in
  `js/storage.js`, `.menufile`): oben der Dateiname in Tinte und in **einer** Zeile — das
  Menü wird so breit, wie der Name es braucht (`.tools{min-width:230px;width:max-content}`,
  begrenzt auf das Fenster, Rest mit „…") —, darunter der Stand: rot „ungespeicherte
  Änderungen" oder grau „alles gespeichert"; die Linie darunter ist dieselbe wie zwischen
  den Gruppen.
  **„Daten hochladen" steht zuoberst und mit dem CSV-Import zusammen** (seit 30.8.26; bis
  dahin war `#btnLoad` im geladenen Buch verborgen, geladen wurde ausschließlich auf der
  Begrüßungsseite). Beide holen etwas herein, und das ist der erste Griff, den man sucht;
  die ganze Datei steht vor einzelnen Spalten. Weil damit auch ein Buch mit
  ungespeicherter Arbeit getroffen werden kann, fragt `loadData()` (`js/storage.js`)
  vorher — dieselbe Rückfrage wie beim Schließen (`store.loadAsk`). Auf dem Telefon fehlt
  der CSV-Import (`css/mobile.css`).
  **Zum Anlegen gibt es einen Weg** (seit 6.9.26; bis dahin zwei, davor drei): „Neuer
  Eintrag" geht ohne Vorauswahl auf (`editItem(null,'1')`), und dort stehen Einnahmen,
  flexible und reguläre Posten in **einer** Auswahlliste mit drei Gruppen (`groupOpts()`
  in `js/dialogs/item.js`) — die Kategorie entscheidet über den Bereich, nicht der Weg ins
  Fenster.
  **Jeder Eintrag trägt vorn sein Zeichen**, und zwar als **Maske** aus `css/layout.css`
  (`.tools .btn::before`, `mask-image` mit einem SVG als Daten-URI): `renderChrome()`
  schreibt die Beschriftung über `textContent`, ein Kind-Element überlebte das nicht. Die
  Maske nimmt `currentColor` an — Tinte, auf den beiden gefüllten Einträgen Weiß. **Farbige
  Zeichen gibt es nicht mehr**: die beiden „Neu…"-Einträge trugen bis 23.8.26 ein gefülltes Plus in
  der Farbe ihrer Geldart, und in einer Liste aus neun Wegen sagte diese Farbe nichts — sie
  machte das Menü nur bunt. Öffnen/Schließen läuft über die alte Mobil-Mechanik
  (Klasse `open`); der rote Punkt `#dirtyDot` und der Menükopf-Dateiname `#menuFile`
  (**immer** zuoberst im Menü, seit 22.8.26 auch bei breitem Fenster) werden in
  `renderStatus()` (`js/storage.js`) nachgeführt.
* **Zwei Knöpfe treten aus dem Menü heraus** (seit 30.8.26): **„Daten speichern"**,
  sobald es etwas zu speichern gibt (`dirty`), und der **Umfrage-Knopf**, solange eine
  Umfrage offen ist. Draußen ist die Reihenfolge fest — **Umfrage · Speichern · ☰**; die
  Umfrage steht immer als äußerste links und soll nicht springen, wenn „Speichern"
  dazwischen auftaucht. Speichern trägt draußen den **roten Rahmen** des Siegels
  (`.btn.savebtn`, ein Rahmen und keine Füllung: der Knopf ist der Weg heraus, keine
  Warnung), die Umfrage ihren **leuchtenden Ring** (`.btn.srvbtn`, ein weicher
  `box-shadow` in der eigenen Farbe — nötig geworden, seit der rote Rahmen danebensteht).
  **Verschoben wird der Knopf selbst**, nicht eine zweite Kopie: er steht einmal im HTML
  und wandert zwischen `.hdrright` und `#hdrTools`; zwei Knöpfe für dieselbe Sache
  bräuchten zwei Verdrahtungen und liefen auseinander. Im Menü ist die Umfrage ein
  Eintrag wie jeder andere — `css/layout.css` nimmt ihr dort die Füllung — und steht
  zuoberst, so wie sie draußen als erste stünde.
  **Gemessen, nicht geraten:** `fitHeaderBtns()` in `js/app.js` zählt die natürlichen
  Breiten der Knöpfe (dafür `.hdrright>.btn{flex:0 0 auto}`) und hält sie gegen die
  Breite, die die Flexbox der rechten Seite zuteilt (`flex:1 1 0` — sie hängt am Fenster
  und nicht am Inhalt). Passt es nicht, geht **zuerst die Umfrage** zurück ins Menü, dann
  „Speichern": die eigene ungespeicherte Arbeit ist das dringendere. Gezählt wird nur, was
  in der Reihe steht — `#hdrTools` ist ein absolut gesetztes Kind derselben Leiste und
  wäre offen 230 px breit. Auf dem Telefon tritt nichts heraus (`.tools #btnSave` ist dort
  ausgeblendet, und `surveyOpen()` sagt dort ohnehin nein).
  **Der rote Punkt am Hamburger sagt seitdem „hier drin wartet etwas"**: Ungespeichertes
  oder eine Umfrage, aber nur, solange der zugehörige Knopf nicht ohnehin daneben steht.
  Bis 30.8.26 hing er allein am dirty-Flag. Gesetzt wird er in `fitHeaderBtns()` und nicht
  mehr in `renderStatus()` — nur wer die Knöpfe gerade verteilt hat, weiß, was im Menü
  steckt; `renderStatus()` ruft die Funktion dafür am Ende auf.
* **Die Sprechblasen des Menüs stehen seitlich.** `data-ttip` setzt seit 30.8.26 kein
  `title` mehr, sondern `data-tip` — die eigene Sprechblase (`renderChrome()`). Und weil
  `#hdrTools` das Merkmal `data-tipside` trägt, stellt `showTip()` (`js/ui.js`) sie dort
  **neben** den Eintrag statt darüber oder darunter: über und unter einem Menüeintrag
  stehen die Nachbareinträge, und die Blase deckte genau das zu, wozwischen man wählt.
  Gesucht wird zuerst rechts, dann links; das Menü klebt am rechten Rand, in der Praxis
  steht sie also links. Wer ein weiteres Menü baut, setzt `data-tipside` daran — überall
  sonst bleibt es bei über/unter (siehe den Kommentar in `showTip()`).
  **Jede Sprechblase kommt erst nach einer halben Sekunde** (seit 6.9.26: `TIP_DELAY` in
  `js/config.js`, `tipLater()` in `js/ui.js`, für Maus und Fokus gleichermaßen) und ist
  **weiß auf Tinte** (`.tip`). Wer nur vorbeifährt, sieht keine.
* **Die Monatsleiste steht unter der Filterzeile** (seit 22.8.26), nicht mehr an der
  Kopfzeile: dort, wo die Jahresmatrix ihre Monate hat, und im selben Bild — weiße Karte
  mit Radius 8 und derselben Schrift wie der Spaltenkopf der Matrix (9.5 px
  Mono-Versalien). Sie zeigt erledigte Monate grün durchgestrichen und den gewählten als
  **schwarze** Pille (`.mtab .mp`; seit 23.8.26 — vorher nur eine dunkle Einfassung).
  **Der laufende Monat trägt immer einen roten Ring** (seit 23.8.26; vorher eine gefüllte
  rote Pille, die auch gefüllt blieb, wenn ein anderer Monat gewählt war): ungewählt
  bleibt er ungefüllt auf dem Grund der Leiste — nur der ovale Rahmen ist rot statt
  schwarz —, gewählt füllt er sich **orange** (`--accent`), und der Ring bleibt rot. Die
  Statuspunkte sind weg, die Zählung steht
  in der Sprechblase. Der Monatskopf der Jahresmatrix (`.mhead.now`) behält seine
  gefüllte rote Pille — dort gibt es keine Auswahl, die dem Rot widersprechen könnte.
  Gebaut wird sie in `monthTabs()` (`js/views/monat.js`) und steckt in einer `.stickybar`
  der Ansicht — am Schreibtisch seit 8.9.26 in der **zweiten** (`.anasub` in `anaBar()`,
  zusammen mit der Auswertung), auf dem Telefon in `mobileTop()`; sie klebt also unter
  der Filterzeile und fährt beim Ansichtswechsel mit (siehe „Bewegung"). Verdrahtet ist sie über `data-mtab`
  (Regel 1) — **nicht** `data-m`, das gehört den Monatszellen der Jahresmatrix
  (`dblMonth`). `renderChrome()` rührt sie nicht mehr an, `#months` ist aus
  `fina-online.html` verschwunden; die Kopfzeile ist damit in jeder Ansicht gleich hoch.
* **Die Filterzeile ist eine Bahn über die ganze Seite** — in **beiden** Ansichten
  dasselbe Bild: ein flacher Streifen von Rand zu Rand auf `--paper-2` mit einer Haarlinie
  darunter, kein eingefasster Kasten mehr (bis 22.8.26 grauer Grund, Radius 7, Rahmen
  ringsum). **Sie dockt oben an der Kopfzeile an, ohne Abstand** — sie ist in beiden
  Ansichten das erste, was unter den Reitern kommt (`.stickybar.anabar{padding-top:0}`,
  `.yearbar{padding:0 0 10px}`). Eine obere Haarlinie trägt sie deshalb nicht: die
  Kopfzeile bringt ihre eigene mit. **Und sie ist genau so hoch wie diese Kopfzeile** —
  `min-height:var(--barh)`. Das Maß steht in keinem Stylesheet: `syncStickyTops()` misst
  die Kopfzeile ohnehin für das `top` der klebenden Leisten und schreibt dasselbe Maß als
  `--barh` ans Wurzelelement. `min-height` und keine Höhe: bricht die Zeile im schmalen
  Fenster um, wächst sie darüber hinaus. Die negativen Außenmaße heben das Polster von `.wrap` auf,
  wie in der Kopfzeile; wie breit das Polster ist, steht als `--pagepad` an `.wrap`
  (24 px, auf dem Telefon 12 px) und **nur dort**. Die Regeln stehen an einer Stelle
  (`.anabar .filterbar,.yearbar .ybrow` in `css/layout.css`).
* **Ein gedrückter Knopf trägt Tinte, immer.** Bis 22.8.26 hing der dunkle Grund an `.on`,
  also daran, dass die Zeile ohnehin orange leuchtet — die beiden Ausblenden-Knöpfe der
  Jahresansicht leuchten sie aber ausdrücklich nicht an und sagten damit nur zufällig,
  dass sie gelten. Der `:hover`-Zwilling der Regel ist kein Zierrat: `.on .btn:hover` ist
  um eine Klasse spezifischer.
* **Die Filterzeile der Monatsansicht:** Suchfeld (weißer Kasten mit Lupe, `filterField()`
  ohne ☰) · ✕ · „Filteroptionen…" (`fltOptionsBtn()` in `js/ui.js`, öffnet seit 23.8.26
  die **Einstellungen im Bereich „Filter"** — `openSettings('filter')` in `wire()`; das
  eigene Fenster `js/dialogs/filter-fields.js` ist weg) · drei Aufklappmenüs
  Bereich/Fälligkeit/Zahlungsstatus
  (`fltDrop()` in `js/views/monat.js`; seit 6.9.26 stehen dieselben drei in der
  Jahresleiste). Ob ein Menü offen ist, sagt `ui.fltMenu`
  (Sitzung, nie Datei); **es geht bei jeder Wahl zu** (Lex, 8.9.26; seit 23.8.26 tat es
  das nur bei „Alle", davor gar nicht — `mShut()` in `wire()`): jedes dieser Menüs stellt
  **eine** Frage, und ist sie beantwortet, gibt es darin nichts mehr einzustellen.
  **Was gewählt ist, steht am Knopf** — `fltDrop()` schreibt „Fälligkeit: Monatsende"
  hinein —, man sieht es also auch bei geschlossenem Menü. **Der
  gewählte „Alle"-Eintrag trägt Tinte statt Orange** (`.mi.sel[data-…="alle"]` in
  `css/layout.css`, gilt auch im mobilen Menü): Orange heißt „hier wird ausgeblendet",
  und genau das tut „Alle" nicht. Die Einträge tragen die
  gewohnten `data-filter`/`data-duefilter`/`data-secfilter`, nur der Knopf trägt
  `data-fltmenu` (verdrahtet in `wire()`). Zu geht es auch am Knopf, mit Escape (vor dem
  Filter-Zurücksetzen) oder mit einem Klick daneben (globaler Handler in `js/app.js`).
  **Das mobile Filtermenü (`.mfmenu`) benutzt dieselben Listen** `FLT_DUE`/`FLT_PAY` und
  ist seit 23.8.26 dasselbe Bild wie die Aufklappmenüs — eine weiße Karte als Overlay
  unter der Suchzeile (`css/mobile.css`); **nur die Überschriften** von Fälligkeit und
  Zahlungsstand stehen rechtsbündig, die Werte links wie jeder Eintrag. **Es bleibt bei
  einem spezifischen Wert offen** — anders als die Aufklappmenüs des Schreibtischs, und
  mit Absicht: dort stehen Fälligkeit und Zahlungsstand in **einem** Menü, und wer das
  eine setzt, will oft gleich das andere. Zu geht es bei „Alle", „Filter zurücknehmen"
  und „Filteroptionen…", ebenso mit Escape und dem Klick daneben (`wire()` und
  die globalen Handler in `js/app.js`). Ein eigenes ✕ hat die mobile Suchzeile nicht
  mehr — das Zurücknehmen steckt im Menü —, und der ☰-Knopf **leuchtet orange, sobald
  irgendein Filter greift** (`.mfbtn.on`): er ist auf dem Telefon das, was am
  Schreibtisch die orange Filterzeile ist.
* **Angelegt wird nur noch über das Menü.** Die Karten der Monatsansicht und die Leiste
  der Jahresansicht tragen keine „Neu…"-Knöpfe mehr; am Kopf der Flexible-Payments-Karte
  bleibt allein der Sprung in die Transactions-Auswertung (`.headlink`, `data-kview`).
* **Die Bereiche sind weiße Karten** (Radius 8, `--sh-card`): der Kopf trägt Blockstufe -3
  mit der Kante als Linie darunter, die Zeilen tragen Stufe -1 (Grund an der Tabelle,
  `css/ledger.css`). Die Überschrift nennt **keinen Monatsnamen** mehr — welcher Monat
  gemeint ist, sagen Monatsleiste und Reiter. Bank, Zahlungsart und Fälligkeit stehen am
  Schreibtisch als eigene
  Spalten rechts (`metaCells()`, 96 · 76 · 46 px; unter ~1280 px als Kürzel mit dem vollen
  Namen in der Sprechblase); **auf dem Telefon entfallen sie ganz** — die frühere
  Metazeile unter dem Namen ist seit 22.8.26 gestrichen, wer die Angaben braucht, öffnet
  die Position. **Kein `overflow:hidden` an einer Karte** (klebender Kopf, siehe Mobile) —
  die Rundung unten übernimmt die letzte Zeile. **Die Farbe des klebenden Kopfes liegt auf
  einer `::before`-Schicht** (Radius 8 oben), der Kopf selbst trägt Papier: er klebt, die
  Zeilen ziehen unter ihm durch, und durch eine nur beschnittene Ecke schienen sie neben
  der Rundung hindurch. **Beide Schichten tragen dieselbe Rundung** — ein eckiges Papier
  malte über die beiden oberen Ecken der Karte hinaus (ein klebender Kopf liegt über der
  Kante seines Elternteils, und Abschneiden verbietet sich), die Karte war oben eckig und
  unten rund. Durchscheinen kann dabei nichts: sobald der Kopf klebt, ist die Ecke der
  Karte längst hinausgescrollt. Dasselbe Muster tragen die Eckzellen der Jahresmatrix (siehe
  unten).
* **Jahresmatrix:** Architektur unverändert (eine Tabelle, Sticky-Leiter, abgeschnittener
  Rollbalken) — nur die Optik: Trennlinien in Stufe -2, Blockzeilen ohne
  schwarze Einfassung, Leerzeilen als 10-px-Lücken zwischen den „Karten". **Die
  3-px-Kante links tragen seit 22.8.26 nur noch die Kategoriezeilen** (`tr.grp`) — der
  Mock gab sie jeder Zeile mit, an zweihundert Positionen wurde daraus ein durchgehender
  Farbbalken. Die Blockzeilen sind so hoch wie die Kartenköpfe der Monatsansicht
  (Polster 8 px), und **unter der letzten Zeile einer Karte steht keine Trennlinie** —
  auch nicht unter einem zugeklappten Block, dessen Blockzeile ja die letzte ist.
  **Die „Karten"
  runden wirklich** (22.8.26, Ende von `css/matrix.css`): oben die erste Zeile nach einer
  Leerzeile, unten die letzte Zeile ihres `tbody`, dazu der Spaltenkopf als eigene Karte.
  Weil Kopf-, Gesamt- und Blockzeilen kleben, wird die Ecke nicht einfach beschnitten:
  die Eckzelle baut ihre Rundung aus **Hintergrund-Schichten** — unten die Blockfarbe
  (`--cellbg`), zuoberst je Ecke ein 8×8-Stück, das
  außerhalb des Viertelkreises Papier malt (`--cTL` … `--cBR` am `.matrix`). Kein
  `border-radius` und kein `::before`: ein absolut gesetztes Pseudo-Element in einer
  klebenden Tabellenzelle ist ein Positionierungs-Sonderfall, den nicht jeder Browser
  gleich beantwortet — ein Hintergrund hängt an der Zelle und wandert mit ihr, ob sie
  klebt oder scrollt. Das `box-shadow:none!important` an den Eckzellen ist Absicht: die
  Kantenregeln der Zeilen sind spezifischer, und ein inset-Schatten läge über allen
  Hintergrundschichten. Wer dort
  eine Zeile umbaut, prüft die Ecken im gescrollten Zustand. **„Saldo je
  Monat"** (vorher „Gesamt je Monat") ist jetzt die Blockzeile der **blauen** Karte
  (`sec r-bal balpin`; ohne Saldokorrektur darunter zusätzlich `cbot` — dann rundet sie
  auch unten): die Saldokorrektur klebt ohne Leerzeile direkt darunter, die
  Zahlen der Zeile tragen keine Vorzeichenfarbe mehr. **Die Saldokorrektur-Zeile ist
  keine Blockzeile** (Mock 4a): `cls:'r-bal'` ohne `sec` — heller Grund, gewöhnliche
  Schrift wie eine Position, nur der Stift im Blau der Karte. Vor ihr sitzt eine Leerzeile im
  `<thead>` (`matrixHead(spacer()+totRow)`). Die beiden Ausblenden-Knöpfe heißen auf
  Deutsch jetzt **„Abgeschlossene Monate ausblenden"** (`year.hideDone`,
  `state.hideDoneMonths`) und **„Erledigte Posten ausblenden"** (`year.hideSettled`,
  `ui.hideSettled`) — wer einen der Knöpfe in Text oder Sprechblase zitiert, nimmt
  diese Namen. In der Leiste steht „Filteroptionen…" direkt hinter dem ✕ — wie in der
  Filterzeile des Monats, beides gehört zum Suchfeld.
* **Der vierte Reiter heißt „Import Details"** (seit 23.8.26; davor „Transactions") —
  nur `view.kakeibo` in `js/i18n.js`; alle
  Schlüssel (`kak`, `ui.view='kakeibo'`, Dateinamen) bleiben. Der Tastengriff ist seit
  23.8.26 **I** (davor T, davor D) — auf ausdrücklichen Wunsch, obwohl der Browser
  Strg/Cmd+Umschalt+I meist selbst für die Entwicklerwerkzeuge nimmt: dort kommt der
  Griff dann nicht an, in der Mac- und der Windows-App schon.
* **Fenster** nach 5a/5b, seit 23.8.26 nach der Vorlage
  `_BusinessCenter/DESIGN/260823 ReDEsign FINA - Settings and Paymentdetails.html`:
  `.box` mit Radius 10 und `--sh-modal`; die Blöcke (`.dgrp`,
  `.quick`, `.setpane`) stehen auf dem **Grund des Fensters** und heben sich
  über den zweischichtigen Schatten `--sh-grp` ab (vorher grau auf `--chrome`) — Radius 8
  und die Haarlinie bleiben. **Der Monatsblock trägt dabei den hellen Grund seiner
  Geldart** (`.dgrp.t-in/t-flex/t-out/t-bal` → `--bg-in` …; die zweite Stufe stand hier
  für einen Tag und war zu viel Farbe für einen ganzen Block): im
  Posten-Fenster folgt er der
  Block-Auswahl (`mtint`/`updateTint` in `js/dialogs/item.js`, ohne Block neutral). Weiße Felder mit Radius 6, Mono-Versalien 8.5 px
  als Feldbeschriftung, Monatskacheln mit Radius 7 (geschlossen auf `--settled`),
  Einstellungsmenü mit roter 3-px-Kante, Löschen als oranger Textlink links in der
  Fußzeile (`.dellink`). Im schmalen Einstellungsfenster steht die Zeile
  ‹ · Aufklappliste · › **direkt unter der Überschrift, vor dem Beschreibungssatz** —
  so bleibt sie beim Bereichswechsel an derselben Stelle; sie trägt seit 23.8.26
  **dieselbe Bauform wie die Ansichtswahl unten am Telefon** (`.mvsel`/`.mvnav`):
  Mac-Knopfbild, Mono-Versalien zentriert, kein Browser-Pfeil (`appearance:none`).
* **Bewusste Abweichungen vom Mock** (Funktion vor Standbild): die Zähler „(n)" an den
  Filterknöpfen bleiben, die LP-Ampel behält ihre vier Farben, die Kartensummen des Monats
  ihre Vorzeichenfarbe, „Sicherung speichern" steht mit im Menü, alle zwölf Monatsspalten
  bleiben sichtbar (der Mock hat Sep–Dez nur aus Platzgründen weggelassen), und der
  Bereichsfilter — im Mock vergessen — steht als drittes Aufklappmenü in derselben
  Bauform. Die ✓/?-Erklärung (`.viewkey`) neben der Segmented Control ist seit 22.8.26
  **weg**: sie stritt dort mit dem Dateinamen um den Platz; die Siegel erklären ihre
  Sprechblasen und die Anleitung.

## Bewegung (seit 6.9.26)

**Alles, was erscheint oder verschwindet, ist animiert — in beide Richtungen.** Das ist
Lex' Grundregel, und sie gilt für jede neue Stelle ohne Nachfrage: „Es soll alles flüssig
und weich sein. Nicht langsam." Der ganze Apparat wohnt in `js/ui.js` (Abschnitt hinter
`impSideWire`); die Keyframes und die Geist-Klassen stehen in `css/components.css` und
`css/layout.css`. **Animiert werden nur `transform`, `opacity` und `clip-path`** — „nichts
davon setzt die Seite neu"; Breite und Höhe zu bewegen hieße, den ganzen Kasten in jedem
Bild neu zu setzen, und mit den Tabellen des Imports ruckelte genau das sichtbar. 150 bis
460 ms, `ease-out` oder `cubic-bezier(.4,0,.2,1)`. **Alles hinter `prefers-reduced-motion`
abschaltbar** — ein Sammelblock in `css/components.css` (Animationen `none`, Geister
`display:none`) plus Einzelregeln in `layout.css` und `matrix.css`; wer eine Bewegung baut,
trägt sie dort ein.

* **Geister.** Fenster, Menüs und Ansichten verschwinden mit einem nackten `remove()` oder
  per `innerHTML` — was hinausfahren soll, ist dann schon weg. `ghostOf(n,cls,rect)` baut
  aus dem alten Element eine Kopie fürs Auge: ohne Kennungen (`getElementById` fände sonst
  den Geist), ohne Klick (`pointer-events:none`), ohne Fokus (`inert`), mit den Feldwerten
  und Rollstellungen des Originals — nur Datei-Felder bleiben leer (ein `InvalidStateError`
  brach sonst den CSV-Import ab), und `data-hk` bleibt in der Kopie, sonst stünden im Geist
  alle Pfeile da. **Das Rechteck wird vor dem Entfernen gemessen.** Vier Geist-Klassen:
  `.modalghost` (Fenster, `z-index:50` — ein Fenster über einem anderen fährt sonst hinter
  diesem hinaus) · `.viewghost` (Ansicht) · `.foldghost` (Klappen) · `.boxslide` (Rahmen
  beim Inhaltswechsel). Alle mit `scrollbar-width:none` (macOS blendete den schwebenden
  Balken kurz ein) und im Geist klebende Leisten auf `position:relative`. Jeder Geist
  entfernt sich per `animationend` **und** per Uhr (700 ms) selbst.
* **Fenster** fallen von oben herein und fahren nach oben hinaus — Fertig, Abbrechen, Kreuz,
  Escape, Klick daneben, alle Wege. Ein `MutationObserver` am Ende von `js/ui.js` sieht
  jedes `.modal` kommen und gehen: fällt eins heraus, legt er einen `.modalghost` an seine
  Stelle. **Fällt im selben Zug ein neues Fenster derselben Bauart herein** (Einstellungen
  nach „+", Entfernen, Sortieren — `kind()` vergleicht die Kastenklasse), gibt es keinen
  Geist, das neue trägt `.noanim`, und sein Kasten wächst stattdessen aus der Größe des
  alten (`flipBox`). Ein **anderes** Fenster, das zugleich zugeht (Strukturfenster über den
  Einstellungen), fährt normal hinaus. Deshalb tragen **alle** Nachfahren-Regeln von
  `.modal` in `components.css` und `mobile.css` den Selektor
  `:is(.modal,.modalghost,.boxslide) .box` — der Geist muss aussehen wie das Original.
  Keyframes `fina-dropin/-dropout/-fade/-fadeout` (220 ms, 40 px).
* **Größenänderung eines Fensters** ist überall dieselbe: `flipBox(box,from,delay)` mit
  `boxSize` (WeakMap), `FLIP_MS=240`. `clip-path:inset(… round 10px)` plus `transform`,
  **oben links angehängt** — „von der Mitte aus wüchse es nach beiden Seiten, und man sähe
  den Inhalt zur Seite wandern, ohne dass rechts etwas käme" (Lex). Wachsen: Ausschnitt
  öffnet sich; Schrumpfen: alte Maße halten (`max-width/max-height`), Ausschnitt schließen,
  dann die Maße abfallen lassen. Angemeldet werden neue Kästen beim `boxWatch`
  (ResizeObserver, Aufruf in `requestAnimationFrame`, damit „ResizeObserver loop
  completed…" ausbleibt; übersprungen bei `data-flip`); **beim Ziehen des Browserfensters**
  (`lastResize`, < 300 ms) passiert nichts.
* **Inhaltswechsel in einem Fenster** — Bereich der Einstellungen (`showPane()` →
  `paneNow()` in `js/dialogs/settings.js`; `.setpane.swapfade`, Kasten `.setbox` mit
  **fester Breite** `min(1080px,100%)`, nur die Höhe folgt dem Bereich), Schritt im Wizard
  (`c2Render(swap)` bei `W.drawnStep!==W.step`, Arbeitsfläche `.c2work.swapfade`): erst
  blendet der alte Inhalt aus, dann die Größenänderung, dann blendet der neue ein — auch bei
  gleicher Größe. `boxSwap(box,mutate)`, `SWAP_MS=150`: Geist des Kastens in `.boxslide` mit
  `.fadeout`, `mutate()`, `flipBox`, `.swapfade` blendet ein; `.swapping` verbirgt den
  neuen Inhalt, bis das Fenster seine Größe hat. **Ein Inhalt erscheint nie, bevor die
  Bewegung zu Ende ist.** Kopfzeile und Menü bleiben dabei stehen.
* **Die Importdaten am Posten-Fenster** (`impSideWire`, `.impside.impin/.impout`) laufen
  zweizügig: erst wird das Fenster breiter (`flipBox` mit gemessener Altgröße — der
  ResizeObserver käme ein Bild zu spät), dann fährt die Liste von rechts herein; beim
  Ausblenden erst hinaus, dann schmaler. Beim Öffnen mit sichtbarer Liste bleibt sie
  `visibility:hidden`, bis das Fenster zu Ende gefallen ist (260 ms).
* **Ansichten** wechseln seitwärts über die volle Breite in Reiterrichtung
  (`slideViewOut(vbox,dir)` / `slideViewIn(vbox,dir)` um `innerHTML` in `render()`,
  `VIEW_MS=460`; Richtung aus der Reihenfolge in `VIEWS`, bei `lastView!==ui.view` —
  und seit 8.9.26 zusätzlich, wenn ein Buch aufgeht (siehe „Ein Buch, das aufgeht,
  fliegt herein"). **Die alte Ansicht bleibt stehen und wird
  überlagert** (Lex, 6.9.26 spät; bis dahin fuhr sie zur Seite hinaus):
  `.viewbody.in-left / .in-right` mit `--paper`-Grund, Keyframes `fina-inL/-inR`,
  `cubic-bezier(.75,0,.15,1)` — langsam an, schnell über die alte Ansicht, zum Ende weich
  aus. `--viewgap` / `--viewfill` sind Deckstreifen (`::before/::after`),
  `html.viewslide{overflow-x:hidden}`, `html{scrollbar-gutter:stable}` (sonst rückten die
  Reiter beim Wechsel). `syncStickyTops()` misst deshalb nur noch `#view .stickybar` und
  `#view .card > .sechead` — Geister ausgenommen — und sucht `.monthscroll` statt
  `#monthScroll`, denn der Geist hat keine IDs. Ein bloßes Neuzeichnen derselben Ansicht
  (Tippen, Filtern) bewegt nichts.
  **Seit 7.9.26 ruckelt der Wechsel nicht mehr**, und zwar aus zwei Gründen, beide in
  `slideViewOut/-In`: (1) **Die alte Ansicht wird selbst zum Geist** — sie verliert
  Kennung, Klicks und die IDs ihrer Kinder und bleibt als `.viewghost` fest an ihrer
  Stelle; `render()` zeichnet in einen frischen `#view`-Knoten, den `slideViewOut()`
  zurückgibt. Eine Kopie per `ghostOf()` einer ganzen Jahresmatrix kostete vor dem ersten
  Bild 100 bis 200 ms. (2) **Erst ein gemaltes Bild, dann die Fahrt**: die neue Ansicht
  steht zuerst still neben dem Fenster (`.pre-right/.pre-left`, dieselbe Lage wie das erste
  Bild der Animation, `will-change` schon gesetzt), zwei `requestAnimationFrame` später
  bekommt sie die Animationsklasse. Der Browser malt und rastert die ganze Ansicht so,
  bevor sie sich bewegt — vorher lag das im ersten Bild der Fahrt, und sie sprang um
  genau diese Zeit vor. Gemessen mit Electron offscreen (echte Zeit, siehe „Prüfen"):
  vorher Bildabstände von 183 und 100 ms, nachher 17 ms durchgehend. Der Geist entfernt
  sich am Ende der Fahrt (und per Uhr) selbst.
  **Am Ende der Fahrt werden die Bildschichten der Rollflächen einmal neu gebaut**
  (`restick()` in `js/ui.js`, gerufen aus `done()`; seit 7.9.26): unter Windows standen
  in Chrome nach einem Wechsel in die Jahresansicht die beiden roten Linien des
  laufenden Monats in der **Blockzeile** um ein Gerätepixel neben denen der Posten
  darunter, und ein zweiter Klick auf denselben Reiter — bei dem nichts fährt — rückte
  sie zurecht. Im Layout stehen sie exakt untereinander (nachgemessen: dieselbe linke
  Kante); der Versatz entsteht erst beim Rastern. Solange die Ansicht hereinfährt, trägt
  ihr Rumpf (`.viewbody`) nämlich `will-change:transform` und ist eine eigene Schicht, und die
  klebenden Zeilen darin bekommen ihre eigene — die Posten daneben nicht, die kleben
  nicht. Bei einer Bildschirmskalierung von 125 % ist der Weg von `translateX(100%)` ein
  Bruchteil eines Gerätepixels, und jede Schicht rundet ihre Lage für sich. `restick()`
  setzt deshalb `will-change` an jede Rollfläche der Ansicht und nimmt es im nächsten
  Bild wieder — **und zur Sicherheit per Uhr**, denn ein Bild kommt nicht immer (siehe
  `visibilitychange` bei den Menüs); zu sehen ist davon nichts, es bewegt sich nichts.
  Ein Rollstoß um ein Pixel täte dasselbe, wäre aber für ein Bild lang zu sehen. Wer
  eine weitere Rollfläche mit klebenden Zeilen baut, trägt ihre Klasse dort ein.
* **Getauscht wird nur, wenn beide Ansichten einen Top-Bereich haben** (Lex, 10.9.26).
  Alles Folgende setzt voraus, dass es auf **beiden** Seiten eine Filterzeile gibt. Die
  Prognose hat keine — und dann log der Tausch: von der Prognose ins Jahr stand die neue
  Leiste vom ersten Bild an deckend über den Kennzahlen der Prognose, und umgekehrt
  blendete die alte Leiste für sich aus, obwohl gleich der ganze Rumpf darüberfährt. Fehlt
  sie auf einer Seite, fährt die neue Leiste deshalb **mit dem Rumpf mit** (`.barride` in
  `slideViewIn`, Regeln in `css/components.css`): die neue Ansicht kommt als ein Stück
  herein. `swap` in `slideViewIn` sagt, welcher der beiden Fälle gilt.
* **Die alte Ansicht bleibt unverändert stehen, bis sie zugedeckt ist** (Lex, 10.9.26).
  Zwei Dinge verletzten das: (1) die Leiste des Geistes wurde leergeräumt — ihr Inhalt zieht
  ja in die neue Leiste um — und fiel dabei auf Höhe 0 zusammen, worauf der ganze alte
  Inhalt um ihre Höhe nach oben sprang; im Monat rutschte die Monatsleiste dabei unter die
  neue Leiste und schien zu verschwinden. `slideViewOut` hält deshalb die gemessene Höhe
  als Inline-Maß fest, **bevor** es irgendetwas am Kasten ändert. (2) Der Geist blendete
  seine Leiste aus (`fina-barout` an `.viewghost>.stickybar.viewtop>*`); die Regel ist weg.
* **Der Top-Bereich fährt nicht mit** (Lex, 8.9.26). **Der Top-Bereich ist die
  Filterzeile** — die Bahn, die an der Kopfzeile andockt und in Monat und Jahr dieselbe
  ist; sie trägt dafür die Klasse `viewtop`. Sie steht in beiden Ansichten an derselben
  Stelle, und eine Bahn, die quer über den Bildschirm zieht, sagt über den Wechsel
  nichts. **Sie bleibt stehen; nur ihr Inhalt
  wechselt, und zwar nach oben**: das Alte fährt nach oben hinaus (`fina-barout`,
  200 ms, im Geist), das Neue kommt von oben herein (`fina-barin`, 280 ms nach 100 ms
  Wartezeit, `backwards` hält es bis dahin unsichtbar) — weil die Kopfzeile darüber
  deckt, verschwindet das eine unter ihr und das andere kommt darunter hervor.
  Nacheinander und nicht zugleich. **Nach unten hinaus lief es einen Tag lang** (Lex,
  8.9.26 spät: es soll wieder nach oben gehen) — der Weg nach unten führte über die
  Ansicht, für die gerade Platz gemacht wird.
  **Die Filterzeile liegt eine Stufe über der zweiten Leiste** (`z-index:31` gegen 30):
  beide trugen dieselbe, und weil die zweite später im Dokument steht, malte sie über die
  erste — die Aufklappmenüs der Filterzeile fuhren dahinter auf, und zu sehen war nur,
  was unten hervorschaute. Ein höherer `z-index` am Menü selbst hilft dagegen nicht: eine
  Leiste ist mit `position:sticky` und ihrer Stufe ein eigener Stapelraum, aus dem kein
  Kind herausreicht. Übereinander liegen die beiden nie — die zweite klebt genau unter
  der ersten —, die Stufe sagt also nur, wer über wen malt.
  **Monatsleiste, Auswertung und die Kennzahlen der Prognose gehören nicht dazu** (Lex,
  8.9.26 spät): sie sind Inhalt der Ansicht und sollen mitfahren, nicht von oben
  hereinfallen. Im Monat stehen sie deshalb in einer **zweiten** Leiste (`.anasub`,
  gebaut in `anaBar()`) **innerhalb** des Rumpfes; sie klebt unter der Filterzeile. Die
  Prognose hat gar keinen Top-Bereich — dort fährt die ganze Ansicht. Auf dem Telefon
  ebenso: `mobileTop()` trägt kein `viewtop`.
  **Dafür steht alles unter dem Top-Bereich in einem eigenen Kasten**:
  `wrapViewBody(vbox)`
  in `js/ui.js` hängt nach jedem `innerHTML` die Geschwister der `.stickybar.viewtop` in
  ein `.viewbody`, und **nur dieses** fährt; ohne `viewtop` steckt die ganze Ansicht
  darin. Gehängt wird bei **jedem** Zeichnen, nicht nur
  beim Wechsel — ein Kasten, den es mal gibt und mal nicht, verschöbe die Ansicht in dem
  Bild, in dem er dazukommt; er trägt `display:flow-root`, damit die Außenabstände
  seiner Kinder in ihm bleiben, ob er gerade fährt oder nicht. Die Knoten werden
  **verschoben**, nicht neu gebaut: ein zweites `innerHTML` kostete die ganze
  Jahresmatrix noch einmal. `#view` selbst trägt während der Fahrt nur `.sliding`
  (`position:relative;z-index:2`) und **keinen Grund** — der Geist soll darunter stehen
  bleiben, bis der Rumpf über ihn fährt; die beiden Deckstreifen `--viewgap` /
  `--viewfill` sitzen am `.viewbody`. Eine Ansicht ohne Leiste (die Begrüßungsseite, die
  Prognose auf dem Telefon) steckt ganz im `.viewbody`.
  **Die Polster der Leisten stehen dafür an einer Stelle** (`css/layout.css`): die
  Filterzeile schließt ohne Polster ab (`.anabar.viewtop{padding-bottom:0}`), die zweite
  Leiste bringt die 10 px als eigenes Polster mit (`.anabar.anasub{padding-top:10px}`,
  `.anasub>.months{margin-top:0}`), und die Prognose ebenso (`.kpibar`,
  `.kpibar>.anahead{margin-top:0}`). Grund ist überall derselbe: ein **Außenabstand**
  des ersten Kindes fällt durch die Leiste hindurch nach oben, und die Leiste fängt dann
  tiefer an, als sie klebt.
* **Das erste Bild blendet ein** (Lex, 8.9.26). Beim Öffnen der Anwendung fährt nichts:
  es gibt keine vorige Ansicht, aus der etwas herausfahren könnte. Die ganze Seite blendet
  stattdessen ein — Kopfzeile, Ansicht und Statuszeile zusammen, denn sie kommen zusammen
  (`body.pagein`, Keyframe `fina-pagein`, 340 ms). Gesetzt wird die Klasse am Anfang von
  `render()` beim allerersten Zeichnen (`firstPaint` in `js/app.js`) und fällt per
  `animationend` **und** per Uhr wieder ab; `ui.enter` wird dabei ausdrücklich
  zurückgesetzt, sonst führe eine Ansicht zusätzlich von rechts herein. Bewegt wird allein
  die Deckkraft — ohne Animation (`prefers-reduced-motion`) steht die Seite sofort da, und
  zwar sichtbar: der Ruhezustand ist volle Deckkraft.
* **Ein Buch, das aufgeht, fliegt herein** (Lex, 8.9.26). `ui.enter` ist der Merker
  dafür — 1 heißt „von rechts" (Datei geladen, leer angefangen), -1 „von links" (Datei
  getrennt, die Begrüßung kommt zurück). Gesetzt wird er dort, wo ein Buch betreten
  wird (`loadData()`, `startEmpty()`, `unlinkData()` in `js/storage.js`, dazu der
  Rückfallweg `#fileJson` in `js/app.js`), **verbraucht einmal in `render()`**. Ohne ihn
  gäbe es keine Fahrt: von der Begrüßungsseite her ist `lastView` leer, und beide Seiten
  wechselten schlagartig.
* **Die Pille der Ansichtswahl gleitet** (`.vpill` hinter den `.vtab`, `renderChrome()`):
  die alte Lage wird vor `innerHTML` gemessen, die Pille steht sofort neu und fährt per
  `transform: translateX() scaleX()` von der alten herüber — `left/width` zu bewegen setzte
  die Kopfzeile in jedem Bild neu.
* **Klappen** — Karten der Monatsansicht, Blöcke der Matrix, die Auswertung, die Blöcke
  und Zielzeilen des Imports: `foldSnap(root)` vor dem Neuzeichnen, `foldPlay(root,snap)`
  danach, ausgelöst über `ui.foldAnim` (gesetzt in `toggleFold()` und an `data-ana`,
  gelesen und zurückgesetzt in `render()`) bzw. `W.foldAnim` im Wizard. Merkmal `data-fk`
  — im Monat `card:in|flex|out|bal|ms` und `body:in|flex|out|tl`, in der Matrix
  `tbody data-fk="blk:i"`, im Import `blk:…`, `bhead:…`, `row:…`, `src:…`. Was bleibt,
  fährt per FLIP (`translateY`, gedeckelt auf `innerHeight` — „ein Weg über 2000 px in
  280 ms ist kein Gleiten mehr"); was verschwindet, wird ein `.foldghost` mit `clip-path`
  von unten (nur der sichtbare Teil); was neu ist, `.foldin` (clip-path) oder in Tabellen
  `.foldin-row` (nur Deckkraft — Zeilen einer Tabelle teilen sich keinen Ausschnitt).
  `rowsGhost()` baut für Tabellenzeilen eine eigene Tabelle mit `colgroup` aus der
  Kopfzeile; Rollflächen `.yearscroll` und `.c2top .c2scroll`.
* **Klapp-Pfeile** (`tri(down)`, `.tri`, `data-hk`): mit Maus in Ruhe unsichtbar, fahren
  beim Überfahren oder Fokus heraus (Überschrift rückt weich nach rechts), drehen sich beim
  Klappen (`.tri.down{rotate(90deg)}`, Ruhelage ausdrücklich `rotate(0deg)` — von 90° zu
  `none` springt der Browser), Farbe überall `--ink-2`. `bindHoverStill(root)` (in
  `wire()` und `c2Wire()`) gibt einem neu gebauten Element mit gemerktem Schlüssel `.still`
  — ausgefahren ohne Übergang — und stellt den Pfeil vor dem Loslassen in die alte Drehung:
  **was beim Neuzeichnen unter der Maus bleibt, fährt nicht neu an.** Zwei
  Animationsbilder später wird geprüft, ob die Maus noch darüber steht. Die Regeln stehen
  hinter `@media (hover:hover)` in `layout.css`, `matrix.css`, `components.css`.
* **Menüs** — Hamburger, die drei Filter-Aufklappmenüs, das mobile Filtermenü, die Menüs des
  Imports — klappen auf und zu (`fina-menu/-menuout`). Aufklappmenüs tragen `data-dm`;
  `.popin` nur beim **ersten** Zeichnen — `ui.menuDrawn` (gesetzt am Ende von `wire()`)
  sagt, welches Menü schon stand, ein Filtermenü, das nach dem Tippen offen bleibt, fährt
  nicht noch einmal an (`snapMenus()` / `settleMenus()`). `popOut(el)` ersetzt jedes
  `.c2fpop.remove()` im Import. Der Hamburger schließt über `.tools.closing`
  (`animationend` plus Uhr 260 ms, `shut()` in `js/app.js`); beim Öffnen wird die Animation
  nach 260 ms abgeschnitten, und ein `visibilitychange`-Handler setzt offenen Menüs und
  Fenstern `animation:none` — ein Klick aus einem anderen Programm heraus ließ das Menü
  sonst unsichtbar auf dem ersten Bild stehen (Chrome hält die Seite für verdeckt).
* **Die Filterzeile wechselt ihre Farbe mit Übergang**: `render()` merkt `fbWasOn`, setzt für
  ein Bild `.was-on/.was-off` (`layout.css`, `!important`) und nimmt sie wieder — nicht
  beim Ansichtswechsel.
* **Die beiden Anleitungen** (seit 7.9.26) — der Bereich `.guidepanel` und das Feld
  `.c2gpanel` im Wizard — fahren von rechts herein und nach rechts hinaus, mit den
  Keyframes der Importdaten (`fina-impin/-impout`). Der Bereich fährt selbst hinaus:
  `closeGuide()` nimmt ihm die Kennung (`guideOpen()` sagt sofort „zu"), gibt ihm
  `.closing` und `inert`, und er entfernt sich per `animationend` plus Uhr. Das Feld im
  Wizard geht mit `c2Render()` verloren, deshalb ein Geist (`c2GuideGhost()`) in einem
  `.c2gghostwrap` mit `overflow:hidden` an der Fensterkante; `.c2work` ist dafür ebenfalls
  `overflow:hidden`. Beides im Sammelblock für `prefers-reduced-motion`. **Aus dem
  ☰-Menü heraus klappt erst das Menü zu, dann fährt die Anleitung** (Lex, 7.9.26): der
  Handler von `#btnGuide` in `js/app.js` wartet die 260 ms von `shut()` **plus eine halbe
  Sekunde Ruhe** ab (`GUIDE_AFTER_MENU`), wenn das Menü beim Klick `open` trägt; sonst
  deckte das zuklappende Menü den Anfang der Fahrt zu.
* **Native `<select>`-Listen lassen sich nicht animieren** — der Browser zeichnet sie. Dafür
  bräuchte es eigene Listen; das ist bewusst nicht gebaut.

`ui.foldAnim` und `ui.menuDrawn` sind Sitzungsfelder wie `ui.fltMenu`, nie in der Datei;
im Wizard heißen sie `W.foldAnim`, `W.drawnStep`, `W.blkFold`.

## Die vier Regeln

**1. Views erzeugen `data-*`, `app.js` verdrahtet.**
Views und Dialoge liefern nur HTML-Zeichenketten zurück, sie hängen keine Klicks an. Jedes
`data-…`-Attribut in einer View wird in `wire()` in `js/app.js` abgeholt. Ein neuer Knopf
braucht also immer zwei Stellen: das Attribut in der View und eine Zeile in `wire()`.
Ausnahme: `data-note` und `data-tip` gehören `js/ui.js` und funktionieren überall von
selbst.

Bestehende Attribute: `paid` (Siegel) · `filter` `duefilter` `secfilter` `tpart` `q` `qfields` `kd` `mfilters` (Filter;
`qfields` öffnet die Einstellungen im Bereich „Filter", `mfilters` das mobile Filtermenü) ·
`ana` (Auswertung auf-/zuklappen) · `fold` `secfold` (einen Bereich der Monatsansicht
zuklappen — Pfeil und Kartenkopf) · `yfold` `blkfold` (einen Block der Jahresmatrix
zuklappen — Pfeil und Blockzeile) · `qclear` (Filter
zurücknehmen) ·
`wload` `wnew` (Begrüßungsseite) · `opening` (Anfangsbestand in den Einstellungen öffnen) ·
`kpick` `ktop` `kmonth` (Flexible Payments: rechte Spalte, Zeitraum) · `txlist` (die
Buchungen als Fenster, mobile Transactions-Ansicht) · `goto` `kview`
(Sprünge in eine andere Ansicht) · `mtab` (Monatsleiste unter der Filterzeile) ·
`edit` `dbledit` `lists` (Fenster) · `newitem` (neu anlegen) ·
`links` (Auswahl der zugehörigen Links).

`data-dbledit` sitzt an der **Zeile**, nicht an der Zelle, und es
gibt es in **jeder** Ansicht: ein Doppelklick auf den Betrag oder auf die Bezeichnung
öffnet dasselbe Fenster wie der Stift. Gebaut werden sie mit `dblItem(id)` aus
`js/ui.js`; verdrahtet sind sie einmal in `wire()`.

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
Jahresmatrix. Eine stille Vorauswahl landete unbemerkt in der Datei — deshalb keine.
Angelegt wird erst beim Speichern; wer abbricht, hinterlässt nichts.

**2. Kategorien nie direkt umbenennen.**
Posten zeigen über den *Namen* auf ihre Kategorie (`it.group`), und die drei Listen
`incomeGroups`, `flexGroups`, `groups` sagen, zu welchem Bereich der Name gehört. Wird ein
Name in einer Liste einfach überschrieben, verlieren die Zeilen ihren Bezug, landen bei
`ensureNoCat()` in „N/A" und wechseln womöglich den Bereich. Immer `renameGroup()` /
`dropGroup()` aus `js/categories.js` benutzen — die ziehen die Posten mit
(`renameFlexGroup`/`dropFlexGroup` sind nur Namen dafür). Umbenannt wird an einer Stelle:
im Einstellungsfenster (`applyRenames()` in `js/dialogs/settings.js`, das den Namen gegen
**alle drei** Listen prüft). Das frühere Beträge-Fenster der flexiblen Kategorien
(`js/dialogs/kakeibo-betraege.js`, `editKak`, `renameKakCat`) gibt es seit 6.9.26 nicht mehr.

## Drei Kategorielisten, je eine mit „N/A"

`state.incomeGroups`, `state.flexGroups` (seit 6.9.26) und `state.groups` sind die drei
Kategorielisten — gepflegt nebeneinander im Einstellungsfenster (Bereich „Kategorien",
`.grouplists.c3`). Früher gab es für die Einnahmen den einen festen Block `'EINNAHMEN'`; er
ist heute nur noch der Name, unter dem `migrate()` eine **alte** Datei weiterführt. Als
roher Schlüssel wird er **nicht** übersetzt; angezeigt wird er über `keyLabel()` als
`INCOME` (Regel 3).

**Jede Liste beginnt mit einem festen Eintrag**, einem je Bereich: `NOCAT_IN` =
`(Einnahmen ohne Kategorie)`, `NOCAT_FLEX` = `(Flexibel ohne Kategorie)`, `NOCAT_OUT` =
`(Regulär ohne Kategorie)` (`js/i18n.js`, `isNoCat()`). Der Bereich steht im Schlüssel,
weil derselbe Schlüssel sonst in zwei Listen stünde; **angezeigt** wird er in beiden
Sprachen als **„N/A"** (`NOCAT_LABELS`, seit 6.9.26 spät auf Lex' Wunsch) — überall, wo er
steht, ist der Bereich die Überschrift darüber, ein Name, der ihn wiederholt, sagte zweimal
dasselbe. Er lässt sich sortieren, aber nicht umbenennen und nicht löschen (`.fixedrow` in
den Einstellungen); Posten ohne gültige Kategorie zieht `ensureNoCat()` (`js/state.js`)
dorthin, und wer eine Kategorie entfernt, schiebt ihre Posten in das „N/A" **derselben**
Liste (`dropGroup(name,fallback)`). **Eine leere Liste gibt es damit nicht mehr**, auch
in einem frisch angefangenen Buch nicht (`emptyState()`).

**`isIncome(it)`, `isFlex(it)`, `isCost(it)` fragen die Listen** (`js/calc.js`). Daraus
folgt das Wichtigste: **ein Name darf über alle drei Listen zusammen nur einmal
vorkommen** — stünde er in zweien, wäre nicht mehr entscheidbar, welchem Bereich ein
Posten gehört. Durchgesetzt wird das in `applyRenames()` in `js/dialogs/settings.js`.

**Im Posten-Fenster steht eine Liste, nicht drei.** `groupOpts()` in `js/dialogs/item.js`
baut sie mit drei `<optgroup>`: Einnahmen, Flexibel, Regulär — in den Farben ihrer
Bereiche (`.og-in/.og-flex/.og-out`), und der Monatsblock des Fensters färbt sich mit der
Wahl (`mtint`: `t-in/t-flex/t-out`). Vorgewählt ist bei einem neuen Posten „N/A" der
regulären Kosten. Das Feld steht in derselben Reihe wie Bank, Zahlungsart und Fälligkeit
(`c4`), bei der Saldokorrektur entfällt es (`c3`).

**Monats- und Jahresansicht bündeln jeden Bereich nach Kategorie** — auch die flexiblen
Posten (`flexGroupsL` in `js/views/monat.js`, `r-flex` in `js/views/jahr.js`) —, und die
Kategoriezeile steht **immer**, auch bei einer einzigen Kategorie: sie trägt die Farbe
ihres Bereichs (`tr.group` in `.card.sec-in/-flex/-out`, `tr.grp.r-in/-flex/-out` in der
Matrix) und ist die einzige Stelle, an der man die Kategorie liest.

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
`'EINNAHMEN'`, `'(ohne Hauptkategorie)'`, `'(ohne Kategorie)'` und die drei festen
`NOCAT_*`-Schlüssel sind Schlüssel im Zustand und dürfen **nicht** übersetzt werden — sonst
verlieren die Zeilen ihre Daten. Angezeigt werden sie über `keyLabel()` aus `js/i18n.js`:
die drei alten in jeder Sprache auf Englisch (`INCOME`, `(no main category)`,
`(no category)`), die drei `NOCAT_*` in beiden Sprachen als „N/A". Überall, wo so ein Name auf den
Bildschirm geht, steht `esc(keyLabel(name))`; wo er als Wert, `data-…` oder Vergleich
gebraucht wird, bleibt der rohe Name stehen.

`esc()` (`js/format.js`) kodiert seit 10.9.26 auch das **einfache** Anführungszeichen.
Heute ist das folgenlos — nachgesehen: FINA hat kein Attribut in einfachen
Anführungszeichen, und `esc()` landet ausnahmslos in HTML, wo `&#39;` wieder als `'`
erscheint. Es nimmt nur die Falle weg, dass ein späteres `title='…'` sich aufbrechen ließe.

**4. Klassische Skripte, feste Reihenfolge.**
Keine ES-Module und kein `fetch`, damit die Seite auch per Doppelklick über `file://`
läuft. Neue Dateien in `fina-online.html` eintragen: `i18n.js` zuerst, dann Werkzeuge,
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
  zur Startseite (`<a href="index.html">` in `fina-online.html`). In der App heißt der
  Web-Client selbst `index.html` (siehe unten): der Klick wäre dort ein stilles Neuladen
  mitsamt der ungespeicherten Arbeit, deshalb nimmt `renderChrome()` dem Link dort `href`
  und `title`.
Die Begrüßungsseite braucht `FINA_NATIVE` nicht mehr: sie nennt keine Downloads — das
erledigt die Startseite (`index.html`), und `download/` leitet als Stub dorthin weiter
(ältere App-Fassungen öffnen diese Adresse beim Update-Hinweis). **Ihr Weg zur
Datenschutzerklärung ist aus demselben Grund absolut** (`PRIVACY_URL`, siehe unten): in
der App liegt neben dem Web-Client keine zweite Seite.

**Die Adresse der Webseite steht an einer Stelle:** `SITE_URL` in `js/config.js`
(`https://fina-app.de/`, seit 23.8.26 die eigene Domain; `linked2ag.github.io/FINA`
leitet dorthin weiter). Daraus leiten sich `DOWNLOAD_URL` (der Hinweis auf eine neuere
Fassung führt zu `#apps`) und `PRIVACY_URL` ab. **`VERSION_URL` bleibt auf der alten
Adresse** — danach fragen die schon installierten Apps, und die Weiterleitung beantwortet
das ohne Zutun.

**Der Web-Client heißt in der Auslieferung der App weiter `index.html`:** `desktop/sync.mjs`
kopiert `fina-online.html` nach `desktop/app/index.html` — so bleibt `desktop/main.js`
unberührt, und in die App gelangt nie die Verkaufsseite.

**Die Sprache hat zwei Zuständigkeiten, und die Datei gewinnt.**

*Ohne Buch* — die Verkaufsseiten und die Begrüßungsseite — gilt eine gemeinsame Notiz:
`finaLang` im localStorage. Geschrieben wird sie vom DE/EN-Schalter der Verkaufsseiten
(`setLang()` in `js/landing.js`) und von der Begrüßungsseite (`data-wlang` → `chooseLang()`
in `js/i18n.js`); gelesen beim Aufruf jeder Verkaufsseite und beim Start des Web-Clients für
das noch leere Buch (Block „Start" in `js/app.js`). Englisch ist der Grundzustand. Wer auf
der Seite Deutsch wählt, landet auch in der Anwendung auf Deutsch — und umgekehrt.

*Mit Buch* entscheidet **die Datei**: `state.lang`. Geändert wird sie im
Einstellungsfenster, wo die Angaben der Datei beisammenstehen — und das schreibt `finaLang`
**nicht**: wer ein Buch auf Deutsch führt, hat damit nichts über die Verkaufsseiten gesagt.

**Deshalb steht in der Kopfzeile der Anwendung keine Sprachwahl.** Bis 18.8.26 stand dort
eine; sie war ein zweiter Weg zu derselben Angabe, direkt neben den Dateiknöpfen, und sah
damit nach einer Einstellung der Anwendung aus statt nach einer der Datei. Die
Begrüßungsseite behält ihre — dort gibt es noch keine Datei, die entscheiden könnte.

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

**Und der Nutzer erfährt, wenn seine Datei älter ist.** `migrate()` merkt sich den
vorgefundenen `s.v` in der Modulvariablen `fileVersion` (`js/state.js`) — **nicht im
Zustand**, sonst stünde die alte Nummer wieder in der Datei. `fileOutdated()` vergleicht
Stelle für Stelle (`verOlder()`); daraus bauen `oldNote()` und `upgradeNote()` in
`js/storage.js` je einen Satz, der an die gewohnte Kurzmeldung **angehängt** wird: beim
Laden „liegt in einem älteren Format vor", beim Speichern „ins aktuelle Format überführt".
`upgradeNote()` setzt `fileVersion` dabei zurück — der Satz kommt einmal und nicht bei
jedem weiteren Speichern. Eine **neuere** Datei meldet nichts (das ist der Kanal oben, kein
Fehler), ein frisch angefangenes Buch auch nicht (`emptyState()` setzt `fileVersion=null`).
Der Grund für das Ganze: `migrate()` flickt still, und ein fehlendes Feld — `state.folded`
etwa — ließ dieselbe Anwendung mit zwei Dateien verschieden aussehen, ohne dass jemand
sagen konnte, warum.

**In `desktop/main.js` steht kein Verhalten der Anwendung.** Was dort steht, gilt nur
dafür, dass FINA außerhalb eines Browsers läuft: wohin fremde Links gehen
(`setWindowOpenHandler` / `will-navigate` → `shell.openExternal`), dass `about:blank` — die
ganzseitige Anleitung — als eigenes Fenster erlaubt bleibt, das Menü (ohne `editMenu` gäbe
es auf dem Mac kein Cmd+C) und die Einzelinstanz.

**Nach draußen geht nur `http:` und `https:`** (seit 10.9.26) — in **beiden** Handlern
gleich. `shell.openExternal` reicht die Adresse ans Betriebssystem weiter, und das macht je
nach Adressart etwas ganz anderes daraus als eine Webseite: es öffnet ein fremdes Programm.
Die Popup-Regel prüfte das längst, `will-navigate` gab dagegen jede Adresse weiter, die
nicht mit `file://` anfing. Was nicht durchkommt, wird verworfen; das Fenster bleibt, wo es
ist. **Und das Anleitungsfenster läuft im selben Sandkasten wie das Hauptfenster**
(`sandbox: true`); geprüft, dass sich dadurch nichts an ihm ändert. Wer an FINA etwas ändert, ändert es in
`js/` und `css/`.

## Die fünf Seiten außerhalb der Anwendung

`index.html` (Verkauf), `features.html` (alle Funktionen), `compare.html` (der Vergleich),
`guide.html` (Kurzübersicht) und `datenschutz.html` (die Rechtstexte) sind **keine**
Anwendung: sie laden nichts aus `js/` außer `js/landing.js` und wissen von `state`,
`render()` und `t()` nichts. Gemeinsam sind ihnen `css/tokens.css`, `css/landing.css` und
`js/landing.js` — Kopfzeile, Fußzeile, Sprachschalter, Sprungmenü, Bewegung. **Wer eins
davon ändert, ändert es auf allen fünf.**

**Jede Seite beantwortet genau eine Frage.** `index.html`: „was ist das, und was kostet
es gerade". `features.html`: „was kann das". `compare.html`: „wie steht es neben dem, was
es sonst gibt". `guide.html`: „wie sieht das aus". `datenschutz.html`: „was passiert mit
meinen Daten". Wer zwei davon mischt, beantwortet keine — deshalb sind Funktionen und
Vergleich zwei Seiten und nicht zwei Abschnitte.

### Die Pilotphase ist die Aussage der Seite (seit 23.8.26)

**Es steht kein Preis auf der Seite.** Bis 23.8.26 hatte `index.html` einen Abschnitt
`#preis` mit drei Karten (49 € · 79 €) und einer Ankündigung „FINA Sync ~39 €/Jahr". Der
ist heraus: FINA ist in der Pilotphase **vollständig freigeschaltet und kostenlos**, und
die Stufen sind noch nicht beschlossen (`_BusinessCenter/Marketing und Preise.md`). Eine
Zahl an dieser Stelle wäre eine Zusage, die niemand halten muss — und sie ließe sich
später nur nach unten korrigieren, ohne dass es schlecht aussieht. **Wer wieder eine
einbaut, tut es erst, wenn die Stufen stehen.**

An seiner Stelle steht `#pilot`, seit dem Abend des 23.8.26 als **ein** Kasten:
Überschrift, drei Sätze, darunter `.rules` mit den drei Zusagen — vollständig · Preise
kommen später · es wird noch gebaut. **Kein einziger Knopf**: die drei Plan-Karten mit
drei Knöpfen (`.plans`, `.plan.nop`) sahen aus wie eine Preistabelle und sind heraus;
ihre Regeln bleiben in `css/landing.css` für den Tag, an dem wirklich Preise
angekündigt werden. Der Weg für die Rückmeldung ist **die Umfrage im Programm**
(`js/dialogs/umfrage.js`), kein Formular auf der Seite: es gibt keine E-Mail-Liste, und
die Seite verspricht auch keine.

**Downloads gibt es zur Zeit keine.** Aus `#downloads` wurde `#apps`: die Überschrift
sagt **„Zur Zeit: im Browser."**, darunter drei Kacheln — Browser (führt in die
Anwendung), Telefon (dieselbe Adresse, eigenes Layout, **zum Nachsehen**) und
Mac/Windows als `.gcard.soon`, ein `<div>` und **kein** `<a>`, denn ein Knopf, der
nichts tut, ist schlimmer als kein Knopf.
Der Anker `#apps` bleibt: `download/` leitet als Stub darauf, und der Update-Hinweis
älterer App-Fassungen öffnet diese Adresse. Wer die Apps veröffentlicht, baut die
Kachelgruppen `#mac` / `#win` aus der Historie zurück — die Regeln stehen weiter in
`css/landing.css` (`.dlpanel`, `.dltile`), und Block 4 in
`js/landing.js` steigt von selbst aus, solange es keine `[data-dl]`-Karte gibt.

**Auf dem Telefon ist FINA zum Nachsehen da**, und die Seite sagt es in der zweiten
Kachel von `#apps`. Der Grund steht in `css/mobile.css`:
unter 700 px baut die Anwendung ein eigenes Layout, aber „Daten speichern" gibt es dort
nicht — ohne File System Access schriebe jedes Speichern eine neue Datei in den
Download-Ordner.

**Die Startseite ist bewusst leicht** (seit 23.8.26): ein Satz, was FINA ist; je Ansicht
ein **echtes** Bildschirmfoto aus `doc/img/` — die Jahresmatrix groß und schiebbar im
Kopf, **Monat und Prognose klein nebeneinander** in den `.mini`-Karten (der Monat als
schmale Spalte, unten ausgeblendet; große Bilder waren der Seite zu schwer, lesen kann
man sie per Klick oder in der Anleitung). Die nachgebauten
Ansichten (`.mx`, `.px`, das Innenleben der `.mini`-Karten) sind heraus, sie zeigten das
Chrome von vor dem Mac-Redesign. Die Abschnitte „Drei Zeiten" und „Der Unterschied" sind
gestrichen; ihre Aussage steckt in der Schlagzeile. Und die Akzentfarbe tragen nur die
Handlungs-Elemente — Knöpfe, Weiterlese-Links, Sprungmenü; `.eyebrow` und die
Pilot-Marke im Kopf sind seither grau bzw. ruhig (`css/landing.css`). Alle
Einzelheiten wohnen auf den anderen Seiten. Die Überschrift von `#pilot` bindet die
Zusage an die Pilotphase („In der Pilotphase: alles offen und kostenlos") — ein
uneingeschränktes „kostenlos" wäre ein Versprechen über die Pilotphase hinaus.

### `datenschutz.html`

Der einzige Text auf diesen Seiten, der **rechtlich** stimmen muss. Deshalb gilt dort
zusätzlich:

* **Jeder Satz ist aus dem Code gelesen**, nicht abgeschrieben. Der Kopfkommentar der
  Datei nennt zu jedem Absatz die Stelle, an der die Tatsache steht.
* **Es gibt genau zwei Netzverbindungen**, und beide stehen drin: die Frage nach einer
  laufenden Umfrage (`checkSurvey()`, im Browser **und** in den Apps) und die Frage nach
  einer neueren Fassung (`checkUpdate()`, nur in den Apps). **Kommt eine dritte dazu,
  kommt dort ein Absatz dazu — vorher.**
* **Maßgeblich ist die deutsche Fassung**; das steht auch im Text. Die englische ist eine
  Übersetzung.
* **Noch offen: das Impressum.** Es braucht eine ladungsfähige Anschrift; die steht noch
  nicht fest und fehlt deshalb auch im Abschnitt „Wer verantwortlich ist". Sobald sie da
  ist: dort eintragen und `impressum.html` anlegen — Fußzeile aller fünf Seiten **und**
  der Begrüßungsseite.

Erreichbar ist sie von überall: Fußzeile und Sprungmenü jeder Seite, dazu ein kleiner
Textlink unter den beiden Karten der Begrüßungsseite (`.wlegal`, `wel.privacy`). Der
zeigt auf `PRIVACY_URL` aus `js/config.js` und damit **absolut** auf `fina-app.de`: in der
Mac- und der Windows-App liegt neben dem Web-Client keine zweite Seite, dort ginge ein
relativer Weg ins Leere.

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

**Der Knopf parkt über der Fußzeile** (seit 23.8.26): sobald sie ins Fenster kommt, hebt
`js/landing.js` ihn um ihre sichtbare Höhe an — ganz unten stünde er sonst genau auf dem
Wortzeichen, und die letzte Zeile der Seite bliebe verdeckt.

**Die Liste steht im HTML jeder Seite**, nicht im Skript: nur die Seite weiß, welche
Überschriften sie hat, und beide Sprachen müssen dabei sein. `js/landing.js` schaltet auf
und zu (Klick daneben und Escape schließen) und hebt über einen `IntersectionObserver`
hervor, wo man gerade ist (`.here`). Ein neuer Abschnitt braucht also zwei Zeilen: die
Kennung am `<section>` und den Eintrag im Menü.

**Ein Sprung landet auf der Überschrift** (seit 30.8.26): `section[id]{scroll-margin-top:92px}`
in `css/landing.css`. Die Kopfzeile klebt oben, und ein Anker setzt den Anfang seines
Abschnitts genau an den oberen Fensterrand — also **unter** die Kopfzeile: man kam bisher
im Text an, und die Überschrift, wegen der man gesprungen ist, stand verdeckt darüber. Die
92 px sind ihre Höhe (`.site-header .wrap{min-height:72px}`) plus Luft; **wer die Kopfzeile
höher macht, ändert diese Zahl mit.** Das Maß sitzt am `<section>` und nicht an der
Überschrift: der Sprung zielt auf den Abschnitt, und über der Überschrift steht oft noch
sein Etikett (`.eyebrow`), das mit ins Bild gehört.

### Den Ausschnitt schieben

Zwei Stellen zeigen etwas, das breiter ist als sein Rahmen: das Bildschirmfoto der
Jahresmatrix im Kopf von `index.html` (seit 23.8.26 dasselbe echte Bild wie im Guide —
die nachgebaute Jahrestabelle `.mx` ist heraus) und dasselbe Foto in `guide.html`. Beide
stehen in **Originalgröße** und sind beschnitten; rechts unten liegt die ganze Fläche als
Karte mit einem Rahmen um das, was man sieht. Ziehen verschiebt — auf der Karte wie im
Ausschnitt.

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

## Die JSON-Datei heißt „lokale Datenbank"

**Nach außen ist die Datei des Nutzers seine „lokale Datenbank" / „local database"**
(Lex, 8.9.26); der Dateityp steht nur noch in Klammern dahinter: „Lokale Datenbank öffnen
(JSON-Datei)" / „Open local database (JSON file)". Deutsch mit Bindestrich, Englisch ohne.
FINA hat keine andere Ablage — alles steht in dieser einen Datei, und beim Öffnen richtet
sich die Anwendung nach ihr; „Datei" sagt nur, wie es auf der Platte liegt, „lokale
Datenbank" sagt, was es ist, und „lokal" sagt zugleich das Verkaufsargument.

Umgestellt sind `app.load`, `app.loadTip`, `app.saveTip`, `app.unlink`, `app.unlinkTip`,
`store.unlinked`, `flt.sub`, `set.sub` und die Begrüßungskarte (`wel.open`,
`wel.openHint`). **Noch nicht umgestellt** (mit Lex zu klären): die übrigen Kurzmeldungen
`store.*`, die Verkaufsseiten und `datenschutz.html` — dort steht Rechtstext, jeder Satz
einzeln. **In Code, Kommentaren und Strukturdokumenten bleibt es bei „JSON-Datei"**: dort
ist der Dateityp gemeint und kein Name.

## Die Anwendung heißt FINA Buch / FINA Book

**Nach außen sprachabhängig: `FINA Buch` auf Deutsch, `FINA Book` auf Englisch — im
Fließtext `FINA`.** In der Anwendung setzt `renderChrome()` Wortzeichen und Seitentitel
über `t('app.name')`; im HTML von `fina-online.html` steht nur der englische Rückfall. Auf
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
`fina-online.html`, `index.html`, `guide.html`, dem `download/`-Stub und in
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

**Seit 7.9.26 gibt es drei Reiter: Monat · Jahr · Prognose.** Die Ansicht „Import
Details" (`ui.view='kakeibo'`, `js/views/kakeibo.js`) ist auf Lex' Wunsch **ganz heraus**
— auch mit importierten Zeilen im Buch wird sie nicht gezeigt. Die Datei ist gelöscht,
`VIEWS` in `js/config.js` kennt sie nicht mehr, `render()` schickt eine alte Wahl in die
Prognose, der Sprung „Auswertung öffnen" am Flexibel-Kopf der Monatsansicht ist weg, der
Tastengriff I auch, ebenso `ui.scope`, `ui.kakPick`, `ui.kakDetail`. Was von den
Quellzeilen zu sehen ist, steht im Posten-Fenster („Importdaten zeigen"). `flexTx()`,
`flexKind()` und `hasImport()` in `js/calc.js` bleiben — der Import-Bereich der
Einstellungen fragt danach. **Die beiden folgenden Absätze und der Abschnitt „Woher ein
Wert eines flexiblen Posten stammt" beschreiben den Stand davor** und gelten nur noch als
Geschichte.

`VIEWS` in `js/config.js` ist die Reihenfolge der Reiter — und die Liste selbst hängt am
Zustand: **„Import Details" erscheint nur, wenn einmal importiert wurde**
(`hasImport()` in `js/calc.js`: Quellzeilen an einem Posten (`impRows`) oder eine Quelle
in `state.flexSource`). Der Reiter wertet die Quellzeilen der flexiblen Posten aus
(`flexTx()` baut daraus Buchungen); ohne sie stünde dort eine leere Gliederung. Er steht als **letzter**, nach der Prognose.

**Jeder Reiter hat einen Tastengriff**, `VIEW_KEYS` unten in `js/app.js`:
Strg/Cmd + Umschalt + **M** Monat · **Y** Jahr · **F** Prognose · **I** Import Details
(seit 23.8.26; davor T, davor D). Die Buchstaben folgen den **englischen** Namen und
wechseln deshalb nicht mit der
Sprache — wie B · PT · DD · LP in der Jahresmatrix. Y statt J, weil „Year"; F für
„Forecast"; I für „Import Details" — auf ausdrücklichen Wunsch, obwohl der Browser
Strg/Cmd+Umschalt+I meist selbst für die Entwicklerwerkzeuge nimmt und der Griff dann nur
in den beiden Apps ankommt. Wer einen Reiter hinzufügt,
trägt ihn dort ein. **Gesprungen wird nur in Reiter, die es gerade gibt** — der Griff prüft
`VIEWS`, sonst führte I ohne Import in eine Ansicht ohne Reiter.

**Und die Monate haben ihren eigenen Griff**, gleich darunter in `js/app.js`: Strg/Cmd +
**←** / **→** geht in der Monatsansicht einen Monat zurück oder weiter. **Nur dort** — in den
anderen drei Ansichten wählt kein Reiter einen Monat, und in Jahresmatrix und Prognose gehört
der Pfeil dem Rollen. Am Rand ist Schluss (Januar, Dezember), wie bei den Knöpfen der
Flexible Payments; **verbraucht wird der Druck trotzdem**, denn Cmd + ← ist im Browser sonst
der Weg zurück. **Das Suchfeld bleibt ausdrücklich nicht außen vor**: es ist das einzige
Eingabefeld der Ansicht, und der Fokus steht fast immer darin — gerade dann, wenn man einen
Posten durch die Monate verfolgt. Wie beim Klick auf den Reiter bleibt er dort
(`keepQFocus()`). Genannt wird der Griff in der Sprechblase jedes Monatsreiters
(`month.keyTip`); die Pfeile stehen in beiden Sprachen gleich da.

**Jeder Reiter nennt seinen Griff in der Sprechblase** (`view.keyTip`, gesetzt in
`renderChrome()` über `viewKey(k)`). Ein Griff, den niemand findet, gibt es nicht — und die
Sprechblase ist die einzige Stelle, an der die vier Buchstaben stehen; eine eigene Zeile
dafür wäre den Platz nicht wert.

Daraus folgen drei Stellen, die zusammengehören:

* **Der Weg zum Import darf nicht in diesem Reiter liegen.** Importiert wird über das
  Menü der Kopfzeile (`#btnImportCsv` → `openCsvWizard()`, siehe „Der CSV-Import"); die
  Einstellungen haben seit 6.9.26 keinen Import-Knopf mehr, und der alte Fast-Budget-Weg
  (`js/csv.js`, `js/dialogs/csv-import.js`) ist samt Tabellenimport (`js/sheet.js`) weg.
* **`render()` lenkt um.** Steht `ui.view` noch auf `'kakeibo'`, obwohl es den Reiter nicht
  mehr gibt (Datei getrennt, Datei ohne Buchungen), wäre kein Reiter ausgewählt — dann
  tritt die Prognose an seine Stelle.
* **Was in den Reiter springt, prüft `hasImport()` mit.** In der Monatsansicht erscheint
  der Knopf „Auswertung öffnen" (`data-kview`) nur mit Import.

Der Name des Reiters (`view.kakeibo`) ist nicht der Name der Geldart. Für die drei Blöcke,
die Kategorien und alles, was „Flexible Payments" als Art von Geld meint, steht `g.flex`.

## Woher ein Wert eines flexiblen Posten stammt

Hinter dem Namen des Posten steht in „Import Details" **in Klammern**, woher der Betrag
kommt: `flexKind(it,m)` in `js/calc.js` liefert `imp` · `done` · `fix` · `est` · `none`
(aus dem Import · abgehakt · fest eingetippt · geschätzt · kein Betrag), gebaut wird die
Marke in `kindTag()` in `js/views/kakeibo.js`, beschriftet über `FLEX_KIND_LABEL` und die
Schlüssel `kak.kImp` … `kak.kEst`. Die Regel ist dieselbe wie beim Statuskreis eines
Posten: Import (`it.imp[m-1]`) vor Haken vor Betrag.

**Eine Marke „korrigiert" gibt es seit 6.9.26 nicht mehr.** Sie gehörte zum alten Modell
(`override` neben `flexActual`); jetzt ist der importierte Betrag der Betrag des Posten,
und wer ihn im Fenster anfasst, nimmt damit den Import zurück (siehe „Importiert ist ein
eigener Stand"). Ein alter Korrekturwert wird beim Öffnen als Betrag übernommen
(`migrateKak()`).

**Eine eigene Spalte ist es nicht.** In der Klammer trägt die Marke keinen Rahmen (`.kinds`,
`.kk`, `.ksep` in `css/ledger.css`): die Klammer fasst schon zusammen, es bleibt die Farbe.
Bei einem einzelnen Monat steht ein Wort, beim ganzen Jahr je Art eine Marke mit der Zahl
der Monate, die häufigste zuerst; Monate ohne Betrag zählen nicht mit. Was die Wörter
bedeuten, sagt die Marke selbst als Sprechblase (`kak.kindTip`, `data-tip` an `.kinds`).

**Der Weg zurück ins Jetzt** steht gleich hinter der Monatsauswahl: `data-kmonth="cur"`
setzt `ui.month=CUR` und `ui.scope='monat'` (`kak.cur`, gesperrt, wenn der laufende Monat
schon gewählt ist).

## Die Spalten der Prognose

Eine Zeile liest sich wie ein Kontoauszug des Monats: **womit er anfängt, was ihn bewegt,
womit er schließt.**

| M | START | IN · REG · FLEX · COR | SUM | PROG |
|---|---|---|---|---|
| Monat | Stand, den der Monat vorfindet | die vier Bewegungen | ihre Summe | Stand danach |

`START` einer Zeile ist `PROG` der Zeile darüber, im Januar der Anfangsbestand — und er ist
zugleich der Anfang des Balkens daneben. Beides kommt aus derselben Zahl (`start` in
`viewPrognose()`), damit Tabelle und Grafik nicht auseinanderlaufen können.

**`SUM` sagt, wie der Monat abgeschlossen hat** (seit 30.8.26): die Summe seiner vier
Bewegungen, also `saldo(m)` — dieselbe Zahl, die die Jahresmatrix „Saldo je Monat" nennt
und die Monatsansicht als vierte Kachel zeigt, und zugleich der Unterschied zwischen
`START` und `PROG` in dieser Zeile. Sie trägt `--bg-sal` (Klasse `salcol`), das Violett
von „alles zusammen". In der Zeile des Anfangsbestands bleibt sie leer: er ist keine
Bewegung eines Monats.

**Es gab die Spalte schon einmal, als „BAL", und sie stand falsch.** Damals stand sie
**statt** des Kontostands ganz links, und man las eine Summe, die es auf keinem Konto
gibt. Der Fehler war der Platz, nicht die Zahl: jetzt steht sie **vor** dem Kontostand, in
der Leserichtung der Zeile — die vier Bewegungen, ihre Summe, und was daraus für das Konto
wird.

**`END` heißt seit 30.8.26 `PROG`**, in beiden Sprachen (`prog.colEnd`; wie „Fast Budget"
und wie B · PT · DD · LP wechselt das Wort nicht mit der Sprache). „END" las sich wie das
Ende des Monats — also wie die Schlusssumme, die daneben jetzt als SUM steht. Es ist aber
der **Kontostand**, und über zwölf Zeilen gelesen ist die Spalte die Entwicklung der
Finanzen über das Jahr: genau das, was der Verlauf daneben zeichnet. Der Klassenname
`endcol` bleibt — er sagt nur, welche Spalte gemeint ist.

**Zwischen PROG und der Grafik steht eine kräftigere Linie** (2 px `--rule-strong`): links
wird gelesen, rechts gemessen, und die Haarlinie zwischen zwei Zahlenspalten sagte das
nicht. Sie sitzt an **PROG** und nicht an der Grafik — PROG klebt beim seitlichen Rollen
(siehe unten), und eine Linie an der Grafik wanderte darunter weg. Mobil trägt sie die
zusammengelegte Zelle (`.mlead`).

**Jede Bewegung trägt die Farbe ihrer Geldart.** Die vier mittleren Spalten bekommen den
hellen Grund, den dieselbe Geldart überall trägt — `--bg-in` · `--bg-out` · `--bg-flex` ·
`--bg-bal`, dieselben Farben wie die Kennzahlen darüber und die Karten der Monatsansicht. In
einer Tabelle aus sieben Zahlenspalten sagt die Farbe schneller als die Überschrift, was man
gerade liest. Die Klassen stehen in `PROG_COLS` (Kopf) **und** an den Zellen der Zeile
(`incol` · `outcol` · `flexcol` · `balcol` · `endcol`, gefärbt in `css/ledger.css`): gefärbt
wird die ganze Spalte, Kopfzelle eingeschlossen, sonst liest sie sich als zwölf getönte
Zellen statt als ein Streifen.

**`START` und `PROG` bleiben ungefärbt** — beides sind Stände und keine Bewegungen: der eine,
mit dem der Monat anfängt, der andere, mit dem er schließt, und derselbe Wert steht eine
Zeile tiefer wieder unter `START`. Zwei Spalten, die dasselbe sagen, sollen auch gleich
aussehen; `END` trug bis 22.8.26 das Violett `--bg-sal` und las sich damit wie eine eigene
Geldart. **Seit 30.8.26 trägt `SUM` dieses Violett** — dort ist es richtig: die Spalte
fasst die vier Geldarten zusammen, statt einen Stand zu nennen. **Gesetzt ist sein Grund trotzdem** (`--paper-2`, genau das, was unter einer
ungefärbten Zelle steht): die Spalte klebt beim seitlichen Rollen, und eine durchsichtige
Zelle ließe die Spalten darunter hindurchziehen. Die Monatsspalte trägt ihren deckenden
Grund aus demselben Grund.

**Zwei Spalten bleiben beim seitlichen Rollen stehen.** Die Monatsspalte klebt am linken
Rand (`td:first-child`, `left:0`) — eine Zahl ohne ihren Monat ist keine Zeile mehr. Und
**PROG klebt daneben**, sobald es dort ankommt (`left:calc(var(--progleadw) - 1px)`, also die
Breite der Monatsspalte **minus ein Pixel**): der Stand zum Monatsende ist die Zahl, gegen die man den Balken daneben
liest, und beim Rollen nach rechts wanderte sie als erste aus dem Bild. Weil `position:sticky`
erst greift, wenn die Zelle diese Stelle erreicht, **löst sie sich beim Zurückrollen von
selbst wieder ab** und steht wieder in ihrer Reihe. Dafür braucht sie einen deckenden Grund
(`--paper-2`) und eine Stufe unter der Monatsspalte (`z-index` 1 gegen 2). **Das eine Pixel
Überlappung ist Absicht:** rechnerisch stoßen die beiden Spalten genau aneinander, der
Browser rundet beim Rollen aber die Lage der klebenden Zelle und die der Tabelle darunter
verschieden — bei manchen Rollständen klafft dann eine 1-px-Fuge, durch die die Balken der
Grafik hindurchziehen (nachgemessen bei `scrollLeft` 617,4 und 700,6). END setzt sich
deshalb ein Pixel unter die Monatsspalte, die es zudeckt.

**Der laufende Monat ist auch in der Balkenspalte eingefasst.** Die beiden roten Linien sind
sonst ein `inset`-Schatten an der Zelle (`tr.now td`); in `.flowcell` liegen Zonen, Raster
und Balken als eigene Kinder darüber und decken ihn zu. Dort zeichnet sie deshalb
`tr.now td.flowcell::after` — ein Pseudo-Element ist das letzte Kind und liegt damit über
allem, `pointer-events:none` lässt die Sprechblasen der Balken in Ruhe.

**Vorher standen dort „BAL" und „CUM"** — die Summe der Bewegungen und der laufende Stand.
Dieselbe Rechnung, aber die falsche Erzählung: die Zahl, die man im Balken daneben sieht,
ist der **Kontostand**, und der stand ganz rechts, während links eine Summe stand, die es
auf keinem Konto gibt. Wer in einem Monat −823,97 las und im Balken das Konto bei 5.422 sah,
musste beides erst zusammenrechnen und hielt die Grafik für falsch. Seit 30.8.26 gibt es
die Summe der Bewegungen wieder als Spalte — als `SUM`, **vor** dem Kontostand statt an
seiner Stelle (siehe „Die Spalten der Prognose").

## Was sich in der Prognose ändern lässt

Die Prognose rechnet, sie führt keine Werte — mit **zwei** Ausnahmen, und beide sind
Doppelklicks auf die Zahl selbst. Wo eine Zahl steht, soll auch der Weg zu ihr sein; sonst
wechselt man die Ansicht, um etwas zu ändern, das man gerade ansieht.

* **Spalte COR, eine Monatszeile** → die Saldokorrektur dieses Monats, dasselbe Fenster und
  dieselbe Hervorhebung wie ein Doppelklick auf ihre Zeile in der Jahresmatrix. Gebaut in
  `corEdit(m)` (`js/views/prognose.js`): `dblItem(state.balance.id)` **an der Zelle**, dazu
  `data-m` — verdrahtet ist das schon (siehe die Ausnahme unter Regel 1). Die COR-Zelle der
  Anfangsbestandszeile bleibt außen vor: sie gehört keinem Monat.
* **Spalte PROG, die Zeile „Anfangsbestand"** → das Einstellungsfenster, Bereich
  „Allgemein", mit der Schreibmarke in `#sOpen` und dem Wert markiert. Das Merkmal ist
  `data-opening`, verdrahtet in `wire()`; es öffnet `openSettings('sOpen')`. Der
  Anfangsbestand ist eine Einstellung und hat kein eigenes Fenster (siehe „Der
  Anfangsbestand"), diese Zeile ist aber die einzige Stelle, an der er in einer Ansicht
  steht. **Nur diese eine Zelle**: PROG einer Monatszeile ist eine gerechnete Summe.

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

Die rechte Karte zeigt je flexiblem Posten zwei **gerechnete** Zahlen: die Annahme, mit
der gerechnet wird (sein Betrag im laufenden Monat, `it.amounts[CUR-1]`), und den
Durchschnitt der feststehenden Monate (`avgActual`). **Beide sind nur zu lesen, und die Ansicht schreibt nichts.** Getippt wurde
die Annahme früher an dieser Stelle, und jedes Zeichen schrieb sich sofort in alle zwölf
Monate — auch in vergangene und ohne Rückfrage. Einen Knopf, der den Ø in einem Zug
übernimmt, gibt es ebenfalls nicht mehr: welcher Monat welchen Betrag bekommt, entscheidet
sich dort, wo die zwölf Monate stehen.

Geändert wird die Annahme also nur im Posten-Fenster (Stift oder Doppelklick). Unter der
Tabelle steht stattdessen `.calchint` — drei Sätze, die sagen, woher die beiden Spalten
kommen (`prog.howCurrent`, `prog.howAvg`, `prog.howEdit`). Wer die Grundlage des
Durchschnitts ändert (`avgMonths` in `js/calc.js`), ändert diese drei Sätze mit — sie
beschreiben genau das.

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
  für den Schnitt dreht, dreht an beiden Ansichten. `force` schneidet ohne zu fragen — die
  Achse läuft dann über die Werte selbst und nimmt die Null nur mit, wenn sie zwischen ihnen
  liegt. **Der Zeitstrahl tut das ausnahmslos**, das Jahr nur mit gesetztem Anfangsbestand
  (siehe unten); die Grenze der halben Breite gilt damit nur noch dem Jahr ohne ihn.
* **Die Anteile eines Balkens** — `flowParts()` und `FLOW_LABEL` in `js/ui.js`. Sie standen
  früher in `js/views/monat.js`; dort hinge die Prognose unsichtbar an der Monatsansicht.
* **Der abgeschnittene erste Balken.** Im Monat ist es die Monatseröffnung, im Jahr der
  Januar — beide franst die Ansicht zum Rand hin aus. Der Monat färbt dafür den Hintergrund
  (`.tsum.cutl/.cutr`), das Jahr braucht eine **Maske** (`.ytrack .tup.cutl` …): sein Balken
  besteht aus mehreren Farben, ein Verlauf im Hintergrund käme dort nicht an.

**Ohne Anfangsbestand** ist der Stand vor dem Januar die Null, an der sein Balken anfängt,
und **kein Wert des Jahres** — `yearScale()` lässt ihn für den Maßstab dann weg (`f.m!==1`),
genau wie `flowScale()` die ganze Zeile „Monatseröffnung". Zählte er mit, spannte die Achse immer von
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

**Der farbige Grund ragt nicht über die Zeilentrennung, die Linien schon.** Eine Rasterlinie
muss durchgehen, sonst hat sie alle 38 px eine Lücke (`bottom:-1px` an `.tgrid` / `.tzero`).
Die Zonen dürfen das **nicht**: sie sind so breit wie die Spalte, und die liegt beim Rollen
zum Teil unter der klebenden PROG-Spalte — ein Pixel Überstand malte dort quer über deren
Trennlinie, sichtbar als Rest der Spalte, die gerade darunter wegscrollt. Über die
Stapelfolge ist das nicht zu lösen: der Grund einer Tabellenzelle wird früh gezeichnet, ein
absolut gesetztes Kind einer anderen Zelle später — auch ein eigener Überzug mit `z-index`
ändert daran nichts (geprüft). Dadurch trägt die Grafik zwischen zwei Monaten dieselbe feine
Linie wie jede andere Spalte.

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
der die Spalte PROG abschließt (seit 30.8.26 2 px stark, siehe oben). Die Grafik zeichnet
die äußeren beiden Linien deshalb
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

Die Fläche trägt denselben Grund wie der Zeitstrahl — links der Null rot, rechts grün
(`rails` in `viewPrognose()`); die Zonen liegen wie das Raster in der **Zelle** und nicht im
Balken, sonst hörten sie nach 19 px auf.

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

**Beim Filtern verschwindet dagegen ein Block, in dem keine Zeile übrig bleibt** —
mitsamt der Leerzeile davor (`keepSec()` in `viewJahr()`, gemeint sind das Suchfeld und
„Abgeschlossene ausblenden"). Zwölf Nullen unter einer Überschrift sind keine Auskunft, sie
nehmen nur den Platz weg, den die gefundenen Zeilen brauchen. **Ohne Filter bleibt der
Block stehen**, auch leer: dort sagt er, dass es ihn gibt. Die Gesamtzeile ist davon
ausgenommen, sie gehört zum Gerüst (siehe oben).

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
Monatsende steht, sagt die **Prognose** in der Spalte `PROG` — dort steht es neben dem
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

Links das Suchfeld mit dem ✕, direkt dahinter „Filteroptionen…", dann **dieselben drei
Aufklappmenüs wie im Monat** — Bereich · Fälligkeit · Zahlungsstand (`fltDrop()`, seit
6.9.26 auch hier; sie wirkten in der Jahresansicht schon vorher, waren dort aber nicht zu
sehen) —, rechts abgesetzt die beiden Knöpfe, die ebenfalls filtern („Abgeschlossene
Monate ausblenden", „Erledigte Posten ausblenden").
Was die Zeichen ✓ und ? bedeuten, steht **nirgends mehr als Zeile**: die `.viewkey` neben
den Ansichtsreitern ist seit 22.8.26 weg (sie stritt dort mit dem Dateinamen um den
Platz) — die Siegel erklären ihre Sprechblasen und die Anleitung.

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

**Beide gelten seit 30.8.26 nur der Sitzung**, und beide haben in der Datei eine
**Vorgabe fürs Öffnen** — oder gar nichts. Sie sind keine Filter: sie räumen ab, was
fertig ist; nur einer von beiden nimmt dabei **Zeilen** weg:

| Knopf | nimmt weg | Klick setzt | Vorgabe fürs Öffnen |
|---|---|---|---|
| „Abgeschlossene Monate ausblenden" | Spalten (abgerechnete Monate) | `ui.hideDone` | `state.hideDoneMonths` (Einstellungen → Darstellung) |
| „Erledigte Posten ausblenden" | Zeilen (bezahlte Posten) | `ui.hideSettled` | keine — fängt immer offen an |

Beide Klicks rufen nur `render()`, **kein `save()`**: was beim Arbeiten umgeschaltet wird,
geht die Datei nichts an. Bis 22.8.26 stand auch „Erledigte Posten ausblenden" in der
Datei; `migrate()` **löscht** das alte Feld (`delete s.hideSettled`), sonst schriebe
`stateJson()` es bei jedem Speichern wieder hinaus.

**Bis 30.8.26 schrieb „Abgeschlossene Monate ausblenden" unmittelbar in die Datei**, und
das war als Unterschied gedacht: Spalten wegzunehmen versteckt nichts, was noch aussteht.
Nur standen damit zwei Knöpfe nebeneinander, von denen einer die Datei ändert und der
andere nicht — das ist nicht zu erraten, und ein Buch wurde vom bloßen Aufräumen der
Ansicht schmutzig. Jetzt tun beide dasselbe; wer den Anfangszustand festlegen will, tut es
dort, wo die Angaben der Datei beisammenstehen (siehe „Der Bereich „Darstellung""). Das
Feld `state.hideDoneMonths` bleibt, wie es heißt und wo es steht — nur seine Bedeutung
wechselte von „gerade ausgeblendet" zu „geht ausgeblendet auf", und für den Nutzer ist das
beim nächsten Öffnen dasselbe Bild.

**Gelesen wird die Vorgabe genau einmal**, in `afterLoad()` (`ui.hideDone=!!state.hideDoneMonths`),
wie `ui.ana` aus `state.anaOpen`. `visMonths()` in `js/views/jahr.js` liest seitdem
`ui.hideDone` und nicht mehr den Zustand; wer eine weitere Stelle baut, die Monate
ausblendet, liest ebenfalls dort. **Auch `doc/make-shots.py` hängt daran**: `all=1` setzt
beide zurück.

**Vorgabe ist beides `false`:** eine frisch geöffnete Datei zeigt alles. In der Datei
stehen daneben nur noch die zugeklappten Bereiche — `state.folded` und `state.foldedYear`
(siehe unten); alles andere (Monatsfilter, Suchfeld, gewählter Monat) bleibt in `ui` und
damit ungespeichert.

**In der Leiste stehen sie abgesetzt am rechten Rand** (`.ybhide`, `margin-left:auto` in
`css/layout.css`): Suchfeld und „Filteroptionen…" links, die beiden rechts. Zwischen ihnen
liegt Luft und **keine** Trennlinie — eine Linie machte aus ihnen die nächste
Filtergruppe, und filtern tun sie gerade nicht.

**Gedrückt tragen sie Tinte, gleich ob die Zeile leuchtet.** Der dunkle Grund hing bis
22.8.26 an `.on`, also am Suchbegriff — und weil diese beiden die Zeile ausdrücklich nicht
anleuchten, sagten sie nur zufällig, dass sie gelten (siehe „Das Mac-Chrome").

**Und sie sperren das Zuklappen nicht.** Wer einen von beiden drückt, hat kein Ziel, das
in einem zugeklappten Block stecken könnte — er räumt ab, was fertig ist. Gesperrt wird
allein am Suchbegriff (`foldLock` in `viewJahr()`, siehe „Was das Klappen überschreibt").

## Die Auswertung über der Monatsansicht

Über den Karten steht eine einzige dünne Zeile mit den vier Zahlen des Monats — Einnahmen,
Flexible Payments, regelmäßige Kosten, noch offen.

**Die vierte Kachel ist der Saldo des Monats** (seit 30.8.26): alles, was der Monat
bringt, und alles, was er kostet — Einnahmen, Flexible Payments, regelmäßige Kosten und
die Saldokorrektur. Also **dieselbe Zahl**, die die oberste Zeile der Jahresmatrix nennt
(`year.totalRow`, „Saldo je Monat") und die auf dem Telefon als SALDO-Kachel steht;
deshalb derselbe Name (`month.kpiSaldo`) und dieselbe Farbe — `--bg-sal`, das helle
Violett, das in FINA „alles zusammen" heißt (Klasse `t-sal`). **Nicht** das Blau der
Saldokorrektur: die ist eine der vier Zahlen darin.

Bis dahin stand hier **„Noch offen"** — die Summe dessen, was noch nicht abgehakt ist,
Posten und Flexible-Payments-Kategorien zusammen. Das war eine Zahl über den Fortschritt
der Arbeit, während die drei Kacheln daneben von Geld handeln; und ob der Monat ins Plus
oder ins Minus läuft, sagte keine von ihnen. Die Schlüssel `month.kpiOpen`,
`month.kpiOpenN` und `month.kpiUnclear` bleiben in `js/i18n.js`. Die **mobile** Leiste
(`mobileTop()`) zeigt seit 6.9.26 dieselben vier Kacheln in 2 × 2: oben Einnahmen und
Saldo, unten Regulär und Flexibel — die erste Zeile trägt die beiden Zahlen, die man
zuerst wissen will.

**Es sind die Zahlen der Zeilen, die darunter stehen**, nicht die des ganzen Monats: wird
gefiltert, rechnet die Leiste mit (siehe „Was ein Filter mit den Summen macht") — der
Saldo einer nach Einnahmen gefilterten Ansicht ist die Summe der Einnahmen. Und klein **darüber** die Überschrift
„Auswertung" (`.analab`). **Ein Kontostand steht dort nicht:** den zeigt die Jahresansicht,
wo er neben den elf anderen Monaten steht und sich lesen lässt; hier stünde er allein und
ohne Vergleich. Was der Monat mit dem Konto macht, sagt der Zeitstrahl darunter, Zeile für
Zeile. Sie ist kein Kästchen in der Reihe: sie benennt die
Leiste, sie ist keine Kennzahl. Ein Klick irgendwo darauf klappt sie auf, und darunter
erscheint der Zeitstrahl. **Einen festen Pfeil trägt sie nicht** — seit 6.9.26 fährt beim
Überfahren (oder Tastaturfokus) in der **ersten** Kachel ein Klapp-Pfeil heraus
(`.anaarrow`, `data-hk="ana"`, siehe „Bewegung"): die Zeile ist eine Reihe aus Zahlen, ein
fester Pfeil davor läse sich wie eine fünfte Angabe, und ein Pfeil je Kachel sähe nach vier
Klappen aus. Ob sie offen ist, sagt der Zeitstrahl selbst; für Tastatur und Vorlesehilfe
steht es in `aria-expanded`. Gebaut wird sie in `anaBar()` / `timeline()` in
`js/views/monat.js`.

**Die Leiste hat drei Stücke, und die Auswertung ist das letzte:** Filterzeile ·
Monatsleiste · Auswertung (`anaBar()`). Die Filterzeile dockt oben an der Kopfzeile an, die
Auswertung steht direkt über den Karten, die sie zusammenfasst; zwischen den drei
Stücken liegen je 10 px — so viel, wie die Bereiche voneinander haben.

**Die vier Zahlen zählen sich um, statt zu springen** (Lex, 8.9.26): wer tippt oder einen
Bereich wählt, sieht dort andere Summen — 1.800,00 im einen Bild und 100,00 im nächsten
sagte nicht, dass es dieselbe Zahl ist, die gerade kleiner wird. `animNums()` in `js/ui.js`
(gerufen am Ende von `wire()`) dreht sie in 500 ms weich herunter (`NUM_MS`; bis 10.9.26
360 ms — das las sich wieder wie ein Sprung); die Kachel trägt dafür
`data-num` (ihre Geldart als Schlüssel) und `data-v` (den Zielwert), gesetzt in `cell()`
und in `tile()` der mobilen Leiste. **Angefangen wird bei dem, was gerade dasteht** —
`numShown` hält den angezeigten Stand und wird in jedem Bild nachgeführt: wer schnell
tippt, zeichnet bei jedem Zeichen neu, und die nächste Zahl läuft dort weiter, wo die
vorige unterwegs war. **Nicht animiert wird der Wechsel des Bildes** (anderer Monat,
andere Ansicht, frisch geöffnetes Buch — `numScope`): dort ist es keine Änderung derselben
Zahl. Dass hier ausnahmsweise Text bewegt wird und nicht `transform`/`opacity`, geht: die
Kacheln stehen in einem Raster aus gleich breiten Spalten, die Zahl darin darf also
beliebig lang werden, ohne dass sich etwas verschiebt.

**Es sind zwei `.stickybar` und nicht eine** (Lex, 8.9.26): die Filterzeile allein ist der
**Top-Bereich** (`viewtop`) und bleibt beim Ansichtswechsel stehen; Monatsleiste und
Auswertung stehen in einer zweiten Leiste (`.anasub`), die unter ihr klebt und mit der
Ansicht mitfährt — sie sind Inhalt und nicht Kopfzeile (siehe „Bewegung"). Beide bleiben
beim Scrollen unter der Kopfzeile stehen; ihre `top`-Maße stapelt `syncStickyTops()`.

**Womit sie aufgeht, sagt die Datei** — `state.anaOpen`, ein Haken im Einstellungsfenster
unter „Darstellung" (`#sAna`, `set.ana`). Von Haus aus ist er aus: die Leiste nimmt oben
dauerhaft Platz weg, den die Liste darunter braucht. Gelesen wird er **einmal beim Öffnen**
(`afterLoad()` setzt `ui.ana` darauf); danach entscheidet der Klick auf die Leiste, und
zwar nur für diese Sitzung — geschrieben wird dabei nichts, beim nächsten Öffnen gilt
wieder der Haken. Er selbst wirkt sofort, aber **nur wenn er im Fenster geändert wurde**
(`applyGeneral()`): sonst risse ein Speichern in den Einstellungen die Leiste zu, die man
vorher von Hand aufgeklappt hat. `ui.ana` bleibt also die Anzeige, `state.anaOpen` die
Einstellung. Die Zahlenzeile ist **ein**
Knopf (`data-ana`); in den Kästchen steht deshalb nichts weiter Anklickbares, nur
`data-tip`. Die Filterzeile steht daneben, nicht darin — sie hat ihre eigenen Knöpfe.

**Der Zeitstrahl teilt den Monat in fünf Zeilen** — Monatseröffnung, Monatsanfang,
Monatsmitte, Monatsende, Monatsabschluss. **Vor jedem Namen steht sein Zeichen** (seit
6.9.26): dieselben Masken wie im Aufklappmenü „Fälligkeit" (`--ic-due-*`, `data-ic` an der
`.tname`, gesetzt in `tlLabel()`), damit man Zeile und Filter als dasselbe erkennt; die
Monatseröffnung hat kein Menü und trägt das Spiegelbild des Abschlusses (`--ic-due-p`).
Jede Zeile nennt links ihren Namen samt Tagen
(1.–10., 11.–20., ab dem 21.), dann die Veränderung und den Kontostand danach; rechts
steht über die ganze übrige Breite ihr Balken. Gerechnet wird das in `monthFlow()`
(`js/calc.js`) aus der Fälligkeit der einzelnen Positionen — und zwar aus denen, die der
Filter übrig lässt (`sel`, siehe „Was ein Filter mit den Summen macht").

Die Tage stehen deshalb in der Beschriftung und nicht mehr als Leiste darunter: die Breite
gehört jetzt dem Betrag, nicht der Zeit. Fällt der heutige Tag in eine Zeile, trägt sie
die Marke „Jetzt" (`month.tlNow`) — sie bezeichnet den Abschnitt, in dem man gerade steht,
und nicht einen einzelnen Tag; deshalb nicht „Heute". **Mit einer Ausnahme** (seit
26.8.30): steht man in den letzten Tagen und am Monatsende ist kein Eintrag mehr offen,
rückt die Marke auf den Monatsabschluss — erledigt ist erledigt, was bleibt, ist das
Abschließen. Entschieden wird das in `tlNowKey()` (`js/views/monat.js`), und zwar über den
**ganzen** Monat (`dueIn`), nicht über die gefilterte Auswahl: ein Filter soll die Marke
nicht verschieben. Sie steht in der Hervorhebungsfarbe
(`.tnow`) — Rahmen und Schrift in `--accent-2`, der Grund durchsichtig: gefüllt und rot
wäre sie eine Warnung.

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

**Gespannt wird die Achse über die Bewegungen des Monats — immer** (`spanScale(…,true)`).
Die vier Abschnitte sind, was der Monat tut; die Fläche gehört ihnen, mit 8 % Luft an beiden
Enden. Für den Maßstab zählt deshalb die **ganze erste Zeile nicht** (`if(f.key==='P')
return` in `flowScale()`): ihr Wert steht ohnehin darin, denn er ist der Anfang des ersten
Abschnitts — nur die Strecke von der Null bis dorthin bleibt draußen.

**Die Monatseröffnung ist damit ein Hinweis und kein Maß.** Ihr Balken wird in die gezoomte
Fläche hineingezeichnet: liegt die Null darin, fängt er an ihr an; liegt sie außerhalb,
reicht er bis an den Rand und **franst dort aus** (`.tsum.cutl` / `.cutr` in
`css/layout.css`, ein Farbverlauf ins Durchsichtige), und der Maßstab steht am Ende der
Farberklärung. Ohne beides läse man die Länge dieses Balkens als seinen ganzen Betrag.
Ausgefranst wird an der Seite, an der die Null hinausfällt — bei einem Guthaben links, bei
einem Minus rechts. **Eine Marke an dieser Stelle wäre die falsche Aussage:** sie behauptet
eine Kante, wo der Balken gerade keine hat, und sie musste den Balken abdunkeln, um selbst
sichtbar zu bleiben. Der Verlauf sagt dasselbe, ohne etwas zu behaupten, und der Balken
bleibt so kräftig wie jeder andere.

**Ob die Null im Bild ist, entscheidet der Monat und nicht die Grafik.** Berührt er sie,
steht sie als kräftige Linie zwischen Rot und Grün; sonst ist die Fläche eine einzige Zone.
Die Frage stellt `timeline()` einmal (`zout = zero<0 || zero>100`) und reicht die Antwort an
**vier** Stellen weiter: die Nulllinie, das Raster (an der Null keine zweite Linie), das
Ausfransen in `flowTrack()` und den Maßstab in der Farberklärung. Wer eine davon anders
fragt, lässt sie etwas anderes behaupten als die Fläche daneben.

Vorher entschied das eine **Grenze**: bekamen die Bewegungen nicht wenigstens die halbe
Breite, wurde beschnitten, sonst reichte die Achse bis zur Null. Damit sprang der Maßstab —
derselbe Monat las sich vor und nach einer Buchung nach zwei verschiedenen Achsen, je
nachdem, auf welcher Seite der Hälfte er gerade lag. Die Regel gibt es weiterhin, aber nur
noch für den Verlauf über das Jahr **ohne** Anfangsbestand (siehe „Die Spalte „Verlauf""
und `force` in `spanScale()`).

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
der unteren Hälfte der Zeile; gibt es nur eine Richtung, steht sie in der Mitte (`.solo`).
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
Zeilen eine Farberklärung (`.thint`). Ein Erklärsatz über der Grafik steht dort **nicht
mehr** (`.anafilter` und `month.anaFilterHint` sind seit 18.8.26 gestrichen): was ein
Klick tut, zeigt der erste Klick, und ein zweiter nimmt ihn zurück.

**Ein Balken ist 5 px hoch, und alle Zeilen sind gleich hoch** — gefiltert wie ungefiltert,
in **jeder** Zeile derselben Fläche. Das Maß ist `--nbars`, die Höhe in Balken: es steht am
`.tline` (gesetzt aus `TL_MINBARS` in `js/views/monat.js`), die Zeile rechnet daraus ihre
Mindesthöhe (`.tline .trow:not(.taxis)` in `css/layout.css`). Die drei Größen `--bh`,
`--bgap` und `--bpad` stehen aus demselben Grund ebenfalls am `.tline` und nicht mehr am
einzelnen `.ttrack`: Zeile und Balken müssen mit denselben Zahlen rechnen. **Der Verlauf
der Prognose ist genauso hoch** (`.ytrack`, seit 20.8.26 ebenfalls 5 px): es ist dieselbe
Grafik, eine Ebene höher, und zwei Dicken nebeneinander läsen sich als zwei verschiedene
Maße. Nur sein Polster bleibt eigen (`--bpad:3px`) — der kräftige Strich des Kontostands
soll über die Balken hinausreichen —, und seine Zeilenhöhe gibt die Tabelle vor, nicht
`--nbars`.

**Drei Balken passen hinein, auch wo nur einer steht.** Braucht eine einzige Zeile mehr —
gefiltert können in einem Abschnitt alle vier Geldarten stehen —, wachsen **alle** Zeilen
mit: eine Fläche, deren Zeilen verschieden hoch sind, springt bei jedem Wechsel des
Abschnitts. Deshalb ist `--nbars` ein Wert für die ganze Fläche und keiner je Zeile.

**Die Balken stehen mittig in ihrer Zeile** — untereinander, aber als **Gruppe** in der
Mitte. Nimmt ein Filter den zweiten Balken weg, klebte der übrige sonst oben, als fehlte
darunter noch einer. Gerechnet wird von der Mitte aus (`top:50%` und eine Verschiebung um
die halbe Gruppenhöhe), nicht vom Polster: die Zeile darf höher sein als ihre Balken. Für
die beiden festen Fälle des Wasserfalls steht die Rechnung in `css/layout.css`, für die
gefilterte Fassung in `partLine()` — dort steht die Zahl der Balken erst zur Laufzeit fest.

**Die Balkenfläche füllt ihre Zeile ganz** (`align-self:stretch` an `.tline .ttrack`), und
die Zeile hat kein senkrechtes Polster mehr — die vier Pixel Luft stecken in ihrer Höhe.
Nur so laufen Raster, Null und die farbigen Zonen von Zeilenrand zu Zeilenrand: über alle
Zeilen hinweg **eine durchgehende Linie**, unterbrochen allein von der 1-px-Fuge zwischen
zwei Zeilen. Vorher endete jede Rasterlinie am Balkenbereich ihrer Zeile, und aus einer
Linie wurden fünf Striche.

**Die Größen sind mit Bedacht klein.** Die Auswertung steht über der Liste, an der
gearbeitet wird, und klebt beim Rollen mit: jeder Pixel, den eine Zeile hoch ist, fehlt der
Liste fünfmal. Die Form eines Monats liest man an der **Länge** der Balken, nicht an ihrer
Dicke — 5 px tragen ihre Farbe immer noch.

**Die Farberklärung ist das Letzte unter der Fläche.** Darunter stand bis 19.8.26 noch ein
Satz (`.tnote`, `month.tlNoDue`) über alles ohne Zahltag; er sagte dasselbe wie der
Filterknopf „Monatsabschluss" und die Zeile darüber, nur ausführlicher — beide sind weg.

**Jede Zelle einer Zeile steht in ihrer Spalte** (`grid-column` in `css/layout.css`). In
schmalen Fenstern fällt die Veränderung weg (`display:none`), und ohne feste Spalte rückten
Kontostand und Balken dann eine Spalte nach links — ein `display:none`-Element wird im
Raster nicht mehr platziert.

**Ein Klick auf eine Zeile filtert** (`data-tpart`) — dieselben Werte wie die Filterknöpfe
darunter (`A` · `M` · `E` · `Z`), über dasselbe `toggleFilter('dueFilter',…)` in `wire()`.
Ein zweiter Klick nimmt ihn zurück. Den Filter gibt es nur bei aufgeklappter Auswertung —
zugeklappt gibt es die Zeilen nicht.
Gefiltert **wird** die Zeile nicht hinterlegt wie ein Filterknopf: in ihr stehen Zahlen und
Balken, die lesbar bleiben müssen. Sie bekommt deshalb nur ihre orangen Trennlinien; im
Wasserfall — den es gefiltert nur bei weiter Suche gibt — bleibt es beim Rahmen nach innen.

**Sobald irgendein Filter greift, gibt es keinen Wasserfall mehr** (`partLine()` in
`js/views/monat.js`) — Suchbegriff, Bereich, Zahlungsstand und Fälligkeit gleichermaßen. Ein
Kontostand aus lauter Einnahmen ist keiner. Das Maß
des Wasserfalls ist der **Kontostand**, und der entsteht aus allem, was der Monat bewegt;
mit weggefilterten Zeilen ist er kein Kontostand mehr, sondern eine Summe von Resten, die
auf keinem Konto steht. Gezeigt wird stattdessen, was man gefiltert hat: je Abschnitt
seine Beträge als Balken. **Die fünf Zeilen bleiben stehen** — die Aufteilung des Monats
soll man weiter sehen, und ein Klick auf eine Zeile wählt ihren Abschnitt dazu. Jede zeigt
je Geldart einen Balken (`.ttrack.tflat`), und die Fläche trägt **denselben Grund wie der
Wasserfall**: links der Null rot, rechts grün (`.tzone`, gesetzt in `partLine()`). Einen
Kontostand misst sie hier nicht, ein Vorzeichen hat sie sehr wohl — ihre Null steht mitten
darin, was abgeht wächst nach links, was hereinkommt nach rechts, und genau das sagen die
beiden Farben noch einmal. Zwei Gründe für dieselbe Grafik ließen den Filter nach einer
anderen Ansicht aussehen. Wie hoch die Zeilen sind, steht oben: `--nbars` gilt für alle zusammen. Die
Monatseröffnung hat keine Geldarten und behält nur Raster und Namen; eine Zeile ohne
Bewegung bleibt leer statt „—" zu zeigen, wie im Wasserfall auch.

**Findet der Filter in diesem Monat gar nichts, gibt es auch kein Maß**: keine
Rasterlinie, keine Null, keine Achszeile (`empty` in `partLine()`). Die fünf Abschnitte
bleiben mit ihren Namen stehen — dass sie leer sind, sagt der fehlende Balken. Eine Null,
die eine Fläche teilt, in der nichts steht, und eine „0" darüber behaupten ein Maß, das es
gerade nicht gibt.

**Ist ein Abschnitt gewählt, ist er die Auswahl und der Rest Umgebung:** nur er trägt seine
Summe (die Veränderung der gezeigten Zeilen) und volle Farbe, die übrigen sind **blass**
(`.pale`, Deckkraft statt eigener Farben) und ohne Zahl. **Gerechnet werden sie über
`selAny`** (siehe „Was ein Filter mit den Summen macht"): dieselben Filter wie die gewählte
Zeile, nur ohne den Fälligkeitsfilter, der ja gerade den Abschnitt wählt. **Gewählt sagen
die Trennlinien:** über und unter der Zeile liegen sie in der Hervorhebungsfarbe
(`.tline.part` in `css/layout.css`, ein Schatten in die 1-px-Fugen) — kein Rahmen nach
innen, kein gefärbter Name.

**Filtern nur Suchbegriff oder Zahlungsstand**, ist keine Zeile Auswahl und keine Umgebung:
dann trägt **jede** ihre eigene Summe, alle Balken sind kräftig, eingefasst ist nichts, und
`selAny` wird nicht gebraucht (ohne Fälligkeitsfilter ist es dieselbe Rechnung wie `sel`).
Damit erledigt sich auch der frühere Sonderfall der weiten Suche (`qAll()`): dort übergeht
die Suche den Fälligkeitsfilter, und eine einzeln hervorgehobene Zeile nennte eine andere
Summe als die Karten — jetzt zeigt jede Zeile ihre eigene.

Ein Klick auf die gewählte Zeile nimmt den Abschnitt zurück; ist danach gar kein Filter
mehr gesetzt, gilt wieder der Wasserfall.

**Beide Fassungen tragen dasselbe Gerüst aus Grund, Trennlinie, Raster und Achse.** Die Balkenfläche
beginnt mit einer Linie zur Zahlenseite (`.tline .ttrack{border-left}`), im Stil der Null
zwischen Minus und Plus. Das Raster läuft über **alle** Zeilen: die feinste Stufe der
Leiter 1·2·5·10 …, bei der die Spanne in höchstens zehn Felder passt (`tlStep()` — dieselbe
Regel wie die Achse der Prognose, nur bis in den Euro hinunter); im Wasserfall liegen die
Linien auf Vielfachen der Schrittweite und die Null behält ihre kräftigere.

**Auch die gefilterte Fläche hat ihre Null** (`.tzero`): **was hereinkommt, wächst nach
rechts, was abgeht, nach links**, dieselbe Leserichtung wie im Wasserfall, nur ohne
Kontostand. Eine Zeile mit Einnahme *und* Kosten zeigt damit auf einen Blick, was
überwiegt; linksbündig standen beide gleich herum und man musste die Farben lesen.

**Jede Seite reicht nur so weit, wie es dort Werte gibt** — bis zur Rasterlinie hinter dem
größten Betrag ihrer Richtung (`cellsL` / `cellsR` in `partLine()`). Eine Fläche, die links
bis −5.000 aufmacht, weil rechts 5.000 stehen, verschenkt die halbe Breite an nichts; **die
Null steht deshalb nicht fest in der Mitte**, sondern dort, wo die Werte sie hinsetzen, und
wandert bei jeder Filteränderung mit — sie hängt allein an den Zahlen, die gerade zu sehen
sind. **Der Maßstab bleibt für beide Seiten derselbe** (eine Schrittweite, ein Feldmaß):
zwei Maßstäbe machten aus einem doppelt so langen Balken einen beliebigen Betrag. Die
Schrittweite kommt aus der ganzen Spanne und wird gröber, solange beide Seiten zusammen
mehr als zehn Felder ergäben — aufgerundet wird ja auf jeder Seite einzeln.

Angesetzt wird jeder Balken **an** der Null — der Zufluss mit `left`, der Abfluss mit
`right`: über eine gerechnete linke Kante liefe ein winziger Abfluss sonst in die falsche
Richtung, weil seine Mindestbreite nach rechts wüchse und ihn auf die Plusseite legte.
**Prozentwerte an diesen Elementen beziehen sich auf die Padding-Box**, `getBoundingClientRect()`
liefert die Border-Box — wer die Lage der Null nachmisst, misst an `.tzero` selbst und
rechnet sie nicht aus dem Prozentwert aus, sonst ist er um den 1-px-Rand daneben. **Die Linie
selbst ist in beiden Fassungen dieselbe** (`.tgrid`, `--rule` bei `opacity:.85`) — eine
eigene Stärke fürs Gefilterte ließe den Filter nach einer anderen Grafik aussehen. Darüber steht
die **Achszeile** (`tlAxis()`, `.taxis`/`.tzlab`): an jeder Rasterlinie der Betrag, für den
sie steht, formatiert mit `gnum()` aus `js/format.js` — derselben Funktion, mit der die
Prognose ihre Achse beschriftet; Marken nahe der Kante legen sich an sie. Eine eigene
„Raster"-Angabe in der Farberklärung gibt es deshalb nicht (`month.tlGrid` ist wieder weg);
die Farberklärung nennt im gefilterten Zustand alle Geldarten, die in der Fläche vorkommen —
auch die blassen.

**Die Zonen tragen die Farben der Einträge:** links der Null `--bg-out` wie ein Posten der
regelmäßigen Kosten, rechts `--zone-in` wie eine Einnahme (`.z-neg` / `.z-pos` in
`css/layout.css`) — dieselbe Aussage, dieselbe Farbe. **In allen drei Fassungen**: der
Wasserfall setzt sie in `timeline()`, die gefilterte Fläche in `partLine()`, der Verlauf
über das Jahr in `viewPrognose()` (`rails`, siehe „Die Spalte „Verlauf""). Nur wenn der
Filter gar nichts findet, gibt es auch keine Zonen — dann gibt es kein Maß und also auch
keine Seite, auf der etwas läge (siehe oben).

**Die kräftige Nulllinie folgt überall derselben Frage:** liegt die Null im Bild, trennt sie
Rot von Grün; liegt sie draußen, ist die Fläche eine einzige Zone. Gefragt wird an der Lage
(`zout` in `timeline()` und in `viewPrognose()`) und **nicht** daran, ob die Achse
beschnitten ist: eine beschnittene Achse kann die Null durchaus enthalten — im Jahr etwa mit
gesetztem Anfangsbestand und einem Monat im Minus —, und dann fehlte die Linie genau dort,
wo die Farbe wechselt.

## Die Umfrage

FINA fragt in der Pilotphase selbst nach der Meinung seiner Nutzer — **in FINA, nicht auf
einer fremden Seite**. Alles dazu steht in `js/dialogs/umfrage.js`; die beiden Adressen des
Absenders (Formbricks) in `js/config.js` (`SURVEY_HOST`, `SURVEY_WS`).

**Nichts springt von selbst auf.** Eine offene Umfrage meldet sich als **oranger Knopf in
der Kopfzeile** (`#btnSurvey`, `.btn.srvbtn` — dieselbe gefüllte Farbe, die die Anleitung
bis zum Mac-Redesign trug) und wartet dort. Ein Fenster, das beim Öffnen eines Buches von
selbst aufginge, stünde vor der Arbeit, wegen der man das Buch geöffnet hat. Ob es eine
gibt, sagt `renderChrome()` über `surveyOpen()`; **wo der Knopf steht, entscheidet
`fitHeaderBtns()`** (siehe „Zwei Knöpfe treten aus dem Menü heraus"): draußen als
äußerster links, mit leuchtendem Ring — bei engem Fenster zuoberst im Menü, und dann sagt
der rote Punkt am Hamburger, dass dort etwas wartet.

**Gefragt wird erst, wenn einmal gespeichert wurde** (`srvSaved()`). Wer FINA zum ersten
Mal öffnet, hat noch gar keine Datei — ihn zu fragen, wie ihm FINA gefällt, wäre eine Frage
an jemanden, der noch nichts gesehen hat, und der Vermerk der Antwort hätte kein Zuhause.
Erkannt wird es an `fileName` **oder** `state.v`: der Name steht nur, wo die Dateiauswahl
des Browsers gilt — sonst landet ein Speichern im Download-Ordner und lässt ihn leer,
und dann sagt die Versionsnummer, dass `stateJson()` schon einmal gelaufen ist.

**Auf dem Telefon gibt es sie nicht.** Dort ist „Daten speichern" ausgeblendet
(`.tools #btnSave` in css/mobile.css) — der Vermerk käme also nie in die Datei, die Umfrage
stünde beim nächsten Öffnen wieder da, und die Bitte ums Speichern unter den Fragen wäre
eine Aufforderung zu etwas, das es dort nicht gibt. `openSurveyNow()` **und**
`checkSurvey()` halten deshalb an `isMobile()`; wird das Fenster breit gezogen, zeichnet
`MOBILE_MQ` neu und beides läuft nach.

**Nachgesehen wird einmal je Sitzung und erst mit offenem Buch** (`checkSurvey()`, aufgerufen
in `render()` neben `checkUpdate()`) — dieselbe Regel und derselbe Grund: ein Kassenbuch steht
stundenlang offen, und ohne Buch gibt es nichts, worin ein „schon beantwortet" stehen
könnte. Die Abfrage darf scheitern; dann bleibt der Knopf weg.

**Das ist die zweite Netzverbindung, die FINA aufbaut — und die erste, die es auch im
Browser tut.** `checkUpdate()` läuft nur in den Apps; diese läuft überall. Wer den Satz
„FINA baut genau eine Verbindung auf" irgendwo zitiert, zitiert ihn falsch. Geschickt wird
dabei nichts außer der Anfrage selbst; erst beim Absenden gehen die Antworten hinaus.

**Die Fragen kommen vom Absender.** Gelesen wird die offene Client-Schnittstelle: Fragen,
Reihenfolge und Antwortmöglichkeiten stehen dort, es gibt also nichts abzutippen. Drei
Dinge, die man dabei wissen muss:

* **Die Fragen stehen in Blöcken** (`blocks[].elements[]`), die alte flache Liste
  `questions[]` ist leer. `srvQuestions()` liest die Blöcke und behält die Liste als
  Rückfall.
* **Jeder Text kommt als HTML** (`<p class="fb-editor-paragraph">…`). `srvText()` nimmt
  davon nur den nackten Text — FINA hat seine eigene Schrift, und fremdes Markup gehört
  nicht ungeprüft auf den Schirm.
* **Den Namen der Umfrage gibt die Schnittstelle nicht heraus** („omitted from public
  API"). Die Überschrift des Fensters kommt deshalb aus der **Willkommenskarte** — aber nur,
  wenn sie eingeschaltet ist: abgeschaltet steht dort der Vorgabetext „Willkommen!", und
  der ist kein Titel. Sonst sagt FINA `srv.title`.

**Die Kennung, unter der eine Umfrage als erledigt gilt, ist ihre eigene** — nicht das
Datum. Ein Datum als Schlüssel wechselt mit dem Tag, an dem gefragt wird, und dieselbe
Umfrage käme am nächsten Morgen wieder.

**Höchstens eine am Tag, und immer nur eine auf einmal** (`openSurveyNow()`). Laufen
mehrere, kommen sie nacheinander: die erste noch unbeantwortete, die nächste frühestens am
folgenden Tag. Keine geht verloren, sie warten. Genau dafür steht das Antwortdatum in der
Datei — es ist die einzige Angabe, aus der sich „heute schon gefragt" ablesen lässt, ohne
daneben Buch zu führen.

**Drei Angaben je Umfrage, und jede hat ihren Grund.** `state.surveys[<kennung>]` trägt
`status` (`0` kennt sie und wartet, `1` erledigt und nie wieder gezeigt), `seen` (der Tag,
an dem FINA sie bei diesem Buch zum ersten Mal gesehen hat) und `answered` (der Tag der
Antwort). **Wann die Umfrage beim Absender gestartet wurde, gibt die Schnittstelle nicht
her** — deshalb `seen`, und für den Nutzer ist das ohnehin der richtige Tag: vorher konnte
er sie nicht beantworten. Gestempelt wird in `srvStamp()` **ohne `save()`**, genau wie
`created` in `migrate()`: ein Buch, das allein vom Öffnen schmutzig wird, fragt beim
Schließen nach Änderungen, die niemand gemacht hat.

**Nach drei Tagen fragt sie selbst** (`srvNudge()`, `SRV_DAYS`/`SRV_DELAY`). Der Knopf
lässt sich übersehen; steht eine Umfrage drei Tage unbeantwortet, geht das Fenster
**einmal je Sitzung** von selbst auf — nicht sofort, sondern eine Minute nach dem Öffnen:
wer ein Buch aufmacht, will zuerst hineinsehen. Ist gerade ein anderes Fenster offen,
wartet es weiter; über einem halb ausgefüllten Posten aufzuspringen wäre schlimmer, als
gar nicht zu fragen. **Drei Tage und nicht zehn**, weil `seen` erst mit dem Speichern in
der Datei landet: wer selten speichert, fängt die Frist jedes Mal von vorn an, und bei
zehn Tagen käme das Fenster bei ihm nie.

**Vermerkt wird erst nach der Bestätigung des Servers.** `status` springt auf 1, `answered`
bekommt den Tag, dann `save()` und `render()` — damit verschwindet der Knopf. Schlägt das Absenden fehl, wird **nichts** geschrieben: eine rote Zeile sagt es, die
Umfrage bleibt offen und kommt wieder. Es kann also nicht passieren, dass eine Antwort als
erledigt gilt, ohne angekommen zu sein.

**Was in der Datei steht, sagt das Fenster selbst** — zwei Aussagen unter den Fragen, und
sie sind verschieden viel wert. Was **noch zu tun ist** (`srv.save`, „bitte danach deine
Datei speichern") steht als eigene schwebende Bahn in der Farbe des Umfrage-Knopfes, weiß
auf Orange, in der Bauform eines Blocks — man erkennt an der Farbe, wozu es gehört. Was
danach **in der Datei stehen wird** (`srv.note`) ist eine Auskunft und steht darunter in
Ruhe. Beides grob und ohne Feldnamen: wie die Datei innen aussieht, geht den Leser nichts
an. Und der Vorspann (`srv.sub`) sagt, dass **nur das Ausgefüllte** hinausgeht und nichts
sonst aus dem Buch.

**Der Rumpf rollt, die Fußzeile steht** — dieselbe Bauform wie die drei großen Fenster
(`.split` / `.dbody`, siehe „Ein Fenster steht in Blöcken"), nur mit einem anderen Schnitt:
die **Überschrift rollt hier mit**. Sie ist ein Gruß und keine Auskunft, die man beim
Ausfüllen braucht; gebraucht wird unten, was noch zu tun ist — die Bitte ums Speichern, was
in der Datei landet, und die beiden Knöpfe. Wer bei Frage sieben steht, soll „Absenden"
sehen und nicht dorthin scrollen müssen. Die drei Zeilen unten sind ein Stück und stehen
zusammen; getrennt sind sie vom Rumpf durch Abstand, nicht durch einen Strich.

**Ein Ankreuzkästchen des Browsers gibt es nicht.** Auswahl und Bewertung sind Knöpfe, und
**gewählt tragen sie Tinte** — dieselbe Sprache wie ein gedrückter Filterknopf. Jede Frage
steht in einem eigenen `.dgrp`, wie die Blöcke des Posten-Fensters.

**`state.created` gab es einen Tag lang** — den Tag, an dem ein Buch angefangen wurde,
gedacht als Frist für neue Nutzer. Die Frist hängt jetzt am ersten Speichern und braucht
kein Datum; `migrate()` **löscht** das Feld deshalb, sonst schriebe `stateJson()` es bei
jedem Speichern wieder hinaus (dieselbe Behandlung wie `hideSettled` und `flexCollapsed`).

**Der Text vom Dienst wird gelesen, nicht eingesetzt** (seit 10.9.26). `srvText()` steckte
ihn bis dahin per `innerHTML` in ein `div`, nur um gleich darauf den nackten Text
herauszulesen — dabei baut der Browser die Elemente wirklich, und ein `<img onerror=…>`
liefe schon los, bevor die Zeile darunter den Text liest. Jetzt liest `DOMParser` ihn in ein
totes Dokument: nichts wird geladen, nichts ausgeführt, umschriebene Zeichen (`&amp;`)
kommen trotzdem richtig heraus. Es war die einzige Stelle im Code mit diesem Muster; wer
fremden Text säubern will, nimmt denselben Weg.

**Eigene Umfrage-Dateien auf `fina-app.de` braucht es nicht** (der Plan stand bis 10.9.26
hier): FINA fragt direkt beim Dienst nach, welche Umfragen laufen — eine zweite Datei
müsste gepflegt werden und liefe der Wirklichkeit hinterher. Der Absatz in der
Datenschutzerklärung steht ebenfalls (dort Abschnitt 7, zweisprachig).

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

**In der Kopfzeile steht keine zweite Wahl** (siehe „Die Sprache hat zwei Zuständigkeiten"):
sobald ein Buch offen ist, gehört die Sprache der Datei und wird im Einstellungsfenster
geändert.

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
`foldBtn()`): ein Dreieck, das nach unten zeigt, wenn der Bereich offen ist, und nach rechts,
wenn er zu ist. Seit 6.9.26 ist es **überall dasselbe Dreieck** (`tri()` in `js/ui.js`,
`.tri`, 9 × 13 px, gedecktes Grau `--ink-2` — ein Hinweis, kein Wort; bis dahin ▼/▶ in der
Bereichsfarbe, rund 18 px), es steht ganz links in der Kopfzeile in einem 14-px-Feld
(`.sechead .foldarrow` / `.foldpad`; bis dahin `--markw` breit), und **mit Maus ist es in
Ruhe unsichtbar**: es fährt beim Überfahren des Kopfes heraus und dreht sich beim Klappen
(`data-hk`, siehe „Bewegung"). Ohne Maus — Telefon, Touch — steht es fest.

**Ein Klick auf die Kopfzeile tut dasselbe** (`data-secfold` an der `.sechead`, verdrahtet
in `wire()`; seit 6.9.26 ein einfacher Klick, bis dahin ein Doppelklick über
`data-dblfold`); auf Knöpfen und Links darin nicht, die haben ihr eigenes Ziel.

**Zugeklappt trägt der Kopf keine Linie mehr** (`.card.folded>.sechead`): unter ihm steht
keine Zeile, die er abtrennen könnte — der Bereich ist dann nur noch eine Farbe.

### Dieselben drei Blöcke in der Jahresmatrix

Die Blockzeilen der Jahresansicht klappen genauso (`viewJahr()` in `js/views/jahr.js`).
Zugeklappt bleibt die **Blockzeile mit ihren zwölf Summen** stehen, die Zeilen darunter
werden gar nicht erst gebaut — dasselbe Versprechen wie im Monat: Überschrift und Summe
bleiben.

Der Pfeil (`data-yfold`, gebaut in `yfoldBtn()`) steht in `td.ed`, der **Stiftspalte** —
eine Blockzeile hat dort nichts, und es ist die erste Spalte, also dieselbe Stelle wie im
Kartenkopf des Monats. Es ist dasselbe Dreieck wie im Monat (`.tri`, `--ink-2`; bis 6.9.26
in der Kantenfarbe des Blocks), es fährt mit Maus ebenfalls erst beim Überfahren der Zeile
heraus (`.matrix tr[data-hk]`, `td.lab{padding-left:18px}` in `css/matrix.css`) und macht
die Blockzeile nicht höher. Der Klick sitzt hier an der **ganzen Zeile** (`data-blkfold` am
`tr`, seit 6.9.26 ein einfacher Klick statt des Doppelklicks `data-dblyfold`), nicht an
einer Zelle: die Zeile ist die Überschrift.

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
`[['fold','secfold','folded'],['yfold','blkfold','foldedYear']]`; `toggleFold()` bekommt
den Namen der Liste als erstes Argument und setzt `ui.foldAnim`, damit `render()` das
Klappen animiert (siehe „Bewegung").

### Was das Klappen überschreibt

`foldOf(k)` entscheidet in beiden Ansichten, was **zu sehen** ist — die Datei bleibt dabei
unberührt. **Ein Filter** klappt alles auf, und gegen ihn lässt sich **gar nicht** klappen:
Wer sucht, soll den Treffer sehen und nicht daran denken müssen, in
welchem zugeklappten Bereich er steckt. Im Monat sind das Suchfeld, Bereich, Fälligkeit
und Zahlungsstand (`filterOn`); **in der Jahresansicht allein das Suchfeld** (`foldLock`).

**Die beiden Ausblenden-Knöpfe zählen seit 22.8.26 nicht mehr dazu.** „Erledigte Posten
ausblenden" tat es bis dahin, weil es Zeilen wegnimmt — nur hat, wer ihn drückt, kein
Ziel, das sich verstecken könnte: er räumt ab, was fertig ist. Ein Buch, in dem der Knopf
gedrückt steht, verlor damit dauerhaft seine Klapp-Pfeile, ohne dass jemand danach gefragt
hätte. „Abgeschlossene Monate ausblenden" nimmt ohnehin nur Spalten weg — in einem Block
verbirgt sich dadurch nichts. **Welche Zeilen es überhaupt gibt, entscheiden beide
weiterhin**: dafür steht `filterOn` neben `foldLock` (`keepSec()` nimmt einen leer
gefilterten Block weg).

**Die offene Auswertung zählt seit 22.8.26 nicht mehr dazu.** Sie tat es bis dahin (der
Zeitstrahl sollte sich in der Liste wiederfinden lassen) — nur steht sie in jedem Buch mit
`state.anaOpen` von Haus aus offen, und dann fehlten die Pfeile dauerhaft und ohne
erkennbaren Grund: **dieselbe Anwendung sah in zwei Dateien verschieden aus**, und das
sieht wie ein Fehler aus, nicht wie eine Regel. Der Zeitstrahl bleibt auch über einer
zugeklappten Karte lesbar. Wer die Regel zurückbauen will, weiß jetzt, warum sie weg ist.

**Solange der Filter gilt, gibt es keinen Pfeil und keinen Klick auf die Überschrift.**
`foldBtn()` liefert im Monat ein leeres `.foldpad` derselben Breite — sonst spränge die
Überschrift —, in der Matrix bleibt die Stiftspalte einfach leer; `data-secfold` /
`data-blkfold` (und `data-hk`) bleiben weg. Ein Pfeil, der gegen eine Überschreibung anklappen wollte, hielte nicht, was er
verspricht, und ein Wert, den niemand sieht, soll auch nicht heimlich kippen. Fällt der
Filter weg, gilt wieder die Datei — unverändert.

Daraus folgt: `(n ausgeblendet)` neben einer Überschrift steht beim Filtern **immer**,
denn dann ist nichts zugeklappt.

Was der Pfeil tut, sagt sein `title` und sein `aria-label` (`month.minAreaTip` /
`year.minAreaTip` und die beiden Gegenstücke); ob der Bereich offen ist, sagt
`aria-expanded` und die Richtung des Pfeils. Geklappt wird gegen das, was zu sehen ist —
`toggleFold()` liest `aria-expanded` und schreibt das Gegenteil in die Datei.

## Die Filterzeile der Monatsansicht

Sie steht **ganz oben in der Leiste** — ohne Abstand an der Kopfzeile angedockt, wie in der
Jahresansicht; beide Ansichten fangen mit derselben Bahn an. Sie **gilt für alle drei Bereiche** —
Einnahmen, Flexible Payments, regelmäßige Kosten und die Saldokorrektur gleich mit. In
einer der Karten stünde sie an der falschen Stelle: sie filtert nicht diese Karte, sondern
den ganzen Monat. In der Reihenfolge, in der man filtert — vom Groben ins Feine: das Suchfeld (`data-q`),
dann der **Bereich** (`data-secfilter`: `alle` · `in` · `flex` · `out`), dann die
Fälligkeit (`data-duefilter`: `alle` · `A` · `M` · `E` · `Z`), dann der Zahlungsstand
(`data-filter`: `alle` · `offen` · `unklar` · `bezahlt`).

**Der Bereichsfilter meint die drei Karten**, nicht die Kategorien darin: Einnahmen ·
Flexible Payments · regelmäßige Kosten. Auf dem Knopf steht ein kurzes Wort, welcher Bereich
gemeint ist, sagt seine Sprechblase (`month.fSecInTip` …) — vier Knöpfe mit „Regelmäßige
Kosten" ausgeschrieben sprengten die Zeile, die oben klebt. **Die Saldokorrektur fällt
mit weg**, sobald ein Bereich gewählt ist: sie gehört keinem der drei an. Er greift wie die
übrigen Filter **an der Auswahl** (`secOk()` in `show`, `showKak`, `balOn` und ihren
`…Any`-Zwillingen) und nicht erst an den Karten — nur so rechnen Kennzahlen und Zeitstrahl
mit dem, was zu sehen ist. Die weite Suche (sechster Haken) übergeht ihn wie alles andere.

Wie die drei Bereiche gefiltert werden, steht in `viewMonat()`:

| | Bereich | Zahlungsstand | Fälligkeit | Suchbegriff |
|---|---|---|---|---|
| Posten (Einnahmen, Kosten) | `in` bzw. `out` über `isIncome` | `paidAt` / `estOf` | `dueGroup(it.dueDay)` | `hayItem` |
| flexible Posten | `flex` über `isFlex` | wie jeder Posten | wie jeder Posten (`dueGroup`) | `hayItem` |
| Saldokorrektur | gehört keinem — fällt bei jeder Wahl weg | — sie wird nicht abgehakt | immer `Z` | `hayItem` |

Was eine Karte dabei verliert, steht als `(n ausgeblendet)` neben ihrer Überschrift.
**Und solange gefiltert wird, steht jede Karte offen** — auch eine, die in der Datei
zugeklappt ist, und zuklappen lässt sie sich dabei nicht (siehe „Zugeklappte Bereiche").
Die drei Gruppen der Zeile — Suchfeld, Fälligkeit,
Zahlungsstand — trennt eine senkrechte Linie (`.anabar .fbgroup`).

**Bleibt in einer Karte keine Zeile übrig, verschwindet sie ganz** (`keep()` in
`viewMonat()`). Wer nach den regelmäßigen Kosten filtert, braucht die Karte der Einnahmen
nicht: sie stünde als Kopf mit „(4 ausgeblendet)" und einem Satz darunter da — drei Zeilen
über der Liste, die man gerade liest, und keine davon sagt etwas. Dasselbe tut die
Jahresmatrix mit ihren Blöcken (`keepSec()` in `viewJahr()`), und dieselbe Regel gilt der
Saldokorrektur, die ohnehin an `balOn` hängt.

**Ohne Filter bleibt der leere Bereich stehen.** Dort ist er die Auskunft: es gibt ihn, es
steht noch nichts darin, und der Knopf daneben ändert das. Der Satz darin sagt deshalb nur
noch diesen einen Fall (`month.noIncome` · `month.noKak` · `month.noFixed`); „Keine Posten
für diesen Filter" (`month.noItems`) steht nur noch dort, wo **alle** Karten weggefallen
sind — eine leere Fläche unter der Filterzeile sähe aus, als wäre etwas kaputt.

Gebaut werden Feld und Knöpfe von `filterField()` und `fbtn()` in `js/ui.js`; die
Jahresansicht benutzt dasselbe Feld. Ein Knopf zeigt am dunklen Grund, dass er angewendet
ist, und ein zweiter Klick nimmt ihn zurück (`toggleFilter()` in `wire()` — er springt dann
auf `alle`). Die Erklärung hängt als `data-tip` daran; das Suchfeld trägt zusätzlich
`data-tiphover`, seine Sprechblase kommt also **nur von der Maus**. Beim Fokus stünde sie
die ganze Zeit daneben, denn der Fokus kehrt immer wieder dorthin zurück (siehe unten).

**Reicht die Breite nicht, rücken alle Filter in ein ☰** (Lex, 8.9.26): das ✕, die
Filteroptionen und die drei Aufklappmenüs verschwinden auf einmal, und das ☰
(`fltMenuAll()` in `js/views/monat.js`) tritt an die Stelle des ✕ — gleich rechts vom
Suchfeld, das immer stehen bleibt. **Alles oder nichts**, anders als die Knöpfe der
Kopfzeile: sie tun hier alle dasselbe, und ein Menü, in dem mal zwei und mal vier Gruppen
stehen, sähe bei jeder Breite anders aus. Das Menü **bleibt beim Wählen offen** (wie das
mobile Filtermenü — alle drei Fragen stehen beieinander, `mShut()` in `wire()`), und der
**rote Punkt** oben rechts (`.dirtydot`) sagt, was er am Hamburger der Kopfzeile sagt:
hier drin steckt etwas. **Und zwar nur, was wirklich darin steckt** (Lex, 9.9.26):
Bereich, Fälligkeit, Zahlungsstand — der Suchbegriff zählt seitdem **nicht** mit
(`menuOn` neben `anyOn` in `fltMenuAll()`, `js/views/monat.js`; das Menü steht in beiden
Ansichten). Er steht im Feld daneben, sichtbar, und ein Punkt dafür schickte einen ins
Menü, in dem nichts zu finden ist. „Filter zurücknehmen" hängt weiter an `anyOn` — es
nimmt das Suchfeld mit weg. Gebaut wird das Menü immer, gezeigt wird eins von beiden —
`.fbnarrow` an der Zeile entscheidet (`css/layout.css`).
**Gemessen, nicht geraten:** `fitFilterBar()` in `js/app.js` gibt der Zeile für einen
Augenblick `width:max-content` ohne Umbruch und liest ihren Bedarf; das Suchfeld darf
nämlich schrumpfen, und eine Zeile, in der es schon gequetscht steht, „passte" sonst
weiter. Gerufen wird sie aus `syncMatrixHead()` — damit zählt **die Anleitung von selbst
mit**: sie macht die Seite schmaler, und dieselbe Funktion läuft, wenn sie auf-, zugeht
oder gezogen wird. Nachgemessen (deutsch): die Jahresleiste klappt bei rund 1200 px ein,
die Monatsleiste bei rund 750 px, mit offener Anleitung schon in einem 1500 px breiten
Fenster. Der Zustand lebt in `ui.fltMenu==='all'` — Sitzung, nie Datei.

**Rechts vom Feld steht `data-qclear`**, das Gegenstück zum Tippen: es setzt `ui.q`,
`ui.secFilter`, `ui.filter` und `ui.dueFilter` in einem Zug zurück und ist gesperrt, solange
keiner davon gilt. Die beiden Knöpfe der Jahresansicht rührt es **nicht** an — sie stehen
rechts und außerhalb der Filtergruppe, und sie filtern auch nicht.

**Escape nimmt Schicht für Schicht zurück** (Lex, 8.9.26; bis dahin räumte es alles auf
einmal weg wie das ✕). Jeder Druck nimmt **genau eine** Schicht — Handler unten in
`js/app.js`:

1. ein offenes Filtermenü geht zu (`ui.fltMenu`, auf dem Telefon `ui.mFilters`);
2. steht etwas im Suchfeld, wird **nur** das Feld geleert;
3. ist es leer, gehen Bereich, Fälligkeit und Zahlungsstand zurück auf „alle".

Der Schnitt zwischen 2 und 3 hat einen Grund: der Suchbegriff ist das, was man beim
Tippen gerade in der Hand hat, die drei Aufklappmenüs sind eine Einstellung, die man
vorher getroffen hat — wer sich vertippt, soll nicht nebenbei den Bereich verlieren.
**Alles auf einmal nimmt weiterhin das ✕** (`data-qclear`); dort steht es auch dran. Und
alles nur, wenn kein Fenster offen ist: dort gehört Escape dem Fenster (`js/ui.js`).

**Ein Druck, eine Wirkung.** Der Handler des Fensters hängt am *Dokument*, der des Filters am
*Fenster* — er läuft also danach, und das Fenster ist da schon aus dem DOM: eine Abfrage auf
`.modal` allein genügt nicht, sie ginge ins Leere und der Filter wäre nebenbei mit weg.
Deshalb **verbraucht das Fenster den Druck** (`preventDefault()` in `js/ui.js`), und der
Filter-Handler lässt `defaultPrevented` liegen. Bei zwei Fenstern übereinander schließt jedes
Escape genau eins; erst wenn keins mehr steht, nimmt der nächste Druck die oberste
Filterschicht zurück. Gefiltert nichts und kein Fenster offen, bleibt Escape unangetastet
beim Browser.

**Drei Wege führen ins Feld**, alle drei als Handler unten in `js/app.js`:

* **Einfach lostippen.** Ein einzelnes Zeichen ohne Strg/Cmd/Alt hängt sich an `ui.q`, wenn
  gerade kein Feld den Fokus hat — in Monat und Jahr gibt es nichts anderes, wohin ein
  Buchstabe gehörte. Außen vor bleiben: ein offenes Fenster, die Begrüßungsseite, Ansichten
  ohne Suchfeld und das Leerzeichen bei leerem Feld (es filterte auf nichts und nähme dem
  Browser das Blättern). **Nur das erste Zeichen** läuft über den Handler; danach hat das
  Feld den Fokus, und der Browser tippt selbst hinein.
  **Der dritte Schritt des CSV-Imports hält sich an dieselbe Regel** (`c2Keys()` in
  `js/dialogs/csv2-wizard.js`, seit 26.8.30): dort ist der Schnellfilter das Suchfeld, und
  auch dort gibt es sonst nichts, wohin ein Buchstabe gehörte. Der Handler hängt am
  **Dokument**, nicht am Fenster — ohne Fokus im Fenster käme ein Tastendruck dort gar
  nicht an —, und er tritt dem Handler in `js/app.js` nicht in die Quere: der steigt bei
  offenem `.modal` ohnehin aus. Angemeldet wird er in `openCsvWizard()`, abgemeldet in
  `c2Close()` und beim ersten Druck auf ein weggeräumtes Fenster.
* **Der Fokus von selbst**, wenn nach dem Zeichnen niemand sonst ihn hat (siehe `wire()`).

Einen eigenen Tastengriff ins Suchfeld gibt es **nicht mehr**: seit ein einzelner Buchstabe
dort von selbst landet, war Strg/Cmd+Umschalt+F der umständlichere von zwei Wegen. Die
Tastenkombination gehört jetzt dem vierten Reiter (siehe unten).

**Sie ist eine Bahn über die ganze Seite** (seit 22.8.26): ein flacher Streifen von Rand
zu Rand auf `--paper-2`, mit einer Haarlinie oben und unten — dasselbe Bild, das vorher
die Monatsleiste an der Kopfzeile trug. Ein eingefasster Kasten war sie bis dahin (grauer
Grund, Radius 7, Rahmen ringsum); als Bahn sagt sie, dass sie für die ganze Seite gilt und
nicht für die Karte darunter. Wie weit sie über das Polster von `.wrap` hinausgreift,
steht als `--pagepad` an `.wrap` — eine Bahn hat keine Ecken, `border-radius` und die
seitlichen Kanten entfallen.

**Greift einer der drei Filter, färbt sich die ganze Leiste orange** (`.filterbar.on`,
gesetzt in `anaBar()`): sie sagt dann, dass hier gerade etwas ausgeblendet wird. Ohne
Filter bleibt sie hell — eine Farbe, die immer leuchtet, sagt nichts. **Leuchtend** und
nicht als blasse Tönung: die Leiste klebt oben unter der Kopfzeile und soll auch dann
auffallen, wenn man von der Liste darunter kommt. Genommen wird dafür `--accent-soft` und
**nicht** `--accent`: das satte Orange ist als Knopffarbe gedacht und wird über eine ganze
Leiste hinweg hart. Ihre Knöpfe sind von Haus aus durchsichtig und bekommen auf dem
farbigen Grund deshalb Papier unter sich; der gedrückte bleibt **dunkel**, und die Linien
zwischen den Gruppen werden dunkler statt heller. So sagt die Leiste, *dass* gefiltert
wird, und der gedrückte Knopf, *was*. **Die Knopfleiste der Jahresmatrix färbt sich
genauso** — genauer: **ihre Zeile**. Suchfeld und Knöpfe stehen dafür in einem eigenen
`.ybrow` (gebaut in `viewJahr()`), denn in derselben Leiste hängt darunter der waagerechte
Rollbalken der Matrix, und der filtert nichts. Die Zeile trägt immer dieselbe Bahn
(Polster und Haarlinien), gefärbt wird nur — sonst spränge alles um einen Pixel, sobald
ein Filter greift. Die Regeln stehen an einer Stelle
(`.anabar .filterbar,.yearbar .ybrow` in `css/layout.css`, samt der `.on`-Zwillinge
darunter) — eine Leiste, die anders aussieht, sähe nach einem anderen Werkzeug aus.

**Der Rollbalken steht seit 6.9.26 unter der Matrix**, nicht mehr in der Leiste (siehe
„Waagerecht scrollen"); die Luft zwischen Filterzeile und Spaltenkopf trägt das Polster der
Leiste allein.

**Gefärbt wird nur am Suchbegriff.** Im Monat leuchtet die Zeile an den Handgriffen der
Sitzung; in der Jahresansicht ist der Suchbegriff der einzige davon. Die beiden
Ausblenden-Knöpfe zählen **nicht** mit: sie filtern nicht, sie räumen ab, was fertig ist —
und stehen dafür abgesetzt am rechten Rand. Dass sie gerade gelten, sagen sie selbst:
dunkler Grund und die Zahl der versteckten Zeilen in Klammern.

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

**Prognose und Import Details bleiben draußen** — dort wird nicht gefiltert, und
`income(m)`, `fixedCost(m)`, `kakeiboFor(m)` und `openCost(m)` stehen weiter für den ganzen
Monat.

Daraus folgt für beide Views eine feste Reihenfolge: **erst sammeln, was gezeigt wird, dann
summieren.**

* **`js/views/monat.js`** — `sumIt(arr)` über die Monatsbeträge; `incSum`, `flexSum` und
  `outSum` entstehen aus `incUse`, `flexUse` und `outItems`, den flachen Listen der
  gezeigten Posten. `groupHead()` summiert `items`, nicht
  `all` — `all` sagt nur noch, wie viele fehlen.
* **`js/views/jahr.js`** — `monSums(arr)` liefert die zwölf Monatssummen einer Liste. Die
  Blöcke füllen beim Bauen `incVis`, `kakVis` und `outVis`; die Gesamtspalte rechnet `mrow()`
  ohnehin aus den zwölf Werten.

**Die Auswertung bekommt die Auswahl als ein Stück.** `sel = {items, bal}` entsteht in
`viewMonat()` aus **denselben** Listen, aus denen die Zeilen gebaut werden, und geht an
`anaBar(m,sel)` → `timeline(m,sel)` → `monthFlow(m,sel)`. Deshalb können Leiste, Zeitstrahl
und Karten nicht auseinanderlaufen. Ohne `sel` rechnet `monthFlow()` wie bisher über den
ganzen Monat — dieser Weg bleibt, weil er der ist, den eine Ansicht ohne Filter nähme.

**Daneben steht `selAny` — dieselbe Auswahl ohne den Fälligkeitsfilter.** Sie wird
gebraucht, seit der gefilterte Zeitstrahl die nicht gewählten Abschnitte stehen lässt
(`partLine()`): deren Balken sind Umgebung, aber **kein anderer Monat** — Suchbegriff und
Zahlungsstand gelten für sie genauso, nur die Fälligkeit nicht, die ja gerade den
Abschnitt wählt. Gebaut wird sie in `viewMonat()` aus denselben Gruppen wie `sel`, nur mit
`showAny` / `showKakAny` / `balAny` statt `show` / `showKak` / `balOn`, und gereicht als
drittes Argument: `anaBar(m,sel,selAny)` → `timeline(m,sel,selAny)` → `partLine()`. **Wer
an einem der drei Filter etwas ändert, ändert beide Fassungen mit**, sonst zeigen die
Zeilen nebeneinander zweierlei.

**`carryIn(m)` filtert nicht mit.** Die erste Zeile des Zeitstrahls ist der Stand, den der
Monat vorfindet, und den machen die Monate davor. Gefiltert steht dort also der echte
Anfang, und was darunter kommt, ist das, was die gezeigten Zeilen daraus machen; der letzte
laufende Wert ist dann **nicht** mehr `saldo(m)`.

Zwei Nebenwirkungen, die man kennen muss:

* **Die Sprechblase an „noch offen"** zählt „x von y" ebenfalls über die gezeigten Posten —
  sonst stünde dort „3 von 20", während darunter drei Zeilen sind. Dafür ist
  `unclearCount()` aus `js/calc.js` verschwunden: die Zahl steht nicht mehr im Zustand.
  Gezählt werden dabei alle gezeigten Posten, die flexiblen eingeschlossen.
* **Der Zeitstrahl ist zugleich der Fälligkeitsfilter** (`data-tpart`). Wer eine Zeile
  anklickt, sieht danach nur noch ihre Zahlen — die übrigen Zeilen bleiben mit Namen und
  blassen Balken stehen, orange Trennlinien fassen die gewählte ein, und statt des
  Wasserfalls stehen Balken je Geldart auf einem beschrifteten Raster (siehe „Ein Klick
  auf eine Zeile filtert"). Das ist gewollt — ein zweiter Klick auf die Zeile nimmt es
  zurück —, aber es ist der einzige Filter, der seine eigene Anzeige mitfiltert.

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

Hinter jedem Suchfeld steht „Filteroptionen…" (`data-qfields`, gebaut von
`fltOptionsBtn()` in `js/ui.js`) und öffnet seit 23.8.26 die **Einstellungen im Bereich
„Filter"** (`openSettings('filter')`; das eigene Fenster `js/dialogs/filter-fields.js`
ist weg): fünf Kästchen, darunter abgesetzt der sechste Haken. Die Wahl steht in **der
Datei** (`state.filterFields`, siehe `QFIELDS` und
`allQFields()` in `js/state.js`) — sie ist eine Einstellung wie die beiden Jahresfilter,
kein Anzeigezustand, und deshalb gehört sie ins Einstellungsfenster, wo die Angaben der
Datei beisammenstehen. Vorgabe ist alles gewählt; eine Datei ohne die Angabe bekommt in
`migrate()` alles.

Die fünf Schlüssel und was zu ihnen zählt, steht in `hayItem()` in `js/calc.js`,
abgefragt über `qField(k)`:

| Schlüssel | Vergleichsstoff |
|---|---|
| `name` | Bezeichnung des Postens |
| `note` | Notiz zur Position und die zwölf Monatsnotizen |
| `amount` | die Monatsbeträge, in beiden Schreibweisen |
| `total` | die Jahressumme — auch in der Monatsansicht, es ist dieselbe Zeile |
| `meta` | Kategorie, Bank, Zahlungsart, Fälligkeit — **und** die Namen der Blöcke: `hit()` in `js/views/jahr.js`, `secHit()` in `js/views/monat.js` |

Wer einen Teil hinzufügt, braucht vier Stellen: den Schlüssel in `QFIELDS`, den Zweig in
`hayItem()`, die Zeile in `qfRows` im Bereich „Filter"
(`js/dialogs/settings.js`) und zwei Texte in `js/i18n.js`
(`flt.f…` und `flt.f…Hint`).

**Mindestens ein Kästchen bleibt stehen.** Ein Suchbegriff, der nirgends sucht, fände nie
etwas und sähe aus wie ein Fehler. Durchgesetzt wird das dreifach: `#lSave` der
Einstellungen weist die leere Wahl zurück (der Bereich „Filter" klappt auf und `.errline`
sagt in Rot, warum), `applyGeneral()` übernimmt sie auf keinem anderen Weg — „+",
Sortieren und Sprachwechsel behalten dann die letzte gültige Wahl —, und `migrate()`
flickt sie beim Laden. Der Knopf
selbst steht auf dunklem Grund (`aria-pressed`), sobald die Suche anders eingestellt ist als
von Haus aus: wie bei den Filterknöpfen heißt dunkel „gilt gerade".

**Der sechste Haken beantwortet eine andere Frage.** `#sQHidden` → `state.qHidden`, gelesen
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
seinem Vergleichsstoff; die Blocknamen kommen in `viewJahr()` dazu (`hit()`).

**Der Blockname gilt in beiden Ansichten.** Die Monatsansicht kann dasselbe seit 22.8.26
(`secHit()` in `js/views/monat.js`, verglichen mit den Beschriftungen der drei Kartenköpfe
`month.income` · `month.kak` · `month.fixed` und mit `bal.row`) — vorher fand „Einnahmen"
dort nichts, während dieselbe Eingabe in der Jahresmatrix den ganzen Block zeigte. Wer eine
weitere Ansicht mit Suchfeld baut, nimmt die Blocknamen mit auf: der Nutzer tippt den Namen,
den er auf dem Schirm liest, und erwartet in jeder Ansicht dieselbe Antwort. Gebaut wird
der Rumpf deshalb blockweise in `parts` und erst am Ende mit `spacer()` verbunden — ein
weggefilterter Block hinterließe sonst eine doppelte Lücke.

Das Suchfeld filtert beim Tippen. Gesucht wird in allem, was an der Zeile zu sehen ist —
Name, Betrag, Bank, Zahlungsart, Kategorie, Fälligkeit, Notizen —, soweit der Nutzer es im
Fenster hinter dem Hamburger-Knopf gewählt hat (siehe unten), in Teilstücken und ohne
Rücksicht auf Groß- und Kleinschreibung; `norm()` in `js/format.js` macht dabei Punkt und
Komma gleich, damit „1.234,56" und „1234.56" dasselbe finden. Den Vergleichsstoff liefert
`hayItem(it,m)` in `js/calc.js` — mit Monat für die Monatsansicht, ohne
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

`editItem(item,group,copyOf)` baut aus einem dritten Argument dasselbe Fenster wie für
etwas Neues: `isNew` ist dann wahr, es gibt keinen Löschknopf, und angelegt wird erst beim
Speichern. Die Kopie baut der Knopf `#fDup` selbst — aus dem **getippten** Stand des
Fensters, nicht aus der Datei: `collect(o)` liest die Felder (dieselbe Funktion, die auch
`#fSave` benutzt); Haken, Notizen und Import-Marken bleiben leer. Die Vorlage wird dabei
nie angefasst — auch das im Fenster Getippte wandert in die Kopie, nicht in sie.

**Ein Entwurf ist keine Position im Zustand.** `findItem()` findet ihn nicht, die
Notizlampen liefen also ins Leere. Deshalb meldet jedes Fenster, das erst anlegt, seinen
Entwurf mit `useDraft(kind,key,obj,label,box)` aus `js/ui.js` an; `noteTarget()` sieht dort
zuerst nach. Der Schlüssel ist `it.id`.
`label` ist eine Funktion und liest den Namen aus dem Feld — im Zustand steht er ja noch
nicht. Abgemeldet wird nichts: der Entwurf gilt nur, solange sein Kasten im Dokument hängt
(`box.isConnected`), ein geschlossenes Fenster nimmt ihn also von selbst mit. Die Notiz eines
Entwurfs setzt **kein** dirty-Flag — geschrieben wird sie erst mit dem Fenster.

**Wer ein Fenster baut, das eine Position anlegt, ruft `useDraft()` nach `appendChild`** —
sonst melden seine Lampen „gibt es nicht mehr".

## Zugehörige Links

Jede Position trägt eine **Liste** von Links — Vertrag, Rechnung, Kundenkonto. Jeder Eintrag ist `{name,url}`; **höchstens zehn**
(`MAX_LINKS`).

**Erlaubt sind nur Adressarten, die etwas öffnen** (seit 10.9.26): `http:`, `https:`,
`mailto:`. Das Wort vor dem Doppelpunkt sagt dem Browser, was er mit dem Rest tun soll —
`javascript:` heißt „führe das Folgende als Befehl aus", und der Befehl liefe im Namen von
FINA: er könnte das ganze Buch lesen und wegschicken. Der Weg dahin ist eine **fremde**
lokale Datenbank (ein geteiltes Buch, eine „Beispieldatei", ein Mailanhang) und ein Klick
aufs Kettensymbol.

Entschieden wird das an **einer** Stelle: `linkSafe(url)` in `js/state.js`, daneben die
Liste `LINK_SCHEMES`. Gefragt wird dabei **der Browser selbst** (`new URL()`) und kein
eigener Ausdruck: `java⇥script:` mit einem Steuerzeichen mittendrin ist für einen Ausdruck
kein `javascript:`, für den Browser schon — und weil `new URL()` derselbe Leser ist, der
später auch das `href` liest, können die beiden nicht auseinanderlaufen.

Gefragt wird an drei Stellen in `js/ui.js`: `linkIcon()` (bei genau einem Link),
`linkText()` (der neue Helfer für die beiden Listen — Auswahlfenster und Posten-Fenster)
und `editLink()` beim Übernehmen (`link.urlBad`). **Weggeworfen wird nichts**: ein
gesperrter Link bleibt in der Datei und wird angezeigt, nur durchgestrichen und ohne Ziel
(`.lnblocked`, Sprechblase `link.blocked`) — derselbe Grundsatz wie bei `migrate()`, wer
eine Datei mit einer älteren Fassung öffnet, soll nichts verlieren.

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
`bindLinks()`, gebaut in `js/ui.js`, verwendet von `js/dialogs/item.js`). Je Zeile von links: der **Griff** ⋮⋮ zum Sortieren, der
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
mit `data-links="item:<id>"`, der `openLinkList()` öffnet — ein Fenster, in dem alle Links stehen. Ein
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
— der vierte Parameter ist der Monat, dessen Feld hervorgehoben wird. **Nur beim Setzen des Hakens.** Einen Haken wieder wegzunehmen
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
Monat (`td.amt` → `ui.month`), in den Import Details nur bei einem einzelnen Monat —
über das ganze Jahr zeigt ein Betrag auf zwölf und damit auf keinen.

## Unter der letzten Zeile einer Karte keine Trennlinie

Die dünne graue Linie unter einer Zeile (`.ledger td` in `css/ledger.css`) trennt zwei
Posten voneinander. Unter dem **letzten** steht keiner mehr: dort schließt die Karte selbst
ab, und ein Strich quer über ihren unteren Rand sähe aus, als käme noch etwas. Deshalb
nimmt `.card.sec-in|sec-flex|sec-out .ledger tr:last-child td` sie weg — für alle drei
Karten zusammen, damit sie nicht auseinanderlaufen. Die **mobile** Fassung macht es seit
jeher so (`css/mobile.css`); dort sitzt die Linie an der Zeile, nicht an der Zelle, weil die
Zeilen dort ein Raster sind.

Die Kategoriezeile (`tr.group`) ist davon unberührt — sie steht nie als letzte, denn ohne
Posten darunter wird sie gar nicht erst gebaut.

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
Namen (`.noteprev` — Jahresmatrix und Import Details), als Monatsnotiz in der
Monatsansicht (`.itemnote`, aufrecht und linksbündig — kursiv las sie sich wie ein
Einschub; ein senkrechter Strich davor bindet sie an ihre Position und wächst über alle
ihre Zeilen mit) und in der Monatszelle des Bearbeitungsfensters (`.cellnote`).

**Vorschau und Monatsnotiz sehen seit 22.8.26 gleich aus** — dasselbe Maß, dieselbe Farbe,
derselbe Strich davor. Beide stehen deshalb in **einer** Regel (`.itemnote,.noteprev` in
`css/tokens.css`); `.noteprev` legt allein den Abbruch nach zwei Zeilen darüber. Der
Abbruch bleibt der Unterschied und ist keiner des Aussehens: eine Zeile der Jahresmatrix
darf nicht mit der Länge einer Notiz wachsen, in der Monatsansicht steht die Notiz in einer
eigenen Zeile und darf ausschreiben. Wer das Bild ändert, ändert es damit an beiden
Stellen — eine Notiz, die je Ansicht anders aussähe, sähe nach etwas anderem aus. Auf einer
abgeschlossenen Zeile gilt dasselbe: die frühere Ausnahme in `css/matrix.css`, die die
Vorschau dort grau zurücktreten ließ, ist mit weg. Alle vier stehen auf `white-space:pre-wrap` — ein
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
  Monate bis … abschließen" im Posten-Fenster.

Der Name dazu kommt immer aus `MONTHS[CUR-1]` bzw. `MONTHS_LONG[…]`, nie aus dem Text.

## Der Weg zu einer Liste steht über der Liste

Ein Fenster, in dem aus einer Liste gewählt wird, sagt auch, wo diese Liste gepflegt wird:
eine dünne Zeile **über** den Auswahllisten, ein Weg je Liste (`setLinks()` /
`bindSetLinks()` in `js/ui.js`, `.listlinks` in `css/components.css`, Text `item.listsIn`).

* **Posten-Fenster**: Kategorien (Bereich `groups`, alle drei Listen) · Banken ·
  Zahlungsarten (beide `banks`). Zwei Wege in denselben Bereich sind kein Fehler: geklickt wird auf das, was
  gerade fehlt, nicht auf den Bereich, in dem es zufällig wohnt. Der Saldokorrektur fehlt
  die Kategorie, ihr fehlt auch der Weg.
* **„+ Neu…" im CSV-Import** (`c2NewTarget()`, seit 26.8.30): dieselben drei Wege, und aus
  demselben Grund. **Das Fenster geht auch ohne eine einzige Kategorie auf** — bis dahin
  wies es mit einer Kurzmeldung ab (`c2.needCats`, der Schlüssel ist weg), und der Nutzer
  stand vor einem Knopf, der nichts tat, ohne zu erfahren, wohin er sollte. Jetzt steht der
  Weg dorthin über den Listen; sein `relist()` baut die drei Auswahllisten neu und behält
  das Gewählte, der getippte Name bleibt ohnehin stehen.

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

Was das Posten-Fenster damit tut:

* **`relist()`** baut die drei Auswahllisten neu. **Gewählt bleibt, was
  gewählt war**; nur wenn es den Eintrag nicht mehr gibt, zählt der Posten selbst
  (`it.group`, `it.bank`, `it.pay`) — Umbenennen zieht ihn mit (`renameGroup`,
  `askCarryCodes`), und ein Fenster, das den alten Namen behielte, schriebe ihn beim
  Speichern zurück. Ein leeres Feld bleibt leer: „—" ist eine Wahl und keine Lücke.

**Ein Import nimmt alles mit.** `leaveTo()` entfernt **jedes** offene Fenster, nicht nur das
eigene: ein Posten-Fenster, das darunter stehen bliebe, schriebe seinen Stand danach in ein
Buch, das es so nicht mehr gibt.

Das Merkmal heißt `data-setlist` und **nicht** `data-lists`: jenes gehört den Ansichten und
wird in `wire()` bei jedem Zeichnen neu verdrahtet — es überschriebe den Rückweg.

## Ein Fenster steht in Blöcken

Das Fenster, in dem etwas geändert wird — `js/dialogs/item.js` (Posten aller drei
Bereiche, Saldokorrektur; das frühere Beträge-Fenster der flexiblen Kategorien ist seit
6.9.26 weg) —, trägt **dieses Gerüst**, in dieser Reihenfolge:

| | Block | worin |
|---|---|---|
| 1 | Bezeichnung | die Überschrift, sie ist der Knopf dazu (`.titlebtn`), davor die Notizlampe |
| 2 | Zuordnung | der Weg zu den Listen, Kategorie · Bank · Zahlungsart · Fälligkeit, letzte Zahlung |
| 3 | Zugehörige Links | die Liste samt Plus |
| 4 | Schnelleingabe | Rhythmus · ab wann · Betrag, **und der Schalter „geschätzt"** |
| 5 | Die Monate | die beiden Sammelknöpfe und die zwölf Kästchen |

Jeder Block steht in einem eigenen `.dgrp` (`css/components.css`): heller Grund, dieselbe
feine Kante und dieselbe 2-px-Rundung wie ein Knopf der Kopfzeile. **Überschriften tragen
die Blöcke nicht** — ihre Felder sind beschriftet, und ein Wort über jedem Block wäre genau
der Text, der ein Fenster zumüllt (siehe „Erklärender Text steht in der Sprechblase").
Getrennt wird über Abstand und Kante, nicht über Sprache.

**Die Notizlampe steht auf der Oberkante der Bezeichnung** (Lex, 10.9.26). Sie gehört zum
Namen und nicht zu der gepunkteten Linie darunter: so hoch wie ein Großbuchstabe, Oberkante
auf Oberkante — und bei einem zweizeiligen Namen bleibt sie oben auf der ersten Zeile. Dafür
ist die Überschrift eine Reihe (`flex`, `align-items:flex-start`); `vertical-align` kennt
nur die Grundlinie der **letzten** Zeile und ließ die Lampe mitwandern.

Drei Dinge, die man dabei wissen muss (alle drei standen am 10.9.26 als Fehler da):
ein `<button>` **erbt die Schriftgröße nicht** — ohne `font-size:inherit` rechnet jedes `em`
mit den 13 px des Browsers statt mit den 19 px der Überschrift; das Zeichen **füllt seinen
Kasten nicht aus** (die Lampe belegt 0.842 ihres viewBox), der Kasten muss also größer sein
als die Versalhöhe; und der Abstand nach oben lässt sich **nicht ausrechnen** — die Schrift
meldet einen Ascender von 18 px, Chrome benutzt fürs Zeilenlayout 16.08 px. Er ist deshalb
an gerenderten Bildpunkten abgezählt, bei dreifachem Zoom und an einem **flachen**
Großbuchstaben (B, N, H; ein A ragt oben spitz hinaus). Die Zahlen und der Weg stehen im
Kommentar in `css/components.css`.

**Unter der Bezeichnung steht nichts mehr.** Dort stand eine Zeile über abgeschlossene
Monate („bis Juli abgeschlossen", „alle Monate offen") — das sagen die gesperrten
Monatsfelder von selbst. Mit ihr sind zehn Schlüssel aus `js/i18n.js` verschwunden
(`item.dupSub`, `item.allOpen`, `item.lockedN`, `bal.hint`, `kdlg.dupSub`, `kdlg.newSub`,
`kdlg.allOpen`, `kdlg.lockedN`, `kdlg.hint`, `item.kind`).

**„Geschätzt" steht bei den Beträgen.** Es war ein eigenes Feld mit der Beschriftung
„Betragsart" über der Schnelleingabe und sah damit aus wie eine weitere Angabe des Postens;
es sagt aber etwas über die Beträge, und die tippt man in der Schnelleingabe. Die Kennungen
`#fEst` / `#kEst` bleiben, `collect()` liest sie wie zuvor.

**Am Schalter steht das Wort, der Satz dahinter in der Sprechblase.** `item.est` und
`kdlg.est` sind ganze Sätze („Summe ist geschätzt und kann abweichen …"); als Beschriftung
waren sie 450 bis 500 px breit und machten aus der Knopfzeile einen Absatz. Beschriftet ist
der Schalter jetzt mit `g.estimated`, der Satz hängt als `data-tip` daran. Aus demselben
Grund steht der Hinweis zur Schnelleingabe (`item.quickHint`) an „Übernehmen" und nicht mehr
daneben — die Knopfzeile ist damit 24 px hoch statt 64 (englisch) bzw. 80 (deutsch).

**Ein Quartal je Zeile.** `.mgrid` stellt die zwölf Monatskästchen zu **dritt** nebeneinander
— vier Zeilen statt zwei, jede Zeile ein Vierteljahr. Die Breite eines Kästchens bleibt
dabei dieselbe (rund 166 px); dafür ist das Fenster schmal: `.modal .box.form` ist
588 px = 3 × 166 + 2 × 8 Fuge + 2 × 12 Polster des Blocks + 2 × 22 des Fensters. **Wer an
einer dieser Zahlen dreht, rechnet die andere nach**, sonst stehen die Kästchen entweder
gequetscht oder mit einer leeren Spalte daneben. Im schmalen Fenster stehen die
Auswahllisten zu zweit (`.box.form .c4`): vier nebeneinander wären 120 px je Liste, und
darin ist von einer Kategorie nichts mehr zu lesen.

**Kopf und Knopfzeile stehen fest, gescrollt wird nur der Rumpf** (seit 23.8.26): die
großen Fenster — Posten, Einstellungen — tragen `.box.split`, und alles
zwischen Überschrift und `.row-end` steckt in einer `.dbody` (`css/components.css`):
Name und „Speichern" bleiben immer im Bild, gleich wie weit man in den Monaten steht.
Wer dort einen Block ergänzt, baut ihn **in** die `.dbody`; ein neues Fenster, das
scrollen kann, nimmt dieselben zwei Klassen.

Dieselbe Sprache gilt dem **Einstellungsfenster**: der gewählte Bereich (`.setpane`) steht
in einem Feld wie ein `.dgrp`, das Menü daneben. Die Haarlinie über der Knopfzeile
(`.row-end`) ist seit 23.8.26 weg: die Blöcke schweben über ihren Schatten (`--sh-grp`),
und das trennt Ausfüllen und Entscheiden deutlicher, als ein Strich es tat. **Die graue
Schrift ist in den Fenstern eine Stufe dunkler** (`--ink-2` wird an `.modal .box`
überschrieben, `css/components.css`): die Sätze unter Feldern und Knöpfen sind dort zum
Lesen da, nicht nur zur Orientierung.

## Das Einstellungsfenster

Links ein Menü, rechts der gewählte Bereich (`js/dialogs/settings.js`). Gebaut werden
**immer alle** Bereiche, umgeschaltet wird nur `hidden`. **Rollt nur der Bereich rechts**
(Lex, 7.9.26): der Rumpf `.dbody` rollt im Einstellungsfenster nicht selbst, das Raster
`.setlayout` bekommt seine Höhe (`minmax(0,1fr)`), und `.setpanes` ist die Rollfläche —
Menü und Überschrift bleiben stehen (`css/components.css`, Abschnitt „Einstellungen"). Das ist Absicht: `collect()` liest
die Felder aller Bereiche, und Getipptes überlebt so den Wechsel. Der gewählte Bereich
steht in `setPane` — einer Modulvariablen, nicht im Zustand: das Fenster baut sich bei
„+", Entfernen und Sortieren komplett neu auf, und ohne `setPane` landete man dabei jedes
Mal wieder ganz vorn. Ein neuer Bereich braucht drei Zeilen: einen Eintrag in `NAV`, einen
`pane(…)`-Aufruf und die Texte in `js/i18n.js`.

### Der Bereich „Darstellung"

Die Breiten der Jahresmatrix, die Schwelle der größten Einzelposten — und **zwei Haken,
die sagen, womit eine Datei aufgeht**:

| Haken | schreibt | gelesen in `afterLoad()` nach |
|---|---|---|
| „Monat mit aufgeklappter Auswertung öffnen" (`#sAna`) | `state.anaOpen` | `ui.ana` |
| „Jahr mit ausgeblendeten abgeschlossenen Monaten öffnen" (`#sHideDone`, seit 30.8.26) | `state.hideDoneMonths` | `ui.hideDone` |
| „Anleitung mit aufschlagen" (`#sGuide`, seit 8.9.26) | `state.guideOpen` | — gelesen in `render()`, siehe unten |

**Der dritte gilt zwei Anleitungen**, und das sagt auch sein Satz daneben
(`set.guideHint`): dem Bereich neben der Ansicht **und** dem Feld neben den Schritten des
CSV-Imports (`W.guide` in `openCsvWizard()`, `js/dialogs/csv2-wizard.js`). **Vorgabe ist
ja** — wer FINA zum ersten Mal öffnet, soll die Anleitung nicht suchen müssen; `migrate()`
gibt einer Datei ohne die Angabe deshalb `true` und nicht `false`. Gelesen wird er
**nicht** in `afterLoad()`, sondern in `render()` am Anfang, wenn `ui.enter>0` steht (also
beim Öffnen eines Buches, siehe „Bewegung"): der Bereich macht die Seite schmaler, und
eine Ansicht, die vorher gemessen wurde, spränge um seine Breite. Aufgeschlagen wird über
`openGuideSnap()` (`js/dialogs/guide.js`) — dasselbe wie `openGuide()`, nur ohne den
Übergang des Seitenpolsters (`body.gsnap`): die Ansicht fliegt gerade herein und bräche
sonst 280 ms lang in jedem Bild neu um. **Auf dem Telefon geht er von selbst nie auf**
(`isMobile()` in `render()` und in `applyGeneral()`): dort macht der Bereich die Seite
nicht schmaler, sondern legt sich darüber — er stünde vor dem Buch, das man gerade
geöffnet hat.

**Alle drei sind Vorgaben und keine Schalter**: was sie tun, steht in „Die Auswertung über der
Monatsansicht" und in „Die Leiste der Jahresansicht". Die Sätze daneben (`set.anaHint`,
`set.hideDoneHint`) sagen genau das, sonst suchte man hier den Weg zum Auf- und Zuklappen.

**Geändert wirkt sofort, ungeändert nicht** (`applyGeneral()`): steht der Haken anders als
im Zustand, wird `ui.…` mitgezogen — ein Haken, der erst beim nächsten Laden etwas tut,
sieht kaputt aus. Sonst bleibt die Anzeige, wie sie ist; sonst risse ein Speichern in den
Einstellungen zu, was man vorher von Hand aufgeklappt hat. Für die Anleitung heißt
dasselbe: gesetzt schlägt sie auf der Stelle auf, weggenommen geht sie zu — ein offenes
Fenster darüber bleibt dabei stehen.

### Der Bereich „Import"

**Drei Abschnitte untereinander** (seit 6.9.26): je eine Überschrift und darunter Knöpfe
derselben Bauart (`.impsec`, `.impline` als Spalte) — **„CSV-Daten importieren"** mit
`#impWipe` (alle importierten Daten löschen, rot `.delbtn`; ohne Import grau),
**„Importkriterien"** mit `#impCrit` („Alle gemerkten Importkriterien verwalten",
`openImpRules('all')`, legt sein Fenster über die Einstellungen), **„Gemerkte
CSV-Strukturen"** mit je Struktur einem Knopf über die volle Breite (`.btn.setmap`,
`data-cmed`: links der Name, rechts klein „gemerkt am"). Importiert wird **nicht** von
hier, sondern über das Menü der Kopfzeile; der Tabellenimport ist samt Funktion weg.

**Der Knopf einer Struktur öffnet `openCsvStructure(key,done)`** (`js/dialogs/csv2-wizard.js`)
— ein Fenster über den Einstellungen, mit `reopen` als Rückweg: drei Blöcke (`.dgrp.csgrid`)
— der Name allein, dann Datum und Betrag als Pflichtfelder, dann Referenz 1 bis 5 —, rechts
je ein Auswahlmenü mit den Spalten der Datei (`header`, sonst „Spalte n"). Dieselben Regeln
wie in Schritt 2 des Imports: ein Feld wohnt in einer Spalte, ohne Datum und Betrag wird
nicht gespeichert (`.errline`), ein Name, den eine andere Struktur trägt, auch nicht.
Gearbeitet wird auf einer Kopie; `header` und Schlüssel bleiben, sie **sind** die
Datei-Art. **Gelöscht wird dort auch**: „Diese Struktur aus FINA löschen" (`#csDel`, rot,
links in der Fußzeile bündig mit den Blöcken) fragt nach, nimmt die Struktur sofort aus dem
Buch und schließt; am Buch ändert sich sonst nichts — die Importkriterien bleiben an den
Posten. Dasselbe Fenster öffnet der Stift im Kasten von Schritt 1 des Imports.

### Der CSV-Import (`js/dialogs/csv2-wizard.js`, seit 24.8.26, umgebaut 6.9.26)

Liest jede CSV in drei Schritten — **Datei** · **Spalten & Felder** · **Zuordnen** — und
schreibt erst mit „Fertig" ins Buch (`c2Apply()`): je Posten `amounts`, `paid`, `imp` (1
gemerkt, 2 einmalig) und `impRows` (die Quellzeilen `{d,v,r}`), für flexible Posten
außerdem `state.flexSource[m]` als Etikett. **Ein Monat mit Quellzeilen wird ergänzt, nicht
ersetzt** (6.9.26): neue Zeilen kommen dazu, der Betrag ist die Summe. Der Arbeitsstand
lebt in `W`, nur solange das Fenster offen ist. Wie die Datei innen aussieht, steht in
`FINA Strukturen und Objekte/` — **vor jeder Änderung an der Struktur wird Lex gefragt**,
und migriert wird beim Lesen (`migrate()`).

* **Sieben Importfelder:** Datum, Betrag, Referenz 1 bis 5 (`C2_FIELDS`, `C2_REFS`; die
  fünfte seit 6.9.26). Die Referenzen sind gleichrangige freie Felder; im Buch stehen sie
  als Liste `r` an den Quellzeilen.
* **Ein Referenzfeld darf einen eigenen Namen tragen** (Lex, 8.9.26): der **Stift** neben
  der Feldwahl in Schritt 2 und vor jeder Referenzzeile im Fenster der Importzuordnung
  öffnet dasselbe kleine Fenster (`c2RenameRef()`), leer heißt wieder „Referenz n",
  höchstens 24 Zeichen, je Zuordnung nur einmal vergeben. Datum und Betrag bleiben, wie
  sie heißen — ihre Bedeutung steht in FINA fest. **In Schritt 3 wird nicht umbenannt**;
  dort steht der Name groß und der Kopf aus der CSV-Datei klein darunter.
  **Der Name ist eine Beschriftung, niemals ein Schlüssel** — gespeichert und verglichen
  wird weiter `ref1` … `ref5`, die Importkriterien hängen also nicht daran (dasselbe
  Verhältnis wie `keyLabel()` zu den festen Kategorie-Schlüsseln, Regel 3). Er wohnt an
  der Zuordnung (`csvMaps[…].rn`, Arbeitskopie `W.rn`) und **wandert beim Import ins
  Buch**: `c2NameId()` legt in `state.impNames` einen Satz an (oder findet einen mit
  denselben Namen), und jede Quellzeile trägt seine Kennung als `n`. **Eine Zeile behält
  damit den Namen, unter dem sie hereinkam** — wer später umbenennt oder die Zuordnung
  löscht, ändert nur, was der nächste Import mitbringt; zwei Importe mit verschiedenen
  Namen stehen an demselben Posten nebeneinander. Gelesen wird das über `refLabel()` und
  `refSource()` in `js/calc.js` (die Liste im Posten-Fenster, `impSideRows` in
  `js/ui.js`); ohne Umbenennung gibt es weder Tafel noch Stempel, und die Datei sieht aus
  wie zuvor. Verwaiste Namenssätze nimmt `migrate()` beim Öffnen heraus. Eine **Art** der Datei gibt es nicht mehr — Kriterien
  gelten für alle drei Bereiche, der Import zeigt alle Ziele zusammen.
* **Struktur und Kriterien sind getrennt.** Die **Struktur** (`state.csvMaps[key]` =
  `{date, file, f, header}`) ist die Feldverknüpfung je Datei-Art; Schlüssel ist der
  Fingerabdruck der Spaltenköpfe (`c2Fp()`), eine zweite Struktur derselben Art liegt
  unter `fp#2`, `fp#3` … (`c2MapsFor`, `c2MapKey`). Die **Importkriterien** wohnen am
  Posten (`impRules[]`, je Regel `{terms:[{f,op,val}]}`) und nennen **Felder, nie
  Spalten**. `migrate()` übersetzt die älteren Formen (Regeln je Datei-Art, `kind`,
  `main`/`cat`/`desc`) — siehe das Strukturdokument.
* **Schritt 1:** Datei wählen. Unter dem Beschreibungssatz steht der Hinweis, dass die
  CSV-Datei **eine Kopfzeile braucht** (`c2.needHead`, im Bild des Merksatzes der
  Anleitung `.gcall` — keine Alarmfarbe, siehe „Die Farbsprache"): FINA liest daraus die
  Namen der Spalten, den Fingerabdruck der Datei-Art und die Erkennung der Felder; fehlt
  sie, nimmt `c2UseHeader()` die erste Buchung dafür, und die ist dann keine Buchung mehr. Kennt FINA die Datei-Art, steht der orange Kasten
  (`.c2known`) mit je Struktur einer Zeile (Name · Tag · Stift · ✕, bei mehreren ein
  Radio): **„Automatisch CSV-Datenstruktur vorbereiten"** bringt die Felder mit und geht
  nach Schritt 2 (`W.autoCols`), **„CSV-Datenstruktur von Grund auf neu anordnen"** fängt
  leer an. Eine unbekannte Datei springt gleich nach Schritt 2. „Weiter" ist schwarz.
* **Schritt 2:** die Beschriftungszeile (Spalte **HDR**, seit 7.9.26 in beiden Sprachen — ein
  Kürzel wie B · PT · DD · LP), die Spalten (jeder Spaltenkopf
  ein Knopf), über jeder gewählten Spalte ihr Feld.
  **Darüber stehen zwei Zeilen** (Lex, 9.9.26): ein Satz in der Akzentfarbe, der auf die
  Anleitung zeigt (`c2.howGuide`, `.c2guideto`), und darunter in **einer** Zeile, was die
  Datei hergibt — Spalten mit Überschrift und Zeilen zum Einlesen (`c2.avail`,
  `.c2avail`; sie bricht nie um, bei zu wenig Platz endet sie mit „…"). Nur wenn lesbare
  Zeilen **außerhalb** des Buchjahrs liegen, hängt die Warnung `c2.infoOther` daran —
  eine Auskunft, keine Regel. Die drei nummerierten Schritte im Fenster
  (`c2.how1`…`how3`), die Zählung `c2.colsCnt` und der Vorschau-Hinweis `c2.preview` sind
  **weg**: sie sagten in vier Zeilen dasselbe wie die Anleitung daneben. **Und die Knöpfe
  „Alles wählen" · „Alles abwählen" ebenso** — gewählt wird an den Spaltenköpfen, und
  seit dem 8.9.26 bringt jede gewählte Spalte ihr Feld schon mit. „Spalten speichern und weiter" prüft
  erst Datum und Betrag (`c2Missing`), dann **gewählte Spalten ohne Feld** (`c2LooseCols`,
  6.9.26): ein Fenster nennt sie und bietet „Abwählen" an — das bleibt im Schritt, damit man
  das Ergebnis sieht; „Abbrechen" lässt alles stehen. Danach der Name (`c2AskMapName()`,
  mit dem Haken „bisherige behalten und diese dazu merken") und `c2SaveCols()`; kam die
  Struktur aus dem Gemerkten und steht noch so da (`c2ColsSame()`), heißt der Knopf nur
  „Weiter". Nach Schritt 3 kommen nur verknüpfte Spalten mit (`c2GoStep3()`).
  **Jede gewählte Spalte bekommt sofort ein Feld** (Lex, 8.9.26; bis dahin nur eine,
  deren **Überschrift** danach klang — alles andere blieb leer und wurde von Hand
  gestellt). `c2GuessCol(i)` fragt dafür `c2ColKind(i)`: **Datum**, wenn in der Spalte
  Datumsangaben stehen, **Betrag** bei Geldbeträgen, **sonst die nächste freie Referenz**
  — in der Reihenfolge, in der gewählt wird (erste Textspalte = Referenz 1, zweite =
  Referenz 2). **Beim Abwählen wird die Referenz frei** und rutscht nach: wer Referenz 1
  abwählt und eine andere Spalte wählt, bekommt wieder Referenz 1. Belegt bleibt belegt
  — eine zweite Datumsspalte (Buchung und Wertstellung stehen oft nebeneinander) bekommt
  eine Referenz; sind alle sieben Felder vergeben, bleibt die Spalte ohne, und „Weiter"
  fragt über `c2LooseCols`.
  **Erkannt wird über den Inhalt, nicht über den Namen** — `c2ColKind()` liest die ersten
  60 Zeilen mit **denselben** Funktionen, die auch importieren (`c2Date`, `c2Amount`):
  was hier als Datum durchgeht, kann der Import auch lesen. Gezählt wird über die
  gefüllten Zellen, 70 % entscheiden; die Überschrift ist nur eine Abkürzung
  (`C2_HDATE`, `C2_HAMT`). **Eine Zahl ist noch kein Betrag** (`c2Money`): Beleg- und
  Kontonummern sind ebenfalls Ziffern, deshalb zählt nur, was Nachkommastellen, ein
  Vorzeichen oder ein Währungszeichen trägt — es sei denn, die Überschrift sagt ohnehin
  „Betrag". „Saldo" steht in `C2_HAMT` ausdrücklich **nicht**: der laufende Kontostand ist
  Geld, aber nicht der Betrag der Buchung.
  **Gelesen werden die gängigen Formate** (8.9.26 erweitert): beim Datum `24.08.2026` ·
  `24.08.26` · `2026-08-24` (auch mit Uhrzeit) · `2026/08/24` · `24-08-2026` ·
  `08/24/2026` · `20260824` · `24. Aug 2026` · `Aug 24, 2026`; beim Betrag `-73,25` ·
  `73,25-` · `(73,25)` · `1.234,56` · `1,234.56` · `1'234.56` · `1 234,56` · `12,34 €` ·
  `EUR 12,34` · `−12,34`. **Beim Schrägstrich bleibt es bei „Monat zuerst"**, wenn die
  Reihenfolge nicht zu sehen ist (`03/04/2026`): steht die erste Zahl über 12, ist sie
  der Tag, steht die zweite über 12, umgekehrt — sonst gilt, was FINA immer gelesen hat.
  Ein stiller Wechsel verschöbe die Buchungen alter Importe.
* **Schritt 3:** oben alle drei Bereiche wie die Jahresmatrix (`tbody.c2blk`, Kategorien
  als klebende Zeilen, Ziel per Klick orange; **die Blockzeile klappt ihren Block** mit
  einem Klick — `data-c2blk`, `W.blkFold`, seit 6.9.26 spät —, und rechts in der Kopfzelle
  „Ziel" fährt beim Überfahren „Alle aufklappen / Alle zuklappen" heraus, `data-c2foldall`,
  `.c2foldall`; die sechs Vergleichsarten im Zeilenfilter tragen je ein Zeichen
  `--ic-op-*`, und die Zielzeilen lassen sich nicht als Text markieren — „Die Zeilen sind
  Ziele, kein Text"), in der Mitte die Zuordnungsleiste (☰ mit
  rotem Punkt, solange ein Filter etwas trägt · „Modus: Einmalige Zuordnung" · „Zuordnen
  und merken" · „Neu anlegen und zuordnen" · rechts der Schalter „Schon zugeordnete
  CSV-Zeilen verbergen/zeigen" (`W.showOld`) und „Automatisch zuordnen mit gemerkten
  Importkriterien…"; **passt die Leiste nicht in die Zeile, ziehen sich ihre Knöpfe ins
  ☰-Menü zurück** — `c2FitBar()`, gemessen wie `fitHeaderBtns()`, seit 7.9.26: erst
  „Automatisch zuordnen…", dann „Schon zugeordnete…", dann der Modus-Knopf, markiert mit
  `data-c2fit`; „Zuordnen und merken" bzw. „Einmalig zuordnen" und „Neu anlegen und
  zuordnen" bleiben immer stehen (Lex). `W.inMenu` sagt, was im Menü steckt;
  `c2AssignMenu()` baut daraus Einträge zuoberst, die den versteckten Knopf drücken. Ein
  Rollbalken quer über die Knöpfe — bis dahin `overflow-x:auto` an `.c2row` — war Lex
  „hässlich"), unten die Dateizeilen mit Filter je Feld und Schnellfilter. **Die
  Spalte „X" steht immer**: Zeilen, die schon im Buch stehen (`W.inBook`, `c2ScanBook()`
  über Datum · Betrag · Referenzen), stehen grau mit Kreuz, schreibgeschützt und nie wieder
  zuordenbar — **und ebenso Zeilen, die dieser Lauf zugeordnet hat** (`asg`, 6.9.26 spät;
  ein Klick öffnet ihre Regel). Der Schalter verbirgt beide Sorten. Ein Filter allein über
  den Schnellfilter trägt keine Regel (`c2.tOnlyQ`). Das Wahl-Fenster der gemerkten
  Kriterien (`c2MapPick`, 940 px, Blöcke in Bereichsfarben, Stift je Posten, die Zeilen
  als Tabelle) zeigt nur Posten mit **neuen** Zeilen; schon importierte stehen darin grau
  mit Kreuz. Gelb heißt „in diesem Lauf zugeordnet" (im Zielbereich), Cyan „früher
  importiert", Grau „schon im Buch" (siehe „Die Farbsprache"). Ein einzelner Buchstabe
  ohne Fokus geht in den Schnellfilter (`c2Keys()`).
* **Die Anleitung daneben** (`C2_GUIDE`, Knopf „Anleitung" ganz links in Schritt 2 und 3)
  **liegt über allem und geht über die ganze Höhe des Fensters** (Lex, 9.9.26; bis dahin
  war sie eine zweite Spalte in `.c2work` und fing unter der Knopfzeile an): ging sie auf,
  wurde der Schritt daneben schlagartig ein Drittel schmaler, ging sie zu, sprang er
  ebenso schlagartig auf — und das schon im ersten Bild, während sie selbst noch fuhr.
  Jetzt hängt `.c2gpanel` absolut an der **Box** (`top:0;right:0;bottom:0`), und nichts
  darunter ändert dabei seine Breite.
  **Ein ✕ trägt sie nicht mehr:** auf und zu geht sie allein über den Knopf „Anleitung"
  in der Kopfzeile, und der sagt, woran er ist — zu ist sie, steht er weiß mit oranger
  Schrift, offen trägt er die Farbe gefüllt (`.c2gbtn`).
  **Ein Maß trägt alles: `--c2gw` an der Box.** Kopfzeile und Bedienzeilen hängen mit
  ihrem Polster daran (`.c2head`, `.c2bar`, `.c2guideto`, `.c2avail`, `.c2mid`,
  `.c2qbar` — sie rollen nicht, verdeckt wären sie schlicht weg), die Tabellen in den
  Rollflächen mit ihrem **Außenabstand** (kein Polster der Rollfläche: das verkleinerte
  deren Inhaltsfläche, und die Tabellen mit `min-width:100%` würden schmaler — genau der
  Sprung, der weg soll). Was unter der Anleitung liegt, holt der Rollbalken hervor.
  Weil `.c2mid` das Polster trägt, misst `c2FitBar()` mit `row.clientWidth` von selbst
  die sichtbare Breite.
  **Beim Auf- und Zugehen fährt alles mit** (`C2_GUIDE_MS`, 920 ms, dieselbe Kurve wie
  die Fahrt des Feldes): `--c2gw` bekommt einen Übergang, die Knöpfe der Kopfzeile
  gleiten nach links und wieder nach rechts — und weil der Rollbereich dabei schrumpft,
  **zieht der Browser einen Rollstand, der zu weit rechts steht, von selbst mit**
  (nachgemessen: 585 → 335 → 85). Gesetzt wird das Maß im **nächsten Bild**
  (`c2GuideToggle`, `W.gwait`): ein Übergang braucht einen Zustand, von dem aus er
  losläuft. Beim Ziehen am Griff bleibt er weg (`.gdrag`). Die Texte stehen in der Datei,
  nicht in `js/i18n.js`.
  **Aufgeschlagen fängt sie an** (seit 8.9.26), solange die Datei es sagt: `W.guide`
  kommt in `openCsvWizard()` aus `state.guideOpen` — derselbe Haken, der die Anleitung
  neben der Ansicht aufschlägt (Einstellungen → Darstellung). Zu sehen ist sie erst ab
  Schritt 2; Schritt 1 ist eine Dateiauswahl und baut das Feld gar nicht
  (`c2Render()`). **Seit 7.9.26
  nach der Vorlage `_BusinessCenter/DESIGN/260907 Guide für Wizard (von GPT).html`**:
  zuerst „Kurz erklärt" (die drei Bereiche des Fensters in drei Zeilen), dann die Tabelle
  „Was möchtest du tun?" (`.gtab`: wenn du … dann wähle …), je Weg seine Schritte, ein
  Tipp als Merksatz (`.gcall`), die Farben, „Abschließen oder abbrechen" — und unter „Mehr
  im ☰-Menü" der Satz, dass schmale Fenster Knöpfe der Leiste dorthin verlagern. Die
  Knopfnamen stehen wörtlich so wie in `js/i18n.js`. Kein „Oben: … Darunter: …" (das fand
  Lex schrecklich). **Das Feld trägt denselben Kopf wie der Guide der Anwendung**
  (`c2GuidePanel()`): EN · DE (`W.gLang`, Vorgabe die Sprache der Oberfläche, schaltet nur
  die Anleitung um), der Pfeil in einen eigenen Reiter (`c2GuideDoc()`, beide Schritte
  hintereinander, `.guide.gpage`, schließt das Feld) und das ✕; links der Griff
  (`c2GuideHandle()`, `.ghandle`) — **mindestens ein Drittel des Fensters** (`W.guideW`,
  `c2GuideWidth()`, Vorgabe genau ein Drittel in px), höchstens zwei Drittel des
  Wizard-Fensters. Der Kopf steht fest, nur `.c2gbody` rollt. Herein fährt es von rechts
  (`.slidein`, nur beim Öffnen — `W.guideAnim`), hinaus als Geist in einem beschnittenen
  Rahmen (`c2GuideGhost()`, `.c2gghostwrap`), siehe „Bewegung".
* **Das Fenster „Importkriterien"** (`openImpRules('all',done)`, `.cmebox` 1240 px) zeigt
  je Regel einen weißen Block — Posten oben, Bedingungen als Zeilen Feld · Vergleichsart
  („Enthält" …) · Wert · „Diese Regel löschen" —, gegliedert wie der Zielbereich mit
  klebenden Bereichsköpfen. Arbeitskopie, „Speichern" schreibt an die Posten. Erreichbar
  über das ☰ der Zuordnungsleiste und über `#impCrit` in den Einstellungen; das Zeilenmenü
  eines Ziels bietet „Nach gemerkten Kriterien suchen" (`critq`, lädt die Bedingungen als
  Filterzeilen). Denselben Block trägt jedes Posten-Fenster unter den Monaten (`impCrit*`),
  samt „Alle Importdaten löschen", das auch schwebende Zuordnungen des offenen Imports
  zurücknimmt (`impWipeAsk`, `c2Unassign`).

## Eine FINA-Tabelle einlesen — gibt es nicht mehr

Der Tabellenimport (`js/sheet.js`, `js/dialogs/sheet-import.js`, Knopf in den
Einstellungen, Feld `#fileSheet`) ist seit 6.9.26 samt Funktion und Wörterbuch heraus. Wer
eine Tabelle hereinholen will, exportiert sie als CSV und nimmt den CSV-Import.

## Erklärender Text steht in der Sprechblase, nicht in der Ansicht

**Eine Ansicht zeigt Zahlen, keine Erklärungen.** Wer einen Satz schreiben will, der sagt,
wie etwas zu lesen ist oder was ein Zeichen bedeutet, hängt ihn als `data-tip` an genau das
Element, um das es geht — nicht als Absatz darunter. Ein Absatz steht immer da, für jeden,
in jeder Sitzung; gelesen wird er einmal, und danach nimmt er der Liste den Platz weg, für
die man die Ansicht geöffnet hat. Die Sprechblase steht nur da, wenn jemand fragt, und sie
steht bei dem, wonach er fragt.

Deshalb sind am 20.8.26 aus den Ansichten verschwunden: der Absatz über die Marke „Art" in
den Import Details (jetzt `kak.kindTip` an der Marke), die beiden Sätze über den
Zeilenpfeil und die Herkunft eines Betrags (der Pfeil trägt seinen `title` längst selbst),
der Absatz unter der Prognose über blasse Monate und die Leserichtung einer Zeile (jede
Spalte hat ihre Sprechblase) und die Überschrift „Ausblick 2026" über der Kennzahlenleiste
(die Karte darunter heißt „Hochrechnung 2026"). Vorher schon: der lange `.note`-Absatz unter
der Jahresmatrix und der Erklärsatz über dem Zeitstrahl.

**Was bleiben darf**, ist kein erklärender Text, sondern Auskunft:

* **Zeichenerklärungen** — die Farbmarken unter dem Zeitstrahl und unter dem Verlauf
  (`.thint`) und `year.legend` neben
  den Reitern. Sie benennen, was allein die Farbe oder ein Zeichen sagt; eine Sprechblase
  erreichte nur, wer schon weiß, worauf er zeigen muss. **Die Siegelerklärung der
  Monatsansicht (`.legendbar`) ist seit 23.8.26 weg** — die Siegel erklären ihre
  Sprechblasen und die Anleitung; die Schlüssel (`month.legTitle` …) bleiben in
  `js/i18n.js`.
* **Leere Bereiche** — „Keine Einnahmen hinterlegt", „Keine Posten für diesen Filter".
  Dort ist der Satz der Inhalt und verdrängt nichts.
* **Zahlen über Zahlen** — „(4 ausgeblendet)", „35 Buchungen ab 50,00", der Maßstab einer
  beschnittenen Achse. Das sind Angaben und keine Erklärungen.

## Die Anleitung ist ein Bereich, kein Fenster

`js/dialogs/guide.js` hängt die Anleitung als `<aside class="guidepanel">` rechts an den
Bildschirmrand: sie bleibt offen, während man in der Tabelle weiterarbeitet. Derselbe
orange Knopf `#btnGuide` klappt sie auf und wieder zu (`toggleGuide()`), `aria-pressed`
sagt, ob sie offen ist. Auf und zu geht sie animiert — von rechts herein, nach rechts
hinaus (siehe „Bewegung") —, **und die Seite schrumpft mit** (Lex, 7.9.26): das Polster
von `.wrap` geht in derselben Zeit und Kurve über (`transition:padding-right` in
`css/components.css`, die eine Stelle, an der bewusst ein Maß bewegt wird), beim Ziehen am
Griff ohne Übergang; `transitionend` ruft `syncMatrixHead()`. **Die Bilder der Anleitung
laden faul** (`loading="lazy" decoding="async"` in `gshot`): mit allen zwölf Bildern auf
einmal stand das erste Öffnen 230 ms lang — gemessen mit Electron offscreen (siehe
„Prüfen").

Die Breite steht in der CSS-Variablen `--guidew` — beim ersten Öffnen ein Drittel des
Fensters, **mindestens aber so breit, dass die drei Reiter in eine Zeile passen**
(`guideTabsNeed()`, gemessen; Lex, 7.9.26), danach das, was am Griff (`.ghandle`) gezogen
wurde, begrenzt auf 300 px bis zwei Drittel. **Die Reiter brechen nie um**: zu schmal
gezogen ist die Beschriftung rechts abgeschnitten (`nowrap`, `text-overflow:ellipsis`), und
`syncGuideTabs()` hängt den vollen Namen als `data-tip` an — nur an Reiter, denen wirklich
etwas fehlt. Dieselbe Variable macht die Seite schmaler (`body.guideon .wrap`); überdeckt wird
nichts. Der Wert lebt nur in der Sitzung (`guideW`), nicht im Zustand und nicht in der
Datei. Jede Änderung der Breite ruft `syncMatrixHead()` — die mitlaufenden Leisten sind
sonst falsch gemessen.

`renderChrome()` ruft `renderGuide()` — die Funktion tut nichts mehr (siehe unten). Escape
schließt den Bereich nicht: das gehört den Fenstern.

**Sie geht von selbst auf** (seit 8.9.26), sooft ein Buch aufgeht — und das sagt die
Datei: `state.guideOpen`, ein Haken im Einstellungsfenster unter „Darstellung"
(`#sGuide`, `set.guide`; Vorgabe **ja**, siehe „Der Bereich „Darstellung""). Derselbe
Haken schlägt die Anleitung neben dem CSV-Import auf. Wer ihn wegnimmt, sieht beide nur
noch, wenn er den Knopf drückt. Gerufen wird `openGuideSnap()` in `render()`, solange
`ui.enter>0` steht — **vor** dem Zeichnen und ohne den Übergang des Seitenpolsters, und
auf dem Telefon gar nicht. Auf der Begrüßungsseite bleibt der Bereich weg: dort gibt es
noch keine Datei, die es sagen könnte.

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

**Die Bausteine der Anleitung** (seit 7.9.26, nach der Vorlage
`_BusinessCenter/DESIGN/260907 Guide für FINA (von GPT).html`): `gcall` (der Merksatz mit
oranger Kante), `gstep` (nummerierter Schritt mit Kreis), `gcard` (Kärtchen eines Bereichs
mit seiner Kante, `.t-in/-out/-flex/-bal`), `gfeat` (je Funktion ein Block: Titel und
Unterzeile, dann Text — auf der ganzen Seite nebeneinander, im Bereich untereinander) und
`gver` (eine Version als Karte). Die Regeln stehen in `css/components.css` unter „Die
Bausteine der Anleitung"; die Wizard-Anleitung nutzt `.gcall` und `.gtab` mit. „Schritt
für Schritt" hat sieben Schritte mit je einem Bild — nur „Speichern" ohne —, darüber
„In etwa 30 Minuten startklar" und „Die einfache Regel"; „Was FINA kann" fängt mit den
drei Fragen an, dann vier Kärtchen, dann die Blöcke, am Ende „Was FINA nicht ist".
**„Import Details" kommt dort nicht mehr vor** (Lex, 7.9.26: den Reiter soll es so nicht
mehr geben), und von den Mac-/Windows-Apps steht in keinem Reiter mehr etwas.

**Drei Reiter, drei Fragen.** `GUIDE` in `js/dialogs/guide.js` hat drei Zweige mit je einer
englischen und einer deutschen Fassung: `steps` führt einen Anfänger einmal von oben nach
unten durch das Anlegen des Buches und endet mit dem Monatsrhythmus; `product` beschreibt,
was die Anwendung kann; `news` ist die Versionsliste und steht als letzter. Gewählt wird
über `guideTab` (Modulvariable, nicht im Zustand) und `guideTo(tab)`. Ein weiterer Reiter
braucht einen Zweig in `GUIDE`, eine Zeile in `GUIDE_TABS` und einen Schlüssel in
`js/i18n.js`.

**Im Reiter „Was ist neu" ist jede Version eine Karte** (`gver`, seit 7.9.26): die Nummer
als Marke (`.gtag`), eine Überschrift, die in einem Satz sagt, was der Nutzer davon hat,
ein Satz dazu (bei älteren Versionen entfällt er) und eine Häkchenliste (`ul.gcheck`) — je
Punkt eine Zeile. Nur die **größeren funktionalen** Änderungen bekommen einen eigenen
Punkt, und der sagt, was der Nutzer jetzt tun kann — kein Warum, keine Begründung, keine
Aufzählung von Einzelheiten. Alles Übrige — Kosmetik, kleine Anpassungen, behobene Fehler —
wird zu **einem** Punkt am Ende zusammengefasst: „Bugfixing und kosmetische Anpassungen."
Eine Versionsliste wird gelesen, solange sie sich überfliegen lässt.

**Die neueste Fassung ist gelb** (`.gver.cur`, `--amber`): Rahmen und Grund der Karte, und
die Marke „Aktuelle Version" / „Current version" (`.pill`) neben der Nummer — das vierte
Argument von `gver`, nur die oberste trägt es. Rot wäre eine Warnung, Grün eine Bestätigung
— Gelb zieht den Blick, ohne etwas zu behaupten.

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
erkennen wäre. Die Bilder entstehen mit `doc/make-shots.py` (baut aus `fina-online.html` eine
Wegwerfseite, lädt eine Beispieldatei hinein, fotografiert mit Chrome ohne Fenster).

**Drei Dinge muss wissen, wer das Skript anfasst** (alle drei am 23.8.26 nachgezogen, als
die Bilder das erste Mal nach dem Mac-Redesign entstanden):

* **Der Ausschnitt (`only=…`) klebt nicht.** Klebende Teile werden auf `position:relative`
  gestellt und verlieren dabei `top`/`left`/`right`/`bottom` — **beides ist nötig**. Auf
  `static` verliert die `::before`-Schicht des Kartenkopfes ihren Bezug und färbt die
  ganze Seite in der Farbe des letzten Blocks; behielte sie ihre Maße, schöbe `top` die
  Filterleiste quer über die erste Karte und `left` die klebenden Spalten (END in der
  Prognose) um ihre Klebestelle nach rechts.
* **Die Rollflächen geben ihre Höhe frei.** `#monthScroll` und `.yearscroll` rechnen sie
  aus der Fenstergröße; im Ausschnitt gibt es kein Fenster, an dem sich das messen ließe.
* **`all=1` heißt „nichts ausgeblendet"** — es setzt `state.hideDoneMonths=false` und
  `ui.hideSettled=false`. Die Beispieldatei kann beides gesetzt haben, und ein Abzug, der
  zwölf Monate zeigen soll, zeigte sonst fünf. (Bis 23.8.26 setzte der Schalter
  `ui.showAll`, das es nicht mehr gibt.)

**Das Skript wird nicht von selbst aufgerufen.** Bildschirmfotos macht nur, wer
ausdrücklich darum gebeten wird — die Bilder in `doc/img/` altern also gegenüber der
Oberfläche, und das ist so gewollt. Prüfen lässt sich eine Änderung auch ohne Bild: Maße
und berechnete Stile aus dem DOM lesen (`--dump-dom`) sagt genauer, ob etwas an der
richtigen Stelle steht, als ein Blick auf ein Standbild.

Die Zeichenerklärung der Monatsansicht (`.legendbar`) gibt es seit 23.8.26 nicht mehr
(siehe „Erklärender Text steht in der Sprechblase"): die Siegel erklären ihre
Sprechblasen und die Anleitung. Der Abzug `legend` ist deshalb aus `SHOTS` heraus — sein
Bild wäre leer; `legend.png` liegt noch in `doc/img/` und wird von der Anleitung noch
gezeigt (ein Punkt in `doc/GUIDE-TODO.md`).

**Wo ein Bild in einem nachgebauten App-Fenster steht** (`.shotwin` auf `guide.html`),
darf es die **echte** Kopfzeile nicht mitbringen — sonst stehen zwei übereinander.
Deshalb fotografiert `forecast` seit 23.8.26 nur `#view`, wie `month-slim`; die
Jahresmatrix kommt ohne aus, weil ihr Ausschnitt unterhalb der Kopfzeile aufsetzt
(`data-pan-y="8"`).

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

## Importiert ist ein eigener Stand, und er sieht überall gleich aus

Ein Monat kann abgehakt sein, weil jemand ihn bestätigt hat — oder weil er aus einer CSV
kam. Das ist nicht dasselbe, und seit 26.8.30 sagt es **jede** Stelle, an der der Stand
eines Postens steht: statt des Hakens der Download-Pfeil (`IMPORT_SVG` in `js/config.js`)
in **elektrischem Blau** (`--imp`, `css/tokens.css`).

| Wo | Bild | gebaut in |
|---|---|---|
| Siegel der Monatsansicht | weißer Pfeil auf blauem Grund (`.seal.imp`) | `js/views/monat.js` |
| Zeichen der Jahresmatrix | blauer Pfeil als Strich (`.mk-imp`) | `js/views/jahr.js` (`okSym()`) |
| Monatskachel im Posten-Fenster | wie das Siegel | `js/dialogs/item.js` |

**Die Farbe ist mit Absicht laut.** Die Palette ist sonst gedeckt; Rot heißt „jetzt", Grün
„erledigt", Gelb heißt seit 30.8.26 **„gefiltert"** (`--flt`, siehe unten) — für den Import
blieb Blau, und ein gedecktes Blau ginge zwischen den Kanten der Saldokorrektur unter. „Das
hat nicht der Nutzer eingetragen" muss man finden, ohne danach zu suchen.

**Das Zeichen ist nur der Pfeil**, ohne Strich darunter: bei 9 px in einer Tabellenzelle
wurde die Grundlinie zu einem Fleck. Und **der Haken hat seinen eigenen hellen Grünton**
(`--ok-lit`): `--ok` bleibt die gedeckte **Betragsfarbe**, eine Spalte aus neongrünen
Zahlen liest sich nicht.

## Die Farbsprache: jede Farbe sagt genau eine Sache

Sie gilt in der ganzen Anwendung und gehört keinem Bereich. Wer eine Fläche baut, die
einen dieser Zustände meldet, nimmt diese Farbe — und keine zweite Bedeutung dazu:

| Merkmal | Farbe | heißt |
|---|---|---|
| `--accent` / `--accent-soft` | Orange | **hier kann man handeln** oder **das ist gewählt** — Knöpfe, Weiterlese-Links, Sprungmenü, die gewählte Zeile |
| `--imp` | Cyan `#00D7FF` | **kam aus einem Import** — nicht der Nutzer hat es eingetragen |
| `--ok-lit` | Grün `#00BC00` | **von Hand abgehakt** |
| `--flt` | Neongelb `#FFFA00` | **hier wird gerade gefiltert** |
| `--seal` | Rot | **jetzt** — der laufende Monat, die laufende Zeile |
| `--amber` | Bernstein | **geschätzt**, noch nicht bestätigt |

**Gewählt schlägt alles.** Im Zielbereich des CSV-Imports kann eine Zeile zugleich
importiert (Cyan), frisch zugeordnet (Gelb) und gewählt sein — dann gilt Orange: „hier
arbeite ich gerade" ist unabhängig davon, woher die Zahlen kommen. Cyan an dieser Stelle
sagte „importiert" und nicht „gewählt", und dann hieße dieselbe Farbe zweierlei.

**Auf dem Cyan steht Tinte, nicht Weiß.** Es ist so hell, dass ein weißer Strich darin
verschwindet — der Pfeil im Siegel, das Zeichen im Kreis und die Schrift der gewählten
Zeile sind deshalb dunkel. Wer die Farbe ändert, prüft das mit.

**Der Stand eines Postens ist überall derselbe Kreis** (`.statmark`, seit 30.8.26): gefüllt
grün mit Haken (abgehakt), gefüllt cyan mit Pfeil (importiert), eingefasst mit `?`
(geschätzt) — und nichts, wo nichts ist. Vorher trug die Monatsansicht ein Siegel, die
Jahresmatrix einen nackten Haken und der CSV-Zielbereich wieder etwas anderes; derselbe
Stand sah in drei Ansichten verschieden aus. Die nackten Zeichen `.mk-ok`/`.mk-q` gibt es
nur noch **im Fließtext** (Zeichenerklärung, Anleitung), wo ein Kreis mitten im Satz zu
groß wäre.

**Neongelb heißt „gefiltert", überall** (seit 30.8.26): die Filterleisten von Monat und
Jahr (`.filterbar.on`, `.ybrow.on`), der ☰-Knopf des Telefons (`.mfbtn.on`), die
Filterfelder des CSV-Imports und seine angehefteten Filterzeilen. Vorher stand dort das
Orange — und Orange heißt in FINA „hier kann man handeln" (Knöpfe, Weiterlese-Links,
Sprungmenü). Zwei Bedeutungen auf einer Farbe sind eine zu viel; wer eine weitere Fläche
baut, die einen greifenden Filter meldet, nimmt `--flt`.

**Woher der Stand kommt, weiß eine Stelle:** das Feld `it.imp[m-1]` (gesetzt von
`c2Apply()`; 1 gemerkt, 2 einmalig, in älteren Dateien `true`) — bei flexiblen Posten
genauso wie bei regulären, seit beide dasselbe Modell haben (6.9.26).

**Ein importierter Monat ist im Posten-Fenster gesperrt** (seit 6.9.26 spät: `impLock`
in `js/dialogs/item.js` — Siegel und Feld sind zu, die Sprechblase `item.impLockedTip`
sagt, warum). Bis dahin nahm das Abnehmen des Hakens den Import zurück; jetzt gibt es nur
einen Weg, den Wert loszuwerden: **„Alle Importdaten löschen"** (`impv.del`) in der
Fußzeile des Fensters — das nimmt die Quellzeilen und die Marke `imp` zusammen weg, und
danach ist der Monat wieder ein gewöhnlicher. So kann nie ein Betrag im Buch stehen, der
„aus der Datei" heißt, aber von Hand geändert wurde.

## Was beim Öffnen einer Datei einmal entschieden wird

`afterLoad()` in `js/state.js` läuft **nur** beim Öffnen, Trennen und beim Start — nicht
bei jedem Zeichnen. Es setzt `ui.kakDetail` auf „mit Unterkategorien", wenn die Datei
importierte Buchungen mitbringt, und sonst auf „nur Hauptkategorien": ohne Import gibt es
keine Unterkategorien, der Knopf dazu ist dann in `js/views/kakeibo.js` auch gesperrt. Die
View erzwingt das zusätzlich (`canDetail`), damit Anzeige und Knopf nie auseinanderlaufen.
Die Buchungen sind seit 6.9.26 die Quellzeilen der flexiblen Posten (`flexTx()`), ihre
Unterkategorie ist Referenz 1.

Dort fällt auch die **Vorauswahl der rechten Karte** in „Import Details": **keine** —
`ui.kakPick=null` heißt „größte Einzelposten" (`kak.top`), und genau damit geht der Reiter
auf. Eine vorgewählte Kategorie wäre die falsche Antwort: die erste der Liste steht dort,
weil sie zuerst angelegt wurde, und die teuerste sagt nur, was die linke Spalte ohnehin
zeigt. Wer den Reiter öffnet, will die einzelnen Buchungen sehen, die am meisten ausmachen.
Der Zeitraum ist das ganze Jahr (`ui.scope='jahr'`): hier wird verglichen.

Dort steht auch, **ob die Auswertung der Monatsansicht aufgeklappt beginnt**: `ui.ana`
kommt aus `state.anaOpen` (siehe „Die Auswertung über der Monatsansicht"). Die Einstellung
gehört der Datei, das Auf- und Zuklappen der Sitzung — deshalb wird sie hier gelesen und
nirgends sonst.

**Genauso, ob die Jahresansicht die abgeschlossenen Monate versteckt**: `ui.hideDone` kommt
aus `state.hideDoneMonths` (seit 30.8.26, siehe „Die Leiste der Jahresansicht"). Dieselbe
Bauform, derselbe Grund — und `ui.hideSettled` wird daneben wie eh auf `false` gesetzt.

**Die dritte Vorgabe derselben Art steht ausdrücklich nicht hier**: ob die Anleitung sich
dazustellt (`state.guideOpen`). Sie ändert die **Breite der Seite**, und `afterLoad()`
läuft, bevor `ui.welcome` feststeht — gelesen wird sie deshalb am Anfang von `render()`,
solange `ui.enter>0` steht (siehe „Der Bereich „Darstellung"").

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
Prognose — und in der Monatsansicht steckt die Monatsleiste mit in derselben `.stickybar`.
Das `top` dieser Leisten steht **nicht** im Stylesheet: `syncStickyTops()` in `js/app.js`
misst die Kopfzeile und setzt das Maß; die Funktion läuft am Ende von `wire()` und bei
jedem Größenwechsel. Seit die Monatsleiste unter der Filterzeile steht, ist die Kopfzeile
in jeder Ansicht gleich hoch — gemessen wird trotzdem, denn geraten wäre es beim ersten
Umbau wieder falsch.
Eine neue mitlaufende Leiste braucht deshalb nur die Klasse. Weil gemessen und nicht
geraten wird, rücken die Kartenköpfe darunter von selbst nach, wenn die Auswertung
aufgeklappt wird.

**Der Top-Bereich einer Ansicht ist ihr erstes Element und trägt `viewtop`** — seit
8.9.26 ist das eine Bedingung und keine Gewohnheit: `wrapViewBody()` (`js/ui.js`) erkennt
ihn daran und hängt alles danach in den `.viewbody`, der beim Wechsel allein fährt (siehe
„Bewegung"). Wer eine Ansicht baut, deren erstes Element **kein** `.stickybar.viewtop`
ist, bekommt keinen stehenden Top-Bereich — dann fährt die ganze Ansicht, wie es vorher
überall war (Prognose, Telefon). **Weitere Leisten dürfen darunter stehen**, aber im
Rumpf: die Monatsansicht hat zwei (Filterzeile · Monatsleiste mit Auswertung).

**Sie stapeln sich, und gemessen wird der Reihe nach.** `syncStickyTops()` läuft über
`#view > .stickybar` und `#view > .viewbody > .stickybar` in dieser Ordnung und gibt
jeder als `top` die Unterkante der davor; was am Ende herauskommt, ist zugleich die
Stelle, an der die Kartenköpfe kleben. **`--barh` wird davor gesetzt**: die Filterzeile
ist `min-height:var(--barh)` hoch, und stand der Wert noch auf dem Maß der
Begrüßungsseite — deren Kopfzeile ist ohne Reiter niedriger —, maß die Schleife eine
Leiste, die gleich danach wuchs, und die zweite klebte um die Differenz zu hoch.

Zwei Dinge gehören dazu: ein **deckender Hintergrund** und ein **Polster statt Rand** nach
unten. Ein Rand ist durchsichtig — dort schiene der Inhalt durch, der darunter wegscrollt.
Die Kennzahlen der Prognose stecken aus demselben Grund in einem Rahmen: `.kpi` braucht
ihre eigene Hintergrundfarbe für die 1px-Trennlinien und kann den Papiergrund nicht
zugleich tragen.

## Die Jahresmatrix ist eine eigene Fläche

**Und die Monatsansicht seit 23.8.26 genauso** (am Schreibtisch): die Kartenliste rollt in
`#monthScroll` (`viewMonat()` baut die Fläche, `sizeMonth()` in `js/app.js` setzt ihre
Höhe wie `sizeMatrix()`, `body.monthview` nimmt der Seite das Polster). Filterzeile,
Monatsleiste und Auswertung stehen darüber und rollen nicht mit — der Rollbalken fängt
wie im Jahr erst unter der Leiste an, und beim Ansichtswechsel springt nichts. Die
klebenden Kartenköpfe richten sich damit an dieser Fläche aus: `syncStickyTops()` setzt
ihr `top` auf 0, sobald sie in `#monthScroll` stehen. `render()` erhält die
Scrollstellung der Fläche wie die der Matrix — jedes Tippen im Suchfeld zeichnet neu.
**Auf dem Telefon rollt weiter die Seite** (der `mob`-Zweig baut die Fläche nicht);
Prognose und Transactions rollen wie bisher als Seite.

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

**Der Rollbalken ist ein eigener.** Von Haus aus sitzt er am unteren Rand des Rollrahmens,
quer über der letzten Zeile, und unter macOS erst beim Rollen. Deshalb verbergen beide
Tabellen ihren waagerechten und bekommen einen eigenen: `scrollRail(id)` / `bindRails()` in
`js/ui.js`, `.scrollrail` in `css/layout.css` — ein Rollrahmen mit einem Streifen darin, der
so breit ist wie die Tabelle. In der Matrix steht er seit 6.9.26 **unter der Fläche**
(`.yearpane+.scrollrail`; bis dahin in der Knopfleiste) — `sizeMatrix()` zieht ihn bei der
Höhe der Fläche mit ab, und `syncMatrixHead()` ruft davor `fitRails()`, damit feststeht, ob
er da ist —, in der Prognose in der Karte direkt über der Tabelle. Er wird ausdrücklich
**gestaltet**, damit er dauerhaft zu sehen ist: hier ist er der Weg zum Rollen und nicht
dessen Anzeige. Passt eine Tabelle ins Fenster, verschwindet er (`.off`).

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
(`canFS` in `js/storage.js`); dort ist der Name keine Frage.

**Verweigert der Browser das Lesen, fällt FINA auf die gewöhnliche Dateiauswahl zurück**
(seit 10.9.26). In manchen Umgebungen geht der Auswahldialog durch, `getFile()` wirft
danach aber `NotAllowedError` — gesehen am 9.9.26 auf einem Mac, **woran es dort lag, ist
noch offen** (`_BusinessCenter/todo.md`); bekannt sind Seiten über `file://` und Seiten in
einem fremden Rahmen. Dann setzt `fsRefused` in `js/storage.js`, eine Meldung
(`store.loadRefused`) bittet um einen zweiten Klick, und der nimmt `#fileJson`. **Vorab
abgeschaltet wird nichts** — der Rückfall gilt nur für diese Sitzung und erst nach einer
echten Ablehnung; eine Fassung, die die API auf dem Mac pauschal übersprang, nahm allen
Mac-Nutzern das Zurückschreiben in dieselbe Datei. Geklickt wird auch nicht von selbst:
nach dem Warten auf den Dialog ist die Klick-Erlaubnis des Nutzers abgelaufen. Jeder andere Browser kann das
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
wiederfinden, Speichern und erneutes Laden. Dazu: aus Jahr **und** Monat je einen Posten in
jedem der drei Bereiche anlegen, eine Kategorie ohne jeden Betrag in allen drei Ansichten
wiederfinden, und im Posten-Fenster abschließen und wieder öffnen.

**Eine Migration hat eine Probe, die etwas beweist:** die alte Fassung aus Git holen
(`git archive HEAD | tar -x -C …`), dieselbe Datei durch alte und neue `migrate()` laufen
lassen und je Monat `income`, `kakeiboFor`, `fixedCost`, `balanceFix`, `saldo` vergleichen —
dazu Speichern, erneut Laden, erneut Speichern (die Datei muss byte-gleich bleiben). So
wurde der Umbau vom 6.9.26 mit drei echten und vier künstlichen Altdateien geprüft.

**Die App hat ihre eigene Liste** — vierzehn Punkte in `desktop/README.md`, darunter die
drei, die nur dort schiefgehen können: schreibt „Daten speichern" wirklich in dieselbe
Datei zurück, kommt die Rückfrage beim Schließen (und lässt sich beides, abbrechen *und*
schließen), und sehen die Schriften **ohne Netzverbindung** richtig aus.

**Bewegung misst man mit echter Zeit, nicht mit `--virtual-time-budget`.** Headless
Chrome mit Zeitbudget friert die Uhr während des JavaScripts ein — `performance.now()`
meldet 0 ms, `requestAnimationFrame` kommt im 16-ms-Takt, gleich was der Hauptfaden tut.
Für Bildabstände nimmt man das Electron aus `desktop/node_modules` mit einem versteckten
Fenster und `offscreen:true` (`backgroundThrottling:false`, `setFrameRate(60)`), lädt die
Wegwerfseite und liest über `executeJavaScript` aus, was die Seite in ein Attribut
geschrieben hat. So wurde der Ansichtswechsel am 7.9.26 untersucht.

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
