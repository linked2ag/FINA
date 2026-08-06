/* ══════════════════════════════════════════════════════════════
   FINA — Begrüßung
   Die Seite, die vor allem anderen steht: beim Öffnen der Anwendung
   und wieder, sobald die Datei getrennt wird. Sie sagt zuerst,
   worum es hier überhaupt geht, und bietet dann die beiden einzigen
   Wege an, die es gibt — eine vorhandene Datei öffnen oder mit
   einer leeren anfangen.

   Sie ist keine Ansicht im Sinne von VIEWS: es gibt keinen Reiter
   dorthin. Gezeigt wird sie, solange ui.welcome gilt (siehe
   render() in js/app.js); afterLoad() rührt sie nicht an, weil sie
   nicht am Inhalt der Datei hängt, sondern daran, ob überhaupt
   eine gewählt wurde.

   Warum überhaupt: ohne sie stand man vor einer leeren Jahres-
   matrix und musste raten, dass oben rechts ein Knopf die Datei
   öffnet. Und weil es die Seite gibt, braucht die Kopfzeile den
   Knopf „Daten hochladen" nicht mehr — geladen wird hier, gearbeitet
   dort.
   ══════════════════════════════════════════════════════════════ */
function viewWelcome(){
  return `
  <div class="welcome">
    <div class="wbox">
      <div class="wmark">FINA</div>
      <h2>${t('wel.title',YEAR)}</h2>
      <p class="wlead">${t('wel.lead')}</p>

      <ul class="wlist">
        <li><b>${t('g.income')}</b> — ${t('wel.kIn')}</li>
        <li><b>${t('g.fixed')}</b> — ${t('wel.kOut')}</li>
        <li><b>${t('g.flex')}</b> — ${t('wel.kFlex')}</li>
      </ul>
      <p class="wlead">${t('wel.lead2')}</p>

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

      <p class="wfoot">${t('wel.foot',t('app.save'))}</p>
      <p class="wfoot">${t('wel.guide',t('app.guide'))}</p>
    </div>
  </div>`;
}
