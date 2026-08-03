/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Kakeibo-Beträge"
   Die zwölf Monatswerte einer Kakeibo-Kategorie. Importierte
   Monate sind gesperrt; wird ein Wert dennoch geändert, gilt er
   als Korrektur (override) und wird als CORRECTED geführt.
   Die Namen und die Reihenfolge der Kategorien werden dagegen
   in dialogs/settings.js gepflegt.
   ══════════════════════════════════════════════════════════════ */

function editKak(k){
  const e=state.kak[k];
  if(!e){ toast(t('kdlg.gone')); return; }

  const imported=i=>hasActual(i+1);
  const lockN=MONTHS.filter((_,i)=>imported(i)).length;
  const tag=i=>imported(i)?(e.override[i]!=null?'<span class="lock corr">CORRECTED</span>':'<span class="lock imp">IMPORTED</span>'):'';

  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box">
    <h3>${esc(keyLabel(k))}${lampPos('kak',k)}</h3>
    <p class="subline">${lockN?t('kdlg.lockedN',lockN):t('kdlg.allOpen')} ${t('kdlg.hint')}</p>
    <div class="field"><label>${t('item.kind')}</label>
      <label style="display:flex;gap:8px;align-items:center;font-family:var(--font-ui);font-size:14px;text-transform:none;letter-spacing:0;color:var(--ink)">
        <input type="checkbox" id="kEst" ${e.estimated?'checked':''} style="width:auto">
        ${t('kdlg.est')}</label></div>
    <div class="quick">
      <div class="field" style="margin-bottom:8px"><label>${t('kdlg.quick')}</label></div>
      <div class="qrow" style="grid-template-columns:1fr 1fr">
        <input id="kVal" class="num" aria-label="${t('g.amount')}">
        <select id="kStart" aria-label="${t('g.month')}">${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${i+1===CUR?' selected':''}>${t('item.fromMonth',n)}</option>`).join('')}</select>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <button class="btn primary small" id="kApply">${t('item.apply')}</button>
        <button class="btn small" id="kClear">${t('item.clear')}</button>
      </div>
    </div>
    <div class="field"><label>${t('kdlg.perMonth')}</label>
      <div class="mgrid">${MONTHS.map((m,i)=>{const imp=imported(i), on=imp||e.paid[i];
        const val=imp?(e.override[i]!=null?e.override[i]:(state.flexActual[i+1][k]||0)):e.plan[i];
        return `<div class="cell${on?' lockedcell':''}" data-cell="${i}">
        <div class="cellhead"><span class="mlab ${i+1===CUR?'curm':''}">${m} ${tag(i)}</span>
          <span class="ctools">${lampHtml('kak',k,i+1)}
            <button type="button" class="seal mini" data-pi="${i}" aria-pressed="${on}"
              title="${on?t('kdlg.lockedTip'):t('month.markDone')}">${CHECK_SVG}</button></span></div>
        <input class="num" data-mi="${i}" ${on?'disabled':''} value="${val?nf.format(val):''}" placeholder="0,00">
        <div class="cellnote">${esc(e.notes[i]||'')}</div></div>`;}).join('')}</div>
    </div>
    <div class="row-end"><button class="btn" id="kCancel">${t('g.cancel')}</button><button class="btn primary" id="kSave">${t('g.save')}</button></div>
  </div>`;
  document.body.appendChild(box);

  bindNotes(box,b=>{
    const cell=b.closest('.cell'); if(!cell) return;
    cell.querySelector('.cellnote').textContent=e.notes[+cell.dataset.cell]||'';
  });

  box.querySelectorAll('[data-pi]').forEach(cb=>cb.onclick=()=>{
    if(cb.disabled) return;
    const on=cb.getAttribute('aria-pressed')!=='true';
    cb.setAttribute('aria-pressed',on);
    cb.title=on?t('kdlg.lockedTip'):t('month.markDone');
    const inp=box.querySelector(`[data-mi="${cb.dataset.pi}"]`);
    inp.disabled=on;
    cb.closest('.cell').classList.toggle('lockedcell',on);
    if(!on){inp.focus();inp.select();}
  });

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

  box.querySelector('#kSave').onclick=()=>{
    e.estimated=box.querySelector('#kEst').checked;
    cells().forEach(c=>{
      const i=+c.dataset.mi, v=parseGermanNumber(c.value);
      if(imported(i)){
        /* Nur abweichende Werte werden als Korrektur gemerkt. */
        const orig=Math.round((state.flexActual[i+1][k]||0)*100)/100;
        e.override[i]=(Math.round(v*100)/100===orig)?null:v;
      } else e.plan[i]=v;
    });
    box.querySelectorAll('[data-pi]').forEach(cb=>{ e.paid[+cb.dataset.pi]=cb.getAttribute('aria-pressed')==='true'; });
    save(); box.remove(); render();
  };
}
