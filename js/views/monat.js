/* ══════════════════════════════════════════════════════════════
   FINA — Ansicht „Monat"
   Abrechnung eines Monats: Einnahmen, Kakeibo und die
   regelmäßigen Kosten mit Filtern und Bezahlt-Siegeln.
   ══════════════════════════════════════════════════════════════ */

/* Unter dem Namen steht in dieser Ansicht nur, was zu genau
   diesem Monat gehört: die Metazeile und die Monatsnotiz. Die
   Notiz zur ganzen Position (notePreview) bleibt draußen — sie
   gilt in jedem Monat und geriete hier neben Siegel und
   Monatsnotiz in die Abbuchungslogik. Sie steht in der
   Jahresmatrix und im Flexible-Payments-Reiter; hier führt die
   Lampe zu ihr. */

/* Zeile unter dem Namen: Bank, Zahlungsart, Fälligkeit, Ende, Beleg. */
function metaLine(it){
  const p=[];
  if(it.bank) p.push(`<span>${esc(bankLabel(it.bank))}</span>`);
  if(it.pay) p.push(`<span>${esc(payLabel(it.pay))}</span>`);
  if(it.dueDay) p.push(`<span>${DUE_LABEL(it.dueDay)}</span>`);
  if(it.end) p.push(`<span>${t('end.tip',endLabel(it))}</span>`);
  if(it.url) p.push(`<span><a href="${esc(it.url)}" target="_blank" rel="noopener">${t('month.receipt')}</a></span>`);
  return p.length?`<div class="meta">${p.join('')}</div>`:'';
}

function itemRow(it,m){
  const p=paidAt(it,m), e=estOf(it), note=it.notes[m-1];
  return `<tr class="${p?'paid':''}"${dblItem(it.id)}>
    <td class="markcell"><button class="seal${!p&&e?' est':''}" aria-pressed="${p}" data-paid="${it.id}"
      title="${p?t('month.markOpen'):t('month.markPaid')}">${CHECK_SVG}</button></td>
    <td class="num amt ${e&&!p?'est':cls(it.amounts[m-1])}">${eur(it.amounts[m-1])}</td>
    <td class="pencell"><div class="ptools"><button class="pencil" data-edit="${it.id}" title="${t('year.editTip')}">&#9998;</button>${lampHtml('item',it.id,m)}</div></td>
    <td class="nm">${it.url?`<a class="linkicon" href="${esc(it.url)}" target="_blank" rel="noopener" title="${t('month.receiptTip')}">${LINK_SVG}</a> `:''}<span class="iname">${esc(it.name)}</span>${isLastRate(it,m)?`<span class="pill last">${t('month.lastRate')}</span>`:''}
      ${metaLine(it)}${note?`<div class="itemnote">${esc(note)}</div>`:''}</td></tr>`;
}

/* Die Saldokorrektur: eine einzige Zeile über den Einnahmen.
   Gepflegt wird sie über Stift und Notizlampe, gezeigt wird sie
   wie eine Kategorie (.balrow in css/ledger.css). Ein Löschknopf
   fehlt bewusst, die Zeile bleibt immer stehen.

   Ein Siegel hat sie nicht: der Betrag ist die Korrektur, die der
   Nutzer selbst einträgt — es gibt nichts zu bestätigen. Die
   leere Zelle bleibt trotzdem stehen, damit die Zeile mit den
   Karten darunter fluchtet. */
function balanceRow(m){
  const it=state.balance, v=it.amounts[m-1], note=it.notes[m-1];
  return `<div class="card sec-bal">
    <table class="ledger"><tr class="balrow"${dblItem(BALANCE_ID)}>
      <td class="markcell"></td>
      <td class="num amt ${cls(v)}">${eur(v)}</td>
      <td class="pencell"><div class="ptools"><button class="pencil" data-edit="${BALANCE_ID}"
        title="${t('bal.editTip')}">&#9998;</button>${lampHtml('item',BALANCE_ID,m)}</div></td>
      <td class="nm"><span class="balname" data-tip="${esc(t('bal.tip'))}">${t('bal.row')}</span>
        ${note?`<div class="itemnote">${esc(note)}</div>`:''}</td></tr></table></div>`;
}

function kakRow(k,m){
  const e=state.kak[k]; if(!e) return '';
  const v=kakVal(k,m), done=kakDone(k,m), imported=hasActual(m);
  const est=e.estimated&&!done;
  return `<tr class="${done?'paid':''}"${dblKak(k)}>
    <td class="markcell"><button class="seal${!done&&e.estimated?' est':''}" aria-pressed="${done}" data-kpaid="${esc(k)}"
      ${imported?`disabled title="${t('month.imported')}"`:`title="${done?t('month.markOpen'):t('month.markDone')}"`}>${CHECK_SVG}</button></td>
    <td class="num amt ${est?'est':cls(v)}">${eur(v)}</td>
    <td class="pencell"><div class="ptools"><button class="pencil" data-kedit="${esc(k)}" title="${t('month.editKak')}">&#9998;</button>${lampHtml('kak',k,m)}</div></td>
    <td class="nm"><div class="rowline">
        <span>${e.url?`<a class="linkicon" href="${esc(e.url)}" target="_blank" rel="noopener" title="${t('month.receiptTip')}">${LINK_SVG}</a> `:''}<span class="iname">${esc(keyLabel(k))}</span></span>
        ${kakOv(k,m)!=null?'<span class="pill corrp">corrected</span>':(imported?'<span class="pill">imported</span>':(e.estimated?`<span class="pill">${t('g.estimated')}</span>`:''))}</div>
      ${e.notes[m-1]?`<div class="itemnote">${esc(e.notes[m-1])}</div>`:''}</td></tr>`;
}

function viewMonat(){
  const m=ui.month;
  const due=dueIn(m).filter(it=>!isIncome(it));
  const openN=due.filter(it=>!paidAt(it,m)).length;
  const uncN=unclearCount(m);

  /* Drei unabhängige Filter: das Suchfeld, die Fälligkeit und der
     Zahlungsstand. Sie gelten gleichzeitig — was übrig bleibt,
     erfüllt alle drei. */
  const q=queryQ();
  const stateOk=it=> ui.filter==='alle'
    || (ui.filter==='offen'&&!paidAt(it,m))
    || (ui.filter==='unklar'&&estOf(it))
    || (ui.filter==='bezahlt'&&paidAt(it,m));
  const show=it=> stateOk(it)
    && (ui.dueFilter==='alle' || dueGroup(it.dueDay)===ui.dueFilter)
    && (!q || hayItem(it,m).includes(q));

  const incRows=settledLast(dueIn(m).filter(isIncome)).map(it=>itemRow(it,m)).join('');
  const flexRows=kakCats().map(k=>kakRow(k,m)).join('');

  let outRows='';
  costGroups().forEach(g=>{
    const all=dueIn(m).filter(it=>it.group===g);
    const items=settledLast(all.filter(show));
    if(!items.length) return;
    const gsum=all.reduce((s,it)=>s+it.amounts[m-1],0);
    outRows+=`<tr class="group"><td></td><td class="num amt">${eur(gsum)}</td><td></td>
      <td>${esc(keyLabel(g))}${items.length!==all.length?` <span class="note">${t('month.hidden',all.length-items.length)}</span>`:''}</td></tr>`;
    items.forEach(it=>{outRows+=itemRow(it,m);});
  });

  /* Die Kennzahlen bleiben beim Scrollen stehen — wie die
     Monatsreiter in der Kopfzeile darüber. Die Karten darunter
     werden lang, und die Frage „wie viel bleibt mir" soll man
     nicht durch Hochscrollen beantworten müssen.

     Ganz unten steht die Zeichenerklärung (.legendbar). Sie
     gehört nicht in die Karte der regelmäßigen Kosten: dieselben
     Siegel stehen auch bei den Einnahmen und den Flexible
     Payments. Deshalb ein eigener grauer Kasten unter allen
     Karten. Bezahlt und Noch offen stehen nicht mehr darunter —
     beides sagt schon die Kennzahlenleiste. */
  return `
  <div class="stickybar">
  <div class="kpi">
    <div class="t-in"><div class="lab">${t('month.kpiIncome')}</div><div class="val pos">${eur(income(m))}</div></div>
    <div class="t-flex"><div class="lab">${t('month.kpiKak',hasActual(m)?t('month.kpiActual'):t('month.kpiPlanned'))}</div><div class="val neg">${eur(kakeiboFor(m))}</div></div>
    <div class="t-out"><div class="lab">${t('month.kpiFixed')}</div><div class="val neg">${eur(fixedCost(m))}</div></div>
    <div class="t-out"><div class="lab">${t('month.kpiOpen')}</div><div class="val ${openN?'neg':''}">${eur(openCost(m))}</div>
      <div class="note">${t('month.kpiOpenN',openN,due.length,uncN?t('month.kpiUnclear',uncN):'')}</div></div>
    <div><div class="lab">${t('month.kpiBalance')}</div><div class="val ${cls(saldo(m))}">${eur(saldo(m))}</div></div>
  </div></div>

  ${balanceRow(m)}

  <div class="card sec-in">
    <div class="sechead"><h2 style="margin:0">${t('month.income',MONTHS_LONG[m-1])}</h2>
      <span style="display:flex;gap:12px;align-items:center">
        <button class="btn small" data-newitem="EINNAHMEN">${t('year.addIncome')}</button>
        <span class="tot pos">${eur(income(m))}</span></span></div>
    <table class="ledger">${incRows||`<tr><td class="note">${t('month.noIncome')}</td></tr>`}</table>
  </div>

  <div class="card sec-flex">
    <div class="sechead">
      <h2 style="margin:0">${t('month.kak',MONTHS_LONG[m-1])}<span class="pill">${esc(state.flexSource[m]||t('month.kpiPlanned'))}</span></h2>
      <span style="display:flex;gap:12px;align-items:center">
        <button class="btn small" data-newkak="1">${t('year.addKak')}</button>
        <button class="btn small" data-kview="${m}" title="${t('month.openEvalTip',MONTHS_LONG[m-1])}">${t('month.openEval')}</button>
        <span class="tot neg">${eur(kakeiboFor(m))}</span></span></div>
    <table class="ledger">${flexRows||`<tr><td class="note">${t('month.noKak')}</td></tr>`}</table>
  </div>

  <div class="card sec-out">
    <div class="sechead"><h2 style="margin:0">${t('month.fixed',MONTHS_LONG[m-1])}</h2>
      <span style="display:flex;gap:12px;align-items:center">
        <button class="btn small" data-newitem="1">${t('year.addItem')}</button>
        <span class="tot neg">${eur(fixedCost(m))}</span></span></div>
    <!-- Eine Zeile in der Reihenfolge, in der man filtert: erst
         suchen, dann nach Fälligkeit einschränken, dann nach
         Zahlungsstand. Das Suchfeld ist so breit wie die drei
         Spalten vor der Bezeichnung (--leadw in css/ledger.css) —
         die Knöpfe dahinter fangen damit genau über der
         Bezeichnungsspalte an. -->
    <div class="filterbar fbrow">
      ${filterField()}
      <span class="fbgroup">
        ${fbtn('duefilter','alle',t('month.fDueAll'),t('month.fDueAllTip'),ui.dueFilter)}
        ${fbtn('duefilter','A',t('month.fDueA'),t('month.fDueATip'),ui.dueFilter)}
        ${fbtn('duefilter','M',t('month.fDueM'),t('month.fDueMTip'),ui.dueFilter)}
        ${fbtn('duefilter','E',t('month.fDueE'),t('month.fDueETip'),ui.dueFilter)}
      </span>
      <span class="fbgroup">
        ${fbtn('filter','alle',t('month.fAll'),t('month.fAllTip'),ui.filter)}
        ${fbtn('filter','offen',t('month.fOpen'),t('month.fOpenTip'),ui.filter)}
        ${fbtn('filter','unklar',t('month.fEst'),t('month.fEstTip'),ui.filter)}
        ${fbtn('filter','bezahlt',t('month.fPaid'),t('month.fPaidTip'),ui.filter)}
      </span>
    </div>
    <table class="ledger">${outRows||`<tr><td class="note">${t('month.noItems')}</td></tr>`}</table>
  </div>

  <div class="legendbar">
    <span class="legtitle">${t('month.legTitle')}</span>
    <div class="legend">
      <span><i class="l-open"></i>${t('month.legOpen')}</span><span><i class="l-paid"></i>${t('month.legPaid')}</span>
      <span><i class="l-unc"></i>${t('month.legEst')}</span>
    </div>
  </div>`;
}
