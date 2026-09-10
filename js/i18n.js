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

/* ── Die Sprache, solange keine Datei etwas dazu sagt ─────────
   Zwei Stellen wählen sie: der DE/EN-Schalter der Verkaufsseiten
   (`setLang()` in js/landing.js) und die Begrüßungsseite der
   Anwendung (`data-wlang`). Beide meinen dasselbe — in welcher
   Sprache FINA einen anspricht, **bevor** ein Buch offen ist —, und
   führen deshalb eine gemeinsame Notiz: `finaLang` im localStorage.
   Gelesen wird sie beim Aufruf jeder Verkaufsseite und beim Start
   des Web-Clients für das noch leere Buch (Block „Start" in
   js/app.js). Wer auf der Seite Deutsch wählt, landet auch in der
   Anwendung auf Deutsch, und umgekehrt.

   **Ein offenes Buch fragt hier nicht mehr nach.** Seine Sprache
   steht in `state.lang`, also in der Datei, und wird im
   Einstellungsfenster geändert — das schreibt `finaLang` nicht:
   wer ein Buch auf Deutsch führt, hat damit nichts über die
   Verkaufsseiten gesagt. Deshalb gibt es in der Kopfzeile auch
   keinen Schalter; es gäbe sonst zwei Wege zu derselben Angabe,
   von denen einer nach Anwendung und einer nach Datei aussieht.

   Unter `file://` kann der Speicher fehlen (Regel 4 gilt dem Laden
   der eigenen Dateien, hier scheitert nur eine Notiz): dann bleibt
   es bei Englisch, und das ist die richtige Antwort.

   Zurück kommt, **ob sich etwas geändert hat** — der Aufrufer spart
   sich damit das render(), wenn schon dieselbe Sprache stand. */
function chooseLang(l){
  const want=(l==='de')?'de':'en';
  if(!state||state.lang===want) return false;
  state.lang=want;
  try{localStorage.setItem('finaLang',want);}catch(e){}
  return true;
}

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
/* ── „ohne Kategorie" — je Bereich ein fester Schlüssel (6.9.26) ──
   In jeder der drei Kategorielisten (incomeGroups, flexGroups,
   groups) steht genau einer davon, immer: er nimmt die Posten auf,
   die noch keine Kategorie haben. Umsortieren ja, umbenennen und
   löschen nein (js/dialogs/settings.js). Der Schlüssel steht so in
   der Datei und wird **nie übersetzt** — angezeigt wird er über
   keyLabel() — **und zwar in beiden Sprachen als „N/A"** (seit
   6.9.26 spät; davor „Einnahmen ohne Kategorie" usw.): überall, wo
   der Eintrag steht, steht sein Bereich als Überschrift direkt
   darüber — Auswahlliste, Einstellungen, Kartenkopf, Blockzeile —,
   und ein Name, der den Bereich wiederholt, sagte zweimal dasselbe
   (Lex' Vorschlag). Der Bereich steht trotzdem im **Schlüssel**,
   weil derselbe Schlüssel in beiden Listen der regulären Posten
   stünde und isIncome() ihn sonst nicht mehr auseinanderhielte. */
const NOCAT_IN='(Einnahmen ohne Kategorie)';
const NOCAT_FLEX='(Flexibel ohne Kategorie)';
const NOCAT_OUT='(Regulär ohne Kategorie)';
const NOCAT={in:NOCAT_IN,flex:NOCAT_FLEX,out:NOCAT_OUT};
const isNoCat=g=>g===NOCAT_IN||g===NOCAT_FLEX||g===NOCAT_OUT;
const NOCAT_LABELS={
  [NOCAT_IN]:{en:'N/A',de:'N/A'},
  [NOCAT_FLEX]:{en:'N/A',de:'N/A'},
  [NOCAT_OUT]:{en:'N/A',de:'N/A'}
};
const keyLabel=k=>{const l=NOCAT_LABELS[k];return l?l[LANG()]:(KEY_LABELS[k]||k);};

const STR={
/* ── Kopfzeile und Gerüst ─────────────────────────────────── */
/* Der Name des Produkts, sprachabhängig: Deutsch „FINA Buch",
   Englisch „FINA Book". Gesetzt von renderChrome() in Wortzeichen
   und Seitentitel; die Pakete (productName, artifactName,
   Fenstertitel der App) bleiben englisch — sie wechseln die
   Sprache nicht mit. Daneben steht nur noch das Jahr. */
'app.name':{en:'FINA Book',de:'FINA Buch'},
/* Die Sprechblase am Wortzeichen — nur im Browser, wo es ein Link
   zur Startseite ist (renderChrome in js/app.js). */
'app.homeTip':{en:'Back to the FINA page',de:'Zurück zur FINA-Seite'},
'app.sub':{en:'{0}',de:'{0}'},
/* **Die Dateiart steht in Klammern dahinter** (Lex, 8.9.26): das
   Menü hat zwei Wege, die etwas hereinholen, und sie unterscheiden
   sich allein darin — das Buch selbst als JSON, Umsätze als CSV.
   Geschrieben wird sie in jeder Sprache so, wie man sie dort
   schreibt: „JSON-Datei" mit Bindestrich, „JSON file" ohne.

   **Und die JSON-Datei heißt „lokale Datenbank"** (Lex, 8.9.26):
   sie ist die einzige Ablage, die FINA hat — alles steht darin,
   und beim Öffnen richtet sich die Anwendung nach ihr. „Datei"
   sagt nur, wie es auf der Platte liegt; „lokale Datenbank" sagt,
   was es ist, und das Wort „lokal" sagt zugleich das Wichtigste
   darüber: sie bleibt auf dem eigenen Rechner. Wo der Dateityp
   genannt wird, steht er weiter in Klammern dahinter. */
/* ── Die Menüeinträge sind Befehle (Lex, 9.9.26) ──────────────
   Auf Deutsch steht das Verb **vorn**: „Öffne lokale Datenbank",
   nicht „Lokale Datenbank öffnen". Ein Menüeintrag ist das, was
   man dem Programm sagt, und im Deutschen fängt ein Befehl mit dem
   Verb an — nachgestellt liest er sich wie eine Überschrift. Auf
   Englisch steht das Verb ohnehin vorn, dort ändert sich nichts.
   Die Dateiart bleibt in Klammern dahinter (siehe „Die JSON-Datei
   heißt lokale Datenbank" in CLAUDE.md). */
'app.load':{en:'Open local database (JSON file)',de:'Öffne lokale Datenbank (JSON-Datei)'},
'app.loadTip':{en:'Open a local database (JSON file) and show its contents',
  de:'Lokale Datenbank (JSON-Datei) öffnen und ihren Inhalt anzeigen'},
'app.save':{en:'Save data',de:'Daten speichern'},
'app.saveTip':{en:'Write the current state into the local database (JSON file)',
  de:'Aktuellen Stand in die lokale Datenbank (JSON-Datei) schreiben'},
'app.backup':{en:'Save backup',de:'Sicherung speichern'},
'app.backupTip':{en:'Download a dated copy — the file you are working on stays as it is',
  de:'Eine Kopie mit Datum herunterladen — die Datei, in der du arbeitest, bleibt, wie sie ist'},
'app.unlink':{en:'Close local database',de:'Schließe lokale Datenbank'},
'app.unlinkTip':{en:'Clear the view and let go of the local database',
  de:'Ansicht leeren und die lokale Datenbank loslassen'},
/* Der Import steht in der Kopfzeile, nicht mehr im Reiter: den
   Reiter gibt es erst nach dem ersten Import (siehe hasImport()
   in js/calc.js), der Knopf muss vorher erreichbar sein. */
/* Der Knopf nennt die App, aus der die Datei kommt, nicht das
   Dateiformat: „CSV" sagt nichts darüber, welche CSV gemeint ist. */
'app.import':{en:'Import CSV data',de:'CSV-Daten importieren'},
'app.importTip':{en:'Read Flexible from a Fast Budget CSV export — nothing is changed until you confirm',
  de:'Flexible aus einem Fast-Budget-CSV einlesen — geändert wird erst nach deiner Bestätigung'},
/* ── Das Hamburger-Menü (Mac-Redesign 22.8.26) ────────────────
   Alle Aktionsknöpfe stecken im Menü hinter dem ☰-Knopf; die
   drei „Neu…"-Wege tragen dort die Farbe ihrer Geldart. */
/* Hieß bis 8.9.26 „Import CSV" / „CSV importieren". Jetzt nennt der
   Eintrag zuerst, was er tut, und danach die Dateiart — dieselbe
   Form wie „Daten hochladen (JSON-Datei)" darüber. */
'menu.csv':{en:'Import data (CSV file)',de:'Importiere Daten (CSV-Datei)'},
'menu.csvTip':{en:'Read any CSV — bank statement, card export, tracker. Nothing is changed until you press “Apply”',
  de:'Jede CSV einlesen — Kontoauszug, Kartenexport, Tracker. Geändert wird erst, wenn du „Anwenden“ drückst'},
'menu.newFlex':{en:'New flexible entry',de:'Neuer flexibler Eintrag'},
'menu.newOut':{en:'New entry',de:'Neuer Eintrag'},
'app.settings':{en:'Settings',de:'Einstellungen'},
'app.settingsTip':{en:'Language, year, column widths, banks, payment types and categories',
  de:'Sprache, Jahr, Spaltenbreiten, Banken, Zahlungsarten und Kategorien'},
'app.guide':{en:'Guide',de:'Anleitung'},
'app.guideTip':{en:'Open the guide beside the table — reading and working at the same time',
  de:'Anleitung neben der Tabelle öffnen — lesen und gleichzeitig arbeiten'},
'app.guideDrag':{en:'Drag to change the width',de:'Ziehen ändert die Breite'},
/* Die beiden Reiter der Anleitung: erst der Weg für Anfänger,
   dann die Beschreibung dessen, was die Anwendung kann. */
'guide.lang':{en:'Language of the guide',de:'Sprache der Anleitung'},
'guide.tabSteps':{en:'Step by step',de:'Schritt für Schritt'},
'guide.tabProduct':{en:'What FINA can do',de:'Was FINA kann'},
'guide.tabNews':{en:"What's New",de:'Was ist neu'},
'guide.top':{en:'Back to top',de:'Nach oben'},
'guide.zoom':{en:'Click a picture to open it full size.',de:'Klick auf ein Bild öffnet es in voller Größe.'},
/* Die Anleitung über die ganze Breite, in einem eigenen Reiter des
   Browsers — der Seitenbereich schließt dabei. */
'guide.full':{en:'Open in a new tab',de:'In neuem Reiter öffnen'},
'guide.fullTip':{en:'The whole guide on a full page, in its own browser tab',
  de:'Die ganze Anleitung über die volle Breite, in einem eigenen Reiter des Browsers'},
'guide.fullBlocked':{en:'The browser blocked the new tab.',
  de:'Der Browser hat den neuen Reiter verhindert.'},
'app.chooseView':{en:'Choose view',de:'Ansicht wählen'},
/* Die beiden Schrittknöpfe der mobilen Ansichtswahl unten —
   ‹ eine Ansicht zurück, › eine weiter (renderChrome). */
'app.prevView':{en:'Previous view',de:'Vorige Ansicht'},
'app.nextView':{en:'Next view',de:'Nächste Ansicht'},
'app.chooseMonth':{en:'Choose month',de:'Monat wählen'},

/* ── Die Hinweisleiste auf eine neue Fassung ────────────────
   Nur in der Mac- und der Windows-App: im Browser ist die Seite
   immer die neueste, dort gäbe es nichts zu melden. Der Hinweis
   nennt die Nummer und führt zur Downloadseite; heruntergeladen
   und ausgetauscht wird von Hand (siehe checkUpdate in app.js). */
'upd.avail':{en:'Version {0} is available.',de:'Version {0} ist verfügbar.'},
'upd.get':{en:'Download',de:'Herunterladen'},
'upd.getTip':{en:'Opens the download page in your browser',
  de:'Öffnet die Downloadseite im Browser'},
'upd.hide':{en:'Not now',de:'Später'},
'upd.hideTip':{en:'Hide until the next start',de:'Bis zum nächsten Start ausblenden'},

/* ── Ansichtsnamen ────────────────────────────────────────── */
/* „Flexible" ist der Name des Bereichs, der früher
   Kakeibo hieß. Er bleibt in beiden Sprachen gleich — wie
   „Fast Budget" auch. Die internen Schlüssel (kak, kakCats,
   flexActual, ui.view='kakeibo') behalten ihre alten Namen. */
/* Der Tastengriff am Reiter. Die Buchstaben folgen den englischen
   Namen und stehen deshalb in beiden Sprachen gleich da — nur der
   Satz drumherum wechselt. */
'view.keyTip':{en:'Ctrl/Cmd + Shift + {0}',de:'Strg/Cmd + Umschalt + {0}'},
'view.monat':{en:'Month',de:'Monat'},
'view.jahr':{en:'Year',de:'Jahr'},
/* Der Reiter heißt anders als die Geldart: er zeigt die
   Auswertung der importierten Buchungen und gibt es nur mit
   Import. Er nennt deshalb die App, aus der sie kommen — wo die
   Geldart gemeint ist (die drei Blöcke, eine Kategorie), steht
   g.flex. Der Name steht in beiden Sprachen gleich da, wie
   „Fast Budget" selbst. */
/* Seit dem Mac-Redesign heißt der Reiter „Transactions" — in
   beiden Sprachen, wie „Fast Budget" zuvor. Die Schlüssel im
   Zustand (kak, ui.view='kakeibo' …) behalten ihren alten Namen. */
'view.kakeibo':{en:'Import Details',de:'Import Details'},
'view.prognose':{en:'Forecast',de:'Prognose'},

/* ── Allgemeine Wörter ────────────────────────────────────── */
'g.cancel':{en:'Cancel',de:'Abbrechen'},
'g.save':{en:'Save',de:'Speichern'},
'g.nameEmpty':{en:'Please enter a name.',de:'Bitte gib eine Bezeichnung ein.'},
'g.close':{en:'Close',de:'Schließen'},
'g.next':{en:'Next',de:'Weiter'},
'g.remove':{en:'Remove',de:'Entfernen'},
'g.month':{en:'Month',de:'Monat'},
'g.category':{en:'Category',de:'Kategorie'},
'g.position':{en:'Item',de:'Position'},
'g.total':{en:'Total',de:'Gesamt'},
'g.amount':{en:'Amount',de:'Betrag'},
'g.income':{en:'Income',de:'Einnahmen'},
'g.fixed':{en:'Regular',de:'Regulär'},
/* Die Geldart, nicht der Reiter — siehe view.kakeibo. */
'g.flex':{en:'Flexible',de:'Flexibel'},
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
/* Der Knopf rechts vom Suchfeld. */
'g.clearFilter':{en:'Clear filter',de:'Filter zurücknehmen'},
'g.clearFilterTip':{en:'Clears the search term and sets payment state and due date back to “all”.',
  de:'Leert den Suchbegriff und setzt Zahlungsstand und Fälligkeit auf „alle" zurück.'},
/* Der Hinweis am Suchfeld. Er nennt am Ende die Taste, mit der man
   von überall hierher springt — sie steht sonst nirgends, und das
   Feld ist die Stelle, an der man sie brauchen kann. */
'g.filterTip':{en:'Filters the list while you type. Part of a word or of a number is enough. The button on the left decides what is searched. Ctrl/Cmd + Shift + F jumps here from anywhere and selects what is in the field.',
  de:'Filtert die Liste beim Tippen. Ein Wortteil oder ein Stück der Zahl genügt. Was durchsucht wird, sagt der Knopf links daneben. Strg/Cmd + Umschalt + F springt von überall hierher und markiert, was im Feld steht.'},

/* ── Fenster „Worin gesucht wird" ─────────────────────────────
   Der Hamburger-Knopf vor jedem Suchfeld
   (js/dialogs/filter-fields.js). Die Wahl steht in der Datei. */
'flt.title':{en:'What the filter searches',de:'Worin der Filter sucht'},
/* ── Die Filterzeile im Mac-Chrome ────────────────────────────
   Aufklappmenüs statt Knopfreihen: der Knopf nennt Gruppe und
   gewählten Wert („Fälligkeit: Alle"), das Menü darunter die
   Werte — es bleibt beim Wählen offen. */
'flt.options':{en:'Filter options…',de:'Filteroptionen…'},
/* Das ☰ der Filterzeile: reicht die Breite nicht, stehen alle
   Filter darin (fltMenuAll in js/views/monat.js, gemessen in
   fitFilterBar in js/app.js). */
'flt.allFilters':{en:'Filters',de:'Filter'},
'flt.allFiltersTip':{en:'All filters — area, due date, payment state, and the filter options',
  de:'Alle Filter — Bereich, Fälligkeit, Zahlungsstatus und die Filteroptionen'},
'flt.all':{en:'All',de:'Alle'},
'flt.due':{en:'Due date',de:'Fälligkeit'},
'flt.state':{en:'Payment state',de:'Zahlungsstatus'},
'flt.btnTip':{en:'Choose which parts of a row the filter searches',
  de:'Wählen, welche Teile einer Zeile der Filter durchsucht'},
'flt.sub':{en:'The word you type is looked for only in the parts ticked here — in the month view as in the year view. The choice is kept in the local database (JSON file).',
  de:'Das getippte Wort wird nur in den hier angekreuzten Teilen gesucht — in der Monatsansicht wie in der Jahresansicht. Die Wahl steht in der lokalen Datenbank (JSON-Datei).'},
'flt.fName':{en:'Item name',de:'Bezeichnung der Position'},
'flt.fNameHint':{en:'The name of a regular or a flexible item',
  de:'Der Name eines regulären oder eines flexiblen Postens'},
'flt.fNote':{en:'Notes',de:'Notizen'},
'flt.fNoteHint':{en:'The note on the whole item and the note on a single month',
  de:'Die Notiz zur ganzen Position und die Notiz zu einem einzelnen Monat'},
'flt.fAmount':{en:'Monthly amounts',de:'Monatsbeträge'},
'flt.fAmountHint':{en:'The amount of the month shown — in the year view all twelve. “1.234,56” and “1234.56” both find it.',
  de:'Der Betrag des gezeigten Monats — in der Jahresansicht alle zwölf. „1.234,56" und „1234.56" finden ihn gleichermaßen.'},
'flt.fTotal':{en:'Year totals',de:'Jahressummen'},
'flt.fTotalHint':{en:'The total of all twelve months. It is written in the year matrix, but searched in both views.',
  de:'Die Summe aller zwölf Monate. Sie steht in der Jahresmatrix, gesucht wird sie in beiden Ansichten.'},
'flt.fMeta':{en:'Category, bank, payment type, due date',
  de:'Kategorie, Bank, Zahlungsart, Fälligkeit'},
'flt.fMetaHint':{en:'Everything an item is filed under — including the names of the blocks and categories in the year view.',
  de:'Alles, worunter eine Position einsortiert ist — auch die Namen der Blöcke und Kategorien der Jahresansicht.'},
'flt.needOne':{en:'At least one entry has to stay ticked — otherwise the filter would have nothing to search.',
  de:'Mindestens eine Angabe muss gewählt bleiben — sonst hätte der Filter nichts zu durchsuchen.'},
/* Der sechste Haken. Er sagt nicht, worin gesucht wird, sondern
   wo — deshalb steht er abgesetzt unter den fünf. */
'flt.fHidden':{en:'Search hidden items too',de:'Auch in ausgeblendeten Positionen suchen'},
'flt.fHiddenHint':{en:'A search term then beats the other filters: it also finds what the payment state, the due date, “Hide finished items” or a month without an amount would keep out of sight. Without a search term nothing changes.',
  de:'Ein Suchbegriff schlägt dann die übrigen Filter: Er findet auch, was Zahlungsstand, Fälligkeit, „Erledigte Posten ausblenden" oder ein Monat ohne Betrag sonst verbergen. Ohne Suchbegriff ändert sich nichts.'},

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
'store.unsavedLine':{en:'unsaved changes',de:'ungespeicherte Änderungen'},
'store.savedLine':{en:'all changes saved',de:'alles gespeichert'},
'store.pathTip':{en:'For security reasons browsers reveal only the file name, not the full path.',
  de:'Browser geben aus Sicherheitsgründen nur den Dateinamen preis, nicht den vollständigen Pfad.'},
'store.noFileTip':{en:'No data loaded yet',de:'Noch keine Daten geladen'},
'store.loadedFrom':{en:'Loaded from <b>{0}</b>. ',de:'Geladen aus <b>{0}</b>. '},
'store.noFile':{en:'No data loaded. ',de:'Es sind keine Daten geladen. '},
'store.dirty':{en:'<b>Changes are not saved yet</b> — click “Save data”.',
  de:'<b>Änderungen sind noch nicht gespeichert</b> — auf „Daten speichern" klicken.'},
'store.clean':{en:'All changes saved.',de:'Alle Änderungen gespeichert.'},
'store.lastImport':{en:'Last CSV import: {0}.',de:'Letzter CSV-Import: {0}.'},
'store.never':{en:'none yet',de:'noch keiner'},
'store.loaded':{en:'{0} loaded.',de:'{0} geladen.'},
'store.saved':{en:'Saved to {0}.',de:'In {0} gespeichert.'},
'store.downloaded':{en:'Downloaded as {0}.',de:'Als {0} heruntergeladen.'},
/* ── Eine Datei aus einer älteren Fassung ────────────────────
   Beim Laden nur ein Hinweis, beim Speichern die Meldung, dass es
   geschehen ist. Beide hängen als Zusatz an der gewohnten
   Meldung (siehe oldNote/upgradeNote in js/storage.js) — zwei
   Kurzmeldungen übereinander läsen sich als zwei Vorgänge. */
'store.oldNote':{en:' The file is in an older format ({0}); saving converts it to the current one ({1}).',
  de:' Die Datei liegt in einem älteren Format vor ({0}); beim Speichern wird sie ins aktuelle ({1}) überführt.'},
'store.upgraded':{en:' Converted from the older format ({0}) to {1}.',
  de:' Vom älteren Format ({0}) nach {1} überführt.'},
/* Beide Sätze nennen die Fassung in Klammern — mit Nummer, wenn
   die Datei eine trägt, sonst als Feststellung. */
'store.verOf':{en:'version {0}',de:'Fassung {0}'},
'store.verNone':{en:'no version noted',de:'ohne Versionsangabe'},
'store.backup':{en:'Backup saved as {0}. Your file still has unsaved changes.',de:'Sicherung als {0} gespeichert. Deine Datei hat weiter ungespeicherte Änderungen.'},
'store.empty':{en:'The file is empty.',de:'Die Datei ist leer.'},
'store.loadFail':{en:'Loading failed: {0}',de:'Laden fehlgeschlagen: {0}'},
'store.loadRefused':{en:'The browser would not let FINA read that file. Please click \u201cOpen local database\u201d once more \u2014 FINA will then use the standard file dialog.',
  de:'Der Browser hat FINA das Lesen der Datei verweigert. Bitte noch einmal auf \u201eLokale Datenbank \u00f6ffnen\u201c klicken \u2014 FINA nimmt dann den gew\u00f6hnlichen Dateidialog.'},
'store.saveFail':{en:'Saving failed: {0}',de:'Speichern fehlgeschlagen: {0}'},
'store.unlinkAsk':{en:'There are unsaved changes. Close the file and clear the view anyway?',
  de:'Es gibt ungespeicherte Änderungen. Trotzdem trennen und die Ansicht leeren?'},
'store.loadAsk':{en:'There are unsaved changes. Open another file anyway? The current one will be lost.',
  de:'Es gibt ungespeicherte Änderungen. Trotzdem eine andere Datei öffnen? Der jetzige Stand geht dabei verloren.'},
'store.started':{en:'Empty book started — save it when you are ready.',de:'Leeres Buch angelegt — speichern, wenn du so weit bist.'},
'store.unlinked':{en:'Local database closed. Use “Open local database” to open one.',
  de:'Verbindung getrennt. Über „Öffne lokale Datenbank" kannst du eine öffnen.'},
'store.readFail':{en:'The file could not be read.',de:'Datei konnte nicht gelesen werden.'},
'store.fileKind':{en:'FINA data',de:'FINA Daten'},

/* ── Jahresansicht ────────────────────────────────────────── */
'year.legend':{en:'<span class="mk-ok">&#10003;</span> paid &nbsp; <span class="mk-q">?</span> estimated &nbsp; empty = open',
  de:'<span class="mk-ok">&#10003;</span> bezahlt &nbsp; <span class="mk-q">?</span> geschätzt &nbsp; leer = offen'},
'year.hideDone':{en:'Hide completed months',de:'Abgeschlossene Monate ausblenden'},
'year.hideDoneTip':{en:'Fold away every month in which nothing is left open. The total column still counts all twelve.',
  de:'Klappt jeden Monat weg, in dem nichts mehr offen ist. Die Gesamtspalte zählt weiter alle zwölf.'},
/* Die drei Anlege-Knöpfe. Sie benennen, was entsteht, nicht die
   Technik dahinter — „Position" sagt niemandem, in welchem Block
   sie landet. */
'year.addItem':{en:'Add new regular cost',de:'Neue regelmäßige Kosten hinzufügen'},
'year.addKak':{en:'Add new flexible cost',de:'Neue flexible Kosten hinzufügen'},
'year.addIncome':{en:'Add new income',de:'Neue Einnahme hinzufügen'},
'year.hideSettled':{en:'Hide finished items',de:'Erledigte Posten ausblenden'},
'year.hideSettledTip':{en:'Hide every item that is fully paid for this year. The sums stay as they are.',
  de:'Blendet jede Position aus, die für dieses Jahr abbezahlt ist. Die Summen bleiben, wie sie sind.'},
/* Block zuklappen — der Pfeil in der ersten Spalte einer
   Blockzeile der Matrix. Er gilt der Jahresansicht allein; die
   Monatsansicht hat ihren eigenen Schalter (month.minAreaTip). */
'year.minAreaTip':{en:'Show only the heading row of this block — kept in your file',
  de:'Nur die Kopfzeile dieses Blocks zeigen — wird in der Datei gemerkt'},
'year.maxAreaTip':{en:'Show this block in full again — kept in your file',
  de:'Diesen Block wieder ganz zeigen — wird in der Datei gemerkt'},
/* Die oberste Zeile der Matrix: was der Monat bringt und was er
   kostet, zusammengezählt — **nur dieser Monat**. Nicht der
   Kontostand: der trüge den Anfangsbestand und alle Monate davor in
   eine Tabelle hinein, in der jede andere Zahl genau einem Monat
   gehört. Wo das Konto am Monatsende steht, sagt die Prognose in
   der Spalte END. */
/* Seit dem Mac-Redesign die Blockzeile der blauen Saldo-Karte. */
'year.totalRow':{en:'Balance per month',de:'Saldo je Monat'},
/* Die violette Zeile der mobilen Jahresansicht: dieselbe Aussage
   wie year.totalRow, nur mit dem Jahr dahinter — auf dem Telefon
   gibt es keine Kopfzeile, die es nennt. Der Wert daneben ist die
   Jahressumme. */
'year.mTotal':{en:'Total per month {0}',de:'Gesamt je Monat {0}'},
'year.totalTip':{en:'Everything this month brings in and everything it costs, added up — this month alone, broken down by the three blocks below. What is left on the account at the end of the month is in the forecast, column END.',
  de:'Alles, was dieser Monat bringt, und alles, was er kostet, zusammengezählt — nur dieser Monat, aufgeschlüsselt in den drei Blöcken darunter. Was am Monatsende auf dem Konto liegt, steht in der Prognose in der Spalte END.'},
/* Die Blockzeile der Jahresmatrix ist zweizeilig: oben der
   Name, darunter klein, woher die Zahlen kommen können. */
'year.kakRow':{en:'Flexible',de:'Flexibel'},
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

/* ── Begrüßung ────────────────────────────────────────────────
   Die Seite vor allem anderen: was FINA ist, und die beiden Wege
   hinein. Sie steht am Anfang und wieder nach dem Trennen der
   Datei (js/views/willkommen.js). */
'wel.title':{en:'Your money. Your plan.',de:'Dein Geld. Dein Plan.'},
/* „…oder wo auch immer du sie hinlegst" (Lex, 9.9.26): FINA legt
   die Datei nicht irgendwohin — der Nutzer wählt beim Speichern
   selbst, wo sie liegt, und das darf auch ein Stick oder ein
   eigener Ordner in der Cloud sein. „Bleibt auf deinem Rechner"
   allein klang nach einer Einschränkung, die es gar nicht gibt. */
'wel.lead':{en:'No account. No cloud. Your data stays on your computer — or wherever you choose to keep it.',
  de:'Kein Konto. Keine Cloud. Deine Daten bleiben auf deinem Rechner — oder wo auch immer du sie hinlegst.'},
'wel.open':{en:'Open your local database',de:'Lokale Datenbank öffnen'},
'wel.openHint':{en:'Pick your saved FINA local database and carry on.',
  de:'Deine gespeicherte lokale FINA-Datenbank wählen und weitermachen.'},
'wel.new':{en:'Start from scratch',de:'Neu anfangen'},
'wel.privacy':{en:'Privacy',de:'Datenschutz'},
'wel.newHint':{en:'An empty book. Pick the year, off you go.',
  de:'Ein leeres Buch. Jahr wählen, loslegen.'},

/* ── Monatsansicht ────────────────────────────────────────── */
/* Ohne Monatsnamen: welcher Monat gemeint ist, sagen die
   Monatsleiste und die Reiter — im Kartenkopf stand er doppelt. */
'month.income':{en:'Income',de:'Einnahmen'},
'month.kak':{en:'Flexible',de:'Flexibel'},
'month.fixed':{en:'Regular',de:'Regulär'},
'month.kpiIncome':{en:'Income',de:'Einnahmen'},
'month.kpiKak':{en:'Flexible {0}',de:'Flexibel {0}'},
'month.kpiActual':{en:'actual',de:'Ist'},
'month.kpiPlanned':{en:'planned',de:'geplant'},
'month.kpiFixed':{en:'Regular',de:'Regulär'},
'month.kpiOpen':{en:'Still open',de:'Noch offen'},
'month.kpiOpenN':{en:'{0} of {1} items{2}',de:'{0} von {1} Posten{2}'},
/* Nur auf dem Telefon: die SALDO-Kachel unter den vier Kennzahlen
   und der Filterknopf vor dem Suchfeld, hinter dem Fälligkeit und
   Zahlungsstand wohnen (siehe mobileTop in js/views/monat.js). */
'month.kpiSaldo':{en:'Balance',de:'Saldo'},
'month.kpiSaldoTip':{en:'Everything the month brings in and everything it costs — income, flexible and regular items and the balance correction. The same number the year view calls “Balance per month”.',
  de:'Alles, was der Monat bringt, und alles, was er kostet — Einnahmen, flexible und reguläre Posten und die Saldokorrektur. Dieselbe Zahl, die die Jahresansicht „Saldo je Monat" nennt.'},
'month.mFilters':{en:'Filters',de:'Filter'},
/* Der Menüknopf der mobilen Kopfzeile — dahinter stehen alle
   Werkzeuge (Speichern, Sicherung, Einstellungen, Sprache …). */
'app.menu':{en:'Menu',de:'Menü'},
'month.mFiltersTip':{en:'Due date and payment state — the filters of this view',
  de:'Fälligkeit und Zahlungsstand — die Filter dieser Ansicht'},
'month.kpiUnclear':{en:' · {0} estimated',de:' · {0} geschätzt'},
'month.noIncome':{en:'No income recorded.',de:'Keine Einnahmen hinterlegt.'},
'month.noKak':{en:'No flexible items yet — create one from the menu (New flexible item).',
  de:'Noch keine flexiblen Posten — anlegen über das Menü (Neuer flexibler Eintrag).'},
'month.noFixed':{en:'No regular costs recorded.',de:'Keine regelmäßigen Kosten hinterlegt.'},
/* Steht nur noch dort, wo der Filter **alles** weggenommen hat:
   einzelne leere Bereiche verschwinden beim Filtern ganz. */
'month.noItems':{en:'No items for this filter.',de:'Keine Posten für diesen Filter.'},
'month.openEval':{en:'Open analysis',de:'Auswertung öffnen'},
'month.openEvalTip':{en:'Go to the Import Details analysis for {0}',de:'Zur Auswertung Import Details für {0}'},
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
/* ── Der Bereichsfilter ───────────────────────────────────────
   Gemeint sind die drei Karten der Monatsansicht — Einnahmen,
   Flexible, regelmäßige Kosten —, nicht die Kategorien
   darin. Weil auf dem Knopf nur ein kurzes Wort Platz hat, sagt
   die Sprechblase, welcher Bereich gemeint ist. */
'month.fSec':{en:'Area',de:'Bereich'},
'month.fSecAllTip':{en:'All three areas: Income, Flexible and Regular',
  de:'Alle drei Bereiche: Einnahmen, Flexibel und Regulär'},
'month.fSecIn':{en:'Income',de:'Einnahmen'},
'month.fSecInTip':{en:'Only the income area — the other areas and the balance correction are hidden',
  de:'Nur der Bereich Einnahmen — die übrigen Bereiche und die Saldokorrektur werden ausgeblendet'},
'month.fSecFlex':{en:'Flexible',de:'Flexibel'},
'month.fSecFlexTip':{en:'Only the Flexible area — the other areas and the balance correction are hidden',
  de:'Nur der Bereich Flexibel — die übrigen Bereiche und die Saldokorrektur werden ausgeblendet'},
'month.fSecOut':{en:'Regular',de:'Regulär'},
'month.fSecOutTip':{en:'Only the Regular area — the other areas and the balance correction are hidden',
  de:'Nur der Bereich Regulär — die übrigen Bereiche und die Saldokorrektur werden ausgeblendet'},
'month.fDueAll':{en:'All due dates',de:'Alle Fälligkeiten'},
'month.fDueAllTip':{en:'Every due date — start, middle and end of the month',
  de:'Jede Fälligkeit — Anfang, Mitte und Ende des Monats'},
'month.fDueA':{en:'Start of month',de:'Monatsanfang'},
'month.fDueM':{en:'Mid month',de:'Monatsmitte'},
'month.fDueE':{en:'End of month',de:'Monatsende'},
'month.fDueATip':{en:'Due date A or payday 1–10',de:'Fälligkeit A oder Zahltag 1. bis 10.'},
'month.fDueMTip':{en:'Due date M or payday 11–20',de:'Fälligkeit M oder Zahltag 11. bis 20.'},
'month.fDueETip':{en:'Due date E or payday 21 onwards',de:'Fälligkeit E oder Zahltag ab dem 21.'},
/* Der fünfte Knopf: alles ohne Zahltag. Er heißt wie die Zeile des
   Zeitstrahls, in die dasselbe fällt (month.tlClose). */
'month.fDueZTip':{en:'Everything without a payday — the flexible items, the balance correction and items with no due date',
  de:'Alles ohne Zahltag — die flexiblen Posten, die Saldokorrektur und Posten ohne Fälligkeit'},
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
'month.editKak':{en:'Edit flexible item',de:'Flexiblen Posten ändern'},
'month.done':{en:'{0} of {1} items done',de:'{0} von {1} Positionen erledigt'},
/* Der Tastengriff an jedem Monatsreiter: Strg/Cmd + Pfeil links
   oder rechts geht einen Monat zurück oder weiter. Die Pfeile
   stehen in beiden Sprachen gleich da — nur das Wort davor
   wechselt, wie bei view.keyTip. */
'month.keyTip':{en:'Ctrl/Cmd + ← / →',de:'Strg/Cmd + ← / →'},
/* Bereich zuklappen — steht im Kopf der Flexible, links
   vom Knopf, der eine Kategorie anlegt. */
'month.minAreaTip':{en:'Show only the heading of this area — applies to every month',
  de:'Nur die Überschrift dieses Bereichs zeigen — gilt für jeden Monat'},
'month.maxAreaTip':{en:'Show this area in full again — applies to every month',
  de:'Diesen Bereich wieder ganz zeigen — gilt für jeden Monat'},
/* ── Die Auswertung über dem Monat ────────────────────────────
   Eingeklappt eine Zeile mit den fünf Zahlen, aufgeklappt darunter
   der Zeitstrahl. Die Namen der drei Monatsabschnitte kommen aus
   den Filterknöpfen (month.fDueA/M/E) — es sind dieselben. */
'month.ana':{en:'Analytics',de:'Auswertung'},
'month.anaOpen':{en:'Click to open the timeline of the month',
  de:'Klick öffnet den Zeitstrahl des Monats'},
'month.anaClose':{en:'Click to close the timeline again',de:'Klick schließt den Zeitstrahl wieder'},
'month.tlClose':{en:'Month close',de:'Monatsabschluss'},
'month.tlOpen':{en:'Month open',de:'Monatseröffnung'},
/* Die Sprechblasen der beiden Zeilen ohne Tage: die drei mittleren
   nennen ihre Tage (month.tlDaysTip), diese beiden sagen, was sie
   sind — die eine ein Stand, die andere der Sammelplatz für alles
   ohne Zahltag. */
'month.tlOpenTip':{en:'The balance the month starts with — the sum of all previous months in this file. Nothing falls due here.',
  de:'Der Stand, mit dem der Monat beginnt — die Summe aller Monate davor in dieser Datei. Hier wird nichts fällig.'},
'month.tlCloseTip':{en:'Everything without a payday lands here: flexible items, the balance correction and items without a due day.',
  de:'Alles ohne Zahltag landet hier: flexible Posten, die Saldokorrektur und Posten ohne Fälligkeit.'},
/* Der Balken jeder Zeile: links der Nulllinie der Abzug, rechts
   die Zufuhr, eingefärbt nach Geldart — dieselben Farben wie die
   Karten der Monatsansicht. */
'month.tlMark':{en:'balance after the row',de:'Kontostand danach'},
/* Dieselbe Marke im Verlauf der Prognose — dort ist die Zeile ein
   Monat, deshalb der eigene Wortlaut (Mac-Redesign 4b). */
'prog.tlMark':{en:'balance at the end of the month',de:'Kontostand am Ende des Monats'},
/* Steht nur bei beschnittener Achse: dann fängt die Fläche nicht
   bei null an, und der erste Balken franst links aus. */
'month.tlScale':{en:'scale {0} - {1}',de:'Maßstab {0} - {1}'},
/* Die Tage einer Zeile: „1–10" · „1.–10." */
'month.tlDays':{en:'{0}–{1}',de:'{0}.–{1}.'},
/* Die Tage eines Abschnitts stehen seit dem Mac-Redesign nicht
   mehr neben dem Namen, sondern in seiner Sprechblase. */
'month.tlDaysTip':{en:'Days {0}–{1}',de:'Tage {0}.–{1}.'},
/* Die Marke an der Zeile, in die der heutige Tag fällt. Sie sagt
   „jetzt" und nicht „heute": bezeichnet wird der Abschnitt des
   Monats, in dem man gerade steht, nicht ein einzelner Tag. */
'month.tlNow':{en:'Now',de:'Jetzt'},

/* ── Saldokorrektur ───────────────────────────────────────────
   Eine einzige, feste Zeile über den Einnahmen. Sie wird wie ein
   regelmäßiger Posten gepflegt, aber wie eine Kategorie gezeigt
   und lässt sich nicht löschen. */
'bal.row':{en:'Balance Correction',de:'Balance Correction'},
'bal.tip':{en:'Manual correction of the balance — for inaccuracies that crept in somewhere over the months',
  de:'Manuelle Korrektur des Saldos — für Ungenauigkeiten, die sich über die Monate eingeschlichen haben'},
'bal.editTip':{en:'Edit balance correction',de:'Balance Correction ändern'},

/* ── Flexible (früher Kakeibo) ───────────────────── */
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
'kdlg.corrTip':{en:'Corrected by hand — the imported value was {0}',
  de:'Von Hand korrigiert — importiert war {0}'},
'kak.kImp':{en:'imported',de:'importiert'},
'kak.kCorr':{en:'corrected',de:'korrigiert'},
'kak.kDone':{en:'closed',de:'abgeschlossen'},
'kak.kFix':{en:'fixed',de:'fest'},
'kak.kEst':{en:'estimated',de:'geschätzt'},
'kak.period':{en:'Period',de:'Zeitraum'},
/* Der Weg zurück ins Jetzt, gleich hinter der Monatsauswahl. */
'kak.cur':{en:'Current month',de:'Laufender Monat'},
'kak.curTip':{en:'Show {0} — the current month',de:'{0} zeigen — den laufenden Monat'},
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
/* Die Erklärung der Marke „Art" — sie hängt als Sprechblase an der
   Marke selbst (kindTag in js/views/kakeibo.js) und nicht mehr als
   Absatz unter der Tabelle. Deshalb ohne Auszeichnung: eine
   Sprechblase ist Text und kein HTML (showTip in js/ui.js). */
'kak.kindTip':{en:'Where the number comes from: imported from Fast Budget · corrected — an imported month you overwrote by hand · closed — no import, but you ticked the month off · fixed — an amount you typed that is not marked as an estimate · estimated — still open and expected to change. Over a whole year the mark counts the months per kind; months without an amount are not counted.',
  de:'Woher der Betrag kommt: importiert aus Fast Budget · korrigiert — ein importierter Monat, den du von Hand überschrieben hast · abgeschlossen — kein Import, aber der Monat ist abgehakt · fest — ein eingetippter Betrag, der nicht als Schätzung markiert ist · geschätzt — noch offen und voraussichtlich veränderlich. Über ein ganzes Jahr zählt die Marke die Monate je Art; Monate ohne Betrag zählen nicht mit.'},
'kak.top':{en:'Largest single items',de:'Größte Einzelposten'},
/* Nur auf dem Telefon: dort hat die Ansicht keine rechte Karte —
   der Knopf öffnet die Buchungen als Fenster (openKakTx). */
'kak.showTx':{en:'Show transactions',de:'Transaktionen anzeigen'},
'kak.showTxTip':{en:'Opens the bookings of this period in a window of their own — the row arrows do the same for one category',
  de:'Öffnet die Buchungen dieses Zeitraums in einem eigenen Fenster — die Zeilenpfeile tun dasselbe für eine Kategorie'},
'kak.topSub':{en:'{0} · {1} bookings from {2}',de:'{0} · {1} Buchungen ab {2}'},
'kak.topNone':{en:'No booking reaches {0} in this period.',de:'Keine Buchung erreicht in diesem Zeitraum {0}.'},
'kak.arrowTip':{en:'Show the bookings of “{0}” on the right',de:'Buchungen von „{0}" rechts zeigen'},
'kak.manualSub':{en:'entered by hand / planned',de:'von Hand erfasst / geplant'},
/* Woher die Zahlen des Zeitraums stammen — beim ganzen Jahr die
   Liste der importierten Monate, bei einem einzelnen die Antwort
   ja oder nein. */
'kak.impYear':{en:'Fast Budget data imported for: {0}. The remaining {1} month(s) show the amounts you entered yourself.',
  de:'Fast-Budget-Daten importiert für: {0}. Die übrigen {1} Monate zeigen die Betr\u00e4ge, die du selbst eingetragen hast.'},
'kak.impYearNone':{en:'No month has Fast Budget data — every number below is one you entered yourself.',
  de:'Kein Monat hat Fast-Budget-Daten — jede Zahl unten stammt aus deiner eigenen Eingabe.'},
'kak.impMonth':{en:'{0} has imported data ({1}) — the numbers below are the real ones.',
  de:'F\u00fcr {0} liegen importierte Daten vor ({1}) — die Zahlen unten sind die echten.'},
'kak.impMonthNone':{en:'{0} has no imported data — the numbers below are the ones you entered yourself.',
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
'prog.kpiFixed':{en:'Regular from {0}',de:'Regulär ab {0}'},
'prog.kpiOpen':{en:'{0} of it still open',de:'davon {0} noch offen'},
'prog.kpiKak':{en:'Flexible expected from {0}',de:'Flexibel erwartet ab {0}'},
'prog.kpiPerMonth':{en:'{0} per month assumed',de:'{0} je Monat angenommen'},
'prog.kpiSoFar':{en:'Balance so far',de:'Saldo bisher'},
'prog.kpiSoFarSub':{en:'January to {0}',de:'Januar bis {0}'},
'prog.kpiSoFarNone':{en:'no month closed yet',de:'noch kein abgerechneter Monat'},
'prog.kpiEnd':{en:'Balance at year end',de:'Saldo zum Jahresende'},
'prog.kpiEndSub':{en:'all twelve months of {0}',de:'alle zwölf Monate {0}'},
'prog.colIncome':{en:'Income',de:'Einnahmen'},
'prog.colFixed':{en:'Regular',de:'Regelmäßig'},
'prog.colKak':{en:'Flexible',de:'Flexible'},
'prog.colBal':{en:'Correction',de:'Korrektur'},
'prog.colStart':{en:'Balance at the start of the month',de:'Kontostand zu Monatsbeginn'},
/* Die Spalte hieß bis 30.8.26 END. Der Kopf trägt seitdem PROG:
   über zwölf Zeilen gelesen ist die Spalte die Entwicklung der
   Finanzen über das Jahr, und „Ende" verwechselte sich mit der
   Schlusssumme des Monats, die daneben als SUM steht. Das Wort
   bleibt in beiden Sprachen englisch — wie „Fast Budget" und wie
   die Kürzel B · PT · DD · LP der Jahresmatrix. */
'prog.colEnd':{en:'Progress',de:'Progress'},
/* Die neue Spalte zwischen COR und PROG: wie der Monat
   abgeschlossen hat. Dieselbe Zahl wie „Saldo je Monat" in der
   Jahresmatrix und die Saldo-Kachel der Monatsansicht. */
'prog.colSum':{en:'Result of the month',de:'Ergebnis des Monats'},
'prog.colFlow':{en:'Course',de:'Verlauf'},
'prog.gridShort':{en:'grid',de:'Raster'},
/* Die Kopfzeile der Prognose trägt Kürzel (M · START · IN · REG ·
   FLEX · COR · END, in beiden Sprachen gleich). Was sie bedeuten,
   sagt die Sprechblase: voller Name aus den col*-Schlüsseln, dann
   dieser Satz. */
'prog.tipMonth':{en:'the twelve months of the file; months before the current one are shown pale.',
  de:'die zwölf Monate der Datei; die Monate vor dem laufenden stehen blass.'},
'prog.tipIncome':{en:'everything that comes in this month.',
  de:'alles, was in diesem Monat hereinkommt.'},
'prog.tipFixed':{en:'the regular costs of the month — bills that repeat.',
  de:'die regelmäßigen Kosten des Monats — Rechnungen, die wiederkehren.'},
'prog.tipKak':{en:'the flexible items of the month: imported where available, otherwise the assumption.',
  de:'die flexiblen Posten des Monats: importiert, wo vorhanden, sonst die Annahme.'},
'prog.tipBal':{en:'what you entered by hand to correct the balance. Usually empty. Double-click a month to change it.',
  de:'was du von Hand nachträgst, um den Saldo zu berichtigen. Meistens leer. Ein Doppelklick auf einen Monat ändert ihn.'},
'prog.tipStart':{en:'what is on the account before this month — the closing balance of the month above.',
  de:'was vor diesem Monat auf dem Konto liegt — der Schlussstand des Monats darüber.'},
'prog.tipEnd':{en:'the balance on the account at the end of this month. Read down the column it shows how your finances develop over the year — the same course the chart beside it draws. It is the starting balance of the next month, and in December the year-end balance.',
  de:'der Kontostand am Ende dieses Monats. Von oben nach unten gelesen zeigt die Spalte die allgemeine Entwicklung deiner Finanzen über das Jahr — denselben Verlauf, den die Grafik daneben zeichnet. Es ist zugleich der Anfangsstand des nächsten Monats, im Dezember der Stand zum Jahresende.'},
'prog.tipSum':{en:'everything the month brings in and everything it costs, added up — the four movements to the left. It shows how the month closed, and it is the difference between START and PROG in this row.',
  de:'alles, was der Monat bringt, und alles, was er kostet, zusammengerechnet — die vier Bewegungen links davon. Sie zeigt, wie der Monat abgeschlossen hat, und ist der Unterschied zwischen START und PROG in dieser Zeile.'},
/* Die Zeile über dem Januar: der Anfangsbestand steht in den
   Einstellungen, weil er keinem Monat gehört. Der Satz sagt den Weg
   dorthin — er ist der einzige Hinweis darauf, dass diese Zahl
   anfassbar ist. */
'prog.openEdit':{en:'The balance before January. It lives in the settings, because it belongs to no month — double-click to change it there.',
  de:'Der Kontostand vor dem Januar. Er steht in den Einstellungen, weil er zu keinem Monat gehört — ein Doppelklick öffnet ihn dort.'},
'prog.colFlowTip':{en:'How the balance moves through the year: each month starts at the previous month’s balance and ends at its own. The colours are the kinds of money.',
  de:'Wie sich der Kontostand durch das Jahr bewegt: jeder Monat fängt beim Stand des Monats davor an und endet bei seinem eigenen. Die Farben sind die Geldarten.'},
'prog.card':{en:'Flexible: assumption per month',de:'Flexibel: Annahme je Monat'},
'prog.cardHint':{en:'For months without a Fast Budget import the app does not know the real Flexible spending. These values tell it what to expect per category. Actual numbers exist for: {0}.',
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
'prog.noCats':{en:'No flexible items yet.',de:'Noch keine flexiblen Posten angelegt.'},
/* Die Annahme wird hier nur noch gezeigt, nicht getippt: geändert
   wird sie im Fenster der Kategorie oder in einem Zug über den
   Knopf darunter. */
'prog.colCurrentTip':{en:'What the projection calculates with in the current month. Change it in the category window (pencil or double-click) or with the button below.',
  de:'Womit die Hochrechnung im laufenden Monat rechnet. Ändern lässt es sich im Fenster der Kategorie (Stift oder Doppelklick) oder mit dem Knopf darunter.'},
/* Statt eines Knopfes eine Erklärung unter der Tabelle: beide
   Spalten sind gerechnet, und wer sie liest, soll wissen, woher
   sie kommen. Übernommen wird von hier aus nichts. */
'prog.howCurrent':{en:'the amount this category plans for {0}. The projection uses each month its own planned amount — for months with a Fast Budget import it uses the imported number instead, and a correction beats both.',
  de:'der Betrag, den diese Kategorie für {0} vorsieht. Die Hochrechnung nimmt je Monat dessen eigenen Planwert — in Monaten mit Fast-Budget-Import stattdessen den importierten, und eine Korrektur schlägt beides.'},
'prog.howAvg':{en:'the average of this category over every month of this year whose value is settled: imported, corrected, ticked off, or entered as a fixed amount. A month that only carries an estimate is left out, otherwise the average would be averaging its own guess. Without a settled month there is no average, and a dash stands there.',
  de:'der Durchschnitt dieser Kategorie über jeden Monat dieses Jahres, dessen Wert feststeht: importiert, korrigiert, abgehakt oder als fester Betrag eingetragen. Ein Monat, in dem nur eine Schätzung steht, bleibt außen vor — sonst mittelte der Durchschnitt seine eigene Vermutung. Ohne feststehenden Monat gibt es keinen Durchschnitt, dann steht dort ein Strich.'},

/* ── Posten-Fenster ───────────────────────────────────────── */
'item.add':{en:'Add item',de:'Posten hinzufügen'},
'item.name':{en:'Name',de:'Name'},
'item.namePh':{en:'e.g. Netflix',de:'z. B. Netflix'},
/* Wie bei den Flexible: die Bezeichnung wird über die
   Überschrift geöffnet, nicht in einem Feld getippt. */
'item.nameBtnTip':{en:'Click to change the name',de:'Zum Ändern der Bezeichnung klicken'},
'item.namePick':{en:'— choose a name —',de:'— Bezeichnung wählen —'},
'item.nameTitle':{en:'Name of the item',de:'Bezeichnung des Postens'},
'item.nameSub':{en:'Under this name the item appears in every view. Nothing is written until you save the item.',
  de:'Unter dieser Bezeichnung steht der Posten in allen Ansichten. Geschrieben wird erst, wenn du den Posten speicherst.'},
'item.block':{en:'Block',de:'Block'},
/* Ein neuer Posten kommt ohne Block — er wird gewählt, nicht
   vorgegeben. Gespeichert wird erst mit. */
'item.blockPick':{en:'— please choose —',de:'— bitte wählen —'},
'item.needBlock':{en:'Please choose a block. Every item belongs to one — new blocks are created under Settings.',
  de:'Bitte wähle einen Block. Jede Position gehört in einen — neue Blöcke legst du in den Einstellungen an.'},
'item.bank':{en:'Bank (B)',de:'Bank (B)'},
'item.pay':{en:'Payment type (PT)',de:'Zahlungsart (PT)'},
'item.due':{en:'Due date (DD)',de:'Fälligkeit (DD)'},
'item.endM':{en:'Last payment (LP) — month',de:'Letzte Zahlung (LP) — Monat'},
'item.endY':{en:'Last payment (LP) — year',de:'Letzte Zahlung (LP) — Jahr'},
/* ── Zugehörige Links ─────────────────────────────────────────
   Eine Position kann mehrere tragen: Vertrag, Rechnung,
   Kundenkonto. Der Name ist freiwillig — ohne ihn steht die
   Adresse selbst da. */
'item.links':{en:'Associated links',de:'Zugehörige Links'},
'link.add':{en:'Add link',de:'Link hinzufügen'},
'link.addTip':{en:'Add another link to this entry',de:'Diesem Eintrag einen weiteren Link hinzufügen'},
'link.edit':{en:'Edit link',de:'Link ändern'},
'link.editTip':{en:'Change name and address',de:'Name und Adresse ändern'},
'link.sub':{en:'Every link needs a name — it is what you will see later. It fills itself from the address; overwrite it as you like.',
  de:'Jeder Link braucht einen Namen — er ist das, was du später siehst. Er füllt sich aus der Adresse; überschreib ihn, wie du magst.'},
'link.nameEmpty':{en:'Please give the link a name.',de:'Bitte gib dem Link einen Namen.'},
'link.name':{en:'Shown as',de:'Angezeigter Name'},
'link.namePh':{en:'e.g. Contract, Invoice, Customer account',de:'z. B. Vertrag, Rechnung, Kundenkonto'},
'link.url':{en:'Web address',de:'Webseite'},
'link.urlEmpty':{en:'Please enter a web address.',de:'Bitte gib eine Webseite ein.'},
'link.urlBad':{en:'Only web addresses (http, https) and mailto are allowed.',
  de:'Erlaubt sind nur Webadressen (http, https) und mailto.'},
'link.blocked':{en:'This address is not opened \u2014 only web addresses and mailto are allowed.',
  de:'Diese Adresse wird nicht ge\u00f6ffnet \u2014 erlaubt sind nur Webadressen und mailto.'},
'link.del':{en:'Delete link',de:'Link löschen'},
'link.delTip':{en:'Delete this link',de:'Diesen Link löschen'},
'link.delAsk':{en:'Delete the link “{0}”?',de:'Den Link „{0}" wirklich löschen?'},
'link.max':{en:'At most {0} links per entry.',de:'Höchstens {0} Links je Eintrag.'},
'link.title':{en:'Associated links',de:'Zugehörige Links'},
'link.pick':{en:'Show links',de:'Links anzeigen'},
'link.pickTip':{en:'{0} links — click to choose',de:'{0} Links — zum Auswählen klicken'},
'item.est':{en:'Amount is estimated and may differ — shown in yellow with a question mark',
  de:'Summe ist geschätzt und kann abweichen — wird gelb mit Fragezeichen dargestellt'},
/* Über der Reihe der Auswahllisten: ein Weg je Liste in den Bereich
   der Einstellungen, in dem sie gepflegt wird. Die Wege selbst
   heißen wie die Bereiche dort (set.groups · set.banks · set.pays ·
   set.kak) — wer klickt, findet dieselbe Überschrift wieder. */
'item.listsIn':{en:'Edit in settings:',de:'In den Einstellungen ändern:'},
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
'item.impLockedTip':{en:'imported from CSV — the amount came from the file and cannot be changed here; delete the import data to release it',
  de:'aus CSV importiert — der Betrag kam aus der Datei und lässt sich hier nicht ändern; zum Freigeben die Importdaten löschen'},
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

/* ── Beträge einer flexiblen Posten ────────────── */
'kdlg.est':{en:'Amount is estimated and may differ — shown in yellow with a question mark',
  de:'Summe ist geschätzt und kann abweichen — wird orange mit Fragezeichen dargestellt'},
'kdlg.quick':{en:'Quick entry — every month',de:'Schnelle Eingabe — jeden Monat'},
'kdlg.perMonth':{en:'Amount per month — expenses with a minus',de:'Betrag je Monat — Ausgaben mit Minus'},
'kdlg.gone':{en:'This flexible item no longer exists.',de:'Diesen flexiblen Posten gibt es nicht mehr.'},
'kdlg.cat':{en:'Category',de:'Kategorie'},
'kdlg.lockedTip':{en:'recorded — remove the tick to change the amount',de:'erfasst — Haken entfernen, um den Betrag zu ändern'},
'kdlg.lockTill':{en:'Close all months up to {0}',de:'Alle Monate bis {0} abschließen'},
'kdlg.lockTillTip':{en:'Marks every month up to and including {0} as recorded — everything that is over. The current month stays open, and imported months are left alone.',
  de:'Markiert jeden Monat bis einschließlich {0} als erfasst — alles, was vorbei ist. Der laufende Monat bleibt offen, importierte Monate bleiben unberührt.'},
'kdlg.unlockAllTip':{en:'Removes every tick you set yourself so those amounts can be changed again. Imported months are left alone.',
  de:'Entfernt alle selbst gesetzten Haken, damit sich diese Beträge wieder ändern lassen. Importierte Monate bleiben unberührt.'},
'kdlg.namePh':{en:'e.g. Groceries',de:'z. B. Lebensmittel'},
/* Die Bezeichnung wird nicht mehr in einem Feld neben dem Link
   getippt, sondern über die Überschrift geöffnet — sie ist der
   Schlüssel der Kategorie und keine Angabe unter vielen. */
'kdlg.nameBtnTip':{en:'Click to change the name',de:'Zum Ändern der Bezeichnung klicken'},
'kdlg.namePick':{en:'— choose a name —',de:'— Bezeichnung wählen —'},
'kdlg.nameTitle':{en:'Name of the item',de:'Bezeichnung des Postens'},
'kdlg.nameSubNew':{en:'Under this name the item appears in every view. You can change it later at any time.',
  de:'Unter dieser Bezeichnung steht der Posten in allen Ansichten. Ändern lässt sie sich später jederzeit.'},
'kdlg.nameSub':{en:'Renaming carries everything along — planned and actual amounts, corrections, notes and imported bookings. Nothing is written until you save the item.',
  de:'Beim Umbenennen wandert alles mit — Plan- und Ist-Werte, Korrekturen, Notizen und importierte Buchungen. Geschrieben wird erst, wenn du den Posten speicherst.'},
/* Über der Schnelleingabe: der Mittelwert der Monate, die schon
   feststehen. Er steht dort, weil man genau dort die Annahme für
   die kommenden Monate einträgt. */
'kdlg.avgTill':{en:'Average per month to {0}: {1}',de:'Mittelwert pro Monat bis {0}: {1}'},
'kdlg.avgNone':{en:'no closed month yet — no average',de:'noch kein abgeschlossener Monat — kein Mittelwert'},
'kdlg.avgTip':{en:'Average of the months that are settled — closed by tick or imported, up to the current month. Typing in a month changes it straight away.',
  de:'Durchschnitt der feststehenden Monate — abgehakt oder importiert, bis zum laufenden Monat. Ein Eintrag in einem Monat ändert ihn sofort.'},
'kdlg.dupTip':{en:'Opens a copy of this item — amounts included, ticks and notes removed. The copy is created when you press Save; this item stays as it is.',
  de:'Öffnet eine Kopie dieses Postens — mit den Beträgen, ohne Haken und ohne Notizen. Angelegt wird die Kopie erst mit „Speichern"; dieser Posten bleibt, wie er ist.'},
'kdlg.dupTitle':{en:'Duplicate item',de:'Posten duplizieren'},
'kdlg.del':{en:'Delete item',de:'Posten l\u00f6schen'},
'kdlg.delAsk':{en:'Delete “{0}”? Plan values, actual values, corrections and notes of this item go with it. This can only be undone from a saved file.',
  de:'\u201e{0}\u201c l\u00f6schen? Plan- und Ist-Werte, Korrekturen und Notizen dieses Postens gehen mit. Das l\u00e4sst sich nur \u00fcber eine gespeicherte Datei r\u00fcckg\u00e4ngig machen.'},
'kdlg.delAskTx':{en:'{0} imported booking(s) are deleted as well.',de:'Dazu werden {0} importierte Buchungen gel\u00f6scht.'},
'kdlg.deleted':{en:'“{0}” deleted.',de:'\u201e{0}\u201c gel\u00f6scht.'},

/* ── Einstellungen ────────────────────────────────────────── */
'set.title':{en:'Settings',de:'Einstellungen'},
'set.sub':{en:'Everything here is stored in your local database (the JSON file): language, accounting year, column widths and the lists. It decides how the app looks when you load it.',
  de:'Alles hier steht in deiner lokalen Datenbank (der JSON-Datei): Sprache, Abrechnungsjahr, Spaltenbreiten und die Listen. Beim Laden richtet sich die Anwendung danach.'},
/* Das Fenster ist in Bereiche geteilt: links das Menü, rechts
   der gewählte Bereich. Die Menüpunkte sind zugleich seine
   Überschrift. */
'set.navLabel':{en:'Settings sections',de:'Bereiche der Einstellungen'},
/* Die beiden Schrittknöpfe neben der Aufklappliste, die im
   schmalen Fenster das Menü links ersetzt (.setnavdrop). */
'set.prevPane':{en:'Previous section',de:'Voriger Bereich'},
'set.nextPane':{en:'Next section',de:'Nächster Bereich'},
'set.navGeneral':{en:'General',de:'Allgemein'},
'set.navView':{en:'Appearance',de:'Darstellung'},
/* Der Bereich „Filter": worin der Suchbegriff sucht — bis 23.8.26
   ein eigenes Fenster, jetzt hier. Überschrift und Sätze des
   Bereichs sind die flt.*-Schlüssel weiter oben. */
'set.navFilter':{en:'Filter',de:'Filter'},
'set.navBanks':{en:'Banks & payment types',de:'Banken & Zahlungsarten'},
'set.navImport':{en:'Import',de:'Import'},
'set.generalSub':{en:'Language of the interface, the year this household book is kept for, and the balance it starts from. All three travel in the file — when you load it, the app follows the file.',
  de:'Sprache der Oberfläche, das Jahr, für das dieses Haushaltsbuch geführt wird, und der Stand, mit dem es anfängt. Alle drei stehen in der Datei — beim Laden richtet sich die Anwendung nach ihr.'},
'set.viewSub':{en:'How wide the year matrix is drawn, from which amount a booking counts as a large single item, and what the month and year views look like when you open a file.',
  de:'Wie breit die Jahresmatrix gezeichnet wird, ab welchem Betrag eine Buchung als großer Einzelposten gilt, und wie Monat und Jahr aussehen, wenn du eine Datei öffnest.'},
'set.banksSub':{en:'The code appears in the year overview in columns B and PT, the label below each item in the month view. Both lists are yours alone — name them the way you think of your accounts. Change a code later and FINA asks whether the items that carry it should be moved along.',
  de:'Das Kürzel steht in der Jahresübersicht in den Spalten B und PT, die Bezeichnung unter jedem Posten der Monatsansicht. Beide Listen gehören dir allein — benenne sie so, wie du an deine Konten denkst. Änderst du später ein Kürzel, fragt FINA, ob die Posten mit diesem Kürzel mitwandern sollen.'},
'set.groupsSub':{en:'Three lists — Income, Flexible, Regular — and every item belongs to exactly one of them. Each list always keeps its “N/A” entry: items without a category are listed under it; it can be moved, but not renamed or deleted. A name may appear only once across the lists — it is what tells FINA whether an item is money coming in or going out. Renaming carries every item along; removing moves them into “N/A” of the same list.',
  de:'Drei Listen — Einnahmen, Flexibel, Regulär —, und jeder Posten gehört in genau eine davon. Jede Liste behält immer ihr „N/A": darunter stehen die Posten ohne Kategorie; verschieben ja, umbenennen und löschen nein. Ein Name darf über die Listen hinweg nur einmal vorkommen — an ihm erkennt FINA, ob ein Posten Geld bringt oder kostet. Umbenennen zieht alle Posten mit; Entfernen schiebt sie nach „N/A" derselben Liste.'},
'set.kakSub':{en:'Your flexible items — the everyday spending, one row each in the year overview and in the Import Details view. Renaming carries plan values, actual values, corrections and imported bookings along. The order here is the order everywhere. Their categories are kept under “Categories”.',
  de:'Deine flexiblen Posten — die alltäglichen Ausgaben, je eine Zeile in der Jahresübersicht und in der Ansicht Import Details. Beim Umbenennen wandern Planwerte, Ist-Werte, Korrekturen und importierte Buchungen mit. Die Reihenfolge hier gilt überall. Ihre Kategorien stehen unter „Kategorien".'},
/* Der Bereich „Import". Beide Wege kommen von außen herein und
   ändern die Datei — deshalb stehen sie beieinander und nicht
   mehr in der Kopfzeile, wo sie zwischen Laden und Speichern
   standen. */
/* Der Bereich „Import" sagt nur noch das Nötigste (5.9.26 spät): ein
   Satz unter der Überschrift, und was ein Knopf tut, steht in seiner
   Sprechblase — die drei „…Hint" sind seitdem data-tip, keine
   Absätze. */
'set.importSub':{en:'Importing starts from the menu (“CSV import”). What an import learns — column structures and import criteria — is remembered in this file.',
  de:'Importiert wird über das Menü („CSV-Import“). Was ein Import lernt — Spaltenstrukturen und Importkriterien — merkt sich diese Datei.'},
'set.impFastHint':{en:'Reads any CSV — bank statement, card export, budget app.',
  de:'Liest jede CSV — Kontoauszug, Kartenexport, Haushalts-App.'},
'set.impCrit':{en:'Manage all remembered import criteria',de:'Alle gemerkten Importkriterien verwalten'},
'set.impSecCsv':{en:'Import CSV data',de:'CSV-Daten importieren'},
'set.impSecCrit':{en:'Import criteria',de:'Importkriterien'},
'set.impSecMaps':{en:'Remembered CSV structure mapping',de:'Gemerkte CSV-Strukturen (Spalte → Feld)'},
'set.impSheetHint':{en:'Brings a whole year in from the FINA spreadsheet — it replaces the book in this file.',
  de:'Holt ein ganzes Jahr aus der FINA-Tabelle herein — es ersetzt das Buch in dieser Datei.'},
'set.impWipe':{en:'Delete all imported data',de:'Alle importierten Daten löschen'},
'set.impWipeHint':{en:'Empties and reopens every imported month, removes imported transactions. CSV structures stay.',
  de:'Leert und öffnet jeden importierten Monat, nimmt importierte Buchungen weg. CSV-Strukturen bleiben.'},
'set.impWipeAsk':{en:'Delete all imported data? {0} imported month value(s) of regular items and {1} transaction(s) of the flexible items in {2} month(s) will be removed. This cannot be undone — then “Save data”.',
  de:'Alle importierten Daten löschen? {0} importierte Monatsbeträge regulärer Posten und {1} Buchungen der flexiblen Posten in {2} Monat(en) werden entfernt. Das lässt sich nicht rückgängig machen — danach „Daten speichern“.'},
'set.impWipeDone':{en:'Imported data deleted: {0} month value(s), {1} transaction(s). Then “Save data”.',
  de:'Importierte Daten gelöscht: {0} Monatsbeträge, {1} Buchungen. Danach „Daten speichern“.'},
'set.csvMaps':{en:'Remembered CSV structures',de:'Gemerkte CSV-Strukturen'},
'set.csvMapsNone':{en:'Nothing remembered yet.',de:'Noch nichts gemerkt.'},
'set.csvMapName':{en:'Name',de:'Bezeichnung'},
'set.csvMapEdit':{en:'Open the CSV structure — change which column holds which FINA field, or delete it',
  de:'Die CSV-Struktur ändern — welche Spalte welches FINA-Feld trägt'},
/* Das Fenster hinter dem Stift (openCsvStructure) — in den
   Einstellungen und im ersten Schritt des Imports. */
'cs.title':{en:'CSV structure',de:'CSV-Struktur'},
'cs.need':{en:'Date and Amount need a column.',de:'Datum und Betrag brauchen eine Spalte.'},
'cs.saved':{en:'CSV structure saved. Then “Save data”.',de:'CSV-Struktur gespeichert. Danach „Daten speichern“.'},
'cs.del':{en:'Delete this structure from FINA',de:'Diese Struktur aus FINA löschen'},
'set.csvMapMeta':{en:'remembered on {0}',de:'gemerkt am {0}'},
'set.leaveSave':{en:'Save your settings changes before the import opens? Cancel discards them — the import replaces lists anyway, so the window has to close.',
  de:'Deine Änderungen in den Einstellungen speichern, bevor der Import aufgeht? „Abbrechen" verwirft sie — der Import legt selbst Listen an, deshalb muss das Fenster schließen.'},
'set.csvMapDel':{en:'Forget this CSV structure',de:'Diese CSV-Struktur vergessen'},
'cme.title':{en:'Import criteria',de:'Importkriterien'},
/* Kurz und ohne Einschub (5.9.26 spät): welche Posten gezeigt werden,
   sagen die Überschriften im Fenster. */
'cme.sub':{en:'Which rows of a file go to which entry. A rule catches a row when all its conditions hold. The first rule that matches wins.',
  de:'Welche Zeilen einer Datei zu welchem Posten gehen. Eine Regel greift, wenn alle ihre Bedingungen zutreffen. Die erste Regel, die trifft, gewinnt.'},
'cme.assigns':{en:'Goes to',de:'Geht an'},
'cme.rules':{en:'{0} rule(s)',de:'{0} Regel(n)'},
'cme.val':{en:'Value',de:'Wert'},
'cme.addTerm':{en:'+ Condition',de:'+ Bedingung'},
'cme.delTerm':{en:'Remove condition',de:'Bedingung entfernen'},
'cme.delRule':{en:'Delete this rule',de:'Diese Regel löschen'},
'cme.keepOne':{en:'A rule needs at least one condition — without one it would catch every row.',
  de:'Eine Regel braucht mindestens eine Bedingung — ohne sie träfe sie jede Zeile.'},
'cme.needVal':{en:'Every condition needs a value.',de:'Jede Bedingung braucht einen Wert.'},
'cme.none':{en:'No entry has import criteria yet — they arise in the CSV import with “Assign and remember”.',
  de:'Noch kein Posten hat Importkriterien — sie entstehen im CSV-Import mit „Zuordnen und merken“.'},
'cme.saved':{en:'Import criteria saved. Then “Save data”.',de:'Importkriterien gespeichert. Danach „Daten speichern“.'},
'cme.gone':{en:'No rule left — “Save” removes them from the entries.',de:'Keine Regel mehr — „Speichern“ nimmt sie von den Posten.'},
'set.csvMapDelAsk':{en:'Forget the remembered CSV structure “{0}”? The next import of this file type starts at the columns again. The import criteria stay with your entries, amounts already imported stay too.',
  de:'Die gemerkte CSV-Struktur „{0}“ vergessen? Der nächste Import dieser Datei-Art fängt wieder bei den Spalten an. Die Importkriterien bleiben an den Posten, schon importierte Beträge bleiben auch.'},
'set.lang':{en:'Interface language',de:'Sprache der Oberfläche'},
'set.year':{en:'Accounting year',de:'Abrechnungsjahr'},
'set.yearHint':{en:'Changing the year changes only the labelling — the twelve months keep their amounts.',
  de:'Das Jahr zu ändern ändert nur die Beschriftung — die zwölf Monate behalten ihre Beträge.'},
/* Der Anfangsbestand. „Opening balance" ist der eingeführte
   Begriff; im Deutschen heißt er hier Anfangsbestand, weil
   „Eröffnungssaldo" nach Buchhaltung klingt und dies ein
   Haushaltsbuch ist. */
'set.opening':{en:'Opening balance',de:'Anfangsbestand'},
'set.openingHint':{en:'What was in your account before January — every balance in FINA counts up from here. Leave it empty and the year starts at zero; a minus sign is allowed.',
  de:'Was vor dem Januar auf deinem Konto lag — jeder Kontostand in FINA zählt von hier aus weiter. Leer heißt: das Jahr fängt bei null an; ein Minus ist erlaubt.'},
/* Der Haken für die Frage nach einer neueren Fassung. Er nennt
   die Adresse, weil FINA sonst nichts abruft — was einmal im Netz
   nachschlägt, soll auch sagen, wo. */
'set.upd':{en:'Tell me about new versions',de:'Auf neue Versionen hinweisen'},
'set.updHint':{en:'Only in the Mac and Windows app: at start it asks linked2ag.github.io which version is current. It sends nothing — the browser version is always the current one anyway.',
  de:'Nur in der Mac- und der Windows-App: beim Start wird bei linked2ag.github.io nachgefragt, welche Fassung aktuell ist. Gesendet wird dabei nichts — die Fassung im Browser ist ohnehin immer die neueste.'},
/* Der Haken für die Auswertung der Monatsansicht. Er ist die
   Vorgabe fürs Öffnen und kein Schalter — das steht im Satz
   daneben, sonst suchte man den Weg zum Zuklappen hier. */
'set.ana':{en:'Open the month with its analytics',de:'Monat mit aufgeklappter Auswertung öffnen'},
'set.anaHint':{en:'Applies when a file is opened. A click on the analytics line opens and closes it as always — that choice holds until you close the file.',
  de:'Gilt beim Öffnen einer Datei. Ein Klick auf die Auswertungszeile klappt sie wie immer auf und zu — diese Wahl gilt, bis die Datei geschlossen wird.'},
/* Der zweite Haken derselben Art: er sagt, womit die Jahresansicht
   aufgeht. Der Knopf in ihrer Leiste gilt danach nur der Sitzung
   und schreibt hier nichts zurück. */
'set.hideDone':{en:'Open the year with completed months hidden',
  de:'Jahr mit ausgeblendeten abgeschlossenen Monaten öffnen'},
'set.hideDoneHint':{en:'Applies when a file is opened. The button in the year view hides and shows them as always — that choice holds until you close the file.',
  de:'Gilt beim Öffnen einer Datei. Der Knopf in der Jahresansicht blendet sie wie immer aus und wieder ein — diese Wahl gilt, bis die Datei geschlossen wird.'},
/* Der dritte Haken derselben Art: ob die Anleitung sich dazustellt.
   Sie tut es an zwei Stellen — neben der Ansicht und neben den
   Schritten des CSV-Imports —, und der Satz daneben sagt beides. */
'set.guide':{en:'Open the guide alongside',de:'Anleitung mit aufschlagen'},
'set.guideHint':{en:'Applies when a file is opened, and to the guide beside the CSV import. The button “Guide” opens and closes it as always — that choice holds until you close the file.',
  de:'Gilt beim Öffnen einer Datei und für die Anleitung neben dem CSV-Import. Der Knopf „Anleitung" klappt sie wie immer auf und zu — diese Wahl gilt, bis die Datei geschlossen wird.'},
'set.labw':{en:'Item column',de:'Positionsspalte'},
'set.monw':{en:'Month columns',de:'Monatsspalten'},
'set.widthHint':{en:'Widths of the year matrix in pixels, 50 to 800.',de:'Breiten der Jahresmatrix in Pixel, 50 bis 800.'},
'set.topmin':{en:'Largest items from (€)',de:'Größte Einzelposten ab (€)'},
'set.topminHint':{en:'The Import Details view lists every booking from this amount upwards; 0 shows them all.',
  de:'Die Ansicht Import Details listet jede Buchung ab diesem Betrag; 0 zeigt alle.'},
'set.banks':{en:'Banks (B)',de:'Banken (B)'},
'set.pays':{en:'Payment types (PT)',de:'Zahlungsarten (PT)'},
'set.groups':{en:'Categories',de:'Kategorien'},
'set.kak':{en:'Flexible items',de:'Flexible Posten'},
'set.addBank':{en:'Add bank',de:'Bank hinzufügen'},
'set.addPay':{en:'Add payment type',de:'Zahlungsart hinzufügen'},
'set.addGroup':{en:'Add category',de:'Kategorie hinzufügen'},
'set.groupsIn':{en:'Income categories',de:'Einnahme-Kategorien'},
'set.groupsOut':{en:'Regular categories',de:'Reguläre Kategorien'},
'set.groupsFlex':{en:'Flexible categories',de:'Flexible Kategorien'},
'set.addGroupFlex':{en:'+ flexible category',de:'+ flexible Kategorie'},
'set.noCatTip':{en:'Always there: items without a category are listed under it. It can be moved, but not renamed or deleted.',
  de:'Steht immer da: Posten ohne Kategorie stehen darunter. Verschieben ja — umbenennen und löschen nein.'},
'set.addGroupIn':{en:'+ income category',de:'+ Einnahme-Kategorie'},
'set.addKak':{en:'Add flexible item',de:'Flexiblen Posten hinzufügen'},
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
'set.dropKakAsk':{en:'Remove “{0}”? Plan and actual values, corrections and notes of this item will be deleted{1}. This can only be undone from a saved file.',
  de:'„{0}" entfernen? Plan- und Ist-Werte, Korrekturen und Notizen dieses Postens werden gelöscht{1}. Das lässt sich nur über eine gespeicherte Datei rückgängig machen.'},
'set.dropKakTx':{en:', together with {0} imported booking(s)',de:', dazu {0} importierte Buchungen'},
'set.saved':{en:'Settings saved.',de:'Einstellungen gespeichert.'},

/* ── CSV-Import ───────────────────────────────────────────── */
/* Das Fenster vor dem Fenster: woher die Datei kommt und welche
   Spalten darin stehen müssen. Es steht vor der Dateiauswahl —
   wer erst im Fehlerfall erfährt, dass eine Spalte fehlt, hat die
   (Die Schlüssel des alten Fast-Budget-Imports sind seit 6.9.26
   spät weg — samt js/csv.js und js/dialogs/csv-import.js.) */

/* ── Import einer FINA-Tabelle ────────────────────────────────
   (Der Tabellenimport — js/sheet.js, js/dialogs/sheet-import.js —
   ist seit 6.9.26 spät weg, seine Schlüssel mit ihm.) */
'shInfo.title':{en:'Import a FINA table (CSV)',de:'FINA-Tabelle einlesen (CSV)'},
'sheet.ok':{en:'MATCHES',de:'STIMMT'},
'sheet.off':{en:'DIFFERS',de:'WEICHT AB'},

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
'end.tip':{en:'last payment {0}',de:'letzte Zahlung {0}'},

/* ── Die Umfrage (Pilot) ──────────────────────────────────────
   Gefragt wird in FINA selbst — kein fremdes Formular, keine
   fremde Seite. Der Hinweissatz sagt vor dem Absenden, was in der
   eigenen Datei landet: Nummer, Status, Datum — sonst nichts. */
'srv.open':{en:'Survey',de:'Umfrage'},
'srv.openTip':{en:'A few short questions \u2014 one minute, and this button is gone',
  de:'Ein paar kurze Fragen \u2014 eine Minute, und dieser Knopf ist weg'},
'srv.title':{en:'A few questions',de:'Ein paar Fragen'},
'srv.sub':{en:'Your answers help to build FINA further. Only what you fill in here is sent \u2014 nothing else from your book.',
  de:'Deine Antworten helfen dabei, FINA weiterzubauen. Abgeschickt wird nur, was du hier ausf\u00fcllst \u2014 sonst nichts aus deinem Buch.'},
/* Die beiden Zeilen unter den Fragen. Die erste ist rot, weil sie
   das Einzige nennt, was danach noch zu tun ist; die zweite ist
   eine Auskunft und keine Aufforderung. Beide sagen grob, was
   passiert — nicht, wie es in der Datei aussieht. */
'srv.save':{en:'So this question does not come back: please save your file afterwards.',
  de:'Damit diese Frage nicht wiederkommt: bitte danach deine Datei speichern.'},
'srv.note':{en:'Your FINA file then only notes that you answered this survey. What you answered is not stored in it.',
  de:'In deiner FINA-Datei steht danach nur, dass du diese Umfrage beantwortet hast. Der Inhalt der Umfrage wird darin nicht gespeichert.'},
'srv.send':{en:'Send',de:'Absenden'},
'srv.later':{en:'Later',de:'Sp\u00e4ter'},
'srv.sending':{en:'Sending\u2026',de:'Wird abgeschickt\u2026'},
'srv.ok':{en:'Thank you! Your answers arrived. Remember to save your file.',
  de:'Danke! Deine Antworten sind angekommen. Denk ans Speichern.'},
'srv.failNet':{en:'Sending failed \u2014 the server did not answer. Nothing was noted; the survey stays open and comes back later.',
  de:'Das Absenden hat nicht geklappt \u2014 der Server hat nicht geantwortet. Vermerkt wurde nichts; die Umfrage bleibt offen und kommt sp\u00e4ter wieder.'},
'srv.needOne':{en:'Please answer at least one question.',de:'Bitte beantworte wenigstens eine Frage.'},

/* ── CSV-Import (der generische Wizard, js/dialogs/csv2-wizard.js) ── */
/* ── CSV-Import: Ergänzungen vom 5.9.26 ────────────────────────
   Betragsvergleich, Anweisung in Schritt 2, Griff zwischen den
   Flächen, Doppelklick auf eine Filterzeile, „Suchen nach Betrag",
   das Wahl-Fenster der gemerkten Zuordnung. */
'c2.opAmt':{en:'Amount is one of',de:'Betrag ist einer von'},
'c2.opAmtS':{en:'amount:',de:'Betrag:'},
/* Statt der drei Schritte im Fenster (bis 9.9.26 `c2.how1`…`how3`,
   samt `c2.colsCnt` und `c2.preview` — alle vier sind heraus, die
   Anleitung daneben sagt es ausführlicher): ein Satz in der
   Akzentfarbe, der genau dorthin zeigt. {0} ist der Name des
   Knopfes, mit dem sie aufgeht — steht dort ein anderes Wort,
   wandert es mit. */
'c2.howGuide':{en:'How this step works is explained in “{0}”.',
  de:'Wie dieser Schritt geht, steht in „{0}“.'},
/* Was die Datei hergibt, in einer Zeile und ohne Umbruch (Lex,
   9.9.26): die Spalten, die eine Überschrift tragen, und die
   Zeilen, die eingelesen werden können. */
'c2.avail':{en:'{0} columns with a header · {1} rows to read in',
  de:'{0} Spalten mit Überschrift · {1} Zeilen zum Einlesen'},
'c2.splitTip':{en:'Drag to change how the two areas share the height · double-click: half and half',
  de:'Ziehen ändert die Aufteilung der beiden Flächen · Doppelklick: halb/halb'},
'c2.chipEditTip':{en:'Double-click: back into the field to adjust',de:'Doppelklick: zurück ins Feld zum Anpassen'},
'c2.mnCritQ':{en:'Search by remembered criteria',de:'Suchen nach gemerkten Kriterien'},
'c2.mnApplyCritTip':{en:'{0} remembered rule(s) for this entry — currently match {1} free row(s)',
  de:'{0} gemerkte Regel(n) für diesen Posten — treffen gerade {1} freie Zeile(n)'},
'c2.mnApplyCritNone':{en:'The remembered rules for this entry match no free row right now',
  de:'Die gemerkten Regeln für diesen Posten treffen gerade keine freie Zeile'},
'c2.mnAmt':{en:'Search by amount',de:'Suchen nach Betrag'},
'c2.mnAmtTip':{en:'Writes the amount this entry has in the book into the quick filter ({0} different one(s) — the most frequent is taken)',
  de:'Schreibt den Betrag, den dieser Posten im Buch führt, in den Schnellfilter ({0} verschiedene — genommen wird der häufigste)'},
'c2.mnAmtNone':{en:'This entry has no amounts in the book yet',de:'Dieser Posten führt im Buch noch keine Beträge'},
/* Das Wahl-Fenster der gemerkten Kriterien (umgebaut 6.9.26): vier
   Sätze oben, die sagen, was hier geschieht; unter jedem Posten
   seine Zeilen als Tabelle; der Stift am Posten. */
'c2.mpTitle':{en:'Automatically assign with remembered criteria',de:'Automatisch zuordnen mit gemerkten Importkriterien'},
'c2.mpHow1':{en:'Here you control the automatic assignment — ticked entries and rows are taken over.',
  de:'Hier steuerst du die automatische Zuordnung — übernommen wird, was einen Haken trägt: Posten und Zeilen.'},
'c2.mpHow2':{en:'The pencil at an entry opens it, so you can adjust its import criteria right there. The change applies to this list as soon as the window closes.',
  de:'Der Stift an einem Posten öffnet ihn — dort kannst du seine Importkriterien gleich anpassen. Die Änderung wirkt auf diese Liste, sobald das Fenster zugeht.'},
'c2.mpHow3':{en:'“{0}” carries out the assignment. Nothing is written to the book yet; that happens with “Finish”.',
  de:'„{0}“ führt die Zuordnung durch. Ins Buch geschrieben wird noch nichts, das tut erst „Fertig“.'},
'c2.mpHow4':{en:'“{0}” aborts this automatic assignment — nothing changes.',
  de:'„{0}“ bricht diese automatische Zuordnung ab — es ändert sich nichts.'},
'c2.mpEditTip':{en:'Open the entry and adjust its import criteria — the list here follows as soon as the window closes',
  de:'Den Posten öffnen und seine Importkriterien anpassen — die Liste hier folgt, sobald das Fenster zugeht'},
'c2.mpGone':{en:'No remembered criterion matches a free row any more.',
  de:'Kein gemerktes Kriterium trifft mehr eine freie Zeile.'},
'c2.mpRows':{en:'{0} row(s)',de:'{0} Zeile(n)'},
'c2.pkHead':{en:'X',de:'X'},
'c2.inBookTip':{en:'Already in the book from an earlier import — cannot be assigned again, neither by hand nor by a filter',
  de:'Schon im Buch, aus einem früheren Import — lässt sich nicht noch einmal zuordnen, weder von Hand noch über einen Filter'},
'c2.showOld':{en:'Show already assigned CSV entries',de:'Schon zugeordnete CSV-Zeilen zeigen'},
'c2.hideOld':{en:'Hide already assigned CSV entries',de:'Schon zugeordnete CSV-Zeilen verbergen'},
'c2.oldTip':{en:'{0} row(s) already assigned — {1} in the book from earlier imports, {2} in this import; shown grey with a cross in the column “X”',
  de:'{0} Zeile(n) schon zugeordnet — {1} im Buch aus früheren Importen, {2} in diesem Import; grau mit Kreuz in der Spalte „X“'},
'c2.noOld':{en:'No row of this file is assigned yet — neither in the book nor in this import',de:'Noch keine Zeile dieser Datei ist zugeordnet — weder im Buch noch in diesem Import'},
'c2.asgTip':{en:'Assigned to “{0}” in this import — stays here grey; take it back via the ☰ at the target',
  de:'In diesem Import „{0}“ zugeordnet — bleibt grau stehen; zurücknehmen über das ☰ am Ziel'},
'c2.mpNew':{en:'{0} new row(s)',de:'{0} neue Zeile(n)'},
'c2.mpOld':{en:'{0} already imported',de:'{0} schon importiert'},
'c2.mpOldTip':{en:'Already in the book from an earlier import — cannot be imported again; this import changes nothing here',
  de:'Schon im Buch, aus einem früheren Import — lässt sich nicht noch einmal importieren; dieser Import ändert daran nichts'},
'c2.mpHowOld':{en:'Rows that are already in the book from an earlier import stand grey with a cross — they cannot be imported again, and this import changes nothing about them.',
  de:'Zeilen, die aus einem früheren Import schon im Buch stehen, sind grau und tragen ein Kreuz — sie lassen sich nicht noch einmal importieren, und dieser Import ändert an ihnen nichts.'},
'c2.mpNone':{en:'no row matches',de:'trifft keine Zeile'},
/* Die Importkriterien im Posten- und im Kategorie-Fenster. */
'icrit.title':{en:'Import criteria',de:'Importkriterien'},
'icrit.sub':{en:'This is a filter criterion to import data automatically through a CSV file. Changes take effect with the next import.',
  de:'Das ist ein Filterkriterium, mit dem Daten automatisch aus einer CSV-Datei importiert werden. Änderungen gelten ab dem nächsten Import.'},
'icrit.del':{en:'Delete import criteria',de:'Importkriterien löschen'},
'icrit.delAsk':{en:'Delete all import criteria of “{0}”? The next CSV import will no longer assign anything to this entry by itself. Amounts already imported stay. Takes effect with “Save”.',
  de:'Alle Importkriterien von „{0}“ löschen? Der nächste CSV-Import ordnet diesem Posten dann nichts mehr von selbst zu. Schon importierte Beträge bleiben. Gilt mit „Speichern“.'},
'icrit.gone':{en:'The import criteria are removed with “Save”.',de:'Die Importkriterien werden mit „Speichern“ entfernt.'},
'icrit.pendTip':{en:'Comes from the open CSV import — assigned and remembered there, but not yet in the file. The import writes it.',
  de:'Kommt aus dem offenen CSV-Import — dort zugeordnet und gemerkt, aber noch nicht in der Datei. Geschrieben wird sie mit dem Import.'},
'c2.title':{en:'CSV Import',de:'CSV-Import'},
/* ── Der Hinweis auf die Kopfzeile (8.9.26) ───────────────────
   Er steht in Schritt 1 unter dem Beschreibungssatz, im Bild des
   Merksatzes der Anleitung (.gcall). Nötig ist er, weil FINA drei
   Dinge aus der Beschriftungszeile liest: die Namen der Spalten,
   den Fingerabdruck, an dem die Datei-Art wiedererkannt wird
   (c2Fp), und die Erkennung der Felder. Fehlt sie, nimmt
   c2UseHeader() die erste Buchung dafür — und die ist dann keine
   Buchung mehr. Gemerkt wird das erst hinterher. */
'c2.needHead':{en:'The CSV file needs a header row.',de:'Die CSV-Datei braucht eine Kopfzeile.'},
/* Der zweite Satz sagt, was ohne Kopfzeile **nicht geht** — die
   Zuordnung der Spalten und das Wiedererkennen der Datei —, und
   nicht mehr, was FINA dann ersatzweise täte (Lex, 9.9.26): das
   war eine technische Auskunft über einen Notbehelf, und wer sie
   las, wusste danach immer noch nicht, dass die Kopfzeile Pflicht
   ist. Kurz und in Du-Form wie der Rest des Wizards. */
'c2.needHeadSub':{en:'FINA reads the column names from it: without a header row it cannot tell which column is which, and it will not recognise the file next time. So a header row is a must.',
  de:'Aus ihr liest FINA die Namen der Spalten: ohne Kopfzeile weiß FINA nicht, welche Spalte was ist, und erkennt die Datei beim nächsten Mal nicht wieder. Eine Kopfzeile ist deshalb Pflicht.'},
'c2.sub':{en:'Reads any CSV — bank statement, card export, tracker. Encoding, separator and header row are detected automatically. Nothing changes until you press “Finish”.',
  de:'Liest jede CSV — Kontoauszug, Kartenexport, Tracker. Kodierung, Trennzeichen und Kopfzeile erkennt der Import selbst. Geändert wird erst, wenn du „Fertig“ drückst.'},
'c2.steps1':{en:'File',de:'Datei'},
'c2.steps2':{en:'Columns & fields',de:'Spalten & Felder'},
'c2.steps3':{en:'Matching',de:'Zuordnen'},
'c2.pick':{en:'Choose CSV…',de:'CSV wählen…'},
'c2.noFile':{en:'No file chosen yet.',de:'Noch keine Datei gewählt.'},
'c2.meta':{en:'{0} rows · {1} columns · {2} · separator {3}',de:'{0} Zeilen · {1} Spalten · {2} · Trennzeichen {3}'},
'c2.tab':{en:'tab',de:'Tabulator'},
'c2.readFail':{en:'Could not read the CSV: {0}',de:'Konnte die CSV nicht lesen: {0}'},
/* Der Kasten der gemerkten CSV-Struktur in Schritt 1 (umgebaut
   6.9.26; die Frage „Was steckt in der Datei?" mit den beiden
   Art-Knöpfen ist heraus). Er spricht von der **Struktur** der Datei
   und nicht von „Mapping": das Wort klang nach der Zuordnung der
   Zeilen, und die kommt erst in Schritt 3 — der Hinweis unter den
   Strukturen sagt das ausdrücklich. {0} in c2.known ist app.name:
   hier stellt sich das Programm vor. */
'c2.known':{en:'{0} remembers this file structure:',de:'{0} erinnert sich an diese Dateistruktur:'},
'c2.knownNote':{en:'Preparing the CSV structure automatically does not assign any data from the CSV file without your explicit instruction. It only saves you the manual and tedious step of mapping the CSV structure to the FINA fields — those become relevant in step 3.',
  de:'Die automatische Vorbereitung der CSV-Struktur ordnet ohne deine ausdrückliche Anweisung keine Daten aus der CSV-Datei zu. Sie erspart dir lediglich den mühsamen Handgriff, die CSV-Struktur den FINA-Feldern zuzuordnen — die werden in Schritt 3 gebraucht.'},
'c2.knownApply':{en:'Prepare CSV structure automatically',de:'Automatisch CSV-Datenstruktur vorbereiten'},
'c2.knownNew':{en:'Arrange CSV structure from scratch',de:'CSV-Datenstruktur von Grund auf neu anordnen'},
'c2.knownPick':{en:'Continue with this structure',de:'Mit dieser Struktur weitermachen'},
'c2.mapForgot':{en:'CSV structure “{0}” forgotten. Then “Save data”.',de:'CSV-Struktur „{0}“ vergessen. Danach „Daten speichern“.'},
'c2.next':{en:'Continue',de:'Weiter'},
'c2.nextTip':{en:'The column structure is already remembered — next comes the assignment of the rows.',
  de:'Die Spaltenstruktur ist schon gemerkt — weiter geht’s zur Zuordnung der Zeilen.'},
'c2.back':{en:'‹ Back',de:'‹ Zurück'},
'c2.needFile':{en:'Choose a CSV file first.',de:'Zuerst eine CSV-Datei wählen.'},
'c2.nextKnown':{en:'FINA knows this file type — decide below first: prepare the CSV structure automatically, or arrange it from scratch.',
  de:'FINA kennt diese Datei-Art — bitte zuerst unten entscheiden: die CSV-Datenstruktur automatisch vorbereiten oder von Grund auf neu anordnen.'},
'c2.selAll':{en:'Select all',de:'Alles wählen'},
'c2.selNone':{en:'Deselect all',de:'Alles abwählen'},
'c2.fDate':{en:'Date',de:'Datum'},
'c2.fAmount':{en:'Amount',de:'Betrag'},
/* Die fünf Referenzen (seit 6.9.26 spät; davor vier) — die einzigen Felder neben Datum und Betrag
   (5.9.26, C2_REFS in js/dialogs/csv2-wizard.js). Gleichrangige
   freie Felder (6.9.26; vorher als Rangfolge beschrieben), die
   Nummer ist nur ihr Name. */
'c2.fRef':{en:'Reference {0}',de:'Referenz {0}'},
'impv.ref':{en:'Ref {0}',de:'Ref {0}'},
/* ── Ein Referenzfeld benennen (8.9.26) ───────────────────────
   Der Stift steht am Feld — in Schritt 2 des Imports neben der
   Feldwahl und im Fenster der Importzuordnung vor jeder
   Referenzzeile. Der Name gehört der **Zuordnung**: er wird mit
   ihr gemerkt und beim nächsten Import wieder verwendet. Was
   schon im Buch steht, behält seinen alten Namen — siehe
   refLabel() in js/calc.js. */
'c2.renTitle':{en:'Name this reference field',de:'Referenzfeld benennen'},
'c2.renSub':{en:'The name belongs to this import mapping. It is remembered and used again at the next import. What is already in your book keeps the name it came in with.',
  de:'Der Name gehört zu dieser Importzuordnung. Er wird gemerkt und beim nächsten Import wieder verwendet. Was schon im Buch steht, behält den Namen, unter dem es hereinkam.'},
'c2.renField':{en:'FINA field',de:'FINA-Feld'},
'c2.renCol':{en:'Column in the file',de:'Spalte in der Datei'},
'c2.renName':{en:'Your name',de:'Dein Name'},
'c2.renHint':{en:'Leave it empty and the field is called “{0}” again.',
  de:'Leer lassen: das Feld heißt wieder „{0}“.'},
'c2.renTip':{en:'Name this reference field',de:'Dieses Referenzfeld benennen'},
'c2.renTaken':{en:'“{0}” is already the name of another reference field here.',
  de:'„{0}“ trägt hier schon ein anderes Referenzfeld.'},
'impv.refFrom':{en:'Named in “{0}”, taken over on {1}',de:'Benannt in „{0}“, übernommen am {1}'},
'c2.infoOther':{en:' · {0} from other years (stay grey)',de:' · {0} aus anderen Jahren (bleiben grau)'},
'c2.missTitle':{en:'Field assignment incomplete',de:'Feldzuordnung unvollständig'},
'c2.missSub':{en:'Assign these FINA fields to a column first — without them no row has a month or a number:',
  de:'Ordne zuerst diese FINA-Felder einer Spalte zu — ohne sie hat keine Zeile einen Monat oder eine Zahl:'},
'c2.okBtn':{en:'OK',de:'OK'},
'c2.looseTitle':{en:'Selected columns without a FINA field',de:'Gewählte Spalten ohne FINA-Feld'},
'c2.looseSub':{en:'These selected columns are not assigned to any FINA field. Only assigned columns go on to the next step. Deselect them now? You then stay in this step, check the columns and continue with the same button. Cancel keeps the selection — then you decide yourself which columns to deselect and which get a field.',
  de:'Diese gewählten Spalten sind keinem FINA-Feld zugeordnet. In den nächsten Schritt kommen nur zugeordnete Spalten. Jetzt abwählen? Du bleibst dann in diesem Schritt, prüfst die Spalten und gehst über denselben Knopf weiter. Abbrechen lässt die Wahl stehen — dann entscheidest du selbst, welche Spalten du abwählst und welche ein Feld bekommen.'},
'c2.looseBtn':{en:'Deselect',de:'Abwählen'},
'c2.looseDone':{en:'{0} column(s) deselected — check the columns, then continue.',de:'{0} Spalte(n) abgewählt — prüfe die Spalten, dann weiter.'},
'c2.noCols':{en:'At least one column must be selected.',de:'Wenigstens eine Spalte muss gewählt sein.'},
'c2.noYear':{en:'No row from the book year {0} — there would be nothing to match.',
  de:'Keine Zeile aus dem Buchjahr {0} — da gäbe es nichts zuzuordnen.'},
'c2.tgt':{en:'Target',de:'Ziel'},
'c2.tgtNone':{en:'— click a row above —',de:'— oben eine Zeile anklicken —'},
'c2.newBtn':{en:'+ New…',de:'+ Neu…'},
/* Der dritte Weg im Zuordnen-Menü: erst den Posten anlegen, dann
   geht das gerade Markierte oder Gefilterte an ihn. Er tut beides
   in einem Zug — deshalb steht beides im Namen. */
'c2.newAssign':{en:'Create new and assign',de:'Neu anlegen und zuordnen'},
'c2.newAssignTip':{en:'Set up the new entry, then the current selection goes to it right away',
  de:'Den neuen Posten anlegen — danach geht die gerade getroffene Auswahl an ihn'},
'c2.mnNoSel':{en:'Nothing to assign yet — filter the rows below or mark them by hand',
  de:'Es ist noch nichts zuzuordnen — unten filtern oder von Hand markieren'},
'c2.kTitle':{en:'Remembered criteria applied',de:'Gemerkte Importkriterien angewendet'},
'c2.autoMap':{en:'Automatically assign with remembered criteria…',de:'Automatisch zuordnen mit gemerkten Importkriterien…'},
'c2.autoMapTip':{en:'Assign in one go with the import criteria stored at your entries ({0} rules)',
  de:'Mit den an den Posten gemerkten Importkriterien in einem Zug zuordnen ({0} Regeln)'},
'c2.autoMapDone':{en:'Already done — the remembered criteria have been applied',
  de:'Schon geschehen — die gemerkten Importkriterien wurden angewendet'},
/* Zwei Wege, und der Unterschied steht auf dem Knopf: der eine
   merkt sich die Regel für das nächste Mal, der andere nicht.
   Was er tut, sagt der Knopf ganz — „Zuordnen" allein ließe
   offen, was danach in der Datei steht. */
'c2.assign':{en:'Assign and remember for next time',de:'Zuordnen und merken für die Zukunft'},
'c2.doAssign':{en:'Assign and remember',de:'Zuordnen und merken'},
'c2.assignOnce':{en:'One-time assignment mode',de:'Modus: Einmalige Zuordnung'},
'c2.adjust':{en:'Adjust and remember',de:'Anpassen und merken'},
'c2.assignOnceTip':{en:'Mark rows by hand and assign them once — nothing is remembered for next time',
  de:'Zeilen von Hand markieren und einmalig zuordnen — gemerkt wird nichts'},
'c2.assignPick':{en:'Assign once',de:'Einmalig zuordnen'},
'c2.menuTip':{en:'Filters and remembered criteria',de:'Filter und gemerkte Kriterien'},
'c2.mnCrit':{en:'Show all remembered import criteria',de:'Alle gemerkten Importkriterien zeigen'},
'c2.mnCritTip':{en:'All import criteria of your entries — the next import applies them by itself',
  de:'Alle Importkriterien deiner Posten — der nächste Import wendet sie von selbst an'},
'c2.assignTip':{en:'The rows the filter finds get a rule — it is stored at the entry as its import criteria for the next import',
  de:'Was der Filter findet, bekommt eine Regel — sie wird am Posten als Importkriterium für den nächsten Import gemerkt'},
'c2.mnNoFlt':{en:'Not while marking by hand — end marking first',
  de:'Nicht beim Markieren von Hand — erst das Markieren beenden'},
'c2.mnNoPick':{en:'Switch on “One-time assignment mode” first, then mark the rows',
  de:'Erst „Modus: Einmalige Zuordnung“ einschalten, dann die Zeilen markieren'},
'c2.pickHowTip':{en:'The marked rows go to the chosen target — nothing is remembered',
  de:'Die markierten Zeilen gehen an das gewählte Ziel — gemerkt wird nichts'},
'c2.fltOff':{en:'Not while marking by hand — use the quick filter above',
  de:'Nicht beim Markieren von Hand — dafür der Schnellfilter oben'},
'c2.pickOff':{en:'End marking',de:'Markieren beenden'},
'c2.pickAll':{en:'Mark all {0} visible rows',de:'Alle {0} sichtbaren Zeilen markieren'},
'c2.pickNone':{en:'Unmark all {0} visible rows',de:'Markierung der {0} sichtbaren Zeilen aufheben'},
'c2.pickNoEdit':{en:'Rows marked by hand have no conditions to adjust — the ☰ on the left releases them.',
  de:'Von Hand markierte Zeilen haben keine Bedingungen zum Anpassen — das ☰ links löst sie wieder.'},
'c2.pickTitle':{en:'Assign these rows once?',de:'Diese Zeilen einmalig zuordnen?'},
'c2.pickIntro':{en:'{0} marked row(s) go to “{1}”:',de:'{0} markierte Zeile(n) gehen an „{1}“:'},
'c2.pickNote':{en:'Nothing is remembered for next time. Only rows that are visible right now are taken — anything the filter has hidden stays out.',
  de:'Gemerkt wird nichts für das nächste Mal. Übernommen wird nur, was gerade sichtbar ist — was der Filter verbirgt, bleibt draußen.'},
'c2.pickOk':{en:'Assign',de:'Zuordnen'},
'c2.clearFlt':{en:'Cancel filter and show all unassigned CSV data',
  de:'Filter zurücknehmen und alle nicht zugeordneten CSV-Daten zeigen'},
'c2.apply':{en:'Apply',de:'Anwenden'},
'c2.finish':{en:'Finish',de:'Fertig'},
'c2.closeWizTip':{en:'If the import is finished, you can close the wizard. What is assigned goes into your book.',
  de:'Ist der Import fertig, kannst du den Wizard schließen. Was zugeordnet ist, kommt ins Buch.'},
'c2.closedNone':{en:'Wizard closed — nothing was assigned, so nothing was imported.',
  de:'Wizard geschlossen — es war nichts zugeordnet, also wurde nichts importiert.'},
/* Das ✕ rechts oben, je Schritt eine Sprechblase (6.9.26). */
'c2.xClose':{en:'Close wizard',de:'Wizard schließen'},
'c2.xClose2':{en:'Close the wizard right away. No entry assignment is carried out!',
  de:'Wizard sofort schließen. Keine Postenzuordnung wird durchgeführt!'},
'c2.xClose3':{en:'Close the wizard without assignment (!)',de:'Wizard ohne Zuordnung (!) schließen'},
'c2.saveCols':{en:'Save columns and continue',de:'Spalten speichern und weiter'},
'c2.saveColsTip':{en:'FINA remembers the column structure. Next comes the assignment of the rows.',
  de:'FINA merkt sich die Spaltenstruktur. Weiter geht’s zur Zuordnung der Zeilen.'},
'c2.mapNameTitle':{en:'Save column structure',de:'Spaltenstruktur speichern'},
'c2.mapNameSub':{en:'FINA remembers the columns of this file type under this name. The file name is suggested — you can change it.',
  de:'Unter diesem Namen merkt sich FINA die Spalten dieser Datei-Art. Vorgeschlagen ist der Name der Datei — du kannst ihn ändern.'},
'c2.mapNameKnown':{en:'FINA already knows this file type as “{0}” (remembered {1}). Saving replaces that structure — unless you keep it above. The import criteria at your entries stay either way.',
  de:'FINA kennt diese Datei-Art schon als „{0}“ (gemerkt {1}). Speichern ersetzt diese Struktur — außer du behältst sie oben. Die Importkriterien an den Posten bleiben so oder so.'},
'c2.mapNameKeep':{en:'Keep “{0}” and remember this as an additional structure',
  de:'„{0}“ behalten und diese als weitere Struktur dazu merken'},
'c2.mapNameEmpty':{en:'Please enter a name.',de:'Bitte einen Namen eingeben.'},
'c2.mapNameTaken':{en:'Another CSV structure is already called “{0}”. Please choose a different name.',
  de:'Eine andere CSV-Struktur heißt schon „{0}“. Bitte einen anderen Namen wählen.'},
'c2.mapSaved':{en:'Column structure “{0}” saved.',de:'Spaltenstruktur „{0}“ gespeichert.'},
'c2.guideTip':{en:'Show a short guide to this step beside the window',de:'Eine kurze Anleitung zu diesem Schritt neben dem Fenster zeigen'},
'c2.guideOff':{en:'Hide guide',de:'Anleitung ausblenden'},
'c2.fltTip':{en:'A fragment is enough · Enter pins it as a filter line above the field · ☰ sets how it compares',
  de:'Teilstück genügt · Enter heftet es als Filterzeile über dem Feld an · ☰ stellt ein, wie verglichen wird'},
'c2.q':{en:'Quick filter — searches all columns…',de:'Schnellfilter — sucht in allen Spalten…'},
'c2.qTip':{en:'Filters across all selected columns, on top of the column filters. Enter pins the entry as a filter line.',
  de:'Filtert über alle gewählten Spalten, zusätzlich zu den Spaltenfiltern. Enter heftet den Eintrag als Filterzeile an.'},
'c2.opHas':{en:'Contains',de:'Enthält'},
'c2.opNot':{en:'Does not contain',de:'Enthält nicht'},
'c2.opOnly':{en:'Contains only this',de:'Enthält nur'},
'c2.opStart':{en:'Starts with',de:'Fängt mit'},
'c2.opEnd':{en:'Ends with',de:'Endet mit'},
'c2.opHasS':{en:'contains:',de:'enthält:'},
'c2.opNotS':{en:'not:',de:'ohne:'},
'c2.opOnlyS':{en:'only:',de:'nur:'},
'c2.opStartS':{en:'starts:',de:'fängt mit:'},
'c2.opEndS':{en:'ends:',de:'endet mit:'},
'c2.allCols':{en:'all columns',de:'alle Spalten'},
'c2.colN':{en:'Column {0}',de:'Spalte {0}'},
'c2.care':{en:'Maintain {0} in Settings…',de:'{0} in den Einstellungen pflegen…'},
'year.paidTip':{en:'Settled — you ticked this month off',de:'Erledigt — diesen Monat hast du abgehakt'},
'year.estTip':{en:'Estimated — not confirmed yet',de:'Geschätzt — noch nicht bestätigt'},
/* HDR in beiden Sprachen (Lex, 7.9.26) — wie B · PT · DD · LP ein
   Kürzel, das nicht mit der Sprache wechselt. */
'c2.hrowCol':{en:'HDR',de:'HDR'},
'c2.hrowTip':{en:'Which row holds the column labels — click a circle to choose it. Everything above it is skipped.',
  de:'Welche Zeile die Spaltenbeschriftungen trägt — mit einem Klick auf einen Kreis wählen. Alles darüber wird übersprungen.'},
'c2.hrowIs':{en:'These are the column labels',de:'Das sind die Spaltenbeschriftungen'},
'c2.hrowPick':{en:'Use this row as the column labels',de:'Diese Zeile als Spaltenbeschriftungen nehmen'},
'c2.foldShow':{en:'Show the {0} assigned row(s)',de:'Die {0} zugeordneten Zeilen zeigen'},
'c2.foldHide':{en:'Hide the {0} assigned row(s)',de:'Die {0} zugeordneten Zeilen verbergen'},
'c2.foldAllShow':{en:'Show the assigned rows of all {0} targets',
  de:'Die zugeordneten Zeilen aller {0} Ziele zeigen'},
'c2.foldAllHide':{en:'Collapse all targets again',de:'Alle Ziele wieder zuklappen'},
'c2.foldAllBtnShow':{en:'Expand all',de:'Alle aufklappen'},
'c2.blkHide':{en:'Collapse this block',de:'Diesen Block zuklappen'},
'c2.blkShow':{en:'Expand this block',de:'Diesen Block aufklappen'},
'c2.foldAllBtnHide':{en:'Collapse all',de:'Alle zuklappen'},
'c2.foldNone':{en:'Nothing assigned to this target yet',de:'Diesem Ziel ist noch nichts zugeordnet'},
'c2.rowMenu':{en:'What to do with this target',de:'Was mit diesem Ziel geschehen soll'},
'c2.mnOpen':{en:'Open entry',de:'Posten öffnen'},
/* Der Import-Bereich rechts am Posten- und am Beträge-Fenster.
   Rückfrage und Meldung des Löschknopfs sind c2.mnWipeAsk und
   c2.mnWiped — es ist dieselbe Wirkung wie im Zielmenü des
   Imports, also auch derselbe Wortlaut. */
'impv.title':{en:'Imported data',de:'Importierte Daten'},
'impv.show':{en:'Show import data',de:'Importdaten zeigen'},
'impv.hide':{en:'Hide import data',de:'Importdaten verbergen'},
'impv.del':{en:'Delete all import data',de:'Alle Importdaten löschen'},
'c2.mnEdit':{en:'Change this file’s matching',de:'Zuordnung dieser Datei ändern'},
'c2.mnReset':{en:'Reset this file’s matching',de:'Zuordnung dieser Datei zurücksetzen'},
'c2.mnWipe':{en:'Delete all imported data ({0} months)',de:'Alle importierten Daten löschen ({0} Monate)'},
'c2.mnWipeAsk':{en:'Delete the imported data of “{0}”? {1} month(s) become empty and open again. Earlier imports wrote them; this cannot be undone.',
  de:'Die importierten Daten von „{0}“ löschen? {1} Monat(e) werden wieder leer und offen. Sie stammen aus früheren Importen; zurückholen lässt sich das nicht.'},
'c2.wipeAskPend':{en:'Release the {1} row(s) this CSV import has assigned to “{0}”? They become free again; nothing has been written to the book yet.',
  de:'Die {1} Zeile(n) lösen, die dieser CSV-Import „{0}“ zugeordnet hat? Sie werden wieder frei; im Buch steht davon noch nichts.'},
'c2.wipeAlsoPend':{en:'The {0} row(s) this CSV import has assigned to it are released as well.',
  de:'Auch die {0} Zeile(n), die dieser CSV-Import ihm zugeordnet hat, werden gelöst.'},
'c2.mnWiped':{en:'“{0}”: {1} imported month(s) deleted. Then “Save data”.',
  de:'„{0}“: {1} importierte Monate gelöscht. Danach „Daten speichern".'},
'c2.prevImp':{en:'from an earlier import',de:'aus einem früheren Import'},
'c2.prevImpTip':{en:'Already in your book — this file does not change it. The ☰ on the left deletes it.',
  de:'Steht schon im Buch — diese Datei ändert daran nichts. Das ☰ links löscht es.'},
'c2.chipDel':{en:'Remove this filter line',de:'Diese Filterzeile löschen'},
'c2.srcMore':{en:'… {0} more row(s)',de:'… {0} weitere Zeile(n)'},
'c2.noRules':{en:'No rule yet — filter below, click a target above, then “{0}”. Assigned rows leave the list and turn their target yellow above.',
  de:'Noch keine Regel — unten filtern, oben ein Ziel anklicken, dann „{0}“. Zugeordnete Zeilen verschwinden unten und färben oben ihren Posten gelb.'},
'c2.ruleTip':{en:'Click shows this rule’s filter',de:'Klick zeigt den Filter dieser Regel'},
'c2.ruleDelTip':{en:'Delete rule — its rows become free again',
  de:'Regel löschen — die Zeilen werden wieder frei'},
'c2.unmapTip':{en:'Release all assignments of this target — its rows become free again',
  de:'Alle Zuordnungen dieses Ziels lösen — die Zeilen werden wieder frei'},
'c2.rowTip':{en:'Assigned to “{0}” — click: adjust',de:'Zugeordnet zu „{0}“ — Klick: anpassen'},
'c2.rowTipOld':{en:'Assigned to “{0}” — this amount is already in your book, applying changes nothing. Click: adjust',
  de:'Zugeordnet zu „{0}“ — dieser Betrag steht schon so im Buch, „Anwenden“ ändert daran nichts. Klick: anpassen'},
'c2.hitNone':{en:'No filter — type into the column heads below.',
  de:'Kein Filter — tippe unten in die Spaltenköpfe.'},
'c2.hitFree':{en:'matches {0} open row(s)',de:'trifft {0} offene Zeile(n)'},
'c2.hitTaken':{en:' · {0} already assigned',de:' · {0} schon zugeordnete'},
'c2.hitOff':{en:' · {0} outside {1}',de:' · {0} außerhalb {1}'},
'c2.hitEdit':{en:'Adjusting “{0}” — matches {1} row(s)',de:'Anpassen von „{0}“ — trifft {1} Zeile(n)'},
'c2.hitOthers':{en:' · {0} at other rules',de:' · {0} bei anderen Regeln'},
'c2.more':{en:'… and {0} more rows — keep filtering to see them.',
  de:'… und {0} weitere Zeilen — filtere weiter, um sie zu sehen.'},
'c2.noneFound':{en:'Nothing found — this filter matches no row.',
  de:'Nichts gefunden — dieser Filter trifft keine Zeile.'},
'c2.emptyT':{en:'No targets — create one with “{0}”.',de:'Keine Ziele — lege mit „{0}“ eines an.'},
'c2.blkIn':{en:'Income',de:'Einnahmen'},
'c2.blkOut':{en:'Regular',de:'Regulär'},
'c2.blkFlex':{en:'Flexible',de:'Flexibel'},
'c2.blkNew':{en:'Newly created',de:'Neu angelegt'},
'c2.newTag':{en:'new',de:'neu'},
'c2.gTotal':{en:'TOTAL',de:'GESAMT'},
'c2.tNoTarget':{en:'Click a target above first — or create one with “{0}”.',
  de:'Erst oben ein Ziel anklicken — oder mit „{0}“ eines anlegen.'},
'c2.tOnlyQ':{en:'The quick filter alone is not enough — set a column filter, or mark the rows and assign them once.',
  de:'Der Schnellfilter allein reicht nicht — setze einen Spaltenfilter, oder markiere die Zeilen und ordne sie einmalig zu.'},
'c2.tNoFlt':{en:'Filter first — a match without a filter would catch everything.',
  de:'Erst filtern — eine Zuordnung ohne Filter träfe alles.'},
'c2.tNoHit':{en:'The filter matches no open row.',de:'Der Filter trifft keine offene Zeile.'},
'c2.tNoHitEdit':{en:'The filter matches no row for this rule.',
  de:'Der Filter trifft keine Zeile für diese Regel.'},
'c2.tAssigned':{en:'{0} row(s) → “{1}” — remembered',de:'{0} Zeile(n) → „{1}“ — gemerkt'},
'c2.tAssignedOnce':{en:'{0} row(s) → “{1}” — this time only',
  de:'{0} Zeile(n) → „{1}“ — nur diesmal'},
'c2.tAdjusted':{en:'Assignment adjusted — {0} row(s) → “{1}”',
  de:'Zuordnung angepasst — {0} Zeile(n) → „{1}“'},
'c2.tUnmapped':{en:'“{0}” released — {1} row(s) are free again.',
  de:'„{0}“ gelöst — {1} Zeile(n) sind wieder frei.'},
/* Das Fenster nach „Je Hauptkategorie automatisch". Zwei Zahlen
   und die Farbe, in der das Ergebnis dasteht — der Satz erklärt
   nicht die Farbe an sich, sondern **wo** sie jetzt steht.
   c2.tAutoCat gibt es nicht mehr: die Kurzmeldung war zu wenig. */
'c2.autoTitle':{en:'Assigned automatically',de:'Automatisch zugeordnet'},
'c2.autoTargets':{en:'entries in the target area',de:'Posten im Zielbereich'},
'c2.autoLines':{en:'single rows from the file',de:'einzelne Zeilen aus der Datei'},
'c2.autoMark':{en:'What is new is marked yellow: the entries above, and under each of them the rows just assigned to it. Yellow means found, but not in your book yet — that happens with “Finish”. What is already in your book stays grey.',
  de:'Was neu ist, steht gelb markiert: die Posten oben, und unter jedem von ihnen die Zeilen, die ihm gerade zugeordnet wurden. Gelb heißt gefunden, steht aber noch nicht im Buch — dorthin kommt es mit „Fertig". Was schon im Buch steht, bleibt grau.'},
/* Das Fenster „Neu anlegen" (6.9.26 ein Fenster für beide Arten):
   in der Kategorienliste steht als dritte Gruppe der Weg zu einer
   neuen flexiblen Kategorie. */
'c2.newT':{en:'New entry',de:'Neuer Posten'},
'c2.nFlexOpt':{en:'New flexible category (with this name)',de:'Neue flexible Kategorie (mit dieser Bezeichnung)'},
'c2.nName':{en:'Name',de:'Bezeichnung'},
/* Die Kategorie **im Buch**, in die der neue Posten kommt — die
   Datei selbst kennt keine Kategorie mehr, nur Referenzen (c2.fRef). */
'c2.nGroup':{en:'Category',de:'Kategorie'},
'c2.nBank':{en:'Bank',de:'Bank'},
'c2.nPay':{en:'Payment type',de:'Zahlungsart'},
'c2.nHint':{en:'The category decides whether it is income, a regular or a flexible item. “{0}” creates the entry in the table above — assign afterwards with “{1}”.',
  de:'Die Kategorie entscheidet, ob es eine Einnahme, ein regulärer oder ein flexibler Posten ist. „{0}“ legt den Eintrag oben in der Tabelle an — zugeordnet wird danach mit „{1}“.'},
'c2.save':{en:'Save',de:'Speichern'},
'c2.nNoCat':{en:'Not saved without a category — it decides income or costs.',
  de:'Ohne Kategorie wird nicht gespeichert — sie entscheidet, ob Einnahme oder Kosten.'},
'c2.nDup':{en:'“{0}” already exists — selected.',de:'„{0}“ gab es schon — gewählt.'},
'c2.nothing':{en:'Nothing assigned yet — there is nothing to apply.',
  de:'Noch nichts zugeordnet — es gibt nichts anzuwenden.'},
'c2.doneReg':{en:'{0} entries, {1} month values applied — marked blue. Then “Save data”.',
  de:'{0} Posten, {1} Monatswerte übernommen — blau markiert. Danach „Daten speichern“.'},
'c2.doneFlex':{en:'{0} transactions in {1} month(s) applied. Then “Save data”.',
  de:'{0} Buchungen in {1} Monat(en) übernommen. Danach „Daten speichern“.'},
'c2.sealOnceTip':{en:'Imported once — this assignment was not remembered, so the value will not come back on its own next time',
  de:'Einmalig importiert — diese Zuordnung wurde nicht gemerkt, der Wert kommt beim nächsten Mal nicht von selbst wieder'},
'c2.sealTip':{en:'Imported from CSV — the amount came from the file',
  de:'Aus CSV importiert — der Betrag kam aus der Datei'},
'c2.sealNewTip':{en:'Comes with this import — assigned, but not yet applied to the book',
  de:'Kommt mit diesem Import — zugeordnet, aber noch nicht ins Buch übernommen'}
};
