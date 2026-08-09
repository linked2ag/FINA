/* ══════════════════════════════════════════════════════════════
   FINA — Konstanten
   Feste Begriffe der Anwendung. Keine Kontodaten, keine Beträge:
   alle Werte kommen aus der JSON-Datei des Nutzers.

   Monatsnamen, YEAR und CUR stehen in js/i18n.js — sie hängen an
   Sprache und Datei. Die Listen hier sind übersetzt und deshalb
   Eigenschaften mit Getter: MONTHS[i], VIEWS.map(…) und
   DUE_OPTS bleiben als Fundstellen unverändert.
   ══════════════════════════════════════════════════════════════ */

/* Die Hauptansichten: interner Schlüssel + Beschriftung. Die
   Reihenfolge ist auch die der Reiter.

   „Fast Budget Details" steht als letzter und **nur mit
   Import**: der Reiter wertet die Buchungen aus Fast Budget aus,
   ohne sie gäbe es dort nichts zu sehen. Der Weg zum Import
   hängt deshalb nicht an ihm, sondern in der Kopfzeile
   (#btnImport). Wer die Ansicht trotzdem eingestellt hat —
   etwa nach dem Trennen der Datei —, wird in render() (js/app.js)
   weitergeschickt. */
Object.defineProperty(window,'VIEWS',{get:()=>{
  const v=[['monat',t('view.monat')],['jahr',t('view.jahr')],['prognose',t('view.prognose')]];
  if(hasImport()) v.push(['kakeibo',t('view.kakeibo')]);
  return v;
}});

/* Auswahl im Posten-Fenster: Wiederholung und Fälligkeit. */
Object.defineProperty(window,'RHYTHM',{get:()=>[
  ['1',t('rhy.1')],['2',t('rhy.2')],['3',t('rhy.3')],['6',t('rhy.6')],['12',t('rhy.12')]
]});
Object.defineProperty(window,'DUE_OPTS',{get:()=>[['','—'],['A',t('due.A')],['M',t('due.M')],['E',t('due.E')]]
  .concat(Array.from({length:31},(_,i)=>[String(i+1),t('due.day',i+1)]))});

/* Symbole */
const LINK_SVG='<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>';
const LAMP_SVG='<svg><use href="#ic-lamp"/></svg>';
/* Pfeil aus dem Kasten heraus: etwas verlässt diese Seite und
   öffnet sich in einem eigenen Reiter des Browsers. */
const EXPAND_SVG='<svg viewBox="0 0 24 24"><path d="M14 4h6v6"/><path d="M20 4l-8 8"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
const CHECK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>';
