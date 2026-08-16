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
    <div class="wbox">
      <div class="wtop">
        <div class="wmark">FINA</div>
        <!-- Die Sprachwahl gehört auf diese Seite: das
             Einstellungsfenster gibt es erst im geladenen Buch.
             Geschrieben wird in state.lang des leeren Buches — eine
             geladene Datei überstimmt das wie immer, und in den
             localStorage der Startseite (finaLang) wird nichts
             zurückgeschrieben. Die Kürzel kommen aus LANGS und
             wechseln die Sprache nicht; verdrahtet in wire()
             (data-wlang). -->
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
    </div>
  </div>`;
}
