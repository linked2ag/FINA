/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Einstellungen"
   Alles, was die Anwendung selbst betrifft und in der JSON-Datei
   steht: Sprache, Abrechnungsjahr, Spaltenbreiten der Jahres-
   matrix, die Grenze für die größten Einzelposten und die vier
   Listen — Banken, Zahlungsarten, regelmäßige Kategorien,
   Kakeibo-Kategorien.

   Das ist zu viel für eine Seite, deshalb steht links ein Menü
   und rechts der gewählte Bereich. Gebaut werden immer ALLE
   Bereiche; umgeschaltet wird nur die Sichtbarkeit. Das ist keine
   Bequemlichkeit, sondern Absicht: collect() liest die Felder
   aller Bereiche ein, und getippte Änderungen überleben so den
   Wechsel des Bereichs.

   Wichtig: Das Fenster baut sich bei Hinzufügen, Entfernen und
   Sortieren komplett neu auf. Jeder dieser Wege läuft über
   applyEdits(), das getippte Umbenennungen sofort übernimmt —
   sonst ginge der alte Name verloren und die abhängigen Daten
   hingen in der Luft. Das Umbenennen selbst erledigt
   js/categories.js.
   ══════════════════════════════════════════════════════════════ */

/* Der gewählte Bereich überlebt den Neuaufbau des Fensters —
   sonst landete man nach jedem „+" wieder ganz vorn. Er gehört
   nicht in den Zustand: er wird nicht gespeichert. */
let setPane='general';

/* ── Die Bereiche ─────────────────────────────────────────────
   Die Liste ist zweierlei: die Reihenfolge des Menüs links **und**
   die Namen, die `openSettings()` von außen annimmt. Ein neuer
   Bereich braucht deshalb einen Eintrag hier, einen `pane(…)`-Aufruf
   unten und die Texte in js/i18n.js. */
const SET_PANE_LABEL={general:'set.navGeneral',view:'set.navView',filter:'set.navFilter',
  banks:'set.navBanks',groups:'set.groups',import:'set.navImport'};

/* ── Wohin das Fenster aufgeht ────────────────────────────────
   `openSettings(wohin)` nimmt entweder den Namen eines **Bereichs**
   (`'banks'`, `'groups'`, `'kak'` — so kommen die Wege aus dem
   Posten- und dem Kategorie-Fenster hier an) oder die Kennung eines
   **Feldes** (`'sOpen'` — so kommt der Doppelklick auf den
   Anfangsbestand aus der Prognose). Bei einem Feld muss das Fenster
   den Bereich zeigen, in dem es liegt; sonst führte der Weg auf ein
   verborgenes Feld, und der Nutzer stünde vor der Sprachwahl.

   Diese Zuordnung ist die einzige Stelle, an der steht, welches Feld
   in welchem Bereich wohnt. Wer ein weiteres Feld von außen
   ansteuerbar macht, trägt es hier ein. */
const SET_FIELD_PANE={sOpen:'general'};

/* ── „+" setzt die Schreibmarke in den neuen Eintrag ──────────
   (5.9.26) Das Fenster baut sich nach „+" komplett neu auf
   (reopen), und dabei ginge der Fokus an das Fenster selbst — man
   müsste die leere Zeile erst suchen und anklicken, obwohl man sie
   gerade angelegt hat, um hineinzutippen. Deshalb merkt der
   Add-Handler hier, welche Zeile neu ist, und openSettings() stellt
   die Schreibmarke nach dem Aufbau dorthin. Eine Modulvariable wie
   setPane: sie überlebt den Neuaufbau und wird gleich danach
   geleert. */
let setFocusNew=null;

/* Überschrift einer Liste. Das Pluszeichen steht direkt hinter
   der Beschriftung, nicht unter der Liste — so bleibt es auch bei
   langen Listen in Sichtweite. */
function listHead(label,key,addTip){
  return `<label>${label}<button class="plusmini" data-add="${key}"
    title="${esc(addTip)}" aria-label="${esc(addTip)}">+</button></label>`;
}

/* ── Ein Fenster über einem Fenster ───────────────────────────
   `done` ist der Rückweg: eine Funktion, die läuft, wenn dieses
   Fenster wieder weg ist — gespeichert wie abgebrochen. Damit kann
   das Posten- und das Kategorie-Fenster die Einstellungen **über
   sich** öffnen, ohne selbst zu schließen: was dort getippt ist,
   bleibt stehen, und danach holt es sich die neuen Listen ab.

   Gestapelt wird über die Reihenfolge im Dokument — das jüngste
   .modal liegt oben und bekommt auch Escape (js/ui.js). Zu tun ist
   dafür nichts.

   `reopen()` reicht beides weiter: „+", Entfernen und Sortieren
   bauen das Fenster neu auf, und ein Rückweg, der dabei verloren
   ginge, wäre der Rückweg für den häufigsten Fall überhaupt — man
   kommt ja her, um etwas anzulegen. */
function openSettings(where,done){
  /* Der Bereich wird gestellt, bevor gebaut wird: `pane()` fragt
     `setPane`, um zu entscheiden, welcher Abschnitt sichtbar ist.
     Die Wahl bleibt danach stehen, wie jede andere — wer über den
     Anfangsbestand hereinkommt und das Fenster gleich wieder
     öffnet, findet „Allgemein" vor. */
  const focus=SET_FIELD_PANE[where]?where:'';
  const goPane=focus?SET_FIELD_PANE[focus]:(SET_PANE_LABEL[where]?where:'');
  if(goPane) setPane=goPane;

  const box=document.createElement('div');
  box.className='modal';

  /* Banken und Zahlungsarten: Kürzel + Bezeichnung. */
  const pairRows=(arr,key)=>arr.map((x,i)=>`<div class="listrow" draggable="true" data-list="${key}" data-idx="${i}">
      <span class="grip" title="${t('set.dragTip')}">⋮⋮</span>
      <input data-k="${key}" data-i="${i}" data-f="code" value="${esc(x.code)}" placeholder="${t('set.code')}">
      <input data-k="${key}" data-i="${i}" data-f="label" value="${esc(x.label)}" placeholder="${t('set.label')}">
      <button class="linkish" data-rm="${key}" data-ri="${i}" title="${t('g.remove')}">&#10005;</button></div>`).join('');

  /* Kategorien: nur ein Name. **Der feste „ohne Kategorie"-Eintrag**
     (isNoCat, js/i18n.js; seit 6.9.26) zeigt nur Griff und
     Beschriftung — kein Feld, kein ✕: verschieben ja, umbenennen und
     löschen nein. Damit collect() ihn an seiner Stelle wiederfindet,
     trägt er ein verborgenes Feld mit dem rohen Schlüssel. */
  const nameRows=(arr,key,hintOf)=>arr.map((name,i)=>{
    if(isNoCat(name)) return `<div class="listrow onecol fixedrow" draggable="true" data-list="${key}" data-idx="${i}">
      <span class="grip" title="${t('set.dragTip')}">⋮⋮</span>
      <span class="fixedname" title="${esc(t('set.noCatTip'))}">${esc(keyLabel(name))}<input type="hidden" data-k="${key}" data-i="${i}" data-f="name" value="${esc(name)}"></span>
      <span></span></div>`;
    const hint=hintOf(name);
    return `<div class="listrow onecol" draggable="true" data-list="${key}" data-idx="${i}">
      <span class="grip" title="${t('set.dragTip')}">⋮⋮</span>
      <input data-k="${key}" data-i="${i}" data-f="name" value="${esc(name)}" placeholder="${t('item.name')}">
      <button class="linkish" data-rm="${key}" data-ri="${i}" title="${hint||t('g.remove')}">&#10005;</button></div>`;
  }).join('');

  /* ── Die gemerkten CSV-Strukturen ────────────────────────────
     `state.csvMaps` hält je Datei-Art (Fingerabdruck der
     Spaltenköpfe) eine Struktur; der CSV-Import bietet sie beim
     nächsten Hochladen von selbst an. Hier stehen sie zum
     Umbenennen, zum Ändern und zum Vergessen — sonst gäbe es keinen
     Weg mehr an sie heran, sobald eine Struktur einmal falsch
     gemerkt ist. Umbenannt wird nur die **Beschriftung**; erkannt
     wird eine Datei am Fingerabdruck.

     **Je Zeile nur das Nötigste** (5.9.26 spät): Name, Stift, ✕ —
     und darunter allein der Tag des Merkens (seit 6.9.26; bis dahin
     die Art, die es nicht mehr gibt: Importkriterien gelten für
     reguläre wie für flexible Posten gleich). Bis 5.9.26 stand hier
     die ganze Feldverknüpfung als Zeile („Datum ← Buchungstag · …")
     und ein langer Absatz; das war zu viel Beschriftung für einen
     Blick. Was die Struktur ist, zeigt der Stift (openCsvStructure
     in js/dialogs/csv2-wizard.js): oben der Name, links die
     FINA-Felder, rechts je ein Auswahlmenü mit den Spalten der
     Datei. Regeln stehen nicht hier: die Importkriterien wohnen an
     den Posten — gesammelt zeigt sie der Knopf oben (#impCrit). */
  /* **Je Struktur ein Knopf** (6.9.26 spät; davor eine weiße Zeile
     mit Stift und ✕ wie im Kasten von Schritt 1 des Imports): ein
     gewöhnlicher .btn wie die beiden Knöpfe darüber — der Name, dahinter
     klein „gemerkt am" —, jeder auf seiner eigenen Zeile unter der
     Überschrift. Ein Klick öffnet das Strukturfenster (openCsvStructure
     in js/dialogs/csv2-wizard.js); dort wird geändert **und gelöscht**.
     Drei Knopfarten in einem Bereich sähen nach drei Werkzeugen aus,
     es ist aber ein Bereich: „was FINA vom Import weiß". */
  const mapRows=Object.keys(state.csvMaps||{}).map(fp=>{
    const m=state.csvMaps[fp]||{};
    return `<button type="button" class="btn setmap" data-cmed="${esc(fp)}" title="${esc(t('set.csvMapEdit'))}">
      <span class="n">${esc(m.file||fp)}</span>
      <small>${esc(t('set.csvMapMeta',m.date||'—'))}</small></button>`;
  }).join('');

  const useHint=g=>{ const n=groupUseCount(g); return n?t('set.inUse',n):''; };
  const groupRows=nameRows(state.groups,'groups',useHint);
  const incGroupRows=nameRows(state.incomeGroups,'incomeGroups',useHint);
  const flexGroupRows=nameRows(state.flexGroups,'flexGroups',g=>{const n=flexGroupUseCount(g);return n?t('set.inUse',n):'';});

  /* Ein Bereich: Überschrift, ein Satz dazu, Inhalt. Alle werden
     gebaut, sichtbar ist einer. */
  const pane=(key,title,hint,inner)=>`<section class="setpane swapfade" data-pane="${key}"${key===setPane?'':' hidden'}>
    <h4>${title}</h4>${hint?`<p class="note" style="margin:-2px 0 14px">${hint}</p>`:''}${inner}</section>`;

  /* ── Der Bereich „Filter" ─────────────────────────────────────
     Worin der Suchbegriff sucht — bis 23.8.26 ein eigenes Fenster
     (js/dialogs/filter-fields.js), jetzt ein Bereich hier: die Wahl
     steht in der Datei (state.filterFields, state.qHidden), und
     hier stehen die Angaben der Datei beisammen. Der Knopf
     „Filteroptionen…" neben den Suchfeldern führt her
     (data-qfields → openSettings('filter') in wire()).
     Reihenfolge der Kästchen: erst, was an der Zeile steht, dann
     die Zahlen, zuletzt die Kürzel. */
  const qfRows=[
    ['name',  t('flt.fName'),  t('flt.fNameHint')],
    ['note',  t('flt.fNote'),  t('flt.fNoteHint')],
    ['amount',t('flt.fAmount'),t('flt.fAmountHint')],
    ['total', t('flt.fTotal'), t('flt.fTotalHint')],
    ['meta',  t('flt.fMeta'),  t('flt.fMetaHint')]
  ].map(([k,lab,hint])=>`<label class="checkrow"><input type="checkbox" data-qf="${k}" ${qField(k)?'checked':''}>
      <span class="clab">${lab}</span><span class="chint">${hint}</span></label>`).join('');

  const NAV=Object.keys(SET_PANE_LABEL).map(k=>[k,t(SET_PANE_LABEL[k])]);
  const navIdx=NAV.findIndex(([k])=>k===setPane);

  box.innerHTML=`<div class="box split setbox">
    <h3>${t('set.title')}</h3>
    <!-- Wird das Fenster schmaler, als das Menü links braucht,
         tritt an die Stelle des Menüs diese Zeile: ‹ · Aufklapp-
         liste · › (css/components.css, unter 760 px). Dieselben
         Bereiche, dieselbe Reihenfolge — nur als Liste zum
         Aufklappen, mit zwei Schrittknöpfen daneben. Am
         Schreibtisch ist sie display:none.

         Sie steht VOR dem Beschreibungssatz, direkt unter der
         Überschrift: so sitzt sie beim Wechsel von Bereich zu
         Bereich immer an derselben Stelle, statt mit der Höhe des
         Textes darüber zu wandern. -->
    <div class="setnavdrop">
      <button type="button" class="btn small" id="setPrev" aria-label="${esc(t('set.prevPane'))}"${navIdx<=0?' disabled':''}>&lsaquo;</button>
      <select id="setSel" aria-label="${t('set.navLabel')}">${NAV.map(([k,l])=>
        `<option value="${k}"${k===setPane?' selected':''}>${l}</option>`).join('')}</select>
      <button type="button" class="btn small" id="setNext" aria-label="${esc(t('set.nextPane'))}"${navIdx>=NAV.length-1?' disabled':''}>&rsaquo;</button>
    </div>
    <p class="subline">${t('set.sub')}</p>

    <!-- Überschrift, Aufklappliste und Satz stehen fest, ebenso die
         Knopfzeile unten — gescrollt wird nur dieser Rumpf
         (.dbody, css/components.css). -->
    <div class="dbody">
    <div class="setlayout">
      <nav class="setnav" aria-label="${t('set.navLabel')}">${NAV.map(([k,l])=>
        `<button type="button" data-sect="${k}" aria-pressed="${k===setPane}">${l}</button>`).join('')}</nav>

      <div class="setpanes">
        ${pane('general',t('set.navGeneral'),t('set.generalSub'),`
          <!-- Der Anfangsbestand steht neben dem Jahr, weil er zu
               ihm gehört: er sagt, womit dieses eine Jahr anfängt.
               Ein Textfeld wie jeder Betrag (parseGermanNumber,
               Vorzeichenfarbe über .signed) — kein Zahlenfeld: ein
               Kontostand wird mit Tausenderpunkt und Komma
               getippt. -->
          <div class="cols c3">
            <div class="field"><label for="sLang">${t('set.lang')}</label>
              <select id="sLang">${LANGS.map(([k,l])=>`<option value="${k}"${LANG()===k?' selected':''}>${l}</option>`).join('')}</select></div>
            <div class="field"><label for="sYear">${t('set.year')}</label>
              <input type="number" id="sYear" class="num" min="2000" max="2099" step="1" value="${YEAR}"></div>
            <div class="field"><label for="sOpen">${t('set.opening')}</label>
              <input id="sOpen" class="num signed" placeholder="0,00" value="${opening()?nf.format(opening()):''}"></div>
          </div>
          <p class="note">${t('set.openingHint')} ${t('set.yearHint')}</p>
          <!-- Die einzige Netzverbindung, die FINA je aufbaut, und
               deshalb steht sie offen da — mit ihrer Adresse. Sie
               wirkt nur in der Mac- und der Windows-App: im Browser
               ist die Seite immer die neueste. Genau darum steht
               unter dem Haken, für wen er gilt. -->
          <div class="checklist wherelist"><label class="checkrow">
            <input type="checkbox" id="sUpd" ${state.updateCheck===false?'':'checked'}>
            <span class="clab">${t('set.upd')}</span><span class="chint">${t('set.updHint')}</span></label></div>`)}

        ${pane('view',t('set.navView'),t('set.viewSub'),`
          <div class="cols c3">
            <div class="field"><label for="sLabW">${t('set.labw')} (px)</label>
              <input type="number" id="sLabW" class="num" min="50" max="800" step="10" value="${state.labWidth}"></div>
            <div class="field"><label for="sMonW">${t('set.monw')} (px)</label>
              <input type="number" id="sMonW" class="num" min="50" max="400" step="10" value="${state.monWidth}"></div>
            <div class="field"><label for="sTopMin">${t('set.topmin')}</label>
              <input type="number" id="sTopMin" class="num" min="0" max="100000" step="5" value="${state.topMin}"></div>
          </div>
          <p class="note">${t('set.widthHint')} ${t('set.topminHint')}</p>
          <!-- Zwei Vorgaben fürs Öffnen, keine Schalter: gelesen
               werden sie beim Öffnen der Datei (afterLoad in
               js/state.js), danach entscheidet der Klick in der
               Ansicht — für diese Sitzung. Genau das sagen die
               beiden Sätze daneben.

               Sie stehen zusammen, weil sie dasselbe tun: die eine
               für die Auswertung der Monatsansicht (ui.ana), die
               andere für die abgeschlossenen Monate der
               Jahresansicht (ui.hideDone). -->
          <div class="checklist wherelist">
            <label class="checkrow">
              <input type="checkbox" id="sAna" ${state.anaOpen?'checked':''}>
              <span class="clab">${t('set.ana')}</span><span class="chint">${t('set.anaHint')}</span></label>
            <label class="checkrow">
              <input type="checkbox" id="sHideDone" ${state.hideDoneMonths?'checked':''}>
              <span class="clab">${t('set.hideDone')}</span><span class="chint">${t('set.hideDoneHint')}</span></label>
            <!-- Der dritte Haken derselben Art: er sagt, ob die
                 Anleitung sich dazustellt — neben der Ansicht,
                 sobald das Buch aufgeht, und neben den Schritten
                 des CSV-Imports. Vorgabe ist ja; wer den Haken
                 wegnimmt, öffnet sie nur noch selbst. -->
            <label class="checkrow">
              <input type="checkbox" id="sGuide" ${state.guideOpen===false?'':'checked'}>
              <span class="clab">${t('set.guide')}</span><span class="chint">${t('set.guideHint')}</span></label>
          </div>`)}

        ${pane('filter',t('flt.title'),t('flt.sub'),`
          <div class="checklist">${qfRows}</div>
          <!-- Der sechste Haken beantwortet eine andere Frage als
               die fünf darüber: nicht worin gesucht wird, sondern
               wo. Er steht deshalb abgesetzt und zählt bei
               „mindestens eins" nicht mit — kein data-qf. -->
          <div class="checklist wherelist"><label class="checkrow">
            <input type="checkbox" id="sQHidden" ${qAll()?'checked':''}>
            <span class="clab">${t('flt.fHidden')}</span><span class="chint">${t('flt.fHiddenHint')}</span></label></div>
          <p class="errline" id="sFltErr" hidden>${t('flt.needOne')}</p>`)}

        ${pane('banks',t('set.navBanks'),t('set.banksSub'),`
          <div class="cols c2 liststack">
            <div class="field">${listHead(t('set.banks'),'banks',t('set.addBank'))}<div>${pairRows(state.banks,'banks')}</div></div>
            <div class="field">${listHead(t('set.pays'),'pays',t('set.addPay'))}<div>${pairRows(state.pays,'pays')}</div></div>
          </div>`)}

        ${pane('groups',t('set.groups'),t('set.groupsSub'),`
          <!-- Drei Listen nebeneinander (seit 6.9.26; vorher zwei):
               Einnahmen · Flexibel · Regulär, in der Reihenfolge der
               Bereiche in Monat und Jahr. Ein Posten gehört immer in
               genau eine der drei Welten — nebeneinander sieht man
               das, untereinander läse sich die zweite Liste wie eine
               Fortsetzung der ersten. Die Farbe der Überschrift ist
               dieselbe wie die der Geldart in allen Ansichten. Jede
               Liste fängt mit ihrem festen „ohne Kategorie" an. -->
          <div class="cols c3 grouplists">
            <div class="field gl-in">${listHead(t('set.groupsIn'),'incomeGroups',t('set.addGroupIn'))}<div>${incGroupRows}</div></div>
            <div class="field gl-flex">${listHead(t('set.groupsFlex'),'flexGroups',t('set.addGroupFlex'))}<div>${flexGroupRows}</div></div>
            <div class="field gl-out">${listHead(t('set.groupsOut'),'groups',t('set.addGroup'))}<div>${groupRows}</div></div>
          </div>`)}


        <!-- Beide Wege holen Zahlen von außen herein und ändern die
             Datei; deshalb stehen sie beieinander — der eine ergänzt
             einzelne Monate, der andere ersetzt das ganze Buch. Das
             Fenster schließt sich vorher: der Import legt selbst
             Kategorien an, und eine Liste, die noch im Fenster
             steht, überschriebe sie beim Speichern.
             **Nur das Nötigste** (5.9.26 spät): die Knöpfe in einer
             Reihe, was jeder tut in seiner Sprechblase — die Sätze
             darunter machten aus vier Handgriffen eine Seite Text.
             Dazwischen der Knopf für die Importkriterien aller
             Posten (openImpRules('all')): sie wohnen an den Posten,
             und dies ist die eine Stelle, an der man sie beisammen
             sieht, ohne den Import zu öffnen. -->
        ${pane('import',t('set.navImport'),t('set.importSub'),`
          <!-- Drei Abschnitte (6.9.26 abends): **CSV-Daten** — hier nur
               noch der Weg zurück, importiert wird über das Menü der
               Kopfzeile —, **Importkriterien** und die **gemerkten
               Strukturen**. Der Tabellenimport (FINA-Tabelle) ist
               samt Funktion heraus. Je Abschnitt eine Überschrift
               und darunter der Knopf (seit 6.9.26 spät; davor
               daneben) — die gemerkten Strukturen als Knöpfe
               derselben Bauart, einer je Zeile. -->
          <div class="field impsec"><div class="impline">
            <label>${t('set.impSecCsv')}</label>
            <button class="btn delbtn" id="impWipe"${importCount().any?'':' disabled'} data-tip="${esc(t('set.impWipeHint'))}">${t('set.impWipe')}</button></div></div>
          <div class="field impsec"><div class="impline">
            <label>${t('set.impSecCrit')}</label>
            <button class="btn" id="impCrit" data-tip="${esc(t('c2.mnCritTip'))}">${t('set.impCrit')}</button></div></div>
          <!-- Die gemerkten Strukturen: je Datei-Art ein Knopf
               (mapRows oben) — wiedererkannt wird eine Datei am
               Fingerabdruck ihrer Spaltenköpfe; der Knopf öffnet das
               Fenster, in dem geändert und gelöscht wird. -->
          <div class="field impmaps impsec">
            <label>${t('set.impSecMaps')}</label>
            ${mapRows||`<p class="note">${t('set.csvMapsNone')}</p>`}</div>`)}
      </div>
    </div>
    </div>
    <!-- Ende der .dbody — die Knopfzeile darunter scrollt nicht. -->

    <div class="row-end"><button class="btn" id="lCancel">${t('g.cancel')}</button><button class="btn primary" id="lSave">${t('g.save')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box); bindSign(box);

  /* ── Getipptes darf nicht stillschweigend verlorengehen ───────
     Der Weg in den Import schließt dieses Fenster (leaveTo unten):
     ein Import legt selbst Kategorien an, und ein Fenster, das
     daneben stehen bliebe, schriebe seine alten Listen beim
     Speichern zurück. Vorher übernahm `leaveTo` alles stumm — auch
     eine halb getippte Zeile. Jetzt wird **gefragt**, aber nur,
     wenn wirklich etwas anders steht als beim Öffnen.

     Verglichen wird der Stand aller Felder als eine Zeichenkette.
     Das ist grob und genau richtig: es geht nicht darum, *was*
     anders ist, sondern *ob*. Nach „+", Entfernen und Sortieren
     baut sich das Fenster neu auf (reopen) — die Marke wird dabei
     neu gesetzt, denn diese Wege haben ihre Änderung schon
     übernommen. */
  const formSig=()=>[...box.querySelectorAll('input,select,textarea')]
    .map(el=>el.type==='checkbox'?(el.checked?'1':'0'):el.value).join('\u0001');
  const sig0=formSig();

  /* Kommt das Fenster wegen eines bestimmten Feldes, steht die
     Schreibmarke darin und der Wert markiert da: tippen ersetzt ihn,
     wer ihn behalten will, drückt eine Pfeiltaste — dieselbe Regel
     wie beim Hineinklicken (siehe „Ein Feld anklicken heißt:
     überschreiben" in js/app.js) und wie beim hervorgehobenen Monat
     im Posten-Fenster. Sonst bekommt nichts den Fokus: wer die
     Einstellungen von sich aus öffnet, sucht sich selbst, was er
     ändern will. */
  const want=focus?box.querySelector('#'+focus):null;
  if(want){ want.focus(); want.select(); }
  /* Nach „+": die Schreibmarke steht im ersten Feld der neuen Zeile
     (siehe setFocusNew oben), und die Zeile ist ins Bild gerollt —
     eine lange Liste hat sie sonst unterhalb der Rollfläche. */
  if(setFocusNew){
    const el=box.querySelector(`[data-k="${setFocusNew.k}"][data-i="${setFocusNew.i}"]`);
    setFocusNew=null;
    if(el){ el.scrollIntoView({block:'nearest'}); el.focus(); }
  }

  /* Der Rückweg läuft auf jedem Weg hinaus — Speichern, Abbrechen,
     Klick daneben, Escape —, aber **nur einmal**: `reopen()` baut das
     Fenster neu auf und nimmt ihn mit, das alte darf ihn dann nicht
     schon ausgelöst haben. */
  let handed=false;
  const handBack=()=>{ if(handed||!done) return; handed=true; done(); };

  /* Bereich wechseln — nur Sichtbarkeit, nichts wird neu gebaut.
     Getipptes bleibt dadurch stehen, auch in den Bereichen, die
     gerade nicht zu sehen sind. Das Menü links und die
     Aufklappliste im schmalen Fenster führen beide hierher, dazu
     die beiden Schrittknöpfe ‹ › — am Rand der Liste ist Schluss,
     wie bei den Monaten. */
  /* Der Wechsel ist animiert (seit 6.9.26, boxSwap in js/ui.js):
     der Bereich rechts blendet aus, das Fenster nimmt seine neue
     Höhe an — das Menü links fährt mit —, der neue Bereich blendet
     ein. paneNow() ist der eigentliche Wechsel, showPane() hüllt ihn
     in die Bewegung; beim ersten Aufbau ist es kein Wechsel. */
  const showPane=k=>{
    if(k===setPane){ paneNow(k); return; }
    const bx=box.querySelector('.box');
    if(bx&&bx.isConnected) boxSwap(bx,()=>paneNow(k)); else paneNow(k);
  };
  const paneNow=k=>{
    setPane=k;
    box.querySelectorAll('[data-sect]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.sect===k));
    box.querySelectorAll('.setpane').forEach(p=>{ p.hidden=p.dataset.pane!==k; });
    const i=NAV.findIndex(([n])=>n===k);
    box.querySelector('#setSel').value=k;
    box.querySelector('#setPrev').disabled=i<=0;
    box.querySelector('#setNext').disabled=i>=NAV.length-1;
  };
  box.querySelectorAll('[data-sect]').forEach(b=>b.onclick=()=>showPane(b.dataset.sect));
  box.querySelector('#setSel').onchange=e=>showPane(e.target.value);
  box.querySelector('#setPrev').onclick=()=>{ const i=NAV.findIndex(([n])=>n===setPane); if(i>0) showPane(NAV[i-1][0]); };
  box.querySelector('#setNext').onclick=()=>{ const i=NAV.findIndex(([n])=>n===setPane); if(i<NAV.length-1) showPane(NAV[i+1][0]); };

  /* Die Meldung „mindestens eins" verschwindet, sobald wieder ein
     Kästchen angekreuzt ist — sie soll nicht neben einer Wahl
     stehen, die inzwischen gilt. */
  const qfBoxes=()=>[...box.querySelectorAll('[data-qf]')];
  qfBoxes().forEach(cb=>cb.onchange=()=>{
    if(qfBoxes().some(c=>c.checked)) box.querySelector('#sFltErr').hidden=true;
  });

  /* Liest den aktuellen Stand aller vier Listen aus dem Fenster. */
  const collect=()=>{
    const d={banks:[],pays:[],groups:[],incomeGroups:[],flexGroups:[]};
    ['banks','pays'].forEach(k=>{
      const idx=[...new Set([...box.querySelectorAll(`[data-k="${k}"]`)].map(i=>+i.dataset.i))].sort((a,b)=>a-b);
      idx.forEach(i=>{
        const code=box.querySelector(`[data-k="${k}"][data-i="${i}"][data-f="code"]`).value.trim();
        const label=box.querySelector(`[data-k="${k}"][data-i="${i}"][data-f="label"]`).value.trim();
        d[k].push({code,label:label||code});
      });
    });
    ['groups','incomeGroups','flexGroups'].forEach(k=>{
      [...box.querySelectorAll(`[data-k="${k}"]`)].forEach(inp=>d[k].push(inp.value.trim()));
    });
    return d;
  };

  /* Die Felder im Block „Allgemein". Sie gelten sofort für den
     Zustand, damit ein Neuaufbau des Fensters sie nicht verliert. */
  const num=(id,min,max)=>{
    const v=parseInt(box.querySelector(id).value,10);
    return isNaN(v)?null:Math.min(max,Math.max(min,v));
  };                                   /* 0 ist gültig: dann zählt jede Buchung */
  const applyGeneral=()=>{
    /* Eine gewöhnliche Zuweisung, **nicht** chooseLang(): das hier
       ist die Sprache dieser Datei und geht die Webseite nichts an
       (siehe „Die Sprachwahl gilt überall" in CLAUDE.md). Wer ein
       Buch auf Deutsch führt, hat damit nicht gesagt, dass er die
       Verkaufsseiten auf Deutsch lesen will. */
    state.lang=box.querySelector('#sLang').value==='de'?'de':'en';
    const y=num('#sYear',2000,2099); if(y) state.year=y;
    /* Der Anfangsbestand darf jede Zahl sein — auch eine negative
       und auch die Null. Ein leeres Feld heißt „kein Anfangs-
       bestand", also null; deshalb kein `if`. */
    state.opening=parseGermanNumber(box.querySelector('#sOpen').value);
    const lw=num('#sLabW',50,800); if(lw) state.labWidth=lw;
    const mw=num('#sMonW',50,400); if(mw) state.monWidth=mw;
    const tm=num('#sTopMin',0,100000); if(tm!=null) state.topMin=tm;
    state.updateCheck=box.querySelector('#sUpd').checked;
    /* Die Auswertung: **geändert heißt jetzt so.** Der Haken ist die
       Vorgabe fürs Öffnen (ui.ana in afterLoad), aber ein Haken, der
       erst beim nächsten Laden etwas tut, sieht kaputt aus. Nur
       geändert — sonst risse ein Speichern in den Einstellungen die
       Leiste zu, die man vorher von Hand aufgeklappt hat. */
    const ana=box.querySelector('#sAna').checked;
    if(ana!==!!state.anaOpen) ui.ana=ana;
    state.anaOpen=ana;
    /* Dieselbe Regel für die abgeschlossenen Monate der
       Jahresansicht: nur geändert wirkt sofort — sonst risse ein
       Speichern in den Einstellungen die Spalten weg, die man
       vorher von Hand wieder eingeblendet hat. */
    const hdm=box.querySelector('#sHideDone').checked;
    if(hdm!==!!state.hideDoneMonths) ui.hideDone=hdm;
    state.hideDoneMonths=hdm;
    /* Dieselbe Regel für die Anleitung: **geändert heißt jetzt so.**
       Wer den Haken setzt, bekommt sie auf der Stelle zu sehen; wer
       ihn wegnimmt, wird sie los. Ungeändert bleibt sie, wie sie
       ist — sonst risse ein Speichern in den Einstellungen den
       Bereich zu, den man vorher von Hand aufgeklappt hat. */
    const gop=box.querySelector('#sGuide').checked;
    if(gop!==(state.guideOpen!==false)){
      if(gop){ if(!isMobile()) openGuide(); }   /* auf dem Telefon deckt er die Seite zu */
      else if(guideOpen()) closeGuide();
    }
    state.guideOpen=gop;
    /* ── Worin der Suchbegriff sucht (Bereich „Filter") ─────────
       Eine leere Wahl wird nicht übernommen: ein Suchbegriff, der
       nirgends sucht, fände nie etwas. Das Speichern weist sie
       unten eigens zurück (#lSave); jeder andere Weg hierher —
       „+", Sortieren, Sprachwechsel — behält dann die letzte
       gültige Wahl. */
    const qf={}; let anyQf=false;
    box.querySelectorAll('[data-qf]').forEach(cb=>{ qf[cb.dataset.qf]=cb.checked; anyQf=anyQf||cb.checked; });
    if(anyQf) state.filterFields=qf;
    state.qHidden=box.querySelector('#sQHidden').checked;
  };

  /* ── Geänderte Kürzel ─────────────────────────────────────────
     Banken und Zahlungsarten hängen über ihr Kürzel an den Posten
     (`it.bank`, `it.pay`). Wird ein Kürzel geändert, passen die
     Posten zu keinem Listeneintrag mehr.

     Anders als bei den Kategorien (Regel 2) wandern sie hier
     nicht selbständig mit: das Kürzel steht auch so in der
     Jahresübersicht, und ein alter Wert kann gewollt sein. Der
     Nutzer entscheidet — gefragt wird einmal für alle Änderungen
     zusammen, mit Zahl und Folge. */
  const codeField=key=>key==='banks'?'bank':'pay';
  const codedItems=()=>state.fixed.concat(state.balance?[state.balance]:[]);
  const codeUse=(field,code)=>code?codedItems().filter(it=>it[field]===code).length:0;

  /* Vergleicht Zeile für Zeile mit dem Stand VOR der Zuweisung.
     Muss also laufen, bevor state.banks/state.pays überschrieben
     werden. */
  const scanCodes=(key,arr)=>{
    const field=codeField(key), before=state[key], moves=[];
    arr.forEach((x,i)=>{
      const old=before[i]&&before[i].code;
      if(!old||!x.code||x.code===old) return;
      const n=codeUse(field,old);
      if(n) moves.push({old,neu:x.code,n});
    });
    return {field,moves};
  };

  const askCarryCodes=changes=>{
    const hit=changes.filter(c=>c.moves.length);
    if(!hit.length) return;
    const list=hit.flatMap(c=>c.moves.map(m=>`${m.old} → ${m.neu} (${m.n})`)).join(', ');
    const total=hit.reduce((s,c)=>s+c.moves.reduce((a,m)=>a+m.n,0),0);
    if(!confirm(t('set.codeAsk',list,total))){ toast(t('set.codeKept',total)); return; }
    /* Ein Durchgang je Posten, über eine Zuordnung — sonst würde
       ein Tausch zweier Kürzel (A→B, B→A) sich selbst überholen. */
    hit.forEach(c=>{
      const map=new Map(c.moves.map(m=>[m.old,m.neu]));
      codedItems().forEach(it=>{ if(map.has(it[c.field])) it[c.field]=map.get(it[c.field]); });
    });
    toast(t('set.codeDone',total));
  };

  /* Vergleicht Zeile für Zeile mit dem Stand vor dem Tippen und
     benennt um. Ein bereits vergebener Name wird zurückgesetzt. */
  const applyRenames=(key,names)=>{
    const before=state[key].slice(), taken=[];
    names.forEach((name,i)=>{
      const old=before[i];
      if(!name||!old||name===old) return;
      /* Ein Name darf **in beiden Listen zusammen** nur einmal
         vorkommen: isIncome() entscheidet allein am Namen, ob ein
         Posten eine Einnahme ist — derselbe Name auf beiden Seiten
         machte das unentscheidbar. Deshalb wird bei den
         Kategorielisten auch gegen die jeweils andere geprüft. */
      /* Seit 6.9.26 drei Listen (flexGroups dazu) — geprüft wird gegen
         die beiden anderen; ein fester Schlüssel ist nie zu vergeben. */
      const others = key==='groups' ? state.incomeGroups.concat(state.flexGroups)
                   : key==='incomeGroups' ? state.groups.concat(state.flexGroups)
                   : key==='flexGroups' ? state.groups.concat(state.incomeGroups) : null;
      const collision = names.some((n,j)=>j!==i&&n===name)||(others||[]).includes(name)||isNoCat(name);
      if(collision){ names[i]=old; taken.push(name); return; }
      if(key==='flexGroups') renameFlexGroup(old,name);
      else renameGroup(old,name);
    });
    return taken;
  };

  /* Schreibt den Fensterstand zurück. Läuft vor jedem Neuaufbau
     und beim Speichern. */
  const applyEdits=()=>{
    applyGeneral();
    const d=collect();
    const taken=[...applyRenames('groups',d.groups),...applyRenames('incomeGroups',d.incomeGroups),
                 ...applyRenames('flexGroups',d.flexGroups)];
    /* Erst schauen, was sich am Kürzel geändert hat — danach
       überschreiben und fragen. */
    const codeChanges=[scanCodes('banks',d.banks),scanCodes('pays',d.pays)];
    state.banks=d.banks; state.pays=d.pays;
    askCarryCodes(codeChanges);
    state.groups=d.groups; state.incomeGroups=d.incomeGroups; state.flexGroups=d.flexGroups;
    if(taken.length) warn(t('set.taken',taken.join(', ')));
  };

  /* Eine mit „+" angelegte, aber nie ausgefüllte Zeile ist keine
     Angabe: sie verschwindet, sobald das Fenster geht — auf
     welchem Weg auch immer. */
  const tidy=()=>{
    state.banks=state.banks.filter(x=>x.code);
    state.pays=state.pays.filter(x=>x.code);
    state.groups=state.groups.filter(Boolean);
    state.incomeGroups=state.incomeGroups.filter(Boolean);
  };
  const closeSettings=()=>{ tidy(); closeModal(box); handBack(); };

  box._close=closeSettings;          /* auch für Escape (js/ui.js) */

  /* Neu aufbauen heißt: dasselbe Fenster noch einmal, **im Bereich,
     der gerade zu sehen ist**, mit demselben Rückweg. Bis 5.9.26
     ging `where` mit — der Bereich, wegen dem das Fenster geöffnet
     wurde: wer aus dem Posten-Fenster über „Kategorien pflegen"
     kam, dann zu den Banken wechselte und dort „+" drückte, stand
     danach wieder bei den Kategorien. Der Link sagt nur, wo es
     losgeht; danach ist jeder Bereich frei. `setPane` führt
     showPane() nach, und ein Bereichsname setzt in openSettings()
     keinen Fokus auf ein Feld. Ohne den Rückweg erführe das Fenster
     darunter nie, dass es neue Einträge gibt. */
  const reopen=()=>{ box.remove(); openSettings(setPane,done); };

  /* Die Sprache wirkt sofort — das Fenster selbst wechselt mit. */
  box.querySelector('#sLang').onchange=()=>{ applyEdits(); save(); reopen(); renderChrome(); };

  /* ── Der Bereich „Import" ─────────────────────────────────
     Beide Wege legen selbst Kategorien an — der eine neue
     Hauptkategorien, der andere gleich alle. Bliebe das
     Einstellungsfenster daneben stehen, schriebe sein
     „Speichern" die Listen zurück, die vor dem Import im
     Fenster standen, und der Import wäre wieder weg. Deshalb
     wird hier übernommen und geschlossen, wie beim Wechsel der
     Sprache — nur ohne Neuaufbau. */
  /* **Mit den Einstellungen geht alles, was darunter liegt.** Ein
     Import ändert das Buch als Ganzes; ein Posten- oder
     Kategorie-Fenster, das darunter noch offen stünde, schriebe
     seinen Stand danach in ein Buch, das es so nicht mehr gibt.
     Deshalb kein Rückweg (`handBack`) — es gibt nichts mehr, wohin. */
  const leaveTo=open=>{
    /* Geändert und nicht gespeichert? Dann entscheidet der Nutzer.
       Abgelehnt heißt **verwerfen**, nicht „hierbleiben": gefragt
       wurde nach dem Speichern, und der Weg in den Import ist mit
       dem Klick darauf schon beschlossen. */
    if(formSig()!==sig0){
      if(confirm(t('set.leaveSave'))){ applyEdits(); tidy(); save(); }
    }else{ tidy(); }
    document.querySelectorAll('.modal').forEach(m=>m.remove());
    render(); open(); };
  /* Eine gemerkte Zuordnung vergessen. Am Buch ändert das nichts —
     schon importierte Zahlen bleiben stehen —, nur der nächste
     Import dieser Datei-Art fängt wieder bei der Feldzuordnung an.
     Gefragt wird trotzdem: was der Wizard einmal gelernt hat, ist
     ein paar Klicks wert, und zurückholen lässt es sich nicht. */
  /* Der Stift öffnet seit 5.9.26 spät die **Struktur** (Art und
     Feldverknüpfung), nicht mehr die Filterkriterien: die
     Importkriterien wohnen an den Posten und stehen in deren
     Fenstern — gesammelt hinter #impCrit oben und im ☰-Menü des
     CSV-Imports. */
  /* **Die Zeile öffnet die Struktur**: das Fenster openCsvStructure
     (js/dialogs/csv2-wizard.js) legt sich über die Einstellungen,
     mit `reopen` als Rückweg — die Zeile darunter soll danach den
     neuen Namen zeigen oder weg sein (gelöscht wird seit 6.9.26
     spät dort, mit dem roten Knopf). Getipptes wird vorher
     übernommen, aber nur, wenn sich etwas geändert hat (formSig):
     ein Klick, der das Buch schon vom Öffnen schmutzig machte,
     fragte beim Schließen nach Änderungen, die niemand gemacht
     hat. */
  box.querySelectorAll('[data-cmed]').forEach(b=>b.onclick=()=>{
    if(formSig()!==sig0){ applyEdits(); save(); }
    openCsvStructure(b.dataset.cmed,reopen);
  });
  /* **Alle Importkriterien** — regulär und flexibel, gegliedert wie
     der Zielbereich des Imports. Ohne Rückweg: das Fenster schreibt
     an die Posten, in den Einstellungen ändert sich dadurch nichts,
     und ein Neuaufbau nähme Getipptes mit. */
  box.querySelector('#impCrit').onclick=()=>openImpRules('all');
  /* Alle importierten Daten löschen — nach Rückfrage, die die
     Zahlen nennt. Getipptes wird vorher übernommen, wie bei jedem
     Handgriff, der das Fenster neu aufbaut; das Buch ändert sich
     sofort (save), in die Datei kommt es mit „Daten speichern". */
  box.querySelector('#impWipe').onclick=()=>{
    const c=importCount();
    if(!c.any) return;
    if(!confirm(t('set.impWipeAsk',c.items,c.tx,c.months))) return;
    applyEdits();
    wipeAllImports();
    save(); render(); reopen();
    toast(t('set.impWipeDone',c.items,c.tx));
  };

  /* ── Sortieren per Ziehen ───────────────────────────────── */
  let dragFrom=null,dragList=null;
  box.querySelectorAll('.listrow').forEach(row=>{
    row.addEventListener('dragstart',ev=>{
      dragFrom=+row.dataset.idx; dragList=row.dataset.list;
      row.classList.add('dragging'); ev.dataTransfer.effectAllowed='move';
      try{ev.dataTransfer.setData('text/plain',String(dragFrom));}catch(e){}
    });
    row.addEventListener('dragend',()=>{row.classList.remove('dragging');
      box.querySelectorAll('.listrow').forEach(r=>r.classList.remove('over'));});
    row.addEventListener('dragover',ev=>{
      if(row.dataset.list!==dragList) return;
      ev.preventDefault(); ev.dataTransfer.dropEffect='move'; row.classList.add('over');
    });
    row.addEventListener('dragleave',()=>row.classList.remove('over'));
    row.addEventListener('drop',ev=>{
      ev.preventDefault();
      if(row.dataset.list!==dragList) return;
      const to=+row.dataset.idx;
      if(dragFrom===null||to===dragFrom) return;
      applyEdits();
      const arr=state[dragList];
      arr.splice(to,0,arr.splice(dragFrom,1)[0]);
      reopen();
    });
  });

  /* ── Hinzufügen ─────────────────────────────────────────── */
  box.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{
    applyEdits();
    const k=b.dataset.add;
    if(k==='groups'||k==='incomeGroups'||k==='flexGroups') state[k].push('');
    else state[k].push({code:'',label:''});
    setFocusNew={k:k,i:state[k].length-1};
    reopen();
  });

  /* ── Entfernen ──────────────────────────────────────────── */
  box.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.rm, i=+b.dataset.ri;

    /* Die Posten einer entfernten Kategorie ziehen nach „ohne
       Kategorie" **derselben** Liste (seit 6.9.26; vorher in die
       erste verbliebene) — das ist immer da, also gibt es auch keine
       letzte Kategorie mehr, die das Fenster festhalten müsste. Der
       feste Eintrag selbst hat kein ✕ (nameRows). */
    if(k==='groups'||k==='incomeGroups'||k==='flexGroups'){
      const old=state[k][i];
      if(isNoCat(old)) return;
      const used=k==='flexGroups'?flexGroupUseCount(old):groupUseCount(old);
      const home=k==='groups'?NOCAT_OUT:(k==='incomeGroups'?NOCAT_IN:NOCAT_FLEX);
      if(used&&!confirm(t('set.moveAsk',old,used,keyLabel(home)))) return;
    }

    applyEdits();
    if(k==='groups'||k==='incomeGroups'){
      const name=state[k][i];
      state[k].splice(i,1);
      /* Die Posten ziehen nach „ohne Kategorie" **derselben** Liste —
         eine Einnahme darf nicht bei den Kosten landen. */
      dropGroup(name,k==='groups'?NOCAT_OUT:NOCAT_IN);
    } else if(k==='flexGroups'){
      const name=state[k][i];
      state[k].splice(i,1);
      dropFlexGroup(name);
    } else state[k].splice(i,1);
    reopen();
  });

  /* ── Abbrechen und Speichern ────────────────────────────── */
  box.querySelector('#lCancel').onclick=closeSettings;
  box.onclick=e=>{if(e.target===box)closeSettings();};

  box.querySelector('#lSave').onclick=()=>{
    /* Mindestens ein Kästchen der Suche bleibt stehen (siehe
       js/state.js): die leere Wahl wird nicht gespeichert, sondern
       gezeigt — der Bereich klappt auf und sagt in Rot, warum. */
    if(![...box.querySelectorAll('[data-qf]')].some(cb=>cb.checked)){
      showPane('filter');
      box.querySelector('#sFltErr').hidden=false;
      box.querySelector('[data-qf]').focus();
      return;
    }
    /* Womit die Einnahmen hereinkamen — gebraucht wird das erst
       unten, gelesen werden muss es hier: applyEdits() schreibt die
       Liste im nächsten Schritt um. */
    const inBefore=state.incomeGroups.slice();
    applyEdits();                     /* enthält die Umbenennungen */
    state.banks=state.banks.filter(x=>x.code);
    state.pays=state.pays.filter(x=>x.code);
    state.groups=[...new Set(state.groups.filter(Boolean))];
    /* **Keine Einnahme-Kategorie ist erlaubt** — ein frisch
       angefangenes Buch hat keine, und wer die letzte leert, meint
       es so. Zurück kommt nur, worauf noch ein Posten zeigt: ohne
       seine Kategorie entschiede isIncome() ihn stillschweigend zu
       den Kosten, und seine Zeile wechselte den Block. Die letzte
       Kategorie **in Gebrauch** gibt das Fenster ohnehin nicht her
       (siehe das Entfernen weiter oben) — hier bleibt der Weg über
       das geleerte Namensfeld. */
    state.incomeGroups=[...new Set(state.incomeGroups.filter(Boolean))];
    if(!state.incomeGroups.length)
      state.incomeGroups=inBefore.filter(g=>state.fixed.some(it=>it.group===g));
    save(); box.remove(); render(); toast(t('set.saved')); handBack();
  };
}

/* Alte Fundstellen (data-lists, Link im Posten-Fenster) zeigen
   weiterhin hierher. */
const editLists=openSettings;
