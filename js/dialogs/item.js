/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Posten bearbeiten"
   Ein regelmäßiger Posten: Stammdaten, Schnelleingabe über den
   Rhythmus und die zwölf Monatsbeträge.
   ══════════════════════════════════════════════════════════════ */

/* Auswahlliste aus Banken oder Zahlungsarten. Ein Kürzel, das die
   Liste nicht kennt, bleibt erhalten und wird markiert. */
function optList(arr,cur){
  const known=arr.some(x=>x.code===cur);
  return `<option value="">—</option>`+arr.map(x=>`<option value="${esc(x.code)}"${x.code===cur?' selected':''}>${esc(x.code)} — ${esc(x.label)}</option>`).join('')
    +(cur&&!known?`<option value="${esc(cur)}" selected>${esc(cur)} (?)</option>`:'');
}

function editItem(item){
  const isNew=!item;
  const firstGroup=costGroups()[0]||'';
  const it=item||normalize({id:uid(),name:'',group:firstGroup,amounts:Array(12).fill(0)});
  const lockN=it.paid.filter((p,i)=>p&&it.amounts[i]!==0).length;
  /* Die Saldokorrektur gehört keinem Block an und lässt sich
     nicht löschen — sonst wird sie wie jeder andere Posten
     gepflegt (siehe js/state.js). */
  const isBal=isBalanceItem(it);

  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box">
    <h3>${isNew?t('item.add'):esc(it.name)}${isNew?'':lampPos('item',it.id)}</h3>
    <p class="subline">${lockN?t('item.lockedN',lockN):t('item.allOpen')}${isBal?' '+t('bal.hint'):''}</p>
    <div class="cols ${isBal?'':'c2'}">
      <div class="field"><label>${t('item.name')}</label><input id="fName" value="${esc(it.name)}" placeholder="${t('item.namePh')}"></div>
      ${isBal?'':`<div class="field"><label>${t('item.block')}</label><select id="fGroup">${allGroups().map(g=>`<option value="${esc(g)}"${g===it.group?' selected':''}>${esc(keyLabel(g))}</option>`).join('')}</select></div>`}
    </div>
    <div class="cols c3">
      <div class="field"><label>${t('item.bank')}</label><select id="fBank">${optList(state.banks,it.bank)}</select></div>
      <div class="field"><label>${t('item.pay')}</label><select id="fPay">${optList(state.pays,it.pay)}</select></div>
      <div class="field"><label>${t('item.due')}</label><select id="fDue">${DUE_OPTS.map(([v,l])=>`<option value="${v}"${v===String(it.dueDay)?' selected':''}>${l}</option>`).join('')}</select></div>
    </div>
    <div class="cols c6">
      <div class="field"><label>${t('item.endM')}</label><select id="fEndM"><option value="">—</option>${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${it.end&&it.end.m===i+1?' selected':''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label>${t('item.endY')}</label><input id="fEndY" class="num" type="number" min="2020" max="2099" value="${it.end?it.end.y:''}"></div>
      <div class="field span4"><label>${t('item.url')}</label><input id="fUrl" value="${esc(it.url)}" placeholder="https://…"></div>
    </div>
    <div class="field"><label>${t('item.kind')}</label>
      <label style="display:flex;gap:8px;align-items:center;font-family:var(--font-ui);font-size:14px;text-transform:none;letter-spacing:0;color:var(--ink)">
        <input type="checkbox" id="fEst" ${it.estimated?'checked':''} style="width:auto">
        ${t('item.est')}</label></div>
    <p class="note" style="margin:-4px 0 10px"><button class="linkish" id="fLists">${t('item.lists')}</button></p>
    <div class="quick">
      <div class="field" style="margin-bottom:8px"><label>${t('item.quick')}</label></div>
      <div class="qrow">
        <input id="qVal" class="num" aria-label="${t('g.amount')}">
        <select id="qRhythm" aria-label="${t('item.rhythm')}">${RHYTHM.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
        <select id="qStart" aria-label="${t('g.month')}">${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${i+1===CUR?' selected':''}>${t('item.fromMonth',n)}</option>`).join('')}</select>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <button class="btn primary small" id="qApply">${t('item.apply')}</button>
        <button class="btn small" id="qClear">${t('item.clear')}</button>
      </div>
      <p class="note" style="margin:8px 0 0">${t('item.quickHint')}</p>
    </div>
    <div class="field"><label>${t('item.perMonth')}</label>
      <div class="mgrid">${MONTHS.map((m,i)=>`<div class="cell${it.paid[i]?' lockedcell':''}" data-cell="${i}">
        <div class="cellhead"><span class="mlab ${i+1===CUR?'curm':''}">${m}</span>
          <span class="ctools">${isNew?'':lampHtml('item',it.id,i+1)}
            <button type="button" class="seal mini" data-pi="${i}" aria-pressed="${it.paid[i]}"
              title="${it.paid[i]?t('item.lockedTip'):t('month.markPaid')}">${CHECK_SVG}</button></span></div>
        <input class="num" data-mi="${i}" ${it.paid[i]?'disabled':''} value="${it.amounts[i]?nf.format(it.amounts[i]):''}" placeholder="0,00">
        <div class="cellnote">${esc(it.notes[i]||'')}</div></div>`).join('')}</div>
    </div>
    <div class="row-end">${(isNew||isBal)?'':`<button class="linkish" id="fDel" style="margin-right:auto">${t('item.del')}</button>`}
      <button class="btn" id="fCancel">${t('g.cancel')}</button><button class="btn primary" id="fSave">${t('g.save')}</button></div>
  </div>`;
  document.body.appendChild(box);

  bindNotes(box,b=>{
    const cell=b.closest('.cell'); if(!cell) return;
    const i=+cell.dataset.cell, n=it.notes[i]||'';
    cell.querySelector('.cellnote').textContent=n;
  });

  /* Haken setzen sperrt das Betragsfeld. */
  box.querySelectorAll('[data-pi]').forEach(cb=>cb.onclick=()=>{
    const on=cb.getAttribute('aria-pressed')!=='true';
    cb.setAttribute('aria-pressed',on);
    cb.title=on?t('item.lockedTip'):t('month.markPaid');
    const inp=box.querySelector(`[data-mi="${cb.dataset.pi}"]`);
    inp.disabled=on;
    cb.closest('.cell').classList.toggle('lockedcell',on);
    if(!on){inp.focus();inp.select();}
  });

  const cells=()=>[...box.querySelectorAll('[data-mi]')];
  const endMonth=()=>{
    const y=+box.querySelector('#fEndY').value, m=+box.querySelector('#fEndM').value;
    if(!m||!y) return 12;
    if(y<YEAR) return 0; if(y>YEAR) return 12; return m;
  };

  /* Endmonat setzt das Jahr automatisch: bis einschließlich
     laufendem Monat -> nächstes Jahr. */
  box.querySelector('#fEndM').onchange=ev=>{
    const m=+ev.target.value, yEl=box.querySelector('#fEndY');
    if(!m){ yEl.value=''; return; }
    yEl.value = m<=CUR ? (YEAR+1) : YEAR;
  };

  box.querySelector('#qApply').onclick=()=>{
    const v=parseGermanNumber(box.querySelector('#qVal').value);
    const step=+box.querySelector('#qRhythm').value;
    const start=+box.querySelector('#qStart').value;
    const last=endMonth(); let n=0,cl=0;
    cells().forEach(c=>{const i=+c.dataset.mi; if(c.disabled) return;
      if((i+1)<start||(i+1)>last) return;
      if((i+1-start)%step===0){c.value=v?nf.format(v):'';n++;}
      else if(c.value.trim()!==''){c.value='';cl++;}});
    toast(t('item.setN',n)+(cl?t('item.cleared',cl):'')+'.');
  };
  box.querySelector('#qClear').onclick=()=>cells().forEach(c=>{if(!c.disabled)c.value='';});
  box.querySelector('#fLists').onclick=()=>{box.remove();editLists();};
  box.querySelector('#fCancel').onclick=()=>closeModal(box);
  box.onclick=e=>{if(e.target===box)closeModal(box);};

  const del=box.querySelector('#fDel');
  if(del) del.onclick=()=>{if(confirm(t('item.delAsk',it.name))){state.fixed=state.fixed.filter(x=>x.id!==it.id);save();box.remove();render();}};

  box.querySelector('#fSave').onclick=()=>{
    const name=box.querySelector('#fName').value.trim();
    if(!name){box.querySelector('#fName').focus();return;}
    it.name=name;
    const gEl=box.querySelector('#fGroup'); if(gEl) it.group=gEl.value;
    it.bank=box.querySelector('#fBank').value; it.pay=box.querySelector('#fPay').value;
    it.dueDay=box.querySelector('#fDue').value; it.url=box.querySelector('#fUrl').value.trim();
    it.estimated=box.querySelector('#fEst').checked;
    const em=+box.querySelector('#fEndM').value, ey=+box.querySelector('#fEndY').value;
    it.end=(em&&ey)?{y:ey,m:em}:null;
    cells().forEach(c=>{const i=+c.dataset.mi; it.amounts[i]=parseGermanNumber(c.value);});
    box.querySelectorAll('[data-pi]').forEach(cb=>{it.paid[+cb.dataset.pi]=cb.getAttribute('aria-pressed')==='true';});
    if(isNew) state.fixed.push(it);
    save(); box.remove(); render();
  };
  box.querySelector('#fName').focus();
}
