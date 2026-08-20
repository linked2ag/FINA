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

/* ── Die Auswahlliste der Kategorie ───────────────────────────
   Zwei Gruppen in einer Liste: erst die Einnahmen, dann die
   Ausgaben. Ein Posten gehört immer in genau eine der beiden
   Welten, und welche das ist, entscheidet sich mit diesem Feld —
   nebeneinander stehende Listen wären zwei Fragen für eine
   Antwort.

   Gebaut wird das mit <optgroup>: dessen Beschriftung ist von
   Haus aus **nicht wählbar**, es lässt sich also nur eine
   Kategorie treffen und nie die Gruppe darüber. Grün und Rot sind
   dieselben Farben wie in allen Ansichten — man sieht schon beim
   Aufklappen, welche Wahl was bedeutet. */
function groupOpts(cur){
  const opt=(g,cls)=>`<option value="${esc(g)}" class="${cls}"${g===cur?' selected':''}>${esc(keyLabel(g))}</option>`;
  const grp=(label,arr,cls)=>arr.length
    ?`<optgroup label="${esc(label)}" class="${cls}">${arr.map(g=>opt(g,cls)).join('')}</optgroup>`:'';
  return grp(t('set.groupsIn'),incomeGroups(),'og-in')
       + grp(t('set.groupsOut'),costGroups(),'og-out');
}

/* group wählt bei einem neuen Posten den Block vor — die
   Monatsansicht legt aus dem Einnahmenblock heraus gleich eine
   Einnahme an. "1" oder nichts heißt: der erste Block der Liste.

   copyOf trägt den Namen der Vorlage: dann ist `item` eine frisch
   gebaute Kopie, die es im Zustand noch nicht gibt. Sie wird wie
   ein neuer Posten behandelt — angelegt wird sie erst mit
   „Speichern", und wer abbricht, hinterlässt nichts. Gebaut wird
   sie unten in #fDup. */
function editItem(item,group,copyOf,focusMonth){
  const isNew=!item||!!copyOf;
  /* Die Links werden im Fenster bearbeitet, nicht im Zustand: eine
     Arbeitskopie, die erst „Speichern" übernimmt. Wer abbricht,
     hinterlässt nichts — wie beim Namen und bei den Beträgen. */
  const links=((item&&item.links)||[]).map(x=>({name:x.name,url:x.url}));
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
  /* Die Bezeichnung steht nicht mehr in einem Feld zwischen den
     Stammdaten, sondern in der Überschrift — sie benennt den
     Posten, sie beschreibt ihn nicht. Bis zum Speichern lebt sie
     nur hier; ein Feld, aus dem man sie lesen könnte, gibt es
     nicht mehr. Dasselbe wie im Fenster der Flexible Payments. */
  let name=it.name||'';

  /* Ein Weg je Auswahlliste, in der Reihenfolge der Felder darunter:
     Kategorie, Bank, Zahlungsart. Banken und Zahlungsarten stehen in
     den Einstellungen im selben Bereich — zwei Wege dorthin sind
     trotzdem richtig: geklickt wird auf das, was gerade fehlt, und
     nicht auf den Bereich, in dem es zufällig wohnt. Der
     Saldokorrektur fehlt die Kategorie, ihr fehlt auch der Weg. */
  const listLinks=setLinks([isBal?null:['groups',t('set.groups')],
    ['banks',t('set.banks')],['banks',t('set.pays')]]);

  const box=document.createElement('div');
  box.className='modal';
  /* ── Das Fenster in vier Blöcken ─────────────────────────────
     Zuordnung · Links · Schnelleingabe · Monate. Jeder steht in
     einem eigenen `.dgrp` — ein Feld mehr oder weniger verschiebt
     dann nichts an der Ordnung, und man sieht, wo eine Angabe
     hingehört, bevor man ihre Beschriftung liest. Überschriften
     tragen die Blöcke nicht: ihre Felder sind beschriftet, und ein
     Wort über jedem Block wäre genau der Text, der ein Fenster
     zumüllt.

     **Unter der Bezeichnung steht nichts mehr.** Dort stand ein
     Satz über abgeschlossene Monate („bis Juli abgeschlossen") —
     das sagen die gesperrten Monatsfelder weiter unten von selbst,
     und über dem Fenster stand damit eine Zeile, die man bei jedem
     Öffnen mitliest. */
  box.innerHTML=`<div class="box form">
    <h3>${lampPos('item',it.id)}<button type="button" class="titlebtn" id="fTitle"
      title="${esc(t('item.nameBtnTip'))}"></button></h3>
    <!-- ── Woher die Auswahllisten kommen ──────────────────────
         Ein Weg je Liste, und zwar **über** der Reihe, in der die
         Listen stehen: dort stellt sich die Frage („diese Kategorie
         gibt es noch nicht"), und dort steht die Antwort. Vorher
         stand ein einzelner Sammellink weiter unten, hinter der
         Betragsart — weit weg von den Feldern, die er meint.

         Das Einstellungsfenster legt sich **über** dieses hier,
         ohne es zu schließen: was schon getippt ist, bleibt stehen,
         und wenn es wieder geht, stehen die neuen Einträge in den
         Listen (relist() weiter unten). -->
    <div class="dgrp">
    <p class="note listlinks">${t('item.listsIn')}${listLinks}</p>
    <!-- Die Kategorie steht in derselben Reihe wie Bank,
         Zahlungsart und Fälligkeit: alle vier sind Auswahllisten,
         und alle vier beschreiben, wohin der Posten gehört. Bei
         der Saldokorrektur entfällt sie, dann sind es drei. -->
    <div class="cols ${isBal?'c3':'c4'}">
      ${isBal?'':`<div class="field"><label>${t('item.block')}</label><select id="fGroup" class="grouppick">
        ${it.group?'':`<option value="" selected>${t('item.blockPick')}</option>`}
        ${groupOpts(it.group)}</select></div>`}
      <div class="field"><label>${t('item.bank')}</label><select id="fBank">${optList(state.banks,it.bank)}</select></div>
      <div class="field"><label>${t('item.pay')}</label><select id="fPay">${optList(state.pays,it.pay)}</select></div>
      <div class="field"><label>${t('item.due')}</label><select id="fDue">${DUE_OPTS.map(([v,l])=>`<option value="${v}"${v===String(it.dueDay)?' selected':''}>${l}</option>`).join('')}</select></div>
    </div>
    <div class="cols c2">
      <div class="field"><label>${t('item.endM')}</label><select id="fEndM"><option value="">—</option>${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${it.end&&it.end.m===i+1?' selected':''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label>${t('item.endY')}</label><input id="fEndY" class="num" type="number" min="2020" max="2099" value="${it.end?it.end.y:''}"></div>
    </div>
    </div>
    <!-- Die Links stehen außerhalb der Reihe: die Liste wächst mit
         jedem Eintrag, und in einer Rasterreihe zöge sie die
         Auswahllisten daneben in die Länge. Das Plus rechts der
         Überschrift ist dasselbe wie in den Einstellungen. -->
    <div class="dgrp"><div class="field linkfield">${linkHead()}<div id="fLinks">${linkRows(links)}</div></div></div>
    <!-- Die Betragsart steht bei der Schnelleingabe und nicht mehr
         als eigenes Feld darüber: „geschätzt" sagt etwas über die
         Beträge, und die tippt man hier. -->
    <div class="quick dgrp">
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
      <!-- Was „Übernehmen" tut, sagt der Knopf als Sprechblase und
           nicht als Satz daneben: er stand in derselben Zeile, war
           in beiden Sprachen zweizeilig und machte aus der Knopf-
           zeile einen Absatz. -->
      <div class="qbtns">
        ${isBal?'':`<label class="qest" data-tip="${esc(t('item.est'))}"><input type="checkbox" id="fEst" ${it.estimated?'checked':''}>${t('g.estimated')}</label>`}
        <button class="btn small" id="qClear">${t('item.clear')}</button>
        <button class="btn primary small" id="qApply" data-tip="${esc(t('item.quickHint'))}">${t('item.apply')}</button>
      </div>
    </div>
    <div class="dgrp"><div class="field mfield"><label>${t('item.perMonth')}</label>
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
    </div></div>
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
  /* Die Überschrift zeigt die Bezeichnung und öffnet das Fenster,
     das sie ändert. Steht noch keine da, ist sie eine Aufforderung.
     Namen von Posten sind keine Schlüssel — zwei dürfen gleich
     heißen —, deshalb prüft askName() hier auf nichts. */
  const title=box.querySelector('#fTitle');
  bindTitle(title,()=>name,v=>{name=v;},
    {title:t('item.nameTitle'),sub:t('item.nameSub'),
     ph:t('item.namePh'),pick:t('item.namePick')},null);

  if(isNew) useDraft('item',it.id,it,()=>name||t('item.add'),box);

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
  /* ── Zurück aus den Einstellungen ─────────────────────────
     Die drei Auswahllisten werden neu gebaut; alles andere im
     Fenster bleibt, wie es steht — es war ja nie weg.

     **Gewählt bleibt, was gewählt war.** Nur wenn es den Eintrag
     nicht mehr gibt, zählt der Posten selbst: Umbenennen zieht ihn
     mit (renameGroup, askCarryCodes in js/dialogs/settings.js), und
     ein Fenster, das den alten Namen behielte, schriebe ihn beim
     Speichern zurück. Ein leeres Feld bleibt leer — „—" ist eine
     Wahl und keine Lücke. Kennt am Ende niemand den Wert, bleibt er
     stehen und trägt sein Fragezeichen wie beim Öffnen. */
  const relist=()=>{
    const g=box.querySelector('#fGroup');
    if(g){
      const all=allGroups();
      const cur=all.includes(g.value)?g.value:(all.includes(it.group)?it.group:'');
      g.innerHTML=(cur?'':`<option value="" selected>${t('item.blockPick')}</option>`)+groupOpts(cur);
    }
    const codes=(sel,arr,was)=>{
      const known=c=>!c||arr.some(x=>x.code===c);
      sel.innerHTML=optList(arr,(known(sel.value)||sel.value===was)?sel.value:was);
    };
    codes(box.querySelector('#fBank'),state.banks,it.bank);
    codes(box.querySelector('#fPay'),state.pays,it.pay);
  };
  bindSetLinks(box,relist);
  box.querySelector('#fCancel').onclick=()=>closeModal(box);
  box.onclick=e=>{if(e.target===box)closeModal(box);};
  /* Die Linkliste zeichnet sich nach jeder Änderung neu; die Klicks
     hängen deshalb an der frisch gebauten Liste, nicht ein für
     alle Mal. */
  const drawLinks=()=>{
    box.querySelector('#fLinks').innerHTML=linkRows(links);
    bindLinks(box.querySelector('.linkfield'),links,drawLinks);
  };
  bindLinks(box.querySelector('.linkfield'),links,drawLinks);

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
    o.name=name;
    const gEl=box.querySelector('#fGroup');
    if(gEl) o.group=gEl.value;
    o.bank=box.querySelector('#fBank').value; o.pay=box.querySelector('#fPay').value;
    o.dueDay=box.querySelector('#fDue').value;
    o.links=links.map(x=>({name:x.name,url:x.url}));
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
    c.name=(name||it.name)+' '+t('item.copy');
    box.remove();
    editItem(c,null,it.name);
  };

  box.querySelector('#fSave').onclick=()=>{
    /* Ohne Bezeichnung wird nicht gespeichert. Statt einer
       Meldung öffnet sich das Fenster, in dem sie einzutragen
       ist — dorthin müsste man ohnehin. */
    if(!name){ title.click(); return; }
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
  /* Ohne Bezeichnung steht der erste Schritt im Kopf — dorthin
     der Fokus. Sonst ins erste Feld, wie bisher. */
  /* Kommt das Fenster vom Siegel eines geschätzten Betrags
     (js/app.js), steht die Schreibmarke im Betrag genau dieses
     Monats — fertig markiert, damit die Zahl mit dem ersten
     Zeichen richtiggestellt ist. Das ist der ganze Zweck des
     Umwegs, deshalb geht der Fokus dorthin und nicht ins erste
     Feld. */
  const mCell=focusMonth?box.querySelector(`[data-mi="${focusMonth-1}"]`):null;
  if(mCell){
    /* **Der Rahmen kommt immer**: er sagt, auf welchen Monat
       geklickt wurde, und das gilt für einen abgehakten Betrag
       genauso wie für einen offenen. Die Schreibmarke bekommt nur
       das offene Feld — ein gesperrtes lässt sich nicht ändern, und
       ein Fokus darin sähe nach einem Angebot aus, das es nicht
       gibt. */
    mCell.closest('.cell').classList.add('askcell');
    if(!mCell.disabled){ mCell.focus(); mCell.select(); }
    else (name?(box.querySelector('#fGroup')||box.querySelector('#fBank')):title).focus();
  }
  else (name?(box.querySelector('#fGroup')||box.querySelector('#fBank')):title).focus();
}
