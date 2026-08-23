/* ══════════════════════════════════════════════════════════════
   FINA — Begrüßung
   Die Seite, die vor allem anderen steht: beim Öffnen der Anwendung
   und wieder, sobald die Datei getrennt wird. Sie ist bewusst
   knapp — was FINA ist und was es kostet, erklärt die Startseite
   (index.html); wer hier ankommt, will nur noch hinein. Deshalb
   auch kein Verweis auf Downloads und keine Anleitung: die
   Anleitung gehört ins geladene Buch (dort erst zeigt die
   Kopfzeile den Knopf, siehe renderChrome in js/app.js).

   Sie ist keine Ansicht im Sinne von VIEWS: es gibt keinen Reiter
   dorthin. Gezeigt wird sie, solange ui.welcome gilt (siehe
   render() in js/app.js); afterLoad() rührt sie nicht an, weil sie
   nicht am Inhalt der Datei hängt, sondern daran, ob überhaupt
   eine gewählt wurde.
   ══════════════════════════════════════════════════════════════ */
function viewWelcome(){
  return `
  <div class="welcome">
    <!-- Der Hintergrund atmet wie auf der Startseite: drei weiche
         Farbflächen hinter der Karte, nur Zierde (css/layout.css,
         .wbg). Die Seite ist die Tür zwischen Startseite und Buch
         und trägt deshalb deren Gestalt. -->
    <div class="wbg" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="wbox">
      <div class="wtop">
        <div class="wmark">FINA</div>
        <!-- Die Sprachwahl gehört auf diese Seite: das
             Einstellungsfenster gibt es erst im geladenen Buch.
             Geschrieben wird über chooseLang() (js/i18n.js) in
             state.lang des leeren Buches **und** in den
             localStorage — die Wahl gilt damit auch für die
             Verkaufsseiten. Eine geladene Datei überstimmt sie wie
             immer. Die Kürzel kommen aus LANGS und wechseln die
             Sprache nicht; verdrahtet in wire() (data-wlang). -->
        <div class="wlangs" role="group" aria-label="Language">
          ${LANGS.map(([k,label])=>`<button class="wlang" data-wlang="${k}"
            aria-pressed="${LANG()===k}" title="${label}">${k.toUpperCase()}</button>`).join('')}
        </div>
      </div>
      <h2>${t('wel.title')}</h2>
      <p class="wlead">${t('wel.lead')}</p>

      <!-- Zwei Wege, gleich groß nebeneinander: der erste ist der
           gewöhnliche, deshalb steht er vorn und trägt die Farbe. -->
      <div class="wpick">
        <button class="wcard primary" data-wload="1">
          <span class="wt">${t('wel.open')}</span>
          <span class="wd">${t('wel.openHint')}</span></button>
        <button class="wcard" data-wnew="1">
          <span class="wt">${t('wel.new')}</span>
          <span class="wd">${t('wel.newHint')}</span></button>
      </div>

      <!-- Erreichbar sein muss die Datenschutzerklärung von
           überall, also auch von hier: es ist die einzige Seite
           der Anwendung, die jeder sieht, bevor er ein Buch hat.
           Ein neuer Reiter, damit ein halb ausgefülltes Buch —
           beim Trennen steht die Begrüßung ja wieder da — nicht
           unter dem Text verschwindet. Die Adresse ist absolut
           (PRIVACY_URL in js/config.js): in der Mac- und der
           Windows-App liegt neben dem Web-Client keine zweite
           Seite. -->
      <p class="wlegal"><a href="${PRIVACY_URL}" target="_blank"
        rel="noopener">${t('wel.privacy')}</a></p>
    </div>
  </div>`;
}
