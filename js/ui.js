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

/* ── Filterzeile ──────────────────────────────────────────────
   Zwei Bausteine, die Monats- und Jahresansicht sich teilen.

   Ein Filterknopf trägt seinen Wert im data-Attribut, das ihn in
   wire() verdrahtet: `data-filter`, `data-duefilter`. Er zeigt am
   dunklen Grund, dass er angewendet ist, und ein zweiter Klick
   nimmt ihn wieder zurück (siehe wire()). Die Erklärung steht als
   data-tip daran und erscheint ohne Verzögerung.

   Das Suchfeld bekommt `title` statt data-tip: die Sprechblase
   erscheint auch beim Hineinspringen mit dem Tabulator und stünde
   dann die ganze Zeit neben dem Feld, in das man gerade tippt. */
function fbtn(kind,val,label,tip,cur){
  return `<button class="btn small" data-${kind}="${esc(val)}" aria-pressed="${cur===val}"
    data-tip="${esc(tip)}">${label}</button>`;
}

/* Vor dem Feld steht der Hamburger-Knopf: er öffnet das Fenster,
   in dem gewählt wird, worin der Suchbegriff überhaupt sucht
   (js/dialogs/filter-fields.js). Ist nicht mehr alles gewählt,
   steht er auf dunklem Grund — wie ein angewendeter Filter, denn
   genau das ist er.

   Knopf und Feld stecken zusammen in .fltbox, und die ist so
   breit, wie das Feld allein es war (--leadw): die Filterknöpfe
   dahinter fangen dadurch weiter genau über der
   Bezeichnungsspalte an. */
function filterField(extra){
  const narrowed=QFIELDS.some(k=>!qField(k));
  return `<span class="fltbox${extra?' '+extra:''}">
    <button class="btn small fltmenu" data-qfields="1" aria-pressed="${narrowed}"
      aria-label="${esc(t('flt.title'))}" data-tip="${esc(t('flt.btnTip'))}">&#9776;</button>
    <input class="fltq" data-q type="search" value="${esc(ui.q||'')}"
      placeholder="${t('g.filter')}" aria-label="${t('g.filter')}" title="${esc(t('g.filterTip'))}"></span>`;
}

/* ── Doppelklick öffnet die Position ──────────────────────────
   In jeder Ansicht dasselbe: ein Doppelklick auf den Betrag oder
   auf die Bezeichnung öffnet das Fenster, das auch der Stift
   öffnet. Das Merkmal sitzt an der Zeile; welche Zelle getroffen
   war, prüft wire() in js/app.js — es zählen nur Betrag und
   Bezeichnung (td.num, td.amt, td.lab, td.nm), und nichts, worauf
   man ohnehin klickt: Knöpfe, Links, Eingabefelder.

   Die Bezeichnungsspalte trägt dafür überall `nm` (die Jahres-
   matrix nennt sie `lab`), damit die Regel nicht an der Stellung
   der Zelle hängt. */
const dblItem=id=>` data-dbledit="${esc(id)}"`;
const dblKak=k=>` data-dblkedit="${esc(k)}"`;

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

/* ── Tab läuft durch die Felder ───────────────────────────────
   Zwischen den Eingabefeldern stehen überall Symbole: Notizlampe,
   Siegel, Stift, Beleglink. Mit der Maus stören sie nicht, mit
   Tab schon — man käme nur jeden dritten Sprung an ein Feld.
   Deshalb nimmt diese Funktion alles aus der Tab-Reihenfolge, was
   kein Eingabefeld ist; anklickbar bleibt es unverändert.

   Zwei Ausnahmen mit Absicht: die Knöpfe der Fußzeile (.row-end)
   bleiben drin — sie sind der Weg aus dem Fenster heraus —, und
   die Kopfzeile der Seite wird gar nicht erst angefasst, damit
   Ansicht, Monat und Datei weiter mit der Tastatur erreichbar
   sind. */
function tabThroughFields(root){
  if(!root) return;
  root.querySelectorAll('button,a[href]').forEach(el=>{
    if(el.closest('.row-end')) return;
    el.tabIndex=-1;
  });
}

/* ── Link öffnen ──────────────────────────────────────────────
   Neben dem Eingabefeld für den Beleg steht ein Knopf, der ihn
   sofort öffnet — man muss zum Nachsehen nicht erst speichern.
   Gelesen wird der getippte Stand, nicht der gespeicherte.
   data-go trägt die Kennung des Feldes daneben. */
function bindUrlGo(box){
  box.querySelectorAll('[data-go]').forEach(b=>{
    const inp=box.querySelector('#'+b.dataset.go);
    if(!inp) return;
    const sync=()=>{ b.disabled=!inp.value.trim(); };
    inp.oninput=sync; sync();
    b.onclick=()=>{
      const u=inp.value.trim(); if(!u) return;
      /* Ohne Schema hält der Browser die Adresse für einen Pfad. */
      window.open(/^[a-z][a-z0-9+.-]*:/i.test(u)?u:'https://'+u,'_blank','noopener');
    };
  });
}

/* ── Vorzeichen schon beim Tippen ─────────────────────────────
   Ausgaben stehen mit Minus in der Datei (siehe saldo() in
   js/calc.js). Damit man beim Eintippen nicht erst nachrechnen
   muss, färbt sich das Feld nach dem Vorzeichen: rot bei Minus,
   grün bei Plus. Die Null und das leere Feld bleiben, wie sie
   sind — dort gibt es kein Vorzeichen zu zeigen.

   Betroffen sind nur Felder mit der Klasse `signed`; die anderen
   Zahlenfelder (etwa das Jahr der letzten Zahlung) sind keine
   Beträge. Die Farben stehen in css/components.css. */
function signValue(inp){
  const v=parseGermanNumber(inp.value);
  inp.classList.toggle('neg',v<0);
  inp.classList.toggle('pos',v>0);
}
const signValues=root=>root.querySelectorAll('.signed').forEach(signValue);

/* Einmal beim Öffnen färben und danach bei jedem Zeichen. Was
   ein Knopf ins Feld schreibt (Schnelleingabe, Leeren), löst
   kein input aus — dort ruft das Fenster signValues() selbst. */
function bindSign(root){
  root.querySelectorAll('.signed').forEach(inp=>{
    signValue(inp);
    inp.addEventListener('input',()=>signValue(inp));
  });
}

/* ── Entwürfe ─────────────────────────────────────────────────
   Ein Fenster, das eine Position erst anlegt — „neu" oder ein
   Duplikat —, hat sie noch nicht im Zustand: findItem() und
   state.kak finden sie nicht. Damit die Notizlampen trotzdem
   schon arbeiten, meldet das Fenster seinen Entwurf hier an.

   Er gilt nur, solange sein Kasten im Dokument hängt. Deshalb
   muss ihn niemand abmelden: ein geschlossenes Fenster nimmt
   seinen Entwurf von selbst mit — auch das, das über Escape oder
   einen Klick daneben verschwindet. */
let noteDraft=null;
function useDraft(kind,key,obj,label,box){
  noteDraft=obj?{kind,key,obj,label,box}:null;
}
function draftOf(kind,key){
  const d=noteDraft;
  return (d&&d.box.isConnected&&d.kind===kind&&String(d.key)===String(key))?d:null;
}

/* ── Notizen ──────────────────────────────────────────────────
   kind ist 'item' (regelmäßiger Posten) oder 'kak' (Kakeibo).
   m = 1…12 meint die Notiz eines Monats, m = 0 die Notiz zur
   ganzen Position — die gilt in jedem Monat und steht in jeder
   Ansicht neben dem Namen. */
function noteTarget(kind,key){
  const d=draftOf(kind,key);
  if(d) return d.obj;
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

/* Die ersten Zeilen der Notiz, klein unter dem Namen. Sie stehen
   dort, damit man eine Notiz überhaupt bemerkt, ohne die Maus zu
   bewegen — nach zwei Zeilen bricht css/tokens.css sie ab.

   Bewusst ohne data-tip: die Sprechblase gehört der Lampe. Führe
   die Maus über die Vorschau, passiert nichts; erst die Lampe
   zeigt den vollen Text. Sonst spränge die Blase schon beim
   Überqueren der Zeile auf. */
function notePreview(kind,key){
  const n=noteOf(kind,key,0);
  return n?`<div class="noteprev">${esc(n)}</div>`:'';
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
  /* Ein Entwurf hat noch keinen Namen im Zustand — der steht im
     Namensfeld des Fensters, das ihn angemeldet hat. */
  const draft=draftOf(kind,key);
  const name=draft?draft.label():(kind==='kak'?key:target.name);
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
  document.body.appendChild(box); tabThroughFields(box);
  /* Die Notiz eines Entwurfs steht noch in keiner Datei — sie
     wandert erst mit „Speichern" des Fensters hinein. Deshalb
     bleibt der dirty-Zustand hier unberührt. */
  const finish=()=>{if(!draft)save();box.remove();if(done)done();};
  box.querySelector('#nCancel').onclick=()=>closeModal(box);
  box.onclick=ev=>{if(ev.target===box)closeModal(box);};
  const put=v=>{ if(m) target.notes[m-1]=v; else target.note=v; };
  const del=box.querySelector('#nDel');
  if(del) del.onclick=()=>{ put(''); finish(); };
  box.querySelector('#nSave').onclick=()=>{ put(box.querySelector('#nTxt').value.trim()); finish(); };

  /* Das Feld wächst mit dem Text: eine lange Notiz soll ganz zu
     sehen sein, ohne im Feld zu scrollen. Nach unten eine feste
     Mindesthöhe, damit ein leeres Feld nicht zum Schlitz wird,
     nach oben das Fensterhöhenmaß — sonst wüchse das Fenster aus
     dem Bildschirm heraus. */
  const ta=box.querySelector('#nTxt');
  const grow=()=>{
    ta.style.height='auto';
    const max=Math.max(200,Math.round(window.innerHeight*0.62));
    ta.style.height=Math.min(Math.max(ta.scrollHeight+2,150),max)+'px';
  };
  grow();
  ta.addEventListener('input',grow);
  ta.focus();
}
