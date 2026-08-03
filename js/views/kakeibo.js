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
  if(!state.tx.length) return `<div class="empty"><strong>${t('kak.empty')}</strong>
    ${t('kak.emptyHint')}
    <div style="margin-top:14px"><button class="btn primary" id="btnImportK">${t('kak.importBtn')}</button></div></div>`;

  const scopeYear=ui.scope==='jahr';
  const detail=ui.kakDetail!==false;
  const zeitraum=scopeYear?`${YEAR}`:MONTHS_LONG[ui.month-1];

  /* Gezeigt wird nur, was in der Kategorienliste gepflegt ist.
     Buchungen einer gelöschten Kategorie verschwinden mit ihr
     (dropKakCat in js/categories.js); was hier trotzdem übrig
     bleibt, stammt aus einer von Hand bearbeiteten Datei. */
  const known=new Set(kakCats());
  const inScope=state.tx.filter(x=>scopeYear||x.m===ui.month);
  const tx=inScope.filter(x=>known.has(x.main||'(ohne Hauptkategorie)'));
  const orphan=inScope.length-tx.length;

  /* Nach Hauptkategorie bündeln, darin nach Unterkategorie. */
  const mains={};
  tx.forEach(x=>{
    const mk=x.main||'(ohne Hauptkategorie)';
    mains[mk]=mains[mk]||{sum:0,subs:{}};
    mains[mk].sum+=x.v;
    const sk=x.cat||'(ohne Kategorie)';
    mains[mk].subs[sk]=(mains[mk].subs[sk]||0)+x.v;
  });

  /* Reihenfolge wie in der Kategorienliste. */
  const order=Object.keys(mains).sort((x,y)=>kakCats().indexOf(x)-kakCats().indexOf(y));

  /* Welche Zeile füllt gerade den rechten Bereich? */
  const pick=ui.kakPick||null;
  const picked=(main,sub)=>!!pick&&pick.main===main&&(pick.sub||'')===(sub||'');
  const arrow=(main,sub)=>`<td class="arrowcell"><button class="btn small rowarrow"
    aria-pressed="${picked(main,sub)}" data-kpick="${esc(main+(sub?'|'+sub:''))}"
    title="${t('kak.arrowTip',esc(keyLabel(sub||main)))}">&#8594;</button></td>`;

  const maxSub=Math.max(1,...Object.values(mains).flatMap(o=>Object.values(o.subs).map(Math.abs)));
  let rows='';
  order.forEach(mk=>{
    const o=mains[mk];
    rows+=`<tr class="kmain"><td>${esc(keyLabel(mk))}${state.kak[mk]?lampPos('kak',mk):''}</td><td></td>
      <td class="num ${cls(o.sum)}">${eur(o.sum)}</td>${arrow(mk)}</tr>`;
    if(detail){
      Object.entries(o.subs).sort((a,b)=>a[1]-b[1]).forEach(([sk,v])=>{
        rows+=`<tr class="ksub"><td>${esc(keyLabel(sk))}</td>
          <td class="barcell"><div class="bar" style="width:${Math.abs(v)/maxSub*100}%;background:${v<0?'var(--seal)':'var(--ok)'}"></div></td>
          <td class="num ${cls(v)}">${eur(v)}</td>${arrow(mk,sk)}</tr>`;
      });
    }
  });

  const total=tx.reduce((s,x)=>s+x.v,0);

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

  return `<div class="filterbar" style="margin-bottom:18px">
      <select id="kMonth" aria-label="${t('kak.period')}">
        <option value="jahr"${scopeYear?' selected':''}>${t('g.wholeYear')}</option>
        ${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${!scopeYear&&ui.month===i+1?' selected':''}>${n}</option>`).join('')}
      </select>
      <button class="btn small" data-kmonth="prev" ${!scopeYear&&ui.month<=1?'disabled':''}
        title="${t('kak.prevTip')}">${t('kak.prev')}</button>
      <button class="btn small" data-kmonth="next" ${!scopeYear&&ui.month>=12?'disabled':''}
        title="${t('kak.nextTip')}">${t('kak.next')}</button>
      <button class="btn small" data-kmonth="jahr" aria-pressed="${scopeYear}" title="${t('kak.yearTip')}">${t('g.wholeYear')}</button>
      <span style="width:18px"></span>
      <button class="btn small" data-kd="0" aria-pressed="${!detail}">${t('kak.mainOnly')}</button>
      <button class="btn small" data-kd="1" aria-pressed="${detail}">${t('kak.withSubs')}</button>
      <span style="flex:1"></span>
      <button class="btn primary small" id="btnImportK">${t('kak.import')}</button>
      <span class="note">${tx.length} ${t('g.transactions')}${orphan?t('kak.orphan',orphan):''}</span></div>
  <div class="grid">
    <div class="card sec-flex">
      <div class="sechead"><h2 style="margin:0">${t('kak.byCat',esc(zeitraum))}</h2>
        <button class="btn small ktop" data-ktop="1" aria-pressed="${!pick}">${t('kak.top')}</button></div>
      <table class="ledger">${rows}
        <tr class="sum"><td>${t('g.total')}</td><td></td><td class="num ${cls(total)}">${eur(total)}</td><td></td></tr></table>
      <p class="note" style="margin-top:10px">${t('kak.rowHint')}</p></div>
    <div class="card"><h2 style="margin-bottom:2px">${esc(sideTitle)}</h2>
      <p class="note" style="margin:0 0 10px">${sideSub}</p>
      <table class="ledger">${sideRows}</table></div>
  </div>`;
}
