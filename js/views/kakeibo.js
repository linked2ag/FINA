/* ══════════════════════════════════════════════════════════════
   FINA — Ansicht „Kakeibo"
   Auswertung der importierten Fast-Budget-Buchungen nach Haupt-
   und Unterkategorie. Reine Anzeige, keine Bearbeitung.

   Links die Summen, rechts die Buchungen dazu. Der Pfeil an einer
   Zeile links füllt den rechten Bereich mit genau dieser Kategorie
   (ui.kakPick); ohne Auswahl stehen dort die größten Einzelposten.
   Der Zeitraum — ein Monat oder das ganze Jahr — kommt aus der
   Auswahlliste oben und steuert beide Seiten.
   ══════════════════════════════════════════════════════════════ */

/* Eine Buchungszeile des rechten Bereichs: Datum · Beschreibung
   mit Notiz darunter · Betrag. */
function txRow(x){
  return `<tr>
    <td class="tdate">${String(x.d).padStart(2,'0')}.${String(x.m).padStart(2,'0')}.</td>
    <td><span class="iname">${esc(keyLabel(x.cat||'(ohne Kategorie)'))}</span>
      ${x.note?`<div class="note">${esc(x.note)}</div>`:''}</td>
    <td class="num ${cls(x.v)}">${eur(x.v)}</td></tr>`;
}

/* Älteste zuerst. */
const byDate=(a,b)=>(a.m-b.m)||(a.d-b.d);

/* Buchungen nach Monat gebündelt, je Monat eine Zwischenzeile.
   Nur für den Zeitraum „Ganzes Jahr". */
function txByMonth(list){
  let out='';
  for(let m=1;m<=12;m++){
    const rows=list.filter(x=>x.m===m).sort(byDate);
    if(!rows.length) continue;
    const sum=rows.reduce((s,x)=>s+x.v,0);
    out+=`<tr class="group"><td colspan="2">${MONTHS_LONG[m-1]}</td>
      <td class="num ${cls(sum)}">${eur(sum)}</td></tr>`+rows.map(txRow).join('');
  }
  return out;
}

/* Ab diesem Betrag gilt eine Buchung als Einzelposten. Die
   Grenze steht in den Einstellungen und damit in der Datei. */
const topMin=()=>(state&&typeof state.topMin==='number')?state.topMin:50;

/* Die großen Buchungen, nach Hauptkategorie gebündelt und darin
   nach Betrag — die größte Ausgabe zuerst. */
function txByMain(list,order){
  let out='';
  order.forEach(mk=>{
    const rows=list.filter(x=>(x.main||'(ohne Hauptkategorie)')===mk).sort((a,b)=>a.v-b.v);
    if(!rows.length) return;
    const sum=rows.reduce((s,x)=>s+x.v,0);
    out+=`<tr class="group"><td colspan="2">${esc(keyLabel(mk))}</td>
      <td class="num ${cls(sum)}">${eur(sum)}</td></tr>`+rows.map(txRow).join('');
  });
  return out;
}

function viewKakeibo(){
  const cats=kakCats();
  /* Weder Kategorien noch Buchungen — dann steht hier nur der Weg
     hinein: importieren oder die erste Kategorie anlegen. */
  if(!cats.length&&!state.tx.length) return `<div class="empty"><strong>${t('kak.empty')}</strong>
    ${t('kak.emptyHint')}
    <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn primary" id="btnImportK">${t('kak.importBtn')}</button>
      <button class="btn" data-newkak="1">${t('year.addKak')}</button></div></div>`;

  const scopeYear=ui.scope==='jahr';
  /* Unterkategorien kennt nur der Import. Ohne Buchungen gibt es
     sie also nicht — dann bleibt die Ansicht bei den Haupt-
     kategorien, ganz gleich, was zuletzt gewählt war, und der
     Knopf daneben ist gesperrt. Was beim Öffnen einer Datei
     vorgewählt ist, entscheidet afterLoad() in js/state.js. */
  const canDetail=state.tx.length>0;
  const detail=canDetail&&ui.kakDetail!==false;
  const zeitraum=scopeYear?`${YEAR}`:MONTHS_LONG[ui.month-1];
  const months=scopeYear?MONTHS.map((_,i)=>i+1):[ui.month];

  /* Gezeigt wird nur, was in der Kategorienliste gepflegt ist.
     Buchungen einer gelöschten Kategorie verschwinden mit ihr
     (dropKakCat in js/categories.js); was hier trotzdem übrig
     bleibt, stammt aus einer von Hand bearbeiteten Datei. */
  const known=new Set(cats);
  const inScope=state.tx.filter(x=>scopeYear||x.m===ui.month);
  const tx=inScope.filter(x=>known.has(x.main||'(ohne Hauptkategorie)'));
  const orphan=inScope.length-tx.length;

  /* Der Wert einer Kategorie im Zeitraum — über kakVal() und
     damit in derselben Rangfolge wie überall sonst: Korrektur,
     sonst Ist-Wert aus dem Import, sonst der von Hand gepflegte
     Wert. Ohne Import steht hier also die eigene Eingabe und
     nicht eine leere Liste. */
  const val={};
  cats.forEach(k=>{val[k]=Math.round(months.reduce((s,m)=>s+kakVal(k,m),0)*100)/100;});

  /* Unterkategorien kennt nur der Import. */
  const subs={};
  tx.forEach(x=>{
    const mk=x.main||'(ohne Hauptkategorie)', sk=x.cat||'(ohne Kategorie)';
    subs[mk]=subs[mk]||{};
    subs[mk][sk]=Math.round(((subs[mk][sk]||0)+x.v)*100)/100;
  });
  const subOf=k=>subs[k]?Object.entries(subs[k]).sort((a,b)=>a[1]-b[1]):[];
  const hasTx=k=>!!subs[k];
  /* Was der Zeitraum enthält, die Buchungen aber nicht erklären:
     korrigierte und geplante Monate. Steht als eigene Zeile
     darunter, damit die Unterzeilen die Summe wieder ergeben. */
  const restOf=k=>Math.round((val[k]-subOf(k).reduce((s,e)=>s+e[1],0))*100)/100;

  /* Reihenfolge wie in der Kategorienliste. */
  const order=cats.slice();

  /* Welche Zeile füllt gerade den rechten Bereich? Ohne Buchungen
     gibt es dort nichts zu zeigen — dann entfällt der Pfeil. */
  const pick=ui.kakPick||null;
  const picked=(main,sub)=>!!pick&&pick.main===main&&(pick.sub||'')===(sub||'');
  const arrow=(main,sub)=>hasTx(main)?`<td class="arrowcell"><button class="btn small rowarrow"
    aria-pressed="${picked(main,sub)}" data-kpick="${esc(main+(sub?'|'+sub:''))}"
    title="${t('kak.arrowTip',esc(keyLabel(sub||main)))}">&#8594;</button></td>`:'<td class="arrowcell"></td>';

  /* Der Balken sitzt an den Unterzeilen; wo es keine gibt — ohne
     Import oder in der Ansicht „Nur Hauptkategorien" — bekommt
     ihn die Hauptzeile. Ein Maßstab für alle. */
  const mainBar=k=>!detail||!subOf(k).length;
  const barVals=[];
  order.forEach(k=>{ if(mainBar(k)) barVals.push(val[k]); else subOf(k).forEach(e=>barVals.push(e[1])); });
  const maxBar=Math.max(1,...barVals.map(v=>Math.abs(v)));
  const bar=v=>`<td class="barcell"><div class="bar" style="width:${Math.abs(v)/maxBar*100}%;background:${v<0?'var(--seal)':'var(--ok)'}"></div></td>`;

  /* Der Beleglink der Kategorie — dasselbe Symbol wie beim
     regelmäßigen Posten. */
  const kLink=k=>(state.kak[k]&&state.kak[k].url)
    ?` <a class="linkicon" href="${esc(state.kak[k].url)}" target="_blank" rel="noopener" title="${t('year.linkTip')}">${LINK_SVG}</a>`:'';

  let rows='';
  order.forEach(mk=>{
    rows+=`<tr class="kmain"><td>${state.kak[mk]?lampPos('kak',mk):''}${esc(keyLabel(mk))}${kLink(mk)}${state.kak[mk]?notePreview('kak',mk):''}</td>
      ${mainBar(mk)?bar(val[mk]):'<td></td>'}
      <td class="num ${cls(val[mk])}">${eur(val[mk])}</td>${arrow(mk)}</tr>`;
    if(!detail) return;
    subOf(mk).forEach(([sk,v])=>{
      rows+=`<tr class="ksub"><td>${esc(keyLabel(sk))}</td>${bar(v)}
        <td class="num ${cls(v)}">${eur(v)}</td>${arrow(mk,sk)}</tr>`;
    });
    const rest=restOf(mk);
    if(subOf(mk).length&&Math.abs(rest)>=0.005)
      rows+=`<tr class="ksub"><td>${t('kak.manualSub')}</td><td></td>
        <td class="num ${cls(rest)}">${eur(rest)}</td><td class="arrowcell"></td></tr>`;
  });

  /* Woher die Zahlen des Zeitraums stammen. Beim ganzen Jahr
     zählt die Zeile die importierten Monate auf, bei einem
     einzelnen sagt sie, ob für ihn importiert wurde. */
  const impM=[]; for(let m=1;m<=12;m++) if(hasActual(m)) impM.push(m);
  const impLine=scopeYear
    ? (impM.length
        ? t('kak.impYear',impM.map(m=>MONTHS[m-1]).join(', '),12-impM.length)
        : t('kak.impYearNone'))
    : (hasActual(ui.month)
        ? t('kak.impMonth',MONTHS_LONG[ui.month-1],esc(state.flexSource[ui.month]||'Fast Budget'))
        : t('kak.impMonthNone',MONTHS_LONG[ui.month-1]));

  const total=Math.round(order.reduce((s,k)=>s+val[k],0)*100)/100;

  /* Rechter Bereich: entweder die Auswahl oder die größten Posten. */
  let sideTitle, sideSub, sideRows;
  if(pick){
    const list=tx.filter(x=>(x.main||'(ohne Hauptkategorie)')===pick.main
      &&(!pick.sub||(x.cat||'(ohne Kategorie)')===pick.sub));
    const sum=list.reduce((s,x)=>s+x.v,0);
    sideTitle=keyLabel(pick.sub||pick.main);
    sideSub=t('kak.pickSub',pick.sub?esc(keyLabel(pick.main))+' · ':'',zeitraum,list.length,eur(sum));
    sideRows=list.length
      ?(scopeYear?txByMonth(list):list.sort(byDate).map(txRow).join(''))
      :`<tr><td class="note">${t('kak.pickNone')}</td></tr>`;
  }else{
    /* Alles ab der eingestellten Grenze, nach Hauptkategorie.
       Die Grenze wird immer als Zahl geschrieben — eur() würde
       aus einer 0 einen Gedankenstrich machen. */
    const grenze=topMin(), gl=nf.format(grenze);
    const top=tx.filter(x=>Math.abs(x.v)>=grenze);
    sideTitle=t('kak.top');
    sideSub=t('kak.topSub',zeitraum,top.length,gl);
    sideRows=top.length?txByMain(top,order):`<tr><td class="note">${t('kak.topNone',gl)}</td></tr>`;
  }

  /* Die Leiste bleibt beim Scrollen stehen: Zeitraum, Gliederung
     und Import sind das, womit man diese Ansicht bedient — die
     Listen darunter werden lang. */
  return `<div class="filterbar stickybar">
      <select id="kMonth" aria-label="${t('kak.period')}">
        <option value="jahr"${scopeYear?' selected':''}>${t('g.wholeYear')}</option>
        ${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${!scopeYear&&ui.month===i+1?' selected':''}>${n}</option>`).join('')}
      </select>
      <button class="btn small" data-kmonth="prev" ${!scopeYear&&ui.month<=1?'disabled':''}
        title="${t('kak.prevTip')}">${t('kak.prev')}</button>
      <button class="btn small" data-kmonth="next" ${!scopeYear&&ui.month>=12?'disabled':''}
        title="${t('kak.nextTip')}">${t('kak.next')}</button>
      <button class="btn small${scopeYear?' primary':''}" data-kmonth="jahr" aria-pressed="${scopeYear}" title="${t('kak.yearTip')}">${t('g.wholeYear')}</button>
      <span style="width:18px"></span>
      <button class="btn small" data-kd="0" aria-pressed="${!detail}">${t('kak.mainOnly')}</button>
      <button class="btn small" data-kd="1" aria-pressed="${detail}"
        ${canDetail?'':`disabled title="${esc(t('kak.subsNeedImport'))}"`}>${t('kak.withSubs')}</button>
      <span style="flex:1"></span>
      <button class="btn small" data-newkak="1">${t('year.addKak')}</button>
      <button class="btn primary small" id="btnImportK">${t('kak.import')}</button>
      <span class="note">${tx.length} ${t('g.transactions')}${orphan?t('kak.orphan',orphan):''}</span></div>
  <div class="grid">
    <div class="card sec-flex">
      <div class="sechead"><div class="headstack">
          <h2 style="margin:0">${t('kak.byCat',esc(zeitraum))}</h2>
          <p class="subhead impline">${impLine}</p></div>
        <button class="btn small ktop" data-ktop="1" aria-pressed="${!pick}">${t('kak.top')}</button></div>
      <table class="ledger">
        <tr><th>${t('g.category')}</th><th></th><th class="num">${t('g.amount')}</th><th></th></tr>
        ${rows}
        <tr class="sum"><td>${t('g.total')}</td><td></td><td class="num ${cls(total)}">${eur(total)}</td>
          <td></td></tr></table>
      <p class="note" style="margin-top:10px">${t('kak.rowHint')} ${t('kak.valHint')}</p></div>
    <div class="card"><h2 style="margin-bottom:2px">${esc(sideTitle)}</h2>
      <p class="note" style="margin:0 0 10px">${sideSub}</p>
      <table class="ledger">${sideRows}</table></div>
  </div>`;
}
