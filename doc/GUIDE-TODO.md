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

**Der Reiter „Was ist neu" läuft nicht mehr über diese Liste.** Eine neue Version bekommt
ihren Eintrag automatisch, sobald ein Stand fertig ist — nicht erst auf Zuruf (siehe
CLAUDE.md, Abschnitt „Drei Reiter, drei Fragen"). Ein Punkt hier kann also schon im Reiter
„Was ist neu" stehen und trotzdem offen bleiben, weil „Schritt für Schritt" oder „Was FINA
kann" ihn noch nicht kennen — das steht dann direkt beim Punkt.

## Offen

- ⚠ **Der Zeitstrahl folgt dem Fälligkeitsfilter** — bei gewähltem Abschnitt (Zeile oder
  Filterknopf) bleiben alle Zeilen mit Balken je Geldart stehen, die nicht gewählten blass;
  orange Trennlinien fassen die gewählte ein, und nur sie trägt Zahlen: eine Summe, rechts
  kräftige Balken linksbündig; ein zweiter Klick bringt den Wasserfall zurück. In beiden
  Fassungen: Trennlinie zwischen Zahlen und Balkenfläche, Raster über alle Zeilen, darüber
  eine Achszeile mit dem Betrag jeder Linie. Der graue Erklärsatz über der Grafik ist
  gestrichen; die „Heute"-Marke ist orange umrandet statt rot gefüllt. **Falsch geworden:**
  „Was FINA kann" sagt zum Zeitstrahl-Filter noch „die anderen Zeilen liegen flach … nur
  die Monatseröffnung behält ihre Zahl" (EN wie DE) — beides stimmt so nicht mehr. *Im
  Reiter „Was ist neu" erledigt (26.8.18); in Schritt für Schritt und Was FINA kann noch
  offen.*

- **FINA hat eine mobile Oberfläche** — unter 700 px baut der Browser die drei Ansichten
  um: der Monat mit Suchzeile (alle Filter hinter dem Knopf davor), Kennzahl-Kacheln und
  großen Siegeln; das Jahr als zwölf Monatskarten (ein Tipp führt in den Monat, angelegt
  wird weiter am Schreibtisch); die Prognose mit Ausblick-Kacheln und der Grafik zum
  Wischen. Die Ansichtsreiter stehen unten am Rand. *Im Reiter „Was ist neu" erledigt
  (26.8.18); in Schritt für Schritt und Was FINA kann noch offen.*

- **Die Sprachwahl steht auch in der Kopfzeile** — EN · DE neben den Knöpfen, die Wahl wird
  mit der Datei gespeichert (wie im Einstellungsfenster). *Im Reiter „Was ist neu" erledigt
  (26.8.18); in Schritt für Schritt und Was FINA kann noch offen.*

- **Die Begrüßungsseite hat eine Sprachwahl** — EN · DE oben rechts, sie stellt das noch
  leere Buch um; eine geladene Datei entscheidet weiter selbst. Und das Wortzeichen oben
  links führt im Browser zur Startseite zurück. *Im Reiter „Was ist neu" erledigt
  (26.8.16); in Schritt für Schritt und Was FINA kann noch offen.*

- ⚠ **Die Anwendung heißt FINA Book.** Sichtbar wird das im Wortzeichen der Kopfzeile, im
  Reiter des Browsers, im Fenstertitel der App und in den Namen der Pakete
  (`FINA-Book-…dmg`, `FINA-Book-…exe`). Im Fließtext bleibt es beim kurzen **FINA** — auch
  die FINA-Tabelle heißt weiter so. Betrifft die Anleitung überall dort, wo sie das
  Programm beim Namen nennt und dabei ein Wortzeichen oder einen Dateinamen zeigt; die
  Bildschirmfotos in `doc/img/` zeigen noch das alte Wortzeichen. *Im Reiter „Was ist neu"
  erledigt (26.8.15); in Schritt für Schritt und Was FINA kann noch offen.*

- **Das Symbol steht jetzt auch im Reiter des Browsers.** Dasselbe Bild, das die Mac- und
  die Windows-App tragen. Der farbige Rücken ist dafür breiter geworden, damit die drei
  Geldarten auch bei 32 px noch auseinanderzuhalten sind. *Im Reiter „Was ist neu" mit in der
  FINA-Book-Zeile erwähnt (26.8.15), kein eigener Punkt; in Schritt für Schritt und Was FINA
  kann noch offen.*

- **FINA gibt es zum Herunterladen — für macOS und für Windows.** Dasselbe Programm, nur
  ohne Browser: ein eigenes Fenster, ein Eintrag im Dock, und es läuft ohne Internet. Der
  Weg dorthin steht ganz unten auf der Begrüßungsseite und auf einer eigenen Seite
  (`/download/`), die auch erklärt, warum das System beim ersten Start warnt: FINA ist noch
  nicht signiert. **Die Datei bleibt, wo sie ist** — die App auszutauschen rührt sie nicht
  an. Betrifft vor allem den Produktreiter; in **Schritt für Schritt** genügt am Anfang ein
  Satz, dass man nichts installieren muss, aber kann. *Im Reiter „Was ist neu" erledigt
  (26.8.15); in Schritt für Schritt und Was FINA kann noch offen.*

- **Die App sagt Bescheid, wenn es eine neue Fassung gibt.** Beim Start erscheint dann oben
  eine schmale Leiste mit der Nummer und einem Weg zur Downloadseite; „Später" blendet sie
  bis zum nächsten Start aus. Heruntergeladen und ausgetauscht wird von Hand. **Es ist die
  einzige Netzverbindung, die FINA je aufbaut**, sie schickt nichts, und in den
  Einstellungen unter „Allgemein" lässt sie sich abschalten. Im Browser gibt es sie nicht —
  dort ist die Seite immer die neueste. Das gehört in den Produktreiter, in den Absatz, der
  sagt, dass FINA nichts überträgt: die Aussage stimmt weiter, ist aber jetzt genauer zu
  fassen. *Im Reiter „Was ist neu" erledigt (26.8.15); in Schritt für Schritt und Was FINA
  kann noch offen.*

- **Die Schriften liegen jetzt bei.** Für den Nutzer heißt das: die Seite lädt schneller und
  ruft **keinen fremden Server mehr auf** — vorher kamen die drei Schriften von Google, und
  damit ging bei jedem Aufruf die IP-Adresse des Besuchers dorthin. Kein eigener Punkt im
  Reiter „Was ist neu" wert (das ist Kosmetik plus Datenschutz); sie zählt in 26.8.15 zur
  Sammelzeile „Bugfixing und kosmetische Anpassungen". Der Produktreiter behauptet an
  mehreren Stellen, FINA übertrage nichts — **jetzt stimmt das auch für die Schriften**, und
  der Satz darf entsprechend fester ausfallen. *In Schritt für Schritt und Was FINA kann noch
  offen.*

- **In der Prognose lässt sich zweierlei ändern, ohne die Ansicht zu wechseln.** Ein
  Doppelklick auf einen Betrag der Spalte **COR** öffnet die Saldokorrektur mit genau diesem
  Monat — dasselbe Fenster wie in der Jahrestabelle. Und ein Doppelklick auf den Betrag der
  Zeile **Anfangsbestand** (Spalte END, die Zeile über dem Januar) führt in die
  Einstellungen, Bereich „Allgemein", mit der Schreibmarke im Feld und dem Wert markiert.
  Betrifft den Produktreiter, Abschnitt zur Prognose: dort steht beim Anfangsbestand „You
  type it in the settings" / „Du trägst ihn in den Einstellungen ein" — das bleibt richtig,
  ist aber nicht mehr der einzige Weg. Falsch geworden ist nichts.

- **„Neu anfangen" ist wirklich leer.** Ein frisch angefangenes Buch hat keine Kategorien
  (weder Einnahmen noch Kosten noch Flexible Payments), keine Banken und keine
  Zahlungsarten — auch dann nicht, wenn vorher eine Datei mit solchen Listen offen war.
  Schritt 3 („Deine Konten und deine Kategorien") beschreibt schon das Richtige und braucht
  nur die Zusage, dass dort tatsächlich nichts steht; erwähnenswert ist, dass ein Posten erst
  gespeichert werden kann, wenn es eine Kategorie gibt.

- **Der Weg zu den Listen steht in jedem Fenster.** Über den Auswahllisten des
  Posten-Fensters steht je ein Weg zu den Kategorien, den Banken und den Zahlungsarten, im
  Fenster der Flexible Payments einer zu deren eigenen Kategorien. Die Einstellungen gehen
  **über** dem Fenster auf, ohne es zu schließen; danach stehen die neuen Einträge in den
  Listen. ⚠ Wo die Anleitung den alten Sammellink „Banken, Zahlungsarten & Kategorien
  bearbeiten" nennt (Schritt 5 und der Produktreiter), stimmt sie nicht mehr — den Link gibt
  es nicht mehr.

- **Die Prognose färbt ihre Spalten** in den Farben der Geldarten (IN grün, REG rot, FLEX
  gelb, COR blau, END violett; START bleibt ungefärbt), und **„Gesamt je Monat"** in der
  Jahrestabelle zeigt seine Zahlen grün und rot wie jeder andere Betrag. Beides ist Kosmetik
  — nur erwähnenswert, falls ein Absatz die Farben aufzählt.

Die letzten drei Punkte sind am 13. August 2026 in den Reiter **Was ist neu** eingegangen
(Version 26.8.13, beide Sprachen); in **Schritt für Schritt** und **Was FINA kann** stehen
sie noch nicht. Am 16. August 2026 folgten dort, in Version **26.8.15**, FINA Book (Name und
Symbol im Reiter, mit in derselben Zeile) sowie die Mac- und die Windows-App samt
Update-Hinweis; die Schriften liefen mit unter „Bugfixing und kosmetische Anpassungen". In
**Schritt für Schritt** und **Was FINA kann** stehen auch diese Punkte noch nicht.
Vollständig nachgezogen war die Anleitung zuletzt am 11. August 2026 — siehe unten.

**Die Versionsnummern sind seit dem 15. August 2026 dreiteilig** (`Jahr.Monat.Tag`, ohne
die Zählung dahinter): electron-builder braucht gültiges semver, und `VERSION` in
`js/config.js` ist jetzt die eine Stelle, an der die Nummer steht. Die vorhandenen Einträge
im Reiter „Was ist neu" wurden entsprechend gekürzt; wo an einem Tag zwei Versionen standen
(26.8.9.1 + 26.8.9.2 und 26.8.5.1 + 26.8.5.2), sind sie zu **einer** zusammengelegt. In den
Absätzen der Reiter unten steht die alte, vierteilige Form noch als Notiz aus der Zeit, in
der sie galt — die bleibt so stehen, es ist ein Protokoll.

Die Bildschirmfotos in `doc/img/` sind vom 8. August 2026 und zeigen den Stand von damals:
das alte Linkfeld im Posten-Fenster, die alten Prognose-Spalten, die fünfte Kennzahl der
Monatsansicht. Neue werden nur auf ausdrückliche Bitte gemacht.

## Zuletzt eingearbeitet

Am 11. August 2026, Durchgang durch **alle drei** Reiter, beide Sprachen, dazu die neue
Version **26.8.11.1**. Die Bildschirmfotos blieben liegen (siehe oben):

- **Filtern rechnet über das Gezeigte** — der Absatz „Filtern und wiederfinden" / „Filtering
  and finding" fing mit der gegenteiligen Aussage an („Jede Summe … zählt weiter das ganze
  Buch") und sagt jetzt, welche Zahlen mitrechnen: Bereichs- und Kategoriesummen des Monats,
  die vier Kennzahlen der Auswertung, in der Jahrestabelle Block-, Kategorie- und
  Gesamtzeile. Genannt sind auch die beiden Ausnahmen: die Monatseröffnung des Zeitstrahls
  und die Prognose. Dazu je ein Satz in Schritt 7 und im Abschnitt zum Zeitstrahl.
- ⚠ **Die Auswertung hatte „fünf Zahlen"** — sie hat seit dem Wegfall des Kontostands vier.
  Das stand in **beiden** Sprachen falsch da und ist beim selben Durchgang mitgerichtet
  worden, samt einem Satz, warum kein Kontostand dabei ist.
- **Der Import steht in den Einstellungen**, Bereich Import, nicht mehr in der Kopfzeile —
  im Absatz „Die alltäglichen Ausgaben" beider Sprachen. Der historische Eintrag in der
  Versionsliste 26.8.5.x bleibt, wie er ist.
- **FINA-Tabelle einlesen** als eigener Abschnitt „Mit deiner Tabelle anfangen" /
  „Starting from your spreadsheet", direkt hinter „Die ersten Schritte": Aufbau der Tabelle,
  das `/` in der schmalen Spalte, die gerechnete Gliederung, STIMMT/WEICHT AB, die Zuordnung
  der Blöcke, „ersetzt statt ergänzt" samt bleibendem Anfangsbestand, Spalte P und Deadline,
  die zwei Haken — und die Probe gegen „Gesamt je Monat". Dazu ein Verweis in Schritt 1 und
  im Schlussabsatz von „Schritt für Schritt".
- **„Gesamt je Monat"** war in der Aufzählung der Jahrestabelle schon richtig beschrieben;
  neu ist nur der Punkt in der Versionsliste.

Am 9. August 2026, vollständiger Durchgang durch **Schritt für Schritt** und **Was FINA
kann**, beide Sprachen. Abgearbeitet wurde alles, was seit dem 8. August aufgelaufen war:

- **Zugehörige Links** statt des einen Feldes „Link zu Beleg oder Vertrag": bis zu zehn je
  Position, Plus · Stift · Kreuz · Griff, der Name aus der Adresse, die Reihenfolge gezogen.
  Dazu das Kettensymbol in den Ansichten und der Strich, wo noch keiner steht (Schritt 5 und
  „Regelmäßige Kosten, Schritt für Schritt").
- **Ein geschätzter Betrag wird nicht nebenbei abgehakt** — an beiden Stellen, an denen das
  Abhaken beschrieben ist (Schritt 7 und der Produktreiter). Dazu der Doppelklick auf einen
  Betrag, der den Monat im Fenster hervorhebt.
- **Die Prognose mit START und END**, die eigene Zeile des Anfangsbestands darüber und die
  Achse, die dort anfängt, wo etwas steht.
- **„Kontostand zum Monatsende"** in der Jahrestabelle samt Anfangsbestand und Gesamtspalte;
  dazu die festen Kopfzeilen und die Rollleiste über der Tabelle.
- **„Sicherung speichern"** und der Zeitstempel im Dateinamen (Schritt 8 und „Speichern und
  Sicherheit").
- **CORRECTED in Orange**, sofort beim Tippen, mit dem importierten Wert in der Sprechblase.
- **Fast Budget Details** geht mit dem ganzen Jahr und den größten Einzelposten auf.
- **Ein Klick in ein Feld markiert seinen Inhalt** (Schritt 5).
- Ein neuer Abschnitt **„Diese Anleitung"**: eigene Sprache, ganze Seite, Breite ziehen.

Danach noch gebaut und **nicht** in der Anleitung beschrieben — Bedienung, die sich von
selbst erklärt: der Knopf „nach oben" unten rechts (in beiden Fassungen) und die klebende
Reiterzeile der ganzseitigen Fassung.

Nicht übernommen: „Sprechblasen stehen über oder unter dem Element" — die Anleitung
behauptet nirgends, wo sie erscheinen, also gibt es nichts richtigzustellen.

Am 8. August 2026, dritter Durchgang: **„Schritt für Schritt" auf acht Schritte
eingedampft**, beide Sprachen. Der Reiter sagt jetzt nur noch, was zum Anfangen nötig ist —
Buch anlegen, Einstellungen, Einnahmen, Rechnungen, Alltagskategorien, Monatsrhythmus,
Speichern — und verweist am Ende auf **Was FINA kann**. Herausgefallen sind die Schritte zur
Jahrestabelle, zur Prognose, zur Saldokorrektur, zum CSV-Import und die langen Absätze über
Filter, Notizen und Klapp-Pfeile: alles steht im Produktreiter. Von vierzehn Überschriften
und rund neunzig Absätzen sind acht und rund dreißig geblieben. Von den Bildern sind sieben
übrig; `year`, `year-left`, `forecast`, `ui-header`, `ui-kpi`, `ui-analytics`, `set-lists`,
`item-quick`, `item-months`, `month-in`, `month-flex`, `month-bal` stehen nur noch im
Produktreiter oder in der README.

Am 8. August 2026, zweiter Durchgang: **alle drei Reiter neu geschrieben**, beide Sprachen —
kürzere Sätze, einfachere Wörter, ein Gedanke je Absatz. Inhaltlich ändert sich nichts, nur
der Ton: aus einem Satz mit drei Einschüben werden drei Sätze. Dazu:

- Der Satz „Danach wiederholst du nur noch Schritt 9" ist aus der Einleitung von **Schritt
  für Schritt** heraus.
- **Schritt 13** (die Prognose) nennt jetzt die eigene Zeile des Anfangsbestands über dem
  Januar — sie fehlte, seit es sie gibt.
- **Alle Bildschirmfotos neu.** Die alte Beispieldatei war nicht mehr da; die neue wird von
  `doc/make-shots.py` an derselben Stelle erwartet und enthält wieder erfundene Zahlen.
  `forecast-plan` ist aus der Liste der Abzüge gestrichen — die Karte gibt es seit dem
  Umbau der Prognose nicht mehr.

Am 8. August 2026: **Version 26.8.8.1** in allen drei Reitern, beide Sprachen — der
Anfangsbestand (Schritt 2 und ganz vorn im Produktreiter, dazu die eigene Zeile über dem
Januar in der Prognose), die klappbaren Blöcke der Jahresmatrix, „beim Filtern steht alles
offen" (⚠ die alte Aussage „FINA klappt beim Filtern für dich" ist damit überall ersetzt),
der Knopf „Filter zurücknehmen", Escape und Strg/Cmd+Umschalt+F, der sechste Haken „auch in
ausgeblendeten Positionen suchen", die Achse über der Verlaufsspalte, die Art in Klammern
hinter der Kategorie samt „Laufender Monat" und der entfallene Erklärsatz unter der
Jahrestabelle. Die Bildschirmfotos blieben liegen.

Am 7. August 2026: **Version 26.8.7.1** im Reiter „Was ist neu", beide Sprachen — eigene
Einnahme-Kategorien, die neu gebaute Prognose mit der Spalte Verlauf, die Bezeichnung als
Überschrift, der Mittelwert über der Schnelleingabe, die Sprechblasen über/unter dem Element
und die Kleinigkeiten.


Am 6. August 2026, vierter Durchgang — in **Schritt für Schritt** und **Was FINA kann**,
beide Sprachen. Die Bildschirmfotos blieben liegen; zwei Stellen zeigten Dinge, die es nicht
mehr gibt, und wurden deshalb entfernt statt neu beschriftet:

- **Zwei Kategorielisten** im Einstellungsbereich: Einnahmen links, Ausgaben rechts, und die
  Regel, dass ein Name über beide Listen hinweg nur einmal vorkommen darf — daran erkennt
  FINA, ob ein Posten Geld bringt oder kostet (Schritt 5 in beiden Sprachen)
- **Die Bezeichnung ist die Überschrift**: kein Feld mehr, ein Klick öffnet ein kleines
  Fenster mit Abbrechen und Übernehmen; „Speichern" ohne Namen öffnet dasselbe Fenster. Gilt
  für Kategorien wie für Posten (Schritt 7)
- **Der Mittelwert über der Schnelleingabe**, orange, aus den feststehenden Monaten
  gerechnet und beim Tippen mitlaufend (Schritt 7)
- **Die Prognose neu beschrieben** (Schritt 13 und Produktreiter): eine Tabelle über die
  volle Breite, kurze Überschriften mit Erklärung beim Überfahren, der laufende Monat
  hervorgehoben, die abgerechneten blass — und die Spalte **Verlauf** mit ihrem Raster. Die
  rechte Karte mit den Annahmen gibt es nicht mehr; wo sie stand, steht jetzt, dass die
  Annahme im Fenster der Kategorie gepflegt wird. **`forecast-plan.png` ist aus beiden
  Reitern entfernt** — das Bild zeigte eine Karte, die es nicht mehr gibt


Am 6. August 2026, dritter Durchgang: **alle Bildschirmfotos neu**, und zwar aus der neuen
Beispieldatei `fina-demo-en.json` — durchweg englisch, ohne persönliche Daten, mit den
üblichen Posten eines Haushalts. `doc/make-shots.py` nimmt sie jetzt als Vorgabe (der Pfad
lässt sich mit `FINA_DEMO=…` überschreiben). Sechs Abzüge sind auf eine feste Höhe
beschnitten, weil die Datei mehr Posten hat als die alte und die Bilder sonst zu lang für
den Anleitungsbereich würden: `year`, `month`, `flexible`, `month-out`, `year-left`,
`flex-view`.

Am 6. August 2026, zweiter Durchgang — in **alle drei** Reiter und beide Sprachen, dazu neue
Abzüge von `welcome`, `month`, `month-in`, `month-flex`, `month-out`, `ui-kpi`,
`ui-analytics`, `legend` und `guide`:

- die **Begrüßungsseite** in Schritt 1 (mit Bild) und in „Die ersten Schritte"; dass die
  Kopfzeile keinen Knopf zum Öffnen mehr hat und auf der Begrüßungsseite nur die Anleitung
  trägt
- die **Klapp-Pfeile** samt Doppelklick auf die Überschrift, Vorgabe „alles offen", die
  Ablage in der Datei und das automatische Klappen beim Filtern (Schritt 9 und Produktreiter)
- **Version 26.8.6.1** im Reiter „Was ist neu", in beiden Sprachen: Begrüßungsseite,
  Auswertung mit Zeitstrahl und Wasserfall, Filterzeile für alle Bereiche, klappbare Blöcke,
  Kleinigkeiten

Am 6. August 2026 in die Reiter **Schritt für Schritt** und **Was FINA kann** übernommen, in
beiden Sprachen — dazu neue Bildschirmfotos `ui-analytics`, `ui-waterfall` und frische Abzüge
von `ui-kpi`, `month`, `month-in`, `month-flex`, `month-out`, `month-bal`:

- der **Auswertungsbereich** als eigener Abschnitt im Produktreiter: die dünne Zahlenzeile, der
  Klick, der sie aufklappt, die fünf Zeilen des Zeitstrahls (Monatseröffnung · Monatsanfang ·
  Monatsmitte · Monatsende · Monatsabschluss), der Wasserfall mit seinen Farben, der Maßstab
  am Kontostand samt beschnittener Achse, die Sprechblase nur an den Farben, der Klickfilter
  und die Regel, dass alles ohne Zahltag beim Monatsabschluss aufgenommen wird
- Schritt 10 heißt weiter „Die Zahlen oben lesen", verweist jetzt aber auf die Auswertung und
  zeigt sie
- Schritt 9 und der Absatz zur Monatsansicht im Produktreiter: die **Filterzeile steht oben und
  gilt für alle drei Bereiche**, mit dem fünften Knopf „Monatsabschluss" und dem Hinweis
  „(n ausgeblendet)" neben der Überschrift
- die **Klapp-Pfeile**: jeder Bereich lässt sich zuklappen, in der Farbe des Bereichs und über
  der Abhakspalte; die Wahl steht in der Datei und gilt für alle zwölf Monate

Am 5. August 2026 in **beide** Reiter der Anleitung und beide Sprachen übernommen — die
Bildschirmfotos blieben dabei liegen, sie zeigen den Stand davor:

- der Hamburger-Knopf vor jedem Suchfeld: worin der Filter sucht (Bezeichnung · Notizen ·
  Monatsbeträge · Jahressummen · Kategorie, Bank, Zahlungsart, Fälligkeit), Speichern und
  Abbrechen, mindestens eine Angabe, die Wahl in der Datei, der dunkle Knopf. Schritt 9 und
  12, im Produktreiter der neue Abschnitt „Etwas wiederfinden" — und als einziger Punkt auch
  im Reiter „Was ist neu", Version 26.8.5.2
- abbezahlte Zeilen auf grauem Grund, in beiden Ansichten dasselbe Grau (Schritt 8, Absatz
  zur Monatsansicht)
- die Spalte „Art" der Flexible Payment Details, mit den fünf Wörtern und der Zählung übers
  Jahr (Produktreiter)
- der Reiter „Flexible Payment Details" nur mit Import und als letzter, und sein Name gegen
  den der Geldart abgegrenzt (Schritt 1, Fast-Budget-Schritt, Abschnitt „Die Ansichten" —
  vorher „Die vier Ansichten")
- der CSV-Import in der Kopfzeile, mit dem Fenster über die benötigten Spalten davor
  (Fast-Budget-Schritt, Absatz „Die alltäglichen Ausgaben")
- die Prognose rechnet nur noch: beide Spalten gerechnet, die Annahme im Fenster der
  Kategorie (Produktreiter)
- Duplizieren in beiden Fenstern (Schritt 6 und 7, Absatz „Regelmäßige Kosten, Schritt für
  Schritt")
- „Saldo je Monat" bleibt beim Filtern stehen (Schritt 12, Aufzählung „Die Jahrestabelle
  lesen")
- Vorzeichenfarbe beim Tippen (Schritt 6, Absatz zu den Beträgen)
- Notizlampen vor dem ersten Speichern und Zeilenumbrüche in Notizen (Schritt 6, Abschnitt
  „Notizen")
- Doppelklick in jeder Ansicht, auf Betrag **und** Bezeichnung (Schritt 9 und 12, Absatz zur
  Monatsansicht, Aufzählung „Die Jahrestabelle lesen")
- die Fokusregel des Suchfelds auch in der Jahresansicht, und das Feld wird beim Öffnen einer
  Datei geleert (Schritt 12, Abschnitt „Etwas wiederfinden")

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
