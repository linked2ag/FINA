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
  (it.links||[]).forEach(l=>p.push(`<span><a href="${esc(l.url)}" target="_blank" rel="noopener"
    data-tip="${esc(l.url)}">${esc(linkLabel(l))}</a></span>`));
  return p.length?`<div class="meta">${p.join('')}</div>`:'';
}

/* Abbezahlt: für dieses Jahr steht nichts mehr aus (yearSettled in
   js/calc.js). Die Zeile bekommt denselben grauen Grund wie in der
   Jahresmatrix — es ist dieselbe Aussage, und wer zwischen den
   Ansichten wechselt, soll sie nicht zweimal lernen müssen. */
function itemRow(it,m){
  const p=paidAt(it,m), e=estOf(it), note=it.notes[m-1];
  const cls2=(p?'paid':'')+(yearSettled(it)?' settled':'');
  return `<tr class="${cls2.trim()}"${dblItem(it.id)}>
    <td class="markcell"><button class="seal${!p&&e?' est':''}" aria-pressed="${p}" data-paid="${it.id}"
      title="${p?t('month.markOpen'):t('month.markPaid')}">${CHECK_SVG}</button></td>
    <td class="num amt ${e&&!p?'est':cls(it.amounts[m-1])}">${eur(it.amounts[m-1])}</td>
    <td class="pencell"><div class="ptools"><button class="pencil" data-edit="${it.id}" title="${t('year.editTip')}">&#9998;</button>${linkIcon(it.links,'item',it.id)}${lampHtml('item',it.id,m)}</div></td>
    <td class="nm"><span class="iname">${esc(it.name)}</span>${isLastRate(it,m)?`<span class="pill last">${t('month.lastRate')}</span>`:''}
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
        title="${t('bal.editTip')}">&#9998;</button>${linkIcon(state.balance.links,'item',BALANCE_ID)}${lampHtml('item',BALANCE_ID,m)}</div></td>
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
    <td class="pencell"><div class="ptools"><button class="pencil" data-kedit="${esc(k)}" title="${t('month.editKak')}">&#9998;</button>${linkIcon(e.links,'kak',k)}${lampHtml('kak',k,m)}</div></td>
    <td class="nm"><div class="rowline">
        <span><span class="iname">${esc(keyLabel(k))}</span></span>
        ${kakOv(k,m)!=null?'<span class="pill corrp">corrected</span>':(imported?'<span class="pill">imported</span>':(e.estimated?`<span class="pill">${t('g.estimated')}</span>`:''))}</div>
      ${e.notes[m-1]?`<div class="itemnote">${esc(e.notes[m-1])}</div>`:''}</td></tr>`;
}

/* ══ Die Auswertung über dem Monat ═══════════════════════════
   Sie steht eingeklappt: eine einzige dünne Zeile, links die
   Überschrift „Auswertung", daneben die fünf Zahlen, die den Monat
   beschreiben. Ein Klick irgendwo auf die Zeile klappt sie auf, und
   darunter erscheint der Zeitstrahl. Einen Pfeil trägt sie nicht —
   ob sie offen ist, sagt der Zeitstrahl selbst; für die Tastatur
   und die Vorlesehilfe steht es in aria-expanded.

   Warum eingeklappt: die Leiste nimmt oben dauerhaft Platz weg,
   den die Liste darunter braucht. Aufgeklappt bleibt sie, bis man
   sie wieder zuklappt (ui.ana, nicht in der Datei).

   Unter der Auswertung steht die Filterzeile — sie gilt für alle
   drei Bereiche und gehört deshalb nach oben und nicht in eine der
   Karten. Alles zusammen steckt in einer .stickybar und bleibt beim
   Scrollen unter der Kopfzeile stehen.

   Die Zahlenzeile ist ein einziger Knopf — daher steht in den
   Kästchen kein weiteres anklickbares Element, nur data-tip für
   die Erklärung. Die Filterzeile steht daneben, nicht darin: sie
   hat ihre eigenen Knöpfe. */
/* ── Die Auswertung über der Monatsansicht ────────────────────
   Vier Zahlen: was hereinkommt, die Flexible Payments, die
   regelmäßigen Kosten, was davon noch offen ist. **Kein
   Kontostand.** Den zeigt die Jahresansicht — dort steht er neben
   den elf anderen Monaten und lässt sich lesen; hier stünde er
   allein und ohne Vergleich. Was der Monat mit dem Konto macht,
   sagt der Zeitstrahl darunter, Zeile für Zeile.

   **Gerechnet wird über `sel`** — die Zeilen, die nach dem Filtern
   übrig sind, dieselben, aus denen die Karten darunter ihre Summen
   ziehen. Die Leiste beschreibt damit nicht mehr den ganzen Monat,
   sondern das, was man gerade vor sich hat: wer nach einer
   Kategorie sucht, liest hier, was sie einbringt und kostet.
   Ungefiltert ist es dieselbe Zahl wie zuvor.

   Auch die Zahl hinter „noch offen" zählt nur die gezeigten
   Posten — sonst nennte die Sprechblase „3 von 20", während
   darunter drei Zeilen stehen. */
function anaBar(m,sel,selAny){
  const open=!!ui.ana;
  const inc=sel.items.filter(isIncome);
  const due=sel.items.filter(it=>!isIncome(it));
  const openN=due.filter(it=>!paidAt(it,m)).length;
  const uncN=due.filter(it=>estOf(it)&&!paidAt(it,m)).length;
  const sum=arr=>arr.reduce((s,it)=>s+it.amounts[m-1],0);
  const openTip=t('month.kpiOpenN',openN,due.length,uncN?t('month.kpiUnclear',uncN):'');
  const cell=(c,lab,val,vc,tip)=>`<span class="anak${c?' '+c:''}"${tip?` data-tip="${esc(tip)}"`:''}
      ><span class="lab">${lab}</span><span class="val ${vc}">${eur(val)}</span></span>`;
  return `<div class="stickybar anabar">
    <button class="anahead" data-ana="1" aria-expanded="${open}"
      data-tip="${esc(open?t('month.anaClose'):t('month.anaOpen'))}">
      <span class="analab">${t('month.ana')}</span>
      <span class="anarow">
        ${cell('t-in',t('month.kpiIncome'),sum(inc),'pos')}
        ${cell('t-flex',t('month.kpiKak',hasActual(m)?t('month.kpiActual'):t('month.kpiPlanned')),sel.kaks.reduce((s,k)=>s+kakVal(k,m),0),'neg')}
        ${cell('t-out',t('month.kpiFixed'),sum(due),'neg')}
        ${cell('t-out',t('month.kpiOpen'),sum(due.filter(it=>!paidAt(it,m))),openN?'neg':'',openTip)}
      </span>
    </button>
    ${open?timeline(m,sel,selAny):''}
    <!-- Eine Zeile in der Reihenfolge, in der man filtert: erst
         suchen, dann nach Fälligkeit einschränken, dann nach
         Zahlungsstand. Sie gilt für alle drei Bereiche.
         Greift einer der drei, färbt sich die ganze Leiste orange
         (.on) — sie sagt dann, dass hier gerade etwas ausgeblendet
         wird; sonst ist sie grau wie jeder andere Bereich. -->
    <div class="filterbar fbrow${(!!queryQ()||ui.filter!=='alle'||ui.dueFilter!=='alle')?' on':''}">
      ${filterField('flttop')}
      <span class="fbgroup">
        ${fbtn('duefilter','alle',t('month.fDueAll'),t('month.fDueAllTip'),ui.dueFilter)}
        ${fbtn('duefilter','A',t('month.fDueA'),t('month.fDueATip'),ui.dueFilter)}
        ${fbtn('duefilter','M',t('month.fDueM'),t('month.fDueMTip'),ui.dueFilter)}
        ${fbtn('duefilter','E',t('month.fDueE'),t('month.fDueETip'),ui.dueFilter)}
        ${fbtn('duefilter','Z',t('month.tlClose'),t('month.fDueZTip'),ui.dueFilter)}
      </span>
      <span class="fbgroup">
        ${fbtn('filter','alle',t('month.fAll'),t('month.fAllTip'),ui.filter)}
        ${fbtn('filter','offen',t('month.fOpen'),t('month.fOpenTip'),ui.filter)}
        ${fbtn('filter','unklar',t('month.fEst'),t('month.fEstTip'),ui.filter)}
        ${fbtn('filter','bezahlt',t('month.fPaid'),t('month.fPaidTip'),ui.filter)}
      </span>
    </div></div>`;
}

/* ── Der Kopf der mobilen Monatsansicht ───────────────────────
   Unter 700 px (isMobile in js/app.js) ersetzt er die Auswertung:
   oben klebt die Suchzeile — Filterknopf, Suchfeld, Leeren, alle
   gleich hoch —, darunter scrollen die Kennzahlen als Kacheln mit
   (2 Spalten, die SALDO-Zeile über beide). Der Zeitstrahl entfällt:
   auf 390 px ist er kein Maß mehr, an dem sich etwas ablesen ließe.

   **Alle Filter wohnen hinter dem einen Knopf** (data-mfilters,
   verdrahtet in wire): Fälligkeit und Zahlungsstand als dieselben
   Knöpfe wie auf dem Schreibtisch (data-duefilter, data-filter),
   dazu der Weg ins Fenster „Worin der Filter sucht" (data-qfields).
   Wie viele gerade greifen, sagt die rote Marke am Knopf.

   Gerechnet wird wie in anaBar über `sel` — die Kacheln nennen,
   was nach dem Filtern zu sehen ist, dieselben Zahlen wie die
   Karten darunter. Die SALDO-Zeile ist deren Summe samt
   Saldokorrektur: das Ergebnis dieses Monats, wie es die oberste
   Zeile der Jahresmatrix nennt. */
function mobileTop(m,sel,sums){
  const due=sel.items.filter(it=>!isIncome(it));
  const openSum=due.filter(it=>!paidAt(it,m)).reduce((s,it)=>s+it.amounts[m-1],0);
  const sal=sums.inc+sums.flex+sums.out+(sel.bal?balanceFix(m):0);
  const nFlt=(ui.dueFilter!=='alle'?1:0)+(ui.filter!=='alle'?1:0);
  const open=!!ui.mFilters;
  const custom=QFIELDS.some(k=>!qField(k))||qAll();
  const clearOn=!!(ui.q||'').trim()||nFlt>0;
  const tile=(c,lab,val,vc)=>`<span class="mk${c?' '+c:''}"><span class="lab">${lab}</span
    ><span class="val ${vc}">${eur(val)}</span></span>`;
  return `<div class="stickybar msearch">
    <div class="msrow">
      <button class="mfbtn" data-mfilters="1" aria-expanded="${open}" aria-pressed="${nFlt>0}"
        aria-label="${esc(t('month.mFilters'))}" title="${esc(t('month.mFiltersTip'))}"
        >&#9776;${nFlt?`<span class="mfbadge">${nFlt}</span>`:''}</button>
      <input class="fltq msq" data-q type="search" value="${esc(ui.q||'')}"
        placeholder="${t('g.filter')}" aria-label="${t('g.filter')}">
      <button class="msclear" data-qclear="1"${clearOn?'':' disabled'}
        aria-label="${esc(t('g.clearFilter'))}" title="${esc(t('g.clearFilterTip'))}">&#10005;</button>
    </div>
    ${open?`<div class="mfpanel">
      <span class="fbgroup">
        ${fbtn('duefilter','alle',t('month.fDueAll'),t('month.fDueAllTip'),ui.dueFilter)}
        ${fbtn('duefilter','A',t('month.fDueA'),t('month.fDueATip'),ui.dueFilter)}
        ${fbtn('duefilter','M',t('month.fDueM'),t('month.fDueMTip'),ui.dueFilter)}
        ${fbtn('duefilter','E',t('month.fDueE'),t('month.fDueETip'),ui.dueFilter)}
        ${fbtn('duefilter','Z',t('month.tlClose'),t('month.fDueZTip'),ui.dueFilter)}
      </span>
      <span class="fbgroup">
        ${fbtn('filter','alle',t('month.fAll'),t('month.fAllTip'),ui.filter)}
        ${fbtn('filter','offen',t('month.fOpen'),t('month.fOpenTip'),ui.filter)}
        ${fbtn('filter','unklar',t('month.fEst'),t('month.fEstTip'),ui.filter)}
        ${fbtn('filter','bezahlt',t('month.fPaid'),t('month.fPaidTip'),ui.filter)}
      </span>
      <span class="fbgroup">
        <button class="btn small" data-qfields="1" aria-pressed="${custom}">${t('flt.title')}</button>
      </span>
    </div>`:''}
  </div>
  <div class="mkpi">
    ${tile('t-in',t('month.kpiIncome'),sums.inc,'pos')}
    ${tile('t-flex',t('month.kpiKak',hasActual(m)?t('month.kpiActual'):t('month.kpiPlanned')),sums.flex,'neg')}
    ${tile('t-out',t('month.kpiFixed'),sums.out,'neg')}
    ${tile('',t('month.kpiOpen'),openSum,openSum?'neg':'')}
    <span class="mk msal"><span class="lab">${t('month.kpiSaldo')}</span
      ><span class="val ${cls(sal)}">${eur(sal)}</span></span>
  </div>`;
}

/* ── Der Zeitstrahl ───────────────────────────────────────────
   Fünf Zeilen in der Reihenfolge des Monats — was er vorfindet,
   Anfang, Mitte, Ende, Abschluss. Jede Zeile nennt links ihren
   Namen samt Tagen, dann was sich in ihr bewegt und den Kontostand
   danach; rechts steht über die ganze übrige Breite der Balken.
   Gerechnet wird das in monthFlow() (js/calc.js) aus der
   Fälligkeit der einzelnen Positionen.

   **Die Fläche ist ein Wasserfall, und die Achse ist der
   Kontostand selbst** (flowScale in js/calc.js): 0 % der tiefste
   Stand des Monats — höchstens die Null —, 100 % der höchste. Wo
   die Null liegt, teilt den roten vom grünen Bereich; liegt der
   Monat ganz im Plus, ist die ganze Fläche grün. Jede Zeile
   beginnt beim Stand der Zeile darüber und endet bei ihrem
   eigenen, gebaut wird das in flowTrack() weiter oben.

   Die erste Zeile ist kein Zeitraum, sondern ein Stand: was die
   Monate davor übrig gelassen haben. In sie wird nichts fällig,
   sie ist kein Filter — deshalb ein span und kein Knopf. Ihr
   Balken geht von der Null bis zu ihrem Wert und steht damit dort,
   wo der Monat anfängt.

   Die Tage stehen jetzt in der Beschriftung der Zeile (1.–10.,
   11.–20., ab dem 21.) statt als Leiste darunter: die Breite
   gehört dem Betrag, nicht mehr der Zeit. Fällt der heutige Tag in
   eine Zeile, trägt sie eine Marke.

   Ein Klick auf eine Zeile filtert die regelmäßigen Kosten nach
   ihrer Fälligkeit — dieselben Werte wie die Filterknöpfe darunter
   (data-duefilter), nur an der Stelle, an der man gerade liest.
   Ein zweiter Klick nimmt ihn zurück. Ohne aufgeklappte Auswertung
   gibt es den Zeitstrahl nicht, also auch diesen Filter nicht. */

/* Die vier Geldarten des Balkens, in der Reihenfolge, in der sie
   gestapelt werden. */
/* Die Anteile eines Balkens baut flowParts() in js/ui.js — die
   Prognose zeichnet mit derselben Funktion. */

/* ── Die Balkenfläche einer Zeile ─────────────────────────────
   Ein Wasserfall: die Zeile beginnt beim Stand des Abschnitts
   davor (prev) und endet bei ihrem eigenen (run). Dazwischen
   liegt, was den Unterschied gemacht hat.

     • Zuflüsse wachsen von prev nach rechts bis zum höchsten
       Punkt der Zeile (top = prev + alle Zuflüsse).
     • Abflüsse holen von dort zurück nach links bis run.

   Beides kann in derselben Zeile vorkommen — erst kommt das
   Gehalt, dann geht die Miete ab —, und dann überdecken sich die
   beiden Strecken auf der Achse. Deshalb steht der Zufluss über
   dem Abfluss (Klasse `two`). Gibt es nur eine Richtung, steht sie
   allein in der Mitte — jede Zeile ist zwei Balken hoch (.tline
   .ttrack in css/layout.css), gefiltert wie ungefiltert.

   Dazu zwei Marken: eine feine Linie beim Stand davor und ein
   kräftiger Strich beim neuen Stand. Weil die Zeilen aneinander
   grenzen und der neue Stand der Zeile darüber der alte dieser
   Zeile ist, stehen sie genau untereinander — das ist die Treppe
   des Wasserfalls.

   Die erste Zeile ist keine Veränderung, sondern ein Stand: sie
   bekommt einen vollen Balken von der Null bis zu ihrem Wert. */
function flowTrack(f,pos,zero,zones,cut){
  const mark=`<span class="tmark" style="left:${pos(f.run)}%"></span>`;
  const up0=sumOf(f.up), down0=sumOf(f.down);
  const box=inner=>`<span class="ttrack${up0&&down0?' two':''}">${zones}${inner}</span>`;
  if(f.key==='P'){
    /* Bei beschnittener Achse liegt die Null außerhalb — der Balken
       reicht dann bis an den Rand der Fläche und franst dort aus
       (.tsum.cutl / .cutr in css/layout.css). Ausgefranst wird an
       der Seite, an der die Null hinausfällt: steht sie links davon
       (Guthaben), kommt der Balken von links; steht sie rechts
       (Minus), läuft er nach rechts hinaus. */
    const a=Math.max(0,Math.min(zero,pos(f.run))), b=Math.min(100,Math.max(zero,pos(f.run)));
    const fade=cut?(zero<0?' cutl':' cutr'):'';
    return box(`<span class="tsum solo${fade}" style="left:${a}%;width:${b-a}%"
      data-tip="${esc(eur(f.run))}"></span>${mark}`);
  }
  const up=sumOf(f.up), down=sumOf(f.down), top=f.prev+up;
  const solo=(up&&down)?'':' solo';
  const bar=(cls,from,to,inner)=>`<span class="${cls}${solo}"
    style="left:${pos(from)}%;width:${pos(to)-pos(from)}%">${inner}</span>`;
  return box((up?bar('tup',f.prev,top,flowParts(f.up,up,'up')):'')
    +(down?bar('tdown',f.run,top,flowParts(f.down,down,'down')):'')
    +`<span class="tconn" style="left:${pos(f.prev)}%"></span>${mark}`);
}

/* Name, Tage und Beschriftung eines Abschnitts — der Wasserfall
   und die gefilterte Fassung (partLine) beschriften damit dieselben
   Zeilen; zwei Fassungen liefen auseinander. */
const tlName=k=>({P:t('month.tlOpen'),A:t('month.fDueA'),M:t('month.fDueM'),
  E:t('month.fDueE'),Z:t('month.tlClose')})[k];
const tlDays=(k,last)=>({A:[1,10],M:[11,20],E:[21,last]})[k];
const tlToday=m=>(new Date().getFullYear()===YEAR&&m===CUR)?new Date().getDate():0;
function tlLabel(k,last,today){
  const d=tlDays(k,last), now=d&&today>=d[0]&&today<=d[1];
  return `<span class="tname">${tlName(k)}${d?`<small>${t('month.tlDays',d[0],d[1])}</small>`:''}${
    now?`<b class="tnow">${t('month.tlNow')}</b>`:''}</span>`;
}

/* Die feinste Stufe der Leiter 1·2·5·10 …, bei der die Spanne in
   höchstens zehn Felder passt — dieselbe Regel wie die Achse der
   Prognose, nur bis in den Euro hinunter. Beide Fassungen des
   Zeitstrahls rastern damit. */
function tlStep(span){
  let s=1; for(let i=0;span/s>10;i++) s*=[2,2.5,2][i%3];
  return s;
}

/* Die Achszeile über dem Zeitstrahl: an jeder Rasterlinie der
   Betrag, für den sie steht — eine schmale Zeile, nur in der
   Spalte der Balken. Marken nahe der Kante legen sich an sie,
   statt hinauszuragen, wie die Achse der Prognose. */
function tlAxis(marks){
  const lab=marks.map(mk=>{
    const off=mk.x<6?'2px':(mk.x>94?'calc(-100% - 2px)':'-50%');
    return `<span class="tzlab" style="left:${mk.x}%;transform:translateX(${off})">${gnum(mk.v)}</span>`;
  }).join('');
  return `<span class="trow taxis" aria-hidden="true"><span class="ttrack">${lab}</span></span>`;
}

/* ── Ein gewählter Abschnitt: Balken je Geldart ───────────────
   Sobald nach einer Fälligkeit gefiltert wird — eine Zeile des
   Zeitstrahls oder die Knöpfe darunter, beides ui.dueFilter —,
   gibt es keinen Wasserfall mehr: eine einzelne Stufe ohne ihre
   Treppe sagte nichts. Die fünf Zeilen bleiben stehen — die
   Aufteilung des Monats soll man weiter sehen, und ein Klick auf
   eine andere Zeile wechselt den Abschnitt. Jede Zeile zeigt je
   Geldart einen Balken, linksbündig auf dem Grund der Zeile: die
   gewählte kräftig und mit ihrer Summe (der Veränderung der
   gezeigten Zeilen), die übrigen **blass** (.pale) und ohne Zahl —
   sie sind Umgebung, keine Auswahl. **Gerechnet werden sie über
   `selAny`**: dieselben Filter wie die gewählte Zeile, nur ohne
   den Fälligkeitsfilter, der ja gerade den Abschnitt wählt. Wer
   nach „Strom" sucht, sieht in jeder Zeile den Strom — und nicht
   in einer den Strom und daneben den ganzen Monat. Die
   Monatseröffnung hat keine Geldarten und behält nur Raster und
   Namen.

   Gewählt sagen die Trennlinien: über und unter der gewählten
   Zeile liegen sie in der Hervorhebungsfarbe (.tline.part in
   css/layout.css) — kein Rahmen nach innen, kein gefärbter Name.

   **Ohne gewählten Abschnitt** — wenn nur Suchbegriff oder
   Zahlungsstand filtern — ist keine Zeile Auswahl und keine
   Umgebung: dann trägt **jede** ihre eigene Summe, alle Balken
   sind kräftig, und eingefasst ist nichts. Auch dieser Fall
   gehört hierher und nicht zum Wasserfall: dessen Kontostand
   entsteht aus allem, was der Monat bewegt — mit weggefilterten
   Zeilen ist er kein Kontostand mehr, sondern eine Summe von
   Resten. Ein Klick auf eine Zeile wählt von hier aus ihren
   Abschnitt dazu.

   Kein Rot und kein Grün der Fläche: ohne die Achse des
   Kontostands gibt es kein Plus und kein Minus — das Vorzeichen
   steht im Betrag, die Länge ist sein Maß. Das Raster läuft über
   **alle** Zeilen und beginnt an der Trennlinie zur Zahlenseite;
   der längste Balken des Monats bestimmt die Schrittweite
   (tlStep), und über jeder Linie steht ihr Betrag (tlAxis). Die
   Linien tragen Farbe und Stärke des Wasserfalls — es ist
   dieselbe Grafik, nur anders gefüllt. Jede
   Zeile ist mindestens zwei Balken hoch (--nbars), damit die
   Fläche beim Wechseln des Abschnitts nicht springt — mehr Balken
   machen sie höher.

   Ein zweiter Klick auf die gewählte Zeile nimmt den Abschnitt
   zurück; ist danach gar kein Filter mehr gesetzt, gilt wieder
   der Wasserfall. */
function partLine(m,sel,selAny){
  const key=ui.dueFilter, one=key!=='alle';
  const flow=monthFlow(m,sel);
  /* Die Umgebungszeilen kommen ohne den Fälligkeitsfilter; ohne
     gewählten Abschnitt gibt es keine Umgebung — dann ist es
     dieselbe Rechnung. */
  const full=one?monthFlow(m,selAny):flow;
  const last=daysInMonth(m), today=tlToday(m);
  /* Je Geldart ihr Ergebnis in einem Abschnitt: Zufuhr minus
     Abzug — für die gewählte Zeile dieselben Zahlen wie in den
     Karten darunter. */
  const valsOf=f=>FLOW_KINDS.map(k=>({k,v:(f.up[k]||0)-(f.down[k]||0)})).filter(x=>x.v);
  const ctx={};
  full.forEach(f=>{ if(f.key!=='P') ctx[f.key]=valsOf(f); });
  if(one) ctx[key]=valsOf(flow.find(x=>x.key===key));
  /* ── Die Achse: die Null trennt, beide Seiten enden am Wert ──
     Was hereinkommt, wächst nach rechts, was abgeht, nach links —
     dieselbe Leserichtung wie im Wasserfall, nur ohne Kontostand.
     Eine Zeile mit Einnahme und Kosten zeigt damit auf einen Blick,
     was von beidem überwiegt; linksbündig standen beide gleich
     herum und man musste die Farben lesen.

     **Jede Seite reicht nur so weit, wie es dort Werte gibt** —
     bis zur Rasterlinie hinter dem größten Betrag ihrer Richtung.
     Eine Fläche, die links bis −5.000 aufmacht, weil rechts 5.000
     stehen, verschenkt die halbe Breite an nichts; die Null steht
     dann eben nicht in der Mitte, sondern dort, wo die Werte sie
     hinsetzen. Neu gerechnet wird das bei jeder Änderung, denn es
     hängt allein an den Zahlen, die gerade zu sehen sind.

     **Der Maßstab bleibt für beide Seiten derselbe** (eine
     Schrittweite, ein Feldmaß): zwei Maßstäbe machten aus einem
     doppelt so langen Balken einen beliebigen Betrag.

     Gerechnet wird über alle Zeilen zusammen — die gewählte
     Auswahl zählt mit, ein Standfilter kann ihren Balken über den
     vollen Abschnitt hinausheben (nur die Zufuhr weggefiltert, der
     Abzug bleibt). Die Schrittweite kommt aus der ganzen Spanne
     und wird gröber, solange beide Seiten zusammen mehr als zehn
     Felder ergäben (aufgerundet wird ja auf jeder Seite). */
  const vs=Object.values(ctx).flat().map(x=>x.v);
  const maxPos=Math.max(0,...vs.filter(v=>v>0));
  const maxNeg=Math.max(0,...vs.filter(v=>v<0).map(v=>-v));
  let step=tlStep(Math.max(1,maxNeg+maxPos));
  while(Math.ceil(maxNeg/step)+Math.ceil(maxPos/step)>10) step=tlStep(step*10+1);
  const cellsL=Math.ceil(maxNeg/step);
  /* Ohne einen einzigen Betrag bliebe die Fläche breitenlos. */
  const cellsR=Math.ceil(maxPos/step)||(cellsL?0:1);
  const span=(cellsL+cellsR)*step;
  /* Von der Achse in die Fläche; `z` ist die Null in Prozent. */
  const pos=v=>(v+cellsL*step)/span*100;
  const z=pos(0);
  let grid='';
  for(let k=1-cellsL;k<cellsR;k++){
    /* Die Null hat ihre eigene, kräftigere Linie; die beiden
       äußeren sind die Ränder der Fläche und stehen schon da. */
    if(!k) continue;
    grid+=`<span class="tgrid" style="left:${pos(k*step)}%"></span>`;
  }
  grid+=`<span class="tzero" style="left:${z}%"></span>`;
  const marks=[];
  for(let k=-cellsL;k<=cellsR;k++) marks.push({v:k*step,x:pos(k*step)});
  const track=(list,pale)=>`<span class="ttrack tflat" style="--nbars:${Math.max(2,list.length)}">${grid}${
    list.map((x,i)=>{
      /* Angesetzt wird immer **an** der Null: der Zufluss mit
         seiner linken Kante, der Abfluss mit seiner rechten. Über
         eine gerechnete linke Kante liefe der Abfluss sonst bei
         einem winzigen Betrag in die falsche Richtung — die
         Mindestbreite (2 px, damit er überhaupt zu sehen ist)
         wüchse nach rechts und legte ihn auf die Plusseite. */
      const w=Math.abs(x.v)/span*100;
      return `<span class="fbar b-${x.k}${pale?' pale':''}"
        style="top:calc(var(--bpad) + ${i}*(var(--bh) + var(--bgap)));${
          x.v>0?`left:${z}`:`right:${100-z}`}%;width:${w}%"
        data-tip="${esc(eur(x.v))}"></span>`;
    }).join('')}</span>`;
  /* Eine Zeile ohne Bewegung bleibt leer — wie im Wasserfall. Vier
     Zeilen mit „—" untereinander lesen sich wie ein Fehler; dass
     dort nichts ist, sagt schon der fehlende Balken. */
  const sum=f=>f.sum?`<span class="trun ${cls(f.sum)}">${(f.sum>0?'+':'')+eur(f.sum)}</span>`:'';
  const rows=flow.map(x=>{
    if(x.key==='P') return `<span class="trow tp-P">${tlLabel('P',last,today)
      }<span class="ttrack tflat" style="--nbars:2">${grid}</span></span>`;
    /* Mit gewähltem Abschnitt trägt nur er seine Summe und volle
       Farbe; ohne einen ist keine Zeile ausgezeichnet, also
       bekommt jede beides. */
    const on=x.key===key;
    return `<button class="trow tp-${x.key}" data-tpart="${x.key}" aria-pressed="${on}"
      aria-label="${esc(tlName(x.key))}">${tlLabel(x.key,last,today)}${
        one&&!on?'':sum(x)}${track(ctx[x.key],one&&!on)}</button>`;
  }).join('');
  /* Die Farberklärung nennt alles, was in der Fläche vorkommt —
     auch die blassen Balken tragen ihre Geldartfarbe. */
  const kinds=FLOW_KINDS.filter(k=>Object.values(ctx).some(l=>l.some(x=>x.k===k)));
  const chips=kinds.map(k=>`<span class="lk"><i class="b-${k}"></i>${t(FLOW_LABEL[k])}</span>`).join('');
  return `<div class="tline part">${tlAxis(marks)}${rows}
    ${chips?`<div class="thint">${chips}</div>`:''}</div>`;
}

function timeline(m,sel,selAny){
  /* **Sobald irgendein Filter greift, gibt es keinen Wasserfall
     mehr.** Sein Maß ist der Kontostand, und der entsteht aus
     allem, was der Monat bewegt — mit weggefilterten Zeilen ist er
     kein Kontostand mehr, sondern eine Summe von Resten, die auf
     keinem Konto steht. Gezeigt wird dann, was man tatsächlich
     gefiltert hat: je Abschnitt seine Beträge als Balken
     (partLine). Das gilt für alle drei Filter der Leiste, nicht
     nur für den Fälligkeitsfilter. */
  if(!!queryQ()||ui.filter!=='alle'||ui.dueFilter!=='alle') return partLine(m,sel,selAny);
  const flow=monthFlow(m,sel), sc=flowScale(flow), last=daysInMonth(m);
  const today=tlToday(m);
  /* Von der Achse zur Fläche: 0 % ist der tiefste Stand des Monats
     (höchstens die Null), 100 % der höchste. */
  const pos=v=>(v-sc.lo)/sc.span*100;
  const zero=pos(0);
  /* Links der Null der rote, rechts der grüne Bereich. Liegt der
     Monat ganz im Plus, steht die Null am linken Rand — dann ist
     die ganze Fläche grün, und genau das soll man sehen. */
  /* Die Null nur, wenn sie im Bild liegt: bei beschnittener Achse
     steht sie weit außerhalb, dann ist die ganze Fläche eine Zone. */
  const zc=Math.max(0,Math.min(100,zero));
  /* Das Raster der Fläche: Linien in festem Betragsabstand, in
     jeder Zeile an derselben Stelle (sie hängen an den Zonen und
     stehen damit in jeder Zeile). Die Null behält ihre kräftigere
     Linie und bekommt keine zweite; über jeder Linie steht ihr
     Betrag (tlAxis), die Null eingeschlossen. */
  const step=tlStep(sc.span);
  const marks=[]; let gridw='';
  for(let v=Math.ceil(sc.lo/step)*step; v<=sc.hi; v+=step){
    marks.push({v,x:pos(v)});
    if(sc.cut||Math.abs(v)>=step/2) gridw+=`<span class="tgrid" style="left:${pos(v)}%"></span>`;
  }
  const zones=`<span class="tzone z-neg" style="width:${zc}%"></span
    ><span class="tzone z-pos" style="left:${zc}%;width:${100-zc}%"></span
    >${sc.cut?'':`<span class="tzero" style="left:${zc}%"></span>`}${gridw}`;

  const row=f=>{
    const name=tlLabel(f.key,last,today);
    const nums=`<span class="tflow ${cls(f.sum)}">${f.key==='P'||!f.sum?'':(f.sum>0?'+':'')+eur(f.sum)}</span
      ><span class="trun ${cls(f.run)}">${eur(f.run)}</span>`;
    /* Keine Sprechblase an der Zeile: sie zeigte beim Überfahren
       der halben Leiste etwas an. Was ein Anteil ist, sagt seine
       eigene Blase, und was ein Klick tut, der graue Satz darüber. */
    const track=flowTrack(f,pos,zero,zones,sc.cut);
    if(f.key==='P') return `<span class="trow tp-P">${name}${nums}${track}</span>`;
    return `<button class="trow tp-${f.key}" data-tpart="${f.key}"
      aria-pressed="${ui.dueFilter===f.key}"
      aria-label="${esc(tlName(f.key))}">${name}${nums}${track}</button>`;
  };
  /* Unter den Zeilen die Farberklärung. Sie muss sein, seit an
     einem Anteil nur noch sein Betrag steht: die Farbe ist dann
     das Einzige, was die Geldart nennt. Die ganze Zeile trägt die
     Erklärung des Balkens als Sprechblase. */
  const chips=FLOW_KINDS.map(k=>`<span class="lk"><i class="b-${k}"></i>${t(FLOW_LABEL[k])}</span>`).join('')
    +`<span class="lk"><i class="lmark"></i>${t('month.tlMark')}</span>`;
  /* Bei beschnittener Achse gehört ihr Maßstab dazu — sonst läse
     man die Länge des ersten Balkens als seinen ganzen Betrag. */
  const scale=sc.cut?`<span class="lscale">${t('month.tlScale',eur(sc.lo),eur(sc.hi))}</span>`:'';
  return `<div class="tline${sc.cut?' cut':''}">${tlAxis(marks)}${flow.map(row).join('')}
    <div class="thint">${chips}${scale}</div></div>`;
}

/* Der Pfeil, der eine Karte zu- und aufklappt. Er steht ganz links
   in der Kopfzeile und ist so breit wie die Siegelspalte darunter
   (--markw) — dadurch steht er senkrecht über den Haken der
   Positionen. Er ist so groß wie ein Siegel; seine Farbe ist die
   des Bereichs, ein Wort braucht er nicht.

   **Solange gefiltert wird oder die Auswertung offen steht, gibt es
   ihn nicht.** Dann stehen alle Bereiche offen — der Filter zeigt,
   was er gefunden hat, und der Zeitstrahl will sich in der Liste
   wiederfinden lassen. Ein Pfeil, der dagegen anklappen wollte,
   hielte nicht, was er verspricht. Zurück bleibt ein leeres Feld
   derselben Breite, damit die Überschrift nicht springt. */
function foldBtn(key,on,hide){
  if(hide) return `<span class="foldpad" aria-hidden="true"></span>`;
  const lab=on?t('month.maxAreaTip'):t('month.minAreaTip');
  return `<button class="foldarrow" data-fold="${key}" aria-expanded="${!on}"
    aria-label="${esc(lab)}" title="${esc(lab)}">${on?'&#9654;':'&#9660;'}</button>`;
}
/* „(3 ausgeblendet)" neben der Überschrift. Von Hand zugeklappt
   sagt es nichts — dort ist ohnehin keine Zeile zu sehen. Beim
   Filtern ist nichts zugeklappt, dort steht es also immer. */
const hiddenNote=(all,use,folded)=>(!folded&&use<all)
  ?` <span class="note">${t('month.hidden',all-use)}</span>`:'';

function viewMonat(){
  const m=ui.month;

  /* ── Die Filter gelten für alle drei Bereiche ────────────────
     Suchfeld, Fälligkeit und Zahlungsstand stehen oben in der
     Leiste und filtern Einnahmen, Flexible Payments und
     regelmäßige Kosten zugleich. Sie gelten gleichzeitig — was
     übrig bleibt, erfüllt alle drei.

     Die Flexible Payments und die Saldokorrektur haben keinen
     Zahltag: sie gehören zum Monatsabschluss, also zu 'Z' (siehe
     dueGroup in js/format.js). Der Zahlungsstand einer
     Flexible-Payments-Kategorie ist kakDone(); die Saldokorrektur
     hat gar keinen — sie wird nicht abgehakt und bleibt vom
     Standfilter unberührt, wie sie auch kein Siegel trägt. */
  const q=queryQ();
  /* Der Haken „auch in den ausgeblendeten Positionen" (qAll() in
     js/state.js): mit ihm gewinnt der Suchbegriff gegen die
     übrigen Filter — und gegen den Monat selbst. Gesucht wird dann
     in **allen** Posten, auch in denen, die in diesem Monat keinen
     Betrag haben und deshalb gar nicht in seiner Liste stehen
     (dueIn in js/calc.js). Ohne Suchbegriff ändert er nichts. */
  const wide=!!q&&qAll();
  const dueOk=v=> ui.dueFilter==='alle'||dueGroup(v)===ui.dueFilter;
  const stateOk=it=> ui.filter==='alle'
    || (ui.filter==='offen'&&!paidAt(it,m))
    || (ui.filter==='unklar'&&estOf(it))
    || (ui.filter==='bezahlt'&&paidAt(it,m));
  const show=it=> (!q||hayItem(it,m).includes(q))&&(wide||(stateOk(it)&&dueOk(it.dueDay)));
  const showKak=k=>{
    const e=state.kak[k]; if(!e) return false;
    const done=kakDone(k,m);
    if(q&&!hayKak(k,m).includes(q)) return false;
    if(wide) return true;
    return (ui.filter==='alle'||(ui.filter==='offen'&&!done)
      ||(ui.filter==='unklar'&&!!e.estimated)||(ui.filter==='bezahlt'&&done))
      && dueOk('');
  };
  const balOn=(!q||hayItem(state.balance,m).includes(q))&&(wide||dueOk(''));

  /* ── Dieselbe Auswahl ohne den Fälligkeitsfilter ─────────────
     Der gefilterte Zeitstrahl lässt die nicht gewählten Abschnitte
     stehen und zeigt ihre Balken als Umgebung. Gerechnet werden
     müssen sie über **dieselben** übrigen Filter — Suchbegriff und
     Zahlungsstand —, nur eben ohne den Fälligkeitsfilter, der ja
     gerade entscheidet, welcher Abschnitt der gewählte ist.
     Sonst zeigte eine Suche nach „Strom" in der gewählten Zeile
     den Strom und daneben den ganzen Monat.
     Genommen wird nur, was auch in einer Karte stünde (dieselbe
     Gruppierung), damit beide Zahlen aus derselben Quelle kommen. */
  const showAny=it=> (!q||hayItem(it,m).includes(q))&&(wide||stateOk(it));
  const showKakAny=k=>{
    const e=state.kak[k]; if(!e) return false;
    const done=kakDone(k,m);
    if(q&&!hayKak(k,m).includes(q)) return false;
    if(wide) return true;
    return ui.filter==='alle'||(ui.filter==='offen'&&!done)
      ||(ui.filter==='unklar'&&!!e.estimated)||(ui.filter==='bezahlt'&&done);
  };
  const balAny=!q||hayItem(state.balance,m).includes(q);

  /* Womit die Liste anfängt: gewöhnlich die Posten dieses Monats,
     bei weiter Suche alle. */
  const pool=wide?state.fixed:dueIn(m);
  const incAll=pool.filter(isIncome), incUse=incAll.filter(show);
  /* Einnahmen werden nach Kategorie gebündelt wie die Kosten —
     seit es mehr als eine geben kann, wäre eine flache Liste die
     einzige Stelle, an der man die Kategorie nicht sähe. Bei genau
     einer Kategorie entfällt die Zwischenzeile: sie stünde dann
     über allem und sagte nichts. */
  const incGroups=incomeGroups().map(g=>{
    const all=incAll.filter(it=>it.group===g);
    return {g,all,items:settledLast(all.filter(show)),any:all.filter(showAny)};
  });
  const flexAll=kakCats(), flexUse=flexAll.filter(showKak);
  const outGroups=costGroups().map(g=>{
    const all=pool.filter(it=>it.group===g);
    return {g,all,items:settledLast(all.filter(show)),any:all.filter(showAny)};
  });
  /* Die gezeigten Kosten in einer flachen Liste — daraus kommen
     die Zahl neben der Überschrift, die Kartensumme und der
     Kostenanteil der Auswertung. */
  const outItems=outGroups.reduce((a,x)=>a.concat(x.items),[]);
  const outAll=outGroups.reduce((n,x)=>n+x.all.length,0);
  const outUse=outItems.length;

  /* ── Alles rechnet über das, was zu sehen ist ────────────────
     Jede Zahl dieser Ansicht — die vier Kennzahlen der
     Auswertung, der Zeitstrahl, die drei Kartensummen und die
     Zeile jeder Kategorie — rechnet über die **übrig
     gebliebenen** Zeilen, nicht über den Zustand. Eine Karte, die
     drei von zwanzig Posten zeigt und darüber die Summe aller
     zwanzig nennt, beantwortet eine Frage, die niemand gestellt
     hat: wer filtert, will wissen, was das Gefundene zusammen
     ausmacht. Ohne Filter ist beides dasselbe — dann bleibt jede
     Zahl, wie sie war.

     `sel` ist diese Auswahl in einem Stück, wie monthFlow() sie
     erwartet (js/calc.js). Sie entsteht aus **denselben** Listen,
     aus denen die Zeilen gebaut werden — Auswertung und Karten
     können deshalb nicht auseinanderlaufen.

     Was `sel` **nicht** anfasst: `carryIn(m)` in der ersten Zeile
     des Zeitstrahls. Das ist der Stand, den der Monat vorfindet,
     und den machen die Monate davor — die filtert niemand. */
  const sumIt=arr=>arr.reduce((s,it)=>s+it.amounts[m-1],0);
  const sel={items:incUse.concat(outItems),kaks:flexUse,bal:balOn};
  /* Dieselbe Auswahl ohne den Fälligkeitsfilter — nur der
     gefilterte Zeitstrahl braucht sie, für die Balken der nicht
     gewählten Abschnitte (siehe showAny oben). */
  const selAny={items:incGroups.concat(outGroups).reduce((a,x)=>a.concat(x.any),[]),
    kaks:flexAll.filter(showKakAny),bal:balAny};
  const incSum=sumIt(incUse);
  const flexSum=flexUse.reduce((s,k)=>s+kakVal(k,m),0);
  const outSum=sumIt(outItems);

  /* ── Wann ein Bereich zugeklappt ist ─────────────────────────
     Gewöhnlich sagt es die Datei (state.folded). Zwei Dinge klappen
     alles auf und lassen sich dabei nicht überstimmen, ohne die
     Datei anzurühren:

       • **Ein Filter** zeigt, was er gefunden hat — in allen drei
         Bereichen. Wer sucht, will nicht daran denken müssen, dass
         der Treffer in einer zugeklappten Karte steckt.
       • **Die offene Auswertung**: der Zeitstrahl daneben soll sich
         in der Liste wiederfinden lassen.

     Solange eins von beidem gilt, gibt es auch keinen Pfeil
     (foldBtn) und keinen Doppelklick — geklappt wird erst wieder,
     wenn der Filter zurückgenommen ist. Dann gilt wieder, was in
     der Datei steht. */
  const filterOn=!!q||ui.filter!=='alle'||ui.dueFilter!=='alle';
  /* Auf dem Telefon zählt ui.ana nicht: die Auswertung gibt es
     dort nicht (mobileTop statt anaBar), und ein am Schreibtisch
     aufgeklappter Zustand fröre sonst nach dem Verkleinern die
     Karten offen — ohne Pfeil, ohne sichtbaren Grund und ohne
     Weg zurück. */
  const mob=isMobile();
  const openAll=(!mob&&ui.ana)||filterOn;
  const foldOf=k=>openAll?false:isFolded(k);
  const fIn=foldOf('in'), fFlex=foldOf('flex'), fOut=foldOf('out');

  /* Dieselbe Zeile wie im Kostenblock: Summe, Name, Zahl der
     ausgeblendeten. Gebaut mit derselben Funktion, damit beide
     Bereiche nicht auseinanderlaufen. Summiert werden die
     **gezeigten** Posten; wie viele fehlen, steht daneben. */
  const groupHead=(g,all,items)=>`<tr class="group"><td></td><td class="num amt">${eur(sumIt(items))}</td><td></td>
      <td>${esc(keyLabel(g))}${items.length!==all.length?` <span class="note">${t('month.hidden',all.length-items.length)}</span>`:''}</td></tr>`;
  let incRows='';
  if(!fIn){
    const many=incGroups.filter(x=>x.all.length).length>1;
    incGroups.forEach(({g,all,items})=>{
      if(!items.length) return;
      if(many) incRows+=groupHead(g,all,items);
      items.forEach(it=>{incRows+=itemRow(it,m);});
    });
  }
  const flexRows=fFlex?'':flexUse.map(k=>kakRow(k,m)).join('');

  let outRows='';
  outGroups.forEach(({g,all,items})=>{
    if(!items.length||fOut) return;
    outRows+=groupHead(g,all,items);
    items.forEach(it=>{outRows+=itemRow(it,m);});
  });
  /* Nichts übrig: liegt es am Filter oder ist der Bereich leer?
     Beides sagt einen anderen Satz. */
  const noRows=(all,key)=>`<tr><td class="note">${all?t('month.noItems'):t(key)}</td></tr>`;

  /* Die Auswertung bleibt beim Scrollen stehen — wie die
     Monatsreiter in der Kopfzeile darüber. Die Karten darunter
     werden lang, und die Frage „wie viel bleibt mir" soll man
     nicht durch Hochscrollen beantworten müssen. Eingeklappt ist
     sie eine Zeile; aufgeklappt kommt der Zeitstrahl dazu (anaBar
     weiter oben).

     Ganz unten steht die Zeichenerklärung (.legendbar). Sie
     gehört nicht in die Karte der regelmäßigen Kosten: dieselben
     Siegel stehen auch bei den Einnahmen und den Flexible
     Payments. Deshalb ein eigener grauer Kasten unter allen
     Karten. Bezahlt und Noch offen stehen nicht mehr darunter —
     beides sagt schon die Auswertung. */
  /* ── Der Kopf einer Karte, in beiden Fassungen ───────────────
     Am Schreibtisch stehen Knöpfe und Summe rechts nebeneinander.
     Auf dem Telefon trägt die erste Zeile nur Bezeichnung und
     Summe — die Bezeichnung wird bei Überlänge mit … beschnitten,
     die Summe bleibt auf ihrer Höhe —, und die Anlege-Knöpfe
     stehen darunter (gestaltet als .secbtns in css/mobile.css). */
  const secHead=(fk,folded,titleHtml,btnsHtml,totHtml)=>
    `<div class="sechead"${openAll?'':` data-dblfold="${fk}"`}>${foldBtn(fk,folded,openAll)}<h2 style="margin:0">${titleHtml}</h2>
      ${mob?`${totHtml}<div class="secbtns">${btnsHtml}</div>`
        :`<span style="display:flex;gap:12px;align-items:center">${btnsHtml}${totHtml}</span>`}</div>`;
  /* Der Block wird vorgewählt: aus dem Einnahmenbereich heraus
     legt man eine Einnahme an. Welcher es ist, sagt die Liste —
     'EINNAHMEN' steht nicht mehr fest im Code. Gibt es noch keine
     Einnahme-Kategorie (frisch angefangenes Buch), bleibt die
     Vorauswahl leer ("1"): das Fenster fragt dann nach dem Block
     und sagt, wo Kategorien entstehen. Ein untergeschobener Name
     wäre eine Kategorie, die es nicht gibt. */
  const incBtns=`<button class="btn small" data-newitem="${esc(incomeGroups()[0]||'1')}">${t('year.addIncome')}</button>`;
  /* Der Sprung in die Auswertung nur, wenn es sie gibt: den Reiter
     „Fast Budget Details" bringt erst der Import mit (hasImport in
     js/calc.js). */
  const flexBtns=`<button class="btn small" data-newkak="1">${t('year.addKak')}</button>
        ${hasImport()?`<button class="btn small" data-kview="${m}" title="${t('month.openEvalTip',MONTHS_LONG[m-1])}">${t('month.openEval')}</button>`:''}`;
  const outBtns=`<button class="btn small" data-newitem="1">${t('year.addItem')}</button>`;

  return `
  ${mob?mobileTop(m,sel,{inc:incSum,flex:flexSum,out:outSum}):anaBar(m,sel,selAny)}

  ${balOn?balanceRow(m):''}

  <div class="card sec-in${fIn?' folded':''}">
    ${secHead('in',fIn,
      `${t('month.income',MONTHS_LONG[m-1])}${hiddenNote(incAll.length,incUse.length,fIn)}`,
      incBtns,`<span class="tot pos">${eur(incSum)}</span>`)}
    ${fIn?'':`<table class="ledger">${incRows||noRows(incAll.length,'month.noIncome')}</table>`}
  </div>

  <div class="card sec-flex${fFlex?' folded':''}">
    ${secHead('flex',fFlex,
      `${t('month.kak',MONTHS_LONG[m-1])}<span class="pill">${esc(state.flexSource[m]||t('month.kpiPlanned'))}</span>${hiddenNote(flexAll.length,flexUse.length,fFlex)}`,
      flexBtns,`<span class="tot neg">${eur(flexSum)}</span>`)}
    ${fFlex?'':`<table class="ledger">${flexRows||noRows(flexAll.length,'month.noKak')}</table>`}
  </div>

  <div class="card sec-out${fOut?' folded':''}">
    ${secHead('out',fOut,
      `${t('month.fixed',MONTHS_LONG[m-1])}${hiddenNote(outAll,outUse,fOut)}`,
      outBtns,`<span class="tot neg">${eur(outSum)}</span>`)}
    ${fOut?'':`<table class="ledger">${outRows||noRows(outAll,'month.noItems')}</table>`}
  </div>

  <div class="legendbar">
    <span class="legtitle">${t('month.legTitle')}</span>
    <div class="legend">
      <span><i class="l-open"></i>${t('month.legOpen')}</span><span><i class="l-paid"></i>${t('month.legPaid')}</span>
      <span><i class="l-unc"></i>${t('month.legEst')}</span>
    </div>
  </div>`;
}
