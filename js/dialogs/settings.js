/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Einstellungen"
   Alles, was die Anwendung selbst betrifft und in der JSON-Datei
   steht: Sprache, Abrechnungsjahr, Spaltenbreiten der Jahres-
   matrix, die Grenze für die größten Einzelposten und die vier
   Listen — Banken, Zahlungsarten, regelmäßige Kategorien,
   Kakeibo-Kategorien.

   Wichtig: Das Fenster baut sich bei Hinzufügen, Entfernen und
   Sortieren komplett neu auf. Jeder dieser Wege läuft über
   applyEdits(), das getippte Umbenennungen sofort übernimmt —
   sonst ginge der alte Name verloren und die abhängigen Daten
   hingen in der Luft. Das Umbenennen selbst erledigt
   js/categories.js.
   ══════════════════════════════════════════════════════════════ */

/* Überschrift einer Liste. Das Pluszeichen steht direkt hinter
   der Beschriftung, nicht unter der Liste — so bleibt es auch bei
   langen Listen in Sichtweite. */
function listHead(label,key,addTip){
  return `<label>${label}<button class="plusmini" data-add="${key}"
    title="${esc(addTip)}" aria-label="${esc(addTip)}">+</button></label>`;
}

function openSettings(){
  const box=document.createElement('div');
  box.className='modal';

  /* Banken und Zahlungsarten: Kürzel + Bezeichnung. */
  const pairRows=(arr,key)=>arr.map((x,i)=>`<div class="listrow" draggable="true" data-list="${key}" data-idx="${i}">
      <span class="grip" title="${t('set.dragTip')}">⋮⋮</span>
      <input data-k="${key}" data-i="${i}" data-f="code" value="${esc(x.code)}" placeholder="${t('set.code')}">
      <input data-k="${key}" data-i="${i}" data-f="label" value="${esc(x.label)}" placeholder="${t('set.label')}">
      <button class="linkish" data-rm="${key}" data-ri="${i}" title="${t('g.remove')}">&#10005;</button></div>`).join('');

  /* Kategorien: nur ein Name. */
  const nameRows=(arr,key,hintOf)=>arr.map((name,i)=>{
    const hint=hintOf(name);
    return `<div class="listrow onecol" draggable="true" data-list="${key}" data-idx="${i}">
      <span class="grip" title="${t('set.dragTip')}">⋮⋮</span>
      <input data-k="${key}" data-i="${i}" data-f="name" value="${esc(name)}" placeholder="${t('item.name')}">
      <button class="linkish" data-rm="${key}" data-ri="${i}" title="${hint||t('g.remove')}">&#10005;</button></div>`;
  }).join('');

  const groupRows=nameRows(state.groups,'groups',g=>{
    const n=groupUseCount(g);
    return n?t('set.inUse',n):'';
  });
  const kakRows=nameRows(state.kakCats,'kakCats',k=>{
    const e=state.kak[k];
    const n=e?e.plan.filter(v=>v!==0).length:0;
    return n?t('set.monthsWith',n):'';
  });

  box.innerHTML=`<div class="box">
    <h3>${t('set.title')}</h3>
    <p class="subline">${t('set.sub')}</p>

    <div class="field"><label>${t('set.general')}</label></div>
    <div class="cols c4">
      <div class="field"><label for="sLang">${t('set.lang')}</label>
        <select id="sLang">${LANGS.map(([k,l])=>`<option value="${k}"${LANG()===k?' selected':''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="sYear">${t('set.year')}</label>
        <input type="number" id="sYear" class="num" min="2000" max="2099" step="1" value="${YEAR}"></div>
      <div class="field"><label for="sLabW">${t('set.labw')} (px)</label>
        <input type="number" id="sLabW" class="num" min="50" max="800" step="10" value="${state.labWidth}"></div>
      <div class="field"><label for="sMonW">${t('set.monw')} (px)</label>
        <input type="number" id="sMonW" class="num" min="50" max="400" step="10" value="${state.monWidth}"></div>
      <div class="field"><label for="sTopMin">${t('set.topmin')}</label>
        <input type="number" id="sTopMin" class="num" min="0" max="100000" step="5" value="${state.topMin}"></div>
    </div>
    <p class="note" style="margin:-4px 0 18px">${t('set.yearHint')} ${t('set.widthHint')} ${t('set.topminHint')}</p>

    <div class="field"><label>${t('set.lists')}</label></div>
    <p class="note" style="margin:-4px 0 12px">${t('set.listsSub')}</p>
    <div class="cols c3 liststack">
      <div>
        <div class="field">${listHead(t('set.banks'),'banks',t('set.addBank'))}<div>${pairRows(state.banks,'banks')}</div></div>
        <div class="field">${listHead(t('set.pays'),'pays',t('set.addPay'))}<div>${pairRows(state.pays,'pays')}</div></div>
      </div>
      <div><div class="field">${listHead(t('set.groups'),'groups',t('set.addGroup'))}<div>${groupRows}</div></div></div>
      <div><div class="field">${listHead(t('set.kak'),'kakCats',t('set.addKak'))}<div>${kakRows}</div></div></div>
    </div>
    <div class="row-end"><button class="btn" id="lCancel">${t('g.cancel')}</button><button class="btn primary" id="lSave">${t('g.save')}</button></div>
  </div>`;
  document.body.appendChild(box);

  /* Liest den aktuellen Stand aller vier Listen aus dem Fenster. */
  const collect=()=>{
    const d={banks:[],pays:[],groups:[],kakCats:[]};
    ['banks','pays'].forEach(k=>{
      const idx=[...new Set([...box.querySelectorAll(`[data-k="${k}"]`)].map(i=>+i.dataset.i))].sort((a,b)=>a-b);
      idx.forEach(i=>{
        const code=box.querySelector(`[data-k="${k}"][data-i="${i}"][data-f="code"]`).value.trim();
        const label=box.querySelector(`[data-k="${k}"][data-i="${i}"][data-f="label"]`).value.trim();
        d[k].push({code,label:label||code});
      });
    });
    ['groups','kakCats'].forEach(k=>{
      [...box.querySelectorAll(`[data-k="${k}"]`)].forEach(inp=>d[k].push(inp.value.trim()));
    });
    return d;
  };

  /* Die Felder im Block „Allgemein". Sie gelten sofort für den
     Zustand, damit ein Neuaufbau des Fensters sie nicht verliert. */
  const num=(id,min,max)=>{
    const v=parseInt(box.querySelector(id).value,10);
    return isNaN(v)?null:Math.min(max,Math.max(min,v));
  };                                   /* 0 ist gültig: dann zählt jede Buchung */
  const applyGeneral=()=>{
    state.lang=box.querySelector('#sLang').value==='de'?'de':'en';
    const y=num('#sYear',2000,2099); if(y) state.year=y;
    const lw=num('#sLabW',50,800); if(lw) state.labWidth=lw;
    const mw=num('#sMonW',50,400); if(mw) state.monWidth=mw;
    const tm=num('#sTopMin',0,100000); if(tm!=null) state.topMin=tm;
  };

  /* Vergleicht Zeile für Zeile mit dem Stand vor dem Tippen und
     benennt um. Ein bereits vergebener Name wird zurückgesetzt. */
  const applyRenames=(key,names)=>{
    const before=state[key].slice(), taken=[];
    names.forEach((name,i)=>{
      const old=before[i];
      if(!name||!old||name===old) return;
      const collision = key==='kakCats' ? !!state.kak[name]
                                        : names.some((n,j)=>j!==i&&n===name);
      if(collision){ names[i]=old; taken.push(name); return; }
      if(key==='kakCats') renameKakCat(old,name); else renameGroup(old,name);
    });
    return taken;
  };

  /* Schreibt den Fensterstand zurück. Läuft vor jedem Neuaufbau
     und beim Speichern. */
  const applyEdits=()=>{
    applyGeneral();
    const d=collect();
    const taken=[...applyRenames('groups',d.groups),...applyRenames('kakCats',d.kakCats)];
    state.banks=d.banks; state.pays=d.pays;
    state.groups=d.groups; state.kakCats=d.kakCats;
    state.kakCats.forEach(ensureKakCat);
    if(taken.length) toast(t('set.taken',taken.join(', ')));
  };

  /* Beim Abbrechen bleiben keine leeren Platzhalterzeilen zurück. */
  const closeSettings=()=>{
    state.banks=state.banks.filter(x=>x.code);
    state.pays=state.pays.filter(x=>x.code);
    state.groups=state.groups.filter(Boolean);
    state.kakCats=state.kakCats.filter(Boolean);
    closeModal(box);
  };

  box._close=closeSettings;          /* auch für Escape (js/ui.js) */

  const reopen=()=>{ box.remove(); openSettings(); };

  /* Die Sprache wirkt sofort — das Fenster selbst wechselt mit. */
  box.querySelector('#sLang').onchange=()=>{ applyEdits(); save(); reopen(); renderChrome(); };

  /* ── Sortieren per Ziehen ───────────────────────────────── */
  let dragFrom=null,dragList=null;
  box.querySelectorAll('.listrow').forEach(row=>{
    row.addEventListener('dragstart',ev=>{
      dragFrom=+row.dataset.idx; dragList=row.dataset.list;
      row.classList.add('dragging'); ev.dataTransfer.effectAllowed='move';
      try{ev.dataTransfer.setData('text/plain',String(dragFrom));}catch(e){}
    });
    row.addEventListener('dragend',()=>{row.classList.remove('dragging');
      box.querySelectorAll('.listrow').forEach(r=>r.classList.remove('over'));});
    row.addEventListener('dragover',ev=>{
      if(row.dataset.list!==dragList) return;
      ev.preventDefault(); ev.dataTransfer.dropEffect='move'; row.classList.add('over');
    });
    row.addEventListener('dragleave',()=>row.classList.remove('over'));
    row.addEventListener('drop',ev=>{
      ev.preventDefault();
      if(row.dataset.list!==dragList) return;
      const to=+row.dataset.idx;
      if(dragFrom===null||to===dragFrom) return;
      applyEdits();
      const arr=state[dragList];
      arr.splice(to,0,arr.splice(dragFrom,1)[0]);
      reopen();
    });
  });

  /* ── Hinzufügen ─────────────────────────────────────────── */
  box.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{
    applyEdits();
    const k=b.dataset.add;
    if(k==='groups'||k==='kakCats') state[k].push('');
    else state[k].push({code:'',label:''});
    reopen();
  });

  /* ── Entfernen ──────────────────────────────────────────── */
  box.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.rm, i=+b.dataset.ri;

    if(k==='groups'){
      const old=state.groups[i], used=groupUseCount(old);
      if(used){
        const rest=state.groups.filter((_,j)=>j!==i);
        if(!rest.length){ toast(t('set.keepOne')); return; }
        if(!confirm(t('set.moveAsk',old,used,rest[0]))) return;
      }
    }
    if(k==='kakCats'){
      const name=state.kakCats[i], n=name?kakTxCount(name):0;
      if(name&&kakHasData(name)&&!confirm(t('set.dropKakAsk',name,n?t('set.dropKakTx',n):''))) return;
    }

    applyEdits();
    if(k==='groups'){
      const name=state.groups[i];
      state.groups.splice(i,1);
      dropGroup(name,state.groups[0]);
    } else if(k==='kakCats'){
      const name=state.kakCats[i];
      state.kakCats.splice(i,1);
      dropKakCat(name);
    } else state[k].splice(i,1);
    reopen();
  });

  /* ── Abbrechen und Speichern ────────────────────────────── */
  box.querySelector('#lCancel').onclick=closeSettings;
  box.onclick=e=>{if(e.target===box)closeSettings();};

  box.querySelector('#lSave').onclick=()=>{
    applyEdits();                     /* enthält die Umbenennungen */
    state.banks=state.banks.filter(x=>x.code);
    state.pays=state.pays.filter(x=>x.code);
    state.groups=[...new Set(state.groups.filter(Boolean))];
    state.kakCats=[...new Set(state.kakCats.filter(Boolean))];
    state.kakCats.forEach(ensureKakCat);
    save(); box.remove(); render(); toast(t('set.saved'));
  };
}

/* Alte Fundstellen (data-lists, Link im Posten-Fenster) zeigen
   weiterhin hierher. */
const editLists=openSettings;
