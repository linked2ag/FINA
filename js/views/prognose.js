/* ══════════════════════════════════════════════════════════════
   FINA — Ansicht „Prognose"
   Hochrechnung auf das Restjahr. Für Monate ohne Fast-Budget-
   Import rechnet die App mit den hier gepflegten Annahmen.
   ══════════════════════════════════════════════════════════════ */

function viewPrognose(){
  /* Die Kumulation läuft über das ganze Jahr: die letzte Zeile ist
     damit der Saldo zum Jahresende, die Zeile vor dem laufenden
     Monat der Stand von heute. */
  let cum=0;
  const rows=MONTHS.map((name,i)=>{
    const m=i+1,s=saldo(m);
    cum+=s;
    return `<tr${m<CUR?' style="opacity:.42"':''}>
      <td>${name}<span class="pill">${hasActual(m)?t('prog.actual'):t('prog.plan')}</span></td>
      <td class="num pos">${eur(income(m))}</td>
      <td class="num neg">${eur(fixedCost(m))}</td>
      <td class="num neg">${eur(kakeiboFor(m))}</td>
      <td class="num balcol ${cls(balanceFix(m))}">${eur(balanceFix(m))}</td>
      <td class="num ${cls(s)}">${eur(s)}</td>
      <td class="num ${cls(cum)}">${eur(cum)}</td></tr>`;
  }).join('');

  /* Zwei Spalten je Kategorie: die Annahme, mit der gerechnet
     wird, und daneben der Durchschnitt der letzten Ist-Monate als
     Vorschlag. Übernommen wird er nur über den Knopf darunter. */
  const useM=avgMonths();
  const planRows=kakCats().filter(k=>state.kak[k]).map(k=>{
    const a=avgActual(k,useM);
    return `<tr><td>${esc(keyLabel(k))}${lampPos('kak',k)}</td>
      <td class="num planin"><input class="num" type="text" data-plan="${esc(k)}" value="${nf.format(state.kak[k].plan[Math.max(CUR,1)-1]||0)}"></td>
      <td class="num ${a==null?'':cls(a)}">${a==null?'—':eur(a)}</td></tr>`;
  }).join('');

  /* Kennzahlen: was ab dem laufenden Monat noch kommt, und die
     beiden Salden — Stand heute und Stand zum Jahresende. */
  const from=MONTHS[CUR-1];
  let incRest=0,fixRest=0,openRest=0,kakRest=0,soFar=0;
  for(let m=CUR;m<=12;m++){ incRest+=income(m); fixRest+=fixedCost(m); openRest+=openCost(m); kakRest+=kakeiboFor(m); }
  for(let m=1;m<CUR;m++) soFar+=saldo(m);
  const yearEnd=cum;
  const istMonths=[];for(let m=1;m<=12;m++) if(hasActual(m)) istMonths.push(MONTHS[m-1]);

  return `
  <div class="kpi">
    <div class="t-in"><div class="lab">${t('prog.kpiIncome',from)}</div><div class="val pos">${eur(incRest)}</div></div>
    <div class="t-out"><div class="lab">${t('prog.kpiFixed',from)}</div><div class="val neg">${eur(fixRest)}</div>
      <div class="note">${t('prog.kpiOpen',eur(openRest))}</div></div>
    <div class="t-flex"><div class="lab">${t('prog.kpiKak',from)}</div><div class="val neg">${eur(kakRest)}</div>
      <div class="note">${t('prog.kpiPerMonth',eur(planSum(CUR)))}</div></div>
    <div><div class="lab">${t('prog.kpiSoFar')}</div><div class="val ${cls(soFar)}">${eur(soFar)}</div>
      <div class="note">${CUR>1?t('prog.kpiSoFarSub',MONTHS[CUR-2]):t('prog.kpiSoFarNone')}</div></div>
    <div><div class="lab">${t('prog.kpiEnd')}</div><div class="val ${cls(yearEnd)}">${eur(yearEnd)}</div>
      <div class="note">${t('prog.kpiEndSub',YEAR)}</div></div>
  </div>
  <div class="grid">
    <div class="card"><h2>${t('prog.title',YEAR)}</h2>
      <div class="scroll" style="border:0"><table class="ledger">
        <tr><th>${t('g.month')}</th><th class="num">${t('prog.colIncome')}</th><th class="num">${t('prog.colFixed')}</th>
          <th class="num">${t('prog.colKak')}</th><th class="num balcol" title="${esc(t('bal.tip'))}">${t('prog.colBal')}</th>
          <th class="num">${t('prog.colBalance')}</th><th class="num">${t('prog.colCum')}</th></tr>
        ${rows}</table></div>
      <p class="note" style="margin-top:10px">${t('prog.greyed',MONTHS_LONG[CUR-1])}</p></div>
    <div class="card sec-flex"><h2>${t('prog.card')}</h2>
      <p class="note" style="margin:0 0 12px">${t('prog.cardHint',istMonths.join(', ')||t('prog.noMonth'))}</p>
      ${planRows?`<table class="ledger plantable">
        <tr><th>${t('g.category')}</th><th class="num">${t('prog.colCurrent')}</th>
          <th class="num">${t('prog.colAvg',useM.length?useM.map(m=>MONTHS[m-1]).join(', '):t('prog.avgMonths'))}</th></tr>
        ${planRows}</table>`:`<p class="note">${t('prog.noCats')}</p>`}
      <button class="btn" id="btnAvg" style="margin-top:12px">${t('prog.takeAvg')}</button>
      <p class="note" style="margin-top:8px">${t('prog.takeHint')}</p></div>
  </div>`;
}
