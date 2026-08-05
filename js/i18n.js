/* ══════════════════════════════════════════════════════════════
   FINA — Sprache
   Alle sichtbaren Texte stehen hier, Englisch und Deutsch
   nebeneinander. Die Oberfläche startet auf Englisch; die Wahl
   liegt in state.lang und wandert damit in die JSON-Datei.

   Benutzt wird ausschließlich t('schlüssel', wert0, wert1, …).
   Platzhalter im Text sind {0}, {1}, … in beiden Sprachen gleich.

   Zahlen bleiben in beiden Sprachen im deutschen Format
   (1.234,56) — so stehen sie in der Datei und so werden sie
   eingetippt. Nur die Beschriftungen wechseln.
   ══════════════════════════════════════════════════════════════ */

const LANGS=[['en','English'],['de','Deutsch']];
const LANG=()=>((state&&state.lang)==='de'?'de':'en');

const MONTH_NAMES={
  en:{short:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      long:['January','February','March','April','May','June','July','August','September','October','November','December']},
  de:{short:['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
      long:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']}
};

/* MONTHS, MONTHS_LONG, YEAR und CUR sind keine Konstanten mehr,
   sondern lesen bei jedem Zugriff Sprache und Datei. Alle
   Fundstellen bleiben dadurch unverändert (MONTHS[i], YEAR …). */
Object.defineProperty(window,'MONTHS',{get:()=>MONTH_NAMES[LANG()].short});
Object.defineProperty(window,'MONTHS_LONG',{get:()=>MONTH_NAMES[LANG()].long});
Object.defineProperty(window,'YEAR',{get:()=>(state&&state.year)||new Date().getFullYear()});
Object.defineProperty(window,'CUR',{get:()=>{
  const d=new Date();
  return d.getFullYear()===YEAR?d.getMonth()+1:1;
}});

function t(k,...a){
  const e=STR[k];
  if(!e) return k;                      /* fehlt der Schlüssel, fällt er auf */
  let s=e[LANG()]||e.en||k;
  a.forEach((v,i)=>{ s=s.split('{'+i+'}').join(v); });
  return s;
}

/* ── Feste Schlüssel im Zustand ───────────────────────────────
   Diese Wörter stehen als Schlüssel in der Datei — in it.group,
   in kakCats, kak, flexActual und tx[].main. Übersetzen darf man
   sie nicht: ein übersetzter Schlüssel trennt die Zeilen von
   ihren Daten (siehe js/categories.js). Angezeigt werden sie
   deshalb über keyLabel(), und zwar immer auf Englisch — in
   jeder Sprache. Wer den Schlüssel braucht (value=, data-…,
   Vergleiche), nimmt weiter den rohen Namen. */
const KEY_LABELS={
  'EINNAHMEN':'INCOME',
  '(ohne Hauptkategorie)':'(no main category)',
  '(ohne Kategorie)':'(no category)'
};
const keyLabel=k=>KEY_LABELS[k]||k;

const STR={
/* ── Kopfzeile und Gerüst ─────────────────────────────────── */
'app.sub':{en:'Cash book {0}',de:'Kassenbuch {0}'},
'app.load':{en:'Load data',de:'Daten hochladen'},
'app.loadTip':{en:'Open a JSON file and show its contents',de:'JSON-Datei öffnen und ihren Inhalt anzeigen'},
'app.save':{en:'Save data',de:'Daten speichern'},
'app.saveTip':{en:'Write the current state into the JSON file',de:'Aktuellen Stand in die JSON-Datei schreiben'},
'app.unlink':{en:'Close file',de:'Verbindung zu Daten trennen'},
'app.unlinkTip':{en:'Clear the view and let go of the file',de:'Ansicht leeren und die Datei loslassen'},
/* Der Import steht in der Kopfzeile, nicht mehr im Reiter: den
   Reiter gibt es erst nach dem ersten Import (siehe hasImport()
   in js/calc.js), der Knopf muss vorher erreichbar sein. */
'app.import':{en:'Import CSV',de:'CSV importieren'},
'app.importTip':{en:'Read Flexible Payments from a Fast Budget CSV export — nothing is changed until you confirm',
  de:'Flexible Payments aus einem Fast-Budget-CSV einlesen — geändert wird erst nach deiner Bestätigung'},
'app.settings':{en:'Settings',de:'Einstellungen'},
'app.settingsTip':{en:'Language, year, column widths, banks, payment types and categories',
  de:'Sprache, Jahr, Spaltenbreiten, Banken, Zahlungsarten und Kategorien'},
'app.guide':{en:'Guide',de:'Anleitung'},
'app.guideTip':{en:'Open the guide beside the table — reading and working at the same time',
  de:'Anleitung neben der Tabelle öffnen — lesen und gleichzeitig arbeiten'},
'app.guideDrag':{en:'Drag to change the width',de:'Ziehen ändert die Breite'},
/* Die beiden Reiter der Anleitung: erst der Weg für Anfänger,
   dann die Beschreibung dessen, was die Anwendung kann. */
'guide.tabSteps':{en:'Step by step',de:'Schritt für Schritt'},
'guide.tabProduct':{en:'What FINA can do',de:'Was FINA kann'},
'guide.tabNews':{en:"What's New",de:'Was ist neu'},
'guide.zoom':{en:'Click a picture to open it full size.',de:'Klick auf ein Bild öffnet es in voller Größe.'},
'app.chooseView':{en:'Choose view',de:'Ansicht wählen'},
'app.chooseMonth':{en:'Choose month',de:'Monat wählen'},

/* ── Ansichtsnamen ────────────────────────────────────────── */
/* „Flexible Payments" ist der Name des Bereichs, der früher
   Kakeibo hieß. Er bleibt in beiden Sprachen gleich — wie
   „Fast Budget" auch. Die internen Schlüssel (kak, kakCats,
   flexActual, ui.view='kakeibo') behalten ihre alten Namen. */
'view.monat':{en:'Month',de:'Monat'},
'view.jahr':{en:'Year',de:'Jahr'},
/* Der Reiter heißt anders als die Geldart: er zeigt die
   Auswertung der importierten Buchungen und gibt es nur mit
   Import. Wo die Geldart gemeint ist — die drei Blöcke, eine
   Kategorie —, steht g.flex. */
'view.kakeibo':{en:'Flexible Payment Details',de:'Flexible Payment Details'},
'view.prognose':{en:'Forecast',de:'Prognose'},

/* ── Allgemeine Wörter ────────────────────────────────────── */
'g.cancel':{en:'Cancel',de:'Abbrechen'},
'g.save':{en:'Save',de:'Speichern'},
'g.close':{en:'Close',de:'Schließen'},
'g.next':{en:'Next',de:'Weiter'},
'g.remove':{en:'Remove',de:'Entfernen'},
'g.month':{en:'Month',de:'Monat'},
'g.category':{en:'Category',de:'Kategorie'},
'g.position':{en:'Item',de:'Position'},
'g.total':{en:'Total',de:'Gesamt'},
'g.amount':{en:'Amount',de:'Betrag'},
'g.income':{en:'Income',de:'Einnahmen'},
'g.fixed':{en:'Regular costs',de:'Regelmäßige Kosten'},
/* Die Geldart, nicht der Reiter — siehe view.kakeibo. */
'g.flex':{en:'Flexible Payments',de:'Flexible Payments'},
'g.estimated':{en:'estimated',de:'geschätzt'},
'g.all':{en:'All',de:'Alle'},
'g.none':{en:'None',de:'Keinen'},
'g.bookings':{en:'bookings',de:'Buchungen'},
'g.booking':{en:'booking',de:'Buchung'},
'g.transactions':{en:'transactions',de:'Transaktionen'},
'g.wholeYear':{en:'Whole year',de:'Ganzes Jahr'},
/* Das Suchfeld gibt es in Monats- und Jahresansicht; der Text
   gehört deshalb zu den allgemeinen Wörtern. */
'g.filter':{en:'Filter…',de:'Filtern…'},
'g.filterTip':{en:'Filters the list while you type — name, amount, bank, payment type, category or note. Part of a word or of a figure is enough.',
  de:'Filtert die Liste beim Tippen — Name, Betrag, Bank, Zahlungsart, Kategorie oder Notiz. Ein Wortteil oder ein Stück der Zahl genügt.'},

/* ── Notizfenster ─────────────────────────────────────────── */
'note.title':{en:'Note — {0}',de:'Notiz — {0}'},
'note.whole':{en:'whole item',de:'ganze Position'},
'note.allMonths':{en:' — applies to every month',de:' — gilt für alle Monate'},
'note.text':{en:'Text',de:'Text'},
'note.ph':{en:'e.g. check the invoice',de:'z. B. Rechnung noch prüfen'},
'note.del':{en:'Delete note',de:'Notiz löschen'},
'note.add':{en:'Add note',de:'Notiz hinzufügen'},
'note.addPos':{en:'Add note for this item',de:'Notiz zur Position hinzufügen'},
'note.is':{en:'Note: {0}',de:'Notiz: {0}'},
'note.isPos':{en:'Item note: {0}',de:'Notiz zur Position: {0}'},
'note.gone':{en:'This item no longer exists.',de:'Diese Position gibt es nicht mehr.'},

/* ── Laden und Speichern ──────────────────────────────────── */
'store.none':{en:'no file loaded',de:'keine Datei geladen'},
'store.unsaved':{en:' — unsaved changes',de:' — ungespeicherte Änderungen'},
'store.pathTip':{en:'For security reasons browsers reveal only the file name, not the full path.',
  de:'Browser geben aus Sicherheitsgründen nur den Dateinamen preis, nicht den vollständigen Pfad.'},
'store.noFileTip':{en:'No file loaded yet',de:'Noch keine Datei geladen'},
'store.loadedFrom':{en:'Loaded from <b>{0}</b>. ',de:'Geladen aus <b>{0}</b>. '},
'store.noFile':{en:'No file loaded. ',de:'Es ist keine Datei geladen. '},
'store.dirty':{en:'<b>Changes are not saved yet</b> — click “Save data”.',
  de:'<b>Änderungen sind noch nicht gespeichert</b> — auf „Daten speichern" klicken.'},
'store.clean':{en:'All changes saved.',de:'Alle Änderungen gespeichert.'},
'store.lastImport':{en:'Last CSV import: {0}.',de:'Letzter CSV-Import: {0}.'},
'store.never':{en:'none yet',de:'noch keiner'},
'store.loaded':{en:'{0} loaded.',de:'{0} geladen.'},
'store.saved':{en:'Saved to {0}.',de:'In {0} gespeichert.'},
'store.downloaded':{en:'File downloaded.',de:'Datei heruntergeladen.'},
'store.empty':{en:'The file is empty.',de:'Die Datei ist leer.'},
'store.loadFail':{en:'Loading failed: {0}',de:'Laden fehlgeschlagen: {0}'},
'store.saveFail':{en:'Saving failed: {0}',de:'Speichern fehlgeschlagen: {0}'},
'store.unlinkAsk':{en:'There are unsaved changes. Close the file and clear the view anyway?',
  de:'Es gibt ungespeicherte Änderungen. Trotzdem trennen und die Ansicht leeren?'},
'store.unlinked':{en:'File closed. Use “Load data” to open one.',de:'Verbindung getrennt. Über „Daten hochladen" kannst du eine Datei öffnen.'},
'store.readFail':{en:'The file could not be read.',de:'Datei konnte nicht gelesen werden.'},
'store.fileKind':{en:'FINA data',de:'FINA Daten'},

/* ── Jahresansicht ────────────────────────────────────────── */
'year.legend':{en:'<span class="mk-ok">&#10003;</span> paid &nbsp; <span class="mk-q">?</span> estimated &nbsp; empty = open',
  de:'<span class="mk-ok">&#10003;</span> bezahlt &nbsp; <span class="mk-q">?</span> geschätzt &nbsp; leer = offen'},
'year.hideDone':{en:'Hide completed months',de:'Erledigte Monate ausblenden'},
'year.hideDoneTip':{en:'Fold away every month in which nothing is left open. The total column still counts all twelve.',
  de:'Klappt jeden Monat weg, in dem nichts mehr offen ist. Die Gesamtspalte zählt weiter alle zwölf.'},
/* Die drei Anlege-Knöpfe. Sie benennen, was entsteht, nicht die
   Technik dahinter — „Position" sagt niemandem, in welchem Block
   sie landet. */
'year.addItem':{en:'Add new regular cost',de:'Neue regelmäßige Kosten hinzufügen'},
'year.addKak':{en:'Add new flexible cost',de:'Neue flexible Kosten hinzufügen'},
'year.addIncome':{en:'Add new income',de:'Neue Einnahme hinzufügen'},
'year.hideSettled':{en:'Hide finished items',de:'Abgeschlossene ausblenden'},
'year.hideSettledTip':{en:'Hide every item that is fully paid for this year. The sums stay as they are.',
  de:'Blendet jede Position aus, die für dieses Jahr abbezahlt ist. Die Summen bleiben, wie sie sind.'},
'year.balanceRow':{en:'Balance per month',de:'Saldo je Monat'},
/* Die Blockzeile der Jahresmatrix ist zweizeilig: oben der
   Name, darunter klein, woher die Zahlen kommen können. */
'year.kakRow':{en:'Flexible Payments',de:'Flexible Payments'},
'year.kakRowSub':{en:'Works with the Fast Budget app — bookings can be imported as CSV',
  de:'Zusammen mit der App Fast Budget — Buchungen lassen sich als CSV importieren'},
'year.end':{en:'LP',de:'LP'},
'year.endTip':{en:'Last payment — month.year. The colour shows the remaining term including the current month: green only this one, blue two to three, yellow four to six, red seven and more.',
  de:'Letzte Zahlung — Monat.Jahr. Die Farbe zeigt die Restlaufzeit mit dem laufenden Monat: grün noch dieser eine, blau zwei bis drei, gelb vier bis sechs, rot sieben und mehr.'},
'year.bankTip':{en:'Edit banks',de:'Banken bearbeiten'},
'year.payTip':{en:'Edit payment types',de:'Zahlungsarten bearbeiten'},
'year.dueTip':{en:'Due date: A = start of month, M = mid month, E = end of month, otherwise the day',
  de:'Fälligkeit: A = Monatsanfang, M = Monatsmitte, E = Monatsende, sonst Tag'},
'year.monthTip':{en:'Go to {0}',de:'Zum Monat {0}'},
'year.monthDone':{en:'Everything recorded and paid — ',de:'Alles erfasst und bezahlt — '},
'year.editTip':{en:'Edit item',de:'Position ändern'},
'year.linkTip':{en:'Open receipt or contract',de:'Beleg oder Vertrag öffnen'},
'year.hint':{en:'The pencil — or a double-click on any amount — opens the item · clicking a month jumps to the month view · B (bank) and PT (payment type) open the lists · DD (due date) is A/M/E or the day, LP the last payment.',
  de:'Stift oder Doppelklick auf einen Betrag öffnet die Position · Klick auf einen Monat springt in die Monatsansicht · Klick auf B (bank) oder PT (payment type) öffnet die Listen · DD (due date) ist A/M/E oder der Tag, LP die letzte Zahlung.'},
/* Kein Monatsname in der Regel selbst — welcher Monat gerade
   läuft, sagt weiter unten „year.current". */
'year.hintTerm':{en:'The LP cell shows the remaining term including the current month:',
  de:'Die Zelle LP zeigt die Restlaufzeit einschließlich des laufenden Monats:'},
'year.keyNow':{en:'this one only',de:'nur noch dieser'},
'year.key2':{en:'2 to 3 months',de:'2 bis 3 Monate'},
'year.key36':{en:'4 to 6',de:'4 bis 6'},
'year.keyMore':{en:'more',de:'mehr'},
'year.hintGrey':{en:'Rows on grey are fully paid — nothing is left for this year.',
  de:'Grau hinterlegte Zeilen sind abbezahlt — dort steht im Jahr nichts mehr aus.'},
'year.hintHidden':{en:'{0} fully completed month(s) are hidden — the total column still counts all twelve.',
  de:'{0} vollständig abgehakte Monate sind ausgeblendet — die Gesamtspalte rechnet trotzdem mit allen zwölf.'},
'year.hintStrike':{en:'A struck-through month is fully ticked off.',de:'Ein durchgestrichener Monat ist vollständig abgehakt.'},
'year.current':{en:'Current month: {0}.',de:'Laufender Monat: {0}.'},

/* ── Monatsansicht ────────────────────────────────────────── */
'month.income':{en:'Income — {0}',de:'Einnahmen — {0}'},
'month.kak':{en:'Flexible Payments — {0}',de:'Flexible Payments — {0}'},
'month.fixed':{en:'Regular costs — {0}',de:'Regelmäßige Kosten — {0}'},
'month.kpiIncome':{en:'Income',de:'Einnahmen'},
'month.kpiKak':{en:'Flexible {0}',de:'Flexible {0}'},
'month.kpiActual':{en:'actual',de:'Ist'},
'month.kpiPlanned':{en:'planned',de:'geplant'},
'month.kpiFixed':{en:'Regular costs',de:'Regelmäßige Kosten'},
'month.kpiOpen':{en:'Still open',de:'Noch offen'},
'month.kpiOpenN':{en:'{0} of {1} items{2}',de:'{0} von {1} Posten{2}'},
'month.kpiUnclear':{en:' · {0} estimated',de:' · {0} geschätzt'},
'month.kpiBalance':{en:'Balance',de:'Saldo'},
'month.noIncome':{en:'No income recorded.',de:'Keine Einnahmen hinterlegt.'},
'month.noKak':{en:'No Flexible Payments categories yet — add them under Settings.',
  de:'Noch keine Flexible-Payments-Kategorien angelegt — anzulegen unter Einstellungen.'},
'month.noItems':{en:'No items for this filter.',de:'Keine Posten für diesen Filter.'},
'month.openEval':{en:'Open analysis',de:'Auswertung öffnen'},
'month.openEvalTip':{en:'Go to the Flexible Payments analysis for {0}',de:'Zur Flexible-Payments-Auswertung für {0}'},
/* Die Filterzeile. Jeder Knopf erklärt sich beim Überfahren
   selbst — die vier Wörter darauf können es nicht. */
'month.fAll':{en:'Any state',de:'Jeder Stand'},
'month.fAllTip':{en:'Every item, whatever its state',de:'Alle Posten, gleich in welchem Stand'},
'month.fOpen':{en:'Open',de:'Offen'},
'month.fOpenTip':{en:'Only what is not ticked off yet',de:'Nur was noch nicht abgehakt ist'},
'month.fEst':{en:'Estimated',de:'Geschätzt'},
'month.fEstTip':{en:'Only items whose amount is marked as an estimate',
  de:'Nur Posten, deren Betrag als geschätzt gekennzeichnet ist'},
'month.fPaid':{en:'Settled',de:'Bezahlt'},
'month.fPaidTip':{en:'Only what is already ticked off',de:'Nur was schon abgehakt ist'},
'month.fDueAll':{en:'All due dates',de:'Alle Fälligkeiten'},
'month.fDueAllTip':{en:'Every due date — start, middle and end of the month',
  de:'Jede Fälligkeit — Anfang, Mitte und Ende des Monats'},
'month.fDueA':{en:'Start of month',de:'Monatsanfang'},
'month.fDueM':{en:'Mid month',de:'Monatsmitte'},
'month.fDueE':{en:'End of month',de:'Monatsende'},
'month.fDueATip':{en:'Due date A or payday 1–10',de:'Fälligkeit A oder Zahltag 1. bis 10.'},
'month.fDueMTip':{en:'Due date M or payday 11–20',de:'Fälligkeit M oder Zahltag 11. bis 20.'},
'month.fDueETip':{en:'Due date E or payday 21 onwards',de:'Fälligkeit E oder Zahltag ab dem 21.'},
'month.markPaid':{en:'mark as paid',de:'als bezahlt markieren'},
'month.markOpen':{en:'mark as open',de:'als offen markieren'},
'month.markDone':{en:'mark as recorded',de:'als erfasst markieren'},
'month.imported':{en:'imported from Fast Budget',de:'aus Fast Budget importiert'},
'month.lastRate':{en:'last instalment',de:'letzte Rate'},
'month.hidden':{en:'({0} hidden)',de:'({0} ausgeblendet)'},
'month.legTitle':{en:'The marks — in every section',de:'Die Zeichen — in jedem Bereich'},
'month.legOpen':{en:'unpaid',de:'unbezahlt'},
'month.legPaid':{en:'paid',de:'bezahlt'},
'month.legEst':{en:'amount estimated',de:'Betrag geschätzt'},
'month.editKak':{en:'Edit Flexible Payments category',de:'Flexible-Payments-Kategorie ändern'},
'month.done':{en:'{0} of {1} items done',de:'{0} von {1} Positionen erledigt'},
'month.receipt':{en:'Receipt',de:'Beleg'},
'month.receiptTip':{en:'Open receipt',de:'Beleg öffnen'},

/* ── Saldokorrektur ───────────────────────────────────────────
   Eine einzige, feste Zeile über den Einnahmen. Sie wird wie ein
   regelmäßiger Posten gepflegt, aber wie eine Kategorie gezeigt
   und lässt sich nicht löschen. */
'bal.row':{en:'Balance Correction',de:'Balance Correction'},
'bal.tip':{en:'Manual correction of the balance — for inaccuracies that crept in somewhere over the months',
  de:'Manuelle Korrektur des Saldos — für Ungenauigkeiten, die sich über die Monate eingeschlichen haben'},
'bal.editTip':{en:'Edit balance correction',de:'Balance Correction ändern'},
'bal.hint':{en:'One amount per month, plus or minus. It is added to the balance and cannot be deleted.',
  de:'Ein Betrag je Monat, plus oder minus. Er geht in den Saldo ein und lässt sich nicht löschen.'},

/* ── Flexible Payments (früher Kakeibo) ───────────────────── */
'kak.empty':{en:'No transactions imported yet.',de:'Noch keine Transaktionen importiert.'},
'kak.emptyHint':{en:'Export your transactions from Fast Budget as CSV and load them here.',
  de:'Exportiere in Fast Budget deine Transaktionen als CSV und lade sie hier hoch.'},
'kak.importBtn':{en:'Import CSV from Fast Budget',de:'CSV aus Fast Budget importieren'},
'kak.import':{en:'Import CSV',de:'CSV importieren'},
/* Die Spalte „Art": woher der Wert einer Zeile stammt. Die
   Reihenfolge der Prüfung steht in flexKind() (js/calc.js) und ist
   dieselbe wie beim Rechnen — Korrektur schlägt Import, Import
   schlägt Haken, Haken schlägt eingetippten Betrag. */
'kak.colKind':{en:'Kind',de:'Art'},
'kak.kImp':{en:'imported',de:'importiert'},
'kak.kCorr':{en:'corrected',de:'korrigiert'},
'kak.kDone':{en:'closed',de:'abgeschlossen'},
'kak.kFix':{en:'fixed',de:'fest'},
'kak.kEst':{en:'estimated',de:'geschätzt'},
'kak.kindHint':{en:'<b>Kind</b> says where the figure beside it comes from: <b>imported</b> from Fast Budget · <b>corrected</b> — an imported month you overwrote by hand · <b>closed</b> — no import, but you ticked the month off · <b>fixed</b> — an amount you typed that is not marked as an estimate, so it counts as settled · <b>estimated</b> — still open and expected to change. Over the whole year the column counts the months per kind; months without an amount are not counted.',
  de:'<b>Art</b> sagt, woher die Zahl daneben stammt: <b>importiert</b> aus Fast Budget · <b>korrigiert</b> — ein importierter Monat, den du von Hand überschrieben hast · <b>abgeschlossen</b> — kein Import, aber du hast den Monat abgehakt · <b>fest</b> — ein eingetippter Betrag, der nicht als Schätzung markiert ist und deshalb als erfasst gilt · <b>geschätzt</b> — noch offen und voraussichtlich anders. Über das ganze Jahr zählt die Spalte die Monate je Art; Monate ohne Betrag zählen nicht mit.'},
'kak.period':{en:'Period',de:'Zeitraum'},
'kak.prev':{en:'‹ Previous month',de:'‹ Vormonat'},
'kak.prevTip':{en:'One month back',de:'Einen Monat zurück'},
'kak.next':{en:'Next month ›',de:'Folgemonat ›'},
'kak.nextTip':{en:'One month forward',de:'Einen Monat weiter'},
'kak.yearTip':{en:'All twelve months together',de:'Alle zwölf Monate zusammen'},
'kak.mainOnly':{en:'Main categories only',de:'Nur Hauptkategorien'},
'kak.withSubs':{en:'With subcategories',de:'Mit Unterkategorien'},
'kak.subsNeedImport':{en:'Subcategories come from the Fast Budget import — without imported bookings there are none.',
  de:'Unterkategorien kommen aus dem Fast-Budget-Import — ohne importierte Buchungen gibt es keine.'},
'kak.byCat':{en:'Spending by category — {0}',de:'Ausgaben nach Kategorie — {0}'},
'kak.top':{en:'Largest single items',de:'Größte Einzelposten'},
'kak.topSub':{en:'{0} · {1} bookings from {2}',de:'{0} · {1} Buchungen ab {2}'},
'kak.topNone':{en:'No booking reaches {0} in this period.',de:'Keine Buchung erreicht in diesem Zeitraum {0}.'},
'kak.arrowTip':{en:'Show the bookings of “{0}” on the right',de:'Buchungen von „{0}" rechts zeigen'},
'kak.rowHint':{en:'The arrow on a row shows all its bookings on the right.',
  de:'Der Pfeil an einer Zeile zeigt rechts alle Buchungen dazu.'},
'kak.valHint':{en:'The amount of a category is its imported value where one exists, otherwise your correction or the amount you entered by hand — so every category appears, imported or not. Subcategories only come from the import.',
  de:'Der Betrag einer Kategorie ist der importierte Wert, wo es einen gibt, sonst deine Korrektur oder der von Hand eingetragene Betrag — so steht jede Kategorie hier, importiert oder nicht. Unterkategorien kennt nur der Import.'},
'kak.manualSub':{en:'entered by hand / planned',de:'von Hand erfasst / geplant'},
/* Woher die Zahlen des Zeitraums stammen — beim ganzen Jahr die
   Liste der importierten Monate, bei einem einzelnen die Antwort
   ja oder nein. */
'kak.impYear':{en:'Fast Budget data imported for: {0}. The remaining {1} month(s) show the amounts you entered yourself.',
  de:'Fast-Budget-Daten importiert für: {0}. Die übrigen {1} Monate zeigen die Betr\u00e4ge, die du selbst eingetragen hast.'},
'kak.impYearNone':{en:'No month has Fast Budget data — every figure below is one you entered yourself.',
  de:'Kein Monat hat Fast-Budget-Daten — jede Zahl unten stammt aus deiner eigenen Eingabe.'},
'kak.impMonth':{en:'{0} has imported data ({1}) — the figures below are the real ones.',
  de:'F\u00fcr {0} liegen importierte Daten vor ({1}) — die Zahlen unten sind die echten.'},
'kak.impMonthNone':{en:'{0} has no imported data — the figures below are the ones you entered yourself.',
  de:'F\u00fcr {0} liegen keine importierten Daten vor — die Zahlen unten stammen aus deiner eigenen Eingabe.'},
'kak.pickSub':{en:'{0}{1} · {2} bookings · {3}',de:'{0}{1} · {2} Buchungen · {3}'},
'kak.pickNone':{en:'No bookings in this period.',de:'Keine Buchungen in diesem Zeitraum.'},
/* „(ohne Hauptkategorie)" und „(ohne Kategorie)" bleiben als
   Schlüssel in kakCats, kak, flexActual und tx[].main stehen —
   ein übersetzter Schlüssel würde die Zeilen von ihren Daten
   trennen. Angezeigt werden sie über keyLabel() auf Englisch. */
'kak.orphan':{en:' · {0} without a maintained category hidden',de:' · {0} ohne gepflegte Kategorie ausgeblendet'},

/* ── Prognose ─────────────────────────────────────────────── */
'prog.title':{en:'Projection {0}',de:'Hochrechnung {0}'},
'prog.kpiIncome':{en:'Income expected from {0}',de:'Einnahmen erwartet ab {0}'},
'prog.kpiFixed':{en:'Regular costs from {0}',de:'Regelmäßige Kosten ab {0}'},
'prog.kpiOpen':{en:'{0} of it still open',de:'davon {0} noch offen'},
'prog.kpiKak':{en:'Flexible Payments expected from {0}',de:'Flexible Payments erwartet ab {0}'},
'prog.kpiPerMonth':{en:'{0} per month assumed',de:'{0} je Monat angenommen'},
'prog.kpiSoFar':{en:'Balance so far',de:'Saldo bisher'},
'prog.kpiSoFarSub':{en:'January to {0}',de:'Januar bis {0}'},
'prog.kpiSoFarNone':{en:'no month closed yet',de:'noch kein abgerechneter Monat'},
'prog.kpiEnd':{en:'Balance at year end',de:'Saldo zum Jahresende'},
'prog.kpiEndSub':{en:'all twelve months of {0}',de:'alle zwölf Monate {0}'},
'prog.colIncome':{en:'Income',de:'Einnahmen'},
'prog.colFixed':{en:'Regular',de:'Regelmäßig'},
'prog.colKak':{en:'Flexible',de:'Flexible'},
'prog.colBal':{en:'Balance corr.',de:'Balance corr.'},
'prog.colBalance':{en:'Balance',de:'Saldo'},
'prog.colCum':{en:'Cumulative',de:'Kumuliert'},
'prog.actual':{en:'actual',de:'Ist'},
'prog.plan':{en:'plan',de:'Plan'},
'prog.greyed':{en:'Months before {0} are greyed out. The cumulation runs over the whole year, so the last row is the year-end balance.',
  de:'Ausgegraut sind die Monate vor {0}. Die Kumulation läuft über das ganze Jahr — die letzte Zeile ist der Saldo zum Jahresende.'},
'prog.card':{en:'Flexible Payments assumption per month',de:'Flexible-Payments-Annahme je Monat'},
'prog.cardHint':{en:'For months without a Fast Budget import the app does not know the real Flexible Payments spending. These values tell it what to expect per category. Actual figures exist for: {0}.',
  de:'Für Monate ohne Fast-Budget-Import kennt die App die tatsächlichen Flexible-Payments-Ausgaben nicht. Diese Werte sagen ihr, mit wie viel sie pro Kategorie rechnen soll. Ist-Zahlen liegen vor für: {0}.'},
'prog.noMonth':{en:'no month yet',de:'noch keinen Monat'},
'prog.colCurrent':{en:'Current assumption',de:'Aktuelle Annahme'},
'prog.colAvg':{en:'Ø per month',de:'Ø je Monat'},
'prog.colAvgTip':{en:'Average over every month of this year so far whose value is settled — imported, corrected, ticked off or entered as a fixed amount.',
  de:'Durchschnitt \u00fcber alle bisherigen Monate dieses Jahres mit feststehendem Wert — importiert, korrigiert, abgehakt oder als fester Betrag eingetragen.'},
'prog.avgFrom':{en:'The Ø is calculated over all {0} month(s) so far whose values are settled: {1}. Months that only carry an estimate are left out.',
  de:'Der Ø wird \u00fcber alle bisherigen {0} Monate mit feststehenden Werten gerechnet: {1}. Monate, in denen nur eine Sch\u00e4tzung steht, bleiben au\u00dfen vor.'},
'prog.avgFromNone':{en:'No month has settled values yet, so there is no Ø to show. Import a month or tick one off.',
  de:'Noch kein Monat hat feststehende Werte, deshalb gibt es keinen Ø. Importiere einen Monat oder hake einen ab.'},
'prog.avgOfN':{en:'calculated over {0} month(s)',de:'\u00fcber {0} Monate gerechnet'},
'prog.noCats':{en:'No Flexible Payments categories yet.',de:'Noch keine Flexible-Payments-Kategorien angelegt.'},
/* Die Annahme wird hier nur noch gezeigt, nicht getippt: geändert
   wird sie im Fenster der Kategorie oder in einem Zug über den
   Knopf darunter. */
'prog.colCurrentTip':{en:'What the projection calculates with in the current month. Change it in the category window (pencil or double-click) or with the button below.',
  de:'Womit die Hochrechnung im laufenden Monat rechnet. Ändern lässt es sich im Fenster der Kategorie (Stift oder Doppelklick) oder mit dem Knopf darunter.'},
/* Statt eines Knopfes eine Erklärung unter der Tabelle: beide
   Spalten sind gerechnet, und wer sie liest, soll wissen, woher
   sie kommen. Übernommen wird von hier aus nichts. */
'prog.howCurrent':{en:'the amount this category plans for {0}. The projection uses each month its own planned amount — for months with a Fast Budget import it uses the imported figure instead, and a correction beats both.',
  de:'der Betrag, den diese Kategorie für {0} vorsieht. Die Hochrechnung nimmt je Monat dessen eigenen Planwert — in Monaten mit Fast-Budget-Import stattdessen den importierten, und eine Korrektur schlägt beides.'},
'prog.howAvg':{en:'the average of this category over every month of this year whose value is settled: imported, corrected, ticked off, or entered as a fixed amount. A month that only carries an estimate is left out, otherwise the average would be averaging its own guess. Without a settled month there is no average, and a dash stands there.',
  de:'der Durchschnitt dieser Kategorie über jeden Monat dieses Jahres, dessen Wert feststeht: importiert, korrigiert, abgehakt oder als fester Betrag eingetragen. Ein Monat, in dem nur eine Schätzung steht, bleibt außen vor — sonst mittelte der Durchschnitt seine eigene Vermutung. Ohne feststehenden Monat gibt es keinen Durchschnitt, dann steht dort ein Strich.'},

/* ── Posten-Fenster ───────────────────────────────────────── */
'item.add':{en:'Add item',de:'Posten hinzufügen'},
'item.lockedN':{en:'{0} month(s) marked as paid. Remove the tick to change an amount.',
  de:'{0} Monate sind als bezahlt markiert. Haken entfernen, um den Betrag zu ändern.'},
'item.allOpen':{en:'All months can be changed.',de:'Alle Monate sind änderbar.'},
'item.name':{en:'Name',de:'Name'},
'item.namePh':{en:'e.g. Netflix',de:'z. B. Netflix'},
'item.block':{en:'Block',de:'Block'},
/* Ein neuer Posten kommt ohne Block — er wird gewählt, nicht
   vorgegeben. Gespeichert wird erst mit. */
'item.blockPick':{en:'— please choose —',de:'— bitte wählen —'},
'item.needName':{en:'Please give the item a name.',de:'Bitte gib der Position einen Namen.'},
'item.needBlock':{en:'Please choose a block. Every item belongs to one — new blocks are created under Settings.',
  de:'Bitte wähle einen Block. Jede Position gehört in einen — neue Blöcke legst du in den Einstellungen an.'},
'item.bank':{en:'Bank (B)',de:'Bank (B)'},
'item.pay':{en:'Payment type (PT)',de:'Zahlungsart (PT)'},
'item.due':{en:'Due date (DD)',de:'Fälligkeit (DD)'},
'item.endM':{en:'Last payment (LP) — month',de:'Letzte Zahlung (LP) — Monat'},
'item.endY':{en:'Last payment (LP) — year',de:'Letzte Zahlung (LP) — Jahr'},
'item.url':{en:'Link to receipt or contract',de:'Link zu Beleg oder Vertrag'},
'item.urlOpen':{en:'Open',de:'\u00d6ffnen'},
'item.urlOpenTip':{en:'Open this link in a new tab — the typed address counts, saving is not needed first',
  de:'Diesen Link in einem neuen Tab \u00f6ffnen — es gilt die getippte Adresse, gespeichert werden muss vorher nicht'},
'item.kind':{en:'Kind of amount',de:'Betragsart'},
'item.est':{en:'Amount is estimated and may differ — shown in yellow with a question mark',
  de:'Summe ist geschätzt und kann abweichen — wird gelb mit Fragezeichen dargestellt'},
'item.lists':{en:'Edit banks, payment types & categories',de:'Banken, Zahlungsarten &amp; Kategorien bearbeiten'},
'item.quick':{en:'Quick entry',de:'Schnelle Eingabe'},
'item.rhythm':{en:'Repetition',de:'Wiederholung'},
'item.fromMonth':{en:'from {0}',de:'ab {0}'},
'item.apply':{en:'Apply',de:'Übernehmen'},
'item.clear':{en:'Clear open months',de:'Offene Monate leeren'},
/* Zwei Ziele für die Schnelleingabe, wenn der Posten noch in
   diesem Jahr ausläuft. Beide Knöpfe tun etwas — deshalb tragen
   sie den Namen ihrer Handlung, nicht „OK" und „Abbrechen". */
'item.rangeTitle':{en:'How far should it be filled?',de:'Wie weit soll gef\u00fcllt werden?'},
'item.rangeSub':{en:'This item ends in {0}. The quick entry can stop there — or run on to {1}, for instance because the contract renews and you already know what it will cost.',
  de:'Dieser Posten l\u00e4uft im {0} aus. Die Schnelleingabe kann dort aufh\u00f6ren — oder bis {1} weiterlaufen, etwa weil sich der Vertrag verl\u00e4ngert und du schon wei\u00dft, was er dann kostet.'},
'item.rangeEnd':{en:'Fill up to {0}',de:'Bis {0} f\u00fcllen'},
'item.rangeYear':{en:'Fill up to {0}',de:'Bis {0} f\u00fcllen'},
'item.quickHint':{en:'Fills from the chosen month to December — or to the end you set. Paid months stay untouched.',
  de:'Füllt vom gewählten Monat bis Dezember — oder bis zum gesetzten Ende. Bezahlte Monate bleiben unangetastet.'},
'item.perMonth':{en:'Amount per month — expenses with a minus',de:'Betrag je Monat — Ausgaben mit Minus'},
'item.del':{en:'Delete item',de:'Posten löschen'},
'item.delAsk':{en:'Delete “{0}”? Its twelve amounts, ticks and notes go with it. This can only be undone from a saved file.',
  de:'\u201e{0}\u201c l\u00f6schen? Die zw\u00f6lf Betr\u00e4ge, Haken und Notizen gehen mit. Das l\u00e4sst sich nur \u00fcber eine gespeicherte Datei r\u00fcckg\u00e4ngig machen.'},
'item.deleted':{en:'“{0}” deleted.',de:'\u201e{0}\u201c gel\u00f6scht.'},
'item.setN':{en:'{0} month(s) set',de:'{0} Monate gesetzt'},
'item.cleared':{en:', {0} in between cleared',de:', {0} dazwischen geleert'},
'item.lockedTip':{en:'paid — remove the tick to change the amount',de:'bezahlt — Haken entfernen, um den Betrag zu ändern'},
'item.lockTill':{en:'Close all months up to {0}',de:'Alle Monate bis {0} abschließen'},
'item.lockTillTip':{en:'Ticks off every month up to and including {0} that carries an amount — everything that is over. The current month stays open, and so do empty months.',
  de:'Hakt jeden Monat bis einschließlich {0} ab, in dem ein Betrag steht — alles, was vorbei ist. Der laufende Monat bleibt offen, leere Monate ebenso.'},
'item.unlockAll':{en:'Reopen all closed months',de:'Alle abgeschlossenen Monate wieder öffnen'},
'item.unlockAllTip':{en:'Removes every tick so all amounts can be changed again',
  de:'Entfernt alle Haken, damit sich alle Beträge wieder ändern lassen'},
'item.lockedNow':{en:'{0} month(s) closed — “Save” keeps it.',de:'{0} Monate abgeschlossen — mit „Speichern" übernehmen.'},
'item.unlockedNow':{en:'{0} month(s) reopened — “Save” keeps it.',de:'{0} Monate wieder geöffnet — mit „Speichern" übernehmen.'},
/* Duplizieren — derselbe Knopf im Posten- und im Beträge-Fenster,
   deshalb steht die Beschriftung nur einmal hier. Der Zusatz
   item.copy hängt sich an den Namen der Kopie. */
'item.dup':{en:'Duplicate',de:'Duplizieren'},
'item.copy':{en:'(copy)',de:'(Kopie)'},
'item.dupTip':{en:'Opens a copy of this item — amounts included, ticks and notes removed. The copy is created when you press Save; this item stays as it is.',
  de:'Öffnet eine Kopie dieses Postens — mit den Beträgen, ohne Haken und ohne Notizen. Angelegt wird die Kopie erst mit „Speichern"; dieser Posten bleibt, wie er ist.'},
'item.dupTitle':{en:'Duplicate item',de:'Posten duplizieren'},
'item.dupSub':{en:'A copy of “{0}”. All ticks and notes have been removed, so every one of the twelve months can be changed. Nothing is created until you press Save — Cancel leaves no trace, and “{0}” itself stays untouched either way.',
  de:'Eine Kopie von „{0}". Alle Haken und Notizen sind entfernt, deshalb ist jeder der zwölf Monate änderbar. Angelegt wird erst mit „Speichern" — wer abbricht, hinterlässt nichts, und „{0}" selbst bleibt in beiden Fällen unangetastet.'},

/* ── Beträge einer Flexible-Payments-Kategorie ────────────── */
'kdlg.lockedN':{en:'{0} month(s) are marked IMPORTED — those values come from Fast Budget. Changing one turns it into CORRECTED.',
  de:'{0} Monate sind mit IMPORTED markiert — die Werte stammen aus Fast Budget. Änderst du einen davon, wird er zu CORRECTED.'},
'kdlg.allOpen':{en:'All months can be changed.',de:'Alle Monate sind änderbar.'},
'kdlg.hint':{en:'Remove the tick to change an amount. Flexible Payments categories always run monthly.',
  de:'Haken entfernen, um einen Betrag zu ändern. Flexible-Payments-Kategorien laufen immer monatlich.'},
'kdlg.est':{en:'Amount is estimated and may differ — shown in yellow with a question mark',
  de:'Summe ist geschätzt und kann abweichen — wird orange mit Fragezeichen dargestellt'},
'kdlg.quick':{en:'Quick entry — every month',de:'Schnelle Eingabe — jeden Monat'},
'kdlg.perMonth':{en:'Amount per month — expenses with a minus',de:'Betrag je Monat — Ausgaben mit Minus'},
'kdlg.gone':{en:'This Flexible Payments category no longer exists.',de:'Diese Flexible-Payments-Kategorie gibt es nicht mehr.'},
'kdlg.lockedTip':{en:'recorded — remove the tick to change the amount',de:'erfasst — Haken entfernen, um den Betrag zu ändern'},
'kdlg.lockTill':{en:'Close all months up to {0}',de:'Alle Monate bis {0} abschließen'},
'kdlg.lockTillTip':{en:'Marks every month up to and including {0} as recorded — everything that is over. The current month stays open, and imported months are left alone.',
  de:'Markiert jeden Monat bis einschließlich {0} als erfasst — alles, was vorbei ist. Der laufende Monat bleibt offen, importierte Monate bleiben unberührt.'},
'kdlg.unlockAllTip':{en:'Removes every tick you set yourself so those amounts can be changed again. Imported months are left alone.',
  de:'Entfernt alle selbst gesetzten Haken, damit sich diese Beträge wieder ändern lassen. Importierte Monate bleiben unberührt.'},
'kdlg.newSub':{en:'A main category of your everyday spending — groceries, leisure, travel. Give it a name and, if you like, its twelve amounts right away.',
  de:'Eine Hauptkategorie der allt\u00e4glichen Ausgaben — Lebensmittel, Freizeit, Reisen. Gib ihr einen Namen und, wenn du magst, gleich ihre zw\u00f6lf Monatsbetr\u00e4ge.'},
'kdlg.namePh':{en:'e.g. Groceries',de:'z. B. Lebensmittel'},
'kdlg.dupTip':{en:'Opens a copy of this category — amounts included, ticks and notes removed. The copy is created when you press Save; this category stays as it is.',
  de:'Öffnet eine Kopie dieser Kategorie — mit den Beträgen, ohne Haken und ohne Notizen. Angelegt wird die Kopie erst mit „Speichern"; diese Kategorie bleibt, wie sie ist.'},
'kdlg.dupTitle':{en:'Duplicate category',de:'Kategorie duplizieren'},
'kdlg.dupSub':{en:'A copy of “{0}”. All ticks and notes have been removed, so every one of the twelve months can be changed — imported values come along as plain planned ones, because a new category has no bookings. Give it a name of its own; it is created when you press Save.',
  de:'Eine Kopie von „{0}". Alle Haken und Notizen sind entfernt, deshalb ist jeder der zwölf Monate änderbar — importierte Werte kommen als gewöhnliche Planwerte mit, denn eine neue Kategorie hat keine Buchungen. Gib ihr einen eigenen Namen; angelegt wird sie erst mit „Speichern".'},
'kdlg.del':{en:'Delete category',de:'Kategorie l\u00f6schen'},
'kdlg.delAsk':{en:'Delete “{0}”? Plan values, actual values, corrections and notes of this category go with it. This can only be undone from a saved file.',
  de:'\u201e{0}\u201c l\u00f6schen? Plan- und Ist-Werte, Korrekturen und Notizen dieser Kategorie gehen mit. Das l\u00e4sst sich nur \u00fcber eine gespeicherte Datei r\u00fcckg\u00e4ngig machen.'},
'kdlg.delAskTx':{en:'{0} imported booking(s) are deleted as well.',de:'Dazu werden {0} importierte Buchungen gel\u00f6scht.'},
'kdlg.deleted':{en:'“{0}” deleted.',de:'\u201e{0}\u201c gel\u00f6scht.'},

/* ── Einstellungen ────────────────────────────────────────── */
'set.title':{en:'Settings',de:'Einstellungen'},
'set.sub':{en:'Everything here is stored in the JSON file: language, accounting year, column widths and the four lists. The file decides how the app looks when you load it.',
  de:'Alles hier steht in der JSON-Datei: Sprache, Abrechnungsjahr, Spaltenbreiten und die vier Listen. Beim Laden richtet sich die Anwendung nach der Datei.'},
/* Das Fenster ist in Bereiche geteilt: links das Menü, rechts
   der gewählte Bereich. Die Menüpunkte sind zugleich seine
   Überschrift. */
'set.navLabel':{en:'Settings sections',de:'Bereiche der Einstellungen'},
'set.navGeneral':{en:'General',de:'Allgemein'},
'set.navView':{en:'Appearance',de:'Darstellung'},
'set.navBanks':{en:'Banks & payment types',de:'Banken & Zahlungsarten'},
'set.generalSub':{en:'Language of the interface and the year this cash book is kept for. Both travel in the file — when you load it, the app follows the file.',
  de:'Sprache der Oberfläche und das Jahr, für das dieses Kassenbuch geführt wird. Beides steht in der Datei — beim Laden richtet sich die Anwendung nach ihr.'},
'set.viewSub':{en:'How wide the year matrix is drawn, and from which amount a booking counts as a large single item.',
  de:'Wie breit die Jahresmatrix gezeichnet wird, und ab welchem Betrag eine Buchung als großer Einzelposten gilt.'},
'set.banksSub':{en:'The code appears in the year overview in columns B and PT, the label below each item in the month view. Both lists are yours alone — name them the way you think of your accounts. Change a code later and FINA asks whether the items that carry it should be moved along.',
  de:'Das Kürzel steht in der Jahresübersicht in den Spalten B und PT, die Bezeichnung unter jedem Posten der Monatsansicht. Beide Listen gehören dir allein — benenne sie so, wie du an deine Konten denkst. Änderst du später ein Kürzel, fragt FINA, ob die Posten mit diesem Kürzel mitwandern sollen.'},
'set.groupsSub':{en:'These group the regular costs into blocks — “Living”, “Insurance”, “Car”, whatever suits you. “INCOME” is built in and always there. Renaming carries every item along; removing moves them into the first category left.',
  de:'Sie gliedern die regelmäßigen Kosten in Blöcke — „Wohnen", „Versicherungen", „Auto", ganz wie es passt. „INCOME" ist fest eingebaut und immer da. Beim Umbenennen wandern alle Posten mit; beim Entfernen ziehen sie in die erste verbleibende Kategorie um.'},
'set.kakSub':{en:'The categories of your everyday spending — one row each in the year overview and in the Flexible Payments view. Renaming carries plan values, actual values, corrections and imported bookings along. The order here is the order everywhere.',
  de:'Die Kategorien deiner alltäglichen Ausgaben — je eine Zeile in der Jahresübersicht und in der Flexible-Payments-Ansicht. Beim Umbenennen wandern Planwerte, Ist-Werte, Korrekturen und importierte Buchungen mit. Die Reihenfolge hier gilt überall.'},
'set.lang':{en:'Interface language',de:'Sprache der Oberfläche'},
'set.year':{en:'Accounting year',de:'Abrechnungsjahr'},
'set.yearHint':{en:'Only the labelling changes — the twelve months keep their amounts.',
  de:'Es ändert sich nur die Beschriftung — die zwölf Monate behalten ihre Beträge.'},
'set.labw':{en:'Item column',de:'Positionsspalte'},
'set.monw':{en:'Month columns',de:'Monatsspalten'},
'set.widthHint':{en:'Widths of the year matrix in pixels, 50 to 800.',de:'Breiten der Jahresmatrix in Pixel, 50 bis 800.'},
'set.topmin':{en:'Largest items from (€)',de:'Größte Einzelposten ab (€)'},
'set.topminHint':{en:'The Flexible Payments view lists every booking from this amount upwards; 0 shows them all.',
  de:'Die Flexible-Payments-Ansicht listet jede Buchung ab diesem Betrag; 0 zeigt alle.'},
'set.banks':{en:'Banks (B)',de:'Banken (B)'},
'set.pays':{en:'Payment types (PT)',de:'Zahlungsarten (PT)'},
'set.groups':{en:'Regular categories',de:'Regelmäßige Kategorien'},
'set.kak':{en:'Flexible Payments categories',de:'Flexible-Payments-Kategorien'},
'set.addBank':{en:'Add bank',de:'Bank hinzufügen'},
'set.addPay':{en:'Add payment type',de:'Zahlungsart hinzufügen'},
'set.addGroup':{en:'Add category',de:'Kategorie hinzufügen'},
'set.addKak':{en:'Add Flexible Payments category',de:'Flexible-Payments-Kategorie hinzufügen'},
'set.code':{en:'Code',de:'Kürzel'},
'set.label':{en:'Label',de:'Bezeichnung'},
'set.dragTip':{en:'Drag to sort',de:'Zum Sortieren ziehen'},
'set.inUse':{en:'{0} item(s) inside',de:'{0} Position(en) darin'},
'set.monthsWith':{en:'{0} month(s) with an amount',de:'{0} Monat(e) mit Betrag'},
/* Geändertes Kürzel einer Bank oder Zahlungsart: die Posten
   hängen daran und wandern nur mit, wenn der Nutzer es will. */
'set.codeAsk':{en:'You changed these codes: {0}. {1} item(s) in the file still carry the old code.\n\nOK — those items are moved to the new code.\nCancel — the old codes stay in the file. Those items then belong to no entry of the list any more: they keep showing the old code, and the item window marks it with a question mark.',
  de:'Du hast diese K\u00fcrzel ge\u00e4ndert: {0}. {1} Position(en) in der Datei tragen noch das alte K\u00fcrzel.\n\nOK — diese Positionen werden auf das neue K\u00fcrzel umgestellt.\nAbbrechen — die alten Werte bleiben in der Datei. Diese Positionen geh\u00f6ren dann zu keinem Eintrag der Liste mehr: sie zeigen weiter das alte K\u00fcrzel, und im Posten-Fenster steht ein Fragezeichen dahinter.'},
'set.codeDone':{en:'{0} item(s) moved to the new code.',de:'{0} Position(en) auf das neue K\u00fcrzel umgestellt.'},
'set.codeKept':{en:'The old codes stay in the file — {0} item(s) keep them.',
  de:'Die alten K\u00fcrzel bleiben in der Datei — {0} Position(en) behalten sie.'},
'set.taken':{en:'This name already exists: {0}',de:'Diesen Namen gibt es schon: {0}'},
'set.keepOne':{en:'At least one category must remain.',de:'Es muss mindestens eine Kategorie bleiben.'},
'set.moveAsk':{en:'“{0}” contains {1} item(s). They will be moved to “{2}”. Continue?',
  de:'„{0}" enthält {1} Position(en). Sie werden nach „{2}" verschoben. Fortfahren?'},
'set.dropKakAsk':{en:'Remove “{0}”? Plan and actual values, corrections and notes of this category will be deleted{1}. This can only be undone from a saved file.',
  de:'„{0}" entfernen? Plan- und Ist-Werte, Korrekturen und Notizen dieser Kategorie werden gelöscht{1}. Das lässt sich nur über eine gespeicherte Datei rückgängig machen.'},
'set.dropKakTx':{en:', together with {0} imported booking(s)',de:', dazu {0} importierte Buchungen'},
'set.saved':{en:'Settings saved.',de:'Einstellungen gespeichert.'},

/* ── CSV-Import ───────────────────────────────────────────── */
/* Das Fenster vor dem Fenster: woher die Datei kommt und welche
   Spalten darin stehen müssen. Es steht vor der Dateiauswahl —
   wer erst im Fehlerfall erfährt, dass eine Spalte fehlt, hat die
   Datei schon gesucht. Die Spaltennamen sind die des deutschen
   Fast-Budget-Exports und stehen genauso in parseFastBudget()
   (js/csv.js); wer sie dort ändert, ändert sie hier mit. */
'impInfo.title':{en:'Import Flexible Payments from Fast Budget',de:'Flexible Payments aus Fast Budget importieren'},
'impInfo.sub':{en:'FINA reads the CSV export of the <b>Fast Budget</b> app. It fills the Flexible Payments of this file — the everyday spending per category and month.',
  de:'FINA liest den CSV-Export der App <b>Fast Budget</b>. Er füllt die Flexible Payments dieser Datei — die alltäglichen Ausgaben je Kategorie und Monat.'},
'impInfo.needTitle':{en:'These columns must be in the file',de:'Diese Spalten müssen in der Datei stehen'},
'impInfo.need':{en:'The header row is found by the column <b>Hauptkategorie</b> — without it the file is refused. Export in German, the column names are read literally.',
  de:'Die Kopfzeile wird an der Spalte <b>Hauptkategorie</b> erkannt — ohne sie wird die Datei abgewiesen. Exportiere auf Deutsch, die Spaltennamen werden wörtlich gelesen.'},
'impInfo.colDate':{en:'the day, as 31.12.2026 — a row without a readable date is skipped',
  de:'der Tag, als 31.12.2026 — eine Zeile ohne lesbares Datum wird übergangen'},
'impInfo.colVal':{en:'the amount; “Wert” alone is also accepted. Expenses carry a minus.',
  de:'der Betrag; „Wert" allein wird auch genommen. Ausgaben tragen ein Minus.'},
'impInfo.colMain':{en:'becomes the Flexible Payments category — new ones are created',
  de:'wird zur Flexible-Payments-Kategorie — neue werden angelegt'},
'impInfo.optTitle':{en:'Taken along if present',de:'Wird mitgenommen, wenn vorhanden'},
'impInfo.colCat':{en:'the subcategory, shown in the detail view',de:'die Unterkategorie, sichtbar in der Detailansicht'},
'impInfo.colAcc':{en:'account',de:'Konto'},
'impInfo.colNote':{en:'note on the booking',de:'Notiz zur Buchung'},
'impInfo.rest':{en:'Semicolon and comma both work as separators, and lines above the header row are ignored. Only bookings from <b>{0}</b> are used — the year of this file. After choosing the file you will see which months it holds and what would be replaced; nothing is changed before you confirm that.',
  de:'Semikolon und Komma gehen beide als Trennzeichen, und Zeilen über der Kopfzeile werden übergangen. Genommen werden nur Buchungen aus <b>{0}</b> — dem Jahr dieser Datei. Nach der Dateiwahl siehst du, welche Monate darin stehen und was ersetzt würde; geändert wird nichts, bevor du das bestätigst.'},
'impInfo.pick':{en:'Choose CSV file',de:'CSV-Datei wählen'},
'imp.noHeader':{en:'Column “Hauptkategorie” not found — is this a Fast Budget export?',
  de:'Spalte „Hauptkategorie" nicht gefunden — ist das ein Fast-Budget-Export?'},
'imp.noRows':{en:'No transactions found in the file.',de:'Keine Transaktionen in der Datei gefunden.'},
'imp.noYear':{en:'No bookings from {0} in the file{1}.',de:'Keine Buchungen aus {0} in der Datei{1}.'},
'imp.otherYears':{en:' — {0} row(s) are from other years',de:' — {0} Zeile(n) stammen aus anderen Jahren'},
'imp.failed':{en:'Import failed: {0}',de:'Import fehlgeschlagen: {0}'},
'imp.step1':{en:'CSV import — choose months',de:'CSV-Import — Monate wählen'},
'imp.step1Sub':{en:'<b>{0}</b> read: {1} bookings from {2}, first on {3}, last on {4}. {5}Nothing has been changed yet — choose the months to take over.',
  de:'<b>{0}</b> gelesen: {1} Buchungen aus {2}, erste am {3}, letzte am {4}. {5}Bisher ist nichts geändert — wähle die Monate, die übernommen werden sollen.'},
'imp.skipped':{en:'{0} row(s) from other years are left out. ',de:'{0} Zeile(n) aus anderen Jahren bleiben außen vor. '},
'imp.months':{en:'Months',de:'Monate'},
'imp.notInFile':{en:'not in the file',de:'nicht in der Datei'},
'imp.replaces':{en:'REPLACED',de:'ERSETZT'},
'imp.replacesTip':{en:'This month already holds data',de:'In diesem Monat stehen schon Daten'},
'imp.allFromFile':{en:'All from the file',de:'Alle aus der Datei'},
'imp.chosen':{en:'{0} month(s) chosen',de:'{0} Monate gewählt'},
'imp.chosenNone':{en:'no month chosen',de:'kein Monat gewählt'},
'imp.step2':{en:'Confirm import',de:'Import bestätigen'},
'imp.step2Sub':{en:'For {0} month(s) the Flexible Payments data will be <b>replaced, not added to</b>: the existing bookings, actual values and corrections of those months are deleted and the rows from the file put in their place. Plan values, notes, ticks and every other month stay untouched.',
  de:'Für {0} Monate werden die Flexible-Payments-Daten <b>ersetzt, nicht ergänzt</b>: die bisherigen Buchungen, Ist-Werte und Korrekturen dieser Monate werden gelöscht und durch die Zeilen aus der Datei eingesetzt. Planwerte, Notizen, Haken und alle übrigen Monate bleiben unberührt.'},
'imp.before':{en:'before',de:'bisher'},
'imp.after':{en:'after',de:'danach'},
'imp.noImportYet':{en:'no import — the Flexible Payments values come from planning',de:'kein Import — die Flexible-Payments-Werte stammen aus der Planung'},
'imp.corrections':{en:' · {0} correction(s)',de:' · {0} Korrekturen'},
'imp.newCats':{en:'New main categories will be created: {0}.',de:'Neu angelegt werden die Hauptkategorien: {0}.'},
'imp.saveHint':{en:'The file on disk changes only when you click “Save data”.',de:'Die Datei auf der Festplatte ändert sich erst mit „Daten speichern".'},
'imp.backToMonths':{en:'Back to month selection',de:'Zurück zur Monatswahl'},
'imp.go':{en:'Replace and import',de:'Ersetzen und importieren'},
'imp.done':{en:'{0} bookings taken over ({1}).',de:'{0} Buchungen übernommen ({1}).'},
'imp.dropped':{en:' {0} row(s) from deselected months skipped.',de:' {0} Zeile(n) aus abgewählten Monaten übergangen.'},
'imp.outside':{en:' {0} outside {1} skipped.',de:' {0} außerhalb {1} übersprungen.'},
'imp.added':{en:' New main categories: {0}.',de:' Neue Hauptkategorien: {0}.'},

/* ── Fälligkeit und Rhythmus ──────────────────────────────── */
'due.A':{en:'Start of month',de:'Monatsanfang'},
'due.M':{en:'Mid month',de:'Monatsmitte'},
'due.E':{en:'End of month',de:'Monatsende'},
'due.day':{en:'on the {0}.',de:'am {0}.'},
'rhy.1':{en:'every month',de:'jeden Monat'},
'rhy.2':{en:'every two months',de:'alle zwei Monate'},
'rhy.3':{en:'every three months',de:'alle drei Monate'},
'rhy.6':{en:'every six months',de:'alle sechs Monate'},
'rhy.12':{en:'once a year',de:'einmal im Jahr'},
'end.past':{en:'last payment {0} — already finished',de:'letzte Zahlung {0} — bereits gelaufen'},
'end.now':{en:'last payment {0} — ends this month',de:'letzte Zahlung {0} — läuft diesen Monat aus'},
'end.in':{en:'last payment {0} — {1} months left, this one included',de:'letzte Zahlung {0} — noch {1} Monate, diesen mitgezählt'},
'end.tip':{en:'last payment {0}',de:'letzte Zahlung {0}'}
};
