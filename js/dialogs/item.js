/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Posten bearbeiten"
   Ein regelmäßiger Posten: Stammdaten, Schnelleingabe über den
   Rhythmus und die zwölf Monatsbeträge.
   ══════════════════════════════════════════════════════════════ */

/* Auswahlliste aus Banken oder Zahlungsarten. Ein Kürzel, das die
   Liste nicht kennt, bleibt erhalten und wird markiert. */
function optList(arr,cur){
  const known=arr.some(x=>x.code===cur);
  return `<option value="">—</option>`+arr.map(x=>`<option value="${esc(x.code)}"${x.code===cur?' selected':''}>${esc(x.code)} — ${esc(x.label)}</option>`).join('')
    +(cur&&!known?`<option value="${esc(cur)}" selected>${esc(cur)} (?)</option>`:'');
}

/* ── Wie weit füllt die Schnelleingabe? ───────────────────────
   Läuft der Posten noch in diesem Jahr aus, gibt es zwei
   vernünftige Ziele: bis zur letzten Rate — oder bis Dezember,
   etwa weil der Vertrag sich verlängert. Beides ist eine
   Handlung, keine Zustimmung, deshalb bekommt jede ihren eigenen
   Knopf statt „OK" und „Abbrechen". Wer gar nicht füllen will,
   schließt das Fenster mit Escape oder einem Klick daneben. */
function askFillRange(endM,then){
  const ask=document.createElement('div');
  ask.className='modal'; ask.style.zIndex=70;
  ask.innerHTML=`<div class="box" style="max-width:560px">
    <h3>${t('item.rangeTitle')}</h3>
    <p class="subline">${t('item.rangeSub',MONTHS_LONG[endM-1],MONTHS_LONG[11])}</p>
    <div class="row-end">
      <button class="btn" id="rYear">${t('item.rangeYear',MONTHS_LONG[11])}</button>
      <button class="btn primary" id="rEnd">${t('item.rangeEnd',MONTHS_LONG[endM-1])}</button></div>
  </div>`;
  document.body.appendChild(ask); tabThroughFields(ask);
  const pick=to=>{ ask.remove(); then(to); };
  ask.querySelector('#rEnd').onclick=()=>pick(endM);
  ask.querySelector('#rYear').onclick=()=>pick(12);
  ask.onclick=e=>{ if(e.target===ask) closeModal(ask); };
  ask.querySelector('#rEnd').focus();
}

/* group wählt bei einem neuen Posten den Block vor — die
   Monatsansicht legt aus dem Einnahmenblock heraus gleich eine
   Einnahme an. "1" oder nichts heißt: der erste Block der Liste.

   copyOf trägt den Namen der Vorlage: dann ist `item` eine frisch
   gebaute Kopie, die es im Zustand noch nicht gibt. Sie wird wie
   ein neuer Posten behandelt — angelegt wird sie erst mit
   „Speichern", und wer abbricht, hinterlässt nichts. Gebaut wird
   sie unten in #fDup. */
function editItem(item,group,copyOf){
  const isNew=!item||!!copyOf;
  /* Ein neuer Posten bekommt nur dann einen Block, wenn der
     Aufrufer einen nennt — „Neue Einnahme" tut das. Sonst bleibt
     die Auswahl leer: welcher Block gemeint ist, weiß nur der
     Nutzer, und eine stille Vorauswahl landet unbemerkt in der
     Datei. Gespeichert wird erst mit Block (siehe #fSave). */
  const firstGroup=(group&&group!=='1'&&allGroups().includes(group))?group:'';
  const it=item||normalize({id:uid(),name:'',group:firstGroup,amounts:Array(12).fill(0)});
  const lockN=it.paid.filter((p,i)=>p&&it.amounts[i]!==0).length;
  /* So weit ist das Jahr abgerechnet: bis dahin reicht der Knopf
     „alles abschließen". Der laufende Monat bleibt ausdrücklich
     offen. Gibt es noch keinen fertigen Monat — Januar oder ein
     künftiges Jahr —, entfällt der Knopf. */
  const last=completedMonths();
  /* Die Saldokorrektur gehört keinem Block an und lässt sich
     nicht löschen — sonst wird sie wie jeder andere Posten
     gepflegt (siehe js/state.js). */
  const isBal=isBalanceItem(it);

  const box=document.createElement('div');
  box.className='modal';
  box.innerHTML=`<div class="box">
    <h3>${lampPos('item',it.id)}${isNew?(copyOf?t('item.dupTitle'):t('item.add')):esc(it.name)}</h3>
    <p class="subline">${copyOf?t('item.dupSub',esc(copyOf))
      :(isBal?t('bal.hint'):(lockN?t('item.lockedN',lockN):t('item.allOpen')))}</p>
    <div class="cols ${isBal?'':'c2'}">
      <div class="field"><label>${t('item.name')}</label><input id="fName" value="${esc(it.name)}" placeholder="${t('item.namePh')}"></div>
      ${isBal?'':`<div class="field"><label>${t('item.block')}</label><select id="fGroup">
        ${it.group?'':`<option value="" selected>${t('item.blockPick')}</option>`}
        ${allGroups().map(g=>`<option value="${esc(g)}"${g===it.group?' selected':''}>${esc(keyLabel(g))}</option>`).join('')}</select></div>`}
    </div>
    <div class="cols c3">
      <div class="field"><label>${t('item.bank')}</label><select id="fBank">${optList(state.banks,it.bank)}</select></div>
      <div class="field"><label>${t('item.pay')}</label><select id="fPay">${optList(state.pays,it.pay)}</select></div>
      <div class="field"><label>${t('item.due')}</label><select id="fDue">${DUE_OPTS.map(([v,l])=>`<option value="${v}"${v===String(it.dueDay)?' selected':''}>${l}</option>`).join('')}</select></div>
    </div>
    <div class="cols c6">
      <div class="field"><label>${t('item.endM')}</label><select id="fEndM"><option value="">—</option>${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${it.end&&it.end.m===i+1?' selected':''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label>${t('item.endY')}</label><input id="fEndY" class="num" type="number" min="2020" max="2099" value="${it.end?it.end.y:''}"></div>
      <div class="field span4"><label>${t('item.url')}</label>
        <div class="urlrow"><input id="fUrl" value="${esc(it.url)}" placeholder="https://…">
          <button type="button" class="btn small urlgo" data-go="fUrl" title="${esc(t('item.urlOpenTip'))}">${t('item.urlOpen')}</button></div></div>
    </div>
    ${isBal?'':`<div class="field"><label>${t('item.kind')}</label>
      <label style="display:flex;gap:8px;align-items:center;font-family:var(--font-ui);font-size:14px;text-transform:none;letter-spacing:0;color:var(--ink)">
        <input type="checkbox" id="fEst" ${it.estimated?'checked':''} style="width:auto">
        ${t('item.est')}</label></div>`}
    <p class="note" style="margin:-4px 0 10px"><button class="linkish" id="fLists">${t('item.lists')}</button></p>
    <div class="quick">
      <div class="field" style="margin-bottom:8px"><label>${t('item.quick')}</label></div>
      <!-- In der Reihenfolge, in der man es denkt: wie oft, ab
           wann, wie viel. Der Betrag steht zuletzt, weil er das
           ist, was danach in die Monate wandert. -->
      <div class="qrow">
        <select id="qRhythm" aria-label="${t('item.rhythm')}">${RHYTHM.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
        <select id="qStart" aria-label="${t('g.month')}">${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${i+1===CUR?' selected':''}>${t('item.fromMonth',n)}</option>`).join('')}</select>
        <input id="qVal" class="num signed" aria-label="${t('g.amount')}" placeholder="${t('g.amount')}">
      </div>
      <!-- Rechts, und „Übernehmen" ganz außen: es ist der Knopf,
           der etwas tut, und steht damit dort, wo in jedem Fenster
           der Knopf steht, der etwas tut. -->
      <div class="qbtns">
        <button class="btn small" id="qClear">${t('item.clear')}</button>
        <button class="btn primary small" id="qApply">${t('item.apply')}</button>
      </div>
      <p class="note" style="margin:8px 0 0">${t('item.quickHint')}</p>
    </div>
    <div class="field"><label>${t('item.perMonth')}</label>
      ${isBal?'':`<div style="display:flex;gap:8px;margin:0 0 10px;flex-wrap:wrap">
        ${last?`<button class="btn small" id="qLock" title="${esc(t('item.lockTillTip',MONTHS_LONG[last-1]))}">${t('item.lockTill',MONTHS_LONG[last-1])}</button>`:''}
        <button class="btn small" id="qUnlock" title="${esc(t('item.unlockAllTip'))}">${t('item.unlockAll')}</button></div>`}
      <div class="mgrid">${MONTHS.map((m,i)=>{const lock=!isBal&&it.paid[i];
        return `<div class="cell${lock?' lockedcell':''}" data-cell="${i}">
        <div class="cellhead"><span class="mlab ${i+1===CUR?'curm':''}">${m}</span>
          <span class="ctools">${lampHtml('item',it.id,i+1)}
            ${isBal?'':`<button type="button" class="seal mini" data-pi="${i}" aria-pressed="${lock}"
              title="${lock?t('item.lockedTip'):t('month.markPaid')}">${CHECK_SVG}</button>`}</span></div>
        <input class="num signed" data-mi="${i}" ${lock?'disabled':''} value="${it.amounts[i]?nf.format(it.amounts[i]):''}" placeholder="0,00">
        <div class="cellnote">${esc(it.notes[i]||'')}</div></div>`;}).join('')}</div>
    </div>
    <div class="row-end">${(isNew||isBal)?'':`<button class="linkish" id="fDel" style="margin-right:auto">${t('item.del')}</button>`}
      ${(isNew||isBal)?'':`<button class="btn" id="fDup" data-tip="${esc(t('item.dupTip'))}">${t('item.dup')}</button>`}
      <button class="btn" id="fCancel">${t('g.cancel')}</button><button class="btn primary" id="fSave">${t('g.save')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);

  /* Ein Posten, den es noch nicht gibt, ist für findItem() nicht
     zu finden. Damit die Notizlampen trotzdem schon arbeiten,
     bekommt der Entwurf hier seinen Platz (siehe js/ui.js); der
     Name für das Notizfenster kommt aus dem Feld, nicht aus dem
     Zustand — dort steht er erst nach dem Speichern. */
  if(isNew) useDraft('item',it.id,it,
    ()=>box.querySelector('#fName').value.trim()||t('item.add'),box);

  bindSign(box);

  bindNotes(box,b=>{
    const cell=b.closest('.cell'); if(!cell) return;
    const i=+cell.dataset.cell, n=it.notes[i]||'';
    cell.querySelector('.cellnote').textContent=n;
  });

  /* Haken setzen sperrt das Betragsfeld. */
  const setSeal=(cb,on)=>{
    cb.setAttribute('aria-pressed',on);
    cb.title=on?t('item.lockedTip'):t('month.markPaid');
    const inp=box.querySelector(`[data-mi="${cb.dataset.pi}"]`);
    inp.disabled=on;
    cb.closest('.cell').classList.toggle('lockedcell',on);
    return inp;
  };
  const seals=()=>[...box.querySelectorAll('[data-pi]')];
  const isOn=cb=>cb.getAttribute('aria-pressed')==='true';
  box.querySelectorAll('[data-pi]').forEach(cb=>cb.onclick=()=>{
    const on=!isOn(cb), inp=setSeal(cb,on);
    if(!on){inp.focus();inp.select();}
  });

  /* Alles bis zum laufenden Monat abschließen — und der Weg
     zurück. Beide ändern nur das Fenster; in den Zustand kommt
     es erst über „Speichern". Monate ohne Betrag bleiben offen:
     dort gibt es nichts zu bestätigen. */
  const lock=box.querySelector('#qLock');
  if(lock) lock.onclick=()=>{
    let n=0;
    seals().forEach(cb=>{
      const i=+cb.dataset.pi;
      if(i+1>last||isOn(cb)) return;
      if(parseGermanNumber(box.querySelector(`[data-mi="${i}"]`).value)===0) return;
      setSeal(cb,true); n++;
    });
    toast(t('item.lockedNow',n));
  };
  const unlock=box.querySelector('#qUnlock');
  if(unlock) unlock.onclick=()=>{
    let n=0;
    seals().forEach(cb=>{ if(isOn(cb)){ setSeal(cb,false); n++; } });
    toast(t('item.unlockedNow',n));
  };

  const cells=()=>[...box.querySelectorAll('[data-mi]')];
  const endMonth=()=>{
    const y=+box.querySelector('#fEndY').value, m=+box.querySelector('#fEndM').value;
    if(!m||!y) return 12;
    if(y<YEAR) return 0; if(y>YEAR) return 12; return m;
  };

  /* Endmonat setzt das Jahr automatisch: bis einschließlich
     laufendem Monat -> nächstes Jahr. */
  box.querySelector('#fEndM').onchange=ev=>{
    const m=+ev.target.value, yEl=box.querySelector('#fEndY');
    if(!m){ yEl.value=''; return; }
    yEl.value = m<=CUR ? (YEAR+1) : YEAR;
  };

  box.querySelector('#qApply').onclick=()=>{
    const v=parseGermanNumber(box.querySelector('#qVal').value);
    const step=+box.querySelector('#qRhythm').value;
    const start=+box.querySelector('#qStart').value;
    const last=endMonth();

    const fill=to=>{
      let n=0,cl=0;
      cells().forEach(c=>{const i=+c.dataset.mi; if(c.disabled) return;
        if((i+1)<start||(i+1)>to) return;
        if((i+1-start)%step===0){c.value=v?nf.format(v):'';n++;}
        else if(c.value.trim()!==''){c.value='';cl++;}});
      signValues(box);
      toast(t('item.setN',n)+(cl?t('item.cleared',cl):'')+'.');
    };

    /* Endet der Posten in diesem Jahr und stehen danach noch
       Monate offen, sind zwei Ziele denkbar — dann entscheidet
       der Nutzer. Liegt das Ende vor dem Startmonat oder gar
       nicht in diesem Jahr, gibt es nichts zu wählen. */
    if(last>=start&&last<12) askFillRange(last,fill); else fill(last);
  };
  box.querySelector('#qClear').onclick=()=>{
    cells().forEach(c=>{if(!c.disabled)c.value='';}); signValues(box);
  };
  box.querySelector('#fLists').onclick=()=>{box.remove();editLists();};
  box.querySelector('#fCancel').onclick=()=>closeModal(box);
  box.onclick=e=>{if(e.target===box)closeModal(box);};
  bindUrlGo(box);

  /* Löschen nimmt die zwölf Beträge, die Haken und die Notizen
     mit. Deshalb erst die Rückfrage; wer sie abbricht, ändert
     nichts. */
  const del=box.querySelector('#fDel');
  if(del) del.onclick=()=>{
    if(!confirm(t('item.delAsk',it.name))) return;
    state.fixed=state.fixed.filter(x=>x.id!==it.id);
    save(); box.remove(); render(); toast(t('item.deleted',it.name));
  };

  /* Der getippte Stand, in ein Objekt geschrieben — einmal für
     „Speichern" und einmal für das Duplikat. Haken und Notizen
     stehen ausdrücklich nicht darin: das Duplikat fängt ohne sie
     an, und „Speichern" holt die Haken gleich von den Siegeln. */
  const collect=o=>{
    o.name=box.querySelector('#fName').value.trim();
    const gEl=box.querySelector('#fGroup');
    if(gEl) o.group=gEl.value;
    o.bank=box.querySelector('#fBank').value; o.pay=box.querySelector('#fPay').value;
    o.dueDay=box.querySelector('#fDue').value; o.url=box.querySelector('#fUrl').value.trim();
    const estEl=box.querySelector('#fEst');
    o.estimated=estEl?estEl.checked:false;
    const em=+box.querySelector('#fEndM').value, ey=+box.querySelector('#fEndY').value;
    o.end=(em&&ey)?{y:ey,m:em}:null;
    cells().forEach(c=>{o.amounts[+c.dataset.mi]=parseGermanNumber(c.value);});
  };

  /* ── Duplizieren ────────────────────────────────────────────
     Dasselbe Fenster noch einmal, mit einer Kopie darin: alle
     Stammdaten und die zwölf Beträge so, wie sie gerade im
     Fenster stehen — aber ohne einen einzigen Haken und ohne
     Notizen, weder zur Position noch zu einem Monat. Beides
     gehört zur Vorlage, nicht zur Kopie; deshalb sind auch alle
     zwölf Felder änderbar.

     Die Vorlage selbst bleibt unangetastet: Getipptes wandert in
     die Kopie, nicht in sie. Angelegt wird erst mit „Speichern". */
  const dup=box.querySelector('#fDup');
  if(dup) dup.onclick=()=>{
    const c=normalize({id:uid(),name:'',group:'',amounts:Array(12).fill(0)});
    collect(c);
    c.name=(c.name||it.name)+' '+t('item.copy');
    box.remove();
    editItem(c,null,it.name);
  };

  box.querySelector('#fSave').onclick=()=>{
    const name=box.querySelector('#fName').value.trim();
    if(!name){box.querySelector('#fName').focus();toast(t('item.needName'));return;}
    /* Ohne Block gehört der Posten nirgendwohin: er stünde in
       keiner Kategorie der Monatsansicht und in keiner Gruppe der
       Jahresmatrix. Deshalb hier die Grenze — nicht erst beim
       Zeichnen. */
    const gEl=box.querySelector('#fGroup');
    if(gEl&&!gEl.value){ gEl.focus(); toast(t('item.needBlock')); return; }
    collect(it);
    box.querySelectorAll('[data-pi]').forEach(cb=>{it.paid[+cb.dataset.pi]=cb.getAttribute('aria-pressed')==='true';});
    if(isNew) state.fixed.push(it);
    save(); box.remove(); render();
  };
  box.querySelector('#fName').focus();
}
