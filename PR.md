# FINA-Dashboard — Ablösung der Google-Sheets-Jahresabrechnung

## Ausgangslage

Die Jahres- und Monatsabrechnung lief in einem Google Sheet mit rund vierzig Positionen.
Die flexiblen Alltagsausgaben wurden täglich in *Fast Budget* erfasst und am Monatsende von
Hand in die Tabelle übertragen. Der Bezahlt-Status wurde durch ein Minuszeichen hinter dem
Betrag markiert und über Textfilter ausgewertet; ein Fragezeichen stand für einen noch
unklaren Betrag.

Zwei Schwachstellen: die monatliche Handarbeit beim Übertragen und das fehlende Bild darüber,
was im laufenden Monat noch offen ist.

## Was diese Änderung liefert

Eine eigenständige HTML-Datei, die lokal im Browser läuft und die Tabelle vollständig ersetzt.

- **CSV-Import aus Fast Budget.** Die Hauptkategorien des Exports decken sich mit den
  Kakeibo-Zeilen der Tabelle. Ein Import füllt die betroffenen Monate, ersetzt vorhandene
  Daten dieser Monate und legt neue Kategorien selbständig an.
- **Offen, bezahlt, geschätzt** als ausdrückliche Zustände statt als Textmarkierung, mit
  Filtern, Sammelaktionen und einem Zähler je Monat.
- **Vier Ansichten** — Jahresmatrix, Monatsabrechnung, Restjahres-Prognose,
  Kategorienauswertung.
- **Speicherung in einer JSON-Datei** auf der Festplatte, die der Nutzer selbst wählt, lädt
  und speichert. Kein Server, kein Konto, keine automatische Ablage im Browser.

## Fachliche Entscheidungen

**Fast Budget bleibt.** Der Export passt eins zu eins auf die Kakeibo-Struktur. Ein Wechsel
der App hätte nichts verbessert.

**Kein Auto-Save.** Ursprünglich schrieb die Anwendung jede Änderung sofort in eine dauerhaft
verbundene Datei. Auf Wunsch wurde daraus ein bewusstes Laden und Speichern über drei Knöpfe;
ungespeicherte Änderungen werden angezeigt und beim Schließen abgefragt.

**Geschätzt gilt für die ganze Position,** nicht für einzelne Monate. Der Fall ist immer
derselbe: Ein Vertrag rechnet variabel ab, etwa Telekommunikation oder Strom.

**Importierte Werte sind korrigierbar.** Sie tragen die Marke `IMPORTED`; wird der Betrag
überschrieben, wechselt sie auf `CORRECTED`. Der Originalwert bleibt erhalten, ein erneuter
Import verwirft die Korrektur.

**Stammdaten sind Daten, nicht Code.** Banken, Zahlungsarten und Kategorien der regelmäßigen
Kosten werden in der Anwendung gepflegt, per Ziehen sortiert und in der JSON-Datei abgelegt.
Nur `EINNAHMEN` ist fest verdrahtet, weil die Saldo-Rechnung daran hängt.

## Datenübernahme

Die vierzig Positionen der ursprünglichen Tabelle liegen in `fina-2026-start.json`:
Monatsbeträge, Bank, Zahlungsart, Fälligkeit, Enddatum, Bezahlt-Status und die Kakeibo-Ist-Werte
für Januar bis April.

Der Bezahlt-Status wurde Zeile für Zeile aus der Ursprungstabelle abgeleitet: Ein Minus oder
Fragezeichen hinter dem Betrag bedeutet offen, ein leeres Feld bezahlt. Daraus ergeben sich
Januar bis April als vollständig abgeschlossen, ab Mai gemischt.

Kontrollsummen gegen die Ursprungstabelle: Januar 2.823,37 · Februar 3.599,19 · März 1.752,03.
Kontrollsummen gegen den CSV-Export: Mai −1.760,00 · Juni −2.385,00 · Juli −1.904,00.

## Dateien

| Datei | Inhalt |
|---|---|
| `fina-dashboard.html` | Die gesamte Anwendung, rund 2.000 Zeilen, keine Abhängigkeiten außer Webfonts |
| `fina-2026-start.json` | Übernommene Daten aus dem Google Sheet |
| `SPEC.md` | Datenmodell, Rechenregeln, Importlogik, Ansichten |
| `PR.md` | Dieses Dokument |

## Erste Schritte

1. `fina-dashboard.html` lokal öffnen, am besten in Chrome oder Edge.
2. Auf **Daten hochladen** klicken und `fina-2026-start.json` wählen.
3. Auf **Daten speichern** klicken und unter eigenem Namen ablegen, gerne in einem
   Cloud-Ordner. Ab hier ist diese Datei die einzige Datenquelle.
4. Im Bereich **Kakeibo** den aktuellen Fast-Budget-Export einlesen.

## Offene Punkte für eine Weiterentwicklung

- **Jahreswechsel.** `YEAR` ist eine Konstante. Sinnvoll wäre, das Jahr aus der geladenen Datei
  zu übernehmen und einen Jahresabschluss zu bauen, der Fortsetzungsraten überträgt.
- **Spalte P der Ursprungstabelle** mit den Werten 12, 1 und 4 wurde nicht übernommen, weil der
  Rhythmus bereits aus den zwölf Monatsbeträgen hervorgeht. Falls sie als eigenes Feld gebraucht
  wird, gehört sie neben `dueDay`.
- **Belegverweise** sind leer. In der Ursprungstabelle stand nur das Wort URL, nicht der Link.
- **Automatischer Kontoabgleich.** Der Bezahlt-Status wird weiterhin von Hand gesetzt. Ein
  CAMT- oder MT940-Import mit Vorschlagslogik wäre der nächste große Schritt.
- **Tests.** Bisher nur ein Rauchtest über Node, der die Ansichten ohne Browser rendert. Für
  Parser und Rechenregeln wären echte Unit-Tests angebracht.
