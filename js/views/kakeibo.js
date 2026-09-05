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

/* Eine Buchungszeile des rechten Bereichs: Datum · die Ebene unter
   der Kategorie (Referenz 1, bei alten Buchungen die
   Unterkategorie) mit den weiteren Referenzen als Notiz darunter ·
   Betrag. txSub/txNote stehen in js/calc.js. */
function txRow(x){
  const note=txNote(x);
  return `<tr>
    <td class="tdate">${String(x.d).padStart(2,'0')}.${String(x.m).padStart(2,'0')}.</td>
    <td><span class="iname">${esc(keyLabel(txSub(x)||'(ohne Kategorie)'))}</span>
      ${note?`<div class="note">${esc(note)}</div>`:''}</td>
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

/* ── Der rechte Bereich, als Rechnung ─────────────────────────
   Die Buchungen zur gewählten Zeile (ui.kakPick) oder, ohne
   Auswahl, die größten Einzelposten des Zeitraums. Am Schreibtisch
   füllt das die rechte Karte (viewKakeibo), auf dem Telefon das
   Fenster (openKakTx) — dieselbe Rechnung, zwei Orte; zwei
   Fassungen liefen auseinander. */
function kakSideData(){
  const cats=kakCats(), known=new Set(cats), order=cats.slice();
  const scopeYear=ui.scope==='jahr';
  const zeitraum=scopeYear?`${YEAR}`:MONTHS_LONG[ui.month-1];
  const tx=state.tx.filter(x=>(scopeYear||x.m===ui.month)&&known.has(x.main||'(ohne Hauptkategorie)'));
  const pick=ui.kakPick||null;
  if(pick){
    const list=tx.filter(x=>(x.main||'(ohne Hauptkategorie)')===pick.main
      &&(!pick.sub||(txSub(x)||'(ohne Kategorie)')===pick.sub));
    const sum=list.reduce((s,x)=>s+x.v,0);
    return {title:keyLabel(pick.sub||pick.main),
      sub:t('kak.pickSub',pick.sub?esc(keyLabel(pick.main))+' · ':'',zeitraum,list.length,eur(sum)),
      rows:list.length
        ?(scopeYear?txByMonth(list):list.sort(byDate).map(txRow).join(''))
        :`<tr><td class="note">${t('kak.pickNone')}</td></tr>`};
  }
  /* Alles ab der eingestellten Grenze, nach Hauptkategorie. Die
     Grenze wird immer als Zahl geschrieben — eur() würde aus einer
     0 einen Gedankenstrich machen. */
  const grenze=topMin(), gl=nf.format(grenze);
  const top=tx.filter(x=>Math.abs(x.v)>=grenze);
  return {title:t('kak.top'),
    sub:t('kak.topSub',zeitraum,top.length,gl),
    rows:top.length?txByMain(top,order):`<tr><td class="note">${t('kak.topNone',gl)}</td></tr>`};
}

/* ── Die Buchungen als Fenster (Telefon) ──────────────────────
   Unter 700 px hat die Ansicht keine rechte Karte: auf 390 px
   stünden zwei Tabellen übereinander, und die zweite fände
   niemand. Stattdessen öffnet der Knopf im Kartenkopf — und jeder
   Zeilenpfeil (wire in js/app.js) — die Buchungen als Fenster:
   derselbe Inhalt aus kakSideData(), nur ein anderer Ort. Lang
   darf die Liste sein, das Fenster rollt (.modal .box). */
function openKakTx(){
  const side=kakSideData();
  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box narrow">
    <h3>${esc(side.title)}</h3>
    <p class="subline">${side.sub}</p>
    <table class="ledger">${side.rows}</table>
    <div class="row-end"><button class="btn" id="ktxClose">${t('g.close')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);
  box.querySelector('#ktxClose').onclick=()=>closeModal(box);
  box.onclick=ev=>{ if(ev.target===box) closeModal(box); };
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

  /* Unterkategorien kennt nur der Import — seit 5.9.26 ist es die
     Referenz 1 der Buchung, bei älteren Buchungen die
     Unterkategorie aus Fast Budget (txSub in js/calc.js). */
  const subs={};
  tx.forEach(x=>{
    const mk=x.main||'(ohne Hauptkategorie)', sk=txSub(x)||'(ohne Kategorie)';
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
  /* Die Balkenfarbe folgt dem Mac-Redesign (4c): Terracotta für
     Ausgaben, das Kantengrün für die seltene Einnahme — die
     satten Signalfarben blieben dem Vorzeichen der Beträge. */
  const bar=v=>`<td class="barcell"><div class="bar" style="width:${Math.abs(v)/maxBar*100}%;background:${v<0?'var(--edge-out)':'var(--edge-in)'}"></div></td>`;

  /* ── Woher der Wert kommt ───────────────────────────────────
     Importiert, korrigiert, abgehakt, fester Betrag oder noch
     geschätzt (flexKind in js/calc.js).

     **Das steht in Klammern hinter dem Namen der Hauptkategorie**,
     nicht in einer eigenen Spalte. Eine Spalte hielt zwischen
     Kategorie und Betrag eine Breite frei, in der bei einem
     einzelnen Monat ein Wort stand und bei den Unterzeilen gar
     nichts — sie trennte die beiden Zahlen, die zusammengehören.
     Hinter dem Namen liest man es wie einen Nachsatz zur Zeile,
     und die Klammer sagt, dass es einer ist.

     Bei einem einzelnen Monat ist es ein Wort. Beim ganzen Jahr
     stehen zwölf Monate hinter der Summe: dann wird gezählt, wie
     viele Monate auf welche Art zustande kamen, die häufigste
     zuerst. Monate ohne Betrag zählen nicht mit — sie sagen
     nichts über die Herkunft. */
  function kindTag(k){
    if(!state.kak[k]) return '';
    const per={};
    months.forEach(m=>{const s=flexKind(k,m); if(s!=='none') per[s]=(per[s]||0)+1;});
    const list=Object.keys(per).sort((a,b)=>per[b]-per[a]);
    if(!list.length) return '';
    /* Was die fünf Wörter bedeuten, stand bis 20.8.26 als Absatz
       unter der Tabelle. Es erklärt diese Marke und sonst nichts —
       also hängt es an ihr (data-tip) und nimmt der Ansicht keine
       Zeilen mehr weg. */
    return ` <span class="kinds" data-tip="${esc(t('kak.kindTip'))}">(${list.map(s=>`<span class="kk k-${s}">${
      months.length>1?per[s]+' ':''}${t(FLEX_KIND_LABEL[s])}</span>`)
      .join('<span class="ksep"> · </span>')})</span>`;
  }

  /* Der Beleglink der Kategorie — dasselbe Symbol wie beim
     regelmäßigen Posten. */
  const kLink=k=>{
    const l=state.kak[k]&&state.kak[k].links;
    return (l&&l.length)?' '+linkIcon(l,'kak',k):'';
  };

  let rows='';
  order.forEach(mk=>{
    rows+=`<tr class="kmain"${state.kak[mk]?dblKak(mk):''}><td class="nm">${state.kak[mk]?lampPos('kak',mk):''}${esc(keyLabel(mk))}${kindTag(mk)}${kLink(mk)}</td>
      ${mainBar(mk)?bar(val[mk]):'<td></td>'}
      <td class="num ${cls(val[mk])}">${eur(val[mk])}</td>${arrow(mk)}</tr>`;
    if(!detail) return;
    /* Die Unterzeilen bleiben leer: Unterkategorien kennt nur der
       Import, ihre Art steht schon in der Hauptzeile. */
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

  /* Rechter Bereich: entweder die Auswahl oder die größten Posten —
     gerechnet in kakSideData() (oben), damit das Fenster der
     mobilen Fassung denselben Inhalt zeigt. Auf dem Telefon
     entfällt die Karte; der Knopf im Kopf (data-txlist) und jeder
     Zeilenpfeil öffnen sie als Fenster. */
  const mob=isMobile();
  const side=kakSideData();

  /* Die Leiste bleibt beim Scrollen stehen: Zeitraum, Gliederung
     und Import sind das, womit man diese Ansicht bedient — die
     Listen darunter werden lang. */
  /* Die Werkzeugleiste als grauer Kasten (4c): Zeitraum,
     Monatsschritte, das Gliederungs-Paar, rechts der Mono-Zähler.
     Angelegt wird über das Hamburger-Menü der Kopfzeile. */
  return `<div class="filterbar kbar stickybar">
      <select id="kMonth" aria-label="${t('kak.period')}">
        <option value="jahr"${scopeYear?' selected':''}>${t('g.wholeYear')}</option>
        ${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${!scopeYear&&ui.month===i+1?' selected':''}>${n}</option>`).join('')}
      </select>
      <!-- Gleich hinter der Auswahl der Weg zurück ins Jetzt: aus
           dem März des Vorjahres oder aus dem ganzen Jahr ist der
           laufende Monat sonst ein Suchen in der Liste. Gesperrt,
           wenn er schon gewählt ist — dann gäbe es nichts zu tun.
           Gehört die Datei zu einem anderen Jahr, ist „jetzt" der
           Januar (CUR in js/i18n.js). -->
      <button class="btn small" data-kmonth="cur" ${!scopeYear&&ui.month===CUR?'disabled':''}
        title="${esc(t('kak.curTip',MONTHS_LONG[CUR-1]))}">${t('kak.cur')}</button>
      <button class="btn small" data-kmonth="prev" ${!scopeYear&&ui.month<=1?'disabled':''}
        title="${t('kak.prevTip')}">${t('kak.prev')}</button>
      <button class="btn small" data-kmonth="next" ${!scopeYear&&ui.month>=12?'disabled':''}
        title="${t('kak.nextTip')}">${t('kak.next')}</button>
      <button class="btn small" data-kmonth="jahr" aria-pressed="${scopeYear}" title="${t('kak.yearTip')}">${t('g.wholeYear')}</button>
      <span class="tbdivider" aria-hidden="true"></span>
      <button class="btn small" data-kd="0" aria-pressed="${!detail}">${t('kak.mainOnly')}</button>
      <button class="btn small" data-kd="1" aria-pressed="${detail}"
        ${canDetail?'':`disabled title="${esc(t('kak.subsNeedImport'))}"`}>${t('kak.withSubs')}</button>
      <span style="flex:1"></span>
      <!-- Der Import steht im Hamburger-Menü: diesen Reiter gibt es
           erst, wenn einmal importiert wurde — der Weg hinein darf
           nicht in ihm liegen. -->
      <span class="note txcount">${tx.length} ${t('g.transactions')}${orphan?t('kak.orphan',orphan):''}</span></div>
  <div class="grid">
    <div class="card sec-flex">
      <div class="sechead"><div class="headstack">
          <h2 style="margin:0">${t('kak.byCat',esc(zeitraum))}</h2>
          <p class="subhead impline">${impLine}</p></div>
        <!-- Beide Fassungen tragen dieselbe Beschriftung
             (kak.top, seit 23.8.26): auf dem Telefon öffnet der
             Knopf dieselben größten Einzelposten nur als Fenster
             statt als Karte daneben — ein anderer Text („Show
             transactions") las sich wie eine andere Funktion. Was
             er tut, sagt die Sprechblase. -->
        ${mob?`<button class="btn small" data-txlist="1"
          title="${esc(t('kak.showTxTip'))}">${t('kak.top')}</button>`
        :`<button class="btn small ktop" data-ktop="1" aria-pressed="${!pick}">${t('kak.top')}</button>`}</div>
      <table class="ledger">
        <tr><th>${t('g.category')}</th><th></th>
          <th class="num">${t('g.amount')}</th><th></th></tr>
        ${rows}
        <tr class="sum"><td>${t('g.total')}</td><td></td><td class="num ${cls(total)}">${eur(total)}</td>
          <td></td></tr></table>
      </div>
    ${mob?'':`<div class="card"><h2 style="margin-bottom:2px">${esc(side.title)}</h2>
      <p class="note" style="margin:0 0 10px">${side.sub}</p>
      <table class="ledger">${side.rows}</table></div>`}
  </div>`;
}
