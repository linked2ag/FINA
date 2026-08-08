/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Worin gesucht wird"
   Hinter dem Hamburger-Knopf vor jedem Suchfeld: fünf Kästchen,
   die sagen, welche Teile einer Zeile der Suchbegriff durchsucht,
   und darunter abgesetzt ein sechster — der sagt, ob auch die
   ausgeblendeten Positionen durchsucht werden (state.qHidden,
   siehe qAll() in js/state.js).
   Gerechnet wird damit in hayItem()/hayKak() (js/calc.js),
   gespeichert wird die Wahl in der Datei (state.filterFields,
   siehe js/state.js).

   Geändert wird erst mit „Speichern" — wer abbricht oder das
   Fenster schließt, lässt den Filter, wie er war. Und mindestens
   ein Kästchen muss stehen bleiben: ein Suchbegriff, der nirgends
   sucht, fände nie etwas und sähe aus wie ein Fehler. Das
   Speichern weist die leere Wahl deshalb zurück und sagt unten in
   Rot, warum.
   ══════════════════════════════════════════════════════════════ */

/* Reihenfolge der Kästchen: erst, was an der Zeile steht, dann
   die Zahlen, zuletzt die Kürzel. */
const QFIELD_ROWS=()=>[
  ['name',  t('flt.fName'),  t('flt.fNameHint')],
  ['note',  t('flt.fNote'),  t('flt.fNoteHint')],
  ['amount',t('flt.fAmount'),t('flt.fAmountHint')],
  ['total', t('flt.fTotal'), t('flt.fTotalHint')],
  ['meta',  t('flt.fMeta'),  t('flt.fMetaHint')]
];

function openFilterFields(){
  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box" style="max-width:620px">
    <h3>${t('flt.title')}</h3>
    <p class="subline">${t('flt.sub')}</p>
    <div class="checklist">${QFIELD_ROWS().map(([k,lab,hint])=>
      `<label class="checkrow"><input type="checkbox" data-qf="${k}" ${qField(k)?'checked':''}>
        <span class="clab">${lab}</span><span class="chint">${hint}</span></label>`).join('')}</div>
    <!-- Der sechste Haken beantwortet eine andere Frage als die
         fünf darüber: nicht worin gesucht wird, sondern wo. Er
         steht deshalb abgesetzt und zählt bei „mindestens eins"
         nicht mit — ein eigenes Attribut, nicht data-qf. -->
    <div class="checklist wherelist"><label class="checkrow">
      <input type="checkbox" id="ffHidden" ${qAll()?'checked':''}>
      <span class="clab">${t('flt.fHidden')}</span><span class="chint">${t('flt.fHiddenHint')}</span></label></div>
    <p class="errline" id="ffErr" hidden>${t('flt.needOne')}</p>
    <div class="row-end">
      <button class="btn" id="ffCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="ffSave">${t('g.save')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);

  const boxes=()=>[...box.querySelectorAll('[data-qf]')];
  const err=box.querySelector('#ffErr');
  /* Die Meldung verschwindet, sobald wieder etwas angekreuzt ist —
     sie soll nicht neben einer Wahl stehen, die inzwischen gilt. */
  boxes().forEach(cb=>cb.onchange=()=>{ if(boxes().some(c=>c.checked)) err.hidden=true; });

  box.querySelector('#ffCancel').onclick=()=>closeModal(box);
  box.onclick=ev=>{if(ev.target===box)closeModal(box);};

  box.querySelector('#ffSave').onclick=()=>{
    const on=boxes().filter(cb=>cb.checked);
    if(!on.length){ err.hidden=false; boxes()[0].focus(); return; }
    const o={};
    boxes().forEach(cb=>{ o[cb.dataset.qf]=cb.checked; });
    state.filterFields=o;
    state.qHidden=box.querySelector('#ffHidden').checked;
    /* Die Wahl gehört in die Datei — deshalb save(). Und wie bei
       den Filterknöpfen: steht im Suchfeld etwas, geht der Fokus
       danach dorthin zurück, man tippt ja weiter. */
    save(); box.remove(); keepQFocus(); render();
  };

  boxes()[0].focus();
}
