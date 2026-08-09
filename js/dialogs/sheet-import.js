/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „FINA-Tabelle einlesen"
   Derselbe Weg wie beim Fast-Budget-Import, nur mit einem Schritt
   mehr Prüfung — hier kommt nicht ein Monat herein, sondern ein
   ganzes Buch:

     0. Was für eine Datei das ist und welche Spalten darin
        stehen müssen (openSheetInfo, vor der Dateiauswahl).
     1. Prüfen — die Datei ist gelesen, nichts ist geändert. FINA
        zeigt, was es an Gliederung gefunden hat, und rechnet die
        Blocksummen der Tabelle gegen die eigene Lesung.
     2. Ersetzen bestätigen — was aus dem Buch verschwindet.

   Erst der letzte Knopf ruft applySheet() aus js/sheet.js. Bis
   dahin führt jeder Weg zurück, ohne Spuren zu hinterlassen.
   ══════════════════════════════════════════════════════════════ */

/* Die drei Geldarten, in die ein Block der Tabelle wandern kann —
   und der leere Wert: „nicht übernehmen". Die Reihenfolge ist die
   der Ansichten. */
const SHEET_KINDS=()=>[['in',t('sheet.kIn')],['flex',t('sheet.kFlex')],
  ['out',t('sheet.kOut')],['',t('sheet.kSkip')]];

function openSheetInfo(){
  const col=(name,txt)=>`<tr><td class="nm"><code>${name}</code></td><td>${txt}</td></tr>`;
  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box" style="max-width:760px">
    <h3>${t('shInfo.title')}</h3>
    <p class="subline">${t('shInfo.sub')}</p>
    <div class="field"><label>${t('shInfo.needTitle')}</label>
      <p class="note" style="margin:0 0 8px">${t('shInfo.need')}</p>
      <table class="ledger">
        ${col(t('shInfo.cMonths'),t('shInfo.colMonths'))}
        ${col(t('shInfo.cYear'),t('shInfo.colYear'))}
        ${col(t('shInfo.cMark'),t('shInfo.colMark'))}</table></div>
    <div class="field"><label>${t('shInfo.optTitle')}</label>
      <table class="ledger">
        ${col('B',t('shInfo.colBank'))}
        ${col('Z',t('shInfo.colPay'))}
        ${col('T',t('shInfo.colDue'))}
        ${col('Deadline',t('shInfo.colEnd'))}</table></div>
    <p class="note">${t('shInfo.rest')}</p>
    <p class="note">${t('shInfo.replace')}</p>
    <div class="row-end"><button class="btn" id="siCancel">${t('g.cancel')}</button>
      <button class="btn primary" id="siPick">${t('impInfo.pick')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);
  box.onclick=ev=>{ if(ev.target===box) closeModal(box); };
  box.querySelector('#siCancel').onclick=()=>closeModal(box);
  box.querySelector('#siPick').onclick=()=>{
    box.remove();
    document.getElementById('fileSheet').click();
  };
  box.querySelector('#siPick').focus();
}

function openSheetImport(sheet,fileName){
  /* Was der Nutzer im Fenster einstellt. Es lebt hier und nicht im
     Zustand: bis zum letzten Knopf ist nichts entschieden. */
  const opt={year:!!(sheet.year&&sheet.year!==YEAR),tick:true};

  const shell=inner=>{
    const box=document.createElement('div');
    box.className='modal'; box.innerHTML=inner;
    document.body.appendChild(box); tabThroughFields(box);
    box.onclick=ev=>{ if(ev.target===box) closeModal(box); };
    return box;
  };
  const yearSum=v=>v.reduce((a,b)=>a+b,0);

  /* ── Schritt 1: prüfen ──────────────────────────────────── */
  function step1(){
    const blocks=sheet.blocks.map((b,i)=>{
      const opts=SHEET_KINDS().map(([v,l])=>
        `<option value="${v}"${v===b.kind?' selected':''}>${l}</option>`).join('');
      /* Stimmt die Summe der gelesenen Zeilen mit der Summenzeile
         der Tabelle überein, ist die Gliederung sicher erkannt —
         das ist die einzige Prüfung, die etwas beweist. */
      const mark=b.count
        ? (b.ok?`<span class="lock imp">${t('sheet.ok')}</span>`
               :`<span class="lock corr" title="${esc(t('sheet.offTip'))}">${t('sheet.off')}</span>`)
        : `<span class="note">${t('sheet.noRows')}</span>`;
      return `<tr><td class="nm">${esc(b.name)}</td>
        <td><select data-kind="${i}"${b.count?'':' disabled'}>${opts}</select></td>
        <td class="num ${cls(yearSum(b.vals))}">${eur(yearSum(b.vals))}</td>
        <td class="num ${cls(yearSum(b.sum))}">${eur(yearSum(b.sum))}</td>
        <td>${b.count} ${mark}</td></tr>`;
    }).join('');

    /* Die Gliederung, wie FINA sie gelesen hat — Kategorie für
       Kategorie, mit der Zahl ihrer Zeilen. Wer hier etwas
       Falsches sieht, bricht ab und räumt in der Tabelle auf. */
    /* Eine Kategorie ohne eigene Summenzeile (`loose`) zählt ihre
       Zeilen selbst zusammen. */
    const catSum=c=>c.vals?yearSum(c.vals)
      :c.items.reduce((s,i)=>s+yearSum(i.vals),0);
    const tree=sheet.blocks.filter(b=>b.kind&&b.count).map(b=>{
      const kind=SHEET_KINDS().find(([v])=>v===b.kind)[1];
      return `<tr class="group"><td class="nm">${esc(b.name)}</td>
        <td colspan="2">${t('sheet.toKind',kind)}</td></tr>`
        +b.cats.map(c=>`<tr><td class="nm" style="padding-left:18px">${esc(c.name)}${
            c.loose?` <span class="note">${t('sheet.loose')}</span>`:''}</td>
          <td>${t('sheet.rowsN',c.items.length)}</td>
          <td class="num ${cls(catSum(c))}">${eur(catSum(c))}</td></tr>`).join('');
    }).join('');

    const scan=scanSheet(sheet);
    const box=shell(`<div class="box" style="max-width:900px">
      <h3>${t('sheet.step1')}</h3>
      <p class="subline">${t('sheet.step1Sub',esc(fileName||'CSV'),sheet.year||'—')}</p>

      <div class="field"><label>${t('sheet.blocks')}</label>
        <table class="ledger">
          <tr><th>${t('sheet.colBlock')}</th><th>${t('sheet.colKind')}</th>
            <th class="num">${t('sheet.colSheet')}</th><th class="num">${t('sheet.colRead')}</th>
            <th>${t('sheet.colRows')}</th></tr>${blocks}</table>
        <p class="note" style="margin-top:8px">${t('sheet.blocksHint')}</p></div>

      ${tree?`<div class="field"><label>${t('sheet.struct')}</label>
        <table class="ledger">${tree}</table>
        <p class="note" style="margin-top:8px">${t('sheet.flexHint')}</p></div>`:''}

      <div class="field"><label>${t('sheet.options')}</label>
        <div class="checklist">
          <label class="checkrow"><input type="checkbox" id="shYear" ${opt.year?'checked':''}
              ${sheet.year?'':'disabled'}>
            <span class="clab">${t('sheet.optYear',sheet.year||'—',YEAR)}</span></label>
          <label class="checkrow"><input type="checkbox" id="shTick" ${opt.tick?'checked':''}>
            <span class="clab">${t('sheet.optTick')}</span>
            <span class="chint">${t('sheet.optTickHint')}</span></label></div></div>

      <p class="note">${t('sheet.willMake',scan.items,scan.incomeGroups.length,
        scan.groups.length,scan.kakCats.length)}</p>
      <p class="errline" id="shErr" hidden>${t('sheet.needKind')}</p>

      <div class="row-end"><button class="btn" id="shCancel">${t('g.cancel')}</button>
        <button class="btn primary" id="shNext">${t('g.next')}</button></div></div>`);

    /* Eine geänderte Zuordnung ändert die Gliederung darunter —
       deshalb wird das Fenster neu gebaut, wie im Einstellungs-
       fenster nach „+". Getipptes gibt es hier nicht, nur zwei
       Haken, und die stehen in `opt`. */
    box.querySelectorAll('[data-kind]').forEach(sel=>sel.onchange=()=>{
      sheet.blocks[+sel.dataset.kind].kind=sel.value;
      box.remove(); step1();
    });
    box.querySelector('#shYear').onchange=e=>{ opt.year=e.target.checked; };
    box.querySelector('#shTick').onchange=e=>{ opt.tick=e.target.checked; };
    box.querySelector('#shCancel').onclick=()=>closeModal(box);
    box.querySelector('#shNext').onclick=()=>{
      if(!sheet.blocks.some(b=>b.kind&&b.count)){ box.querySelector('#shErr').hidden=false; return; }
      box.remove(); step2();
    };
  }

  /* ── Schritt 2: ersetzen bestätigen ─────────────────────── */
  function step2(){
    const scan=scanSheet(sheet);
    const row=(lab,before,after)=>`<tr><td class="nm">${lab}</td><td>${before}</td><td>${after}</td></tr>`;
    /* Bank und Zahlungsart getrennt: dasselbe Kürzel darf in
       beiden Listen stehen und meint dann zweierlei. B und PT
       heißen in jeder Sprache so — wie in der Jahresmatrix. */
    const codes=[scan.banks.length?`B: ${scan.banks.map(esc).join(', ')}`:'',
      scan.pays.length?`PT: ${scan.pays.map(esc).join(', ')}`:''].filter(Boolean).join(' · ');
    const box=shell(`<div class="box" style="max-width:720px">
      <h3>${t('sheet.step2')}</h3>
      <p class="subline">${t('sheet.step2Sub')}</p>
      <table class="ledger">
        <tr><th>${t('sheet.what')}</th><th>${t('imp.before')}</th><th>${t('imp.after')}</th></tr>
        ${row(t('sheet.rItems'),state.fixed.length,scan.items)}
        ${row(t('set.groupsIn'),state.incomeGroups.length,scan.incomeGroups.length||1)}
        ${row(t('set.groupsOut'),state.groups.length,scan.groups.length)}
        ${row(t('set.kak'),state.kakCats.length,scan.kakCats.length)}
        ${row(t('sheet.rTx'),state.tx.length,0)}
        ${row(t('sheet.rBal'),t('sheet.monthsN',state.balance.amounts.filter(v=>v).length),t('sheet.monthsN',0))}
      </table>
      ${codes?`<p class="note" style="margin-top:12px">${t('sheet.newCodes',codes)}</p>`:''}
      <p class="note" style="margin-top:12px">${t('sheet.keeps')}</p>
      <p class="note">${t('imp.saveHint')}</p>
      <div class="row-end"><button class="linkish" id="shBack" style="margin-right:auto">${t('sheet.back')}</button>
        <button class="btn" id="shCancel">${t('g.cancel')}</button>
        <button class="btn danger" id="shGo">${t('sheet.go')}</button></div></div>`);

    box.querySelector('#shBack').onclick=()=>{ box.remove(); step1(); };
    box.querySelector('#shCancel').onclick=()=>closeModal(box);
    box.querySelector('#shGo').onclick=()=>{
      const res=applySheet(sheet,opt);
      box.remove();
      /* Ohne Buchungen gibt es keine Unterkategorien und keinen
         Reiter „Fast Budget Details" mehr (siehe hasImport() in
         js/calc.js) — die Anzeige darf nicht darauf stehen
         bleiben. Gezeigt wird das Jahr: dort steht alles
         nebeneinander, was gerade hereingekommen ist. */
      ui.kakDetail=false; ui.kakPick=null;
      ui.view='jahr'; ui.q=''; ui.qFocus=false;
      render();
      let msg=t('sheet.done',res.items,res.incomeGroups+res.groups,res.kakCats);
      if(res.ticked) msg+=t('sheet.doneTick',MONTHS_LONG[res.ticked-1]);
      if(res.banks+res.pays) msg+=t('sheet.doneCodes',res.banks+res.pays);
      toast(msg);
    };
  }

  step1();
}
