/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „CSV-Import aus Fast Budget"
   Zwei Schritte zwischen Datei und Zustand:
     1. Monate wählen — die Datei ist gelesen, nichts ist geändert.
        Vorausgewählt sind alle Monate, die in der Datei stehen.
     2. Ersetzen bestätigen — zeigt je Monat, was gelöscht und was
        dafür eingesetzt wird.
   Erst der letzte Knopf ruft applyImport() aus js/csv.js. Bis
   dahin führt jeder Weg zurück, ohne Spuren zu hinterlassen.
   ══════════════════════════════════════════════════════════════ */

function openImport(rows,fileName){
  const scan=scanImport(rows);
  if(!scan.mine.length){
    toast(t('imp.noYear',YEAR,scan.skipped?t('imp.otherYears',scan.skipped):''));
    return;
  }

  const inFile={};                       /* Monat → {m,count,sum} */
  scan.months.forEach(o=>inFile[o.m]=o);
  const chosen=new Set(scan.months.map(o=>o.m));   /* Vorauswahl: alles aus der Datei */

  const shell=inner=>{
    const box=document.createElement('div');
    box.className='modal'; box.innerHTML=inner;
    document.body.appendChild(box);
    box.onclick=ev=>{ if(ev.target===box) closeModal(box); };
    return box;
  };

  /* ── Schritt 1: Monate wählen ───────────────────────────── */
  function step1(){
    const cells=MONTHS.map((name,i)=>{
      const m=i+1, o=inFile[m], tg=importTarget(m);
      return `<div class="cell${o?'':' lockedcell'}">
        <label class="cellhead" style="cursor:${o?'pointer':'default'}">
          <span style="display:flex;align-items:center;gap:6px">
            <input type="checkbox" data-im="${m}" style="width:auto" ${o?'':'disabled'} ${o&&chosen.has(m)?'checked':''}>
            <span class="mlab ${m===CUR?'curm':''}">${name}</span></span>
          ${o&&tg.src?`<span class="lock corr" title="${t('imp.replacesTip')}">${t('imp.replaces')}</span>`:''}</label>
        <div class="cellnote">${o?`${o.count} ${o.count===1?t('g.booking'):t('g.bookings')}<br>${eur(o.sum)}`:t('imp.notInFile')}</div></div>`;
    }).join('');

    const box=shell(`<div class="box" style="max-width:820px">
      <h3>${t('imp.step1')}</h3>
      <p class="subline">${t('imp.step1Sub',esc(fileName||'CSV'),scan.mine.length,YEAR,scan.first,scan.last,
        scan.skipped?t('imp.skipped',scan.skipped):'')}</p>
      <div class="field"><label>${t('imp.months')}</label><div class="mgrid">${cells}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn small" id="iAll">${t('imp.allFromFile')}</button>
        <button class="btn small" id="iNone">${t('g.none')}</button>
        <span class="note" id="iCount"></span></div>
      <div class="row-end"><button class="btn" id="iCancel">${t('g.cancel')}</button>
        <button class="btn primary" id="iNext">${t('g.next')}</button></div></div>`);

    const boxes=()=>[...box.querySelectorAll('[data-im]')];
    const refresh=()=>{
      box.querySelector('#iCount').textContent=chosen.size?t('imp.chosen',chosen.size):t('imp.chosenNone');
      box.querySelector('#iNext').disabled=!chosen.size;
    };
    boxes().forEach(cb=>cb.onchange=()=>{
      const m=+cb.dataset.im;
      cb.checked?chosen.add(m):chosen.delete(m);
      refresh();
    });
    box.querySelector('#iAll').onclick=()=>{
      boxes().forEach(cb=>{ if(!cb.disabled){cb.checked=true;chosen.add(+cb.dataset.im);} }); refresh();};
    box.querySelector('#iNone').onclick=()=>{
      boxes().forEach(cb=>cb.checked=false); chosen.clear(); refresh();};
    box.querySelector('#iCancel').onclick=()=>closeModal(box);
    box.querySelector('#iNext').onclick=()=>{ if(!chosen.size) return; box.remove(); step2(); };
    refresh();
  }

  /* ── Schritt 2: Ersetzen bestätigen ─────────────────────── */
  function step2(){
    const pick=[...chosen].sort((a,b)=>a-b);
    const rowsHtml=pick.map(m=>{
      const o=inFile[m], tg=importTarget(m);
      const before=tg.src
        ? `${tg.tx} ${tg.tx===1?t('g.booking'):t('g.bookings')} · ${esc(tg.src)}${tg.corr?t('imp.corrections',tg.corr):''}`
        : t('imp.noImportYet');
      return `<tr><td>${MONTHS_LONG[m-1]}</td>
        <td>${before}<div class="note">${eur(kakeiboFor(m))}</div></td>
        <td>${o.count} ${o.count===1?t('g.booking'):t('g.bookings')} · Fast Budget<div class="note">${eur(o.sum)}</div></td></tr>`;
    }).join('');

    const box=shell(`<div class="box" style="max-width:760px">
      <h3>${t('imp.step2')}</h3>
      <p class="subline">${t('imp.step2Sub',pick.length)}</p>
      <table class="ledger">
        <tr><th>${t('g.month')}</th><th>${t('imp.before')}</th><th>${t('imp.after')}</th></tr>${rowsHtml}</table>
      ${scan.newCats.length?`<p class="note" style="margin-top:12px">${t('imp.newCats',scan.newCats.map(k=>esc(keyLabel(k))).join(', '))}</p>`:''}
      <p class="note" style="margin-top:12px">${t('imp.saveHint')}</p>
      <div class="row-end"><button class="linkish" id="iBack" style="margin-right:auto">${t('imp.backToMonths')}</button>
        <button class="btn" id="iCancel">${t('g.cancel')}</button>
        <button class="btn danger" id="iGo">${t('imp.go')}</button></div></div>`);

    box.querySelector('#iBack').onclick=()=>{ box.remove(); step1(); };
    box.querySelector('#iCancel').onclick=()=>closeModal(box);
    box.querySelector('#iGo').onclick=()=>{
      const res=applyImport(scan.rows,pick);
      box.remove();
      ui.view='kakeibo'; ui.month=pick[0]; render();
      let msg=t('imp.done',res.count,res.months.map(m=>MONTHS[m-1]).join(', '));
      if(res.dropped) msg+=t('imp.dropped',res.dropped);
      if(res.skipped) msg+=t('imp.outside',res.skipped,YEAR);
      if(res.added.length) msg+=t('imp.added',res.added.map(keyLabel).join(', '));
      toast(msg);
    };
  }

  step1();
}
