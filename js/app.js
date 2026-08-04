/* ══════════════════════════════════════════════════════════════
   FINA — Ablaufsteuerung
   Zeichnet die gewählte Ansicht, hängt danach alle Klicks an und
   startet die Anwendung. Diese Datei wird als letzte geladen.
   ══════════════════════════════════════════════════════════════ */

/* ── Kopfzeile: feste Beschriftungen, Ansichts- und Monatsreiter ─
   Alles mit data-t bekommt seinen Text aus js/i18n.js, data-ttip
   entsprechend den Tooltip. So wechselt die feste Kopfzeile die
   Sprache mit, ohne dass sie neu gebaut werden muss. */
function renderChrome(){
  document.documentElement.lang=LANG();
  document.querySelectorAll('[data-t]').forEach(el=>{ el.textContent=t(el.dataset.t); });
  document.querySelectorAll('[data-ttip]').forEach(el=>{ el.title=t(el.dataset.ttip); });
  const yl=document.getElementById('yearLbl'); if(yl) yl.textContent=t('app.sub',YEAR);

  const mEl=document.getElementById('months');
  mEl.setAttribute('aria-label',t('app.chooseMonth'));
  mEl.style.display = ui.view==='monat' ? 'flex' : 'none';
  mEl.innerHTML=MONTHS.map((name,i)=>{
    const m=i+1, pt=monthParts(m);
    const s=pt.total===0?'':(pt.done===pt.total?'done':(pt.done>0?'partial':''));
    return `<button class="mtab${s==='done'?' alldone':''}${m===CUR?' current':''}" role="tab" aria-selected="${ui.month===m}" data-m="${m}"
      title="${t('month.done',pt.done,pt.total)}">${name}<span class="dot ${s}"></span></button>`;
  }).join('');
  mEl.querySelectorAll('.mtab').forEach(b=>b.onclick=()=>{ui.month=+b.dataset.m;ui.view='monat';render();});

  /* Die Anleitung steht neben der Seite und wechselt die Sprache
     mit, ohne dass man sie schließen muss. */
  renderGuide(); syncGuideBtn();

  const vEl=document.getElementById('views');
  vEl.setAttribute('aria-label',t('app.chooseView'));
  vEl.innerHTML=VIEWS.map(([k,l])=>`<button class="vtab" role="tab" aria-selected="${ui.view===k}" data-v="${k}">${l}</button>`).join('');
  vEl.querySelectorAll('.vtab').forEach(b=>b.onclick=()=>{ui.view=b.dataset.v;render();});
}

/* ── Leisten, die stehen bleiben ──────────────────────────────
   Die Kopfzeile klebt oben, alles mit .stickybar klebt darunter:
   die Knopfleiste der Jahresmatrix, die Bedienleiste der
   Flexible Payments, die Kennzahlen von Monat und Prognose. Die
   Höhe der Kopfzeile ist je nach Ansicht verschieden — die
   Monatsreiter gibt es nur im Monat —, deshalb wird sie gemessen
   statt geraten. */
function syncStickyTops(){
  const h=document.querySelector('header'); if(!h) return;
  const top=h.offsetHeight+'px';
  document.querySelectorAll('.stickybar').forEach(el=>{ el.style.top=top; });
}

/* ── Mitlaufende Spaltenköpfe der Jahresmatrix ────────────────
   Die Matrix scrollt nur waagerecht, senkrecht scrollt die Seite.
   position:sticky richtet sich immer am nächsten Rollrahmen aus —
   das wäre hier der waagerechte, die Köpfe blieben also nicht
   stehen. Sie werden darum um genau den Betrag verschoben, um den
   die Tabelle unter die Kopfzeile der Seite gewandert ist.
   matrix.css liest den Wert aus --headY. */
function syncMatrixHead(){
  syncStickyTops();
  const box=document.getElementById('yearScroll'); if(!box) return;
  const head=box.querySelector('thead'); if(!head) return;
  /* Die Knopfleiste klebt unter der Kopfzeile, die Spaltenköpfe
     kleben unter der Knopfleiste. */
  const bar=document.getElementById('yearBar');
  const top=bar?bar.getBoundingClientRect().bottom
                :document.querySelector('header').getBoundingClientRect().bottom;
  const r=box.getBoundingClientRect();
  /* Die Saldozeile wandert mit demselben Maß mit — sie muss beim
     Anschlag am unteren Rand also mitgerechnet werden, sonst
     schöbe sie sich aus der Tabelle heraus. */
  const pin=box.querySelector('tr.balpin');
  const keep=head.offsetHeight+(pin?pin.offsetHeight:0);
  const y=Math.max(0,Math.min(top-r.top,r.height-keep));
  box.style.setProperty('--headY',y+'px');
}
addEventListener('scroll',syncMatrixHead,{passive:true});
addEventListener('resize',syncMatrixHead);

/* Zeichnet alles neu und hält dabei die Scrollposition. */
function render(){
  const sx=window.scrollX, sy=window.scrollY;
  const ysOld=document.getElementById('yearScroll');
  const yTop=ysOld?ysOld.scrollTop:null, yLeft=ysOld?ysOld.scrollLeft:null;

  renderChrome();
  document.getElementById('view').innerHTML=
    ({monat:viewMonat,prognose:viewPrognose,kakeibo:viewKakeibo,jahr:viewJahr})[ui.view]();
  wire(); renderStatus();

  window.scrollTo(sx,sy);
  const ysNew=document.getElementById('yearScroll');
  if(ysNew&&yTop!=null){ ysNew.scrollTop=yTop; ysNew.scrollLeft=yLeft; }
}

/* ── Klicks der frisch gezeichneten Ansicht ───────────────── */
function wire(){
  /* Bezahlt-Siegel */
  document.querySelectorAll('[data-paid]').forEach(b=>b.onclick=()=>{
    const it=findItem(b.dataset.paid); if(!it) return;
    it.paid[ui.month-1]=!it.paid[ui.month-1];
    save();render();
  });
  document.querySelectorAll('[data-kpaid]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    const e=state.kak[b.dataset.kpaid]; if(!e) return;
    e.paid[ui.month-1]=!e.paid[ui.month-1]; save();render();
  });

  /* Filter und Navigation */
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{ui.filter=b.dataset.filter;render();});
  document.querySelectorAll('[data-duefilter]').forEach(b=>b.onclick=()=>{ui.dueFilter=b.dataset.duefilter;render();});
  /* Wechsel zwischen Haupt- und Unterkategorien: rechts stehen
     danach wieder die größten Einzelposten, nicht die Auswahl
     einer Zeile, die es so vielleicht gar nicht mehr gibt. */
  document.querySelectorAll('[data-kd]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    ui.kakDetail=b.dataset.kd==='1'; ui.kakPick=null; render();});
  document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{ui.month=+b.dataset.goto;ui.view='monat';render();});

  /* Kakeibo: Auswahl der rechten Spalte — eine Kategorie oder,
     ohne Auswahl, die größten Einzelposten. */
  document.querySelectorAll('[data-kpick]').forEach(b=>b.onclick=()=>{
    const [main,sub]=b.dataset.kpick.split('|');
    ui.kakPick=(ui.kakPick&&ui.kakPick.main===main&&(ui.kakPick.sub||'')===(sub||''))
      ?null:{main,sub:sub||''};
    render();
  });
  document.querySelectorAll('[data-ktop]').forEach(b=>b.onclick=()=>{ui.kakPick=null;render();});
  document.querySelectorAll('[data-kmonth]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    const d=b.dataset.kmonth;
    if(d==='jahr') ui.scope='jahr';
    else { ui.month=Math.min(12,Math.max(1,ui.month+(d==='next'?1:-1))); ui.scope='monat'; }
    render();
  });
  document.querySelectorAll('[data-kview]').forEach(b=>b.onclick=()=>{
    ui.month=+b.dataset.kview; ui.scope='monat'; ui.view='kakeibo'; ui.kakPick=null; render();
  });

  /* Fenster öffnen */
  document.querySelectorAll('[data-lists]').forEach(b=>b.onclick=()=>editLists());
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editItem(findItem(b.dataset.edit)));
  document.querySelectorAll('[data-kedit]').forEach(b=>b.onclick=()=>editKak(b.dataset.kedit));
  /* Neu anlegen — in beiden Ansichten und in beiden Arten. Der
     Wert von data-newitem ist der vorgewählte Block ("1" = der
     erste der Liste). */
  document.querySelectorAll('[data-newitem]').forEach(b=>b.onclick=()=>editItem(null,b.dataset.newitem));
  document.querySelectorAll('[data-newkak]').forEach(b=>b.onclick=()=>newKakCat());
  bindNotes(document,()=>render());

  const fb=document.getElementById('btnFold');
  if(fb) fb.onclick=()=>{ui.showAll=!ui.showAll;render();};
  const hs=document.getElementById('btnHideSettled');
  if(hs) hs.onclick=()=>{ui.hideSettled=!ui.hideSettled;render();};

  /* Prognose: Kakeibo-Annahme je Kategorie */
  document.querySelectorAll('[data-plan]').forEach(i=>i.onchange=()=>{
    const k=i.dataset.plan, v=parseGermanNumber(i.value);
    if(!state.kak[k]) return;
    state.plan[k]=v;
    for(let m=1;m<=12;m++) if(!hasActual(m)&&!state.kak[k].paid[m-1]) state.kak[k].plan[m-1]=v;
    save();render();});

  const avg=document.getElementById('btnAvg');
  if(avg) avg.onclick=()=>{
    const use=avgMonths();
    if(!use.length){toast(t('prog.noActual'));return;}
    const cats=kakCats().filter(k=>state.kak[k]);
    /* Die getippte Annahme wird überschrieben — erst nachfragen. */
    if(!confirm(t('prog.askAvg',cats.length,use.map(m=>MONTHS_LONG[m-1]).join(', ')))) return;
    cats.forEach(k=>{
      const v=avgActual(k,use);
      state.plan[k]=v;
      for(let m=1;m<=12;m++) if(!hasActual(m)&&!state.kak[k].paid[m-1]) state.kak[k].plan[m-1]=v;});
    save();render();toast(t('prog.applied',use.map(m=>MONTHS[m-1]).join(', ')));
  };

  /* Kakeibo: CSV-Import und Zeitraum (Ganzes Jahr oder ein Monat) */
  const km=document.getElementById('kMonth');
  if(km) km.onchange=()=>{
    if(km.value==='jahr') ui.scope='jahr';
    else { ui.scope='monat'; ui.month=+km.value; }
    render();
  };
  const imp=document.getElementById('btnImportK');
  if(imp) imp.onclick=()=>document.getElementById('fileCsv').click();

  /* Zum Schluss: Tab springt in der Ansicht nur noch von Feld zu
     Feld. Die Kopfzeile bleibt außen vor — über sie erreicht man
     Ansicht, Monat und Datei weiter mit der Tastatur. */
  tabThroughFields(document.getElementById('view'));

  syncMatrixHead();
}

/* ── Feste Schaltflächen der Kopfzeile ────────────────────── */
document.getElementById('btnSettings').onclick=()=>openSettings();
/* Die Anleitung ist ein Bereich, kein Fenster: derselbe Knopf
   klappt sie auf und wieder zu. */
document.getElementById('btnGuide').onclick=()=>toggleGuide();
document.getElementById('btnLoad').onclick=()=>loadData();
document.getElementById('btnSave').onclick=()=>saveData();
document.getElementById('btnUnlink').onclick=()=>unlinkData();

/* Rückfallweg, wenn der Browser die File System Access API nicht kennt. */
document.getElementById('fileJson').onchange=e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{ state=migrate(JSON.parse(r.result)); fileName=f.name; fileHandle=null; dirty=false;
      afterLoad(); render(); toast(t('store.loaded',f.name)); }
    catch(err){ toast(t('store.readFail')); } };
  r.readAsText(f,'utf-8'); e.target.value='';
};

/* Die Datei wird nur gelesen; geändert wird erst, wenn der Nutzer
   im Import-Fenster (js/dialogs/csv-import.js) beide Schritte
   bestätigt hat. */
document.getElementById('fileCsv').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const rows=parseFastBudget(r.result);
      if(!rows.length){toast(t('imp.noRows'));return;}
      openImport(rows,f.name);
    }catch(err){toast(t('imp.failed',err.message));}
  };
  r.readAsText(f,'utf-8'); e.target.value='';
};

/* ── Start ────────────────────────────────────────────────────
   Leer und auf Englisch beginnen. Inhalte und Einstellungen
   kommen über „Load data" aus der JSON-Datei. */
state=emptyState();
afterLoad();
render();
