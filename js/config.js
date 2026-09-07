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
const VERSION='26.9.7';
/* Wie lange die Maus auf einem Element stehen muss, bis seine
   Sprechblase (data-tip, title) erscheint — der eine Wert für alle
   Hinweise (tipLater in js/ui.js) — eine halbe Sekunde. */
const TIP_DELAY=500;

/* Wo die Apps ihre Fassung nachschlagen. Die Datei beschreibt den
   **App-Kanal**, nicht die Webseite: stünde dort jede Webversion,
   meldete jeder Push allen installierten Apps ein Update, das es
   als Download gar nicht gibt. Abgefragt wird sie nur in der
   nativen Fassung (window.FINA_NATIVE) und höchstens einmal am Tag
   — es ist die einzige Netzverbindung, die FINA je aufbaut. */
const VERSION_URL='https://linked2ag.github.io/FINA/version.json';
/* ── Die Adresse der Webseite ─────────────────────────────────
   Seit 23.8.26 steht die Seite auf der eigenen Domain;
   `linked2ag.github.io/FINA` leitet dorthin weiter. `VERSION_URL`
   oben bleibt trotzdem auf der alten Adresse: danach fragen die
   schon installierten Apps, und eine Weiterleitung beantwortet
   das ohne Zutun.

   Zwei Wege hängen daran: der Hinweis auf eine neuere Fassung
   führt zu den Apps (den Abschnitt hieß bis 23.8.26 `#downloads`
   — Downloads gibt es dort gerade keine, die Apps sind in
   Arbeit), und die Begrüßungsseite führt zur
   Datenschutzerklärung. **Absolut und nicht relativ**: in der
   Mac- und der Windows-App liegt neben dem Web-Client keine
   zweite Seite, dort ginge ein relativer Weg ins Leere. */
const SITE_URL='https://fina-app.de/';
const DOWNLOAD_URL=SITE_URL+'#apps';
const PRIVACY_URL=SITE_URL+'datenschutz.html';

/* ── Die Umfrage (Pilot) ──────────────────────────────────────
   FINA fragt seine Nutzer selbst — im eigenen Fenster, nicht auf
   einer fremden Seite. Abgeschickt wird über **Formbricks**
   (Formbricks GmbH, Server in Frankfurt): deren offene
   Client-Schnittstelle nimmt Antworten **ohne Schlüssel** an, es
   steht hier also nichts Geheimes. Die Workspace-Kennung darf
   offen im Code stehen; mehr als Antworten anlegen kann man mit
   ihr nicht.

   Wie schon bei `VERSION_URL` gilt: Regel 4 („kein fetch")
   meint das Laden der **eigenen** Dateien. Eine Abfrage an eine
   fremde Adresse ist etwas anderes, sie läuft in beiden Fassungen
   und sie darf scheitern — dann bleibt die Anfrage offen und
   kommt beim nächsten Öffnen wieder. */
const SURVEY_HOST='https://app.formbricks.com';
const SURVEY_WS='cmt5umr7u0jt901yrl3k09sxi';

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
/* **Beide Zeichen stehen mittig in ihrem viewBox** — nachgemessen
   mit `getBBox()` samt halber Strichbreite, nicht geschätzt. Der
   Haken lag um 0.25, der Pfeil um 0.75 Einheiten daneben; in einem
   Kreis von 14 px sind das Bruchteile eines Pixels, aber sie stehen
   in derselben Spalte untereinander, und dort fällt jede Abweichung
   auf. Wer an einem Pfad dreht, misst nach: die gemalte Fläche muss
   in x **und** y die Mitte 12 haben. */
const CHECK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.25l5.5 5.5L20 6.25"/></svg>';
/* Das Fragezeichen des geschätzten Stands — als Strichzeichen wie
   der Haken und der Pfeil, nicht als Buchstabe (5.9.26): ein
   Schriftzeichen sitzt auf seiner Grundlinie und hing im Kreis
   sichtbar zu hoch, je nach Schrift und Zeile verschieden. Der
   Bogen und der Punkt sind um die Mitte der Zeichenfläche gebaut
   (x 8,6–15,4 · y 5,6–18,6), das Zeichen steht damit mittig, wo
   immer es gezeigt wird — Siegel der Monatsansicht, Kreis der
   Jahresmatrix, Kacheln der Fenster. */
const EST_SVG='<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8.6 9a3.4 3.4 0 1 1 5.2 2.9c-1.2.8-1.8 1.5-1.8 2.9"/><path d="M12 18.6h.01"/></svg>';
/* Pfeil nach unten: der Monat kam aus einem CSV-Import — erledigt,
   aber nicht von Hand abgehakt (js/dialogs/csv2-wizard.js).
   **Nur der Pfeil, kein Strich darunter:** das Zeichen steht bei
   9 px in einer Tabellenzelle und bei 10 px in einem Siegel von
   16 px — die Grundlinie wurde dort zu einem Fleck und machte aus
   dem Pfeil einen Klecks. Der Pfeil allein sagt dasselbe.
   **Seit 30.8.26 knapp ein Fünftel größer** (um die Mitte 12
   skaliert): im blauen Kreis wirkte er verloren. Die gemalte
   Fläche samt runder Kappen (±1.6) hat weiter die Mitte 12 in
   x und y — wer daran dreht, misst nach (siehe CHECK_SVG). */
const IMPORT_SVG='<svg viewBox="0 0 24 24" fill="none" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.75v15.9"/><path d="M4.65 12.9l7.35 7.35 7.35-7.35"/></svg>';
