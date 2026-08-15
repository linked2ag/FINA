/* ══════════════════════════════════════════════════════════════
   FINA — Konstanten
   Feste Begriffe der Anwendung. Keine Kontodaten, keine Beträge:
   alle Werte kommen aus der JSON-Datei des Nutzers.

   Monatsnamen, YEAR und CUR stehen in js/i18n.js — sie hängen an
   Sprache und Datei. Die Listen hier sind übersetzt und deshalb
   Eigenschaften mit Getter: MONTHS[i], VIEWS.map(…) und
   DUE_OPTS bleiben als Fundstellen unverändert.
   ══════════════════════════════════════════════════════════════ */

/* ── Die Versionsnummer ───────────────────────────────────────
   **Eine Zahl, eine Stelle.** Hier steht sie, alles andere leitet
   sich daraus ab: `desktop/sync.mjs` schreibt sie vor jedem Bauen
   in `desktop/package.json`, die Update-Hinweisleiste vergleicht
   sie mit `version.json`, und beim Speichern wandert sie als
   `state.v` in die Datei des Nutzers.

   **Sie ist das Datum: Jahr.Monat.Tag**, also `26.8.15` für den
   15. August 2026. Drei Stellen, keine Zählung dahinter — die
   vierteilige Form (`26.8.13.1`) ist kein gültiges semver, und
   electron-builder weist sie zurück. Wer an einem Tag zweimal
   veröffentlicht, tut es unter derselben Nummer: die Webseite ist
   dann einfach neuer als das, was der Guide auflistet.

   Der letzte Eintrag im Guide-Reiter „Was ist neu" muss **nicht**
   diese Nummer tragen. Versionen entstehen dort nur auf Zuruf; die
   Webseite läuft ihnen voraus, und die Apps hinterher (siehe
   „Die zwei Veröffentlichungskanäle" in der Planung). */
const VERSION='26.8.15';

/* Wo die Apps ihre Fassung nachschlagen. Die Datei beschreibt den
   **App-Kanal**, nicht die Webseite: stünde dort jede Webversion,
   meldete jeder Push allen installierten Apps ein Update, das es
   als Download gar nicht gibt. Abgefragt wird sie nur in der
   nativen Fassung (window.FINA_NATIVE) und höchstens einmal am Tag
   — es ist die einzige Netzverbindung, die FINA je aufbaut. */
const VERSION_URL='https://linked2ag.github.io/FINA/version.json';
const DOWNLOAD_URL='https://linked2ag.github.io/FINA/download/';

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
