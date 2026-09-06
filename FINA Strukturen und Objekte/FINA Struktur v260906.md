# FINA Struktur v260906

**Stand:** 6. September 2026 · veröffentlicht am Abend als Fassung der Anwendung `26.9.6` (`VERSION` in `js/config.js`)

**Vorgängerin:** `FINA Struktur v260905.md` – die Fassung, die als 26.9.5 draußen ist. Was sich seit ihr geändert hat, steht unten unter „Der Weg zu dieser Fassung".

## Wozu diese Datei

FINA speichert alles in **einer JSON-Datei** – dem Buch. Diese Datei hier beschreibt, wie
das Buch innen aufgebaut ist: jedes Feld, was es bedeutet, und was FINA tut, wenn es in
einer älteren Datei fehlt.

**Drei Regeln für diesen Ordner:**

1. **Bevor sich an der Struktur etwas ändert, wird Lex gewarnt.** Eine Änderung heißt
   fast immer: alte Dateien müssen beim Öffnen umgebaut werden (Migration), sonst liest
   FINA sie falsch.
2. **Die Fassung ist das Datum.** Eine neue Datei gibt es nur, wenn alte Dateien beim
   Öffnen umgebaut werden müssen (Migration); alles andere wird in der aktuellen Datei
   fortgeschrieben. Sie heißt `v` + Datum (`JJMMTT`): `v260906`. Einen Zusatz `-2`, `-3`
   bekommt ein Tag nur, wenn an ihm **zweimal etwas hinausgegangen** ist, das die Datei
   verändert. Zwischenstände innerhalb eines Tages bekommen keine eigene Datei; sie
   stehen als „Schritte" im Abschnitt „Der Weg zu dieser Fassung". Die alte Datei bleibt
   liegen – so sieht man, was sich wann geändert hat. (Regel von Lex, 6.9.26.)
3. **Migration passiert beim Lesen, nie beim Speichern.** `migrate()` in `js/state.js`
   flickt eine geladene Datei an Ort und Stelle. Sie baut das Objekt **nicht** aus
   bekannten Feldern neu – unbekannte Felder überleben, damit eine Datei zwischen
   Webseite und App wandern kann (siehe „Die drei Fassungen" in `CLAUDE.md`).

Wo im Code welches Feld gelesen und geschrieben wird, steht in `CLAUDE.md`. Hier steht
nur die **Struktur**.

---

## 1. Die Datei im Ganzen

Ein einziges JSON-Objekt (im Code: `state`). Die Felder in der Reihenfolge, in der ein
neues Buch sie anlegt (`emptyState()` in `js/state.js`).

| Feld | Was es ist | Beispiel | Fehlt es in einer alten Datei … |
|---|---|---|---|
| `v` | Fassung der Anwendung, die zuletzt gespeichert hat. Wird bei jedem Speichern gesetzt. | `"26.8.30"` | … gilt sie als „ohne Versionsangabe" und FINA meldet beim Laden, dass die Datei älter ist. |
| `year` | Das Abrechnungsjahr | `2026` | … das laufende Jahr |
| `lang` | Sprache der Oberfläche (`"de"` oder `"en"`) | `"de"` | … Englisch |
| `opening` | Der Anfangsbestand: Kontostand **vor** dem Januar. Darf negativ sein. | `2123.45` | … 0 |
| `banks[]` | Liste der Banken, je Eintrag `{code, label}` | `[{"code":"DKB","label":"DKB Giro"}]` | … leer |
| `pays[]` | Liste der Zahlungsarten, je Eintrag `{code, label}` | `[{"code":"LS","label":"Lastschrift"}]` | … leer |
| `groups[]` | Die regulären Kategorien (nur Namen). **Enthält immer** den festen Schlüssel `(Regulär ohne Kategorie)` – genau einmal, an der Stelle, an die der Nutzer ihn sortiert hat. | `["(Regulär ohne Kategorie)","WOHNEN","AUTO"]` | … leer; der feste Schlüssel kommt nach oben, wenn er fehlt |
| `incomeGroups[]` | Die Einnahme-Kategorien (nur Namen). **Enthält immer** `(Einnahmen ohne Kategorie)`. | `["(Einnahmen ohne Kategorie)","GEHALT"]` | … `["EINNAHMEN"]` (alte Dateien zeigen darauf); eine **leere** Liste bleibt leer; der feste Schlüssel kommt nach oben, wenn er fehlt |
| `flexGroups[]` | **Neu (Schritt 2 des 6.9.26).** Die Kategorien der flexiblen Posten (nur Namen). **Enthält immer** `(Flexibel ohne Kategorie)`. | `["(Flexibel ohne Kategorie)","ALLTAG"]` | … nur der feste Schlüssel |
| `fixed[]` | Die regulären Posten – Einnahmen und regelmäßige Kosten. Aufbau: siehe 2. | | … leer |
| `balance` | Die Saldokorrektur – ein einzelner Posten mit fester Kennung. Siehe 3. | | … eine leere Zeile |
| `kakCats[]` | **Entfernt (Schritt 3 des 6.9.26).** Die flexiblen Posten stehen in `fixed[]` (Kategorie aus `flexGroups`). Beim Öffnen einer älteren Datei wandern sie dorthin (`migrateKak()` in `js/state.js`), danach fällt das Feld. | | … nichts (kein Feld mehr) |
| `kak{}` | **Entfernt (Schritt 3 des 6.9.26).** Siehe `kakCats[]`. | | |
| `plan{}` | **Entfernt (Schritt 3 des 6.9.26).** Wird beim Öffnen noch gelesen (Planwert → `amounts`), danach gelöscht. | | |
| `flexActual{}` | **Entfernt (Schritt 3 des 6.9.26).** Der importierte Wert eines Monats steht am flexiblen Posten in `amounts`, der Pfeil in `imp`. Beim Öffnen gelesen, danach gelöscht. | | |
| `flexSource{}` | Je Monat 1–12 der Name der Datei, aus der flexible Posten importiert wurden, sonst `null` — das Etikett am Kopf der flexiblen Karte; ob ein Monat importiert ist, sagt daneben der Pfeil (`imp`) an den flexiblen Posten | `{"3":"export.csv"}` | … zwölf `null` |
| `tx[]` | **Entfernt (Schritt 3 des 6.9.26).** Die Buchungen stehen als Quellzeilen an den flexiblen Posten (`impRows[m][]`, siehe 2). Beim Öffnen gelesen und dorthin gezogen, danach gelöscht. Der Reiter „Import Details" liest sie über `flexTx()` (`js/calc.js`). | | |
| `labWidth` | Breite der Bezeichnungsspalte in der Jahresmatrix (px) | `250` | … 250 |
| `monWidth` | Breite einer Monatsspalte in der Jahresmatrix (px) | `100` | … 100 |
| `topMin` | Schwelle „größte Einzelposten" in den Import Details | `50` | … 50 |
| `lastImport` | Wann zuletzt flexible Buchungen importiert wurden (Text) | `"5.9.2026, 10:12:00"` | … `null` |
| `hideDoneMonths` | Vorgabe fürs Öffnen: Jahresansicht ohne abgeschlossene Monate? | `false` | … `false` |
| `folded{}` | Zugeklappte Bereiche der **Monatsansicht**: `{in, flex, out}` je wahr/falsch | `{"in":false,"flex":true,"out":false}` | … alles offen; ein altes `flexCollapsed` wandert nach `folded.flex` |
| `foldedYear{}` | Dasselbe für die **Jahresmatrix** | | … alles offen |
| `anaOpen` | Vorgabe fürs Öffnen: Monat mit aufgeklappter Auswertung? | `false` | … `false` |
| `filterFields{}` | Worin das Suchfeld sucht: `{name, note, amount, total, meta}` je wahr/falsch. Mindestens eins bleibt wahr. | | … alles wahr |
| `qHidden` | Sucht das Suchfeld auch in ausgeblendeten Posten? | `false` | … `false` |
| `updateCheck` | Dürfen die Mac-/Windows-Apps nach einer neueren Fassung fragen? | `true` | … `true` |
| `surveys{}` | Vermerke zu Umfragen, Schlüssel = Kennung der Umfrage. Siehe 7. | | … leer |
| `csvMaps{}` | Gemerkte CSV-Strukturen, Schlüssel = Fingerabdruck der Spaltenköpfe (eine zweite Struktur derselben Datei-Art: `fingerabdruck#2`, `#3` …). **Nur die Feldverknüpfung** – keine Art, keine Regeln. Siehe 6. | | … leer |

**Was `migrate()` außerdem löscht** (Felder, die FINA selbst einmal angelegt hat und die
niemand mehr liest): `hideSettled`, `created`, `flexCollapsed` (nach dem Übertrag).

---

## 2. Ein regulärer Posten (`fixed[i]`)

Ein Posten ist eine Zeile der Jahresmatrix: eine Einnahme oder eine regelmäßige Ausgabe
mit zwölf Monatsbeträgen. Die Felder teilen sich in **Postenattribute** (gelten für den
ganzen Posten) und **Monatsattribute** (je Monat eins, immer als Liste mit zwölf
Einträgen, Stelle 0 = Januar).

### Postenattribute

| Feld | Was es ist | Beispiel |
|---|---|---|
| `id` | Eindeutige Kennung, wird einmal vergeben und nie geändert. Darüber zeigen Notizen, Fenster und die CSV-Zuordnungen auf den Posten. | `"m1k2x9"` |
| `name` | Die Bezeichnung | `"Miete"` |
| `group` | Name der Kategorie. Steht der Name in `incomeGroups`, ist der Posten eine **Einnahme**, in `flexGroups` ein **flexibler Posten** (Schritt 3 des 6.9.26), in `groups` eine **regelmäßige Ausgabe**. Ein Name darf nur in einer der drei Listen stehen. Ohne eigene Kategorie steht hier der feste Schlüssel des Bereichs: `(Einnahmen ohne Kategorie)` oder `(Regulär ohne Kategorie)`. Ein Name, der in keiner Liste steht, wird beim Öffnen nach `(Regulär ohne Kategorie)` gezogen (`EINNAHMEN` nach `(Einnahmen ohne Kategorie)`). | `"WOHNEN"` |
| `bank` | Kürzel der Bank (`banks[].code`) oder leer | `"DKB"` |
| `pay` | Kürzel der Zahlungsart (`pays[].code`) oder leer | `"LS"` |
| `dueDay` | Fälligkeit: Zahltag als Text – `"A"` (Anfang), `"M"` (Mitte), `"E"` (Ende) oder eine Tageszahl; leer heißt „ohne Zahltag" | `"A"` |
| `end` | Letzte Zahlung: `{y, m}` oder `null` | `{"y":2027,"m":3}` |
| `estimated` | Sind die Beträge geschätzt? (**gilt für den ganzen Posten**) | `false` |
| `note` | Notiz zum Posten (die Lampe am Namen) | `"Kündigung bis 30.9."` |
| `links[]` | Zugehörige Links, je `{name, url}`, höchstens zehn. Siehe 8. | |
| `impRules[]` | **Nur wenn vorhanden.** Die Importkriterien des Posten: Regeln, nach denen der CSV-Import Zeilen diesem Posten zuordnet. Siehe 6a. | `[{"terms":[{"f":"ref1","op":"has","val":"miete"}]}]` |

### Monatsattribute (Listen mit zwölf Einträgen)

| Feld | Was es ist | Beispiel |
|---|---|---|
| `amounts[12]` | Der Betrag des Monats. Einnahmen positiv, Kosten negativ. **Es gibt nur einen Betrag je Monat** – ein Import ersetzt ihn. | `[-850,-850,…]` |
| `paid[12]` | Ist der Monat abgehakt („so war es")? | `[true,true,false,…]` |
| `imp[12]` | Kam der Betrag aus einem CSV-Import? `false`/`0` nein · `1` ja, Zuordnung gemerkt · `2` ja, einmalige Zuordnung (roter Kreis) | `[1,1,0,…]` |
| `notes[12]` | Notiz je Monat (die Lampe in der Monatskachel) | `["","Nachzahlung",…]` |
| `impRows{}` | **Nur bei importierten Monaten.** Schlüssel = Monat 1–12, Wert = Liste der Quellzeilen `{d, v, r}`: Datum als Text `"TT.MM.JJ"`, Betrag, und `r[]` = die **Referenzen** der Zeile in ihrer Rangfolge (Referenz 1 bis 4; leere Enden fehlen, eine Lücke in der Mitte bleibt als `""`). Aus ihnen ist `amounts[m]` entstanden. **Ältere Zeilen** (bis 5.9.26 vormittags) tragen statt `r` einen Text `x` aus allen übrigen Spalten; gelesen wird beides (`impRowText()` in `js/calc.js`). | `{"3":[{"d":"05.03.26","v":-850,"r":["Hausverwaltung","Miete März"]}]}` |

**Ältere Feldnamen**, die `migrate()` umbaut: `status[]` (`"booked"` → `paid`) und
`booked[]` → `paid`; `unclear[]` → `estimated`; `url` → erster Eintrag in `links`.

---

## 3. Die Saldokorrektur (`balance`)

Derselbe Aufbau wie ein Posten, mit festen Werten: `id` ist immer
`"balance-correction"`, `group` ist leer, `paid` ist immer zwölfmal `false`, `estimated`
ist `false` – sie wird nicht abgehakt, ihr Betrag **ist** die Korrektur. `name` ist
`"Balance Correction"`. Benutzt werden `amounts`, `note`, `notes`, `links`.

---

## 4. Ein flexibler Posten

**Seit Schritt 3 des 6.9.26 ein Posten wie jeder andere** (`fixed[i]`, siehe 2), erkennbar an
seiner Kategorie aus `flexGroups`. Bis Schritt 2 des 6.9.26 hatte er ein eigenes Modell
(`kak[name]` mit `plan[12]`, `paid[12]`, `override[12]`, `estimated`, `note`,
`notes[12]`, `links[]`, `impRules[]`, `group`; die importierten Ist-Werte in
`flexActual[m][name]`, die Buchungen in `tx[]`). Beim Öffnen einer älteren Datei
(`migrateKak()` in `js/state.js`) wird daraus je Posten (eine Uraltdatei ohne `kakCats`
und ohne `kak`, nur mit `plan` als Betrag je Kategorie, liefert ihre Kategorien aus den
Schlüsseln von `plan` – seit 6.9.26 abends, davor gingen sie verloren):

| war | wird |
|---|---|
| `name` (der Schlüssel) | `name`, dazu eine neue `id` |
| `group` | `group` (fehlt es: `(Flexibel ohne Kategorie)`) |
| Monat importiert (`flexSource[m]` gesetzt, `flexActual[m][name]` nicht `null`) | `amounts[m-1]` = Korrektur (`override`), sonst der Ist-Wert · `paid[m-1] = true` · `imp[m-1] = 1` (2, wenn alle Buchungen des Monats einmalig waren) · `impRows[m][]` aus den Buchungen |
| Monat nicht importiert | `amounts[m-1]` = Planwert · `paid[m-1]` wie gesetzt |
| `estimated`, `note`, `notes`, `links`, `impRules` | unverändert |

---

## 5. Eine Buchung

**Seit Schritt 3 des 6.9.26 kein eigenes Feld mehr.** Eine importierte Buchung eines flexiblen
Postens ist eine Quellzeile `impRows[m][]` an diesem Posten — Tag, Betrag, die
Referenzen (`r`), bei älteren Buchungen der zusammengesetzte Text (`x` aus
Unterkategorie und Beschreibung). Der Reiter „Import Details" baut daraus mit `flexTx()`
(`js/calc.js`) dieselben Buchungen, die er früher aus `tx[]` las: `{y, m, d, main, v, r,
once}` — `main` ist der Name des Postens, `once` heißt: der Monat trägt `imp = 2`.

---

## 6. Eine gemerkte CSV-Struktur (`csvMaps[fingerabdruck]`)

Der Schlüssel ist ein Hashwert über die Spaltenköpfe der Datei (`c2Fp()` in
`js/dialogs/csv2-wizard.js`) – daran erkennt FINA die Datei-Art beim nächsten Hochladen.

**Eine Struktur ist die Feldverknüpfung** – welche Spalte der Datei welches FINA-Feld
trägt. Sonst nichts: eine **Art** (reguläre oder flexible Posten) gibt es seit Schritt 1 des 6.9.26
nicht mehr, Importkriterien gelten für beide gleich, und der Import zeigt alle Ziele
zusammen. „Automatisch CSV-Datenstruktur vorbereiten" bringt die Verknüpfung in
Schritt 2 mit. Wer dieselbe Datei-Art einmal anders einlesen will, ordnet die Struktur im
Import von Grund auf neu an (das ersetzt sie – oder legt sie mit dem Haken „bisherige
behalten" als **zweite** Struktur unter `fingerabdruck#2` daneben) oder ändert sie mit
dem Stift: in den Einstellungen unter Import und seit 6.9.26 auch im ersten Schritt des
Imports – oben der Name, links die FINA-Felder, rechts die Spalten der Datei. Bei
mehreren Strukturen einer Datei-Art lässt Schritt 1 wählen. Regeln stehen hier
**nicht**, sie wohnen am Posten (6a).

| Feld | Was es ist | Beispiel |
|---|---|---|
| `date` | Tag, an dem gemerkt wurde (Text) | `"5.9.2026"` |
| `file` | Die Beschriftung – beim ersten Merken der Dateiname, danach der Name aus dem Namensfenster des Imports; im Stift-Fenster (Einstellungen und Schritt 1 des Imports) änderbar. Über alle Strukturen hinweg nur einmal vergeben. | `"umsaetze.csv"` |
| `f{}` | Welche Spalte welches FINA-Feld trägt: `{date, amount, ref1, ref2, ref3, ref4, ref5}`, je Spaltennummer oder `-1` (`ref5` seit 6.9.26 spät; eine ältere Struktur ohne `ref5` bekommt beim Öffnen `-1`). **Es gibt nur diese sechs Felder.** | `{"date":0,"amount":4,"ref1":3,"ref2":-1,"ref3":-1,"ref4":-1}` |
| `header[]` | Die Spaltenköpfe der Datei – damit das Stift-Fenster in den Einstellungen die Spalten beim Namen nennen kann statt „Spalte 4" | `["Buchungstag","…"]` |

**Ältere Einträge** (bis 5.9.26 nachmittags) trugen dazu `cols[]`, `rules[]` und
`newT[]`, und `f` kannte `main`, `cat`, `desc` statt der Referenzen; Einträge vom Abend
des 5.9.26 (v260905) trugen `kind`. `migrate()` übersetzt beim Öffnen (siehe „Schritt 3"
in `FINA Struktur v260905.md`) und entfernt alle vier Felder.

## 6a. Ein Importkriterium (`impRules[i]` am Posten oder an der Kategorie)

Eine Regel, nach der der CSV-Import Zeilen **diesem** Posten zuordnet. Sie hängt an
keiner Datei-Art: die Bedingungen nennen FINA-Felder, und jede Datei, deren Struktur
diese Felder verknüpft, kann sie erfüllen.

| Feld | Was es ist |
|---|---|
| `terms[]` | Die Bedingungen – **alle** müssen zutreffen. Je `{f, op, val}`: das Feld (`"date"`, `"amount"`, `"ref1"` … `"ref5"`), die Vergleichsart, der Wert. Ist das Feld in der Datei nicht verknüpft, trifft die Bedingung nicht. |

Ein Ziel steht nicht in der Regel – sie liegt ja am Ziel. Die Regeln eines Posten laufen
beim Import in ihrer Reihenfolge; über alle Posten gilt: die erste Regel, die trifft,
bekommt die Zeile.

**Vergleichsarten (`op`):** `has` enthält · `not` enthält nicht · `starts` fängt mit ·
`ends` endet mit · `is` genau · `amt` **Betrag ist einer von** (Wert = Beträge, getrennt
durch `|`, verglichen als Zahl **mit Vorzeichen** – nur bei einer Datei, die alles ohne
Vorzeichen führt, ohne).

---

## 7. Ein Umfrage-Vermerk (`surveys[kennung]`)

| Feld | Was es ist |
|---|---|
| `status` | `0` bekannt und offen · `1` beantwortet |
| `seen` | Tag, an dem FINA die Umfrage bei diesem Buch zum ersten Mal gesehen hat |
| `answered` | Tag der Antwort |

Die Antworten selbst stehen **nicht** in der Datei.

---

## 8. Ein Link (`links[i]`)

`{name, url}` – beides Text. Ohne Adresse wird nichts angelegt; `https://` wird ergänzt,
wenn es fehlt. Ältere Dateien können Links ohne Namen enthalten.

---

## 9. Was **nicht** in der Datei steht

Alles, was nur die Anzeige betrifft, lebt in `ui` (`js/state.js`) und wird nie
gespeichert: gewählte Ansicht und Monat, Suchbegriff, die drei Filter der
Monatsansicht, „Erledigte Posten ausblenden", ob die Auswertung gerade offen ist, die
Wahl im Reiter Import Details, die Breite der Anleitung, die Aufteilung im CSV-Wizard.

---

## Der Weg zu dieser Fassung (6.9.26, drei Schritte an einem Tag)

Drei Zwischenstände seit `v260905`, keiner davon veröffentlicht. Sie stehen hier, weil
eine zwischendurch gespeicherte Datei so aussehen kann und `migrate()` jede dieser Formen
liest – der Reihe nach, von unten nach oben.

### Schritt 3 (abends)

* **Flexible Posten sind Posten.** Was bis dahin unter `kakCats[]`/`kak{}` stand, steht
  jetzt in `fixed[]` — mit allen Feldern eines Postens (Bank, Zahlungsart, Fälligkeit,
  letzte Zahlung, Links, Importkriterien) und demselben Fenster. Erkannt wird ein
  flexibler Posten an seiner Kategorie aus `flexGroups` (`isFlex()` in `js/calc.js`),
  so wie eine Einnahme an `incomeGroups`. Angelegt wird jeder Posten über denselben
  Menüeintrag „Neuer Eintrag"; die Kategorie entscheidet. Auf Wunsch von Lex (6.9.26).
* **Entfernt:** `kakCats[]`, `kak{}`, `plan{}`, `flexActual{}`, `tx[]`. Beim Öffnen einer
  älteren Datei zieht `migrateKak()` (`js/state.js`) alles in die Posten (siehe 4 und
  5) und löscht die Felder — FINA hat sie selbst angelegt, und `stateJson()` schriebe
  sie sonst bei jedem Speichern wieder hinaus. `flexSource{}` bleibt.
* **Korrekturen gibt es nicht mehr als eigenes Feld** (`override`): wer den Betrag
  eines importierten Monats ändert, macht den Monat auf — der Pfeil fällt, wie bei
  jedem Posten. Der frühere Korrekturwert wird beim Öffnen als Betrag übernommen.
* **Der Bereich „Flexible Posten" in den Einstellungen ist weg**; die flexiblen
  Kategorien stehen weiter unter „Kategorien".
* **CSV-Import:** eine Zeile, die als Quellzeile schon im Buch steht (derselbe Tag,
  derselbe Betrag, dieselben Referenzen), wird nie wieder zugeordnet — sie steht grau
  mit Kreuz in der neuen Spalte „X". Trifft ein Import einen Monat, der schon
  Quellzeilen hat, **ergänzt** er ihn (neue Zeilen kommen dazu, der Betrag wächst);
  ohne Quellzeilen ersetzt er ihn wie bisher.
* **Folge für ältere Fassungen:** eine Anwendung der zweiten Fassung (Schritt 2 des 6.9.26) öffnet
  eine neue Datei ohne `kak`/`tx` — ihre flexible Karte bleibt leer, und die flexiblen
  Posten aus `fixed[]` stehen dort in keiner Liste, zählen aber in „Regelmäßige Kosten"
  mit (ihre Kategorie kennt sie nicht). Verloren geht nichts; die neuere Fassung liest
  die Datei wieder richtig.

### Schritt 2 (nachmittags)

* **„ohne Kategorie" – je Bereich ein fester Schlüssel.** Jede der drei Kategorielisten
  enthält immer genau einen: `(Einnahmen ohne Kategorie)` in `incomeGroups`,
  `(Flexibel ohne Kategorie)` in `flexGroups`, `(Regulär ohne Kategorie)` in `groups`.
  Er lässt sich sortieren, aber nicht umbenennen und nicht löschen (Einstellungen). Posten
  ohne eigene Kategorie zeigen darauf; angezeigt wird der Schlüssel über `keyLabel()` in
  beiden Sprachen als „N/A" (seit 6.9.26 spät; davor „Einnahmen ohne Kategorie" / „Income – no category" — der Bereich steht überall als Überschrift darüber). Der
  Bereich steht im Schlüssel, weil derselbe Name in `incomeGroups` **und** `groups`
  stünde und `isIncome()` ihn sonst nicht mehr auseinanderhielte. Auf Wunsch von Lex
  (6.9.26).
* **Flexible Posten mit Kategorien.** Was bis dahin „flexible Kategorie" hieß
  (`kakCats[]`, `kak{}`), ist jetzt ein **flexibler Posten**; darüber liegt die neue
  Liste `flexGroups[]`, und jeder Posten trägt `group`. Die drei Bereiche heißen in der
  Oberfläche Income · Flexible · Regular (Einnahmen · Flexibel · Regulär).
* **Migration beim Lesen** (`ensureNoCat()` in `js/state.js`, aufgerufen von
  `migrate()`): fehlt `flexGroups`, wird es angelegt; fehlt in einer Liste der feste
  Schlüssel, kommt er nach oben; ein flexibler Posten ohne `group` steht in
  `(Flexibel ohne Kategorie)`; ein regulärer Posten, dessen `group` in keiner Liste
  steht, zieht nach `(Regulär ohne Kategorie)` – nur der alte feste Name `EINNAHMEN`
  nach `(Einnahmen ohne Kategorie)`. Dasselbe läuft nach dem Einlesen einer
  FINA-Tabelle (`applySheet()`).
* **Folge für ältere Fassungen:** eine Anwendung der ersten Fassung (Schritt 1 des 6.9.26) sieht die
  festen Schlüssel als gewöhnliche Kategorien mit seltsamem Namen und `flexGroups` gar
  nicht; sie lässt beides stehen (`migrate()` rührt Unbekanntes nicht an). Löscht sie
  einen festen Schlüssel aus einer Liste, legt die neuere Fassung ihn beim nächsten
  Öffnen wieder oben an. Verloren geht nichts.

### Schritt 1 (mittags)

* **Die Art ist aus der Struktur heraus – endgültig.** `csvMaps[…].kind` wird nicht
  mehr geschrieben (`c2SaveCols()` in `js/dialogs/csv2-wizard.js`) und nicht mehr
  gelesen: Importkriterien gelten für reguläre wie für flexible Posten gleich, der
  dritte Schritt des Imports zeigt Einnahmen, Flexible Payments und Regelmäßige Kosten
  zusammen (gegliedert wie die Jahresmatrix), und was eine Zeile bekommt, entscheidet
  ihr Ziel. Die Frage „Was steckt in der Datei?" in Schritt 1 ist weg. Auf Wunsch von
  Lex (6.9.26).
* **Migration beim Lesen:** `migrate()` löscht `kind` immer – sonst schriebe
  `stateJson()` es bei jedem Speichern wieder hinaus (dieselbe Behandlung wie
  `hideSettled` und `created`).
* **Mehrere Strukturen je Datei-Art.** Der Schlüssel bleibt der Fingerabdruck; eine
  zweite Struktur derselben Datei-Art liegt unter `fingerabdruck#2`, eine dritte unter
  `#3` (`c2NextMapKey()`). Angelegt wird sie im Namensfenster von Schritt 2 mit dem
  Haken „… behalten und diese als weitere Struktur dazu merken". Schritt 1 zeigt alle
  Strukturen einer Datei-Art und lässt mit einem Auswahlknopf wählen (`c2MapsFor()`,
  `W.mapKey`). Der Name (`file`) ist über alle Strukturen hinweg eindeutig.
* **Der Name ist im Stift-Fenster änderbar** (`openCsvStructure()`), und das Fenster
  ist auch aus Schritt 1 des Imports erreichbar; das ✕ daneben vergisst die Struktur.
* **Folge für ältere Fassungen:** eine Anwendung der vierten Fassung (v260905) findet
  in einer neueren Datei kein `kind` mehr – sie fragt die Art dann in Schritt 1 einmal
  und trägt sie nach; die neuere löscht sie beim nächsten Öffnen wieder. Eine zweite
  Struktur (`#2`) sieht eine ältere Fassung nicht; sie liegt unangetastet in der Datei,
  weil `migrate()` unbekannte Schlüssel nicht anrührt. Verloren geht nichts.

## Was davor war

Die vier Schritte des 5.9.26 stehen in `FINA Struktur v260905.md`.

## Geplant – noch nicht gebaut (Vorschlag, braucht dein Okay)

Das Folgende ist **nicht** umgesetzt. Es beschreibt, wohin die Struktur soll, damit wir
die Migration in einem Zug planen können. Jede der drei Nummern wäre eine neue Fassung
dieser Datei.

### A. Eine Strukturnummer in der Datei

Heute steht in der Datei nur `v`, die Fassung der **Anwendung** – und die wechselt mit
jedem Push, auch wenn sich an der Struktur nichts geändert hat. Vorschlag: ein zweites
Feld **`schema`** (Zahl, beginnend bei `1` für den Stand dieser Datei). `migrate()`
liest es zuerst und baut Stufe für Stufe um (1 → 2 → 3 …), statt jedes Feld einzeln zu
raten. Fehlt es, gilt Stufe 1. So lässt sich später genau sagen: „diese Datei ist auf
Stufe 2, die Anwendung erwartet 3, es fehlt der Schritt 2 → 3".

### B. Änderungsprotokoll (was seit dem letzten Speichern geschehen ist)

Beim Speichern soll der Nutzer sehen, was sich im Buch geändert hat. Zwei Wege:

* **Rechnen statt aufschreiben** (mein Vorschlag): FINA merkt sich beim Laden und nach
  jedem Speichern eine Kopie des Buches und vergleicht beim nächsten Speichern – „Posten
  ‚Miete': Betrag März 850 → 870", „neue Kategorie ‚Freizeit'", „Importkriterien von
  ‚Strom' geändert". Das braucht **keine** Änderung an der Datei und keine Stelle im
  Code, die etwas mitschreiben muss; es kann keine Änderung vergessen.
* Ein Protokoll **in der Datei** (Liste `log[]` mit Zeitpunkt und Text) wäre eine
  Strukturänderung und müsste an jeder Stelle gepflegt werden, an der `save()` steht.
  Vorteil: auch nach dem Speichern noch nachzulesen. Lässt sich später auf den ersten
  Weg draufsetzen.

### C. Die FINA Bezugsfelder – heute und geplant

Was du als Bezugsfelder beschrieben hast, gegen das, was heute in der Datei steht:

| Bezugsfeld | Heute in der Datei | Ebene | Anmerkung |
|---|---|---|---|
| Datum | Nur bei Buchungen (`tx`: `y/m/d`) und Quellzeilen (`impRows[m][].d`). Ein Posten hat kein Datum – der Monat ist die Stelle in der Zwölferliste. | Monat | Passt: Datum steuert Monat/Jahr nur beim Import. |
| Monat / Jahr | Monat = Stelle 0–11, Jahr = `year` der Datei | Monat / Datei | Ein Buch = ein Jahr. |
| FINA Betrag Plan | `amounts[m]` (Posten) · `plan[m]` (flexibel) | Monat | **Es gibt nur einen Betrag.** Beim Posten überschreibt der Import den Planwert – nach „Importdaten löschen" ist er weg. Genau das soll sich ändern. |
| FINA Betrag Final | Nicht getrennt. Flexibel: `flexActual[m][k]` + `override[m]`. | Monat | Muss neu: ein eigenes Feld je Monat, leer solange offen/geschätzt. |
| Betragsstatus | Verteilt auf drei Felder: `paid[m]` (verrechnet), `imp[m]` (importiert), `estimated` (geschätzt – **je Posten**, nicht je Monat) | Monat (estimated: Posten) | Muss neu: **ein** Feld je Monat mit vier Werten offen · geschätzt · verrechnet · importiert. `estimated` je Monat statt je Posten. |
| Importdatum | Fehlt. Es gibt nur `lastImport` (für alles) und `csvMaps[].date` (wann gemerkt). | – | Muss neu, je Monat. |
| Importbetrag | Posten: Summe der `impRows[m][].v` (= `amounts[m]`); flexibel: `flexActual[m][k]` | Monat | Als eigenes Feld je Monat, damit Plan, Final und Import nebeneinander stehen. |
| Beschreibung | `name` | Posten | |
| Notizen | `note` (Posten) und `notes[m]` (Monat) | beides | Passt schon. |
| Kategorie_Ebene_1 | Posten: die **Liste**, in der `group` steht (Einnahme / Ausgabe); flexibel: immer „Flexible Payments" | Posten | Heute nicht als Feld, sondern aus der Listenzugehörigkeit gerechnet (`isIncome()`). |
| Kategorie_Ebene_2 | `group` (Posten) · der Name (flexibel) · Referenz 1 (`tx.r[0]`) nur an der Buchung | Posten | Flexibel gibt es keine zweite Ebene im Buch. |

**Zielbild (Vorschlag):** ein Posten trägt `kind` (`in` · `out` · `flex`), `cat1`,
`cat2` und die Postenattribute; je Monat ein Objekt `months[m]` mit `plan`, `final`,
`status`, `impDate`, `impAmount`, `impRows`, `note`. Die flexiblen Kategorien würden
dann **derselbe Objekttyp** wie ein Posten (mit `kind:'flex'`) – „unter der Motorhaube
gleich", wie du es beschrieben hast; die Ansichten nennen sie nur anders.

**Kategorien:** je Ebene ein Merkmal, ob sie gefüllt sein **muss** – Vorschlag als
Einstellung der Datei, z. B. `catRules:{level1:'required', level2:'optional'}`. Eine
Angabe je Kategorie wäre mehr Pflege, ohne dass jemand sie braucht.

**Schon vorgemerkt, nicht Teil dieser Stufe:** Währung, Bankbezug, Budget.

**Was die Migration tun müsste:** aus `amounts/paid/imp/impRows/notes` je Monat ein
`months[m]` bauen; `estimated` auf die offenen Monate übertragen; `group` +
Listenzugehörigkeit in `kind/cat1/cat2` übersetzen; flexible Kategorien aus `kak` +
`flexActual` + `override` zu Posten mit `kind:'flex'` machen. Das ist ein großer Schritt
– deshalb erst mit deinem Okay, und in einer eigenen Fassung dieser Datei.
