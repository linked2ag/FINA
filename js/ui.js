/* ══════════════════════════════════════════════════════════════
   FINA — Gemeinsame Oberflächenteile
   Kurzmeldung, Fensterschließen und die Notizlampe, die in jeder
   Ansicht und in jedem Fenster vorkommt.
   ══════════════════════════════════════════════════════════════ */

/* Kurzmeldung am unteren Rand. */
function toast(msg){
  const el=document.createElement('div');el.className='toast';el.textContent=msg;
  document.body.appendChild(el);setTimeout(()=>el.remove(),4600);
}

/* Escape schließt immer das oberste Fenster. Fenster, die beim
   Schließen aufräumen müssen, legen ihren eigenen Weg in
   box._close ab (siehe js/dialogs/settings.js). */
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  const all=[...document.querySelectorAll('.modal')];
  if(!all.length) return;
  const top=all[all.length-1];
  (top._close||closeModal)(top);
});

/* Schließt ein Fenster, ohne dass die Seite nach oben springt. */
function closeModal(box){
  const sx=window.scrollX, sy=window.scrollY;
  const ys=document.getElementById('yearScroll');
  const yTop=ys?ys.scrollTop:null, yLeft=ys?ys.scrollLeft:null;
  box.remove();
  window.scrollTo(sx,sy);
  if(ys&&yTop!=null){ ys.scrollTop=yTop; ys.scrollLeft=yLeft; }
}

/* ── Sofort-Tooltip ───────────────────────────────────────────
   Der Browser zeigt title= erst nach etwa einer Sekunde. Alles
   mit data-tip="…" bekommt stattdessen sofort eine Sprechblase
   neben dem Element.

   Ein einziges Element für die ganze Seite, angehängt an <body>
   und fest positioniert — in den Tabellenzellen liegt overflow
   auf hidden, dort würde die Blase abgeschnitten. Die Ereignisse
   hängen an document, überstehen also jedes Neuzeichnen. */
const tipEl=document.createElement('div');
tipEl.className='tip'; tipEl.hidden=true;
document.body.appendChild(tipEl);

function showTip(el){
  const txt=el.getAttribute('data-tip');
  if(!txt) return;
  tipEl.textContent=txt;
  tipEl.hidden=false;
  tipEl.style.left='0px'; tipEl.style.top='0px';   /* erst messen, dann setzen */

  const r=el.getBoundingClientRect(), tr=tipEl.getBoundingClientRect();
  const gap=8;
  /* Bevorzugt rechts daneben, sonst links; immer im Fenster. */
  let x=r.right+gap;
  if(x+tr.width>window.innerWidth-gap) x=Math.max(gap,r.left-gap-tr.width);
  let y=r.top+r.height/2-tr.height/2;
  y=Math.min(Math.max(gap,y),window.innerHeight-gap-tr.height);
  tipEl.style.left=Math.round(x)+'px';
  tipEl.style.top=Math.round(y)+'px';
}
const hideTip=()=>{ tipEl.hidden=true; };

document.addEventListener('mouseover',e=>{
  const el=e.target.closest&&e.target.closest('[data-tip]');
  if(el) showTip(el);
});
document.addEventListener('mouseout',e=>{
  if(e.target.closest&&e.target.closest('[data-tip]')) hideTip();
});
document.addEventListener('focusin',e=>{
  const el=e.target.closest&&e.target.closest('[data-tip]');
  if(el) showTip(el);
});
document.addEventListener('focusout',hideTip);
document.addEventListener('keydown',e=>{ if(e.key==='Escape') hideTip(); });
window.addEventListener('scroll',hideTip,true);

/* ── Notizen ──────────────────────────────────────────────────
   kind ist 'item' (regelmäßiger Posten) oder 'kak' (Kakeibo).
   m = 1…12 meint die Notiz eines Monats, m = 0 die Notiz zur
   ganzen Position — die gilt in jedem Monat und steht in jeder
   Ansicht neben dem Namen. */
function noteTarget(kind,key){
  return kind==='kak'?state.kak[key]:findItem(key);
}
function noteOf(kind,key,m){
  const tg=noteTarget(kind,key);
  if(!tg) return '';
  return m?(tg.notes[m-1]||''):(tg.note||'');
}

/* Die Lampe nutzt data-tip statt title — die Notiz soll ohne
   Verzögerung erscheinen. Der volle Text wird gezeigt, die Blase
   bricht ihn um. Ohne Notiz gibt es keine Blase: in der Jahres-
   ansicht steht in jeder Monatszelle eine Lampe, da wäre ein
   „Notiz hinzufügen" beim Überfahren nur im Weg. Was die leere
   Lampe kann, sagt weiterhin das aria-label. */
function lampHtml(kind,key,m){
  const n=noteOf(kind,key,m);
  return `<button class="lamp${n?' on':''}" data-note="${esc(kind+'|'+key+'|'+m)}"
    ${n?`data-tip="${esc(n)}"`:''} aria-label="${esc(n?t('note.is',n):t('note.add'))}">${LAMP_SVG}</button>`;
}

/* Die Lampe zur ganzen Position — steht neben dem Namen. */
function lampPos(kind,key){
  const n=noteOf(kind,key,0);
  return `<button class="lamp pos${n?' on':''}" data-note="${esc(kind+'|'+key+'|0')}"
    ${n?`data-tip="${esc(n)}"`:''} aria-label="${esc(n?t('note.isPos',n):t('note.addPos'))}">${LAMP_SVG}</button>`;
}

/* Hängt an alle Lampen unterhalb von root das Notizfenster. */
function bindNotes(root,after){
  root.querySelectorAll('[data-note]').forEach(b=>b.onclick=ev=>{
    ev.stopPropagation();
    const [kind,key,m]=b.dataset.note.split('|');
    openNote(kind,key,+m,()=>{
      const n=noteOf(kind,key,+m);
      const pos=b.classList.contains('pos');
      b.classList.toggle('on',!!n);
      if(n) b.setAttribute('data-tip',n); else b.removeAttribute('data-tip');
      b.setAttribute('aria-label',n?(pos?t('note.isPos',n):t('note.is',n)):(pos?t('note.addPos'):t('note.add')));
      hideTip();
      if(after) after(b);
    });
  });
}

function openNote(kind,key,m,done){
  const cur=noteOf(kind,key,m);
  const target=noteTarget(kind,key);
  if(!target){ toast(t('note.gone')); return; }
  const name=kind==='kak'?key:target.name;
  const box=document.createElement('div');
  box.className='modal'; box.style.zIndex=70;
  box.innerHTML=`<div class="box" style="max-width:680px">
    <h3>${t('note.title',m?MONTHS_LONG[m-1]:t('note.whole'))}</h3>
    <p class="subline">${esc(name)}${m?'':t('note.allMonths')}</p>
    <div class="field"><label>${t('note.text')}</label>
      <textarea id="nTxt" rows="7" placeholder="${t('note.ph')}">${esc(cur)}</textarea></div>
    <div class="row-end">
      ${cur?`<button class="linkish" id="nDel" style="margin-right:auto">${t('note.del')}</button>`:''}
      <button class="btn" id="nCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="nSave">${t('g.save')}</button></div></div>`;
  document.body.appendChild(box);
  const finish=()=>{save();box.remove();if(done)done();};
  box.querySelector('#nCancel').onclick=()=>closeModal(box);
  box.onclick=ev=>{if(ev.target===box)closeModal(box);};
  const put=v=>{ if(m) target.notes[m-1]=v; else target.note=v; };
  const del=box.querySelector('#nDel');
  if(del) del.onclick=()=>{ put(''); finish(); };
  box.querySelector('#nSave').onclick=()=>{ put(box.querySelector('#nTxt').value.trim()); finish(); };
  box.querySelector('#nTxt').focus();
}
