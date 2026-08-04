/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Flexible Payments — Kategorie"
   Name, Link, Betragsart und die zwölf Monatswerte einer
   Kakeibo-Kategorie — dasselbe Fenster für eine neue wie für eine
   vorhandene, genau wie beim regelmäßigen Posten. Importierte
   Monate sind gesperrt; wird ein Wert dennoch geändert, gilt er
   als Korrektur (override) und wird als CORRECTED geführt.

   Der Name ist zugleich der Schlüssel in kak, flexActual und
   tx[].main. Er wird deshalb NIE direkt überschrieben, sondern
   über renameKakCat() aus js/categories.js geändert (Regel 2).
   Angelegt wird erst beim Speichern: wer das Fenster schließt,
   hinterlässt nichts.
   ══════════════════════════════════════════════════════════════ */

/* editKak(null) legt eine neue Kategorie an. */
function editKak(k){
  const isNew=!k;
  const e=isNew?blankKak(0):state.kak[k];
  if(!e){ toast(t('kdlg.gone')); return; }

  const imported=i=>!isNew&&hasActual(i+1);
  const lockN=MONTHS.filter((_,i)=>imported(i)).length;
  const last=completedMonths();        /* ohne den laufenden Monat */
  const tag=i=>imported(i)?(e.override[i]!=null?'<span class="lock corr">CORRECTED</span>':'<span class="lock imp">IMPORTED</span>'):'';

  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box">
    <h3>${isNew?t('set.addKak'):lampPos('kak',k)+esc(keyLabel(k))}</h3>
    <p class="subline">${isNew?t('kdlg.newSub'):(lockN?t('kdlg.lockedN',lockN):t('kdlg.allOpen'))+' '+t('kdlg.hint')}</p>
    <div class="cols c2">
      <div class="field"><label>${t('item.name')}</label>
        <input id="kName" value="${isNew?'':esc(k)}" placeholder="${t('kdlg.namePh')}"></div>
      <div class="field"><label>${t('item.url')}</label>
        <div class="urlrow"><input id="kUrl" value="${esc(e.url||'')}" placeholder="https://…">
          <button type="button" class="btn small urlgo" data-go="kUrl" title="${esc(t('item.urlOpenTip'))}">${t('item.urlOpen')}</button></div></div>
    </div>
    <div class="field"><label>${t('item.kind')}</label>
      <label style="display:flex;gap:8px;align-items:center;font-family:var(--font-ui);font-size:14px;text-transform:none;letter-spacing:0;color:var(--ink)">
        <input type="checkbox" id="kEst" ${e.estimated?'checked':''} style="width:auto">
        ${t('kdlg.est')}</label></div>
    <div class="quick">
      <div class="field" style="margin-bottom:8px"><label>${t('kdlg.quick')}</label></div>
      <!-- Erst ab wann, dann wie viel — wie im Posten-Fenster.
           Eine Wiederholung gibt es hier nicht: flexible Kosten
           laufen immer monatlich. -->
      <div class="qrow" style="grid-template-columns:1fr 1fr">
        <select id="kStart" aria-label="${t('g.month')}">${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${i+1===CUR?' selected':''}>${t('item.fromMonth',n)}</option>`).join('')}</select>
        <input id="kVal" class="num" aria-label="${t('g.amount')}" placeholder="${t('g.amount')}">
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <button class="btn primary small" id="kApply">${t('item.apply')}</button>
        <button class="btn small" id="kClear">${t('item.clear')}</button>
      </div>
    </div>
    <div class="field"><label>${t('kdlg.perMonth')}</label>
      <div style="display:flex;gap:8px;margin:0 0 10px;flex-wrap:wrap">
        ${last?`<button class="btn small" id="kLock" title="${esc(t('kdlg.lockTillTip',MONTHS_LONG[last-1]))}">${t('kdlg.lockTill',MONTHS_LONG[last-1])}</button>`:''}
        <button class="btn small" id="kUnlock" title="${esc(t('kdlg.unlockAllTip'))}">${t('item.unlockAll')}</button></div>
      <div class="mgrid">${MONTHS.map((m,i)=>{const imp=imported(i), on=imp||e.paid[i];
        const val=imp?(e.override[i]!=null?e.override[i]:(state.flexActual[i+1][k]||0)):e.plan[i];
        return `<div class="cell${on?' lockedcell':''}" data-cell="${i}">
        <div class="cellhead"><span class="mlab ${i+1===CUR?'curm':''}">${m} ${tag(i)}</span>
          <span class="ctools">${isNew?'':lampHtml('kak',k,i+1)}
            <button type="button" class="seal mini" data-pi="${i}" aria-pressed="${on}"
              title="${on?t('kdlg.lockedTip'):t('month.markDone')}">${CHECK_SVG}</button></span></div>
        <input class="num" data-mi="${i}" ${on?'disabled':''} value="${val?nf.format(val):''}" placeholder="0,00">
        <div class="cellnote">${esc(e.notes[i]||'')}</div></div>`;}).join('')}</div>
    </div>
    <div class="row-end">${isNew?'':`<button class="linkish" id="kDel" style="margin-right:auto">${t('kdlg.del')}</button>`}
      <button class="btn" id="kCancel">${t('g.cancel')}</button><button class="btn primary" id="kSave">${t('g.save')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);

  bindNotes(box,b=>{
    const cell=b.closest('.cell'); if(!cell) return;
    cell.querySelector('.cellnote').textContent=e.notes[+cell.dataset.cell]||'';
  });

  const setSeal=(cb,on)=>{
    cb.setAttribute('aria-pressed',on);
    cb.title=on?t('kdlg.lockedTip'):t('month.markDone');
    const inp=box.querySelector(`[data-mi="${cb.dataset.pi}"]`);
    inp.disabled=on;
    cb.closest('.cell').classList.toggle('lockedcell',on);
    return inp;
  };
  const seals=()=>[...box.querySelectorAll('[data-pi]')];
  const isOn=cb=>cb.getAttribute('aria-pressed')==='true';
  box.querySelectorAll('[data-pi]').forEach(cb=>cb.onclick=()=>{
    if(cb.disabled) return;
    const on=!isOn(cb), inp=setSeal(cb,on);
    if(!on){inp.focus();inp.select();}
  });

  /* Alles bis zum laufenden Monat als erfasst markieren — und der
     Weg zurück. Importierte Monate bleiben außen vor: die kommen
     aus Fast Budget und werden nicht von Hand geschlossen oder
     geöffnet. Geschrieben wird erst mit „Speichern". */
  const lock=box.querySelector('#kLock');
  if(lock) lock.onclick=()=>{
    let n=0;
    seals().forEach(cb=>{
      const i=+cb.dataset.pi;
      if(i+1>last||imported(i)||isOn(cb)) return;
      setSeal(cb,true); n++;
    });
    toast(t('item.lockedNow',n));
  };
  box.querySelector('#kUnlock').onclick=()=>{
    let n=0;
    seals().forEach(cb=>{
      const i=+cb.dataset.pi;
      if(imported(i)||!isOn(cb)) return;
      setSeal(cb,false); n++;
    });
    toast(t('item.unlockedNow',n));
  };

  const cells=()=>[...box.querySelectorAll('[data-mi]')];
  box.querySelector('#kApply').onclick=()=>{
    const v=parseGermanNumber(box.querySelector('#kVal').value);
    const start=+box.querySelector('#kStart').value; let n=0;
    cells().forEach(c=>{const i=+c.dataset.mi; if(c.disabled||(i+1)<start) return; c.value=v?nf.format(v):''; n++;});
    toast(t('item.setN',n)+'.');
  };
  box.querySelector('#kClear').onclick=()=>cells().forEach(c=>{if(!c.disabled)c.value='';});
  box.querySelector('#kCancel').onclick=()=>closeModal(box);
  box.onclick=ev=>{if(ev.target===box)closeModal(box);};
  bindUrlGo(box);

  /* Löschen nimmt alles mit, was an der Kategorie hängt — Plan-
     und Ist-Werte, Korrekturen, Notizen und die importierten
     Buchungen (dropKakCat in js/categories.js). Deshalb erst die
     Rückfrage; wer sie abbricht, ändert nichts. */
  const del=box.querySelector('#kDel');
  if(del) del.onclick=()=>{
    const n=kakTxCount(k);
    if(!confirm(t('kdlg.delAsk',keyLabel(k))+(n?' '+t('kdlg.delAskTx',n):''))) return;
    state.kakCats=state.kakCats.filter(x=>x!==k);
    dropKakCat(k);
    save(); box.remove(); render(); toast(t('kdlg.deleted',keyLabel(k)));
  };

  box.querySelector('#kSave').onclick=()=>{
    const name=box.querySelector('#kName').value.trim();
    if(!name){ box.querySelector('#kName').focus(); return; }
    /* Umbenennen und Anlegen laufen beide über den Namen als
       Schlüssel — ein schon vergebener Name würde zwei Kategorien
       auf dieselben Daten zeigen lassen. */
    if(name!==k&&(state.kak[name]||state.kakCats.includes(name))){ toast(t('set.taken',name)); return; }

    e.estimated=box.querySelector('#kEst').checked;
    e.url=box.querySelector('#kUrl').value.trim();
    cells().forEach(c=>{
      const i=+c.dataset.mi, v=parseGermanNumber(c.value);
      if(imported(i)){
        /* Nur abweichende Werte werden als Korrektur gemerkt. */
        const orig=Math.round((state.flexActual[i+1][k]||0)*100)/100;
        e.override[i]=(Math.round(v*100)/100===orig)?null:v;
      } else e.plan[i]=v;
    });
    box.querySelectorAll('[data-pi]').forEach(cb=>{ e.paid[+cb.dataset.pi]=cb.getAttribute('aria-pressed')==='true'; });

    if(isNew){
      state.kakCats.push(name);
      state.kak[name]=e;
      ensureKakCat(name);
    } else if(name!==k){
      renameKakCat(k,name);            /* zieht Werte und Buchungen mit */
      state.kakCats=state.kakCats.map(x=>x===k?name:x);   /* die Liste führt es nicht selbst nach */
    }
    save(); box.remove(); render();
  };
  box.querySelector('#kName').focus();
}

/* Alte Fundstelle: data-newkak öffnet dasselbe Fenster, nur leer. */
const newKakCat=()=>editKak(null);
