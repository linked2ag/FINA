/* ══════════════════════════════════════════════════════════════
   FINA — Ablaufsteuerung
   Zeichnet die gewählte Ansicht, hängt danach alle Klicks an und
   startet die Anwendung. Diese Datei wird als letzte geladen.
   ══════════════════════════════════════════════════════════════ */

/* ── Der Fokus und das Suchfeld ───────────────────────────────
   Solange im Suchfeld etwas steht, ist es der Platz, an dem
   gearbeitet wird: man tippt einen Begriff, macht unten etwas
   damit und tippt den nächsten. Der Fokus kehrt deshalb nach jedem
   Neuzeichnen dorthin zurück — aber nur, wenn dort etwas steht. Ein
   leeres Feld filtert nicht; die Schreibmarke hätte darin nichts
   verloren, und bei jedem Haken dorthin zu springen wäre lästig.

   ui.qFocus sagt, **wie** der Fokus zurückkommt:

     'end'  die Schreibmarke ans Ende — das setzt nur das Feld
            selbst, während getippt wird.
     'all'  der Begriff steht markiert da, das nächste Zeichen
            ersetzt ihn. So kommt man von überall sonst zurück:
            wer weitermacht, sucht meistens das Nächste.

   Wer nach dem Neuzeichnen nichts anderes zu tun hat, landet auch
   ohne Zutun wieder dort (siehe wire()). */
const keepQFocus=()=>{ ui.qFocus=(ui.q||'').trim()?'all':false; };

/* ── Kopfzeile: feste Beschriftungen, Ansichts- und Monatsreiter ─
   Alles mit data-t bekommt seinen Text aus js/i18n.js, data-ttip
   entsprechend den Tooltip. So wechselt die feste Kopfzeile die
   Sprache mit, ohne dass sie neu gebaut werden muss. */
function renderChrome(){
  document.documentElement.lang=LANG();
  document.querySelectorAll('[data-t]').forEach(el=>{ el.textContent=t(el.dataset.t); });
  document.querySelectorAll('[data-ttip]').forEach(el=>{ el.title=t(el.dataset.ttip); });
  const yl=document.getElementById('yearLbl'); if(yl) yl.textContent=t('app.sub',YEAR);

  /* Auf der Begrüßungsseite gibt es nichts zu wählen: weder Monat
     noch Ansicht. Und „Daten hochladen" steht nur dort — im
     geladenen Buch bleiben Speichern und Schließen. */
  /* Auf der Begrüßungsseite bleibt in der Kopfzeile nur die
     Anleitung: Öffnen und Anfangen bietet die Seite selbst an,
     alles andere hat ohne Datei keinen Sinn. Im geladenen Buch
     fehlt umgekehrt „Daten hochladen" — geladen wird auf der
     Seite, gearbeitet in der Anwendung. */
  const wel=!!ui.welcome;
  ['btnLoad','btnSave','btnUnlink','btnImport','btnSettings','filePath'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.hidden=wel||id==='btnLoad';
  });

  const mEl=document.getElementById('months');
  mEl.setAttribute('aria-label',t('app.chooseMonth'));
  mEl.style.display = (!wel&&ui.view==='monat') ? 'flex' : 'none';
  mEl.innerHTML=MONTHS.map((name,i)=>{
    const m=i+1, pt=monthParts(m);
    const s=pt.total===0?'':(pt.done===pt.total?'done':(pt.done>0?'partial':''));
    return `<button class="mtab${s==='done'?' alldone':''}${m===CUR?' current':''}" role="tab" aria-selected="${ui.month===m}" data-m="${m}"
      title="${t('month.done',pt.done,pt.total)}">${name}<span class="dot ${s}"></span></button>`;
  }).join('');
  /* Auch der Monatswechsel lässt den Fokus im Suchfeld: man hakt
     einen Monat ab, springt in den nächsten und tippt weiter. */
  mEl.querySelectorAll('.mtab').forEach(b=>b.onclick=()=>{ui.month=+b.dataset.m;ui.view='monat';keepQFocus();render();});

  /* Die Anleitung steht neben der Seite und wechselt die Sprache
     mit, ohne dass man sie schließen muss. */
  renderGuide(); syncGuideBtn();

  const vEl=document.getElementById('views');
  vEl.setAttribute('aria-label',t('app.chooseView'));
  vEl.style.display=wel?'none':'flex';
  /* Rechts auf Höhe der Reiter steht, was die Zeichen der
     Jahresmatrix bedeuten — dort ist Platz, und in der Leiste der
     Matrix stünde es zwischen lauter Knöpfen. Nur im Jahr: in den
     anderen Ansichten gibt es diese Zeichen nicht. */
  const key=ui.view==='jahr'?`<span class="viewkey" role="presentation">${t('year.legend')}</span>`:'';
  vEl.innerHTML=VIEWS.map(([k,l])=>`<button class="vtab" role="tab" aria-selected="${ui.view===k}" data-v="${k}">${l}</button>`).join('')+key;
  vEl.querySelectorAll('.vtab').forEach(b=>b.onclick=()=>{ui.view=b.dataset.v;render();});
}

/* ── Leisten, die stehen bleiben ──────────────────────────────
   Die Kopfzeile klebt oben, alles mit .stickybar klebt darunter:
   die Knopfleiste der Jahresmatrix, die Bedienleiste der
   Flexible Payments, die Kennzahlen von Monat und Prognose. Die
   Höhe der Kopfzeile ist je nach Ansicht verschieden — die
   Monatsreiter gibt es nur im Monat —, deshalb wird sie gemessen
   statt geraten. */
function syncStickyTops(){
  const h=document.querySelector('header'); if(!h) return;
  const top=h.offsetHeight;
  document.querySelectorAll('.stickybar').forEach(el=>{ el.style.top=top+'px'; });

  /* Darunter die Köpfe der Karten: sie kleben unter der Leiste
     der Ansicht (Auswertung und Filterzeile im Monat, Bedienleiste
     in den Flexible Payments). Auch diese Höhen sind je Ansicht
     verschieden — gemessen statt geraten, wie oben. */
  const bar=document.querySelector('#view > .stickybar');
  const base=top+(bar?bar.offsetHeight:0);
  document.querySelectorAll('.card > .sechead').forEach(sh=>{ sh.style.top=base+'px'; });
}

/* ── Mitlaufende Spaltenköpfe der Jahresmatrix ────────────────
   Die Matrix scrollt nur waagerecht, senkrecht scrollt die Seite.
   position:sticky richtet sich immer am nächsten Rollrahmen aus —
   das wäre hier der waagerechte, die Köpfe blieben also nicht
   stehen. Sie werden darum um genau den Betrag verschoben, um den
   die Tabelle unter die Kopfzeile der Seite gewandert ist.
   matrix.css liest den Wert aus --headY. */
function syncMatrixHead(){
  syncStickyTops();
  const box=document.getElementById('yearScroll'); if(!box) return;
  const head=box.querySelector('thead'); if(!head) return;
  /* Die Knopfleiste klebt unter der Kopfzeile, die Spaltenköpfe
     kleben unter der Knopfleiste. */
  const bar=document.getElementById('yearBar');
  const top=bar?bar.getBoundingClientRect().bottom
                :document.querySelector('header').getBoundingClientRect().bottom;
  const r=box.getBoundingClientRect();
  /* Die Saldozeile wandert mit demselben Maß mit — sie muss beim
     Anschlag am unteren Rand also mitgerechnet werden, sonst
     schöbe sie sich aus der Tabelle heraus. */
  const pin=box.querySelector('tr.balpin');
  const keep=head.offsetHeight+(pin?pin.offsetHeight:0);
  const y=Math.max(0,Math.min(top-r.top,r.height-keep));
  box.style.setProperty('--headY',y+'px');
  syncSecRows(box,top+keep);
}

/* ── Die Blockzeilen der Matrix bleiben stehen ────────────────
   Einnahmen, Flexible Payments, Regelmäßige Kosten: solange man
   in einem Block liest, steht seine Zeile oben — wie der Kopf
   einer Karte in der Monatsansicht. Dasselbe Mittel wie bei den
   Spaltenköpfen (translateY), denn position:sticky griffe hier
   nicht: der Rollrahmen der Matrix rollt nur waagerecht.

   Jede Zeile bekommt ihr eigenes Maß, begrenzt durch das Ende
   ihres Blocks — die nächste Blockzeile schiebt die vorige hinaus.
   `line` ist die Höhe, an der gestapelt wird: unter Knopfleiste,
   Spaltenköpfen und Saldozeile. */
function syncSecRows(box,line){
  const rows=[...box.querySelectorAll('tbody tr')];
  const secs=rows.filter(tr=>tr.classList.contains('secpin'));
  if(!secs.length) return;
  /* Erst alles zurücksetzen, dann messen: sonst misst man die
     Verschiebung vom letzten Mal gleich mit. */
  secs.forEach(tr=>tr.style.setProperty('--secY','0px'));
  secs.forEach(tr=>{
    const i=rows.indexOf(tr);
    /* Der Block reicht bis zur nächsten Blockzeile; die Leerzeile
       davor gehört nicht mehr dazu. */
    let end=rows.length-1;
    for(let j=i+1;j<rows.length;j++){ if(rows[j].classList.contains('secpin')){ end=j-1; break; } }
    while(end>i&&rows[end].classList.contains('spacer')) end--;
    const rTop=tr.getBoundingClientRect().top;
    const rBot=rows[end].getBoundingClientRect().bottom;
    const h=tr.getBoundingClientRect().height;
    tr.style.setProperty('--secY',Math.max(0,Math.min(line-rTop,rBot-h-rTop))+'px');
  });
}
addEventListener('scroll',syncMatrixHead,{passive:true});
addEventListener('resize',syncMatrixHead);

/* Zeichnet alles neu und hält dabei die Scrollposition. */
function render(){
  /* „Flexible Payment Details" gibt es nur mit Import (siehe
     VIEWS in js/config.js). Steht die Ansicht trotzdem noch —
     nach dem Trennen der Datei, nach einer Datei ohne Buchungen —,
     gäbe es einen Reiter weniger als Ansichten: keiner wäre
     ausgewählt. Dann tritt die Prognose an ihre Stelle, der
     Nachbar in der Reihe. */
  if(ui.view==='kakeibo'&&!hasImport()) ui.view='prognose';

  const sx=window.scrollX, sy=window.scrollY;
  const ysOld=document.getElementById('yearScroll');
  const yTop=ysOld?ysOld.scrollTop:null, yLeft=ysOld?ysOld.scrollLeft:null;

  renderChrome();
  document.getElementById('view').innerHTML= ui.welcome ? viewWelcome()
    : ({monat:viewMonat,prognose:viewPrognose,kakeibo:viewKakeibo,jahr:viewJahr})[ui.view]();
  wire(); renderStatus();

  window.scrollTo(sx,sy);
  const ysNew=document.getElementById('yearScroll');
  if(ysNew&&yTop!=null){ ysNew.scrollTop=yTop; ysNew.scrollLeft=yLeft; }
}

/* ── Klicks der frisch gezeichneten Ansicht ───────────────── */
function wire(){
  /* Abhaken heißt weitermachen: wer gerade filtert, tippt danach
     die nächste Position, ohne zur Maus zu greifen — dafür geht
     der Fokus zurück ins Suchfeld. Ist das Feld leer, filtert
     niemand: dann bleibt der Fokus, wo er ist. Sonst spränge die
     Schreibmarke bei jedem Haken in ein Feld, das gar nicht
     gebraucht wird. */
  document.querySelectorAll('[data-paid]').forEach(b=>b.onclick=()=>{
    const it=findItem(b.dataset.paid); if(!it) return;
    it.paid[ui.month-1]=!it.paid[ui.month-1];
    keepQFocus(); save();render();
  });
  document.querySelectorAll('[data-kpaid]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    const e=state.kak[b.dataset.kpaid]; if(!e) return;
    e.paid[ui.month-1]=!e.paid[ui.month-1]; keepQFocus(); save();render();
  });

  /* Filter und Navigation. Ein zweiter Klick auf denselben Knopf
     nimmt den Filter wieder zurück — er springt dann auf „alle",
     und der helle Grund sagt: gilt gerade nicht. */
  const toggleFilter=(key,val)=>{ ui[key]=(ui[key]===val&&val!=='alle')?'alle':val;
    keepQFocus(); render(); };
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>toggleFilter('filter',b.dataset.filter));
  document.querySelectorAll('[data-duefilter]').forEach(b=>b.onclick=()=>toggleFilter('dueFilter',b.dataset.duefilter));
  /* Der Zeitstrahl filtert wie die Knöpfe darunter: ein Abschnitt
     ist eine Fälligkeit (A · M · E, Z = ohne Zahltag), ein zweiter
     Klick nimmt ihn zurück. Den Zeitstrahl gibt es nur, solange die
     Auswertung aufgeklappt ist — zugeklappt gibt es diese Knöpfe
     also gar nicht. */
  document.querySelectorAll('[data-tpart]').forEach(b=>b.onclick=()=>toggleFilter('dueFilter',b.dataset.tpart));
  /* Die Auswertung auf- und zuklappen. Sie steht in ui, nicht in
     der Datei: was gerade zu sehen ist, gehört zur Anzeige. */
  document.querySelectorAll('[data-ana]').forEach(b=>b.onclick=()=>{
    ui.ana=!ui.ana; keepQFocus(); render(); });
  /* Einen Bereich zuklappen (in · flex · out) — die Karten der
     Monatsansicht (data-fold) und die Blöcke der Jahresmatrix
     (data-yfold). Beide gelten für alle zwölf Monate und stehen
     deshalb in der Datei, jede Ansicht in ihrer eigenen Liste —
     wie die beiden Filter der Jahresansicht, also save() davor.

     Geklappt wird gegen das, was zu sehen ist; das sagt der Pfeil
     selbst (aria-expanded), und der Klick schreibt das Gegenteil in
     die Datei. Während gefiltert wird, gibt es weder Pfeil noch
     Doppelklick: dort steht ohnehin alles offen. */
  const toggleFold=(store,k,openNow)=>{
    if(!state[store]) state[store]=blankFolded();
    state[store][k]=openNow;
    keepQFocus(); save(); render();
  };
  /* Ein Doppelklick auf die Überschrift (Monat) oder die Blockzeile
     (Jahr) tut dasselbe wie der Pfeil — auf Knöpfen und Links darin
     nicht, die haben ihr eigenes Ziel. */
  [['fold','dblfold','folded'],['yfold','dblyfold','foldedYear']].forEach(([a,d,store])=>{
    document.querySelectorAll(`[data-${a}]`).forEach(b=>b.onclick=()=>
      toggleFold(store,b.getAttribute(`data-${a}`),b.getAttribute('aria-expanded')==='true'));
    document.querySelectorAll(`[data-${d}]`).forEach(h=>h.ondblclick=ev=>{
      if(ev.target.closest('button,a,input,select,textarea')) return;
      const sel=window.getSelection(); if(sel) sel.removeAllRanges();
      const arrow=h.querySelector(`[data-${a}]`);
      toggleFold(store,h.getAttribute(`data-${d}`),!arrow||arrow.getAttribute('aria-expanded')==='true');
    });
  });
  /* Das Suchfeld: es filtert beim Tippen, also wird bei jedem
     Zeichen neu gezeichnet. Damit der Fokus das überlebt, merkt
     ui.qFocus ihn vor und wire() setzt ihn danach zurück — samt
     Schreibmarke am Ende ('end'). Hier gilt das **immer**, auch
     beim letzten Rücklöschen: wer das Feld leert, steht noch
     darin. Markiert würde der Begriff hier gerade nicht — das
     nächste Zeichen löschte sonst, was man eben getippt hat. */
  document.querySelectorAll('[data-q]').forEach(i=>i.oninput=()=>{
    ui.q=i.value; ui.qFocus='end'; render();
  });
  /* Der Knopf dahinter nimmt den Filter zurück — alle drei auf
     einmal. Danach steht der Fokus im leeren Feld: wer
     zurücknimmt, sucht meistens gleich etwas anderes. */
  document.querySelectorAll('[data-qclear]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    ui.q=''; ui.filter='alle'; ui.dueFilter='alle'; ui.qFocus='all'; render();
  });
  /* Der Hamburger-Knopf davor: worin der Suchbegriff überhaupt
     sucht (js/dialogs/filter-fields.js). Die Wahl steht in der
     Datei, geändert wird sie erst mit „Speichern" im Fenster. */
  document.querySelectorAll('[data-qfields]').forEach(b=>b.onclick=()=>openFilterFields());
  /* Wechsel zwischen Haupt- und Unterkategorien: rechts stehen
     danach wieder die größten Einzelposten, nicht die Auswahl
     einer Zeile, die es so vielleicht gar nicht mehr gibt. */
  document.querySelectorAll('[data-kd]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    ui.kakDetail=b.dataset.kd==='1'; ui.kakPick=null; render();});
  /* Sprung aus der Jahresmatrix in einen Monat: das Suchfeld gibt
     es dort auch, und es trägt dasselbe Wort — also bleibt der
     Fokus darin, sofern etwas darin steht. */
  document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{ui.month=+b.dataset.goto;ui.view='monat';keepQFocus();render();});

  /* Kakeibo: Auswahl der rechten Spalte — eine Kategorie oder,
     ohne Auswahl, die größten Einzelposten. */
  document.querySelectorAll('[data-kpick]').forEach(b=>b.onclick=()=>{
    const [main,sub]=b.dataset.kpick.split('|');
    ui.kakPick=(ui.kakPick&&ui.kakPick.main===main&&(ui.kakPick.sub||'')===(sub||''))
      ?null:{main,sub:sub||''};
    render();
  });
  document.querySelectorAll('[data-ktop]').forEach(b=>b.onclick=()=>{ui.kakPick=null;render();});
  document.querySelectorAll('[data-kmonth]').forEach(b=>b.onclick=()=>{
    if(b.disabled) return;
    const d=b.dataset.kmonth;
    if(d==='jahr') ui.scope='jahr';
    /* Zurück ins Jetzt — aus dem ganzen Jahr wie aus jedem
       anderen Monat. */
    else if(d==='cur'){ ui.month=CUR; ui.scope='monat'; }
    else { ui.month=Math.min(12,Math.max(1,ui.month+(d==='next'?1:-1))); ui.scope='monat'; }
    render();
  });
  document.querySelectorAll('[data-kview]').forEach(b=>b.onclick=()=>{
    ui.month=+b.dataset.kview; ui.scope='monat'; ui.view='kakeibo'; ui.kakPick=null; render();
  });

  /* Die beiden Wege der Begrüßungsseite. */
  document.querySelectorAll('[data-wload]').forEach(b=>b.onclick=()=>loadData());
  document.querySelectorAll('[data-wnew]').forEach(b=>b.onclick=()=>startEmpty());

  /* Fenster öffnen */
  document.querySelectorAll('[data-lists]').forEach(b=>b.onclick=()=>editLists());
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editItem(findItem(b.dataset.edit)));
  document.querySelectorAll('[data-kedit]').forEach(b=>b.onclick=()=>editKak(b.dataset.kedit));
  /* Doppelklick auf Betrag oder Bezeichnung öffnet dasselbe
     Fenster wie der Stift — in jeder Ansicht, in der eine Zeile zu
     einer Position gehört. Es zählen nur diese beiden Zellen; auf
     Siegel, Lampe, Beleglink und Eingabefeld bleibt der
     Doppelklick, was er dort ist. Die Markierung, die er anlegt,
     wird vorher aufgehoben — sie stünde sonst blau hinter dem
     Fenster. */
  const DBLCELL='td.num,td.amt,td.lab,td.nm';
  const dblOpen=(sel,open)=>document.querySelectorAll(sel).forEach(tr=>tr.ondblclick=ev=>{
    if(!ev.target.closest(DBLCELL)) return;
    if(ev.target.closest('button,a,input,select,textarea')) return;
    const s=window.getSelection(); if(s) s.removeAllRanges();
    open(tr);
  });
  dblOpen('[data-dbledit]',tr=>editItem(findItem(tr.dataset.dbledit)));
  dblOpen('[data-dblkedit]',tr=>editKak(tr.dataset.dblkedit));
  /* Neu anlegen — in beiden Ansichten und in beiden Arten. Der
     Wert von data-newitem ist der vorgewählte Block ("1" = der
     erste der Liste). */
  document.querySelectorAll('[data-newitem]').forEach(b=>b.onclick=()=>editItem(null,b.dataset.newitem));
  document.querySelectorAll('[data-newkak]').forEach(b=>b.onclick=()=>newKakCat());
  bindNotes(document,()=>render());

  /* Die beiden Filter der Jahresansicht. Sie stehen in der Datei,
     nicht in ui — der Nutzer stellt sie einmal ein und findet sie
     beim nächsten Öffnen wieder. Deshalb save() davor. Und wie in
     der Monatsansicht: steht im Suchfeld etwas, geht der Fokus
     danach dorthin zurück. */
  const fb=document.getElementById('btnFold');
  if(fb) fb.onclick=()=>{state.hideDoneMonths=!state.hideDoneMonths;keepQFocus();save();render();};
  const hs=document.getElementById('btnHideSettled');
  if(hs) hs.onclick=()=>{state.hideSettled=!state.hideSettled;keepQFocus();save();render();};

  /* Die Prognose hat nichts zu verdrahten: sie rechnet und zeigt.
     Die Annahme wird im Fenster der Kategorie gepflegt — der Weg
     dorthin führt über Stift und Doppelklick, die schon oben
     hängen. */

  /* Kakeibo: CSV-Import und Zeitraum (Ganzes Jahr oder ein Monat) */
  const km=document.getElementById('kMonth');
  if(km) km.onchange=()=>{
    if(km.value==='jahr') ui.scope='jahr';
    else { ui.scope='monat'; ui.month=+km.value; }
    render();
  };
  /* Derselbe Weg wie über die Kopfzeile: erst das Fenster mit den
     Spalten, dann die Dateiauswahl. */
  const imp=document.getElementById('btnImportK');
  if(imp) imp.onclick=()=>openImportInfo();

  /* Zum Schluss: Tab springt in der Ansicht nur noch von Feld zu
     Feld. Die Kopfzeile bleibt außen vor — über sie erreicht man
     Ansicht, Monat und Datei weiter mit der Tastatur. */
  tabThroughFields(document.getElementById('view'));

  /* Der Fokus kehrt ins Suchfeld zurück — ohne zu scrollen, die
     Seite steht danach ohnehin wieder auf ihrer alten Höhe.

     Zwei Wege führen dorthin. Der eine ist ui.qFocus: eine Stelle
     hat gesagt, dass sie den Fokus zurückgibt. Der andere ist der
     **Rückfall**: steht im Feld etwas und hat nach dem Neuzeichnen
     niemand sonst den Fokus, gehört er dorthin. So kommt man auch
     aus einem Fenster zurück, das gerade gespeichert hat — dessen
     Knopf gibt es nicht mehr, der Fokus läge sonst auf dem
     Dokument und die nächste Taste ginge ins Leere.

     Zwei Bedingungen hat der Rückfall: kein offenes Fenster (dort
     wird gerade getippt, ihm den Fokus zu nehmen wäre ein Fehler)
     und wirklich niemand sonst — `document.body` heißt „nichts". */
  const qEl=document.querySelector('[data-q]');
  const idle=!document.activeElement||document.activeElement===document.body;
  const back=ui.qFocus||(qEl&&qEl.value&&idle&&!document.querySelector('.modal')?'all':false);
  if(qEl&&back){
    qEl.focus({preventScroll:true});
    if(back==='end') qEl.setSelectionRange(qEl.value.length,qEl.value.length);
    else qEl.select();
  }
  ui.qFocus=false;

  syncMatrixHead();
}

/* ── Strg/Cmd + Umschalt + Buchstabe: die Ansicht wechseln ───
   Ein Griff je Reiter, in der Reihenfolge der Reiter:

     M  Monat · Y  Jahr · C  Prognose · F  Flexible Payment Details

   Die Buchstaben stehen für den **englischen** Namen und wechseln
   deshalb nicht mit der Sprache — wie B · PT · DD · LP in der
   Jahresmatrix und wie die Kürzel der Prognose. Y statt J, weil
   „Year"; C statt P, weil „Forecast" schon mit F anfängt und F an
   den vierten Reiter geht.

   Ins Suchfeld führte diese Taste einmal (Strg/Cmd+Umschalt+F).
   Den Weg gibt es nicht mehr: seit ein einzelner Buchstabe im
   Monat und im Jahr von selbst im Filter landet, war er der
   umständlichere von zweien.

   **Nur Reiter, die es gibt.** „Flexible Payment Details"
   erscheint erst mit importierten Buchungen (VIEWS in
   js/config.js); ohne sie tut der Griff nichts, statt in eine
   Ansicht zu springen, die kein Reiter zeigt.

   Zwei Fälle bleiben außen vor: die Begrüßungsseite (dort gibt es
   keine Reiter) und ein offenes Fenster — dort wird gerade
   getippt, und die Ansicht darunter zu wechseln nähme dem Fenster
   den Boden. */
const VIEW_KEYS={m:'monat',y:'jahr',c:'prognose',f:'kakeibo'};
addEventListener('keydown',ev=>{
  if(!ev.shiftKey||!(ev.ctrlKey||ev.metaKey)||ev.altKey) return;
  const want=VIEW_KEYS[(ev.key||'').toLowerCase()];
  if(!want) return;
  if(ui.welcome||document.querySelector('.modal')) return;
  ev.preventDefault();
  if(!VIEWS.some(([k])=>k===want)||ui.view===want) return;
  ui.view=want; render();
});

/* ── Einfach lostippen ───────────────────────────────────────
   Wer in der Monats- oder Jahresansicht anfängt zu tippen, ohne
   vorher irgendwo hineingeklickt zu haben, meint den Filter: es
   gibt in diesen beiden Ansichten nichts anderes, in das ein
   Buchstabe gehören könnte. Das erste Zeichen holt also das
   Suchfeld nach vorn und steht gleich darin — der Weg über die
   Maus bleibt, wird aber selten gebraucht.

   Vier Fälle bleiben außen vor:

     • **Ein Feld hat schon den Fokus** — dort wird getippt, auch
       im Suchfeld selbst; dann macht der Browser das von allein.
     • **Ein offenes Fenster**, die Begrüßungsseite, eine Ansicht
       ohne Suchfeld: nichts zu filtern.
     • **Jede Taste mit Strg, Cmd oder Alt** — das sind Befehle,
       keine Zeichen; `key.length===1` hält Escape, Tabulator und
       die Pfeile ohnehin heraus.
     • **Das Leerzeichen bei leerem Feld.** Es filterte auf nichts
       und nähme dem Browser das Blättern weg.

   Geschrieben wird das Zeichen nicht ins Feld, sondern in `ui.q` —
   das Feld wird beim Zeichnen ohnehin neu gebaut. Die Schreibmarke
   steht danach am Ende ('end'), wie beim Tippen im Feld. */
addEventListener('keydown',ev=>{
  if(ev.defaultPrevented||ev.isComposing) return;
  if(ev.ctrlKey||ev.metaKey||ev.altKey||ev.key.length!==1) return;
  if(ui.welcome||document.querySelector('.modal')) return;
  const el=document.activeElement;
  if(el&&(el.matches('input,textarea,select')||el.isContentEditable)) return;
  const q=document.querySelector('[data-q]');
  if(!q) return;
  if(ev.key===' '&&!(ui.q||'')) return;
  ev.preventDefault();
  ui.q=(ui.q||'')+ev.key; ui.qFocus='end'; render();
});

/* ── Escape nimmt den Filter zurück ──────────────────────────
   Dieselbe Wirkung wie der Knopf rechts vom Suchfeld: Suchbegriff,
   Zahlungsstand und Fälligkeit auf einmal. Escape heißt überall
   „zurück" — im Fenster schließt es, in der Liste nimmt es den
   Filter weg.

   **Nur, wenn kein Fenster offen ist.** Dort gehört Escape dem
   Fenster (js/ui.js), und es schließt es; den Filter dabei
   nebenbei zu leeren wäre eine zweite, ungefragte Wirkung. Und
   nur, wenn überhaupt gefiltert wird — sonst passiert nichts, und
   der Tastendruck bleibt für den Browser, was er ist. */
addEventListener('keydown',ev=>{
  if(ev.key!=='Escape'||ev.defaultPrevented) return;
  if(ui.welcome||document.querySelector('.modal')) return;
  if(!(ui.q||'').trim()&&ui.filter==='alle'&&ui.dueFilter==='alle') return;
  if(!document.querySelector('[data-q]')) return;
  ev.preventDefault();
  ui.q=''; ui.filter='alle'; ui.dueFilter='alle'; ui.qFocus='all'; render();
});

/* ── Feste Schaltflächen der Kopfzeile ────────────────────── */
document.getElementById('btnSettings').onclick=()=>openSettings();
/* Die Anleitung ist ein Bereich, kein Fenster: derselbe Knopf
   klappt sie auf und wieder zu. */
document.getElementById('btnGuide').onclick=()=>toggleGuide();
/* Der CSV-Import führt erst durch ein Fenster mit den Spalten,
   die in der Datei stehen müssen, und dann zur Dateiauswahl
   (js/dialogs/csv-import.js). */
document.getElementById('btnImport').onclick=()=>openImportInfo();
document.getElementById('btnLoad').onclick=()=>loadData();
document.getElementById('btnSave').onclick=()=>saveData();
document.getElementById('btnUnlink').onclick=()=>unlinkData();

/* Rückfallweg, wenn der Browser die File System Access API nicht kennt. */
document.getElementById('fileJson').onchange=e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{ state=migrate(JSON.parse(r.result)); fileName=f.name; fileHandle=null; dirty=false;
      afterLoad(); ui.welcome=false; render(); toast(t('store.loaded',f.name)); }
    catch(err){ toast(t('store.readFail')); } };
  r.readAsText(f,'utf-8'); e.target.value='';
};

/* Die Datei wird nur gelesen; geändert wird erst, wenn der Nutzer
   im Import-Fenster (js/dialogs/csv-import.js) beide Schritte
   bestätigt hat. */
document.getElementById('fileCsv').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const rows=parseFastBudget(r.result);
      if(!rows.length){toast(t('imp.noRows'));return;}
      openImport(rows,f.name);
    }catch(err){toast(t('imp.failed',err.message));}
  };
  r.readAsText(f,'utf-8'); e.target.value='';
};

/* ── Start ────────────────────────────────────────────────────
   Leer und auf Englisch beginnen. Inhalte und Einstellungen
   kommen über „Load data" aus der JSON-Datei. */
state=emptyState();
afterLoad();
render();
