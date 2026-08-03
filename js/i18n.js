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
'app.settings':{en:'Settings',de:'Einstellungen'},
'app.settingsTip':{en:'Language, year, column widths, banks, payment types and categories',
  de:'Sprache, Jahr, Spaltenbreiten, Banken, Zahlungsarten und Kategorien'},
'app.guide':{en:'Guide',de:'Anleitung'},
'app.guideTip':{en:'How this cash book works',de:'Wie dieses Kassenbuch funktioniert'},
'app.chooseView':{en:'Choose view',de:'Ansicht wählen'},
'app.chooseMonth':{en:'Choose month',de:'Monat wählen'},

/* ── Ansichtsnamen ────────────────────────────────────────── */
/* „Flexible Payments" ist der Name des Bereichs, der früher
   Kakeibo hieß. Er bleibt in beiden Sprachen gleich — wie
   „Fast Budget" auch. Die internen Schlüssel (kak, kakCats,
   flexActual, ui.view='kakeibo') behalten ihre alten Namen. */
'view.monat':{en:'Month',de:'Monat'},
'view.jahr':{en:'Year',de:'Jahr'},
'view.kakeibo':{en:'Flexible Payments',de:'Flexible Payments'},
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
'g.fixed':{en:'Recurring costs',de:'Regelmäßige Kosten'},
'g.estimated':{en:'estimated',de:'geschätzt'},
'g.all':{en:'All',de:'Alle'},
'g.none':{en:'None',de:'Keinen'},
'g.bookings':{en:'bookings',de:'Buchungen'},
'g.booking':{en:'booking',de:'Buchung'},
'g.transactions':{en:'transactions',de:'Transaktionen'},
'g.wholeYear':{en:'Whole year',de:'Ganzes Jahr'},

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
'year.title':{en:'Year overview {0}',de:'Jahresübersicht {0}'},
'year.legend':{en:'<span class="mk-ok">&#10003;</span> paid &nbsp; <span class="mk-q">?</span> estimated &nbsp; empty = open',
  de:'<span class="mk-ok">&#10003;</span> bezahlt &nbsp; <span class="mk-q">?</span> geschätzt &nbsp; leer = offen'},
'year.showAll':{en:'Show whole year',de:'Ganzes Jahr zeigen'},
'year.showAllN':{en:'Show whole year ({0} collapsed)',de:'Ganzes Jahr zeigen ({0} zugeklappt)'},
'year.hideDone':{en:'Hide completed months',de:'Erledigte Monate ausblenden'},
'year.addItem':{en:'Add item',de:'Posten hinzufügen'},
'year.hideSettled':{en:'Hide finished items',de:'Abgeschlossene ausblenden'},
'year.showSettled':{en:'Show finished items ({0})',de:'Abgeschlossene zeigen ({0})'},
'year.balanceRow':{en:'Balance per month',de:'Saldo je Monat'},
'year.kakRow':{en:'Flexible Payments — Fast Budget',de:'Flexible Payments — Fast Budget'},
'year.end':{en:'End',de:'Ende'},
'year.endTip':{en:'Last payment — month.year. The colour shows the remaining term including the current month: green only this one, blue two, yellow three to six, red more.',
  de:'Letzte Zahlung — Monat.Jahr. Die Farbe zeigt die Restlaufzeit mit dem laufenden Monat: grün noch dieser eine, blau zwei, gelb drei bis sechs, rot mehr.'},
'year.bankTip':{en:'Edit banks',de:'Banken bearbeiten'},
'year.payTip':{en:'Edit payment types',de:'Zahlungsarten bearbeiten'},
'year.dueTip':{en:'Due date: A = start of month, M = mid month, E = end of month, otherwise the day',
  de:'Fälligkeit: A = Monatsanfang, M = Monatsmitte, E = Monatsende, sonst Tag'},
'year.monthTip':{en:'Go to {0}',de:'Zum Monat {0}'},
'year.monthDone':{en:'Everything recorded and paid — ',de:'Alles erfasst und bezahlt — '},
'year.editTip':{en:'Edit item',de:'Position ändern'},
'year.linkTip':{en:'Open receipt or contract',de:'Beleg oder Vertrag öffnen'},
'year.hint':{en:'The pencil opens the item · clicking a month jumps to the month view · B and Z open the lists · F is the due date (A/M/E or day), End the last payment.',
  de:'Stift öffnet die Position · Klick auf einen Monat springt in die Monatsansicht · Klick auf B oder Z öffnet die Listen · F ist die Fälligkeit (A/M/E oder Tag), Ende die letzte Zahlung.'},
'year.hintTerm':{en:'The “End” cell shows the remaining term including {0}:',de:'Die Zelle „Ende" zeigt die Restlaufzeit einschließlich {0}:'},
'year.keyNow':{en:'this one only',de:'nur noch dieser'},
'year.key2':{en:'2 months',de:'2 Monate'},
'year.key36':{en:'3 to 6',de:'3 bis 6'},
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
'month.fixed':{en:'Recurring costs — {0}',de:'Regelmäßige Kosten — {0}'},
'month.kpiIncome':{en:'Income',de:'Einnahmen'},
'month.kpiKak':{en:'Flexible {0}',de:'Flexible {0}'},
'month.kpiActual':{en:'actual',de:'Ist'},
'month.kpiPlanned':{en:'planned',de:'geplant'},
'month.kpiFixed':{en:'Recurring costs',de:'Regelmäßige Kosten'},
'month.kpiOpen':{en:'Still open',de:'Noch offen'},
'month.kpiOpenN':{en:'{0} of {1} items{2}',de:'{0} von {1} Posten{2}'},
'month.kpiUnclear':{en:' · {0} estimated',de:' · {0} geschätzt'},
'month.kpiBalance':{en:'Balance',de:'Saldo'},
'month.noIncome':{en:'No income recorded.',de:'Keine Einnahmen hinterlegt.'},
'month.noKak':{en:'No Flexible Payments categories yet — add them under Settings.',
  de:'Noch keine Flexible-Payments-Kategorien angelegt — anzulegen unter Einstellungen.'},
'month.noItems':{en:'No items for this filter.',de:'Keine Posten für diesen Filter.'},
'month.noImport':{en:'No Fast Budget import for this month — the values come from your planning. The CSV import lives in the Flexible Payments view. You can type them via the pencil and tick them off one by one.',
  de:'Noch kein Fast-Budget-Import für diesen Monat — die Werte stammen aus deiner Planung. Der CSV-Import liegt im Bereich Flexible Payments. Du kannst sie über den Stift eintragen und einzeln als erfasst markieren.'},
'month.openEval':{en:'Open analysis',de:'Auswertung öffnen'},
'month.openEvalTip':{en:'Go to the Flexible Payments analysis for {0}',de:'Zur Flexible-Payments-Auswertung für {0}'},
'month.fOpen':{en:'Only open',de:'Nur offen'},
'month.fEst':{en:'Only estimated',de:'Nur geschätzte'},
'month.fDueAll':{en:'All due dates',de:'Alle Fälligkeiten'},
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
'month.paidSum':{en:'Paid',de:'Bezahlt'},
'month.openSum':{en:'Still open',de:'Noch offen'},
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
'kak.period':{en:'Period',de:'Zeitraum'},
'kak.prev':{en:'‹ Previous month',de:'‹ Vormonat'},
'kak.prevTip':{en:'One month back',de:'Einen Monat zurück'},
'kak.next':{en:'Next month ›',de:'Folgemonat ›'},
'kak.nextTip':{en:'One month forward',de:'Einen Monat weiter'},
'kak.yearTip':{en:'All twelve months together',de:'Alle zwölf Monate zusammen'},
'kak.mainOnly':{en:'Main categories only',de:'Nur Hauptkategorien'},
'kak.withSubs':{en:'With subcategories',de:'Mit Unterkategorien'},
'kak.byCat':{en:'Spending by category — {0}',de:'Ausgaben nach Kategorie — {0}'},
'kak.top':{en:'Largest single items',de:'Größte Einzelposten'},
'kak.topSub':{en:'{0} · {1} bookings from {2}',de:'{0} · {1} Buchungen ab {2}'},
'kak.topNone':{en:'No booking reaches {0} in this period.',de:'Keine Buchung erreicht in diesem Zeitraum {0}.'},
'kak.arrowTip':{en:'Show the bookings of “{0}” on the right',de:'Buchungen von „{0}" rechts zeigen'},
'kak.rowHint':{en:'The arrow on a row shows all its bookings on the right.',
  de:'Der Pfeil an einer Zeile zeigt rechts alle Buchungen dazu.'},
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
'prog.kpiFixed':{en:'Recurring costs from {0}',de:'Regelmäßige Kosten ab {0}'},
'prog.kpiOpen':{en:'{0} of it still open',de:'davon {0} noch offen'},
'prog.kpiKak':{en:'Flexible Payments expected from {0}',de:'Flexible Payments erwartet ab {0}'},
'prog.kpiPerMonth':{en:'{0} per month assumed',de:'{0} je Monat angenommen'},
'prog.kpiSoFar':{en:'Balance so far',de:'Saldo bisher'},
'prog.kpiSoFarSub':{en:'January to {0}',de:'Januar bis {0}'},
'prog.kpiSoFarNone':{en:'no month closed yet',de:'noch kein abgerechneter Monat'},
'prog.kpiEnd':{en:'Balance at year end',de:'Saldo zum Jahresende'},
'prog.kpiEndSub':{en:'all twelve months of {0}',de:'alle zwölf Monate {0}'},
'prog.colIncome':{en:'Income',de:'Einnahmen'},
'prog.colFixed':{en:'Recurring',de:'Regelmäßig'},
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
'prog.colAvg':{en:'Ø {0}',de:'Ø {0}'},
'prog.avgMonths':{en:'actual months',de:'Ist-Monate'},
'prog.noCats':{en:'No Flexible Payments categories yet.',de:'Noch keine Flexible-Payments-Kategorien angelegt.'},
'prog.takeAvg':{en:'Apply Ø',de:'Ø übernehmen'},
'prog.takeHint':{en:'Applying overwrites the current assumption of every category — you will be asked first.',
  de:'Übernehmen überschreibt die aktuelle Annahme jeder Kategorie — es wird vorher gefragt.'},
'prog.askAvg':{en:'The current assumption of {0} categories will be replaced by the average of {1}. The previous values are lost. Continue?',
  de:'Die aktuelle Annahme von {0} Kategorien wird durch den Durchschnitt aus {1} ersetzt. Die bisherigen Werte gehen dabei verloren. Fortfahren?'},
'prog.noActual':{en:'No actual months available.',de:'Keine Ist-Monate vorhanden.'},
'prog.applied':{en:'Assumption from {0} applied.',de:'Annahme aus {0} übernommen.'},

/* ── Posten-Fenster ───────────────────────────────────────── */
'item.add':{en:'Add item',de:'Posten hinzufügen'},
'item.lockedN':{en:'{0} month(s) marked as paid. Remove the tick to change an amount.',
  de:'{0} Monate sind als bezahlt markiert. Haken entfernen, um den Betrag zu ändern.'},
'item.allOpen':{en:'All months can be changed.',de:'Alle Monate sind änderbar.'},
'item.name':{en:'Name',de:'Name'},
'item.namePh':{en:'e.g. Netflix',de:'z. B. Netflix'},
'item.block':{en:'Block',de:'Block'},
'item.bank':{en:'Bank (B)',de:'Bank (B)'},
'item.pay':{en:'Payment type (Z)',de:'Zahlungsart (Z)'},
'item.due':{en:'Due (F)',de:'Fälligkeit (F)'},
'item.endM':{en:'End — month',de:'Ende — Monat'},
'item.endY':{en:'End — year',de:'Ende — Jahr'},
'item.url':{en:'Link to receipt or contract',de:'Link zu Beleg oder Vertrag'},
'item.kind':{en:'Kind of amount',de:'Betragsart'},
'item.est':{en:'Amount is estimated and may differ — shown in yellow with a question mark',
  de:'Summe ist geschätzt und kann abweichen — wird gelb mit Fragezeichen dargestellt'},
'item.lists':{en:'Edit banks, payment types & categories',de:'Banken, Zahlungsarten &amp; Kategorien bearbeiten'},
'item.quick':{en:'Quick entry',de:'Schnelle Eingabe'},
'item.rhythm':{en:'Repetition',de:'Wiederholung'},
'item.fromMonth':{en:'from {0}',de:'ab {0}'},
'item.apply':{en:'Apply',de:'Übernehmen'},
'item.clear':{en:'Clear open months',de:'Offene Monate leeren'},
'item.quickHint':{en:'Fills from the chosen month to December — or to the end you set. Paid months stay untouched.',
  de:'Füllt vom gewählten Monat bis Dezember — oder bis zum gesetzten Ende. Bezahlte Monate bleiben unangetastet.'},
'item.perMonth':{en:'Amount per month — expenses with a minus',de:'Betrag je Monat — Ausgaben mit Minus'},
'item.del':{en:'Delete item',de:'Posten löschen'},
'item.delAsk':{en:'Delete “{0}”?',de:'„{0}" löschen?'},
'item.setN':{en:'{0} month(s) set',de:'{0} Monate gesetzt'},
'item.cleared':{en:', {0} in between cleared',de:', {0} dazwischen geleert'},
'item.lockedTip':{en:'paid — remove the tick to change the amount',de:'bezahlt — Haken entfernen, um den Betrag zu ändern'},

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

/* ── Einstellungen ────────────────────────────────────────── */
'set.title':{en:'Settings',de:'Einstellungen'},
'set.sub':{en:'Everything here is stored in the JSON file: language, accounting year, column widths and the four lists. The file decides how the app looks when you load it.',
  de:'Alles hier steht in der JSON-Datei: Sprache, Abrechnungsjahr, Spaltenbreiten und die vier Listen. Beim Laden richtet sich die Anwendung nach der Datei.'},
'set.general':{en:'General',de:'Allgemein'},
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
'set.lists':{en:'Banks, payment types & categories',de:'Banken, Zahlungsarten &amp; Kategorien'},
'set.listsSub':{en:'Codes appear in the year overview, the label below each item. Recurring categories group the fixed costs; “INCOME” is built in. Flexible Payments categories are the rows of the Fast Budget analysis. Renaming carries the items and figures along.',
  de:'Kürzel stehen in der Jahresübersicht, die Bezeichnung erscheint unter jedem Posten. Regelmäßige Kategorien gliedern die festen Kosten; „INCOME" ist fest eingebaut. Flexible-Payments-Kategorien sind die Zeilen der Fast-Budget-Auswertung. Beim Umbenennen wandern die zugehörigen Posten und Zahlen mit.'},
'set.banks':{en:'Banks (B)',de:'Banken (B)'},
'set.pays':{en:'Payment types (Z)',de:'Zahlungsarten (Z)'},
'set.groups':{en:'Recurring categories',de:'Regelmäßige Kategorien'},
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
'set.taken':{en:'This name already exists: {0}',de:'Diesen Namen gibt es schon: {0}'},
'set.keepOne':{en:'At least one category must remain.',de:'Es muss mindestens eine Kategorie bleiben.'},
'set.moveAsk':{en:'“{0}” contains {1} item(s). They will be moved to “{2}”. Continue?',
  de:'„{0}" enthält {1} Position(en). Sie werden nach „{2}" verschoben. Fortfahren?'},
'set.dropKakAsk':{en:'Remove “{0}”? Plan and actual values, corrections and notes of this category will be deleted{1}. This can only be undone from a saved file.',
  de:'„{0}" entfernen? Plan- und Ist-Werte, Korrekturen und Notizen dieser Kategorie werden gelöscht{1}. Das lässt sich nur über eine gespeicherte Datei rückgängig machen.'},
'set.dropKakTx':{en:', together with {0} imported booking(s)',de:', dazu {0} importierte Buchungen'},
'set.saved':{en:'Settings saved.',de:'Einstellungen gespeichert.'},

/* ── CSV-Import ───────────────────────────────────────────── */
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
