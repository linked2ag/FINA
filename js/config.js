/* ══════════════════════════════════════════════════════════════
   FINA — Konstanten
   Feste Begriffe der Anwendung. Keine Kontodaten, keine Beträge:
   alle Werte kommen aus der JSON-Datei des Nutzers.

   Monatsnamen, YEAR und CUR stehen in js/i18n.js — sie hängen an
   Sprache und Datei. Die Listen hier sind übersetzt und deshalb
   Eigenschaften mit Getter: MONTHS[i], VIEWS.map(…) und
   DUE_OPTS bleiben als Fundstellen unverändert.
   ══════════════════════════════════════════════════════════════ */

/* Die vier Hauptansichten: interner Schlüssel + Beschriftung.
   Die Reihenfolge ist auch die der Reiter. */
Object.defineProperty(window,'VIEWS',{get:()=>[
  ['monat',t('view.monat')],['jahr',t('view.jahr')],
  ['kakeibo',t('view.kakeibo')],['prognose',t('view.prognose')]
]});

/* Auswahl im Posten-Fenster: Wiederholung und Fälligkeit. */
Object.defineProperty(window,'RHYTHM',{get:()=>[
  ['1',t('rhy.1')],['2',t('rhy.2')],['3',t('rhy.3')],['6',t('rhy.6')],['12',t('rhy.12')]
]});
Object.defineProperty(window,'DUE_OPTS',{get:()=>[['','—'],['A',t('due.A')],['M',t('due.M')],['E',t('due.E')]]
  .concat(Array.from({length:31},(_,i)=>[String(i+1),t('due.day',i+1)]))});

/* Symbole */
const LINK_SVG='<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>';
const LAMP_SVG='<svg><use href="#ic-lamp"/></svg>';
const CHECK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>';
