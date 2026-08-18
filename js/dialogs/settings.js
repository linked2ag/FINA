/* ══════════════════════════════════════════════════════════════
   FINA — Fenster „Einstellungen"
   Alles, was die Anwendung selbst betrifft und in der JSON-Datei
   steht: Sprache, Abrechnungsjahr, Spaltenbreiten der Jahres-
   matrix, die Grenze für die größten Einzelposten und die vier
   Listen — Banken, Zahlungsarten, regelmäßige Kategorien,
   Kakeibo-Kategorien.

   Das ist zu viel für eine Seite, deshalb steht links ein Menü
   und rechts der gewählte Bereich. Gebaut werden immer ALLE
   Bereiche; umgeschaltet wird nur die Sichtbarkeit. Das ist keine
   Bequemlichkeit, sondern Absicht: collect() liest die Felder
   aller Bereiche ein, und getippte Änderungen überleben so den
   Wechsel des Bereichs.

   Wichtig: Das Fenster baut sich bei Hinzufügen, Entfernen und
   Sortieren komplett neu auf. Jeder dieser Wege läuft über
   applyEdits(), das getippte Umbenennungen sofort übernimmt —
   sonst ginge der alte Name verloren und die abhängigen Daten
   hingen in der Luft. Das Umbenennen selbst erledigt
   js/categories.js.
   ══════════════════════════════════════════════════════════════ */

/* Der gewählte Bereich überlebt den Neuaufbau des Fensters —
   sonst landete man nach jedem „+" wieder ganz vorn. Er gehört
   nicht in den Zustand: er wird nicht gespeichert. */
let setPane='general';

/* ── Die Bereiche ─────────────────────────────────────────────
   Die Liste ist zweierlei: die Reihenfolge des Menüs links **und**
   die Namen, die `openSettings()` von außen annimmt. Ein neuer
   Bereich braucht deshalb einen Eintrag hier, einen `pane(…)`-Aufruf
   unten und die Texte in js/i18n.js. */
const SET_PANE_LABEL={general:'set.navGeneral',view:'set.navView',
  banks:'set.navBanks',groups:'set.groups',kak:'set.kak',import:'set.navImport'};

/* ── Wohin das Fenster aufgeht ────────────────────────────────
   `openSettings(wohin)` nimmt entweder den Namen eines **Bereichs**
   (`'banks'`, `'groups'`, `'kak'` — so kommen die Wege aus dem
   Posten- und dem Kategorie-Fenster hier an) oder die Kennung eines
   **Feldes** (`'sOpen'` — so kommt der Doppelklick auf den
   Anfangsbestand aus der Prognose). Bei einem Feld muss das Fenster
   den Bereich zeigen, in dem es liegt; sonst führte der Weg auf ein
   verborgenes Feld, und der Nutzer stünde vor der Sprachwahl.

   Diese Zuordnung ist die einzige Stelle, an der steht, welches Feld
   in welchem Bereich wohnt. Wer ein weiteres Feld von außen
   ansteuerbar macht, trägt es hier ein. */
const SET_FIELD_PANE={sOpen:'general'};

/* Überschrift einer Liste. Das Pluszeichen steht direkt hinter
   der Beschriftung, nicht unter der Liste — so bleibt es auch bei
   langen Listen in Sichtweite. */
function listHead(label,key,addTip){
  return `<label>${label}<button class="plusmini" data-add="${key}"
    title="${esc(addTip)}" aria-label="${esc(addTip)}">+</button></label>`;
}

/* ── Ein Fenster über einem Fenster ───────────────────────────
   `done` ist der Rückweg: eine Funktion, die läuft, wenn dieses
   Fenster wieder weg ist — gespeichert wie abgebrochen. Damit kann
   das Posten- und das Kategorie-Fenster die Einstellungen **über
   sich** öffnen, ohne selbst zu schließen: was dort getippt ist,
   bleibt stehen, und danach holt es sich die neuen Listen ab.

   Gestapelt wird über die Reihenfolge im Dokument — das jüngste
   .modal liegt oben und bekommt auch Escape (js/ui.js). Zu tun ist
   dafür nichts.

   `reopen()` reicht beides weiter: „+", Entfernen und Sortieren
   bauen das Fenster neu auf, und ein Rückweg, der dabei verloren
   ginge, wäre der Rückweg für den häufigsten Fall überhaupt — man
   kommt ja her, um etwas anzulegen. */
function openSettings(where,done){
  /* Der Bereich wird gestellt, bevor gebaut wird: `pane()` fragt
     `setPane`, um zu entscheiden, welcher Abschnitt sichtbar ist.
     Die Wahl bleibt danach stehen, wie jede andere — wer über den
     Anfangsbestand hereinkommt und das Fenster gleich wieder
     öffnet, findet „Allgemein" vor. */
  const focus=SET_FIELD_PANE[where]?where:'';
  const goPane=focus?SET_FIELD_PANE[focus]:(SET_PANE_LABEL[where]?where:'');
  if(goPane) setPane=goPane;

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

  const useHint=g=>{ const n=groupUseCount(g); return n?t('set.inUse',n):''; };
  const groupRows=nameRows(state.groups,'groups',useHint);
  const incGroupRows=nameRows(state.incomeGroups,'incomeGroups',useHint);
  const kakRows=nameRows(state.kakCats,'kakCats',k=>{
    const e=state.kak[k];
    const n=e?e.plan.filter(v=>v!==0).length:0;
    return n?t('set.monthsWith',n):'';
  });

  /* Ein Bereich: Überschrift, ein Satz dazu, Inhalt. Alle werden
     gebaut, sichtbar ist einer. */
  const pane=(key,title,hint,inner)=>`<section class="setpane" data-pane="${key}"${key===setPane?'':' hidden'}>
    <h4>${title}</h4>${hint?`<p class="note" style="margin:-2px 0 14px">${hint}</p>`:''}${inner}</section>`;

  const NAV=Object.keys(SET_PANE_LABEL).map(k=>[k,t(SET_PANE_LABEL[k])]);

  box.innerHTML=`<div class="box">
    <h3>${t('set.title')}</h3>
    <p class="subline">${t('set.sub')}</p>

    <div class="setlayout">
      <nav class="setnav" aria-label="${t('set.navLabel')}">${NAV.map(([k,l])=>
        `<button type="button" data-sect="${k}" aria-pressed="${k===setPane}">${l}</button>`).join('')}</nav>

      <div class="setpanes">
        ${pane('general',t('set.navGeneral'),t('set.generalSub'),`
          <!-- Der Anfangsbestand steht neben dem Jahr, weil er zu
               ihm gehört: er sagt, womit dieses eine Jahr anfängt.
               Ein Textfeld wie jeder Betrag (parseGermanNumber,
               Vorzeichenfarbe über .signed) — kein Zahlenfeld: ein
               Kontostand wird mit Tausenderpunkt und Komma
               getippt. -->
          <div class="cols c3">
            <div class="field"><label for="sLang">${t('set.lang')}</label>
              <select id="sLang">${LANGS.map(([k,l])=>`<option value="${k}"${LANG()===k?' selected':''}>${l}</option>`).join('')}</select></div>
            <div class="field"><label for="sYear">${t('set.year')}</label>
              <input type="number" id="sYear" class="num" min="2000" max="2099" step="1" value="${YEAR}"></div>
            <div class="field"><label for="sOpen">${t('set.opening')}</label>
              <input id="sOpen" class="num signed" placeholder="0,00" value="${opening()?nf.format(opening()):''}"></div>
          </div>
          <p class="note">${t('set.openingHint')} ${t('set.yearHint')}</p>
          <!-- Die einzige Netzverbindung, die FINA je aufbaut, und
               deshalb steht sie offen da — mit ihrer Adresse. Sie
               wirkt nur in der Mac- und der Windows-App: im Browser
               ist die Seite immer die neueste. Genau darum steht
               unter dem Haken, für wen er gilt. -->
          <div class="checklist wherelist"><label class="checkrow">
            <input type="checkbox" id="sUpd" ${state.updateCheck===false?'':'checked'}>
            <span class="clab">${t('set.upd')}</span><span class="chint">${t('set.updHint')}</span></label></div>`)}

        ${pane('view',t('set.navView'),t('set.viewSub'),`
          <div class="cols c3">
            <div class="field"><label for="sLabW">${t('set.labw')} (px)</label>
              <input type="number" id="sLabW" class="num" min="50" max="800" step="10" value="${state.labWidth}"></div>
            <div class="field"><label for="sMonW">${t('set.monw')} (px)</label>
              <input type="number" id="sMonW" class="num" min="50" max="400" step="10" value="${state.monWidth}"></div>
            <div class="field"><label for="sTopMin">${t('set.topmin')}</label>
              <input type="number" id="sTopMin" class="num" min="0" max="100000" step="5" value="${state.topMin}"></div>
          </div>
          <p class="note">${t('set.widthHint')} ${t('set.topminHint')}</p>`)}

        ${pane('banks',t('set.navBanks'),t('set.banksSub'),`
          <div class="cols c2 liststack">
            <div class="field">${listHead(t('set.banks'),'banks',t('set.addBank'))}<div>${pairRows(state.banks,'banks')}</div></div>
            <div class="field">${listHead(t('set.pays'),'pays',t('set.addPay'))}<div>${pairRows(state.pays,'pays')}</div></div>
          </div>`)}

        ${pane('groups',t('set.groups'),t('set.groupsSub'),`
          <!-- Zwei Listen nebeneinander: Einnahmen links, Ausgaben
               rechts. Beide beschreiben regelmäßige Posten, aber
               ein Posten gehört immer in genau eine der beiden
               Welten — nebeneinander sieht man das, untereinander
               läse sich die zweite Liste wie eine Fortsetzung der
               ersten. Die Farbe der Überschrift ist dieselbe wie
               die der Geldart in allen Ansichten. -->
          <div class="cols c2 grouplists">
            <div class="field gl-in">${listHead(t('set.groupsIn'),'incomeGroups',t('set.addGroupIn'))}<div>${incGroupRows}</div></div>
            <div class="field gl-out">${listHead(t('set.groupsOut'),'groups',t('set.addGroup'))}<div>${groupRows}</div></div>
          </div>`)}

        ${pane('kak',t('set.kak'),t('set.kakSub'),`
          <div class="field">${listHead(t('set.kak'),'kakCats',t('set.addKak'))}<div>${kakRows}</div></div>`)}

        <!-- Beide Wege holen Zahlen von außen herein und ändern die
             Datei; deshalb stehen sie beieinander. Je ein Knopf und
             ein Satz darunter, der sagt, was er anrichtet — der
             eine ergänzt einzelne Monate, der andere ersetzt das
             ganze Buch. Das Fenster schließt sich vorher: der
             Import legt selbst Kategorien an, und eine Liste, die
             noch im Fenster steht, überschriebe sie beim
             Speichern. -->
        ${pane('import',t('set.navImport'),t('set.importSub'),`
          <div class="field impway">
            <button class="btn" id="impFast">${t('app.import')}</button>
            <p class="note">${t('set.impFastHint')}</p></div>
          <div class="field impway">
            <button class="btn" id="impSheet">${t('shInfo.title')}</button>
            <p class="note">${t('set.impSheetHint')}</p></div>`)}
      </div>
    </div>

    <div class="row-end"><button class="btn" id="lCancel">${t('g.cancel')}</button><button class="btn primary" id="lSave">${t('g.save')}</button></div>
  </div>`;
  document.body.appendChild(box); tabThroughFields(box); bindSign(box);

  /* Kommt das Fenster wegen eines bestimmten Feldes, steht die
     Schreibmarke darin und der Wert markiert da: tippen ersetzt ihn,
     wer ihn behalten will, drückt eine Pfeiltaste — dieselbe Regel
     wie beim Hineinklicken (siehe „Ein Feld anklicken heißt:
     überschreiben" in js/app.js) und wie beim hervorgehobenen Monat
     im Posten-Fenster. Sonst bekommt nichts den Fokus: wer die
     Einstellungen von sich aus öffnet, sucht sich selbst, was er
     ändern will. */
  const want=focus?box.querySelector('#'+focus):null;
  if(want){ want.focus(); want.select(); }

  /* Der Rückweg läuft auf jedem Weg hinaus — Speichern, Abbrechen,
     Klick daneben, Escape —, aber **nur einmal**: `reopen()` baut das
     Fenster neu auf und nimmt ihn mit, das alte darf ihn dann nicht
     schon ausgelöst haben. */
  let handed=false;
  const handBack=()=>{ if(handed||!done) return; handed=true; done(); };

  /* Bereich wechseln — nur Sichtbarkeit, nichts wird neu gebaut.
     Getipptes bleibt dadurch stehen, auch in den Bereichen, die
     gerade nicht zu sehen sind. */
  box.querySelectorAll('[data-sect]').forEach(b=>b.onclick=()=>{
    setPane=b.dataset.sect;
    box.querySelectorAll('[data-sect]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.sect===setPane));
    box.querySelectorAll('.setpane').forEach(p=>{ p.hidden=p.dataset.pane!==setPane; });
  });

  /* Liest den aktuellen Stand aller vier Listen aus dem Fenster. */
  const collect=()=>{
    const d={banks:[],pays:[],groups:[],incomeGroups:[],kakCats:[]};
    ['banks','pays'].forEach(k=>{
      const idx=[...new Set([...box.querySelectorAll(`[data-k="${k}"]`)].map(i=>+i.dataset.i))].sort((a,b)=>a-b);
      idx.forEach(i=>{
        const code=box.querySelector(`[data-k="${k}"][data-i="${i}"][data-f="code"]`).value.trim();
        const label=box.querySelector(`[data-k="${k}"][data-i="${i}"][data-f="label"]`).value.trim();
        d[k].push({code,label:label||code});
      });
    });
    ['groups','incomeGroups','kakCats'].forEach(k=>{
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
    /* Eine gewöhnliche Zuweisung, **nicht** chooseLang(): das hier
       ist die Sprache dieser Datei und geht die Webseite nichts an
       (siehe „Die Sprachwahl gilt überall" in CLAUDE.md). Wer ein
       Buch auf Deutsch führt, hat damit nicht gesagt, dass er die
       Verkaufsseiten auf Deutsch lesen will. */
    state.lang=box.querySelector('#sLang').value==='de'?'de':'en';
    const y=num('#sYear',2000,2099); if(y) state.year=y;
    /* Der Anfangsbestand darf jede Zahl sein — auch eine negative
       und auch die Null. Ein leeres Feld heißt „kein Anfangs-
       bestand", also null; deshalb kein `if`. */
    state.opening=parseGermanNumber(box.querySelector('#sOpen').value);
    const lw=num('#sLabW',50,800); if(lw) state.labWidth=lw;
    const mw=num('#sMonW',50,400); if(mw) state.monWidth=mw;
    const tm=num('#sTopMin',0,100000); if(tm!=null) state.topMin=tm;
    state.updateCheck=box.querySelector('#sUpd').checked;
  };

  /* ── Geänderte Kürzel ─────────────────────────────────────────
     Banken und Zahlungsarten hängen über ihr Kürzel an den Posten
     (`it.bank`, `it.pay`). Wird ein Kürzel geändert, passen die
     Posten zu keinem Listeneintrag mehr.

     Anders als bei den Kategorien (Regel 2) wandern sie hier
     nicht selbständig mit: das Kürzel steht auch so in der
     Jahresübersicht, und ein alter Wert kann gewollt sein. Der
     Nutzer entscheidet — gefragt wird einmal für alle Änderungen
     zusammen, mit Zahl und Folge. */
  const codeField=key=>key==='banks'?'bank':'pay';
  const codedItems=()=>state.fixed.concat(state.balance?[state.balance]:[]);
  const codeUse=(field,code)=>code?codedItems().filter(it=>it[field]===code).length:0;

  /* Vergleicht Zeile für Zeile mit dem Stand VOR der Zuweisung.
     Muss also laufen, bevor state.banks/state.pays überschrieben
     werden. */
  const scanCodes=(key,arr)=>{
    const field=codeField(key), before=state[key], moves=[];
    arr.forEach((x,i)=>{
      const old=before[i]&&before[i].code;
      if(!old||!x.code||x.code===old) return;
      const n=codeUse(field,old);
      if(n) moves.push({old,neu:x.code,n});
    });
    return {field,moves};
  };

  const askCarryCodes=changes=>{
    const hit=changes.filter(c=>c.moves.length);
    if(!hit.length) return;
    const list=hit.flatMap(c=>c.moves.map(m=>`${m.old} → ${m.neu} (${m.n})`)).join(', ');
    const total=hit.reduce((s,c)=>s+c.moves.reduce((a,m)=>a+m.n,0),0);
    if(!confirm(t('set.codeAsk',list,total))){ toast(t('set.codeKept',total)); return; }
    /* Ein Durchgang je Posten, über eine Zuordnung — sonst würde
       ein Tausch zweier Kürzel (A→B, B→A) sich selbst überholen. */
    hit.forEach(c=>{
      const map=new Map(c.moves.map(m=>[m.old,m.neu]));
      codedItems().forEach(it=>{ if(map.has(it[c.field])) it[c.field]=map.get(it[c.field]); });
    });
    toast(t('set.codeDone',total));
  };

  /* Vergleicht Zeile für Zeile mit dem Stand vor dem Tippen und
     benennt um. Ein bereits vergebener Name wird zurückgesetzt. */
  const applyRenames=(key,names)=>{
    const before=state[key].slice(), taken=[];
    names.forEach((name,i)=>{
      const old=before[i];
      if(!name||!old||name===old) return;
      /* Ein Name darf **in beiden Listen zusammen** nur einmal
         vorkommen: isIncome() entscheidet allein am Namen, ob ein
         Posten eine Einnahme ist — derselbe Name auf beiden Seiten
         machte das unentscheidbar. Deshalb wird bei den
         Kategorielisten auch gegen die jeweils andere geprüft. */
      const other = key==='groups' ? state.incomeGroups
                  : key==='incomeGroups' ? state.groups : null;
      const collision = key==='kakCats' ? !!state.kak[name]
        : (names.some((n,j)=>j!==i&&n===name)||(other||[]).includes(name));
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
    const taken=[...applyRenames('groups',d.groups),...applyRenames('incomeGroups',d.incomeGroups),
                 ...applyRenames('kakCats',d.kakCats)];
    /* Erst schauen, was sich am Kürzel geändert hat — danach
       überschreiben und fragen. */
    const codeChanges=[scanCodes('banks',d.banks),scanCodes('pays',d.pays)];
    state.banks=d.banks; state.pays=d.pays;
    askCarryCodes(codeChanges);
    state.groups=d.groups; state.incomeGroups=d.incomeGroups; state.kakCats=d.kakCats;
    state.kakCats.forEach(ensureKakCat);
    if(taken.length) toast(t('set.taken',taken.join(', ')));
  };

  /* Eine mit „+" angelegte, aber nie ausgefüllte Zeile ist keine
     Angabe: sie verschwindet, sobald das Fenster geht — auf
     welchem Weg auch immer. */
  const tidy=()=>{
    state.banks=state.banks.filter(x=>x.code);
    state.pays=state.pays.filter(x=>x.code);
    state.groups=state.groups.filter(Boolean);
    state.incomeGroups=state.incomeGroups.filter(Boolean);
    state.kakCats=state.kakCats.filter(Boolean);
  };
  const closeSettings=()=>{ tidy(); closeModal(box); handBack(); };

  box._close=closeSettings;          /* auch für Escape (js/ui.js) */

  /* Neu aufbauen heißt: dasselbe Fenster noch einmal, mit demselben
     Ziel und demselben Rückweg. Ohne beides landete man nach jedem
     „+" wieder ganz vorn — und das Fenster darunter erführe nie,
     dass es neue Einträge gibt. */
  const reopen=()=>{ box.remove(); openSettings(where,done); };

  /* Die Sprache wirkt sofort — das Fenster selbst wechselt mit. */
  box.querySelector('#sLang').onchange=()=>{ applyEdits(); save(); reopen(); renderChrome(); };

  /* ── Der Bereich „Import" ─────────────────────────────────
     Beide Wege legen selbst Kategorien an — der eine neue
     Hauptkategorien, der andere gleich alle. Bliebe das
     Einstellungsfenster daneben stehen, schriebe sein
     „Speichern" die Listen zurück, die vor dem Import im
     Fenster standen, und der Import wäre wieder weg. Deshalb
     wird hier übernommen und geschlossen, wie beim Wechsel der
     Sprache — nur ohne Neuaufbau. */
  /* **Mit den Einstellungen geht alles, was darunter liegt.** Ein
     Import ändert das Buch als Ganzes; ein Posten- oder
     Kategorie-Fenster, das darunter noch offen stünde, schriebe
     seinen Stand danach in ein Buch, das es so nicht mehr gibt.
     Deshalb kein Rückweg (`handBack`) — es gibt nichts mehr, wohin. */
  const leaveTo=open=>{ applyEdits(); tidy(); save();
    document.querySelectorAll('.modal').forEach(m=>m.remove());
    render(); open(); };
  box.querySelector('#impFast').onclick=()=>leaveTo(openImportInfo);
  box.querySelector('#impSheet').onclick=()=>leaveTo(openSheetInfo);

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
    if(k==='groups'||k==='incomeGroups'||k==='kakCats') state[k].push('');
    else state[k].push({code:'',label:''});
    reopen();
  });

  /* ── Entfernen ──────────────────────────────────────────── */
  box.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.rm, i=+b.dataset.ri;

    if(k==='groups'||k==='incomeGroups'){
      const old=state[k][i], used=groupUseCount(old);
      if(used){
        const rest=state[k].filter((_,j)=>j!==i);
        if(!rest.length){ toast(t('set.keepOne')); return; }
        if(!confirm(t('set.moveAsk',old,used,rest[0]))) return;
      }
    }
    if(k==='kakCats'){
      const name=state.kakCats[i], n=name?kakTxCount(name):0;
      if(name&&kakHasData(name)&&!confirm(t('set.dropKakAsk',name,n?t('set.dropKakTx',n):''))) return;
    }

    applyEdits();
    if(k==='groups'||k==='incomeGroups'){
      const name=state[k][i];
      state[k].splice(i,1);
      /* Die Posten ziehen in die erste verbliebene Kategorie
         **derselben** Liste um — eine Einnahme darf nicht bei den
         Kosten landen. */
      dropGroup(name,state[k][0]);
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
    /* Womit die Einnahmen hereinkamen — gebraucht wird das erst
       unten, gelesen werden muss es hier: applyEdits() schreibt die
       Liste im nächsten Schritt um. */
    const inBefore=state.incomeGroups.slice();
    applyEdits();                     /* enthält die Umbenennungen */
    state.banks=state.banks.filter(x=>x.code);
    state.pays=state.pays.filter(x=>x.code);
    state.groups=[...new Set(state.groups.filter(Boolean))];
    /* **Keine Einnahme-Kategorie ist erlaubt** — ein frisch
       angefangenes Buch hat keine, und wer die letzte leert, meint
       es so. Zurück kommt nur, worauf noch ein Posten zeigt: ohne
       seine Kategorie entschiede isIncome() ihn stillschweigend zu
       den Kosten, und seine Zeile wechselte den Block. Die letzte
       Kategorie **in Gebrauch** gibt das Fenster ohnehin nicht her
       (siehe das Entfernen weiter oben) — hier bleibt der Weg über
       das geleerte Namensfeld. */
    state.incomeGroups=[...new Set(state.incomeGroups.filter(Boolean))];
    if(!state.incomeGroups.length)
      state.incomeGroups=inBefore.filter(g=>state.fixed.some(it=>it.group===g));
    state.kakCats=[...new Set(state.kakCats.filter(Boolean))];
    state.kakCats.forEach(ensureKakCat);
    save(); box.remove(); render(); toast(t('set.saved')); handBack();
  };
}

/* Alte Fundstellen (data-lists, Link im Posten-Fenster) zeigen
   weiterhin hierher. */
const editLists=openSettings;
