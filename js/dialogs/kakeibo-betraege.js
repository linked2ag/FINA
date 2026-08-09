/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Flexible Payments — Kategorie"
   Name, Link, Betragsart und die zwölf Monatswerte einer
   Kakeibo-Kategorie — dasselbe Fenster für eine neue wie für eine
   vorhandene, genau wie beim regelmäßigen Posten. Importierte
   Monate sind gesperrt; wird ein Wert dennoch geändert, gilt er
   als Korrektur (override) und wird als CORRECTED geführt.

   Der Name ist zugleich der Schlüssel in kak, flexActual und
   tx[].main. Er wird deshalb NIE direkt überschrieben, sondern
   über renameKakCat() aus js/categories.js geändert (Regel 2).
   Angelegt wird erst beim Speichern: wer das Fenster schließt,
   hinterlässt nichts.

   Aus demselben Grund steht er auch nicht als Feld zwischen den
   anderen Angaben: er ist keine Eigenschaft der Kategorie, er ist
   ihr Schlüssel. Geändert wird er über die Überschrift, die ihn
   zeigt — sie öffnet askName() (unten), ein Fenster mit Abbrechen
   und Übernehmen. Bis zum Speichern lebt der Name nur in der
   Variablen `name` in editKak(); ein Feld, aus dem man ihn lesen
   könnte, gibt es nicht mehr.
   ══════════════════════════════════════════════════════════════ */

/* editKak(null) legt eine neue Kategorie an.

   copy ist ein Duplikat: {name, entry, from} — eine fertig
   gebaute Kategorie, die es im Zustand noch nicht gibt. Sie wird
   wie eine neue behandelt (angelegt erst mit „Speichern"), trägt
   aber die Werte ihrer Vorlage. Gebaut wird sie unten in #kDup. */
function editKak(k,copy,focusMonth){
  const isNew=!k;
  const e=isNew?(copy?copy.entry:blankKak(0)):state.kak[k];
  if(!e){ toast(t('kdlg.gone')); return; }
  /* Arbeitskopie wie im Posten-Fenster: geändert wird hier,
     übernommen erst beim Speichern. */
  const links=(e.links||[]).map(x=>({name:x.name,url:x.url}));
  /* Die Bezeichnung lebt bis zum Speichern nur hier: es gibt kein
     Feld mehr, aus dem man sie lesen könnte. Der Kopf zeigt sie,
     das kleine Fenster ändert sie. */
  let name=isNew?(copy?copy.name:''):k;

  const imported=i=>!isNew&&hasActual(i+1);
  const lockN=MONTHS.filter((_,i)=>imported(i)).length;
  const last=completedMonths();        /* ohne den laufenden Monat */
  const box=document.createElement('div');
  box.className='modal';

  /* ── Woher der Wert des Monats kommt ────────────────────────
     **CORRECTED steht orange** — dieselbe Farbe, die in der ganzen
     Anwendung „das ist noch nicht der Import, das hat jemand von
     Hand gesetzt" heißt. Grün bleibt dem unveränderten Import. Die
     Marke sagt beim Überfahren, **was importiert war**: wer eine
     Korrektur sieht, will als Erstes wissen, wovon abgewichen
     wurde. Der Ursprungswert steht weiter in state.flexActual —
     die Korrektur liegt daneben in override und überschreibt ihn
     nicht.

     **Gelesen wird das Feld, nicht der Zustand.** Wer eine Zahl
     ändert, sieht die Marke sofort umspringen — nicht erst, wenn
     er das Fenster gespeichert und wieder geöffnet hat. Die Regel
     ist dieselbe wie beim Speichern (`override` bleibt leer, wenn
     der Wert dem Import entspricht); stünde hier eine andere,
     verspräche die Marke etwas anderes, als die Datei bekommt.

     Beim Aufbau gibt es die Felder noch nicht — dann zählt der
     gespeicherte Stand. */
  const round2=v=>Math.round(v*100)/100;
  const tag=i=>{
    if(!imported(i)) return '';
    const orig=round2(state.flexActual[i+1][k]||0);
    const cell=box.querySelector(`[data-mi="${i}"]`);
    const cur=cell?round2(parseGermanNumber(cell.value))
                  :(e.override[i]!=null?round2(e.override[i]):orig);
    return cur===orig
      ? '<span class="lock imp">IMPORTED</span>'
      : `<span class="lock corr" data-tip="${esc(t('kdlg.corrTip',eur(orig)))}">CORRECTED</span>`;
  };
  /* Die Marke sitzt in einem eigenen Platzhalter, damit sie sich
     austauschen lässt, ohne die Monatsbeschriftung neu zu bauen. */
  const showTag=i=>{
    const slot=box.querySelector(`[data-tag="${i}"]`);
    if(slot) slot.innerHTML=tag(i);
  };
  const showTags=()=>MONTHS.forEach((_,i)=>showTag(i));
  box.innerHTML=`<div class="box">
    <h3>${lampPos('kak',isNew?'':k)}<button type="button" class="titlebtn" id="kTitle"
      title="${esc(t('kdlg.nameBtnTip'))}"></button></h3>
    <p class="subline">${copy?t('kdlg.dupSub',esc(keyLabel(copy.from)))
      :(isNew?t('kdlg.newSub'):(lockN?t('kdlg.lockedN',lockN):t('kdlg.allOpen'))+' '+t('kdlg.hint'))}</p>
    <div class="field linkfield">${linkHead()}<div id="kLinks">${linkRows(links)}</div></div>
    <div class="field"><label>${t('item.kind')}</label>
      <label style="display:flex;gap:8px;align-items:center;font-family:var(--font-ui);font-size:14px;text-transform:none;letter-spacing:0;color:var(--ink)">
        <input type="checkbox" id="kEst" ${e.estimated?'checked':''} style="width:auto">
        ${t('kdlg.est')}</label></div>
    <div class="quick">
      <!-- Rechts in derselben Zeile der bisherige Schnitt: er steht
           über dem Betragsfeld, in das die Annahme für die
           kommenden Monate getippt wird. -->
      <div class="field qhead"><label>${t('kdlg.quick')}</label>
        <span class="qavg" id="kAvg" data-tip="${esc(t('kdlg.avgTip'))}"></span></div>
      <!-- Erst ab wann, dann wie viel — wie im Posten-Fenster.
           Eine Wiederholung gibt es hier nicht: flexible Kosten
           laufen immer monatlich. -->
      <div class="qrow" style="grid-template-columns:1fr 1fr">
        <select id="kStart" aria-label="${t('g.month')}">${MONTHS_LONG.map((n,i)=>`<option value="${i+1}"${i+1===CUR?' selected':''}>${t('item.fromMonth',n)}</option>`).join('')}</select>
        <input id="kVal" class="num signed" aria-label="${t('g.amount')}" placeholder="${t('g.amount')}">
      </div>
      <div class="qbtns">
        <button class="btn small" id="kClear">${t('item.clear')}</button>
        <button class="btn primary small" id="kApply">${t('item.apply')}</button>
      </div>
    </div>
    <div class="field"><label>${t('kdlg.perMonth')}</label>
      <div style="display:flex;gap:8px;margin:0 0 10px;flex-wrap:wrap">
        ${last?`<button class="btn small" id="kLock" title="${esc(t('kdlg.lockTillTip',MONTHS_LONG[last-1]))}">${t('kdlg.lockTill',MONTHS_LONG[last-1])}</button>`:''}
        <button class="btn small" id="kUnlock" title="${esc(t('kdlg.unlockAllTip'))}">${t('item.unlockAll')}</button></div>
      <div class="mgrid">${MONTHS.map((m,i)=>{const imp=imported(i), on=imp||e.paid[i];
        const val=imp?(e.override[i]!=null?e.override[i]:(state.flexActual[i+1][k]||0)):e.plan[i];
        return `<div class="cell${on?' lockedcell':''}" data-cell="${i}">
        <div class="cellhead"><span class="mlab ${i+1===CUR?'curm':''}">${m} <span class="tagslot" data-tag="${i}">${tag(i)}</span></span>
          <span class="ctools">${lampHtml('kak',isNew?'':k,i+1)}
            <button type="button" class="seal mini" data-pi="${i}" aria-pressed="${on}"
              title="${on?t('kdlg.lockedTip'):t('month.markDone')}">${CHECK_SVG}</button></span></div>
        <input class="num signed" data-mi="${i}" ${on?'disabled':''} value="${val?nf.format(val):''}" placeholder="0,00">
        <div class="cellnote">${esc(e.notes[i]||'')}</div></div>`;}).join('')}</div>
    </div>
    <div class="row-end">${isNew?'':`<button class="linkish" id="kDel" style="margin-right:auto">${t('kdlg.del')}</button>`}
      ${isNew?'':`<button class="btn" id="kDup" data-tip="${esc(t('kdlg.dupTip'))}">${t('item.dup')}</button>`}
      <button class="btn" id="kCancel">${t('g.cancel')}</button><button class="btn primary" id="kSave">${t('g.save')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box);

  /* Die Überschrift zeigt die Bezeichnung und öffnet das Fenster,
     das sie ändert. Steht noch keine da, ist sie eine Aufforderung
     — bei einer neuen Kategorie ist das der erste Schritt. */
  const title=box.querySelector('#kTitle');
  /* Vergeben ist ein Name, den es schon gibt und der nicht der
     eigene ist: sonst zeigten zwei Kategorien auf dieselben Daten.
     Zurück kommt der Name selbst — die Meldung nennt ihn. */
  const taken=v=>(v!==k&&(state.kak[v]||state.kakCats.includes(v)))?v:'';
  bindTitle(title,()=>name,v=>{name=v;},
    {title:t('kdlg.nameTitle'),sub:isNew?t('kdlg.nameSubNew'):t('kdlg.nameSub'),
     ph:t('kdlg.namePh'),pick:t('kdlg.namePick')},taken);

  /* Eine Kategorie, die es noch nicht gibt, steht in keinem
     state.kak — ihr Schlüssel ist der leere Name. Damit die
     Notizlampen trotzdem schon arbeiten, meldet sich der Entwurf
     hier an (siehe js/ui.js). */
  if(isNew) useDraft('kak','',e,()=>name||t('set.addKak'),box);

  bindSign(box);

  bindNotes(box,b=>{
    const cell=b.closest('.cell'); if(!cell) return;
    cell.querySelector('.cellnote').textContent=e.notes[+cell.dataset.cell]||'';
  });

  const setSeal=(cb,on)=>{
    cb.setAttribute('aria-pressed',on);
    cb.title=on?t('kdlg.lockedTip'):t('month.markDone');
    const inp=box.querySelector(`[data-mi="${cb.dataset.pi}"]`);
    inp.disabled=on;
    cb.closest('.cell').classList.toggle('lockedcell',on);
    return inp;
  };
  const seals=()=>[...box.querySelectorAll('[data-pi]')];
  const isOn=cb=>cb.getAttribute('aria-pressed')==='true';
  box.querySelectorAll('[data-pi]').forEach(cb=>cb.onclick=()=>{
    if(cb.disabled) return;
    const on=!isOn(cb), inp=setSeal(cb,on);
    if(!on){inp.focus();inp.select();}
    showAvg();
  });

  /* Alles bis zum laufenden Monat als erfasst markieren — und der
     Weg zurück. Importierte Monate bleiben außen vor: die kommen
     aus Fast Budget und werden nicht von Hand geschlossen oder
     geöffnet. Geschrieben wird erst mit „Speichern". */
  const lock=box.querySelector('#kLock');
  if(lock) lock.onclick=()=>{
    let n=0;
    seals().forEach(cb=>{
      const i=+cb.dataset.pi;
      if(i+1>last||imported(i)||isOn(cb)) return;
      setSeal(cb,true); n++;
    });
    showAvg();
    toast(t('item.lockedNow',n));
  };
  box.querySelector('#kUnlock').onclick=()=>{
    let n=0;
    seals().forEach(cb=>{
      const i=+cb.dataset.pi;
      if(imported(i)||!isOn(cb)) return;
      setSeal(cb,false); n++;
    });
    showAvg();
    toast(t('item.unlockedNow',n));
  };

  const cells=()=>[...box.querySelectorAll('[data-mi]')];

  /* ── Der bisherige Schnitt über der Schnelleingabe ──────────
     Dieselbe Rechnung wie avgActual() in js/calc.js, nur aus den
     Feldern dieses Fensters statt aus der Datei: gezählt werden
     die Monate bis zum laufenden, deren Wert feststeht — abgehakt
     oder importiert, beides trägt das Siegel.

     Aus dem Fenster und nicht aus dem Zustand, weil hier gerade
     getippt wird: wer einen Monat abhakt oder einen Betrag ändert,
     soll sehen, was das mit dem Schnitt macht, bevor er die
     Annahme für die kommenden Monate setzt. Für eine neue
     Kategorie gäbe es im Zustand ohnehin nichts zu lesen.

     Genannt wird der letzte Monat, der mitgezählt hat — nicht der
     laufende: ein Schnitt „bis Juli" ist etwas anderes als einer
     bis August, und welcher es ist, entscheiden die Siegel. */
  const avgEl=box.querySelector('#kAvg');
  const showAvg=()=>{
    const last=elapsedMonths(); let sum=0,n=0,upto=0;
    cells().forEach(c=>{
      const i=+c.dataset.mi;
      if(i+1>last) return;
      const cb=box.querySelector(`[data-pi="${i}"]`);
      if(!cb||!isOn(cb)) return;
      sum+=parseGermanNumber(c.value); n++; upto=Math.max(upto,i+1);
    });
    avgEl.textContent=n?t('kdlg.avgTill',MONTHS_LONG[upto-1],eur(sum/n)):t('kdlg.avgNone');
    avgEl.classList.toggle('none',!n);
  };
  showAvg();
  /* Jede Zahl in einem Monatsfeld zählt sofort mit. Die Siegel und
     die Sammelknöpfe rufen showAvg() selbst — was ein Knopf ins
     Feld schreibt, löst kein input aus (dieselbe Regel wie bei der
     Vorzeichenfarbe, siehe CLAUDE.md). */
  box.addEventListener('input',ev=>{
    if(ev.target.dataset.mi===undefined) return;
    showAvg(); showTag(+ev.target.dataset.mi);
  });

  box.querySelector('#kApply').onclick=()=>{
    const v=parseGermanNumber(box.querySelector('#kVal').value);
    const start=+box.querySelector('#kStart').value; let n=0;
    cells().forEach(c=>{const i=+c.dataset.mi; if(c.disabled||(i+1)<start) return; c.value=v?nf.format(v):''; n++;});
    signValues(box); showAvg(); showTags();
    toast(t('item.setN',n)+'.');
  };
  box.querySelector('#kClear').onclick=()=>{
    cells().forEach(c=>{if(!c.disabled)c.value='';}); signValues(box); showAvg(); showTags();
  };
  box.querySelector('#kCancel').onclick=()=>closeModal(box);
  box.onclick=ev=>{if(ev.target===box)closeModal(box);};
  const drawLinks=()=>{
    box.querySelector('#kLinks').innerHTML=linkRows(links);
    bindLinks(box.querySelector('.linkfield'),links,drawLinks);
  };
  bindLinks(box.querySelector('.linkfield'),links,drawLinks);

  /* Löschen nimmt alles mit, was an der Kategorie hängt — Plan-
     und Ist-Werte, Korrekturen, Notizen und die importierten
     Buchungen (dropKakCat in js/categories.js). Deshalb erst die
     Rückfrage; wer sie abbricht, ändert nichts. */
  const del=box.querySelector('#kDel');
  if(del) del.onclick=()=>{
    const n=kakTxCount(k);
    if(!confirm(t('kdlg.delAsk',keyLabel(k))+(n?' '+t('kdlg.delAskTx',n):''))) return;
    state.kakCats=state.kakCats.filter(x=>x!==k);
    dropKakCat(k);
    save(); box.remove(); render(); toast(t('kdlg.deleted',keyLabel(k)));
  };

  /* ── Duplizieren ────────────────────────────────────────────
     Dieselbe Kategorie noch einmal: Link, Betragsart und die
     zwölf Werte so, wie sie gerade im Fenster stehen — ohne
     Haken und ohne Notizen, weder zur Kategorie noch zu einem
     Monat. Was im Original aus dem Import kommt, wird in der
     Kopie ein gewöhnlicher Planwert: die Kopie hat keine
     Buchungen, also auch nichts zu korrigieren. Deshalb sind
     alle zwölf Felder änderbar.

     Der Name muss neu sein — er ist der Schlüssel. Angelegt wird
     erst mit „Speichern". */
  const dup=box.querySelector('#kDup');
  if(dup) dup.onclick=()=>{
    const c=blankKak(0);
    c.estimated=box.querySelector('#kEst').checked;
    c.links=links.map(x=>({name:x.name,url:x.url}));
    cells().forEach(cc=>{ c.plan[+cc.dataset.mi]=parseGermanNumber(cc.value); });
    const nm=(name||k)+' '+t('item.copy');
    box.remove();
    editKak(null,{entry:c,name:nm,from:k});
  };

  box.querySelector('#kSave').onclick=()=>{
    /* Ohne Bezeichnung wird nicht gespeichert — sie ist der
       Schlüssel. Statt einer Meldung öffnet sich das Fenster, in
       dem sie einzutragen ist: dorthin müsste man ohnehin. */
    if(!name){ title.click(); return; }
    /* Umbenennen und Anlegen laufen beide über den Namen als
       Schlüssel — ein schon vergebener Name würde zwei Kategorien
       auf dieselben Daten zeigen lassen. Geprüft wird hier noch
       einmal: zwischen dem Eintippen und dem Speichern kann in
       einem anderen Fenster eine Kategorie dazugekommen sein. */
    if(taken(name)){ toast(t('set.taken',name)); return; }

    e.estimated=box.querySelector('#kEst').checked;
    e.links=links.map(x=>({name:x.name,url:x.url}));
    cells().forEach(c=>{
      const i=+c.dataset.mi, v=parseGermanNumber(c.value);
      if(imported(i)){
        /* Nur abweichende Werte werden als Korrektur gemerkt. */
        const orig=Math.round((state.flexActual[i+1][k]||0)*100)/100;
        e.override[i]=(Math.round(v*100)/100===orig)?null:v;
      } else e.plan[i]=v;
    });
    box.querySelectorAll('[data-pi]').forEach(cb=>{ e.paid[+cb.dataset.pi]=cb.getAttribute('aria-pressed')==='true'; });

    if(isNew){
      state.kakCats.push(name);
      state.kak[name]=e;
      ensureKakCat(name);
    } else if(name!==k){
      renameKakCat(k,name);            /* zieht Werte und Buchungen mit */
      state.kakCats=state.kakCats.map(x=>x===k?name:x);   /* die Liste führt es nicht selbst nach */
    }
    save(); box.remove(); render();
  };
  /* Ohne Bezeichnung steht der erste Schritt im Kopf — dorthin der
     Fokus. Sonst ins Feld der Schnelleingabe: dort wird gearbeitet. */
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
    else (name?box.querySelector('#kVal'):title).focus();
  }
  else (name?box.querySelector('#kVal'):title).focus();
}

/* Alte Fundstelle: data-newkak öffnet dasselbe Fenster, nur leer. */
const newKakCat=()=>editKak(null);
