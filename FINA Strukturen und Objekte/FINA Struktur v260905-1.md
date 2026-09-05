# FINA Struktur v260905-1

**Stand:** 5. September 2026 · Fassung der Anwendung `26.8.30` (`VERSION` in `js/config.js`)

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
| `csvMaps{}` | Gemerkte CSV-Zuordnungen, Schlüssel = Fingerabdruck der Spaltenköpfe. Siehe 6. | | … leer |

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

### Monatsattribute (Listen mit zwölf Einträgen)

| Feld | Was es ist | Beispiel |
|---|---|---|
| `amounts[12]` | Der Betrag des Monats. Einnahmen positiv, Kosten negativ. **Es gibt nur einen Betrag je Monat** – ein Import ersetzt ihn. | `[-850,-850,…]` |
| `paid[12]` | Ist der Monat abgehakt („so war es")? | `[true,true,false,…]` |
| `imp[12]` | Kam der Betrag aus einem CSV-Import? `false`/`0` nein · `1` ja, Zuordnung gemerkt · `2` ja, einmalige Zuordnung (roter Kreis) | `[1,1,0,…]` |
| `notes[12]` | Notiz je Monat (die Lampe in der Monatskachel) | `["","Nachzahlung",…]` |
| `impRows{}` | **Nur bei importierten Monaten.** Schlüssel = Monat 1–12, Wert = Liste der Quellzeilen `{d, v, x}`: Datum als Text `"TT.MM.JJ"`, Betrag, Text aus den übrigen Spalten. Aus ihnen ist `amounts[m]` entstanden. | `{"3":[{"d":"05.03.26","v":-850,"x":"Hausverwaltung · Miete März"}]}` |

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
| `main` | Name der flexiblen Kategorie (= `kakCats`-Eintrag) | `"Lebensmittel"` |
| `cat` | Unterkategorie aus der Datei (nur an der Buchung, nicht im Buch als Liste) | `"Supermarkt"` |
| `acc` | Konto aus der Datei (zur Zeit leer) | `""` |
| `note` | Beschreibung / Verwendungszweck | `"REWE Berlin"` |
| `v` | Betrag, Kosten negativ | `-23.45` |
| `once` | **Nur wenn gesetzt:** `1` = kam aus einer einmaligen Zuordnung | `1` |

---

## 6. Eine gemerkte CSV-Zuordnung (`csvMaps[fingerabdruck]`)

Der Schlüssel ist ein Hashwert über die Spaltenköpfe der Datei (`c2Fp()` in
`js/dialogs/csv2-wizard.js`) – daran erkennt FINA die Datei-Art beim nächsten Hochladen.

| Feld | Was es ist | Beispiel |
|---|---|---|
| `date` | Tag, an dem gemerkt wurde (Text) | `"5.9.2026"` |
| `file` | Name der Datei beim ersten Mal – nur eine Beschriftung, in den Einstellungen änderbar | `"umsaetze.csv"` |
| `kind` | `"reg"` (reguläre Posten) oder `"flex"` (flexible Kosten) | `"reg"` |
| `cols[]` | Nummern der gewählten Spalten (0 = erste Spalte) | `[0,3,4]` |
| `f{}` | Welche Spalte welches FINA-Feld trägt: `{date, amount, main, cat, desc}`, je Spaltennummer oder `-1` | `{"date":0,"amount":4,"main":-1,"cat":-1,"desc":3}` |
| `header[]` | Die Spaltenköpfe der Datei (damit Fenster Namen statt Nummern zeigen). Ältere Zuordnungen haben das Feld nicht. | `["Buchungstag","…"]` |
| `rules[]` | Die Regeln, in Reihenfolge – die erste, die trifft, bekommt die Zeile. Siehe unten. | |
| `newT[]` | Ziele, die beim Import neu angelegt wurden: `{tid, name, income, group, bank, pay, due}` | |

### Eine Regel (`rules[i]`)

| Feld | Was es ist |
|---|---|
| `t` | Das Ziel: `{tid, name, income}`. `tid` hat drei Formen: `"i:<id>"` ein Posten (über seine `id`), `"k:<name>"` eine flexible Kategorie (über ihren Namen), `"n:<name>"` ein Ziel, das erst beim Anwenden entsteht. |
| `terms[]` | Die Bedingungen – **alle** müssen zutreffen. Je `{ci, op, val}`: Spaltennummer (`-1` = Schnellfilter über alle Spalten), Vergleichsart, Wert. |
| `flt{}` | **Alt** (vor den Bedingungen): `{spaltennummer: wert}`, ein `=` vorn hieß „genau". Wird beim Öffnen in `terms` übersetzt. |

**Vergleichsarten (`op`):** `has` enthält · `not` enthält nicht · `starts` fängt mit ·
`ends` endet mit · `is` genau · `amt` **Betrag ist einer von** (Wert = Beträge, getrennt
durch `|`, verglichen als Zahl **mit Vorzeichen** – nur bei einer Datei, die alles ohne
Vorzeichen führt, ohne). `amt` ist **neu seit 5.9.26** (siehe „Änderungen an dieser
Fassung").

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

## Änderungen an dieser Fassung (5.9.26)

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
| Kategorie_Ebene_2 | `group` (Posten) · der Name (flexibel) · `tx.cat` nur an der Buchung | Posten | Flexibel gibt es keine zweite Ebene im Buch. |

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
