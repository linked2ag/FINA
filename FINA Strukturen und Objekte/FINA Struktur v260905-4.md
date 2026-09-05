# FINA Struktur v260905-4

**Stand:** 5. September 2026, vierte Fassung des Tages (spät) · Fassung der Anwendung `26.8.30` (`VERSION` in `js/config.js`)

**Vorgängerin:** `FINA Struktur v260905-3.md`. Was sich gegenüber ihr geändert hat, steht unten unter „Änderungen an dieser Fassung".

## Wozu diese Datei

FINA speichert alles in **einer JSON-Datei** – dem Buch. Diese Datei hier beschreibt, wie
das Buch innen aufgebaut ist: jedes Feld, was es bedeutet, und was FINA tut, wenn es in
einer älteren Datei fehlt.

**Drei Regeln für diesen Ordner:**

1. **Bevor sich an der Struktur etwas ändert, wird Lex gewarnt.** Eine Änderung heißt
   fast immer: alte Dateien müssen beim Öffnen umgebaut werden (Migration), sonst liest
   FINA sie falsch.
2. **Jede Änderung bekommt eine neue Datei** mit neuer Nummer. Die alte bleibt liegen –
   so sieht man, was sich wann geändert hat. Die Nummer ist `v` + Datum (`JJMMTT`) +
   laufende Nummer am Tag: `v260905-1`.
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
| `groups[]` | Die Ausgabe-Kategorien (nur Namen) | `["WOHNEN","AUTO"]` | … leer |
| `incomeGroups[]` | Die Einnahme-Kategorien (nur Namen) | `["GEHALT"]` | … `["EINNAHMEN"]` (alte Dateien zeigen darauf); eine **leere** Liste bleibt leer |
| `fixed[]` | Die regulären Posten – Einnahmen und regelmäßige Kosten. Aufbau: siehe 2. | | … leer |
| `balance` | Die Saldokorrektur – ein einzelner Posten mit fester Kennung. Siehe 3. | | … eine leere Zeile |
| `kakCats[]` | Die Namen der flexiblen Kategorien, in Reihenfolge | `["Lebensmittel","Freizeit"]` | … aus den Schlüsseln von `kak` |
| `kak{}` | Je flexibler Kategorie ihre Werte, Schlüssel = Name. Siehe 4. | | … leer |
| `plan{}` | **Alt.** Ein Planwert je Kategorie, von vor den zwölf Monatswerten. Wird nur noch gelesen, um `kak[k].plan` zu füllen. | `{"Lebensmittel":400}` | … leer |
| `flexActual{}` | Je Monat 1–12 ein Objekt: importierte Ist-Summe je flexibler Kategorie. `null` heißt: für diese Kategorie in diesem Monat kein Import (mehr). | `{"3":{"Lebensmittel":412.5}}` | … zwölf leere Monate |
| `flexSource{}` | Je Monat 1–12 der Name der Datei, aus der der Monat importiert wurde, sonst `null` | `{"3":"export.csv"}` | … zwölf `null` |
| `tx[]` | Die einzelnen importierten Buchungen der flexiblen Kosten. Siehe 5. | | … leer |
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
| `csvMaps{}` | Gemerkte CSV-Strukturen, Schlüssel = Fingerabdruck der Spaltenköpfe. **Art und Feldverknüpfung**, keine Regeln. Siehe 6. | | … leer |

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
| `group` | Name der Kategorie. Steht der Name in `incomeGroups`, ist der Posten eine **Einnahme**, steht er in `groups`, eine **Ausgabe**. Ein Name darf nur in einer der beiden Listen stehen. | `"WOHNEN"` |
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

## 4. Eine flexible Kategorie (`kak[name]`)

Der **Name ist der Schlüssel** – deshalb wird er nie direkt überschrieben, sondern über
`renameKakCat()` (`js/categories.js`), das `flexActual`, `tx`, `plan` und die
CSV-Zuordnungen mitzieht.

| Feld | Ebene | Was es ist |
|---|---|---|
| `plan[12]` | Monat | Die Annahme je Monat (positiv als Kostenbetrag) |
| `paid[12]` | Monat | Abgehakt? |
| `override[12]` | Monat | Von Hand korrigierter Wert **über** einem Import, sonst `null` |
| `notes[12]` | Monat | Notiz je Monat |
| `estimated` | Kategorie | Geschätzt? (für die ganze Kategorie) |
| `note` | Kategorie | Notiz zur Kategorie |
| `links[]` | Kategorie | Zugehörige Links, wie beim Posten |
| `impRules[]` | Kategorie | **Nur wenn vorhanden.** Die Importkriterien der Kategorie, wie beim Posten. Siehe 6a. |

Der **Ist-Wert** eines Monats steht nicht hier, sondern in `flexActual[m][name]` (Summe
der importierten Buchungen), die **Quelle** in `flexSource[m]`, die **einzelnen
Buchungen** in `tx[]`. Welcher Wert zählt, entscheidet `kakVal()` in `js/calc.js`:
Korrektur vor Import, Import vor Haken, Haken vor Annahme.

---

## 5. Eine Buchung (`tx[i]`)

Eine Zeile aus einem CSV-Import der flexiblen Kosten.

| Feld | Was es ist | Beispiel |
|---|---|---|
| `y`, `m`, `d` | Datum als Jahr, Monat, Tag (Zahlen) | `2026`, `3`, `14` |
| `main` | Name der flexiblen Kategorie (= `kakCats`-Eintrag) — das **Ziel** der Zuordnung | `"Lebensmittel"` |
| `r[]` | Die **Referenzen** der Zeile in ihrer Rangfolge (Referenz 1 bis 4), wie bei `impRows`. Referenz 1 steht im Reiter „Import Details" an der Stelle der früheren Unterkategorie, 2 und 3 als Notiz darunter (`txSub()` / `txNote()` in `js/calc.js`). | `["Supermarkt","REWE Berlin"]` |
| `v` | Betrag, Kosten negativ | `-23.45` |
| `once` | **Nur wenn gesetzt:** `1` = kam aus einer einmaligen Zuordnung | `1` |

**Ältere Buchungen** (bis 5.9.26 vormittags, und alle aus dem alten Fast-Budget-Import) tragen statt `r` die Felder `cat` (Unterkategorie aus der Datei), `acc` (Konto, immer leer) und `note` (Beschreibung). Sie bleiben, wie sie sind; gelesen wird beides über dieselben Helfer. Der Import schreibt die drei alten Felder nicht mehr.

---

## 6. Eine gemerkte CSV-Struktur (`csvMaps[fingerabdruck]`)

Der Schlüssel ist ein Hashwert über die Spaltenköpfe der Datei (`c2Fp()` in
`js/dialogs/csv2-wizard.js`) – daran erkennt FINA die Datei-Art beim nächsten Hochladen.

**Eine Struktur ist die Art und die Feldverknüpfung** – ob die Datei-Art reguläre oder
flexible Posten füttert, und welche Spalte der Datei welches FINA-Feld trägt.
„Automatisch CSV-Datenstruktur vorbereiten" bringt beides mit und sperrt die Art im
Wizard; wer dieselbe Datei-Art einmal anders einlesen will, ordnet die Struktur im Import
neu an (das überschreibt sie) oder ändert sie in den Einstellungen unter Import mit dem
Stift – dort stehen links die FINA-Felder und die Art, rechts die Spalten der Datei.
Regeln stehen hier **nicht**, sie wohnen am Posten (6a).

| Feld | Was es ist | Beispiel |
|---|---|---|
| `date` | Tag, an dem gemerkt wurde (Text) | `"5.9.2026"` |
| `file` | Die Beschriftung – beim ersten Merken der Dateiname, danach der Name aus dem Namensfenster des Imports; in den Einstellungen änderbar | `"umsaetze.csv"` |
| `kind` | Was in der Datei steckt: `"reg"` (reguläre Posten) oder `"flex"` (flexible Kategorien). **Kann fehlen**: bei Strukturen vom Nachmittag des 5.9.26 (Fassung v260905-3) und wenn im Stift-Fenster „—" gewählt wurde – der nächste Import fragt die Art dann einmal und trägt sie nach. | `"reg"` |
| `f{}` | Welche Spalte welches FINA-Feld trägt: `{date, amount, ref1, ref2, ref3, ref4}`, je Spaltennummer oder `-1`. **Es gibt nur diese sechs Felder.** | `{"date":0,"amount":4,"ref1":3,"ref2":-1,"ref3":-1,"ref4":-1}` |
| `header[]` | Die Spaltenköpfe der Datei – damit das Stift-Fenster in den Einstellungen die Spalten beim Namen nennen kann statt „Spalte 4" | `["Buchungstag","…"]` |

**Ältere Einträge** (bis 5.9.26 nachmittags) trugen dazu `cols[]`, `rules[]` und
`newT[]`, und `f` kannte `main`, `cat`, `desc` statt der Referenzen; ihr `kind` hatte
dieselbe Bedeutung wie heute. `migrate()` übersetzt beim Öffnen (siehe „Änderungen der
Fassung v260905-3") und entfernt die drei Felder – `kind` bleibt, sofern es `reg` oder
`flex` ist.

## 6a. Ein Importkriterium (`impRules[i]` am Posten oder an der Kategorie)

Eine Regel, nach der der CSV-Import Zeilen **diesem** Posten zuordnet. Sie hängt an
keiner Datei-Art: die Bedingungen nennen FINA-Felder, und jede Datei, deren Struktur
diese Felder verknüpft, kann sie erfüllen.

| Feld | Was es ist |
|---|---|
| `terms[]` | Die Bedingungen – **alle** müssen zutreffen. Je `{f, op, val}`: das Feld (`"date"`, `"amount"`, `"ref1"` … `"ref4"`), die Vergleichsart, der Wert. Ist das Feld in der Datei nicht verknüpft, trifft die Bedingung nicht. |

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

## Änderungen an dieser Fassung (5.9.26, vierte Fassung)

* **Die Art gehört wieder zur Struktur.** `csvMaps[…].kind` (`"reg"` | `"flex"`) wird
  mit „Spalten speichern und weiter" geschrieben (`c2SaveCols()` in
  `js/dialogs/csv2-wizard.js`), außerdem vom Stift-Fenster der Einstellungen
  (`openCsvStructure()`) und – bei einer Struktur ohne Art – vom „Weiter" in Schritt 2. Grund: „Automatisch CSV-Datenstruktur vorbereiten" soll
  ohne weitere Frage in Schritt 2 gehen; die Art ist danach im Wizard gesperrt
  (`c2LockedKind()`). Die dritte Fassung hatte sie am Nachmittag herausgenommen – auf
  Wunsch am Abend wieder hinein.
* **Migration beim Lesen:** `migrate()` löscht `kind` nicht mehr – nur einen Wert, der
  weder `reg` noch `flex` ist. Strukturen aus v260905-3 haben kein `kind`; bei ihnen
  bleibt die Art in Schritt 1 wählbar (der Wizard hält an, solange keine gewählt ist)
  und wird beim Weitergehen nachgetragen (`c2WireNav`, Knopf „Weiter" in Schritt 2).
* **Folge für ältere Fassungen:** eine Anwendung der dritten Fassung löscht `kind` beim
  Öffnen und schreibt die Struktur ohne Art zurück – die neuere fragt sie beim nächsten
  Import dann wieder einmal. Verloren geht nichts.

## Änderungen der Fassung v260905-3 (5.9.26, dritte Fassung)

*(Stand von damals – was `kind` betrifft, gilt seit v260905-4 der Abschnitt darüber.)*

* **Referenz 4.** Die Importfelder sind jetzt Datum, Betrag und Referenz 1 bis 4
  (`csvMaps[…].f` bekommt `ref4`; `impRows[m][].r` und `tx[].r` können vier Einträge
  haben).
* **Struktur und Kriterien sind getrennt.** `csvMaps[…]` merkt sich nur noch die
  Feldverknüpfung (`f`, dazu `file`, `date`, `header`). `kind`, `cols`, `rules` und
  `newT` sind heraus. Die Regeln wandern **an den Posten**: `fixed[i].impRules[]` und
  `kak[name].impRules[]`, und ihre Bedingungen nennen ein **Feld** (`f`) statt einer
  Spaltennummer (`ci`). Damit gelten sie für jede Datei-Art, deren Struktur die Felder
  verknüpft.
* **Migration beim Lesen** (`migrate()`): je gemerkter Datei-Art werden die alten Regeln
  übersetzt – die Spaltennummer wird über die Feldverknüpfung zum Feld; eine Spalte
  ohne Feld bekommt die nächste freie Referenz (und die Struktur diese Verknüpfung
  dazu), damit die Bedingung nicht verloren geht; erst wenn keine Referenz mehr frei ist,
  fällt sie weg. Das Ziel wird über `id` bzw. Name gefunden; ein „n:Name"-Ziel wird aus
  `newT` angelegt (regulär braucht es dafür seine Kategorie, sonst fällt die Regel weg).
  Danach werden die vier alten Felder gelöscht.
* **Folge für ältere Fassungen:** eine App-Fassung von vor dem 5.9.26 abends findet in
  `csvMaps` keine Regeln mehr und kennt `impRules` nicht – sie ordnete nichts von selbst
  zu, verlöre aber nichts: die Regeln bleiben als unbekanntes Feld am Posten stehen.

## Änderungen der Fassung v260905-2 (5.9.26, zweite Fassung)

* **Die fünf Importfelder.** Der CSV-Import kennt nur noch Datum, Betrag, Referenz 1,
  Referenz 2 und Referenz 3 — für reguläre und flexible Posten dieselben. Zugeordnet
  wird allein über Filterkriterien; die Referenzen beschreiben die Zeile und sind eine
  Rangfolge wie Überschrift 1 · 2 · 3. Drei Stellen der Datei ändern sich:
  * `csvMaps[…].f` heißt jetzt `{date, amount, ref1, ref2, ref3}` (vorher `main, cat,
    desc`). **Migration beim Lesen** in `migrate()`: main → ref1, cat → ref2, desc →
    ref3, Lücken rücken auf.
  * `fixed[].impRows[m][]` bekommt `r[]` (die drei Referenzen) statt des Textes `x`.
    Keine Migration: alte Zeilen behalten `x`, gelesen wird beides.
  * `tx[]` bekommt `r[]`; `cat`, `acc` und `note` schreibt der Import nicht mehr. Keine
    Migration: alte Buchungen behalten ihre Felder, gelesen wird beides.
  **Folge für ältere Fassungen:** eine App-Fassung von vor dem 5.9.26 nachmittags kennt
  `ref1…3` nicht — sie sähe eine gemerkte Zuordnung ohne Beschreibungsfeld und zeigte
  neue Quellzeilen und Buchungen ohne Text. Zahlen gehen dabei nicht verloren.
* **Weggefallen:** der Knopf „Je Hauptkategorie automatisch" im dritten Schritt des
  Imports. Er hing an der Hauptkategorie-Spalte, die es nicht mehr gibt.

## Änderungen der Fassung v260905-1 (5.9.26, erste Fassung)

* **Neue Vergleichsart `amt`** in den Bedingungen einer CSV-Regel (`csvMaps[].rules[].terms[].op`).
  Sie entsteht über „Suchen nach Betrag" im Zielmenü des CSV-Imports und wird mit
  „Zuordnen und merken" in die Datei geschrieben. **Folge für ältere Fassungen:** eine
  App-Fassung von vor dem 5.9.26 kennt `amt` nicht und läse die Bedingung als „enthält" –
  die Regel griffe dort daneben. Es ist die einzige Strukturänderung dieses Tages; sonst
  wurden nur Fenster und Bedienung geändert.
* **Beim Umbenennen einer flexiblen Kategorie** zieht `renameKakCat()` jetzt auch die
  Ziele in `csvMaps` mit (`"k:<alter Name>"` → `"k:<neuer Name>"`). Das ist keine
  Strukturänderung, sondern ein Fehler, der bisher offen war.

---

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
